//! Criterion 4: the one-fix-round budget, and why transport failures are
//! free. A completed fix consumes the round; a semantic failure consumes
//! it; a `transport:`-prefixed failure never does, riding the per-packet
//! retry budget of 3 with `30s × 2^n` backoff.

mod support;

use forged_proto::{advance, backoff_deadline, NextAction, Terminal};
use forged_types::{Stage, Verdict};
use support::*;

const RUN: &str = "run-1";

#[test]
fn spent_round_stops_done_with_the_final_verdict_not_another_fix() {
    // A completed fix consumed the round; the re-review merged to
    // RequestChanges again. The spent round is a Done stop carrying the
    // final verdict, never its own terminal variant.
    let view = at_rereview(RUN)
        .completed(Stage::ReviewClaude, 2, review(Verdict::RequestChanges))
        .completed(Stage::ReviewCodex, 2, review(Verdict::RequestChanges))
        .build();
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            final_verdict: Some(Verdict::RequestChanges)
        })
    );
}

/// A fixture at the fix stage: first review merged to RequestChanges, fix
/// packet open.
fn at_fix() -> ViewBuilder {
    at_first_review(RUN)
        .completed(Stage::ReviewClaude, 1, review(Verdict::RequestChanges))
        .completed(Stage::ReviewCodex, 1, review(Verdict::Approve))
        .packet(Stage::Fix, 1)
}

#[test]
fn transport_failed_fix_does_not_consume_the_round_and_waits_the_backoff() {
    // First transport failure (n = 0, zero-indexed): 30s past the failure.
    let failed_at = T0;
    let deadline = backoff_deadline(failed_at, 0).expect("computes");
    assert_eq!(deadline, "2026-08-12T00:00:30.000000000Z");
    let view = at_fix()
        .failed(Stage::Fix, 1, "transport: connection dropped")
        .retry_event(Stage::Fix, 1, 1, &deadline)
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Fix, 1),
            not_before: Some(deadline)
        }
    );
}

#[test]
fn second_transport_failure_backs_off_sixty_seconds() {
    let deadline = backoff_deadline(T0, 1).expect("computes");
    assert_eq!(deadline, "2026-08-12T00:01:00.000000000Z");
    let view = at_fix()
        .failed(Stage::Fix, 1, "transport: connection dropped")
        .failed(Stage::Fix, 1, "transport: connection dropped again")
        .retry_event(
            Stage::Fix,
            1,
            1,
            &backoff_deadline(T0, 0).expect("computes"),
        )
        .retry_event(Stage::Fix, 1, 2, &deadline)
        .build();
    // The latest proto.retry event carries the deadline advance reports.
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Fix, 1),
            not_before: Some(deadline)
        }
    );
}

// The count and the deadline come from ONE place: the packet's latest
// `proto.retry` event, which the caller appends carrying the count it
// computed. Counting terminal attempts separately is a second, independent
// source, and two sources can disagree — after a failure whose grant is
// recorded, or a grant recorded for a failure whose attempt row never
// landed. Whichever way they disagree, the event decides.
#[test]
fn the_latest_retry_event_is_the_only_source_of_count_and_deadline() {
    // The event outruns the history: two visible terminal failures, but the
    // grant says this packet is on its fourth. Over budget, and the run
    // stops with the event's count rather than waiting on a stale deadline.
    let event_ahead = at_fix()
        .failed(Stage::Fix, 1, "transport: dropped")
        .failed(Stage::Fix, 1, "transport: dropped")
        .retry_event(
            Stage::Fix,
            1,
            4,
            &backoff_deadline(T0, 3).expect("computes"),
        )
        .build();
    assert_eq!(
        advance(&event_ahead),
        NextAction::Stop(Terminal::ProviderUnavailable {
            stage: Stage::Fix,
            attempts: 4
        })
    );

    // The history outruns the event: four terminal transport failures, but
    // the latest grant says one. The grant is what the caller honored, so
    // the packet waits on its deadline instead of being declared exhausted
    // by a count nobody granted.
    let deadline = backoff_deadline(T0, 0).expect("computes");
    let mut b = at_fix();
    for _ in 0..4 {
        b = b.failed(Stage::Fix, 1, "transport: dropped");
    }
    let history_ahead = b.retry_event(Stage::Fix, 1, 1, &deadline).build();
    assert_eq!(
        advance(&history_ahead),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Fix, 1),
            not_before: Some(deadline)
        }
    );
}

