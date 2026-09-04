//! Bounded history/spend behavior over production-shaped durable rows.
//!
//! Fixtures write only the scratch SQLite database. No live work, provider,
//! filesystem evidence, service, GitHub, or network path participates in a
//! history call.

mod support;

use std::path::PathBuf;

use forged_types::{
    work_display_title, Deliverable, ProviderHints, RoleId, Sandbox, SeatExecutionV1, SeatId,
    SeatPurpose, SpecRef, Stage, StageContract, WorkIdentityContextV1, WorkPacket,
};
use rusqlite::{params, Connection};
use serde_json::{json, Value};
use support::TestEnv;

const FROM: &str = "2030-01-02T00:00:00.000000000Z";
const TO: &str = "2030-01-08T00:00:00.000000000Z";

fn packet_body(run_id: &str, packet_id: &str, provider: &str) -> String {
    WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: packet_id.to_owned(),
        run_id: run_id.to_owned(),
        work_id: format!("bead-{run_id}"),
        stage: Stage::Implement,
        execution: Some(SeatExecutionV1 {
            stage_id: "implementation".to_owned(),
            seat_id: SeatId::new("implementation-1").expect("seat id"),
            role_id: RoleId::new("implementation").expect("role id"),
            purpose: SeatPurpose::Implement,
            round: 1,
        }),
        lane_seq: Some(1),
        spec: SpecRef {
            path: "/tmp/spec.md".to_owned(),
            sha256: "a".repeat(64),
            revision: None,
        },
        worktree: PathBuf::from("/tmp/worktree"),
        branch: format!("forged/{run_id}"),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "implement".to_owned(),
            gate_commands: Vec::new(),
            deliverable: Deliverable::CommitsInWorktree,
            budget_s: 60,
            seat_commands: Vec::new(),
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: ProviderHints {
            provider: provider.to_owned(),
            model: "model".to_owned(),
            effort: None,
            sandbox: Sandbox::WorkspaceWrite,
            env: Default::default(),
        },
        field_notes: Vec::new(),
    }
    .stored_body()
    .expect("stored packet")
}

fn insert_identity(
    conn: &Connection,
    kind: &str,
    id: &str,
    title: &str,
    repository: &str,
    epic: Option<(&str, &str)>,
) {
    let label = forged_types::repository_label(repository).expect("repository label");
    let epic_context = epic.map(|(id, title)| WorkIdentityContextV1 {
        id: id.to_owned(),
        title: Some(title.to_owned()),
    });
    let display = work_display_title(id, Some(title), Some(&label), None, epic_context.as_ref());
    let work_id = if kind == "epic" {
        id.to_owned()
    } else {
        format!("bead-{id}")
    };
    conn.execute(
        "INSERT INTO work_identities \
         (schema, subject_kind, subject_id, bead_id, bead_title, bead_revision, \
          repository_path, repository_label, project_id, project_title, epic_id, epic_title, \
          display_title, captured_at, source) \
         VALUES ('forged.work-identity/1', ?1, ?2, ?3, ?4, NULL, ?5, ?6, \
                 NULL, NULL, ?7, ?8, ?9, '2030-01-01T00:00:00.000000000Z', 'durable')",
        params![
            kind,
            id,
            work_id,
            title,
            repository,
            label,
            epic.map(|value| value.0),
            epic.map(|value| value.1),
            display,
        ],
    )
    .expect("identity");
}

