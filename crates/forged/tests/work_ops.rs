//! The typed work authoring/repair surface and the epic abandon epoch
//! boundary, end to end through the real binary.

mod support;

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{NewWorkItem, WorkKind, WorkRevisionCause, WorkSpecFields, WorkStatus};
use serde_json::{json, Value};
use support::TestEnv;

const STARTED: &str = "forged.epic.started";
const INTEGRATION_READY: &str = "forged.epic.integration.ready";

fn result(env: &TestEnv, args: &[&str]) -> Value {
    let (code, envelope) = env.forged(args);
    assert_eq!(code, 0, "{args:?}: {envelope}");
    envelope["result"].clone()
}

fn seed_ready_items(env: &TestEnv, count: usize) {
    let ledger = env.ledger();
    for index in 0..count {
        ledger
            .create_work_item(NewWorkItem {
                work_id: format!("ready-{index:03}"),
                kind: WorkKind::Task,
                status: WorkStatus::Open,
                priority: Some(index as i64),
                metadata: BTreeMap::from([("repository".to_owned(), "/tmp/ready-repo".to_owned())]),
                spec: WorkSpecFields {
                    title: format!("Ready item {index}"),
                    description: format!("fat description {index}"),
                    acceptance_criteria: format!("fat acceptance {index}"),
                    design: format!("fat design {index}"),
                    notes: format!("fat notes {index}"),
                },
                cause: WorkRevisionCause::Authored,
            })
            .expect("create ready work item");
    }
    ledger.close().expect("close test ledger");
}

#[test]
fn work_ready_summarizes_by_default_and_full_round_trips_complete_rows() {
    let env = TestEnv::new("forged-work-ready-detail");
    assert_eq!(env.forged(&["init"]).0, 0);
    let created = result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "fat-ready",
            "--title",
            "Fat ready item",
            "--description",
            "description bytes that must stay out of summaries",
            "--acceptance",
            "acceptance bytes that must stay out of summaries",
            "--design",
            "design bytes that must stay out of summaries",
            "--notes",
            "notes bytes that must stay out of summaries",
            "--priority",
            "2",
            "--repository",
            "/tmp/fat-ready-repo",
        ],
    );

    let summarized = result(&env, &["work", "ready"]);
    assert_eq!(
        summarized["filters"],
        json!({"detail": "summary", "limit": 100})
    );
    assert_eq!(summarized["totals"], json!({"shown": 1, "total": 1}));
    let row = &summarized["ready"][0];
    let keys: BTreeSet<&str> = row
        .as_object()
        .expect("summary row")
        .keys()
        .map(String::as_str)
        .collect();
    assert_eq!(
        keys,
        BTreeSet::from([
            "id",
            "kind",
            "priority",
            "repository",
            "revision",
            "status",
            "title",
        ])
    );
    assert_eq!(
        row,
        &json!({
            "id": "fat-ready",
            "title": "Fat ready item",
            "kind": "task",
            "status": "open",
            "priority": 2,
            "repository": "/tmp/fat-ready-repo",
            "revision": 1,
        })
    );

    let full = result(&env, &["work", "ready", "--full"]);
    assert_eq!(full["filters"], json!({"detail": "full", "limit": 100}));
    assert_eq!(
        full["ready"][0], created["work"],
        "--full preserves the complete pre-summary snapshot shape and bytes"
    );
}

#[test]
fn work_ready_reports_total_and_shown_across_the_default_bound() {
    let env = TestEnv::new("forged-work-ready-bound");
    assert_eq!(env.forged(&["init"]).0, 0);
    seed_ready_items(&env, 101);

    let bounded = result(&env, &["work", "ready"]);
    assert_eq!(bounded["filters"]["limit"], json!(100));
    assert_eq!(bounded["totals"], json!({"shown": 100, "total": 101}));
    assert_eq!(bounded["ready"].as_array().expect("ready rows").len(), 100);

    let raised = result(&env, &["work", "ready", "--limit", "101"]);
    assert_eq!(raised["filters"]["limit"], json!(101));
    assert_eq!(raised["totals"], json!({"shown": 101, "total": 101}));
    assert_eq!(raised["ready"].as_array().expect("ready rows").len(), 101);
}

