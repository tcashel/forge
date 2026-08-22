//! Supervisor-owned retry of pending whole-run bead settlement.
//!
//! `run stop` records `run.bead-settlement.pending` when the terminal Beads
//! write fails, and its stored response replays verbatim forever after —
//! nothing inside the operation fence ever retries the promise. This pass
//! does, in two strictly separated halves:
//!
//! - a READ-ONLY convergence probe, forever: re-read the live bead and,
//!   when reality already matches the promised outcome, record
//!   `run.bead-settlement.succeeded` without mutating the bead. Convergence
//!   tests CUSTODY ALONE: a blocked/input-required promise converges over an
//!   open bead, and the promised status is forfeited along with the marker
//!   comment — the settlement's job is custody and status, and writing
//!   either would make convergence a mutation. Foreign custody converges
//!   the release-shaped outcomes and hands off — a successor's claim is
//!   never touched. Probes are throttled per run: 60s doubling capped at
//!   480s, reset to the floor whenever the live bead differs from the
//!   stored observation, at most [`PROBE_BATCH`] due runs per pass.
//! - MUTATING retries under a persisted bounded budget with per-run
//!   claim/lease fencing, charge-before-mutate, and 30s-doubling backoff
//!   capped at 8 minutes. The budget is per pending EPISODE: a fresh
//!   `run stop`-minted pending event resets it (watermarked by event id),
//!   while the pass's own re-records never do. Exhaustion stops mutation
//!   only; the probe outlives it and still converges a bead repaired by
//!   hand.
//!
//! Custody epochs are discriminated by RECORDED data, never by the holder
//! string: [`FRONTIER_HOLDER`] is a legitimate whole-run lease identity
//! (claim-next → run start → run drive share it end to end), so frontier
//! custody is this settlement's own — retried and settled under that
//! identity — ONLY when the pending payload itself recorded
//! `observedHolder == FRONTIER_HOLDER` at pend time. Frontier custody the
//! payload did not record (including legacy payloads with no
//! `observedHolder`) is foreign: release-shaped outcomes converge and hand
//! off; Landed/Clean/AcceptedRisk neither converge nor mutate — they report
//! `frontier-held`, charge no budget, and the standing attention item keeps
//! carrying them. Documented residual risk, accepted: a bead whose custody
//! was frontier at pend time, then released, then re-claimed by a LATER
//! claim-next while the pending still stands is indistinguishable by
//! string; that window needs a terminal run's settlement to still be
//! pending while the bead re-enters the ready frontier, and this pass
//! settles it under the frontier identity rather than guessing.
//!
//! This is an internal supervisor pass with no operation row: every bd write
//! it can reach is CAS-guarded and idempotent, and `run stop`'s derived key
//! and replay semantics are untouched. The pass runs beside the supervisor
//! tick, decoupled from it — see `BeadSettlementPass` in `supervise`.

use forged_beads::IssueSummary;
use forged_ledger::{PendingBeadSettlementRow, RunOutcome};
use serde_json::{json, Value};

use crate::config::now_iso;

use super::settlement::{self, Settlement};
use super::supervise::deadline_after;
use super::{on_ledger, run_holder, Ctx, Failure, FRONTIER_HOLDER};

const REPORT_SCHEMA: &str = "forged.bead-settlement.report/1";
const CLAIM_LEASE_SECONDS: u64 = 60;
/// Read-only probe throttling: per-run backoff floor and cap, and the
/// per-pass cap on due runs probed. Selection is by earliest
/// `probe_wake_at` (ties by run id), so deferred rows rotate to the front
/// of the next pass instead of starving.
const PROBE_FLOOR_SECONDS: u32 = 60;
const PROBE_CAP_SECONDS: u32 = 480;
const PROBE_BATCH: usize = 8;
/// The post-charge fence: charging extends the per-run claim to this window
/// so the fence provably outlives the longest bd mutation chain it guards —
/// up to two guarded writes (each bounded by the shared flock wait plus the
/// child run, 60s apiece) and four bounded 30s reads. A crashed executor
/// therefore parks its run for at most one backoff-cap interval.
const MUTATION_LEASE_SECONDS: u64 = 480;
const BACKOFF_BASE_SECONDS: u64 = 30;
const BACKOFF_CAP_SECONDS: u64 = 480;

