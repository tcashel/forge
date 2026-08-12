//! The driver trait, packet directory arithmetic, the invocation value, and
//! the shell-safety validators every embedded string passes through.

use std::path::{Path, PathBuf};

use forged_types::WorkPacket;
use serde::{Deserialize, Serialize};

use crate::error::ProviderError;
use crate::usage::UsageCapture;

/// A driver turns one packet into one shell line and parses that run's
/// output.
///
/// No driver inspects `packet.provider_hints.provider`: picking which driver
/// runs a packet is the wave-4 caller's job, and handing a packet to the
/// wrong driver is a caller bug this crate does not detect and does not
/// report.
pub trait ProviderDriver: Send + Sync {
    /// The driver's stable name: `"claude"` or `"codex"`. Every
    /// [`crate::UsageRow`] the driver produces carries this as its
    /// `provider`.
    fn name(&self) -> &'static str;

    /// Build the single shell line (without a sentinel — `forged-host`
    /// appends that) that runs this packet, plus the paths the caller
    /// materializes around it.
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

/// One packet directory; these four paths are its only contents.
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
}

impl PacketDirs {
    /// Wrap the packet directory path.
    pub fn new(packet_dir: impl Into<PathBuf>) -> Self {
        Self {
            packet_dir: packet_dir.into(),
        }
    }

    /// The packet directory itself.
    pub fn path(&self) -> &Path {
        &self.packet_dir
    }

    /// `<dir>/prompt.md` — the rendered prompt the provider reads on stdin.
    pub fn prompt(&self) -> PathBuf {
        self.packet_dir.join("prompt.md")
    }

    /// `<dir>/out.jsonl` — the captured provider stdout stream.
    pub fn stdout(&self) -> PathBuf {
        self.packet_dir.join("out.jsonl")
    }

    /// `<dir>/last.txt` — codex's `-o` last-message file (codex only).
    pub fn last_message(&self) -> PathBuf {
        self.packet_dir.join("last.txt")
    }
}

/// One provider run, ready to hand to a host: the shell line (sentinel-free)
/// and the paths it references.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Invocation {
    /// The single shell line that runs the packet. No sentinel — the host
    /// appends its own.
    pub shell_line: String,
    /// The prompt file the line redirects into stdin.
    pub prompt_path: PathBuf,
    /// The stdout capture file the line redirects into.
    pub stdout_path: PathBuf,
    /// The session identifier the caller can correlate on before any
    /// output exists: [`crate::ClaudeDriver`] sets
    /// `Some(claude_session_id(claim_token))` — the same value it embeds
    /// in `--session-id`; [`crate::CodexDriver`] sets `None` (codex mints
    /// its thread id at runtime, first observable in `thread.started`).
    pub session_hint: Option<String>,
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
        let dirs = PacketDirs::new("/tmp/run-1/packets/pkt-1");
        assert_eq!(dirs.path(), Path::new("/tmp/run-1/packets/pkt-1"));
        assert_eq!(
            dirs.prompt(),
            PathBuf::from("/tmp/run-1/packets/pkt-1/prompt.md")
        );
        assert_eq!(
            dirs.stdout(),
            PathBuf::from("/tmp/run-1/packets/pkt-1/out.jsonl")
        );
        assert_eq!(
            dirs.last_message(),
            PathBuf::from("/tmp/run-1/packets/pkt-1/last.txt")
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
