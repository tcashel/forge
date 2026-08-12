//! The shared core both surfaces call: one function per command, each
//! taking an [`OperationRequest`] and returning an [`OperationResponse`].
//! The core layer never knows whether it was reached from clap or rmcp —
//! that is what makes the CLI/MCP parity criterion achievable rather than a
//! coincidence.

mod claimnext;
mod drive;
mod ops;

use forged_ledger::{EffectClass, Ledger, LedgerError, OperationOutcome};
use forged_proto::ProtoError;
use forged_types::{ErrorCode, OpError, OperationRequest, OperationResponse};
use serde_json::{Map, Value};

use crate::config::ForgedConfig;
use crate::failpoint;

/// Everything a core function needs: the once-read config and the open
/// ledger.
pub struct Ctx {
    /// The once-read config.
    pub config: ForgedConfig,
    /// The open ledger (a cloneable handle to the writer thread).
    pub ledger: Ledger,
}

/// A core failure, carrying the closed wire code.
#[derive(Debug, thiserror::Error)]
#[error("{message}")]
pub struct Failure {
    /// The closed wire code.
    pub code: ErrorCode,
    /// Human-readable detail.
    pub message: String,
    /// Whether a retry could plausibly succeed.
    pub recoverable: bool,
}

impl Failure {
    /// A refusal with `recoverable: false`.
    pub fn refused(code: ErrorCode, message: impl Into<String>) -> Self {
        Failure {
            code,
            message: message.into(),
            recoverable: false,
        }
    }

    /// An `INVALID_REQUEST` refusal.
    pub fn invalid(message: impl Into<String>) -> Self {
        Self::refused(ErrorCode::InvalidRequest, message)
    }

    /// An `INTERNAL` failure.
    pub fn internal(message: impl Into<String>) -> Self {
        Self::refused(ErrorCode::Internal, message)
    }
}

impl From<LedgerError> for Failure {
    fn from(err: LedgerError) -> Self {
        let recoverable = matches!(
            err.code(),
            ErrorCode::OperationInProgress | ErrorCode::BeadsContention
        );
        Failure {
            code: err.code(),
            message: err.to_string(),
            recoverable,
        }
    }
}

impl From<ProtoError> for Failure {
    fn from(err: ProtoError) -> Self {
        match err {
            ProtoError::Ledger(inner) => inner.into(),
            other => Failure::internal(other.to_string()),
        }
    }
}

impl From<forged_beads::BdError> for Failure {
    fn from(err: forged_beads::BdError) -> Self {
        use forged_beads::BdError;
        // The wire mapping the classifier documents per variant.
        let code = match &err {
            BdError::Contention { .. } => ErrorCode::BeadsContention,
            BdError::LeaseHeld { .. } => ErrorCode::BeadLeaseHeld,
            _ => ErrorCode::BeadsError,
        };
        Failure {
            code,
            message: err.to_string(),
            recoverable: matches!(code, ErrorCode::BeadsContention),
        }
    }
}

impl From<forged_git::GitError> for Failure {
    fn from(err: forged_git::GitError) -> Self {
        Failure::refused(err.code(), err.to_string())
    }
}

impl From<forged_git::GhError> for Failure {
    fn from(err: forged_git::GhError) -> Self {
        Failure::refused(ErrorCode::GhError, err.to_string())
    }
}

impl From<forged_gate::GateError> for Failure {
    fn from(err: forged_gate::GateError) -> Self {
        Failure::refused(err.code(), err.to_string())
    }
}

impl From<forged_provider::ProviderError> for Failure {
    fn from(err: forged_provider::ProviderError) -> Self {
        Failure::refused(err.wire_code(), err.to_string())
    }
}

impl From<forged_host::HostError> for Failure {
    fn from(err: forged_host::HostError) -> Self {
        Failure::refused(err.wire_code(), err.to_string())
    }
}

/// The core result: a `result` payload or a wire failure.
pub type CoreResult = Result<Value, Failure>;

