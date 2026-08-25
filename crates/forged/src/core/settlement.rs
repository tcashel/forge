//! Whole-run settlement: stop every live attempt, project one terminal
//! outcome, reconcile Beads ownership, and retire landed worktrees.

use std::path::Path;

use forged_ledger::{
    EffectClass, OperationState, RevokeScope, RunOutcome, RunRow, RunSettlement, RunState,
};
use forged_types::{ErrorCode, OperationRequest, OperationResponse};
use serde_json::{json, Value};

use crate::adapters::ports::ForgedPorts;
use crate::config::now_iso;
use crate::core::{
    default_key, derive_key, err_response, fenced, lease_identity, ok_response, on_ledger,
    param_opt_str, param_str, run_holder, Ctx, Failure,
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
        let view = crate::core::drive::project(ctx, run_id).await?;
        let config = forged_proto::ReconcileConfig {
            termination_grace_s: view.policy.termination_grace_s,
            stage_budget_s: view.policy.stage_budget_s.into_iter().collect(),
            gate_commands: view.policy.gate_commands,
        };
        let ports = ForgedPorts::new(ctx.ledger.clone(), ctx.config.clone());
        for attempt in live {
            let attempt_id = attempt.attempt_id;
            if attempt.revoke_scope == Some(RevokeScope::Deadline) {
                forged_proto::reconcile(&ctx.ledger, run_id, &ports, &config, &now_iso()).await?;
                stopped.push(attempt_id);
                continue;
            }
            let reason = reason.to_owned();
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.revoke_attempt_scoped(attempt_id, &reason, RevokeScope::Attempt)
            })
            .await?;
            forged_proto::stop_attempt(&ctx.ledger, &ports, attempt_id, config.termination_grace_s)
                .await?;
            stopped.push(attempt_id);
        }
    }
}

/// Settle the bead under `actor` — the caller's resolved custody identity.
///
/// The primary `run stop` path passes the bd lease identity actually in
/// force — the derived run holder or an adopted frontier claim from
/// `claim-next` — read at settlement time. A hardcoded derived holder would
/// wedge settlement of a frontier-claimed bead against forged's own lease.
/// The supervisor retry pass instead passes the custody epoch RECORDED in
/// the pending payload, so a later claim-next's live frontier claim is
/// never adopted by an old settlement's retry.
///
/// Residual window, accepted: holder strings cannot name epochs, so a
/// custody change to the SAME string between the identity read and the
/// CAS write — a released-then-re-claimed frontier claim, or a repeated
/// `run stop` for the same run whose earlier settlement is still pending —
/// is indistinguishable here. The ledger bounds it from both sides: the
/// retry pass's charge and succeeded appends are fenced on the pending
/// event still heading the stream, and every bd write is CAS-guarded on
/// the exact holder, so the window needs a byte-identical claim taken
/// while a terminal run's settlement is still pending.
pub(super) async fn settle_bead(
    ctx: &Ctx,
    run_id: &str,
    bead_id: &str,
    settlement: &Settlement,
    actor: &str,
) -> Result<Value, Failure> {
    let bd = ctx.config.bd_config();
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
            let closed = forged_beads::close_held_issue(&bd, bead_id, actor).await?;
            forged_beads::comment_once(&bd, bead_id, actor, &marker, &detail).await?;
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
            forged_beads::comment_once(&bd, bead_id, actor, &marker, &detail).await?;
            let issue = forged_beads::release_unresolved_issue(&bd, bead_id, actor, true).await?;
            Ok(json!({
                "id": bead_id,
                "settled": true,
                "status": issue.status,
                "assignee": issue.assignee,
                "released": issue.assignee.is_none(),
            }))
        }
        RunOutcome::Cancelled | RunOutcome::Superseded => {
            forged_beads::comment_once(&bd, bead_id, actor, &marker, &detail).await?;
            let issue = forged_beads::release_unresolved_issue(&bd, bead_id, actor, false).await?;
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
            forged_beads::comment_once(&bd, bead_id, actor, &marker, &detail).await?;
            Ok(json!({
                "id": bead_id,
                "settled": true,
                "preserved": true,
            }))
        }
    }
}

