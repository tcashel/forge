//! The attempt-local stop: `revoking → stopped`, fenced by confirmed death
//! and reclaiming no bd lease.
//!
//! The lease is bead-scoped — `run_holder` is the same string for every
//! generation of a run — so these tests assert the absence of
//! `reclaim_lease` as hard as they assert the presence of `kill_confirmed`.

mod support;

use std::collections::HashMap;

use forged_ledger::{AttemptState, Ledger, NewPacket, NewRun, SpecFence};
use forged_proto::{reconcile, stop_attempt, PortError, ProtoError, ReconcileConfig};
use forged_types::{RunId, Stage};
use support::*;

const RUN: &str = "run-stop";

fn config() -> ReconcileConfig {
    ReconcileConfig {
        stage_budget_s: HashMap::from([
            (Stage::Implement, 1800),
            (Stage::ReviewClaude, 1800),
            (Stage::ReviewCodex, 1800),
            (Stage::Fix, 1800),
        ]),
        gate_commands: Vec::new(),
    }
}

/// A run with one open implement packet.
fn seed_run(ledger: &Ledger) -> String {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(RUN).expect("run id"),
            bead_id: "bead-stop".to_owned(),
            repo: "octo/demo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/stop".to_owned(),
        })
        .expect("create run");
    ledger
        .open_packet(NewPacket {
            run_id: RUN.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("open packet")
}

fn fence() -> SpecFence {
    SpecFence::Sha256("cafe".to_owned())
}

fn reclaimed_a_lease(calls: &[PortCall]) -> bool {
    calls
        .iter()
        .any(|c| matches!(c, PortCall::ReclaimLease { .. }))
}

#[tokio::test]
async fn an_operator_stop_settles_terminally_without_reclaiming_the_lease() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(&pid, "claude:sess-a:1", &fence())
        .expect("claim");
    ledger
        .revoke_attempt(claim.attempt_id, "operator requested")
        .expect("revoke");

    let ports = FakePorts::new();
    stop_attempt(&ledger, &ports, claim.attempt_id)
        .await
        .expect("stop");

    let attempt = ledger.get_attempt(claim.attempt_id).expect("get");
    assert_eq!(attempt.state, AttemptState::Stopped);
    assert!(attempt.ended_at.is_some(), "a terminal row is ended");
    // The revocation reason survives the transition, so a reader knows why.
    assert_eq!(attempt.revoke_reason.as_deref(), Some("operator requested"));

    let calls = ports.recorded();
    assert!(
        calls
            .iter()
            .any(|c| matches!(c, PortCall::KillConfirmed { session, .. }
                if session == "claude:sess-a:1")),
        "confirmed death is still the fence: {calls:?}"
    );
    assert!(
        !reclaimed_a_lease(&calls),
        "an attempt-local stop must not touch the bead lease: {calls:?}"
    );
    assert!(
        !calls.iter().any(|c| matches!(c, PortCall::Liveness(_))),
        "a revoking row skips the liveness ladder: {calls:?}"
    );
    ledger.close().expect("close");
}

#[tokio::test]
async fn a_successor_claims_the_same_packet_immediately_after_a_stop() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(&pid, "claude:sess-a:1", &fence())
        .expect("claim");
    ledger
        .revoke_attempt(claim.attempt_id, "operator requested")
        .expect("revoke");

    let ports = FakePorts::new();
    stop_attempt(&ledger, &ports, claim.attempt_id)
        .await
        .expect("stop");

    // THE POINT OF THE CHANGE: no lease was taken and none has to age out,
    // so the successor claims now rather than after the reclaim window.
    let successor = ledger
        .claim_packet(&pid, "claude:sess-b:1", &fence())
        .expect("a stop leaves the packet claimable at once");
    assert_ne!(successor.attempt_id, claim.attempt_id);
    let row = ledger.get_attempt(successor.attempt_id).expect("get");
    assert_eq!(row.packet_id, pid);
    assert_eq!(row.state, AttemptState::Running);
    assert!(
        !reclaimed_a_lease(&ports.recorded()),
        "the successor inherits the untouched lease"
    );
    ledger.close().expect("close");
}

