//! The append-only event stream. There are no UPDATE or DELETE code paths
//! for `events` — append-only, with `event_id` monotonic.

use std::collections::BTreeMap;

use rusqlite::{Connection, TransactionBehavior};

use crate::error::LedgerError;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::EventRow;

/// Insert one event row inside the caller's transaction. The payload is a
/// [`serde_json::Value`], so it is well-formed by construction; the ledger
/// serializes it and performs no parsing or validation of its own.
pub(crate) fn append_event_tx(
    conn: &Connection,
    run_id: Option<&str>,
    kind: &str,
    payload: &serde_json::Value,
) -> Result<(), LedgerError> {
    let payload_json = serde_json::to_string(payload)?;
    conn.execute(
        "INSERT INTO events (ts, run_id, kind, payload_json) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![now_iso(), run_id, kind, payload_json],
    )?;
    Ok(())
}

pub(crate) fn event_row(row: &rusqlite::Row<'_>) -> Result<EventRow, rusqlite::Error> {
    Ok(EventRow {
        event_id: row.get(0)?,
        ts: row.get(1)?,
        run_id: row.get(2)?,
        kind: row.get(3)?,
        payload_json: row.get(4)?,
    })
}

const LATEST_EVENT_PER_RUN_SQL: &str =
    "SELECT event_id, ts, run_id, kind, payload_json FROM events \
     WHERE event_id IN \
       (SELECT MAX(event_id) FROM events WHERE run_id IS NOT NULL GROUP BY run_id) \
     ORDER BY event_id ASC";

/// The newest event per run inside the caller's transaction — see
/// [`Ledger::latest_event_per_run`] for the contract.
pub(crate) fn latest_event_per_run_tx(
    conn: &Connection,
) -> Result<BTreeMap<String, EventRow>, LedgerError> {
    let mut statement = conn.prepare(LATEST_EVENT_PER_RUN_SQL)?;
    let rows = statement.query_map([], event_row)?;
    let mut latest = BTreeMap::new();
    for row in rows {
        let row = row?;
        if let Some(run_id) = row.run_id.clone() {
            latest.insert(run_id, row);
        }
    }
    Ok(latest)
}

