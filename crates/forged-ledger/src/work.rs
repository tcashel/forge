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

use std::collections::{BTreeMap, BTreeSet};

use forged_types::{
    canonical_json_bytes, parse_canonical, request_sha256, ErrorCode, OperationRequest,
    OperationResponse,
};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::json;

use crate::error::{column_decode_error, internal, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::operations::{replay_ledger_operation_tx, settle_operation};
use crate::time::now_iso;

/// The stable refusal prefix for a claim refused on mechanism (not
/// contention) — the bd-era spelling VERBATIM, because durable retry rows
/// already store it in `last_error` and the classifier matches history and
/// new refusals with one vocabulary.
pub const WORK_CLAIM_REFUSAL_PREFIX: &str = "issue not claimable: status ";

/// The blocked-claim refusal message, stable for classification.
pub const WORK_BLOCKED_CLAIM_REFUSAL: &str = "issue not claimable: status blocked";

/// Default bound for one annotation listing.
pub const WORK_NOTE_DEFAULT_LIMIT: u64 = 100;

/// Hard bound for one annotation listing.
pub const WORK_NOTE_MAX_LIMIT: u64 = 500;

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

    /// Parse the stored/public spelling used by work filters.
    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "open" => Some(Self::Open),
            "in_progress" => Some(Self::InProgress),
            "blocked" => Some(Self::Blocked),
            "deferred" => Some(Self::Deferred),
            "closed" => Some(Self::Closed),
            _ => None,
        }
    }

    fn decode(idx: usize, value: &str) -> Result<Self, rusqlite::Error> {
        Self::parse(value).ok_or_else(|| column_decode_error(idx, "work status", value))
    }
}

/// Exact predicates for one work-item collection read. Every populated
/// predicate is emitted into the SQL `WHERE` clause and composes with the
/// others; no caller needs to inspect decoded metadata to filter rows.
#[derive(Debug, Clone, Default)]
pub struct WorkItemFilters {
    /// Exact repository identity projected from `metadata.repository`.
    pub repository: Option<String>,
    /// Exact coordination status.
    pub status: Option<WorkStatus>,
    /// Exact custody holder.
    pub assignee: Option<String>,
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

/// Annotation kinds are stable wire names: existing spellings are never
/// renamed after callers have persisted them as evidence.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum WorkNoteKind {
    /// Untyped human or agent commentary.
    Comment,
    /// Critic evidence about the current specification.
    Critique,
    /// A synthesized recommendation awaiting adjudication.
    Recommendation,
    /// Durable operator approval evidence.
    Approval,
}

impl WorkNoteKind {
    /// The stored and public wire spelling.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Comment => "comment",
            Self::Critique => "critique",
            Self::Recommendation => "recommendation",
            Self::Approval => "approval",
        }
    }

    /// Parse the stored and public wire spelling.
    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "comment" => Some(Self::Comment),
            "critique" => Some(Self::Critique),
            "recommendation" => Some(Self::Recommendation),
            "approval" => Some(Self::Approval),
            _ => None,
        }
    }

    fn decode(idx: usize, value: &str) -> Result<Self, rusqlite::Error> {
        Self::parse(value).ok_or_else(|| column_decode_error(idx, "work note kind", value))
    }
}

/// Input for one immutable annotation. The ledger canonicalizes `body_json`
/// before insertion even when its caller already did so for operation-key
/// normalization.
#[derive(Debug, Clone)]
pub struct NewWorkNote {
    /// Existing work item the evidence describes.
    pub work_id: String,
    /// Closed annotation kind.
    pub kind: WorkNoteKind,
    /// Append-never-rename payload schema wire name.
    pub schema: String,
    /// Identity that wrote the evidence.
    pub actor: String,
    /// Raw JSON text; stored in canonical form.
    pub body_json: String,
}

/// One immutable annotation row.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkNoteRow {
    /// House UUIDv7 note identity.
    pub note_id: String,
    /// Work item the evidence describes.
    pub work_id: String,
    /// Closed annotation kind.
    pub kind: WorkNoteKind,
    /// Append-never-rename payload schema wire name.
    pub schema: String,
    /// Identity that wrote the evidence.
    pub actor: String,
    /// Exact canonical JSON bytes, transported as a string.
    pub body_json: String,
    /// Durable append timestamp.
    pub written_at: String,
}

/// One bounded annotation page and its unbounded matching total.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkNotePage {
    /// Rows ordered by `(written_at, note_id)` ascending.
    pub notes: Vec<WorkNoteRow>,
    /// All rows matching the work id and optional kind.
    pub total: u64,
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

/// The ready frontier's stable keyset position.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkReadyAfter {
    /// Native priority; `None` sorts after every stated priority.
    pub priority: Option<i64>,
    /// Stable tie-breaker for equal priorities.
    pub work_id: String,
}

/// One bounded ready-frontier page plus its unbounded matching total.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkReadyPage {
    /// Rows after the optional keyset, in ready-frontier order.
    pub items: Vec<WorkItemSnapshot>,
    /// All ready rows matching the filters, before the keyset.
    pub total: u64,
    /// Whether at least one matching row follows this page.
    pub has_more: bool,
}

/// One plan item hydrated with all of its outgoing dependency statuses.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkPlanRow {
    /// Complete current work-item state.
    pub item: WorkItemSnapshot,
    /// Dependencies ordered by `(target id, kind)`.
    pub dependencies: Vec<WorkDependencyStatus>,
}

/// One transaction's plan projection for a live filter and/or exact ids.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorkPlanSnapshot {
    /// Nonterminal rows matching the requested filters, priority-ordered.
    pub matching: Vec<WorkPlanRow>,
    /// Existing exact-id rows in caller order, including duplicates.
    pub exact: Vec<WorkPlanRow>,
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

#[derive(Clone, Copy)]
enum WorkItemCollection {
    All,
    ExactIds,
    Nonterminal,
    Ready,
}

fn collection_query(
    collection: WorkItemCollection,
    ids: &[String],
    filters: &WorkItemFilters,
) -> (String, Vec<String>) {
    collection_query_after(collection, ids, filters, None)
}

