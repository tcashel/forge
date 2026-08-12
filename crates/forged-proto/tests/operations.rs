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

use forged_ledger::{EffectClass, Ledger, NewPacket, NewRun, OperationOutcome, OperationState};
use forged_proto::{
    advance, project_run, reconcile, record, widen_rfc3339, MachineStage, NextAction, PrSnapshot,
    ProtoEvent, ReconcileConfig, SessionLiveness,
};
use forged_types::{OperationRequest, OperationResponse, RunId, Stage};
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

fn seed_run(ledger: &Ledger) {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(RUN).expect("run id"),
            bead_id: "bead-1".to_owned(),
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
            body_json: "{}".to_owned(),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(&pid, "claude:sess-a:1", "cafe")
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
            body_json: "{}".to_owned(),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(&pid, "claude:sess-a:1", "cafe")
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
