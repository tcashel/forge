//! Supervisor retry of pending whole-run bead settlement: the read-only
//! convergence probe, per-outcome predicates, the bounded mutating budget,
//! and the untouched `run stop` replay discipline.

mod support;

use forged_ledger::RunOutcome;
use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

fn pending_payload(bead: &str, outcome: &str, error: &str) -> Value {
    json!({
        "schemaVersion": 1,
        "beadId": bead,
        "outcome": outcome,
        "expectedAssignee": format!("forged:{bead}:0"),
        "settled": false,
        "pending": true,
        "error": error,
    })
}

/// Fabricate a terminally settled run whose bead settlement is still owed:
/// the run row carries the rebuild inputs and the ledger carries the exact
/// pending event `run stop` records.
#[allow(clippy::too_many_arguments)]
fn seed_pending(
    env: &TestEnv,
    run: &str,
    outcome: RunOutcome,
    reason: &str,
    pr: Option<u64>,
    sha: Option<String>,
    superseded_by: Option<String>,
    error: &str,
) -> String {
    let bead = format!("bead-{run}");
    fabricate_run(env, run);
    let ledger = env.ledger();
    ledger
        .settle_run(run, outcome, reason.to_owned(), pr, sha, superseded_by)
        .expect("settle run");
    ledger
        .append_event(
            Some(run),
            "run.bead-settlement.pending",
            pending_payload(&bead, outcome.as_str(), error),
        )
        .expect("pending event");
    ledger.close().expect("close");
    bead
}

fn supervise_once(env: &TestEnv) -> Value {
    let (code, response) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "supervise --once: {response}");
    response["result"].clone()
}

fn settlement_action(report: &Value, run: &str) -> Value {
    report["beadSettlement"]["actions"]
        .as_array()
        .and_then(|actions| {
            actions
                .iter()
                .find(|action| action["runId"] == json!(run))
                .cloned()
        })
        .unwrap_or_else(|| panic!("the tick reports a bead settlement action for {run}: {report}"))
}

/// Every bd write the shim recorded against one bead. `show`, `comments`,
/// `list` and friends are reads and deliberately absent.
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

fn show_calls(env: &TestEnv, bead: &str) -> usize {
    env.bd_calls()
        .iter()
        .filter(|call| call.starts_with("show ") && call.contains(bead))
        .count()
}

fn settlement_events(env: &TestEnv, run: &str, kind: &str) -> Vec<Value> {
    let ledger = env.ledger();
    let events = ledger.list_events(Some(run), 0, 65_536).expect("events");
    ledger.close().expect("close");
    events
        .into_iter()
        .filter(|event| event.kind == kind)
        .map(|event| serde_json::from_str(&event.payload_json).expect("stored payload"))
        .collect()
}

fn retry_row(env: &TestEnv, run: &str) -> Option<forged_ledger::BeadSettlementRetryRow> {
    let ledger = env.ledger();
    let row = ledger.get_bead_settlement_retry(run).expect("retry row");
    ledger.close().expect("close");
    row
}

/// Make the persisted mutating-retry wake due, the way elapsed wall-clock
/// time would.
fn rewind_wake(env: &TestEnv, run: &str) {
    let conn = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db");
    let rewound = conn
        .execute(
            "UPDATE bead_settlement_retry \
             SET next_wake_at = '2000-01-01T00:00:00.000000000Z' WHERE run_id = ?1",
            [run],
        )
        .expect("rewind wake");
    assert_eq!(rewound, 1, "the retry row exists to rewind");
}

fn attention_conditions(env: &TestEnv, run: &str) -> Vec<Value> {
    let (code, response) = env.forged(&["overview"]);
    assert_eq!(code, 0, "overview: {response}");
    response["result"]["attention"]
        .as_array()
        .expect("attention rail")
        .iter()
        .filter(|item| item["id"] == json!(run))
        .map(|item| item["condition"].clone())
        .collect()
}

