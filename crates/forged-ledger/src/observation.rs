//! One transaction-consistent, ledger-only observation of one durable unit
//! of work.
//!
//! This is the storage seam behind exact Work Detail projections. It never
//! reads current work, controller files, processes, Herdr, or providers. An epic's
//! child and internal planning/assurance runs are discovered from their
//! durable epic start-link events and every run table is then read in a bounded
//! number of bulk queries inside the same SQLite read transaction.

use std::collections::{BTreeMap, BTreeSet};

use forged_types::{
    AdmissionDecisionV1, AdmissionSubjectKind, ErrorCode, WorkIdentitySubjectKind,
    WorkIdentitySubjectV1, WorkIdentityV1,
};
use rusqlite::Connection;
use serde::Deserialize;

use crate::admission::{decode_admission_decision, reservation_row, RESERVATION_COLUMNS};
use crate::artifacts::{
    compaction_row, row as artifact_row, COLUMNS as ARTIFACT_COLUMNS, COMPACTION_COLUMNS,
};
use crate::attempts::{attempt_row, ATTEMPT_COLUMNS};
use crate::desired::{desired_row, COLUMNS as DESIRED_COLUMNS};
use crate::error::{internal, refused, LedgerError};
use crate::events::event_row;
use crate::ledger::Ledger;
use crate::operations::{operation_row, OPERATION_COLUMNS};
use crate::owned_herdr::{owned_row, COLUMNS as OWNED_HERDR_COLUMNS};
use crate::packets::{packet_row, PACKET_COLUMNS};
use crate::runs::{run_row, RUN_COLUMNS};
use crate::types::{
    AdmissionReservationRow, AttemptArtifactCompactionRow, AttemptArtifactRow, AttemptRow,
    DesiredWorkRow, EventRow, OperationRow, OwnedHerdrSessionRow, PacketRow, RunRow, UsageRecord,
    UsageTotals,
};
use crate::usage::{totals_of, usage_row, Sums, TOTAL_SUMS, USAGE_COLUMNS};
use crate::work_identity::{get_work_identity_tx, identity_row, IDENTITY_COLUMNS};

const EPIC_STARTED: &str = "forged.epic.started";
const EPIC_CHILD_STARTED: &str = "forged.epic.child.started";
const EPIC_PLAN_STARTED: &str = "forged.epic.plan.started";
const EPIC_ASSURANCE_STARTED: &str = "forged.epic.assurance.started";

/// Hard ceiling for the event page carried by one observation snapshot.
pub const WORK_OBSERVATION_MAX_EVENT_LIMIT: u32 = 1_000;

/// One durable epic-to-child-run edge, retained in append order.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EpicChildRunLink {
    pub event_id: i64,
    pub child_id: String,
    pub run_id: String,
    pub phase: EpicLinkedRunPhase,
}

/// The closed role of a run linked from an epic's durable event stream.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EpicLinkedRunPhase {
    Implementation,
    Planning,
    Assurance,
}

impl EpicLinkedRunPhase {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Implementation => "implementation",
            Self::Planning => "planning",
            Self::Assurance => "assurance",
        }
    }
}

/// The bounded event page for the exact requested subject.
///
/// Epic snapshots page the epic stream, not a retroactively expanding union
/// of child streams. Child-run state is represented by the bulk row facts in
/// [`WorkObservationSnapshot`], so an `event_id` cursor remains stable when a
/// later child-start event adds another run to the epic.
#[derive(Debug, Clone, PartialEq)]
pub struct WorkObservationEvents {
    pub after_event_id: i64,
    pub limit: u32,
    pub rows: Vec<EventRow>,
    pub next_after_event_id: Option<i64>,
    pub has_more: bool,
}

/// Every ledger-backed fact needed to render exact Work Detail for one
/// durable run or epic, observed at one SQLite snapshot.
#[derive(Debug, Clone, PartialEq)]
pub struct WorkObservationSnapshot {
    /// Exact requested subject; never inferred from a bare id.
    pub subject: WorkIdentitySubjectV1,
    /// Frozen display identity of the requested subject.
    pub identity: WorkIdentityV1,
    /// Durable child-start edges. Empty for a run snapshot.
    pub epic_children: Vec<EpicChildRunLink>,
    /// Frozen identities for every child run, ordered by run id.
    pub child_identities: Vec<WorkIdentityV1>,
    /// The requested run, or every distinct run ever started by the epic.
    pub runs: Vec<RunRow>,
    /// Selected run ids whose work minted another run at or after them.
    /// Successor existence is the durable clearing fact: an exhausted
    /// subject stays cleared even after that successor itself settles.
    pub runs_with_same_work_successors: BTreeSet<String>,
    /// Requested-subject and child-run supervisor rows.
    pub desired_work: Vec<DesiredWorkRow>,
    /// Latest decision for the subject, its child runs, and their packets.
    pub admission_decisions: Vec<AdmissionDecisionV1>,
    /// Capacity-bearing reservations for the same admission subjects.
    pub admission_reservations: Vec<AdmissionReservationRow>,
    pub packets: Vec<PacketRow>,
    /// All states, including terminal attempts.
    pub attempts: Vec<AttemptRow>,
    pub attempt_artifacts: Vec<AttemptArtifactRow>,
    pub artifact_compactions: Vec<AttemptArtifactCompactionRow>,
    pub usage_rows: Vec<UsageRecord>,
    /// One entry per run, including explicit zero totals when no rows exist.
    pub usage_totals: BTreeMap<String, UsageTotals>,
    /// Only operations which still retain effect custody.
    pub inflight_operations: Vec<OperationRow>,
    /// Durable metadata for controllers and provider attempts owned by this
    /// subject or one of its selected child runs, including released rows.
    pub owned_herdr_sessions: Vec<OwnedHerdrSessionRow>,
    pub events: WorkObservationEvents,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StoredEpicChildStarted {
    child_id: String,
    run_id: String,
}

fn scope_json(ids: &BTreeSet<String>) -> Result<String, LedgerError> {
    serde_json::to_string(&ids.iter().collect::<Vec<_>>()).map_err(Into::into)
}

fn require_subject_identity_tx(
    conn: &Connection,
    kind: WorkIdentitySubjectKind,
    id: &str,
) -> Result<WorkIdentityV1, LedgerError> {
    let exists: bool = match kind {
        WorkIdentitySubjectKind::Run => conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM runs WHERE run_id = ?1)",
            [id],
            |row| row.get(0),
        )?,
        WorkIdentitySubjectKind::Epic => conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 AND kind = ?2)",
            rusqlite::params![id, EPIC_STARTED],
            |row| row.get(0),
        )?,
    };
    if !exists {
        return Err(refused(
            match kind {
                WorkIdentitySubjectKind::Run => ErrorCode::RunNotFound,
                WorkIdentitySubjectKind::Epic => ErrorCode::InvalidRequest,
            },
            format!("no durable {} {id:?}", kind.as_str()),
        ));
    }
    get_work_identity_tx(conn, kind, id)?.ok_or_else(|| {
        internal(format!(
            "durable {} {id:?} has no work identity",
            kind.as_str()
        ))
    })
}

