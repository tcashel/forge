//! Config resolution: one operator-scoped YAML file, read once at startup,
//! plus the sanctioned environment reads (`FORGED_CONFIG`, `BEADS_DIR`,
//! `BD_BIN`).
//!
//! An existing legacy `config.json` remains readable and is projected into
//! the provider-neutral `standard` profile. Authoring data is never runtime
//! truth: run creation compiles it into canonical execution-package JSON.

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::fmt::Write as _;
use std::os::unix::fs::PermissionsExt;
use std::path::PathBuf;

use forged_types::{
    canonical_json_bytes, Capability, DefinitionError, EscalationTrigger, ExecutionPackageV1,
    ExecutionPolicyV1, HostPolicyV1, ProfileDefinitionV1, ProfileRef, ProtocolRef,
    ProviderCandidateV1, ProviderHints, ResolvedRosterV1, RosterDefinitionV1, RosterRef, Sandbox,
    SeatDefinitionV1, SeatId, SeatPurpose, Stage, EXECUTION_PACKAGE_SCHEMA_V1, PROFILE_SCHEMA_V1,
    ROSTER_SCHEMA_V1,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::pricing::RateCard;

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
    /// The nonempty `FORGED_CONFIG` value resolved at process start. Keeping
    /// selection input in the snapshot makes reloads deterministic and lets
    /// scratch configs resolve only beneath their explicit `anvil_home`.
    pub(crate) config_path_override: Option<PathBuf>,
    pub config_file_read: bool,
    /// The sha256 of the config file bytes this snapshot resolved from;
    /// `None` when no file was read. This is the reload fingerprint: a
    /// long-lived surface refreshes only when the digest stops matching.
    pub config_sha256: Option<String>,
    /// Legacy default projection retained for pre-definition test fixtures.
    pub roster: HashMap<Stage, ProviderHints>,
    pub profiles: BTreeMap<String, ProfileDefinitionV1>,
    pub rosters: BTreeMap<String, RosterDefinitionV1>,
    pub default_profile: String,
    pub default_roster: String,
    pub gate_commands: Vec<String>,
    pub stage_budget_s: HashMap<Stage, u64>,
    pub transport_retry_budget: u32,
    /// Operator-defined, case-insensitive transport substrings extending the
    /// built-in classifier. An over-broad match can consume no more than the
    /// existing transport retry budget frozen into the execution package.
    pub transport_patterns: Vec<String>,
    /// Provider-specific transport substrings appended to the global list.
    pub(crate) provider_transport_patterns: BTreeMap<String, Vec<String>>,
    pub bd_path: PathBuf,
    pub beads_dir: PathBuf,
    pub codex_home: PathBuf,
    pub host_policy: HostPolicyV1,
    pub herdr_sock: Option<PathBuf>,
    /// Published API rates used to impute cost for providers that report
    /// tokens but not money. Seeded when the file omits it.
    pub pricing: RateCard,
    /// Resolved, finite scheduler capacity and optional usage ceilings.
    pub admission: AdmissionPolicy,
    /// Epic scheduling is operational daemon policy. Long-running supervision
    /// refreshes it per iteration; `supervise --once` uses its startup snapshot.
    pub epic_scheduler: EpicScheduler,
}

/// The owner of epic frontier reconciliation.
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EpicScheduler {
    /// Preserve the detached `epic drive` controller.
    #[default]
    Controller,
    /// Let the supervisor's decoupled ore pass walk the frontier.
    Loop,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdmissionPolicy {
    pub total_active: u32,
    pub provider_active: u32,
    pub repository_write_active: u32,
    /// Maximum number of non-terminal child runs one epic wave may hold.
    ///
    /// This is independently bounded from the global admission policy: the
    /// epic selects a finite candidate window and admission remains the
    /// authority for whether any selected child may execute.
    #[serde(default = "default_epic_fanout")]
    pub epic_fanout: u32,
    pub defer_seconds: u64,
    #[serde(default)]
    pub provider_overrides: BTreeMap<String, u32>,
    #[serde(default)]
    pub model_overrides: BTreeMap<String, u32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub token_ceiling: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub known_cost_ceiling_microusd: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rate_limit_ceiling_millipercent: Option<u32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rate_limit_fresh_seconds: Option<u64>,
}

impl Default for AdmissionPolicy {
    fn default() -> Self {
        Self {
            total_active: 8,
            provider_active: 4,
            repository_write_active: 1,
            epic_fanout: default_epic_fanout(),
            defer_seconds: 60,
            provider_overrides: BTreeMap::new(),
            model_overrides: BTreeMap::new(),
            token_ceiling: None,
            known_cost_ceiling_microusd: None,
            rate_limit_ceiling_millipercent: None,
            rate_limit_fresh_seconds: None,
        }
    }
}

impl AdmissionPolicy {
    fn validate(&self) -> Result<(), String> {
        if self.total_active == 0
            || self.provider_active == 0
            || self.repository_write_active == 0
            || self.epic_fanout == 0
            || self.defer_seconds == 0
            || self.provider_overrides.values().any(|limit| *limit == 0)
            || self.model_overrides.values().any(|limit| *limit == 0)
        {
            return Err("admission limits and deferSeconds must be greater than zero".to_owned());
        }
        if self
            .rate_limit_ceiling_millipercent
            .is_some_and(|value| value > 100_000)
        {
            return Err(
                "admission rateLimitCeilingMillipercent must be between 0 and 100000".to_owned(),
            );
        }
        if self.rate_limit_ceiling_millipercent.is_some()
            && self.rate_limit_fresh_seconds.unwrap_or(0) == 0
        {
            return Err(
                "admission rateLimitFreshSeconds is required and non-zero with a rate-limit ceiling"
                    .to_owned(),
            );
        }
        Ok(())
    }
}

const fn default_epic_fanout() -> u32 {
    4
}

pub use forged_types::HostPolicyV1 as HostPolicy;

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
    #[serde(
        rename = "transportPatterns",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    transport_patterns: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    providers: Option<BTreeMap<String, ProviderConfigFile>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    bd_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    codex_home: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    host_policy: Option<HostPolicyV1>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    herdr_sock: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pricing: Option<RateCard>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    admission: Option<AdmissionPolicy>,
    #[serde(
        rename = "epicScheduler",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    epic_scheduler: Option<EpicScheduler>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ProviderConfigFile {
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    transport_patterns: Vec<String>,
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
        risk_context: match name {
            "high" => "Consequential change: treat credible security, data-loss, migration, financial, and irreversible-operation failures as blocking even when their likelihood is low.",
            _ => "Routine change: grade findings by demonstrated likelihood and concrete user or operator consequence; a specification mismatch is not automatically a blocker when the spec itself is wrong.",
        }
        .to_owned(),
        fix_round_budget: if name == "lean" { 0 } else { 1 },
        escalate_on: match name {
            "lean" => vec![EscalationTrigger::GateFailure],
            _ => Vec::new(),
        },
        escalate_to: match name {
            "lean" => Some(ProfileRef {
                name: "standard".to_owned(),
                version: 1,
            }),
            _ => None,
        },
    }
}

