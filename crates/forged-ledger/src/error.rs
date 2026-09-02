//! The ledger's refusal type: every seam method returns [`LedgerError`] on
//! failure, and [`LedgerError::code`] is the switchboard consumers dispatch on.

use forged_types::{AdmissionResourceClass, ErrorCode};

/// Which admitted-attempt fence leg moved after the attempt was claimed.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AdmissionMoveLeg {
    /// The desired state, control revision, or exhaustion state moved.
    Control,
    /// The attempt-owned admission reservation is no longer active.
    Reservation,
    /// The packet's effective provider resources moved.
    Facts,
}

impl AdmissionMoveLeg {
    /// The stable word used in the operator-facing re-admission note.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Control => "control",
            Self::Reservation => "reservation",
            Self::Facts => "facts",
        }
    }
}

impl std::fmt::Display for AdmissionMoveLeg {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(self.as_str())
    }
}

/// The resource facts on one side of an admitted-attempt fence comparison.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AdmissionFenceFacts {
    /// Canonical repository selected for the packet.
    pub repository: String,
    /// Provider selected for the packet.
    pub provider: String,
    /// Model selected for the packet.
    pub model: String,
    /// Capacity class selected for the packet.
    pub resource_class: AdmissionResourceClass,
    /// Desired-work control revision authorizing these facts.
    pub control_revision: u64,
}

/// Why a ledger call did not succeed.
///
/// `Refused` carries a seam-relevant [`ErrorCode`] (a precondition or
/// not-found refusal the caller can dispatch on), `AdmissionMoved` preserves
/// the in-process pre-spawn recovery detail while retaining that same wire
/// code, and `Internal` wraps everything unexpected (rusqlite/serde failures,
/// a dead writer thread).
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
    /// A still-running attempt whose admission authority moved before spawn.
    #[error("admission {leg} moved")]
    AdmissionMoved {
        /// The exact fence leg that detected the change.
        leg: AdmissionMoveLeg,
        /// Facts transferred into the attempt-owned reservation, if present.
        reservation: Option<Box<AdmissionFenceFacts>>,
        /// Facts currently effective for the packet, if fully available.
        current: Option<Box<AdmissionFenceFacts>>,
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
            LedgerError::AdmissionMoved { .. } => ErrorCode::StaleClaimToken,
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