fn epic_children_tx(
    conn: &Connection,
    epic_id: &str,
) -> Result<Vec<EpicChildRunLink>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT event_id, kind, payload_json FROM events \
         WHERE run_id = ?1 AND kind IN (?2, ?3, ?4) ORDER BY event_id",
    )?;
    let rows = statement.query_map(
        rusqlite::params![
            epic_id,
            EPIC_CHILD_STARTED,
            EPIC_PLAN_STARTED,
            EPIC_ASSURANCE_STARTED
        ],
        |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        },
    )?;
    let mut links = Vec::new();
    let mut owners = BTreeMap::<String, String>::new();
    for row in rows {
        let (event_id, kind, raw) = row?;
        let child: StoredEpicChildStarted = serde_json::from_str(&raw).map_err(|error| {
            internal(format!(
                "epic child-start event {event_id} has invalid payload: {error}"
            ))
        })?;
        if child.child_id.trim().is_empty() || child.run_id.trim().is_empty() {
            return Err(internal(format!(
                "epic child-start event {event_id} has an empty child or run id"
            )));
        }
        if let Some(standing) = owners.insert(child.run_id.clone(), child.child_id.clone()) {
            if standing != child.child_id {
                return Err(internal(format!(
                    "epic child-start events assign run {:?} to both {standing:?} and {:?}",
                    child.run_id, child.child_id
                )));
            }
        }
        links.push(EpicChildRunLink {
            event_id,
            child_id: child.child_id,
            run_id: child.run_id,
            phase: match kind.as_str() {
                EPIC_CHILD_STARTED => EpicLinkedRunPhase::Implementation,
                EPIC_PLAN_STARTED => EpicLinkedRunPhase::Planning,
                EPIC_ASSURANCE_STARTED => EpicLinkedRunPhase::Assurance,
                _ => unreachable!("the query selects only closed epic run-link kinds"),
            },
        });
    }
    Ok(links)
}

fn run_rows_tx(conn: &Connection, run_scope: &str) -> Result<Vec<RunRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {RUN_COLUMNS} FROM runs \
         WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
         ORDER BY created_at, rowid"
    ))?;
    let rows = statement.query_map([run_scope], run_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn runs_with_same_work_successors_tx(
    conn: &Connection,
    run_scope: &str,
) -> Result<BTreeSet<String>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT source.run_id FROM runs source \
         WHERE source.run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
           AND EXISTS (SELECT 1 FROM runs candidate \
             WHERE candidate.run_id != source.run_id \
               AND candidate.bead_id = source.bead_id \
               AND candidate.created_at >= source.created_at) \
         ORDER BY source.run_id",
    )?;
    let rows = statement.query_map([run_scope], |row| row.get::<_, String>(0))?;
    rows.collect::<Result<BTreeSet<_>, _>>().map_err(Into::into)
}

