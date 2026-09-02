//! The reconcile saga: make a crashed or hijacked run safe to resume.
//!
//! The revoke order is load-bearing: `revoke_attempt` commits the durable
//! `revoking` marker BEFORE any external kill or reclaim; `kill_confirmed`
//! succeeds only on verified death; the external work-lease reclaim must be scoped
//! and name the requested holder; only then `mark_reclaimed`; only then may
//! a successor claim. Failure means stop, not improvise: a port failure
//! surfaces as [`ProtoError::Port`] with the attempt left `revoking`, and
//! the next invocation resumes from that durable marker.
//!
//! [`stop_attempt`] is the attempt-local sibling of that order, and a
//! SEPARATE function on purpose: it ends at `stopped` after the same
//! confirmed death and reclaims nothing, because the work lease is work-scoped
//! and shared with every sibling generation. One function serving both
//! scopes is what let an attempt-local stop reach for a work-scoped lease.
//!
//! Which of the two resumes a durable `revoking` marker is read from the
//! marker itself: [`AttemptRow::revoke_scope`] committed with it. A stop
//! whose `kill_confirmed` failed leaves an attempt-scoped marker, and this
//! pass finishes it AS A STOP — resuming it through the work-scoped order
//! would re-arm the exact defect the split removes.
//!
//! The ledger is synchronous by design; every ledger call here goes through
//! `tokio::task::spawn_blocking`, and no transaction ever spans an
//! `.await`.

use std::collections::HashMap;

use forged_ledger::{
    AttemptRow, AttemptState, EffectClass, Ledger, LedgerError, OperationRow, RevokeScope, RunRow,
};
use forged_types::{ErrorCode, OperationRequest, OperationResponse, Outcome, PacketResult, Stage};
use serde_json::{json, Value};

use crate::error::{PortError, ProtoError};
use crate::events::{parse_proto_events, record, ProtoEvent};
use crate::ports::{ReconcilePorts, SessionLiveness};
use crate::project::fetch_all_events;

/// A local mirror of the work-lease TTL
/// (`forged_ledger::WORK_LEASE_TTL_S`) — the ledger is a port here, not a
/// dependency.
const WORK_LEASE_TTL_S: u64 = 300;

/// The epic's frozen timing equation, mirroring
/// the reclaim ports' timing: reclaim fires at TTL + older_than,
/// so `older_than = stage_budget - TTL`, saturating at 0.
fn reclaim_older_than(stage_budget_s: u64) -> u64 {
    stage_budget_s.saturating_sub(WORK_LEASE_TTL_S)
}

/// Caller-supplied reconcile inputs. This crate reads no environment
/// variables; packet-scoped fields remain present for source compatibility,
/// while the stored packet contract is the runtime authority.
#[derive(Debug, Clone)]
pub struct ReconcileConfig {
    /// Compatibility projection for callers predating packet-frozen budgets.
    /// Reconciliation reads the opened packet's `contract.budget_s`.
    ///
    /// AMENDED (operator-adjudicated 2026-08-12): `HashMap` for the same
    /// reason as [`crate::RunView::roster`] — the merged
    /// `forged_types::Stage` derives `Hash + Eq` and not `Ord`, and reconcile
    /// looks budgets up by key rather than iterating them.
    pub stage_budget_s: HashMap<Stage, u64>,
    /// Frozen bound for each TERM/close and KILL verification phase.
    pub termination_grace_s: u64,
    /// Compatibility projection for callers predating packet-frozen gates.
    /// Harvest replays the claimed packet's `contract.gate_commands`.
    pub gate_commands: Vec<String>,
}

/// What one reconcile pass did — purely informational; all durable state is
/// in the ledger.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct ReconcileReport {
    /// Attempts verified alive and within budget, left alone.
    pub left_running: Vec<i64>,
    /// Attempts that reached `reclaimed` (including convergence with a
    /// racing reconciler).
    pub reclaimed: Vec<i64>,
    /// Attempts settled at `stopped` — an operator's attempt-local stop, no
    /// lease touched.
    ///
    /// Unlike [`ReconcileReport::reclaimed`] this reports the run's ALREADY
    /// terminal stops as well as the ones this pass drove there, because a
    /// stop is an operator's own decision and a pass that silently omitted
    /// it would read as "nothing to say about that attempt" when the honest
    /// answer is "an operator stopped it, and I deliberately did not resume
    /// the saga for it".
    pub stopped: Vec<i64>,
    /// Operations released for redo: every `SafeRetry` row, plus any
    /// `ObserveOnly` row whose observation did not confirm its effect.
    pub released: Vec<String>,
    /// `ObserveOnly` operations settled by an observation that confirmed the
    /// effect.
    pub observed: Vec<String>,
    /// `HumanAmbiguous` operations quarantined (or recorded) and left in
    /// progress.
    pub quarantined: Vec<String>,
    /// Harvested claims that disagreed with recomputed ground truth.
    pub harvest_mismatches: Vec<String>,
    /// Attempts left `revoking` after a reclaim refusal shape; resumed next
    /// pass.
    pub deferred: Vec<i64>,
    /// Kill-confirmed deadline attempts settled as retryable timeout
    /// failures. Each one has exactly one attempt-addressed retry grant.
    pub timed_out: Vec<i64>,
}

