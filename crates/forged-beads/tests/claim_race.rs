//! bd-gated claim-race integration tests. The races spawn RAW bd children
//! (deliberately NOT through the write lock — the lock serializes forged's
//! own writes in production; these tests exercise bd's CAS underneath it),
//! then assert the crate API's mapping of the settled state.

mod support;

use std::process::Stdio;

use forged_beads::{claim_ready, claim_specific, BdError};
use serde_json::Value;

/// Winner detection from a raw claim child's stdout: the envelope data's
/// first element must carry `assignee == actor`. Exit status is NOT trusted
/// (BUG-10: a refused claim has been observed exiting 0).
fn claim_won(stdout: &str, actor: &str) -> bool {
    let Ok(v) = serde_json::from_str::<Value>(stdout) else {
        return false;
    };
    let Some(data) = v.get("data") else {
        return false;
    };
    let first = match data {
        Value::Array(items) => match items.first() {
            Some(f) => f,
            None => return false,
        },
        Value::Object(_) => data,
        _ => return false,
    };
    first.get("assignee").and_then(Value::as_str) == Some(actor)
}

#[tokio::test]
async fn specific_claim_race_has_one_winner_and_api_maps_lease_held() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("claim-race");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let id = support::create_bead(&bd, &s, "race bead");

    // Race two RAW `bd update <id> --claim` children concurrently.
    let spawn = |actor: &str| {
        support::raw_bd(
            &bd,
            &s,
            &["update", &id, "--claim", "--actor", actor, "--json"],
        )
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawning raw claim child")
    };
    let c1 = spawn("racer-1");
    let c2 = spawn("racer-2");
    let o1 = c1.wait_with_output().expect("racer-1 output");
    let o2 = c2.wait_with_output().expect("racer-2 output");
    let s1 = String::from_utf8_lossy(&o1.stdout).into_owned();
    let s2 = String::from_utf8_lossy(&o2.stdout).into_owned();
    let w1 = claim_won(&s1, "racer-1");
    let w2 = claim_won(&s2, "racer-2");
    assert!(
        w1 ^ w2,
        "exactly one raw claim must win; racer-1 won={w1} racer-2 won={w2}\n\
         racer-1 stdout: {s1}\nracer-1 stderr: {}\nracer-2 stdout: {s2}\nracer-2 stderr: {}",
        String::from_utf8_lossy(&o1.stderr),
        String::from_utf8_lossy(&o2.stderr)
    );
    let loser_text = if w1 {
        format!("{s2}\n{}", String::from_utf8_lossy(&o2.stderr))
    } else {
        format!("{s1}\n{}", String::from_utf8_lossy(&o1.stderr))
    };
    assert!(
        loser_text.contains("already claimed") || loser_text.contains("already assigned"),
        "loser should see the claim-CAS refusal copy, got: {loser_text}"
    );

    // The crate's claim API for the same bead as a third actor: LeaseHeld.
    match claim_specific(&cfg, &id, "racer-3").await {
        Err(BdError::LeaseHeld { bead, .. }) => assert_eq!(bead, id),
        other => panic!("third-party claim must be LeaseHeld, got {other:?}"),
    }
}

#[tokio::test]
async fn frontier_claim_race_loser_gets_empty_result_and_api_maps_none() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("frontier-race");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let _id = support::create_bead(&bd, &s, "frontier bead");

    // Race two raw `bd ready --claim` children.
    let spawn = |actor: &str| {
        support::raw_bd(&bd, &s, &["ready", "--claim", "--actor", actor, "--json"])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("spawning raw frontier claim child")
    };
    let c1 = spawn("frontier-1");
    let c2 = spawn("frontier-2");
    let o1 = c1.wait_with_output().expect("frontier-1 output");
    let o2 = c2.wait_with_output().expect("frontier-2 output");
    let s1 = String::from_utf8_lossy(&o1.stdout).into_owned();
    let s2 = String::from_utf8_lossy(&o2.stdout).into_owned();
    let w1 = claim_won(&s1, "frontier-1");
    let w2 = claim_won(&s2, "frontier-2");
    assert!(
        w1 ^ w2,
        "exactly one frontier claim must win; f1 won={w1} f2 won={w2}\nf1: {s1}\nf2: {s2}"
    );
    // The loser gets the empty-result/no-error outcome: exit 0, empty data,
    // no double claim.
    let (loser_out, loser_stdout) = if w1 { (&o2, &s2) } else { (&o1, &s1) };
    assert!(
        loser_out.status.success(),
        "race loser must not error; stderr: {}",
        String::from_utf8_lossy(&loser_out.stderr)
    );
    let loser_v: Value = serde_json::from_str(loser_stdout).expect("loser envelope");
    let empty = match loser_v.get("data") {
        Some(Value::Null) | None => true,
        Some(Value::Array(items)) => items.is_empty(),
        _ => false,
    };
    assert!(empty, "race loser must get empty data, got: {loser_stdout}");

    // The API's frontier claim on the now-empty frontier: Ok(None).
    let third = claim_ready(&cfg, "frontier-3")
        .await
        .expect("frontier claim");
    assert!(
        third.is_none(),
        "empty frontier must be Ok(None), got {third:?}"
    );
}
