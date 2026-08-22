//! Durable retry state for pending whole-run bead settlement — the mirror
//! of `desired_work` for the one external promise `run stop` can leave owed.
//!
//! Discovery is positional, never a bare pending scan: a run is owed work
//! only while its LATEST bead-settlement event is `pending`, so a later
//! `succeeded` retires it at the stream itself and no pass can race a
//! settlement that already converged. The conditional appends below share
//! that guard: neither event kind is ever appended after the stream has
//! moved past it.

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
/// at 8 minutes, eight charges span well past the 5+ minute bd lease TTL
/// that motivates the retry in the first place.
pub const BEAD_SETTLEMENT_RETRY_BUDGET: u32 = 8;

const COLUMNS: &str = "run_id, budget, used, next_wake_at, last_error, \
    claim_token, claim_lease_until, created_at, updated_at";

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
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

fn get_tx(conn: &Connection, run_id: &str) -> Result<Option<BeadSettlementRetryRow>, LedgerError> {
    let sql = format!("SELECT {COLUMNS} FROM bead_settlement_retry WHERE run_id = ?1");
    conn.query_row(&sql, [run_id], retry_row)
        .optional()
        .map_err(Into::into)
}

/// The run's newest bead-settlement event, if any: `(kind, payload_json)`.
fn latest_settlement_tx(
    conn: &Connection,
    run_id: &str,
) -> Result<Option<(String, String)>, LedgerError> {
    conn.query_row(
        "SELECT kind, payload_json FROM events \
         WHERE run_id = ?1 AND kind IN (?2, ?3) \
         ORDER BY event_id DESC LIMIT 1",
        rusqlite::params![run_id, PENDING, SUCCEEDED],
        |row| Ok((row.get(0)?, row.get(1)?)),
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
                "SELECT e.run_id, e.event_id, e.payload_json FROM events e \
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
                })
            })?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
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
    /// wake BEFORE any external write fires (charge-before-mutate). Refuses
    /// when the token is stale or the budget is spent.
    pub fn charge_bead_settlement_retry(
        &self,
        run_id: &str,
        token: &str,
        next_wake_at: &str,
    ) -> Result<BeadSettlementRetryRow, LedgerError> {
        let run_id = run_id.to_owned();
        let token = token.to_owned();
        let next_wake_at = next_wake_at.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let affected = tx.execute(
                "UPDATE bead_settlement_retry \
                 SET used = used + 1, next_wake_at = ?1, updated_at = ?2 \
                 WHERE run_id = ?3 AND claim_token = ?4 AND used < budget",
                rusqlite::params![next_wake_at, now_iso(), run_id, token],
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
    pub fn finish_bead_settlement_retry(
        &self,
        run_id: &str,
        token: &str,
        last_error: Option<String>,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        let token = token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let affected = tx.execute(
                "UPDATE bead_settlement_retry \
                 SET claim_token = NULL, claim_lease_until = NULL, \
                     last_error = CASE WHEN ?1 IS NULL THEN last_error ELSE ?1 END, \
                     updated_at = ?2 \
                 WHERE run_id = ?3 AND claim_token = ?4",
                rusqlite::params![last_error, now_iso(), run_id, token],
            )?;
            tx.commit()?;
            Ok(affected == 1)
        })
    }

    /// Append `run.bead-settlement.succeeded` only while the run's latest
    /// settlement event is still `pending`.
    ///
    /// Positional, deliberately NOT payload-deduplicated: an identical
    /// succeeded event may already exist earlier in the stream (settled,
    /// re-pended by an interrupted operation replay, now converged again),
    /// and payload dedup would refuse the append that clears the promise.
    /// After one append the latest event is `succeeded`, so replays no-op.
    pub fn append_bead_settlement_succeeded_if_pending(
        &self,
        run_id: &str,
        payload: serde_json::Value,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let appended = match latest_settlement_tx(&tx, &run_id)? {
                Some((kind, _)) if kind == PENDING => {
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
    /// settlement event is still `pending` AND the payload actually changed.
    /// A converged run is never resurrected, and byte-identical retries do
    /// not multiply evidence.
    pub fn append_bead_settlement_pending_if_pending(
        &self,
        run_id: &str,
        payload: serde_json::Value,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let serialized = serde_json::to_string(&payload)?;
            let appended = match latest_settlement_tx(&tx, &run_id)? {
                Some((kind, latest)) if kind == PENDING && latest != serialized => {
                    append_event_tx(&tx, Some(&run_id), PENDING, &payload)?;
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

        assert!(ledger
            .append_bead_settlement_succeeded_if_pending(
                "run-retry",
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
                json!({"schema": "forged.bead-settlement/1", "settled": true}),
            )
            .expect("succeeded replay"));
        assert!(!ledger
            .append_bead_settlement_pending_if_pending("run-retry", pending_payload("again"))
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
        assert!(ledger
            .append_bead_settlement_succeeded_if_pending("run-retry", succeeded.clone())
            .expect("first convergence"));
        // An interrupted replay re-pends after the settlement already
        // succeeded once; the identical succeeded payload must still land.
        ledger
            .append_event(Some("run-retry"), PENDING, pending_payload("re-pended"))
            .expect("re-pend");
        assert!(ledger
            .append_bead_settlement_succeeded_if_pending("run-retry", succeeded)
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
        assert!(!ledger
            .append_bead_settlement_pending_if_pending("run-retry", pending_payload("same"))
            .expect("identical re-record"));
        assert!(ledger
            .append_bead_settlement_pending_if_pending("run-retry", pending_payload("changed"))
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
    fn claim_is_singleton_and_charge_is_token_fenced_and_bounded() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = ledger_with_run(&dir, "run-retry");
        let second = Ledger::open(&path).expect("second handle");
        let now = "2030-01-01T00:00:00.000000000Z";
        let lease = "2030-01-01T00:01:00.000000000Z";

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
            .charge_bead_settlement_retry("run-retry", "tick-b", lease)
            .expect_err("a stale token must not charge");

        let charged = ledger
            .charge_bead_settlement_retry("run-retry", "tick-a", "2030-01-01T00:00:30.000000000Z")
            .expect("charge");
        assert_eq!(charged.used, 1);
        assert_eq!(
            charged.next_wake_at.as_deref(),
            Some("2030-01-01T00:00:30.000000000Z")
        );
        assert!(ledger
            .finish_bead_settlement_retry("run-retry", "tick-a", Some("still held".to_owned()))
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
                .charge_bead_settlement_retry("run-retry", "tick-c", lease)
                .expect("charge within budget");
        }
        second
            .charge_bead_settlement_retry("run-retry", "tick-c", lease)
            .expect_err("the budget bounds mutating charges");
    }
}
