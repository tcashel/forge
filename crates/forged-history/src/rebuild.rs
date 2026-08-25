//! Generation-safe, bounded, resumable contentless FTS rebuild.

use rusqlite::{params, TransactionBehavior};
use sha2::{Digest, Sha256};

use crate::actor::History;
use crate::error::{internal, invalid, HistoryError};
use crate::ingest::hex_digest;
use crate::schema::active_generation;
use crate::time::now_timestamp;
use crate::types::RebuildProgress;

/// Hard cap for rows admitted to one rebuild transaction.
pub const REBUILD_STAGE_BATCH: u64 = 128;

impl History {
    /// Delete and recreate only the rebuildable FTS projection and start a new
    /// incomplete generation. Retained compressed chunks are untouched.
    pub fn reset_search_index(&self) -> Result<String, HistoryError> {
        let generation = uuid::Uuid::now_v7().to_string();
        let returned = generation.clone();
        let now = now_timestamp();
        self.submit(move |connection| {
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
            transaction.execute_batch(
                "DROP TABLE history_search_fts;
                 CREATE VIRTUAL TABLE history_search_fts USING fts5(
                   text,
                   content='',
                   contentless_delete=1,
                   tokenize='unicode61'
                 );
                 DELETE FROM history_fts_membership;
                 DELETE FROM history_index_generations;",
            )?;
            transaction.execute(
                "INSERT INTO history_index_generations(
                   generation_id, state, indexed_count, started_at
                 ) VALUES (?1, 'building', 0, ?2)",
                params![generation, now],
            )?;
            transaction.execute(
                "UPDATE history_meta SET value=?1 WHERE key='active_generation'",
                params![generation],
            )?;
            transaction.commit()?;
            Ok(())
        })?;
        Ok(returned)
    }

    /// Rebuild at most the internally capped number of retained chunks.
    /// `requested_limit` is checked before SQLite binding and can never become
    /// a negative `LIMIT`.
    pub fn rebuild_search_step(
        &self,
        requested_limit: u64,
    ) -> Result<RebuildProgress, HistoryError> {
        if requested_limit == 0 {
            return Err(invalid("rebuild batch limit must be positive"));
        }
        let capped = requested_limit.min(REBUILD_STAGE_BATCH);
        let limit = i64::try_from(capped)
            .map_err(|_| invalid("rebuild batch limit exceeds SQLite range"))?;
        loop {
            match self.submit(move |connection| rebuild_attempt(connection, limit))? {
                RebuildAttempt::Retry => continue,
                RebuildAttempt::Progress(progress) => return Ok(progress),
            }
        }
    }
}

enum RebuildAttempt {
    Retry,
    Progress(RebuildProgress),
}

fn rebuild_attempt(
    connection: &mut rusqlite::Connection,
    limit: i64,
) -> Result<RebuildAttempt, HistoryError> {
    let Some((generation, state)) = active_generation(connection)? else {
        return Err(HistoryError::Rebuilding);
    };
    if state == "ready" {
        let indexed_count = actual_indexed_count(connection, &generation)?;
        return Ok(RebuildAttempt::Progress(RebuildProgress {
            generation,
            indexed_count,
            complete: true,
        }));
    }
    if state != "building" {
        return Err(internal(format!(
            "unknown index generation state {state:?}"
        )));
    }
    let compressed = {
        let mut statement = connection.prepare(
            "SELECT c.chunk_id, c.uncompressed_length, c.sha256, c.compressed_bytes
               FROM history_search_chunks c
              WHERE NOT EXISTS (
                SELECT 1 FROM history_fts_membership m
                 WHERE m.generation_id=?1 AND m.chunk_id=c.chunk_id
              )
              ORDER BY c.chunk_id LIMIT ?2",
        )?;
        let rows = statement
            .query_map(params![generation, limit], |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, i64>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, Vec<u8>>(3)?,
                ))
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        rows
    };
    let mut decoded = Vec::with_capacity(compressed.len());
    for (chunk_id, length, sha256, bytes) in compressed {
        let expected = usize::try_from(length)
            .map_err(|_| internal("negative or oversized retained search chunk length"))?;
        let plaintext = zstd::bulk::decompress(&bytes, expected)
            .map_err(|error| internal(format!("decompressing retained search chunk: {error}")))?;
        if plaintext.len() != expected || hex_digest(Sha256::digest(&plaintext)) != sha256 {
            return Err(internal("retained search chunk integrity mismatch"));
        }
        decoded.push((
            chunk_id,
            String::from_utf8(plaintext).map_err(|error| {
                internal(format!("retained search chunk is not UTF-8: {error}"))
            })?,
        ));
    }

    let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let Some((current_generation, current_state)) = active_generation(&transaction)? else {
        transaction.rollback()?;
        return Ok(RebuildAttempt::Retry);
    };
    if current_generation != generation {
        transaction.rollback()?;
        return Ok(RebuildAttempt::Retry);
    }
    if current_state == "ready" {
        let indexed_count = actual_indexed_count(&transaction, &generation)?;
        transaction.rollback()?;
        return Ok(RebuildAttempt::Progress(RebuildProgress {
            generation,
            indexed_count,
            complete: true,
        }));
    }
    for (chunk_id, text) in decoded {
        transaction.execute(
            "INSERT OR REPLACE INTO history_search_fts(rowid, text) VALUES (?1, ?2)",
            params![chunk_id, text],
        )?;
        transaction.execute(
            "INSERT OR IGNORE INTO history_fts_membership(generation_id, chunk_id)
             VALUES (?1, ?2)",
            params![generation, chunk_id],
        )?;
    }
    let indexed_count = actual_indexed_count(&transaction, &generation)?;
    let total_chunks: i64 =
        transaction.query_row("SELECT count(*) FROM history_search_chunks", [], |row| {
            row.get(0)
        })?;
    let total_chunks = u64::try_from(total_chunks)
        .map_err(|_| internal("negative retained search chunk count"))?;
    let complete = indexed_count == total_chunks;
    if complete {
        let now = now_timestamp();
        transaction.execute(
            "UPDATE history_index_generations
                SET state='ready', indexed_count=?1, completed_at=?2
              WHERE generation_id=?3 AND state='building'",
            params![
                i64::try_from(indexed_count)
                    .map_err(|_| internal("indexed count exceeds SQLite range"))?,
                now,
                generation,
            ],
        )?;
        transaction.execute(
            "UPDATE history_meta
                SET value=CAST(CAST(value AS INTEGER) + 1 AS TEXT)
              WHERE key='corpus_epoch'",
            [],
        )?;
    } else {
        transaction.execute(
            "UPDATE history_index_generations SET indexed_count=?1
              WHERE generation_id=?2",
            params![
                i64::try_from(indexed_count)
                    .map_err(|_| internal("indexed count exceeds SQLite range"))?,
                generation,
            ],
        )?;
    }
    transaction.commit()?;
    Ok(RebuildAttempt::Progress(RebuildProgress {
        generation,
        indexed_count,
        complete,
    }))
}

