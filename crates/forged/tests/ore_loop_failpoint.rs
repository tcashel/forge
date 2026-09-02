#![cfg(feature = "failpoints")]

//! Recovery of a frontier run minted before its desired authorization seals.

mod support;

use std::process::Stdio;

use forged_ledger::{DesiredSubjectKind, OperationState};
use serde_json::Value;
use support::TestEnv;

#[test]
fn frontier_dispatch_recovers_run_operation_and_authorization_as_one_effect() {
    let env = TestEnv::new("forged-ore-loop-dispatch-crash");
    env.enable_dynamic_gh();
    env.seed_epic("epic-loop-crash", &[("child-loop-crash", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-loop-crash",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    let (code, submitted) = env.forged(&["epic", "submit", "--epic", "epic-loop-crash"]);
    assert_eq!(code, 0, "epic submit: {submitted}");

    let (code, integration) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "integration tick: {integration}");
    let (code, paused) = env.forged(&[
        "epic",
        "pause",
        "--epic",
        "epic-loop-crash",
        "--reason",
        "wake next pass",
    ]);
    assert_eq!(code, 0, "pause: {paused}");
    let (code, resumed) = env.forged(&[
        "epic",
        "resume",
        "--epic",
        "epic-loop-crash",
        "--reason",
        "dispatch",
    ]);
    assert_eq!(code, 0, "resume: {resumed}");

    let failpoint_dir = env.root.join("fp-ore-loop-dispatch");
    std::fs::create_dir_all(&failpoint_dir).expect("failpoint dir");
    let mut crashed = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "submit.desired.before")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .env("FORGED_FAILPOINT_DIR", &failpoint_dir)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("crashing supervisor");
    assert!(!crashed.wait().expect("supervisor crash").success());

    let ledger = env.ledger();
    assert!(ledger.get_run("child-loop-crash").is_ok());
    assert!(ledger
        .get_desired_work(DesiredSubjectKind::Run, "child-loop-crash")
        .expect("desired lookup after crash")
        .is_none());
    assert_eq!(
        ledger
            .find_operation("run_start", "op:run_start:child-loop-crash:-:-",)
            .expect("operation lookup")
            .expect("interrupted operation")
            .state,
        OperationState::InProgress
    );
    ledger.close().expect("close ledger");

    let connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open desired-work clock");
    connection
        .execute(
            "UPDATE desired_work SET next_wake_at = ?1, reconcile_lease_until = ?1 \
             WHERE subject_kind = 'epic' AND subject_id = ?2",
            rusqlite::params!["2000-01-01T00:00:00.000000000Z", "epic-loop-crash"],
        )
        .expect("expire crashed ore claim");
    drop(connection);

    let (code, recovered) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "recovering supervisor: {recovered}");
    let ledger = env.ledger();
    assert!(ledger
        .get_desired_work(DesiredSubjectKind::Run, "child-loop-crash")
        .expect("recovered desired lookup")
        .is_some());
    assert_eq!(
        ledger
            .find_operation("run_start", "op:run_start:child-loop-crash:-:-",)
            .expect("recovered operation lookup")
            .expect("recovered operation")
            .state,
        OperationState::Terminal
    );
    assert_eq!(
        ledger
            .list_events(Some("child-loop-crash"), 0, 65_536)
            .expect("child events")
            .into_iter()
            .filter(|event| event.kind == "forged.run.spec")
            .count(),
        1,
        "replay must not remint the run"
    );
    let child_events = ledger
        .list_events(Some("epic-loop-crash"), 0, 65_536)
        .expect("epic events")
        .into_iter()
        .filter(|event| event.kind == "forged.epic.child.started")
        .collect::<Vec<_>>();
    assert_eq!(child_events.len(), 1);
    let payload: Value =
        serde_json::from_str(&child_events[0].payload_json).expect("child-started JSON");
    assert_eq!(payload["wave"], Value::Null);
    ledger.close().expect("close ledger");
}
