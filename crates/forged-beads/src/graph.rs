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

/// The complete provider-authored native specification written at one
/// rolling-planning boundary.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NativeSpecUpdate {
    /// Context and exact outcome.
    pub description: String,
    /// Observable completion contract.
    pub acceptance_criteria: String,
    /// Necessary implementation constraints.
    pub design: String,
    /// Instructions and explicit non-goals for the executing agent.
    pub notes: String,
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
/// Only `blocks` affects scheduling readiness. The other four coordinates
/// remain visible to consumers as hierarchy, context, or provenance without
/// being promoted into blockers.
///
/// The subset stays closed on purpose: pinned bd 1.2.1 also advertises
/// `tracks`, `until`, `caused-by`, `validates`, and `relates-to`, and each
/// needs its own semantic review before a plan row may carry it. An
/// unadjudicated kind must keep failing the hydrate closed rather than being
/// skipped or coerced into `related`.
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
    /// A non-scheduling provenance link from a replacement to the plan it
    /// replaced. The superseded target's status — including a missing or
    /// still-open one — is history, never a prerequisite.
    Supersedes,
}

impl PlanDependencyType {
    /// The native bd spelling retained on the wire.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Blocks => "blocks",
            Self::ParentChild => "parent-child",
            Self::Related => "related",
            Self::DiscoveredFrom => "discovered-from",
            Self::Supersedes => "supersedes",
        }
    }

    /// Whether this edge can prevent the issue from being ready.
    ///
    /// Only `blocks` does. `supersedes` in particular points at work the
    /// source replaced, which is routinely open or closed after the fact.
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
            "supersedes" => Ok(Self::Supersedes),
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

/// Scope for the Work Map's one bounded Beads graph read.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WorkMapPlanScope {
    /// All live operator-scoped plans.
    Operator,
    /// Live plans whose persisted repository metadata exactly matches.
    Repository(String),
    /// The named epic and its direct live children.
    Epic(String),
}

/// Current plan rows plus exact Bead summaries needed by the shared
/// Operations classifier. Both collections come from the same final hydrate;
/// no separate claim/membership process is needed.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkMapPlanInventory {
    /// Hydrated live plan rows selected for display.
    pub issues: Vec<PlanIssue>,
    /// Exact durable-linked Bead summaries available to classification.
    pub exact_issues: Vec<IssueSummary>,
    /// More live plan rows matched than the caller's bound.
    pub truncated: bool,
    /// Number of live plan rows observed before the display bound.
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

fn exact_issue(value: &Value) -> Result<IssueSummary, String> {
    let object = value
        .as_object()
        .ok_or_else(|| "hydrated issue is not an object".to_owned())?;
    let id = object
        .get("id")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| "hydrated issue has no non-empty string id".to_owned())?;
    if !object.get("title").is_some_and(Value::is_string) {
        return Err(format!("hydrated issue {id:?} has no string title"));
    }
    object
        .get("status")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| format!("hydrated issue {id:?} has no non-empty string status"))?;
    object
        .get("issue_type")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| format!("hydrated issue {id:?} has no non-empty string issue_type"))?;
    if object.get("revision").is_some_and(|value| {
        !matches!(value, Value::Null | Value::Number(_))
            && !matches!(value, Value::String(text) if !text.trim().is_empty())
    }) {
        return Err(format!("hydrated issue {id:?} has a malformed revision"));
    }
    if let Some(metadata) = object.get("metadata") {
        let metadata = metadata
            .as_object()
            .ok_or_else(|| format!("hydrated issue {id:?} metadata is not an object"))?;
        if metadata
            .get("repository")
            .is_some_and(|value| !value.is_string())
        {
            return Err(format!(
                "hydrated issue {id:?} repository metadata is not a string"
            ));
        }
    }
    issue(value).ok_or_else(|| format!("hydrated issue {id:?} could not be projected"))
}

fn is_live_plan_status(status: &str) -> bool {
    matches!(status, "open" | "in_progress" | "blocked" | "deferred")
}

