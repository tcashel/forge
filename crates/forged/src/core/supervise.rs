//! Deterministic reconciliation of operator-authorized desired work.
//!
//! The long-running mode is only a scheduler around [`tick`]. Every effect,
//! budget decision, and singleton fence is persisted by the same tick used
//! by `forged supervise --once`; no transaction is held while sleeping.

use std::path::PathBuf;
use std::time::Duration;

use forged_ledger::{
    AdmissionReservationRow, DesiredReconcileOutcome, DesiredReconcileUpdate,
    DesiredRestartReservation, DesiredState, DesiredSubjectKind, DesiredWorkRow, RunState,
};
use forged_types::{AdmissionOutcome, ErrorCode, OperationRequest, OperationResponse};
use serde_json::{json, Value};

use crate::config::{now_iso, HostPolicy};
use crate::core::{derive_key, err_response, ok_response, on_ledger, Ctx, Failure};

use super::handoff::{self, Scope};

const REPORT_SCHEMA: &str = "forged.supervise.report/1";
const LOOP_SCHEMA: &str = "forged.supervise.session/1";
const POLL_SECONDS: u64 = 5;
const CLAIM_LEASE_SECONDS: u64 = 60;
const MAX_BACKOFF_SECONDS: u64 = 300;
const PROJECTION_PASS_BUDGET: Duration = Duration::from_secs(5);

struct ProjectionPassTask {
    handle: Option<tokio::task::JoinHandle<Value>>,
}

impl ProjectionPassTask {
    fn start(ctx: &Ctx) -> Self {
        let projection_ctx = Ctx {
            config: ctx.config.clone(),
            ledger: ctx.ledger.clone(),
        };
        let handle = tokio::spawn(async move {
            match tokio::time::timeout(
                PROJECTION_PASS_BUDGET,
                super::herdr_projection::reconcile(&projection_ctx),
            )
            .await
            {
                Ok(report) => report,
                Err(_) => json!({
                    "schema": "forged.herdr-projection.report/1",
                    "effects": [],
                    "timedOut": true,
                    "budgetSeconds": PROJECTION_PASS_BUDGET.as_secs(),
                }),
            }
        });
        Self {
            handle: Some(handle),
        }
    }

    async fn finish(mut self) -> Value {
        let handle = self.handle.take().expect("projection task handle");
        match handle.await {
            Ok(report) => report,
            Err(error) => json!({
                "schema": "forged.herdr-projection.report/1",
                "effects": [],
                "error": format!("projection task failed: {error}"),
            }),
        }
    }
}

impl Drop for ProjectionPassTask {
    fn drop(&mut self) {
        if let Some(handle) = self.handle.take() {
            handle.abort();
        }
    }
}

/// The bead settlement pass slot, owned by the supervise session ACROSS
/// ticks. Its per-run probes and guarded writes are bounded only by bd's
/// own timeouts, so it must never sit in front of due-work claiming and
/// admission: a wedged bd — the exact condition that creates pending
/// settlements — delays only settlement work, never packet admission, on
/// this tick or the next. The tick spawns a new pass only when the previous
/// pass's handle has finished (a non-blocking poll) and NEVER awaits a
/// running one; the tick report carries the last COMPLETED pass's report.
/// `supervise --once` joins the pass fully, so single-tick runs stay
/// deterministic; a pass failure is folded into the report it carries,
/// never propagated — supervision and admission outlive any settlement
/// wedge.
/// An abort on drop is equivalent to a crash: the persisted charge and
/// claim lease are the recovery evidence.
pub(super) struct BeadSettlementPass {
    handle: Option<tokio::task::JoinHandle<Result<Value, Failure>>>,
    last_report: Value,
}

impl BeadSettlementPass {
    pub(super) fn new() -> Self {
        Self {
            handle: None,
            last_report: Value::Null,
        }
    }

    /// Harvest a FINISHED pass without blocking, then spawn a new one when
    /// idle. A pass still running is left alone: no second pass spawns
    /// while one runs, and the tick never waits.
    async fn poll(&mut self, ctx: &Ctx) {
        if self
            .handle
            .as_ref()
            .is_some_and(tokio::task::JoinHandle::is_finished)
        {
            self.harvest().await;
        }
        if self.handle.is_none() {
            let pass_ctx = Ctx {
                config: ctx.config.clone(),
                ledger: ctx.ledger.clone(),
            };
            self.handle = Some(tokio::spawn(async move {
                super::bead_settlement::reconcile(&pass_ctx).await
            }));
        }
    }

    /// Join the current pass to completion — the `--once` determinism seam.
    async fn join(&mut self) {
        self.harvest().await;
    }

    /// Fold the finished pass into the report — NEVER a propagated error.
    /// A pass failure or panic is a per-pass fact the next tick's report
    /// carries; propagating it would let a settlement wedge skip due-work
    /// claiming or terminate long-running supervision, the exact coupling
    /// the decoupled pass exists to prevent.
    async fn harvest(&mut self) {
        let Some(handle) = self.handle.take() else {
            return;
        };
        self.last_report = match handle.await {
            Ok(Ok(report)) => report,
            Ok(Err(failure)) => json!({
                "schema": "forged.bead-settlement.report/1",
                "error": failure.to_string(),
            }),
            Err(error) => json!({
                "schema": "forged.bead-settlement.report/1",
                "error": format!("bead settlement task failed: {error}"),
            }),
        };
    }

    fn report(&self) -> Value {
        self.last_report.clone()
    }
}

impl Drop for BeadSettlementPass {
    fn drop(&mut self) {
        if let Some(handle) = self.handle.take() {
            handle.abort();
        }
    }
}

fn scope(kind: DesiredSubjectKind) -> Scope {
    match kind {
        DesiredSubjectKind::Run => Scope::Run,
        DesiredSubjectKind::Epic => Scope::Epic,
    }
}

