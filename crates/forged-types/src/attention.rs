//! Closed operator-attention wire contract.
//!
//! Attention is a projection over durable domain truth, not a second work
//! state machine. Stable ids let every surface name the same condition while
//! occurrence ids prevent an acknowledgement or disposition from leaking
//! onto later causal evidence.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

pub const ATTENTION_ITEM_SCHEMA_V1: &str = "forged.attention-item/1";

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AttentionSubjectKind {
    Run,
    Epic,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AttentionCondition {
    InputRequired,
    Blocked,
    BeadsSettlementPending,
    Revoking,
    Quarantined,
    MergeApproval,
    MissingCost,
    ControllerDead,
    RestartBudgetExhausted,
    FailedGate,
    RetryExhausted,
    ProviderDegraded,
    AmbiguousEffect,
    MissingEvidence,
    ReviewerDisagreement,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AttentionSeverity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AttentionOwner {
    Human,
    LeadAgent,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AttentionState {
    Open,
    Acknowledged,
    Resolved,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AttentionEvidenceKind {
    Event,
    DesiredWork,
    Attempt,
    Operation,
    AdmissionDecision,
    Reservation,
    ArtifactManifest,
    PullRequest,
    Bead,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AttentionActionCode {
    ProvideInput,
    ResolveBlocker,
    ReconcileBeads,
    ReclaimAttempt,
    AdjudicateQuarantine,
    MergePullRequest,
    RepairPricing,
    RecoverController,
    ReauthorizeWork,
    RepairGate,
    ReviseRoster,
    WaitForProvider,
    AdjudicateEffect,
    RepairEvidence,
    AdjudicateReview,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AttentionResolutionDisposition {
    Fixed,
    AcceptedRisk,
    AcceptedUnknown,
    Superseded,
    Automatic,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttentionEvidenceRefV1 {
    pub kind: AttentionEvidenceKind,
    pub id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttentionRecommendedActionV1 {
    pub code: AttentionActionCode,
    pub text: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttentionAcknowledgementV1 {
    pub actor: String,
    pub at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttentionResolutionV1 {
    pub actor: String,
    pub disposition: AttentionResolutionDisposition,
    pub note: String,
    pub at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AttentionItemV1 {
    pub schema: String,
    /// Compatibility alias for pre-V1 consumers; equals `subject_id`.
    #[serde(rename = "id")]
    pub legacy_id: String,
    /// Compatibility alias (`slice` or `epic`) for the original rail.
    #[serde(rename = "kind")]
    pub legacy_kind: String,
    pub attention_id: String,
    pub occurrence_id: String,
    pub subject_kind: AttentionSubjectKind,
    pub subject_id: String,
    pub repository: Option<String>,
    pub condition: AttentionCondition,
    pub severity: AttentionSeverity,
    pub owner: AttentionOwner,
    pub state: AttentionState,
    pub opened_at: String,
    pub updated_at: String,
    pub detail: String,
    /// Bounded compatibility evidence. New consumers use `evidence_refs`.
    pub evidence: serde_json::Value,
    pub evidence_refs: Vec<AttentionEvidenceRefV1>,
    pub recommended_action: AttentionRecommendedActionV1,
    pub acknowledgement: Option<AttentionAcknowledgementV1>,
    pub resolution: Option<AttentionResolutionV1>,
}

fn digest(parts: &[&str]) -> String {
    let mut hasher = Sha256::new();
    for part in parts {
        hasher.update((part.len() as u64).to_be_bytes());
        hasher.update(part.as_bytes());
    }
    hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

/// Stable identity for one subject/condition across recurrences.
pub fn attention_id(
    subject_kind: AttentionSubjectKind,
    subject_id: &str,
    condition: AttentionCondition,
) -> String {
    let kind = serde_json::to_string(&subject_kind).expect("closed attention subject kind");
    let condition = serde_json::to_string(&condition).expect("closed attention condition");
    digest(&[
        ATTENTION_ITEM_SCHEMA_V1,
        kind.trim_matches('"'),
        subject_id,
        condition.trim_matches('"'),
    ])
}

/// Identity for one causal occurrence under a stable attention id.
pub fn attention_occurrence_id(attention_id: &str, causal_source: &str) -> String {
    digest(&[ATTENTION_ITEM_SCHEMA_V1, attention_id, causal_source])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn closed_contract_rejects_unknown_values_and_fields() {
        assert!(serde_json::from_str::<AttentionCondition>("\"needs-coffee\"").is_err());
        assert!(serde_json::from_str::<AttentionOwner>("\"bot\"").is_err());
        let evidence = r#"{"kind":"event","id":"42","extra":true}"#;
        assert!(serde_json::from_str::<AttentionEvidenceRefV1>(evidence).is_err());
    }

    #[test]
    fn stable_identity_changes_only_at_the_promised_boundaries() {
        let id = attention_id(
            AttentionSubjectKind::Run,
            "run-1",
            AttentionCondition::MissingCost,
        );
        assert_eq!(
            id,
            attention_id(
                AttentionSubjectKind::Run,
                "run-1",
                AttentionCondition::MissingCost
            )
        );
        assert_ne!(
            id,
            attention_id(
                AttentionSubjectKind::Run,
                "run-2",
                AttentionCondition::MissingCost
            )
        );
        assert_eq!(
            attention_occurrence_id(&id, "usage:7"),
            attention_occurrence_id(&id, "usage:7")
        );
        assert_ne!(
            attention_occurrence_id(&id, "usage:7"),
            attention_occurrence_id(&id, "usage:8")
        );
    }
}