/// Run one blocking closure against the ledger without holding anything
/// across an await (the ledger is a blocking actor; this crate is the
/// `spawn_blocking` layer).
pub async fn on_ledger<T, F>(ledger: &Ledger, f: F) -> Result<T, Failure>
where
    T: Send + 'static,
    F: FnOnce(&Ledger) -> Result<T, LedgerError> + Send + 'static,
{
    let handle = ledger.clone();
    tokio::task::spawn_blocking(move || f(&handle))
        .await
        .map_err(|e| Failure::internal(format!("blocking task join failure: {e}")))?
        .map_err(Failure::from)
}

/// Derive `op:<name>:<runId|->:<stage|->:<seq|->`, a literal `-` filling
/// every segment the command does not have.
pub fn derive_key(
    name: &str,
    run_id: Option<&str>,
    stage: Option<&str>,
    seq: Option<i64>,
) -> String {
    format!(
        "op:{name}:{}:{}:{}",
        run_id.unwrap_or("-"),
        stage.unwrap_or("-"),
        seq.map(|s| s.to_string()).unwrap_or_else(|| "-".to_owned()),
    )
}

/// The defaulted read-only key: `op:<name>:read`.
pub fn read_key(name: &str) -> String {
    format!("op:{name}:read")
}

/// Read a required string param.
pub fn param_str<'p>(params: &'p Map<String, Value>, key: &str) -> Result<&'p str, Failure> {
    params
        .get(key)
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| Failure::invalid(format!("missing required param {key:?}")))
}

/// Read an optional string param.
pub fn param_opt_str<'p>(params: &'p Map<String, Value>, key: &str) -> Option<&'p str> {
    params
        .get(key)
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
}

/// Split a deterministic packet id (`<run_id>/<stage>/<seq>`) into its
/// parts.
pub fn split_packet_id(packet_id: &str) -> Result<(String, forged_types::Stage, i64), Failure> {
    let mut parts = packet_id.rsplitn(3, '/');
    let seq = parts
        .next()
        .and_then(|s| s.parse::<i64>().ok())
        .ok_or_else(|| Failure::invalid(format!("packet id {packet_id:?} has no seq segment")))?;
    let stage = parts
        .next()
        .and_then(crate::config::stage_from_str)
        .ok_or_else(|| Failure::invalid(format!("packet id {packet_id:?} has no stage segment")))?;
    let run_id = parts
        .next()
        .filter(|r| !r.is_empty())
        .ok_or_else(|| Failure::invalid(format!("packet id {packet_id:?} has no run segment")))?;
    Ok((run_id.to_owned(), stage, seq))
}

/// The driver's lease-holder id for a run — deterministic (seam contract 5
/// shape `<provider>:<session-or-host>:<pid>` with a fixed pid segment), so
/// a resumed driver derives the same holder, machine-step operation params
/// replay byte-identically, and the reconcile saga's scoped reclaim
/// converges on the same holder every process computes.
pub fn run_holder(run_id: &str) -> String {
    format!("forged:{run_id}:0")
}

/// Build a success envelope.
pub fn ok_response(operation_id: &str, reused: bool, result: Value) -> OperationResponse {
    OperationResponse {
        ok: true,
        operation_id: operation_id.to_owned(),
        reused,
        result: Some(result),
        error: None,
    }
}

/// Build a failure envelope.
pub fn err_response(operation_id: &str, failure: &Failure) -> OperationResponse {
    OperationResponse {
        ok: false,
        operation_id: operation_id.to_owned(),
        reused: false,
        result: None,
        error: Some(OpError {
            code: failure.code,
            message: failure.message.clone(),
            recoverable: failure.recoverable,
            detail: None,
        }),
    }
}

/// Whether the request supplied no idempotency key (the surface adapters
/// pass an empty string for "absent"; `--idempotency-key` always fills it).
pub fn key_absent(req: &OperationRequest) -> bool {
    req.idempotency_key.is_empty()
}

/// Validate `schemaVersion == 1` for read paths (mutating paths get the
/// same check from `begin_operation`).
fn check_schema_version(req: &OperationRequest) -> Result<(), Failure> {
    if req.schema_version != 1 {
        return Err(Failure::invalid(format!(
            "unsupported schemaVersion {}",
            req.schema_version
        )));
    }
    Ok(())
}

