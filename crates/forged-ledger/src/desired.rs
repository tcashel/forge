//! Operator-authorized desired work and the supervisor's durable singleton
//! fence. A row is created only by successful submit settlement.

use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{column_decode_error, internal, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::operations::settle_operation;
use crate::time::now_iso;
use crate::types::{
    DesiredReconcileOutcome, DesiredReconcileUpdate, DesiredRestartReservation, DesiredState,
    DesiredSubjectKind, DesiredWorkRow,
};

use forged_types::{ErrorCode, OperationResponse};

/// Finite default; an operator can re-authorize with a fresh submit.
pub const DEFAULT_RESTART_BUDGET: u32 = 5;

pub(crate) const COLUMNS: &str = "subject_kind, subject_id, desired_state, control_revision, \
    controller_generation, predecessor_generation, restart_budget, restart_used, \
    next_wake_at, last_progress_at, last_outcome, last_error, exhausted_at, \
    reconcile_token, reconcile_lease_until, created_at, updated_at";

fn unsigned_column<T>(row: &rusqlite::Row<'_>, index: usize, what: &str) -> rusqlite::Result<T>
where
    T: TryFrom<i64>,
    <T as TryFrom<i64>>::Error: std::error::Error + Send + Sync + 'static,
{
    let raw = row.get::<_, i64>(index)?;
    T::try_from(raw).map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(
            index,
            rusqlite::types::Type::Integer,
            format!("invalid {what} {raw}: {error}").into(),
        )
    })
}

fn enum_column<T>(row: &rusqlite::Row<'_>, index: usize, what: &str) -> rusqlite::Result<T>
where
    T: for<'a> TryFrom<&'a str, Error = LedgerError>,
{
    let raw = row.get::<_, String>(index)?;
    T::try_from(raw.as_str()).map_err(|_| column_decode_error(index, what, &raw))
}

fn optional_enum_column<T>(
    row: &rusqlite::Row<'_>,
    index: usize,
    what: &str,
) -> rusqlite::Result<Option<T>>
where
    T: for<'a> TryFrom<&'a str, Error = LedgerError>,
{
    row.get::<_, Option<String>>(index)?
        .map(|raw| T::try_from(raw.as_str()).map_err(|_| column_decode_error(index, what, &raw)))
        .transpose()
}

pub(crate) fn desired_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<DesiredWorkRow> {
    Ok(DesiredWorkRow {
        subject_kind: enum_column(row, 0, "desired-work subject kind")?,
        subject_id: row.get(1)?,
        desired_state: enum_column(row, 2, "desired state")?,
        control_revision: unsigned_column(row, 3, "control revision")?,
        controller_generation: unsigned_column(row, 4, "controller generation")?,
        predecessor_generation: row
            .get::<_, Option<i64>>(5)?
            .map(u32::try_from)
            .transpose()
            .map_err(|error| {
                rusqlite::Error::FromSqlConversionFailure(
                    5,
                    rusqlite::types::Type::Integer,
                    Box::new(error),
                )
            })?,
        restart_budget: unsigned_column(row, 6, "restart budget")?,
        restart_used: unsigned_column(row, 7, "restart usage")?,
        next_wake_at: row.get(8)?,
        last_progress_at: row.get(9)?,
        last_outcome: optional_enum_column(row, 10, "desired-work outcome")?,
        last_error: row.get(11)?,
        exhausted_at: row.get(12)?,
        reconcile_token: row.get(13)?,
        reconcile_lease_until: row.get(14)?,
        created_at: row.get(15)?,
        updated_at: row.get(16)?,
    })
}

pub(crate) fn list_desired_work_tx(conn: &Connection) -> Result<Vec<DesiredWorkRow>, LedgerError> {
    let sql = format!("SELECT {COLUMNS} FROM desired_work ORDER BY subject_kind, subject_id");
    let mut statement = conn.prepare(&sql)?;
    let rows = statement.query_map([], desired_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn get_tx(
    conn: &Connection,
    kind: DesiredSubjectKind,
    id: &str,
) -> Result<Option<DesiredWorkRow>, LedgerError> {
    let sql =
        format!("SELECT {COLUMNS} FROM desired_work WHERE subject_kind = ?1 AND subject_id = ?2");
    conn.query_row(&sql, rusqlite::params![kind.as_str(), id], desired_row)
        .optional()
        .map_err(Into::into)
}

fn require_token_tx(
    conn: &Connection,
    kind: DesiredSubjectKind,
    id: &str,
    token: &str,
) -> Result<DesiredWorkRow, LedgerError> {
    let row = get_tx(conn, kind, id)?.ok_or_else(|| {
        refused(
            ErrorCode::InvalidRequest,
            format!("no desired {} {id:?}", kind.as_str()),
        )
    })?;
    if row.reconcile_token.as_deref() != Some(token) {
        return Err(refused(
            ErrorCode::OperationInProgress,
            format!(
                "desired {} {id:?} is not fenced by this tick",
                kind.as_str()
            ),
        ));
    }
    Ok(row)
}

fn authorize_tx(
    conn: &Connection,
    kind: DesiredSubjectKind,
    id: &str,
    generation: u32,
) -> Result<(), LedgerError> {
    crate::admission::release_subject_reservations_tx(
        conn,
        kind,
        id,
        "desired authorization advanced",
    )?;
    let now = now_iso();
    conn.execute(
        "INSERT INTO desired_work (
           subject_kind, subject_id, desired_state, control_revision,
           controller_generation, restart_budget, restart_used, next_wake_at,
           last_progress_at, last_outcome, created_at, updated_at
         ) VALUES (?1, ?2, 'running', 1, ?3, ?4, 0, ?5, ?5, 'authorized', ?5, ?5)
         ON CONFLICT(subject_kind, subject_id) DO UPDATE SET
           desired_state = 'running',
           control_revision = desired_work.control_revision + 1,
           controller_generation = MAX(desired_work.controller_generation, excluded.controller_generation),
           predecessor_generation = NULL,
           restart_used = 0,
           next_wake_at = excluded.next_wake_at,
           last_progress_at = excluded.last_progress_at,
           last_outcome = 'authorized',
           last_error = NULL,
           exhausted_at = NULL,
           reconcile_token = NULL,
           reconcile_lease_until = NULL,
           updated_at = excluded.updated_at",
        rusqlite::params![
            kind.as_str(),
            id,
            i64::from(generation),
            i64::from(DEFAULT_RESTART_BUDGET),
            now,
        ],
    )?;
    Ok(())
}

#[allow(clippy::too_many_arguments)]
fn append_event_transitioning_desired_tx(
    conn: &Connection,
    kind: DesiredSubjectKind,
    id: &str,
    event_kind: &str,
    payload: &serde_json::Value,
    state: DesiredState,
    outcome: DesiredReconcileOutcome,
    wake: bool,
    error: Option<&str>,
    identity_field: Option<&str>,
) -> Result<(), LedgerError> {
    let append = match identity_field {
        None => true,
        Some(field) => {
            let identity = payload
                .get(field)
                .and_then(serde_json::Value::as_str)
                .filter(|value| !value.is_empty())
                .ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        format!("event {event_kind:?} requires non-empty {field:?}"),
                    )
                })?;
            let mut statement = conn.prepare(
                "SELECT payload_json FROM events WHERE run_id = ?1 AND kind = ?2 ORDER BY event_id",
            )?;
            let rows = statement.query_map(rusqlite::params![id, event_kind], |row| {
                row.get::<_, String>(0)
            })?;
            let mut found = false;
            for raw in rows {
                let existing: serde_json::Value = serde_json::from_str(&raw?)?;
                if existing.get(field).and_then(serde_json::Value::as_str) == Some(identity) {
                    if existing != *payload {
                        return Err(refused(
                            ErrorCode::IdempotencyConflict,
                            format!(
                                "event {event_kind:?} identity {identity:?} has a different payload"
                            ),
                        ));
                    }
                    found = true;
                    break;
                }
            }
            !found
        }
    };
    if append {
        append_event_tx(conn, Some(id), event_kind, payload)?;
    }
    let now = now_iso();
    let next_wake = (wake && state == DesiredState::Running).then_some(now.clone());
    conn.execute(
        "UPDATE desired_work SET desired_state = ?1,
           control_revision = control_revision + CASE WHEN desired_state = ?1 THEN 0 ELSE 1 END,
           next_wake_at = ?2, last_outcome = ?3, last_error = ?4,
           reconcile_token = NULL, reconcile_lease_until = NULL, updated_at = ?5
         WHERE subject_kind = ?6 AND subject_id = ?7",
        rusqlite::params![
            state.as_str(),
            next_wake,
            outcome.as_str(),
            error,
            now,
            kind.as_str(),
            id,
        ],
    )?;
    crate::admission::release_subject_reservations_tx(
        conn,
        kind,
        id,
        "desired control transition",
    )?;
    Ok(())
}

