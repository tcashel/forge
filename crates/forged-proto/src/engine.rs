//! The pure slice/v1 advance engine: same [`RunView`] in, same
//! [`NextAction`] out — no I/O, no clock reads, no randomness. Any caller
//! may push any run at any time.
//!
//! Stage graph: `Resolve → Implement → Gate → Push → DraftPr → Review →
//! [Fix → ReGate → Push → ReReview] → Stop`. Provider stages become packets
//! and attempts; machine steps become operations keyed
//! `<run_id>/<step>/<round>` (`round` is 0 before the fix round, 1 after),
//! so the two `Push` positions never collide.

use std::collections::{BTreeMap, HashMap};

use forged_ledger::{
    AttemptRow, AttemptState, OperationRow, OperationState, PacketRow, RunRow, RunState,
};
use forged_types::{Outcome, ProviderHints, Stage, Verdict};

use crate::error::ProtoError;
use crate::events::{stage_str, widen_rfc3339, ProtoEvent};

/// The engine's input: a projection of one run, named `RunView` (not
/// `RunState` — `forged_ledger::RunState` already means the run's lifecycle
/// column, which is one field of this view).
#[derive(Debug, Clone, PartialEq)]
pub struct RunView {
    /// The run row, verbatim.
    pub run: RunRow,
    /// The run's packets, verbatim.
    pub packets: Vec<PacketRow>,
    /// Terminal attempt history per packet id, oldest first, reconstructed
    /// from `attempt.state` events plus `get_attempt` for completed ids.
    pub terminal_attempts: BTreeMap<String, Vec<TerminalAttempt>>,
    /// Attempts in `running` or `revoking`.
    pub live_attempts: Vec<AttemptRow>,
    /// Operation rows still `in_progress` — what the reconciler settles by
    /// effect class. An in-flight row never means a step is done; the
    /// engine's settlement test reads `settled_operations` alone.
    pub inflight_operations: Vec<OperationRow>,
    /// Machine-step operation rows that reached `OperationState::Terminal`.
    ///
    /// A terminal row is the *only* evidence that a machine step ran to a
    /// settlement, and it is what [`advance`] reads. Neither the
    /// `proto.operation.request` event nor the absence of an in-flight row
    /// proves anything: the request event is appended *before*
    /// `begin_operation`, so a crash between the two leaves a requested step
    /// with no row at all, and `release_operation` **deletes** the row of a
    /// `SafeRetry` step it hands back for redo
    /// (`forged-ledger/src/operations.rs:287`). Both of those states mean the
    /// step still has to run.
    ///
    /// AMENDED (operator-adjudicated 2026-08-12): this field is sanctioned.
    /// The spec first pinned `RunView` *without* it, and the amendment adds
    /// it, because the pinned view carried no evidence distinguishing a
    /// settled step from a released or never-begun one — both crash windows
    /// above wear the same "requested, not in flight" shape — so a resumed
    /// run would walk past a gate the reconciler had scheduled for redo.
    /// `project_run` fills it with `find_operation` probes per machine step;
    /// the same amendment sanctions those projection reads.
    pub settled_operations: Vec<OperationRow>,
    /// `proto.*` events for this run, in `event_id` order, already parsed.
    pub proto_events: Vec<ProtoEvent>,
    /// Caller-supplied per-stage provider hints. `advance` copies the
    /// stage's entry verbatim and never invents hint values.
    ///
    /// AMENDED (operator-adjudicated 2026-08-12): the spec's original
    /// `BTreeMap` is impossible — the merged `forged_types::Stage` derives
    /// `Hash + Eq` but not `Ord`, and this slice may not touch the frozen
    /// types crate. `HashMap` is correct, and determinism is unaffected
    /// because `advance` performs keyed lookups only and never iterates the
    /// roster.
    pub roster: HashMap<Stage, ProviderHints>,
    /// Gate commands, in order, for `Gate` and `ReGate`.
    pub gate_commands: Vec<String>,
    /// Caller-supplied transport-retry budget per packet; this slice's
    /// callers and every fixture pass `3`.
    pub transport_retry_budget: u32,
    /// Caller-supplied RFC-3339 UTC stamp in the ledger's fixed-width
    /// 30-byte form, so time is an input, never a read.
    pub now: String,
}

