//! Criterion 2: every stage transition over hand-built `RunView` fixtures,
//! including both `Push` positions and their distinct idempotency keys.
//! Criterion 5: a failing gate is data — the run still advances to `Push`
//! then `DraftPr` and reaches `Done`. Criterion 1: `advance` is
//! deterministic (a property test drives parameterized fixtures twice).

mod support;

use forged_proto::{
    advance, machine_idempotency_key, GatePhase, MachineStage, NextAction, Terminal,
};
use forged_types::{Stage, Verdict};
use proptest::prelude::*;
use support::*;

const RUN: &str = "run-1";

#[test]
fn fresh_run_resolves_first() {
    let view = ViewBuilder::new(RUN).build();
    assert_eq!(
        advance(&view),
        NextAction::RunMachine(MachineStage::Resolve)
    );
}

#[test]
fn stopped_run_reports_externally_stopped_verbatim() {
    let view = ViewBuilder::new(RUN).stopped("operator said stop").build();
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::ExternallyStopped {
            reason: "operator said stop".to_owned()
        })
    );
}

#[test]
fn resolve_done_opens_implement_at_seq_one() {
    let view = ViewBuilder::new(RUN)
        .op_done(MachineStage::Resolve, 0)
        .build();
    match advance(&view) {
        NextAction::OpenPackets(intents) => {
            assert_eq!(intents.len(), 1);
            assert_eq!(intents[0].stage, Stage::Implement);
            assert_eq!(intents[0].seq, 1);
            assert_eq!(intents[0].hints, full_roster()[&Stage::Implement]);
        }
        other => panic!("expected OpenPackets, got {other:?}"),
    }
}

#[test]
fn open_implement_packet_awaits_claim() {
    let view = ViewBuilder::new(RUN)
        .op_done(MachineStage::Resolve, 0)
        .packet(Stage::Implement, 1)
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Implement, 1),
            not_before: None
        }
    );
}

#[test]
fn live_implement_attempt_awaits_that_attempt() {
    let view = ViewBuilder::new(RUN)
        .op_done(MachineStage::Resolve, 0)
        .packet(Stage::Implement, 1)
        .live_attempt(Stage::Implement, 1)
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Implement, 1),
            not_before: None
        }
    );
}

/// The whole point of the attempt-local stop, at the layer that decides it:
/// a stopped attempt reopens its packet for a successor with NO deadline, so
/// the next `claim_next` takes it immediately rather than after a lease
/// ages out.
#[test]
fn a_stopped_attempt_reopens_its_packet_with_no_waiting_period() {
    let view = ViewBuilder::new(RUN)
        .op_done(MachineStage::Resolve, 0)
        .packet(Stage::Implement, 1)
        .stopped_attempt(Stage::Implement, 1)
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Implement, 1),
            not_before: None
        }
    );
}

#[test]
fn completed_implement_runs_gate_then_push_then_draftpr() {
    let base = || {
        ViewBuilder::new(RUN)
            .op_done(MachineStage::Resolve, 0)
            .packet(Stage::Implement, 1)
            .completed(Stage::Implement, 1, implement_ok(2))
    };
    assert_eq!(
        advance(&base().build()),
        NextAction::RunMachine(MachineStage::Gate)
    );
    assert_eq!(
        advance(&base().op_done(MachineStage::Gate, 0).build()),
        NextAction::RunMachine(MachineStage::Push)
    );
    assert_eq!(
        advance(
            &base()
                .op_done(MachineStage::Gate, 0)
                .op_done(MachineStage::Push, 0)
                .build()
        ),
        NextAction::RunMachine(MachineStage::DraftPr)
    );
}

#[test]
fn inflight_machine_operation_is_not_done() {
    let view = ViewBuilder::new(RUN)
        .op_inflight(MachineStage::Resolve, 0)
        .build();
    assert_eq!(
        advance(&view),
        NextAction::RunMachine(MachineStage::Resolve)
    );
}

// Only a terminal operation row settles a machine step. A request event
// with no row is what both a crash before `begin_operation` and a released
// SafeRetry redo look like, and neither ran to a settlement.
#[test]
fn a_requested_machine_step_with_no_row_is_not_settled() {
    let requested_only = ViewBuilder::new(RUN)
        .op_requested_only(MachineStage::Resolve, 0)
        .build();
    assert_eq!(
        advance(&requested_only),
        NextAction::RunMachine(MachineStage::Resolve)
    );

    // Deeper in the graph the same shape must not let the run skip a step:
    // implement is done and the gate was requested, never settled.
    let gate_requested = ViewBuilder::new(RUN)
        .op_done(MachineStage::Resolve, 0)
        .packet(Stage::Implement, 1)
        .completed(Stage::Implement, 1, implement_ok(2))
        .op_requested_only(MachineStage::Gate, 0)
        .build();
    assert_eq!(
        advance(&gate_requested),
        NextAction::RunMachine(MachineStage::Gate)
    );
}

