//! `work list` — the discovery surface. An empty ledger enumerates to an
//! empty list rather than refusing, an epic run is told apart from a slice
//! run by its `forged.epic.started` event, and live seats are counted per
//! run from one scan of every live attempt.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

/// Hash a file the way `claim_packet` demands the caller hash it.
fn sha256_hex(path: &std::path::Path) -> String {
    use sha2::Digest as _;
    let bytes = std::fs::read(path).expect("spec bytes");
    sha2::Sha256::digest(&bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

/// Create a bare run row. `epic` appends the `forged.epic.started` event
/// that is the ONLY signal separating an epic run from a slice run.
fn fabricate_run(env: &TestEnv, run_id: &str, epic: bool) {
    let ledger = env.ledger();
    ledger
        .create_run(forged_ledger::NewRun {
            run_id: forged_types::RunId::new(run_id).expect("run id"),
            bead_id: format!("bead-{run_id}"),
            repo: env.repos.repo.to_string_lossy().into_owned(),
            base_ref: env.repos.base.clone(),
            branch: format!("forged/{run_id}"),
        })
        .expect("create run");
    if epic {
        ledger
            .append_event(
                Some(run_id),
                "forged.epic.started",
                json!({"runId": run_id, "epic": run_id}),
            )
            .expect("epic started event");
    }
    ledger.close().expect("close");
}

/// Open `count` packets on `run_id` and leave each with a live attempt.
/// One packet per seat: `claim_packet` refuses a second live attempt on a
/// packet that already has one.
fn fabricate_live_seats(env: &TestEnv, run_id: &str, count: i64) {
    let ledger = env.ledger();
    let sha = sha256_hex(&env.spec);
    for seq in 1..=count {
        let packet_id = ledger
            .open_packet(forged_ledger::NewPacket {
                run_id: run_id.to_owned(),
                stage: forged_types::Stage::Implement,
                seq,
                spec_path: env.spec.to_string_lossy().into_owned(),
                spec_sha256: sha.clone(),
                body_json: json!({"fabricated": true}).to_string(),
            })
            .expect("open packet");
        ledger
            .claim_packet(&packet_id, &format!("forged:{packet_id}:0"), &sha)
            .expect("claim packet");
    }
    ledger.close().expect("close");
}

fn runs_of(envelope: &Value) -> Vec<Value> {
    envelope["result"]["runs"]
        .as_array()
        .cloned()
        .unwrap_or_else(|| panic!("work list returns a runs array: {envelope}"))
}

fn entry(envelope: &Value, run_id: &str) -> Value {
    runs_of(envelope)
        .into_iter()
        .find(|r| r["id"] == json!(run_id))
        .unwrap_or_else(|| panic!("work list lists {run_id}: {envelope}"))
}

#[test]
fn an_empty_ledger_enumerates_to_an_empty_list() {
    let env = TestEnv::new("forged-work-list-empty");
    env.forged(&["init"]);
    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    assert_eq!(response["ok"], json!(true));
    assert_eq!(response["result"], json!({"runs": []}));
    // No id in, no InvalidRequest out.
    assert_eq!(response["error"], Value::Null);
}

#[test]
fn a_slice_and_an_epic_are_labelled_by_their_events() {
    let env = TestEnv::new("forged-work-list-kind");
    env.forged(&["init"]);
    fabricate_run(&env, "wl-slice", false);
    fabricate_run(&env, "wl-epic", true);

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    assert_eq!(runs_of(&response).len(), 2);

    let slice = entry(&response, "wl-slice");
    assert_eq!(slice["kind"], json!("slice"));
    assert_eq!(slice["beadId"], json!("bead-wl-slice"));
    assert_eq!(slice["branch"], json!("forged/wl-slice"));
    assert_eq!(slice["repo"], json!(env.repos.repo.to_string_lossy()));
    assert_eq!(slice["state"], json!("active"));
    assert_eq!(slice["stopReason"], Value::Null);
    assert!(slice["createdAt"].is_string(), "createdAt: {slice}");
    assert!(slice["updatedAt"].is_string(), "updatedAt: {slice}");
    // A run with no live attempt reports zero seats, not null.
    assert_eq!(slice["liveSeats"], json!(0));
    // A run with no usage rows costs zero — absent usage is data.
    assert_eq!(slice["costUsdKnown"], json!(0.0));
    assert_eq!(slice["rowsMissingCost"], json!(0));

    assert_eq!(entry(&response, "wl-epic")["kind"], json!("epic"));
}

#[test]
fn live_seats_are_counted_per_run() {
    let env = TestEnv::new("forged-work-list-seats");
    env.forged(&["init"]);
    fabricate_run(&env, "wl-busy", false);
    fabricate_run(&env, "wl-idle", false);
    fabricate_live_seats(&env, "wl-busy", 2);

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    assert_eq!(entry(&response, "wl-busy")["liveSeats"], json!(2));
    assert_eq!(entry(&response, "wl-idle")["liveSeats"], json!(0));
}
