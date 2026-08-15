//! forged-provider owns claude/codex invocation lines, packet prompts, and
//! usage parsers.
//!
//! A driver turns one packet into one shell line (sentinel-free —
//! `forged-host` owns spawning and appends its own sentinel) and parses that
//! run's captured output into usage rows. This crate spawns nothing, reads
//! no environment variables, and touches the filesystem only in
//! [`recover_usage_from_rollout`]. Wave 4 codes against the flat re-export
//! surface below and no deeper path.

#![deny(missing_docs)]

mod claude;
mod codex;
mod error;
mod invocation;
mod prompts;
mod rollout;
mod session;
mod usage;

pub use claude::ClaudeDriver;
pub use codex::CodexDriver;
pub use error::ProviderError;
pub use invocation::{Invocation, PacketDirs, ProviderDriver};
pub use prompts::{normalize_findings, PromptStage, PromptTemplates, RenderedFinding};
pub use rollout::recover_usage_from_rollout;
pub use session::{ProviderSessionScanner, SessionEvidenceUpdate, SESSION_DISCOVERY_MAX_BYTES};
pub use usage::{PricingBasis, UsageCapture, UsageRow};
