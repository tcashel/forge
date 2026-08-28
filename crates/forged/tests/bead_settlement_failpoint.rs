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
                "observedHolder": format!("forged:{bead}:0"),
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

/// Every `work.updated` payload for one item, oldest first (coordination
/// events carry no run id, so the scan is over the whole stream).
fn work_updates(env: &TestEnv, bead: &str) -> Vec<Value> {
    let ledger = env.ledger();
    let events = ledger.list_events(None, 0, 65_536).expect("events");
    ledger.close().expect("close");
    events
        .into_iter()
        .filter(|event| event.kind == "work.updated")
        .map(|event| serde_json::from_str::<Value>(&event.payload_json).expect("payload"))
        .filter(|payload| payload["workId"] == json!(bead))
        .collect()
}

/// Closes recorded for one item (status moved to closed).
fn close_writes(env: &TestEnv, bead: &str) -> usize {
    work_updates(env, bead)
        .into_iter()
        .filter(|update| update["status"]["to"] == json!("closed"))
        .count()
}

fn used(env: &TestEnv, run: &str) -> Option<u32> {
    let ledger = env.ledger();
    let row = ledger.get_bead_settlement_retry(run).expect("retry row");
    ledger.close().expect("close");
    row.map(|row| row.used)
}

fn claim_token(env: &TestEnv, run: &str) -> Option<String> {
    let ledger = env.ledger();
    let row = ledger.get_bead_settlement_retry(run).expect("retry row");
    ledger.close().expect("close");
    row.and_then(|row| row.claim_token)
}

/// Make every persisted mutating-retry wake and probe wake due, the way
/// elapsed wall-clock time would.
fn rewind_wakes(env: &TestEnv) {
    let conn = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db");
    conn.execute(
        "UPDATE bead_settlement_retry \
         SET next_wake_at = '2000-01-01T00:00:00.000000000Z', \
             probe_wake_at = '2000-01-01T00:00:00.000000000Z'",
        [],
    )
    .expect("rewind wakes");
}

