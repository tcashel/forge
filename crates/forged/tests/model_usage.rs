//! Model-usage evidence over scratch ledger rows; no provider executes.

mod support;

use std::path::PathBuf;

use forged_types::{
    Deliverable, Outcome, PacketResult, ProviderHints, RoleId, Sandbox, SeatExecutionV1, SeatId,
    SeatPurpose, SpecRef, Stage, StageContract, Verdict, WorkPacket,
};
use rusqlite::{params, Connection};
use serde_json::{json, Value};
use support::TestEnv;

const START: &str = "2030-01-01T00:00:00.000000000Z";
const END: &str = "2030-01-01T00:01:00.000000000Z";

struct Fixture {
    env: TestEnv,
    conn: Connection,
    repository: String,
}

impl Fixture {
    fn new(name: &str) -> Self {
        let env = TestEnv::new(name);
        env.ledger().close().expect("initialize scratch ledger");
        let repository = forged_types::normalize_repository_path(&env.repos.repo.to_string_lossy())
            .expect("repository");
        let conn = Connection::open(env.anvil.join("state.db")).expect("scratch sqlite");
        conn.pragma_update(None, "foreign_keys", "ON")
            .expect("foreign keys");
        Self {
            env,
            conn,
            repository,
        }
    }

    fn run(&self, id: &str, repository: &str) {
        self.conn
            .execute(
                "INSERT INTO work_items \
             (work_id, kind, status, metadata_json, current_revision, created_at, updated_at) \
             VALUES (?1,'task','open',?2,1,?3,?3)",
                params![
                    format!("work-{id}"),
                    json!({"repository":repository}).to_string(),
                    START
                ],
            )
            .expect("work item");
        self.conn
            .execute(
                "INSERT INTO work_revisions (work_id, revision, title, cause, written_at) \
             VALUES (?1,1,'Usage fixture','authored',?2)",
                params![format!("work-{id}"), START],
            )
            .expect("work revision");
        self.conn
            .execute(
                "INSERT INTO runs \
             (run_id, bead_id, repo, base_ref, branch, protocol, state, created_at, updated_at) \
             VALUES (?1,?2,?3,'main',?4,'slice/v1','active',?5,?5)",
                params![
                    id,
                    format!("work-{id}"),
                    repository,
                    format!("forged/{id}"),
                    START
                ],
            )
            .expect("run");
    }

