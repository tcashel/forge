#![cfg(feature = "failpoints")]

mod support;

use std::process::Stdio;
use std::time::{Duration, Instant};

use serde_json::{json, Value};
use support::TestEnv;

const WAIT: Duration = Duration::from_secs(30);

fn wait_until(what: &str, mut predicate: impl FnMut() -> bool) {
    let started = Instant::now();
    while !predicate() {
        assert!(started.elapsed() < WAIT, "timed out waiting for {what}");
        std::thread::sleep(Duration::from_millis(25));
    }
}

fn start_run(env: &TestEnv, run_id: &str) {
    env.seed_frontier(run_id);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        run_id,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    env.authorize_run(run_id);
}

fn assert_deadline_kills(env: &TestEnv, run_id: &str, expected: u64) {
    let (code, status) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "run status: {status}");
    assert_eq!(
        status["result"]["run"]["deadlineKills"],
        json!(expected),
        "run status must count stored deadline scopes: {status}"
    );
    let (code, detail) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        run_id,
    ]);
    assert_eq!(code, 0, "work detail: {detail}");
    assert_eq!(
        detail["result"]["deadlineKills"],
        json!(expected),
        "work detail must count stored deadline scopes: {detail}"
    );
}

#[test]
fn deadline_kills_project_from_revoke_scope_while_ordinary_retries_do_not() {
    let env = TestEnv::new("forged-run-status-deadline-kills");
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config JSON");
    config["stage_budget_s"]["implement"] = json!(1);
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize config"),
    )
    .expect("write config");
    env.set_scenario("implement", "hang", 1);
    env.forged(&["init"]);

    let deadline_run = "deadline-projection";
    start_run(&env, deadline_run);
    for _ in 0..2 {
        let (code, advanced) = env.forged(&["run", "advance", "--run", deadline_run]);
        assert_eq!(code, 0, "prepare deadline attempt: {advanced}");
    }
    let failpoint = env.root.join("deadline-projection-failpoint");
    std::fs::create_dir_all(&failpoint).expect("failpoint dir");
    let reached = failpoint.join("provider.spawn.after.reached");
    let release = failpoint.join("provider.spawn.after.release");
    let child = env
        .forged_cmd(&["run", "advance", "--run", deadline_run])
        .env("FORGED_FAILPOINT", "provider.spawn.after")
        .env("FORGED_FAILPOINT_MODE", "pause")
        .env("FORGED_FAILPOINT_DIR", &failpoint)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("deadline advance spawns");
    wait_until("provider.spawn.after", || reached.exists());
    std::thread::sleep(Duration::from_millis(1_100));
    std::fs::write(&release, b"").expect("release deadline failpoint");
    let output = child.wait_with_output().expect("deadline advance exits");
    assert!(
        output.status.success(),
        "deadline advance failed: stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let ledger = env.ledger();
    let deadline_attempt = ledger.get_attempt(1).expect("deadline attempt");
    assert_eq!(deadline_attempt.state, forged_ledger::AttemptState::Failed);
    assert_eq!(
        deadline_attempt.revoke_scope,
        Some(forged_ledger::RevokeScope::Deadline)
    );
    ledger.close().expect("close ledger");
    assert_deadline_kills(&env, deadline_run, 1);

    let ordinary_run = "ordinary-retry-projection";
    config["stage_budget_s"]["implement"] = json!(1_800);
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize reset config"),
    )
    .expect("reset config");
    env.set_scenario("implement", "rate-limit", 1);
    start_run(&env, ordinary_run);
    for _ in 0..3 {
        let (code, advanced) = env.forged(&["run", "advance", "--run", ordinary_run]);
        assert_eq!(code, 0, "advance ordinary retry: {advanced}");
    }
    let ledger = env.ledger();
    let ordinary_attempts = ledger
        .list_attempts_in_state(Some(ordinary_run), forged_ledger::AttemptState::Failed)
        .expect("ordinary failed attempts");
    assert_eq!(ordinary_attempts.len(), 1);
    let ordinary_attempt = &ordinary_attempts[0];
    assert_eq!(ordinary_attempt.revoke_scope, None);
    ledger.close().expect("close ledger");
    assert_deadline_kills(&env, ordinary_run, 0);
}
