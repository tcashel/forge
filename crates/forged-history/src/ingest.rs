//! Streaming prepared-event ingestion and bounded staged publication.

use std::io::Read;

use rusqlite::{params, OptionalExtension, TransactionBehavior};
use sha2::{Digest, Sha256};

use crate::actor::History;
use crate::error::{internal, invalid, HistoryError};
use crate::schema::active_generation;
use crate::time::{canonical_timestamp, now_timestamp};
use crate::types::{
    checked_i64, normalize_absolute_path, IngestOutcome, PreparedEvent, SourceObservation,
    UsageFact,
};

/// Target uncompressed bytes in one independently decompressible archive block.
pub const ARCHIVE_BLOCK_TARGET_BYTES: usize = 64 * 1024;
/// Maximum archive parts staged in one SQLite transaction.
pub const ARCHIVE_STAGE_BATCH: usize = 8;
/// Target UTF-8 bytes in one independently decompressible lexical chunk.
pub const SEARCH_CHUNK_TARGET_BYTES: usize = 4 * 1024;
/// Maximum search chunks staged in one SQLite transaction.
pub const SEARCH_STAGE_BATCH: usize = 32;
/// Dedicated usage batch bound; independent of lexical chunk sizing.
pub const USAGE_STAGE_BATCH: usize = 64;
/// Maximum parent/session/cursor/fence rows changed by final publication.
pub const FINAL_PUBLICATION_MAX_ROWS: usize = 8;
const CLEANUP_BATCH: usize = 64;
const ZSTD_LEVEL: i32 = 3;
const PREPARED_FINGERPRINT_VERSION: &str = "forged-history-prepared/v1";

#[derive(Debug)]
struct ArchivePart {
    sequence: u64,
    offset: u64,
    uncompressed_length: u64,
    sha256: String,
    compressed: Vec<u8>,
}

#[derive(Debug)]
struct SearchChunk {
    sequence: u64,
    uncompressed_length: u64,
    sha256: String,
    compressed: Vec<u8>,
    plaintext: String,
}

#[derive(Debug)]
struct StagedUsage {
    sequence: u64,
    fact: UsageFact,
}

/// Stateful streaming builder for one prepared native event.
///
/// Compression and hashing happen on the caller thread. SQLite sees only
/// bounded batches; any failed batch permanently poisons this builder.
pub struct IngestBuilder {
    history: History,
    prepared: PreparedEvent,
    revision_id: i64,
    source_file_id: Option<i64>,
    base_fingerprint: Sha256,
    raw_hasher: Sha256,
    text_hasher: Sha256,
    usage_hasher: Sha256,
    raw_length: u64,
    text_length: u64,
    raw_sequence: u64,
    text_sequence: u64,
    usage_sequence: u64,
    archive_pending: Vec<ArchivePart>,
    text_buffer: String,
    search_pending: Vec<SearchChunk>,
    usage_pending: Vec<StagedUsage>,
    poisoned: bool,
    finished: bool,
}

impl std::fmt::Debug for IngestBuilder {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("IngestBuilder")
            .field("revision_id", &self.revision_id)
            .field("raw_length", &self.raw_length)
            .field("text_length", &self.text_length)
            .field("poisoned", &self.poisoned)
            .field("finished", &self.finished)
            .finish_non_exhaustive()
    }
}

impl History {
    /// Begin staging one prepared provider-neutral event.
    pub fn begin_event(&self, prepared: PreparedEvent) -> Result<IngestBuilder, HistoryError> {
        let prepared = canonicalize_prepared(prepared)?;
        let base_fingerprint = prepared_fingerprint_prefix(&prepared);
        let now = now_timestamp();
        let staging_token = uuid::Uuid::now_v7().to_string();
        let prepared_for_insert = prepared.clone();
        let (revision_id, source_file_id) = self.submit(move |connection| {
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let host_id: String = transaction.query_row(
                "SELECT value FROM history_meta WHERE key='host_id'",
                [],
                |row| row.get(0),
            )?;
            transaction.execute(
                "INSERT INTO history_event_revisions(
                   staging_token, parser_version, occurred_at, role, model,
                   visibility, created_at
                 ) VALUES (?1, ?2, ?3, ?4, ?5, 'staging', ?6)",
                params![
                    staging_token,
                    prepared_for_insert.parser_version,
                    prepared_for_insert.occurred_at,
                    prepared_for_insert.role.map(|role| role.as_str()),
                    prepared_for_insert.model,
                    now,
                ],
            )?;
            let revision_id = transaction.last_insert_rowid();
            for fact in &prepared_for_insert.metadata {
                transaction.execute(
                    "INSERT INTO history_revision_metadata(revision_id, name, value)
                     VALUES (?1, ?2, ?3)",
                    params![revision_id, fact.name, fact.value],
                )?;
            }
            for (sequence, fact) in prepared_for_insert.lineage.iter().enumerate() {
                transaction.execute(
                    "INSERT INTO history_event_lineage(revision_id, sequence, name, value)
                     VALUES (?1, ?2, ?3, ?4)",
                    params![
                        revision_id,
                        i64::try_from(sequence)
                            .map_err(|_| invalid("lineage count exceeds SQLite range"))?,
                        fact.name,
                        fact.value,
                    ],
                )?;
            }
            let source_file_id = match &prepared_for_insert.source_observation {
                Some(observation) => Some(ensure_source_file(
                    &transaction,
                    &host_id,
                    prepared_for_insert.source_family.as_str(),
                    observation,
                    &now,
                )?),
                None => None,
            };
            transaction.commit()?;
            Ok((revision_id, source_file_id))
        })?;
        Ok(IngestBuilder {
            history: self.clone(),
            prepared,
            revision_id,
            source_file_id,
            base_fingerprint,
            raw_hasher: Sha256::new(),
            text_hasher: Sha256::new(),
            usage_hasher: Sha256::new(),
            raw_length: 0,
            text_length: 0,
            raw_sequence: 0,
            text_sequence: 0,
            usage_sequence: 0,
            archive_pending: Vec::with_capacity(ARCHIVE_STAGE_BATCH),
            text_buffer: String::with_capacity(SEARCH_CHUNK_TARGET_BYTES + 4),
            search_pending: Vec::with_capacity(SEARCH_STAGE_BATCH),
            usage_pending: Vec::with_capacity(USAGE_STAGE_BATCH),
            poisoned: false,
            finished: false,
        })
    }

    /// Remove only never-committed staging revisions in bounded batches.
    pub fn cleanup_staging(&self) -> Result<u64, HistoryError> {
        let mut removed = 0_u64;
        loop {
            let next = claim_next_cleanup_revision(self)?;
            let Some(revision_id) = next else {
                break;
            };
            if cleanup_claimed_revision(self, revision_id)? {
                removed = removed.saturating_add(1);
            }
        }
        Ok(removed)
    }

    /// Mark a physical source observation missing without deleting history.
    pub fn mark_source_missing(
        &self,
        source_family: crate::types::SourceFamily,
        root_path: &std::path::Path,
        file_path: &std::path::Path,
    ) -> Result<bool, HistoryError> {
        let root_path = normalize_absolute_path(root_path)?
            .to_string_lossy()
            .into_owned();
        let file_path = normalize_absolute_path(file_path)?
            .to_string_lossy()
            .into_owned();
        let source_family = source_family.as_str().to_owned();
        let now = now_timestamp();
        self.submit(move |connection| {
            let changed = connection.execute(
                "UPDATE history_source_files
                    SET state='missing', last_seen_at=?1
                  WHERE file_path=?2 AND source_root_id=(
                    SELECT r.source_root_id FROM history_source_roots r
                    JOIN history_meta h ON h.key='host_id' AND h.value=r.host_id
                    WHERE r.source_family=?3 AND r.root_path=?4
                  )",
                params![now, file_path, source_family, root_path],
            )?;
            Ok(changed != 0)
        })
    }

    /// Attach a durable execution attempt identity to retained history.
    pub fn link_attempt(
        &self,
        revision_id: i64,
        run_id: &str,
        attempt_id: Option<i64>,
    ) -> Result<(), HistoryError> {
        if revision_id <= 0 || run_id.is_empty() {
            return Err(invalid(
                "revision id and run id must be non-empty positive identities",
            ));
        }
        let attempt_id = attempt_id
            .filter(|attempt_id| *attempt_id > 0)
            .ok_or_else(|| invalid("attempt id must be a positive identity"))?;
        let run_id = run_id.to_owned();
        self.submit(move |connection| {
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let inserted = transaction.execute(
                "INSERT OR IGNORE INTO history_attempt_links(revision_id, run_id, attempt_id)
                 SELECT ?1, ?2, ?3
                  WHERE EXISTS (
                    SELECT 1 FROM history_event_revisions
                     WHERE revision_id=?1 AND visibility='committed'
                  )",
                params![revision_id, run_id, attempt_id],
            )?;
            if inserted == 0 {
                let linked: bool = transaction.query_row(
                    "SELECT EXISTS(
                       SELECT 1 FROM history_attempt_links
                        WHERE revision_id=?1 AND run_id=?2 AND attempt_id=?3
                     )",
                    params![revision_id, run_id, attempt_id],
                    |row| row.get(0),
                )?;
                if !linked {
                    return Err(HistoryError::NotFound);
                }
            }
            transaction.commit()?;
            Ok(())
        })
    }
}

