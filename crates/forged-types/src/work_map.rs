//! Bounded cross-authority work graph contracts.
//!
//! The graph relates current work-plan truth to immutable durable execution
//! without collapsing either authority. Values that remain owned by an
//! existing contract are embedded as their typed JSON representation instead
//! of being redefined here.

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{WorkIdentityV1, WorkRefV1, WorkTitleV1};

pub const WORK_MAP_SCHEMA_V1: &str = "forged.work-map/1";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkMapScopeKind {
    Operator,
    Repository,
    Epic,
}

impl WorkMapScopeKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Operator => "operator",
            Self::Repository => "repository",
            Self::Epic => "epic",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "operator" => Some(Self::Operator),
            "repository" => Some(Self::Repository),
            "epic" => Some(Self::Epic),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkMapGroup {
    NeedsMe,
    ReadyToMerge,
    Running,
    StalledOrRecoverable,
    Planned,
}

impl WorkMapGroup {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::NeedsMe => "needs-me",
            Self::ReadyToMerge => "ready-to-merge",
            Self::Running => "running",
            Self::StalledOrRecoverable => "stalled-or-recoverable",
            Self::Planned => "planned",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "needs-me" => Some(Self::NeedsMe),
            "ready-to-merge" => Some(Self::ReadyToMerge),
            "running" => Some(Self::Running),
            "stalled-or-recoverable" => Some(Self::StalledOrRecoverable),
            "planned" => Some(Self::Planned),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkMapSource {
    Durable,
    LivePlan,
}

impl WorkMapSource {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Durable => "durable",
            Self::LivePlan => "live-plan",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "durable" => Some(Self::Durable),
            "live-plan" => Some(Self::LivePlan),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkMapEdgeKind {
    ExecutionOf,
    Blocks,
    ParentChild,
    Related,
    DiscoveredFrom,
    /// Native `supersedes` provenance, kept as itself rather than collapsed
    /// into `related`: additive to `forged.work-map/1`, which prints edge
    /// kinds generically.
    Supersedes,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapScopeV1 {
    pub kind: WorkMapScopeKind,
    pub repository: Option<String>,
    pub epic_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapCapturedAtV1 {
    pub ledger: String,
    #[serde(rename = "beads")]
    pub work: Option<String>,
    pub history: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapNodeV1 {
    pub work_ref: WorkRefV1,
    pub source: String,
    pub context_only: bool,
    pub identity: Option<WorkIdentityV1>,
    /// `None` where this surface resolved no title at all — a boundary node
    /// has no identity to resolve one against, and that is a real state.
    pub title_source: Option<WorkTitleV1>,
    pub repository: Option<String>,
    pub epic_id: Option<String>,
    pub plan: Value,
    pub queue: Value,
    pub execution: Value,
    pub history: Value,
    pub attention: Vec<Value>,
    pub detail_target: Value,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapEdgeV1 {
    pub source: WorkRefV1,
    pub target: WorkRefV1,
    pub kind: WorkMapEdgeKind,
    pub context_only: bool,
    pub evidence: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapGraphHealthV1 {
    pub healthy: bool,
    pub cycle_nodes: Vec<WorkRefV1>,
    pub dangling_targets: Vec<WorkRefV1>,
    pub missing_blocker_status: Vec<Value>,
}

/// Node tallies for one Work Map projection.
///
/// `epics` counts `identity.subject.kind`, not `work_ref.kind`: an epic is
/// minted as a `plan` reference so its edges resolve, so `epics` deliberately
/// overlaps `plan` and `plan + runs + epics == nodes` does not hold.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapCountsV1 {
    pub nodes: u64,
    pub plan: u64,
    pub runs: u64,
    pub epics: u64,
    pub context_only: u64,
    pub edges: u64,
    pub attention: u64,
    pub history_attached: u64,
    pub history_unattached: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkMapV1 {
    pub schema: String,
    pub scope: WorkMapScopeV1,
    pub filters: Value,
    pub focus: Option<WorkRefV1>,
    pub captured_at: WorkMapCapturedAtV1,
    pub source_health: Value,
    pub nodes: Vec<WorkMapNodeV1>,
    pub edges: Vec<WorkMapEdgeV1>,
    pub graph_health: WorkMapGraphHealthV1,
    pub history_coverage: Value,
    pub counts: WorkMapCountsV1,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn request_vocabularies_are_closed() {
        assert_eq!(
            WorkMapScopeKind::parse("epic"),
            Some(WorkMapScopeKind::Epic)
        );
        assert_eq!(WorkMapScopeKind::parse("team"), None);
        assert_eq!(
            WorkMapGroup::parse("stalled-or-recoverable"),
            Some(WorkMapGroup::StalledOrRecoverable)
        );
        assert_eq!(WorkMapGroup::parse("completed"), None);
        assert_eq!(
            WorkMapSource::parse("live-plan"),
            Some(WorkMapSource::LivePlan)
        );
        assert_eq!(WorkMapSource::parse("filesystem"), None);
    }
}