fn queue_blocker(env: &TestEnv, run: &str) -> Value {
    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    response["result"]["runs"]
        .as_array()
        .expect("runs array")
        .iter()
        .find(|entry| entry["id"] == json!(run))
        .unwrap_or_else(|| panic!("work list lists {run}: {response}"))["blocker"]
        .clone()
}

#[test]
fn a_closed_bead_converges_read_only_and_clears_the_operator_surfaces() {
    let env = TestEnv::new("bsr-closed");
    env.forged(&["init"]);
    let run = "bsr-closed";
    let bead = seed_pending(
        &env,
        run,
        RunOutcome::Landed,
        "delivery verified",
        Some(121),
        Some("a".repeat(40)),
        None,
        "bead bead-bsr-closed lease held by another actor",
    );
    // The operator already closed the bead by hand after the lease expired.
    env.set_bead_field(&bead, "status", "closed");

    assert_eq!(
        attention_conditions(&env, run),
        vec![json!("beads-settlement-pending")],
        "the fixture raises the standing attention condition"
    );
    assert!(queue_blocker(&env, run)
        .as_str()
        .is_some_and(|blocker| blocker.contains("Beads reconciliation is pending")));

    let mutations_before = mutation_calls(&env, &bead).len();
    let report = supervise_once(&env);
    let action = settlement_action(&report, run);
    assert_eq!(action["action"], json!("converged"), "{report}");
    assert_eq!(action["appended"], json!(true));

    assert_eq!(
        mutation_calls(&env, &bead).len(),
        mutations_before,
        "convergence is read-only: zero bd mutations"
    );
    let succeeded = settlement_events(&env, run, "run.bead-settlement.succeeded");
    assert_eq!(succeeded.len(), 1);
    assert_eq!(
        succeeded[0],
        json!({
            "schema": "forged.bead-settlement/1",
            "beadId": bead,
            "outcome": "landed",
            "settled": true,
        })
    );
    assert!(
        retry_row(&env, run).is_none(),
        "the read-only probe never opens a mutating budget"
    );

    assert_eq!(
        attention_conditions(&env, run),
        Vec::<Value>::new(),
        "the attention rail clears for the converged run"
    );
    assert_eq!(
        queue_blocker(&env, run),
        json!("delivery verified"),
        "the queue card blocker falls back to the stop reason"
    );

    // The run has left the queue: a later tick discovers nothing for it.
    let quiet = supervise_once(&env);
    assert_eq!(quiet["beadSettlement"]["pending"], json!(0), "{quiet}");
    assert_eq!(
        settlement_events(&env, run, "run.bead-settlement.succeeded").len(),
        1,
        "convergence appends exactly once"
    );
}

