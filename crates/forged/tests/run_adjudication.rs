//! `run adjudicate-settlement`: the typed, explicitly destructive settlement
//! of a run whose latest controller record lacks durable driver identity.
//! The fence stays closed for `run stop`; the adjudication substitutes an
//! auditable human assertion for the verified-kill step and nothing else.

mod support;

use serde_json::{json, Value};
use support::{fabricate_run, McpClient, TestEnv};

/// A run whose work is claimable plus a `forged.controller.started` record
/// carrying a generation but NO durable driver identity — the exact legacy
/// shape that predates durable pid/lstart publication.
fn seed_legacy(env: &TestEnv, run: &str) -> String {
    let work = format!("bead-{run}");
    fabricate_run(env, run);
    env.set_work_field(&work, "status", "in_progress");
    env.set_assignee(&work, &format!("forged:{work}:0"));
    let ledger = env.ledger();
    ledger
        .append_event(
            Some(run),
            "forged.controller.started",
            json!({"scope": "run", "id": run, "generation": 1}),
        )
        .expect("legacy controller record");
    ledger.close().expect("close");
    work
}

fn adjudicate_args<'a>(run: &'a str, outcome: &'a str, rationale: &'a str) -> Vec<&'a str> {
    vec![
        "run",
        "adjudicate-settlement",
        "--run",
        run,
        "--outcome",
        outcome,
        "--actor",
        "operator",
        "--rationale",
        rationale,
        "--evidence-gap",
        "controller.started carries no /driver/pid and no lstart; run directory deleted",
    ]
}

/// Every `work.updated` payload the ledger recorded for one work item,
/// oldest first (coordination events carry no run id).
fn mutation_calls(env: &TestEnv, work: &str) -> Vec<Value> {
    let ledger = env.ledger();
    let events = ledger.list_events(None, 0, 65_536).expect("events");
    ledger.close().expect("close");
    events
        .into_iter()
        .filter(|event| event.kind == "work.updated")
        .map(|event| serde_json::from_str::<Value>(&event.payload_json).expect("payload"))
        .filter(|payload| payload["workId"] == json!(work))
        .collect()
}

#[test]
fn legacy_record_settles_with_revocation_terminal_and_adjudication_event() {
    let env = TestEnv::new("forged-adjudicate-legacy");
    env.forged(&["init"]);
    let run = "adj-legacy";
    let work = seed_legacy(&env, run);
    let sha = "b".repeat(40);

    // The fence is right to fail closed: the normal path cannot settle this.
    let (_, stopped) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "cancelled",
        "--reason",
        "operator cancelled",
    ]);
    assert_eq!(stopped["ok"], json!(false), "{stopped}");
    assert_eq!(
        stopped["error"]["code"],
        json!("ADJUDICATION_REQUIRED"),
        "the refusal is typed so hosts route on the code, not free text: {stopped}"
    );

    let (code, response) = env.forged(&[
        "run",
        "adjudicate-settlement",
        "--run",
        run,
        "--outcome",
        "landed",
        "--pr",
        "112",
        "--sha",
        &sha,
        "--actor",
        "operator",
        "--rationale",
        "bead closed with recorded delivery",
        "--evidence-gap",
        "controller.started carries no /driver/pid and no lstart; run directory deleted",
    ]);
    assert_eq!(code, 0, "{response}");
    assert_eq!(response["ok"], json!(true), "{response}");
    assert_eq!(response["result"]["outcome"], json!("landed"));
    assert_eq!(response["result"]["controllerGeneration"], json!(1));
    assert_eq!(
        response["result"]["controllerStopped"],
        json!(false),
        "no death was verified and the response must not claim one"
    );
    assert_eq!(
        response["result"]["adjudication"]["actor"],
        json!("operator")
    );
    assert_eq!(response["result"]["bead"]["closed"], json!(true));
    assert_eq!(env.assignee(&work), None);

    let ledger = env.ledger();
    let row = ledger.get_run(run).expect("run");
    assert_eq!(row.state, forged_ledger::RunState::Stopped);
    assert_eq!(
        row.terminal_outcome,
        Some(forged_ledger::RunOutcome::Landed)
    );
    assert_eq!(row.delivery_pr, Some(112));
    assert_eq!(row.delivery_sha.as_deref(), Some(sha.as_str()));

    let events = ledger.list_events(Some(run), 0, 4096).expect("events");
    let adjudications: Vec<_> = events
        .iter()
        .filter(|event| event.kind == "forged.settlement-adjudication")
        .collect();
    assert_eq!(adjudications.len(), 1, "exactly one adjudication event");
    let payload: Value =
        serde_json::from_str(&adjudications[0].payload_json).expect("adjudication payload");
    assert_eq!(payload["schema"], json!("forged.settlement-adjudication/1"));
    assert_eq!(payload["actor"], json!("operator"));
    assert_eq!(
        payload["rationale"],
        json!("bead closed with recorded delivery")
    );
    assert_eq!(
        payload["evidenceGap"],
        json!("controller.started carries no /driver/pid and no lstart; run directory deleted")
    );
    assert_eq!(payload["generation"], json!(1));
    assert!(payload["adjudicatedAt"].is_string(), "{payload}");
    // The singleton event carries the delivery evidence and the originating
    // operation identity, so no later assertion can adopt it while settling
    // different evidence under a different operation.
    assert_eq!(payload["delivery"]["pr"], json!(112), "{payload}");
    assert_eq!(payload["delivery"]["sha"], json!(sha), "{payload}");
    assert_eq!(
        payload["operationId"], response["operationId"],
        "the event names the operation that recorded it: {payload}"
    );
    let revoked = events
        .iter()
        .find(|event| event.kind == "forged.controller.revoked")
        .expect("the recorded generation is durably revoked");
    let settled = events
        .iter()
        .find(|event| event.kind == "run.settled")
        .expect("terminal projection event");
    assert!(
        adjudications[0].event_id < settled.event_id,
        "the adjudication event lands before the terminal write"
    );
    let revoked_payload: Value =
        serde_json::from_str(&revoked.payload_json).expect("revocation payload");
    assert_eq!(revoked_payload["generation"], json!(1), "{revoked_payload}");
    ledger.close().expect("close");
}

