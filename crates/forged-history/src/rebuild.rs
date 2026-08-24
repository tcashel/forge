//! The FTS index-generation state machine and its bounded, resumable rebuild.
//!
//! The archive is durable; the lexical index is DERIVED. Losing the FTS
//! table costs nothing but time, because every indexed chunk is still held
//! as a compressed block. Rebuilding therefore never reads a source file and
//! never needs one to still exist.
//!
//! A generation is `building` until it has covered every committed chunk,
//! and only then `complete`. Queries use a complete generation or say they
//! cannot; a partial generation is never advertised as complete, and a
//! failed one is retained for diagnosis with the archive fully intact.

use rusqlite::{params, TransactionBehavior};

use crate::archive::decode_block;
use crate::error::{internal, invalid, HistoryError};
use crate::history::History;
use crate::time::now_iso;
use crate::types::{ArchiveCodec, IndexGenerationRow, IndexKind, IndexState, RebuildProgress};

/// How many chunks one rebuild transaction may index.
pub const REBUILD_BATCH_CHUNKS: usize = 64;

/// The DDL for the contentless index, used by both the schema and rebuilds.
pub(crate) const SEARCH_FTS_DDL: &str =
    "CREATE VIRTUAL TABLE search_fts USING fts5(text, content='', contentless_delete=1)";

impl History {
    /// Every index generation the archive has ever had, oldest first.
    pub fn index_generations(&self) -> Result<Vec<IndexGenerationRow>, HistoryError> {
        self.submit(|conn| {
            let mut stmt = conn.prepare(
                "SELECT generation, kind, state, resume_after_chunk_id, indexed_chunks,
                        started_at, completed_at, note
                   FROM index_generations ORDER BY generation",
            )?;
            let rows = stmt
                .query_map([], |row| {
                    let kind: String = row.get(1)?;
                    let state: String = row.get(2)?;
                    Ok(IndexGenerationRow {
                        generation: row.get(0)?,
                        kind: IndexKind::from_column(1, &kind)?,
                        state: IndexState::from_column(2, &state)?,
                        resume_after_chunk_id: row.get(3)?,
                        indexed_chunks: row.get(4)?,
                        started_at: row.get(5)?,
                        completed_at: row.get(6)?,
                        note: row.get(7)?,
                    })
                })?
                .collect::<Result<Vec<IndexGenerationRow>, _>>()?;
            Ok(rows)
        })
    }

