//! Exact review-publication contract through the real CLI and fake gh shim.

mod support;

use support::review_publish::*;

use forged_ledger::NewRun;
use forged_types::{RunId, Severity};
use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

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
