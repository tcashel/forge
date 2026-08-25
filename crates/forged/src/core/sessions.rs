//! Durable provider-session observation and intervention. Herdr is an
//! execution/visibility adapter; the ledger event stream remains truth.

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{AttemptState, EffectClass, RevokeScope};
use forged_types::{
    Capability, OperationRequest, OperationResponse, WorkIdentitySubjectKind, WorkPacket,
};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::adapters::ports::{report_json, ForgedPorts};
use crate::config::now_iso;
use crate::core::{
    default_key, derive_key, err_response, fenced, on_ledger, param_opt_str, param_str, read_only,
    Ctx, Failure,
};

const SESSION_STARTED: &str = "forged.session.started";
const HOST_FALLBACK: &str = "forged.host.fallback";
const INTERVENTION_QUEUED: &str = "forged.intervention.queued";
const INTERVENTION_DELIVERED: &str = "forged.intervention.delivered";
const INTERVENTION_LIVE_FAILED: &str = "forged.intervention.live_failed";

/// One queued intervention not yet delivered live or at a packet boundary.
#[derive(Debug, Clone)]
pub(crate) struct PendingIntervention {
    pub id: String,
    pub message: String,
    pub requested_by: String,
}

#[derive(Debug, Clone)]
struct SessionRecord {
    attempt_id: i64,
    packet_id: String,
    host: String,
    session_id: String,
    socket_path: Option<String>,
    status_path: Option<String>,
    controller_generation: Option<u32>,
    layout_id: Option<String>,
    attach_hint: Option<String>,
}

pub(crate) struct SessionStarted<'a> {
    pub run_id: &'a str,
    pub packet_id: &'a str,
    pub attempt_id: i64,
    pub host: &'a str,
    pub session_id: &'a str,
    pub socket_path: Option<&'a str>,
    pub status_path: &'a str,
    pub controller_generation: Option<u32>,
    pub layout_id: Option<&'a str>,
    pub attach_hint: Option<&'a str>,
}

fn event_payload(row: &forged_ledger::EventRow) -> Option<Value> {
    serde_json::from_str(&row.payload_json).ok()
}

async fn run_events(ctx: &Ctx, run_id: &str) -> Result<Vec<forged_ledger::EventRow>, Failure> {
    let run_id = run_id.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_events(Some(&run_id), 0, 16_384)
    })
    .await
}

/// The attach hint one attempt's DURABLE record carries, whatever
/// `session_list` chooses to advertise — for the test that shows the stored
/// event survives while the listing stops repeating it.
#[cfg(test)]
pub(crate) async fn stored_attach_hint_for_test(
    ctx: &Ctx,
    run_id: &str,
    attempt_id: i64,
) -> Option<String> {
    let events = run_events(ctx, run_id).await.ok()?;
    session_records(&events)
        .into_iter()
        .find(|record| record.attempt_id == attempt_id)
        .and_then(|record| record.attach_hint)
}

fn session_records(events: &[forged_ledger::EventRow]) -> Vec<SessionRecord> {
    events
        .iter()
        .filter(|row| row.kind == SESSION_STARTED)
        .filter_map(|row| {
            let payload = event_payload(row)?;
            Some(SessionRecord {
                attempt_id: payload.get("attemptId")?.as_i64()?,
                packet_id: payload.get("packetId")?.as_str()?.to_owned(),
                host: payload.get("host")?.as_str()?.to_owned(),
                session_id: payload.get("sessionId")?.as_str()?.to_owned(),
                socket_path: payload
                    .get("socketPath")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                status_path: payload
                    .get("statusPath")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                controller_generation: payload
                    .get("controllerGeneration")
                    .and_then(Value::as_u64)
                    .and_then(|value| u32::try_from(value).ok()),
                layout_id: payload
                    .get("layoutId")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                attach_hint: payload
                    .get("attachHint")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
            })
        })
        .collect()
}

