//! Public vocabularies and row types for the history archive.
//!
//! Every stored vocabulary here is CLOSED: the DDL carries a matching
//! `CHECK` constraint and decoding refuses anything outside the set. A new
//! member is a migration plus a variant, never a permissive default.

use std::path::PathBuf;

/// Declare a closed stored vocabulary: an enum plus its exact stored text,
/// a fail-closed decoder, and a `ToSql` that can only emit set members.
macro_rules! closed_vocabulary {
    (
        $(#[$meta:meta])*
        $name:ident as $what:literal {
            $( $(#[$vmeta:meta])* $variant:ident => $text:literal ),+ $(,)?
        }
    ) => {
        $(#[$meta])*
        #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
        pub enum $name {
            $( $(#[$vmeta])* $variant ),+
        }

        impl $name {
            /// Every member, in declaration order.
            pub const ALL: &'static [$name] = &[ $( $name::$variant ),+ ];

            /// The exact text this value is stored as.
            pub fn as_str(self) -> &'static str {
                match self { $( $name::$variant => $text ),+ }
            }

            /// Parse stored text. `None` for anything outside the closed set —
            /// callers must refuse rather than widen.
            pub fn parse(text: &str) -> Option<$name> {
                match text { $( $text => Some($name::$variant), )+ _ => None }
            }

            /// Row-mapper decode that fails CLOSED on an unknown stored value.
            pub(crate) fn from_column(idx: usize, text: &str) -> Result<$name, rusqlite::Error> {
                $name::parse(text)
                    .ok_or_else(|| crate::error::column_decode_error(idx, $what, text))
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                f.write_str(self.as_str())
            }
        }

        impl rusqlite::ToSql for $name {
            fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
                Ok(rusqlite::types::ToSqlOutput::from(self.as_str()))
            }
        }
    };
}

closed_vocabulary! {
    /// The native tool family a record came from. Exactly three families
    /// exist; a fourth is a migration, never an inferred string.
    SourceFamily as "source family" {
        /// Claude Code native session logs.
        ClaudeCode => "claude_code",
        /// Codex native session logs.
        Codex => "codex",
        /// Pi native session logs.
        Pi => "pi",
    }
}

closed_vocabulary! {
    /// Whether an observed filesystem object was last seen present.
    ///
    /// Missing is a STATE, never a deletion: archived content outlives the
    /// disappearance of the file it was read from.
    PresenceState as "presence state" {
        /// Last observed present.
        Present => "present",
        /// Last observation found it gone.
        Missing => "missing",
    }
}

closed_vocabulary! {
    /// Whether a row is durable-but-invisible staging or published content.
    ///
    /// Every committed read, FTS match, usage aggregation, and cursor join
    /// filters on [`Visibility::Committed`].
    Visibility as "visibility" {
        /// Durably written but never published; invisible to every reader.
        Staging => "staging",
        /// Published by a final publication transaction.
        Committed => "committed",
    }
}

closed_vocabulary! {
    /// Whether an event key came from the source or was derived.
    EventKeyKind as "event key kind" {
        /// The source supplied a native, stable event id.
        Native => "native",
        /// Derived from a source-specific deterministic basis plus the
        /// content digest, because the source has no native event id.
        Derived => "derived",
    }
}

closed_vocabulary! {
    /// Where an event sits in its session's lineage.
    LineageKind as "lineage kind" {
        /// The session's main line.
        Main => "main",
        /// A branch the harness explored off the main line.
        Sidechain => "sidechain",
        /// A compaction/summary record standing in for earlier turns.
        Summary => "summary",
        /// The parser could not classify it.
        Unknown => "unknown",
    }
}

closed_vocabulary! {
    /// The speaker role a normalized event carries.
    EventRole as "event role" {
        /// Operator input.
        User => "user",
        /// Model output.
        Assistant => "assistant",
        /// Harness-injected context.
        System => "system",
        /// Tool call or tool result.
        Tool => "tool",
        /// Anything the parser recognized but did not classify.
        Other => "other",
    }
}

closed_vocabulary! {
    /// The compression codec an archive block was written with.
    ///
    /// Locked to Zstandard: the codec decision is architectural, and no
    /// MessagePack or JSON reserialization path exists.
    ArchiveCodec as "archive codec" {
        /// Zstandard frame, independently decompressible.
        Zstd => "zstd",
    }
}

closed_vocabulary! {
    /// The kind of derived index a generation covers.
    IndexKind as "index kind" {
        /// The contentless FTS5 lexical index.
        Fts5 => "fts5",
    }
}

closed_vocabulary! {
    /// Index-generation lifecycle. Only [`IndexState::Complete`] may serve
    /// queries; a partial generation is never advertised as complete.
    IndexState as "index state" {
        /// Being populated; incomplete and unusable for queries.
        Building => "building",
        /// Fully populated and standing.
        Complete => "complete",
        /// Abandoned after a failure; retained for diagnosis.
        Failed => "failed",
        /// Replaced by a newer complete generation.
        Superseded => "superseded",
    }
}

closed_vocabulary! {
    /// How an ingestion run over a source family ended.
    SourceRunOutcome as "source run outcome" {
        /// Ran to the end of every discovered file.
        Completed => "completed",
        /// Stopped on an error.
        Failed => "failed",
        /// Stopped without a verdict (process death, cancellation).
        Interrupted => "interrupted",
    }
}

closed_vocabulary! {
    /// What kind of orchestrator identity a session is linked to.
    AttemptLinkKind as "attempt link kind" {
        /// A forged run id.
        Run => "run",
        /// A forged packet id.
        Packet => "packet",
        /// A forged attempt id.
        Attempt => "attempt",
        /// A bead id.
        Bead => "bead",
    }
}

closed_vocabulary! {
    /// How firmly an attempt link is held.
    AttemptLinkConfidence as "attempt link confidence" {
        /// The source record stated it.
        Declared => "declared",
        /// Derived from surrounding evidence.
        Inferred => "inferred",
    }
}

closed_vocabulary! {
    /// What a purge tombstone covers.
    ///
    /// Tombstones RECORD a digest-confirmed purge; nothing in this slice
    /// executes one.
    PurgeScope as "purge scope" {
        /// A whole session and its events.
        Session => "session",
        /// One event and its revisions.
        Event => "event",
        /// One archive block.
        Block => "block",
        /// One search chunk.
        Chunk => "chunk",
    }
}

/// Where a record was physically observed.
///
/// Physical paths are OBSERVATIONS, never session identity: the same session
/// may be observed at several paths, and a path may vanish without the
/// session losing its archived content.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceLocation {
    /// The source-family root the file was discovered under.
    pub root_path: PathBuf,
    /// The file's path relative to `root_path`.
    pub relative_path: String,
    /// Byte offset of this record's first byte within the file.
    pub byte_offset: u64,
    /// Byte offset the NEXT record starts at. The source cursor advances to
    /// exactly this on publication, so a resumed read never re-reads a
    /// separator the archive deliberately did not store.
    pub next_byte_offset: u64,
    /// The record's zero-based ordinal within the file.
    pub record_index: u64,
}

/// Session-level facts a prepared event carries.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SessionFacts {
    /// The session id as the native tool wrote it.
    pub native_session_id: String,
    /// The working directory as observed, verbatim and unresolved.
    pub observed_cwd: Option<PathBuf>,
    /// A human-facing title, when the source supplies one.
    pub title: Option<String>,
    /// When the session started, when the source supplies it.
    pub started_at: Option<String>,
}

/// An event's position in its session's lineage.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Lineage {
    /// Main line, sidechain, summary, or unclassified.
    pub kind: LineageKind,
    /// The parent event's key, when the source records one.
    pub parent_event_key: Option<String>,
}

impl Default for Lineage {
    fn default() -> Self {
        Lineage {
            kind: LineageKind::Main,
            parent_event_key: None,
        }
    }
}

/// Normalized scalar metadata extracted from one native record.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct EventMetadata {
    /// Speaker role, when classified.
    pub role: Option<EventRole>,
    /// The model that produced the record, when known.
    pub model: Option<String>,
    /// The parser's normalized record kind, free text by design: it names
    /// the native record shape, which no closed set can anticipate.
    pub event_kind: String,
    /// When the record occurred, when the source supplies it.
    pub occurred_at: Option<String>,
}

