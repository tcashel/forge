//! `run adjudicate-settlement`: the typed, explicitly destructive settlement
//! of a run whose latest controller record lacks durable driver identity.
//! The fence stays closed for `run stop`; the adjudication substitutes an
//! auditable human assertion for the verified-kill step and nothing else.

mod support;

use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

/// A run whose bead is claimable plus a `forged.controller.started` record
/// carrying a generation but NO durable driver identity — the exact legacy
/// shape that predates durable pid/lstart publication.
fn seed_legacy(env: &TestEnv, run: &str) -> String {
    let bead = format!("bead-{run}");
    fabricate_run(env, run);
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, &format!("forged:{bead}:0"));
    let ledger = env.ledger();
    ledger
        .append_event(
            Some(run),
            "forged.controller.started",
            json!({"scope": "run", "id": run, "generation": 1}),
        )
        .expect("legacy controller record");
    ledger.close().expect("close");
    bead
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

#[test]
fn legacy_record_settles_with_revocation_terminal_and_adjudication_event() {
    let env = TestEnv::new("forged-adjudicate-legacy");
    env.forged(&["init"]);
    let run = "adj-legacy";
    let bead = seed_legacy(&env, run);
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
    assert_eq!(env.assignee(&bead), None);

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
fn replay_reuses_the_stored_response_and_a_new_rationale_conflicts() {
    let env = TestEnv::new("forged-adjudicate-replay");
    env.forged(&["init"]);
    let run = "adj-replay";
    seed_legacy(&env, run);

    let (code, first) = env.forged(&adjudicate_args(run, "cancelled", "legacy run"));
    assert_eq!(code, 0, "{first}");
    assert_eq!(first["ok"], json!(true), "{first}");

    let before = env.bd_calls().len();
    let (code, replay) = env.forged(&adjudicate_args(run, "cancelled", "legacy run"));
    assert_eq!(code, 0, "{replay}");
    assert_eq!(replay["reused"], json!(true), "{replay}");
    assert_eq!(
        replay["result"], first["result"],
        "stored response, verbatim"
    );
    assert_eq!(env.bd_calls().len(), before, "replay fires no Beads write");

    // Same derived key, different rationale: the stored request wins.
    let (_, conflict) = env.forged(&adjudicate_args(run, "cancelled", "a different rationale"));
    assert_eq!(conflict["ok"], json!(false), "{conflict}");
    assert_eq!(conflict["error"]["code"], json!("IDEMPOTENCY_CONFLICT"));

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
    ledger.close().expect("close");
}