pub(super) fn deadline_after(anchor: &str, seconds: u64) -> Result<String, Failure> {
    let timestamp: jiff::Timestamp = anchor.parse().map_err(|error| {
        Failure::internal(format!(
            "cannot parse supervisor timestamp {anchor:?}: {error}"
        ))
    })?;
    let nanos = i128::from(seconds).saturating_mul(1_000_000_000);
    let deadline = jiff::Timestamp::from_nanosecond(
        timestamp.as_nanosecond().saturating_add(nanos),
    )
    .map_err(|error| Failure::internal(format!("supervisor deadline out of range: {error}")))?;
    Ok(forged_proto::widen_rfc3339(&deadline.to_string()))
}

fn row_json(row: &DesiredWorkRow) -> Value {
    json!({
        "subject": {"kind": row.subject_kind.as_str(), "id": row.subject_id},
        "desiredState": row.desired_state.as_str(),
        "controlRevision": row.control_revision,
        "controllerGeneration": row.controller_generation,
        "predecessorGeneration": row.predecessor_generation,
        "restartBudget": row.restart_budget,
        "restartUsed": row.restart_used,
        "nextWakeAt": row.next_wake_at,
        "lastProgressAt": row.last_progress_at,
        "lastOutcome": row.last_outcome.map(DesiredReconcileOutcome::as_str),
        "lastError": row.last_error,
        "exhaustedAt": row.exhausted_at,
    })
}

async fn finish(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
    update: DesiredReconcileUpdate,
) -> Result<DesiredWorkRow, Failure> {
    let kind = row.subject_kind;
    let id = row.subject_id.clone();
    let token = token.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.finish_desired_reconciliation(kind, &id, &token, update)
    })
    .await
}

async fn finish_action(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
    action: &str,
    update: DesiredReconcileUpdate,
) -> Result<Value, Failure> {
    match finish(ctx, row, token, update).await {
        Ok(row) => Ok(json!({"action": action, "desiredWork": row_json(&row)})),
        Err(error) if error.recoverable && error.code == ErrorCode::OperationInProgress => {
            // Foreground controllers and explicit control operations may
            // advance desired state while this tick is observing the
            // subject. Losing the exact reconciliation token is therefore a
            // successful ownership handoff, not a failed supervisor pass.
            // Only the guarded finish call is absorbed here; every other
            // failure keeps its ordinary hard-error path.
            let kind = row.subject_kind;
            let id = row.subject_id.clone();
            let current = on_ledger(&ctx.ledger, move |ledger| {
                ledger.get_desired_work(kind, &id)
            })
            .await?;
            match current {
                Some(current) => Ok(json!({
                    "action": "superseded",
                    "detail": error.message,
                    "desiredWork": row_json(&current),
                })),
                None => Err(error),
            }
        }
        Err(error) => Err(error),
    }
}

async fn finish_attention(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
    detail: String,
) -> Result<Value, Failure> {
    finish_attention_condition(ctx, row, token, "controller-dead", detail).await
}

async fn finish_attention_condition(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
    condition: &str,
    detail: String,
) -> Result<Value, Failure> {
    finish_action(
        ctx,
        row,
        token,
        "attention",
        DesiredReconcileUpdate {
            desired_state: None,
            outcome: DesiredReconcileOutcome::Attention,
            controller_generation: None,
            predecessor_generation: row.predecessor_generation,
            next_wake_at: None,
            last_progress_at: None,
            last_error: Some(detail),
            attention_condition: Some(condition.to_owned()),
        },
    )
    .await
}

async fn finish_retryable(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
    detail: String,
) -> Result<Value, Failure> {
    let now = now_iso();
    finish_action(
        ctx,
        row,
        token,
        "backoff",
        DesiredReconcileUpdate {
            desired_state: None,
            outcome: DesiredReconcileOutcome::Backoff,
            controller_generation: None,
            predecessor_generation: row.predecessor_generation,
            next_wake_at: Some(deadline_after(&now, POLL_SECONDS)?),
            last_progress_at: None,
            last_error: Some(detail),
            attention_condition: None,
        },
    )
    .await
}

async fn last_progress(ctx: &Ctx, id: &str) -> Result<Option<String>, Failure> {
    Ok(handoff::events(ctx, id)
        .await?
        .last()
        .map(|event| event.ts.clone()))
}

/// Return a durable stop action before controller observation. Input-required
/// parks an authorized epic but deliberately keeps desired state `running`:
/// `epic resume` makes it due again, and the unresolved input still prevents
/// a spawn until `epic resolve` actually clears it.
async fn settle_landed_reality(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
) -> Result<Option<Value>, Failure> {
    match row.subject_kind {
        DesiredSubjectKind::Run => {
            let id = row.subject_id.clone();
            let run = on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&id)).await?;
            if run.state == RunState::Stopped {
                return finish_action(
                    ctx,
                    row,
                    token,
                    "terminal",
                    DesiredReconcileUpdate {
                        desired_state: Some(DesiredState::Stopped),
                        outcome: DesiredReconcileOutcome::Terminal,
                        controller_generation: None,
                        predecessor_generation: row.predecessor_generation,
                        next_wake_at: None,
                        last_progress_at: Some(run.updated_at),
                        last_error: None,
                        attention_condition: None,
                    },
                )
                .await
                .map(Some);
            }
        }
        DesiredSubjectKind::Epic => {
            if let Some(stop) = super::epic::epic_submission_stop(ctx, &row.subject_id).await? {
                if stop.get("finalPr").is_some() {
                    return finish_action(
                        ctx,
                        row,
                        token,
                        "terminal",
                        DesiredReconcileUpdate {
                            desired_state: Some(DesiredState::Stopped),
                            outcome: DesiredReconcileOutcome::Terminal,
                            controller_generation: None,
                            predecessor_generation: row.predecessor_generation,
                            next_wake_at: None,
                            last_progress_at: last_progress(ctx, &row.subject_id).await?,
                            last_error: None,
                            attention_condition: None,
                        },
                    )
                    .await
                    .map(Some);
                }
                if stop.get("paused").is_some() {
                    return finish_action(
                        ctx,
                        row,
                        token,
                        "paused",
                        DesiredReconcileUpdate {
                            desired_state: Some(DesiredState::Paused),
                            outcome: DesiredReconcileOutcome::Paused,
                            controller_generation: None,
                            predecessor_generation: row.predecessor_generation,
                            next_wake_at: None,
                            last_progress_at: last_progress(ctx, &row.subject_id).await?,
                            last_error: None,
                            attention_condition: None,
                        },
                    )
                    .await
                    .map(Some);
                }
                if stop.get("inputRequired").is_some() {
                    return finish_attention_condition(
                        ctx,
                        row,
                        token,
                        "input-required",
                        format!(
                            "epic {} still requires explicit input resolution",
                            row.subject_id
                        ),
                    )
                    .await
                    .map(Some);
                }
            }
        }
    }
    Ok(None)
}

