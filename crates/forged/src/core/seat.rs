//! Attempt-fenced provider-seat mail and progress operations.
//!
//! The append-only run stream is both mailbox and archive. Every mutation
//! reaches it through the ledger's claim-token transaction fence; projections
//! only fold those events and never maintain a second store.

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{AttemptRow, AttemptState, EffectClass, EventRow};
use forged_types::{ErrorCode, OperationRequest, OperationResponse, RemedyV1};
use serde_json::{json, Map, Value};
use sha2::{Digest, Sha256};

use super::{default_key, fenced, on_ledger, remedy_response, Ctx, Failure};

pub(crate) const MESSAGE_QUEUED: &str = "forged.message.queued";
pub(crate) const MESSAGE_DELIVERED: &str = "forged.message.delivered";
pub(crate) const MESSAGE_READ: &str = "forged.message.read";
pub(crate) const MESSAGE_ACKED: &str = "forged.message.acked";
pub(crate) const SEAT_PROGRESS: &str = "forged.seat.progress";
pub(crate) const INTERVENTION_QUEUED: &str = "forged.intervention.queued";
pub(crate) const INTERVENTION_DELIVERED: &str = "forged.intervention.delivered";

pub(crate) const COORDINATION_EVENT_KINDS: [&str; 7] = [
    MESSAGE_QUEUED,
    MESSAGE_DELIVERED,
    MESSAGE_READ,
    MESSAGE_ACKED,
    SEAT_PROGRESS,
    INTERVENTION_QUEUED,
    INTERVENTION_DELIVERED,
];

const SEAT_BODY_LIMIT: usize = 4 * 1024;
const DEFAULT_INBOX_LIMIT: u64 = 100;
const MAX_INBOX_LIMIT: u64 = 500;

