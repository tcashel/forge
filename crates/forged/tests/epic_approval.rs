//! Exact operator approval at the native epic-start boundary.

mod support;

use forged_types::WorkIdentitySubjectKind;
use serde_json::{json, Value};
use support::{McpClient, TestEnv};

#[test]
fn fresh_epic_start_requires_the_revision_and_content_bound_approval() {
    let env = TestEnv::new("forged-epic-approval-required");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    env.seed_epic(
        "approval-required-epic",
        &[("approval-child", &env.spec, true)],
    );

    let (code, refused) = env.forged_without_test_approval(&[
        "epic",
        "start",
        "--epic",
        "approval-required-epic",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_ne!(code, 0, "unguarded epic start must refuse: {refused}");
    assert_eq!(
        refused["error"]["code"],
        json!("EXECUTION_APPROVAL_MISMATCH")
    );
    let ledger = env.ledger();
    assert!(
        ledger
            .find_operation("epic_start", "op:epic_start:approval-required-epic:-:-")
            .expect("operation read")
            .is_none(),
        "refusal precedes the operation fence"
    );
    assert!(
        ledger
            .list_events(Some("approval-required-epic"), 0, 100)
            .expect("events")
            .into_iter()
            .all(|event| event.kind != "forged.epic.started"),
        "refusal creates no epic bundle"
    );
    ledger.close().expect("close ledger");
}

#[test]
fn epic_start_rejects_drift_then_atomically_retains_and_replays_exact_approval() {
    let env = TestEnv::new("forged-epic-execution-approval");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();

    env.seed_epic(
        "approval-drift-epic",
        &[("approval-drift-child", &env.spec, true)],
    );
    env.set_bead_repository("approval-drift-epic", &repo);
    let mut stale = env.execution_approval(
        "epic",
        "approval-drift-epic",
        &repo,
        "main",
        Some("standard"),
        Some("default"),
        &env.bead_revision("approval-drift-epic"),
    );
    stale["observedRevision"] = json!("stale-revision");
    let mismatch = {
        let mut mcp = McpClient::new(&env);
        let tool = mcp.tool("epic_start");
        let description = tool["description"]
            .as_str()
            .expect("epic_start description");
        for token in [
            "params.expectedBeadRevision",
            "params.approval",
            "forged-execution-approval/2",
            "baseSha",
            "packageSha256",
            "inventorySha256",
            "before any effect",
        ] {
            assert!(
                description.contains(token),
                "epic_start description must expose {token}: {description}"
            );
        }
        mcp.call_tool(
            "epic_start",
            json!({
                "schemaVersion": 1,
                "runId": "approval-drift-epic",
                "params": {
                    "epic": "approval-drift-epic",
                    "repo": repo,
                    "baseRef": "main",
                    "profile": "standard",
                    "roster": "default",
                    "expectedBeadRevision": "stale-revision",
                    "approval": stale,
                }
            }),
        )
    };
    assert_eq!(mismatch["ok"], json!(false), "stale approval must refuse");
    assert_eq!(
        mismatch["error"]["code"],
        json!("EXECUTION_APPROVAL_MISMATCH")
    );
    let ledger = env.ledger();
    assert!(
        ledger
            .find_operation("epic_start", "op:epic_start:approval-drift-epic:-:-")
            .expect("operation read")
            .is_none(),
        "approval mismatch precedes the operation fence"
    );
    assert!(
        ledger
            .list_events(Some("approval-drift-epic"), 0, 100)
            .expect("events")
            .into_iter()
            .all(|event| {
                event.kind != "forged.epic.started"
                    && event.kind != "forged.epic.execution-approval"
            }),
        "approval mismatch leaves no epic bundle"
    );
    assert!(
        ledger
            .get_work_identity(WorkIdentitySubjectKind::Epic, "approval-drift-epic")
            .expect("identity read")
            .is_none(),
        "approval mismatch leaves no identity"
    );
    ledger.close().expect("close ledger");

    env.seed_epic(
        "approval-bound-epic",
        &[("approval-bound-child", &env.spec, true)],
    );
    env.set_bead_repository("approval-bound-epic", &repo);
    let revision = env.bead_revision("approval-bound-epic");
    let approval_path = env.root.join("epic-approval.json");
    let approval = env.execution_approval(
        "epic",
        "approval-bound-epic",
        &repo,
        "main",
        Some("standard"),
        Some("default"),
        &revision,
    );
    std::fs::write(
        &approval_path,
        serde_json::to_vec(&approval).expect("approval JSON"),
    )
    .expect("write approval");
    let args = [
        "epic",
        "start",
        "--epic",
        "approval-bound-epic",
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
        approval_path.to_str().expect("approval path"),
    ];
    let (code, started) = env.forged(&args);
    assert_eq!(code, 0, "approved epic start: {started}");
    assert_eq!(
        started["result"]["inventorySha256"], approval["inventorySha256"],
        "the retained start binds the exact approved inventory"
    );
    let frozen_child = &started["result"]["children"][0];
    assert_eq!(frozen_child["id"], json!("approval-bound-child"));
    assert!(
        frozen_child["revision"]
            .as_str()
            .is_some_and(|value| !value.is_empty()),
        "the frozen child carries its Beads revision"
    );
    assert_eq!(
        frozen_child["specSha256"].as_str().map(str::len),
        Some(64),
        "the frozen child carries its exact spec digest"
    );

    // A terminal replay is reconstructed from the durable bundle and does
    // not re-read mutable Beads authoring state.
    env.set_bd_show_unreachable(true);
    let (code, replayed) = env.forged(&args);
    assert_eq!(code, 0, "approved epic start replay: {replayed}");
    assert_eq!(replayed["reused"], json!(true));

    let ledger = env.ledger();
    let events = ledger
        .list_events(Some("approval-bound-epic"), 0, 100)
        .expect("events");
    let started_events = events
        .iter()
        .filter(|event| event.kind == "forged.epic.started")
        .collect::<Vec<_>>();
    let approval_events = events
        .iter()
        .filter(|event| event.kind == "forged.epic.execution-approval")
        .collect::<Vec<_>>();
    assert_eq!(started_events.len(), 1, "one frozen epic start event");
    assert_eq!(approval_events.len(), 1, "one durable approval event");
    assert_eq!(
        approval_events[0].event_id,
        started_events[0].event_id + 1,
        "the approval is appended in the same launch bundle"
    );
    assert_eq!(
        serde_json::from_str::<Value>(&approval_events[0].payload_json).expect("stored approval"),
        approval
    );
    assert_eq!(
        ledger
            .get_work_identity(WorkIdentitySubjectKind::Epic, "approval-bound-epic")
            .expect("identity read")
            .and_then(|identity| identity.bead.revision),
        Some(revision)
    );
    ledger.close().expect("close ledger");
}

#[test]
fn epic_child_start_refuses_spec_edits_after_the_inventory_was_approved() {
    let env = TestEnv::new("forged-epic-approved-child-drift");
    env.seed_epic(
        "approved-child-drift-epic",
        &[("approved-child-drift", &env.spec, true)],
    );
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "approved-child-drift-epic",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "approved epic start: {started}");
    env.authorize_epic("approved-child-drift-epic");

    std::fs::write(&env.spec, "changed after approval\n").expect("edit child spec");
    for _ in 0..2 {
        let (code, advanced) =
            env.forged(&["epic", "advance", "--epic", "approved-child-drift-epic"]);
        assert_eq!(code, 0, "advance before child launch: {advanced}");
    }
    let (code, refused) = env.forged(&["epic", "advance", "--epic", "approved-child-drift-epic"]);
    assert_ne!(code, 0, "changed child spec must refuse: {refused}");
    assert_eq!(
        refused["error"]["code"],
        json!("EXECUTION_APPROVAL_MISMATCH")
    );
    let ledger = env.ledger();
    assert!(
        ledger.get_run("approved-child-drift").is_err(),
        "drift refusal precedes child run creation"
    );
    assert!(
        ledger
            .find_operation("run_start", "op:run_start:approved-child-drift:-:-")
            .expect("operation lookup")
            .is_none(),
        "drift refusal precedes the child start fence"
    );
    ledger.close().expect("close ledger");
}
