//! Public row and support types for the wave-3/-4 seam.
//!
//! Every `*Row` struct carries one public field per column of its table, in
//! DDL order — TEXT → `String`, INTEGER → `i64`, REAL → `f64` (nullable →
//! `Option<_>`) — except state/stage/effect-class columns, which use the Rust
//! enums below (and [`Stage`] from forged-types).

use std::collections::HashMap;

use forged_types::{
    AdmissionCapacityV1, AdmissionDecisionV1, AdmissionInputsV1, AdmissionRateLimitV1,
    AdmissionResourceClass, AdmissionSpendV1, AdmissionSubjectKind, ErrorCode, ExecutionPackageV1,
    HerdrLayoutSubjectKind, HerdrLayoutSubjectV1, HerdrLayoutV1, HerdrPaneProjectionV1,
    HerdrProjectionLifecycle, HerdrProjectionTargetKind, HerdrSessionEvidenceSource,
    OwnedHerdrOwnerV1, OwnedHerdrSessionV1, OwnedHerdrSubjectKind, OwnedHerdrSubjectV1,
    ProviderHints, RunId, Stage,
};

use crate::error::{refused, LedgerError};

/// The canonical kind of one operator-authorized supervisor subject.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum DesiredSubjectKind {
    /// A slice run driven by `run drive`.
    Run,
    /// An epic driven by `epic drive`.
    Epic,
}

impl DesiredSubjectKind {
    /// The closed SQLite and wire spelling.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Run => "run",
            Self::Epic => "epic",
        }
    }
}

impl TryFrom<&str> for DesiredSubjectKind {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "run" => Ok(Self::Run),
            "epic" => Ok(Self::Epic),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown desired-work subject kind: {other:?}"),
            )),
        }
    }
}

/// The operator's durable intent for one submitted subject.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DesiredState {
    /// Keep a controller present until the subject reaches a durable stop.
    Running,
    /// Retain authorization but do not start a controller.
    Paused,
    /// Never start another controller for this subject.
    Stopped,
}

impl DesiredState {
    /// The closed SQLite and wire spelling.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Running => "running",
            Self::Paused => "paused",
            Self::Stopped => "stopped",
        }
    }
}

impl TryFrom<&str> for DesiredState {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "running" => Ok(Self::Running),
            "paused" => Ok(Self::Paused),
            "stopped" => Ok(Self::Stopped),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown desired state: {other:?}"),
            )),
        }
    }
}

/// The last durable result of reconciling one desired-work row.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DesiredReconcileOutcome {
    Authorized,
    Adopted,
    Restarting,
    Restarted,
    Backoff,
    Attention,
    Exhausted,
    Paused,
    Stopped,
    Terminal,
}

impl DesiredReconcileOutcome {
    /// The closed SQLite and wire spelling.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Authorized => "authorized",
            Self::Adopted => "adopted",
            Self::Restarting => "restarting",
            Self::Restarted => "restarted",
            Self::Backoff => "backoff",
            Self::Attention => "attention",
            Self::Exhausted => "exhausted",
            Self::Paused => "paused",
            Self::Stopped => "stopped",
            Self::Terminal => "terminal",
        }
    }
}

impl TryFrom<&str> for DesiredReconcileOutcome {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "authorized" => Ok(Self::Authorized),
            "adopted" => Ok(Self::Adopted),
            "restarting" => Ok(Self::Restarting),
            "restarted" => Ok(Self::Restarted),
            "backoff" => Ok(Self::Backoff),
            "attention" => Ok(Self::Attention),
            "exhausted" => Ok(Self::Exhausted),
            "paused" => Ok(Self::Paused),
            "stopped" => Ok(Self::Stopped),
            "terminal" => Ok(Self::Terminal),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown desired-work reconciliation outcome: {other:?}"),
            )),
        }
    }
}

/// One durable supervisor authorization and reconciliation record.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DesiredWorkRow {
    pub subject_kind: DesiredSubjectKind,
    pub subject_id: String,
    pub desired_state: DesiredState,
    pub control_revision: u64,
    pub controller_generation: u32,
    pub predecessor_generation: Option<u32>,
    pub restart_budget: u32,
    pub restart_used: u32,
    pub next_wake_at: Option<String>,
    pub last_progress_at: Option<String>,
    pub last_outcome: Option<DesiredReconcileOutcome>,
    pub last_error: Option<String>,
    pub exhausted_at: Option<String>,
    pub reconcile_token: Option<String>,
    pub reconcile_lease_until: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// A restart generation reserved under a desired-work reconciliation token.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DesiredRestartReservation {
    /// The finite restart budget admitted this generation.
    Reserved(DesiredWorkRow),
    /// No restart was admitted; the row is durably exhausted.
    Exhausted(DesiredWorkRow),
}

