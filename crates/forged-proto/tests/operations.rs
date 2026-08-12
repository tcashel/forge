//! Criterion 8: interrupted operations, one per `EffectClass` — `SafeRetry`
//! is released and redone, `ObserveOnly` is settled by observation via
//! `resolve_interrupted_operation`, `HumanAmbiguous` is quarantined and
//! left in progress.

mod support;

use std::collections::HashMap;

use forged_ledger::{EffectClass, Ledger, NewPacket, NewRun, OperationOutcome, OperationState};
use forged_proto::{
    reconcile, record, widen_rfc3339, PrSnapshot, ProtoEvent, ReconcileConfig, SessionLiveness,
};
use forged_types::{OperationRequest, RunId, Stage};
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
    OperationRequest {
        schema_version: 1,
        idempotency_key: key.to_owned(),
        run_id: Some(RUN.to_owned()),
        params: serde_json::Map::new(),
    }
}

fn begin_inflight(
    ledger: &Ledger,
    name: &str,
    key: &str,
    class: EffectClass,
    claim_token: Option<&str>,
) -> String {
    let request = request_for(key);
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