/// Delay charged attempt `used + 1` schedules before the next mutating
/// retry: 30s doubling, capped at 8 minutes. The full budget spans past the
/// 5+ minute bd lease TTL that motivates the retry.
fn backoff_seconds(used: u32) -> u64 {
    BACKOFF_BASE_SECONDS
        .saturating_mul(2u64.saturating_pow(used))
        .min(BACKOFF_CAP_SECONDS)
}

/// What the read-only probe concluded about the live bead.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Probe {
    /// Reality already matches the promise: record succeeded, mutate nothing.
    Converged,
    /// Closed but still held by one of this settlement's own identities: the
    /// one guarded release is permitted, then the settlement converges.
    ReleaseHeldClosed,
    /// The marker comment decides (`clean`/`accepted-risk` under own or no
    /// custody); the caller must read comments to finish the probe.
    MarkerDecides,
    /// Still unsettled: only a budgeted mutating retry can converge it.
    Retry,
    /// Frontier custody the pending payload did not record, under an
    /// outcome that cannot hand off: neither converge nor mutate — report,
    /// charge nothing, and let the standing attention keep carrying it.
    FrontierHeld,
}

/// Custody-only convergence predicates. "Already closed" means closed AND
/// (unassigned OR foreign assignee); closed-but-held permits the one guarded
/// release. Foreign custody converges the release-shaped outcomes — the
/// holder is a successor and this settlement hands off.
///
/// `frontier_recorded` is the epoch discriminator: [`FRONTIER_HOLDER`] is
/// this settlement's OWN identity only when the pending payload recorded it
/// at pend time (`observedHolder`). Unrecorded frontier custody is a LATER
/// claim-next's live claim: foreign for the release-shaped outcomes, and
/// [`Probe::FrontierHeld`] for Landed/Clean/AcceptedRisk over an open bead,
/// which must neither record success over work nobody delivered nor mutate
/// a claim this settlement never held.
fn custody_probe(
    outcome: RunOutcome,
    issue: &IssueSummary,
    expected: &str,
    frontier_recorded: bool,
) -> Probe {
    let holder = issue.assignee.as_deref();
    let unassigned = holder.is_none();
    let own = holder.is_some_and(|holder| {
        holder == expected || (frontier_recorded && holder == FRONTIER_HOLDER)
    });
    let frontier_foreign = !frontier_recorded && holder == Some(FRONTIER_HOLDER);
    let foreign = holder.is_some() && !own;
    if issue.status == "closed" {
        return if unassigned || foreign {
            Probe::Converged
        } else {
            Probe::ReleaseHeldClosed
        };
    }
    match outcome {
        RunOutcome::Landed => {
            if frontier_foreign {
                Probe::FrontierHeld
            } else {
                Probe::Retry
            }
        }
        RunOutcome::Blocked
        | RunOutcome::InputRequired
        | RunOutcome::Cancelled
        | RunOutcome::Superseded => {
            if unassigned || foreign {
                Probe::Converged
            } else {
                Probe::Retry
            }
        }
        RunOutcome::Clean | RunOutcome::AcceptedRisk => {
            if frontier_foreign {
                Probe::FrontierHeld
            } else if foreign {
                Probe::Converged
            } else {
                Probe::MarkerDecides
            }
        }
    }
}

