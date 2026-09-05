//! Generated operation-surface artifacts and their source-of-truth drift gate.

use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};

use clap::CommandFactory;
use serde::Serialize;

const JSON_PATH: &str = "docs/reference/operation-surface.json";
const MARKDOWN_PATH: &str = "docs/reference/operation-surface.md";
const REGENERATE_COMMAND: &str = "forged generate-surface-manifest";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
enum OperationClass {
    Fenced,
    #[serde(rename = "machine-fenced")]
    MachineFenced,
    ReadOnly,
    UnfencedWrite,
}

impl OperationClass {
    fn as_str(self) -> &'static str {
        match self {
            Self::Fenced => "fenced",
            Self::MachineFenced => "machine-fenced",
            Self::ReadOnly => "read_only",
            Self::UnfencedWrite => "unfenced_write",
        }
    }
}

/// The human or automation role an MCP operation is intended for. This is a
/// discovery concern only: every registered tool remains callable regardless
/// of the audience selected for `tools/list`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum McpAudience {
    Lead,
    Machine,
    Operator,
}

impl McpAudience {
    fn as_str(self) -> &'static str {
        match self {
            Self::Lead => "lead",
            Self::Machine => "machine",
            Self::Operator => "operator",
        }
    }
}

/// The audience census is deliberately explicit. New MCP verbs must join one
/// and only one set before the generated manifest can pass its drift gate.
const LEAD_MCP_OPERATIONS: &[&str] = &[
    "doctor",
    "definition_validate",
    "explain",
    "next",
    "run_dispatch",
    "run_retry",
    "run_status",
    "run_stop",
    "run_accept_risk",
    "run_adjudicate_settlement",
    "run_revise_roster",
    "run_revise_policy",
    "epic_preflight",
    "epic_start",
    "epic_submit",
    "epic_status",
    "epic_pause",
    "epic_resume",
    "epic_resolve",
    "epic_abandon",
    "epic_revise_roster",
    "epic_revise_policy",
    "session_list",
    "session_read",
    "session_message",
    "usage_report",
    "wait",
    "work_create",
    "work_update",
    "work_promote",
    "work_adjudicate",
    "work_park",
    "work_link",
    "work_close",
    "work_reopen",
    "work_release",
    "work_supersede",
    "work_revert",
    "work_show",
    "work_ready",
    "work_list",
    "work_note_add",
    "work_note_list",
    "attention_list",
    "attention_acknowledge",
    "attention_resolve",
    "attention_reopen",
];

const OPERATOR_MCP_OPERATIONS: &[&str] = &[
    "operations_overview",
    "overview",
    "work_detail",
    "work_map",
    "work_history",
    "session_inventory",
    "events_tail",
    "usage_ingest",
    "review_publish",
    "worktree_retire",
];

const MACHINE_MCP_OPERATIONS: &[&str] = &[
    "run_start",
    "run_submit",
    "run_advance",
    "packet_show",
    "packet_claim",
    "packet_complete",
    "packet_fail",
    "claim_next",
    "gate_run",
    "reconcile",
    "artifact_verify",
    "artifact_compact",
    "session_stop",
];

pub(crate) fn mcp_audience(name: &str) -> Option<McpAudience> {
    if LEAD_MCP_OPERATIONS.contains(&name) {
        Some(McpAudience::Lead)
    } else if OPERATOR_MCP_OPERATIONS.contains(&name) {
        Some(McpAudience::Operator)
    } else if MACHINE_MCP_OPERATIONS.contains(&name) {
        Some(McpAudience::Machine)
    } else {
        None
    }
}

fn validate_mcp_audiences(mcp: &BTreeSet<String>) -> Result<(), String> {
    for name in mcp {
        if mcp_audience(name).is_none() {
            return Err(format!("MCP operation {name} has no audience assignment"));
        }
    }
    for name in LEAD_MCP_OPERATIONS
        .iter()
        .chain(OPERATOR_MCP_OPERATIONS)
        .chain(MACHINE_MCP_OPERATIONS)
    {
        if !mcp.contains(*name) {
            return Err(format!(
                "non-MCP operation {name} has an audience assignment"
            ));
        }
    }
    Ok(())
}

