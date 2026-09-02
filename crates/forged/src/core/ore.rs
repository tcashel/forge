//! Decoupled waveless epic frontier reconciliation.
//!
//! The pass owns loop-mode epic desired rows through their ordinary claim
//! lease. It never reserves capacity or charges restart budget for the epic;
//! every dispatched run becomes an independently admitted supervisor subject.

use forged_ledger::{
    DesiredReconcileOutcome, DesiredReconcileUpdate, DesiredState, DesiredSubjectKind,
    DesiredWorkRow,
};
use forged_types::ErrorCode;
use serde_json::{json, Value};

use crate::config::now_iso;
use crate::core::{on_ledger, Ctx, Failure};

use super::epic::ReconcileAction;

const REPORT_SCHEMA: &str = "forged.ore-pass.report/1";
const CLAIM_LEASE_SECONDS: u64 = 60;
const CADENCE_SECONDS: u64 = 5;

fn cadence() -> Result<String, Failure> {
    super::supervise::deadline_after(&now_iso(), CADENCE_SECONDS)
}

async fn finish(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
    update: DesiredReconcileUpdate,
) -> Result<Value, Failure> {
    let id = row.subject_id.clone();
    let token = token.to_owned();
    let result = on_ledger(&ctx.ledger, move |ledger| {
        ledger.finish_desired_reconciliation(DesiredSubjectKind::Epic, &id, &token, update)
    })
    .await;
    match result {
        Ok(row) => Ok(json!({
            "subject": {"kind": "epic", "id": row.subject_id},
            "desiredState": row.desired_state.as_str(),
            "outcome": row.last_outcome.map(DesiredReconcileOutcome::as_str),
            "nextWakeAt": row.next_wake_at,
        })),
        Err(error) if error.recoverable && error.code == ErrorCode::OperationInProgress => {
            let id = row.subject_id.clone();
            let current = on_ledger(&ctx.ledger, move |ledger| {
                ledger.get_desired_work(DesiredSubjectKind::Epic, &id)
            })
            .await?;
            Ok(json!({
                "subject": {"kind": "epic", "id": row.subject_id},
                "superseded": true,
                "desiredState": current.as_ref().map(|row| row.desired_state.as_str()),
                "outcome": current.and_then(|row| row.last_outcome.map(DesiredReconcileOutcome::as_str)),
            }))
        }
        Err(error) => Err(error),
    }
}

fn active_update(row: &DesiredWorkRow) -> Result<DesiredReconcileUpdate, Failure> {
    Ok(DesiredReconcileUpdate {
        desired_state: None,
        outcome: DesiredReconcileOutcome::Authorized,
        controller_generation: None,
        predecessor_generation: row.predecessor_generation,
        next_wake_at: Some(cadence()?),
        last_progress_at: Some(now_iso()),
        last_error: None,
        attention_condition: None,
    })
}

fn stop_update(row: &DesiredWorkRow, value: &Value) -> Result<DesiredReconcileUpdate, Failure> {
    if value.get("paused").is_some() {
        return Ok(DesiredReconcileUpdate {
            desired_state: Some(DesiredState::Paused),
            outcome: DesiredReconcileOutcome::Paused,
            controller_generation: None,
            predecessor_generation: row.predecessor_generation,
            next_wake_at: None,
            last_progress_at: Some(now_iso()),
            last_error: None,
            attention_condition: None,
        });
    }
    if value.get("finalPr").is_some() {
        return Ok(DesiredReconcileUpdate {
            desired_state: Some(DesiredState::Stopped),
            outcome: DesiredReconcileOutcome::Terminal,
            controller_generation: None,
            predecessor_generation: row.predecessor_generation,
            next_wake_at: None,
            last_progress_at: Some(now_iso()),
            last_error: None,
            attention_condition: None,
        });
    }
    Ok(DesiredReconcileUpdate {
        desired_state: None,
        outcome: DesiredReconcileOutcome::Attention,
        controller_generation: None,
        predecessor_generation: row.predecessor_generation,
        next_wake_at: None,
        last_progress_at: Some(now_iso()),
        last_error: Some("epic requires explicit input resolution".to_owned()),
        attention_condition: Some("input-required".to_owned()),
    })
}

async fn reconcile_claimed(
    ctx: &Ctx,
    row: DesiredWorkRow,
    token: String,
) -> Result<Value, Failure> {
    match super::epic::reconcile_once(ctx, &row.subject_id).await {
        Ok(ReconcileAction::Progress(value)) => {
            let desired = finish(ctx, &row, &token, active_update(&row)?).await?;
            Ok(
                json!({"action": "progress", "epicId": row.subject_id, "result": value, "desiredWork": desired}),
            )
        }
        Ok(ReconcileAction::Wait(value)) => {
            let desired = finish(ctx, &row, &token, active_update(&row)?).await?;
            Ok(
                json!({"action": "waiting", "epicId": row.subject_id, "result": value, "desiredWork": desired}),
            )
        }
        Ok(ReconcileAction::Stop(value)) => {
            let desired = finish(ctx, &row, &token, stop_update(&row, &value)?).await?;
            Ok(
                json!({"action": "stopped", "epicId": row.subject_id, "result": value, "desiredWork": desired}),
            )
        }
        Err(error) => {
            let update = DesiredReconcileUpdate {
                desired_state: None,
                outcome: DesiredReconcileOutcome::Backoff,
                controller_generation: None,
                predecessor_generation: row.predecessor_generation,
                next_wake_at: Some(cadence()?),
                last_progress_at: None,
                last_error: Some(error.to_string()),
                attention_condition: None,
            };
            let desired = finish(ctx, &row, &token, update).await?;
            Ok(
                json!({"action": "backoff", "epicId": row.subject_id, "error": error.to_string(), "desiredWork": desired}),
            )
        }
    }
}

/// Claim and reconcile each due epic exactly once, sequentially.
pub(super) async fn reconcile(ctx: &Ctx) -> Result<Value, Failure> {
    let started_at = now_iso();
    let due = {
        let now = started_at.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.list_due_desired_work(&now)
        })
        .await?
    };
    let pass_id = uuid::Uuid::now_v7().to_string();
    let mut subjects = Vec::new();
    let mut contended = 0u64;
    for candidate in due
        .into_iter()
        .filter(|row| row.subject_kind == DesiredSubjectKind::Epic)
    {
        let token = format!("ore:{pass_id}:{}", uuid::Uuid::now_v7());
        let now = now_iso();
        let lease = super::supervise::deadline_after(&now, CLAIM_LEASE_SECONDS)?;
        let id = candidate.subject_id.clone();
        let claim_token = token.clone();
        let claimed = on_ledger(&ctx.ledger, move |ledger| {
            ledger.claim_desired_work(DesiredSubjectKind::Epic, &id, &claim_token, &now, &lease)
        })
        .await?;
        match claimed {
            Some(row) => subjects.push(reconcile_claimed(ctx, row, token).await?),
            None => contended = contended.saturating_add(1),
        }
    }
    Ok(json!({
        "schema": REPORT_SCHEMA,
        "startedAt": started_at,
        "finishedAt": now_iso(),
        "considered": subjects.len() + usize::try_from(contended).unwrap_or(usize::MAX),
        "contended": contended,
        "subjects": subjects,
    }))
}
