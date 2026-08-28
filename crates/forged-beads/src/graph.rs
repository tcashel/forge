//! Typed graph reads for the one-shot legacy-store import.

use std::collections::{BTreeMap, BTreeSet};

use serde_json::Value;

use crate::classify::BdError;
use crate::config::BdConfig;
use crate::{envelope, invoke};

/// The Beads fields copied into the ledger-native work store.
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
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanDependency {
    /// Canonical dependency Bead id.
    pub id: String,
    /// Native dependency edge type from the pinned bd contract.
    pub dependency_type: PlanDependencyType,
    /// Current dependency status when the hydrated response carries it.
    pub status: Option<String>,
}

/// Closed subset of pinned bd dependency kinds supported by plan inventory.
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

/// One hydrated Beads issue and its dependency coordinates.
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
    // The one-shot ledger import reads the WHOLE store, closed rows
    // included; anything outside bd's own status vocabulary fails closed.
    if !matches!(
        status,
        "open" | "in_progress" | "blocked" | "deferred" | "closed"
    ) {
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
                    Some(Value::String(value))
                        if matches!(
                            value.as_str(),
                            "open"
                                | "in_progress"
                                | "blocked"
                                | "deferred"
                                | "closed"
                                | "pinned"
                                | "hooked"
                        ) => Some(value.clone()),
                    Some(Value::String(value)) if !value.trim().is_empty() => {
                        return Err(format!(
                            "hydrated issue {:?} dependency {:?} has unknown dependency status {:?}",
                            issue.id, id, value
                        ));
                    }
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

/// Every issue id in the store across ALL statuses, for the one-shot
/// ledger import. Discovery only — the importer hydrates full fields and
/// dependencies through [`all_issues_with_deps`] afterwards.
pub async fn all_issue_ids(cfg: &BdConfig) -> Result<Vec<String>, BdError> {
    let args = [
        "list",
        "--status",
        "open,in_progress,blocked,deferred,closed",
        "--limit",
        "0",
        "--brief",
        "--flat",
        "--json",
    ];
    let data = invoke::read(cfg, &args).await?;
    Ok(list(&data).into_iter().map(|issue| issue.id).collect())
}

/// Exact rows for the one-shot ledger import, accepting every supported issue
/// status, including closed.
pub async fn all_issues_with_deps(
    cfg: &BdConfig,
    ids: &[String],
) -> Result<Vec<PlanIssue>, BdError> {
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
        context: "bd show import rows".to_owned(),
        detail,
    })
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
    fn pinned_dependency_kinds_round_trip() {
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