fn child_identities_tx(
    conn: &Connection,
    run_scope: &str,
) -> Result<Vec<WorkIdentityV1>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {IDENTITY_COLUMNS} FROM work_identities \
         WHERE subject_kind = 'run' \
           AND subject_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
         ORDER BY subject_id"
    ))?;
    let rows = statement.query_map([run_scope], identity_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn desired_work_tx(
    conn: &Connection,
    epic_id: Option<&str>,
    run_scope: &str,
) -> Result<Vec<DesiredWorkRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {DESIRED_COLUMNS} FROM desired_work \
         WHERE (subject_kind = 'run' \
                AND subject_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))) \
            OR (?2 IS NOT NULL AND subject_kind = 'epic' AND subject_id = ?2) \
         ORDER BY subject_kind, subject_id"
    ))?;
    let rows = statement.query_map(rusqlite::params![run_scope, epic_id], desired_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn packets_tx(conn: &Connection, run_scope: &str) -> Result<Vec<PacketRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {PACKET_COLUMNS} FROM packets \
         WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
         ORDER BY rowid"
    ))?;
    let rows = statement.query_map([run_scope], packet_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn attempts_tx(conn: &Connection, run_scope: &str) -> Result<Vec<AttemptRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {ATTEMPT_COLUMNS} FROM attempts \
         WHERE packet_id IN (SELECT packet_id FROM packets \
           WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))) \
         ORDER BY attempt_id"
    ))?;
    let rows = statement.query_map([run_scope], attempt_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn artifacts_tx(
    conn: &Connection,
    run_scope: &str,
) -> Result<Vec<AttemptArtifactRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {ARTIFACT_COLUMNS} FROM attempt_artifacts \
         WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
         ORDER BY attempt_id"
    ))?;
    let rows = statement.query_map([run_scope], artifact_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn compactions_tx(
    conn: &Connection,
    run_scope: &str,
) -> Result<Vec<AttemptArtifactCompactionRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {COMPACTION_COLUMNS} FROM attempt_artifact_compactions \
         WHERE attempt_id IN (SELECT a.attempt_id FROM attempts a \
           JOIN packets p ON p.packet_id = a.packet_id \
           WHERE p.run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1))) \
         ORDER BY attempt_id"
    ))?;
    let rows = statement.query_map([run_scope], compaction_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn usage_rows_tx(conn: &Connection, run_scope: &str) -> Result<Vec<UsageRecord>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {USAGE_COLUMNS} FROM usage \
         WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
         ORDER BY usage_id"
    ))?;
    let rows = statement.query_map([run_scope], usage_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn usage_totals_tx(
    conn: &Connection,
    run_ids: &BTreeSet<String>,
    run_scope: &str,
) -> Result<BTreeMap<String, UsageTotals>, LedgerError> {
    let mut totals = run_ids
        .iter()
        .map(|run_id| {
            (
                run_id.clone(),
                UsageTotals {
                    input_tokens: 0,
                    output_tokens: 0,
                    cache_read_tokens: 0,
                    cache_write_tokens: 0,
                    cost_usd_known: 0.0,
                    rows_missing_cost: 0,
                },
            )
        })
        .collect::<BTreeMap<_, _>>();
    let mut statement = conn.prepare(&format!(
        "SELECT run_id, {TOTAL_SUMS} FROM usage \
         WHERE run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
         GROUP BY run_id ORDER BY run_id"
    ))?;
    let rows = statement.query_map([run_scope], |row| {
        Ok((
            row.get::<_, String>(0)?,
            (
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
            ),
        ))
    })?;
    for row in rows {
        let (run_id, sums): (String, Sums) = row?;
        totals.insert(run_id, totals_of(sums)?);
    }
    Ok(totals)
}

fn admission_decisions_tx(
    conn: &Connection,
    epic_id: Option<&str>,
    run_scope: &str,
) -> Result<Vec<AdmissionDecisionV1>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT d.batch_id, d.subject_kind, d.subject_id, d.control_revision, d.decision_json \
         FROM admission_decisions d \
         WHERE ( \
           (d.subject_kind = 'run' AND d.subject_id IN \
             (SELECT CAST(value AS TEXT) FROM json_each(?1))) \
           OR (?2 IS NOT NULL AND d.subject_kind = 'epic' AND d.subject_id = ?2) \
           OR (d.subject_kind = 'packet' AND d.subject_id IN \
             (SELECT packet_id FROM packets WHERE run_id IN \
               (SELECT CAST(value AS TEXT) FROM json_each(?1)))) \
         ) AND d.rowid = (SELECT d2.rowid FROM admission_decisions d2 \
           WHERE d2.subject_kind = d.subject_kind AND d2.subject_id = d.subject_id \
           ORDER BY d2.rowid DESC LIMIT 1) \
         ORDER BY d.subject_kind, d.subject_id, d.decision_id",
    )?;
    let rows = statement.query_map(rusqlite::params![run_scope, epic_id], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, i64>(3)?,
            row.get::<_, String>(4)?,
        ))
    })?;
    let mut decisions = Vec::new();
    for row in rows {
        let (batch_id, kind, subject_id, control_revision, raw) = row?;
        let decision = decode_admission_decision(&raw)?;
        let stored_kind = match kind.as_str() {
            "run" => AdmissionSubjectKind::Run,
            "epic" => AdmissionSubjectKind::Epic,
            "packet" => AdmissionSubjectKind::Packet,
            other => {
                return Err(internal(format!(
                    "unknown admission decision subject kind in database: {other:?}"
                )))
            }
        };
        let stored_revision = u64::try_from(control_revision)
            .map_err(|_| internal("negative stored admission control revision"))?;
        if decision.batch_id != batch_id
            || decision.subject_kind != stored_kind
            || decision.subject_id != subject_id
            || decision.control_revision != stored_revision
        {
            return Err(internal(format!(
                "stored admission decision JSON disagrees with indexed columns for {kind} {subject_id:?}"
            )));
        }
        decisions.push(decision);
    }
    Ok(decisions)
}

fn admission_reservations_tx(
    conn: &Connection,
    epic_id: Option<&str>,
    run_scope: &str,
) -> Result<Vec<AdmissionReservationRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {RESERVATION_COLUMNS} FROM admission_reservations \
         WHERE state != 'released' AND ( \
           (subject_kind = 'run' AND subject_id IN \
             (SELECT CAST(value AS TEXT) FROM json_each(?1))) \
           OR (?2 IS NOT NULL AND subject_kind = 'epic' AND subject_id = ?2) \
           OR (subject_kind = 'packet' AND subject_id IN \
             (SELECT packet_id FROM packets WHERE run_id IN \
               (SELECT CAST(value AS TEXT) FROM json_each(?1)))) \
         ) ORDER BY reservation_id"
    ))?;
    let rows = statement.query_map(rusqlite::params![run_scope, epic_id], reservation_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn inflight_operations_tx(
    conn: &Connection,
    subject_scope: &str,
    run_scope: &str,
) -> Result<Vec<OperationRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {OPERATION_COLUMNS} FROM operations \
         WHERE ( \
           run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
           OR claim_token IN (SELECT a.claim_token FROM attempts a \
             JOIN packets p ON p.packet_id = a.packet_id \
             WHERE p.run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?2))) \
         ) ORDER BY rowid"
    ))?;
    let rows = statement.query_map(rusqlite::params![subject_scope, run_scope], operation_row)?;
    let rows = rows.collect::<Result<Vec<_>, _>>()?;
    Ok(rows
        .into_iter()
        .filter(|row| row.state == crate::types::OperationState::InProgress)
        .collect())
}

fn owned_herdr_sessions_tx(
    conn: &Connection,
    epic_id: Option<&str>,
    run_scope: &str,
) -> Result<Vec<OwnedHerdrSessionRow>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {OWNED_HERDR_COLUMNS} FROM owned_herdr_sessions \
         WHERE (owner_kind = 'controller' AND ( \
           (subject_kind = 'run' AND subject_id IN \
             (SELECT CAST(value AS TEXT) FROM json_each(?1))) \
           OR (?2 IS NOT NULL AND subject_kind = 'epic' AND subject_id = ?2) \
         )) OR (owner_kind = 'attempt' AND \
           run_id IN (SELECT CAST(value AS TEXT) FROM json_each(?1)) \
           AND packet_id IN (SELECT packet_id FROM packets WHERE run_id IN \
             (SELECT CAST(value AS TEXT) FROM json_each(?1))) \
         ) ORDER BY ownership_id"
    ))?;
    let rows = statement.query_map(rusqlite::params![run_scope, epic_id], owned_row)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn subject_events_tx(
    conn: &Connection,
    subject_id: &str,
    after_event_id: i64,
    limit: u32,
) -> Result<WorkObservationEvents, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT event_id, ts, run_id, kind, payload_json FROM events \
         WHERE run_id = ?1 AND event_id > ?2 ORDER BY event_id LIMIT ?3",
    )?;
    let rows = statement.query_map(
        rusqlite::params![subject_id, after_event_id, i64::from(limit) + 1],
        event_row,
    )?;
    let mut rows = rows.collect::<Result<Vec<_>, _>>()?;
    let has_more = rows.len() > limit as usize;
    if has_more {
        rows.pop();
    }
    let next_after_event_id = rows.last().map(|row| row.event_id);
    Ok(WorkObservationEvents {
        after_event_id,
        limit,
        rows,
        next_after_event_id,
        has_more,
    })
}