/// Persist a selected host/session handle after spawn. Pane ids remain useful
/// after the controller process exits.
pub(crate) async fn record_session_started(
    ctx: &Ctx,
    started: SessionStarted<'_>,
) -> Result<(), Failure> {
    let run_id = started.run_id.to_owned();
    let payload = json!({
        "schemaVersion": 2,
        "attemptId": started.attempt_id,
        "packetId": started.packet_id,
        "host": started.host,
        "sessionId": started.session_id,
        "socketPath": started.socket_path,
        "statusPath": started.status_path,
        "controllerGeneration": started.controller_generation,
        "layoutId": started.layout_id,
        "attachHint": started.attach_hint,
    });
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event_once(&run_id, SESSION_STARTED, payload)?;
        Ok(())
    })
    .await
}

/// Make a preferred-Herdr fallback visible before the plain process starts.
///
/// The CALLER settles this write's own failure rather than propagating it:
/// it runs post-claim and pre-spawn, so the attempt row is `running` with no
/// process behind it and a failure that escapes leaves it that way. Nothing
/// but a ledger outage refuses this write, which is why the `fail` failpoint
/// is the only way to rehearse that settlement.
pub(crate) async fn record_host_fallback(
    ctx: &Ctx,
    run_id: &str,
    packet_id: &str,
    attempt_id: i64,
    reason: &str,
) -> Result<(), Failure> {
    if let Some(detail) = crate::failpoint::injected("host.fallback.record") {
        return Err(Failure::internal(detail));
    }
    let run_id = run_id.to_owned();
    let payload = json!({
        "schemaVersion": 1,
        "attemptId": attempt_id,
        "packetId": packet_id,
        "requested": "herdr",
        "selected": "process",
        "reason": reason,
    });
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event_once(&run_id, HOST_FALLBACK, payload)?;
        Ok(())
    })
    .await
}

/// Pending interventions in ledger order.
pub(crate) async fn pending_interventions(
    ctx: &Ctx,
    run_id: &str,
) -> Result<Vec<PendingIntervention>, Failure> {
    let events = run_events(ctx, run_id).await?;
    let delivered: BTreeSet<String> = events
        .iter()
        .filter(|row| row.kind == INTERVENTION_DELIVERED)
        .filter_map(event_payload)
        .filter_map(|payload| payload.get("interventionId")?.as_str().map(str::to_owned))
        .collect();
    let mut queued = BTreeMap::new();
    for row in events.iter().filter(|row| row.kind == INTERVENTION_QUEUED) {
        let Some(payload) = event_payload(row) else {
            continue;
        };
        let (Some(id), Some(message), Some(requested_by)) = (
            payload.get("interventionId").and_then(Value::as_str),
            payload.get("message").and_then(Value::as_str),
            payload.get("requestedBy").and_then(Value::as_str),
        ) else {
            continue;
        };
        if !delivered.contains(id) {
            queued.entry(row.event_id).or_insert(PendingIntervention {
                id: id.to_owned(),
                message: message.to_owned(),
                requested_by: requested_by.to_owned(),
            });
        }
    }
    Ok(queued.into_values().collect())
}

/// Record successful delivery after the provider/pane accepted it.
pub(crate) async fn record_interventions_delivered(
    ctx: &Ctx,
    run_id: &str,
    packet_id: &str,
    attempt_id: i64,
    interventions: &[PendingIntervention],
    mode: &str,
) -> Result<(), Failure> {
    for intervention in interventions {
        let run_id = run_id.to_owned();
        let payload = json!({
            "schemaVersion": 1,
            "interventionId": intervention.id,
            "packetId": packet_id,
            "attemptId": attempt_id,
            "mode": mode,
        });
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.append_event_once(&run_id, INTERVENTION_DELIVERED, payload)?;
            Ok(())
        })
        .await?;
    }
    Ok(())
}

fn param_attempt(params: &serde_json::Map<String, Value>) -> Result<i64, Failure> {
    params
        .get("attempt")
        .and_then(Value::as_i64)
        .filter(|value| *value > 0)
        .ok_or_else(|| Failure::invalid("missing required positive param \"attempt\""))
}