fn collection_query_after(
    collection: WorkItemCollection,
    ids: &[String],
    filters: &WorkItemFilters,
    ready_after: Option<&WorkReadyAfter>,
) -> (String, Vec<String>) {
    let mut clauses = Vec::new();
    let mut params = Vec::new();
    match collection {
        WorkItemCollection::All => {}
        WorkItemCollection::ExactIds if ids.is_empty() => clauses.push("1 = 0".to_owned()),
        WorkItemCollection::ExactIds => {
            params.push(serde_json::to_string(ids).expect("string ids serialize to JSON"));
            clauses.push("wi.work_id IN (SELECT value FROM json_each(?1))".to_owned());
        }
        WorkItemCollection::Nonterminal => clauses.push("wi.status <> 'closed'".to_owned()),
        WorkItemCollection::Ready => {
            clauses.extend([
                "wi.status = 'open'".to_owned(),
                "wi.assignee IS NULL".to_owned(),
                "NOT EXISTS (SELECT 1 FROM work_leases wl WHERE wl.work_id = wi.work_id)"
                    .to_owned(),
                "NOT EXISTS (SELECT 1 FROM work_deps d JOIN work_items b ON b.work_id = d.to_id \
                 WHERE d.from_id = wi.work_id AND d.kind = 'blocks' AND b.status <> 'closed')"
                    .to_owned(),
            ]);
        }
    }
    if let Some(repository) = &filters.repository {
        params.push(repository.clone());
        clauses.push(format!("wi.repository = ?{}", params.len()));
    }
    if let Some(status) = filters.status {
        params.push(status.as_str().to_owned());
        clauses.push(format!("wi.status = ?{}", params.len()));
    }
    if let Some(assignee) = &filters.assignee {
        params.push(assignee.clone());
        clauses.push(format!("wi.assignee = ?{}", params.len()));
    }
    if let Some(after) = ready_after {
        debug_assert!(matches!(collection, WorkItemCollection::Ready));
        params.push(after.work_id.clone());
        let work_id_param = params.len();
        match after.priority {
            Some(priority) => {
                params.push(priority.to_string());
                let priority_param = params.len();
                clauses.push(format!(
                    "(wi.priority IS NULL OR wi.priority > ?{priority_param} OR \
                     (wi.priority = ?{priority_param} AND wi.work_id > ?{work_id_param}))"
                ));
            }
            None => clauses.push(format!(
                "wi.priority IS NULL AND wi.work_id > ?{work_id_param}"
            )),
        }
    }
    let where_clause = if clauses.is_empty() {
        String::new()
    } else {
        format!(" WHERE {}", clauses.join(" AND "))
    };
    let order = match collection {
        WorkItemCollection::Nonterminal | WorkItemCollection::Ready => {
            " ORDER BY wi.priority IS NULL, wi.priority, wi.work_id"
        }
        WorkItemCollection::All | WorkItemCollection::ExactIds => " ORDER BY wi.work_id",
    };
    (format!("{SNAPSHOT_SQL}{where_clause}{order}"), params)
}

fn collection_count_query(
    collection: WorkItemCollection,
    ids: &[String],
    filters: &WorkItemFilters,
) -> (String, Vec<String>) {
    let (query, params) = collection_query(collection, ids, filters);
    let from = query
        .find(" FROM work_items wi ")
        .expect("snapshot query has a work-items FROM clause");
    let order = query.find(" ORDER BY ").unwrap_or(query.len());
    (format!("SELECT COUNT(*){}", &query[from..order]), params)
}

fn collection_tx(
    conn: &Connection,
    collection: WorkItemCollection,
    ids: &[String],
    filters: &WorkItemFilters,
) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
    let (sql, params) = collection_query(collection, ids, filters);
    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query_map(rusqlite::params_from_iter(params.iter()), snapshot_from_row)?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

fn ready_page_tx(
    conn: &mut Connection,
    filters: &WorkItemFilters,
    after: Option<&WorkReadyAfter>,
    limit: usize,
) -> Result<WorkReadyPage, LedgerError> {
    let tx = conn.transaction()?;
    let (count_sql, count_params) = collection_count_query(WorkItemCollection::Ready, &[], filters);
    let total: i64 = tx.query_row(
        &count_sql,
        rusqlite::params_from_iter(count_params.iter()),
        |row| row.get(0),
    )?;
    let (mut page_sql, page_params) =
        collection_query_after(WorkItemCollection::Ready, &[], filters, after);
    let fetch = limit
        .checked_add(1)
        .ok_or_else(|| internal("work ready page limit overflow"))?;
    page_sql.push_str(&format!(" LIMIT {fetch}"));
    let mut stmt = tx.prepare(&page_sql)?;
    let rows = stmt.query_map(
        rusqlite::params_from_iter(page_params.iter()),
        snapshot_from_row,
    )?;
    let mut items = Vec::with_capacity(fetch);
    for row in rows {
        items.push(row?);
    }
    drop(stmt);
    let has_more = items.len() > limit;
    items.truncate(limit);
    tx.commit()?;
    Ok(WorkReadyPage {
        items,
        total: total as u64,
        has_more,
    })
}

fn plan_dependencies_tx(
    conn: &Connection,
    ids: &[String],
) -> Result<BTreeMap<String, Vec<WorkDependencyStatus>>, LedgerError> {
    if ids.is_empty() {
        return Ok(BTreeMap::new());
    }
    let ids_json = serde_json::to_string(ids)?;
    let mut stmt = conn.prepare(
        "SELECT d.from_id, d.to_id, d.kind, wi.status FROM work_deps d \
         LEFT JOIN work_items wi ON wi.work_id = d.to_id \
         WHERE d.from_id IN (SELECT value FROM json_each(?1)) \
         ORDER BY d.from_id, d.to_id, d.kind",
    )?;
    let rows = stmt.query_map([ids_json], |row| {
        let kind: String = row.get(2)?;
        let status: Option<String> = row.get(3)?;
        Ok((
            row.get::<_, String>(0)?,
            WorkDependencyStatus {
                id: row.get(1)?,
                kind: WorkDepKind::decode(2, &kind)?,
                status: match status {
                    Some(value) => Some(WorkStatus::decode(3, &value)?),
                    None => None,
                },
            },
        ))
    })?;
    let mut dependencies = BTreeMap::<String, Vec<WorkDependencyStatus>>::new();
    for row in rows {
        let (work_id, dependency) = row?;
        dependencies.entry(work_id).or_default().push(dependency);
    }
    Ok(dependencies)
}

fn plan_rows(
    items: Vec<WorkItemSnapshot>,
    dependencies: &BTreeMap<String, Vec<WorkDependencyStatus>>,
) -> Vec<WorkPlanRow> {
    items
        .into_iter()
        .map(|item| WorkPlanRow {
            dependencies: dependencies.get(&item.work_id).cloned().unwrap_or_default(),
            item,
        })
        .collect()
}

fn work_plan_snapshot_tx(
    conn: &mut Connection,
    ids: &[String],
    filters: Option<&WorkItemFilters>,
) -> Result<WorkPlanSnapshot, LedgerError> {
    let tx = conn.transaction()?;
    let matching_items = match filters {
        Some(filters) => collection_tx(&tx, WorkItemCollection::Nonterminal, &[], filters)?,
        None => Vec::new(),
    };
    let exact_unique = collection_tx(
        &tx,
        WorkItemCollection::ExactIds,
        ids,
        &WorkItemFilters::default(),
    )?;
    let exact_by_id: BTreeMap<String, WorkItemSnapshot> = exact_unique
        .into_iter()
        .map(|item| (item.work_id.clone(), item))
        .collect();
    let exact_items: Vec<WorkItemSnapshot> = ids
        .iter()
        .filter_map(|id| exact_by_id.get(id).cloned())
        .collect();
    let mut hydration_ids: Vec<String> = matching_items
        .iter()
        .map(|item| item.work_id.clone())
        .collect();
    hydration_ids.extend(exact_by_id.keys().cloned());
    hydration_ids.sort();
    hydration_ids.dedup();
    let dependencies = plan_dependencies_tx(&tx, &hydration_ids)?;
    let matching = plan_rows(matching_items, &dependencies);
    let exact = plan_rows(exact_items, &dependencies);
    tx.commit()?;
    Ok(WorkPlanSnapshot { matching, exact })
}

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

