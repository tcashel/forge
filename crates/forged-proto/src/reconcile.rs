//! The reconcile saga: make a crashed or hijacked run safe to resume.
//!
//! The revoke order is load-bearing: `revoke_attempt` commits the durable
//! `revoking` marker BEFORE any external kill or reclaim; `kill_confirmed`
//! succeeds only on verified death; the external bd reclaim must be scoped
//! and name the requested holder; only then `mark_reclaimed`; only then may
//! a successor claim. Failure means stop, not improvise: a port failure
//! surfaces as [`ProtoError::Port`] with the attempt left `revoking`, and
//! the next invocation resumes from that durable marker.
//!
//! The ledger is synchronous by design; every ledger call here goes through
//! `tokio::task::spawn_blocking`, and no transaction ever spans an
//! `.await`.

use std::collections::HashMap;

use forged_ledger::{
    AttemptRow, AttemptState, EffectClass, Ledger, LedgerError, OperationRow, RunRow,
};
use forged_types::{ErrorCode, OperationRequest, OperationResponse, Outcome, PacketResult, Stage};
use serde_json::{json, Value};

use crate::error::{PortError, ProtoError};
use crate::events::{parse_proto_events, record, ProtoEvent};
use crate::ports::{ReconcilePorts, SessionLiveness};
use crate::project::fetch_all_events;

/// A local mirror of bd 1.2.1's hardcoded lease TTL
/// (`forged_beads::BD_LEASE_TTL_S`) — forged-beads is a port, not a
/// dependency.
const BD_LEASE_TTL_S: u64 = 300;

/// The epic's frozen timing equation, mirroring
/// `forged_beads::reclaim_older_than`: reclaim fires at TTL + older_than,
/// so `older_than = stage_budget - TTL`, saturating at 0.
fn reclaim_older_than(stage_budget_s: u64) -> u64 {
    stage_budget_s.saturating_sub(BD_LEASE_TTL_S)
}

/// Caller-supplied reconcile inputs. This crate reads no environment
/// variables — budgets and gate commands arrive here explicitly.
#[derive(Debug, Clone)]
pub struct ReconcileConfig {
    /// Per-stage wall-clock budget, seconds; drives the ladder's budget rung
    /// and `reclaim_older_than(stage_budget_s)`. No default — callers supply
    /// it (tests use 1800).
    ///
    /// AMENDED (operator-adjudicated 2026-08-12): `HashMap` for the same
    /// reason as [`crate::RunView::roster`] — the merged
    /// `forged_types::Stage` derives `Hash + Eq` and not `Ord`, and reconcile
    /// looks budgets up by key rather than iterating them.
    pub stage_budget_s: HashMap<Stage, u64>,
    /// Gate commands, in order, for `rerun_gates` during harvest-and-verify.
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
    let mut report = ReconcileReport::default();
    let now_ts = parse_stamp(now)?;
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
        let stage = {
            let packet_id = attempt.packet_id.clone();
            on_ledger(ledger, move |l| {
                l.get_packet(&packet_id).map_err(ProtoError::Ledger)
            })
            .await?
            .stage
        };
        let budget = *config.stage_budget_s.get(&stage).ok_or_else(|| {
            ProtoError::Projection(format!("no stage budget for stage {stage:?}"))
        })?;