/// One terminal attempt in a packet's history.
#[derive(Debug, Clone, PartialEq)]
pub struct TerminalAttempt {
    /// The attempt row id.
    pub attempt_id: i64,
    /// `Completed`, `Failed`, or `Reclaimed` — never a live state.
    pub state: AttemptState,
    /// The landed outcome, for completed attempts whose result parsed.
    pub outcome: Option<Outcome>,
    /// The note supplied to `fail_packet`, for failed attempts.
    pub fail_note: Option<String>,
}

/// One packet the caller must open.
#[derive(Debug, Clone, PartialEq)]
pub struct PacketIntent {
    /// The provider stage to open.
    pub stage: Stage,
    /// The packet's seq: 1 for a stage's first packet, the next unused seq
    /// for each subsequent fan-out.
    pub seq: i64,
    /// Provider hints, copied verbatim from `RunView.roster[stage]`.
    pub hints: ProviderHints,
}

/// What the run should do next.
#[derive(Debug, Clone, PartialEq)]
pub enum NextAction {
    /// Run (or finish) a machine step, recorded through the operation store.
    RunMachine(MachineStage),
    /// One or more packets to open atomically at the same `seq`. Review fans
    /// out as a two-element vec; every other stage yields exactly one
    /// element.
    OpenPackets(Vec<PacketIntent>),
    /// Wait on a packet. When the named packet has a live attempt this means
    /// *wait for that attempt*; when the packet is open with no live attempt
    /// — the shape a transport-failed attempt leaves behind — it means
    /// *claim it again, no earlier than `not_before`*.
    AwaitPacket {
        /// The packet to wait on or re-claim.
        packet_id: String,
        /// The retry deadline, from the packet's latest `proto.retry` event;
        /// `None` unless a transport retry is pending.
        not_before: Option<String>,
    },
    /// The run is over.
    Stop(Terminal),
}

/// The run's stop vocabulary — wave-4's kill-matrix falsifier consumes this
/// as mechanical wiring. Exactly three variants: fix-round exhaustion is a
/// `Done` carrying the final verdict, and a `HumanAmbiguous` quarantine
/// leaves its operation row in progress and is reported through
/// `ReconcileReport::quarantined`, not here.
#[derive(Debug, Clone, PartialEq)]
pub enum Terminal {
    /// The run finished its protocol. `final_verdict` is the merged verdict
    /// of the last review fan-out that produced one — the informational
    /// `ReReview`'s verdict when a fix round ran, otherwise the standing
    /// `Review` verdict — and `None` only when no review leg ever spoke.
    Done {
        /// The final merged verdict, when any leg ever spoke.
        final_verdict: Option<Verdict>,
    },
    /// A provider stage exhausted its transport-retry budget without the
    /// provider ever getting to think.
    ProviderUnavailable {
        /// The packet's stage.
        stage: Stage,
        /// The number of transport failures observed.
        attempts: u32,
    },
    /// The run's lifecycle column left `Active` outside the protocol — an
    /// operator stop or an external halt.
    ExternallyStopped {
        /// The stored stop reason, verbatim.
        reason: String,
    },
}

/// The machine-run steps. `forged_types::Stage` carries precisely the
/// provider-run stages, so this crate declares the machine ones. `Push`
/// occurs at two positions in the graph with this single variant; which
/// occurrence an action refers to is derived from the `RunView`, never from
/// the enum.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum MachineStage {
    /// Worktree + lease resolution.
    Resolve,
    /// The pre-fix gate run.
    Gate,
    /// Opening the draft PR (always preceded by a `Push`).
    DraftPr,
    /// The post-fix gate run.
    ReGate,
    /// Pushing the branch — before `DraftPr` and again after `ReGate`.
    Push,
}

impl MachineStage {
    /// The lowercase step name used in idempotency keys and operation
    /// names.
    pub fn as_str(&self) -> &'static str {
        match self {
            MachineStage::Resolve => "resolve",
            MachineStage::Gate => "gate",
            MachineStage::DraftPr => "draftpr",
            MachineStage::ReGate => "regate",
            MachineStage::Push => "push",
        }
    }
}