#[derive(Debug, Clone)]
pub(crate) struct MessageRecord {
    pub event_id: i64,
    pub queued_at: String,
    pub message_id: String,
    pub from: Value,
    pub to: Value,
    pub packet_id: Option<String>,
    pub kind: String,
    pub importance: String,
    pub ack_required: bool,
    pub in_reply_to: Option<String>,
    pub body: String,
    delivery_point: DeliveryPoint,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum DeliveryPoint {
    Poll,
    Boundary,
}

#[derive(Debug)]
struct SeatFence {
    attempt: AttemptRow,
    run_id: String,
    token: String,
}

fn value_id(value: &Value, kind: &str) -> Option<String> {
    let address = value.as_object()?;
    (address.get("kind").and_then(Value::as_str) == Some(kind))
        .then(|| address.get("id"))
        .flatten()
        .and_then(|id| match id {
            Value::String(id) => Some(id.clone()),
            Value::Number(id) => Some(id.to_string()),
            _ => None,
        })
}

fn payload(row: &EventRow) -> Option<Value> {
    serde_json::from_str(&row.payload_json).ok()
}

fn message_record(row: &EventRow) -> Option<MessageRecord> {
    let payload = payload(row)?;
    if row.kind == MESSAGE_QUEUED {
        let to = payload.get("to")?.clone();
        let delivery_point = if value_id(&to, "attempt").is_some() {
            DeliveryPoint::Poll
        } else {
            DeliveryPoint::Boundary
        };
        return Some(MessageRecord {
            event_id: row.event_id,
            queued_at: row.ts.clone(),
            message_id: payload.get("messageId")?.as_str()?.to_owned(),
            from: payload.get("from")?.clone(),
            to,
            packet_id: payload
                .get("packetId")
                .and_then(Value::as_str)
                .map(str::to_owned),
            kind: payload.get("kind")?.as_str()?.to_owned(),
            importance: payload
                .get("importance")
                .and_then(Value::as_str)
                .unwrap_or("normal")
                .to_owned(),
            ack_required: payload
                .get("ackRequired")
                .and_then(Value::as_bool)
                .unwrap_or(false),
            in_reply_to: payload
                .get("inReplyTo")
                .and_then(Value::as_str)
                .map(str::to_owned),
            body: payload.get("body")?.as_str()?.to_owned(),
            delivery_point,
        });
    }
    if row.kind != INTERVENTION_QUEUED {
        return None;
    }
    let message_id = payload.get("interventionId")?.as_str()?.to_owned();
    let requested_by = payload
        .get("requestedBy")
        .and_then(Value::as_str)
        .unwrap_or("operator");
    let to = payload
        .get("targetAttemptId")
        .and_then(Value::as_i64)
        .map_or_else(
            || json!({"kind": "run", "id": row.run_id}),
            |attempt| json!({"kind": "attempt", "id": attempt}),
        );
    Some(MessageRecord {
        event_id: row.event_id,
        queued_at: row.ts.clone(),
        message_id,
        from: json!({"kind": "lead", "id": requested_by}),
        to,
        packet_id: None,
        kind: "instruction".to_owned(),
        importance: "normal".to_owned(),
        ack_required: false,
        in_reply_to: None,
        body: payload.get("message")?.as_str()?.to_owned(),
        // Legacy interventions were injected at provider boundaries. Keep
        // that delivery contract when projecting their stored bytes.
        delivery_point: DeliveryPoint::Boundary,
    })
}

pub(crate) fn message_attempt(message: &MessageRecord) -> Option<i64> {
    value_id(&message.to, "attempt")?.parse().ok()
}

pub(crate) fn message_run(message: &MessageRecord) -> Option<String> {
    value_id(&message.to, "run")
}

pub(crate) fn messages(events: &[EventRow]) -> Vec<MessageRecord> {
    let mut messages = events.iter().filter_map(message_record).collect::<Vec<_>>();
    messages.sort_by_key(|message| message.event_id);
    messages
}

pub(crate) fn pending_messages(events: &[EventRow]) -> Vec<MessageRecord> {
    let delivered = delivered(events);
    messages(events)
        .into_iter()
        .filter(|message| {
            !delivered.contains(&message.message_id)
                && (message_attempt(message).is_some() || message_run(message).is_some())
        })
        .collect()
}

fn delivered(events: &[EventRow]) -> BTreeSet<String> {
    events
        .iter()
        .filter_map(|row| {
            let payload = payload(row)?;
            match row.kind.as_str() {
                MESSAGE_DELIVERED => payload.get("messageId")?.as_str().map(str::to_owned),
                INTERVENTION_DELIVERED => {
                    payload.get("interventionId")?.as_str().map(str::to_owned)
                }
                _ => None,
            }
        })
        .collect()
}

fn read(events: &[EventRow]) -> BTreeSet<String> {
    events
        .iter()
        .filter(|row| row.kind == MESSAGE_READ)
        .filter_map(payload)
        .filter_map(|payload| payload.get("messageId")?.as_str().map(str::to_owned))
        .collect()
}

fn acked(events: &[EventRow]) -> BTreeSet<String> {
    events
        .iter()
        .filter(|row| row.kind == MESSAGE_ACKED)
        .filter_map(payload)
        .filter_map(|payload| payload.get("messageId")?.as_str().map(str::to_owned))
        .collect()
}

fn targets_attempt(message: &MessageRecord, run_id: &str, attempt_id: i64) -> bool {
    let attempt_id = attempt_id.to_string();
    value_id(&message.to, "run").as_deref() == Some(run_id)
        || value_id(&message.to, "attempt").as_deref() == Some(attempt_id.as_str())
}

pub(crate) fn pending_for_boundary(
    events: &[EventRow],
    run_id: &str,
    attempt_id: i64,
) -> Vec<MessageRecord> {
    let delivered = delivered(events);
    messages(events)
        .into_iter()
        .filter(|message| {
            !delivered.contains(&message.message_id)
                && message.delivery_point == DeliveryPoint::Boundary
                && targets_attempt(message, run_id, attempt_id)
        })
        .collect()
}

fn poll_for_attempt(events: &[EventRow], attempt_id: i64, bodies: bool) -> Vec<MessageRecord> {
    let seen = if bodies {
        read(events)
    } else {
        delivered(events)
    };
    messages(events)
        .into_iter()
        .filter(|message| {
            message.delivery_point == DeliveryPoint::Poll
                && message_attempt(message) == Some(attempt_id)
                && !seen.contains(&message.message_id)
        })
        .collect()
}

pub(crate) fn latest_progress(events: &[EventRow], attempt_id: Option<i64>) -> Option<Value> {
    events
        .iter()
        .rev()
        .filter(|row| row.kind == SEAT_PROGRESS)
        .filter_map(payload)
        .find(|payload| {
            attempt_id.is_none_or(|attempt_id| {
                payload.get("attemptId").and_then(Value::as_i64) == Some(attempt_id)
            })
        })
        .map(|mut payload| {
            if let Some(object) = payload.as_object_mut() {
                object.remove("schemaVersion");
                object.remove("packetId");
            }
            payload
        })
}

pub(crate) fn mail_projection(
    events: &[EventRow],
    run_id: &str,
    _packet_id: Option<&str>,
    _attempt_id: Option<i64>,
) -> Value {
    let scoped = events
        .iter()
        .filter(|event| event.run_id.as_deref() == Some(run_id))
        .cloned()
        .collect::<Vec<_>>();
    let delivered_ids = delivered(&scoped);
    let acked_ids = acked(&scoped);
    let relevant = messages(&scoped)
        .into_iter()
        .filter(|message| message_attempt(message).is_some() || message_run(message).is_some())
        .collect::<Vec<_>>();
    let undelivered = relevant
        .iter()
        .filter(|message| !delivered_ids.contains(&message.message_id))
        .count();
    let unacked = relevant
        .iter()
        .filter(|message| message.ack_required && !acked_ids.contains(&message.message_id))
        .count();
    let last_delivered_at = scoped
        .iter()
        .filter(|row| row.kind == MESSAGE_DELIVERED || row.kind == INTERVENTION_DELIVERED)
        .filter_map(|row| {
            let payload = payload(row)?;
            let id = payload
                .get("messageId")
                .or_else(|| payload.get("interventionId"))?
                .as_str()?;
            relevant
                .iter()
                .any(|message| message.message_id == id)
                .then(|| row.ts.clone())
        })
        .max();
    json!({
        "undelivered": undelivered,
        "unacked": unacked,
        "lastDeliveredAt": last_delivered_at,
    })
}

pub(crate) fn coordination_events(snapshot: &forged_ledger::InventorySnapshot) -> Vec<EventRow> {
    let mut events = COORDINATION_EVENT_KINDS
        .iter()
        .flat_map(|kind| snapshot.events(kind).iter().cloned())
        .collect::<Vec<_>>();
    events.sort_by_key(|event| event.event_id);
    events
}

pub(crate) fn undelivered_ids(events: &[EventRow], run_id: &str) -> Vec<String> {
    let scoped = events
        .iter()
        .filter(|event| event.run_id.as_deref() == Some(run_id))
        .cloned()
        .collect::<Vec<_>>();
    let delivered = delivered(&scoped);
    messages(&scoped)
        .into_iter()
        .filter(|message| {
            !delivered.contains(&message.message_id)
                && (message_run(message).is_some() || message_attempt(message).is_some())
        })
        .map(|message| message.message_id)
        .collect()
}

fn seat_key(verb: &str, attempt_id: i64, value: &Value) -> String {
    let bytes = forged_types::canonical_json_bytes(value).unwrap_or_default();
    let digest = Sha256::digest(bytes);
    let short = digest[..8]
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>();
    format!("op:seat_{verb}:{attempt_id}:{short}")
}

fn attempt_param(params: &Map<String, Value>) -> Result<i64, Failure> {
    params
        .get("attempt")
        .and_then(Value::as_i64)
        .filter(|attempt| *attempt > 0)
        .ok_or_else(|| Failure::invalid("missing required positive param \"attempt\""))
}

fn remedy(verb: &str, args: Value, reason: impl Into<String>) -> RemedyV1 {
    let Value::Object(args) = args else {
        unreachable!("seat remedy args are objects")
    };
    RemedyV1 {
        schema: forged_types::REMEDY_SCHEMA_V1.to_owned(),
        verb: verb.to_owned(),
        args,
        reason: reason.into(),
    }
}

fn run_status_remedy(run_id: &str) -> RemedyV1 {
    remedy(
        "run status",
        json!({"run": run_id}),
        "refresh the running attempt identity and claim",
    )
}

fn inbox_remedy(attempt_id: i64) -> RemedyV1 {
    remedy(
        "seat inbox",
        json!({"attempt": attempt_id}),
        "refresh messages addressed to this attempt",
    )
}

fn seat_fence_response(
    operation_id: &str,
    run_id: &str,
    message: impl Into<String>,
) -> OperationResponse {
    remedy_response(
        operation_id,
        &Failure::refused(ErrorCode::SeatFence, message),
        run_status_remedy(run_id),
    )
}

async fn fence(
    ctx: &Ctx,
    attempt_id: i64,
    operation_id: &str,
) -> Result<SeatFence, OperationResponse> {
    let attempt = match on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await {
        Ok(attempt) => attempt,
        Err(failure) => {
            return Err(remedy_response(
                operation_id,
                &Failure::refused(ErrorCode::SeatFence, failure.message),
                remedy(
                    "run status",
                    json!({"run": Value::Null}),
                    "find the current run and running attempt before retrying",
                ),
            ))
        }
    };
    let (run_id, _, _) = match super::split_packet_key(&attempt.packet_id) {
        Ok(parts) => parts,
        Err(failure) => return Err(super::err_response(operation_id, &failure)),
    };
    let env_attempt = std::env::var("FORGED_SEAT_ATTEMPT")
        .ok()
        .and_then(|value| value.parse::<i64>().ok());
    let token = std::env::var("FORGED_SEAT_TOKEN").unwrap_or_default();
    if env_attempt != Some(attempt_id)
        || token.is_empty()
        || token != attempt.claim_token
        || attempt.state != AttemptState::Running
    {
        return Err(seat_fence_response(
            operation_id,
            &run_id,
            format!("attempt {attempt_id} is not owned by this running seat"),
        ));
    }
    Ok(SeatFence {
        attempt,
        run_id,
        token,
    })
}

fn with_fence_remedy(mut response: OperationResponse, run_id: &str) -> OperationResponse {
    if response
        .error
        .as_ref()
        .is_some_and(|error| error.code == ErrorCode::SeatFence)
    {
        if let Some(error) = response.error.as_mut() {
            error.detail = Some(
                serde_json::to_value(run_status_remedy(run_id))
                    .expect("forged.remedy/1 serializes"),
            );
        }
    }
    response
}

async fn run_events(ctx: &Ctx, run_id: &str) -> Result<Vec<EventRow>, Failure> {
    super::sessions::run_events(ctx, run_id).await
}

fn message_json(message: &MessageRecord, bodies: bool) -> Value {
    let mut value = json!({
        "eventId": message.event_id,
        "messageId": message.message_id,
        "from": message.from,
        "to": message.to,
        "packetId": message.packet_id,
        "kind": message.kind,
        "importance": message.importance,
        "ackRequired": message.ack_required,
        "inReplyTo": message.in_reply_to,
    });
    if bodies {
        value["body"] = Value::String(message.body.clone());
    }
    value
}

/// `seat inbox` — pull one bounded, attempt-addressed page and atomically
/// mark the shown rows delivered/read under the attempt claim.
pub async fn seat_inbox(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let attempt_id = match attempt_param(&req.params) {
        Ok(attempt) => attempt,
        Err(failure) => return super::err_response(&seat_key("inbox", 0, &Value::Null), &failure),
    };
    let since = match req.params.get("since") {
        None | Some(Value::Null) => 0,
        Some(value) => match value.as_i64().filter(|value| *value >= 0) {
            Some(value) => value,
            None => {
                return super::err_response(
                    &seat_key(
                        "inbox",
                        attempt_id,
                        &json!({"since": req.params.get("since")}),
                    ),
                    &Failure::invalid("seat inbox since must be a non-negative event id"),
                )
            }
        },
    };
    let bodies = req
        .params
        .get("bodies")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let limit = req
        .params
        .get("limit")
        .and_then(Value::as_u64)
        .unwrap_or(DEFAULT_INBOX_LIMIT);
    if !(1..=MAX_INBOX_LIMIT).contains(&limit) {
        return super::err_response(
            &seat_key("inbox", attempt_id, &json!({"limit": limit})),
            &Failure::invalid("seat inbox limit must be between 1 and 500"),
        );
    }
    let derived_key = super::key_absent(req);
    let request_material = json!({"since": since, "bodies": bodies, "limit": limit});
    default_key(req, seat_key("inbox", attempt_id, &request_material));
    req.run_id = None;
    let operation_id = req.idempotency_key.clone();
    let seat = match fence(ctx, attempt_id, &operation_id).await {
        Ok(seat) => seat,
        Err(response) => return response,
    };
    let events = match run_events(ctx, &seat.run_id).await {
        Ok(events) => events,
        Err(failure) => return super::err_response(&operation_id, &failure),
    };
    let mut pending = poll_for_attempt(&events, attempt_id, bodies);
    pending.retain(|message| message.event_id > since);
    let pending_frontier = pending
        .iter()
        .map(|message| message.event_id)
        .max()
        .unwrap_or(0);
    if derived_key {
        req.idempotency_key = seat_key(
            "inbox",
            attempt_id,
            &json!({
                "since": since,
                "bodies": bodies,
                "limit": limit,
                "pendingFrontier": pending_frontier,
                "pendingCount": pending.len(),
            }),
        );
    }
    pending.sort_by_key(|message| (message.importance != "urgent", message.event_id));
    let total = pending.len();
    let remaining_floor = pending
        .iter()
        .skip(limit as usize)
        .map(|message| message.event_id)
        .min();
    pending.truncate(limit as usize);
    let shown = pending.len();
    let truncated = shown < total;
    // Urgent mail may leapfrog older normal mail. The numeric cursor is
    // therefore the greatest safe event frontier before the oldest unshown
    // message, rather than the maximum event id in this page. Delivered/read
    // effects remove shown rows from the next evaluation, so bounded pages
    // progress without skipping the older row.
    let next_cursor = if let Some(remaining_floor) = remaining_floor {
        remaining_floor.saturating_sub(1).max(since)
    } else {
        events
            .iter()
            .map(|event| event.event_id)
            .max()
            .unwrap_or(since)
            .max(since)
    };
    let page = pending
        .iter()
        .map(|message| message_json(message, bodies))
        .collect::<Vec<_>>();
    let mut writes = Vec::new();
    for message in &pending {
        writes.push((
            MESSAGE_DELIVERED.to_owned(),
            json!({
                "schemaVersion": 1,
                "messageId": message.message_id,
                "attemptId": attempt_id,
                "mode": "poll",
            }),
        ));
        if bodies {
            writes.push((
                MESSAGE_READ.to_owned(),
                json!({
                    "schemaVersion": 1,
                    "messageId": message.message_id,
                    "attemptId": attempt_id,
                }),
            ));
        }
    }
    let run_id = seat.run_id.clone();
    let token = seat.token.clone();
    let packet_id = seat.attempt.packet_id.clone();
    let response = fenced(
        ctx,
        "seat_inbox",
        EffectClass::SafeRetry,
        req,
        None,
        move |_| async move {
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_seat_events_once(attempt_id, &token, &run_id, writes)?;
                Ok(())
            })
            .await?;
            Ok(json!({
                "attemptId": attempt_id,
                "packetId": packet_id,
                "messages": page,
                "coverage": {
                    "shown": shown,
                    "total": total,
                    "truncated": truncated,
                    "nextCursor": next_cursor,
                },
            }))
        },
    )
    .await;
    with_fence_remedy(response, &seat.run_id)
}