fn canonical_work_note_body(raw: &str) -> Result<String, LedgerError> {
    let value = parse_canonical(raw).map_err(|error| {
        refused(
            ErrorCode::InvalidRequest,
            format!(
                "work note bodyJson must be JSON without duplicate keys or non-integer \
                 numbers: {error}"
            ),
        )
    })?;
    let bytes = canonical_json_bytes(&value).map_err(|error| {
        refused(
            ErrorCode::InvalidRequest,
            format!(
                "work note bodyJson must be JSON without duplicate keys or non-integer \
                 numbers: {error}"
            ),
        )
    })?;
    String::from_utf8(bytes)
        .map_err(|error| internal(format!("canonical work note body is not UTF-8: {error}")))
}

fn insert_work_note_tx(
    conn: &Connection,
    new: &NewWorkNote,
    note_id: String,
    written_at: String,
) -> Result<WorkNoteRow, LedgerError> {
    require_snapshot_tx(conn, &new.work_id).map_err(|error| match error {
        LedgerError::Refused { code, .. } if code == ErrorCode::InvalidRequest => refused(
            code,
            format!(
                "work item {:?} does not exist; create it first with work_create",
                new.work_id
            ),
        ),
        other => other,
    })?;
    conn.execute(
        "INSERT INTO work_notes \
         (note_id, work_id, kind, schema, actor, body_json, written_at) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            note_id,
            new.work_id,
            new.kind.as_str(),
            new.schema,
            new.actor,
            new.body_json,
            written_at,
        ],
    )?;
    Ok(WorkNoteRow {
        note_id,
        work_id: new.work_id.clone(),
        kind: new.kind,
        schema: new.schema.clone(),
        actor: new.actor.clone(),
        body_json: new.body_json.clone(),
        written_at,
    })
}

fn work_note_from_row(row: &rusqlite::Row<'_>) -> Result<WorkNoteRow, rusqlite::Error> {
    let kind: String = row.get(2)?;
    Ok(WorkNoteRow {
        note_id: row.get(0)?,
        work_id: row.get(1)?,
        kind: WorkNoteKind::decode(2, &kind)?,
        schema: row.get(3)?,
        actor: row.get(4)?,
        body_json: row.get(5)?,
        written_at: row.get(6)?,
    })
}