impl IngestBuilder {
    /// Stable staging revision id, useful only for crash/integrity diagnostics.
    pub fn staging_revision_id(&self) -> i64 {
        self.revision_id
    }

    /// Stream one logical source part. Calls may be repeated; internal archive
    /// blocks are independent of caller part boundaries.
    pub fn push_raw_part<R: Read>(&mut self, mut reader: R) -> Result<(), HistoryError> {
        self.assert_writable()?;
        let mut buffer = vec![0_u8; ARCHIVE_BLOCK_TARGET_BYTES];
        loop {
            let mut filled = 0;
            while filled < buffer.len() {
                match reader.read(&mut buffer[filled..]) {
                    Ok(0) => break,
                    Ok(read) => filled += read,
                    Err(error) => return self.poison(HistoryError::from(error)),
                }
            }
            if filled == 0 {
                break;
            }
            let bytes = &buffer[..filled];
            self.raw_hasher.update(bytes);
            let sha256 = hex_digest(Sha256::digest(bytes));
            let compressed = zstd::bulk::compress(bytes, ZSTD_LEVEL)
                .map_err(|error| internal(format!("compressing archive block: {error}")))?;
            let length =
                u64::try_from(filled).map_err(|_| invalid("archive block length exceeds u64"))?;
            let part = ArchivePart {
                sequence: self.raw_sequence,
                offset: self.raw_length,
                uncompressed_length: length,
                sha256,
                compressed,
            };
            self.raw_sequence = self.raw_sequence.saturating_add(1);
            self.raw_length = self
                .raw_length
                .checked_add(length)
                .ok_or_else(|| invalid("logical event length exceeds u64"))?;
            self.archive_pending.push(part);
            if self.archive_pending.len() == ARCHIVE_STAGE_BATCH {
                self.flush_archive()?;
            }
            if filled < buffer.len() {
                break;
            }
        }
        Ok(())
    }

    /// Stream several logical source parts without collecting them.
    pub fn push_raw_parts<I, R>(&mut self, parts: I) -> Result<(), HistoryError>
    where
        I: IntoIterator<Item = R>,
        R: Read,
    {
        for part in parts {
            self.push_raw_part(part)?;
        }
        Ok(())
    }

    /// Append one extracted UTF-8 fragment. One persistent chunker spans all
    /// calls, so fragment boundaries cannot split a search term.
    pub fn push_text_fragment(&mut self, fragment: &str) -> Result<(), HistoryError> {
        self.assert_writable()?;
        self.text_hasher.update(fragment.as_bytes());
        self.text_length = self
            .text_length
            .checked_add(
                u64::try_from(fragment.len())
                    .map_err(|_| invalid("text fragment length exceeds u64"))?,
            )
            .ok_or_else(|| invalid("logical search text length exceeds u64"))?;
        for character in fragment.chars() {
            self.text_buffer.push(character);
            // Whitespace is always a token boundary for unicode61. Waiting
            // until one is observed keeps a token whole even when it crosses
            // the target byte position or an input-fragment boundary.
            if self.text_buffer.len() >= SEARCH_CHUNK_TARGET_BYTES && character.is_whitespace() {
                self.seal_text_chunk()?;
            }
        }
        Ok(())
    }

    /// Stage one ordered usage fact under its own independent batch bound.
    pub fn push_usage(&mut self, mut fact: UsageFact) -> Result<(), HistoryError> {
        self.assert_writable()?;
        if fact.provider.is_empty() || fact.model.is_empty() {
            return Err(invalid("usage provider and model must be non-empty"));
        }
        if fact
            .cost_usd
            .is_some_and(|cost| !cost.is_finite() || cost < 0.0)
        {
            return Err(invalid("usage cost must be finite and non-negative"));
        }
        fact.observed_at = canonical_timestamp(&fact.observed_at)?;
        fingerprint_usage(&mut self.usage_hasher, &fact);
        self.usage_pending.push(StagedUsage {
            sequence: self.usage_sequence,
            fact,
        });
        self.usage_sequence = self.usage_sequence.saturating_add(1);
        if self.usage_pending.len() == USAGE_STAGE_BATCH {
            self.flush_usage()?;
        }
        Ok(())
    }

    /// Flush every bounded stage and publish the parent visibility fence.
    pub fn finish(&mut self) -> Result<IngestOutcome, HistoryError> {
        self.assert_writable()?;
        if !self.text_buffer.is_empty() {
            self.seal_text_chunk()?;
        }
        self.flush_archive()?;
        self.flush_search()?;
        self.flush_usage()?;
        if self.raw_length == 0 {
            return Err(invalid("prepared event contains no valid-record bytes"));
        }

        let raw_sha256 = hex_digest(self.raw_hasher.clone().finalize());
        let text_sha256 = hex_digest(self.text_hasher.clone().finalize());
        let usage_sha256 = hex_digest(self.usage_hasher.clone().finalize());
        let fingerprint = finish_fingerprint(
            self.base_fingerprint.clone(),
            &raw_sha256,
            self.raw_length,
            &text_sha256,
            self.text_length,
            &usage_sha256,
            self.usage_sequence,
        );
        let event_key = self
            .prepared
            .native_event_key
            .clone()
            .unwrap_or_else(|| fallback_event_key(&self.prepared, &raw_sha256));

        if let Some((revision_id, revision)) =
            find_replay(&self.history, &self.prepared, &event_key, &fingerprint)?
        {
            publish_replay_progress(
                &self.history,
                self.revision_id,
                self.source_file_id,
                revision_id,
                &self.prepared,
            )?;
            cleanup_claimed_revision(&self.history, self.revision_id)?;
            self.finished = true;
            return Ok(IngestOutcome::Replayed {
                revision_id,
                revision,
            });
        }

        ensure_revision_in_active_index(&self.history, self.revision_id)?;
        let finalization = finalize_revision(
            &self.history,
            self.revision_id,
            self.source_file_id,
            self.prepared.clone(),
            event_key,
            fingerprint,
            raw_sha256,
            self.raw_length,
            self.text_sequence != 0,
        )?;
        match finalization {
            Finalization::Committed {
                revision_id,
                revision,
                rows_touched,
            } => {
                self.finished = true;
                Ok(IngestOutcome::Committed {
                    revision_id,
                    revision,
                    final_rows_touched: rows_touched,
                })
            }
            Finalization::Replayed {
                revision_id,
                revision,
            } => {
                cleanup_claimed_revision(&self.history, self.revision_id)?;
                self.finished = true;
                Ok(IngestOutcome::Replayed {
                    revision_id,
                    revision,
                })
            }
        }
    }

    fn assert_writable(&self) -> Result<(), HistoryError> {
        if self.poisoned {
            return Err(HistoryError::Poisoned);
        }
        if self.finished {
            return Err(invalid("ingest builder is already finished"));
        }
        Ok(())
    }

    fn poison<T>(&mut self, error: HistoryError) -> Result<T, HistoryError> {
        self.poisoned = true;
        Err(error)
    }