/// `session list` — durable session metadata plus current attempt state.
pub async fn session_list(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("session_list", req, || async {
        let run_id = param_str(&req.params, "run")?;
        let identity =
            super::work_identity::load(ctx, WorkIdentitySubjectKind::Run, run_id).await?;
        let events = run_events(ctx, run_id).await?;
        let mut sessions = Vec::new();
        for record in session_records(&events) {
            let attempt_id = record.attempt_id;
            let attempt =
                on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
            let claim_token = attempt.claim_token.clone();
            let owned = on_ledger(&ctx.ledger, move |ledger| {
                ledger.find_owned_herdr_attempt(attempt_id, &claim_token)
            })
            .await?;
            let projection = match owned {
                Some(owned) => {
                    super::herdr_projection::status_for_ownership(ctx, &owned.ownership_id).await
                }
                None => Value::Null,
            };
            sessions.push(json!({
                "attemptId": attempt.attempt_id,
                "packetId": record.packet_id,
                "providerClaimant": attempt.claimant,
                "state": attempt.state.as_str(),
                "host": record.host,
                "sessionId": record.session_id,
                "socketPath": record.socket_path,
                "statusPath": record.status_path,
                "controllerGeneration": record.controller_generation,
                "layoutId": record.layout_id,
                "identity": identity.clone(),
                "herdrProjection": projection,
                // The hint is durable, but terminal pane cleanup is an
                // independent supervisor effect. `Running` and `Revoking`
                // are the only states in which attachment remains useful;
                // every terminal state suppresses the hint even while cleanup
                // is pending or retrying.
                "attachHint": match attempt.state {
                    forged_ledger::AttemptState::Running
                    | forged_ledger::AttemptState::Revoking => record.attach_hint.clone(),
                    _ => None,
                },
            }));
        }
        let pending = pending_interventions(ctx, run_id).await?;
        Ok(json!({
            "runId": run_id,
            "identity": identity,
            "sessions": sessions,
            "pendingInterventions": pending.len()
        }))
    })
    .await
}

/// `session read` — read a durable Herdr pane from a new controller process.
pub async fn session_read(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("session_read", req, || async {
        let attempt_id = param_attempt(&req.params)?;
        let lines = req
            .params
            .get("lines")
            .and_then(Value::as_u64)
            .unwrap_or(120);
        if lines == 0 || lines > 2_000 {
            return Err(Failure::invalid("lines must be between 1 and 2000"));
        }
        let attempt = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
        let (run_id, _, _) = crate::core::split_packet_key(&attempt.packet_id)?;
        let events = run_events(ctx, &run_id).await?;
        let record = session_records(&events)
            .into_iter()
            .rev()
            .find(|record| record.attempt_id == attempt_id)
            .ok_or_else(|| {
                Failure::invalid(format!("attempt {attempt_id} has no session metadata"))
            })?;
        if record.host != "herdr" {
            return Err(Failure::invalid(format!(
                "attempt {attempt_id} used {}, so it has no readable Herdr pane",
                record.host
            )));
        }
        let socket = record
            .socket_path
            .ok_or_else(|| Failure::internal("Herdr session metadata has no socket path"))?;
        let control = forged_host::HerdrControl::connect(&socket).await?;
        let snapshot = control
            .read_pane(&record.session_id, u32::try_from(lines).unwrap_or(2_000))
            .await?;
        Ok(json!({"attemptId": attempt_id, "snapshot": snapshot}))
    })
    .await
}

async fn interactive_capability(ctx: &Ctx, run_id: &str, attempt_id: i64) -> Result<bool, Failure> {
    let view = super::drive::project(ctx, run_id).await?;
    let attempt = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
    let packet: WorkPacket = super::drive::stored_packet_for_attempt(&view, &attempt.packet_id)?;
    let (Some(package), Some(execution)) = (&view.execution_package, &packet.execution) else {
        return Ok(false);
    };
    Ok(package
        .roster
        .roles
        .get(&execution.role_id)
        .into_iter()
        .flatten()
        .find(|candidate| {
            candidate.provider == packet.provider_hints.provider
                && candidate.model == packet.provider_hints.model
        })
        .is_some_and(|candidate| {
            candidate
                .capabilities
                .contains(&Capability::InteractiveMessaging)
        }))
}

fn message_key(run_id: &str, message: &str) -> String {
    let digest = Sha256::digest(message.as_bytes());
    let short = digest[..8]
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>();
    derive_key("session_message", Some(run_id), Some(&short), None)
}

