//! Typed reads and narrow writes for epic dependency graphs.

use std::collections::{BTreeMap, BTreeSet};

use serde_json::Value;

use crate::classify::BdError;
use crate::config::BdConfig;
use crate::{envelope, invoke};

/// The Beads fields forged consumes — the epic scheduler's inventory plus
/// the spec body a run is built from.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IssueSummary {
    /// Stable Beads id.
    pub id: String,
    /// Human-readable title.
    pub title: String,
    /// Markdown-ish issue description: the spec's Context and What We're
    /// Building sections, and on older beads the `spec:` and `repo:`
    /// pointers.
    pub description: String,
    /// Current Beads status.
    pub status: String,
    /// Native numeric scheduling priority. Missing or non-integral values
    /// remain `None` so admission can defer fail-closed.
    pub priority: Option<i64>,
    /// Current Beads assignee/lease holder, when any.
    pub assignee: Option<String>,
    /// Beads issue type (`task`, `epic`, ...).
    pub issue_type: String,
    /// `acceptance_criteria` — the spec's Acceptance Criteria section.
    pub acceptance_criteria: String,
    /// `design` — the spec's Implementation Notes section.
    pub design: String,
    /// `notes` — the spec's Agent Instructions section.
    pub notes: String,
    /// `spec_id` — the bead's link to an external specification document.
    pub spec_id: Option<String>,
    /// `metadata` — the JSON extension point carrying the spec's Quality
    /// Gates. Non-string values are kept as their compact JSON text: this
    /// map is transported, never interpreted. Gate commands a run actually
    /// executes stay frozen in its execution package.
    pub metadata: BTreeMap<String, String>,
    /// `revision` — bd's guarded-write optimistic-concurrency token, absent
    /// from responses that do not carry one (`create`, `update`, `ready`).
    ///
    /// OPAQUE, and kept as the response's own digits rather than an integer:
    /// it is compared for equality and nothing else — never ordered, parsed,
    /// incremented, or assumed positive (bd 1.2.1 emits negative values).
    pub revision: Option<String>,
    /// Authoritative Beads update time when the read shape carries it. Live
    /// plan identity uses this stable source timestamp instead of making an
    /// otherwise read-only projection vary with the wall clock.
    pub updated_at: Option<String>,
}

/// One native Beads dependency coordinate carried by a hydrated plan row.
///
/// This is deliberately only identity and current status. Forged does not
/// reinterpret Beads' graph or manufacture readiness from display text.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanDependency {
    /// Canonical dependency Bead id.
    pub id: String,
    /// Native dependency edge type from the pinned bd contract.
    pub dependency_type: PlanDependencyType,
    /// Current dependency status when the hydrated response carries it.
    pub status: Option<PlanDependencyStatus>,
}

/// Closed subset of pinned bd dependency kinds supported by plan inventory.
///
/// Only `blocks` affects scheduling readiness. The other three coordinates
/// remain visible to consumers as hierarchy, context, or provenance without
/// being promoted into blockers.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum PlanDependencyType {
    /// A hard scheduling prerequisite.
    Blocks,
    /// A structural child-to-parent edge.
    ParentChild,
    /// A non-scheduling contextual link.
    Related,
    /// A non-scheduling provenance link.
    DiscoveredFrom,
}

impl PlanDependencyType {
    /// The native bd spelling retained on the wire.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Blocks => "blocks",
            Self::ParentChild => "parent-child",
            Self::Related => "related",
            Self::DiscoveredFrom => "discovered-from",
        }
    }

    /// Whether this edge can prevent the issue from being ready.
    pub const fn blocks_readiness(self) -> bool {
        matches!(self, Self::Blocks)
    }
}

impl TryFrom<&str> for PlanDependencyType {
    type Error = String;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "blocks" => Ok(Self::Blocks),
            "parent-child" => Ok(Self::ParentChild),
            "related" => Ok(Self::Related),
            "discovered-from" => Ok(Self::DiscoveredFrom),
            other => Err(format!("unknown dependency type {other:?}")),
        }
    }
}

/// Closed issue statuses carried by dependency summaries from pinned bd.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum PlanDependencyStatus {
    /// The prerequisite has not started.
    Open,
    /// The prerequisite is currently claimed.
    InProgress,
    /// The prerequisite is explicitly blocked.
    Blocked,
    /// The prerequisite is deferred.
    Deferred,
    /// The prerequisite is complete.
    Closed,
    /// The prerequisite is intentionally persistent.
    Pinned,
    /// The prerequisite is actively hooked by a worker.
    Hooked,
}

impl PlanDependencyStatus {
    /// The native bd spelling retained on the wire.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Open => "open",
            Self::InProgress => "in_progress",
            Self::Blocked => "blocked",
            Self::Deferred => "deferred",
            Self::Closed => "closed",
            Self::Pinned => "pinned",
            Self::Hooked => "hooked",
        }
    }

    /// Whether this dependency is complete.
    pub const fn is_closed(self) -> bool {
        matches!(self, Self::Closed)
    }
}

