//! BM25 lookup over the contentless FTS5 projection.
//!
//! The index holds terms and chunk row ids — never text. A match therefore
//! answers "which chunk", and this module joins the metadata, fetches ONLY
//! the matched chunks' compressed blocks, and decompresses ONLY those. A
//! search over a large archive touches no byte of any chunk it did not
//! return.
//!
//! Search is served exclusively from a COMPLETE index generation. When none
//! stands, the answer says so — a partial generation returning fewer hits
//! would look like an archive that had lost content.

use rusqlite::params;

use crate::archive::decode_block;
use crate::error::{invalid, HistoryError};
use crate::history::History;
use crate::read::{finish_page, MAX_PAGE_ROWS};
use crate::types::{
    ArchiveCodec, HistoryFilter, IndexState, Page, SearchCursor, SearchMatch, SearchOutcome,
    SourceFamily,
};

/// A match with its block still compressed, as the writer thread hands it back.
struct PendingMatch {
    chunk_id: i64,
    rank: f64,
    session_id: i64,
    event_id: i64,
    revision_id: i64,
    seq: i64,
    source_family: SourceFamily,
    repository_path: Option<String>,
    occurred_at: Option<String>,
    compressed: Vec<u8>,
    uncompressed_len: i64,
    sha256: String,
    codec: ArchiveCodec,
}

