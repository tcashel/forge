//! The ledger-native work store: items, append-only spec revisions, and
//! dependency edges.
//!
//! Spec content is append-only: a guarded write inserts revision N+1 iff
//! `current_revision` is N and moves the pointer in the same transaction, so
//! the CAS is structural and a pinned revision always dereferences to its
//! exact bytes. Coordination state (status, custody, priority, metadata,
//! leases) mutates in place and NEVER mints a revision.
//!
//! The semantic verbs preserve the operator-adjudicated bd behaviors they
//! replace: a blocked item refuses a claim, an unassigned blocked residue is
//! retakeable, a closed item refuses reopening from terminal run settlement,
//! and the planning apply is guarded by empty custody + blocked status + the
//! revision CAS.

use std::collections::BTreeMap;

use forged_types::ErrorCode;
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{column_decode_error, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;

/// The stable refusal prefix for a claim refused on mechanism (not
/// contention) — the bd-era spelling VERBATIM, because durable retry rows
/// already store it in `last_error` and the classifier matches history and
/// new refusals with one vocabulary.
pub const WORK_CLAIM_REFUSAL_PREFIX: &str = "issue not claimable: status ";

/// The blocked-claim refusal message, stable for classification.
pub const WORK_BLOCKED_CLAIM_REFUSAL: &str = "issue not claimable: status blocked";

/// Work item kind — the closed vocabulary forged schedules.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkKind {
    /// A schedulable slice.
    Task,
    /// A parent whose children are the schedulable slices.
    Epic,
}

impl WorkKind {
    /// The stored spelling.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Task => "task",
            Self::Epic => "epic",
        }
    }

    fn decode(idx: usize, value: &str) -> Result<Self, rusqlite::Error> {
        match value {
            "task" => Ok(Self::Task),
            "epic" => Ok(Self::Epic),
            other => Err(column_decode_error(idx, "work kind", other)),
        }
    }
}

/// Work item status. `InProgress` means claimed: custody (`assignee`) is the
/// holder of record and the lease row carries the expiry clock.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkStatus {
    /// Schedulable once unblocked.
    Open,
    /// Claimed by the current assignee.
    InProgress,
    /// Deliberately not schedulable.
    Blocked,
    /// Parked by the operator; not schedulable, not terminal.
    Deferred,
    /// Terminal.
    Closed,
}

impl WorkStatus {
    /// The stored spelling.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Open => "open",
            Self::InProgress => "in_progress",
            Self::Blocked => "blocked",
            Self::Deferred => "deferred",
            Self::Closed => "closed",
        }
    }

    fn decode(idx: usize, value: &str) -> Result<Self, rusqlite::Error> {
        match value {
            "open" => Ok(Self::Open),
            "in_progress" => Ok(Self::InProgress),
            "blocked" => Ok(Self::Blocked),
            "deferred" => Ok(Self::Deferred),
            "closed" => Ok(Self::Closed),
            other => Err(column_decode_error(idx, "work status", other)),
        }
    }
}

/// Dependency edge kinds: the closed, operator-adjudicated bd 1.2.1 subset.
/// Only `Blocks` affects scheduling readiness.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkDepKind {
    /// A hard scheduling prerequisite.
    Blocks,
    /// A structural child-to-parent edge.
    ParentChild,
    /// A non-scheduling contextual link.
    Related,
    /// A non-scheduling provenance link.
    DiscoveredFrom,
    /// A non-scheduling provenance link from a replacement to what it
    /// replaced.
    Supersedes,
}

impl WorkDepKind {
    /// The stored spelling.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Blocks => "blocks",
            Self::ParentChild => "parent-child",
            Self::Related => "related",
            Self::DiscoveredFrom => "discovered-from",
            Self::Supersedes => "supersedes",
        }
    }

    fn decode(idx: usize, value: &str) -> Result<Self, rusqlite::Error> {
        match value {
            "blocks" => Ok(Self::Blocks),
            "parent-child" => Ok(Self::ParentChild),
            "related" => Ok(Self::Related),
            "discovered-from" => Ok(Self::DiscoveredFrom),
            "supersedes" => Ok(Self::Supersedes),
            other => Err(column_decode_error(idx, "work dependency kind", other)),
        }
    }
}

/// Why a spec revision was minted.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkRevisionCause {
    /// Written through the authoring surface.
    Authored,
    /// Written by a planning run's guarded apply.
    PlanningApply,
    /// A revert minting N+1 as a copy of an earlier revision.
    Revert,
    /// The one-shot beads import.
    Import,
}

impl WorkRevisionCause {
    /// The stored spelling.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Authored => "authored",
            Self::PlanningApply => "planning-apply",
            Self::Revert => "revert",
            Self::Import => "import",
        }
    }
}

/// The rendered-body inputs — the append-only half of a work item.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkSpecFields {
    /// Human-readable title.
    pub title: String,
    /// Context and exact outcome.
    pub description: String,
    /// Observable completion contract.
    pub acceptance_criteria: String,
    /// Necessary implementation constraints.
    pub design: String,
    /// Instructions and explicit non-goals for the executing agent.
    pub notes: String,
}

/// A complete current view of one work item: coordination state joined with
/// the current spec revision.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkItemSnapshot {
    /// Stable id (imported bd ids kept verbatim).
    pub work_id: String,
    /// Item kind.
    pub kind: WorkKind,
    /// Current status.
    pub status: WorkStatus,
    /// Native numeric scheduling priority; `None` defers fail-closed.
    pub priority: Option<i64>,
    /// Custody: the holder of record, when any.
    pub assignee: Option<String>,
    /// Transported (never interpreted) string metadata.
    pub metadata: BTreeMap<String, String>,
    /// Current spec revision number — moves ONLY on spec-field writes.
    pub revision: i64,
    /// The current revision's spec fields.
    pub spec: WorkSpecFields,
    /// Row creation stamp.
    pub created_at: String,
    /// Last coordination-state change stamp.
    pub updated_at: String,
}