impl std::ops::Deref for PlanDependencyStatus {
    type Target = str;

    fn deref(&self) -> &Self::Target {
        self.as_str()
    }
}

impl TryFrom<&str> for PlanDependencyStatus {
    type Error = String;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "open" => Ok(Self::Open),
            "in_progress" => Ok(Self::InProgress),
            "blocked" => Ok(Self::Blocked),
            "deferred" => Ok(Self::Deferred),
            "closed" => Ok(Self::Closed),
            "pinned" => Ok(Self::Pinned),
            "hooked" => Ok(Self::Hooked),
            other => Err(format!("unknown dependency status {other:?}")),
        }
    }
}

/// Readiness supported by one hydrated plan row's current facts.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum PlanReadiness {
    /// Every hard prerequisite is known closed.
    Ready,
    /// The issue or a hard prerequisite is known blocked.
    Blocked,
    /// The issue is already claimed and all hard prerequisites are closed.
    Claimed,
    /// The issue is explicitly deferred and all hard prerequisites are closed.
    Deferred,
    /// A hard prerequisite omitted the status needed to decide readiness.
    Unknown,
}

/// One current, nonterminal Beads plan row.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanIssue {
    /// The same issue fields every Forged Beads consumer uses.
    #[serde(flatten)]
    pub issue: IssueSummary,
    /// Native parent id, when present.
    pub parent: Option<String>,
    /// Bounded dependency summaries from the single hydrate call.
    pub dependencies: Vec<PlanDependency>,
}

impl PlanIssue {
    /// Derive only readiness established by the hydrated dependency facts.
    ///
    /// A known non-closed `blocks` edge is conclusive even if another blocker
    /// omitted its status. If no known blocker proves the issue blocked, any
    /// missing hard-blocker status keeps the result unknown. Structural and
    /// informational edges never affect readiness.
    pub fn readiness(&self) -> PlanReadiness {
        if self.issue.status == "blocked" {
            return PlanReadiness::Blocked;
        }

        let blockers = self
            .dependencies
            .iter()
            .filter(|dependency| dependency.dependency_type.blocks_readiness());
        let mut missing_status = false;
        for blocker in blockers {
            match blocker.status {
                Some(status) if !status.is_closed() => return PlanReadiness::Blocked,
                Some(_) => {}
                None => missing_status = true,
            }
        }
        if missing_status {
            return PlanReadiness::Unknown;
        }

        match self.issue.status.as_str() {
            "open" => PlanReadiness::Ready,
            "in_progress" => PlanReadiness::Claimed,
            "deferred" => PlanReadiness::Deferred,
            _ => PlanReadiness::Unknown,
        }
    }
}

/// The bounded live-plan inventory and its coverage truth.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanInventory {
    /// Hydrated rows in discovery order.
    pub issues: Vec<PlanIssue>,
    /// More rows matched than the caller's display bound.
    pub truncated: bool,
    /// Number of rows observed by the bounded N+1 discovery call.
    pub discovered: usize,
}

/// A `revision` exactly as bd wrote it. A JSON number is rendered back to its
/// own digits — never through an integer type, which would invite arithmetic
/// on a value that has none.
fn revision(value: &Value) -> Option<String> {
    match value.get("revision")? {
        Value::Number(number) => Some(number.to_string()),
        Value::String(text) if !text.is_empty() => Some(text.clone()),
        _ => None,
    }
}

fn metadata(value: &Value) -> BTreeMap<String, String> {
    value
        .get("metadata")
        .and_then(Value::as_object)
        .map(|map| {
            map.iter()
                .map(|(key, item)| {
                    let text = match item {
                        Value::String(text) => text.clone(),
                        other => other.to_string(),
                    };
                    (key.clone(), text)
                })
                .collect()
        })
        .unwrap_or_default()
}

fn text(value: &Value, field: &str) -> String {
    value
        .get(field)
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_owned()
}

fn issue(value: &Value) -> Option<IssueSummary> {
    Some(IssueSummary {
        id: value.get("id")?.as_str()?.to_owned(),
        title: text(value, "title"),
        description: text(value, "description"),
        status: value
            .get("status")
            .and_then(Value::as_str)
            .unwrap_or("open")
            .to_owned(),
        priority: value.get("priority").and_then(Value::as_i64),
        assignee: value
            .get("assignee")
            .and_then(Value::as_str)
            .filter(|value| !value.is_empty())
            .map(str::to_owned),
        issue_type: value
            .get("issue_type")
            .and_then(Value::as_str)
            .unwrap_or("task")
            .to_owned(),
        acceptance_criteria: text(value, "acceptance_criteria"),
        design: text(value, "design"),
        notes: text(value, "notes"),
        spec_id: value
            .get("spec_id")
            .and_then(Value::as_str)
            .filter(|value| !value.is_empty())
            .map(str::to_owned),
        metadata: metadata(value),
        revision: revision(value),
        updated_at: value
            .get("updated_at")
            .or_else(|| value.get("updatedAt"))
            .and_then(Value::as_str)
            .filter(|value| !value.trim().is_empty())
            .map(str::to_owned),
    })
}