    fn flush_archive(&mut self) -> Result<(), HistoryError> {
        if self.archive_pending.is_empty() {
            return Ok(());
        }
        let revision_id = self.revision_id;
        let pending = std::mem::take(&mut self.archive_pending);
        let result = self.history.submit(move |connection| {
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
            require_staging_revision(&transaction, revision_id)?;
            for part in pending {
                transaction.execute(
                    "INSERT INTO history_archive_blocks(
                       codec, codec_schema, uncompressed_length, sha256,
                       compressed_bytes, reference_count
                     ) VALUES ('zstd', 1, ?1, ?2, ?3, 0)
                     ON CONFLICT(sha256, uncompressed_length) DO NOTHING",
                    params![
                        checked_i64(part.uncompressed_length, "archive block length")?,
                        part.sha256,
                        part.compressed,
                    ],
                )?;
                let (block_id, stored): (i64, Vec<u8>) = transaction.query_row(
                    "SELECT block_id, compressed_bytes FROM history_archive_blocks
                      WHERE sha256=?1 AND uncompressed_length=?2",
                    params![
                        part.sha256,
                        checked_i64(part.uncompressed_length, "archive block length")?
                    ],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )?;
                if stored != part.compressed {
                    return Err(internal("archive SHA-256 identity collision"));
                }
                transaction.execute(
                    "INSERT INTO history_event_parts(
                       revision_id, sequence, byte_offset, uncompressed_length, block_id
                     ) VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![
                        revision_id,
                        checked_i64(part.sequence, "archive sequence")?,
                        checked_i64(part.offset, "archive offset")?,
                        checked_i64(part.uncompressed_length, "archive part length")?,
                        block_id,
                    ],
                )?;
            }
            transaction.commit()?;
            Ok(())
        });
        if let Err(error) = result {
            return self.poison(error);
        }
        Ok(())
    }

    fn seal_text_chunk(&mut self) -> Result<(), HistoryError> {
        if self.text_buffer.is_empty() {
            return Ok(());
        }
        let plaintext = std::mem::take(&mut self.text_buffer);
        let bytes = plaintext.as_bytes();
        let length =
            u64::try_from(bytes.len()).map_err(|_| invalid("search chunk length exceeds u64"))?;
        let sha256 = hex_digest(Sha256::digest(bytes));
        let compressed = zstd::bulk::compress(bytes, ZSTD_LEVEL)
            .map_err(|error| internal(format!("compressing search chunk: {error}")))?;
        self.search_pending.push(SearchChunk {
            sequence: self.text_sequence,
            uncompressed_length: length,
            sha256,
            compressed,
            plaintext,
        });
        self.text_sequence = self.text_sequence.saturating_add(1);
        if self.search_pending.len() == SEARCH_STAGE_BATCH {
            self.flush_search()?;
        }
        Ok(())
    }

    fn flush_search(&mut self) -> Result<(), HistoryError> {
        if self.search_pending.is_empty() {
            return Ok(());
        }
        let revision_id = self.revision_id;
        let pending = std::mem::take(&mut self.search_pending);
        let result = self.history.submit(move |connection| {
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
            require_staging_revision(&transaction, revision_id)?;
            let (generation, _) = active_generation(&transaction)?
                .ok_or_else(|| internal("history database has no active index generation"))?;
            transaction.execute(
                "INSERT OR IGNORE INTO history_search_fences(revision_id) VALUES (?1)",
                params![revision_id],
            )?;
            for chunk in pending {
                transaction.execute(
                    "INSERT INTO history_search_chunks(
                       revision_id, sequence, uncompressed_length, sha256, compressed_bytes
                     ) VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![
                        revision_id,
                        checked_i64(chunk.sequence, "search chunk sequence")?,
                        checked_i64(chunk.uncompressed_length, "search chunk length")?,
                        chunk.sha256,
                        chunk.compressed,
                    ],
                )?;
                let chunk_id = transaction.last_insert_rowid();
                transaction.execute(
                    "INSERT INTO history_search_fts(rowid, text) VALUES (?1, ?2)",
                    params![chunk_id, chunk.plaintext],
                )?;
                transaction.execute(
                    "INSERT INTO history_fts_membership(generation_id, chunk_id)
                     VALUES (?1, ?2)",
                    params![generation, chunk_id],
                )?;
            }
            transaction.execute(
                "UPDATE history_index_generations
                    SET indexed_count=(
                      SELECT count(*) FROM history_fts_membership
                       WHERE generation_id=?1
                    )
                  WHERE generation_id=?1",
                params![generation],
            )?;
            transaction.commit()?;
            Ok(())
        });
        if let Err(error) = result {
            return self.poison(error);
        }
        Ok(())
    }

    fn flush_usage(&mut self) -> Result<(), HistoryError> {
        if self.usage_pending.is_empty() {
            return Ok(());
        }
        let revision_id = self.revision_id;
        let pending = std::mem::take(&mut self.usage_pending);
        let result = self.history.submit(move |connection| {
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
            require_staging_revision(&transaction, revision_id)?;
            for staged in pending {
                let fact = staged.fact;
                transaction.execute(
                    "INSERT INTO history_usage_evidence(
                       revision_id, sequence, provider, model, input_tokens,
                       output_tokens, cache_read_tokens, cache_write_tokens,
                       cost_usd, observed_at
                     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                    params![
                        revision_id,
                        checked_i64(staged.sequence, "usage sequence")?,
                        fact.provider,
                        fact.model,
                        checked_i64(fact.input_tokens, "input tokens")?,
                        checked_i64(fact.output_tokens, "output tokens")?,
                        fact.cache_read_tokens
                            .map(|value| checked_i64(value, "cache-read tokens"))
                            .transpose()?,
                        fact.cache_write_tokens
                            .map(|value| checked_i64(value, "cache-write tokens"))
                            .transpose()?,
                        fact.cost_usd,
                        fact.observed_at,
                    ],
                )?;
            }
            transaction.commit()?;
            Ok(())
        });
        if let Err(error) = result {
            return self.poison(error);
        }
        Ok(())
    }
}

fn canonicalize_prepared(mut prepared: PreparedEvent) -> Result<PreparedEvent, HistoryError> {
    if prepared.native_session_id.is_empty() || prepared.parser_version.is_empty() {
        return Err(invalid(
            "native session id and parser version must be non-empty",
        ));
    }
    if prepared.native_event_key.as_deref() == Some("") {
        return Err(invalid("native event key cannot be empty"));
    }
    prepared.occurred_at = canonical_timestamp(&prepared.occurred_at)?;
    prepared.session_started_at = prepared
        .session_started_at
        .take()
        .map(|value| canonical_timestamp(&value))
        .transpose()?;
    prepared.session_ended_at = prepared
        .session_ended_at
        .take()
        .map(|value| canonical_timestamp(&value))
        .transpose()?;
    if matches!(
        (&prepared.session_started_at, &prepared.session_ended_at),
        (Some(start), Some(end)) if start > end
    ) {
        return Err(invalid("session start must not follow session end"));
    }
    if let Some(path) = prepared.repository_path.take() {
        prepared.repository_path = Some(normalize_absolute_path(&path)?);
    }
    if let Some(observation) = prepared.source_observation.as_mut() {
        observation.root_path = normalize_absolute_path(&observation.root_path)?;
        observation.file_path = normalize_absolute_path(&observation.file_path)?;
    }
    prepared
        .metadata
        .sort_by(|left, right| left.name.cmp(&right.name));
    for window in prepared.metadata.windows(2) {
        if window[0].name == window[1].name {
            return Err(invalid(format!(
                "duplicate normalized metadata field {:?}",
                window[0].name
            )));
        }
    }
    if prepared
        .metadata
        .iter()
        .chain(prepared.lineage.iter())
        .any(|fact| fact.name.is_empty())
    {
        return Err(invalid("metadata and lineage names must be non-empty"));
    }
    Ok(prepared)
}

fn ensure_source_file(
    transaction: &rusqlite::Transaction<'_>,
    host_id: &str,
    source_family: &str,
    observation: &SourceObservation,
    now: &str,
) -> Result<i64, HistoryError> {
    let root_path = observation.root_path.to_string_lossy();
    transaction.execute(
        "INSERT INTO history_source_roots(host_id, source_family, root_path, created_at)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(host_id, source_family, root_path) DO NOTHING",
        params![host_id, source_family, root_path, now],
    )?;
    let source_root_id: i64 = transaction.query_row(
        "SELECT source_root_id FROM history_source_roots
          WHERE host_id=?1 AND source_family=?2 AND root_path=?3",
        params![host_id, source_family, root_path],
        |row| row.get(0),
    )?;
    let file_path = observation.file_path.to_string_lossy();
    transaction.execute(
        "INSERT INTO history_source_files(
           source_root_id, file_path, state, first_seen_at, last_seen_at
         ) VALUES (?1, ?2, 'present', ?3, ?3)
         ON CONFLICT(source_root_id, file_path) DO UPDATE SET
           state='present', last_seen_at=excluded.last_seen_at",
        params![source_root_id, file_path, now],
    )?;
    transaction
        .query_row(
            "SELECT source_file_id FROM history_source_files
              WHERE source_root_id=?1 AND file_path=?2",
            params![source_root_id, file_path],
            |row| row.get(0),
        )
        .map_err(Into::into)
}

