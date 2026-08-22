//! Supervisor-owned retry of pending whole-run bead settlement.
//!
//! `run stop` records `run.bead-settlement.pending` when the terminal Beads
//! write fails, and its stored response replays verbatim forever after —
//! nothing inside the operation fence ever retries the promise. This pass
//! does, in two strictly separated halves:
//!
//! - a READ-ONLY convergence probe on every tick, forever: re-read the live
//!   bead and, when reality already matches the promised outcome, record
//!   `run.bead-settlement.succeeded` without mutating the bead. Foreign
//!   custody converges and hands off — a successor's claim is never touched.
//! - MUTATING retries under a persisted bounded budget with per-run
//!   claim/lease fencing, charge-before-mutate, and 30s-doubling backoff
//!   capped at 8 minutes. Exhaustion stops mutation only; the probe outlives
//!   it and still converges a bead repaired by hand.
//!
//! This is an internal supervisor pass with no operation row: every bd write
//! it can reach is CAS-guarded and idempotent, and `run stop`'s derived key
//! and replay semantics are untouched.

use forged_beads::IssueSummary;
use forged_ledger::{PendingBeadSettlementRow, RunOutcome};
use serde_json::{json, Value};

use crate::config::now_iso;

use super::settlement::{self, Settlement};
use super::supervise::deadline_after;
use super::{on_ledger, run_holder, Ctx, Failure};

const REPORT_SCHEMA: &str = "forged.bead-settlement.report/1";
const CLAIM_LEASE_SECONDS: u64 = 60;
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
    /// Closed but still held by the expected assignee: the one guarded
    /// release is permitted, then the settlement converges.
    ReleaseHeldClosed,
    /// The marker comment decides (`clean`/`accepted-risk` under own or no
    /// custody); the caller must read comments to finish the probe.
    MarkerDecides,
    /// Still unsettled: only a budgeted mutating retry can converge it.
    Retry,
}

/// Custody-only convergence predicates. "Already closed" means closed AND
/// (unassigned OR foreign assignee); closed-but-held permits the one guarded
/// release. Foreign custody converges the release-shaped outcomes — the
/// holder is a successor and this settlement hands off.
fn custody_probe(outcome: RunOutcome, issue: &IssueSummary, expected: &str) -> Probe {
    let holder = issue.assignee.as_deref();
    let unassigned = holder.is_none();
    let foreign = holder.is_some_and(|holder| holder != expected);
    if issue.status == "closed" {
        return if unassigned || foreign {
            Probe::Converged
        } else {
            Probe::ReleaseHeldClosed
        };
    }
    match outcome {
        RunOutcome::Landed => Probe::Retry,
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
            if foreign {
                Probe::Converged
            } else {
                Probe::MarkerDecides
            }
        }
    }
}

