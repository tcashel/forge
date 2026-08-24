//! Typed, keyset-paged reads over COMMITTED content only.
//!
//! Every query in this module filters on `visibility = 'committed'` and
//! joins through the revision that publication flipped. Staging is durable
//! and invisible: no read here, and no aggregate here, can surface it.
//!
//! Paging is keyset, never offset: a cursor is a strictly increasing row id,
//! so a concurrent publication cannot shift a page under a reader or make it
//! skip a row.
//!
//! No method exposes a `rusqlite::Connection`. Callers that need more get a
//! new typed primitive, not a handle to the database.

use std::io::Write;

use rusqlite::{params, Connection};

use crate::archive::decode_block;
use crate::error::{internal, invalid, HistoryError};
use crate::history::{current_host_id, History};
use crate::migrations::SCHEMA_VERSION;
use crate::types::{
    ArchiveCodec, EventCursor, EventKeyKind, EventRole, EventRow, HistoryFilter, HistoryStatus,
    LineageKind, Page, PresenceState, SessionCursor, SessionRow, SourceFamily, SourceRunOutcome,
    SourceRunRow, SyncState, UsageTotals, Visibility,
};

/// The largest page any read primitive will return.
///
/// A caller asking for more gets this many plus a cursor, never a refusal
/// and never an unbounded result set.
pub const MAX_PAGE_ROWS: usize = 500;

fn page_limit(limit: usize) -> Result<i64, HistoryError> {
    if limit == 0 {
        return Err(invalid("a page holds at least one row"));
    }
    Ok(limit.min(MAX_PAGE_ROWS) as i64)
}

/// The predicate fragment shared by session and event reads.
///
/// Written as `?n IS NULL OR column = ?n` so one prepared statement serves
/// every filter combination: a filter is data, not generated SQL.
const SESSION_PREDICATES: &str = "
      AND (?1 IS NULL OR s.host_id = ?1)
      AND (?2 IS NULL OR s.repository_path = ?2)
      AND (?3 IS NULL OR s.source_family = ?3)
      AND (?4 IS NULL OR s.session_id = ?4)";

impl History {
    /// One keyset page of committed sessions, ordered by row id.
    ///
    /// An ABSENT repository predicate means EVERY repository. The archive is
    /// whole-corpus by default; narrowing is something a caller asks for.
    pub fn list_sessions(
        &self,
        filter: &HistoryFilter,
        after: Option<SessionCursor>,
        limit: usize,
    ) -> Result<Page<SessionRow, SessionCursor>, HistoryError> {
        let limit = page_limit(limit)?;
        let filter = filter.clone();
        self.submit(move |conn| {
            let after_id = after.map(|c| c.after_session_id).unwrap_or(0);
            let sql = format!(
                "SELECT s.session_id, s.host_id, s.source_family, s.native_session_id,
                        s.observed_cwd, s.repository_path, s.title, s.started_at,
                        s.last_event_at,
                        (SELECT COUNT(*) FROM events e WHERE e.session_id = s.session_id)
                   FROM sessions s
                  WHERE s.visibility = 'committed'
                    {SESSION_PREDICATES}
                    AND (?5 IS NULL OR s.last_event_at >= ?5)
                    AND (?6 IS NULL OR s.last_event_at < ?6)
                    AND s.session_id > ?7
                  ORDER BY s.session_id
                  LIMIT ?8"
            );
            let mut stmt = conn.prepare(&sql)?;
            let rows = stmt
                .query_map(
                    params![
                        filter.host_id,
                        filter.repository_path,
                        filter.source_family,
                        filter.session_id,
                        filter.since,
                        filter.until,
                        after_id,
                        limit
                    ],
                    map_session_row,
                )?
                .collect::<Result<Vec<SessionRow>, _>>()?;
            Ok(finish_page(rows, limit, |row| SessionCursor {
                after_session_id: row.session_id,
            }))
        })
    }