/// One supervisor pass over the DUE runs whose latest bead-settlement event
/// is still pending: probe schedule due (or never probed), at most
/// [`PROBE_BATCH`] per pass by earliest `probe_wake_at` (ties by run id),
/// with the overflow reported as `truncated`. Deferred rows keep their
/// older wake and therefore sort to the front of the next pass. Per-run
/// failures are report entries, never a pass failure.
pub(super) async fn reconcile(ctx: &Ctx) -> Result<Value, Failure> {
    let pending = on_ledger(&ctx.ledger, |ledger| ledger.list_pending_bead_settlements()).await?;
    let now = now_iso();
    let mut due: Vec<&PendingBeadSettlementRow> = pending
        .iter()
        .filter(|row| {
            !row.probe_wake_at
                .as_deref()
                .is_some_and(|wake| wake > now.as_str())
        })
        .collect();
    due.sort_by(
        |a, b| match (a.probe_wake_at.as_deref(), b.probe_wake_at.as_deref()) {
            (None, None) => a.run_id.cmp(&b.run_id),
            (None, Some(_)) => std::cmp::Ordering::Less,
            (Some(_), None) => std::cmp::Ordering::Greater,
            (Some(left), Some(right)) => left.cmp(right).then_with(|| a.run_id.cmp(&b.run_id)),
        },
    );
    let truncated = due.len().saturating_sub(PROBE_BATCH);
    let mut actions = Vec::new();
    for row in due.into_iter().take(PROBE_BATCH) {
        let entry = match reconcile_run(ctx, row).await {
            Ok(entry) => entry,
            Err(error) => json!({
                "runId": row.run_id,
                "action": "error",
                "error": error.to_string(),
            }),
        };
        actions.push(entry);
    }
    Ok(json!({
        "schema": REPORT_SCHEMA,
        "pending": pending.len(),
        "truncated": truncated,
        "actions": actions,
    }))
}

fn entry(run_id: &str, action: &str) -> serde_json::Map<String, Value> {
    let mut map = serde_json::Map::new();
    map.insert("runId".to_owned(), json!(run_id));
    map.insert("action".to_owned(), json!(action));
    map
}