#[test]
fn work_ready_repository_filter_composes_with_summary_bounds() {
    let env = TestEnv::new("forged-work-ready-repository");
    assert_eq!(env.forged(&["init"]).0, 0);
    for (id, repository) in [
        ("ready-a-1", "/repo/a"),
        ("ready-a-2", "/repo/a"),
        ("ready-b", "/repo/b"),
    ] {
        result(
            &env,
            &[
                "work",
                "create",
                "--id",
                id,
                "--title",
                id,
                "--repository",
                repository,
            ],
        );
    }

    let ready = result(
        &env,
        &["work", "ready", "--repo", "/repo/a", "--limit", "1"],
    );
    assert_eq!(
        ready["filters"],
        json!({"detail": "summary", "limit": 1, "repo": "/repo/a"})
    );
    assert_eq!(ready["totals"], json!({"shown": 1, "total": 2}));
    assert_eq!(ready["ready"][0]["id"], json!("ready-a-1"));
}

#[test]
fn work_spec_file_inputs_round_trip_verbatim_and_conflict_with_inline_forms() {
    let env = TestEnv::new("forged-work-spec-files");
    assert_eq!(env.forged(&["init"]).0, 0);
    let description = "- first bullet\n- second bullet\n\nA multi-line body.\n";
    let acceptance = "- preserves leading hyphens\n- preserves final newline\n";
    let design = "line one\nline two\n";
    let notes = "do not trim this body\n";
    let description_path = env.root.join("description.md");
    let acceptance_path = env.root.join("acceptance.md");
    let design_path = env.root.join("design.md");
    let notes_path = env.root.join("notes.md");
    for (path, body) in [
        (&description_path, description),
        (&acceptance_path, acceptance),
        (&design_path, design),
        (&notes_path, notes),
    ] {
        std::fs::write(path, body).expect("write spec field fixture");
    }

    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "file-backed",
            "--title",
            "File-backed spec",
            "--description-file",
            description_path.to_str().expect("UTF-8 path"),
            "--acceptance-file",
            acceptance_path.to_str().expect("UTF-8 path"),
            "--design-file",
            design_path.to_str().expect("UTF-8 path"),
            "--notes-file",
            notes_path.to_str().expect("UTF-8 path"),
        ],
    );
    let shown = result(&env, &["work", "show", "--id", "file-backed"]);
    assert_eq!(shown["work"]["spec"]["description"], json!(description));
    assert_eq!(
        shown["work"]["spec"]["acceptanceCriteria"],
        json!(acceptance)
    );
    assert_eq!(shown["work"]["spec"]["design"], json!(design));
    assert_eq!(shown["work"]["spec"]["notes"], json!(notes));

    let updated_bodies = [
        (&description_path, "updated description\n"),
        (&acceptance_path, "updated acceptance\n"),
        (&design_path, "updated design\n"),
        (&notes_path, "updated notes\n"),
    ];
    for (path, body) in updated_bodies {
        std::fs::write(path, body).expect("update spec field fixture");
    }
    let updated = result(
        &env,
        &[
            "work",
            "update",
            "--id",
            "file-backed",
            "--expected-revision",
            "1",
            "--description-file",
            description_path.to_str().expect("UTF-8 path"),
            "--acceptance-file",
            acceptance_path.to_str().expect("UTF-8 path"),
            "--design-file",
            design_path.to_str().expect("UTF-8 path"),
            "--notes-file",
            notes_path.to_str().expect("UTF-8 path"),
        ],
    );
    assert_eq!(updated["work"]["revision"], json!(2));
    for (field, expected) in [
        ("description", "updated description\n"),
        ("acceptanceCriteria", "updated acceptance\n"),
        ("design", "updated design\n"),
        ("notes", "updated notes\n"),
    ] {
        assert_eq!(updated["work"]["spec"][field], json!(expected));
    }

    let conflict = env
        .forged_cmd(&[
            "work",
            "create",
            "--id",
            "conflict",
            "--title",
            "Conflict",
            "--description",
            "inline",
            "--description-file",
            description_path.to_str().expect("UTF-8 path"),
        ])
        .output()
        .expect("spawn conflicting create");
    assert!(!conflict.status.success());
    let stderr = String::from_utf8_lossy(&conflict.stderr);
    assert!(
        stderr.contains("--description") && stderr.contains("--description-file"),
        "clear conflict error: {stderr}"
    );

    let update_conflict = env
        .forged_cmd(&[
            "work",
            "update",
            "--id",
            "file-backed",
            "--expected-revision",
            "1",
            "--notes",
            "inline",
            "--notes-file",
            notes_path.to_str().expect("UTF-8 path"),
        ])
        .output()
        .expect("spawn conflicting update");
    assert!(!update_conflict.status.success());
    let stderr = String::from_utf8_lossy(&update_conflict.stderr);
    assert!(
        stderr.contains("--notes") && stderr.contains("--notes-file"),
        "clear conflict error: {stderr}"
    );
}

