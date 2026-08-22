//! The idempotent operation store.
//!
//! Idempotency identity is `(name, idempotency_key)` PLUS the run and the
//! effect class: same key from a different run, or the same key under a
//! different effect class, is a CONFLICT and never a replay. The row is
//! claimed `in_progress` BEFORE any side effect fires; callers store ONLY
//! semantic outcomes — transport failures are never stored terminal.

use forged_types::{request_sha256, ErrorCode, OperationRequest, OperationResponse};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::attempts::{find_attempt_by_token_tx, run_of_packet};
use crate::error::{column_decode_error, internal, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::runs::get_run_tx;
use crate::time::now_iso;
use crate::types::{
    AttemptState, EffectClass, OperationOutcome, OperationRow, OperationState, OperationTicket,
    RunState,
};

const CONTROLLER_REVOKED: &str = "forged.controller.revoked";
const MACHINE_ADMITTED: &str = "forged.machine.admitted";

pub(crate) const OPERATION_COLUMNS: &str =
    "operation_id, name, idempotency_key, request_sha256, effect_class, run_id, \
     claim_token, state, response_json, created_at, updated_at";

/// Decode a stored `operations.effect_class`, failing CLOSED: `safe-retry`
/// must be stored explicitly — the reconciler must never inherit redo
/// permission from an unrecognized (corrupt) class string.
fn effect_class_from_db(idx: usize, s: &str) -> Result<EffectClass, rusqlite::Error> {
    match s {
        "safe-retry" => Ok(EffectClass::SafeRetry),
        "observe-only" => Ok(EffectClass::ObserveOnly),
        "human-ambiguous" => Ok(EffectClass::HumanAmbiguous),
        other => Err(column_decode_error(idx, "effect class", other)),
    }
}

/// Decode a stored `operations.state`, failing CLOSED: `in_progress` must be
/// stored explicitly — an unrecognized string is a storage error, never a
/// row the reconciler may treat as in flight.
fn operation_state_from_db(idx: usize, s: &str) -> Result<OperationState, rusqlite::Error> {
    match s {
        "in_progress" => Ok(OperationState::InProgress),
        "terminal" => Ok(OperationState::Terminal),
        other => Err(column_decode_error(idx, "operation state", other)),
    }
}

pub(crate) fn operation_row(row: &rusqlite::Row<'_>) -> Result<OperationRow, rusqlite::Error> {
    Ok(OperationRow {
        operation_id: row.get(0)?,
        name: row.get(1)?,
        idempotency_key: row.get(2)?,
        request_sha256: row.get(3)?,
        effect_class: effect_class_from_db(4, &row.get::<_, String>(4)?)?,
        run_id: row.get(5)?,
        claim_token: row.get(6)?,
        state: operation_state_from_db(7, &row.get::<_, String>(7)?)?,
        response_json: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}

pub(crate) fn list_inflight_operations_tx(
    conn: &Connection,
) -> Result<Vec<OperationRow>, LedgerError> {
    let sql = format!(
        "SELECT {OPERATION_COLUMNS} FROM operations WHERE state = 'in_progress' ORDER BY rowid"
    );
    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query_map([], operation_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn get_operation_tx(conn: &Connection, operation_id: &str) -> Result<OperationRow, LedgerError> {
    let sql = format!("SELECT {OPERATION_COLUMNS} FROM operations WHERE operation_id = ?1");
    conn.query_row(&sql, [operation_id], operation_row)
        .optional()?
        .ok_or_else(|| {
            refused(
                ErrorCode::InvalidRequest,
                format!("no operation {operation_id:?}"),
            )
        })
}

fn find_operation_tx(
    conn: &Connection,
    name: &str,
    idempotency_key: &str,
) -> Result<Option<OperationRow>, LedgerError> {
    let sql = format!(
        "SELECT {OPERATION_COLUMNS} FROM operations WHERE name = ?1 AND idempotency_key = ?2"
    );
    Ok(conn
        .query_row(&sql, [name, idempotency_key], operation_row)
        .optional()?)
}

fn replay_event_operation_tx(
    conn: &Connection,
    name: &str,
    request: &OperationRequest,
) -> Result<Option<OperationResponse>, LedgerError> {
    if request.schema_version != 1 {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!("unsupported schema_version {}", request.schema_version),
        ));
    }
    let hash = request_sha256(request).map_err(|error| {
        refused(
            ErrorCode::InvalidRequest,
            format!("params cannot be canonicalized: {error}"),
        )
    })?;
    let Some(row) = find_operation_tx(conn, name, &request.idempotency_key)? else {
        return Ok(None);
    };
    if row.request_sha256 != hash
        || row.run_id != request.run_id
        || row.effect_class != EffectClass::SafeRetry
    {
        return Err(refused(
            ErrorCode::IdempotencyConflict,
            format!(
                "operation {name:?} key {:?} was stored with a different request, run, or effect class",
                request.idempotency_key
            ),
        ));
    }
    match row.state {
        OperationState::InProgress => Err(refused(
            ErrorCode::OperationInProgress,
            format!(
                "operation {name:?} key {:?} is still in progress",
                request.idempotency_key
            ),
        )),
        OperationState::Terminal => {
            let stored = row
                .response_json
                .ok_or_else(|| internal("terminal operation row has no stored response"))?;
            let mut response: OperationResponse = serde_json::from_str(&stored)?;
            response.reused = true;
            Ok(Some(response))
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum StoredAttentionState {
    Open,
    Acknowledged,
    Resolved,
}

fn attention_transition_state_tx(
    conn: &Connection,
    run_id: &str,
    attention_id: &str,
    occurrence_id: &str,
) -> Result<StoredAttentionState, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT kind, payload_json FROM events WHERE run_id = ?1 AND kind IN \
         ('forged.attention.acknowledged', 'forged.attention.resolved', \
          'forged.attention.reopened') ORDER BY event_id",
    )?;
    let rows = statement.query_map([run_id], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;
    let mut state = StoredAttentionState::Open;
    for row in rows {
        let (kind, raw) = row?;
        let payload: serde_json::Value = serde_json::from_str(&raw)?;
        if payload
            .get("attentionId")
            .and_then(serde_json::Value::as_str)
            != Some(attention_id)
            || payload
                .get("occurrenceId")
                .and_then(serde_json::Value::as_str)
                != Some(occurrence_id)
        {
            continue;
        }
        state = match kind.as_str() {
            "forged.attention.acknowledged" => StoredAttentionState::Acknowledged,
            "forged.attention.resolved" => StoredAttentionState::Resolved,
            "forged.attention.reopened" => StoredAttentionState::Open,
            _ => unreachable!("query has a closed attention kind set"),
        };
    }
    Ok(state)
}

fn validate_attention_transition(
    state: StoredAttentionState,
    event_kind: &str,
) -> Result<(), LedgerError> {
    let legal = matches!(
        (state, event_kind),
        (StoredAttentionState::Open, "forged.attention.acknowledged")
            | (StoredAttentionState::Open, "forged.attention.resolved")
            | (
                StoredAttentionState::Acknowledged,
                "forged.attention.resolved"
            )
            | (StoredAttentionState::Resolved, "forged.attention.reopened")
    );
    if legal {
        Ok(())
    } else {
        Err(refused(
            ErrorCode::InvalidRequest,
            "attention transition is stale or illegal for the current occurrence state",
        ))
    }
}

fn stale_token() -> LedgerError {
    refused(ErrorCode::StaleClaimToken, "claim token is not running")
}

fn controller_generation_revoked_tx(
    conn: &Connection,
    run_id: &str,
    generation: u32,
) -> Result<bool, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT payload_json FROM events WHERE run_id = ?1 AND kind = ?2 ORDER BY event_id",
    )?;
    let rows = statement.query_map(rusqlite::params![run_id, CONTROLLER_REVOKED], |row| {
        row.get::<_, String>(0)
    })?;
    for payload in rows {
        let payload: serde_json::Value = serde_json::from_str(&payload?)?;
        if payload
            .get("generation")
            .and_then(serde_json::Value::as_u64)
            == Some(u64::from(generation))
        {
            return Ok(true);
        }
    }
    Ok(false)
}

/// Store the terminal envelope for a row that must match `operation_id` and
/// must not already be terminal. Shared by `complete_operation` (with the
/// fence) and `resolve_interrupted_operation` (without it).
pub(crate) fn settle_operation(
    tx: &Connection,
    operation_id: &str,
    response: &OperationResponse,
    check_fence: bool,
) -> Result<(), LedgerError> {
    let row = get_operation_tx(tx, operation_id)?;
    if response.operation_id != operation_id {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!(
                "response names operation {:?}, not {operation_id:?}",
                response.operation_id
            ),
        ));
    }
    if row.state == OperationState::Terminal {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!("operation {operation_id:?} is already terminal"),
        ));
    }
    if check_fence {
        if let Some(token) = &row.claim_token {
            let attempt = find_attempt_by_token_tx(tx, token)?.ok_or_else(stale_token)?;
            if attempt.state != AttemptState::Running {
                // A revoked attempt cannot land results.
                return Err(stale_token());
            }
        }
    }
    let response_json = serde_json::to_string(response)?;
    tx.execute(
        "UPDATE operations SET state = 'terminal', response_json = ?1, updated_at = ?2 \
         WHERE operation_id = ?3",
        rusqlite::params![response_json, now_iso(), operation_id],
    )?;
    Ok(())
}

