mod support;

use forged_ledger::RunOutcome;
use serde_json::{json, Value};
use support::operator_store::{
    operator_store_fixture, FixtureLifecycle, ATTENTION_TOTAL, BLOCKED_SYMPTOM_TOTAL,
    COVERAGE_CONDITIONS, DECISION_TOTAL, EXEMPT_CONDITIONS, RECENT_LANDED_TOTAL, RUNNING_TOTAL,
    SUBJECT_TOTAL,
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
fn shared_operator_store_fixture_pins_shape_coverage_and_exempt_sets() {
    let fixture = operator_store_fixture();
    assert_eq!(fixture.subjects.len(), SUBJECT_TOTAL);
    assert_eq!(fixture.attention.len(), ATTENTION_TOTAL);
    assert_eq!(
        fixture
            .attention
            .iter()
            .filter(|item| item.condition == "blocked" && !item.decision)
            .count(),
        BLOCKED_SYMPTOM_TOTAL
    );
    assert_eq!(
        fixture
            .attention
            .iter()
            .filter(|item| item.decision)
            .count(),
        DECISION_TOTAL
    );
    assert_eq!(
        fixture
            .subjects
            .iter()
            .filter(|subject| subject.lifecycle == FixtureLifecycle::Running)
            .count(),
        RUNNING_TOTAL
    );
    assert_eq!(
        fixture
            .subjects
            .iter()
            .filter(|subject| subject.lifecycle == FixtureLifecycle::Landed)
            .count(),
        RECENT_LANDED_TOTAL
    );

    let decisions = fixture
        .attention
        .iter()
        .filter(|item| item.decision)
        .map(|item| item.condition)
        .collect::<Vec<_>>();
    let pinned = COVERAGE_CONDITIONS
        .iter()
        .chain(EXEMPT_CONDITIONS.iter())
        .copied()
        .collect::<Vec<_>>();
    assert_eq!(decisions, pinned);
    assert_eq!(
        COVERAGE_CONDITIONS,
        [
            "input-required",
            "restart-budget-exhausted",
            "review-budget-exhausted",
            "reviewer-disagreement",
            "quarantined",
            "missing-cost",
            "retry-exhausted",
        ]
    );
    assert_eq!(
        EXEMPT_CONDITIONS,
        [
            "ambiguous-effect",
            "merge-approval",
            "missing-evidence-attemptless",
        ]
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
