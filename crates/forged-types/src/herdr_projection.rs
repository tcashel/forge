//! Closed durable contract for display and custom-lifecycle projections onto
//! exact Forged-owned Herdr panes.
//!
//! A projection is presentation only.  In particular this contract has no
//! native-session source or path field: provider-native ids are bounded data
//! which may be shown as metadata, never authority to attach or resume.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::{Stage, WorkIdentitySubjectV1};

pub const HERDR_PANE_PROJECTION_SCHEMA_V1: &str = "forged.herdr-pane-projection/1";
pub const HERDR_PROJECTION_VALUE_MAX_BYTES: usize = 80;
pub const HERDR_PROJECTION_TITLE_MAX_BYTES: usize = 160;
pub const HERDR_PROJECTION_TOKEN_MAX: usize = 16;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HerdrProjectionTargetKind {
    Anchor,
    Controller,
    Attempt,
}

impl HerdrProjectionTargetKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Anchor => "anchor",
            Self::Controller => "controller",
            Self::Attempt => "attempt",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HerdrProjectionLifecycle {
    Working,
    Unknown,
}

impl HerdrProjectionLifecycle {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Working => "working",
            Self::Unknown => "unknown",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HerdrSessionEvidenceSource {
    ClaudeOutput,
    CodexThreadStarted,
}

impl HerdrSessionEvidenceSource {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::ClaudeOutput => "claude-output",
            Self::CodexThreadStarted => "codex-thread-started",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(
    tag = "kind",
    rename_all = "kebab-case",
    rename_all_fields = "camelCase",
    deny_unknown_fields
)]
pub enum HerdrProjectionTargetV1 {
    Anchor {
        layout_id: String,
        layout_revision: u32,
    },
    Controller {
        ownership_id: String,
        generation: u32,
    },
    Attempt {
        ownership_id: String,
        run_id: String,
        packet_id: String,
        attempt_id: i64,
        claim_token: String,
        controller_generation: Option<u32>,
        stage: Stage,
        provider: String,
        model: String,
    },
}

impl HerdrProjectionTargetV1 {
    pub fn kind(&self) -> HerdrProjectionTargetKind {
        match self {
            Self::Anchor { .. } => HerdrProjectionTargetKind::Anchor,
            Self::Controller { .. } => HerdrProjectionTargetKind::Controller,
            Self::Attempt { .. } => HerdrProjectionTargetKind::Attempt,
        }
    }

