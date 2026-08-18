//! forged-gate owns ordered gate execution with artifact capture.
//!
//! `run_gates` executes caller-supplied shell lines in order, streams full
//! stdout/stderr to per-command artifact files, and reports one
//! `forged_types::GateRow` per command. A failing or timed-out gate is data
//! in its row — never an error — and never stops later commands.
//!
//! This crate is Unix-only by design: gate children run in their own process
//! group and timeouts SIGKILL the whole group. No `#[cfg]` fallbacks exist
//! for other platforms. The crate reads no environment variables: callers
//! pass `cwd` and `artifacts_dir` explicitly. Gate children inherit the
//! caller's environment MINUS `forged_types::CONTROLLER_ENV`: a gate runs the
//! repository's own commands, which must never observe the controller's
//! attempt-ownership claim.

mod error;
mod runner;

pub use error::GateError;
pub use runner::{run_gates, GateOutcome, GateRequest};
