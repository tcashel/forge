//! Bounded, incremental provider-native session evidence discovery.
//!
//! This parser returns data to Forged. It has no Herdr dependency and cannot
//! publish a native session reference or path.

use forged_types::{validate_provider_session_id, HerdrSessionEvidenceSource};
use serde_json::Value;

/// Maximum stdout prefix inspected for one provider attempt.
pub const SESSION_DISCOVERY_MAX_BYTES: usize = 64 * 1024;
const PARTIAL_LINE_MAX_BYTES: usize = 8 * 1024;

/// Result of one incremental discovery pass.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SessionEvidenceUpdate {
    /// No authoritative envelope has arrived and the fixed cap remains.
    Pending,
    /// A complete, bounded id was observed in the provider's own output.
    Confirmed {
        /// Complete provider-native id, never truncated.
        session_id: String,
        /// Closed envelope shape which supplied the id.
        source: HerdrSessionEvidenceSource,
    },
    /// Bounded non-authoritative detail; nothing may publish as confirmed.
    Diagnostic(String),
}

/// Stateful prefix scanner for output which may end between JSON lines.
#[derive(Debug, Clone)]
pub struct ProviderSessionScanner {
    provider: String,
    bytes_seen: usize,
    partial: Vec<u8>,
    terminal: Option<SessionEvidenceUpdate>,
    diagnostic: Option<String>,
}

impl ProviderSessionScanner {
    /// Start a scanner for the closed `claude` or `codex` provider name.
    pub fn new(provider: impl Into<String>) -> Self {
        Self {
            provider: provider.into(),
            bytes_seen: 0,
            partial: Vec::new(),
            terminal: None,
            diagnostic: None,
        }
    }

    /// Number of newly appended bytes inspected so far.
    pub fn bytes_seen(&self) -> usize {
        self.bytes_seen
    }

    /// Whether confirmation or bounded exhaustion stopped future reads.
    pub fn is_terminal(&self) -> bool {
        self.terminal.is_some()
    }

    /// Ingest only newly appended bytes. A caller may invoke this on a fixed
    /// cadence and pass `complete=true` once after provider termination.
    pub fn ingest(&mut self, chunk: &[u8], complete: bool) -> SessionEvidenceUpdate {
        if let Some(outcome) = &self.terminal {
            return outcome.clone();
        }
        if !matches!(self.provider.as_str(), "claude" | "codex") {
            let outcome = SessionEvidenceUpdate::Diagnostic(format!(
                "unsupported provider session evidence source {:?}",
                self.provider
            ));
            self.terminal = Some(outcome.clone());
            return outcome;
        }
        let remaining = SESSION_DISCOVERY_MAX_BYTES.saturating_sub(self.bytes_seen);
        let take = chunk.len().min(remaining);
        self.bytes_seen = self.bytes_seen.saturating_add(take);
        self.partial.extend_from_slice(&chunk[..take]);

        let mut consumed = 0;
        while let Some(relative) = self.partial[consumed..]
            .iter()
            .position(|byte| *byte == b'\n')
        {
            let end = consumed + relative;
            let line = self.partial[consumed..end].to_vec();
            if let Some(outcome) = self.parse_line(&line) {
                self.terminal = Some(outcome.clone());
                return outcome;
            }
            consumed = end + 1;
        }
        if consumed > 0 {
            self.partial.drain(..consumed);
        }
        if self.partial.len() > PARTIAL_LINE_MAX_BYTES {
            self.diagnostic = Some("provider session evidence line exceeds bounded window".into());
            self.partial.clear();
        }
        if complete && !self.partial.is_empty() {
            let tail = std::mem::take(&mut self.partial);
            if let Some(outcome) = self.parse_line(&tail) {
                self.terminal = Some(outcome.clone());
                return outcome;
            }
        }
        if chunk.len() > take || self.bytes_seen == SESSION_DISCOVERY_MAX_BYTES || complete {
            let outcome =
                SessionEvidenceUpdate::Diagnostic(self.diagnostic.take().unwrap_or_else(|| {
                    if self.bytes_seen == SESSION_DISCOVERY_MAX_BYTES {
                        "provider session evidence not found within bounded prefix".into()
                    } else {
                        "provider session evidence not found".into()
                    }
                }));
            self.terminal = Some(outcome.clone());
            return outcome;
        }
        SessionEvidenceUpdate::Pending
    }