        match attempt.state {
            // A revoking row skips the liveness ladder entirely: the durable
            // revocation decision has already been made. Resume at step 2.
            AttemptState::Revoking => {
                revoke_order(ledger, ports, &run, &attempt, budget, &mut report).await?;
            }
            AttemptState::Running => {
                let liveness = ports
                    .liveness(&attempt.claimant)
                    .await
                    .map_err(|source| port_failure(attempt.attempt_id, "liveness", source))?;
                let (dead, reason) = match liveness {
                    SessionLiveness::Running => {
                        // Budget override: a live session past its stage
                        // budget is hung.
                        let anchor = attempt
                            .last_heartbeat_at
                            .as_deref()
                            .unwrap_or(&attempt.started_at);
                        let anchor_ts = parse_stamp(anchor)?;
                        let over = now_ts.as_second().saturating_sub(anchor_ts.as_second())
                            > i64::try_from(budget).unwrap_or(i64::MAX);
                        (over, "stage budget exceeded".to_owned())
                    }
                    SessionLiveness::Exited(code) => (
                        true,
                        format!("session exited ({code}) without landing a result"),
                    ),
                    SessionLiveness::Vanished => (true, "session vanished".to_owned()),
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
                    on_ledger(ledger, move |l| Ok(l.revoke_attempt(attempt_id, &reason))).await?
                };
                match revoked {
                    Ok(()) => {
                        revoke_order(ledger, ports, &run, &attempt, budget, &mut report).await?;
                    }
                    Err(err) if err.code() == ErrorCode::InvalidRequest => {
                        let current = get_attempt(ledger, attempt.attempt_id).await?;
                        if current.state == AttemptState::Reclaimed {
                            // A racing reconciler finished the saga.
                            report.reclaimed.push(attempt.attempt_id);
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

    let events = {
        let run_id = run_id.to_owned();
        on_ledger(ledger, move |l| fetch_all_events(l, &run_id)).await?
    };
    let proto_events = parse_proto_events(&events)?;

    settle_operations(ledger, ports, &run, &proto_events, &mut report).await?;
    harvest_and_verify(ports, run_id, config, &proto_events, &mut report).await?;

    Ok(report)
}

async fn get_attempt(ledger: &Ledger, attempt_id: i64) -> Result<AttemptRow, ProtoError> {
    on_ledger(ledger, move |l| {
        l.get_attempt(attempt_id).map_err(ProtoError::Ledger)
    })
    .await
}

/// Steps 2–5 of the revoke order, entered only after the durable `revoking`
/// marker is committed.
async fn revoke_order(
    ledger: &Ledger,
    ports: &dyn ReconcilePorts,
    run: &RunRow,
    attempt: &AttemptRow,
    stage_budget_s: u64,
    report: &mut ReconcileReport,
) -> Result<(), ProtoError> {
    let attempt_id = attempt.attempt_id;

    // Step 2: verified death, never signal-send.
    ports
        .kill_confirmed(&attempt.claimant)
        .await
        .map_err(|source| port_failure(attempt_id, "kill_confirmed", source))?;

    // Step 3: scoped external reclaim, holder = claimant verbatim.
    let older_than_s = reclaim_older_than(stage_budget_s);
    let outcome = ports
        .reclaim_lease(&run.bead_id, &attempt.claimant, older_than_s)
        .await
        .map_err(|source| port_failure(attempt_id, "reclaim_lease", source))?;
    let scoped_to_holder =
        outcome.scoped && outcome.previous_owner.as_deref() == Some(attempt.claimant.as_str());
    if !scoped_to_holder {
        // A refusal shape (empty, unscoped, or another owner) is not an
        // error. A racing reconciler may already have finished the saga;
        // otherwise leave the durable `revoking` marker for the next pass.
        let current = get_attempt(ledger, attempt_id).await?;
        if current.state == AttemptState::Reclaimed {
            report.reclaimed.push(attempt_id);
        } else {
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
            let current = get_attempt(ledger, attempt_id).await?;
            if current.state == AttemptState::Reclaimed {
                // Terminal-state idempotence: the loser's mark on an
                // already-reclaimed row is convergence.
                report.reclaimed.push(attempt_id);
            } else {
                return Err(ProtoError::Ledger(err));
            }
        }
        Err(err) => return Err(ProtoError::Ledger(err)),
    }

    // Step 5: only now may a successor claim — the caller's business.
    Ok(())
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
/// - `resolve` — the worktree is present AND the observed bd lease holder
///   equals the request's `params.leaseHolder`. A worktree with no lease or
///   the wrong lease is an unowned (or hijacked) run and must not settle,
///   per the effect-class table's "worktree presence + bd lease holder".
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
/// recomputed `commits_ahead` and the re-run gates decide.
///
/// Ground truth is established **once per pass**, not once per claim. Both
/// ports are run-scoped — `commits_ahead(run_id)` and `rerun_gates(run_id,
/// commands)` — so their answers are the same for every claim in the pass,
/// and the quarantine events are a growing history that every later pass
/// replays: re-running the gates once per historical event would make
/// reconcile cost more the longer a run has been alive. A pass with no
/// implement claim to check touches neither port, and identical mismatch
/// lines are reported once.
async fn harvest_and_verify(
    ports: &dyn ReconcilePorts,
    run_id: &str,
    config: &ReconcileConfig,
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
    let rows = ports
        .rerun_gates(run_id, &config.gate_commands)
        .await
        .map_err(|source| port_failure(**first_attempt, "rerun_gates", source))?;
    let gates_pass = rows.iter().all(|r| r.exit_code == Some(0) && !r.timed_out);

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
        let claimed_pass = gate_state == Some("pass");
        if claimed_pass != gates_pass {
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