/// All rows of one kind inside the caller's transaction — see
/// [`Ledger::list_events_by_kind`] for the contract.
pub(crate) fn list_events_by_kind_tx(
    conn: &Connection,
    kind: &str,
) -> Result<Vec<EventRow>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT event_id, ts, run_id, kind, payload_json FROM events \
         WHERE kind = ?1 ORDER BY event_id ASC",
    )?;
    let rows = statement.query_map([kind], event_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

impl Ledger {
    /// Append one event. The payload arrives as a `serde_json::Value` and is
    /// stored serialized, without validation — the same dumb-durable-store
    /// boundary `open_packet` draws around `body_json`.
    pub fn append_event(
        &self,
        run_id: Option<&str>,
        kind: &str,
        payload_json: serde_json::Value,
    ) -> Result<(), LedgerError> {
        let run_id = run_id.map(str::to_owned);
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            append_event_tx(&tx, run_id.as_deref(), &kind, &payload_json)?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Append an event only when the same run/kind/payload tuple is absent.
    /// This is the crash-safe seam for deterministic protocol transitions
    /// whose operation wrapper may be retried after the event landed.
    pub fn append_event_once(
        &self,
        run_id: &str,
        kind: &str,
        payload: serde_json::Value,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let payload_json = serde_json::to_string(&payload)?;
            let exists: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 AND kind = ?2 AND payload_json = ?3)",
                rusqlite::params![run_id, kind, payload_json],
                |row| row.get(0),
            )?;
            if !exists {
                append_event_tx(&tx, Some(&run_id), &kind, &payload)?;
            }
            tx.commit()?;
            Ok(!exists)
        })
    }

    /// Append one event only when that run has no event of the same kind.
    ///
    /// Unlike [`Ledger::append_event_once`], payload differences do not make
    /// a second insert eligible. Upgrade boundaries use this form so two
    /// concurrent binaries with different authoring config cannot record two
    /// competing snapshots.
    pub fn append_event_kind_once(
        &self,
        run_id: &str,
        kind: &str,
        payload: serde_json::Value,
    ) -> Result<bool, LedgerError> {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let exists: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 AND kind = ?2)",
                rusqlite::params![run_id, kind],
                |row| row.get(0),
            )?;
            if !exists {
                append_event_tx(&tx, Some(&run_id), &kind, &payload)?;
            }
            tx.commit()?;
            Ok(!exists)
        })
    }

    /// Append one event whose payload is DERIVED, inside the same
    /// transaction, from the run's existing events of that kind.
    ///
    /// The read and the append are one atomic step, which is the whole
    /// point. A counter carried in the stream — a packet's transport-failure
    /// budget — read in one call and appended in the next lets two concurrent
    /// advances observe the same `n` and both write `n + 1`: one outage is
    /// charged once instead of twice and the bounded budget silently stops
    /// being bounded.
    ///
    /// The dumb-durable-store boundary holds: the ledger hands `derive` the
    /// rows it already stores and stores back whatever `derive` returns,
    /// parsing neither.
    pub fn append_event_derived<F>(
        &self,
        run_id: &str,
        kind: &str,
        derive: F,
    ) -> Result<serde_json::Value, LedgerError>
    where
        F: FnOnce(&[EventRow]) -> Result<serde_json::Value, LedgerError> + Send + 'static,
    {
        let run_id = run_id.to_owned();
        let kind = kind.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let standing = {
                let mut statement = tx.prepare(
                    "SELECT event_id, ts, run_id, kind, payload_json FROM events \
                     WHERE run_id = ?1 AND kind = ?2 ORDER BY event_id ASC",
                )?;
                let rows = statement.query_map(rusqlite::params![run_id, kind], |row| {
                    Ok(EventRow {
                        event_id: row.get(0)?,
                        ts: row.get(1)?,
                        run_id: row.get(2)?,
                        kind: row.get(3)?,
                        payload_json: row.get(4)?,
                    })
                })?;
                let mut out = Vec::new();
                for row in rows {
                    out.push(row?);
                }
                out
            };
            let payload = derive(&standing)?;
            append_event_tx(&tx, Some(&run_id), &kind, &payload)?;
            tx.commit()?;
            Ok(payload)
        })
    }

    /// Rows with `event_id > after_event_id` (exclusive), ordered by
    /// `event_id` ascending, at most `limit` rows; `limit == 0` returns an
    /// empty vec. `run_id: None` returns all rows including NULL-run rows;
    /// `Some(r)` returns only rows with `run_id = r`.
    pub fn list_events(
        &self,
        run_id: Option<&str>,
        after_event_id: i64,
        limit: u32,
    ) -> Result<Vec<EventRow>, LedgerError> {
        let run_id = run_id.map(str::to_owned);
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT event_id, ts, run_id, kind, payload_json FROM events
                 WHERE event_id > ?1 AND (?2 IS NULL OR run_id = ?2)
                 ORDER BY event_id ASC LIMIT ?3",
            )?;
            let rows = stmt.query_map(
                rusqlite::params![after_event_id, run_id, i64::from(limit)],
                |row| {
                    Ok(EventRow {
                        event_id: row.get(0)?,
                        ts: row.get(1)?,
                        run_id: row.get(2)?,
                        kind: row.get(3)?,
                        payload_json: row.get(4)?,
                    })
                },
            )?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// The newest event per run, keyed by `run_id`; rows with a NULL
    /// `run_id` are excluded — they belong to no unit of work.
    ///
    /// Newest is the greatest `event_id`, the append position, never the
    /// `ts` string: two events written in the same second must not resolve
    /// by luck. One aggregate answers every run, so a caller projecting the
    /// whole inventory never queries per run.
    pub fn latest_event_per_run(&self) -> Result<BTreeMap<String, EventRow>, LedgerError> {
        self.submit(move |conn| latest_event_per_run_tx(conn))
    }

    /// All rows of one event kind, ordered by append position.
    ///
    /// Upgrade projectors use this indexed seam instead of rescanning the
    /// complete event history on every process start.
    pub fn list_events_by_kind(&self, kind: &str) -> Result<Vec<EventRow>, LedgerError> {
        let kind = kind.to_owned();
        self.submit(move |conn| list_events_by_kind_tx(conn, &kind))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn latest_event_plan_uses_the_partial_run_major_index_without_temp_grouping() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        Ledger::open(&path)
            .expect("migrate")
            .close()
            .expect("close");
        let conn = Connection::open(path).expect("raw connection");
        let mut statement = conn
            .prepare(&format!("EXPLAIN QUERY PLAN {LATEST_EVENT_PER_RUN_SQL}"))
            .expect("prepare plan");
        let details = statement
            .query_map([], |row| row.get::<_, String>(3))
            .expect("query plan")
            .collect::<Result<Vec<_>, _>>()
            .expect("plan rows");

        assert!(
            details
                .iter()
                .any(|detail| detail.contains("events_run_event")),
            "run-major index is absent from plan: {details:?}"
        );
        assert!(
            details
                .iter()
                .all(|detail| !detail.contains("TEMP B-TREE FOR GROUP BY")),
            "latest-event grouping still materializes a temporary B-tree: {details:?}"
        );
    }
}
