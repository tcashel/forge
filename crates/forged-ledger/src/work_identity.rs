//! Durable `WorkIdentityV1` storage and migration backfill.
//!
//! All construction is from caller input or ledger facts. This module has no
//! Beads, filesystem, or process boundary.

use std::collections::BTreeMap;

use forged_types::{
    normalize_repository_path, repository_label, work_display_title, ErrorCode, WorkIdentityBeadV1,
    WorkIdentityContextV1, WorkIdentityRepositoryV1, WorkIdentitySource, WorkIdentitySubjectKind,
    WorkIdentitySubjectV1, WorkIdentityV1, WORK_IDENTITY_SCHEMA_V1,
};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::Value;

use crate::error::{column_decode_error, refused, LedgerError};
use crate::events::append_event_tx;
use crate::ledger::Ledger;
use crate::types::NewRun;

pub(crate) const IDENTITY_COLUMNS: &str = "schema, subject_kind, subject_id, bead_id, bead_title, \
    bead_revision, repository_path, repository_label, project_id, project_title, \
    epic_id, epic_title, display_title, captured_at, source";

fn subject_kind(index: usize, raw: &str) -> rusqlite::Result<WorkIdentitySubjectKind> {
    match raw {
        "run" => Ok(WorkIdentitySubjectKind::Run),
        "epic" => Ok(WorkIdentitySubjectKind::Epic),
        other => Err(column_decode_error(
            index,
            "work identity subject kind",
            other,
        )),
    }
}

fn source(index: usize, raw: &str) -> rusqlite::Result<WorkIdentitySource> {
    match raw {
        "durable" => Ok(WorkIdentitySource::Durable),
        "legacy-fallback" => Ok(WorkIdentitySource::LegacyFallback),
        // `live-plan` is deliberately not a durable value even though it is
        // part of the shared in-memory contract.
        other => Err(column_decode_error(index, "work identity source", other)),
    }
}

fn malformed_row(index: usize, detail: impl Into<String>) -> rusqlite::Error {
    rusqlite::Error::FromSqlConversionFailure(
        index,
        rusqlite::types::Type::Text,
        detail.into().into(),
    )
}

fn optional_context(
    id: Option<String>,
    title: Option<String>,
    index: usize,
    name: &str,
) -> rusqlite::Result<Option<WorkIdentityContextV1>> {
    match (id, title) {
        (None, None) => Ok(None),
        (Some(id), title) => Ok(Some(WorkIdentityContextV1 { id, title })),
        (None, Some(_)) => Err(malformed_row(index, format!("{name} title without id"))),
    }
}

pub(crate) fn identity_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<WorkIdentityV1> {
    let schema: String = row.get(0)?;
    if schema != WORK_IDENTITY_SCHEMA_V1 {
        return Err(column_decode_error(0, "work identity schema", &schema));
    }
    let repository_path: Option<String> = row.get(6)?;
    let repository_label: Option<String> = row.get(7)?;
    let repository = match (repository_path, repository_label) {
        (None, None) => None,
        (Some(path), Some(label)) => Some(WorkIdentityRepositoryV1 { path, label }),
        _ => return Err(malformed_row(6, "incomplete work identity repository")),
    };
    let identity = WorkIdentityV1 {
        schema,
        subject: WorkIdentitySubjectV1 {
            kind: subject_kind(1, &row.get::<_, String>(1)?)?,
            id: row.get(2)?,
        },
        bead: WorkIdentityBeadV1 {
            id: row.get(3)?,
            title: row.get(4)?,
            revision: row.get(5)?,
        },
        repository,
        project: optional_context(row.get(8)?, row.get(9)?, 8, "project")?,
        epic: optional_context(row.get(10)?, row.get(11)?, 10, "epic")?,
        display_title: row.get(12)?,
        captured_at: row.get(13)?,
        source: source(14, &row.get::<_, String>(14)?)?,
    };
    identity
        .validate_for_storage()
        .map_err(|error| malformed_row(0, format!("invalid stored work identity: {error}")))?;
    Ok(identity)
}