fn plan_issue(value: &Value) -> Result<PlanIssue, String> {
    let object = value
        .as_object()
        .ok_or_else(|| "hydrated issue is not an object".to_owned())?;
    let status = object
        .get("status")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| "hydrated issue has no non-empty string status".to_owned())?;
    if !matches!(status, "open" | "in_progress" | "blocked" | "deferred") {
        return Err(format!(
            "hydrated issue has unexpected nonterminal status {status:?}"
        ));
    }
    object
        .get("issue_type")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| "hydrated issue has no non-empty string issue_type".to_owned())?;
    if object.get("revision").is_some_and(|value| {
        !matches!(value, Value::Null | Value::Number(_))
            && !matches!(value, Value::String(text) if !text.trim().is_empty())
    }) {
        return Err("hydrated issue has a malformed revision".to_owned());
    }
    let issue = issue(value).ok_or_else(|| "hydrated issue has no string id".to_owned())?;
    if issue.id.trim().is_empty() {
        return Err("hydrated issue has an empty id".to_owned());
    }
    if !object.get("title").is_some_and(Value::is_string) {
        return Err(format!("hydrated issue {:?} has no string title", issue.id));
    }
    if object.get("priority").is_some_and(|value| !value.is_i64()) {
        return Err(format!(
            "hydrated issue {:?} has a non-integer priority",
            issue.id
        ));
    }
    if let Some(metadata) = object.get("metadata") {
        let metadata = metadata
            .as_object()
            .ok_or_else(|| format!("hydrated issue {:?} metadata is not an object", issue.id))?;
        if metadata
            .get("repository")
            .is_some_and(|value| !value.is_string())
        {
            return Err(format!(
                "hydrated issue {:?} repository metadata is not a string",
                issue.id
            ));
        }
    }
    let parent = match object.get("parent") {
        None | Some(Value::Null) => None,
        Some(Value::String(value)) if !value.trim().is_empty() => Some(value.clone()),
        Some(_) => {
            return Err(format!(
                "hydrated issue {:?} has a malformed parent",
                issue.id
            ))
        }
    };
    let mut dependency_ids = BTreeSet::new();
    let dependencies = match object.get("dependencies") {
        None | Some(Value::Null) => Vec::new(),
        Some(Value::Array(items)) => items
            .iter()
            .map(|dependency| {
                let object = dependency.as_object().ok_or_else(|| {
                    format!("hydrated issue {:?} has a non-object dependency", issue.id)
                })?;
                let id = object
                    .get("id")
                    .or_else(|| object.get("depends_on_id"))
                    .and_then(Value::as_str)
                    .filter(|value| !value.trim().is_empty())
                    .ok_or_else(|| {
                        format!(
                            "hydrated issue {:?} has a dependency without an id",
                            issue.id
                        )
                    })?
                    .to_owned();
                if !dependency_ids.insert(id.clone()) {
                    return Err(format!(
                        "hydrated issue {:?} repeats dependency {:?}",
                        issue.id, id
                    ));
                }
                let dependency_type = object
                    .get("dependency_type")
                    .or_else(|| object.get("type"))
                    .and_then(Value::as_str)
                    .filter(|value| !value.trim().is_empty())
                    .ok_or_else(|| {
                        format!(
                            "hydrated issue {:?} dependency {:?} has no type",
                            issue.id, id
                        )
                    })?;
                let dependency_type =
                    PlanDependencyType::try_from(dependency_type).map_err(|detail| {
                        format!(
                            "hydrated issue {:?} dependency {:?} has {detail}",
                            issue.id, id
                        )
                    })?;
                let status = match object.get("status") {
                    None | Some(Value::Null) => None,
                    Some(Value::String(value)) if !value.trim().is_empty() => Some(
                        PlanDependencyStatus::try_from(value.as_str()).map_err(|detail| {
                            format!(
                                "hydrated issue {:?} dependency {:?} has {detail}",
                                issue.id, id
                            )
                        })?,
                    ),
                    Some(_) => {
                        return Err(format!(
                            "hydrated issue {:?} dependency {:?} has malformed status",
                            issue.id, id
                        ))
                    }
                };
                Ok(PlanDependency {
                    id,
                    dependency_type,
                    status,
                })
            })
            .collect::<Result<Vec<_>, String>>()?,
        Some(_) => {
            return Err(format!(
                "hydrated issue {:?} dependencies is not an array",
                issue.id
            ))
        }
    };
    Ok(PlanIssue {
        issue,
        parent,
        dependencies,
    })
}

