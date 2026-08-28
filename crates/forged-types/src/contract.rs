//! Provider-neutral execution-package contracts.
//!
//! These types describe *what cognitive work is required* separately from
//! the provider processes that perform it.  They are deliberately closed and
//! versioned: authoring formats compile into these structs, and only their
//! canonical JSON form is durable runtime truth.

use std::collections::{BTreeMap, BTreeSet};
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::{Sandbox, Stage};

/// The only execution-package schema understood by this binary.
pub const EXECUTION_PACKAGE_SCHEMA_V1: &str = "forged.execution-package/1";
/// The only profile schema understood by this binary.
pub const PROFILE_SCHEMA_V1: &str = "forged.profile/1";
/// The only roster schema understood by this binary.
pub const ROSTER_SCHEMA_V1: &str = "forged.roster/1";
/// The only resolved-roster schema understood by this binary.
pub const RESOLVED_ROSTER_SCHEMA_V1: &str = "forged.resolved-roster/1";
/// Longest wall-clock budget representable by the packet contract.
pub const MAX_STAGE_BUDGET_S: u64 = u32::MAX as u64;
/// Default bounded wait for each provider termination phase.
pub const DEFAULT_TERMINATION_GRACE_S: u64 = 5;
/// Longest accepted provider termination phase (five minutes).
pub const MAX_TERMINATION_GRACE_S: u64 = 5 * 60;

/// A validation failure with a stable JSON-path-like location.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DefinitionError {
    pub path: String,
    pub message: String,
}

impl DefinitionError {
    fn at(path: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            path: path.into(),
            message: message.into(),
        }
    }
}

fn valid_identifier(value: &str) -> bool {
    let mut chars = value.chars();
    matches!(chars.next(), Some('a'..='z'))
        && value.len() <= 64
        && chars
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || matches!(c, '.' | '_' | '-'))
}

macro_rules! semantic_id {
    ($name:ident, $label:literal) => {
        #[doc = concat!("A validated semantic ", $label, " identifier.")]
        #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
        pub struct $name(String);

        impl $name {
            pub fn new(value: impl Into<String>) -> Result<Self, String> {
                let value = value.into();
                if valid_identifier(&value) {
                    Ok(Self(value))
                } else {
                    Err(format!(
                        "invalid {} identifier {value:?}; expected [a-z][a-z0-9._-]{{0,63}}",
                        $label
                    ))
                }
            }

            pub fn as_str(&self) -> &str {
                &self.0
            }
        }

        impl Serialize for $name {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: serde::Serializer,
            {
                serializer.serialize_str(&self.0)
            }
        }

        impl<'de> Deserialize<'de> for $name {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: serde::Deserializer<'de>,
            {
                let value = String::deserialize(deserializer)?;
                Self::new(value).map_err(serde::de::Error::custom)
            }
        }
    };
}

semantic_id!(RoleId, "role");
semantic_id!(SeatId, "seat");

/// A versioned protocol reference.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProtocolRef {
    pub name: String,
    pub version: u32,
}

/// A named, versioned profile reference.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProfileRef {
    pub name: String,
    pub version: u32,
}

/// A named, versioned roster reference.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RosterRef {
    pub name: String,
    pub version: u32,
}

/// The semantic purpose of a seat in the slice protocol.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SeatPurpose {
    Implement,
    Review,
    Synthesis,
    Fix,
}

/// A named seat bound to a semantic role.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SeatDefinitionV1 {
    pub id: SeatId,
    pub role: RoleId,
    pub purpose: SeatPurpose,
}

/// Events that may raise a run into a more expensive profile later.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EscalationTrigger {
    GateFailure,
    ReviewConflict,
    OversizedDiff,
}

