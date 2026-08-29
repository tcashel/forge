//! Exact review-publication contract through the real CLI and fake gh shim.

mod support;

use std::path::PathBuf;
#[cfg(feature = "failpoints")]
use std::process::Stdio;

use forged_ledger::{EffectClass, NewPacket, NewRun, OperationOutcome};
use forged_types::{
    Deliverable, Finding, OperationRequest, OperationResponse, Outcome, PacketResult,
    ProviderHints, RunId, Sandbox, Severity, SpecRef, Stage, StageContract, Verdict, WorkPacket,
};
use serde_json::{json, Map, Value};
use support::{fabricate_run, TestEnv};

fn review_packet(run_id: &str, seq: i64) -> WorkPacket {
    let packet_id = format!("{run_id}/reviewclaude/{seq}");
    WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id,
        run_id: run_id.to_owned(),
        work_id: format!("bead-{run_id}"),
        stage: Stage::ReviewClaude,
        execution: None,
        lane_seq: None,
        spec: SpecRef {
            path: "beads://fixture".to_owned(),
            sha256: "a".repeat(64),
            revision: Some("fixture-revision".to_owned()),
        },
        worktree: PathBuf::from("/unread/worktree"),
        branch: format!("work/{run_id}"),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "review".to_owned(),
            gate_commands: Vec::new(),
            deliverable: Deliverable::ReviewBlock,
            budget_s: 60,
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: ProviderHints {
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            effort: None,
            sandbox: Sandbox::ReadOnly,
        },
        field_notes: Vec::new(),
    }
}

fn open_review_packet(env: &TestEnv, run_id: &str, seq: i64) -> String {
    let packet = review_packet(run_id, seq);
    let packet_id = packet.packet_id.clone();
    let ledger = env.ledger();
    ledger
        .open_packet(NewPacket {
            run_id: run_id.to_owned(),
            stage: packet.stage,
            seq,
            spec_path: packet.spec.path.clone(),
            spec_sha256: packet.spec.sha256.clone(),
            spec_revision: packet.spec.revision.clone(),
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open review packet");
    ledger.close().expect("close ledger");
    packet_id
}

fn insert_completed(env: &TestEnv, packet_id: &str, raw_result: &str) -> i64 {
    let connection = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open db");
    connection
        .execute(
            "INSERT INTO attempts (
               packet_id, claim_token, claimant, state, result_json,
               started_at, updated_at, ended_at
             ) VALUES (?1, ?2, 'fixture', 'completed', ?3,
               '2026-08-15T00:00:00.000000000Z',
               '2026-08-15T00:00:01.000000000Z',
               '2026-08-15T00:00:01.000000000Z')",
            rusqlite::params![packet_id, uuid::Uuid::now_v7().to_string(), raw_result],
        )
        .expect("insert completed attempt");
    connection.last_insert_rowid()
}

fn result(packet_id: &str, findings: Vec<Finding>) -> String {
    serde_json::to_string(&PacketResult {
        schema: "forged.result/1".to_owned(),
        packet_id: packet_id.to_owned(),
        outcome: Outcome::Review {
            verdict: if findings.is_empty() {
                Verdict::Approve
            } else {
                Verdict::RequestChanges
            },
            summary: "fixture review".to_owned(),
            findings,
            available: true,
        },
    })
    .expect("review result")
}

fn finding(severity: Severity, message: &str) -> Finding {
    Finding {
        severity,
        file: Some("src/lib.rs".to_owned()),
        line: Some(7),
        message: message.to_owned(),
    }
}

fn seed_draft_pr(env: &TestEnv, run_id: &str, number: u64) {
    let ledger = env.ledger();
    let key = forged_proto::machine_idempotency_key(run_id, forged_proto::MachineStage::DraftPr, 0);
    let request = OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(run_id.to_owned()),
        params: Map::from_iter([
            ("head".to_owned(), json!(format!("forged/{run_id}"))),
            ("base".to_owned(), json!("main")),
        ]),
    };
    let operation_id = match ledger
        .begin_operation("draftpr", &request, EffectClass::ObserveOnly, None)
        .expect("begin draftpr")
    {
        OperationOutcome::Fresh(ticket) => ticket.operation_id,
        OperationOutcome::Replayed(_) => panic!("fixture draftpr unexpectedly replayed"),
    };
    let response = OperationResponse {
        operation_id: operation_id.clone(),
        reused: false,
        ok: true,
        result: Some(json!({
            "pr": {
                "number": number,
                "isDraft": true,
                "baseRefName": "main",
                "headRefName": format!("forged/{run_id}"),
                "url": format!("https://github.com/acme/widget/pull/{number}")
            }
        })),
        error: None,
    };
    ledger
        .complete_operation(&operation_id, &response)
        .expect("complete draftpr");
    ledger.close().expect("close ledger");
}

