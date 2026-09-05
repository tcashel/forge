//! Run rows and the `run.state` transition rules.

use std::fmt::Write as _;

use forged_types::{
    canonical_json_bytes, normalize_repository_path, AcceptedRisk, ErrorCode, ExecutionPackageV1,
    ExecutionPolicyV1, ResolvedRosterV1, WorkIdentitySource, WorkIdentitySubjectKind,
    WorkIdentityV1, EXECUTION_PACKAGE_SCHEMA_V1,
};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde::Serialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::error::{column_decode_error, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{
    DesiredReconcileOutcome, DesiredSubjectKind, NewRun, NewRunDefinition, PolicyRevisionBatch,
    PolicyRevisionRow, RosterRevisionBatch, RosterRevisionRow, RunDefinitionRow, RunOutcome,
    RunRow, RunSettlement, RunState,
};
use crate::work_identity::{
    get_work_identity_tx, identity_replay_matches, insert_work_identity_tx, legacy_run_identity,
};

pub(crate) fn run_row(row: &rusqlite::Row<'_>) -> Result<RunRow, rusqlite::Error> {
    let state = row.get::<_, String>(6)?;
    Ok(RunRow {
        run_id: row.get(0)?,
        work_id: row.get(1)?,
        repo: row.get(2)?,
        base_ref: row.get(3)?,
        branch: row.get(4)?,
        protocol: row.get(5)?,
        state: RunState::try_from(state.as_str())
            .map_err(|_| column_decode_error(6, "run state", &state))?,
        stop_reason: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
        terminal_outcome: row
            .get::<_, Option<String>>(10)?
            .as_deref()
            .map(RunOutcome::try_from)
            .transpose()
            .map_err(|error| {
                rusqlite::Error::FromSqlConversionFailure(
                    10,
                    rusqlite::types::Type::Text,
                    Box::new(error),
                )
            })?,
        delivery_pr: row
            .get::<_, Option<i64>>(11)?
            .map(u64::try_from)
            .transpose()
            .map_err(|error| {
                rusqlite::Error::FromSqlConversionFailure(
                    11,
                    rusqlite::types::Type::Integer,
                    Box::new(error),
                )
            })?,
        delivery_sha: row.get(12)?,
        superseded_by: row.get(13)?,
    })
}

pub(crate) const RUN_COLUMNS: &str = "run_id, bead_id, repo, base_ref, branch, protocol, state, \
                           stop_reason, created_at, updated_at, terminal_outcome, delivery_pr, \
                           delivery_sha, superseded_by";

const EFFECTIVE_DEFINITION_COLUMNS: &str = "d.run_id, d.protocol_ref_json, d.profile_ref_json, \
    d.roster_ref_json, COALESCE(m.package_sha256, d.package_sha256), d.profile_sha256, \
    d.roster_sha256, COALESCE(m.package_json, d.package_json), d.compatibility_roster_json, \
    d.started_from_json, d.created_at";
const EXECUTION_POLICY_MIGRATION: &str = "forged.run.execution-policy/1";
const CONTROLLER_REVOKED: &str = "forged.controller.revoked";

#[derive(Clone, Copy, PartialEq, Eq)]
enum SettlementAuthority {
    Ordinary,
    Adjudication,
}

struct ReviewRiskTerminal {
    review_rounds: u8,
    blocked_reason: String,
}

fn review_risk_terminal(payload: &Value) -> Option<ReviewRiskTerminal> {
    let terminal = payload.get("terminal")?;
    if let Some(value) = terminal.get("reviewBudgetExhausted") {
        let review_rounds = terminal_round(value, "reviewRounds")?;
        let verdict = terminal_verdict(value)?;
        if verdict == "approve" {
            return None;
        }
        let blocked_reason = review_terminal_reason(value).unwrap_or_else(|| {
            format!(
                "review budget exhausted after {review_rounds} rounds with verdict {}",
                verdict
            )
        });
        return Some(ReviewRiskTerminal {
            review_rounds,
            blocked_reason,
        });
    }
    if let Some(value) = terminal.get("remediationFailed") {
        let review_rounds = terminal_round(value, "round")?;
        let verdict = terminal_verdict(value)?;
        if verdict == "approve" {
            return None;
        }
        let blocked_reason = review_terminal_reason(value).unwrap_or_else(|| {
            format!(
                "remediation failed in round {review_rounds} with verdict {}",
                verdict
            )
        });
        return Some(ReviewRiskTerminal {
            review_rounds,
            blocked_reason,
        });
    }
    let value = terminal.get("done")?;
    let verdict = terminal_verdict(value)?;
    if verdict == "approve" {
        return None;
    }
    let review_rounds = terminal_round(value, "reviewRounds")?;
    let blocked_reason = review_terminal_reason(value)
        .unwrap_or_else(|| format!("protocol exhausted its review rounds with verdict {verdict}"));
    Some(ReviewRiskTerminal {
        review_rounds,
        blocked_reason,
    })
}

fn terminal_round(value: &Value, field: &str) -> Option<u8> {
    value
        .get(field)
        .and_then(Value::as_u64)
        .and_then(|round| u8::try_from(round).ok())
}

fn terminal_verdict(value: &Value) -> Option<&str> {
    match value.get("finalVerdict") {
        None | Some(Value::Null) => Some("unavailable"),
        Some(Value::String(verdict))
            if matches!(verdict.as_str(), "approve" | "requestChanges" | "block") =>
        {
            Some(verdict)
        }
        _ => None,
    }
}

fn review_terminal_reason(value: &Value) -> Option<String> {
    terminal_verdict(value)?;
    if value.get("finalVerdictDurable").and_then(Value::as_bool) != Some(false) {
        return None;
    }
    let failures = value.get("failedReviewSeats").and_then(Value::as_u64)?;
    (failures > 0)
        .then(|| format!("verdict unavailable: {failures} review seat(s) failed without a result"))
}

fn append_controller_revocation_tx(
    conn: &Connection,
    run_id: &str,
    generation: u32,
    reason: &str,
) -> Result<(), LedgerError> {
    let mut statement = conn.prepare(
        "SELECT payload_json FROM events WHERE run_id = ?1 AND kind = ?2 ORDER BY event_id",
    )?;
    let rows = statement.query_map(rusqlite::params![run_id, CONTROLLER_REVOKED], |row| {
        row.get::<_, String>(0)
    })?;
    for payload in rows {
        let payload: serde_json::Value = serde_json::from_str(&payload?)?;
        if payload
            .get("generation")
            .and_then(serde_json::Value::as_u64)
            == Some(u64::from(generation))
        {
            return Ok(());
        }
    }
    append_event_tx(
        conn,
        Some(run_id),
        CONTROLLER_REVOKED,
        &json!({
            "schemaVersion": 1,
            "runId": run_id,
            "generation": generation,
            "reason": reason,
        }),
    )
}

fn definition_row(row: &rusqlite::Row<'_>) -> Result<RunDefinitionRow, rusqlite::Error> {
    let started_from_json = row.get::<_, Option<String>>(9)?;
    let started_from = started_from_json
        .map(|value| serde_json::from_str(&value))
        .transpose()
        .map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                9,
                rusqlite::types::Type::Text,
                Box::new(error),
            )
        })?;
    Ok(RunDefinitionRow {
        run_id: row.get(0)?,
        protocol_ref_json: row.get(1)?,
        profile_ref_json: row.get(2)?,
        roster_ref_json: row.get(3)?,
        package_sha256: row.get(4)?,
        profile_sha256: row.get(5)?,
        roster_sha256: row.get(6)?,
        package_json: row.get(7)?,
        compatibility_roster_json: row.get(8)?,
        started_from,
        created_at: row.get(10)?,
    })
}