/// What [`land_packet_result`] did with a result.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LandOutcome {
    /// The ledger accepted the completion.
    Completed,
    /// The fence refused the stale token; the bytes went to quarantine.
    Quarantined,
}

/// Run one blocking closure against the ledger without holding anything
/// across the await.
async fn on_ledger<T, F>(ledger: &Ledger, f: F) -> Result<T, ProtoError>
where
    T: Send + 'static,
    F: FnOnce(&Ledger) -> Result<T, ProtoError> + Send + 'static,
{
    let handle = ledger.clone();
    tokio::task::spawn_blocking(move || f(&handle))
        .await
        .map_err(|err| ProtoError::Projection(format!("blocking task join failure: {err}")))?
}

fn port_failure(attempt_id: i64, step: &str, source: PortError) -> ProtoError {
    ProtoError::Port {
        attempt_id,
        step: step.to_owned(),
        source,
    }
}

fn parse_stamp(s: &str) -> Result<jiff::Timestamp, ProtoError> {
    s.parse()
        .map_err(|err| ProtoError::Projection(format!("cannot parse timestamp {s:?}: {err}")))
}

/// The immutable wall-clock deadline derived from one durable attempt start.
pub fn stage_deadline_at(started_at: &str, budget_s: u64) -> Result<String, ProtoError> {
    let started = parse_stamp(started_at)?;
    let deadline = jiff::Timestamp::from_nanosecond(
        started
            .as_nanosecond()
            .saturating_add(i128::from(budget_s).saturating_mul(1_000_000_000)),
    )
    .map_err(|error| ProtoError::Projection(format!("stage deadline out of range: {error}")))?;
    Ok(crate::widen_rfc3339(&deadline.to_string()))
}

/// Compare one captured clock value against the immutable stage deadline.
pub fn stage_deadline_reached(
    started_at: &str,
    budget_s: u64,
    as_of: &str,
) -> Result<bool, ProtoError> {
    Ok(parse_stamp(as_of)? >= parse_stamp(&stage_deadline_at(started_at, budget_s)?)?)
}

/// The public result-landing seam every caller lands a packet result
/// through. On success the completion stands; when the ledger's fence
/// refuses with `StaleClaimToken` — a zombie result from a revoked or
/// reclaimed attempt — the refused bytes go to `ports.quarantine` under the
/// bare name `result.json`, the refused claim is preserved as a
/// `proto.quarantine` event for harvest-and-verify, and the outcome is
/// [`LandOutcome::Quarantined`]. No other refusal code quarantines; every
/// other ledger error propagates as [`ProtoError::Ledger`].
pub async fn land_packet_result(
    ledger: &Ledger,
    ports: &dyn ReconcilePorts,
    run_id: &str,
    packet_id: &str,
    attempt_id: i64,
    claim_token: &str,
    result: &PacketResult,
) -> Result<LandOutcome, ProtoError> {
    let landed: Result<(), LedgerError> = {
        let packet_id = packet_id.to_owned();
        let claim_token = claim_token.to_owned();
        let result = result.clone();
        on_ledger(ledger, move |l| {
            Ok(l.complete_packet(&packet_id, &claim_token, &result))
        })
        .await?
    };
    match landed {
        Ok(()) => Ok(LandOutcome::Completed),
        Err(err) if err.code() == ErrorCode::StaleClaimToken => {
            let body = serde_json::to_vec(result).map_err(|err| {
                ProtoError::Projection(format!("cannot serialize refused result: {err}"))
            })?;
            ports
                .quarantine(run_id, attempt_id, "result.json", &body)
                .await
                .map_err(|source| port_failure(attempt_id, "quarantine", source))?;
            let event = ProtoEvent::Quarantine {
                packet_id: packet_id.to_owned(),
                attempt_id,
                // The required `reason` is the fence's refusal, verbatim.
                reason: err.to_string(),
                name: Some("result.json".to_owned()),
                result: Some(result.clone()),
            };
            let run_id = run_id.to_owned();
            on_ledger(ledger, move |l| record(l, &run_id, event)).await?;
            Ok(LandOutcome::Quarantined)
        }
        Err(err) => Err(ProtoError::Ledger(err)),
    }
}

/// One reconcile pass over a run: walk every live attempt through the
/// liveness ladder and the revoke order, settle interrupted operations by
/// effect class, and harvest-and-verify quarantined implement claims.
pub async fn reconcile(
    ledger: &Ledger,
    run_id: &str,
    ports: &dyn ReconcilePorts,
    config: &ReconcileConfig,
    now: &str,
) -> Result<ReconcileReport, ProtoError> {
    reconcile_inner(ledger, run_id, ports, config, now, true).await
}

