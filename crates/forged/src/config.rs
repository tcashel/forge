//! Config resolution: one operator-scoped YAML file, read once at startup,
//! plus the sanctioned environment reads (`FORGED_CONFIG`, `BEADS_DIR`).
//!
//! An existing legacy `config.json` remains readable and is projected into
//! the provider-neutral `standard` profile. Authoring data is never runtime
//! truth: run creation compiles it into canonical execution-package JSON.

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::fmt::Write as _;
use std::path::PathBuf;

use forged_types::{
    canonical_json_bytes, Capability, DefinitionError, EscalationTrigger, ExecutionPackageV1,
    ProfileDefinitionV1, ProfileRef, ProtocolRef, ProviderCandidateV1, ProviderHints,
    RosterDefinitionV1, RosterRef, Sandbox, SeatDefinitionV1, SeatId, SeatPurpose, Stage,
    EXECUTION_PACKAGE_SCHEMA_V1, PROFILE_SCHEMA_V1, ROSTER_SCHEMA_V1,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// A compiled execution definition plus the temporary v0 stage projection.
#[derive(Debug, Clone)]
pub struct CompiledDefinition {
    pub package: ExecutionPackageV1,
    pub package_sha256: String,
    pub compatibility_roster: HashMap<Stage, ProviderHints>,
}

/// Every tunable forged reads, resolved once at process start.
#[derive(Debug, Clone)]
pub struct ForgedConfig {
    pub anvil_home: PathBuf,
    pub runs_root: PathBuf,
    pub db_path: PathBuf,
    pub config_path: PathBuf,
    pub config_file_read: bool,
    /// Legacy default projection retained for pre-definition test fixtures.
    pub roster: HashMap<Stage, ProviderHints>,
    pub profiles: BTreeMap<String, ProfileDefinitionV1>,
    pub rosters: BTreeMap<String, RosterDefinitionV1>,
    pub default_profile: String,
    pub default_roster: String,
    pub gate_commands: Vec<String>,
    pub stage_budget_s: HashMap<Stage, u64>,
    pub transport_retry_budget: u32,
    pub bd_path: PathBuf,
    pub beads_dir: PathBuf,
    pub codex_home: PathBuf,
    pub herdr_sock: Option<PathBuf>,
}

/// On-disk authoring shape. Definition values themselves deny unknown fields.
/// Unknown top-level `_comment_*` keys from v0 JSON are intentionally ignored.
#[derive(Debug, Default, Serialize, Deserialize)]
struct ConfigFile {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    default_profile: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    default_roster: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    profiles: Option<BTreeMap<String, ProfileDefinitionV1>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    rosters: Option<BTreeMap<String, RosterDefinitionV1>>,
    /// Legacy v0 stage roster.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    roster: Option<HashMap<Stage, ProviderHints>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    gate_commands: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    stage_budget_s: Option<HashMap<Stage, u64>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    transport_retry_budget: Option<u32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    bd_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    codex_home: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    herdr_sock: Option<String>,
}

fn hints(provider: &str, model: &str, effort: Option<&str>, sandbox: Sandbox) -> ProviderHints {
    ProviderHints {
        provider: provider.to_owned(),
        model: model.to_owned(),
        effort: effort.map(str::to_owned),
        sandbox,
    }
}

fn default_legacy_roster() -> HashMap<Stage, ProviderHints> {
    HashMap::from([
        (
            Stage::Implement,
            hints("claude", "opus", None, Sandbox::WorkspaceWrite),
        ),
        (
            Stage::ReviewClaude,
            hints("claude", "opus", None, Sandbox::ReadOnly),
        ),
        (
            Stage::ReviewCodex,
            hints("codex", "gpt-5.6-sol", Some("xhigh"), Sandbox::ReadOnly),
        ),
        (
            Stage::Fix,
            hints("claude", "opus", None, Sandbox::WorkspaceWrite),
        ),
    ])
}

fn role(value: &str) -> forged_types::RoleId {
    forged_types::RoleId::new(value).expect("static role id")
}

fn seat(id: &str, role_name: &str, purpose: SeatPurpose) -> SeatDefinitionV1 {
    SeatDefinitionV1 {
        id: SeatId::new(id).expect("static seat id"),
        role: role(role_name),
        purpose,
    }
}

fn profile(name: &str, review_roles: &[&str], synthesis: bool) -> ProfileDefinitionV1 {
    let mut seats = vec![seat(
        "implementation",
        "implementation",
        SeatPurpose::Implement,
    )];
    seats.extend(review_roles.iter().enumerate().map(|(index, role_name)| {
        seat(
            &format!("review-{}", index + 1),
            role_name,
            SeatPurpose::Review,
        )
    }));
    if synthesis {
        seats.push(seat("synthesis", "synthesis", SeatPurpose::Synthesis));
    }
    seats.push(seat("remediation", "remediation", SeatPurpose::Fix));
    ProfileDefinitionV1 {
        schema: PROFILE_SCHEMA_V1.to_owned(),
        name: name.to_owned(),
        protocol: ProtocolRef {
            name: "slice".to_owned(),
            version: 1,
        },
        seats,
        fix_round_budget: if name == "lean" { 0 } else { 1 },
        escalate_on: match name {
            "lean" => vec![EscalationTrigger::GateFailure],
            "standard" => vec![
                EscalationTrigger::GateFailure,
                EscalationTrigger::ReviewConflict,
            ],
            _ => Vec::new(),
        },
        escalate_to: match name {
            "lean" => Some(ProfileRef {
                name: "standard".to_owned(),
                version: 1,
            }),
            "standard" => Some(ProfileRef {
                name: "high".to_owned(),
                version: 1,
            }),
            _ => None,
        },
    }
}

fn default_profiles() -> BTreeMap<String, ProfileDefinitionV1> {
    [
        ("lean", profile("lean", &["review.primary"], false)),
        (
            "standard",
            profile("standard", &["review.primary", "review.secondary"], false),
        ),
        (
            "high",
            profile(
                "high",
                &["review.primary", "review.secondary", "review.tertiary"],
                true,
            ),
        ),
    ]
    .into_iter()
    .map(|(name, value)| (name.to_owned(), value))
    .collect()
}

fn candidate(hint: &ProviderHints) -> ProviderCandidateV1 {
    let mut capabilities =
        BTreeSet::from([Capability::RepositoryRead, Capability::StructuredOutput]);
    if hint.sandbox == Sandbox::WorkspaceWrite {
        capabilities.insert(Capability::RepositoryWrite);
    }
    ProviderCandidateV1 {
        provider: hint.provider.clone(),
        model: hint.model.clone(),
        effort: hint.effort.clone(),
        sandbox: hint.sandbox,
        capabilities,
    }
}

fn roster_from_legacy(legacy: &HashMap<Stage, ProviderHints>) -> RosterDefinitionV1 {
    let fallback = default_legacy_roster();
    let get = |stage| {
        legacy
            .get(&stage)
            .or_else(|| fallback.get(&stage))
            .expect("default stage")
    };
    let first_review = candidate(get(Stage::ReviewClaude));
    let second_review = candidate(get(Stage::ReviewCodex));
    RosterDefinitionV1 {
        schema: ROSTER_SCHEMA_V1.to_owned(),
        name: "default".to_owned(),
        roles: BTreeMap::from([
            (
                role("implementation"),
                vec![candidate(get(Stage::Implement))],
            ),
            (role("review.primary"), vec![first_review.clone()]),
            (role("review.secondary"), vec![second_review.clone()]),
            (role("review.tertiary"), vec![first_review]),
            (role("synthesis"), vec![second_review]),
            (role("remediation"), vec![candidate(get(Stage::Fix))]),
        ]),
    }
}

fn default_rosters() -> BTreeMap<String, RosterDefinitionV1> {
    let roster = roster_from_legacy(&default_legacy_roster());
    BTreeMap::from([("default".to_owned(), roster)])
}

fn default_gate_commands() -> Vec<String> {
    vec![
        "cargo build --workspace --locked".to_owned(),
        "cargo test --workspace".to_owned(),
        "cargo clippy --workspace --all-targets -- -D warnings".to_owned(),
        "cargo fmt --all -- --check".to_owned(),
    ]
}

fn default_stage_budget_s() -> HashMap<Stage, u64> {
    HashMap::from([
        (Stage::Implement, 1800),
        (Stage::ReviewClaude, 1800),
        (Stage::ReviewCodex, 1800),
        (Stage::Fix, 1800),
    ])
}

const DEFAULT_TRANSPORT_RETRY_BUDGET: u32 = 3;

fn anvil_home() -> PathBuf {
    if let Some(a) = std::env::var_os("ANVIL_HOME").filter(|v| !v.is_empty()) {
        return PathBuf::from(a);
    }
    if let Some(h) = std::env::var_os("HOME").filter(|v| !v.is_empty()) {
        return PathBuf::from(h).join(".anvil");
    }
    PathBuf::from(".anvil")
}

fn config_path(anvil_home: &std::path::Path) -> PathBuf {
    if let Some(path) = std::env::var_os("FORGED_CONFIG").filter(|v| !v.is_empty()) {
        return PathBuf::from(path);
    }
    let yaml = anvil_home.join("config.yaml");
    if yaml.exists() {
        return yaml;
    }
    let json = anvil_home.join("config.json");
    if json.exists() {
        return json;
    }
    yaml
}

impl ForgedConfig {
    /// Load and resolve the single config snapshot for this process.
    pub fn load() -> Result<ForgedConfig, String> {
        let anvil_home = anvil_home();
        let config_path = config_path(&anvil_home);
        let (file, config_file_read) = match std::fs::read_to_string(&config_path) {
            Ok(text) => {
                let parsed = if config_path.extension().and_then(|v| v.to_str()) == Some("json") {
                    serde_json::from_str(&text).map_err(|e| e.to_string())
                } else {
                    serde_yaml::from_str(&text).map_err(|e| e.to_string())
                }
                .map_err(|e| format!("config {} does not parse: {e}", config_path.display()))?;
                (parsed, true)
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => (ConfigFile::default(), false),
            Err(e) => return Err(format!("config {}: {e}", config_path.display())),
        };

        let legacy_roster = file.roster.unwrap_or_else(default_legacy_roster);
        let profiles = file.profiles.unwrap_or_else(default_profiles);
        let rosters = file.rosters.unwrap_or_else(|| {
            BTreeMap::from([("default".to_owned(), roster_from_legacy(&legacy_roster))])
        });
        let beads_dir = std::env::var_os("BEADS_DIR")
            .filter(|v| !v.is_empty())
            .map(PathBuf::from)
            .unwrap_or_else(|| anvil_home.join("beads"));
        let bd_path = file
            .bd_path
            .map(PathBuf::from)
            .unwrap_or_else(|| anvil_home.join("tools/bd-1.2.1/bin/bd"));
        let codex_home = file.codex_home.map(PathBuf::from).unwrap_or_else(|| {
            std::env::var_os("HOME")
                .map(PathBuf::from)
                .unwrap_or_default()
                .join(".codex")
        });
        Ok(ForgedConfig {
            runs_root: anvil_home.join("runs"),
            db_path: forged_ledger::default_db_path(),
            config_path,
            config_file_read,
            roster: legacy_roster,
            profiles,
            rosters,
            default_profile: file
                .default_profile
                .unwrap_or_else(|| "standard".to_owned()),
            default_roster: file.default_roster.unwrap_or_else(|| "default".to_owned()),
            gate_commands: file.gate_commands.unwrap_or_else(default_gate_commands),
            stage_budget_s: file.stage_budget_s.unwrap_or_else(default_stage_budget_s),
            transport_retry_budget: file
                .transport_retry_budget
                .unwrap_or(DEFAULT_TRANSPORT_RETRY_BUDGET),
            bd_path,
            beads_dir,
            codex_home,
            herdr_sock: file.herdr_sock.map(PathBuf::from),
            anvil_home,
        })
    }

    /// Resolve, validate, canonicalize, and hash a selected definition.
    pub fn compile_definition(
        &self,
        profile_name: Option<&str>,
        roster_name: Option<&str>,
    ) -> Result<CompiledDefinition, Vec<DefinitionError>> {
        let profile_name = profile_name.unwrap_or(&self.default_profile);
        let roster_name = roster_name.unwrap_or(&self.default_roster);
        let Some(profile) = self.profiles.get(profile_name).cloned() else {
            return Err(vec![DefinitionError {
                path: "$.profile".to_owned(),
                message: format!("unknown profile {profile_name:?}"),
            }]);
        };
        let Some(roster) = self.rosters.get(roster_name).cloned() else {
            return Err(vec![DefinitionError {
                path: "$.roster".to_owned(),
                message: format!("unknown roster {roster_name:?}"),
            }]);
        };
        let mut errors = Vec::new();
        let mut profile_catalog = BTreeMap::new();
        let mut cursor = Some(profile.clone());
        let mut seen = BTreeSet::new();
        while let Some(current) = cursor {
            let name = current.name.clone();
            if !seen.insert(name.clone()) {
                errors.push(DefinitionError {
                    path: "$.profile.escalateTo".to_owned(),
                    message: format!("escalation cycle reaches {name:?}"),
                });
                break;
            }
            errors.extend(current.validate());
            errors.extend(roster.validate_for(&current));
            let next = current.escalate_to.as_ref().and_then(|target| {
                match self.profiles.get(&target.name) {
                    Some(value) if target.version == 1 => Some(value.clone()),
                    _ => {
                        errors.push(DefinitionError {
                            path: format!("$.profiles.{name}.escalateTo"),
                            message: format!("missing escalation target {:?}", target.name),
                        });
                        None
                    }
                }
            });
            profile_catalog.insert(name, current);
            cursor = next;
        }
        if profile.name != profile_name {
            errors.push(DefinitionError {
                path: "$.profile.name".to_owned(),
                message: format!(
                    "definition name {:?} does not match selected key {profile_name:?}",
                    profile.name
                ),
            });
        }
        if roster.name != roster_name {
            errors.push(DefinitionError {
                path: "$.roster.name".to_owned(),
                message: format!(
                    "definition name {:?} does not match selected key {roster_name:?}",
                    roster.name
                ),
            });
        }
        let compatibility_roster = match compatibility_projection(&profile, &roster) {
            Ok(value) => value,
            Err(error) => {
                errors.push(error);
                HashMap::new()
            }
        };
        if !errors.is_empty() {
            return Err(errors);
        }
        let resolved = roster.resolve();
        let profile_sha256 = digest_of(&profile).map_err(|message| {
            vec![DefinitionError {
                path: "$.profile".to_owned(),
                message,
            }]
        })?;
        let roster_sha256 = digest_of(&resolved).map_err(|message| {
            vec![DefinitionError {
                path: "$.roster".to_owned(),
                message,
            }]
        })?;
        let package = ExecutionPackageV1 {
            schema: EXECUTION_PACKAGE_SCHEMA_V1.to_owned(),
            protocol_ref: profile.protocol.clone(),
            profile_ref: ProfileRef {
                name: profile.name.clone(),
                version: 1,
            },
            roster_ref: RosterRef {
                name: roster.name.clone(),
                version: 1,
            },
            profile_sha256,
            roster_sha256,
            profile,
            profile_catalog,
            roster: resolved,
        };
        let package_sha256 = digest_of(&package).map_err(|message| {
            vec![DefinitionError {
                path: "$".to_owned(),
                message,
            }]
        })?;
        Ok(CompiledDefinition {
            package,
            package_sha256,
            compatibility_roster,
        })
    }

    /// Compile one current config roster against every profile frozen into
    /// an existing run. This is the only authoring path for explicit roster
    /// revisions; the run's topology never comes from current config.
    pub fn compile_roster_revision(
        &self,
        package: &ExecutionPackageV1,
        roster_name: &str,
    ) -> Result<(forged_types::ResolvedRosterV1, String), Vec<DefinitionError>> {
        let Some(roster) = self.rosters.get(roster_name) else {
            return Err(vec![DefinitionError {
                path: "$.roster".to_owned(),
                message: format!("unknown roster {roster_name:?}"),
            }]);
        };
        let mut errors = Vec::new();
        if roster.name != roster_name {
            errors.push(DefinitionError {
                path: "$.roster.name".to_owned(),
                message: format!(
                    "definition name {:?} does not match selected key {roster_name:?}",
                    roster.name
                ),
            });
        }
        if package.profile_catalog.is_empty() {
            errors.extend(roster.validate_for(&package.profile));
        } else {
            for profile in package.profile_catalog.values() {
                errors.extend(roster.validate_for(profile));
            }
        }
        if !errors.is_empty() {
            return Err(errors);
        }
        let resolved = roster.resolve();
        let digest = digest_of(&resolved).map_err(|message| {
            vec![DefinitionError {
                path: "$.roster".to_owned(),
                message,
            }]
        })?;
        Ok((resolved, digest))
    }

    /// YAML document written by `init`; real YAML comments explain ownership.
    pub fn default_document(&self) -> Result<String, String> {
        let file = ConfigFile {
            default_profile: Some("standard".to_owned()),
            default_roster: Some("default".to_owned()),
            profiles: Some(default_profiles()),
            rosters: Some(default_rosters()),
            roster: None,
            gate_commands: Some(default_gate_commands()),
            stage_budget_s: Some(default_stage_budget_s()),
            transport_retry_budget: Some(DEFAULT_TRANSPORT_RETRY_BUDGET),
            bd_path: Some(
                self.anvil_home
                    .join("tools/bd-1.2.1/bin/bd")
                    .to_string_lossy()
                    .into_owned(),
            ),
            codex_home: Some(
                std::env::var_os("HOME")
                    .map(PathBuf::from)
                    .unwrap_or_default()
                    .join(".codex")
                    .to_string_lossy()
                    .into_owned(),
            ),
            herdr_sock: None,
        };
        if self
            .config_path
            .extension()
            .and_then(|value| value.to_str())
            == Some("json")
        {
            return serde_json::to_string_pretty(&file).map_err(|e| e.to_string());
        }
        let body = serde_yaml::to_string(&file).map_err(|e| e.to_string())?;
        Ok(format!(
            "# forged authoring config; compiled snapshots in state.db are runtime truth.\n# Profiles describe cognitive topology; rosters select provider candidates.\n{body}"
        ))
    }

    pub fn bd_config(&self) -> forged_beads::BdConfig {
        forged_beads::BdConfig::new(self.bd_path.clone(), self.beads_dir.clone())
    }

    pub fn run_dir(&self, run_id: &str) -> PathBuf {
        self.runs_root.join(run_id)
    }

    pub fn worktree(&self, run_id: &str) -> PathBuf {
        self.run_dir(run_id).join("worktree")
    }

    /// Semantic packet directory, independent of a provider/storage lane.
    pub fn packet_dir_key(&self, run_id: &str, stage_key: &str, seq: i64) -> PathBuf {
        self.run_dir(run_id)
            .join("packets")
            .join(stage_key)
            .join(seq.to_string())
    }
}

fn compatibility_projection(
    profile: &ProfileDefinitionV1,
    roster: &RosterDefinitionV1,
) -> Result<HashMap<Stage, ProviderHints>, DefinitionError> {
    let seats = |purpose| {
        profile
            .seats
            .iter()
            .filter(|seat| seat.purpose == purpose)
            .collect::<Vec<_>>()
    };
    let implement = seats(SeatPurpose::Implement);
    let reviews = seats(SeatPurpose::Review);
    let fixes = seats(SeatPurpose::Fix);
    if implement.len() != 1 || reviews.is_empty() || fixes.len() != 1 {
        return Err(DefinitionError {
            path: "$.profile.seats".to_owned(),
            message: "profile cannot supply the temporary slice/v1 storage lanes".to_owned(),
        });
    }
    let candidate = |seat: &SeatDefinitionV1| {
        roster
            .roles
            .get(&seat.role)
            .and_then(|values| values.first())
            .map(|value| ProviderHints {
                provider: value.provider.clone(),
                model: value.model.clone(),
                effort: value.effort.clone(),
                sandbox: value.sandbox,
            })
            .ok_or_else(|| DefinitionError {
                path: format!("$.roster.roles.{}", seat.role.as_str()),
                message: "compatibility projection needs a first candidate".to_owned(),
            })
    };
    Ok(HashMap::from([
        (Stage::Implement, candidate(implement[0])?),
        (Stage::ReviewClaude, candidate(reviews[0])?),
        (
            Stage::ReviewCodex,
            candidate(reviews.get(1).copied().unwrap_or(reviews[0]))?,
        ),
        (Stage::Fix, candidate(fixes[0])?),
    ]))
}

fn digest_of<T: Serialize>(value: &T) -> Result<String, String> {
    let value = serde_json::to_value(value).map_err(|e| e.to_string())?;
    let bytes = canonical_json_bytes(&value).map_err(|e| e.to_string())?;
    let digest = Sha256::digest(bytes);
    let mut hex = String::with_capacity(64);
    for byte in digest {
        write!(&mut hex, "{byte:02x}").map_err(|_| "digest formatting failed".to_owned())?;
    }
    Ok(hex)
}

pub fn stage_str(stage: Stage) -> &'static str {
    match stage {
        Stage::Implement => "implement",
        Stage::ReviewClaude => "reviewclaude",
        Stage::ReviewCodex => "reviewcodex",
        Stage::Fix => "fix",
    }
}

pub fn stage_from_str(s: &str) -> Option<Stage> {
    match s {
        "implement" => Some(Stage::Implement),
        "reviewclaude" => Some(Stage::ReviewClaude),
        "reviewcodex" => Some(Stage::ReviewCodex),
        "fix" => Some(Stage::Fix),
        _ => None,
    }
}

pub fn now_iso() -> String {
    forged_proto::widen_rfc3339(&jiff::Timestamp::now().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn config() -> ForgedConfig {
        ForgedConfig {
            anvil_home: PathBuf::from("/tmp/anvil"),
            runs_root: PathBuf::from("/tmp/anvil/runs"),
            db_path: PathBuf::from("/tmp/anvil/state.db"),
            config_path: PathBuf::from("/tmp/anvil/config.yaml"),
            config_file_read: false,
            roster: default_legacy_roster(),
            profiles: default_profiles(),
            rosters: default_rosters(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: default_gate_commands(),
            stage_budget_s: default_stage_budget_s(),
            transport_retry_budget: DEFAULT_TRANSPORT_RETRY_BUDGET,
            bd_path: PathBuf::from("/tmp/anvil/tools/bd-1.2.1/bin/bd"),
            beads_dir: PathBuf::from("/tmp/anvil/beads"),
            codex_home: PathBuf::from("/tmp/home/.codex"),
            herdr_sock: None,
        }
    }

    #[test]
    fn default_yaml_round_trips_and_compiles() {
        let cfg = config();
        let text = cfg.default_document().expect("yaml");
        assert!(text.starts_with("# forged authoring config"));
        let parsed: ConfigFile = serde_yaml::from_str(&text).expect("parse yaml");
        assert_eq!(parsed.default_profile.as_deref(), Some("standard"));
        let compiled = cfg.compile_definition(None, None).expect("compile");
        assert_eq!(compiled.package.profile_ref.name, "standard");
        assert_eq!(compiled.compatibility_roster.len(), 4);
    }

    #[test]
    fn comments_and_map_order_do_not_change_digest() {
        let cfg = config();
        let first = cfg.compile_definition(None, None).expect("compile");
        let mut reordered = cfg.clone();
        reordered.rosters = reordered.rosters.into_iter().rev().collect();
        let second = reordered.compile_definition(None, None).expect("compile");
        assert_eq!(first.package_sha256, second.package_sha256);
    }

    #[test]
    fn semantic_roster_change_changes_digest_and_stage_projection() {
        let cfg = config();
        let first = cfg.compile_definition(None, None).expect("compile");
        let mut changed = cfg.clone();
        let roster = changed.rosters.get_mut("default").expect("default roster");
        let implementation = roster
            .roles
            .get_mut(&role("implementation"))
            .expect("implementation role");
        implementation[0].provider = "codex".to_owned();
        implementation[0].model = "gpt-5.6-sol".to_owned();
        let second = changed.compile_definition(None, None).expect("compile");
        assert_ne!(first.package_sha256, second.package_sha256);
        assert_eq!(
            second.compatibility_roster[&Stage::Implement].provider,
            "codex"
        );
    }

    #[test]
    fn ledger_inserts_definition_and_revision_atomically_and_checks_digest() {
        let cfg = config();
        let compiled = cfg.compile_definition(None, None).expect("compile");
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = forged_ledger::Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let new_run = |name: &str| forged_ledger::NewRun {
            run_id: forged_types::RunId::new(name).expect("run id"),
            bead_id: name.to_owned(),
            repo: "/tmp/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: format!("forged/{name}"),
        };
        ledger
            .create_run_with_definition(
                new_run("definition-ok"),
                forged_ledger::NewRunDefinition {
                    package: compiled.package.clone(),
                    package_sha256: compiled.package_sha256.clone(),
                    compatibility_roster: compiled.compatibility_roster.clone(),
                },
            )
            .expect("atomic create");
        let stored = ledger
            .get_run_definition("definition-ok")
            .expect("read")
            .expect("definition");
        assert_eq!(stored.package_sha256, compiled.package_sha256);
        assert_eq!(
            ledger
                .latest_roster_revision("definition-ok")
                .expect("read revision")
                .expect("revision")
                .revision,
            1
        );

        let error = ledger
            .create_run_with_definition(
                new_run("definition-bad"),
                forged_ledger::NewRunDefinition {
                    package: compiled.package,
                    package_sha256: "0".repeat(64),
                    compatibility_roster: compiled.compatibility_roster,
                },
            )
            .expect_err("mismatch must refuse");
        assert_eq!(error.code(), forged_types::ErrorCode::InvalidRequest);
        assert_eq!(
            ledger
                .get_run("definition-bad")
                .expect_err("run rolled back")
                .code(),
            forged_types::ErrorCode::RunNotFound
        );
    }

    #[test]
    fn every_default_topology_has_a_storage_projection() {
        let cfg = config();
        for profile in ["lean", "standard", "high"] {
            assert!(cfg.compile_definition(Some(profile), None).is_ok());
        }
    }

    #[test]
    fn stage_strings_round_trip() {
        for stage in [
            Stage::Implement,
            Stage::ReviewClaude,
            Stage::ReviewCodex,
            Stage::Fix,
        ] {
            assert_eq!(stage_from_str(stage_str(stage)), Some(stage));
        }
        assert_eq!(stage_from_str("bogus"), None);
    }

    #[test]
    fn now_iso_is_thirty_bytes_utc() {
        let stamp = now_iso();
        assert_eq!(stamp.len(), 30, "{stamp}");
        assert!(stamp.ends_with('Z'));
    }
}
