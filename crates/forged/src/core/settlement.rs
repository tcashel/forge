//! Whole-run settlement: stop every live attempt, project one terminal
//! outcome, reconcile Beads ownership, and retire landed worktrees.

use std::path::Path;

use forged_ledger::{EffectClass, RevokeScope, RunOutcome, RunSettlement};
use forged_types::{OperationRequest, OperationResponse};
use serde_json::{json, Value};

use crate::adapters::ports::ForgedPorts;
use crate::core::{
    default_key, derive_key, err_response, fenced, on_ledger, param_opt_str, param_str, run_holder,
    Ctx, Failure,
};

/// One validated whole-run settlement request.
#[derive(Debug, Clone)]
pub(crate) struct Settlement {
    pub(crate) outcome: RunOutcome,
    pub(crate) reason: String,
    pub(crate) delivery_pr: Option<u64>,
    pub(crate) delivery_sha: Option<String>,
    pub(crate) superseded_by: Option<String>,
}

/// One stable explanation shared by controller settlement and the explicit
/// acceptance operation. Keeping this byte-for-byte identical makes crash
/// recovery an idempotent replay instead of a competing terminal decision.
pub(crate) fn accepted_risk_reason(acceptance: &forged_types::AcceptedRisk) -> String {
    format!(
        "review risk accepted by {}: {}",
        acceptance.accepted_by, acceptance.rationale
    )
}

fn outcome(value: &str) -> Result<RunOutcome, Failure> {
    RunOutcome::try_from(value).map_err(Failure::from)
}

/// The deterministic marker addressing a run's terminal Beads comment. The
/// settlement write and the supervisor's convergence probe must derive the
/// identical string or the probe can never observe a delivered comment.
pub(super) fn settlement_marker(run_id: &str, outcome: RunOutcome) -> String {
    format!("[forged-run:{run_id}:{}]", outcome.as_str())
}

/// The exact `run.bead-settlement.succeeded` payload. Shared with the
/// supervisor retry pass so convergence from either writer is one event
/// shape, deduplicable by byte equality.
pub(super) fn succeeded_payload(bead_id: &str, outcome: RunOutcome) -> Value {
    json!({
        "schema": "forged.bead-settlement/1",
        "beadId": bead_id,
        "outcome": outcome.as_str(),
        "settled": true,
    })
}

fn parse(req: &OperationRequest) -> Result<(String, Settlement), Failure> {
    let run_id = param_str(&req.params, "run")?.to_owned();
    let outcome = outcome(param_str(&req.params, "outcome")?)?;
    if outcome == RunOutcome::AcceptedRisk {
        return Err(Failure::invalid(
            "accepted-risk uses the review acceptance operation so its evidence is preserved",
        ));
    }
    let reason = param_str(&req.params, "reason")?.to_owned();
    let delivery_pr = req.params.get("pr").and_then(Value::as_u64);
    let delivery_sha = param_opt_str(&req.params, "sha").map(str::to_owned);
    let superseded_by = param_opt_str(&req.params, "supersededBy").map(str::to_owned);
    Ok((
        run_id,
        Settlement {
            outcome,
            reason,
            delivery_pr,
            delivery_sha,
            superseded_by,
        },
    ))
}

async fn stop_live_attempts(ctx: &Ctx, run_id: &str, reason: &str) -> Result<Vec<i64>, Failure> {
    let mut stopped = Vec::new();
    loop {
        let run = run_id.to_owned();
        let live = on_ledger(&ctx.ledger, move |ledger| {
            ledger.list_live_attempts(Some(&run))
        })
        .await?;
        if live.is_empty() {
            return Ok(stopped);
        }
        for attempt in live {
            let attempt_id = attempt.attempt_id;
            let reason = reason.to_owned();
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.revoke_attempt_scoped(attempt_id, &reason, RevokeScope::Attempt)
            })
            .await?;
            let ports = ForgedPorts::new(ctx.ledger.clone(), ctx.config.clone());
            forged_proto::stop_attempt(&ctx.ledger, &ports, attempt_id).await?;
            stopped.push(attempt_id);
        }
    }
}

