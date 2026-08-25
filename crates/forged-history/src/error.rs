//! History-specific refusal and storage errors.

/// Why a history operation did not succeed.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum HistoryError {
    /// Caller input is malformed or internally inconsistent.
    #[error("invalid history request: {message}")]
    Invalid {
        /// Human-readable request context.
        message: String,
    },
    /// A continuation belongs to an older searchable corpus.
    #[error("stale history cursor")]
    StaleCursor,
    /// No complete lexical index generation is currently advertised.
    #[error("history search index is rebuilding or unavailable")]
    Rebuilding,
    /// A caller attempted to publish through a poisoned builder.
    #[error("history ingest builder is poisoned")]
    Poisoned,
    /// A requested committed record does not exist.
    #[error("history record was not found")]
    NotFound,
    /// A live database writer did not release its lock within the timeout.
    #[error("history database is busy")]
    Busy,
    /// The storage boundary could not safely complete the operation.
    #[error("history storage failure: {message}")]
    Internal {
        /// Human-readable storage context.
        message: String,
    },
}

pub(crate) fn invalid(message: impl Into<String>) -> HistoryError {
    HistoryError::Invalid {
        message: message.into(),
    }
}

pub(crate) fn internal(message: impl Into<String>) -> HistoryError {
    HistoryError::Internal {
        message: message.into(),
    }
}

impl From<std::io::Error> for HistoryError {
    fn from(error: std::io::Error) -> Self {
        internal(format!("I/O error: {error}"))
    }
}

impl From<rusqlite::Error> for HistoryError {
    fn from(error: rusqlite::Error) -> Self {
        match &error {
            rusqlite::Error::SqliteFailure(code, _)
                if matches!(
                    code.code,
                    rusqlite::ErrorCode::DatabaseBusy | rusqlite::ErrorCode::DatabaseLocked
                ) =>
            {
                HistoryError::Busy
            }
            _ => internal(format!("SQLite error: {error}")),
        }
    }
}

pub(crate) fn decode_error(column: usize, vocabulary: &str, value: &str) -> rusqlite::Error {
    rusqlite::Error::FromSqlConversionFailure(
        column,
        rusqlite::types::Type::Text,
        format!("unknown {vocabulary} in history database: {value:?}").into(),
    )
}
