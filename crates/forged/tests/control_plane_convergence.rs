//! Deterministic convergence proof for the five MCP App resources.
//!
//! This is intentionally a test-only composition seam. It joins the landed
//! public projections through their real CLI/MCP adapters and feeds captured
//! MCP results to the dependency-free App host. It does not create a new
//! production projection or replay the dependency failpoint matrices.

mod support;

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use serde_json::{json, Value};
use support::{require_node, run_split_app_host_scenario, setup_repos, McpClient, TestEnv};

const FIXED: &str = "2026-08-15T00:00:00.000000000Z";

struct ControlPlaneFixture {
    env: TestEnv,
    repository_b: support::Repos,
}

/// One work item's identity-relevant columns, row-level so a same-count
/// mutation is still caught.
type WorkItemFingerprint = (
    String,
    String,
    String,
    Option<i64>,
    Option<String>,
    String,
    i64,
);

#[derive(Debug, PartialEq, Eq)]
struct ReadFingerprint {
    ledger_counts: BTreeMap<String, i64>,
    event_high_water: i64,
    work_state: Vec<WorkItemFingerprint>,
    provider_log: Vec<String>,
    github_calls: Vec<Vec<String>>,
    repositories: Vec<(String, String)>,
}

impl ControlPlaneFixture {
    fn new(name: &str) -> Self {
        let env = TestEnv::new(name);
        assert_eq!(env.forged(&["init"]).0, 0);
        let repository_b = setup_repos(&env.root.join("repository-b"), "main");
        let fixture = Self { env, repository_b };
        fixture.seed();
        fixture
    }

    fn repository_a(&self) -> String {
        self.env.repos.repo.to_string_lossy().into_owned()
    }

    fn repository_b(&self) -> String {
        self.repository_b.repo.to_string_lossy().into_owned()
    }

    fn create_run(&self, run_id: &str, work_id: &str, repository: &str) {
        let ledger = self.env.ledger();
        ledger
            .create_run(forged_ledger::NewRun {
                run_id: forged_types::RunId::new(run_id).expect("run id"),
                work_id: work_id.to_owned(),
                repo: repository.to_owned(),
                base_ref: "main".to_owned(),
                branch: format!("work/{run_id}"),
            })
            .expect("create fixture run");
        ledger.close().expect("close ledger");
    }

