//! Typed environment/input errors for the gate runner, plus their mapping
//! onto the closed `forged_types::ErrorCode` wire set.
//!
//! A gate command that fails or times out is NOT a `GateError` — it is data
//! in the gate row. `GateError` is reserved for failures where no honest row
//! exists.

use forged_types::ErrorCode;

/// An environment or input failure that prevents an honest gate report.
#[derive(Debug, thiserror::Error)]
pub enum GateError {
    /// The request was invalid before anything ran: non-absolute or
    /// `..`-containing cwd/artifacts_dir, an empty commands vec, or a
    /// pre-existing non-empty artifacts_dir. The message names which.
    #[error("invalid gate request: {message}")]
    InvalidRequest { message: String },
    /// The artifacts directory (or an artifact file inside it) could not be
    /// created.
    #[error("failed to prepare artifacts at {path}: {source}")]
    ArtifactsDir {
        path: String,
        source: std::io::Error,
    },
    /// A gate command could not be spawned.
    #[error("failed to spawn gate command {command:?}: {source}")]
    Spawn {
        command: String,
        source: std::io::Error,
    },
    /// A post-spawn capture, wait, or signal-management failure.
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl GateError {
    /// The wire error code this failure maps onto.
    pub fn code(&self) -> ErrorCode {
        match self {
            GateError::InvalidRequest { .. } => ErrorCode::InvalidRequest,
            GateError::ArtifactsDir { .. } | GateError::Spawn { .. } | GateError::Io(_) => {
                ErrorCode::Internal
            }
        }
    }
}