/// Post-terminal aftermath shared by fenced settlement and pid-less
/// adjudication: stop every live attempt, reconcile the Bead, retire a
/// landed worktree. Every step is replay-idempotent, so an interrupted
/// settlement resumes here without duplicating any effect.
///
/// `closed_bead_converges` is the adjudication path's contract: a legacy
/// run's Bead was usually closed by hand long ago, and an adjudicated
/// terminal outcome must read that closed Bead as already converged — for
/// every outcome — rather than error into permanent settlement-pending
/// noise. The live `run stop` path keeps the strict guarded mutations.
async fn settle_aftermath(
    ctx: &Ctx,
    run_id: &str,
    settlement: &Settlement,
    run: &RunRow,
    closed_bead_converges: bool,
) -> Result<(Vec<i64>, Value, bool, Option<String>), Failure> {
    // Every token is invalidated durably before confirmed death. This loop
    // also catches an attempt that raced the terminal state write.
    let stopped_attempts =
        stop_live_attempts(ctx, run_id, &run.stop_reason.clone().unwrap()).await?;
    let converged = if closed_bead_converges {
        match forged_beads::show_issue(&ctx.config.bd_config(), &run.bead_id).await {
            Ok(issue) if issue.status == "closed" => {
                // The closed Bead converges every adjudicated outcome, but
                // stale forged custody is still released — leaving
                // forged:<bead>:0 on a closed Bead forever is the exact
                // noise this operation retires. Foreign custody is a
                // successor's and stays untouched; a failed release is
                // reported honestly, never read as settled custody.
                let expected = run_holder(&run.bead_id);
                let (assignee, released, release_error) = match issue.assignee.as_deref() {
                    None => (None, true, None),
                    Some(holder) if holder == expected => {
                        match forged_beads::release_issue(
                            &ctx.config.bd_config(),
                            &run.bead_id,
                            holder,
                        )
                        .await
                        {
                            Ok(after) => (after.assignee, true, None),
                            Err(error) => (issue.assignee.clone(), false, Some(error.to_string())),
                        }
                    }
                    Some(_) => (issue.assignee.clone(), false, None),
                };
                let mut converged = json!({
                    "id": run.bead_id,
                    "settled": true,
                    "status": issue.status,
                    "assignee": assignee,
                    "closed": true,
                    "alreadyClosed": true,
                    "released": released,
                });
                if let Some(error) = release_error {
                    converged["releaseError"] = json!(error);
                }
                Some(converged)
            }
            // An open Bead — or one this read cannot reach — belongs to the
            // live settlement path below, whose pending fallback stays
            // retryable against the same evidence.
            _ => None,
        }
    } else {
        None
    };
    let bead = if let Some(converged) = converged {
        converged
    } else {
        // Resolve the custody identity once, before the mutation chain: the
        // pending payload must record the holder actually in force AT PEND TIME
        // (`observedHolder`), because the retry pass discriminates custody
        // epochs by that recorded data, never by the live holder string. When
        // the resolution itself fails — the same bd outage that pends — the
        // payload marks `observedHolderUnresolved` instead: a failed resolution
        // is not a legacy non-record, and the retry pass re-resolves it on a
        // later successful read rather than parking conservative-foreign
        // forever.
        let (settled, observed_holder) =
            match lease_identity(&ctx.config.bd_config(), &run.bead_id, run_id).await {
                Ok(actor) => (
                    settle_bead(ctx, run_id, &run.bead_id, settlement, &actor).await,
                    Some(actor),
                ),
                Err(error) => (Err(error), None),
            };
        match settled {
            Ok(value) => value,
            Err(error) => {
                let mut pending = json!({
                    "schemaVersion": 1,
                    "beadId": run.bead_id,
                    "outcome": settlement.outcome.as_str(),
                    "expectedAssignee": run_holder(&run.bead_id),
                    "settled": false,
                    "pending": true,
                    "error": error.to_string(),
                });
                match observed_holder {
                    Some(holder) => pending["observedHolder"] = json!(holder),
                    None => pending["observedHolderUnresolved"] = json!(true),
                }
                let event_run = run_id.to_owned();
                let event = pending.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_event_once(&event_run, "run.bead-settlement.pending", event)?;
                    Ok(())
                })
                .await?;
                pending
            }
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
    Ok((stopped_attempts, bead, retired, cleanup_error))
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

    let internal = is_internal_epic_run(ctx, run_id).await?;
    let (stopped_attempts, bead, retired, cleanup_error) = if internal {
        let stopped = stop_live_attempts(ctx, run_id, &settlement.reason).await?;
        // Preserve planning artifacts through typed stops. The epic apply
        // seam performs the required clean retirement immediately before the
        // guarded Beads write.
        (stopped, Value::Null, false, None)
    } else {
        settle_aftermath(ctx, run_id, &settlement, &run, false).await?
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

async fn is_internal_epic_run(ctx: &Ctx, run_id: &str) -> Result<bool, Failure> {
    Ok(super::drive::project(ctx, run_id)
        .await?
        .execution_package
        .is_some_and(|package| {
            matches!(
                (
                    package.protocol_ref.name.as_str(),
                    package.protocol_ref.version
                ),
                ("epic-plan" | "epic-assurance", 1)
            )
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

// ------------------------------------------- run adjudicate-settlement

/// The event kind carrying one operator settlement adjudication. At most one
/// stands per run; a conflicting second adjudication is refused so the event
/// stream can never disagree with the run's terminal record.
pub(crate) const SETTLEMENT_ADJUDICATION: &str = "forged.settlement-adjudication";

const ADJUDICATE_NAME: &str = "run_adjudicate_settlement";

/// One validated settlement adjudication: the terminal outcome plus the
/// human assertion that substitutes for the verified-kill step.
#[derive(Debug, Clone)]
struct Adjudication {
    settlement: Settlement,
    actor: String,
    rationale: String,
    evidence_gap: String,
}

fn required_trimmed<'p>(
    params: &'p serde_json::Map<String, Value>,
    key: &str,
) -> Result<&'p str, Failure> {
    let value = param_str(params, key)?;
    if value.trim().is_empty() {
        return Err(Failure::invalid(format!("{key} must not be empty")));
    }
    Ok(value)
}

fn parse_adjudication(req: &OperationRequest) -> Result<(String, Adjudication), Failure> {
    let run_id = param_str(&req.params, "run")?.to_owned();
    // The durable operation row records the envelope runId while the effect
    // settles params.run; a disagreement would settle one run and pin the
    // human-ambiguous record to another, so it refuses before anything else.
    if let Some(envelope) = req.run_id.as_deref() {
        if envelope != run_id {
            return Err(Failure::invalid(format!(
                "envelope runId {envelope:?} conflicts with params.run {run_id:?}"
            )));
        }
    }
    let outcome = outcome(param_str(&req.params, "outcome")?)?;
    if !matches!(
        outcome,
        RunOutcome::Landed | RunOutcome::Superseded | RunOutcome::Cancelled
    ) {
        return Err(Failure::invalid(
            "settlement adjudication settles an abandoned run as landed, superseded, or cancelled",
        ));
    }
    let actor = required_trimmed(&req.params, "actor")?.to_owned();
    let rationale = required_trimmed(&req.params, "rationale")?.to_owned();
    let evidence_gap = required_trimmed(&req.params, "evidenceGap")?.to_owned();
    let delivery_pr = req.params.get("pr").and_then(Value::as_u64);
    let delivery_sha = param_opt_str(&req.params, "sha").map(str::to_owned);
    let superseded_by = param_opt_str(&req.params, "supersededBy").map(str::to_owned);
    // Evidence shape is validated before anything durable exists: a refusal
    // from the terminal write would otherwise land AFTER the adjudication
    // event and strand a human-ambiguous row over a mere argument error.
    match outcome {
        RunOutcome::Landed => {
            let valid_sha = delivery_sha.as_deref().is_some_and(|sha| {
                matches!(sha.len(), 40 | 64) && sha.bytes().all(|byte| byte.is_ascii_hexdigit())
            });
            if delivery_pr.is_none() || !valid_sha {
                return Err(Failure::invalid(
                    "landed requires a PR number and an exact 40- or 64-hex commit SHA",
                ));
            }
            if superseded_by.is_some() {
                return Err(Failure::invalid("landed cannot name a successor run"));
            }
        }
        RunOutcome::Superseded => {
            if superseded_by.is_none() {
                return Err(Failure::invalid("superseded requires a successor run id"));
            }
            if delivery_pr.is_some() || delivery_sha.is_some() {
                return Err(Failure::invalid(
                    "superseded cannot carry landed delivery evidence",
                ));
            }
        }
        _ => {
            if delivery_pr.is_some() || delivery_sha.is_some() || superseded_by.is_some() {
                return Err(Failure::invalid(
                    "only landed carries delivery evidence and only superseded names a successor",
                ));
            }
        }
    }
    let reason = format!("settlement adjudicated by {actor}: {rationale}");
    Ok((
        run_id,
        Adjudication {
            settlement: Settlement {
                outcome,
                reason,
                delivery_pr,
                delivery_sha,
                superseded_by,
            },
            actor,
            rationale,
            evidence_gap,
        },
    ))
}

/// Verify the run is exactly the case adjudication exists for: a recorded
/// controller generation whose durable driver identity (pid AND lstart) is
/// gone, so the normal fence can never verify its death. A record that CAN
/// be fenced is refused — `run stop` stays the only path for fenceable runs
/// — and recorded machine effects without containment refuse outright:
/// adjudicating identity absence never authorizes ignoring them.
async fn verify_adjudicable(
    ctx: &Ctx,
    run_id: &str,
    adjudication: &Adjudication,
) -> Result<(RunRow, u32), Failure> {
    let run = {
        let run_id = run_id.to_owned();
        on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&run_id)).await?
    };
    if run.state == RunState::Stopped {
        let settlement = &adjudication.settlement;
        let identical = run.terminal_outcome == Some(settlement.outcome)
            && run.stop_reason.as_deref() == Some(settlement.reason.as_str())
            && run.delivery_pr == settlement.delivery_pr
            && run.delivery_sha == settlement.delivery_sha
            && run.superseded_by == settlement.superseded_by;
        if !identical {
            return Err(Failure::refused(
                ErrorCode::InvalidRequest,
                format!(
                    "run {run_id:?} is already stopped with outcome {:?}",
                    run.terminal_outcome
                ),
            ));
        }
    }
    let record = super::handoff::latest_record(ctx, run_id)
        .await?
        .filter(|record| super::handoff::generation(record) > 0)
        .ok_or_else(|| {
            Failure::refused(
                ErrorCode::InvalidRequest,
                format!(
                    "run {run_id:?} has no recorded controller generation; run stop settles it"
                ),
            )
        })?;
    let (pid, lstart) = super::handoff::record_driver_identity(&record);
    if pid.is_some() && lstart.is_some() {
        return Err(Failure::refused(
            ErrorCode::InvalidRequest,
            format!(
                "run {run_id:?} controller record carries durable driver identity; run stop owns fencing it"
            ),
        ));
    }
    // No controller death was ever confirmed, so NO generation is contained:
    // any in-flight machine ticket refuses the adjudication outright.
    let unsafe_operations = {
        let run_id = run_id.to_owned();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.uncontained_machine_operations(&run_id, None)
        })
        .await?
    };
    if !unsafe_operations.is_empty() {
        return Err(Failure {
            code: ErrorCode::HostUnavailable,
            message: format!(
                "run {run_id:?} has machine effects without a confirmed-dead controller: {}",
                unsafe_operations.join(", ")
            ),
            recoverable: true,
        });
    }
    Ok((run, super::handoff::generation(&record)))
}

