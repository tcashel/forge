//! forged-ledger owns state.db DDL, the idempotent operation store, and the
//! attempt saga.
//!
//! Saga order is load-bearing: REVOKING commits durably before any external
//! kill or reclaim; `reclaimed` is reachable only from `revoking`.
//!
//! All access goes through a blocking actor — a dedicated writer thread owns
//! the `rusqlite::Connection` — so the crate contains no async code at all
//! and no transaction can ever span an `.await` by construction. Callers in
//! async contexts wrap calls in `spawn_blocking` at their own layer.

mod error;
mod ledger;
mod migrations;
mod time;
mod types;

pub use error::LedgerError;
pub use ledger::{default_db_path, Ledger};
pub use types::{
    AttemptRow, AttemptState, ClaimedAttempt, EffectClass, EventRow, MergeSlotRow, NewPacket,
    NewRun, NewUsage, OperationOutcome, OperationRow, OperationState, OperationTicket, PacketRow,
    Pragmas, RunRow, RunState, SlotOutcome, UsageTotals,
};
