#![cfg(feature = "failpoints")]

//! Recovery of a frontier run minted before its desired authorization seals.

mod support;

use std::os::unix::fs::MetadataExt;
use std::process::Stdio;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

use forged_ledger::{AttemptState, DesiredSubjectKind, OperationState, RunOutcome};
use serde_json::{json, Value};
use support::TestEnv;

const WAIT: Duration = Duration::from_secs(60);

fn wait_until(what: &str, mut pred: impl FnMut() -> bool) {
    let start = Instant::now();
    while !pred() {
        assert!(start.elapsed() < WAIT, "timed out waiting for {what}");
        std::thread::sleep(Duration::from_millis(10));
    }
}

fn inode(path: &std::path::Path) -> Option<u64> {
    std::fs::metadata(path).ok().map(|metadata| metadata.ino())
}

fn event_count(env: &TestEnv, run: &str, kind: &str) -> usize {
    let ledger = env.ledger();
    let count = ledger
        .list_events(Some(run), 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == kind)
        .count();
    ledger.close().expect("close ledger");
    count
}

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

#[test]
fn roster_revision_re_admits_the_claimed_unspawned_child() {
    let env = TestEnv::new("forged-ore-loop-roster-readmit");
    env.enable_dynamic_gh();
    env.add_uniform_roster("all-codex", "codex", "gpt-5.6-sol");
    env.seed_epic(
        "epic-roster-readmit",
        &[("roster-readmit-child", &env.spec, true)],
    );
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-roster-readmit",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    env.authorize_epic("epic-roster-readmit");

    let mut child_ready_for_admission = false;
    for _ in 0..10 {
        let ledger = env.ledger();
        child_ready_for_admission = ledger
            .get_desired_work(DesiredSubjectKind::Run, "roster-readmit-child")
            .expect("child desired lookup")
            .is_some_and(|row| row.controller_generation == 0);
        ledger.close().expect("close ledger");
        if child_ready_for_admission {
            break;
        }
        let (code, advanced) = env.reconcile_epic("epic-roster-readmit");
        assert_eq!(code, 0, "advance to child admission: {advanced}");
    }
    assert!(
        child_ready_for_admission,
        "the epic must create an unlaunched child desired row"
    );

    let failpoint_dir = env.root.join("fp-roster-readmit");
    std::fs::create_dir_all(&failpoint_dir).expect("failpoint dir");
    env.wake_epic("epic-roster-readmit");
    let output = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "packet.materialize.before")
        .env("FORGED_FAILPOINT_MODE", "pause")
        .env("FORGED_FAILPOINT_DIR", &failpoint_dir)
        .output()
        .expect("admission tick runs");
    assert!(
        output.status.success(),
        "admission tick failed: stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    let reached = failpoint_dir.join("packet.materialize.before.reached");
    let release = failpoint_dir.join("packet.materialize.before.release");
    wait_until("first claimed pre-spawn attempt", || reached.exists());
    let first_reached_inode = inode(&reached).expect("first reached inode");
    let restarted_before = event_count(&env, "roster-readmit-child", "forged.supervisor.restarted");

    let (code, revised) = env.forged(&[
        "epic",
        "revise-roster",
        "--epic",
        "epic-roster-readmit",
        "--roster",
        "all-codex",
        "--reason",
        "pin claim-to-fence re-admission",
    ]);
    assert_eq!(code, 0, "revise roster: {revised}");
    assert_eq!(revised["result"]["revision"], json!(2));
    std::fs::write(&release, b"").expect("release first attempt");

    wait_until("second claimed pre-spawn attempt", || {
        inode(&reached).is_some_and(|current| current != first_reached_inode)
    });
    let second_reached_inode = inode(&reached).expect("second reached inode");
    let ledger = env.ledger();
    let run = ledger.get_run("roster-readmit-child").expect("child run");
    assert_eq!(
        run.terminal_outcome, None,
        "second claim precedes settlement"
    );
    let packet_id = "roster-readmit-child/implementation/0";
    let attempt_ids = ledger
        .list_events(Some("roster-readmit-child"), 0, 65_536)
        .expect("child events")
        .into_iter()
        .filter(|event| event.kind == "attempt.state")
        .filter_map(|event| serde_json::from_str::<Value>(&event.payload_json).ok())
        .filter(|payload| payload["packetId"] == json!(packet_id))
        .filter(|payload| payload["new"] == json!("running"))
        .filter_map(|payload| payload["attemptId"].as_i64())
        .collect::<Vec<_>>();
    assert_eq!(
        attempt_ids.len(),
        2,
        "the second failpoint hit is attempt 2"
    );
    assert_eq!(
        ledger.get_attempt(attempt_ids[0]).expect("attempt 1").state,
        AttemptState::Failed
    );
    assert_eq!(
        ledger.get_attempt(attempt_ids[1]).expect("attempt 2").state,
        AttemptState::Running
    );
    ledger.close().expect("close ledger");

    env.set_scenario("reviewclaude", "approve", 1);
    std::fs::write(&release, b"").expect("release second attempt");
    wait_until("second release consumption", || {
        inode(&reached) != Some(second_reached_inode)
    });
    let done = Arc::new(AtomicBool::new(false));
    let release_done = done.clone();
    let reached_for_release = reached.clone();
    let release_for_release = release.clone();
    let releaser = std::thread::spawn(move || {
        while !release_done.load(Ordering::Relaxed) {
            if reached_for_release.exists() && !release_for_release.exists() {
                std::fs::write(&release_for_release, b"").expect("release later packet");
            }
            std::thread::sleep(Duration::from_millis(10));
        }
    });
    let (code, stopped) = env.drive_epic_to_stop("epic-roster-readmit");
    done.store(true, Ordering::Relaxed);
    releaser.join().expect("releaser joins");
    assert_eq!(code, 0, "drive revised epic: {stopped}");

    let ledger = env.ledger();
    let events = ledger
        .list_events(Some("roster-readmit-child"), 0, 65_536)
        .expect("child events");
    let failed = events
        .iter()
        .filter(|event| event.kind == "attempt.state")
        .filter_map(|event| serde_json::from_str::<Value>(&event.payload_json).ok())
        .find(|payload| {
            payload["packetId"] == json!(packet_id) && payload["new"] == json!("failed")
        })
        .expect("readmitted attempt failure");
    assert_eq!(
        failed["reason"],
        json!(concat!(
            "readmit: admission facts moved: ",
            "claude/opus/repository-write@rev1 -> ",
            "codex/gpt-5.6-sol/repository-write@rev1"
        ))
    );
    let first = ledger.get_attempt(attempt_ids[0]).expect("attempt 1");
    let second = ledger.get_attempt(attempt_ids[1]).expect("attempt 2");
    assert_eq!(first.state, AttemptState::Failed);
    assert_eq!(second.state, AttemptState::Completed);
    assert!(
        second.claimant.starts_with("codex:"),
        "revised claimant: {second:?}"
    );
    assert_eq!(
        ledger
            .get_desired_work(DesiredSubjectKind::Run, "roster-readmit-child")
            .expect("desired lookup")
            .expect("desired row")
            .restart_used,
        1,
        "re-admission must not charge a controller restart"
    );
    assert_eq!(
        ledger
            .get_run("roster-readmit-child")
            .expect("settled child")
            .terminal_outcome,
        Some(RunOutcome::Clean)
    );
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.controller.terminal")
            .count(),
        0
    );
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.supervisor.restarted")
            .count(),
        restarted_before
    );
    assert!(
        !events.iter().any(|event| {
            if event.kind != "proto.retry" {
                return false;
            }
            serde_json::from_str::<Value>(&event.payload_json)
                .ok()
                .is_some_and(|payload| payload["packetId"] == json!(packet_id))
        }),
        "readmission must not append a transport retry grant"
    );
    ledger.close().expect("close ledger");
}
