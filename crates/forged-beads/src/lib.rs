//! forged-beads owns every bd invocation: leases, guardian, classifier,
//! reaper.
//!
//! Module map:
//! - [`config`] — [`BdConfig`]: explicit-config resolution for every bd child.
//! - [`envelope`] — parser for bd's JSON envelope (`BD_JSON_ENVELOPE=1`).
//! - [`invoke`] — the two spines every call goes through: `read` and the
//!   flock-serialized `write`.
//! - [`classify`] — the operation-aware contention classifier and [`BdError`].
#![deny(missing_docs)]

pub mod classify;
pub mod config;
pub mod envelope;
pub mod invoke;

pub use classify::BdError;
pub use config::BdConfig;