async fn subject_runtime(
    ctx: &Ctx,
    row: &DesiredWorkRow,
) -> Result<(String, HostPolicy, Option<PathBuf>), Failure> {
    match row.subject_kind {
        DesiredSubjectKind::Run => {
            let id = row.subject_id.clone();
            let run = on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&id)).await?;
            let view = super::drive::project(ctx, &row.subject_id).await?;
            Ok((run.repo, view.policy.host_policy, view.policy.herdr_socket))
        }
        DesiredSubjectKind::Epic => {
            let repo = super::epic::epic_repo(ctx, &row.subject_id).await?;
            let (policy, socket) = super::epic::epic_host_policy(ctx, &row.subject_id).await?;
            Ok((repo, policy, socket))
        }
    }
}

/// Persist the next supervisor observation no later than any provider
/// deadline the run controller may be parking on. `desired_work.next_wake_at`
/// remains the crash-recovery timer; the controller's local wait is only an
/// accelerator while that exact process stays alive.
async fn subject_observation_wake(ctx: &Ctx, row: &DesiredWorkRow) -> Result<String, Failure> {
    let now = now_iso();
    let mut wake = deadline_after(&now, POLL_SECONDS)?;
    if row.subject_kind != DesiredSubjectKind::Run {
        return Ok(wake);
    }
    let view = super::drive::project(ctx, &row.subject_id).await?;
    if let Some(shortest_budget) = view.policy.stage_budget_s.values().copied().min() {
        wake = wake.min(deadline_after(&now, shortest_budget)?);
    }
    for attempt in &view.live_attempts {
        let stage = view
            .packets
            .iter()
            .find(|packet| packet.packet_id == attempt.packet_id)
            .map(|packet| packet.stage)
            .ok_or_else(|| Failure::internal("live attempt has no stored packet"))?;
        let budget_s = view
            .policy
            .stage_budget_s
            .get(&stage)
            .copied()
            .ok_or_else(|| Failure::internal("frozen policy has no stage budget"))?;
        let deadline = forged_proto::stage_deadline_at(&attempt.started_at, budget_s)
            .map_err(|error| Failure::internal(error.to_string()))?;
        wake = wake.min(deadline);
    }
    Ok(wake)
}

/// Adoption is observation, not a new capacity effect. Check an already-live
/// exact controller before asking admission policy for a replacement slot;
/// otherwise its own active provider attempt can fill repository capacity and
/// make the supervisor defer forever instead of adopting it.
async fn reconcile_live_before_admission(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
) -> Result<Option<Value>, Failure> {
    let quick_record = handoff::latest_record(ctx, &row.subject_id).await?;
    let quick_status = match quick_record.as_ref() {
        Some(record) => handoff::status_for(record).await,
        None => Value::Null,
    };
    if !handoff::is_active(&quick_status) {
        return Ok(None);
    }

    if let Some(stop) = settle_landed_reality(ctx, row, token).await? {
        return Ok(Some(stop));
    }
    crate::failpoint::hit("supervisor.stop-check.after");

    let subject_scope = scope(row.subject_kind);
    let _submit_guard = handoff::acquire_submit(ctx, &row.subject_id, subject_scope).await?;
    let kind = row.subject_kind;
    let id = row.subject_id.clone();
    let lookup_id = id.clone();
    let current = on_ledger(&ctx.ledger, move |ledger| {
        ledger.get_desired_work(kind, &lookup_id)
    })
    .await?;
    let Some(row) = current else {
        return Ok(Some(json!({
            "action": "superseded",
            "subject": {"kind": kind.as_str(), "id": id},
            "detail": "desired authorization was removed while waiting for the submit fence",
        })));
    };
    if row.reconcile_token.as_deref() != Some(token) {
        return Ok(Some(json!({
            "action": "superseded",
            "desiredWork": row_json(&row),
        })));
    }

    let record = handoff::latest_record(ctx, &row.subject_id).await?;
    if let Some(value) = record.as_ref() {
        crate::runtime::complete_recovered_controller_admission(
            &ctx.config,
            &row.subject_id,
            handoff::generation(value),
        )?;
    }
    let status = match record.as_ref() {
        Some(record) => handoff::status_for(record).await,
        None => Value::Null,
    };
    if !handoff::is_active(&status) {
        return Ok(None);
    }
    crate::failpoint::hit("supervisor.observe.after");

    let generation = handoff::generation(&status);
    if generation != row.controller_generation {
        return finish_attention(
            ctx,
            &row,
            token,
            format!(
                "live controller generation {generation} does not match desired generation {}",
                row.controller_generation
            ),
        )
        .await
        .map(Some);
    }
    let progress = last_progress(ctx, &row.subject_id).await?;
    let report = finish_action(
        ctx,
        &row,
        token,
        "adopted",
        DesiredReconcileUpdate {
            desired_state: None,
            outcome: DesiredReconcileOutcome::Adopted,
            controller_generation: Some(generation),
            predecessor_generation: row.predecessor_generation,
            next_wake_at: Some(subject_observation_wake(ctx, &row).await?),
            last_progress_at: progress,
            last_error: None,
            attention_condition: None,
        },
    )
    .await?;
    Ok(Some(report))
}