/// One usage observation attached to an event. Token counts only — pricing
/// is explicitly out of this crate.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct UsageFact {
    /// The provider that reported the usage.
    pub provider: String,
    /// The model the usage is attributed to.
    pub model: String,
    /// Non-cached input tokens.
    pub input_tokens: Option<i64>,
    /// Output tokens.
    pub output_tokens: Option<i64>,
    /// Cache-read input tokens.
    pub cache_read_tokens: Option<i64>,
    /// Cache-write input tokens.
    pub cache_write_tokens: Option<i64>,
    /// Reasoning tokens, when the provider separates them.
    pub reasoning_tokens: Option<i64>,
}

/// Everything about a prepared event except its bytes, text, and usage.
///
/// The header is small and fully-formed; the unbounded parts of an event
/// arrive as streams, so ingestion never needs a `String`, a `Vec<u8>`, or a
/// parsed JSON value proportional to the source.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PreparedEventHeader {
    /// Which native tool family produced the record.
    pub source_family: SourceFamily,
    /// The parser build that produced this normalization.
    pub parser_version: i64,
    /// Session identity and session-level facts.
    pub session: SessionFacts,
    /// Where the record was observed.
    pub source: SourceLocation,
    /// The source's own event id, when it has one. `None` selects the
    /// deterministic derived key.
    pub native_event_key: Option<String>,
    /// Lineage placement.
    pub lineage: Lineage,
    /// Normalized scalar metadata.
    pub metadata: EventMetadata,
}

