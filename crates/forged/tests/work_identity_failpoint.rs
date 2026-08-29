#![cfg(feature = "failpoints")]

//! Crash recovery for the atomic creation + identity bundles.

mod support;

use std::process::Stdio;

use serde_json::json;
use support::TestEnv;

#[test]
fn atomic_run_creation_replays_after_crash_without_work() {
    let env = TestEnv::new("km-work-identity-run-bundle");
    env.seed_work_spec(
        "identity-run-crash",
        "Capture the native Bead as durable identity.",
        "Creation is atomic and replayable.",
    );
    env.set_work_field("identity-run-crash", "title", "Frozen run identity");
    env.seed_frontier("identity-run-crash");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let args = [
        "run",
        "start",
        "--work",
        "identity-run-crash",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ];
    let fp = env.root.join("fp-work-identity-run-bundle");
    std::fs::create_dir_all(&fp).expect("failpoint dir");
    let mut crashed = env
        .forged_cmd(&args)
        .env("FORGED_FAILPOINT", "run.start.bundle.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .env("FORGED_FAILPOINT_DIR", &fp)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("run start child");
    assert!(!crashed.wait().expect("run start crash").success());

    env.set_bd_show_unreachable(true);
    let (code, replayed) = env.forged(&args);
    assert_eq!(code, 0, "run creation replay: {replayed}");
    assert_eq!(replayed["result"]["run_id"], json!("identity-run-crash"));
    let ledger = env.ledger();
    let identity = ledger
        .get_work_identity(
            forged_types::WorkIdentitySubjectKind::Run,
            "identity-run-crash",
        )
        .expect("identity lookup")
        .expect("identity exists");
    assert_eq!(identity.work.title.as_deref(), Some("Frozen run identity"));
    assert_eq!(
        ledger
            .list_events(Some("identity-run-crash"), 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "forged.run.spec")
            .count(),
        1
    );
    ledger.close().expect("close");
}

#[test]
fn atomic_epic_creation_replays_after_crash_without_work() {
    let env = TestEnv::new("km-work-identity-epic-bundle");
    env.seed_epic(
        "identity-epic-crash",
        &[("identity-child-crash", &env.spec, true)],
    );
    env.set_work_field("identity-epic-crash", "title", "Frozen epic identity");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let args = [
        "epic",
        "start",
        "--epic",
        "identity-epic-crash",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ];
    let fp = env.root.join("fp-work-identity-epic-bundle");
    std::fs::create_dir_all(&fp).expect("failpoint dir");
    let mut crashed = env
        .forged_cmd(&args)
        .env("FORGED_FAILPOINT", "epic.start.bundle.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .env("FORGED_FAILPOINT_DIR", &fp)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("epic start child");
    assert!(!crashed.wait().expect("epic start crash").success());

    env.set_bd_show_unreachable(true);
    env.set_bd_list_unreachable(true);
    let (code, replayed) = env.forged(&args);
    assert_eq!(code, 0, "epic creation replay: {replayed}");
    assert_eq!(replayed["result"]["epicId"], json!("identity-epic-crash"));
    let ledger = env.ledger();
    let identity = ledger
        .get_work_identity(
            forged_types::WorkIdentitySubjectKind::Epic,
            "identity-epic-crash",
        )
        .expect("identity lookup")
        .expect("identity exists");
    assert_eq!(identity.work.title.as_deref(), Some("Frozen epic identity"));
    assert_eq!(
        ledger
            .list_events(Some("identity-epic-crash"), 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "forged.epic.started")
            .count(),
        1
    );
    ledger.close().expect("close");
}