#[tokio::test]
async fn a_stop_that_cannot_confirm_death_stays_revoking() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(&pid, "claude:sess-a:1", &fence())
        .expect("claim");
    ledger
        .revoke_attempt(claim.attempt_id, "operator requested")
        .expect("revoke");

    let ports = FakePorts::new();
    *ports.kill_failure.lock().expect("lock") =
        Some(PortError::Unavailable("no sentinel to read".to_owned()));
    let error = stop_attempt(&ledger, &ports, claim.attempt_id)
        .await
        .expect_err("unverified death must not settle the attempt");
    assert!(
        matches!(&error, ProtoError::Port { attempt_id, step, .. }
            if *attempt_id == claim.attempt_id && step == "kill_confirmed"),
        "unexpected error: {error}"
    );

    // The durable marker is what the next pass resumes from.
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Revoking
    );
    // And the packet is NOT claimable while a live attempt may still run.
    ledger
        .claim_packet(&pid, "claude:sess-b:1", &fence())
        .expect_err("a revoking attempt still holds the packet");
    ledger.close().expect("close");
}

#[tokio::test]
async fn a_stop_refuses_an_unrevoked_attempt_before_killing_anything() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(&pid, "claude:sess-a:1", &fence())
        .expect("claim");

    // No durable `revoking` marker: the order is not negotiable.
    let ports = FakePorts::new();
    stop_attempt(&ledger, &ports, claim.attempt_id)
        .await
        .expect_err("stopping a running attempt is refused");
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Running
    );
    assert!(
        ports.recorded().is_empty(),
        "nothing external may fire before the marker: {:?}",
        ports.recorded()
    );
    ledger.close().expect("close");
}

#[tokio::test]
async fn a_repeated_stop_converges_on_the_terminal_row() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(&pid, "claude:sess-a:1", &fence())
        .expect("claim");
    ledger
        .revoke_attempt(claim.attempt_id, "operator requested")
        .expect("revoke");

    let ports = FakePorts::new();
    stop_attempt(&ledger, &ports, claim.attempt_id)
        .await
        .expect("first stop");
    stop_attempt(&ledger, &ports, claim.attempt_id)
        .await
        .expect("a second stop converges rather than refusing");
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Stopped
    );
    assert!(
        !reclaimed_a_lease(&ports.recorded()),
        "neither pass touches the lease"
    );
    ledger.close().expect("close");
}

#[tokio::test]
async fn reconcile_leaves_a_stopped_attempt_alone() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(&pid, "claude:sess-a:1", &fence())
        .expect("claim");
    ledger
        .revoke_attempt(claim.attempt_id, "operator requested")
        .expect("revoke");
    let stop_ports = FakePorts::new();
    stop_attempt(&ledger, &stop_ports, claim.attempt_id)
        .await
        .expect("stop");

    // A stopped attempt is terminal: the saga has nothing left to resume for
    // it, and in particular does not reach for the lease on its behalf.
    let ports = FakePorts::new();
    let report = reconcile(
        &ledger,
        RUN,
        &ports,
        &config(),
        "2026-08-14T00:00:00.000000000Z",
    )
    .await
    .expect("reconcile");
    assert!(report.reclaimed.is_empty(), "{report:?}");
    assert!(report.deferred.is_empty(), "{report:?}");
    assert!(report.left_running.is_empty(), "{report:?}");
    assert!(
        !reclaimed_a_lease(&ports.recorded()),
        "reconcile must not reclaim for a stopped attempt: {:?}",
        ports.recorded()
    );
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Stopped
    );

    // The stop is readable as terminal history, distinguishable from a
    // reclaim: "an operator stopped this", not "the saga took a dead worker".
    let view = forged_proto::project_run(
        &ledger,
        RUN,
        full_roster(),
        Vec::new(),
        2,
        "2026-08-14T00:00:00.000000000Z",
    )
    .expect("project");
    let history = view.terminal_attempts.get(&pid).expect("history");
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].attempt_id, claim.attempt_id);
    assert_eq!(history[0].state, AttemptState::Stopped);
    ledger.close().expect("close");
}