/// Reconcile only the run's attempts, leaving operation recovery and
/// harvest-and-verify to the outer operation that owns them.
///
/// Whole-run settlement uses this narrower entrypoint while its own
/// `SafeRetry` operation is in progress; releasing that operation from
/// inside itself would strand successful settlement at response commit.
pub async fn reconcile_attempts(
    ledger: &Ledger,
    run_id: &str,
    ports: &dyn ReconcilePorts,
    config: &ReconcileConfig,
    now: &str,
) -> Result<ReconcileReport, ProtoError> {
    reconcile_inner(ledger, run_id, ports, config, now, false).await
}

async fn reconcile_inner(
    ledger: &Ledger,
    run_id: &str,
    ports: &dyn ReconcilePorts,
    config: &ReconcileConfig,
    now: &str,
    include_run_aftermath: bool,
) -> Result<ReconcileReport, ProtoError> {
    let mut report = ReconcileReport::default();
    parse_stamp(now)?;
    let run: RunRow = {
        let run_id = run_id.to_owned();
        on_ledger(ledger, move |l| {
            l.get_run(&run_id).map_err(ProtoError::Ledger)
        })
        .await?
    };

    let live: Vec<AttemptRow> = {
        let run_id = run_id.to_owned();
        on_ledger(ledger, move |l| {
            l.list_live_attempts(Some(&run_id))
                .map_err(ProtoError::Ledger)
        })
        .await?
    };

    for attempt in live {
        let packet = {
            let packet_id = attempt.packet_id.clone();
            on_ledger(ledger, move |l| {
                l.get_packet(&packet_id).map_err(ProtoError::Ledger)
            })
            .await?
        };
        let packet = crate::project::stored_packet(&packet).map_err(|error| {
            ProtoError::Projection(format!("stored packet body does not parse: {error}"))
        })?;
        let budget = u64::from(packet.contract.budget_s);

        match attempt.state {
            // A revoking row skips the liveness ladder entirely: the durable
            // revocation decision has already been made. Resume at step 2 —
            // of WHICHEVER order placed the marker, which is what the
            // marker's scope records.
            AttemptState::Revoking => match attempt.revoke_scope {
                Some(RevokeScope::Deadline) => {
                    deadline_order(
                        ledger,
                        ports,
                        &run,
                        &attempt,
                        &mut report,
                        config.termination_grace_s,
                    )
                    .await?;
                }
                // An operator's stop that could not confirm death. Finishing
                // it through the work-scoped order instead would reclaim the
                // shared lease on an attempt-local operation's behalf: the
                // exact defect the split removes.
                Some(RevokeScope::Attempt) => {
                    let settled =
                        stop_order(ledger, ports, &attempt, config.termination_grace_s).await?;
                    note_terminal(settled, attempt.attempt_id, &mut report);
                }
                // `work`, and `None` for every row written before the scope
                // was durable — all of those are saga revocations, because
                // the attempt-local stop did not exist when they were made.
                Some(RevokeScope::Work) | None => {
                    revoke_order(
                        ledger,
                        ports,
                        &run,
                        &attempt,
                        budget,
                        config.termination_grace_s,
                        &mut report,
                    )
                    .await?;
                }
            },
            AttemptState::Running => {
                let deadline_reached = stage_deadline_reached(&attempt.started_at, budget, now)?;
                let (dead, reason, scope) = if deadline_reached {
                    (
                        true,
                        format!(
                            "transport: stage deadline exceeded: attemptId={} startedAt={} budgetS={} asOf={now}",
                            attempt.attempt_id, attempt.started_at, budget
                        ),
                        RevokeScope::Deadline,
                    )
                } else {
                    let liveness = ports
                        .liveness(&attempt.claimant)
                        .await
                        .map_err(|source| port_failure(attempt.attempt_id, "liveness", source))?;
                    match liveness {
                        SessionLiveness::Running => (false, String::new(), RevokeScope::Work),
                        SessionLiveness::Exited(code) => (
                            true,
                            format!("session exited ({code}) without landing a result"),
                            RevokeScope::Work,
                        ),
                        SessionLiveness::Vanished => {
                            (true, "session vanished".to_owned(), RevokeScope::Work)
                        }
                    }
                };
                if !dead {
                    report.left_running.push(attempt.attempt_id);
                    continue;
                }
                // Step 1: the durable marker commits BEFORE any external
                // kill or reclaim. Idempotent when already revoking; a
                // terminal-state refusal means we raced someone.
                let revoked: Result<(), LedgerError> = {
                    let attempt_id = attempt.attempt_id;
                    on_ledger(ledger, move |l| {
                        Ok(l.revoke_attempt_scoped(attempt_id, &reason, scope))
                    })
                    .await?
                };
                match revoked {
                    Ok(()) => {
                        let current = get_attempt(ledger, attempt.attempt_id).await?;
                        match current.revoke_scope {
                            Some(RevokeScope::Deadline) => {
                                deadline_order(
                                    ledger,
                                    ports,
                                    &run,
                                    &current,
                                    &mut report,
                                    config.termination_grace_s,
                                )
                                .await?;
                            }
                            Some(RevokeScope::Attempt) => {
                                let settled =
                                    stop_order(ledger, ports, &current, config.termination_grace_s)
                                        .await?;
                                note_terminal(settled, current.attempt_id, &mut report);
                            }
                            Some(RevokeScope::Work) | None => {
                                revoke_order(
                                    ledger,
                                    ports,
                                    &run,
                                    &current,
                                    budget,
                                    config.termination_grace_s,
                                    &mut report,
                                )
                                .await?;
                            }
                        }
                    }
                    Err(err) if err.code() == ErrorCode::InvalidRequest => {
                        // A racing reconciler finished the saga, or a racing
                        // operator stop finished the attempt; either way the
                        // terminal row is the answer.
                        let current = get_attempt(ledger, attempt.attempt_id).await?;
                        if current.state == AttemptState::Failed
                            && current.revoke_scope == Some(RevokeScope::Deadline)
                        {
                            report.timed_out.push(attempt.attempt_id);
                        } else {
                            note_terminal(current.state, attempt.attempt_id, &mut report);
                        }
                        // Completed/failed on its own: nothing live remains.
                    }
                    Err(err) => return Err(ProtoError::Ledger(err)),
                }
            }
            // Terminal states are never listed live.
            _ => {}
        }
    }

    // Attempts an operator already stopped are terminal, so the live loop
    // above never sees them. Reporting them is the pass's answer to "what
    // about that attempt?": stopped, by an operator, and deliberately not
    // resumed.
    let terminal_stops: Vec<AttemptRow> = {
        let run_id = run_id.to_owned();
        on_ledger(ledger, move |l| {
            l.list_attempts_in_state(Some(&run_id), AttemptState::Stopped)
                .map_err(ProtoError::Ledger)
        })
        .await?
    };
    report
        .stopped
        .extend(terminal_stops.iter().map(|a| a.attempt_id));
    report.stopped.sort_unstable();
    report.stopped.dedup();

    if include_run_aftermath {
        let events = {
            let run_id = run_id.to_owned();
            on_ledger(ledger, move |l| fetch_all_events(l, &run_id)).await?
        };
        let proto_events = parse_proto_events(&events)?;

        settle_operations(ledger, ports, &run, &proto_events, &mut report).await?;
        harvest_and_verify(ledger, ports, run_id, &proto_events, &mut report).await?;
    }

    Ok(report)
}