/// The machine step's operation idempotency key:
/// `<run_id>/<step>/<round>`, with `round` 0 before the fix round and 1
/// after.
pub fn machine_idempotency_key(run_id: &str, step: MachineStage, round: u32) -> String {
    format!("{run_id}/{}/{round}", step.as_str())
}

/// Every machine step the slice/v1 graph can record, paired with its round —
/// `Resolve → Gate → Push → DraftPr` in round 0, `ReGate → Push` in round 1.
/// The set is closed and fixed, which is what lets the projection probe for
/// each step's settled operation row with `find_operation`.
pub const MACHINE_STEPS: [(MachineStage, u32); 6] = [
    (MachineStage::Resolve, 0),
    (MachineStage::Gate, 0),
    (MachineStage::Push, 0),
    (MachineStage::DraftPr, 0),
    (MachineStage::ReGate, 1),
    (MachineStage::Push, 1),
];

/// How a packet failure counts against the run.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FailureKind {
    /// The provider never got to think; retried for free within the budget.
    Transport,
    /// The provider tried; the failure consumes what the stage's failure
    /// consumes.
    Semantic,
}

/// Classify a `fail_packet` note: byte-exact, case-sensitive, no trimming.
/// A missing note (callers pass `fail_note.as_deref().unwrap_or("")`) and an
/// empty note are both `Semantic` — unknown shapes fail toward consuming the
/// budget, the conservative direction.
pub fn classify_failure(fail_note: &str) -> FailureKind {
    if fail_note.starts_with("transport:") {
        FailureKind::Transport
    } else {
        FailureKind::Semantic
    }
}

/// The backoff, in seconds, granted after the n-th transport failure of a
/// packet, zero-indexed: `30s × 2^n` — 30s, then 60s, then 120s.
pub fn transport_backoff_s(n: u32) -> u64 {
    30u64.saturating_mul(2u64.saturating_pow(n))
}

/// The retry deadline after the n-th transport failure (zero-indexed) at
/// `failed_at`: the failure stamp plus [`transport_backoff_s`], in the
/// ledger's fixed-width 30-byte form. A driver convenience for computing
/// `proto.retry`'s `retryAfter`; `advance` itself only ever reads the event.
pub fn backoff_deadline(failed_at: &str, n: u32) -> Result<String, ProtoError> {
    let ts: jiff::Timestamp = failed_at
        .parse()
        .map_err(|err| ProtoError::Projection(format!("cannot parse {failed_at:?}: {err}")))?;
    let nanos = i128::from(transport_backoff_s(n)).saturating_mul(1_000_000_000);
    let deadline = jiff::Timestamp::from_nanosecond(ts.as_nanosecond().saturating_add(nanos))
        .map_err(|err| ProtoError::Projection(format!("deadline out of range: {err}")))?;
    Ok(widen_rfc3339(&deadline.to_string()))
}

/// How one packet (or one review leg) stands, as far as the view can tell.
enum LegState<'v> {
    /// No packet row exists for the stage (at the seq under evaluation).
    Missing,
    /// The packet needs the caller: a live attempt to wait for, or an open
    /// packet to (re-)claim once `not_before` passes.
    Pending {
        /// The packet.
        packet_id: &'v str,
        /// The pending retry deadline, when one is recorded.
        not_before: Option<String>,
    },
    /// The packet blew its transport-retry budget.
    Exhausted {
        /// Transport failures observed.
        attempts: u32,
    },
    /// The last attempt failed with a semantic note — the provider tried.
    FailedSemantic,
    /// A completed attempt landed this outcome.
    Completed {
        /// The parsed outcome, when the landed result parsed.
        outcome: Option<&'v Outcome>,
    },
}

