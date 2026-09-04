//! The ledger-native work store behind the bd-era nouns.
//!
//! Every function here is the ledger-backed replacement for exactly one
//! `forged_beads` call the core consumed, returning the SAME shapes
//! (`IssueSummary`, `PlanIssue`, claim/reclaim outcomes) so the P2 swap
//! carries zero semantic diff at the call sites. The bd read-back dances,
//! transport retries, and envelope defenses have no equivalents — a
//! transactional store answers exactly once.
//!
//! Revision vintage: ledger revisions are integers rendered as strings in
//! `IssueSummary::revision` (equality-compared only, like the bd-era
//! opaque digits). Frozen bd-era strings in old fences and event payloads
//! are never rewritten; readers accept both vintages.

use std::collections::{BTreeMap, BTreeSet};

use crate::core::work_types::{
    IssueSummary, NativeSpecUpdate, PlanDependency, PlanDependencyStatus, PlanDependencyType,
    PlanIssue, PlanReadiness,
};
use forged_ledger::{
    Ledger, WorkDepKind, WorkDependencyStatus, WorkItemFilters, WorkItemSnapshot, WorkPlanRow,
    WorkSpecFields, WorkStatus, WORK_LEASE_TTL_S,
};

use crate::core::{on_ledger, Failure};

/// Convert one ledger snapshot into the bd-era summary shape.
pub fn issue_of(snapshot: &WorkItemSnapshot) -> IssueSummary {
    IssueSummary {
        id: snapshot.work_id.clone(),
        title: snapshot.spec.title.clone(),
        description: snapshot.spec.description.clone(),
        status: snapshot.status.as_str().to_string(),
        priority: snapshot.priority,
        assignee: snapshot.assignee.clone(),
        // A non-task/epic bd type survives import as provenance metadata;
        // consumers routing on it (no-diff chore/decision/milestone holds)
        // read it back here.
        issue_type: snapshot
            .metadata
            .get("imported:issue-type")
            .cloned()
            .unwrap_or_else(|| match snapshot.kind {
                forged_ledger::WorkKind::Task => "task".to_string(),
                forged_ledger::WorkKind::Epic => "epic".to_string(),
            }),
        acceptance_criteria: snapshot.spec.acceptance_criteria.clone(),
        design: snapshot.spec.design.clone(),
        notes: snapshot.spec.notes.clone(),
        spec_id: snapshot.metadata.get("imported:spec-id").cloned(),
        metadata: snapshot.metadata.clone(),
        revision: Some(snapshot.revision.to_string()),
        updated_at: Some(snapshot.updated_at.clone()),
    }
}

fn dep_status_of(status: WorkStatus) -> PlanDependencyStatus {
    match status {
        WorkStatus::Open => PlanDependencyStatus::Open,
        WorkStatus::InProgress => PlanDependencyStatus::InProgress,
        WorkStatus::Blocked => PlanDependencyStatus::Blocked,
        WorkStatus::Deferred => PlanDependencyStatus::Deferred,
        WorkStatus::Closed => PlanDependencyStatus::Closed,
    }
}

fn dep_type_of(kind: WorkDepKind) -> PlanDependencyType {
    match kind {
        WorkDepKind::Blocks => PlanDependencyType::Blocks,
        WorkDepKind::ParentChild => PlanDependencyType::ParentChild,
        WorkDepKind::Related => PlanDependencyType::Related,
        WorkDepKind::DiscoveredFrom => PlanDependencyType::DiscoveredFrom,
        WorkDepKind::Supersedes => PlanDependencyType::Supersedes,
    }
}

/// One item, or a refusal naming it — the `bd show` replacement.
pub async fn show_issue(ledger: &Ledger, id: &str) -> Result<IssueSummary, Failure> {
    let id_owned = id.to_owned();
    let snapshot = on_ledger(ledger, move |l| l.work_item(&id_owned)).await?;
    snapshot
        .map(|s| issue_of(&s))
        .ok_or_else(|| Failure::invalid(format!("work item {id:?} does not exist")))
}

/// Exact-id summaries; absent ids are absent from the result.
pub async fn list_issues(ledger: &Ledger, ids: &[String]) -> Result<Vec<IssueSummary>, Failure> {
    let ids = ids.to_vec();
    let snapshots = on_ledger(ledger, move |l| l.work_items(&ids)).await?;
    Ok(snapshots.iter().map(issue_of).collect())
}

