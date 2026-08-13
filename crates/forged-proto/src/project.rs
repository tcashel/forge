//! Projection: assemble a [`RunView`] from the ledger's merged reads —
//! `get_run`, `list_packets`, `list_live_attempts`,
//! `list_inflight_operations`, `find_operation` per machine step,
//! `list_events` (paginated), and `get_attempt` for the completed ids the
//! events name. No new ledger API.
//!
//! The ledger exposes `list_live_attempts` but no "all attempts for a
//! packet" query, so terminal attempt history is reconstructed from
//! `attempt.state` events, with `get_attempt` fetching `result_json` for the
//! ids that reached `completed`.

use std::collections::{BTreeMap, HashMap};

use forged_ledger::{AttemptState, EventRow, Ledger, OperationRow, OperationState};
use forged_types::{
    EscalationTrigger, ExecutionPackageV1, ExecutionPolicyV1, HostPolicyV1, PacketResult,
    ProviderHints, ResolvedRosterV1, Stage,
};
use serde_json::Value;

use crate::engine::{
    machine_idempotency_key, ProfileEscalation, RunView, TerminalAttempt, MACHINE_STEPS,
};
use crate::error::ProtoError;
use crate::events::parse_proto_events;

/// The page size projection reads events with (`limit == 0` would return an
/// empty page, so the loop always asks for a full one).
const EVENT_PAGE: u32 = 256;

/// The spec ref a packet row pins, rebuilt from its columns.
///
/// `spec_revision` is present exactly when the packet is bead-sourced, and
/// is then the fence; a file-sourced packet keeps the content hash.
pub fn packet_spec(row: &forged_ledger::PacketRow) -> forged_types::SpecRef {
    forged_types::SpecRef {
        path: row.spec_path.clone(),
        sha256: row.spec_sha256.clone(),
        revision: row.spec_revision.clone(),
    }
}

/// The `WorkPacket` a row stores, rehydrated with the spec its columns pin.
///
/// `body_json` deliberately holds no spec — the columns are the one copy —
/// so this is the ONLY way to read a stored packet back.
pub fn stored_packet(
    row: &forged_ledger::PacketRow,
) -> Result<forged_types::WorkPacket, serde_json::Error> {
    forged_types::WorkPacket::from_stored_body(&row.body_json, packet_spec(row))
}

/// Read every event row for a run, in `event_id` order.
pub(crate) fn fetch_all_events(ledger: &Ledger, run_id: &str) -> Result<Vec<EventRow>, ProtoError> {
    let mut out: Vec<EventRow> = Vec::new();
    let mut after = 0i64;
    loop {
        let page = ledger.list_events(Some(run_id), after, EVENT_PAGE)?;
        let full = page.len() == EVENT_PAGE as usize;
        if let Some(last) = page.last() {
            after = last.event_id;
        }
        out.extend(page);
        if !full {
            return Ok(out);
        }
    }
}

/// Project one run into the engine's input. Definition-backed runs take
/// execution policy from their stored package; caller values are only the
/// compatibility defaults for legacy rows. Time remains an explicit input.
pub fn project_run(
    ledger: &Ledger,
    run_id: &str,
    roster: HashMap<Stage, ProviderHints>,
    gate_commands: Vec<String>,
    transport_retry_budget: u32,
    now: &str,
) -> Result<RunView, ProtoError> {
    project_run_with_policy(
        ledger,
        run_id,
        roster,
        ExecutionPolicyV1 {
            gate_commands,
            stage_budget_s: [
                Stage::Implement,
                Stage::ReviewClaude,
                Stage::ReviewCodex,
                Stage::Fix,
            ]
            .into_iter()
            .map(|stage| (stage, 1_800))
            .collect(),
            transport_retry_budget,
            host_policy: HostPolicyV1::Off,
            herdr_socket: None,
        },
        now,
    )
}

/// Project a run while supplying the legacy policy used only when the run
/// predates durable execution packages.
pub fn project_run_with_policy(
    ledger: &Ledger,
    run_id: &str,
    roster: HashMap<Stage, ProviderHints>,
    legacy_policy: ExecutionPolicyV1,
    now: &str,
) -> Result<RunView, ProtoError> {
    let run = ledger.get_run(run_id)?;
    let packets = ledger.list_packets(run_id)?;
    let live_attempts = ledger.list_live_attempts(Some(run_id))?;
    let inflight_operations = ledger.list_inflight_operations(Some(run_id))?;
    let settled_operations = settled_machine_operations(ledger, run_id)?;
    let events = fetch_all_events(ledger, run_id)?;
    let terminal_attempts = reconstruct_terminal_attempts(ledger, &events)?;
    let proto_events = parse_proto_events(&events)?;
    let profile_escalations = parse_profile_escalations(&events)?;
    let mut active_roster_revision = None;
    let execution_package = match ledger.get_run_definition(run_id)? {
        Some(definition) => {
            let mut package: ExecutionPackageV1 = serde_json::from_str(&definition.package_json)
                .map_err(|error| {
                    ProtoError::Projection(format!(
                        "stored execution package does not parse: {error}"
                    ))
                })?;
            if let Some(revision) = ledger.latest_roster_revision(run_id)? {
                let resolved: ResolvedRosterV1 = serde_json::from_str(&revision.roster_json)
                    .map_err(|error| {
                        ProtoError::Projection(format!(
                            "stored roster revision does not parse: {error}"
                        ))
                    })?;
                package.roster_ref = resolved.roster_ref.clone();
                package.roster_sha256 = revision.roster_sha256.clone();
                package.roster = resolved;
                active_roster_revision = Some(revision);
            }
            Some(package)
        }
        None => None,
    };
    let policy = execution_package
        .as_ref()
        .map(|package| package.policy.clone())
        .unwrap_or(legacy_policy);
    Ok(RunView {
        run,
        packets,
        terminal_attempts,
        live_attempts,
        inflight_operations,
        settled_operations,
        proto_events,
        roster,
        policy,
        now: now.to_owned(),
        execution_package,
        active_roster_revision,
        profile_escalations,
    })
}