    fn open_attempt(
        &self,
        run_id: &str,
        seq: i64,
        provider: &str,
    ) -> forged_ledger::ClaimedAttempt {
        let packet_id = format!("{run_id}/implement/{seq}");
        let digest = "a".repeat(64);
        let packet = forged_types::WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: packet_id.clone(),
            run_id: run_id.to_owned(),
            work_id: format!("bead-{run_id}"),
            stage: forged_types::Stage::Implement,
            execution: None,
            lane_seq: None,
            spec: forged_types::SpecRef {
                path: "beads://fixture".to_owned(),
                sha256: digest.clone(),
                revision: Some("fixture-revision".to_owned()),
            },
            worktree: PathBuf::from("/unread/worktree"),
            branch: format!("work/{run_id}"),
            base_ref: "main".to_owned(),
            contract: forged_types::StageContract {
                instructions: "fixture".to_owned(),
                gate_commands: Vec::new(),
                deliverable: forged_types::Deliverable::CommitsInWorktree,
                budget_s: 60,
            },
            result_schema: "forged.result/1".to_owned(),
            provider_hints: forged_types::ProviderHints {
                provider: provider.to_owned(),
                model: format!("{provider}-fixture"),
                effort: None,
                sandbox: forged_types::Sandbox::ReadOnly,
            },
            field_notes: Vec::new(),
        };
        let ledger = self.env.ledger();
        ledger
            .open_packet(forged_ledger::NewPacket {
                run_id: run_id.to_owned(),
                stage: forged_types::Stage::Implement,
                seq,
                spec_path: packet.spec.path.clone(),
                spec_sha256: digest.clone(),
                spec_revision: None,
                body_json: packet.stored_body().expect("stored packet"),
            })
            .expect("open packet");
        let attempt = ledger
            .claim_packet(
                &packet_id,
                &format!("fixture:{packet_id}"),
                &forged_ledger::SpecFence::Sha256(digest),
            )
            .expect("claim packet");
        ledger.close().expect("close ledger");
        attempt
    }

    fn seed(&self) {
        let repository_a = self.repository_a();
        let repository_b = self.repository_b();
        for (work, repository, status) in [
            ("bead-run-a", repository_a.as_str(), "in_progress"),
            ("bead-run-b", repository_b.as_str(), "closed"),
            ("bead-review-ready", repository_a.as_str(), "in_progress"),
            ("plan-a", repository_a.as_str(), "open"),
            ("plan-b", repository_b.as_str(), "open"),
        ] {
            self.env
                .set_work_field(work, "title", "Duplicate operator title");
            self.env.set_work_field(work, "status", status);
            self.env.set_work_repository(work, repository);
        }
        self.env.set_work_field("plan-a", "priority", "1");
        self.env.set_work_field("plan-b", "priority", "1");

        self.create_run("run-a", "bead-run-a", &repository_a);
        self.create_run("run-b", "bead-run-b", &repository_b);
        self.create_run("review-ready", "bead-review-ready", &repository_a);

        let unknown = self.open_attempt("run-a", 1, "codex");
        let process = self.open_attempt("run-a", 2, "claude");
        let legacy = self.open_attempt("run-a", 3, "claude");
        let owned = self.open_attempt("run-a", 4, "codex");
        let terminal = self.open_attempt("run-b", 1, "codex");

        let ledger = self.env.ledger();
        ledger
            .authorize_desired_work(forged_ledger::DesiredSubjectKind::Run, "run-a", 1)
            .expect("authorize running fixture");
        ledger
            .authorize_desired_work(forged_ledger::DesiredSubjectKind::Run, "review-ready", 1)
            .expect("authorize review fixture");
        ledger
            .append_event(
                Some("run-a"),
                "forged.session.started",
                json!({
                    "schemaVersion": 2,
                    "attemptId": process.attempt_id,
                    "packetId": "run-a/implement/2",
                    "host": "process",
                    "sessionId": "process-fixture",
                }),
            )
            .expect("process session event");
        ledger
            .append_event(
                Some("run-a"),
                "forged.session.started",
                json!({
                    "schemaVersion": 1,
                    "attemptId": legacy.attempt_id,
                    "packetId": "run-a/implement/3",
                    "host": "herdr",
                    "sessionId": "legacy-pane",
                    "socketPath": "/unread/legacy.sock",
                    "statusPath": "/unread/legacy.status",
                }),
            )
            .expect("legacy session event");
        ledger
            .append_event(
                Some("run-a"),
                "forged.intervention.queued",
                json!({"schemaVersion": 1, "interventionId": "intervention-a"}),
            )
            .expect("pending intervention");
        ledger
            .append_event(
                Some("run-a"),
                "proto.quarantine",
                json!({
                    "schemaVersion": 1,
                    "packetId": "run-a/implement/3",
                    "attemptId": legacy.attempt_id,
                    "reason": "deterministic attention fixture"
                }),
            )
            .expect("attention event");
        ledger
            .settle_run(
                "review-ready",
                forged_ledger::RunOutcome::Clean,
                "reviewed".to_owned(),
                None,
                None,
                None,
            )
            .expect("review-ready settlement");
        ledger
            .append_event(
                Some("review-ready"),
                "proto.pr",
                json!({
                    "schemaVersion": 1,
                    "number": 77,
                    "isDraft": true,
                    "baseRefName": "main",
                    "url": "https://example.invalid/pull/77",
                }),
            )
            .expect("review-ready PR evidence");
        ledger
            .register_owned_herdr_session(&forged_types::OwnedHerdrSessionV1 {
                schema: forged_types::OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
                ownership_id: "owned-run-a-4".to_owned(),
                owner: forged_types::OwnedHerdrOwnerV1::Attempt {
                    subject: forged_types::OwnedHerdrSubjectV1 {
                        kind: forged_types::OwnedHerdrSubjectKind::Run,
                        id: "run-a".to_owned(),
                    },
                    run_id: "run-a".to_owned(),
                    packet_id: "run-a/implement/4".to_owned(),
                    attempt_id: owned.attempt_id,
                    claim_token: owned.claim_token.clone(),
                    controller_generation: Some(1),
                },
                pane_id: "owned-pane".to_owned(),
                socket_path: "/unread/owned.sock".to_owned(),
                protocol: 19,
                sentinel_path: "/unread/owned.status".to_owned(),
                layout_id: None,
            })
            .expect("owned Herdr session");
        ledger
            .mark_owned_herdr_command_started("owned-run-a-4")
            .expect("owned command start");
        for (attempt_id, cost) in [
            (unknown.attempt_id, Some(1.25)),
            (process.attempt_id, Some(0.0)),
            (legacy.attempt_id, None),
        ] {
            ledger
                .record_usage(forged_ledger::NewUsage {
                    run_id: "run-a".to_owned(),
                    packet_id: None,
                    attempt_id: Some(attempt_id),
                    provider: "fixture".to_owned(),
                    model: "fixture".to_owned(),
                    input_tokens: 10,
                    output_tokens: 5,
                    cache_read_tokens: None,
                    cache_write_tokens: None,
                    cost_usd: cost,
                    pricing_basis: cost.map(|_| "provider_reported".to_owned()),
                    rate_limit_used_percent: None,
                    web_search_requests: None,
                })
                .expect("usage fixture");
        }
        ledger
            .fail_packet(
                "run-b/implement/1",
                &terminal.claim_token,
                "terminal fixture",
            )
            .expect("terminal history attempt");
        ledger.close().expect("close seeded ledger");

        let connection = rusqlite::Connection::open(self.env.anvil.join("state.db"))
            .expect("open fixture database");
        connection
            .execute(
                "UPDATE runs SET updated_at = ?1 WHERE run_id = 'review-ready'",
                [FIXED],
            )
            .expect("fixed review-ready timestamp");
        connection
            .execute(
                "UPDATE attempts SET started_at = ?1, updated_at = ?1, \
                 last_heartbeat_at = CASE WHEN state = 'running' THEN ?1 ELSE last_heartbeat_at END, \
                 ended_at = CASE WHEN state = 'running' THEN NULL ELSE ?1 END",
                [FIXED],
            )
            .expect("fixed attempt timestamps");
        connection
            .execute("UPDATE events SET ts = ?1", [FIXED])
            .expect("fixed event timestamps");
        connection
            .execute("UPDATE usage SET ts = ?1", [FIXED])
            .expect("fixed usage timestamps");
        seed_admission(&connection, "run-a", "admitted", "capacity-available", None);
        seed_admission(
            &connection,
            "review-ready",
            "deferred",
            "repository-write-capacity",
            Some("2026-08-15T00:05:00.000000000Z"),
        );
    }

    fn fingerprint(&self) -> ReadFingerprint {
        let connection = rusqlite::Connection::open(self.env.anvil.join("state.db"))
            .expect("open fingerprint database");
        let mut ledger_counts = BTreeMap::new();
        for table in [
            "runs",
            "packets",
            "attempts",
            "events",
            "usage",
            "operations",
            "desired_work",
            "admission_batches",
            "admission_decisions",
            "admission_reservations",
            "attempt_artifacts",
            "owned_herdr_sessions",
            "herdr_pane_projections",
            "review_finding_deliveries",
            "work_items",
            "work_revisions",
            "work_notes",
            "work_deps",
            "work_leases",
        ] {
            let count = connection
                .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| {
                    row.get(0)
                })
                .expect("logical row count");
            ledger_counts.insert(table.to_owned(), count);
        }
        let event_high_water = connection
            .query_row("SELECT COALESCE(MAX(event_id), 0) FROM events", [], |row| {
                row.get(0)
            })
            .expect("event high water");
        let mut stmt = connection
            .prepare(
                "SELECT work_id, kind, status, priority, assignee, metadata_json, \
                 current_revision FROM work_items ORDER BY work_id",
            )
            .expect("work item fingerprint");
        let work_state = stmt
            .query_map([], |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                    row.get(5)?,
                    row.get(6)?,
                ))
            })
            .expect("work rows")
            .collect::<Result<Vec<_>, _>>()
            .expect("work fingerprint rows");
        drop(stmt);
        ReadFingerprint {
            ledger_counts,
            event_high_water,
            work_state,
            provider_log: self.env.provider_log(),
            github_calls: self.env.gh_calls(),
            repositories: [&self.env.repos.repo, &self.repository_b.repo]
                .into_iter()
                .map(|repo| {
                    (
                        support::git(repo, &["rev-parse", "HEAD"]),
                        support::git(repo, &["status", "--porcelain=v1", "--untracked-files=all"]),
                    )
                })
                .collect(),
        }
    }
}

