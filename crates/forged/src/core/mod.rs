//! The shared core both surfaces call: one function per command, each
//! taking an [`OperationRequest`] and returning an [`OperationResponse`].
//! The core layer never knows whether it was reached from clap or rmcp —
//! that is what makes the CLI/MCP parity criterion achievable rather than a
//! coincidence.

pub(crate) mod admission;
pub(crate) mod artifacts;
pub(crate) mod attention;
mod claimnext;
mod drive;
mod epic;
pub(crate) mod handoff;
pub(crate) mod health;
pub(crate) mod herdr_layout;
pub(crate) mod herdr_ownership;
pub(crate) mod herdr_projection;
mod history;
pub(crate) mod lifecycle;
mod observe;
mod ops;
mod ore;
mod review;
mod session_inventory;
pub(crate) mod sessions;
pub(crate) mod settlement;
pub(crate) mod spec;
mod supervise;
pub(crate) mod usage;
pub(crate) mod work_identity;
mod work_import;
mod work_map;
mod work_ops;
mod work_settlement;
pub(crate) mod work_types;
pub(crate) mod workstore;

use forged_ledger::{DesiredSubjectKind, EffectClass, Ledger, LedgerError, OperationOutcome};
use forged_proto::{PortError, ProtoError};
use forged_types::{
    ErrorCode, OpError, OperationActionV1, OperationRequest, OperationResponse, RemedyV1,
};
use serde_json::{Map, Value};

use crate::config::ForgedConfig;
use crate::failpoint;

/// Everything a core function needs: the once-read config and the open
/// ledger.
pub struct Ctx {
    /// The config snapshot this dispatch serves. Single-shot CLI processes
    /// read it once; the long-lived surfaces (MCP mount, supervise loop)
    /// rebuild the snapshot when the config file changes on disk.
    pub config: ForgedConfig,
    /// The open ledger (a cloneable handle to the writer thread).
    pub ledger: Ledger,
}

/// Publish the real detached driver identity before it opens runtime state.
pub(crate) async fn record_controller_identity_from_env() -> Result<(), String> {
    handoff::record_driver_identity_from_env().await
}

/// Hold a newly detached controller behind the exact desired-work generation
/// that its submitter commits only after the child identity is durable.
pub(crate) async fn await_controller_authorization_from_env(ctx: &Ctx) -> Result<(), Failure> {
    handoff::await_controller_authorization_from_env(ctx).await
}

/// Upgrade durable state that predates frozen execution policy.
///
/// This is the sole compatibility boundary for definition-backed runs and
/// epics: once it returns, their projections consume only complete packages.
/// Definition-less v0 runs retain their older compatibility projection.
pub async fn migrate_legacy_state(ctx: &Ctx) -> Result<(), Failure> {
    let policy = ctx.config.execution_policy().map_err(|errors| {
        Failure::invalid(format!(
            "execution policy is invalid: {}",
            serde_json::to_string(&errors).unwrap_or_default()
        ))
    })?;
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.migrate_legacy_execution_packages(policy)
    })
    .await?;
    epic::migrate_legacy_epics(ctx).await?;
    Ok(())
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
            ErrorCode::OperationInProgress | ErrorCode::WorkContention
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
            ProtoError::Port {
                source: PortError::Gh(message),
                ..
            } => gh_failure(message),
            other => Failure::internal(other.to_string()),
        }
    }
}

impl From<PortError> for Failure {
    fn from(err: PortError) -> Self {
        match err {
            PortError::Gh(message) => gh_failure(message),
            other => Failure::internal(other.to_string()),
        }
    }
}

impl From<forged_beads::BdError> for Failure {
    fn from(err: forged_beads::BdError) -> Self {
        let code = ErrorCode::WorkError;
        Failure {
            code,
            message: err.to_string(),
            recoverable: matches!(code, ErrorCode::WorkContention),
        }
    }
}

fn contains_any(message: &str, patterns: &[&str]) -> bool {
    patterns.iter().any(|pattern| message.contains(pattern))
}

fn contains_status_in(message: &str, statuses: std::ops::RangeInclusive<u16>) -> bool {
    let mut previous = ["", ""];
    for token in message.split(|character: char| !character.is_ascii_alphanumeric()) {
        if !token.is_empty()
            && previous.iter().any(|context| {
                matches!(
                    *context,
                    "http" | "status" | "code" | "response" | "returned"
                )
            })
            && token
                .parse::<u16>()
                .is_ok_and(|status| statuses.contains(&status))
        {
            return true;
        }
        if !token.is_empty() {
            previous = [previous[1], token];
        }
    }
    false
}

fn transient_io(error: &std::io::Error) -> bool {
    matches!(
        error.kind(),
        std::io::ErrorKind::BrokenPipe
            | std::io::ErrorKind::ConnectionAborted
            | std::io::ErrorKind::ConnectionRefused
            | std::io::ErrorKind::ConnectionReset
            | std::io::ErrorKind::HostUnreachable
            | std::io::ErrorKind::Interrupted
            | std::io::ErrorKind::NetworkUnreachable
            | std::io::ErrorKind::NotConnected
            | std::io::ErrorKind::ResourceBusy
            | std::io::ErrorKind::TimedOut
            | std::io::ErrorKind::UnexpectedEof
            | std::io::ErrorKind::WouldBlock
    )
}