    fn exact_key(&self) -> String {
        match self {
            Self::Anchor {
                layout_id,
                layout_revision,
            } => format!("anchor\0{layout_id}\0{layout_revision}"),
            Self::Controller {
                ownership_id,
                generation,
            } => format!("controller\0{ownership_id}\0{generation}"),
            Self::Attempt {
                ownership_id,
                attempt_id,
                claim_token,
                ..
            } => format!("attempt\0{ownership_id}\0{attempt_id}\0{claim_token}"),
        }
    }
}

/// Immutable identity for one exact projection target.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct HerdrPaneProjectionV1 {
    pub schema: String,
    pub projection_id: String,
    pub subject: WorkIdentitySubjectV1,
    pub target: HerdrProjectionTargetV1,
    pub pane_id: String,
    pub socket_path: String,
    pub protocol: u32,
    pub metadata_source: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lifecycle_source: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lifecycle_agent: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum HerdrProjectionValidationError {
    #[error("unsupported Herdr projection schema {0:?}")]
    UnsupportedSchema(String),
    #[error("Herdr projection field {0} must be non-empty")]
    EmptyField(&'static str),
    #[error("Herdr projection protocol must be 19")]
    InvalidProtocol,
    #[error("Herdr projection id or source does not match its exact target")]
    UnstableSource,
    #[error("only an attempt may own custom lifecycle authority")]
    InvalidLifecycleShape,
    #[error("unsupported projection provider {0:?}")]
    UnsupportedProvider(String),
    #[error("provider session id must be complete, non-empty, control-free, and at most 80 bytes")]
    InvalidProviderSession,
}

fn digest(value: &str) -> String {
    Sha256::digest(value.as_bytes())
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>()
}

/// Deterministic id and disjoint custom sources derived only from immutable
/// exact target identity.  All spellings satisfy Herdr protocol-19 source
/// syntax and are well below its 80-byte limit.
pub fn herdr_projection_names(target: &HerdrProjectionTargetV1) -> (String, String, String) {
    let target_hash = digest(&target.exact_key());
    let projection_id = format!("projection-{}", &target_hash[..32]);
    let source_hash = digest(&projection_id);
    let short = &source_hash[..32];
    (
        projection_id,
        format!("forged:projection:metadata:{short}"),
        format!("forged:projection:lifecycle:{short}"),
    )
}

pub fn validate_provider_session_id(value: &str) -> Result<(), HerdrProjectionValidationError> {
    if value.is_empty()
        || value.len() > HERDR_PROJECTION_VALUE_MAX_BYTES
        || value.chars().any(char::is_control)
    {
        return Err(HerdrProjectionValidationError::InvalidProviderSession);
    }
    Ok(())
}

impl HerdrPaneProjectionV1 {
    pub fn validate(&self) -> Result<(), HerdrProjectionValidationError> {
        if self.schema != HERDR_PANE_PROJECTION_SCHEMA_V1 {
            return Err(HerdrProjectionValidationError::UnsupportedSchema(
                self.schema.clone(),
            ));
        }
        for (field, value) in [
            ("projectionId", self.projection_id.as_str()),
            ("subject.id", self.subject.id.as_str()),
            ("paneId", self.pane_id.as_str()),
            ("socketPath", self.socket_path.as_str()),
            ("metadataSource", self.metadata_source.as_str()),
        ] {
            if value.is_empty() {
                return Err(HerdrProjectionValidationError::EmptyField(field));
            }
        }
        if self.protocol != 19 {
            return Err(HerdrProjectionValidationError::InvalidProtocol);
        }
        let (projection_id, metadata_source, lifecycle_source) =
            herdr_projection_names(&self.target);
        if self.projection_id != projection_id || self.metadata_source != metadata_source {
            return Err(HerdrProjectionValidationError::UnstableSource);
        }
        match &self.target {
            HerdrProjectionTargetV1::Anchor {
                layout_id,
                layout_revision,
            } => {
                if layout_id.is_empty() || *layout_revision == 0 {
                    return Err(HerdrProjectionValidationError::EmptyField("anchor target"));
                }
                if self.lifecycle_source.is_some() || self.lifecycle_agent.is_some() {
                    return Err(HerdrProjectionValidationError::InvalidLifecycleShape);
                }
            }
            HerdrProjectionTargetV1::Controller {
                ownership_id,
                generation,
            } => {
                if ownership_id.is_empty() || *generation == 0 {
                    return Err(HerdrProjectionValidationError::EmptyField(
                        "controller target",
                    ));
                }
                if self.lifecycle_source.is_some() || self.lifecycle_agent.is_some() {
                    return Err(HerdrProjectionValidationError::InvalidLifecycleShape);
                }
            }
            HerdrProjectionTargetV1::Attempt {
                ownership_id,
                run_id,
                packet_id,
                attempt_id,
                claim_token,
                provider,
                model,
                ..
            } => {
                if [ownership_id, run_id, packet_id, claim_token, model]
                    .iter()
                    .any(|value| value.is_empty())
                    || *attempt_id <= 0
                {
                    return Err(HerdrProjectionValidationError::EmptyField("attempt target"));
                }
                if provider != "claude" && provider != "codex" {
                    return Err(HerdrProjectionValidationError::UnsupportedProvider(
                        provider.clone(),
                    ));
                }
                if self.lifecycle_source.as_deref() != Some(lifecycle_source.as_str())
                    || self.lifecycle_agent.as_deref() != Some(provider.as_str())
                    || lifecycle_source.starts_with("herdr:")
                {
                    return Err(HerdrProjectionValidationError::InvalidLifecycleShape);
                }
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::WorkIdentitySubjectKind;

    #[test]
    fn sources_are_stable_disjoint_and_never_official() {
        let target = HerdrProjectionTargetV1::Attempt {
            ownership_id: "own-1".into(),
            run_id: "run-1".into(),
            packet_id: "run-1/implement/1".into(),
            attempt_id: 7,
            claim_token: "claim-7".into(),
            controller_generation: None,
            stage: Stage::Implement,
            provider: "codex".into(),
            model: "gpt-5".into(),
        };
        let names = herdr_projection_names(&target);
        assert_eq!(names, herdr_projection_names(&target));
        assert_ne!(names.1, names.2);
        assert!(!names.1.starts_with("herdr:"));
        assert!(!names.2.starts_with("herdr:"));
        let projection = HerdrPaneProjectionV1 {
            schema: HERDR_PANE_PROJECTION_SCHEMA_V1.into(),
            projection_id: names.0,
            subject: WorkIdentitySubjectV1 {
                kind: WorkIdentitySubjectKind::Run,
                id: "run-1".into(),
            },
            target,
            pane_id: "p:1".into(),
            socket_path: "/tmp/herdr.sock".into(),
            protocol: 19,
            metadata_source: names.1,
            lifecycle_source: Some(names.2),
            lifecycle_agent: Some("codex".into()),
        };
        projection.validate().unwrap();
    }

    #[test]
    fn session_id_boundary_is_exact_and_never_truncated() {
        assert!(validate_provider_session_id(&"x".repeat(80)).is_ok());
        assert!(validate_provider_session_id(&"x".repeat(81)).is_err());
        assert!(validate_provider_session_id("").is_err());
        assert!(validate_provider_session_id("bad\nvalue").is_err());
    }
}
