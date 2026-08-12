//! The shared core both surfaces call: one function per command, each
//! taking an [`OperationRequest`] and returning an [`OperationResponse`].
//! The core layer never knows whether it was reached from clap or rmcp —
//! that is what makes the CLI/MCP parity criterion achievable rather than a
//! coincidence.

mod claimnext;
mod drive;
mod epic;
mod observe;
mod ops;
pub(crate) mod sessions;

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

/// Fill an absent idempotency key with the derived one; an explicit key wins.
pub(crate) fn default_key(req: &mut OperationRequest, derived: String) {
    if key_absent(req) {
        req.idempotency_key = derived;
    }
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
    let (run_id, stage_key, seq) = split_packet_key(packet_id)?;
    let stage = crate::config::stage_from_str(&stage_key).ok_or_else(|| {
        Failure::invalid(format!(
            "packet id {packet_id:?} has no legacy stage segment"
        ))
    })?;
    Ok((run_id, stage, seq))
}

/// Split either a legacy or semantic packet id into run, stage key, and
/// logical round/sequence. The stage key remains an opaque semantic string.
pub fn split_packet_key(packet_id: &str) -> Result<(String, String, i64), Failure> {
    let mut parts = packet_id.rsplitn(3, '/');
    let seq = parts
        .next()
        .and_then(|s| s.parse::<i64>().ok())
        .ok_or_else(|| Failure::invalid(format!("packet id {packet_id:?} has no seq segment")))?;
    let stage = parts
        .next()
        .filter(|stage| !stage.is_empty())
        .ok_or_else(|| Failure::invalid(format!("packet id {packet_id:?} has no stage segment")))?;
    let run_id = parts
        .next()
        .filter(|r| !r.is_empty())
        .ok_or_else(|| Failure::invalid(format!("packet id {packet_id:?} has no run segment")))?;
    Ok((run_id.to_owned(), stage.to_owned(), seq))
}

/// The pre-run bd lease identity: the actor a FRESH frontier claim in
/// `claim-next` is taken under.
///
/// `bd ready --claim --actor <holder>` demands its actor BEFORE it says
/// which bead it handed over, so at that moment no run exists to derive
/// [`run_holder`] from. Claiming under the operator's `--holder` instead
/// wedges the driver against its own lease minutes later, when `run drive`'s
/// Resolve claims the same bead under the identity it derives: bd 1.2.1
/// refuses a claim by any other actor outright ("issue already claimed by
/// …", exit 1 — probe-verified). This constant is that pre-run identity, and
/// Resolve adopts it verbatim for the run minted from the bead, so
/// claim-next → run start → run drive share ONE lease identity end to end
/// (operator adjudication, 2026-08-12).
pub const FRONTIER_HOLDER: &str = "forged:frontier:0";

/// The driver's derived lease-holder id for a run: seam contract 5's
/// `<provider>:<session-or-host>:<pid>` shape, filled with what a LEASE can
/// honestly carry — `forged` (the DRIVER claims the bead, not the model
/// vendor: one run drives both provider families under this one lease), the
/// run as the session ref, and a fixed `0` pid segment.
///
/// The fixed pid is load-bearing, not laziness. The lease must resolve to
/// the same string in every process that touches it — the driver that took
/// it, a restarted driver, a reconciler in a third process — or a scoped
/// reclaim names the wrong previous owner and a re-claim is refused as
/// theft. A live pid here would make each of those derive a different
/// holder. Real per-process, per-attempt identity — a real provider and a
/// real pid — is [`session_claimant`], which is STORED on the attempt row
/// rather than re-derived, and so can carry values only one process knows.
pub fn run_holder(run_id: &str) -> String {
    format!("forged:{run_id}:0")
}

/// The bd lease identity in force for a run: the holder forged already has
/// the bead under when that holder is one of ours — [`FRONTIER_HOLDER`] from
/// a fresh `claim-next` claim, or this run's derived [`run_holder`] from an
/// earlier pass — else the derived holder.
///
/// Every consumer of the run's lease (Resolve's claim, the guardian's
/// heartbeat, claim-next's scoped reclaim, the `reclaim_lease` port) reads
/// the identity here rather than deriving a second, differing one, which is
/// what makes the chain unwedgeable against itself. A holder this driver
/// could not have taken is deliberately NOT adopted: the derived holder is
/// returned, bd refuses the claim, and another worker's live lease stands.
pub async fn lease_identity(
    bd: &forged_beads::BdConfig,
    bead: &str,
    run_id: &str,
) -> Result<String, Failure> {
    let derived = run_holder(run_id);
    let current = forged_beads::lease_holder(bd, bead).await?;
    Ok(match current {
        Some(held) if held == derived || held == FRONTIER_HOLDER => held,
        _ => derived,
    })
}