/// `seat ack` — acknowledge exactly one message addressed to the seat.
pub async fn seat_ack(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let attempt_id = match attempt_param(&req.params) {
        Ok(attempt) => attempt,
        Err(failure) => return super::err_response(&seat_key("ack", 0, &Value::Null), &failure),
    };
    let message_id = match req.params.get("message").and_then(Value::as_str) {
        Some(message) if !message.is_empty() => message.to_owned(),
        _ => {
            return super::err_response(
                &seat_key("ack", attempt_id, &Value::Null),
                &Failure::invalid("seat ack requires param \"message\""),
            )
        }
    };
    let note = req
        .params
        .get("note")
        .and_then(Value::as_str)
        .map(str::to_owned);
    let key_material = json!({"message": message_id, "note": note});
    default_key(req, seat_key("ack", attempt_id, &key_material));
    req.run_id = None;
    let operation_id = req.idempotency_key.clone();
    let seat = match fence(ctx, attempt_id, &operation_id).await {
        Ok(seat) => seat,
        Err(response) => return response,
    };
    let events = match run_events(ctx, &seat.run_id).await {
        Ok(events) => events,
        Err(failure) => return super::err_response(&operation_id, &failure),
    };
    let addressed = messages(&events).into_iter().any(|message| {
        message.message_id == message_id && targets_attempt(&message, &seat.run_id, attempt_id)
    });
    if !addressed {
        return remedy_response(
            &operation_id,
            &Failure::invalid(format!(
                "message {message_id:?} is not addressed to attempt {attempt_id}"
            )),
            inbox_remedy(attempt_id),
        );
    }
    let run_id = seat.run_id.clone();
    let token = seat.token.clone();
    let acked_message_id = message_id.clone();
    let response = fenced(
        ctx,
        "seat_ack",
        EffectClass::SafeRetry,
        req,
        None,
        move |_| async move {
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_seat_events_once(
                    attempt_id,
                    &token,
                    &run_id,
                    vec![(
                        MESSAGE_ACKED.to_owned(),
                        json!({
                            "schemaVersion": 1,
                            "messageId": acked_message_id,
                            "attemptId": attempt_id,
                            "note": note,
                        }),
                    )],
                )?;
                Ok(())
            })
            .await?;
            Ok(json!({"messageId": message_id, "acked": true}))
        },
    )
    .await;
    with_fence_remedy(response, &seat.run_id)
}

