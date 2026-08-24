//! forged-history owns `history.db`: a durable, provider-neutral archive of
//! native agent session records, and the indexing seam later parsers, sync
//! passes, and query commands build on.
//!
//! # Why it exists
//!
//! Claude Code, Codex, and Pi each keep their own session logs, and each of
//! them deletes, rotates, or rewrites those logs on its own schedule. Once
//! that happens the record is gone. This crate takes prepared records and
//! keeps them: the EXACT valid-record bytes, compressed into independently
//! decompressible Zstandard blocks and verified by SHA-256, plus normalized
//! identity, lineage, usage, and search metadata beside them.
//!
//! # The two-tier contract
//!
//! Archived blocks are DURABLE — they are the record, and nothing short of
//! an explicitly authorized digest-confirmed purge removes them. The FTS5
//! index is DERIVED — it can be dropped and rebuilt from retained blocks
//! alone, with no source file present. Confusing the two is the failure this
//! crate is shaped to prevent, which is why the index lives behind an
//! explicit generation state machine that will report itself unusable rather
//! than answer a query from a partial rebuild.
//!
//! # Isolation
//!
//! This crate does not depend on `forged-ledger` and never opens `state.db`.
//! The state ledger is crash-critical execution state; the archive is bulk
//! content. They are separate databases, separate connections, separate
//! writer threads, and separate error types on purpose: an archive
//! compaction must not be able to block a settlement.
//!
//! Like the ledger, all access goes through a blocking actor, so the crate
//! contains no async code at all and no transaction can span an `.await` by
//! construction. Async callers wrap calls in `spawn_blocking` at their own
//! layer.
//!
//! # Streaming
//!
//! No public ingestion API requires the source file or the event to exist as
//! one `String`, `Vec<u8>`, or parsed JSON value, and none accepts a maximum
//! source size. Bytes and text arrive as readers or iterators, are
//! compressed and hashed off-transaction, and are written through bounded
//! staging transactions that one final publication makes visible.
//!
//! ```no_run
//! use forged_history::{
//!     EventMetadata, History, Lineage, PreparedEventHeader, SessionFacts, SourceFamily,
//!     SourceLocation,
//! };
//! use std::path::PathBuf;
//!
//! let history = History::open(&forged_history::default_history_db_path())?;
//! let header = PreparedEventHeader {
//!     source_family: SourceFamily::ClaudeCode,
//!     parser_version: 1,
//!     session: SessionFacts {
//!         native_session_id: "018f-…".to_owned(),
//!         observed_cwd: Some(PathBuf::from("/repos/forge")),
//!         title: None,
//!         started_at: None,
//!     },
//!     source: SourceLocation {
//!         root_path: PathBuf::from("/root"),
//!         relative_path: "projects/forge/018f.jsonl".to_owned(),
//!         byte_offset: 0,
//!         next_byte_offset: 512,
//!         record_index: 0,
//!     },
//!     native_event_key: Some("evt-1".to_owned()),
//!     lineage: Lineage::default(),
//!     metadata: EventMetadata {
//!         event_kind: "assistant_message".to_owned(),
//!         ..EventMetadata::default()
//!     },
//! };
//! history.ingest_event(header, &b"{\"raw\":\"record\"}"[..], &b"record"[..], [])?;
//! # Ok::<(), forged_history::HistoryError>(())
//! ```

#![deny(missing_docs)]

mod archive;
mod error;
mod history;
mod ingest;
mod migrations;
mod observation;
mod open;
mod read;
mod rebuild;
mod search;
mod text;
mod time;
mod types;

pub use archive::ARCHIVE_BLOCK_TARGET_BYTES;
pub use error::HistoryError;
pub use history::History;
pub use ingest::{EventIngest, CLEANUP_BATCH_ROWS, STAGING_BATCH_CHUNKS, STAGING_BATCH_PARTS};
pub use open::{default_history_db_path, lexically_normalize_absolute};
pub use read::MAX_PAGE_ROWS;
pub use rebuild::REBUILD_BATCH_CHUNKS;
pub use text::SEARCH_CHUNK_TARGET_BYTES;
pub use types::{
    ArchiveCodec, AttemptLinkConfidence, AttemptLinkKind, AttemptLinkRow, EventCursor,
    EventKeyKind, EventMetadata, EventRole, EventRow, HistoryFilter, HistoryStatus,
    IndexGenerationRow, IndexKind, IndexState, IngestOutcome, Lineage, LineageKind, Page, Pragmas,
    PreparedEventHeader, PresenceState, PurgeScope, PurgeTombstoneRow, RebuildProgress,
    SearchCursor, SearchMatch, SearchOutcome, SessionCursor, SessionFacts, SessionRow,
    SourceFamily, SourceLocation, SourceRootRow, SourceRunOutcome, SourceRunRow, StagingCleanup,
    SyncState, UsageFact, UsageTotals, Visibility,
};

/// The schema version a current build writes into `history.db`.
pub const HISTORY_SCHEMA_VERSION: i64 = migrations::SCHEMA_VERSION;

/// Every table the history schema owns, for enumeration and isolation tests.
pub const HISTORY_TABLES: &[&str] = migrations::HISTORY_TABLES;

/// Every named index the history schema owns.
pub const HISTORY_INDEXES: &[&str] = migrations::HISTORY_INDEXES;
