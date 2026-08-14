//! Public row and support types for the wave-3/-4 seam.
//!
//! Every `*Row` struct carries one public field per column of its table, in
//! DDL order — TEXT → `String`, INTEGER → `i64`, REAL → `f64` (nullable →
//! `Option<_>`) — except state/stage/effect-class columns, which use the Rust
//! enums below (and [`Stage`] from forged-types).

use std::collections::HashMap;

use forged_types::{ErrorCode, ExecutionPackageV1, ProviderHints, RunId, Stage};

use crate::error::{refused, LedgerError};

/// A run's lifecycle state (`runs.state`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RunState {
    /// The run accepts work.
    Active,
    /// The run was stopped with a reason.
    Stopped,
}

impl RunState {
    /// The DDL CHECK string for this state.
    pub fn as_str(&self) -> &'static str {
        match self {
            RunState::Active => "active",
            RunState::Stopped => "stopped",
        }
    }
}

impl TryFrom<&str> for RunState {
    type Error = LedgerError;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        match s {
            "active" => Ok(RunState::Active),
            "stopped" => Ok(RunState::Stopped),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown run state: {other:?}"),
            )),
        }
    }
}

/// An attempt's lifecycle state (`attempts.state`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AttemptState {
    /// Claimed and presumed working.
    Running,
    /// Landed a result.
    Completed,
    /// Reported failure.
    Failed,
    /// Durably marked for revocation; the fence refuses its token.
    Revoking,
    /// Kill-confirmed and externally reclaimed; a successor may claim.
    Reclaimed,
    /// Kill-confirmed and settled by an operator's attempt-local stop. The
    /// bead's bd lease is deliberately untouched — it is bead-scoped and
    /// shared with every sibling generation — so a successor claims under
    /// the same `run_holder` with no waiting period.
    Stopped,
}

impl AttemptState {
    /// The DDL CHECK string for this state.
    pub fn as_str(&self) -> &'static str {
        match self {
            AttemptState::Running => "running",
            AttemptState::Completed => "completed",
            AttemptState::Failed => "failed",
            AttemptState::Revoking => "revoking",
            AttemptState::Reclaimed => "reclaimed",
            AttemptState::Stopped => "stopped",
        }
    }
}

impl TryFrom<&str> for AttemptState {
    type Error = LedgerError;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        match s {
            "running" => Ok(AttemptState::Running),
            "completed" => Ok(AttemptState::Completed),
            "failed" => Ok(AttemptState::Failed),
            "revoking" => Ok(AttemptState::Revoking),
            "reclaimed" => Ok(AttemptState::Reclaimed),
            "stopped" => Ok(AttemptState::Stopped),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown attempt state: {other:?}"),
            )),
        }
    }
}

/// How an operation's external effect behaves under retry
/// (`operations.effect_class`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EffectClass {
    /// Releasing and redoing is safe.
    SafeRetry,
    /// Settle by querying the external system.
    ObserveOnly,
    /// Needs a human; quarantine.
    HumanAmbiguous,
}

impl EffectClass {
    /// The DDL CHECK string (kebab-case) for this class.
    pub fn as_str(&self) -> &'static str {
        match self {
            EffectClass::SafeRetry => "safe-retry",
            EffectClass::ObserveOnly => "observe-only",
            EffectClass::HumanAmbiguous => "human-ambiguous",
        }
    }
}

impl TryFrom<&str> for EffectClass {
    type Error = LedgerError;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        match s {
            "safe-retry" => Ok(EffectClass::SafeRetry),
            "observe-only" => Ok(EffectClass::ObserveOnly),
            "human-ambiguous" => Ok(EffectClass::HumanAmbiguous),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown effect class: {other:?}"),
            )),
        }
    }
}

/// An operation row's progress (`operations.state`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OperationState {
    /// Claimed before its effect fired; not yet settled.
    InProgress,
    /// Settled with a stored terminal envelope.
    Terminal,
}

impl OperationState {
    /// The DDL CHECK string for this state.
    pub fn as_str(&self) -> &'static str {
        match self {
            OperationState::InProgress => "in_progress",
            OperationState::Terminal => "terminal",
        }
    }
}

impl TryFrom<&str> for OperationState {
    type Error = LedgerError;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        match s {
            "in_progress" => Ok(OperationState::InProgress),
            "terminal" => Ok(OperationState::Terminal),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown operation state: {other:?}"),
            )),
        }
    }
}

/// The `Stage` column string, exactly forged-types' serde `lowercase` form.
pub(crate) fn stage_as_str(stage: Stage) -> &'static str {
    match stage {
        Stage::Implement => "implement",
        Stage::ReviewClaude => "reviewclaude",
        Stage::ReviewCodex => "reviewcodex",
        Stage::Fix => "fix",
    }
}

