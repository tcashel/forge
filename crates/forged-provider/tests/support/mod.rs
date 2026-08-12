//! Shared support for the forged-provider golden tests.
//!
//! `sample_packet()` mirrors the literal field values of the private
//! `#[cfg(test)]` helper in `crates/forged-types/src/packet.rs`, which is
//! deliberately not importable.

#![allow(dead_code)]

use std::path::PathBuf;

use forged_types::{
    Deliverable, ProviderHints, Sandbox, SpecRef, Stage, StageContract, WorkPacket,
};

/// A packet with the same literal field values as forged-types' own test
/// sample: claude/opus hints, effort high, workspace-write sandbox.
pub fn sample_packet() -> WorkPacket {
    WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: "pkt-1".to_owned(),
        run_id: "run-1".to_owned(),
        bead_id: "bead-1".to_owned(),
        stage: Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: SpecRef {
            path: "specs/bead-1.md".to_owned(),
            sha256: "cafe".to_owned(),
        },
        worktree: PathBuf::from("/tmp/worktrees/run-1"),
        branch: "feat/bead-1".to_owned(),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "build it".to_owned(),
            gate_commands: vec!["cargo test --workspace".to_owned()],
            deliverable: Deliverable::CommitsInWorktree,
            budget_s: 3600,
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: ProviderHints {
            provider: "claude".to_owned(),
            model: "opus".to_owned(),
            effort: Some("high".to_owned()),
            sandbox: Sandbox::WorkspaceWrite,
        },
        field_notes: vec!["watch the seam".to_owned()],
    }
}