/// The terminal write for one claimed supervisor reconciliation.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DesiredReconcileUpdate {
    /// Optional control-state transition discovered from landed reality.
    pub desired_state: Option<DesiredState>,
    /// Durable classification reported to the operator.
    pub outcome: DesiredReconcileOutcome,
    /// Latest controller generation, when observation advanced it.
    pub controller_generation: Option<u32>,
    /// Generation proven dead before a replacement was admitted.
    pub predecessor_generation: Option<u32>,
    /// Exact persisted deadline; `None` parks the row until explicit control.
    pub next_wake_at: Option<String>,
    /// Latest observed progress evidence.
    pub last_progress_at: Option<String>,
    /// Durable diagnostic for backoff or attention.
    pub last_error: Option<String>,
    /// Closed supervisor attention reason to append, when this outcome needs
    /// durable intervention evidence. `None` is an ordinary outcome.
    pub attention_condition: Option<String>,
}

/// One durable retry record for a pending whole-run bead settlement. The
/// budget bounds MUTATING retries only; the read-only convergence probe is
/// not charged and outlives exhaustion.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BeadSettlementRetryRow {
    pub run_id: String,
    pub budget: u32,
    pub used: u32,
    pub next_wake_at: Option<String>,
    pub last_error: Option<String>,
    pub claim_token: Option<String>,
    pub claim_lease_until: Option<String>,
    /// Episode watermark: the newest pending event id this row has charged
    /// against or minted itself. Only a pending event NEWER than it — a
    /// fresh `run stop` settlement episode — may reset the budget.
    pub event_id: Option<i64>,
    /// The read-only probe's next due time; `None` means never probed.
    pub probe_wake_at: Option<String>,
    /// The backoff interval that produced `probe_wake_at`: 60s doubling,
    /// capped at 480s, reset to the floor when the live bead differs from
    /// the stored observation.
    pub probe_interval_s: Option<u32>,
    pub last_observed_status: Option<String>,
    pub last_observed_assignee: Option<String>,
    pub last_observed_revision: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// One run whose LATEST bead-settlement event is still pending — the durable
/// promise `run stop` recorded and never delivered.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PendingBeadSettlementRow {
    pub run_id: String,
    /// The latest pending event's append position.
    pub event_id: i64,
    /// The latest pending event's stored payload, verbatim.
    pub payload_json: String,
    /// The retry row's probe schedule, when one exists: the pass probes a
    /// run only when this is absent or due.
    pub probe_wake_at: Option<String>,
}

/// Closed lifecycle of one durable capacity reservation. Expiry moves a row
/// to `Orphaned`; it never frees capacity by itself.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AdmissionReservationState {
    Reserved,
    Active,
    Orphaned,
    Released,
}

impl AdmissionReservationState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Reserved => "reserved",
            Self::Active => "active",
            Self::Orphaned => "orphaned",
            Self::Released => "released",
        }
    }
}

impl TryFrom<&str> for AdmissionReservationState {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "reserved" => Ok(Self::Reserved),
            "active" => Ok(Self::Active),
            "orphaned" => Ok(Self::Orphaned),
            "released" => Ok(Self::Released),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown admission reservation state: {other:?}"),
            )),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AdmissionReservationRow {
    pub reservation_id: String,
    pub decision_id: String,
    pub work_key: String,
    pub subject_kind: AdmissionSubjectKind,
    pub subject_id: String,
    pub control_revision: u64,
    pub repository: String,
    pub provider: String,
    pub model: String,
    pub resource_class: AdmissionResourceClass,
    pub state: AdmissionReservationState,
    pub owner_kind: Option<String>,
    pub owner_id: Option<String>,
    pub recovery_deadline: String,
    pub last_error: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub released_at: Option<String>,
}

/// Durable fields needed to project one scheduler candidate. The packet and
/// package JSON are frozen ledger bytes, not filesystem reads.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AdmissionDurableCandidate {
    pub subject_kind: DesiredSubjectKind,
    pub subject_id: String,
    pub desired_state: DesiredState,
    pub control_revision: u64,
    pub next_wake_at: Option<String>,
    pub authorized_at: String,
    pub exhausted: bool,
    pub repository: Option<String>,
    pub bead_id: Option<String>,
    pub packet_id: Option<String>,
    pub packet_body_json: Option<String>,
    pub package_json: Option<String>,
    pub epic_started_json: Option<String>,
    pub epic_package_json: Option<String>,
    /// When an epic controller launches a child packet, the child's run is
    /// authorized by the parent epic's desired-work epoch rather than by an
    /// independently supervised run controller.
    pub delegated_run_id: Option<String>,
    pub delegated_repository: Option<String>,
}

