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
    // The report keeps going past failures: the bead checks still ran.
    assert_eq!(check(result, "epic-bead")["ok"], json!(true), "{preflight}");
    assert_nothing_durable(&env, "epic-pfr");
}
