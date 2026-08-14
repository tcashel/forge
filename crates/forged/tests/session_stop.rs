//! `session stop` through the operation layer an operator actually calls.
//!
//! The proto-level tests prove the transition; these prove the WIRING —
//! the derived key, the response shape, the reconcile pass that still
//! settles interrupted operations, and the one criterion no fake can speak
//! to: the bd lease is in the same hands after the stop as before it, and a
//! successor claims the packet with no waiting period.

mod support;

use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

const RUN: &str = "ss-run";
/// `fabricate_run` names the bead after the run.
const BEAD: &str = "bead-ss-run";
/// The bd LEASE holder: bead-scoped, `0` pid segment, shared by every
/// generation of the run.
const HOLDER: &str = "forged:bead-ss-run:0";

fn sha256_hex(path: &std::path::Path) -> String {
    use sha2::Digest as _;
    let bytes = std::fs::read(path).expect("spec bytes");
    sha2::Sha256::digest(&bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

/// One open packet carrying one live attempt — the ledger shape a claimed
/// seat leaves behind. Returns the packet and its attempt.
fn seat(env: &TestEnv) -> (String, i64, forged_ledger::SpecFence) {
    let ledger = env.ledger();
    let sha = sha256_hex(&env.spec);
    let packet_id = ledger
        .open_packet(forged_ledger::NewPacket {
            run_id: RUN.to_owned(),
            stage: forged_types::Stage::Implement,
            seq: 1,
            spec_path: env.spec.to_string_lossy().into_owned(),
            spec_sha256: sha.clone(),
            spec_revision: None,
            body_json: json!({"fabricated": true}).to_string(),
        })
        .expect("open packet");
    let fence = forged_ledger::SpecFence::Sha256(sha);
    let claim = ledger
        .claim_packet(&packet_id, &format!("claude:{packet_id}:4242"), &fence)
        .expect("claim packet");
    ledger.close().expect("close");
    (packet_id, claim.attempt_id, fence)
}

/// The bd shim calls made since `from`.
fn bd_calls_since(env: &TestEnv, from: usize) -> Vec<String> {
    env.bd_calls().split_off(from)
}

#[test]
fn a_session_stop_settles_the_attempt_and_leaves_the_bd_lease_where_it_was() {
    let env = TestEnv::new("forged-session-stop");
    env.forged(&["init"]);
    fabricate_run(&env, RUN);
    let (packet_id, attempt_id, fence) = seat(&env);

    // The lease as bd holds it before the stop: taken under the run holder,
    // and young enough that a scoped reclaim would refuse it anyway.
    env.set_assignee(BEAD, HOLDER);
    env.set_lease_unexpired(BEAD);
    let before = env.bd_calls().len();

    let (code, response) = env.forged(&[
        "session",
        "stop",
        "--attempt",
        &attempt_id.to_string(),
        "--reason",
        "operator requested",
    ]);
    assert_eq!(code, 0, "session stop: {response}");
    assert_eq!(response["ok"], json!(true), "{response}");
    let result = &response["result"];
    assert_eq!(result["attemptId"], json!(attempt_id), "{response}");
    assert_eq!(result["runId"], json!(RUN), "{response}");
    assert_eq!(result["state"], json!("stopped"), "{response}");
    // The reconcile report is part of the established response shape and
    // stays there: the kill takes the claimant's whole process group, so
    // `settle_operations` still has to run, and the report is what it says.
    assert_eq!(
        result["report"]["stopped"],
        json!([attempt_id]),
        "the pass reports the stop it just made: {response}"
    );
    assert_eq!(result["report"]["reclaimed"], json!([]), "{response}");
    assert!(
        result["report"]["released"].is_array(),
        "the full report shape survives: {response}"
    );

    let ledger = env.ledger();
    let row = ledger.get_attempt(attempt_id).expect("attempt");
    assert_eq!(row.state, forged_ledger::AttemptState::Stopped);
    assert_eq!(row.revoke_reason.as_deref(), Some("operator requested"));
    // The marker recorded WHOSE revocation it was, which is what keeps a
    // later reconcile from finishing it through the bead-scoped reclaim.
    assert_eq!(
        row.revoke_scope,
        Some(forged_ledger::RevokeScope::Attempt),
        "an operator stop marks the revocation attempt-scoped"
    );

    // THE POINT OF THE CHANGE: no lease had to age out, so the successor
    // claims immediately — under the same, still-held `run_holder`.
    let successor = ledger
        .claim_packet(&packet_id, "claude:ss-successor:4343", &fence)
        .expect("a stop leaves the packet claimable at once");
    assert_ne!(successor.attempt_id, attempt_id);
    assert_eq!(
        ledger
            .get_attempt(successor.attempt_id)
            .expect("successor")
            .state,
        forged_ledger::AttemptState::Running
    );
    ledger.close().expect("close");

    // The lease is exactly where it was. Nothing asked bd to reclaim it, and
    // the assignee bd reports is unchanged.
    let calls = bd_calls_since(&env, before);
    assert!(
        !calls.iter().any(|c| c.contains("reclaim")),
        "an attempt-local stop must not reclaim the bead's lease: {calls:?}"
    );
    assert_eq!(
        env.assignee(BEAD).as_deref(),
        Some(HOLDER),
        "the bd lease holder is unchanged by an attempt stop"
    );
}

#[test]
fn a_repeated_session_stop_replays_under_the_derived_key() {
    let env = TestEnv::new("forged-session-stop-replay");
    env.forged(&["init"]);
    fabricate_run(&env, RUN);
    let (_, attempt_id, _) = seat(&env);
    env.set_assignee(BEAD, HOLDER);

    let stop = |env: &TestEnv| -> (i32, Value) {
        env.forged(&[
            "session",
            "stop",
            "--attempt",
            &attempt_id.to_string(),
            "--reason",
            "operator requested",
        ])
    };
    let (code, first) = stop(&env);
    assert_eq!(code, 0, "first stop: {first}");
    let before = env.bd_calls().len();
    let (code, second) = stop(&env);
    assert_eq!(code, 0, "second stop: {second}");

    // No key supplied, so the key is derived from the operation and the
    // attempt: the second call is the SAME operation, replayed verbatim
    // rather than re-run.
    assert_eq!(
        first["operationId"], second["operationId"],
        "the derived key is stable across calls: {first} vs {second}"
    );
    assert_eq!(first["result"], second["result"], "a replay is verbatim");
    assert_eq!(
        (first["reused"].clone(), second["reused"].clone()),
        (json!(false), json!(true)),
        "the second call is the stored outcome, not a second stop"
    );
    assert!(
        bd_calls_since(&env, before).is_empty(),
        "a replay fires no external effect: {:?}",
        bd_calls_since(&env, before)
    );
}

#[test]
fn forged_reconcile_reports_a_stopped_attempt_without_resuming_the_saga() {
    let env = TestEnv::new("forged-session-stop-reconcile");
    env.forged(&["init"]);
    fabricate_run(&env, RUN);
    let (_, attempt_id, _) = seat(&env);
    env.set_assignee(BEAD, HOLDER);
    env.set_lease_unexpired(BEAD);

    let (code, stopped) = env.forged(&[
        "session",
        "stop",
        "--attempt",
        &attempt_id.to_string(),
        "--reason",
        "operator requested",
    ]);
    assert_eq!(code, 0, "session stop: {stopped}");

    // The operator's own recovery command, run over a run whose only attempt
    // an operator stopped. It must say so, and it must not reach for the
    // lease on that attempt's behalf.
    let before = env.bd_calls().len();
    let (code, response) = env.forged(&["reconcile", "--run", RUN]);
    assert_eq!(code, 0, "reconcile: {response}");
    let report = &response["result"]["report"];
    assert_eq!(report["stopped"], json!([attempt_id]), "{response}");
    assert_eq!(report["reclaimed"], json!([]), "{response}");
    assert_eq!(report["deferred"], json!([]), "{response}");
    assert_eq!(report["leftRunning"], json!([]), "{response}");

    let calls = bd_calls_since(&env, before);
    assert!(
        !calls.iter().any(|c| c.contains("reclaim")),
        "reconcile must not resume the saga for a stopped attempt: {calls:?}"
    );
    assert_eq!(env.assignee(BEAD).as_deref(), Some(HOLDER));
    let ledger = env.ledger();
    assert_eq!(
        ledger.get_attempt(attempt_id).expect("attempt").state,
        forged_ledger::AttemptState::Stopped
    );
    ledger.close().expect("close");
}
