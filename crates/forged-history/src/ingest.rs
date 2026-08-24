//! Staged, crash-safe ingestion of prepared native events.
//!
//! # The publication contract
//!
//! An event of any size is written through BOUNDED staging transactions and
//! then made visible by ONE final publication transaction. Between the two,
//! nothing about the event is observable: every committed read, FTS match,
//! usage aggregation, and cursor join filters on `visibility = 'committed'`,
//! and the source cursor advances only inside the publication transaction.
//!
//! Compression, hashing, and UTF-8 segmentation all happen on the CALLING
//! thread, outside every transaction. The writer thread only ever sees
//! already-prepared bytes, so no ingest holds a write lock while it works.
//!
//! # What a crash leaves behind
//!
//! Dropping an [`EventIngest`] without calling [`EventIngest::publish`] is
//! exactly what a process death mid-ingest leaves: durable staging rows that
//! no reader can see. [`History::cleanup_staging`] reclaims them, and only
//! them — a committed row is never reachable from that path. Re-ingesting
//! the same event discards its own stale staging first, so replay after a
//! crash converges rather than accumulating.
//!
//! # Identity
//!
//! When the source supplies a native event id, that id IS the event's
//! identity and differing content under it appends a new revision. When it
//! does not, identity falls back to a deterministic source-specific basis
//! PLUS the content digest — so differing content is a different event by
//! construction, and no revision can exist for something whose identity is
//! its content.

use std::io::Read;

use rusqlite::{params, Connection, Transaction, TransactionBehavior};
use sha2::{Digest, Sha256};

use crate::archive::{compress_block, read_block, PreparedBlock, ARCHIVE_BLOCK_TARGET_BYTES};
use crate::error::{internal, invalid, HistoryError};
use crate::history::{current_host_id, History};
use crate::migrations::CODEC_SCHEMA;
use crate::open::lexically_normalize_absolute;
use crate::text::{Utf8Chunker, SEARCH_CHUNK_TARGET_BYTES};
use crate::time::now_iso;
use crate::types::{
    EventKeyKind, IngestOutcome, PreparedEventHeader, StagingCleanup, UsageFact, Visibility,
};

/// How many archive parts one staging transaction may carry.
///
/// The bound is on TRANSACTION size, not on event size: a larger event means
/// more transactions, never a larger one and never a refusal.
pub const STAGING_BATCH_PARTS: usize = 8;

/// How many search chunks one staging transaction may carry.
pub const STAGING_BATCH_CHUNKS: usize = 32;

/// How many rows one bounded cleanup transaction may reclaim.
pub const CLEANUP_BATCH_ROWS: i64 = 128;

/// One archive part, compressed and hashed and waiting for a staging write.
struct StagedPart {
    seq: i64,
    byte_offset: i64,
    block: PreparedBlock,
}

/// One search chunk: its transient plaintext for FTS, and the compressed
/// block that retains it.
struct StagedChunk {
    seq: i64,
    text: String,
    block: PreparedBlock,
}

/// An event being written. Bytes, text, and usage stream in; nothing is
/// visible until [`EventIngest::publish`].
///
/// Dropping this without publishing is a deliberate, supported outcome: it
/// leaves durable-but-invisible staging exactly as a crash would.
pub struct EventIngest<'h> {
    history: &'h History,
    header: PreparedEventHeader,
    session_id: i64,
    source_file_id: i64,
    revision_id: i64,
    hasher: Sha256,
    byte_length: i64,
    next_part_seq: i64,
    next_chunk_seq: i64,
    next_usage_seq: i64,
    pending_parts: Vec<StagedPart>,
    pending_chunks: Vec<StagedChunk>,
    pending_usage: Vec<UsageFact>,
}

impl std::fmt::Debug for EventIngest<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EventIngest")
            .field("revision_id", &self.revision_id)
            .field("session_id", &self.session_id)
            .field("staged_bytes", &self.byte_length)
            .finish_non_exhaustive()
    }
}

impl History {
    /// Begin staging one prepared event.
    ///
    /// Establishes the session and source observation rows, discards any
    /// never-committed staging left by a previous attempt at the SAME
    /// logical event, and opens a fresh staging revision.
    ///
    /// The discard is what makes retry-after-crash converge instead of
    /// accumulating. It is scoped to this event's own staging token, so a
    /// concurrent ingest of a DIFFERENT event is never disturbed; a
    /// concurrent ingest of the same one loses its staging and refuses at
    /// publication, which is the correct answer to two writers claiming one
    /// identity.
    pub fn begin_event(
        &self,
        header: PreparedEventHeader,
    ) -> Result<EventIngest<'_>, HistoryError> {
        validate_header(&header)?;
        let token = staging_token(&header);