/// The standing adjudication event, if one was ever durably recorded.
async fn standing_adjudication(ctx: &Ctx, run_id: &str) -> Result<Option<Value>, Failure> {
    Ok(super::handoff::events(ctx, run_id)
        .await?
        .into_iter()
        .rev()
        .find(|row| row.kind == SETTLEMENT_ADJUDICATION)
        .and_then(|row| serde_json::from_str::<Value>(&row.payload_json).ok()))
}

/// Record the adjudication as the run's singleton durable event, or adopt a
/// standing identical one. The payload is deterministic apart from the
/// first-append `adjudicatedAt`, so an interrupted adjudication replays into
/// exactly one event; a semantically different standing adjudication is an
/// idempotency conflict. The payload carries the delivery evidence and the
/// originating operation identity, so a retry under a fresh key can never
/// adopt the event while settling different evidence — it is pushed back to
/// the original operation row instead of orphaning it. Callers hold the run
/// submit singleton, which serializes the standing read with the append.
async fn record_adjudication(
    ctx: &Ctx,
    run_id: &str,
    adjudication: &Adjudication,
    generation: u32,
    operation_id: &str,
) -> Result<Value, Failure> {
    let semantic = json!({
        "schema": "forged.settlement-adjudication/1",
        "runId": run_id,
        "actor": adjudication.actor,
        "rationale": adjudication.rationale,
        "evidenceGap": adjudication.evidence_gap,
        "outcome": adjudication.settlement.outcome.as_str(),
        "generation": generation,
        "delivery": {
            "pr": adjudication.settlement.delivery_pr,
            "sha": adjudication.settlement.delivery_sha,
        },
        "supersededBy": adjudication.settlement.superseded_by,
        "operationId": operation_id,
    });
    if let Some(standing) = standing_adjudication(ctx, run_id).await? {
        let mut stripped = standing.clone();
        if let Some(map) = stripped.as_object_mut() {
            map.remove("adjudicatedAt");
        }
        if stripped == semantic {
            return Ok(standing);
        }
        return Err(Failure::refused(
            ErrorCode::IdempotencyConflict,
            format!(
                "run {run_id:?} already carries a different settlement adjudication recorded by operation {:?}",
                standing.get("operationId").and_then(Value::as_str).unwrap_or("unknown")
            ),
        ));
    }
    let mut payload = semantic;
    payload
        .as_object_mut()
        .expect("adjudication payload is an object")
        .insert("adjudicatedAt".to_owned(), Value::String(now_iso()));
    let event_run = run_id.to_owned();
    let event = payload.clone();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event(Some(&event_run), SETTLEMENT_ADJUDICATION, event)
    })
    .await?;
    Ok(payload)
}

