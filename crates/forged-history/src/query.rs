//! Typed keyset metadata, usage, and BM25 query primitives.

use std::path::PathBuf;

use rusqlite::types::Value;
use rusqlite::{params_from_iter, OptionalExtension, TransactionBehavior};
use sha2::{Digest, Sha256};

use crate::actor::History;
use crate::error::{internal, invalid, HistoryError};
use crate::ingest::{hex_digest, SEARCH_CHUNK_TARGET_BYTES};
use crate::types::{
    checked_u64, EventRole, EventRow, HistoryFilter, MetadataQuery, SearchCursor, SearchMatch,
    SearchPage, SearchQuery, SessionRow, SourceFamily, UsageRow,
};

const DEFAULT_PAGE_SIZE: u32 = 50;
const MAX_PAGE_SIZE: u32 = 200;

impl History {
    /// Return committed sessions in stable row-id order.
    pub fn sessions(&self, query: MetadataQuery) -> Result<Vec<SessionRow>, HistoryError> {
        let query = canonicalize_query(query)?;
        self.submit(move |connection| {
            let mut sql = String::from(
                "SELECT DISTINCT s.session_id, s.host_id, s.source_family,
                        s.native_session_id, s.observed_cwd, s.repository_path,
                        s.started_at, s.ended_at
                   FROM history_sessions s
                   JOIN history_events e ON e.session_id=s.session_id
                   JOIN history_event_revisions r ON r.revision_id=e.current_revision_id
                  WHERE r.visibility='committed'",
            );
            let mut values = Vec::new();
            append_filters(&mut sql, &mut values, &query.filter, ModelColumn::Event);
            if let Some(after) = query.after_id {
                sql.push_str(" AND s.session_id > ?");
                values.push(Value::Integer(after));
            }
            sql.push_str(" ORDER BY s.session_id LIMIT ?");
            values.push(Value::Integer(i64::from(effective_limit(query.limit))));
            let mut statement = connection.prepare(&sql)?;
            let rows = statement
                .query_map(params_from_iter(values.iter()), |row| {
                    let source = row.get::<_, String>(2)?;
                    Ok(SessionRow {
                        session_id: row.get(0)?,
                        host_id: row.get(1)?,
                        source_family: SourceFamily::decode(2, &source)?,
                        native_session_id: row.get(3)?,
                        observed_cwd: row.get(4)?,
                        repository_path: row.get::<_, Option<String>>(5)?.map(PathBuf::from),
                        started_at: row.get(6)?,
                        ended_at: row.get(7)?,
                    })
                })?
                .collect::<rusqlite::Result<Vec<_>>>()?;
            Ok(rows)
        })
    }

    /// Return current committed event metadata in stable row-id order.
    pub fn events(&self, query: MetadataQuery) -> Result<Vec<EventRow>, HistoryError> {
        let query = canonicalize_query(query)?;
        self.submit(move |connection| {
            let mut sql = String::from(
                "SELECT e.event_id, e.session_id, e.event_key, r.revision_no,
                        r.revision_id, r.occurred_at, r.role, r.model
                   FROM history_events e
                   JOIN history_sessions s ON s.session_id=e.session_id
                   JOIN history_event_revisions r ON r.revision_id=e.current_revision_id
                  WHERE r.visibility='committed'",
            );
            let mut values = Vec::new();
            append_filters(&mut sql, &mut values, &query.filter, ModelColumn::Event);
            if let Some(after) = query.after_id {
                sql.push_str(" AND e.event_id > ?");
                values.push(Value::Integer(after));
            }
            sql.push_str(" ORDER BY e.event_id LIMIT ?");
            values.push(Value::Integer(i64::from(effective_limit(query.limit))));
            let mut statement = connection.prepare(&sql)?;
            let rows = statement
                .query_map(params_from_iter(values.iter()), map_event_row)?
                .collect::<rusqlite::Result<Vec<_>>>()?;
            Ok(rows)
        })
    }

