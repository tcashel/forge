//! Provider-neutral history contracts.

use std::fmt;
use std::path::PathBuf;

use crate::error::{decode_error, invalid, HistoryError};
use crate::time::canonical_timestamp;

/// Native session source families admitted by the first history schema.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum SourceFamily {
    /// Anthropic Claude Code native sessions.
    ClaudeCode,
    /// OpenAI Codex native sessions.
    Codex,
    /// Pi native sessions.
    Pi,
}

impl SourceFamily {
    pub(crate) const fn as_str(self) -> &'static str {
        match self {
            Self::ClaudeCode => "claude_code",
            Self::Codex => "codex",
            Self::Pi => "pi",
        }
    }

    pub(crate) fn decode(column: usize, value: &str) -> rusqlite::Result<Self> {
        match value {
            "claude_code" => Ok(Self::ClaudeCode),
            "codex" => Ok(Self::Codex),
            "pi" => Ok(Self::Pi),
            other => Err(decode_error(column, "source family", other)),
        }
    }
}

impl fmt::Display for SourceFamily {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_str())
    }
}

/// Normalized event roles used by filters and stored rows.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum EventRole {
    /// System instruction/context.
    System,
    /// Developer instruction/context.
    Developer,
    /// Human/user content.
    User,
    /// Model/assistant content.
    Assistant,
    /// Tool call or result content.
    Tool,
}

impl EventRole {
    pub(crate) const fn as_str(self) -> &'static str {
        match self {
            Self::System => "system",
            Self::Developer => "developer",
            Self::User => "user",
            Self::Assistant => "assistant",
            Self::Tool => "tool",
        }
    }

    pub(crate) fn decode(column: usize, value: &str) -> rusqlite::Result<Self> {
        match value {
            "system" => Ok(Self::System),
            "developer" => Ok(Self::Developer),
            "user" => Ok(Self::User),
            "assistant" => Ok(Self::Assistant),
            "tool" => Ok(Self::Tool),
            other => Err(decode_error(column, "event role", other)),
        }
    }
}

impl fmt::Display for EventRole {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_str())
    }
}

/// One normalized scalar in prepared metadata or ordered lineage.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NamedValue {
    /// Provider-neutral field name.
    pub name: String,
    /// Normalized scalar value.
    pub value: String,
}

impl NamedValue {
    /// Construct one named scalar.
    pub fn new(name: impl Into<String>, value: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            value: value.into(),
        }
    }
}

/// Physical source evidence. Paths are observations, never session identity.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceObservation {
    /// Native source root as observed by a later parser.
    pub root_path: PathBuf,
    /// Native source file as observed by a later parser.
    pub file_path: PathBuf,
    /// Optional opaque parser cursor published with the event.
    pub cursor: Option<String>,
}

/// Durable state of one observed native source file.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SourceFileState {
    /// The most recent observation found the source.
    Present,
    /// The most recent observation found it missing; history remains retained.
    Missing,
}

impl SourceFileState {
    pub(crate) fn decode(column: usize, value: &str) -> rusqlite::Result<Self> {
        match value {
            "present" => Ok(Self::Present),
            "missing" => Ok(Self::Missing),
            other => Err(decode_error(column, "source-file state", other)),
        }
    }
}

/// Sync/cursor status for one physical source observation.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceStatus {
    /// Stable source root row id.
    pub source_root_id: i64,
    /// Stable source file row id.
    pub source_file_id: i64,
    /// Current observation state.
    pub state: SourceFileState,
    /// Last committed opaque parser cursor.
    pub cursor: Option<String>,
    /// Revision that published the cursor.
    pub cursor_revision_id: Option<i64>,
    /// Canonical cursor publication timestamp.
    pub cursor_updated_at: Option<String>,
}

