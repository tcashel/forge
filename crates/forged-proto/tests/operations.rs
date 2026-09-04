//! Criterion 8: interrupted operations, one per `EffectClass` — `SafeRetry`
//! is released and redone, `ObserveOnly` is settled by observation via
//! `resolve_interrupted_operation`, `HumanAmbiguous` is quarantined and
//! left in progress.
//!
//! Plus the two crash windows in which a machine step *looks* done and is
//! not: a crash between the request event and `begin_operation`, and a
//! `SafeRetry` row released for redo. Only a terminal operation row settles
//! a step, and these prove it end to end through `project_run` and
//! `advance`.

mod support;

use std::collections::HashMap;

use forged_ledger::{
    AttemptState, EffectClass, Ledger, NewPacket, NewRun, OperationOutcome, OperationState,
    RevokeScope, SpecFence,
};
use forged_proto::{
    advance, project_run, reconcile, record, stage_deadline_at, stage_deadline_reached,
    widen_rfc3339, GatePhase, MachineStage, NextAction, PrSnapshot, ProtoEvent, ReconcileConfig,
    SessionLiveness,
};
use forged_types::{OperationRequest, OperationResponse, RunId, Stage};
use support::*;

const RUN: &str = "run-1";

fn now_stamp() -> String {
    widen_rfc3339(&jiff::Timestamp::now().to_string())
}

fn seconds_after(anchor: &str, seconds: i64) -> String {
    let timestamp = anchor.parse::<jiff::Timestamp>().expect("timestamp");
    widen_rfc3339(
        &timestamp
            .checked_add(jiff::Span::new().seconds(seconds))
            .expect("shift")
            .to_string(),
    )
}

#[test]
fn deadline_boundary_uses_one_nanosecond_precise_clock_contract() {
    let started = "2026-08-12T00:00:00.000000123Z";
    let deadline = stage_deadline_at(started, 2).expect("deadline");
    assert_eq!(deadline, "2026-08-12T00:00:02.000000123Z");
    assert!(!stage_deadline_reached(started, 2, "2026-08-12T00:00:02.000000122Z").expect("before"));
    assert!(stage_deadline_reached(started, 2, &deadline).expect("at"));
    assert!(stage_deadline_at(started, forged_types::MAX_STAGE_BUDGET_S).is_ok());
    assert!(stage_deadline_at(started, u64::MAX).is_err());
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

fn packet_body(budget_s: u32) -> String {
    serde_json::json!({
        "schema": "forged.packet/1",
        "beadId": "bead-1",
        "worktree": "/tmp/worktree",
        "branch": "feat/x",
        "baseRef": "main",
        "contract": {
            "instructions": "implement",
            "gateCommands": [],
            "deliverable": "commitsInWorktree",
            "budgetS": budget_s
        },
        "resultSchema": "forged.result/1",
        "providerHints": {
            "provider": "claude",
            "model": "test",
            "sandbox": "workspaceWrite"
        },
        "fieldNotes": []
    })
    .to_string()
}

fn seed_run(ledger: &Ledger) {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(RUN).expect("run id"),
            work_id: "bead-1".to_owned(),
            repo: "octo/demo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/x".to_owned(),
        })
        .expect("create run");
}

fn request_for(key: &str) -> OperationRequest {
    request_with(key, serde_json::Map::new())
}

fn request_with(key: &str, params: serde_json::Map<String, serde_json::Value>) -> OperationRequest {
    OperationRequest {
        schema_version: 1,
        idempotency_key: key.to_owned(),
        run_id: Some(RUN.to_owned()),
        params,
    }
}

fn begin_inflight(
    ledger: &Ledger,
    name: &str,
    key: &str,
    class: EffectClass,
    claim_token: Option<&str>,
) -> String {
    begin_inflight_with(
        ledger,
        name,
        key,
        class,
        claim_token,
        serde_json::Map::new(),
    )
}

fn begin_inflight_with(
    ledger: &Ledger,
    name: &str,
    key: &str,
    class: EffectClass,
    claim_token: Option<&str>,
    params: serde_json::Map<String, serde_json::Value>,
) -> String {
    let request = request_with(key, params);
    record(
        ledger,
        RUN,
        ProtoEvent::OperationRequest {
            name: name.to_owned(),
            idempotency_key: key.to_owned(),
            effect_class: class.as_str().to_owned(),
            request: request.clone(),
        },
    )
    .expect("record request");
    match ledger
        .begin_operation(name, &request, class, claim_token)
        .expect("begin")
    {
        OperationOutcome::Fresh(ticket) => ticket.operation_id,
        OperationOutcome::Replayed(_) => panic!("expected a fresh operation"),
    }
}