fn seed_history(env: &TestEnv) {
    env.forged(&["init"]);
    let repository = forged_types::normalize_repository_path(&env.repos.repo.to_string_lossy())
        .expect("canonical repository");
    let mut conn = Connection::open(env.anvil.join("state.db")).expect("sqlite");
    conn.pragma_update(None, "foreign_keys", "ON")
        .expect("foreign keys");
    let tx = conn.transaction().expect("transaction");
    insert_identity(
        &tx,
        "epic",
        "epic-history",
        "History epic",
        &repository,
        None,
    );
    insert_identity(
        &tx,
        "run",
        "run-history",
        "History slice",
        &repository,
        Some(("epic-history", "History epic")),
    );
    tx.execute(
        "INSERT INTO runs \
         (run_id, bead_id, repo, base_ref, branch, protocol, state, stop_reason, \
          created_at, updated_at, terminal_outcome, delivery_pr, delivery_sha, superseded_by) \
         VALUES ('run-history','bead-run-history',?1,'main','forged/run-history','slice/v1', \
                 'stopped','landed',?2,?3,'landed',17,?4,NULL)",
        params![
            repository,
            "2030-01-02T00:00:00.000000000Z",
            "2030-01-06T00:00:00.000000000Z",
            "a".repeat(40),
        ],
    )
    .expect("run");
    let packet_id = "run-history/implementation/1";
    tx.execute(
        "INSERT INTO packets \
         (packet_id, run_id, stage, seq, spec_path, spec_sha256, body_json, created_at, spec_revision) \
         VALUES (?1,'run-history','implement',1,'/tmp/spec.md',?2,?3,?4,NULL)",
        params![
            packet_id,
            "a".repeat(64),
            packet_body("run-history", packet_id, "codex"),
            "2030-01-01T00:00:00.000000000Z",
        ],
    )
    .expect("packet");
    for (claim, state, started, ended) in [
        (
            "claim-old",
            "failed",
            "2030-01-01T10:00:00.000000000Z",
            "2030-01-01T11:00:00.000000000Z",
        ),
        (
            "claim-current",
            "completed",
            "2030-01-03T10:00:00.000000000Z",
            "2030-01-04T11:00:00.000000000Z",
        ),
    ] {
        tx.execute(
            "INSERT INTO attempts \
             (packet_id, claim_token, claimant, state, started_at, updated_at, ended_at) \
             VALUES (?1,?2,'codex:packet:1',?3,?4,?5,?5)",
            params![packet_id, claim, state, started, ended],
        )
        .expect("attempt");
    }
    let events = [
        (
            "2030-01-01T10:00:00.000000000Z",
            "run-history",
            "attempt.state",
            json!({"attemptId": 1, "packetId": packet_id, "old": null, "new": "running"}),
        ),
        (
            "2030-01-01T11:00:00.000000000Z",
            "run-history",
            "attempt.state",
            json!({"attemptId": 1, "packetId": packet_id, "old": "running", "new": "failed"}),
        ),
        (
            "2030-01-02T00:00:00.000000000Z",
            "epic-history",
            "forged.epic.started",
            json!({"epicId":"epic-history", "executionPackage": {}}),
        ),
        (
            "2030-01-03T10:00:00.000000000Z",
            "run-history",
            "attempt.state",
            json!({"attemptId": 2, "packetId": packet_id, "old": null, "new": "running"}),
        ),
        (
            "2030-01-04T11:00:00.000000000Z",
            "run-history",
            "attempt.state",
            json!({"attemptId": 2, "packetId": packet_id, "old": "running", "new": "completed"}),
        ),
        (
            "2030-01-05T00:00:00.000000000Z",
            "run-history",
            "forged.profile.escalated",
            json!({"from":"fast", "to":"deep", "trigger":"review"}),
        ),
        (
            "2030-01-06T00:00:00.000000000Z",
            "run-history",
            "run.settled",
            json!({"schemaVersion":1, "runId":"run-history", "outcome":"landed"}),
        ),
    ];
    for (ts, run_id, kind, payload) in events {
        tx.execute(
            "INSERT INTO events (ts, run_id, kind, payload_json) VALUES (?1,?2,?3,?4)",
            params![ts, run_id, kind, payload.to_string()],
        )
        .expect("event");
    }
    for (attempt_id, provider, model, cost, basis, ts) in [
        (
            Some(2_i64),
            "codex",
            "gpt",
            Some(1.25_f64),
            Some("billed"),
            "2030-01-04T12:00:00.000000000Z",
        ),
        (
            None,
            "claude",
            "opus",
            None,
            None,
            "2030-01-05T12:00:00.000000000Z",
        ),
    ] {
        tx.execute(
            "INSERT INTO usage \
             (run_id, packet_id, attempt_id, provider, model, input_tokens, output_tokens, \
              cache_read_tokens, cache_write_tokens, cost_usd, pricing_basis, ts, \
              web_search_requests) \
             VALUES ('run-history',?1,?2,?3,?4,100,20,10,5,?5,?6,?7,1)",
            params![packet_id, attempt_id, provider, model, cost, basis, ts],
        )
        .expect("usage");
    }
    tx.commit().expect("commit fixture");
}

