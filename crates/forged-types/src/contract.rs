//! Provider-neutral execution-package contracts.
//!
//! These types describe *what cognitive work is required* separately from
//! the provider processes that perform it.  They are deliberately closed and
//! versioned: authoring formats compile into these structs, and only their
//! canonical JSON form is durable runtime truth.

use std::collections::{BTreeMap, BTreeSet};

use serde::{Deserialize, Serialize};

use crate::Sandbox;

/// The only execution-package schema understood by this binary.
pub const EXECUTION_PACKAGE_SCHEMA_V1: &str = "forged.execution-package/1";
/// The only profile schema understood by this binary.
pub const PROFILE_SCHEMA_V1: &str = "forged.profile/1";
/// The only roster schema understood by this binary.
pub const ROSTER_SCHEMA_V1: &str = "forged.roster/1";
/// The only resolved-roster schema understood by this binary.
pub const RESOLVED_ROSTER_SCHEMA_V1: &str = "forged.resolved-roster/1";

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

/// A closed assurance/topology definition for `slice/v1`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProfileDefinitionV1 {
    pub schema: String,
    pub name: String,
    pub protocol: ProtocolRef,
    pub seats: Vec<SeatDefinitionV1>,
    pub fix_round_budget: u8,
    #[serde(default)]
    pub escalate_on: Vec<EscalationTrigger>,
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
    pub roster: ResolvedRosterV1,
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
    /// Validate the closed `slice/v1` topology with stable error paths.
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
        if self.protocol.name != "slice" || self.protocol.version != 1 {
            errors.push(DefinitionError::at(
                "$.profile.protocol",
                "only slice/v1 is supported",
            ));
        }
        if self.seats.is_empty() || self.seats.len() > 8 {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                "seat count must be between 1 and 8",
            ));
        }
        if self.fix_round_budget > 3 {
            errors.push(DefinitionError::at(
                "$.profile.fixRoundBudget",
                "fix round budget must be between 0 and 3",
            ));
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
        if count(SeatPurpose::Implement) != 1 {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                "slice/v1 requires exactly one implement seat",
            ));
        }
        if !(1..=4).contains(&count(SeatPurpose::Review)) {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                "slice/v1 requires between one and four review seats",
            ));
        }
        if count(SeatPurpose::Synthesis) > 1 {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                "slice/v1 permits at most one synthesis seat",
            ));
        }
        if count(SeatPurpose::Fix) != 1 {
            errors.push(DefinitionError::at(
                "$.profile.seats",
                "slice/v1 requires exactly one fix seat",
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
            fix_round_budget: 1,
            escalate_on: vec![EscalationTrigger::GateFailure],
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
        profile.fix_round_budget = 9;
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
}