fn list_work_notes_tx(
    conn: &Connection,
    work_id: &str,
    kind: Option<WorkNoteKind>,
    limit: u64,
) -> Result<WorkNotePage, LedgerError> {
    require_snapshot_tx(conn, work_id)?;
    if !(1..=WORK_NOTE_MAX_LIMIT).contains(&limit) {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!("work note list limit must be between 1 and {WORK_NOTE_MAX_LIMIT}"),
        ));
    }
    let kind = kind.map(WorkNoteKind::as_str);
    let total: i64 = conn.query_row(
        "SELECT COUNT(*) FROM work_notes \
         WHERE work_id = ?1 AND (?2 IS NULL OR kind = ?2)",
        rusqlite::params![work_id, kind],
        |row| row.get(0),
    )?;
    let mut statement = conn.prepare(
        "SELECT note_id, work_id, kind, schema, actor, body_json, written_at \
         FROM work_notes \
         WHERE work_id = ?1 AND (?2 IS NULL OR kind = ?2) \
         ORDER BY written_at, note_id LIMIT ?3",
    )?;
    let rows = statement.query_map(
        rusqlite::params![work_id, kind, i64::try_from(limit).unwrap_or(i64::MAX)],
        work_note_from_row,
    )?;
    let notes = rows.collect::<Result<Vec<_>, _>>()?;
    Ok(WorkNotePage {
        notes,
        total: u64::try_from(total)
            .map_err(|_| internal(format!("negative work note total for {work_id:?}")))?,
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

fn apply_work_planning_spec_tx(
    conn: &Connection,
    work_id: &str,
    actor: &str,
    expected_revision: Option<i64>,
    allow_deferred: bool,
    spec: &WorkSpecFields,
) -> Result<WorkItemSnapshot, LedgerError> {
    let current = require_snapshot_tx(conn, work_id)?;
    if let Some(expected_revision) = expected_revision {
        if current.revision != expected_revision {
            return Err(refused(
                ErrorCode::WorkContention,
                format!(
                    "work item {work_id:?} revision moved: expected {expected_revision}, \
                     current {}",
                    current.revision
                ),
            ));
        }
    }
    let promotable = current.status == WorkStatus::Blocked
        || (allow_deferred && current.status == WorkStatus::Deferred);
    if !promotable {
        let message = if allow_deferred {
            format!(
                "work promote requires a blocked or deferred stub; {work_id:?} is {}; \
                 use work update for open items or work reopen for closed items",
                current.status.as_str()
            )
        } else {
            format!(
                "planning apply requires a blocked stub; {work_id:?} is {}",
                current.status.as_str()
            )
        };
        return Err(refused(ErrorCode::InvalidRequest, message));
    }
    if current.assignee.is_some() {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!("planning apply requires empty custody on {work_id:?}"),
        ));
    }
    let next = current.revision + 1;
    insert_revision_tx(conn, work_id, next, spec, WorkRevisionCause::PlanningApply)?;
    conn.execute(
        "UPDATE work_items SET current_revision = ?2, status = 'open', updated_at = ?3 \
         WHERE work_id = ?1",
        rusqlite::params![work_id, next, now_iso()],
    )?;
    append_event_tx(
        conn,
        None,
        "work.updated",
        &json!({
            "workId": work_id,
            "verb": "planning-apply",
            "actor": actor,
            "status": { "from": current.status, "to": WorkStatus::Open },
            "revision": next,
        }),
    )?;
    require_snapshot_tx(conn, work_id)
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
    /// Append one annotation without minting a work revision or touching
    /// coordination state. Closed work items remain valid evidence targets.
    pub fn add_work_note(&self, mut new: NewWorkNote) -> Result<WorkNoteRow, LedgerError> {
        new.body_json = canonical_work_note_body(&new.body_json)?;
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let row = insert_work_note_tx(&tx, &new, uuid::Uuid::now_v7().to_string(), now_iso())?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Atomically append one note and seal its `(name, key)` operation
    /// receipt. A crash exposes either neither row or both rows.
    pub fn apply_work_note_operation(
        &self,
        name: &str,
        request: &OperationRequest,
        mut new: NewWorkNote,
    ) -> Result<OperationResponse, LedgerError> {
        new.body_json = canonical_work_note_body(&new.body_json)?;
        let name = name.to_owned();
        let request = request.clone();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            if let Some(response) = replay_ledger_operation_tx(&tx, &name, &request)? {
                tx.commit()?;
                return Ok(response);
            }
            let hash = request_sha256(&request).map_err(|error| {
                refused(
                    ErrorCode::InvalidRequest,
                    format!("params cannot be canonicalized: {error}"),
                )
            })?;
            let operation_id = uuid::Uuid::now_v7().to_string();
            let operation_written_at = now_iso();
            tx.execute(
                "INSERT INTO operations (operation_id, name, idempotency_key, \
                 request_sha256, effect_class, run_id, claim_token, state, \
                 created_at, updated_at) \
                 VALUES (?1, ?2, ?3, ?4, 'safe-retry', ?5, NULL, 'in_progress', ?6, ?6)",
                rusqlite::params![
                    operation_id,
                    name,
                    request.idempotency_key,
                    hash,
                    request.run_id,
                    operation_written_at,
                ],
            )?;
            let note = insert_work_note_tx(&tx, &new, uuid::Uuid::now_v7().to_string(), now_iso())?;
            let response = OperationResponse {
                operation_id: operation_id.clone(),
                reused: false,
                ok: true,
                result: Some(json!({
                    "note": note,
                    "nextSteps": ["inspect durable evidence with work_note_list"],
                })),
                error: None,
            };
            settle_operation(&tx, &operation_id, &response, true)?;
            tx.commit()?;
            Ok(response)
        })
    }

    /// List one work item's annotations with the optional kind predicate and
    /// collection bound enforced in SQL.
    pub fn list_work_notes(
        &self,
        work_id: &str,
        kind: Option<WorkNoteKind>,
        limit: u64,
    ) -> Result<WorkNotePage, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| list_work_notes_tx(conn, &work_id, kind, limit))
    }

    /// Count annotations without loading their bodies.
    pub fn work_note_count(&self, work_id: &str) -> Result<u64, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| {
            require_snapshot_tx(conn, &work_id)?;
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM work_notes WHERE work_id = ?1",
                [&work_id],
                |row| row.get(0),
            )?;
            u64::try_from(count)
                .map_err(|_| internal(format!("negative work note count for {work_id:?}")))
        })
    }

    /// Return the exact requested work ids carrying at least one note of
    /// `kind`, in one read transaction and without loading note bodies.
    pub fn work_items_with_note_kind(
        &self,
        work_ids: &[String],
        kind: WorkNoteKind,
    ) -> Result<BTreeSet<String>, LedgerError> {
        let work_ids = work_ids.to_vec();
        self.submit(move |conn| {
            if work_ids.is_empty() {
                return Ok(BTreeSet::new());
            }
            let ids_json = serde_json::to_string(&work_ids)?;
            let mut stmt = conn.prepare(
                "SELECT DISTINCT work_id FROM work_notes \
                 WHERE kind = ?1 AND work_id IN (SELECT value FROM json_each(?2)) \
                 ORDER BY work_id",
            )?;
            let rows = stmt.query_map([kind.as_str(), ids_json.as_str()], |row| row.get(0))?;
            let mut found = BTreeSet::new();
            for row in rows {
                found.insert(row?);
            }
            Ok(found)
        })
    }

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
                // execute reports affected rows: a duplicate edge (the
                // importer emits parent-child from both the dependency list
                // and the parent field) is ignored and must not be counted.
                inserted_edges += tx.execute(
                    "INSERT OR IGNORE INTO work_deps (from_id, to_id, kind) \
                     VALUES (?1, ?2, ?3)",
                    rusqlite::params![edge.from_id, edge.to_id, edge.kind.as_str()],
                )? as u64;
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
            let snapshots = collection_tx(
                conn,
                WorkItemCollection::ExactIds,
                &ids,
                &WorkItemFilters::default(),
            )?;
            let mut by_id = snapshots
                .into_iter()
                .map(|snapshot| (snapshot.work_id.clone(), snapshot))
                .collect::<BTreeMap<_, _>>();
            let mut seen = std::collections::BTreeSet::new();
            let mut out = Vec::with_capacity(by_id.len());
            for id in ids {
                if seen.insert(id.clone()) {
                    if let Some(snapshot) = by_id.remove(&id) {
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
            collection_tx(
                conn,
                WorkItemCollection::All,
                &[],
                &WorkItemFilters::default(),
            )
        })
    }

    /// Every work item matching all populated predicates, id-ordered.
    pub fn filtered_work_items(
        &self,
        filters: WorkItemFilters,
    ) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        self.submit(move |conn| collection_tx(conn, WorkItemCollection::All, &[], &filters))
    }

    /// Matching snapshots among exact ids, in id order. The selection and
    /// every field predicate execute in one SQL statement.
    pub fn filtered_work_items_by_id(
        &self,
        ids: &[String],
        filters: WorkItemFilters,
    ) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        let ids = ids.to_vec();
        self.submit(move |conn| collection_tx(conn, WorkItemCollection::ExactIds, &ids, &filters))
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
    /// A moved revision refuses with `WorkContention` (recoverable: re-read
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
                    ErrorCode::WorkContention,
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

    /// Apply a revision-CAS update to scheduling priority and/or spec fields
    /// in one transaction. Priority is coordination state and never mints a
    /// revision; a supplied spec mints exactly one `Authored` revision even
    /// when priority changes in the same write.
    pub fn update_work_item(
        &self,
        work_id: &str,
        expected_revision: i64,
        spec: Option<WorkSpecFields>,
        priority: Option<i64>,
        actor: &str,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        if spec.is_none() && priority.is_none() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "work update requires at least one spec field or priority",
            ));
        }
        let work_id = work_id.to_owned();
        let actor = actor.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let current = require_snapshot_tx(&tx, &work_id)?;
            if current.revision != expected_revision {
                return Err(refused(
                    ErrorCode::WorkContention,
                    format!(
                        "work item {work_id:?} revision moved: expected {expected_revision}, \
                         current {}",
                        current.revision
                    ),
                ));
            }
            let next_revision = if let Some(spec) = &spec {
                let next = expected_revision + 1;
                insert_revision_tx(&tx, &work_id, next, spec, WorkRevisionCause::Authored)?;
                next
            } else {
                expected_revision
            };
            match (spec.is_some(), priority) {
                (true, Some(priority)) => {
                    tx.execute(
                        "UPDATE work_items SET current_revision = ?2, priority = ?3, \
                         updated_at = ?4 WHERE work_id = ?1",
                        rusqlite::params![work_id, next_revision, priority, now_iso()],
                    )?;
                }
                (true, None) => {
                    tx.execute(
                        "UPDATE work_items SET current_revision = ?2, updated_at = ?3 \
                         WHERE work_id = ?1",
                        rusqlite::params![work_id, next_revision, now_iso()],
                    )?;
                }
                (false, Some(priority)) => {
                    tx.execute(
                        "UPDATE work_items SET priority = ?2, updated_at = ?3 WHERE work_id = ?1",
                        rusqlite::params![work_id, priority, now_iso()],
                    )?;
                }
                (false, None) => unreachable!("empty updates refuse before the transaction"),
            }
            if let Some(priority) = priority {
                append_event_tx(
                    &tx,
                    None,
                    "work.updated",
                    &json!({
                        "workId": work_id,
                        "verb": "update",
                        "actor": actor,
                        "priority": { "from": current.priority, "to": priority },
                        "revision": { "from": current.revision, "to": next_revision },
                    }),
                )?;
            }
            let snapshot = require_snapshot_tx(&tx, &work_id)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// The planning run's guarded apply, exactly the bd-era contract in one
    /// transaction: refuses unless the item is `Blocked` with EMPTY custody,
    /// mints the next spec revision with cause `PlanningApply`, and promotes
    /// the stub to `Open`. No revision token is taken — atomicity is the
    /// fence the bd path faked with a read-back, and the epic scheduler's own
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
            let snapshot = apply_work_planning_spec_tx(&tx, &work_id, &actor, None, false, &spec)?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Atomically fence and promote one blocked or deferred stub. The
    /// operation receipt, `PlanningApply` revision, open status, and
    /// coordination event commit together; revision drift refuses before
    /// any of them land.
    pub fn apply_work_promote_operation(
        &self,
        request: &OperationRequest,
        work_id: &str,
        expected_revision: i64,
        actor: &str,
        spec: WorkSpecFields,
    ) -> Result<OperationResponse, LedgerError> {
        let request = request.clone();
        let work_id = work_id.to_owned();
        let actor = actor.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            if let Some(response) = replay_ledger_operation_tx(&tx, "work_promote", &request)? {
                tx.commit()?;
                return Ok(response);
            }
            let hash = request_sha256(&request).map_err(|error| {
                refused(
                    ErrorCode::InvalidRequest,
                    format!("params cannot be canonicalized: {error}"),
                )
            })?;
            let operation_id = uuid::Uuid::now_v7().to_string();
            let written_at = now_iso();
            tx.execute(
                "INSERT INTO operations (operation_id, name, idempotency_key, \
                 request_sha256, effect_class, run_id, claim_token, state, \
                 created_at, updated_at) \
                 VALUES (?1, 'work_promote', ?2, ?3, 'safe-retry', ?4, NULL, \
                 'in_progress', ?5, ?5)",
                rusqlite::params![
                    operation_id,
                    request.idempotency_key,
                    hash,
                    request.run_id,
                    written_at,
                ],
            )?;
            let snapshot = apply_work_planning_spec_tx(
                &tx,
                &work_id,
                &actor,
                Some(expected_revision),
                true,
                &spec,
            )?;
            let response = OperationResponse {
                operation_id: operation_id.clone(),
                reused: false,
                ok: true,
                result: Some(json!({
                    "work": snapshot,
                    "nextSteps": [
                        "the stub is open; use work_update for later spec or priority changes"
                    ],
                })),
                error: None,
            };
            settle_operation(&tx, &operation_id, &response, true)?;
            tx.commit()?;
            Ok(response)
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
                Some(current) => {
                    return Err(refused(
                        ErrorCode::WorkLeaseHeld,
                        format!("work item {work_id:?} is held by {current:?}, not {holder:?}"),
                    ));
                }
                None => {
                    return Err(refused(
                        ErrorCode::WorkLeaseHeld,
                        format!("work item {work_id:?} is unheld; expected holder {holder:?}"),
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
    /// no-op; a different holder refuses with `WorkLeaseHeld`.
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
                        ErrorCode::WorkLeaseHeld,
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
    /// idempotent no-op; a different holder refuses with `WorkLeaseHeld`.
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
                        ErrorCode::WorkLeaseHeld,
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

    /// The repair revert: mint revision N+1 as an exact copy of an earlier
    /// revision's spec fields, guarded by the CAS. Append-only history makes
    /// bad spec content recoverable by construction — nothing is rewritten.
    pub fn revert_work_spec(
        &self,
        work_id: &str,
        expected_revision: i64,
        to_revision: i64,
        actor: &str,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let actor = actor.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let current = require_snapshot_tx(&tx, &work_id)?;
            if current.revision != expected_revision {
                return Err(refused(
                    ErrorCode::WorkContention,
                    format!(
                        "work item {work_id:?} revision moved: expected {expected_revision}, \
                         current {}",
                        current.revision
                    ),
                ));
            }
            let target = tx
                .query_row(
                    "SELECT title, description, acceptance_criteria, design, notes \
                     FROM work_revisions WHERE work_id = ?1 AND revision = ?2",
                    rusqlite::params![work_id, to_revision],
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
                .optional()?
                .ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        format!("work item {work_id:?} has no revision {to_revision}"),
                    )
                })?;
            let next = expected_revision + 1;
            insert_revision_tx(&tx, &work_id, next, &target, WorkRevisionCause::Revert)?;
            tx.execute(
                "UPDATE work_items SET current_revision = ?2, updated_at = ?3 \
                 WHERE work_id = ?1",
                rusqlite::params![work_id, next, now_iso()],
            )?;
            append_event_tx(
                &tx,
                None,
                "work.updated",
                &json!({
                    "workId": work_id,
                    "verb": "revert",
                    "actor": actor,
                    "revision": next,
                    "revertedTo": to_revision,
                }),
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
                    ErrorCode::WorkContention,
                    format!("work item {work_id:?} is already held by {current:?}"),
                ));
            }
            if before.status != expected_status {
                return Err(refused(
                    ErrorCode::WorkContention,
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

    /// The redispatch verb, atomic: link `successor_id -> work_id` with a
    /// `supersedes` edge and close the superseded item, in one transaction.
    /// The successor must already exist; the superseded item may be in any
    /// non-closed state (closing a closed item is the idempotent no-op).
    pub fn supersede_work_item(
        &self,
        work_id: &str,
        successor_id: &str,
        actor: &str,
    ) -> Result<WorkItemSnapshot, LedgerError> {
        let work_id = work_id.to_owned();
        let successor_id = successor_id.to_owned();
        let actor = actor.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = require_snapshot_tx(&tx, &work_id)?;
            require_snapshot_tx(&tx, &successor_id)?;
            tx.execute(
                "INSERT OR IGNORE INTO work_deps (from_id, to_id, kind) \
                 VALUES (?1, ?2, 'supersedes')",
                rusqlite::params![successor_id, work_id],
            )?;
            // An already-closed target (importer residue can carry custody
            // on closed rows) still clears custody and lease so the event's
            // `assignee: {from, to: null}` never contradicts the row.
            if before.status != WorkStatus::Closed || before.assignee.is_some() {
                set_coordination_tx(&tx, &work_id, WorkStatus::Closed, None)?;
                clear_lease_tx(&tx, &work_id)?;
            }
            append_event_tx(
                &tx,
                None,
                "work.updated",
                &json!({
                    "workId": work_id,
                    "verb": "supersede",
                    "actor": actor,
                    "supersededBy": successor_id,
                    "status": { "from": before.status, "to": WorkStatus::Closed },
                    "assignee": { "from": before.assignee, "to": Option::<String>::None },
                }),
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

    /// Work items whose `supersedes` provenance points at this item.
    pub fn work_superseders(&self, work_id: &str) -> Result<Vec<String>, LedgerError> {
        let work_id = work_id.to_owned();
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT from_id FROM work_deps \
                 WHERE to_id = ?1 AND kind = 'supersedes' ORDER BY from_id",
            )?;
            let rows = stmt.query_map([&work_id], |row| row.get::<_, String>(0))?;
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
                 WHERE d.to_id = ?1 AND d.kind = 'parent-child' \
                 ORDER BY wi.priority IS NULL, wi.priority, wi.work_id"
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
        self.nonterminal_work_items_filtered(WorkItemFilters::default())
    }

    /// Every nonterminal work item matching all populated predicates,
    /// priority-ordered.
    pub fn nonterminal_work_items_filtered(
        &self,
        filters: WorkItemFilters,
    ) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        self.submit(move |conn| collection_tx(conn, WorkItemCollection::Nonterminal, &[], &filters))
    }

    /// The ready frontier: `Open`, unassigned, every `blocks` target closed,
    /// no lease row. Ordered by priority ascending (nulls last — a missing
    /// priority never outranks a stated one), then id.
    pub fn ready_work_items(&self) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        self.ready_work_items_filtered(WorkItemFilters::default())
    }

    /// The ready frontier restricted by all populated predicates.
    pub fn ready_work_items_filtered(
        &self,
        filters: WorkItemFilters,
    ) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
        self.submit(move |conn| collection_tx(conn, WorkItemCollection::Ready, &[], &filters))
    }

    /// One keyset page of the filtered ready frontier. The count and page
    /// share one read transaction, so `total` describes the same snapshot as
    /// the returned rows.
    pub fn ready_work_items_page_filtered(
        &self,
        filters: WorkItemFilters,
        after: Option<WorkReadyAfter>,
        limit: usize,
    ) -> Result<WorkReadyPage, LedgerError> {
        if limit == 0 {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "work ready page limit must be positive",
            ));
        }
        if after
            .as_ref()
            .is_some_and(|cursor| cursor.work_id.trim().is_empty())
        {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "work ready cursor work id must be non-empty",
            ));
        }
        self.submit(move |conn| ready_page_tx(conn, &filters, after.as_ref(), limit))
    }

    /// Hydrate live filtered rows and/or exact ids with dependency statuses
    /// in one actor submission and one read transaction. Exact ids preserve
    /// caller order and omissions remain absent for the caller to adjudicate.
    pub fn work_plan_snapshot(
        &self,
        ids: &[String],
        filters: Option<WorkItemFilters>,
    ) -> Result<WorkPlanSnapshot, LedgerError> {
        let ids = ids.to_vec();
        self.submit(move |conn| work_plan_snapshot_tx(conn, &ids, filters.as_ref()))
    }
}