/// Provider-neutral metadata fixed before event bytes are streamed.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PreparedEvent {
    /// Native source family.
    pub source_family: SourceFamily,
    /// Source-native session identity.
    pub native_session_id: String,
    /// Source-native event key, when the source supplies one.
    pub native_event_key: Option<String>,
    /// Parser contract version that produced the normalized meaning.
    pub parser_version: String,
    /// Event timestamp; normalized to fixed-width UTC at ingestion start.
    pub occurred_at: String,
    /// Optional session start timestamp.
    pub session_started_at: Option<String>,
    /// Optional session end timestamp.
    pub session_ended_at: Option<String>,
    /// Exact cwd observed in the source, without requiring it to exist.
    pub observed_cwd: Option<String>,
    /// Lexically normalized absolute repository path, without filesystem I/O.
    pub repository_path: Option<PathBuf>,
    /// Optional physical source observation.
    pub source_observation: Option<SourceObservation>,
    /// Normalized event role.
    pub role: Option<EventRole>,
    /// Normalized model identifier.
    pub model: Option<String>,
    /// Ordered provider-neutral lineage facts.
    pub lineage: Vec<NamedValue>,
    /// Normalized scalar metadata. Field names must be unique.
    pub metadata: Vec<NamedValue>,
}

impl PreparedEvent {
    /// Small constructor for the required native identity and timing fields.
    pub fn new(
        source_family: SourceFamily,
        native_session_id: impl Into<String>,
        parser_version: impl Into<String>,
        occurred_at: impl Into<String>,
    ) -> Self {
        Self {
            source_family,
            native_session_id: native_session_id.into(),
            native_event_key: None,
            parser_version: parser_version.into(),
            occurred_at: occurred_at.into(),
            session_started_at: None,
            session_ended_at: None,
            observed_cwd: None,
            repository_path: None,
            source_observation: None,
            role: None,
            model: None,
            lineage: Vec::new(),
            metadata: Vec::new(),
        }
    }
}

/// One provider-reported usage fact attached to an event revision.
#[derive(Debug, Clone, PartialEq)]
pub struct UsageFact {
    /// Provider name.
    pub provider: String,
    /// Provider model name.
    pub model: String,
    /// Non-negative input token evidence.
    pub input_tokens: u64,
    /// Non-negative output token evidence.
    pub output_tokens: u64,
    /// Optional cache-read token evidence.
    pub cache_read_tokens: Option<u64>,
    /// Optional cache-write token evidence.
    pub cache_write_tokens: Option<u64>,
    /// Optional provider-billed cost evidence.
    pub cost_usd: Option<f64>,
    /// RFC3339 evidence timestamp.
    pub observed_at: String,
}

/// Result of finalizing a prepared event.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum IngestOutcome {
    /// New prepared meaning was appended as a committed revision.
    Committed {
        /// Stable revision row id.
        revision_id: i64,
        /// One-based revision number under the native event identity.
        revision: u32,
        /// Rows touched by the bounded final transaction.
        final_rows_touched: usize,
    },
    /// The complete prepared fingerprint was already committed.
    Replayed {
        /// Existing stable revision row id.
        revision_id: i64,
        /// Existing one-based revision number.
        revision: u32,
    },
}

impl IngestOutcome {
    /// Return the committed or replayed revision id.
    pub fn revision_id(&self) -> i64 {
        match self {
            Self::Committed { revision_id, .. } | Self::Replayed { revision_id, .. } => {
                *revision_id
            }
        }
    }
}

/// Filters shared by session, event, usage, and lexical query surfaces.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct HistoryFilter {
    /// Restrict results to one history host id.
    pub host_id: Option<String>,
    /// Restrict results to one lexically normalized absolute repository.
    pub repository_path: Option<PathBuf>,
    /// Restrict results to one native source family.
    pub source_family: Option<SourceFamily>,
    /// Restrict results to one event role.
    pub role: Option<EventRole>,
    /// Restrict results to a model appearing on the event or usage fact.
    pub model: Option<String>,
    /// Restrict results to one stable history session row id.
    pub session_id: Option<i64>,
    /// Inclusive RFC3339 lower timestamp bound.
    pub from: Option<String>,
    /// Exclusive RFC3339 upper timestamp bound.
    pub to: Option<String>,
}

