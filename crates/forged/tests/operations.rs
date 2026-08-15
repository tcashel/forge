//! The split operator surfaces: one bounded Operations inventory and one
//! exact Work Detail projection. Live-plan discovery remains a two-call,
//! read-only Beads join; durable rows survive a Beads outage unchanged.

mod support;

use std::collections::BTreeMap;

use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

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
    assert_eq!(calls.len(), 2, "one discovery plus one hydrate: {calls:?}");
    assert!(calls[0].starts_with("list --status open,in_progress,blocked,deferred"));
    assert!(calls[0].contains(&format!("--metadata-field repository={repository}")));
    assert!(calls[1].starts_with("show "));
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

    let (code, response) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "detail-a",
        "--limit",
        "25",
    ]);
    assert_eq!(code, 0, "work detail: {response}");
    assert_eq!(response["result"]["schema"], json!("forged.work-detail/1"));
    assert_eq!(
        response["result"]["workRef"],
        json!({"kind":"run","id":"detail-a"})
    );
    assert_eq!(response["result"]["id"], json!("detail-a"));

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