/// One work-store integrity finding, with the typed repair that clears it.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkStoreFinding {
    /// The work item.
    pub work_id: String,
    /// A stable condition slug.
    pub condition: String,
    /// Human-readable detail.
    pub detail: String,
    /// The typed verb that repairs it.
    pub repair: String,
}

impl Ledger {
    /// Enumerate work-store invariant violations — checkable because the
    /// invariants are ours. Ambiguous states are surfaced with their typed
    /// repair, never auto-mutated.
    pub fn work_store_findings(&self) -> Result<Vec<WorkStoreFinding>, LedgerError> {
        self.submit(move |conn| {
            let mut findings = Vec::new();
            let mut stmt = conn.prepare(
                "SELECT wl.work_id, wl.holder FROM work_leases wl \
                 JOIN work_items wi ON wi.work_id = wl.work_id \
                 WHERE wi.status = 'closed'",
            )?;
            let rows = stmt.query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })?;
            for row in rows {
                let (work_id, holder) = row?;
                findings.push(WorkStoreFinding {
                    detail: format!("closed item still holds a lease under {holder:?}"),
                    repair: format!("work_release with actor {holder:?}"),
                    condition: "closed-with-lease".to_owned(),
                    work_id,
                });
            }
            drop(stmt);
            let mut stmt = conn.prepare(
                "SELECT wi.work_id, wi.current_revision, MAX(wr.revision) \
                 FROM work_items wi JOIN work_revisions wr ON wr.work_id = wi.work_id \
                 GROUP BY wi.work_id HAVING wi.current_revision <> MAX(wr.revision)",
            )?;
            let rows = stmt.query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, i64>(1)?,
                    row.get::<_, i64>(2)?,
                ))
            })?;
            for row in rows {
                let (work_id, current, max) = row?;
                findings.push(WorkStoreFinding {
                    detail: format!(
                        "current_revision {current} does not match the newest stored \
                         revision {max}"
                    ),
                    repair: "storage corruption: restore from the latest snapshot".to_owned(),
                    condition: "revision-pointer-drift".to_owned(),
                    work_id,
                });
            }
            drop(stmt);
            let mut stmt = conn.prepare(
                "SELECT wi.work_id, wi.assignee FROM work_items wi \
                 WHERE wi.status = 'in_progress' AND wi.assignee IS NOT NULL \
                   AND NOT EXISTS (SELECT 1 FROM work_leases wl \
                                   WHERE wl.work_id = wi.work_id) \
                   AND NOT EXISTS (SELECT 1 FROM runs r \
                                   JOIN packets p ON p.run_id = r.run_id \
                                   JOIN attempts a ON a.packet_id = p.packet_id \
                                   WHERE r.bead_id = wi.work_id \
                                     AND a.state IN ('running','revoking'))",
            )?;
            let rows = stmt.query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, Option<String>>(1)?))
            })?;
            for row in rows {
                let (work_id, assignee) = row?;
                let holder = assignee.unwrap_or_default();
                findings.push(WorkStoreFinding {
                    detail: format!(
                        "in_progress with custody {holder:?} but no lease row and no live \
                         attempt — crash or import residue"
                    ),
                    repair: format!(
                        "the scoped reclaim frees it (custody without a lease reads as \
                         long-expired), or work_release with actor {holder:?}"
                    ),
                    condition: "custody-residue".to_owned(),
                    work_id,
                });
            }
            Ok(findings)
        })
    }
}