/// The classification decision is intentionally explicit. Source scans prove
/// literal call sites agree, while shared variable-name helpers remain decided
/// here because their call sites cannot identify the operation mechanically.
const OPERATION_CLASSES: &[(&str, OperationClass)] = &[
    ("artifact_compact", OperationClass::Fenced),
    ("artifact_verify", OperationClass::ReadOnly),
    ("attention_acknowledge", OperationClass::Fenced),
    ("attention_list", OperationClass::ReadOnly),
    ("attention_reopen", OperationClass::Fenced),
    ("attention_resolve", OperationClass::Fenced),
    ("claim_next", OperationClass::Fenced),
    ("definition_validate", OperationClass::ReadOnly),
    ("doctor", OperationClass::ReadOnly),
    ("epic_abandon", OperationClass::Fenced),
    ("epic_pause", OperationClass::Fenced),
    ("epic_preflight", OperationClass::ReadOnly),
    ("epic_resolve", OperationClass::Fenced),
    ("epic_resume", OperationClass::Fenced),
    ("epic_revise_roster", OperationClass::Fenced),
    ("epic_revise_policy", OperationClass::Fenced),
    ("epic_start", OperationClass::Fenced),
    ("epic_status", OperationClass::ReadOnly),
    ("epic_submit", OperationClass::Fenced),
    ("events_tail", OperationClass::ReadOnly),
    ("explain", OperationClass::ReadOnly),
    ("gate_run", OperationClass::Fenced),
    ("init", OperationClass::Fenced),
    ("next", OperationClass::ReadOnly),
    ("operations_overview", OperationClass::ReadOnly),
    ("overview", OperationClass::ReadOnly),
    ("packet_claim", OperationClass::Fenced),
    ("packet_complete", OperationClass::Fenced),
    ("packet_fail", OperationClass::Fenced),
    ("packet_heartbeat", OperationClass::UnfencedWrite),
    ("packet_show", OperationClass::ReadOnly),
    ("reconcile", OperationClass::Fenced),
    ("review_publish", OperationClass::Fenced),
    ("run_accept_risk", OperationClass::Fenced),
    ("run_adjudicate_settlement", OperationClass::Fenced),
    ("run_advance", OperationClass::MachineFenced),
    ("run_drive", OperationClass::MachineFenced),
    ("run_dispatch", OperationClass::Fenced),
    ("run_retry", OperationClass::Fenced),
    ("run_revise_roster", OperationClass::Fenced),
    ("run_revise_policy", OperationClass::Fenced),
    ("run_start", OperationClass::Fenced),
    ("run_status", OperationClass::ReadOnly),
    ("run_stop", OperationClass::Fenced),
    ("run_submit", OperationClass::Fenced),
    ("session_inventory", OperationClass::ReadOnly),
    ("session_list", OperationClass::ReadOnly),
    ("session_message", OperationClass::Fenced),
    ("session_read", OperationClass::ReadOnly),
    ("session_stop", OperationClass::Fenced),
    ("supervise", OperationClass::MachineFenced),
    ("usage_ingest", OperationClass::UnfencedWrite),
    ("usage_report", OperationClass::ReadOnly),
    ("wait", OperationClass::ReadOnly),
    ("work_adjudicate", OperationClass::Fenced),
    ("work_close", OperationClass::Fenced),
    ("work_create", OperationClass::Fenced),
    ("work_detail", OperationClass::ReadOnly),
    ("work_history", OperationClass::ReadOnly),
    ("work_import_beads", OperationClass::UnfencedWrite),
    ("work_link", OperationClass::Fenced),
    ("work_list", OperationClass::ReadOnly),
    ("work_map", OperationClass::ReadOnly),
    ("work_note_add", OperationClass::Fenced),
    ("work_note_list", OperationClass::ReadOnly),
    ("work_park", OperationClass::Fenced),
    ("work_promote", OperationClass::Fenced),
    ("work_ready", OperationClass::ReadOnly),
    ("work_release", OperationClass::Fenced),
    ("work_reopen", OperationClass::Fenced),
    ("work_revert", OperationClass::Fenced),
    ("work_show", OperationClass::ReadOnly),
    ("work_supersede", OperationClass::Fenced),
    ("work_update", OperationClass::Fenced),
    ("worktree_retire", OperationClass::Fenced),
];

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct SurfaceRow {
    #[serde(skip_serializing_if = "Option::is_none")]
    audience: Option<McpAudience>,
    class: Option<OperationClass>,
    cli: bool,
    cli_verb: String,
    dispatch: bool,
    explicit_key: bool,
    mcp: bool,
    name: String,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
struct DeprecatedKey {
    schema: &'static str,
    key: &'static str,
    twin: &'static str,
    remove_at: &'static str,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
struct DeprecatedInput {
    operation: &'static str,
    parameter: &'static str,
    value: &'static str,
    replacement: &'static str,
    remove_at: &'static str,
}

const DEPRECATED_INPUTS: &[DeprecatedInput] = &[DeprecatedInput {
    operation: "work_note_add",
    parameter: "kind",
    value: "approval",
    replacement: "run_dispatch",
    remove_at: "ore-080.11",
}];

const DEPRECATED_KEYS: &[DeprecatedKey] = &[
    DeprecatedKey {
        schema: "forged.work-identity/1",
        key: "bead",
        twin: "work",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.packet/1",
        key: "beadId",
        twin: "workId",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.admission-inputs/1",
        key: "beadId",
        twin: "workId",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.admission-inputs/1",
        key: "beadRevision",
        twin: "workRevision",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.admission-inputs/1",
        key: "beadStatus",
        twin: "workStatus",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.admission-inputs/1",
        key: "beadRepository",
        twin: "workRepository",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "bead",
        twin: "work",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "bead_id",
        twin: "work_id",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "beadId",
        twin: "workId",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "beadTitle",
        twin: "workTitle",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "beadRevision",
        twin: "workRevision",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "beadSettlement",
        twin: "workSettlement",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "beads",
        twin: "work",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "beadsStatus",
        twin: "workStatus",
        remove_at: "1.0",
    },
    DeprecatedKey {
        schema: "forged.projection/*",
        key: "beadsInventory",
        twin: "workInventory",
        remove_at: "1.0",
    },
];

#[derive(Debug, Serialize)]
struct SurfaceManifest {
    #[serde(rename = "deprecatedKeys")]
    deprecated_keys: Vec<DeprecatedKey>,
    #[serde(rename = "deprecatedInputs")]
    deprecated_inputs: Vec<DeprecatedInput>,
    operations: Vec<SurfaceRow>,
    schema: &'static str,
}

struct GeneratedArtifacts {
    json: String,
    markdown: String,
}

fn repository_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../..")
}

fn source(path: &Path) -> Result<String, String> {
    std::fs::read_to_string(path)
        .map_err(|error| format!("reading source {}: {error}", path.display()))
}

fn function_body<'a>(source: &'a str, signature: &str) -> Result<&'a str, String> {
    let signature_start = source
        .find(signature)
        .ok_or_else(|| format!("source signature {signature:?} is missing"))?;
    let body_start = source[signature_start..]
        .find('{')
        .map(|offset| signature_start + offset)
        .ok_or_else(|| format!("source signature {signature:?} has no body"))?;
    let mut depth = 0_u32;
    for (offset, byte) in source[body_start..].bytes().enumerate() {
        match byte {
            b'{' => depth += 1,
            b'}' => {
                depth = depth
                    .checked_sub(1)
                    .ok_or_else(|| format!("source signature {signature:?} has invalid braces"))?;
                if depth == 0 {
                    return Ok(&source[body_start + 1..body_start + offset]);
                }
            }
            _ => {}
        }
    }
    Err(format!("source signature {signature:?} has an open body"))
}