fn seed_admission(
    connection: &rusqlite::Connection,
    subject_id: &str,
    outcome: &str,
    reason: &str,
    wake: Option<&str>,
) {
    let batch = format!("batch-{subject_id}");
    connection
        .execute(
            "INSERT INTO admission_batches \
             (batch_id, schema, policy_revision, ledger_revision, inputs_sha256, inputs_json, as_of, created_at) \
             VALUES (?1, 'forged.admission-inputs/1', 'fixture-policy', 'fixture-ledger', ?2, '{}', ?3, ?3)",
            rusqlite::params![batch, "c".repeat(64), FIXED],
        )
        .expect("admission batch");
    let decision = json!({
        "schema": "forged.admission-decision/1",
        "batchId": batch,
        "subjectKind": "run",
        "subjectId": subject_id,
        "controlRevision": 1,
        "repository": "/fixture",
        "priority": 1,
        "provider": "codex",
        "model": "gpt-5.6-sol",
        "resourceClass": "repository-write",
        "outcome": outcome,
        "reason": reason,
        "policyRevision": "fixture-policy",
        "evidence": {
            "totalActive": 1,
            "providerActive": {"codex": 1},
            "modelActive": {"gpt-5.6-sol": 1},
            "repositoryWriteActive": {"/fixture": 1}
        },
        "nextEligibleWakeAt": wake,
    });
    connection
        .execute(
            "INSERT INTO admission_decisions \
             (decision_id, batch_id, subject_kind, subject_id, control_revision, outcome, reason, \
              next_eligible_wake_at, decision_json, created_at) \
             VALUES (?1, ?2, 'run', ?3, 1, ?4, ?5, ?6, ?7, ?8)",
            rusqlite::params![
                format!("decision-{subject_id}"),
                batch,
                subject_id,
                outcome,
                reason,
                wake,
                decision.to_string(),
                FIXED,
            ],
        )
        .expect("admission decision");
}