fn progress_snapshot(value: Option<&Value>) -> Result<Value, Failure> {
    let Some(Value::Object(input)) = value else {
        return Err(Failure::invalid(
            "seat progress requires a JSON snapshot object",
        ));
    };
    let expected = ["phase", "commitsAhead", "seatChecks", "blockers", "etaMin"];
    if input.keys().any(|key| !expected.contains(&key.as_str())) {
        return Err(Failure::invalid(
            "seat progress snapshot has an unknown field",
        ));
    }
    let phase = input
        .get("phase")
        .and_then(Value::as_str)
        .filter(|phase| !phase.trim().is_empty())
        .ok_or_else(|| Failure::invalid("seat progress phase must be non-empty"))?;
    let commits_ahead = input
        .get("commitsAhead")
        .and_then(Value::as_u64)
        .ok_or_else(|| Failure::invalid("seat progress commitsAhead must be unsigned"))?;
    let seat_checks = match input.get("seatChecks") {
        Some(Value::Null) => Value::Null,
        Some(Value::String(value)) if matches!(value.as_str(), "pass" | "fail") => {
            Value::String(value.clone())
        }
        _ => {
            return Err(Failure::invalid(
                "seat progress seatChecks must be pass, fail, or null",
            ))
        }
    };
    let blockers = input
        .get("blockers")
        .and_then(Value::as_array)
        .filter(|blockers| blockers.len() <= 32)
        .ok_or_else(|| {
            Failure::invalid("seat progress blockers must be an array of at most 32 strings")
        })?;
    if blockers
        .iter()
        .any(|blocker| blocker.as_str().is_none_or(|blocker| blocker.len() > 1024))
    {
        return Err(Failure::invalid(
            "seat progress blockers must be strings of at most 1024 bytes",
        ));
    }
    let eta_min = match input.get("etaMin") {
        Some(Value::Null) => Value::Null,
        Some(value) if value.as_u64().is_some() => value.clone(),
        _ => {
            return Err(Failure::invalid(
                "seat progress etaMin must be unsigned or null",
            ))
        }
    };
    Ok(json!({
        "phase": phase,
        "commitsAhead": commits_ahead,
        "seatChecks": seat_checks,
        "blockers": blockers,
        "etaMin": eta_min,
    }))
}