#[test]
fn refuses_a_record_with_durable_driver_identity() {
    let env = TestEnv::new("forged-adjudicate-fenceable");
    env.forged(&["init"]);
    let run = "adj-fenceable";
    seed_legacy(&env, run);
    let ledger = env.ledger();
    ledger
        .append_event(
            Some(run),
            "forged.controller.started",
            json!({
                "scope": "run",
                "id": run,
                "generation": 2,
                "driver": {"pid": 4_000_000, "lstart": "Mon Jan  5 09:00:00 2026"},
            }),
        )
        .expect("fenceable controller record");
    ledger.close().expect("close");

    let (_, response) = env.forged(&adjudicate_args(run, "cancelled", "should refuse"));
    assert_eq!(response["ok"], json!(false), "{response}");
    assert_eq!(response["error"]["code"], json!("INVALID_REQUEST"));
    assert!(
        response["error"]["message"]
            .as_str()
            .unwrap_or_default()
            .contains("durable driver identity"),
        "{response}"
    );

    let ledger = env.ledger();
    let row = ledger.get_run(run).expect("run");
    assert_eq!(
        row.state,
        forged_ledger::RunState::Active,
        "nothing settled"
    );
    assert!(
        ledger
            .list_events(Some(run), 0, 4096)
            .expect("events")
            .iter()
            .all(|event| event.kind != "forged.settlement-adjudication"),
        "a refusal records no adjudication"
    );
    ledger.close().expect("close");
}