#[test]
fn work_ready_limits_equal_attention_list_limits() {
    let env = TestEnv::new("forged-work-ready-limit-parity");
    assert_eq!(env.forged(&["init"]).0, 0);

    let ready_default = result(&env, &["work", "ready"]);
    let attention_default = result(&env, &["attention", "list"]);
    assert_eq!(
        ready_default["filters"]["limit"], attention_default["filters"]["limit"],
        "the default collection limits must remain equal"
    );
    assert_eq!(ready_default["filters"]["limit"], json!(100));

    let ready_max = result(&env, &["work", "ready", "--limit", "500"]);
    let attention_max = result(&env, &["attention", "list", "--limit", "500"]);
    assert_eq!(
        ready_max["filters"]["limit"], attention_max["filters"]["limit"],
        "the maximum accepted collection limits must remain equal"
    );
    assert_eq!(ready_max["filters"]["limit"], json!(500));

    let (ready_code, ready_over) = env.forged(&["work", "ready", "--limit", "501"]);
    let (attention_code, attention_over) = env.forged(&["attention", "list", "--limit", "501"]);
    assert_ne!(
        ready_code, 0,
        "work_ready accepted an over-cap limit: {ready_over}"
    );
    assert_ne!(
        attention_code, 0,
        "attention_list accepted an over-cap limit: {attention_over}"
    );
    assert_eq!(ready_over["error"]["code"], attention_over["error"]["code"]);
}

/// One epic's whole event stream as (kind, payload), oldest first.
fn epic_events(env: &TestEnv, epic: &str) -> Vec<(String, Value)> {
    let ledger = env.ledger();
    let rows = ledger
        .list_events(Some(epic), 0, 65_536)
        .expect("epic events");
    ledger.close().expect("close test ledger");
    rows.into_iter()
        .map(|row| {
            (
                row.kind,
                serde_json::from_str(&row.payload_json).expect("event payload"),
            )
        })
        .collect()
}