fn actual_indexed_count(
    connection: &rusqlite::Connection,
    generation: &str,
) -> Result<u64, HistoryError> {
    let count: i64 = connection.query_row(
        "SELECT count(*) FROM history_fts_membership WHERE generation_id=?1",
        params![generation],
        |row| row.get(0),
    )?;
    u64::try_from(count).map_err(|_| internal("negative indexed membership count"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{HistoryFilter, PreparedEvent, SearchQuery, SourceFamily};
    use std::io::Cursor;

    fn prepared(key: &str) -> PreparedEvent {
        let mut event = PreparedEvent::new(
            SourceFamily::Pi,
            "session",
            "parser/v1",
            "2026-08-25T00:00:00Z",
        );
        event.native_event_key = Some(key.to_owned());
        event
    }

    #[test]
    fn reset_and_bounded_resumption_restore_matches_without_sources() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let history = History::open(&path).unwrap();
        let mut event = history.begin_event(prepared("one")).unwrap();
        event.push_raw_part(Cursor::new(b"raw")).unwrap();
        for _ in 0..4 {
            event.push_text_fragment(&"lexical ".repeat(1_000)).unwrap();
        }
        event.finish().unwrap();
        let query = SearchQuery {
            expression: "lexical".to_owned(),
            filter: HistoryFilter::default(),
            after: None,
            limit: 100,
        };
        let before = history.search(query.clone()).unwrap().matches.len();
        assert!(before > 1);
        history.reset_search_index().unwrap();
        assert!(matches!(
            history.search(query.clone()),
            Err(HistoryError::Rebuilding)
        ));
        let first = history.rebuild_search_step(1).unwrap();
        assert!(!first.complete);
        drop(history);

        let history = History::open_existing(&path).unwrap().unwrap();
        loop {
            if history.rebuild_search_step(u64::MAX).unwrap().complete {
                break;
            }
        }
        assert_eq!(history.search(query).unwrap().matches.len(), before);
    }

    #[test]
    fn stage_before_reset_is_covered_before_publication() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut event = history.begin_event(prepared("race")).unwrap();
        event.push_raw_part(Cursor::new(b"raw")).unwrap();
        event
            .push_text_fragment(&"raceword ".repeat(
                (crate::ingest::SEARCH_CHUNK_TARGET_BYTES * crate::ingest::SEARCH_STAGE_BATCH
                    / "raceword ".len())
                    + 1,
            ))
            .unwrap();
        history.reset_search_index().unwrap();
        assert!(matches!(event.finish(), Err(HistoryError::Rebuilding)));
        while !history.rebuild_search_step(1).unwrap().complete {}
        event.finish().unwrap();
        let matches = history
            .search(SearchQuery {
                expression: "raceword".to_owned(),
                filter: HistoryFilter::default(),
                after: None,
                limit: 10,
            })
            .unwrap();
        assert!(!matches.matches.is_empty());
    }
}
