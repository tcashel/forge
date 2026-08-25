//! Bounded exact archive readback and status/integrity seams.

use std::io::Write;

use rusqlite::{params, OptionalExtension};
use sha2::{Digest, Sha256};

use crate::actor::History;
use crate::error::{internal, invalid, HistoryError};
use crate::ingest::{hex_digest, ARCHIVE_BLOCK_TARGET_BYTES};
use crate::time::now_timestamp;
use crate::types::{
    normalize_absolute_path, HistoryStatus, IndexState, SourceFamily, SourceFileState,
    SourceStatus, TombstoneOutcome, TombstoneScope,
};

impl History {
    /// Read one physical source's observation and last committed cursor.
    pub fn source_status(
        &self,
        source_family: SourceFamily,
        root_path: &std::path::Path,
        file_path: &std::path::Path,
    ) -> Result<Option<SourceStatus>, HistoryError> {
        let root_path = normalize_absolute_path(root_path)?
            .to_string_lossy()
            .into_owned();
        let file_path = normalize_absolute_path(file_path)?
            .to_string_lossy()
            .into_owned();
        let source_family = source_family.as_str().to_owned();
        self.submit(move |connection| {
            connection
                .query_row(
                    "SELECT r.source_root_id, f.source_file_id, f.state,
                            c.cursor_value, c.revision_id, c.updated_at
                       FROM history_source_roots r
                       JOIN history_meta h ON h.key='host_id' AND h.value=r.host_id
                       JOIN history_source_files f ON f.source_root_id=r.source_root_id
                       LEFT JOIN history_source_cursors c ON c.source_file_id=f.source_file_id
                      WHERE r.source_family=?1 AND r.root_path=?2 AND f.file_path=?3",
                    params![source_family, root_path, file_path],
                    |row| {
                        let state = row.get::<_, String>(2)?;
                        Ok(SourceStatus {
                            source_root_id: row.get(0)?,
                            source_file_id: row.get(1)?,
                            state: SourceFileState::decode(2, &state)?,
                            cursor: row.get(3)?,
                            cursor_revision_id: row.get(4)?,
                            cursor_updated_at: row.get(5)?,
                        })
                    },
                )
                .optional()
                .map_err(Into::into)
        })
    }