fn normalized(mut envelope: Value) -> Value {
    if envelope["operationId"]
        .as_str()
        .is_some_and(|value| value.len() == 36 && value.matches('-').count() == 4)
    {
        envelope["operationId"] = json!("<minted>");
    }
    for pointer in [
        "/result/asOf",
        "/result/queue/asOf",
        "/result/capturedAt/ledger",
        "/result/capturedAt/beads",
        "/result/capturedAt/history",
    ] {
        if envelope.pointer(pointer).is_some_and(Value::is_string) {
            *envelope
                .pointer_mut(pointer)
                .expect("known capture pointer") = json!("<sampled>");
        }
    }
    if let Some(groups) = envelope
        .pointer_mut("/result/queue/groups")
        .and_then(Value::as_array_mut)
    {
        for entry in groups
            .iter_mut()
            .flat_map(|group| group["entries"].as_array_mut().into_iter().flatten())
        {
            if entry["progressAgeInput"]["asOf"].is_string() {
                entry["progressAgeInput"]["asOf"] = json!("<sampled>");
            }
        }
    }
    envelope
}

fn assert_raw_parity(cli: Value, raw: &Value, name: &str) -> Value {
    let structured = raw["structuredContent"].clone();
    let text: Value = serde_json::from_str(
        raw.pointer("/content/0/text")
            .and_then(Value::as_str)
            .unwrap_or_else(|| panic!("{name} has no JSON text fallback: {raw}")),
    )
    .unwrap_or_else(|error| panic!("{name} text fallback is not JSON: {error}: {raw}"));
    assert_eq!(structured, text, "{name} structured/text parity");
    assert_eq!(
        normalized(cli),
        normalized(structured.clone()),
        "{name} CLI/MCP parity"
    );
    structured
}