        // Reclaim this event's own stale staging first, in bounded batches,
        // so a crashed attempt cannot accumulate across retries.
        let stale = {
            let token = token.clone();
            self.submit(move |conn| {
                let mut stmt = conn.prepare(
                    "SELECT revision_id FROM event_revisions
                      WHERE visibility = 'staging' AND staging_token = ?1",
                )?;
                let ids = stmt
                    .query_map([token], |row| row.get::<_, i64>(0))?
                    .collect::<Result<Vec<i64>, _>>()?;
                Ok(ids)
            })?
        };
        for revision_id in stale {
            self.discard_staged_revision(revision_id)?;
        }

        let prepared = header.clone();
        let token_for_insert = token.clone();
        let (session_id, source_file_id, revision_id) = self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let host_id = current_host_id(&tx)?;
            let source_file_id = upsert_source_file_tx(&tx, &host_id, &prepared)?;
            let session_id = upsert_session_tx(&tx, &host_id, &prepared)?;
            let now = now_iso();
            tx.execute(
                "INSERT INTO event_revisions
                   (event_id, session_id, staging_token, revision, visibility,
                    content_sha256, byte_length, parser_version, lineage_kind,
                    parent_event_key, role, model, event_kind, occurred_at,
                    source_file_id, source_byte_offset, source_record_index,
                    created_at, ingested_at)
                 VALUES (NULL, ?1, ?2, NULL, 'staging', NULL, 0, ?3, ?4, ?5, ?6,
                         ?7, ?8, ?9, ?10, ?11, ?12, ?13, NULL)",
                params![
                    session_id,
                    token_for_insert,
                    prepared.parser_version,
                    prepared.lineage.kind,
                    prepared.lineage.parent_event_key,
                    prepared.metadata.role,
                    prepared.metadata.model,
                    prepared.metadata.event_kind,
                    prepared.metadata.occurred_at,
                    source_file_id,
                    prepared.source.byte_offset as i64,
                    prepared.source.record_index as i64,
                    now,
                ],
            )?;
            let revision_id = tx.last_insert_rowid();
            tx.commit()?;
            Ok((session_id, source_file_id, revision_id))
        })?;

        Ok(EventIngest {
            history: self,
            header,
            session_id,
            source_file_id,
            revision_id,
            hasher: Sha256::new(),
            byte_length: 0,
            next_part_seq: 0,
            next_chunk_seq: 0,
            next_usage_seq: 0,
            pending_parts: Vec::new(),
            pending_chunks: Vec::new(),
            pending_usage: Vec::new(),
        })
    }

    /// Stage and publish one prepared event in a single call.
    ///
    /// `record_bytes` is the EXACT valid-record byte stream and `text` the
    /// extracted plaintext; both are readers, so neither the source file nor
    /// the event ever needs to exist as one `String`, `Vec<u8>`, or parsed
    /// JSON value in memory. Pass [`std::io::empty`] for an event with no
    /// searchable text.
    pub fn ingest_event<B, T>(
        &self,
        header: PreparedEventHeader,
        record_bytes: B,
        text: T,
        usage: impl IntoIterator<Item = UsageFact>,
    ) -> Result<IngestOutcome, HistoryError>
    where
        B: Read,
        T: Read,
    {
        let mut ingest = self.begin_event(header)?;
        ingest.stage_record_part(record_bytes)?;
        ingest.stage_text(text)?;
        for fact in usage {
            ingest.stage_usage(fact)?;
        }
        ingest.publish()
    }

    /// Reclaim never-committed staging across the whole archive, in bounded
    /// transactions.
    ///
    /// Only rows that no publication ever made visible are reachable here.
    /// A committed revision, its parts, its chunks, its usage, and every
    /// block they reference are unreachable from this path by construction —
    /// cleanup is not a retention policy and cannot become one.
    ///
    /// This is a RECOVERY pass, meant for startup or between ingestion runs.
    /// It reclaims every staging row in the archive, including one an
    /// [`EventIngest`] still holds open: that ingest then refuses at
    /// publication rather than publishing content it can no longer see.
    pub fn cleanup_staging(&self) -> Result<StagingCleanup, HistoryError> {
        let mut total = StagingCleanup::default();
        loop {
            let stale = self.submit(|conn| {
                let mut stmt = conn.prepare(
                    "SELECT revision_id FROM event_revisions
                      WHERE visibility = 'staging' LIMIT ?1",
                )?;
                let ids = stmt
                    .query_map([CLEANUP_BATCH_ROWS], |row| row.get::<_, i64>(0))?
                    .collect::<Result<Vec<i64>, _>>()?;
                Ok(ids)
            })?;
            if stale.is_empty() {
                break;
            }
            for revision_id in stale {
                total.merge(self.discard_staged_revision(revision_id)?);
            }
        }
        loop {
            let batch = self.submit(|conn| {
                let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
                let reclaimed = reclaim_orphan_staging_tx(&tx)?;
                tx.commit()?;
                Ok(reclaimed)
            })?;
            if batch.total() == 0 {
                break;
            }
            total.merge(batch);
        }
        Ok(total)
    }

    /// Discard one never-committed staging revision, in bounded batches.
    pub(crate) fn discard_staged_revision(
        &self,
        revision_id: i64,
    ) -> Result<StagingCleanup, HistoryError> {
        let mut total = StagingCleanup::default();
        loop {
            let (more, batch) = self.submit(move |conn| {
                let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
                let outcome = discard_staged_revision_tx(&tx, revision_id)?;
                tx.commit()?;
                Ok(outcome)
            })?;
            total.merge(batch);
            if !more {
                break;
            }
        }
        Ok(total)
    }
}