// `advance` is total. A roster with no entry for the stage the engine must
// open cannot yield hints, and the engine never invents them — so the run
// stops, loudly, naming the gap, instead of panicking inside the
// orchestrator.
#[test]
fn a_roster_gap_stops_the_run_instead_of_panicking() {
    let missing_implement = ViewBuilder::new(RUN)
        .op_done(MachineStage::Resolve, 0)
        .without_roster_entry(Stage::Implement)
        .build();
    assert_eq!(
        advance(&missing_implement),
        NextAction::Stop(Terminal::ExternallyStopped {
            reason: "roster missing stage implement".to_owned()
        })
    );

    // The review fan-out reports whichever leg it cannot open.
    let missing_codex = through_draftpr(RUN)
        .without_roster_entry(Stage::ReviewCodex)
        .build();
    assert_eq!(
        advance(&missing_codex),
        NextAction::Stop(Terminal::ExternallyStopped {
            reason: "roster missing stage reviewcodex".to_owned()
        })
    );

    // Including when it is repairing a half-open fan-out at an existing seq.
    let half_open = through_draftpr(RUN)
        .packet(Stage::ReviewClaude, 1)
        .without_roster_entry(Stage::ReviewCodex)
        .build();
    assert_eq!(
        advance(&half_open),
        NextAction::Stop(Terminal::ExternallyStopped {
            reason: "roster missing stage reviewcodex".to_owned()
        })
    );

    // And the fix round.
    let missing_fix = at_first_review(RUN)
        .completed(Stage::ReviewClaude, 1, review(Verdict::RequestChanges))
        .completed(Stage::ReviewCodex, 1, review(Verdict::Approve))
        .without_roster_entry(Stage::Fix)
        .build();
    assert_eq!(
        advance(&missing_fix),
        NextAction::Stop(Terminal::ExternallyStopped {
            reason: "roster missing stage fix".to_owned()
        })
    );
}

#[test]
fn draftpr_done_opens_the_review_fanout_atomically() {
    let view = through_draftpr(RUN).build();
    match advance(&view) {
        NextAction::OpenPackets(intents) => {
            assert_eq!(intents.len(), 2, "review fans out as a two-element vec");
            assert_eq!(intents[0].stage, Stage::ReviewClaude);
            assert_eq!(intents[1].stage, Stage::ReviewCodex);
            assert_eq!(intents[0].seq, 1);
            assert_eq!(intents[1].seq, 1, "both legs at the same seq");
        }
        other => panic!("expected OpenPackets, got {other:?}"),
    }
}

#[test]
fn approve_review_stops_done_with_the_standing_verdict() {
    let view = at_first_review(RUN)
        .completed(Stage::ReviewClaude, 1, review(Verdict::Approve))
        .completed(Stage::ReviewCodex, 1, review(Verdict::Approve))
        .build();
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            review_rounds: 1,
            final_verdict: Some(Verdict::Approve),
            final_verdict_is_durable: true,
            failed_review_seats: 0,
        })
    );
}

#[test]
fn request_changes_opens_the_fix_round() {
    let view = at_first_review(RUN)
        .completed(Stage::ReviewClaude, 1, review(Verdict::RequestChanges))
        .completed(Stage::ReviewCodex, 1, review(Verdict::Approve))
        .build();
    match advance(&view) {
        NextAction::OpenPackets(intents) => {
            assert_eq!(intents.len(), 1);
            assert_eq!(intents[0].stage, Stage::Fix);
            assert_eq!(intents[0].seq, 1);
        }
        other => panic!("expected OpenPackets(fix), got {other:?}"),
    }
}

#[test]
fn fix_branch_walks_regate_then_second_push_then_rereview() {
    let base = || {
        at_first_review(RUN)
            .completed(Stage::ReviewClaude, 1, review(Verdict::RequestChanges))
            .completed(Stage::ReviewCodex, 1, review(Verdict::Approve))
            .packet(Stage::Fix, 1)
            .completed(Stage::Fix, 1, fix_ok())
    };
    assert_eq!(
        advance(&base().build()),
        NextAction::RunMachine(MachineStage::ReGate)
    );
    // The second Push position: regate/1 done, push/1 missing — even though
    // push/0 settled long ago, the round-1 key is distinct.
    assert_eq!(
        advance(&base().op_done(MachineStage::ReGate, 1).build()),
        NextAction::RunMachine(MachineStage::Push)
    );
    assert_ne!(
        machine_idempotency_key(RUN, MachineStage::Push, 0),
        machine_idempotency_key(RUN, MachineStage::Push, 1),
    );
    assert_eq!(
        machine_idempotency_key(RUN, MachineStage::Push, 0),
        "run-1/push/0"
    );
    assert_eq!(
        machine_idempotency_key(RUN, MachineStage::Push, 1),
        "run-1/push/1"
    );
    // Both pushes settled: the re-review fan-out opens at the next unused
    // seq.
    match advance(
        &base()
            .op_done(MachineStage::ReGate, 1)
            .op_done(MachineStage::Push, 1)
            .build(),
    ) {
        NextAction::OpenPackets(intents) => {
            assert_eq!(intents.len(), 2);
            assert_eq!(intents[0].seq, 2);
            assert_eq!(intents[1].seq, 2);
        }
        other => panic!("expected OpenPackets(rereview), got {other:?}"),
    }
}