/// Exact durable launch facts for one packet requested by an admission
/// snapshot. Provider fallback is already resolved against the active roster
/// revision and terminal attempt history inside the snapshot transaction.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AdmissionPacketFacts {
    pub packet_id: String,
    pub run_id: String,
    pub bead_id: String,
    pub repository: String,
    pub provider: String,
    pub model: String,
    pub effort: Option<String>,
    pub resource_class: AdmissionResourceClass,
}

/// One transaction-consistent ledger read for the admission projector.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AdmissionLedgerSnapshot {
    pub as_of: String,
    pub ledger_revision: String,
    pub candidates: Vec<AdmissionDurableCandidate>,
    pub packet_facts: Vec<AdmissionPacketFacts>,
    pub capacity: AdmissionCapacityV1,
    pub spend: Vec<AdmissionSpendV1>,
    pub latest_rate_limits: Vec<AdmissionRateLimitV1>,
    pub reservations: Vec<AdmissionReservationRow>,
    pub reservation_decisions: Vec<AdmissionDecisionV1>,
}

/// Atomic batch write requested after pure policy evaluation.
#[derive(Debug, Clone)]
pub struct AdmissionBatchWrite {
    pub inputs: AdmissionInputsV1,
    pub decisions: Vec<AdmissionDecisionV1>,
    pub recovery_deadline: String,
}

/// Which closed owner shape an owned Herdr row carries.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OwnedHerdrOwnerKind {
    Controller,
    Attempt,
}

impl OwnedHerdrOwnerKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Controller => "controller",
            Self::Attempt => "attempt",
        }
    }
}

impl TryFrom<&str> for OwnedHerdrOwnerKind {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "controller" => Ok(Self::Controller),
            "attempt" => Ok(Self::Attempt),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown owned Herdr owner kind: {other:?}"),
            )),
        }
    }
}

/// Durable lifecycle evidence for the command in an owned pane.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OwnedHerdrLifecycleState {
    Registered,
    CommandStarted,
    OwnerTerminal,
    OwnerDead,
}

impl OwnedHerdrLifecycleState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Registered => "registered",
            Self::CommandStarted => "command-started",
            Self::OwnerTerminal => "owner-terminal",
            Self::OwnerDead => "owner-dead",
        }
    }
}

impl TryFrom<&str> for OwnedHerdrLifecycleState {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "registered" => Ok(Self::Registered),
            "command-started" => Ok(Self::CommandStarted),
            "owner-terminal" => Ok(Self::OwnerTerminal),
            "owner-dead" => Ok(Self::OwnerDead),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown owned Herdr lifecycle state: {other:?}"),
            )),
        }
    }
}

/// Durable cleanup state. Only the schedulable states participate in due and
/// earliest-wake queries.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OwnedHerdrCleanupState {
    NotRequested,
    Pending,
    Leased,
    RetryWait,
    Attention,
    Released,
}

impl OwnedHerdrCleanupState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::NotRequested => "not-requested",
            Self::Pending => "pending",
            Self::Leased => "leased",
            Self::RetryWait => "retry-wait",
            Self::Attention => "attention",
            Self::Released => "released",
        }
    }
}

impl TryFrom<&str> for OwnedHerdrCleanupState {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "not-requested" => Ok(Self::NotRequested),
            "pending" => Ok(Self::Pending),
            "leased" => Ok(Self::Leased),
            "retry-wait" => Ok(Self::RetryWait),
            "attention" => Ok(Self::Attention),
            "released" => Ok(Self::Released),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown owned Herdr cleanup state: {other:?}"),
            )),
        }
    }
}

/// Why cleanup became eligible.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OwnedHerdrCleanupReason {
    CommandNotStarted,
    AttemptSettled,
    ControllerTerminal,
    ControllerDead,
    OrphanedSubmit,
}

impl OwnedHerdrCleanupReason {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::CommandNotStarted => "command-not-started",
            Self::AttemptSettled => "attempt-settled",
            Self::ControllerTerminal => "controller-terminal",
            Self::ControllerDead => "controller-dead",
            Self::OrphanedSubmit => "orphaned-submit",
        }
    }
}

impl TryFrom<&str> for OwnedHerdrCleanupReason {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "command-not-started" => Ok(Self::CommandNotStarted),
            "attempt-settled" => Ok(Self::AttemptSettled),
            "controller-terminal" => Ok(Self::ControllerTerminal),
            "controller-dead" => Ok(Self::ControllerDead),
            "orphaned-submit" => Ok(Self::OrphanedSubmit),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown owned Herdr cleanup reason: {other:?}"),
            )),
        }
    }
}

/// Verified close outcome. `PaneNotFound` is exact Herdr `pane_not_found`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OwnedHerdrCleanupRelease {
    Closed,
    PaneNotFound,
}

