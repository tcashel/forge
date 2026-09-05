#![cfg(feature = "failpoints")]

//! Crash atomicity for the revision-to-adjudication seam.

mod support;

use std::process::Stdio;

use forged_ledger::WorkNoteKind;
use serde_json::{json, Value};
use support::TestEnv;

fn invoke(env: &TestEnv, args: &[&str]) -> Value {
    let (code, response) = env.forged(args);
    assert_eq!(code, 0, "{args:?}: {response}");
    response["result"].clone()
}

#[test]
fn crash_between_revision_and_note_rolls_back_both() {
    let env = TestEnv::new("km-work-adjudicate-revision-note");
    assert_eq!(env.forged(&["init"]).0, 0);
    invoke(
        &env,
        &[
            "work",
            "create",
            "--id",
            "atomic-adjudication",
            "--title",
            "Atomic adjudication",
        ],
    );

    let recommendation_path = env.root.join("recommendation.json");
    std::fs::write(
        &recommendation_path,
        serde_json::to_vec(&json!({
            "schema": "forged.spec-recommendations/1",
            "revision": 1,
            "workItem": "atomic-adjudication",
            "repository": "/tmp/atomic-adjudication",
            "reviewedAt": "2026-09-03T12:00:00Z",
            "recommendations": [{"target": "description", "correction": "bind it"}],
            "cruxes": []
        }))
        .expect("recommendation JSON"),
    )
    .expect("write recommendation");
    let recommendation = invoke(
        &env,
        &[
            "work",
            "note",
            "add",
            "--id",
            "atomic-adjudication",
            "--kind",
            "recommendation",
            "--body-file",
            recommendation_path.to_str().expect("UTF-8 path"),
        ],
    );
    let note_id = recommendation["note"]["noteId"].as_str().expect("note id");
    let adjudication_path = env.root.join("adjudication.json");
    std::fs::write(
        &adjudication_path,
        serde_json::to_vec(&json!({
            "schema": "forged.adjudication/1",
            "revision": 2,
            "workItem": "atomic-adjudication",
            "critiquedRevision": 1,
            "recommendationNoteId": note_id,
            "resultingRevision": 2,
            "dispositions": [{
                "ref": {"noteId": note_id, "index": 0},
                "disposition": "accept",
                "reason": "accepted"
            }],
            "cruxes": [],
            "adjudicatedAt": "2026-09-03T12:01:00Z",
            "actor": "operator"
        }))
        .expect("adjudication JSON"),
    )
    .expect("write adjudication");
    let args = [
        "work",
        "adjudicate",
        "--id",
        "atomic-adjudication",
        "--expected-revision",
        "1",
        "--description",
        "accepted description",
        "--dispositions-file",
        adjudication_path.to_str().expect("UTF-8 path"),
    ];
    let mut crashed = env
        .forged_cmd(&args)
        .env("FORGED_FAILPOINT", "work.adjudicate.revision.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("spawn adjudication");
    assert!(!crashed.wait().expect("adjudication crash").success());

    let ledger = env.ledger();
    let snapshot = ledger
        .work_item("atomic-adjudication")
        .expect("work lookup")
        .expect("work exists");
    assert_eq!(snapshot.revision, 1);
    assert!(ledger
        .work_revision("atomic-adjudication", 2)
        .expect("revision lookup")
        .is_none());
    assert!(ledger
        .list_work_notes("atomic-adjudication", Some(WorkNoteKind::Adjudication), 100)
        .expect("adjudication notes")
        .notes
        .is_empty());
    ledger.close().expect("close ledger");

    let retried = invoke(&env, &args);
    assert_eq!(retried["work"]["revision"], json!(2));
    assert_eq!(retried["note"]["revision"], json!(2));
}