fn selected_discovery_ids(rows: &[Value], limit: usize) -> Result<Vec<String>, String> {
    let maximum = limit.saturating_add(1);
    if rows.len() > maximum {
        return Err(format!(
            "discovery returned {} rows beyond the N+1 bound {maximum}",
            rows.len()
        ));
    }

    let mut seen = BTreeSet::new();
    let mut discovered = Vec::with_capacity(rows.len());
    for row in rows {
        let id = row
            .get("id")
            .and_then(Value::as_str)
            .filter(|value| !value.trim().is_empty())
            .ok_or_else(|| "discovery row has no non-empty string id".to_owned())?;
        if !seen.insert(id.to_owned()) {
            return Err(format!("discovery returned duplicate issue id {id:?}"));
        }
        discovered.push(id.to_owned());
    }
    discovered.truncate(limit);
    Ok(discovered)
}

fn hydrated_plan_rows(
    rows: &[Value],
    requested_ids: &[String],
    repository: Option<&str>,
) -> Result<Vec<PlanIssue>, String> {
    let requested: BTreeSet<&str> = requested_ids.iter().map(String::as_str).collect();
    if requested.len() != requested_ids.len() {
        return Err("selected discovery ids are not unique".to_owned());
    }

    let mut by_id = BTreeMap::new();
    for row in rows {
        let item = plan_issue(row)?;
        let id = item.issue.id.clone();
        if !requested.contains(id.as_str()) {
            return Err(format!("hydrate returned unrequested issue id {id:?}"));
        }
        if by_id.insert(id.clone(), item).is_some() {
            return Err(format!("hydrate returned duplicate issue id {id:?}"));
        }
    }

    requested_ids
        .iter()
        .map(|id| {
            let item = by_id
                .remove(id)
                .ok_or_else(|| format!("hydrate omitted selected issue {id:?}"))?;
            if let Some(expected) = repository {
                let actual = item.issue.metadata.get("repository").map(String::as_str);
                if actual != Some(expected) {
                    return Err(format!(
                        "selected issue {id:?} repository changed during hydration"
                    ));
                }
            }
            Ok(item)
        })
        .collect()
}

fn list(value: &Value) -> Vec<IssueSummary> {
    envelope::as_list(value)
        .unwrap_or_else(|| vec![value.clone()])
        .iter()
        .filter_map(issue)
        .collect()
}

/// Read one issue through `bd show`.
pub async fn show_issue(cfg: &BdConfig, id: &str) -> Result<IssueSummary, BdError> {
    let data = invoke::read(cfg, &["show", id, "--json"]).await?;
    list(&data)
        .into_iter()
        .next()
        .ok_or_else(|| BdError::Envelope {
            context: format!("bd show {id}"),
            detail: "response contained no issue".to_owned(),
        })
}

/// Read an exact, bounded set of issues in one `bd list` invocation.
///
/// Missing or deleted ids are absent from the result. Supplying exact ids
/// avoids both an operator-wide scan and one `bd show` process per row.
pub async fn list_issues(cfg: &BdConfig, ids: &[String]) -> Result<Vec<IssueSummary>, BdError> {
    list_issues_matching_repository(cfg, ids, None).await
}

/// Read an exact, bounded set of issues whose `metadata.repository` equals
/// `repository`, in one native `bd list` invocation.
///
/// The caller supplies the candidate ids, keeping this a bounded join against
/// Forged's ledger rather than an operator-wide Beads scan. Matching remains
/// Beads-owned: Forged passes the exact `repository=<value>` predicate through
/// `--metadata-field` and never reimplements metadata filtering in memory.
pub async fn list_issues_for_repository(
    cfg: &BdConfig,
    ids: &[String],
    repository: &str,
) -> Result<Vec<IssueSummary>, BdError> {
    list_issues_matching_repository(cfg, ids, Some(repository)).await
}

async fn list_issues_matching_repository(
    cfg: &BdConfig,
    ids: &[String],
    repository: Option<&str>,
) -> Result<Vec<IssueSummary>, BdError> {
    if ids.is_empty() {
        return Ok(Vec::new());
    }
    let joined = ids.join(",");
    let metadata_field = repository.map(|value| format!("repository={value}"));
    let mut args = vec!["list", "--id", &joined];
    if let Some(field) = metadata_field.as_deref() {
        args.extend(["--metadata-field", field]);
    }
    args.extend(["--limit", "0", "--brief", "--flat", "--json"]);
    let data = invoke::read(cfg, &args).await?;
    Ok(list(&data))
}

