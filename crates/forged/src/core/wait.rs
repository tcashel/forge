//! One blocking read over the ledger cursor.

use std::time::Duration;

use forged_ledger::{RunState, WorkKind, WorkStatus};
use forged_types::{AttentionState, AttentionSubjectKind, ErrorCode, OpError, OperationRequest};
use serde_json::{json, Value};
use tokio::time::Instant;

use super::{
    check_schema_version, err_response, key_absent, on_ledger, param_named_str,
    param_opt_i64_strict, param_opt_str, read_key, read_only, Ctx, Failure, OperationResponse,
};

const DEFAULT_TIMEOUT_SECONDS: i64 = 240;
const MAX_TIMEOUT_SECONDS: i64 = 3_600;
const SUBJECT_POLL_INTERVAL: Duration = Duration::from_secs(1);
const DECISION_POLL_INTERVAL: Duration = Duration::from_secs(5);

#[derive(Clone, Copy)]
enum WaitUntil {
    Decision,
    Stage,
    Terminal,
}

impl WaitUntil {
    fn parse(value: Option<&str>) -> Result<Self, Failure> {
        match value.unwrap_or("stage") {
            "decision" => Ok(Self::Decision),
            "stage" => Ok(Self::Stage),
            "terminal" => Ok(Self::Terminal),
            other => Err(Failure::invalid(format!(
                "wait until must be decision, stage, or terminal, got {other:?}"
            ))),
        }
    }

    fn as_str(self) -> &'static str {
        match self {
            Self::Decision => "decision",
            Self::Stage => "stage",
            Self::Terminal => "terminal",
        }
    }
}

#[derive(Clone)]
enum WaitSubject {
    Work { id: String, kind: WorkKind },
    Run(String),
    Epic(String),
}

impl WaitSubject {
    async fn explain(&self, ctx: &Ctx) -> Result<Value, Failure> {
        match self {
            Self::Work { id, .. } => {
                let id = id.clone();
                let work = on_ledger(&ctx.ledger, move |ledger| ledger.work_item(&id))
                    .await?
                    .ok_or_else(|| Failure::internal("resolved work item disappeared"))?;
                super::observe::explain_work_item(ctx, work).await
            }
            Self::Run(id) => super::observe::explain_run(ctx, id.clone()).await,
            Self::Epic(id) => super::observe::explain_epic(ctx, id.clone()).await,
        }
    }