/// The pure decision function: what should this run do next?
///
/// Total on every `RunView` a caller can construct, including malformed
/// ones: a roster missing the stage the engine must open resolves to
/// `Stop(Terminal::ExternallyStopped { reason: "roster missing stage
/// <stage>" })` — loud, inspectable, and never a panic in the orchestrator.
pub fn advance(view: &RunView) -> NextAction {
    if view.run.state == RunState::Stopped {
        return NextAction::Stop(Terminal::ExternallyStopped {
            reason: view.run.stop_reason.clone().unwrap_or_default(),
        });
    }

    // Round-0 machine prologue.
    if !op_settled(view, MachineStage::Resolve, 0) {
        return NextAction::RunMachine(MachineStage::Resolve);
    }

    // Implement.
    match leg_state(view, Stage::Implement, None) {
        LegState::Missing => return open_stage(view, Stage::Implement),
        LegState::Pending {
            packet_id,
            not_before,
        } => {
            return NextAction::AwaitPacket {
                packet_id: packet_id.to_owned(),
                not_before,
            }
        }
        // A semantically failed implement leaves the packet legally
        // re-claimable; the engine reports the claim-again shape.
        LegState::FailedSemantic => {
            return await_claim_again(view, Stage::Implement);
        }
        LegState::Exhausted { attempts } => {
            return NextAction::Stop(Terminal::ProviderUnavailable {
                stage: Stage::Implement,
                attempts,
            })
        }
        LegState::Completed { .. } => {}
    }

    if !op_settled(view, MachineStage::Gate, 0) {
        return NextAction::RunMachine(MachineStage::Gate);
    }
    if !op_settled(view, MachineStage::Push, 0) {
        return NextAction::RunMachine(MachineStage::Push);
    }
    if !op_settled(view, MachineStage::DraftPr, 0) {
        return NextAction::RunMachine(MachineStage::DraftPr);
    }

    // First review fan-out.
    let review_seqs = review_seqs(view);
    let Some(&first_seq) = review_seqs.first() else {
        return open_review_fanout(view);
    };
    let (first_verdict, first_produced) = match eval_fanout(view, first_seq) {
        FanoutJoin::NotDone(action) => return action,
        FanoutJoin::Done { control, produced } => (control, produced),
    };

    if first_verdict == Verdict::Approve {
        return NextAction::Stop(Terminal::Done {
            final_verdict: first_produced,
        });
    }

    // The one semantic fix round.
    match leg_state(view, Stage::Fix, None) {
        LegState::Missing => return open_stage(view, Stage::Fix),
        LegState::Pending {
            packet_id,
            not_before,
        } => {
            return NextAction::AwaitPacket {
                packet_id: packet_id.to_owned(),
                not_before,
            }
        }
        LegState::Exhausted { attempts } => {
            return NextAction::Stop(Terminal::ProviderUnavailable {
                stage: Stage::Fix,
                attempts,
            })
        }
        // A semantically failed fix consumes the round; with the round spent
        // and no completed fix, no `ReReview` exists and the run stops as
        // `Done` carrying the standing review verdict.
        LegState::FailedSemantic => {
            return NextAction::Stop(Terminal::Done {
                final_verdict: first_produced,
            })
        }
        LegState::Completed { .. } => {}
    }

    // Round-1 machine steps.
    if !op_settled(view, MachineStage::ReGate, 1) {
        return NextAction::RunMachine(MachineStage::ReGate);
    }
    if !op_settled(view, MachineStage::Push, 1) {
        return NextAction::RunMachine(MachineStage::Push);
    }

    // The informational re-review: the fan-out at a seq above the first,
    // which exists exactly because a completed `Fix` packet does.
    let Some(&second_seq) = review_seqs.iter().find(|&&s| s > first_seq) else {
        return open_review_fanout(view);
    };
    match eval_fanout(view, second_seq) {
        FanoutJoin::NotDone(action) => action,
        FanoutJoin::Done { produced, .. } => NextAction::Stop(Terminal::Done {
            final_verdict: produced.or(first_produced),
        }),
    }
}

/// The distinct review-fan-out seqs present in the view, ascending.
fn review_seqs(view: &RunView) -> Vec<i64> {
    let mut seqs: Vec<i64> = view
        .packets
        .iter()
        .filter(|p| matches!(p.stage, Stage::ReviewClaude | Stage::ReviewCodex))
        .map(|p| p.seq)
        .collect();
    seqs.sort_unstable();
    seqs.dedup();
    seqs
}

/// How one evaluated review fan-out resolved.
enum FanoutJoin {
    /// The join is incomplete; the caller must do this first.
    NotDone(NextAction),
    /// Both legs are terminal.
    Done {
        /// The control verdict: the severest contribution, failing closed to
        /// `RequestChanges` when no leg contributed.
        control: Verdict,
        /// The merged verdict when at least one leg contributed; `None` when
        /// no leg spoke.
        produced: Option<Verdict>,
    },
}