fn prepared_fingerprint_prefix(prepared: &PreparedEvent) -> Sha256 {
    let mut hasher = Sha256::new();
    fingerprint_field(&mut hasher, PREPARED_FINGERPRINT_VERSION.as_bytes());
    fingerprint_field(&mut hasher, prepared.source_family.as_str().as_bytes());
    fingerprint_field(&mut hasher, prepared.native_session_id.as_bytes());
    fingerprint_option(&mut hasher, prepared.native_event_key.as_deref());
    fingerprint_field(&mut hasher, prepared.parser_version.as_bytes());
    fingerprint_field(&mut hasher, prepared.occurred_at.as_bytes());
    fingerprint_option(&mut hasher, prepared.session_started_at.as_deref());
    fingerprint_option(&mut hasher, prepared.session_ended_at.as_deref());
    fingerprint_option(&mut hasher, prepared.observed_cwd.as_deref());
    let repository = prepared
        .repository_path
        .as_ref()
        .map(|path| path.to_string_lossy());
    fingerprint_option(&mut hasher, repository.as_deref());
    fingerprint_option(&mut hasher, prepared.role.map(|role| role.as_str()));
    fingerprint_option(&mut hasher, prepared.model.as_deref());
    fingerprint_u64(&mut hasher, prepared.lineage.len() as u64);
    for fact in &prepared.lineage {
        fingerprint_field(&mut hasher, fact.name.as_bytes());
        fingerprint_field(&mut hasher, fact.value.as_bytes());
    }
    fingerprint_u64(&mut hasher, prepared.metadata.len() as u64);
    for fact in &prepared.metadata {
        fingerprint_field(&mut hasher, fact.name.as_bytes());
        fingerprint_field(&mut hasher, fact.value.as_bytes());
    }
    hasher
}

fn fingerprint_usage(hasher: &mut Sha256, fact: &UsageFact) {
    fingerprint_field(hasher, fact.provider.as_bytes());
    fingerprint_field(hasher, fact.model.as_bytes());
    fingerprint_u64(hasher, fact.input_tokens);
    fingerprint_u64(hasher, fact.output_tokens);
    fingerprint_optional_u64(hasher, fact.cache_read_tokens);
    fingerprint_optional_u64(hasher, fact.cache_write_tokens);
    match fact.cost_usd {
        Some(cost) => {
            hasher.update([1]);
            hasher.update(cost.to_bits().to_be_bytes());
        }
        None => hasher.update([0]),
    }
    fingerprint_field(hasher, fact.observed_at.as_bytes());
}

fn finish_fingerprint(
    mut hasher: Sha256,
    raw_sha256: &str,
    raw_length: u64,
    text_sha256: &str,
    text_length: u64,
    usage_sha256: &str,
    usage_count: u64,
) -> String {
    fingerprint_field(&mut hasher, raw_sha256.as_bytes());
    fingerprint_u64(&mut hasher, raw_length);
    fingerprint_field(&mut hasher, text_sha256.as_bytes());
    fingerprint_u64(&mut hasher, text_length);
    fingerprint_field(&mut hasher, usage_sha256.as_bytes());
    fingerprint_u64(&mut hasher, usage_count);
    hex_digest(hasher.finalize())
}

fn fallback_event_key(prepared: &PreparedEvent, raw_sha256: &str) -> String {
    let mut coordinates = Sha256::new();
    fingerprint_field(&mut coordinates, b"forged-history-fallback/v2");
    fingerprint_field(&mut coordinates, prepared.source_family.as_str().as_bytes());
    fingerprint_field(&mut coordinates, prepared.native_session_id.as_bytes());
    fingerprint_field(&mut coordinates, prepared.occurred_at.as_bytes());
    if let Some(observation) = &prepared.source_observation {
        coordinates.update([1]);
        fingerprint_field(
            &mut coordinates,
            observation.root_path.as_os_str().as_encoded_bytes(),
        );
        fingerprint_field(
            &mut coordinates,
            observation.file_path.as_os_str().as_encoded_bytes(),
        );
        fingerprint_option(&mut coordinates, observation.cursor.as_deref());
    } else {
        coordinates.update([0]);
    }
    fingerprint_u64(&mut coordinates, prepared.lineage.len() as u64);
    for fact in &prepared.lineage {
        fingerprint_field(&mut coordinates, fact.name.as_bytes());
        fingerprint_field(&mut coordinates, fact.value.as_bytes());
    }
    format!(
        "fallback/v2/{}/{}",
        hex_digest(coordinates.finalize()),
        raw_sha256
    )
}

fn fingerprint_field(hasher: &mut Sha256, value: &[u8]) {
    fingerprint_u64(hasher, value.len() as u64);
    hasher.update(value);
}

fn fingerprint_option(hasher: &mut Sha256, value: Option<&str>) {
    match value {
        Some(value) => {
            hasher.update([1]);
            fingerprint_field(hasher, value.as_bytes());
        }
        None => hasher.update([0]),
    }
}

fn fingerprint_optional_u64(hasher: &mut Sha256, value: Option<u64>) {
    match value {
        Some(value) => {
            hasher.update([1]);
            fingerprint_u64(hasher, value);
        }
        None => hasher.update([0]),
    }
}

fn fingerprint_u64(hasher: &mut Sha256, value: u64) {
    hasher.update(value.to_be_bytes());
}

pub(crate) fn hex_digest(digest: impl AsRef<[u8]>) -> String {
    let bytes = digest.as_ref();
    let mut output = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        use std::fmt::Write as _;
        let _ = write!(output, "{byte:02x}");
    }
    output
}

fn find_replay(
    history: &History,
    prepared: &PreparedEvent,
    event_key: &str,
    fingerprint: &str,
) -> Result<Option<(i64, u32)>, HistoryError> {
    let source_family = prepared.source_family.as_str().to_owned();
    let native_session_id = prepared.native_session_id.clone();
    let event_key = event_key.to_owned();
    let fingerprint = fingerprint.to_owned();
    history.submit(move |connection| {
        connection
            .query_row(
                "SELECT r.revision_id, r.revision_no
                   FROM history_event_revisions r
                   JOIN history_events e ON e.event_id=r.event_id
                   JOIN history_sessions s ON s.session_id=e.session_id
                   JOIN history_meta h ON h.key='host_id' AND h.value=s.host_id
                  WHERE s.source_family=?1 AND s.native_session_id=?2
                    AND e.event_key=?3 AND r.fingerprint=?4
                    AND r.visibility='committed'",
                params![source_family, native_session_id, event_key, fingerprint],
                |row| {
                    let revision: i64 = row.get(1)?;
                    let revision = u32::try_from(revision).map_err(|error| {
                        rusqlite::Error::FromSqlConversionFailure(
                            1,
                            rusqlite::types::Type::Integer,
                            error.into(),
                        )
                    })?;
                    Ok((row.get(0)?, revision))
                },
            )
            .optional()
            .map_err(Into::into)
    })
}

fn require_staging_revision(
    transaction: &rusqlite::Transaction<'_>,
    revision_id: i64,
) -> Result<(), HistoryError> {
    let staging: bool = transaction.query_row(
        "SELECT EXISTS(
           SELECT 1 FROM history_event_revisions
            WHERE revision_id=?1 AND visibility='staging'
         )",
        params![revision_id],
        |row| row.get(0),
    )?;
    if staging {
        Ok(())
    } else {
        Err(internal("staging revision no longer owns ingestion"))
    }
}

