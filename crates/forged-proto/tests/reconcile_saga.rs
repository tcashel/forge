//! Criterion 7: the reconcile saga against a real ledger — kill
//! mid-implement, the zombie-result quarantine seam, two racing
//! reconcilers converging, and crash-resume from the durable `revoking`
//! marker.

mod support;

use std::collections::HashMap;
use std::sync::Arc;

use forged_ledger::{AttemptState, Ledger, NewPacket, NewRun, SpecFence};
use forged_proto::{
    land_packet_result, reconcile, widen_rfc3339, LandOutcome, LeaseReclaim, ReconcileConfig,
};
use forged_types::{RunId, Stage};
use support::*;

const RUN: &str = "run-1";

fn now_stamp() -> String {
    widen_rfc3339(&jiff::Timestamp::now().to_string())
}

fn config() -> ReconcileConfig {
    ReconcileConfig {
        stage_budget_s: HashMap::from([
            (Stage::Implement, 1800),
            (Stage::ReviewClaude, 1800),
            (Stage::ReviewCodex, 1800),
            (Stage::Fix, 1800),
        ]),
        termination_grace_s: 5,
        gate_commands: vec!["cargo test --workspace".to_owned()],
    }
}

/// A run with one open implement packet.
fn seed_run(ledger: &Ledger) -> String {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(RUN).expect("run id"),
            work_id: "bead-1".to_owned(),
            repo: "octo/demo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/x".to_owned(),
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
            policy_revision: None,
            body_json: stage_packet_body(1800),
        })
        .expect("open packet")
}

#[tokio::test]
async fn kill_mid_implement_revokes_and_the_same_packet_is_reclaimable() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    // The session is gone: default fake liveness is Vanished, the kill
    // verifies death, the scoped reclaim names the holder.
    let ports = FakePorts::new();
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.reclaimed, vec![claim.attempt_id]);
    assert!(report.deferred.is_empty());

    let attempt = ledger.get_attempt(claim.attempt_id).expect("get");
    assert_eq!(attempt.state, AttemptState::Reclaimed);

    // The saga order reached the external calls with the claimant verbatim.
    let calls = ports.recorded();
    assert!(calls
        .iter()
        .any(|c| matches!(c, PortCall::Liveness(s) if s == "claude:sess-a:1")));
    assert!(calls.iter().any(|c| matches!(
        c,
        PortCall::ReclaimLease { work, holder, older_than_s }
            if work == "bead-1" && holder == "claude:sess-a:1" && *older_than_s == 1500
    )));

    // The SAME packet is re-claimable by a successor; the packet id is
    // unchanged.
    let successor = ledger
        .claim_packet(
            &pid,
            "claude:sess-b:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("successor claim");
    assert_ne!(successor.attempt_id, claim.attempt_id);
    assert_eq!(
        ledger
            .get_attempt(successor.attempt_id)
            .expect("get")
            .packet_id,
        pid
    );
    ledger.close().expect("close");
}