impl Ledger {
    /// Read one exact run or epic and all ledger-backed Work Detail facts in
    /// ONE deferred transaction.
    pub fn work_observation_snapshot(
        &self,
        subject_kind: WorkIdentitySubjectKind,
        subject_id: &str,
        after_event_id: i64,
        event_limit: u32,
    ) -> Result<WorkObservationSnapshot, LedgerError> {
        if subject_id.trim().is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "work observation subject id must be non-empty",
            ));
        }
        if after_event_id < 0 {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "work observation event cursor must be non-negative",
            ));
        }
        if !(1..=WORK_OBSERVATION_MAX_EVENT_LIMIT).contains(&event_limit) {
            return Err(refused(
                ErrorCode::InvalidRequest,
                format!(
                    "work observation event limit must be between 1 and {WORK_OBSERVATION_MAX_EVENT_LIMIT}"
                ),
            ));
        }

        let subject_id = subject_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction()?;
            let identity = require_subject_identity_tx(&tx, subject_kind, &subject_id)?;
            let epic_children = match subject_kind {
                WorkIdentitySubjectKind::Run => Vec::new(),
                WorkIdentitySubjectKind::Epic => epic_children_tx(&tx, &subject_id)?,
            };
            let mut run_ids = BTreeSet::new();
            match subject_kind {
                WorkIdentitySubjectKind::Run => {
                    run_ids.insert(subject_id.clone());
                }
                WorkIdentitySubjectKind::Epic => {
                    run_ids.extend(epic_children.iter().map(|link| link.run_id.clone()));
                }
            }
            let run_scope = scope_json(&run_ids)?;
            let runs = run_rows_tx(&tx, &run_scope)?;
            let observed_run_ids = runs
                .iter()
                .map(|run| run.run_id.clone())
                .collect::<BTreeSet<_>>();
            if observed_run_ids != run_ids {
                let missing = run_ids
                    .difference(&observed_run_ids)
                    .cloned()
                    .collect::<Vec<_>>();
                return Err(internal(format!(
                    "work observation references missing child runs: {missing:?}"
                )));
            }

            let child_identities = if subject_kind == WorkIdentitySubjectKind::Epic {
                let identities = child_identities_tx(&tx, &run_scope)?;
                let identity_ids = identities
                    .iter()
                    .map(|identity| identity.subject.id.clone())
                    .collect::<BTreeSet<_>>();
                if identity_ids != run_ids {
                    let missing = run_ids
                        .difference(&identity_ids)
                        .cloned()
                        .collect::<Vec<_>>();
                    return Err(internal(format!(
                        "epic child runs have no durable work identity: {missing:?}"
                    )));
                }
                for child in &identities {
                    if child.epic.as_ref().map(|epic| epic.id.as_str()) != Some(subject_id.as_str())
                    {
                        return Err(internal(format!(
                            "child run {:?} identity does not name epic {:?}",
                            child.subject.id, subject_id
                        )));
                    }
                }
                identities
            } else {
                Vec::new()
            };

            let mut subject_ids = run_ids.clone();
            if subject_kind == WorkIdentitySubjectKind::Epic {
                subject_ids.insert(subject_id.clone());
            }
            let subject_scope = scope_json(&subject_ids)?;
            let epic_id =
                (subject_kind == WorkIdentitySubjectKind::Epic).then_some(subject_id.as_str());

            let snapshot = WorkObservationSnapshot {
                subject: WorkIdentitySubjectV1 {
                    kind: subject_kind,
                    id: subject_id.clone(),
                },
                identity,
                epic_children,
                child_identities,
                runs,
                runs_with_same_work_successors: runs_with_same_work_successors_tx(&tx, &run_scope)?,
                desired_work: desired_work_tx(&tx, epic_id, &run_scope)?,
                admission_decisions: admission_decisions_tx(&tx, epic_id, &run_scope)?,
                admission_reservations: admission_reservations_tx(&tx, epic_id, &run_scope)?,
                packets: packets_tx(&tx, &run_scope)?,
                attempts: attempts_tx(&tx, &run_scope)?,
                attempt_artifacts: artifacts_tx(&tx, &run_scope)?,
                artifact_compactions: compactions_tx(&tx, &run_scope)?,
                usage_rows: usage_rows_tx(&tx, &run_scope)?,
                usage_totals: usage_totals_tx(&tx, &run_ids, &run_scope)?,
                inflight_operations: inflight_operations_tx(&tx, &subject_scope, &run_scope)?,
                owned_herdr_sessions: owned_herdr_sessions_tx(&tx, epic_id, &run_scope)?,
                events: subject_events_tx(&tx, &subject_id, after_event_id, event_limit)?,
            };
            tx.commit()?;
            Ok(snapshot)
        })
    }
}

#[cfg(test)]
mod tests {
    use forged_types::{
        work_display_title, AdmissionCapacityV1, AdmissionOutcome, AdmissionReason,
        AdmissionResourceClass, AdmissionSubjectKind, WorkIdentityContextV1, WorkIdentitySource,
        WorkIdentitySubjectKind, WorkIdentitySubjectV1, WorkIdentityV1, WorkIdentityWorkV1,
        ADMISSION_DECISION_SCHEMA_V1, WORK_IDENTITY_SCHEMA_V1,
    };
    use serde_json::json;

    use super::*;
    use crate::types::{AttemptState, NewPacket, NewUsage};
    use crate::work_identity::insert_work_identity_tx;
    use forged_types::Stage;

    const NOW: &str = "2026-08-14T12:00:00Z";

    fn identity(
        kind: WorkIdentitySubjectKind,
        id: &str,
        title: &str,
        epic: Option<&str>,
    ) -> WorkIdentityV1 {
        let epic = epic.map(|id| WorkIdentityContextV1 {
            id: id.to_owned(),
            title: Some("Epic title".to_owned()),
        });
        WorkIdentityV1 {
            schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
            subject: WorkIdentitySubjectV1 {
                kind,
                id: id.to_owned(),
            },
            work: WorkIdentityWorkV1 {
                id: id.to_owned(),
                title: Some(title.to_owned()),
                revision: None,
            },
            repository: None,
            project: None,
            display_title: work_display_title(id, Some(title), None, None, epic.as_ref()),
            epic,
            captured_at: NOW.to_owned(),
            source: WorkIdentitySource::Durable,
        }
    }