async fn reconcile_claimed(
    ctx: &Ctx,
    row: DesiredWorkRow,
    token: String,
    admission_reservation: AdmissionReservationRow,
) -> Result<Value, Failure> {
    if let Some(stop) = settle_landed_reality(ctx, &row, &token).await? {
        let reservation_id = admission_reservation.reservation_id;
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.release_admission_reservation(&reservation_id, Some("subject settled"))?;
            Ok(())
        })
        .await?;
        return Ok(stop);
    }
    crate::failpoint::hit("supervisor.stop-check.after");

    // Serialize with manual submit and terminal run settlement. A control
    // transition may clear our token while we wait; the reservation write
    // below re-checks it before any spawn.
    let subject_scope = scope(row.subject_kind);
    let _submit_guard = handoff::acquire_submit(ctx, &row.subject_id, subject_scope).await?;
    let kind = row.subject_kind;
    let id = row.subject_id.clone();
    let lookup_id = id.clone();
    let current = on_ledger(&ctx.ledger, move |ledger| {
        ledger.get_desired_work(kind, &lookup_id)
    })
    .await?;
    let Some(row) = current else {
        return Ok(json!({
            "action": "superseded",
            "subject": {"kind": kind.as_str(), "id": id},
            "detail": "desired authorization was removed while waiting for the submit fence",
        }));
    };
    if row.reconcile_token.as_deref() != Some(token.as_str()) {
        return Ok(json!({
            "action": "superseded",
            "desiredWork": row_json(&row),
        }));
    }

    // A newly committed reservation is deliberately ownerless until this
    // tick transfers it to a concrete controller generation. An older owned
    // reservation is recovery authority only for its exact durable identity;
    // malformed or mismatched ownership is never permission to spawn.
    let recovery_generation = match (
        admission_reservation.owner_kind.as_deref(),
        admission_reservation.owner_id.as_deref(),
    ) {
        (None, None) => None,
        (Some("controller"), Some(owner)) => {
            let Some((owner_scope, owner_id, generation)) =
                handoff::admission_controller_owner(owner)
            else {
                return finish_attention(
                    ctx,
                    &row,
                    &token,
                    "admission reservation has malformed controller identity".to_owned(),
                )
                .await;
            };
            if owner_scope != subject_scope.noun()
                || owner_id != row.subject_id
                || generation != row.controller_generation
            {
                return finish_attention(
                    ctx,
                    &row,
                    &token,
                    "admission reservation does not match the desired controller generation"
                        .to_owned(),
                )
                .await;
            }
            Some(generation)
        }
        _ => {
            return finish_attention(
                ctx,
                &row,
                &token,
                "admission reservation has an unverifiable effect owner".to_owned(),
            )
            .await;
        }
    };

    let mut record = handoff::latest_record(ctx, &row.subject_id).await?;
    if let Some(value) = record.as_ref() {
        let generation = handoff::generation(value);
        // A predecessor record may coexist with a newer unresolved spawn.
        // Leave that admission intact for `recover_reserved_record`; trying
        // to complete it against the stale generation would prevent the
        // exact PID/lstart recovery path from ever running.
        if generation == row.controller_generation {
            crate::runtime::complete_recovered_controller_admission(
                &ctx.config,
                &row.subject_id,
                generation,
            )?;
        }
    }
    let recorded_generation = record.as_ref().map(handoff::generation).unwrap_or(0);
    let recovery_target = recovery_generation.unwrap_or(row.controller_generation);
    if recovery_target > recorded_generation {
        record = match handoff::recover_reserved_record(
            ctx,
            &row.subject_id,
            subject_scope,
            recovery_target,
        )
        .await
        {
            Ok(record) => record,
            Err(error) => {
                return finish_attention(ctx, &row, &token, error.to_string()).await;
            }
        };
    }
    let owned_without_record = if record.is_none() {
        handoff::owned_controller_for_generation(
            ctx,
            &row.subject_id,
            subject_scope,
            recovery_target,
        )
        .await?
    } else {
        None
    };
    if owned_without_record
        .as_ref()
        .is_some_and(|owned| owned.cleanup_state != forged_ledger::OwnedHerdrCleanupState::Released)
    {
        return finish_attention(
            ctx,
            &row,
            &token,
            format!(
                "{} {} generation {recovery_target} owns a durable Herdr pane but has no verifiable controller identity; no replacement was spawned",
                subject_scope.noun(),
                row.subject_id
            ),
        )
        .await;
    }
    let status = match record.as_ref() {
        Some(record) => handoff::status_for(record).await,
        None => Value::Null,
    };
    crate::failpoint::hit("supervisor.observe.after");

    if handoff::is_active(&status) {
        let generation = handoff::generation(&status);
        if generation != row.controller_generation {
            return finish_attention(
                ctx,
                &row,
                &token,
                format!(
                    "live controller generation {generation} does not match desired generation {}",
                    row.controller_generation
                ),
            )
            .await;
        }
        let progress = last_progress(ctx, &row.subject_id).await?;
        let report = finish_action(
            ctx,
            &row,
            &token,
            "adopted",
            DesiredReconcileUpdate {
                desired_state: None,
                outcome: DesiredReconcileOutcome::Adopted,
                controller_generation: Some(generation),
                predecessor_generation: row.predecessor_generation,
                next_wake_at: Some(subject_observation_wake(ctx, &row).await?),
                last_progress_at: progress,
                last_error: None,
                attention_condition: None,
            },
        )
        .await?;
        let reservation_id = admission_reservation.reservation_id;
        on_ledger(&ctx.ledger, move |ledger| {
            ledger
                .release_admission_reservation(&reservation_id, Some("live controller adopted"))?;
            Ok(())
        })
        .await?;
        return Ok(report);
    }
    if handoff::is_unknown(&status) {
        return finish_attention(
            ctx,
            &row,
            &token,
            format!(
                "{} {} controller identity is unverifiable; no replacement was spawned",
                subject_scope.noun(),
                row.subject_id
            ),
        )
        .await;
    }

    let observed_generation = record
        .as_ref()
        .map(handoff::generation)
        .or_else(|| {
            owned_without_record
                .as_ref()
                .and_then(|owned| owned.controller_generation)
        })
        .unwrap_or(0);
    if record.is_some() {
        let target = match handoff::controller_fence_target(ctx, &row.subject_id).await {
            Ok(target) => target,
            Err(error) => return finish_attention(ctx, &row, &token, error.to_string()).await,
        };
        if let Some(target) = target {
            // `false` is the ordinary already-dead result. Any surviving
            // group without the recorded leader identity refuses closed.
            if let Err(error) = handoff::kill_controller_confirmed(&target).await {
                return finish_attention(ctx, &row, &token, error.to_string()).await;
            }
        }
    }
    handoff::recover_abandoned(ctx, &row.subject_id, subject_scope, observed_generation).await?;
    crate::failpoint::hit("supervisor.recover.after");

    if recovery_generation.is_some() {
        // The exact owned effect is confirmed absent. Its old decision is no
        // longer launch authority: release capacity and make the subject due
        // so the next tick re-reads current Beads and policy before spawning.
        let reservation_id = admission_reservation.reservation_id;
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.release_admission_reservation(
                &reservation_id,
                Some("owned controller confirmed absent; fresh admission required"),
            )?;
            Ok(())
        })
        .await?;
        return finish_action(
            ctx,
            &row,
            &token,
            "re-admit",
            DesiredReconcileUpdate {
                desired_state: None,
                outcome: DesiredReconcileOutcome::Backoff,
                controller_generation: None,
                predecessor_generation: Some(observed_generation),
                next_wake_at: Some(now_iso()),
                last_progress_at: None,
                last_error: Some(
                    "controller absence confirmed; current admission inputs must be re-evaluated"
                        .to_owned(),
                ),
                attention_condition: None,
            },
        )
        .await;
    }

    // A death whose own terminal record says `recoverable: false` is
    // deterministic configuration/setup truth, not a liveness blip: a
    // restart replays it byte-for-byte. Halt after this first death — no
    // budget charge, no respawn — and surface the recorded failure with the
    // typed resubmit recovery. Only a terminal matching the exact dead
    // generation gates; a generation-less or stale marker never halts.
    let terminal = latest_controller_terminal(ctx, &row.subject_id)
        .await?
        .filter(|terminal| {
            observed_generation > 0 && terminal.generation == Some(observed_generation)
        });
    if let Some(terminal) = terminal.as_ref() {
        if !terminal.recoverable {
            return finish_action(
                ctx,
                &row,
                &token,
                "halted",
                DesiredReconcileUpdate {
                    desired_state: None,
                    outcome: DesiredReconcileOutcome::Exhausted,
                    controller_generation: None,
                    predecessor_generation: Some(observed_generation),
                    next_wake_at: None,
                    last_progress_at: None,
                    last_error: Some(format!(
                        "halted after one nonrecoverable controller failure: {}",
                        terminal.message
                    )),
                    attention_condition: Some("restart-budget-exhausted".to_owned()),
                },
            )
            .await;
        }
    }

    let kind = row.subject_kind;
    let id = row.subject_id.clone();
    let reserve_token = token.clone();
    let restart_reservation = on_ledger(&ctx.ledger, move |ledger| {
        ledger.reserve_desired_restart(kind, &id, &reserve_token, observed_generation)
    })
    .await?;
    let reserved = match restart_reservation {
        DesiredRestartReservation::Exhausted(exhausted) => {
            return Ok(json!({
                "action": "exhausted",
                "desiredWork": row_json(&exhausted),
            }))
        }
        DesiredRestartReservation::Reserved(reserved) => reserved,
    };
    crate::failpoint::hit("supervisor.restart.reserved.after");

    let (repo, host_policy, herdr_socket) = match subject_runtime(ctx, &reserved).await {
        Ok(runtime) => runtime,
        Err(error) => {
            return finish_spawn_failure(ctx, &reserved, &token, error.to_string()).await;
        }
    };
    let generation = reserved.controller_generation;
    let predecessor = reserved.predecessor_generation;
    let reservation_id = admission_reservation.reservation_id.clone();
    let owner_id = format!(
        "{}:{}:{generation}",
        subject_scope.noun(),
        reserved.subject_id
    );
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.activate_admission_reservation(&reservation_id, "controller", &owner_id)?;
        Ok(())
    })
    .await?;
    crate::failpoint::hit("admission.reservation.transfer.after");
    match handoff::spawn(
        ctx,
        &reserved.subject_id,
        &repo,
        subject_scope,
        generation,
        host_policy,
        herdr_socket,
    )
    .await
    {
        Ok(controller) => {
            crate::failpoint::hit("supervisor.spawn.after");
            // The post-restart wake backs off exponentially with the budget
            // already spent, mirroring the spawn-failure schedule: a
            // controller dying at boot must not be re-observed — and so
            // re-restarted — at the flat poll cadence (six generations in 43
            // seconds was the incident shape). The just-spawned controller
            // holds no live attempts, so no stage deadline is outwaited, and
            // an adoption on the next wake returns to the flat cadence.
            let backoff = POLL_SECONDS
                .saturating_mul(2u64.saturating_pow(reserved.restart_used.saturating_sub(1)))
                .min(MAX_BACKOFF_SECONDS);
            let reconciled = finish(
                ctx,
                &reserved,
                &token,
                DesiredReconcileUpdate {
                    desired_state: None,
                    outcome: DesiredReconcileOutcome::Restarted,
                    controller_generation: Some(generation),
                    predecessor_generation: predecessor,
                    next_wake_at: Some(deadline_after(&now_iso(), backoff)?),
                    last_progress_at: last_progress(ctx, &reserved.subject_id).await?,
                    // The dead generation's recorded failure rides through
                    // the restart so exhaustion still names it.
                    last_error: terminal.as_ref().map(|terminal| {
                        format!("restarted after controller failure: {}", terminal.message)
                    }),
                    attention_condition: None,
                },
            )
            .await?;
            crate::failpoint::hit("supervisor.reconcile.after");
            let reservation_id = admission_reservation.reservation_id;
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.release_admission_reservation(
                    &reservation_id,
                    Some("controller identity persisted"),
                )?;
                Ok(())
            })
            .await?;
            Ok(json!({
                "action": "restarted",
                "predecessorGeneration": predecessor,
                "controller": controller,
                "desiredWork": row_json(&reconciled),
            }))
        }
        Err(error) => finish_spawn_failure(ctx, &reserved, &token, error.to_string()).await,
    }
}

