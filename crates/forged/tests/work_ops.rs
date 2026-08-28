//! The typed work authoring/repair surface and the epic abandon epoch
//! boundary, end to end through the real binary.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

fn result(env: &TestEnv, args: &[&str]) -> Value {
    let (code, envelope) = env.forged(args);
    assert_eq!(code, 0, "{args:?}: {envelope}");
    envelope["result"].clone()
}

#[test]
fn authoring_and_repair_verbs_cover_the_lifecycle() {
    let env = TestEnv::new("forged-work-ops");
    assert_eq!(env.forged(&["init"]).0, 0);

    // Create, with spec fields and a repository scope.
    let created = result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "ops-slice",
            "--title",
            "Ops slice",
            "--description",
            "## Context\n\nthe typed surface works",
            "--acceptance=- created, updated, repaired",
            "--priority",
            "1",
            "--repository",
            "/tmp/ops-repo",
        ],
    );
    assert_eq!(created["work"]["revision"], json!(1));
    assert_eq!(created["work"]["status"], json!("open"));

    // Guarded update: wrong revision refuses, right revision mints 2.
    let (code, stale) = env.forged(&[
        "work",
        "update",
        "--id",
        "ops-slice",
        "--expected-revision",
        "9",
        "--title",
        "never lands",
    ]);
    assert_ne!(code, 0, "stale CAS must refuse: {stale}");
    assert_eq!(stale["error"]["code"], json!("BEADS_CONTENTION"));
    let updated = result(
        &env,
        &[
            "work",
            "update",
            "--id",
            "ops-slice",
            "--expected-revision",
            "1",
            "--title",
            "Ops slice v2",
        ],
    );
    assert_eq!(updated["work"]["revision"], json!(2));
    assert_eq!(updated["work"]["spec"]["title"], json!("Ops slice v2"));
    assert_eq!(
        updated["work"]["spec"]["acceptanceCriteria"],
        json!("- created, updated, repaired"),
        "omitted fields keep their bytes"
    );

    // Revert restores revision 1's bytes as revision 3.
    let reverted = result(
        &env,
        &[
            "work",
            "revert",
            "--id",
            "ops-slice",
            "--expected-revision",
            "2",
            "--to-revision",
            "1",
        ],
    );
    assert_eq!(reverted["work"]["revision"], json!(3));
    assert_eq!(reverted["work"]["spec"]["title"], json!("Ops slice"));

    // Link a blocker; the frontier obeys it; closing the blocker frees it.
    result(
        &env,
        &["work", "create", "--id", "ops-gate", "--title", "Gate"],
    );
    result(
        &env,
        &["work", "link", "--from", "ops-slice", "--to", "ops-gate"],
    );
    let ready = result(&env, &["work", "ready"]);
    let ids: Vec<&str> = ready["ready"]
        .as_array()
        .expect("ready")
        .iter()
        .filter_map(|item| item["workId"].as_str())
        .collect();
    assert!(
        ids.contains(&"ops-gate") && !ids.contains(&"ops-slice"),
        "{ids:?}"
    );
    result(
        &env,
        &[
            "work",
            "close",
            "--id",
            "ops-gate",
            "--reason",
            "gate landed",
        ],
    );
    let ready = result(&env, &["work", "ready"]);
    assert!(
        ready["ready"]
            .as_array()
            .expect("ready")
            .iter()
            .any(|item| item["workId"] == json!("ops-slice")),
        "{ready}"
    );

    // show carries dependencies; supersede closes and links atomically.
    let shown = result(&env, &["work", "show", "--id", "ops-slice"]);
    assert_eq!(shown["dependencies"][0]["id"], json!("ops-gate"));
    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "ops-slice-v2",
            "--title",
            "Ops slice, reborn",
        ],
    );
    let superseded = result(
        &env,
        &[
            "work",
            "supersede",
            "--id",
            "ops-slice",
            "--successor",
            "ops-slice-v2",
        ],
    );
    assert_eq!(superseded["work"]["status"], json!("closed"));
    let successor = result(&env, &["work", "show", "--id", "ops-slice-v2"]);
    assert!(
        successor["dependencies"]
            .as_array()
            .expect("deps")
            .iter()
            .any(|dep| dep["id"] == json!("ops-slice") && dep["kind"] == json!("supersedes")),
        "{successor}"
    );

    // Reopen is the deliberate exit from closed.
    let reopened = result(&env, &["work", "reopen", "--id", "ops-slice"]);
    assert_eq!(reopened["work"]["status"], json!("open"));

    // Release: custody residue clears under the actor CAS.
    env.set_assignee("ops-slice", "forged:ops-slice:0");
    let (code, foreign) = env.forged(&["work", "release", "--id", "ops-slice", "--actor", "thief"]);
    assert_ne!(code, 0, "a foreign actor refuses: {foreign}");
    let released = result(
        &env,
        &[
            "work",
            "release",
            "--id",
            "ops-slice",
            "--actor",
            "forged:ops-slice:0",
        ],
    );
    assert_eq!(released["work"]["assignee"], Value::Null);
}