    /// Stream exact retained valid-record bytes directly to `writer`.
    ///
    /// One independently decompressible part is resident at a time. Sequence,
    /// offsets, lengths, per-block digests, and the aggregate revision digest
    /// are validated before success is returned.
    pub fn write_revision_exact<W: Write>(
        &self,
        revision_id: i64,
        writer: &mut W,
    ) -> Result<u64, HistoryError> {
        let (expected_length, expected_sha): (u64, String) = self.submit(move |connection| {
            connection
                .query_row(
                    "SELECT raw_length, raw_sha256
                           FROM history_event_revisions
                          WHERE revision_id=?1 AND visibility='committed'",
                    params![revision_id],
                    |row| {
                        let length: i64 = row.get(0)?;
                        let length = u64::try_from(length).map_err(|error| {
                            rusqlite::Error::FromSqlConversionFailure(
                                0,
                                rusqlite::types::Type::Integer,
                                error.into(),
                            )
                        })?;
                        Ok((length, row.get(1)?))
                    },
                )
                .optional()?
                .ok_or(HistoryError::NotFound)
        })?;
        let mut sequence = 0_u64;
        let mut offset = 0_u64;
        let mut aggregate = Sha256::new();
        loop {
            let part = self.submit(move |connection| {
                connection
                    .query_row(
                        "SELECT p.sequence, p.byte_offset, p.uncompressed_length,
                                b.codec, b.codec_schema, b.sha256, b.compressed_bytes
                           FROM history_event_parts p
                           JOIN history_archive_blocks b ON b.block_id=p.block_id
                          WHERE p.revision_id=?1 AND p.sequence=?2",
                        params![
                            revision_id,
                            i64::try_from(sequence)
                                .map_err(|_| invalid("archive sequence exceeds SQLite range"))?
                        ],
                        |row| {
                            Ok((
                                row.get::<_, i64>(0)?,
                                row.get::<_, i64>(1)?,
                                row.get::<_, i64>(2)?,
                                row.get::<_, String>(3)?,
                                row.get::<_, i64>(4)?,
                                row.get::<_, String>(5)?,
                                row.get::<_, Vec<u8>>(6)?,
                            ))
                        },
                    )
                    .optional()
                    .map_err(Into::into)
            })?;
            let Some((stored_sequence, stored_offset, stored_length, codec, schema, sha, bytes)) =
                part
            else {
                break;
            };
            if stored_sequence != i64::try_from(sequence).unwrap_or(i64::MAX)
                || stored_offset != i64::try_from(offset).unwrap_or(i64::MAX)
            {
                return Err(internal(
                    "archive part sequence or offset is not contiguous",
                ));
            }
            if codec != "zstd" || schema != 1 {
                return Err(internal(format!(
                    "unknown archive codec/schema {codec:?}/{schema}"
                )));
            }
            let stored_length = usize::try_from(stored_length)
                .map_err(|_| internal("negative archive part length"))?;
            if stored_length > ARCHIVE_BLOCK_TARGET_BYTES {
                return Err(internal(
                    "stored archive part exceeds the codec block target",
                ));
            }
            let decoded = zstd::bulk::decompress(&bytes, stored_length)
                .map_err(|error| internal(format!("decompressing archive block: {error}")))?;
            if decoded.len() != stored_length || hex_digest(Sha256::digest(&decoded)) != sha {
                return Err(internal("archive block checksum or length mismatch"));
            }
            writer.write_all(&decoded)?;
            aggregate.update(&decoded);
            offset = offset
                .checked_add(
                    u64::try_from(decoded.len())
                        .map_err(|_| internal("decoded archive length exceeds u64"))?,
                )
                .ok_or_else(|| internal("archive aggregate length overflow"))?;
            sequence = sequence.saturating_add(1);
        }
        let actual_parts: u64 = self.submit(move |connection| {
            let count: i64 = connection.query_row(
                "SELECT count(*) FROM history_event_parts WHERE revision_id=?1",
                params![revision_id],
                |row| row.get(0),
            )?;
            u64::try_from(count).map_err(|_| internal("negative archive part count"))
        })?;
        if actual_parts != sequence || offset != expected_length {
            return Err(internal("archive part count or aggregate length mismatch"));
        }
        if hex_digest(aggregate.finalize()) != expected_sha {
            return Err(internal("aggregate revision SHA-256 mismatch"));
        }
        Ok(offset)
    }