impl EventIngest<'_> {
    /// The staging revision row this ingest is writing into.
    pub fn revision_id(&self) -> i64 {
        self.revision_id
    }

    /// Append one segment of the exact valid-record byte stream.
    ///
    /// Callable repeatedly: an event whose bytes arrive as several segments
    /// is appended in order, and the digest spans the concatenation. Bytes
    /// are compressed and hashed here, on the caller's thread, before any
    /// transaction opens.
    pub fn stage_record_part(&mut self, mut reader: impl Read) -> Result<(), HistoryError> {
        loop {
            let bytes = read_block(&mut reader, ARCHIVE_BLOCK_TARGET_BYTES)?;
            if bytes.is_empty() {
                break;
            }
            self.hasher.update(&bytes);
            let block = compress_block(&bytes)?;
            self.pending_parts.push(StagedPart {
                seq: self.next_part_seq,
                byte_offset: self.byte_length,
                block,
            });
            self.next_part_seq += 1;
            self.byte_length += bytes.len() as i64;
            if self.pending_parts.len() >= STAGING_BATCH_PARTS {
                self.flush_parts()?;
            }
        }
        self.flush_parts()
    }

    /// Append extracted plaintext, segmented into UTF-8-safe search chunks.
    ///
    /// Callable repeatedly and with any reader. The complete text is
    /// retained as compressed blocks; the FTS index receives only transient
    /// plaintext keyed by chunk row id.
    pub fn stage_text(&mut self, reader: impl Read) -> Result<(), HistoryError> {
        let mut chunker = Utf8Chunker::new(reader, SEARCH_CHUNK_TARGET_BYTES)?;
        while let Some(text) = chunker.next_chunk()? {
            let block = compress_block(text.as_bytes())?;
            self.pending_chunks.push(StagedChunk {
                seq: self.next_chunk_seq,
                text,
                block,
            });
            self.next_chunk_seq += 1;
            if self.pending_chunks.len() >= STAGING_BATCH_CHUNKS {
                self.flush_chunks()?;
            }
        }
        self.flush_chunks()
    }

    /// Append extracted plaintext supplied as an iterator of pieces.
    ///
    /// The pieces are concatenated logically and re-segmented on UTF-8
    /// boundaries, so a caller may emit whatever fragments its parser
    /// produces without matching the archive's chunk geometry.
    pub fn stage_text_parts<I, S>(&mut self, parts: I) -> Result<(), HistoryError>
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
        for part in parts {
            self.stage_text(part.as_ref().as_bytes())?;
        }
        Ok(())
    }

    /// Attach one usage observation to this event.
    pub fn stage_usage(&mut self, fact: UsageFact) -> Result<(), HistoryError> {
        if fact.provider.is_empty() || fact.model.is_empty() {
            return Err(invalid("usage facts carry a provider and a model"));
        }
        self.pending_usage.push(fact);
        if self.pending_usage.len() >= STAGING_BATCH_CHUNKS {
            self.flush_usage()?;
        }
        Ok(())
    }

    /// Publish the event and advance its source cursor, atomically.
    ///
    /// This is the ONLY transaction that makes anything visible, and the only
    /// one that moves a cursor. It is metadata-only: it compresses nothing,
    /// hashes nothing, and rewrites no blob, and it touches only this event's
    /// own index rows — so it never scans the archive and never repeats the
    /// work the staging transactions already did.
    ///
    /// Three outcomes, decided by what is already committed under this
    /// identity: a new event, an exact replay (every staged row is reclaimed
    /// and nothing changes), or a conflicting revision (APPENDED; the prior
    /// revision's archive bytes are left exactly where they are).
    pub fn publish(mut self) -> Result<IngestOutcome, HistoryError> {
        self.flush_parts()?;
        self.flush_chunks()?;
        self.flush_usage()?;

        let digest = sha256_hex_of(std::mem::take(&mut self.hasher));
        let (event_key, key_kind) = resolve_event_key(&self.header, &digest);
        let revision_id = self.revision_id;
        let session_id = self.session_id;
        let source_file_id = self.source_file_id;
        let byte_length = self.byte_length;
        let header = self.header.clone();
        let key_for_txn = event_key.clone();

        let decision = self.history.submit(move |conn| {
            publish_tx(
                conn,
                PublishRequest {
                    revision_id,
                    session_id,
                    source_file_id,
                    byte_length,
                    digest,
                    event_key: key_for_txn,
                    key_kind,
                    header,
                },
            )
        })?;

        if let Decision::Replay {
            event_id,
            revision_id: existing,
        } = decision
        {
            // Nothing this ingest staged may survive: an exact replay must
            // change no session, event, block, chunk, usage, or FTS count.
            self.history.discard_staged_revision(revision_id)?;
            return Ok(IngestOutcome::Replayed {
                event_id,
                revision_id: existing,
            });
        }
        match decision {
            Decision::Created { event_id } => Ok(IngestOutcome::Created {
                event_id,
                revision_id,
            }),
            Decision::Revised { event_id, revision } => Ok(IngestOutcome::Revised {
                event_id,
                revision_id,
                revision,
            }),
            Decision::Replay { .. } => unreachable!("handled above"),
        }
    }

    fn flush_parts(&mut self) -> Result<(), HistoryError> {
        if self.pending_parts.is_empty() {
            return Ok(());
        }
        let batch = std::mem::take(&mut self.pending_parts);
        let revision_id = self.revision_id;
        self.history.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            for part in &batch {
                let block_id = upsert_block_tx(&tx, &part.block)?;
                tx.execute(
                    "INSERT INTO event_parts
                       (revision_id, seq, block_id, byte_offset, byte_length, visibility)
                     VALUES (?1, ?2, ?3, ?4, ?5, 'staging')",
                    params![
                        revision_id,
                        part.seq,
                        block_id,
                        part.byte_offset,
                        part.block.uncompressed_len
                    ],
                )?;
            }
            tx.commit()?;
            Ok(())
        })
    }

    fn flush_chunks(&mut self) -> Result<(), HistoryError> {
        if self.pending_chunks.is_empty() {
            return Ok(());
        }
        let batch = std::mem::take(&mut self.pending_chunks);
        let revision_id = self.revision_id;
        let session_id = self.session_id;
        self.history.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            for chunk in &batch {
                let block_id = upsert_block_tx(&tx, &chunk.block)?;
                tx.execute(
                    "INSERT INTO search_chunks
                       (revision_id, session_id, seq, block_id, char_length,
                        byte_length, visibility)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'staging')",
                    params![
                        revision_id,
                        session_id,
                        chunk.seq,
                        block_id,
                        chunk.text.chars().count() as i64,
                        chunk.block.uncompressed_len,
                    ],
                )?;
                let chunk_id = tx.last_insert_rowid();
                // The plaintext lands in a CONTENTLESS index: FTS5 keeps
                // terms and this row id, never the text. Readers get text
                // back only by decompressing the retained block.
                tx.execute(
                    "INSERT INTO search_fts(rowid, text) VALUES (?1, ?2)",
                    params![chunk_id, chunk.text],
                )?;
            }
            tx.commit()?;
            Ok(())
        })
    }

    fn flush_usage(&mut self) -> Result<(), HistoryError> {
        if self.pending_usage.is_empty() {
            return Ok(());
        }
        let batch = std::mem::take(&mut self.pending_usage);
        let revision_id = self.revision_id;
        let session_id = self.session_id;
        let mut seq = self.next_usage_seq;
        self.next_usage_seq += batch.len() as i64;
        self.history.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            for fact in &batch {
                tx.execute(
                    "INSERT INTO usage_facts
                       (revision_id, session_id, seq, provider, model, input_tokens,
                        output_tokens, cache_read_tokens, cache_write_tokens,
                        reasoning_tokens, visibility)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'staging')",
                    params![
                        revision_id,
                        session_id,
                        seq,
                        fact.provider,
                        fact.model,
                        fact.input_tokens,
                        fact.output_tokens,
                        fact.cache_read_tokens,
                        fact.cache_write_tokens,
                        fact.reasoning_tokens,
                    ],
                )?;
                seq += 1;
            }
            tx.commit()?;
            Ok(())
        })
    }
}