/// `seat progress` — append one replace-keyed progress snapshot.
pub async fn seat_progress(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let attempt_id = match attempt_param(&req.params) {
        Ok(attempt) => attempt,
        Err(failure) => {
            return super::err_response(&seat_key("progress", 0, &Value::Null), &failure)
        }
    };
    let snapshot = match progress_snapshot(req.params.get("snapshot")) {
        Ok(snapshot) => snapshot,
        Err(failure) => {
            return super::err_response(&seat_key("progress", attempt_id, &Value::Null), &failure)
        }
    };
    default_key(req, seat_key("progress", attempt_id, &snapshot));
    req.run_id = None;
    let operation_id = req.idempotency_key.clone();
    let seat = match fence(ctx, attempt_id, &operation_id).await {
        Ok(seat) => seat,
        Err(response) => return response,
    };
    let mut event = snapshot.clone();
    let object = event
        .as_object_mut()
        .expect("progress snapshot is an object");
    object.insert("schemaVersion".to_owned(), json!(1));
    object.insert("attemptId".to_owned(), json!(attempt_id));
    object.insert("packetId".to_owned(), json!(seat.attempt.packet_id));
    let run_id = seat.run_id.clone();
    let token = seat.token.clone();
    let response = fenced(
        ctx,
        "seat_progress",
        EffectClass::SafeRetry,
        req,
        None,
        move |_| async move {
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_seat_events_once(
                    attempt_id,
                    &token,
                    &run_id,
                    vec![(SEAT_PROGRESS.to_owned(), event)],
                )?;
                Ok(())
            })
            .await?;
            Ok(json!({"attemptId": attempt_id, "progress": snapshot}))
        },
    )
    .await;
    with_fence_remedy(response, &seat.run_id)
}

