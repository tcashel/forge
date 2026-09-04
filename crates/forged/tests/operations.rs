//! The split operator surfaces: one bounded Operations inventory and one
//! exact Work Detail projection. Live-plan discovery remains a two-call,
//! read-only work-store join; durable rows survive a live-read outage unchanged.

mod support;

use std::collections::BTreeMap;
use std::path::PathBuf;

use serde_json::{json, Value};
use support::operator_store::{operator_store_fixture, SUBJECT_TOTAL};
use support::{fabricate_epic, fabricate_run, TestEnv};

fn entries(response: &Value) -> BTreeMap<String, Value> {
    response["result"]["queue"]["groups"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .filter_map(|entry| {
            entry
                .get("id")
                .or_else(|| entry.pointer("/subject/id"))
                .and_then(Value::as_str)
                .map(|id| (id.to_owned(), entry.clone()))
        })
        .collect()
}

fn normalize_v071_golden(value: &mut Value, repository: &str, label: &str) {
    match value {
        Value::Array(values) => {
            for value in values {
                normalize_v071_golden(value, repository, label);
            }
        }
        Value::Object(values) => {
            for value in values.values_mut() {
                normalize_v071_golden(value, repository, label);
            }
        }
        Value::String(value) => {
            *value = value
                .replace(repository, "<repo>")
                .replace(label, "<repo-label>");
            if value.len() >= 20
                && value.as_bytes().get(4) == Some(&b'-')
                && value.as_bytes().get(7) == Some(&b'-')
                && value.as_bytes().get(10) == Some(&b'T')
                && value.ends_with('Z')
            {
                *value = "<timestamp>".to_owned();
            }
        }
        _ => {}
    }
}

fn assert_v071_golden(actual: &Value, expected: &Value, path: &str) {
    match expected {
        Value::Object(expected) => {
            let actual = actual
                .as_object()
                .unwrap_or_else(|| panic!("{path} is not an object: {actual}"));
            for (key, expected) in expected {
                let next = format!("{path}/{key}");
                let actual = actual
                    .get(key)
                    .unwrap_or_else(|| panic!("v0.7.1 key {next} disappeared: {actual:?}"));
                assert_v071_golden(actual, expected, &next);
            }
        }
        Value::Array(expected) => {
            let actual = actual
                .as_array()
                .unwrap_or_else(|| panic!("{path} is not an array: {actual}"));
            assert_eq!(
                actual.len(),
                expected.len(),
                "v0.7.1 array length at {path}"
            );
            for (index, expected) in expected.iter().enumerate() {
                assert_v071_golden(&actual[index], expected, &format!("{path}/{index}"));
            }
        }
        Value::Number(expected) if actual.is_number() => assert_eq!(
            actual.as_f64(),
            expected.as_f64(),
            "v0.7.1 numeric value changed at {path}"
        ),
        _ => assert_eq!(actual, expected, "v0.7.1 value changed at {path}"),
    }
}

fn seed_packet(env: &TestEnv, run_id: &str, seq: i64, stage: forged_types::Stage) -> String {
    let packet_id = format!(
        "{run_id}/{}/{}",
        match stage {
            forged_types::Stage::Implement => "implement",
            forged_types::Stage::ReviewClaude => "reviewclaude",
            forged_types::Stage::ReviewCodex => "reviewcodex",
            forged_types::Stage::Fix => "fix",
        },
        seq
    );
    let packet = forged_types::WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: packet_id.clone(),
        run_id: run_id.to_owned(),
        work_id: format!("bead-{run_id}"),
        stage,
        execution: None,
        lane_seq: None,
        spec: forged_types::SpecRef {
            path: "beads://fixture".to_owned(),
            sha256: "a".repeat(64),
            revision: Some("fixture-revision".to_owned()),
        },
        worktree: PathBuf::from("/unread/worktree"),
        branch: format!("work/{run_id}"),
        base_ref: "main".to_owned(),
        contract: forged_types::StageContract {
            instructions: "fixture".to_owned(),
            gate_commands: Vec::new(),
            deliverable: forged_types::Deliverable::CommitsInWorktree,
            budget_s: 60,
            seat_commands: Vec::new(),
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: forged_types::ProviderHints {
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            effort: None,
            sandbox: forged_types::Sandbox::ReadOnly,
        },
        field_notes: Vec::new(),
    };
    let ledger = env.ledger();
    ledger
        .open_packet(forged_ledger::NewPacket {
            run_id: run_id.to_owned(),
            stage,
            seq,
            spec_path: packet.spec.path.clone(),
            spec_sha256: packet.spec.sha256.clone(),
            spec_revision: packet.spec.revision.clone(),
            policy_revision: None,
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open packet");
    ledger.close().expect("close ledger");
    packet_id
}

fn settle_machine_operation(
    ledger: &forged_ledger::Ledger,
    run_id: &str,
    step: forged_proto::MachineStage,
    result: Value,
) {
    let key = forged_proto::machine_idempotency_key(run_id, step, 0);
    let request = forged_types::OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(run_id.to_owned()),
        params: serde_json::Map::new(),
    };
    let ticket = match ledger
        .begin_operation(
            step.as_str(),
            &request,
            forged_ledger::EffectClass::SafeRetry,
            None,
        )
        .expect("begin machine operation")
    {
        forged_ledger::OperationOutcome::Fresh(ticket) => ticket,
        forged_ledger::OperationOutcome::Replayed(_) => panic!("machine fixture must be fresh"),
    };
    ledger
        .complete_operation(
            &ticket.operation_id,
            &forged_types::OperationResponse {
                ok: true,
                operation_id: ticket.operation_id.clone(),
                reused: false,
                result: Some(result),
                error: None,
            },
        )
        .expect("settle machine operation");
}

#[test]
fn run_status_projects_live_position_and_latest_gate_outcome() {
    let env = TestEnv::new("forged-run-status-position");
    env.forged(&["init"]);
    let run_id = "status-position";
    fabricate_run(&env, run_id);
    let packet_id = seed_packet(&env, run_id, 1, forged_types::Stage::Implement);
    let ledger = env.ledger();
    settle_machine_operation(
        &ledger,
        run_id,
        forged_proto::MachineStage::Resolve,
        json!({"worktree": "fixture"}),
    );
    let claim = ledger
        .claim_packet(
            &packet_id,
            "fixture-seat",
            &forged_ledger::SpecFence::Revision {
                revision: "fixture-revision".to_owned(),
                body_sha256: "a".repeat(64),
            },
        )
        .expect("claim implement packet");
    let attempt = ledger
        .get_attempt(claim.attempt_id)
        .expect("live implement attempt");
    ledger.close().expect("close ledger");

    let (code, status) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "live run status: {status}");
    let run = status["result"]["run"]
        .as_object()
        .expect("run status object");
    assert_eq!(run["currentStage"], json!("implement"));
    assert_eq!(run["startedAt"], json!(attempt.started_at));
    run["startedAt"]
        .as_str()
        .expect("startedAt string")
        .parse::<jiff::Timestamp>()
        .expect("startedAt is RFC3339");
    assert!(
        !run.contains_key("gateState"),
        "a run with no gate attempt must omit gateState: {status}"
    );
    assert_eq!(run["deadlineKills"], json!(0));

    let ledger = env.ledger();
    let result = forged_types::PacketResult {
        schema: "forged.result/1".to_owned(),
        packet_id: packet_id.clone(),
        outcome: forged_types::Outcome::Implement {
            implemented: true,
            commits_ahead: 1,
            summary: "implemented".to_owned(),
            gate_state: Some("fail".to_owned()),
            note: None,
        },
    };
    ledger
        .complete_packet(&packet_id, &claim.claim_token, &result)
        .expect("complete implement packet");
    ledger.close().expect("close ledger");

    let (code, status) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "fallback-gate run status: {status}");
    assert_eq!(
        status["result"]["run"]["gateState"],
        json!("failed"),
        "mid-migration runs fall back to the Implement outcome: {status}"
    );

    let ledger = env.ledger();
    settle_machine_operation(
        &ledger,
        run_id,
        forged_proto::MachineStage::Gate,
        json!({"passed": false}),
    );
    forged_proto::record(
        &ledger,
        run_id,
        forged_proto::ProtoEvent::Gate {
            phase: forged_proto::GatePhase::Gate,
            seq: 0,
            passed: false,
            rows: Vec::new(),
        },
    )
    .expect("record failed gate");
    ledger.close().expect("close ledger");

    let (code, status) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "failed-gate run status: {status}");
    let run = status["result"]["run"]
        .as_object()
        .expect("run status object");
    assert_eq!(run["gateState"], json!("failed"));
    assert_eq!(run["currentStage"], json!("push"));
    assert!(
        !run.contains_key("startedAt"),
        "a run between attempts must omit startedAt: {status}"
    );
    assert!(
        run["settledOperations"]
            .as_array()
            .expect("settled operations")
            .iter()
            .any(|operation| operation["name"] == json!("gate")),
        "gate settlement remains independently visible: {status}"
    );

    let ledger = env.ledger();
    forged_proto::record(
        &ledger,
        run_id,
        forged_proto::ProtoEvent::Gate {
            phase: forged_proto::GatePhase::Regate,
            seq: 1,
            passed: true,
            rows: Vec::new(),
        },
    )
    .expect("record newer passing gate");
    ledger.close().expect("close ledger");

    let (code, status) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "newer-gate run status: {status}");
    assert_eq!(
        status["result"]["run"]["gateState"],
        json!("passed"),
        "the newest proto.gate event must override the Implement outcome: {status}"
    );
}

