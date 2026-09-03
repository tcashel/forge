mod support;

use forged_ledger::{
    DesiredReconcileOutcome, DesiredReconcileUpdate, DesiredRestartReservation, DesiredState,
    DesiredSubjectKind, EffectClass, RunOutcome,
};
use forged_types::{AttentionCondition, OperationRequest, Verdict};
use serde_json::{json, Value};
use support::operator_store::{
    operator_store_fixture, FixtureDecision, FixtureDecisionContext, COVERAGE_CONDITIONS,
    EXEMPT_CONDITIONS,
};
use support::{fabricate_run, TestEnv};

fn result(env: &TestEnv, args: &[&str]) -> Value {
    let (code, response) = env.forged(args);
    assert_eq!(code, 0, "{args:?}: {response}");
    response["result"].clone()
}

fn settle(env: &TestEnv, run: &str, outcome: RunOutcome) {
    let ledger = env.ledger();
    if outcome == RunOutcome::AcceptedRisk {
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
                RunOutcome::Blocked,
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
                    accepted_by: "coverage-operator".to_owned(),
                    rationale: "coverage fixture risk".to_owned(),
                    findings: Vec::new(),
                },
            )
            .expect("accept fixture risk");
    } else {
        ledger
            .settle_run(
                run,
                outcome,
                format!("coverage fixture {}", outcome.as_str()),
                None,
                None,
                None,
            )
            .expect("settle coverage fixture");
    }
    ledger.close().expect("close ledger");
}

fn append(env: &TestEnv, run: &str, kind: &str, payload: Value) {
    let ledger = env.ledger();
    ledger
        .append_event(Some(run), kind, payload)
        .expect("append coverage source");
    ledger.close().expect("close ledger");
}

fn condition_name(condition: AttentionCondition) -> String {
    serde_json::to_value(condition)
        .expect("closed attention condition serializes")
        .as_str()
        .expect("attention condition is a string")
        .to_owned()
}

fn attention_item<'a>(value: &'a Value, subject: &str, case: FixtureDecision) -> &'a Value {
    let condition = condition_name(case.condition);
    value["attention"]
        .as_array()
        .expect("attention array")
        .iter()
        .find(|item| item["id"] == json!(subject) && item["condition"] == json!(condition))
        .unwrap_or_else(|| panic!("missing {case:?} for {subject}: {value}"))
}

fn record_review_disagreement(env: &TestEnv, run: &str) {
    let ledger = env.ledger();
    for (stage, verdict) in [
        (forged_types::Stage::ReviewClaude, Verdict::Approve),
        (forged_types::Stage::ReviewCodex, Verdict::RequestChanges),
    ] {
        forged_proto::record(
            &ledger,
            run,
            forged_proto::ProtoEvent::Review {
                seq: 1,
                stage,
                verdict: Some(verdict),
                available: true,
            },
        )
        .expect("record divergent review");
    }
    ledger.close().expect("close ledger");
}

fn exhaust_restart_budget(env: &TestEnv, run: &str) {
    let work = format!("bead-{run}");
    env.seed_work_spec(
        &work,
        "Exercise the coverage decision registry.",
        "- the projected recovery is classified",
    );
    fabricate_run(env, run);
    env.authorize_run(run);

    let ledger = env.ledger();
    let restart_budget = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row")
        .restart_budget;
    for index in 0..=restart_budget {
        ledger
            .record_desired_outcome(
                DesiredSubjectKind::Run,
                run,
                DesiredState::Running,
                DesiredReconcileOutcome::Authorized,
                Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                None,
            )
            .expect("make desired row due");
        let token = format!("coverage-restart-{index}");
        let claimed = ledger
            .claim_desired_work(
                DesiredSubjectKind::Run,
                run,
                &token,
                "2099-01-01T00:00:00.000000000Z",
                "2099-01-01T00:01:00.000000000Z",
            )
            .expect("claim desired work")
            .expect("due desired row");
        match ledger
            .reserve_desired_restart(
                DesiredSubjectKind::Run,
                run,
                &token,
                claimed.controller_generation,
            )
            .expect("reserve restart")
        {
            DesiredRestartReservation::Reserved(reserved) => {
                assert!(index < restart_budget);
                ledger
                    .finish_desired_reconciliation(
                        DesiredSubjectKind::Run,
                        run,
                        &token,
                        DesiredReconcileUpdate {
                            desired_state: None,
                            outcome: DesiredReconcileOutcome::Backoff,
                            controller_generation: Some(reserved.controller_generation),
                            predecessor_generation: reserved.predecessor_generation,
                            next_wake_at: Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                            last_progress_at: None,
                            last_error: Some("fixture controller remained dead".to_owned()),
                            attention_condition: None,
                        },
                    )
                    .expect("finish desired reconciliation");
            }
            DesiredRestartReservation::Exhausted(exhausted) => {
                assert_eq!(index, restart_budget);
                assert!(exhausted.exhausted_at.is_some());
            }
        }
    }
    ledger.close().expect("close ledger");
    settle(env, run, RunOutcome::Cancelled);
}

