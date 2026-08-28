//! The crate error type [`BdError`] for legacy-store reads.

use std::fmt;

/// The crate-local error type for every bd outcome.
#[derive(Debug, Clone)]
pub enum BdError {
    /// A bd failure no other rule claims (reserved for nonzero-exit outcomes,
    /// plus zero-exit calls whose envelope carried an error). Wire mapping:
    /// `BEADS_ERROR`.
    Beads {
        /// What was being run (e.g. `bd update beads-1al`).
        context: String,
        /// The child's exit code (`None` when killed by a signal).
        exit: Option<i32>,
        /// The child's full stdout.
        stdout: String,
        /// The child's full stderr.
        stderr: String,
    },
    /// bd answered but the envelope carried no usable data or declared an
    /// unsupported schema version. Wire mapping: `BEADS_ERROR`.
    Envelope {
        /// What was being run.
        context: String,
        /// Both output streams, for diagnosis.
        detail: String,
    },
    /// The child's stdout did not parse as an envelope. Wire mapping:
    /// `BEADS_ERROR`.
    Unparseable {
        /// What was being run.
        context: String,
        /// Both output streams, for diagnosis.
        detail: String,
    },
    /// The child could not be spawned at all. Wire mapping: `BEADS_ERROR`.
    SpawnFailed {
        /// What was being run.
        context: String,
        /// The spawn error.
        detail: String,
    },
    /// A child invocation outlived its timeout; dropping the child future
    /// reaps it through `kill_on_drop`. Wire mapping: `BEADS_ERROR`.
    Timeout {
        /// What was being run.
        context: String,
        /// The elapsed bound in seconds.
        after_s: u64,
    },
}

impl fmt::Display for BdError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BdError::Beads {
                context,
                exit,
                stdout,
                stderr,
            } => write!(
                f,
                "{context} failed (exit {exit:?}); stdout: {stdout}; stderr: {stderr}"
            ),
            BdError::Envelope { context, detail } => {
                write!(f, "{context} returned a bad envelope: {detail}")
            }
            BdError::Unparseable { context, detail } => {
                write!(f, "{context} returned no parseable envelope: {detail}")
            }
            BdError::SpawnFailed { context, detail } => {
                write!(f, "{context} could not spawn: {detail}")
            }
            BdError::Timeout { context, after_s } => {
                write!(f, "{context} timed out after {after_s}s")
            }
        }
    }
}

impl std::error::Error for BdError {}

/// One finished bd attempt: exit status plus both output streams.
pub(crate) struct RawOutcome {
    /// Exit code (`None` when the child was killed by a signal).
    pub exit: Option<i32>,
    /// Full stdout.
    pub stdout: String,
    /// Full stderr.
    pub stderr: String,
}