    fn packet(&self, run: &str, review: bool) -> String {
        let (stage, stage_name, role, purpose, deliverable) = if review {
            (
                Stage::ReviewCodex,
                "reviewcodex",
                "review.primary",
                SeatPurpose::Review,
                Deliverable::ReviewBlock,
            )
        } else {
            (
                Stage::Implement,
                "implement",
                "implementation",
                SeatPurpose::Implement,
                Deliverable::CommitsInWorktree,
            )
        };
        let id = format!("{run}/{role}/1");
        let body = WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: id.clone(),
            run_id: run.to_owned(),
            work_id: format!("work-{run}"),
            stage,
            execution: Some(SeatExecutionV1 {
                stage_id: role.to_owned(),
                seat_id: SeatId::new(format!("{role}-1")).expect("seat"),
                role_id: RoleId::new(role).expect("role"),
                purpose,
                round: 1,
            }),
            lane_seq: Some(1),
            spec: SpecRef {
                path: "/tmp/spec.md".to_owned(),
                sha256: "a".repeat(64),
                revision: None,
            },
            worktree: PathBuf::from("/tmp/worktree"),
            branch: format!("forged/{run}"),
            base_ref: "main".to_owned(),
            contract: StageContract {
                instructions: "fixture".to_owned(),
                gate_commands: Vec::new(),
                deliverable,
                budget_s: 60,
                seat_commands: Vec::new(),
            },
            result_schema: "forged.result/1".to_owned(),
            provider_hints: ProviderHints {
                provider: "packet-hint-provider".to_owned(),
                model: "packet-hint-model".to_owned(),
                effort: Some("max".to_owned()),
                sandbox: Sandbox::ReadOnly,
                env: Default::default(),
            },
            field_notes: Vec::new(),
        }
        .stored_body()
        .expect("stored packet body");
        self.conn
            .execute(
                "INSERT INTO packets \
             (packet_id, run_id, stage, seq, spec_path, spec_sha256, body_json, created_at) \
             VALUES (?1,?2,?3,1,'/tmp/spec.md',?4,?5,?6)",
                params![id, run, stage_name, "a".repeat(64), body, START],
            )
            .expect("packet");
        id
    }

    fn attempt(
        &self,
        packet: &str,
        state: &str,
        failure: Option<&str>,
        outcome: Option<Outcome>,
    ) -> i64 {
        let result = outcome.map(|outcome| {
            serde_json::to_string(&PacketResult {
                schema: "forged.result/1".to_owned(),
                packet_id: packet.to_owned(),
                outcome,
            })
            .expect("result")
        });
        self.conn
            .execute(
                "INSERT INTO attempts \
             (packet_id, claim_token, claimant, state, fail_note, result_json, \
              started_at, updated_at, ended_at) \
             VALUES (?1,lower(hex(randomblob(16))),'fixture',?2,?3,?4,?5,?6,?6)",
                params![packet, state, failure, result, START, END],
            )
            .expect("attempt");
        self.conn.last_insert_rowid()
    }

    fn selection(&self, packet: &str, attempt: i64, selection: Value) {
        self.conn
            .execute(
                "INSERT INTO events (ts, run_id, kind, payload_json) \
             VALUES (?1,?2,'forged.session.started',?3)",
                params![
                    START,
                    packet.split('/').next().expect("run id"),
                    json!({
                        "packetId": packet, "attemptId": attempt, "selection": selection,
                    })
                    .to_string()
                ],
            )
            .expect("selection event");
    }

    fn usage(
        &self,
        packet: &str,
        attempt: i64,
        model: (&str, &str),
        tokens: (i64, i64, Option<i64>, Option<i64>),
        cost: (Option<f64>, Option<&str>),
    ) {
        self.conn
            .execute(
                "INSERT INTO usage \
             (run_id, packet_id, attempt_id, provider, model, input_tokens, output_tokens, \
              cache_read_tokens, cache_write_tokens, cost_usd, pricing_basis, ts) \
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)",
                params![
                    packet.split('/').next().expect("run id"),
                    packet,
                    attempt,
                    model.0,
                    model.1,
                    tokens.0,
                    tokens.1,
                    tokens.2,
                    tokens.3,
                    cost.0,
                    cost.1,
                    END
                ],
            )
            .expect("usage");
    }

    fn report(&self, args: &[&str]) -> Value {
        let mut command = vec!["usage"];
        command.extend_from_slice(args);
        let (code, envelope) = self.env.forged(&command);
        assert_eq!(code, 0, "usage response: {envelope}");
        assert_eq!(envelope["ok"], json!(true));
        envelope["result"].clone()
    }
}

fn group<'a>(report: &'a Value, model: Option<&str>, role: &str) -> &'a Value {
    report["groups"]
        .as_array()
        .expect("groups")
        .iter()
        .find(|group| group["model"] == json!(model) && group["role"] == json!(role))
        .unwrap_or_else(|| panic!("missing {model:?}/{role} in {report}"))
}