#[test]
fn per_outcome_convergence_hands_off_foreign_custody_and_releases_held_closed() {
    let env = TestEnv::new("bsr-outcomes");
    env.forged(&["init"]);

    // Superseded, with the successor holding the bead: foreign custody
    // converges and the settlement hands off without touching the claim.
    let superseded_bead = seed_pending(
        &env,
        "bsr-superseded",
        RunOutcome::Superseded,
        "replaced by successor",
        None,
        None,
        Some("bsr-successor".to_owned()),
        "bead is claimed by the successor",
    );
    env.set_bead_field(&superseded_bead, "status", "in_progress");
    env.set_assignee(&superseded_bead, "forged:successor:0");

    // Blocked, with the bead already unassigned: converges as-is.
    let blocked_bead = seed_pending(
        &env,
        "bsr-blocked",
        RunOutcome::Blocked,
        "waiting on a migration decision",
        None,
        None,
        None,
        "bd was unreachable",
    );
    env.set_bead_field(&blocked_bead, "status", "open");

    // Closed but still held by this run's own lease identity: exactly one
    // guarded release is permitted, then the settlement succeeds.
    let held_bead = seed_pending(
        &env,
        "bsr-held",
        RunOutcome::Landed,
        "delivery verified",
        Some(122),
        Some("b".repeat(40)),
        None,
        "bd timed out mid-close",
    );
    env.set_bead_field(&held_bead, "status", "closed");
    env.set_assignee(&held_bead, &format!("forged:{held_bead}:0"));

    let report = supervise_once(&env);
    assert_eq!(
        settlement_action(&report, "bsr-superseded")["action"],
        json!("converged")
    );
    assert_eq!(
        settlement_action(&report, "bsr-blocked")["action"],
        json!("converged")
    );
    let held = settlement_action(&report, "bsr-held");
    assert_eq!(held["action"], json!("retried"), "{report}");
    assert_eq!(held["attempt"], json!(1));
    assert_eq!(held["settled"], json!(true));

    assert!(mutation_calls(&env, &superseded_bead).is_empty());
    assert_eq!(
        env.assignee(&superseded_bead).as_deref(),
        Some("forged:successor:0"),
        "foreign custody hands off: the successor claim is never touched"
    );
    assert!(mutation_calls(&env, &blocked_bead).is_empty());

    let releases = mutation_calls(&env, &held_bead);
    assert_eq!(
        releases.len(),
        1,
        "exactly one guarded release: {releases:?}"
    );
    assert!(
        releases[0].contains(&format!("--if-assignee forged:{held_bead}:0"))
            && !releases[0].contains("--status"),
        "the release is the assignee CAS alone: {releases:?}"
    );
    assert_eq!(env.assignee(&held_bead), None);
    let held_retry = retry_row(&env, "bsr-held").expect("charged retry row");
    assert_eq!(
        held_retry.used, 1,
        "the guarded release is a charged mutation"
    );

    for run in ["bsr-superseded", "bsr-blocked", "bsr-held"] {
        assert_eq!(
            settlement_events(&env, run, "run.bead-settlement.succeeded").len(),
            1,
            "{run} records succeeded"
        );
        // The blocked run legitimately keeps its own `blocked` condition —
        // only the settlement promise clears.
        assert!(
            !attention_conditions(&env, run).contains(&json!("beads-settlement-pending")),
            "{run} still flags a settled promise"
        );
    }
}

#[test]
fn frontier_custody_is_settled_under_the_frontier_actor_never_read_as_foreign() {
    let env = TestEnv::new("bsr-frontier");
    env.forged(&["init"]);

    // Cancelled, with the bead still held under the frontier identity from
    // its claim-next dispatch: this is forged's OWN claim, not a successor
    // handoff — the release is owed, and it must be guarded by the frontier
    // actor the bead is actually held under.
    let cancelled_bead = seed_pending(
        &env,
        "bsr-fr-cancel",
        RunOutcome::Cancelled,
        "operator cancelled",
        None,
        None,
        None,
        "bd was unreachable",
    );
    env.set_bead_field(&cancelled_bead, "status", "in_progress");
    env.set_assignee(&cancelled_bead, "forged:frontier:0");

    // Landed, closed but still held by the frontier claim: exactly one
    // guarded release, under the frontier actor.
    let held_bead = seed_pending(
        &env,
        "bsr-fr-held",
        RunOutcome::Landed,
        "delivery verified",
        Some(124),
        Some("d".repeat(40)),
        None,
        "bd timed out mid-close",
    );
    env.set_bead_field(&held_bead, "status", "closed");
    env.set_assignee(&held_bead, "forged:frontier:0");

    let report = supervise_once(&env);
    for run in ["bsr-fr-cancel", "bsr-fr-held"] {
        let action = settlement_action(&report, run);
        assert_eq!(
            action["action"],
            json!("retried"),
            "{run} mutates under its own frontier claim, never converges \
             read-only over it: {report}"
        );
        assert_eq!(action["settled"], json!(true), "{report}");
        assert_eq!(
            settlement_events(&env, run, "run.bead-settlement.succeeded").len(),
            1,
            "{run} records succeeded"
        );
    }

    let cancel_updates: Vec<String> = mutation_calls(&env, &cancelled_bead)
        .into_iter()
        .filter(|call| call.starts_with("update "))
        .collect();
    assert_eq!(cancel_updates.len(), 1, "{cancel_updates:?}");
    assert!(
        cancel_updates[0].contains("--if-assignee forged:frontier:0")
            && cancel_updates[0].contains("--actor forged:frontier:0"),
        "the release CAS names the frontier claim: {cancel_updates:?}"
    );
    assert_eq!(env.assignee(&cancelled_bead), None);

    let releases = mutation_calls(&env, &held_bead);
    assert_eq!(releases.len(), 1, "one guarded release: {releases:?}");
    assert!(
        releases[0].contains("--if-assignee forged:frontier:0")
            && !releases[0].contains("--status"),
        "the release is the frontier-guarded assignee CAS alone: {releases:?}"
    );
    assert_eq!(env.assignee(&held_bead), None);
}