fn events_of_kind(events: &[(String, Value)], kind: &str) -> Vec<Value> {
    events
        .iter()
        .filter(|(row_kind, _)| row_kind == kind)
        .map(|(_, payload)| payload.clone())
        .collect()
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
        .filter_map(|item| item["id"].as_str())
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
            .any(|item| item["id"] == json!("ops-slice")),
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
fn a_fresh_epoch_records_its_own_integration_event_with_the_base_unmoved() {
    let env = TestEnv::new("forged-epic-epoch-unmoved");
    env.enable_dynamic_gh();
    env.seed_epic("epic-unmoved", &[("unmoved-child", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let start = [
        "epic",
        "start",
        "--epic",
        "epic-unmoved",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ];

    let (code, first) = env.forged(&start);
    assert_eq!(code, 0, "epoch 0 start: {first}");
    let advanced = result(&env, &["epic", "advance", "--epic", "epic-unmoved"]);
    assert_eq!(advanced["progress"]["epoch"], json!(0), "{advanced}");

    result(
        &env,
        &[
            "epic",
            "abandon",
            "--epic",
            "epic-unmoved",
            "--reason",
            "ending this epoch without touching the base",
        ],
    );

    // The trigger the old coverage missed: the base has NOT moved, so the
    // fresh epoch re-cuts the identical branch/base/sha triple.
    let (code, second) = env.forged(&start);
    assert_eq!(code, 0, "epoch 1 start: {second}");
    let advanced = result(&env, &["epic", "advance", "--epic", "epic-unmoved"]);
    assert_eq!(advanced["progress"]["epoch"], json!(1), "{advanced}");

    let events = epic_events(&env, "epic-unmoved");
    let ready = events_of_kind(&events, INTEGRATION_READY);
    assert_eq!(
        ready.len(),
        2,
        "each epoch records its own integration event: {ready:?}"
    );
    assert_eq!(
        ready[0]["cutSha"], ready[1]["cutSha"],
        "the two epochs share a cut sha; only the epoch tag separates them"
    );
    assert_eq!(ready[0]["epoch"], json!(0));
    assert_eq!(ready[1]["epoch"], json!(1));

    let status = result(&env, &["epic", "status", "--epic", "epic-unmoved"]);
    assert_eq!(
        status["integration"]["epoch"],
        json!(1),
        "the fresh epoch projects its own integration: {status}"
    );
    assert!(
        events.len() < 100,
        "the controller never flooded the stream: {} events",
        events.len()
    );
}

#[test]
fn a_replayed_setup_heals_an_epoch_whose_integration_event_was_swallowed() {
    let env = TestEnv::new("forged-epic-epoch-heal");
    env.enable_dynamic_gh();
    env.seed_epic("epic-poisoned", &[("poisoned-child", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let start = [
        "epic",
        "start",
        "--epic",
        "epic-poisoned",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ];

    assert_eq!(env.forged(&start).0, 0, "epoch 0 start");
    result(&env, &["epic", "advance", "--epic", "epic-poisoned"]);
    result(
        &env,
        &[
            "epic",
            "abandon",
            "--epic",
            "epic-poisoned",
            "--reason",
            "ending the first epoch",
        ],
    );
    assert_eq!(env.forged(&start).0, 0, "epoch 1 start");

    // Reproduce the state a shipped binary left behind: epoch 1's setup is
    // stored terminal-OK carrying a payload that predates the epoch tag, and
    // the event its projection needs was never appended. The effect closure
    // will not run again, so only a land-or-verify outside it can heal this.
    let events = epic_events(&env, "epic-poisoned");
    let epoch_zero = events_of_kind(&events, INTEGRATION_READY)
        .pop()
        .expect("epoch 0 integration event");
    let started = events_of_kind(&events, STARTED)
        .pop()
        .expect("epoch 1 start event");
    let params = json!({
        "repo": started["repo"],
        "integrationBranch": started["integrationBranch"],
        "baseRef": started["baseRef"],
    });
    let untagged = json!({
        "branch": started["integrationBranch"],
        "baseRef": started["baseRef"],
        "cutSha": epoch_zero["cutSha"],
    });
    {
        let ledger = env.ledger();
        let request = forged_types::OperationRequest {
            schema_version: 1,
            idempotency_key: "op:epic_setup:epic-poisoned:e1:-".to_owned(),
            run_id: Some("epic-poisoned".to_owned()),
            params: match params {
                Value::Object(map) => map,
                other => panic!("setup params are an object: {other}"),
            },
        };
        let ticket = match ledger
            .begin_operation(
                "epic_setup",
                &request,
                forged_ledger::EffectClass::SafeRetry,
                None,
            )
            .expect("begin the poisoned setup")
        {
            forged_ledger::OperationOutcome::Fresh(ticket) => ticket,
            other => panic!("epoch 1 setup must still be unclaimed: {other:?}"),
        };
        let stored = forged_types::OperationResponse {
            ok: true,
            operation_id: ticket.operation_id.clone(),
            reused: false,
            result: Some(untagged),
            error: None,
        };
        ledger
            .complete_operation(&ticket.operation_id, &stored)
            .expect("store the untagged terminal response");
        ledger.close().expect("close test ledger");
    }

    let status = result(&env, &["epic", "status", "--epic", "epic-poisoned"]);
    assert!(
        status["integration"].is_null(),
        "the wedge starts with nothing the epoch can project: {status}"
    );

    let advanced = result(&env, &["epic", "advance", "--epic", "epic-poisoned"]);
    assert_eq!(
        advanced["progress"]["epoch"],
        json!(1),
        "one tick heals the replayed setup: {advanced}"
    );
    let ready = events_of_kind(&epic_events(&env, "epic-poisoned"), INTEGRATION_READY);
    assert_eq!(ready.len(), 2, "the healing append lands: {ready:?}");
    assert_eq!(ready[1]["epoch"], json!(1));
    assert_eq!(ready[1]["cutSha"], epoch_zero["cutSha"]);
    let status = result(&env, &["epic", "status", "--epic", "epic-poisoned"]);
    assert_eq!(
        status["integration"]["epoch"],
        json!(1),
        "the epoch unwedges: {status}"
    );
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
