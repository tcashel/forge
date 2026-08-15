//! Bounded cross-run history and spend projection contracts.
//!
//! History is deliberately an observational contract. Every subject carries
//! the exact durable [`crate::WorkIdentityV1`] used by current-state
//! projections; display labels never become selectors.

use serde::{Deserialize, Serialize};

use crate::WorkIdentityV1;

/// The only work-history schema understood by this version.
pub const WORK_HISTORY_SCHEMA_V1: &str = "forged.work-history/1";

/// Fixed bucket widths supported by the bounded history projection.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WorkHistoryBucket {
    Hour,
    Day,
    Week,
}

impl WorkHistoryBucket {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Hour => "hour",
            Self::Day => "day",
            Self::Week => "week",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "hour" => Some(Self::Hour),
            "day" => Some(Self::Day),
            "week" => Some(Self::Week),
            _ => None,
        }
    }
}

/// The one dimension a response may partition by.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WorkHistoryGroupBy {
    None,
    Repository,
    Epic,
    Stage,
    Provider,
}

impl WorkHistoryGroupBy {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::None => "none",
            Self::Repository => "repository",
            Self::Epic => "epic",
            Self::Stage => "stage",
            Self::Provider => "provider",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "none" => Some(Self::None),
            "repository" => Some(Self::Repository),
            "epic" => Some(Self::Epic),
            "stage" => Some(Self::Stage),
            "provider" => Some(Self::Provider),
            _ => None,
        }
    }
}

/// Canonical filters. Every value is an id, never a title or display label.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryFiltersV1 {
    pub repository: Option<String>,
    pub epic_id: Option<String>,
    pub subject_id: Option<String>,
}

/// The normalized half-open time window.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryWindowV1 {
    pub from: String,
    pub to: String,
    pub bucket: WorkHistoryBucket,
    pub bucket_count: u32,
}

/// Run-settlement outcomes, kept separate instead of flattened into one
/// terminal count.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistorySettlementCountsV1 {
    pub clean: u64,
    pub blocked: u64,
    pub input_required: u64,
    pub cancelled: u64,
    pub accepted_risk: u64,
    pub superseded: u64,
    pub landed: u64,
}

/// Usage provenance retained alongside known and missing cost.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryPricingV1 {
    /// Stored pricing basis, or the explicit `unknown` key for NULL.
    pub basis: String,
    pub rows: u64,
    pub cost_usd_known: f64,
    pub rows_missing_cost: u64,
}

/// Additive metrics for an aggregate, group, bucket, or subject.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryMetricsV1 {
    pub runs_started: u64,
    pub runs_settled: u64,
    pub settlements: WorkHistorySettlementCountsV1,
    pub epics_started: u64,
    pub epics_paused: u64,
    pub epics_resumed: u64,
    pub epic_final_prs: u64,
    pub attempts_started: u64,
    pub repeat_attempts: u64,
    pub attempt_state_transitions: u64,
    pub transitions_running: u64,
    pub transitions_completed: u64,
    pub transitions_failed: u64,
    pub transitions_revoking: u64,
    pub transitions_reclaimed: u64,
    pub transitions_stopped: u64,
    pub terminal_attempts: u64,
    pub attempts_completed: u64,
    pub attempts_failed: u64,
    pub attempts_reclaimed: u64,
    pub attempts_stopped: u64,
    pub rework_rate: Option<f64>,
    pub failure_rate: Option<f64>,
    pub escalated_runs: u64,
    pub runs_with_attempt_activity: u64,
    pub escalation_rate: Option<f64>,
    pub usage_rows: u64,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub cache_read_tokens: u64,
    pub cache_write_tokens: u64,
    pub web_search_requests: u64,
    pub cost_usd_known: f64,
    pub rows_missing_cost: u64,
    pub pricing: Vec<WorkHistoryPricingV1>,
}

/// One time bucket in a group series.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryBucketV1 {
    pub from: String,
    pub to: String,
    pub metrics: WorkHistoryMetricsV1,
}

/// One explicit group. `unknown` and `other` are real reserved keys.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistorySeriesV1 {
    pub key: String,
    pub label: String,
    pub epic_identity: Option<WorkIdentityV1>,
    pub metrics: WorkHistoryMetricsV1,
    pub buckets: Vec<WorkHistoryBucketV1>,
}

/// One bounded historical subject row.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistorySubjectV1 {
    pub identity: WorkIdentityV1,
    pub first_activity_at: String,
    pub last_activity_at: String,
    pub metrics: WorkHistoryMetricsV1,
}

/// Explicit limits and known degradation in the returned snapshot.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryCoverageV1 {
    pub durable_subjects: u64,
    pub returned_subjects: u64,
    pub legacy_stopped_without_settlement: u64,
    pub live_plan_subjects_excluded: bool,
    pub max_groups: u32,
    pub groups_combined_into_other: u64,
    pub degraded: bool,
    pub degradation_facts: Vec<String>,
}

/// Complete `forged.work-history/1` response body.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkHistoryV1 {
    pub schema: String,
    pub as_of: String,
    pub window: WorkHistoryWindowV1,
    pub group_by: WorkHistoryGroupBy,
    pub filters: WorkHistoryFiltersV1,
    pub coverage: WorkHistoryCoverageV1,
    pub metrics: WorkHistoryMetricsV1,
    pub series: Vec<WorkHistorySeriesV1>,
    pub subjects: Vec<WorkHistorySubjectV1>,
    pub next_cursor: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn request_enums_are_closed() {
        assert_eq!(
            WorkHistoryBucket::parse("hour"),
            Some(WorkHistoryBucket::Hour)
        );
        assert_eq!(WorkHistoryBucket::parse("fortnight"), None);
        assert_eq!(
            WorkHistoryGroupBy::parse("provider"),
            Some(WorkHistoryGroupBy::Provider)
        );
        assert_eq!(WorkHistoryGroupBy::parse("title"), None);
    }
}