    /// One keyset page of committed event revisions, ordered by revision row id.
    pub fn list_events(
        &self,
        filter: &HistoryFilter,
        after: Option<EventCursor>,
        limit: usize,
    ) -> Result<Page<EventRow, EventCursor>, HistoryError> {
        let limit = page_limit(limit)?;
        let filter = filter.clone();
        self.submit(move |conn| {
            let after_id = after.map(|c| c.after_revision_id).unwrap_or(0);
            let sql = format!(
                "SELECT r.event_id, r.revision_id, r.revision, r.session_id, e.event_key,
                        e.event_key_kind, r.content_sha256, r.byte_length, r.parser_version,
                        r.role, r.model, r.event_kind, r.lineage_kind, r.parent_event_key,
                        r.occurred_at, r.ingested_at, e.head_revision
                   FROM event_revisions r
                   JOIN events e ON e.event_id = r.event_id
                   JOIN sessions s ON s.session_id = r.session_id
                  WHERE r.visibility = 'committed' AND s.visibility = 'committed'
                    {SESSION_PREDICATES}
                    AND (?5 IS NULL OR r.role = ?5)
                    AND (?6 IS NULL OR r.model = ?6)
                    AND (?7 IS NULL OR r.occurred_at >= ?7)
                    AND (?8 IS NULL OR r.occurred_at < ?8)
                    AND r.revision_id > ?9
                  ORDER BY r.revision_id
                  LIMIT ?10"
            );
            let mut stmt = conn.prepare(&sql)?;
            let rows = stmt
                .query_map(
                    params![
                        filter.host_id,
                        filter.repository_path,
                        filter.source_family,
                        filter.session_id,
                        filter.role,
                        filter.model,
                        filter.since,
                        filter.until,
                        after_id,
                        limit
                    ],
                    map_event_row,
                )?
                .collect::<Result<Vec<EventRow>, _>>()?;
            Ok(finish_page(rows, limit, |row| EventCursor {
                after_revision_id: row.revision_id,
            }))
        })
    }

    /// Write one committed revision's EXACT archived bytes to `out`.
    ///
    /// Parts are decompressed and verified one at a time and streamed
    /// straight through, so reading back an arbitrarily large record never
    /// requires a buffer proportional to it.
    pub fn read_event_to(
        &self,
        revision_id: i64,
        out: &mut impl Write,
    ) -> Result<i64, HistoryError> {
        let parts = self.submit(move |conn| load_committed_parts(conn, revision_id))?;
        let mut written = 0_i64;
        for part in parts {
            let bytes = decode_block(
                part.codec,
                &part.compressed,
                part.uncompressed_len,
                &part.sha256,
            )?;
            out.write_all(&bytes)?;
            written += bytes.len() as i64;
        }
        Ok(written)
    }

    /// One committed revision's exact archived bytes, collected.
    ///
    /// Convenience over [`History::read_event_to`] for callers that already
    /// know the record is small.
    pub fn read_event_bytes(&self, revision_id: i64) -> Result<Vec<u8>, HistoryError> {
        let mut out = Vec::new();
        self.read_event_to(revision_id, &mut out)?;
        Ok(out)
    }

    /// Aggregate committed usage evidence under a filter.
    pub fn usage_totals(&self, filter: &HistoryFilter) -> Result<UsageTotals, HistoryError> {
        let filter = filter.clone();
        self.submit(move |conn| {
            let sql = format!(
                "SELECT COUNT(*), COALESCE(SUM(u.input_tokens),0),
                        COALESCE(SUM(u.output_tokens),0),
                        COALESCE(SUM(u.cache_read_tokens),0),
                        COALESCE(SUM(u.cache_write_tokens),0),
                        COALESCE(SUM(u.reasoning_tokens),0)
                   FROM usage_facts u
                   JOIN event_revisions r ON r.revision_id = u.revision_id
                   JOIN sessions s ON s.session_id = u.session_id
                  WHERE u.visibility = 'committed' AND r.visibility = 'committed'
                    AND s.visibility = 'committed'
                    {SESSION_PREDICATES}
                    AND (?5 IS NULL OR u.model = ?5)
                    AND (?6 IS NULL OR r.occurred_at >= ?6)
                    AND (?7 IS NULL OR r.occurred_at < ?7)"
            );
            conn.query_row(
                &sql,
                params![
                    filter.host_id,
                    filter.repository_path,
                    filter.source_family,
                    filter.session_id,
                    filter.model,
                    filter.since,
                    filter.until
                ],
                |row| {
                    Ok(UsageTotals {
                        records: row.get(0)?,
                        input_tokens: row.get(1)?,
                        output_tokens: row.get(2)?,
                        cache_read_tokens: row.get(3)?,
                        cache_write_tokens: row.get(4)?,
                        reasoning_tokens: row.get(5)?,
                    })
                },
            )
            .map_err(Into::into)
        })
    }

