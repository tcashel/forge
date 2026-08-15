//! One transaction-consistent read for bounded cross-run history.
//!
//! The public history projection pays for one ledger actor job and holds one
//! deferred SQLite snapshot while reading identities, runs, packet
//! definitions, attempt history, the explicit lifecycle vocabulary, and raw
//! usage rows. No caller can accidentally turn this into one query per run.

use std::collections::BTreeMap;

use forged_types::{ErrorCode, WorkIdentitySubjectKind, WorkIdentityV1};
use rusqlite::OptionalExtension;

use crate::attempts::attempt_row;
use crate::error::{refused, LedgerError};
use crate::events::event_row;
use crate::ledger::Ledger;
use crate::packets::packet_row;
use crate::runs::list_runs_tx;
use crate::types::{AttemptRow, EventRow, PacketRow, RunRow, UsageRecord};
use crate::usage::usage_record_row;
use crate::work_identity::list_work_identities_tx;

/// An in-window attempt plus its packet-local ordinal across all time.
#[derive(Debug, Clone, PartialEq)]
pub struct HistoryAttemptRow {
    pub run_id: String,
    pub attempt: AttemptRow,
    pub ordinal: u64,
}

/// Everything the history projector needs, read at one SQLite revision.
#[derive(Debug)]
pub struct HistorySnapshot {
    pub runs: Vec<RunRow>,
    pub packets: Vec<PacketRow>,
    pub attempts: Vec<HistoryAttemptRow>,
    pub events: Vec<EventRow>,
    pub usage: Vec<UsageRecord>,
    pub work_identities: BTreeMap<(WorkIdentitySubjectKind, String), WorkIdentityV1>,
}

/// The only append-only transition families history interprets.
pub const HISTORY_EVENT_KINDS: [&str; 7] = [
    "run.settled",
    "forged.epic.started",
    "forged.epic.paused",
    "forged.epic.resumed",
    "forged.epic.pr",
    "attempt.state",
    "forged.profile.escalated",
];