    /// Discard the lexical index and open a new generation to rebuild it.
    ///
    /// The standing generation is superseded and the FTS table is dropped and
    /// recreated empty in ONE transaction, so no window exists where a
    /// half-empty index still claims to be complete. If a build is already in
    /// flight, its generation is returned and nothing is discarded — a second
    /// caller resumes rather than restarting.
    ///
    /// Archive content is untouched: only the derived index and its
    /// generation row change.
    pub fn begin_index_rebuild(&self) -> Result<i64, HistoryError> {
        self.submit(|conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            if let Ok(generation) = tx.query_row(
                "SELECT generation FROM index_generations
                  WHERE kind = 'fts5' AND state = 'building'",
                [],
                |row| row.get::<_, i64>(0),
            ) {
                tx.commit()?;
                return Ok(generation);
            }
            let now = now_iso();
            tx.execute(
                "UPDATE index_generations
                    SET state = 'superseded', note = 'replaced by a rebuild'
                  WHERE kind = 'fts5' AND state = 'complete'",
                [],
            )?;
            tx.execute_batch(&format!(
                "DROP TABLE IF EXISTS search_fts; {SEARCH_FTS_DDL};"
            ))?;
            tx.execute(
                "INSERT INTO index_generations
                   (kind, state, resume_after_chunk_id, indexed_chunks, started_at,
                    completed_at, note)
                 VALUES ('fts5', 'building', 0, 0, ?1, NULL, NULL)",
                [now],
            )?;
            let generation = tx.last_insert_rowid();
            tx.commit()?;
            Ok(generation)
        })
    }

    /// Index one bounded batch of retained chunks into the building generation.
    ///
    /// Returns `Ok(None)` when no build is in flight. Decompression happens
    /// on the CALLER's thread between two short transactions, so a rebuild
    /// never holds a write lock while it works.
    ///
    /// Each batch re-writes its chunks by row id, so an interrupted step is
    /// safe to repeat: resuming is the same operation as retrying.
    pub fn rebuild_step(&self, batch: usize) -> Result<Option<RebuildProgress>, HistoryError> {
        if batch == 0 {
            return Err(invalid("a rebuild batch covers at least one chunk"));
        }
        let batch = batch as i64;
        let staged = self.submit(move |conn| {
            let Ok((generation, resume)) = conn.query_row(
                "SELECT generation, resume_after_chunk_id FROM index_generations
                  WHERE kind = 'fts5' AND state = 'building'",
                [],
                |row| Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?)),
            ) else {
                return Ok(None);
            };
            let mut stmt = conn.prepare(
                "SELECT c.chunk_id, b.bytes, b.uncompressed_len, b.content_sha256, b.codec
                   FROM search_chunks c
                   JOIN archive_blocks b ON b.block_id = c.block_id
                  WHERE c.visibility = 'committed' AND c.chunk_id > ?1
                  ORDER BY c.chunk_id
                  LIMIT ?2",
            )?;
            let rows = stmt
                .query_map(params![resume, batch], |row| {
                    let codec: String = row.get(4)?;
                    Ok((
                        row.get::<_, i64>(0)?,
                        row.get::<_, Vec<u8>>(1)?,
                        row.get::<_, i64>(2)?,
                        row.get::<_, String>(3)?,
                        ArchiveCodec::from_column(4, &codec)?,
                    ))
                })?
                .collect::<Result<Vec<_>, _>>()?;
            let total: i64 = conn.query_row(
                "SELECT COUNT(*) FROM search_chunks WHERE visibility = 'committed'",
                [],
                |row| row.get(0),
            )?;
            Ok(Some((generation, resume, rows, total)))
        })?;

        let Some((generation, resume, rows, total_chunks)) = staged else {
            return Ok(None);
        };

        let mut decoded = Vec::with_capacity(rows.len());
        for (chunk_id, compressed, uncompressed_len, sha256, codec) in rows {
            let bytes = decode_block(codec, &compressed, uncompressed_len, &sha256)?;
            let text = String::from_utf8(bytes).map_err(|err| {
                internal(format!("retained chunk {chunk_id} is not UTF-8: {err}"))
            })?;
            decoded.push((chunk_id, text));
        }

        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            // Another process may have advanced or finished this generation
            // while we decompressed. Losing that race costs one wasted batch,
            // never a double count and never a false completion.
            let current: Option<i64> = tx
                .query_row(
                    "SELECT resume_after_chunk_id FROM index_generations
                      WHERE generation = ?1 AND state = 'building'",
                    [generation],
                    |row| row.get(0),
                )
                .ok();
            if current != Some(resume) {
                tx.commit()?;
                return Ok(Some(RebuildProgress {
                    generation,
                    indexed_now: 0,
                    indexed_total: current.unwrap_or(0),
                    total_chunks,
                    complete: false,
                }));
            }
            if decoded.is_empty() {
                let now = now_iso();
                tx.execute(
                    "UPDATE index_generations
                        SET state = 'complete', completed_at = ?2
                      WHERE generation = ?1",
                    params![generation, now],
                )?;
                let indexed_total: i64 = tx.query_row(
                    "SELECT indexed_chunks FROM index_generations WHERE generation = ?1",
                    [generation],
                    |row| row.get(0),
                )?;
                tx.commit()?;
                return Ok(Some(RebuildProgress {
                    generation,
                    indexed_now: 0,
                    indexed_total,
                    total_chunks,
                    complete: true,
                }));
            }
            let mut last = resume;
            for (chunk_id, text) in &decoded {
                tx.execute("DELETE FROM search_fts WHERE rowid = ?1", [chunk_id])?;
                tx.execute(
                    "INSERT INTO search_fts(rowid, text) VALUES (?1, ?2)",
                    params![chunk_id, text],
                )?;
                last = *chunk_id;
            }
            let indexed_now = decoded.len() as i64;
            tx.execute(
                "UPDATE index_generations
                    SET resume_after_chunk_id = ?2, indexed_chunks = indexed_chunks + ?3
                  WHERE generation = ?1",
                params![generation, last, indexed_now],
            )?;
            let indexed_total: i64 = tx.query_row(
                "SELECT indexed_chunks FROM index_generations WHERE generation = ?1",
                [generation],
                |row| row.get(0),
            )?;
            tx.commit()?;
            Ok(Some(RebuildProgress {
                generation,
                indexed_now,
                indexed_total,
                total_chunks,
                complete: false,
            }))
        })
    }

    /// Drive an in-flight rebuild to completion, one bounded batch at a time.
    pub fn rebuild_index(&self, batch: usize) -> Result<RebuildProgress, HistoryError> {
        loop {
            let Some(progress) = self.rebuild_step(batch)? else {
                return Err(internal("no index rebuild is in flight"));
            };
            if progress.complete {
                return Ok(progress);
            }
        }
    }

    /// Abandon the in-flight rebuild, retaining it for diagnosis.
    ///
    /// The archive keeps every block and every chunk; only the derived index
    /// is missing, and the failed generation records why. Nothing here can be
    /// mistaken for a complete index.
    pub fn fail_index_rebuild(&self, note: &str) -> Result<bool, HistoryError> {
        let note = note.to_owned();
        self.submit(move |conn| {
            let changed = conn.execute(
                "UPDATE index_generations SET state = 'failed', note = ?1
                  WHERE kind = 'fts5' AND state = 'building'",
                [note],
            )?;
            Ok(changed == 1)
        })
    }
}