#[test]
fn abandoning_a_started_epic_opens_a_clean_epoch() {
    let env = TestEnv::new("forged-epic-abandon");
    env.enable_dynamic_gh();
    env.seed_epic("epic-doomed", &[("doomed-child", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-doomed",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "first start: {started}");

    // Abandoning an unstarted epic refuses.
    let (code, nothing) = env.forged(&[
        "epic",
        "abandon",
        "--epic",
        "epic-unstarted",
        "--reason",
        "nothing there",
    ]);
    assert_ne!(code, 0, "{nothing}");

    let abandoned = result(
        &env,
        &[
            "epic",
            "abandon",
            "--epic",
            "epic-doomed",
            "--reason",
            "the base ref was wrong; ending this epoch",
        ],
    );
    assert_eq!(abandoned["abandoned"], json!(true));

    // The epoch is over: status folds as never-started...
    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-doomed"]);
    assert_ne!(code, 0, "an abandoned epoch has no started state: {status}");

    // ...the inventory folds the boundary as stopped-with-reason...
    let listed = result(&env, &["work", "list"]);
    let entry = listed["runs"]
        .as_array()
        .expect("inventory")
        .iter()
        .find(|entry| entry["id"] == json!("epic-doomed"))
        .cloned()
        .expect("abandoned epic stays discoverable");
    assert_eq!(entry["state"], json!("stopped"), "{entry}");
    assert!(
        entry["stopReason"]
            .as_str()
            .is_some_and(|reason| reason.contains("base ref was wrong")),
        "{entry}"
    );

    // ...and a fresh start opens a clean epoch instead of replaying the old
    // one (the pxv rebuild-the-epic ritual, retired).
    let (code, restarted) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-doomed",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "fresh epoch start: {restarted}");
    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-doomed"]);
    assert_eq!(code, 0, "the new epoch projects: {status}");

    // ...and the fresh epoch's start supersedes the boundary in the
    // inventory fold.
    let listed = result(&env, &["work", "list"]);
    let entry = listed["runs"]
        .as_array()
        .expect("inventory")
        .iter()
        .find(|entry| entry["id"] == json!("epic-doomed"))
        .cloned()
        .expect("restarted epic listed");
    assert_eq!(entry["state"], json!("active"), "{entry}");

    // A second abandon derives a fresh key (the epoch counter), so it ends
    // the SECOND epoch rather than replaying the first abandon's response.
    let again = result(
        &env,
        &[
            "epic",
            "abandon",
            "--epic",
            "epic-doomed",
            "--reason",
            "ending the second epoch too",
        ],
    );
    assert_eq!(again["abandoned"], json!(true));
    let (code, _) = env.forged(&["epic", "status", "--epic", "epic-doomed"]);
    assert_ne!(code, 0, "the second epoch ended as well");
}

#[test]
fn the_supervise_pass_keeps_a_daily_snapshot() {
    let env = TestEnv::new("forged-snapshot");
    assert_eq!(env.forged(&["init"]).0, 0);
    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "{tick}");
    let backups: Vec<String> = std::fs::read_dir(env.anvil.join("backups"))
        .expect("backups dir")
        .filter_map(Result::ok)
        .filter_map(|entry| entry.file_name().into_string().ok())
        .collect();
    assert!(
        backups
            .iter()
            .any(|name| name.starts_with("state-daily-") && name.ends_with(".db")),
        "one daily snapshot exists: {backups:?}"
    );
    // A second pass the same day adds nothing.
    let (code, _) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0);
    let count = std::fs::read_dir(env.anvil.join("backups"))
        .expect("backups dir")
        .count();
    assert_eq!(count, backups.len(), "one snapshot per day");
}