/// Exact-id summaries matching every populated SQL predicate; absent and
/// nonmatching ids are absent from the result.
pub async fn list_issues_filtered(
    ledger: &Ledger,
    ids: &[String],
    filters: WorkItemFilters,
) -> Result<Vec<IssueSummary>, Failure> {
    let ids = ids.to_vec();
    let snapshots = on_ledger(ledger, move |l| l.filtered_work_items_by_id(&ids, filters)).await?;
    Ok(snapshots.iter().map(issue_of).collect())
}

/// Hydrated plan rows for exact ids; every requested id must exist, exactly
/// as the bd hydrate refused an omitted selection.
pub async fn plan_issues(ledger: &Ledger, ids: &[String]) -> Result<Vec<PlanIssue>, Failure> {
    let ids_owned = ids.to_vec();
    let snapshot = on_ledger(ledger, move |l| l.work_plan_snapshot(&ids_owned, None)).await?;
    if snapshot.exact.len() != ids.len() {
        let found: BTreeSet<&str> = snapshot
            .exact
            .iter()
            .map(|row| row.item.work_id.as_str())
            .collect();
        let missing = ids
            .iter()
            .find(|id| !found.contains(id.as_str()))
            .expect("a short exact snapshot omits an id");
        return Err(Failure::invalid(format!(
            "work item {missing:?} does not exist"
        )));
    }
    Ok(snapshot.exact.into_iter().map(plan_row_of).collect())
}

/// Hydrate one plan row for a caller that already selected a single id.
pub async fn plan_issue(ledger: &Ledger, id: &str) -> Result<PlanIssue, Failure> {
    let issue = show_issue(ledger, id).await?;
    let id_owned = id.to_owned();
    let deps = on_ledger(ledger, move |l| l.work_dependencies(&id_owned)).await?;
    Ok(plan_issue_of(issue, deps))
}

fn plan_row_of(row: WorkPlanRow) -> PlanIssue {
    plan_issue_of(issue_of(&row.item), row.dependencies)
}

fn plan_issue_of(issue: IssueSummary, deps: Vec<WorkDependencyStatus>) -> PlanIssue {
    let mut parent = None;
    let mut dependencies = Vec::new();
    for dep in deps {
        if dep.kind == WorkDepKind::ParentChild && parent.is_none() {
            parent = Some(dep.id.clone());
        }
        dependencies.push(PlanDependency {
            id: dep.id,
            dependency_type: dep_type_of(dep.kind),
            status: dep.status.map(dep_status_of),
        });
    }
    PlanIssue {
        issue,
        parent,
        dependencies,
    }
}

/// The ready frontier.
pub async fn ready_issues(ledger: &Ledger) -> Result<Vec<IssueSummary>, Failure> {
    let snapshots = on_ledger(ledger, |l| l.ready_work_items()).await?;
    Ok(snapshots.iter().map(issue_of).collect())
}

/// An epic's native children (items carrying a `parent-child` edge to it).
pub async fn epic_children(ledger: &Ledger, epic: &str) -> Result<Vec<IssueSummary>, Failure> {
    let epic = epic.to_owned();
    let snapshots = on_ledger(ledger, move |l| l.work_epic_children(&epic)).await?;
    Ok(snapshots.iter().map(issue_of).collect())
}

/// An epic's inventory: native parent-linked children unioned with the
/// legacy epic-depends-on-children encoding (the epic's own outgoing edges),
/// plus the set of ids present ONLY through the legacy encoding — the same
/// contract the bd read gave the epic pass.
pub async fn epic_children_with_legacy(
    ledger: &Ledger,
    epic: &str,
) -> Result<(Vec<IssueSummary>, BTreeSet<String>), Failure> {
    let native = epic_children(ledger, epic).await?;
    let mut children: BTreeMap<String, IssueSummary> = native
        .into_iter()
        .map(|issue| (issue.id.clone(), issue))
        .collect();
    let native_ids: BTreeSet<String> = children.keys().cloned().collect();
    let epic_owned = epic.to_owned();
    let outgoing = on_ledger(ledger, move |l| l.work_deps_of(&epic_owned)).await?;
    let mut legacy = BTreeSet::new();
    for edge in outgoing {
        if edge.to_id == epic {
            continue;
        }
        if !native_ids.contains(&edge.to_id) {
            if let Ok(issue) = show_issue(ledger, &edge.to_id).await {
                legacy.insert(edge.to_id.clone());
                children.entry(edge.to_id).or_insert(issue);
            }
        }
    }
    Ok((children.into_values().collect(), legacy))
}