/// Record an attempt whose terminal state some other actor drove it to.
/// `reclaimed` and `stopped` are BOTH convergence — the saga and an operator
/// stop can race, and each must read the other's terminal row as the answer
/// rather than an error. Returns whether the state was one of them;
/// `completed`/`failed` mean the attempt settled itself and there is nothing
/// to report.
fn note_terminal(state: AttemptState, attempt_id: i64, report: &mut ReconcileReport) -> bool {
    match state {
        AttemptState::Reclaimed => {
            report.reclaimed.push(attempt_id);
            true
        }
        AttemptState::Stopped => {
            report.stopped.push(attempt_id);
            true
        }
        _ => false,
    }
}

async fn get_attempt(ledger: &Ledger, attempt_id: i64) -> Result<AttemptRow, ProtoError> {
    on_ledger(ledger, move |l| {
        l.get_attempt(attempt_id).map_err(ProtoError::Ledger)
    })
    .await
}

/// Resume the deadline containment after its durable marker: verified death,
/// one attempt-addressed retry grant, then atomic timeout/capacity settlement.
async fn deadline_order(
    ledger: &Ledger,
    ports: &dyn ReconcilePorts,
    run: &RunRow,
    attempt: &AttemptRow,
    report: &mut ReconcileReport,
    termination_grace_s: u64,
) -> Result<(), ProtoError> {
    let attempt_id = attempt.attempt_id;
    ports
        .kill_confirmed(&attempt.claimant, termination_grace_s)
        .await
        .map_err(|source| port_failure(attempt_id, "kill_confirmed", source))?;
    let current = get_attempt(ledger, attempt_id).await?;
    if current.state != AttemptState::Revoking
        || current.revoke_scope != Some(RevokeScope::Deadline)
    {
        if current.state == AttemptState::Failed
            && current.revoke_scope == Some(RevokeScope::Deadline)
        {
            report.timed_out.push(attempt_id);
        } else {
            note_terminal(current.state, attempt_id, report);
        }
        return Ok(());
    }
    let packet_id = current.packet_id.clone();
    let since = current.updated_at.clone();
    let cutoff = {
        let run_id = run.run_id.clone();
        on_ledger(ledger, move |ledger| {
            ledger
                .latest_policy_revision(&run_id)
                .map_err(ProtoError::Ledger)
        })
        .await?
        .map(|revision| revision.created_at)
    };
    // ADR-0035:50-52: a failure that started before the active policy cutoff
    // is not rescored and earns no retry grant.
    if cutoff
        .as_ref()
        .is_some_and(|boundary| current.started_at.as_str() < boundary.as_str())
    {
        on_ledger(ledger, move |ledger| {
            ledger
                .mark_timed_out(attempt_id)
                .map_err(ProtoError::Ledger)
        })
        .await?;
        report.timed_out.push(attempt_id);
        return Ok(());
    }
    let run_id = run.run_id.clone();
    on_ledger(ledger, move |l| {
        crate::grant_retry_for_attempt_since(
            l,
            &run_id,
            &packet_id,
            attempt_id,
            &since,
            cutoff.as_deref(),
        )
    })
    .await?;
    on_ledger(ledger, move |l| {
        l.mark_timed_out(attempt_id).map_err(ProtoError::Ledger)
    })
    .await?;
    report.timed_out.push(attempt_id);
    Ok(())
}