fn transport_message_recoverable(message: &str) -> bool {
    contains_status_in(message, 500..=599)
        || contains_any(
            message,
            &[
                "bad gateway",
                "connection aborted",
                "connection closed",
                "connection refused",
                "connection reset",
                "context deadline exceeded",
                "could not resolve host",
                "dns lookup",
                "dns resolution",
                "error connecting",
                "failed to connect",
                "gateway timeout",
                "http/2 stream",
                "i/o timeout",
                "internal server error",
                "internet connection",
                "name or service not known",
                "network is unreachable",
                "network unreachable",
                "no route to host",
                "no such host",
                "operation timed out",
                "request timed out",
                "service unavailable",
                "ssl_error_syscall",
                "ssl handshake",
                "temporary failure in name resolution",
                "timed out",
                "timeout",
                "tls connection",
                "tls handshake",
                "unexpected eof",
            ],
        )
}

fn gh_message_recoverable(message: &str) -> bool {
    let message = message.to_ascii_lowercase();
    if contains_status_in(&message, 429..=429)
        || contains_any(&message, &["rate limit", "too many requests"])
    {
        return true;
    }
    if contains_status_in(&message, 401..=401)
        || contains_status_in(&message, 403..=404)
        || contains_status_in(&message, 422..=422)
        || contains_any(
            &message,
            &[
                "authentication",
                "authorization",
                "forbidden",
                "invalid request",
                "invalid value",
                "permission denied",
                "repository not found",
                "resource not found",
                "unauthorized",
                "unprocessable entity",
                "validation error",
                "validation failed",
            ],
        )
    {
        return false;
    }
    transport_message_recoverable(&message)
}

fn gh_error_recoverable(error: &forged_git::GhError) -> bool {
    match error {
        forged_git::GhError::Exec {
            status: Some(4), ..
        }
        | forged_git::GhError::Json { .. }
        | forged_git::GhError::NotFound
        | forged_git::GhError::Auth => false,
        forged_git::GhError::Exec { stderr, .. } => gh_message_recoverable(stderr),
    }
}

fn git_error_recoverable(error: &forged_git::GitError) -> bool {
    match error {
        forged_git::GitError::Gh(error) => gh_error_recoverable(error),
        forged_git::GitError::Exec { stderr, .. } => {
            let message = stderr.to_ascii_lowercase();
            if contains_status_in(&message, 401..=404)
                || contains_status_in(&message, 422..=422)
                || contains_any(
                    &message,
                    &[
                        "[rejected]",
                        "access denied",
                        "authentication failed",
                        "base branch not found",
                        "base sha mismatch",
                        "conflict",
                        "could not read username",
                        "fetch first",
                        "non-fast-forward",
                        "permission denied",
                        "pr base mismatch",
                        "remote rejected",
                        "repository not found",
                        "src refspec",
                        "stale info",
                    ],
                )
            {
                return false;
            }
            transport_message_recoverable(&message)
                || contains_any(
                    &message,
                    &[
                        "could not read from remote repository",
                        "early eof",
                        "remote end hung up unexpectedly",
                        "rpc failed",
                    ],
                )
        }
        forged_git::GitError::Io(error) => transient_io(error),
        forged_git::GitError::WorktreeExists { .. }
        | forged_git::GitError::WorktreeDirty { .. }
        | forged_git::GitError::WorktreeUnresolved { .. }
        | forged_git::GitError::BaseNotFound { .. }
        | forged_git::GitError::BaseShaMismatch { .. }
        | forged_git::GitError::PrBaseMismatch { .. }
        | forged_git::GitError::DefaultBranchForbidden { .. }
        | forged_git::GitError::PrNotMergeable { .. }
        | forged_git::GitError::InvalidRunId(_)
        | forged_git::GitError::InvalidPath { .. } => false,
    }
}

fn gate_error_recoverable(error: &forged_gate::GateError) -> bool {
    match error {
        forged_gate::GateError::Spawn { source, .. } => transient_io(source),
        forged_gate::GateError::Io(_) => true,
        forged_gate::GateError::InvalidRequest { .. }
        | forged_gate::GateError::ArtifactsDir { .. } => false,
    }
}

fn provider_error_recoverable(error: &forged_provider::ProviderError) -> bool {
    match error {
        forged_provider::ProviderError::Io(error) => transient_io(error),
        forged_provider::ProviderError::UnsafePath { .. }
        | forged_provider::ProviderError::UnsafeShellLine { .. }
        | forged_provider::ProviderError::UnsupportedEffort { .. }
        | forged_provider::ProviderError::Malformed { .. }
        | forged_provider::ProviderError::RolloutNotFound { .. } => false,
    }
}

fn gh_failure(message: String) -> Failure {
    let recoverable = gh_message_recoverable(&message);
    Failure {
        code: ErrorCode::GhError,
        message,
        recoverable,
    }
}

impl From<forged_git::GitError> for Failure {
    fn from(err: forged_git::GitError) -> Self {
        let recoverable = git_error_recoverable(&err);
        Failure {
            code: err.code(),
            message: err.to_string(),
            recoverable,
        }
    }
}

impl From<forged_git::GhError> for Failure {
    fn from(err: forged_git::GhError) -> Self {
        let recoverable = gh_error_recoverable(&err);
        Failure {
            code: ErrorCode::GhError,
            message: err.to_string(),
            recoverable,
        }
    }
}

impl From<forged_gate::GateError> for Failure {
    fn from(err: forged_gate::GateError) -> Self {
        let recoverable = gate_error_recoverable(&err);
        Failure {
            code: err.code(),
            message: err.to_string(),
            recoverable,
        }
    }
}