/// Settle a run whose controller record cannot be fenced. The reclaim-saga
/// ordering is preserved with ONE substitution: the recorded human
/// adjudication stands in for the verified-kill step, because no durable
/// driver identity exists to verify. Everything else is the fenced
/// settlement path: the recorded generation is durably revoked in the same
/// transaction as the terminal projection, and that transaction refuses
/// while any machine effect lacks containment — no confirmed kill exists to
/// contain a ticket admitted after the precheck, so admission racing that
/// precheck must lose to the terminal write itself, never be discovered
/// after it commits.
///
/// The caller holds the run submit singleton for the WHOLE window — from the
/// operation-row probe through this effect — so a concurrent same-key retry
/// can never observe a half-executed takeover and re-run the aftermath.
async fn adjudicate_locked(
    ctx: &Ctx,
    run_id: &str,
    adjudication: Adjudication,
    operation_id: &str,
) -> Result<Value, Failure> {
    let (_run, generation) = verify_adjudicable(ctx, run_id, &adjudication).await?;
    let recorded =
        record_adjudication(ctx, run_id, &adjudication, generation, operation_id).await?;
    crate::failpoint::hit("run.adjudicate.recorded.after");
    let settlement = adjudication.settlement;
    let run = {
        let run_id = run_id.to_owned();
        let settlement = settlement.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.settle_run_fencing_controller_refusing_machine_effects(
                &run_id,
                RunSettlement {
                    outcome: settlement.outcome,
                    reason: settlement.reason,
                    delivery_pr: settlement.delivery_pr,
                    delivery_sha: settlement.delivery_sha,
                    superseded_by: settlement.superseded_by,
                },
                generation,
            )
        })
        .await
        .map_err(|mut failure| {
            // The in-transaction containment refusal is the precheck's
            // failure: retryable once the in-flight ticket resolves.
            if failure.code == ErrorCode::HostUnavailable {
                failure.recoverable = true;
            }
            failure
        })?
    };
    let (stopped_attempts, bead, retired, cleanup_error) =
        if is_internal_epic_run(ctx, run_id).await? {
            (
                stop_live_attempts(ctx, run_id, &settlement.reason).await?,
                Value::Null,
                false,
                None,
            )
        } else {
            settle_aftermath(ctx, run_id, &settlement, &run, true).await?
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
        "adjudication": recorded,
        "stoppedAttempts": stopped_attempts,
        "controllerGeneration": generation,
        "controllerStopped": false,
        "bead": bead,
        "worktreeRetired": retired,
        "worktreeCleanupError": cleanup_error,
    }))
}