fn arrow_string_values(body: &str) -> BTreeSet<String> {
    body.lines()
        .filter_map(|line| line.split_once("=>").map(|(_, value)| value.trim_start()))
        .filter_map(|value| value.strip_prefix('"'))
        .filter_map(|value| value.split_once('"').map(|(name, _)| name))
        .filter(|name| is_operation_name(name))
        .map(str::to_owned)
        .collect()
}

fn arrow_lhs_string_values(body: &str) -> BTreeSet<String> {
    body.lines()
        .filter_map(|line| {
            line.split_once("=>")
                .map(|(pattern, _)| pattern.trim_start())
        })
        .filter_map(|pattern| pattern.strip_prefix('"'))
        .filter_map(|pattern| pattern.split_once('"').map(|(name, _)| name))
        .filter(|name| is_operation_name(name))
        .map(str::to_owned)
        .collect()
}

fn is_operation_name(name: &str) -> bool {
    !name.is_empty()
        && name
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'_')
}

fn quoted_operation_names(source: &str) -> BTreeSet<String> {
    let mut names = BTreeSet::new();
    let mut rest = source;
    while let Some(start) = rest.find('"') {
        rest = &rest[start + 1..];
        let Some(end) = rest.find('"') else {
            break;
        };
        let candidate = &rest[..end];
        if is_operation_name(candidate) {
            names.insert(candidate.to_owned());
        }
        rest = &rest[end + 1..];
    }
    names
}