fn parse_profile_escalations(events: &[EventRow]) -> Result<Vec<ProfileEscalation>, ProtoError> {
    let mut out = Vec::new();
    for event in events
        .iter()
        .filter(|event| event.kind == "forged.profile.escalated")
    {
        let value: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
            ProtoError::MalformedEvent {
                event_id: event.event_id,
                detail: format!("profile escalation payload is not JSON: {error}"),
            }
        })?;
        let required = |key: &str| {
            value
                .get(key)
                .and_then(Value::as_str)
                .map(str::to_owned)
                .ok_or_else(|| ProtoError::MalformedEvent {
                    event_id: event.event_id,
                    detail: format!("profile escalation has no {key}"),
                })
        };
        let trigger: EscalationTrigger =
            serde_json::from_value(value.get("trigger").cloned().ok_or_else(|| {
                ProtoError::MalformedEvent {
                    event_id: event.event_id,
                    detail: "profile escalation has no trigger".to_owned(),
                }
            })?)
            .map_err(|error| ProtoError::MalformedEvent {
                event_id: event.event_id,
                detail: format!("profile escalation trigger is invalid: {error}"),
            })?;
        out.push(ProfileEscalation {
            from: required("from")?,
            to: required("to")?,
            trigger,
        });
    }
    Ok(out)
}

/// The terminal operation row of every machine step that has one.
///
/// The machine-step key set is closed (`MACHINE_STEPS`), so this is a
/// bounded probe with `find_operation` rather than a new ledger query, and
/// it is the engine's only evidence that a step is settled: a step whose row
/// was released for redo, or whose `begin_operation` never ran, is simply
/// absent here and runs again.
///
/// AMENDED (operator-adjudicated 2026-08-12): these `find_operation` probes
/// are sanctioned additions to the spec's projection list, as is the
/// [`RunView::settled_operations`] field they fill — see the note there.
fn settled_machine_operations(
    ledger: &Ledger,
    run_id: &str,
) -> Result<Vec<OperationRow>, ProtoError> {
    let mut out = Vec::new();
    for (step, round) in MACHINE_STEPS {
        let key = machine_idempotency_key(run_id, step, round);
        if let Some(row) = ledger.find_operation(step.as_str(), &key)? {
            if row.state == OperationState::Terminal {
                out.push(row);
            }
        }
    }
    Ok(out)
}

/// Rebuild each packet's terminal attempt history, oldest first, from the
/// `attempt.state` events.
fn reconstruct_terminal_attempts(
    ledger: &Ledger,
    events: &[EventRow],
) -> Result<BTreeMap<String, Vec<TerminalAttempt>>, ProtoError> {
    let mut out: BTreeMap<String, Vec<TerminalAttempt>> = BTreeMap::new();
    for row in events {
        if row.kind != "attempt.state" {
            continue;
        }
        let payload: Value =
            serde_json::from_str(&row.payload_json).map_err(|err| ProtoError::MalformedEvent {
                event_id: row.event_id,
                detail: format!("attempt.state payload is not JSON: {err}"),
            })?;
        let new_state = payload.get("new").and_then(Value::as_str).ok_or_else(|| {
            ProtoError::MalformedEvent {
                event_id: row.event_id,
                detail: "attempt.state payload has no new state".to_owned(),
            }
        })?;
        let state = match new_state {
            "completed" => AttemptState::Completed,
            "failed" => AttemptState::Failed,
            "reclaimed" => AttemptState::Reclaimed,
            // Live transitions are not terminal history.
            _ => continue,
        };
        let attempt_id = payload
            .get("attemptId")
            .and_then(Value::as_i64)
            .ok_or_else(|| ProtoError::MalformedEvent {
                event_id: row.event_id,
                detail: "attempt.state payload has no attemptId".to_owned(),
            })?;
        let packet_id = payload
            .get("packetId")
            .and_then(Value::as_str)
            .ok_or_else(|| ProtoError::MalformedEvent {
                event_id: row.event_id,
                detail: "attempt.state payload has no packetId".to_owned(),
            })?
            .to_owned();
        let reason = payload
            .get("reason")
            .and_then(Value::as_str)
            .map(str::to_owned);
        let attempt = ledger.get_attempt(attempt_id)?;
        let outcome = if state == AttemptState::Completed {
            attempt
                .result_json
                .as_deref()
                .and_then(|json| serde_json::from_str::<PacketResult>(json).ok())
                .map(|result| result.outcome)
        } else {
            None
        };
        let fail_note = if state == AttemptState::Failed {
            // `fail_packet` emits the note verbatim as the event's reason.
            reason
        } else {
            None
        };
        out.entry(packet_id).or_default().push(TerminalAttempt {
            attempt_id,
            state,
            outcome,
            fail_note,
            started_at: attempt.started_at,
        });
    }
    Ok(out)
}
