//! The typed work authoring/repair surface and the epic abandon epoch
//! boundary, end to end through the real binary.

mod support;

use std::collections::{BTreeMap, BTreeSet};
use std::io::Write as _;
use std::process::Stdio;

use forged_ledger::{
    NewWorkItem, NewWorkNote, WorkKind, WorkNoteKind, WorkRevisionCause, WorkSpecFields, WorkStatus,
};
use serde_json::{json, Value};
use support::TestEnv;

const STARTED: &str = "forged.epic.started";
const INTEGRATION_READY: &str = "forged.epic.integration.ready";

fn result(env: &TestEnv, args: &[&str]) -> Value {
    let (code, envelope) = env.forged(args);
    assert_eq!(code, 0, "{args:?}: {envelope}");
    envelope["result"].clone()
}

fn pause_epic(env: &TestEnv, epic: &str) -> Value {
    result(
        env,
        &[
            "epic",
            "pause",
            "--epic",
            epic,
            "--reason",
            "pause before abandoning this epic",
        ],
    )
}

fn seed_ready_items(env: &TestEnv, count: usize) {
    let ledger = env.ledger();
    for index in 0..count {
        ledger
            .create_work_item(NewWorkItem {
                work_id: format!("ready-{index:03}"),
                kind: WorkKind::Task,
                status: WorkStatus::Open,
                priority: (index < count.saturating_sub(150)).then_some(index as i64),
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
        json!({"detail": "summary", "limit": 100, "all": false})
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
            "subject",
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
            "subject": {
                "id": "fat-ready",
                "kind": "work",
                "title": "Fat ready item",
                "repository": "/tmp/fat-ready-repo",
                "revision": "1",
            },
        })
    );

    let full = result(&env, &["work", "ready", "--full"]);
    assert_eq!(
        full["filters"],
        json!({"detail": "full", "limit": 100, "all": false})
    );
    let mut expected_full = created["work"].clone();
    expected_full["subject"] = row["subject"].clone();
    assert_eq!(full["ready"][0], expected_full);
}

