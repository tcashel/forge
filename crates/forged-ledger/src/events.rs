//! The append-only event stream. There are no UPDATE or DELETE code paths
//! for `events` — append-only, with `event_id` monotonic.

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
}