/// What the publication transaction concluded.
#[derive(Debug, Clone, Copy)]
enum Decision {
    Created { event_id: i64 },
    Revised { event_id: i64, revision: i64 },
    Replay { event_id: i64, revision_id: i64 },
}

/// Everything the publication transaction needs, moved onto the writer thread.
struct PublishRequest {
    revision_id: i64,
    session_id: i64,
    source_file_id: i64,
    byte_length: i64,
    digest: String,
    event_key: String,
    key_kind: EventKeyKind,
    header: PreparedEventHeader,
}

fn publish_tx(conn: &mut Connection, req: PublishRequest) -> Result<Decision, HistoryError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let now = now_iso();

    let existing: Option<(i64, i64)> = tx
        .query_row(
            "SELECT event_id, head_revision FROM events
              WHERE session_id = ?1 AND event_key = ?2",
            params![req.session_id, req.event_key],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .ok();

    let (event_id, revision) = match existing {
        Some((event_id, head)) => {
            let identical: Option<i64> = tx
                .query_row(
                    "SELECT revision_id FROM event_revisions
                      WHERE event_id = ?1 AND content_sha256 = ?2
                        AND visibility = 'committed'",
                    params![event_id, req.digest],
                    |row| row.get(0),
                )
                .ok();
            if let Some(revision_id) = identical {
                tx.commit()?;
                return Ok(Decision::Replay {
                    event_id,
                    revision_id,
                });
            }
            (event_id, head + 1)
        }
        None => {
            tx.execute(
                "INSERT INTO events
                   (session_id, event_key, event_key_kind, head_revision,
                    created_at, updated_at)
                 VALUES (?1, ?2, ?3, 1, ?4, ?4)",
                params![req.session_id, req.event_key, req.key_kind, now],
            )?;
            (tx.last_insert_rowid(), 1)
        }
    };

    if revision > 1 {
        tx.execute(
            "UPDATE events SET head_revision = ?2, updated_at = ?3 WHERE event_id = ?1",
            params![event_id, revision, now],
        )?;
    }

    let published = tx.execute(
        "UPDATE event_revisions
            SET event_id = ?2, revision = ?3, visibility = 'committed',
                content_sha256 = ?4, byte_length = ?5, ingested_at = ?6,
                staging_token = NULL
          WHERE revision_id = ?1 AND visibility = 'staging'",
        params![
            req.revision_id,
            event_id,
            revision,
            req.digest,
            req.byte_length,
            now
        ],
    )?;
    if published != 1 {
        // The staging revision this publication was built for is gone or
        // already committed. Rolling back is the only safe answer: committing
        // would leave an event row pointing at content nobody staged.
        return Err(internal(format!(
            "revision {} was not in staging at publication",
            req.revision_id
        )));
    }
    tx.execute(
        "UPDATE event_parts SET visibility = 'committed' WHERE revision_id = ?1",
        [req.revision_id],
    )?;
    tx.execute(
        "UPDATE search_chunks SET visibility = 'committed' WHERE revision_id = ?1",
        [req.revision_id],
    )?;
    tx.execute(
        "UPDATE usage_facts SET visibility = 'committed' WHERE revision_id = ?1",
        [req.revision_id],
    )?;
    // Every block this revision references becomes committed and gains one
    // reference per referring row. A block already committed under another
    // event keeps its visibility and simply gains references.
    tx.execute(
        "UPDATE archive_blocks
            SET visibility = 'committed',
                refcount = refcount
                  + (SELECT COUNT(*) FROM event_parts p
                      WHERE p.block_id = archive_blocks.block_id
                        AND p.revision_id = ?1)
                  + (SELECT COUNT(*) FROM search_chunks c
                      WHERE c.block_id = archive_blocks.block_id
                        AND c.revision_id = ?1)
          WHERE block_id IN (
                SELECT block_id FROM event_parts WHERE revision_id = ?1
                UNION
                SELECT block_id FROM search_chunks WHERE revision_id = ?1)",
        [req.revision_id],
    )?;

    tx.execute(
        "UPDATE sessions
            SET visibility = 'committed',
                last_event_at = CASE
                  WHEN ?2 IS NULL THEN last_event_at
                  WHEN last_event_at IS NULL OR last_event_at < ?2 THEN ?2
                  ELSE last_event_at END,
                updated_at = ?3
          WHERE session_id = ?1",
        params![req.session_id, req.header.metadata.occurred_at, now],
    )?;
    tx.execute(
        "INSERT INTO session_observations
           (session_id, source_file_id, observed_path, presence,
            first_seen_at, last_seen_at)
         VALUES (?1, ?2, ?3, 'present', ?4, ?4)
         ON CONFLICT(session_id, source_file_id)
           DO UPDATE SET last_seen_at = ?4, presence = 'present', missing_at = NULL",
        params![
            req.session_id,
            req.source_file_id,
            req.header.source.relative_path,
            now
        ],
    )?;

    // The cursor advances HERE and nowhere else, and only forward: a
    // re-ingest of an older record must never rewind a reader's resume point.
    tx.execute(
        "INSERT INTO source_cursors
           (source_file_id, parser_version, byte_offset, record_index, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(source_file_id) DO UPDATE SET
           parser_version = ?2,
           byte_offset = MAX(source_cursors.byte_offset, ?3),
           record_index = MAX(source_cursors.record_index, ?4),
           updated_at = ?5",
        params![
            req.source_file_id,
            req.header.parser_version,
            req.header.source.next_byte_offset as i64,
            req.header.source.record_index as i64 + 1,
            now
        ],
    )?;

    tx.commit()?;
    if revision > 1 {
        Ok(Decision::Revised { event_id, revision })
    } else {
        Ok(Decision::Created { event_id })
    }
}

/// Insert a block if its content is new; return the row id either way.
///
/// The store is content-addressed: two events carrying identical bytes share
/// one block, and re-ingesting the same content stores nothing twice.
fn upsert_block_tx(tx: &Transaction<'_>, block: &PreparedBlock) -> Result<i64, HistoryError> {
    tx.execute(
        "INSERT INTO archive_blocks
           (codec, codec_schema, content_sha256, uncompressed_len, compressed_len,
            refcount, visibility, created_at, bytes)
         VALUES ('zstd', ?1, ?2, ?3, ?4, 0, 'staging', ?5, ?6)
         ON CONFLICT(content_sha256) DO NOTHING",
        params![
            CODEC_SCHEMA,
            block.sha256,
            block.uncompressed_len,
            block.compressed.len() as i64,
            now_iso(),
            block.compressed
        ],
    )?;
    tx.query_row(
        "SELECT block_id FROM archive_blocks WHERE content_sha256 = ?1",
        [&block.sha256],
        |row| row.get(0),
    )
    .map_err(Into::into)
}

fn upsert_source_file_tx(
    tx: &Transaction<'_>,
    host_id: &str,
    header: &PreparedEventHeader,
) -> Result<i64, HistoryError> {
    let now = now_iso();
    let root = header.source.root_path.to_string_lossy().into_owned();
    tx.execute(
        "INSERT INTO source_roots
           (host_id, source_family, root_path, presence, first_seen_at, last_seen_at)
         VALUES (?1, ?2, ?3, 'present', ?4, ?4)
         ON CONFLICT(host_id, source_family, root_path)
           DO UPDATE SET last_seen_at = ?4, presence = 'present', missing_at = NULL",
        params![host_id, header.source_family, root, now],
    )?;
    let root_id: i64 = tx.query_row(
        "SELECT source_root_id FROM source_roots
          WHERE host_id = ?1 AND source_family = ?2 AND root_path = ?3",
        params![host_id, header.source_family, root],
        |row| row.get(0),
    )?;
    tx.execute(
        "INSERT INTO source_files
           (source_root_id, relative_path, presence, first_seen_at, last_seen_at)
         VALUES (?1, ?2, 'present', ?3, ?3)
         ON CONFLICT(source_root_id, relative_path)
           DO UPDATE SET last_seen_at = ?3, presence = 'present', missing_at = NULL",
        params![root_id, header.source.relative_path, now],
    )?;
    tx.query_row(
        "SELECT source_file_id FROM source_files
          WHERE source_root_id = ?1 AND relative_path = ?2",
        params![root_id, header.source.relative_path],
        |row| row.get(0),
    )
    .map_err(Into::into)
}

fn upsert_session_tx(
    tx: &Transaction<'_>,
    host_id: &str,
    header: &PreparedEventHeader,
) -> Result<i64, HistoryError> {
    let now = now_iso();
    let observed_cwd = header
        .session
        .observed_cwd
        .as_ref()
        .map(|p| p.to_string_lossy().into_owned());
    // The observed cwd is preserved VERBATIM; the normalized form is derived
    // lexically beside it. Neither requires the directory to still exist.
    let repository_path = header
        .session
        .observed_cwd
        .as_deref()
        .and_then(lexically_normalize_absolute);
    tx.execute(
        "INSERT INTO sessions
           (host_id, source_family, native_session_id, observed_cwd, repository_path,
            title, started_at, last_event_at, visibility, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, NULL, 'staging', ?8, ?8)
         ON CONFLICT(host_id, source_family, native_session_id) DO UPDATE SET
           observed_cwd = COALESCE(sessions.observed_cwd, ?4),
           repository_path = COALESCE(sessions.repository_path, ?5),
           title = COALESCE(sessions.title, ?6),
           started_at = COALESCE(sessions.started_at, ?7),
           updated_at = ?8",
        params![
            host_id,
            header.source_family,
            header.session.native_session_id,
            observed_cwd,
            repository_path,
            header.session.title,
            header.session.started_at,
            now,
        ],
    )?;
    tx.query_row(
        "SELECT session_id FROM sessions
          WHERE host_id = ?1 AND source_family = ?2 AND native_session_id = ?3",
        params![
            host_id,
            header.source_family,
            header.session.native_session_id
        ],
        |row| row.get(0),
    )
    .map_err(Into::into)
}

/// Reclaim one bounded batch of a staging revision's rows; `true` means more
/// remain.
fn discard_staged_revision_tx(
    tx: &Transaction<'_>,
    revision_id: i64,
) -> Result<(bool, StagingCleanup), HistoryError> {
    let mut reclaimed = StagingCleanup::default();
    let staging = Visibility::Staging.as_str();

    // A committed revision is unreachable from here: everything below is
    // scoped to rows this revision staged and never published.
    let committed: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM event_revisions
                        WHERE revision_id = ?1 AND visibility = 'committed')",
        [revision_id],
        |row| row.get(0),
    )?;
    if committed {
        return Ok((false, reclaimed));
    }

    let mut chunk_stmt = tx.prepare(
        "SELECT chunk_id FROM search_chunks
          WHERE revision_id = ?1 AND visibility = ?2 LIMIT ?3",
    )?;
    let chunk_ids = chunk_stmt
        .query_map(params![revision_id, staging, CLEANUP_BATCH_ROWS], |row| {
            row.get::<_, i64>(0)
        })?
        .collect::<Result<Vec<i64>, _>>()?;
    drop(chunk_stmt);
    for chunk_id in &chunk_ids {
        tx.execute("DELETE FROM search_fts WHERE rowid = ?1", [chunk_id])?;
        tx.execute("DELETE FROM search_chunks WHERE chunk_id = ?1", [chunk_id])?;
        reclaimed.chunks += 1;
    }

    let parts = tx.execute(
        "DELETE FROM event_parts WHERE (revision_id, seq) IN (
           SELECT revision_id, seq FROM event_parts
            WHERE revision_id = ?1 AND visibility = ?2 LIMIT ?3)",
        params![revision_id, staging, CLEANUP_BATCH_ROWS],
    )?;
    reclaimed.parts += parts as i64;

    let usage = tx.execute(
        "DELETE FROM usage_facts WHERE usage_id IN (
           SELECT usage_id FROM usage_facts
            WHERE revision_id = ?1 AND visibility = ?2 LIMIT ?3)",
        params![revision_id, staging, CLEANUP_BATCH_ROWS],
    )?;
    reclaimed.usage += usage as i64;

    let more = !chunk_ids.is_empty()
        || parts as i64 == CLEANUP_BATCH_ROWS
        || usage as i64 == CLEANUP_BATCH_ROWS;
    if more {
        return Ok((true, reclaimed));
    }

    // A concurrent cleanup may already have taken this revision; that is a
    // finished job, not a failure.
    let session_id: Option<i64> = tx
        .query_row(
            "SELECT session_id FROM event_revisions WHERE revision_id = ?1",
            [revision_id],
            |row| row.get(0),
        )
        .ok();
    reclaimed.revisions += tx.execute(
        "DELETE FROM event_revisions WHERE revision_id = ?1 AND visibility = ?2",
        params![revision_id, staging],
    )? as i64;
    reclaimed.merge(reclaim_orphan_staging_tx(tx)?);
    if let Some(session_id) = session_id {
        reclaimed.sessions += tx.execute(
            "DELETE FROM sessions
              WHERE session_id = ?1 AND visibility = ?2
                AND NOT EXISTS (SELECT 1 FROM event_revisions r WHERE r.session_id = ?1)",
            params![session_id, staging],
        )? as i64;
    }
    Ok((false, reclaimed))
}

