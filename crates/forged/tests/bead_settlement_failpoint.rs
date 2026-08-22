#![cfg(feature = "failpoints")]

//! Crash windows inside the bead settlement retry pass: between the
//! convergence read and the event append, and between a charged bd mutation
//! and its event append. The run must keep projecting pending, the
//! interrupted attempt must cost at most one budget charge, and the next
//! pass must converge with no duplicate bd mutation or comment.

mod support;

use std::process::Stdio;

use forged_ledger::RunOutcome;
use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

fn seed_pending(env: &TestEnv, run: &str, error: &str) -> String {
    let bead = format!("bead-{run}");
    fabricate_run(env, run);
    let ledger = env.ledger();
    ledger
        .settle_run(
            run,
            RunOutcome::Landed,
            "delivery verified".to_owned(),
            Some(121),
            Some("a".repeat(40)),
            None,
        )
        .expect("settle run");
    ledger
        .append_event(
            Some(run),
            "run.bead-settlement.pending",
            json!({
                "schemaVersion": 1,
                "beadId": bead,
                "outcome": "landed",
                "expectedAssignee": format!("forged:{bead}:0"),
                "settled": false,
                "pending": true,
                "error": error,
            }),
        )
        .expect("pending event");
    ledger.close().expect("close");
    bead
}

fn crash_supervise_at(env: &TestEnv, site: &str) {
    let mut crashed = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", site)
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("supervise child spawns");
    assert!(
        !crashed.wait().expect("supervise crash").success(),
        "the armed tick must abort at {site}"
    );
}

fn supervise_once(env: &TestEnv) -> Value {
    let (code, response) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "supervise --once: {response}");
    response["result"].clone()
}

fn event_count(env: &TestEnv, run: &str, kind: &str) -> usize {
    let ledger = env.ledger();
    let count = ledger
        .list_events(Some(run), 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == kind)
        .count();
    ledger.close().expect("close");
    count
}

fn mutation_calls(env: &TestEnv, bead: &str) -> Vec<String> {
    env.bd_calls()
        .into_iter()
        .filter(|call| {
            call.starts_with(&format!("update {bead} "))
                || call.starts_with(&format!("close {bead} "))
                || call.starts_with(&format!("comment {bead} "))
        })
        .collect()
}

fn used(env: &TestEnv, run: &str) -> Option<u32> {
    let ledger = env.ledger();
    let row = ledger.get_bead_settlement_retry(run).expect("retry row");
    ledger.close().expect("close");
    row.map(|row| row.used)
}

#[test]
fn a_crash_between_the_convergence_read_and_the_append_charges_nothing() {
    let env = TestEnv::new("km-bead-settlement-read");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "km-bsr-read";
    let bead = seed_pending(&env, run, "bd lease held");
    env.set_bead_field(&bead, "status", "closed");

    crash_supervise_at(&env, "bead-settlement.read.after");
    assert_eq!(
        event_count(&env, run, "run.bead-settlement.succeeded"),
        0,
        "the crash lost the append: the run still projects pending"
    );
    assert!(mutation_calls(&env, &bead).is_empty());
    assert_eq!(used(&env, run), None, "a read-only pass charges nothing");

    let report = supervise_once(&env);
    assert_eq!(
        report["beadSettlement"]["actions"][0]["action"],
        json!("converged")
    );
    assert_eq!(event_count(&env, run, "run.bead-settlement.succeeded"), 1);
    assert!(
        mutation_calls(&env, &bead).is_empty(),
        "recovery converges with no bd mutation or comment"
    );
}

fn wait_until(what: &str, mut done: impl FnMut() -> bool) {
    let start = std::time::Instant::now();
    while !done() {
        assert!(
            start.elapsed() < std::time::Duration::from_secs(30),
            "timed out waiting for {what}"
        );
        std::thread::sleep(std::time::Duration::from_millis(25));
    }
}