/// What a publication did.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IngestOutcome {
    /// The event did not exist; it and its archive were published.
    Created {
        /// The published event's row id.
        event_id: i64,
        /// The published revision's row id.
        revision_id: i64,
    },
    /// An identical committed revision already existed. Nothing changed:
    /// every staged row was reclaimed before returning.
    Replayed {
        /// The pre-existing event's row id.
        event_id: i64,
        /// The pre-existing identical revision's row id.
        revision_id: i64,
    },
    /// Committed content already existed under this identity and differed.
    /// A new revision was APPENDED; the prior archive bytes are untouched.
    Revised {
        /// The event's row id.
        event_id: i64,
        /// The newly appended revision's row id.
        revision_id: i64,
        /// The new revision's ordinal, greater than every prior one.
        revision: i64,
    },
}

impl IngestOutcome {
    /// The event row id, whichever arm this is.
    pub fn event_id(&self) -> i64 {
        match self {
            IngestOutcome::Created { event_id, .. }
            | IngestOutcome::Replayed { event_id, .. }
            | IngestOutcome::Revised { event_id, .. } => *event_id,
        }
    }

    /// The revision row id this call resolved to.
    pub fn revision_id(&self) -> i64 {
        match self {
            IngestOutcome::Created { revision_id, .. }
            | IngestOutcome::Replayed { revision_id, .. }
            | IngestOutcome::Revised { revision_id, .. } => *revision_id,
        }
    }
}

/// One committed session, as read back.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SessionRow {
    /// The archive's row id.
    pub session_id: i64,
    /// The host the session was observed on.
    pub host_id: String,
    /// Which native tool family.
    pub source_family: SourceFamily,
    /// The native session id.
    pub native_session_id: String,
    /// The working directory exactly as observed.
    pub observed_cwd: Option<String>,
    /// The lexically normalized absolute form of `observed_cwd`. The
    /// directory need not still exist.
    pub repository_path: Option<String>,
    /// A human-facing title, when known.
    pub title: Option<String>,
    /// When the session started, when known.
    pub started_at: Option<String>,
    /// The latest committed event time seen for this session.
    pub last_event_at: Option<String>,
    /// Committed event count.
    pub event_count: i64,
}