fn revision_row(row: &rusqlite::Row<'_>) -> Result<RosterRevisionRow, rusqlite::Error> {
    let revision: i64 = row.get(1)?;
    Ok(RosterRevisionRow {
        run_id: row.get(0)?,
        revision: revision.try_into().map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                1,
                rusqlite::types::Type::Integer,
                Box::new(error),
            )
        })?,
        roster_ref_json: row.get(2)?,
        roster_sha256: row.get(3)?,
        roster_json: row.get(4)?,
        reason: row.get(5)?,
        created_at: row.get(6)?,
        operation_id: row.get(7)?,
    })
}

fn policy_revision_row(row: &rusqlite::Row<'_>) -> Result<PolicyRevisionRow, rusqlite::Error> {
    let revision: i64 = row.get(1)?;
    Ok(PolicyRevisionRow {
        run_id: row.get(0)?,
        revision: revision.try_into().map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                1,
                rusqlite::types::Type::Integer,
                Box::new(error),
            )
        })?,
        policy_json: row.get(2)?,
        policy_sha256: row.get(3)?,
        reason: row.get(4)?,
        created_at: row.get(5)?,
        operation_id: row.get(6)?,
    })
}

pub(crate) fn latest_policy_revision_tx(
    conn: &Connection,
    run_id: &str,
) -> Result<Option<PolicyRevisionRow>, LedgerError> {
    require_run(conn, run_id)?;
    conn.query_row(
        "SELECT run_id, revision, policy_json, policy_sha256, reason, created_at, \
         operation_id FROM policy_revisions WHERE run_id = ?1 \
         ORDER BY revision DESC LIMIT 1",
        [run_id],
        policy_revision_row,
    )
    .optional()
    .map_err(Into::into)
}

fn canonical<T: Serialize>(value: &T) -> Result<(String, String), LedgerError> {
    let value = serde_json::to_value(value)?;
    let bytes = canonical_json_bytes(&value)
        .map_err(|error| crate::error::internal(format!("canonical JSON: {error}")))?;
    let digest = Sha256::digest(&bytes);
    let mut hex = String::with_capacity(64);
    for byte in digest {
        write!(&mut hex, "{byte:02x}")
            .map_err(|_| crate::error::internal("digest formatting failed"))?;
    }
    let text = String::from_utf8(bytes)
        .map_err(|error| crate::error::internal(format!("canonical JSON is not UTF-8: {error}")))?;
    Ok((text, hex))
}

fn event_revision(value: Option<&serde_json::Value>) -> Option<String> {
    match value? {
        serde_json::Value::String(value) if !value.trim().is_empty() => Some(value.clone()),
        serde_json::Value::Number(value) => Some(value.to_string()),
        _ => None,
    }
}

fn insert_run(
    tx: &rusqlite::Transaction<'_>,
    new_run: &NewRun,
    now: &str,
) -> Result<RunRow, LedgerError> {
    let run_id = new_run.run_id.as_str();
    let exists: Option<i64> = tx
        .query_row("SELECT 1 FROM runs WHERE run_id = ?1", [run_id], |row| {
            row.get(0)
        })
        .optional()?;
    if exists.is_some() {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!("run {run_id:?} already exists"),
        ));
    }
    tx.execute(
        "INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, state, \
         created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, 'active', ?6, ?6)",
        rusqlite::params![
            run_id,
            new_run.work_id,
            new_run.repo,
            new_run.base_ref,
            new_run.branch,
            now
        ],
    )?;
    get_run_tx(tx, run_id)
}