    fn seed_run(ledger: &Ledger, run_id: &str, epic: Option<&str>) {
        let run_id = run_id.to_owned();
        let identity = identity(
            WorkIdentitySubjectKind::Run,
            &run_id,
            &format!("Title {run_id}"),
            epic,
        );
        ledger
            .submit(move |conn| {
                let tx = conn.transaction()?;
                tx.execute(
                    "INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, protocol, state, \
                     created_at, updated_at) VALUES (?1, ?1, '/repo', 'main', ?2, 'slice/v1', \
                     'active', ?3, ?3)",
                    rusqlite::params![run_id, format!("work/{run_id}"), NOW],
                )?;
                insert_work_identity_tx(&tx, &identity)?;
                tx.commit()?;
                Ok(())
            })
            .expect("seed run");
    }

    fn seed_epic(ledger: &Ledger, epic_id: &str) {
        ledger
            .append_epic_started_with_identity(
                epic_id,
                json!({"epicId": epic_id, "title": "Epic title"}),
                identity(WorkIdentitySubjectKind::Epic, epic_id, "Epic title", None),
            )
            .expect("seed epic");
    }

    fn seed_packet(ledger: &Ledger, run_id: &str, seq: i64) -> String {
        ledger
            .open_packet(NewPacket {
                run_id: run_id.to_owned(),
                stage: Stage::Implement,
                seq,
                spec_path: "spec.md".to_owned(),
                spec_sha256: "spec-sha".to_owned(),
                spec_revision: Some("revision".to_owned()),
                body_json: "{}".to_owned(),
            })
            .expect("packet")
    }

    fn seed_admission(ledger: &Ledger, subject_id: &str, schema: &str) {
        let subject_id = subject_id.to_owned();
        let schema = schema.to_owned();
        ledger
            .submit(move |conn| {
                let batch_id = format!("batch-{subject_id}");
                conn.execute(
                    "INSERT INTO admission_batches (batch_id, schema, policy_revision, \
                     ledger_revision, inputs_sha256, inputs_json, as_of, created_at) \
                     VALUES (?1, 'forged.admission-inputs/1', 'policy', 'ledger', ?2, '{}', ?3, ?3)",
                    rusqlite::params![batch_id, "a".repeat(64), NOW],
                )?;
                let decision = AdmissionDecisionV1 {
                    schema,
                    batch_id: batch_id.clone(),
                    subject_kind: AdmissionSubjectKind::Packet,
                    subject_id: subject_id.clone(),
                    control_revision: 1,
                    repository: "/repo".to_owned(),
                    priority: Some(1),
                    provider: Some("provider".to_owned()),
                    model: Some("model".to_owned()),
                    resource_class: AdmissionResourceClass::Read,
                    outcome: AdmissionOutcome::Admitted,
                    reason: AdmissionReason::CapacityAvailable,
                    reason_detail: None,
                    policy_revision: "policy".to_owned(),
                    evidence: AdmissionCapacityV1::default(),
                    next_eligible_wake_at: None,
                };
                let decision_id = format!("decision-{subject_id}");
                conn.execute(
                    "INSERT INTO admission_decisions (decision_id, batch_id, subject_kind, \
                     subject_id, control_revision, outcome, reason, decision_json, created_at) \
                     VALUES (?1, ?2, 'packet', ?3, 1, 'admitted', 'capacity-available', ?4, ?5)",
                    rusqlite::params![
                        decision_id,
                        batch_id,
                        subject_id,
                        serde_json::to_string(&decision)?,
                        NOW,
                    ],
                )?;
                conn.execute(
                    "INSERT INTO admission_reservations (reservation_id, decision_id, work_key, \
                     subject_kind, subject_id, control_revision, repository, provider, model, \
                     resource_class, state, recovery_deadline, created_at, updated_at) \
                     VALUES (?1, ?2, ?3, 'packet', ?4, 1, '/repo', 'provider', 'model', \
                     'read', 'reserved', ?5, ?5, ?5)",
                    rusqlite::params![
                        format!("reservation-{subject_id}"),
                        decision_id,
                        format!("packet:{subject_id}:1"),
                        subject_id,
                        NOW,
                    ],
                )?;
                Ok(())
            })
            .expect("seed admission");
    }

    fn seed_owned_controller(
        ledger: &Ledger,
        ownership_id: &str,
        subject_kind: &str,
        subject_id: &str,
    ) {
        let ownership_id = ownership_id.to_owned();
        let subject_kind = subject_kind.to_owned();
        let subject_id = subject_id.to_owned();
        ledger
            .submit(move |conn| {
                conn.execute(
                    "INSERT INTO owned_herdr_sessions (ownership_id, schema, owner_kind, \
                     subject_kind, subject_id, controller_generation, pane_id, socket_path, \
                     protocol, sentinel_path, lifecycle_state, cleanup_state, \
                     cleanup_retry_budget, cleanup_retry_used, registered_at, updated_at) \
                     VALUES (?1, 'forged.owned-herdr-session/1', 'controller', ?2, ?3, 1, \
                     ?4, ?5, 19, ?6, 'registered', 'not-requested', 8, 0, ?7, ?7)",
                    rusqlite::params![
                        ownership_id,
                        subject_kind,
                        subject_id,
                        format!("pane-{ownership_id}"),
                        format!("/socket/{ownership_id}"),
                        format!("sentinel/{ownership_id}"),
                        NOW,
                    ],
                )?;
                Ok(())
            })
            .expect("seed owned controller");
    }

