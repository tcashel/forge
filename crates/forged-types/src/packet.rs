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
/// A work-sourced spec pins the work's opaque `revision`; a file-sourced one
/// — the deprecated `--spec <path>` route — pins the file's content hash.
/// `path` is where the seat reads the bytes either way.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecRef {
    pub path: String,
    pub sha256: String,
    /// The work revision this packet is pinned to; absent on a file-sourced
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
    /// One complete native work specification; no repository write.
    #[serde(rename = "nativeBeadSpec")]
    NativeWorkSpec,
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
    #[serde(rename = "beadId")]
    pub work_id: String,
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

/// The wire keys a `packets` row already carries as columns, and which the
/// stored body therefore omits. A packet row never stores a value twice.
const COLUMN_BACKED_KEYS: [&str; 5] = ["spec", "packetId", "runId", "stage", "laneSeq"];

/// The `packets` columns a stored body is rehydrated from — the one copy of
/// every value in [`COLUMN_BACKED_KEYS`].
#[derive(Debug, Clone, PartialEq)]
pub struct PacketColumns {
    pub packet_id: String,
    pub run_id: String,
    pub stage: Stage,
    /// The row's `seq`. It is the packet's `lane_seq` for a semantic packet
    /// and the final packet-id segment for a legacy one — see
    /// [`WorkPacket::from_stored_body`] for which of the two the body gets.
    pub seq: i64,
    pub spec: SpecRef,
}

impl WorkPacket {
    /// The row-storage projection of this packet: the wire form minus every
    /// field `packets` carries as a column of the same row.
    pub fn stored_body(&self) -> Result<String, serde_json::Error> {
        let mut value = serde_json::to_value(self)?;
        if let serde_json::Value::Object(map) = &mut value {
            for key in COLUMN_BACKED_KEYS {
                map.remove(key);
            }
        }
        serde_json::to_string(&value)
    }

    /// Rebuild a packet from a stored body and the columns of its row.
    ///
    /// A body written before the projection still carries the projected-out
    /// keys; the columns overwrite them, because the columns are what the
    /// claim fence and the projection read. Legacy rows are therefore
    /// readable as they stand and are never migrated.
    ///
    /// `lane_seq` takes its VALUE from the row and its PRESENCE from
    /// `execution`: the pair is set together (a semantic packet has both, a
    /// legacy one neither), and a legacy packet's sequence is the final
    /// packet-id segment rather than a storage lane.
    pub fn from_stored_body(
        body_json: &str,
        columns: PacketColumns,
    ) -> Result<Self, serde_json::Error> {
        let mut value: serde_json::Value = serde_json::from_str(body_json)?;
        if let serde_json::Value::Object(map) = &mut value {
            map.insert("spec".to_owned(), serde_json::to_value(columns.spec)?);
            map.insert(
                "packetId".to_owned(),
                serde_json::Value::String(columns.packet_id),
            );
            map.insert(
                "runId".to_owned(),
                serde_json::Value::String(columns.run_id),
            );
            map.insert("stage".to_owned(), serde_json::to_value(columns.stage)?);
            if map.get("execution").is_some_and(|value| !value.is_null()) {
                map.insert("laneSeq".to_owned(), serde_json::Value::from(columns.seq));
            } else {
                map.remove("laneSeq");
            }
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
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Finding {
    pub severity: Severity,
    pub file: Option<String>,
    pub line: Option<u32>,
    pub message: String,
}

/// A provider's structured request to change the specification instead of
/// guessing through a contradiction or repairing toward the wrong outcome.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SpecAmendment {
    /// Short statement of the contract that cannot be implemented safely.
    pub summary: String,
    /// Concrete repository evidence that makes the amendment necessary.
    pub evidence: String,
    /// Replacement requirement proposed for operator adjudication.
    pub proposed_change: String,
}

/// The four provider-authored native fields of one work specification.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct NativeWorkSpecV1 {
    pub description: String,
    pub acceptance_criteria: String,
    pub design: String,
    pub notes: String,
}

/// Provider-authored traceability that stays with a rolling-plan artifact
/// but is never written into the work item's four native specification fields.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PlanTraceabilityV1 {
    /// Explicit assumptions the candidate relies on. Empty means none.
    #[serde(default)]
    pub assumptions: Vec<String>,
    /// Frozen requirements the candidate demonstrably carries forward.
    pub requirements: Vec<String>,
}

/// An operator's explicit decision to land with known review findings.
///
/// This is terminal evidence, never a reviewer verdict: only the run control
/// surface may create it after the configured review budget is exhausted.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AcceptedRisk {
    /// Stable operator or lead-agent identity making the decision.
    pub accepted_by: String,
    /// Why the findings are acceptable in this run's declared risk context.
    pub rationale: String,
    /// The deduplicated findings visible when the decision was made.
    pub findings: Vec<Finding>,
}

