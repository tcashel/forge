//! The driver trait, packet directory arithmetic, the invocation value, and
//! the shell-safety validators every embedded string passes through.

use std::path::{Path, PathBuf};

use forged_types::WorkPacket;

use crate::command::ProviderArgv;
use crate::error::ProviderError;
use crate::usage::UsageCapture;

/// A driver turns one packet into one invocation and parses that run's
/// output.
///
/// No driver inspects `packet.provider_hints.provider`: picking which driver
/// runs a packet is the wave-4 caller's job, and handing a packet to the
/// wrong driver is a caller bug this crate does not detect and does not
/// report.
pub trait ProviderDriver: Send + Sync {
    /// The driver's stable name: `"claude"`, `"codex"`, or `"pi"`. Every
    /// [`crate::UsageRow`] the driver produces carries this as its
    /// `provider`.
    fn name(&self) -> &'static str;

    /// Build the provider command and paths the caller materializes around it.
    fn invocation(
        &self,
        packet: &WorkPacket,
        dirs: &PacketDirs,
        claim_token: &str,
    ) -> Result<Invocation, ProviderError>;

    /// Parse the captured stdout of one run into usage rows.
    ///
    /// `model` is the caller-supplied fallback. Rows use it everywhere
    /// except the claude `modelUsage` branch, whose keys name each row's
    /// model; every other provider-reported model field is ignored.
    fn parse_usage(&self, stdout: &str, model: &str) -> Result<UsageCapture, ProviderError>;
}

/// One immutable provider-attempt directory beneath a packet directory.
///
/// Pure path arithmetic: `PacketDirs` never creates a directory, never
/// writes `prompt.md`, never reads `out.jsonl`, and never checks existence —
/// wave 4 materializes the directory and renders the prompt into
/// [`PacketDirs::prompt`] before spawning, then reads
/// [`PacketDirs::stdout`] back and hands the text to
/// [`ProviderDriver::parse_usage`]. [`crate::recover_usage_from_rollout`]
/// is the only filesystem access in this crate.
#[derive(Debug, Clone, PartialEq)]
pub struct PacketDirs {
    packet_dir: PathBuf,
    attempt_dir: PathBuf,
}

impl PacketDirs {
    /// Address one attempt beneath `packet_dir`.
    pub fn new(packet_dir: impl Into<PathBuf>, attempt_id: i64) -> Self {
        let packet_dir = packet_dir.into();
        let attempt_dir = packet_dir.join("attempts").join(attempt_id.to_string());
        Self {
            packet_dir,
            attempt_dir,
        }
    }

    /// The semantic packet directory shared by all its attempts.
    pub fn packet_path(&self) -> &Path {
        &self.packet_dir
    }

    /// `<packet>/attempts/<attempt-id>` — immutable evidence for one try.
    pub fn path(&self) -> &Path {
        &self.attempt_dir
    }

    /// Owned form of `<packet>/attempts/<attempt-id>`.
    pub fn attempt_path(&self) -> PathBuf {
        self.attempt_dir.clone()
    }

    /// `<attempt>/prompt.md` — the rendered prompt the provider reads.
    pub fn prompt(&self) -> PathBuf {
        self.attempt_path().join("prompt.md")
    }

    /// `<attempt>/out.jsonl` — the finalized provider stdout stream.
    pub fn stdout(&self) -> PathBuf {
        self.attempt_path().join("out.jsonl")
    }

    /// The private streaming target, promoted to [`PacketDirs::stdout`]
    /// only after the provider is terminal.
    pub fn stdout_working(&self) -> PathBuf {
        self.attempt_path().join(".out.jsonl.incomplete")
    }

    /// `<attempt>/last.txt` — finalized codex last-message material.
    pub fn last_message(&self) -> PathBuf {
        self.attempt_path().join("last.txt")
    }

    /// The private codex `-o` target, promoted after process exit.
    pub fn last_message_working(&self) -> PathBuf {
        self.attempt_path().join(".last.txt.incomplete")
    }

    /// `<attempt>/result.json` — forged's harvested outcome evidence.
    pub fn result(&self) -> PathBuf {
        self.attempt_path().join("result.json")
    }

    /// `<attempt>/session.json` — bounded session provenance, never env.
    pub fn session(&self) -> PathBuf {
        self.attempt_path().join("session.json")
    }

    /// `<attempt>/manifest.json` — written only after every named artifact.
    pub fn manifest(&self) -> PathBuf {
        self.attempt_path().join("manifest.json")
    }

    /// Process identity is attempt-scoped too; a retry never removes it.
    pub fn provider_pid(&self) -> PathBuf {
        self.attempt_path().join("provider.pid")
    }

    /// Process start stamp paired with [`PacketDirs::provider_pid`].
    pub fn provider_lstart(&self) -> PathBuf {
        self.attempt_path().join("provider.lstart")
    }

    /// Host sentinel root for this attempt.
    pub fn status(&self) -> PathBuf {
        self.attempt_path().join("status")
    }

    /// Private, immutable input for the exact hidden provider runner.
    pub fn provider_stream_request(&self) -> PathBuf {
        self.attempt_path().join(".provider-stream-request.json")
    }

    /// Private terminal control record written by the hidden provider runner.
    pub fn provider_stream_status(&self) -> PathBuf {
        self.attempt_path().join(".provider-stream-status.json")
    }
}