/// A closed assurance/topology definition for one supported protocol.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProfileDefinitionV1 {
    pub schema: String,
    pub name: String,
    pub protocol: ProtocolRef,
    pub seats: Vec<SeatDefinitionV1>,
    /// Human-readable consequence context supplied to every review seat.
    /// Older frozen packages predate this field and receive the neutral
    /// default rather than failing recovery.
    #[serde(default = "default_risk_context")]
    pub risk_context: String,
    /// Number of remediation attempts after the initial review. The complete
    /// review loop therefore has `fix_round_budget + 1` review rounds.
    pub fix_round_budget: u8,
    #[serde(default)]
    pub escalate_on: Vec<EscalationTrigger>,
    /// The stored profile selected when one of `escalate_on` fires.
    #[serde(default)]
    pub escalate_to: Option<ProfileRef>,
}

fn default_risk_context() -> String {
    "Routine change: grade findings by concrete likelihood and consequence.".to_owned()
}

/// A capability a provider candidate declares to the dispatcher.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Capability {
    RepositoryRead,
    RepositoryWrite,
    StructuredOutput,
    InteractiveMessaging,
}

/// One provider/model candidate. Ordering is meaningful within a role.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderCandidateV1 {
    pub provider: String,
    pub model: String,
    pub effort: Option<String>,
    pub sandbox: Sandbox,
    #[serde(default)]
    pub capabilities: BTreeSet<Capability>,
}

/// A named roster maps semantic roles to ordered candidates.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RosterDefinitionV1 {
    pub schema: String,
    pub name: String,
    pub roles: BTreeMap<RoleId, Vec<ProviderCandidateV1>>,
}

/// The roster snapshot after checking it against a profile.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ResolvedRosterV1 {
    pub schema: String,
    pub roster_ref: RosterRef,
    pub roles: BTreeMap<RoleId, Vec<ProviderCandidateV1>>,
}

/// Semantic identity carried by a runtime packet. Its legacy storage/result
/// lane is intentionally outside the provider-neutral contract.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SeatExecutionV1 {
    pub stage_id: String,
    pub seat_id: SeatId,
    pub role_id: RoleId,
    pub purpose: SeatPurpose,
    pub round: u8,
}

/// How a run's controller and provider attempts use Herdr.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum HostPolicyV1 {
    /// Prefer an observable Herdr pane and record a process fallback.
    Preferred,
    /// Refuse execution when the configured Herdr endpoint is unavailable.
    Required,
    /// Use a plain owned process without contacting Herdr.
    Off,
}

/// Immutable non-cognitive policy resolved when a run starts.
///
/// Authoring configuration may change later; execution, recovery, and
/// detached controllers consume only this snapshot from the hashed package.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ExecutionPolicyV1 {
    pub gate_commands: Vec<String>,
    pub stage_budget_s: BTreeMap<Stage, u64>,
    /// Frozen upper bound for graceful termination and subsequent hard-kill
    /// verification. Older packages receive the historical five-second
    /// compatibility value when deserialized.
    #[serde(default = "default_termination_grace_s")]
    pub termination_grace_s: u64,
    pub transport_retry_budget: u32,
    pub host_policy: HostPolicyV1,
    pub herdr_socket: Option<PathBuf>,
}

const fn default_termination_grace_s() -> u64 {
    DEFAULT_TERMINATION_GRACE_S
}

/// Durable runtime truth for one run.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ExecutionPackageV1 {
    pub schema: String,
    pub protocol_ref: ProtocolRef,
    pub profile_ref: ProfileRef,
    pub roster_ref: RosterRef,
    pub profile_sha256: String,
    pub roster_sha256: String,
    pub profile: ProfileDefinitionV1,
    /// Selected plus reachable escalation profiles, keyed by name.
    #[serde(default)]
    pub profile_catalog: BTreeMap<String, ProfileDefinitionV1>,
    pub roster: ResolvedRosterV1,
    pub policy: ExecutionPolicyV1,
}

/// One explicit, append-only roster change for an existing run.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RosterRevisionV1 {
    pub revision: u32,
    pub roster_ref: RosterRef,
    pub roster_sha256: String,
    pub roster: ResolvedRosterV1,
    pub reason: String,
}