fn claim_staging_revision(
    transaction: &rusqlite::Transaction<'_>,
    revision_id: i64,
) -> Result<(), HistoryError> {
    let claimed = transaction.execute(
        "UPDATE history_event_revisions SET visibility='cleaning'
          WHERE revision_id=?1 AND visibility='staging'",
        params![revision_id],
    )?;
    if claimed == 1 {
        Ok(())
    } else {
        Err(internal(
            "staging revision lost cleanup ownership before replay publication",
        ))
    }
}

fn publish_observation(
    transaction: &rusqlite::Transaction<'_>,
    session_id: i64,
    source_file_id: Option<i64>,
    revision_id: i64,
    observation: Option<&SourceObservation>,
    now: &str,
) -> Result<usize, HistoryError> {
    let Some(source_file_id) = source_file_id else {
        return Ok(0);
    };
    let mut rows = transaction.execute(
        "INSERT INTO history_observations(
           session_id, source_file_id, first_seen_at, last_seen_at
         ) VALUES (?1, ?2, ?3, ?3)
         ON CONFLICT(session_id, source_file_id) DO UPDATE SET
           last_seen_at=excluded.last_seen_at",
        params![session_id, source_file_id, now],
    )?;
    if let Some(cursor) = observation.and_then(|observation| observation.cursor.as_ref()) {
        rows += transaction.execute(
            "INSERT INTO history_source_cursors(
               source_file_id, cursor_value, revision_id, updated_at
             ) VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(source_file_id) DO UPDATE SET
               cursor_value=excluded.cursor_value,
               revision_id=excluded.revision_id,
               updated_at=excluded.updated_at",
            params![source_file_id, cursor, revision_id, now],
        )?;
    }
    Ok(rows)
}

fn publish_replay_progress(
    history: &History,
    staging_revision_id: i64,
    source_file_id: Option<i64>,
    replay_revision_id: i64,
    prepared: &PreparedEvent,
) -> Result<(), HistoryError> {
    let observation = prepared.source_observation.clone();
    history.submit(move |connection| {
        let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
        let session_id: i64 = transaction
            .query_row(
                "SELECT e.session_id
                   FROM history_event_revisions r
                   JOIN history_events e ON e.event_id=r.event_id
                  WHERE r.revision_id=?1 AND r.visibility='committed'",
                params![replay_revision_id],
                |row| row.get(0),
            )
            .optional()?
            .ok_or(HistoryError::NotFound)?;
        claim_staging_revision(&transaction, staging_revision_id)?;
        publish_observation(
            &transaction,
            session_id,
            source_file_id,
            replay_revision_id,
            observation.as_ref(),
            &now_timestamp(),
        )?;
        transaction.commit()?;
        Ok(())
    })
}

fn ensure_revision_in_active_index(
    history: &History,
    revision_id: i64,
) -> Result<(), HistoryError> {
    loop {
        let done = history.submit(move |connection| {
            let Some((generation, _)) = active_generation(connection)? else {
                return Err(HistoryError::Rebuilding);
            };
            let mut statement = connection.prepare(
                "SELECT c.chunk_id, c.uncompressed_length, c.sha256, c.compressed_bytes
                   FROM history_search_chunks c
                  WHERE c.revision_id=?1
                    AND NOT EXISTS (
                      SELECT 1 FROM history_fts_membership m
                       WHERE m.generation_id=?2 AND m.chunk_id=c.chunk_id
                    )
                  ORDER BY c.chunk_id LIMIT ?3",
            )?;
            let compressed = statement
                .query_map(
                    params![revision_id, generation, SEARCH_STAGE_BATCH as i64],
                    |row| {
                        Ok((
                            row.get::<_, i64>(0)?,
                            row.get::<_, i64>(1)?,
                            row.get::<_, String>(2)?,
                            row.get::<_, Vec<u8>>(3)?,
                        ))
                    },
                )?
                .collect::<rusqlite::Result<Vec<_>>>()?;
            drop(statement);
            if compressed.is_empty() {
                return Ok(true);
            }
            let mut decoded = Vec::with_capacity(compressed.len());
            for (chunk_id, length, sha256, bytes) in compressed {
                let expected = usize::try_from(length)
                    .map_err(|_| internal("negative or oversized search chunk length"))?;
                let plaintext = zstd::bulk::decompress(&bytes, expected)
                    .map_err(|error| internal(format!("decompressing search chunk: {error}")))?;
                if plaintext.len() != expected || hex_digest(Sha256::digest(&plaintext)) != sha256 {
                    return Err(internal("search chunk integrity mismatch during indexing"));
                }
                let text = String::from_utf8(plaintext).map_err(|error| {
                    internal(format!("stored search chunk is not UTF-8: {error}"))
                })?;
                decoded.push((chunk_id, text));
            }
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
            require_staging_revision(&transaction, revision_id)?;
            let still_active =
                active_generation(&transaction)?.is_some_and(|(current, _)| current == generation);
            if !still_active {
                transaction.rollback()?;
                return Ok(false);
            }
            transaction.execute(
                "INSERT OR IGNORE INTO history_search_fences(revision_id) VALUES (?1)",
                params![revision_id],
            )?;
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
            transaction.execute(
                "UPDATE history_index_generations
                    SET indexed_count=(SELECT count(*) FROM history_fts_membership
                                        WHERE generation_id=?1)
                  WHERE generation_id=?1",
                params![generation],
            )?;
            transaction.commit()?;
            Ok(false)
        })?;
        if done {
            return Ok(());
        }
    }
}

enum Finalization {
    Committed {
        revision_id: i64,
        revision: u32,
        rows_touched: usize,
    },
    Replayed {
        revision_id: i64,
        revision: u32,
    },
}

