use std::time::{Duration, Instant};

#[cfg(feature = "failpoints")]
use forged_ledger::{
    DesiredReconcileOutcome, DesiredReconcileUpdate, DesiredState, DesiredSubjectKind,
};
use nix::errno::Errno;
use nix::sys::signal::kill;
#[cfg(feature = "failpoints")]
use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use serde_json::{json, Value};

use super::TestEnv;

pub(crate) const WAIT: Duration = Duration::from_secs(30);

// These cases deliberately create and signal detached process groups and
// assert production timing bounds, so they must never co-schedule. Under
// nextest the `supervise-process-fixtures` group in `.config/nextest.toml`
// enforces that; under any other runner the cases SKIP loudly instead of
// running unserialized. Never reintroduce an in-process lock here: nextest
// runs every test in its own process, where such a lock serializes nothing.

/// Confirm the runner keeps this binary's cases disjoint, or SKIP loudly.
/// `NEXTEST` is set in test environments by nextest (whose test group
/// serializes the binary); `RUST_TEST_THREADS=1` marks a deliberately serial
/// libtest run. The `--test-threads=1` flag leaves no environment trace and
/// cannot be honored here — use the environment variable instead.
pub(crate) fn require_serialized_runner() -> bool {
    if std::env::var_os("NEXTEST").is_some() {
        assert_eq!(
            std::env::var("NEXTEST_TEST_GROUP").ok().as_deref(),
            Some("supervise-process-fixtures"),
            "supervise test is outside `supervise-process-fixtures`; add this binary to the filter in .config/nextest.toml"
        );
        return true;
    }
    if std::env::var("RUST_TEST_THREADS").is_ok_and(|threads| threads == "1") {
        return true;
    }
    eprintln!(
        "SKIP: supervise cases need `cargo nextest run` (serialization \
         contract in .config/nextest.toml) or RUST_TEST_THREADS=1; test not run"
    );
    false
}