/// One provider run and the paths it references.
#[derive(Debug, Clone, PartialEq)]
pub struct Invocation {
    pub(crate) argv: ProviderArgv,
    /// The prompt file the line redirects into stdin.
    pub prompt_path: PathBuf,
    /// The stdout capture file the line redirects into.
    pub stdout_path: PathBuf,
    /// The session identifier the caller can correlate on before any
    /// output exists: [`crate::ClaudeDriver`] sets
    /// `Some(claude_session_id(claim_token))` — the same value it embeds
    /// in `--session-id`; [`crate::CodexDriver`] and [`crate::PiDriver`] set
    /// `None` (Codex mints its thread id at runtime, while ephemeral Pi
    /// packet sessions deliberately publish no native session identity).
    pub session_hint: Option<String>,
}

impl Invocation {
    /// Render the provider environment, argv, and capture paths as one shell line.
    pub fn shell_line(&self) -> Result<String, ProviderError> {
        self.argv.shell_line(&self.prompt_path, &self.stdout_path)
    }
}

/// Validate a path this crate embeds in a shell line: non-empty, valid
/// UTF-8, and every character in `[A-Za-z0-9/._-]` — `forged-host`'s
/// `validate_status_path` rule. The only producer of
/// [`ProviderError::UnsafePath`].
pub(crate) fn validate_embedded_path(path: &Path) -> Result<String, ProviderError> {
    let Some(text) = path.to_str() else {
        return Err(ProviderError::UnsafePath {
            path: path.display().to_string(),
            reason: "path is not valid UTF-8".to_owned(),
        });
    };
    let safe = !text.is_empty()
        && text
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '/' | '.' | '_' | '-'));
    if safe {
        Ok(text.to_owned())
    } else {
        Err(ProviderError::UnsafePath {
            path: text.to_owned(),
            reason: "path is empty or contains characters outside [A-Za-z0-9/._-]".to_owned(),
        })
    }
}

/// Validate a reasoning effort before embedding it: matching
/// `^[A-Za-z0-9._-]{1,64}$`, else [`ProviderError::UnsupportedEffort`].
///
/// The charset is what keeps the value safe inside the codex single-quoted
/// TOML `-c` override and the bare pi `--thinking` argument. Effort
/// vocabulary is deliberately NOT validated here: the provider CLI is the
/// authority on which efforts exist, and a value it rejects fails the
/// attempt with the CLI's own error instead of a stale forged allowlist.
pub(crate) fn validate_effort(effort: &str) -> Result<(), ProviderError> {
    let safe = (1..=64).contains(&effort.len())
        && effort
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-'));
    if safe {
        Ok(())
    } else {
        Err(ProviderError::UnsupportedEffort {
            effort: effort.to_owned(),
        })
    }
}

/// Validate a model string before embedding it: non-empty and matching
/// `^[A-Za-z0-9][A-Za-z0-9._:/-]*$`, else `UnsafeShellLine` naming the
/// offending value.
pub(crate) fn validate_model(model: &str) -> Result<(), ProviderError> {
    let mut chars = model.chars();
    let head_ok = chars.next().is_some_and(|c| c.is_ascii_alphanumeric());
    let rest_ok =
        chars.all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | ':' | '/' | '-'));
    if head_ok && rest_ok {
        Ok(())
    } else {
        Err(ProviderError::UnsafeShellLine {
            value: model.to_owned(),
            reason: "model must be non-empty and match ^[A-Za-z0-9][A-Za-z0-9._:/-]*$".to_owned(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn packet_dirs_is_pure_path_arithmetic() {
        let dirs = PacketDirs::new("/tmp/run-1/packets/pkt-1", 7);
        assert_eq!(dirs.packet_path(), Path::new("/tmp/run-1/packets/pkt-1"));
        assert_eq!(
            dirs.attempt_path(),
            PathBuf::from("/tmp/run-1/packets/pkt-1/attempts/7")
        );
        assert_eq!(
            dirs.prompt(),
            PathBuf::from("/tmp/run-1/packets/pkt-1/attempts/7/prompt.md")
        );
        assert_eq!(
            dirs.stdout(),
            PathBuf::from("/tmp/run-1/packets/pkt-1/attempts/7/out.jsonl")
        );
        assert_eq!(
            dirs.last_message(),
            PathBuf::from("/tmp/run-1/packets/pkt-1/attempts/7/last.txt")
        );
    }

    #[test]
    fn embedded_path_charset_rule() {
        assert!(validate_embedded_path(Path::new("/tmp/run-1/pkt.d/out_1.jsonl")).is_ok());
        for bad in [
            "",
            "/tmp/bad dir/x",
            "/tmp/bad;x",
            "/tmp/bad$x",
            "/tmp/bad\nx",
        ] {
            assert!(
                matches!(
                    validate_embedded_path(Path::new(bad)),
                    Err(ProviderError::UnsafePath { .. })
                ),
                "{bad:?} should be unsafe"
            );
        }
    }

    #[test]
    fn effort_charset_rule() {
        for ok in ["minimal", "xhigh", "max", "ultra", "future.tier-2", "a"] {
            assert!(validate_effort(ok).is_ok(), "{ok} should be safe");
        }
        let long = "x".repeat(65);
        for bad in ["", "xhigh\"'", "hi gh", "x;rm", "e$fort", long.as_str()] {
            assert!(
                matches!(
                    validate_effort(bad),
                    Err(ProviderError::UnsupportedEffort { .. })
                ),
                "{bad:?} should be unsafe"
            );
        }
    }

    #[test]
    fn model_charset_rule() {
        for ok in [
            "opus",
            "gpt-5.6-sol",
            "a",
            "claude-fable-5",
            "org/model:tag",
        ] {
            assert!(validate_model(ok).is_ok(), "{ok} should be safe");
        }
        for bad in ["", "x; rm -rf /", "-model", ".hidden", "mo del", "m\nodel"] {
            assert!(
                matches!(
                    validate_model(bad),
                    Err(ProviderError::UnsafeShellLine { .. })
                ),
                "{bad:?} should be unsafe"
            );
        }
    }
}