#[test]
fn rereview_join_stops_done_with_its_merged_verdict() {
    let view = at_rereview(RUN)
        .completed(Stage::ReviewClaude, 2, review(Verdict::Approve))
        .completed(Stage::ReviewCodex, 2, review(Verdict::Approve))
        .build();
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            review_rounds: 2,
            final_verdict: Some(Verdict::Approve),
            final_verdict_is_durable: true,
            failed_review_seats: 0,
        })
    );
}

// Criterion 5: gate failure labels, never aborts.
#[test]
fn failing_gate_still_advances_to_push_then_draftpr_then_done() {
    let base = || {
        ViewBuilder::new(RUN)
            .op_done(MachineStage::Resolve, 0)
            .packet(Stage::Implement, 1)
            .completed(Stage::Implement, 1, implement_ok(2))
            .op_done(MachineStage::Gate, 0)
            .gate_event(GatePhase::Gate, false)
    };
    assert_eq!(
        advance(&base().build()),
        NextAction::RunMachine(MachineStage::Push),
        "a failing gate is data, not an abort"
    );
    assert_eq!(
        advance(&base().op_done(MachineStage::Push, 0).build()),
        NextAction::RunMachine(MachineStage::DraftPr)
    );
    let done = base()
        .op_done(MachineStage::Push, 0)
        .op_done(MachineStage::DraftPr, 0)
        .packet(Stage::ReviewClaude, 1)
        .packet(Stage::ReviewCodex, 1)
        .completed(Stage::ReviewClaude, 1, review(Verdict::Approve))
        .completed(Stage::ReviewCodex, 1, review(Verdict::Approve))
        .build();
    assert_eq!(
        advance(&done),
        NextAction::Stop(Terminal::Done {
            review_rounds: 1,
            final_verdict: Some(Verdict::Approve),
            final_verdict_is_durable: true,
            failed_review_seats: 0,
        })
    );
}

// Criterion 1: same view in, same action out.
fn verdict_strategy() -> impl Strategy<Value = Verdict> {
    prop_oneof![
        Just(Verdict::Approve),
        Just(Verdict::RequestChanges),
        Just(Verdict::Block),
    ]
}

proptest! {
    #[test]
    fn advance_is_deterministic_over_fixture_space(
        scenario in 0u8..6,
        claude in verdict_strategy(),
        codex in verdict_strategy(),
        codex_absent in any::<bool>(),
        transport_failures in 0u32..5,
    ) {
        let view = match scenario {
            0 => ViewBuilder::new(RUN).build(),
            1 => ViewBuilder::new(RUN)
                .op_done(MachineStage::Resolve, 0)
                .packet(Stage::Implement, 1)
                .build(),
            2 => {
                let mut b = at_first_review(RUN)
                    .completed(Stage::ReviewClaude, 1, review(claude));
                b = if codex_absent {
                    b.completed(Stage::ReviewCodex, 1, review_absent())
                } else {
                    b.completed(Stage::ReviewCodex, 1, review(codex))
                };
                b.build()
            }
            3 => {
                let mut b = ViewBuilder::new(RUN)
                    .op_done(MachineStage::Resolve, 0)
                    .packet(Stage::Implement, 1);
                for _ in 0..transport_failures {
                    b = b.failed(Stage::Implement, 1, "transport: dropped");
                }
                b.build()
            }
            4 => at_rereview(RUN)
                .completed(Stage::ReviewClaude, 2, review(claude))
                .completed(Stage::ReviewCodex, 2, review(codex))
                .build(),
            _ => ViewBuilder::new(RUN).stopped("halt").build(),
        };
        let first = advance(&view);
        let second = advance(&view);
        prop_assert_eq!(first.clone(), second, "same RunView must yield the identical NextAction");
        let clone = view.clone();
        prop_assert_eq!(first, advance(&clone));
    }
}