/// Steps 2–5 of the revoke order, entered only after the durable `revoking`
/// marker is committed.
async fn revoke_order(
    ledger: &Ledger,
    ports: &dyn ReconcilePorts,
    run: &RunRow,
    attempt: &AttemptRow,
    stage_budget_s: u64,
    termination_grace_s: u64,
    report: &mut ReconcileReport,
) -> Result<(), ProtoError> {
    let attempt_id = attempt.attempt_id;

    // Step 2: verified death, never signal-send.
    ports
        .kill_confirmed(&attempt.claimant, termination_grace_s)
        .await
        .map_err(|source| port_failure(attempt_id, "kill_confirmed", source))?;

    // Between the marker and here an operator's stop may have settled this
    // row. Re-read before the external reclaim: this fires a WORK-scoped
    // effect, and firing it for an attempt no longer under this order's
    // marker is the scope mismatch the split exists to remove. No step is
    // added or reordered — the order simply declines to continue one it no
    // longer owns.
    let current = get_attempt(ledger, attempt_id).await?;
    if current.state != AttemptState::Revoking {
        note_terminal(current.state, attempt_id, report);
        return Ok(());
    }

    // Step 3: scoped external reclaim, holder = claimant verbatim.
    let older_than_s = reclaim_older_than(stage_budget_s);
    let outcome = ports
        .reclaim_lease(&run.work_id, &attempt.claimant, older_than_s)
        .await
        .map_err(|source| port_failure(attempt_id, "reclaim_lease", source))?;
    // A scoped reclaim that reports NO previous owner is the goal state, not
    // a refusal: bd verified the lease is held by nobody. Reaching step 4
    // from here is safe because step 2 already confirmed this attempt's
    // death — the pair "process dead, lease unheld" is exactly what the
    // reclaim exists to establish, however it came to be true (an expired
    // TTL, an operator's own `work-lease reclaim`, a partially-completed earlier
    // pass). Treating it as a refusal instead strands the attempt in
    // `revoking` forever, because no later pass can make an absent lease
    // reappear for this holder to reclaim.
    let scoped_to_holder = outcome.scoped
        && match outcome.previous_owner.as_deref() {
            None => true,
            Some(owner) => owner == attempt.claimant.as_str(),
        };
    if !scoped_to_holder {
        // A refusal shape (unscoped, or another owner) is not an error. A
        // racing reconciler may already have finished the saga, or a racing
        // operator stop the attempt; otherwise leave the durable `revoking`
        // marker for the next pass.
        let current = get_attempt(ledger, attempt_id).await?;
        if !note_terminal(current.state, attempt_id, report) {
            report.deferred.push(attempt_id);
        }
        return Ok(());
    }

    // Step 4: `revoking → reclaimed`, the only path there.
    let marked: Result<(), LedgerError> =
        on_ledger(ledger, move |l| Ok(l.mark_reclaimed(attempt_id))).await?;
    match marked {
        Ok(()) => report.reclaimed.push(attempt_id),
        Err(err) if err.code() == ErrorCode::InvalidRequest => {
            // Terminal-state idempotence: the loser's mark on an
            // already-terminal row is convergence, and the winner may have
            // been an operator's stop rather than another reconciler.
            let current = get_attempt(ledger, attempt_id).await?;
            if !note_terminal(current.state, attempt_id, report) {
                return Err(ProtoError::Ledger(err));
            }
        }
        Err(err) => return Err(ProtoError::Ledger(err)),
    }

    // Step 5: only now may a successor claim — the caller's business.
    Ok(())
}