/// Read a bounded nonterminal plan inventory with exactly two native JSON
/// calls: one N+1 discovery and one exact-id hydrate.
///
/// The discovery result is coverage, not a graph. The hydrate call carries
/// current dependency coordinates for the selected ids. Missing rows between
/// the two calls are omitted rather than reconstructed from stale discovery
/// bytes. No `bd ready`, graph renderer, per-node read, claim, or write is
/// involved.
pub async fn plan_inventory(
    cfg: &BdConfig,
    repository: Option<&str>,
    limit: usize,
) -> Result<PlanInventory, BdError> {
    if limit == 0 {
        return Err(BdError::Envelope {
            context: "bd list live plan".to_owned(),
            detail: "plan inventory limit must be positive".to_owned(),
        });
    }
    let discovery_limit = limit.saturating_add(1);
    let limit_text = discovery_limit.to_string();
    let metadata_field = repository.map(|value| format!("repository={value}"));
    let mut args = vec![
        "list",
        "--status",
        "open,in_progress,blocked,deferred",
        "--limit",
        &limit_text,
        "--max-rows",
        &limit_text,
        "--sort",
        "priority",
        "--brief",
        "--flat",
    ];
    if let Some(field) = metadata_field.as_deref() {
        args.extend(["--metadata-field", field]);
    }
    args.extend(["--no-pager", "--json"]);
    let discovered_json = invoke::read(cfg, &args).await?;
    let discovered_rows =
        envelope::as_list(&discovered_json).unwrap_or_else(|| vec![discovered_json.clone()]);
    let discovered = discovered_rows.len();
    let truncated = discovered > limit;
    let ids =
        selected_discovery_ids(&discovered_rows, limit).map_err(|detail| BdError::Envelope {
            context: "bd list live plan".to_owned(),
            detail,
        })?;
    if ids.is_empty() {
        return Ok(PlanInventory {
            issues: Vec::new(),
            truncated,
            discovered,
        });
    }

    let mut show_args = Vec::with_capacity(ids.len() + 3);
    show_args.push("show");
    show_args.extend(ids.iter().map(String::as_str));
    show_args.push("--brief-deps");
    show_args.push("--json");
    let hydrated_json = invoke::read(cfg, &show_args).await?;
    let hydrated_rows =
        envelope::as_list(&hydrated_json).unwrap_or_else(|| vec![hydrated_json.clone()]);
    let issues = hydrated_plan_rows(&hydrated_rows, &ids, repository).map_err(|detail| {
        BdError::Envelope {
            context: "bd show live plan".to_owned(),
            detail,
        }
    })?;
    Ok(PlanInventory {
        issues,
        truncated,
        discovered,
    })
}

/// Read an epic's inventory. Native parent/child links are preferred, with
/// the Anvil-compatible epic-depends-on-children encoding unioned in.
pub async fn epic_children(cfg: &BdConfig, epic: &str) -> Result<Vec<IssueSummary>, BdError> {
    let native = invoke::read(cfg, &["children", epic, "--json"]).await?;
    let shown = invoke::read(cfg, &["show", epic, "--json"]).await?;
    let mut children: BTreeMap<String, IssueSummary> = list(&native)
        .into_iter()
        .map(|item| (item.id.clone(), item))
        .collect();
    if let Some(root) = envelope::first_obj(&shown) {
        if let Some(dependencies) = root.get("dependencies").and_then(Value::as_array) {
            for dependency in dependencies {
                if let Some(item) = issue(dependency) {
                    if item.id != epic {
                        children.entry(item.id.clone()).or_insert(item);
                    }
                }
            }
        }
    }
    Ok(children.into_values().collect())
}

/// Read the current global ready frontier without claiming anything.
pub async fn ready_issues(cfg: &BdConfig) -> Result<Vec<IssueSummary>, BdError> {
    let data = invoke::read(cfg, &["ready", "--json"]).await?;
    Ok(list(&data))
}

/// Idempotently close one merged child.
pub async fn close_issue(
    cfg: &BdConfig,
    id: &str,
    actor: &str,
    reason: &str,
) -> Result<IssueSummary, BdError> {
    let current = show_issue(cfg, id).await?;
    if current.status == "closed" {
        return Ok(current);
    }
    let args = ["close", id, "--actor", actor, "--reason", reason, "--json"];
    invoke::write(
        cfg,
        invoke::WriteOp::Other {
            bead: Some(id.to_owned()),
            actor: Some(actor.to_owned()),
        },
        &args,
    )
    .await?;
    show_issue(cfg, id).await
}