impl OwnedHerdrCleanupRelease {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Closed => "closed",
            Self::PaneNotFound => "pane-not-found",
        }
    }
}

impl TryFrom<&str> for OwnedHerdrCleanupRelease {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "closed" => Ok(Self::Closed),
            "pane-not-found" => Ok(Self::PaneNotFound),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown owned Herdr cleanup release: {other:?}"),
            )),
        }
    }
}

/// One row of migration 014, in DDL order.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OwnedHerdrSessionRow {
    pub ownership_id: String,
    pub schema: String,
    pub owner_kind: OwnedHerdrOwnerKind,
    pub subject_kind: OwnedHerdrSubjectKind,
    pub subject_id: String,
    pub run_id: Option<String>,
    pub packet_id: Option<String>,
    pub attempt_id: Option<i64>,
    pub claim_token: Option<String>,
    pub controller_generation: Option<u32>,
    pub pane_id: String,
    pub socket_path: String,
    pub protocol: u32,
    pub sentinel_path: String,
    pub lifecycle_state: OwnedHerdrLifecycleState,
    pub cleanup_state: OwnedHerdrCleanupState,
    pub cleanup_reason: Option<OwnedHerdrCleanupReason>,
    pub cleanup_release: Option<OwnedHerdrCleanupRelease>,
    pub cleanup_token: Option<String>,
    pub cleanup_lease_until: Option<String>,
    pub cleanup_retry_budget: u32,
    pub cleanup_retry_used: u32,
    pub next_cleanup_at: Option<String>,
    pub last_cleanup_error: Option<String>,
    pub registered_at: String,
    pub command_started_at: Option<String>,
    pub cleanup_requested_at: Option<String>,
    pub last_cleanup_attempt_at: Option<String>,
    pub released_at: Option<String>,
    pub updated_at: String,
    /// Nullable migration-017 join. Pre-layout and degraded placements have
    /// no value and are never inferred from workspace/tab labels.
    pub layout_id: Option<String>,
}

impl OwnedHerdrSessionRow {
    /// Reconstruct the exact immutable host identity without deriving any
    /// path or interpreting the opaque pane id.
    pub fn identity(&self) -> Result<OwnedHerdrSessionV1, LedgerError> {
        let subject = OwnedHerdrSubjectV1 {
            kind: self.subject_kind,
            id: self.subject_id.clone(),
        };
        let owner = match self.owner_kind {
            OwnedHerdrOwnerKind::Controller => OwnedHerdrOwnerV1::Controller {
                subject,
                generation: self.controller_generation.ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        "controller owner has no generation",
                    )
                })?,
            },
            OwnedHerdrOwnerKind::Attempt => OwnedHerdrOwnerV1::Attempt {
                subject,
                run_id: self.run_id.clone().ok_or_else(|| {
                    refused(ErrorCode::InvalidRequest, "attempt owner has no run")
                })?,
                packet_id: self.packet_id.clone().ok_or_else(|| {
                    refused(ErrorCode::InvalidRequest, "attempt owner has no packet")
                })?,
                attempt_id: self.attempt_id.ok_or_else(|| {
                    refused(ErrorCode::InvalidRequest, "attempt owner has no attempt")
                })?,
                claim_token: self.claim_token.clone().ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        "attempt owner has no claim token",
                    )
                })?,
                controller_generation: self.controller_generation,
            },
        };
        Ok(OwnedHerdrSessionV1 {
            schema: self.schema.clone(),
            ownership_id: self.ownership_id.clone(),
            owner,
            pane_id: self.pane_id.clone(),
            socket_path: self.socket_path.clone(),
            protocol: self.protocol,
            sentinel_path: self.sentinel_path.clone(),
            layout_id: self.layout_id.clone(),
        })
    }
}

/// Result of persisting a transient cleanup failure.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OwnedHerdrCleanupRetry {
    Scheduled(OwnedHerdrSessionRow),
    Exhausted(OwnedHerdrSessionRow),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrLayoutLifecycleState {
    Creating,
    Registered,
    Degraded,
    Replaced,
}

impl HerdrLayoutLifecycleState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Creating => "creating",
            Self::Registered => "registered",
            Self::Degraded => "degraded",
            Self::Replaced => "replaced",
        }
    }
}

impl TryFrom<&str> for HerdrLayoutLifecycleState {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "creating" => Ok(Self::Creating),
            "registered" => Ok(Self::Registered),
            "degraded" => Ok(Self::Degraded),
            "replaced" => Ok(Self::Replaced),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown Herdr layout lifecycle state: {other:?}"),
            )),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrLayoutDegradationReason {
    CreationAmbiguous,
    RegistrationFailed,
    VerificationMissing,
    VerificationMismatch,
    PlacementFailed,
}

