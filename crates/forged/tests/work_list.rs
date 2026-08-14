//! `work list` — the discovery surface. An empty ledger enumerates to an
//! empty list rather than refusing, an epic is discoverable from its
//! `forged.epic.started` event ALONE (no forged path writes a `runs` row for
//! an epic), and live seats are counted per run from one scan of every live
//! attempt.

mod support;

use serde_json::{json, Value};
use support::{fabricate_epic, fabricate_run, TestEnv};

/// Hash a file the way `claim_packet` demands the caller hash it.
fn sha256_hex(path: &std::path::Path) -> String {
    use sha2::Digest as _;
    let bytes = std::fs::read(path).expect("spec bytes");
    sha2::Sha256::digest(&bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
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
    fabricate_run(&env, "wl-slice");
    fabricate_epic(&env, "wl-epic");

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

    // An epic has no run row at all, so it is listed only if `work list`
    // reads the start event as a source of inventory, not just as a label.
    let epic = entry(&response, "wl-epic");
    assert_eq!(epic["kind"], json!("epic"));
    assert_eq!(epic["beadId"], json!("wl-epic"));
    assert_eq!(epic["repo"], json!(env.repos.repo.to_string_lossy()));
    assert_eq!(epic["branch"], json!("forged/epic-wl-epic"));
    assert_eq!(epic["state"], json!("active"));
    assert_eq!(epic["stopReason"], Value::Null);
    assert!(epic["createdAt"].is_string(), "createdAt: {epic}");
    assert_eq!(epic["updatedAt"], epic["createdAt"]);
    assert_eq!(epic["liveSeats"], json!(0));
    assert_eq!(epic["costUsdKnown"], json!(0.0));
    assert_eq!(epic["rowsMissingCost"], json!(0));
}

#[test]
fn live_seats_are_counted_per_run() {
    let env = TestEnv::new("forged-work-list-seats");
    env.forged(&["init"]);
    fabricate_run(&env, "wl-busy");
    fabricate_run(&env, "wl-idle");
    fabricate_live_seats(&env, "wl-busy", 2);

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    assert_eq!(entry(&response, "wl-busy")["liveSeats"], json!(2));
    assert_eq!(entry(&response, "wl-idle")["liveSeats"], json!(0));
}

/// The production path, end to end: `epic start` appends
/// `forged.epic.started` and writes NO run row, so an inventory built from
/// `list_runs()` alone would list the epic nowhere.
#[test]
fn a_started_epic_is_listed_though_it_has_no_run_row() {
    let env = TestEnv::new("forged-work-list-epic-start");
    env.seed_epic("epic-list", &[("child-list", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-list",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    // The started epic is the whole inventory: no child has run yet, and the
    // epic itself never gets a run row.
    assert_eq!(runs_of(&response).len(), 1);
    let epic = entry(&response, "epic-list");
    assert_eq!(epic["kind"], json!("epic"));
    assert_eq!(epic["beadId"], json!("epic-list"));
    assert_eq!(epic["repo"], json!(repo));
    assert_eq!(epic["branch"], json!("forged/epic-epic-list"));
    assert_eq!(epic["liveSeats"], json!(0));
}