/// End ONE attempt at `stopped`: confirmed death, then the attempt-local
/// terminal transition. Entered only after the durable `revoking` marker is
/// committed, exactly as [`revoke_order`] is.
///
/// **This deliberately reclaims no lease.** `run_holder` is work-scoped —
/// every generation of the run derives the identical string — so an
/// attempt-local operation has no standing to take it, and a "no live
/// sibling right now" check cannot be made safe against a sibling claimed
/// one instruction later. Leaving the lease where it is costs nothing: a
/// successor attempt on the same packet reuses it under the same holder,
/// which is why the stop settles with no waiting period at all.
///
/// Confirmed death is still the whole fence, and still gates the transition:
/// a `kill_confirmed` that cannot VERIFY death surfaces as
/// [`ProtoError::Port`] with the attempt left `revoking`, where the next
/// pass resumes from the durable marker — as a STOP, because the marker
/// carries [`RevokeScope::Attempt`]. An attempt not under that marker is
/// refused by the ledger BEFORE anything is killed.
pub async fn stop_attempt(
    ledger: &Ledger,
    ports: &dyn ReconcilePorts,
    attempt_id: i64,
    termination_grace_s: u64,
) -> Result<AttemptState, ProtoError> {
    let attempt = get_attempt(ledger, attempt_id).await?;
    stop_order(ledger, ports, &attempt, termination_grace_s).await
}

/// The stop order over an attempt row already read — the form reconcile
/// resumes an attempt-scoped marker through, without re-reading it.
async fn stop_order(
    ledger: &Ledger,
    ports: &dyn ReconcilePorts,
    attempt: &AttemptRow,
    termination_grace_s: u64,
) -> Result<AttemptState, ProtoError> {
    let attempt_id = attempt.attempt_id;
    if attempt.revoke_scope == Some(RevokeScope::Deadline) {
        return Err(ProtoError::Projection(format!(
            "deadline attempt {attempt_id} must resume through timeout settlement"
        )));
    }
    if attempt.state != AttemptState::Revoking {
        // Not under the durable marker: the ledger's own transition speaks
        // the refusal (or converges on a terminal row), and nothing is
        // killed.
        return mark_stopped(ledger, attempt_id).await;
    }

    // Step 2 of the revoke order, unchanged: verified death, never
    // signal-send.
    ports
        .kill_confirmed(&attempt.claimant, termination_grace_s)
        .await
        .map_err(|source| port_failure(attempt_id, "kill_confirmed", source))?;

    mark_stopped(ledger, attempt_id).await
}

/// `revoking → stopped`, converging on whichever terminal row won.
///
/// Returns the state the attempt actually settled in: `stopped` on this
/// caller's own transition, and the winner's state when a racing reconciler
/// or stop got there first. `reclaimed` is convergence too — the saga and a
/// stop can race, and a terminal row that already says "kill-confirmed and
/// settled" is an answer, not an error.
async fn mark_stopped(ledger: &Ledger, attempt_id: i64) -> Result<AttemptState, ProtoError> {
    let marked: Result<(), LedgerError> =
        on_ledger(ledger, move |l| Ok(l.mark_stopped(attempt_id))).await?;
    match marked {
        Ok(()) => Ok(AttemptState::Stopped),
        Err(err) if err.code() == ErrorCode::InvalidRequest => {
            let current = get_attempt(ledger, attempt_id).await?;
            match current.state {
                AttemptState::Stopped | AttemptState::Reclaimed => Ok(current.state),
                _ => Err(ProtoError::Ledger(err)),
            }
        }
        Err(err) => Err(ProtoError::Ledger(err)),
    }
}

/// Settle every interrupted operation by its effect class.
async fn settle_operations(
    ledger: &Ledger,
    ports: &dyn ReconcilePorts,
    run: &RunRow,
    proto_events: &[ProtoEvent],
    report: &mut ReconcileReport,
) -> Result<(), ProtoError> {
    let inflight = {
        let run_id = run.run_id.clone();
        on_ledger(ledger, move |l| {
            l.list_inflight_operations(Some(&run_id))
                .map_err(ProtoError::Ledger)
        })
        .await?
    };
    for op in inflight {
        match op.effect_class {
            EffectClass::SafeRetry => {
                let operation_id = op.operation_id.clone();
                on_ledger(ledger, move |l| {
                    l.release_operation(&operation_id)
                        .map_err(ProtoError::Ledger)
                })
                .await?;
                report.released.push(op.operation_id);
            }
            EffectClass::ObserveOnly => {
                // An observation settles the row only when it CONFIRMS the
                // effect. An interrupted push whose branch never reached the
                // remote, a draft PR that was never opened, a worktree that
                // is not there — those observations say the step did not
                // happen, and storing them as the row's terminal envelope
                // would tell `advance` the step is done and let the run walk
                // straight past it. Confirmation is judged against the
                // intent recovered from the row's `proto.operation.request`
                // event where the observation alone cannot prove it — a
                // stale remote branch has SOME sha, and a worktree can exist
                // under someone else's lease. Unconfirmed, the row is
                // released instead and the step runs again.
                let observation = observe(ports, run, &op.name).await?;
                if !confirms_effect(&op.name, &observation, recovered_request(proto_events, &op)) {
                    let operation_id = op.operation_id.clone();
                    on_ledger(ledger, move |l| {
                        l.release_operation(&operation_id)
                            .map_err(ProtoError::Ledger)
                    })
                    .await?;
                    report.released.push(op.operation_id);
                    continue;
                }
                let response = OperationResponse {
                    ok: true,
                    operation_id: op.operation_id.clone(),
                    reused: false,
                    result: Some(observation),
                    error: None,
                };
                let operation_id = op.operation_id.clone();
                on_ledger(ledger, move |l| {
                    l.resolve_interrupted_operation(&operation_id, &response)
                        .map_err(ProtoError::Ledger)
                })
                .await?;
                report.observed.push(op.operation_id);
            }
            EffectClass::HumanAmbiguous => {
                // Never guess. A row with no claim token belongs to no
                // attempt: record it and leave it in progress, no port call.
                let Some(token) = op.claim_token.clone() else {
                    report.quarantined.push(op.operation_id);
                    continue;
                };
                let owner = on_ledger(ledger, move |l| {
                    l.find_attempt_by_token(&token).map_err(ProtoError::Ledger)
                })
                .await?;
                let recovered = recovered_request(proto_events, &op).cloned();
                match (owner, recovered) {
                    (Some(owner), Some(request)) => {
                        let body = serde_json::to_vec(&request).map_err(|err| {
                            ProtoError::Projection(format!(
                                "cannot serialize recovered request: {err}"
                            ))
                        })?;
                        let name = format!("operation-{}.json", op.operation_id);
                        ports
                            .quarantine(&run.run_id, owner.attempt_id, &name, &body)
                            .await
                            .map_err(|source| {
                                port_failure(owner.attempt_id, "quarantine", source)
                            })?;
                        report.quarantined.push(op.operation_id);
                    }
                    // Unrecoverable provenance: record it, leave the row in
                    // progress, and hand nothing to the port.
                    _ => report.quarantined.push(op.operation_id),
                }
            }
        }
    }
    Ok(())
}