fn first_quoted_operation_name(source: &str) -> Option<String> {
    let mut rest = source;
    while let Some(start) = rest.find('"') {
        rest = &rest[start + 1..];
        let end = rest.find('"')?;
        let candidate = &rest[..end];
        if is_operation_name(candidate) {
            return Some(candidate.to_owned());
        }
        rest = &rest[end + 1..];
    }
    None
}

fn dispatch_and_explicit_keys(
    core_source: &str,
) -> Result<(BTreeSet<String>, BTreeSet<String>), String> {
    let body = function_body(core_source, "pub async fn dispatch(")?;
    let dispatch = arrow_lhs_string_values(body);
    let guard_end = body
        .find("if key_absent(&req)")
        .ok_or_else(|| "dispatch explicit-key guard is missing".to_owned())?;
    let guard_start = body[..guard_end]
        .rfind("match name")
        .ok_or_else(|| "dispatch explicit-key match is missing".to_owned())?;
    let explicit_keys = quoted_operation_names(&body[guard_start..guard_end]);
    Ok((dispatch, explicit_keys))
}

fn command_names(cli_source: &str) -> Result<BTreeSet<String>, String> {
    let mut names = arrow_string_values(function_body(cli_source, "pub fn command_name(")?);
    names.extend(arrow_string_values(function_body(
        cli_source,
        "pub(crate) fn operation_name(",
    )?));
    Ok(names)
}

fn collect_cli_paths(command: &clap::Command, prefix: &[String], paths: &mut Vec<Vec<String>>) {
    for child in command.get_subcommands() {
        let mut path = prefix.to_vec();
        path.push(child.get_name().to_owned());
        paths.push(path.clone());
        collect_cli_paths(child, &path, paths);
    }
}

fn normalized_verb(path: &[String]) -> String {
    path.join(" ").replace(['-', ' '], "_")
}

fn cli_verbs(names: &BTreeSet<String>) -> Result<BTreeMap<String, String>, String> {
    let mut paths = Vec::new();
    collect_cli_paths(&crate::cli::Cli::command(), &[], &mut paths);
    let mut verbs = BTreeMap::new();

    for path in &paths {
        let normalized = normalized_verb(path);
        if names.contains(&normalized) && verbs.insert(normalized.clone(), path.join(" ")).is_some()
        {
            return Err(format!(
                "CLI operation {normalized} has more than one verb path"
            ));
        }
    }

    let unresolved = names
        .iter()
        .filter(|name| !verbs.contains_key(*name))
        .cloned()
        .collect::<Vec<_>>();
    for name in unresolved {
        let candidates = paths
            .iter()
            .filter(|path| {
                let prefix = normalized_verb(path);
                name.strip_prefix(&prefix)
                    .is_some_and(|suffix| suffix.starts_with('_'))
            })
            .collect::<Vec<_>>();
        if candidates.len() != 1 {
            return Err(format!(
                "command_name operation {name} maps to {} clap verb paths",
                candidates.len()
            ));
        }
        verbs.insert(name, candidates[0].join(" "));
    }

    Ok(verbs)
}

fn classification_map() -> Result<BTreeMap<String, OperationClass>, String> {
    let mut classes = BTreeMap::new();
    for (name, class) in OPERATION_CLASSES {
        if classes.insert((*name).to_owned(), *class).is_some() {
            return Err(format!(
                "operation {name} appears twice in the classification map"
            ));
        }
    }
    Ok(classes)
}

fn rust_files(root: &Path, paths: &mut Vec<PathBuf>) -> Result<(), String> {
    for entry in std::fs::read_dir(root)
        .map_err(|error| format!("reading source directory {}: {error}", root.display()))?
    {
        let path = entry
            .map_err(|error| format!("reading source entry under {}: {error}", root.display()))?
            .path();
        if path.is_dir() {
            rust_files(&path, paths)?;
        } else if path.extension().and_then(|value| value.to_str()) == Some("rs") {
            paths.push(path);
        }
    }
    Ok(())
}