#[test]
fn refuses_while_a_machine_effect_lacks_containment() {
    let env = TestEnv::new("forged-adjudicate-uncontained");
    env.forged(&["init"]);
    let run = "adj-uncontained";
    seed_legacy(&env, run);
    let ledger = env.ledger();
    let request = forged_types::OperationRequest {
        schema_version: 1,
        idempotency_key: format!("op:push:{run}:-:-"),
        run_id: Some(run.to_owned()),
        params: serde_json::Map::new(),
    };
    ledger
        .begin_operation(
            "push",
            &request,
            forged_ledger::EffectClass::ObserveOnly,
            None,
        )
        .expect("in-flight machine ticket");
    ledger.close().expect("close");

    let (_, response) = env.forged(&adjudicate_args(run, "cancelled", "should refuse"));
    assert_eq!(response["ok"], json!(false), "{response}");
    assert_eq!(response["error"]["code"], json!("HOST_UNAVAILABLE"));
    assert!(
        response["error"]["message"]
            .as_str()
            .unwrap_or_default()
            .contains("machine effects"),
        "{response}"
    );

    let ledger = env.ledger();
    let row = ledger.get_run(run).expect("run");
    assert_eq!(
        row.state,
        forged_ledger::RunState::Active,
        "nothing settled"
    );
    assert!(
        ledger
            .list_events(Some(run), 0, 4096)
            .expect("events")
            .iter()
            .all(|event| event.kind != "forged.settlement-adjudication"),
        "a refusal records no adjudication"
    );
    ledger.close().expect("close");
}

#[test]
fn replay_reuses_the_stored_response_and_a_different_assertion_conflicts() {
    let env = TestEnv::new("forged-adjudicate-replay");
    env.forged(&["init"]);
    let run = "adj-replay";
    seed_legacy(&env, run);

    let (code, first) = env.forged(&adjudicate_args(run, "cancelled", "legacy run"));
    assert_eq!(code, 0, "{first}");
    assert_eq!(first["ok"], json!(true), "{first}");

    let writes_before_replay = {
        let ledger = env.ledger();
        let count = ledger
            .list_events(None, 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "work.updated")
            .count();
        ledger.close().expect("close");
        count
    };
    let (code, replay) = env.forged(&adjudicate_args(run, "cancelled", "legacy run"));
    assert_eq!(code, 0, "{replay}");
    assert_eq!(replay["reused"], json!(true), "{replay}");
    assert_eq!(
        replay["result"], first["result"],
        "stored response, verbatim"
    );
    assert_eq!(
        {
            let ledger = env.ledger();
            let count = ledger
                .list_events(None, 0, 65_536)
                .expect("events")
                .into_iter()
                .filter(|event| event.kind == "work.updated")
                .count();
            ledger.close().expect("close");
            count
        },
        writes_before_replay,
        "replay fires no work write"
    );

    // Same derived key, different rationale: the stored request wins.
    let (_, conflict) = env.forged(&adjudicate_args(run, "cancelled", "a different rationale"));
    assert_eq!(conflict["ok"], json!(false), "{conflict}");
    assert_eq!(conflict["error"]["code"], json!("IDEMPOTENCY_CONFLICT"));

    // The derived key binds the outcome: a DIFFERENT outcome maps to the
    // same key and collides with the stored request instead of minting a
    // fresh row the standing-event guard would dead-end.
    let sha = "c".repeat(40);
    let (_, outcome_conflict) = env.forged(&[
        "run",
        "adjudicate-settlement",
        "--run",
        run,
        "--outcome",
        "landed",
        "--pr",
        "112",
        "--sha",
        &sha,
        "--actor",
        "operator",
        "--rationale",
        "legacy run",
        "--evidence-gap",
        "controller.started carries no /driver/pid and no lstart; run directory deleted",
    ]);
    assert_eq!(outcome_conflict["ok"], json!(false), "{outcome_conflict}");
    assert_eq!(
        outcome_conflict["error"]["code"],
        json!("IDEMPOTENCY_CONFLICT"),
        "{outcome_conflict}"
    );

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some(run), 0, 4096)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.settlement-adjudication")
            .count(),
        1,
        "replay and conflict never duplicate the adjudication event"
    );
    assert!(
        ledger
            .list_inflight_operations(None)
            .expect("inflight")
            .iter()
            .all(|op| op.name != "run_adjudicate_settlement"),
        "a conflict strands no human-ambiguous row"
    );
    ledger.close().expect("close");
}

