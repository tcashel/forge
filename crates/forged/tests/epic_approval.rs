//! Exact operator approval at the native epic-start boundary.

mod support;

#[cfg(feature = "failpoints")]
use std::process::Stdio;

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

#[cfg(feature = "failpoints")]
#[test]
fn approved_epic_child_uses_frozen_spec_after_start_drift_and_bd_outage() {
    let env = TestEnv::new("forged-epic-child-frozen-spec");
    let epic = "frozen-child-epic";
    let child = "frozen-child";
    env.seed_epic(epic, &[(child, &env.spec, true)]);
    env.set_bead_field(
        child,
        "description",
        "## Context\\n\\nthe parent approved these exact child bytes.",
    );
    env.set_bead_field(child, "acceptance", "- the approved child bytes execute");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        epic,
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "approved epic start: {started}");
    env.authorize_epic(epic);

    for step in ["integration", "wave"] {
        let (code, advanced) = env.forged(&["epic", "advance", "--epic", epic]);
        assert_eq!(code, 0, "{step} advance: {advanced}");
    }
    let status = env
        .forged_cmd(&["epic", "advance", "--epic", epic])
        .env("FORGED_FAILPOINT", "epic.child.started.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("crashing child launch");
    assert!(!status.success(), "child-start failpoint must crash");

    let ledger = env.ledger();
    assert!(
        ledger
            .list_events(Some(epic), 0, 100)
            .expect("epic events")
            .iter()
            .any(|event| event.kind == "forged.epic.child.started"),
        "the crash is after CHILD_STARTED"
    );
    let spec_event = ledger
        .list_events(Some(child), 0, 100)
        .expect("child events")
        .into_iter()
        .find(|event| event.kind == "forged.run.spec")
        .expect("child run spec event");
    ledger.close().expect("close ledger");
    let payload: Value = serde_json::from_str(&spec_event.payload_json).expect("run spec payload");
    let approved_body = payload["frozenSpec"]["body"]
        .as_str()
        .expect("approved epic child frozen body")
        .to_owned();
    let approved_sha = payload["frozenSpec"]["bodySha256"]
        .as_str()
        .expect("approved epic child frozen digest")
        .to_owned();

    // Let the run take its Beads lease, but stop before any packet exists.
    // The child run and CHILD_STARTED are already durable; every subsequent
    // provider-facing spec read must come from that run's frozen bundle.
    env.authorize_run(child);
    let (code, resolved) = env.forged(&["run", "advance", "--run", child]);
    assert_eq!(code, 0, "resolve frozen child: {resolved}");
    let ledger = env.ledger();
    assert!(
        ledger
            .list_packets(child)
            .expect("child packets")
            .is_empty(),
        "the outage and edit occur before packet open"
    );
    ledger.close().expect("close ledger");

    // Neither a later authoring edit nor an unavailable Beads spec read can
    // change or block packet construction and materialization.
    env.set_bead_field(child, "acceptance", "- unapproved replacement");
    env.set_bd_spec_show_unreachable(true);
    let packet = (0..40)
        .find_map(|_| {
            let ledger = env.ledger();
            let packet = ledger
                .list_packets(child)
                .expect("child packets")
                .into_iter()
                .next();
            ledger.close().expect("close ledger");
            if packet.is_none() {
                let (code, advanced) = env.forged(&["run", "advance", "--run", child]);
                assert_eq!(code, 0, "advance frozen child: {advanced}");
            }
            packet
        })
        .expect("frozen child opens a packet without Beads spec access");
    assert_eq!(packet.spec_sha256, approved_sha);
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_eq!(code, 0, "claim frozen child packet: {claimed}");
    let materialized = std::fs::read_to_string(&packet.spec_path).expect("materialized child spec");
    assert_eq!(materialized, approved_body);
    assert!(!materialized.contains("unapproved replacement"));
}