/// A drive loop's recorded terminal failure, parsed fail-open: a malformed
/// or generation-less marker must never halt supervision, so absence and
/// unparseable payloads read as "recoverable, unknown generation".
struct ControllerTerminal {
    generation: Option<u32>,
    message: String,
    recoverable: bool,
}

async fn latest_controller_terminal(
    ctx: &Ctx,
    subject_id: &str,
) -> Result<Option<ControllerTerminal>, Failure> {
    let id = subject_id.to_owned();
    let row = on_ledger(&ctx.ledger, move |ledger| {
        ledger.latest_event_of_kind(&id, handoff::CONTROLLER_TERMINAL_EVENT)
    })
    .await?;
    Ok(row.and_then(|row| {
        let payload: Value = serde_json::from_str(&row.payload_json).ok()?;
        Some(ControllerTerminal {
            generation: payload
                .get("generation")
                .and_then(Value::as_u64)
                .and_then(|value| u32::try_from(value).ok()),
            message: payload
                .get("message")
                .and_then(Value::as_str)
                .unwrap_or("controller terminal failure")
                .to_owned(),
            recoverable: payload
                .get("recoverable")
                .and_then(Value::as_bool)
                .unwrap_or(true),
        })
    }))
}

async fn finish_spawn_failure(
    ctx: &Ctx,
    row: &DesiredWorkRow,
    token: &str,
    detail: String,
) -> Result<Value, Failure> {
    let exhausted = row.restart_used >= row.restart_budget;
    let seconds = POLL_SECONDS
        .saturating_mul(2u64.saturating_pow(row.restart_used.saturating_sub(1)))
        .min(MAX_BACKOFF_SECONDS);
    finish_action(
        ctx,
        row,
        token,
        if exhausted { "exhausted" } else { "backoff" },
        DesiredReconcileUpdate {
            desired_state: None,
            outcome: if exhausted {
                DesiredReconcileOutcome::Exhausted
            } else {
                DesiredReconcileOutcome::Backoff
            },
            controller_generation: None,
            predecessor_generation: row.predecessor_generation,
            next_wake_at: if exhausted {
                None
            } else {
                Some(deadline_after(&now_iso(), seconds)?)
            },
            last_progress_at: None,
            last_error: Some(detail),
            attention_condition: exhausted.then(|| "restart-budget-exhausted".to_owned()),
        },
    )
    .await
}

