//! forged-types owns the shared wire contracts every forged crate codes
//! against: operation envelopes, error codes, canonical JSON, identifier
//! newtypes, and the work-packet schema.

pub mod admission;
pub mod attention;
pub mod canonical;
pub mod contract;
pub mod controller_env;
pub mod envelope;
pub mod error;
pub mod herdr_layout;
pub mod herdr_ownership;
pub mod herdr_projection;
pub mod ids;
pub mod packet;
pub mod provider_session_inventory;
pub mod review_publication;
pub mod work_history;
pub mod work_identity;
pub mod work_map;
pub mod work_ref;

pub use admission::{
    AdmissionCandidateV1, AdmissionCapacityV1, AdmissionDecisionV1, AdmissionInputsV1,
    AdmissionOutcome, AdmissionRateLimitV1, AdmissionReason, AdmissionResourceClass,
    AdmissionSpendV1, AdmissionSubjectKind, ADMISSION_DECISION_SCHEMA_V1,
    ADMISSION_INPUTS_SCHEMA_V1,
};
pub use attention::{
    attention_id, attention_occurrence_id, AttentionAcknowledgementV1, AttentionActionCode,
    AttentionCondition, AttentionEvidenceKind, AttentionEvidenceRefV1, AttentionItemV1,
    AttentionOwner, AttentionRecommendedActionV1, AttentionResolutionDisposition,
    AttentionResolutionV1, AttentionSeverity, AttentionState, AttentionSubjectKind,
    ATTENTION_ITEM_SCHEMA_V1,
};
pub use canonical::{canonical_json_bytes, parse_canonical, request_sha256, CanonicalError};
pub use contract::{
    Capability, DefinitionError, EscalationTrigger, ExecutionPackageV1, ExecutionPolicyV1,
    HostPolicyV1, ProfileDefinitionV1, ProfileRef, ProtocolRef, ProviderCandidateV1,
    ResolvedRosterV1, RoleId, RosterDefinitionV1, RosterRef, RosterRevisionV1, SeatDefinitionV1,
    SeatExecutionV1, SeatId, SeatPurpose, DEFAULT_TERMINATION_GRACE_S, EXECUTION_PACKAGE_SCHEMA_V1,
    MAX_STAGE_BUDGET_S, MAX_TERMINATION_GRACE_S, PROFILE_SCHEMA_V1, RESOLVED_ROSTER_SCHEMA_V1,
    ROSTER_SCHEMA_V1,
};
pub use controller_env::CONTROLLER_ENV;
pub use envelope::{OpError, OperationRequest, OperationResponse};
pub use error::ErrorCode;
pub use herdr_layout::{
    HerdrLayoutSubjectKind, HerdrLayoutSubjectV1, HerdrLayoutV1, HerdrLayoutValidationError,
    HERDR_LAYOUT_LABEL_MAX_BYTES, HERDR_LAYOUT_SCHEMA_V1,
};
pub use herdr_ownership::{
    OwnedHerdrOwnerV1, OwnedHerdrSessionV1, OwnedHerdrSubjectKind, OwnedHerdrSubjectV1,
    OWNED_HERDR_SESSION_SCHEMA_V1,
};
pub use herdr_projection::{
    herdr_projection_names, validate_provider_session_id, HerdrPaneProjectionV1,
    HerdrProjectionLifecycle, HerdrProjectionTargetKind, HerdrProjectionTargetV1,
    HerdrProjectionValidationError, HerdrSessionEvidenceSource, HERDR_PANE_PROJECTION_SCHEMA_V1,
    HERDR_PROJECTION_TITLE_MAX_BYTES, HERDR_PROJECTION_TOKEN_MAX, HERDR_PROJECTION_VALUE_MAX_BYTES,
};
pub use ids::{claude_session_id, new_claim_token, RunId, RunIdError};
pub use packet::{
    AcceptedRisk, Deliverable, Finding, GateRow, NativeBeadSpecV1, Outcome, PacketColumns,
    PacketResult, PlanTraceabilityV1, ProviderHints, Sandbox, Severity, SpecAmendment, SpecRef,
    Stage, StageContract, Verdict, WorkPacket,
};
pub use provider_session_inventory::{
    ProviderSessionActivity, ProviderSessionAttemptV1, ProviderSessionDesiredWorkV1,
    ProviderSessionDiagnosticAction, ProviderSessionEvidenceV1, ProviderSessionHostMode,
    ProviderSessionInventoryCoverageV1, ProviderSessionInventoryFiltersV1,
    ProviderSessionInventoryRowV1, ProviderSessionInventorySummaryV1, ProviderSessionInventoryV1,
    ProviderSessionLegacyHerdrV1, ProviderSessionOwnedHerdrV1, ProviderSessionOwnedMutableV1,
    ProviderSessionProjectionMutableV1, ProviderSessionProjectionV1,
    ProviderSessionPublicationChannelV1, ProviderSessionRecovery,
    PROVIDER_SESSION_INVENTORY_SCHEMA_V1,
};
pub use review_publication::{
    github_repository_from_pr_url, ReviewEpochKind, ReviewEpochV1, ReviewPublicationFindingStatus,
    ReviewPublicationFindingV1, ReviewPublicationNoop, ReviewPublicationTargetV1,
    ReviewPublicationV1, REVIEW_PUBLICATION_SCHEMA_V1,
};
pub use work_history::{
    WorkHistoryBucket, WorkHistoryBucketV1, WorkHistoryCoverageV1, WorkHistoryFiltersV1,
    WorkHistoryGroupBy, WorkHistoryMetricsV1, WorkHistoryPricingV1, WorkHistorySeriesV1,
    WorkHistorySettlementCountsV1, WorkHistorySubjectV1, WorkHistoryV1, WorkHistoryWindowV1,
    WORK_HISTORY_SCHEMA_V1,
};
pub use work_identity::{
    normalize_repository_path, repository_label, resolve_work_title, work_display_title,
    WorkIdentityBeadV1, WorkIdentityContextV1, WorkIdentityRepositoryV1, WorkIdentitySource,
    WorkIdentitySubjectKind, WorkIdentitySubjectV1, WorkIdentityV1, WorkIdentityValidationError,
    WorkTitleSource, WorkTitleV1, WORK_IDENTITY_SCHEMA_V1,
};
pub use work_map::{
    WorkMapCapturedAtV1, WorkMapCountsV1, WorkMapEdgeKind, WorkMapEdgeV1, WorkMapGraphHealthV1,
    WorkMapGroup, WorkMapNodeV1, WorkMapScopeKind, WorkMapScopeV1, WorkMapSource, WorkMapV1,
    WORK_MAP_SCHEMA_V1,
};
pub use work_ref::{WorkRefKind, WorkRefV1, WorkRefValidationError, WORK_REF_SCHEMA_V1};
