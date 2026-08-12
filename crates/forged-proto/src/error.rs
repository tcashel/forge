//! The crate's two error vocabularies: [`ProtoError`] for everything this
//! crate surfaces, and [`PortError`] for what a [`crate::ReconcilePorts`]
//! implementation may refuse with.

use forged_ledger::LedgerError;

/// Why a forged-proto call did not succeed.
#[derive(Debug, Clone, PartialEq, thiserror::Error)]
pub enum ProtoError {
    /// A ledger call refused or failed.
    #[error("ledger: {0}")]
    Ledger(#[from] LedgerError),
    /// A [`crate::ReconcilePorts`] call failed. `attempt_id` is `0` when the
    /// failing step was not scoped to an attempt (operation settlement).
    #[error("port {step} failed for attempt {attempt_id}: {source}")]
    Port {
        /// The attempt the reconciler was processing, `0` when none.
        attempt_id: i64,
        /// The port method (or saga step) that failed.
        step: String,
        /// The port's own refusal.
        source: PortError,
    },
    /// A stored event payload violated the replay contract: a required key
    /// is missing, the `schemaVersion` is unknown, or a second payload for
    /// the same logical key differs byte-wise.
    #[error("malformed event {event_id}: {detail}")]
    MalformedEvent {
        /// The offending `events.event_id`.
        event_id: i64,
        /// What the replay parser objected to.
        detail: String,
    },
    /// Projection could not assemble a coherent [`crate::RunView`] (or a
    /// reconcile input could not be interpreted).
    #[error("projection: {0}")]
    Projection(String),
}

/// Why a [`crate::ReconcilePorts`] method did not succeed.
#[derive(Debug, Clone, PartialEq, thiserror::Error)]
pub enum PortError {
    /// The external system could not be reached.
    #[error("unavailable: {0}")]
    Unavailable(String),
    /// The external system understood the request and said no.
    #[error("refused: {0}")]
    Refused(String),
    /// The adapter itself failed.
    #[error("internal: {0}")]
    Internal(String),
}