impl From<forged_provider::ProviderError> for Failure {
    fn from(err: forged_provider::ProviderError) -> Self {
        let recoverable = provider_error_recoverable(&err);
        Failure {
            code: err.wire_code(),
            message: err.to_string(),
            recoverable,
        }
    }
}

impl From<forged_host::HostError> for Failure {
    fn from(err: forged_host::HostError) -> Self {
        // SessionNotFound retains INVALID_REQUEST on the public wire for
        // compatibility, but it names mutable host-instance state rather
        // than controller-local configuration truth. Preserve that source
        // distinction before the drive loop records its terminal envelope,
        // so supervision spends the bounded restart budget instead of
        // halting permanently after one host-session loss.
        let recoverable = matches!(&err, forged_host::HostError::SessionNotFound { .. });
        Failure {
            code: err.wire_code(),
            message: err.to_string(),
            recoverable,
        }
    }
}

#[cfg(test)]
mod failure_tests {
    use super::Failure;
    use forged_gate::GateError;
    use forged_git::{GhError, GitError};
    use forged_host::HostError;
    use forged_proto::{PortError, ProtoError};
    use forged_provider::ProviderError;
    use forged_types::ErrorCode;

    fn gh_exec(stderr: &str) -> GhError {
        GhError::Exec {
            status: Some(1),
            stderr: stderr.to_owned(),
        }
    }

    fn git_exec(stderr: &str) -> GitError {
        GitError::Exec {
            command: "git push origin topic".to_owned(),
            stderr: stderr.to_owned(),
        }
    }

    #[test]
    fn gh_502_timeout_and_connection_evidence_are_recoverable() {
        let cases = [
            ("http 502", "HTTP 502: Bad Gateway"),
            ("returned 502", "The requested URL returned error: 502"),
            ("timeout", "request timeout awaiting response headers"),
            ("connection", "connection reset by peer"),
        ];

        for (evidence, stderr) in cases {
            let failure = Failure::from(gh_exec(stderr));
            assert_eq!(failure.code, ErrorCode::GhError, "{evidence}");
            assert!(failure.recoverable, "{evidence}: {failure}");
        }
    }

    #[test]
    fn gh_dns_tls_and_rate_limit_evidence_are_recoverable() {
        let cases = [
            ("dns", "temporary failure in name resolution"),
            ("tls", "TLS handshake timed out"),
            (
                "rate limit",
                "HTTP 403: API rate limit exceeded; retry later",
            ),
        ];

        for (evidence, stderr) in cases {
            let failure = Failure::from(gh_exec(stderr));
            assert!(failure.recoverable, "{evidence}: {failure}");
        }
    }

    #[test]
    fn gh_auth_not_found_and_validation_evidence_are_not_recoverable() {
        let cases = [
            ("auth variant", GhError::Auth),
            ("named resource 404", GhError::NotFound),
            (
                "validation",
                gh_exec("HTTP 422: validation failed: timeout is invalid"),
            ),
            ("403 auth class", gh_exec("HTTP 403: Forbidden")),
        ];

        for (evidence, error) in cases {
            let failure = Failure::from(error);
            assert!(!failure.recoverable, "{evidence}: {failure}");
        }
    }

    #[test]
    fn gh_unrecognized_message_defaults_to_not_recoverable() {
        let failure = Failure::from(gh_exec("quantum relay desynchronized"));

        assert_eq!(failure.code, ErrorCode::GhError);
        assert!(!failure.recoverable);
    }

    #[test]
    fn proto_port_gh_transport_evidence_is_recoverable() {
        let failure = Failure::from(ProtoError::Port {
            attempt_id: 17,
            step: "pr_for_head".to_owned(),
            source: PortError::Gh("gh failed: HTTP 503 Service Unavailable".to_owned()),
        });

        assert_eq!(failure.code, ErrorCode::GhError);
        assert_eq!(failure.message, "gh failed: HTTP 503 Service Unavailable");
        assert!(failure.recoverable);
    }

    #[test]
    fn git_transport_signatures_are_recoverable() {
        let cases = [
            ("connection", "fatal: connection refused"),
            (
                "remote read",
                "fatal: Could not read from remote repository.",
            ),
            ("early eof", "fatal: early EOF"),
        ];

        for (evidence, stderr) in cases {
            let failure = Failure::from(git_exec(stderr));
            assert!(failure.recoverable, "{evidence}: {failure}");
        }
    }

    #[test]
    fn git_auth_ref_and_conflict_evidence_are_not_recoverable() {
        let cases = [
            (
                "auth",
                "Permission denied (publickey). Could not read from remote repository.",
            ),
            (
                "non-fast-forward",
                "[rejected] topic -> topic (non-fast-forward)",
            ),
            (
                "conflict",
                "CONFLICT (content): Merge conflict in src/lib.rs",
            ),
        ];

        for (evidence, stderr) in cases {
            let failure = Failure::from(git_exec(stderr));
            assert!(!failure.recoverable, "{evidence}: {failure}");
        }

        let base_mismatch = Failure::from(GitError::BaseShaMismatch {
            expected: "aaa".to_owned(),
            actual: "bbb".to_owned(),
        });
        assert!(!base_mismatch.recoverable, "structured base mismatch");
    }

