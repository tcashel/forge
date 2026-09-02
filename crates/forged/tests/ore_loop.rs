//! Waveless epic reconciliation through the supervisor-owned ore pass.

mod support;

use forged_ledger::{DesiredState, DesiredSubjectKind, OperationState};
use forged_types::AdmissionSubjectKind;
use serde_json::{json, Value};
use support::TestEnv;

fn epic_events(env: &TestEnv, epic: &str) -> Vec<forged_ledger::EventRow> {
    let ledger = env.ledger();
    let events = ledger
        .list_events(Some(epic), 0, 65_536)
        .expect("epic events");
    ledger.close().expect("close ledger");
    events
}

fn event_count(env: &TestEnv, epic: &str, kind: &str) -> usize {
    epic_events(env, epic)
        .into_iter()
        .filter(|event| event.kind == kind)
        .count()
}

fn wake_ore(env: &TestEnv, epic: &str, reason: &str) {
    let (code, paused) = env.forged(&["epic", "pause", "--epic", epic, "--reason", reason]);
    assert_eq!(code, 0, "wake pause: {paused}");
    let (code, resumed) = env.forged(&["epic", "resume", "--epic", epic, "--reason", reason]);
    assert_eq!(code, 0, "wake resume: {resumed}");
}

fn supervise_once(env: &TestEnv) -> Value {
    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "supervisor tick: {tick}");
    tick
}

fn wait_for_clean_run(env: &TestEnv, run: &str) -> Value {
    let mut last = Value::Null;
    for _ in 0..600 {
        let (code, status) = env.forged(&["run", "status", "--run", run]);
        if code == 0 && status["result"]["run"]["outcome"] == json!("clean") {
            return status;
        }
        last = status;
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    panic!("run {run} did not stop cleanly: {last}")
}

#[test]
fn submit_is_idempotently_queued_and_the_pass_dispatches_a_wave_free_child_atomically() {
    let env = TestEnv::new("forged-ore-loop-dispatch");
    env.enable_dynamic_gh();
    env.seed_epic("epic-loop", &[("child-loop", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-loop",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");

    let submit_args = [
        "epic",
        "submit",
        "--epic",
        "epic-loop",
        "--idempotency-key",
        "epic-loop-submit",
    ];
    let (code, submitted) = env.forged(&submit_args);
    assert_eq!(code, 0, "loop submit: {submitted}");
    assert_eq!(submitted["result"]["phase"], json!("queued"));
    assert_eq!(submitted["result"]["controller"], Value::Null);
    assert_eq!(submitted["result"]["queued"], json!(true));
    let (code, resubmitted) = env.forged(&submit_args);
    assert_eq!(code, 0, "queued resubmit: {resubmitted}");
    assert_eq!(resubmitted["reused"], json!(true));
    assert_eq!(resubmitted["result"], submitted["result"]);

    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Epic, "epic-loop")
        .expect("epic desired row")
        .expect("epic authorized");
    assert_eq!(desired.desired_state, DesiredState::Running);
    assert_eq!(desired.restart_used, 0);
    ledger.close().expect("close ledger");

    let (code, paused) = env.forged(&[
        "epic",
        "pause",
        "--epic",
        "epic-loop",
        "--reason",
        "test pause",
    ]);
    assert_eq!(code, 0, "pause: {paused}");
    let before_pause_tick = epic_events(&env, "epic-loop").len();
    let (code, paused_tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "paused tick: {paused_tick}");
    assert_eq!(
        epic_events(&env, "epic-loop").len(),
        before_pause_tick,
        "a paused loop epic receives no pass effects"
    );

    let (code, resumed) = env.forged(&[
        "epic",
        "resume",
        "--epic",
        "epic-loop",
        "--reason",
        "continue setup",
    ]);
    assert_eq!(code, 0, "resume setup: {resumed}");
    let (code, integration) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "integration tick: {integration}");
    assert_eq!(
        event_count(&env, "epic-loop", "forged.epic.integration.ready"),
        1
    );

    let (code, paused) = env.forged(&[
        "epic",
        "pause",
        "--epic",
        "epic-loop",
        "--reason",
        "inspect frontier",
    ]);
    assert_eq!(code, 0, "frontier pause: {paused}");
    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-loop"]);
    assert_eq!(code, 0, "loop status: {status}");
    assert!(status["result"].get("waves").is_none());
    assert!(status["result"].get("controller").is_none());
    assert_eq!(
        status["result"]["frontier"],
        json!([{"childId": "child-loop", "priority": 2}])
    );
    let (code, resumed) = env.forged(&[
        "epic",
        "resume",
        "--epic",
        "epic-loop",
        "--reason",
        "dispatch child",
    ]);
    assert_eq!(code, 0, "resume dispatch: {resumed}");
    let (code, dispatched) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "dispatch tick: {dispatched}");

    let events = epic_events(&env, "epic-loop");
    assert!(events
        .iter()
        .all(|event| event.kind != "forged.epic.wave.started"));
    let child = events
        .iter()
        .find(|event| event.kind == "forged.epic.child.started")
        .expect("loop child started");
    let child_payload: Value = serde_json::from_str(&child.payload_json).expect("child event JSON");
    assert_eq!(child_payload["childId"], json!("child-loop"));
    assert_eq!(child_payload["wave"], Value::Null);

    let ledger = env.ledger();
    assert_eq!(
        ledger.get_run("child-loop").expect("child run").work_id,
        "child-loop"
    );
    let child_desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "child-loop")
        .expect("child desired lookup")
        .expect("child authorization");
    assert_eq!(child_desired.controller_generation, 0);
    assert_eq!(child_desired.restart_used, 0);
    let operation = ledger
        .find_operation("run_start", "op:run_start:child-loop:-:-")
        .expect("run-start operation lookup")
        .expect("run-start operation");
    assert_eq!(operation.state, OperationState::Terminal);
    assert_eq!(
        ledger
            .list_events(Some("child-loop"), 0, 65_536)
            .expect("child run events")
            .into_iter()
            .filter(|event| event.kind == "forged.run.spec")
            .count(),
        1
    );
    assert!(ledger
        .latest_admission_decisions(Some(AdmissionSubjectKind::Epic), Some("epic-loop"))
        .expect("epic admission decisions")
        .is_empty());
    ledger.close().expect("close ledger");

    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-loop"]);
    assert_eq!(code, 0, "dispatched status: {status}");
    assert!(status["result"].get("waves").is_none());
    assert!(status["result"].get("controller").is_none());
    assert_eq!(status["result"]["frontier"], json!([]));
}