async fn reconcile_run(ctx: &Ctx, pending: &PendingBeadSettlementRow) -> Result<Value, Failure> {
    let run_id = pending.run_id.clone();
    let payload: Value = serde_json::from_str(&pending.payload_json).unwrap_or(Value::Null);
    let Some(bead_id) = payload
        .get("beadId")
        .and_then(Value::as_str)
        .map(str::to_owned)
    else {
        let mut report = entry(&run_id, "malformed");
        report.insert("detail".to_owned(), json!("pending payload has no beadId"));
        return Ok(Value::Object(report));
    };
    let Some(outcome) = payload
        .get("outcome")
        .and_then(Value::as_str)
        .and_then(|value| RunOutcome::try_from(value).ok())
    else {
        let mut report = entry(&run_id, "malformed");
        report.insert(
            "detail".to_owned(),
            json!("pending payload has no known outcome"),
        );
        return Ok(Value::Object(report));
    };
    // The stored promise carries its own expected assignee; the derived
    // holder is identical by construction and only fills legacy payloads.
    let expected = payload
        .get("expectedAssignee")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .unwrap_or_else(|| run_holder(&bead_id));
    // The custody epoch recorded at pend time. Absent on legacy payloads,
    // which get the conservative rule: frontier custody is foreign.
    let observed_holder = payload
        .get("observedHolder")
        .and_then(Value::as_str)
        .map(str::to_owned);
    let frontier_recorded = observed_holder.as_deref() == Some(FRONTIER_HOLDER);

    // Episode watermark: a pending event newer than the row's stamp can
    // only be a fresh run-stop settlement episode — every charge and every
    // pass-minted re-record stamps the watermark transactionally, so this
    // reset never fires for the pass's own evidence.
    let episode_reset = {
        let run = run_id.clone();
        let latest = pending.event_id;
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.reset_bead_settlement_retry_for_new_episode(&run, latest)
        })
        .await?
    };

    let bd = ctx.config.bd_config();
    let issue = match forged_beads::show_issue(&bd, &bead_id).await {
        Ok(issue) => issue,
        Err(error) => {
            // A failed read is not a mutating attempt: no charge, no event,
            // and no probe-schedule advance — the schedule decays on
            // observations, not outages.
            let mut report = entry(&run_id, "probe-failed");
            report.insert("error".to_owned(), json!(error.to_string()));
            return Ok(Value::Object(report));
        }
    };
    let decision = match custody_probe(outcome, &issue, &expected, frontier_recorded) {
        Probe::MarkerDecides => {
            let marker = settlement::settlement_marker(&run_id, outcome);
            match forged_beads::comment_present(&bd, &bead_id, &marker).await {
                Ok(true) => Probe::Converged,
                Ok(false) => Probe::Retry,
                Err(error) => {
                    let mut report = entry(&run_id, "probe-failed");
                    report.insert("error".to_owned(), json!(error.to_string()));
                    return Ok(Value::Object(report));
                }
            }
        }
        decided => decided,
    };
    crate::failpoint::hit("bead-settlement.read.after");

    // Advance the probe schedule from this observation: double while the
    // bead holds still, back to the floor the moment it moves. The standing
    // row also carries the mutating budget read below; the probe upsert
    // never touches those fields.
    let now = now_iso();
    let standing = {
        let run = run_id.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.get_bead_settlement_retry(&run)
        })
        .await?
    };
    let unchanged = standing.as_ref().is_some_and(|row| {
        row.last_observed_status.as_deref() == Some(issue.status.as_str())
            && row.last_observed_assignee == issue.assignee
            && row.last_observed_revision == issue.revision
    });
    let probe_interval = if unchanged {
        standing
            .as_ref()
            .and_then(|row| row.probe_interval_s)
            .map_or(PROBE_FLOOR_SECONDS, |previous| {
                previous.saturating_mul(2).min(PROBE_CAP_SECONDS)
            })
    } else {
        PROBE_FLOOR_SECONDS
    };
    {
        let run = run_id.clone();
        let wake = deadline_after(&now, u64::from(probe_interval))?;
        let status = issue.status.clone();
        let assignee = issue.assignee.clone();
        let revision = issue.revision.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.record_bead_settlement_probe(
                &run,
                &wake,
                probe_interval,
                &status,
                assignee,
                revision,
            )
        })
        .await?;
    }

    if decision == Probe::Converged {
        let appended = {
            let run = run_id.clone();
            let event = settlement::succeeded_payload(&bead_id, outcome);
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_bead_settlement_succeeded_if_pending(&run, event)
            })
            .await?
        };
        let mut report = entry(&run_id, "converged");
        report.insert("appended".to_owned(), json!(appended));
        return Ok(Value::Object(report));
    }
    if decision == Probe::FrontierHeld {
        // Frontier custody this settlement never recorded: not ours to
        // mutate, not delivered enough to converge. No charge, no event —
        // the standing beads-settlement-pending attention keeps carrying it.
        let mut report = entry(&run_id, "frontier-held");
        report.insert("holder".to_owned(), json!(FRONTIER_HOLDER));
        report.insert("episodeReset".to_owned(), json!(episode_reset));
        return Ok(Value::Object(report));
    }
    if let Some(row) = &standing {
        if row.used >= row.budget {
            // Mutation stops; the probe above keeps running forever. Stamp
            // the standing pending evidence once so attention carries the
            // exhaustion; the derivation is deterministic, so concurrent
            // executors collapse to one appended event.
            let stamped = if payload.get("retriesExhausted").and_then(Value::as_bool) == Some(true)
            {
                false
            } else {
                let mut evidence = payload.clone();
                evidence["retriesExhausted"] = json!(true);
                evidence["attempts"] = json!(row.used);
                let run = run_id.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_bead_settlement_pending_if_pending(&run, evidence)
                })
                .await?
            };
            let mut report = entry(&run_id, "exhausted");
            report.insert("attempts".to_owned(), json!(row.used));
            report.insert("stamped".to_owned(), json!(stamped));
            return Ok(Value::Object(report));
        }
        if row
            .next_wake_at
            .as_deref()
            .is_some_and(|wake| wake > now.as_str())
        {
            let mut report = entry(&run_id, "waiting");
            report.insert("nextWakeAt".to_owned(), json!(row.next_wake_at));
            return Ok(Value::Object(report));
        }
    }

    let token = format!("bead-settlement:{}", uuid::Uuid::now_v7());
    let lease = deadline_after(&now, CLAIM_LEASE_SECONDS)?;
    let claimed = {
        let run = run_id.clone();
        let claim_token = token.clone();
        let claim_now = now.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.claim_bead_settlement_retry(&run, &claim_token, &claim_now, &lease)
        })
        .await?
    };
    let Some(claimed) = claimed else {
        return Ok(Value::Object(entry(&run_id, "contended")));
    };

    // The mutation runs under the RECORDED custody epoch: the holder this
    // probe observed when it is one of this settlement's own identities,
    // else the derived expected assignee — never a live frontier claim the
    // payload did not record. Every guarded write CASes on it, so custody
    // moving after the probe fails the attempt instead of mutating.
    let actor = issue
        .assignee
        .as_deref()
        .filter(|holder| *holder == expected || (frontier_recorded && *holder == FRONTIER_HOLDER))
        .unwrap_or(expected.as_str())
        .to_owned();
    // Everything after the successful claim runs in one block whose result
    // is matched below, with `finish` on every arm: async Drop does not
    // exist, so no exit path may return past the claim release. A ledger
    // failure after the charge may cost the charged attempt, but no exit
    // leaves a standing claim token.
    let post_claim: Result<(serde_json::Map<String, Value>, Option<String>), Failure> = async {
        // Re-check under the fence: another executor may have charged
        // between the standing read and this claim.
        if claimed.used >= claimed.budget
            || claimed
                .next_wake_at
                .as_deref()
                .is_some_and(|wake| wake > now.as_str())
        {
            return Ok((entry(&run_id, "superseded"), None));
        }

        let attempt = claimed.used + 1;
        if let Some(detail) = crate::failpoint::injected("bead-settlement.wake-deadline") {
            return Err(Failure::internal(detail));
        }
        let wake = deadline_after(&now, backoff_seconds(claimed.used))?;
        let mutation_lease = deadline_after(&now, MUTATION_LEASE_SECONDS)?;
        if let Some(detail) = crate::failpoint::injected("bead-settlement.charge") {
            return Err(Failure::internal(detail));
        }
        let charged = {
            let run = run_id.clone();
            let charge_token = token.clone();
            let pending_event = pending.event_id;
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.charge_bead_settlement_retry(
                    &run,
                    &charge_token,
                    &wake,
                    &mutation_lease,
                    pending_event,
                )
            })
            .await?
        };
        crate::failpoint::hit("bead-settlement.charge.after");

        let mutation = if let Some(detail) = crate::failpoint::injected("bead-settlement.mutation")
        {
            Err(Failure::internal(detail))
        } else {
            match decision {
                Probe::ReleaseHeldClosed => release_held_closed(ctx, &bead_id, &actor).await,
                _ => {
                    if let Some(detail) = crate::failpoint::injected("bead-settlement.get-run") {
                        return Err(Failure::internal(detail));
                    }
                    // Rebuild the settlement from the run row; the pending
                    // payload contributes only beadId/outcome/
                    // expectedAssignee/observedHolder.
                    let run = {
                        let run = run_id.clone();
                        on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&run)).await?
                    };
                    let settlement = Settlement {
                        outcome,
                        reason: run.stop_reason.unwrap_or_default(),
                        delivery_pr: run.delivery_pr,
                        delivery_sha: run.delivery_sha,
                        superseded_by: run.superseded_by,
                    };
                    // A landed promise over an OPEN, UNASSIGNED bead — a
                    // blocked settlement released the claim before
                    // accept-risk landed the run — takes guarded custody
                    // first: CAS-claim the expected assignee where the
                    // assignee is currently null, then the existing held
                    // close. Both writes are guarded and idempotent; a
                    // crash between them leaves a held bead the next
                    // attempt's close path already converges.
                    let reclaimed = if outcome == RunOutcome::Landed && issue.assignee.is_none() {
                        forged_beads::claim_specific(&bd, &bead_id, &expected)
                            .await
                            .map(|_| true)
                            .map_err(Failure::from)
                    } else {
                        Ok(false)
                    };
                    match reclaimed {
                        Ok(reclaimed) => {
                            if reclaimed {
                                crate::failpoint::hit("bead-settlement.landed-claim.after");
                            }
                            settlement::settle_bead(ctx, &run_id, &bead_id, &settlement, &actor)
                                .await
                                .map(|_| ())
                        }
                        Err(error) => Err(error),
                    }
                }
            }
        };
        crate::failpoint::hit("bead-settlement.mutate.after");

        match mutation {
            Ok(()) => {
                if let Some(detail) = crate::failpoint::injected("bead-settlement.append-succeeded")
                {
                    return Err(Failure::internal(detail));
                }
                let appended = {
                    let run = run_id.clone();
                    let event = settlement::succeeded_payload(&bead_id, outcome);
                    on_ledger(&ctx.ledger, move |ledger| {
                        ledger.append_bead_settlement_succeeded_if_pending(&run, event)
                    })
                    .await?
                };
                let mut report = entry(&run_id, "retried");
                report.insert("attempt".to_owned(), json!(attempt));
                report.insert("settled".to_owned(), json!(true));
                report.insert("appended".to_owned(), json!(appended));
                Ok((report, None))
            }
            Err(error) => {
                let mut repended = json!({
                    "schemaVersion": 1,
                    "beadId": bead_id,
                    "outcome": outcome.as_str(),
                    "expectedAssignee": expected,
                    "settled": false,
                    "pending": true,
                    "error": error.to_string(),
                    "attempt": attempt,
                });
                // The epoch travels with the episode: a re-record without
                // it would demote later retries to the conservative rule.
                if let Some(holder) = &observed_holder {
                    repended["observedHolder"] = json!(holder);
                }
                if attempt >= charged.budget {
                    repended["retriesExhausted"] = json!(true);
                    repended["attempts"] = json!(attempt);
                }
                if let Some(detail) = crate::failpoint::injected("bead-settlement.append-pending") {
                    return Err(Failure::internal(detail));
                }
                {
                    let run = run_id.clone();
                    on_ledger(&ctx.ledger, move |ledger| {
                        ledger.append_bead_settlement_pending_if_pending(&run, repended)
                    })
                    .await?;
                }
                let mut report = entry(&run_id, "retry-failed");
                report.insert("attempt".to_owned(), json!(attempt));
                report.insert("error".to_owned(), json!(error.to_string()));
                Ok((report, Some(error.to_string())))
            }
        }
    }
    .await;
    match post_claim {
        Ok((report, last_error)) => {
            finish(ctx, &run_id, &token, last_error).await;
            Ok(Value::Object(report))
        }
        Err(error) => {
            finish(ctx, &run_id, &token, Some(error.to_string())).await;
            Err(error)
        }
    }
}

