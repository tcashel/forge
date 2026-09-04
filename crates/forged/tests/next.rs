//! The bounded `next` driver surface: routing, scoping, lifecycle evidence,
//! terminal policy, MCP parity, and the production-shaped payload budget.

mod support;

use std::collections::BTreeMap;

use forged_ledger::{
    NewWorkItem, NewWorkNote, WorkKind, WorkNoteKind, WorkRevisionCause, WorkSpecFields, WorkStatus,
};
use serde_json::{json, Value};
use support::operator_store::{
    operator_store_fixture, FixtureLifecycle, ATTENTION_TOTAL, BLOCKED_SYMPTOM_TOTAL,
    DECISION_TOTAL, RECENT_LANDED_TOTAL, RUNNING_TOTAL, SUBJECT_TOTAL,
};
use support::{McpClient, TestEnv};

fn create_work(env: &TestEnv, id: &str, title: &str, notes: Option<&str>) {
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let mut args = vec![
        "work",
        "create",
        "--id",
        id,
        "--title",
        title,
        "--repository",
        &repository,
    ];
    if let Some(notes) = notes {
        args.extend(["--notes", notes]);
    }
    let (code, response) = env.forged(&args);
    assert_eq!(code, 0, "create {id}: {response}");
}

#[test]
fn next_is_the_bare_piped_default_and_cli_mcp_results_match() {
    let env = TestEnv::new("forged-next-routing");
    assert_eq!(env.forged(&["init"]).0, 0);

    let (code, explicit) = env.forged(&["next"]);
    assert_eq!(code, 0, "next: {explicit}");
    assert_eq!(explicit["result"]["schema"], json!("forged.next/1"));
    assert_eq!(explicit["result"]["scope"], json!({"portfolio": true}));
    assert_eq!(explicit["result"]["hidden"]["symptoms"], json!(0));

    let output = env.forged_cmd(&[]).output().expect("bare forged");
    assert!(output.status.success());
    let bare: Value = serde_json::from_slice(&output.stdout).expect("piped bare output is JSON");
    assert_eq!(bare["result"]["schema"], json!("forged.next/1"));
    assert_eq!(
        bare["result"]["scope"],
        json!({
            "repository": std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
                .join("../..")
                .canonicalize()
                .unwrap()
                .to_string_lossy()
        })
    );

    let mut mcp = McpClient::new(&env);
    let next_tool = mcp.tool("next");
    assert_eq!(next_tool.pointer("/_meta/audience"), Some(&json!("lead")));
    assert_eq!(
        next_tool.pointer("/annotations/readOnlyHint"),
        Some(&json!(true))
    );
    assert!(next_tool.pointer("/_meta/ui/resourceUri").is_none());
    let mut through_mcp = mcp.call_tool("next", json!({"params": {}}));
    let mut through_cli = explicit;
    through_mcp["result"]
        .as_object_mut()
        .unwrap()
        .remove("capturedAt");
    through_cli["result"]
        .as_object_mut()
        .unwrap()
        .remove("capturedAt");
    assert_eq!(through_mcp, through_cli, "CLI and MCP share one result");
}

#[test]
fn bare_forged_uses_the_canonical_current_repository() {
    let env = TestEnv::new("forged-next-bare-repo");
    assert_eq!(env.forged(&["init"]).0, 0);
    let mut command = env.forged_cmd(&[]);
    command.current_dir(&env.repos.repo);
    let output = command.output().expect("bare forged in repository");
    assert!(output.status.success());
    let response: Value = serde_json::from_slice(&output.stdout).expect("JSON envelope");
    assert_eq!(
        response["result"]["scope"]["repository"],
        json!(env.repos.repo.to_string_lossy())
    );
}

#[test]
fn ready_rows_derive_drafted_critiqued_and_held_from_stored_evidence() {
    let env = TestEnv::new("forged-next-ready-lifecycle");
    assert_eq!(env.forged(&["init"]).0, 0);
    create_work(
        &env,
        "ready-drafted",
        "A drafted item whose deliberately long title is shortened at sixty characters exactly",
        None,
    );
    create_work(&env, "ready-critiqued", "Critiqued item", None);
    create_work(
        &env,
        "ready-held",
        "Held item",
        Some("[ ] unresolved operator question"),
    );
    let ledger = env.ledger();
    ledger
        .add_work_note(NewWorkNote {
            work_id: "ready-critiqued".to_owned(),
            kind: WorkNoteKind::Recommendation,
            schema: "recommendation/0".to_owned(),
            actor: "critic".to_owned(),
            body_json: r#"{"verdict":"revise"}"#.to_owned(),
        })
        .expect("recommendation evidence");
    ledger.close().expect("close ledger");

    let repository = env.repos.repo.to_string_lossy().into_owned();
    let (code, response) = env.forged(&["next", "--repo", &repository]);
    assert_eq!(code, 0, "next: {response}");
    assert_eq!(
        response["result"]["scope"],
        json!({"repository": repository})
    );
    let rows = response["result"]["sections"]["ready"]
        .as_array()
        .expect("ready rows");
    let by_id = rows
        .iter()
        .map(|row| (row["id"].as_str().unwrap(), row))
        .collect::<BTreeMap<_, _>>();
    assert_eq!(by_id["ready-drafted"]["lifecycle"], json!("drafted"));
    assert_eq!(by_id["ready-critiqued"]["lifecycle"], json!("critiqued"));
    assert_eq!(by_id["ready-held"]["lifecycle"], json!("held"));
    for row in rows {
        assert!(row["title"].as_str().unwrap().chars().count() <= 60);
        assert_eq!(row["health"], json!("unsubmitted"));
        assert_eq!(row["spendUsd"], json!(0.0));
        assert_eq!(row["subject"]["revision"], json!(1));
        assert!(row["basis"]
            .as_str()
            .unwrap()
            .contains("adjudicated: unknown-until-.8"));
    }
}