fn call_literal_names(source: &str, callee: &str, stop: Option<&str>) -> BTreeSet<String> {
    let mut names = BTreeSet::new();
    for (start, _) in source.match_indices(callee) {
        if start > 0 {
            let previous = source.as_bytes()[start - 1];
            if previous.is_ascii_alphanumeric() || previous == b'_' {
                continue;
            }
        }
        let tail = &source[start + callee.len()..];
        let limit = stop
            .and_then(|needle| tail.find(needle))
            .unwrap_or(tail.len().min(512))
            .min(512);
        if let Some(name) = first_quoted_operation_name(&tail[..limit]) {
            names.insert(name);
        }
    }
    names
}

fn scanned_classes(core_root: &Path) -> Result<BTreeMap<String, OperationClass>, String> {
    let mut paths = Vec::new();
    rust_files(core_root, &mut paths)?;
    paths.sort();
    let mut scans = BTreeMap::new();
    for path in paths {
        let source = source(&path)?;
        for (callee, stop, class) in [
            ("read_only(", None, OperationClass::ReadOnly),
            ("unfenced_write(", None, OperationClass::UnfencedWrite),
            ("fenced(", Some("EffectClass"), OperationClass::Fenced),
        ] {
            for name in call_literal_names(&source, callee, stop) {
                if let Some(previous) = scans.insert(name.clone(), class) {
                    if previous != class {
                        return Err(format!(
                            "source scan classifies {name} as both {} and {}",
                            previous.as_str(),
                            class.as_str()
                        ));
                    }
                }
            }
        }
    }
    Ok(scans)
}

fn validate_classes(
    dispatch: &BTreeSet<String>,
    classes: &BTreeMap<String, OperationClass>,
    scanned: &BTreeMap<String, OperationClass>,
) -> Result<(), String> {
    let declared = classes.keys().cloned().collect::<BTreeSet<_>>();
    if &declared != dispatch {
        let missing = dispatch.difference(&declared).cloned().collect::<Vec<_>>();
        let extra = declared.difference(dispatch).cloned().collect::<Vec<_>>();
        return Err(format!(
            "classification map differs from dispatch; missing={missing:?}, extra={extra:?}"
        ));
    }
    for (name, scanned_class) in scanned {
        let declared_class = classes
            .get(name)
            .ok_or_else(|| format!("source scan found non-dispatch operation {name}"))?;
        if declared_class != scanned_class {
            return Err(format!(
                "classification contradiction for {name}: map={}, source-scan={}",
                declared_class.as_str(),
                scanned_class.as_str()
            ));
        }
    }
    for (name, class) in classes {
        if matches!(
            class,
            OperationClass::ReadOnly | OperationClass::UnfencedWrite
        ) && scanned.get(name) != Some(class)
        {
            return Err(format!(
                "{} operation {name} has no matching literal source-scan site",
                class.as_str()
            ));
        }
    }
    Ok(())
}

fn manifest_rows() -> Result<Vec<SurfaceRow>, String> {
    let root = repository_root();
    let cli_source = source(&root.join("crates/forged/src/cli.rs"))?;
    let core_source = source(&root.join("crates/forged/src/core/mod.rs"))?;
    let (dispatch, explicit_keys) = dispatch_and_explicit_keys(&core_source)?;
    let command_names = command_names(&cli_source)?;
    let cli_verbs = cli_verbs(&command_names)?;
    let classes = classification_map()?;
    let scanned = scanned_classes(&root.join("crates/forged/src/core"))?;
    validate_classes(&dispatch, &classes, &scanned)?;

    if !explicit_keys.is_subset(&dispatch) {
        return Err("dispatch explicit-key guard names a non-dispatch operation".to_owned());
    }
    let mcp = crate::mcp::tool_names();
    if !mcp.is_subset(&dispatch) {
        let extra = mcp.difference(&dispatch).cloned().collect::<Vec<_>>();
        return Err(format!(
            "MCP router names non-dispatch operations: {extra:?}"
        ));
    }
    validate_mcp_audiences(&mcp)?;

    let hidden = "generate_surface_manifest";
    let public_commands = command_names
        .iter()
        .filter(|name| name.as_str() != hidden)
        .cloned()
        .collect::<BTreeSet<_>>();
    if !dispatch.is_subset(&public_commands) {
        let missing = dispatch
            .difference(&public_commands)
            .cloned()
            .collect::<Vec<_>>();
        return Err(format!(
            "dispatch operations missing CLI paths: {missing:?}"
        ));
    }

    let mut rows = Vec::new();
    for name in public_commands {
        let is_dispatch = dispatch.contains(&name);
        let is_mcp = mcp.contains(&name);
        let audience = mcp_audience(&name);
        rows.push(SurfaceRow {
            audience,
            class: is_dispatch.then(|| classes[&name]),
            cli: true,
            cli_verb: cli_verbs
                .get(&name)
                .ok_or_else(|| format!("operation {name} has no CLI verb"))?
                .clone(),
            dispatch: is_dispatch,
            explicit_key: explicit_keys.contains(&name),
            mcp: is_mcp,
            name,
        });
    }
    rows.sort_by(|left, right| left.name.cmp(&right.name));
    Ok(rows)
}