fn default_profiles() -> BTreeMap<String, ProfileDefinitionV1> {
    [
        ("lean", profile("lean", &["review.primary"], false)),
        ("standard", profile("standard", &["review.primary"], false)),
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
    let assessment = candidate(&hints("claude", "sonnet", None, Sandbox::ReadOnly));
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
            (role("assessment"), vec![assessment]),
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

fn resolve_stage_budget_s(overrides: Option<HashMap<Stage, u64>>) -> HashMap<Stage, u64> {
    let mut budgets = default_stage_budget_s();
    if let Some(overrides) = overrides {
        budgets.extend(overrides);
    }
    budgets
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

fn config_path(
    anvil_home: &std::path::Path,
    config_path_override: Option<&std::path::Path>,
) -> PathBuf {
    if let Some(path) = config_path_override {
        return path.to_path_buf();
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

fn resolve_bd_path(
    configured: Option<String>,
    environment: Option<std::ffi::OsString>,
    search_path: Option<std::ffi::OsString>,
) -> PathBuf {
    if let Some(configured) = configured {
        let path = PathBuf::from(configured);
        return if path.is_absolute() {
            path.canonicalize().unwrap_or(path)
        } else {
            path
        };
    }
    let requested = environment
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| std::ffi::OsString::from("bd"));
    let unresolved = PathBuf::from(&requested);
    if unresolved.components().count() != 1 {
        return if unresolved.is_absolute() {
            unresolved.canonicalize().unwrap_or(unresolved)
        } else {
            unresolved
        };
    }
    let Some(search_path) = search_path.filter(|value| !value.is_empty()) else {
        return unresolved;
    };
    std::env::split_paths(&search_path)
        .filter(|directory| directory.is_absolute())
        .map(|directory| directory.join(&requested))
        .find(|candidate| {
            candidate.metadata().is_ok_and(|metadata| {
                metadata.is_file() && metadata.permissions().mode() & 0o111 != 0
            })
        })
        .and_then(|candidate| candidate.canonicalize().ok())
        .unwrap_or(unresolved)
}

impl ForgedConfig {
    /// Resolve and validate the non-cognitive policy frozen into every new
    /// package. Upgrade code uses the same boundary to snapshot policy for
    /// packages written before policy became part of the schema.
    pub fn execution_policy(&self) -> Result<ExecutionPolicyV1, Vec<DefinitionError>> {
        let policy = ExecutionPolicyV1 {
            gate_commands: self.gate_commands.clone(),
            stage_budget_s: self
                .stage_budget_s
                .iter()
                .map(|(stage, budget)| (*stage, *budget))
                .collect(),
            termination_grace_s: forged_types::DEFAULT_TERMINATION_GRACE_S,
            transport_retry_budget: self.transport_retry_budget,
            host_policy: self.host_policy,
            herdr_socket: self.herdr_sock.clone(),
        };
        let errors = policy.validate();
        if errors.is_empty() {
            Ok(policy)
        } else {
            Err(errors)
        }
    }

    /// Load and resolve the single config snapshot for this process.
    pub fn load() -> Result<ForgedConfig, String> {
        let anvil_home = anvil_home();
        let config_path_override = std::env::var_os("FORGED_CONFIG")
            .filter(|value| !value.is_empty())
            .map(PathBuf::from);
        let config_path = config_path(&anvil_home, config_path_override.as_deref());
        Self::load_at(anvil_home, config_path, config_path_override)
    }

    fn load_at(
        anvil_home: PathBuf,
        config_path: PathBuf,
        config_path_override: Option<PathBuf>,
    ) -> Result<ForgedConfig, String> {
        let (file, config_file_read, config_sha256) = match std::fs::read_to_string(&config_path) {
            Ok(text) => {
                let parsed = if config_path.extension().and_then(|v| v.to_str()) == Some("json") {
                    serde_json::from_str(&text).map_err(|e| e.to_string())
                } else {
                    serde_yaml::from_str(&text).map_err(|e| e.to_string())
                }
                .map_err(|e| format!("config {} does not parse: {e}", config_path.display()))?;
                (parsed, true, Some(content_sha256(text.as_bytes())))
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                (ConfigFile::default(), false, None)
            }
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
        let bd_path = resolve_bd_path(
            file.bd_path,
            std::env::var_os("BD_BIN"),
            std::env::var_os("PATH"),
        );
        let codex_home = file.codex_home.map(PathBuf::from).unwrap_or_else(|| {
            std::env::var_os("HOME")
                .map(PathBuf::from)
                .unwrap_or_default()
                .join(".codex")
        });
        let herdr_sock = file
            .herdr_sock
            .map(PathBuf::from)
            .or_else(|| {
                std::env::var_os("HERDR_SOCK")
                    .filter(|v| !v.is_empty())
                    .map(PathBuf::from)
            })
            .or_else(|| {
                std::env::var_os("HOME")
                    .filter(|v| !v.is_empty())
                    .map(PathBuf::from)
                    .map(|home| home.join(".config/herdr/herdr.sock"))
            });
        let admission = file.admission.unwrap_or_default();
        admission.validate()?;
        let transport_patterns = file.transport_patterns.unwrap_or_default();
        let provider_transport_patterns = file
            .providers
            .unwrap_or_default()
            .into_iter()
            .map(|(provider, config)| (provider, config.transport_patterns))
            .collect();
        Ok(ForgedConfig {
            runs_root: anvil_home.join("runs"),
            db_path: anvil_home.join("state.db"),
            config_path,
            config_path_override,
            config_file_read,
            config_sha256,
            roster: legacy_roster,
            profiles,
            rosters,
            default_profile: file
                .default_profile
                .unwrap_or_else(|| "standard".to_owned()),
            default_roster: file.default_roster.unwrap_or_else(|| "default".to_owned()),
            gate_commands: file.gate_commands.unwrap_or_else(default_gate_commands),
            stage_budget_s: resolve_stage_budget_s(file.stage_budget_s),
            transport_retry_budget: file
                .transport_retry_budget
                .unwrap_or(DEFAULT_TRANSPORT_RETRY_BUDGET),
            transport_patterns,
            provider_transport_patterns,
            bd_path,
            beads_dir,
            codex_home,
            host_policy: file.host_policy.unwrap_or(HostPolicyV1::Preferred),
            herdr_sock,
            pricing: file
                .pricing
                .unwrap_or_else(crate::pricing::default_rate_card),
            admission,
            epic_scheduler: file.epic_scheduler.unwrap_or_default(),
            anvil_home,
        })
    }

    /// Re-resolve this snapshot's config, refreshing every file-derived
    /// field. The file's IDENTITY is re-selected exactly as a fresh process
    /// selects it (the startup `FORGED_CONFIG`, then yaml-before-json under
    /// this home),
    /// so a `config.yaml` created — or removed over a json fallback — while
    /// a long-lived surface runs is honored, not pinned past. The identity
    /// anchors — `db_path`, `runs_root`, `beads_dir` — are preserved from
    /// this snapshot: a live config edit may retune rosters, profiles,
    /// pricing, or admission, but it must never re-point durable state out
    /// from under an open surface.
    pub fn reload(&self) -> Result<ForgedConfig, String> {
        let selected = config_path(&self.anvil_home, self.config_path_override.as_deref());
        let mut fresh = Self::load_at(
            self.anvil_home.clone(),
            selected,
            self.config_path_override.clone(),
        )?;
        fresh.db_path = self.db_path.clone();
        fresh.runs_root = self.runs_root.clone();
        fresh.beads_dir = self.beads_dir.clone();
        Ok(fresh)
    }

    /// The reload gate for long-lived surfaces: `Ok(None)` when the
    /// selected config file is still this snapshot's file with matching
    /// fingerprint, `Ok(Some(fresh))` when the content changed (including
    /// appearing or disappearing) or the SELECTION moved to a different
    /// path. A snapshot that never read a file and still selects none is
    /// unchanged by definition — a hand-built config with no backing file
    /// never reloads over itself.
    pub fn refreshed(&self) -> Result<Option<ForgedConfig>, String> {
        if config_path(&self.anvil_home, self.config_path_override.as_deref()) != self.config_path {
            return self.reload().map(Some);
        }
        match std::fs::read(&self.config_path) {
            Ok(bytes) => {
                if self.config_sha256.as_deref() == Some(content_sha256(&bytes).as_str()) {
                    return Ok(None);
                }
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                if self.config_sha256.is_none() {
                    return Ok(None);
                }
            }
            Err(e) => return Err(format!("config {}: {e}", self.config_path.display())),
        }
        self.reload().map(Some)
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
        if matches!(
            profile.protocol.name.as_str(),
            "epic-plan" | "epic-assurance"
        ) {
            return Err(vec![DefinitionError {
                path: "$.profile.protocol".to_owned(),
                message: format!(
                    "{}/v1 is runtime-derived and cannot be selected directly",
                    profile.protocol.name
                ),
            }]);
        }
        let Some(roster) = self.rosters.get(roster_name).cloned() else {
            return Err(vec![DefinitionError {
                path: "$.roster".to_owned(),
                message: format!("unknown roster {roster_name:?}"),
            }]);
        };
        let mut errors = self.transport_pattern_errors();
        // Authoring boundary: provider embedding rules apply to the roster
        // being frozen NOW, never to already-frozen packages.
        errors.extend(roster.validate_models());
        errors.extend(roster.validate_efforts());
        let mut profile_catalog = BTreeMap::new();
        let mut cursor = Some((profile_name.to_owned(), profile.clone()));
        let mut seen = BTreeSet::new();
        while let Some((reference, current)) = cursor {
            let name = current.name.clone();
            if !seen.insert(reference.clone()) {
                errors.push(DefinitionError {
                    path: "$.profile.escalateTo".to_owned(),
                    message: format!("escalation cycle reaches {reference:?}"),
                });
                break;
            }
            if name != reference {
                errors.push(DefinitionError {
                    path: format!("$.profiles.{reference}.name"),
                    message: format!(
                        "definition name {name:?} does not match referenced key {reference:?}"
                    ),
                });
            }
            errors.extend(current.validate());
            errors.extend(roster.validate_for(&current));
            let next = current.escalate_to.as_ref().and_then(|target| {
                match self.profiles.get(&target.name) {
                    Some(value) if target.version == 1 => {
                        Some((target.name.clone(), value.clone()))
                    }
                    _ => {
                        errors.push(DefinitionError {
                            path: format!("$.profiles.{reference}.escalateTo"),
                            message: format!("missing escalation target {:?}", target.name),
                        });
                        None
                    }
                }
            });
            profile_catalog.insert(reference, current);
            cursor = next;
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
        let policy = self.execution_policy()?;
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
            policy,
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

    fn transport_pattern_errors(&self) -> Vec<DefinitionError> {
        let mut errors = self
            .transport_patterns
            .iter()
            .enumerate()
            .filter(|(_, pattern)| pattern.trim().is_empty())
            .map(|(index, _)| DefinitionError {
                path: format!("$.transportPatterns[{index}]"),
                message: "transport pattern must not be empty".to_owned(),
            })
            .collect::<Vec<_>>();
        for (provider, patterns) in &self.provider_transport_patterns {
            errors.extend(
                patterns
                    .iter()
                    .enumerate()
                    .filter(|(_, pattern)| pattern.trim().is_empty())
                    .map(|(index, _)| DefinitionError {
                        path: format!("$.providers.{provider}.transportPatterns[{index}]"),
                        message: "transport pattern must not be empty".to_owned(),
                    }),
            );
        }
        errors
    }

    /// Resolve the global list followed by the selected provider's extension.
    /// Empty entries are ignored here so historical frozen runs remain safe
    /// when current authoring config fails the definition-compile validation.
    pub fn transport_patterns_for(&self, provider: &str) -> Vec<&str> {
        self.transport_patterns
            .iter()
            .chain(
                self.provider_transport_patterns
                    .get(provider)
                    .into_iter()
                    .flatten(),
            )
            .map(String::as_str)
            .filter(|pattern| !pattern.trim().is_empty())
            .collect()
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
        // A revision mints NEW frozen state from the current config, so the
        // authoring-time provider embedding rules apply here exactly as in
        // compile_definition.
        errors.extend(roster.validate_models());
        errors.extend(roster.validate_efforts());
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
            transport_patterns: Some(self.transport_patterns.clone()),
            providers: (!self.provider_transport_patterns.is_empty()).then(|| {
                self.provider_transport_patterns
                    .iter()
                    .map(|(provider, patterns)| {
                        (
                            provider.clone(),
                            ProviderConfigFile {
                                transport_patterns: patterns.clone(),
                            },
                        )
                    })
                    .collect()
            }),
            bd_path: None,
            codex_home: Some(
                std::env::var_os("HOME")
                    .map(PathBuf::from)
                    .unwrap_or_default()
                    .join(".codex")
                    .to_string_lossy()
                    .into_owned(),
            ),
            host_policy: Some(HostPolicyV1::Preferred),
            herdr_sock: self
                .herdr_sock
                .as_ref()
                .map(|path| path.to_string_lossy().into_owned()),
            pricing: Some(self.pricing.clone()),
            admission: Some(self.admission.clone()),
            epic_scheduler: Some(self.epic_scheduler),
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

/// Validate and hash an already-resolved package without consulting
/// authoring configuration. Epic children use this after overlaying an
/// explicit roster revision on their frozen template.
pub fn compile_frozen_package(
    package: ExecutionPackageV1,
) -> Result<CompiledDefinition, Vec<DefinitionError>> {
    let mut errors = Vec::new();
    if package.schema != EXECUTION_PACKAGE_SCHEMA_V1 {
        errors.push(DefinitionError {
            path: "$.schema".to_owned(),
            message: format!("unsupported schema {:?}", package.schema),
        });
    }
    if package.protocol_ref != package.profile.protocol {
        errors.push(DefinitionError {
            path: "$.protocolRef".to_owned(),
            message: "protocol ref does not match frozen profile".to_owned(),
        });
    }
    errors.extend(package.profile.validate());
    errors.extend(package.policy.validate());
    if package.profile_ref.name != package.profile.name || package.profile_ref.version != 1 {
        errors.push(DefinitionError {
            path: "$.profileRef".to_owned(),
            message: "profile ref does not match frozen profile".to_owned(),
        });
    }
    if package.roster_ref != package.roster.roster_ref {
        errors.push(DefinitionError {
            path: "$.rosterRef".to_owned(),
            message: "roster ref does not match resolved roster".to_owned(),
        });
    }
    let roster = RosterDefinitionV1 {
        schema: ROSTER_SCHEMA_V1.to_owned(),
        name: package.roster_ref.name.clone(),
        roles: package.roster.roles.clone(),
    };
    let profiles = if package.profile_catalog.is_empty() {
        vec![&package.profile]
    } else {
        package.profile_catalog.values().collect()
    };
    for profile in profiles {
        errors.extend(profile.validate());
        errors.extend(roster.validate_for(profile));
    }
    let compatibility_roster =
        match compatibility_projection_resolved(&package.profile, &package.roster) {
            Ok(value) => value,
            Err(error) => {
                errors.push(error);
                HashMap::new()
            }
        };
    let profile_sha256 = digest_of(&package.profile).map_err(|message| {
        vec![DefinitionError {
            path: "$.profile".to_owned(),
            message,
        }]
    })?;
    if profile_sha256 != package.profile_sha256 {
        errors.push(DefinitionError {
            path: "$.profileSha256".to_owned(),
            message: "profile digest mismatch".to_owned(),
        });
    }
    let roster_sha256 = digest_of(&package.roster).map_err(|message| {
        vec![DefinitionError {
            path: "$.roster".to_owned(),
            message,
        }]
    })?;
    if roster_sha256 != package.roster_sha256 {
        errors.push(DefinitionError {
            path: "$.rosterSha256".to_owned(),
            message: "roster digest mismatch".to_owned(),
        });
    }
    if !errors.is_empty() {
        return Err(errors);
    }
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

fn internal_role_is_read_only(roster: &ResolvedRosterV1, role: &forged_types::RoleId) -> bool {
    roster.roles.get(role).is_some_and(|candidates| {
        !candidates.is_empty()
            && candidates.iter().all(|candidate| {
                candidate.sandbox == Sandbox::ReadOnly
                    && candidate.capabilities.contains(&Capability::RepositoryRead)
                    && candidate
                        .capabilities
                        .contains(&Capability::StructuredOutput)
                    && !candidate
                        .capabilities
                        .contains(&Capability::RepositoryWrite)
            })
    })
}

fn planning_role_uses_supported_provider(
    roster: &ResolvedRosterV1,
    role: &forged_types::RoleId,
) -> bool {
    roster.roles.get(role).is_some_and(|candidates| {
        !candidates.is_empty()
            && candidates
                .iter()
                .all(|candidate| matches!(candidate.provider.as_str(), "claude" | "codex" | "pi"))
    })
}

/// Derive the closed `epic-plan/v1` package from one already-frozen epic
/// package. Provider selection remains frozen; only the bounded protocol
/// topology changes. Authoring and revision use a frozen read-only reviewer;
/// every retained critique seat must be read-only too.
pub(crate) fn compile_epic_plan_package(
    base: &ExecutionPackageV1,
) -> Result<CompiledDefinition, Vec<DefinitionError>> {
    let assessment_role = role("assessment");
    let Some(assessment_candidates) = base.roster.roles.get(&assessment_role) else {
        return Err(vec![DefinitionError {
            path: "$.roster.roles.assessment".to_owned(),
            message: "rolling epic planning requires a dedicated assessment role".to_owned(),
        }]);
    };
    let critique = base
        .profile
        .seats
        .iter()
        .filter(|seat| matches!(seat.purpose, SeatPurpose::Review | SeatPurpose::Synthesis))
        .collect::<Vec<_>>();
    if !critique
        .iter()
        .any(|seat| seat.purpose == SeatPurpose::Review)
    {
        return Err(vec![DefinitionError {
            path: "$.profile.seats".to_owned(),
            message: "rolling epic planning requires at least one review seat".to_owned(),
        }]);
    }
    if let Some(seat) = critique.iter().find(|seat| {
        !internal_role_is_read_only(&base.roster, &seat.role)
            || !planning_role_uses_supported_provider(&base.roster, &seat.role)
    }) {
        return Err(vec![DefinitionError {
            path: format!("$.roster.roles.{}", seat.role.as_str()),
            message: "rolling epic critique candidates must all be read-only".to_owned(),
        }]);
    }
    if !internal_role_is_read_only(&base.roster, &assessment_role)
        || !planning_role_uses_supported_provider(&base.roster, &assessment_role)
    {
        return Err(vec![DefinitionError {
            path: "$.roster.roles.assessment".to_owned(),
            message: "rolling epic assessment candidates must support enforced read-only execution"
                .to_owned(),
        }]);
    }
    let overlaps_assessment = |role: &forged_types::RoleId| {
        base.roster.roles.get(role).is_some_and(|candidates| {
            candidates.iter().any(|critic| {
                assessment_candidates.iter().any(|author| {
                    critic.provider == author.provider && critic.model == author.model
                })
            })
        })
    };
    if let Some(seat) = critique.iter().find(|seat| overlaps_assessment(&seat.role)) {
        return Err(vec![DefinitionError {
            path: format!("$.roster.roles.{}", seat.role.as_str()),
            message: "rolling epic critique candidates must be distinct from assessment candidates"
                .to_owned(),
        }]);
    }

    let protocol = ProtocolRef {
        name: "epic-plan".to_owned(),
        version: 1,
    };
    let internal_seat = |id, role, purpose| SeatDefinitionV1 {
        id: SeatId::new(id).expect("fixed epic-plan seat id is valid"),
        role,
        purpose,
    };
    let mut seats = vec![internal_seat(
        "plan-author",
        assessment_role.clone(),
        SeatPurpose::Implement,
    )];
    let mut reviews = 0usize;
    let mut syntheses = 0usize;
    for source in critique {
        let mut seat = source.clone();
        let id = match seat.purpose {
            SeatPurpose::Review => {
                reviews = reviews.saturating_add(1);
                format!("plan-review-{reviews}")
            }
            SeatPurpose::Synthesis => {
                syntheses = syntheses.saturating_add(1);
                format!("plan-synthesis-{syntheses}")
            }
            _ => unreachable!("critique seats are filtered by purpose"),
        };
        seat.id = SeatId::new(id).expect("bounded epic-plan seat ordinal is valid");
        seats.push(seat);
    }
    seats.push(internal_seat(
        "plan-revision",
        assessment_role,
        SeatPurpose::Fix,
    ));
    let mut package = base.clone();
    package.protocol_ref = protocol.clone();
    package.profile = ProfileDefinitionV1 {
        schema: PROFILE_SCHEMA_V1.to_owned(),
        name: "epic-plan".to_owned(),
        protocol,
        seats,
        risk_context: base.profile.risk_context.clone(),
        fix_round_budget: 1,
        escalate_on: Vec::new(),
        escalate_to: None,
    };
    package.profile_ref = ProfileRef {
        name: package.profile.name.clone(),
        version: 1,
    };
    package.profile_catalog.clear();
    package.profile_sha256 = digest_of(&package.profile).map_err(|message| {
        vec![DefinitionError {
            path: "$.profile".to_owned(),
            message,
        }]
    })?;
    package.roster_sha256 = digest_of(&package.roster).map_err(|message| {
        vec![DefinitionError {
            path: "$.roster".to_owned(),
            message,
        }]
    })?;
    compile_frozen_package(package)
}

/// Derive the internal `epic-assurance/v1` package from an already-frozen
/// slice package. The existing review, synthesis, and remediation topology
/// is retained verbatim; only implementation seats are omitted because the
/// epic integration branch already contains the work under review.
pub(crate) fn compile_epic_assurance_package(
    base: &ExecutionPackageV1,
) -> Result<CompiledDefinition, Vec<DefinitionError>> {
    if base.protocol_ref.name != "slice" || base.protocol_ref.version != 1 {
        return Err(vec![DefinitionError {
            path: "$.protocolRef".to_owned(),
            message: "epic assurance must derive from a frozen slice/v1 package".to_owned(),
        }]);
    }
    if let Some(seat) = std::iter::once(&base.profile)
        .chain(base.profile_catalog.values())
        .flat_map(|profile| profile.seats.iter())
        .filter(|seat| matches!(seat.purpose, SeatPurpose::Review | SeatPurpose::Synthesis))
        .find(|seat| !internal_role_is_read_only(&base.roster, &seat.role))
    {
        return Err(vec![DefinitionError {
            path: format!("$.roster.roles.{}", seat.role.as_str()),
            message: "epic assurance review and synthesis candidates must all be read-only"
                .to_owned(),
        }]);
    }
    let protocol = ProtocolRef {
        name: "epic-assurance".to_owned(),
        version: 1,
    };
    let derive_profile = |profile: &ProfileDefinitionV1| {
        let mut profile = profile.clone();
        profile.protocol = protocol.clone();
        profile
            .seats
            .retain(|seat| seat.purpose != SeatPurpose::Implement);
        profile
    };

    let mut package = base.clone();
    package.protocol_ref = protocol.clone();
    package.profile = derive_profile(&base.profile);
    package.profile_catalog = base
        .profile_catalog
        .iter()
        .map(|(name, profile)| (name.clone(), derive_profile(profile)))
        .collect();
    package.profile_sha256 = digest_of(&package.profile).map_err(|message| {
        vec![DefinitionError {
            path: "$.profile".to_owned(),
            message,
        }]
    })?;
    package.roster_sha256 = digest_of(&package.roster).map_err(|message| {
        vec![DefinitionError {
            path: "$.roster".to_owned(),
            message,
        }]
    })?;
    compile_frozen_package(package)
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
    let assurance = profile.protocol.name == "epic-assurance" && profile.protocol.version == 1;
    let implement_valid = if assurance {
        implement.is_empty()
    } else {
        implement.len() == 1
    };
    if !implement_valid || reviews.is_empty() || fixes.len() != 1 {
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
    let implement_lane = if assurance { fixes[0] } else { implement[0] };
    Ok(HashMap::from([
        (Stage::Implement, candidate(implement_lane)?),
        (Stage::ReviewClaude, candidate(reviews[0])?),
        (
            Stage::ReviewCodex,
            candidate(reviews.get(1).copied().unwrap_or(reviews[0]))?,
        ),
        (Stage::Fix, candidate(fixes[0])?),
    ]))
}

fn compatibility_projection_resolved(
    profile: &ProfileDefinitionV1,
    roster: &ResolvedRosterV1,
) -> Result<HashMap<Stage, ProviderHints>, DefinitionError> {
    compatibility_projection(
        profile,
        &RosterDefinitionV1 {
            schema: ROSTER_SCHEMA_V1.to_owned(),
            name: roster.roster_ref.name.clone(),
            roles: roster.roles.clone(),
        },
    )
}

fn content_sha256(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    let mut hex = String::with_capacity(64);
    for byte in digest {
        let _ = write!(&mut hex, "{byte:02x}");
    }
    hex
}

pub(crate) fn digest_of<T: Serialize>(value: &T) -> Result<String, String> {
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

/// A complete default config over one scratch operator scope, for unit
/// tests that never call `load`.
///
/// The caller's tempdir is the config's explicit `ANVIL_HOME`, and the absent
/// override means refreshes select only beneath it. Tests therefore never
/// consult ambient `ANVIL_HOME` or `FORGED_CONFIG`, even when run from a live
/// operator environment.
#[cfg(test)]
pub(crate) fn scratch_config(anvil_home: &std::path::Path) -> ForgedConfig {
    ForgedConfig {
        anvil_home: anvil_home.to_path_buf(),
        runs_root: anvil_home.join("runs"),
        db_path: anvil_home.join("state.db"),
        config_path: anvil_home.join("config.yaml"),
        config_path_override: None,
        config_file_read: false,
        config_sha256: None,
        roster: default_legacy_roster(),
        profiles: default_profiles(),
        rosters: default_rosters(),
        default_profile: "standard".to_owned(),
        default_roster: "default".to_owned(),
        gate_commands: default_gate_commands(),
        stage_budget_s: default_stage_budget_s(),
        transport_retry_budget: DEFAULT_TRANSPORT_RETRY_BUDGET,
        transport_patterns: Vec::new(),
        provider_transport_patterns: BTreeMap::new(),
        bd_path: PathBuf::from("bd"),
        beads_dir: anvil_home.join("beads"),
        codex_home: anvil_home.join("codex-home"),
        host_policy: HostPolicy::Preferred,
        herdr_sock: None,
        pricing: crate::pricing::default_rate_card(),
        admission: AdmissionPolicy::default(),
        epic_scheduler: EpicScheduler::Controller,
    }
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
            config_path_override: None,
            config_file_read: false,
            config_sha256: None,
            roster: default_legacy_roster(),
            profiles: default_profiles(),
            rosters: default_rosters(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: default_gate_commands(),
            stage_budget_s: default_stage_budget_s(),
            transport_retry_budget: DEFAULT_TRANSPORT_RETRY_BUDGET,
            transport_patterns: Vec::new(),
            provider_transport_patterns: BTreeMap::new(),
            bd_path: PathBuf::from("/tmp/configured/bd"),
            beads_dir: PathBuf::from("/tmp/anvil/beads"),
            codex_home: PathBuf::from("/tmp/home/.codex"),
            host_policy: HostPolicy::Preferred,
            herdr_sock: None,
            pricing: crate::pricing::default_rate_card(),
            admission: AdmissionPolicy::default(),
            epic_scheduler: EpicScheduler::Controller,
        }
    }

    #[test]
    fn default_yaml_round_trips_and_compiles() {
        let cfg = config();
        let text = cfg.default_document().expect("yaml");
        assert!(text.starts_with("# forged authoring config"));
        let parsed: ConfigFile = serde_yaml::from_str(&text).expect("parse yaml");
        assert_eq!(parsed.default_profile.as_deref(), Some("standard"));
        assert!(
            parsed.bd_path.is_none(),
            "generated config must preserve PATH-based bd resolution"
        );
        let compiled = cfg.compile_definition(None, None).expect("compile");
        assert_eq!(compiled.package.profile_ref.name, "standard");
        assert_eq!(compiled.compatibility_roster.len(), 4);
    }

    #[test]
    fn epic_scheduler_defaults_to_controller_and_accepts_the_top_level_loop_knob() {
        let directory = tempfile::tempdir().expect("tempdir");
        let path = directory.path().join("config.yaml");
        std::fs::write(&path, "futureTopLevelKey: tolerated\n").expect("default config");
        let defaulted = ForgedConfig::load_at(
            directory.path().to_path_buf(),
            path.clone(),
            Some(path.clone()),
        )
        .expect("unknown top-level key remains tolerated");
        assert_eq!(defaulted.epic_scheduler, EpicScheduler::Controller);

        std::fs::write(&path, "epicScheduler: loop\nfutureTopLevelKey: tolerated\n")
            .expect("loop config");
        let loop_config =
            ForgedConfig::load_at(directory.path().to_path_buf(), path.clone(), Some(path))
                .expect("loop scheduler config");
        assert_eq!(loop_config.epic_scheduler, EpicScheduler::Loop);
    }

    #[test]
    fn configured_transport_patterns_classify_and_provider_entries_extend_global() {
        let directory = tempfile::tempdir().expect("tempdir");
        let path = directory.path().join("config.yaml");
        std::fs::write(
            &path,
            "transportPatterns:\n  - edge veil collapsed\nproviders:\n  codex:\n    transportPatterns:\n      - vendor stream folded\n",
        )
        .expect("config fixture");
        let configured = ForgedConfig::load_at(
            directory.path().to_path_buf(),
            path.clone(),
            Some(path.clone()),
        )
        .expect("load configured patterns");

        assert_eq!(
            configured.transport_patterns_for("claude"),
            vec!["edge veil collapsed"]
        );
        let codex_patterns = configured.transport_patterns_for("codex");
        assert_eq!(
            codex_patterns,
            vec!["edge veil collapsed", "vendor stream folded"]
        );
        let global_failure = r#"{"type":"turn.failed","error":{"message":"The EDGE VEIL COLLAPSED during delivery"}}"#;
        assert!(matches!(
            crate::adapters::extract::harvest_codex(
                global_failure,
                None,
                "forged.result.implement/1",
                "run-1/implement/1",
                &codex_patterns,
            ),
            crate::adapters::extract::Harvest::Transport(_)
        ));
        let failed = r#"{"type":"turn.failed","error":{"message":"The VENDOR STREAM FOLDED during delivery"}}"#;
        assert!(matches!(
            crate::adapters::extract::harvest_codex(
                failed,
                None,
                "forged.result.implement/1",
                "run-1/implement/1",
                &codex_patterns,
            ),
            crate::adapters::extract::Harvest::Transport(_)
        ));

        std::fs::write(&path, "{}\n").expect("remove configured patterns");
        let unconfigured =
            ForgedConfig::load_at(directory.path().to_path_buf(), path.clone(), Some(path))
                .expect("reload without configured patterns");
        assert!(matches!(
            crate::adapters::extract::harvest_codex(
                failed,
                None,
                "forged.result.implement/1",
                "run-1/implement/1",
                &unconfigured.transport_patterns_for("codex"),
            ),
            crate::adapters::extract::Harvest::Semantic(_)
        ));
    }

    #[test]
    fn authoring_rejects_empty_transport_patterns_but_frozen_compile_bypasses_them() {
        let package = config()
            .compile_definition(None, None)
            .expect("valid authoring config")
            .package;
        let mut invalid = config();
        invalid.transport_patterns.push("  ".to_owned());
        invalid
            .provider_transport_patterns
            .insert("codex".to_owned(), vec![String::new()]);

        let errors = invalid
            .compile_definition(None, None)
            .expect_err("empty patterns must fail authoring");
        assert!(errors.iter().any(|error| {
            error.path == "$.transportPatterns[0]"
                && error.message == "transport pattern must not be empty"
        }));
        assert!(errors.iter().any(|error| {
            error.path == "$.providers.codex.transportPatterns[0]"
                && error.message == "transport pattern must not be empty"
        }));

        compile_frozen_package(package).expect("frozen packages bypass authoring config");
        assert!(invalid.transport_patterns_for("codex").is_empty());
    }

    #[test]
    fn bd_resolution_prefers_config_then_nonempty_environment_then_path() {
        let directory = tempfile::tempdir().expect("tempdir");
        let path_bd = directory.path().join("bd");
        std::fs::write(&path_bd, "#!/bin/sh\n").expect("bd fixture");
        let mut permissions = path_bd.metadata().expect("metadata").permissions();
        permissions.set_mode(0o755);
        std::fs::set_permissions(&path_bd, permissions).expect("executable fixture");
        let search_path = Some(directory.path().as_os_str().to_os_string());
        let linked_bd = directory.path().join("linked-bd");
        std::os::unix::fs::symlink(&path_bd, &linked_bd).expect("linked bd fixture");

        let current_directory = std::env::current_dir().expect("current directory");
        let relative_directory =
            tempfile::tempdir_in(&current_directory).expect("relative tempdir");
        let relative_bd = relative_directory.path().join("bd");
        std::fs::write(&relative_bd, "#!/bin/sh\n").expect("relative bd fixture");
        let relative_bd = relative_bd
            .strip_prefix(&current_directory)
            .expect("relative bd path")
            .to_path_buf();

        assert_eq!(
            resolve_bd_path(
                Some(linked_bd.to_string_lossy().into_owned()),
                Some(std::ffi::OsString::from("/environment/bd")),
                search_path.clone(),
            ),
            path_bd.canonicalize().expect("canonical configured bd")
        );
        assert_eq!(
            resolve_bd_path(
                None,
                Some(linked_bd.as_os_str().to_os_string()),
                search_path.clone(),
            ),
            path_bd.canonicalize().expect("canonical environment bd")
        );
        assert_eq!(
            resolve_bd_path(
                Some(relative_bd.to_string_lossy().into_owned()),
                None,
                search_path.clone(),
            ),
            relative_bd
        );
        assert_eq!(
            resolve_bd_path(
                None,
                Some(relative_bd.as_os_str().to_os_string()),
                search_path.clone(),
            ),
            relative_bd
        );

        assert_eq!(
            resolve_bd_path(
                Some("/configured/bd".to_owned()),
                Some(std::ffi::OsString::from("/environment/bd")),
                search_path.clone(),
            ),
            PathBuf::from("/configured/bd")
        );
        assert_eq!(
            resolve_bd_path(
                None,
                Some(std::ffi::OsString::from("/environment/bd")),
                search_path.clone(),
            ),
            PathBuf::from("/environment/bd")
        );
        assert_eq!(
            resolve_bd_path(
                None,
                Some(std::ffi::OsString::from("bd")),
                search_path.clone(),
            ),
            path_bd.canonicalize().expect("canonical bd")
        );
        assert_eq!(
            resolve_bd_path(None, Some(std::ffi::OsString::new()), search_path),
            path_bd.canonicalize().expect("canonical bd")
        );
        assert_eq!(resolve_bd_path(None, None, None), PathBuf::from("bd"));
        assert_eq!(
            resolve_bd_path(
                None,
                Some(std::ffi::OsString::from("missing-bd")),
                Some(directory.path().as_os_str().to_os_string()),
            ),
            PathBuf::from("missing-bd")
        );
    }

    #[test]
    fn admission_defaults_are_bounded_and_legacy_omission_uses_them() {
        let policy = AdmissionPolicy::default();
        assert_eq!(policy.total_active, 8);
        assert_eq!(policy.provider_active, 4);
        assert_eq!(policy.repository_write_active, 1);
        assert_eq!(policy.epic_fanout, 4);
        assert_eq!(policy.defer_seconds, 60);
        assert!(policy.validate().is_ok());

        let parsed: ConfigFile = serde_yaml::from_str("defaultProfile: standard\n")
            .expect("legacy config without admission");
        assert!(parsed.admission.is_none());

        let legacy_with_admission: ConfigFile = serde_yaml::from_str(
            "admission:\n  totalActive: 8\n  providerActive: 4\n  repositoryWriteActive: 1\n  deferSeconds: 60\n",
        )
        .expect("legacy admission without epicFanout");
        assert_eq!(
            legacy_with_admission
                .admission
                .expect("admission")
                .epic_fanout,
            4
        );
    }

    #[test]
    fn invalid_admission_policy_fails_closed() {
        let policy = AdmissionPolicy {
            total_active: 0,
            ..AdmissionPolicy::default()
        };
        assert!(policy.validate().is_err());

        let policy = AdmissionPolicy {
            epic_fanout: 0,
            ..AdmissionPolicy::default()
        };
        assert!(policy.validate().is_err());

        let mut policy = AdmissionPolicy {
            rate_limit_ceiling_millipercent: Some(50_000),
            ..AdmissionPolicy::default()
        };
        assert!(policy.validate().is_err());

        policy.rate_limit_fresh_seconds = Some(60);
        assert!(policy.validate().is_ok());

        policy.rate_limit_ceiling_millipercent = Some(100_001);
        assert!(policy.validate().is_err());
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
    fn execution_policy_change_changes_package_digest() {
        let cfg = config();
        let first = cfg.compile_definition(None, None).expect("compile");
        let mut changed = cfg.clone();
        changed.gate_commands = vec!["just ci".to_owned()];
        changed.stage_budget_s.insert(Stage::Implement, 42);
        changed.transport_retry_budget = 7;
        changed.host_policy = HostPolicy::Off;
        changed.herdr_sock = None;
        let second = changed.compile_definition(None, None).expect("compile");
        assert_ne!(first.package_sha256, second.package_sha256);
        assert_eq!(second.package.policy.gate_commands, ["just ci"]);
        assert_eq!(second.package.policy.stage_budget_s[&Stage::Implement], 42);
        assert_eq!(second.package.policy.transport_retry_budget, 7);
        assert_eq!(second.package.policy.host_policy, HostPolicy::Off);
    }

    #[test]
    fn frozen_package_recompiles_without_authoring_config() {
        let cfg = config();
        let original = cfg.compile_definition(Some("lean"), None).expect("compile");
        let (roster, roster_sha256) = cfg
            .compile_roster_revision(&original.package, "default")
            .expect("revision");
        let mut package = original.package;
        package.roster_ref = roster.roster_ref.clone();
        package.roster_sha256 = roster_sha256;
        package.roster = roster;
        let recompiled = compile_frozen_package(package).expect("frozen compile");
        assert_eq!(recompiled.package.profile_ref.name, "lean");
        assert_eq!(recompiled.compatibility_roster.len(), 4);
    }

    #[test]
    fn frozen_packages_with_historical_efforts_stay_loadable() {
        // Pre-charset versions accepted (and the claude driver ignored) a
        // claude candidate carrying an effort. The authoring boundary now
        // refuses one, but the SAME bytes frozen into a durable package must
        // keep recompiling: recovery never applies authoring-time effort
        // rules to immutable state.
        let mut cfg = config();
        let roster = cfg.rosters.get_mut("default").expect("default roster");
        for candidates in roster.roles.values_mut() {
            for candidate in candidates.iter_mut() {
                if candidate.provider == "claude" {
                    candidate.effort = Some("high".to_owned());
                }
            }
        }
        let authoring = cfg.compile_definition(None, None);
        let errors = authoring.expect_err("authoring refuses claude effort");
        assert!(errors
            .iter()
            .any(|error| error.message.contains("claude candidates take no effort")));

        let frozen_cfg = config();
        let mut package = frozen_cfg
            .compile_definition(None, None)
            .expect("baseline compile")
            .package;
        for candidates in package.roster.roles.values_mut() {
            for candidate in candidates.iter_mut() {
                if candidate.provider == "claude" {
                    candidate.effort = Some("high".to_owned());
                }
            }
        }
        // A real historical freeze computed its digest over these exact
        // effort-carrying bytes; the fixture does the same.
        package.roster_sha256 = digest_of(&package.roster).expect("roster digest");
        compile_frozen_package(package).expect("frozen claude effort stays loadable");
    }

    #[test]
    fn definition_model_charset_accepts_brackets_and_frozen_recovery_bypasses_it() {
        let mut cfg = config();
        {
            let roster = cfg.rosters.get_mut("default").expect("default roster");
            for candidates in roster.roles.values_mut() {
                for candidate in candidates {
                    candidate.model = "claude-sonnet-4[1m]".to_owned();
                }
            }
        }
        cfg.compile_definition(None, None)
            .expect("definition accepts bracketed model");

        cfg.rosters
            .get_mut("default")
            .expect("default roster")
            .roles
            .get_mut(&role("implementation"))
            .expect("implementation role")[0]
            .model = "claude-sonnet-4{1m}".to_owned();
        let errors = cfg
            .compile_definition(None, None)
            .expect_err("definition rejects unembeddable model");
        assert!(errors.iter().any(|error| {
            error.path.ends_with(".model")
                && error.message == forged_types::MODEL_VALUE_CHARSET_ERROR
        }));

        let mut package = config()
            .compile_definition(None, None)
            .expect("baseline compile")
            .package;
        package
            .roster
            .roles
            .get_mut(&role("implementation"))
            .expect("implementation role")[0]
            .model = "claude-sonnet-4{1m}".to_owned();
        package.roster_sha256 = digest_of(&package.roster).expect("roster digest");
        compile_frozen_package(package).expect("historical model stays loadable");
    }

    #[test]
    fn epic_plan_package_is_read_only_and_nonpublishing() {
        let base = config().compile_definition(None, None).expect("compile");
        let planning = compile_epic_plan_package(&base.package).expect("planning package");
        assert_eq!(planning.package.protocol_ref.name, "epic-plan");
        assert_eq!(planning.package.profile.protocol.name, "epic-plan");
        let assessment = role("assessment");
        assert!(planning
            .package
            .profile
            .seats
            .iter()
            .any(|seat| { seat.purpose == SeatPurpose::Implement && seat.role == assessment }));
        assert!(planning
            .package
            .profile
            .seats
            .iter()
            .any(|seat| { seat.purpose == SeatPurpose::Fix && seat.role == assessment }));
        assert!(planning.package.roster.roles[&assessment]
            .iter()
            .all(|candidate| candidate.sandbox == Sandbox::ReadOnly));
        assert_eq!(
            planning.compatibility_roster[&Stage::Implement].sandbox,
            Sandbox::ReadOnly
        );
        assert_eq!(
            planning.compatibility_roster[&Stage::Fix].sandbox,
            Sandbox::ReadOnly
        );
    }

    #[test]
    fn epic_assurance_omits_only_implement_and_preserves_frozen_inputs() {
        let base = config()
            .compile_definition(Some("lean"), None)
            .expect("compile");
        let assurance = compile_epic_assurance_package(&base.package).expect("assurance package");

        assert_eq!(assurance.package.protocol_ref.name, "epic-assurance");
        assert_eq!(assurance.package.protocol_ref.version, 1);
        assert_eq!(assurance.package.policy, base.package.policy);
        assert_eq!(assurance.package.roster, base.package.roster);
        assert_eq!(
            assurance.package.profile.fix_round_budget,
            base.package.profile.fix_round_budget
        );
        assert_eq!(
            assurance.package.profile.escalate_on,
            base.package.profile.escalate_on
        );
        assert_eq!(
            assurance.package.profile.escalate_to,
            base.package.profile.escalate_to
        );
        let retained = base
            .package
            .profile
            .seats
            .iter()
            .filter(|seat| seat.purpose != SeatPurpose::Implement)
            .cloned()
            .collect::<Vec<_>>();
        assert_eq!(assurance.package.profile.seats, retained);
        assert!(assurance
            .package
            .profile_catalog
            .values()
            .all(|profile| profile.protocol.name == "epic-assurance"
                && profile
                    .seats
                    .iter()
                    .all(|seat| seat.purpose != SeatPurpose::Implement)));
        assert_eq!(
            assurance.compatibility_roster[&Stage::Implement],
            assurance.compatibility_roster[&Stage::Fix],
            "the unused implementation storage lane projects from fix without adding a seat"
        );
    }

    #[test]
    fn epic_assurance_derivation_rejects_an_internal_base_protocol() {
        let base = config().compile_definition(None, None).expect("compile");
        let planning = compile_epic_plan_package(&base.package).expect("planning package");
        let errors = compile_epic_assurance_package(&planning.package)
            .expect_err("internal protocol cannot be composed");
        assert!(errors
            .iter()
            .any(|error| { error.path == "$.protocolRef" && error.message.contains("slice/v1") }));
    }

    #[test]
    fn epic_assurance_refuses_a_writable_review_candidate() {
        let mut base = config()
            .compile_definition(Some("lean"), None)
            .expect("compile")
            .package;
        let review = role("review.primary");
        let candidate = &mut base.roster.roles.get_mut(&review).expect("review")[0];
        candidate.sandbox = Sandbox::WorkspaceWrite;
        candidate.capabilities.insert(Capability::RepositoryWrite);
        let errors =
            compile_epic_assurance_package(&base).expect_err("writable assurance review refused");
        assert!(errors.iter().any(|error| {
            error.path == "$.roster.roles.review.primary" && error.message.contains("read-only")
        }));
    }

    #[test]
    fn epic_assurance_refuses_a_writable_escalation_reviewer() {
        let mut base = config()
            .compile_definition(Some("lean"), None)
            .expect("compile")
            .package;
        let secondary = role("review.secondary");
        base.profile_catalog
            .get_mut("standard")
            .expect("reachable standard profile")
            .seats
            .iter_mut()
            .find(|seat| seat.purpose == SeatPurpose::Review)
            .expect("standard review")
            .role = secondary.clone();
        let candidate = &mut base
            .roster
            .roles
            .get_mut(&secondary)
            .expect("secondary review")[0];
        candidate.sandbox = Sandbox::WorkspaceWrite;
        candidate.capabilities.insert(Capability::RepositoryWrite);
        let errors = compile_epic_assurance_package(&base)
            .expect_err("writable escalation reviewer refused");
        assert!(errors.iter().any(|error| {
            error.path == "$.roster.roles.review.secondary" && error.message.contains("read-only")
        }));
    }

    #[test]
    fn epic_plan_package_refuses_a_writable_critique_candidate() {
        let mut base = config()
            .compile_definition(None, None)
            .expect("compile")
            .package;
        let critique = role("review.primary");
        let candidate = &mut base.roster.roles.get_mut(&critique).expect("review")[0];
        candidate.sandbox = Sandbox::WorkspaceWrite;
        candidate.capabilities.insert(Capability::RepositoryWrite);
        let errors = compile_epic_plan_package(&base).expect_err("writable critique refused");
        assert!(errors.iter().any(|error| {
            error.path == "$.roster.roles.review.primary" && error.message.contains("read-only")
        }));
    }

    #[test]
    fn epic_plan_package_requires_a_dedicated_read_only_assessment_role() {
        let mut base = config()
            .compile_definition(None, None)
            .expect("compile")
            .package;
        base.roster.roles.remove(&role("assessment"));
        let errors = compile_epic_plan_package(&base).expect_err("assessment required");
        assert!(errors.iter().any(|error| {
            error.path == "$.roster.roles.assessment"
                && error.message.contains("dedicated assessment")
        }));

        let mut base = config()
            .compile_definition(None, None)
            .expect("compile")
            .package;
        let candidate = &mut base
            .roster
            .roles
            .get_mut(&role("assessment"))
            .expect("assessment")[0];
        candidate.sandbox = Sandbox::WorkspaceWrite;
        candidate.capabilities.insert(Capability::RepositoryWrite);
        let errors = compile_epic_plan_package(&base).expect_err("writable assessment refused");
        assert!(errors.iter().any(|error| {
            error.path == "$.roster.roles.assessment" && error.message.contains("read-only")
        }));
    }

    #[test]
    fn epic_plan_package_requires_independent_critique_candidates() {
        let mut base = config()
            .compile_definition(None, None)
            .expect("compile")
            .package;
        let assessment = base.roster.roles[&role("assessment")][0].clone();
        base.roster
            .roles
            .insert(role("review.primary"), vec![assessment]);
        let errors = compile_epic_plan_package(&base).expect_err("overlap refused");
        assert!(errors
            .iter()
            .any(|error| error.message.contains("distinct from assessment")));
    }

    #[test]
    fn operator_authored_epic_plan_profile_is_rejected() {
        let mut cfg = config();
        cfg.profiles
            .get_mut("standard")
            .expect("standard profile")
            .protocol
            .name = "epic-plan".to_owned();
        let errors = cfg
            .compile_definition(Some("standard"), None)
            .expect_err("runtime-only protocol cannot be selected");
        assert!(errors.iter().any(|error| {
            error.path == "$.profile.protocol" && error.message.contains("runtime-derived")
        }));
    }

    #[test]
    fn operator_authored_epic_assurance_profile_is_rejected() {
        let mut cfg = config();
        let profile = cfg.profiles.get_mut("standard").expect("standard profile");
        profile.protocol.name = "epic-assurance".to_owned();
        profile
            .seats
            .retain(|seat| seat.purpose != SeatPurpose::Implement);
        let errors = cfg
            .compile_definition(Some("standard"), None)
            .expect_err("runtime-only protocol cannot be selected");
        assert!(errors.iter().any(|error| {
            error.path == "$.profile.protocol" && error.message.contains("runtime-derived")
        }));
    }

    #[test]
    fn epic_plan_derivation_bounds_valid_long_authoring_names() {
        let mut base = config()
            .compile_definition(None, None)
            .expect("compile")
            .package;
        base.profile.name = "p".repeat(64);
        base.profile_ref.name = base.profile.name.clone();
        base.profile.seats[0].id = SeatId::new("s".repeat(64)).expect("long valid seat");
        let planning = compile_epic_plan_package(&base).expect("bounded planning package");
        assert_eq!(planning.package.profile.name, "epic-plan");
        assert!(planning
            .package
            .profile
            .seats
            .iter()
            .all(|seat| seat.id.as_str().len() < 64));
    }

    #[test]
    fn ledger_inserts_definition_and_revision_atomically_and_checks_digest() {
        let cfg = config();
        let compiled = cfg.compile_definition(None, None).expect("compile");
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = forged_ledger::Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let new_run = |name: &str| forged_ledger::NewRun {
            run_id: forged_types::RunId::new(name).expect("run id"),
            work_id: name.to_owned(),
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
        let policy_revision = ledger
            .latest_policy_revision("definition-ok")
            .expect("read policy revision")
            .expect("policy revision");
        assert_eq!(policy_revision.revision, 1);
        assert_eq!(
            serde_json::from_str::<ExecutionPolicyV1>(&policy_revision.policy_json)
                .expect("stored policy"),
            compiled.package.policy
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
    fn policy_revision_is_append_only_digest_checked_and_leaves_package_bytes_frozen() {
        let cfg = config();
        let compiled = cfg.compile_definition(None, None).expect("compile");
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = forged_ledger::Ledger::open(&dir.path().join("state.db")).expect("ledger");
        ledger
            .create_run_with_definition(
                forged_ledger::NewRun {
                    run_id: forged_types::RunId::new("policy-run").expect("run id"),
                    work_id: "policy-run".to_owned(),
                    repo: "/tmp/repo".to_owned(),
                    base_ref: "main".to_owned(),
                    branch: "forged/policy-run".to_owned(),
                },
                forged_ledger::NewRunDefinition {
                    package: compiled.package.clone(),
                    package_sha256: compiled.package_sha256,
                    compatibility_roster: compiled.compatibility_roster,
                },
            )
            .expect("create run");
        let frozen = ledger
            .get_run_definition("policy-run")
            .expect("definition")
            .expect("stored definition")
            .package_json;

        let mut revised = compiled.package.policy;
        revised.gate_commands = vec!["just ci".to_owned()];
        revised.stage_budget_s.insert(Stage::Implement, 42);
        revised.transport_retry_budget = 7;
        let digest = digest_of(&revised).expect("policy digest");
        let row = ledger
            .append_policy_revision(
                "policy-run",
                revised.clone(),
                digest.clone(),
                "repair gate policy".to_owned(),
                "policy-operation-2".to_owned(),
            )
            .expect("append revision");
        assert_eq!(row.revision, 2);
        assert_eq!(
            ledger
                .get_run_definition("policy-run")
                .expect("definition")
                .expect("stored definition")
                .package_json,
            frozen,
            "a revision never rewrites the frozen package"
        );
        assert_eq!(
            ledger
                .append_policy_revision(
                    "policy-run",
                    revised.clone(),
                    digest.clone(),
                    "repair gate policy".to_owned(),
                    "policy-operation-2".to_owned(),
                )
                .expect("exact replay")
                .revision,
            2
        );
        assert_eq!(
            ledger
                .append_policy_revision(
                    "policy-run",
                    revised.clone(),
                    digest,
                    "repair gate policy".to_owned(),
                    "policy-operation-alias".to_owned(),
                )
                .expect("same content and reason replay")
                .revision,
            2
        );
        assert_eq!(
            ledger
                .list_policy_revisions("policy-run")
                .expect("policy revisions")
                .len(),
            2
        );
        assert_eq!(
            ledger
                .append_policy_revision(
                    "policy-run",
                    revised,
                    "0".repeat(64),
                    "corrupt digest".to_owned(),
                    "policy-operation-bad".to_owned(),
                )
                .expect_err("digest mismatch")
                .code(),
            forged_types::ErrorCode::InvalidRequest
        );

        ledger
            .create_run(forged_ledger::NewRun {
                run_id: forged_types::RunId::new("legacy-policy-run").expect("run id"),
                work_id: "legacy-policy-run".to_owned(),
                repo: "/tmp/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: "forged/legacy-policy-run".to_owned(),
            })
            .expect("create legacy run");
        let legacy_policy = cfg.execution_policy().expect("policy");
        let legacy_digest = digest_of(&legacy_policy).expect("policy digest");
        let error = ledger
            .append_policy_revision(
                "legacy-policy-run",
                legacy_policy,
                legacy_digest,
                "cannot revise legacy".to_owned(),
                "legacy-policy-operation".to_owned(),
            )
            .expect_err("legacy refusal");
        assert!(error
            .to_string()
            .contains("legacy run has no revisable policy"));
    }

    #[test]
    fn epic_roster_batch_rolls_back_every_child_and_event_on_refusal() {
        let cfg = config();
        let compiled = cfg.compile_definition(None, None).expect("compile");
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = forged_ledger::Ledger::open(&dir.path().join("state.db")).expect("ledger");
        ledger
            .create_run_with_definition(
                forged_ledger::NewRun {
                    run_id: forged_types::RunId::new("child-a").expect("run id"),
                    work_id: "child-a".to_owned(),
                    repo: "/tmp/repo".to_owned(),
                    base_ref: "main".to_owned(),
                    branch: "forged/child-a".to_owned(),
                },
                forged_ledger::NewRunDefinition {
                    package: compiled.package.clone(),
                    package_sha256: compiled.package_sha256,
                    compatibility_roster: compiled.compatibility_roster,
                },
            )
            .expect("create child");
        let error = ledger
            .append_roster_revisions_with_event(forged_ledger::RosterRevisionBatch {
                epic_id: "epic-a".to_owned(),
                event_kind: "forged.epic.roster.revised".to_owned(),
                event_payload: serde_json::json!({"revision": 2}),
                run_ids: vec!["child-a".to_owned(), "missing-child".to_owned()],
                roster: compiled.package.roster.clone(),
                roster_sha256: compiled.package.roster_sha256,
                reason: "provider outage".to_owned(),
                operation_prefix: "epic-roster:epic-a:2".to_owned(),
            })
            .expect_err("missing child refuses the transaction");
        assert_eq!(error.code(), forged_types::ErrorCode::RunNotFound);
        assert_eq!(
            ledger
                .latest_roster_revision("child-a")
                .expect("revision")
                .expect("initial revision")
                .revision,
            1,
            "the earlier child insert rolled back"
        );
        assert!(
            ledger
                .list_events(Some("epic-a"), 0, 100)
                .expect("events")
                .is_empty(),
            "the governing event rolled back with its child rows"
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
    fn standard_is_one_reviewer_and_high_assurance_is_explicit() {
        let cfg = config();
        let standard = cfg.profiles.get("standard").expect("standard");
        assert_eq!(
            standard
                .seats
                .iter()
                .filter(|seat| seat.purpose == SeatPurpose::Review)
                .count(),
            1
        );
        assert!(standard.escalate_on.is_empty());
        assert!(standard.escalate_to.is_none());

        let high = cfg.profiles.get("high").expect("high");
        assert_eq!(
            high.seats
                .iter()
                .filter(|seat| seat.purpose == SeatPurpose::Review)
                .count(),
            3
        );
        assert!(high
            .seats
            .iter()
            .any(|seat| seat.purpose == SeatPurpose::Synthesis));
    }

    #[test]
    fn reachable_profile_names_must_match_their_map_keys() {
        let mut cfg = config();
        cfg.profiles
            .get_mut("standard")
            .expect("standard profile")
            .name = "misnamed".to_owned();
        let errors = cfg
            .compile_definition(Some("lean"), None)
            .expect_err("reachable mismatched profile must fail");
        assert!(errors.iter().any(|error| {
            error.path == "$.profiles.standard.name"
                && error.message.contains("referenced key \"standard\"")
        }));
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

    #[test]
    fn partial_stage_budgets_overlay_the_legacy_defaults() {
        let budgets = resolve_stage_budget_s(Some(HashMap::from([(Stage::Implement, 42)])));
        assert_eq!(budgets[&Stage::Implement], 42);
        for stage in [Stage::ReviewClaude, Stage::ReviewCodex, Stage::Fix] {
            assert_eq!(budgets[&stage], 1800, "missing {stage:?} keeps its default");
        }
    }

    // Every refresh test below binds the snapshot's ANVIL_HOME to its own
    // tempdir and passes no FORGED_CONFIG override. This per-test discipline
    // makes path selection independent of a populated operator environment.

    #[test]
    fn refreshed_reloads_only_when_the_file_content_changes() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let path = dir.path().join("config.yaml");
        std::fs::write(&path, "default_profile: standard\n").expect("write config");
        let snapshot =
            ForgedConfig::load_at(dir.path().to_path_buf(), path.clone(), None).expect("load");
        assert!(snapshot.config_sha256.is_some());
        assert!(snapshot.refreshed().expect("unchanged gate").is_none());
        std::fs::write(&path, "default_profile: high\n").expect("rewrite config");
        let fresh = snapshot.refreshed().expect("changed gate").expect("reload");
        assert_eq!(fresh.default_profile, "high");
        // Identity anchors survive the reload.
        assert_eq!(fresh.db_path, snapshot.db_path);
        assert_eq!(fresh.runs_root, snapshot.runs_root);
        assert_eq!(fresh.beads_dir, snapshot.beads_dir);
        // A deleted file is a change too: every key back at its default.
        std::fs::remove_file(&path).expect("remove config");
        let defaulted = snapshot.refreshed().expect("removal gate").expect("reload");
        assert!(!defaulted.config_file_read);
        assert!(defaulted.config_sha256.is_none());
    }

    #[test]
    fn a_hand_built_config_with_no_backing_file_never_reloads_over_itself() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let snapshot = scratch_config(dir.path());
        assert!(snapshot.refreshed().expect("absent gate").is_none());
        // The file appearing IS a change, even for a hand-built snapshot.
        std::fs::write(&snapshot.config_path, "default_profile: high\n").expect("write config");
        let fresh = snapshot
            .refreshed()
            .expect("appearance gate")
            .expect("reload");
        assert_eq!(fresh.default_profile, "high");
        assert_eq!(fresh.db_path, snapshot.db_path);
    }

    #[test]
    fn refreshed_honors_a_selection_change_between_yaml_and_json() {
        let dir = tempfile::tempdir().expect("scratch scope");
        std::fs::write(
            dir.path().join("config.json"),
            "{\"default_profile\": \"jsonprofile\"}",
        )
        .expect("write json config");
        let selected = config_path(dir.path(), None);
        let snapshot =
            ForgedConfig::load_at(dir.path().to_path_buf(), selected, None).expect("load");
        assert_eq!(snapshot.default_profile, "jsonprofile");
        assert!(snapshot.refreshed().expect("unchanged gate").is_none());
        // A yaml appearing outranks the pinned json, exactly as a fresh
        // process would select it.
        let yaml = dir.path().join("config.yaml");
        std::fs::write(&yaml, "default_profile: yamlprofile\n").expect("write yaml config");
        let fresh = snapshot
            .refreshed()
            .expect("selection gate")
            .expect("reload");
        assert_eq!(fresh.default_profile, "yamlprofile");
        assert!(fresh.config_path.ends_with("config.yaml"));
        assert_eq!(fresh.db_path, snapshot.db_path);
        // Removing the yaml falls back to the surviving json, not defaults.
        std::fs::remove_file(&yaml).expect("remove yaml config");
        let fallback = fresh.refreshed().expect("fallback gate").expect("reload");
        assert_eq!(fallback.default_profile, "jsonprofile");
        assert!(fallback.config_path.ends_with("config.json"));
    }

    #[test]
    fn a_malformed_rewrite_is_a_reload_error() {
        let dir = tempfile::tempdir().expect("scratch scope");
        let path = dir.path().join("config.yaml");
        std::fs::write(&path, "default_profile: standard\n").expect("write config");
        let snapshot =
            ForgedConfig::load_at(dir.path().to_path_buf(), path.clone(), None).expect("load");
        std::fs::write(&path, "default_profile: [broken").expect("break config");
        let error = snapshot.refreshed().expect_err("malformed gate");
        assert!(error.contains("does not parse"), "{error}");
    }
}