#[test]
fn run_status_next_actions_execute_after_binding_declared_placeholders() {
    let env = TestEnv::new("forged-run-status-next-actions");
    env.forged(&["init"]);
    let run_id = "status-actions";
    let work_id = "bead-status-actions";
    env.set_work_field(work_id, "assignee", "forged:bead-status-actions:0");
    fabricate_run(&env, run_id);

    let (code, active) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "active status: {active}");
    let action = &active["result"]["run"]["nextActions"][0];
    assert_eq!(action["verb"], json!("run stop"));
    assert_eq!(action["class"], json!("can"));
    assert_eq!(
        action["args"],
        json!({"run": run_id, "outcome": null, "reason": null})
    );
    assert!(action["reason"]
        .as_str()
        .is_some_and(|reason| reason.contains("outcome") && reason.contains("reason")));

    let bound_outcome = "cancelled";
    let bound_reason = "remedy honesty fixture";
    let advertised_run = action["args"]["run"].as_str().expect("advertised run");
    let (code, stopped) = env.forged(&[
        "run",
        "stop",
        "--run",
        advertised_run,
        "--outcome",
        bound_outcome,
        "--reason",
        bound_reason,
    ]);
    assert_eq!(code, 0, "advertised run stop succeeds: {stopped}");

    let (code, terminal) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "stopped status: {terminal}");
    let retry = &terminal["result"]["run"]["nextActions"][0];
    assert_eq!(retry["verb"], json!("run retry"));
    assert_eq!(retry["class"], json!("can"));
    assert_eq!(
        retry["args"],
        json!({"id": run_id, "runId": null}),
        "the successor override is a declared placeholder"
    );
    assert!(retry["reason"]
        .as_str()
        .is_some_and(|reason| reason.contains("current spec")));
    env.set_work_field(work_id, "description", "Retry the current spec");
    env.set_work_field(work_id, "acceptance", "- retry succeeds");
    let advertised_run = retry["args"]["id"].as_str().expect("advertised run");
    let (code, retried) = env.forged(&["run", "retry", "--id", advertised_run]);
    assert_eq!(code, 0, "advertised run retry succeeds: {retried}");
    assert_eq!(retried["result"]["runId"], json!("status-actions-r1"));
    assert_eq!(retried["result"]["retryOf"], json!(run_id));

    let action = &terminal["result"]["run"]["nextActions"][1];
    assert_eq!(action["verb"], json!("work supersede"));
    assert_eq!(action["class"], json!("can"));
    assert_eq!(
        action["args"],
        json!({"id": work_id, "successor": null}),
        "the successor is a declared placeholder, never a fake id"
    );
    assert_eq!(
        action["reason"],
        json!(
            "use work supersede when the spec must change; create the successor first with work create"
        )
    );

    let successor = "status-actions-v2";
    let (code, created) = env.forged(&[
        "work",
        "create",
        "--id",
        successor,
        "--title",
        "Status action successor",
    ]);
    assert_eq!(code, 0, "advertised precondition succeeds: {created}");
    let advertised_id = action["args"]["id"].as_str().expect("advertised work id");
    let (code, superseded) = env.forged(&[
        "work",
        "supersede",
        "--id",
        advertised_id,
        "--successor",
        successor,
    ]);
    assert_eq!(
        code, 0,
        "advertised work supersede succeeds after binding: {superseded}"
    );

    let held_run = "status-input-required";
    env.set_work_field(
        "bead-status-input-required",
        "description",
        "Apply operator input",
    );
    env.set_work_field(
        "bead-status-input-required",
        "acceptance",
        "- amended work retries",
    );
    fabricate_run(&env, held_run);
    let ledger = env.ledger();
    ledger
        .settle_run(
            held_run,
            forged_ledger::RunOutcome::InputRequired,
            "operator input is still required".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle input-required fixture");
    ledger.close().expect("close ledger");
    let (code, held) = env.forged(&["run", "status", "--run", held_run]);
    assert_eq!(code, 0, "input-required status: {held}");
    let held_update = &held["result"]["run"]["nextActions"][0];
    assert_eq!(held_update["verb"], json!("work update"));
    assert_eq!(held_update["class"], json!("should"));
    let update_id = held_update["args"]["id"]
        .as_str()
        .expect("advertised work id");
    let (code, shown) = env.forged(&["work", "show", "--id", update_id]);
    assert_eq!(code, 0, "advertised work update precondition: {shown}");
    let expected_revision = shown["result"]["work"]["revision"]
        .as_u64()
        .expect("current work revision")
        .to_string();
    let (code, updated) = env.forged(&[
        "work",
        "update",
        "--id",
        update_id,
        "--expected-revision",
        &expected_revision,
        "--description",
        "Apply the operator decision before retrying",
    ]);
    assert_eq!(code, 0, "advertised work update succeeds: {updated}");
    let held_retry = &held["result"]["run"]["nextActions"][1];
    assert_eq!(held_retry["verb"], json!("run retry"));
    assert_eq!(held_retry["class"], json!("can"));
    assert!(held_retry["reason"]
        .as_str()
        .is_some_and(|reason| reason.contains("decision or amendment")));
}

#[test]
fn run_status_classes_each_terminal_outcome_by_relevance() {
    let env = TestEnv::new("forged-run-status-action-classes");
    env.forged(&["init"]);
    for (run, outcome) in [
        ("class-clean", forged_ledger::RunOutcome::Clean),
        (
            "class-accepted-risk",
            forged_ledger::RunOutcome::AcceptedRisk,
        ),
        ("class-blocked", forged_ledger::RunOutcome::Blocked),
        (
            "class-input-required",
            forged_ledger::RunOutcome::InputRequired,
        ),
        ("class-cancelled", forged_ledger::RunOutcome::Cancelled),
    ] {
        fabricate_run(&env, run);
        let ledger = env.ledger();
        if outcome == forged_ledger::RunOutcome::AcceptedRisk {
            ledger
                .append_event(
                    Some(run),
                    "run.protocol-terminal",
                    json!({
                        "schemaVersion": 1,
                        "terminal": {
                            "reviewBudgetExhausted": {
                                "reviewRounds": 2,
                                "finalVerdict": "requestChanges",
                            }
                        },
                    }),
                )
                .expect("record review-budget evidence");
            ledger
                .settle_run(
                    run,
                    forged_ledger::RunOutcome::Blocked,
                    "review budget exhausted after 2 rounds with verdict requestChanges".to_owned(),
                    None,
                    None,
                    None,
                )
                .expect("settle review-budget fixture");
            ledger
                .accept_review_risk(
                    run,
                    2,
                    forged_types::AcceptedRisk {
                        accepted_by: "class-operator".to_owned(),
                        rationale: "class fixture risk".to_owned(),
                        findings: Vec::new(),
                    },
                )
                .expect("accept fixture risk");
        } else {
            ledger
                .settle_run(
                    run,
                    outcome,
                    format!("classify {}", outcome.as_str()),
                    None,
                    None,
                    None,
                )
                .expect("settle class fixture");
        }
        ledger.close().expect("close ledger");

        let (code, status) = env.forged(&["run", "status", "--run", run]);
        assert_eq!(code, 0, "{run}: {status}");
        let actions = status["result"]["run"]["nextActions"]
            .as_array()
            .expect("next actions");
        let should = actions
            .iter()
            .filter(|action| action["class"] == json!("should"))
            .collect::<Vec<_>>();
        match outcome {
            forged_ledger::RunOutcome::Clean | forged_ledger::RunOutcome::AcceptedRisk => {
                assert_eq!(should.len(), 1, "{status}");
                assert_eq!(should[0]["verb"], json!("run stop"));
                assert_eq!(should[0]["args"]["outcome"], json!("landed"));
            }
            forged_ledger::RunOutcome::Blocked | forged_ledger::RunOutcome::InputRequired => {
                assert_eq!(should.len(), 1, "{status}");
                assert_eq!(should[0]["verb"], json!("work update"));
            }
            forged_ledger::RunOutcome::Cancelled => assert!(should.is_empty(), "{status}"),
            _ => unreachable!("fixture outcomes are closed above"),
        }
        assert!(actions.iter().any(|action| {
            action["verb"] == json!("run retry") && action["class"] == json!("can")
        }));
        if matches!(
            outcome,
            forged_ledger::RunOutcome::Clean | forged_ledger::RunOutcome::AcceptedRisk
        ) {
            let delivery = should[0];
            let sha = "a".repeat(40);
            let (code, landed) = env.forged(&[
                "run",
                "stop",
                "--run",
                delivery["args"]["run"].as_str().expect("advertised run"),
                "--outcome",
                delivery["args"]["outcome"]
                    .as_str()
                    .expect("advertised outcome"),
                "--reason",
                "reviewed pull request was merged",
                "--pr",
                "42",
                "--sha",
                &sha,
            ]);
            assert_eq!(code, 0, "advertised landed stop succeeds: {landed}");
            assert_eq!(landed["result"]["outcome"], json!("landed"));
        }
    }
}