fn render_json(rows: &[SurfaceRow]) -> Result<String, String> {
    let manifest = SurfaceManifest {
        deprecated_keys: DEPRECATED_KEYS.to_vec(),
        deprecated_inputs: DEPRECATED_INPUTS.to_vec(),
        operations: rows.to_vec(),
        schema: "forged.operation-surface/1",
    };
    serde_json::to_string_pretty(&manifest)
        .map(|text| format!("{text}\n"))
        .map_err(|error| format!("serializing operation surface: {error}"))
}

fn yes_no(value: bool) -> &'static str {
    if value {
        "yes"
    } else {
        "no"
    }
}

fn render_markdown(rows: &[SurfaceRow]) -> String {
    let mut output = format!(
        "# Operation surface\n\n\
         Generated from the dispatch table, clap tree, MCP router, and fenced-call audit. \
         Regenerate with `{REGENERATE_COMMAND}`; do not edit this table directly.\n\n\
         `class` applies only to dispatch operations. `audience` filters MCP discovery only. \
         `explicit key` means dispatch refuses a \
         keyless request before any defaulting.\n\n\
         | Operation | CLI verb | CLI | MCP | Audience | Class | Explicit key | Dispatch |\n\
         | --- | --- | --- | --- | --- | --- | --- | --- |\n",
    );
    for row in rows {
        output.push_str(&format!(
            "| `{}` | `forged {}` | {} | {} | {} | {} | {} | {} |\n",
            row.name,
            row.cli_verb,
            yes_no(row.cli),
            yes_no(row.mcp),
            row.audience.map_or("—", McpAudience::as_str),
            row.class.map_or("—", OperationClass::as_str),
            yes_no(row.explicit_key),
            yes_no(row.dispatch),
        ));
    }
    output.push_str("\n## Deprecated projection keys\n\n");
    output.push_str(
        "Legacy keys remain present with same-value provider-neutral twins until 1.0.\n\n",
    );
    output.push_str("| Schema | Legacy key | Twin | Remove at |\n");
    output.push_str("| --- | --- | --- | --- |\n");
    for key in DEPRECATED_KEYS {
        output.push_str(&format!(
            "| `{}` | `{}` | `{}` | `{}` |\n",
            key.schema, key.key, key.twin, key.remove_at,
        ));
    }
    output.push_str("\n## Deprecated inputs\n\n");
    output.push_str(
        "Legacy inputs remain accepted by the CLI until their named replacement lands.\n\n",
    );
    output.push_str("| Operation | Parameter | Value | Replacement | Remove at |\n");
    output.push_str("| --- | --- | --- | --- | --- |\n");
    for input in DEPRECATED_INPUTS {
        output.push_str(&format!(
            "| `{}` | `{}` | `{}` | `{}` | `{}` |\n",
            input.operation, input.parameter, input.value, input.replacement, input.remove_at,
        ));
    }
    output
}

fn generate_artifacts() -> Result<GeneratedArtifacts, String> {
    let rows = manifest_rows()?;
    Ok(GeneratedArtifacts {
        json: render_json(&rows)?,
        markdown: render_markdown(&rows),
    })
}