    /// Where ingestion stands for every known source file.
    ///
    /// A cursor row exists only because a publication wrote it, so this is
    /// the durable answer to "what have we already archived" — including for
    /// files whose bytes have since disappeared.
    pub fn sync_state(&self, family: Option<SourceFamily>) -> Result<Vec<SyncState>, HistoryError> {
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT f.source_file_id, t.root_path, f.relative_path, t.source_family,
                        f.presence, COALESCE(c.parser_version, 0),
                        COALESCE(c.byte_offset, 0), COALESCE(c.record_index, 0),
                        c.updated_at
                   FROM source_files f
                   JOIN source_roots t ON t.source_root_id = f.source_root_id
                   LEFT JOIN source_cursors c ON c.source_file_id = f.source_file_id
                  WHERE (?1 IS NULL OR t.source_family = ?1)
                  ORDER BY f.source_file_id",
            )?;
            let rows = stmt
                .query_map(params![family], |row| {
                    let family: String = row.get(3)?;
                    let presence: String = row.get(4)?;
                    Ok(SyncState {
                        source_file_id: row.get(0)?,
                        root_path: row.get(1)?,
                        relative_path: row.get(2)?,
                        source_family: SourceFamily::from_column(3, &family)?,
                        presence: PresenceState::from_column(4, &presence)?,
                        parser_version: row.get(5)?,
                        byte_offset: row.get(6)?,
                        record_index: row.get(7)?,
                        updated_at: row.get(8)?,
                    })
                })?
                .collect::<Result<Vec<SyncState>, _>>()?;
            Ok(rows)
        })
    }

    /// Whether a revision row is staging, committed, or absent.
    ///
    /// An integrity read, not a content read: it is how a caller inspects
    /// what a crash left behind without being able to see it as content.
    pub fn revision_visibility(
        &self,
        revision_id: i64,
    ) -> Result<Option<Visibility>, HistoryError> {
        self.submit(move |conn| {
            let stored: Option<String> = conn
                .query_row(
                    "SELECT visibility FROM event_revisions WHERE revision_id = ?1",
                    [revision_id],
                    |row| row.get(0),
                )
                .ok();
            stored
                .map(|raw| Visibility::from_column(0, &raw).map_err(HistoryError::from))
                .transpose()
        })
    }

    /// Every ingestion pass the archive has recorded, oldest first.
    pub fn source_runs(&self) -> Result<Vec<SourceRunRow>, HistoryError> {
        self.submit(|conn| {
            let mut stmt = conn.prepare(
                "SELECT source_run_id, host_id, source_family, started_at, finished_at,
                        outcome, files_seen, events_published, note
                   FROM source_runs ORDER BY source_run_id",
            )?;
            let rows = stmt
                .query_map([], |row| {
                    let family: String = row.get(2)?;
                    let outcome: Option<String> = row.get(5)?;
                    Ok(SourceRunRow {
                        source_run_id: row.get(0)?,
                        host_id: row.get(1)?,
                        source_family: SourceFamily::from_column(2, &family)?,
                        started_at: row.get(3)?,
                        finished_at: row.get(4)?,
                        outcome: outcome
                            .map(|raw| SourceRunOutcome::from_column(5, &raw))
                            .transpose()?,
                        files_seen: row.get(6)?,
                        events_published: row.get(7)?,
                        note: row.get(8)?,
                    })
                })?
                .collect::<Result<Vec<SourceRunRow>, _>>()?;
            Ok(rows)
        })
    }

    /// A whole-archive standing and integrity summary.
    pub fn status(&self) -> Result<HistoryStatus, HistoryError> {
        self.submit(|conn| {
            let host_id = current_host_id(conn)?;
            let count = |sql: &str| -> Result<i64, HistoryError> {
                conn.query_row(sql, [], |row| row.get(0))
                    .map_err(Into::into)
            };
            let (compressed_bytes, uncompressed_bytes) = conn.query_row(
                "SELECT COALESCE(SUM(compressed_len),0), COALESCE(SUM(uncompressed_len),0)
                   FROM archive_blocks WHERE visibility = 'committed'",
                [],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )?;
            let staged_rows = count(
                "SELECT (SELECT COUNT(*) FROM event_revisions WHERE visibility='staging')
                      + (SELECT COUNT(*) FROM event_parts WHERE visibility='staging')
                      + (SELECT COUNT(*) FROM search_chunks WHERE visibility='staging')
                      + (SELECT COUNT(*) FROM usage_facts WHERE visibility='staging')
                      + (SELECT COUNT(*) FROM archive_blocks WHERE visibility='staging')
                      + (SELECT COUNT(*) FROM sessions WHERE visibility='staging')",
            )?;
            Ok(HistoryStatus {
                host_id,
                schema_version: SCHEMA_VERSION,
                sessions: count("SELECT COUNT(*) FROM sessions WHERE visibility='committed'")?,
                events: count("SELECT COUNT(*) FROM events")?,
                revisions: count(
                    "SELECT COUNT(*) FROM event_revisions WHERE visibility='committed'",
                )?,
                blocks: count("SELECT COUNT(*) FROM archive_blocks WHERE visibility='committed'")?,
                compressed_bytes,
                uncompressed_bytes,
                search_chunks: count(
                    "SELECT COUNT(*) FROM search_chunks WHERE visibility='committed'",
                )?,
                staged_rows,
                complete_generation: conn
                    .query_row(
                        "SELECT generation FROM index_generations
                          WHERE kind='fts5' AND state='complete'",
                        [],
                        |row| row.get(0),
                    )
                    .ok(),
                building_generation: conn
                    .query_row(
                        "SELECT generation FROM index_generations
                          WHERE kind='fts5' AND state='building'",
                        [],
                        |row| row.get(0),
                    )
                    .ok(),
            })
        })
    }
}

