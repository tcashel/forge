//! Human execution approval bound to one exact launch tuple.

use serde::{Deserialize, Serialize};

use crate::{ProfileRef, RosterRef};

/// Legacy reference-only approval schema, retained for stored-event decoding.
pub const EXECUTION_APPROVAL_SCHEMA_V1: &str = "forged-execution-approval/1";
/// The content-bound execution-approval schema required for new launches.
pub const EXECUTION_APPROVAL_SCHEMA_V2: &str = "forged-execution-approval/2";

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

/// One immutable operator approval bound to the exact compiled definition.
///
/// References remain useful display coordinates, but they are not immutable:
/// an operator can edit a named profile or roster without changing its name or
/// version. These three digests therefore bind approval to the exact bytes the
/// launch freezes.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ExecutionApprovalV2 {
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
    /// Exact remote object id resolved for the base ref.
    pub base_sha: String,
    /// Resolved profile reference.
    pub profile: ProfileRef,
    /// SHA-256 of the exact frozen profile definition.
    pub profile_sha256: String,
    /// Resolved roster reference.
    pub roster: RosterRef,
    /// SHA-256 of the exact frozen resolved roster.
    pub roster_sha256: String,
    /// SHA-256 of the complete frozen execution package.
    pub package_sha256: String,
    /// SHA-256 of the canonical frozen child inventory for an epic launch.
    /// Required for new epic approvals and absent for slice approvals and
    /// legacy in-flight epic approvals created before inventory binding.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub inventory_sha256: Option<String>,
    /// Exact lifecycle action authorized.
    pub action: ExecutionApprovalAction,
    /// Operator-supplied RFC 3339 timestamp.
    pub approved_at: String,
    /// Non-empty operator identity.
    pub actor: String,
    /// Short, non-secret approval basis.
    pub basis: String,
}