pub(crate) fn get_work_identity_tx(
    conn: &Connection,
    kind: WorkIdentitySubjectKind,
    id: &str,
) -> Result<Option<WorkIdentityV1>, LedgerError> {
    let sql = format!(
        "SELECT {IDENTITY_COLUMNS} FROM work_identities \
         WHERE subject_kind = ?1 AND subject_id = ?2"
    );
    Ok(conn
        .query_row(&sql, rusqlite::params![kind.as_str(), id], identity_row)
        .optional()?)
}

pub(crate) fn list_work_identities_tx(
    conn: &Connection,
) -> Result<BTreeMap<(WorkIdentitySubjectKind, String), WorkIdentityV1>, LedgerError> {
    let sql =
        format!("SELECT {IDENTITY_COLUMNS} FROM work_identities ORDER BY subject_kind, subject_id");
    let mut statement = conn.prepare(&sql)?;
    let rows = statement.query_map([], identity_row)?;
    let mut identities = BTreeMap::new();
    for row in rows {
        let identity = row?;
        identities.insert(
            (identity.subject.kind, identity.subject.id.clone()),
            identity,
        );
    }
    Ok(identities)
}

/// Insert an immutable identity, treating an exact replay as a no-op.
pub(crate) fn insert_work_identity_tx(
    conn: &Connection,
    identity: &WorkIdentityV1,
) -> Result<bool, LedgerError> {
    identity.validate_for_storage().map_err(|error| {
        refused(
            ErrorCode::InvalidRequest,
            format!("invalid work identity: {error}"),
        )
    })?;
    let inserted = conn.execute(
        "INSERT OR IGNORE INTO work_identities (
           schema, subject_kind, subject_id, bead_id, bead_title, bead_revision,
           repository_path, repository_label, project_id, project_title,
           epic_id, epic_title, display_title, captured_at, source
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
        rusqlite::params![
            identity.schema,
            identity.subject.kind.as_str(),
            identity.subject.id,
            identity.bead.id,
            identity.bead.title,
            identity.bead.revision,
            identity
                .repository
                .as_ref()
                .map(|value| value.path.as_str()),
            identity
                .repository
                .as_ref()
                .map(|value| value.label.as_str()),
            identity.project.as_ref().map(|value| value.id.as_str()),
            identity
                .project
                .as_ref()
                .and_then(|value| value.title.as_deref()),
            identity.epic.as_ref().map(|value| value.id.as_str()),
            identity
                .epic
                .as_ref()
                .and_then(|value| value.title.as_deref()),
            identity.display_title,
            identity.captured_at,
            identity.source.as_str(),
        ],
    )?;
    if inserted == 1 {
        return Ok(true);
    }
    let standing = get_work_identity_tx(conn, identity.subject.kind, &identity.subject.id)?
        .ok_or_else(|| {
            crate::error::internal("work identity insert was ignored without a standing row")
        })?;
    if standing == *identity {
        Ok(false)
    } else {
        Err(refused(
            ErrorCode::InvalidRequest,
            format!(
                "work identity for {} {:?} conflicts with immutable stored identity",
                identity.subject.kind.as_str(),
                identity.subject.id
            ),
        ))
    }
}

/// A retried atomic creation may observe a different caller clock. Every
/// other field must remain byte-for-byte typed identity; the standing capture
/// time wins and is never rewritten.
pub(crate) fn identity_replay_matches(
    standing: &WorkIdentityV1,
    requested: &WorkIdentityV1,
) -> bool {
    let mut requested = requested.clone();
    requested.captured_at.clone_from(&standing.captured_at);
    *standing == requested
}

fn repository(path: &str) -> Option<WorkIdentityRepositoryV1> {
    let path = normalize_repository_path(path)?;
    let label = repository_label(&path)?;
    Some(WorkIdentityRepositoryV1 { path, label })
}

pub(crate) fn legacy_run_identity(new_run: &NewRun, captured_at: &str) -> WorkIdentityV1 {
    let repository = repository(&new_run.repo);
    let display_title = work_display_title(
        new_run.run_id.as_str(),
        None,
        repository.as_ref().map(|value| value.label.as_str()),
        None,
        None,
    );
    WorkIdentityV1 {
        schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
        subject: WorkIdentitySubjectV1 {
            kind: WorkIdentitySubjectKind::Run,
            id: new_run.run_id.as_str().to_owned(),
        },
        bead: WorkIdentityBeadV1 {
            id: new_run.bead_id.clone(),
            title: None,
            revision: None,
        },
        repository,
        project: None,
        epic: None,
        display_title,
        captured_at: captured_at.to_owned(),
        source: WorkIdentitySource::LegacyFallback,
    }
}