/// One stored archive part, ready to decompress.
pub(crate) struct StoredBlock {
    pub(crate) codec: ArchiveCodec,
    pub(crate) compressed: Vec<u8>,
    pub(crate) uncompressed_len: i64,
    pub(crate) sha256: String,
}

fn load_committed_parts(
    conn: &Connection,
    revision_id: i64,
) -> Result<Vec<StoredBlock>, HistoryError> {
    let published: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM event_revisions
                        WHERE revision_id = ?1 AND visibility = 'committed')",
        [revision_id],
        |row| row.get(0),
    )?;
    if !published {
        return Err(internal(format!(
            "revision {revision_id} is not committed content"
        )));
    }
    let mut stmt = conn.prepare(
        "SELECT b.bytes, b.uncompressed_len, b.content_sha256, b.codec
           FROM event_parts p
           JOIN archive_blocks b ON b.block_id = p.block_id
          WHERE p.revision_id = ?1 AND p.visibility = 'committed'
          ORDER BY p.seq",
    )?;
    let rows = stmt
        .query_map([revision_id], |row| {
            let codec: String = row.get(3)?;
            Ok(StoredBlock {
                codec: ArchiveCodec::from_column(3, &codec)?,
                compressed: row.get(0)?,
                uncompressed_len: row.get(1)?,
                sha256: row.get(2)?,
            })
        })?
        .collect::<Result<Vec<StoredBlock>, _>>()?;
    Ok(rows)
}

/// Attach a continuation cursor when — and only when — the page filled.
pub(crate) fn finish_page<T, C>(rows: Vec<T>, limit: i64, cursor: impl Fn(&T) -> C) -> Page<T, C> {
    let next = if rows.len() as i64 == limit {
        rows.last().map(&cursor)
    } else {
        None
    };
    Page { rows, next }
}

fn map_session_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<SessionRow> {
    let family: String = row.get(2)?;
    Ok(SessionRow {
        session_id: row.get(0)?,
        host_id: row.get(1)?,
        source_family: SourceFamily::from_column(2, &family)?,
        native_session_id: row.get(3)?,
        observed_cwd: row.get(4)?,
        repository_path: row.get(5)?,
        title: row.get(6)?,
        started_at: row.get(7)?,
        last_event_at: row.get(8)?,
        event_count: row.get(9)?,
    })
}

fn map_event_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<EventRow> {
    let key_kind: String = row.get(5)?;
    let role: Option<String> = row.get(9)?;
    let lineage: String = row.get(12)?;
    let revision: i64 = row.get(2)?;
    let head: i64 = row.get(16)?;
    Ok(EventRow {
        event_id: row.get(0)?,
        revision_id: row.get(1)?,
        revision,
        session_id: row.get(3)?,
        event_key: row.get(4)?,
        event_key_kind: EventKeyKind::from_column(5, &key_kind)?,
        content_sha256: row.get(6)?,
        byte_length: row.get(7)?,
        parser_version: row.get(8)?,
        role: role
            .map(|raw| EventRole::from_column(9, &raw))
            .transpose()?,
        model: row.get(10)?,
        event_kind: row.get(11)?,
        lineage_kind: LineageKind::from_column(12, &lineage)?,
        parent_event_key: row.get(13)?,
        occurred_at: row.get(14)?,
        ingested_at: row.get(15)?,
        is_head: revision == head,
    })
}