#[test]
fn loop_scheduler_recomputes_the_frontier_after_each_single_child_merge() {
    let env = TestEnv::new("forged-ore-loop-rolling");
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-loop-rolling",
        &[
            ("child-loop-first", &env.spec, true),
            ("child-loop-blocked", &env.spec, false),
        ],
    );
    env.set_work_field(
        "child-loop-blocked",
        "dependencies",
        r#"[{"id":"child-loop-first","dependency_type":"blocks","status":"open"}]"#,
    );
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-loop-rolling",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    let (code, submitted) = env.forged(&["epic", "submit", "--epic", "epic-loop-rolling"]);
    assert_eq!(code, 0, "epic submit: {submitted}");
    assert_eq!(submitted["result"]["controller"], Value::Null);

    supervise_once(&env);
    wake_ore(&env, "epic-loop-rolling", "dispatch first child");
    supervise_once(&env);
    let started_children = epic_events(&env, "epic-loop-rolling")
        .into_iter()
        .filter(|event| event.kind == "forged.epic.child.started")
        .map(|event| serde_json::from_str::<Value>(&event.payload_json).expect("child event"))
        .collect::<Vec<_>>();
    assert_eq!(started_children.len(), 1);
    assert_eq!(started_children[0]["childId"], json!("child-loop-first"));
    assert_eq!(started_children[0]["wave"], Value::Null);

    let admission = supervise_once(&env);
    assert!(
        admission["result"]["subjects"]
            .as_array()
            .is_some_and(|subjects| !subjects.is_empty()),
        "the next ordinary tick must reconcile the child: {admission}"
    );
    // A queued generation-0 authorization launches through the due loop's
    // restart path — the same contract a `run retry` successor has. The
    // first launch charging one restart unit is that path's existing
    // accounting, not a loop-mode invention.
    assert_eq!(
        admission["result"]["subjects"][0]["action"],
        json!("restarted"),
        "the frontier child is admitted and launched by the ordinary due loop: {admission}"
    );
    assert_eq!(
        admission["result"]["subjects"][0]["desiredWork"]["subject"]["id"],
        json!("child-loop-first"),
        "the launched subject is the dispatched frontier child: {admission}"
    );
    wait_for_clean_run(&env, "child-loop-first");
    wake_ore(&env, "epic-loop-rolling", "merge first child");
    supervise_once(&env);
    assert_eq!(
        event_count(&env, "epic-loop-rolling", "forged.epic.child.merged"),
        1,
        "one pass merges at most one child"
    );

    wake_ore(&env, "epic-loop-rolling", "dispatch newly ready child");
    supervise_once(&env);
    let started_children = epic_events(&env, "epic-loop-rolling")
        .into_iter()
        .filter(|event| event.kind == "forged.epic.child.started")
        .map(|event| serde_json::from_str::<Value>(&event.payload_json).expect("child event"))
        .collect::<Vec<_>>();
    assert_eq!(started_children.len(), 2);
    assert_eq!(started_children[1]["childId"], json!("child-loop-blocked"));
    assert!(started_children.iter().all(|event| event["wave"].is_null()));

    supervise_once(&env);
    wait_for_clean_run(&env, "child-loop-blocked");
    wake_ore(&env, "epic-loop-rolling", "merge second child");
    supervise_once(&env);
    assert_eq!(
        event_count(&env, "epic-loop-rolling", "forged.epic.child.merged"),
        2
    );
    wake_ore(&env, "epic-loop-rolling", "create final pull request");
    supervise_once(&env);

    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-loop-rolling"]);
    assert_eq!(code, 0, "terminal status: {status}");
    assert!(status["result"]["finalPr"].is_object());
    assert!(status["result"].get("waves").is_none());
    assert!(status["result"].get("controller").is_none());
    assert_eq!(status["result"]["frontier"], json!([]));
    assert!(epic_events(&env, "epic-loop-rolling")
        .iter()
        .all(|event| event.kind != "forged.epic.wave.started"));
}