/// A closed Work reads as already converged for EVERY adjudicated outcome:
/// eleven of the twelve legacy work items are closed, and an adjudication that
/// errored on them would mint the exact settlement-pending noise this
/// operation exists to clear.
#[test]
fn a_closed_work_converges_for_every_outcome() {
    let env = TestEnv::new("forged-adjudicate-closed-bead");
    env.forged(&["init"]);
    let sha = "d".repeat(40);
    let cases: [(&str, Vec<&str>); 3] = [
        (
            "adj-closed-landed",
            vec!["--outcome", "landed", "--pr", "112", "--sha", &sha],
        ),
        (
            "adj-closed-superseded",
            vec!["--outcome", "superseded", "--superseded-by", "adj-next"],
        ),
        ("adj-closed-cancelled", vec!["--outcome", "cancelled"]),
    ];
    for (run, outcome_args) in cases {
        let work = seed_legacy(&env, run);
        env.set_work_field(&work, "status", "closed");
        let before = mutation_calls(&env, &work).len();

        let mut args = vec!["run", "adjudicate-settlement", "--run", run];
        args.extend(outcome_args);
        args.extend([
            "--actor",
            "operator",
            "--rationale",
            "bead already closed with its own recorded reason",
            "--evidence-gap",
            "controller.started carries no /driver/pid and no lstart; run directory deleted",
        ]);
        let (code, response) = env.forged(&args);
        assert_eq!(code, 0, "{run}: {response}");
        assert_eq!(response["ok"], json!(true), "{run}: {response}");
        assert_eq!(
            response["result"]["bead"]["settled"],
            json!(true),
            "{run}: {response}"
        );
        assert_eq!(
            response["result"]["bead"]["alreadyClosed"],
            json!(true),
            "{run}: {response}"
        );
        let mutations: Vec<Value> = mutation_calls(&env, &work)
            .into_iter()
            .skip(before)
            .collect();
        // The one guarded release: forged's stale custody comes off the
        // closed Work, and nothing else is written.
        let expected_holder = format!("forged:{work}:0");
        assert_eq!(mutations.len(), 1, "{run}: {mutations:?}");
        assert_eq!(
            mutations[0]["verb"],
            json!("release"),
            "{run}: the release is the custody clear alone: {mutations:?}"
        );
        assert_eq!(
            mutations[0]["actor"],
            json!(expected_holder),
            "{run}: the release is CAS-guarded on the stale holder: {mutations:?}"
        );
        assert_eq!(
            mutations[0]["status"]["to"],
            json!("closed"),
            "{run}: releasing stale custody never reopens the closed item"
        );
        assert_eq!(
            response["result"]["bead"]["released"],
            json!(true),
            "{run}: {response}"
        );
        assert_eq!(
            response["result"]["bead"]["assignee"],
            json!(null),
            "{run}: {response}"
        );
        assert_eq!(env.assignee(&work), None, "{run}: custody is released");

        let ledger = env.ledger();
        let row = ledger.get_run(run).expect("run");
        assert_eq!(row.state, forged_ledger::RunState::Stopped, "{run}");
        let events = ledger.list_events(Some(run), 0, 4096).expect("events");
        assert!(
            events
                .iter()
                .any(|event| event.kind == "run.bead-settlement.succeeded"),
            "{run}: convergence records the succeeded settlement"
        );
        assert!(
            events
                .iter()
                .all(|event| event.kind != "run.bead-settlement.pending"),
            "{run}: closed work never pends"
        );
        ledger.close().expect("close");
    }
}

/// An unsupported schemaVersion refuses BEFORE the operation-store probe:
/// it can neither execute a fresh destructive adjudication nor resume or
/// replay one through the existing-row path.
#[test]
fn an_unsupported_schema_version_never_executes_or_replays_adjudication() {
    let env = TestEnv::new("forged-adjudicate-schema");
    env.forged(&["init"]);
    let run = "adj-schema";
    seed_legacy(&env, run);

    let params = json!({
        "run": run,
        "outcome": "cancelled",
        "pr": null,
        "sha": null,
        "supersededBy": null,
        "actor": "operator",
        "rationale": "legacy run",
        "evidenceGap": "controller.started carries no /driver/pid and no lstart",
    });
    let mut mcp = McpClient::new(&env);
    let refused = mcp.call_tool(
        "run_adjudicate_settlement",
        json!({"schemaVersion": 99, "runId": run, "params": params}),
    );
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(
        refused["error"]["code"],
        json!("INVALID_REQUEST"),
        "{refused}"
    );

    // A durable terminal row exists now; the bad envelope still refuses
    // instead of replaying the stored destructive response.
    let accepted = mcp.call_tool(
        "run_adjudicate_settlement",
        json!({"schemaVersion": 1, "runId": run, "params": params}),
    );
    assert_eq!(accepted["ok"], json!(true), "{accepted}");
    let replay_refused = mcp.call_tool(
        "run_adjudicate_settlement",
        json!({"schemaVersion": 99, "runId": run, "params": params}),
    );
    assert_eq!(replay_refused["ok"], json!(false), "{replay_refused}");
    assert_eq!(
        replay_refused["error"]["code"],
        json!("INVALID_REQUEST"),
        "{replay_refused}"
    );
    assert_eq!(replay_refused["reused"], json!(false), "{replay_refused}");
}

