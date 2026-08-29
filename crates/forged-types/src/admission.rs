//! Versioned scheduler inputs and durable admission decisions.
//!
//! The scheduler contract deliberately contains only durable ledger facts and
//! the bounded work projection. Process identity and filesystem state are
//! reconciler concerns and must never leak into these values.

use serde::{Deserialize, Serialize};

pub const ADMISSION_INPUTS_SCHEMA_V1: &str = "forged.admission-inputs/1";
pub const ADMISSION_DECISION_SCHEMA_V1: &str = "forged.admission-decision/1";

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AdmissionSubjectKind {
    Run,
    Epic,
    Packet,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AdmissionResourceClass {
    Read,
    RepositoryWrite,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AdmissionOutcome {
    Admitted,
    Deferred,
    Ineligible,
}

/// Closed, machine-actionable explanation for a scheduling decision.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AdmissionReason {
    CapacityAvailable,
    TotalCapacity,
    ProviderCapacity,
    RepositoryWriteCapacity,
    TokenCeiling,
    KnownCostCeiling,
    MissingCost,
    RateLimitCeiling,
    StaleRateLimit,
    #[serde(rename = "bead-unavailable")]
    WorkUnavailable,
    #[serde(rename = "bead-malformed")]
    WorkMalformed,
    #[serde(rename = "bead-not-runnable")]
    WorkNotRunnable,
    RepositoryMismatch,
    Unauthorized,
    DesiredNotRunning,
    Terminal,
    InputRequired,
    Exhausted,
    Superseded,
    ReservationRecovery,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdmissionCandidateV1 {
    pub subject_kind: AdmissionSubjectKind,
    pub subject_id: String,
    pub control_revision: u64,
    #[serde(rename = "beadId")]
    pub work_id: String,
    #[serde(rename = "beadRevision")]
    pub work_revision: Option<String>,
    #[serde(rename = "beadStatus")]
    pub work_status: Option<String>,
    pub priority: Option<i64>,
    pub repository: String,
    #[serde(rename = "beadRepository")]
    pub work_repository: Option<String>,
    /// Bounded/sanitized collection failure, when the one work batch was
    /// unavailable. It is evidence, never permission to guess.
    pub input_error: Option<String>,
    pub desired_wake_at: Option<String>,
    /// Frozen work may predate provider selection or be malformed. Absence is
    /// explicit and always defers; an empty string is never a capacity bucket.
    pub provider: Option<String>,
    pub model: Option<String>,
    pub resource_class: AdmissionResourceClass,
    pub authorized_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdmissionCapacityV1 {
    pub total_active: u32,
    pub provider_active: std::collections::BTreeMap<String, u32>,
    pub model_active: std::collections::BTreeMap<String, u32>,
    pub repository_write_active: std::collections::BTreeMap<String, u32>,
}

/// Provider/model usage represented with integers so the complete input is
/// canonicalizable. Money is USD millionths; missing cost remains explicit.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdmissionSpendV1 {
    pub provider: String,
    pub model: String,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub known_cost_microusd: u64,
    pub rows_missing_cost: u32,
}

/// The newest observation is selected by monotonically increasing usage id,
/// never timestamp ordering. Percent is stored in thousandths of a percent.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdmissionRateLimitV1 {
    pub provider: String,
    pub model: String,
    pub usage_id: i64,
    pub used_millipercent: Option<u32>,
    pub observed_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdmissionInputsV1 {
    pub schema: String,
    pub as_of: String,
    pub policy_revision: String,
    /// Hash of the ledger facts whose capacity is revalidated by the writer.
    pub ledger_revision: String,
    pub candidates: Vec<AdmissionCandidateV1>,
    pub capacity: AdmissionCapacityV1,
    pub spend: Vec<AdmissionSpendV1>,
    pub latest_rate_limits: Vec<AdmissionRateLimitV1>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdmissionDecisionV1 {
    pub schema: String,
    pub batch_id: String,
    pub subject_kind: AdmissionSubjectKind,
    pub subject_id: String,
    pub control_revision: u64,
    pub repository: String,
    pub priority: Option<i64>,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub resource_class: AdmissionResourceClass,
    pub outcome: AdmissionOutcome,
    pub reason: AdmissionReason,
    /// Human-readable field-level evidence for malformed or unrunnable work.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reason_detail: Option<String>,
    pub policy_revision: String,
    pub evidence: AdmissionCapacityV1,
    pub next_eligible_wake_at: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decision_vocabulary_is_closed() {
        assert!(serde_json::from_str::<AdmissionOutcome>("\"maybe\"").is_err());
        assert!(serde_json::from_str::<AdmissionReason>("\"capacity-ish\"").is_err());
        assert!(serde_json::from_str::<AdmissionResourceClass>("\"shell\"").is_err());
    }
}