/// Mark an existing authorization stopped without creating authorization for
/// legacy or never-submitted work. Used inside run settlement transactions.
pub(crate) fn stop_desired_work_tx(
    conn: &Connection,
    kind: DesiredSubjectKind,
    id: &str,
    outcome: DesiredReconcileOutcome,
) -> Result<(), LedgerError> {
    crate::admission::release_subject_reservations_tx(conn, kind, id, "desired subject stopped")?;
    let now = now_iso();
    conn.execute(
        "UPDATE desired_work SET desired_state = 'stopped',
           control_revision = control_revision + CASE WHEN desired_state = 'stopped' THEN 0 ELSE 1 END,
           next_wake_at = NULL, last_outcome = ?1, last_error = NULL,
           reconcile_token = NULL, reconcile_lease_until = NULL, updated_at = ?2
         WHERE subject_kind = ?3 AND subject_id = ?4",
        rusqlite::params![outcome.as_str(), now, kind.as_str(), id],
    )?;
    Ok(())
}

impl Ledger {
    /// Fetch one desired-work row, or `None` for never-submitted work.
    pub fn get_desired_work(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
    ) -> Result<Option<DesiredWorkRow>, LedgerError> {
        let id = id.to_owned();
        self.submit(move |conn| get_tx(conn, kind, &id))
    }

    /// All authorized subjects in canonical order.
    pub fn list_desired_work(&self) -> Result<Vec<DesiredWorkRow>, LedgerError> {
        self.submit(|conn| list_desired_work_tx(conn))
    }

