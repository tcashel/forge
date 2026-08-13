//! Run rows and the `run.state` transition rules.

use std::fmt::Write as _;

use forged_types::{
    canonical_json_bytes, ErrorCode, ExecutionPackageV1, ExecutionPolicyV1, ResolvedRosterV1,
    EXECUTION_PACKAGE_SCHEMA_V1,
};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde::Serialize;
use serde_json::json;
use sha2::{Digest, Sha256};

use crate::error::{refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{
    NewRun, NewRunDefinition, RosterRevisionBatch, RosterRevisionRow, RunDefinitionRow, RunRow,
    RunState,
};

fn run_row(row: &rusqlite::Row<'_>) -> Result<RunRow, rusqlite::Error> {
    Ok(RunRow {
        run_id: row.get(0)?,
        bead_id: row.get(1)?,
        repo: row.get(2)?,
        base_ref: row.get(3)?,
        branch: row.get(4)?,
        protocol: row.get(5)?,
        state: match row.get::<_, String>(6)?.as_str() {
            "stopped" => RunState::Stopped,
            _ => RunState::Active,
        },
        stop_reason: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
    })
}

const RUN_COLUMNS: &str = "run_id, bead_id, repo, base_ref, branch, protocol, state, \
                           stop_reason, created_at, updated_at";

const EFFECTIVE_DEFINITION_COLUMNS: &str = "d.run_id, d.protocol_ref_json, d.profile_ref_json, \
    d.roster_ref_json, COALESCE(m.package_sha256, d.package_sha256), d.profile_sha256, \
    d.roster_sha256, COALESCE(m.package_json, d.package_json), d.compatibility_roster_json, \
    d.created_at";
const EXECUTION_POLICY_MIGRATION: &str = "forged.run.execution-policy/1";

fn definition_row(row: &rusqlite::Row<'_>) -> Result<RunDefinitionRow, rusqlite::Error> {
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
        created_at: row.get(9)?,
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
            new_run.bead_id,
            new_run.repo,
            new_run.base_ref,
            new_run.branch,
            now
        ],
    )?;
    get_run_tx(tx, run_id)
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

            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let now = now_iso();
            let row = insert_run(&tx, &new_run, &now)?;
            tx.execute(
                "INSERT INTO run_definitions (run_id, protocol_ref_json, profile_ref_json, \
                 roster_ref_json, package_sha256, profile_sha256, roster_sha256, package_json, \
                 compatibility_roster_json, created_at) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
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
                    now,
                ],
            )?;
            tx.execute(
                "INSERT INTO roster_revisions (run_id, revision, roster_ref_json, roster_sha256, \
                 roster_json, reason, created_at) VALUES (?1, 1, ?2, ?3, ?4, 'run-created', ?5)",
                rusqlite::params![row.run_id, roster_ref_json, roster_sha256, roster_json, now],
            )?;
            // Keep the canonicalized profile alive as an explicit integrity
            // input above even though the full package stores it.
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

    /// Fetch one run, refusing with `RunNotFound` when absent.
    pub fn get_run(&self, run_id: &str) -> Result<RunRow, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| get_run_tx(conn, &run_id))
    }

    /// All runs, ordered by `created_at` then rowid ascending.
    pub fn list_runs(&self) -> Result<Vec<RunRow>, LedgerError> {
        self.submit(move |conn| {
            let sql = format!("SELECT {RUN_COLUMNS} FROM runs ORDER BY created_at, rowid");
            let mut stmt = conn.prepare(&sql)?;
            let rows = stmt.query_map([], run_row)?;
            let mut out = Vec::new();
            for row in rows {
                out.push(row?);
            }
            Ok(out)
        })
    }

    /// Transition a run between `active` and `stopped`.
    ///
    /// `Stopped` REQUIRES a reason (`None` refuses with `InvalidRequest`);
    /// `Active` forbids one and CLEARS `stop_reason` to NULL. Re-setting the
    /// current state is an idempotent `Ok(())` that writes nothing and
    /// appends no event. Stopping never cascades to live attempts — the
    /// revoking saga is the only path that moves an attempt out of
    /// `running`. Every effective change appends a `run.state` event in the
    /// same transaction.
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
                (RunState::Active, Some(_)) => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "reactivating a run takes no reason",
                    ));
                }
                _ => {}
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
                "UPDATE runs SET state = ?1, stop_reason = ?2, updated_at = ?3 \
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
}