/// An envelope runId that disagrees with params.run is refused before
/// anything durable exists: the effect settles params.run while the
/// operation row would record the envelope's run, and the two must never
/// diverge. Only the MCP surface can express the disagreement — the CLI
/// derives both from `--run`.
#[test]
fn a_conflicting_envelope_run_id_is_refused_before_anything_durable() {
    let env = TestEnv::new("forged-adjudicate-envelope-run");
    env.forged(&["init"]);
    let run = "adj-envelope";
    seed_legacy(&env, run);

    let mut mcp = McpClient::new(&env);
    let response = mcp.call_tool(
        "run_adjudicate_settlement",
        json!({
            "schemaVersion": 1,
            "runId": "adj-envelope-other",
            "params": {
                "run": run,
                "outcome": "cancelled",
                "pr": null,
                "sha": null,
                "supersededBy": null,
                "actor": "operator",
                "rationale": "legacy run",
                "evidenceGap": "controller.started carries no /driver/pid and no lstart",
            },
        }),
    );
    assert_eq!(response["ok"], json!(false), "{response}");
    assert_eq!(
        response["error"]["code"],
        json!("INVALID_REQUEST"),
        "{response}"
    );
    assert!(
        response["error"]["message"]
            .as_str()
            .unwrap_or_default()
            .contains("params.run"),
        "the refusal names the disagreement: {response}"
    );

    let ledger = env.ledger();
    let row = ledger.get_run(run).expect("run");
    assert_eq!(
        row.state,
        forged_ledger::RunState::Active,
        "nothing settled"
    );
    assert!(
        ledger
            .list_events(Some(run), 0, 4096)
            .expect("events")
            .iter()
            .all(|event| event.kind != "forged.settlement-adjudication"),
        "a refusal records no adjudication"
    );
    assert!(
        ledger
            .list_inflight_operations(None)
            .expect("inflight")
            .iter()
            .all(|op| op.name != "run_adjudicate_settlement"),
        "the refusal mints no operation row"
    );
    ledger.close().expect("close");
}

/// A re-assertion under a FRESH key never adopts the standing adjudication:
/// it is refused toward the operation that recorded it, so different
/// evidence cannot settle while the original row would be orphaned.
#[test]
fn a_fresh_key_reassertion_refuses_toward_the_original_operation() {
    let env = TestEnv::new("forged-adjudicate-fresh-key");
    env.forged(&["init"]);
    let run = "adj-fresh-key";
    seed_legacy(&env, run);

    let (code, first) = env.forged(&adjudicate_args(run, "cancelled", "legacy run"));
    assert_eq!(code, 0, "{first}");
    let original_operation = first["operationId"].as_str().expect("operation id");

    let mut args = adjudicate_args(run, "cancelled", "legacy run");
    args.extend(["--idempotency-key", "op:manual:fresh-key"]);
    let (_, refused) = env.forged(&args);
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(
        refused["error"]["code"],
        json!("IDEMPOTENCY_CONFLICT"),
        "{refused}"
    );
    assert!(
        refused["error"]["message"]
            .as_str()
            .unwrap_or_default()
            .contains(original_operation),
        "the refusal names the operation that recorded the adjudication: {refused}"
    );

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some(run), 0, 4096)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.settlement-adjudication")
            .count(),
        1,
        "the fresh key never records a second adjudication"
    );
    assert!(
        ledger
            .list_inflight_operations(None)
            .expect("inflight")
            .iter()
            .all(|op| op.name != "run_adjudicate_settlement"),
        "the fresh-key refusal strands no row"
    );
    ledger.close().expect("close");
}