/// `session message` — queue first, then deliver live only when both the
/// roster capability and durable Herdr session say that is honest.
pub async fn session_message(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let run_id = match param_str(&req.params, "run") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(&derive_key("session_message", None, None, None), &error)
        }
    };
    let message = match param_str(&req.params, "message") {
        Ok(value) if value.len() <= 16 * 1024 => value.to_owned(),
        Ok(_) => {
            return err_response(
                &derive_key("session_message", Some(&run_id), None, None),
                &Failure::invalid("message exceeds 16 KiB"),
            )
        }
        Err(error) => {
            return err_response(
                &derive_key("session_message", Some(&run_id), None, None),
                &error,
            )
        }
    };
    default_key(req, message_key(&run_id, &message));
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    let params = req.params.clone();
    let target_attempt = params.get("attempt").and_then(Value::as_i64);
    let requested_by = param_opt_str(&params, "requestedBy")
        .unwrap_or("operator")
        .to_owned();
    fenced(
        ctx,
        "session_message",
        EffectClass::HumanAmbiguous,
        req,
        None,
        {
            move |operation_id| async move {
                let attempt = match target_attempt {
                    Some(attempt_id) => {
                        let attempt =
                            on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id))
                                .await?;
                        let (attempt_run, _, _) =
                            crate::core::split_packet_key(&attempt.packet_id)?;
                        if attempt_run != run_id {
                            return Err(Failure::invalid(format!(
                                "attempt {attempt_id} does not belong to run {run_id}"
                            )));
                        }
                        Some(attempt)
                    }
                    None => None,
                };
                on_ledger(&ctx.ledger, {
                    let run_id = run_id.clone();
                    let intervention_id = operation_id.clone();
                    let queued_message = message.clone();
                    let queued_by = requested_by.clone();
                    move |ledger| {
                        ledger.get_run(&run_id)?;
                        ledger.append_event_once(
                            &run_id,
                            INTERVENTION_QUEUED,
                            json!({
                                "schemaVersion": 1,
                                "interventionId": intervention_id,
                                "message": queued_message,
                                "requestedBy": queued_by,
                                "targetAttemptId": target_attempt,
                            }),
                        )?;
                        Ok(())
                    }
                })
                .await?;

                let Some(attempt) = attempt else {
                    return Ok(json!({"interventionId": operation_id, "delivery": "queued"}));
                };
                let attempt_id = attempt.attempt_id;
                if attempt.state != AttemptState::Running
                    || !interactive_capability(ctx, &run_id, attempt_id).await?
                {
                    return Ok(json!({"interventionId": operation_id, "delivery": "queued"}));
                }
                let events = run_events(ctx, &run_id).await?;
                let record = session_records(&events)
                    .into_iter()
                    .rev()
                    .find(|record| record.attempt_id == attempt_id);
                let Some(record) = record.filter(|record| record.host == "herdr") else {
                    return Ok(json!({"interventionId": operation_id, "delivery": "queued"}));
                };
                let Some(socket) = record.socket_path else {
                    return Ok(json!({"interventionId": operation_id, "delivery": "queued"}));
                };
                let control = match forged_host::HerdrControl::connect(&socket).await {
                    Ok(control) => control,
                    Err(error) => {
                        let run = run_id.clone();
                        let detail = error.to_string();
                        let intervention_id = operation_id.clone();
                        on_ledger(&ctx.ledger, move |ledger| {
                            ledger.append_event_once(
                                &run,
                                INTERVENTION_LIVE_FAILED,
                                json!({
                                    "schemaVersion": 1,
                                    "interventionId": intervention_id,
                                    "attemptId": attempt_id,
                                    "reason": detail,
                                }),
                            )?;
                            Ok(())
                        })
                        .await?;
                        return Ok(json!({"interventionId": operation_id, "delivery": "queued"}));
                    }
                };
                if let Err(error) = control.send_message(&record.session_id, &message).await {
                    let run = run_id.clone();
                    let detail = error.to_string();
                    let intervention_id = operation_id.clone();
                    on_ledger(&ctx.ledger, move |ledger| {
                        ledger.append_event_once(
                            &run,
                            INTERVENTION_LIVE_FAILED,
                            json!({
                                "schemaVersion": 1,
                                "interventionId": intervention_id,
                                "attemptId": attempt_id,
                                "reason": detail,
                            }),
                        )?;
                        Ok(())
                    })
                    .await?;
                    return Ok(json!({"interventionId": operation_id, "delivery": "queued"}));
                }
                record_interventions_delivered(
                    ctx,
                    &run_id,
                    &attempt.packet_id,
                    attempt_id,
                    &[PendingIntervention {
                        id: operation_id.clone(),
                        message,
                        requested_by,
                    }],
                    "live",
                )
                .await?;
                Ok(json!({"interventionId": operation_id, "delivery": "live"}))
            }
        },
    )
    .await
}

