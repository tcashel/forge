//! forged-host owns SessionHost and the sentinel status-file truth path.
//!
//! One trait ([`SessionHost`]), two backends ([`ProcessHost`] for plain
//! processes and [`HerdrHost`] for herdr panes over the Unix socket), and the
//! sentinel status-file discipline that is the ONLY exit-code truth for both:
//! every session runs one shell line with `; echo $? > <base>/<id>/status`
//! appended, and an exit code is never derived from anything but that file's
//! contents. Process polling, pane state, and `pane_exited` events are
//! liveness accelerators only.

mod herdr;
mod identity;
mod process;
mod sentinel;

pub use herdr::{
    herdr_status_dir_key, HerdrAgentProjection, HerdrAgentRelease, HerdrCloseOutcome, HerdrControl,
    HerdrCreatedTab, HerdrHost, HerdrLayoutInspection, HerdrLayoutPane, HerdrLayoutSnapshot,
    HerdrLayoutTarget, HerdrMetadataProjection, HerdrProcessInfoProbe, HerdrProjectionOutcome,
    HerdrTabCreateError, PaneSnapshot,
};
pub use process::ProcessHost;

use std::collections::HashMap;
use std::fmt;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

/// The Herdr wire protocol supported by this crate.
///
/// It is part of a durable Herdr session identity: cleanup must reconnect to
/// the same socket speaking this exact protocol before it may address the
/// opaque pane id.
pub const HERDR_PROTOCOL_VERSION: u32 = 19;

static NEXT_HOST_INSTANCE: AtomicU64 = AtomicU64::new(1);
static NEXT_PREPARED_TOKEN: AtomicU64 = AtomicU64::new(1);

pub(crate) fn next_host_instance() -> u64 {
    NEXT_HOST_INSTANCE.fetch_add(1, Ordering::Relaxed)
}

pub(crate) fn next_prepared_token() -> u64 {
    NEXT_PREPARED_TOKEN.fetch_add(1, Ordering::Relaxed)
}

/// Read the host sentinel using the same strict parser as every liveness
/// backend. Only `Some(code)` is verified terminal truth; absent, empty, and
/// malformed files return `None`, while I/O failures remain errors.
pub fn read_exit_status(path: &Path) -> Result<Option<i32>, HostError> {
    sentinel::read_status(path)
}

/// Host-scoped opaque session handle.
///
/// Ids are valid only within the host instance that issued them; presenting
/// an id to another instance yields [`HostError::SessionNotFound`].
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct HostSessionId(pub(crate) String);

impl HostSessionId {
    /// The raw id string (a `proc-<pid>-<n>` token or a herdr pane id).
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for HostSessionId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Durable coordinates for one Herdr-backed session.
///
/// Pane ids are opaque transport values. Callers must persist all three
/// fields exactly as returned; neither a sentinel path nor a socket may be
/// reconstructed from the pane id later.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HerdrSessionIdentity {
    pane_id: String,
    socket_path: PathBuf,
    protocol: u32,
}

impl HerdrSessionIdentity {
    /// Reconstitute coordinates previously persisted by the caller.
    ///
    /// Validation deliberately happens at the effect boundary so malformed
    /// or stale stored values fail closed without issuing a Herdr request.
    pub fn from_durable(
        pane_id: impl Into<String>,
        socket_path: impl Into<PathBuf>,
        protocol: u32,
    ) -> Self {
        Self {
            pane_id: pane_id.into(),
            socket_path: socket_path.into(),
            protocol,
        }
    }

    /// Herdr's opaque pane id, preserved byte-for-byte.
    pub fn pane_id(&self) -> &str {
        &self.pane_id
    }

    /// Exact socket path selected by the spawning host.
    pub fn socket_path(&self) -> &Path {
        &self.socket_path
    }

    /// Pinned Herdr protocol for this identity.
    pub fn protocol(&self) -> u32 {
        self.protocol
    }
}

/// A reserved session whose command has not been sent yet.
///
/// This handle is intentionally non-`Clone` and is accepted only by the host
/// instance that issued it. It is the prepare/register/start handoff: callers
/// can durably record the exact sentinel and Herdr coordinates, then consume
/// the handle with [`SessionHost::start`].
#[derive(Debug)]
pub struct PreparedSession {
    id: HostSessionId,
    sentinel_path: PathBuf,
    herdr: Option<HerdrSessionIdentity>,
    herdr_layout_id: Option<String>,
    herdr_layout_degradation: Option<String>,
    issuer: u64,
    token: u64,
}

impl PreparedSession {
    pub(crate) fn new(
        id: HostSessionId,
        sentinel_path: PathBuf,
        herdr: Option<HerdrSessionIdentity>,
        issuer: u64,
    ) -> Self {
        Self {
            id,
            sentinel_path,
            herdr,
            herdr_layout_id: None,
            herdr_layout_degradation: None,
            issuer,
            token: next_prepared_token(),
        }
    }