fn eval_fanout(view: &RunView, seq: i64) -> FanoutJoin {
    let claude = leg_state(view, Stage::ReviewClaude, Some(seq));
    let codex = leg_state(view, Stage::ReviewCodex, Some(seq));

    // A missing leg in an existing fan-out is repaired by opening it at the
    // same seq.
    for (stage, leg) in [(Stage::ReviewClaude, &claude), (Stage::ReviewCodex, &codex)] {
        if matches!(leg, LegState::Missing) {
            return FanoutJoin::NotDone(match intent(view, stage, seq) {
                Some(intent) => NextAction::OpenPackets(vec![intent]),
                None => roster_missing(stage),
            });
        }
    }

    for (stage, leg) in [(Stage::ReviewClaude, &claude), (Stage::ReviewCodex, &codex)] {
        if let LegState::Exhausted { attempts } = leg {
            return FanoutJoin::NotDone(NextAction::Stop(Terminal::ProviderUnavailable {
                stage,
                attempts: *attempts,
            }));
        }
    }

    let pending = |leg: &LegState<'_>| -> Option<(String, Option<String>)> {
        match leg {
            LegState::Pending {
                packet_id,
                not_before,
            } => Some(((*packet_id).to_owned(), not_before.clone())),
            _ => None,
        }
    };
    match (pending(&claude), pending(&codex)) {
        (Some(a), Some(b)) => {
            // Deterministic: the lexicographically smaller packet id.
            let (packet_id, not_before) = if a.0 <= b.0 { a } else { b };
            return FanoutJoin::NotDone(NextAction::AwaitPacket {
                packet_id,
                not_before,
            });
        }
        (Some((packet_id, not_before)), None) | (None, Some((packet_id, not_before))) => {
            return FanoutJoin::NotDone(NextAction::AwaitPacket {
                packet_id,
                not_before,
            });
        }
        (None, None) => {}
    }

    // Both legs terminal: merge. Only legs that spoke contribute;
    // `available: false` is an honest absence, never an approval; a leg that
    // terminally failed with a semantic note tried and died, contributing
    // `RequestChanges`; zero contributing legs fail closed to
    // `RequestChanges`.
    let contributions: Vec<Verdict> = [&claude, &codex]
        .into_iter()
        .filter_map(contribution)
        .collect();
    let produced = contributions.iter().copied().max_by_key(|v| severity(*v));
    FanoutJoin::Done {
        control: produced.unwrap_or(Verdict::RequestChanges),
        produced,
    }
}

/// What a terminal review leg contributes to the merge.
fn contribution(leg: &LegState<'_>) -> Option<Verdict> {
    match leg {
        LegState::Completed {
            outcome: Some(Outcome::Review {
                verdict, available, ..
            }),
        } => {
            if *available {
                Some(*verdict)
            } else {
                None
            }
        }
        // A completed leg that landed no parseable review verdict neither
        // spoke nor honestly reported absence: fail closed.
        LegState::Completed { outcome: _ } => Some(Verdict::RequestChanges),
        LegState::FailedSemantic => Some(Verdict::RequestChanges),
        _ => None,
    }
}

/// Severity order for the merge: `Block > RequestChanges > Approve`.
fn severity(v: Verdict) -> u8 {
    match v {
        Verdict::Approve => 0,
        Verdict::RequestChanges => 1,
        Verdict::Block => 2,
    }
}