    async fn decision_subject(
        &self,
        ctx: &Ctx,
    ) -> Result<Option<(AttentionSubjectKind, String)>, Failure> {
        match self {
            Self::Run(id) => Ok(Some((AttentionSubjectKind::Run, id.clone()))),
            Self::Epic(id) => Ok(Some((AttentionSubjectKind::Epic, id.clone()))),
            Self::Work { id, kind } if *kind == WorkKind::Epic => {
                Ok(Some((AttentionSubjectKind::Epic, id.clone())))
            }
            Self::Work { id, .. } => Ok(latest_run_for_work(ctx, id)
                .await?
                .map(|run| (AttentionSubjectKind::Run, run))),
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
struct WorkStage {
    revision: i64,
    status: WorkStatus,
    updated_at: String,
    note_count: u64,
    latest_run_event_cursor: i64,
}

fn response_key(req: &OperationRequest) -> String {
    if key_absent(req) {
        read_key("wait")
    } else {
        req.idempotency_key.clone()
    }
}

fn resolution_refusal(req: &OperationRequest, id: &str, resolution: Value) -> OperationResponse {
    let reason = resolution
        .get("reason")
        .and_then(Value::as_str)
        .unwrap_or("unresolved");
    OperationResponse {
        ok: false,
        operation_id: response_key(req),
        reused: false,
        result: None,
        error: Some(OpError {
            code: ErrorCode::InvalidRequest,
            message: format!("wait id {id:?} is {reason}; use explain --id {id}"),
            recoverable: false,
            detail: Some(resolution),
        }),
    }
}

fn unsupported_refusal(req: &OperationRequest, id: &str, kind: &str) -> OperationResponse {
    resolution_refusal(
        req,
        id,
        json!({
            "query": id,
            "reason": "unsupported-kind",
            "candidates": [],
            "remedy": {
                "schema": "forged.remedy/1",
                "verb": "explain",
                "args": {"id": id},
                "reason": format!("wait supports work items, runs, and epics; inspect this {kind} id"),
            },
        }),
    )
}

async fn resolve_subject(
    ctx: &Ctx,
    req: &OperationRequest,
    id: &str,
) -> Result<WaitSubject, OperationResponse> {
    match super::observe::resolve_id(ctx, id, None).await {
        Ok(super::observe::ResolvedId::WorkItem(work)) => Ok(WaitSubject::Work {
            id: work.work_id.clone(),
            kind: work.kind,
        }),
        Ok(super::observe::ResolvedId::Run(id)) => Ok(WaitSubject::Run(id)),
        Ok(super::observe::ResolvedId::Epic(id)) => Ok(WaitSubject::Epic(id)),
        Ok(super::observe::ResolvedId::Attempt(_)) => Err(unsupported_refusal(req, id, "attempt")),
        Ok(super::observe::ResolvedId::Attention(_)) => {
            Err(unsupported_refusal(req, id, "attention"))
        }
        Ok(super::observe::ResolvedId::Unresolved(resolution)) => {
            Err(resolution_refusal(req, id, resolution))
        }
        Err(failure) => Err(err_response(&response_key(req), &failure)),
    }
}

async fn event_cursor(ctx: &Ctx, id: &str) -> Result<i64, Failure> {
    let id = id.to_owned();
    let latest = on_ledger(&ctx.ledger, move |ledger| ledger.latest_event_per_run()).await?;
    Ok(latest.get(&id).map_or(0, |event| event.event_id))
}

async fn event_after(ctx: &Ctx, id: &str, cursor: i64) -> Result<Option<i64>, Failure> {
    let id = id.to_owned();
    let rows = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_events(Some(&id), cursor, 1)
    })
    .await?;
    Ok(rows.first().map(|event| event.event_id))
}

async fn latest_run_for_work(ctx: &Ctx, work_id: &str) -> Result<Option<String>, Failure> {
    let work_id = work_id.to_owned();
    let runs = on_ledger(&ctx.ledger, move |ledger| ledger.list_runs()).await?;
    Ok(runs
        .into_iter()
        .rfind(|run| run.work_id == work_id)
        .map(|run| run.run_id))
}

async fn work_stage(ctx: &Ctx, work_id: &str) -> Result<WorkStage, Failure> {
    let id = work_id.to_owned();
    let work = on_ledger(&ctx.ledger, move |ledger| ledger.work_item(&id))
        .await?
        .ok_or_else(|| Failure::internal("resolved work item disappeared"))?;
    let id = work_id.to_owned();
    let note_count = on_ledger(&ctx.ledger, move |ledger| ledger.work_note_count(&id)).await?;
    let latest_run_event_cursor = match latest_run_for_work(ctx, work_id).await? {
        Some(run) => event_cursor(ctx, &run).await?,
        None => 0,
    };
    Ok(WorkStage {
        revision: work.revision,
        status: work.status,
        updated_at: work.updated_at,
        note_count,
        latest_run_event_cursor,
    })
}

async fn is_terminal(ctx: &Ctx, subject: &WaitSubject) -> Result<bool, Failure> {
    match subject {
        WaitSubject::Run(id) => {
            let id = id.clone();
            let run = on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&id)).await?;
            Ok(run.state == RunState::Stopped)
        }
        WaitSubject::Work { id, .. } | WaitSubject::Epic(id) => {
            let id = id.clone();
            let work = on_ledger(&ctx.ledger, move |ledger| ledger.work_item(&id)).await?;
            Ok(work.is_some_and(|work| work.status == WorkStatus::Closed))
        }
    }
}

async fn has_open_decision(ctx: &Ctx, subject: &WaitSubject) -> Result<bool, Failure> {
    let Some((kind, id)) = subject.decision_subject(ctx).await? else {
        return Ok(false);
    };
    Ok(super::observe::subject_attention(ctx, kind, &id)
        .await?
        .into_iter()
        .any(|item| {
            item.state == AttentionState::Open
                && super::attention::classification(item.condition)
                    == super::attention::AttentionClass::Decision
        }))
}

async fn wait_at_cadence<F, Fut>(
    deadline: Instant,
    interval: Duration,
    mut condition: F,
) -> Result<bool, Failure>
where
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = Result<bool, Failure>>,
{
    if condition().await? {
        return Ok(true);
    }
    loop {
        let remaining = deadline.saturating_duration_since(Instant::now());
        if remaining.is_zero() {
            return Ok(false);
        }
        if remaining < interval {
            tokio::time::sleep(remaining).await;
            return Ok(false);
        }
        tokio::time::sleep(interval).await;
        if condition().await? {
            return Ok(true);
        }
        if Instant::now() >= deadline {
            return Ok(false);
        }
    }
}