/// The ready frontier restricted to one frozen epic: native ready children,
/// unioned with exactly the frozen legacy members whose hydrated facts prove
/// them ready.
pub async fn ready_frozen_epic_children(
    ledger: &Ledger,
    epic: &str,
    legacy_non_parent: &[String],
) -> Result<Vec<IssueSummary>, Failure> {
    let epic_owned = epic.to_owned();
    let children = on_ledger(ledger, move |l| l.work_epic_children(&epic_owned)).await?;
    let ready_ids: BTreeSet<String> = on_ledger(ledger, |l| l.ready_work_items())
        .await?
        .into_iter()
        .map(|s| s.work_id)
        .collect();
    let mut ready: BTreeMap<String, IssueSummary> = children
        .iter()
        .filter(|c| ready_ids.contains(&c.work_id))
        .map(|c| (c.work_id.clone(), issue_of(c)))
        .collect();
    for row in plan_issues(ledger, legacy_non_parent).await? {
        if row.parent.is_none() && row.readiness() == PlanReadiness::Ready {
            ready.entry(row.issue.id.clone()).or_insert(row.issue);
        }
    }
    Ok(ready.into_values().collect())
}

/// Close a work item with a recorded reason (idempotent for an
/// already-closed one).
pub async fn close_issue(
    ledger: &Ledger,
    id: &str,
    actor: &str,
    reason: &str,
) -> Result<IssueSummary, Failure> {
    let id = id.to_owned();
    let actor = actor.to_owned();
    let reason = reason.to_owned();
    let snapshot = on_ledger(ledger, move |l| l.close_work_item(&id, &actor, &reason)).await?;
    Ok(issue_of(&snapshot))
}

/// Close-and-release as one guarded CAS (stale own custody released; foreign
/// custody refuses).
pub async fn close_held_issue(
    ledger: &Ledger,
    id: &str,
    holder: &str,
) -> Result<IssueSummary, Failure> {
    let id = id.to_owned();
    let holder = holder.to_owned();
    let snapshot = on_ledger(ledger, move |l| l.close_held_work_item(&id, &holder)).await?;
    Ok(issue_of(&snapshot))
}

/// Release custody of a non-closed item.
pub async fn release_issue(
    ledger: &Ledger,
    id: &str,
    actor: &str,
) -> Result<IssueSummary, Failure> {
    let id = id.to_owned();
    let actor = actor.to_owned();
    let snapshot = on_ledger(ledger, move |l| l.release_work_item(&id, &actor)).await?;
    Ok(issue_of(&snapshot))
}

/// Terminal-run settlement release; refuses a closed item (the preserved
/// adjudicated guard).
pub async fn release_unresolved_issue(
    ledger: &Ledger,
    id: &str,
    actor: &str,
    blocked: bool,
) -> Result<IssueSummary, Failure> {
    let id = id.to_owned();
    let actor = actor.to_owned();
    let snapshot = on_ledger(ledger, move |l| {
        l.release_unresolved_work_item(&id, &actor, blocked)
    })
    .await?;
    Ok(issue_of(&snapshot))
}

/// Reopen: status `Open` from any status, custody untouched. Deferred work
/// requires the operator's resume reason so the matching typed decision can
/// land in the same coordination transaction.
pub async fn reopen_issue(
    ledger: &Ledger,
    id: &str,
    actor: &str,
    reason: Option<&str>,
) -> Result<IssueSummary, Failure> {
    let id = id.to_owned();
    let actor = actor.to_owned();
    let reason = reason.map(str::to_owned);
    let snapshot = on_ledger(ledger, move |l| {
        l.reopen_work_item(&id, &actor, reason.as_deref())
    })
    .await?;
    Ok(issue_of(&snapshot))
}