/// The state of a stage's packet — the highest-seq packet for single-packet
/// stages, or the packet at exactly `seq` for a review leg.
fn leg_state<'v>(view: &'v RunView, stage: Stage, seq: Option<i64>) -> LegState<'v> {
    let packet = view
        .packets
        .iter()
        .filter(|p| p.stage == stage && seq.is_none_or(|s| p.seq == s))
        .max_by_key(|p| p.seq);
    let Some(packet) = packet else {
        return LegState::Missing;
    };
    let packet_id = packet.packet_id.as_str();
    let history: &[TerminalAttempt] = view
        .terminal_attempts
        .get(packet_id)
        .map(Vec::as_slice)
        .unwrap_or(&[]);

    if let Some(done) = history
        .iter()
        .rev()
        .find(|t| t.state == AttemptState::Completed)
    {
        return LegState::Completed {
            outcome: done.outcome.as_ref(),
        };
    }
    if view.live_attempts.iter().any(|a| a.packet_id == packet_id) {
        return LegState::Pending {
            packet_id,
            not_before: None,
        };
    }
    let Some(last) = history.last() else {
        // Open and never attempted: claim it.
        return LegState::Pending {
            packet_id,
            not_before: None,
        };
    };
    match last.state {
        AttemptState::Failed => match classify_failure(last.fail_note.as_deref().unwrap_or("")) {
            FailureKind::Transport => {
                let (attempts, not_before) = transport_retry_state(view, packet_id, history);
                if attempts > view.transport_retry_budget {
                    LegState::Exhausted { attempts }
                } else {
                    LegState::Pending {
                        packet_id,
                        not_before,
                    }
                }
            }
            FailureKind::Semantic => LegState::FailedSemantic,
        },
        // A reclaimed attempt leaves the packet open for a successor.
        _ => LegState::Pending {
            packet_id,
            not_before: None,
        },
    }
}

/// A packet's transport-retry standing: how many transport failures it has
/// accumulated, and the deadline before which it may not be claimed again.
///
/// **One source, read once.** The spec makes the packet's latest
/// `proto.retry` event the paired carrier of both numbers — the caller
/// appends it, carrying the count it computed, before honoring the action —
/// so the count and the deadline are read out of that one event together and
/// can never drift apart. Counting terminal attempts is the fallback for the
/// one state where no such event exists yet: the very first transport
/// failure of a packet, before its grant was recorded. That fallback yields
/// no deadline, which is honest — none has been granted.
fn transport_retry_state(
    view: &RunView,
    packet_id: &str,
    history: &[TerminalAttempt],
) -> (u32, Option<String>) {
    match latest_retry(view, packet_id) {
        Some((transport_failures, retry_after)) => (transport_failures, Some(retry_after)),
        None => (transport_failures(history), None),
    }
}

/// The packet's latest `proto.retry` grant: its failure count and deadline.
fn latest_retry(view: &RunView, packet_id: &str) -> Option<(u32, String)> {
    view.proto_events.iter().rev().find_map(|e| match e {
        ProtoEvent::Retry {
            packet_id: p,
            transport_failures,
            retry_after,
        } if p == packet_id => Some((*transport_failures, retry_after.clone())),
        _ => None,
    })
}

/// Transport failures observed for a packet, from its terminal history —
/// the fallback used only until the packet's first `proto.retry` grant.
fn transport_failures(history: &[TerminalAttempt]) -> u32 {
    let count = history
        .iter()
        .filter(|t| {
            t.state == AttemptState::Failed
                && classify_failure(t.fail_note.as_deref().unwrap_or("")) == FailureKind::Transport
        })
        .count();
    u32::try_from(count).unwrap_or(u32::MAX)
}

/// Whether the machine step at `round` is settled: a **terminal operation
/// row** exists under its name and idempotency key.
///
/// Nothing weaker will do. "Requested and not in flight" admits two states
/// that are emphatically not settled, and the step must run again in both:
///
/// - the request event is appended immediately *before* `begin_operation`,
///   so a crash between the two leaves the request recorded and no row
///   anywhere;
/// - `release_operation` deletes the `in_progress` row of a `SafeRetry` step
///   the reconciler handed back for redo.
///
/// A terminal row is also what an `ObserveOnly` step's reconcile settlement
/// leaves behind — `resolve_interrupted_operation` stores the observation as
/// the row's terminal envelope — so port-confirmed effects settle through
/// the same single test.
fn op_settled(view: &RunView, step: MachineStage, round: u32) -> bool {
    let key = machine_idempotency_key(&view.run.run_id, step, round);
    view.settled_operations.iter().any(|o| {
        o.idempotency_key == key && o.name == step.as_str() && o.state == OperationState::Terminal
    })
}

