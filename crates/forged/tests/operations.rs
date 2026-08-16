//! The split operator surfaces: one bounded Operations inventory and one
//! exact Work Detail projection. Live-plan discovery remains a two-call,
//! read-only Beads join; durable rows survive a Beads outage unchanged.

mod support;

use std::collections::BTreeMap;
use std::path::PathBuf;

use serde_json::{json, Value};
use support::{fabricate_epic, fabricate_run, TestEnv};

fn entries(response: &Value) -> BTreeMap<String, Value> {
    response["result"]["queue"]["groups"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .filter_map(|entry| {
            entry["id"]
                .as_str()
                .map(|id| (id.to_owned(), entry.clone()))
        })
        .collect()
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
        bead_id: format!("bead-{run_id}"),
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
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open packet");
    ledger.close().expect("close ledger");
    packet_id
}

#[tokio::test]
async fn live_plan_discovery_reports_n_plus_one_coverage_and_hydrates_one_batch() {
    let env = TestEnv::new("forged-operations-plan-bound");
    for id in ["plan-a", "plan-b", "plan-c"] {
        env.set_bead_field(id, "status", "open");
        env.set_bead_field(id, "title", &format!("Plan {id}"));
    }
    let mut cfg = forged_beads::BdConfig::new(env.shim_bin.join("bd"), env.beads_dir.clone());
    cfg.home_override = Some(env.home.clone());
    cfg.anvil_home = env.anvil.clone();
    cfg.work_dir = env.beads_dir.clone();

    let inventory = forged_beads::plan_inventory(&cfg, None, 2)
        .await
        .expect("bounded live-plan inventory");
    assert_eq!(inventory.discovered, 3);
    assert!(inventory.truncated);
    assert_eq!(inventory.issues.len(), 2);

    let calls = env.bd_calls();
    assert_eq!(calls.len(), 2, "one discovery and one hydrate: {calls:?}");
    assert!(calls[0].contains("--limit 3 --max-rows 3"), "{calls:?}");
    assert!(
        calls[1].starts_with("show plan-a plan-b --brief-deps --json"),
        "{calls:?}"
    );
}

#[test]
fn malformed_hydration_fails_the_plan_source_closed_without_hiding_durable_work() {
    let env = TestEnv::new("forged-operations-malformed-plan");
    env.forged(&["init"]);
    fabricate_run(&env, "durable-safe");
    env.set_bead_field("plan-bad", "status", "open");
    env.set_bead_field("plan-bad", "title", "Malformed dependencies");
    env.set_bead_field("plan-bad", "dependencies", r#"{"not":"an array"}"#);

    let before = env.bd_calls().len();
    let (code, response) = env.forged(&["operations", "overview"]);
    assert_eq!(code, 0, "durable projection remains available: {response}");
    assert_eq!(
        response["result"]["sourceHealth"]["beads"]["state"],
        json!("available"),
        "the independent exact claim batch remains usable"
    );
    assert_eq!(
        response["result"]["sourceHealth"]["plan"]["state"],
        json!("unavailable")
    );
    let rows = entries(&response);
    assert!(rows.contains_key("durable-safe"), "{response}");
    assert!(!rows.contains_key("plan-bad"), "{response}");
    assert_eq!(
        env.bd_calls()[before..].len(),
        3,
        "one claim batch plus malformed plan discovery/hydration, never per-node retries"
    );
}

#[test]
fn operations_joins_one_bounded_live_plan_without_duplicate_durable_work() {
    let env = TestEnv::new("forged-operations-plan");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();

    fabricate_run(&env, "durable-a");
    env.set_bead_field("bead-durable-a", "title", "Already executing");
    env.set_bead_field("bead-durable-a", "status", "in_progress");
    env.set_bead_repository("bead-durable-a", &repository);

    env.set_bead_field("plan-a", "title", "Planned next slice");
    env.set_bead_field("plan-a", "status", "open");
    env.set_bead_field("plan-a", "priority", "1");
    env.set_bead_field("plan-a", "parent", "epic-a");
    env.set_bead_field(
        "plan-a",
        "dependencies",
        r#"[{"id":"foundation","dependency_type":"blocks","status":"closed"}]"#,
    );
    env.set_bead_repository("plan-a", &repository);

    env.set_bead_field("plan-other", "status", "open");
    env.set_bead_repository("plan-other", "/tmp/a-different-repository");
    env.set_bead_field("plan-closed", "status", "closed");
    env.set_bead_repository("plan-closed", &repository);

    let before = env.bd_calls().len();
    let (code, response) = env.forged(&[
        "operations",
        "overview",
        "--repo",
        &repository,
        "--limit",
        "50",
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
    assert_eq!(
        rows["plan-a"]["plan"]["dependencies"][0]["id"],
        json!("foundation")
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

    let calls = &env.bd_calls()[before..];
    assert_eq!(
        calls.len(),
        3,
        "one exact claim batch plus one discovery and one hydrate: {calls:?}"
    );
    let discovery = calls
        .iter()
        .find(|call| call.starts_with("list --status open,in_progress,blocked,deferred"))
        .expect("plan discovery call");
    assert!(discovery.contains(&format!("--metadata-field repository={repository}")));
    assert!(calls.iter().any(|call| call.starts_with("list --id ")));
    assert!(calls.iter().any(|call| call.starts_with("show ")));
    assert!(!calls
        .iter()
        .any(|call| call.starts_with("ready") || call.contains("graph")));
}

#[test]
fn operations_keeps_durable_truth_when_beads_is_unavailable() {
    let env = TestEnv::new("forged-operations-outage");
    env.forged(&["init"]);
    fabricate_run(&env, "durable-outage");
    env.set_bd_list_unreachable(true);
    env.set_bd_show_unreachable(true);

    let (code, response) = env.forged(&["operations", "overview"]);
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
        json!("unavailable")
    );
    assert_eq!(
        response["result"]["sourceHealth"]["plan"]["state"],
        json!("unavailable")
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
        vec!["operations", "overview", "--limit", "501"],
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
    env.set_bd_list_unreachable(true);
    let beads_before = env.bd_calls().len();

    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "detail-a",
        "--limit",
        "1",
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
    assert_eq!(
        env.bd_calls().len(),
        beads_before,
        "native detail performs no Beads read"
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

    let before = env.bd_calls().len();
    env.set_bd_list_unreachable(true);
    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "epic",
        "--subject-id",
        "detail-epic",
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
    assert_eq!(
        env.bd_calls().len(),
        before,
        "epic child capture performs no recursive Beads reads"
    );
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
    env.set_bd_list_unreachable(true);

    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "detail-many",
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