impl ProfileDefinitionV1 {
    /// Validate a closed protocol topology with stable error paths.
    pub fn validate(&self) -> Vec<DefinitionError> {
        let mut errors = Vec::new();
        if self.schema != PROFILE_SCHEMA_V1 {
            errors.push(DefinitionError::at(
                "$.profile.schema",
                format!("unsupported schema {:?}", self.schema),
            ));
        }
        if !valid_identifier(&self.name) {
            errors.push(DefinitionError::at(
                "$.profile.name",
                "invalid profile name",
            ));
        }
        if !matches!(
            self.protocol.name.as_str(),
            "slice" | "epic-plan" | "epic-assurance"
        ) || self.protocol.version != 1
        {
            errors.push(DefinitionError::at(
                "$.profile.protocol",
                "only slice/v1, epic-plan/v1, and epic-assurance/v1 are supported",
            ));
        }
        if self.seats.is_empty() || self.seats.len() > 8 {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                "seat count must be between 1 and 8",
            ));
        }
        if self.fix_round_budget > 32 {
            errors.push(DefinitionError::at(
                "$.profile.fixRoundBudget",
                "fix round budget must be between 0 and 32",
            ));
        }
        if self.risk_context.trim().is_empty() || self.risk_context.len() > 1_024 {
            errors.push(DefinitionError::at(
                "$.profile.riskContext",
                "risk context must contain between 1 and 1024 bytes",
            ));
        }
        match (&self.escalate_to, self.escalate_on.is_empty()) {
            (Some(target), false) if valid_identifier(&target.name) && target.version == 1 => {}
            (None, true) => {}
            (Some(_), true) => errors.push(DefinitionError::at(
                "$.profile.escalateTo",
                "escalation target requires at least one trigger",
            )),
            (None, false) => errors.push(DefinitionError::at(
                "$.profile.escalateTo",
                "escalation triggers require a target",
            )),
            (Some(_), false) => errors.push(DefinitionError::at(
                "$.profile.escalateTo",
                "invalid escalation profile ref",
            )),
        }
        let mut ids = BTreeSet::new();
        for (index, seat) in self.seats.iter().enumerate() {
            if !ids.insert(seat.id.clone()) {
                errors.push(DefinitionError::at(
                    format!("$.profile.seats[{index}].id"),
                    format!("duplicate seat id {:?}", seat.id.as_str()),
                ));
            }
        }
        let count = |purpose| self.seats.iter().filter(|s| s.purpose == purpose).count();
        let protocol = self.protocol.name.as_str();
        let expected_implement = usize::from(protocol != "epic-assurance");
        if count(SeatPurpose::Implement) != expected_implement {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                if expected_implement == 0 {
                    format!("{protocol}/v1 permits no implement seats")
                } else {
                    format!("{protocol}/v1 requires exactly one implement seat")
                },
            ));
        }
        if !(1..=4).contains(&count(SeatPurpose::Review)) {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                format!("{protocol}/v1 requires between one and four review seats"),
            ));
        }
        if count(SeatPurpose::Synthesis) > 1 {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                format!("{protocol}/v1 permits at most one synthesis seat"),
            ));
        }
        if count(SeatPurpose::Fix) != 1 {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                format!("{protocol}/v1 requires exactly one fix seat"),
            ));
        }
        let unique_triggers: BTreeSet<_> = self.escalate_on.iter().copied().collect();
        if unique_triggers.len() != self.escalate_on.len() {
            errors.push(DefinitionError::at(
                "$.profile.escalateOn",
                "escalation triggers must be unique",
            ));
        }
        errors
    }
}

