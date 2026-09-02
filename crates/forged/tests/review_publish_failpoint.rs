#![cfg(feature = "failpoints")]

//! Failpoint-only review-publication coverage.

mod support;

use std::process::Stdio;

use forged_types::Severity;
use support::review_publish::*;
use support::{fabricate_run, TestEnv};

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
