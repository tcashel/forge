//! forged-beads owns every bd invocation: leases, guardian, classifier,
//! reaper.
//!
//! Module map:
//! - [`config`] — [`BdConfig`]: explicit-config resolution for every bd child.
//! - [`envelope`] — parser for bd's JSON envelope (`BD_JSON_ENVELOPE=1`).
//! - [`invoke`] — the two spines every call goes through: `read` and the
//!   flock-serialized `write`.
//! - [`classify`] — the operation-aware contention classifier and [`BdError`].
//! - [`lease`] — claim / heartbeat / scoped reclaim and the TTL constants.
//! - [`guardian`] — the detached heartbeat guardian (heartbeat means
//!   "process alive").
#![deny(missing_docs)]

pub mod classify;
pub mod config;
pub mod envelope;
pub mod guardian;
pub mod invoke;
pub mod lease;

pub use classify::BdError;
pub use config::BdConfig;
pub use guardian::{run_guardian, GuardianConfig, GuardianExit};
pub use lease::{
    claim_ready, claim_specific, heartbeat, reclaim, reclaim_older_than, ClaimedBead,
    ReclaimOutcome, BD_LEASE_TTL_S,
};
