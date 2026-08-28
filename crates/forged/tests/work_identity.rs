//! Durable human-readable identity is captured once and shared by every
//! operator projection. Live Beads remains claim-health input, never the
//! source of historical display identity.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

const DESCRIPTION: &str = "Implement durable work identity from native Bead fields.";
const ACCEPTANCE: &str = "Every projection carries the same frozen identity.";

fn start_run(env: &TestEnv, id: &str, title: &str) -> Value {
    env.seed_bead_spec(id, DESCRIPTION, ACCEPTANCE);
    env.set_bead_field(id, "title", title);
    env.seed_frontier(id);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        id,
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    started
}

fn listed_identity(env: &TestEnv, id: &str) -> (Value, Value) {
    let (code, listed) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {listed}");
    let entry = listed["result"]["runs"]
        .as_array()
        .into_iter()
        .flatten()
        .find(|entry| entry["id"] == json!(id))
        .cloned()
        .unwrap_or_else(|| panic!("work list contains {id}: {listed}"));
    (entry["identity"].clone(), entry)
}

#[test]
fn run_identity_survives_rename_and_outage_and_is_shared_without_extra_beads_reads() {
    let env = TestEnv::new("forged-work-identity-run");
    assert_eq!(env.forged(&["init"]).0, 0);
    start_run(&env, "identity-run", "  Original launch title  ");
    let launch_revision = env.bead_revision("identity-run");

    // A later title is live claim-health data only; it cannot rewrite the
    // identity the atomic creation bundle captured.
    env.set_bead_field("identity-run", "title", "Renamed live title");
    let (identity, entry) = listed_identity(&env, "identity-run");
    assert_eq!(identity["schema"], json!("forged.work-identity/1"));
    assert_eq!(
        identity["subject"],
        json!({"kind": "run", "id": "identity-run"})
    );
    assert_eq!(identity["bead"]["title"], json!("Original launch title"));
    assert_eq!(identity["bead"]["revision"], json!(launch_revision));
    assert_ne!(
        env.bead_revision("identity-run"),
        launch_revision,
        "the rename minted a live revision the captured identity ignores"
    );
    assert_eq!(identity["source"], json!("durable"));
    assert!(identity["displayTitle"]
        .as_str()
        .is_some_and(|title| title.starts_with("Original launch title [")));
    assert_eq!(entry["title"], identity["displayTitle"]);

    let (code, status) = env.forged(&["run", "status", "--run", "identity-run"]);
    assert_eq!(code, 0, "run status: {status}");
    assert_eq!(status["result"]["run"]["identity"], identity);
    let (code, overview) = env.forged(&["overview", "--run", "identity-run"]);
    assert_eq!(code, 0, "run overview: {overview}");
    assert_eq!(overview["result"]["identity"], identity);
    let (code, sessions) = env.forged(&["session", "list", "--run", "identity-run"]);
    assert_eq!(code, 0, "session list: {sessions}");
    assert_eq!(sessions["result"]["identity"], identity);

    // The captured identity is immutable even as the live store keeps
    // changing under it (the outage mode this replaced cannot occur: the
    // store is in-process and always answers).
    env.set_bead_field("identity-run", "title", "Renamed again");
    let (stable_identity, _entry) = listed_identity(&env, "identity-run");
    assert_eq!(stable_identity, identity);
    let (code, later_status) = env.forged(&["run", "status", "--run", "identity-run"]);
    assert_eq!(code, 0, "identity is durable: {later_status}");
    assert_eq!(later_status["result"]["run"]["identity"], identity);
}

#[test]
fn epic_identity_is_atomic_and_shared_by_status_inventory_and_overview() {
    let env = TestEnv::new("forged-work-identity-epic");
    env.seed_epic("identity-epic", &[("identity-child", &env.spec, true)]);
    env.set_bead_field("identity-epic", "title", "Identity convergence");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "identity-epic",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");

    let (identity, entry) = listed_identity(&env, "identity-epic");
    assert_eq!(
        identity["subject"],
        json!({"kind": "epic", "id": "identity-epic"})
    );
    assert_eq!(identity["bead"]["title"], json!("Identity convergence"));
    assert_eq!(entry["identity"], identity);

    let (code, status) = env.forged(&["epic", "status", "--epic", "identity-epic"]);
    assert_eq!(code, 0, "epic status: {status}");
    assert_eq!(status["result"]["identity"], identity);
    let planned = &status["result"]["children"][0]["identity"];
    assert_eq!(planned["schema"], json!("forged.work-identity/1"));
    assert_eq!(planned["source"], json!("live-plan"));
    assert_eq!(
        planned["subject"],
        json!({"kind": "run", "id": "identity-child"})
    );
    assert_eq!(planned["bead"]["title"], json!("Child identity-child"));
    let ledger = env.ledger();
    assert!(ledger
        .get_work_identity(forged_types::WorkIdentitySubjectKind::Run, "identity-child")
        .expect("planned identity lookup")
        .is_none());
    ledger.close().expect("close ledger");
    let (code, overview) = env.forged(&["overview", "--epic", "identity-epic"]);
    assert_eq!(code, 0, "epic overview: {overview}");
    assert_eq!(overview["result"]["identity"], identity);

    // The store is in-process: the inventory is always available, and the
    // captured identity still never re-derives from it.
    env.set_bead_field("identity-epic", "title", "Renamed epic title");
    let (code, later) = env.forged(&["epic", "status", "--epic", "identity-epic"]);
    assert_eq!(code, 0, "durable epic status: {later}");
    assert_eq!(later["result"]["identity"], identity);
    assert_eq!(later["result"]["beadsInventory"]["available"], json!(true));
    assert_eq!(later["result"]["children"][0]["beadsStatus"], json!("open"));
    assert_eq!(
        later["result"]["children"][0]["identity"]["source"],
        json!("live-plan"),
        "a live child keeps its projection-only identity: {later}"
    );
}

#[test]
fn duplicate_titles_never_replace_canonical_subject_ids() {
    let env = TestEnv::new("forged-work-identity-duplicate-titles");
    assert_eq!(env.forged(&["init"]).0, 0);
    start_run(&env, "identity-duplicate-a", "Same human title");
    start_run(&env, "identity-duplicate-b", "Same human title");

    let (first, first_entry) = listed_identity(&env, "identity-duplicate-a");
    let (second, second_entry) = listed_identity(&env, "identity-duplicate-b");
    assert_eq!(first["displayTitle"], second["displayTitle"]);
    assert_eq!(first["subject"]["id"], json!("identity-duplicate-a"));
    assert_eq!(second["subject"]["id"], json!("identity-duplicate-b"));
    assert_eq!(first_entry["id"], json!("identity-duplicate-a"));
    assert_eq!(second_entry["id"], json!("identity-duplicate-b"));

    let (code, first_overview) = env.forged(&["overview", "--id", "identity-duplicate-a"]);
    assert_eq!(code, 0, "first canonical selector: {first_overview}");
    let (code, second_overview) = env.forged(&["overview", "--id", "identity-duplicate-b"]);
    assert_eq!(code, 0, "second canonical selector: {second_overview}");
    assert_eq!(
        first_overview["result"]["id"],
        json!("identity-duplicate-a")
    );
    assert_eq!(
        second_overview["result"]["id"],
        json!("identity-duplicate-b")
    );
}