async fn wait_for_stage(
    ctx: &Ctx,
    subject: &WaitSubject,
    deadline: Instant,
) -> Result<bool, Failure> {
    match subject {
        WaitSubject::Run(id) | WaitSubject::Epic(id) => {
            let cursor = event_cursor(ctx, id).await?;
            wait_at_cadence(deadline, SUBJECT_POLL_INTERVAL, || {
                let id = id.clone();
                async move { Ok(event_after(ctx, &id, cursor).await?.is_some()) }
            })
            .await
        }
        WaitSubject::Work { id, .. } => {
            let initial = work_stage(ctx, id).await?;
            wait_at_cadence(deadline, SUBJECT_POLL_INTERVAL, || async {
                Ok(work_stage(ctx, id).await? != initial)
            })
            .await
        }
    }
}

async fn wait_for_condition(
    ctx: &Ctx,
    subject: &WaitSubject,
    until: WaitUntil,
    deadline: Instant,
) -> Result<bool, Failure> {
    match until {
        WaitUntil::Decision => {
            wait_at_cadence(deadline, DECISION_POLL_INTERVAL, || {
                has_open_decision(ctx, subject)
            })
            .await
        }
        WaitUntil::Stage => wait_for_stage(ctx, subject, deadline).await,
        WaitUntil::Terminal => {
            wait_at_cadence(deadline, SUBJECT_POLL_INTERVAL, || {
                is_terminal(ctx, subject)
            })
            .await
        }
    }
}

/// `wait` — resolve once, then block on the exact subject's cursor or state.
pub async fn wait(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    if let Err(failure) = check_schema_version(req) {
        return err_response(&response_key(req), &failure);
    }
    let id = match param_named_str(&req.params, "id") {
        Some(id) => id.to_owned(),
        None => {
            return err_response(
                &response_key(req),
                &Failure::invalid("wait param \"id\" must name a subject"),
            )
        }
    };
    let until = match WaitUntil::parse(param_opt_str(&req.params, "until")) {
        Ok(until) => until,
        Err(failure) => return err_response(&response_key(req), &failure),
    };
    let timeout = match param_opt_i64_strict(&req.params, "timeout") {
        Ok(timeout) => timeout.unwrap_or(DEFAULT_TIMEOUT_SECONDS),
        Err(failure) => return err_response(&response_key(req), &failure),
    };
    if !(1..=MAX_TIMEOUT_SECONDS).contains(&timeout) {
        return err_response(
            &response_key(req),
            &Failure::invalid(format!(
                "wait timeout must be between 1 and {MAX_TIMEOUT_SECONDS} seconds"
            )),
        );
    }
    let subject = match resolve_subject(ctx, req, &id).await {
        Ok(subject) => subject,
        Err(response) => return response,
    };
    let timeout = Duration::from_secs(u64::try_from(timeout).expect("validated positive timeout"));
    read_only("wait", req, || async {
        let changed = wait_for_condition(ctx, &subject, until, Instant::now() + timeout).await?;
        let explain = subject.explain(ctx).await?;
        Ok(json!({
            "schema": "forged.wait/1",
            "changed": changed,
            "until": until.as_str(),
            "explain": explain,
        }))
    })
    .await
}

#[cfg(test)]
mod tests {
    use std::sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    };

    use super::*;

    #[tokio::test]
    async fn decision_cadence_never_folds_at_the_subject_rate() {
        let calls = Arc::new(AtomicUsize::new(0));
        let observed = Arc::clone(&calls);
        let interval = Duration::from_millis(50);
        let started = Instant::now();
        let deadline = started + Duration::from_secs(1);
        let changed = wait_at_cadence(deadline, interval, || {
            let call = observed.fetch_add(1, Ordering::SeqCst) + 1;
            async move { Ok(call == 3) }
        })
        .await
        .expect("polling succeeds");
        assert!(changed);
        assert_eq!(calls.load(Ordering::SeqCst), 3);
        assert!(started.elapsed() >= Duration::from_millis(100));
        assert_eq!(DECISION_POLL_INTERVAL, Duration::from_secs(5));
    }
}