fn entries(response: &Value) -> Vec<&Value> {
    response["result"]["queue"]["groups"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .collect()
}

#[test]
fn modern_projections_and_all_five_apps_converge_on_real_envelopes() {
    let fixture = ControlPlaneFixture::new("forged-control-plane-convergence");
    let repository = fixture.repository_a();
    let before = fixture.fingerprint();
    let mut mcp = McpClient::new(&fixture.env);
    let mut tools = mcp.list_tools();
    tools.sort();
    assert_eq!(
        tools.len(),
        59,
        "the integrated public tool inventory moved"
    );
    assert!(tools.contains(&"review_publish".to_owned()));
    assert!(tools.contains(&"session_inventory".to_owned()));
    let mut resources = mcp.list_resources();
    resources.sort();
    assert_eq!(
        resources,
        [
            "ui://forged/agent-sessions.html",
            "ui://forged/operations-overview.html",
            "ui://forged/overview.html",
            "ui://forged/work-detail.html",
            "ui://forged/work-map.html",
        ],
        "the integrated App inventory moved"
    );

    let envelope = |params: Value| json!({"schemaVersion": 1, "params": params});
    let operations_cli = fixture
        .env
        .forged(&[
            "operations",
            "overview",
            "--repo",
            &repository,
            "--limit",
            "50",
        ])
        .1;
    let operations_raw = mcp.call_tool_result(
        "operations_overview",
        envelope(json!({"repo": repository, "limit": 50})),
    );
    let operations = assert_raw_parity(operations_cli, &operations_raw, "Operations");

    let detail_cli = fixture
        .env
        .forged(&[
            "work",
            "detail",
            "--subject-kind",
            "run",
            "--subject-id",
            "run-a",
        ])
        .1;
    let detail_raw = mcp.call_tool_result(
        "work_detail",
        envelope(json!({"subjectKind": "run", "subjectId": "run-a"})),
    );
    let detail = assert_raw_parity(detail_cli, &detail_raw, "Work Detail");

    let map_cli = fixture
        .env
        .forged(&[
            "work",
            "map",
            "--scope",
            "repository",
            "--repository",
            &repository,
        ])
        .1;
    let map_raw = mcp.call_tool_result(
        "work_map",
        envelope(json!({"scope": "repository", "repository": repository})),
    );
    let map = assert_raw_parity(map_cli, &map_raw, "Work Map");

    let session_cli = fixture
        .env
        .forged(&[
            "session",
            "inventory",
            "--run",
            "run-a",
            "--include-historical",
        ])
        .1;
    let session_raw = mcp.call_tool_result(
        "session_inventory",
        envelope(json!({"run": "run-a", "includeHistorical": true})),
    );
    let sessions = assert_raw_parity(session_cli, &session_raw, "Agent Sessions");

    let overview_cli = fixture.env.forged(&["overview", "--run", "run-a"]).1;
    let overview_raw = mcp.call_tool_result(
        "overview",
        json!({"schemaVersion": 1, "runId": "run-a", "params": {"run": "run-a"}}),
    );
    let overview = assert_raw_parity(overview_cli, &overview_raw, "legacy Overview");

    let operation_entries = entries(&operations);
    assert!(operation_entries.iter().any(|entry| entry["id"] == "run-a"));
    assert!(operation_entries
        .iter()
        .any(|entry| entry["id"] == "plan-a"));
    assert!(!operation_entries
        .iter()
        .any(|entry| entry["id"] == "plan-b"));
    assert!(operation_entries
        .iter()
        .any(|entry| { entry["id"] == "review-ready" && entry["delivery"]["pr"] == json!(77) }));
    assert_eq!(operations["result"]["counts"]["admitted"], 1);
    assert_eq!(operations["result"]["counts"]["queued"], 1);
    assert_eq!(
        operations["result"]["counts"]["reviewReady"], 1,
        "{operations}"
    );
    assert_eq!(detail["result"]["identity"]["subject"]["id"], "run-a");
    assert_eq!(
        detail["result"]["identity"]["repository"]["path"],
        repository
    );
    let map_run = map["result"]["nodes"]
        .as_array()
        .into_iter()
        .flatten()
        .find(|node| node["workRef"]["kind"] == "run" && node["workRef"]["id"] == "run-a")
        .expect("Work Map run-a node");
    assert_eq!(map_run["identity"], detail["result"]["identity"]);
    assert_eq!(map_run["history"]["metrics"]["costUsdKnown"], 1.25);
    assert_eq!(map_run["history"]["metrics"]["rowsMissingCost"], 1);
    let pricing = map_run["history"]["metrics"]["pricing"]
        .as_array()
        .expect("pricing evidence");
    assert!(pricing.iter().any(|row| {
        row["basis"] == "provider_reported" && row["rows"] == 2 && row["rowsMissingCost"] == 0
    }));
    assert!(pricing.iter().any(|row| {
        row["basis"] == "unknown" && row["rows"] == 1 && row["rowsMissingCost"] == 1
    }));
    assert!(map["result"]["nodes"].as_array().is_some_and(|nodes| nodes
        .iter()
        .any(|node| node["workRef"]["id"] == "plan-a")
        && !nodes.iter().any(|node| node["workRef"]["id"] == "plan-b")));
    let session_rows = sessions["result"]["rows"].as_array().expect("session rows");
    assert!(
        session_rows.len() >= 4,
        "all provider host modes are represented: {sessions}"
    );
    for row in session_rows {
        assert_eq!(row["identity"]["subject"]["id"], "run-a");
        assert_eq!(row["repository"], repository);
    }
    for mode in ["owned-herdr", "process", "legacy-herdr", "unknown"] {
        assert!(
            session_rows.iter().any(|row| row["hostMode"] == mode),
            "missing {mode}: {sessions}"
        );
    }
    assert_eq!(sessions["result"]["coverage"]["missingOwnedProjection"], 1);
    assert!(sessions["result"]["coverage"]["degradationFacts"]
        .as_array()
        .is_some_and(|facts| !facts.is_empty()));

    let Some(node) = require_node() else { return };
    let assets = Path::new(env!("CARGO_MANIFEST_DIR")).join("assets");
    for (asset, raw, needle) in [
        ("overview.html", &overview_raw, "run-a"),
        ("operations-overview.html", &operations_raw, "run-a"),
        ("work-detail.html", &detail_raw, "run-a"),
        ("work-map.html", &map_raw, "run-a"),
        ("agent-sessions.html", &session_raw, "run-a"),
    ] {
        for transport in ["structured", "text"] {
            let report = run_split_app_host_scenario(
                &node,
                &assets.join(asset),
                &json!({
                    "transport": transport,
                    "toolResult": raw,
                    "hostCapabilities": {"updateModelContext": true},
                    "actions": [
                        {"type": "tool-cancelled"},
                        {"type": "tool-result", "transport": transport, "toolResult": raw},
                        {"type": "host-context", "params": {"theme": "light", "styles": {"variables": {"--host-accent": "teal"}}}}
                    ],
                    "allowedTools": [],
                }),
            );
            assert_eq!(report["scenarioMode"], true, "{asset}: {report}");
            assert_eq!(report["toolCalls"], 0, "{asset}: {report}");
            assert_eq!(report["innerHTMLWrites"], 0, "{asset}: {report}");
            assert_eq!(report["teardownAck"], true, "{asset}: {report}");
            assert!(
                report["text"].to_string().contains(needle),
                "{asset}: {report}"
            );
        }
    }
    assert_eq!(overview["result"]["schema"], "forged.overview/1");

    assert_eq!(
        before,
        fixture.fingerprint(),
        "read paths changed durable fixture state"
    );
    assert!(fixture.env.provider_log().is_empty());
    assert!(fixture.env.gh_calls().is_empty());
}

#[test]
fn durable_and_plan_reads_answer_from_the_store_without_cross_repository_leakage() {
    let fixture = ControlPlaneFixture::new("forged-control-plane-degraded");
    let repository = fixture.repository_a();
    let before = fixture.fingerprint();

    let (code, operations) = fixture.env.forged(&["operations", "overview"]);
    assert_eq!(code, 0, "operations overview: {operations}");
    assert_eq!(
        operations["result"]["sourceHealth"]["beads"]["state"],
        "available"
    );
    assert_eq!(
        operations["result"]["sourceHealth"]["plan"]["state"],
        "available"
    );
    assert!(entries(&operations)
        .iter()
        .any(|entry| entry["id"] == "run-a"));
    assert!(entries(&operations)
        .iter()
        .any(|entry| entry["id"] == "run-b"));
    // The plan read now succeeds, so the live-plan rows are present rather
    // than absent — this call is operator-scoped, so both repositories' plan
    // rows are in view and neither is a leak.
    assert!(entries(&operations)
        .iter()
        .any(|entry| entry["source"] == "live-plan"));

    let (code, map) = fixture.env.forged(&[
        "work",
        "map",
        "--scope",
        "repository",
        "--repository",
        &repository,
    ]);
    assert_eq!(code, 0, "repository-scoped Work Map: {map}");
    assert_eq!(map["result"]["sourceHealth"]["beads"]["state"], "available");
    assert!(map["result"]["nodes"].as_array().is_some_and(|nodes| nodes
        .iter()
        .any(|node| node["workRef"]["id"] == "run-a")
        && !nodes.iter().any(|node| node["workRef"]["id"] == "run-b")));

    assert_eq!(
        before,
        fixture.fingerprint(),
        "reads changed durable fixture state"
    );
}
