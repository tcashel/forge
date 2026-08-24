#![cfg(feature = "failpoints")]

//! Crash recovery for the atomic creation + identity bundles.

mod support;

use std::process::Stdio;

use serde_json::{json, Value};
use support::{McpClient, TestEnv};

#[test]
fn approved_run_creation_replays_after_crash_from_frozen_request_and_definition() {
    let env = TestEnv::new("km-work-identity-run-bundle");
    env.seed_bead_spec(
        "identity-run-crash",
        "Capture the native Bead as durable identity.",
        "Creation is atomic and replayable.",
    );
    env.set_bead_field("identity-run-crash", "title", "Frozen run identity");
    env.seed_frontier("identity-run-crash");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let revision = env.bead_revision("identity-run-crash");
    let approval = env.execution_approval(
        "slice",
        "identity-run-crash",
        &repo,
        "main",
        Some("standard"),
        Some("default"),
        &revision,
    );
    let approval_path = env.root.join("identity-run-crash-approval.json");
    std::fs::write(
        &approval_path,
        serde_json::to_vec(&approval).expect("approval JSON"),
    )
    .expect("write approval");
    let approval_arg = approval_path.to_string_lossy().into_owned();
    let args = [
        "run",
        "start",
        "--bead",
        "identity-run-crash",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--profile",
        "standard",
        "--roster",
        "default",
        "--expected-bead-revision",
        &revision,
        "--approval",
        &approval_arg,
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

    // Change the selected package under the same profile/roster refs. The
    // pre-fix recovery path compiled this mutable definition first and could
    // no longer reproduce the in-progress operation's request hash.
    let config_path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(
        &std::fs::read_to_string(&config_path).expect("read config for replay drift"),
    )
    .expect("config JSON");
    config["gate_commands"] = json!(["true", "git diff --check"]);
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("drifted config JSON"),
    )
    .expect("write replay drift");
    env.set_bd_show_unreachable(true);
    let mut mcp = McpClient::new(&env);
    let replayed = mcp.call_tool(
        "run_start",
        json!({
            "schemaVersion": 1,
            "idempotencyKey": "op:run_start:identity-run-crash:-:-",
            "runId": null,
            "params": {
                "bead": "identity-run-crash",
                "repo": repo,
                "spec": null,
                "baseRef": "main",
                "profile": "standard",
                "roster": "default",
                "expectedBeadRevision": revision,
                "approval": approval
            }
        }),
    );
    assert_eq!(
        replayed["ok"],
        json!(true),
        "run creation replay: {replayed}"
    );
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(replayed["result"]["run_id"], json!("identity-run-crash"));
    assert_eq!(replayed["result"]["base_sha"], approval["baseSha"]);
    let ledger = env.ledger();
    let identity = ledger
        .get_work_identity(
            forged_types::WorkIdentitySubjectKind::Run,
            "identity-run-crash",
        )
        .expect("identity lookup")
        .expect("identity exists");
    assert_eq!(identity.bead.title.as_deref(), Some("Frozen run identity"));
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
fn atomic_epic_creation_replays_after_crash_without_beads() {
    let env = TestEnv::new("km-work-identity-epic-bundle");
    env.seed_epic(
        "identity-epic-crash",
        &[("identity-child-crash", &env.spec, true)],
    );
    env.set_bead_field("identity-epic-crash", "title", "Frozen epic identity");
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
    assert_eq!(identity.bead.title.as_deref(), Some("Frozen epic identity"));
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
