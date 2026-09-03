//! Stable error codes crossing the forged wire boundary.

use serde::{Deserialize, Serialize};

/// The closed set of error codes forged surfaces to callers.
///
/// Serialized as SCREAMING_SNAKE_CASE strings; the set is a wire contract, so
/// variants are appended, never renamed or removed.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode {
    InvalidRequest,
    RunNotFound,
    PacketNotClaimable,
    StaleClaimToken,
    IdempotencyConflict,
    OperationInProgress,
    SpecDrift,
    WorktreeDirty,
    PrBaseMismatch,
    DefaultBranchForbidden,
    HostUnavailable,
    HerdrProtocolMismatch,
    ProviderSpawnFailed,
    // Historical bead spellings are frozen wire contracts. Keep the Rust
    // vocabulary current while preserving the exact serialized codes.
    #[serde(rename = "BEADS_CONTENTION")]
    WorkContention,
    #[serde(rename = "BEAD_LEASE_HELD")]
    WorkLeaseHeld,
    #[serde(rename = "BEADS_ERROR")]
    WorkError,
    GraphScopeTooLarge,
    GhError,
    Internal,
    /// The run's controller record lacks durable driver identity, so no
    /// death fence is possible: settlement requires the explicit
    /// `run adjudicate-settlement` decision, never a retry.
    AdjudicationRequired,
    /// `work ready --all` cannot return more than the bounded frontier cap.
    FrontierTooLarge,
}

#[cfg(test)]
mod tests {
    use super::*;

    const ALL: [(ErrorCode, &str); 21] = [
        (ErrorCode::InvalidRequest, "INVALID_REQUEST"),
        (ErrorCode::RunNotFound, "RUN_NOT_FOUND"),
        (ErrorCode::PacketNotClaimable, "PACKET_NOT_CLAIMABLE"),
        (ErrorCode::StaleClaimToken, "STALE_CLAIM_TOKEN"),
        (ErrorCode::IdempotencyConflict, "IDEMPOTENCY_CONFLICT"),
        (ErrorCode::OperationInProgress, "OPERATION_IN_PROGRESS"),
        (ErrorCode::SpecDrift, "SPEC_DRIFT"),
        (ErrorCode::WorktreeDirty, "WORKTREE_DIRTY"),
        (ErrorCode::PrBaseMismatch, "PR_BASE_MISMATCH"),
        (
            ErrorCode::DefaultBranchForbidden,
            "DEFAULT_BRANCH_FORBIDDEN",
        ),
        (ErrorCode::HostUnavailable, "HOST_UNAVAILABLE"),
        (ErrorCode::HerdrProtocolMismatch, "HERDR_PROTOCOL_MISMATCH"),
        (ErrorCode::ProviderSpawnFailed, "PROVIDER_SPAWN_FAILED"),
        (ErrorCode::WorkContention, "BEADS_CONTENTION"),
        (ErrorCode::WorkLeaseHeld, "BEAD_LEASE_HELD"),
        (ErrorCode::WorkError, "BEADS_ERROR"),
        (ErrorCode::GraphScopeTooLarge, "GRAPH_SCOPE_TOO_LARGE"),
        (ErrorCode::GhError, "GH_ERROR"),
        (ErrorCode::Internal, "INTERNAL"),
        (ErrorCode::AdjudicationRequired, "ADJUDICATION_REQUIRED"),
        (ErrorCode::FrontierTooLarge, "FRONTIER_TOO_LARGE"),
    ];

    #[test]
    fn serializes_to_exactly_the_twenty_one_screaming_snake_strings() {
        assert_eq!(ALL.len(), 21);
        for (code, expected) in ALL {
            let json = serde_json::to_value(code).expect("serializes");
            assert_eq!(json, serde_json::Value::String(expected.to_owned()));
        }
    }

    #[test]
    fn round_trips_every_variant() {
        for (code, _) in ALL {
            let text = serde_json::to_string(&code).expect("serializes");
            let back: ErrorCode = serde_json::from_str(&text).expect("deserializes");
            assert_eq!(back, code);
        }
    }

    #[test]
    fn rejects_unknown_codes() {
        assert!(serde_json::from_str::<ErrorCode>("\"NOT_A_CODE\"").is_err());
        assert!(serde_json::from_str::<ErrorCode>("\"invalid_request\"").is_err());
    }
}
