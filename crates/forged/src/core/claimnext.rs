//! `claim-next` — ledger-first porcelain, the stateless resume verb. Order
//! is load-bearing: resume from forged's own ledger first; only when no
//! ledger run is resumable pull the fresh bd frontier. A claim-next that
//! pulls a fresh work while a resumable run sits in the ledger is a
//! BLOCKER-severity bug.
//!
//! "No ledger run is resumable" means the scan was EXHAUSTED, not that its
//! first candidate declined: both a reclaim refusal (another worker's lease
//! is live) and a pending retry deadline skip that one run and continue to
//! the next.

use forged_ledger::{EffectClass, RunState};
use forged_types::{OperationRequest, OperationResponse};
use serde_json::{json, Value};

use crate::config::now_iso;
use crate::core::{
    err_response, fenced, lease_identity, on_ledger, param_str, session_claimant, Ctx, Failure,
    FRONTIER_HOLDER,
};
use crate::failpoint;

/// One resumable candidate found in the ledger.
struct Resumable {
    run_id: String,
    work_id: String,
    packet_id: String,
    spec: forged_types::SpecRef,
    stage_key: String,
    logical_seq: i64,
    stage_budget_s: u64,
    /// Exact packet identity whose provider is resolved transactionally by
    /// admission before this resume mints an attempt claimant.
    admission: super::admission::PacketAdmission,
}

/// What a reclaim outcome plus the work's current lease holder mean for one
/// candidate — the operator-adjudicated refusal semantics (2026-08-12),
/// stated once so it can be tested without bd.
///
/// `previous_owner: None` is the refusal shape: nothing was reclaimed. It
/// means leave-the-run-alone-and-keep-scanning EXCEPT in two whitelisted
/// resume branches, both of which are this driver resuming its OWN work and
/// neither of which can overlap a live process: the lease is already held
/// under this run's identity (a driver restart resuming itself), or there is
/// no lease at all (expired and reclaimed, released by an earlier reconcile
/// pass, or never taken). Any other holder is another worker's live lease.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Resume {
    /// Resume this run; `retake` says whether the lease must be (re-)taken.
    Proceed { retake: bool },
    /// Leave this run untouched and keep scanning.
    Skip,
}

fn resume_decision(
    previous_owner: Option<&str>,
    current_holder: Option<&str>,
    ours: &str,
) -> Resume {
    if previous_owner.is_some() {
        // We reclaimed an expired lease: it is ours to retake.
        return Resume::Proceed { retake: true };
    }
    match current_holder {
        // Whitelisted (i): already held under this run's identity.
        Some(holder) if holder == ours => Resume::Proceed { retake: false },
        // Another worker's live lease.
        Some(_) => Resume::Skip,
        // Whitelisted (ii): no lease at all.
        None => Resume::Proceed { retake: true },
    }
}

/// Scan the ledger for EVERY Active run with a reopened packet — a packet
/// with no live attempt and no completed attempt, the shape a crashed or
/// transport-failed attempt leaves behind — honoring each packet's retry
/// deadline.
///
/// Plural by contract: a candidate whose lease turns out to be live under
/// another worker is skipped and the scan continues, so the fresh bd
/// frontier is reached only when NO resumable ledger run remains. Returning
/// the first candidate alone would pull a fresh work past a resumable run
/// sitting behind a refusal — the BLOCKER-severity failure this verb exists
/// to rule out.
async fn find_resumables(ctx: &Ctx) -> Result<Vec<Resumable>, Failure> {
    let runs = on_ledger(&ctx.ledger, |l| l.list_runs()).await?;
    let now = now_iso();
    let mut resumables = Vec::new();
    for run in runs {
        if run.state != RunState::Active {
            continue;
        }
        let view = crate::core::drive::project(ctx, &run.run_id).await?;
        // The engine's own answer names the packet and the deadline; a live
        // attempt means someone is (or claims to be) working it.
        let action = forged_proto::advance(&view);
        let forged_proto::NextAction::AwaitPacket {
            packet_id,
            not_before,
        } = action
        else {
            continue;
        };
        if view.live_attempts.iter().any(|a| a.packet_id == packet_id) {
            continue;
        }
        if let Some(deadline) = &not_before {
            // Never re-attempt early: the widened form compares
            // lexicographically.
            if deadline.as_str() > now.as_str() {
                continue;
            }
        }
        let packet = view
            .packets
            .iter()
            .find(|p| p.packet_id == packet_id)
            .cloned();
        let Some(packet) = packet else { continue };
        let (_, stage_key, logical_seq) = crate::core::split_packet_key(&packet_id)?;
        let stage_budget_s = view
            .policy
            .stage_budget_s
            .get(&packet.stage)
            .copied()
            .ok_or_else(|| Failure::internal("run policy has no stage budget"))?;
        let admission = super::admission::PacketAdmission {
            packet_id: packet_id.clone(),
            run_id: run.run_id.clone(),
            work_id: run.work_id.clone(),
        };
        resumables.push(Resumable {
            run_id: run.run_id,
            work_id: run.work_id,
            packet_id,
            spec: forged_proto::packet_spec(&packet),
            stage_key,
            logical_seq,
            stage_budget_s,
            admission,
        });
    }
    Ok(resumables)
}

