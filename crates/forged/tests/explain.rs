//! Kind-blind reconnect explanation: exact namespace precedence, centralized
//! health, bounded lifecycle identity, and the existing typed next actions.

mod support;

use std::path::PathBuf;

use serde_json::{json, Value};
use support::{fabricate_epic, fabricate_run, TestEnv};

fn result(response: &Value) -> &Value {
    response
        .get("result")
        .unwrap_or_else(|| panic!("successful explain result: {response}"))
}

fn assert_next(response: &Value, verb: &str) {
    assert!(
        result(response)["next"]
            .as_array()
            .into_iter()
            .flatten()
            .any(|action| action["verb"] == json!(verb)),
        "expected next verb {verb:?}: {response}"
    );
}

fn seed_live_attempt(env: &TestEnv, run_id: &str) -> i64 {
    let packet_id = format!("{run_id}/implement/1");
    let ledger = env.ledger();
    let work_id = ledger.get_run(run_id).expect("owning run").work_id;
    let packet = forged_types::WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: packet_id.clone(),
        run_id: run_id.to_owned(),
        work_id,
        stage: forged_types::Stage::Implement,
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
            env: Default::default(),
        },
        field_notes: Vec::new(),
    };
    ledger
        .open_packet(forged_ledger::NewPacket {
            run_id: run_id.to_owned(),
            stage: forged_types::Stage::Implement,
            seq: 1,
            spec_path: packet.spec.path.clone(),
            spec_sha256: packet.spec.sha256.clone(),
            spec_revision: packet.spec.revision.clone(),
            policy_revision: None,
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open packet");
    let attempt = ledger
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
    attempt.attempt_id
}

#[test]
fn an_open_work_item_points_to_work_show_and_existing_work_actions() {
    let env = TestEnv::new("forged-explain-work");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_work_spec(
        "explain-work",
        "Implement the explain fixture.",
        "The work item remains open.",
    );

    let (code, response) = env.forged(&["explain", "--id", "explain-work"]);
    assert_eq!(code, 0, "explain work: {response}");
    assert_eq!(result(&response)["kind"], json!("work-item"));
    assert_eq!(result(&response)["how"]["verdict"], json!("not-started"));
    assert_eq!(
        result(&response)["what"]["show"],
        json!({"verb": "work show", "args": {"id": "explain-work"}})
    );
    assert_next(&response, "work update");
}

#[test]
fn closed_and_parked_epic_work_items_use_lifecycle_verdicts() {
    let env = TestEnv::new("forged-explain-work-lifecycle-verdicts");
    assert_eq!(env.forged(&["init"]).0, 0);
    for (id, status, verdict) in [
        ("explain-closed-epic", "closed", "closed"),
        ("explain-parked-epic", "deferred", "parked"),
    ] {
        env.set_work_field(id, "type", "epic");
        env.set_work_field(id, "status", status);
        let (code, response) = env.forged(&["explain", "--id", id]);
        assert_eq!(code, 0, "{id}: {response}");
        assert_eq!(result(&response)["kind"], json!("work-item"));
        assert_eq!(result(&response)["how"]["verdict"], json!(verdict));
    }
}

#[test]
fn landed_delivery_outranks_the_closed_work_verdict() {
    let env = TestEnv::new("forged-explain-landed-work-verdict");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "explain-landed-work";
    let work = "bead-explain-landed-work";
    env.set_work_field(work, "type", "epic");
    env.set_work_field(work, "status", "closed");
    fabricate_run(&env, run);
    let ledger = env.ledger();
    ledger
        .settle_run(
            run,
            forged_ledger::RunOutcome::Landed,
            "fixture delivery landed".to_owned(),
            Some(42),
            Some("a".repeat(40)),
            None,
        )
        .expect("settle landed fixture");
    ledger.close().expect("close ledger");

    let (code, response) = env.forged(&["explain", "--id", work]);
    assert_eq!(code, 0, "landed work explain: {response}");
    assert_eq!(result(&response)["how"]["verdict"], json!("landed"));
}

#[test]
fn a_running_latest_run_outranks_closed_and_parked_work_verdicts() {
    let env = TestEnv::new("forged-explain-running-work-verdict");
    assert_eq!(env.forged(&["init"]).0, 0);
    for (run, status) in [
        ("explain-running-closed", "closed"),
        ("explain-running-parked", "deferred"),
    ] {
        fabricate_run(&env, run);
        let work = format!("bead-{run}");
        env.set_work_field(&work, "status", status);
        let (code, response) = env.forged(&["explain", "--id", &work]);
        assert_eq!(code, 0, "{run}: {response}");
        assert_eq!(result(&response)["how"]["verdict"], json!("running"));
    }
}

#[test]
fn an_exact_work_item_outranks_its_same_named_run_and_names_that_run() {
    let env = TestEnv::new("forged-explain-work-run-alias");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.ensure_work_item("same-id");
    let ledger = env.ledger();
    ledger
        .create_run(forged_ledger::NewRun {
            run_id: forged_types::RunId::new("same-id").expect("run id"),
            work_id: "same-id".to_owned(),
            repo: env.repos.repo.to_string_lossy().into_owned(),
            base_ref: env.repos.base.clone(),
            branch: "forged/same-id".to_owned(),
        })
        .expect("create same-named run");
    ledger.close().expect("close ledger");

    let (code, response) = env.forged(&["explain", "--id", "same-id"]);
    assert_eq!(code, 0, "alias explain: {response}");
    assert_eq!(result(&response)["kind"], json!("work-item"));
    assert_eq!(result(&response)["what"]["runs"]["total"], json!(1));
    assert_eq!(
        result(&response)["what"]["runs"]["items"][0]["id"],
        json!("same-id")
    );
}

#[test]
fn a_stopped_run_uses_its_health_and_retry_first_action() {
    let env = TestEnv::new("forged-explain-run");
    assert_eq!(env.forged(&["init"]).0, 0);
    fabricate_run(&env, "explain-stopped");
    let ledger = env.ledger();
    ledger
        .settle_run(
            "explain-stopped",
            forged_ledger::RunOutcome::Cancelled,
            "fixture cancellation".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle fixture run");
    ledger.close().expect("close ledger");

    let (code, response) = env.forged(&["explain", "--id", "explain-stopped"]);
    assert_eq!(code, 0, "explain run: {response}");
    assert_eq!(result(&response)["kind"], json!("run"));
    assert_eq!(result(&response)["how"]["verdict"], json!("terminal"));
    assert_next(&response, "run retry");
}

#[test]
fn multiple_run_decisions_keep_one_should_and_order_it_first() {
    let env = TestEnv::new("forged-explain-run-decision-ranking");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "explain-ranked-run";
    fabricate_run(&env, run);
    let ledger = env.ledger();
    ledger
        .append_event(
            Some(run),
            "proto.quarantine",
            json!({"packetId": format!("{run}/implement/0"), "attemptId": 7, "reason": "fixture fence"}),
        )
        .expect("quarantine decision");
    ledger
        .record_usage(forged_ledger::NewUsage {
            run_id: run.to_owned(),
            packet_id: Some(format!("{run}/implement/0")),
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
        .expect("missing-cost decision");
    ledger.close().expect("close ledger");

    let (code, response) = env.forged(&["explain", "--id", run]);
    assert_eq!(code, 0, "explain ranked run: {response}");
    let next = result(&response)["next"].as_array().expect("next actions");
    assert_eq!(next[0]["class"], json!("should"), "{response}");
    assert_eq!(
        next.iter()
            .filter(|action| action["class"] == json!("should"))
            .count(),
        1,
        "{response}"
    );
    let decision_classes = next
        .iter()
        .filter(|action| action["verb"] == json!("attention resolve"))
        .map(|action| action["class"].clone())
        .collect::<Vec<_>>();
    assert_eq!(
        decision_classes,
        [json!("should"), json!("can")],
        "{response}"
    );
}

#[test]
fn an_epic_prefix_keeps_existing_prefix_semantics_and_attention_actions() {
    let env = TestEnv::new("forged-explain-epic");
    assert_eq!(env.forged(&["init"]).0, 0);
    fabricate_epic(&env, "explain-epic-full");
    env.set_work_field("explain-epic-full", "status", "blocked");

    // The exact work item has normative precedence. A unique durable prefix
    // still selects the epic through the existing resolver.
    let (code, response) = env.forged(&["explain", "--id", "explain-epic-f"]);
    assert_eq!(code, 0, "explain epic: {response}");
    assert_eq!(result(&response)["kind"], json!("epic"));
    assert!(result(&response)["how"]["verdict"].is_string());
    assert_next(&response, "work reopen");
}

#[test]
fn a_live_attempt_carries_own_state_stage_and_owning_run_actions() {
    let env = TestEnv::new("forged-explain-attempt");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_work_spec(
        "explain-attempt-run",
        "Explain a live attempt.",
        "The attempt retains its run's starting revision.",
    );
    env.seed_frontier("explain-attempt-run");
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "explain-attempt-run",
        "--repo",
        &repository,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    let started_revision = env.work_revision("explain-attempt-run");
    let attempt_id = seed_live_attempt(&env, "explain-attempt-run");

    let (code, response) = env.forged(&["explain", "--id", &attempt_id.to_string()]);
    assert_eq!(code, 0, "explain attempt: {response}");
    assert_eq!(result(&response)["kind"], json!("attempt"));
    assert_eq!(result(&response)["how"]["verdict"], json!("running"));
    assert_eq!(
        result(&response)["how"]["attempt"],
        json!({"state": "running", "stage": "implement"})
    );
    assert_eq!(
        result(&response)["subject"]["revision"],
        json!(started_revision),
        "the attempt subject uses its owning run's started-from revision"
    );
    assert_next(&response, "run stop");

    let attempt_id = attempt_id.to_string();
    for command in [
        vec!["overview", "--id", &attempt_id],
        vec!["work", "detail", "--id", &attempt_id],
        vec!["events", "--id", &attempt_id],
        vec!["session", "list", "--id", &attempt_id],
    ] {
        let (code, routed) = env.forged(&command);
        assert_eq!(code, 0, "attempt-routed {}: {routed}", command.join(" "));
        assert_eq!(
            routed["result"]["subject"]["id"],
            json!("explain-attempt-run")
        );
        assert_eq!(
            routed["result"]["subject"]["revision"],
            json!(started_revision),
            "{} routes through the owning run's frozen revision",
            command.join(" ")
        );
    }
}

#[test]
fn an_attention_id_carries_subject_health_and_its_mapped_action() {
    let env = TestEnv::new("forged-explain-attention");
    assert_eq!(env.forged(&["init"]).0, 0);
    fabricate_run(&env, "explain-attention-run");
    env.set_work_field("bead-explain-attention-run", "status", "blocked");
    let ledger = env.ledger();
    ledger
        .settle_run(
            "explain-attention-run",
            forged_ledger::RunOutcome::Blocked,
            "fixture blocker".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle blocked run");
    ledger.close().expect("close ledger");
    let (code, listed) = env.forged(&["attention", "list"]);
    assert_eq!(code, 0, "attention list: {listed}");
    let item = listed["result"]["groups"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|group| group["items"].as_array().into_iter().flatten())
        .find(|item| item["subjectId"] == json!("explain-attention-run"))
        .unwrap_or_else(|| panic!("blocked attention item: {listed}"));
    let attention_id = item["attentionId"].as_str().expect("attention id");

    let (code, response) = env.forged(&["explain", "--id", attention_id]);
    assert_eq!(code, 0, "explain attention: {response}");
    assert_eq!(result(&response)["kind"], json!("attention"));
    assert_eq!(result(&response)["how"]["verdict"], json!("terminal"));
    assert_eq!(
        result(&response)["how"]["attention"]["condition"],
        json!("blocked")
    );
    assert_next(&response, "work reopen");

    for command in [
        vec!["overview", "--id", attention_id],
        vec!["work", "detail", "--id", attention_id],
        vec!["events", "--id", attention_id],
        vec!["session", "list", "--id", attention_id],
    ] {
        let (code, routed) = env.forged(&command);
        assert_eq!(code, 0, "attention-routed {}: {routed}", command.join(" "));
        assert_eq!(
            routed["result"]["subject"]["id"],
            json!("explain-attention-run")
        );
    }
}

#[test]
fn an_unknown_id_is_the_existing_successful_unresolved_shape() {
    let env = TestEnv::new("forged-explain-unknown");
    assert_eq!(env.forged(&["init"]).0, 0);
    fabricate_run(&env, "known-run");

    let (code, response) = env.forged(&["explain", "--id", "unknown-id"]);
    assert_eq!(code, 0, "unknown explain: {response}");
    assert_eq!(
        result(&response),
        &json!({
            "schema": "forged.explain/1",
            "resolution": {
                "query": "unknown-id",
                "reason": "unknown",
                "candidates": [],
                "remedy": {
                    "schema": "forged.remedy/1",
                    "verb": "explain",
                    "args": {"id": "unknown-id"},
                    "reason": "inspect this id with explain --id",
                },
            },
        })
    );
}