/// `seat note` — send one bounded note directly to the lead.
pub async fn seat_note(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let attempt_id = match attempt_param(&req.params) {
        Ok(attempt) => attempt,
        Err(failure) => return super::err_response(&seat_key("note", 0, &Value::Null), &failure),
    };
    let body = match req.params.get("body").and_then(Value::as_str) {
        Some(body) if body.len() <= SEAT_BODY_LIMIT => body.to_owned(),
        Some(_) => {
            let operation_id = seat_key("note", attempt_id, &Value::Null);
            return remedy_response(
                &operation_id,
                &Failure::invalid("seat note body exceeds 4096 bytes"),
                remedy(
                    "seat note",
                    json!({"attempt": attempt_id, "bodyFile": Value::Null}),
                    "shorten to 4096 bytes",
                ),
            );
        }
        None => {
            return super::err_response(
                &seat_key("note", attempt_id, &Value::Null),
                &Failure::invalid("seat note requires param \"body\""),
            )
        }
    };
    default_key(req, seat_key("note", attempt_id, &json!({"body": body})));
    req.run_id = None;
    let operation_id = req.idempotency_key.clone();
    let seat = match fence(ctx, attempt_id, &operation_id).await {
        Ok(seat) => seat,
        Err(response) => return response,
    };
    let message_id = operation_id.clone();
    let event = json!({
        "schemaVersion": 1,
        "messageId": message_id,
        "from": {"kind": "attempt", "id": attempt_id},
        "to": {"kind": "lead", "id": "lead"},
        "packetId": seat.attempt.packet_id,
        "kind": "note",
        "importance": "normal",
        "ackRequired": false,
        "inReplyTo": Value::Null,
        "body": body,
    });
    let run_id = seat.run_id.clone();
    let token = seat.token.clone();
    let response = fenced(
        ctx,
        "seat_note",
        EffectClass::SafeRetry,
        req,
        None,
        move |_| async move {
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_seat_events_once(
                    attempt_id,
                    &token,
                    &run_id,
                    vec![(MESSAGE_QUEUED.to_owned(), event)],
                )?;
                Ok(())
            })
            .await?;
            Ok(json!({"messageId": message_id, "delivery": "queued"}))
        },
    )
    .await;
    with_fence_remedy(response, &seat.run_id)
}

