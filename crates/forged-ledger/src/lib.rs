//! forged-ledger owns state.db DDL, the idempotent operation store, and the
//! attempt saga.
//!
//! Saga order is load-bearing: REVOKING commits durably before any external
//! kill or reclaim; `reclaimed` is reachable only from `revoking`.
//!
//! The fence has exactly three enforcement points:
//! 1. [`Ledger::begin_operation`] — entry: a token-bearing request refuses
//!    unless its attempt is `running`.
//! 2. [`Ledger::assert_attempt_live`] — immediately before an effect fires.
//! 3. [`Ledger::complete_operation`] — result landing: a revoked attempt
//!    cannot land results.
//!
//! All access goes through a blocking actor — a dedicated writer thread owns
//! the `rusqlite::Connection` — so the crate contains no async code at all
//! and no transaction can ever span an `.await` by construction. Callers in
//! async contexts wrap calls in `spawn_blocking` at their own layer.

mod attempts;
mod error;
mod events;
mod ledger;
mod migrations;
mod operations;
mod packets;
mod runs;
mod slots;
mod time;
mod types;
mod usage;

pub use error::LedgerError;
pub use ledger::{default_db_path, Ledger};
pub use types::{
    AttemptRow, AttemptState, ClaimedAttempt, EffectClass, EventRow, MergeSlotRow, NewPacket,
    NewRun, NewRunDefinition, NewUsage, OperationOutcome, OperationRow, OperationState,
    OperationTicket, PacketRow, Pragmas, RosterRevisionBatch, RosterRevisionRow, RunDefinitionRow,
    RunRow, RunState, SlotOutcome, UsageTotals,
};