/// Settle a machine step the way the driver does: request event,
/// `begin_operation`, `complete_operation`.
fn settle_step(ledger: &Ledger, name: &str, key: &str, class: EffectClass) {
    let operation_id = begin_inflight(ledger, name, key, class, None);
    ledger
        .complete_operation(
            &operation_id,
            &OperationResponse {
                ok: true,
                operation_id: operation_id.clone(),
                reused: false,
                result: Some(serde_json::json!({ "done": true })),
                error: None,
            },
        )
        .expect("complete");
}

fn advance_now(ledger: &Ledger) -> NextAction {
    let view = project_run(
        ledger,
        RUN,
        full_roster(),
        vec!["cargo test --workspace".to_owned()],
        3,
        T0,
    )
    .expect("project");
    advance(&view)
}

// Crash window one: the request event is appended immediately BEFORE
// `begin_operation`, so a crash between them leaves the step recorded as
// requested with no operation row anywhere. The step never ran; the engine
// must ask for it again rather than walk past it.
#[tokio::test]
async fn a_requested_step_with_no_row_still_has_to_run() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);

    let key = format!("{RUN}/resolve/0");
    record(
        &ledger,
        RUN,
        ProtoEvent::OperationRequest {
            name: "resolve".to_owned(),
            idempotency_key: key.clone(),
            effect_class: EffectClass::ObserveOnly.as_str().to_owned(),
            request: request_for(&key),
        },
    )
    .expect("record request");
    // The crash lands here: no begin_operation ever ran.
    assert!(ledger
        .find_operation("resolve", &key)
        .expect("find")
        .is_none());

    assert_eq!(
        advance_now(&ledger),
        NextAction::RunMachine(MachineStage::Resolve),
        "a requested-but-rowless step is not settled"
    );

    // And once it genuinely settles, the run moves on.
    settle_step(&ledger, "resolve", &key, EffectClass::ObserveOnly);
    assert!(matches!(advance_now(&ledger), NextAction::OpenPackets(_)));
    ledger.close().expect("close");
}

// Crash window two: `release_operation` DELETES a SafeRetry row so the redo
// can re-claim the key. The step's request event survives the deletion, so
// "requested and not in flight" would call the released step done and skip
// the gate the reconciler just scheduled for redo.
#[tokio::test]
async fn a_released_safe_retry_step_still_has_to_run() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    settle_step(
        &ledger,
        "resolve",
        &format!("{RUN}/resolve/0"),
        EffectClass::ObserveOnly,
    );
    let pid = ledger
        .open_packet(NewPacket {
            run_id: RUN.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            policy_revision: None,
            body_json: packet_body(1800),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");
    ledger
        .complete_packet(&pid, &claim.claim_token, &result_for(&pid, implement_ok(2)))
        .expect("complete packet");

    // The gate begins, then the process dies mid-run.
    let key = format!("{RUN}/gate/0");
    let operation_id = begin_inflight(&ledger, "gate", &key, EffectClass::SafeRetry, None);
    assert_eq!(
        advance_now(&ledger),
        NextAction::RunMachine(MachineStage::Gate),
        "an in-flight gate is not settled either"
    );

    // Reconcile releases it for redo, deleting the row.
    let ports = FakePorts::new();
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.released, vec![operation_id]);
    assert!(ledger.find_operation("gate", &key).expect("find").is_none());

    assert_eq!(
        advance_now(&ledger),
        NextAction::RunMachine(MachineStage::Gate),
        "the released gate is the redo the reconciler asked for, not a settled step"
    );

    // The redo settles it, and only then does the run reach the push.
    settle_step(&ledger, "gate", &key, EffectClass::SafeRetry);
    assert_eq!(
        advance_now(&ledger),
        NextAction::RunMachine(MachineStage::Push)
    );
    ledger.close().expect("close");
}