/// Record one boundary delivery after the new attempt's prompt is durable.
pub(crate) async fn record_boundary_delivered(
    ctx: &Ctx,
    run_id: &str,
    attempt_id: i64,
    token: &str,
    messages: &[MessageRecord],
) -> Result<(), Failure> {
    let writes = messages
        .iter()
        .map(|message| {
            (
                MESSAGE_DELIVERED.to_owned(),
                json!({
                    "schemaVersion": 1,
                    "messageId": message.message_id,
                    "attemptId": attempt_id,
                    "mode": "boundary",
                }),
            )
        })
        .collect();
    let run_id = run_id.to_owned();
    let token = token.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_seat_events_once(attempt_id, &token, &run_id, writes)?;
        Ok(())
    })
    .await?;
    Ok(())
}

/// Deterministically queue the controller's one deadline warning.
pub(crate) async fn record_deadline_warning(
    ctx: &Ctx,
    run_id: &str,
    packet_id: &str,
    attempt_id: i64,
) -> Result<(), Failure> {
    let message_id = format!("deadline-warning:{attempt_id}");
    let payload = json!({
        "schemaVersion": 1,
        "messageId": message_id,
        "from": {"kind": "run", "id": run_id},
        "to": {"kind": "attempt", "id": attempt_id},
        "packetId": packet_id,
        "kind": "instruction",
        "importance": "urgent",
        "ackRequired": true,
        "inReplyTo": Value::Null,
        "body": "commit what is green and return; forged runs the gate after you return",
    });
    let run_id = run_id.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event_once(&run_id, MESSAGE_QUEUED, payload)?;
        Ok(())
    })
    .await
}