    /// Return committed usage evidence in stable row-id order.
    pub fn usage(&self, query: MetadataQuery) -> Result<Vec<UsageRow>, HistoryError> {
        let query = canonicalize_query(query)?;
        self.submit(move |connection| {
            let mut sql = String::from(
                "SELECT u.usage_id, u.revision_id, s.host_id, u.provider, u.model,
                        u.input_tokens, u.output_tokens, u.cache_read_tokens,
                        u.cache_write_tokens, u.cost_usd, u.observed_at
                   FROM history_usage_evidence u
                   JOIN history_event_revisions r ON r.revision_id=u.revision_id
                   JOIN history_events e ON e.event_id=r.event_id
                   JOIN history_sessions s ON s.session_id=e.session_id
                  WHERE r.visibility='committed'",
            );
            let mut values = Vec::new();
            append_filters(&mut sql, &mut values, &query.filter, ModelColumn::Usage);
            if let Some(after) = query.after_id {
                sql.push_str(" AND u.usage_id > ?");
                values.push(Value::Integer(after));
            }
            sql.push_str(" ORDER BY u.usage_id LIMIT ?");
            values.push(Value::Integer(i64::from(effective_limit(query.limit))));
            let mut statement = connection.prepare(&sql)?;
            let rows = statement
                .query_map(params_from_iter(values.iter()), |row| {
                    Ok(UsageRow {
                        usage_id: row.get(0)?,
                        revision_id: row.get(1)?,
                        host_id: row.get(2)?,
                        provider: row.get(3)?,
                        model: row.get(4)?,
                        input_tokens: checked_u64(row.get(5)?, "input tokens")?,
                        output_tokens: checked_u64(row.get(6)?, "output tokens")?,
                        cache_read_tokens: row
                            .get::<_, Option<i64>>(7)?
                            .map(|value| checked_u64(value, "cache-read tokens"))
                            .transpose()?,
                        cache_write_tokens: row
                            .get::<_, Option<i64>>(8)?
                            .map(|value| checked_u64(value, "cache-write tokens"))
                            .transpose()?,
                        cost_usd: row.get(9)?,
                        observed_at: row.get(10)?,
                    })
                })?
                .collect::<rusqlite::Result<Vec<_>>>()?;
            Ok(rows)
        })
    }

    /// Search committed retained chunks by BM25 over the complete standing
    /// generation. Only returned chunks are decompressed.
    pub fn search(&self, query: SearchQuery) -> Result<SearchPage, HistoryError> {
        if query.expression.trim().is_empty() {
            return Err(invalid("FTS5 MATCH expression cannot be empty"));
        }
        let filter = query.filter.canonicalized()?;
        let limit = effective_limit(query.limit);
        let request_fingerprint = search_request_fingerprint(&query.expression, &filter);
        let expression = query.expression;
        let after = query.after;
        self.submit(move |connection| {
            // The fence check and ranked query share one WAL snapshot. A
            // staging writer either lands its fence+FTS rows after this
            // snapshot (so ranks remain old-corpus stable) or before it (so
            // this call returns Rebuilding until parent publication bumps the
            // epoch and removes the fence).
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Deferred)?;
            let fenced: bool = transaction.query_row(
                "SELECT EXISTS(SELECT 1 FROM history_search_fences)",
                [],
                |row| row.get(0),
            )?;
            if fenced {
                return Err(HistoryError::Rebuilding);
            }
            let standing = transaction
                .query_row(
                    "SELECT g.generation_id, m.value
                       FROM history_index_generations g
                       JOIN history_meta a ON a.key='active_generation'
                                              AND a.value=g.generation_id
                       JOIN history_meta m ON m.key='corpus_epoch'
                      WHERE g.state='ready'",
                    [],
                    |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)),
                )
                .optional()?
                .ok_or(HistoryError::Rebuilding)?;
            let epoch = standing.1.parse::<u64>().map_err(|error| {
                internal(format!("invalid stored searchable-corpus epoch: {error}"))
            })?;
            let cursor = after.as_ref().map(parse_search_cursor).transpose()?;
            if let Some(cursor) = &cursor {
                if cursor.generation != standing.0
                    || cursor.epoch != epoch
                    || cursor.request_fingerprint != request_fingerprint
                {
                    return Err(HistoryError::StaleCursor);
                }
            }

            // Force FTS5 to compile the caller expression independently of
            // join cardinality. Without this probe SQLite can optimize an
            // empty corpus join to no work and never report malformed MATCH
            // syntax at all.
            transaction
                .query_row(
                    "SELECT rowid FROM history_search_fts
                      WHERE history_search_fts MATCH ?1 LIMIT 1",
                    [&expression],
                    |row| row.get::<_, i64>(0),
                )
                .optional()
                .map_err(map_match_error)?;

