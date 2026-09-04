//! The bounded `next` driver surface: routing, scoping, lifecycle evidence,
//! terminal policy, MCP parity, and the production-shaped payload budget.

mod support;

use std::collections::BTreeMap;
use std::path::PathBuf;

use forged_ledger::{
    NewPacket, NewUsage, NewWorkItem, NewWorkNote, RunOutcome, SpecFence, WorkDepKind, WorkKind,
    WorkNoteKind, WorkRevisionCause, WorkSpecFields, WorkStatus,
};
use forged_types::{
    Deliverable, ProviderHints, Sandbox, SpecRef, Stage, StageContract, WorkPacket,
};
use serde_json::{json, Value};
use support::operator_store::{
    operator_store_fixture, BLOCKED_SYMPTOM_TOTAL, DECISION_TOTAL, RECENT_LANDED_TOTAL,
    RUNNING_TOTAL, SUBJECT_TOTAL,
};
use support::{fabricate_run, McpClient, TestEnv};

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

fn seed_live_attempt(env: &TestEnv, run_id: &str, ordinal: usize) {
    let packet_id = format!("{run_id}/implement/0");
    let spec_sha = "a".repeat(64);
    let packet = WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: packet_id.clone(),
        run_id: run_id.to_owned(),
        work_id: format!("bead-{run_id}"),
        stage: Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: SpecRef {
            path: "beads://next-fixture".to_owned(),
            sha256: spec_sha.clone(),
            revision: None,
        },
        worktree: PathBuf::from("/unread/worktree"),
        branch: format!("forged/{run_id}"),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "fixture".to_owned(),
            gate_commands: Vec::new(),
            deliverable: Deliverable::CommitsInWorktree,
            budget_s: 60,
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: ProviderHints {
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            effort: None,
            sandbox: Sandbox::ReadOnly,
        },
        field_notes: Vec::new(),
    };
    let ledger = env.ledger();
    ledger
        .open_packet(NewPacket {
            run_id: run_id.to_owned(),
            stage: Stage::Implement,
            seq: 0,
            spec_path: packet.spec.path.clone(),
            spec_sha256: spec_sha.clone(),
            spec_revision: None,
            policy_revision: None,
            body_json: packet.stored_body().expect("stored fixture packet"),
        })
        .expect("open fixture packet");
    ledger
        .claim_packet(
            &packet_id,
            &format!("fixture-seat-{ordinal}"),
            &SpecFence::Sha256(spec_sha),
        )
        .expect("claim fixture packet");
    ledger.close().expect("close ledger");
}