/// Stage-specific outcome payloads.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum Outcome {
    Implement {
        implemented: bool,
        commits_ahead: u32,
        summary: String,
        /// Closed vocabulary: exactly `"pass"` or `"fail"`; `None` means
        /// the gate outcome is UNKNOWN (a legacy result that predates the
        /// vocabulary), never a failure. Ingestion fences fresh results to
        /// this set; consumers must not string-match prose.
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
    /// A complete rolling-plan candidate. Non-empty `cruxes` require human
    /// adjudication and can never be persisted automatically.
    Plan {
        spec: NativeWorkSpecV1,
        traceability: PlanTraceabilityV1,
        #[serde(default)]
        cruxes: Vec<SpecAmendment>,
    },
    /// Stop the current loop for operator adjudication without inventing a
    /// fix, successor run, or successor work item.
    SpecAmendment {
        amendment: SpecAmendment,
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
            work_id: "bead-1".to_owned(),
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

    /// The definition-backed shape: a semantic execution and the storage
    /// lane that rides with it.
    fn semantic_packet() -> WorkPacket {
        WorkPacket {
            packet_id: "run-1/review/2".to_owned(),
            stage: Stage::ReviewCodex,
            execution: Some(crate::SeatExecutionV1 {
                stage_id: "review".to_owned(),
                seat_id: crate::SeatId::new("review-1").expect("seat id"),
                role_id: crate::RoleId::new("reviewer").expect("role id"),
                purpose: crate::SeatPurpose::Review,
                round: 2,
            }),
            lane_seq: Some(7),
            ..sample_packet()
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

    /// The columns the row would carry for this packet.
    fn columns_of(packet: &WorkPacket) -> PacketColumns {
        PacketColumns {
            packet_id: packet.packet_id.clone(),
            run_id: packet.run_id.clone(),
            stage: packet.stage,
            seq: packet.lane_seq.unwrap_or(0),
            spec: packet.spec.clone(),
        }
    }

    #[test]
    fn the_stored_body_omits_every_value_the_row_carries_as_a_column() {
        let mut packet = sample_packet();
        packet.spec.revision = Some("-6192208415116251521".to_owned());
        for shaped in [packet.clone(), semantic_packet()] {
            let body = shaped.stored_body().expect("stored body");
            let value: serde_json::Value = serde_json::from_str(&body).expect("parses");
            for key in COLUMN_BACKED_KEYS {
                assert!(
                    value.get(key).is_none(),
                    "{key:?} lives in the packet row's columns, never in body_json: {body}"
                );
            }
            assert_eq!(
                WorkPacket::from_stored_body(&body, columns_of(&shaped)).expect("rehydrates"),
                shaped,
                "the projection must be lossless against the row it pairs with"
            );
        }
    }

    #[test]
    fn a_body_written_before_the_projection_still_rehydrates_from_its_columns() {
        // Legacy rows carry the whole packet, every projected-out key
        // included. The columns are what the claim fence and the projection
        // read, so they win and no row is migrated.
        let packet = sample_packet();
        let legacy = serde_json::to_string(&packet).expect("legacy body");
        let columns = PacketColumns {
            packet_id: "run-9/implementation/2".to_owned(),
            run_id: "run-9".to_owned(),
            stage: Stage::Fix,
            seq: 2,
            spec: SpecRef {
                path: "specs/bead-1.md".to_owned(),
                sha256: "cafe".to_owned(),
                revision: Some("77".to_owned()),
            },
        };
        let rehydrated =
            WorkPacket::from_stored_body(&legacy, columns.clone()).expect("rehydrates");
        assert_eq!(rehydrated.spec, columns.spec);
        assert_eq!(rehydrated.packet_id, columns.packet_id);
        assert_eq!(rehydrated.run_id, columns.run_id);
        assert_eq!(rehydrated.stage, columns.stage);
        assert_eq!(
            rehydrated.lane_seq, None,
            "a legacy packet stores no lane: its sequence is the id's last segment"
        );
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
    fn spec_amendment_and_accepted_risk_round_trip() {
        let amendment = SpecAmendment {
            summary: "the requested API does not exist".to_owned(),
            evidence: "src/lib.rs exports only the replacement API".to_owned(),
            proposed_change: "target the replacement API".to_owned(),
        };
        let result = PacketResult {
            schema: "forged.result.implement/1".to_owned(),
            packet_id: "pkt-4".to_owned(),
            outcome: Outcome::SpecAmendment {
                amendment: amendment.clone(),
            },
        };
        round_trip(&result);
        assert_eq!(
            serde_json::to_value(&result).expect("serializes")["outcome"]["specAmendment"]
                ["amendment"]["proposedChange"],
            json!("target the replacement API")
        );

        round_trip(&AcceptedRisk {
            accepted_by: "lead-agent".to_owned(),
            rationale: "the affected path is disabled in this deployment".to_owned(),
            findings: vec![Finding {
                severity: Severity::High,
                file: Some("src/lib.rs".to_owned()),
                line: Some(7),
                message: "disabled path can return stale data".to_owned(),
            }],
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
