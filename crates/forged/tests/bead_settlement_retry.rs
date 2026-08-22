//! Supervisor retry of pending whole-run bead settlement: the read-only
//! convergence probe with its per-run throttle, per-outcome predicates,
//! recorded-holder custody discrimination, the bounded per-episode mutating
//! budget, and the untouched `run stop` replay discipline.

mod support;

use forged_ledger::RunOutcome;
use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

const FRONTIER: &str = "forged:frontier:0";

fn pending_payload(bead: &str, outcome: &str, error: &str, observed: Option<&str>) -> Value {
    let mut payload = json!({
        "schemaVersion": 1,
        "beadId": bead,
        "outcome": outcome,
        "expectedAssignee": format!("forged:{bead}:0"),
        "settled": false,
        "pending": true,
        "error": error,
    });
    if let Some(holder) = observed {
        payload["observedHolder"] = json!(holder);
    }
    payload
}

/// Fabricate a terminally settled run whose bead settlement is still owed:
/// the run row carries the rebuild inputs and the ledger carries the exact
/// pending event `run stop` records. `observed` is the custody identity
/// `run stop` recorded at pend time; `None` seeds a legacy payload.
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
    observed: Option<&str>,
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
            pending_payload(&bead, outcome.as_str(), error, observed),
        )
        .expect("pending event");
    ledger.close().expect("close");
    bead
}

/// Seed with the derived run holder recorded, the way `run stop` records
/// it, filling the delivery evidence a landed terminal projection demands.
fn seed_pending_derived(
    env: &TestEnv,
    run: &str,
    outcome: RunOutcome,
    reason: &str,
    error: &str,
) -> String {
    let observed = format!("forged:bead-{run}:0");
    let (pr, sha) = if outcome == RunOutcome::Landed {
        (Some(121), Some("a".repeat(40)))
    } else {
        (None, None)
    };
    seed_pending(
        env,
        run,
        outcome,
        reason,
        pr,
        sha,
        None,
        error,
        Some(&observed),
    )
}

fn supervise_once(env: &TestEnv) -> Value {
    let (code, response) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "supervise --once: {response}");
    response["result"].clone()
}

fn settlement_action(report: &Value, run: &str) -> Value {
    maybe_settlement_action(report, run)
        .unwrap_or_else(|| panic!("the tick reports a bead settlement action for {run}: {report}"))
}

