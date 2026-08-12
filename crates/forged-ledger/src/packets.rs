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

const PACKET_COLUMNS: &str =
    "packet_id, run_id, stage, seq, spec_path, spec_sha256, body_json, created_at";

fn packet_row(row: &rusqlite::Row<'_>) -> Result<PacketRow, rusqlite::Error> {
    Ok(PacketRow {
        packet_id: row.get(0)?,
        run_id: row.get(1)?,
        stage: stage_from_db(&row.get::<_, String>(2)?).map_err(|_| {
            rusqlite::Error::InvalidColumnType(2, "stage".to_owned(), rusqlite::types::Type::Text)
        })?,
        seq: row.get(3)?,
        spec_path: row.get(4)?,
        spec_sha256: row.get(5)?,
        body_json: row.get(6)?,
        created_at: row.get(7)?,
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
    /// Re-opening with byte-identical content — `spec_path`, `spec_sha256`,
    /// and `body_json` all byte-for-byte equal to the stored row — returns
    /// the existing id and adds no row; any difference refuses with
    /// `InvalidRequest`. An unknown run refuses with `RunNotFound`.
    pub fn open_packet(&self, new_packet: NewPacket) -> Result<String, LedgerError> {
        let packet_id = format!(
            "{}/{}/{}",
            new_packet.run_id,
            stage_as_str(new_packet.stage),
            new_packet.seq
        );
        self.open_packet_with_id(new_packet, packet_id)
    }

    /// Open a definition-backed packet under a caller-supplied semantic id.
    /// The id must be `<run>/<safe-stage-id>/<positive-round>` and is checked
    /// against `new_packet.run_id`; storage still carries a temporary v0 lane.
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
            let existing: Option<(String, String, String)> = tx
                .query_row(
                    "SELECT spec_path, spec_sha256, body_json FROM packets \
                     WHERE packet_id = ?1",
                    [&packet_id],
                    |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
                )
                .optional()?;
            if let Some((spec_path, spec_sha256, body_json)) = existing {
                if spec_path == new_packet.spec_path
                    && spec_sha256 == new_packet.spec_sha256
                    && body_json == new_packet.body_json
                {
                    tx.commit()?;
                    return Ok(packet_id);
                }
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("packet {packet_id:?} already exists with different content"),
                ));
            }
            tx.execute(
                "INSERT INTO packets (packet_id, run_id, stage, seq, spec_path, \
                 spec_sha256, body_json, created_at) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                rusqlite::params![
                    packet_id,
                    new_packet.run_id,
                    stage_as_str(new_packet.stage),
                    new_packet.seq,
                    new_packet.spec_path,
                    new_packet.spec_sha256,
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