#[test]
fn attempts_preserve_launch_fallback_cost_and_review_evidence() {
    let fixture = Fixture::new("forged-model-usage-evidence");
    fixture.run("evidence", &fixture.repository);
    let implementation = fixture.packet("evidence", false);
    let review = fixture.packet("evidence", true);
    let launch = json!({"provider":"codex", "model":"launch-model", "effort":"high"});
    let failed = fixture.attempt(
        &implementation,
        "failed",
        Some("transport: connection lost"),
        None,
    );
    fixture.selection(&implementation, failed, launch.clone());
    let completed = fixture.attempt(&implementation, "completed", None, None);
    fixture.selection(&implementation, completed, launch);
    fixture.usage(
        &implementation,
        completed,
        ("codex", "launch-model"),
        (100, 10, Some(20), Some(5)),
        (Some(1.25), Some("billed")),
    );
    fixture.usage(
        &implementation,
        completed,
        ("codex", "reported-secondary"),
        (200, 20, Some(30), Some(6)),
        (Some(2.5), Some("imputed_api_rate")),
    );
    fixture.usage(
        &implementation,
        completed,
        ("codex", "reported-tertiary"),
        (300, 30, None, None),
        (None, None),
    );
    let historical = fixture.attempt(&implementation, "completed", None, None);
    fixture.usage(
        &implementation,
        historical,
        ("claude", "historical-model"),
        (10, 1, None, None),
        (Some(0.25), Some("billed")),
    );
    // An event for another packet must not assign this historical attempt.
    fixture.selection(
        &review,
        historical,
        json!({"provider":"wrong", "model":"wrong", "effort":"low"}),
    );
    fixture.attempt(
        &implementation,
        "failed",
        Some("provider returned no result"),
        None,
    );
    for (verdict, available) in [
        (Verdict::Approve, true),
        (Verdict::RequestChanges, true),
        (Verdict::Block, true),
        (Verdict::Approve, false),
    ] {
        let attempt = fixture.attempt(
            &review,
            "completed",
            None,
            Some(Outcome::Review {
                verdict,
                available,
                summary: "review fixture".to_owned(),
                findings: Vec::new(),
            }),
        );
        fixture.selection(
            &review,
            attempt,
            json!({"provider":"codex", "model":"review-model", "effort":null}),
        );
    }

    let report = fixture.report(&["--models", "--run", "evidence"]);
    assert_eq!(report["schema"], json!("forged.model-usage/1"));
    assert_eq!(
        report["coverage"],
        json!({"shown":4,"total":4,"truncated":false})
    );
    assert_eq!(report["attribution"]["unknownModelAttempts"], json!(1));
    assert_eq!(report["attribution"]["unknownEffortAttempts"], json!(2));
    assert_eq!(report["attribution"]["unattributedUsageRows"], json!(0));
    assert_eq!(report["observed"], json!({"from":START,"to":END}));
    let launched = group(&report, Some("launch-model"), "implementation");
    assert_eq!(launched["provider"], json!("codex"));
    assert_eq!(launched["effort"], json!("high"));
    for (field, expected) in [
        ("attempts", 2),
        ("completed", 1),
        ("failed", 1),
        ("transportFailures", 1),
        ("repeatAttempts", 1),
        ("launchSelectionAttempts", 2),
        ("multipleUsageModelAttempts", 1),
        ("usageModelMismatchAttempts", 1),
    ] {
        assert_eq!(launched[field], json!(expected), "{field}: {launched}");
    }
    assert_eq!(
        launched["tokens"],
        json!({"input":600,"output":60,"cacheRead":50,"cacheWrite":11})
    );
    assert_eq!(
        launched["cost"],
        json!({
            "knownUsd":3.75,"rowsMissingCost":1,"attemptsWithoutUsage":1,
            "billedRows":1,"imputedRows":1,"otherPricingRows":1,
        })
    );
    assert_eq!(
        launched["duration"],
        json!({"samples":2,"totalSeconds":120.0,"missing":0})
    );
    let historical = group(&report, Some("historical-model"), "implementation");
    assert_eq!(historical["provider"], json!("claude"));
    assert!(
        historical["effort"].is_null(),
        "packet hints do not prove historical effort"
    );
    assert_eq!(historical["usageModelAttempts"], json!(1));
    assert_eq!(historical["launchSelectionAttempts"], json!(0));
    assert_eq!(
        historical["repeatAttempts"],
        json!(1),
        "ordinal includes attempts in other model groups"
    );
    let unknown = group(&report, None, "implementation");
    assert!(unknown["provider"].is_null());
    assert!(unknown["effort"].is_null());
    assert_eq!(unknown["failed"], json!(1));
    assert_eq!(unknown["cost"]["attemptsWithoutUsage"], json!(1));
    let reviewed = group(&report, Some("review-model"), "review.primary");
    assert_eq!(reviewed["effort"], json!("provider-default"));
    assert_eq!(reviewed["completed"], json!(4));
    assert_eq!(reviewed["repeatAttempts"], json!(3));
    assert_eq!(
        reviewed["reviewVerdicts"],
        json!({"approve":1,"requestChanges":1,"block":1,"unknown":1})
    );
    assert!(report["interpretation"]
        .as_str()
        .expect("interpretation")
        .contains("not accepted quality"));
    assert_eq!(
        report["groups"]
            .as_array()
            .expect("groups")
            .iter()
            .map(|row| row["attempts"].as_u64().expect("attempt count"))
            .sum::<u64>(),
        8,
        "multiple usage models do not multiply attempts"
    );
}