    /// The host-scoped session id reserved by prepare.
    pub fn id(&self) -> &HostSessionId {
        &self.id
    }

    /// The exact host-selected sentinel path.
    pub fn sentinel_path(&self) -> &Path {
        &self.sentinel_path
    }

    /// Durable Herdr coordinates, or `None` for a plain process session.
    pub fn herdr_identity(&self) -> Option<&HerdrSessionIdentity> {
        self.herdr.as_ref()
    }

    /// Durable layout joined by this pane when targeted placement succeeded.
    pub fn herdr_layout_id(&self) -> Option<&str> {
        self.herdr_layout_id.as_deref()
    }

    /// Bounded diagnostic when layout placement degraded to the legacy
    /// repository-workspace split. This never changes host selection.
    pub fn herdr_layout_degradation(&self) -> Option<&str> {
        self.herdr_layout_degradation.as_deref()
    }

    pub(crate) fn set_herdr_layout_outcome(
        &mut self,
        layout_id: Option<String>,
        degradation: Option<String>,
    ) {
        self.herdr_layout_id = layout_id;
        self.herdr_layout_degradation = degradation;
    }

    pub(crate) fn issued_by(&self, issuer: u64) -> bool {
        self.issuer == issuer
    }

    pub(crate) fn token(&self) -> u64 {
        self.token
    }
}

/// Liveness of a session, as far as the host can verify it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Liveness {
    /// Session's command line is running (or not yet started).
    Running,
    /// Sentinel status file exists; code parsed from it.
    Exited(i32),
    /// Process/pane is gone but no status file was written
    /// (crash, external kill, pane closed). No exit code is invented.
    Vanished,
}

/// Outcome of a verified kill. Both variants require VERIFIED death —
/// signal-send success alone is never confirmation.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Confirmed {
    /// We killed it and verified death.
    Killed,
    /// It was already dead (verified) before we acted.
    AlreadyDead,
}

/// Errors a session host can surface. The variant set is normative: exactly
/// these six, each with a total mapping onto the wire [`forged_types::ErrorCode`]
/// via [`HostError::wire_code`].
#[derive(Debug, thiserror::Error)]
pub enum HostError {
    /// Socket missing, connection refused, server gone mid-run, RPC timeout.
    #[error("host unavailable: {message}")]
    Unavailable {
        /// Diagnostic detail on what made the host unreachable.
        message: String,
    },
    /// Ping reported a protocol other than the pinned one.
    #[error("herdr protocol mismatch: expected {expected}, got {got}")]
    ProtocolMismatch {
        /// The protocol number this crate is pinned to.
        expected: u32,
        /// The protocol number the server actually reported.
        got: u32,
    },
    /// Process/pane could not be started, or the shell_line/status path was
    /// refused.
    #[error("spawn failed: {message}")]
    SpawnFailed {
        /// Diagnostic detail on why the spawn was refused or failed.
        message: String,
    },
    /// Id absent from this instance's session table.
    #[error("session not found: {id}")]
    SessionNotFound {
        /// The unrecognized session id.
        id: String,
    },
    /// Status file unreadable for a reason other than "not yet written".
    #[error("sentinel status file unreadable: {message}")]
    SentinelIo {
        /// Diagnostic detail on the I/O failure.
        message: String,
    },
    /// Signals/close sent, death never verified within the poll budget.
    #[error("kill sent but death was never verified within the poll budget")]
    KillVerifyTimeout,
}

impl HostError {
    /// The stable wire code for this failure, so callers never re-derive the
    /// mapping. Total over the six variants.
    pub fn wire_code(&self) -> forged_types::ErrorCode {
        use forged_types::ErrorCode;
        match self {
            HostError::Unavailable { .. } => ErrorCode::HostUnavailable,
            HostError::ProtocolMismatch { .. } => ErrorCode::HerdrProtocolMismatch,
            HostError::SpawnFailed { .. } => ErrorCode::ProviderSpawnFailed,
            HostError::SessionNotFound { .. } => ErrorCode::InvalidRequest,
            HostError::SentinelIo { .. } => ErrorCode::Internal,
            HostError::KillVerifyTimeout => ErrorCode::HostUnavailable,
        }
    }

    pub(crate) fn unavailable(message: impl Into<String>) -> Self {
        HostError::Unavailable {
            message: message.into(),
        }
    }

    pub(crate) fn spawn_failed(message: impl Into<String>) -> Self {
        HostError::SpawnFailed {
            message: message.into(),
        }
    }

    pub(crate) fn sentinel_io(message: impl Into<String>) -> Self {
        HostError::SentinelIo {
            message: message.into(),
        }
    }