impl HistoryFilter {
    pub(crate) fn canonicalized(mut self) -> Result<Self, HistoryError> {
        if let Some(path) = self.repository_path.take() {
            self.repository_path = Some(normalize_absolute_path(&path)?);
        }
        if let Some(value) = self.from.take() {
            self.from = Some(canonical_timestamp(&value)?);
        }
        if let Some(value) = self.to.take() {
            self.to = Some(canonical_timestamp(&value)?);
        }
        if matches!((&self.from, &self.to), (Some(from), Some(to)) if from >= to) {
            return Err(invalid("history time range must have from < to"));
        }
        Ok(self)
    }
}

/// Keyset-paged metadata query.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct MetadataQuery {
    /// Shared predicates.
    pub filter: HistoryFilter,
    /// Continue after this stable row id.
    pub after_id: Option<i64>,
    /// Requested row count; internally capped.
    pub limit: u32,
}

/// One committed session projection.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SessionRow {
    /// Stable row id.
    pub session_id: i64,
    /// Stable database-local host id.
    pub host_id: String,
    /// Native source family.
    pub source_family: SourceFamily,
    /// Native session identity.
    pub native_session_id: String,
    /// Last observed cwd.
    pub observed_cwd: Option<String>,
    /// Lexically normalized repository path.
    pub repository_path: Option<PathBuf>,
    /// Canonical session start.
    pub started_at: Option<String>,
    /// Canonical session end.
    pub ended_at: Option<String>,
}

/// One committed native event projection.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EventRow {
    /// Stable event row id.
    pub event_id: i64,
    /// Owning stable session row id.
    pub session_id: i64,
    /// Effective native or deterministic fallback key.
    pub event_key: String,
    /// Current append-only revision number.
    pub revision: u32,
    /// Current stable revision row id.
    pub revision_id: i64,
    /// Canonical event timestamp.
    pub occurred_at: String,
    /// Normalized role.
    pub role: Option<EventRole>,
    /// Normalized model.
    pub model: Option<String>,
}

/// One committed usage evidence row.
#[derive(Debug, Clone, PartialEq)]
pub struct UsageRow {
    /// Stable usage row id.
    pub usage_id: i64,
    /// Owning stable revision row id.
    pub revision_id: i64,
    /// Stable history host id.
    pub host_id: String,
    /// Provider name.
    pub provider: String,
    /// Model name.
    pub model: String,
    /// Input tokens.
    pub input_tokens: u64,
    /// Output tokens.
    pub output_tokens: u64,
    /// Cache-read tokens.
    pub cache_read_tokens: Option<u64>,
    /// Cache-write tokens.
    pub cache_write_tokens: Option<u64>,
    /// Billed cost evidence.
    pub cost_usd: Option<f64>,
    /// Canonical evidence timestamp.
    pub observed_at: String,
}

/// Opaque BM25 continuation bound to one index generation and corpus epoch.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SearchCursor(pub(crate) String);

/// One BM25 query.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SearchQuery {
    /// Raw FTS5 MATCH expression.
    pub expression: String,
    /// Shared predicates.
    pub filter: HistoryFilter,
    /// Opaque continuation from a prior page.
    pub after: Option<SearchCursor>,
    /// Requested result count; internally capped.
    pub limit: u32,
}

/// One returned lexical chunk.
#[derive(Debug, Clone, PartialEq)]
pub struct SearchMatch {
    /// Stable chunk row id.
    pub chunk_id: i64,
    /// Owning stable event id.
    pub event_id: i64,
    /// Owning stable revision id.
    pub revision_id: i64,
    /// BM25 rank (lower is better).
    pub rank: f64,
    /// Exact decompressed retained chunk text.
    pub text: String,
    /// Repository observed for the owning session.
    pub repository_path: Option<PathBuf>,
    /// Event role.
    pub role: Option<EventRole>,
    /// Event model.
    pub model: Option<String>,
}