fn push_unique_id(
    ids: &mut Vec<String>,
    seen: &mut BTreeSet<String>,
    id: &str,
) -> Result<(), String> {
    if id.trim().is_empty() {
        return Err("plan discovery produced an empty id".to_owned());
    }
    if seen.insert(id.to_owned()) {
        ids.push(id.to_owned());
    }
    Ok(())
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

fn exact_issue_rows(value: &Value, requested_ids: &[String]) -> Result<Vec<IssueSummary>, String> {
    let requested: BTreeSet<&str> = requested_ids.iter().map(String::as_str).collect();
    if requested.len() != requested_ids.len() {
        return Err("requested issue ids are not unique".to_owned());
    }

    let rows = envelope::as_list(value).unwrap_or_else(|| vec![value.clone()]);
    let mut by_id = BTreeMap::new();
    for row in &rows {
        let item = exact_issue(row)?;
        let id = item.id.clone();
        if !requested.contains(id.as_str()) {
            return Err(format!("show returned unrequested issue id {id:?}"));
        }
        if by_id.insert(id.clone(), item).is_some() {
            return Err(format!("show returned duplicate issue id {id:?}"));
        }
    }

    // A requested issue can disappear between ledger discovery and this
    // read. Preserve that as absence so admission classifies it unavailable;
    // never manufacture a row from the request itself.
    Ok(requested_ids
        .iter()
        .filter_map(|id| by_id.remove(id))
        .collect())
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

/// Hydrate an exact, bounded set of issues in one
/// `bd show <ids...> --brief-deps --json` invocation.
///
/// Missing or deleted ids are absent from the result. Supplying exact ids
/// avoids both an operator-wide scan and one process per row. The complete
/// `show` shape carries the opaque revision admission requires; brief `list`
/// rows do not in pinned bd 1.2.1.
pub async fn list_issues(cfg: &BdConfig, ids: &[String]) -> Result<Vec<IssueSummary>, BdError> {
    if ids.is_empty() {
        return Ok(Vec::new());
    }
    let mut args = Vec::with_capacity(ids.len() + 3);
    args.push("show");
    args.extend(ids.iter().map(String::as_str));
    args.push("--brief-deps");
    args.push("--json");
    let data = invoke::read(cfg, &args).await?;
    exact_issue_rows(&data, ids).map_err(|detail| BdError::Envelope {
        context: "bd show exact issues".to_owned(),
        detail,
    })
}

/// Hydrate an exact, bounded set of PLAN rows — issue plus bounded
/// dependency summaries — in one `bd show <ids...> --brief-deps --json`
/// call, so a caller can evaluate [`PlanIssue::readiness`] for specific
/// beads without an operator-wide inventory scan.
pub async fn plan_issues(cfg: &BdConfig, ids: &[String]) -> Result<Vec<PlanIssue>, BdError> {
    if ids.is_empty() {
        return Ok(Vec::new());
    }
    let mut args = Vec::with_capacity(ids.len() + 3);
    args.push("show");
    args.extend(ids.iter().map(String::as_str));
    args.push("--brief-deps");
    args.push("--json");
    let hydrated_json = invoke::read(cfg, &args).await?;
    let hydrated_rows =
        envelope::as_list(&hydrated_json).unwrap_or_else(|| vec![hydrated_json.clone()]);
    hydrated_plan_rows(&hydrated_rows, ids, None).map_err(|detail| BdError::Envelope {
        context: "bd show exact plan rows".to_owned(),
        detail,
    })
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
    if ids.is_empty() {
        return Ok(Vec::new());
    }
    let joined = ids.join(",");
    let metadata_field = format!("repository={repository}");
    let mut args = vec!["list", "--id", &joined, "--metadata-field", &metadata_field];
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

/// Read every current Work Map plan node and the exact Beads rows needed for
/// durable claim/attention classification with a constant process count.
///
/// Operator and repository scopes use one N+1 discovery plus one union
/// hydrate. Epic scope uses native children, the epic's legacy dependency
/// payload, then the same union hydrate. Exact durable ids missing from Beads
/// are allowed to remain absent; selected current plan ids may not disappear
/// between discovery and hydration.
pub async fn work_map_plan_inventory(
    cfg: &BdConfig,
    scope: &WorkMapPlanScope,
    exact_ids: &[String],
    limit: usize,
) -> Result<WorkMapPlanInventory, BdError> {
    if limit == 0 {
        return Err(BdError::Envelope {
            context: "bd work map plan".to_owned(),
            detail: "work map plan limit must be positive".to_owned(),
        });
    }
    if exact_ids.iter().any(|id| id.trim().is_empty()) {
        return Err(BdError::Envelope {
            context: "bd work map plan".to_owned(),
            detail: "work map exact ids must be non-empty".to_owned(),
        });
    }

    let (mut selected, discovered, truncated, repository) = match scope {
        WorkMapPlanScope::Operator | WorkMapPlanScope::Repository(_) => {
            let discovery_limit = limit.saturating_add(1);
            let limit_text = discovery_limit.to_string();
            let repository = match scope {
                WorkMapPlanScope::Repository(value) => Some(value.as_str()),
                _ => None,
            };
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
            let raw = invoke::read(cfg, &args).await?;
            let rows = envelope::as_list(&raw).unwrap_or_else(|| vec![raw.clone()]);
            let discovered = rows.len();
            let truncated = discovered > limit;
            let selected =
                selected_discovery_ids(&rows, limit).map_err(|detail| BdError::Envelope {
                    context: "bd list work map plan".to_owned(),
                    detail,
                })?;
            (
                selected,
                discovered,
                truncated,
                repository.map(str::to_owned),
            )
        }
        WorkMapPlanScope::Epic(epic) => {
            if epic.trim().is_empty() {
                return Err(BdError::Envelope {
                    context: "bd work map epic".to_owned(),
                    detail: "epic id must be non-empty".to_owned(),
                });
            }
            let discovery_limit = limit.saturating_add(1);
            let limit_text = discovery_limit.to_string();
            let native = invoke::read(
                cfg,
                &[
                    "list",
                    "--parent",
                    epic,
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
                    "--no-pager",
                    "--json",
                ],
            )
            .await?;
            let root = invoke::read(cfg, &["show", epic, "--json"]).await?;
            let mut ids = Vec::new();
            let mut seen = BTreeSet::new();
            let value = envelope::first_obj(&root).ok_or_else(|| BdError::Envelope {
                context: "bd show work map epic".to_owned(),
                detail: format!("response omitted exact epic {epic:?}"),
            })?;
            let root_summary = exact_issue(value).map_err(|detail| BdError::Envelope {
                context: "bd show work map epic".to_owned(),
                detail,
            })?;
            if root_summary.id != *epic {
                return Err(BdError::Envelope {
                    context: "bd show work map epic".to_owned(),
                    detail: format!(
                        "requested epic {epic:?} but response named {:?}",
                        root_summary.id
                    ),
                });
            }
            if is_live_plan_status(&root_summary.status) {
                push_unique_id(&mut ids, &mut seen, epic).map_err(|detail| BdError::Envelope {
                    context: "bd show work map epic".to_owned(),
                    detail,
                })?;
            }
            match value.get("dependencies") {
                None | Some(Value::Null) => {}
                Some(Value::Array(dependencies)) => {
                    for dependency in dependencies {
                        let object = dependency.as_object().ok_or_else(|| BdError::Envelope {
                            context: "bd show work map epic".to_owned(),
                            detail: "epic dependency is not an object".to_owned(),
                        })?;
                        let id = object
                            .get("id")
                            .or_else(|| object.get("depends_on_id"))
                            .and_then(Value::as_str)
                            .filter(|value| !value.trim().is_empty())
                            .ok_or_else(|| BdError::Envelope {
                                context: "bd show work map epic".to_owned(),
                                detail: "epic dependency has no canonical issue id".to_owned(),
                            })?;
                        let status = object
                            .get("status")
                            .and_then(Value::as_str)
                            .filter(|value| !value.trim().is_empty())
                            .ok_or_else(|| BdError::Envelope {
                                context: "bd show work map epic".to_owned(),
                                detail: format!("epic dependency {id:?} has no current status"),
                            })?;
                        PlanDependencyStatus::try_from(status).map_err(|detail| {
                            BdError::Envelope {
                                context: "bd show work map epic".to_owned(),
                                detail: format!("epic dependency {id:?} has {detail}"),
                            }
                        })?;
                        if id != epic && is_live_plan_status(status) {
                            push_unique_id(&mut ids, &mut seen, id).map_err(|detail| {
                                BdError::Envelope {
                                    context: "bd show work map epic".to_owned(),
                                    detail,
                                }
                            })?;
                        }
                        if ids.len() >= discovery_limit {
                            break;
                        }
                    }
                }
                Some(_) => {
                    return Err(BdError::Envelope {
                        context: "bd show work map epic".to_owned(),
                        detail: "epic dependencies is not an array".to_owned(),
                    })
                }
            }
            for value in envelope::as_list(&native).unwrap_or_else(|| vec![native.clone()]) {
                let summary = exact_issue(&value).map_err(|detail| BdError::Envelope {
                    context: "bd list work map epic children".to_owned(),
                    detail,
                })?;
                if is_live_plan_status(&summary.status) {
                    push_unique_id(&mut ids, &mut seen, &summary.id).map_err(|detail| {
                        BdError::Envelope {
                            context: "bd list work map epic children".to_owned(),
                            detail,
                        }
                    })?;
                }
                if ids.len() >= discovery_limit {
                    break;
                }
            }
            let discovered = ids.len();
            let truncated = discovered > limit;
            ids.truncate(limit);
            (ids, discovered, truncated, None)
        }
    };

    let selected_plan_ids = selected.clone();
    let mut requested = BTreeSet::new();
    selected.retain(|id| requested.insert(id.clone()));
    for id in exact_ids {
        if requested.insert(id.clone()) {
            selected.push(id.clone());
        }
    }
    if selected.is_empty() {
        return Ok(WorkMapPlanInventory {
            issues: Vec::new(),
            exact_issues: Vec::new(),
            truncated,
            discovered,
        });
    }

    let mut show_args = Vec::with_capacity(selected.len() + 3);
    show_args.push("show");
    show_args.extend(selected.iter().map(String::as_str));
    show_args.extend(["--brief-deps", "--json"]);
    let raw = invoke::read(cfg, &show_args).await?;
    let rows = envelope::as_list(&raw).unwrap_or_else(|| vec![raw.clone()]);
    let requested_set: BTreeSet<&str> = selected.iter().map(String::as_str).collect();
    let mut hydrated = BTreeMap::new();
    for row in rows {
        let summary = exact_issue(&row).map_err(|detail| BdError::Envelope {
            context: "bd show work map plan".to_owned(),
            detail,
        })?;
        if !requested_set.contains(summary.id.as_str()) {
            return Err(BdError::Envelope {
                context: "bd show work map plan".to_owned(),
                detail: format!("hydrate returned unrequested issue id {:?}", summary.id),
            });
        }
        if hydrated.insert(summary.id.clone(), row).is_some() {
            return Err(BdError::Envelope {
                context: "bd show work map plan".to_owned(),
                detail: format!("hydrate returned duplicate issue id {:?}", summary.id),
            });
        }
    }

    let mut issues = Vec::with_capacity(selected_plan_ids.len());
    for id in &selected_plan_ids {
        let row = hydrated.get(id).ok_or_else(|| BdError::Envelope {
            context: "bd show work map plan".to_owned(),
            detail: format!("hydrate omitted selected plan issue {id:?}"),
        })?;
        let plan = plan_issue(row).map_err(|detail| BdError::Envelope {
            context: "bd show work map plan".to_owned(),
            detail,
        })?;
        if let Some(expected) = repository.as_deref() {
            let actual = plan.issue.metadata.get("repository").map(String::as_str);
            if actual != Some(expected) {
                return Err(BdError::Envelope {
                    context: "bd show work map plan".to_owned(),
                    detail: format!("selected issue {id:?} repository changed during hydration"),
                });
            }
        }
        issues.push(plan);
    }
    let exact_issues = selected
        .iter()
        .filter_map(|id| hydrated.get(id))
        .map(exact_issue)
        .collect::<Result<Vec<_>, _>>()
        .map_err(|detail| BdError::Envelope {
            context: "bd show work map plan".to_owned(),
            detail,
        })?;

    Ok(WorkMapPlanInventory {
        issues,
        exact_issues,
        truncated,
        discovered,
    })
}

/// Read an epic's frozen inventory and identify legacy dependency-linked
/// members which have no native parent edge.
///
/// The returned id set is bounded by the epic's own dependency list. It is
/// retained by the epic start event so later readiness checks never widen
/// into an operator-global scan.
pub async fn epic_children_with_legacy(
    cfg: &BdConfig,
    epic: &str,
) -> Result<(Vec<IssueSummary>, BTreeSet<String>), BdError> {
    let native = invoke::read(cfg, &["children", epic, "--json"]).await?;
    let shown = invoke::read(cfg, &["show", epic, "--json"]).await?;
    let mut children: BTreeMap<String, IssueSummary> = list(&native)
        .into_iter()
        .map(|item| (item.id.clone(), item))
        .collect();
    let native_ids = children.keys().cloned().collect::<BTreeSet<_>>();
    let mut legacy = BTreeSet::new();
    if let Some(root) = envelope::first_obj(&shown) {
        if let Some(dependencies) = root.get("dependencies").and_then(Value::as_array) {
            for dependency in dependencies {
                if let Some(item) = issue(dependency) {
                    if item.id != epic {
                        if !native_ids.contains(&item.id) {
                            legacy.insert(item.id.clone());
                        }
                        children.entry(item.id.clone()).or_insert(item);
                    }
                }
            }
        }
    }
    Ok((children.into_values().collect(), legacy))
}

/// Read an epic's inventory. Native parent/child links are preferred, with
/// the Anvil-compatible epic-depends-on-children encoding unioned in.
pub async fn epic_children(cfg: &BdConfig, epic: &str) -> Result<Vec<IssueSummary>, BdError> {
    epic_children_with_legacy(cfg, epic)
        .await
        .map(|(children, _)| children)
}

/// Read the current global ready frontier without claiming anything.
pub async fn ready_issues(cfg: &BdConfig) -> Result<Vec<IssueSummary>, BdError> {
    let data = invoke::read(cfg, &["ready", "--json"]).await?;
    Ok(list(&data))
}

/// Read the complete ready frontier for exactly one frozen epic.
pub async fn ready_epic_children(cfg: &BdConfig, epic: &str) -> Result<Vec<IssueSummary>, BdError> {
    let data = invoke::read(cfg, &["ready", "--parent", epic, "--limit", "0", "--json"]).await?;
    Ok(list(&data))
}

/// Read the complete native-parent frontier and union only the exact frozen
/// legacy dependency-linked members whose hydrated facts prove them ready.
///
/// This deliberately performs no global `bd ready` or capped inventory scan.
pub async fn ready_frozen_epic_children(
    cfg: &BdConfig,
    epic: &str,
    legacy_non_parent: &[String],
) -> Result<Vec<IssueSummary>, BdError> {
    let mut ready = ready_epic_children(cfg, epic)
        .await?
        .into_iter()
        .map(|issue| (issue.id.clone(), issue))
        .collect::<BTreeMap<_, _>>();
    for row in plan_issues(cfg, legacy_non_parent).await? {
        if row.parent.is_none() && row.readiness() == PlanReadiness::Ready {
            ready.entry(row.issue.id.clone()).or_insert(row.issue);
        }
    }
    Ok(ready.into_values().collect())
}

/// Persist one complete rolling-plan result and make the stub schedulable.
/// The write is serialized by forged-beads and guarded on the exact workflow
/// preconditions supported by pinned bd: blocked and unassigned. Callers
/// additionally compare their four-field digest before entering this seam.
pub async fn apply_native_spec_to_blocked_stub(
    cfg: &BdConfig,
    id: &str,
    actor: &str,
    spec: &NativeSpecUpdate,
) -> Result<IssueSummary, BdError> {
    let args = vec![
        "update",
        id,
        "--description",
        spec.description.as_str(),
        "--acceptance",
        spec.acceptance_criteria.as_str(),
        "--design",
        spec.design.as_str(),
        "--notes",
        spec.notes.as_str(),
        "--status",
        "open",
        "--if-assignee",
        "",
        "--if-status",
        "blocked",
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
    let applied = show_issue(cfg, id).await?;
    let exact = applied.description == spec.description
        && applied.acceptance_criteria == spec.acceptance_criteria
        && applied.design == spec.design
        && applied.notes == spec.notes
        && applied.status == "open"
        && applied.assignee.is_none();
    if exact {
        Ok(applied)
    } else {
        Err(BdError::Beads {
            context: format!("bd update {id} (rolling plan readback)"),
            exit: None,
            stdout: serde_json::to_string(&applied).unwrap_or_default(),
            stderr:
                "guarded rolling-plan write did not produce the exact native spec and open state"
                    .to_owned(),
        })
    }
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

/// Atomically assign an unassigned issue and move it to `in_progress`.
///
/// This is deliberately a guarded FIELD update, not `--claim`: pinned bd
/// 1.2.1 refuses claims on `blocked` issues, while plain assignment permits
/// the blocked-settlement residue to be retaken. `--if-assignee ''` preserves
/// the ownership CAS, and the status and assignee move in the same write so
/// neither the blocked nor open unassigned input has an intermediate shape.
pub async fn assign_unassigned_issue(
    cfg: &BdConfig,
    id: &str,
    actor: &str,
    observed_status: &str,
) -> Result<IssueSummary, BdError> {
    // Both guards ride one field update: `--if-assignee ''` requires the
    // bead unassigned and `--if-status` pins the exact status the caller
    // probed — a deferred/pinned/hooked bead whose status moved after the
    // probe refuses instead of being overwritten and closed.
    let args = [
        "update",
        id,
        "--assignee",
        actor,
        "--status",
        "in_progress",
        "--if-assignee",
        "",
        "--if-status",
        observed_status,
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
    let assigned = show_issue(cfg, id).await?;
    if assigned.status == "in_progress" && assigned.assignee.as_deref() == Some(actor) {
        Ok(assigned)
    } else {
        Err(BdError::Beads {
            context: format!("bd update {id} (guarded assignment)"),
            exit: None,
            stdout: serde_json::to_string(&assigned).unwrap_or_default(),
            stderr: "guarded assignment did not produce an in_progress issue under the expected assignee"
                .to_owned(),
        })
    }
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
    if comment_present(cfg, id, marker).await? {
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

/// Whether a marker-addressed lifecycle comment is already present. This is
/// the read half of [`comment_once`], exposed so a convergence probe can
/// observe a delivered comment without ever holding write authority.
pub async fn comment_present(cfg: &BdConfig, id: &str, marker: &str) -> Result<bool, BdError> {
    let current = invoke::read(cfg, &["comments", id, "--json"]).await?;
    Ok(current.to_string().contains(marker))
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
                {"id":"origin","dependency_type":"discovered-from"},
                {"id":"replaced","dependency_type":"supersedes","status":"open"}
            ]),
        ))
        .expect("the five pinned dependency kinds");

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
                PlanDependencyType::Supersedes,
            ]
        );
        assert_eq!(
            serde_json::to_value(&item.dependencies).expect("serialize dependencies"),
            json!([
                {"id":"hard","dependencyType":"blocks","status":"closed"},
                {"id":"parent","dependencyType":"parent-child","status":"open"},
                {"id":"context","dependencyType":"related","status":"in_progress"},
                {"id":"origin","dependencyType":"discovered-from","status":null},
                {"id":"replaced","dependencyType":"supersedes","status":"open"}
            ])
        );
    }

    /// The 2026-08-17 incident: one legitimate `supersedes` edge made the
    /// whole repository-scoped plan source unavailable. It is provenance —
    /// the superseded target's status is history in every shape bd emits it,
    /// so it can never move the source off `ready`.
    #[test]
    fn a_supersedes_edge_is_provenance_and_never_moves_readiness() {
        for status in [
            json!({"id":"replaced","dependency_type":"supersedes","status":"open"}),
            json!({"id":"replaced","dependency_type":"supersedes","status":"blocked"}),
            json!({"id":"replaced","dependency_type":"supersedes","status":"closed"}),
            json!({"id":"replaced","dependency_type":"supersedes"}),
        ] {
            let item = plan_issue(&hydrated("plan-a", "open", json!([status.clone()])))
                .unwrap_or_else(|error| panic!("supersedes {status} was rejected: {error}"));
            assert_eq!(
                item.readiness(),
                PlanReadiness::Ready,
                "supersedes {status} changed readiness"
            );
            assert_eq!(item.dependencies.len(), 1, "the edge stays visible");
            assert_eq!(
                item.dependencies[0].dependency_type,
                PlanDependencyType::Supersedes
            );
            assert!(!item.dependencies[0].dependency_type.blocks_readiness());
            assert_eq!(item.dependencies[0].id, "replaced");
        }
    }

    /// The neighbours bd 1.2.1 also advertises are NOT admitted with it: a
    /// kind forged has not adjudicated must still fail the hydrate closed.
    #[test]
    fn unadjudicated_bd_dependency_kinds_remain_closed() {
        for kind in [
            "tracks",
            "until",
            "caused-by",
            "validates",
            "relates-to",
            "supersedes ",
            "Supersedes",
        ] {
            assert!(
                plan_issue(&hydrated(
                    "plan-a",
                    "open",
                    json!([{"id":"dep-a","dependency_type":kind,"status":"open"}]),
                ))
                .is_err(),
                "dependency kind {kind:?} was accepted without adjudication"
            );
        }
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

    fn exact_row(id: &str, revision: Value) -> Value {
        json!({
            "id": id,
            "title": format!("Issue {id}"),
            "status": "open",
            "priority": 1,
            "issue_type": "task",
            "metadata": {"repository": "/tmp/repository"},
            "revision": revision,
        })
    }

    #[test]
    fn exact_issue_hydration_preserves_order_and_signed_revision_digits() {
        let requested = vec!["issue-a".to_owned(), "issue-b".to_owned()];
        let rows = json!([
            exact_row("issue-b", json!(-6_192_208_415_116_251_521i64)),
            exact_row("issue-a", json!(9_146_914_492_635_073_757i64)),
        ]);
        let issues = exact_issue_rows(&rows, &requested).expect("exact bounded hydration");
        assert_eq!(
            issues
                .iter()
                .map(|issue| issue.id.as_str())
                .collect::<Vec<_>>(),
            ["issue-a", "issue-b"]
        );
        assert_eq!(issues[0].revision.as_deref(), Some("9146914492635073757"));
        assert_eq!(issues[1].revision.as_deref(), Some("-6192208415116251521"));
        assert_eq!(
            issues[0].metadata.get("repository").map(String::as_str),
            Some("/tmp/repository")
        );
    }

    #[test]
    fn exact_issue_hydration_fails_closed_without_manufacturing_missing_rows() {
        let requested = vec!["issue-a".to_owned(), "issue-b".to_owned()];
        let missing = exact_issue_rows(&json!([exact_row("issue-a", json!(17))]), &requested)
            .expect("a deleted issue remains absent");
        assert_eq!(missing.len(), 1);
        assert_eq!(missing[0].id, "issue-a");

        let revisionless = exact_issue_rows(
            &json!([exact_row("issue-a", Value::Null)]),
            &["issue-a".to_owned()],
        )
        .expect("a revision-less row remains visible as malformed admission input");
        assert_eq!(revisionless[0].revision, None);

        for (rows, expected) in [
            (
                json!([
                    exact_row("issue-a", json!(17)),
                    exact_row("issue-a", json!(18)),
                ]),
                "duplicate issue id",
            ),
            (
                json!([
                    exact_row("issue-a", json!(17)),
                    exact_row("other", json!(18)),
                ]),
                "unrequested issue id",
            ),
            (
                json!([{
                    "id": "issue-a",
                    "title": "Issue A",
                    "status": "open",
                    "issue_type": "task",
                    "revision": {},
                }]),
                "malformed revision",
            ),
        ] {
            let error = exact_issue_rows(&rows, &requested)
                .expect_err("ambiguous or malformed rows must fail closed");
            assert!(
                error.contains(expected),
                "expected {expected:?} in {error:?}"
            );
        }

        let duplicate_request = vec!["issue-a".to_owned(), "issue-a".to_owned()];
        assert!(exact_issue_rows(
            &json!([exact_row("issue-a", json!(17))]),
            &duplicate_request,
        )
        .expect_err("duplicate request is ambiguous")
        .contains("requested issue ids are not unique"));
    }
}