#[test]
fn a_transport_failure_with_no_grant_yet_counts_from_history_and_waits_on_nothing() {
    // The caller appends `proto.retry` before honoring the action, so this
    // is the window before the first grant: the count falls back to the
    // history and there is honestly no deadline to report.
    let view = at_fix().failed(Stage::Fix, 1, "transport: dropped").build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Fix, 1),
            not_before: None
        }
    );
}

#[test]
fn semantic_failure_consumes_the_round_and_stops_done() {
    let view = at_fix()
        .failed(Stage::Fix, 1, "could not apply findings")
        .build();
    // Round spent with no completed fix: no re-review exists; the run stops
    // as Done carrying the standing review verdict.
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            final_verdict: Some(Verdict::RequestChanges)
        })
    );
}

#[test]
fn an_unspawned_fix_seat_does_not_consume_the_round() {
    // A fix seat retired between its claim and a spawn applied nothing, so
    // the round it never used is still there. Classified semantic, it would
    // spend the run's ONE fix round and stop the run on a seat that never
    // ran.
    let view = at_fix()
        .failed(
            Stage::Fix,
            1,
            "unspawned: attempt refused before spawn: the host fallback could not be recorded",
        )
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Fix, 1),
            not_before: None
        }
    );
}

#[test]
fn unspawned_and_transport_failures_share_the_one_budget() {
    // Both mean "no seat spoke", so they charge the same bounded budget —
    // an alternating outage cannot outlive it by splitting the count.
    let view = at_fix()
        .failed(Stage::Fix, 1, "transport: rate limited")
        .failed(Stage::Fix, 1, "unspawned: attempt refused before spawn: io")
        .failed(Stage::Fix, 1, "transport: rate limited")
        .failed(Stage::Fix, 1, "unspawned: attempt refused before spawn: io")
        .build();
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::ProviderUnavailable {
            stage: Stage::Fix,
            attempts: 4
        })
    );
}

#[test]
fn empty_and_missing_notes_count_as_semantic() {
    let view = at_fix().failed(Stage::Fix, 1, "").build();
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            final_verdict: Some(Verdict::RequestChanges)
        })
    );
}

#[test]
fn fourth_transport_failure_exhausts_the_budget_of_three() {
    let mut b = at_fix();
    for _ in 0..4 {
        b = b.failed(Stage::Fix, 1, "transport: rate limited");
    }
    assert_eq!(
        advance(&b.build()),
        NextAction::Stop(Terminal::ProviderUnavailable {
            stage: Stage::Fix,
            attempts: 4
        })
    );
}

#[test]
fn three_transport_failures_stay_within_the_budget() {
    let deadline = backoff_deadline(T0, 2).expect("computes");
    assert_eq!(deadline, "2026-08-12T00:02:00.000000000Z");
    let mut b = at_fix();
    for _ in 0..3 {
        b = b.failed(Stage::Fix, 1, "transport: rate limited");
    }
    let view = b.retry_event(Stage::Fix, 1, 3, &deadline).build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::Fix, 1),
            not_before: Some(deadline)
        }
    );
}

#[test]
fn transport_policy_applies_uniformly_to_implement() {
    // The transport retry policy is per packet and uniform across provider
    // stages.
    let mut b = ViewBuilder::new(RUN)
        .op_done(forged_proto::MachineStage::Resolve, 0)
        .packet(Stage::Implement, 1);
    for _ in 0..4 {
        b = b.failed(Stage::Implement, 1, "transport: spawn failed");
    }
    assert_eq!(
        advance(&b.build()),
        NextAction::Stop(Terminal::ProviderUnavailable {
            stage: Stage::Implement,
            attempts: 4
        })
    );
}

#[test]
fn transport_failed_review_leg_keeps_the_join_incomplete() {
    let deadline = backoff_deadline(T0, 0).expect("computes");
    let view = at_first_review(RUN)
        .completed(Stage::ReviewClaude, 1, review(Verdict::Approve))
        .failed(Stage::ReviewCodex, 1, "transport: dropped")
        .retry_event(Stage::ReviewCodex, 1, 1, &deadline)
        .build();
    assert_eq!(
        advance(&view),
        NextAction::AwaitPacket {
            packet_id: packet_id(RUN, Stage::ReviewCodex, 1),
            not_before: Some(deadline)
        }
    );
}