impl History {
    /// BM25 lookup across the whole corpus.
    ///
    /// `query` is FTS5 MATCH syntax. An ABSENT repository predicate searches
    /// EVERY repository — the archive's default is whole-corpus, and a
    /// caller that wants one repository says so.
    ///
    /// Continuation is a keyset on `(rank, chunk_id)`. Rank alone repeats
    /// across chunks, so paging on it alone would drop or duplicate rows;
    /// the chunk row id breaks every tie in a stable, total order.
    pub fn search(
        &self,
        query: &str,
        filter: &HistoryFilter,
        after: Option<SearchCursor>,
        limit: usize,
    ) -> Result<SearchOutcome, HistoryError> {
        if query.trim().is_empty() {
            return Err(invalid("a search needs a non-empty query"));
        }
        if limit == 0 {
            return Err(invalid("a page holds at least one row"));
        }
        let limit = limit.min(MAX_PAGE_ROWS) as i64;
        let query = query.to_owned();
        let filter = filter.clone();

        let outcome = self.submit(move |conn| {
            // The generation gate comes FIRST: an incomplete index must never
            // silently under-report, so nothing is even matched against it.
            let standing: Option<i64> = conn
                .query_row(
                    "SELECT generation FROM index_generations
                      WHERE kind = 'fts5' AND state = 'complete'",
                    [],
                    |row| row.get(0),
                )
                .ok();
            if standing.is_none() {
                let building: Option<(i64, i64)> = conn
                    .query_row(
                        "SELECT generation, indexed_chunks FROM index_generations
                          WHERE kind = 'fts5' AND state = 'building'",
                        [],
                        |row| Ok((row.get(0)?, row.get(1)?)),
                    )
                    .ok();
                let total: i64 = conn.query_row(
                    "SELECT COUNT(*) FROM search_chunks WHERE visibility = 'committed'",
                    [],
                    |row| row.get(0),
                )?;
                return Ok(Err(match building {
                    Some((generation, indexed_chunks)) => SearchOutcome::Rebuilding {
                        generation,
                        indexed_chunks,
                        total_chunks: total,
                    },
                    None => SearchOutcome::Unavailable {
                        reason: format!(
                            "no complete {} generation stands",
                            IndexState::Complete.as_str()
                        ),
                    },
                }));
            }

            let (after_rank, after_chunk) = match after {
                Some(cursor) => (cursor.after_rank, cursor.after_chunk_id),
                // BM25 ranks are negative and better matches sort lower, so
                // the opening page starts below every possible rank.
                None => (f64::NEG_INFINITY, 0),
            };
            let mut stmt = conn.prepare(
                "SELECT m.chunk_id, m.rank, c.session_id, r.event_id, c.revision_id, c.seq,
                        s.source_family, s.repository_path, r.occurred_at
                   FROM (SELECT rowid AS chunk_id, bm25(search_fts) AS rank
                           FROM search_fts WHERE search_fts MATCH ?1) m
                   JOIN search_chunks c ON c.chunk_id = m.chunk_id
                   JOIN event_revisions r ON r.revision_id = c.revision_id
                   JOIN sessions s ON s.session_id = c.session_id
                  WHERE c.visibility = 'committed' AND r.visibility = 'committed'
                    AND s.visibility = 'committed'
                    AND (?2 IS NULL OR s.host_id = ?2)
                    AND (?3 IS NULL OR s.repository_path = ?3)
                    AND (?4 IS NULL OR s.source_family = ?4)
                    AND (?5 IS NULL OR c.session_id = ?5)
                    AND (?6 IS NULL OR r.role = ?6)
                    AND (?7 IS NULL OR r.model = ?7)
                    AND (?8 IS NULL OR r.occurred_at >= ?8)
                    AND (?9 IS NULL OR r.occurred_at < ?9)
                    AND (m.rank > ?10 OR (m.rank = ?10 AND c.chunk_id > ?11))
                  ORDER BY m.rank, c.chunk_id
                  LIMIT ?12",
            )?;
            let heads = stmt
                .query_map(
                    params![
                        query,
                        filter.host_id,
                        filter.repository_path,
                        filter.source_family,
                        filter.session_id,
                        filter.role,
                        filter.model,
                        filter.since,
                        filter.until,
                        after_rank,
                        after_chunk,
                        limit
                    ],
                    |row| {
                        let family: String = row.get(6)?;
                        Ok((
                            row.get::<_, i64>(0)?,
                            row.get::<_, f64>(1)?,
                            row.get::<_, i64>(2)?,
                            row.get::<_, i64>(3)?,
                            row.get::<_, i64>(4)?,
                            row.get::<_, i64>(5)?,
                            SourceFamily::from_column(6, &family)?,
                            row.get::<_, Option<String>>(7)?,
                            row.get::<_, Option<String>>(8)?,
                        ))
                    },
                )?
                .collect::<Result<Vec<_>, _>>()?;

            // Only NOW are blobs fetched, and only for the rows this page
            // actually returns.
            let mut block = conn.prepare(
                "SELECT b.bytes, b.uncompressed_len, b.content_sha256, b.codec
                   FROM search_chunks c
                   JOIN archive_blocks b ON b.block_id = c.block_id
                  WHERE c.chunk_id = ?1",
            )?;
            let mut pending = Vec::with_capacity(heads.len());
            for head in heads {
                let (compressed, uncompressed_len, sha256, codec) =
                    block.query_row([head.0], |row| {
                        let codec: String = row.get(3)?;
                        Ok((
                            row.get::<_, Vec<u8>>(0)?,
                            row.get::<_, i64>(1)?,
                            row.get::<_, String>(2)?,
                            ArchiveCodec::from_column(3, &codec)?,
                        ))
                    })?;
                pending.push(PendingMatch {
                    chunk_id: head.0,
                    rank: head.1,
                    session_id: head.2,
                    event_id: head.3,
                    revision_id: head.4,
                    seq: head.5,
                    source_family: head.6,
                    repository_path: head.7,
                    occurred_at: head.8,
                    compressed,
                    uncompressed_len,
                    sha256,
                    codec,
                });
            }
            Ok(Ok(pending))
        })?;

        let pending = match outcome {
            Ok(pending) => pending,
            Err(unready) => return Ok(unready),
        };

        // Decompression happens here, on the caller's thread and outside every
        // transaction — the same discipline ingestion uses in reverse.
        let mut rows = Vec::with_capacity(pending.len());
        for hit in pending {
            let bytes = decode_block(
                hit.codec,
                &hit.compressed,
                hit.uncompressed_len,
                &hit.sha256,
            )?;
            let text = String::from_utf8(bytes).map_err(|err| HistoryError::Internal {
                message: format!("search chunk {} is not UTF-8: {err}", hit.chunk_id),
            })?;
            rows.push(SearchMatch {
                chunk_id: hit.chunk_id,
                rank: hit.rank,
                session_id: hit.session_id,
                event_id: hit.event_id,
                revision_id: hit.revision_id,
                seq: hit.seq,
                source_family: hit.source_family,
                repository_path: hit.repository_path,
                occurred_at: hit.occurred_at,
                text,
            });
        }
        let page: Page<SearchMatch, SearchCursor> = finish_page(rows, limit, |row| SearchCursor {
            after_rank: row.rank,
            after_chunk_id: row.chunk_id,
        });
        Ok(SearchOutcome::Ready(page))
    }
}