impl HerdrLayoutDegradationReason {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::CreationAmbiguous => "creation-ambiguous",
            Self::RegistrationFailed => "registration-failed",
            Self::VerificationMissing => "verification-missing",
            Self::VerificationMismatch => "verification-mismatch",
            Self::PlacementFailed => "placement-failed",
        }
    }
}

impl TryFrom<&str> for HerdrLayoutDegradationReason {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "creation-ambiguous" => Ok(Self::CreationAmbiguous),
            "registration-failed" => Ok(Self::RegistrationFailed),
            "verification-missing" => Ok(Self::VerificationMissing),
            "verification-mismatch" => Ok(Self::VerificationMismatch),
            "placement-failed" => Ok(Self::PlacementFailed),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown Herdr layout degradation reason: {other:?}"),
            )),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrLayoutCleanupState {
    NotRequested,
    Pending,
    Leased,
    RetryWait,
    Attention,
    Released,
}

impl HerdrLayoutCleanupState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::NotRequested => "not-requested",
            Self::Pending => "pending",
            Self::Leased => "leased",
            Self::RetryWait => "retry-wait",
            Self::Attention => "attention",
            Self::Released => "released",
        }
    }
}

impl TryFrom<&str> for HerdrLayoutCleanupState {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "not-requested" => Ok(Self::NotRequested),
            "pending" => Ok(Self::Pending),
            "leased" => Ok(Self::Leased),
            "retry-wait" => Ok(Self::RetryWait),
            "attention" => Ok(Self::Attention),
            "released" => Ok(Self::Released),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown Herdr layout cleanup state: {other:?}"),
            )),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrLayoutCleanupReason {
    SubjectTerminal,
    LayoutReplaced,
    LayoutDegraded,
}

impl HerdrLayoutCleanupReason {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::SubjectTerminal => "subject-terminal",
            Self::LayoutReplaced => "layout-replaced",
            Self::LayoutDegraded => "layout-degraded",
        }
    }
}

impl TryFrom<&str> for HerdrLayoutCleanupReason {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "subject-terminal" => Ok(Self::SubjectTerminal),
            "layout-replaced" => Ok(Self::LayoutReplaced),
            "layout-degraded" => Ok(Self::LayoutDegraded),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown Herdr layout cleanup reason: {other:?}"),
            )),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrLayoutCleanupRelease {
    Closed,
    PaneNotFound,
}

impl HerdrLayoutCleanupRelease {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Closed => "closed",
            Self::PaneNotFound => "pane-not-found",
        }
    }
}

impl TryFrom<&str> for HerdrLayoutCleanupRelease {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "closed" => Ok(Self::Closed),
            "pane-not-found" => Ok(Self::PaneNotFound),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown Herdr layout cleanup release: {other:?}"),
            )),
        }
    }
}

/// One migration-017 row in DDL order. A creating or ambiguous row has no
/// locator; [`HerdrLayoutRow::identity`] accepts registered locators only.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrLayoutRow {
    pub layout_id: String,
    pub schema: String,
    pub revision: u32,
    pub subject_kind: HerdrLayoutSubjectKind,
    pub subject_id: String,
    pub socket_path: String,
    pub protocol: u32,
    pub workspace_id: String,
    pub tab_id: Option<String>,
    pub root_pane_id: Option<String>,
    pub display_label: String,
    pub lifecycle_state: HerdrLayoutLifecycleState,
    pub degradation_reason: Option<HerdrLayoutDegradationReason>,
    pub last_error: Option<String>,
    pub creation_token: Option<String>,
    pub creation_lease_until: Option<String>,
    pub mutation_token: Option<String>,
    pub mutation_lease_until: Option<String>,
    pub cleanup_state: HerdrLayoutCleanupState,
    pub cleanup_reason: Option<HerdrLayoutCleanupReason>,
    pub cleanup_release: Option<HerdrLayoutCleanupRelease>,
    pub cleanup_token: Option<String>,
    pub cleanup_lease_until: Option<String>,
    pub cleanup_retry_budget: u32,
    pub cleanup_retry_used: u32,
    pub next_cleanup_at: Option<String>,
    pub last_cleanup_error: Option<String>,
    pub predecessor_layout_id: Option<String>,
    pub created_at: String,
    pub registered_at: Option<String>,
    pub replaced_at: Option<String>,
    pub cleanup_requested_at: Option<String>,
    pub last_cleanup_attempt_at: Option<String>,
    pub released_at: Option<String>,
    pub updated_at: String,
}

