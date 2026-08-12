//! Projection round-trip: `project_run` reconstructs terminal attempt
//! history from `attempt.state` events (with `get_attempt` for completed
//! ids), threads the caller's roster, gate commands, budget, and `now`
//! unchanged, and replays recorded proto events.

mod support;

use forged_ledger::{AttemptState, Ledger, NewPacket, NewRun};
use forged_proto::{project_run, record, GatePhase, ProtoEvent};
use forged_types::{Outcome, RunId, Stage, Verdict};
use support::*;

const RUN: &str = "run-1";

#[test]
fn projection_reconstructs_history_and_threads_inputs() {
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
            body_json: "{}".to_owned(),
        })
        .expect("open packet");

    // Attempt 1 transport-fails; attempt 2 completes.
    let first = ledger
        .claim_packet(&pid, "claude:sess-a:1", "cafe")
        .expect("claim 1");
    ledger
        .fail_packet(&pid, &first.claim_token, "transport: dropped")
        .expect("fail");
    let second = ledger
        .claim_packet(&pid, "claude:sess-b:1", "cafe")
        .expect("claim 2");
    ledger
        .complete_packet(
            &pid,
            &second.claim_token,
            &result_for(&pid, implement_ok(2)),
        )
        .expect("complete");

    record(
        &ledger,
        RUN,
        ProtoEvent::Gate {
            phase: GatePhase::Gate,
            seq: 0,
            passed: false,
            rows: vec![gate_row(1)],
        },
    )
    .expect("record gate");

    let roster = full_roster();
    let gates = vec!["cargo test --workspace".to_owned()];
    let view = project_run(&ledger, RUN, roster.clone(), gates.clone(), 3, T0).expect("project");

    assert_eq!(view.run.run_id, RUN);
    assert_eq!(view.packets.len(), 1);
    assert!(view.live_attempts.is_empty());
    assert!(view.inflight_operations.is_empty());
    assert_eq!(view.roster, roster);
    assert_eq!(view.gate_commands, gates);
    assert_eq!(view.transport_retry_budget, 3);
    assert_eq!(view.now, T0);

    // Terminal history, oldest first, with the fail note verbatim and the
    // completed outcome parsed from result_json.
    let history = view.terminal_attempts.get(&pid).expect("history");
    assert_eq!(history.len(), 2);
    assert_eq!(history[0].attempt_id, first.attempt_id);
    assert_eq!(history[0].state, AttemptState::Failed);
    assert_eq!(history[0].fail_note.as_deref(), Some("transport: dropped"));
    assert!(history[0].outcome.is_none());
    assert_eq!(history[1].attempt_id, second.attempt_id);
    assert_eq!(history[1].state, AttemptState::Completed);
    assert!(matches!(
        history[1].outcome,
        Some(Outcome::Implement {
            commits_ahead: 2,
            ..
        })
    ));

    // Recorded proto events replay.
    assert!(view.proto_events.iter().any(|e| matches!(
        e,
        ProtoEvent::Gate {
            phase: GatePhase::Gate,
            passed: false,
            ..
        }
    )));
    ledger.close().expect("close");
}

#[test]
fn every_proto_event_kind_round_trips_through_the_ledger() {
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

    let events = vec![
        ProtoEvent::Gate {
            phase: GatePhase::Regate,
            seq: 1,
            passed: true,
            rows: vec![gate_row(0)],
        },
        ProtoEvent::Pr {
            number: 7,
            is_draft: true,
            url: "https://github.com/octo/demo/pull/7".to_owned(),
        },
        ProtoEvent::Retry {
            packet_id: packet_id(RUN, Stage::Fix, 1),
            transport_failures: 1,
            retry_after: "2026-08-12T00:00:30.000000000Z".to_owned(),
        },
        ProtoEvent::Review {
            seq: 1,
            stage: Stage::ReviewCodex,
            verdict: Some(Verdict::Approve),
            available: true,
        },
        ProtoEvent::OperationRequest {
            name: "push".to_owned(),
            idempotency_key: format!("{RUN}/push/0"),
            effect_class: "observe-only".to_owned(),
            request: forged_types::OperationRequest {
                schema_version: 1,
                idempotency_key: format!("{RUN}/push/0"),
                run_id: Some(RUN.to_owned()),
                params: serde_json::Map::new(),
            },
        },
        ProtoEvent::Quarantine {
            packet_id: packet_id(RUN, Stage::Implement, 1),
            attempt_id: 1,
            name: "result.json".to_owned(),
            result: result_for(&packet_id(RUN, Stage::Implement, 1), implement_ok(5)),
        },
    ];
    for event in &events {
        record(&ledger, RUN, event.clone()).expect("record");
    }
    let view = project_run(&ledger, RUN, full_roster(), vec![], 3, T0).expect("project");
    assert_eq!(view.proto_events, events);
    ledger.close().expect("close");
}
