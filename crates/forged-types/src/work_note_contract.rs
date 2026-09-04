//! Closed payload contracts for typed work-item lifecycle notes.

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

pub const SPEC_RECOMMENDATIONS_SCHEMA_V1: &str = "forged.spec-recommendations/1";
pub const EXECUTION_APPROVAL_SCHEMA_V1: &str = "forged.execution-approval/1";
pub const ADJUDICATION_SCHEMA_V1: &str = "forged.adjudication/1";
pub const DECISION_SCHEMA_V1: &str = "forged.decision/1";
pub const RETRO_SCHEMA_V1: &str = "forged.retro/1";

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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revision: Option<u64>,
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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revision: Option<u64>,
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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdjudicationV1 {
    pub schema: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revision: Option<u64>,
    pub work_item: String,
    pub critiqued_revision: u64,
    pub recommendation_note_id: String,
    pub resulting_revision: u64,
    pub dispositions: Vec<AdjudicationDispositionV1>,
    pub cruxes: Vec<AdjudicationCruxV1>,
    pub adjudicated_at: String,
    pub actor: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdjudicationDispositionV1 {
    #[serde(rename = "ref")]
    pub reference: AdjudicationRefV1,
    pub disposition: AdjudicationDispositionKind,
    pub reason: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum AdjudicationRefV1 {
    Finding(AdjudicationFindingRefV1),
    Crux(AdjudicationCruxRefV1),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdjudicationFindingRefV1 {
    pub note_id: String,
    pub index: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdjudicationCruxRefV1 {
    pub note_id: String,
    pub crux_id: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AdjudicationDispositionKind {
    Accept,
    Adapt,
    Reject,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdjudicationCruxV1 {
    pub id: String,
    pub choice: String,
    pub rationale: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DecisionV1 {
    pub schema: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revision: Option<u64>,
    pub kind: DecisionKind,
    pub subject: DecisionSubjectV1,
    pub choice: String,
    pub rationale: String,
    pub actor: String,
    pub at: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cost_microusd_at_decision: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub approval: Option<DecisionApprovalV1>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum DecisionKind {
    Approval,
    LifecycleOverride,
    AcceptRisk,
    RemediationGrant,
    Retry,
    Park,
    SeatAnswer,
    Settlement,
    Other,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DecisionSubjectV1 {
    pub kind: String,
    pub id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DecisionApprovalV1 {
    pub repository: String,
    pub base_ref: String,
    pub profile: String,
    pub roster: String,
    pub observed_revision: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RetroV1 {
    pub schema: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revision: Option<u64>,
    pub epic: String,
    pub worked: Vec<RetroEvidenceV1>,
    pub cost: Vec<RetroCostV1>,
    pub ranked: Vec<RetroRankedV1>,
    pub at: String,
    pub actor: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RetroEvidenceV1 {
    pub item: String,
    pub evidence_ids: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RetroCostV1 {
    pub item: String,
    pub evidence_ids: Vec<String>,
    pub microusd: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RetroRankedV1 {
    pub rank: u64,
    pub item: String,
    pub evidence_ids: Vec<String>,
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

impl AdjudicationV1 {
    /// Parse the closed v1 shape while retaining a stable first-field error.
    pub fn parse_value(value: Value) -> Result<Self, WorkNoteContractError> {
        validate_adjudication(&value)?;
        serde_json::from_value(value)
            .map_err(|error| violation("payload", format!("could not be decoded: {error}")))
    }
}

impl DecisionV1 {
    /// Parse the closed v1 shape while retaining a stable first-field error.
    pub fn parse_value(value: Value) -> Result<Self, WorkNoteContractError> {
        validate_decision(&value)?;
        serde_json::from_value(value)
            .map_err(|error| violation("payload", format!("could not be decoded: {error}")))
    }
}

impl RetroV1 {
    /// Parse the closed v1 shape while retaining a stable first-field error.
    pub fn parse_value(value: Value) -> Result<Self, WorkNoteContractError> {
        validate_retro(&value)?;
        serde_json::from_value(value)
            .map_err(|error| violation("payload", format!("could not be decoded: {error}")))
    }
}

fn validate_spec_recommendations(value: &Value) -> Result<(), WorkNoteContractError> {
    let object = value_object(value, "payload")?;
    required_schema(object, SPEC_RECOMMENDATIONS_SCHEMA_V1, None)?;
    optional_integer(object, "revision", "revision")?;
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
            "revision",
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
    optional_integer(object, "revision", "revision")?;
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
            "revision",
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

fn validate_adjudication(value: &Value) -> Result<(), WorkNoteContractError> {
    let object = value_object(value, "payload")?;
    required_schema(object, ADJUDICATION_SCHEMA_V1, None)?;
    optional_integer(object, "revision", "revision")?;
    required_string(object, "workItem", "workItem")?;
    required_integer(object, "critiquedRevision", "critiquedRevision")?;
    required_string(object, "recommendationNoteId", "recommendationNoteId")?;
    required_integer(object, "resultingRevision", "resultingRevision")?;
    object_array(object, "dispositions", "dispositions", |entry, index| {
        let prefix = format!("dispositions[{index}]");
        let reference = required_object(entry, "ref", &format!("{prefix}.ref"))?;
        validate_adjudication_ref(reference, &format!("{prefix}.ref"))?;
        enum_string(
            entry,
            "disposition",
            &format!("{prefix}.disposition"),
            &["accept", "adapt", "reject"],
        )?;
        required_string(entry, "reason", &format!("{prefix}.reason"))?;
        known_fields(entry, &["ref", "disposition", "reason"], &prefix)
    })?;
    object_array(object, "cruxes", "cruxes", |entry, index| {
        let prefix = format!("cruxes[{index}]");
        required_string(entry, "id", &format!("{prefix}.id"))?;
        required_string(entry, "choice", &format!("{prefix}.choice"))?;
        required_string(entry, "rationale", &format!("{prefix}.rationale"))?;
        known_fields(entry, &["id", "choice", "rationale"], &prefix)
    })?;
    required_string(object, "adjudicatedAt", "adjudicatedAt")?;
    required_string(object, "actor", "actor")?;
    known_fields(
        object,
        &[
            "schema",
            "revision",
            "workItem",
            "critiquedRevision",
            "recommendationNoteId",
            "resultingRevision",
            "dispositions",
            "cruxes",
            "adjudicatedAt",
            "actor",
        ],
        "payload",
    )
}

fn validate_adjudication_ref(
    object: &Map<String, Value>,
    prefix: &str,
) -> Result<(), WorkNoteContractError> {
    required_string(object, "noteId", &format!("{prefix}.noteId"))?;
    match (object.get("index"), object.get("cruxId")) {
        (Some(_), None) => {
            required_integer(object, "index", &format!("{prefix}.index"))?;
            known_fields(object, &["noteId", "index"], prefix)
        }
        (None, Some(_)) => {
            required_string(object, "cruxId", &format!("{prefix}.cruxId"))?;
            known_fields(object, &["noteId", "cruxId"], prefix)
        }
        _ => Err(violation(
            prefix,
            "must contain exactly one of index or cruxId",
        )),
    }
}

fn validate_decision(value: &Value) -> Result<(), WorkNoteContractError> {
    let object = value_object(value, "payload")?;
    required_schema(object, DECISION_SCHEMA_V1, None)?;
    optional_integer(object, "revision", "revision")?;
    let kind = required_string(object, "kind", "kind")?;
    const DECISION_KINDS: &[&str] = &[
        "approval",
        "lifecycle-override",
        "accept-risk",
        "remediation-grant",
        "retry",
        "park",
        "seat-answer",
        "settlement",
        "other",
    ];
    if !DECISION_KINDS.contains(&kind) {
        return Err(violation(
            "kind",
            format!("must be one of {}", DECISION_KINDS.join(", ")),
        ));
    }
    let subject = required_object(object, "subject", "subject")?;
    required_string(subject, "kind", "subject.kind")?;
    required_string(subject, "id", "subject.id")?;
    known_fields(subject, &["kind", "id"], "subject")?;
    for field in ["choice", "rationale", "actor", "at"] {
        required_string(object, field, field)?;
    }
    optional_integer(object, "costMicrousdAtDecision", "costMicrousdAtDecision")?;
    match object.get("approval") {
        None | Some(Value::Null) if kind == "approval" => {
            return Err(violation("approval", "is required when kind is approval"));
        }
        None | Some(Value::Null) => {}
        Some(value) => validate_decision_approval(value_object(value, "approval")?)?,
    }
    known_fields(
        object,
        &[
            "schema",
            "revision",
            "kind",
            "subject",
            "choice",
            "rationale",
            "actor",
            "at",
            "costMicrousdAtDecision",
            "approval",
        ],
        "payload",
    )
}

fn validate_decision_approval(object: &Map<String, Value>) -> Result<(), WorkNoteContractError> {
    for field in ["repository", "baseRef", "profile", "roster"] {
        required_string(object, field, &format!("approval.{field}"))?;
    }
    required_integer(object, "observedRevision", "approval.observedRevision")?;
    known_fields(
        object,
        &[
            "repository",
            "baseRef",
            "profile",
            "roster",
            "observedRevision",
        ],
        "approval",
    )
}

fn validate_retro(value: &Value) -> Result<(), WorkNoteContractError> {
    let object = value_object(value, "payload")?;
    required_schema(object, RETRO_SCHEMA_V1, None)?;
    optional_integer(object, "revision", "revision")?;
    required_string(object, "epic", "epic")?;
    object_array(object, "worked", "worked", |entry, index| {
        let prefix = format!("worked[{index}]");
        validate_retro_evidence(entry, &prefix)?;
        known_fields(entry, &["item", "evidenceIds"], &prefix)
    })?;
    object_array(object, "cost", "cost", |entry, index| {
        let prefix = format!("cost[{index}]");
        validate_retro_evidence(entry, &prefix)?;
        required_nullable_integer(entry, "microusd", &format!("{prefix}.microusd"))?;
        known_fields(entry, &["item", "evidenceIds", "microusd"], &prefix)
    })?;
    object_array(object, "ranked", "ranked", |entry, index| {
        let prefix = format!("ranked[{index}]");
        required_integer(entry, "rank", &format!("{prefix}.rank"))?;
        validate_retro_evidence(entry, &prefix)?;
        known_fields(entry, &["rank", "item", "evidenceIds"], &prefix)
    })?;
    required_string(object, "at", "at")?;
    required_string(object, "actor", "actor")?;
    known_fields(
        object,
        &[
            "schema", "revision", "epic", "worked", "cost", "ranked", "at", "actor",
        ],
        "payload",
    )
}

fn validate_retro_evidence(
    object: &Map<String, Value>,
    prefix: &str,
) -> Result<(), WorkNoteContractError> {
    required_string(object, "item", &format!("{prefix}.item"))?;
    string_array(
        object,
        "evidenceIds",
        &format!("{prefix}.evidenceIds"),
        false,
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

fn required_object<'a>(
    object: &'a Map<String, Value>,
    key: &str,
    field: &str,
) -> Result<&'a Map<String, Value>, WorkNoteContractError> {
    match object.get(key) {
        None => Err(violation(field, "is required")),
        Some(Value::Object(value)) => Ok(value),
        Some(_) => Err(violation(field, "must be an object")),
    }
}

fn required_integer(
    object: &Map<String, Value>,
    key: &str,
    field: &str,
) -> Result<u64, WorkNoteContractError> {
    match object.get(key) {
        None => Err(violation(field, "is required")),
        Some(Value::Number(value)) => value
            .as_u64()
            .ok_or_else(|| violation(field, "must be an integer")),
        Some(_) => Err(violation(field, "must be an integer")),
    }
}

fn optional_integer(
    object: &Map<String, Value>,
    key: &str,
    field: &str,
) -> Result<(), WorkNoteContractError> {
    match object.get(key) {
        None => Ok(()),
        Some(Value::Number(value)) if value.as_u64().is_some() => Ok(()),
        Some(_) => Err(violation(field, "must be an integer when present")),
    }
}

fn required_nullable_integer(
    object: &Map<String, Value>,
    key: &str,
    field: &str,
) -> Result<(), WorkNoteContractError> {
    match object.get(key) {
        None => Err(violation(field, "is required")),
        Some(Value::Null) => Ok(()),
        Some(Value::Number(value)) if value.as_u64().is_some() => Ok(()),
        Some(_) => Err(violation(field, "must be an integer or null")),
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

    #[test]
    fn adjudication_round_trips_both_closed_reference_shapes() {
        let value = json!({
            "schema": ADJUDICATION_SCHEMA_V1,
            "revision": 4,
            "workItem": "ore-1",
            "critiquedRevision": 3,
            "recommendationNoteId": "note-recommendation",
            "resultingRevision": 4,
            "dispositions": [
                {
                    "ref": {"noteId": "note-recommendation", "index": 0},
                    "disposition": "adapt",
                    "reason": "retain the invariant with narrower wording"
                },
                {
                    "ref": {"noteId": "note-recommendation", "cruxId": "CRUX-1"},
                    "disposition": "accept",
                    "reason": "the operator selected option A"
                }
            ],
            "cruxes": [{
                "id": "CRUX-1",
                "choice": "option-a",
                "rationale": "preserves the ledger boundary"
            }],
            "adjudicatedAt": "2026-09-03T12:00:00Z",
            "actor": "operator"
        });
        let parsed = AdjudicationV1::parse_value(value.clone()).expect("valid adjudication");
        assert_eq!(serde_json::to_value(parsed).expect("serialize"), value);
    }

    #[test]
    fn decision_round_trips_approval_and_requires_its_tuple() {
        let value = json!({
            "schema": DECISION_SCHEMA_V1,
            "kind": "approval",
            "subject": {"kind": "work", "id": "ore-1"},
            "choice": "dispatch",
            "rationale": "the bounded execution tuple is approved",
            "actor": "operator",
            "at": "2026-09-03T12:00:00Z",
            "costMicrousdAtDecision": 42000,
            "approval": {
                "repository": "/tmp/repo",
                "baseRef": "main",
                "profile": "default",
                "roster": "default",
                "observedRevision": 4
            }
        });
        let parsed = DecisionV1::parse_value(value.clone()).expect("valid decision");
        assert_eq!(serde_json::to_value(parsed).expect("serialize"), value);

        let mut missing = value;
        missing
            .as_object_mut()
            .expect("decision object")
            .remove("approval");
        let error = DecisionV1::parse_value(missing).expect_err("approval tuple is required");
        assert_eq!(error.field, "approval");
    }

    #[test]
    fn retro_round_trips_nullable_cost_and_names_non_integer_rank() {
        let value = json!({
            "schema": RETRO_SCHEMA_V1,
            "epic": "ore-epic",
            "worked": [{"item": "bounded slices", "evidenceIds": ["note-1"]}],
            "cost": [{"item": "provider spend", "evidenceIds": ["usage-1"], "microusd": null}],
            "ranked": [{"rank": 1, "item": "keep", "evidenceIds": ["note-1"]}],
            "at": "2026-09-03T12:00:00Z",
            "actor": "lead-agent"
        });
        let parsed = RetroV1::parse_value(value.clone()).expect("valid retro");
        assert_eq!(serde_json::to_value(parsed).expect("serialize"), value);

        let mut malformed = value;
        malformed["ranked"][0]["rank"] = json!(1.5);
        let error = RetroV1::parse_value(malformed).expect_err("rank must be integral");
        assert_eq!(error.field, "ranked[0].rank");
    }

    #[test]
    fn adjudication_reference_requires_exactly_one_selector() {
        let error = AdjudicationV1::parse_value(json!({
            "schema": ADJUDICATION_SCHEMA_V1,
            "workItem": "ore-1",
            "critiquedRevision": 1,
            "recommendationNoteId": "note-1",
            "resultingRevision": 2,
            "dispositions": [{
                "ref": {"noteId": "note-1", "index": 0, "cruxId": "CRUX-1"},
                "disposition": "accept",
                "reason": "ambiguous selector"
            }],
            "cruxes": [],
            "adjudicatedAt": "2026-09-03T12:00:00Z",
            "actor": "operator"
        }))
        .expect_err("mixed reference shape must refuse");
        assert_eq!(error.field, "dispositions[0].ref");
    }
}
