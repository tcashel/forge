//! Identifier newtypes and token generators shared across forged crates.

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Fixed namespace for deriving deterministic claude session ids (UUID v5)
/// from claim tokens. The bytes spell `forged-session!!`.
const CLAUDE_SESSION_NAMESPACE: Uuid = Uuid::from_bytes(*b"forged-session!!");

/// A validated run identifier: `^[A-Za-z0-9][A-Za-z0-9._-]*$`, at most 128
/// characters.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(try_from = "String", into = "String")]
pub struct RunId(String);

/// Why a candidate run id was rejected.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum RunIdError {
    #[error("run id must be 1..=128 bytes, got {0}")]
    Length(usize),
    #[error("run id must match ^[A-Za-z0-9][A-Za-z0-9._-]*$")]
    Charset,
}

impl RunId {
    /// Validate `raw` as a run id.
    pub fn new(raw: impl Into<String>) -> Result<Self, RunIdError> {
        let raw = raw.into();
        if raw.is_empty() || raw.len() > 128 {
            return Err(RunIdError::Length(raw.len()));
        }
        let bytes = raw.as_bytes();
        let first = *bytes.first().ok_or(RunIdError::Length(0))?;
        if !first.is_ascii_alphanumeric() {
            return Err(RunIdError::Charset);
        }
        let rest_ok = bytes
            .iter()
            .skip(1)
            .all(|&b| b.is_ascii_alphanumeric() || matches!(b, b'.' | b'_' | b'-'));
        if !rest_ok {
            return Err(RunIdError::Charset);
        }
        Ok(Self(raw))
    }

    /// The validated id as a string slice.
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for RunId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl TryFrom<String> for RunId {
    type Error = RunIdError;

    fn try_from(raw: String) -> Result<Self, Self::Error> {
        Self::new(raw)
    }
}

impl From<RunId> for String {
    fn from(id: RunId) -> Self {
        id.0
    }
}

/// Mint a fresh claim token: a UUID v7 in canonical string form.
pub fn new_claim_token() -> String {
    Uuid::now_v7().to_string()
}

/// Derive the deterministic claude session id for a claim token: a UUID v5
/// over the fixed forged namespace.
pub fn claude_session_id(claim_token: &str) -> String {
    Uuid::new_v5(&CLAUDE_SESSION_NAMESPACE, claim_token.as_bytes()).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_valid_run_ids() {
        for raw in ["a", "A", "7", "run-1", "Run_2.stage-3", "a.b_c-d9"] {
            assert!(RunId::new(raw).is_ok(), "{raw} should be valid");
        }
        let max = "a".repeat(128);
        assert!(RunId::new(max).is_ok());
    }

    #[test]
    fn rejects_invalid_run_ids() {
        assert_eq!(RunId::new(""), Err(RunIdError::Length(0)));
        assert_eq!(RunId::new("a".repeat(129)), Err(RunIdError::Length(129)));
        for raw in [
            "-run", ".run", "_run", "run 1", "run/1", "run$", "é", "ru\né",
        ] {
            assert_eq!(RunId::new(raw), Err(RunIdError::Charset), "{raw:?}");
        }
    }

    #[test]
    fn run_id_round_trips_and_validates_on_deserialize() {
        let id = RunId::new("run-42").expect("valid");
        let text = serde_json::to_string(&id).expect("serializes");
        assert_eq!(text, "\"run-42\"");
        let back: RunId = serde_json::from_str(&text).expect("deserializes");
        assert_eq!(back, id);
        assert_eq!(back.as_str(), "run-42");
        assert_eq!(back.to_string(), "run-42");

        assert!(serde_json::from_str::<RunId>("\"-bad\"").is_err());
        assert!(serde_json::from_str::<RunId>("\"\"").is_err());
    }

    #[test]
    fn claim_tokens_are_unique_v7_uuids() {
        let a = new_claim_token();
        let b = new_claim_token();
        assert_ne!(a, b);
        for token in [&a, &b] {
            let parsed = Uuid::parse_str(token).expect("claim token is a UUID");
            assert_eq!(parsed.get_version_num(), 7);
        }
    }

    #[test]
    fn session_ids_are_deterministic_v5_uuids() {
        let token = "0198b0d2-0000-7000-8000-000000000000";
        let first = claude_session_id(token);
        let second = claude_session_id(token);
        assert_eq!(first, second);
        let parsed = Uuid::parse_str(&first).expect("session id is a UUID");
        assert_eq!(parsed.get_version_num(), 5);
        assert_ne!(first, claude_session_id("another-token"));
    }
}