#[test]
fn run_retry_mints_and_submits_one_flat_successor_at_the_amended_revision() {
    let env = TestEnv::new("forged-run-retry-amended");
    env.forged(&["init"]);
    let run_id = "retry-amended";
    env.set_work_field(run_id, "description", "Execute the original decision");
    env.set_work_field(run_id, "acceptance", "- the original decision executes");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        run_id,
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start source run: {started}");
    let ledger = env.ledger();
    ledger
        .settle_run(
            run_id,
            forged_ledger::RunOutcome::InputRequired,
            "operator decision required".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle source run");
    ledger.close().expect("close ledger");

    env.set_work_field(
        run_id,
        "notes",
        "The operator adjudicated the decision; execute the amended spec.",
    );
    let (code, retried) = env.forged(&[
        "run",
        "retry",
        "--id",
        run_id,
        "--idempotency-key",
        "retry-amended-key",
    ]);
    assert_eq!(code, 0, "retry amended run: {retried}");
    assert_eq!(retried["result"]["runId"], json!("retry-amended-r1"));
    assert_eq!(retried["result"]["retryOf"], json!(run_id));
    assert_eq!(retried["result"]["workId"], json!(run_id));
    assert_eq!(retried["result"]["revision"], json!("4"));
    assert_eq!(retried["result"]["submission"]["phase"], json!("queued"));
    assert!(retried["result"]["packageSha256"].is_string());

    let ledger = env.ledger();
    let successor = ledger
        .get_run("retry-amended-r1")
        .expect("successor run exists");
    assert_eq!(successor.work_id, run_id);
    let desired = ledger
        .get_desired_work(forged_ledger::DesiredSubjectKind::Run, "retry-amended-r1")
        .expect("desired read")
        .expect("retry successor is submitted");
    assert_eq!(desired.restart_budget, 5);
    assert_eq!(desired.restart_used, 0);
    let events = ledger
        .list_events(Some("retry-amended-r1"), 0, 100)
        .expect("successor events");
    let spec = events
        .iter()
        .find(|event| event.kind == "forged.run.spec")
        .expect("successor spec event");
    let spec: Value = serde_json::from_str(&spec.payload_json).expect("spec payload");
    assert_eq!(spec["retryOf"], json!(run_id));
    assert_eq!(spec["beadRevision"], json!("4"));
    ledger.close().expect("close ledger");

    let (code, replayed) = env.forged(&[
        "run",
        "retry",
        "--id",
        run_id,
        "--idempotency-key",
        "retry-amended-key",
    ]);
    assert_eq!(code, 0, "retry replay: {replayed}");
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(replayed["result"], retried["result"]);

    let (code, status) = env.forged(&["run", "status", "--run", "retry-amended-r1"]);
    assert_eq!(code, 0, "successor status: {status}");
    assert_eq!(status["result"]["run"]["retryOf"], json!(run_id));

    let ledger = env.ledger();
    ledger
        .settle_run(
            "retry-amended-r1",
            forged_ledger::RunOutcome::Cancelled,
            "retry generation settled".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle retry generation");
    ledger.close().expect("close ledger");
    let (code, flat) = env.forged(&[
        "run",
        "retry",
        "--id",
        "retry-amended-r1",
        "--idempotency-key",
        "retry-flat-key",
    ]);
    assert_eq!(code, 0, "retry retry-generation: {flat}");
    assert_eq!(flat["result"]["runId"], json!("retry-amended-r2"));
    assert_eq!(flat["result"]["retryOf"], json!("retry-amended-r1"));
}

#[test]
fn run_retry_precondition_remedies_bind_and_execute_the_exact_recovery_verb() {
    let env = TestEnv::new("forged-run-retry-remedies");
    env.forged(&["init"]);
    let repo = env.repos.repo.to_string_lossy().into_owned();

    let live = "retry-remedy-live";
    env.seed_work_spec(
        live,
        "Exercise the live refusal.",
        "The stop remedy executes.",
    );
    assert_eq!(
        env.forged(&[
            "run",
            "start",
            "--work",
            live,
            "--repo",
            &repo,
            "--base-ref",
            "main"
        ])
        .0,
        0
    );
    let (_, refused) = env.forged(&["run", "retry", "--id", live]);
    let remedy = &refused["error"]["detail"];
    assert_eq!(remedy["schema"], json!("forged.remedy/1"));
    assert_eq!(remedy["verb"], json!("run stop"));
    let remedy_run = remedy["args"]["run"].as_str().expect("remedy run");
    let (code, stopped) = env.forged(&[
        "run",
        "stop",
        "--run",
        remedy_run,
        "--outcome",
        "cancelled",
        "--reason",
        "honesty-bound stop",
    ]);
    assert_eq!(code, 0, "run-stop remedy executes: {stopped}");

    env.set_work_field(live, "status", "closed");
    let (_, refused) = env.forged(&["run", "retry", "--id", live]);
    let remedy = &refused["error"]["detail"];
    assert_eq!(remedy["verb"], json!("work reopen"));
    let remedy_work = remedy["args"]["id"].as_str().expect("remedy work");
    let (code, reopened) = env.forged(&["work", "reopen", "--id", remedy_work]);
    assert_eq!(code, 0, "work-reopen remedy executes: {reopened}");

    let landed = "retry-remedy-landed";
    env.seed_work_spec(
        landed,
        "Exercise the delivery refusal.",
        "The work-show remedy executes.",
    );
    assert_eq!(
        env.forged(&[
            "run",
            "start",
            "--work",
            landed,
            "--repo",
            &repo,
            "--base-ref",
            "main"
        ])
        .0,
        0
    );
    let ledger = env.ledger();
    ledger
        .settle_run(
            landed,
            forged_ledger::RunOutcome::Landed,
            "delivery landed".to_owned(),
            Some(91),
            Some("a".repeat(40)),
            None,
        )
        .expect("settle landed run");
    ledger.close().expect("close ledger");
    let (_, refused) = env.forged(&["run", "retry", "--id", landed]);
    let remedy = &refused["error"]["detail"];
    assert_eq!(remedy["verb"], json!("work show"));
    let remedy_work = remedy["args"]["id"].as_str().expect("remedy work");
    let (code, shown) = env.forged(&["work", "show", "--id", remedy_work]);
    assert_eq!(code, 0, "landed work-show remedy executes: {shown}");

    let superseded = "retry-remedy-superseded";
    env.seed_work_spec(
        superseded,
        "Exercise the run successor refusal.",
        "The run-status remedy executes.",
    );
    assert_eq!(
        env.forged(&[
            "run",
            "start",
            "--work",
            superseded,
            "--repo",
            &repo,
            "--base-ref",
            "main",
        ])
        .0,
        0
    );
    fabricate_run(&env, "retry-remedy-successor");
    let ledger = env.ledger();
    ledger
        .settle_run(
            superseded,
            forged_ledger::RunOutcome::Superseded,
            "replaced by successor".to_owned(),
            None,
            None,
            Some("retry-remedy-successor".to_owned()),
        )
        .expect("settle superseded run");
    ledger.close().expect("close ledger");
    let (_, refused) = env.forged(&["run", "retry", "--id", superseded]);
    let remedy = &refused["error"]["detail"];
    assert_eq!(remedy["verb"], json!("run status"));
    let remedy_run = remedy["args"]["run"].as_str().expect("successor run");
    let (code, status) = env.forged(&["run", "status", "--run", remedy_run]);
    assert_eq!(code, 0, "successor run-status remedy executes: {status}");

    let replaced_work = "retry-remedy-work";
    env.seed_work_spec(
        replaced_work,
        "Exercise the Work successor refusal.",
        "The successor work-show remedy executes.",
    );
    assert_eq!(
        env.forged(&[
            "run",
            "start",
            "--work",
            replaced_work,
            "--repo",
            &repo,
            "--base-ref",
            "main",
        ])
        .0,
        0
    );
    let ledger = env.ledger();
    ledger
        .settle_run(
            replaced_work,
            forged_ledger::RunOutcome::Cancelled,
            "terminal source".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle Work source run");
    ledger.close().expect("close ledger");
    let work_successor = "retry-remedy-work-v2";
    assert_eq!(
        env.forged(&[
            "work",
            "create",
            "--id",
            work_successor,
            "--title",
            "Retry remedy Work successor",
        ])
        .0,
        0
    );
    assert_eq!(
        env.forged(&[
            "work",
            "supersede",
            "--id",
            replaced_work,
            "--successor",
            work_successor,
        ])
        .0,
        0
    );
    let (_, refused) = env.forged(&["run", "retry", "--id", replaced_work]);
    let remedy = &refused["error"]["detail"];
    assert_eq!(remedy["verb"], json!("work show"));
    assert_eq!(remedy["args"]["id"], json!(work_successor));
    let (code, shown) = env.forged(&["work", "show", "--id", work_successor]);
    assert_eq!(code, 0, "successor work-show remedy executes: {shown}");
}

#[test]
fn adaptive_run_status_prefers_semantic_stage_in_every_packet_position() {
    let env = TestEnv::new("forged-run-status-adaptive-stage");
    env.forged(&["init"]);
    let run_id = "adaptive-stage";
    env.seed_frontier(run_id);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        run_id,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start adaptive run: {started}");

    let (code, resolved) = env.forged(&["run", "advance", "--run", run_id]);
    assert_eq!(code, 0, "resolve adaptive run: {resolved}");
    assert_eq!(resolved["result"]["action"]["runMachine"], json!("resolve"));

    let (code, status) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "open-packet adaptive status: {status}");
    assert_eq!(status["result"]["run"]["protocolMode"], json!("adaptive"));
    assert_eq!(
        status["result"]["run"]["currentStage"],
        json!("implementation")
    );

    let (code, opened) = env.forged(&["run", "advance", "--run", run_id]);
    assert_eq!(code, 0, "open adaptive packet: {opened}");

    let (code, status) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "await-packet adaptive status: {status}");
    assert_eq!(
        status["result"]["run"]["currentStage"],
        json!("implementation")
    );
    assert_eq!(
        status["result"]["run"]["packets"][0]["stage"],
        json!("implementation")
    );
    assert_eq!(
        status["result"]["run"]["packets"][0]["storageLane"],
        json!("implement")
    );

    let ledger = env.ledger();
    let packet = ledger
        .list_packets(run_id)
        .expect("list adaptive packets")
        .into_iter()
        .next()
        .expect("adaptive packet");
    let fence = packet.spec_revision.as_ref().map_or_else(
        || forged_ledger::SpecFence::Sha256(packet.spec_sha256.clone()),
        |revision| forged_ledger::SpecFence::Revision {
            revision: revision.clone(),
            body_sha256: packet.spec_sha256.clone(),
        },
    );
    let attempt = ledger
        .claim_packet(&packet.packet_id, "fixture-seat", &fence)
        .expect("claim adaptive packet");
    ledger.close().expect("close ledger");

    let (code, status) = env.forged(&["run", "status", "--run", run_id]);
    assert_eq!(code, 0, "live adaptive status: {status}");
    assert_eq!(
        status["result"]["run"]["currentStage"],
        json!("implementation")
    );
    assert_eq!(
        status["result"]["run"]["liveAttempts"][0]["attemptId"],
        json!(attempt.attempt_id)
    );
}

// The bd-binary plan-inventory bound is retired: production reads the
// in-process store. The N+1 discovery contract survives at its operator
// surface — see work_map's graph-cap refusal, which reports exactly the
// limit+1 probe.

// Malformed wire hydration is unrepresentable: a ledger dependency is a
// CHECK-constrained row, so the fail-closed guarantee moved from
// parse-time to write-time. Durable-work visibility stays covered by
// `operations_joins_one_bounded_live_plan_without_duplicate_durable_work`.

#[test]
fn operations_joins_one_bounded_live_plan_without_duplicate_durable_work() {
    let env = TestEnv::new("forged-operations-plan");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();

    fabricate_run(&env, "durable-a");
    env.set_work_field("bead-durable-a", "title", "Already executing");
    env.set_work_field("bead-durable-a", "status", "in_progress");
    env.set_work_repository("bead-durable-a", &repository);

    env.set_work_field("plan-a", "title", "Planned next slice");
    env.set_work_field("plan-a", "status", "open");
    env.set_work_field("plan-a", "priority", "1");
    env.set_work_field("plan-a", "parent", "epic-a");
    // The parent is boundary context, not an in-scope plan row: the ledger
    // materialises every edge target, so its scope must be stated.
    env.set_work_repository("epic-a", "/tmp/a-different-repository");
    env.set_work_field(
        "plan-a",
        "dependencies",
        r#"[{"id":"foundation","dependency_type":"blocks","status":"closed"}]"#,
    );
    env.set_work_repository("plan-a", &repository);

    env.set_work_field("plan-other", "status", "open");
    env.set_work_repository("plan-other", "/tmp/a-different-repository");
    env.set_work_field("plan-closed", "status", "closed");
    env.set_work_repository("plan-closed", &repository);

    let (code, response) = env.forged(&[
        "operations",
        "overview",
        "--repo",
        &repository,
        "--limit",
        "50",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "operations overview: {response}");
    assert_eq!(
        response["result"]["schema"],
        json!("forged.operations-overview/1")
    );
    assert_eq!(
        response["result"]["sourceHealth"]["beads"]["state"],
        json!("available")
    );

    let rows = entries(&response);
    assert_eq!(
        rows.len(),
        2,
        "one durable row and one plan-only row: {response}"
    );
    assert_eq!(rows["durable-a"]["source"], json!("durable"));
    assert_eq!(
        rows["durable-a"]["detailTarget"]["subjectKind"],
        json!("run")
    );
    assert_eq!(rows["plan-a"]["source"], json!("live-plan"));
    assert_eq!(rows["plan-a"]["detailTarget"], Value::Null);
    assert_eq!(rows["plan-a"]["plan"]["parent"], json!("epic-a"));
    // The dependency list now also carries the parent-child edge (the wire
    // gained an entry when edges became rows); search rather than index.
    assert!(
        rows["plan-a"]["plan"]["dependencies"]
            .as_array()
            .expect("dependencies")
            .iter()
            .any(|dep| dep["id"] == json!("foundation")
                && dep["dependencyType"] == json!("blocks")),
        "{rows:?}"
    );
    assert!(
        !rows.contains_key("bead-durable-a"),
        "durable work suppresses its plan twin"
    );
    assert!(
        !rows.contains_key("plan-other"),
        "repository scope cannot leak"
    );
    assert!(
        !rows.contains_key("plan-closed"),
        "terminal plan rows are excluded"
    );

    let (code, summary) = env.forged(&[
        "operations",
        "overview",
        "--repo",
        &repository,
        "--limit",
        "50",
    ]);
    assert_eq!(code, 0, "summary operations overview: {summary}");
    let rows = entries(&summary);
    assert_eq!(rows["plan-a"]["subject"]["kind"], json!("work"));
    assert_eq!(rows["plan-a"]["subject"]["id"], json!("plan-a"));
    assert_eq!(
        rows["plan-a"]["subject"]["title"],
        json!("Planned next slice")
    );
    assert_eq!(rows["plan-a"]["subject"]["repository"], json!(repository));
    assert_eq!(rows["plan-a"]["subject"]["revision"], json!("2"));
    assert_eq!(
        rows["plan-a"]["plan"],
        json!({
            "status": "open",
            "readiness": "ready",
            "issueType": "task",
            "priority": 1,
            "assignee": Value::Null,
            "parent": "epic-a",
            "dependencyCount": 2,
        }),
        "the bounded producer retains enough plan facts for the App drawer: {summary}"
    );

    // The bounded-read contract (one claim batch, one discovery, one
    // hydrate, never a graph walk) is structural in the in-process store
    // and no longer observable as argv.
}

/// The 2026-08-17 incident, at the surface that reported it: one live plan
/// carrying a native `supersedes` edge failed the whole repository-scoped
/// plan hydrate closed, so Operations served zero plan rows. The relation is
/// provenance — it must keep the source available and the row visible while
/// the deliberately unsupported kinds keep failing closed.
#[test]
fn a_supersedes_edge_keeps_the_repository_plan_source_available() {
    let env = TestEnv::new("forged-operations-supersedes");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();

    env.set_work_field("plan-replacement", "title", "Replacement slice");
    env.set_work_field("plan-replacement", "status", "open");
    env.set_work_field(
        "plan-replacement",
        "dependencies",
        r#"[{"id":"plan-superseded","dependency_type":"supersedes","status":"open"}]"#,
    );
    env.set_work_repository("plan-replacement", &repository);
    env.set_work_field("plan-superseded", "title", "Superseded slice");
    env.set_work_field("plan-superseded", "status", "open");
    env.set_work_repository("plan-superseded", &repository);

    let (code, response) = env.forged(&[
        "operations",
        "overview",
        "--repo",
        &repository,
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "operations overview: {response}");
    assert_eq!(
        response["result"]["sourceHealth"]["plan"],
        json!({
            "state": "available",
            "error": Value::Null,
            "discovered": 2,
            "limit": 500,
            "truncated": false,
        }),
        "a provenance edge cannot degrade the plan source: {response}"
    );
    assert_eq!(response["result"]["coverage"]["matching"], json!(2));
    assert_eq!(response["result"]["coverage"]["shown"], json!(2));
    assert_eq!(response["result"]["counts"]["planOnly"], json!(2));

    let rows = entries(&response);
    assert_eq!(rows["plan-replacement"]["source"], json!("live-plan"));
    assert_eq!(
        rows["plan-replacement"]["plan"]["dependencies"],
        json!([{"id": "plan-superseded", "dependencyType": "supersedes", "status": "open"}]),
        "the exact native kind reaches the wire: {response}"
    );
    assert_eq!(
        rows["plan-replacement"]["plan"]["readiness"],
        json!("ready"),
        "an open superseded target is history, not a blocker: {response}"
    );
    assert!(
        rows.contains_key("plan-superseded"),
        "the superseded plan stays visible on its own terms: {response}"
    );

    assert_eq!(
        response["result"]["attention"],
        json!([]),
        "provenance never raises blocker attention: {response}"
    );
    assert_eq!(response["result"]["counts"]["attention"], json!(0));
}

/// The control for the test above: a kind forged has NOT adjudicated still
/// fails the plan source closed, so the fix admitted one relation rather
/// than every string bd advertises.
// The unadjudicated-dependency-kind guard moved to write time: the
// work_deps CHECK rejects unknown kinds at the seam, unit-covered in
// forged-ledger. A surface test can no longer construct the state.

#[test]
fn operations_reports_durable_rows_from_the_store() {
    let env = TestEnv::new("forged-operations-outage");
    env.forged(&["init"]);
    fabricate_run(&env, "durable-outage");

    let (code, response) = env.forged(&["operations", "overview", "--detail", "full"]);
    assert_eq!(
        code, 0,
        "Beads degradation is data, not total failure: {response}"
    );
    assert_eq!(
        response["result"]["sourceHealth"]["ledger"]["state"],
        json!("available")
    );
    assert_eq!(
        response["result"]["sourceHealth"]["beads"]["state"],
        json!("available")
    );
    assert_eq!(
        response["result"]["sourceHealth"]["plan"]["state"],
        json!("available")
    );
    let rows = entries(&response);
    assert_eq!(rows["durable-outage"]["source"], json!("durable"));
    assert_eq!(
        rows["durable-outage"]["controller"],
        Value::Null,
        "no durable controller record is reported as absent without an OS probe"
    );
}

#[test]
fn operations_filters_and_bounds_fail_closed() {
    let env = TestEnv::new("forged-operations-invalid");
    env.forged(&["init"]);
    for args in [
        vec!["operations", "overview", "--repo", " "],
        vec!["operations", "overview", "--group", "mystery"],
        vec!["operations", "overview", "--source", "filesystem"],
        vec!["operations", "overview", "--limit", "0"],
        vec!["operations", "overview", "--limit", "201"],
    ] {
        let (code, response) = env.forged(&args);
        assert_ne!(
            code, 0,
            "invalid operations filter unexpectedly widened: {response}"
        );
        assert_eq!(
            response["error"]["code"],
            json!("INVALID_REQUEST"),
            "{response}"
        );
    }
}

#[test]
fn full_projections_preserve_every_v071_golden_key_and_value() {
    let env = TestEnv::new("forged-v071-projection-golden");
    env.forged(&["init"]);
    fabricate_run(&env, "golden-run");

    let (code, operations) = env.forged(&[
        "operations",
        "overview",
        "--detail",
        "full",
        "--limit",
        "200",
    ]);
    assert_eq!(code, 0, "full Operations: {operations}");
    let (code, detail) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "golden-run",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "full Work Detail: {detail}");
    let (code, portfolio) = env.forged(&["overview", "--detail", "full"]);
    assert_eq!(code, 0, "full portfolio: {portfolio}");

    let repository = operations["result"]["queue"]["groups"]
        .as_array()
        .expect("queue groups")
        .iter()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .next()
        .and_then(|entry| entry.pointer("/identity/repository/path"))
        .and_then(Value::as_str)
        .expect("fixture repository");
    let label = operations["result"]["queue"]["groups"]
        .as_array()
        .expect("queue groups")
        .iter()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .next()
        .and_then(|entry| entry.pointer("/identity/repository/label"))
        .and_then(Value::as_str)
        .expect("fixture repository label");
    let mut actual = json!({
        "operations": operations["result"],
        "work-detail": detail["result"],
        "portfolio": portfolio["result"],
    });
    normalize_v071_golden(&mut actual, repository, label);
    let expected: Value = serde_json::from_str(include_str!("fixtures/v071-full-projections.json"))
        .expect("v0.7.1 full-projection golden");
    assert_v071_golden(&actual, &expected, "");
}

#[test]
fn projection_defaults_are_bounded_and_full_preserves_the_v071_keys() {
    let env = TestEnv::new("forged-bounded-projections");
    env.forged(&["init"]);
    let fixture = operator_store_fixture();
    for subject in &fixture.subjects {
        fabricate_run(&env, &subject.id);
    }
    let focus = fixture
        .subjects
        .last()
        .expect("fixture subject")
        .id
        .as_str();
    let overview_event_total = {
        let ledger = env.ledger();
        for ordinal in 0..125 {
            ledger
                .append_event(
                    Some(focus),
                    "projection.fixture",
                    json!({"ordinal": ordinal}),
                )
                .expect("append overview event fixture");
        }
        let total = ledger
            .count_events(Some(focus), 0)
            .expect("count overview event fixture");
        ledger.close().expect("close ledger");
        total
    };

    let (code, operations) = env.forged(&["operations", "overview"]);
    assert_eq!(code, 0, "operations summary: {operations}");
    assert_eq!(operations["result"]["coverage"]["limit"], json!(30));
    assert_eq!(operations["result"]["coverage"]["shown"], json!(30));
    assert_eq!(
        operations["result"]["coverage"]["total"],
        json!(SUBJECT_TOTAL)
    );
    assert_eq!(operations["result"]["coverage"]["truncated"], json!(true));
    assert_eq!(operations["result"]["coverage"]["nextCursor"], Value::Null);
    let summary_entry = operations["result"]["queue"]["groups"]
        .as_array()
        .expect("summary groups")
        .iter()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .next()
        .expect("summary entry");
    assert_eq!(
        summary_entry
            .as_object()
            .expect("summary object")
            .keys()
            .map(String::as_str)
            .collect::<std::collections::BTreeSet<_>>(),
        std::collections::BTreeSet::from([
            "attention",
            "claimHealth",
            "currentStage",
            "delivery",
            "executionHealth",
            "liveSeats",
            "next",
            "nextAction",
            "pr",
            "spend",
            "state",
            "subject",
        ])
    );
    assert!(operations["result"]["attention"]["counts"].is_object());
    assert!(operations["result"]["attention"]["decisions"].is_array());
    let operations_bytes = serde_json::to_vec(&operations)
        .expect("serialize Operations")
        .len();
    assert!(
        operations_bytes <= 20 * 1024,
        "default Operations is {operations_bytes} bytes, above 20 KiB"
    );
    let (code, full_operations) = env.forged(&[
        "operations",
        "overview",
        "--detail",
        "full",
        "--limit",
        "200",
    ]);
    assert_eq!(code, 0, "operations full: {full_operations}");
    assert!(full_operations["result"]["attention"].is_array());
    let full_entry = full_operations["result"]["queue"]["groups"]
        .as_array()
        .expect("full groups")
        .iter()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .next()
        .expect("full entry");
    for key in [
        "id",
        "kind",
        "beadId",
        "repo",
        "branch",
        "state",
        "createdAt",
        "updatedAt",
        "identity",
        "controller",
        "desired",
        "admission",
        "attentionItems",
    ] {
        assert!(
            full_entry.get(key).is_some(),
            "full Operations lost v0.7.1 entry key {key}: {full_entry}"
        );
    }

    let (code, listed) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list summary: {listed}");
    assert_eq!(listed["result"]["coverage"]["limit"], json!(30));
    assert_eq!(listed["result"]["coverage"]["shown"], json!(30));

    let (code, portfolio) = env.forged(&["overview"]);
    assert_eq!(code, 0, "portfolio summary: {portfolio}");
    assert_eq!(portfolio["result"]["cap"], json!(30));
    assert_eq!(
        portfolio["result"]["entries"].as_array().map(Vec::len),
        Some(30)
    );
    assert_eq!(portfolio["result"]["coverage"]["truncated"], json!(true));

    let detail_args = [
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        focus,
    ];
    let (code, detail) = env.forged(&detail_args);
    assert_eq!(code, 0, "work detail summary: {detail}");
    for full_only in ["attempts", "artifacts", "packets", "events"] {
        assert!(
            detail["result"].get(full_only).is_none(),
            "summary Work Detail leaked {full_only}: {detail}"
        );
    }
    assert!(
        serde_json::to_vec(&detail)
            .expect("serialize Work Detail")
            .len()
            <= 8 * 1024,
        "default Work Detail exceeds 8 KiB"
    );
    let mut full_detail_args = detail_args.to_vec();
    full_detail_args.extend(["--detail", "full"]);
    let (code, full_detail) = env.forged(&full_detail_args);
    assert_eq!(code, 0, "work detail full: {full_detail}");
    for key in [
        "schema",
        "kind",
        "id",
        "workRef",
        "identity",
        "titleSource",
        "cursor",
        "status",
        "delivery",
        "deadlineKills",
        "desired",
        "admission",
        "children",
        "packets",
        "attempts",
        "workers",
        "artifacts",
        "artifactCoverage",
        "usage",
        "effectCustody",
        "gates",
        "reviews",
        "attention",
        "attentionTotal",
        "attentionLimit",
        "attentionTruncated",
        "attentionCoverage",
        "events",
    ] {
        assert!(
            full_detail["result"].get(key).is_some(),
            "full Work Detail lost v0.7.1 key {key}: {full_detail}"
        );
    }
    for shared in [
        "schema",
        "kind",
        "id",
        "workRef",
        "identity",
        "titleSource",
        "status",
        "delivery",
        "deadlineKills",
    ] {
        assert_eq!(
            detail["result"][shared], full_detail["result"][shared],
            "full Work Detail changed v0.7.1 value for {shared}"
        );
    }

    let (code, overview) = env.forged(&["overview", "--run", focus]);
    assert_eq!(code, 0, "run overview summary: {overview}");
    assert_eq!(
        overview["result"]["events"].as_array().map(Vec::len),
        Some(30),
        "summary overview must read only its default event page: {overview}"
    );
    assert_eq!(
        overview["result"]["coverage"],
        json!({
            "shown": 30,
            "total": overview_event_total,
            "truncated": true,
            "nextCursor": overview["result"]["cursor"],
        }),
        "summary overview must state the bounded event page: {overview}"
    );
    for full_only in ["packetHistory", "artifacts", "interventions"] {
        assert!(overview["result"].get(full_only).is_none(), "{overview}");
    }
    assert!(overview["result"]["reviews"].get("events").is_none());
    assert!(
        serde_json::to_vec(&overview)
            .expect("serialize overview")
            .len()
            <= 8 * 1024,
        "default run overview exceeds 8 KiB"
    );
    let (code, full_overview) = env.forged(&["overview", "--run", focus, "--detail", "full"]);
    assert_eq!(code, 0, "run overview full: {full_overview}");
    assert_eq!(
        full_overview["result"]["events"]["events"]
            .as_array()
            .map(Vec::len),
        Some(100),
        "full overview preserves the v0.7.1 default event page: {full_overview}"
    );
    for key in [
        "schema",
        "kind",
        "id",
        "identity",
        "events",
        "cursor",
        "status",
        "workers",
        "gates",
        "reviews",
        "packetHistory",
        "artifacts",
        "interventions",
        "rosterRevisions",
        "policyRevisions",
        "admission",
        "usage",
    ] {
        assert!(
            full_overview["result"].get(key).is_some(),
            "full overview lost v0.7.1 key {key}: {full_overview}"
        );
    }

    let (code, explain) = env.forged(&["explain", "--id", "budget-34"]);
    assert_eq!(code, 0, "explain summary: {explain}");
    assert!(
        serde_json::to_vec(&explain)
            .expect("serialize explain")
            .len()
            <= 8 * 1024,
        "default explain exceeds 8 KiB"
    );

    for args in [
        vec!["attention", "list"],
        vec!["session", "list", "--run", focus],
        vec!["events", "--run", focus],
        vec!["work", "history"],
    ] {
        let (code, listed) = env.forged(&args);
        assert_eq!(code, 0, "{args:?}: {listed}");
        if args.first() == Some(&"events") {
            assert_eq!(
                listed["result"]["summary"],
                json!(false),
                "omitting both events projection flags preserves full payloads: {listed}"
            );
            let projected = listed["result"]["events"]
                .as_array()
                .expect("event rows")
                .iter()
                .find(|event| event["kind"] == json!("projection.fixture"))
                .expect("fixture event");
            assert!(
                projected["payload"]["ordinal"].is_number(),
                "the no-flag event body is not summarized: {projected}"
            );
        }
        for field in ["shown", "total", "truncated", "nextCursor"] {
            assert!(
                listed["result"]["coverage"].get(field).is_some(),
                "{args:?} omits coverage.{field}: {listed}"
            );
        }
    }

    let created = env.forged(&[
        "work",
        "create",
        "--id",
        "budget-note",
        "--title",
        "Budget note item",
    ]);
    assert_eq!(created.0, 0, "work create: {}", created.1);
    let (code, notes) = env.forged(&["work", "note", "list", "--id", "budget-note"]);
    assert_eq!(code, 0, "work note list: {notes}");
    for field in ["shown", "total", "truncated", "nextCursor"] {
        assert!(
            notes["result"]["coverage"].get(field).is_some(),
            "work note list omits coverage.{field}: {notes}"
        );
    }
}

#[test]
fn work_detail_requires_an_exact_kind_and_projects_the_shared_subject_truth() {
    let env = TestEnv::new("forged-work-detail");
    env.forged(&["init"]);
    fabricate_run(&env, "detail-a");
    let ledger = env.ledger();
    ledger
        .append_event(Some("detail-a"), "detail.one", json!({"ordinal": 1}))
        .expect("first event");
    ledger
        .append_event(Some("detail-a"), "detail.two", json!({"ordinal": 2}))
        .expect("second event");
    ledger
        .append_event(
            Some("detail-a"),
            "proto.quarantine",
            json!({"reason": "page-sensitive source"}),
        )
        .expect("event-backed attention source");
    ledger
        .record_usage(forged_ledger::NewUsage {
            run_id: "detail-a".to_owned(),
            packet_id: None,
            attempt_id: None,
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            input_tokens: 1,
            output_tokens: 1,
            cache_read_tokens: None,
            cache_write_tokens: None,
            cost_usd: None,
            pricing_basis: None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("unpriced usage");
    ledger.close().expect("close ledger");
    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "detail-a",
        "--limit",
        "1",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "work detail: {response}");
    assert_eq!(response["result"]["schema"], json!("forged.work-detail/1"));
    assert_eq!(
        response["result"]["workRef"],
        json!({"schema":"forged.work-ref/1","kind":"run","id":"detail-a"})
    );
    assert_eq!(response["result"]["id"], json!("detail-a"));
    assert_eq!(response["result"]["identity"]["subject"]["id"], "detail-a");
    assert_eq!(response["result"]["status"]["state"], "active");
    assert_eq!(response["result"]["attempts"]["total"], 0);
    assert_eq!(response["result"]["workers"]["total"], 0);
    assert_eq!(
        response["result"]["events"]["events"]
            .as_array()
            .unwrap()
            .len(),
        1
    );
    assert_eq!(response["result"]["events"]["truncated"], true);
    assert_eq!(response["result"]["events"]["after"], 0);
    assert_eq!(
        response["result"]["attention"][0]["condition"],
        "missing-cost"
    );
    assert_eq!(
        response["result"]["attentionCoverage"]["controlsComplete"],
        false
    );
    assert_eq!(
        response["result"]["attentionCoverage"]["eventBackedConditionsComplete"],
        false
    );
    let attention_id = response["result"]["attention"][0]["attentionId"].clone();
    let occurrence_id = response["result"]["attention"][0]["occurrenceId"].clone();
    let after = response["result"]["cursor"]
        .as_i64()
        .expect("first page cursor")
        .to_string();
    let (code, later_page) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "detail-a",
        "--after",
        &after,
        "--limit",
        "25",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "later page: {later_page}");
    assert_eq!(
        later_page["result"]["attention"][0]["attentionId"],
        attention_id
    );
    assert_eq!(
        later_page["result"]["attention"][0]["occurrenceId"],
        occurrence_id
    );
    assert!(
        later_page["result"]["attention"]
            .as_array()
            .expect("attention")
            .iter()
            .all(|item| item["condition"] != "quarantined"),
        "an incomplete later page must not manufacture page-dependent attention"
    );
    assert_eq!(
        later_page["result"]["attentionCoverage"]["controlsComplete"], false,
        "a later page never pretends it covered older control transitions"
    );

    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "missing",
        "--limit",
        "25",
        "--detail",
        "full",
    ]);
    assert_ne!(
        code, 0,
        "missing exact target must not resolve by prefix: {response}"
    );
    assert_eq!(response["error"]["code"], json!("RUN_NOT_FOUND"));
}