/// Reclaim never-committed blocks and sessions that nothing references.
///
/// The guards are exhaustive on purpose: a block only leaves if it is still
/// `staging`, holds no reference, and is named by no part and no chunk. A
/// committed block cannot satisfy the first condition, so no retention
/// policy can grow out of this function.
fn reclaim_orphan_staging_tx(tx: &Transaction<'_>) -> Result<StagingCleanup, HistoryError> {
    let mut reclaimed = StagingCleanup::default();
    reclaimed.blocks += tx.execute(
        "DELETE FROM archive_blocks WHERE block_id IN (
           SELECT b.block_id FROM archive_blocks b
            WHERE b.visibility = 'staging' AND b.refcount = 0
              AND NOT EXISTS (SELECT 1 FROM event_parts p WHERE p.block_id = b.block_id)
              AND NOT EXISTS (SELECT 1 FROM search_chunks c WHERE c.block_id = b.block_id)
            LIMIT ?1)",
        [CLEANUP_BATCH_ROWS],
    )? as i64;
    reclaimed.sessions += tx.execute(
        "DELETE FROM sessions WHERE session_id IN (
           SELECT s.session_id FROM sessions s
            WHERE s.visibility = 'staging'
              AND NOT EXISTS (SELECT 1 FROM event_revisions r WHERE r.session_id = s.session_id)
            LIMIT ?1)",
        [CLEANUP_BATCH_ROWS],
    )? as i64;
    Ok(reclaimed)
}

