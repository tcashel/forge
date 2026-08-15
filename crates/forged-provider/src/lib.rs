//! forged-provider owns claude/codex invocation lines, packet prompts, and
//! usage parsers.
//!
//! A driver turns one packet into one invocation contract and parses that
//! run's captured output into usage rows. The hidden provider-stream runner
//! is the sole spawn path: provider stdout remains a direct file descriptor
//! to canonical attempt evidence while an independent bounded renderer may
//! show an allowlisted progress vocabulary.

#![deny(missing_docs)]

mod claude;
mod codex;
mod error;
mod invocation;
mod prompts;
mod rollout;
mod session;
mod stream;
mod usage;

pub use claude::ClaudeDriver;
pub use codex::CodexDriver;
pub use error::ProviderError;
pub use invocation::{Invocation, PacketDirs, ProviderDriver};
pub use prompts::{normalize_findings, PromptStage, PromptTemplates, RenderedFinding};
pub use rollout::recover_usage_from_rollout;
pub use session::{ProviderSessionScanner, SessionEvidenceUpdate, SESSION_DISCOVERY_MAX_BYTES};
pub use stream::{
    load_provider_stream_status, provider_stream_shell_line, run_provider_stream,
    ProviderStreamFailureClassV1, ProviderStreamRenderModeV1, ProviderStreamRequestV1,
    ProviderStreamStatusFailure, ProviderStreamStatusV1, PROVIDER_STREAM_ARG,
};
pub use usage::{PricingBasis, UsageCapture, UsageRow};