/// The blocked-residue retake: custody of an unassigned open/blocked item,
/// pinned to the exact status the caller observed (bd's `--if-status`).
pub async fn assign_unassigned_issue(
    ledger: &Ledger,
    id: &str,
    holder: &str,
    expected_status: &str,
) -> Result<IssueSummary, Failure> {
    let expected = match expected_status {
        "open" => WorkStatus::Open,
        "blocked" => WorkStatus::Blocked,
        other => {
            return Err(Failure::invalid(format!(
                "{}{other}",
                forged_ledger::WORK_CLAIM_REFUSAL_PREFIX
            )))
        }
    };
    let id = id.to_owned();
    let holder = holder.to_owned();
    let snapshot = on_ledger(ledger, move |l| {
        l.assign_unassigned_work_item(&id, &holder, expected)
    })
    .await?;
    Ok(issue_of(&snapshot))
}

/// Whether a settlement note carrying `marker` exists for `run_id` — the
/// convergence probe replacing the bd comment-marker read.
pub async fn settlement_note_present(
    ledger: &Ledger,
    run_id: &str,
    marker: &str,
) -> Result<bool, Failure> {
    let run_id = run_id.to_owned();
    let marker = marker.to_owned();
    on_ledger(ledger, move |l| {
        // By kind, not by run page: settled notes are globally rare, and a
        // run past the first page of its own events must still converge.
        let events = l.list_events_by_kind("work.settled.note")?;
        Ok(events.iter().any(|event| {
            event.run_id.as_deref() == Some(run_id.as_str())
                && serde_json::from_str::<serde_json::Value>(&event.payload_json)
                    .ok()
                    .and_then(|payload| {
                        payload
                            .get("marker")
                            .and_then(|m| m.as_str())
                            .map(|m| m == marker)
                    })
                    .unwrap_or(false)
        }))
    })
    .await
}

/// The planning run's guarded apply: blocked stub, empty custody, one
/// transaction, stub promoted to `Open` — the exact bd contract with the
/// read-back dance replaced by atomicity. Title is preserved from the
/// current revision (the bd apply never wrote titles either).
pub async fn apply_native_spec_to_blocked_stub(
    ledger: &Ledger,
    id: &str,
    actor: &str,
    update: &NativeSpecUpdate,
) -> Result<IssueSummary, Failure> {
    let current = show_issue(ledger, id).await?;
    let id_owned = id.to_owned();
    let actor = actor.to_owned();
    let spec = WorkSpecFields {
        title: current.title,
        description: update.description.clone(),
        acceptance_criteria: update.acceptance_criteria.clone(),
        design: update.design.clone(),
        notes: update.notes.clone(),
    };
    let snapshot = on_ledger(ledger, move |l| {
        l.apply_work_planning_spec(&id_owned, &actor, spec)
    })
    .await?;
    Ok(issue_of(&snapshot))
}

// ------------------------------------------------------------------ leases

/// The default lease TTL, preserved from the bd era.
pub const LEASE_TTL_S: u64 = WORK_LEASE_TTL_S;

/// Claim a specific item for `holder` (same-holder re-claim renews).
pub async fn claim_specific(
    ledger: &Ledger,
    id: &str,
    holder: &str,
) -> Result<IssueSummary, Failure> {
    let id = id.to_owned();
    let holder = holder.to_owned();
    let snapshot = on_ledger(ledger, move |l| {
        l.claim_specific_work(&id, &holder, LEASE_TTL_S)
    })
    .await?;
    Ok(issue_of(&snapshot))
}

/// Claim the next ready item; `Ok(None)` on an empty frontier.
pub async fn claim_ready(ledger: &Ledger, holder: &str) -> Result<Option<IssueSummary>, Failure> {
    let holder = holder.to_owned();
    let snapshot = on_ledger(ledger, move |l| l.claim_ready_work(&holder, LEASE_TTL_S)).await?;
    Ok(snapshot.map(|s| issue_of(&s)))
}

/// The current holder of record; `Ok(None)` when unheld.
pub async fn lease_holder(ledger: &Ledger, id: &str) -> Result<Option<String>, Failure> {
    let id = id.to_owned();
    on_ledger(ledger, move |l| l.work_lease_holder(&id)).await
}

