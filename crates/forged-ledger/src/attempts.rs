//! The attempt saga: claim → running → (completed | failed | revoking →
//! (reclaimed | stopped)), with the partial unique index as the race
//! backstop.
//!
//! Saga order (the epic's third seam contract): the durable `revoking`
//! marker COMMITS before any external kill or bd reclaim, and neither
//! `reclaimed` nor `stopped` is reachable except from `revoking` — there is
//! no path that skips the marker. While `revoking`, the fence refuses
//! everything under that token.
//!
//! `revoking` has TWO terminal exits because the revocation has two scopes.
//! `reclaimed` is the bead-scoped one: the reclaim saga confirmed a dead
//! worker and took its bd lease back. `stopped` is the attempt-local one: an
//! operator ended one attempt, the lease was never in scope and is untouched.
//! Both are kill-confirmed; a reader tells them apart to know which happened.
//!
//! Which exit a marker is HEADED for is durable too, in `revoke_scope`,
//! committed with the marker itself. Without it a stop whose `kill_confirmed`
//! failed is a `revoking` row indistinguishable from a dead worker's, and the
//! next reconcile pass resumes it through the bead-scoped reclaim the stop
//! exists to avoid.

use forged_types::{new_claim_token, ErrorCode, PacketResult};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{column_decode_error, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{AttemptRow, AttemptState, ClaimedAttempt, RevokeScope, SpecFence};

const ATTEMPT_COLUMNS: &str =
    "attempt_id, packet_id, claim_token, claimant, state, revoke_reason, revoke_scope, \
     fail_note, result_json, started_at, updated_at, last_heartbeat_at, ended_at";

/// Decode a stored `attempts.state`, failing CLOSED: only the six DDL CHECK
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
        "stopped" => Ok(AttemptState::Stopped),
        other => Err(column_decode_error(idx, "attempt state", other)),
    }
}

/// Decode a stored `attempts.revoke_scope`, failing CLOSED on an
/// unrecognized string exactly as [`attempt_state`] does. `NULL` is not a
/// failure: it is every row written before the column existed, plus every
/// row that has never been revoked.
fn revoke_scope(idx: usize, s: Option<String>) -> Result<Option<RevokeScope>, rusqlite::Error> {
    match s.as_deref() {
        None => Ok(None),
        Some("bead") => Ok(Some(RevokeScope::Bead)),
        Some("attempt") => Ok(Some(RevokeScope::Attempt)),
        Some(other) => Err(column_decode_error(idx, "revoke scope", other)),
    }
}

pub(crate) fn attempt_row(row: &rusqlite::Row<'_>) -> Result<AttemptRow, rusqlite::Error> {
    Ok(AttemptRow {
        attempt_id: row.get(0)?,
        packet_id: row.get(1)?,
        claim_token: row.get(2)?,
        claimant: row.get(3)?,
        state: attempt_state(4, &row.get::<_, String>(4)?)?,
        revoke_reason: row.get(5)?,
        revoke_scope: revoke_scope(6, row.get::<_, Option<String>>(6)?)?,
        fail_note: row.get(7)?,
        result_json: row.get(8)?,
        started_at: row.get(9)?,
        updated_at: row.get(10)?,
        last_heartbeat_at: row.get(11)?,
        ended_at: row.get(12)?,
    })
}

/// Live attempts inside the caller's transaction — see
/// [`Ledger::list_live_attempts`] for the contract.
pub(crate) fn list_live_attempts_tx(
    conn: &Connection,
    run_id: Option<&str>,
) -> Result<Vec<AttemptRow>, LedgerError> {
    let sql = "SELECT a.attempt_id, a.packet_id, a.claim_token, a.claimant, a.state, \
         a.revoke_reason, a.revoke_scope, a.fail_note, a.result_json, a.started_at, \
         a.updated_at, a.last_heartbeat_at, a.ended_at \
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
}