// The same released-and-redone gate, watched from the event stream: the redo
// re-reports under the logical key its crashed predecessor already used, and
// no rerun reproduces a wall-clock duration. AMENDED (operator-adjudicated
// 2026-08-12): machine-step reports are LAST-WINS, so the stream replays and
// the projection carries the redo's rows rather than the crashed pass's.
#[tokio::test]
async fn a_redone_gate_report_replays_last_wins() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);

    // The gate begins and reports; the process then dies before
    // `complete_operation`, leaving the report behind with the row in flight.
    let key = format!("{RUN}/gate/0");
    let operation_id = begin_inflight(&ledger, "gate", &key, EffectClass::SafeRetry, None);
    let mut crashed = gate_row(0);
    crashed.duration_ms = 10;
    record(
        &ledger,
        RUN,
        ProtoEvent::Gate {
            phase: GatePhase::Gate,
            seq: 0,
            passed: true,
            rows: vec![crashed],
        },
    )
    .expect("record the crashed pass");

    // Reconcile releases the row for redo.
    let ports = FakePorts::new();
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.released, vec![operation_id]);

    // The redo runs the same commands, settles, and reports again.
    settle_step(&ledger, "gate", &key, EffectClass::SafeRetry);
    let mut redone = gate_row(0);
    redone.duration_ms = 4200;
    record(
        &ledger,
        RUN,
        ProtoEvent::Gate {
            phase: GatePhase::Gate,
            seq: 0,
            passed: true,
            rows: vec![redone.clone()],
        },
    )
    .expect("record the redone pass");

    let view = project_run(
        &ledger,
        RUN,
        full_roster(),
        vec!["cargo test --workspace".to_owned()],
        3,
        T0,
    )
    .expect("a redone report must not condemn the stream");
    let gates: Vec<&ProtoEvent> = view
        .proto_events
        .iter()
        .filter(|e| matches!(e, ProtoEvent::Gate { .. }))
        .collect();
    assert_eq!(gates.len(), 1, "one entry per report key: {gates:?}");
    assert_eq!(
        *gates[0],
        ProtoEvent::Gate {
            phase: GatePhase::Gate,
            seq: 0,
            passed: true,
            rows: vec![redone],
        },
        "the projection reads the redo's rows, not the crashed pass's"
    );
    ledger.close().expect("close");
}

#[tokio::test]
async fn safe_retry_is_released_and_redoable() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    let key = format!("{RUN}/gate/0");
    let operation_id = begin_inflight(&ledger, "gate", &key, EffectClass::SafeRetry, None);

    let ports = FakePorts::new();
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.released, vec![operation_id]);

    // The row is gone, so the redo re-claims fresh.
    assert!(ledger.find_operation("gate", &key).expect("find").is_none());
    let redo = ledger
        .begin_operation("gate", &request_for(&key), EffectClass::SafeRetry, None)
        .expect("redo");
    assert!(matches!(redo, OperationOutcome::Fresh(_)));
    ledger.close().expect("close");
}

#[tokio::test]
async fn observe_only_is_settled_by_observation() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    let key = format!("{RUN}/draftpr/0");
    let operation_id = begin_inflight(&ledger, "draftpr", &key, EffectClass::ObserveOnly, None);

    let ports = FakePorts::new();
    ports
        .pr_script
        .lock()
        .expect("lock")
        .push_back(Some(PrSnapshot {
            number: 7,
            is_draft: true,
            base_ref_name: "main".to_owned(),
            head_ref_name: "feat/x".to_owned(),
            url: "https://github.com/octo/demo/pull/7".to_owned(),
        }));
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.observed, vec![operation_id.clone()]);

    // The observation queried gh's listing seam with the run's coordinates.
    assert!(ports.recorded().iter().any(|c| matches!(
        c,
        PortCall::PrForHead { repo, head, base }
            if repo == "octo/demo" && head == "feat/x" && base == "main"
    )));

    // The row settled terminal with the observation stored.
    let row = ledger
        .find_operation("draftpr", &key)
        .expect("find")
        .expect("row survives");
    assert_eq!(row.state, OperationState::Terminal);
    let response = row.response_json.expect("stored response");
    assert!(response.contains("\"number\":7"), "{response}");
    ledger.close().expect("close");
}