/// One committed event revision, as read back.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EventRow {
    /// The event's row id.
    pub event_id: i64,
    /// The revision's row id.
    pub revision_id: i64,
    /// The revision ordinal, 1-based.
    pub revision: i64,
    /// The owning session.
    pub session_id: i64,
    /// The event key, native or derived.
    pub event_key: String,
    /// Which kind of key it is.
    pub event_key_kind: EventKeyKind,
    /// SHA-256 over the exact archived record bytes.
    pub content_sha256: String,
    /// Total archived byte length.
    pub byte_length: i64,
    /// The parser build that produced this revision.
    pub parser_version: i64,
    /// Speaker role, when classified.
    pub role: Option<EventRole>,
    /// The model, when known.
    pub model: Option<String>,
    /// The parser's normalized record kind.
    pub event_kind: String,
    /// Lineage placement.
    pub lineage_kind: LineageKind,
    /// Parent event key, when recorded.
    pub parent_event_key: Option<String>,
    /// When the record occurred, when known.
    pub occurred_at: Option<String>,
    /// When the archive published it.
    pub ingested_at: String,
    /// Whether this revision is the event's head.
    pub is_head: bool,
}

/// Keyset position for session paging: strictly increasing, never an offset.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SessionCursor {
    /// Resume strictly after this session row id.
    pub after_session_id: i64,
}

/// Keyset position for event paging.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct EventCursor {
    /// Resume strictly after this revision row id.
    pub after_revision_id: i64,
}

/// Keyset position for BM25 paging.
///
/// BM25 rank alone is not unique, so continuation is the (rank, chunk id)
/// pair — a total order that no concurrent insert can shift beneath a reader.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SearchCursor {
    /// The last returned match's BM25 rank.
    pub after_rank: f64,
    /// The last returned match's chunk row id.
    pub after_chunk_id: i64,
}

/// One BM25 hit with its decompressed chunk text.
#[derive(Debug, Clone, PartialEq)]
pub struct SearchMatch {
    /// The chunk row id the FTS index returned.
    pub chunk_id: i64,
    /// BM25 rank; lower sorts better.
    pub rank: f64,
    /// The owning session.
    pub session_id: i64,
    /// The owning event.
    pub event_id: i64,
    /// The owning revision.
    pub revision_id: i64,
    /// The chunk's ordinal within its revision.
    pub seq: i64,
    /// Which native tool family.
    pub source_family: SourceFamily,
    /// The normalized repository path, when the session has one.
    pub repository_path: Option<String>,
    /// When the record occurred, when known.
    pub occurred_at: Option<String>,
    /// The chunk's text, decompressed from its retained archive block.
    pub text: String,
}

/// Predicates for reads. Every field is optional; an ABSENT repository
/// predicate means every repository, never "the current one".
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct HistoryFilter {
    /// Restrict to one host id.
    pub host_id: Option<String>,
    /// Restrict to one normalized repository path.
    pub repository_path: Option<String>,
    /// Restrict to one source family.
    pub source_family: Option<SourceFamily>,
    /// Restrict to one speaker role.
    pub role: Option<EventRole>,
    /// Restrict to one model.
    pub model: Option<String>,
    /// Restrict to one session row id.
    pub session_id: Option<i64>,
    /// Inclusive lower bound: `occurred_at` for events, usage, and search;
    /// `last_event_at` for sessions.
    pub since: Option<String>,
    /// Exclusive upper bound, on the same column `since` bounds.
    pub until: Option<String>,
}

