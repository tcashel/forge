//! Criterion 3: the review join. One leg terminal awaits the other; both
//! terminal merge with the severer verdict winning; only legs that spoke
//! contribute; zero contributing legs fail closed to `RequestChanges`.

mod support;

use forged_proto::{advance, NextAction, Terminal};
use forged_types::{Stage, Verdict};
use support::*;

const RUN: &str = "run-1";

#[test]
fn one_leg_terminal_awaits_the_other() {
    let view = at_first_review(RUN)
        .completed(Stage::ReviewClaude, 1, review(Verdict::Approve))
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::ReviewCodex, 1),
            not_before: None
        }
    );
    let view = at_first_review(RUN)
        .completed(Stage::ReviewCodex, 1, review(Verdict::Block))
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::ReviewClaude, 1),
            not_before: None
        }
    );
}

#[test]
fn both_legs_live_awaits_the_lexicographically_smaller_packet() {
    let view = at_first_review(RUN)
        .live_attempt(Stage::ReviewClaude, 1)
        .live_attempt(Stage::ReviewCodex, 1)
        .build();
    // "reviewclaude" < "reviewcodex".
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::ReviewClaude, 1),
            not_before: None
        }
    );
}

/// Drive a merge case at the re-review position, where the merged verdict
/// surfaces directly in `Done { final_verdict }`.
fn rereview_merge(claude: forged_types::Outcome, codex: forged_types::Outcome) -> NextAction {
    let view = at_rereview(RUN)
        .completed(Stage::ReviewClaude, 2, claude)
        .completed(Stage::ReviewCodex, 2, codex)
        .build();
    advance(&view)
}

fn done(verdict: Verdict) -> NextAction {
    NextAction::Stop(Terminal::Done {
        final_verdict: Some(verdict),
    })
}

#[test]
fn approve_plus_block_merges_to_block() {
    assert_eq!(
        rereview_merge(review(Verdict::Approve), review(Verdict::Block)),
        done(Verdict::Block)
    );
}

#[test]
fn approve_plus_request_changes_merges_to_request_changes() {
    assert_eq!(
        rereview_merge(review(Verdict::Approve), review(Verdict::RequestChanges)),
        done(Verdict::RequestChanges)
    );
}

#[test]
fn approve_plus_absent_merges_to_approve() {
    // An honest absence never contributes — and never blocks an approval.
    assert_eq!(
        rereview_merge(review(Verdict::Approve), review_absent()),
        done(Verdict::Approve)
    );
}

#[test]
fn block_plus_absent_merges_to_block() {
    assert_eq!(
        rereview_merge(review(Verdict::Block), review_absent()),
        done(Verdict::Block)
    );
}

/// The note `settle_unspawned` and `abandon_claim` store for a seat retired
/// between its claim and a spawn.
const UNSPAWNED: &str = "unspawned: attempt refused before spawn: could not \
                         create the packet directory";

#[test]
fn a_review_seat_that_never_spawned_contributes_no_verdict() {
    // The defect: a plain note classifies SEMANTIC, and a semantic review
    // leg contributes `RequestChanges` — so a seat whose provider never
    // existed spoke a verdict it never had, and `Approve + never-ran` merged
    // to `RequestChanges`. An `unspawned:` note stands on the packet's
    // bounded budget instead: nothing to merge, and the leg is re-claimable.
    let view = at_rereview(RUN)
        .completed(Stage::ReviewClaude, 2, review(Verdict::Approve))
        .failed(Stage::ReviewCodex, 2, UNSPAWNED)
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::ReviewCodex, 2),
            not_before: None
        },
        "a seat that never ran is re-claimed, never merged"
    );
}

#[test]
fn an_unspawned_review_leg_stops_the_run_once_its_budget_is_spent() {
    // Bounded, so a cause that never clears cannot re-claim forever — and
    // the stop names the seat as one that never got a provider, which is
    // what it is, rather than reporting a verdict.
    let view = at_rereview(RUN)
        .budget(1)
        .completed(Stage::ReviewClaude, 2, review(Verdict::Approve))
        .failed(Stage::ReviewCodex, 2, UNSPAWNED)
        .failed(Stage::ReviewCodex, 2, UNSPAWNED)
        .retry_event(Stage::ReviewCodex, 2, 2, T0)
        .build();
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::ProviderUnavailable {
            stage: Stage::ReviewCodex,
            attempts: 2
        })
    );
}

#[test]
fn approve_plus_semantic_failure_merges_to_request_changes() {
    // A reviewer that tried and died is not an absent reviewer.
    let view = at_rereview(RUN)
        .completed(Stage::ReviewClaude, 2, review(Verdict::Approve))
        .failed(Stage::ReviewCodex, 2, "reviewer crashed mid-thought")
        .build();
    assert_eq!(advance(&view), done(Verdict::RequestChanges));
}

#[test]
fn both_absent_fails_closed_to_request_changes() {
    // At the first review position the fail-closed RequestChanges drives the
    // fix branch open — never an approval stop.
    let view = at_first_review(RUN)
        .completed(Stage::ReviewClaude, 1, review_absent())
        .completed(Stage::ReviewCodex, 1, review_absent())
        .build();
    match advance(&view) {
        NextAction::OpenPackets(intents) => {
            assert_eq!(intents.len(), 1);
            assert_eq!(intents[0].stage, Stage::Fix);
        }
        other => panic!("expected the fix round to open, got {other:?}"),
    }
}

#[test]
fn both_legs_failed_fails_closed_to_request_changes() {
    let view = at_first_review(RUN)
        .failed(Stage::ReviewClaude, 1, "crashed")
        .failed(Stage::ReviewCodex, 1, "crashed too")
        .build();
    match advance(&view) {
        NextAction::OpenPackets(intents) => {
            assert_eq!(intents[0].stage, Stage::Fix);
        }
        other => panic!("expected the fix round to open, got {other:?}"),
    }
}

#[test]
fn no_leg_ever_speaking_yields_done_with_no_final_verdict() {
    // Both fan-outs all-absent: the run finishes but no review leg ever
    // spoke, so `final_verdict` is None.
    let view = at_first_review(RUN)
        .completed(Stage::ReviewClaude, 1, review_absent())
        .completed(Stage::ReviewCodex, 1, review_absent())
        .packet(Stage::Fix, 1)
        .completed(Stage::Fix, 1, fix_ok())
        .op_done(forged_proto::MachineStage::ReGate, 1)
        .op_done(forged_proto::MachineStage::Push, 1)
        .packet(Stage::ReviewClaude, 2)
        .packet(Stage::ReviewCodex, 2)
        .completed(Stage::ReviewClaude, 2, review_absent())
        .completed(Stage::ReviewCodex, 2, review_absent())
        .build();
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            final_verdict: None
        })
    );
}
