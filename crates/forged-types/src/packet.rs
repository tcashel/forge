//! Work packets and packet results — the `forged.packet/1` wire contract
//! between the orchestrator and provider-run stages.

use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// The pipeline stage a packet drives.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Stage {
    Implement,
    ReviewClaude,
    ReviewCodex,
    Fix,
}

/// The spec a packet implements, pinned against edits under it.
///
/// A bead-sourced spec pins the bead's opaque `revision`; a file-sourced one
/// — the deprecated `--spec <path>` route — pins the file's content hash.
/// `path` is where the seat reads the bytes either way.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecRef {
    pub path: String,
    pub sha256: String,
    /// The bead revision this packet is pinned to; absent on a file-sourced
    /// spec. OPAQUE: compared for equality only, never ordered or parsed.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revision: Option<String>,
}

/// What a stage must hand back to count as done.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Deliverable {
    CommitsInWorktree,
    ReviewBlock,
    FixCommitsPushed,
}

/// The obligations a packet places on its stage.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StageContract {
    pub instructions: String,
    pub gate_commands: Vec<String>,
    pub deliverable: Deliverable,
    pub budget_s: u32,
}

/// Filesystem access granted to the provider process.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Sandbox {
    ReadOnly,
    WorkspaceWrite,
}

/// Which provider/model should run the packet, and how.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderHints {
    pub provider: String,
    pub model: String,
    pub effort: Option<String>,
    pub sandbox: Sandbox,
}

/// One unit of dispatched work, schema `forged.packet/1`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkPacket {
    pub schema: String,
    pub packet_id: String,
    pub run_id: String,
    pub bead_id: String,
    pub stage: Stage,
    /// Semantic topology identity. Absent only on legacy v0 packets.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub execution: Option<crate::SeatExecutionV1>,
    /// Temporary v0 storage-lane sequence. Absent on legacy packets, whose
    /// sequence is the final packet-id segment.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lane_seq: Option<i64>,
    pub spec: SpecRef,
    pub worktree: PathBuf,
    pub branch: String,
    pub base_ref: String,
    pub contract: StageContract,
    pub result_schema: String,
    pub provider_hints: ProviderHints,
    pub field_notes: Vec<String>,
}

impl WorkPacket {
    /// The row-storage projection of this packet: the wire form minus the
    /// spec ref, which `packets` carries as its own columns. A packet row
    /// never stores a value twice.
    pub fn stored_body(&self) -> Result<String, serde_json::Error> {
        let mut value = serde_json::to_value(self)?;
        if let serde_json::Value::Object(map) = &mut value {
            map.remove("spec");
        }
        serde_json::to_string(&value)
    }

    /// Rebuild a packet from a stored body and the spec ref its row pins.
    /// A body written before the projection still carries `spec`; the row's
    /// columns win, because they are what the claim fence reads.
    pub fn from_stored_body(body_json: &str, spec: SpecRef) -> Result<Self, serde_json::Error> {
        let mut value: serde_json::Value = serde_json::from_str(body_json)?;
        if let serde_json::Value::Object(map) = &mut value {
            map.insert("spec".to_owned(), serde_json::to_value(spec)?);
        }
        serde_json::from_value(value)
    }
}

/// A reviewer's overall call on a packet.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Verdict {
    Approve,
    RequestChanges,
    Block,
}

/// How bad a review finding is.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Severity {
    Blocker,
    High,
    Medium,
    Low,
}

/// A single review finding.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Finding {
    pub severity: Severity,
    pub file: Option<String>,
    pub line: Option<u32>,
    pub message: String,
}

/// Stage-specific outcome payloads.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum Outcome {
    Implement {
        implemented: bool,
        commits_ahead: u32,
        summary: String,
        gate_state: Option<String>,
        note: Option<String>,
    },
    Review {
        verdict: Verdict,
        summary: String,
        findings: Vec<Finding>,
        available: bool,
    },
    Fix {
        applied: bool,
        summary: String,
    },
}

/// What a stage handed back for a packet.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PacketResult {
    pub schema: String,
    pub packet_id: String,
    pub outcome: Outcome,
}