/// `session stop` — durable revoke, confirmed death, terminal `stopped`,
/// then the existing reconciliation pass.
///
/// The REVOCATION is attempt-local, and nothing wider. The stop names one
/// attempt, so it takes one attempt to a terminal state and leaves the
/// bead's bd lease alone: the lease is held under the bead-scoped
/// `run_holder` that every generation of the run shares, and a successor on
/// this packet claims under it immediately. The bead-scoped release is a
/// different operation with a different fence, and is not this one. The
/// durable marker records that scope, so a stop whose kill cannot be
/// confirmed is resumed as a stop and never through the reclaim saga.
///
/// The reconcile pass afterwards is UNCHANGED and stays: the kill takes the
/// claimant's whole process group with it, so the operations that group had
/// in flight are interrupted and `settle_operations` is what settles them by
/// effect class. Dropping it left a successor refused with
/// `OperationInProgress` under the same derived key. Its `report` is
/// reported back verbatim, as it always has been.
pub async fn session_stop(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let attempt_id = match param_attempt(&req.params) {
        Ok(value) => value,
        Err(error) => return err_response(&derive_key("session_stop", None, None, None), &error),
    };
    let attempt = match on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await {
        Ok(value) => value,
        Err(error) => {
            return err_response(
                &derive_key("session_stop", None, None, Some(attempt_id)),
                &error,
            )
        }
    };
    let (run_id, _, _) = match crate::core::split_packet_key(&attempt.packet_id) {
        Ok(value) => value,
        Err(error) => {
            return err_response(
                &derive_key("session_stop", None, None, Some(attempt_id)),
                &error,
            )
        }
    };
    default_key(
        req,
        derive_key("session_stop", Some(&run_id), None, Some(attempt_id)),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    let params = req.params.clone();
    fenced(
        ctx,
        "session_stop",
        EffectClass::HumanAmbiguous,
        req,
        None,
        {
            move |_operation_id| async move {
                let reason = param_str(&params, "reason")?.to_owned();
                // Step 1: the durable marker commits BEFORE the kill, and
                // carries the scope that decides who may resume it.
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.revoke_attempt_scoped(attempt_id, &reason, RevokeScope::Attempt)
                })
                .await?;
                let ports = ForgedPorts::new(ctx.ledger.clone(), ctx.config.clone());
                let marker =
                    on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
                let view = crate::core::drive::project(ctx, &run_id).await?;
                let config = forged_proto::ReconcileConfig {
                    termination_grace_s: view.policy.termination_grace_s,
                    stage_budget_s: view.policy.stage_budget_s.into_iter().collect(),
                    gate_commands: view.policy.gate_commands,
                };
                let report = if marker.revoke_scope == Some(RevokeScope::Deadline) {
                    forged_proto::reconcile(&ctx.ledger, &run_id, &ports, &config, &now_iso())
                        .await?
                } else {
                    forged_proto::stop_attempt(
                        &ctx.ledger,
                        &ports,
                        attempt_id,
                        config.termination_grace_s,
                    )
                    .await?;
                    forged_proto::reconcile(&ctx.ledger, &run_id, &ports, &config, &now_iso())
                        .await?
                };
                let state = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id))
                    .await?
                    .state;
                Ok(json!({
                    "attemptId": attempt_id,
                    "runId": run_id,
                    "state": state.as_str(),
                    "report": report_json(&report),
                }))
            }
        },
    )
    .await
}