/// Scoped reclaim; `Ok(None)` is the no-op refusal shape (unexpired lease,
/// different holder, or no custody), `Ok(Some(previous_owner))` fired.
pub async fn reclaim(
    ledger: &Ledger,
    id: &str,
    previous_holder: &str,
    older_than_s: u64,
) -> Result<Option<String>, Failure> {
    let id = id.to_owned();
    let previous_holder = previous_holder.to_owned();
    let outcome = on_ledger(ledger, move |l| {
        l.reclaim_work_lease(&id, &previous_holder, older_than_s)
    })
    .await?;
    Ok(outcome.previous_owner)
}

// ------------------------------------------------------------- inventories

/// The live-plan inventory: non-closed items, optionally filtered to one
/// `repository` metadata value, priority-ordered, bounded by `limit` with a
/// truncation flag — the bd N+1 discovery collapsed into one exact read.
pub async fn plan_inventory(
    ledger: &Ledger,
    filters: WorkItemFilters,
    limit: usize,
) -> Result<crate::core::work_types::PlanInventory, Failure> {
    if limit == 0 {
        return Err(Failure::invalid("plan inventory limit must be positive"));
    }
    let snapshot = on_ledger(ledger, move |l| l.work_plan_snapshot(&[], Some(filters))).await?;
    let discovered = snapshot.matching.len().min(limit.saturating_add(1));
    let truncated = snapshot.matching.len() > limit;
    let issues = snapshot
        .matching
        .into_iter()
        .take(limit)
        .map(plan_row_of)
        .collect();
    Ok(crate::core::work_types::PlanInventory {
        issues,
        truncated,
        discovered,
    })
}