#[allow(clippy::too_many_arguments)]
fn finalize_revision(
    history: &History,
    revision_id: i64,
    source_file_id: Option<i64>,
    prepared: PreparedEvent,
    event_key: String,
    fingerprint: String,
    raw_sha256: String,
    raw_length: u64,
    searchable: bool,
) -> Result<Finalization, HistoryError> {
    history.submit(move |connection| {
        let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
        let (generation, state) =
            active_generation(&transaction)?.ok_or(HistoryError::Rebuilding)?;
        if state != "ready" {
            return Err(HistoryError::Rebuilding);
        }
        let missing: i64 = transaction.query_row(
            "SELECT count(*) FROM history_search_chunks c
              WHERE c.revision_id=?1 AND NOT EXISTS (
                SELECT 1 FROM history_fts_membership m
                 WHERE m.generation_id=?2 AND m.chunk_id=c.chunk_id
              )",
            params![revision_id, generation],
            |row| row.get(0),
        )?;
        if missing != 0 {
            return Err(HistoryError::Rebuilding);
        }
        let host_id: String = transaction.query_row(
            "SELECT value FROM history_meta WHERE key='host_id'",
            [],
            |row| row.get(0),
        )?;
        let now = now_timestamp();
        let repository = prepared
            .repository_path
            .as_ref()
            .map(|path| path.to_string_lossy().into_owned());

        let mut rows_touched = transaction.execute(
            "INSERT INTO history_sessions(
               host_id, source_family, native_session_id, observed_cwd,
               repository_path, started_at, ended_at, created_at, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8)
             ON CONFLICT(host_id, source_family, native_session_id) DO UPDATE SET
               observed_cwd=COALESCE(excluded.observed_cwd, history_sessions.observed_cwd),
               repository_path=COALESCE(excluded.repository_path, history_sessions.repository_path),
               started_at=CASE
                 WHEN history_sessions.started_at IS NULL THEN excluded.started_at
                 WHEN excluded.started_at IS NULL THEN history_sessions.started_at
                 ELSE min(history_sessions.started_at, excluded.started_at)
               END,
               ended_at=CASE
                 WHEN history_sessions.ended_at IS NULL THEN excluded.ended_at
                 WHEN excluded.ended_at IS NULL THEN history_sessions.ended_at
                 ELSE max(history_sessions.ended_at, excluded.ended_at)
               END,
               updated_at=excluded.updated_at",
            params![
                host_id,
                prepared.source_family.as_str(),
                prepared.native_session_id,
                prepared.observed_cwd,
                repository,
                prepared.session_started_at,
                prepared.session_ended_at,
                now,
            ],
        )?;
        let session_id: i64 = transaction.query_row(
            "SELECT session_id FROM history_sessions
              WHERE host_id=?1 AND source_family=?2 AND native_session_id=?3",
            params![
                host_id,
                prepared.source_family.as_str(),
                prepared.native_session_id
            ],
            |row| row.get(0),
        )?;
        let stored_interval: (Option<String>, Option<String>) = transaction.query_row(
            "SELECT started_at, ended_at FROM history_sessions WHERE session_id=?1",
            params![session_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )?;
        if matches!(stored_interval, (Some(start), Some(end)) if start > end) {
            return Err(invalid("merged session start must not follow session end"));
        }
        rows_touched += transaction.execute(
            "INSERT INTO history_events(
               session_id, event_key, native_event_key, created_at, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?4)
             ON CONFLICT(session_id, event_key) DO UPDATE SET updated_at=excluded.updated_at",
            params![session_id, event_key, prepared.native_event_key, now],
        )?;
        let event_id: i64 = transaction.query_row(
            "SELECT event_id FROM history_events WHERE session_id=?1 AND event_key=?2",
            params![session_id, event_key],
            |row| row.get(0),
        )?;
        if let Some(existing) = transaction
            .query_row(
                "SELECT revision_id, revision_no FROM history_event_revisions
                  WHERE event_id=?1 AND fingerprint=?2 AND visibility='committed'",
                params![event_id, fingerprint],
                |row| Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?)),
            )
            .optional()?
        {
            claim_staging_revision(&transaction, revision_id)?;
            publish_observation(
                &transaction,
                session_id,
                source_file_id,
                existing.0,
                prepared.source_observation.as_ref(),
                &now,
            )?;
            transaction.commit()?;
            return Ok(Finalization::Replayed {
                revision_id: existing.0,
                revision: u32::try_from(existing.1)
                    .map_err(|_| internal("stored revision number exceeds u32"))?,
            });
        }
        let revision: i64 = transaction.query_row(
            "SELECT COALESCE(max(revision_no), 0) + 1
               FROM history_event_revisions
              WHERE event_id=?1 AND visibility='committed'",
            params![event_id],
            |row| row.get(0),
        )?;
        let published = transaction.execute(
            "UPDATE history_event_revisions
                SET event_id=?1, revision_no=?2, fingerprint=?3,
                    raw_sha256=?4, raw_length=?5, visibility='committed',
                    committed_at=?6
              WHERE revision_id=?7 AND visibility='staging'",
            params![
                event_id,
                revision,
                fingerprint,
                raw_sha256,
                checked_i64(raw_length, "event raw length")?,
                now,
                revision_id,
            ],
        )?;
        if published != 1 {
            return Err(internal(
                "staging revision lost publication ownership before commit",
            ));
        }
        rows_touched += published;
        rows_touched += transaction.execute(
            "UPDATE history_events SET current_revision_id=?1, updated_at=?2
              WHERE event_id=?3",
            params![revision_id, now, event_id],
        )?;
        rows_touched += publish_observation(
            &transaction,
            session_id,
            source_file_id,
            revision_id,
            prepared.source_observation.as_ref(),
            &now,
        )?;
        if searchable {
            rows_touched += transaction.execute(
                "DELETE FROM history_search_fences WHERE revision_id=?1",
                params![revision_id],
            )?;
            rows_touched += transaction.execute(
                "UPDATE history_meta
                    SET value=CAST(CAST(value AS INTEGER) + 1 AS TEXT)
                  WHERE key='corpus_epoch'",
                [],
            )?;
        }
        if rows_touched > FINAL_PUBLICATION_MAX_ROWS {
            return Err(internal(format!(
                "final publication exceeded its row bound: {rows_touched} > {FINAL_PUBLICATION_MAX_ROWS}"
            )));
        }
        transaction.commit()?;
        Ok(Finalization::Committed {
            revision_id,
            revision: u32::try_from(revision)
                .map_err(|_| internal("revision number exceeds u32"))?,
            rows_touched,
        })
    })
}

fn claim_next_cleanup_revision(history: &History) -> Result<Option<i64>, HistoryError> {
    history.submit(|connection| {
        let transaction = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
        let already_claimed = transaction
            .query_row(
                "SELECT revision_id FROM history_event_revisions
                  WHERE visibility='cleaning' ORDER BY revision_id LIMIT 1",
                [],
                |row| row.get::<_, i64>(0),
            )
            .optional()?;
        let revision_id = if let Some(revision_id) = already_claimed {
            Some(revision_id)
        } else {
            let candidate = transaction
                .query_row(
                    "SELECT revision_id FROM history_event_revisions
                      WHERE visibility='staging' ORDER BY revision_id LIMIT 1",
                    [],
                    |row| row.get::<_, i64>(0),
                )
                .optional()?;
            if let Some(revision_id) = candidate {
                claim_staging_revision(&transaction, revision_id)?;
            }
            candidate
        };
        transaction.commit()?;
        Ok(revision_id)
    })
}

enum CleanupStep {
    Missing,
    Remaining,
    Removed,
}