pub(super) async fn tick(
    ctx: &Ctx,
    settlement: &mut BeadSettlementPass,
    join_settlement: bool,
) -> Result<Value, Failure> {
    let started_at = now_iso();
    // Give terminal custom-source release an opportunity to race independent
    // close, but never put Herdr's network latency in front of cleanup or
    // runnable work. The durable projection lease makes cancellation safe:
    // an ambiguous request is retried later at a strictly newer sequence.
    let projection_task = ProjectionPassTask::start(ctx);
    // Pending bead settlements are a third independent durable queue: the
    // read-only convergence probe and the budgeted, per-run-fenced mutating
    // retries live inside the pass. It runs beside the tick, decoupled from
    // the tick join, never in front of due-work claiming — see
    // [`BeadSettlementPass`].
    settlement.poll(ctx).await;
    // Pane cleanup is an independent durable work queue. Run it even when no
    // desired subject is due; attempt settlement never waits on this effect.
    let cleanup = super::herdr_ownership::reconcile(ctx).await?;
    // Root anchors are eligible only after every exact linked pane cleanup
    // has converged, so this pass deliberately follows pane reconciliation.
    let layout_cleanup = super::herdr_layout::reconcile(ctx).await;
    let orphaned = {
        let now = started_at.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.mark_expired_admission_orphaned(&now)
        })
        .await?
    };
    let due = {
        let now = started_at.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.list_due_desired_work(&now)
        })
        .await?
    };
    let tick_id = uuid::Uuid::now_v7().to_string();
    let mut claimed_rows = Vec::new();
    let mut contended = 0u64;
    for candidate in due {
        let token = format!("supervise:{tick_id}:{}", uuid::Uuid::now_v7());
        let now = now_iso();
        let lease = deadline_after(&now, CLAIM_LEASE_SECONDS)?;
        let kind = candidate.subject_kind;
        let id = candidate.subject_id.clone();
        let claim_token = token.clone();
        let claimed = on_ledger(&ctx.ledger, move |ledger| {
            ledger.claim_desired_work(kind, &id, &claim_token, &now, &lease)
        })
        .await?;
        match claimed {
            Some(row) => claimed_rows.push((row, token)),
            None => contended = contended.saturating_add(1),
        }
    }
    let mut subjects = Vec::new();
    let mut admission_rows = Vec::new();
    for (candidate, token) in claimed_rows {
        match reconcile_live_before_admission(ctx, &candidate, &token).await {
            Ok(Some(report)) => subjects.push(report),
            Ok(None) => admission_rows.push((candidate, token)),
            Err(error) => {
                // Mirror the ordinary per-subject failure path below. A
                // crash still bypasses this code and retains the claim lease.
                match finish_retryable(ctx, &candidate, &token, error.to_string()).await {
                    Ok(report) => subjects.push(report),
                    Err(finish_error) => subjects.push(json!({
                        "action": "claim-retained",
                        "subject": {"kind": candidate.subject_kind.as_str(), "id": candidate.subject_id},
                        "error": error.to_string(),
                        "finishError": finish_error.to_string(),
                        "leaseUntil": candidate.reconcile_lease_until,
                    })),
                }
            }
        }
    }
    let admissions = super::admission::admit(
        ctx,
        admission_rows
            .iter()
            .map(|(row, _)| (row.subject_kind, row.subject_id.clone()))
            .collect(),
        None,
    )
    .await?;
    let admissions = admissions
        .into_iter()
        .map(|result| {
            (
                (
                    result.decision.subject_kind,
                    result.decision.subject_id.clone(),
                ),
                result,
            )
        })
        .collect::<std::collections::BTreeMap<_, _>>();
    for (candidate, token) in admission_rows {
        let admission_kind = match candidate.subject_kind {
            DesiredSubjectKind::Run => forged_types::AdmissionSubjectKind::Run,
            DesiredSubjectKind::Epic => forged_types::AdmissionSubjectKind::Epic,
        };
        let Some(admission) = admissions.get(&(admission_kind, candidate.subject_id.clone()))
        else {
            let report = finish_action(
                ctx,
                &candidate,
                &token,
                "ineligible",
                DesiredReconcileUpdate {
                    desired_state: None,
                    outcome: DesiredReconcileOutcome::Attention,
                    controller_generation: None,
                    predecessor_generation: candidate.predecessor_generation,
                    next_wake_at: None,
                    last_progress_at: None,
                    last_error: Some("no admission candidate was projected".to_owned()),
                    attention_condition: Some("admission-ineligible".to_owned()),
                },
            )
            .await?;
            if report["action"] == "superseded" {
                subjects.push(report);
            } else {
                subjects.push(json!({
                    "action": "ineligible",
                    "subject": {"kind": candidate.subject_kind.as_str(), "id": candidate.subject_id},
                    "detail": "no admission candidate was projected",
                    "desiredWork": report["desiredWork"],
                }));
            }
            continue;
        };
        if admission.decision.outcome != AdmissionOutcome::Admitted {
            let outcome = if admission.decision.outcome == AdmissionOutcome::Deferred {
                DesiredReconcileOutcome::Backoff
            } else {
                DesiredReconcileOutcome::Attention
            };
            let next_wake_at = admission.decision.next_eligible_wake_at.clone();
            let reason = format!("admission: {:?}", admission.decision.reason);
            let action = if admission.decision.outcome == AdmissionOutcome::Deferred {
                "deferred"
            } else {
                "ineligible"
            };
            let report = finish_action(
                ctx,
                &candidate,
                &token,
                action,
                DesiredReconcileUpdate {
                    desired_state: None,
                    outcome,
                    controller_generation: None,
                    predecessor_generation: candidate.predecessor_generation,
                    next_wake_at,
                    last_progress_at: None,
                    last_error: Some(reason),
                    attention_condition: (admission.decision.outcome
                        == AdmissionOutcome::Ineligible)
                        .then(|| "admission-ineligible".to_owned()),
                },
            )
            .await?;
            if report["action"] == "superseded" {
                subjects.push(report);
            } else {
                subjects.push(json!({
                    "action": action,
                    "admission": admission.decision,
                    "desiredWork": report["desiredWork"],
                }));
            }
            continue;
        }
        let Some(reservation) = admission.reservation.clone() else {
            return Err(Failure::internal(
                "admitted decision has no capacity reservation",
            ));
        };
        match reconcile_claimed(ctx, candidate.clone(), token.clone(), reservation).await {
            Ok(report) => subjects.push(report),
            Err(error) => {
                // Ordinary failures back off and release the claim. A crash
                // bypasses this code, leaving the lease deadline as recovery
                // evidence for the next process.
                match finish_retryable(ctx, &candidate, &token, error.to_string()).await {
                    Ok(report) => subjects.push(report),
                    Err(finish_error) => subjects.push(json!({
                        "action": "claim-retained",
                        "subject": {"kind": candidate.subject_kind.as_str(), "id": candidate.subject_id},
                        "error": error.to_string(),
                        "finishError": finish_error.to_string(),
                        "leaseUntil": candidate.reconcile_lease_until,
                    })),
                }
            }
        }
    }
    let projection = projection_task.finish().await;
    if join_settlement {
        settlement.join().await;
    }
    let bead_settlement = settlement.report();
    let wake_now = now_iso();
    let desired_now = wake_now.clone();
    let desired_wake_at = on_ledger(&ctx.ledger, move |ledger| {
        ledger.earliest_desired_wake(&desired_now)
    })
    .await?;
    let cleanup_wake_at = super::herdr_ownership::earliest_wake(ctx, &wake_now).await?;
    let layout_wake_at = super::herdr_layout::earliest_wake(ctx, &wake_now).await;
    let projection_wake_at = super::herdr_projection::earliest_wake(ctx, &wake_now).await;
    let next_wake_at = [
        desired_wake_at,
        cleanup_wake_at,
        layout_wake_at,
        projection_wake_at,
    ]
    .into_iter()
    .flatten()
    .min();
    Ok(json!({
        "schema": REPORT_SCHEMA,
        "tickId": tick_id,
        "startedAt": started_at,
        "finishedAt": now_iso(),
        "considered": subjects.len() + usize::try_from(contended).unwrap_or(usize::MAX),
        "contended": contended,
        "orphanedReservations": orphaned.iter().map(|row| &row.reservation_id).collect::<Vec<_>>(),
        "subjects": subjects,
        "cleanup": cleanup,
        "layoutCleanup": layout_cleanup,
        "beadSettlement": bead_settlement,
        "herdrProjection": projection,
        "nextWakeAt": next_wake_at,
    }))
}