fn maybe_settlement_action(report: &Value, run: &str) -> Option<Value> {
    report["beadSettlement"]["actions"]
        .as_array()
        .and_then(|actions| {
            actions
                .iter()
                .find(|action| action["runId"] == json!(run))
                .cloned()
        })
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

fn latest_pending_event_id(env: &TestEnv, run: &str) -> i64 {
    let ledger = env.ledger();
    let events = ledger.list_events(Some(run), 0, 65_536).expect("events");
    ledger.close().expect("close");
    events
        .into_iter()
        .filter(|event| event.kind == "run.bead-settlement.pending")
        .map(|event| event.event_id)
        .max()
        .expect("a pending event exists")
}

fn retry_row(env: &TestEnv, run: &str) -> Option<forged_ledger::BeadSettlementRetryRow> {
    let ledger = env.ledger();
    let row = ledger.get_bead_settlement_retry(run).expect("retry row");
    ledger.close().expect("close");
    row
}

/// Make the persisted mutating-retry wake AND probe wake due, the way
/// elapsed wall-clock time would.
fn rewind_wake(env: &TestEnv, run: &str) {
    let conn = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db");
    let rewound = conn
        .execute(
            "UPDATE bead_settlement_retry \
             SET next_wake_at = '2000-01-01T00:00:00.000000000Z', \
                 probe_wake_at = '2000-01-01T00:00:00.000000000Z' WHERE run_id = ?1",
            [run],
        )
        .expect("rewind wake");
    assert_eq!(rewound, 1, "the retry row exists to rewind");
}

/// Make only the probe wake due, leaving the mutating backoff parked.
fn rewind_probe(env: &TestEnv, run: &str) {
    let conn = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db");
    let rewound = conn
        .execute(
            "UPDATE bead_settlement_retry \
             SET probe_wake_at = '2000-01-01T00:00:00.000000000Z' WHERE run_id = ?1",
            [run],
        )
        .expect("rewind probe wake");
    assert_eq!(rewound, 1, "the retry row exists to rewind");
}

fn set_used(env: &TestEnv, run: &str, used: u32) {
    let conn = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db");
    let updated = conn
        .execute(
            "UPDATE bead_settlement_retry SET used = ?1 WHERE run_id = ?2",
            rusqlite::params![used, run],
        )
        .expect("set used");
    assert_eq!(updated, 1, "the retry row exists to charge");
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
    let bead = seed_pending_derived(
        &env,
        run,
        RunOutcome::Landed,
        "delivery verified",
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
    let row = retry_row(&env, run).expect("probe row");
    assert_eq!(
        row.used, 0,
        "the read-only probe never opens a mutating budget"
    );
    assert_eq!(row.next_wake_at, None);
    assert_eq!(row.claim_token, None);

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
        Some("forged:bead-bsr-superseded:0"),
    );
    env.set_bead_field(&superseded_bead, "status", "in_progress");
    env.set_assignee(&superseded_bead, "forged:successor:0");

    // Blocked, with the bead already unassigned: converges as-is.
    let blocked_bead = seed_pending_derived(
        &env,
        "bsr-blocked",
        RunOutcome::Blocked,
        "waiting on a migration decision",
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
        Some("forged:bead-bsr-held:0"),
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
fn a_recorded_frontier_epoch_settles_under_the_frontier_identity() {
    let env = TestEnv::new("bsr-frontier-own");
    env.forged(&["init"]);

    // Cancelled, with the bead still held under the frontier identity its
    // pending payload RECORDED at pend time: forged's own claim-next claim,
    // owed its release, guarded by the frontier actor.
    let cancelled_bead = seed_pending(
        &env,
        "bsr-fr-cancel",
        RunOutcome::Cancelled,
        "operator cancelled",
        None,
        None,
        None,
        "bd was unreachable",
        Some(FRONTIER),
    );
    env.set_bead_field(&cancelled_bead, "status", "in_progress");
    env.set_assignee(&cancelled_bead, FRONTIER);

    // Landed under the recorded frontier claim — the exact claim-next-run
    // wedge: the close must fire under the frontier identity.
    let landed_bead = seed_pending(
        &env,
        "bsr-fr-landed",
        RunOutcome::Landed,
        "delivery verified",
        Some(124),
        Some("d".repeat(40)),
        None,
        "bd timed out mid-close",
        Some(FRONTIER),
    );
    env.set_bead_field(&landed_bead, "status", "in_progress");
    env.set_assignee(&landed_bead, FRONTIER);

    let report = supervise_once(&env);
    for run in ["bsr-fr-cancel", "bsr-fr-landed"] {
        let action = settlement_action(&report, run);
        assert_eq!(
            action["action"],
            json!("retried"),
            "{run} mutates under its own recorded frontier claim, never \
             converges read-only over it: {report}"
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
        cancel_updates[0].contains(&format!("--if-assignee {FRONTIER}"))
            && cancel_updates[0].contains(&format!("--actor {FRONTIER}")),
        "the release CAS names the frontier claim: {cancel_updates:?}"
    );
    assert_eq!(env.assignee(&cancelled_bead), None);

    let closes: Vec<String> = mutation_calls(&env, &landed_bead)
        .into_iter()
        .filter(|call| call.contains("--status closed"))
        .collect();
    assert_eq!(closes.len(), 1, "one guarded close: {closes:?}");
    assert!(
        closes[0].contains(&format!("--if-assignee {FRONTIER}"))
            && closes[0].contains(&format!("--actor {FRONTIER}")),
        "the close CAS names the frontier claim: {closes:?}"
    );
    assert_eq!(env.assignee(&landed_bead), None);
}

#[test]
fn unrecorded_frontier_custody_is_foreign_and_never_mutated() {
    let env = TestEnv::new("bsr-frontier-foreign");
    env.forged(&["init"]);

    // Release-shaped promise whose payload recorded the DERIVED holder, but
    // whose bead is now frontier-held by a later claim-next: hands off.
    let cancelled_bead = seed_pending_derived(
        &env,
        "bsr-uf-cancel",
        RunOutcome::Cancelled,
        "operator cancelled",
        "bd was unreachable",
    );
    env.set_bead_field(&cancelled_bead, "status", "in_progress");
    env.set_assignee(&cancelled_bead, FRONTIER);

    // Landed with the same recorded-derived payload: not delivered, not
    // ours — neither converges nor mutates.
    let landed_bead = seed_pending_derived(
        &env,
        "bsr-uf-landed",
        RunOutcome::Landed,
        "delivery verified",
        "bd timed out mid-close",
    );
    env.set_bead_field(&landed_bead, "status", "in_progress");
    env.set_assignee(&landed_bead, FRONTIER);

    // A legacy payload with no observedHolder gets the same conservative
    // frontier-is-foreign rule.
    let legacy_bead = seed_pending(
        &env,
        "bsr-uf-legacy",
        RunOutcome::Landed,
        "delivery verified",
        Some(123),
        Some("c".repeat(40)),
        None,
        "bd timed out mid-close",
        None,
    );
    env.set_bead_field(&legacy_bead, "status", "in_progress");
    env.set_assignee(&legacy_bead, FRONTIER);

    let report = supervise_once(&env);
    let cancelled = settlement_action(&report, "bsr-uf-cancel");
    assert_eq!(cancelled["action"], json!("converged"), "{report}");
    assert_eq!(
        settlement_events(&env, "bsr-uf-cancel", "run.bead-settlement.succeeded").len(),
        1
    );
    for run in ["bsr-uf-landed", "bsr-uf-legacy"] {
        let action = settlement_action(&report, run);
        assert_eq!(action["action"], json!("frontier-held"), "{report}");
        assert_eq!(action["holder"], json!(FRONTIER));
        assert!(
            settlement_events(&env, run, "run.bead-settlement.succeeded").is_empty(),
            "{run} must not record success over an undelivered promise"
        );
        assert_eq!(
            retry_row(&env, run).expect("probe row").used,
            0,
            "{run} charges no budget while frontier-held"
        );
        assert_eq!(
            attention_conditions(&env, run),
            vec![json!("beads-settlement-pending")],
            "{run} keeps its standing attention item"
        );
    }

    // The load-bearing negative: no update or release was ever issued
    // against frontier custody the payloads did not record.
    for bead in [&cancelled_bead, &landed_bead, &legacy_bead] {
        assert!(
            mutation_calls(&env, bead).is_empty(),
            "unrecorded frontier custody must never be mutated: {:?}",
            mutation_calls(&env, bead)
        );
        assert_eq!(
            env.assignee(bead).as_deref(),
            Some(FRONTIER),
            "the later claim-next's frontier claim stands untouched"
        );
    }
}

#[test]
fn run_stop_settles_a_frontier_claimed_run_under_the_frontier_identity() {
    let env = TestEnv::new("bsr-stop-frontier");
    env.forged(&["init"]);
    let run = "bsr-stop-frontier";
    let bead = format!("bead-{run}");
    fabricate_run(&env, run);
    // The whole-run lease identity is the frontier claim adopted from
    // claim-next: run stop must settle under it, not the derived holder.
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, FRONTIER);

    let sha = "e".repeat(40);
    let (code, stopped) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "landed",
        "--reason",
        "delivery verified",
        "--pr",
        "125",
        "--sha",
        &sha,
    ]);
    assert_eq!(code, 0, "run stop: {stopped}");
    assert_eq!(
        stopped["result"]["bead"]["settled"],
        json!(true),
        "{stopped}"
    );
    assert_eq!(stopped["result"]["bead"]["closed"], json!(true));
    assert_eq!(stopped["result"]["bead"]["released"], json!(true));

    let closes: Vec<String> = mutation_calls(&env, &bead)
        .into_iter()
        .filter(|call| call.contains("--status closed"))
        .collect();
    assert_eq!(closes.len(), 1, "{closes:?}");
    assert!(
        closes[0].contains(&format!("--if-assignee {FRONTIER}"))
            && closes[0].contains(&format!("--actor {FRONTIER}")),
        "the primary run-stop close settles under the frontier identity: {closes:?}"
    );
    assert!(
        settlement_events(&env, run, "run.bead-settlement.pending").is_empty(),
        "nothing pends: the settlement succeeded first try"
    );
    assert_eq!(
        settlement_events(&env, run, "run.bead-settlement.succeeded").len(),
        1
    );
}

#[test]
fn a_landed_promise_over_an_open_unassigned_bead_takes_guarded_custody_then_closes() {
    let env = TestEnv::new("bsr-unassigned");
    env.forged(&["init"]);

    // The blocked→accept-risk→landed live repro: the blocked settlement
    // released the claim, then the landed stop pended over an open,
    // unassigned bead.
    let run = "bsr-unassigned";
    let bead = seed_pending_derived(
        &env,
        run,
        RunOutcome::Landed,
        "delivery verified",
        "bead is open and unassigned",
    );
    env.set_bead_field(&bead, "status", "open");
    let expected = format!("forged:{bead}:0");

    // A second landed pending whose bead a stranger holds still refuses.
    let thief_run = "bsr-unassigned-thief";
    let thief_bead = seed_pending_derived(
        &env,
        thief_run,
        RunOutcome::Landed,
        "delivery verified",
        "bd refused the close",
    );
    env.set_bead_field(&thief_bead, "status", "in_progress");
    env.set_assignee(&thief_bead, "forged:thief:0");

    let report = supervise_once(&env);
    let action = settlement_action(&report, run);
    assert_eq!(action["action"], json!("retried"), "{report}");
    assert_eq!(action["settled"], json!(true));

    let claims: Vec<String> = env
        .bd_calls()
        .into_iter()
        .filter(|call| call.starts_with(&format!("update {bead} ")) && call.contains("--claim"))
        .collect();
    assert_eq!(claims.len(), 1, "one guarded claim: {claims:?}");
    assert!(
        claims[0].contains(&format!("--actor {expected}")),
        "the claim CAS-assigns the expected assignee: {claims:?}"
    );
    let closes: Vec<String> = mutation_calls(&env, &bead)
        .into_iter()
        .filter(|call| call.contains("--status closed"))
        .collect();
    assert_eq!(closes.len(), 1, "{closes:?}");
    assert!(
        closes[0].contains(&format!("--if-assignee {expected}")),
        "the close stays the guarded held close: {closes:?}"
    );
    assert_eq!(env.assignee(&bead), None);
    assert_eq!(
        settlement_events(&env, run, "run.bead-settlement.succeeded").len(),
        1
    );
    assert_eq!(retry_row(&env, run).expect("row").used, 1);

    // The stranger-held bead refused: no claim was even attempted.
    let refused = settlement_action(&report, thief_run);
    assert_eq!(refused["action"], json!("retry-failed"), "{report}");
    assert!(
        !env.bd_calls()
            .iter()
            .any(|call| call.starts_with(&format!("update {thief_bead} "))
                && call.contains("--claim")),
        "a non-null unexpected holder refuses without a claim attempt"
    );
    assert_eq!(env.assignee(&thief_bead).as_deref(), Some("forged:thief:0"));
}

#[test]
fn a_new_settlement_episode_resets_the_budget_and_the_pass_own_records_never_do() {
    let env = TestEnv::new("bsr-episode");
    env.forged(&["init"]);
    let run = "bsr-episode";
    let bead = seed_pending_derived(
        &env,
        run,
        RunOutcome::Landed,
        "delivery verified",
        "bd refused the close",
    );
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, "forged:thief:0");

    // A failed retry re-pends and stamps the watermark with its own event:
    // the budget is NOT reset by the pass's own evidence.
    let first = settlement_action(&supervise_once(&env), run);
    assert_eq!(first["action"], json!("retry-failed"), "{first}");
    let row = retry_row(&env, run).expect("charged row");
    assert_eq!(row.used, 1);
    assert_eq!(
        row.event_id,
        Some(latest_pending_event_id(&env, run)),
        "the re-pend stamps the watermark transactionally"
    );

    // Exhaust the episode; the exhaustion evidence stamp is also the pass's
    // own record and never resets the budget either.
    set_used(&env, run, 8);
    rewind_wake(&env, run);
    let exhausted = settlement_action(&supervise_once(&env), run);
    assert_eq!(exhausted["action"], json!("exhausted"), "{exhausted}");
    assert_eq!(exhausted["stamped"], json!(true));
    rewind_wake(&env, run);
    let still = settlement_action(&supervise_once(&env), run);
    assert_eq!(still["action"], json!("exhausted"), "{still}");
    assert_eq!(still["stamped"], json!(false));
    assert_eq!(retry_row(&env, run).expect("row").used, 8);

    // A pending minted by a NEW run-stop settlement episode resets
    // used/next_wake_at/last_error, and mutation resumes.
    let ledger = env.ledger();
    ledger
        .append_event(
            Some(run),
            "run.bead-settlement.pending",
            pending_payload(
                &bead,
                "landed",
                "second stop failed too",
                Some(&format!("forged:{bead}:0")),
            ),
        )
        .expect("new episode pending");
    ledger.close().expect("close");
    rewind_wake(&env, run);
    let resumed = settlement_action(&supervise_once(&env), run);
    assert_eq!(
        resumed["action"],
        json!("retry-failed"),
        "a budget-exhausted first episode mutates again under the new one: {resumed}"
    );
    assert_eq!(resumed["attempt"], json!(1));
    let reset = retry_row(&env, run).expect("row");
    assert_eq!(reset.used, 1);
    assert_eq!(
        reset.event_id,
        Some(latest_pending_event_id(&env, run)),
        "the new episode's own re-pend re-stamps the watermark"
    );
}

