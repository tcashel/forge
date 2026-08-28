//! `work_import_beads` — the one-shot atomic import of the operator's bd
//! store into the ledger-native work store.
//!
//! Discovery reads every issue id across all statuses, hydration batches
//! `bd show` for full fields plus dependencies, and the whole store lands in
//! ONE ledger transaction (empty-store guarded, so a re-run against a
//! populated store refuses instead of duplicating). After the write, every
//! snapshot is byte-compared against its bd source row — a mismatch fails
//! the operation loudly rather than leaving silent drift. The dolt store on
//! disk is never touched: it stays behind as a read-only archive.

use std::collections::BTreeMap;

use forged_beads::{IssueSummary, PlanDependencyType, PlanIssue};
use forged_ledger::{
    ImportedWorkItem, WorkDepKind, WorkDepRow, WorkItemSnapshot, WorkKind, WorkSpecFields,
    WorkStatus,
};
use forged_types::{OperationRequest, OperationResponse};
use serde_json::json;

use crate::core::{on_ledger, read_only, Ctx, Failure};

const HYDRATE_BATCH: usize = 50;

/// Provenance keys added to imported metadata. Original bd metadata keys are
/// transported verbatim; these are additive and namespaced to never collide
/// with the `repository`/gate keys forged consumes.
const META_BD_REVISION: &str = "imported:bd-revision";
const META_ISSUE_TYPE: &str = "imported:issue-type";
const META_SPEC_ID: &str = "imported:spec-id";

/// `work_import_beads` — idempotent by its one-shot guard: an already
/// populated store reports `alreadyImported: true` and writes nothing.
pub async fn work_import_beads(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("work_import_beads", req, || async {
        if !on_ledger(&ctx.ledger, |l| l.work_store_is_empty()).await? {
            return Ok(json!({
                "alreadyImported": true,
                "imported": 0,
                "edges": 0,
                "skippedEdges": 0,
            }));
        }
        let bd = ctx.config.bd_config();
        let ids = forged_beads::all_issue_ids(&bd)
            .await
            .map_err(Failure::from)?;
        let mut rows: Vec<PlanIssue> = Vec::with_capacity(ids.len());
        for batch in ids.chunks(HYDRATE_BATCH) {
            rows.extend(
                forged_beads::all_issues_with_deps(&bd, batch)
                    .await
                    .map_err(Failure::from)?,
            );
        }
        let mut items = Vec::with_capacity(rows.len());
        let mut edges = Vec::new();
        for row in &rows {
            items.push(imported_item(&row.issue)?);
            for dep in &row.dependencies {
                edges.push(WorkDepRow {
                    from_id: row.issue.id.clone(),
                    to_id: dep.id.clone(),
                    kind: dep_kind(dep.dependency_type),
                });
            }
            if let Some(parent) = &row.parent {
                edges.push(WorkDepRow {
                    from_id: row.issue.id.clone(),
                    to_id: parent.clone(),
                    kind: WorkDepKind::ParentChild,
                });
            }
        }
        let report = on_ledger(&ctx.ledger, move |l| l.import_work_store(items, edges)).await?;
        let mismatches = fidelity_mismatches(&rows, &report.snapshots);
        if !mismatches.is_empty() {
            return Err(Failure::invalid(format!(
                "import fidelity check failed for {}: {}",
                mismatches.len(),
                mismatches.join(", ")
            )));
        }
        Ok(json!({
            "alreadyImported": false,
            "imported": report.snapshots.len(),
            "edges": report.inserted_edges,
            "skippedEdges": report
                .skipped_edges
                .iter()
                .map(|e| format!("{}->{}", e.from_id, e.to_id))
                .collect::<Vec<_>>(),
            "verified": true,
        }))
    })
    .await
}

fn imported_item(issue: &IssueSummary) -> Result<ImportedWorkItem, Failure> {
    let status = match issue.status.as_str() {
        "open" => WorkStatus::Open,
        "in_progress" => WorkStatus::InProgress,
        "blocked" => WorkStatus::Blocked,
        "deferred" => WorkStatus::Deferred,
        "closed" => WorkStatus::Closed,
        other => {
            return Err(Failure::invalid(format!(
                "issue {} carries unknown status {other:?}; fix it in bd and re-run",
                issue.id
            )));
        }
    };
    let kind = if issue.issue_type == "epic" {
        WorkKind::Epic
    } else {
        WorkKind::Task
    };
    let mut metadata: BTreeMap<String, String> = issue.metadata.clone();
    if let Some(revision) = &issue.revision {
        metadata.insert(META_BD_REVISION.to_string(), revision.clone());
    }
    if issue.issue_type != "epic" && issue.issue_type != "task" {
        metadata.insert(META_ISSUE_TYPE.to_string(), issue.issue_type.clone());
    }
    if let Some(spec_id) = &issue.spec_id {
        metadata.insert(META_SPEC_ID.to_string(), spec_id.clone());
    }
    Ok(ImportedWorkItem {
        work_id: issue.id.clone(),
        kind,
        status,
        priority: issue.priority,
        assignee: issue.assignee.clone().filter(|a| !a.is_empty()),
        metadata,
        spec: WorkSpecFields {
            // bd allows an empty title; the store requires one, and a
            // placeholder is honest about what was there.
            title: if issue.title.trim().is_empty() {
                format!("(untitled {})", issue.id)
            } else {
                issue.title.clone()
            },
            description: issue.description.clone(),
            acceptance_criteria: issue.acceptance_criteria.clone(),
            design: issue.design.clone(),
            notes: issue.notes.clone(),
        },
    })
}

fn dep_kind(kind: PlanDependencyType) -> WorkDepKind {
    match kind {
        PlanDependencyType::Blocks => WorkDepKind::Blocks,
        PlanDependencyType::ParentChild => WorkDepKind::ParentChild,
        PlanDependencyType::Related => WorkDepKind::Related,
        PlanDependencyType::DiscoveredFrom => WorkDepKind::DiscoveredFrom,
        PlanDependencyType::Supersedes => WorkDepKind::Supersedes,
    }
}

/// Byte-compare each snapshot's spec fields and coordination state against
/// its bd source. `rows` and `snapshots` are in the same order by
/// construction (`import_work_store` returns input order).
fn fidelity_mismatches(rows: &[PlanIssue], snapshots: &[WorkItemSnapshot]) -> Vec<String> {
    let mut out = Vec::new();
    for (row, snap) in rows.iter().zip(snapshots) {
        let issue = &row.issue;
        let title_ok = snap.spec.title == issue.title
            || (issue.title.trim().is_empty()
                && snap.spec.title == format!("(untitled {})", issue.id));
        let ok = snap.work_id == issue.id
            && title_ok
            && snap.spec.description == issue.description
            && snap.spec.acceptance_criteria == issue.acceptance_criteria
            && snap.spec.design == issue.design
            && snap.spec.notes == issue.notes
            && snap.status.as_str() == issue.status
            && snap.priority == issue.priority
            && snap.assignee == issue.assignee.clone().filter(|a| !a.is_empty());
        if !ok {
            out.push(issue.id.clone());
        }
    }
    if rows.len() != snapshots.len() {
        out.push(format!(
            "count mismatch: {} hydrated vs {} imported",
            rows.len(),
            snapshots.len()
        ));
    }
    out
}
