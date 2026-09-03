//! Durable, provider-neutral inventory of execution sessions.
//!
//! The inventory is intentionally diagnostic.  Pane locators, provider
//! session identifiers, durable ownership, and recovery state are distinct
//! facts; none of them implies that an attachment or control operation is
//! currently available.

use serde::{Deserialize, Serialize};

use crate::{HerdrPaneProjectionV1, OwnedHerdrSessionV1, Stage, WorkIdentityV1};

pub const PROVIDER_SESSION_INVENTORY_SCHEMA_V1: &str = "forged.provider-session-inventory/1";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProviderSessionActivity {
    Running,
    Revoking,
    Completed,
    Failed,
    Reclaimed,
    Stopped,
}

impl ProviderSessionActivity {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Running => "running",
            Self::Revoking => "revoking",
            Self::Completed => "completed",
            Self::Failed => "failed",
            Self::Reclaimed => "reclaimed",
            Self::Stopped => "stopped",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "running" => Some(Self::Running),
            "revoking" => Some(Self::Revoking),
            "completed" => Some(Self::Completed),
            "failed" => Some(Self::Failed),
            "reclaimed" => Some(Self::Reclaimed),
            "stopped" => Some(Self::Stopped),
            _ => None,
        }
    }

    pub fn is_active(self) -> bool {
        matches!(self, Self::Running | Self::Revoking)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProviderSessionRecovery {
    Healthy,
    Scheduled,
    Attention,
    Exhausted,
    Terminal,
    NotSubmitted,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProviderSessionHostMode {
    OwnedHerdr,
    Process,
    LegacyHerdr,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProviderSessionDiagnosticAction {
    None,
    InspectWork,
    InspectController,
    InspectSession,
    InspectProjection,
    ResolveAttention,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionInventoryFiltersV1 {
    pub run_id: Option<String>,
    pub epic_id: Option<String>,
    pub repository: Option<String>,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub activity: Option<ProviderSessionActivity>,
    pub include_historical: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionAttemptV1 {
    pub activity: ProviderSessionActivity,
    pub claimant: String,
    pub revoke_reason: Option<String>,
    pub revoke_scope: Option<String>,
    pub fail_note: Option<String>,
    pub started_at: String,
    pub updated_at: String,
    pub last_heartbeat_at: Option<String>,
    pub ended_at: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionDesiredWorkV1 {
    pub subject_kind: String,
    pub subject_id: String,
    pub desired_state: String,
    pub control_revision: u64,
    pub controller_generation: u32,
    pub predecessor_generation: Option<u32>,
    pub reconciliation_outcome: Option<String>,
    pub restart_budget: u32,
    pub restart_used: u32,
    pub next_wake_at: Option<String>,
    pub last_progress_at: Option<String>,
    pub last_error: Option<String>,
    pub exhausted_at: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionOwnedMutableV1 {
    pub lifecycle_state: String,
    pub cleanup_state: String,
    pub cleanup_reason: Option<String>,
    pub cleanup_release: Option<String>,
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
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionOwnedHerdrV1 {
    pub identity: OwnedHerdrSessionV1,
    pub mutable: ProviderSessionOwnedMutableV1,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionPublicationChannelV1 {
    pub next_sequence: u64,
    pub applied_sequence: Option<u64>,
    pub applied_revision: Option<u64>,
    pub state: String,
    pub retry_budget: u32,
    pub retry_used: u32,
    pub next_wake_at: Option<String>,
    pub last_error: Option<String>,
    pub last_attempt_at: Option<String>,
    pub applied_at: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionEvidenceV1 {
    pub candidate: Option<String>,
    pub confirmed: Option<String>,
    pub source: Option<String>,
    pub observed_at: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionProjectionMutableV1 {
    pub desired_revision: u64,
    pub desired_lifecycle: Option<String>,
    pub desired_release: bool,
    pub metadata: ProviderSessionPublicationChannelV1,
    pub lifecycle: ProviderSessionPublicationChannelV1,
    pub provider_session: ProviderSessionEvidenceV1,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionProjectionV1 {
    pub identity: HerdrPaneProjectionV1,
    pub mutable: ProviderSessionProjectionMutableV1,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionLegacyHerdrV1 {
    pub pane_id: String,
    pub socket_path: Option<String>,
    pub status_path: Option<String>,
    pub controller_generation: Option<u32>,
    pub layout_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionInventoryRowV1 {
    pub run_id: String,
    pub packet_id: String,
    pub attempt_id: i64,
    pub epic_id: Option<String>,
    pub identity: WorkIdentityV1,
    pub repository: String,
    pub stage: Stage,
    pub provider: String,
    pub model: String,
    pub attempt: ProviderSessionAttemptV1,
    pub recovery: ProviderSessionRecovery,
    pub desired_work: Option<ProviderSessionDesiredWorkV1>,
    pub pending_interventions: u64,
    pub host_mode: ProviderSessionHostMode,
    pub owned_herdr: Option<ProviderSessionOwnedHerdrV1>,
    pub legacy_herdr: Option<ProviderSessionLegacyHerdrV1>,
    pub projection: Option<ProviderSessionProjectionV1>,
    pub provider_session_id: Option<String>,
    pub recommended_action: ProviderSessionDiagnosticAction,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionInventoryCoverageV1 {
    pub shown: u64,
    pub total: u64,
    pub truncated: bool,
    pub next_cursor: Option<String>,
    pub missing_work_identity: u64,
    pub missing_repository: u64,
    pub missing_desired_work: u64,
    pub missing_owned_projection: u64,
    pub legacy_herdr_rows: u64,
    pub process_rows: u64,
    pub unknown_host_rows: u64,
    pub degradation_facts: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionInventorySummaryV1 {
    pub total_matched: u64,
    pub returned: u64,
    pub active: u64,
    pub historical: u64,
    pub owned_herdr: u64,
    pub process: u64,
    pub legacy_herdr: u64,
    pub unknown_host: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderSessionInventoryV1 {
    pub schema: String,
    pub as_of: String,
    pub filters: ProviderSessionInventoryFiltersV1,
    pub coverage: ProviderSessionInventoryCoverageV1,
    pub summary: ProviderSessionInventorySummaryV1,
    pub rows: Vec<ProviderSessionInventoryRowV1>,
    pub next_cursor: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn activity_vocabulary_is_closed() {
        for value in [
            "running",
            "revoking",
            "completed",
            "failed",
            "reclaimed",
            "stopped",
        ] {
            assert_eq!(
                ProviderSessionActivity::parse(value).unwrap().as_str(),
                value
            );
        }
        assert_eq!(ProviderSessionActivity::parse("working"), None);
        assert_eq!(ProviderSessionActivity::parse("unknown"), None);
    }
}