/// Atomically close a run-owned issue and clear that exact run holder.
///
/// The initial read gives foreign or absent ownership a mutation-free refusal.
/// The write repeats the ownership check inside bd with `--if-assignee`, so a
/// successor claim that lands after the read still wins without being closed.
/// Status and assignee change in the same guarded `bd update`: there is no
/// closed-but-still-held interval for a late predecessor to race through.
/// A closed, unassigned result is the sole idempotent replay shape.
pub async fn close_held_issue(
    cfg: &BdConfig,
    id: &str,
    actor: &str,
) -> Result<IssueSummary, BdError> {
    let current = show_issue(cfg, id).await?;
    if current.status == "closed" && current.assignee.is_none() {
        return Ok(current);
    }
    match current.assignee.as_deref() {
        Some(holder) if holder == actor => {}
        holder => {
            return Err(BdError::LeaseHeld {
                bead: id.to_owned(),
                holder: holder.map(str::to_owned),
            });
        }
    }
    let args = [
        "update",
        id,
        "--status",
        "closed",
        "--assignee",
        "",
        "--if-assignee",
        actor,
        "--actor",
        actor,
        "--json",
    ];
    invoke::write(
        cfg,
        invoke::WriteOp::Other {
            bead: Some(id.to_owned()),
            actor: Some(actor.to_owned()),
        },
        &args,
    )
    .await?;
    let settled = show_issue(cfg, id).await?;
    if settled.status == "closed" && settled.assignee.is_none() {
        Ok(settled)
    } else {
        Err(BdError::Beads {
            context: format!("bd update {id} (guarded close)"),
            exit: None,
            stdout: serde_json::to_string(&settled).unwrap_or_default(),
            stderr: "guarded close did not produce a closed, unassigned Bead".to_owned(),
        })
    }
}

/// Append one marker-addressed lifecycle comment, idempotently.
///
/// Comments preserve terminal reasons beside the Bead without rewriting the
/// canonical spec fields. Replay scans the comment JSON for the caller's
/// deterministic marker before writing.
pub async fn comment_once(
    cfg: &BdConfig,
    id: &str,
    actor: &str,
    marker: &str,
    body: &str,
) -> Result<bool, BdError> {
    let current = invoke::read(cfg, &["comments", id, "--json"]).await?;
    if current.to_string().contains(marker) {
        return Ok(false);
    }
    let text = format!("{marker} {body}");
    let args = ["comment", id, &text, "--actor", actor, "--json"];
    invoke::write(
        cfg,
        invoke::WriteOp::Other {
            bead: Some(id.to_owned()),
            actor: Some(actor.to_owned()),
        },
        &args,
    )
    .await?;
    Ok(true)
}

/// Idempotently clear the run holder after terminal settlement.
///
/// The guarded write never overwrites a different actor. A close in bd keeps
/// historical assignment by default. New delivery settlement uses
/// [`close_held_issue`] to close and clear ownership atomically; this remains
/// available for recovery of older already-closed state.
pub async fn release_issue(cfg: &BdConfig, id: &str, actor: &str) -> Result<IssueSummary, BdError> {
    let current = show_issue(cfg, id).await?;
    match current.assignee.as_deref() {
        None => return Ok(current),
        Some(holder) if holder != actor => {
            return Err(BdError::LeaseHeld {
                bead: id.to_owned(),
                holder: Some(holder.to_owned()),
            });
        }
        Some(_) => {}
    }
    let args = [
        "update",
        id,
        "--assignee",
        "",
        "--if-assignee",
        actor,
        "--actor",
        actor,
        "--json",
    ];
    invoke::write(
        cfg,
        invoke::WriteOp::Other {
            bead: Some(id.to_owned()),
            actor: Some(actor.to_owned()),
        },
        &args,
    )
    .await?;
    show_issue(cfg, id).await
}

/// Return unresolved work to an actionable Beads state and clear ownership.
///
/// Only `open` and `blocked` are constructible. The assignee guard makes a
/// late terminalizer unable to release a successor's newer claim.
pub async fn release_unresolved_issue(
    cfg: &BdConfig,
    id: &str,
    actor: &str,
    blocked: bool,
) -> Result<IssueSummary, BdError> {
    let current = show_issue(cfg, id).await?;
    if current.status == "closed" {
        return Err(BdError::Beads {
            context: format!("bd update {id} (release unresolved)"),
            exit: None,
            stdout: String::new(),
            stderr: "refusing to reopen a closed Bead from terminal run settlement".to_owned(),
        });
    }
    match current.assignee.as_deref() {
        None if current.status == if blocked { "blocked" } else { "open" } => return Ok(current),
        None => {}
        Some(holder) if holder != actor => {
            return Err(BdError::LeaseHeld {
                bead: id.to_owned(),
                holder: Some(holder.to_owned()),
            });
        }
        Some(_) => {}
    }
    let status = if blocked { "blocked" } else { "open" };
    let mut args = vec!["update", id, "--status", status, "--assignee", ""];
    if current.assignee.is_some() {
        args.extend(["--if-assignee", actor]);
    } else {
        args.extend(["--if-assignee", ""]);
    }
    args.extend(["--actor", actor, "--json"]);
    invoke::write(
        cfg,
        invoke::WriteOp::Other {
            bead: Some(id.to_owned()),
            actor: Some(actor.to_owned()),
        },
        &args,
    )
    .await?;
    show_issue(cfg, id).await
}