#[test]
fn historical_wave_stream_projects_and_resumes_under_the_waveless_pass() {
    let env = TestEnv::new("forged-ore-loop-historical-resume");
    env.seed_epic("epic-historical", &[("child-historical", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-historical",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "historical epic start: {started}");
    let (code, submitted) = env.forged(&["epic", "submit", "--epic", "epic-historical"]);
    assert_eq!(code, 0, "historical epic submit: {submitted}");
    supervise_once(&env);

    let ledger = env.ledger();
    ledger
        .append_event(
            Some("epic-historical"),
            "forged.epic.wave.started",
            json!({"wave": 7, "children": ["child-historical"]}),
        )
        .expect("append historical wave");
    ledger.close().expect("close ledger");
    let (code, projected) = env.forged(&["epic", "status", "--epic", "epic-historical"]);
    assert_eq!(code, 0, "historical projection: {projected}");
    assert_eq!(projected["result"]["waves"][0]["wave"], json!(7));
    assert_eq!(
        projected["result"]["frontier"][0]["childId"],
        json!("child-historical")
    );

    wake_ore(&env, "epic-historical", "migrate historical stream");
    supervise_once(&env);
    let events = epic_events(&env, "epic-historical");
    let child = events
        .iter()
        .find(|event| event.kind == "forged.epic.child.started")
        .expect("historical epic continues under pass");
    let payload: Value = serde_json::from_str(&child.payload_json).expect("child payload");
    assert!(payload["wave"].is_null());
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.epic.wave.started")
            .count(),
        1,
        "the pass preserves history without appending a new wave"
    );
}