pub(crate) fn ready_tx(conn: &Connection) -> Result<Vec<WorkItemSnapshot>, LedgerError> {
    collection_tx(
        conn,
        WorkItemCollection::Ready,
        &[],
        &WorkItemFilters::default(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ready_work_items_plan_uses_the_partial_ready_index() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        Ledger::open(&path)
            .expect("migrate")
            .close()
            .expect("close");
        let conn = Connection::open(path).expect("raw connection");
        let (sql, params) =
            collection_query(WorkItemCollection::Ready, &[], &WorkItemFilters::default());
        let mut statement = conn
            .prepare(&format!("EXPLAIN QUERY PLAN {sql}"))
            .expect("prepare plan");
        let details = statement
            .query_map(rusqlite::params_from_iter(params.iter()), |row| {
                row.get::<_, String>(3)
            })
            .expect("query plan")
            .collect::<Result<Vec<_>, _>>()
            .expect("plan rows");

        assert!(
            details
                .iter()
                .any(|detail| detail.contains("work_items_ready")),
            "partial ready index is absent from plan: {details:?}"
        );
    }

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
    fn import_counts_only_edge_rows_actually_inserted() {
        let (_dir, l) = ledger();
        let imported = |id: &str| ImportedWorkItem {
            work_id: id.to_string(),
            kind: WorkKind::Task,
            status: WorkStatus::Open,
            priority: None,
            assignee: None,
            metadata: BTreeMap::new(),
            spec: spec(id),
        };
        let edge = WorkDepRow {
            from_id: "beads-imp-a".to_string(),
            to_id: "beads-imp-b".to_string(),
            kind: WorkDepKind::ParentChild,
        };
        let report = l
            .import_work_store(
                vec![imported("beads-imp-a"), imported("beads-imp-b")],
                vec![edge.clone(), edge],
            )
            .unwrap();
        assert_eq!(
            report.inserted_edges, 1,
            "a duplicate edge is ignored, never counted"
        );
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
        assert_eq!(err.code(), ErrorCode::WorkContention);
        assert_eq!(l.work_item("beads-cas").unwrap().unwrap().revision, 2);

        // The pinned revision dereferences to its exact bytes.
        let rev1 = l.work_revision("beads-cas", 1).unwrap().unwrap();
        assert_eq!(rev1.title, "beads-cas");
        let rev2 = l.work_revision("beads-cas", 2).unwrap().unwrap();
        assert_eq!(rev2.title, "v2");
        assert_eq!(l.work_revision("beads-cas", 3).unwrap(), None);
    }

    #[test]
    fn priority_update_is_cas_fenced_without_minting_a_revision() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-priority", WorkStatus::Open))
            .unwrap();

        let priority_only = l
            .update_work_item("beads-priority", 1, None, Some(2), "operator")
            .unwrap();
        assert_eq!(priority_only.priority, Some(2));
        assert_eq!(priority_only.revision, 1);
        assert_eq!(l.work_revision("beads-priority", 2).unwrap(), None);

        let combined = l
            .update_work_item(
                "beads-priority",
                1,
                Some(spec("combined")),
                Some(1),
                "operator",
            )
            .unwrap();
        assert_eq!(combined.priority, Some(1));
        assert_eq!(combined.revision, 2);
        assert_eq!(combined.spec.title, "combined");

        let updates = l.list_events_by_kind("work.updated").unwrap();
        let payload: serde_json::Value =
            serde_json::from_str(&updates.last().unwrap().payload_json).unwrap();
        assert_eq!(payload["priority"], json!({"from": 2, "to": 1}));
        assert_eq!(payload["revision"], json!({"from": 1, "to": 2}));
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
    fn work_notes_canonicalize_filter_in_sql_and_order_ties_by_id() {
        let (dir, l) = ledger();
        l.create_work_item(item("beads-noted", WorkStatus::Open))
            .unwrap();
        let first = l
            .add_work_note(NewWorkNote {
                work_id: "beads-noted".to_owned(),
                kind: WorkNoteKind::Critique,
                schema: "critique/0".to_owned(),
                actor: "critic".to_owned(),
                body_json: r#"{"z":1,"a":{"d":4,"b":2}}"#.to_owned(),
            })
            .unwrap();
        assert_eq!(first.body_json, r#"{"a":{"b":2,"d":4},"z":1}"#);
        assert_eq!(l.work_item("beads-noted").unwrap().unwrap().revision, 1);
        assert_eq!(l.work_note_count("beads-noted").unwrap(), 1);
        l.close().expect("close ledger before raw tie fixture");

        let path = dir.path().join("state.db");
        let conn = rusqlite::Connection::open(path).expect("raw database");
        conn.execute_batch(
            "INSERT INTO work_notes \
               (note_id, work_id, kind, schema, actor, body_json, written_at) VALUES \
             ('note-z','beads-noted','recommendation','recommendation/0','critic','{}',
              '9999-01-01T00:00:00.000000000Z'), \
             ('note-a','beads-noted','recommendation','recommendation/0','critic','{}',
              '9999-01-01T00:00:00.000000000Z');",
        )
        .expect("seed tied notes");
        let page = list_work_notes_tx(&conn, "beads-noted", Some(WorkNoteKind::Recommendation), 10)
            .expect("filtered notes");
        assert_eq!(page.total, 2);
        assert_eq!(
            page.notes
                .iter()
                .map(|note| note.note_id.as_str())
                .collect::<Vec<_>>(),
            ["note-a", "note-z"],
            "written_at ties are ordered by note_id"
        );

        conn.execute_batch(
            "WITH RECURSIVE seq(value) AS \
               (VALUES(0) UNION ALL SELECT value + 1 FROM seq WHERE value < 100) \
             INSERT INTO work_notes \
               (note_id, work_id, kind, schema, actor, body_json, written_at) \
             SELECT printf('bulk-%03d', value), 'beads-noted', 'comment', 'comment/0', \
                    'operator', '{}', '9998-01-01T00:00:00.000000000Z' FROM seq;",
        )
        .expect("seed bounded listing");
        let bounded = list_work_notes_tx(
            &conn,
            "beads-noted",
            Some(WorkNoteKind::Comment),
            WORK_NOTE_DEFAULT_LIMIT,
        )
        .expect("bounded notes");
        assert_eq!(bounded.notes.len(), 100);
        assert_eq!(bounded.total, 101);
    }

    #[test]
    fn work_note_body_refuses_duplicate_keys_and_non_integer_numbers() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-note-json", WorkStatus::Open))
            .unwrap();
        for (body, rule) in [
            (r#"{"same":1,"same":2}"#, "duplicate object key"),
            (r#"{"float":1.5}"#, "non-integer number"),
        ] {
            let error = l
                .add_work_note(NewWorkNote {
                    work_id: "beads-note-json".to_owned(),
                    kind: WorkNoteKind::Comment,
                    schema: "comment/0".to_owned(),
                    actor: "operator".to_owned(),
                    body_json: body.to_owned(),
                })
                .expect_err("ambiguous JSON must refuse");
            assert!(error.to_string().contains(rule), "{error}");
        }
        assert_eq!(l.work_note_count("beads-note-json").unwrap(), 0);
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
    fn public_promote_atomically_fences_revision_status_and_receipt() {
        let (_dir, l) = ledger();
        l.create_work_item(item("beads-promote", WorkStatus::Blocked))
            .unwrap();
        let request = OperationRequest {
            schema_version: 1,
            idempotency_key: "op:work_promote:beads-promote:-:1".to_owned(),
            run_id: None,
            params: json!({
                "id": "beads-promote",
                "expectedRevision": 1,
                "description": "planned description",
            })
            .as_object()
            .unwrap()
            .clone(),
        };
        let response = l
            .apply_work_promote_operation(&request, "beads-promote", 1, "operator", spec("planned"))
            .unwrap();
        assert!(response.ok);
        let promoted = l.work_item("beads-promote").unwrap().unwrap();
        assert_eq!(promoted.revision, 2);
        assert_eq!(promoted.status, WorkStatus::Open);
        let cause: String = l
            .submit(|conn| {
                Ok(conn.query_row(
                    "SELECT cause FROM work_revisions WHERE work_id = 'beads-promote' \
                     AND revision = 2",
                    [],
                    |row| row.get(0),
                )?)
            })
            .unwrap();
        assert_eq!(cause, "planning-apply");
        let operation = l
            .find_operation("work_promote", &request.idempotency_key)
            .unwrap()
            .unwrap();
        assert_eq!(operation.state, crate::OperationState::Terminal);

        l.create_work_item(item("beads-promote-race", WorkStatus::Blocked))
            .unwrap();
        l.update_work_spec(
            "beads-promote-race",
            1,
            spec("raced"),
            WorkRevisionCause::Authored,
        )
        .unwrap();
        let mut raced_request = request.clone();
        raced_request.idempotency_key = "op:work_promote:beads-promote-race:-:1".to_owned();
        raced_request.params.insert(
            "id".to_owned(),
            serde_json::Value::String("beads-promote-race".to_owned()),
        );
        let error = l
            .apply_work_promote_operation(
                &raced_request,
                "beads-promote-race",
                1,
                "operator",
                spec("never lands"),
            )
            .unwrap_err();
        assert_eq!(error.code(), ErrorCode::WorkContention);
        let raced = l.work_item("beads-promote-race").unwrap().unwrap();
        assert_eq!(raced.revision, 2);
        assert_eq!(raced.status, WorkStatus::Blocked);

        let mut open_request = request.clone();
        open_request.idempotency_key = "op:work_promote:beads-open:-:1".to_owned();
        open_request.params.insert(
            "id".to_owned(),
            serde_json::Value::String("beads-open".to_owned()),
        );
        l.create_work_item(item("beads-open", WorkStatus::Open))
            .unwrap();
        let error = l
            .apply_work_promote_operation(
                &open_request,
                "beads-open",
                1,
                "operator",
                spec("never lands"),
            )
            .unwrap_err();
        let message = error.to_string();
        assert!(message.contains("work update"), "{message}");
        assert!(message.contains("work reopen"), "{message}");

        l.create_work_item(item("beads-deferred", WorkStatus::Blocked))
            .unwrap();
        l.submit(|conn| {
            conn.execute(
                "UPDATE work_items SET status = 'deferred' WHERE work_id = 'beads-deferred'",
                [],
            )?;
            Ok(())
        })
        .unwrap();
        let mut deferred_request = request;
        deferred_request.idempotency_key = "op:work_promote:beads-deferred:-:1".to_owned();
        deferred_request.params.insert(
            "id".to_owned(),
            serde_json::Value::String("beads-deferred".to_owned()),
        );
        l.apply_work_promote_operation(
            &deferred_request,
            "beads-deferred",
            1,
            "operator",
            spec("deferred plan"),
        )
        .unwrap();
        assert_eq!(
            l.work_item("beads-deferred").unwrap().unwrap().status,
            WorkStatus::Open
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
        assert_eq!(err.code(), ErrorCode::WorkLeaseHeld);
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
        assert_eq!(err.code(), ErrorCode::WorkLeaseHeld);
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
        assert_eq!(err.code(), ErrorCode::WorkContention);
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
    fn exact_work_items_batch_preserves_first_request_order() {
        let (_dir, ledger) = ledger();
        ledger
            .create_work_item(item("beads-a", WorkStatus::Open))
            .unwrap();
        ledger
            .create_work_item(item("beads-b", WorkStatus::Open))
            .unwrap();
        let rows = ledger
            .work_items(&[
                "beads-b".to_owned(),
                "missing".to_owned(),
                "beads-a".to_owned(),
                "beads-b".to_owned(),
            ])
            .expect("one exact-id batch");
        assert_eq!(
            rows.iter()
                .map(|row| row.work_id.as_str())
                .collect::<Vec<_>>(),
            ["beads-b", "beads-a"]
        );
    }

    #[test]
    fn work_item_filters_compose_in_one_sql_where_clause() {
        let (dir, l) = ledger();
        let filtered_item = |id: &str, repository: &str, status: WorkStatus| {
            let mut value = item(id, status);
            value
                .metadata
                .insert("repository".to_owned(), repository.to_owned());
            value
        };
        l.create_work_item(filtered_item("repo-a-open", "/repo/a", WorkStatus::Open))
            .unwrap();
        l.create_work_item(filtered_item(
            "repo-a-alice",
            "/repo/a",
            WorkStatus::Blocked,
        ))
        .unwrap();
        l.assign_unassigned_work_item("repo-a-alice", "alice", WorkStatus::Blocked)
            .unwrap();
        l.create_work_item(filtered_item("repo-a-bob", "/repo/a", WorkStatus::Blocked))
            .unwrap();
        l.assign_unassigned_work_item("repo-a-bob", "bob", WorkStatus::Blocked)
            .unwrap();
        l.create_work_item(filtered_item(
            "repo-b-alice",
            "/repo/b",
            WorkStatus::Blocked,
        ))
        .unwrap();
        l.assign_unassigned_work_item("repo-b-alice", "alice", WorkStatus::Blocked)
            .unwrap();

        let filters = WorkItemFilters {
            repository: Some("/repo/a".to_owned()),
            status: Some(WorkStatus::Blocked),
            assignee: Some("alice".to_owned()),
        };
        let rows = l.filtered_work_items(filters.clone()).unwrap();
        assert_eq!(
            rows.iter()
                .map(|row| row.work_id.as_str())
                .collect::<Vec<_>>(),
            ["repo-a-alice"]
        );

        let (sql, params) = collection_query(WorkItemCollection::All, &[], &filters);
        assert!(
            sql.contains("wi.repository = ?1")
                && sql.contains("wi.status = ?2")
                && sql.contains("wi.assignee = ?3"),
            "all filter predicates must remain in SQL: {sql}"
        );
        assert_eq!(params, ["/repo/a", "blocked", "alice"]);

        l.close().expect("close ledger");
        let conn = Connection::open(dir.path().join("state.db")).expect("raw connection");
        let old_sql = format!(
            "{SNAPSHOT_SQL} WHERE \
             json_extract(wi.metadata_json, '$.repository') = ?1 \
             AND wi.status = ?2 AND wi.assignee = ?3 ORDER BY wi.work_id"
        );
        let mut old_statement = conn
            .prepare(&old_sql)
            .expect("prepare old repository filter");
        let old_rows = old_statement
            .query_map(["/repo/a", "blocked", "alice"], snapshot_from_row)
            .expect("query old repository filter")
            .collect::<Result<Vec<_>, _>>()
            .expect("old repository rows");
        assert_eq!(
            rows, old_rows,
            "the promoted column changes no result bytes"
        );

        let mut plan_statement = conn
            .prepare(&format!("EXPLAIN QUERY PLAN {sql}"))
            .expect("prepare repository plan");
        let details = plan_statement
            .query_map(rusqlite::params_from_iter(params.iter()), |row| {
                row.get::<_, String>(3)
            })
            .expect("repository query plan")
            .collect::<Result<Vec<_>, _>>()
            .expect("repository plan rows");
        assert!(
            details
                .iter()
                .any(|detail| detail.contains("work_items_repository_status")),
            "repository/status index is absent from plan: {details:?}"
        );
    }

    #[test]
    fn plan_snapshot_hydrates_two_hundred_rows_in_one_actor_read() {
        let (_dir, l) = ledger();
        let ids: Vec<String> = (0..200).map(|index| format!("plan-{index:03}")).collect();
        for (index, id) in ids.iter().enumerate() {
            let mut value = item(id, WorkStatus::Open);
            value.priority = Some(index as i64);
            l.create_work_item(value).unwrap();
            if index > 0 {
                l.add_work_dep(id, &ids[index - 1], WorkDepKind::Related)
                    .unwrap();
            }
        }

        let snapshot = l
            .work_plan_snapshot(&ids, Some(WorkItemFilters::default()))
            .expect("one hydrated plan snapshot");
        assert_eq!(snapshot.matching.len(), 200);
        assert_eq!(snapshot.exact.len(), 200);
        assert_eq!(snapshot.exact[0].item.work_id, "plan-000");
        assert!(snapshot.exact[0].dependencies.is_empty());
        for (index, row) in snapshot.exact.iter().enumerate().skip(1) {
            assert_eq!(row.item.work_id, ids[index]);
            assert_eq!(row.dependencies.len(), 1);
            assert_eq!(row.dependencies[0].id, ids[index - 1]);
            assert_eq!(row.dependencies[0].kind, WorkDepKind::Related);
            assert_eq!(row.dependencies[0].status, Some(WorkStatus::Open));
        }
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