/// One supervisor pass over every run whose latest bead-settlement event is
/// still pending. Per-run failures are report entries, never a tick failure.
pub(super) async fn reconcile(ctx: &Ctx) -> Result<Value, Failure> {
    let pending = on_ledger(&ctx.ledger, |ledger| ledger.list_pending_bead_settlements()).await?;
    let mut actions = Vec::new();
    for row in &pending {
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

    let bd = ctx.config.bd_config();
    let issue = match forged_beads::show_issue(&bd, &bead_id).await {
        Ok(issue) => issue,
        Err(error) => {
            // A failed read is not a mutating attempt: no charge, no event.
            let mut report = entry(&run_id, "probe-failed");
            report.insert("error".to_owned(), json!(error.to_string()));
            return Ok(Value::Object(report));
        }
    };
    let decision = match custody_probe(outcome, &issue, &expected) {
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

    // Mutation is owed. Read the standing budget before claiming so an
    // exhausted or backing-off run does not churn the claim every tick.
    let now = now_iso();
    let standing = {
        let run = run_id.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.get_bead_settlement_retry(&run)
        })
        .await?
    };
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
    // Re-check under the fence: another executor may have charged between
    // the standing read and this claim.
    if claimed.used >= claimed.budget
        || claimed
            .next_wake_at
            .as_deref()
            .is_some_and(|wake| wake > now.as_str())
    {
        finish(ctx, &run_id, &token, None).await;
        return Ok(Value::Object(entry(&run_id, "superseded")));
    }

    let attempt = claimed.used + 1;
    let wake = deadline_after(&now, backoff_seconds(claimed.used))?;
    let charged = {
        let run = run_id.clone();
        let charge_token = token.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.charge_bead_settlement_retry(&run, &charge_token, &wake)
        })
        .await?
    };
    crate::failpoint::hit("bead-settlement.charge.after");

    let mutation = match decision {
        Probe::ReleaseHeldClosed => forged_beads::release_issue(&bd, &bead_id, &expected)
            .await
            .map(|_| ())
            .map_err(Failure::from),
        _ => {
            // Rebuild the settlement from the run row; the pending payload
            // contributes only beadId/outcome/expectedAssignee.
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
            settlement::settle_bead(ctx, &run_id, &bead_id, &settlement)
                .await
                .map(|_| ())
        }
    };
    crate::failpoint::hit("bead-settlement.mutate.after");

    match mutation {
        Ok(()) => {
            let appended = {
                let run = run_id.clone();
                let event = settlement::succeeded_payload(&bead_id, outcome);
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_bead_settlement_succeeded_if_pending(&run, event)
                })
                .await?
            };
            finish(ctx, &run_id, &token, None).await;
            let mut report = entry(&run_id, "retried");
            report.insert("attempt".to_owned(), json!(attempt));
            report.insert("settled".to_owned(), json!(true));
            report.insert("appended".to_owned(), json!(appended));
            Ok(Value::Object(report))
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
            if attempt >= charged.budget {
                repended["retriesExhausted"] = json!(true);
                repended["attempts"] = json!(attempt);
            }
            {
                let run = run_id.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_bead_settlement_pending_if_pending(&run, repended)
                })
                .await?;
            }
            finish(ctx, &run_id, &token, Some(error.to_string())).await;
            let mut report = entry(&run_id, "retry-failed");
            report.insert("attempt".to_owned(), json!(attempt));
            report.insert("error".to_owned(), json!(error.to_string()));
            Ok(Value::Object(report))
        }
    }
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
                custody_probe(outcome, &issue("closed", None), EXPECTED),
                Probe::Converged,
                "{outcome:?} closed+unassigned"
            );
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("closed", Some("forged:successor:0")),
                    EXPECTED
                ),
                Probe::Converged,
                "{outcome:?} closed+foreign"
            );
            assert_eq!(
                custody_probe(outcome, &issue("closed", Some(EXPECTED)), EXPECTED),
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
                custody_probe(outcome, &issue("open", None), EXPECTED),
                Probe::Converged,
                "{outcome:?} unassigned"
            );
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some("forged:successor:0")),
                    EXPECTED
                ),
                Probe::Converged,
                "{outcome:?} foreign custody hands off"
            );
            assert_eq!(
                custody_probe(outcome, &issue("in_progress", Some(EXPECTED)), EXPECTED),
                Probe::Retry,
                "{outcome:?} still held by this run"
            );
        }
        assert_eq!(
            custody_probe(
                RunOutcome::Landed,
                &issue("in_progress", Some("forged:successor:0")),
                EXPECTED
            ),
            Probe::Retry,
            "landed promises a close; foreign custody alone is not delivery"
        );
    }

    #[test]
    fn clean_and_accepted_risk_defer_to_the_marker_unless_custody_moved() {
        for outcome in [RunOutcome::Clean, RunOutcome::AcceptedRisk] {
            assert_eq!(
                custody_probe(outcome, &issue("in_progress", Some(EXPECTED)), EXPECTED),
                Probe::MarkerDecides
            );
            assert_eq!(
                custody_probe(outcome, &issue("open", None), EXPECTED),
                Probe::MarkerDecides
            );
            assert_eq!(
                custody_probe(
                    outcome,
                    &issue("in_progress", Some("forged:successor:0")),
                    EXPECTED
                ),
                Probe::Converged
            );
        }
    }
}