#[test]
fn work_detail_captures_epic_children_from_the_atomic_ledger_subject() {
    let env = TestEnv::new("forged-work-detail-epic");
    env.forged(&["init"]);
    fabricate_epic(&env, "detail-epic");
    fabricate_run(&env, "detail-child");

    let repository = forged_types::normalize_repository_path(&env.repos.repo.to_string_lossy())
        .expect("canonical repository");
    let label = forged_types::repository_label(&repository).expect("repository label");
    let child_title = "Child detail";
    let epic = forged_types::WorkIdentityContextV1 {
        id: "detail-epic".to_owned(),
        title: Some("Epic detail-epic".to_owned()),
    };
    let display_title = forged_types::work_display_title(
        "detail-child",
        Some(child_title),
        Some(&label),
        None,
        Some(&epic),
    );
    let connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open fixture db");
    connection
        .execute(
            "DELETE FROM work_identities WHERE subject_kind = 'run' AND subject_id = 'detail-child'",
            [],
        )
        .expect("remove legacy child identity");
    connection
        .execute(
            "INSERT INTO work_identities (
               schema, subject_kind, subject_id, bead_id, bead_title, bead_revision,
               repository_path, repository_label, project_id, project_title,
               epic_id, epic_title, display_title, captured_at, source
             ) VALUES ('forged.work-identity/1', 'run', 'detail-child',
               'bead-detail-child', ?1, NULL, ?2, ?3, NULL, NULL,
               'detail-epic', 'Epic detail-epic', ?4,
               '2026-08-14T12:00:00Z', 'durable')",
            rusqlite::params![child_title, repository, label, display_title],
        )
        .expect("insert epic child identity");
    drop(connection);
    let ledger = env.ledger();
    ledger
        .append_event(
            Some("detail-epic"),
            "forged.epic.child.started",
            json!({"childId":"bead-detail-child","runId":"detail-child"}),
        )
        .expect("child start");
    ledger.close().expect("close ledger");

    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "epic",
        "--subject-id",
        "detail-epic",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "epic detail: {response}");
    assert_eq!(response["result"]["workRef"]["kind"], "epic");
    assert_eq!(response["result"]["children"]["total"], 1);
    assert_eq!(
        response["result"]["children"]["items"][0]["runId"],
        "detail-child"
    );
    assert_eq!(
        response["result"]["children"]["items"][0]["identity"]["epic"]["id"],
        "detail-epic"
    );
    assert_eq!(
        response["result"]["attentionCoverage"]["controlsComplete"], false,
        "the parent stream cannot prove child-run control transitions"
    );
    // The epic child capture is one atomic ledger read; the per-projection
    // read budget is structural now.
}