/// The containment scan behind [`Ledger::uncontained_machine_operations`],
/// shared with the terminalization transaction that must refuse BEFORE the
/// terminal write commits when no controller death will ever contain a
/// ticket admitted after the caller's precheck.
pub(crate) fn uncontained_machine_operations_tx(
    conn: &Connection,
    run_id: &str,
    contained_generation: Option<u32>,
) -> Result<Vec<String>, LedgerError> {
    let machine_names = ["resolve", "gate", "regate", "push", "draftpr"];
    let mut statement = conn.prepare(
        "SELECT operation_id, name FROM operations \
         WHERE run_id = ?1 AND state = 'in_progress' ORDER BY rowid",
    )?;
    let rows = statement.query_map([run_id], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;
    let rows = rows.collect::<Result<Vec<_>, _>>()?;
    let mut unsafe_operations = Vec::new();
    for (operation_id, name) in rows {
        if !machine_names.contains(&name.as_str()) {
            continue;
        }
        let mut events = conn.prepare(
            "SELECT payload_json FROM events WHERE run_id = ?1 AND kind = ?2 ORDER BY event_id",
        )?;
        let payloads = events.query_map(rusqlite::params![run_id, MACHINE_ADMITTED], |row| {
            row.get::<_, String>(0)
        })?;
        let mut admitted_generation = None;
        let mut found = false;
        for payload in payloads {
            let payload: serde_json::Value = serde_json::from_str(&payload?)?;
            if payload
                .get("operationId")
                .and_then(serde_json::Value::as_str)
                == Some(operation_id.as_str())
            {
                found = true;
                admitted_generation = payload
                    .get("generation")
                    .and_then(serde_json::Value::as_u64)
                    .and_then(|value| u32::try_from(value).ok());
                break;
            }
        }
        if !found || admitted_generation != contained_generation || contained_generation.is_none() {
            unsafe_operations.push(operation_id);
        }
    }
    Ok(unsafe_operations)
}

impl Ledger {
    /// Reclaim a stale in-progress `review_publish` ObserveOnly wrapper.
    ///
    /// Per-finding migration-019 leases remain the effect fence; this lease
    /// only prevents two callers from trying to finish the same wrapper at
    /// once. A terminal operation is never reopened.
    pub fn resume_stale_review_publish_operation(
        &self,
        operation_id: &str,
        request_sha256: &str,
        stale_before: &str,
        now: &str,
    ) -> Result<(), LedgerError> {
        let operation_id = operation_id.to_owned();
        let request_sha256 = request_sha256.to_owned();
        let stale_before = stale_before.to_owned();
        let now = now.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let row = get_operation_tx(&tx, &operation_id)?;
            if row.name != "review_publish"
                || row.effect_class != EffectClass::ObserveOnly
                || row.request_sha256 != request_sha256
            {
                return Err(refused(
                    ErrorCode::IdempotencyConflict,
                    "review publication resume does not match the stored operation",
                ));
            }
            if row.state == OperationState::Terminal {
                return Err(refused(
                    ErrorCode::IdempotencyConflict,
                    "terminal review publication cannot be reopened",
                ));
            }
            if row.updated_at.as_str() > stale_before.as_str() {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "review publication is still inside its reconciliation lease",
                ));
            }
            let changed = tx.execute(
                "UPDATE operations SET updated_at = ?1 WHERE operation_id = ?2
                 AND state = 'in_progress' AND updated_at <= ?3",
                rusqlite::params![now, operation_id, stale_before],
            )?;
            if changed != 1 {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "review publication was concurrently resumed",
                ));
            }
            tx.commit()?;
            Ok(())
        })
    }

    /// Atomically record one ledger-only event effect and its terminal
    /// idempotency receipt.
    ///
    /// Attention controls have no external effect to observe: leaving an
    /// `in_progress` row between operation admission and an event append
    /// would strand a harmless retry forever. This specialized seam performs
    /// reservation, event, and terminal response in one IMMEDIATE transaction,
    /// so a process crash exposes either none of them or all of them.
    pub fn apply_event_operation(
        &self,
        name: &str,
        request: &OperationRequest,
        event_kind: &str,
        event_payload: serde_json::Value,
        result: serde_json::Value,
    ) -> Result<OperationResponse, LedgerError> {
        let name = name.to_owned();
        let request = request.clone();
        let event_kind = event_kind.to_owned();
        self.submit(move |conn| {
            let run_id = request.run_id.as_deref().ok_or_else(|| {
                refused(
                    ErrorCode::InvalidRequest,
                    "attention operations require request.run_id",
                )
            })?;
            let hash = request_sha256(&request).map_err(|error| {
                refused(
                    ErrorCode::InvalidRequest,
                    format!("params cannot be canonicalized: {error}"),
                )
            })?;
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            if let Some(response) = replay_event_operation_tx(&tx, &name, &request)? {
                tx.commit()?;
                return Ok(response);
            }

            let attention_id = event_payload
                .get("attentionId")
                .and_then(serde_json::Value::as_str)
                .ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        "attention transition has no attentionId",
                    )
                })?;
            let occurrence_id = event_payload
                .get("occurrenceId")
                .and_then(serde_json::Value::as_str)
                .ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        "attention transition has no occurrenceId",
                    )
                })?;
            let state = attention_transition_state_tx(&tx, run_id, attention_id, occurrence_id)?;
            validate_attention_transition(state, &event_kind)?;

            let operation_id = uuid::Uuid::now_v7().to_string();
            let now = now_iso();
            tx.execute(
                "INSERT INTO operations (operation_id, name, idempotency_key, \
                 request_sha256, effect_class, run_id, claim_token, state, \
                 created_at, updated_at) \
                 VALUES (?1, ?2, ?3, ?4, 'safe-retry', ?5, NULL, 'in_progress', ?6, ?6)",
                rusqlite::params![
                    operation_id,
                    name,
                    request.idempotency_key,
                    hash,
                    run_id,
                    now,
                ],
            )?;
            let mut payload = event_payload;
            let object = payload.as_object_mut().ok_or_else(|| {
                refused(
                    ErrorCode::InvalidRequest,
                    "event operation payload must be an object",
                )
            })?;
            object.insert(
                "operationId".to_owned(),
                serde_json::Value::String(operation_id.clone()),
            );
            append_event_tx(&tx, Some(run_id), &event_kind, &payload)?;
            let response = OperationResponse {
                operation_id: operation_id.clone(),
                reused: false,
                ok: true,
                result: Some(result),
                error: None,
            };
            settle_operation(&tx, &operation_id, &response, true)?;
            tx.commit()?;
            Ok(response)
        })
    }

    /// Return the terminal response for an exact ledger-only operation
    /// without requiring its projected source to remain active. A miss is
    /// `Ok(None)`; conflicts and in-progress rows retain their normal errors.
    pub fn replay_event_operation(
        &self,
        name: &str,
        request: &OperationRequest,
    ) -> Result<Option<OperationResponse>, LedgerError> {
        let name = name.to_owned();
        let request = request.clone();
        self.submit(move |conn| replay_event_operation_tx(conn, &name, &request))
    }

    /// Claim or replay an idempotent operation, in one transaction.
    ///
    /// Validates `schema_version == 1`; when `claim_token` is given, the
    /// attempt must be `running` (`StaleClaimToken`) and `request.run_id`
    /// must equal the run owning the claiming attempt (`InvalidRequest`,
    /// including a `None` run_id). A `CanonicalError` from `request_sha256`
    /// refuses with `InvalidRequest` before any row is written. Outcomes:
    /// no row → `Fresh` (the row is claimed before any side effect fires;
    /// the caller performs the effect only after this commit); differing
    /// hash, run, or effect class → `IdempotencyConflict`; still
    /// `in_progress` → `OperationInProgress`; terminal → `Replayed` with
    /// `reused: true`, payloads verbatim.
    pub fn begin_operation(
        &self,
        name: &str,
        request: &OperationRequest,
        effect_class: EffectClass,
        claim_token: Option<&str>,
    ) -> Result<OperationOutcome, LedgerError> {
        self.begin_operation_inner(name, request, effect_class, claim_token, false, None)
    }

    /// Claim or replay one controller-owned machine operation.
    ///
    /// A fresh claim joins the run's durable controller-generation fence in
    /// the same transaction that reserves its operation row. Once settlement
    /// has stopped the run or revoked this generation, no new machine effect
    /// can receive a ticket. Existing terminal rows remain replayable because
    /// replay performs no external effect.
    pub fn begin_controller_operation(
        &self,
        name: &str,
        request: &OperationRequest,
        effect_class: EffectClass,
        generation: u32,
    ) -> Result<OperationOutcome, LedgerError> {
        self.begin_machine_operation(name, request, effect_class, Some(generation))
    }

    /// Claim or replay a machine operation, always joining the run's active
    /// state even when a foreground driver has no detached generation.
    pub fn begin_machine_operation(
        &self,
        name: &str,
        request: &OperationRequest,
        effect_class: EffectClass,
        generation: Option<u32>,
    ) -> Result<OperationOutcome, LedgerError> {
        self.begin_operation_inner(name, request, effect_class, None, true, generation)
    }

    fn begin_operation_inner(
        &self,
        name: &str,
        request: &OperationRequest,
        effect_class: EffectClass,
        claim_token: Option<&str>,
        require_active_run: bool,
        controller_generation: Option<u32>,
    ) -> Result<OperationOutcome, LedgerError> {
        let name = name.to_owned();
        let request = request.clone();
        let claim_token = claim_token.map(str::to_owned);
        self.submit(move |conn| {
            if request.schema_version != 1 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("unsupported schema_version {}", request.schema_version),
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            if let Some(token) = &claim_token {
                let attempt = find_attempt_by_token_tx(&tx, token)?.ok_or_else(stale_token)?;
                if attempt.state != AttemptState::Running {
                    return Err(stale_token());
                }
                let owning_run = run_of_packet(&tx, &attempt.packet_id)?;
                if request.run_id.as_deref() != Some(owning_run.as_str()) {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "request.run_id does not match the claiming attempt's run",
                    ));
                }
            }
            // Caller-supplied params that cannot canonicalize are a refusal,
            // never Internal — and no row is written first.
            let hash = request_sha256(&request).map_err(|err| {
                refused(
                    ErrorCode::InvalidRequest,
                    format!("params cannot be canonicalized: {err}"),
                )
            })?;
            let existing = find_operation_tx(&tx, &name, &request.idempotency_key)?;
            match existing {
                None => {
                    if require_active_run {
                        let run_id = request.run_id.as_deref().ok_or_else(|| {
                            refused(
                                ErrorCode::InvalidRequest,
                                "controller-owned operations require request.run_id",
                            )
                        })?;
                        let run = get_run_tx(&tx, run_id)?;
                        let revoked = match controller_generation {
                            Some(generation) => {
                                controller_generation_revoked_tx(&tx, run_id, generation)?
                            }
                            None => false,
                        };
                        if run.state != RunState::Active || revoked {
                            return Err(refused(
                                ErrorCode::StaleClaimToken,
                                match controller_generation {
                                    Some(generation) => format!(
                                        "controller generation {generation} for run {run_id:?} is fenced"
                                    ),
                                    None => format!("run {run_id:?} is stopped"),
                                },
                            ));
                        }
                    }
                    let operation_id = uuid::Uuid::now_v7().to_string();
                    let now = now_iso();
                    tx.execute(
                        "INSERT INTO operations (operation_id, name, idempotency_key, \
                         request_sha256, effect_class, run_id, claim_token, state, \
                         created_at, updated_at) \
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'in_progress', ?8, ?8)",
                        rusqlite::params![
                            operation_id,
                            name,
                            request.idempotency_key,
                            hash,
                            effect_class.as_str(),
                            request.run_id,
                            claim_token,
                            now
                        ],
                    )?;
                    if require_active_run {
                        append_event_tx(
                            &tx,
                            request.run_id.as_deref(),
                            MACHINE_ADMITTED,
                            &json!({
                                "schemaVersion": 1,
                                "operationId": operation_id,
                                "generation": controller_generation,
                            }),
                        )?;
                    }
                    tx.commit()?;
                    Ok(OperationOutcome::Fresh(OperationTicket { operation_id }))
                }
                Some(row) => {
                    // Column-based identity: a stored NULL run_id matches
                    // only a request with no run_id.
                    if row.request_sha256 != hash
                        || row.run_id != request.run_id
                        || row.effect_class != effect_class
                    {
                        return Err(refused(
                            ErrorCode::IdempotencyConflict,
                            format!(
                                "operation {:?} key {:?} was stored with a different \
                                 request, run, or effect class",
                                name, request.idempotency_key
                            ),
                        ));
                    }
                    match row.state {
                        OperationState::InProgress => Err(refused(
                            ErrorCode::OperationInProgress,
                            format!(
                                "operation {:?} key {:?} is still in progress",
                                name, request.idempotency_key
                            ),
                        )),
                        OperationState::Terminal => {
                            let stored = row.response_json.ok_or_else(|| {
                                internal("terminal operation row has no stored response")
                            })?;
                            let mut response: OperationResponse = serde_json::from_str(&stored)?;
                            response.reused = true;
                            tx.commit()?;
                            Ok(OperationOutcome::Replayed(response))
                        }
                    }
                }
            }
        })
    }

    /// In-flight machine tickets not proven contained by one confirmed-dead
    /// controller generation. Legacy rows without an admission event fail
    /// closed as uncontained.
    pub fn uncontained_machine_operations(
        &self,
        run_id: &str,
        contained_generation: Option<u32>,
    ) -> Result<Vec<String>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            uncontained_machine_operations_tx(conn, &run_id, contained_generation)
        })
    }

    /// Store the terminal envelope verbatim. `response.operation_id` must
    /// match and the row must not already be terminal (`InvalidRequest`);
    /// when the row carries a `claim_token`, the fence re-checks that the
    /// attempt is still `running`, else `StaleClaimToken`.
    pub fn complete_operation(
        &self,
        operation_id: &str,
        response: &OperationResponse,
    ) -> Result<(), LedgerError> {
        let operation_id = operation_id.to_owned();
        let response = response.clone();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            settle_operation(&tx, &operation_id, &response, true)?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Delete a known-not-applied `in_progress` row so a retry can re-claim,
    /// appending an `operation.released` event in the same transaction. An
    /// already-terminal row refuses with `InvalidRequest` and survives — it
    /// is the idempotency record; an unknown id refuses with
    /// `InvalidRequest`.
    pub fn release_operation(&self, operation_id: &str) -> Result<(), LedgerError> {
        let operation_id = operation_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let row = get_operation_tx(&tx, &operation_id)?;
            if row.state == OperationState::Terminal {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("operation {operation_id:?} is terminal; never delete it"),
                ));
            }
            let affected = tx.execute(
                "DELETE FROM operations WHERE operation_id = ?1 AND state = 'in_progress'",
                [&operation_id],
            )?;
            if affected != 1 {
                return Err(internal(format!(
                    "release_operation affected {affected} rows, expected 1"
                )));
            }
            append_event_tx(
                &tx,
                row.run_id.as_deref(),
                "operation.released",
                &json!({
                    "operationId": row.operation_id,
                    "name": row.name,
                    "idempotencyKey": row.idempotency_key,
                }),
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Settle an interrupted operation found after a crash: the same checks
    /// as `complete_operation` but skipping ONLY the claim-token fence — the
    /// original attempt may already be reclaimed.
    pub fn resolve_interrupted_operation(
        &self,
        operation_id: &str,
        response: &OperationResponse,
    ) -> Result<(), LedgerError> {
        let operation_id = operation_id.to_owned();
        let response = response.clone();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            settle_operation(&tx, &operation_id, &response, false)?;
            tx.commit()?;
            Ok(())
        })
    }

    /// `in_progress` rows for the reconciler, ordered by rowid ascending.
    /// `run_id: None` returns all rows including NULL-run rows; `Some(r)`
    /// only rows with `run_id = r`.
    pub fn list_inflight_operations(
        &self,
        run_id: Option<&str>,
    ) -> Result<Vec<OperationRow>, LedgerError> {
        let run_id = run_id.map(str::to_owned);
        self.submit(move |conn| {
            let sql = format!(
                "SELECT {OPERATION_COLUMNS} FROM operations WHERE state = 'in_progress' \
                 AND (?1 IS NULL OR run_id = ?1) ORDER BY rowid"
            );
            let mut stmt = conn.prepare(&sql)?;
            let rows = stmt.query_map([&run_id], operation_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Probe for an operation row by identity; `Ok(None)` on a miss.
    pub fn find_operation(
        &self,
        name: &str,
        idempotency_key: &str,
    ) -> Result<Option<OperationRow>, LedgerError> {
        let name = name.to_owned();
        let idempotency_key = idempotency_key.to_owned();
        self.submit(move |conn| find_operation_tx(conn, &name, &idempotency_key))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{json, Map, Value};
    use std::sync::{Arc, Barrier};

    #[test]
    fn effect_class_decodes_every_check_string_and_fails_closed() {
        for (s, want) in [
            ("safe-retry", EffectClass::SafeRetry),
            ("observe-only", EffectClass::ObserveOnly),
            ("human-ambiguous", EffectClass::HumanAmbiguous),
        ] {
            assert_eq!(effect_class_from_db(4, s).expect(s), want);
        }
        for bad in ["", "SafeRetry", "safe_retry", "retry"] {
            let err: LedgerError = effect_class_from_db(4, bad)
                .expect_err("unknown class must fail closed, never default to SafeRetry")
                .into();
            assert!(
                matches!(err, LedgerError::Internal { .. }),
                "{bad:?}: {err}"
            );
        }
    }

    #[test]
    fn operation_state_decodes_every_check_string_and_fails_closed() {
        for (s, want) in [
            ("in_progress", OperationState::InProgress),
            ("terminal", OperationState::Terminal),
        ] {
            assert_eq!(operation_state_from_db(7, s).expect(s), want);
        }
        for bad in ["", "in-progress", "Terminal", "done"] {
            let err: LedgerError = operation_state_from_db(7, bad)
                .expect_err("unknown state must fail closed, never default to InProgress")
                .into();
            assert!(
                matches!(err, LedgerError::Internal { .. }),
                "{bad:?}: {err}"
            );
        }
    }

    #[test]
    fn event_operation_commits_transition_and_receipt_atomically() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let params = match json!({"actor": "lead", "occurrenceId": "occ-1"}) {
            Value::Object(map) => map,
            _ => Map::new(),
        };
        let request = OperationRequest {
            schema_version: 1,
            idempotency_key: "attention-occ-1".to_owned(),
            run_id: Some("subject-1".to_owned()),
            params,
        };
        let first = ledger
            .apply_event_operation(
                "attention_acknowledge",
                &request,
                "forged.attention.acknowledged",
                json!({
                    "schema": "forged.attention-transition/1",
                    "attentionId": "attention-1",
                    "occurrenceId": "occ-1",
                }),
                json!({"state": "acknowledged"}),
            )
            .expect("first transition");
        assert!(!first.reused);
        let replay = ledger
            .apply_event_operation(
                "attention_acknowledge",
                &request,
                "forged.attention.acknowledged",
                json!({
                    "schema": "forged.attention-transition/1",
                    "attentionId": "attention-1",
                    "occurrenceId": "occ-1",
                }),
                json!({"state": "acknowledged"}),
            )
            .expect("exact replay");
        assert!(replay.reused);
        assert_eq!(replay.operation_id, first.operation_id);
        let events = ledger
            .list_events(Some("subject-1"), 0, 100)
            .expect("events");
        assert_eq!(events.len(), 1, "replay appended no second transition");

        let mut conflicting = request;
        conflicting
            .params
            .insert("actor".to_owned(), json!("someone-else"));
        let error = ledger
            .apply_event_operation(
                "attention_acknowledge",
                &conflicting,
                "forged.attention.acknowledged",
                json!({
                    "schema": "forged.attention-transition/1",
                    "attentionId": "attention-1",
                    "occurrenceId": "occ-1",
                }),
                json!({"state": "acknowledged"}),
            )
            .expect_err("same key with a different request conflicts");
        assert_eq!(error.code(), ErrorCode::IdempotencyConflict);
        ledger.close().expect("close");
    }

    #[test]
    fn concurrent_attention_controls_linearize_without_resurrection() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let first = Ledger::open(&path).expect("first ledger");
        let second = Ledger::open(&path).expect("second ledger");
        let barrier = Arc::new(Barrier::new(2));
        let run = |name: &'static str,
                   key: &'static str,
                   kind: &'static str,
                   state: &'static str,
                   ledger: Ledger,
                   barrier: Arc<Barrier>| {
            std::thread::spawn(move || {
                let params = match json!({
                    "actor": name,
                    "attentionId": "attention-race",
                    "occurrenceId": "occurrence-race",
                }) {
                    Value::Object(map) => map,
                    _ => Map::new(),
                };
                let request = OperationRequest {
                    schema_version: 1,
                    idempotency_key: key.to_owned(),
                    run_id: Some("subject-race".to_owned()),
                    params,
                };
                barrier.wait();
                let result = ledger.apply_event_operation(
                    name,
                    &request,
                    kind,
                    json!({
                        "schema": "forged.attention-transition/1",
                        "attentionId": "attention-race",
                        "occurrenceId": "occurrence-race",
                        "actor": name,
                    }),
                    json!({"state": state}),
                );
                ledger.close().expect("close racing ledger");
                result
            })
        };
        let resolve = run(
            "attention_resolve",
            "resolve-race",
            "forged.attention.resolved",
            "resolved",
            first,
            barrier.clone(),
        );
        let acknowledge = run(
            "attention_acknowledge",
            "ack-race",
            "forged.attention.acknowledged",
            "acknowledged",
            second,
            barrier,
        );
        let resolved = resolve.join().expect("resolve thread");
        let acknowledged = acknowledge.join().expect("ack thread");
        assert!(resolved.is_ok(), "resolve remains legal: {resolved:?}");
        if let Err(error) = &acknowledged {
            assert_eq!(error.code(), ErrorCode::InvalidRequest);
        }

        let ledger = Ledger::open(&path).expect("inspect ledger");
        let transitions: Vec<_> = ledger
            .list_events(Some("subject-race"), 0, 100)
            .expect("events")
            .into_iter()
            .map(|event| event.kind)
            .collect();
        assert!(
            transitions == ["forged.attention.resolved"]
                || transitions == ["forged.attention.acknowledged", "forged.attention.resolved"],
            "resolved custody is never followed by stale acknowledgement: {transitions:?}"
        );
        ledger.close().expect("close inspector");
    }
}
