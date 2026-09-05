//! Durable provider-session observation and intervention. Herdr is an
//! execution/visibility adapter; the ledger event stream remains truth.

use std::collections::BTreeMap;

use forged_ledger::{EffectClass, RevokeScope};
use forged_types::{OperationRequest, OperationResponse, WorkIdentitySubjectKind};
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

pub(crate) async fn run_events(
    ctx: &Ctx,
    run_id: &str,
) -> Result<Vec<forged_ledger::EventRow>, Failure> {
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

fn session_record(row: &forged_ledger::EventRow) -> Option<SessionRecord> {
    if row.kind != SESSION_STARTED {
        return None;
    }
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
}

fn session_records(events: &[forged_ledger::EventRow]) -> Vec<SessionRecord> {
    events.iter().filter_map(session_record).collect()
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
async fn pending_message_count(ctx: &Ctx, run_id: &str) -> Result<usize, Failure> {
    let events = run_events(ctx, run_id).await?;
    Ok(super::seat::pending_messages(&events).len())
}

fn param_attempt(params: &serde_json::Map<String, Value>) -> Result<i64, Failure> {
    params
        .get("attempt")
        .and_then(Value::as_i64)
        .filter(|value| *value > 0)
        .ok_or_else(|| Failure::invalid("missing required positive param \"attempt\""))
}

fn session_cursor(event_id: i64) -> String {
    format!("session:{event_id}")
}

fn parse_session_cursor(value: &str) -> Result<i64, Failure> {
    value
        .strip_prefix("session:")
        .and_then(|value| value.parse::<i64>().ok())
        .filter(|value| *value > 0)
        .ok_or_else(|| Failure::invalid("session list cursor is invalid"))
}

async fn session_json(
    ctx: &Ctx,
    identity: &forged_types::WorkIdentityV1,
    record: SessionRecord,
) -> Result<Value, Failure> {
    let attempt_id = record.attempt_id;
    let attempt = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
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
    Ok(json!({
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
        "identity": identity,
        "herdrProjection": projection,
        // The hint is durable, but terminal pane cleanup is an
        // independent supervisor effect. `Running` and `Revoking`
        // are the only states in which attachment remains useful;
        // every terminal state suppresses the hint even while cleanup
        // is pending or retrying.
        "attachHint": match attempt.state {
            forged_ledger::AttemptState::Running
            | forged_ledger::AttemptState::Revoking => record.attach_hint,
            _ => None,
        },
    }))
}

/// `session list` — durable session metadata plus current attempt state.
pub async fn session_list(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("session_list", req, || async {
        let direct_run = param_opt_str(&req.params, "run");
        let id = param_opt_str(&req.params, "id");
        let subject_kind = param_opt_str(&req.params, "subjectKind");
        if direct_run.is_some() && id.is_some() {
            return Err(Failure::invalid(
                "session list takes param \"run\" or param \"id\", never both",
            ));
        }
        if subject_kind.is_some() && id.is_none() {
            return Err(Failure::invalid(
                "session list param \"subjectKind\" requires param \"id\"",
            ));
        }
        let target = match (direct_run, id) {
            (Some(run), None) => super::observe::ExecutionTarget::Run(run.to_owned()),
            (None, Some(id)) => super::observe::execution_target(ctx, id, subject_kind).await?,
            _ => {
                return Err(Failure::invalid(
                    "session list requires param \"run\" or param \"id\"",
                ))
            }
        };
        let limit = req
            .params
            .get("limit")
            .map(|value| {
                value.as_u64().ok_or_else(|| {
                    Failure::invalid("session list limit must be an unsigned integer")
                })
            })
            .transpose()?
            .unwrap_or(100);
        if !(1..=500).contains(&limit) {
            return Err(Failure::invalid(
                "session list limit must be between 1 and 500",
            ));
        }
        let before = match req.params.get("cursor") {
            None => None,
            Some(Value::String(value)) => Some(parse_session_cursor(value)?),
            Some(_) => return Err(Failure::invalid("session list cursor is invalid")),
        };
        let run_id = match target {
            super::observe::ExecutionTarget::Run(run) => run,
            super::observe::ExecutionTarget::Unresolved(resolution) => {
                return Ok(json!({
                    "schema": "forged.session-list/1",
                    "resolution": resolution,
                }))
            }
            super::observe::ExecutionTarget::Epic(epic) => {
                let epic_id = epic.clone();
                let snapshot = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.work_observation_snapshot(WorkIdentitySubjectKind::Epic, &epic_id, 0, 1)
                })
                .await?;
                let child_ids = snapshot
                    .epic_children
                    .iter()
                    .map(|child| child.run_id.clone())
                    .collect::<Vec<_>>();
                let page = {
                    let child_ids = child_ids.clone();
                    let page_limit = u32::try_from(limit.saturating_add(1)).unwrap_or(501);
                    on_ledger(&ctx.ledger, move |ledger| {
                        ledger.list_subjects_events_by_kind_desc_with_counts(
                            child_ids,
                            SESSION_STARTED,
                            before,
                            page_limit,
                        )
                    })
                    .await?
                };
                let mut events = page.rows;
                let counts = page.counts;
                let has_more = events.len() > limit as usize;
                events.truncate(limit as usize);
                let next_cursor = has_more
                    .then(|| events.last().map(|row| session_cursor(row.event_id)))
                    .flatten();
                let identities = snapshot
                    .child_identities
                    .into_iter()
                    .map(|identity| (identity.subject.id.clone(), identity))
                    .collect::<BTreeMap<_, _>>();
                let mut sessions = Vec::new();
                let mut sessions_by_run = BTreeMap::<String, Vec<Value>>::new();
                for event in &events {
                    let Some(record) = session_record(event) else {
                        continue;
                    };
                    let run_id = event
                        .run_id
                        .as_deref()
                        .ok_or_else(|| Failure::internal("session-started event has no run id"))?;
                    let identity = identities.get(run_id).ok_or_else(|| {
                        Failure::internal(format!(
                            "epic session child {run_id:?} has no durable identity"
                        ))
                    })?;
                    let session = session_json(ctx, identity, record).await?;
                    sessions.push(session.clone());
                    sessions_by_run
                        .entry(run_id.to_owned())
                        .or_default()
                        .push(session);
                }
                let mut child_runs = Vec::new();
                for run_id in child_ids {
                    let identity = identities.get(&run_id).ok_or_else(|| {
                        Failure::internal(format!(
                            "epic session child {run_id:?} has no durable identity"
                        ))
                    })?;
                    let child_sessions = sessions_by_run.remove(&run_id).unwrap_or_default();
                    let shown = child_sessions.len();
                    let count =
                        counts
                            .get(&run_id)
                            .copied()
                            .unwrap_or(forged_ledger::SubjectEventCount {
                                total: 0,
                                eligible: 0,
                            });
                    let truncated = count.eligible > shown as u64;
                    let pending = pending_message_count(ctx, &run_id).await?;
                    let subject = super::work_identity::projection_subject(
                        identity,
                        forged_types::ProjectionSubjectKind::Run,
                        &run_id,
                    );
                    child_runs.push(forged_types::with_work_twins(json!({
                        "schema": "forged.session-list/1",
                        "subject": subject,
                        "runId": run_id,
                        "identity": identity,
                        "sessions": child_sessions,
                        "pendingInterventions": pending,
                        "coverage": {
                            "shown": shown,
                            "total": count.total,
                            "truncated": truncated,
                            "nextCursor": if truncated { next_cursor.clone() } else { None },
                        },
                    })));
                }
                let identity = snapshot.identity;
                let subject = super::work_identity::projection_subject(
                    &identity,
                    forged_types::ProjectionSubjectKind::Epic,
                    &epic,
                );
                let shown = sessions.len();
                let total = counts.values().map(|count| count.total).sum::<u64>();
                return Ok(forged_types::with_work_twins(json!({
                    "schema": "forged.session-list/1",
                    "subject": subject,
                    "epicId": epic,
                    "identity": identity,
                    "runs": child_runs,
                    "sessions": sessions,
                    "coverage": {
                        "shown": shown,
                        "total": total,
                        "truncated": has_more,
                        "nextCursor": next_cursor,
                    },
                })));
            }
        };
        let identity =
            super::work_identity::load(ctx, WorkIdentitySubjectKind::Run, &run_id).await?;
        let (mut events, total) = {
            let run_id = run_id.to_owned();
            let page_limit = u32::try_from(limit.saturating_add(1)).unwrap_or(501);
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.list_subject_events_by_kind_desc_with_count(
                    &run_id,
                    SESSION_STARTED,
                    before,
                    page_limit,
                )
            })
            .await?
        };
        let has_more = events.len() > limit as usize;
        events.truncate(limit as usize);
        let next_cursor = has_more
            .then(|| events.last().map(|row| session_cursor(row.event_id)))
            .flatten();
        let records = session_records(&events);
        let mut sessions = Vec::new();
        for record in records {
            sessions.push(session_json(ctx, &identity, record).await?);
        }
        let pending = pending_message_count(ctx, &run_id).await?;
        let shown = sessions.len();
        let subject = super::work_identity::projection_subject(
            &identity,
            forged_types::ProjectionSubjectKind::Run,
            &run_id,
        );
        Ok(forged_types::with_work_twins(json!({
            "schema": "forged.session-list/1",
            "subject": subject,
            "runId": run_id,
            "identity": identity,
            "sessions": sessions,
            "pendingInterventions": pending,
            "coverage": {
                "shown": shown,
                "total": total,
                "truncated": has_more,
                "nextCursor": next_cursor,
            },
        })))
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

fn message_key(
    run_id: &str,
    message: &str,
    kind: &str,
    reply_to: Option<&str>,
    target_attempt: Option<i64>,
    urgent: bool,
    ack_required: bool,
) -> String {
    let digest = if kind == "instruction"
        && reply_to.is_none()
        && target_attempt.is_none()
        && !urgent
        && !ack_required
    {
        // Preserve the v0.7 operation identity for the pre-existing call.
        Sha256::digest(message.as_bytes())
    } else {
        let to = target_attempt.map_or_else(
            || json!({"kind": "run", "id": run_id}),
            |attempt| json!({"kind": "attempt", "id": attempt}),
        );
        let key_material = json!({
            "body": message,
            "kind": kind,
            "replyTo": reply_to,
            "to": to,
            "importance": if urgent { "urgent" } else { "normal" },
            "ackRequired": ack_required,
        });
        Sha256::digest(forged_types::canonical_json_bytes(&key_material).unwrap_or_default())
    };
    let short = digest[..8]
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>();
    derive_key("session_message", Some(run_id), Some(&short), None)
}

/// `session message` — append one direct lead instruction. Hook-live
/// delivery remains a later capability; this operation always queues.
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
    let params = req.params.clone();
    let kind = param_opt_str(&params, "kind")
        .unwrap_or("instruction")
        .to_owned();
    if kind != "instruction" {
        return err_response(
            &derive_key("session_message", Some(&run_id), None, None),
            &Failure::invalid("session message kind must be instruction"),
        );
    }
    let reply_to = param_opt_str(&params, "replyTo").map(str::to_owned);
    let target_attempt = params.get("attempt").and_then(Value::as_i64);
    let urgent = params
        .get("urgent")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let ack_required = params
        .get("ackRequired")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    default_key(
        req,
        message_key(
            &run_id,
            &message,
            &kind,
            reply_to.as_deref(),
            target_attempt,
            urgent,
            ack_required,
        ),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
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
                    let message_id = operation_id.clone();
                    let queued_message = message.clone();
                    let queued_by = requested_by.clone();
                    let packet_id = attempt.as_ref().map(|attempt| attempt.packet_id.clone());
                    let to = target_attempt.map_or_else(
                        || json!({"kind": "run", "id": run_id}),
                        |attempt| json!({"kind": "attempt", "id": attempt}),
                    );
                    let kind = kind.clone();
                    let reply_to = reply_to.clone();
                    move |ledger| {
                        ledger.get_run(&run_id)?;
                        ledger.append_event_once(
                            &run_id,
                            super::seat::MESSAGE_QUEUED,
                            json!({
                                "schemaVersion": 1,
                                "messageId": message_id,
                                "from": {"kind": "lead", "id": queued_by},
                                "to": to,
                                "packetId": packet_id,
                                "kind": kind,
                                "importance": if urgent { "urgent" } else { "normal" },
                                "ackRequired": ack_required,
                                "inReplyTo": reply_to,
                                "body": queued_message,
                            }),
                        )?;
                        Ok(())
                    }
                })
                .await?;
                Ok(json!({"messageId": operation_id, "delivery": "queued"}))
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
/// work's work lease alone: the lease is held under the work-scoped
/// `run_holder` that every generation of the run shares, and a successor on
/// this packet claims under it immediately. The work-scoped release is a
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn message_key_fences_recipient_urgency_and_ack_with_legacy_plain_compatibility() {
        let run_id = "run-message-key";
        let body = "same instruction";
        let legacy = message_key(run_id, body, "instruction", None, None, false, false);
        let digest = Sha256::digest(body.as_bytes());
        let short = digest[..8]
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect::<String>();
        assert_eq!(
            legacy,
            derive_key("session_message", Some(run_id), Some(&short), None)
        );

        let attempt_7 = message_key(run_id, body, "instruction", None, Some(7), false, false);
        let attempt_8 = message_key(run_id, body, "instruction", None, Some(8), false, false);
        let urgent = message_key(run_id, body, "instruction", None, None, true, false);
        let ack_required = message_key(run_id, body, "instruction", None, None, false, true);

        assert_ne!(attempt_7, attempt_8, "attempt recipient is key material");
        assert_ne!(legacy, attempt_7, "run and attempt recipients differ");
        assert_ne!(legacy, urgent, "importance is key material");
        assert_ne!(legacy, ack_required, "ackRequired is key material");
        assert_ne!(urgent, ack_required, "escalation modes remain distinct");
    }
}