#[test]
fn work_detail_bounds_history_uses_only_manifest_metadata_and_fails_closed_on_results() {
    let env = TestEnv::new("forged-work-detail-bounds");
    env.forged(&["init"]);
    fabricate_run(&env, "detail-many");
    let packet_id = seed_packet(&env, "detail-many", 1, forged_types::Stage::Implement);
    let review_packet = seed_packet(&env, "detail-many", 1, forged_types::Stage::ReviewClaude);
    let good_result = serde_json::to_string(&forged_types::PacketResult {
        schema: "forged.result/1".to_owned(),
        packet_id: packet_id.clone(),
        outcome: forged_types::Outcome::Implement {
            implemented: true,
            commits_ahead: 1,
            summary: "done".to_owned(),
            gate_state: Some("pass".to_owned()),
            note: None,
        },
    })
    .expect("result");
    let review_result = serde_json::to_string(&forged_types::PacketResult {
        schema: "forged.result/1".to_owned(),
        packet_id: review_packet.clone(),
        outcome: forged_types::Outcome::Review {
            verdict: forged_types::Verdict::RequestChanges,
            summary: "one finding".to_owned(),
            findings: vec![forged_types::Finding {
                severity: forged_types::Severity::High,
                file: Some("src/lib.rs".to_owned()),
                line: Some(7),
                message: "repair this".to_owned(),
            }],
            available: true,
        },
    })
    .expect("review result");
    let mut connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open fixture db");
    let transaction = connection.transaction().expect("fixture transaction");
    for attempt_id in 1..=205i64 {
        transaction
            .execute(
                "INSERT INTO attempts (
                           attempt_id, packet_id, claim_token, claimant, state, fail_note,
                           result_json, started_at, updated_at, ended_at
                         ) VALUES (?1, ?2, ?3, 'fixture',
                           CASE WHEN ?1 = 1 THEN 'completed' ELSE 'failed' END,
                           CASE WHEN ?1 = 1 THEN NULL ELSE 'fixture failure' END,
                           CASE WHEN ?1 = 1 THEN ?4 ELSE NULL END,
                           '2026-08-14T12:00:00Z', '2026-08-14T12:00:01Z',
                           '2026-08-14T12:00:01Z')",
                rusqlite::params![
                    attempt_id,
                    packet_id,
                    format!("claim-{attempt_id}"),
                    good_result,
                ],
            )
            .expect("insert attempt");
    }
    transaction
        .execute(
            "INSERT INTO attempts (
               attempt_id, packet_id, claim_token, claimant, state, result_json,
               started_at, updated_at, ended_at
             ) VALUES (206, ?1, 'claim-206', 'fixture', 'completed', ?2,
               '2026-08-14T12:00:00Z', '2026-08-14T12:00:01Z',
               '2026-08-14T12:00:01Z')",
            rusqlite::params![review_packet, review_result],
        )
        .expect("insert review attempt");
    transaction
        .execute(
            "INSERT INTO attempt_artifacts (
                       attempt_id, run_id, packet_id, manifest_schema, manifest_path,
                       manifest_sha256, retention_class, created_at
                     ) VALUES (1, 'detail-many', ?1, 'forged.attempt-artifacts/1',
                       'does/not/exist/manifest.json', ?2, 'retain',
                       '2026-08-14T12:00:02Z')",
            rusqlite::params![packet_id, "b".repeat(64)],
        )
        .expect("insert manifest metadata");
    transaction
        .execute(
            "INSERT INTO owned_herdr_sessions (
                       ownership_id, schema, owner_kind, subject_kind, subject_id,
                       controller_generation, pane_id, socket_path, protocol, sentinel_path,
                       lifecycle_state, cleanup_state, cleanup_retry_budget, cleanup_retry_used,
                       registered_at, updated_at
                     ) VALUES ('detail-controller', 'forged.owned-herdr-session/1',
                       'controller', 'run', 'detail-many', 1, 'opaque-pane',
                       '/unread/socket', 19, '/unread/sentinel', 'registered',
                       'not-requested', 8, 0, '2026-08-14T12:00:00Z',
                       '2026-08-14T12:00:00Z')",
            [],
        )
        .expect("insert durable session ownership");
    transaction.commit().expect("commit fixture");
    drop(connection);

    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "detail-many",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "bounded detail: {response}");
    assert_eq!(response["result"]["attempts"]["total"], 206);
    assert_eq!(
        response["result"]["attempts"]["items"]
            .as_array()
            .unwrap()
            .len(),
        200
    );
    assert_eq!(response["result"]["attempts"]["truncated"], true);
    assert_eq!(response["result"]["workers"]["total"], 1);
    assert_eq!(response["result"]["gates"]["total"], 1);
    assert_eq!(response["result"]["reviews"]["resultTotal"], 1);
    assert_eq!(response["result"]["reviews"]["latestFindingTotal"], 1);
    assert_eq!(
        response["result"]["artifacts"][0]["attempts"][0]["manifest"]["path"],
        "does/not/exist/manifest.json",
        "Work Detail projects joined metadata without opening the path"
    );

    let connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open fixture db");
    connection
        .execute(
            "UPDATE attempts SET result_json = '{' WHERE attempt_id = 1",
            [],
        )
        .expect("corrupt stored result");
    drop(connection);
    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "detail-many",
        "--detail",
        "full",
    ]);
    assert_ne!(code, 0, "corrupt PacketResult must fail closed");
    assert_eq!(response["error"]["code"], "INTERNAL");
    assert!(
        response["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("invalid stored PacketResult")),
        "{response}"
    );
}

