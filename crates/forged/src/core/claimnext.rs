//! `claim-next` — ledger-first porcelain, the stateless resume verb. Order
//! is load-bearing: resume from forged's own ledger first; only when no
//! ledger run is resumable pull the fresh bd frontier. A claim-next that
//! pulls a fresh bead while a resumable run sits in the ledger is a
//! BLOCKER-severity bug.

use forged_ledger::{EffectClass, RunState};
use forged_types::{OperationRequest, OperationResponse};
use serde_json::{json, Value};

use crate::adapters::execute::sha256_file;
use crate::config::now_iso;
use crate::core::{err_response, fenced, on_ledger, param_str, run_holder, Ctx, Failure};
use crate::failpoint;

/// One resumable candidate found in the ledger.
struct Resumable {
    run_id: String,
    bead_id: String,
    packet_id: String,
    spec_path: String,
    stage: forged_types::Stage,
}

/// Scan the ledger for the first Active run with a reopened packet — a
/// packet with no live attempt and no completed attempt, the shape a
/// crashed or transport-failed attempt leaves behind — honoring the
/// packet's retry deadline.
async fn find_resumable(ctx: &Ctx) -> Result<Option<Resumable>, Failure> {
    let runs = on_ledger(&ctx.ledger, |l| l.list_runs()).await?;
    let now = now_iso();
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
        return Ok(Some(Resumable {
            run_id: run.run_id,
            bead_id: run.bead_id,
            packet_id,
            spec_path: packet.spec_path,
            stage: packet.stage,
        }));
    }
    Ok(None)
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
    let bd = ctx.config.bd_config();

    // 1. Resume from forged's own ledger first.
    if let Some(candidate) = find_resumable(ctx).await? {
        let run_holder_id = run_holder(&candidate.run_id);
        let budget = ctx
            .config
            .stage_budget_s
            .get(&candidate.stage)
            .copied()
            .unwrap_or(1800);
        let older_than = forged_beads::reclaim_older_than(budget);

        // Scoped reclaim — `--id` and `--assignee` both mandatory; an
        // unscoped reclaim would rob every other worker. The previous
        // holder is the derived per-run driver id every process computes.
        failpoint::hit("bd.reclaim.before");
        let outcome =
            forged_beads::reclaim(&bd, &candidate.bead_id, &run_holder_id, older_than).await?;
        failpoint::hit("bd.reclaim.after");
        // On the refusal shape (`previous_owner: None`, nothing reclaimed)
        // the lease may be genuinely live under someone else — leave the
        // run alone — or already ours, or already released by an earlier
        // reconcile pass (revoke-reclaim frees it). Only another worker's
        // live lease blocks the resume.
        let (proceed, retake) = if outcome.previous_owner.is_some() {
            (true, true)
        } else {
            match forged_beads::lease_holder(&bd, &candidate.bead_id)
                .await?
                .as_deref()
            {
                Some(holder) if holder == run_holder_id => (true, false),
                Some(_) => (false, false),
                None => (true, true),
            }
        };
        if proceed {
            if retake {
                // (Re-)take the lease under the same derived holder.
                failpoint::hit("bd.claim.before");
                forged_beads::claim_specific(&bd, &candidate.bead_id, &run_holder_id).await?;
                failpoint::hit("bd.claim.after");
            }
            // 2. Hand back the reopened packet of that same run — never a
            // fresh one.
            let current_sha = sha256_file(std::path::Path::new(&candidate.spec_path))?;
            let claimed = {
                let packet_id = candidate.packet_id.clone();
                let claimant = run_holder_id.clone();
                on_ledger(&ctx.ledger, move |l| {
                    l.claim_packet(&packet_id, &claimant, &current_sha)
                })
                .await?
            };
            // The packet directory belongs to the new attempt now: a stale
            // pid file from the dead attempt must not read as its session.
            let (_, stage, seq) = crate::core::split_packet_id(&candidate.packet_id)?;
            let _ = std::fs::remove_file(
                ctx.config
                    .packet_dir(&candidate.run_id, stage, seq)
                    .join("provider.pid"),
            );
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
        // Refusal: leave the run alone and fall through to the frontier.
    }

    // 3. Only now: the fresh bd frontier. An empty frontier is a success.
    failpoint::hit("bd.claim.before");
    let claimed = forged_beads::claim_ready(&bd, holder).await?;
    failpoint::hit("bd.claim.after");
    Ok(match claimed {
        None => json!({"claimed": null}),
        Some(bead) => json!({
            "claimed": {
                "run_id": null,
                "bead_id": bead.id,
                "packet_id": null,
                "attempt_id": null,
                "claim_token": null,
                "resumed": false,
            }
        }),
    })
}
