//! Config resolution: one global `<anvil_home>/config.json`, read once at
//! startup, plus the two sanctioned env reads (`FORGED_CONFIG`, `BEADS_DIR`)
//! — env reads live here and nowhere else in this crate.
//!
//! This module is also the one place wall-clock reads are allowed:
//! [`now_iso`] reimplements the ledger's fixed-width 30-byte RFC-3339 form
//! (the ledger's own `now_iso` is `pub(crate)`).

use std::collections::HashMap;
use std::path::PathBuf;

use forged_types::{ProviderHints, Sandbox, Stage};
use serde::Deserialize;
use serde_json::{json, Value};

/// Every tunable forged reads, resolved once at process start.
#[derive(Debug, Clone)]
pub struct ForgedConfig {
    /// `~/.anvil` (or `$ANVIL_HOME`, mirroring the ledger's resolution).
    pub anvil_home: PathBuf,
    /// `<anvil_home>/runs` — derived, never configured.
    pub runs_root: PathBuf,
    /// `forged_ledger::default_db_path()` — derived, never configured.
    pub db_path: PathBuf,
    /// The config file that was read, when one existed.
    pub config_path: PathBuf,
    /// Whether `config_path` existed and was read.
    pub config_file_read: bool,
    /// Per-stage provider hints.
    pub roster: HashMap<Stage, ProviderHints>,
    /// Gate commands, in order.
    pub gate_commands: Vec<String>,
    /// Per-stage wall-clock budget, seconds — feeds `reclaim_older_than`,
    /// the epic's frozen timing equation; identical in every process.
    pub stage_budget_s: HashMap<Stage, u64>,
    /// Transport-retry budget per packet.
    pub transport_retry_budget: u32,
    /// Absolute path to the bd binary (never a PATH lookup).
    pub bd_path: PathBuf,
    /// The operator's `BEADS_DIR` (env override or `<anvil_home>/beads`).
    pub beads_dir: PathBuf,
    /// The codex home for rollout recovery.
    pub codex_home: PathBuf,
    /// The herdr socket, when one is configured.
    pub herdr_sock: Option<PathBuf>,
}

/// The on-disk shape. Keys beginning `_` are comments and ignored on read
/// (serde skips unknown keys); every field falls back to its documented
/// default, which keeps the identical-resolution guarantee intact when the
/// file is missing entirely.
#[derive(Debug, Default, Deserialize)]
struct ConfigFile {
    #[serde(default)]
    roster: Option<HashMap<Stage, ProviderHints>>,
    #[serde(default)]
    gate_commands: Option<Vec<String>>,
    #[serde(default)]
    stage_budget_s: Option<HashMap<Stage, u64>>,
    #[serde(default)]
    transport_retry_budget: Option<u32>,
    #[serde(default)]
    bd_path: Option<String>,
    #[serde(default)]
    codex_home: Option<String>,
    #[serde(default)]
    herdr_sock: Option<String>,
}