    /// Running, non-exhausted rows whose persisted wake deadline is due.
    pub fn list_due_desired_work(&self, now: &str) -> Result<Vec<DesiredWorkRow>, LedgerError> {
        let now = now.to_owned();
        self.submit(move |conn| {
            let sql = format!(
                "SELECT {COLUMNS} FROM desired_work
                 WHERE desired_state = 'running' AND exhausted_at IS NULL
                   AND next_wake_at IS NOT NULL AND next_wake_at <= ?1
                 ORDER BY next_wake_at, subject_kind, subject_id"
            );
            let mut statement = conn.prepare(&sql)?;
            let rows = statement.query_map([now], desired_row)?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }

    /// Earliest persisted wake for the foreground loop.
    pub fn earliest_desired_wake(&self, now: &str) -> Result<Option<String>, LedgerError> {
        let now = now.to_owned();
        self.submit(move |conn| {
            conn.query_row(
                "SELECT MIN(wake_at) FROM (
                   SELECT CASE
                     WHEN reconcile_token IS NOT NULL AND reconcile_lease_until > ?1
                       THEN reconcile_lease_until
                     ELSE next_wake_at END AS wake_at
                   FROM desired_work
                   WHERE desired_state = 'running' AND exhausted_at IS NULL
                   UNION ALL
                   SELECT recovery_deadline AS wake_at FROM admission_reservations
                   WHERE state IN ('reserved','active')
                     AND NOT (owner_kind = 'attempt' AND EXISTS (
                       SELECT 1 FROM attempts a
                       WHERE CAST(a.attempt_id AS TEXT) = admission_reservations.owner_id
                         AND a.state IN ('running','revoking')))
                 )",
                [now],
                |row| row.get(0),
            )
            .map_err(Into::into)
        })
    }

    /// Direct authorization for a verified live legacy controller. Normal
    /// fresh submissions use the atomic operation-settlement method below.
    pub fn authorize_desired_work(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        generation: u32,
    ) -> Result<DesiredWorkRow, LedgerError> {
        let id = id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            authorize_tx(&tx, kind, &id, generation)?;
            let row = get_tx(&tx, kind, &id)?.ok_or_else(|| internal("authorization vanished"))?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Backfill only a missing desired row when replaying a pre-011 submit;
    /// an existing pause/stop/budget is never overwritten by an old key.
    pub fn ensure_desired_work(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        generation: u32,
    ) -> Result<DesiredWorkRow, LedgerError> {
        let id = id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            if get_tx(&tx, kind, &id)?.is_none() {
                authorize_tx(&tx, kind, &id, generation)?;
            }
            let row = get_tx(&tx, kind, &id)?.ok_or_else(|| internal("authorization vanished"))?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Atomically seal a successful submit operation and authorize its
    /// subject. If either write fails, neither becomes durable.
    pub fn complete_operation_authorizing_desired(
        &self,
        operation_id: &str,
        response: &OperationResponse,
        kind: DesiredSubjectKind,
        id: &str,
        generation: u32,
    ) -> Result<(), LedgerError> {
        self.complete_operation_authorizing_desired_with_admission(
            operation_id,
            response,
            kind,
            id,
            generation,
            None,
            None,
        )
    }

    /// Atomic submit settlement with an optional persisted admission wake.
    #[allow(clippy::too_many_arguments)]
    pub fn complete_operation_authorizing_desired_with_admission(
        &self,
        operation_id: &str,
        response: &OperationResponse,
        kind: DesiredSubjectKind,
        id: &str,
        generation: u32,
        queued_until: Option<String>,
        admission_reason: Option<String>,
    ) -> Result<(), LedgerError> {
        let operation_id = operation_id.to_owned();
        let response = response.clone();
        let id = id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            settle_operation(&tx, &operation_id, &response, true)?;
            authorize_tx(&tx, kind, &id, generation)?;
            if let Some(wake) = queued_until {
                let now = now_iso();
                tx.execute(
                    "UPDATE desired_work SET next_wake_at = ?1, last_error = ?2, updated_at = ?3 \
                     WHERE subject_kind = ?4 AND subject_id = ?5",
                    rusqlite::params![wake, admission_reason, now, kind.as_str(), id],
                )?;
            }
            tx.commit()?;
            Ok(())
        })
    }

    /// Crash recovery twin of `complete_operation_authorizing_desired`.
    pub fn resolve_interrupted_operation_authorizing_desired(
        &self,
        operation_id: &str,
        response: &OperationResponse,
        kind: DesiredSubjectKind,
        id: &str,
        generation: u32,
    ) -> Result<(), LedgerError> {
        let operation_id = operation_id.to_owned();
        let response = response.clone();
        let id = id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            settle_operation(&tx, &operation_id, &response, false)?;
            authorize_tx(&tx, kind, &id, generation)?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Append an epic control event and update existing desired intent in one
    /// transaction. No desired row is created for an unsubmitted epic.
    pub fn append_event_controlling_desired(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        event_kind: &str,
        payload: serde_json::Value,
        state: DesiredState,
    ) -> Result<(), LedgerError> {
        let id = id.to_owned();
        let event_kind = event_kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let outcome = match state {
                DesiredState::Running => DesiredReconcileOutcome::Authorized,
                DesiredState::Paused => DesiredReconcileOutcome::Paused,
                DesiredState::Stopped => DesiredReconcileOutcome::Stopped,
            };
            append_event_transitioning_desired_tx(
                &tx,
                kind,
                &id,
                &event_kind,
                &payload,
                state,
                outcome,
                state == DesiredState::Running,
                None,
                Some("controlId"),
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Atomically append a scheduler stop/resolution event and update any
    /// existing desired authorization. Unlike control transitions, repeated
    /// payloads are legitimate after an intervening resolution and are never
    /// globally deduplicated.
    #[allow(clippy::too_many_arguments)]
    pub fn append_event_settling_desired(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        event_kind: &str,
        payload: serde_json::Value,
        state: DesiredState,
        outcome: DesiredReconcileOutcome,
        wake: bool,
        error: Option<String>,
        identity_field: Option<&str>,
    ) -> Result<(), LedgerError> {
        let id = id.to_owned();
        let event_kind = event_kind.to_owned();
        let identity_field = identity_field.map(str::to_owned);
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            append_event_transitioning_desired_tx(
                &tx,
                kind,
                &id,
                &event_kind,
                &payload,
                state,
                outcome,
                wake,
                error.as_deref(),
                identity_field.as_deref(),
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Claim one due row across processes/hosts. The lease is persisted so a
    /// crashed supervisor cannot wedge the subject forever.
    pub fn claim_desired_work(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<Option<DesiredWorkRow>, LedgerError> {
        let id = id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let affected = tx.execute(
                "UPDATE desired_work SET reconcile_token = ?1, reconcile_lease_until = ?2,
                   updated_at = ?3
                 WHERE subject_kind = ?4 AND subject_id = ?5
                   AND desired_state = 'running' AND exhausted_at IS NULL
                   AND next_wake_at IS NOT NULL AND next_wake_at <= ?3
                   AND (reconcile_token IS NULL OR reconcile_lease_until IS NULL
                        OR reconcile_lease_until <= ?3)",
                rusqlite::params![token, lease_until, now, kind.as_str(), id],
            )?;
            let row = if affected == 1 {
                get_tx(&tx, kind, &id)?
            } else {
                None
            };
            tx.commit()?;
            Ok(row)
        })
    }

    /// Claim a desired row for an operator control transition. Unlike a
    /// pass claim, a paused or parked row is eligible; the shared token lease
    /// serializes epic start, revision, and resume with ore reconciliation.
    pub fn claim_desired_control(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<Option<DesiredWorkRow>, LedgerError> {
        let id = id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let affected = tx.execute(
                "UPDATE desired_work SET reconcile_token = ?1, reconcile_lease_until = ?2,
                   updated_at = ?3
                 WHERE subject_kind = ?4 AND subject_id = ?5
                   AND (reconcile_token IS NULL OR reconcile_lease_until IS NULL
                        OR reconcile_lease_until <= ?3)",
                rusqlite::params![token, lease_until, now, kind.as_str(), id],
            )?;
            let row = if affected == 1 {
                get_tx(&tx, kind, &id)?
            } else {
                None
            };
            tx.commit()?;
            Ok(row)
        })
    }

    /// Release an operator control claim that did not land its transition.
    /// A transition or rival epoch that already replaced the token wins.
    pub fn release_desired_claim(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        token: &str,
    ) -> Result<(), LedgerError> {
        let id = id.to_owned();
        let token = token.to_owned();
        self.submit(move |conn| {
            conn.execute(
                "UPDATE desired_work SET reconcile_token = NULL, reconcile_lease_until = NULL,
                   updated_at = ?1
                 WHERE subject_kind = ?2 AND subject_id = ?3 AND reconcile_token = ?4",
                rusqlite::params![now_iso(), kind.as_str(), id, token],
            )?;
            Ok(())
        })
    }

    /// Reserve the only generation this tick may spawn, charging the finite
    /// budget only when this is a recovery. Exhaustion is durable and emits
    /// one attention event.
    pub fn reserve_desired_restart(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        token: &str,
        observed_generation: u32,
    ) -> Result<DesiredRestartReservation, LedgerError> {
        let id = id.to_owned();
        let token = token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let row = require_token_tx(&tx, kind, &id, &token)?;
            if row.desired_state != DesiredState::Running {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    format!("desired {} {id:?} changed while reconciling", kind.as_str()),
                ));
            }
            let now = now_iso();
            let charges_restart =
                row.last_outcome != Some(DesiredReconcileOutcome::Authorized);
            if charges_restart && row.restart_used >= row.restart_budget {
                let first = row.exhausted_at.is_none();
                tx.execute(
                    "UPDATE desired_work SET last_outcome = 'exhausted', exhausted_at = COALESCE(exhausted_at, ?1),
                       next_wake_at = NULL, reconcile_token = NULL, reconcile_lease_until = NULL,
                       updated_at = ?1 WHERE subject_kind = ?2 AND subject_id = ?3",
                    rusqlite::params![now, kind.as_str(), id],
                )?;
                if first {
                    append_event_tx(
                        &tx,
                        Some(&id),
                        "forged.supervisor.attention",
                        &json!({
                            "schemaVersion": 1,
                            "subjectKind": kind.as_str(),
                            "subjectId": id,
                            "condition": "restart-budget-exhausted",
                            "detail": row.last_error,
                            "restartBudget": row.restart_budget,
                            "restartUsed": row.restart_used,
                        }),
                    )?;
                }
                let exhausted = get_tx(&tx, kind, &id)?
                    .ok_or_else(|| internal("exhausted desired row vanished"))?;
                tx.commit()?;
                return Ok(DesiredRestartReservation::Exhausted(exhausted));
            }
            let generation = row
                .controller_generation
                .max(observed_generation)
                .saturating_add(1);
            // `last_error` survives the reservation: the previous death's
            // evidence is what the exhaustion attention will surface, and
            // nulling it here is how the incident record degraded to the
            // bare literal "restart budget is exhausted".
            tx.execute(
                "UPDATE desired_work SET controller_generation = ?1,
                   predecessor_generation = ?2, restart_used = restart_used + ?3,
                   last_outcome = 'restarting',
                   next_wake_at = reconcile_lease_until,
                   updated_at = ?4 WHERE subject_kind = ?5 AND subject_id = ?6
                   AND reconcile_token = ?7",
                rusqlite::params![
                    i64::from(generation),
                    i64::from(observed_generation),
                    i64::from(charges_restart),
                    now,
                    kind.as_str(),
                    id,
                    token,
                ],
            )?;
            let reserved = get_tx(&tx, kind, &id)?
                .ok_or_else(|| internal("reserved desired row vanished"))?;
            tx.commit()?;
            Ok(DesiredRestartReservation::Reserved(reserved))
        })
    }