/// One executed gate command and what it did.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GateRow {
    pub command: String,
    pub cwd: String,
    pub exit_code: Option<i32>,
    pub duration_ms: u64,
    pub timed_out: bool,
    pub stdout_preview: String,
    pub stderr_preview: String,
    pub artifact_path: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn round_trip<T>(value: &T)
    where
        T: Serialize + serde::de::DeserializeOwned + PartialEq + std::fmt::Debug,
    {
        let text = serde_json::to_string(value).expect("serializes");
        let back: T = serde_json::from_str(&text).expect("deserializes");
        assert_eq!(&back, value);
    }

    fn sample_packet() -> WorkPacket {
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
                revision: None,
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

    #[test]
    fn stage_serializes_lowercase() {
        let pairs = [
            (Stage::Implement, "\"implement\""),
            (Stage::ReviewClaude, "\"reviewclaude\""),
            (Stage::ReviewCodex, "\"reviewcodex\""),
            (Stage::Fix, "\"fix\""),
        ];
        for (stage, expected) in pairs {
            assert_eq!(serde_json::to_string(&stage).expect("serializes"), expected);
            round_trip(&stage);
        }
    }

    #[test]
    fn enums_serialize_camel_case() {
        assert_eq!(
            serde_json::to_value(Deliverable::CommitsInWorktree).expect("serializes"),
            json!("commitsInWorktree")
        );
        assert_eq!(
            serde_json::to_value(Sandbox::WorkspaceWrite).expect("serializes"),
            json!("workspaceWrite")
        );
        assert_eq!(
            serde_json::to_value(Verdict::RequestChanges).expect("serializes"),
            json!("requestChanges")
        );
        assert_eq!(
            serde_json::to_value(Severity::Blocker).expect("serializes"),
            json!("blocker")
        );
    }

    #[test]
    fn spec_ref_round_trips() {
        round_trip(&SpecRef {
            path: "specs/x.md".to_owned(),
            sha256: "beef".to_owned(),
            revision: None,
        });
        round_trip(&SpecRef {
            path: "specs/x.md".to_owned(),
            sha256: "beef".to_owned(),
            revision: Some("-6192208415116251521".to_owned()),
        });
    }

    #[test]
    fn stage_contract_round_trips_with_camel_case_fields() {
        let contract = StageContract {
            instructions: "do the thing".to_owned(),
            gate_commands: vec!["cargo build".to_owned()],
            deliverable: Deliverable::ReviewBlock,
            budget_s: 900,
        };
        round_trip(&contract);
        let value = serde_json::to_value(&contract).expect("serializes");
        assert_eq!(value["gateCommands"][0], json!("cargo build"));
        assert_eq!(value["budgetS"], json!(900));
    }

    #[test]
    fn provider_hints_round_trip() {
        round_trip(&ProviderHints {
            provider: "codex".to_owned(),
            model: "gpt".to_owned(),
            effort: None,
            sandbox: Sandbox::ReadOnly,
        });
    }

    #[test]
    fn work_packet_round_trips_with_camel_case_fields() {
        let packet = sample_packet();
        round_trip(&packet);
        let value = serde_json::to_value(&packet).expect("serializes");
        assert_eq!(value["packetId"], json!("pkt-1"));
        assert_eq!(value["runId"], json!("run-1"));
        assert_eq!(value["beadId"], json!("bead-1"));
        assert_eq!(value["baseRef"], json!("main"));
        assert_eq!(value["resultSchema"], json!("forged.result/1"));
        assert_eq!(value["providerHints"]["sandbox"], json!("workspaceWrite"));
        assert_eq!(value["fieldNotes"][0], json!("watch the seam"));
        assert_eq!(value["spec"]["sha256"], json!("cafe"));
    }

    #[test]
    fn the_stored_body_omits_the_spec_the_row_carries_as_columns() {
        let mut packet = sample_packet();
        packet.spec.revision = Some("-6192208415116251521".to_owned());
        let body = packet.stored_body().expect("stored body");
        let value: serde_json::Value = serde_json::from_str(&body).expect("parses");
        assert!(
            value.get("spec").is_none(),
            "the spec ref lives in packet columns, never in body_json: {body}"
        );
        assert_eq!(
            WorkPacket::from_stored_body(&body, packet.spec.clone()).expect("rehydrates"),
            packet,
            "rehydrating with the row's spec must reproduce the packet exactly"
        );
    }

    #[test]
    fn a_body_written_before_the_projection_still_rehydrates_from_its_columns() {
        // Legacy rows carry the whole packet, spec included. The columns are
        // what the claim fence reads, so they win.
        let packet = sample_packet();
        let legacy = serde_json::to_string(&packet).expect("legacy body");
        let pinned = SpecRef {
            path: "specs/bead-1.md".to_owned(),
            sha256: "cafe".to_owned(),
            revision: Some("77".to_owned()),
        };
        let rehydrated = WorkPacket::from_stored_body(&legacy, pinned.clone()).expect("rehydrates");
        assert_eq!(rehydrated.spec, pinned);
    }

    #[test]
    fn finding_round_trips() {
        round_trip(&Finding {
            severity: Severity::High,
            file: Some("src/lib.rs".to_owned()),
            line: Some(42),
            message: "seam violated".to_owned(),
        });
        round_trip(&Finding {
            severity: Severity::Low,
            file: None,
            line: None,
            message: "nit".to_owned(),
        });
    }

    #[test]
    fn implement_outcome_round_trips_with_camel_case_fields() {
        let result = PacketResult {
            schema: "forged.result/1".to_owned(),
            packet_id: "pkt-1".to_owned(),
            outcome: Outcome::Implement {
                implemented: true,
                commits_ahead: 3,
                summary: "built the slice".to_owned(),
                gate_state: Some("pass".to_owned()),
                note: None,
            },
        };
        round_trip(&result);
        let value = serde_json::to_value(&result).expect("serializes");
        assert_eq!(value["outcome"]["implement"]["commitsAhead"], json!(3));
        assert_eq!(value["outcome"]["implement"]["gateState"], json!("pass"));
    }

    #[test]
    fn review_outcome_round_trips() {
        let result = PacketResult {
            schema: "forged.result/1".to_owned(),
            packet_id: "pkt-2".to_owned(),
            outcome: Outcome::Review {
                verdict: Verdict::RequestChanges,
                summary: "two highs".to_owned(),
                findings: vec![Finding {
                    severity: Severity::High,
                    file: Some("src/main.rs".to_owned()),
                    line: Some(7),
                    message: "unchecked exit".to_owned(),
                }],
                available: true,
            },
        };
        round_trip(&result);
        let value = serde_json::to_value(&result).expect("serializes");
        assert_eq!(
            value["outcome"]["review"]["verdict"],
            json!("requestChanges")
        );
        assert_eq!(
            value["outcome"]["review"]["findings"][0]["severity"],
            json!("high")
        );
    }

    #[test]
    fn fix_outcome_round_trips() {
        round_trip(&PacketResult {
            schema: "forged.result/1".to_owned(),
            packet_id: "pkt-3".to_owned(),
            outcome: Outcome::Fix {
                applied: false,
                summary: "nothing to fix".to_owned(),
            },
        });
    }

    #[test]
    fn gate_row_round_trips_with_camel_case_fields() {
        let row = GateRow {
            command: "cargo clippy --workspace --all-targets".to_owned(),
            cwd: "/tmp/worktrees/run-1".to_owned(),
            exit_code: Some(0),
            duration_ms: 1200,
            timed_out: false,
            stdout_preview: "ok".to_owned(),
            stderr_preview: String::new(),
            artifact_path: "gates/clippy.log".to_owned(),
        };
        round_trip(&row);
        let value = serde_json::to_value(&row).expect("serializes");
        assert_eq!(value["exitCode"], json!(0));
        assert_eq!(value["durationMs"], json!(1200));
        assert_eq!(value["timedOut"], json!(false));
        assert_eq!(value["stdoutPreview"], json!("ok"));
        assert_eq!(value["stderrPreview"], json!(""));
        assert_eq!(value["artifactPath"], json!("gates/clippy.log"));
    }
}
