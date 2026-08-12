//! forged-beads owns every bd invocation: leases, guardian, classifier,
//! reaper.
//!
//! Module map:
//! - [`envelope`] — parser for bd's JSON envelope (`BD_JSON_ENVELOPE=1`).
#![deny(missing_docs)]

pub mod envelope;