/// One page of rows plus the cursor that resumes after it.
#[derive(Debug, Clone, PartialEq)]
pub struct Page<T, C> {
    /// The rows, in keyset order.
    pub rows: Vec<T>,
    /// `Some` when a full page was returned and more may follow.
    pub next: Option<C>,
}

/// A BM25 lookup's answer. Search is only ever served from a COMPLETE index
/// generation; anything else says so rather than under-reporting.
#[derive(Debug, Clone, PartialEq)]
pub enum SearchOutcome {
    /// Served from a complete standing generation.
    Ready(Page<SearchMatch, SearchCursor>),
    /// A rebuild is in flight and no complete generation stands. The
    /// archive is intact; the lexical index is not yet usable.
    Rebuilding {
        /// The in-flight generation.
        generation: i64,
        /// How many chunks it has indexed so far.
        indexed_chunks: i64,
        /// How many committed chunks it must cover.
        total_chunks: i64,
    },
    /// No complete generation stands and none is being built.
    Unavailable {
        /// Why, in one phrase.
        reason: String,
    },
}

/// One index generation's standing.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IndexGenerationRow {
    /// The generation number.
    pub generation: i64,
    /// Which index it covers.
    pub kind: IndexKind,
    /// Its lifecycle state.
    pub state: IndexState,
    /// The highest chunk row id already indexed.
    pub resume_after_chunk_id: i64,
    /// How many chunks it has indexed.
    pub indexed_chunks: i64,
    /// When it was started.
    pub started_at: String,
    /// When it completed, if it did.
    pub completed_at: Option<String>,
    /// Diagnostic note, set on failure.
    pub note: Option<String>,
}

/// One rebuild step's result.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RebuildProgress {
    /// The generation being built.
    pub generation: i64,
    /// Chunks indexed by THIS step.
    pub indexed_now: i64,
    /// Chunks indexed by this generation in total.
    pub indexed_total: i64,
    /// How many committed chunks the generation must cover.
    pub total_chunks: i64,
    /// Whether the generation is now complete and standing.
    pub complete: bool,
}

/// Where ingestion of one source file stands.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SyncState {
    /// The source file's row id.
    pub source_file_id: i64,
    /// The family root the file lives under.
    pub root_path: String,
    /// The file's path relative to that root.
    pub relative_path: String,
    /// Which native tool family.
    pub source_family: SourceFamily,
    /// Whether the file was last seen present.
    pub presence: PresenceState,
    /// The parser build that wrote the cursor.
    pub parser_version: i64,
    /// The byte offset the cursor stands at. Advanced ONLY by a publication.
    pub byte_offset: i64,
    /// The record ordinal the cursor stands at.
    pub record_index: i64,
    /// When the cursor last advanced.
    pub updated_at: Option<String>,
}

/// A whole-archive integrity and standing summary.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HistoryStatus {
    /// This archive's stable host id.
    pub host_id: String,
    /// The applied schema version.
    pub schema_version: i64,
    /// Committed session count.
    pub sessions: i64,
    /// Committed event count.
    pub events: i64,
    /// Committed revision count.
    pub revisions: i64,
    /// Committed archive block count.
    pub blocks: i64,
    /// Total compressed bytes held in committed blocks.
    pub compressed_bytes: i64,
    /// Total uncompressed bytes those blocks represent.
    pub uncompressed_bytes: i64,
    /// Committed search chunk count.
    pub search_chunks: i64,
    /// Rows still in staging — durable, invisible, and reclaimable.
    pub staged_rows: i64,
    /// The standing complete generation, if one exists.
    pub complete_generation: Option<i64>,
    /// A generation currently being built, if one is.
    pub building_generation: Option<i64>,
}

/// How many rows a cleanup pass reclaimed.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct StagingCleanup {
    /// Never-committed event revisions removed.
    pub revisions: i64,
    /// Never-committed archive parts removed.
    pub parts: i64,
    /// Never-committed search chunks removed (and un-indexed).
    pub chunks: i64,
    /// Never-committed usage rows removed.
    pub usage: i64,
    /// Unreferenced never-committed archive blocks removed.
    pub blocks: i64,
    /// Never-committed sessions removed.
    pub sessions: i64,
}