impl HerdrLayoutRow {
    pub fn identity(&self) -> Result<HerdrLayoutV1, LedgerError> {
        let identity = HerdrLayoutV1 {
            schema: self.schema.clone(),
            layout_id: self.layout_id.clone(),
            revision: self.revision,
            subject: HerdrLayoutSubjectV1 {
                kind: self.subject_kind,
                id: self.subject_id.clone(),
            },
            socket_path: self.socket_path.clone(),
            protocol: self.protocol,
            workspace_id: self.workspace_id.clone(),
            tab_id: self.tab_id.clone().ok_or_else(|| {
                refused(
                    ErrorCode::OperationInProgress,
                    "Herdr layout has no tab locator",
                )
            })?,
            root_pane_id: self.root_pane_id.clone().ok_or_else(|| {
                refused(
                    ErrorCode::OperationInProgress,
                    "Herdr layout has no root-pane locator",
                )
            })?,
            display_label: self.display_label.clone(),
            predecessor_layout_id: self.predecessor_layout_id.clone(),
        };
        identity.validate().map_err(|error| {
            refused(
                ErrorCode::InvalidRequest,
                format!("invalid stored Herdr layout identity: {error}"),
            )
        })?;
        Ok(identity)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HerdrLayoutCreation {
    Reserved(HerdrLayoutRow),
    Existing(HerdrLayoutRow),
    Contended(HerdrLayoutRow),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HerdrLayoutCleanupRetry {
    Scheduled(HerdrLayoutRow),
    Exhausted(HerdrLayoutRow),
}

/// Durable state of one independent projection publication channel.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrProjectionPublicationState {
    NotRequested,
    Pending,
    Leased,
    RetryWait,
    Attention,
    Applied,
    Missing,
}

impl HerdrProjectionPublicationState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::NotRequested => "not-requested",
            Self::Pending => "pending",
            Self::Leased => "leased",
            Self::RetryWait => "retry-wait",
            Self::Attention => "attention",
            Self::Applied => "applied",
            Self::Missing => "missing",
        }
    }
}

impl TryFrom<&str> for HerdrProjectionPublicationState {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "not-requested" => Ok(Self::NotRequested),
            "pending" => Ok(Self::Pending),
            "leased" => Ok(Self::Leased),
            "retry-wait" => Ok(Self::RetryWait),
            "attention" => Ok(Self::Attention),
            "applied" => Ok(Self::Applied),
            "missing" => Ok(Self::Missing),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown Herdr projection publication state: {other:?}"),
            )),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HerdrProjectionChannel {
    Metadata,
    Lifecycle,
}

impl HerdrProjectionChannel {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Metadata => "metadata",
            Self::Lifecycle => "lifecycle",
        }
    }
}

/// Fully decoded migration-018 row.  Candidate and confirmation deliberately
/// remain separate, and there is no provider-session path/native source.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrPaneProjectionRow {
    pub identity: HerdrPaneProjectionV1,
    pub session_candidate: Option<String>,
    pub session_confirmed: Option<String>,
    pub session_evidence_source: Option<HerdrSessionEvidenceSource>,
    pub session_evidence_at: Option<String>,
    pub session_evidence_error: Option<String>,
    pub desired_revision: u64,
    pub desired_lifecycle: Option<HerdrProjectionLifecycle>,
    pub desired_release: bool,
    pub metadata_next_seq: u64,
    pub metadata_applied_seq: Option<u64>,
    pub metadata_applied_revision: Option<u64>,
    pub metadata_state: HerdrProjectionPublicationState,
    pub metadata_token: Option<String>,
    pub metadata_lease_until: Option<String>,
    pub metadata_retry_budget: u32,
    pub metadata_retry_used: u32,
    pub metadata_next_wake_at: Option<String>,
    pub metadata_last_error: Option<String>,
    pub metadata_last_attempt_at: Option<String>,
    pub metadata_applied_at: Option<String>,
    pub lifecycle_next_seq: u64,
    pub lifecycle_applied_seq: Option<u64>,
    pub lifecycle_applied_revision: Option<u64>,
    pub lifecycle_state: HerdrProjectionPublicationState,
    pub lifecycle_token: Option<String>,
    pub lifecycle_lease_until: Option<String>,
    pub lifecycle_retry_budget: u32,
    pub lifecycle_retry_used: u32,
    pub lifecycle_next_wake_at: Option<String>,
    pub lifecycle_last_error: Option<String>,
    pub lifecycle_last_attempt_at: Option<String>,
    pub lifecycle_applied_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl HerdrPaneProjectionRow {
    pub fn target_kind(&self) -> HerdrProjectionTargetKind {
        self.identity.target.kind()
    }
}

/// A run's lifecycle state (`runs.state`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RunState {
    /// The run accepts work.
    Active,
    /// The run was stopped with a reason.
    Stopped,
}