#[test]
fn work_show_next_actions_execute_for_open_blocked_and_closed_states() {
    let env = TestEnv::new("forged-work-show-next-actions");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "action-open",
            "--title",
            "Open action fixture",
            "--description",
            "complete description",
            "--acceptance",
            "complete acceptance",
            "--design",
            "complete design",
            "--notes",
            "complete notes",
            "--priority",
            "2",
            "--repository",
            &repository,
        ],
    );

    let shown = result(&env, &["work", "show", "--id", "action-open"]);
    assert_eq!(
        shown["nextActions"],
        json!([
            {
                "verb": "run start",
                "args": {"work": "action-open", "repo": repository},
                "reason": "start a run once the work specification is complete",
                "class": "can",
            },
            {
                "verb": "work update",
                "args": {"id": "action-open", "expectedRevision": 1, "description": null},
                "reason": "supply at least one spec field or priority under the current revision guard",
                "class": "can",
            },
        ])
    );

    let update = &shown["nextActions"][1];
    let expected = update["args"]["expectedRevision"]
        .as_i64()
        .expect("expected revision")
        .to_string();
    let updated = result(
        &env,
        &[
            "work",
            "update",
            "--id",
            update["args"]["id"].as_str().expect("update id"),
            "--expected-revision",
            &expected,
            "--description",
            "bound placeholder description",
        ],
    );
    assert_eq!(updated["work"]["revision"], json!(2));

    let start = &shown["nextActions"][0];
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        start["args"]["work"].as_str().expect("start work"),
        "--repo",
        start["args"]["repo"].as_str().expect("start repo"),
    ]);
    assert_eq!(code, 0, "advertised run start succeeds: {started}");

    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "action-repo-placeholder",
            "--title",
            "Repository placeholder fixture",
            "--description",
            "complete description",
            "--acceptance",
            "complete acceptance",
            "--design",
            "complete design",
            "--notes",
            "complete notes",
            "--priority",
            "3",
        ],
    );
    let shown = result(&env, &["work", "show", "--id", "action-repo-placeholder"]);
    let start = &shown["nextActions"][0];
    assert_eq!(start["args"]["repo"], Value::Null);
    assert_eq!(
        start["reason"],
        json!("choose the repository before starting the run")
    );
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        start["args"]["work"].as_str().expect("start work"),
        "--repo",
        &repository,
    ]);
    assert_eq!(
        code, 0,
        "advertised run start succeeds after binding repo: {started}"
    );

    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "action-blocked",
            "--title",
            "Blocked action fixture",
            "--status",
            "blocked",
        ],
    );
    let blocked = result(&env, &["work", "show", "--id", "action-blocked"]);
    assert_eq!(
        blocked["nextActions"],
        json!([{
            "verb": "work reopen",
            "args": {"id": "action-blocked"},
            "reason": "reopen the work item before scheduling it",
            "class": "repair",
        }])
    );
    let reopen_id = blocked["nextActions"][0]["args"]["id"]
        .as_str()
        .expect("blocked reopen id");
    let reopened = result(&env, &["work", "reopen", "--id", reopen_id]);
    assert_eq!(reopened["work"]["status"], json!("open"));

    result(
        &env,
        &[
            "work",
            "close",
            "--id",
            "action-blocked",
            "--reason",
            "closed action fixture",
        ],
    );
    let closed = result(&env, &["work", "show", "--id", "action-blocked"]);
    assert_eq!(closed["nextActions"][0]["verb"], json!("work reopen"));
    let reopen_id = closed["nextActions"][0]["args"]["id"]
        .as_str()
        .expect("closed reopen id");
    let reopened = result(&env, &["work", "reopen", "--id", reopen_id]);
    assert_eq!(reopened["work"]["status"], json!("open"));
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
fn work_ready_all_returns_one_complete_frontier_or_a_recovery_refusal() {
    let env = TestEnv::new("forged-work-ready-all");
    assert_eq!(env.forged(&["init"]).0, 0);
    seed_ready_items(&env, 500);

    let complete = result(&env, &["work", "ready", "--all"]);
    assert_eq!(
        complete["filters"],
        json!({"detail": "summary", "limit": 500, "all": true})
    );
    assert_eq!(
        complete["coverage"],
        json!({"shown": 500, "total": 500, "truncated": false, "nextCursor": null})
    );
    assert_eq!(
        complete["ready"].as_array().expect("whole frontier").len(),
        500
    );

    let oversized = TestEnv::new("forged-work-ready-all-oversized");
    assert_eq!(oversized.forged(&["init"]).0, 0);
    seed_ready_items(&oversized, 501);
    let (code, refusal) = oversized.forged(&["work", "ready", "--all"]);
    assert_ne!(code, 0, "an oversized frontier must refuse: {refusal}");
    assert_eq!(refusal["error"]["code"], json!("FRONTIER_TOO_LARGE"));
    assert_eq!(
        refusal["error"]["detail"]["schema"],
        json!("forged.remedy/1")
    );
    assert_eq!(refusal["error"]["detail"]["verb"], json!("work ready"));
    assert_eq!(refusal["error"]["detail"]["args"]["limit"], json!(500));
    assert!(
        refusal["error"]["detail"]["reason"]
            .as_str()
            .is_some_and(|reason| reason.contains("--repo") && reason.contains("--limit")),
        "the refusal names both recovery selectors: {refusal}"
    );
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
        json!({"detail": "summary", "limit": 1, "all": false, "repo": "/repo/a"})
    );
    assert_eq!(ready["totals"], json!({"shown": 1, "total": 2}));
    assert_eq!(ready["ready"][0]["id"], json!("ready-a-1"));
}