/// The `proto.operation.request` event recorded for an operation row,
/// recovered by `(name, idempotency_key)` — the only durable copy of an
/// interrupted operation's parameters (`OperationRow` stores only
/// `request_sha256`).
fn recovered_request<'e>(
    proto_events: &'e [ProtoEvent],
    op: &OperationRow,
) -> Option<&'e OperationRequest> {
    proto_events.iter().find_map(|e| match e {
        ProtoEvent::OperationRequest {
            name,
            idempotency_key,
            request,
            ..
        } if *name == op.name && *idempotency_key == op.idempotency_key => Some(request),
        _ => None,
    })
}

/// Whether an [`observe`] answer confirms its step's effect actually
/// landed, judged against the intent recovered from the step's
/// `proto.operation.request` event wherever the observation alone cannot
/// prove it:
///
/// - `resolve` — the worktree is present AND the observed work lease holder
///   equals the request's `params.leaseHolder`. A worktree with no lease or
///   the wrong lease is an unowned (or hijacked) run and must not settle,
///   per the effect-class table's "worktree presence + work lease holder".
/// - `draftpr` — the PR exists.
/// - `push` — the observed remote sha equals the request's
///   `params.expectedSha`. A pre-existing stale branch answers with SOME
///   sha, so bare existence would mark an interrupted push terminal and let
///   the run advance to `DraftPr` carrying the wrong code; only the
///   intended sha confirms.
///
/// Each rule mirrors the effect-class table's "settled after a crash by"
/// column, and anything else — a missing or extra-less request event, a
/// shape this crate does not know — counts as unconfirmed, the conservative
/// direction: the row is released and the step runs again.
fn confirms_effect(name: &str, observation: &Value, request: Option<&OperationRequest>) -> bool {
    let expected = |key: &str| -> Option<&str> {
        request
            .and_then(|r| r.params.get(key))
            .and_then(Value::as_str)
    };
    match name {
        "resolve" => {
            let worktree_present = observation
                .get("worktreePresent")
                .and_then(Value::as_bool)
                .unwrap_or(false);
            let holder_held = match expected("leaseHolder") {
                Some(want) => observation.get("leaseHolder").and_then(Value::as_str) == Some(want),
                None => false,
            };
            worktree_present && holder_held
        }
        "draftpr" => observation.get("pr").is_some_and(|pr| !pr.is_null()),
        "push" => match expected("expectedSha") {
            Some(want) => observation.get("remoteSha").and_then(Value::as_str) == Some(want),
            None => false,
        },
        _ => false,
    }
}

/// Query the external system for an `ObserveOnly` machine step, per the
/// effect-class table.
async fn observe(
    ports: &dyn ReconcilePorts,
    run: &RunRow,
    name: &str,
) -> Result<Value, ProtoError> {
    match name {
        "resolve" => {
            let state = ports
                .resolve_state(&run.run_id)
                .await
                .map_err(|source| port_failure(0, "resolve_state", source))?;
            Ok(json!({
                "worktreePresent": state.worktree_present,
                "leaseHolder": state.lease_holder,
            }))
        }
        "draftpr" => {
            let pr = ports
                .pr_for_head(&run.repo, &run.branch, &run.base_ref)
                .await
                .map_err(|source| port_failure(0, "pr_for_head", source))?;
            Ok(json!({
                "pr": pr.map(|p| json!({
                    "number": p.number,
                    "isDraft": p.is_draft,
                    "baseRefName": p.base_ref_name,
                    "headRefName": p.head_ref_name,
                    "url": p.url,
                })),
            }))
        }
        "push" => {
            let sha = ports
                .remote_sha(&run.run_id, &run.branch)
                .await
                .map_err(|source| port_failure(0, "remote_sha", source))?;
            Ok(json!({ "remoteSha": sha }))
        }
        other => Err(ProtoError::Projection(format!(
            "cannot observe operation {other:?}"
        ))),
    }
}