/// The deterministic staging key for one logical event.
///
/// Content-free by construction: a crashed attempt must be findable before
/// its bytes have been re-read.
fn staging_token(header: &PreparedEventHeader) -> String {
    match header.native_event_key.as_deref() {
        Some(key) => format!(
            "{}|{}|n:{key}",
            header.source_family.as_str(),
            header.session.native_session_id
        ),
        None => format!(
            "{}|{}|d:{}#{}",
            header.source_family.as_str(),
            header.session.native_session_id,
            header.source.relative_path,
            header.source.record_index
        ),
    }
}

/// The event's identity, and which kind of identity it is.
fn resolve_event_key(header: &PreparedEventHeader, digest: &str) -> (String, EventKeyKind) {
    match header.native_event_key.as_deref() {
        Some(key) => (key.to_owned(), EventKeyKind::Native),
        // No native id: a source-specific deterministic basis PLUS the
        // content digest. Identical content at the same position replays;
        // different content is a different event, because nothing else about
        // it is stable enough to call it the same one.
        None => (
            format!(
                "{}#{}@{digest}",
                header.source.relative_path, header.source.record_index
            ),
            EventKeyKind::Derived,
        ),
    }
}

fn sha256_hex_of(hasher: Sha256) -> String {
    let digest = hasher.finalize();
    sha256_digest_hex(&digest)
}