impl Ledger {
    /// Read one half-open history window in one deferred transaction.
    ///
    /// Attempt ordinals are computed against every older attempt for the
    /// packet before the requested window predicate is applied. Packet rows
    /// are restricted to those referenced by in-window attempt or usage
    /// facts. Runs and identities are small dimension tables and are scanned
    /// once so identity joins never require a fallback read.
    pub fn history_snapshot(&self, from: &str, to: &str) -> Result<HistorySnapshot, LedgerError> {
        let from_ts: jiff::Timestamp = from.parse().map_err(|error| {
            refused(
                ErrorCode::InvalidRequest,
                format!("invalid history from timestamp {from:?}: {error}"),
            )
        })?;
        let to_ts: jiff::Timestamp = to.parse().map_err(|error| {
            refused(
                ErrorCode::InvalidRequest,
                format!("invalid history to timestamp {to:?}: {error}"),
            )
        })?;
        if from_ts >= to_ts {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "history window must satisfy from < to",
            ));
        }
        let from = from.to_owned();
        let to = to.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction()?;

            // Window predicates are lexical over the ledger's fixed-width
            // UTC text. Refuse malformed durable clocks before applying
            // them, otherwise a corrupt value could sort outside the window
            // and disappear as if it never happened.
            let malformed: Option<(String, String)> = tx
                .query_row(
                    "SELECT field, value FROM ( \
                       SELECT 'runs.created_at' field, created_at value FROM runs \
                       UNION ALL SELECT 'runs.updated_at', updated_at FROM runs \
                       UNION ALL SELECT 'packets.created_at', created_at FROM packets \
                       UNION ALL SELECT 'attempts.started_at', started_at FROM attempts \
                       UNION ALL SELECT 'attempts.updated_at', updated_at FROM attempts \
                       UNION ALL SELECT 'attempts.last_heartbeat_at', last_heartbeat_at \
                         FROM attempts WHERE last_heartbeat_at IS NOT NULL \
                       UNION ALL SELECT 'attempts.ended_at', ended_at \
                         FROM attempts WHERE ended_at IS NOT NULL \
                       UNION ALL SELECT 'events.ts', ts FROM events \
                         WHERE kind IN ('run.settled','forged.epic.started', \
                                        'forged.epic.paused','forged.epic.resumed', \
                                        'forged.epic.pr','attempt.state', \
                                        'forged.profile.escalated') \
                       UNION ALL SELECT 'usage.ts', ts FROM usage \
                       UNION ALL SELECT 'work_identities.captured_at', captured_at \
                         FROM work_identities \
                     ) WHERE length(value) != 30 \
                          OR value NOT GLOB \
                            '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]Z' \
                          OR julianday(value) IS NULL \
                          OR substr(value, 1, 19) != \
                             strftime('%Y-%m-%dT%H:%M:%S', value) \
                        LIMIT 1",
                    [],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .optional()?;
            if let Some((field, value)) = malformed {
                return Err(crate::error::internal(format!(
                    "malformed stored timestamp {field}={value:?}"
                )));
            }

            let runs = list_runs_tx(&tx)?;
            let work_identities = list_work_identities_tx(&tx)?;

            let packets = {
                let mut statement = tx.prepare(
                    "SELECT p.packet_id, p.run_id, p.stage, p.seq, p.spec_path, \
                            p.spec_sha256, p.spec_revision, p.body_json, p.created_at \
                     FROM packets p \
                     WHERE EXISTS (SELECT 1 FROM attempts a WHERE a.packet_id = p.packet_id \
                                   AND ((a.started_at >= ?1 AND a.started_at < ?2) \
                                     OR (a.updated_at >= ?1 AND a.updated_at < ?2) \
                                     OR (a.ended_at >= ?1 AND a.ended_at < ?2))) \
                        OR EXISTS (SELECT 1 FROM usage u WHERE u.packet_id = p.packet_id \
                                   AND u.ts >= ?1 AND u.ts < ?2) \
                        OR EXISTS (SELECT 1 FROM events e \
                                   WHERE e.kind = 'attempt.state' \
                                     AND e.ts >= ?1 AND e.ts < ?2 \
                                     AND json_extract(e.payload_json, '$.packetId') = p.packet_id) \
                     ORDER BY p.created_at, p.rowid",
                )?;
                let rows = statement
                    .query_map(rusqlite::params![from, to], packet_row)?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            };

            let attempts = {
                let mut statement = tx.prepare(
                    "SELECT a.attempt_id, a.packet_id, a.claim_token, a.claimant, a.state, \
                            a.revoke_reason, a.revoke_scope, a.fail_note, a.result_json, \
                            a.started_at, a.updated_at, a.last_heartbeat_at, a.ended_at, \
                            p.run_id, \
                            (SELECT COUNT(*) FROM attempts previous \
                             WHERE previous.packet_id = a.packet_id \
                               AND previous.attempt_id <= a.attempt_id) AS ordinal \
                     FROM attempts a JOIN packets p ON p.packet_id = a.packet_id \
                     WHERE (a.started_at >= ?1 AND a.started_at < ?2) \
                        OR (a.updated_at >= ?1 AND a.updated_at < ?2) \
                        OR (a.ended_at >= ?1 AND a.ended_at < ?2) \
                     ORDER BY a.attempt_id",
                )?;
                let rows = statement.query_map(rusqlite::params![from, to], |row| {
                    let ordinal: i64 = row.get(14)?;
                    let ordinal = u64::try_from(ordinal).map_err(|error| {
                        rusqlite::Error::FromSqlConversionFailure(
                            14,
                            rusqlite::types::Type::Integer,
                            Box::new(error),
                        )
                    })?;
                    if ordinal == 0 {
                        return Err(rusqlite::Error::FromSqlConversionFailure(
                            14,
                            rusqlite::types::Type::Integer,
                            Box::new(std::io::Error::new(
                                std::io::ErrorKind::InvalidData,
                                "attempt ordinal is zero",
                            )),
                        ));
                    }
                    Ok(HistoryAttemptRow {
                        run_id: row.get(13)?,
                        attempt: attempt_row(row)?,
                        ordinal,
                    })
                })?;
                rows.collect::<Result<Vec<_>, _>>()?
            };

            let events = {
                let mut statement = tx.prepare(
                    "SELECT event_id, ts, run_id, kind, payload_json FROM events \
                     WHERE kind IN ('run.settled','forged.epic.started', \
                                    'forged.epic.paused','forged.epic.resumed', \
                                    'forged.epic.pr','attempt.state', \
                                    'forged.profile.escalated') \
                       AND ts >= ?1 AND ts < ?2 \
                     ORDER BY event_id",
                )?;
                let rows = statement
                    .query_map(rusqlite::params![from, to], event_row)?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            };

            let usage = {
                let mut statement = tx.prepare(
                    "SELECT run_id, packet_id, attempt_id, provider, model, input_tokens, \
                            output_tokens, cache_read_tokens, cache_write_tokens, cost_usd, \
                            pricing_basis, rate_limit_used_percent, ts, web_search_requests \
                     FROM usage WHERE ts >= ?1 AND ts < ?2 ORDER BY usage_id",
                )?;
                let rows = statement
                    .query_map(rusqlite::params![from, to], usage_record_row)?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            };

            // Taking an explicit commit makes the snapshot lifetime obvious;
            // a failed commit is surfaced rather than returning partially
            // read facts.
            tx.commit()?;
            Ok(HistorySnapshot {
                runs,
                packets,
                attempts,
                events,
                usage,
                work_identities,
            })
        })
    }
}
