//! Criterion 9: harvest-and-verify. A harvested `Outcome::Implement` claim
//! from a revoked attempt is a claim to check, never a result to trust —
//! the recomputed `commits_ahead` and re-run gates decide, and mismatches
//! land in `ReconcileReport::harvest_mismatches`.

mod support;

use std::collections::HashMap;

use forged_ledger::{Ledger, NewPacket, NewRun, SpecFence};
use forged_proto::{land_packet_result, reconcile, widen_rfc3339, LandOutcome, ReconcileConfig};
use forged_types::{Outcome, RunId, Stage};
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
        gate_commands: vec!["cargo test --workspace".to_owned()],
    }
}

#[tokio::test]
async fn harvested_implement_claim_is_verified_not_trusted() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    ledger
        .create_run(NewRun {
            run_id: RunId::new(RUN).expect("run id"),
            bead_id: "bead-1".to_owned(),
            repo: "octo/demo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/x".to_owned(),
        })
        .expect("create run");
    let pid = ledger
        .open_packet(NewPacket {
            run_id: RUN.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    // Pass 1: the session vanished; the attempt is revoked and reclaimed.
    let pass1_ports = FakePorts::new();
    reconcile(&ledger, RUN, &pass1_ports, &config(), &now_stamp())
        .await
        .expect("pass 1");

    // The zombie's claim arrives: implemented, five commits, gates passing.
    // The fence refuses it and the claim is harvested through quarantine.
    let landing_ports = FakePorts::new();
    let claimed_result = result_for(&pid, implement_ok(5));
    let landed = land_packet_result(
        &ledger,
        &landing_ports,
        RUN,
        &pid,
        claim.attempt_id,
        &claim.claim_token,
        &claimed_result,
    )
    .await
    .expect("land");
    assert_eq!(landed, LandOutcome::Quarantined);

    // Pass 2: ground truth disagrees on both counts — the worktree has 3
    // commits and the re-run gates fail.
    let pass2_ports = FakePorts::new();
    pass2_ports
        .commits_script
        .lock()
        .expect("lock")
        .push_back(3);
    pass2_ports
        .gates_script
        .lock()
        .expect("lock")
        .push_back(vec![gate_row(1)]);
    let report = reconcile(&ledger, RUN, &pass2_ports, &config(), &now_stamp())
        .await
        .expect("pass 2");

    assert_eq!(
        report.harvest_mismatches.len(),
        2,
        "commits and gates both mismatch: {:?}",
        report.harvest_mismatches
    );
    assert!(
        report.harvest_mismatches[0].contains("claimed 5 commits ahead")
            && report.harvest_mismatches[0].contains("worktree has 3"),
        "{:?}",
        report.harvest_mismatches
    );

    // The verification recomputed, never trusted: both ground-truth ports
    // were consulted with the configured gate commands.
    let calls = pass2_ports.recorded();
    assert!(calls
        .iter()
        .any(|c| matches!(c, PortCall::CommitsAhead(r) if r == RUN)));
    assert!(calls.iter().any(|c| matches!(
        c,
        PortCall::RerunGates { run_id, commands }
            if run_id == RUN && commands == &config().gate_commands
    )));
    ledger.close().expect("close");
}

// Quarantine events are a growing history that every later pass replays.
// Ground truth is run-scoped — both ports take only the run — so a pass
// establishes it once, however many claims it is checking, and reports each
// distinct mismatch once. Re-running the gates per historical event would
// make reconcile cost more the longer a run has been alive.
#[tokio::test]
async fn a_pass_checks_the_history_against_ground_truth_established_once() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    ledger
        .create_run(NewRun {
            run_id: RunId::new(RUN).expect("run id"),
            bead_id: "bead-1".to_owned(),
            repo: "octo/demo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/x".to_owned(),
        })
        .expect("create run");

    // Two revoked attempts on two packets, each landing a zombie claim.
    let mut attempts = Vec::new();
    for (stage, seq) in [(Stage::Implement, 1), (Stage::Implement, 2)] {
        let pid = ledger
            .open_packet(NewPacket {
                run_id: RUN.to_owned(),
                stage,
                seq,
                spec_path: "spec.md".to_owned(),
                spec_sha256: "cafe".to_owned(),
                spec_revision: None,
                body_json: "{}".to_owned(),
            })
            .expect("open packet");
        let claim = ledger
            .claim_packet(
                &pid,
                &format!("claude:sess-{seq}:1"),
                &SpecFence::Sha256("cafe".to_owned()),
            )
            .expect("claim");
        let ports = FakePorts::new();
        reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
            .await
            .expect("reconcile");
        land_packet_result(
            &ledger,
            &ports,
            RUN,
            &pid,
            claim.attempt_id,
            &claim.claim_token,
            &result_for(&pid, implement_ok(5)),
        )
        .await
        .expect("land");
        attempts.push(claim.attempt_id);
    }

    // A later pass replays both quarantine events against one recomputation.
    let ports = FakePorts::new();
    ports.commits_script.lock().expect("lock").push_back(3);
    ports
        .gates_script
        .lock()
        .expect("lock")
        .push_back(vec![gate_row(1)]);
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("pass");

    let calls = ports.recorded();
    assert_eq!(
        calls
            .iter()
            .filter(|c| matches!(c, PortCall::CommitsAhead(_)))
            .count(),
        1,
        "ground truth is recomputed once per pass: {calls:?}"
    );
    assert_eq!(
        calls
            .iter()
            .filter(|c| matches!(c, PortCall::RerunGates { .. }))
            .count(),
        1,
        "the gates are re-run once per pass, not once per historical claim: {calls:?}"
    );

    // One commits line and one gate line per attempt, no repeats.
    assert_eq!(
        report.harvest_mismatches.len(),
        4,
        "{:?}",
        report.harvest_mismatches
    );
    for attempt_id in attempts {
        assert_eq!(
            report
                .harvest_mismatches
                .iter()
                .filter(|m| m.contains(&format!("attempt {attempt_id} ")))
                .count(),
            2,
            "{:?}",
            report.harvest_mismatches
        );
    }
    ledger.close().expect("close");
}