/// Every run row inside the caller's transaction, ordered by `created_at`
/// then rowid ascending.
pub(crate) fn list_runs_tx(conn: &Connection) -> Result<Vec<RunRow>, LedgerError> {
    let sql = format!("SELECT {RUN_COLUMNS} FROM runs ORDER BY created_at, rowid");
    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query_map([], run_row)?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

pub(crate) fn get_run_tx(conn: &Connection, run_id: &str) -> Result<RunRow, LedgerError> {
    let sql = format!("SELECT {RUN_COLUMNS} FROM runs WHERE run_id = ?1");
    conn.query_row(&sql, [run_id], run_row)
        .optional()?
        .ok_or_else(|| refused(ErrorCode::RunNotFound, format!("no run {run_id:?}")))
}

/// Refuse with `RunNotFound` unless `run_id` exists.
pub(crate) fn require_run(conn: &Connection, run_id: &str) -> Result<(), LedgerError> {
    let found: Option<i64> = conn
        .query_row("SELECT 1 FROM runs WHERE run_id = ?1", [run_id], |row| {
            row.get(0)
        })
        .optional()?;
    match found {
        Some(_) => Ok(()),
        None => Err(refused(
            ErrorCode::RunNotFound,
            format!("no run {run_id:?}"),
        )),
    }
}

impl Ledger {
    /// Freeze the supplied policy into every definition written before policy
    /// joined the execution-package schema.
    ///
    /// Original definition rows remain untouched. Each legacy row receives at
    /// most one append-only overlay, and readers project that overlay as the
    /// effective package. The whole upgrade is one immediate transaction, so
    /// a crash exposes either all overlays or none of them.
    pub fn migrate_legacy_execution_packages(
        &self,
        policy: ExecutionPolicyV1,
    ) -> Result<usize, LedgerError> {
        self.submit(move |conn| {
            let policy_errors = policy.validate();
            if !policy_errors.is_empty() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("execution policy is invalid: {policy_errors:?}"),
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let completed: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM runtime_migrations WHERE name = ?1)",
                [EXECUTION_POLICY_MIGRATION],
                |row| row.get(0),
            )?;
            if completed {
                tx.commit()?;
                return Ok(0);
            }
            let candidates = {
                let mut statement = tx.prepare(
                    "SELECT d.run_id, d.package_sha256, d.package_json \
                     FROM run_definitions d \
                     LEFT JOIN run_package_migrations m ON m.run_id = d.run_id \
                     WHERE m.run_id IS NULL ORDER BY d.run_id",
                )?;
                let rows = statement
                    .query_map([], |row| {
                        Ok((
                            row.get::<_, String>(0)?,
                            row.get::<_, String>(1)?,
                            row.get::<_, String>(2)?,
                        ))
                    })?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            };
            let mut migrated = 0;
            for (run_id, previous_package_sha256, package_json) in candidates {
                let mut value: serde_json::Value = serde_json::from_str(&package_json)?;
                if value.get("policy").is_some() {
                    continue;
                }
                let (_, verified_previous_sha256) = canonical(&value)?;
                if verified_previous_sha256 != previous_package_sha256 {
                    return Err(refused(
                        ErrorCode::Internal,
                        format!("legacy execution package digest mismatch for run {run_id:?}"),
                    ));
                }
                let object = value.as_object_mut().ok_or_else(|| {
                    crate::error::internal(format!(
                        "legacy execution package for run {run_id:?} is not an object"
                    ))
                })?;
                object.insert("policy".to_owned(), serde_json::to_value(&policy)?);
                let package: ExecutionPackageV1 = serde_json::from_value(value)?;
                if package.schema != EXECUTION_PACKAGE_SCHEMA_V1 {
                    return Err(refused(
                        ErrorCode::Internal,
                        format!(
                            "unsupported legacy execution package schema {:?} for run {run_id:?}",
                            package.schema
                        ),
                    ));
                }
                if package.roster_ref != package.roster.roster_ref {
                    return Err(refused(
                        ErrorCode::Internal,
                        format!("legacy execution package roster ref mismatch for run {run_id:?}"),
                    ));
                }
                let (_, profile_sha256) = canonical(&package.profile)?;
                let (_, roster_sha256) = canonical(&package.roster)?;
                if profile_sha256 != package.profile_sha256
                    || roster_sha256 != package.roster_sha256
                {
                    return Err(refused(
                        ErrorCode::Internal,
                        format!("legacy execution package content mismatch for run {run_id:?}"),
                    ));
                }
                let (migrated_package_json, package_sha256) = canonical(&package)?;
                tx.execute(
                    "INSERT INTO run_package_migrations \
                     (run_id, previous_package_sha256, package_sha256, package_json, created_at) \
                     VALUES (?1, ?2, ?3, ?4, ?5)",
                    rusqlite::params![
                        run_id,
                        previous_package_sha256,
                        package_sha256,
                        migrated_package_json,
                        now_iso(),
                    ],
                )?;
                migrated += 1;
            }
            tx.execute(
                "INSERT INTO runtime_migrations (name, completed_at) VALUES (?1, ?2)",
                rusqlite::params![EXECUTION_POLICY_MIGRATION, now_iso()],
            )?;
            tx.commit()?;
            Ok(migrated)
        })
    }

    /// Create a run in state `active`. A duplicate id refuses with
    /// `InvalidRequest`. Creation appends no event — a run's initial
    /// `active` state is a creation, not a transition.
    pub fn create_run(&self, new_run: NewRun) -> Result<RunRow, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let now = now_iso();
            let row = insert_run(&tx, &new_run, &now)?;
            insert_work_identity_tx(&tx, &legacy_run_identity(&new_run, &now))?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Create a run, its immutable execution package, and roster revision 1
    /// in one transaction. All supplied digests are independently verified.
    pub fn create_run_with_definition(
        &self,
        new_run: NewRun,
        definition: NewRunDefinition,
    ) -> Result<RunRow, LedgerError> {
        self.submit(move |conn| {
            let package = &definition.package;
            if package.schema != EXECUTION_PACKAGE_SCHEMA_V1 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("unsupported execution package schema {:?}", package.schema),
                ));
            }
            if package.roster_ref != package.roster.roster_ref {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "execution package roster ref does not match resolved roster",
                ));
            }
            let (profile_json, profile_sha256) = canonical(&package.profile)?;
            let (roster_json, roster_sha256) = canonical(&package.roster)?;
            let (policy_json, policy_sha256) = canonical(&package.policy)?;
            let (package_json, package_sha256) = canonical(package)?;
            if profile_sha256 != package.profile_sha256 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "execution package profile digest mismatch",
                ));
            }
            if roster_sha256 != package.roster_sha256 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "execution package roster digest mismatch",
                ));
            }
            if package_sha256 != definition.package_sha256 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "execution package digest mismatch",
                ));
            }
            let (protocol_ref_json, _) = canonical(&package.protocol_ref)?;
            let (profile_ref_json, _) = canonical(&package.profile_ref)?;
            let (roster_ref_json, _) = canonical(&package.roster_ref)?;
            let (compatibility_roster_json, _) = canonical(&definition.compatibility_roster)?;
            let started_from_json = definition
                .started_from
                .as_ref()
                .map(|value| canonical(value).map(|(json, _)| json))
                .transpose()?;

            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let now = now_iso();
            let row = insert_run(&tx, &new_run, &now)?;
            tx.execute(
                "INSERT INTO run_definitions (run_id, protocol_ref_json, profile_ref_json, \
                 roster_ref_json, package_sha256, profile_sha256, roster_sha256, package_json, \
                 compatibility_roster_json, started_from_json, created_at) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                rusqlite::params![
                    row.run_id,
                    protocol_ref_json,
                    profile_ref_json,
                    roster_ref_json,
                    package_sha256,
                    profile_sha256,
                    roster_sha256,
                    package_json,
                    compatibility_roster_json,
                    started_from_json,
                    now,
                ],
            )?;
            tx.execute(
                "INSERT INTO roster_revisions (run_id, revision, roster_ref_json, roster_sha256, \
                 roster_json, reason, created_at) VALUES (?1, 1, ?2, ?3, ?4, 'run-created', ?5)",
                rusqlite::params![row.run_id, roster_ref_json, roster_sha256, roster_json, now],
            )?;
            tx.execute(
                "INSERT INTO policy_revisions (run_id, revision, policy_json, policy_sha256, \
                 reason, created_at) VALUES (?1, 1, ?2, ?3, 'run-created', ?4)",
                rusqlite::params![row.run_id, policy_json, policy_sha256, now],
            )?;
            insert_work_identity_tx(&tx, &legacy_run_identity(&new_run, &now))?;
            // Keep the canonicalized profile alive as an explicit integrity
            // input above even though the full package stores it.
            drop(profile_json);
            tx.commit()?;
            Ok(row)
        })
    }

    /// Atomically create the complete run launch bundle: run row, immutable
    /// execution definition, roster revision 1, compatibility spec-source
    /// event, and frozen work identity. An exact retry returns the standing
    /// run; partial or conflicting bundles fail closed.
    pub fn create_run_with_identity(
        &self,
        new_run: NewRun,
        definition: NewRunDefinition,
        spec_event: serde_json::Value,
        identity: WorkIdentityV1,
    ) -> Result<RunRow, LedgerError> {
        self.submit(move |conn| {
            identity.validate_for_storage().map_err(|error| {
                refused(
                    ErrorCode::InvalidRequest,
                    format!("invalid run work identity: {error}"),
                )
            })?;
            if identity.source != WorkIdentitySource::Durable
                || identity.subject.kind != WorkIdentitySubjectKind::Run
                || identity.subject.id != new_run.run_id.as_str()
                || identity.work.id != new_run.work_id
            {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "run launch requires a durable matching run identity",
                ));
            }
            let normalized_repo = normalize_repository_path(&new_run.repo).ok_or_else(|| {
                refused(
                    ErrorCode::InvalidRequest,
                    "run launch repository must be an absolute lexical path",
                )
            })?;
            if identity
                .repository
                .as_ref()
                .map(|value| value.path.as_str())
                != Some(normalized_repo.as_str())
            {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "run launch repository does not match its identity",
                ));
            }
            if spec_event.get("runId").and_then(serde_json::Value::as_str)
                != Some(new_run.run_id.as_str())
                || spec_event
                    .get("beadTitle")
                    .and_then(serde_json::Value::as_str)
                    != identity.work.title.as_deref()
                || spec_event
                    .get("beadId")
                    .and_then(serde_json::Value::as_str)
                    .is_some_and(|value| value != identity.work.id)
                || event_revision(spec_event.get("beadRevision")) != identity.work.revision
                || spec_event
                    .get("repo")
                    .and_then(serde_json::Value::as_str)
                    .and_then(normalize_repository_path)
                    .as_deref()
                    != identity
                        .repository
                        .as_ref()
                        .map(|value| value.path.as_str())
            {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "run spec event does not match its identity",
                ));
            }

            let package = &definition.package;
            if package.schema != EXECUTION_PACKAGE_SCHEMA_V1 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("unsupported execution package schema {:?}", package.schema),
                ));
            }
            if package.roster_ref != package.roster.roster_ref {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "execution package roster ref does not match resolved roster",
                ));
            }
            let (profile_json, profile_sha256) = canonical(&package.profile)?;
            let (roster_json, roster_sha256) = canonical(&package.roster)?;
            let (policy_json, policy_sha256) = canonical(&package.policy)?;
            let (package_json, package_sha256) = canonical(package)?;
            if profile_sha256 != package.profile_sha256 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "execution package profile digest mismatch",
                ));
            }
            if roster_sha256 != package.roster_sha256 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "execution package roster digest mismatch",
                ));
            }
            if package_sha256 != definition.package_sha256 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "execution package digest mismatch",
                ));
            }
            let (protocol_ref_json, _) = canonical(&package.protocol_ref)?;
            let (profile_ref_json, _) = canonical(&package.profile_ref)?;
            let (roster_ref_json, _) = canonical(&package.roster_ref)?;
            let (compatibility_roster_json, _) = canonical(&definition.compatibility_roster)?;
            let started_from_json = definition
                .started_from
                .as_ref()
                .map(|value| canonical(value).map(|(json, _)| json))
                .transpose()?;

            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let run_id = new_run.run_id.as_str();
            let existing = {
                let sql = format!("SELECT {RUN_COLUMNS} FROM runs WHERE run_id = ?1");
                tx.query_row(&sql, [run_id], run_row).optional()?
            };
            if let Some(row) = existing {
                let immutable_run_matches = row.work_id == new_run.work_id
                    && row.repo == new_run.repo
                    && row.base_ref == new_run.base_ref
                    && row.branch == new_run.branch;
                let stored_definition = tx
                    .query_row(
                        "SELECT run_id, protocol_ref_json, profile_ref_json, roster_ref_json, \
                         package_sha256, profile_sha256, roster_sha256, package_json, \
                         compatibility_roster_json, started_from_json, created_at FROM run_definitions \
                         WHERE run_id = ?1",
                        [run_id],
                        definition_row,
                    )
                    .optional()?;
                let definition_matches = stored_definition.is_some_and(|stored| {
                    stored.protocol_ref_json == protocol_ref_json
                        && stored.profile_ref_json == profile_ref_json
                        && stored.roster_ref_json == roster_ref_json
                        && stored.package_sha256 == package_sha256
                        && stored.profile_sha256 == profile_sha256
                        && stored.roster_sha256 == roster_sha256
                        && stored.package_json == package_json
                        && stored.compatibility_roster_json == compatibility_roster_json
                        && stored.started_from == definition.started_from
                });
                let revision_matches: bool = tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM roster_revisions WHERE run_id = ?1 \
                         AND revision = 1 AND roster_ref_json = ?2 AND roster_sha256 = ?3 \
                         AND roster_json = ?4 AND reason = 'run-created')",
                    rusqlite::params![run_id, roster_ref_json, roster_sha256, roster_json],
                    |row| row.get(0),
                )?;
                let policy_revision_matches: bool = tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM policy_revisions WHERE run_id = ?1 \
                         AND revision = 1 AND policy_json = ?2 AND policy_sha256 = ?3 \
                         AND reason = 'run-created')",
                    rusqlite::params![run_id, policy_json, policy_sha256],
                    |row| row.get(0),
                )?;
                let stored_events = {
                    let mut statement = tx.prepare(
                        "SELECT payload_json FROM events WHERE run_id = ?1 \
                         AND kind = 'forged.run.spec' ORDER BY event_id",
                    )?;
                    let rows = statement.query_map([run_id], |row| row.get::<_, String>(0))?;
                    rows.collect::<Result<Vec<_>, _>>()?
                };
                let event_matches = match stored_events.as_slice() {
                    [payload] => serde_json::from_str::<serde_json::Value>(payload)
                        .is_ok_and(|stored| stored == spec_event),
                    _ => false,
                };
                let identity_matches =
                    get_work_identity_tx(&tx, WorkIdentitySubjectKind::Run, run_id)?
                        .is_some_and(|standing| identity_replay_matches(&standing, &identity));
                if !immutable_run_matches
                    || !definition_matches
                    || !revision_matches
                    || !policy_revision_matches
                    || !event_matches
                    || !identity_matches
                {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!("run {run_id:?} launch replay conflicts with durable bundle"),
                    ));
                }
                tx.commit()?;
                drop(profile_json);
                return Ok(row);
            }

            let now = now_iso();
            let row = insert_run(&tx, &new_run, &now)?;
            tx.execute(
                "INSERT INTO run_definitions (run_id, protocol_ref_json, profile_ref_json, \
                 roster_ref_json, package_sha256, profile_sha256, roster_sha256, package_json, \
                 compatibility_roster_json, started_from_json, created_at) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                rusqlite::params![
                    row.run_id,
                    protocol_ref_json,
                    profile_ref_json,
                    roster_ref_json,
                    package_sha256,
                    profile_sha256,
                    roster_sha256,
                    package_json,
                    compatibility_roster_json,
                    started_from_json,
                    now,
                ],
            )?;
            tx.execute(
                "INSERT INTO roster_revisions (run_id, revision, roster_ref_json, roster_sha256, \
                 roster_json, reason, created_at) VALUES (?1, 1, ?2, ?3, ?4, 'run-created', ?5)",
                rusqlite::params![row.run_id, roster_ref_json, roster_sha256, roster_json, now],
            )?;
            tx.execute(
                "INSERT INTO policy_revisions (run_id, revision, policy_json, policy_sha256, \
                 reason, created_at) VALUES (?1, 1, ?2, ?3, 'run-created', ?4)",
                rusqlite::params![row.run_id, policy_json, policy_sha256, now],
            )?;
            append_event_tx(&tx, Some(&row.run_id), "forged.run.spec", &spec_event)?;
            insert_work_identity_tx(&tx, &identity)?;
            drop(profile_json);
            tx.commit()?;
            Ok(row)
        })
    }

    /// Fetch the immutable execution package for a run. Legacy runs return
    /// `None`; a nonexistent run still refuses `RunNotFound`.
    pub fn get_run_definition(
        &self,
        run_id: &str,
    ) -> Result<Option<RunDefinitionRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            require_run(conn, &run_id)?;
            let sql = format!(
                "SELECT {EFFECTIVE_DEFINITION_COLUMNS} FROM run_definitions d \
                 LEFT JOIN run_package_migrations m ON m.run_id = d.run_id WHERE d.run_id = ?1"
            );
            Ok(conn.query_row(&sql, [&run_id], definition_row).optional()?)
        })
    }

    /// Fetch the latest execution-policy revision for a run.
    pub fn latest_policy_revision(
        &self,
        run_id: &str,
    ) -> Result<Option<PolicyRevisionRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| latest_policy_revision_tx(conn, &run_id))
    }

    /// List every execution-policy revision for a run in durable order.
    pub fn list_policy_revisions(
        &self,
        run_id: &str,
    ) -> Result<Vec<PolicyRevisionRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            require_run(conn, &run_id)?;
            let mut statement = conn.prepare(
                "SELECT run_id, revision, policy_json, policy_sha256, reason, created_at, \
                 operation_id FROM policy_revisions WHERE run_id = ?1 ORDER BY revision",
            )?;
            let rows = statement.query_map([&run_id], policy_revision_row)?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }

    /// Append a validated execution policy as the next revision.
    pub fn append_policy_revision(
        &self,
        run_id: &str,
        policy: ExecutionPolicyV1,
        policy_sha256: String,
        reason: String,
        operation_id: String,
    ) -> Result<PolicyRevisionRow, LedgerError> {
        let run_id = run_id.to_owned();
        if reason.trim().is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "policy revision requires a reason",
            ));
        }
        if let Some(error) = policy.validate().into_iter().next() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                format!(
                    "policy revision is invalid at {}: {}",
                    error.path, error.message
                ),
            ));
        }
        let (policy_json, actual_sha256) = canonical(&policy)?;
        if policy_sha256 != actual_sha256 {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "policy revision digest mismatch",
            ));
        }
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            require_run(&tx, &run_id)?;
            let has_definition: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM run_definitions WHERE run_id = ?1)",
                [&run_id],
                |row| row.get(0),
            )?;
            if !has_definition {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "legacy run has no revisable policy",
                ));
            }
            let existing = tx
                .query_row(
                    "SELECT run_id, revision, policy_json, policy_sha256, reason, created_at, \
                     operation_id FROM policy_revisions WHERE operation_id = ?1",
                    [&operation_id],
                    policy_revision_row,
                )
                .optional()?;
            if let Some(existing) = existing {
                if existing.run_id == run_id
                    && existing.policy_sha256 == policy_sha256
                    && existing.reason == reason
                {
                    tx.commit()?;
                    return Ok(existing);
                }
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "policy revision operation was reused with different content",
                ));
            }
            let latest = tx
                .query_row(
                    "SELECT run_id, revision, policy_json, policy_sha256, reason, created_at, \
                     operation_id FROM policy_revisions WHERE run_id = ?1 \
                     ORDER BY revision DESC LIMIT 1",
                    [&run_id],
                    policy_revision_row,
                )
                .optional()?;
            if let Some(latest) = latest {
                if latest.policy_sha256 == policy_sha256 && latest.reason == reason {
                    tx.commit()?;
                    return Ok(latest);
                }
            }
            let current: i64 = tx.query_row(
                "SELECT COALESCE(MAX(revision), 0) FROM policy_revisions WHERE run_id = ?1",
                [&run_id],
                |row| row.get(0),
            )?;
            let next = current
                .checked_add(1)
                .ok_or_else(|| crate::error::internal("policy revision counter overflow"))?;
            let now = now_iso();
            tx.execute(
                "INSERT INTO policy_revisions (run_id, revision, policy_json, policy_sha256, \
                 reason, created_at, operation_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                rusqlite::params![
                    run_id,
                    next,
                    policy_json,
                    policy_sha256,
                    reason,
                    now,
                    operation_id,
                ],
            )?;
            let revision = u32::try_from(next)
                .map_err(|_| crate::error::internal("policy revision does not fit u32"))?;
            let row = PolicyRevisionRow {
                run_id,
                revision,
                policy_json,
                policy_sha256,
                reason,
                created_at: now,
                operation_id: Some(operation_id),
            };
            tx.commit()?;
            Ok(row)
        })
    }

    /// Fetch the latest roster revision for a run.
    pub fn latest_roster_revision(
        &self,
        run_id: &str,
    ) -> Result<Option<RosterRevisionRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            require_run(conn, &run_id)?;
            conn.query_row(
                "SELECT run_id, revision, roster_ref_json, roster_sha256, roster_json, reason, \
                 created_at, operation_id FROM roster_revisions WHERE run_id = ?1 \
                 ORDER BY revision DESC LIMIT 1",
                [&run_id],
                revision_row,
            )
            .optional()
            .map_err(Into::into)
        })
    }

    /// List every roster revision for a run in durable revision order.
    pub fn list_roster_revisions(
        &self,
        run_id: &str,
    ) -> Result<Vec<RosterRevisionRow>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            require_run(conn, &run_id)?;
            let mut stmt = conn.prepare(
                "SELECT run_id, revision, roster_ref_json, roster_sha256, roster_json, reason, \
                 created_at, operation_id FROM roster_revisions WHERE run_id = ?1 \
                 ORDER BY revision",
            )?;
            let rows = stmt.query_map([&run_id], revision_row)?;
            let mut revisions = Vec::new();
            for row in rows {
                revisions.push(row?);
            }
            Ok(revisions)
        })
    }

    /// Append a validated roster snapshot as the next revision. The caller
    /// supplies canonical semantics; the ledger independently verifies the
    /// digest and requires a definition-backed run and non-empty reason.
    pub fn append_roster_revision(
        &self,
        run_id: &str,
        roster: ResolvedRosterV1,
        roster_sha256: String,
        reason: String,
        operation_id: String,
    ) -> Result<RosterRevisionRow, LedgerError> {
        let run_id = run_id.to_owned();
        if reason.trim().is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "roster revision requires a reason",
            ));
        }
        let (roster_json, actual_sha256) = canonical(&roster)?;
        if roster_sha256 != actual_sha256 {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "roster revision digest mismatch",
            ));
        }
        let (roster_ref_json, _) = canonical(&roster.roster_ref)?;
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            require_run(&tx, &run_id)?;
            let has_definition: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM run_definitions WHERE run_id = ?1)",
                [&run_id],
                |row| row.get(0),
            )?;
            if !has_definition {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "legacy run has no revisable roster",
                ));
            }
            let existing = tx
                .query_row(
                    "SELECT run_id, revision, roster_ref_json, roster_sha256, roster_json, reason, \
                     created_at, operation_id FROM roster_revisions WHERE operation_id = ?1",
                    [&operation_id],
                    revision_row,
                )
                .optional()?;
            if let Some(existing) = existing {
                if existing.run_id == run_id
                    && existing.roster_sha256 == roster_sha256
                    && existing.reason == reason
                {
                    tx.commit()?;
                    return Ok(existing);
                }
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "roster revision operation was reused with different content",
                ));
            }
            let current: i64 = tx.query_row(
                "SELECT COALESCE(MAX(revision), 0) FROM roster_revisions WHERE run_id = ?1",
                [&run_id],
                |row| row.get(0),
            )?;
            let revision = current
                .checked_add(1)
                .ok_or_else(|| crate::error::internal("roster revision counter overflow"))?;
            let now = now_iso();
            tx.execute(
                "INSERT INTO roster_revisions (run_id, revision, roster_ref_json, roster_sha256, \
                 roster_json, reason, created_at, operation_id) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                rusqlite::params![
                    run_id,
                    revision,
                    roster_ref_json,
                    roster_sha256,
                    roster_json,
                    reason,
                    now,
                    operation_id,
                ],
            )?;
            let revision: u32 = revision
                .try_into()
                .map_err(|_| crate::error::internal("roster revision does not fit u32"))?;
            let row = RosterRevisionRow {
                run_id,
                revision,
                roster_ref_json,
                roster_sha256,
                roster_json,
                reason,
                created_at: now,
                operation_id: Some(operation_id),
            };
            tx.commit()?;
            Ok(row)
        })
    }

    /// Append the same validated roster to a set of definition-backed runs
    /// and append its governing epic event in one transaction. An empty run
    /// set is valid: it revises the template for future children only.
    pub fn append_roster_revisions_with_event(
        &self,
        batch: RosterRevisionBatch,
    ) -> Result<Vec<RosterRevisionRow>, LedgerError> {
        let RosterRevisionBatch {
            epic_id,
            event_kind,
            event_payload,
            run_ids,
            roster,
            roster_sha256,
            reason,
            operation_prefix,
        } = batch;
        if reason.trim().is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "roster revision requires a reason",
            ));
        }
        let (roster_json, actual_sha256) = canonical(&roster)?;
        if roster_sha256 != actual_sha256 {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "roster revision digest mismatch",
            ));
        }
        let (roster_ref_json, _) = canonical(&roster.roster_ref)?;
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let event_json = serde_json::to_string(&event_payload)?;
            let event_exists: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 AND kind = ?2 AND payload_json = ?3)",
                rusqlite::params![epic_id, event_kind, event_json],
                |row| row.get(0),
            )?;
            let mut rows = Vec::with_capacity(run_ids.len());
            if event_exists {
                for run_id in run_ids {
                    let operation_id = format!("{operation_prefix}:{run_id}");
                    if let Some(existing) = tx
                        .query_row(
                            "SELECT run_id, revision, roster_ref_json, roster_sha256, roster_json, reason, \
                             created_at, operation_id FROM roster_revisions WHERE operation_id = ?1",
                            [&operation_id],
                            revision_row,
                        )
                        .optional()?
                    {
                        rows.push(existing);
                    }
                }
                tx.commit()?;
                return Ok(rows);
            }
            for run_id in run_ids {
                require_run(&tx, &run_id)?;
                let has_definition: bool = tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM run_definitions WHERE run_id = ?1)",
                    [&run_id],
                    |row| row.get(0),
                )?;
                if !has_definition {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!("run {run_id:?} has no revisable roster"),
                    ));
                }
                let operation_id = format!("{operation_prefix}:{run_id}");
                if let Some(existing) = tx
                    .query_row(
                        "SELECT run_id, revision, roster_ref_json, roster_sha256, roster_json, reason, \
                         created_at, operation_id FROM roster_revisions WHERE operation_id = ?1",
                        [&operation_id],
                        revision_row,
                    )
                    .optional()?
                {
                    if existing.run_id != run_id
                        || existing.roster_sha256 != roster_sha256
                        || existing.reason != reason
                    {
                        return Err(refused(
                            ErrorCode::InvalidRequest,
                            "epic roster operation was reused with different content",
                        ));
                    }
                    rows.push(existing);
                    continue;
                }
                let current: i64 = tx.query_row(
                    "SELECT COALESCE(MAX(revision), 0) FROM roster_revisions WHERE run_id = ?1",
                    [&run_id],
                    |row| row.get(0),
                )?;
                let next = current
                    .checked_add(1)
                    .ok_or_else(|| crate::error::internal("roster revision counter overflow"))?;
                let revision = u32::try_from(next)
                    .map_err(|_| crate::error::internal("roster revision does not fit u32"))?;
                let now = now_iso();
                tx.execute(
                    "INSERT INTO roster_revisions (run_id, revision, roster_ref_json, roster_sha256, \
                     roster_json, reason, created_at, operation_id) \
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    rusqlite::params![
                        run_id,
                        next,
                        roster_ref_json,
                        roster_sha256,
                        roster_json,
                        reason,
                        now,
                        operation_id,
                    ],
                )?;
                rows.push(RosterRevisionRow {
                    run_id,
                    revision,
                    roster_ref_json: roster_ref_json.clone(),
                    roster_sha256: roster_sha256.clone(),
                    roster_json: roster_json.clone(),
                    reason: reason.clone(),
                    created_at: now,
                    operation_id: Some(operation_id),
                });
            }
            append_event_tx(&tx, Some(&epic_id), &event_kind, &event_payload)?;
            tx.commit()?;
            Ok(rows)
        })
    }

    /// Append child-specific validated policies and their governing epic
    /// event in one transaction. Merged children are excluded by the caller
    /// before this boundary.
    pub fn append_policy_revisions_with_event(
        &self,
        batch: PolicyRevisionBatch,
    ) -> Result<Vec<PolicyRevisionRow>, LedgerError> {
        let PolicyRevisionBatch {
            epic_id,
            event_kind,
            event_payload,
            writes,
            reason,
        } = batch;
        if reason.trim().is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "policy revision requires a reason",
            ));
        }
        let mut prepared = Vec::with_capacity(writes.len());
        for write in writes {
            if let Some(error) = write.policy.validate().into_iter().next() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "policy revision for run {:?} is invalid at {}: {}",
                        write.run_id, error.path, error.message
                    ),
                ));
            }
            let (policy_json, actual_sha256) = canonical(&write.policy)?;
            if write.policy_sha256 != actual_sha256 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("policy revision digest mismatch for run {:?}", write.run_id),
                ));
            }
            prepared.push((
                write.run_id,
                policy_json,
                write.policy_sha256,
                write.operation_id,
            ));
        }
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let event_json = serde_json::to_string(&event_payload)?;
            let event_exists: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 AND kind = ?2 \
                 AND payload_json = ?3)",
                rusqlite::params![epic_id, event_kind, event_json],
                |row| row.get(0),
            )?;
            let mut rows = Vec::with_capacity(prepared.len());
            if event_exists {
                for (_, _, _, operation_id) in prepared {
                    if let Some(existing) = tx
                        .query_row(
                            "SELECT run_id, revision, policy_json, policy_sha256, reason, \
                             created_at, operation_id FROM policy_revisions \
                             WHERE operation_id = ?1",
                            [&operation_id],
                            policy_revision_row,
                        )
                        .optional()?
                    {
                        rows.push(existing);
                    }
                }
                tx.commit()?;
                return Ok(rows);
            }
            for (run_id, policy_json, policy_sha256, operation_id) in prepared {
                require_run(&tx, &run_id)?;
                let has_definition: bool = tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM run_definitions WHERE run_id = ?1)",
                    [&run_id],
                    |row| row.get(0),
                )?;
                if !has_definition {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!("run {run_id:?} has no revisable policy"),
                    ));
                }
                if let Some(existing) = tx
                    .query_row(
                        "SELECT run_id, revision, policy_json, policy_sha256, reason, \
                         created_at, operation_id FROM policy_revisions WHERE operation_id = ?1",
                        [&operation_id],
                        policy_revision_row,
                    )
                    .optional()?
                {
                    if existing.run_id != run_id
                        || existing.policy_sha256 != policy_sha256
                        || existing.reason != reason
                    {
                        return Err(refused(
                            ErrorCode::InvalidRequest,
                            "epic policy operation was reused with different content",
                        ));
                    }
                    rows.push(existing);
                    continue;
                }
                let current: i64 = tx.query_row(
                    "SELECT COALESCE(MAX(revision), 0) FROM policy_revisions WHERE run_id = ?1",
                    [&run_id],
                    |row| row.get(0),
                )?;
                let next = current
                    .checked_add(1)
                    .ok_or_else(|| crate::error::internal("policy revision counter overflow"))?;
                let revision = u32::try_from(next)
                    .map_err(|_| crate::error::internal("policy revision does not fit u32"))?;
                let now = now_iso();
                tx.execute(
                    "INSERT INTO policy_revisions (run_id, revision, policy_json, policy_sha256, \
                     reason, created_at, operation_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                    rusqlite::params![
                        run_id,
                        next,
                        policy_json,
                        policy_sha256,
                        reason,
                        now,
                        operation_id,
                    ],
                )?;
                rows.push(PolicyRevisionRow {
                    run_id,
                    revision,
                    policy_json,
                    policy_sha256,
                    reason: reason.clone(),
                    created_at: now,
                    operation_id: Some(operation_id),
                });
            }
            append_event_tx(&tx, Some(&epic_id), &event_kind, &event_payload)?;
            tx.commit()?;
            Ok(rows)
        })
    }

    /// Fetch one run, refusing with `RunNotFound` when absent.
    pub fn get_run(&self, run_id: &str) -> Result<RunRow, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| get_run_tx(conn, &run_id))
    }

    /// All runs, ordered by `created_at` then rowid ascending.
    pub fn list_runs(&self) -> Result<Vec<RunRow>, LedgerError> {
        self.submit(move |conn| list_runs_tx(conn))
    }

    /// Bounded candidates for one flat retry chain. Callers still validate
    /// the numeric suffix and work identity; this read only bounds discovery.
    pub fn retry_chain_runs(&self, root: &str, limit: usize) -> Result<Vec<RunRow>, LedgerError> {
        if limit == 0 {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "retry chain limit must be positive",
            ));
        }
        let root = root.to_owned();
        self.submit(move |conn| {
            let pattern = format!("{root}-r*");
            let mut stmt = conn.prepare(&format!(
                "SELECT {RUN_COLUMNS} FROM runs \
                 WHERE run_id = ?1 OR run_id GLOB ?2 \
                 ORDER BY created_at, rowid LIMIT ?3"
            ))?;
            let rows = stmt.query_map(
                rusqlite::params![root, pattern, i64::try_from(limit).unwrap_or(i64::MAX)],
                run_row,
            )?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Stop a run without settling it.
    ///
    /// `Stopped` requires a reason. `Active` is refused: terminal truth is
    /// append-only and re-execution mints a successor run. Re-stopping is an
    /// idempotent `Ok(())` that writes nothing and preserves the first reason.
    /// Stopping never cascades to live attempts — the revoking saga is the
    /// only path that moves an attempt out of `running`.
    pub fn set_run_state(
        &self,
        run_id: &str,
        state: RunState,
        reason: Option<String>,
    ) -> Result<(), LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            match (state, &reason) {
                (RunState::Stopped, None) => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "stopping a run requires a reason",
                    ));
                }
                (RunState::Active, _) => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "set_run_state only stops runs; mint a successor to re-execute",
                    ));
                }
                (RunState::Stopped, Some(_)) => {}
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let current = get_run_tx(&tx, &run_id)?;
            if current.state == state {
                // Idempotent: no write, no event, and a repeated stop never
                // rewrites the original stop_reason.
                tx.commit()?;
                return Ok(());
            }
            let now = now_iso();
            tx.execute(
                "UPDATE runs SET state = ?1, stop_reason = ?2, terminal_outcome = NULL, \
                 delivery_pr = NULL, delivery_sha = NULL, superseded_by = NULL, updated_at = ?3 \
                 WHERE run_id = ?4",
                rusqlite::params![state.as_str(), reason, now, run_id],
            )?;
            append_event_tx(
                &tx,
                Some(&run_id),
                "run.state",
                &json!({
                    "runId": run_id,
                    "old": current.state.as_str(),
                    "new": state.as_str(),
                    "reason": reason,
                }),
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Settle a complete run with an explicit outcome and immutable evidence.
    ///
    /// The transition and `run.settled` event commit together. Replaying the
    /// identical settlement is a no-op; a different settlement is refused so
    /// a late controller cannot rewrite an operator's terminal decision.
    pub fn settle_run(
        &self,
        run_id: &str,
        outcome: RunOutcome,
        reason: String,
        delivery_pr: Option<u64>,
        delivery_sha: Option<String>,
        superseded_by: Option<String>,
    ) -> Result<RunRow, LedgerError> {
        self.settle_run_inner(
            run_id,
            RunSettlement {
                outcome,
                reason,
                delivery_pr,
                delivery_sha,
                superseded_by,
            },
            None,
            false,
            SettlementAuthority::Ordinary,
        )
    }

    /// Settle a run and durably revoke one detached controller generation in
    /// the same transaction. Machine-effect admission joins this event via
    /// [`Ledger::begin_controller_operation`].
    pub fn settle_run_fencing_controller(
        &self,
        run_id: &str,
        settlement: RunSettlement,
        controller_generation: u32,
    ) -> Result<RunRow, LedgerError> {
        self.settle_run_inner(
            run_id,
            settlement,
            Some(controller_generation),
            false,
            SettlementAuthority::Ordinary,
        )
    }

    /// [`Ledger::settle_run_fencing_controller`] for callers with no
    /// controller death to confirm: the transaction additionally refuses
    /// while any in-flight machine operation is uncontained. Admission joins
    /// the same fence, so a machine ticket either commits first — refusing
    /// this settlement before anything terminal exists — or observes the
    /// stopped run and is never admitted.
    pub fn settle_run_fencing_controller_refusing_machine_effects(
        &self,
        run_id: &str,
        settlement: RunSettlement,
        controller_generation: u32,
    ) -> Result<RunRow, LedgerError> {
        self.settle_run_inner(
            run_id,
            settlement,
            Some(controller_generation),
            true,
            SettlementAuthority::Ordinary,
        )
    }

    /// Admit the lead's adjudicated delivery evidence after review-budget
    /// exhaustion. This is the sole `blocked -> landed` settlement door;
    /// ordinary controller and operator settlement retain the closed
    /// transition whitelist.
    pub fn adjudicate_run_settlement_fencing_controller_refusing_machine_effects(
        &self,
        run_id: &str,
        settlement: RunSettlement,
        controller_generation: u32,
    ) -> Result<RunRow, LedgerError> {
        self.settle_run_inner(
            run_id,
            settlement,
            Some(controller_generation),
            true,
            SettlementAuthority::Adjudication,
        )
    }

    fn settle_run_inner(
        &self,
        run_id: &str,
        settlement: RunSettlement,
        controller_generation: Option<u32>,
        refuse_uncontained_machine_effects: bool,
        authority: SettlementAuthority,
    ) -> Result<RunRow, LedgerError> {
        let RunSettlement {
            outcome,
            reason,
            delivery_pr,
            delivery_sha,
            superseded_by,
        } = settlement;
        if reason.trim().is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "settling a run requires a reason",
            ));
        }
        match outcome {
            RunOutcome::Landed => {
                let valid_sha = delivery_sha.as_deref().is_some_and(|sha| {
                    matches!(sha.len(), 40 | 64) && sha.bytes().all(|byte| byte.is_ascii_hexdigit())
                });
                if delivery_pr.is_none() || !valid_sha {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "landed requires a PR number and an exact 40- or 64-hex commit SHA",
                    ));
                }
                if superseded_by.is_some() {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "landed cannot name a successor run",
                    ));
                }
            }
            RunOutcome::Superseded => {
                if superseded_by.as_deref().is_none_or(str::is_empty) {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "superseded requires a successor run id",
                    ));
                }
                if delivery_pr.is_some() || delivery_sha.is_some() {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "superseded cannot carry landed delivery evidence",
                    ));
                }
            }
            _ if delivery_pr.is_some() || delivery_sha.is_some() || superseded_by.is_some() => {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "only landed carries delivery evidence and only superseded names a successor",
                ));
            }
            _ => {}
        }
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let current = get_run_tx(&tx, &run_id)?;
            if refuse_uncontained_machine_effects {
                // Checked ahead of the replay branch as well: a resumed
                // settlement re-verifies containment before re-running any
                // aftermath, exactly like a fresh one.
                let unsafe_operations =
                    crate::operations::uncontained_machine_operations_tx(&tx, &run_id, None)?;
                if !unsafe_operations.is_empty() {
                    return Err(refused(
                        ErrorCode::HostUnavailable,
                        format!(
                            "run {run_id:?} has machine effects without a confirmed-dead \
                             controller: {}",
                            unsafe_operations.join(", ")
                        ),
                    ));
                }
            }
            if current.state == RunState::Stopped {
                if current.terminal_outcome == Some(outcome)
                    && current.stop_reason.as_deref() == Some(reason.as_str())
                    && current.delivery_pr == delivery_pr
                    && current.delivery_sha == delivery_sha
                    && current.superseded_by == superseded_by
                {
                    if let Some(generation) = controller_generation {
                        append_controller_revocation_tx(&tx, &run_id, generation, &reason)?;
                    }
                    crate::desired::stop_desired_work_tx(
                        &tx,
                        DesiredSubjectKind::Run,
                        &run_id,
                        DesiredReconcileOutcome::Terminal,
                    )?;
                    tx.commit()?;
                    return Ok(current);
                }
                let advances = (authority == SettlementAuthority::Adjudication
                    && matches!(
                        (current.terminal_outcome, outcome),
                        (Some(RunOutcome::Blocked), RunOutcome::Landed)
                    ))
                    || matches!(
                        (current.terminal_outcome, outcome),
                        (
                            Some(RunOutcome::Clean | RunOutcome::AcceptedRisk),
                            RunOutcome::Landed
                        ) | (Some(RunOutcome::Blocked), RunOutcome::AcceptedRisk)
                            | (
                                Some(
                                    RunOutcome::Clean
                                        | RunOutcome::Blocked
                                        | RunOutcome::InputRequired
                                        | RunOutcome::Cancelled
                                ),
                                RunOutcome::Superseded
                            )
                    );
                if !advances {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        format!(
                            "run {run_id:?} is already stopped with outcome {:?}",
                            current.terminal_outcome
                        ),
                    ));
                }
            }
            let now = now_iso();
            let delivery_pr_i64 = delivery_pr
                .map(i64::try_from)
                .transpose()
                .map_err(|_| refused(ErrorCode::InvalidRequest, "PR number is too large"))?;
            tx.execute(
                "UPDATE runs SET state = 'stopped', stop_reason = ?1, terminal_outcome = ?2, \
                 delivery_pr = ?3, delivery_sha = ?4, superseded_by = ?5, updated_at = ?6 \
                 WHERE run_id = ?7",
                rusqlite::params![
                    reason,
                    outcome.as_str(),
                    delivery_pr_i64,
                    delivery_sha,
                    superseded_by,
                    now,
                    run_id,
                ],
            )?;
            append_event_tx(
                &tx,
                Some(&run_id),
                "run.settled",
                &json!({
                    "schemaVersion": 1,
                    "runId": run_id,
                    "previousOutcome": current.terminal_outcome.map(RunOutcome::as_str),
                    "outcome": outcome.as_str(),
                    "reason": reason,
                    "delivery": {
                        "pr": delivery_pr,
                        "sha": delivery_sha,
                    },
                    "supersededBy": superseded_by,
                }),
            )?;
            if let Some(generation) = controller_generation {
                append_controller_revocation_tx(&tx, &run_id, generation, &reason)?;
            }
            crate::desired::stop_desired_work_tx(
                &tx,
                DesiredSubjectKind::Run,
                &run_id,
                DesiredReconcileOutcome::Terminal,
            )?;
            let row = get_run_tx(&tx, &run_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Atomically accept residual findings from a terminal non-approve review.
    ///
    /// Review-budget exhaustion, remediation failure, and non-approve done
    /// terminals are accepted-risk exits. Any blocked terminal also retains
    /// the standing `blocked -> superseded` exit through [`Ledger::settle_run`].
    /// The terminal evidence, singleton acceptance event, and durable
    /// `blocked -> accepted-risk` transition are one immediate transaction.
    /// Exact replay returns the standing row. A competing payload or terminal
    /// transition is refused, so the event stream can never disagree with the
    /// run's outcome or reason.
    pub fn accept_review_risk(
        &self,
        run_id: &str,
        review_rounds: u8,
        acceptance: AcceptedRisk,
    ) -> Result<RunRow, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            if review_rounds == 0 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "accepted risk requires at least one completed review round",
                ));
            }
            if acceptance.accepted_by.trim().is_empty() || acceptance.rationale.trim().is_empty() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "accepted risk requires non-empty acceptedBy and rationale evidence",
                ));
            }

            let payload = json!({
                "schemaVersion": 1,
                "reviewRounds": review_rounds,
                "acceptance": acceptance,
            });
            let payload_json = serde_json::to_string(&payload)?;
            let accepted_reason = format!(
                "review risk accepted by {}: {}",
                acceptance.accepted_by, acceptance.rationale
            );
            let current = get_run_tx(&tx, &run_id)?;

            let standing_payloads = {
                let mut statement = tx.prepare(
                    "SELECT payload_json FROM events WHERE run_id = ?1 AND kind = \
                     'forged.review.risk_accepted' ORDER BY event_id ASC LIMIT 2",
                )?;
                let rows = statement.query_map([&run_id], |row| row.get::<_, String>(0))?;
                rows.collect::<Result<Vec<_>, _>>()?
            };
            if standing_payloads.len() > 1 {
                return Err(crate::error::internal(format!(
                    "run {run_id:?} has multiple accepted-risk singleton events"
                )));
            }
            let standing_payload = standing_payloads.first();

            if current.terminal_outcome == Some(RunOutcome::AcceptedRisk) {
                if standing_payload == Some(&payload_json)
                    && current.stop_reason.as_deref() == Some(accepted_reason.as_str())
                    && current.delivery_pr.is_none()
                    && current.delivery_sha.is_none()
                    && current.superseded_by.is_none()
                {
                    tx.commit()?;
                    return Ok(current);
                }
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "run {run_id:?} already accepted risk with different evidence or reason"
                    ),
                ));
            }
            if current.state != RunState::Stopped
                || current.terminal_outcome != Some(RunOutcome::Blocked)
            {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "run {run_id:?} must be stopped with outcome blocked before accepting risk"
                    ),
                ));
            }
            if standing_payload.is_some_and(|stored| stored != &payload_json) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("run {run_id:?} already has different accepted-risk evidence"),
                ));
            }

            let terminal_payload: String = tx
                .query_row(
                    "SELECT payload_json FROM events WHERE run_id = ?1 AND kind = \
                     'run.protocol-terminal' ORDER BY event_id ASC LIMIT 1",
                    [&run_id],
                    |row| row.get(0),
                )
                .optional()?
                .ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        format!("run {run_id:?} has no persisted review-terminal evidence"),
                    )
                })?;
            let terminal: Value = serde_json::from_str(&terminal_payload)?;
            let terminal = review_risk_terminal(&terminal)
                .ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        format!(
                            "run {run_id:?} did not stop with an acceptable non-approve review terminal"
                        ),
                    )
                })?;
            if terminal.review_rounds != review_rounds {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "accepted-risk review rounds {review_rounds} do not match persisted terminal evidence {}",
                        terminal.review_rounds
                    ),
                ));
            }
            if current.stop_reason.as_deref() != Some(terminal.blocked_reason.as_str()) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "run {run_id:?} blocked reason does not match its review-terminal evidence"
                    ),
                ));
            }

            let now = now_iso();
            tx.execute(
                "UPDATE runs SET terminal_outcome = 'accepted-risk', stop_reason = ?1, \
                 delivery_pr = NULL, delivery_sha = NULL, superseded_by = NULL, updated_at = ?2 \
                 WHERE run_id = ?3 AND state = 'stopped' AND terminal_outcome = 'blocked'",
                rusqlite::params![accepted_reason, now, run_id],
            )?;
            if standing_payload.is_none() {
                append_event_tx(
                    &tx,
                    Some(&run_id),
                    "forged.review.risk_accepted",
                    &payload,
                )?;
            }
            append_event_tx(
                &tx,
                Some(&run_id),
                "run.settled",
                &json!({
                    "schemaVersion": 1,
                    "runId": run_id,
                    "previousOutcome": RunOutcome::Blocked.as_str(),
                    "outcome": RunOutcome::AcceptedRisk.as_str(),
                    "reason": accepted_reason,
                    "delivery": {
                        "pr": serde_json::Value::Null,
                        "sha": serde_json::Value::Null,
                    },
                    "supersededBy": serde_json::Value::Null,
                }),
            )?;
            let row = get_run_tx(&tx, &run_id)?;
            tx.commit()?;
            Ok(row)
        })
    }
}