/// The core function behind `claim-next` / the `claim_next` tool.
pub async fn claim_next(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let holder = match param_str(&req.params, "holder") {
        Ok(h) => h.to_owned(),
        Err(f) => return err_response(&req.idempotency_key, &f),
    };
    fenced(ctx, "claim_next", EffectClass::SafeRetry, req, None, {
        move |_op_id| async move { claim_next_effect(ctx, &holder).await }
    })
    .await
}

async fn claim_next_effect(ctx: &Ctx, holder: &str) -> Result<Value, Failure> {
    // 1. Resume from forged's own ledger first — every resumable candidate
    //    in ledger order, until one of them actually resumes.
    for candidate in find_resumables(ctx).await? {
        let admission_guard =
            super::handoff::acquire_packet_submit(ctx, &candidate.packet_id, &candidate.run_id)
                .await?;
        // The ONE lease identity for this run: whatever forged already holds
        // the work under, else the derived holder. Never a second, differing
        // identity of our own making.
        let run_holder_id =
            lease_identity(&ctx.ledger, &candidate.work_id, &candidate.run_id).await?;
        let older_than = forged_ledger::work_reclaim_older_than(candidate.stage_budget_s);

        // Scoped reclaim — `--id` and `--assignee` both mandatory; an
        // unscoped reclaim would rob every other worker. The previous holder
        // named here is that one identity, so the reclaim can only ever take
        // back forged's own expired lease.
        failpoint::hit("work.reclaim.before");
        let previous_owner = crate::core::workstore::reclaim(
            &ctx.ledger,
            &candidate.work_id,
            &run_holder_id,
            older_than,
        )
        .await?;
        failpoint::hit("work.reclaim.after");
        // On the refusal shape (`previous_owner: None`, nothing reclaimed)
        // only the two whitelisted branches resume — see `resume_decision`.
        let current = if previous_owner.is_some() {
            None
        } else {
            crate::core::workstore::lease_holder(&ctx.ledger, &candidate.work_id).await?
        };
        let retake = match resume_decision(
            previous_owner.as_deref(),
            current.as_deref(),
            &run_holder_id,
        ) {
            Resume::Proceed { retake } => retake,
            // The refusal stands for THIS run only: another worker's lease
            // is live on it, so leave it untouched and keep scanning. The
            // frontier is reached only once the scan is exhausted.
            Resume::Skip => continue,
        };
        if retake {
            // (Re-)take the lease under that same one identity.
            failpoint::hit("work.claim.before");
            crate::core::workstore::claim_specific(&ctx.ledger, &candidate.work_id, &run_holder_id)
                .await?;
            failpoint::hit("work.claim.after");
        }
        // Allocate only after the lease decision. A foreign live lease is a
        // skipped candidate, not capacity ownership; reserving before that
        // decision would leak an ownerless slot and could block the next
        // resumable run in this same scan.
        let admission = super::admission::admit_packet_facts(ctx, &candidate.admission).await?;
        if admission.decision.outcome != forged_types::AdmissionOutcome::Admitted {
            return Err(Failure {
                code: forged_types::ErrorCode::OperationInProgress,
                message: format!(
                    "packet {} deferred by admission: {:?}",
                    candidate.packet_id, admission.decision.reason
                ),
                recoverable: true,
            });
        }
        let reservation_id = admission
            .reservation
            .ok_or_else(|| Failure::internal("admitted packet has no capacity reservation"))?
            .reservation_id;
        let provider = admission
            .packet_provider_hints
            .as_ref()
            .map(|hints| hints.provider.clone())
            .ok_or_else(|| Failure::internal("packet admission omitted provider facts"))?;
        // 2. Hand back the reopened packet of that same run — never a fresh
        // one. One spec read per claim, fencing on whatever the packet pins.
        //
        // This read happens AFTER the reclaim and the (re-)claim above, both
        // of which write the work and so mint a fresh bd revision. That is
        // exactly why the fence is the rendered body and not the revision:
        // fenced on the write token, a crash resume would be refused for
        // forged's own lease write.
        //
        // PRE-CLAIM, exactly as in `execute_packet`: there is no attempt row
        // and no claim token to fail one under, so a recoverable failure is
        // charged to the packet's bounded budget through its grant alone.
        // Untracked, an unreachable bd would refuse here for free, forever —
        // and `claim-next` is the path an operator retries by hand, so
        // "for free, forever" is a loop with a human in it.
        let resolved =
            match crate::core::spec::resolve_for_packet(ctx, &candidate.spec, &candidate.work_id)
                .await
            {
                Ok(resolved) => resolved,
                Err(failure) if failure.recoverable => {
                    let note = format!("transport: the resume could not read the spec: {failure}");
                    crate::adapters::execute::grant_pre_claim_retry(
                        ctx,
                        &candidate.packet_id,
                        note,
                    )
                    .await?;
                    return Err(failure);
                }
                Err(failure) => return Err(failure),
            };
        // Re-pin BEFORE claiming. A work edited under this open packet leaves
        // the row pinned to bytes no seat can reach, and `claim_packet` would
        // refuse the current body as drift — forever, since nothing else on
        // this path ever moves the pin. `run advance` re-pins on its
        // claim-again branch; a resume that could not would make the
        // ledger-first recovery the weaker of the two.
        let spec_ref = crate::adapters::execute::repin_spec_ref(
            ctx,
            &candidate.packet_id,
            &candidate.spec,
            &resolved,
        )
        .await?;
        let fence = resolved.fence.clone();
        let claimed = {
            let packet_id = candidate.packet_id.clone();
            let claimant = session_claimant(&candidate.packet_id, &provider);
            on_ledger(&ctx.ledger, move |l| {
                l.claim_packet_with_admission(&packet_id, &claimant, &fence, &reservation_id)
            })
            .await?
        };
        crate::failpoint::hit("admission.reservation.transfer.after");
        drop(admission_guard);
        // The claim fenced these bytes; write them where the packet contract
        // already tells the resuming seat to read them. An external seat
        // never enters `run_attempt`, so nothing else would.
        //
        // Post-claim and pre-spawn: a failure here settles the attempt under
        // its own token before it propagates (`abandon_claim`), never leaving
        // a `running` row with no process behind it.
        if let Err(failure) =
            crate::core::spec::assert_pinned(&spec_ref, &resolved).and_then(|()| {
                crate::core::spec::materialize(&resolved, std::path::Path::new(&spec_ref.path))
            })
        {
            return Err(crate::core::abandon_claim(
                ctx,
                &candidate.packet_id,
                &claimed.claim_token,
                failure,
            )
            .await);
        }
        // Process identity belongs to the new attempt. Clearing within that
        // fresh namespace never touches predecessor evidence.
        let dir = ctx.config.packet_dir_key(
            &candidate.run_id,
            &candidate.stage_key,
            candidate.logical_seq,
        );
        let dirs = forged_provider::PacketDirs::new(&dir, claimed.attempt_id);
        let _ = std::fs::remove_file(dirs.provider_pid());
        let _ = std::fs::remove_file(dirs.provider_lstart());
        return Ok(json!({
            "claimed": {
                "run_id": candidate.run_id,
                "packet_id": candidate.packet_id,
                "attempt_id": claimed.attempt_id,
                "claim_token": claimed.claim_token,
                "resumed": true,
            }
        }));
    }

    // 3. Only now: the fresh bd frontier. An empty frontier is a success.
    //
    // The bd actor is the DERIVED pre-run identity, never the caller's
    // `--holder`: `bd ready --claim` needs its actor before it says which
    // work it gave us, and a lease taken under the operator's own string
    // would be refused to `run drive`'s Resolve minutes later as a claim by
    // a stranger. `--holder` names the caller for its own bookkeeping; it
    // never reaches bd.
    tracing::debug!(
        caller = %holder,
        actor = %FRONTIER_HOLDER,
        "frontier claim: the bd actor is the derived pre-run identity"
    );
    failpoint::hit("work.claim.before");
    let claimed = crate::core::workstore::claim_ready(&ctx.ledger, FRONTIER_HOLDER).await?;
    failpoint::hit("work.claim.after");
    Ok(match claimed {
        None => json!({"claimed": null}),
        Some(work) => json!({
            "claimed": {
                "run_id": null,
                "bead_id": work.id,
                "packet_id": null,
                "attempt_id": null,
                "claim_token": null,
                "resumed": false,
            }
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::{resume_decision, Resume};

    const OURS: &str = "forged:bead-1:0";

    #[test]
    fn a_reclaimed_lease_resumes_and_is_retaken() {
        assert_eq!(
            resume_decision(Some(OURS), None, OURS),
            Resume::Proceed { retake: true },
            "we reclaimed an expired lease: retake it"
        );
    }

    #[test]
    fn whitelisted_i_a_lease_already_under_our_identity_resumes_without_retaking() {
        // A driver restart resuming its own work: the reclaim refuses
        // because the lease is live, and it is live under US.
        assert_eq!(
            resume_decision(None, Some(OURS), OURS),
            Resume::Proceed { retake: false }
        );
    }

    #[test]
    fn whitelisted_ii_no_lease_at_all_resumes_and_retakes() {
        // Expired-and-reclaimed, released by an earlier reconcile pass, or
        // never taken: nothing to overlap with.
        assert_eq!(
            resume_decision(None, None, OURS),
            Resume::Proceed { retake: true }
        );
    }

    #[test]
    fn a_foreign_live_lease_skips_that_run() {
        // The refusal shape with someone else's live lease: leave the run
        // untouched and keep scanning. NOT a fall-through to the frontier.
        assert_eq!(
            resume_decision(None, Some("someone-else:host:99"), OURS),
            Resume::Skip
        );
        // Including another forged driver's run identity.
        assert_eq!(
            resume_decision(None, Some("forged:bead-2:0"), OURS),
            Resume::Skip
        );
    }
}