#[test]
fn probe_reads_decay_per_the_schedule_and_reset_to_the_floor_on_change() {
    let env = TestEnv::new("bsr-probe");
    env.forged(&["init"]);
    // Permanently stuck shape that neither converges nor charges: a landed
    // promise over frontier custody the payload did not record.
    let run = "bsr-probe";
    let bead = seed_pending_derived(
        &env,
        run,
        RunOutcome::Landed,
        "delivery verified",
        "bd timed out mid-close",
    );
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, FRONTIER);

    let action = settlement_action(&supervise_once(&env), run);
    assert_eq!(action["action"], json!("frontier-held"), "{action}");
    let row = retry_row(&env, run).expect("probe row");
    assert_eq!(row.probe_interval_s, Some(60), "first probe at the floor");
    assert!(row.probe_wake_at.is_some());

    // While the observation holds still, the schedule doubles to its cap.
    for expected in [120u32, 240, 480, 480] {
        rewind_probe(&env, run);
        supervise_once(&env);
        assert_eq!(
            retry_row(&env, run).expect("row").probe_interval_s,
            Some(expected),
            "the 60s→480s schedule decays the reads"
        );
    }

    // A run whose probe wake is in the future is not probed at all.
    let shows_before = show_calls(&env, &bead);
    let deferred = supervise_once(&env);
    assert!(
        maybe_settlement_action(&deferred, run).is_none(),
        "an undue run is deferred, not probed: {deferred}"
    );
    assert_eq!(show_calls(&env, &bead), shows_before, "no bd read fired");

    // The live bead moving resets the schedule to the floor.
    env.set_bead_field(&bead, "notes", "operator touched the bead");
    rewind_probe(&env, run);
    supervise_once(&env);
    let row = retry_row(&env, run).expect("row");
    assert_eq!(
        row.probe_interval_s,
        Some(60),
        "a changed observation resets the backoff floor"
    );
    assert_eq!(row.used, 0, "the probe never charged the budget");
}

