//! Durable identity for one Forged-owned Herdr work layout.
//!
//! Canonical subject and transport ids are ownership evidence. Labels are
//! bounded presentation only and are never selectors.

use serde::{Deserialize, Serialize};

pub const HERDR_LAYOUT_SCHEMA_V1: &str = "forged.herdr-layout/1";
pub const HERDR_LAYOUT_LABEL_MAX_BYTES: usize = 160;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HerdrLayoutSubjectKind {
    Run,
    Epic,
}

impl HerdrLayoutSubjectKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Run => "run",
            Self::Epic => "epic",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct HerdrLayoutSubjectV1 {
    pub kind: HerdrLayoutSubjectKind,
    pub id: String,
}

/// Immutable coordinates registered after `tab.create` returns successfully.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct HerdrLayoutV1 {
    pub schema: String,
    pub layout_id: String,
    pub revision: u32,
    pub subject: HerdrLayoutSubjectV1,
    pub socket_path: String,
    pub protocol: u32,
    pub workspace_id: String,
    pub tab_id: String,
    pub root_pane_id: String,
    pub display_label: String,
    pub predecessor_layout_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum HerdrLayoutValidationError {
    #[error("unsupported Herdr layout schema {0:?}")]
    UnsupportedSchema(String),
    #[error("Herdr layout field {0} must be non-empty")]
    EmptyField(&'static str),
    #[error("Herdr layout revision must be positive")]
    InvalidRevision,
    #[error("Herdr layout protocol must be 19")]
    InvalidProtocol,
    #[error("Herdr layout display label exceeds {HERDR_LAYOUT_LABEL_MAX_BYTES} bytes")]
    LabelTooLong,
}

impl HerdrLayoutV1 {
    pub fn validate(&self) -> Result<(), HerdrLayoutValidationError> {
        if self.schema != HERDR_LAYOUT_SCHEMA_V1 {
            return Err(HerdrLayoutValidationError::UnsupportedSchema(
                self.schema.clone(),
            ));
        }
        for (field, value) in [
            ("layoutId", self.layout_id.as_str()),
            ("subject.id", self.subject.id.as_str()),
            ("socketPath", self.socket_path.as_str()),
            ("workspaceId", self.workspace_id.as_str()),
            ("tabId", self.tab_id.as_str()),
            ("rootPaneId", self.root_pane_id.as_str()),
            ("displayLabel", self.display_label.as_str()),
        ] {
            if value.trim().is_empty() {
                return Err(HerdrLayoutValidationError::EmptyField(field));
            }
        }
        if self.revision == 0 {
            return Err(HerdrLayoutValidationError::InvalidRevision);
        }
        if self.protocol != 19 {
            return Err(HerdrLayoutValidationError::InvalidProtocol);
        }
        if self.display_label.len() > HERDR_LAYOUT_LABEL_MAX_BYTES {
            return Err(HerdrLayoutValidationError::LabelTooLong);
        }
        if self
            .predecessor_layout_id
            .as_deref()
            .is_some_and(|value| value.trim().is_empty())
        {
            return Err(HerdrLayoutValidationError::EmptyField(
                "predecessorLayoutId",
            ));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> HerdrLayoutV1 {
        HerdrLayoutV1 {
            schema: HERDR_LAYOUT_SCHEMA_V1.to_owned(),
            layout_id: "layout-1".to_owned(),
            revision: 1,
            subject: HerdrLayoutSubjectV1 {
                kind: HerdrLayoutSubjectKind::Run,
                id: "run-1".to_owned(),
            },
            socket_path: "/tmp/herdr.sock".to_owned(),
            protocol: 19,
            workspace_id: "workspace:1".to_owned(),
            tab_id: "tab:1".to_owned(),
            root_pane_id: "pane:root".to_owned(),
            display_label: "A run [run:run-1]".to_owned(),
            predecessor_layout_id: None,
        }
    }

    #[test]
    fn identity_and_vocabulary_are_closed() {
        let value = serde_json::to_value(fixture()).expect("encode");
        let decoded: HerdrLayoutV1 = serde_json::from_value(value.clone()).expect("decode");
        assert_eq!(decoded, fixture());
        assert!(decoded.validate().is_ok());

        let mut unknown = value;
        unknown["subject"]["kind"] = serde_json::json!("job");
        assert!(serde_json::from_value::<HerdrLayoutV1>(unknown).is_err());
    }

    #[test]
    fn validation_rejects_unbounded_or_unaddressable_identity() {
        let mut layout = fixture();
        layout.display_label = "x".repeat(HERDR_LAYOUT_LABEL_MAX_BYTES + 1);
        assert_eq!(
            layout.validate(),
            Err(HerdrLayoutValidationError::LabelTooLong)
        );
        layout = fixture();
        layout.protocol = 20;
        assert_eq!(
            layout.validate(),
            Err(HerdrLayoutValidationError::InvalidProtocol)
        );
        layout = fixture();
        layout.root_pane_id.clear();
        assert_eq!(
            layout.validate(),
            Err(HerdrLayoutValidationError::EmptyField("rootPaneId"))
        );
    }
}