/// Parse a stored stage string back to [`Stage`].
pub(crate) fn stage_from_db(s: &str) -> Result<Stage, LedgerError> {
    match s {
        "implement" => Ok(Stage::Implement),
        "reviewclaude" => Ok(Stage::ReviewClaude),
        "reviewcodex" => Ok(Stage::ReviewCodex),
        "fix" => Ok(Stage::Fix),
        other => Err(crate::error::internal(format!(
            "unknown stage in database: {other:?}"
        ))),
    }
}

/// One row of `runs`, in DDL column order.
#[derive(Debug, Clone, PartialEq)]
pub struct RunRow {
    /// `runs.run_id`.
    pub run_id: String,
    /// `runs.bead_id`.
    pub bead_id: String,
    /// `runs.repo`.
    pub repo: String,
    /// `runs.base_ref`.
    pub base_ref: String,
    /// `runs.branch`.
    pub branch: String,
    /// `runs.protocol`.
    pub protocol: String,
    /// `runs.state`.
    pub state: RunState,
    /// `runs.stop_reason`.
    pub stop_reason: Option<String>,
    /// `runs.created_at`.
    pub created_at: String,
    /// `runs.updated_at`.
    pub updated_at: String,
}

/// One immutable `run_definitions` row.
#[derive(Debug, Clone, PartialEq)]
pub struct RunDefinitionRow {
    pub run_id: String,
    pub protocol_ref_json: String,
    pub profile_ref_json: String,
    pub roster_ref_json: String,
    pub package_sha256: String,
    pub profile_sha256: String,
    pub roster_sha256: String,
    pub package_json: String,
    /// Temporary v0 executor projection, frozen with the package.
    pub compatibility_roster_json: String,
    pub created_at: String,
}

/// One append-only `roster_revisions` row.
#[derive(Debug, Clone, PartialEq)]
pub struct RosterRevisionRow {
    pub run_id: String,
    pub revision: u32,
    pub roster_ref_json: String,
    pub roster_sha256: String,
    pub roster_json: String,
    pub reason: String,
    pub created_at: String,
    pub operation_id: Option<String>,
}

/// One atomic epic roster transition: current child revisions plus the
/// governing parent event.
#[derive(Debug, Clone)]
pub struct RosterRevisionBatch {
    pub epic_id: String,
    pub event_kind: String,
    pub event_payload: serde_json::Value,
    pub run_ids: Vec<String>,
    pub roster: forged_types::ResolvedRosterV1,
    pub roster_sha256: String,
    pub reason: String,
    pub operation_prefix: String,
}

/// One row of `packets`, in DDL column order.
#[derive(Debug, Clone, PartialEq)]
pub struct PacketRow {
    /// `packets.packet_id` — `"<run_id>/<stage>/<seq>"`, deterministic.
    pub packet_id: String,
    /// `packets.run_id`.
    pub run_id: String,
    /// `packets.stage`.
    pub stage: Stage,
    /// `packets.seq`.
    pub seq: i64,
    /// `packets.spec_path`.
    pub spec_path: String,
    /// `packets.spec_sha256`.
    pub spec_sha256: String,
    /// `packets.spec_revision` — the pinned bead revision, `None` on a
    /// file-sourced packet.
    pub spec_revision: Option<String>,
    /// `packets.body_json` — stored verbatim, never parsed by the ledger.
    pub body_json: String,
    /// `packets.created_at`.
    pub created_at: String,
}

/// One row of `attempts`, in DDL column order.
#[derive(Debug, Clone, PartialEq)]
pub struct AttemptRow {
    /// `attempts.attempt_id`.
    pub attempt_id: i64,
    /// `attempts.packet_id`.
    pub packet_id: String,
    /// `attempts.claim_token`.
    pub claim_token: String,
    /// `attempts.claimant` — stored verbatim, never parsed here.
    pub claimant: String,
    /// `attempts.state`.
    pub state: AttemptState,
    /// `attempts.revoke_reason`.
    pub revoke_reason: Option<String>,
    /// `attempts.fail_note` — the note supplied to `fail_packet`.
    pub fail_note: Option<String>,
    /// `attempts.result_json` — serialized `PacketResult` on completion.
    pub result_json: Option<String>,
    /// `attempts.started_at`.
    pub started_at: String,
    /// `attempts.updated_at`.
    pub updated_at: String,
    /// `attempts.last_heartbeat_at`.
    pub last_heartbeat_at: Option<String>,
    /// `attempts.ended_at`.
    pub ended_at: Option<String>,
}