fn history(env: &TestEnv, extra: &[&str]) -> Value {
    let mut args = vec![
        "work", "history", "--from", FROM, "--to", TO, "--bucket", "day",
    ];
    args.extend_from_slice(extra);
    let (_, envelope) = env.forged(&args);
    assert_eq!(envelope["ok"], json!(true), "{envelope}");
    envelope["result"].clone()
}

#[test]
fn repeat_attempts_rates_and_child_spend_are_exact() {
    let env = TestEnv::new("forged-work-history-metrics");
    seed_history(&env);
    let value = history(&env, &["--group-by", "epic"]);
    assert_eq!(value["schema"], json!("forged.work-history/1"));
    assert_eq!(value["window"]["bucketCount"], json!(6));
    assert_eq!(value["metrics"]["runsStarted"], json!(1));
    assert_eq!(value["metrics"]["runsSettled"], json!(1));
    assert_eq!(value["metrics"]["settlements"]["landed"], json!(1));
    assert_eq!(value["metrics"]["epicsStarted"], json!(1));
    assert_eq!(value["metrics"]["attemptsStarted"], json!(1));
    assert_eq!(value["metrics"]["repeatAttempts"], json!(1));
    assert_eq!(value["metrics"]["reworkRate"], json!(1.0));
    assert_eq!(value["metrics"]["terminalAttempts"], json!(1));
    assert_eq!(value["metrics"]["attemptsCompleted"], json!(1));
    assert_eq!(value["metrics"]["failureRate"], json!(0.0));
    assert_eq!(value["metrics"]["attemptStateTransitions"], json!(2));
    assert_eq!(value["metrics"]["escalatedRuns"], json!(1));
    assert_eq!(value["metrics"]["runsWithAttemptActivity"], json!(1));
    assert_eq!(value["metrics"]["escalationRate"], json!(1.0));
    assert_eq!(value["metrics"]["usageRows"], json!(2));
    assert_eq!(value["metrics"]["inputTokens"], json!(200));
    assert_eq!(value["metrics"]["costUsdKnown"], json!(1.25));
    assert_eq!(value["metrics"]["rowsMissingCost"], json!(1));
    assert_eq!(value["coverage"]["durableSubjects"], json!(2));
    assert_eq!(value["coverage"]["livePlanSubjectsExcluded"], json!(true));

    let epic = value["series"]
        .as_array()
        .expect("series")
        .iter()
        .find(|series| series["key"] == json!("epic:epic-history"))
        .expect("epic series");
    assert_eq!(epic["metrics"]["usageRows"], json!(2));
    assert_eq!(epic["epicIdentity"]["subject"]["id"], json!("epic-history"));
    assert_eq!(
        value["series"]
            .as_array()
            .expect("series")
            .iter()
            .map(|series| series["metrics"]["usageRows"].as_u64().unwrap_or(0))
            .sum::<u64>(),
        2,
        "child spend is counted once and no synthetic epic spend is added"
    );
    for subject in value["subjects"].as_array().expect("subjects") {
        assert_eq!(
            subject["identity"]["schema"],
            json!("forged.work-identity/1")
        );
    }
}

