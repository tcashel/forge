//! Run rows and the `run.state` transition rules.

use forged_types::ErrorCode;
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{NewRun, RunRow, RunState};

fn run_row(row: &rusqlite::Row<'_>) -> Result<RunRow, rusqlite::Error> {
    Ok(RunRow {
        run_id: row.get(0)?,
        bead_id: row.get(1)?,
        repo: row.get(2)?,
        base_ref: row.get(3)?,
        branch: row.get(4)?,
        protocol: row.get(5)?,
        state: match row.get::<_, String>(6)?.as_str() {
            "stopped" => RunState::Stopped,
            _ => RunState::Active,
        },
        stop_reason: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
    })
}

const RUN_COLUMNS: &str = "run_id, bead_id, repo, base_ref, branch, protocol, state, \
                           stop_reason, created_at, updated_at";

pub(crate) fn get_run_tx(conn: &Connection, run_id: &str) -> Result<RunRow, LedgerError> {
    let sql = format!("SELECT {RUN_COLUMNS} FROM runs WHERE run_id = ?1");
    conn.query_row(&sql, [run_id], run_row)
        .optional()?
        .ok_or_else(|| refused(ErrorCode::RunNotFound, format!("no run {run_id:?}")))
}

/// Refuse with `RunNotFound` unless `run_id` exists.
pub(crate) fn require_run(conn: &Connection, run_id: &str) -> Result<(), LedgerError> {
    let found: Option<i64> = conn
        .query_row("SELECT 1 FROM runs WHERE run_id = ?1", [run_id], |row| {
            row.get(0)
        })
        .optional()?;
    match found {
        Some(_) => Ok(()),
        None => Err(refused(
            ErrorCode::RunNotFound,
            format!("no run {run_id:?}"),
        )),
    }
}

impl Ledger {
    /// Create a run in state `active`. A duplicate id refuses with
    /// `InvalidRequest`. Creation appends no event — a run's initial
    /// `active` state is a creation, not a transition.
    pub fn create_run(&self, new_run: NewRun) -> Result<RunRow, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let run_id = new_run.run_id.as_str();
            let exists: Option<i64> = tx
                .query_row("SELECT 1 FROM runs WHERE run_id = ?1", [run_id], |row| {
                    row.get(0)
                })
                .optional()?;
            if exists.is_some() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("run {run_id:?} already exists"),
                ));
            }
            let now = now_iso();
            tx.execute(
                "INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, state, \
                 created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, 'active', ?6, ?6)",
                rusqlite::params![
                    run_id,
                    new_run.bead_id,
                    new_run.repo,
                    new_run.base_ref,
                    new_run.branch,
                    now
                ],
            )?;
            let row = get_run_tx(&tx, run_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Fetch one run, refusing with `RunNotFound` when absent.
    pub fn get_run(&self, run_id: &str) -> Result<RunRow, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| get_run_tx(conn, &run_id))
    }

    /// All runs, ordered by `created_at` then rowid ascending.
    pub fn list_runs(&self) -> Result<Vec<RunRow>, LedgerError> {
        self.submit(move |conn| {
            let sql = format!("SELECT {RUN_COLUMNS} FROM runs ORDER BY created_at, rowid");
            let mut stmt = conn.prepare(&sql)?;
            let rows = stmt.query_map([], run_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Transition a run between `active` and `stopped`.
    ///
    /// `Stopped` REQUIRES a reason (`None` refuses with `InvalidRequest`);
    /// `Active` forbids one and CLEARS `stop_reason` to NULL. Re-setting the
    /// current state is an idempotent `Ok(())` that writes nothing and
    /// appends no event. Stopping never cascades to live attempts — the
    /// revoking saga is the only path that moves an attempt out of
    /// `running`. Every effective change appends a `run.state` event in the
    /// same transaction.
    pub fn set_run_state(
        &self,
        run_id: &str,
        state: RunState,
        reason: Option<String>,
    ) -> Result<(), LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            match (state, &reason) {
                (RunState::Stopped, None) => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "stopping a run requires a reason",
                    ));
                }
                (RunState::Active, Some(_)) => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "reactivating a run takes no reason",
                    ));
                }
                _ => {}
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let current = get_run_tx(&tx, &run_id)?;
            if current.state == state {
                // Idempotent: no write, no event, and a repeated stop never
                // rewrites the original stop_reason.
                tx.commit()?;
                return Ok(());
            }
            let now = now_iso();
            tx.execute(
                "UPDATE runs SET state = ?1, stop_reason = ?2, updated_at = ?3 \
                 WHERE run_id = ?4",
                rusqlite::params![state.as_str(), reason, now, run_id],
            )?;
            append_event_tx(
                &tx,
                Some(&run_id),
                "run.state",
                &json!({
                    "runId": run_id,
                    "old": current.state.as_str(),
                    "new": state.as_str(),
                    "reason": reason,
                }),
            )?;
            tx.commit()?;
            Ok(())
        })
    }
}