    /// Record digest-confirmed purge evidence. No archive rows are removed.
    pub fn record_tombstone(
        &self,
        scope: TombstoneScope,
        scope_key: &str,
        sha256: &str,
        reason: &str,
    ) -> Result<TombstoneOutcome, HistoryError> {
        validate_sha256(sha256)?;
        if scope_key.is_empty() || reason.is_empty() {
            return Err(invalid("tombstone scope key and reason must be non-empty"));
        }
        let scope = scope.as_str().to_owned();
        let scope_key = scope_key.to_owned();
        let sha256 = sha256.to_owned();
        let reason = reason.to_owned();
        let now = now_timestamp();
        self.submit(move |connection| {
            let transaction =
                connection.transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)?;
            let inserted = transaction.execute(
                "INSERT INTO history_purge_tombstones(
                   scope, scope_key, sha256, reason, created_at
                 ) VALUES (?1, ?2, ?3, ?4, ?5)
                 ON CONFLICT(scope, scope_key) DO NOTHING",
                params![scope, scope_key, sha256, reason, now],
            )?;
            let outcome = if inserted == 1 {
                TombstoneOutcome::Recorded
            } else {
                let (stored_sha, stored_reason): (String, String) = transaction.query_row(
                    "SELECT sha256, reason FROM history_purge_tombstones
                      WHERE scope=?1 AND scope_key=?2",
                    params![scope, scope_key],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )?;
                if stored_sha == sha256 && stored_reason == reason {
                    TombstoneOutcome::Replayed
                } else {
                    return Err(invalid(
                        "conflicting tombstone evidence for the same scope and key",
                    ));
                }
            };
            transaction.commit()?;
            Ok(outcome)
        })
    }

    /// Read aggregate committed/staging and index status without exposing the
    /// SQLite connection.
    pub fn status(&self) -> Result<HistoryStatus, HistoryError> {
        self.submit(|connection| {
            validate_closed_vocabularies(connection)?;
            let host_id: String = connection.query_row(
                "SELECT value FROM history_meta WHERE key='host_id'",
                [],
                |row| row.get(0),
            )?;
            let epoch: String = connection.query_row(
                "SELECT value FROM history_meta WHERE key='corpus_epoch'",
                [],
                |row| row.get(0),
            )?;
            let corpus_epoch = epoch.parse::<u64>().map_err(|error| {
                internal(format!("invalid stored searchable-corpus epoch: {error}"))
            })?;
            let generation = connection
                .query_row(
                    "SELECT g.generation_id, g.state
                       FROM history_meta m
                       JOIN history_index_generations g ON g.generation_id=m.value
                      WHERE m.key='active_generation'",
                    [],
                    |row| {
                        let state = row.get::<_, String>(1)?;
                        Ok((row.get::<_, String>(0)?, IndexState::decode(1, &state)?))
                    },
                )
                .optional()?;
            let count = |sql: &str| -> Result<u64, HistoryError> {
                let value: i64 = connection.query_row(sql, [], |row| row.get(0))?;
                u64::try_from(value).map_err(|_| internal("negative history count"))
            };
            let sessions = count(
                "SELECT count(*) FROM history_sessions s WHERE EXISTS (
                   SELECT 1 FROM history_events e
                   JOIN history_event_revisions r ON r.event_id=e.event_id
                    WHERE e.session_id=s.session_id AND r.visibility='committed'
                 )",
            )?;
            let events = count(
                "SELECT count(*) FROM history_events e WHERE EXISTS (
                   SELECT 1 FROM history_event_revisions r
                    WHERE r.event_id=e.event_id AND r.visibility='committed'
                 )",
            )?;
            let revisions =
                count("SELECT count(*) FROM history_event_revisions WHERE visibility='committed'")?;
            let staging_revisions = count(
                "SELECT count(*) FROM history_event_revisions WHERE visibility!='committed'",
            )?;
            Ok(HistoryStatus {
                host_id,
                corpus_epoch,
                ready_generation: generation
                    .as_ref()
                    .filter(|(_, state)| *state == IndexState::Ready)
                    .map(|(generation, _)| generation.clone()),
                generation_state: generation.map(|(_, state)| state),
                sessions,
                events,
                revisions,
                staging_revisions,
            })
        })
    }

    /// Run SQLite integrity checking plus closed-vocabulary validation.
    pub fn integrity_check(&self) -> Result<(), HistoryError> {
        self.submit(|connection| {
            let result: String =
                connection.query_row("PRAGMA integrity_check", [], |row| row.get(0))?;
            if result != "ok" {
                return Err(internal(format!("history integrity check: {result}")));
            }
            validate_closed_vocabularies(connection)
        })
    }
}

fn validate_sha256(value: &str) -> Result<(), HistoryError> {
    if value.len() != 64
        || !value
            .bytes()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
    {
        return Err(invalid(format!(
            "tombstone digest is not canonical SHA-256: {value:?}"
        )));
    }
    Ok(())
}