    fn parse_line(&mut self, bytes: &[u8]) -> Option<SessionEvidenceUpdate> {
        if bytes.iter().all(u8::is_ascii_whitespace) {
            return None;
        }
        let Ok(value) = serde_json::from_slice::<Value>(bytes) else {
            // Provider streams may contain unrelated text. Keep a bounded
            // diagnostic but continue looking for authoritative envelopes.
            self.diagnostic.get_or_insert_with(|| {
                "malformed provider output while discovering session".into()
            });
            return None;
        };
        let object = value.as_object()?;
        let (candidate, source) = if self.provider == "claude" {
            let Some(Value::String(session_id)) = object.get("session_id") else {
                return None;
            };
            (session_id, HerdrSessionEvidenceSource::ClaudeOutput)
        } else {
            if object.get("type").and_then(Value::as_str) != Some("thread.started") {
                return None;
            }
            let Some(Value::String(thread_id)) = object.get("thread_id") else {
                self.diagnostic = Some("codex thread.started has no string thread_id".into());
                return None;
            };
            (thread_id, HerdrSessionEvidenceSource::CodexThreadStarted)
        };
        if validate_provider_session_id(candidate).is_err() {
            self.diagnostic = Some(
                "provider session evidence is empty, control-containing, or over 80 bytes".into(),
            );
            return None;
        }
        Some(SessionEvidenceUpdate::Confirmed {
            session_id: candidate.clone(),
            source,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn codex_handles_partial_and_late_thread_started() {
        let mut scanner = ProviderSessionScanner::new("codex");
        assert_eq!(
            scanner.ingest(
                br#"{"type":"turn.started"}
{"type":"thread.st"#,
                false
            ),
            SessionEvidenceUpdate::Pending
        );
        assert_eq!(
            scanner.ingest(
                br#"arted","thread_id":"thread-7"}
"#,
                false
            ),
            SessionEvidenceUpdate::Confirmed {
                session_id: "thread-7".into(),
                source: HerdrSessionEvidenceSource::CodexThreadStarted,
            }
        );
    }

    #[test]
    fn claude_waits_for_output_and_boundary_is_complete() {
        let mut scanner = ProviderSessionScanner::new("claude");
        assert_eq!(
            scanner.ingest(b"noise\n", false),
            SessionEvidenceUpdate::Pending
        );
        let id = "x".repeat(80);
        assert_eq!(
            scanner.ingest(
                format!(
                    r#"{{"session_id":"{id}"}}
"#
                )
                .as_bytes(),
                true
            ),
            SessionEvidenceUpdate::Confirmed {
                session_id: id,
                source: HerdrSessionEvidenceSource::ClaudeOutput,
            }
        );
    }

    #[test]
    fn malformed_and_oversized_evidence_never_truncates_into_confirmation() {
        let mut scanner = ProviderSessionScanner::new("codex");
        let oversized = "x".repeat(81);
        let update = scanner.ingest(
            format!(
                r#"{{"type":"thread.started","thread_id":"{oversized}"}}
"#
            )
            .as_bytes(),
            true,
        );
        assert!(matches!(update, SessionEvidenceUpdate::Diagnostic(_)));
    }

    #[test]
    fn fixed_cap_stops_unbounded_scanning() {
        let mut scanner = ProviderSessionScanner::new("codex");
        let update = scanner.ingest(&vec![b'x'; SESSION_DISCOVERY_MAX_BYTES + 10], false);
        assert!(matches!(update, SessionEvidenceUpdate::Diagnostic(_)));
        assert_eq!(scanner.bytes_seen(), SESSION_DISCOVERY_MAX_BYTES);
    }
}