    #[test]
    fn git_transient_io_and_nested_gh_transport_are_recoverable() {
        let io = Failure::from(GitError::Io(std::io::Error::from(
            std::io::ErrorKind::ConnectionReset,
        )));
        assert!(io.recoverable, "connection-reset io");

        let gh = Failure::from(GitError::Gh(gh_exec("HTTP 504 Gateway Timeout")));
        assert!(gh.recoverable, "nested gh transport");

        let permission = Failure::from(GitError::Io(std::io::Error::from(
            std::io::ErrorKind::PermissionDenied,
        )));
        assert!(!permission.recoverable, "permission-denied io");
    }

    #[test]
    fn gate_transient_spawn_and_io_evidence_are_recoverable() {
        let spawn = Failure::from(GateError::Spawn {
            command: "cargo test".to_owned(),
            source: std::io::Error::from(std::io::ErrorKind::WouldBlock),
        });
        assert!(spawn.recoverable, "spawn would-block");

        let io = Failure::from(GateError::Io(std::io::Error::other(
            "child wait unresolved after spawn",
        )));
        assert!(io.recoverable, "structured post-spawn io");
    }

    #[test]
    fn gate_missing_binary_and_invalid_request_are_not_recoverable() {
        let missing = Failure::from(GateError::Spawn {
            command: "missing-gate".to_owned(),
            source: std::io::Error::from(std::io::ErrorKind::NotFound),
        });
        assert!(!missing.recoverable, "missing binary");

        let invalid = Failure::from(GateError::InvalidRequest {
            message: "commands must not be empty".to_owned(),
        });
        assert!(!invalid.recoverable, "invalid gate request");
    }

    #[test]
    fn provider_transient_io_is_recoverable_but_config_refusal_is_not() {
        let io = Failure::from(ProviderError::Io(std::io::Error::from(
            std::io::ErrorKind::Interrupted,
        )));
        assert!(io.recoverable, "interrupted provider io");

        let missing = Failure::from(ProviderError::Io(std::io::Error::from(
            std::io::ErrorKind::NotFound,
        )));
        assert!(!missing.recoverable, "missing provider path or binary");

        let bad_flag = Failure::from(ProviderError::UnsupportedEffort {
            effort: "not valid".to_owned(),
        });
        assert!(!bad_flag.recoverable, "bad provider flag");
    }

    #[test]
    fn host_session_loss_is_recoverable_despite_invalid_request_wire_code() {
        let failure = Failure::from(HostError::SessionNotFound {
            id: "pane-session-1".to_owned(),
        });

        assert_eq!(failure.code, ErrorCode::InvalidRequest);
        assert!(failure.recoverable);
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

/// Strict optional string read: absent and null read as `None`, an empty
/// string reads as `None` (the MCP boundary's "unset"), and any OTHER type
/// refuses — a present-but-malformed value must never silently take a
/// default that mutates durable state.
pub fn param_opt_str_strict<'p>(
    params: &'p Map<String, Value>,
    key: &str,
) -> Result<Option<&'p str>, Failure> {
    match params.get(key) {
        None | Some(Value::Null) => Ok(None),
        Some(Value::String(text)) if text.is_empty() => Ok(None),
        Some(Value::String(text)) => Ok(Some(text)),
        Some(other) => Err(Failure::invalid(format!(
            "{key} must be a string, got {other}"
        ))),
    }
}

/// Strict optional integer read, same contract as
/// [`param_opt_str_strict`]: absent/null is `None`, an integer is itself,
/// anything else refuses.
pub fn param_opt_i64_strict(
    params: &Map<String, Value>,
    key: &str,
) -> Result<Option<i64>, Failure> {
    match params.get(key) {
        None | Some(Value::Null) => Ok(None),
        Some(Value::Number(number)) => number
            .as_i64()
            .map(Some)
            .ok_or_else(|| Failure::invalid(format!("{key} must be an integer, got {number}"))),
        Some(other) => Err(Failure::invalid(format!(
            "{key} must be an integer, got {other}"
        ))),
    }
}

/// Read an optional string param that must NAME something: a
/// whitespace-only value reads as absent, matching the MCP boundary's
/// `named_string` refusal so both surfaces agree on what counts as a name.
pub fn param_named_str<'p>(params: &'p Map<String, Value>, key: &str) -> Option<&'p str> {
    params
        .get(key)
        .and_then(Value::as_str)
        .filter(|s| !s.trim().is_empty())
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

/// The pre-run work lease identity: the actor a FRESH frontier claim in
/// `claim-next` is taken under.
///
/// `bd ready --claim --actor <holder>` demands its actor BEFORE it says
/// which work it handed over, so at that moment no run exists to derive
/// [`run_holder`] from. Claiming under the operator's `--holder` instead
/// wedges the driver against its own lease minutes later, when `run drive`'s
/// Resolve claims the same work under the identity it derives: bd 1.2.1
/// refuses a claim by any other actor outright ("issue already claimed by
/// …", exit 1 — probe-verified). This constant is that pre-run identity, and
/// Resolve adopts it verbatim for the run minted from the work, so
/// claim-next → run start → run drive share ONE lease identity end to end
/// (operator adjudication, 2026-08-12).
pub const FRONTIER_HOLDER: &str = "forged:frontier:0";

