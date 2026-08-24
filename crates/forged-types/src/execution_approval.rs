//! Human execution approval bound to one exact launch tuple.

use serde::{Deserialize, Serialize};

use crate::{ProfileRef, RosterRef};

/// The only execution-approval schema understood by this binary.
pub const EXECUTION_APPROVAL_SCHEMA_V1: &str = "forged-execution-approval/1";

/// The kind of work the operator approved.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ExecutionApprovalSubjectKind {
    /// One reviewable slice.
    Slice,
    /// One Beads epic.
    Epic,
}

/// The complete start-and-submit action the operator approved.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ExecutionApprovalAction {
    /// Start and submit one slice run.
    RunStartSubmit,
    /// Start and submit one epic controller.
    EpicStartSubmit,
}

/// One immutable operator approval. The run- and epic-start boundaries check
/// every execution coordinate before retaining this record with the launch
/// bundle.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ExecutionApprovalV1 {
    /// Versioned wire schema.
    pub schema: String,
    /// Slice or epic.
    pub subject_kind: ExecutionApprovalSubjectKind,
    /// Exact Beads id.
    pub bead_id: String,
    /// Opaque Beads revision observed when approval was granted.
    pub observed_revision: String,
    /// Canonical absolute repository path.
    pub repository: String,
    /// Exact base ref.
    pub base_ref: String,
    /// Resolved profile reference.
    pub profile: ProfileRef,
    /// Resolved roster reference.
    pub roster: RosterRef,
    /// Exact lifecycle action authorized.
    pub action: ExecutionApprovalAction,
    /// Operator-supplied RFC 3339 timestamp.
    pub approved_at: String,
    /// Non-empty operator identity.
    pub actor: String,
    /// Short, non-secret approval basis.
    pub basis: String,
}