/// Set a held child back to `open` after an explicit input resolution.
pub async fn reopen_issue(cfg: &BdConfig, id: &str, actor: &str) -> Result<IssueSummary, BdError> {
    let args = ["update", id, "--status", "open", "--actor", actor, "--json"];
    invoke::write(
        cfg,
        invoke::WriteOp::Other {
            bead: Some(id.to_owned()),
            actor: Some(actor.to_owned()),
        },
        &args,
    )
    .await?;
    show_issue(cfg, id).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn hydrated(id: &str, status: &str, dependencies: Value) -> Value {
        json!({
            "id": id,
            "title": format!("Plan {id}"),
            "status": status,
            "issue_type": "task",
            "dependencies": dependencies,
        })
    }

    #[test]
    fn issue_projection_defaults_optional_copy() {
        assert_eq!(
            issue(&json!({"id":"b-1"})),
            Some(IssueSummary {
                id: "b-1".to_owned(),
                title: String::new(),
                description: String::new(),
                status: "open".to_owned(),
                priority: None,
                assignee: None,
                issue_type: "task".to_owned(),
                acceptance_criteria: String::new(),
                design: String::new(),
                notes: String::new(),
                spec_id: None,
                metadata: BTreeMap::new(),
                revision: None,
                updated_at: None,
            })
        );
    }

    #[test]
    fn issue_projection_carries_every_spec_field() {
        let projected = issue(&json!({
            "id": "b-2",
            "priority": 2,
            "description": "## Context\nwhy",
            "acceptance_criteria": "- it works",
            "design": "touch points",
            "notes": "commit as you go",
            "spec_id": "spec-42",
            "metadata": {"gates": "cargo test", "rounds": 2},
            "updated_at": "2026-08-14T00:00:00Z",
        }))
        .expect("projects");
        assert_eq!(projected.description, "## Context\nwhy");
        assert_eq!(projected.priority, Some(2));
        assert_eq!(projected.acceptance_criteria, "- it works");
        assert_eq!(projected.design, "touch points");
        assert_eq!(projected.notes, "commit as you go");
        assert_eq!(projected.spec_id.as_deref(), Some("spec-42"));
        assert_eq!(
            projected.updated_at.as_deref(),
            Some("2026-08-14T00:00:00Z")
        );
        assert_eq!(
            projected.metadata.get("gates").map(String::as_str),
            Some("cargo test")
        );
        assert_eq!(
            projected.metadata.get("rounds").map(String::as_str),
            Some("2")
        );
    }

    #[test]
    fn revision_keeps_bds_own_digits_and_never_becomes_a_number() {
        // The observed bd 1.2.1 shape: a signed 64-bit value whose sign is
        // meaningless and whose magnitude exceeds f64's exact range.
        for raw in [9_146_914_492_635_073_757i64, -6_192_208_415_116_251_521] {
            let projected = issue(&json!({"id": "b-3", "revision": raw})).expect("projects");
            assert_eq!(
                projected.revision.as_deref(),
                Some(raw.to_string().as_str())
            );
        }
        // Absent, null, and empty-string all mean "this response carries no
        // revision" — never a fence value of their own.
        for raw in [json!(null), json!("")] {
            assert_eq!(
                issue(&json!({"id": "b-3", "revision": raw}))
                    .expect("projects")
                    .revision,
                None
            );
        }
        assert_eq!(
            issue(&json!({"id": "b-3"})).expect("projects").revision,
            None
        );
    }

    #[test]
    fn plan_hydration_requires_closed_issue_and_dependency_fields() {
        for malformed in [
            json!({"id":"plan-a","title":"Plan A","issue_type":"task"}),
            json!({"id":"plan-a","title":"Plan A","status":"open"}),
            json!({
                "id":"plan-a",
                "title":"Plan A",
                "status":"custom",
                "issue_type":"task"
            }),
            json!({
                "id":"plan-a",
                "title":"Plan A",
                "status":"open",
                "issue_type":"task",
                "revision": {}
            }),
            hydrated(
                "plan-a",
                "open",
                json!([{"id":"dep-a","dependency_type":"waits-for","status":"open"}]),
            ),
            hydrated(
                "plan-a",
                "open",
                json!([{"id":"dep-a","dependency_type":"blocks","status":"custom"}]),
            ),
        ] {
            assert!(
                plan_issue(&malformed).is_err(),
                "malformed plan row was accepted: {malformed}"
            );
        }
    }

    #[test]
    fn pinned_dependency_kinds_round_trip_without_inventing_blockers() {
        let item = plan_issue(&hydrated(
            "plan-a",
            "open",
            json!([
                {"id":"hard","dependency_type":"blocks","status":"closed"},
                {"id":"parent","dependency_type":"parent-child","status":"open"},
                {"id":"context","dependency_type":"related","status":"in_progress"},
                {"id":"origin","dependency_type":"discovered-from"}
            ]),
        ))
        .expect("the four pinned dependency kinds");

        assert_eq!(item.readiness(), PlanReadiness::Ready);
        assert_eq!(
            item.dependencies
                .iter()
                .map(|dependency| dependency.dependency_type)
                .collect::<Vec<_>>(),
            vec![
                PlanDependencyType::Blocks,
                PlanDependencyType::ParentChild,
                PlanDependencyType::Related,
                PlanDependencyType::DiscoveredFrom,
            ]
        );
        assert_eq!(
            serde_json::to_value(&item.dependencies).expect("serialize dependencies"),
            json!([
                {"id":"hard","dependencyType":"blocks","status":"closed"},
                {"id":"parent","dependencyType":"parent-child","status":"open"},
                {"id":"context","dependencyType":"related","status":"in_progress"},
                {"id":"origin","dependencyType":"discovered-from","status":null}
            ])
        );
    }

    #[test]
    fn readiness_is_unknown_only_when_a_hard_blocker_lacks_status() {
        let missing = plan_issue(&hydrated(
            "plan-a",
            "open",
            json!([{"id":"hard","dependency_type":"blocks"}]),
        ))
        .expect("missing dependency status is bounded unknown evidence");
        assert_eq!(missing.readiness(), PlanReadiness::Unknown);

        let known_open = plan_issue(&hydrated(
            "plan-a",
            "open",
            json!([
                {"id":"unknown","dependency_type":"blocks"},
                {"id":"open","dependency_type":"blocks","status":"open"}
            ]),
        ))
        .expect("known and unknown blocker evidence");
        assert_eq!(known_open.readiness(), PlanReadiness::Blocked);

        let structural = plan_issue(&hydrated(
            "plan-a",
            "open",
            json!([{"id":"epic","dependency_type":"parent-child"}]),
        ))
        .expect("parent-child status is not scheduling evidence");
        assert_eq!(structural.readiness(), PlanReadiness::Ready);
    }

    #[test]
    fn dependency_status_decoding_matches_the_pinned_bd_schema() {
        for status in [
            "open",
            "in_progress",
            "blocked",
            "deferred",
            "closed",
            "pinned",
            "hooked",
        ] {
            let item = plan_issue(&hydrated(
                "plan-a",
                "open",
                json!([{"id":"hard","dependency_type":"blocks","status":status}]),
            ))
            .unwrap_or_else(|error| panic!("pinned status {status:?} was rejected: {error}"));
            let expected = if status == "closed" {
                PlanReadiness::Ready
            } else {
                PlanReadiness::Blocked
            };
            assert_eq!(item.readiness(), expected, "status {status:?}");
        }
    }

    #[test]
    fn discovery_validates_the_n_plus_one_sentinel_before_truncating() {
        let rows = vec![json!({"id":"a"}), json!({"id":"b"}), json!({"id":"c"})];
        assert_eq!(
            selected_discovery_ids(&rows, 2).expect("valid N+1 discovery"),
            vec!["a".to_owned(), "b".to_owned()]
        );

        for malformed in [
            vec![
                json!({"id":"a"}),
                json!({"id":"b"}),
                json!({"title":"sentinel"}),
            ],
            vec![json!({"id":"a"}), json!({"id":"b"}), json!({"id":"b"})],
            vec![json!({"id":"a"}), json!({"id":"b"}), json!({"id":" "})],
        ] {
            assert!(
                selected_discovery_ids(&malformed, 2).is_err(),
                "malformed sentinel was ignored: {malformed:?}"
            );
        }
        assert!(selected_discovery_ids(
            &[
                json!({"id":"a"}),
                json!({"id":"b"}),
                json!({"id":"c"}),
                json!({"id":"d"}),
            ],
            2,
        )
        .is_err());
    }

    #[test]
    fn hydration_is_an_exact_complete_join_in_discovery_order() {
        let requested = vec!["a".to_owned(), "b".to_owned()];
        let reversed = vec![
            hydrated("b", "open", json!([])),
            hydrated("a", "open", json!([])),
        ];
        assert_eq!(
            hydrated_plan_rows(&reversed, &requested, None)
                .expect("complete exact hydrate")
                .into_iter()
                .map(|item| item.issue.id)
                .collect::<Vec<_>>(),
            requested
        );

        let cases = [
            (
                vec![
                    hydrated("a", "open", json!([])),
                    hydrated("a", "open", json!([])),
                ],
                "duplicate issue id",
            ),
            (
                vec![
                    hydrated("a", "open", json!([])),
                    hydrated("", "open", json!([])),
                ],
                "empty id",
            ),
            (
                vec![
                    hydrated("a", "open", json!([])),
                    hydrated("sentinel", "open", json!([])),
                ],
                "unrequested issue id",
            ),
            (
                vec![hydrated("a", "open", json!([]))],
                "omitted selected issue",
            ),
        ];
        for (rows, expected) in cases {
            let error = hydrated_plan_rows(&rows, &requested, None)
                .expect_err("inexact hydration must fail closed");
            assert!(
                error.contains(expected),
                "expected {expected:?} in {error:?}"
            );
        }
    }
}