// An observation settles an `ObserveOnly` step only when it confirms the
// effect. A push interrupted before the branch reached the remote observes
// no sha — and a pre-existing stale branch observes the WRONG sha: storing
// either as the row's terminal envelope would tell `advance` the push is
// done and let the run open a PR carrying code that never landed. Only the
// intended sha, recovered from the request's `params.expectedSha`,
// confirms.
#[tokio::test]
async fn an_observe_only_step_whose_effect_did_not_land_is_released_not_settled() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    let key = format!("{RUN}/push/0");
    let mut params = serde_json::Map::new();
    params.insert("expectedSha".to_owned(), serde_json::json!("deadbeef"));
    let operation_id = begin_inflight_with(
        &ledger,
        "push",
        &key,
        EffectClass::ObserveOnly,
        None,
        params.clone(),
    );

    // The fake reports no remote sha: the push never landed.
    let ports = FakePorts::new();
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.released, vec![operation_id]);
    assert!(report.observed.is_empty(), "{:?}", report.observed);
    assert!(ports
        .recorded()
        .iter()
        .any(|c| matches!(c, PortCall::RemoteSha { branch, .. } if branch == "feat/x")));
    assert!(ledger.find_operation("push", &key).expect("find").is_none());

    // A stale branch already on the remote answers with SOME sha — not the
    // intended one. That is not the interrupted push landing; released.
    let ports = FakePorts::new();
    let operation_id = begin_inflight_with(
        &ledger,
        "push",
        &key,
        EffectClass::ObserveOnly,
        None,
        params.clone(),
    );
    ports
        .sha_script
        .lock()
        .expect("lock")
        .push_back(Some("0ddc0de".to_owned()));
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.released, vec![operation_id]);
    assert!(report.observed.is_empty(), "{:?}", report.observed);
    assert!(ledger.find_operation("push", &key).expect("find").is_none());

    // A later pass that sees the INTENDED sha settles the row.
    let ports = FakePorts::new();
    let operation_id = begin_inflight_with(
        &ledger,
        "push",
        &key,
        EffectClass::ObserveOnly,
        None,
        params,
    );
    ports
        .sha_script
        .lock()
        .expect("lock")
        .push_back(Some("deadbeef".to_owned()));
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.observed, vec![operation_id]);
    let row = ledger
        .find_operation("push", &key)
        .expect("find")
        .expect("row survives");
    assert_eq!(row.state, OperationState::Terminal);
    ledger.close().expect("close");
}

// Resolve settles only when the observation proves BOTH halves of the
// effect-class table's row: the worktree is present AND the bd lease is
// held by the expected holder recovered from the request's
// `params.leaseHolder`. A worktree with no lease or the wrong lease is an
// unowned (or hijacked) run: released for redo, never settled.
#[tokio::test]
async fn resolve_settles_only_with_worktree_and_the_expected_lease_holder() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    let key = format!("{RUN}/resolve/0");
    let mut params = serde_json::Map::new();
    params.insert(
        "leaseHolder".to_owned(),
        serde_json::json!("claude:sess-a:1"),
    );

    // Worktree present but NO lease held (the fake's default): released.
    let operation_id = begin_inflight_with(
        &ledger,
        "resolve",
        &key,
        EffectClass::ObserveOnly,
        None,
        params.clone(),
    );
    let ports = FakePorts::new();
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("pass 1");
    assert_eq!(report.released, vec![operation_id]);
    assert!(report.observed.is_empty(), "{:?}", report.observed);
    assert!(ledger
        .find_operation("resolve", &key)
        .expect("find")
        .is_none());

    // Worktree present under the WRONG lease holder: released.
    let operation_id = begin_inflight_with(
        &ledger,
        "resolve",
        &key,
        EffectClass::ObserveOnly,
        None,
        params.clone(),
    );
    let ports = FakePorts::new();
    ports
        .resolve_script
        .lock()
        .expect("lock")
        .push_back(forged_proto::ResolveState {
            worktree_present: true,
            lease_holder: Some("claude:sess-b:9".to_owned()),
        });
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("pass 2");
    assert_eq!(report.released, vec![operation_id]);
    assert!(report.observed.is_empty(), "{:?}", report.observed);

    // Worktree present AND the expected holder: settled by observation.
    let operation_id = begin_inflight_with(
        &ledger,
        "resolve",
        &key,
        EffectClass::ObserveOnly,
        None,
        params,
    );
    let ports = FakePorts::new();
    ports
        .resolve_script
        .lock()
        .expect("lock")
        .push_back(forged_proto::ResolveState {
            worktree_present: true,
            lease_holder: Some("claude:sess-a:1".to_owned()),
        });
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("pass 3");
    assert_eq!(report.observed, vec![operation_id]);
    let row = ledger
        .find_operation("resolve", &key)
        .expect("find")
        .expect("row survives");
    assert_eq!(row.state, OperationState::Terminal);
    ledger.close().expect("close");
}

