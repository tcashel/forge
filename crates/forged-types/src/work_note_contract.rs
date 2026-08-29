//! Closed payload contracts for typed work-item recommendation and approval notes.

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

pub const SPEC_RECOMMENDATIONS_SCHEMA_V1: &str = "forged.spec-recommendations/1";
pub const EXECUTION_APPROVAL_SCHEMA_V1: &str = "forged.execution-approval/1";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SpecRecommendationV1 {
    pub target: String,
    pub correction: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SpecRecommendationCruxV1 {
    pub id: String,
    pub evidence: Vec<String>,
    pub options: Vec<String>,
    pub recommendation: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub resolution: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SpecRejectedFindingV1 {
    pub finding: String,
    pub reason: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SpecRecommendationsV1 {
    pub schema: String,
    pub work_item: String,
    pub repository: String,
    pub reviewed_at: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub topology: Option<String>,
    pub recommendations: Vec<SpecRecommendationV1>,
    pub cruxes: Vec<SpecRecommendationCruxV1>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub open_questions: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rejected_findings: Option<Vec<SpecRejectedFindingV1>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub verification: Option<Vec<String>>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ExecutionApprovalV1 {
    pub schema: String,
    pub subject_kind: ExecutionApprovalSubjectKind,
    pub work_item_id: String,
    pub observed_revision: String,
    pub repository: String,
    pub base_ref: String,
    pub profile: String,
    pub roster: String,
    pub action: ExecutionApprovalAction,
    pub approved_at: String,
    pub actor: String,
    pub basis: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ExecutionApprovalSubjectKind {
    Slice,
    Epic,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ExecutionApprovalAction {
    RunStartSubmit,
    EpicStartSubmit,
}

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("field {field}: {reason}")]
pub struct WorkNoteContractError {
    pub field: String,
    pub reason: String,
}

impl SpecRecommendationsV1 {
    /// Parse the closed v1 shape while retaining a stable first-field error.
    pub fn parse_value(value: Value) -> Result<Self, WorkNoteContractError> {
        validate_spec_recommendations(&value)?;
        serde_json::from_value(value)
            .map_err(|error| violation("payload", format!("could not be decoded: {error}")))
    }
}

impl ExecutionApprovalV1 {
    /// Parse the closed v1 shape while retaining a stable first-field error.
    pub fn parse_value(value: Value) -> Result<Self, WorkNoteContractError> {
        validate_execution_approval(&value)?;
        serde_json::from_value(value)
            .map_err(|error| violation("payload", format!("could not be decoded: {error}")))
    }
}

fn validate_spec_recommendations(value: &Value) -> Result<(), WorkNoteContractError> {
    let object = value_object(value, "payload")?;
    required_schema(object, SPEC_RECOMMENDATIONS_SCHEMA_V1, None)?;
    required_string(object, "workItem", "workItem")?;
    required_string(object, "repository", "repository")?;
    required_string(object, "reviewedAt", "reviewedAt")?;
    optional_string(object, "topology", "topology")?;
    object_array(
        object,
        "recommendations",
        "recommendations",
        |entry, index| {
            required_string(entry, "target", &format!("recommendations[{index}].target"))?;
            required_string(
                entry,
                "correction",
                &format!("recommendations[{index}].correction"),
            )?;
            known_fields(
                entry,
                &["target", "correction"],
                &format!("recommendations[{index}]"),
            )
        },
    )?;
    object_array(object, "cruxes", "cruxes", |entry, index| {
        let prefix = format!("cruxes[{index}]");
        required_string(entry, "id", &format!("{prefix}.id"))?;
        string_array(entry, "evidence", &format!("{prefix}.evidence"), false)?;
        string_array(entry, "options", &format!("{prefix}.options"), false)?;
        required_string(entry, "recommendation", &format!("{prefix}.recommendation"))?;
        optional_string(entry, "resolution", &format!("{prefix}.resolution"))?;
        known_fields(
            entry,
            &["id", "evidence", "options", "recommendation", "resolution"],
            &prefix,
        )
    })?;
    string_array(object, "openQuestions", "openQuestions", true)?;
    optional_object_array(
        object,
        "rejectedFindings",
        "rejectedFindings",
        |entry, index| {
            let prefix = format!("rejectedFindings[{index}]");
            required_string(entry, "finding", &format!("{prefix}.finding"))?;
            required_string(entry, "reason", &format!("{prefix}.reason"))?;
            known_fields(entry, &["finding", "reason"], &prefix)
        },
    )?;
    string_array(object, "verification", "verification", true)?;
    known_fields(
        object,
        &[
            "schema",
            "workItem",
            "repository",
            "reviewedAt",
            "topology",
            "recommendations",
            "cruxes",
            "openQuestions",
            "rejectedFindings",
            "verification",
        ],
        "payload",
    )
}

fn validate_execution_approval(value: &Value) -> Result<(), WorkNoteContractError> {
    let object = value_object(value, "payload")?;
    required_schema(
        object,
        EXECUTION_APPROVAL_SCHEMA_V1,
        Some("forged-execution-approval/1"),
    )?;
    enum_string(object, "subjectKind", "subjectKind", &["slice", "epic"])?;
    for field in [
        "workItemId",
        "observedRevision",
        "repository",
        "baseRef",
        "profile",
        "roster",
    ] {
        required_string(object, field, field)?;
    }
    enum_string(
        object,
        "action",
        "action",
        &["run-start-submit", "epic-start-submit"],
    )?;
    for field in ["approvedAt", "actor", "basis"] {
        required_string(object, field, field)?;
    }
    known_fields(
        object,
        &[
            "schema",
            "subjectKind",
            "workItemId",
            "observedRevision",
            "repository",
            "baseRef",
            "profile",
            "roster",
            "action",
            "approvedAt",
            "actor",
            "basis",
        ],
        "payload",
    )
}

fn required_schema(
    object: &Map<String, Value>,
    expected: &str,
    legacy: Option<&str>,
) -> Result<(), WorkNoteContractError> {
    let actual = required_string(object, "schema", "schema")?;
    if actual == expected {
        return Ok(());
    }
    let reason = if legacy == Some(actual) {
        format!("must be {expected:?}; replace the legacy spelling {actual:?}")
    } else {
        format!("must equal {expected:?}, got {actual:?}")
    };
    Err(violation("schema", reason))
}

fn value_object<'a>(
    value: &'a Value,
    field: &str,
) -> Result<&'a Map<String, Value>, WorkNoteContractError> {
    value
        .as_object()
        .ok_or_else(|| violation(field, "must be an object"))
}

fn required_string<'a>(
    object: &'a Map<String, Value>,
    key: &str,
    field: &str,
) -> Result<&'a str, WorkNoteContractError> {
    match object.get(key) {
        None => Err(violation(field, "is required")),
        Some(Value::String(value)) => Ok(value),
        Some(_) => Err(violation(field, "must be a string")),
    }
}

fn optional_string(
    object: &Map<String, Value>,
    key: &str,
    field: &str,
) -> Result<(), WorkNoteContractError> {
    match object.get(key) {
        None | Some(Value::Null | Value::String(_)) => Ok(()),
        Some(_) => Err(violation(field, "must be a string when present")),
    }
}

fn enum_string(
    object: &Map<String, Value>,
    key: &str,
    field: &str,
    allowed: &[&str],
) -> Result<(), WorkNoteContractError> {
    let value = required_string(object, key, field)?;
    if allowed.contains(&value) {
        Ok(())
    } else {
        Err(violation(
            field,
            format!("must be one of {}", allowed.join(", ")),
        ))
    }
}

fn string_array(
    object: &Map<String, Value>,
    key: &str,
    field: &str,
    optional: bool,
) -> Result<(), WorkNoteContractError> {
    let values = match object.get(key) {
        None if optional => return Ok(()),
        Some(Value::Null) if optional => return Ok(()),
        None => return Err(violation(field, "is required")),
        Some(Value::Array(values)) => values,
        Some(_) => return Err(violation(field, "must be an array of strings")),
    };
    for (index, value) in values.iter().enumerate() {
        if !value.is_string() {
            return Err(violation(format!("{field}[{index}]"), "must be a string"));
        }
    }
    Ok(())
}

fn object_array(
    object: &Map<String, Value>,
    key: &str,
    field: &str,
    validate: impl Fn(&Map<String, Value>, usize) -> Result<(), WorkNoteContractError>,
) -> Result<(), WorkNoteContractError> {
    let values = match object.get(key) {
        None => return Err(violation(field, "is required")),
        Some(Value::Array(values)) => values,
        Some(_) => return Err(violation(field, "must be an array of objects")),
    };
    for (index, value) in values.iter().enumerate() {
        validate(value_object(value, &format!("{field}[{index}]"))?, index)?;
    }
    Ok(())
}

fn optional_object_array(
    object: &Map<String, Value>,
    key: &str,
    field: &str,
    validate: impl Fn(&Map<String, Value>, usize) -> Result<(), WorkNoteContractError>,
) -> Result<(), WorkNoteContractError> {
    match object.get(key) {
        None | Some(Value::Null) => Ok(()),
        Some(Value::Array(values)) => {
            for (index, value) in values.iter().enumerate() {
                validate(value_object(value, &format!("{field}[{index}]"))?, index)?;
            }
            Ok(())
        }
        Some(_) => Err(violation(field, "must be an array of objects when present")),
    }
}

fn known_fields(
    object: &Map<String, Value>,
    allowed: &[&str],
    prefix: &str,
) -> Result<(), WorkNoteContractError> {
    if let Some(field) = object
        .keys()
        .find(|field| !allowed.contains(&field.as_str()))
    {
        let field = if prefix == "payload" {
            field.to_owned()
        } else {
            format!("{prefix}.{field}")
        };
        return Err(violation(field, "is not part of this schema"));
    }
    Ok(())
}

fn violation(field: impl Into<String>, reason: impl Into<String>) -> WorkNoteContractError {
    WorkNoteContractError {
        field: field.into(),
        reason: reason.into(),
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    #[test]
    fn recommendations_accept_empty_required_collections() {
        let parsed = SpecRecommendationsV1::parse_value(json!({
            "schema": SPEC_RECOMMENDATIONS_SCHEMA_V1,
            "workItem": "ore-1",
            "repository": "/tmp/repo",
            "reviewedAt": "2026-08-29T12:00:00Z",
            "recommendations": [],
            "cruxes": [],
        }))
        .expect("valid recommendations");
        assert!(parsed.recommendations.is_empty());
        assert!(parsed.cruxes.is_empty());
    }

    #[test]
    fn contracts_name_nested_and_legacy_schema_violations() {
        let nested = SpecRecommendationsV1::parse_value(json!({
            "schema": SPEC_RECOMMENDATIONS_SCHEMA_V1,
            "workItem": "ore-1",
            "repository": "/tmp/repo",
            "reviewedAt": "2026-08-29T12:00:00Z",
            "recommendations": [{"target": "design"}],
            "cruxes": [],
        }))
        .expect_err("missing nested correction");
        assert_eq!(nested.field, "recommendations[0].correction");

        let legacy = ExecutionApprovalV1::parse_value(json!({
            "schema": "forged-execution-approval/1",
            "subjectKind": "slice",
            "workItemId": "ore-1",
            "observedRevision": "3",
            "repository": "/tmp/repo",
            "baseRef": "main",
            "profile": "default",
            "roster": "default",
            "action": "run-start-submit",
            "approvedAt": "2026-08-29T12:00:00Z",
            "actor": "operator",
            "basis": "approved tuple"
        }))
        .expect_err("legacy schema");
        assert_eq!(legacy.field, "schema");
        assert!(legacy.reason.contains(EXECUTION_APPROVAL_SCHEMA_V1));
    }
}