#[test]
fn half_open_bounds_and_cursor_request_fence_are_enforced() {
    let env = TestEnv::new("forged-work-history-cursor");
    seed_history(&env);
    let first = history(&env, &["--limit", "1"]);
    let cursor = first["nextCursor"].as_str().expect("cursor").to_owned();
    assert_eq!(first["subjects"].as_array().expect("subjects").len(), 1);
    let second = history(&env, &["--limit", "1", "--cursor", &cursor]);
    assert_eq!(second["subjects"].as_array().expect("subjects").len(), 1);
    assert_ne!(
        first["subjects"][0]["identity"]["subject"],
        second["subjects"][0]["identity"]["subject"]
    );

    let (_, mismatch) = env.forged(&[
        "work", "history", "--from", FROM, "--to", TO, "--bucket", "week", "--limit", "1",
        "--cursor", &cursor,
    ]);
    assert_eq!(mismatch["error"]["code"], json!("INVALID_REQUEST"));
    assert!(mismatch["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("different normalized request")));

    let (_, non_utc) = env.forged(&[
        "work",
        "history",
        "--from",
        "2030-01-02T00:00:00-05:00",
        "--to",
        TO,
    ]);
    assert_eq!(non_utc["error"]["code"], json!("INVALID_REQUEST"));

    let boundary = env
        .forged(&[
            "work",
            "history",
            "--from",
            "2030-01-04T12:00:00Z",
            "--to",
            "2030-01-05T12:00:00Z",
            "--bucket",
            "hour",
        ])
        .1;
    assert_eq!(boundary["result"]["metrics"]["usageRows"], json!(1));
    assert_eq!(boundary["result"]["metrics"]["costUsdKnown"], json!(1.25));

    let (_, too_wide) = env.forged(&[
        "work",
        "history",
        "--from",
        "2028-01-01T00:00:00Z",
        "--to",
        "2030-01-01T00:00:00Z",
    ]);
    assert_eq!(too_wide["error"]["code"], json!("INVALID_REQUEST"));
    assert!(too_wide["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("366 days")));

    let (_, too_many_buckets) = env.forged(&[
        "work",
        "history",
        "--from",
        "2030-01-01T00:00:00Z",
        "--to",
        "2030-02-01T00:00:00Z",
        "--bucket",
        "hour",
    ]);
    assert_eq!(too_many_buckets["error"]["code"], json!("INVALID_REQUEST"));
    assert!(too_many_buckets["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("400 buckets")));
}

#[test]
fn malformed_durable_clocks_fail_closed() {
    let env = TestEnv::new("forged-work-history-malformed-clock");
    seed_history(&env);
    let conn = Connection::open(env.anvil.join("state.db")).expect("sqlite");
    conn.execute(
        "UPDATE usage SET ts = 'not-a-timestamp' WHERE usage_id = 1",
        [],
    )
    .expect("corrupt fixture timestamp");

    let (_, envelope) = env.forged(&[
        "work", "history", "--from", FROM, "--to", TO, "--bucket", "day",
    ]);
    assert_eq!(envelope["ok"], json!(false));
    assert_eq!(envelope["error"]["code"], json!("INTERNAL"));
    assert!(envelope["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("malformed stored timestamp")));

    conn.execute(
        "UPDATE usage SET ts = '2030-01-05T12:00:00-05:00' WHERE usage_id = 1",
        [],
    )
    .expect("write non-UTC fixture timestamp");
    let (_, non_utc) = env.forged(&[
        "work", "history", "--from", FROM, "--to", TO, "--bucket", "day",
    ]);
    assert_eq!(non_utc["ok"], json!(false));
    assert_eq!(non_utc["error"]["code"], json!("INTERNAL"));
    assert!(non_utc["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("malformed stored timestamp")));
}

#[test]
fn legacy_stop_remains_a_subject_without_an_invented_transition() {
    let env = TestEnv::new("forged-work-history-legacy-stop");
    env.forged(&["init"]);
    let repository = forged_types::normalize_repository_path(&env.repos.repo.to_string_lossy())
        .expect("canonical repository");
    let conn = Connection::open(env.anvil.join("state.db")).expect("sqlite");
    insert_identity(
        &conn,
        "run",
        "legacy-stop",
        "Legacy stopped run",
        &repository,
        None,
    );
    conn.execute(
        "INSERT INTO runs \
         (run_id, bead_id, repo, base_ref, branch, protocol, state, stop_reason, \
          created_at, updated_at, terminal_outcome) \
         VALUES ('legacy-stop','bead-legacy-stop',?1,'main','forged/legacy-stop','slice/v1', \
                 'stopped','pre-settlement history','2030-01-01T00:00:00.000000000Z', \
                 '2030-01-03T00:00:00.000000000Z',NULL)",
        [repository],
    )
    .expect("legacy run");

    let value = history(&env, &[]);
    assert_eq!(value["metrics"]["runsStarted"], json!(0));
    assert_eq!(value["metrics"]["runsSettled"], json!(0));
    assert_eq!(
        value["coverage"]["legacyStoppedWithoutSettlement"],
        json!(1)
    );
    assert_eq!(value["subjects"].as_array().expect("subjects").len(), 1);
    assert_eq!(
        value["subjects"][0]["identity"]["subject"]["id"],
        json!("legacy-stop")
    );
    assert_eq!(
        value["subjects"][0]["lastActivityAt"],
        json!("2030-01-03T00:00:00.000000000Z")
    );
}

#[test]
fn production_shaped_provider_cardinality_is_bounded_and_preserves_totals() {
    let env = TestEnv::new("forged-work-history-cardinality");
    seed_history(&env);
    let mut conn = Connection::open(env.anvil.join("state.db")).expect("sqlite");
    let tx = conn.transaction().expect("transaction");
    for index in 0..1_000_u32 {
        tx.execute(
            "INSERT INTO usage \
             (run_id, packet_id, attempt_id, provider, model, input_tokens, output_tokens, \
              cost_usd, pricing_basis, ts) \
             VALUES ('run-history','run-history/implementation/1',NULL,?1,?2,1,0,0.0, \
                     'billed','2030-01-05T13:00:00.000000000Z')",
            params![format!("provider-{index:04}"), format!("model-{index:04}")],
        )
        .expect("usage row");
    }
    tx.execute(
        "INSERT INTO usage \
         (run_id, packet_id, attempt_id, provider, model, input_tokens, output_tokens, \
          cost_usd, pricing_basis, ts) \
         VALUES ('run-history','run-history/implementation/1',NULL,'','unknown-provider',1,0, \
                 NULL,NULL,'2030-01-05T13:00:00.000000000Z')",
        [],
    )
    .expect("unknown provider row");
    tx.commit().expect("fixture commit");

    let value = history(&env, &["--group-by", "provider"]);
    let series = value["series"].as_array().expect("series");
    assert_eq!(series.len(), 50, "series cap: {series:#?}");
    assert!(series.iter().any(|group| group["key"] == json!("unknown")));
    assert!(series.iter().any(|group| group["key"] == json!("other")));
    let aggregate = value["metrics"]["usageRows"].as_u64().expect("aggregate");
    assert_eq!(aggregate, 1_003);
    assert_eq!(
        series
            .iter()
            .map(|group| group["metrics"]["usageRows"].as_u64().unwrap_or(0))
            .sum::<u64>(),
        aggregate,
        "the other fold preserves every raw natural-key row"
    );
    assert_eq!(value["coverage"]["maxGroups"], json!(50));
    assert!(value["coverage"]["groupsCombinedIntoOther"]
        .as_u64()
        .is_some_and(|count| count > 900));
}
