//! Read-only epic preflight: the rehearsal reports exactly what the start
//! enforces, surfaces the identity tuple a start would freeze, and creates
//! nothing durable.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

fn check<'v>(result: &'v Value, name: &str) -> &'v Value {
    result["checks"]
        .as_array()
        .and_then(|checks| checks.iter().find(|check| check["name"] == json!(name)))
        .unwrap_or_else(|| panic!("check {name:?} is present: {result}"))
}

fn assert_nothing_durable(env: &TestEnv, epic: &str) {
    let ledger = env.ledger();
    let events = ledger.list_events(Some(epic), 0, 100).expect("events");
    assert!(events.is_empty(), "preflight appended events: {events:?}");
    ledger.close().expect("close");
}

#[test]
fn preflight_previews_exactly_what_start_freezes_and_creates_nothing() {
    let env = TestEnv::new("forged-epic-preflight-good");
    env.seed_epic("epic-pf", &[("child-pf", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();

    let (code, preflight) =
        env.forged(&["epic", "preflight", "--epic", "epic-pf", "--repo", &repo]);
    assert_eq!(code, 0, "{preflight}");
    let result = preflight["result"].clone();
    assert_eq!(result["ok"], json!(true), "{preflight}");
    assert_eq!(result["identities"]["assuranceStage"], json!("none"));
    assert_eq!(
        result["identities"]["integrationBranch"],
        json!("forged/epic-epic-pf")
    );
    assert_eq!(
        result["identities"]["children"][0]["runId"],
        json!("child-pf")
    );
    assert_eq!(
        result["identities"]["children"][0]["branch"],
        json!("forged/child-pf")
    );
    assert_nothing_durable(&env, "epic-pf");

    // The start freezes exactly the previewed identities.
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic", "start", "--epic", "epic-pf", "--repo", &repo, "--spec", &spec,
    ]);
    assert_eq!(code, 0, "{started}");
    assert_eq!(
        started["result"]["integrationBranch"],
        result["identities"]["integrationBranch"]
    );
    assert_eq!(
        started["result"]["baseRef"],
        result["identities"]["baseRef"]
    );
    assert_eq!(
        started["result"]["children"][0]["id"],
        result["identities"]["children"][0]["id"]
    );
}

#[test]
fn preflight_names_a_bad_base_ref_without_creating_state() {
    let env = TestEnv::new("forged-epic-preflight-base");
    env.seed_epic("epic-pfb", &[("child-pfb", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, preflight) = env.forged(&[
        "epic",
        "preflight",
        "--epic",
        "epic-pfb",
        "--repo",
        &repo,
        "--base-ref",
        "nonexistent-branch",
    ]);
    assert_eq!(code, 0, "{preflight}");
    let result = &preflight["result"];
    assert_eq!(result["ok"], json!(false), "{preflight}");
    let base = check(result, "base-ref");
    assert_eq!(base["ok"], json!(false), "{preflight}");
    assert!(
        base["detail"]
            .as_str()
            .is_some_and(|detail| detail.contains("origin")),
        "{preflight}"
    );
    assert_nothing_durable(&env, "epic-pfb");
}

#[test]
fn preflight_names_a_missing_repository_and_unknown_profile() {
    let env = TestEnv::new("forged-epic-preflight-repo");
    env.seed_epic("epic-pfr", &[("child-pfr", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let (code, preflight) = env.forged(&[
        "epic",
        "preflight",
        "--epic",
        "epic-pfr",
        "--repo",
        "/nonexistent/forged-preflight-repo",
        "--profile",
        "nonexistent-profile",
    ]);
    assert_eq!(code, 0, "{preflight}");
    let result = &preflight["result"];
    assert_eq!(result["ok"], json!(false), "{preflight}");
    assert_eq!(
        check(result, "repository")["ok"],
        json!(false),
        "{preflight}"
    );
    assert_eq!(
        check(result, "definition")["ok"],
        json!(false),
        "{preflight}"
    );
    // The report keeps going past failures: the work checks still ran.
    assert_eq!(check(result, "epic-bead")["ok"], json!(true), "{preflight}");
    assert_nothing_durable(&env, "epic-pfr");
}

/// The admission contract, front-run: a child whose repository metadata
/// differs from the target can never admit, so preflight fails the
/// children check instead of passing an undispatchable inventory.
#[test]
fn preflight_names_a_child_assigned_to_another_repository() {
    let env = TestEnv::new("forged-epic-preflight-repo-mismatch");
    env.seed_epic("epic-pfr", &[("child-pfr", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    env.set_work_repository("child-pfr", "/somewhere/else");
    let repo = env.repos.repo.to_string_lossy().into_owned();

    let (code, preflight) =
        env.forged(&["epic", "preflight", "--epic", "epic-pfr", "--repo", &repo]);
    assert_eq!(code, 0, "{preflight}");
    let result = preflight["result"].clone();
    assert_eq!(result["ok"], json!(false), "{preflight}");
    let children = check(&result, "children");
    assert_eq!(children["ok"], json!(false), "{children}");
    let detail = children["detail"].as_str().expect("detail");
    assert!(detail.contains("child-pfr"), "{detail}");
    assert!(detail.contains("/somewhere/else"), "{detail}");
    assert_nothing_durable(&env, "epic-pfr");
}

/// A no-diff child never launches a run — the scheduler raises the
/// `non-code-child` hold instead — so its identity row advertises no run,
/// branch, or worktree.
#[test]
fn preflight_reports_no_run_identity_for_a_no_diff_child() {
    let env = TestEnv::new("forged-epic-preflight-no-diff");
    env.seed_epic(
        "epic-pfn",
        &[
            ("child-code", &env.spec, true),
            ("child-chore", &env.spec, true),
        ],
    );
    env.set_work_field("child-chore", "type", "chore");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();

    let (code, preflight) =
        env.forged(&["epic", "preflight", "--epic", "epic-pfn", "--repo", &repo]);
    assert_eq!(code, 0, "{preflight}");
    let result = preflight["result"].clone();
    assert_eq!(result["ok"], json!(true), "{preflight}");
    let children = result["identities"]["children"]
        .as_array()
        .expect("children identities")
        .clone();
    let identity = |id: &str| {
        children
            .iter()
            .find(|child| child["id"] == json!(id))
            .cloned()
            .unwrap_or_else(|| panic!("identity for {id}: {result}"))
    };
    let chore = identity("child-chore");
    assert_eq!(chore["noDiff"], json!(true), "{chore}");
    assert!(chore["runId"].is_null(), "{chore}");
    assert!(chore["branch"].is_null(), "{chore}");
    assert!(chore["worktreePath"].is_null(), "{chore}");
    let code_child = identity("child-code");
    assert_eq!(code_child["noDiff"], json!(false), "{code_child}");
    assert_eq!(code_child["runId"], json!("child-code"), "{code_child}");
    assert_nothing_durable(&env, "epic-pfn");
}