#[test]
fn work_detail_projects_legacy_gate_prose_as_unknown_without_failed_gate_attention() {
    let env = TestEnv::new("forged-work-detail-legacy-gate");
    env.forged(&["init"]);
    fabricate_run(&env, "detail-legacy-gate");
    let packet_id = seed_packet(
        &env,
        "detail-legacy-gate",
        1,
        forged_types::Stage::Implement,
    );
    let prose = "all five gates pass: build, test, clippy, fmt, docs";
    let gate_states = ["pass", "fail", prose];
    let mut connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open fixture db");
    let transaction = connection.transaction().expect("fixture transaction");
    for (offset, gate_state) in gate_states.into_iter().enumerate() {
        let attempt_id = i64::try_from(offset + 1).expect("small fixture id");
        let result = serde_json::to_string(&forged_types::PacketResult {
            schema: "forged.result/1".to_owned(),
            packet_id: packet_id.clone(),
            outcome: forged_types::Outcome::Implement {
                implemented: true,
                commits_ahead: 1,
                summary: format!("fixture {gate_state}"),
                gate_state: Some(gate_state.to_owned()),
                note: None,
            },
        })
        .expect("result json");
        transaction
            .execute(
                "INSERT INTO attempts (
                   attempt_id, packet_id, claim_token, claimant, state, result_json,
                   started_at, updated_at, ended_at
                 ) VALUES (?1, ?2, ?3, 'fixture', 'completed', ?4,
                   '2026-08-14T12:00:00Z', '2026-08-14T12:00:01Z',
                   '2026-08-14T12:00:01Z')",
                rusqlite::params![attempt_id, packet_id, format!("claim-{attempt_id}"), result,],
            )
            .expect("insert stored result_json fixture");
    }
    transaction.commit().expect("commit fixture");
    drop(connection);

    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "detail-legacy-gate",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "work detail: {response}");
    let gates = response["result"]["gates"]["items"]
        .as_array()
        .expect("gate rows");
    assert_eq!(gates.len(), 3, "{response}");
    assert_eq!(gates[0]["passed"], json!(true));
    assert_eq!(gates[1]["passed"], json!(false));
    assert_eq!(gates[2]["gateState"], json!(prose));
    assert_eq!(gates[2]["passed"], Value::Null);
    assert!(
        response["result"]["attention"]
            .as_array()
            .expect("attention rows")
            .iter()
            .all(|item| item["condition"] != "failed-gate"),
        "a latest legacy gate value is unknown, not failed: {response}"
    );
}