fn sleep_until(next_wake: Option<&str>) -> Duration {
    let bounded = Duration::from_secs(POLL_SECONDS);
    let Some(next_wake) = next_wake else {
        return bounded;
    };
    let Ok(deadline) = next_wake.parse::<jiff::Timestamp>() else {
        return bounded;
    };
    let now = jiff::Timestamp::now();
    let nanos = deadline.as_nanosecond().saturating_sub(now.as_nanosecond());
    let millis = u64::try_from(nanos / 1_000_000).unwrap_or(u64::MAX);
    bounded.min(Duration::from_millis(millis.max(10)))
}

struct ShutdownSignals {
    #[cfg(unix)]
    interrupt: tokio::signal::unix::Signal,
    #[cfg(unix)]
    terminate: tokio::signal::unix::Signal,
}

impl ShutdownSignals {
    fn new() -> Result<Self, Failure> {
        #[cfg(unix)]
        {
            use tokio::signal::unix::{signal, SignalKind};
            let interrupt = signal(SignalKind::interrupt()).map_err(|error| {
                Failure::internal(format!("installing supervisor SIGINT handler: {error}"))
            })?;
            let terminate = signal(SignalKind::terminate()).map_err(|error| {
                Failure::internal(format!("installing supervisor SIGTERM handler: {error}"))
            })?;
            Ok(Self {
                interrupt,
                terminate,
            })
        }
        #[cfg(not(unix))]
        {
            Ok(Self {})
        }
    }