fn validate_closed_vocabularies(connection: &rusqlite::Connection) -> Result<(), HistoryError> {
    {
        let mut statement = connection.prepare(
            "SELECT DISTINCT source_family FROM history_sessions
             UNION SELECT DISTINCT source_family FROM history_source_roots",
        )?;
        for value in statement.query_map([], |row| row.get::<_, String>(0))? {
            SourceFamily::decode(0, &value?)?;
        }
    }
    {
        let mut statement = connection
            .prepare("SELECT DISTINCT role FROM history_event_revisions WHERE role IS NOT NULL")?;
        for value in statement.query_map([], |row| row.get::<_, String>(0))? {
            crate::types::EventRole::decode(0, &value?)?;
        }
    }
    {
        let mut statement =
            connection.prepare("SELECT DISTINCT state FROM history_index_generations")?;
        for value in statement.query_map([], |row| row.get::<_, String>(0))? {
            IndexState::decode(0, &value?)?;
        }
    }
    for (sql, allowed, vocabulary) in [
        (
            "SELECT DISTINCT visibility FROM history_event_revisions",
            &["staging", "cleaning", "committed"][..],
            "revision visibility",
        ),
        (
            "SELECT DISTINCT state FROM history_source_files",
            &["present", "missing"][..],
            "source-file state",
        ),
    ] {
        let mut statement = connection.prepare(sql)?;
        for value in statement.query_map([], |row| row.get::<_, String>(0))? {
            let value = value?;
            if !allowed.contains(&value.as_str()) {
                return Err(internal(format!(
                    "unknown {vocabulary} in history database: {value:?}"
                )));
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{PreparedEvent, SourceFamily};
    use std::io::Cursor;

    #[test]
    fn tombstones_accept_only_exact_replay() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let digest = "a".repeat(64);
        assert_eq!(
            history
                .record_tombstone(TombstoneScope::Session, "session", &digest, "operator")
                .unwrap(),
            TombstoneOutcome::Recorded
        );
        assert_eq!(
            history
                .record_tombstone(TombstoneScope::Session, "session", &digest, "operator")
                .unwrap(),
            TombstoneOutcome::Replayed
        );
        assert!(history
            .record_tombstone(
                TombstoneScope::Session,
                "session",
                &"b".repeat(64),
                "operator"
            )
            .is_err());
        assert!(history
            .record_tombstone(TombstoneScope::Revision, "revision", "bad", "operator")
            .is_err());
    }

    #[test]
    fn concurrent_identical_tombstones_are_recorded_then_replayed() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let first = History::open(&path).unwrap();
        let second = History::open_existing(&path).unwrap().unwrap();
        let barrier = std::sync::Arc::new(std::sync::Barrier::new(2));
        let first_barrier = barrier.clone();
        let first = std::thread::spawn(move || {
            first_barrier.wait();
            let outcome = first.record_tombstone(
                TombstoneScope::Session,
                "concurrent",
                &"c".repeat(64),
                "operator",
            );
            (first, outcome)
        });
        let second = std::thread::spawn(move || {
            barrier.wait();
            let outcome = second.record_tombstone(
                TombstoneScope::Session,
                "concurrent",
                &"c".repeat(64),
                "operator",
            );
            (second, outcome)
        });
        let (first, first_outcome) = first.join().unwrap();
        let (second, second_outcome) = second.join().unwrap();
        let mut outcomes = [first_outcome.unwrap(), second_outcome.unwrap()];
        outcomes.sort_by_key(|outcome| match outcome {
            TombstoneOutcome::Recorded => 0,
            TombstoneOutcome::Replayed => 1,
        });
        assert_eq!(
            outcomes,
            [TombstoneOutcome::Recorded, TombstoneOutcome::Replayed]
        );
        first.close().unwrap();
        second.close().unwrap();
    }

    #[test]
    fn unknown_stored_vocabulary_fails_closed() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        history
            .submit(|connection| {
                connection.execute_batch("PRAGMA ignore_check_constraints=ON;")?;
                connection.execute("UPDATE history_index_generations SET state='future'", [])?;
                Ok(())
            })
            .unwrap();
        assert!(history.status().is_err());
    }

    #[test]
    fn exact_readback_rejects_offset_block_and_aggregate_corruption() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut prepared = PreparedEvent::new(
            SourceFamily::Codex,
            "session",
            "parser/v1",
            "2026-08-25T00:00:00Z",
        );
        prepared.native_event_key = Some("event".to_owned());
        let mut builder = history.begin_event(prepared).unwrap();
        builder.push_raw_part(Cursor::new(b"exact bytes")).unwrap();
        let revision_id = builder.finish().unwrap().revision_id();

        history
            .submit(move |connection| {
                connection.execute(
                    "UPDATE history_event_parts SET byte_offset=1 WHERE revision_id=?1",
                    params![revision_id],
                )?;
                Ok(())
            })
            .unwrap();
        assert!(history
            .write_revision_exact(revision_id, &mut Vec::new())
            .is_err());
        history
            .submit(move |connection| {
                connection.execute(
                    "UPDATE history_event_parts SET byte_offset=0 WHERE revision_id=?1",
                    params![revision_id],
                )?;
                connection.execute(
                    "UPDATE history_archive_blocks SET sha256=?1
                      WHERE block_id=(SELECT block_id FROM history_event_parts
                                      WHERE revision_id=?2)",
                    params!["0".repeat(64), revision_id],
                )?;
                Ok(())
            })
            .unwrap();
        assert!(history
            .write_revision_exact(revision_id, &mut Vec::new())
            .is_err());
    }
}