#[test]
fn repository_scope_uses_frozen_runs_and_group_output_is_bounded() {
    let fixture = Fixture::new("forged-model-usage-scope");
    let elsewhere = forged_types::normalize_repository_path(
        &fixture.env.root.join("elsewhere").to_string_lossy(),
    )
    .expect("other repository");
    fixture.run("inside", &fixture.repository);
    fixture.run("outside", &elsewhere);
    fixture
        .conn
        .execute(
            "UPDATE work_items SET metadata_json = CASE work_id \
         WHEN 'work-inside' THEN ?1 ELSE ?2 END",
            params![
                json!({"repository":elsewhere}).to_string(),
                json!({"repository":fixture.repository}).to_string()
            ],
        )
        .expect("move current work metadata opposite to frozen run repositories");
    let inside = fixture.packet("inside", false);
    for index in 0..7 {
        let attempt = fixture.attempt(&inside, "completed", None, None);
        let model = format!("model-{index}");
        fixture.selection(
            &inside,
            attempt,
            json!({"provider":"codex","model":model,"effort":"high"}),
        );
        fixture.usage(
            &inside,
            attempt,
            ("codex", &model),
            (10, 1, Some(2), Some(3)),
            (Some(0.5), Some("billed")),
        );
    }
    let outside = fixture.packet("outside", false);
    let outside_attempt = fixture.attempt(&outside, "completed", None, None);
    fixture.usage(
        &outside,
        outside_attempt,
        ("claude", "outside-model"),
        (1000, 100, Some(200), Some(300)),
        (Some(100.0), Some("billed")),
    );

    let raw = fixture.report(&["--repo", &fixture.repository]);
    assert_eq!(raw["rows"].as_array().expect("usage rows").len(), 7);
    assert!(raw["rows"]
        .as_array()
        .expect("usage rows")
        .iter()
        .all(|row| row["runId"] == json!("inside")));
    assert_eq!(raw["totals"]["inputTokens"], json!(70));
    assert_eq!(raw["totals"]["outputTokens"], json!(7));
    assert_eq!(raw["totals"]["cacheReadTokens"], json!(14));
    assert_eq!(raw["totals"]["cacheWriteTokens"], json!(21));
    assert_eq!(raw["totals"]["costUsdKnown"], json!(3.5));
    let report = fixture.report(&["--models", "--repo", &fixture.repository]);
    assert_eq!(report["scope"]["repository"], json!(fixture.repository));
    assert_eq!(
        report["coverage"],
        json!({"shown":5,"total":7,"truncated":true})
    );
    assert!(report["groups"]
        .as_array()
        .expect("groups")
        .iter()
        .all(|row| row["repository"] == json!(fixture.repository)));
    let limited = fixture.report(&["--models", "--repo", &fixture.repository, "--limit", "1"]);
    assert_eq!(
        limited["coverage"],
        json!({"shown":1,"total":7,"truncated":true})
    );
    assert_eq!(limited["groups"][0], report["groups"][0]);
    let complete = fixture.report(&[
        "--models",
        "--repo",
        &fixture.repository,
        "--run",
        "inside",
        "--limit",
        "100",
    ]);
    assert_eq!(
        complete["coverage"],
        json!({"shown":7,"total":7,"truncated":false})
    );
    let all = fixture.report(&["--models", "--all", "--limit", "100"]);
    assert_eq!(
        all["coverage"],
        json!({"shown":8,"total":8,"truncated":false})
    );
    let raw_mismatch = fixture.report(&["--repo", &fixture.repository, "--run", "outside"]);
    assert_eq!(raw_mismatch["rows"], json!([]));
    assert_eq!(raw_mismatch["totals"]["inputTokens"], json!(0));
    let model_mismatch = fixture.report(&[
        "--models",
        "--repo",
        &fixture.repository,
        "--run",
        "outside",
    ]);
    assert_eq!(model_mismatch["groups"], json!([]));
    assert_eq!(
        model_mismatch["coverage"],
        json!({"shown":0,"total":0,"truncated":false})
    );
}