/// One page of BM25 results.
#[derive(Debug, Clone, PartialEq)]
pub struct SearchPage {
    /// Ranked matches.
    pub matches: Vec<SearchMatch>,
    /// Continuation for the next page, when the page filled its limit.
    pub next: Option<SearchCursor>,
    /// Number of chunks decompressed to produce this page.
    pub decompressed_chunks: usize,
}

/// State of the one index generation under construction or advertised.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IndexState {
    /// Generation is incomplete and cannot serve queries.
    Building,
    /// Generation is complete and advertised.
    Ready,
}

impl IndexState {
    pub(crate) fn decode(column: usize, value: &str) -> rusqlite::Result<Self> {
        match value {
            "building" => Ok(Self::Building),
            "ready" => Ok(Self::Ready),
            other => Err(decode_error(column, "index state", other)),
        }
    }
}

/// Result of one bounded rebuild batch.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RebuildProgress {
    /// Generation being rebuilt or observed complete.
    pub generation: String,
    /// True indexed membership count, not an attempted-row estimate.
    pub indexed_count: u64,
    /// Whether the generation is now complete and advertised.
    pub complete: bool,
}

/// Aggregate status intended for later command surfaces.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HistoryStatus {
    /// Stable current host id.
    pub host_id: String,
    /// Current searchable-corpus epoch.
    pub corpus_epoch: u64,
    /// Complete standing generation, if any.
    pub ready_generation: Option<String>,
    /// Current generation state, if any.
    pub generation_state: Option<IndexState>,
    /// Committed session count.
    pub sessions: u64,
    /// Committed event count.
    pub events: u64,
    /// Committed revision count.
    pub revisions: u64,
    /// Never-committed revision count.
    pub staging_revisions: u64,
}

/// Digest-confirmed purge evidence scope. This slice records but never acts.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TombstoneScope {
    /// Evidence for a source file.
    SourceFile,
    /// Evidence for a session.
    Session,
    /// Evidence for an event revision.
    Revision,
}

impl TombstoneScope {
    pub(crate) const fn as_str(self) -> &'static str {
        match self {
            Self::SourceFile => "source_file",
            Self::Session => "session",
            Self::Revision => "revision",
        }
    }
}

/// Tombstone insertion result.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TombstoneOutcome {
    /// New evidence was recorded.
    Recorded,
    /// The exact evidence already existed.
    Replayed,
}

pub(crate) fn normalize_absolute_path(path: &std::path::Path) -> Result<PathBuf, HistoryError> {
    use std::path::Component;

    if !path.is_absolute() {
        return Err(invalid(format!(
            "repository path must be absolute: {}",
            path.display()
        )));
    }
    let mut normalized = PathBuf::new();
    for component in path.components() {
        match component {
            Component::Prefix(prefix) => normalized.push(prefix.as_os_str()),
            Component::RootDir => normalized.push(component.as_os_str()),
            Component::CurDir => {}
            Component::ParentDir => {
                if !normalized.pop() {
                    return Err(invalid("repository path escapes its root"));
                }
            }
            Component::Normal(value) => normalized.push(value),
        }
    }
    Ok(normalized)
}

pub(crate) fn checked_i64(value: u64, what: &str) -> Result<i64, HistoryError> {
    i64::try_from(value).map_err(|_| invalid(format!("{what} exceeds SQLite INTEGER range")))
}

pub(crate) fn checked_u64(value: i64, what: &str) -> rusqlite::Result<u64> {
    u64::try_from(value).map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(
            0,
            rusqlite::types::Type::Integer,
            format!("invalid stored {what}: {error}").into(),
        )
    })
}