fn latest_pending(env: &TestEnv, run: &str) -> Value {
    let ledger = env.ledger();
    let events = ledger.list_events(Some(run), 0, 65_536).expect("events");
    ledger.close().expect("close");
    events
        .into_iter()
        .rev()
        .find(|event| event.kind == "run.bead-settlement.pending")
        .map(|event| serde_json::from_str(&event.payload_json).expect("stored payload"))
        .expect("a pending event exists")
}

/// The guarded release CAS fences the assignee alone: a reopen landing
/// between the closed-bead probe and the release yields an open, unassigned
/// bead. The attempt must fail with that evidence — never record settlement
/// success over a bead that no longer matches the promise.
#[test]
fn a_reopen_between_the_charge_and_the_release_fails_the_attempt_not_the_promise() {
    let env = TestEnv::new("km-bead-settlement-reopen");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "km-bsr-reopen";
    let bead = seed_pending(&env, run, "bd timed out mid-close");
    env.set_bead_field(&bead, "status", "closed");
    env.set_assignee(&bead, &format!("forged:{bead}:0"));

    let fp = env.anvil.join("failpoints");
    std::fs::create_dir_all(&fp).expect("failpoint dir");
    let mut paused = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "bead-settlement.charge.after")
        .env("FORGED_FAILPOINT_MODE", "pause")
        .env("FORGED_FAILPOINT_DIR", &fp)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("supervise child spawns");
    wait_until("the charged executor pauses before its release", || {
        fp.join("bead-settlement.charge.after.reached").exists()
    });
    // The concurrent reopen: the closed bead goes back to open while the
    // charged executor is parked between its charge and its guarded release.
    env.set_bead_field(&bead, "status", "open");
    std::fs::write(fp.join("bead-settlement.charge.after.release"), b"").expect("release");
    assert!(
        paused.wait().expect("supervise completes").success(),
        "the tick itself survives the failed attempt"
    );

    assert_eq!(env.assignee(&bead), None, "the release CAS itself fired");
    assert_eq!(
        used(&env, run),
        Some(1),
        "one charge for the failed attempt"
    );
    assert_eq!(
        event_count(&env, run, "run.bead-settlement.succeeded"),
        0,
        "no success is recorded over the reopened bead"
    );
    let repended = latest_pending(&env, run);
    assert!(
        repended["error"]
            .as_str()
            .is_some_and(|error| error.contains("concurrent reopen")),
        "the failed attempt records the race as evidence: {repended}"
    );

    // The promise stays owed: a later pass still refuses to call it settled.
    supervise_once(&env);
    assert_eq!(event_count(&env, run, "run.bead-settlement.succeeded"), 0);
}

#[test]
fn a_crash_after_the_charged_mutation_converges_without_repeating_it() {
    let env = TestEnv::new("km-bead-settlement-mutate");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "km-bsr-mutate";
    let bead = seed_pending(&env, run, "bd timed out mid-close");
    // Closed but still held by this run: the pass performs the one guarded
    // release, then crashes before its event lands.
    env.set_bead_field(&bead, "status", "closed");
    env.set_assignee(&bead, &format!("forged:{bead}:0"));

    crash_supervise_at(&env, "bead-settlement.mutate.after");
    assert_eq!(
        mutation_calls(&env, &bead).len(),
        1,
        "the guarded release fired before the crash"
    );
    assert_eq!(env.assignee(&bead), None);
    assert_eq!(
        used(&env, run),
        Some(1),
        "exactly one budget charge for the interrupted attempt"
    );
    assert_eq!(
        event_count(&env, run, "run.bead-settlement.succeeded"),
        0,
        "the run still projects pending"
    );

    let report = supervise_once(&env);
    assert_eq!(
        report["beadSettlement"]["actions"][0]["action"],
        json!("converged")
    );
    assert_eq!(event_count(&env, run, "run.bead-settlement.succeeded"), 1);
    assert_eq!(
        mutation_calls(&env, &bead).len(),
        1,
        "recovery never repeats the bd mutation"
    );
    assert_eq!(used(&env, run), Some(1), "recovery charges nothing further");
}