/// Latest delivered-event timestamps keyed by message id.
pub(crate) fn delivered_at(events: &[EventRow]) -> BTreeMap<String, (i64, String)> {
    let mut delivered = BTreeMap::new();
    for row in events.iter().filter(|row| row.kind == MESSAGE_DELIVERED) {
        let Some(payload) = payload(row) else {
            continue;
        };
        let (Some(id), Some(attempt)) = (
            payload.get("messageId").and_then(Value::as_str),
            payload.get("attemptId").and_then(Value::as_i64),
        ) else {
            continue;
        };
        delivered.insert(id.to_owned(), (attempt, row.ts.clone()));
    }
    delivered
}

pub(crate) fn acked_ids(events: &[EventRow]) -> BTreeSet<String> {
    acked(events)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn legacy_intervention_bytes_project_as_boundary_instructions() {
        let stored = json!({
            "schemaVersion": 1,
            "interventionId": "op:legacy-message",
            "requestedBy": "lead-agent",
            "targetAttemptId": 7,
            "message": "preserve the public seam"
        })
        .to_string();
        let queued = EventRow {
            event_id: 41,
            ts: "2026-09-04T12:00:00.000000000Z".to_owned(),
            run_id: Some("legacy-run".to_owned()),
            kind: INTERVENTION_QUEUED.to_owned(),
            payload_json: stored.clone(),
        };
        let projected = messages(std::slice::from_ref(&queued));
        assert_eq!(
            queued.payload_json, stored,
            "projection never rewrites bytes"
        );
        assert_eq!(projected.len(), 1);
        assert_eq!(projected[0].message_id, "op:legacy-message");
        assert_eq!(projected[0].kind, "instruction");
        assert_eq!(projected[0].importance, "normal");
        assert_eq!(projected[0].to, json!({"kind": "attempt", "id": 7}));

        let delivered = EventRow {
            event_id: 42,
            ts: "2026-09-04T12:01:00.000000000Z".to_owned(),
            run_id: Some("legacy-run".to_owned()),
            kind: INTERVENTION_DELIVERED.to_owned(),
            payload_json: json!({
                "schemaVersion": 1,
                "interventionId": "op:legacy-message",
                "attemptId": 7,
                "mode": "boundary"
            })
            .to_string(),
        };
        assert!(pending_messages(&[queued, delivered]).is_empty());
    }
}