fn set_gh_success(env: &TestEnv) {
    env.gh_set("list_comments", "stdout", "[]");
    env.gh_set("post_comment", "stdout", r#"{"id":1,"body":"created"}"#);
}

fn publish(env: &TestEnv, run_id: &str) -> (i32, Value) {
    env.forged(&["review", "publish", "--run", run_id])
}

fn publish_with_key(env: &TestEnv, run_id: &str, key: &str) -> (i32, Value) {
    env.forged(&[
        "review",
        "publish",
        "--run",
        run_id,
        "--idempotency-key",
        key,
    ])
}

#[test]
fn exact_content_publishes_once_and_delivered_replay_calls_no_github() {
    let env = TestEnv::new("review-publish-exact");
    env.forged(&["init"]);
    fabricate_run(&env, "review-exact");
    let packet_id = open_review_packet(&env, "review-exact", 4);
    let one = finding(Severity::High, "Thing");
    insert_completed(
        &env,
        &packet_id,
        &result(
            &packet_id,
            vec![
                one.clone(),
                one,
                finding(Severity::High, "thing"),
                finding(Severity::High, "Thing "),
                finding(Severity::Low, "Thing"),
            ],
        ),
    );
    seed_draft_pr(&env, "review-exact", 42);
    set_gh_success(&env);

    let (code, first) = publish(&env, "review-exact");
    assert_eq!(code, 0, "{first}");
    assert_eq!(first["result"]["schema"], "forged.review-publication/1");
    assert_eq!(first["result"]["pullRequest"]["repository"], "acme/widget");
    assert_eq!(
        first["result"]["total"], 4,
        "only exact duplicates collapse"
    );
    assert_eq!(first["result"]["posted"], 4);
    assert_eq!(first["result"]["delivered"], 4);
    let connection = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open db");
    let stored_key: String = connection
        .query_row(
            "SELECT idempotency_key FROM operations WHERE operation_id = ?1",
            [first["operationId"].as_str().expect("operation id")],
            |row| row.get(0),
        )
        .expect("stored publication operation");
    assert!(stored_key.contains(first["result"]["snapshotSha256"].as_str().unwrap()));
    drop(connection);
    let first_calls = env.gh_calls();
    assert_eq!(first_calls.len(), 8, "one list plus one post per finding");
    assert!(first_calls
        .iter()
        .all(|call| call.contains(&"repos/acme/widget/issues/42/comments".to_owned())));

    let (code, second) = publish(&env, "review-exact");
    assert_eq!(code, 0, "{second}");
    assert_eq!(second["result"]["posted"], 0);
    assert_eq!(second["result"]["delivered"], 4);
    assert_eq!(
        env.gh_calls().len(),
        first_calls.len(),
        "delivered rows make zero gh calls"
    );

    let (code, third) = publish(&env, "review-exact");
    assert_eq!(code, 0, "{third}");
    assert_eq!(
        third["reused"], true,
        "settled delivered generation replays"
    );
    assert_eq!(env.gh_calls().len(), first_calls.len());
}

#[test]
fn explicit_key_retains_normal_request_hash_replay_semantics() {
    let env = TestEnv::new("review-publish-explicit-key");
    env.forged(&["init"]);
    fabricate_run(&env, "review-explicit");
    let packet_id = open_review_packet(&env, "review-explicit", 1);
    insert_completed(
        &env,
        &packet_id,
        &result(&packet_id, vec![finding(Severity::High, "explicit")]),
    );
    seed_draft_pr(&env, "review-explicit", 43);
    set_gh_success(&env);

    let (code, first) = publish_with_key(&env, "review-explicit", "operator-key");
    assert_eq!(code, 0, "{first}");
    assert_eq!(first["result"]["posted"], 1);
    let calls = env.gh_calls().len();

    let (code, replay) = publish_with_key(&env, "review-explicit", "operator-key");
    assert_eq!(code, 0, "{replay}");
    assert_eq!(replay["reused"], true);
    assert_eq!(replay["operationId"], first["operationId"]);
    assert_eq!(env.gh_calls().len(), calls);
}

#[test]
fn early_noop_and_changed_same_round_snapshot_do_not_poison_later_publication() {
    let env = TestEnv::new("review-publish-evolution");
    env.forged(&["init"]);
    fabricate_run(&env, "review-evolution");
    let packet_id = open_review_packet(&env, "review-evolution", 2);
    insert_completed(&env, &packet_id, &result(&packet_id, Vec::new()));

    let (code, no_pr) = publish(&env, "review-evolution");
    assert_eq!(code, 0, "{no_pr}");
    assert_eq!(no_pr["result"]["noop"], "no-pull-request");
    assert!(env.gh_calls().is_empty());

    seed_draft_pr(&env, "review-evolution", 8);
    let (code, empty) = publish(&env, "review-evolution");
    assert_eq!(code, 0, "{empty}");
    assert_eq!(empty["result"]["noop"], "no-findings");
    assert_ne!(
        no_pr["result"]["snapshotSha256"], empty["result"]["snapshotSha256"],
        "the exact target participates in the snapshot"
    );

    insert_completed(
        &env,
        &packet_id,
        &result(&packet_id, vec![finding(Severity::Medium, "late finding")]),
    );
    set_gh_success(&env);
    let (code, later) = publish(&env, "review-evolution");
    assert_eq!(code, 0, "{later}");
    assert_eq!(later["result"]["posted"], 1);
    assert_ne!(
        empty["result"]["snapshotSha256"],
        later["result"]["snapshotSha256"]
    );
}

#[test]
fn malformed_newest_result_fails_closed_without_falling_back_or_calling_github() {
    let env = TestEnv::new("review-publish-malformed");
    env.forged(&["init"]);
    fabricate_run(&env, "review-malformed");
    let packet_id = open_review_packet(&env, "review-malformed", 1);
    insert_completed(
        &env,
        &packet_id,
        &result(&packet_id, vec![finding(Severity::High, "older")]),
    );
    insert_completed(&env, &packet_id, "{");
    seed_draft_pr(&env, "review-malformed", 9);
    set_gh_success(&env);

    let (code, response) = publish(&env, "review-malformed");
    assert_ne!(code, 0, "{response}");
    assert_eq!(response["error"]["code"], "INTERNAL");
    assert!(response["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("newest completed result")));
    assert!(env.gh_calls().is_empty());
}

#[test]
fn ambiguous_post_is_reconciled_by_exact_marker_before_any_retry() {
    let env = TestEnv::new("review-publish-uncertain");
    env.forged(&["init"]);
    fabricate_run(&env, "review-uncertain");
    let packet_id = open_review_packet(&env, "review-uncertain", 1);
    insert_completed(
        &env,
        &packet_id,
        &result(&packet_id, vec![finding(Severity::Blocker, "ambiguous")]),
    );
    seed_draft_pr(&env, "review-uncertain", 10);
    env.gh_set("list_comments", "stdout", "[]");
    env.gh_set("post_comment", "stdout", "response lost");

    let (code, first) = publish(&env, "review-uncertain");
    assert_eq!(code, 0, "partial batch is typed: {first}");
    assert_eq!(first["result"]["uncertain"], 1);
    let finding_id = first["result"]["findings"][0]["findingId"]
        .as_str()
        .expect("finding id")
        .to_owned();
    assert_eq!(
        env.gh_calls()
            .iter()
            .filter(|call| call.get(1).map(String::as_str) == Some("--method"))
            .count(),
        1
    );

    env.gh_set(
        "list_comments",
        "stdout",
        &format!(r#"[{{"body":"<!-- anvil-finding id={finding_id} -->\nalready landed"}}]"#),
    );
    let (code, reconciled) = publish(&env, "review-uncertain");
    assert_eq!(code, 0, "{reconciled}");
    assert_eq!(reconciled["result"]["alreadyPresent"], 1);
    assert_eq!(reconciled["result"]["uncertain"], 0);
    assert_eq!(
        env.gh_calls()
            .iter()
            .filter(|call| call.get(1).map(String::as_str) == Some("--method"))
            .count(),
        1,
        "uncertain reconciliation never repeats POST"
    );
}

#[test]
fn definite_probe_failures_record_every_sibling_and_retry_only_undelivered_rows() {
    let env = TestEnv::new("review-publish-retryable");
    env.forged(&["init"]);
    fabricate_run(&env, "review-retryable");
    let packet_id = open_review_packet(&env, "review-retryable", 1);
    insert_completed(
        &env,
        &packet_id,
        &result(
            &packet_id,
            vec![
                finding(Severity::High, "first"),
                finding(Severity::Low, "second"),
            ],
        ),
    );
    seed_draft_pr(&env, "review-retryable", 11);
    env.gh_set("list_comments", "exit", "1");
    env.gh_set("list_comments", "stderr", "network unavailable");

    let (code, failed) = publish(&env, "review-retryable");
    assert_eq!(code, 0, "{failed}");
    assert_eq!(failed["result"]["retryable"], 2);
    assert_eq!(env.gh_calls().len(), 2, "both sibling probes ran");

    let (code, failed_again) = publish(&env, "review-retryable");
    assert_eq!(code, 0, "{failed_again}");
    assert_eq!(failed_again["result"]["retryable"], 2);
    assert_eq!(
        env.gh_calls().len(),
        4,
        "a second definite failure remains retryable rather than replaying"
    );

    env.gh_set("list_comments", "exit", "0");
    env.gh_set("list_comments", "stderr", "");
    set_gh_success(&env);
    let (code, retried) = publish(&env, "review-retryable");
    assert_eq!(code, 0, "{retried}");
    assert_eq!(retried["result"]["posted"], 2);
}

#[test]
fn malformed_or_contradictory_draft_pr_target_fails_closed() {
    let env = TestEnv::new("review-publish-target");
    env.forged(&["init"]);
    let ledger = env.ledger();
    ledger
        .create_run(NewRun {
            run_id: RunId::new("review-target").expect("run id"),
            work_id: "bead-review-target".to_owned(),
            repo: env.repos.repo.to_string_lossy().into_owned(),
            base_ref: "main".to_owned(),
            branch: "forged/review-target".to_owned(),
        })
        .expect("create run");
    ledger.close().expect("close");
    let packet_id = open_review_packet(&env, "review-target", 1);
    insert_completed(
        &env,
        &packet_id,
        &result(&packet_id, vec![finding(Severity::High, "target")]),
    );
    seed_draft_pr(&env, "review-target", 12);
    let connection = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open db");
    let mut response: Value = connection
        .query_row(
            "SELECT response_json FROM operations WHERE name = 'draftpr' AND run_id = 'review-target'",
            [],
            |row| row.get::<_, String>(0),
        )
        .map(|raw| serde_json::from_str(&raw).expect("response JSON"))
        .expect("draftpr response");
    response["result"]["pr"]["url"] = json!("https://github.com/acme/widget/pull/99");
    connection
        .execute(
            "UPDATE operations SET response_json = ?1 WHERE name = 'draftpr' AND run_id = 'review-target'",
            [serde_json::to_string(&response).expect("serialize response")],
        )
        .expect("corrupt target");
    drop(connection);

    let (code, response) = publish(&env, "review-target");
    assert_ne!(code, 0, "{response}");
    assert_eq!(response["error"]["code"], "INTERNAL");
    assert!(response["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("pull request")));
    assert!(env.gh_calls().is_empty());
}

#[cfg(feature = "failpoints")]
#[test]
fn crash_before_post_reuses_the_inflight_wrapper_and_posts_once() {
    let env = TestEnv::new("review-publish-crash-before-post");
    env.forged(&["init"]);
    fabricate_run(&env, "review-crash");
    let packet_id = open_review_packet(&env, "review-crash", 1);
    insert_completed(
        &env,
        &packet_id,
        &result(&packet_id, vec![finding(Severity::High, "crash seam")]),
    );
    seed_draft_pr(&env, "review-crash", 44);
    set_gh_success(&env);

    let mut crashed = env
        .forged_cmd(&["review", "publish", "--run", "review-crash"])
        .env("FORGED_FAILPOINT", "review.publish.post.before")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("publication child spawns");
    assert!(!crashed.wait().expect("publication child exits").success());

    let connection = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open db");
    let (operation_id, operation_key, operation_state): (String, String, String) = connection
        .query_row(
            "SELECT operation_id, idempotency_key, state FROM operations
             WHERE name = 'review_publish' AND run_id = 'review-crash'",
            [],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .expect("interrupted operation");
    assert_eq!(operation_state, "in_progress");
    let (delivery_state, delivery_token): (String, Option<String>) = connection
        .query_row(
            "SELECT state, delivery_token FROM review_finding_deliveries
             WHERE run_id = 'review-crash'",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("interrupted delivery");
    assert_eq!(delivery_state, "uncertain");
    assert!(delivery_token.is_some());
    connection
        .execute(
            "UPDATE operations SET updated_at = '2000-01-01T00:00:00.000000000Z'
             WHERE operation_id = ?1",
            [&operation_id],
        )
        .expect("age operation lease");
    connection
        .execute(
            "UPDATE review_finding_deliveries
             SET delivery_lease_until = '2000-01-01T00:00:00.000000000Z'
             WHERE run_id = 'review-crash'",
            [],
        )
        .expect("age delivery lease");
    drop(connection);

    let (code, recovered) = publish(&env, "review-crash");
    assert_eq!(code, 0, "{recovered}");
    assert_eq!(recovered["operationId"], operation_id);
    assert_eq!(recovered["result"]["posted"], 1);
    assert_eq!(
        env.gh_calls()
            .iter()
            .filter(|call| call.get(1).map(String::as_str) == Some("--method"))
            .count(),
        1,
        "the pre-POST crash cannot duplicate the external effect"
    );

    let connection = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open db");
    let terminal: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM operations WHERE name = 'review_publish'
             AND idempotency_key = ?1 AND state = 'terminal'",
            [&operation_key],
            |row| row.get(0),
        )
        .expect("terminal wrapper count");
    assert_eq!(terminal, 1);
}