    #[allow(clippy::too_many_arguments)]
    fn seed_owned_attempt(
        ledger: &Ledger,
        ownership_id: &str,
        subject_kind: &str,
        subject_id: &str,
        run_id: &str,
        packet_id: &str,
        attempt_id: i64,
        controller_generation: Option<u32>,
    ) {
        let ownership_id = ownership_id.to_owned();
        let subject_kind = subject_kind.to_owned();
        let subject_id = subject_id.to_owned();
        let run_id = run_id.to_owned();
        let packet_id = packet_id.to_owned();
        ledger
            .submit(move |conn| {
                conn.execute(
                    "INSERT INTO owned_herdr_sessions (ownership_id, schema, owner_kind, \
                     subject_kind, subject_id, run_id, packet_id, attempt_id, claim_token, \
                     controller_generation, pane_id, socket_path, protocol, sentinel_path, \
                     lifecycle_state, cleanup_state, cleanup_retry_budget, cleanup_retry_used, \
                     registered_at, updated_at) VALUES (?1, 'forged.owned-herdr-session/1', \
                     'attempt', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 19, ?11, 'registered', \
                     'not-requested', 8, 0, ?12, ?12)",
                    rusqlite::params![
                        ownership_id,
                        subject_kind,
                        subject_id,
                        run_id,
                        packet_id,
                        attempt_id,
                        format!("claim-{attempt_id}"),
                        controller_generation.map(i64::from),
                        format!("pane-{ownership_id}"),
                        format!("/socket/{ownership_id}"),
                        format!("sentinel/{ownership_id}"),
                        NOW,
                    ],
                )?;
                Ok(())
            })
            .expect("seed owned attempt");
    }

    #[test]
    fn run_snapshot_bulk_reads_only_its_controller_and_provider_ownership() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        seed_run(&ledger, "owned-run", None);
        seed_run(&ledger, "owned-outsider", None);
        let packet = seed_packet(&ledger, "owned-run", 1);
        let outsider_packet = seed_packet(&ledger, "owned-outsider", 1);
        seed_owned_controller(&ledger, "z-run-controller", "run", "owned-run");
        seed_owned_attempt(
            &ledger,
            "a-run-provider",
            "run",
            "owned-run",
            "owned-run",
            &packet,
            11,
            None,
        );
        seed_owned_controller(&ledger, "outsider-controller", "run", "owned-outsider");
        seed_owned_attempt(
            &ledger,
            "outsider-provider",
            "run",
            "owned-outsider",
            "owned-outsider",
            &outsider_packet,
            12,
            None,
        );