#[tokio::test]
async fn zombie_completion_is_refused_and_quarantined_through_the_seam() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    let reclaim_ports = FakePorts::new();
    reconcile(&ledger, RUN, &reclaim_ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Reclaimed
    );

    // The zombie arrives with the revoked attempt's claim token. The
    // ledger's stale-token refusal is the trigger; the refused bytes go to
    // the quarantine port under the bare name `result.json`.
    let landing_ports = FakePorts::new();
    let result = result_for(&pid, implement_ok(5));
    let landed = land_packet_result(
        &ledger,
        &landing_ports,
        RUN,
        &pid,
        claim.attempt_id,
        &claim.claim_token,
        &result,
    )
    .await
    .expect("land");
    assert_eq!(landed, LandOutcome::Quarantined);

    let calls = landing_ports.recorded();
    let quarantines: Vec<_> = calls
        .iter()
        .filter(|c| matches!(c, PortCall::Quarantine { .. }))
        .collect();
    assert_eq!(quarantines.len(), 1, "exactly one quarantine call");
    let expected_body = serde_json::to_vec(&result).expect("serialize");
    assert_eq!(
        quarantines[0],
        &PortCall::Quarantine {
            run_id: RUN.to_owned(),
            attempt_id: claim.attempt_id,
            name: "result.json".to_owned(),
            body: expected_body,
        }
    );

    // The result never landed: the attempt is still reclaimed, not
    // completed.
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Reclaimed
    );
    ledger.close().expect("close");
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn racing_reconcilers_converge() {
    let dir = tempfile::tempdir().expect("tempdir");
    let db_path = dir.path().join("state.db");

    // Two INDEPENDENT handles — never two clones of one Ledger, whose
    // shared writer thread would serialize the race away.
    let ledger_a = Ledger::open(&db_path).expect("open a");
    let ledger_b = Ledger::open(&db_path).expect("open b");

    let claim = {
        let pid = seed_run(&ledger_a);
        ledger_a
            .claim_packet(
                &pid,
                "claude:sess-a:1",
                &SpecFence::Sha256("cafe".to_owned()),
            )
            .expect("claim")
    };

    let ports = Arc::new(FakePorts::new());
    let now = now_stamp();
    let cfg = config();

    let task = |ledger: Ledger, ports: Arc<FakePorts>, cfg: ReconcileConfig, now: String| {
        tokio::spawn(async move { reconcile(&ledger, RUN, &*ports, &cfg, &now).await })
    };
    let a = task(ledger_a, Arc::clone(&ports), cfg.clone(), now.clone());
    let b = task(ledger_b, Arc::clone(&ports), cfg.clone(), now.clone());
    let report_a = a.await.expect("join a").expect("reconcile a returns Ok");
    let report_b = b.await.expect("join b").expect("reconcile b returns Ok");

    // Convergence: the attempt reaches `reclaimed` exactly once, read back
    // from the ledger.
    let reader = Ledger::open(&db_path).expect("open reader");
    let attempt = reader.get_attempt(claim.attempt_id).expect("get");
    assert_eq!(attempt.state, AttemptState::Reclaimed);

    // At least one reconciler observed (or performed) the reclaim; every
    // report accounted for the attempt as reclaimed, deferred, or already
    // settled before it looked.
    let reported: Vec<i64> = report_a
        .reclaimed
        .iter()
        .chain(report_b.reclaimed.iter())
        .copied()
        .collect();
    assert!(
        reported.contains(&claim.attempt_id),
        "someone must report the reclaim: {report_a:?} {report_b:?}"
    );

    // Exactly-once external effect is deliberately NOT claimed: duplicate
    // kills are harmless by contract. At most two kill calls, of which at
    // most one returned Killed.
    let calls = ports.recorded();
    let kills: Vec<bool> = calls
        .iter()
        .filter_map(|c| match c {
            PortCall::KillConfirmed {
                returned_killed, ..
            } => Some(*returned_killed),
            _ => None,
        })
        .collect();
    assert!(
        kills.len() <= 2,
        "at most two kill_confirmed calls: {kills:?}"
    );
    assert!(
        kills.iter().filter(|k| **k).count() <= 1,
        "at most one Killed: {kills:?}"
    );
    reader.close().expect("close");
}

#[tokio::test]
async fn crash_resume_completes_the_saga_from_the_revoking_marker() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    // A reconciler crashed immediately after the durable revoke marker.
    ledger
        .revoke_attempt(claim.attempt_id, "hijacked")
        .expect("revoke");
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Revoking
    );

    // The restart resumes at step 2 (kill_confirmed) — the liveness ladder
    // is skipped entirely for a revoking row.
    let ports = FakePorts::new();
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.reclaimed, vec![claim.attempt_id]);
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Reclaimed
    );
    let calls = ports.recorded();
    assert!(
        !calls.iter().any(|c| matches!(c, PortCall::Liveness(_))),
        "a revoking row skips the liveness ladder: {calls:?}"
    );
    assert!(calls
        .iter()
        .any(|c| matches!(c, PortCall::KillConfirmed { .. })));
    ledger.close().expect("close");
}

#[tokio::test]
async fn an_already_released_lease_completes_the_saga_instead_of_deferring() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let pid = seed_run(&ledger);
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");
    ledger
        .revoke_attempt(claim.attempt_id, "operator stop")
        .expect("revoke");

    // bd reports a scoped reclaim that took the lease from NOBODY — the
    // shape returned when the lease is already gone: its TTL expired, an
    // operator reclaimed it by hand, or an earlier pass took it before
    // crashing. Death is confirmed by step 2 either way, so "process dead,
    // lease unheld" is the goal state and the saga must finish.
    let ports = FakePorts::new();
    ports
        .reclaim_script
        .lock()
        .expect("lock")
        .push_back(LeaseReclaim {
            scoped: true,
            previous_owner: None,
        });

    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(
        report.reclaimed,
        vec![claim.attempt_id],
        "an absent lease is the goal state, not a refusal"
    );
    assert!(
        report.deferred.is_empty(),
        "deferring here strands the attempt in revoking forever: no later \
         pass can make an absent lease reappear"
    );
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("get").state,
        AttemptState::Reclaimed
    );
    ledger.close().expect("close");
}