fn record_spend(env: &TestEnv, run_id: &str, cost_usd: f64) {
    let ledger = env.ledger();
    ledger
        .record_usage(NewUsage {
            run_id: run_id.to_owned(),
            packet_id: None,
            attempt_id: None,
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            input_tokens: 10,
            output_tokens: 5,
            cache_read_tokens: Some(0),
            cache_write_tokens: Some(0),
            cost_usd: Some(cost_usd),
            pricing_basis: Some("billed".to_owned()),
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("record fixture spend");
    ledger.close().expect("close ledger");
}

fn seed_operator_store(env: &TestEnv) {
    let fixture = operator_store_fixture();
    for subject in &fixture.subjects {
        fabricate_run(env, &subject.id);
    }
    let ledger = env.ledger();
    for (index, subject) in fixture.subjects.iter().enumerate() {
        match index {
            0 | 1 => {}
            2..=4 => {
                ledger
                    .settle_run(
                        &subject.id,
                        RunOutcome::Landed,
                        "fixture landed".to_owned(),
                        Some(260 + index as u64),
                        Some("a".repeat(40)),
                        None,
                    )
                    .expect("settle landed fixture");
            }
            5..=51 => {
                ledger
                    .settle_run(
                        &subject.id,
                        RunOutcome::Blocked,
                        "fixture blocked".to_owned(),
                        None,
                        None,
                        None,
                    )
                    .expect("settle symptom fixture");
            }
            52..=61 => {
                ledger
                    .settle_run(
                        &subject.id,
                        RunOutcome::InputRequired,
                        "fixture input required".to_owned(),
                        None,
                        None,
                        None,
                    )
                    .expect("settle decision fixture");
            }
            _ => {
                ledger
                    .set_run_state(
                        &subject.id,
                        forged_ledger::RunState::Stopped,
                        Some("old fixture".to_owned()),
                    )
                    .expect("stop old fixture");
            }
        }
    }
    ledger.close().expect("close ledger");
    for (ordinal, subject) in fixture.subjects.iter().take(RUNNING_TOTAL).enumerate() {
        seed_live_attempt(env, &subject.id, ordinal);
    }
    record_spend(env, &fixture.subjects[0].id, 1.25);
    record_spend(env, &fixture.subjects[2].id, 0.75);
    record_spend(env, &fixture.subjects[52].id, 2.5);
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

    let mut mcp = McpClient::new(&env, None);
    let next_tool = mcp.tool("next");
    assert_eq!(next_tool.pointer("/_meta/audience"), Some(&json!("lead")));
    assert_eq!(
        next_tool.pointer("/annotations/readOnlyHint"),
        Some(&json!(true))
    );
    assert!(next_tool.pointer("/_meta/ui/resourceUri").is_none());
    let mut through_mcp = mcp.call_tool("next", json!({}));
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
    let env = TestEnv::new("forged-next-production-budget");
    assert_eq!(env.forged(&["init"]).0, 0);
    let fixture = operator_store_fixture();
    assert_eq!(fixture.subjects.len(), SUBJECT_TOTAL);
    seed_operator_store(&env);

    let (code, response) = env.forged(&["next"]);
    assert_eq!(code, 0, "production next: {response}");
    let result = &response["result"];
    let decisions = result["sections"]["decisions"].as_array().unwrap();
    assert!(!decisions.is_empty());
    assert_eq!(
        result["coverage"]["sections"]["decisions"]["total"],
        json!(DECISION_TOTAL)
    );
    assert_eq!(
        result["coverage"]["sections"]["running"]["total"],
        json!(RUNNING_TOTAL)
    );
    assert_eq!(
        result["coverage"]["sections"]["landed"]["total"],
        json!(RECENT_LANDED_TOTAL)
    );
    assert_eq!(result["hidden"]["symptoms"], json!(BLOCKED_SYMPTOM_TOTAL));
    assert_eq!(decisions[0]["spendUsd"], json!(2.5));
    assert!(decisions[0]["should"].is_object());
    assert_eq!(decisions[0]["canCount"], json!(1));
    assert!(decisions.iter().all(|row| row.get("next").is_none()));
    let bytes = serde_json::to_vec(&response).expect("serialize production response");
    assert!(
        bytes.len() <= 4096,
        "default next response is {} bytes: {}",
        bytes.len(),
        serde_json::to_string_pretty(&response).unwrap()
    );

    let (code, with_symptoms) = env.forged(&["next", "--symptoms"]);
    assert_eq!(code, 0, "next symptoms: {with_symptoms}");
    let shown_symptoms = with_symptoms["result"]["sections"]["symptoms"]
        .as_array()
        .unwrap()
        .len();
    let hidden_symptoms = with_symptoms["result"]["hidden"]["symptoms"]
        .as_u64()
        .unwrap() as usize;
    assert_eq!(shown_symptoms + hidden_symptoms, BLOCKED_SYMPTOM_TOTAL);

    let (code, expanded) = env.forged(&["next", "--section", "decisions", "--limit", "30"]);
    assert_eq!(code, 0, "expanded decisions: {expanded}");
    let expanded_result = &expanded["result"];
    let expanded_decisions = expanded_result["sections"]["decisions"].as_array().unwrap();
    assert_eq!(expanded_decisions.len(), DECISION_TOTAL);
    assert!(expanded_decisions.iter().all(|row| {
        row["next"]
            .as_array()
            .is_some_and(|actions| actions.len() == 2)
    }));
    let running = expanded_result["sections"]["running"].as_array().unwrap();
    let landed = expanded_result["sections"]["landed"].as_array().unwrap();
    assert_eq!(running.len(), RUNNING_TOTAL);
    assert_eq!(landed.len(), RECENT_LANDED_TOTAL);
    assert_eq!(running[0]["stage"], json!("implement"));
    assert_eq!(running[0]["seat"], json!("fixture-seat-0"));
    assert!(running[0]["ageMin"].is_u64());
    assert_eq!(running[0]["spendUsd"], json!(1.25));
    assert_eq!(landed[0]["pr"], json!(262));
    assert_eq!(landed[0]["spendUsd"], json!(0.75));
}

#[test]
fn epic_scope_hydrates_root_and_children_beyond_the_portfolio_cap() {
    let env = TestEnv::new("forged-next-exact-epic");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let ledger = env.ledger();
    for index in 0..501 {
        ledger
            .create_work_item(NewWorkItem {
                work_id: format!("earlier-{index:03}"),
                kind: WorkKind::Task,
                status: WorkStatus::Open,
                priority: Some(index),
                metadata: BTreeMap::from([("repository".to_owned(), repository.clone())]),
                spec: WorkSpecFields {
                    title: format!("Earlier item {index}"),
                    description: String::new(),
                    acceptance_criteria: String::new(),
                    design: String::new(),
                    notes: String::new(),
                },
                cause: WorkRevisionCause::Authored,
            })
            .expect("seed earlier work");
    }
    for (id, kind, priority) in [
        ("later-epic", WorkKind::Epic, 501),
        ("later-child", WorkKind::Task, 502),
    ] {
        ledger
            .create_work_item(NewWorkItem {
                work_id: id.to_owned(),
                kind,
                status: WorkStatus::Open,
                priority: Some(priority),
                metadata: BTreeMap::from([("repository".to_owned(), repository.clone())]),
                spec: WorkSpecFields {
                    title: id.to_owned(),
                    description: String::new(),
                    acceptance_criteria: String::new(),
                    design: String::new(),
                    notes: String::new(),
                },
                cause: WorkRevisionCause::Authored,
            })
            .expect("seed exact epic work");
    }
    ledger
        .add_work_dep("later-child", "later-epic", WorkDepKind::ParentChild)
        .expect("link exact epic child");
    ledger.close().expect("close ledger");

    let (code, response) = env.forged(&["next", "--id", "later-epic"]);
    assert_eq!(code, 0, "exact epic next: {response}");
    assert_eq!(response["result"]["scope"], json!({"epic": "later-epic"}));
    let ready = response["result"]["sections"]["ready"]
        .as_array()
        .expect("exact ready rows");
    let ids = ready
        .iter()
        .filter_map(|row| row["id"].as_str())
        .collect::<Vec<_>>();
    assert!(ids.contains(&"later-epic"), "{response}");
    assert!(ids.contains(&"later-child"), "{response}");
    assert_eq!(
        response["result"]["coverage"]["sections"]["ready"],
        json!({"shown": 2, "total": 2, "truncated": false})
    );
}