            let mut sql = String::from(
                "SELECT c.chunk_id, e.event_id, r.revision_id,
                        bm25(history_search_fts) AS rank,
                        c.uncompressed_length, c.sha256, c.compressed_bytes,
                        s.repository_path, r.role, r.model
                   FROM history_search_fts
                   JOIN history_fts_membership m
                     ON m.chunk_id=history_search_fts.rowid
                   JOIN history_search_chunks c ON c.chunk_id=history_search_fts.rowid
                   JOIN history_event_revisions r ON r.revision_id=c.revision_id
                   JOIN history_events e ON e.event_id=r.event_id
                   JOIN history_sessions s ON s.session_id=e.session_id
                  WHERE history_search_fts MATCH ?
                    AND m.generation_id=? AND r.visibility='committed'",
            );
            let mut values = vec![Value::Text(expression), Value::Text(standing.0.clone())];
            append_filters(&mut sql, &mut values, &filter, ModelColumn::Event);
            if let Some(cursor) = &cursor {
                sql.push_str(
                    " AND (bm25(history_search_fts) > ?
                           OR (bm25(history_search_fts) = ? AND c.chunk_id > ?))",
                );
                values.push(Value::Real(cursor.rank));
                values.push(Value::Real(cursor.rank));
                values.push(Value::Integer(cursor.chunk_id));
            }
            sql.push_str(" ORDER BY rank, c.chunk_id LIMIT ?");
            values.push(Value::Integer(i64::from(limit) + 1));

            let mut statement = transaction.prepare(&sql).map_err(map_match_error)?;
            let rows = statement
                .query_map(params_from_iter(values.iter()), |row| {
                    Ok(CompressedMatch {
                        chunk_id: row.get(0)?,
                        event_id: row.get(1)?,
                        revision_id: row.get(2)?,
                        rank: row.get(3)?,
                        uncompressed_length: row.get(4)?,
                        sha256: row.get(5)?,
                        compressed: row.get(6)?,
                        repository_path: row.get::<_, Option<String>>(7)?.map(PathBuf::from),
                        role: row
                            .get::<_, Option<String>>(8)?
                            .map(|value| EventRole::decode(8, &value))
                            .transpose()?,
                        model: row.get(9)?,
                    })
                })
                .map_err(map_match_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(map_match_error)?;
            drop(statement);
            let has_more = rows.len() > limit as usize;
            let mut matches = Vec::with_capacity(rows.len().min(limit as usize));
            for row in rows.into_iter().take(limit as usize) {
                let length = usize::try_from(row.uncompressed_length)
                    .map_err(|_| internal("negative or oversized search chunk length"))?;
                if length > SEARCH_CHUNK_TARGET_BYTES + 3 {
                    return Err(internal("stored search chunk exceeds UTF-8 chunk bound"));
                }
                let decoded = zstd::bulk::decompress(&row.compressed, length)
                    .map_err(|error| internal(format!("decompressing search result: {error}")))?;
                if decoded.len() != length || hex_digest(Sha256::digest(&decoded)) != row.sha256 {
                    return Err(internal("search result checksum or length mismatch"));
                }
                let text = String::from_utf8(decoded).map_err(|error| {
                    internal(format!("stored search result is not UTF-8: {error}"))
                })?;
                matches.push(SearchMatch {
                    chunk_id: row.chunk_id,
                    event_id: row.event_id,
                    revision_id: row.revision_id,
                    rank: row.rank,
                    text,
                    repository_path: row.repository_path,
                    role: row.role,
                    model: row.model,
                });
            }
            let next = if has_more {
                matches.last().map(|last| {
                    encode_search_cursor(
                        &standing.0,
                        epoch,
                        last.rank,
                        last.chunk_id,
                        &request_fingerprint,
                    )
                })
            } else {
                None
            };
            let page = SearchPage {
                decompressed_chunks: matches.len(),
                matches,
                next,
            };
            transaction.commit()?;
            Ok(page)
        })
    }
}

fn canonicalize_query(mut query: MetadataQuery) -> Result<MetadataQuery, HistoryError> {
    if query.after_id.is_some_and(|after| after < 0) {
        return Err(invalid("metadata cursor cannot be negative"));
    }
    query.filter = query.filter.canonicalized()?;
    Ok(query)
}

fn effective_limit(limit: u32) -> u32 {
    if limit == 0 {
        DEFAULT_PAGE_SIZE
    } else {
        limit.min(MAX_PAGE_SIZE)
    }
}

#[derive(Debug, Clone, Copy)]
enum ModelColumn {
    Event,
    Usage,
}

fn append_filters(
    sql: &mut String,
    values: &mut Vec<Value>,
    filter: &HistoryFilter,
    model_column: ModelColumn,
) {
    if let Some(host_id) = &filter.host_id {
        sql.push_str(" AND s.host_id=?");
        values.push(Value::Text(host_id.clone()));
    }
    if let Some(repository) = &filter.repository_path {
        sql.push_str(" AND s.repository_path=?");
        values.push(Value::Text(repository.to_string_lossy().into_owned()));
    }
    if let Some(source) = filter.source_family {
        sql.push_str(" AND s.source_family=?");
        values.push(Value::Text(source.as_str().to_owned()));
    }
    if let Some(role) = filter.role {
        sql.push_str(" AND r.role=?");
        values.push(Value::Text(role.as_str().to_owned()));
    }
    if let Some(model) = &filter.model {
        match model_column {
            ModelColumn::Event => {
                sql.push_str(
                    " AND (r.model=? OR EXISTS (
                       SELECT 1 FROM history_usage_evidence fu
                        WHERE fu.revision_id=r.revision_id AND fu.model=?
                     ))",
                );
                values.push(Value::Text(model.clone()));
                values.push(Value::Text(model.clone()));
            }
            ModelColumn::Usage => {
                sql.push_str(" AND (u.model=? OR r.model=?)");
                values.push(Value::Text(model.clone()));
                values.push(Value::Text(model.clone()));
            }
        }
    }
    if let Some(session_id) = filter.session_id {
        sql.push_str(" AND s.session_id=?");
        values.push(Value::Integer(session_id));
    }
    if let Some(from) = &filter.from {
        sql.push_str(" AND r.occurred_at>=?");
        values.push(Value::Text(from.clone()));
    }
    if let Some(to) = &filter.to {
        sql.push_str(" AND r.occurred_at<?");
        values.push(Value::Text(to.clone()));
    }
}