/// A dependency edge.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkDepRow {
    /// The dependent item.
    pub from_id: String,
    /// The dependency target.
    pub to_id: String,
    /// Edge kind.
    pub kind: WorkDepKind,
}

/// One hydrated dependency: the edge plus the target's current status, or
/// `None` when the target row is absent (a dangling imported edge).
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkDependencyStatus {
    /// The dependency target id.
    pub id: String,
    /// Edge kind.
    pub kind: WorkDepKind,
    /// The target's current status when its row exists.
    pub status: Option<WorkStatus>,
}

/// Input for creating a work item. `status` admits only the authorable
/// states: `Open` or `Blocked` (claimed and terminal states are reached
/// through their verbs, never authored).
#[derive(Debug, Clone)]
pub struct NewWorkItem {
    /// Caller-supplied stable id.
    pub work_id: String,
    /// Item kind.
    pub kind: WorkKind,
    /// `Open` or `Blocked`.
    pub status: WorkStatus,
    /// Scheduling priority.
    pub priority: Option<i64>,
    /// Transported string metadata.
    pub metadata: BTreeMap<String, String>,
    /// Revision-1 spec fields.
    pub spec: WorkSpecFields,
    /// Why revision 1 exists (`Authored` or `Import`).
    pub cause: WorkRevisionCause,
}

/// The importer's input: full imported state, any status, optional custody.
#[derive(Debug, Clone)]
pub struct ImportedWorkItem {
    /// The bd id, kept verbatim.
    pub work_id: String,
    /// Item kind.
    pub kind: WorkKind,
    /// Imported status, any of the five.
    pub status: WorkStatus,
    /// Scheduling priority.
    pub priority: Option<i64>,
    /// Imported custody (no lease row is created for it).
    pub assignee: Option<String>,
    /// Transported string metadata.
    pub metadata: BTreeMap<String, String>,
    /// Revision-1 spec fields.
    pub spec: WorkSpecFields,
}

/// What one atomic import inserted.
#[derive(Debug, Clone)]
pub struct WorkImportReport {
    /// Snapshots in input order, for the caller's byte-fidelity check.
    pub snapshots: Vec<WorkItemSnapshot>,
    /// Edges inserted.
    pub inserted_edges: u64,
    /// Edges skipped because an endpoint was outside the batch.
    pub skipped_edges: Vec<WorkDepRow>,
}

fn decode_metadata(idx: usize, raw: &str) -> Result<BTreeMap<String, String>, rusqlite::Error> {
    let value: serde_json::Value =
        serde_json::from_str(raw).map_err(|_| column_decode_error(idx, "work metadata", raw))?;
    let serde_json::Value::Object(map) = value else {
        return Err(column_decode_error(idx, "work metadata", raw));
    };
    let mut out = BTreeMap::new();
    for (k, v) in map {
        let text = match v {
            serde_json::Value::String(s) => s,
            other => other.to_string(),
        };
        out.insert(k, text);
    }
    Ok(out)
}

const SNAPSHOT_SQL: &str = "SELECT wi.work_id, wi.kind, wi.status, wi.priority, wi.assignee, \
     wi.metadata_json, wi.current_revision, wr.title, wr.description, \
     wr.acceptance_criteria, wr.design, wr.notes, wi.created_at, wi.updated_at \
     FROM work_items wi \
     JOIN work_revisions wr \
       ON wr.work_id = wi.work_id AND wr.revision = wi.current_revision";

fn snapshot_from_row(row: &rusqlite::Row<'_>) -> Result<WorkItemSnapshot, rusqlite::Error> {
    let kind: String = row.get(1)?;
    let status: String = row.get(2)?;
    let metadata: String = row.get(5)?;
    Ok(WorkItemSnapshot {
        work_id: row.get(0)?,
        kind: WorkKind::decode(1, &kind)?,
        status: WorkStatus::decode(2, &status)?,
        priority: row.get(3)?,
        assignee: row.get(4)?,
        metadata: decode_metadata(5, &metadata)?,
        revision: row.get(6)?,
        spec: WorkSpecFields {
            title: row.get(7)?,
            description: row.get(8)?,
            acceptance_criteria: row.get(9)?,
            design: row.get(10)?,
            notes: row.get(11)?,
        },
        created_at: row.get(12)?,
        updated_at: row.get(13)?,
    })
}

pub(crate) fn snapshot_tx(
    conn: &Connection,
    work_id: &str,
) -> Result<Option<WorkItemSnapshot>, LedgerError> {
    Ok(conn
        .query_row(
            &format!("{SNAPSHOT_SQL} WHERE wi.work_id = ?1"),
            [work_id],
            snapshot_from_row,
        )
        .optional()?)
}

fn require_snapshot_tx(conn: &Connection, work_id: &str) -> Result<WorkItemSnapshot, LedgerError> {
    snapshot_tx(conn, work_id)?.ok_or_else(|| {
        refused(
            ErrorCode::InvalidRequest,
            format!("work item {work_id:?} does not exist"),
        )
    })
}

fn insert_revision_tx(
    conn: &Connection,
    work_id: &str,
    revision: i64,
    spec: &WorkSpecFields,
    cause: WorkRevisionCause,
) -> Result<(), LedgerError> {
    conn.execute(
        "INSERT INTO work_revisions \
         (work_id, revision, title, description, acceptance_criteria, design, notes, \
          cause, written_at) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        rusqlite::params![
            work_id,
            revision,
            spec.title,
            spec.description,
            spec.acceptance_criteria,
            spec.design,
            spec.notes,
            cause.as_str(),
            now_iso(),
        ],
    )?;
    Ok(())
}

