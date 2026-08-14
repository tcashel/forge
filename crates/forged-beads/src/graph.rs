//! Typed reads and narrow writes for epic dependency graphs.

use std::collections::BTreeMap;

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
    })
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

    #[test]
    fn issue_projection_defaults_optional_copy() {
        assert_eq!(
            issue(&json!({"id":"b-1"})),
            Some(IssueSummary {
                id: "b-1".to_owned(),
                title: String::new(),
                description: String::new(),
                status: "open".to_owned(),
                assignee: None,
                issue_type: "task".to_owned(),
                acceptance_criteria: String::new(),
                design: String::new(),
                notes: String::new(),
                spec_id: None,
                metadata: BTreeMap::new(),
                revision: None,
            })
        );
    }

    #[test]
    fn issue_projection_carries_every_spec_field() {
        let projected = issue(&json!({
            "id": "b-2",
            "description": "## Context\nwhy",
            "acceptance_criteria": "- it works",
            "design": "touch points",
            "notes": "commit as you go",
            "spec_id": "spec-42",
            "metadata": {"gates": "cargo test", "rounds": 2},
        }))
        .expect("projects");
        assert_eq!(projected.description, "## Context\nwhy");
        assert_eq!(projected.acceptance_criteria, "- it works");
        assert_eq!(projected.design, "touch points");
        assert_eq!(projected.notes, "commit as you go");
        assert_eq!(projected.spec_id.as_deref(), Some("spec-42"));
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
}
