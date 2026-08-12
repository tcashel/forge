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

pub use herdr::{HerdrControl, HerdrHost, PaneSnapshot};
pub use process::ProcessHost;

use std::collections::HashMap;
use std::fmt;
use std::path::Path;

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
    /// Start one shell line in `cwd` with `env` overlaid on the inherited
    /// environment, sentinel appended.
    async fn spawn(
        &self,
        cwd: &Path,
        shell_line: &str,
        env: &HashMap<String, String>,
    ) -> Result<HostSessionId, HostError>;

    /// Report the session's liveness: sentinel status file first, then the
    /// backend's process/pane facilities as accelerators.
    async fn alive(&self, id: &HostSessionId) -> Result<Liveness, HostError>;

    /// Kill the session and VERIFY death before reporting success.
    async fn kill_confirmed(&self, id: &HostSessionId) -> Result<Confirmed, HostError>;

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