#[test]
fn packet_complete_rejects_a_non_closed_gate_state_by_field_and_value() {
    let env = TestEnv::new("forged-packet-complete-gate-state");
    env.forged(&["init"]);
    fabricate_run(&env, "complete-gate-state");
    let packet_id = seed_packet(
        &env,
        "complete-gate-state",
        1,
        forged_types::Stage::Implement,
    );
    let claim = {
        let ledger = env.ledger();
        let claim = ledger
            .claim_packet(
                &packet_id,
                "fixture-seat",
                &forged_ledger::SpecFence::Revision {
                    revision: "fixture-revision".to_owned(),
                    body_sha256: "a".repeat(64),
                },
            )
            .expect("claim packet");
        ledger.close().expect("close ledger");
        claim
    };
    let prose = "all five gates pass: build, test, clippy, fmt, docs";
    let result_file = env.root.join("invalid-gate-result.json");
    std::fs::write(
        &result_file,
        serde_json::to_vec(&forged_types::PacketResult {
            schema: "forged.result/1".to_owned(),
            packet_id: packet_id.clone(),
            outcome: forged_types::Outcome::Implement {
                implemented: true,
                commits_ahead: 1,
                summary: "fixture".to_owned(),
                gate_state: Some(prose.to_owned()),
                note: None,
            },
        })
        .expect("result json"),
    )
    .expect("write result fixture");
    let attempt_id = claim.attempt_id.to_string();
    let (code, response) = env.forged(&[
        "packet",
        "complete",
        "--packet",
        &packet_id,
        "--attempt",
        &attempt_id,
        "--claim-token",
        &claim.claim_token,
        "--result",
        result_file.to_str().expect("utf8 result path"),
    ]);
    assert_ne!(code, 0, "non-closed gateState must be refused");
    assert_eq!(response["error"]["code"], json!("INVALID_REQUEST"));
    assert_eq!(
        response["error"]["message"],
        json!(format!(
            "implement result gateState must be exactly \"pass\" or \"fail\", got {prose:?}"
        ))
    );
    let (retry_code, retry_response) = env.forged(&[
        "packet",
        "complete",
        "--packet",
        &packet_id,
        "--attempt",
        &attempt_id,
        "--claim-token",
        &claim.claim_token,
        "--result",
        result_file.to_str().expect("utf8 result path"),
    ]);
    assert_ne!(retry_code, 0, "identical invalid retry must be refused");
    assert_eq!(retry_response["error"]["code"], json!("INVALID_REQUEST"));

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .get_attempt(claim.attempt_id)
            .expect("attempt remains")
            .state,
        forged_ledger::AttemptState::Running
    );
    assert!(
        ledger
            .find_operation(
                "packet_complete",
                "op:packet_complete:complete-gate-state:implement:1",
            )
            .expect("query packet_complete operation")
            .is_none(),
        "invalid PacketResult must not reserve the HumanAmbiguous fence"
    );
    ledger.close().expect("close ledger");

    std::fs::write(
        &result_file,
        serde_json::to_vec(&forged_types::PacketResult {
            schema: "forged.result/1".to_owned(),
            packet_id: packet_id.clone(),
            outcome: forged_types::Outcome::Implement {
                implemented: true,
                commits_ahead: 1,
                summary: "corrected fixture".to_owned(),
                gate_state: Some("pass".to_owned()),
                note: None,
            },
        })
        .expect("corrected result json"),
    )
    .expect("write corrected result fixture");
    let (corrected_code, corrected_response) = env.forged(&[
        "packet",
        "complete",
        "--packet",
        &packet_id,
        "--attempt",
        &attempt_id,
        "--claim-token",
        &claim.claim_token,
        "--result",
        result_file.to_str().expect("utf8 result path"),
    ]);
    assert_eq!(
        corrected_code, 0,
        "corrected result must land under the default key: {corrected_response}"
    );
    let ledger = env.ledger();
    let attempt = ledger
        .get_attempt(claim.attempt_id)
        .expect("completed attempt");
    assert_eq!(attempt.state, forged_ledger::AttemptState::Completed);
    let landed: forged_types::PacketResult = serde_json::from_str(
        attempt
            .result_json
            .as_deref()
            .expect("completed result is stored"),
    )
    .expect("stored PacketResult");
    let forged_types::Outcome::Implement { gate_state, .. } = landed.outcome else {
        panic!("wrong landed outcome");
    };
    assert_eq!(gate_state.as_deref(), Some("pass"));
    ledger.close().expect("close ledger");
}

