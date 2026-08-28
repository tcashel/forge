//! Durable retry state for pending whole-run bead settlement — the mirror
//! of `desired_work` for the one external promise `run stop` can leave owed.
//!
//! Discovery is positional, never a bare pending scan: a run is owed work
//! only while its LATEST bead-settlement event is `pending`, so a later
//! `succeeded` retires it at the stream itself and no pass can race a
//! settlement that already converged. The conditional appends below carry a
//! stronger fence: each requires the stream head to still BE the exact
//! pending event the pass discovered, so a pass racing a newer run-stop
//! episode can neither retire nor shadow a promise it never probed.

use rusqlite::{Connection, OptionalExtension, TransactionBehavior};

use crate::error::{refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{BeadSettlementRetryRow, PendingBeadSettlementRow};

use forged_types::ErrorCode;

const PENDING: &str = "run.bead-settlement.pending";
const SUCCEEDED: &str = "run.bead-settlement.succeeded";

/// Mutating-retry budget. With the supervisor's 30s-doubling backoff capped
/// at 8 minutes, eight charges span well past the 5+ minute work lease TTL
/// that motivates the retry in the first place.
pub const BEAD_SETTLEMENT_RETRY_BUDGET: u32 = 8;

/// What a finished executor does to the retry row's stored `last_error` —
/// explicit three-state so a converged exit cannot accidentally preserve a
/// stale failure string and a no-op exit cannot accidentally erase one.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RetryErrorUpdate {
    /// A no-op exit (superseded, contended re-check): the row's error still
    /// describes the last real attempt.
    Keep,
    /// A converged or settled exit: no failure stands any more.
    Clear,
    /// A failed attempt: record its error.
    Set(String),
}

const COLUMNS: &str = "run_id, budget, used, next_wake_at, last_error, \
    claim_token, claim_lease_until, event_id, probe_wake_at, probe_interval_s, \
    last_observed_status, last_observed_assignee, last_observed_revision, \
    created_at, updated_at";

fn retry_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<BeadSettlementRetryRow> {
    let unsigned = |index: usize, raw: i64| {
        u32::try_from(raw).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                index,
                rusqlite::types::Type::Integer,
                Box::new(error),
            )
        })
    };
    Ok(BeadSettlementRetryRow {
        run_id: row.get(0)?,
        budget: unsigned(1, row.get(1)?)?,
        used: unsigned(2, row.get(2)?)?,
        next_wake_at: row.get(3)?,
        last_error: row.get(4)?,
        claim_token: row.get(5)?,
        claim_lease_until: row.get(6)?,
        event_id: row.get(7)?,
        probe_wake_at: row.get(8)?,
        probe_interval_s: row
            .get::<_, Option<i64>>(9)?
            .map(|raw| unsigned(9, raw))
            .transpose()?,
        last_observed_status: row.get(10)?,
        last_observed_assignee: row.get(11)?,
        last_observed_revision: row.get(12)?,
        created_at: row.get(13)?,
        updated_at: row.get(14)?,
    })
}

fn get_tx(conn: &Connection, run_id: &str) -> Result<Option<BeadSettlementRetryRow>, LedgerError> {
    let sql = format!("SELECT {COLUMNS} FROM bead_settlement_retry WHERE run_id = ?1");
    conn.query_row(&sql, [run_id], retry_row)
        .optional()
        .map_err(Into::into)
}

/// The run's newest bead-settlement event, if any:
/// `(event_id, kind, payload_json)`.
fn latest_settlement_tx(
    conn: &Connection,
    run_id: &str,
) -> Result<Option<(i64, String, String)>, LedgerError> {
    conn.query_row(
        "SELECT event_id, kind, payload_json FROM events \
         WHERE run_id = ?1 AND kind IN (?2, ?3) \
         ORDER BY event_id DESC LIMIT 1",
        rusqlite::params![run_id, PENDING, SUCCEEDED],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
    )
    .optional()
    .map_err(Into::into)
}