/// The default roster: claude implements, both families review, claude
/// fixes.
fn default_roster() -> HashMap<Stage, ProviderHints> {
    let hint =
        |provider: &str, model: &str, effort: Option<&str>, sandbox: Sandbox| ProviderHints {
            provider: provider.to_owned(),
            model: model.to_owned(),
            effort: effort.map(str::to_owned),
            sandbox,
        };
    HashMap::from([
        (
            Stage::Implement,
            hint("claude", "opus", None, Sandbox::WorkspaceWrite),
        ),
        (
            Stage::ReviewClaude,
            hint("claude", "opus", None, Sandbox::ReadOnly),
        ),
        (
            Stage::ReviewCodex,
            hint("codex", "gpt-5.6-sol", Some("xhigh"), Sandbox::ReadOnly),
        ),
        (
            Stage::Fix,
            hint("claude", "opus", None, Sandbox::WorkspaceWrite),
        ),
    ])
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

/// Resolve the anvil home the way the ledger does: `$ANVIL_HOME`, else
/// `$HOME/.anvil`, else the relative `.anvil`. Empty values count as unset.
fn anvil_home() -> PathBuf {
    if let Some(a) = std::env::var_os("ANVIL_HOME").filter(|v| !v.is_empty()) {
        return PathBuf::from(a);
    }
    if let Some(h) = std::env::var_os("HOME").filter(|v| !v.is_empty()) {
        return PathBuf::from(h).join(".anvil");
    }
    PathBuf::from(".anvil")
}

impl ForgedConfig {
    /// Load the config: `$FORGED_CONFIG` names an alternate file; a missing
    /// file is not an error — every key falls back to the same documented
    /// default. Read once; callers never re-read.
    pub fn load() -> Result<ForgedConfig, String> {
        let anvil_home = anvil_home();
        let config_path = match std::env::var_os("FORGED_CONFIG").filter(|v| !v.is_empty()) {
            Some(p) => PathBuf::from(p),
            None => anvil_home.join("config.json"),
        };
        let (file, config_file_read) = match std::fs::read_to_string(&config_path) {
            Ok(text) => {
                let parsed: ConfigFile = serde_json::from_str(&text)
                    .map_err(|e| format!("config {} does not parse: {e}", config_path.display()))?;
                (parsed, true)
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => (ConfigFile::default(), false),
            Err(e) => return Err(format!("config {}: {e}", config_path.display())),
        };
        let beads_dir = match std::env::var_os("BEADS_DIR").filter(|v| !v.is_empty()) {
            Some(d) => PathBuf::from(d),
            None => anvil_home.join("beads"),
        };
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
            roster: file.roster.unwrap_or_else(default_roster),
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

    /// The default config document `init` writes when no file exists: every
    /// key at its default, each documented by a sibling `_comment_<key>`
    /// string (JSON carries no comment syntax; keys beginning `_` are
    /// ignored on read).
    pub fn default_document(&self) -> Value {
        let roster: serde_json::Map<String, Value> = default_roster()
            .into_iter()
            .map(|(stage, hints)| {
                (
                    stage_str(stage).to_owned(),
                    serde_json::to_value(hints).unwrap_or(Value::Null),
                )
            })
            .collect();
        let budgets: serde_json::Map<String, Value> = default_stage_budget_s()
            .into_iter()
            .map(|(stage, s)| (stage_str(stage).to_owned(), json!(s)))
            .collect();
        json!({
            "_comment_roster": "per-stage provider hints: which provider/model runs each stage",
            "roster": Value::Object(roster),
            "_comment_gate_commands": "quality-gate shell lines, run in order in the run's worktree",
            "gate_commands": default_gate_commands(),
            "_comment_stage_budget_s": "per-stage wall-clock budget in seconds; feeds the frozen reclaim timing equation, so every process must resolve the same values",
            "stage_budget_s": Value::Object(budgets),
            "_comment_transport_retry_budget": "free transport retries per packet before the run stops ProviderUnavailable",
            "transport_retry_budget": DEFAULT_TRANSPORT_RETRY_BUDGET,
            "_comment_bd_path": "absolute path to the bd binary; never resolved from PATH",
            "bd_path": self.anvil_home.join("tools/bd-1.2.1/bin/bd").to_string_lossy(),
            "_comment_codex_home": "codex home for rollout usage recovery",
            "codex_home": std::env::var_os("HOME")
                .map(PathBuf::from)
                .unwrap_or_default()
                .join(".codex")
                .to_string_lossy(),
            "_comment_herdr_sock": "herdr unix-socket path; null selects the plain process host",
            "herdr_sock": Value::Null,
        })
    }

    /// The bd wrapper config for this process.
    pub fn bd_config(&self) -> forged_beads::BdConfig {
        forged_beads::BdConfig::new(self.bd_path.clone(), self.beads_dir.clone())
    }

    /// `<runs_root>/<run_id>` — the run's scratch directory.
    pub fn run_dir(&self, run_id: &str) -> PathBuf {
        self.runs_root.join(run_id)
    }

    /// `<run_dir>/worktree`.
    pub fn worktree(&self, run_id: &str) -> PathBuf {
        self.run_dir(run_id).join("worktree")
    }

    /// `<run_dir>/packets/<stage>/<seq>` — the packet directory; kept inside
    /// `[A-Za-z0-9/._-]` so the provider crate's shell-safety validators
    /// accept every embedded path.
    pub fn packet_dir(&self, run_id: &str, stage: Stage, seq: i64) -> PathBuf {
        self.run_dir(run_id)
            .join("packets")
            .join(stage_str(stage))
            .join(seq.to_string())
    }
}

/// The lowercase stage string (forged-types' serde form).
pub fn stage_str(stage: Stage) -> &'static str {
    match stage {
        Stage::Implement => "implement",
        Stage::ReviewClaude => "reviewclaude",
        Stage::ReviewCodex => "reviewcodex",
        Stage::Fix => "fix",
    }
}

/// Parse a lowercase stage string back.
pub fn stage_from_str(s: &str) -> Option<Stage> {
    match s {
        "implement" => Some(Stage::Implement),
        "reviewclaude" => Some(Stage::ReviewClaude),
        "reviewcodex" => Some(Stage::ReviewCodex),
        "fix" => Some(Stage::Fix),
        _ => None,
    }
}

/// The current instant in the ledger's fixed-width UTC RFC-3339 form:
/// exactly nine fractional digits and a trailing `Z` — 30 bytes. The
/// driver/config layer is the one place wall-clock reads are allowed; time
/// is an input everywhere else.
pub fn now_iso() -> String {
    forged_proto::widen_rfc3339(&jiff::Timestamp::now().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn now_iso_is_thirty_bytes_utc() {
        let stamp = now_iso();
        assert_eq!(stamp.len(), 30, "{stamp}");
        assert!(stamp.ends_with('Z'));
        assert_eq!(stamp.as_bytes()[19], b'.');
    }

    #[test]
    fn default_document_ignores_comment_keys_on_read() {
        let cfg = ForgedConfig {
            anvil_home: PathBuf::from("/tmp/anvil"),
            runs_root: PathBuf::from("/tmp/anvil/runs"),
            db_path: PathBuf::from("/tmp/anvil/state.db"),
            config_path: PathBuf::from("/tmp/anvil/config.json"),
            config_file_read: false,
            roster: default_roster(),
            gate_commands: default_gate_commands(),
            stage_budget_s: default_stage_budget_s(),
            transport_retry_budget: DEFAULT_TRANSPORT_RETRY_BUDGET,
            bd_path: PathBuf::from("/tmp/anvil/tools/bd-1.2.1/bin/bd"),
            beads_dir: PathBuf::from("/tmp/anvil/beads"),
            codex_home: PathBuf::from("/tmp/home/.codex"),
            herdr_sock: None,
        };
        let doc = cfg.default_document();
        let text = serde_json::to_string(&doc).expect("serializes");
        let parsed: ConfigFile = serde_json::from_str(&text).expect("parses despite _comment keys");
        assert_eq!(
            parsed.transport_retry_budget,
            Some(DEFAULT_TRANSPORT_RETRY_BUDGET)
        );
        let roster = parsed.roster.expect("roster present");
        assert_eq!(roster.len(), 4);
        assert_eq!(
            parsed.stage_budget_s.expect("budgets")[&Stage::Fix],
            1800u64
        );
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
}