#[tokio::test]
async fn frozen_deadline_ignores_heartbeat_and_grants_one_retry_after_verified_kill() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    // Reconciliation reads the contract frozen when this packet opened.
    let body = packet_body(2);
    let packet_id = ledger
        .open_packet(NewPacket {
            run_id: RUN.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            policy_revision: None,
            body_json: body,
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(
            &packet_id,
            "claude:deadline:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");
    let started_at = ledger
        .get_attempt(claim.attempt_id)
        .expect("attempt")
        .started_at;
    let mut live_config = config();
    live_config.stage_budget_s.insert(Stage::Implement, 2);
    let ports = FakePorts::new();
    {
        let mut liveness = ports.liveness_script.lock().expect("lock");
        liveness.push_back(SessionLiveness::Running);
        // Even a clean exit must not outrank the exact deadline boundary.
        // Reconcile checks its captured clock before accepting liveness.
        liveness.push_back(SessionLiveness::Exited(0));
    }

    let before = reconcile(
        &ledger,
        RUN,
        &ports,
        &live_config,
        &seconds_after(&started_at, 1),
    )
    .await
    .expect("before deadline");
    assert_eq!(before.left_running, vec![claim.attempt_id]);
    ledger
        .heartbeat_attempt(&claim.claim_token)
        .expect("fresh heartbeat");

    let expired = reconcile(
        &ledger,
        RUN,
        &ports,
        &live_config,
        &seconds_after(&started_at, 2),
    )
    .await
    .expect("deadline settlement");
    assert_eq!(expired.timed_out, vec![claim.attempt_id]);
    assert!(expired.reclaimed.is_empty());
    assert_eq!(
        ports.liveness_script.lock().expect("lock").len(),
        1,
        "terminal liveness is not consulted after the deadline is reached"
    );
    let calls = ports.recorded();
    assert!(calls.iter().any(|call| matches!(
        call,
        PortCall::KillConfirmed {
            session,
            termination_grace_s: 5,
            ..
        } if session == "claude:deadline:1"
    )));
    assert!(!calls
        .iter()
        .any(|call| matches!(call, PortCall::ReclaimLease { .. })));

    let timed_out = ledger.get_attempt(claim.attempt_id).expect("timed out");
    assert_eq!(timed_out.state, AttemptState::Failed);
    assert_eq!(timed_out.revoke_scope, Some(RevokeScope::Deadline));
    assert!(timed_out
        .fail_note
        .as_deref()
        .is_some_and(|note| note.starts_with("deadline: stage deadline exceeded")));
    let rows = ledger.list_events(Some(RUN), 0, 1_000).expect("events");
    assert_eq!(
        rows.iter().filter(|row| row.kind == "proto.retry").count(),
        0,
        "a deadline kill earns no retry grant: it is counted from the attempt rows"
    );
    reconcile(
        &ledger,
        RUN,
        &ports,
        &live_config,
        &seconds_after(&started_at, 3),
    )
    .await
    .expect("replayed reconcile");
    assert_eq!(
        ledger
            .list_events(Some(RUN), 0, 1_000)
            .expect("events")
            .iter()
            .filter(|row| row.kind == "proto.retry")
            .count(),
        0,
        "terminal replay grants nothing either"
    );

    ledger
        .claim_packet(
            &packet_id,
            "claude:successor:2",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("one successor");
    assert!(ledger
        .claim_packet(
            &packet_id,
            "claude:duplicate:3",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .is_err());
}

#[tokio::test]
async fn deadline_marker_retains_custody_until_kill_can_be_verified_then_replays_once() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    let packet_id = ledger
        .open_packet(NewPacket {
            run_id: RUN.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            policy_revision: None,
            body_json: packet_body(1),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(
            &packet_id,
            "claude:deadline:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");
    ledger
        .revoke_attempt_scoped(
            claim.attempt_id,
            "deadline: stage deadline exceeded: crash replay",
            RevokeScope::Deadline,
        )
        .expect("marker");
    let ports = FakePorts::new();
    *ports.kill_failure.lock().expect("lock") = Some(forged_proto::PortError::Unavailable(
        "identity not verifiable".to_owned(),
    ));
    let failed_kill = reconcile(&ledger, RUN, &ports, &config(), &now_stamp()).await;
    assert!(failed_kill.is_err());
    let retained = ledger.get_attempt(claim.attempt_id).expect("retained");
    assert_eq!(retained.state, AttemptState::Revoking);
    assert_eq!(retained.revoke_scope, Some(RevokeScope::Deadline));
    assert!(ledger
        .list_events(Some(RUN), 0, 1_000)
        .expect("events")
        .iter()
        .all(|row| row.kind != "proto.retry"));

    forged_proto::grant_retry_for_attempt(
        &ledger,
        RUN,
        &packet_id,
        claim.attempt_id,
        &retained.updated_at,
    )
    .expect("simulate crash after retry grant");
    *ports.kill_failure.lock().expect("lock") = None;
    let resumed = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("resume marker");
    assert_eq!(resumed.timed_out, vec![claim.attempt_id]);
    assert_eq!(
        ledger.get_attempt(claim.attempt_id).expect("settled").state,
        AttemptState::Failed
    );
    reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("terminal replay");
    assert_eq!(
        ledger
            .list_events(Some(RUN), 0, 1_000)
            .expect("events")
            .iter()
            .filter(|row| row.kind == "proto.retry")
            .count(),
        1
    );
}

#[tokio::test]
async fn human_ambiguous_is_quarantined_and_left_in_progress() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    // The ambiguous operation is attempt-scoped: claim a packet first.
    let pid = ledger
        .open_packet(NewPacket {
            run_id: RUN.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            policy_revision: None,
            body_json: packet_body(1800),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(
            &pid,
            "claude:sess-a:1",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    let key = format!("{RUN}/manual/0");
    let operation_id = begin_inflight(
        &ledger,
        "manual",
        &key,
        EffectClass::HumanAmbiguous,
        Some(&claim.claim_token),
    );

    // The owning attempt is alive and within budget: the ladder leaves it
    // running while the ambiguous row is quarantined.
    let ports = FakePorts::new();
    ports
        .liveness_script
        .lock()
        .expect("lock")
        .push_back(SessionLiveness::Running);
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.left_running, vec![claim.attempt_id]);
    assert_eq!(report.quarantined, vec![operation_id.clone()]);

    // The quarantined bytes are the recovered proto.operation.request
    // payload, filed as operation-<id>.json under the owning attempt.
    let expected_body = serde_json::to_vec(&request_for(&key)).expect("serialize");
    let calls = ports.recorded();
    assert!(
        calls.iter().any(|c| matches!(
            c,
            PortCall::Quarantine { run_id, attempt_id, name, body }
                if run_id == RUN
                    && *attempt_id == claim.attempt_id
                    && *name == format!("operation-{operation_id}.json")
                    && *body == expected_body
        )),
        "{calls:?}"
    );

    // Never guess: the row stays in progress.
    let row = ledger
        .find_operation("manual", &key)
        .expect("find")
        .expect("row survives");
    assert_eq!(row.state, OperationState::InProgress);
    ledger.close().expect("close");
}

#[tokio::test]
async fn human_ambiguous_without_a_token_is_recorded_with_no_port_call() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    seed_run(&ledger);
    let key = format!("{RUN}/manual/0");
    let operation_id = begin_inflight(&ledger, "manual", &key, EffectClass::HumanAmbiguous, None);

    let ports = FakePorts::new();
    let report = reconcile(&ledger, RUN, &ports, &config(), &now_stamp())
        .await
        .expect("reconcile");
    assert_eq!(report.quarantined, vec![operation_id]);
    assert!(
        !ports
            .recorded()
            .iter()
            .any(|c| matches!(c, PortCall::Quarantine { .. })),
        "a tokenless row belongs to no attempt: no port call"
    );
    let row = ledger
        .find_operation("manual", &key)
        .expect("find")
        .expect("row survives");
    assert_eq!(row.state, OperationState::InProgress);
    ledger.close().expect("close");
}
