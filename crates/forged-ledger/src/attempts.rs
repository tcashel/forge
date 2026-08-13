//! The attempt saga: claim → running → (completed | failed | revoking →
//! reclaimed), with the partial unique index as the race backstop.
//!
//! Saga order (the epic's third seam contract): the durable `revoking`
//! marker COMMITS before any external kill or bd reclaim, and `reclaimed`
//! is reachable only from `revoking` — there is no path that skips the
//! marker. While `revoking`, the fence refuses everything under that token.

use forged_types::{new_claim_token, ErrorCode, PacketResult};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{column_decode_error, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{AttemptRow, AttemptState, ClaimedAttempt, SpecFence};

const ATTEMPT_COLUMNS: &str =
    "attempt_id, packet_id, claim_token, claimant, state, revoke_reason, fail_note, \
     result_json, started_at, updated_at, last_heartbeat_at, ended_at";

/// Decode a stored `attempts.state`, failing CLOSED: only the five DDL CHECK
/// strings are accepted, and `running` in particular must be stored
/// explicitly — an unrecognized string surfaces as an internal storage
/// error, never as a live attempt the fence would honor.
fn attempt_state(idx: usize, s: &str) -> Result<AttemptState, rusqlite::Error> {
    match s {
        "running" => Ok(AttemptState::Running),
        "completed" => Ok(AttemptState::Completed),
        "failed" => Ok(AttemptState::Failed),
        "revoking" => Ok(AttemptState::Revoking),
        "reclaimed" => Ok(AttemptState::Reclaimed),
        other => Err(column_decode_error(idx, "attempt state", other)),
    }
}

fn attempt_row(row: &rusqlite::Row<'_>) -> Result<AttemptRow, rusqlite::Error> {
    Ok(AttemptRow {
        attempt_id: row.get(0)?,
        packet_id: row.get(1)?,
        claim_token: row.get(2)?,
        claimant: row.get(3)?,
        state: attempt_state(4, &row.get::<_, String>(4)?)?,
        revoke_reason: row.get(5)?,
        fail_note: row.get(6)?,
        result_json: row.get(7)?,
        started_at: row.get(8)?,
        updated_at: row.get(9)?,
        last_heartbeat_at: row.get(10)?,
        ended_at: row.get(11)?,
    })
}

pub(crate) fn find_attempt_by_token_tx(
    conn: &Connection,
    claim_token: &str,
) -> Result<Option<AttemptRow>, LedgerError> {
    let sql = format!("SELECT {ATTEMPT_COLUMNS} FROM attempts WHERE claim_token = ?1");
    Ok(conn
        .query_row(&sql, [claim_token], attempt_row)
        .optional()?)
}

fn get_attempt_tx(conn: &Connection, attempt_id: i64) -> Result<AttemptRow, LedgerError> {
    let sql = format!("SELECT {ATTEMPT_COLUMNS} FROM attempts WHERE attempt_id = ?1");
    conn.query_row(&sql, [attempt_id], attempt_row)
        .optional()?
        .ok_or_else(|| {
            refused(
                ErrorCode::InvalidRequest,
                format!("no attempt {attempt_id}"),
            )
        })
}

/// The run owning `packet_id`, for event attribution.
pub(crate) fn run_of_packet(conn: &Connection, packet_id: &str) -> Result<String, LedgerError> {
    conn.query_row(
        "SELECT run_id FROM packets WHERE packet_id = ?1",
        [packet_id],
        |row| row.get(0),
    )
    .optional()?
    .ok_or_else(|| {
        crate::error::internal(format!("attempt references missing packet {packet_id:?}"))
    })
}

/// Append the `attempt.state` event for a transition, in the caller's
/// transaction, with `events.run_id` set to the owning packet's run.
fn attempt_event(
    conn: &Connection,
    attempt_id: i64,
    packet_id: &str,
    old: Option<AttemptState>,
    new: AttemptState,
    reason: Option<&str>,
) -> Result<(), LedgerError> {
    let run_id = run_of_packet(conn, packet_id)?;
    append_event_tx(
        conn,
        Some(&run_id),
        "attempt.state",
        &json!({
            "attemptId": attempt_id,
            "packetId": packet_id,
            "old": old.map(|s| s.as_str()),
            "new": new.as_str(),
            "reason": reason,
        }),
    )
}

fn stale_token() -> LedgerError {
    refused(ErrorCode::StaleClaimToken, "claim token is not running")
}

/// Fetch the attempt for (`packet_id`, `claim_token`) and require `running`.
fn running_attempt_for(
    conn: &Connection,
    packet_id: &str,
    claim_token: &str,
) -> Result<AttemptRow, LedgerError> {
    let attempt = find_attempt_by_token_tx(conn, claim_token)?
        .filter(|a| a.packet_id == packet_id)
        .ok_or_else(stale_token)?;
    if attempt.state != AttemptState::Running {
        return Err(stale_token());
    }
    Ok(attempt)
}

impl Ledger {
    /// Claim a packet: insert a `running` attempt with a fresh fencing token.
    ///
    /// The packet must exist and have no completed attempt
    /// (`PacketNotClaimable`); `current` — the fence the caller observed
    /// just now, by re-hashing the spec file or re-reading the bead's
    /// revision, because the ledger does no file or process IO — must equal
    /// the stored fence, else `SpecDrift`. Re-claim is legal after `failed`
    /// or `reclaimed`, refused while any attempt is `running` or `revoking`
    /// (the partial unique index is the race backstop), and refused after
    /// `completed`.
    pub fn claim_packet(
        &self,
        packet_id: &str,
        claimant: &str,
        current: &SpecFence,
    ) -> Result<ClaimedAttempt, LedgerError> {
        let packet_id = packet_id.to_owned();
        let claimant = claimant.to_owned();
        let current = current.clone();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let stored: Option<(String, Option<String>)> = tx
                .query_row(
                    "SELECT spec_sha256, spec_revision FROM packets WHERE packet_id = ?1",
                    [&packet_id],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .optional()?;
            let (spec_sha256, spec_revision) = stored.ok_or_else(|| {
                refused(
                    ErrorCode::PacketNotClaimable,
                    format!("no packet {packet_id:?}"),
                )
            })?;
            let pinned = match spec_revision {
                Some(revision) => SpecFence::Revision(revision),
                None => SpecFence::Sha256(spec_sha256),
            };
            let blocking: Option<String> = tx
                .query_row(
                    "SELECT state FROM attempts WHERE packet_id = ?1 \
                     AND state IN ('running','revoking','completed') LIMIT 1",
                    [&packet_id],
                    |row| row.get(0),
                )
                .optional()?;
            if let Some(state) = blocking {
                return Err(refused(
                    ErrorCode::PacketNotClaimable,
                    format!("packet {packet_id:?} has a {state} attempt"),
                ));
            }
            if pinned != current {
                return Err(refused(
                    ErrorCode::SpecDrift,
                    format!("stored spec fence differs for packet {packet_id:?}"),
                ));
            }
            let claim_token = new_claim_token();
            let now = now_iso();
            let inserted = tx.execute(
                "INSERT INTO attempts (packet_id, claim_token, claimant, state, \
                 started_at, updated_at) VALUES (?1, ?2, ?3, 'running', ?4, ?4)",
                rusqlite::params![packet_id, claim_token, claimant, now],
            );
            match inserted {
                Ok(_) => {}
                // The partial unique index is the race backstop.
                Err(rusqlite::Error::SqliteFailure(e, _))
                    if e.code == rusqlite::ErrorCode::ConstraintViolation =>
                {
                    return Err(refused(
                        ErrorCode::PacketNotClaimable,
                        format!("packet {packet_id:?} already has a live attempt"),
                    ));
                }
                Err(err) => return Err(err.into()),
            }
            let attempt_id = tx.last_insert_rowid();
            attempt_event(
                &tx,
                attempt_id,
                &packet_id,
                None,
                AttemptState::Running,
                None,
            )?;
            tx.commit()?;
            Ok(ClaimedAttempt {
                attempt_id,
                claim_token,
            })
        })
    }

    /// Land a result: `running` under that exact token → `completed`, else
    /// `StaleClaimToken`. Sets `updated_at` and `ended_at` to the same stamp.
    pub fn complete_packet(
        &self,
        packet_id: &str,
        claim_token: &str,
        result: &PacketResult,
    ) -> Result<(), LedgerError> {
        let packet_id = packet_id.to_owned();
        let claim_token = claim_token.to_owned();
        let result_json = serde_json::to_string(result);
        self.submit(move |conn| {
            let result_json = result_json?;
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let attempt = running_attempt_for(&tx, &packet_id, &claim_token)?;
            let now = now_iso();
            tx.execute(
                "UPDATE attempts SET state = 'completed', result_json = ?1, \
                 updated_at = ?2, ended_at = ?2 WHERE attempt_id = ?3",
                rusqlite::params![result_json, now, attempt.attempt_id],
            )?;
            attempt_event(
                &tx,
                attempt.attempt_id,
                &packet_id,
                Some(AttemptState::Running),
                AttemptState::Completed,
                None,
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Report failure: `running` under that exact token → `failed`, else
    /// `StaleClaimToken`. The note lands in the attempt's `fail_note` column
    /// AND, verbatim, as the `reason` of the transition's `attempt.state`
    /// event.
    pub fn fail_packet(
        &self,
        packet_id: &str,
        claim_token: &str,
        note: &str,
    ) -> Result<(), LedgerError> {
        let packet_id = packet_id.to_owned();
        let claim_token = claim_token.to_owned();
        let note = note.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let attempt = running_attempt_for(&tx, &packet_id, &claim_token)?;
            let now = now_iso();
            tx.execute(
                "UPDATE attempts SET state = 'failed', fail_note = ?1, \
                 updated_at = ?2, ended_at = ?2 WHERE attempt_id = ?3",
                rusqlite::params![note, now, attempt.attempt_id],
            )?;
            attempt_event(
                &tx,
                attempt.attempt_id,
                &packet_id,
                Some(AttemptState::Running),
                AttemptState::Failed,
                Some(&note),
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Touch `last_heartbeat_at` (and `updated_at`); `StaleClaimToken`
    /// unless the token's attempt is `running`.
    pub fn heartbeat_attempt(&self, claim_token: &str) -> Result<(), LedgerError> {
        let claim_token = claim_token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let attempt = find_attempt_by_token_tx(&tx, &claim_token)?.ok_or_else(stale_token)?;
            if attempt.state != AttemptState::Running {
                return Err(stale_token());
            }
            let now = now_iso();
            tx.execute(
                "UPDATE attempts SET last_heartbeat_at = ?1, updated_at = ?1 \
                 WHERE attempt_id = ?2",
                rusqlite::params![now, attempt.attempt_id],
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Fetch one attempt, refusing with `InvalidRequest` when absent.
    pub fn get_attempt(&self, attempt_id: i64) -> Result<AttemptRow, LedgerError> {
        self.submit(move |conn| get_attempt_tx(conn, attempt_id))
    }

    /// Look up an attempt by its fencing token; `Ok(None)` on a miss.
    pub fn find_attempt_by_token(
        &self,
        claim_token: &str,
    ) -> Result<Option<AttemptRow>, LedgerError> {
        let claim_token = claim_token.to_owned();
        self.submit(move |conn| find_attempt_by_token_tx(conn, &claim_token))
    }

    /// Attempts in `running` or `revoking`, ordered by rowid ascending.
    /// `run_id: None` returns all; `Some(r)` only the attempts whose packet
    /// belongs to `r`.
    pub fn list_live_attempts(&self, run_id: Option<&str>) -> Result<Vec<AttemptRow>, LedgerError> {
        let run_id = run_id.map(str::to_owned);
        self.submit(move |conn| {
            let sql = "SELECT a.attempt_id, a.packet_id, a.claim_token, a.claimant, a.state, \
                 a.revoke_reason, a.fail_note, a.result_json, a.started_at, a.updated_at, \
                 a.last_heartbeat_at, a.ended_at \
                 FROM attempts a JOIN packets p ON p.packet_id = a.packet_id \
                 WHERE a.state IN ('running','revoking') \
                 AND (?1 IS NULL OR p.run_id = ?1) ORDER BY a.rowid";
            let mut stmt = conn.prepare(sql)?;
            let rows = stmt.query_map([&run_id], attempt_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Durably mark `running → revoking` and COMMIT — this marker lands
    /// BEFORE the caller performs any external kill or bd reclaim.
    /// Idempotent when already `revoking` (the original reason and
    /// timestamps are preserved, and no event is emitted); refused with
    /// `InvalidRequest` from terminal states.
    pub fn revoke_attempt(&self, attempt_id: i64, reason: &str) -> Result<(), LedgerError> {
        let reason = reason.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let attempt = get_attempt_tx(&tx, attempt_id)?;
            match attempt.state {
                AttemptState::Revoking => {
                    tx.commit()?;
                    Ok(())
                }
                AttemptState::Running => {
                    let now = now_iso();
                    tx.execute(
                        "UPDATE attempts SET state = 'revoking', revoke_reason = ?1, \
                         updated_at = ?2 WHERE attempt_id = ?3",
                        rusqlite::params![reason, now, attempt_id],
                    )?;
                    attempt_event(
                        &tx,
                        attempt_id,
                        &attempt.packet_id,
                        Some(AttemptState::Running),
                        AttemptState::Revoking,
                        Some(&reason),
                    )?;
                    tx.commit()?;
                    Ok(())
                }
                _ => Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "attempt {attempt_id} is {}, not running",
                        attempt.state.as_str()
                    ),
                )),
            }
        })
    }

    /// Move `revoking → reclaimed` ONLY — there is no path to `reclaimed`
    /// that skips the durable `revoking` marker. Callers invoke this only
    /// after kill-confirmed plus external reclaim succeed. Sets `updated_at`
    /// and `ended_at`; the event's reason is the stored `revoke_reason`.
    pub fn mark_reclaimed(&self, attempt_id: i64) -> Result<(), LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let attempt = get_attempt_tx(&tx, attempt_id)?;
            if attempt.state != AttemptState::Revoking {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "attempt {attempt_id} is {}, not revoking",
                        attempt.state.as_str()
                    ),
                ));
            }
            let now = now_iso();
            tx.execute(
                "UPDATE attempts SET state = 'reclaimed', updated_at = ?1, ended_at = ?1 \
                 WHERE attempt_id = ?2",
                rusqlite::params![now, attempt_id],
            )?;
            attempt_event(
                &tx,
                attempt_id,
                &attempt.packet_id,
                Some(AttemptState::Revoking),
                AttemptState::Reclaimed,
                attempt.revoke_reason.as_deref(),
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// The fence's mid-flight enforcement point, checked immediately before
    /// an effect fires: `Ok(())` only while the token's attempt is
    /// `running`; unknown tokens and every other state refuse with
    /// `StaleClaimToken`.
    pub fn assert_attempt_live(&self, claim_token: &str) -> Result<(), LedgerError> {
        let claim_token = claim_token.to_owned();
        self.submit(move |conn| {
            let attempt = find_attempt_by_token_tx(conn, &claim_token)?.ok_or_else(stale_token)?;
            if attempt.state != AttemptState::Running {
                return Err(stale_token());
            }
            Ok(())
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn attempt_state_decodes_every_check_string() {
        for (s, want) in [
            ("running", AttemptState::Running),
            ("completed", AttemptState::Completed),
            ("failed", AttemptState::Failed),
            ("revoking", AttemptState::Revoking),
            ("reclaimed", AttemptState::Reclaimed),
        ] {
            assert_eq!(attempt_state(4, s).expect(s), want);
        }
    }

    #[test]
    fn attempt_state_fails_closed_on_unknown_strings() {
        for bad in ["", "Running", "runnin", "zombie"] {
            let err: LedgerError = attempt_state(4, bad)
                .expect_err("unknown state must fail closed, never default to Running")
                .into();
            assert!(
                matches!(err, LedgerError::Internal { .. }),
                "{bad:?}: {err}"
            );
        }
    }
}
