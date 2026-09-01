//! Packet rows: deterministic ids and crash-safe idempotent opens.
//!
//! `body_json` is a caller-serialized `WorkPacket` stored as given — the
//! ledger is a dumb durable store and never parses, deserializes, or
//! validates it. Identity validation is the caller's job.

use forged_types::ErrorCode;
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};

use crate::error::{refused, LedgerError};
use crate::ledger::Ledger;
use crate::runs::require_run;
use crate::time::now_iso;
use crate::types::{stage_as_str, stage_from_db, NewPacket, PacketRow};

pub(crate) const PACKET_COLUMNS: &str = "packet_id, run_id, stage, seq, spec_path, spec_sha256, \
     spec_revision, policy_revision, body_json, created_at";

type PacketReplayFields = (String, String, Option<String>, Option<i64>, String);

pub(crate) fn packet_row(row: &rusqlite::Row<'_>) -> Result<PacketRow, rusqlite::Error> {
    Ok(PacketRow {
        packet_id: row.get(0)?,
        run_id: row.get(1)?,
        stage: stage_from_db(&row.get::<_, String>(2)?).map_err(|_| {
            rusqlite::Error::InvalidColumnType(2, "stage".to_owned(), rusqlite::types::Type::Text)
        })?,
        seq: row.get(3)?,
        spec_path: row.get(4)?,
        spec_sha256: row.get(5)?,
        spec_revision: row.get(6)?,
        policy_revision: row
            .get::<_, Option<i64>>(7)?
            .map(u32::try_from)
            .transpose()
            .map_err(|error| {
                rusqlite::Error::FromSqlConversionFailure(
                    7,
                    rusqlite::types::Type::Integer,
                    Box::new(error),
                )
            })?,
        body_json: row.get(8)?,
        created_at: row.get(9)?,
    })
}

pub(crate) fn get_packet_tx(conn: &Connection, packet_id: &str) -> Result<PacketRow, LedgerError> {
    let sql = format!("SELECT {PACKET_COLUMNS} FROM packets WHERE packet_id = ?1");
    conn.query_row(&sql, [packet_id], packet_row)
        .optional()?
        .ok_or_else(|| {
            refused(
                ErrorCode::InvalidRequest,
                format!("no packet {packet_id:?}"),
            )
        })
}

impl Ledger {
    /// Open (or idempotently re-open) a packet, returning its deterministic
    /// id `"<run>/<stage>/<seq>"`.
    ///
    /// Re-opening with byte-identical content adds no row. Re-opening with a
    /// DIFFERENT spec re-pins the row's spec columns — see
    /// [`Ledger::open_packet_with_id`] for the guards that keep a live seat's
    /// spec, and any packet's definition, from moving under it. An unknown
    /// run refuses with `RunNotFound`.
    pub fn open_packet(&self, new_packet: NewPacket) -> Result<String, LedgerError> {
        let packet_id = format!(
            "{}/{}/{}",
            new_packet.run_id,
            stage_as_str(new_packet.stage),
            new_packet.seq
        );
        self.open_packet_with_id(new_packet, packet_id)
    }