impl ExecutionPolicyV1 {
    /// Validate the complete policy snapshot before it becomes durable.
    pub fn validate(&self) -> Vec<DefinitionError> {
        let mut errors = Vec::new();
        for stage in [
            Stage::Implement,
            Stage::ReviewClaude,
            Stage::ReviewCodex,
            Stage::Fix,
        ] {
            match self.stage_budget_s.get(&stage) {
                Some(0) => errors.push(DefinitionError::at(
                    format!("$.policy.stageBudgetS.{stage:?}"),
                    "stage budget must be greater than zero",
                )),
                Some(value) if *value > MAX_STAGE_BUDGET_S => {
                    errors.push(DefinitionError::at(
                        format!("$.policy.stageBudgetS.{stage:?}"),
                        "stage budget must fit the packet contract's 32-bit seconds field",
                    ));
                }
                Some(_) => {}
                None => errors.push(DefinitionError::at(
                    format!("$.policy.stageBudgetS.{stage:?}"),
                    "stage budget is missing",
                )),
            }
        }
        if !(1..=MAX_TERMINATION_GRACE_S).contains(&self.termination_grace_s) {
            errors.push(DefinitionError::at(
                "$.policy.terminationGraceS",
                format!(
                    "termination grace must be between 1 and {MAX_TERMINATION_GRACE_S} seconds"
                ),
            ));
        }
        for (index, command) in self.gate_commands.iter().enumerate() {
            if command.trim().is_empty() {
                errors.push(DefinitionError::at(
                    format!("$.policy.gateCommands[{index}]"),
                    "gate command must not be empty",
                ));
            }
        }
        if self.host_policy == HostPolicyV1::Required && self.herdr_socket.is_none() {
            errors.push(DefinitionError::at(
                "$.policy.herdrSocket",
                "required Herdr policy needs an explicit socket",
            ));
        }
        errors
    }
}

impl RosterDefinitionV1 {
    /// Validate a roster against every role required by `profile`.
    pub fn validate_for(&self, profile: &ProfileDefinitionV1) -> Vec<DefinitionError> {
        let mut errors = Vec::new();
        if self.schema != ROSTER_SCHEMA_V1 {
            errors.push(DefinitionError::at(
                "$.roster.schema",
                format!("unsupported schema {:?}", self.schema),
            ));
        }
        if !valid_identifier(&self.name) {
            errors.push(DefinitionError::at("$.roster.name", "invalid roster name"));
        }
        let required: BTreeSet<_> = profile.seats.iter().map(|s| s.role.clone()).collect();
        for role in required {
            match self.roles.get(&role) {
                None => errors.push(DefinitionError::at(
                    format!("$.roster.roles.{}", role.as_str()),
                    "required role is missing",
                )),
                Some(candidates) if candidates.is_empty() => errors.push(DefinitionError::at(
                    format!("$.roster.roles.{}", role.as_str()),
                    "candidate list must not be empty",
                )),
                Some(candidates) => {
                    for (index, candidate) in candidates.iter().enumerate() {
                        let path = format!("$.roster.roles.{}[{index}]", role.as_str());
                        if !valid_identifier(&candidate.provider) {
                            errors.push(DefinitionError::at(
                                format!("{path}.provider"),
                                "provider must be a non-empty printable identifier",
                            ));
                        }
                        if !valid_provider_value(&candidate.model) {
                            errors.push(DefinitionError::at(
                                format!("{path}.model"),
                                "model must be a non-empty printable identifier",
                            ));
                        }
                        let writes = candidate
                            .capabilities
                            .contains(&Capability::RepositoryWrite);
                        match (candidate.sandbox, writes) {
                            (Sandbox::ReadOnly, true) => errors.push(DefinitionError::at(
                                format!("{path}.capabilities"),
                                "read-only sandbox cannot declare repositoryWrite",
                            )),
                            (Sandbox::WorkspaceWrite, false) => errors.push(DefinitionError::at(
                                format!("{path}.capabilities"),
                                "workspace-write sandbox requires repositoryWrite",
                            )),
                            _ => {}
                        }
                    }
                }
            }
        }
        errors
    }