pub(crate) fn start_run(env: &TestEnv, run: &str) {
    env.seed_frontier(run);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, response) = env.forged(&[
        "run",
        "start",
        "--work",
        run,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {response}");
}

/// Retry a cleanup `run stop` until it lands, panicking with the LAST
/// refusal envelope on timeout — a bare timeout hides the wedge.
pub(crate) fn stop_until_lands(env: &TestEnv, run: &str, reason: &str, what: &str) {
    // A stop can legitimately defer for the FULL identity grace window
    // (ports.rs IDENTITY_GRACE_S = 60s): when the controller group dies
    // before the provider's start stamp lands, kill confirmation refuses to
    // signal the unverifiable pid until the grace adjudicates it a bounded
    // orphan. The retry budget must outlive that window.
    const STOP_WAIT: Duration = Duration::from_secs(90);
    let started = Instant::now();
    loop {
        let (code, stop) = env.forged(&[
            "run",
            "stop",
            "--run",
            run,
            "--outcome",
            "cancelled",
            "--reason",
            reason,
        ]);
        if code == 0 {
            break;
        }
        assert!(
            started.elapsed() < STOP_WAIT,
            "timed out waiting for {what}; last refusal: {stop}"
        );
        std::thread::sleep(Duration::from_millis(25));
    }
}

pub(crate) fn wait_until(what: &str, mut predicate: impl FnMut() -> bool) {
    let started = Instant::now();
    while !predicate() {
        assert!(started.elapsed() < WAIT, "timed out waiting for {what}");
        std::thread::sleep(Duration::from_millis(25));
    }
}

pub(crate) fn process_group_alive(group: i32) -> bool {
    matches!(
        kill(Pid::from_raw(-group), None),
        Ok(()) | Err(Errno::EPERM)
    )
}

pub(crate) fn controller_pid(response: &Value) -> i32 {
    response["result"]["controller"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid")
}

pub(crate) fn implementation_starts(env: &TestEnv, run: &str) -> usize {
    let prefix = format!("{run}/implementation/0");
    env.provider_log()
        .iter()
        .filter(|line| line.starts_with(&prefix) && line.contains(" start "))
        .count()
}

/// Seconds from `earlier` to `later`, both widened RFC3339 stamps.
pub(crate) fn seconds_between(earlier: &str, later: &str) -> f64 {
    let earlier: jiff::Timestamp = earlier.parse().expect("parse earlier stamp");
    let later: jiff::Timestamp = later.parse().expect("parse later stamp");
    (later.as_nanosecond() - earlier.as_nanosecond()) as f64 / 1e9
}

/// Give replacement admission room while a dead controller's attempt still
/// charges the default single repository-write slot — the same shape the
/// restart-singleton fixture uses.
pub(crate) fn raise_admission_limits(env: &TestEnv) {
    let config_path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(
        &std::fs::read_to_string(&config_path).expect("read admission config"),
    )
    .expect("config JSON");
    config["admission"] = json!({
        "totalActive": 8,
        "providerActive": 4,
        "repositoryWriteActive": 2,
        "deferSeconds": 60,
    });
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize admission config"),
    )
    .expect("write admission config");
}

pub(crate) fn terminal_marker(generation: Option<u32>, message: &str, recoverable: bool) -> Value {
    terminal_marker_with_code(generation, "INVALID_REQUEST", message, recoverable)
}

pub(crate) fn terminal_marker_with_code(
    generation: Option<u32>,
    code: &str,
    message: &str,
    recoverable: bool,
) -> Value {
    json!({
        "schemaVersion": 1,
        "generation": generation,
        "code": code,
        "message": message,
        "recoverable": recoverable,
    })
}

#[cfg(feature = "failpoints")]
pub(crate) fn exhaust_desired_without_controller(
    env: &TestEnv,
    run: &str,
    generation: u32,
    message: &str,
) {
    let ledger = env.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, run, generation)
        .expect("authorize desired fixture");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make desired fixture due");
    let token = format!("exhaust-{run}");
    ledger
        .claim_desired_work(
            DesiredSubjectKind::Run,
            run,
            &token,
            "2099-01-01T00:00:00.000000000Z",
            "2099-01-01T00:01:00.000000000Z",
        )
        .expect("claim desired fixture")
        .expect("desired fixture is claimable");
    ledger
        .finish_desired_reconciliation(
            DesiredSubjectKind::Run,
            run,
            &token,
            DesiredReconcileUpdate {
                desired_state: None,
                outcome: DesiredReconcileOutcome::Exhausted,
                controller_generation: None,
                predecessor_generation: None,
                next_wake_at: None,
                last_progress_at: None,
                last_error: Some(format!(
                    "halted after one nonrecoverable controller failure: {message}"
                )),
                attention_condition: Some("restart-budget-exhausted".to_owned()),
            },
        )
        .expect("exhaust desired fixture");
    ledger.close().expect("close");
}

#[cfg(feature = "failpoints")]
pub(crate) fn current_controller_identity(env: &TestEnv, run: &str) -> (u32, i32) {
    let record: Value = serde_json::from_slice(
        &std::fs::read(
            env.anvil
                .join(format!("runs/{run}/controller/controller.json")),
        )
        .expect("controller record"),
    )
    .expect("controller JSON");
    let generation = record["generation"]
        .as_u64()
        .and_then(|generation| u32::try_from(generation).ok())
        .expect("controller generation");
    let pid = record["driver"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid");
    (generation, pid)
}

#[cfg(feature = "failpoints")]
pub(crate) fn kill_controller_and_make_due(
    env: &TestEnv,
    run: &str,
    generation: u32,
    code: &str,
    message: &str,
    recoverable: bool,
) {
    let (recorded_generation, pid) = current_controller_identity(env, run);
    assert_eq!(recorded_generation, generation);
    killpg(Pid::from_raw(pid), Signal::SIGKILL).expect("kill controller group");
    wait_until("controller group death", || !process_group_alive(pid));
    let ledger = env.ledger();
    ledger
        .append_event(
            Some(run),
            "forged.controller.terminal",
            terminal_marker_with_code(Some(generation), code, message, recoverable),
        )
        .expect("terminal marker");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make dead controller due");
    ledger.close().expect("close");
}