fn text(value: Option<&Value>) -> Option<String> {
    value
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

fn revision(value: Option<&Value>) -> Option<String> {
    match value? {
        Value::String(value) if !value.trim().is_empty() => Some(value.clone()),
        Value::Number(value) => Some(value.to_string()),
        _ => None,
    }
}

fn payload_context(payload: &Value, name: &str) -> Option<WorkIdentityContextV1> {
    let title_key = format!("{name}Title");
    let id_key = format!("{name}Id");
    let from = |object: &serde_json::Map<String, Value>| {
        if let Some(context) = object.get(name).and_then(Value::as_object) {
            let id = text(context.get("id"))?;
            return Some(WorkIdentityContextV1 {
                id,
                title: text(context.get("title")),
            });
        }
        let id = text(object.get(&id_key))?;
        Some(WorkIdentityContextV1 {
            id,
            title: text(object.get(&title_key)),
        })
    };
    let object = payload.as_object()?;
    from(object).or_else(|| {
        object
            .get("metadata")
            .and_then(Value::as_object)
            .and_then(from)
    })
}

#[derive(Clone)]
struct BackfillEvent {
    ts: String,
    payload: Option<Value>,
}

/// Populate migration 015 only from existing ledger rows/events. This runs
/// inside the migration transaction and therefore cannot observe or invoke
/// Beads even indirectly.
pub(crate) fn backfill_work_identities_tx(conn: &Connection) -> Result<(), LedgerError> {
    let mut epic_starts: BTreeMap<String, BackfillEvent> = BTreeMap::new();
    let mut child_epics: BTreeMap<String, String> = BTreeMap::new();
    {
        let mut statement = conn.prepare(
            "SELECT ts, run_id, kind, payload_json FROM events \
             WHERE kind IN ('forged.epic.started','forged.epic.child.started',\
                            'forged.epic.plan.started') \
             ORDER BY event_id",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, Option<String>>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        })?;
        for row in rows {
            let (ts, subject_id, kind, payload_json) = row?;
            let Some(subject_id) = subject_id.filter(|value| !value.trim().is_empty()) else {
                continue;
            };
            let payload = serde_json::from_str::<Value>(&payload_json).ok();
            if kind == "forged.epic.started" {
                epic_starts
                    .entry(subject_id)
                    .or_insert(BackfillEvent { ts, payload });
            } else if let Some(run_id) = payload.as_ref().and_then(|value| text(value.get("runId")))
            {
                child_epics.entry(run_id).or_insert(subject_id);
            }
        }
    }

    let mut epic_contexts = BTreeMap::new();
    let mut epic_projects = BTreeMap::new();
    for (epic_id, event) in &epic_starts {
        let valid = event.payload.as_ref().is_some_and(|payload| {
            payload
                .get("epicId")
                .and_then(Value::as_str)
                .is_none_or(|recorded| recorded == epic_id)
        });
        let payload = valid.then_some(event.payload.as_ref()).flatten();
        let bead_title = payload.and_then(|value| text(value.get("title")));
        let bead_revision = payload.and_then(|value| revision(value.get("specRevision")));
        let repository = payload
            .and_then(|value| text(value.get("repo")))
            .and_then(|path| repository(&path));
        let project = payload.and_then(|value| payload_context(value, "project"));
        let display_title = work_display_title(
            epic_id,
            bead_title.as_deref(),
            repository.as_ref().map(|value| value.label.as_str()),
            project.as_ref(),
            None,
        );
        let identity = WorkIdentityV1 {
            schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
            subject: WorkIdentitySubjectV1 {
                kind: WorkIdentitySubjectKind::Epic,
                id: epic_id.clone(),
            },
            bead: WorkIdentityBeadV1 {
                id: epic_id.clone(),
                title: bead_title.clone(),
                revision: bead_revision,
            },
            repository,
            project,
            epic: None,
            display_title,
            captured_at: event.ts.clone(),
            source: if valid {
                WorkIdentitySource::Durable
            } else {
                WorkIdentitySource::LegacyFallback
            },
        };
        insert_work_identity_tx(conn, &identity)?;
        if let Some(project) = identity.project.clone() {
            epic_projects.insert(epic_id.clone(), project);
        }
        epic_contexts.insert(
            epic_id.clone(),
            WorkIdentityContextV1 {
                id: epic_id.clone(),
                title: bead_title,
            },
        );
    }

    let mut run_specs: BTreeMap<String, BackfillEvent> = BTreeMap::new();
    {
        let mut statement = conn.prepare(
            "SELECT ts, run_id, payload_json FROM events \
             WHERE kind = 'forged.run.spec' AND run_id IS NOT NULL ORDER BY event_id",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })?;
        for row in rows {
            let (ts, run_id, payload_json) = row?;
            run_specs.entry(run_id).or_insert(BackfillEvent {
                ts,
                payload: serde_json::from_str(&payload_json).ok(),
            });
        }
    }

    let runs = {
        let mut statement = conn.prepare(
            "SELECT run_id, bead_id, repo, created_at FROM runs ORDER BY created_at, rowid",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        })?;
        rows.collect::<Result<Vec<_>, _>>()?
    };
    for (run_id, bead_id, repo, created_at) in runs {
        let spec = run_specs.get(&run_id);
        let valid_payload = spec.and_then(|event| {
            let payload = event.payload.as_ref()?;
            let run_matches = payload
                .get("runId")
                .and_then(Value::as_str)
                .is_none_or(|recorded| recorded == run_id);
            let bead_matches = payload
                .get("beadId")
                .and_then(Value::as_str)
                .is_none_or(|recorded| recorded == bead_id);
            (run_matches && bead_matches).then_some(payload)
        });
        let bead_title = valid_payload.and_then(|value| text(value.get("beadTitle")));
        let bead_revision = valid_payload.and_then(|value| {
            revision(value.get("beadRevision")).or_else(|| revision(value.get("specRevision")))
        });
        let project = valid_payload
            .and_then(|value| payload_context(value, "project"))
            .or_else(|| {
                child_epics
                    .get(&run_id)
                    .and_then(|id| epic_projects.get(id))
                    .cloned()
            });
        let event_epic = valid_payload.and_then(|value| payload_context(value, "epic"));
        let epic = child_epics
            .get(&run_id)
            .map(|id| {
                epic_contexts
                    .get(id)
                    .cloned()
                    .unwrap_or_else(|| WorkIdentityContextV1 {
                        id: id.clone(),
                        title: None,
                    })
            })
            .or(event_epic);
        let repository = repository(&repo);
        let display_title = work_display_title(
            &run_id,
            bead_title.as_deref(),
            repository.as_ref().map(|value| value.label.as_str()),
            project.as_ref(),
            epic.as_ref(),
        );
        let identity = WorkIdentityV1 {
            schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
            subject: WorkIdentitySubjectV1 {
                kind: WorkIdentitySubjectKind::Run,
                id: run_id.clone(),
            },
            bead: WorkIdentityBeadV1 {
                id: bead_id,
                title: bead_title,
                revision: bead_revision,
            },
            repository,
            project,
            epic: epic.clone(),
            display_title,
            captured_at: spec.map_or(created_at, |event| event.ts.clone()),
            source: if valid_payload.is_some() || epic.is_some() {
                WorkIdentitySource::Durable
            } else {
                WorkIdentitySource::LegacyFallback
            },
        };
        insert_work_identity_tx(conn, &identity)?;
    }
    Ok(())
}