pub(super) async fn settle_bead(
    ctx: &Ctx,
    run_id: &str,
    bead_id: &str,
    settlement: &Settlement,
) -> Result<Value, Failure> {
    let bd = ctx.config.bd_config();
    let actor = run_holder(bead_id);
    let marker = settlement_marker(run_id, settlement.outcome);
    let detail = match settlement.outcome {
        RunOutcome::Landed => format!(
            "{}; landed in PR #{} at {}",
            settlement.reason,
            settlement.delivery_pr.unwrap_or_default(),
            settlement.delivery_sha.as_deref().unwrap_or_default(),
        ),
        RunOutcome::Superseded => format!(
            "{}; superseded by {}",
            settlement.reason,
            settlement.superseded_by.as_deref().unwrap_or_default()
        ),
        _ => settlement.reason.clone(),
    };
    match settlement.outcome {
        RunOutcome::Landed => {
            // Ownership is the first mutation and is repeated inside bd's
            // atomic update. A successor or an unowned Bead therefore gets
            // neither closed nor annotated by this predecessor. Close and
            // release are one CAS, removing the old partially-closed seam.
            let closed = forged_beads::close_held_issue(&bd, bead_id, &actor).await?;
            forged_beads::comment_once(&bd, bead_id, &actor, &marker, &detail).await?;
            Ok(json!({
                "id": bead_id,
                "settled": true,
                "status": closed.status,
                "assignee": closed.assignee,
                "closed": closed.status == "closed",
                "released": closed.assignee.is_none(),
            }))
        }
        RunOutcome::Blocked | RunOutcome::InputRequired => {
            forged_beads::comment_once(&bd, bead_id, &actor, &marker, &detail).await?;
            let issue = forged_beads::release_unresolved_issue(&bd, bead_id, &actor, true).await?;
            Ok(json!({
                "id": bead_id,
                "settled": true,
                "status": issue.status,
                "assignee": issue.assignee,
                "released": issue.assignee.is_none(),
            }))
        }
        RunOutcome::Cancelled | RunOutcome::Superseded => {
            forged_beads::comment_once(&bd, bead_id, &actor, &marker, &detail).await?;
            let issue = forged_beads::release_unresolved_issue(&bd, bead_id, &actor, false).await?;
            Ok(json!({
                "id": bead_id,
                "settled": true,
                "status": issue.status,
                "assignee": issue.assignee,
                "released": issue.assignee.is_none(),
            }))
        }
        // Clean stays claimed while its reviewed delivery waits for the
        // explicit landed settlement. AcceptedRisk is rejected by parse and
        // owned by the review acceptance operation.
        RunOutcome::Clean | RunOutcome::AcceptedRisk => {
            forged_beads::comment_once(&bd, bead_id, &actor, &marker, &detail).await?;
            Ok(json!({
                "id": bead_id,
                "settled": true,
                "preserved": true,
            }))
        }
    }
}