/// The next unused seq for a stage (1 for its first packet).
fn next_seq(view: &RunView, stage: Stage) -> i64 {
    view.packets
        .iter()
        .filter(|p| p.stage == stage)
        .map(|p| p.seq)
        .max()
        .map_or(1, |s| s + 1)
}

/// The intent for one stage, or `None` when the caller's roster has no entry
/// for it — hints are input and `advance` never invents them.
fn intent(view: &RunView, stage: Stage, seq: i64) -> Option<PacketIntent> {
    let hints = view.roster.get(&stage)?.clone();
    Some(PacketIntent { stage, seq, hints })
}

/// What a roster gap resolves to. The run cannot proceed — the engine would
/// have to invent provider hints to open the stage — but it stops loudly
/// with the offending stage named, and `advance` stays total.
fn roster_missing(stage: Stage) -> NextAction {
    NextAction::Stop(Terminal::ExternallyStopped {
        reason: format!("roster missing stage {}", stage_str(stage)),
    })
}

fn open_stage(view: &RunView, stage: Stage) -> NextAction {
    let seq = next_seq(view, stage);
    match intent(view, stage, seq) {
        Some(intent) => NextAction::OpenPackets(vec![intent]),
        None => roster_missing(stage),
    }
}

/// Open both review legs atomically at the same (next unused) seq.
fn open_review_fanout(view: &RunView) -> NextAction {
    let seq = next_seq(view, Stage::ReviewClaude).max(next_seq(view, Stage::ReviewCodex));
    let (Some(claude), Some(codex)) = (
        intent(view, Stage::ReviewClaude, seq),
        intent(view, Stage::ReviewCodex, seq),
    ) else {
        // Deterministic: the claude leg is reported first when both are gone.
        let missing = if view.roster.contains_key(&Stage::ReviewClaude) {
            Stage::ReviewCodex
        } else {
            Stage::ReviewClaude
        };
        return roster_missing(missing);
    };
    NextAction::OpenPackets(vec![claude, codex])
}

/// The claim-again shape for a stage whose packet is open with no live
/// attempt.
fn await_claim_again(view: &RunView, stage: Stage) -> NextAction {
    let packet = view
        .packets
        .iter()
        .filter(|p| p.stage == stage)
        .max_by_key(|p| p.seq);
    match packet {
        Some(p) => NextAction::AwaitPacket {
            packet_id: p.packet_id.clone(),
            not_before: None,
        },
        None => open_stage(view, stage),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classify_failure_is_byte_exact() {
        assert_eq!(
            classify_failure("transport: rate limited"),
            FailureKind::Transport
        );
        assert_eq!(classify_failure("transport:"), FailureKind::Transport);
        assert_eq!(classify_failure(""), FailureKind::Semantic);
        assert_eq!(classify_failure("Transport: x"), FailureKind::Semantic);
        assert_eq!(classify_failure(" transport: x"), FailureKind::Semantic);
        assert_eq!(classify_failure("provider exploded"), FailureKind::Semantic);
    }

    #[test]
    fn transport_backoff_doubles_from_thirty() {
        assert_eq!(transport_backoff_s(0), 30);
        assert_eq!(transport_backoff_s(1), 60);
        assert_eq!(transport_backoff_s(2), 120);
    }

    #[test]
    fn backoff_deadline_adds_the_backoff() {
        let deadline = backoff_deadline("2026-08-12T00:00:00.000000000Z", 1).expect("computes");
        assert_eq!(deadline, "2026-08-12T00:01:00.000000000Z");
    }

    #[test]
    fn machine_idempotency_keys_are_distinct_per_round() {
        assert_eq!(
            machine_idempotency_key("run-1", MachineStage::Push, 0),
            "run-1/push/0"
        );
        assert_eq!(
            machine_idempotency_key("run-1", MachineStage::Push, 1),
            "run-1/push/1"
        );
        assert_eq!(
            machine_idempotency_key("run-1", MachineStage::DraftPr, 0),
            "run-1/draftpr/0"
        );
    }

    #[test]
    fn severity_orders_block_over_request_changes_over_approve() {
        assert!(severity(Verdict::Block) > severity(Verdict::RequestChanges));
        assert!(severity(Verdict::RequestChanges) > severity(Verdict::Approve));
    }
}