#[tokio::test]
async fn matching_ground_truth_records_no_mismatch() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    ledger
        .create_run(NewRun {
            run_id: RunId::new(RUN).expect("run id"),
            bead_id: "bead-1".to_owned(),
            repo: "octo/demo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/x".to_owned(),
        })
        .expect("create run");
    let pid = ledger
        .open_packet(NewPacket {
            run_id: RUN.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    let ports = FakePorts::new();
    reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("pass 1");
    land_packet_result(
        &ledger,
        &ports,
        RUN,
        &pid,
        claim.attempt_id,
        &claim.claim_token,
        &result_for(&pid, implement_ok(5)),
    )
    .await
    .expect("land");

    let verify_ports = FakePorts::new();
    verify_ports
        .commits_script
        .lock()
        .expect("lock")
        .push_back(5);
    verify_ports
        .gates_script
        .lock()
        .expect("lock")
        .push_back(vec![gate_row(0)]);
    let report = reconcile(&ledger, RUN, &verify_ports, &config(), &now_stamp())
        .await
        .expect("pass 2");
    assert!(
        report.harvest_mismatches.is_empty(),
        "{:?}",
        report.harvest_mismatches
    );
    ledger.close().expect("close");
}

#[tokio::test]
async fn legacy_gate_prose_is_unknown_and_does_not_rerun_or_mismatch_gates() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    ledger
        .create_run(NewRun {
            run_id: RunId::new(RUN).expect("run id"),
            bead_id: "bead-1".to_owned(),
            repo: "octo/demo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/x".to_owned(),
        })
        .expect("create run");
    let pid = ledger
        .open_packet(NewPacket {
            run_id: RUN.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    let revoke_ports = FakePorts::new();
    reconcile(&ledger, RUN, &revoke_ports, &config(), &now_stamp())
        .await
        .expect("revoke stale attempt");
    let legacy_result = result_for(
        &pid,
        Outcome::Implement {
            implemented: true,
            commits_ahead: 5,
            summary: "legacy stored claim".to_owned(),
            gate_state: Some("all five gates pass: build, test, clippy, fmt, docs".to_owned()),
            note: None,
        },
    );
    assert_eq!(
        land_packet_result(
            &ledger,
            &revoke_ports,
            RUN,
            &pid,
            claim.attempt_id,
            &claim.claim_token,
            &legacy_result,
        )
        .await
        .expect("quarantine legacy result"),
        LandOutcome::Quarantined
    );

    let verify_ports = FakePorts::new();
    verify_ports
        .commits_script
        .lock()
        .expect("lock")
        .push_back(5);
    let report = reconcile(&ledger, RUN, &verify_ports, &config(), &now_stamp())
        .await
        .expect("verify legacy claim");
    assert!(
        report.harvest_mismatches.is_empty(),
        "legacy unknown gate claims cannot mismatch: {:?}",
        report.harvest_mismatches
    );
    let calls = verify_ports.recorded();
    assert_eq!(
        calls
            .iter()
            .filter(|call| matches!(call, PortCall::CommitsAhead(_)))
            .count(),
        1,
        "commit claims are still verified: {calls:?}"
    );
    assert!(
        calls
            .iter()
            .all(|call| !matches!(call, PortCall::RerunGates { .. })),
        "no closed gate claim means no gate re-run: {calls:?}"
    );
    ledger.close().expect("close");
}