/// The per-attempt session identity stored in `attempts.claimant` — the
/// second of the two identity layers, and the one `ReconcilePorts` receives
/// verbatim as `session`.
///
/// Seam contract 5's `<provider>:<session-or-host>:<pid>` with real values:
/// the provider the packet's hints select, the PACKET as the session ref,
/// and this driver process's own pid. It is scoped to the packet, not the
/// run: a packet has at most one live attempt (`claim_packet` refuses a
/// second), so this string maps one-to-one onto a live attempt and resolves
/// to exactly one packet directory — which is what makes `liveness` and
/// `kill_confirmed` per-attempt instead of an aggregate over every leg
/// sharing the run's lease. Being stored rather than re-derived is what lets
/// it carry a real pid: no other process has to reproduce the string, only
/// read it back from the row.
///
/// The bd lease holder stays the run's ([`lease_identity`]): one lease per
/// slice, shared by both concurrent Review legs, translated back at the
/// `reclaim_lease` seam.
pub fn session_claimant(packet_id: &str, provider: &str) -> String {
    let provider = provider.trim();
    let provider = if provider.is_empty() || provider.contains(':') {
        "forged"
    } else {
        provider
    };
    format!("{provider}:{packet_id}:{}", std::process::id())
}

/// The packet id carried by a [`session_claimant`], when the string is one:
/// the middle segment of `<provider>:<packet-id>:<pid>`. A run-scoped lease
/// holder yields its run id here, which is not a packet id — callers that
/// need a packet must parse it with [`split_packet_id`], which refuses
/// anything without all three packet segments.
pub fn packet_of_session(session: &str) -> Option<&str> {
    let (_provider, rest) = session.split_once(':')?;
    let (packet_id, pid) = rest.rsplit_once(':')?;
    pid.parse::<u32>().ok()?;
    (!packet_id.is_empty()).then_some(packet_id)
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
        "definition_validate" => ops::definition_validate(ctx, &req).await,
        "run_start" => ops::run_start(ctx, &mut req).await,
        "run_advance" => drive::run_advance(ctx, &req).await,
        "run_drive" => drive::run_drive(ctx, &req).await,
        "run_status" => ops::run_status(ctx, &req).await,
        "run_revise_roster" => ops::run_revise_roster(ctx, &mut req).await,
        "epic_start" => epic::epic_start(ctx, &mut req).await,
        "epic_advance" => epic::epic_advance(ctx, &req).await,
        "epic_drive" => epic::epic_drive(ctx, &req).await,
        "epic_status" => epic::epic_status(ctx, &req).await,
        "epic_pause" => epic::epic_pause(ctx, &mut req).await,
        "epic_resume" => epic::epic_resume(ctx, &mut req).await,
        "epic_resolve" => epic::epic_resolve(ctx, &mut req).await,
        "overview" => observe::overview(ctx, &req).await,
        "packet_show" => ops::packet_show(ctx, &req).await,
        "packet_claim" => ops::packet_claim(ctx, &mut req).await,
        "packet_complete" => ops::packet_complete(ctx, &mut req).await,
        "packet_fail" => ops::packet_fail(ctx, &mut req).await,
        "packet_heartbeat" => ops::packet_heartbeat(ctx, &req).await,
        "session_list" => sessions::session_list(ctx, &req).await,
        "session_read" => sessions::session_read(ctx, &req).await,
        "session_message" => sessions::session_message(ctx, &mut req).await,
        "session_stop" => sessions::session_stop(ctx, &mut req).await,
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

/// A reconcile pass's own idempotency key: the run's derived key plus a
/// fresh nonce, so no two invocations ever collide.
///
/// Reconcile is the one command that must not be replay-protected by its
/// key. It is observational and idempotent — it settles OTHER operations and
/// owns no effect a redo could double — and its wrapper row is deliberately
/// run-UNSCOPED, so the pass cannot release its own row and no later
/// run-scoped pass can see it. An invocation interrupted after
/// `op.begin.after` therefore leaves an `in_progress` row forever; reusing
/// the key would wedge every subsequent reconcile of that run on
/// `OPERATION_IN_PROGRESS`. A per-invocation nonce is the whole fix
/// (operator adjudication, 2026-08-12: reconcile needs no replay
/// protection).
pub fn reconcile_key(run_id: &str) -> String {
    format!("op:reconcile:{run_id}:-:{}", uuid::Uuid::now_v7())
}
