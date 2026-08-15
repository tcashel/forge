//! forged-types owns the shared wire contracts every forged crate codes
//! against: operation envelopes, error codes, canonical JSON, identifier
//! newtypes, and the work-packet schema.

pub mod admission;
pub mod attention;
pub mod canonical;
pub mod contract;
pub mod envelope;
pub mod error;
pub mod herdr_ownership;
pub mod ids;
pub mod packet;
pub mod work_identity;

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
    SeatExecutionV1, SeatId, SeatPurpose, EXECUTION_PACKAGE_SCHEMA_V1, PROFILE_SCHEMA_V1,
    RESOLVED_ROSTER_SCHEMA_V1, ROSTER_SCHEMA_V1,
};
pub use envelope::{OpError, OperationRequest, OperationResponse};
pub use error::ErrorCode;
pub use herdr_ownership::{
    OwnedHerdrOwnerV1, OwnedHerdrSessionV1, OwnedHerdrSubjectKind, OwnedHerdrSubjectV1,
    OWNED_HERDR_SESSION_SCHEMA_V1,
};
pub use ids::{claude_session_id, new_claim_token, RunId, RunIdError};
pub use packet::{
    AcceptedRisk, Deliverable, Finding, GateRow, Outcome, PacketColumns, PacketResult,
    ProviderHints, Sandbox, Severity, SpecAmendment, SpecRef, Stage, StageContract, Verdict,
    WorkPacket,
};
pub use work_identity::{
    normalize_repository_path, repository_label, work_display_title, WorkIdentityBeadV1,
    WorkIdentityContextV1, WorkIdentityRepositoryV1, WorkIdentitySource, WorkIdentitySubjectKind,
    WorkIdentitySubjectV1, WorkIdentityV1, WorkIdentityValidationError, WORK_IDENTITY_SCHEMA_V1,
};
