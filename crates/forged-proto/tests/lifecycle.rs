//! Criterion 6: a full slice/v1 lifecycle runs in-process, from `Resolve`
//! through `Stop(Done)`, driven by a loop that calls `advance`, honors each
//! `NextAction` against a real tempfile-backed `Ledger`, and records the
//! proto events. The ports are in-process fakes and packet results are
//! scripted values; no subprocess is spawned anywhere. "Draft PR, never a
//! merge" is structural — `NextAction` and `MachineStage` have no merge
//! variant — plus the recorded `proto.pr` event's `isDraft: true`.

mod support;

use std::collections::HashMap;

use forged_ledger::{
    EffectClass, Ledger, NewPacket, NewRun, OperationOutcome, OperationState, SpecFence,
};
use forged_proto::{
    advance, land_packet_result, machine_idempotency_key, parse_proto_events, project_run, record,
    widen_rfc3339, GatePhase, LandOutcome, MachineStage, NextAction, ProtoEvent, Terminal,
};
use forged_types::{OperationRequest, OperationResponse, Outcome, RunId, Stage, Verdict};
use support::*;

const RUN: &str = "run-1";

fn stage_of(packet_id: &str) -> (Stage, i64) {
    let mut parts = packet_id.split('/');
    let _run = parts.next().expect("run segment");
    let stage = match parts.next().expect("stage segment") {
        "implement" => Stage::Implement,
        "reviewclaude" => Stage::ReviewClaude,
        "reviewcodex" => Stage::ReviewCodex,
        "fix" => Stage::Fix,
        other => panic!("unknown stage {other}"),
    };
    let seq: i64 = parts.next().expect("seq segment").parse().expect("seq");
    (stage, seq)
}

