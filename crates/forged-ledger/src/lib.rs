//! forged-ledger owns state.db DDL, the idempotent operation store, and the
//! attempt saga.
//!
//! Saga order is load-bearing: REVOKING commits durably before any external
//! kill or reclaim; `reclaimed` is reachable only from `revoking`.
//!
//! The fence has exactly three enforcement points:
//! 1. [`Ledger::begin_operation`] — entry: a token-bearing request refuses
//!    unless its attempt is `running`.
//! 2. [`Ledger::assert_attempt_live`] — immediately before an effect fires.
//! 3. [`Ledger::complete_operation`] — result landing: a revoked attempt
//!    cannot land results.
//!
//! All access goes through a blocking actor — a dedicated writer thread owns
//! the `rusqlite::Connection` — so the crate contains no async code at all
//! and no transaction can ever span an `.await` by construction. Callers in
//! async contexts wrap calls in `spawn_blocking` at their own layer.

mod admission;
mod artifacts;
mod attempts;
mod desired;
mod error;
mod events;
mod herdr_layouts;
mod herdr_projections;
mod history;
mod inventory;
mod ledger;
mod migrations;
mod observation;
mod operations;
mod owned_herdr;
mod packets;
mod provider_session_inventory;
mod review_delivery;
mod runs;
mod slots;
mod time;
mod types;
mod usage;
mod work;
mod work_identity;
mod work_lease;
mod work_settlement;

pub use error::LedgerError;
pub use herdr_layouts::HERDR_LAYOUT_CLEANUP_RETRY_BUDGET;
pub use herdr_projections::{ClaimedHerdrProjectionEffect, HERDR_PROJECTION_RETRY_BUDGET};
pub use history::{HistoryAttemptRow, HistorySnapshot, HISTORY_EVENT_KINDS};
pub use inventory::{InventorySnapshot, InventoryUsage, InventoryUsageSelection};
pub use ledger::{default_db_path, Ledger};
pub use observation::{
    EpicChildRunLink, EpicLinkedRunPhase, WorkObservationEvents, WorkObservationSnapshot,
    WORK_OBSERVATION_MAX_EVENT_LIMIT,
};
pub use owned_herdr::OWNED_HERDR_CLEANUP_RETRY_BUDGET;
pub use provider_session_inventory::{
    ProviderSessionInventoryAfter, ProviderSessionInventoryQuery, ProviderSessionInventorySnapshot,
    PROVIDER_SESSION_INVENTORY_EVENT_KINDS,
};
pub use types::{
    AdmissionBatchWrite, AdmissionDurableCandidate, AdmissionLedgerSnapshot,
    AdmissionReservationRow, AdmissionReservationState, AttemptArtifactCompactionRow,
    AttemptArtifactRow, AttemptRow, AttemptState, ClaimedAttempt, DesiredReconcileOutcome,
    DesiredReconcileUpdate, DesiredRestartReservation, DesiredState, DesiredSubjectKind,
    DesiredWorkRow, EffectClass, EventRow, HerdrLayoutCleanupReason, HerdrLayoutCleanupRelease,
    HerdrLayoutCleanupRetry, HerdrLayoutCleanupState, HerdrLayoutCreation,
    HerdrLayoutDegradationReason, HerdrLayoutLifecycleState, HerdrLayoutRow,
    HerdrPaneProjectionRow, HerdrProjectionChannel, HerdrProjectionPublicationState, MergeSlotRow,
    NewAttemptArtifact, NewPacket, NewReviewFindingDelivery, NewRun, NewRunDefinition, NewUsage,
    OperationOutcome, OperationRow, OperationState, OperationTicket, OwnedHerdrCleanupReason,
    OwnedHerdrCleanupRelease, OwnedHerdrCleanupRetry, OwnedHerdrCleanupState,
    OwnedHerdrLifecycleState, OwnedHerdrOwnerKind, OwnedHerdrSessionRow, PacketRow,
    PendingWorkSettlementRow, Pragmas, ReviewFindingDeliveryClaim, ReviewFindingDeliveryKey,
    ReviewFindingDeliveryOutcome, ReviewFindingDeliveryRow, ReviewFindingDeliveryState,
    ReviewPublicationSource, RevokeScope, RosterRevisionBatch, RosterRevisionRow, RunDefinitionRow,
    RunOutcome, RunRow, RunSettlement, RunState, SlotOutcome, SpecFence, UsageRecord, UsageTotals,
    WorkSettlementRetryRow,
};
pub use work::{
    ImportedWorkItem, NewWorkItem, WorkDepKind, WorkDepRow, WorkDependencyStatus, WorkImportReport,
    WorkItemFilters, WorkItemSnapshot, WorkKind, WorkRevisionCause, WorkSpecFields, WorkStatus,
    WORK_BLOCKED_CLAIM_REFUSAL, WORK_CLAIM_REFUSAL_PREFIX,
};
pub use work_lease::{work_reclaim_older_than, WorkLeaseRow, WorkReclaimOutcome, WORK_LEASE_TTL_S};
pub use work_settlement::{RetryErrorUpdate, WORK_SETTLEMENT_RETRY_BUDGET};