/// One row of `operations`, in DDL column order.
#[derive(Debug, Clone, PartialEq)]
pub struct OperationRow {
    /// `operations.operation_id` — uuid v7.
    pub operation_id: String,
    /// `operations.name`.
    pub name: String,
    /// `operations.idempotency_key`.
    pub idempotency_key: String,
    /// `operations.request_sha256`.
    pub request_sha256: String,
    /// `operations.effect_class`.
    pub effect_class: EffectClass,
    /// `operations.run_id`.
    pub run_id: Option<String>,
    /// `operations.claim_token` — fencing token when attempt-scoped.
    pub claim_token: Option<String>,
    /// `operations.state`.
    pub state: OperationState,
    /// `operations.response_json` — stored terminal envelope, verbatim.
    pub response_json: Option<String>,
    /// `operations.created_at`.
    pub created_at: String,
    /// `operations.updated_at`.
    pub updated_at: String,
}

/// One row of `merge_slots`, in DDL column order.
#[derive(Debug, Clone, PartialEq)]
pub struct MergeSlotRow {
    /// `merge_slots.slot`.
    pub slot: String,
    /// `merge_slots.holder`.
    pub holder: String,
    /// `merge_slots.acquired_at` — forged's own acquisition clock.
    pub acquired_at: String,
}

/// One row of `events`, in DDL column order.
#[derive(Debug, Clone, PartialEq)]
pub struct EventRow {
    /// `events.event_id` — append-only, monotonic.
    pub event_id: i64,
    /// `events.ts`.
    pub ts: String,
    /// `events.run_id`.
    pub run_id: Option<String>,
    /// `events.kind`.
    pub kind: String,
    /// `events.payload_json`.
    pub payload_json: String,
}

/// Input to [`crate::Ledger::create_run`].
#[derive(Debug, Clone, PartialEq)]
pub struct NewRun {
    /// The validated run id.
    pub run_id: RunId,
    /// The bead this run implements.
    pub bead_id: String,
    /// Target repository.
    pub repo: String,
    /// Base ref the run branches from.
    pub base_ref: String,
    /// Working branch.
    pub branch: String,
}

/// Definition snapshot inserted atomically with a new run.
#[derive(Debug, Clone, PartialEq)]
pub struct NewRunDefinition {
    pub package: ExecutionPackageV1,
    pub package_sha256: String,
    pub compatibility_roster: HashMap<Stage, ProviderHints>,
}

/// Input to [`crate::Ledger::open_packet`].
#[derive(Debug, Clone, PartialEq)]
pub struct NewPacket {
    /// Owning run id.
    pub run_id: String,
    /// Pipeline stage.
    pub stage: Stage,
    /// Sequence number within (run, stage).
    pub seq: i64,
    /// Path of the spec the packet implements.
    pub spec_path: String,
    /// Content hash of that spec.
    pub spec_sha256: String,
    /// The bead revision this packet pins, `None` when the spec came from a
    /// file. A non-`None` value is the packet's drift fence.
    pub spec_revision: Option<String>,
    /// Caller-serialized `WorkPacket` minus the columns above, stored
    /// verbatim.
    pub body_json: String,
}

/// What a packet's spec is pinned to — the value `claim_packet` compares.
///
/// The two arms are NOT interchangeable: a bead-sourced packet is fenced on
/// its rendered body, a file-sourced one on the file's content hash, and a
/// claim presenting the wrong ARM is drift just as surely as one presenting
/// the wrong value.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SpecFence {
    /// A file-sourced spec (the deprecated `--spec <path>` route), pinned by
    /// the file's SHA-256.
    Sha256(String),
    /// A bead-sourced spec.
    ///
    /// DRIFT IS JUDGED ON `body_sha256`, NEVER on `revision`. bd's revision
    /// is a WRITE TOKEN, not a spec digest: `bd update --claim`, a status
    /// change and a reclaim each mint a new one and the old value never
    /// returns, so a packet fenced on the token alone would call forged's
    /// own lease write drift the moment it resumed. The token still travels
    /// so [`crate::Ledger::claim_packet`] can re-pin the row to whatever bd
    /// reports now. OPAQUE: equality only — never ordered, parsed,
    /// incremented, or assumed positive.
    Revision {
        /// bd's `revision` as observed on this read.
        revision: String,
        /// SHA-256 over the rendered body the seat reads.
        body_sha256: String,
    },
}