    /// Finish one claimed tick, releasing its cross-process fence. Attention
    /// is append-only and de-duplicated by the standing outcome/error pair.
    pub fn finish_desired_reconciliation(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        token: &str,
        update: DesiredReconcileUpdate,
    ) -> Result<DesiredWorkRow, LedgerError> {
        let id = id.to_owned();
        let token = token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = require_token_tx(&tx, kind, &id, &token)?;
            let state = update.desired_state.unwrap_or(before.desired_state);
            let revision_delta = i64::from(state != before.desired_state);
            let generation = update
                .controller_generation
                .unwrap_or(before.controller_generation);
            let now = now_iso();
            let exhausted_at =
                (update.outcome == DesiredReconcileOutcome::Exhausted).then_some(now.clone());
            let attention_detail = update.last_error.clone();
            let should_append_attention = update.attention_condition.is_some()
                && (before.last_outcome != Some(update.outcome)
                    || before.last_error != attention_detail);
            let should_append_restart = update.outcome == DesiredReconcileOutcome::Restarted
                && before.last_outcome == Some(DesiredReconcileOutcome::Restarting);
            tx.execute(
                "UPDATE desired_work SET desired_state = ?1,
                   control_revision = control_revision + ?2,
                   controller_generation = ?3, predecessor_generation = ?4,
                   next_wake_at = ?5, last_progress_at = COALESCE(?6, last_progress_at),
                   last_outcome = ?7, last_error = ?8,
                   exhausted_at = CASE WHEN ?7 = 'exhausted' THEN COALESCE(exhausted_at, ?9)
                                       WHEN ?1 = 'running' THEN NULL ELSE exhausted_at END,
                   reconcile_token = NULL, reconcile_lease_until = NULL, updated_at = ?10
                 WHERE subject_kind = ?11 AND subject_id = ?12 AND reconcile_token = ?13",
                rusqlite::params![
                    state.as_str(),
                    revision_delta,
                    i64::from(generation),
                    update.predecessor_generation.map(i64::from),
                    update.next_wake_at,
                    update.last_progress_at,
                    update.outcome.as_str(),
                    update.last_error,
                    exhausted_at,
                    now,
                    kind.as_str(),
                    id,
                    token,
                ],
            )?;
            if state != DesiredState::Running {
                crate::admission::release_subject_reservations_tx(
                    &tx,
                    kind,
                    &id,
                    "supervisor settled desired subject",
                )?;
            }
            if should_append_attention {
                append_event_tx(
                    &tx,
                    Some(&id),
                    "forged.supervisor.attention",
                    &json!({
                        "schemaVersion": 1,
                        "subjectKind": kind.as_str(),
                        "subjectId": id,
                        "condition": update.attention_condition,
                        "detail": attention_detail,
                        "controllerGeneration": generation,
                        "restartBudget": before.restart_budget,
                        "restartUsed": before.restart_used,
                    }),
                )?;
            }
            if should_append_restart {
                append_event_tx(
                    &tx,
                    Some(&id),
                    "forged.supervisor.restarted",
                    &json!({
                        "schemaVersion": 1,
                        "subjectKind": kind.as_str(),
                        "subjectId": id,
                        "predecessorGeneration": update.predecessor_generation,
                        "controllerGeneration": generation,
                        "restartBudget": before.restart_budget,
                        "restartUsed": before.restart_used,
                    }),
                )?;
            }
            let row = get_tx(&tx, kind, &id)?
                .ok_or_else(|| internal("reconciled desired row vanished"))?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Park or transition an existing desired row outside a supervisor claim,
    /// used when foreground drive itself reaches a durable stop.
    pub fn record_desired_outcome(
        &self,
        kind: DesiredSubjectKind,
        id: &str,
        state: DesiredState,
        outcome: DesiredReconcileOutcome,
        next_wake_at: Option<String>,
        error: Option<String>,
    ) -> Result<(), LedgerError> {
        let id = id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let Some(before) = get_tx(&tx, kind, &id)? else {
                tx.commit()?;
                return Ok(());
            };
            let now = now_iso();
            tx.execute(
                "UPDATE desired_work SET desired_state = ?1,
                   control_revision = control_revision + ?2, next_wake_at = ?3,
                   last_outcome = ?4, last_error = ?5, reconcile_token = NULL,
                   reconcile_lease_until = NULL, updated_at = ?6
                 WHERE subject_kind = ?7 AND subject_id = ?8",
                rusqlite::params![
                    state.as_str(),
                    i64::from(state != before.desired_state),
                    next_wake_at,
                    outcome.as_str(),
                    error,
                    now,
                    kind.as_str(),
                    id,
                ],
            )?;
            if state != DesiredState::Running {
                crate::admission::release_subject_reservations_tx(
                    &tx,
                    kind,
                    &id,
                    "foreground settled desired subject",
                )?;
            }
            tx.commit()?;
            Ok(())
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{NewRun, RunOutcome};
    use forged_types::{OperationRequest, RunId};
    use serde_json::{json, Map};

    fn request(key: &str, run: &str) -> OperationRequest {
        OperationRequest {
            schema_version: 1,
            idempotency_key: key.to_owned(),
            run_id: Some(run.to_owned()),
            params: match json!({"run": run}) {
                serde_json::Value::Object(map) => map,
                _ => Map::new(),
            },
        }
    }

    #[test]
    fn submit_completion_and_authorization_commit_together() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let req = request("submit-1", "run-1");
        let ticket = match ledger
            .begin_operation("run_submit", &req, crate::EffectClass::SafeRetry, None)
            .expect("begin")
        {
            crate::OperationOutcome::Fresh(ticket) => ticket,
            other => panic!("unexpected {other:?}"),
        };
        let response = forged_types::OperationResponse {
            operation_id: ticket.operation_id.clone(),
            ok: true,
            reused: false,
            result: Some(json!({"submitted": true})),
            error: None,
        };
        ledger
            .complete_operation_authorizing_desired(
                &ticket.operation_id,
                &response,
                DesiredSubjectKind::Run,
                "run-1",
                1,
            )
            .expect("complete and authorize");
        let row = ledger
            .get_desired_work(DesiredSubjectKind::Run, "run-1")
            .expect("query")
            .expect("desired row");
        assert_eq!(row.desired_state, DesiredState::Running);
        assert_eq!(row.controller_generation, 1);
        assert_eq!(row.restart_budget, DEFAULT_RESTART_BUDGET);
        assert_eq!(row.restart_used, 0);
        assert!(row.next_wake_at.is_some());
    }

    #[test]
    fn cross_process_claim_and_restart_budget_are_singleton() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let first = Ledger::open(&path).expect("first");
        let second = Ledger::open(&path).expect("second");
        first
            .authorize_desired_work(DesiredSubjectKind::Epic, "epic-1", 1)
            .expect("authorize");
        let now = "2030-01-01T00:00:00.000000000Z";
        let lease = "2030-01-01T00:01:00.000000000Z";
        let won = first
            .claim_desired_work(DesiredSubjectKind::Epic, "epic-1", "tick-a", now, lease)
            .expect("claim")
            .expect("winner");
        assert_eq!(won.reconcile_token.as_deref(), Some("tick-a"));
        assert!(second
            .claim_desired_work(DesiredSubjectKind::Epic, "epic-1", "tick-b", now, lease)
            .expect("loser")
            .is_none());
        let reserved = first
            .reserve_desired_restart(DesiredSubjectKind::Epic, "epic-1", "tick-a", 1)
            .expect("reserve");
        let DesiredRestartReservation::Reserved(row) = reserved else {
            panic!("budget unexpectedly exhausted")
        };
        assert_eq!(row.controller_generation, 2);
        assert_eq!(row.predecessor_generation, Some(1));
        assert_eq!(row.restart_used, 0, "the first launch is not a restart");
        first
            .finish_desired_reconciliation(
                DesiredSubjectKind::Epic,
                "epic-1",
                "tick-a",
                DesiredReconcileUpdate {
                    desired_state: None,
                    outcome: DesiredReconcileOutcome::Backoff,
                    controller_generation: None,
                    predecessor_generation: Some(1),
                    next_wake_at: Some("2030-01-01T00:00:05.000000000Z".to_owned()),
                    last_progress_at: None,
                    last_error: Some("spawn failed".to_owned()),
                    attention_condition: None,
                },
            )
            .expect("finish");
    }

