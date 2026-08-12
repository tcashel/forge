//! The ledger's refusal type: every seam method returns [`LedgerError`] on
//! failure, and [`LedgerError::code`] is the switchboard consumers dispatch on.

use forged_types::ErrorCode;

/// Why a ledger call did not succeed.
///
/// Exactly two variants: `Refused` carries a seam-relevant [`ErrorCode`]
/// (a precondition or not-found refusal the caller can dispatch on), and
/// `Internal` wraps everything unexpected (rusqlite/serde failures, a dead
/// writer thread).
#[derive(Debug, Clone, PartialEq, thiserror::Error)]
pub enum LedgerError {
    /// A seam-relevant refusal with its stable error code.
    #[error("refused ({code:?}): {message}")]
    Refused {
        /// The stable wire code for this refusal.
        code: ErrorCode,
        /// Human-readable context.
        message: String,
    },
    /// An unexpected internal failure.
    #[error("internal: {message}")]
    Internal {
        /// Human-readable context.
        message: String,
    },
}

impl LedgerError {
    /// The [`ErrorCode`] for this error: `Refused` yields its stored code,
    /// `Internal` yields [`ErrorCode::Internal`]. Total by construction.
    pub fn code(&self) -> ErrorCode {
        match self {
            LedgerError::Refused { code, .. } => *code,
            LedgerError::Internal { .. } => ErrorCode::Internal,
        }
    }
}

/// Build a `Refused` error.
pub(crate) fn refused(code: ErrorCode, message: impl Into<String>) -> LedgerError {
    LedgerError::Refused {
        code,
        message: message.into(),
    }
}

/// Build an `Internal` error.
pub(crate) fn internal(message: impl Into<String>) -> LedgerError {
    LedgerError::Internal {
        message: message.into(),
    }
}

impl From<rusqlite::Error> for LedgerError {
    fn from(err: rusqlite::Error) -> Self {
        internal(format!("sqlite error: {err}"))
    }
}

/// The row-mapper error for an unrecognized stored enum string.
///
/// Row mappers run inside rusqlite's `query_row`/`query_map` and must return
/// `rusqlite::Error`; this builds a conversion failure that the
/// `From<rusqlite::Error>` impl above surfaces as [`LedgerError::Internal`].
/// Decoding fails CLOSED: a stored state outside the DDL CHECK set is
/// storage corruption and must never map to a permissive default.
pub(crate) fn column_decode_error(idx: usize, what: &str, value: &str) -> rusqlite::Error {
    rusqlite::Error::FromSqlConversionFailure(
        idx,
        rusqlite::types::Type::Text,
        format!("unknown {what} in database: {value:?}").into(),
    )
}

impl From<serde_json::Error> for LedgerError {
    fn from(err: serde_json::Error) -> Self {
        internal(format!("json error: {err}"))
    }
}