/// Run a read-only command: the same envelope in, an envelope out, the
/// operation store never touched. An absent key defaults to
/// `op:<name>:read`, echoed as `operationId` with `reused: false`.
pub async fn read_only<F, Fut>(name: &str, req: &OperationRequest, effect: F) -> OperationResponse
where
    F: FnOnce() -> Fut,
    Fut: std::future::Future<Output = CoreResult>,
{
    let key = if key_absent(req) {
        read_key(name)
    } else {
        req.idempotency_key.clone()
    };
    if let Err(f) = check_schema_version(req) {
        return err_response(&key, &f);
    }
    match effect().await {
        Ok(result) => ok_response(&key, false, result),
        Err(f) => err_response(&key, &f),
    }
}

/// How a fenced effect's failure treats the reserved operation row.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OnEffectError {
    /// Delete the row so a retry re-claims (`SafeRetry`).
    Release,
    /// Leave the row `in_progress` for the reconciler to settle by
    /// observation or quarantine (`ObserveOnly` / `HumanAmbiguous`).
    LeaveInProgress,
}

impl OnEffectError {
    fn for_class(class: EffectClass) -> Self {
        match class {
            EffectClass::SafeRetry => OnEffectError::Release,
            _ => OnEffectError::LeaveInProgress,
        }
    }
}

/// Run a mutating command through the ledger's three-point fence:
/// `begin_operation` (replay wins verbatim), `assert_attempt_live`
/// immediately before the effect when a token is carried, the effect, then
/// `complete_operation`. The `proto.operation.request` event is appended
/// immediately before `begin_operation` — guarded by a probe so a
/// conflicting begin can never poison the run's replay stream with a
/// second, differing payload under the same logical key.
pub async fn fenced<F, Fut>(
    ctx: &Ctx,
    name: &str,
    class: EffectClass,
    req: &OperationRequest,
    assert_token: Option<&str>,
    effect: F,
) -> OperationResponse
where
    F: FnOnce(String) -> Fut,
    Fut: std::future::Future<Output = CoreResult>,
{
    let key = req.idempotency_key.clone();
    let request = req.clone();

    // Probe first: an existing row with a different request hash is an
    // IdempotencyConflict — refuse BEFORE recording the request event, so
    // the replay stream never sees two differing payloads under one key.
    let hash = match forged_types::request_sha256(&request) {
        Ok(hash) => hash,
        Err(e) => {
            return err_response(
                &key,
                &Failure::invalid(format!("params cannot be canonicalized: {e}")),
            )
        }
    };
    let probe = {
        let name = name.to_owned();
        let key = key.clone();
        on_ledger(&ctx.ledger, move |l| l.find_operation(&name, &key)).await
    };
    match probe {
        Ok(Some(row)) if row.request_sha256 != hash => {
            return err_response(
                &key,
                &Failure::refused(
                    ErrorCode::IdempotencyConflict,
                    format!("operation {name:?} key {key:?} was stored with a different request"),
                ),
            );
        }
        Ok(_) => {}
        Err(f) => return err_response(&key, &f),
    }

    if let Some(run_id) = request.run_id.clone() {
        let event = forged_proto::ProtoEvent::OperationRequest {
            name: name.to_owned(),
            idempotency_key: key.clone(),
            effect_class: class.as_str().to_owned(),
            request: request.clone(),
        };
        let record = {
            let run_id = run_id.clone();
            on_ledger(&ctx.ledger, move |l| {
                forged_proto::record(l, &run_id, event).map_err(|e| match e {
                    ProtoError::Ledger(inner) => inner,
                    other => LedgerError::Internal {
                        message: other.to_string(),
                    },
                })
            })
            .await
        };
        if let Err(f) = record {
            return err_response(&key, &f);
        }
    }

    failpoint::hit("op.begin.before");
    let begun = {
        let name = name.to_owned();
        let request = request.clone();
        let token = assert_token.map(str::to_owned);
        on_ledger(&ctx.ledger, move |l| {
            l.begin_operation(&name, &request, class, token.as_deref())
        })
        .await
    };
    failpoint::hit("op.begin.after");

    let ticket = match begun {
        Ok(OperationOutcome::Replayed(resp)) => return resp,
        Ok(OperationOutcome::Fresh(ticket)) => ticket,
        Err(f) => return err_response(&key, &f),
    };
    let operation_id = ticket.operation_id;

    if let Some(token) = assert_token {
        let token = token.to_owned();
        if let Err(f) = on_ledger(&ctx.ledger, move |l| l.assert_attempt_live(&token)).await {
            release_if(ctx, OnEffectError::for_class(class), &operation_id).await;
            return err_response(&operation_id, &f);
        }
    }

    match effect(operation_id.clone()).await {
        Ok(result) => {
            let resp = ok_response(&operation_id, false, result);
            let store = {
                let operation_id = operation_id.clone();
                let resp = resp.clone();
                on_ledger(&ctx.ledger, move |l| {
                    l.complete_operation(&operation_id, &resp)
                })
                .await
            };
            match store {
                Ok(()) => resp,
                Err(f) => err_response(&operation_id, &f),
            }
        }
        Err(f) => {
            release_if(ctx, OnEffectError::for_class(class), &operation_id).await;
            err_response(&operation_id, &f)
        }
    }
}