/// Update coordination state and stamp `updated_at`; a spec revision is
/// deliberately NOT minted here.
fn set_coordination_tx(
    conn: &Connection,
    work_id: &str,
    status: WorkStatus,
    assignee: Option<&str>,
) -> Result<(), LedgerError> {
    conn.execute(
        "UPDATE work_items SET status = ?2, assignee = ?3, updated_at = ?4 \
         WHERE work_id = ?1",
        rusqlite::params![work_id, status.as_str(), assignee, now_iso()],
    )?;
    Ok(())
}

pub(crate) fn clear_lease_tx(conn: &Connection, work_id: &str) -> Result<(), LedgerError> {
    conn.execute("DELETE FROM work_leases WHERE work_id = ?1", [work_id])?;
    Ok(())
}

fn coordination_event_tx(
    conn: &Connection,
    work_id: &str,
    verb: &str,
    before: &WorkItemSnapshot,
    status: WorkStatus,
    assignee: Option<&str>,
    actor: &str,
) -> Result<(), LedgerError> {
    append_event_tx(
        conn,
        None,
        "work.updated",
        &json!({
            "workId": work_id,
            "verb": verb,
            "actor": actor,
            "status": { "from": before.status, "to": status },
            "assignee": { "from": before.assignee, "to": assignee },
        }),
    )
}