/// Expire a crashed executor's standing claim lease, the way the
/// backoff-cap interval passing would.
fn expire_claim_leases(env: &TestEnv) {
    let conn = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db");
    conn.execute(
        "UPDATE bead_settlement_retry \
         SET claim_lease_until = '2000-01-01T00:00:00.000000000Z' \
         WHERE claim_token IS NOT NULL",
        [],
    )
    .expect("expire claim leases");
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
    assert!(work_updates(&env, &bead).is_empty());
    assert_eq!(used(&env, run), None, "a read-only pass charges nothing");

    let report = supervise_once(&env);
    assert_eq!(
        report["beadSettlement"]["actions"][0]["action"],
        json!("converged")
    );
    assert_eq!(event_count(&env, run, "run.bead-settlement.succeeded"), 1);
    assert!(
        work_updates(&env, &bead).is_empty(),
        "recovery converges with no work mutation or note"
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

    // The promise stays owed until an attempt actually delivers it: the
    // next pass takes guarded custody of the reopened, unassigned bead
    // (the landed-over-unassigned path) and closes it for real — success
    // is recorded only behind that delivery, never over the raced state.
    rewind_wakes(&env);
    supervise_once(&env);
    assert_eq!(event_count(&env, run, "run.bead-settlement.succeeded"), 1);
    assert_eq!(
        close_writes(&env, &bead),
        1,
        "the recovery attempt performs the one real close"
    );
    assert_eq!(env.assignee(&bead), None);
}

/// Settlement notes recorded for one item (the bd comment's replacement).
fn comment_calls(env: &TestEnv, bead: &str) -> usize {
    let ledger = env.ledger();
    let events = ledger.list_events(None, 0, 65_536).expect("events");
    ledger.close().expect("close");
    events
        .into_iter()
        .filter(|event| event.kind == "work.settled.note" && event.payload_json.contains(bead))
        .count()
}

/// Guarded custody takes recorded for one item.
fn custody_calls(env: &TestEnv, bead: &str) -> usize {
    work_updates(env, bead)
        .into_iter()
        .filter(|update| update["verb"] == json!("assign-unassigned"))
        .count()
}

/// The blocked→accept-risk→landed crash window: guarded custody of the
/// blocked/open, unassigned bead landed, the process died before the close. The
/// next attempt finds a held bead and closes it — one close, one comment,
/// no second custody write.
#[test]
fn a_crash_between_guarded_custody_and_close_converges_without_a_duplicate_comment() {
    let env = TestEnv::new("km-bead-settlement-custody");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "km-bsr-claim";
    let bead = seed_pending(&env, run, "bead is open and unassigned");
    env.set_bead_field(&bead, "status", "open");
    let expected = format!("forged:{bead}:0");

    crash_supervise_at(&env, "bead-settlement.landed-custody.after");
    assert_eq!(
        env.assignee(&bead).as_deref(),
        Some(expected.as_str()),
        "the crash leaves guarded custody held"
    );
    assert_eq!(
        used(&env, run),
        Some(1),
        "the interrupted attempt charged once"
    );
    assert_eq!(event_count(&env, run, "run.bead-settlement.succeeded"), 0);
    assert_eq!(
        comment_calls(&env, &bead),
        0,
        "the crash fired before the close and its comment"
    );

    // The crashed executor's extended mutation lease parks the run until it
    // expires; recovery then claims and finishes the held close.
    rewind_wakes(&env);
    expire_claim_leases(&env);
    supervise_once(&env);
    assert_eq!(env.assignee(&bead), None);
    assert_eq!(event_count(&env, run, "run.bead-settlement.succeeded"), 1);
    assert_eq!(comment_calls(&env, &bead), 1, "no duplicate comment");
    assert_eq!(
        custody_calls(&env, &bead),
        1,
        "the recovery attempt closes the held bead without retaking custody"
    );
    assert_eq!(used(&env, run), Some(2));
}

fn supervise_once_with_fail(env: &TestEnv, site: &str) -> Value {
    let out = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", site)
        .env("FORGED_FAILPOINT_MODE", "fail")
        .output()
        .expect("supervise child spawns");
    assert!(
        out.status.success(),
        "an injected per-run failure never fails the tick: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let envelope: Value = serde_json::from_slice(&out.stdout).expect("supervise envelope parses");
    envelope["result"].clone()
}

fn settlement_actions(report: &Value) -> Vec<Value> {
    report["beadSettlement"]["actions"]
        .as_array()
        .cloned()
        .unwrap_or_default()
}

/// Amendment 5, falsified at every exit: an injected failure after a
/// successful per-run claim — deadline computation, the charge call,
/// get_run, the mutation, and both event appends — must release the claim
/// token, and the next pass must claim immediately instead of reporting
/// `contended`.
#[test]
fn every_failure_after_a_successful_claim_releases_the_claim_token() {
    let env = TestEnv::new("km-bead-settlement-hygiene");
    assert_eq!(env.forged(&["init"]).0, 0);
    // Run A: held by its own identity, so the real mutation is the guarded
    // close. Run B: a foreign holder, so the real mutation always fails and
    // exercises the re-pend append.
    let run_a = "km-bsr-hyg-own";
    let bead_a = seed_pending(&env, run_a, "bd timed out mid-close");
    env.set_bead_field(&bead_a, "status", "in_progress");
    env.set_assignee(&bead_a, &format!("forged:{bead_a}:0"));
    let run_b = "km-bsr-hyg-thief";
    let bead_b = seed_pending(&env, run_b, "bd refused the close");
    env.set_bead_field(&bead_b, "status", "in_progress");
    env.set_assignee(&bead_b, "forged:thief:0");

    let sites = [
        "bead-settlement.wake-deadline",
        "bead-settlement.mutation-lease-deadline",
        "bead-settlement.charge",
        "bead-settlement.get-run",
        "bead-settlement.mutation",
        "bead-settlement.append-succeeded",
        "bead-settlement.append-pending",
    ];
    for (index, site) in sites.iter().enumerate() {
        if index > 0 {
            rewind_wakes(&env);
        }
        let report = supervise_once_with_fail(&env, site);
        for action in settlement_actions(&report) {
            assert_ne!(
                action["action"],
                json!("contended"),
                "{site} left a standing claim: {report}"
            );
        }
        for run in [run_a, run_b] {
            assert_eq!(
                claim_token(&env, run),
                None,
                "{site} must release {run}'s claim token"
            );
        }
    }

    // The next unarmed pass claims immediately: the foreign-held run mounts
    // a real (refused) attempt, and the own-held run — whose close landed
    // before its append was injected away — converges without repeating it.
    rewind_wakes(&env);
    let report = supervise_once(&env);
    let refused = settlement_actions(&report)
        .into_iter()
        .find(|action| action["runId"] == json!(run_b))
        .expect("an action for the foreign-held run");
    assert_eq!(refused["action"], json!("retry-failed"), "{report}");
    assert_eq!(event_count(&env, run_a, "run.bead-settlement.succeeded"), 1);
    assert_eq!(
        close_writes(&env, &bead_a),
        1,
        "recovery never repeats the delivered close"
    );
}

/// Amendment 4: the settlement pass never delays due-work claiming, on any
/// tick. With the pass wedged open, later supervisor ticks still claim and
/// settle due desired work, and no second pass spawns while one runs.
#[test]
fn a_wedged_settlement_pass_never_delays_due_work_claiming_or_doubles() {
    let env = TestEnv::new("km-bead-settlement-wedge");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "km-bsr-wedge";
    let bead = seed_pending(&env, run, "bd lease held");
    env.set_bead_field(&bead, "status", "closed");

    // A due desired subject the ticks must keep claiming: an authorized,
    // already-stopped run that admission settles as ineligible-terminal.
    let due_run = "km-bsr-due";
    fabricate_run(&env, due_run);
    {
        let ledger = env.ledger();
        ledger
            .settle_run(
                due_run,
                RunOutcome::Cancelled,
                "already stopped".to_owned(),
                None,
                None,
                None,
            )
            .expect("settle due run");
        ledger.close().expect("close");
    }

    let fp = env.anvil.join("failpoints");
    std::fs::create_dir_all(&fp).expect("failpoint dir");
    let mut supervisor = env
        .forged_cmd(&["supervise"])
        .env("FORGED_FAILPOINT", "bead-settlement.read.after")
        .env("FORGED_FAILPOINT_MODE", "pause")
        .env("FORGED_FAILPOINT_DIR", &fp)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("supervisor spawns");
    let reached = fp.join("bead-settlement.read.after.reached");
    wait_until("the settlement pass wedges open", || reached.exists());

    // Authorized while the pass is wedged: only a LATER tick can see it.
    env.authorize_run(due_run);
    wait_until(
        "a later tick claims due work while the pass is wedged",
        || {
            assert!(reached.exists(), "the pass stayed wedged");
            let ledger = env.ledger();
            let reconciled = ledger
                .get_desired_work(forged_ledger::DesiredSubjectKind::Run, due_run)
                .expect("desired query")
                .is_some_and(|row| row.last_outcome.is_some());
            ledger.close().expect("close");
            reconciled
        },
    );
    assert_eq!(
        event_count(&env, run, "run.bead-settlement.succeeded"),
        0,
        "no second settlement pass settles while one is wedged open"
    );

    // Release the wedge: the pass completes and converges the closed bead.
    std::fs::write(fp.join("bead-settlement.read.after.release"), b"").expect("release");
    wait_until("the released pass converges the pending settlement", || {
        event_count(&env, run, "run.bead-settlement.succeeded") == 1
    });
    assert!(
        work_updates(&env, &bead).is_empty(),
        "the wedged-then-released pass converged read-only"
    );
    supervisor.kill().expect("stop supervisor");
    let _ = supervisor.wait();
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
        work_updates(&env, &bead).len(),
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

    rewind_wakes(&env);
    let report = supervise_once(&env);
    assert_eq!(
        report["beadSettlement"]["actions"][0]["action"],
        json!("converged")
    );
    assert_eq!(event_count(&env, run, "run.bead-settlement.succeeded"), 1);
    assert_eq!(
        work_updates(&env, &bead).len(),
        1,
        "recovery never repeats the bd mutation"
    );
    assert_eq!(used(&env, run), Some(1), "recovery charges nothing further");
}