/// Terminal attempts whose immutable artifact join is absent, inside the
/// caller's observational transaction.
pub(crate) fn list_attempts_missing_artifacts_tx(
    conn: &Connection,
) -> Result<Vec<AttemptRow>, LedgerError> {
    let sql = "SELECT a.attempt_id, a.packet_id, a.claim_token, a.claimant, a.state, \
         a.revoke_reason, a.revoke_scope, a.fail_note, a.result_json, a.started_at, \
         a.updated_at, a.last_heartbeat_at, a.ended_at \
         FROM attempts a WHERE a.state IN ('completed', 'failed') \
         AND NOT EXISTS (SELECT 1 FROM attempt_artifacts aa WHERE aa.attempt_id = a.attempt_id) \
         ORDER BY a.rowid";
    let mut stmt = conn.prepare(sql)?;
    let rows = stmt.query_map([], attempt_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
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

/// Terminal attempt settlement releases its transferred capacity in the
/// same transaction as the attempt state. Older attempts simply match zero.
fn release_attempt_reservation_tx(
    conn: &Connection,
    attempt_id: i64,
    now: &str,
) -> Result<(), LedgerError> {
    conn.execute(
        "UPDATE admission_reservations SET state = 'released', updated_at = ?1, \
         released_at = COALESCE(released_at, ?1), last_error = NULL \
         WHERE owner_kind = 'attempt' AND owner_id = ?2 AND state != 'released'",
        rusqlite::params![now, attempt_id.to_string()],
    )?;
    Ok(())
}

fn stale_token() -> LedgerError {
    refused(ErrorCode::StaleClaimToken, "claim token is not running")
}

fn validate_packet_admission_tx(
    conn: &Connection,
    packet_id: &str,
    reservation_id: &str,
) -> Result<(), LedgerError> {
    let facts = conn
        .query_row(
            "SELECT ar.subject_id, ar.control_revision, ar.repository, ar.provider, ar.model, \
                    ar.resource_class, ar.state, ar.owner_kind, r.repo \
             FROM admission_reservations ar \
             JOIN packets p ON p.packet_id = ?1 \
             JOIN runs r ON r.run_id = p.run_id \
             WHERE ar.reservation_id = ?2 AND ar.subject_kind = 'packet'",
            rusqlite::params![packet_id, reservation_id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, i64>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, String>(4)?,
                    row.get::<_, String>(5)?,
                    row.get::<_, String>(6)?,
                    row.get::<_, Option<String>>(7)?,
                    row.get::<_, String>(8)?,
                ))
            },
        )
        .optional()?
        .ok_or_else(|| {
            refused(
                ErrorCode::OperationInProgress,
                format!("packet {packet_id:?} has no matching admission reservation"),
            )
        })?;
    let desired = match crate::admission::packet_authorization_subject_tx(conn, packet_id)? {
        Some((kind, id)) => conn
            .query_row(
                "SELECT desired_state, control_revision, exhausted_at FROM desired_work \
                 WHERE subject_kind = ?1 AND subject_id = ?2",
                rusqlite::params![kind.as_str(), id],
                |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, i64>(1)?,
                        row.get::<_, Option<String>>(2)?,
                    ))
                },
            )
            .optional()?,
        None => None,
    };
    let packet_facts = crate::admission::packet_effective_facts_tx(conn, packet_id)?;
    let authorized = facts.0 == packet_id
        && facts.2 == facts.8
        && packet_facts.provider == facts.3
        && packet_facts.model == facts.4
        && match packet_facts.resource_class {
            forged_types::AdmissionResourceClass::Read => "read",
            forged_types::AdmissionResourceClass::RepositoryWrite => "repository-write",
        } == facts.5
        && matches!(facts.6.as_str(), "reserved" | "orphaned")
        && facts.7.is_none()
        && desired
            .as_ref()
            .is_some_and(|(state, revision, exhausted)| {
                state == "running" && *revision == facts.1 && exhausted.is_none()
            });
    if !authorized {
        return Err(refused(
            ErrorCode::OperationInProgress,
            format!("packet {packet_id:?} admission no longer matches running desired work"),
        ));
    }
    Ok(())
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
    /// just now, by re-hashing the spec file or re-rendering the bead's
    /// body, because the ledger does no file or process IO — must equal the
    /// stored fence, else `SpecDrift`. Re-claim is legal after `failed`
    /// or `reclaimed`, refused while any attempt is `running` or `revoking`
    /// (the partial unique index is the race backstop), and refused after
    /// `completed`.
    ///
    /// RE-PIN OF THE WRITE TOKEN: for a bead-sourced packet the comparison
    /// is over `body_sha256` alone. bd mints a fresh `revision` on every
    /// write to the bead — the lease claim and status change forged itself
    /// performs before it resumes a packet included — so a moved revision
    /// over an UNCHANGED body is not drift, and the row's `spec_revision`
    /// is re-pinned to the observed value in this same transaction. A moved
    /// body is drift, whatever the revision says.
    pub fn claim_packet(
        &self,
        packet_id: &str,
        claimant: &str,
        current: &SpecFence,
    ) -> Result<ClaimedAttempt, LedgerError> {
        self.claim_packet_inner(packet_id, claimant, current, None)
    }

    /// Claim and atomically transfer an admission reservation to the new
    /// attempt. There is no unowned gap and the capacity projector excludes
    /// the linked reservation while this live attempt exists.
    pub fn claim_packet_with_admission(
        &self,
        packet_id: &str,
        claimant: &str,
        current: &SpecFence,
        reservation_id: &str,
    ) -> Result<ClaimedAttempt, LedgerError> {
        self.claim_packet_inner(packet_id, claimant, current, Some(reservation_id))
    }

    fn claim_packet_inner(
        &self,
        packet_id: &str,
        claimant: &str,
        current: &SpecFence,
        reservation_id: Option<&str>,
    ) -> Result<ClaimedAttempt, LedgerError> {
        let packet_id = packet_id.to_owned();
        let claimant = claimant.to_owned();
        let current = current.clone();
        let reservation_id = reservation_id.map(str::to_owned);
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let stored: Option<(String, Option<String>, String)> = tx
                .query_row(
                    "SELECT p.spec_sha256, p.spec_revision, r.state \
                     FROM packets p JOIN runs r ON r.run_id = p.run_id \
                     WHERE p.packet_id = ?1",
                    [&packet_id],
                    |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
                )
                .optional()?;
            let (spec_sha256, spec_revision, run_state) = stored.ok_or_else(|| {
                refused(
                    ErrorCode::PacketNotClaimable,
                    format!("no packet {packet_id:?}"),
                )
            })?;
            if run_state != "active" {
                return Err(refused(
                    ErrorCode::PacketNotClaimable,
                    format!("packet {packet_id:?} belongs to a stopped run"),
                ));
            }
            if let Some(reservation_id) = reservation_id.as_deref() {
                validate_packet_admission_tx(&tx, &packet_id, reservation_id)?;
            }
            let pinned = match spec_revision {
                Some(revision) => SpecFence::Revision {
                    revision,
                    body_sha256: spec_sha256,
                },
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
            // THE DRIFT FENCE, and the contract it is deliberately not:
            //
            // The fence is the SHA-256 of the rendered spec body, never the
            // bead's `revision`. A moved revision alone is not drift because
            // forged's OWN bd writes move it: `bd update --claim --actor
            // <holder>` takes the run's lease and `bd update --status open`
            // reopens the bead, and every bd write mints a fresh revision.
            // Fenced on the revision, the first claim after forged's own
            // lease acquisition would refuse — on every run, forever — while
            // the spec had not changed by one byte.
            //
            // `spec_revision` is PROVENANCE: which bd revision the packet was
            // built from. Same arm and same CONTENT claims, and the row is
            // re-pinned to the observed revision here, in this transaction,
            // so the next reader compares against a live value rather than a
            // dead one. The revision is opaque — equality only, never order.
            //
            // A moved BODY is drift whatever the revision says.
            let repin = match (&pinned, &current) {
                (SpecFence::Sha256(stored), SpecFence::Sha256(observed)) if stored == observed => {
                    None
                }
                (
                    SpecFence::Revision {
                        revision: pinned_revision,
                        body_sha256: pinned_body,
                    },
                    SpecFence::Revision {
                        revision: observed_revision,
                        body_sha256: observed_body,
                    },
                ) if pinned_body == observed_body => {
                    (pinned_revision != observed_revision).then(|| observed_revision.clone())
                }
                _ => {
                    return Err(refused(
                        ErrorCode::SpecDrift,
                        format!("stored spec fence differs for packet {packet_id:?}"),
                    ))
                }
            };
            if let Some(revision) = repin {
                tx.execute(
                    "UPDATE packets SET spec_revision = ?2 WHERE packet_id = ?1",
                    rusqlite::params![packet_id, revision],
                )?;
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
            if let Some(reservation_id) = reservation_id {
                let now = now_iso();
                let affected = tx.execute(
                    "UPDATE admission_reservations SET state = 'active', owner_kind = 'attempt', \
                     owner_id = ?1, last_error = NULL, updated_at = ?2 \
                     WHERE reservation_id = ?3 AND state != 'released' \
                       AND subject_kind = 'packet' AND subject_id = ?4 \
                       AND (owner_kind IS NULL OR (owner_kind = 'attempt' AND owner_id = ?1))",
                    rusqlite::params![attempt_id.to_string(), now, reservation_id, packet_id],
                )?;
                if affected != 1 {
                    return Err(refused(
                        ErrorCode::OperationInProgress,
                        format!("packet {packet_id:?} has no transferable admission reservation"),
                    ));
                }
            }
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
            crate::owned_herdr::request_attempt_cleanup_tx(&tx, attempt.attempt_id, &now)?;
            release_attempt_reservation_tx(&tx, attempt.attempt_id, &now)?;
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
            crate::owned_herdr::request_attempt_cleanup_tx(&tx, attempt.attempt_id, &now)?;
            release_attempt_reservation_tx(&tx, attempt.attempt_id, &now)?;
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
        self.submit(move |conn| list_live_attempts_tx(conn, run_id.as_deref()))
    }

    /// Attempts in exactly `state`, ordered by rowid ascending — the
    /// terminal counterpart of [`Ledger::list_live_attempts`], which by
    /// construction can never return one. `run_id: None` returns all;
    /// `Some(r)` only the attempts whose packet belongs to `r`.
    pub fn list_attempts_in_state(
        &self,
        run_id: Option<&str>,
        state: AttemptState,
    ) -> Result<Vec<AttemptRow>, LedgerError> {
        let run_id = run_id.map(str::to_owned);
        self.submit(move |conn| {
            let sql = "SELECT a.attempt_id, a.packet_id, a.claim_token, a.claimant, a.state, \
                 a.revoke_reason, a.revoke_scope, a.fail_note, a.result_json, a.started_at, \
                 a.updated_at, a.last_heartbeat_at, a.ended_at \
                 FROM attempts a JOIN packets p ON p.packet_id = a.packet_id \
                 WHERE a.state = ?1 AND (?2 IS NULL OR p.run_id = ?2) ORDER BY a.rowid";
            let mut stmt = conn.prepare(sql)?;
            let rows = stmt.query_map(
                rusqlite::params![state.as_str(), run_id.as_deref()],
                attempt_row,
            )?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Durably mark `running → revoking` under [`RevokeScope::Bead`] — the
    /// reclaim saga's marker. See [`Ledger::revoke_attempt_scoped`] for the
    /// contract; an operator's attempt-local stop calls that one with
    /// [`RevokeScope::Attempt`] instead.
    pub fn revoke_attempt(&self, attempt_id: i64, reason: &str) -> Result<(), LedgerError> {
        self.revoke_attempt_scoped(attempt_id, reason, RevokeScope::Bead)
    }

    /// Durably mark `running → revoking` and COMMIT — this marker lands
    /// BEFORE the caller performs any external kill or bd reclaim. `scope`
    /// commits WITH it, and is what a later pass routes on: a marker is
    /// resumed by the revocation that placed it, never by the other one.
    ///
    /// Idempotent when already `revoking` (the original reason, scope, and
    /// timestamps are preserved, and no event is emitted) — first writer
    /// wins the scope, so a stop that arrives after the saga's marker
    /// settles the attempt without inheriting standing over the lease.
    /// Refused with `InvalidRequest` from terminal states.
    pub fn revoke_attempt_scoped(
        &self,
        attempt_id: i64,
        reason: &str,
        scope: RevokeScope,
    ) -> Result<(), LedgerError> {
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
                         revoke_scope = ?2, updated_at = ?3 WHERE attempt_id = ?4",
                        rusqlite::params![reason, scope.as_str(), now, attempt_id],
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
            crate::owned_herdr::request_attempt_cleanup_tx(&tx, attempt_id, &now)?;
            release_attempt_reservation_tx(&tx, attempt_id, &now)?;
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

    /// Move `revoking → stopped` ONLY — the attempt-local terminal exit,
    /// and the only path into it, exactly as [`Ledger::mark_reclaimed`] is
    /// the only path into `reclaimed`.
    ///
    /// Callers invoke this only after kill-confirmed. NOTHING external is
    /// reclaimed on this path: the bd lease is bead-scoped and shared with
    /// every sibling generation, so an attempt-local stop has no standing to
    /// take it. Sets `updated_at` and `ended_at`; the event's reason is the
    /// stored `revoke_reason`.
    pub fn mark_stopped(&self, attempt_id: i64) -> Result<(), LedgerError> {
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
                "UPDATE attempts SET state = 'stopped', updated_at = ?1, ended_at = ?1 \
                 WHERE attempt_id = ?2",
                rusqlite::params![now, attempt_id],
            )?;
            crate::owned_herdr::request_attempt_cleanup_tx(&tx, attempt_id, &now)?;
            release_attempt_reservation_tx(&tx, attempt_id, &now)?;
            attempt_event(
                &tx,
                attempt_id,
                &attempt.packet_id,
                Some(AttemptState::Revoking),
                AttemptState::Stopped,
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

    /// Provider pre-spawn fence: the attempt token, transferred reservation,
    /// and parent desired control epoch must all still agree.
    pub fn assert_admitted_attempt_live(&self, claim_token: &str) -> Result<(), LedgerError> {
        let claim_token = claim_token.to_owned();
        self.submit(move |conn| {
            // `next_wake_at` schedules supervisor observation; it is not an
            // effect authorization bit. A live run controller may be parked
            // for observation/attention while its already-admitted packet is
            // still entitled to start. Control state, control revision, and
            // exhaustion are the atomic pre-spawn revocation fences.
            let attempt = find_attempt_by_token_tx(conn, &claim_token)?
                .filter(|attempt| attempt.state == AttemptState::Running)
                .ok_or_else(stale_token)?;
            let reservation = conn
                .query_row(
                    "SELECT control_revision, repository, provider, model, resource_class \
                     FROM admission_reservations \
                     WHERE owner_kind = 'attempt' AND owner_id = ?1 \
                       AND subject_kind = 'packet' AND subject_id = ?2 AND state = 'active'",
                    rusqlite::params![attempt.attempt_id.to_string(), attempt.packet_id],
                    |row| {
                        Ok((
                            row.get::<_, i64>(0)?,
                            row.get::<_, String>(1)?,
                            row.get::<_, String>(2)?,
                            row.get::<_, String>(3)?,
                            row.get::<_, String>(4)?,
                        ))
                    },
                )
                .optional()?;
            let desired = match crate::admission::packet_authorization_subject_tx(
                conn,
                &attempt.packet_id,
            )? {
                Some((kind, id)) => conn
                    .query_row(
                        "SELECT desired_state, control_revision, exhausted_at FROM desired_work \
                         WHERE subject_kind = ?1 AND subject_id = ?2",
                        rusqlite::params![kind.as_str(), id],
                        |row| {
                            Ok((
                                row.get::<_, String>(0)?,
                                row.get::<_, i64>(1)?,
                                row.get::<_, Option<String>>(2)?,
                            ))
                        },
                    )
                    .optional()?,
                None => None,
            };
            let packet_facts =
                crate::admission::packet_effective_facts_tx(conn, &attempt.packet_id)?;
            let authorized = desired.as_ref().zip(reservation.as_ref()).is_some_and(
                |((state, revision, exhausted), reservation)| {
                    state == "running"
                        && *revision == reservation.0
                        && exhausted.is_none()
                        && packet_facts.repository == reservation.1
                        && packet_facts.provider == reservation.2
                        && packet_facts.model == reservation.3
                        && match packet_facts.resource_class {
                            forged_types::AdmissionResourceClass::Read => "read",
                            forged_types::AdmissionResourceClass::RepositoryWrite => {
                                "repository-write"
                            }
                        } == reservation.4
                },
            );
            if !authorized {
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
            ("stopped", AttemptState::Stopped),
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

    #[test]
    fn revoke_scope_decodes_its_two_strings_and_tolerates_null() {
        assert_eq!(revoke_scope(6, None).expect("null"), None);
        assert_eq!(
            revoke_scope(6, Some("bead".to_owned())).expect("bead"),
            Some(RevokeScope::Bead)
        );
        assert_eq!(
            revoke_scope(6, Some("attempt".to_owned())).expect("attempt"),
            Some(RevokeScope::Attempt)
        );
    }

    #[test]
    fn revoke_scope_fails_closed_on_unknown_strings() {
        for bad in ["", "Bead", "run", "whole-bead"] {
            let err: LedgerError = revoke_scope(6, Some(bad.to_owned()))
                .expect_err("an unknown scope must never default to a scope")
                .into();
            assert!(
                matches!(err, LedgerError::Internal { .. }),
                "{bad:?}: {err}"
            );
        }
    }
}