/// The driver's derived lease-holder id for a Work execution chain: seam contract 5's
/// `<provider>:<session-or-host>:<pid>` shape, filled with what a LEASE can
/// honestly carry — `forged` (the DRIVER claims the work, not the model
/// vendor: one run drives both provider families under this one lease), the
/// Work as the session ref, and a fixed `0` pid segment. Child run generations
/// deliberately share this identity: the Work owns one lease while each
/// generation keeps independent run, branch, packet, and controller state.
///
/// The fixed pid is load-bearing, not laziness. The lease must resolve to
/// the same string in every process that touches it — the driver that took
/// it, a restarted driver, a reconciler in a third process — or a scoped
/// reclaim names the wrong previous owner and a re-claim is refused as
/// theft. A live pid here would make each of those derive a different
/// holder. Real per-process, per-attempt identity — a real provider and a
/// real pid — is [`session_claimant`], which is STORED on the attempt row
/// rather than re-derived, and so can carry values only one process knows.
pub fn run_holder(work_id: &str) -> String {
    format!("forged:{work_id}:0")
}

/// The work lease identity in force for a run: the holder forged already has
/// the work under when that holder is one of ours — [`FRONTIER_HOLDER`] from
/// a fresh `claim-next` claim, or this run's derived [`run_holder`] from an
/// earlier pass — else the derived holder.
///
/// Every consumer of the run's lease (Resolve's claim, the attempt
/// heartbeat's renewal, claim-next's scoped reclaim, the `reclaim_lease`
/// port) reads
/// the identity here rather than deriving a second, differing one, which is
/// what makes the chain unwedgeable against itself. A holder this driver
/// could not have taken is deliberately NOT adopted: the derived holder is
/// returned, the claim is refused, and another worker's live lease stands.
pub async fn lease_identity(ledger: &Ledger, work: &str, _run_id: &str) -> Result<String, Failure> {
    let derived = run_holder(work);
    let current = workstore::lease_holder(ledger, work).await?;
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
/// to exactly one attempt-addressed runtime directory — which makes `liveness` and
/// `kill_confirmed` per-attempt instead of an aggregate over every leg
/// sharing the run's lease. Being stored rather than re-derived is what lets
/// it carry a real pid: no other process has to reproduce the string, only
/// read it back from the row.
///
/// The work lease holder stays the run's ([`lease_identity`]): one lease per
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

/// Fail a just-claimed attempt under its own claim token, then hand its
/// failure back for the caller to propagate.
///
/// The attempt is `running` with no process behind it, and every claim path
/// that can still fail before it spawns one owes the ledger this. Left
/// running, the row blocks both the re-claim and the re-pin that would clear
/// the cause, and the reclaim saga has to time out a lease that no process
/// is renewing.
///
/// The note is classified `unspawned:`, never left to classify as semantic:
/// no provider existed for this attempt, so it is not the stage's answer.
/// A plain note would be merged into a review fan-out as `RequestChanges`
/// and would spend a remediation round — see `settle_unspawned`, which
/// this shares its settlement with.
///
/// The ORIGINAL failure is what comes back — a ledger error while settling is
/// logged, not substituted, because the cause is what the caller needs to
/// report and the saga remains the backstop for the row.
pub async fn abandon_claim(
    ctx: &Ctx,
    packet_id: &str,
    claim_token: &str,
    failure: Failure,
) -> Failure {
    let note = format!("unspawned: attempt refused before spawn: {failure}");
    if let Err(error) =
        crate::adapters::execute::fail_and_grant_retry(ctx, packet_id, claim_token, note).await
    {
        tracing::warn!(packet_id, %error, "could not retire an unspawned attempt");
    }
    failure
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

/// Build a refusal carrying one honesty-tested structured remedy.
pub(crate) fn remedy_response(
    operation_id: &str,
    failure: &Failure,
    remedy: RemedyV1,
) -> OperationResponse {
    OperationResponse {
        ok: false,
        operation_id: operation_id.to_owned(),
        reused: false,
        result: None,
        error: Some(OpError {
            code: failure.code,
            message: failure.message.clone(),
            recoverable: failure.recoverable,
            detail: Some(serde_json::to_value(remedy).expect("forged.remedy/1 always serializes")),
        }),
    }
}

/// The one operator action for a terminal run that cannot be rewritten.
pub(crate) fn work_supersede_action(work_id: &str) -> OperationActionV1 {
    let Value::Object(args) = serde_json::json!({"id": work_id, "successor": null}) else {
        unreachable!("work supersede remedy args are an object")
    };
    OperationActionV1 {
        verb: "work supersede".to_owned(),
        args,
        reason: "create the successor first with work create".to_owned(),
        class: forged_types::ActionClass::Can,
    }
}

/// Whether the request supplied no idempotency key (the surface adapters
/// pass an empty string for "absent"; `--idempotency-key` always fills it).
pub fn key_absent(req: &OperationRequest) -> bool {
    req.idempotency_key.is_empty()
}

/// Validate `schemaVersion == 1` for read paths (mutating paths get the
/// same check from `begin_operation`).
pub(crate) fn check_schema_version(req: &OperationRequest) -> Result<(), Failure> {
    if req.schema_version != 1 {
        return Err(Failure::invalid(format!(
            "unsupported schemaVersion {}",
            req.schema_version
        )));
    }
    Ok(())
}

async fn unfenced<F, Fut>(name: &str, req: &OperationRequest, effect: F) -> OperationResponse
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

/// Run a genuine read: the same envelope in, an envelope out, with neither
/// the operation store nor domain state touched. An absent key defaults to
/// `op:<name>:read`, echoed as `operationId` with `reused: false`.
pub async fn read_only<F, Fut>(name: &str, req: &OperationRequest, effect: F) -> OperationResponse
where
    F: FnOnce() -> Fut,
    Fut: std::future::Future<Output = CoreResult>,
{
    unfenced(name, req, effect).await
}

/// Run a deliberately unfenced domain write. These writes rely on their own
/// storage-level identity rather than the operation store, while retaining
/// the same request validation and response shape as unfenced reads.
pub async fn unfenced_write<F, Fut>(
    name: &str,
    req: &OperationRequest,
    effect: F,
) -> OperationResponse
where
    F: FnOnce() -> Fut,
    Fut: std::future::Future<Output = CoreResult>,
{
    unfenced(name, req, effect).await
}

#[cfg(test)]
mod unfenced_audit_tests {
    use std::path::Path;

    fn operation_names(root: &Path, needle: &str, names: &mut Vec<String>) {
        for entry in std::fs::read_dir(root).expect("read core source directory") {
            let path = entry.expect("core source entry").path();
            if path.is_dir() {
                operation_names(&path, needle, names);
            } else if path.extension().and_then(|value| value.to_str()) == Some("rs") {
                let source = std::fs::read_to_string(&path).expect("read core source");
                for line in source.lines() {
                    if let Some(rest) = line.split_once(needle).map(|(_, rest)| rest) {
                        if let Some(name) = rest.split('"').next().filter(|name| !name.is_empty()) {
                            names.push(name.to_owned());
                        }
                    }
                }
            }
        }
    }

    #[test]
    fn unfenced_write_tenants_are_explicit_and_read_only_names_only_reads() {
        let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("src/core");
        let unfenced_needle = ["unfenced", "_write(\""].concat();
        let read_needle = ["read", "_only(\""].concat();
        let mut writes = Vec::new();
        let mut reads = Vec::new();
        operation_names(&root, &unfenced_needle, &mut writes);
        operation_names(&root, &read_needle, &mut reads);
        writes.sort();

        assert_eq!(
            writes,
            ["packet_heartbeat", "usage_ingest", "work_import_beads"]
        );
        for tenant in &writes {
            assert!(
                !reads.contains(tenant),
                "unfenced writer {tenant} is mislabeled read_only"
            );
        }
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

#[derive(Clone, Copy)]
enum FenceAdmission<'a> {
    Ordinary(Option<&'a str>),
    Machine(Option<u32>),
}

/// A successful effect whose operation response and desired-work
/// authorization must commit in one ledger transaction.
#[derive(Clone)]
pub(crate) struct DesiredAuthorization {
    pub(crate) kind: DesiredSubjectKind,
    pub(crate) id: String,
    pub(crate) generation: u32,
    pub(crate) queued_until: Option<String>,
    pub(crate) admission_reason: Option<String>,
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
    fenced_inner(
        ctx,
        name,
        class,
        req,
        FenceAdmission::Ordinary(assert_token),
        move |operation_id| async move {
            let result = effect(operation_id).await?;
            Ok((result, None))
        },
    )
    .await
}

/// Fence a detached controller's machine effect against whole-run
/// settlement. The generation check and operation reservation are one
/// ledger transaction; settlement kills the generation if reservation wins.
pub(crate) async fn fenced_machine<F, Fut>(
    ctx: &Ctx,
    name: &str,
    class: EffectClass,
    req: &OperationRequest,
    generation: Option<u32>,
    effect: F,
) -> OperationResponse
where
    F: FnOnce(String) -> Fut,
    Fut: std::future::Future<Output = CoreResult>,
{
    fenced_inner(
        ctx,
        name,
        class,
        req,
        FenceAdmission::Machine(generation),
        move |operation_id| async move {
            let result = effect(operation_id).await?;
            Ok((result, None))
        },
    )
    .await
}

/// Fence one submit effect and atomically authorize the spawned controller
/// when its successful response is sealed. A failed effect never creates a
/// runnable desired-work record.
pub(crate) async fn fenced_authorizing_desired<F, Fut>(
    ctx: &Ctx,
    name: &str,
    class: EffectClass,
    req: &OperationRequest,
    authorization: DesiredAuthorization,
    effect: F,
) -> OperationResponse
where
    F: FnOnce(String) -> Fut,
    Fut: std::future::Future<Output = CoreResult>,
{
    fenced_inner(
        ctx,
        name,
        class,
        req,
        FenceAdmission::Ordinary(None),
        move |operation_id| async move {
            let result = effect(operation_id).await?;
            Ok((result, Some(authorization)))
        },
    )
    .await
}

/// Fence an effect whose successful execution determines its desired-work
/// authorization. The operation response and fresh restart budget become
/// durable in the same ledger transaction.
pub(crate) async fn fenced_dynamic_authorizing_desired<F, Fut>(
    ctx: &Ctx,
    name: &str,
    class: EffectClass,
    req: &OperationRequest,
    effect: F,
) -> OperationResponse
where
    F: FnOnce(String) -> Fut,
    Fut: std::future::Future<Output = Result<(Value, DesiredAuthorization), Failure>>,
{
    fenced_inner(
        ctx,
        name,
        class,
        req,
        FenceAdmission::Ordinary(None),
        move |operation_id| async move {
            let (result, authorization) = effect(operation_id).await?;
            Ok((result, Some(authorization)))
        },
    )
    .await
}

async fn fenced_inner<F, Fut>(
    ctx: &Ctx,
    name: &str,
    class: EffectClass,
    req: &OperationRequest,
    admission: FenceAdmission<'_>,
    effect: F,
) -> OperationResponse
where
    F: FnOnce(String) -> Fut,
    Fut: std::future::Future<Output = Result<(Value, Option<DesiredAuthorization>), Failure>>,
{
    let key = req.idempotency_key.clone();
    let request = req.clone();
    let machine = matches!(admission, FenceAdmission::Machine(_));
    let assert_token = match admission {
        FenceAdmission::Ordinary(token) => token.map(str::to_owned),
        FenceAdmission::Machine(_) => None,
    };
    let controller_generation = match admission {
        FenceAdmission::Ordinary(_) => None,
        FenceAdmission::Machine(generation) => generation,
    };

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
        let token = assert_token.clone();
        on_ledger(&ctx.ledger, move |l| {
            if machine {
                l.begin_machine_operation(&name, &request, class, controller_generation)
            } else {
                l.begin_operation(&name, &request, class, token.as_deref())
            }
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
        if let Err(f) = on_ledger(&ctx.ledger, move |l| l.assert_attempt_live(&token)).await {
            release_if(ctx, OnEffectError::for_class(class), &operation_id).await;
            return err_response(&operation_id, &f);
        }
    }

    match effect(operation_id.clone()).await {
        Ok((result, desired_authorization)) => {
            let resp = ok_response(&operation_id, false, result);
            if desired_authorization.is_some() {
                failpoint::hit("submit.desired.before");
            }
            let store = {
                let operation_id = operation_id.clone();
                let resp = resp.clone();
                let authorization = desired_authorization.clone();
                on_ledger(&ctx.ledger, move |l| match authorization {
                    Some(authorization) => l.complete_operation_authorizing_desired_with_admission(
                        &operation_id,
                        &resp,
                        authorization.kind,
                        &authorization.id,
                        authorization.generation,
                        authorization.queued_until,
                        authorization.admission_reason,
                    ),
                    None => l.complete_operation(&operation_id, &resp),
                })
                .await
            };
            if desired_authorization.is_some() {
                failpoint::hit("submit.desired.after");
            }
            match store {
                Ok(()) => resp,
                Err(f) => err_response(&operation_id, &f),
            }
        }
        Err(f) => {
            release_if(ctx, OnEffectError::for_class(class), &operation_id).await;
            ops::run_start_failure_response(name, &request, &operation_id, &f)
                .unwrap_or_else(|| err_response(&operation_id, &f))
        }
    }
}

async fn release_if(ctx: &Ctx, on_error: OnEffectError, operation_id: &str) {
    if on_error == OnEffectError::Release {
        let operation_id = operation_id.to_owned();
        let _ = on_ledger(&ctx.ledger, move |l| l.release_operation(&operation_id)).await;
    }
}

/// The released-retry sequence segment for a subject-scoped default key. A
/// release frees the operations row while its `proto.operation.request`
/// event survives, so a default key that never varies would let a corrected
/// retry append a second, differing request payload under the released key —
/// the exact ambiguity the pre-record probe exists to refuse. Every retry
/// after a DERIVED-key release advances to that release count, so a derived
/// key carries at most one payload across releases, not only across live
/// rows. Only the derived series counts: an explicitly keyed attempt that
/// releases occupies its own key, and letting it advance this epoch would
/// strand a terminal derived-key success behind a key that no keyless
/// replay derives again. `None` is the historical bare `-` segment, keeping
/// first-start keys byte-identical to every ledger written before this
/// fence.
pub(crate) async fn released_retry_seq(
    ctx: &Ctx,
    subject: &str,
    name: &str,
) -> Result<Option<i64>, Failure> {
    released_retry_seq_staged(ctx, subject, name, None).await
}

/// As [`released_retry_seq`], but for a key series whose stage segment is
/// not `-` (the abandon-epoch'd `epic_start` series).
pub(crate) async fn released_retry_seq_staged(
    ctx: &Ctx,
    subject: &str,
    name: &str,
    stage: Option<&str>,
) -> Result<Option<i64>, Failure> {
    let owned_subject = subject.to_owned();
    let rows = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_events(Some(&owned_subject), 0, 65_536)
    })
    .await?;
    let series_prefix = format!("op:{name}:{subject}:{}:", stage.unwrap_or("-"));
    let released = rows
        .iter()
        .filter(|row| row.kind == "operation.released")
        .filter(|row| {
            serde_json::from_str::<Value>(&row.payload_json)
                .ok()
                .is_some_and(|payload| {
                    payload.get("name").and_then(Value::as_str) == Some(name)
                        && payload
                            .get("idempotencyKey")
                            .and_then(Value::as_str)
                            .is_some_and(|key| key.starts_with(&series_prefix))
                })
        })
        .count() as i64;
    Ok((released > 0).then_some(released))
}

/// Dispatch one named command to its core function. Both surfaces call
/// exactly this, so their envelopes are identical by construction.
pub async fn dispatch(ctx: &Ctx, name: &str, mut req: OperationRequest) -> OperationResponse {
    // The three explicit-key commands are refused before any defaulting.
    match name {
        "artifact_compact" | "claim_next" | "worktree_retire" if key_absent(&req) => {
            return err_response(
                &derive_key(name, req.run_id.as_deref(), None, None),
                &Failure::invalid(format!(
                    "{name} cannot derive a meaningful idempotency key; pass --idempotency-key"
                )),
            );
        }
        _ => {}
    }
    let mut response = match name {
        "doctor" => ops::doctor(ctx, &req).await,
        "init" => ops::init(ctx, &mut req).await,
        "definition_validate" => ops::definition_validate(ctx, &req).await,
        "run_start" => ops::run_start(ctx, &mut req).await,
        "run_retry" => ops::run_retry(ctx, &mut req).await,
        "run_advance" => drive::run_advance(ctx, &req).await,
        "run_drive" => drive::run_drive(ctx, &req).await,
        "run_submit" => handoff::run_submit(ctx, &mut req).await,
        "run_status" => ops::run_status(ctx, &req).await,
        "run_stop" => settlement::run_stop(ctx, &mut req).await,
        "run_adjudicate_settlement" => settlement::run_adjudicate_settlement(ctx, &mut req).await,
        "run_revise_roster" => ops::run_revise_roster(ctx, &mut req).await,
        "run_revise_policy" => ops::run_revise_policy(ctx, &mut req).await,
        "run_accept_risk" => ops::run_accept_risk(ctx, &mut req).await,
        "epic_preflight" => epic::epic_preflight(ctx, &req).await,
        "epic_start" => epic::epic_start(ctx, &mut req).await,
        "epic_submit" => handoff::epic_submit(ctx, &mut req).await,
        "epic_status" => epic::epic_status(ctx, &req).await,
        "epic_pause" => epic::epic_pause(ctx, &mut req).await,
        "epic_resume" => epic::epic_resume(ctx, &mut req).await,
        "epic_resolve" => epic::epic_resolve(ctx, &mut req).await,
        "epic_abandon" => epic::epic_abandon(ctx, &mut req).await,
        "epic_revise_roster" => epic::epic_revise_roster(ctx, &mut req).await,
        "epic_revise_policy" => epic::epic_revise_policy(ctx, &mut req).await,
        "overview" => observe::overview(ctx, &req).await,
        "explain" => observe::explain(ctx, &req).await,
        "next" => ops::next(ctx, &req).await,
        "operations_overview" => ops::operations_overview(ctx, &req).await,
        "work_detail" => observe::work_detail(ctx, &req).await,
        "work_map" => work_map::work_map(ctx, &req).await,
        "work_import_beads" => work_import::work_import_beads(ctx, &req).await,
        "work_create" => work_ops::work_create(ctx, &mut req).await,
        "work_update" => work_ops::work_update(ctx, &mut req).await,
        "work_promote" => work_ops::work_promote(ctx, &mut req).await,
        "work_adjudicate" => work_ops::work_adjudicate(ctx, &mut req).await,
        "work_park" => work_ops::work_park(ctx, &mut req).await,
        "work_note_add" => work_ops::work_note_add(ctx, &mut req).await,
        "work_note_list" => work_ops::work_note_list(ctx, &req).await,
        "work_link" => work_ops::work_link(ctx, &mut req).await,
        "work_close" => work_ops::work_close(ctx, &mut req).await,
        "work_reopen" => work_ops::work_reopen(ctx, &mut req).await,
        "work_release" => work_ops::work_release(ctx, &mut req).await,
        "work_supersede" => work_ops::work_supersede(ctx, &mut req).await,
        "work_revert" => work_ops::work_revert(ctx, &mut req).await,
        "work_show" => work_ops::work_show(ctx, &req).await,
        "work_ready" => work_ops::work_ready(ctx, &req).await,
        "supervise" => supervise::supervise(ctx, &req).await,
        "packet_show" => ops::packet_show(ctx, &req).await,
        "packet_claim" => ops::packet_claim(ctx, &mut req).await,
        "packet_complete" => ops::packet_complete(ctx, &mut req).await,
        "packet_fail" => ops::packet_fail(ctx, &mut req).await,
        "packet_heartbeat" => ops::packet_heartbeat(ctx, &req).await,
        "artifact_verify" => artifacts::artifact_verify(ctx, &req).await,
        "artifact_compact" => artifacts::artifact_compact(ctx, &mut req).await,
        "session_list" => sessions::session_list(ctx, &req).await,
        "session_inventory" => session_inventory::session_inventory(ctx, &req).await,
        "session_read" => sessions::session_read(ctx, &req).await,
        "session_message" => sessions::session_message(ctx, &mut req).await,
        "session_stop" => sessions::session_stop(ctx, &mut req).await,
        "claim_next" => claimnext::claim_next(ctx, &req).await,
        "gate_run" => ops::gate_run(ctx, &mut req).await,
        "reconcile" => ops::reconcile(ctx, &mut req).await,
        "review_publish" => review::review_publish(ctx, &mut req).await,
        "usage_report" => ops::usage_report(ctx, &req).await,
        "usage_ingest" => ops::usage_ingest(ctx, &mut req).await,
        "events_tail" => ops::events_tail(ctx, &req).await,
        "work_list" => ops::work_list(ctx, &req).await,
        "work_history" => history::work_history(ctx, &req).await,
        "attention_list" => ops::attention_list(ctx, &req).await,
        "attention_acknowledge" => ops::attention_acknowledge(ctx, &mut req).await,
        "attention_resolve" => ops::attention_resolve(ctx, &mut req).await,
        "attention_reopen" => ops::attention_reopen(ctx, &mut req).await,
        "worktree_retire" => ops::worktree_retire(ctx, &req).await,
        other => err_response(
            &read_key(other),
            &Failure::invalid(format!("unknown command {other:?}")),
        ),
    };
    // Compatibility aliases belong to the projection boundary, never to
    // durable operation results or event payloads. Replayed pre-twin and
    // newly stored responses therefore project identically without changing
    // a byte in the ledger.
    if let Some(result) = response.result.as_mut() {
        forged_types::add_work_twins(result);
    }
    response
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