    pub(crate) fn session_not_found(id: &HostSessionId) -> Self {
        HostError::SessionNotFound { id: id.0.clone() }
    }
}

/// A host that can run one shell line per session and report on it.
///
/// The sentinel status file is the only exit-code truth; `kill_confirmed`
/// reports success only after verified death, never on signal-send success.
#[async_trait::async_trait]
pub trait SessionHost: Send + Sync {
    /// Reserve the backend session and exact sentinel path without sending
    /// the command. The returned handle is the caller's durable-registration
    /// boundary.
    async fn prepare(
        &self,
        cwd: &Path,
        shell_line: &str,
        env: &HashMap<String, String>,
    ) -> Result<PreparedSession, HostError>;

    /// Send the prepared command exactly once.
    ///
    /// The non-cloneable handle is consumed. Implementations reject handles
    /// issued by another host before any backend effect and perform their own
    /// best-effort rollback when start itself fails.
    async fn start(&self, prepared: PreparedSession) -> Result<HostSessionId, HostError>;

    /// Best-effort rollback when durable registration failed. A foreign or
    /// stale handle is ignored and must not trigger a backend effect.
    async fn rollback_prepared(&self, prepared: PreparedSession);

    /// Compatibility convenience for callers that do not need durable Herdr
    /// ownership. New controller/provider paths use prepare/register/start.
    /// Start implementations roll their reservation back on failure.
    async fn spawn(
        &self,
        cwd: &Path,
        shell_line: &str,
        env: &HashMap<String, String>,
    ) -> Result<HostSessionId, HostError> {
        let prepared = self.prepare(cwd, shell_line, env).await?;
        self.start(prepared).await
    }

    /// Report the session's liveness: sentinel status file first, then the
    /// backend's process/pane facilities as accelerators.
    async fn alive(&self, id: &HostSessionId) -> Result<Liveness, HostError>;

    /// Kill the session and VERIFY death before reporting success.
    async fn kill_confirmed(&self, id: &HostSessionId) -> Result<Confirmed, HostError>;

    /// Give up the terminal of a session that has ALREADY SETTLED.
    ///
    /// This is not a kill and it fences no SETTLEMENT: it verifies nothing,
    /// waits for nothing, and returns `()` precisely so no failure of it can
    /// reach a caller that has already settled an attempt. A backend with
    /// nothing to give up does nothing. Callers that need verified death
    /// call [`SessionHost::kill_confirmed`] instead, which releases the
    /// terminal itself — the two are never issued for the same session.
    ///
    /// It IS gated on ownership, which is a different thing. A backend must
    /// act only on an id it issued: the effect is destructive and addressed
    /// by a name the backend does not control, so an id from elsewhere would
    /// take down someone else's terminal. Ownership decides whether the
    /// effect fires at all; settlement is never allowed to depend on whether
    /// it succeeded.
    ///
    /// The id REMAINS VALID afterwards: `alive` and `kill_confirmed` must
    /// keep answering for a released session (from the sentinel, and from
    /// whatever the backend can still observe) rather than
    /// [`HostError::SessionNotFound`]. Settling an attempt and settling its
    /// ROW are different events, and a reconcile pass that reaches the
    /// second one must not be told the session never existed.
    async fn release(&self, id: &HostSessionId);

    /// A stable locator string a UI can render to attach to the session, if
    /// the backend has one. Non-blocking; no I/O.
    fn attach_hint(&self, id: &HostSessionId) -> Option<String>;
}

#[cfg(test)]
mod tests {
    use super::*;
    use forged_types::ErrorCode;

    #[test]
    fn wire_code_mapping_is_total_and_exact() {
        assert_eq!(
            HostError::unavailable("x").wire_code(),
            ErrorCode::HostUnavailable
        );
        assert_eq!(
            HostError::ProtocolMismatch {
                expected: 19,
                got: 18
            }
            .wire_code(),
            ErrorCode::HerdrProtocolMismatch
        );
        assert_eq!(
            HostError::spawn_failed("x").wire_code(),
            ErrorCode::ProviderSpawnFailed
        );
        assert_eq!(
            HostError::SessionNotFound { id: "s".into() }.wire_code(),
            ErrorCode::InvalidRequest
        );
        assert_eq!(HostError::sentinel_io("x").wire_code(), ErrorCode::Internal);
        assert_eq!(
            HostError::KillVerifyTimeout.wire_code(),
            ErrorCode::HostUnavailable
        );
    }

    #[test]
    fn session_id_accessors() {
        let id = HostSessionId("proc-1-0".to_string());
        assert_eq!(id.as_str(), "proc-1-0");
        assert_eq!(id.to_string(), "proc-1-0");
        let clone = id.clone();
        assert_eq!(id, clone);
    }
}