impl StagingCleanup {
    /// Total rows reclaimed.
    pub fn total(&self) -> i64 {
        self.revisions + self.parts + self.chunks + self.usage + self.blocks + self.sessions
    }

    /// Fold another batch's tally into this one.
    pub(crate) fn merge(&mut self, other: StagingCleanup) {
        self.revisions += other.revisions;
        self.parts += other.parts;
        self.chunks += other.chunks;
        self.usage += other.usage;
        self.blocks += other.blocks;
        self.sessions += other.sessions;
    }
}

/// One discovered source-family root, as read back.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceRootRow {
    /// The root's row id.
    pub source_root_id: i64,
    /// The host it was observed on.
    pub host_id: String,
    /// Which native tool family lives under it.
    pub source_family: SourceFamily,
    /// The root path, as observed.
    pub root_path: String,
    /// Whether it was last seen present.
    pub presence: PresenceState,
    /// When it was first observed.
    pub first_seen_at: String,
    /// When it was last observed.
    pub last_seen_at: String,
    /// When it was last found missing, if ever.
    pub missing_at: Option<String>,
}

/// One recorded ingestion pass over a source family.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceRunRow {
    /// The run's row id.
    pub source_run_id: i64,
    /// The host it ran on.
    pub host_id: String,
    /// Which native tool family it covered.
    pub source_family: SourceFamily,
    /// When it started.
    pub started_at: String,
    /// When it finished; `None` means it never did.
    pub finished_at: Option<String>,
    /// How it ended; `None` alongside a missing `finished_at` is a pass a
    /// crash interrupted before it could record a verdict.
    pub outcome: Option<SourceRunOutcome>,
    /// How many files it observed.
    pub files_seen: i64,
    /// How many events it published.
    pub events_published: i64,
    /// A diagnostic note.
    pub note: Option<String>,
}

/// One session-to-orchestrator link.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AttemptLinkRow {
    /// The linked session.
    pub session_id: i64,
    /// What kind of orchestrator identity.
    pub link_kind: AttemptLinkKind,
    /// The identity itself.
    pub link_value: String,
    /// How firmly the link is held.
    pub confidence: AttemptLinkConfidence,
    /// When it was recorded.
    pub created_at: String,
}

/// One record of a digest-confirmed purge.
///
/// A tombstone RECORDS that content was removed and proves which content it
/// was. Nothing in this crate executes a purge.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PurgeTombstoneRow {
    /// The tombstone's row id.
    pub tombstone_id: i64,
    /// What the purge covered.
    pub scope: PurgeScope,
    /// The purged object's key within that scope.
    pub scope_key: String,
    /// The digest that identifies exactly what was removed.
    pub digest_sha256: String,
    /// Why it was removed.
    pub reason: String,
    /// When.
    pub purged_at: String,
}

/// Aggregated committed usage evidence. Staging never contributes.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct UsageTotals {
    /// How many committed usage rows were aggregated.
    pub records: i64,
    /// Summed non-cached input tokens.
    pub input_tokens: i64,
    /// Summed output tokens.
    pub output_tokens: i64,
    /// Summed cache-read input tokens.
    pub cache_read_tokens: i64,
    /// Summed cache-write input tokens.
    pub cache_write_tokens: i64,
    /// Summed reasoning tokens.
    pub reasoning_tokens: i64,
}

/// The writer connection's configuration — the sanctioned observability seam.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Pragmas {
    /// Journal mode; always `wal`.
    pub journal_mode: String,
    /// `synchronous` level.
    pub synchronous: i64,
    /// Whether foreign keys are enforced.
    pub foreign_keys: bool,
    /// The busy timeout in milliseconds.
    pub busy_timeout_ms: i64,
    /// The applied schema version.
    pub user_version: i64,
}