fn map_event_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<EventRow> {
    let revision: i64 = row.get(3)?;
    Ok(EventRow {
        event_id: row.get(0)?,
        session_id: row.get(1)?,
        event_key: row.get(2)?,
        revision: u32::try_from(revision).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                3,
                rusqlite::types::Type::Integer,
                error.into(),
            )
        })?,
        revision_id: row.get(4)?,
        occurred_at: row.get(5)?,
        role: row
            .get::<_, Option<String>>(6)?
            .map(|value| EventRole::decode(6, &value))
            .transpose()?,
        model: row.get(7)?,
    })
}

struct CompressedMatch {
    chunk_id: i64,
    event_id: i64,
    revision_id: i64,
    rank: f64,
    uncompressed_length: i64,
    sha256: String,
    compressed: Vec<u8>,
    repository_path: Option<PathBuf>,
    role: Option<EventRole>,
    model: Option<String>,
}

struct ParsedCursor {
    generation: String,
    epoch: u64,
    rank: f64,
    chunk_id: i64,
    request_fingerprint: String,
}

fn encode_search_cursor(
    generation: &str,
    epoch: u64,
    rank: f64,
    chunk_id: i64,
    request_fingerprint: &str,
) -> SearchCursor {
    SearchCursor(format!(
        "v1|{generation}|{epoch}|{:016x}|{chunk_id}|{request_fingerprint}",
        rank.to_bits()
    ))
}

fn parse_search_cursor(cursor: &SearchCursor) -> Result<ParsedCursor, HistoryError> {
    let fields = cursor.0.split('|').collect::<Vec<_>>();
    if fields.len() != 6 || fields[0] != "v1" {
        return Err(invalid("malformed history search cursor"));
    }
    let epoch = fields[2]
        .parse::<u64>()
        .map_err(|_| invalid("malformed history search cursor epoch"))?;
    let rank_bits = u64::from_str_radix(fields[3], 16)
        .map_err(|_| invalid("malformed history search cursor rank"))?;
    let rank = f64::from_bits(rank_bits);
    if !rank.is_finite() {
        return Err(invalid("non-finite history search cursor rank"));
    }
    let chunk_id = fields[4]
        .parse::<i64>()
        .map_err(|_| invalid("malformed history search cursor chunk id"))?;
    if chunk_id < 0 {
        return Err(invalid("negative history search cursor chunk id"));
    }
    Ok(ParsedCursor {
        generation: fields[1].to_owned(),
        epoch,
        rank,
        chunk_id,
        request_fingerprint: fields[5].to_owned(),
    })
}

fn search_request_fingerprint(expression: &str, filter: &HistoryFilter) -> String {
    let mut hasher = Sha256::new();
    for value in [
        Some(expression.to_owned()),
        filter.host_id.clone(),
        filter
            .repository_path
            .as_ref()
            .map(|path| path.to_string_lossy().into_owned()),
        filter
            .source_family
            .map(|source| source.as_str().to_owned()),
        filter.role.map(|role| role.as_str().to_owned()),
        filter.model.clone(),
        filter.session_id.map(|id| id.to_string()),
        filter.from.clone(),
        filter.to.clone(),
    ] {
        match value {
            Some(value) => {
                hasher.update([1]);
                hasher.update((value.len() as u64).to_be_bytes());
                hasher.update(value.as_bytes());
            }
            None => hasher.update([0]),
        }
    }
    hex_digest(hasher.finalize())
}

fn map_match_error(error: rusqlite::Error) -> HistoryError {
    let message = error.to_string();
    if message.contains("fts5:")
        || message.contains("malformed MATCH")
        || message.contains("syntax error")
        || message.contains("unterminated")
    {
        invalid(format!("invalid FTS5 MATCH expression: {message}"))
    } else {
        HistoryError::from(error)
    }
}
