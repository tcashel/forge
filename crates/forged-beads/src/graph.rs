//! Typed reads and narrow writes for epic dependency graphs.

use std::collections::BTreeMap;

use serde_json::Value;

use crate::classify::BdError;
use crate::config::BdConfig;
use crate::{envelope, invoke};

/// The Beads fields the epic scheduler consumes.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IssueSummary {
    /// Stable Beads id.
    pub id: String,
    /// Human-readable title.
    pub title: String,
    /// Markdown-ish issue description carrying `spec:` and `repo:` pointers.
    pub description: String,
    /// Current Beads status.
    pub status: String,
    /// Beads issue type (`task`, `epic`, ...).
    pub issue_type: String,
}

fn issue(value: &Value) -> Option<IssueSummary> {
    Some(IssueSummary {
        id: value.get("id")?.as_str()?.to_owned(),
        title: value
            .get("title")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned(),
        description: value
            .get("description")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned(),
        status: value
            .get("status")
            .and_then(Value::as_str)
            .unwrap_or("open")
            .to_owned(),
        issue_type: value
            .get("issue_type")
            .and_then(Value::as_str)
            .unwrap_or("task")
            .to_owned(),
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
                issue_type: "task".to_owned(),
            })
        );
    }
}