/// Harvest-and-verify: a quarantined `Outcome::Implement` claim from a
/// revoked attempt is a claim to check, never a result to trust — the
/// recomputed `commits_ahead` decides every claim, and re-run gates decide
/// claims carrying the closed `pass` or `fail` vocabulary. Legacy prose is
/// unknown and carries no gate claim to verify.
///
/// Ground truth is established **once per pass**, not once per claim. Both
/// ports are run-scoped — `commits_ahead(run_id)` and `rerun_gates(run_id,
/// commands)` — so their answers are the same for every claim in the pass,
/// and the quarantine events are a growing history that every later pass
/// replays: re-running the gates once per historical event would make
/// reconcile cost more the longer a run has been alive. A pass with no
/// implement claim to check touches neither port; a pass with implement
/// claims but no closed gate value touches only the commit port. Identical
/// mismatch lines are reported once.
async fn harvest_and_verify(
    ledger: &Ledger,
    ports: &dyn ReconcilePorts,
    run_id: &str,
    proto_events: &[ProtoEvent],
    report: &mut ReconcileReport,
) -> Result<(), ProtoError> {
    let claims: Vec<(&i64, &String, u32, Option<&str>)> = proto_events
        .iter()
        .filter_map(|event| {
            // A quarantine event without the optional `result` extension —
            // a spec-shaped payload from another writer — carries no claim
            // to check.
            let ProtoEvent::Quarantine {
                packet_id,
                attempt_id,
                result: Some(result),
                ..
            } = event
            else {
                return None;
            };
            let Outcome::Implement {
                commits_ahead,
                gate_state,
                ..
            } = &result.outcome
            else {
                return None;
            };
            Some((attempt_id, packet_id, *commits_ahead, gate_state.as_deref()))
        })
        .collect();
    let Some((first_attempt, ..)) = claims.first() else {
        return Ok(());
    };

    let truth_commits = ports
        .commits_ahead(run_id)
        .await
        .map_err(|source| port_failure(**first_attempt, "commits_ahead", source))?;
    let closed_gate_attempt = claims
        .iter()
        .find_map(|(attempt_id, packet_id, _, gate_state)| {
            matches!(gate_state, Some("pass" | "fail"))
                .then_some((**attempt_id, (*packet_id).clone()))
        });
    let gates_pass = if let Some((attempt_id, packet_id)) = closed_gate_attempt {
        let packet = on_ledger(ledger, move |ledger| {
            ledger.get_packet(&packet_id).map_err(ProtoError::Ledger)
        })
        .await?;
        let packet = crate::project::stored_packet(&packet).map_err(|error| {
            ProtoError::Projection(format!("stored packet body does not parse: {error}"))
        })?;
        let rows = ports
            .rerun_gates(run_id, &packet.contract.gate_commands)
            .await
            .map_err(|source| port_failure(attempt_id, "rerun_gates", source))?;
        Some(rows.iter().all(|r| r.exit_code == Some(0) && !r.timed_out))
    } else {
        None
    };

    for (attempt_id, packet_id, commits_ahead, gate_state) in claims {
        if truth_commits != commits_ahead {
            push_mismatch(
                report,
                format!(
                    "attempt {attempt_id} ({packet_id}): claimed {commits_ahead} commits ahead, \
                     worktree has {truth_commits}"
                ),
            );
        }
        let claimed_pass = match gate_state {
            Some("pass") => Some(true),
            Some("fail") => Some(false),
            _ => None,
        };
        if let (Some(claimed_pass), Some(gates_pass)) = (claimed_pass, gates_pass) {
            if claimed_pass == gates_pass {
                continue;
            }
            push_mismatch(
                report,
                format!(
                    "attempt {attempt_id} ({packet_id}): claimed gate state {gate_state:?}, \
                     re-run gates {}",
                    if gates_pass { "pass" } else { "fail" }
                ),
            );
        }
    }
    Ok(())
}

/// Record a mismatch once; the same claim checked twice is one finding.
fn push_mismatch(report: &mut ReconcileReport, line: String) {
    if !report.harvest_mismatches.contains(&line) {
        report.harvest_mismatches.push(line);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reclaim_older_than_mirrors_the_frozen_equation() {
        assert_eq!(reclaim_older_than(1800), 1500);
        assert_eq!(reclaim_older_than(300), 0);
        assert_eq!(reclaim_older_than(10), 0);
    }
}