async fn release_if(ctx: &Ctx, on_error: OnEffectError, operation_id: &str) {
    if on_error == OnEffectError::Release {
        let operation_id = operation_id.to_owned();
        let _ = on_ledger(&ctx.ledger, move |l| l.release_operation(&operation_id)).await;
    }
}

/// Dispatch one named command to its core function. Both surfaces call
/// exactly this, so their envelopes are identical by construction.
pub async fn dispatch(ctx: &Ctx, name: &str, mut req: OperationRequest) -> OperationResponse {
    // The two explicit-key commands are refused before any defaulting.
    match name {
        "claim_next" | "worktree_retire" if key_absent(&req) => {
            return err_response(
                &derive_key(name, req.run_id.as_deref(), None, None),
                &Failure::invalid(format!(
                    "{name} cannot derive a meaningful idempotency key; pass --idempotency-key"
                )),
            );
        }
        _ => {}
    }
    match name {
        "doctor" => ops::doctor(ctx, &req).await,
        "init" => ops::init(ctx, &mut req).await,
        "run_start" => ops::run_start(ctx, &mut req).await,
        "run_advance" => drive::run_advance(ctx, &req).await,
        "run_drive" => drive::run_drive(ctx, &req).await,
        "run_status" => ops::run_status(ctx, &req).await,
        "packet_show" => ops::packet_show(ctx, &req).await,
        "packet_claim" => ops::packet_claim(ctx, &mut req).await,
        "packet_complete" => ops::packet_complete(ctx, &mut req).await,
        "packet_fail" => ops::packet_fail(ctx, &mut req).await,
        "packet_heartbeat" => ops::packet_heartbeat(ctx, &req).await,
        "claim_next" => claimnext::claim_next(ctx, &req).await,
        "gate_run" => ops::gate_run(ctx, &mut req).await,
        "reconcile" => ops::reconcile(ctx, &mut req).await,
        "usage_report" => ops::usage_report(ctx, &req).await,
        "usage_ingest" => ops::usage_ingest(ctx, &mut req).await,
        "events_tail" => ops::events_tail(ctx, &req).await,
        "worktree_retire" => ops::worktree_retire(ctx, &req).await,
        other => err_response(
            &read_key(other),
            &Failure::invalid(format!("unknown command {other:?}")),
        ),
    }
}

/// The reconcile sweep count: settled `reconcile` operations already
/// recorded for the run, probed in key order so each sweep derives a fresh
/// key rather than replaying the previous one.
pub async fn reconcile_sweep(ctx: &Ctx, run_id: &str) -> Result<i64, Failure> {
    let mut sweep = 0i64;
    loop {
        let key = derive_key("reconcile", Some(run_id), None, Some(sweep));
        let row = {
            let key = key.clone();
            on_ledger(&ctx.ledger, move |l| l.find_operation("reconcile", &key)).await?
        };
        match row {
            Some(row) if row.state == forged_ledger::OperationState::Terminal => sweep += 1,
            _ => return Ok(sweep),
        }
    }
}