fn sha256_digest_hex(digest: &[u8]) -> String {
    let mut out = String::with_capacity(digest.len() * 2);
    for byte in digest {
        out.push_str(&format!("{byte:02x}"));
    }
    out
}

fn validate_header(header: &PreparedEventHeader) -> Result<(), HistoryError> {
    if header.session.native_session_id.is_empty() {
        return Err(invalid("a prepared event carries a native session id"));
    }
    if header.source.relative_path.is_empty() {
        return Err(invalid("a prepared event carries a source relative path"));
    }
    if header.metadata.event_kind.is_empty() {
        return Err(invalid("a prepared event carries a normalized event kind"));
    }
    if header.parser_version <= 0 {
        return Err(invalid("parser version is a positive integer"));
    }
    if let Some(key) = header.native_event_key.as_deref() {
        if key.is_empty() {
            return Err(invalid(
                "a native event key is absent or non-empty, never blank",
            ));
        }
    }
    if header.source.next_byte_offset < header.source.byte_offset {
        return Err(invalid("the next record cannot start before this one does"));
    }
    Ok(())
}

/// Assert the crate never grew a `state.db` reference. Kept beside the code
/// most tempted to reach for one.
#[cfg(test)]
mod tests {
    use super::*;
    use crate::archive::sha256_hex;
    use crate::types::{EventMetadata, Lineage, SessionFacts, SourceFamily, SourceLocation};
    use std::path::PathBuf;