#[test]
fn text_is_explicit_and_follow_refuses_off_tty() {
    let env = TestEnv::new("forged-next-terminal-policy");
    assert_eq!(env.forged(&["init"]).0, 0);
    let output = env
        .forged_cmd(&["next", "--text"])
        .output()
        .expect("forced text");
    assert!(output.status.success());
    let text = String::from_utf8(output.stdout).expect("UTF-8 text");
    assert!(text.starts_with("NEXT  portfolio"), "{text}");
    assert!(text.lines().all(|line| line.chars().count() <= 80));

    let (code, refusal) = env.forged(&["next", "--follow"]);
    assert_eq!(code, 1);
    assert_eq!(refusal["error"]["code"], json!("INVALID_REQUEST"));
    assert!(refusal["error"]["message"]
        .as_str()
        .unwrap()
        .contains("stdout to be a terminal"));
}

#[test]
fn default_cap_and_single_section_widening_are_explicit() {
    let env = TestEnv::new("forged-next-bounds");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let ledger = env.ledger();
    for index in 0..35 {
        ledger
            .create_work_item(NewWorkItem {
                work_id: format!("bounded-{index:02}"),
                kind: WorkKind::Task,
                status: WorkStatus::Open,
                priority: Some(index),
                metadata: BTreeMap::from([("repository".to_owned(), repository.clone())]),
                spec: WorkSpecFields {
                    title: format!("Bounded item {index:02}"),
                    description: String::new(),
                    acceptance_criteria: String::new(),
                    design: String::new(),
                    notes: String::new(),
                },
                cause: WorkRevisionCause::Authored,
            })
            .expect("seed ready work");
    }
    ledger.close().expect("close ledger");

    let (code, bounded) = env.forged(&["next", "--repo", &repository]);
    assert_eq!(code, 0, "bounded next: {bounded}");
    assert_eq!(
        bounded["result"]["sections"]["ready"]
            .as_array()
            .unwrap()
            .len(),
        30
    );
    assert_eq!(
        bounded["result"]["coverage"]["sections"]["ready"],
        json!({"shown": 30, "total": 35, "truncated": true})
    );

    let (code, widened) = env.forged(&[
        "next",
        "--repo",
        &repository,
        "--section",
        "ready",
        "--limit",
        "33",
    ]);
    assert_eq!(code, 0, "widened next: {widened}");
    assert_eq!(
        widened["result"]["sections"]["ready"]
            .as_array()
            .unwrap()
            .len(),
        33
    );
    assert_eq!(
        widened["result"]["coverage"]["sections"]["ready"],
        json!({"shown": 33, "total": 35, "truncated": true})
    );
}

#[test]
fn shared_operator_fixture_stays_under_the_default_four_kib_budget() {
    let fixture = operator_store_fixture();
    assert_eq!(fixture.subjects.len(), SUBJECT_TOTAL);
    assert_eq!(fixture.attention.len(), ATTENTION_TOTAL);
    let decisions = fixture
        .attention
        .iter()
        .filter(|attention| attention.decision)
        .map(|attention| compact_fixture_row(&attention.subject_id, "decision", "running"))
        .collect::<Vec<_>>();
    let running = fixture
        .subjects
        .iter()
        .filter(|subject| subject.lifecycle == FixtureLifecycle::Running)
        .map(|subject| compact_fixture_row(&subject.id, "implementation", "running"))
        .collect::<Vec<_>>();
    let landed = fixture
        .subjects
        .iter()
        .filter(|subject| subject.lifecycle == FixtureLifecycle::Landed)
        .map(|subject| compact_fixture_row(&subject.id, "landed", "landed"))
        .collect::<Vec<_>>();
    assert_eq!(decisions.len(), DECISION_TOTAL);
    assert_eq!(running.len(), RUNNING_TOTAL);
    assert_eq!(landed.len(), RECENT_LANDED_TOTAL);
    let result = json!({
        "schema": "forged.next/1",
        "capturedAt": fixture.captured_at,
        "scope": {"portfolio": true},
        "sections": {"decisions": decisions, "running": running, "ready": [], "landed": landed},
        "hidden": {"symptoms": BLOCKED_SYMPTOM_TOTAL, "parked": 0},
        "coverage": {
            "limit": 30, "shown": 15, "total": 15, "truncated": false,
            "sourceHealth": {"ledger": {"state": "available"}},
            "sections": {
                "decisions": {"shown": 10, "total": 10, "truncated": false},
                "running": {"shown": 2, "total": 2, "truncated": false},
                "ready": {"shown": 0, "total": 0, "truncated": false},
                "landed": {"shown": 3, "total": 3, "truncated": false}
            }
        }
    });
    let bytes = serde_json::to_vec(&result).expect("serialize fixture result");
    assert!(
        bytes.len() <= 4096,
        "default next result is {} bytes",
        bytes.len()
    );
}

fn compact_fixture_row(id: &str, state: &str, lifecycle: &str) -> Value {
    json!({
        "id": id,
        "kind": "run",
        "subject": {"revision": 1},
        "title": id,
        "state": state,
        "ageMin": 0,
        "spendUsd": 0.0,
        "should": null,
        "canCount": 0,
        "lifecycle": lifecycle,
        "health": if lifecycle == "landed" { "terminal" } else { "running" }
    })
}
