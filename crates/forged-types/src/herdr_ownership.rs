//! Durable ownership identity for Herdr panes created by Forged.
//!
//! This contract contains only immutable identity. Lifecycle and cleanup
//! progress live in forged-ledger so a host response can never rewrite who a
//! pane belongs to.

use serde::{Deserialize, Serialize};

/// The only ownership schema migration 014 accepts.
pub const OWNED_HERDR_SESSION_SCHEMA_V1: &str = "forged.owned-herdr-session/1";

/// The submitted controller epoch an owned pane belongs to.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum OwnedHerdrSubjectKind {
    Run,
    Epic,
}

impl OwnedHerdrSubjectKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Run => "run",
            Self::Epic => "epic",
        }
    }
}

/// Exact logical subject identity. An attempt in an epic child names the
/// parent epic here while retaining its concrete run identity below.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OwnedHerdrSubjectV1 {
    pub kind: OwnedHerdrSubjectKind,
    pub id: String,
}

/// The two and only two owners of Forged-created Herdr panes.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(
    tag = "kind",
    rename_all = "kebab-case",
    rename_all_fields = "camelCase",
    deny_unknown_fields
)]
pub enum OwnedHerdrOwnerV1 {
    /// A detached run or epic controller. Generation zero is never a
    /// detached controller identity.
    Controller {
        subject: OwnedHerdrSubjectV1,
        generation: u32,
    },
    /// A provider attempt. Foreground/direct drive has no controller
    /// generation; detached controllers always record their exact epoch.
    Attempt {
        subject: OwnedHerdrSubjectV1,
        run_id: String,
        packet_id: String,
        attempt_id: i64,
        claim_token: String,
        controller_generation: Option<u32>,
    },
}

impl OwnedHerdrOwnerV1 {
    pub fn subject(&self) -> &OwnedHerdrSubjectV1 {
        match self {
            Self::Controller { subject, .. } | Self::Attempt { subject, .. } => subject,
        }
    }

    pub fn owner_kind(&self) -> &'static str {
        match self {
            Self::Controller { .. } => "controller",
            Self::Attempt { .. } => "attempt",
        }
    }
}

/// Immutable identity registered after Herdr reserves a pane and before any
/// Forged command is sent to it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OwnedHerdrSessionV1 {
    pub schema: String,
    pub ownership_id: String,
    pub owner: OwnedHerdrOwnerV1,
    /// Opaque. It may contain shell-unsafe and path-unsafe characters.
    pub pane_id: String,
    /// Exact socket used to reserve this pane.
    pub socket_path: String,
    /// Exact Herdr protocol negotiated on that socket.
    pub protocol: u32,
    /// Exact host-selected sentinel path; never derived from `pane_id`.
    pub sentinel_path: String,
    /// Exact durable layout used for placement. Legacy, degraded, and plain
    /// workspace placements deliberately carry no join.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub layout_id: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn owner_shapes_and_vocabulary_are_closed() {
        let attempt = serde_json::json!({
            "kind": "attempt",
            "subject": {"kind": "run", "id": "run-1"},
            "runId": "run-1",
            "packetId": "run-1/implement/1",
            "attemptId": 7,
            "claimToken": "claim-7",
            "controllerGeneration": null
        });
        assert!(serde_json::from_value::<OwnedHerdrOwnerV1>(attempt).is_ok());
        assert!(
            serde_json::from_value::<OwnedHerdrOwnerV1>(serde_json::json!({
                "kind": "legacy-pane",
                "subject": {"kind": "run", "id": "run-1"}
            }))
            .is_err()
        );
        assert!(serde_json::from_value::<OwnedHerdrSubjectKind>(serde_json::json!("job")).is_err());
    }

    #[test]
    fn attempt_owner_has_an_exact_camel_case_round_trip() {
        let value = serde_json::json!({
            "kind": "attempt",
            "subject": {"kind": "epic", "id": "epic-1"},
            "runId": "child-1",
            "packetId": "child-1/implement/1",
            "attemptId": 9,
            "claimToken": "claim-9",
            "controllerGeneration": 3
        });
        let owner: OwnedHerdrOwnerV1 = serde_json::from_value(value.clone()).expect("decode");
        assert_eq!(serde_json::to_value(owner).expect("encode"), value);
        assert!(
            serde_json::from_value::<OwnedHerdrOwnerV1>(serde_json::json!({
                "kind": "attempt",
                "subject": {"kind": "run", "id": "run-1"},
                "run_id": "run-1",
                "packetId": "run-1/implement/1",
                "attemptId": 1,
                "claimToken": "claim-1",
                "controllerGeneration": null
            }))
            .is_err()
        );
    }
}