fn provoke_decision(env: &TestEnv, subject: &str, case: FixtureDecision) {
    use AttentionCondition as Condition;
    use FixtureDecisionContext as Context;

    match (case.condition, case.context) {
        (Condition::InputRequired, Context::Ordinary) => {
            fabricate_run(env, subject);
            settle(env, subject, RunOutcome::InputRequired);
        }
        (Condition::RestartBudgetExhausted, Context::Ordinary) => {
            exhaust_restart_budget(env, subject);
        }
        (Condition::ReviewerDisagreement, context) => {
            fabricate_run(env, subject);
            record_review_disagreement(env, subject);
            if context == Context::ReviewBudgetExhausted {
                append(
                    env,
                    subject,
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
                );
                settle(env, subject, RunOutcome::Blocked);
            }
        }
        (Condition::Quarantined, Context::Ordinary) => {
            fabricate_run(env, subject);
            append(
                env,
                subject,
                "proto.quarantine",
                json!({"packetId": format!("{subject}/implement/0"), "attemptId": 7, "reason": "fixture fence"}),
            );
        }
        (Condition::MissingCost, Context::Ordinary) => {
            fabricate_run(env, subject);
            let ledger = env.ledger();
            ledger
                .record_usage(forged_ledger::NewUsage {
                    run_id: subject.to_owned(),
                    packet_id: Some(format!("{subject}/implement/0")),
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
                .expect("record unpriced usage");
            ledger.close().expect("close ledger");
        }
        (Condition::RetryExhausted, Context::Ordinary) => {
            fabricate_run(env, subject);
            append(
                env,
                subject,
                "run.protocol-terminal",
                json!({"schemaVersion": 1, "terminal": {"providerUnavailable": {"provider": "fixture"}}}),
            );
        }
        (Condition::AmbiguousEffect, Context::Ordinary) => {
            fabricate_run(env, subject);
            let request = OperationRequest {
                schema_version: 1,
                idempotency_key: format!("coverage-ambiguous-{subject}"),
                run_id: Some(subject.to_owned()),
                params: serde_json::Map::new(),
            };
            let ledger = env.ledger();
            ledger
                .begin_operation(
                    "coverage-effect",
                    &request,
                    EffectClass::HumanAmbiguous,
                    None,
                )
                .expect("record ambiguous effect");
            ledger.close().expect("close ledger");
        }
        (Condition::MergeApproval, Context::Ordinary) => {
            fabricate_run(env, subject);
            settle(env, subject, RunOutcome::Clean);
            append(
                env,
                subject,
                "proto.pr",
                json!({
                    "schemaVersion": 1,
                    "number": 42,
                    "isDraft": true,
                    "baseRefName": env.repos.base,
                    "url": "https://example.invalid/pr/42",
                }),
            );
        }
        (Condition::MissingEvidence, Context::Attemptless) => {
            fabricate_run(env, subject);
            settle(env, subject, RunOutcome::Clean);
        }
        _ => panic!("unproven fixture decision case: {case:?}"),
    }
}

fn should_actions(value: &Value) -> Vec<&Value> {
    value["run"]["nextActions"]
        .as_array()
        .expect("run actions")
        .iter()
        .filter(|action| action["class"] == json!("should"))
        .collect()
}

#[test]
fn parked_run_decisions_have_one_should_and_terminal_cancellation_has_none() {
    let env = TestEnv::new("forged-action-coverage");
    assert_eq!(env.forged(&["init"]).0, 0);

    for (run, outcome, expected) in [
        ("coverage-clean", RunOutcome::Clean, "run stop"),
        (
            "coverage-accepted-risk",
            RunOutcome::AcceptedRisk,
            "run stop",
        ),
        ("coverage-blocked", RunOutcome::Blocked, "work update"),
        (
            "coverage-input-required",
            RunOutcome::InputRequired,
            "work update",
        ),
    ] {
        fabricate_run(&env, run);
        settle(&env, run, outcome);
        let status = result(&env, &["run", "status", "--run", run]);
        let should = should_actions(&status);
        assert_eq!(should.len(), 1, "{run}: {status}");
        assert_eq!(should[0]["verb"], json!(expected), "{run}: {status}");
        assert!(status["run"]["nextActions"]
            .as_array()
            .expect("actions")
            .iter()
            .any(|action| action["verb"] == json!("run retry") && action["class"] == json!("can")));
    }

    fabricate_run(&env, "coverage-cancelled");
    settle(&env, "coverage-cancelled", RunOutcome::Cancelled);
    let cancelled = result(&env, &["run", "status", "--run", "coverage-cancelled"]);
    assert!(should_actions(&cancelled).is_empty(), "{cancelled}");
}

#[test]
fn coverage_and_exempt_registry_cases_reach_real_recommendation_actions() {
    let env = TestEnv::new("forged-action-coverage-registry");
    assert_eq!(env.forged(&["init"]).0, 0);

    let coverage_subjects = COVERAGE_CONDITIONS
        .iter()
        .copied()
        .enumerate()
        .map(|(index, case)| {
            let subject = format!("coverage-decision-{index}");
            provoke_decision(&env, &subject, case);
            (case, subject)
        })
        .collect::<Vec<_>>();
    let exempt_subjects = EXEMPT_CONDITIONS
        .iter()
        .copied()
        .enumerate()
        .map(|(index, case)| {
            let subject = format!("coverage-exempt-{index}");
            provoke_decision(&env, &subject, case);
            (case, subject)
        })
        .collect::<Vec<_>>();

    let projected = result(&env, &["overview"]);
    for (case, subject) in coverage_subjects {
        let item = attention_item(&projected, &subject, case);
        let should = item["nextActions"]
            .as_array()
            .expect("next actions")
            .iter()
            .filter(|action| action["class"] == json!("should"))
            .collect::<Vec<_>>();
        assert_eq!(should.len(), 1, "{case:?} for {subject}: {item}");
        let expected_verb = match (case.condition, case.context) {
            (AttentionCondition::InputRequired, _) => "work update",
            (AttentionCondition::RestartBudgetExhausted, _) => "run retry",
            (
                AttentionCondition::ReviewerDisagreement,
                FixtureDecisionContext::ReviewBudgetExhausted,
            ) => "run accept-risk",
            (AttentionCondition::ReviewerDisagreement, _) => "attention resolve",
            (AttentionCondition::Quarantined, _) => "attention resolve",
            (AttentionCondition::MissingCost, _) => "attention resolve",
            (AttentionCondition::RetryExhausted, _) => "run revise-roster",
            _ => panic!("coverage case lacks an expected action: {case:?}"),
        };
        assert_eq!(should[0]["verb"], json!(expected_verb), "{item}");
    }
    for (case, subject) in exempt_subjects {
        let item = attention_item(&projected, &subject, case);
        assert!(
            item["nextActions"]
                .as_array()
                .expect("next actions")
                .iter()
                .all(|action| action["class"] != json!("should")),
            "{case:?} for {subject}: {item}"
        );
        assert!(
            item["detail"]
                .as_str()
                .is_some_and(|detail| !detail.is_empty()),
            "an exempt decision still explains why it is parked: {item}"
        );
    }
}

#[test]
fn shared_operator_store_fixture_pins_shape_coverage_and_exempt_sets() {
    // The fixture generates its rows from the same constants that name its
    // totals, so a count assertion here cannot fail; only the enumerated
    // coverage and exempt sets below are a pin worth having. The budget
    // tests in .1 and .3 measure the generated store itself.
    let fixture = operator_store_fixture();
    assert!(!fixture.subjects.is_empty());
    assert!(fixture.attention.iter().any(|item| item.decision));

    assert_eq!(
        COVERAGE_CONDITIONS,
        [
            FixtureDecision {
                condition: AttentionCondition::InputRequired,
                context: FixtureDecisionContext::Ordinary,
            },
            FixtureDecision {
                condition: AttentionCondition::RestartBudgetExhausted,
                context: FixtureDecisionContext::Ordinary,
            },
            FixtureDecision {
                condition: AttentionCondition::ReviewerDisagreement,
                context: FixtureDecisionContext::ReviewBudgetExhausted,
            },
            FixtureDecision {
                condition: AttentionCondition::ReviewerDisagreement,
                context: FixtureDecisionContext::Ordinary,
            },
            FixtureDecision {
                condition: AttentionCondition::Quarantined,
                context: FixtureDecisionContext::Ordinary,
            },
            FixtureDecision {
                condition: AttentionCondition::MissingCost,
                context: FixtureDecisionContext::Ordinary,
            },
            FixtureDecision {
                condition: AttentionCondition::RetryExhausted,
                context: FixtureDecisionContext::Ordinary,
            },
        ]
    );
    assert_eq!(
        EXEMPT_CONDITIONS,
        [
            FixtureDecision {
                condition: AttentionCondition::AmbiguousEffect,
                context: FixtureDecisionContext::Ordinary,
            },
            FixtureDecision {
                condition: AttentionCondition::MergeApproval,
                context: FixtureDecisionContext::Ordinary,
            },
            FixtureDecision {
                condition: AttentionCondition::MissingEvidence,
                context: FixtureDecisionContext::Attemptless,
            },
        ]
    );
    assert!(fixture.attention.iter().any(|item| {
        item.condition == AttentionCondition::WorkSettlementPending && !item.decision
    }));
    assert_eq!(
        condition_name(AttentionCondition::WorkSettlementPending),
        "beads-settlement-pending"
    );
}

fn collect_actions<'a>(value: &'a Value, actions: &mut Vec<&'a Value>) {
    match value {
        Value::Array(values) => {
            for value in values {
                collect_actions(value, actions);
            }
        }
        Value::Object(map) => {
            if map.contains_key("verb") && map.contains_key("args") && map.contains_key("reason") {
                actions.push(value);
            }
            for value in map.values() {
                collect_actions(value, actions);
            }
        }
        _ => {}
    }
}

#[test]
fn every_action_surface_renders_class() {
    let env = TestEnv::new("forged-action-surface-class");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.set_work_field("bead-surface-class", "status", "blocked");
    fabricate_run(&env, "surface-class");
    settle(&env, "surface-class", RunOutcome::Blocked);

    for args in [
        vec!["work", "show", "--id", "bead-surface-class"],
        vec!["run", "status", "--run", "surface-class"],
        vec!["explain", "--id", "surface-class"],
        vec!["attention", "list"],
        vec!["operations", "overview"],
        vec!["work", "detail", "--id", "surface-class"],
    ] {
        let projected = result(&env, &args);
        let mut actions = Vec::new();
        collect_actions(&projected, &mut actions);
        assert!(!actions.is_empty(), "{args:?}: {projected}");
        for action in actions {
            assert!(
                matches!(action["class"].as_str(), Some("should" | "can" | "repair")),
                "{args:?}: {action}"
            );
        }
    }
}