impl Ledger {
    /// Every run whose latest bead-settlement event is still `pending`, with
    /// that event's stored payload, in run order.
    pub fn list_pending_bead_settlements(
        &self,
    ) -> Result<Vec<PendingBeadSettlementRow>, LedgerError> {
        self.submit(move |conn| {
            let mut statement = conn.prepare(
                "SELECT e.run_id, e.event_id, e.payload_json, r.probe_wake_at \
                 FROM events e \
                 LEFT JOIN bead_settlement_retry r ON r.run_id = e.run_id \
                 WHERE e.kind = ?1 AND e.run_id IS NOT NULL \
                   AND e.event_id = (SELECT MAX(e2.event_id) FROM events e2 \
                     WHERE e2.run_id = e.run_id AND e2.kind IN (?1, ?2)) \
                 ORDER BY e.run_id",
            )?;
            let rows = statement.query_map([PENDING, SUCCEEDED], |row| {
                Ok(PendingBeadSettlementRow {
                    run_id: row.get(0)?,
                    event_id: row.get(1)?,
                    payload_json: row.get(2)?,
                    probe_wake_at: row.get(3)?,
                })
            })?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }

    /// Reset the mutating budget for a NEW settlement episode: zero `used`,
    /// clear `next_wake_at`/`last_error`, and advance the watermark to
    /// `latest_event_id` — but ONLY when that id is newer than the stamped
    /// watermark. Every charge and every pass-minted pending re-record
    /// stamps the watermark transactionally, so a newer pending event can
    /// only be one minted by a fresh `run stop` settlement episode, never
    /// this pass's own re-pend. The predicate is the CAS: a concurrent
    /// stale reset (an older latest id) loses. Probe schedule columns are
    /// deliberately untouched — a new episode does not imply the bead moved.
    pub fn reset_bead_settlement_retry_for_new_episode(
        &self,
        run_id: &str,
        latest_event_id: i64,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let affected = tx.execute(
                "UPDATE bead_settlement_retry \
                 SET used = 0, next_wake_at = NULL, last_error = NULL, \
                     event_id = ?1, updated_at = ?2 \
                 WHERE run_id = ?3 AND (event_id IS NULL OR event_id < ?1)",
                rusqlite::params![latest_event_id, now_iso(), run_id],
            )?;
            tx.commit()?;
            Ok(affected == 1)
        })
    }

    /// Record one read-only probe observation, creating the retry row on
    /// first contact. Budget fields are untouched on an existing row: the
    /// probe never opens, spends, or resets the mutating budget.
    #[allow(clippy::too_many_arguments)]
    pub fn record_bead_settlement_probe(
        &self,
        run_id: &str,
        probe_wake_at: &str,
        probe_interval_s: u32,
        status: &str,
        assignee: Option<String>,
        revision: Option<String>,
    ) -> Result<(), LedgerError> {
        let run_id = run_id.to_owned();
        let probe_wake_at = probe_wake_at.to_owned();
        let status = status.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            tx.execute(
                "INSERT INTO bead_settlement_retry \
                   (run_id, budget, used, probe_wake_at, probe_interval_s, \
                    last_observed_status, last_observed_assignee, \
                    last_observed_revision, created_at, updated_at) \
                 VALUES (?1, ?2, 0, ?3, ?4, ?5, ?6, ?7, ?8, ?8) \
                 ON CONFLICT(run_id) DO UPDATE SET \
                   probe_wake_at = excluded.probe_wake_at, \
                   probe_interval_s = excluded.probe_interval_s, \
                   last_observed_status = excluded.last_observed_status, \
                   last_observed_assignee = excluded.last_observed_assignee, \
                   last_observed_revision = excluded.last_observed_revision, \
                   updated_at = excluded.updated_at",
                rusqlite::params![
                    run_id,
                    i64::from(BEAD_SETTLEMENT_RETRY_BUDGET),
                    probe_wake_at,
                    i64::from(probe_interval_s),
                    status,
                    assignee,
                    revision,
                    now_iso(),
                ],
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Fetch one retry row, or `None` when no mutating retry has ever been
    /// claimed for the run.
    pub fn get_bead_settlement_retry(
        &self,
        run_id: &str,
    ) -> Result<Option<BeadSettlementRetryRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| get_tx(conn, &run_id))
    }