/// Why a whole run stopped (`runs.terminal_outcome`).
///
/// This is deliberately distinct from [`AttemptState::Stopped`]: an attempt
/// stop only retires one worker, while this value is the operator-visible
/// settlement of the complete run.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RunOutcome {
    /// Protocol work is clean and ready for delivery.
    Clean,
    /// Work cannot continue without resolving a blocker.
    Blocked,
    /// The run needs an explicit operator answer.
    InputRequired,
    /// The operator cancelled this run without declaring the Bead complete.
    Cancelled,
    /// The operator accepted a documented residual risk.
    AcceptedRisk,
    /// A named successor run replaced this generation.
    Superseded,
    /// Delivery landed and carries immutable PR and commit evidence.
    Landed,
}

/// Immutable evidence for one whole-run terminal projection.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RunSettlement {
    /// Operator-visible terminal outcome.
    pub outcome: RunOutcome,
    /// Durable explanation for the terminal decision.
    pub reason: String,
    /// Landed delivery PR, when applicable.
    pub delivery_pr: Option<u64>,
    /// Landed delivery commit, when applicable.
    pub delivery_sha: Option<String>,
    /// Successor run for a superseded settlement.
    pub superseded_by: Option<String>,
}

impl RunOutcome {
    /// The closed spelling stored in SQLite and exposed on the wire.
    pub fn as_str(self) -> &'static str {
        match self {
            RunOutcome::Clean => "clean",
            RunOutcome::Blocked => "blocked",
            RunOutcome::InputRequired => "input-required",
            RunOutcome::Cancelled => "cancelled",
            RunOutcome::AcceptedRisk => "accepted-risk",
            RunOutcome::Superseded => "superseded",
            RunOutcome::Landed => "landed",
        }
    }
}

impl TryFrom<&str> for RunOutcome {
    type Error = LedgerError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "clean" => Ok(RunOutcome::Clean),
            "blocked" => Ok(RunOutcome::Blocked),
            "input-required" => Ok(RunOutcome::InputRequired),
            "cancelled" => Ok(RunOutcome::Cancelled),
            "accepted-risk" => Ok(RunOutcome::AcceptedRisk),
            "superseded" => Ok(RunOutcome::Superseded),
            "landed" => Ok(RunOutcome::Landed),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown run outcome: {other:?}"),
            )),
        }
    }
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

/// Which scope a `revoking` marker was committed under — the durable record
/// of WHOSE revocation this is, and therefore which terminal exit resumes it.
///
/// `revoking` alone cannot say: a bead-scoped saga revocation and an
/// attempt-local operator stop write the identical state, so a stop whose
/// `kill_confirmed` failed would otherwise be indistinguishable from a dead
/// worker and get resumed through the bead-scoped reclaim it exists to
/// avoid. Written once, when the marker commits, and never changed.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RevokeScope {
    /// The reclaim saga: a dead or hung worker, whose bd lease the run wants
    /// back. Resumes through the full revoke order and ends at
    /// [`AttemptState::Reclaimed`].
    Bead,
    /// An operator's stop of ONE attempt. Resumes through confirmed death
    /// alone and ends at [`AttemptState::Stopped`], touching no lease.
    Attempt,
    /// The immutable stage wall-clock deadline expired. This marker fences
    /// provider effects until verified death, then exits as a failed
    /// transport attempt so the existing bounded retry policy remains the
    /// only retry authority.
    Deadline,
}

impl RevokeScope {
    /// The DDL string, the only spelling stored.
    pub fn as_str(self) -> &'static str {
        match self {
            RevokeScope::Bead => "bead",
            RevokeScope::Attempt => "attempt",
            RevokeScope::Deadline => "deadline",
        }
    }
}

impl TryFrom<&str> for RevokeScope {
    type Error = LedgerError;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        match s {
            "bead" => Ok(RevokeScope::Bead),
            "attempt" => Ok(RevokeScope::Attempt),
            "deadline" => Ok(RevokeScope::Deadline),
            other => Err(refused(
                ErrorCode::InvalidRequest,
                format!("unknown revoke scope: {other:?}"),
            )),
        }
    }
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
    /// `runs.terminal_outcome` — absent on active and legacy-stopped runs.
    pub terminal_outcome: Option<RunOutcome>,
    /// `runs.delivery_pr` — required for [`RunOutcome::Landed`].
    pub delivery_pr: Option<u64>,
    /// `runs.delivery_sha` — required for [`RunOutcome::Landed`].
    pub delivery_sha: Option<String>,
    /// `runs.superseded_by` — required for [`RunOutcome::Superseded`].
    pub superseded_by: Option<String>,
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
    /// `attempts.revoke_scope` — `None` until a `revoking` marker commits,
    /// and on every row written before the column existed. A reader that
    /// must route on it treats `None` as [`RevokeScope::Bead`]: the
    /// attempt-local stop did not exist when those rows were written, so
    /// every one of them is a saga revocation.
    pub revoke_scope: Option<RevokeScope>,
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