    #[test]
    fn restart_budget_counts_recoveries_and_resets_to_a_free_first_launch() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let run = "run-recovery-budget";
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, run, 0)
            .expect("authorize");

        for launch in 0..=DEFAULT_RESTART_BUDGET {
            let token = format!("recovery-budget-{launch}");
            let claimed = ledger
                .claim_desired_work(
                    DesiredSubjectKind::Run,
                    run,
                    &token,
                    "2099-01-01T00:00:00.000000000Z",
                    "2099-01-01T00:01:00.000000000Z",
                )
                .expect("claim")
                .expect("due desired row");
            let reserved = ledger
                .reserve_desired_restart(
                    DesiredSubjectKind::Run,
                    run,
                    &token,
                    claimed.controller_generation,
                )
                .expect("reserve");
            let DesiredRestartReservation::Reserved(reserved) = reserved else {
                panic!("launch {launch} exhausted before the configured recovery count")
            };
            assert_eq!(
                reserved.restart_used, launch,
                "launch zero is free and each later launch is one recovery"
            );
            ledger
                .finish_desired_reconciliation(
                    DesiredSubjectKind::Run,
                    run,
                    &token,
                    DesiredReconcileUpdate {
                        desired_state: None,
                        outcome: DesiredReconcileOutcome::Backoff,
                        controller_generation: Some(reserved.controller_generation),
                        predecessor_generation: reserved.predecessor_generation,
                        next_wake_at: Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                        last_progress_at: None,
                        last_error: Some("fixture controller remained dead".to_owned()),
                        attention_condition: None,
                    },
                )
                .expect("finish launch");
        }

        let token = "recovery-budget-exhausted";
        let claimed = ledger
            .claim_desired_work(
                DesiredSubjectKind::Run,
                run,
                token,
                "2099-01-01T00:00:00.000000000Z",
                "2099-01-01T00:01:00.000000000Z",
            )
            .expect("claim exhaustion")
            .expect("exhaustion is due");
        let exhausted = ledger
            .reserve_desired_restart(
                DesiredSubjectKind::Run,
                run,
                token,
                claimed.controller_generation,
            )
            .expect("reserve exhaustion");
        let DesiredRestartReservation::Exhausted(exhausted) = exhausted else {
            panic!("one more recovery exceeded the configured budget")
        };
        assert_eq!(exhausted.restart_used, DEFAULT_RESTART_BUDGET);
        assert_eq!(
            ledger
                .list_events(Some(run), 0, 65_536)
                .expect("events")
                .iter()
                .filter(|event| {
                    event.kind == "forged.supervisor.attention"
                        && event.payload_json.contains("restart-budget-exhausted")
                })
                .count(),
            1
        );

        ledger
            .authorize_desired_work(
                DesiredSubjectKind::Run,
                run,
                exhausted.controller_generation,
            )
            .expect("reauthorize");
        let token = "recovery-budget-reauthorized";
        let claimed = ledger
            .claim_desired_work(
                DesiredSubjectKind::Run,
                run,
                token,
                "2099-01-01T00:00:00.000000000Z",
                "2099-01-01T00:01:00.000000000Z",
            )
            .expect("claim reauthorization")
            .expect("reauthorization is due");
        let relaunched = ledger
            .reserve_desired_restart(
                DesiredSubjectKind::Run,
                run,
                token,
                claimed.controller_generation,
            )
            .expect("reserve reauthorized launch");
        let DesiredRestartReservation::Reserved(relaunched) = relaunched else {
            panic!("reauthorized first launch must be free")
        };
        assert_eq!(relaunched.restart_used, 0);
    }

    #[test]
    fn a_crash_after_restart_reservation_becomes_due_at_lease_expiry() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        {
            let ledger = Ledger::open(&path).expect("first process");
            ledger
                .authorize_desired_work(DesiredSubjectKind::Run, "run-crash", 1)
                .expect("authorize");
            ledger
                .claim_desired_work(
                    DesiredSubjectKind::Run,
                    "run-crash",
                    "dead-tick",
                    "2030-01-01T00:00:00.000000000Z",
                    "2030-01-01T00:01:00.000000000Z",
                )
                .expect("claim")
                .expect("won");
            let reservation = ledger
                .reserve_desired_restart(DesiredSubjectKind::Run, "run-crash", "dead-tick", 1)
                .expect("reserve");
            let DesiredRestartReservation::Reserved(row) = reservation else {
                panic!("unexpected exhaustion")
            };
            assert_eq!(
                row.next_wake_at.as_deref(),
                Some("2030-01-01T00:01:00.000000000Z")
            );
            assert_eq!(
                ledger
                    .earliest_desired_wake("2030-01-01T00:00:30.000000000Z")
                    .expect("foreground wake"),
                Some("2030-01-01T00:01:00.000000000Z".to_owned()),
                "a live reservation sleeps until its lease instead of hot-spinning"
            );
            ledger.close().expect("crashed process closes in the test");
        }
        let successor = Ledger::open(&path).expect("successor process");
        assert!(successor
            .claim_desired_work(
                DesiredSubjectKind::Run,
                "run-crash",
                "early-tick",
                "2030-01-01T00:00:59.999999999Z",
                "2030-01-01T00:02:00.000000000Z",
            )
            .expect("early claim")
            .is_none());
        assert!(successor
            .claim_desired_work(
                DesiredSubjectKind::Run,
                "run-crash",
                "successor-tick",
                "2030-01-01T00:01:00.000000000Z",
                "2030-01-01T00:02:00.000000000Z",
            )
            .expect("expired claim")
            .is_some());
    }

    #[test]
    fn epic_controls_are_typed_and_never_authorize_an_unsubmitted_epic() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        ledger
            .append_event_controlling_desired(
                DesiredSubjectKind::Epic,
                "never-submitted",
                "forged.epic.paused",
                json!({"reason": "hold", "controlId": "pause-never-1"}),
                DesiredState::Paused,
            )
            .expect("unsubmitted pause still records its epic event");
        assert!(ledger
            .get_desired_work(DesiredSubjectKind::Epic, "never-submitted")
            .expect("query")
            .is_none());

        ledger
            .authorize_desired_work(DesiredSubjectKind::Epic, "epic-controls", 1)
            .expect("authorize");
        ledger
            .append_event_controlling_desired(
                DesiredSubjectKind::Epic,
                "epic-controls",
                "forged.epic.paused",
                json!({"reason": "checkpoint", "controlId": "pause-1"}),
                DesiredState::Paused,
            )
            .expect("pause");
        let paused = ledger
            .get_desired_work(DesiredSubjectKind::Epic, "epic-controls")
            .expect("query")
            .expect("desired");
        assert_eq!(paused.desired_state, DesiredState::Paused);
        assert_eq!(paused.control_revision, 2);
        assert!(paused.next_wake_at.is_none());

        ledger
            .append_event_controlling_desired(
                DesiredSubjectKind::Epic,
                "epic-controls",
                "forged.epic.resumed",
                json!({"reason": "continue", "controlId": "resume-1"}),
                DesiredState::Running,
            )
            .expect("resume");
        let resumed = ledger
            .get_desired_work(DesiredSubjectKind::Epic, "epic-controls")
            .expect("query")
            .expect("desired");
        assert_eq!(resumed.desired_state, DesiredState::Running);
        assert_eq!(resumed.control_revision, 3);
        assert!(resumed.next_wake_at.is_some());

        // An input-required projection parks the row without revoking its
        // authorization. Resume makes it due, but the next supervisor tick
        // must project the still-standing input event and park it again.
        ledger
            .record_desired_outcome(
                DesiredSubjectKind::Epic,
                "epic-controls",
                DesiredState::Running,
                DesiredReconcileOutcome::Attention,
                None,
                Some("input unresolved".to_owned()),
            )
            .expect("park on input");
        assert!(ledger
            .get_desired_work(DesiredSubjectKind::Epic, "epic-controls")
            .expect("query")
            .expect("desired")
            .next_wake_at
            .is_none());
        ledger
            .append_event_controlling_desired(
                DesiredSubjectKind::Epic,
                "epic-controls",
                "forged.epic.resumed",
                json!({
                    "reason": "retry while input remains",
                    "controlId": "resume-2",
                }),
                DesiredState::Running,
            )
            .expect("resume reconsiders");
        assert!(ledger
            .get_desired_work(DesiredSubjectKind::Epic, "epic-controls")
            .expect("query")
            .expect("desired")
            .next_wake_at
            .is_some());

        let claimed = ledger
            .claim_desired_work(
                DesiredSubjectKind::Epic,
                "epic-controls",
                "stale-input-observer",
                "9999-01-01T00:00:00.000000000Z",
                "9999-01-01T00:01:00.000000000Z",
            )
            .expect("claim due unresolved input")
            .expect("claim");
        assert_eq!(
            claimed.reconcile_token.as_deref(),
            Some("stale-input-observer")
        );
        ledger
            .append_event_settling_desired(
                DesiredSubjectKind::Epic,
                "epic-controls",
                "forged.epic.input.resolved",
                json!({
                    "childId": "child-1",
                    "note": "resolved",
                    "resolutionId": "resolve-op-1",
                }),
                DesiredState::Running,
                DesiredReconcileOutcome::Authorized,
                true,
                None,
                Some("resolutionId"),
            )
            .expect("resolution event and wake commit together");
        assert!(ledger
            .finish_desired_reconciliation(
                DesiredSubjectKind::Epic,
                "epic-controls",
                "stale-input-observer",
                DesiredReconcileUpdate {
                    desired_state: None,
                    outcome: DesiredReconcileOutcome::Attention,
                    controller_generation: None,
                    predecessor_generation: None,
                    next_wake_at: None,
                    last_progress_at: None,
                    last_error: Some("stale input observation".to_owned()),
                    attention_condition: Some("controller-dead".to_owned()),
                },
            )
            .is_err());
        let resolved = ledger
            .get_desired_work(DesiredSubjectKind::Epic, "epic-controls")
            .expect("query")
            .expect("desired");
        assert_eq!(
            resolved.last_outcome,
            Some(DesiredReconcileOutcome::Authorized)
        );
        assert!(resolved.next_wake_at.is_some());
        let replay = json!({
            "childId": "child-1",
            "note": "resolved",
            "resolutionId": "resolve-op-1",
        });
        ledger
            .append_event_settling_desired(
                DesiredSubjectKind::Epic,
                "epic-controls",
                "forged.epic.input.resolved",
                replay,
                DesiredState::Running,
                DesiredReconcileOutcome::Authorized,
                true,
                None,
                Some("resolutionId"),
            )
            .expect("same resolution identity replays");
        ledger
            .append_event_settling_desired(
                DesiredSubjectKind::Epic,
                "epic-controls",
                "forged.epic.input.resolved",
                json!({
                    "childId": "child-1",
                    "note": "resolved",
                    "resolutionId": "resolve-op-2",
                }),
                DesiredState::Running,
                DesiredReconcileOutcome::Authorized,
                true,
                None,
                Some("resolutionId"),
            )
            .expect("later same-note resolution has a distinct identity");
        let resolution_events = ledger
            .list_events(Some("epic-controls"), 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "forged.epic.input.resolved")
            .count();
        assert_eq!(resolution_events, 2);
    }

    #[test]
    fn operator_control_claims_serialize_with_epic_reconciliation() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        ledger
            .authorize_desired_work(DesiredSubjectKind::Epic, "epic-serialized", 0)
            .expect("authorize");
        assert!(ledger
            .claim_desired_work(
                DesiredSubjectKind::Epic,
                "epic-serialized",
                "ore-pass",
                "9999-01-01T00:00:00.000000000Z",
                "9999-01-01T00:01:00.000000000Z",
            )
            .expect("ore claim")
            .is_some());
        assert!(ledger
            .claim_desired_control(
                DesiredSubjectKind::Epic,
                "epic-serialized",
                "resume-control",
                "9999-01-01T00:00:00.000000000Z",
                "9999-01-01T00:01:00.000000000Z",
            )
            .expect("contended control claim")
            .is_none());
        ledger
            .release_desired_claim(DesiredSubjectKind::Epic, "epic-serialized", "ore-pass")
            .expect("release ore claim");
        assert!(ledger
            .claim_desired_control(
                DesiredSubjectKind::Epic,
                "epic-serialized",
                "resume-control",
                "9999-01-01T00:00:00.000000000Z",
                "9999-01-01T00:01:00.000000000Z",
            )
            .expect("control claim")
            .is_some());
        assert!(ledger
            .claim_desired_work(
                DesiredSubjectKind::Epic,
                "epic-serialized",
                "rival-ore-pass",
                "9999-01-01T00:00:30.000000000Z",
                "9999-01-01T00:02:00.000000000Z",
            )
            .expect("contended ore claim")
            .is_none());
        ledger
            .append_event_controlling_desired(
                DesiredSubjectKind::Epic,
                "epic-serialized",
                "forged.epic.resumed",
                json!({"reason": "continue", "controlId": "resume-1"}),
                DesiredState::Running,
            )
            .expect("land control transition");
        assert!(ledger
            .get_desired_work(DesiredSubjectKind::Epic, "epic-serialized")
            .expect("desired lookup")
            .expect("desired row")
            .reconcile_token
            .is_none());
    }

    #[test]
    fn terminal_run_settlement_stops_existing_desired_work_atomically() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        ledger
            .create_run(NewRun {
                run_id: RunId::new("run-terminal").expect("run id"),
                work_id: "bead-terminal".to_owned(),
                repo: "/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: "forged/run-terminal".to_owned(),
            })
            .expect("create run");
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, "run-terminal", 2)
            .expect("authorize");
        ledger
            .settle_run(
                "run-terminal",
                RunOutcome::Clean,
                "reviewed and clean".to_owned(),
                None,
                None,
                None,
            )
            .expect("settle");
        let desired = ledger
            .get_desired_work(DesiredSubjectKind::Run, "run-terminal")
            .expect("query")
            .expect("desired");
        assert_eq!(desired.desired_state, DesiredState::Stopped);
        assert_eq!(
            desired.last_outcome,
            Some(DesiredReconcileOutcome::Terminal)
        );
        assert!(desired.next_wake_at.is_none());
    }

    #[test]
    fn row_decoding_rejects_unknown_closed_values() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = Ledger::open(&path).expect("ledger");
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, "run-corrupt", 1)
            .expect("authorize");
        ledger.close().expect("close");
        let conn = rusqlite::Connection::open(&path).expect("raw");
        conn.execute_batch("PRAGMA ignore_check_constraints=ON;")
            .expect("test-only corruption mode");
        conn.execute(
            "UPDATE desired_work SET desired_state = 'future' WHERE subject_id = 'run-corrupt'",
            [],
        )
        .expect("corrupt closed value");
        drop(conn);
        let ledger = Ledger::open(&path).expect("reopen");
        let error = ledger
            .get_desired_work(DesiredSubjectKind::Run, "run-corrupt")
            .expect_err("unknown state must fail closed");
        assert_eq!(error.code(), ErrorCode::Internal);
        assert!(error.to_string().contains("unknown desired state"));
    }
}