#[test]
fn a_pass_over_nine_due_runs_probes_the_eight_earliest_and_defers_the_rest() {
    let env = TestEnv::new("bsr-batch");
    env.forged(&["init"]);
    let runs: Vec<String> = (0..9).map(|index| format!("bsr-batch-{index}")).collect();
    for run in &runs {
        let bead = seed_pending_derived(
            &env,
            run,
            RunOutcome::Landed,
            "delivery verified",
            "bd lease held",
        );
        env.set_bead_field(&bead, "status", "closed");
    }

    // Never-probed rows are the most overdue; ties order by run id, so the
    // ninth run defers to the next pass.
    let first = supervise_once(&env);
    assert_eq!(first["beadSettlement"]["pending"], json!(9), "{first}");
    assert_eq!(first["beadSettlement"]["truncated"], json!(1), "{first}");
    let actions = first["beadSettlement"]["actions"]
        .as_array()
        .expect("actions")
        .len();
    assert_eq!(actions, 8, "{first}");
    assert!(
        maybe_settlement_action(&first, "bsr-batch-8").is_none(),
        "the ninth run is deferred: {first}"
    );

    // The deferred row is probed on the following pass: no starvation.
    let second = supervise_once(&env);
    assert_eq!(second["beadSettlement"]["truncated"], json!(0), "{second}");
    assert_eq!(
        settlement_action(&second, "bsr-batch-8")["action"],
        json!("converged"),
        "{second}"
    );
    for run in &runs {
        assert_eq!(
            settlement_events(&env, run, "run.bead-settlement.succeeded").len(),
            1,
            "{run} converged"
        );
    }
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
        Some("forged:bead-bsr-stuck:0"),
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
    rewind_probe(&env, run);
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
        assert_eq!(
            payload["observedHolder"],
            json!(format!("forged:{bead}:0")),
            "the recorded custody epoch travels with every re-pend: {payload}"
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
    rewind_probe(&env, run);
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
    assert_eq!(
        stopped["result"]["bead"]["observedHolder"],
        json!(format!("forged:{bead}:0")),
        "the pend records the custody epoch in force at pend time"
    );

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