/// Execute a validated settlement. Kept reusable for the review acceptance
/// operation, which owns the evidence contract for `accepted-risk`.
pub(crate) async fn settle(
    ctx: &Ctx,
    run_id: &str,
    settlement: Settlement,
) -> Result<Value, Failure> {
    // Serialize generation discovery with detached submit. The ledger write
    // below revokes that exact generation atomically with the terminal run
    // projection; confirmed process-group death closes the opposite race,
    // where a machine effect already received its ticket.
    let _submit_guard = super::handoff::acquire_run_submit(ctx, run_id).await?;
    let controller = super::handoff::controller_fence_target(ctx, run_id).await?;
    // Stop the state machine first. A crash after this point cannot open new
    // protocol work; replay resumes the identical terminal settlement.
    let run = {
        let run_id = run_id.to_owned();
        let settlement = settlement.clone();
        let generation = controller.as_ref().map(|target| target.generation);
        on_ledger(&ctx.ledger, move |ledger| match generation {
            Some(generation) => ledger.settle_run_fencing_controller(
                &run_id,
                RunSettlement {
                    outcome: settlement.outcome,
                    reason: settlement.reason,
                    delivery_pr: settlement.delivery_pr,
                    delivery_sha: settlement.delivery_sha,
                    superseded_by: settlement.superseded_by,
                },
                generation,
            ),
            None => ledger.settle_run(
                &run_id,
                settlement.outcome,
                settlement.reason,
                settlement.delivery_pr,
                settlement.delivery_sha,
                settlement.superseded_by,
            ),
        })
        .await?
    };
    crate::failpoint::hit("run.settle.controller-revoked.after");
    let controller_stopped = match controller.as_ref() {
        Some(target) => super::handoff::kill_controller_confirmed(target).await?,
        None => false,
    };
    let contained_generation = controller
        .as_ref()
        .filter(|target| target.effects_excluded())
        .map(|target| target.generation);
    let unsafe_operations = {
        let run_id = run_id.to_owned();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.uncontained_machine_operations(&run_id, contained_generation)
        })
        .await?
    };
    if !unsafe_operations.is_empty() {
        return Err(Failure {
            code: forged_types::ErrorCode::HostUnavailable,
            message: format!(
                "run {run_id:?} is terminal but machine effects lack a confirmed-dead controller: {}",
                unsafe_operations.join(", ")
            ),
            recoverable: true,
        });
    }

    // Every token is invalidated durably before confirmed death. This loop
    // also catches an attempt that raced the terminal state write.
    let stopped_attempts =
        stop_live_attempts(ctx, run_id, &run.stop_reason.clone().unwrap()).await?;
    let bead = match settle_bead(ctx, run_id, &run.bead_id, &settlement).await {
        Ok(value) => value,
        Err(error) => {
            let pending = json!({
                "schemaVersion": 1,
                "beadId": run.bead_id,
                "outcome": settlement.outcome.as_str(),
                "expectedAssignee": run_holder(&run.bead_id),
                "settled": false,
                "pending": true,
                "error": error.to_string(),
            });
            let event_run = run_id.to_owned();
            let event = pending.clone();
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_event_once(&event_run, "run.bead-settlement.pending", event)?;
                Ok(())
            })
            .await?;
            pending
        }
    };
    if bead.get("settled").and_then(Value::as_bool) == Some(true) {
        let event_run = run_id.to_owned();
        let event = succeeded_payload(&run.bead_id, settlement.outcome);
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.append_event_once(
                &event_run,
                super::attention::BEAD_SETTLEMENT_SUCCEEDED,
                event,
            )?;
            Ok(())
        })
        .await?;
    }

    // Squash merge ancestry is deliberately irrelevant: a clean linked
    // worktree may retire once exact delivery evidence is stored. Dirt still
    // refuses — a merge SHA proves the pushed delivery, not that unrelated
    // local edits are disposable.
    let (retired, cleanup_error) = if settlement.outcome == RunOutcome::Landed {
        match forged_git::retire_worktree(
            Path::new(&run.repo),
            &ctx.config.runs_root,
            run_id,
            &forged_git::RetireOptions {
                force: false,
                run_state_terminal: true,
            },
        )
        .await
        {
            Ok(()) => (true, None),
            Err(
                error @ (forged_git::GitError::WorktreeDirty { .. }
                | forged_git::GitError::WorktreeUnresolved { .. }),
            ) => (false, Some(error.to_string())),
            Err(error) => return Err(error.into()),
        }
    } else {
        (false, None)
    };

    Ok(json!({
        "runId": run_id,
        "outcome": settlement.outcome.as_str(),
        "reason": run.stop_reason,
        "delivery": {
            "pr": settlement.delivery_pr,
            "sha": settlement.delivery_sha,
        },
        "supersededBy": settlement.superseded_by,
        "stoppedAttempts": stopped_attempts,
        "controllerGeneration": controller.as_ref().map(|target| target.generation),
        "controllerStopped": controller_stopped,
        "bead": bead,
        "worktreeRetired": retired,
        "worktreeCleanupError": cleanup_error,
    }))
}

/// `run stop` — the explicit whole-run terminal operation.
pub async fn run_stop(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let (run_id, settlement) = match parse(req) {
        Ok(value) => value,
        Err(error) => {
            return err_response(
                &derive_key("run_stop", req.run_id.as_deref(), None, None),
                &error,
            )
        }
    };
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    default_key(
        req,
        derive_key(
            "run_stop",
            Some(&run_id),
            Some(settlement.outcome.as_str()),
            None,
        ),
    );
    // Every effect is replay-safe: ledger settlement is immutable/idempotent,
    // attempt stop is marker-fenced and kill-confirmed, Beads writes are
    // guarded/idempotent, and worktree retirement is idempotent.
    fenced(ctx, "run_stop", EffectClass::SafeRetry, req, None, {
        move |_operation| async move { settle(ctx, &run_id, settlement).await }
    })
    .await
}