#[tokio::test]
async fn full_slice_v1_lifecycle_in_process() {
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

    let ports = FakePorts::new();
    let roster = full_roster();
    let gates = vec!["cargo test --workspace".to_owned()];

    // Scripted packet results: first review merges to RequestChanges, the
    // fix round runs, the informational re-review approves.
    let mut script: HashMap<String, Outcome> = HashMap::from([
        (packet_id(RUN, Stage::Implement, 1), implement_ok(2)),
        (
            packet_id(RUN, Stage::ReviewClaude, 1),
            review(Verdict::RequestChanges),
        ),
        (
            packet_id(RUN, Stage::ReviewCodex, 1),
            review(Verdict::Approve),
        ),
        (packet_id(RUN, Stage::Fix, 1), fix_ok()),
        (
            packet_id(RUN, Stage::ReviewClaude, 2),
            review(Verdict::Approve),
        ),
        (
            packet_id(RUN, Stage::ReviewCodex, 2),
            review(Verdict::Approve),
        ),
    ]);

    let mut visited: Vec<String> = Vec::new();
    let mut fix_completed = false;
    let mut tick = 0u32;
    let stop = loop {
        tick += 1;
        assert!(tick < 100, "driver loop did not terminate: {visited:?}");
        let now = widen_rfc3339(&format!("2026-08-12T01:{:02}:{:02}Z", tick / 60, tick % 60));
        let view =
            project_run(&ledger, RUN, roster.clone(), gates.clone(), 3, &now).expect("project");
        match advance(&view) {
            NextAction::RunMachine(step) => {
                let round = u32::from(fix_completed);
                let key = machine_idempotency_key(RUN, step, round);
                // The reconcile contract's intent keys ride in `params`:
                // `leaseHolder` is what settles a crashed Resolve, and
                // `expectedSha` is what settles a crashed Push — a bare
                // "some sha exists" would confirm a stale branch.
                let mut params = serde_json::Map::new();
                match step {
                    MachineStage::Resolve => {
                        params.insert(
                            "leaseHolder".to_owned(),
                            serde_json::json!("claude:sess-1:1"),
                        );
                    }
                    MachineStage::Push => {
                        params.insert("expectedSha".to_owned(), serde_json::json!("deadbeef"));
                    }
                    _ => {}
                }
                let request = OperationRequest {
                    schema_version: 1,
                    idempotency_key: key.clone(),
                    run_id: Some(RUN.to_owned()),
                    params,
                };
                let class = match step {
                    MachineStage::Gate | MachineStage::ReGate => EffectClass::SafeRetry,
                    _ => EffectClass::ObserveOnly,
                };
                // The request event lands immediately before begin_operation
                // so an interruption's parameters stay recoverable.
                record(
                    &ledger,
                    RUN,
                    ProtoEvent::OperationRequest {
                        name: step.as_str().to_owned(),
                        idempotency_key: key.clone(),
                        effect_class: class.as_str().to_owned(),
                        request: request.clone(),
                    },
                )
                .expect("record request");
                let outcome = ledger
                    .begin_operation(step.as_str(), &request, class, None)
                    .expect("begin operation");
                let OperationOutcome::Fresh(ticket) = outcome else {
                    panic!("expected a fresh operation for {key}");
                };
                match step {
                    MachineStage::Gate => record(
                        &ledger,
                        RUN,
                        ProtoEvent::Gate {
                            phase: GatePhase::Gate,
                            seq: 0,
                            passed: true,
                            rows: vec![gate_row(0)],
                        },
                    )
                    .expect("record gate"),
                    MachineStage::ReGate => record(
                        &ledger,
                        RUN,
                        ProtoEvent::Gate {
                            phase: GatePhase::Regate,
                            seq: 1,
                            passed: true,
                            rows: vec![gate_row(0)],
                        },
                    )
                    .expect("record regate"),
                    MachineStage::DraftPr => record(
                        &ledger,
                        RUN,
                        ProtoEvent::Pr {
                            number: 7,
                            is_draft: true,
                            url: "https://github.com/octo/demo/pull/7".to_owned(),
                        },
                    )
                    .expect("record pr"),
                    _ => {}
                }
                ledger
                    .complete_operation(
                        &ticket.operation_id,
                        &OperationResponse {
                            ok: true,
                            operation_id: ticket.operation_id.clone(),
                            reused: false,
                            result: Some(serde_json::json!({ "done": true })),
                            error: None,
                        },
                    )
                    .expect("complete operation");
                visited.push(format!("{}/{round}", step.as_str()));
            }
            NextAction::OpenPackets(intents) => {
                for intent in intents {
                    let pid = ledger
                        .open_packet(NewPacket {
                            run_id: RUN.to_owned(),
                            stage: intent.stage,
                            seq: intent.seq,
                            spec_path: "spec.md".to_owned(),
                            spec_sha256: "cafe".to_owned(),
                            spec_revision: None,
                            body_json: "{}".to_owned(),
                        })
                        .expect("open packet");
                    visited.push(format!("open:{pid}"));
                }
            }
            NextAction::AwaitPacket {
                packet_id: pid,
                not_before,
            } => {
                assert!(not_before.is_none(), "no transport retries in this run");
                let claim = ledger
                    .claim_packet(
                        &pid,
                        "claude:sess-1:1",
                        &SpecFence::Sha256("cafe".to_owned()),
                    )
                    .expect("claim packet");
                let outcome = script
                    .remove(&pid)
                    .unwrap_or_else(|| panic!("no scripted outcome for {pid}"));
                let result = result_for(&pid, outcome.clone());
                let landed = land_packet_result(
                    &ledger,
                    &ports,
                    RUN,
                    &pid,
                    claim.attempt_id,
                    &claim.claim_token,
                    &result,
                )
                .await
                .expect("land result");
                assert_eq!(landed, LandOutcome::Completed);
                if let Outcome::Review {
                    verdict, available, ..
                } = &outcome
                {
                    let (stage, seq) = stage_of(&pid);
                    record(
                        &ledger,
                        RUN,
                        ProtoEvent::Review {
                            seq,
                            stage,
                            verdict: available.then_some(*verdict),
                            available: *available,
                        },
                    )
                    .expect("record review");
                }
                if matches!(outcome, Outcome::Fix { .. }) {
                    fix_completed = true;
                }
                visited.push(format!("done:{pid}"));
            }
            NextAction::EscalateProfile(escalation) => {
                panic!("legacy lifecycle must not escalate: {escalation:?}")
            }
            NextAction::Stop(terminal) => break terminal,
        }
    };

    assert_eq!(
        stop,
        Terminal::Done {
            final_verdict: Some(Verdict::Approve)
        }
    );

    // The visited stage sequence, including both Push positions.
    let expected: Vec<String> = vec![
        "resolve/0".to_owned(),
        format!("open:{}", packet_id(RUN, Stage::Implement, 1)),
        format!("done:{}", packet_id(RUN, Stage::Implement, 1)),
        "gate/0".to_owned(),
        "push/0".to_owned(),
        "draftpr/0".to_owned(),
        format!("open:{}", packet_id(RUN, Stage::ReviewClaude, 1)),
        format!("open:{}", packet_id(RUN, Stage::ReviewCodex, 1)),
        format!("done:{}", packet_id(RUN, Stage::ReviewClaude, 1)),
        format!("done:{}", packet_id(RUN, Stage::ReviewCodex, 1)),
        format!("open:{}", packet_id(RUN, Stage::Fix, 1)),
        format!("done:{}", packet_id(RUN, Stage::Fix, 1)),
        "regate/1".to_owned(),
        "push/1".to_owned(),
        format!("open:{}", packet_id(RUN, Stage::ReviewClaude, 2)),
        format!("open:{}", packet_id(RUN, Stage::ReviewCodex, 2)),
        format!("done:{}", packet_id(RUN, Stage::ReviewClaude, 2)),
        format!("done:{}", packet_id(RUN, Stage::ReviewCodex, 2)),
    ];
    assert_eq!(visited, expected);

    // Final ledger state: nothing live, both push rounds settled under
    // distinct idempotency keys, the run still active.
    assert!(ledger
        .list_live_attempts(Some(RUN))
        .expect("live")
        .is_empty());
    for round in [0u32, 1] {
        let key = machine_idempotency_key(RUN, MachineStage::Push, round);
        let row = ledger
            .find_operation("push", &key)
            .expect("find")
            .unwrap_or_else(|| panic!("push operation {key} missing"));
        assert_eq!(row.state, OperationState::Terminal);
    }
    assert!(ledger
        .list_inflight_operations(Some(RUN))
        .expect("ops")
        .is_empty());

    // The recorded PR is a draft; no merge intent exists anywhere in the
    // action vocabulary (structural: NextAction and MachineStage carry no
    // merge variant).
    let events = ledger.list_events(Some(RUN), 0, 1000).expect("events");
    let parsed = parse_proto_events(&events).expect("parse");
    assert!(parsed.iter().any(|e| matches!(
        e,
        ProtoEvent::Pr {
            is_draft: true,
            number: 7,
            ..
        }
    )));

    // The fake ports were never needed on the happy path.
    assert!(ports.recorded().is_empty());
    ledger.close().expect("close");
}