        let snapshot = ledger
            .work_observation_snapshot(WorkIdentitySubjectKind::Run, "owned-run", 0, 10)
            .expect("snapshot");
        assert_eq!(
            snapshot
                .owned_herdr_sessions
                .iter()
                .map(|row| row.ownership_id.as_str())
                .collect::<Vec<_>>(),
            vec!["a-run-provider", "z-run-controller"]
        );
    }

    #[test]
    fn epic_snapshot_bulk_reads_parent_child_and_provider_ownership() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        seed_epic(&ledger, "owned-epic");
        seed_run(&ledger, "owned-child-a", Some("owned-epic"));
        seed_run(&ledger, "owned-child-b", Some("owned-epic"));
        seed_run(&ledger, "owned-epic-outsider", None);
        let packet_a = seed_packet(&ledger, "owned-child-a", 1);
        let packet_b = seed_packet(&ledger, "owned-child-b", 1);
        ledger
            .append_event(
                Some("owned-epic"),
                EPIC_CHILD_STARTED,
                json!({"childId": "bead-a", "runId": "owned-child-a"}),
            )
            .expect("child a");
        ledger
            .append_event(
                Some("owned-epic"),
                EPIC_CHILD_STARTED,
                json!({"childId": "bead-b", "runId": "owned-child-b"}),
            )
            .expect("child b");

        seed_owned_controller(&ledger, "epic-controller", "epic", "owned-epic");
        seed_owned_controller(&ledger, "run-controller", "run", "owned-child-a");
        seed_owned_attempt(
            &ledger,
            "provider-a",
            "epic",
            "owned-epic",
            "owned-child-a",
            &packet_a,
            21,
            Some(1),
        );
        seed_owned_attempt(
            &ledger,
            "provider-b",
            "run",
            "owned-child-b",
            "owned-child-b",
            &packet_b,
            22,
            None,
        );
        seed_owned_controller(&ledger, "outsider-controller", "run", "owned-epic-outsider");

        let snapshot = ledger
            .work_observation_snapshot(WorkIdentitySubjectKind::Epic, "owned-epic", 0, 10)
            .expect("snapshot");
        assert_eq!(
            snapshot
                .owned_herdr_sessions
                .iter()
                .map(|row| row.ownership_id.as_str())
                .collect::<Vec<_>>(),
            vec![
                "epic-controller",
                "provider-a",
                "provider-b",
                "run-controller",
            ]
        );
    }

    #[test]
    fn run_snapshot_reads_every_fact_and_every_attempt_state() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let run_id = "run-observation";
        seed_run(&ledger, run_id, None);
        let packets = (1..=6)
            .map(|seq| seed_packet(&ledger, run_id, seq))
            .collect::<Vec<_>>();
        let states = [
            "running",
            "completed",
            "failed",
            "revoking",
            "reclaimed",
            "stopped",
        ];
        ledger
            .submit({
                let run_id = run_id.to_owned();
                let packets = packets.clone();
                move |conn| {
                    for (offset, (packet, state)) in packets.iter().zip(states).enumerate() {
                        let attempt_id = i64::try_from(offset + 1).expect("attempt id");
                        conn.execute(
                            "INSERT INTO attempts (attempt_id, packet_id, claim_token, claimant, \
                             state, revoke_reason, revoke_scope, started_at, updated_at) \
                             VALUES (?1, ?2, ?3, 'test', ?4, ?5, ?6, ?7, ?7)",
                            rusqlite::params![
                                attempt_id,
                                packet,
                                format!("claim-{attempt_id}"),
                                state,
                                (state == "revoking").then_some("test revoke"),
                                (state == "revoking").then_some("bead"),
                                NOW,
                            ],
                        )?;
                    }
                    conn.execute(
                        "INSERT INTO desired_work (subject_kind, subject_id, desired_state, \
                         control_revision, controller_generation, restart_budget, restart_used, \
                         created_at, updated_at) VALUES ('run', ?1, 'running', 1, 1, 5, 0, ?2, ?2)",
                        rusqlite::params![run_id, NOW],
                    )?;
                    conn.execute(
                        "INSERT INTO attempt_artifacts (attempt_id, run_id, packet_id, \
                         manifest_schema, manifest_path, manifest_sha256, retention_class, created_at) \
                         VALUES (2, ?1, ?2, 'forged.attempt-artifacts/1', 'manifest.json', ?3, \
                         'compactable-success', ?4)",
                        rusqlite::params![run_id, packets[1], "b".repeat(64), NOW],
                    )?;
                    conn.execute(
                        "INSERT INTO attempt_artifact_compactions (attempt_id, operation_id, \
                         tombstone_path, tombstone_sha256, state, created_at) \
                         VALUES (2, 'compact-op', 'tombstone.json', ?1, 'in-progress', ?2)",
                        rusqlite::params!["c".repeat(64), NOW],
                    )?;
                    conn.execute(
                        "INSERT INTO operations (operation_id, name, idempotency_key, \
                         request_sha256, effect_class, run_id, claim_token, state, created_at, updated_at) \
                         VALUES ('operation-live', 'provider', 'key', 'request', 'safe-retry', ?1, \
                         'claim-1', 'in_progress', ?2, ?2)",
                        rusqlite::params![run_id, NOW],
                    )?;
                    Ok(())
                }
            })
            .expect("seed run facts");
        seed_admission(&ledger, &packets[0], ADMISSION_DECISION_SCHEMA_V1);
        ledger
            .record_usage(NewUsage {
                run_id: run_id.to_owned(),
                packet_id: Some(packets[0].clone()),
                attempt_id: Some(1),
                provider: "provider".to_owned(),
                model: "model".to_owned(),
                input_tokens: 10,
                output_tokens: 5,
                cache_read_tokens: Some(3),
                cache_write_tokens: None,
                cost_usd: None,
                pricing_basis: None,
                rate_limit_used_percent: None,
                web_search_requests: Some(2),
            })
            .expect("usage");
        for n in 1..=3 {
            ledger
                .append_event(Some(run_id), "test.event", json!({"n": n}))
                .expect("event");
        }

        let snapshot = ledger
            .work_observation_snapshot(WorkIdentitySubjectKind::Run, run_id, 0, 2)
            .expect("snapshot");
        assert_eq!(snapshot.subject.id, run_id);
        assert_eq!(snapshot.identity.subject.id, run_id);
        assert!(snapshot.epic_children.is_empty());
        assert!(snapshot.child_identities.is_empty());
        assert_eq!(snapshot.runs.len(), 1);
        assert_eq!(snapshot.desired_work.len(), 1);
        assert_eq!(snapshot.admission_decisions.len(), 1);
        assert_eq!(snapshot.admission_reservations.len(), 1);
        assert_eq!(snapshot.packets.len(), 6);
        assert_eq!(snapshot.attempts.len(), 6);
        assert_eq!(
            snapshot
                .attempts
                .iter()
                .map(|attempt| attempt.state)
                .collect::<Vec<_>>(),
            vec![
                AttemptState::Running,
                AttemptState::Completed,
                AttemptState::Failed,
                AttemptState::Revoking,
                AttemptState::Reclaimed,
                AttemptState::Stopped,
            ]
        );
        assert_eq!(snapshot.attempt_artifacts.len(), 1);
        assert_eq!(snapshot.artifact_compactions.len(), 1);
        assert_eq!(snapshot.usage_rows.len(), 1);
        let totals = snapshot.usage_totals.get(run_id).expect("run totals");
        assert_eq!(totals.input_tokens, 10);
        assert_eq!(totals.output_tokens, 5);
        assert_eq!(totals.rows_missing_cost, 1);
        assert_eq!(snapshot.inflight_operations.len(), 1);
        assert_eq!(snapshot.events.rows.len(), 2);
        assert!(snapshot.events.has_more);
        assert_eq!(
            snapshot.events.next_after_event_id,
            snapshot.events.rows.last().map(|row| row.event_id)
        );
    }

    #[test]
    fn epic_snapshot_bulk_captures_children_and_pages_only_the_stable_epic_stream() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let epic_id = "epic-observation";
        seed_epic(&ledger, epic_id);
        ledger
            .append_event(Some(epic_id), "epic.note", json!({"n": 1}))
            .expect("epic note");

        seed_run(&ledger, "child-a", Some(epic_id));
        seed_run(&ledger, "child-b", Some(epic_id));
        seed_run(&ledger, "plan-a", Some(epic_id));
        seed_run(&ledger, "assurance-a", Some(epic_id));
        seed_run(&ledger, "outsider", None);
        let child_packet = seed_packet(&ledger, "child-a", 1);
        let plan_packet = seed_packet(&ledger, "plan-a", 1);
        let assurance_packet = seed_packet(&ledger, "assurance-a", 1);
        let _outsider_packet = seed_packet(&ledger, "outsider", 1);
        ledger
            .append_event(Some("child-a"), "child.local", json!({"n": 1}))
            .expect("child event");
        ledger
            .append_event(
                Some(epic_id),
                EPIC_CHILD_STARTED,
                json!({
                    "childId": "bead-a",
                    "runId": "child-a",
                    "wave": 1,
                    "generation": 1,
                }),
            )
            .expect("child a start");
        ledger
            .append_event(
                Some(epic_id),
                EPIC_CHILD_STARTED,
                json!({
                    "childId": "bead-b",
                    "runId": "child-b",
                    "wave": 1,
                    "generation": 1,
                }),
            )
            .expect("child b start");
        ledger
            .append_event(
                Some(epic_id),
                EPIC_PLAN_STARTED,
                json!({
                    "childId": "bead-stub",
                    "runId": "plan-a",
                    "generation": 1,
                    "preDigest": "digest",
                }),
            )
            .expect("plan start");
        ledger
            .append_event(
                Some(epic_id),
                EPIC_ASSURANCE_STARTED,
                json!({
                    "childId": epic_id,
                    "runId": "assurance-a",
                    "integrationSha": "a".repeat(40),
                    "pr": {"number": 42},
                }),
            )
            .expect("assurance start");
        ledger
            .submit({
                let assurance_packet = assurance_packet.clone();
                move |conn| {
                    conn.execute(
                        "INSERT INTO attempts (attempt_id, packet_id, claim_token, claimant, \
                         state, started_at, updated_at) \
                         VALUES (41, ?1, 'assurance-claim', 'test', 'completed', ?2, ?2)",
                        rusqlite::params![assurance_packet, NOW],
                    )?;
                    conn.execute(
                        "INSERT INTO attempt_artifacts (attempt_id, run_id, packet_id, \
                         manifest_schema, manifest_path, manifest_sha256, retention_class, created_at) \
                         VALUES (41, 'assurance-a', ?1, 'forged.attempt-artifacts/1', \
                         'assurance-manifest.json', ?2, 'compactable-success', ?3)",
                        rusqlite::params![assurance_packet, "d".repeat(64), NOW],
                    )?;
                    Ok(())
                }
            })
            .expect("assurance evidence");
        ledger
            .record_usage(NewUsage {
                run_id: "assurance-a".to_owned(),
                packet_id: Some(assurance_packet.clone()),
                attempt_id: Some(41),
                provider: "provider".to_owned(),
                model: "model".to_owned(),
                input_tokens: 17,
                output_tokens: 4,
                cache_read_tokens: None,
                cache_write_tokens: None,
                cost_usd: Some(0.25),
                pricing_basis: Some("billed".to_owned()),
                rate_limit_used_percent: None,
                web_search_requests: None,
            })
            .expect("assurance usage");
        ledger
            .append_event(Some(epic_id), "epic.note", json!({"n": 2}))
            .expect("epic note");

        let epic_events = ledger
            .list_events(Some(epic_id), 0, 100)
            .expect("epic events");
        let after = epic_events[0].event_id;
        let snapshot = ledger
            .work_observation_snapshot(WorkIdentitySubjectKind::Epic, epic_id, after, 2)
            .expect("epic snapshot");
        assert_eq!(snapshot.epic_children.len(), 4);
        assert_eq!(
            snapshot
                .epic_children
                .iter()
                .map(|link| link.run_id.as_str())
                .collect::<Vec<_>>(),
            vec!["child-a", "child-b", "plan-a", "assurance-a"]
        );
        assert_eq!(
            snapshot
                .epic_children
                .iter()
                .map(|link| link.phase)
                .collect::<Vec<_>>(),
            vec![
                EpicLinkedRunPhase::Implementation,
                EpicLinkedRunPhase::Implementation,
                EpicLinkedRunPhase::Planning,
                EpicLinkedRunPhase::Assurance,
            ]
        );
        assert_eq!(
            snapshot
                .epic_children
                .iter()
                .map(|link| link.phase.as_str())
                .collect::<Vec<_>>(),
            vec!["implementation", "implementation", "planning", "assurance"]
        );
        assert_eq!(snapshot.child_identities.len(), 4);
        assert_eq!(
            snapshot
                .runs
                .iter()
                .map(|run| run.run_id.as_str())
                .collect::<BTreeSet<_>>(),
            BTreeSet::from(["assurance-a", "child-a", "child-b", "plan-a"])
        );
        assert_eq!(
            snapshot
                .packets
                .iter()
                .map(|packet| packet.packet_id.as_str())
                .collect::<BTreeSet<_>>(),
            BTreeSet::from([
                assurance_packet.as_str(),
                child_packet.as_str(),
                plan_packet.as_str(),
            ])
        );
        assert_eq!(snapshot.attempts.len(), 1);
        assert_eq!(snapshot.attempts[0].packet_id, assurance_packet);
        assert_eq!(snapshot.attempt_artifacts.len(), 1);
        assert_eq!(snapshot.attempt_artifacts[0].run_id, "assurance-a");
        assert_eq!(snapshot.usage_rows.len(), 1);
        assert_eq!(snapshot.usage_rows[0].run_id, "assurance-a");
        assert_eq!(snapshot.usage_totals.len(), 4);
        assert_eq!(snapshot.usage_totals["assurance-a"].input_tokens, 17);
        assert_eq!(snapshot.usage_totals["assurance-a"].cost_usd_known, 0.25);
        assert_eq!(
            snapshot
                .events
                .rows
                .iter()
                .map(|row| row.event_id)
                .collect::<Vec<_>>(),
            epic_events[1..3]
                .iter()
                .map(|row| row.event_id)
                .collect::<Vec<_>>()
        );
        assert!(snapshot
            .events
            .rows
            .iter()
            .all(|row| row.run_id.as_deref() == Some(epic_id)));
        assert!(snapshot.events.has_more);

        let remainder = ledger
            .work_observation_snapshot(
                WorkIdentitySubjectKind::Epic,
                epic_id,
                snapshot.events.next_after_event_id.expect("next cursor"),
                10,
            )
            .expect("remainder");
        assert_eq!(
            remainder
                .events
                .rows
                .iter()
                .map(|row| row.event_id)
                .collect::<Vec<_>>(),
            epic_events[3..]
                .iter()
                .map(|row| row.event_id)
                .collect::<Vec<_>>()
        );
        assert!(!remainder.events.has_more);
        assert_eq!(remainder.epic_children.len(), 4);
    }

    #[test]
    fn observation_fails_closed_on_corrupt_stored_state_and_schema() {
        let state_dir = tempfile::tempdir().expect("state tempdir");
        let state_ledger = Ledger::open(&state_dir.path().join("state.db")).expect("ledger");
        seed_run(&state_ledger, "corrupt-state", None);
        state_ledger
            .submit(|conn| {
                conn.execute_batch("PRAGMA ignore_check_constraints=ON;")?;
                conn.execute(
                    "UPDATE runs SET state = 'zombie' WHERE run_id = 'corrupt-state'",
                    [],
                )?;
                Ok(())
            })
            .expect("corrupt state");
        let error = state_ledger
            .work_observation_snapshot(WorkIdentitySubjectKind::Run, "corrupt-state", 0, 10)
            .expect_err("unknown state must not default to active");
        assert_eq!(error.code(), ErrorCode::Internal);

        let schema_dir = tempfile::tempdir().expect("schema tempdir");
        let schema_ledger = Ledger::open(&schema_dir.path().join("state.db")).expect("ledger");
        seed_run(&schema_ledger, "corrupt-schema", None);
        let packet = seed_packet(&schema_ledger, "corrupt-schema", 1);
        seed_admission(&schema_ledger, &packet, "forged.admission-decision/999");
        let error = schema_ledger
            .work_observation_snapshot(WorkIdentitySubjectKind::Run, "corrupt-schema", 0, 10)
            .expect_err("unknown schema must not be projected");
        assert_eq!(error.code(), ErrorCode::Internal);
    }

    #[test]
    fn observation_rejects_unbounded_or_invalid_event_windows() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        for (after, limit) in [(-1, 1), (0, 0), (0, WORK_OBSERVATION_MAX_EVENT_LIMIT + 1)] {
            let error = ledger
                .work_observation_snapshot(WorkIdentitySubjectKind::Run, "any", after, limit)
                .expect_err("invalid window");
            assert_eq!(error.code(), ErrorCode::InvalidRequest);
        }
    }
}