#[test]
fn a_failing_close_charges_monotonically_backs_off_and_exhausts_while_the_probe_survives() {
    let env = TestEnv::new("bsr-stuck");
    env.forged(&["init"]);
    let run = "bsr-stuck";
    let bead = seed_pending(
        &env,
        run,
        RunOutcome::Landed,
        "delivery verified",
        Some(123),
        Some("c".repeat(40)),
        None,
        "bd refused the close",
    );
    // A foreign, unexpired holder that never yields: landed promises a
    // close, so every guarded attempt is refused without converging.
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, "forged:thief:0");

    let first = settlement_action(&supervise_once(&env), run);
    assert_eq!(first["action"], json!("retry-failed"), "{first}");
    assert_eq!(first["attempt"], json!(1));
    let row = retry_row(&env, run).expect("retry row");
    assert_eq!(row.used, 1);
    let wake = row.next_wake_at.expect("charged wake");
    assert!(
        wake.as_str() > support_now().as_str(),
        "charge persists a future wake: {wake}"
    );

    // Within the backoff window the mutating retry is parked; the probe ran
    // but nothing was charged and no new evidence was appended.
    let parked = settlement_action(&supervise_once(&env), run);
    assert_eq!(parked["action"], json!("waiting"), "{parked}");
    assert_eq!(retry_row(&env, run).expect("row").used, 1);
    assert_eq!(
        settlement_events(&env, run, "run.bead-settlement.pending").len(),
        2,
        "the parked pass appends nothing"
    );

    for attempt in 2..=8u32 {
        rewind_wake(&env, run);
        let action = settlement_action(&supervise_once(&env), run);
        assert_eq!(action["action"], json!("retry-failed"), "{action}");
        assert_eq!(action["attempt"], json!(attempt));
    }
    let pendings = settlement_events(&env, run, "run.bead-settlement.pending");
    assert_eq!(pendings.len(), 9, "the original promise plus eight retries");
    for (index, payload) in pendings.iter().enumerate().skip(1) {
        assert_eq!(
            payload["attempt"],
            json!(index),
            "the attempt counter is monotonic: {payload}"
        );
        assert!(
            payload["error"].as_str().is_some_and(|e| !e.is_empty()),
            "every retry re-records its error: {payload}"
        );
    }
    let last = pendings.last().expect("final attempt");
    assert_eq!(last["retriesExhausted"], json!(true));
    assert_eq!(last["attempts"], json!(8));

    // Budget spent: mutation stops, the read-only probe keeps running.
    rewind_wake(&env, run);
    let mutations_at_exhaustion = mutation_calls(&env, &bead).len();
    let probes_before = show_calls(&env, &bead);
    let exhausted = settlement_action(&supervise_once(&env), run);
    assert_eq!(exhausted["action"], json!("exhausted"), "{exhausted}");
    assert_eq!(exhausted["attempts"], json!(8));
    assert_eq!(retry_row(&env, run).expect("row").used, 8);
    assert_eq!(mutation_calls(&env, &bead).len(), mutations_at_exhaustion);
    assert!(
        show_calls(&env, &bead) > probes_before,
        "the convergence probe outlives exhaustion"
    );
    assert_eq!(
        settlement_events(&env, run, "run.bead-settlement.pending").len(),
        9,
        "exhaustion appends no duplicate evidence"
    );
    assert_eq!(
        attention_conditions(&env, run),
        vec![json!("beads-settlement-pending")],
        "the standing condition keeps flagging the owed promise"
    );
    let (code, overview) = env.forged(&["overview"]);
    assert_eq!(code, 0, "overview: {overview}");
    let evidence = overview["result"]["attention"]
        .as_array()
        .expect("attention rail")
        .iter()
        .find(|item| item["id"] == json!(run))
        .expect("exhausted settlement item")["evidence"]
        .clone();
    assert_eq!(evidence["retriesExhausted"], json!(true), "{evidence}");
    assert_eq!(evidence["attempts"], json!(8), "{evidence}");

    // Manual repair: the operator closes the bead by hand. The eternal
    // probe converges it read-only on the next pass.
    env.set_bead_field(&bead, "status", "closed");
    env.set_bead_field(&bead, "assignee", "");
    let repaired = settlement_action(&supervise_once(&env), run);
    assert_eq!(repaired["action"], json!("converged"), "{repaired}");
    assert_eq!(mutation_calls(&env, &bead).len(), mutations_at_exhaustion);
    assert_eq!(
        settlement_events(&env, run, "run.bead-settlement.succeeded").len(),
        1
    );
    assert_eq!(attention_conditions(&env, run), Vec::<Value>::new());
}