/// The Work Map's bounded plan read: live plan nodes for the scope plus the
/// exact rows the durable classifier asked for. Exact ids missing from the
/// store remain absent, exactly as the bd union hydrate allowed.
pub async fn work_map_plan_inventory(
    ledger: &Ledger,
    scope: &crate::core::work_types::WorkMapPlanScope,
    exact_ids: &[String],
    limit: usize,
) -> Result<crate::core::work_types::WorkMapPlanInventory, Failure> {
    use crate::core::work_types::WorkMapPlanScope;
    if limit == 0 {
        return Err(Failure::invalid("work map plan limit must be positive"));
    }
    if exact_ids.iter().any(|id| id.trim().is_empty()) {
        return Err(Failure::invalid("work map exact ids must be non-empty"));
    }
    if matches!(
        scope,
        WorkMapPlanScope::Operator | WorkMapPlanScope::Repository(_)
    ) {
        let filters = WorkItemFilters {
            repository: match scope {
                WorkMapPlanScope::Repository(value) => Some(value.clone()),
                _ => None,
            },
            ..WorkItemFilters::default()
        };
        let ids = exact_ids.to_vec();
        let snapshot =
            on_ledger(ledger, move |l| l.work_plan_snapshot(&ids, Some(filters))).await?;
        let discovered = snapshot.matching.len().min(limit.saturating_add(1));
        let truncated = snapshot.matching.len() > limit;
        let selected: Vec<WorkPlanRow> = snapshot.matching.into_iter().take(limit).collect();
        let issues = selected.iter().cloned().map(plan_row_of).collect();
        let mut seen = BTreeSet::new();
        let mut exact_issues = Vec::new();
        for row in selected.iter().chain(snapshot.exact.iter()) {
            if seen.insert(row.item.work_id.clone()) {
                exact_issues.push(issue_of(&row.item));
            }
        }
        return Ok(crate::core::work_types::WorkMapPlanInventory {
            issues,
            exact_issues,
            truncated,
            discovered,
        });
    }

    let live = |s: &WorkStatus| *s != WorkStatus::Closed;
    let (selected_plan_ids, discovered, truncated) = match scope {
        WorkMapPlanScope::Operator | WorkMapPlanScope::Repository(_) => unreachable!("returned"),
        WorkMapPlanScope::Epic(epic) => {
            if epic.trim().is_empty() {
                return Err(Failure::invalid("epic id must be non-empty"));
            }
            let discovery_limit = limit.saturating_add(1);
            let root = show_issue(ledger, epic).await?;
            let mut ids = Vec::new();
            let mut seen = BTreeSet::new();
            let is_live = |status: &str| status != "closed";
            if is_live(&root.status) && seen.insert(epic.clone()) {
                ids.push(epic.clone());
            }
            // The legacy epic-depends-on-children encoding: the epic's own
            // outgoing edges, live targets only.
            let epic_owned = epic.clone();
            let outgoing = on_ledger(ledger, move |l| l.work_dependencies(&epic_owned)).await?;
            for dep in outgoing {
                if ids.len() >= discovery_limit {
                    break;
                }
                let live_target = dep
                    .status
                    .is_some_and(|status| status != WorkStatus::Closed);
                if dep.id != *epic && live_target && seen.insert(dep.id.clone()) {
                    ids.push(dep.id.clone());
                }
            }
            // Native parent-linked children.
            let epic_owned = epic.clone();
            let children = on_ledger(ledger, move |l| l.work_epic_children(&epic_owned)).await?;
            for child in children {
                if ids.len() >= discovery_limit {
                    break;
                }
                if live(&child.status) && seen.insert(child.work_id.clone()) {
                    ids.push(child.work_id.clone());
                }
            }
            let discovered = ids.len();
            let truncated = discovered > limit;
            ids.truncate(limit);
            (ids, discovered, truncated)
        }
    };

    let mut requested: BTreeSet<String> = selected_plan_ids.iter().cloned().collect();
    let mut union: Vec<String> = selected_plan_ids.clone();
    for id in exact_ids {
        if requested.insert(id.clone()) {
            union.push(id.clone());
        }
    }
    let snapshot = on_ledger(ledger, move |l| l.work_plan_snapshot(&union, None)).await?;
    let issues = snapshot
        .exact
        .iter()
        .take(selected_plan_ids.len())
        .cloned()
        .map(plan_row_of)
        .collect();
    let exact_issues = snapshot
        .exact
        .iter()
        .map(|row| issue_of(&row.item))
        .collect();
    Ok(crate::core::work_types::WorkMapPlanInventory {
        issues,
        exact_issues,
        truncated,
        discovered,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use forged_ledger::{NewWorkItem, WorkKind, WorkRevisionCause};

    #[tokio::test]
    async fn two_hundred_item_inventory_matches_single_row_hydration_bytes() {
        let target_tmp = std::env::var_os("CARGO_TARGET_TMPDIR")
            .map(std::path::PathBuf::from)
            .unwrap_or_else(|| {
                std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../target/tmp")
            });
        std::fs::create_dir_all(&target_tmp).expect("target temp root");
        let dir = tempfile::Builder::new()
            .prefix("forged-plan-snapshot-")
            .tempdir_in(target_tmp)
            .expect("target tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let ids: Vec<String> = (0..200).map(|index| format!("plan-{index:03}")).collect();
        for (index, id) in ids.iter().enumerate() {
            ledger
                .create_work_item(NewWorkItem {
                    work_id: id.clone(),
                    kind: WorkKind::Task,
                    status: WorkStatus::Open,
                    priority: Some(index as i64),
                    metadata: BTreeMap::from([(
                        "repository".to_owned(),
                        "/repo/plan-snapshot".to_owned(),
                    )]),
                    spec: WorkSpecFields {
                        title: format!("Plan item {index}"),
                        description: format!("description {index}"),
                        acceptance_criteria: format!("acceptance {index}"),
                        design: format!("design {index}"),
                        notes: format!("notes {index}"),
                    },
                    cause: WorkRevisionCause::Authored,
                })
                .expect("create plan item");
            if index > 0 {
                ledger
                    .add_work_dep(id, &ids[index - 1], WorkDepKind::Related)
                    .expect("link plan item");
            }
        }

        let single = plan_issue(&ledger, ids.last().expect("last id"))
            .await
            .expect("single plan row");
        let batch = plan_issues(&ledger, &ids).await.expect("batch plan rows");
        assert_eq!(batch.len(), 200);
        assert_eq!(
            serde_json::to_vec(batch.last().expect("last batch row")).expect("batch bytes"),
            serde_json::to_vec(&single).expect("single bytes")
        );

        let inventory = plan_inventory(
            &ledger,
            WorkItemFilters {
                repository: Some("/repo/plan-snapshot".to_owned()),
                ..WorkItemFilters::default()
            },
            200,
        )
        .await
        .expect("bounded inventory");
        assert_eq!(inventory.discovered, 200);
        assert!(!inventory.truncated);
        assert_eq!(inventory.issues, batch);
        ledger.close().expect("close ledger");
    }
}