    /// Claim the run's retry record across processes, creating it on first
    /// contact. `None` means another executor holds an unexpired lease.
    pub fn claim_bead_settlement_retry(
        &self,
        run_id: &str,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<Option<BeadSettlementRetryRow>, LedgerError> {
        let run_id = run_id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            tx.execute(
                "INSERT INTO bead_settlement_retry \
                   (run_id, budget, used, created_at, updated_at) \
                 VALUES (?1, ?2, 0, ?3, ?3) \
                 ON CONFLICT(run_id) DO NOTHING",
                rusqlite::params![run_id, i64::from(BEAD_SETTLEMENT_RETRY_BUDGET), now_iso()],
            )?;
            let affected = tx.execute(
                "UPDATE bead_settlement_retry \
                 SET claim_token = ?1, claim_lease_until = ?2, updated_at = ?3 \
                 WHERE run_id = ?4 \
                   AND (claim_token IS NULL OR claim_lease_until IS NULL \
                        OR claim_lease_until <= ?5)",
                rusqlite::params![token, lease_until, now_iso(), run_id, now],
            )?;
            let row = if affected == 1 {
                get_tx(&tx, &run_id)?
            } else {
                None
            };
            tx.commit()?;
            Ok(row)
        })
    }

    /// Charge one mutating retry under the claim token, persisting the next
    /// wake BEFORE any external write fires (charge-before-mutate) and
    /// extending the claim lease to `lease_until`: the fence must outlive
    /// the whole post-charge bd mutation chain, not just the claim-to-charge
    /// window, or a slow chain hands a live executor's run to a rival.
    /// `pending_event_id` — the discovered pending event this attempt
    /// settles — must still be the stream head INSIDE this transaction:
    /// an executor whose episode was superseded by a fresh run-stop pending
    /// between its discovery read and this charge refuses here, BEFORE any
    /// bd mutation, instead of firing the stale outcome against the new
    /// episode (the succeeded append carries the same fence for the window
    /// after the mutation). The id also stamps the episode watermark in the
    /// same transaction, so a crash after the charge can never read the
    /// already-charged episode as a new one and reset the budget. Refuses
    /// when the token is stale or the budget is spent.
    pub fn charge_bead_settlement_retry(
        &self,
        run_id: &str,
        token: &str,
        next_wake_at: &str,
        lease_until: &str,
        pending_event_id: i64,
    ) -> Result<BeadSettlementRetryRow, LedgerError> {
        let run_id = run_id.to_owned();
        let token = token.to_owned();
        let next_wake_at = next_wake_at.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            match latest_settlement_tx(&tx, &run_id)? {
                Some((event_id, ref kind, _))
                    if kind == PENDING && event_id == pending_event_id => {}
                _ => {
                    return Err(refused(
                        ErrorCode::OperationInProgress,
                        format!(
                            "bead settlement retry for {run_id:?} was superseded by a newer \
                             settlement episode; refusing to charge a stale outcome"
                        ),
                    ));
                }
            }
            let affected = tx.execute(
                "UPDATE bead_settlement_retry \
                 SET used = used + 1, next_wake_at = ?1, claim_lease_until = ?2, \
                     event_id = MAX(COALESCE(event_id, 0), ?6), updated_at = ?3 \
                 WHERE run_id = ?4 AND claim_token = ?5 AND used < budget",
                rusqlite::params![
                    next_wake_at,
                    lease_until,
                    now_iso(),
                    run_id,
                    token,
                    pending_event_id
                ],
            )?;
            if affected != 1 {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    format!(
                        "bead settlement retry for {run_id:?} is not fenced by this claim \
                         or its budget is exhausted"
                    ),
                ));
            }
            let row = get_tx(&tx, &run_id)?.ok_or_else(|| {
                crate::error::internal("charged bead settlement retry row vanished")
            })?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Release the claim taken by [`Ledger::claim_bead_settlement_retry`].
    /// A stale token is not an error — a crashed executor's lease simply
    /// expires — so the return reports whether this token still held it.
    /// `last_error` is explicit three-state: a converged or settled exit
    /// must CLEAR the stored error, or the row keeps reporting a failure
    /// that no longer stands.
    pub fn finish_bead_settlement_retry(
        &self,
        run_id: &str,
        token: &str,
        last_error: RetryErrorUpdate,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        let token = token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let (keep, value) = match last_error {
                RetryErrorUpdate::Keep => (true, None),
                RetryErrorUpdate::Clear => (false, None),
                RetryErrorUpdate::Set(error) => (false, Some(error)),
            };
            let affected = tx.execute(
                "UPDATE bead_settlement_retry \
                 SET claim_token = NULL, claim_lease_until = NULL, \
                     last_error = CASE WHEN ?1 THEN last_error ELSE ?2 END, \
                     updated_at = ?3 \
                 WHERE run_id = ?4 AND claim_token = ?5",
                rusqlite::params![keep, value, now_iso(), run_id, token],
            )?;
            tx.commit()?;
            Ok(affected == 1)
        })
    }

    /// Advance one run's probe wake without touching its observation or
    /// budget columns — the deferral for a FAILED probe read. Earliest-wake
    /// selection would otherwise keep an unreadable row at the front of
    /// every pass forever, starving later pending settlements; a failed
    /// read defers on the same decaying schedule an unchanged observation
    /// does. Upserts so a row that has never been probed still defers.
    pub fn defer_bead_settlement_probe(
        &self,
        run_id: &str,
        probe_wake_at: &str,
        probe_interval_s: u32,
    ) -> Result<(), LedgerError> {
        let run_id = run_id.to_owned();
        let probe_wake_at = probe_wake_at.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            tx.execute(
                "INSERT INTO bead_settlement_retry \
                   (run_id, budget, used, probe_wake_at, probe_interval_s, \
                    created_at, updated_at) \
                 VALUES (?1, ?2, 0, ?3, ?4, ?5, ?5) \
                 ON CONFLICT(run_id) DO UPDATE SET \
                   probe_wake_at = excluded.probe_wake_at, \
                   probe_interval_s = excluded.probe_interval_s, \
                   updated_at = excluded.updated_at",
                rusqlite::params![
                    run_id,
                    i64::from(BEAD_SETTLEMENT_RETRY_BUDGET),
                    probe_wake_at,
                    i64::from(probe_interval_s),
                    now_iso(),
                ],
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Append `run.bead-settlement.succeeded` only while the run's latest
    /// settlement event is still the pending event the caller discovered:
    /// `expected_event_id` must be the stream head inside the transaction.
    /// A pass whose episode was superseded mid-flight by a fresh run-stop
    /// pending therefore refuses instead of retiring a promise it never
    /// probed.
    ///
    /// Positional, deliberately NOT payload-deduplicated: an identical
    /// succeeded event may already exist earlier in the stream (settled,
    /// re-pended by an interrupted operation replay, now converged again),
    /// and payload dedup would refuse the append that clears the promise.
    /// After one append the latest event is `succeeded`, so replays no-op.
    pub fn append_bead_settlement_succeeded_if_pending(
        &self,
        run_id: &str,
        expected_event_id: i64,
        payload: serde_json::Value,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let appended = match latest_settlement_tx(&tx, &run_id)? {
                Some((event_id, kind, _)) if kind == PENDING && event_id == expected_event_id => {
                    append_event_tx(&tx, Some(&run_id), SUCCEEDED, &payload)?;
                    true
                }
                _ => false,
            };
            tx.commit()?;
            Ok(appended)
        })
    }

    /// Re-record `run.bead-settlement.pending` only while the run's latest
    /// settlement event is still the pending event the caller discovered
    /// (`expected_event_id` at the stream head, in-transaction) AND the
    /// payload actually changed. A converged run is never resurrected,
    /// byte-identical retries do not multiply evidence, and a stale pass
    /// can never shadow a fresh run-stop episode with its old promise.
    ///
    /// The append stamps the retry row's episode watermark to the new
    /// event's id in the same transaction: every pending event the retry
    /// pass mints itself is covered, so its own re-record can never read as
    /// a fresh settlement episode and reset the budget.
    pub fn append_bead_settlement_pending_if_pending(
        &self,
        run_id: &str,
        expected_event_id: i64,
        payload: serde_json::Value,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let serialized = serde_json::to_string(&payload)?;
            let appended = match latest_settlement_tx(&tx, &run_id)? {
                Some((event_id, kind, latest))
                    if kind == PENDING && event_id == expected_event_id && latest != serialized =>
                {
                    append_event_tx(&tx, Some(&run_id), PENDING, &payload)?;
                    tx.execute(
                        "UPDATE bead_settlement_retry \
                         SET event_id = ?1, updated_at = ?2 WHERE run_id = ?3",
                        rusqlite::params![tx.last_insert_rowid(), now_iso(), run_id],
                    )?;
                    true
                }
                _ => false,
            };
            tx.commit()?;
            Ok(appended)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::NewRun;
    use forged_types::RunId;
    use serde_json::json;

    fn ledger_with_run(dir: &tempfile::TempDir, run: &str) -> Ledger {
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        ledger
            .create_run(NewRun {
                run_id: RunId::new(run).expect("run id"),
                bead_id: format!("bead-{run}"),
                repo: "/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: format!("forged/{run}"),
            })
            .expect("create run");
        ledger
    }

    fn pending_payload(error: &str) -> serde_json::Value {
        json!({
            "schemaVersion": 1,
            "beadId": "bead-run-retry",
            "outcome": "landed",
            "expectedAssignee": "forged:bead-run-retry:0",
            "settled": false,
            "pending": true,
            "error": error,
        })
    }

    #[test]
    fn discovery_is_positional_and_a_later_succeeded_retires_the_run() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = ledger_with_run(&dir, "run-retry");
        assert!(ledger
            .list_pending_bead_settlements()
            .expect("empty discovery")
            .is_empty());

        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("lease held"))
            .expect("pending");
        let discovered = ledger
            .list_pending_bead_settlements()
            .expect("pending discovery");
        assert_eq!(discovered.len(), 1);
        assert_eq!(discovered[0].run_id, "run-retry");
        let pending_id = discovered[0].event_id;

        assert!(ledger
            .append_bead_settlement_succeeded_if_pending(
                "run-retry",
                pending_id,
                json!({"schema": "forged.bead-settlement/1", "settled": true}),
            )
            .expect("conditional succeeded"));
        assert!(ledger
            .list_pending_bead_settlements()
            .expect("retired discovery")
            .is_empty());

        // Converged: neither conditional append can move the stream again.
        assert!(!ledger
            .append_bead_settlement_succeeded_if_pending(
                "run-retry",
                pending_id,
                json!({"schema": "forged.bead-settlement/1", "settled": true}),
            )
            .expect("succeeded replay"));
        assert!(!ledger
            .append_bead_settlement_pending_if_pending(
                "run-retry",
                pending_id,
                pending_payload("again")
            )
            .expect("pending after succeeded"));
    }

    #[test]
    fn succeeded_append_is_positional_not_payload_deduplicated() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = ledger_with_run(&dir, "run-retry");
        let succeeded = json!({"schema": "forged.bead-settlement/1", "settled": true});
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("first"))
            .expect("pending");
        let first = ledger
            .list_pending_bead_settlements()
            .expect("first discovery")
            .remove(0);
        assert!(ledger
            .append_bead_settlement_succeeded_if_pending(
                "run-retry",
                first.event_id,
                succeeded.clone()
            )
            .expect("first convergence"));
        // An interrupted replay re-pends after the settlement already
        // succeeded once; the identical succeeded payload must still land.
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("re-pended"))
            .expect("re-pend");
        let repended = ledger
            .list_pending_bead_settlements()
            .expect("re-pend discovery")
            .remove(0);
        assert!(ledger
            .append_bead_settlement_succeeded_if_pending("run-retry", repended.event_id, succeeded)
            .expect("second convergence"));
        assert!(ledger
            .list_pending_bead_settlements()
            .expect("discovery")
            .is_empty());
    }

    #[test]
    fn pending_rerecord_skips_identical_payloads() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = ledger_with_run(&dir, "run-retry");
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("same"))
            .expect("pending");
        let discovered = ledger
            .list_pending_bead_settlements()
            .expect("discovery")
            .remove(0);
        assert!(!ledger
            .append_bead_settlement_pending_if_pending(
                "run-retry",
                discovered.event_id,
                pending_payload("same")
            )
            .expect("identical re-record"));
        assert!(ledger
            .append_bead_settlement_pending_if_pending(
                "run-retry",
                discovered.event_id,
                pending_payload("changed")
            )
            .expect("changed re-record"));
        assert_eq!(
            ledger
                .list_events(Some("run-retry"), 0, 4096)
                .expect("events")
                .into_iter()
                .filter(|event| event.kind == PENDING)
                .count(),
            2
        );
    }

    #[test]
    fn stale_pass_appends_refuse_when_a_newer_episode_pended() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = ledger_with_run(&dir, "run-retry");
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("episode one"))
            .expect("pending");
        let stale = ledger
            .list_pending_bead_settlements()
            .expect("discovery")
            .remove(0);
        // A fresh run-stop episode pends while the first pass is mid-flight.
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("episode two"))
            .expect("new episode");
        let fresh = ledger
            .list_pending_bead_settlements()
            .expect("fresh discovery")
            .remove(0);

        // The stale pass can neither retire the fresh promise nor shadow it.
        assert!(!ledger
            .append_bead_settlement_succeeded_if_pending(
                "run-retry",
                stale.event_id,
                json!({"schema": "forged.bead-settlement/1", "settled": true}),
            )
            .expect("stale succeeded"));
        assert!(!ledger
            .append_bead_settlement_pending_if_pending(
                "run-retry",
                stale.event_id,
                pending_payload("stale re-pend")
            )
            .expect("stale re-pend"));
        let standing = ledger
            .list_pending_bead_settlements()
            .expect("standing discovery")
            .remove(0);
        assert_eq!(standing.event_id, fresh.event_id);

        // The fresh episode still settles under its own discovered id.
        assert!(ledger
            .append_bead_settlement_succeeded_if_pending(
                "run-retry",
                fresh.event_id,
                json!({"schema": "forged.bead-settlement/1", "settled": true}),
            )
            .expect("fresh succeeded"));
        assert!(ledger
            .list_pending_bead_settlements()
            .expect("retired discovery")
            .is_empty());
    }

    #[test]
    fn claim_is_singleton_and_charge_is_token_fenced_and_bounded() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = ledger_with_run(&dir, "run-retry");
        let second = Ledger::open(&path).expect("second handle");
        let now = "2030-01-01T00:00:00.000000000Z";
        let lease = "2030-01-01T00:01:00.000000000Z";
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("lease held"))
            .expect("pending");
        let pending_event = ledger
            .list_pending_bead_settlements()
            .expect("discovery")
            .remove(0)
            .event_id;

        let won = ledger
            .claim_bead_settlement_retry("run-retry", "tick-a", now, lease)
            .expect("claim")
            .expect("winner");
        assert_eq!(won.budget, BEAD_SETTLEMENT_RETRY_BUDGET);
        assert_eq!(won.used, 0);
        assert!(second
            .claim_bead_settlement_retry("run-retry", "tick-b", now, lease)
            .expect("loser")
            .is_none());
        second
            .charge_bead_settlement_retry("run-retry", "tick-b", lease, lease, pending_event)
            .expect_err("a stale token must not charge");
        // The stream-head fence: an executor whose discovered pending is no
        // longer current refuses BEFORE any bd mutation could fire.
        ledger
            .charge_bead_settlement_retry("run-retry", "tick-a", lease, lease, pending_event - 1)
            .expect_err("a superseded episode must not charge");

        let mutation_lease = "2030-01-01T00:08:00.000000000Z";
        let charged = ledger
            .charge_bead_settlement_retry(
                "run-retry",
                "tick-a",
                "2030-01-01T00:00:30.000000000Z",
                mutation_lease,
                pending_event,
            )
            .expect("charge");
        assert_eq!(charged.used, 1);
        assert_eq!(
            charged.next_wake_at.as_deref(),
            Some("2030-01-01T00:00:30.000000000Z")
        );
        assert_eq!(
            charged.claim_lease_until.as_deref(),
            Some(mutation_lease),
            "the charge extends the fence over the mutation chain"
        );
        assert_eq!(
            charged.event_id,
            Some(1),
            "the charge stamps the episode watermark transactionally"
        );
        assert!(ledger
            .finish_bead_settlement_retry(
                "run-retry",
                "tick-a",
                RetryErrorUpdate::Set("still held".to_owned())
            )
            .expect("finish"));
        let released = ledger
            .get_bead_settlement_retry("run-retry")
            .expect("get")
            .expect("row");
        assert!(released.claim_token.is_none());
        assert_eq!(released.last_error.as_deref(), Some("still held"));

        // An expired lease is reclaimable; a spent budget refuses charging.
        let reclaimed = second
            .claim_bead_settlement_retry(
                "run-retry",
                "tick-c",
                "2030-01-01T00:02:00.000000000Z",
                "2030-01-01T00:03:00.000000000Z",
            )
            .expect("reclaim")
            .expect("free row reclaims");
        for _ in reclaimed.used..reclaimed.budget {
            second
                .charge_bead_settlement_retry("run-retry", "tick-c", lease, lease, pending_event)
                .expect("charge within budget");
        }
        second
            .charge_bead_settlement_retry("run-retry", "tick-c", lease, lease, pending_event)
            .expect_err("the budget bounds mutating charges");
    }

    #[test]
    fn own_re_records_stamp_the_watermark_and_only_a_newer_episode_resets() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = ledger_with_run(&dir, "run-retry");
        let now = "2030-01-01T00:00:00.000000000Z";
        let lease = "2030-01-01T00:01:00.000000000Z";
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("episode one"))
            .expect("pending");
        let discovered = ledger
            .list_pending_bead_settlements()
            .expect("discovery")
            .remove(0);
        ledger
            .claim_bead_settlement_retry("run-retry", "tick-a", now, lease)
            .expect("claim")
            .expect("winner");
        ledger
            .charge_bead_settlement_retry("run-retry", "tick-a", lease, lease, discovered.event_id)
            .expect("charge");

        // The pass's own re-record moves the watermark with the append.
        assert!(ledger
            .append_bead_settlement_pending_if_pending(
                "run-retry",
                discovered.event_id,
                pending_payload("re-pended")
            )
            .expect("re-record"));
        let repended = ledger
            .list_pending_bead_settlements()
            .expect("re-discovery")
            .remove(0);
        let row = ledger
            .get_bead_settlement_retry("run-retry")
            .expect("get")
            .expect("row");
        assert_eq!(row.event_id, Some(repended.event_id));
        assert!(
            !ledger
                .reset_bead_settlement_retry_for_new_episode("run-retry", repended.event_id)
                .expect("own re-pend reset"),
            "the pass's own re-record never reads as a new episode"
        );
        assert_eq!(
            ledger
                .get_bead_settlement_retry("run-retry")
                .expect("get")
                .expect("row")
                .used,
            1
        );

        // A pending minted by a NEW run-stop episode resets the budget; a
        // concurrent stale reset loses the CAS.
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("episode two"))
            .expect("new episode");
        let fresh = ledger
            .list_pending_bead_settlements()
            .expect("fresh discovery")
            .remove(0);
        assert!(!ledger
            .reset_bead_settlement_retry_for_new_episode("run-retry", repended.event_id)
            .expect("stale reset"));
        assert!(ledger
            .reset_bead_settlement_retry_for_new_episode("run-retry", fresh.event_id)
            .expect("fresh reset"));
        let reset = ledger
            .get_bead_settlement_retry("run-retry")
            .expect("get")
            .expect("row");
        assert_eq!(reset.used, 0);
        assert_eq!(reset.next_wake_at, None);
        assert_eq!(reset.last_error, None);
        assert_eq!(reset.event_id, Some(fresh.event_id));
        assert!(
            !ledger
                .reset_bead_settlement_retry_for_new_episode("run-retry", fresh.event_id)
                .expect("replayed reset"),
            "a second reset against the same episode loses"
        );
    }

    #[test]
    fn probe_upsert_creates_the_row_and_never_touches_budget_fields() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = ledger_with_run(&dir, "run-retry");
        ledger
            .record_bead_settlement_probe(
                "run-retry",
                "2030-01-01T00:01:00.000000000Z",
                60,
                "open",
                None,
                Some("-42".to_owned()),
            )
            .expect("first probe");
        let row = ledger
            .get_bead_settlement_retry("run-retry")
            .expect("get")
            .expect("row");
        assert_eq!(row.used, 0);
        assert_eq!(row.budget, BEAD_SETTLEMENT_RETRY_BUDGET);
        assert_eq!(
            row.probe_wake_at.as_deref(),
            Some("2030-01-01T00:01:00.000000000Z")
        );
        assert_eq!(row.probe_interval_s, Some(60));
        assert_eq!(row.last_observed_status.as_deref(), Some("open"));
        assert_eq!(row.last_observed_assignee, None);
        assert_eq!(row.last_observed_revision.as_deref(), Some("-42"));

        let now = "2030-01-01T00:00:00.000000000Z";
        let lease = "2030-01-01T00:01:00.000000000Z";
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("stuck"))
            .expect("pending");
        ledger
            .claim_bead_settlement_retry("run-retry", "tick-a", now, lease)
            .expect("claim")
            .expect("winner");
        ledger
            .charge_bead_settlement_retry("run-retry", "tick-a", lease, lease, 1)
            .expect("charge");
        ledger
            .record_bead_settlement_probe(
                "run-retry",
                "2030-01-01T00:03:00.000000000Z",
                120,
                "in_progress",
                Some("forged:thief:0".to_owned()),
                None,
            )
            .expect("second probe");
        let row = ledger
            .get_bead_settlement_retry("run-retry")
            .expect("get")
            .expect("row");
        assert_eq!(row.used, 1, "the probe upsert never touches the budget");
        assert_eq!(
            row.claim_token.as_deref(),
            Some("tick-a"),
            "the probe upsert never touches the claim fence"
        );
        assert_eq!(row.probe_interval_s, Some(120));
        assert_eq!(
            row.last_observed_assignee.as_deref(),
            Some("forged:thief:0")
        );
        assert_eq!(row.last_observed_revision, None);
        let discovered = ledger
            .list_pending_bead_settlements()
            .expect("discovery")
            .remove(0);
        assert_eq!(
            discovered.probe_wake_at.as_deref(),
            Some("2030-01-01T00:03:00.000000000Z"),
            "discovery carries the probe schedule for due selection"
        );
    }
}