/// Two runs legitimately share one Work — a resubmission, a superseded
/// attempt, an epic child re-driven. The exact-hydrate contract requires one
/// row per requested id, so an undeduplicated projection failed the WHOLE
/// live read closed and reported every row as claim-unknown.
///
/// Unscoped on purpose: the `--repo` branch builds `bd list --id …`, which
/// never reaches the uniqueness guard, so a scoped fixture would be a green
/// test over an unfixed path.
#[test]
fn two_runs_sharing_one_work_still_resolve_one_exact_claim_batch() {
    let env = TestEnv::new("forged-operations-shared-bead");
    env.forged(&["init"]);
    let ledger = env.ledger();
    for run_id in ["dup-first", "dup-second"] {
        ledger
            .create_run(forged_ledger::NewRun {
                run_id: forged_types::RunId::new(run_id).expect("run id"),
                work_id: "bead-shared".to_owned(),
                repo: env.repos.repo.to_string_lossy().into_owned(),
                base_ref: env.repos.base.clone(),
                branch: format!("forged/{run_id}"),
            })
            .expect("create run");
    }
    ledger.close().expect("close ledger");
    env.set_work_field("bead-shared", "title", "Shared by two runs");
    env.set_work_field("bead-shared", "status", "open");
    env.set_work_field("plan-only", "title", "Never executed");
    env.set_work_field("plan-only", "status", "open");

    let (code, response) = env.forged(&["operations", "overview", "--detail", "full"]);
    assert_eq!(code, 0, "operations overview: {response}");
    assert_eq!(
        response["result"]["sourceHealth"]["beads"]["state"],
        json!("available"),
        "a repeated bead id cannot fail the whole live read closed: {response}"
    );
    let rows = entries(&response);
    for id in ["dup-first", "dup-second"] {
        assert_eq!(
            rows[id]["claimHealth"]["known"],
            json!(true),
            "{id} joins the live claim read: {response}"
        );
    }
    for (id, row) in &rows {
        assert!(
            !row["blocker"]
                .as_str()
                .unwrap_or_default()
                .contains("Beads unavailable"),
            "{id} carries no outage blocker: {row}"
        );
    }

    // The exact-batch dedup now lives in `Ledger::work_items`; assert it
    // where it is observable — one plan row per work, not two.
    assert_eq!(
        rows.values()
            .filter(|row| row["beadId"] == json!("bead-shared"))
            .count(),
        2,
        "two runs, one shared bead, no duplicated plan row: {response}"
    );
}

/// A durable identity that froze titleless gains a live title BESIDE it —
/// never instead of it. `title` and `identity.displayTitle` remain launch
/// evidence a later rename cannot rewrite.
#[test]
fn a_titleless_frozen_identity_gains_a_live_title_without_rewriting_launch_evidence() {
    let env = TestEnv::new("forged-operations-title-source");
    env.forged(&["init"]);
    fabricate_run(&env, "titleless");
    env.set_work_field("bead-titleless", "title", "Repair the bead read");
    env.set_work_field("bead-titleless", "status", "closed");

    let (code, response) = env.forged(&["operations", "overview", "--detail", "full"]);
    assert_eq!(code, 0, "operations overview: {response}");
    let rows = entries(&response);
    let row = &rows["titleless"];
    assert_eq!(row["identity"]["bead"]["title"], Value::Null, "{row}");
    assert_eq!(row["titleSource"]["source"], json!("beads.title"), "{row}");
    assert_eq!(row["titleSource"]["known"], json!(true), "{row}");
    assert_eq!(
        row["titleSource"]["beadId"],
        json!("bead-titleless"),
        "{row}"
    );
    assert!(
        row["titleSource"]["value"]
            .as_str()
            .expect("resolved title")
            .contains("Repair the bead read"),
        "{row}"
    );
    // The frozen pair is untouched, and a closed work is absent from plan
    // discovery — it carries a title only because the exact read repaired.
    assert_eq!(row["title"], row["identity"]["displayTitle"], "{row}");
    assert_eq!(
        row["identity"]["displayTitle"],
        json!(forged_types::work_display_title(
            "titleless",
            None,
            forged_types::repository_label(
                &forged_types::normalize_repository_path(&env.repos.repo.to_string_lossy())
                    .expect("canonical fixture repo")
            )
            .as_deref(),
            None,
            None,
        )),
        "{row}"
    );
}

/// Work Detail spends exactly one bounded read on its OWN work, and an epic
/// never stamps its title or its work id onto a child run's attention item.
///
/// `attention_subject` answers `(Run, <child run id>, ...)` for every run in
/// the snapshot, so an unconditional fill would contradict `subjectId` on the
/// same object.
#[test]
fn work_detail_titles_its_subject_and_never_titles_a_child_with_the_epic() {
    let env = TestEnv::new("forged-work-detail-title-source");
    env.forged(&["init"]);
    fabricate_epic(&env, "title-epic");
    fabricate_run(&env, "title-child");
    let repository = forged_types::normalize_repository_path(&env.repos.repo.to_string_lossy())
        .expect("canonical repository");
    let label = forged_types::repository_label(&repository).expect("repository label");
    // The child's identity froze titleless and names its epic, the exact
    // shape that made an unconditional fill stamp the epic onto the child.
    let display_title = forged_types::work_display_title(
        "title-child",
        None,
        Some(&label),
        None,
        Some(&forged_types::WorkIdentityContextV1 {
            id: "title-epic".to_owned(),
            title: Some("Epic title-epic".to_owned()),
        }),
    );
    let connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open fixture db");
    connection
        .execute(
            "DELETE FROM work_identities WHERE subject_kind = 'run' AND subject_id = 'title-child'",
            [],
        )
        .expect("remove legacy child identity");
    connection
        .execute(
            "INSERT INTO work_identities (
               schema, subject_kind, subject_id, bead_id, bead_title, bead_revision,
               repository_path, repository_label, project_id, project_title,
               epic_id, epic_title, display_title, captured_at, source
             ) VALUES ('forged.work-identity/1', 'run', 'title-child',
               'bead-title-child', NULL, NULL, ?1, ?2, NULL, NULL,
               'title-epic', 'Epic title-epic', ?3,
               '2026-08-14T12:00:00Z', 'durable')",
            rusqlite::params![repository, label, display_title],
        )
        .expect("insert epic child identity");
    drop(connection);
    let ledger = env.ledger();
    ledger
        .append_event(
            Some("title-epic"),
            "forged.epic.child.started",
            json!({"childId": "bead-title-child", "runId": "title-child"}),
        )
        .expect("child start");
    ledger
        .record_usage(forged_ledger::NewUsage {
            run_id: "title-child".to_owned(),
            packet_id: None,
            attempt_id: None,
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            input_tokens: 1,
            output_tokens: 1,
            cache_read_tokens: None,
            cache_write_tokens: None,
            cost_usd: None,
            pricing_basis: None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("unpriced child usage");
    ledger.close().expect("close ledger");
    env.set_work_field("title-epic", "title", "Epic bead title");
    env.set_work_field("bead-title-child", "title", "Child bead title");

    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "epic",
        "--subject-id",
        "title-epic",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "work detail: {response}");
    let detail = &response["result"];
    assert_eq!(
        detail["titleSource"]["beadId"],
        json!("title-epic"),
        "{detail}"
    );
    let items = detail["attention"].as_array().expect("attention items");
    let children = items
        .iter()
        .filter(|item| item["subjectId"] != json!("title-epic"))
        .collect::<Vec<_>>();
    assert!(
        !children.is_empty(),
        "the fixture opens a child-run condition: {detail}"
    );
    for item in children {
        assert_eq!(item["subjectId"], json!("title-child"), "{item}");
        // A field named subjectTitle must not contradict subjectId on the
        // same object: the child answers from its OWN frozen identity.
        assert_eq!(
            item["subjectTitle"]["beadId"],
            json!("bead-title-child"),
            "{item}"
        );
        assert_ne!(
            item["subjectTitle"]["beadId"],
            json!("title-epic"),
            "{item}"
        );
        assert_ne!(
            item["subjectTitle"]["value"], detail["titleSource"]["value"],
            "{item}"
        );
    }

    // The success path must prove the bounded read reached the work store with the
    // live value: a wrong id or a never-matching join would leave every
    // call-count assertion green while the spent 0->1 budget buys nothing.
    let (code, live) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "title-child",
        "--detail",
        "full",
    ]);
    assert_eq!(code, 0, "work detail: {live}");
    assert_eq!(
        live["result"]["titleSource"]["source"],
        json!("beads.title"),
        "{live}"
    );
    assert_eq!(
        live["result"]["titleSource"]["known"],
        json!(true),
        "{live}"
    );
    assert!(
        live["result"]["titleSource"]["value"]
            .as_str()
            .expect("live title value")
            .contains("Child bead title"),
        "{live}"
    );

    // The fail-soft outage degradation retired with the subprocess: the
    // in-process store always answers, and the live-title half above is the
    // proof the read reached it.
}