    /// Re-pin an already-open packet's spec, in ONE guarded transaction.
    ///
    /// The re-pin exists because a work's spec can be revised under a packet
    /// that is already open, and the row must follow. It is deliberately NOT
    /// an operation: an operation fence stores one response per idempotency
    /// key and replays it, so a work edited A -> B -> A reproduces the key
    /// its first open at A already stored and replays that response over a
    /// row still pinned at B. This `Immediate` transaction is the right
    /// fence — atomic, and re-reading current state on every call rather
    /// than remembering a previous one.
    ///
    /// The BODY NEVER LEAVES THE DATABASE. `open_packet_with_id` compares a
    /// caller-supplied `body_json` to guard the definition, which forces a
    /// re-pinning caller to read the row first and hand its own body back —
    /// a read and a write in separate transactions, with a window between
    /// them in which the definition it just checked can change. Here the
    /// definition is never a parameter, so there is nothing to check and no
    /// window: a re-pin revises the spec columns and can touch nothing else.
    ///
    /// Refused when the packet does not exist, or the moment it has a
    /// `running`, `revoking`, or `completed` attempt — a seat's spec must
    /// never move underneath it, and a settled packet is history. Re-pinning
    /// to the values already stored is a no-op, not a refusal.
    pub fn repin_packet_spec(
        &self,
        packet_id: String,
        spec_path: String,
        spec_sha256: String,
        spec_revision: Option<String>,
    ) -> Result<(), LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let stored: Option<(String, String, Option<String>)> = tx
                .query_row(
                    "SELECT spec_path, spec_sha256, spec_revision FROM packets \
                     WHERE packet_id = ?1",
                    [&packet_id],
                    |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
                )
                .optional()?;
            let Some((stored_path, stored_sha256, stored_revision)) = stored else {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("packet {packet_id:?} is not open and cannot be re-pinned"),
                ));
            };
            if stored_path == spec_path
                && stored_sha256 == spec_sha256
                && stored_revision == spec_revision
            {
                tx.commit()?;
                return Ok(());
            }
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
                    ErrorCode::InvalidRequest,
                    format!("packet {packet_id:?} has a {state} attempt and cannot be re-pinned"),
                ));
            }
            tx.execute(
                "UPDATE packets SET spec_path = ?2, spec_sha256 = ?3, \
                 spec_revision = ?4 WHERE packet_id = ?1",
                rusqlite::params![packet_id, spec_path, spec_sha256, spec_revision],
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Open a definition-backed packet under a caller-supplied semantic id.
    /// The id must be `<run>/<safe-stage-id>/<positive-round>` and is checked
    /// against `new_packet.run_id`; storage still carries a temporary v0 lane.
    ///
    /// RE-PIN: a re-open whose spec differs from the stored one rewrites the
    /// row's SPEC COLUMNS — this is how a revised spec reaches an
    /// already-open packet, and the whole reason a run survives an edit. It
    /// is refused the moment the packet has a `running`, `revoking`, or
    /// `completed` attempt: a seat's spec must never move underneath it, and
    /// a settled packet is history.
    ///
    /// A differing `body_json` is NOT a re-pin and is refused with
    /// `InvalidRequest`. The body is the packet's DEFINITION — worktree,
    /// branch, contract, roster hints — fixed when the packet was opened,
    /// and it carries no spec and no identity of its own to be revised
    /// (`WorkPacket::stored_body`). Accepting a differing one would silently
    /// redefine work the run has already committed to.
    pub fn open_packet_with_id(
        &self,
        new_packet: NewPacket,
        packet_id: String,
    ) -> Result<String, LedgerError> {
        let expected_prefix = format!("{}/", new_packet.run_id);
        let suffix = packet_id.strip_prefix(&expected_prefix).ok_or_else(|| {
            refused(
                ErrorCode::InvalidRequest,
                "semantic packet id does not belong to its run",
            )
        })?;
        let (stage_id, round) = suffix
            .rsplit_once('/')
            .ok_or_else(|| refused(ErrorCode::InvalidRequest, "semantic packet id has no round"))?;
        let valid_stage = !stage_id.is_empty()
            && stage_id.len() <= 64
            && stage_id.chars().all(|character| {
                character.is_ascii_lowercase()
                    || character.is_ascii_digit()
                    || matches!(character, '.' | '_' | '-')
            });
        if !valid_stage || round.parse::<u8>().is_err() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "semantic packet id has an invalid stage or round",
            ));
        }
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            require_run(&tx, &new_packet.run_id)?;
            let existing: Option<PacketReplayFields> = tx
                .query_row(
                    "SELECT spec_path, spec_sha256, spec_revision, policy_revision, body_json \
                     FROM packets \
                     WHERE packet_id = ?1",
                    [&packet_id],
                    |row| {
                        Ok((
                            row.get(0)?,
                            row.get(1)?,
                            row.get(2)?,
                            row.get(3)?,
                            row.get(4)?,
                        ))
                    },
                )
                .optional()?;
            if let Some((spec_path, spec_sha256, spec_revision, policy_revision, body_json)) =
                existing
            {
                if body_json != new_packet.body_json
                    || policy_revision != new_packet.policy_revision.map(i64::from)
                {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!(
                            "packet {packet_id:?} is already open with a different definition; \
                             a re-open may re-pin the spec and nothing else"
                        ),
                    ));
                }
                if spec_path == new_packet.spec_path
                    && spec_sha256 == new_packet.spec_sha256
                    && spec_revision == new_packet.spec_revision
                {
                    tx.commit()?;
                    return Ok(packet_id);
                }
                let settled: Option<String> = tx
                    .query_row(
                        "SELECT state FROM attempts WHERE packet_id = ?1 \
                         AND state IN ('running','revoking','completed') LIMIT 1",
                        [&packet_id],
                        |row| row.get(0),
                    )
                    .optional()?;
                if let Some(state) = settled {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!(
                            "packet {packet_id:?} has a {state} attempt and cannot be re-pinned"
                        ),
                    ));
                }
                tx.execute(
                    "UPDATE packets SET spec_path = ?2, spec_sha256 = ?3, \
                     spec_revision = ?4 WHERE packet_id = ?1",
                    rusqlite::params![
                        packet_id,
                        new_packet.spec_path,
                        new_packet.spec_sha256,
                        new_packet.spec_revision,
                    ],
                )?;
                tx.commit()?;
                return Ok(packet_id);
            }
            tx.execute(
                "INSERT INTO packets (packet_id, run_id, stage, seq, spec_path, \
                 spec_sha256, spec_revision, policy_revision, body_json, created_at) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                rusqlite::params![
                    packet_id,
                    new_packet.run_id,
                    stage_as_str(new_packet.stage),
                    new_packet.seq,
                    new_packet.spec_path,
                    new_packet.spec_sha256,
                    new_packet.spec_revision,
                    new_packet.policy_revision,
                    new_packet.body_json,
                    now_iso(),
                ],
            )?;
            tx.commit()?;
            Ok(packet_id)
        })
    }

    /// Fetch one packet, refusing with `InvalidRequest` when absent.
    pub fn get_packet(&self, packet_id: &str) -> Result<PacketRow, LedgerError> {
        let packet_id = packet_id.to_owned();
        self.submit(move |conn| get_packet_tx(conn, &packet_id))
    }

    /// A run's packets, ordered by `created_at` then rowid ascending. An
    /// unknown run refuses with `RunNotFound`.
    pub fn list_packets(&self, run_id: &str) -> Result<Vec<PacketRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            require_run(conn, &run_id)?;
            let sql = format!(
                "SELECT {PACKET_COLUMNS} FROM packets WHERE run_id = ?1 \
                 ORDER BY created_at, rowid"
            );
            let mut stmt = conn.prepare(&sql)?;
            let rows = stmt.query_map([&run_id], packet_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }
}