    /// Authoring-time model validation, deliberately OUTSIDE
    /// [`RosterDefinitionV1::validate_for`]: frozen execution packages are
    /// durable state and must remain loadable across upgrades, so recovery
    /// recompiles (`compile_frozen_package`) never apply these rules.
    pub fn validate_models(&self) -> Vec<DefinitionError> {
        let mut errors = Vec::new();
        for (role, candidates) in &self.roles {
            for (index, candidate) in candidates.iter().enumerate() {
                if let Err(message) = validate_model_value(&candidate.model) {
                    errors.push(DefinitionError::at(
                        format!("$.roster.roles.{}[{index}].model", role.as_str()),
                        message,
                    ));
                }
            }
        }
        errors
    }

    /// Authoring-time effort validation, deliberately OUTSIDE
    /// [`RosterDefinitionV1::validate_for`]: frozen execution packages are
    /// durable state and must remain loadable across upgrades, so recovery
    /// recompiles (`compile_frozen_package`) never apply these rules. The
    /// provider layer's charset guard still fences the shell/TOML boundary
    /// per attempt, so a historically frozen value outside today's rules
    /// fails that attempt with the charset message instead of making the
    /// whole package unloadable.
    pub fn validate_efforts(&self) -> Vec<DefinitionError> {
        let mut errors = Vec::new();
        for (role, candidates) in &self.roles {
            for (index, candidate) in candidates.iter().enumerate() {
                let path = format!("$.roster.roles.{}[{index}]", role.as_str());
                match candidate.effort.as_deref() {
                    Some(effort) if !valid_effort_value(effort) => {
                        errors.push(DefinitionError::at(
                            format!("{path}.effort"),
                            "effort must match ^[A-Za-z0-9._-]{1,64}$",
                        ));
                    }
                    Some(_) if candidate.provider == "claude" => {
                        errors.push(DefinitionError::at(
                            format!("{path}.effort"),
                            "claude candidates take no effort; the model name selects capability",
                        ));
                    }
                    _ => {}
                }
            }
        }
        errors
    }

    pub fn resolve(&self) -> ResolvedRosterV1 {
        ResolvedRosterV1 {
            schema: RESOLVED_ROSTER_SCHEMA_V1.to_owned(),
            roster_ref: RosterRef {
                name: self.name.clone(),
                version: 1,
            },
            roles: self.roles.clone(),
        }
    }
}

fn valid_provider_value(value: &str) -> bool {
    !value.trim().is_empty()
        && value.len() <= 128
        && value.chars().all(|c| !c.is_control() && !c.is_whitespace())
}

/// The exact provider model charset failure shared by authoring validation
/// and attempt-time invocation construction.
pub const MODEL_VALUE_CHARSET_ERROR: &str =
    r"model must be non-empty and match ^[A-Za-z0-9][A-Za-z0-9._:/\[\]-]*$";

/// Validate the model charset used at every provider shell/argv boundary.
/// Brackets are allowed after the leading alphanumeric for provider model
/// variants; all other characters retain the prior fence.
pub fn validate_model_value(value: &str) -> Result<(), &'static str> {
    let mut chars = value.chars();
    let head_ok = chars.next().is_some_and(|c| c.is_ascii_alphanumeric());
    let rest_ok = chars
        .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | ':' | '/' | '-' | '[' | ']'));
    if head_ok && rest_ok {
        Ok(())
    } else {
        Err(MODEL_VALUE_CHARSET_ERROR)
    }
}