/// `now` in the ledger's own timestamp shape, for lexicographic comparison.
fn support_now() -> String {
    jiff::Timestamp::now().to_string()
}

#[test]
fn replaying_the_original_run_stop_is_untouched_by_supervisor_convergence() {
    let env = TestEnv::new("bsr-replay");
    env.forged(&["init"]);
    let run = "bsr-replay";
    let bead = format!("bead-{run}");
    fabricate_run(&env, run);
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, &format!("forged:{bead}:0"));
    // The successor lands its claim between the pre-read and bd's CAS: the
    // release refuses and run stop records the settlement as pending.
    env.set_successor_on_guard(&bead, "forged:successor:0");

    let stop_args = [
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "superseded",
        "--reason",
        "replaced by successor",
        "--superseded-by",
        "bsr-successor",
    ];
    let (code, stopped) = env.forged(&stop_args);
    assert_eq!(code, 0, "run stop: {stopped}");
    assert_eq!(stopped["result"]["bead"]["pending"], json!(true));
    assert_eq!(stopped["result"]["bead"]["settled"], json!(false));

    // The supervisor converges the promise: superseded with foreign custody
    // hands off, read-only.
    let mutations_before = mutation_calls(&env, &bead).len();
    let action = settlement_action(&supervise_once(&env), run);
    assert_eq!(action["action"], json!("converged"), "{action}");
    assert_eq!(mutation_calls(&env, &bead).len(), mutations_before);
    assert_eq!(
        settlement_events(&env, run, "run.bead-settlement.succeeded").len(),
        1
    );

    // Replay discipline unchanged: the original operation still answers
    // with its stored response, verbatim, firing nothing.
    let calls_before_replay = env.bd_calls().len();
    let (code, replayed) = env.forged(&stop_args);
    assert_eq!(code, 0, "run stop replay: {replayed}");
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(replayed["result"], stopped["result"]);
    assert_eq!(env.bd_calls().len(), calls_before_replay);
    assert_eq!(
        env.assignee(&bead).as_deref(),
        Some("forged:successor:0"),
        "replay leaves the successor claim untouched"
    );
}
