//! Best-effort mirror of terminal tool outcomes into bd's interactions
//! sidecar.
//!
//! Execution semantics: [`audit_record`] goes THROUGH the write flock like
//! any other bd write (auditing never races the crate's own writes), but as
//! a SINGLE-ATTEMPT, NO-RETRY invocation — the module-4 retry/classification
//! policy does not apply to it — and it is AWAITED, never detached. It
//! returns its `Result` and prints NOTHING (this crate has no tracing dep,
//! and reporting is the caller's business). Callers may — and normally do —
//! ignore the `Err`.
//!
//! Call-site ownership: `invoke::write` does NOT call this automatically.
//! Callers (wave-3/wave-4) invoke it explicitly at terminal-attempt time,
//! exactly once per terminal attempt outcome.
//!
//! The sidecar (`.beads/interactions.jsonl`) is DISABLED by default in bd
//! (`audit.enabled` config) — that is fine: this mirror is non-authoritative
//! by design, and a disabled or missing surface is simply another `Err` the
//! caller ignores. Observed with the default-disabled sidecar (bd 1.2.1):
//! exit 1 with stderr `Error: audit JSONL sidecar is disabled; set
//! audit.enabled=true or BD_AUDIT_ENABLED=1 to write interactions.jsonl`.
//! It NEVER fails or delays the underlying operation.

use crate::classify::BdError;
use crate::config::BdConfig;
use crate::invoke;

/// One terminal tool outcome to mirror.
#[derive(Debug, Clone)]
pub struct AuditEntry {
    /// The tool that ran.
    pub tool_name: String,
    /// The tool's exit code.
    pub exit_code: i32,
    /// The bead the tool ran against.
    pub bead: String,
    /// The acting holder.
    pub holder: String,
}

/// Mirror one terminal outcome:
/// `bd audit record --kind tool_call --tool-name <tool_name> --exit-code
/// <exit_code> --issue-id <bead> --actor <holder>`. Single attempt through
/// the write flock; the `Err` is safely ignorable.
pub async fn audit_record(bd: &BdConfig, entry: &AuditEntry) -> Result<(), BdError> {
    let exit_code = entry.exit_code.to_string();
    let args = [
        "audit",
        "record",
        "--kind",
        "tool_call",
        "--tool-name",
        &entry.tool_name,
        "--exit-code",
        &exit_code,
        "--issue-id",
        &entry.bead,
        "--actor",
        &entry.holder,
    ];
    let out = invoke::run_locked_once(bd, &args, "bd audit record").await?;
    if out.exit == Some(0) {
        Ok(())
    } else {
        Err(BdError::Beads {
            context: "bd audit record".to_string(),
            exit: out.exit,
            stdout: out.stdout,
            stderr: out.stderr,
        })
    }
}