impl Ledger {
    /// Create a work item with its revision-1 spec. A duplicate id refuses;
    /// an authored status outside `Open`/`Blocked` refuses.
    pub fn create_work_item(&self, new: NewWorkItem) -> Result<WorkItemSnapshot, LedgerError> {
        self.submit(move |conn| {
            if !matches!(new.status, WorkStatus::Open | WorkStatus::Blocked) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "work item {:?} cannot be created as {}",
                        new.work_id,
                        new.status.as_str()
                    ),
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            if snapshot_tx(&tx, &new.work_id)?.is_some() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("work item {:?} already exists", new.work_id),
                ));
            }
            let metadata_json = serde_json::to_string(&new.metadata)?;
            let now = now_iso();
            tx.execute(
                "INSERT INTO work_items \
                 (work_id, kind, status, priority, assignee, metadata_json, \
                  current_revision, created_at, updated_at) \
                 VALUES (?1, ?2, ?3, ?4, NULL, ?5, 1, ?6, ?6)",
                rusqlite::params![
                    new.work_id,
                    new.kind.as_str(),
                    new.status.as_str(),
                    new.priority,
                    metadata_json,
                    now,
                ],
            )?;
            insert_revision_tx(&tx, &new.work_id, 1, &new.spec, new.cause)?;
            append_event_tx(
                &tx,
                None,
                "work.created",
                &json!({
                    "workId": new.work_id,
                    "kind": new.kind,
                    "status": new.status,
                    "cause": new.cause,
                }),
            )?;
            let snapshot = require_snapshot_tx(&tx, &new.work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// The importer's one narrow door, atomic for the whole store: refuses
    /// unless the work store is completely empty, then inserts every item
    /// (ANY status, optional custody, NO lease row — custody without a lease
    /// reads as long-expired, so the scoped reclaim can always free imported
    /// residue), every revision-1 spec with cause `Import`, and every edge,
    /// in ONE transaction. An edge naming an id outside the batch is skipped
    /// and counted, never a partial failure. Returns the snapshots in input
    /// order for the caller's byte-fidelity check.
    pub fn import_work_store(
        &self,
        items: Vec<ImportedWorkItem>,
        edges: Vec<WorkDepRow>,
    ) -> Result<WorkImportReport, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let count: i64 = tx.query_row("SELECT COUNT(*) FROM work_items", [], |r| r.get(0))?;
            if count != 0 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("work store already holds {count} items; import is one-shot"),
                ));
            }
            let ids: std::collections::BTreeSet<String> =
                items.iter().map(|i| i.work_id.clone()).collect();
            if ids.len() != items.len() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "import batch contains duplicate work ids".to_string(),
                ));
            }
            let now = now_iso();
            let mut snapshots = Vec::with_capacity(items.len());
            for item in &items {
                let metadata_json = serde_json::to_string(&item.metadata)?;
                tx.execute(
                    "INSERT INTO work_items \
                     (work_id, kind, status, priority, assignee, metadata_json, \
                      current_revision, created_at, updated_at) \
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, ?7, ?7)",
                    rusqlite::params![
                        item.work_id,
                        item.kind.as_str(),
                        item.status.as_str(),
                        item.priority,
                        item.assignee,
                        metadata_json,
                        now,
                    ],
                )?;
                insert_revision_tx(&tx, &item.work_id, 1, &item.spec, WorkRevisionCause::Import)?;
            }
            let mut inserted_edges = 0u64;
            let mut skipped_edges = Vec::new();
            for edge in &edges {
                if !ids.contains(&edge.from_id) || !ids.contains(&edge.to_id) {
                    skipped_edges.push(edge.clone());
                    continue;
                }
                tx.execute(
                    "INSERT OR IGNORE INTO work_deps (from_id, to_id, kind) \
                     VALUES (?1, ?2, ?3)",
                    rusqlite::params![edge.from_id, edge.to_id, edge.kind.as_str()],
                )?;
                inserted_edges += 1;
            }
            append_event_tx(
                &tx,
                None,
                "work.imported",
                &json!({
                    "items": items.len(),
                    "edges": inserted_edges,
                    "skippedEdges": skipped_edges.len(),
                }),
            )?;
            for item in &items {
                snapshots.push(require_snapshot_tx(&tx, &item.work_id)?);
            }
            tx.commit()?;
            Ok(WorkImportReport {
                snapshots,
                inserted_edges,
                skipped_edges,
            })
        })
    }

    /// Whether the work store holds any items at all (the importer's
    /// one-shot guard).
    pub fn work_store_is_empty(&self) -> Result<bool, LedgerError> {
        self.submit(move |conn| {
            let count: i64 = conn.query_row("SELECT COUNT(*) FROM work_items", [], |r| r.get(0))?;
            Ok(count == 0)
        })
    }

    /// The current snapshot of one work item; `Ok(None)` on a miss.
    pub fn work_item(&self, work_id: &str) -> Result<Option<WorkItemSnapshot>, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| snapshot_tx(conn, &work_id))
    }

    /// Snapshots for the requested ids, in id order; absent ids are simply
    /// not present in the result (callers that require presence check).
    pub fn work_items(&self, ids: &[String]) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        let ids = ids.to_vec();
        self.submit(move |conn| {
            let mut out = Vec::with_capacity(ids.len());
            let mut seen = std::collections::BTreeSet::new();
            for id in &ids {
                if seen.insert(id.clone()) {
                    if let Some(snapshot) = snapshot_tx(conn, id)? {
                        out.push(snapshot);
                    }
                }
            }
            Ok(out)
        })
    }

    /// Every work item, id-ordered (the importer's fidelity check and the
    /// operator inspection surface).
    pub fn all_work_items(&self) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        self.submit(move |conn| {
            let mut stmt = conn.prepare(&format!("{SNAPSHOT_SQL} ORDER BY wi.work_id"))?;
            let rows = stmt.query_map([], snapshot_from_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// One stored revision's spec fields; `Ok(None)` on a miss. This is how
    /// a pinned `spec_revision` dereferences to its exact bytes.
    pub fn work_revision(
        &self,
        work_id: &str,
        revision: i64,
    ) -> Result<Option<WorkSpecFields>, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| {
            Ok(conn
                .query_row(
                    "SELECT title, description, acceptance_criteria, design, notes \
                     FROM work_revisions WHERE work_id = ?1 AND revision = ?2",
                    rusqlite::params![work_id, revision],
                    |row| {
                        Ok(WorkSpecFields {
                            title: row.get(0)?,
                            description: row.get(1)?,
                            acceptance_criteria: row.get(2)?,
                            design: row.get(3)?,
                            notes: row.get(4)?,
                        })
                    },
                )
                .optional()?)
        })
    }

    /// Guarded spec write: inserts revision `expected_revision + 1` iff the
    /// current revision is exactly `expected_revision`, in one transaction.
    /// A moved revision refuses with `BeadsContention` (recoverable: re-read
    /// and re-decide).
    pub fn update_work_spec(
        &self,
        work_id: &str,
        expected_revision: i64,
        spec: WorkSpecFields,
        cause: WorkRevisionCause,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let current = require_snapshot_tx(&tx, &work_id)?;
            if current.revision != expected_revision {
                return Err(refused(
                    ErrorCode::BeadsContention,
                    format!(
                        "work item {work_id:?} revision moved: expected {expected_revision}, \
                         current {}",
                        current.revision
                    ),
                ));
            }
            let next = expected_revision + 1;
            insert_revision_tx(&tx, &work_id, next, &spec, cause)?;
            tx.execute(
                "UPDATE work_items SET current_revision = ?2, updated_at = ?3 \
                 WHERE work_id = ?1",
                rusqlite::params![work_id, next, now_iso()],
            )?;
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// The planning run's guarded apply, exactly the bd-era contract in one
    /// transaction: refuses unless the item is `Blocked` with EMPTY custody,
    /// mints the next spec revision with cause `PlanningApply`, and promotes
    /// the stub to `Open`. No revision token is taken — atomicity is the
    /// fence the bd path faked with a read-back, and the epic driver's own
    /// digest pre/post-image checks stand unchanged around it.
    pub fn apply_work_planning_spec(
        &self,
        work_id: &str,
        actor: &str,
        spec: WorkSpecFields,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let actor = actor.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let current = require_snapshot_tx(&tx, &work_id)?;
            if current.status != WorkStatus::Blocked {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "planning apply requires a blocked stub; {work_id:?} is {}",
                        current.status.as_str()
                    ),
                ));
            }
            if current.assignee.is_some() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("planning apply requires empty custody on {work_id:?}"),
                ));
            }
            let next = current.revision + 1;
            insert_revision_tx(&tx, &work_id, next, &spec, WorkRevisionCause::PlanningApply)?;
            tx.execute(
                "UPDATE work_items SET current_revision = ?2, status = 'open', updated_at = ?3 \
                 WHERE work_id = ?1",
                rusqlite::params![work_id, next, now_iso()],
            )?;
            append_event_tx(
                &tx,
                None,
                "work.updated",
                &json!({
                    "workId": work_id,
                    "verb": "planning-apply",
                    "actor": actor,
                    "status": { "from": WorkStatus::Blocked, "to": WorkStatus::Open },
                    "revision": next,
                }),
            )?;
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Close a work item with a recorded reason: any non-closed status
    /// closes; custody and lease clear. Closing a closed item is an
    /// idempotent no-op returning the current snapshot.
    pub fn close_work_item(
        &self,
        work_id: &str,
        actor: &str,
        reason: &str,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let actor = actor.to_owned();
        let reason = reason.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = require_snapshot_tx(&tx, &work_id)?;
            if before.status == WorkStatus::Closed {
                tx.commit()?;
                return Ok(before);
            }
            set_coordination_tx(&tx, &work_id, WorkStatus::Closed, None)?;
            clear_lease_tx(&tx, &work_id)?;
            append_event_tx(
                &tx,
                None,
                "work.updated",
                &json!({
                    "workId": work_id,
                    "verb": "close",
                    "actor": actor,
                    "reason": reason,
                    "status": { "from": before.status, "to": WorkStatus::Closed },
                    "assignee": { "from": before.assignee, "to": Option::<String>::None },
                }),
            )?;
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Close-and-release as one guarded CAS: succeeds when custody is empty
    /// or held by `holder` (a closed item still holding `holder`'s stale
    /// custody releases it); custody held by anyone else refuses.
    pub fn close_held_work_item(
        &self,
        work_id: &str,
        holder: &str,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let holder = holder.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = require_snapshot_tx(&tx, &work_id)?;
            if before.status == WorkStatus::Closed && before.assignee.is_none() {
                tx.commit()?;
                return Ok(before);
            }
            match before.assignee.as_deref() {
                Some(current) if current == holder => {}
                current => {
                    return Err(refused(
                        ErrorCode::BeadLeaseHeld,
                        format!("work item {work_id:?} is held by {current:?}, not {holder:?}"),
                    ));
                }
            }
            set_coordination_tx(&tx, &work_id, WorkStatus::Closed, None)?;
            clear_lease_tx(&tx, &work_id)?;
            coordination_event_tx(
                &tx,
                &work_id,
                "close-held",
                &before,
                WorkStatus::Closed,
                None,
                &holder,
            )?;
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Idempotently clear custody (and the lease) under the actor CAS,
    /// status untouched — the bd-era guarded release, closed items included
    /// (recovery of older already-closed state). Unheld is an idempotent
    /// no-op; a different holder refuses with `BeadLeaseHeld`.
    pub fn release_work_item(
        &self,
        work_id: &str,
        actor: &str,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let actor = actor.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = require_snapshot_tx(&tx, &work_id)?;
            match before.assignee.as_deref() {
                None => {
                    tx.commit()?;
                    return Ok(before);
                }
                Some(holder) if holder != actor => {
                    return Err(refused(
                        ErrorCode::BeadLeaseHeld,
                        format!("work item {work_id:?} is held by {holder:?}, not {actor:?}"),
                    ));
                }
                Some(_) => {}
            }
            set_coordination_tx(&tx, &work_id, before.status, None)?;
            clear_lease_tx(&tx, &work_id)?;
            coordination_event_tx(
                &tx,
                &work_id,
                "release",
                &before,
                before.status,
                None,
                &actor,
            )?;
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Terminal-run settlement release: custody clears under the actor CAS
    /// and status becomes `Blocked` (blocked/input-required) or `Open`
    /// (cancelled/superseded). REFUSES on a closed item — the preserved
    /// adjudicated guard: terminal run settlement must never reopen a
    /// hand-closed item. Unheld and already at the target status is an
    /// idempotent no-op; a different holder refuses with `BeadLeaseHeld`.
    pub fn release_unresolved_work_item(
        &self,
        work_id: &str,
        actor: &str,
        blocked: bool,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let status = if blocked {
            WorkStatus::Blocked
        } else {
            WorkStatus::Open
        };
        let work_id = work_id.to_owned();
        let actor = actor.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = require_snapshot_tx(&tx, &work_id)?;
            if before.status == WorkStatus::Closed {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "refusing to reopen closed work item {work_id:?} from terminal \
                         run settlement"
                    ),
                ));
            }
            match before.assignee.as_deref() {
                None if before.status == status => {
                    tx.commit()?;
                    return Ok(before);
                }
                None => {}
                Some(holder) if holder != actor => {
                    return Err(refused(
                        ErrorCode::BeadLeaseHeld,
                        format!("work item {work_id:?} is held by {holder:?}, not {actor:?}"),
                    ));
                }
                Some(_) => {}
            }
            set_coordination_tx(&tx, &work_id, status, None)?;
            clear_lease_tx(&tx, &work_id)?;
            coordination_event_tx(
                &tx,
                &work_id,
                "release-unresolved",
                &before,
                status,
                None,
                &actor,
            )?;
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Reopen: set status `Open` from ANY status (the bd-era
    /// `update --status open`), custody untouched. Already-open is an
    /// idempotent no-op.
    pub fn reopen_work_item(
        &self,
        work_id: &str,
        actor: &str,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let actor = actor.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = require_snapshot_tx(&tx, &work_id)?;
            if before.status == WorkStatus::Open {
                tx.commit()?;
                return Ok(before);
            }
            set_coordination_tx(&tx, &work_id, WorkStatus::Open, before.assignee.as_deref())?;
            coordination_event_tx(
                &tx,
                &work_id,
                "reopen",
                &before,
                WorkStatus::Open,
                before.assignee.as_deref(),
                &actor,
            )?;
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// The blocked-residue retake (operator-adjudicated): take custody of an
    /// UNASSIGNED `Open` or `Blocked` item without changing its status. The
    /// caller pins the exact status it observed (bd's `--if-status`); a
    /// moved status refuses. Existing custody by anyone (including `holder`)
    /// refuses — the caller asked for an unassigned item specifically.
    pub fn assign_unassigned_work_item(
        &self,
        work_id: &str,
        holder: &str,
        expected_status: WorkStatus,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let holder = holder.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = require_snapshot_tx(&tx, &work_id)?;
            if let Some(current) = &before.assignee {
                return Err(refused(
                    ErrorCode::BeadsContention,
                    format!("work item {work_id:?} is already held by {current:?}"),
                ));
            }
            if before.status != expected_status {
                return Err(refused(
                    ErrorCode::BeadsContention,
                    format!(
                        "work item {work_id:?} is {}, not the pinned {}",
                        before.status.as_str(),
                        expected_status.as_str()
                    ),
                ));
            }
            if !matches!(before.status, WorkStatus::Open | WorkStatus::Blocked) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("{WORK_CLAIM_REFUSAL_PREFIX}{}", before.status.as_str()),
                ));
            }
            set_coordination_tx(&tx, &work_id, before.status, Some(&holder))?;
            coordination_event_tx(
                &tx,
                &work_id,
                "assign-unassigned",
                &before,
                before.status,
                Some(&holder),
                &holder,
            )?;
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Add a dependency edge; both endpoints must exist. Idempotent for an
    /// existing identical edge.
    pub fn add_work_dep(
        &self,
        from_id: &str,
        to_id: &str,
        kind: WorkDepKind,
    ) -> Result<(), LedgerError> {
        let from_id = from_id.to_owned();
        let to_id = to_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            for id in [&from_id, &to_id] {
                require_snapshot_tx(&tx, id)?;
            }
            tx.execute(
                "INSERT OR IGNORE INTO work_deps (from_id, to_id, kind) VALUES (?1, ?2, ?3)",
                rusqlite::params![from_id, to_id, kind.as_str()],
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Outgoing edges of one item, (to_id, kind)-ordered.
    pub fn work_deps_of(&self, work_id: &str) -> Result<Vec<WorkDepRow>, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT from_id, to_id, kind FROM work_deps WHERE from_id = ?1 \
                 ORDER BY to_id, kind",
            )?;
            let rows = stmt.query_map([&work_id], |row| {
                let kind: String = row.get(2)?;
                Ok(WorkDepRow {
                    from_id: row.get(0)?,
                    to_id: row.get(1)?,
                    kind: WorkDepKind::decode(2, &kind)?,
                })
            })?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Outgoing dependencies hydrated with each target's current status
    /// (`None` for a dangling imported edge).
    pub fn work_dependencies(
        &self,
        work_id: &str,
    ) -> Result<Vec<WorkDependencyStatus>, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT d.to_id, d.kind, wi.status FROM work_deps d \
                 LEFT JOIN work_items wi ON wi.work_id = d.to_id \
                 WHERE d.from_id = ?1 ORDER BY d.to_id, d.kind",
            )?;
            let rows = stmt.query_map([&work_id], |row| {
                let kind: String = row.get(1)?;
                let status: Option<String> = row.get(2)?;
                Ok(WorkDependencyStatus {
                    id: row.get(0)?,
                    kind: WorkDepKind::decode(1, &kind)?,
                    status: match status {
                        Some(s) => Some(WorkStatus::decode(2, &s)?),
                        None => None,
                    },
                })
            })?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Children of an epic: items carrying a `parent-child` edge to it,
    /// id-ordered.
    pub fn work_epic_children(&self, epic_id: &str) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        let epic_id = epic_id.to_owned();
        self.submit(move |conn| {
            let mut stmt = conn.prepare(&format!(
                "{SNAPSHOT_SQL} JOIN work_deps d ON d.from_id = wi.work_id \
                 WHERE d.to_id = ?1 AND d.kind = 'parent-child' ORDER BY wi.work_id"
            ))?;
            let rows = stmt.query_map([&epic_id], snapshot_from_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Every non-closed item, priority-ordered (ascending, nulls last) then
    /// id-ordered — the live-plan discovery read.
    pub fn nonterminal_work_items(&self) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        self.submit(move |conn| {
            let mut stmt = conn.prepare(&format!(
                "{SNAPSHOT_SQL} WHERE wi.status <> 'closed' \
                 ORDER BY wi.priority IS NULL, wi.priority, wi.work_id"
            ))?;
            let rows = stmt.query_map([], snapshot_from_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// The ready frontier: `Open`, unassigned, every `blocks` target closed,
    /// no lease row. Ordered by priority ascending (nulls last — a missing
    /// priority never outranks a stated one), then id.
    pub fn ready_work_items(&self) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        self.submit(move |conn| ready_tx(conn))
    }
}

pub(crate) fn ready_tx(conn: &Connection) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
    let mut stmt = conn.prepare(&format!(
        "{SNAPSHOT_SQL} \
         WHERE wi.status = 'open' AND wi.assignee IS NULL \
           AND NOT EXISTS (SELECT 1 FROM work_leases wl WHERE wl.work_id = wi.work_id) \
           AND NOT EXISTS ( \
             SELECT 1 FROM work_deps d \
             JOIN work_items b ON b.work_id = d.to_id \
             WHERE d.from_id = wi.work_id AND d.kind = 'blocks' \
               AND b.status <> 'closed') \
         ORDER BY wi.priority IS NULL, wi.priority, wi.work_id"
    ))?;
    let rows = stmt.query_map([], snapshot_from_row)?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ledger() -> (tempfile::TempDir, Ledger) {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        (dir, ledger)
    }

    fn spec(title: &str) -> WorkSpecFields {
        WorkSpecFields {
            title: title.to_string(),
            description: format!("{title} description"),
            acceptance_criteria: format!("{title} accepts"),
            design: String::new(),
            notes: String::new(),
        }
    }

    fn item(id: &str, status: WorkStatus) -> NewWorkItem {
        NewWorkItem {
            work_id: id.to_string(),
            kind: WorkKind::Task,
            status,
            priority: None,
            metadata: BTreeMap::new(),
            spec: spec(id),
            cause: WorkRevisionCause::Authored,
        }
    }

    #[test]
    fn create_and_read_round_trips_and_duplicates_refuse() {
        let (_dir, l) = ledger();
        let created = l
            .create_work_item(item("beads-aaa", WorkStatus::Open))
            .unwrap();
        assert_eq!(created.revision, 1);
        assert_eq!(created.status, WorkStatus::Open);
        assert_eq!(created.assignee, None);
        let read = l.work_item("beads-aaa").unwrap().unwrap();
        assert_eq!(read, created);
        let err = l
            .create_work_item(item("beads-aaa", WorkStatus::Open))
            .unwrap_err();
        assert!(err.to_string().contains("already exists"), "{err}");
        let err = l
            .create_work_item(item("beads-bbb", WorkStatus::Closed))
            .unwrap_err();
        assert!(err.to_string().contains("cannot be created"), "{err}");
        assert_eq!(l.work_item("beads-nope").unwrap(), None);
    }

    #[test]
    fn spec_cas_moves_the_pointer_and_old_revisions_stay_dereferenceable() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-cas", WorkStatus::Open))
            .unwrap();
        let updated = l
            .update_work_spec("beads-cas", 1, spec("v2"), WorkRevisionCause::Authored)
            .unwrap();
        assert_eq!(updated.revision, 2);
        assert_eq!(updated.spec.title, "v2");

        // The stale writer refuses with contention and changes nothing.
        let err = l
            .update_work_spec("beads-cas", 1, spec("v2-race"), WorkRevisionCause::Authored)
            .unwrap_err();
        assert_eq!(err.code(), ErrorCode::BeadsContention);
        assert_eq!(l.work_item("beads-cas").unwrap().unwrap().revision, 2);

        // The pinned revision dereferences to its exact bytes.
        let rev1 = l.work_revision("beads-cas", 1).unwrap().unwrap();
        assert_eq!(rev1.title, "beads-cas");
        let rev2 = l.work_revision("beads-cas", 2).unwrap().unwrap();
        assert_eq!(rev2.title, "v2");
        assert_eq!(l.work_revision("beads-cas", 3).unwrap(), None);
    }

    #[test]
    fn coordination_churn_never_mints_a_revision() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-churn", WorkStatus::Open))
            .unwrap();
        l.assign_unassigned_work_item("beads-churn", "holder-a", WorkStatus::Open)
            .unwrap();
        l.release_work_item("beads-churn", "holder-a").unwrap();
        l.close_work_item("beads-churn", "op", "test").unwrap();
        l.reopen_work_item("beads-churn", "op").unwrap();
        assert_eq!(l.work_item("beads-churn").unwrap().unwrap().revision, 1);
    }

    #[test]
    fn planning_apply_is_guarded_by_blocked_status_and_empty_custody() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-stub", WorkStatus::Blocked))
            .unwrap();
        l.create_work_item(item("beads-live", WorkStatus::Open))
            .unwrap();

        let err = l
            .apply_work_planning_spec("beads-live", "forged:e", spec("planned"))
            .unwrap_err();
        assert!(err.to_string().contains("requires a blocked stub"), "{err}");

        l.assign_unassigned_work_item("beads-stub", "squatter", WorkStatus::Blocked)
            .unwrap();
        let err = l
            .apply_work_planning_spec("beads-stub", "forged:e", spec("planned"))
            .unwrap_err();
        assert!(err.to_string().contains("empty custody"), "{err}");
        l.release_work_item("beads-stub", "squatter").unwrap();

        let applied = l
            .apply_work_planning_spec("beads-stub", "forged:e", spec("planned"))
            .unwrap();
        assert_eq!(applied.revision, 2);
        assert_eq!(applied.spec.title, "planned");
        assert_eq!(
            applied.status,
            WorkStatus::Open,
            "the guarded apply promotes the stub to the frontier"
        );
    }

    #[test]
    fn terminal_settlement_release_refuses_a_closed_item() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-done", WorkStatus::Open))
            .unwrap();
        l.close_work_item("beads-done", "op", "test").unwrap();
        let err = l
            .release_unresolved_work_item("beads-done", "settler", false)
            .unwrap_err();
        assert!(
            err.to_string()
                .contains("refusing to reopen closed work item"),
            "{err}"
        );
        // The deliberate exit still works.
        l.reopen_work_item("beads-done", "op").unwrap();
        let released = l
            .release_unresolved_work_item("beads-done", "settler", true)
            .unwrap();
        assert_eq!(released.status, WorkStatus::Blocked);
    }

    #[test]
    fn close_held_releases_own_stale_custody_and_refuses_others() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-held", WorkStatus::Open))
            .unwrap();
        l.assign_unassigned_work_item("beads-held", "mine", WorkStatus::Open)
            .unwrap();
        let err = l.close_held_work_item("beads-held", "thief").unwrap_err();
        assert_eq!(err.code(), ErrorCode::BeadLeaseHeld);
        let closed = l.close_held_work_item("beads-held", "mine").unwrap();
        assert_eq!(closed.status, WorkStatus::Closed);
        assert_eq!(closed.assignee, None);
        // Closed + unassigned is the idempotent convergence shape.
        let again = l.close_held_work_item("beads-held", "mine").unwrap();
        assert_eq!(again.status, WorkStatus::Closed);
        // Unheld custody on a NON-closed item refuses — that refusal is what
        // drives the landed pending → guarded-retake choreography.
        l.create_work_item(item("beads-unheld", WorkStatus::Open))
            .unwrap();
        let err = l.close_held_work_item("beads-unheld", "mine").unwrap_err();
        assert_eq!(err.code(), ErrorCode::BeadLeaseHeld);
    }

    #[test]
    fn assign_unassigned_takes_blocked_residue_and_refuses_held_items() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-res", WorkStatus::Blocked))
            .unwrap();
        let taken = l
            .assign_unassigned_work_item("beads-res", "retaker", WorkStatus::Blocked)
            .unwrap();
        assert_eq!(taken.status, WorkStatus::Blocked, "status is untouched");
        assert_eq!(taken.assignee.as_deref(), Some("retaker"));
        let err = l
            .assign_unassigned_work_item("beads-res", "other", WorkStatus::Blocked)
            .unwrap_err();
        assert_eq!(err.code(), ErrorCode::BeadsContention);
    }

    #[test]
    fn readiness_is_open_unassigned_unleased_with_closed_blockers() {
        let (_dir, l) = ledger();
        let mut low = item("beads-low", WorkStatus::Open);
        low.priority = Some(2);
        let mut high = item("beads-high", WorkStatus::Open);
        high.priority = Some(0);
        l.create_work_item(low).unwrap();
        l.create_work_item(high).unwrap();
        l.create_work_item(item("beads-nopri", WorkStatus::Open))
            .unwrap();
        l.create_work_item(item("beads-gate", WorkStatus::Open))
            .unwrap();
        l.add_work_dep("beads-high", "beads-gate", WorkDepKind::Blocks)
            .unwrap();

        let ready: Vec<String> = l
            .ready_work_items()
            .unwrap()
            .into_iter()
            .map(|s| s.work_id)
            .collect();
        // beads-high is blocked by the open gate; stated priorities outrank
        // missing ones, so unprioritized items sort last.
        assert_eq!(ready, ["beads-low", "beads-gate", "beads-nopri"]);

        l.close_work_item("beads-gate", "op", "test").unwrap();
        let ready: Vec<String> = l
            .ready_work_items()
            .unwrap()
            .into_iter()
            .map(|s| s.work_id)
            .collect();
        assert_eq!(ready, ["beads-high", "beads-low", "beads-nopri"]);

        // Custody removes an item from the frontier; non-blocking edge kinds
        // never gate.
        l.assign_unassigned_work_item("beads-low", "someone", WorkStatus::Open)
            .unwrap();
        l.add_work_dep("beads-nopri", "beads-high", WorkDepKind::Related)
            .unwrap();
        let ready: Vec<String> = l
            .ready_work_items()
            .unwrap()
            .into_iter()
            .map(|s| s.work_id)
            .collect();
        assert_eq!(ready, ["beads-high", "beads-nopri"]);
    }

    #[test]
    fn epic_children_and_dependency_hydration_read_the_graph() {
        let (_dir, l) = ledger();
        let mut epic = item("beads-epic", WorkStatus::Open);
        epic.kind = WorkKind::Epic;
        l.create_work_item(epic).unwrap();
        l.create_work_item(item("beads-c1", WorkStatus::Open))
            .unwrap();
        l.create_work_item(item("beads-c2", WorkStatus::Blocked))
            .unwrap();
        l.add_work_dep("beads-c1", "beads-epic", WorkDepKind::ParentChild)
            .unwrap();
        l.add_work_dep("beads-c2", "beads-epic", WorkDepKind::ParentChild)
            .unwrap();
        l.add_work_dep("beads-c2", "beads-c1", WorkDepKind::Blocks)
            .unwrap();

        let children: Vec<String> = l
            .work_epic_children("beads-epic")
            .unwrap()
            .into_iter()
            .map(|s| s.work_id)
            .collect();
        assert_eq!(children, ["beads-c1", "beads-c2"]);

        let deps = l.work_dependencies("beads-c2").unwrap();
        assert_eq!(deps.len(), 2);
        assert_eq!(deps[0].id, "beads-c1");
        assert_eq!(deps[0].kind, WorkDepKind::Blocks);
        assert_eq!(deps[0].status, Some(WorkStatus::Open));

        let err = l
            .add_work_dep("beads-c2", "beads-missing", WorkDepKind::Blocks)
            .unwrap_err();
        assert!(err.to_string().contains("does not exist"), "{err}");
    }

    /// The no-dead-state contract: every coordination state the store's own
    /// verbs can construct has a typed verb path back to a schedulable or
    /// deliberately-terminal state. Extended by the importer's states when
    /// it lands.
    #[test]
    fn every_reachable_state_has_a_typed_exit() {
        let (_dir, l) = ledger();

        // open + unassigned: schedulable already (ready frontier proves it).
        l.create_work_item(item("beads-s1", WorkStatus::Open))
            .unwrap();
        assert!(l
            .ready_work_items()
            .unwrap()
            .iter()
            .any(|s| s.work_id == "beads-s1"));

        // open/blocked + assigned custody (no lease): release_work_item.
        l.assign_unassigned_work_item("beads-s1", "h", WorkStatus::Open)
            .unwrap();
        assert_eq!(l.release_work_item("beads-s1", "h").unwrap().assignee, None);

        // in_progress + live lease: close_held (landed) — custody and lease
        // both clear.
        l.claim_specific_work("beads-s1", "h", 300).unwrap();
        let closed = l.close_held_work_item("beads-s1", "h").unwrap();
        assert_eq!(closed.status, WorkStatus::Closed);
        assert_eq!(l.work_lease("beads-s1").unwrap(), None);

        // closed: reopen_work_item.
        assert_eq!(
            l.reopen_work_item("beads-s1", "op").unwrap().status,
            WorkStatus::Open
        );

        // in_progress + EXPIRED lease (dead holder): the scoped reclaim.
        l.claim_specific_work("beads-s1", "gone", 0).unwrap();
        let out = l.reclaim_work_lease("beads-s1", "gone", 0).unwrap();
        assert_eq!(out.previous_owner.as_deref(), Some("gone"));
        assert_eq!(
            l.work_item("beads-s1").unwrap().unwrap().status,
            WorkStatus::Open
        );

        // in_progress + live lease + settlement (blocked/input-required):
        // release_unresolved.
        l.claim_specific_work("beads-s1", "h2", 300).unwrap();
        let parked = l
            .release_unresolved_work_item("beads-s1", "h2", true)
            .unwrap();
        assert_eq!(parked.status, WorkStatus::Blocked);
        assert_eq!(l.work_lease("beads-s1").unwrap(), None);

        // blocked + custody residue: close_held or release both exit; the
        // retake path also re-enters.
        l.assign_unassigned_work_item("beads-s1", "resident", WorkStatus::Blocked)
            .unwrap();
        assert_eq!(
            l.release_work_item("beads-s1", "resident")
                .unwrap()
                .assignee,
            None
        );
    }

    #[test]
    fn verbs_append_evidence_events() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-ev", WorkStatus::Open))
            .unwrap();
        l.assign_unassigned_work_item("beads-ev", "h", WorkStatus::Open)
            .unwrap();
        l.close_held_work_item("beads-ev", "h").unwrap();
        let kinds: Vec<String> = l
            .list_events(None, 0, 100)
            .unwrap()
            .into_iter()
            .map(|e| e.kind)
            .collect();
        assert!(kinds.contains(&"work.created".to_string()), "{kinds:?}");
        assert!(kinds.contains(&"work.updated".to_string()), "{kinds:?}");
    }
}