/// The one guarded release for a closed-but-held bead, under `actor` — the
/// custody identity the probe observed, one of this settlement's own
/// recorded identities, never a re-derived or live-adopted one. The result
/// is revalidated: the release CAS fences the assignee alone, so a reopen
/// landing between the closed probe and the write yields an open,
/// unassigned bead — not the promised settled shape — and must fail the
/// attempt rather than record success over it.
async fn release_held_closed(ctx: &Ctx, bead_id: &str, actor: &str) -> Result<(), Failure> {
    let bd = ctx.config.bd_config();
    let released = forged_beads::release_issue(&bd, bead_id, actor).await?;
    if released.status != "closed" {
        return Err(Failure {
            code: forged_types::ErrorCode::BeadsContention,
            message: format!(
                "guarded release of {bead_id} observed status {:?}: a concurrent reopen \
                 outran the closed-bead probe",
                released.status
            ),
            recoverable: true,
        });
    }
    Ok(())
}

/// Release the per-run claim. A lost token is not an error — the lease is
/// the crash-recovery evidence — so failures are logged, never propagated.
async fn finish(ctx: &Ctx, run_id: &str, token: &str, last_error: Option<String>) {
    let run = run_id.to_owned();
    let claim_token = token.to_owned();
    if let Err(error) = on_ledger(&ctx.ledger, move |ledger| {
        ledger.finish_bead_settlement_retry(&run, &claim_token, last_error)
    })
    .await
    {
        tracing::warn!(run_id, %error, "could not release a bead settlement retry claim");
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;

    fn issue(status: &str, assignee: Option<&str>) -> IssueSummary {
        IssueSummary {
            id: "bead-probe".to_owned(),
            title: String::new(),
            description: String::new(),
            status: status.to_owned(),
            priority: None,
            assignee: assignee.map(str::to_owned),
            issue_type: "task".to_owned(),
            acceptance_criteria: String::new(),
            design: String::new(),
            notes: String::new(),
            spec_id: None,
            metadata: BTreeMap::new(),
            revision: None,
            updated_at: None,
        }
    }

    const EXPECTED: &str = "forged:bead-probe:0";

    #[test]
    fn backoff_doubles_from_thirty_seconds_and_caps_at_eight_minutes() {
        assert_eq!(backoff_seconds(0), 30);
        assert_eq!(backoff_seconds(1), 60);
        assert_eq!(backoff_seconds(2), 120);
        assert_eq!(backoff_seconds(3), 240);
        assert_eq!(backoff_seconds(4), 480);
        assert_eq!(backoff_seconds(7), 480);
        let total: u64 = (0..forged_ledger::BEAD_SETTLEMENT_RETRY_BUDGET)
            .map(backoff_seconds)
            .sum();
        assert!(
            total > forged_beads::BD_LEASE_TTL_S,
            "the schedule must comfortably span the bd lease TTL"
        );
    }

    #[test]
    fn a_closed_bead_converges_every_outcome_and_own_custody_permits_one_release() {
        for outcome in [
            RunOutcome::Landed,
            RunOutcome::Clean,
            RunOutcome::Blocked,
            RunOutcome::InputRequired,
            RunOutcome::Cancelled,
            RunOutcome::AcceptedRisk,
            RunOutcome::Superseded,
        ] {
            assert_eq!(
                custody_probe(outcome, &issue("closed", None), EXPECTED, false),
                Probe::Converged,
                "{outcome:?} closed+unassigned"
            );
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("closed", Some("forged:successor:0")),
                    EXPECTED,
                    false
                ),
                Probe::Converged,
                "{outcome:?} closed+foreign"
            );
            assert_eq!(
                custody_probe(outcome, &issue("closed", Some(EXPECTED)), EXPECTED, false),
                Probe::ReleaseHeldClosed,
                "{outcome:?} closed+held"
            );
        }
    }

    #[test]
    fn release_shaped_outcomes_converge_on_lost_custody_and_landed_does_not() {
        for outcome in [
            RunOutcome::Blocked,
            RunOutcome::InputRequired,
            RunOutcome::Cancelled,
            RunOutcome::Superseded,
        ] {
            assert_eq!(
                custody_probe(outcome, &issue("open", None), EXPECTED, false),
                Probe::Converged,
                "{outcome:?} unassigned"
            );
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some("forged:successor:0")),
                    EXPECTED,
                    false
                ),
                Probe::Converged,
                "{outcome:?} foreign custody hands off"
            );
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some(EXPECTED)),
                    EXPECTED,
                    false
                ),
                Probe::Retry,
                "{outcome:?} still held by this run"
            );
        }
        assert_eq!(
            custody_probe(
                RunOutcome::Landed,
                &issue("in_progress", Some("forged:successor:0")),
                EXPECTED,
                false
            ),
            Probe::Retry,
            "landed promises a close; foreign custody alone is not delivery"
        );
    }

    #[test]
    fn recorded_frontier_custody_is_own_and_unrecorded_frontier_custody_is_foreign() {
        // The pending payload recorded observedHolder == FRONTIER_HOLDER:
        // the frontier claim is this settlement's own identity, still owed
        // its finish.
        for outcome in [
            RunOutcome::Blocked,
            RunOutcome::InputRequired,
            RunOutcome::Cancelled,
            RunOutcome::Superseded,
        ] {
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some(FRONTIER_HOLDER)),
                    EXPECTED,
                    true
                ),
                Probe::Retry,
                "{outcome:?} under the recorded frontier claim still owes its release"
            );
        }
        assert_eq!(
            custody_probe(
                RunOutcome::Landed,
                &issue("in_progress", Some(FRONTIER_HOLDER)),
                EXPECTED,
                true
            ),
            Probe::Retry,
            "landed under the recorded frontier claim still owes its close"
        );
        assert_eq!(
            custody_probe(
                RunOutcome::Landed,
                &issue("closed", Some(FRONTIER_HOLDER)),
                EXPECTED,
                true
            ),
            Probe::ReleaseHeldClosed,
            "closed under the recorded frontier claim permits the one guarded release"
        );
        for outcome in [RunOutcome::Clean, RunOutcome::AcceptedRisk] {
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some(FRONTIER_HOLDER)),
                    EXPECTED,
                    true
                ),
                Probe::MarkerDecides,
                "{outcome:?} under the recorded frontier claim defers to the marker"
            );
        }

        // Unrecorded (or legacy) frontier custody is a LATER claim-next's
        // live claim: release-shaped outcomes hand off; the rest neither
        // converge nor mutate.
        for outcome in [
            RunOutcome::Blocked,
            RunOutcome::InputRequired,
            RunOutcome::Cancelled,
            RunOutcome::Superseded,
        ] {
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some(FRONTIER_HOLDER)),
                    EXPECTED,
                    false
                ),
                Probe::Converged,
                "{outcome:?} under an unrecorded frontier claim hands off"
            );
        }
        for outcome in [
            RunOutcome::Landed,
            RunOutcome::Clean,
            RunOutcome::AcceptedRisk,
        ] {
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some(FRONTIER_HOLDER)),
                    EXPECTED,
                    false
                ),
                Probe::FrontierHeld,
                "{outcome:?} under an unrecorded frontier claim neither converges nor mutates"
            );
        }
        assert_eq!(
            custody_probe(
                RunOutcome::Landed,
                &issue("closed", Some(FRONTIER_HOLDER)),
                EXPECTED,
                false
            ),
            Probe::Converged,
            "closed under an unrecorded frontier claim converges without the guarded release"
        );
    }

    #[test]
    fn clean_and_accepted_risk_defer_to_the_marker_unless_custody_moved() {
        for outcome in [RunOutcome::Clean, RunOutcome::AcceptedRisk] {
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some(EXPECTED)),
                    EXPECTED,
                    false
                ),
                Probe::MarkerDecides
            );
            assert_eq!(
                custody_probe(outcome, &issue("open", None), EXPECTED, false),
                Probe::MarkerDecides
            );
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some("forged:successor:0")),
                    EXPECTED,
                    false
                ),
                Probe::Converged
            );
        }
    }
}