impl Ledger {
    /// Persist one immutable durable identity. Exact retries are no-ops;
    /// conflicting retries refuse without changing the standing row.
    pub fn store_work_identity(&self, identity: WorkIdentityV1) -> Result<bool, LedgerError> {
        self.submit(move |conn| {
            identity.validate_for_storage().map_err(|error| {
                refused(
                    ErrorCode::InvalidRequest,
                    format!("invalid work identity: {error}"),
                )
            })?;
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let subject_exists: bool = match identity.subject.kind {
                WorkIdentitySubjectKind::Run => tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM runs WHERE run_id = ?1)",
                    [&identity.subject.id],
                    |row| row.get(0),
                )?,
                WorkIdentitySubjectKind::Epic => tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM events WHERE run_id = ?1 \
                     AND kind = 'forged.epic.started')",
                    [&identity.subject.id],
                    |row| row.get(0),
                )?,
            };
            if !subject_exists {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    format!(
                        "cannot store identity for absent {} {:?}",
                        identity.subject.kind.as_str(),
                        identity.subject.id
                    ),
                ));
            }
            let inserted = insert_work_identity_tx(&tx, &identity)?;
            tx.commit()?;
            Ok(inserted)
        })
    }

    pub fn get_work_identity(
        &self,
        kind: WorkIdentitySubjectKind,
        id: &str,
    ) -> Result<Option<WorkIdentityV1>, LedgerError> {
        let id = id.to_owned();
        self.submit(move |conn| get_work_identity_tx(conn, kind, &id))
    }

    pub fn list_work_identities(
        &self,
    ) -> Result<BTreeMap<(WorkIdentitySubjectKind, String), WorkIdentityV1>, LedgerError> {
        self.submit(|conn| list_work_identities_tx(conn))
    }

    /// Append the canonical epic-start event and its frozen display identity
    /// in one transaction. An exact retry returns `false`; a partial or
    /// conflicting standing bundle fails closed.
    pub fn append_epic_started_with_identity(
        &self,
        epic_id: &str,
        event: Value,
        identity: WorkIdentityV1,
    ) -> Result<bool, LedgerError> {
        let epic_id = epic_id.to_owned();
        self.submit(move |conn| {
            identity.validate_for_storage().map_err(|error| {
                refused(
                    ErrorCode::InvalidRequest,
                    format!("invalid epic work identity: {error}"),
                )
            })?;
            if identity.source != WorkIdentitySource::Durable
                || identity.subject.kind != WorkIdentitySubjectKind::Epic
                || identity.subject.id != epic_id
                || identity.bead.id != epic_id
            {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "epic start requires a durable matching epic identity",
                ));
            }
            let event_epic = text(event.get("epicId"));
            if event_epic.as_deref() != Some(epic_id.as_str()) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "epic start event epicId does not match its identity",
                ));
            }
            if text(event.get("title")) != identity.bead.title {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "epic start event title does not match its identity",
                ));
            }
            if revision(event.get("specRevision")) != identity.bead.revision {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "epic start event revision does not match its identity",
                ));
            }
            let event_repository =
                text(event.get("repo")).and_then(|path| normalize_repository_path(&path));
            let identity_repository = identity.repository.as_ref().map(|value| value.path.clone());
            if event_repository != identity_repository {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "epic start event repository does not match its identity",
                ));
            }

            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let standing_events = {
                let mut statement = tx.prepare(
                    "SELECT payload_json FROM events WHERE run_id = ?1 \
                     AND kind = 'forged.epic.started' ORDER BY event_id",
                )?;
                let rows = statement.query_map([&epic_id], |row| row.get::<_, String>(0))?;
                rows.collect::<Result<Vec<_>, _>>()?
            };
            let standing_identity =
                get_work_identity_tx(&tx, WorkIdentitySubjectKind::Epic, &epic_id)?;
            match (standing_events.as_slice(), standing_identity) {
                ([], None) => {
                    append_event_tx(&tx, Some(&epic_id), "forged.epic.started", &event)?;
                    insert_work_identity_tx(&tx, &identity)?;
                    tx.commit()?;
                    Ok(true)
                }
                ([payload], Some(standing)) => {
                    let stored: Value = serde_json::from_str(payload)?;
                    if stored != event || !identity_replay_matches(&standing, &identity) {
                        return Err(refused(
                            ErrorCode::InvalidRequest,
                            format!("epic {epic_id:?} start replay conflicts with durable bundle"),
                        ));
                    }
                    tx.commit()?;
                    Ok(false)
                }
                _ => Err(refused(
                    ErrorCode::InvalidRequest,
                    format!("epic {epic_id:?} has a partial or ambiguous start bundle"),
                )),
            }
        })
    }
}
