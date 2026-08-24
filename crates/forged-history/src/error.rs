//! The archive's refusal type.
//!
//! History errors are deliberately NOT `forged_ledger::LedgerError`: the
//! archive is an independent store with its own failure vocabulary, and
//! sharing a type would be the first step toward sharing a database.

/// Why a history call did not succeed.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum HistoryError {
    /// The database path is not a plain, owner-scoped regular file: a
    /// symlink, a directory, a device node, or a foreign-owned file stood
    /// where the archive must live. Never widened into a create.
    #[error("unsafe history path {path}: {reason}")]
    UnsafePath {
        /// The rejected path, as given.
        path: String,
        /// What made it unusable.
        reason: String,
    },

    /// The bundled SQLite lacks a capability the archive depends on. Checked
    /// once at open so a missing capability never surfaces mid-ingestion.
    #[error("sqlite capability unavailable: {capability}")]
    MissingCapability {
        /// The probe that failed, e.g. `fts5` or `fts5:contentless_delete`.
        capability: String,
    },

    /// A caller-supplied argument violates a stored contract.
    #[error("invalid argument: {message}")]
    Invalid {
        /// Human-readable context.
        message: String,
    },

    /// Another connection held the write lock for longer than the busy
    /// timeout. Retryable by the caller; never a data verdict.
    #[error("history database is busy: {message}")]
    Busy {
        /// Human-readable context.
        message: String,
    },

    /// An unexpected failure: rusqlite, io, zstd, a dead writer thread, or a
    /// stored value outside a closed vocabulary.
    #[error("internal: {message}")]
    Internal {
        /// Human-readable context.
        message: String,
    },
}

impl HistoryError {
    /// Whether this failure is a lock-contention timeout worth retrying.
    pub fn is_busy(&self) -> bool {
        matches!(self, HistoryError::Busy { .. })
    }
}

/// Build an [`HistoryError::UnsafePath`].
pub(crate) fn unsafe_path(path: &std::path::Path, reason: impl Into<String>) -> HistoryError {
    HistoryError::UnsafePath {
        path: path.display().to_string(),
        reason: reason.into(),
    }
}

/// Build an [`HistoryError::Invalid`].
pub(crate) fn invalid(message: impl Into<String>) -> HistoryError {
    HistoryError::Invalid {
        message: message.into(),
    }
}

/// Build an [`HistoryError::Internal`].
pub(crate) fn internal(message: impl Into<String>) -> HistoryError {
    HistoryError::Internal {
        message: message.into(),
    }
}

/// Whether a rusqlite failure is SQLite's busy/locked contention signal.
pub(crate) fn is_busy_error(err: &rusqlite::Error) -> bool {
    matches!(
        err,
        rusqlite::Error::SqliteFailure(e, _)
            if e.code == rusqlite::ErrorCode::DatabaseBusy
                || e.code == rusqlite::ErrorCode::DatabaseLocked
    )
}

impl From<rusqlite::Error> for HistoryError {
    fn from(err: rusqlite::Error) -> Self {
        if is_busy_error(&err) {
            return HistoryError::Busy {
                message: format!("sqlite: {err}"),
            };
        }
        internal(format!("sqlite error: {err}"))
    }
}

impl From<std::io::Error> for HistoryError {
    fn from(err: std::io::Error) -> Self {
        internal(format!("io error: {err}"))
    }
}

/// The row-mapper error for an unrecognized stored enum string.
///
/// Decoding fails CLOSED: a stored value outside the DDL CHECK set is
/// storage corruption or a downgrade, and must never map to a permissive
/// default that silently widens a closed vocabulary.
pub(crate) fn column_decode_error(idx: usize, what: &str, value: &str) -> rusqlite::Error {
    rusqlite::Error::FromSqlConversionFailure(
        idx,
        rusqlite::types::Type::Text,
        format!("unknown {what} in history database: {value:?}").into(),
    )
}