/// Input to [`crate::Ledger::record_usage`].
#[derive(Debug, Clone, PartialEq)]
pub struct NewUsage {
    /// Owning run id.
    pub run_id: String,
    /// Packet attribution, when known.
    pub packet_id: Option<String>,
    /// Attempt attribution, when known.
    pub attempt_id: Option<i64>,
    /// Provider name.
    pub provider: String,
    /// Model name.
    pub model: String,
    /// Input tokens — token counts are the truth.
    pub input_tokens: u64,
    /// Output tokens.
    pub output_tokens: u64,
    /// Cache-read tokens, when reported.
    pub cache_read_tokens: Option<u64>,
    /// Cache-write tokens, when reported.
    pub cache_write_tokens: Option<u64>,
    /// Cost in USD — nullable by design.
    pub cost_usd: Option<f64>,
    /// How the cost was derived.
    pub pricing_basis: Option<String>,
    /// Rate-limit consumption, when reported.
    pub rate_limit_used_percent: Option<f64>,
    /// Server-side web searches, billed per call rather than per token.
    pub web_search_requests: Option<u64>,
}

/// One stored usage row, as [`crate::Ledger::list_usage`] returns it.
#[derive(Debug, Clone, PartialEq)]
pub struct UsageRecord {
    /// Owning run id.
    pub run_id: String,
    /// Packet attribution, when the recorder knew one.
    pub packet_id: Option<String>,
    /// Attempt attribution, when the recorder knew one.
    pub attempt_id: Option<i64>,
    /// Provider name.
    pub provider: String,
    /// Model name.
    pub model: String,
    /// Tokens billed at the uncached input rate.
    pub input_tokens: u64,
    /// Output tokens.
    pub output_tokens: u64,
    /// Cache-read tokens, when reported.
    pub cache_read_tokens: Option<u64>,
    /// Cache-write tokens, when reported.
    pub cache_write_tokens: Option<u64>,
    /// Cost in USD — NULL means unknown, never zero.
    pub cost_usd: Option<f64>,
    /// `billed` | `imputed_api_rate` | `none`.
    pub pricing_basis: Option<String>,
    /// Rate-limit consumption, when reported.
    pub rate_limit_used_percent: Option<f64>,
    /// Server-side web searches, billed per call rather than per token.
    pub web_search_requests: Option<u64>,
    /// When the row was recorded.
    pub ts: String,
}

/// Aggregate returned by [`crate::Ledger::usage_totals`].
#[derive(Debug, Clone, PartialEq)]
pub struct UsageTotals {
    /// Sum of `input_tokens`.
    pub input_tokens: u64,
    /// Sum of `output_tokens`.
    pub output_tokens: u64,
    /// Sum of `cache_read_tokens`, NULLs contributing 0.
    pub cache_read_tokens: u64,
    /// Sum of `cache_write_tokens`, NULLs contributing 0.
    pub cache_write_tokens: u64,
    /// Sum of non-null `cost_usd` values — never an invented cost.
    pub cost_usd_known: f64,
    /// How many rows had a NULL `cost_usd`.
    pub rows_missing_cost: u32,
}

/// A successful claim: the attempt row id and its fencing token.
#[derive(Debug, Clone, PartialEq)]
pub struct ClaimedAttempt {
    /// The new attempt's row id.
    pub attempt_id: i64,
    /// The fencing token (uuid v7).
    pub claim_token: String,
}

/// A fresh operation claim from [`crate::Ledger::begin_operation`].
#[derive(Debug, Clone, PartialEq)]
pub struct OperationTicket {
    /// The minted operation id (uuid v7).
    pub operation_id: String,
}

/// What [`crate::Ledger::begin_operation`] resolved to.
#[derive(Debug, Clone, PartialEq)]
pub enum OperationOutcome {
    /// The row was claimed; the caller performs the effect after this commit.
    Fresh(OperationTicket),
    /// A stored terminal envelope, replayed verbatim with `reused: true`.
    Replayed(forged_types::OperationResponse),
}

/// What [`crate::Ledger::acquire_merge_slot`] resolved to — contention is a
/// normal outcome, not an error.
#[derive(Debug, Clone, PartialEq)]
pub enum SlotOutcome {
    /// The caller holds the slot (original `acquired_at` if re-acquired).
    Acquired(MergeSlotRow),
    /// Someone else holds the slot.
    Held(MergeSlotRow),
}

/// Connection configuration observed on the writer thread's own connection —
/// the sanctioned seam member for test observability.
#[derive(Debug, Clone, PartialEq)]
pub struct Pragmas {
    /// `PRAGMA journal_mode`.
    pub journal_mode: String,
    /// `PRAGMA synchronous` (2 = FULL).
    pub synchronous: i64,
    /// `PRAGMA foreign_keys`.
    pub foreign_keys: bool,
    /// `PRAGMA busy_timeout` in milliseconds.
    pub busy_timeout_ms: i64,
    /// `PRAGMA user_version` — the last applied migration index.
    pub user_version: i64,
}