/// Regenerate both committed reference artifacts after the complete source
/// surface has passed the same consistency checks used by the drift test.
pub(crate) fn regenerate() -> Result<(), String> {
    let generated = generate_artifacts()?;
    let root = repository_root();
    std::fs::write(root.join(JSON_PATH), generated.json)
        .map_err(|error| format!("writing {JSON_PATH}: {error}"))?;
    std::fs::write(root.join(MARKDOWN_PATH), generated.markdown)
        .map_err(|error| format!("writing {MARKDOWN_PATH}: {error}"))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn assert_matches(label: &str, committed: &str, generated: &str) -> Result<(), String> {
        if committed == generated {
            Ok(())
        } else {
            Err(format!(
                "{label} has drifted; run `{REGENERATE_COMMAND}` and commit both surface artifacts"
            ))
        }
    }

    #[test]
    fn committed_surface_artifacts_match_generation_in_memory() {
        let generated = generate_artifacts().expect("generate operation surface in memory");
        assert_matches(
            JSON_PATH,
            include_str!("../../../docs/reference/operation-surface.json"),
            &generated.json,
        )
        .unwrap_or_else(|message| panic!("{message}"));
        assert_matches(
            MARKDOWN_PATH,
            include_str!("../../../docs/reference/operation-surface.md"),
            &generated.markdown,
        )
        .unwrap_or_else(|message| panic!("{message}"));
    }

    #[test]
    fn added_tool_requires_regeneration_without_writing() {
        let mut rows = manifest_rows().expect("generate operation surface rows in memory");
        rows.push(SurfaceRow {
            audience: Some(McpAudience::Lead),
            class: Some(OperationClass::ReadOnly),
            cli: true,
            cli_verb: "simulated new-tool".to_owned(),
            dispatch: true,
            explicit_key: false,
            mcp: true,
            name: "simulated_new_tool".to_owned(),
        });
        rows.sort_by(|left, right| left.name.cmp(&right.name));
        let mutated = render_json(&rows).expect("render in-memory added tool");
        let error = assert_matches(
            JSON_PATH,
            include_str!("../../../docs/reference/operation-surface.json"),
            &mutated,
        )
        .expect_err("an added tool must fail the drift comparison");
        assert!(error.contains(REGENERATE_COMMAND), "{error}");
    }

    #[test]
    fn every_mcp_tool_has_exactly_one_audience() {
        let rows = manifest_rows().expect("generate operation surface rows in memory");
        for row in rows {
            assert_eq!(
                row.mcp,
                row.audience.is_some(),
                "{} audience assignment must match MCP registration",
                row.name
            );
        }

        let mut assigned = LEAD_MCP_OPERATIONS
            .iter()
            .chain(OPERATOR_MCP_OPERATIONS)
            .chain(MACHINE_MCP_OPERATIONS)
            .copied()
            .collect::<Vec<_>>();
        let assigned_len = assigned.len();
        assigned.sort_unstable();
        assigned.dedup();
        assert_eq!(
            assigned.len(),
            assigned_len,
            "an MCP operation must not appear in multiple audience lists"
        );

        let mut registered = crate::mcp::tool_names();
        registered.insert("simulated_unassigned_tool".to_owned());
        let error = validate_mcp_audiences(&registered)
            .expect_err("an unassigned MCP tool must fail audience validation");
        assert!(error.contains("simulated_unassigned_tool"), "{error}");
    }

    #[test]
    fn source_scan_rejects_a_contradictory_class_map() {
        let root = repository_root();
        let core_source = source(&root.join("crates/forged/src/core/mod.rs")).expect("core source");
        let (dispatch, _) = dispatch_and_explicit_keys(&core_source).expect("dispatch scan");
        let scanned = scanned_classes(&root.join("crates/forged/src/core")).expect("class scan");
        let mut classes = classification_map().expect("classification map");
        classes.insert("artifact_compact".to_owned(), OperationClass::ReadOnly);
        let error = validate_classes(&dispatch, &classes, &scanned)
            .expect_err("contradicting a source scan must fail");
        assert!(error.contains("artifact_compact"), "{error}");
        assert!(error.contains("source-scan"), "{error}");
    }

    #[test]
    fn source_and_test_text_has_no_pinned_surface_count() {
        let root = repository_root().join("crates/forged");
        let patterns = [
            ["sixty", "-four"].concat(),
            ["sixty", "_four"].concat(),
            ["64", " tools"].concat(),
            ["64", " public core functions"].concat(),
            ["five", " dispatcher operations"].concat(),
            ["exactly three", " operations require"].concat(),
        ];
        let mut paths = Vec::new();
        rust_files(&root.join("src"), &mut paths).expect("source files");
        rust_files(&root.join("tests"), &mut paths).expect("test files");
        for path in paths {
            let contents = source(&path)
                .expect("surface-count source")
                .to_ascii_lowercase();
            for pattern in &patterns {
                assert!(
                    !contents.contains(pattern),
                    "{} contains pinned surface count pattern {pattern:?}",
                    path.display()
                );
            }
        }
    }
}