/// The shell/TOML-embedding charset the provider drivers enforce for
/// reasoning efforts. Vocabulary is the provider CLI's contract; validating
/// the charset here surfaces an unembeddable value at `definition validate`
/// instead of the first packet of a run.
fn valid_effort_value(value: &str) -> bool {
    (1..=64).contains(&value.len())
        && value
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-'))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn candidate(sandbox: Sandbox, writes: bool) -> ProviderCandidateV1 {
        let mut capabilities = BTreeSet::from([Capability::RepositoryRead]);
        if writes {
            capabilities.insert(Capability::RepositoryWrite);
        }
        ProviderCandidateV1 {
            provider: "provider-a".to_owned(),
            model: "model-a".to_owned(),
            effort: None,
            sandbox,
            capabilities,
        }
    }

    fn standard_profile() -> ProfileDefinitionV1 {
        ProfileDefinitionV1 {
            schema: PROFILE_SCHEMA_V1.to_owned(),
            name: "standard".to_owned(),
            protocol: ProtocolRef {
                name: "slice".to_owned(),
                version: 1,
            },
            seats: vec![
                SeatDefinitionV1 {
                    id: SeatId::new("implementation").expect("id"),
                    role: RoleId::new("implementation").expect("role"),
                    purpose: SeatPurpose::Implement,
                },
                SeatDefinitionV1 {
                    id: SeatId::new("review-1").expect("id"),
                    role: RoleId::new("review").expect("role"),
                    purpose: SeatPurpose::Review,
                },
                SeatDefinitionV1 {
                    id: SeatId::new("remediation").expect("id"),
                    role: RoleId::new("remediation").expect("role"),
                    purpose: SeatPurpose::Fix,
                },
            ],
            risk_context: default_risk_context(),
            fix_round_budget: 1,
            escalate_on: vec![EscalationTrigger::GateFailure],
            escalate_to: Some(ProfileRef {
                name: "high".to_owned(),
                version: 1,
            }),
        }
    }

    #[test]
    fn semantic_ids_reject_unsafe_strings() {
        assert!(RoleId::new("review.primary").is_ok());
        assert!(SeatId::new("Review One").is_err());
        assert!(RoleId::new("1review").is_err());
    }

    #[test]
    fn closed_types_reject_unknown_fields() {
        let text = r#"{"schema":"forged.profile/1","name":"lean","protocol":{"name":"slice","version":1},"seats":[],"fixRoundBudget":0,"surprise":true}"#;
        assert!(serde_json::from_str::<ProfileDefinitionV1>(text).is_err());
    }

    #[test]
    fn profile_validation_has_stable_paths_for_closed_topology_errors() {
        let mut profile = standard_profile();
        profile.schema = "forged.profile/99".to_owned();
        profile.seats[1].id = profile.seats[0].id.clone();
        profile.fix_round_budget = 33;
        profile.escalate_on.push(EscalationTrigger::GateFailure);
        let errors = profile.validate();
        for path in [
            "$.profile.schema",
            "$.profile.seats[1].id",
            "$.profile.fixRoundBudget",
            "$.profile.escalateOn",
        ] {
            assert!(errors.iter().any(|error| error.path == path), "{errors:?}");
        }
    }

    #[test]
    fn epic_assurance_is_v1_only_and_has_no_implement_seat() {
        let mut profile = standard_profile();
        profile.protocol.name = "epic-assurance".to_owned();
        profile
            .seats
            .retain(|seat| seat.purpose != SeatPurpose::Implement);
        assert!(profile.validate().is_empty());

        profile.protocol.version = 2;
        assert!(profile
            .validate()
            .iter()
            .any(|error| error.path == "$.profile.protocol"));

        profile.protocol.version = 1;
        profile.seats.push(SeatDefinitionV1 {
            id: SeatId::new("implementation").expect("id"),
            role: RoleId::new("implementation").expect("role"),
            purpose: SeatPurpose::Implement,
        });
        assert!(profile.validate().iter().any(|error| {
            error.path == "$.profile.seats" && error.message.contains("no implement seats")
        }));

        profile
            .seats
            .retain(|seat| seat.purpose != SeatPurpose::Implement);
        profile
            .seats
            .retain(|seat| seat.purpose != SeatPurpose::Review);
        assert!(profile.validate().iter().any(|error| {
            error.path == "$.profile.seats" && error.message.contains("one and four review")
        }));

        profile.seats.push(SeatDefinitionV1 {
            id: SeatId::new("review-1").expect("id"),
            role: RoleId::new("review").expect("role"),
            purpose: SeatPurpose::Review,
        });
        profile.seats.push(SeatDefinitionV1 {
            id: SeatId::new("synthesis-1").expect("id"),
            role: RoleId::new("synthesis").expect("role"),
            purpose: SeatPurpose::Synthesis,
        });
        profile.seats.push(SeatDefinitionV1 {
            id: SeatId::new("synthesis-2").expect("id"),
            role: RoleId::new("synthesis").expect("role"),
            purpose: SeatPurpose::Synthesis,
        });
        profile.seats.push(SeatDefinitionV1 {
            id: SeatId::new("remediation-2").expect("id"),
            role: RoleId::new("remediation").expect("role"),
            purpose: SeatPurpose::Fix,
        });
        let errors = profile.validate();
        assert!(errors
            .iter()
            .any(|error| error.message.contains("at most one synthesis")));
        assert!(errors
            .iter()
            .any(|error| error.message.contains("exactly one fix")));
    }

    #[test]
    fn roster_validation_rejects_missing_empty_model_and_sandbox_mismatches() {
        let profile = standard_profile();
        let mut roster = RosterDefinitionV1 {
            schema: ROSTER_SCHEMA_V1.to_owned(),
            name: "default".to_owned(),
            roles: BTreeMap::from([
                (
                    RoleId::new("implementation").expect("role"),
                    vec![candidate(Sandbox::WorkspaceWrite, false)],
                ),
                (RoleId::new("review").expect("role"), Vec::new()),
            ]),
        };
        let errors = roster.validate_for(&profile);
        assert!(errors
            .iter()
            .any(|error| error.path == "$.roster.roles.remediation"));
        assert!(errors
            .iter()
            .any(|error| error.path == "$.roster.roles.review"));
        assert!(errors
            .iter()
            .any(|error| { error.path == "$.roster.roles.implementation[0].capabilities" }));

        let implementation = roster
            .roles
            .get_mut(&RoleId::new("implementation").expect("role"))
            .expect("candidate");
        implementation[0] = candidate(Sandbox::ReadOnly, true);
        implementation[0].model = "bad model".to_owned();
        let errors = roster.validate_for(&profile);
        assert!(errors.iter().any(|error| error.path.ends_with(".model")));
        assert!(errors
            .iter()
            .any(|error| error.path.ends_with(".capabilities")));
    }

    #[test]
    fn authoring_validation_guards_effort_charset_and_claude_effort_presence() {
        let profile = standard_profile();
        let mut roster = RosterDefinitionV1 {
            schema: ROSTER_SCHEMA_V1.to_owned(),
            name: "default".to_owned(),
            roles: profile
                .seats
                .iter()
                .map(|seat| (seat.role.clone(), vec![candidate(Sandbox::ReadOnly, false)]))
                .collect(),
        };
        for ok in ["max", "ultra", "xhigh", "future.tier-2"] {
            let implementation = roster
                .roles
                .get_mut(&RoleId::new("implementation").expect("role"))
                .expect("candidate");
            implementation[0].effort = Some(ok.to_owned());
            let errors = roster.validate_efforts();
            assert!(
                !errors.iter().any(|error| error.path.ends_with(".effort")),
                "{ok} should validate"
            );
        }
        let implementation = roster
            .roles
            .get_mut(&RoleId::new("implementation").expect("role"))
            .expect("candidate");
        implementation[0].effort = Some("xhigh\"'".to_owned());
        let errors = roster.validate_efforts();
        assert!(errors.iter().any(
            |error| error.path.ends_with(".effort") && error.message.contains("[A-Za-z0-9._-]")
        ));
        // Frozen-safety: the structural validator never applies effort
        // rules, so durable packages carrying historical values stay
        // loadable (compile_frozen_package relies on this).
        assert!(!roster
            .validate_for(&profile)
            .iter()
            .any(|error| error.path.ends_with(".effort")));

        let implementation = roster
            .roles
            .get_mut(&RoleId::new("implementation").expect("role"))
            .expect("candidate");
        implementation[0].provider = "claude".to_owned();
        implementation[0].effort = Some("high".to_owned());
        let errors = roster.validate_efforts();
        assert!(errors.iter().any(|error| error.path.ends_with(".effort")
            && error.message.contains("claude candidates take no effort")));
        assert!(!roster
            .validate_for(&profile)
            .iter()
            .any(|error| error.path.ends_with(".effort")));
    }

    #[test]
    fn authoring_model_validation_accepts_brackets_and_preserves_frozen_structure() {
        let profile = standard_profile();
        let mut roster = RosterDefinitionV1 {
            schema: ROSTER_SCHEMA_V1.to_owned(),
            name: "default".to_owned(),
            roles: profile
                .seats
                .iter()
                .map(|seat| (seat.role.clone(), vec![candidate(Sandbox::ReadOnly, false)]))
                .collect(),
        };
        roster
            .roles
            .get_mut(&RoleId::new("implementation").expect("role"))
            .expect("candidate")[0]
            .model = "claude-sonnet-4[1m]".to_owned();
        assert!(roster.validate_models().is_empty());

        roster
            .roles
            .get_mut(&RoleId::new("implementation").expect("role"))
            .expect("candidate")[0]
            .model = "claude-sonnet-4{1m}".to_owned();
        let errors = roster.validate_models();
        assert!(errors.iter().any(|error| {
            error.path.ends_with(".model") && error.message == MODEL_VALUE_CHARSET_ERROR
        }));
        // Frozen-safety: structural validation remains independent from the
        // current authoring charset.
        assert!(!roster
            .validate_for(&profile)
            .iter()
            .any(|error| error.path.ends_with(".model")));
    }

    fn execution_policy(stage_budget_s: u64, termination_grace_s: u64) -> ExecutionPolicyV1 {
        ExecutionPolicyV1 {
            gate_commands: Vec::new(),
            stage_budget_s: [
                Stage::Implement,
                Stage::ReviewClaude,
                Stage::ReviewCodex,
                Stage::Fix,
            ]
            .into_iter()
            .map(|stage| (stage, stage_budget_s))
            .collect(),
            termination_grace_s,
            transport_retry_budget: 1,
            host_policy: HostPolicyV1::Off,
            herdr_socket: None,
        }
    }

    #[test]
    fn execution_policy_bounds_stage_budget_and_termination_grace() {
        assert!(
            execution_policy(MAX_STAGE_BUDGET_S, MAX_TERMINATION_GRACE_S)
                .validate()
                .is_empty()
        );

        let stage_errors = execution_policy(u64::MAX, DEFAULT_TERMINATION_GRACE_S).validate();
        assert!(stage_errors.iter().any(|error| {
            error.path == "$.policy.stageBudgetS.Implement"
                && error.message.contains("32-bit seconds")
        }));

        for invalid in [0, MAX_TERMINATION_GRACE_S + 1, u64::MAX] {
            let errors = execution_policy(1, invalid).validate();
            assert!(errors
                .iter()
                .any(|error| error.path == "$.policy.terminationGraceS"));
        }
    }

    #[test]
    fn old_policy_json_receives_the_explicit_termination_grace_default() {
        let mut value = serde_json::to_value(execution_policy(1, 17)).expect("policy JSON");
        value
            .as_object_mut()
            .expect("policy object")
            .remove("terminationGraceS");
        let restored: ExecutionPolicyV1 = serde_json::from_value(value).expect("old policy");
        assert_eq!(restored.termination_grace_s, DEFAULT_TERMINATION_GRACE_S);
    }
}