    fn header() -> PreparedEventHeader {
        PreparedEventHeader {
            source_family: SourceFamily::ClaudeCode,
            parser_version: 1,
            session: SessionFacts {
                native_session_id: "s-1".to_owned(),
                observed_cwd: Some(PathBuf::from("/repo")),
                title: None,
                started_at: None,
            },
            source: SourceLocation {
                root_path: PathBuf::from("/root"),
                relative_path: "a.jsonl".to_owned(),
                byte_offset: 0,
                next_byte_offset: 10,
                record_index: 0,
            },
            native_event_key: None,
            lineage: Lineage::default(),
            metadata: EventMetadata {
                event_kind: "message".to_owned(),
                ..EventMetadata::default()
            },
        }
    }

    #[test]
    fn a_derived_key_binds_position_and_content() {
        let (key, kind) = resolve_event_key(&header(), "abc");
        assert_eq!(kind, EventKeyKind::Derived);
        assert_eq!(key, "a.jsonl#0@abc");
    }

    #[test]
    fn a_native_key_is_used_verbatim_so_content_may_revise() {
        let mut header = header();
        header.native_event_key = Some("uuid-9".to_owned());
        let (first, kind) = resolve_event_key(&header, "abc");
        let (second, _) = resolve_event_key(&header, "def");
        assert_eq!(kind, EventKeyKind::Native);
        assert_eq!(first, "uuid-9");
        assert_eq!(second, "uuid-9", "content never enters a native identity");
    }

    #[test]
    fn a_staging_token_never_depends_on_content() {
        let token = staging_token(&header());
        assert_eq!(token, "claude_code|s-1|d:a.jsonl#0");
    }

    #[test]
    fn headers_are_validated_before_anything_is_staged() {
        let mut blank_kind = header();
        blank_kind.metadata.event_kind.clear();
        assert!(matches!(
            validate_header(&blank_kind),
            Err(HistoryError::Invalid { .. })
        ));

        let mut rewinding = header();
        rewinding.source.next_byte_offset = 0;
        rewinding.source.byte_offset = 5;
        assert!(matches!(
            validate_header(&rewinding),
            Err(HistoryError::Invalid { .. })
        ));

        let mut blank_key = header();
        blank_key.native_event_key = Some(String::new());
        assert!(matches!(
            validate_header(&blank_key),
            Err(HistoryError::Invalid { .. })
        ));
    }

    #[test]
    fn the_digest_helper_matches_the_block_helper() {
        let mut hasher = Sha256::new();
        hasher.update(b"payload");
        assert_eq!(sha256_hex_of(hasher), sha256_hex(b"payload"));
    }
}