/// Probe the operation store BEFORE any precondition: a stored terminal
/// response replays verbatim, a stored different request is an idempotency
/// conflict, and an interrupted row with the identical request resumes.
/// The interrupted row is human-ambiguous, so no reconciler will ever retry
/// it; the SAME human decision re-asserted under its exact key and request
/// is the sanctioned recovery, and it seals the interrupted row with the
/// real outcome instead of minting a second operation.
///
/// Errors carry the id the response must name: the derived key before a row
/// exists or when the stored request conflicts (mirroring `fenced_inner`'s
/// pre-admission probe), and the row's REAL operation id for every failure
/// after the row is in hand.
async fn probe_existing(
    ctx: &Ctx,
    req: &OperationRequest,
    run_id: &str,
    adjudication: &Adjudication,
) -> Result<Option<OperationResponse>, (String, Failure)> {
    let key = req.idempotency_key.clone();
    let row = {
        let probe_key = key.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.find_operation(ADJUDICATE_NAME, &probe_key)
        })
        .await
        .map_err(|error| (key.clone(), error))?
    };
    let Some(row) = row else {
        return Ok(None);
    };
    let hash = forged_types::request_sha256(req).map_err(|error| {
        (
            key.clone(),
            Failure::invalid(format!("params cannot be canonicalized: {error}")),
        )
    })?;
    if row.request_sha256 != hash {
        // The row is in hand, so the error names its REAL operation id —
        // the recovery/audit handle — never the incoming key.
        return Err((
            row.operation_id.clone(),
            Failure::refused(
                ErrorCode::IdempotencyConflict,
                format!(
                    "operation {ADJUDICATE_NAME:?} key {:?} was stored with a different request",
                    row.idempotency_key
                ),
            ),
        ));
    }
    if row.state == OperationState::Terminal {
        let stored = row.response_json.ok_or_else(|| {
            (
                row.operation_id.clone(),
                Failure::internal("terminal operation row has no stored response"),
            )
        })?;
        let mut response: OperationResponse = serde_json::from_str(&stored).map_err(|error| {
            (
                row.operation_id.clone(),
                Failure::internal(format!("stored response does not parse: {error}")),
            )
        })?;
        response.reused = true;
        return Ok(Some(response));
    }
    let result = adjudicate_locked(ctx, run_id, adjudication.clone(), &row.operation_id)
        .await
        .map_err(|error| (row.operation_id.clone(), error))?;
    let response = ok_response(&row.operation_id, false, result);
    let resolved = {
        let operation_id = row.operation_id.clone();
        let stored = response.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.resolve_interrupted_operation(&operation_id, &stored)
        })
        .await
    };
    if let Err(error) = resolved {
        // No concurrent same-key seal can exist here: the run submit
        // singleton is held from the operation-row probe through this
        // resolve, so a failed seal is a real ledger failure carried under
        // the row's operation id, never a lost race to paper over.
        return Err((row.operation_id, error));
    }
    Ok(Some(response))
}