#[test]
fn work_ready_cursor_pages_two_hundred_fifty_rows_without_gaps() {
    let env = TestEnv::new("forged-work-ready-cursor");
    assert_eq!(env.forged(&["init"]).0, 0);
    seed_ready_items(&env, 250);
    let ledger = env.ledger();
    for index in 0..25 {
        ledger
            .create_work_item(NewWorkItem {
                work_id: format!("foreign-{index:03}"),
                kind: WorkKind::Task,
                status: WorkStatus::Open,
                priority: Some(index as i64),
                metadata: BTreeMap::from([(
                    "repository".to_owned(),
                    "/tmp/foreign-repo".to_owned(),
                )]),
                spec: WorkSpecFields {
                    title: format!("Foreign item {index}"),
                    description: String::new(),
                    acceptance_criteria: String::new(),
                    design: String::new(),
                    notes: String::new(),
                },
                cause: WorkRevisionCause::Authored,
            })
            .expect("create foreign ready item");
    }
    ledger.close().expect("close test ledger");

    let mut cursor: Option<String> = None;
    let mut ids = Vec::new();
    for (page_index, shown) in [100, 100, 50].into_iter().enumerate() {
        let mut args = vec![
            "work".to_owned(),
            "ready".to_owned(),
            "--repo".to_owned(),
            "/tmp/ready-repo".to_owned(),
            "--full".to_owned(),
            "--limit".to_owned(),
            "100".to_owned(),
        ];
        if let Some(value) = &cursor {
            args.push("--cursor".to_owned());
            args.push(value.clone());
        }
        let refs: Vec<&str> = args.iter().map(String::as_str).collect();
        let page = result(&env, &refs);
        assert_eq!(page["totals"], json!({"shown": shown, "total": 250}));
        ids.extend(
            page["ready"]
                .as_array()
                .expect("ready page")
                .iter()
                .map(|row| row["workId"].as_str().expect("full work id").to_owned()),
        );
        cursor = page["nextCursor"].as_str().map(str::to_owned);
        assert_eq!(
            cursor.is_some(),
            page_index < 2,
            "nextCursor must advertise only a following page"
        );
    }

    let expected: Vec<String> = (0..250).map(|index| format!("ready-{index:03}")).collect();
    assert_eq!(ids, expected);
    assert_eq!(ids.iter().collect::<BTreeSet<_>>().len(), 250);

    let (code, refusal) = env.forged(&["work", "ready", "--cursor", "not-base64"]);
    assert_ne!(code, 0, "invalid cursor was accepted: {refusal}");
    let message = refusal["error"]["message"].as_str().unwrap_or_default();
    assert!(
        message.contains("cursor"),
        "parameter is unnamed: {message}"
    );
    assert!(
        message.contains("work ready without --cursor"),
        "recovery verb is absent: {message}"
    );
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
fn work_notes_round_trip_canonically_without_minting_revisions() {
    let env = TestEnv::new("forged-work-notes");
    assert_eq!(env.forged(&["init"]).0, 0);
    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "noted-work",
            "--title",
            "Noted work",
        ],
    );
    let body_path = env.root.join("critique.json");
    std::fs::write(&body_path, r#"{"z":1,"a":{"d":4,"b":2}}"#).expect("write body");
    let body_path = body_path.to_str().expect("UTF-8 body path");

    let added = result(
        &env,
        &[
            "work",
            "note",
            "add",
            "--id",
            "noted-work",
            "--kind",
            "critique",
            "--body-file",
            body_path,
        ],
    );
    assert_eq!(added["note"]["schema"], json!("critique/0"));
    assert_eq!(added["note"]["actor"], json!("operator"));
    assert_eq!(
        added["note"]["bodyJson"],
        json!(r#"{"a":{"b":2,"d":4},"z":1}"#),
        "the stored and returned bytes are the parser's canonical rendering"
    );
    let note_id = added["note"]["noteId"].as_str().expect("note id");
    assert_eq!(
        uuid::Uuid::parse_str(note_id)
            .expect("house UUID")
            .get_version_num(),
        7
    );

    let replayed = env
        .forged(&[
            "work",
            "note",
            "add",
            "--id",
            "noted-work",
            "--kind",
            "critique",
            "--body-file",
            body_path,
        ])
        .1;
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(replayed["result"]["note"]["noteId"], json!(note_id));

    result(
        &env,
        &[
            "work",
            "close",
            "--id",
            "noted-work",
            "--reason",
            "approval evidence follows",
        ],
    );
    std::fs::write(
        body_path,
        serde_json::to_vec(&json!({
            "schema": "forged.execution-approval/1",
            "subjectKind": "slice",
            "workItemId": "noted-work",
            "observedRevision": "1",
            "repository": "/tmp/noted-work",
            "baseRef": "main",
            "profile": "default",
            "roster": "default",
            "action": "run-start-submit",
            "approvedAt": "2026-08-29T12:00:00Z",
            "actor": "lead-agent",
            "basis": "operator approved the bounded tuple",
        }))
        .expect("serialize approval"),
    )
    .expect("replace body");
    let supplied = result(
        &env,
        &[
            "work",
            "note",
            "add",
            "--id",
            "noted-work",
            "--kind",
            "approval",
            "--actor",
            "lead-agent",
            "--body-file",
            body_path,
        ],
    );
    assert_eq!(
        supplied["note"]["schema"],
        json!("forged.execution-approval/1"),
        "the approval schema is stored under its typed contract"
    );
    assert_eq!(supplied["note"]["actor"], json!("lead-agent"));

    let mut child = env
        .forged_cmd(&[
            "work",
            "note",
            "add",
            "--id",
            "noted-work",
            "--kind",
            "comment",
            "--body-file",
            "-",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("spawn stdin note add");
    child
        .stdin
        .take()
        .expect("child stdin")
        .write_all(br#"{"stdin":true}"#)
        .expect("write stdin body");
    let output = child.wait_with_output().expect("stdin note completes");
    assert!(
        output.status.success(),
        "stdin note add: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let listed = result(&env, &["work", "note", "list", "--id", "noted-work"]);
    assert_eq!(listed["filters"], json!({"id": "noted-work", "limit": 100}));
    assert_eq!(listed["totals"], json!({"shown": 3, "total": 3}));
    assert_eq!(listed["notes"][0]["bodyJson"], added["note"]["bodyJson"]);
    let filtered = result(
        &env,
        &[
            "work",
            "note",
            "list",
            "--id",
            "noted-work",
            "--kind",
            "critique",
            "--limit",
            "1",
        ],
    );
    assert_eq!(
        filtered["filters"],
        json!({"id": "noted-work", "kind": "critique", "limit": 1})
    );
    assert_eq!(filtered["totals"], json!({"shown": 1, "total": 1}));
    assert_eq!(filtered["notes"][0]["noteId"], json!(note_id));

    let shown = result(&env, &["work", "show", "--id", "noted-work"]);
    assert_eq!(shown["notesCount"], json!(3));
    assert_eq!(
        shown["work"]["revision"],
        json!(1),
        "annotations and close-time evidence never mint revisions"
    );
}

#[test]
fn recommendation_notes_round_trip_the_closed_v1_contract() {
    let env = TestEnv::new("forged-recommendation-note-v1");
    assert_eq!(env.forged(&["init"]).0, 0);
    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "recommended-work",
            "--title",
            "Recommended work",
        ],
    );
    let body = json!({
        "schema": "forged.spec-recommendations/1",
        "workItem": "recommended-work",
        "repository": "/tmp/recommended-work",
        "reviewedAt": "2026-08-29T12:00:00Z",
        "topology": "normal: one independent critic",
        "recommendations": [{
            "target": "design",
            "correction": "validate typed notes before the ledger call"
        }],
        "cruxes": [{
            "id": "CRUX-1",
            "evidence": ["work_ops owns the handler"],
            "options": ["validate in core", "validate in ledger"],
            "recommendation": "validate in core",
            "resolution": "validate in core"
        }],
        "openQuestions": [],
        "rejectedFindings": [{
            "finding": "migrate old rows",
            "reason": "migration is outside this slice"
        }],
        "verification": ["inspected work_ops.rs"]
    });
    let body_path = env.root.join("recommendations.json");
    std::fs::write(
        &body_path,
        serde_json::to_vec_pretty(&body).expect("serialize recommendations"),
    )
    .expect("write recommendations");
    let body_path = body_path.to_str().expect("UTF-8 body path");

    let added = result(
        &env,
        &[
            "work",
            "note",
            "add",
            "--id",
            "recommended-work",
            "--kind",
            "recommendation",
            "--body-file",
            body_path,
        ],
    );
    assert_eq!(
        added["note"]["schema"],
        json!("forged.spec-recommendations/1"),
        "omitting --schema mints the typed recommendation schema"
    );

    let listed = result(
        &env,
        &[
            "work",
            "note",
            "list",
            "--id",
            "recommended-work",
            "--kind",
            "recommendation",
        ],
    );
    assert_eq!(listed["totals"], json!({"shown": 1, "total": 1}));
    assert_eq!(listed["notes"][0]["schema"], added["note"]["schema"]);
    let listed_body: Value = serde_json::from_str(
        listed["notes"][0]["bodyJson"]
            .as_str()
            .expect("bodyJson string"),
    )
    .expect("listed body is JSON");
    assert_eq!(listed_body, body);
}

#[test]
fn typed_work_note_refusals_name_schema_and_first_field() {
    let env = TestEnv::new("forged-typed-note-refusals");
    assert_eq!(env.forged(&["init"]).0, 0);
    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "typed-note-work",
            "--title",
            "Typed note work",
        ],
    );
    let body = env.root.join("typed-note.json");
    let body_path = body.to_str().expect("UTF-8 body path");

    let cases = [
        (
            "recommendation",
            json!({
                "schema": "forged.spec-recommendations/1",
                "repository": "/tmp/typed-note-work",
                "reviewedAt": "2026-08-29T12:00:00Z",
                "recommendations": [],
                "cruxes": []
            }),
            "forged.spec-recommendations/1",
            "workItem",
        ),
        (
            "approval",
            json!({
                "schema": "forged.execution-approval/1",
                "subjectKind": "slice",
                "workItemId": "typed-note-work",
                "observedRevision": "1",
                "repository": "/tmp/typed-note-work",
                "baseRef": "main",
                "profile": "default",
                "roster": "default",
                "action": "run-start-submit",
                "approvedAt": "2026-08-29T12:00:00Z",
                "actor": "operator"
            }),
            "forged.execution-approval/1",
            "basis",
        ),
    ];
    for (kind, payload, schema, field) in cases {
        std::fs::write(
            &body,
            serde_json::to_vec(&payload).expect("serialize invalid typed note"),
        )
        .expect("write invalid typed note");
        let (code, refused) = env.forged(&[
            "work",
            "note",
            "add",
            "--id",
            "typed-note-work",
            "--kind",
            kind,
            "--body-file",
            body_path,
        ]);
        assert_ne!(code, 0, "missing field was accepted: {refused}");
        let message = refused["error"]["message"].as_str().unwrap_or_default();
        assert!(message.contains(schema), "schema absent from: {message}");
        assert!(message.contains(field), "field absent from: {message}");
    }

    let recommendation = json!({
        "schema": "forged.spec-recommendations/1",
        "workItem": "typed-note-work",
        "repository": "/tmp/typed-note-work",
        "reviewedAt": "2026-08-29T12:00:00Z",
        "recommendations": [],
        "cruxes": []
    });
    std::fs::write(
        &body,
        serde_json::to_vec(&recommendation).expect("serialize recommendation"),
    )
    .expect("write recommendation");
    let (code, mismatch) = env.forged(&[
        "work",
        "note",
        "add",
        "--id",
        "typed-note-work",
        "--kind",
        "recommendation",
        "--schema",
        "forged.execution-approval/1",
        "--body-file",
        body_path,
    ]);
    assert_ne!(code, 0, "kind/schema mismatch was accepted: {mismatch}");
    let message = mismatch["error"]["message"].as_str().unwrap_or_default();
    assert!(message.contains("recommendation"), "{message}");
    assert!(message.contains("forged.execution-approval/1"), "{message}");
    assert!(
        message.contains("forged.spec-recommendations/1"),
        "{message}"
    );

    let legacy_approval = json!({
        "schema": "forged-execution-approval/1",
        "subjectKind": "slice",
        "workItemId": "typed-note-work",
        "observedRevision": "1",
        "repository": "/tmp/typed-note-work",
        "baseRef": "main",
        "profile": "default",
        "roster": "default",
        "action": "run-start-submit",
        "approvedAt": "2026-08-29T12:00:00Z",
        "actor": "operator",
        "basis": "approved tuple"
    });
    std::fs::write(
        &body,
        serde_json::to_vec(&legacy_approval).expect("serialize legacy approval"),
    )
    .expect("write legacy approval");
    let (code, legacy) = env.forged(&[
        "work",
        "note",
        "add",
        "--id",
        "typed-note-work",
        "--kind",
        "approval",
        "--body-file",
        body_path,
    ]);
    assert_ne!(code, 0, "legacy approval schema was accepted: {legacy}");
    let message = legacy["error"]["message"].as_str().unwrap_or_default();
    assert!(message.contains("forged-execution-approval/1"), "{message}");
    assert!(message.contains("forged.execution-approval/1"), "{message}");
    assert!(message.contains("schema"), "{message}");
}

#[test]
fn existing_untyped_sentinel_notes_remain_listable() {
    let env = TestEnv::new("forged-untyped-note-compat");
    assert_eq!(env.forged(&["init"]).0, 0);
    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "legacy-note-work",
            "--title",
            "Legacy note work",
        ],
    );
    let ledger = env.ledger();
    ledger
        .add_work_note(NewWorkNote {
            work_id: "legacy-note-work".to_owned(),
            kind: WorkNoteKind::Recommendation,
            schema: "recommendation/0".to_owned(),
            actor: "legacy-critic".to_owned(),
            body_json: r#"{"legacy":true}"#.to_owned(),
        })
        .expect("seed pre-v1 recommendation note");
    ledger.close().expect("close ledger");

    let listed = result(
        &env,
        &[
            "work",
            "note",
            "list",
            "--id",
            "legacy-note-work",
            "--kind",
            "recommendation",
        ],
    );
    assert_eq!(listed["totals"], json!({"shown": 1, "total": 1}));
    assert_eq!(listed["notes"][0]["schema"], json!("recommendation/0"));
    assert_eq!(listed["notes"][0]["bodyJson"], json!(r#"{"legacy":true}"#));
}

#[test]
fn work_note_add_refuses_ambiguous_json_and_missing_work() {
    let env = TestEnv::new("forged-work-note-refusals");
    assert_eq!(env.forged(&["init"]).0, 0);
    result(
        &env,
        &["work", "create", "--id", "note-json", "--title", "JSON"],
    );
    let body = env.root.join("invalid-note.json");
    let body_path = body.to_str().expect("UTF-8 body path");
    for (raw, rule) in [
        (r#"{"same":1,"same":2}"#, "duplicate object key"),
        (r#"{"float":1.5}"#, "non-integer number"),
    ] {
        std::fs::write(&body, raw).expect("write invalid body");
        let (code, refused) = env.forged(&[
            "work",
            "note",
            "add",
            "--id",
            "note-json",
            "--kind",
            "comment",
            "--body-file",
            body_path,
        ]);
        assert_ne!(code, 0, "invalid body was accepted: {refused}");
        assert!(
            refused["error"]["message"]
                .as_str()
                .is_some_and(|message| message.contains(rule)),
            "the refusal names the canonical JSON rule: {refused}"
        );
    }

    std::fs::write(&body, "{}").expect("write valid body");
    let (code, missing) = env.forged(&[
        "work",
        "note",
        "add",
        "--id",
        "missing-note-target",
        "--kind",
        "comment",
        "--body-file",
        body_path,
    ]);
    assert_ne!(code, 0, "missing work accepted a note: {missing}");
    let message = missing["error"]["message"].as_str().unwrap_or_default();
    assert!(message.contains("missing-note-target"), "{message}");
    assert!(message.contains("work_create"), "{message}");

    for limit in ["0", "501"] {
        let (code, refused) = env.forged(&[
            "work",
            "note",
            "list",
            "--id",
            "note-json",
            "--limit",
            limit,
        ]);
        assert_ne!(code, 0, "out-of-range limit accepted: {refused}");
        assert!(refused["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("between 1 and 500")));
    }
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
fn promote_and_priority_update_preserve_revision_semantics() {
    let env = TestEnv::new("forged-work-promote-priority");
    assert_eq!(env.forged(&["init"]).0, 0);

    let created = result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "priority-repair",
            "--title",
            "Priority repair",
            "--repository",
            "/tmp/priority-repair",
        ],
    );
    assert_eq!(created["work"]["priority"], Value::Null);
    assert_eq!(created["work"]["revision"], json!(1));

    let priority_only = result(
        &env,
        &[
            "work",
            "update",
            "--id",
            "priority-repair",
            "--expected-revision",
            "1",
            "--priority",
            "2",
        ],
    );
    assert_eq!(priority_only["work"]["priority"], json!(2));
    assert_eq!(
        priority_only["work"]["revision"],
        json!(1),
        "priority is coordination state and must not mint"
    );
    let ledger = env.ledger();
    let priority_event = ledger
        .list_events_by_kind("work.updated")
        .expect("work update events")
        .into_iter()
        .filter_map(|event| serde_json::from_str::<Value>(&event.payload_json).ok())
        .find(|payload| payload["workId"] == json!("priority-repair"))
        .expect("priority update event");
    ledger.close().expect("close ledger");
    assert_eq!(priority_event["priority"], json!({"from": null, "to": 2}));
    assert_eq!(priority_event["revision"], json!({"from": 1, "to": 1}));

    let combined = result(
        &env,
        &[
            "work",
            "update",
            "--id",
            "priority-repair",
            "--expected-revision",
            "1",
            "--priority",
            "1",
            "--description",
            "combined spec and priority write",
        ],
    );
    assert_eq!(combined["work"]["priority"], json!(1));
    assert_eq!(combined["work"]["revision"], json!(2));
    assert_eq!(
        combined["work"]["spec"]["description"],
        json!("combined spec and priority write")
    );
    let (code, stale_priority) = env.forged(&[
        "work",
        "update",
        "--id",
        "priority-repair",
        "--expected-revision",
        "1",
        "--priority",
        "0",
    ]);
    assert_ne!(
        code, 0,
        "stale priority update must refuse: {stale_priority}"
    );
    assert_eq!(stale_priority["error"]["code"], json!("BEADS_CONTENTION"));
    let unchanged = result(&env, &["work", "show", "--id", "priority-repair"]);
    assert_eq!(unchanged["work"]["priority"], json!(1));
    assert_eq!(unchanged["work"]["revision"], json!(2));

    for (name, body) in [
        ("description", "promoted description"),
        ("acceptance", "promoted acceptance"),
        ("design", "promoted design"),
        ("notes", "promoted notes"),
    ] {
        std::fs::write(env.root.join(format!("{name}.md")), body).expect("write promote input");
    }
    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "blocked-stub",
            "--title",
            "Preserved title",
            "--status",
            "blocked",
        ],
    );
    let description = env.root.join("description.md");
    let acceptance = env.root.join("acceptance.md");
    let design = env.root.join("design.md");
    let notes = env.root.join("notes.md");
    let promoted = result(
        &env,
        &[
            "work",
            "promote",
            "--id",
            "blocked-stub",
            "--expected-revision",
            "1",
            "--description-file",
            description.to_str().unwrap(),
            "--acceptance-file",
            acceptance.to_str().unwrap(),
            "--design-file",
            design.to_str().unwrap(),
            "--notes-file",
            notes.to_str().unwrap(),
        ],
    );
    assert_eq!(promoted["work"]["status"], json!("open"));
    assert_eq!(promoted["work"]["revision"], json!(2));
    assert_eq!(promoted["work"]["spec"]["title"], json!("Preserved title"));
    assert_eq!(
        promoted["work"]["spec"]["description"],
        json!("promoted description")
    );
    assert_eq!(
        promoted["work"]["spec"]["acceptanceCriteria"],
        json!("promoted acceptance")
    );
    assert_eq!(promoted["work"]["spec"]["design"], json!("promoted design"));
    assert_eq!(promoted["work"]["spec"]["notes"], json!("promoted notes"));
    let conn = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open ledger");
    let cause: String = conn
        .query_row(
            "SELECT cause FROM work_revisions WHERE work_id = 'blocked-stub' AND revision = 2",
            [],
            |row| row.get(0),
        )
        .expect("promotion revision cause");
    assert_eq!(cause, "planning-apply");

    result(
        &env,
        &[
            "work",
            "create",
            "--id",
            "raced-stub",
            "--title",
            "Raced stub",
            "--status",
            "blocked",
        ],
    );
    result(
        &env,
        &[
            "work",
            "update",
            "--id",
            "raced-stub",
            "--expected-revision",
            "1",
            "--description",
            "concurrent write",
        ],
    );
    let (code, contention) = env.forged(&[
        "work",
        "promote",
        "--id",
        "raced-stub",
        "--expected-revision",
        "1",
        "--description",
        "stale plan",
    ]);
    assert_ne!(code, 0, "stale promotion must refuse: {contention}");
    assert_eq!(contention["error"]["code"], json!("BEADS_CONTENTION"));
    let raced = result(&env, &["work", "show", "--id", "raced-stub"]);
    assert_eq!(raced["work"]["revision"], json!(2));
    assert_eq!(raced["work"]["status"], json!("blocked"));

    let (code, open_refusal) = env.forged(&[
        "work",
        "promote",
        "--id",
        "priority-repair",
        "--expected-revision",
        "2",
    ]);
    assert_ne!(code, 0, "open work must not promote: {open_refusal}");
    let message = open_refusal["error"]["message"]
        .as_str()
        .unwrap_or_default();
    assert!(message.contains("work update"), "{message}");
    assert!(message.contains("work reopen"), "{message}");
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

    let ledger = env.ledger();
    ledger
        .append_event(
            Some("epic-doomed"),
            "forged.epic.input.required",
            json!({"code": "fixture", "childId": "doomed-child", "detail": "epoch zero"}),
        )
        .expect("append epoch-zero input");
    ledger.close().expect("close ledger");
    let first_resolution = result(
        &env,
        &[
            "epic",
            "resolve",
            "--epic",
            "epic-doomed",
            "--child",
            "doomed-child",
            "--note",
            "resolve epoch zero",
        ],
    );

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

    let abandon = [
        "epic",
        "abandon",
        "--epic",
        "epic-doomed",
        "--reason",
        "the base ref was wrong; ending this epoch",
    ];
    let (code, refused) = env.forged(&abandon);
    assert_ne!(code, 0, "unpaused abandon must refuse: {refused}");
    assert_eq!(
        refused["error"]["detail"],
        json!({
            "schema": "forged.remedy/1",
            "verb": "epic pause",
            "args": {
                "epic": "epic-doomed",
                "reason": "pause before abandoning this epic",
            },
            "reason": "pause scheduling before abandoning the epic",
        })
    );
    pause_epic(&env, "epic-doomed");
    result(
        &env,
        &[
            "epic",
            "resume",
            "--epic",
            "epic-doomed",
            "--reason",
            "exercise epoch-zero resume key",
        ],
    );
    pause_epic(&env, "epic-doomed");
    let abandoned = result(&env, &abandon);
    assert_eq!(abandoned["abandoned"], json!(true));

    // The epoch is over: status folds as never-started...
    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-doomed"]);
    assert_ne!(code, 0, "an abandoned epoch has no started state: {status}");

    // ...the inventory folds the boundary as stopped-with-reason...
    let listed = result(&env, &["work", "list", "--detail", "full"]);
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

    let ledger = env.ledger();
    ledger
        .append_event(
            Some("epic-doomed"),
            "forged.epic.input.required",
            json!({"code": "fixture", "childId": "doomed-child", "detail": "epoch one"}),
        )
        .expect("append epoch-one input");
    ledger.close().expect("close ledger");
    let second_resolution = result(
        &env,
        &[
            "epic",
            "resolve",
            "--epic",
            "epic-doomed",
            "--child",
            "doomed-child",
            "--note",
            "resolve epoch one",
        ],
    );
    assert_ne!(
        first_resolution["resolutionId"], second_resolution["resolutionId"],
        "resolution epochs count the full stream"
    );
    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-doomed"]);
    assert_eq!(code, 0, "the new epoch projects: {status}");

    // ...and the fresh epoch's start supersedes the boundary in the
    // inventory fold.
    let listed = result(&env, &["work", "list", "--detail", "full"]);
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
    pause_epic(&env, "epic-doomed");
    result(
        &env,
        &[
            "epic",
            "resume",
            "--epic",
            "epic-doomed",
            "--reason",
            "exercise epoch-one resume key",
        ],
    );
    pause_epic(&env, "epic-doomed");
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
    let events = epic_events(&env, "epic-doomed");
    let control_ids = events
        .iter()
        .filter(|(kind, _)| {
            matches!(
                kind.as_str(),
                "forged.epic.paused" | "forged.epic.resumed" | "forged.epic.abandoned"
            )
        })
        .map(|(_, payload)| {
            payload["controlId"]
                .as_str()
                .expect("control id")
                .to_owned()
        })
        .collect::<Vec<_>>();
    assert_eq!(
        control_ids.iter().collect::<BTreeSet<_>>().len(),
        control_ids.len(),
        "control keys stay monotonic across the abandon boundary"
    );
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
    env.authorize_epic("epic-unmoved");
    let advanced = env.reconcile_epic("epic-unmoved").1["result"].clone();
    assert_eq!(advanced["progress"]["epoch"], json!(0), "{advanced}");

    pause_epic(&env, "epic-unmoved");
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
    env.authorize_epic("epic-unmoved");
    let advanced = env.reconcile_epic("epic-unmoved").1["result"].clone();
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
        "the pass never flooded the stream: {} events",
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
    env.authorize_epic("epic-poisoned");
    let _ = env.reconcile_epic("epic-poisoned");
    pause_epic(&env, "epic-poisoned");
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
    env.authorize_epic("epic-poisoned");

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

    let advanced = env.reconcile_epic("epic-poisoned").1["result"].clone();
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