    async fn wait(&mut self, delay: Duration) -> Option<&'static str> {
        #[cfg(unix)]
        {
            tokio::select! {
                _ = self.interrupt.recv() => Some("signal"),
                _ = self.terminate.recv() => Some("sigterm"),
                _ = tokio::time::sleep(delay) => None,
            }
        }
        #[cfg(not(unix))]
        {
            tokio::select! {
                _ = tokio::signal::ctrl_c() => Some("signal"),
                _ = tokio::time::sleep(delay) => None,
            }
        }
    }
}

/// `forged supervise [--once]` through the shared CLI/core dispatch seam.
pub async fn supervise(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let key = if req.idempotency_key.is_empty() {
        format!(
            "{}:{}",
            derive_key("supervise", None, None, None),
            uuid::Uuid::now_v7()
        )
    } else {
        req.idempotency_key.clone()
    };
    if req.schema_version != 1 {
        return err_response(
            &key,
            &Failure::invalid(format!("unsupported schemaVersion {}", req.schema_version)),
        );
    }
    let once = req
        .params
        .get("once")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let service_generation = req
        .params
        .get("serviceGeneration")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty());
    if once && service_generation.is_some() {
        return err_response(
            &key,
            &Failure::invalid("--once cannot publish a long-running service generation"),
        );
    }
    if once {
        // One deterministic tick: the settlement pass is joined fully.
        let mut settlement = BeadSettlementPass::new();
        return match tick(ctx, &mut settlement, true).await {
            Ok(report) => ok_response(&key, false, report),
            Err(error) => err_response(&key, &error),
        };
    }

    let mut observer = match service_generation {
        Some(generation) => {
            match crate::runtime::SupervisorObserver::start(&ctx.config, generation).await {
                Ok(observer) => Some(observer),
                Err(error) => return err_response(&key, &error),
            }
        }
        None => None,
    };
    let mut shutdown = match ShutdownSignals::new() {
        Ok(signals) => signals,
        Err(error) => return err_response(&key, &error),
    };
    let started_at = now_iso();
    let mut ticks = 0u64;
    let mut last_report = Value::Null;
    let mut settlement = BeadSettlementPass::new();
    loop {
        match tick(ctx, &mut settlement, false).await {
            Ok(report) => {
                ticks = ticks.saturating_add(1);
                if let Some(observer) = observer.as_mut() {
                    if let Err(error) = observer.tick_succeeded(&report) {
                        return err_response(&key, &error);
                    }
                }
                let delay = sleep_until(report.get("nextWakeAt").and_then(Value::as_str));
                last_report = report;
                if let Some(reason) = shutdown.wait(delay).await {
                    if let Some(observer) = observer.as_mut() {
                        if let Err(error) = observer.stopped(reason) {
                            return err_response(&key, &error);
                        }
                    }
                    return ok_response(
                        &key,
                        false,
                        json!({
                            "schema": LOOP_SCHEMA,
                            "startedAt": started_at,
                            "stoppedAt": now_iso(),
                            "reason": reason,
                            "ticks": ticks,
                            "lastReport": last_report,
                        }),
                    );
                }
            }
            Err(error) if error.recoverable => {
                if let Some(observer) = observer.as_mut() {
                    if let Err(status_error) = observer.degraded(&error.to_string()) {
                        return err_response(&key, &status_error);
                    }
                }
                if let Some(signal) = shutdown.wait(Duration::from_secs(POLL_SECONDS)).await {
                    let reason = if signal == "sigterm" {
                        "sigterm-after-recoverable-error"
                    } else {
                        "signal-after-recoverable-error"
                    };
                    if let Some(observer) = observer.as_mut() {
                        if let Err(status_error) = observer.stopped(reason) {
                            return err_response(&key, &status_error);
                        }
                    }
                    return ok_response(
                        &key,
                        false,
                        json!({
                            "schema": LOOP_SCHEMA,
                            "startedAt": started_at,
                            "stoppedAt": now_iso(),
                            "reason": reason,
                            "ticks": ticks,
                            "lastReport": last_report,
                            "lastError": error.to_string(),
                        }),
                    );
                }
            }
            Err(error) => {
                if let Some(observer) = observer.as_mut() {
                    let _ = observer.degraded(&error.to_string());
                }
                return err_response(&key, &error);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backoff_is_bounded_and_wake_sleep_is_bounded() {
        assert_eq!(
            deadline_after("2030-01-01T00:00:00.000000000Z", 5).expect("deadline"),
            "2030-01-01T00:00:05.000000000Z"
        );
        assert!(
            sleep_until(Some("9999-01-01T00:00:00.000000000Z"))
                <= Duration::from_secs(POLL_SECONDS)
        );
    }

    #[test]
    fn wire_vocabulary_is_versioned_and_closed() {
        assert_eq!(REPORT_SCHEMA, "forged.supervise.report/1");
        assert_eq!(LOOP_SCHEMA, "forged.supervise.session/1");
        assert_eq!(DesiredState::Running.as_str(), "running");
        assert_eq!(DesiredReconcileOutcome::Exhausted.as_str(), "exhausted");
    }
}
