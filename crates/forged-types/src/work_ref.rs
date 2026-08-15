//! Canonical address for work shown in operator projections.
//!
//! A work reference is deliberately smaller than [`crate::WorkIdentityV1`]:
//! it is the stable selector a caller can retain while identity remains
//! display context. Plan rows are addressable for comparison and
//! de-duplication, but only durable run/epic references are valid Work Detail
//! targets.

use serde::{Deserialize, Serialize};

pub const WORK_REF_SCHEMA_V1: &str = "forged.work-ref/1";

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkRefKind {
    Run,
    Epic,
    Plan,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkRefV1 {
    pub schema: String,
    pub kind: WorkRefKind,
    pub id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum WorkRefValidationError {
    #[error("unsupported work reference schema {0:?}")]
    UnsupportedSchema(String),
    #[error("work reference id must be non-empty")]
    EmptyId,
}

impl WorkRefV1 {
    pub fn new(kind: WorkRefKind, id: impl Into<String>) -> Result<Self, WorkRefValidationError> {
        let value = Self {
            schema: WORK_REF_SCHEMA_V1.to_owned(),
            kind,
            id: id.into(),
        };
        value.validate()?;
        Ok(value)
    }

    pub fn validate(&self) -> Result<(), WorkRefValidationError> {
        if self.schema != WORK_REF_SCHEMA_V1 {
            return Err(WorkRefValidationError::UnsupportedSchema(
                self.schema.clone(),
            ));
        }
        if self.id.trim().is_empty() {
            return Err(WorkRefValidationError::EmptyId);
        }
        Ok(())
    }

    pub fn is_detail_target(&self) -> bool {
        matches!(self.kind, WorkRefKind::Run | WorkRefKind::Epic)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn contract_is_closed_and_validated() {
        let value = WorkRefV1::new(WorkRefKind::Run, "run-1").expect("reference");
        assert_eq!(
            serde_json::to_value(&value).expect("serialize"),
            serde_json::json!({
                "schema": "forged.work-ref/1",
                "kind": "run",
                "id": "run-1",
            })
        );
        assert!(serde_json::from_value::<WorkRefV1>(serde_json::json!({
            "schema": "forged.work-ref/1",
            "kind": "packet",
            "id": "run-1",
        }))
        .is_err());
        assert!(serde_json::from_value::<WorkRefV1>(serde_json::json!({
            "schema": "forged.work-ref/1",
            "kind": "run",
            "id": "run-1",
            "extra": true,
        }))
        .is_err());
        assert_eq!(
            WorkRefV1::new(WorkRefKind::Plan, " ").expect_err("empty id"),
            WorkRefValidationError::EmptyId
        );
    }

    #[test]
    fn only_durable_subjects_are_detail_targets() {
        assert!(WorkRefV1::new(WorkRefKind::Run, "run")
            .expect("run")
            .is_detail_target());
        assert!(WorkRefV1::new(WorkRefKind::Epic, "epic")
            .expect("epic")
            .is_detail_target());
        assert!(!WorkRefV1::new(WorkRefKind::Plan, "bead")
            .expect("plan")
            .is_detail_target());
    }
}
