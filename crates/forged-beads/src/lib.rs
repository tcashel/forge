//! forged-beads is the one-shot cutover reader: it exists solely so
//! `forged work import-beads` can read an operator's legacy bd (beads)
//! store into the ledger-native work store. Nothing at runtime consults bd
//! — the ledger owns work and readiness (ADR-0034). This crate is deleted
//! outright once no operator store remains to import.
//!
//! Module map:
//! - [`config`] — [`BdConfig`]: explicit-config resolution for the bd child.
//! - [`envelope`] — parser for bd's JSON envelope (`BD_JSON_ENVELOPE=1`).
//! - [`invoke`] — sanitized, timeout-bounded bd reads.
//! - [`classify`] — [`BdError`] for child and envelope failures.
//! - [`graph`] — import discovery and full hydration with dependencies.
#![deny(missing_docs)]

pub mod classify;
pub mod config;
pub mod envelope;
pub mod graph;
pub mod invoke;

pub use classify::BdError;
pub use config::{supported_bd_version, BdConfig};
pub use graph::{
    all_issue_ids, all_issues_with_deps, IssueSummary, PlanDependency, PlanDependencyType,
    PlanIssue,
};