/// Immutable filesystem evidence joined one-to-one with an attempt.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AttemptArtifactRow {
    /// `attempt_artifacts.attempt_id` — also the table's primary key.
    pub attempt_id: i64,
    /// Redundant identity checked against the attempt's packet owner.
    pub run_id: String,
    /// Redundant identity checked against `attempts.packet_id`.
    pub packet_id: String,
    /// Closed manifest schema identifier.
    pub manifest_schema: String,
    /// Manifest path relative to this run's operator-scoped root.
    pub manifest_path: String,
    /// SHA-256 of the exact manifest bytes.
    pub manifest_sha256: String,
    /// Closed retention-class spelling copied from the manifest.
    pub retention_class: String,
    /// Time the join was first recorded.
    pub created_at: String,
}

/// Candidate one-to-one manifest join supplied by the artifact boundary.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NewAttemptArtifact {
    pub attempt_id: i64,
    pub run_id: String,
    pub packet_id: String,
    pub manifest_schema: String,
    pub manifest_path: String,
    pub manifest_sha256: String,
    pub retention_class: String,
}

/// Durable intent/result for an explicit attempt-artifact compaction.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AttemptArtifactCompactionRow {
    pub attempt_id: i64,
    pub operation_id: String,
    pub tombstone_path: String,
    pub tombstone_sha256: String,
    pub state: String,
    pub bytes_removed: Option<i64>,
    pub created_at: String,
    pub completed_at: Option<String>,
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

/// Immutable key for one exact review-finding delivery row.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReviewFindingDeliveryKey {
    pub run_id: String,
    pub repository_slug: String,
    pub pr_number: u64,
    pub review_epoch_kind: forged_types::ReviewEpochKind,
    pub review_epoch: u64,
    pub snapshot_sha256: String,
    pub finding_id: String,
}

/// Closed durable lifecycle of one review-finding delivery.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReviewFindingDeliveryState {
    Pending,
    Uncertain,
    Retryable,
    Delivered,
}

impl ReviewFindingDeliveryState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Uncertain => "uncertain",
            Self::Retryable => "retryable",
            Self::Delivered => "delivered",
        }
    }
}

/// Exact external outcome proving a delivered marker-bearing comment.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReviewFindingDeliveryOutcome {
    Posted,
    AlreadyPresent,
}

impl ReviewFindingDeliveryOutcome {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Posted => "posted",
            Self::AlreadyPresent => "already-present",
        }
    }
}

/// Immutable intent inserted before a review comment may be posted.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NewReviewFindingDelivery {
    pub key: ReviewFindingDeliveryKey,
    pub pr_url: String,
    pub canonical_finding_json: String,
    pub finding_sha256: String,
}

/// Fully decoded migration-019 review-finding delivery row.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReviewFindingDeliveryRow {
    pub key: ReviewFindingDeliveryKey,
    pub schema: String,
    pub pr_url: String,
    pub canonical_finding_json: String,
    pub finding_sha256: String,
    pub state: ReviewFindingDeliveryState,
    pub attempt_count: u64,
    pub last_error: Option<String>,
    pub external_outcome: Option<ReviewFindingDeliveryOutcome>,
    pub delivered_evidence: Option<String>,
    pub delivery_token: Option<String>,
    pub delivery_lease_until: Option<String>,
    pub delivered_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// Result of atomically claiming one undelivered finding.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ReviewFindingDeliveryClaim {
    Delivered(ReviewFindingDeliveryRow),
    Busy(ReviewFindingDeliveryRow),
    Claimed(ReviewFindingDeliveryRow),
}

/// One bounded ledger snapshot used to select review-publication content.
#[derive(Debug, Clone, PartialEq)]
pub struct ReviewPublicationSource {
    pub definition_backed: bool,
    pub packets: Vec<PacketRow>,
    pub completed_attempts: Vec<AttemptRow>,
    pub draft_pr_operation: Option<OperationRow>,
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

#[cfg(test)]
mod owned_herdr_type_tests {
    use super::*;

    #[test]
    fn owned_herdr_vocabulary_has_no_permissive_fallback() {
        assert!(OwnedHerdrOwnerKind::try_from("legacy").is_err());
        assert!(OwnedHerdrLifecycleState::try_from("unknown").is_err());
        assert!(OwnedHerdrCleanupState::try_from("closing-ish").is_err());
        assert!(OwnedHerdrCleanupReason::try_from("title-match").is_err());
        assert!(OwnedHerdrCleanupRelease::try_from("not-found").is_err());
    }
}