fn cleanup_claimed_revision(history: &History, revision_id: i64) -> Result<bool, HistoryError> {
    loop {
        let step = history.submit(move |connection| {
            let transaction =
                connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let visibility = transaction
                .query_row(
                    "SELECT visibility FROM history_event_revisions WHERE revision_id=?1",
                    params![revision_id],
                    |row| row.get::<_, String>(0),
                )
                .optional()?;
            match visibility.as_deref() {
                None => return Ok(CleanupStep::Missing),
                Some("cleaning") => {}
                Some(_) => {
                    return Err(internal(
                        "cleanup no longer owns the staging revision visibility fence",
                    ))
                }
            }
            let chunk_ids = {
                let mut statement = transaction.prepare(
                    "SELECT chunk_id FROM history_search_chunks
                      WHERE revision_id=?1 ORDER BY chunk_id LIMIT ?2",
                )?;
                let rows = statement
                    .query_map(params![revision_id, CLEANUP_BATCH as i64], |row| row.get(0))?
                    .collect::<rusqlite::Result<Vec<i64>>>()?;
                rows
            };
            for chunk_id in &chunk_ids {
                transaction.execute(
                    "DELETE FROM history_search_fts WHERE rowid=?1",
                    params![chunk_id],
                )?;
                transaction.execute(
                    "DELETE FROM history_search_chunks WHERE chunk_id=?1",
                    params![chunk_id],
                )?;
            }
            let part_keys = {
                let mut statement = transaction.prepare(
                    "SELECT sequence FROM history_event_parts
                      WHERE revision_id=?1 ORDER BY sequence LIMIT ?2",
                )?;
                let rows = statement
                    .query_map(params![revision_id, CLEANUP_BATCH as i64], |row| row.get(0))?
                    .collect::<rusqlite::Result<Vec<i64>>>()?;
                rows
            };
            for sequence in &part_keys {
                transaction.execute(
                    "DELETE FROM history_event_parts WHERE revision_id=?1 AND sequence=?2",
                    params![revision_id, sequence],
                )?;
            }
            let usage_ids = {
                let mut statement = transaction.prepare(
                    "SELECT usage_id FROM history_usage_evidence
                      WHERE revision_id=?1 ORDER BY usage_id LIMIT ?2",
                )?;
                let rows = statement
                    .query_map(params![revision_id, CLEANUP_BATCH as i64], |row| row.get(0))?
                    .collect::<rusqlite::Result<Vec<i64>>>()?;
                rows
            };
            for usage_id in &usage_ids {
                transaction.execute(
                    "DELETE FROM history_usage_evidence WHERE usage_id=?1",
                    params![usage_id],
                )?;
            }
            let still_has_children: bool = transaction.query_row(
                "SELECT EXISTS(
                   SELECT 1 FROM history_search_chunks WHERE revision_id=?1
                   UNION ALL SELECT 1 FROM history_event_parts WHERE revision_id=?1
                   UNION ALL SELECT 1 FROM history_usage_evidence WHERE revision_id=?1
                 )",
                params![revision_id],
                |row| row.get(0),
            )?;
            if !still_has_children {
                let removed = transaction.execute(
                    "DELETE FROM history_event_revisions
                      WHERE revision_id=?1 AND visibility='cleaning'",
                    params![revision_id],
                )?;
                if removed != 1 {
                    return Err(internal("cleanup lost its revision visibility fence"));
                }
            }
            transaction.commit()?;
            Ok(if still_has_children {
                CleanupStep::Remaining
            } else {
                CleanupStep::Removed
            })
        })?;
        match step {
            CleanupStep::Missing => return Ok(false),
            CleanupStep::Remaining => {}
            CleanupStep::Removed => return Ok(true),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{EventRole, HistoryFilter, SearchQuery};
    use std::io::Cursor;

    fn event(key: &str) -> PreparedEvent {
        let mut event = PreparedEvent::new(
            crate::types::SourceFamily::Codex,
            "session-a",
            "parser/v1",
            "2026-08-25T00:00:00Z",
        );
        event.native_event_key = Some(key.to_owned());
        event.role = Some(EventRole::Assistant);
        event.repository_path = Some("/work/repo".into());
        event
    }

    #[test]
    fn segmented_exact_bytes_and_utf8_fragments_round_trip_and_replay() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut builder = history.begin_event(event("event-1")).unwrap();
        let left = vec![b'a'; ARCHIVE_BLOCK_TARGET_BYTES + 17];
        let right = b"tail".to_vec();
        builder.push_raw_part(Cursor::new(&left)).unwrap();
        builder.push_raw_part(Cursor::new(&right)).unwrap();
        builder.push_text_fragment("prefix nee").unwrap();
        builder.push_text_fragment("dle suffix 🦀").unwrap();
        let committed = builder.finish().unwrap();
        let mut output = Vec::new();
        history
            .write_revision_exact(committed.revision_id(), &mut output)
            .unwrap();
        assert_eq!(output, [left, right].concat());

        let mut replay = history.begin_event(event("event-1")).unwrap();
        replay.push_raw_part(Cursor::new(&output)).unwrap();
        replay
            .push_text_fragment("prefix needle suffix 🦀")
            .unwrap();
        assert!(matches!(
            replay.finish().unwrap(),
            IngestOutcome::Replayed { .. }
        ));
        let counts = history.status().unwrap();
        assert_eq!(counts.sessions, 1);
        assert_eq!(counts.events, 1);
        assert_eq!(counts.revisions, 1);
        let found = history
            .search(SearchQuery {
                expression: "needle".to_owned(),
                filter: HistoryFilter::default(),
                after: None,
                limit: 10,
            })
            .unwrap();
        assert_eq!(found.matches.len(), 1);
    }

    #[test]
    fn lexical_terms_crossing_the_target_boundary_remain_searchable() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut builder = history.begin_event(event("boundary")).unwrap();
        builder.push_raw_part(Cursor::new(b"raw")).unwrap();
        let text = format!(
            "{} boundaryterm tail",
            "x".repeat(SEARCH_CHUNK_TARGET_BYTES - 4)
        );
        builder.push_text_fragment(&text).unwrap();
        builder.finish().unwrap();

        let found = history
            .search(SearchQuery {
                expression: "boundaryterm".to_owned(),
                filter: HistoryFilter::default(),
                after: None,
                limit: 10,
            })
            .unwrap();
        assert_eq!(found.matches.len(), 1);
    }

    #[test]
    fn keyless_events_use_source_coordinates_and_replay_publishes_cursor_progress() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let observation = |cursor: &str| SourceObservation {
            root_path: "/synthetic/codex".into(),
            file_path: "/synthetic/codex/session.jsonl".into(),
            cursor: Some(cursor.to_owned()),
        };

        for cursor in ["coordinate-1", "coordinate-2"] {
            let mut prepared = event("unused");
            prepared.native_event_key = None;
            prepared.source_observation = Some(observation(cursor));
            let mut builder = history.begin_event(prepared).unwrap();
            builder.push_raw_part(Cursor::new(b"repeated raw")).unwrap();
            builder.finish().unwrap();
        }
        assert_eq!(
            history
                .events(crate::types::MetadataQuery::default())
                .unwrap()
                .len(),
            2
        );

        let mut first = event("native-replay");
        first.source_observation = Some(observation("cursor-1"));
        let mut builder = history.begin_event(first).unwrap();
        builder.push_raw_part(Cursor::new(b"native raw")).unwrap();
        let committed = builder.finish().unwrap();

        let mut replay = event("native-replay");
        replay.source_observation = Some(observation("cursor-2"));
        let mut builder = history.begin_event(replay).unwrap();
        builder.push_raw_part(Cursor::new(b"native raw")).unwrap();
        assert!(matches!(
            builder.finish().unwrap(),
            IngestOutcome::Replayed { .. }
        ));
        let status = history
            .source_status(
                crate::types::SourceFamily::Codex,
                std::path::Path::new("/synthetic/codex"),
                std::path::Path::new("/synthetic/codex/session.jsonl"),
            )
            .unwrap()
            .unwrap();
        assert_eq!(status.cursor.as_deref(), Some("cursor-2"));
        assert_eq!(status.cursor_revision_id, Some(committed.revision_id()));
    }

    #[test]
    fn session_bounds_merge_earliest_start_and_latest_end() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut later = event("later");
        later.session_started_at = Some("2026-08-25T02:00:00Z".to_owned());
        later.session_ended_at = Some("2026-08-25T03:00:00Z".to_owned());
        let mut builder = history.begin_event(later).unwrap();
        builder.push_raw_part(Cursor::new(b"later")).unwrap();
        builder.finish().unwrap();

        let mut wider = event("wider");
        wider.session_started_at = Some("2026-08-25T01:00:00Z".to_owned());
        wider.session_ended_at = Some("2026-08-25T04:00:00Z".to_owned());
        let mut builder = history.begin_event(wider).unwrap();
        builder.push_raw_part(Cursor::new(b"wider")).unwrap();
        builder.finish().unwrap();

        let session = history
            .sessions(crate::types::MetadataQuery::default())
            .unwrap()
            .remove(0);
        assert_eq!(
            session.started_at.as_deref(),
            Some("2026-08-25T01:00:00.000000000Z")
        );
        assert_eq!(
            session.ended_at.as_deref(),
            Some("2026-08-25T04:00:00.000000000Z")
        );
    }

    #[test]
    fn retained_revisions_are_paged_and_discoverable_after_reopen() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let history = History::open(&path).unwrap();
        let mut first = history.begin_event(event("revisions")).unwrap();
        first.push_raw_part(Cursor::new(b"raw")).unwrap();
        let first_id = first.finish().unwrap().revision_id();
        let mut changed = event("revisions");
        changed.parser_version = "parser/v2".to_owned();
        let mut second = history.begin_event(changed).unwrap();
        second.push_raw_part(Cursor::new(b"raw")).unwrap();
        let second_id = second.finish().unwrap().revision_id();
        history.close().unwrap();

        let history = History::open_existing(&path).unwrap().unwrap();
        let first_page = history
            .revisions(crate::types::MetadataQuery {
                filter: HistoryFilter::default(),
                after_id: None,
                limit: 1,
            })
            .unwrap();
        assert_eq!(first_page[0].revision_id, first_id);
        let second_page = history
            .revisions(crate::types::MetadataQuery {
                filter: HistoryFilter::default(),
                after_id: Some(first_id),
                limit: 1,
            })
            .unwrap();
        assert_eq!(second_page[0].revision_id, second_id);
        assert_eq!(
            history
                .events(crate::types::MetadataQuery::default())
                .unwrap()[0]
                .revision_id,
            second_id
        );
    }

    #[test]
    fn attempt_links_validate_inputs_and_classify_noop_inserts() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut builder = history.begin_event(event("attempt")).unwrap();
        builder.push_raw_part(Cursor::new(b"raw")).unwrap();
        let revision_id = builder.finish().unwrap().revision_id();

        assert!(matches!(
            history.link_attempt(revision_id, "run", None),
            Err(HistoryError::Invalid { .. })
        ));
        assert_eq!(
            history.link_attempt(revision_id + 999, "run", Some(1)),
            Err(HistoryError::NotFound)
        );
        history.link_attempt(revision_id, "run", Some(1)).unwrap();
        history.link_attempt(revision_id, "run", Some(1)).unwrap();
        let count: i64 = history
            .submit(move |connection| {
                connection
                    .query_row(
                        "SELECT count(*) FROM history_attempt_links WHERE revision_id=?1",
                        params![revision_id],
                        |row| row.get(0),
                    )
                    .map_err(Into::into)
            })
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn cleanup_and_publication_have_one_atomic_winner() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let publisher = History::open(&path).unwrap();
        let cleaner = History::open_existing(&path).unwrap().unwrap();
        let mut builder = publisher.begin_event(event("race")).unwrap();
        builder.push_raw_part(Cursor::new(b"race bytes")).unwrap();
        builder.push_text_fragment("race token").unwrap();
        let barrier = std::sync::Arc::new(std::sync::Barrier::new(2));
        let publish_barrier = barrier.clone();
        let publish = std::thread::spawn(move || {
            publish_barrier.wait();
            builder.finish()
        });
        let cleanup = std::thread::spawn(move || {
            barrier.wait();
            cleaner.cleanup_staging()
        });
        let publish = publish.join().unwrap();
        let removed = cleanup.join().unwrap().unwrap();
        match publish {
            Ok(outcome) => {
                assert_eq!(removed, 0);
                let mut bytes = Vec::new();
                publisher
                    .write_revision_exact(outcome.revision_id(), &mut bytes)
                    .unwrap();
                assert_eq!(bytes, b"race bytes");
            }
            Err(_) => {
                assert_eq!(removed, 1);
                assert!(publisher
                    .events(crate::types::MetadataQuery::default())
                    .unwrap()
                    .is_empty());
            }
        }
        assert_eq!(publisher.status().unwrap().staging_revisions, 0);
    }

    #[test]
    fn changed_meaning_appends_a_revision_and_final_work_is_bounded() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut first = history.begin_event(event("event-1")).unwrap();
        first.push_raw_part(Cursor::new(b"same bytes")).unwrap();
        first.push_text_fragment("first").unwrap();
        let first = first.finish().unwrap();

        let mut changed = event("event-1");
        changed.parser_version = "parser/v2".to_owned();
        let mut second = history.begin_event(changed).unwrap();
        for _ in 0..(SEARCH_STAGE_BATCH * 3) {
            second
                .push_text_fragment(&"x".repeat(SEARCH_CHUNK_TARGET_BYTES))
                .unwrap();
        }
        second.push_raw_part(Cursor::new(b"same bytes")).unwrap();
        let second = second.finish().unwrap();
        assert_ne!(first.revision_id(), second.revision_id());
        match second {
            IngestOutcome::Committed {
                revision,
                final_rows_touched,
                ..
            } => {
                assert_eq!(revision, 2);
                assert!(
                    final_rows_touched <= FINAL_PUBLICATION_MAX_ROWS,
                    "{final_rows_touched}"
                );
            }
            IngestOutcome::Replayed { .. } => panic!("changed parser must append"),
        }
    }

    #[test]
    fn dropped_staging_is_invisible_and_cleanup_reclaims_only_it() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut prepared = event("crash");
        prepared.source_observation = Some(SourceObservation {
            root_path: "/synthetic/crash".into(),
            file_path: "/synthetic/crash/session.jsonl".into(),
            cursor: Some("must-not-advance".to_owned()),
        });
        let mut builder = history.begin_event(prepared).unwrap();
        builder
            .push_raw_part(Cursor::new(vec![7; ARCHIVE_BLOCK_TARGET_BYTES * 9]))
            .unwrap();
        builder.push_text_fragment("never visible").unwrap();
        drop(builder);
        let status = history.status().unwrap();
        assert_eq!(status.revisions, 0);
        assert_eq!(status.staging_revisions, 1);
        assert_eq!(
            history
                .source_status(
                    crate::types::SourceFamily::Codex,
                    std::path::Path::new("/synthetic/crash"),
                    std::path::Path::new("/synthetic/crash/session.jsonl"),
                )
                .unwrap()
                .unwrap()
                .cursor,
            None
        );
        assert_eq!(history.cleanup_staging().unwrap(), 1);
        assert_eq!(history.status().unwrap().staging_revisions, 0);
    }

    #[test]
    fn a_failed_staging_flush_poison_fences_publication() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        history
            .submit(|connection| {
                connection.execute_batch(
                    "CREATE TRIGGER history_test_fail_parts
                     BEFORE INSERT ON history_event_parts BEGIN
                       SELECT RAISE(ABORT, 'forced staging failure');
                     END;",
                )?;
                Ok(())
            })
            .unwrap();
        let mut builder = history.begin_event(event("poison")).unwrap();
        let error = builder
            .push_raw_part(Cursor::new(vec![
                3_u8;
                ARCHIVE_BLOCK_TARGET_BYTES
                    * ARCHIVE_STAGE_BATCH
            ]))
            .unwrap_err();
        assert!(matches!(error, HistoryError::Internal { .. }));
        assert_eq!(builder.finish().unwrap_err(), HistoryError::Poisoned);
        assert_eq!(history.status().unwrap().revisions, 0);
        history
            .submit(|connection| {
                connection.execute_batch("DROP TRIGGER history_test_fail_parts;")?;
                Ok(())
            })
            .unwrap();
        assert_eq!(history.cleanup_staging().unwrap(), 1);
    }

    #[test]
    fn many_logical_parts_stream_without_a_part_count_cap() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut builder = history.begin_event(event("many-parts")).unwrap();
        for byte in 0_u8..=255 {
            for _ in 0..8 {
                builder.push_raw_part(Cursor::new([byte])).unwrap();
            }
        }
        let outcome = builder.finish().unwrap();
        let mut writer = CountingWriter::default();
        let length = history
            .write_revision_exact(outcome.revision_id(), &mut writer)
            .unwrap();
        assert_eq!(length, 2_048);
        assert_eq!(writer.bytes, 2_048);
        assert_eq!(writer.largest_write, 1);
    }

    #[derive(Default)]
    struct CountingWriter {
        bytes: u64,
        largest_write: usize,
    }

    impl std::io::Write for CountingWriter {
        fn write(&mut self, buffer: &[u8]) -> std::io::Result<usize> {
            self.bytes += buffer.len() as u64;
            self.largest_write = self.largest_write.max(buffer.len());
            Ok(buffer.len())
        }

        fn flush(&mut self) -> std::io::Result<()> {
            Ok(())
        }
    }

    #[test]
    fn marking_a_source_missing_preserves_every_committed_projection() {
        let scratch = crate::test_scratch();
        let history = History::open(&scratch.path().join("history/history.db")).unwrap();
        let mut prepared = event("observed");
        prepared.source_observation = Some(SourceObservation {
            root_path: "/synthetic/codex".into(),
            file_path: "/synthetic/codex/session.jsonl".into(),
            cursor: Some("cursor-1".to_owned()),
        });
        let mut builder = history.begin_event(prepared).unwrap();
        builder
            .push_raw_part(Cursor::new(b"retained bytes"))
            .unwrap();
        builder.push_text_fragment("retainedword").unwrap();
        builder
            .push_usage(UsageFact {
                provider: "openai".to_owned(),
                model: "gpt".to_owned(),
                input_tokens: 1,
                output_tokens: 2,
                cache_read_tokens: None,
                cache_write_tokens: None,
                cost_usd: None,
                observed_at: "2026-08-25T00:00:00Z".to_owned(),
            })
            .unwrap();
        let outcome = builder.finish().unwrap();
        assert!(history
            .mark_source_missing(
                crate::types::SourceFamily::Codex,
                std::path::Path::new("/synthetic/codex"),
                std::path::Path::new("/synthetic/codex/session.jsonl"),
            )
            .unwrap());
        let source_status = history
            .source_status(
                crate::types::SourceFamily::Codex,
                std::path::Path::new("/synthetic/codex"),
                std::path::Path::new("/synthetic/codex/session.jsonl"),
            )
            .unwrap()
            .unwrap();
        assert_eq!(source_status.state, crate::types::SourceFileState::Missing);
        assert_eq!(source_status.cursor.as_deref(), Some("cursor-1"));
        assert_eq!(history.status().unwrap().sessions, 1);
        assert_eq!(
            history
                .events(crate::types::MetadataQuery::default())
                .unwrap()
                .len(),
            1
        );
        assert_eq!(
            history
                .usage(crate::types::MetadataQuery::default())
                .unwrap()
                .len(),
            1
        );
        assert_eq!(
            history
                .search(SearchQuery {
                    expression: "retainedword".to_owned(),
                    filter: HistoryFilter::default(),
                    after: None,
                    limit: 10,
                })
                .unwrap()
                .matches
                .len(),
            1
        );
        let mut bytes = Vec::new();
        history
            .write_revision_exact(outcome.revision_id(), &mut bytes)
            .unwrap();
        assert_eq!(bytes, b"retained bytes");
    }
}