/// `run adjudicate-settlement` — the explicitly destructive settlement of a
/// run whose latest controller record lacks durable driver identity. A
/// distinct operation with its own name and human-ambiguous effect class,
/// never a flag on `run stop`: the live fence path is not weakened.
pub async fn run_adjudicate_settlement(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    // The envelope gate runs BEFORE the operation-store probe: an
    // unsupported schemaVersion must not execute, resume, or replay a
    // destructive adjudication through the existing-row path.
    if let Err(error) = super::check_schema_version(req) {
        return err_response(
            &derive_key(ADJUDICATE_NAME, req.run_id.as_deref(), None, None),
            &error,
        );
    }
    let (run_id, adjudication) = match parse_adjudication(req) {
        Ok(value) => value,
        Err(error) => {
            return err_response(
                &derive_key(ADJUDICATE_NAME, req.run_id.as_deref(), None, None),
                &error,
            )
        }
    };
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    // ONE derived key per run, the outcome deliberately excluded: the key
    // binds whichever outcome was first asserted under it, so a crash retry
    // that asserts a DIFFERENT outcome collides with the stored request and
    // refuses as an idempotency conflict — visible and recoverable — instead
    // of minting a fresh row that the standing-event guard dead-ends.
    default_key(req, derive_key(ADJUDICATE_NAME, Some(&run_id), None, None));
    // The submit singleton is held from the operation-row probe through the
    // effect: a same-key retry that arrives mid-takeover waits here and then
    // reads the sealed terminal row instead of re-executing the aftermath.
    crate::failpoint::hit("run.adjudicate.submit.before");
    let _submit_guard = match super::handoff::acquire_run_submit(ctx, &run_id).await {
        Ok(guard) => guard,
        Err(error) => return err_response(&req.idempotency_key, &error),
    };
    match probe_existing(ctx, req, &run_id, &adjudication).await {
        Ok(Some(response)) => return response,
        Ok(None) => {}
        Err((operation_id, error)) => return err_response(&operation_id, &error),
    }
    // No row exists under this key, so a standing adjudication belongs to a
    // DIFFERENT operation identity — refuse before minting a row that the
    // in-effect guard would strand in progress. Recovery re-asserts the same
    // decision under the original operation's key, sealing its row.
    match standing_adjudication(ctx, &run_id).await {
        Ok(Some(standing)) => {
            return err_response(
                &req.idempotency_key,
                &Failure::refused(
                    ErrorCode::IdempotencyConflict,
                    format!(
                        "run {run_id:?} settlement was already adjudicated by operation {:?}; re-assert it under that operation's key",
                        standing.get("operationId").and_then(Value::as_str).unwrap_or("unknown")
                    ),
                ),
            )
        }
        Ok(None) => {}
        Err(error) => return err_response(&req.idempotency_key, &error),
    }
    // Preconditions refuse BEFORE any operation row exists: a human-ambiguous
    // row stranded in progress by a mere precondition would itself become
    // permanent attention noise. The effect re-verifies under the submit
    // singleton, so this early pass is a clean refusal, not the authority.
    if let Err(error) = verify_adjudicable(ctx, &run_id, &adjudication).await {
        return err_response(&req.idempotency_key, &error);
    }
    fenced(
        ctx,
        ADJUDICATE_NAME,
        EffectClass::HumanAmbiguous,
        req,
        None,
        move |operation| async move { adjudicate_locked(ctx, &run_id, adjudication, &operation).await },
    )
    .await
}
