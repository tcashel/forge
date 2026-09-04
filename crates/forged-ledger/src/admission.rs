//! Admission snapshots, decisions, and durable capacity ownership.
//!
//! Snapshot reads are isolated in one SQLite transaction. The subsequent
//! `BEGIN IMMEDIATE` writer re-reads the revision of every scheduling fact
//! before recording decisions and reservations, so an interleaving process
//! can only make the complete batch stale; it can never oversubscribe it.

use std::collections::{BTreeMap, BTreeSet};
use std::fmt::Write as _;

use forged_types::{
    canonical_json_bytes, AdmissionCapacityV1, AdmissionDecisionV1, AdmissionOutcome,
    AdmissionRateLimitV1, AdmissionResourceClass, AdmissionSpendV1, AdmissionSubjectKind,
    ErrorCode, ExecutionPackageV1, ResolvedRosterV1, Sandbox, ADMISSION_DECISION_SCHEMA_V1,
    ADMISSION_INPUTS_SCHEMA_V1,
};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::error::{column_decode_error, internal, refused, LedgerError};
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{
    AdmissionBatchWrite, AdmissionDurableCandidate, AdmissionLedgerSnapshot, AdmissionPacketFacts,
    AdmissionReservationRow, AdmissionReservationState, DesiredState, DesiredSubjectKind,
};

pub(crate) const RESERVATION_COLUMNS: &str =
    "reservation_id, decision_id, work_key, subject_kind, \
    subject_id, control_revision, repository, provider, model, resource_class, state, \
    owner_kind, owner_id, recovery_deadline, last_error, created_at, updated_at, released_at";
const RESERVATION_COLUMNS_R: &str = "r.reservation_id, r.decision_id, r.work_key, r.subject_kind, \
    r.subject_id, r.control_revision, r.repository, r.provider, r.model, r.resource_class, r.state, \
    r.owner_kind, r.owner_id, r.recovery_deadline, r.last_error, r.created_at, r.updated_at, \
    r.released_at";

/// Invalidate pre-effect capacity ownership when the desired control epoch
/// changes. Attempt-owned packet capacity remains until the attempt's atomic
/// terminal transition proves the provider effect stopped.
pub(crate) fn release_subject_reservations_tx(
    conn: &Connection,
    kind: DesiredSubjectKind,
    id: &str,
    detail: &str,
) -> Result<(), LedgerError> {
    let now = now_iso();
    conn.execute(
        "UPDATE admission_reservations SET state = 'released', last_error = ?1, \
         updated_at = ?2, released_at = COALESCE(released_at, ?2) \
         WHERE state != 'released' AND ( \
           (subject_kind = ?3 AND subject_id = ?4) OR \
           (?3 = 'run' AND subject_kind = 'packet' AND owner_kind IS NULL AND subject_id IN \
             (SELECT packet_id FROM packets WHERE run_id = ?4)) OR \
           (?3 = 'epic' AND subject_kind = 'packet' AND owner_kind IS NULL AND subject_id IN ( \
             SELECT p.packet_id FROM packets p JOIN events e \
               ON e.kind IN ('forged.epic.child.started','forged.epic.plan.started', \
                             'forged.epic.assurance.started') \
              AND json_extract(e.payload_json, '$.runId') = p.run_id \
             WHERE e.run_id = ?4)) \
         )",
        rusqlite::params![detail, now, kind.as_str(), id],
    )?;
    Ok(())
}

fn hex(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        let _ = write!(out, "{byte:02x}");
    }
    out
}

fn canonical_sha(value: &Value) -> Result<String, LedgerError> {
    let bytes = canonical_json_bytes(value)
        .map_err(|error| internal(format!("canonicalizing admission evidence: {error}")))?;
    Ok(hex(&Sha256::digest(bytes)))
}

fn subject_kind(index: usize, raw: &str) -> rusqlite::Result<AdmissionSubjectKind> {
    match raw {
        "run" => Ok(AdmissionSubjectKind::Run),
        "epic" => Ok(AdmissionSubjectKind::Epic),
        "packet" => Ok(AdmissionSubjectKind::Packet),
        other => Err(column_decode_error(index, "admission subject kind", other)),
    }
}

fn resource_class(index: usize, raw: &str) -> rusqlite::Result<AdmissionResourceClass> {
    match raw {
        "read" => Ok(AdmissionResourceClass::Read),
        "repository-write" => Ok(AdmissionResourceClass::RepositoryWrite),
        "gate" => Ok(AdmissionResourceClass::Gate),
        other => Err(column_decode_error(
            index,
            "admission resource class",
            other,
        )),
    }
}

pub(crate) fn reservation_row(
    row: &rusqlite::Row<'_>,
) -> rusqlite::Result<AdmissionReservationRow> {
    let state_raw: String = row.get(10)?;
    let owner_kind: Option<String> = row.get(11)?;
    let owner_id: Option<String> = row.get(12)?;
    if owner_kind
        .as_deref()
        .is_some_and(|value| !matches!(value, "controller" | "attempt"))
    {
        return Err(column_decode_error(
            11,
            "admission reservation owner kind",
            owner_kind.as_deref().unwrap_or_default(),
        ));
    }
    if owner_kind.is_some() != owner_id.is_some() {
        return Err(column_decode_error(
            11,
            "admission reservation owner pair",
            &format!("{owner_kind:?}/{owner_id:?}"),
        ));
    }
    Ok(AdmissionReservationRow {
        reservation_id: row.get(0)?,
        decision_id: row.get(1)?,
        work_key: row.get(2)?,
        subject_kind: subject_kind(3, &row.get::<_, String>(3)?)?,
        subject_id: row.get(4)?,
        control_revision: u64::try_from(row.get::<_, i64>(5)?).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                5,
                rusqlite::types::Type::Integer,
                Box::new(error),
            )
        })?,
        repository: row.get(6)?,
        provider: row.get(7)?,
        model: row.get(8)?,
        resource_class: resource_class(9, &row.get::<_, String>(9)?)?,
        state: AdmissionReservationState::try_from(state_raw.as_str())
            .map_err(|_| column_decode_error(10, "admission reservation state", &state_raw))?,
        owner_kind,
        owner_id,
        recovery_deadline: row.get(13)?,
        last_error: row.get(14)?,
        created_at: row.get(15)?,
        updated_at: row.get(16)?,
        released_at: row.get(17)?,
    })
}

pub(crate) fn live_reservations(
    conn: &Connection,
) -> Result<Vec<AdmissionReservationRow>, LedgerError> {
    let sql = format!(
        "SELECT {RESERVATION_COLUMNS} FROM admission_reservations \
         WHERE state != 'released' ORDER BY reservation_id"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement
        .query_map([], reservation_row)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LedgerError::from)?;
    Ok(rows)
}

pub(crate) fn latest_admission_decisions_tx(
    conn: &Connection,
) -> Result<Vec<AdmissionDecisionV1>, LedgerError> {
    let mut stmt = conn.prepare(
        "SELECT d.decision_json FROM admission_decisions d \
         WHERE d.rowid = (SELECT d2.rowid FROM admission_decisions d2 \
           WHERE d2.subject_kind = d.subject_kind AND d2.subject_id = d.subject_id \
           ORDER BY d2.rowid DESC LIMIT 1) \
         ORDER BY d.subject_kind, d.subject_id, d.decision_id",
    )?;
    let rows = stmt.query_map([], |row| row.get::<_, String>(0))?;
    let mut out = Vec::new();
    for raw in rows {
        out.push(decode_admission_decision(&raw?)?);
    }
    Ok(out)
}

pub(crate) fn decode_admission_decision(raw: &str) -> Result<AdmissionDecisionV1, LedgerError> {
    let decision: AdmissionDecisionV1 = serde_json::from_str(raw)?;
    if decision.schema != ADMISSION_DECISION_SCHEMA_V1 {
        return Err(internal(format!(
            "unsupported stored admission decision schema {:?}",
            decision.schema
        )));
    }
    Ok(decision)
}

/// Resolve the desired-work epoch that authorizes a packet. Ordinary runs
/// own their own epoch; an epic child is delegated to the parent epic's
/// epoch recorded by the durable child, rolling-plan, or assurance event.
/// Direct run authority always wins if both exist.
pub(crate) fn packet_authorization_subject_tx(
    conn: &Connection,
    packet_id: &str,
) -> Result<Option<(DesiredSubjectKind, String)>, LedgerError> {
    let run_id = conn
        .query_row(
            "SELECT run_id FROM packets WHERE packet_id = ?1",
            [packet_id],
            |row| row.get::<_, String>(0),
        )
        .optional()?;
    let Some(run_id) = run_id else {
        return Ok(None);
    };
    let direct: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM desired_work \
         WHERE subject_kind = 'run' AND subject_id = ?1)",
        [&run_id],
        |row| row.get(0),
    )?;
    if direct {
        return Ok(Some((DesiredSubjectKind::Run, run_id)));
    }
    let epic = conn
        .query_row(
            "SELECT e.run_id FROM events e \
             WHERE e.kind IN ('forged.epic.child.started','forged.epic.plan.started', \
                              'forged.epic.assurance.started') \
               AND json_extract(e.payload_json, '$.runId') = ?1 \
             ORDER BY e.event_id DESC LIMIT 1",
            [&run_id],
            |row| row.get::<_, String>(0),
        )
        .optional()?;
    Ok(epic.map(|id| (DesiredSubjectKind::Epic, id)))
}

/// Active attempt facts plus non-released reservations. A reservation already
/// transferred to a live attempt is deliberately excluded from the second
/// half so one unit of work consumes exactly one slot.
fn capacity(
    conn: &Connection,
    packet_facts: &mut PacketFactsCache,
) -> Result<AdmissionCapacityV1, LedgerError> {
    let mut result = AdmissionCapacityV1::default();
    let mut live_attempt_ids = BTreeSet::new();
    let mut statement = conn.prepare(
        "SELECT a.attempt_id, a.packet_id, r.repo, ar.provider, ar.model, \
                ar.resource_class, ar.repository FROM attempts a \
         JOIN packets p ON p.packet_id = a.packet_id \
         JOIN runs r ON r.run_id = p.run_id \
         LEFT JOIN admission_reservations ar \
           ON ar.owner_kind = 'attempt' AND ar.owner_id = CAST(a.attempt_id AS TEXT) \
          AND ar.state != 'released' \
         WHERE a.state IN ('running','revoking') ORDER BY a.attempt_id",
    )?;
    let rows = statement.query_map([], |row| {
        Ok((
            row.get::<_, i64>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, Option<String>>(3)?,
            row.get::<_, Option<String>>(4)?,
            row.get::<_, Option<String>>(5)?,
            row.get::<_, Option<String>>(6)?,
        ))
    })?;
    for row in rows {
        let (attempt_id, packet_id, run_repository, provider, model, class, reservation_repository) =
            row?;
        live_attempt_ids.insert(attempt_id.to_string());
        let (provider, model, class, repository) = match (provider, model, class) {
            (Some(provider), Some(model), Some(class)) => (
                provider,
                model,
                resource_class(5, &class)?,
                reservation_repository.unwrap_or(run_repository),
            ),
            _ => {
                let facts = packet_facts.get(conn, &packet_id)?;
                (
                    facts.provider,
                    facts.model,
                    facts.resource_class,
                    facts.repository,
                )
            }
        };
        result.total_active = result.total_active.saturating_add(1);
        let model_key = format!("{provider}/{model}");
        *result.provider_active.entry(provider).or_default() += 1;
        *result.model_active.entry(model_key).or_default() += 1;
        if class == AdmissionResourceClass::RepositoryWrite {
            *result
                .repository_write_active
                .entry(repository)
                .or_default() += 1;
        }
    }
    for reservation in live_reservations(conn)? {
        let transferred_to_live_attempt = reservation.owner_kind.as_deref() == Some("attempt")
            && reservation
                .owner_id
                .as_ref()
                .is_some_and(|id| live_attempt_ids.contains(id));
        if transferred_to_live_attempt {
            continue;
        }
        result.total_active = result.total_active.saturating_add(1);
        let model_key = format!("{}/{}", reservation.provider, reservation.model);
        *result
            .provider_active
            .entry(reservation.provider)
            .or_default() += 1;
        *result.model_active.entry(model_key).or_default() += 1;
        if reservation.resource_class == AdmissionResourceClass::RepositoryWrite {
            *result
                .repository_write_active
                .entry(reservation.repository)
                .or_default() += 1;
        }
    }
    Ok(result)
}

fn spend(conn: &Connection) -> Result<Vec<AdmissionSpendV1>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT provider, model, COALESCE(SUM(input_tokens), 0), \
           COALESCE(SUM(output_tokens), 0), COALESCE(SUM(cost_usd), 0.0), \
           SUM(CASE WHEN cost_usd IS NULL THEN 1 ELSE 0 END) \
         FROM usage GROUP BY provider, model ORDER BY provider, model",
    )?;
    let rows = statement.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
            row.get::<_, i64>(3)?,
            row.get::<_, f64>(4)?,
            row.get::<_, i64>(5)?,
        ))
    })?;
    let mut result = Vec::new();
    for row in rows {
        let (provider, model, input, output, cost, missing) = row?;
        if input < 0 || output < 0 || cost < 0.0 || !cost.is_finite() || missing < 0 {
            return Err(internal("invalid negative or non-finite admission spend"));
        }
        let micros = (cost * 1_000_000.0).round();
        if micros > u64::MAX as f64 {
            return Err(internal("admission spend exceeds u64"));
        }
        result.push(AdmissionSpendV1 {
            provider,
            model,
            input_tokens: input as u64,
            output_tokens: output as u64,
            known_cost_microusd: micros as u64,
            rows_missing_cost: u32::try_from(missing)
                .map_err(|_| internal("missing-cost row count exceeds u32"))?,
        });
    }
    Ok(result)
}

fn latest_rate_limits(conn: &Connection) -> Result<Vec<AdmissionRateLimitV1>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT u.provider, u.model, u.usage_id, u.rate_limit_used_percent, u.ts \
         FROM usage u JOIN (SELECT provider, model, MAX(usage_id) AS usage_id \
                            FROM usage GROUP BY provider, model) latest \
           ON latest.provider = u.provider AND latest.model = u.model \
          AND latest.usage_id = u.usage_id \
         ORDER BY u.provider, u.model",
    )?;
    let rows = statement.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
            row.get::<_, Option<f64>>(3)?,
            row.get::<_, String>(4)?,
        ))
    })?;
    let mut result = Vec::new();
    for row in rows {
        let (provider, model, usage_id, used, observed_at) = row?;
        let used_millipercent = used
            .map(|value| {
                if !(0.0..=100.0).contains(&value) || !value.is_finite() {
                    return Err(internal("invalid rate-limit percentage"));
                }
                Ok((value * 1_000.0).round() as u32)
            })
            .transpose()?;
        result.push(AdmissionRateLimitV1 {
            provider,
            model,
            usage_id,
            used_millipercent,
            observed_at,
        });
    }
    Ok(result)
}

fn sandbox_resource_class(sandbox: Sandbox) -> AdmissionResourceClass {
    match sandbox {
        Sandbox::ReadOnly => AdmissionResourceClass::Read,
        Sandbox::WorkspaceWrite => AdmissionResourceClass::RepositoryWrite,
    }
}

/// Resolve the exact provider resources the driver will use for a packet.
/// This deliberately mirrors `stored_packet_for_attempt`, but lives in the
/// ledger so admission and the later claim can share one transactional truth.
pub(crate) fn packet_effective_facts_tx(
    conn: &Connection,
    packet_id: &str,
) -> Result<AdmissionPacketFacts, LedgerError> {
    let (run_id, work_id, repository, body_json, package_json) = conn
        .query_row(
            "SELECT p.run_id, r.bead_id, r.repo, p.body_json, \
                    COALESCE(m.package_json, d.package_json) \
             FROM packets p JOIN runs r ON r.run_id = p.run_id \
             LEFT JOIN run_definitions d ON d.run_id = p.run_id \
             LEFT JOIN run_package_migrations m ON m.run_id = p.run_id \
             WHERE p.packet_id = ?1",
            [packet_id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, Option<String>>(4)?,
                ))
            },
        )
        .optional()?
        .ok_or_else(|| {
            refused(
                ErrorCode::PacketNotClaimable,
                format!("packet {packet_id:?} does not exist"),
            )
        })?;
    let body: Value = serde_json::from_str(&body_json)?;
    let stored_hints =
        || -> Result<(String, String, Option<String>, AdmissionResourceClass), LedgerError> {
            let hints = body
                .get("providerHints")
                .and_then(Value::as_object)
                .ok_or_else(|| internal("stored packet has no providerHints"))?;
            let provider = hints
                .get("provider")
                .and_then(Value::as_str)
                .filter(|value| !value.is_empty())
                .ok_or_else(|| internal("stored packet has no providerHints.provider"))?;
            let model = hints
                .get("model")
                .and_then(Value::as_str)
                .filter(|value| !value.is_empty())
                .ok_or_else(|| internal("stored packet has no providerHints.model"))?;
            let effort = hints
                .get("effort")
                .and_then(Value::as_str)
                .map(str::to_owned);
            let resource = match hints.get("sandbox").and_then(Value::as_str) {
                Some("readOnly") => AdmissionResourceClass::Read,
                Some("workspaceWrite") => AdmissionResourceClass::RepositoryWrite,
                _ => return Err(internal("stored packet has invalid providerHints.sandbox")),
            };
            Ok((provider.to_owned(), model.to_owned(), effort, resource))
        };
    let selected = match (
        package_json,
        body.get("execution")
            .and_then(Value::as_object)
            .and_then(|execution| execution.get("roleId"))
            .and_then(Value::as_str),
    ) {
        (Some(package_json), Some(role_id)) => {
            let mut package: ExecutionPackageV1 =
                serde_json::from_str(&package_json).map_err(|error| {
                    internal(format!("stored execution package does not parse: {error}"))
                })?;
            let latest = conn
                .query_row(
                    "SELECT roster_json, created_at FROM roster_revisions \
                     WHERE run_id = ?1 ORDER BY revision DESC LIMIT 1",
                    [&run_id],
                    |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)),
                )
                .optional()?;
            let revision_started_at = if let Some((roster_json, created_at)) = latest {
                package.roster =
                    serde_json::from_str::<ResolvedRosterV1>(&roster_json).map_err(|error| {
                        internal(format!("stored roster revision does not parse: {error}"))
                    })?;
                Some(created_at)
            } else {
                None
            };
            let mut statement = conn.prepare(
                "SELECT fail_note, started_at FROM attempts \
                 WHERE packet_id = ?1 AND state = 'failed' ORDER BY attempt_id",
            )?;
            let failures = statement
                .query_map([packet_id], |row| {
                    Ok((row.get::<_, Option<String>>(0)?, row.get::<_, String>(1)?))
                })?
                .collect::<Result<Vec<_>, _>>()?
                .into_iter()
                .filter(|(note, started_at)| {
                    revision_started_at
                        .as_deref()
                        .is_none_or(|boundary| started_at.as_str() >= boundary)
                        && note
                            .as_deref()
                            .is_some_and(|note| note.starts_with("transport:"))
                })
                .count();
            let candidates =
                package.roster.roles.iter().find_map(|(role, candidates)| {
                    (role.as_str() == role_id).then_some(candidates)
                });
            let candidates = candidates.ok_or_else(|| {
                internal(format!("active roster revision has no role {role_id:?}"))
            })?;
            let index = failures.min(candidates.len().saturating_sub(1));
            let candidate = candidates.get(index).ok_or_else(|| {
                internal(format!("active roster role {role_id:?} has no candidates"))
            })?;
            (
                candidate.provider.clone(),
                candidate.model.clone(),
                candidate.effort.clone(),
                sandbox_resource_class(candidate.sandbox),
            )
        }
        _ => stored_hints()?,
    };
    Ok(AdmissionPacketFacts {
        packet_id: packet_id.to_owned(),
        run_id,
        work_id,
        repository,
        provider: selected.0,
        model: selected.1,
        effort: selected.2,
        resource_class: selected.3,
    })
}

#[derive(Default)]
struct PacketFactsCache {
    facts: BTreeMap<String, AdmissionPacketFacts>,
    #[cfg(test)]
    resolutions: usize,
}

impl PacketFactsCache {
    fn get(
        &mut self,
        conn: &Connection,
        packet_id: &str,
    ) -> Result<AdmissionPacketFacts, LedgerError> {
        if let Some(facts) = self.facts.get(packet_id) {
            return Ok(facts.clone());
        }
        let facts = packet_effective_facts_tx(conn, packet_id)?;
        #[cfg(test)]
        {
            self.resolutions += 1;
        }
        self.facts.insert(packet_id.to_owned(), facts.clone());
        Ok(facts)
    }
}

fn requested_packet_facts(
    conn: &Connection,
    targets: &[(AdmissionSubjectKind, String)],
    packet_facts: &mut PacketFactsCache,
) -> Result<Vec<AdmissionPacketFacts>, LedgerError> {
    let packet_ids = targets
        .iter()
        .filter_map(|(kind, id)| (*kind == AdmissionSubjectKind::Packet).then_some(id))
        .collect::<BTreeSet<_>>();
    packet_ids
        .into_iter()
        .map(|packet_id| packet_facts.get(conn, packet_id))
        .collect()
}

fn durable_candidates(
    conn: &Connection,
    extra: Option<(DesiredSubjectKind, &str)>,
) -> Result<Vec<AdmissionDurableCandidate>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT subject_kind, subject_id, desired_state, control_revision, next_wake_at, \
                created_at, exhausted_at IS NOT NULL \
         FROM desired_work ORDER BY subject_kind, subject_id",
    )?;
    let desired = statement
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)?,
                row.get::<_, Option<String>>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, bool>(6)?,
            ))
        })?
        .collect::<Result<Vec<_>, _>>()?;
    let mut keys = desired
        .iter()
        .map(|(kind, id, ..)| (kind.clone(), id.clone()))
        .collect::<BTreeSet<_>>();
    let mut rows = desired;
    let mut delegated: Option<(String, String, String)> = None;
    if let Some((kind, id)) = extra {
        let key = (kind.as_str().to_owned(), id.to_owned());
        if keys.insert(key.clone()) {
            let parent = (kind == DesiredSubjectKind::Run)
                .then(|| {
                    conn.query_row(
                        "SELECT e.run_id FROM events e JOIN desired_work dw \
                         ON dw.subject_kind = 'epic' AND dw.subject_id = e.run_id \
                         WHERE e.kind IN ('forged.epic.child.started','forged.epic.plan.started', \
                                          'forged.epic.assurance.started') \
                           AND json_extract(e.payload_json, '$.runId') = ?1 \
                         ORDER BY e.event_id DESC LIMIT 1",
                        [id],
                        |row| row.get::<_, String>(0),
                    )
                    .optional()
                })
                .transpose()?
                .flatten();
            if let Some(parent) = parent {
                let repository =
                    conn.query_row("SELECT repo FROM runs WHERE run_id = ?1", [id], |row| {
                        row.get::<_, String>(0)
                    })?;
                // A just-created epic child or internal planning/assurance run has no
                // direct desired row. Project it as a RUN decision, but
                // borrow the parent epic's exact control epoch for this
                // admission cycle. This preserves run-addressed capacity
                // while making parent pause/stop the authorization fence.
                let authority = rows
                    .iter()
                    .find(|(row_kind, row_id, ..)| row_kind == "epic" && row_id == &parent)
                    .cloned()
                    .ok_or_else(|| internal("delegating epic desired row vanished"))?;
                rows.push((
                    key.0,
                    key.1,
                    authority.2,
                    authority.3,
                    authority.4,
                    authority.5,
                    authority.6,
                ));
                delegated = Some((parent, id.to_owned(), repository));
            } else {
                rows.push((
                    key.0,
                    key.1,
                    "running".to_owned(),
                    0,
                    Some(now_iso()),
                    now_iso(),
                    false,
                ));
            }
        }
    }
    rows.sort_by(|left, right| (&left.0, &left.1).cmp(&(&right.0, &right.1)));

    let mut out = Vec::new();
    for (kind_raw, id, state_raw, revision, wake, authorized_at, exhausted) in rows {
        let kind = DesiredSubjectKind::try_from(kind_raw.as_str())?;
        let state = DesiredState::try_from(state_raw.as_str())?;
        let (repository, work_id, packet_id, packet_body_json, package_json) = match kind {
            DesiredSubjectKind::Run => conn
                .query_row(
                    "SELECT r.repo, r.bead_id, p.packet_id, p.body_json, \
                            COALESCE(rpm.package_json, rd.package_json) \
                     FROM runs r LEFT JOIN run_definitions rd ON rd.run_id = r.run_id \
                     LEFT JOIN run_package_migrations rpm ON rpm.run_id = r.run_id \
                     LEFT JOIN packets p ON p.packet_id = (SELECT p2.packet_id FROM packets p2 \
                       WHERE p2.run_id = r.run_id AND NOT EXISTS (SELECT 1 FROM attempts a2 \
                         WHERE a2.packet_id = p2.packet_id AND a2.state = 'completed') \
                       ORDER BY p2.created_at, p2.packet_id LIMIT 1) \
                     WHERE r.run_id = ?1",
                    [&id],
                    |row| {
                        Ok((
                            Some(row.get::<_, String>(0)?),
                            Some(row.get::<_, String>(1)?),
                            row.get::<_, Option<String>>(2)?,
                            row.get::<_, Option<String>>(3)?,
                            row.get::<_, Option<String>>(4)?,
                        ))
                    },
                )
                .optional()?
                .unwrap_or((None, None, None, None, None)),
            DesiredSubjectKind::Epic => (None, Some(id.clone()), None, None, None),
        };
        let epic_started_json = (kind == DesiredSubjectKind::Epic)
            .then(|| {
                conn.query_row(
                    "SELECT payload_json FROM events WHERE run_id = ?1 \
                     AND kind = 'forged.epic.started' ORDER BY event_id LIMIT 1",
                    [&id],
                    |row| row.get(0),
                )
                .optional()
            })
            .transpose()?
            .flatten();
        let epic_package_json = (kind == DesiredSubjectKind::Epic)
            .then(|| {
                conn.query_row(
                    "SELECT payload_json FROM events WHERE run_id = ?1 \
                     AND kind = 'forged.epic.execution-package-migrated' \
                     ORDER BY event_id DESC LIMIT 1",
                    [&id],
                    |row| row.get(0),
                )
                .optional()
            })
            .transpose()?
            .flatten();
        let (delegated_run_id, delegated_repository) = delegated
            .as_ref()
            .filter(|(parent, _, _)| parent == &id)
            .map(|(_, run, repository)| (Some(run.clone()), Some(repository.clone())))
            .unwrap_or((None, None));
        out.push(AdmissionDurableCandidate {
            subject_kind: kind,
            subject_id: id,
            desired_state: state,
            control_revision: u64::try_from(revision)
                .map_err(|_| internal("negative desired control revision"))?,
            next_wake_at: wake,
            authorized_at,
            exhausted,
            repository,
            work_id,
            packet_id,
            packet_body_json,
            package_json,
            epic_started_json,
            epic_package_json,
            delegated_run_id,
            delegated_repository,
        });
    }
    Ok(out)
}

/// Revision over every durable fact that can change eligibility or capacity.
fn ledger_revision(conn: &Connection) -> Result<String, LedgerError> {
    let revision: i64 = conn.query_row(
        "SELECT revision FROM admission_revision WHERE singleton = 1",
        [],
        |row| row.get(0),
    )?;
    Ok(revision.to_string())
}

fn reservation_decisions(
    conn: &Connection,
    reservations: &[AdmissionReservationRow],
) -> Result<Vec<AdmissionDecisionV1>, LedgerError> {
    if reservations.is_empty() {
        return Ok(Vec::new());
    }
    let decision_ids = reservations
        .iter()
        .map(|reservation| reservation.decision_id.as_str())
        .collect::<Vec<_>>();
    let decision_ids_json = serde_json::to_string(&decision_ids)?;
    let mut statement = conn.prepare(
        "SELECT decision_id, decision_json FROM admission_decisions \
         WHERE decision_id IN (SELECT value FROM json_each(?1))",
    )?;
    let rows = statement.query_map([decision_ids_json], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;
    let mut by_id = BTreeMap::new();
    for row in rows {
        let (decision_id, raw) = row?;
        by_id.insert(decision_id, decode_admission_decision(&raw)?);
    }
    reservations
        .iter()
        .map(|reservation| {
            by_id.remove(&reservation.decision_id).ok_or_else(|| {
                internal(format!(
                    "admission reservation {:?} has no persisted decision",
                    reservation.reservation_id
                ))
            })
        })
        .collect()
}

fn snapshot_tx(
    conn: &Connection,
    extra: Option<(DesiredSubjectKind, &str)>,
    targets: &[(AdmissionSubjectKind, String)],
) -> Result<AdmissionLedgerSnapshot, LedgerError> {
    let reservations = live_reservations(conn)?;
    let reservation_decisions = reservation_decisions(conn, &reservations)?;
    let mut packet_fact_cache = PacketFactsCache::default();
    Ok(AdmissionLedgerSnapshot {
        as_of: now_iso(),
        ledger_revision: ledger_revision(conn)?,
        candidates: durable_candidates(conn, extra)?,
        packet_facts: requested_packet_facts(conn, targets, &mut packet_fact_cache)?,
        capacity: capacity(conn, &mut packet_fact_cache)?,
        spend: spend(conn)?,
        latest_rate_limits: latest_rate_limits(conn)?,
        reservations,
        reservation_decisions,
    })
}

fn release_unowned_targets_tx(
    conn: &Connection,
    targets: &[(AdmissionSubjectKind, String)],
) -> Result<(), LedgerError> {
    if targets.is_empty() {
        return Ok(());
    }
    let now = now_iso();
    for (kind, id) in targets {
        let kind = match kind {
            AdmissionSubjectKind::Run => "run",
            AdmissionSubjectKind::Epic => "epic",
            AdmissionSubjectKind::Packet => "packet",
        };
        conn.execute(
            "UPDATE admission_reservations SET state = 'released', released_at = ?1, \
             updated_at = ?1, last_error = 'ownerless pre-effect reservation released for fresh admission' \
             WHERE subject_kind = ?2 AND subject_id = ?3 AND state != 'released' \
               AND owner_kind IS NULL AND owner_id IS NULL",
            rusqlite::params![now, kind, id],
        )?;
    }
    Ok(())
}

fn insert_batch_tx(
    conn: &Connection,
    write: &AdmissionBatchWrite,
) -> Result<Vec<AdmissionReservationRow>, LedgerError> {
    if write.inputs.schema != ADMISSION_INPUTS_SCHEMA_V1 {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!(
                "unsupported admission input schema {:?}",
                write.inputs.schema
            ),
        ));
    }
    let batch_id = write
        .decisions
        .first()
        .map(|decision| decision.batch_id.clone())
        .ok_or_else(|| {
            refused(
                ErrorCode::InvalidRequest,
                "admission batch has no decisions",
            )
        })?;
    if write.decisions.iter().any(|decision| {
        decision.schema != ADMISSION_DECISION_SCHEMA_V1 || decision.batch_id != batch_id
    }) {
        return Err(refused(
            ErrorCode::InvalidRequest,
            "admission decisions have mixed identity or schema",
        ));
    }
    let inputs_value = serde_json::to_value(&write.inputs)?;
    let inputs_sha = canonical_sha(&inputs_value)?;
    let inputs_json = String::from_utf8(
        canonical_json_bytes(&inputs_value)
            .map_err(|error| internal(format!("canonicalizing admission inputs: {error}")))?,
    )
    .map_err(|error| internal(format!("canonical admission inputs are not utf8: {error}")))?;
    if let Some((stored_sha,)) = conn
        .query_row(
            "SELECT inputs_sha256 FROM admission_batches WHERE batch_id = ?1",
            [&batch_id],
            |row| Ok((row.get::<_, String>(0)?,)),
        )
        .optional()?
    {
        if stored_sha != inputs_sha {
            return Err(refused(
                ErrorCode::IdempotencyConflict,
                format!("admission batch {batch_id:?} has different inputs"),
            ));
        }
        let sql = format!(
            "SELECT {RESERVATION_COLUMNS_R} FROM admission_reservations r \
             JOIN admission_decisions d ON d.decision_id = r.decision_id \
             WHERE d.batch_id = ?1 ORDER BY r.reservation_id"
        );
        let mut stmt = conn.prepare(&sql)?;
        return stmt
            .query_map([&batch_id], reservation_row)?
            .collect::<Result<Vec<_>, _>>()
            .map_err(Into::into);
    }
    let current_revision = ledger_revision(conn)?;
    if current_revision != write.inputs.ledger_revision {
        return Err(refused(
            ErrorCode::OperationInProgress,
            "admission ledger facts changed before allocation",
        ));
    }
    let now = now_iso();
    conn.execute(
        "INSERT INTO admission_batches (batch_id, schema, policy_revision, ledger_revision, \
         inputs_sha256, inputs_json, as_of, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            batch_id,
            write.inputs.schema,
            write.inputs.policy_revision,
            write.inputs.ledger_revision,
            inputs_sha,
            inputs_json,
            write.inputs.as_of,
            now,
        ],
    )?;
    let mut reservations = Vec::new();
    for decision in &write.decisions {
        let decision_id = format!(
            "admission:{}:{}:{}",
            batch_id,
            match decision.subject_kind {
                AdmissionSubjectKind::Run => "run",
                AdmissionSubjectKind::Epic => "epic",
                AdmissionSubjectKind::Packet => "packet",
            },
            decision.subject_id
        );
        let value = serde_json::to_value(decision)?;
        let decision_json =
            String::from_utf8(canonical_json_bytes(&value).map_err(|error| {
                internal(format!("canonicalizing admission decision: {error}"))
            })?)
            .map_err(|error| {
                internal(format!("canonical admission decision is not utf8: {error}"))
            })?;
        let kind = match decision.subject_kind {
            AdmissionSubjectKind::Run => "run",
            AdmissionSubjectKind::Epic => "epic",
            AdmissionSubjectKind::Packet => "packet",
        };
        let outcome = serde_json::to_value(decision.outcome)?
            .as_str()
            .ok_or_else(|| internal("admission outcome is not a string"))?
            .to_owned();
        let reason = serde_json::to_value(decision.reason)?
            .as_str()
            .ok_or_else(|| internal("admission reason is not a string"))?
            .to_owned();
        conn.execute(
            "INSERT INTO admission_decisions (decision_id, batch_id, subject_kind, subject_id, \
             control_revision, outcome, reason, next_eligible_wake_at, decision_json, created_at) \
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            rusqlite::params![
                decision_id,
                batch_id,
                kind,
                decision.subject_id,
                i64::try_from(decision.control_revision).map_err(|_| refused(
                    ErrorCode::InvalidRequest,
                    "control revision exceeds i64"
                ))?,
                outcome,
                reason,
                decision.next_eligible_wake_at,
                decision_json,
                now,
            ],
        )?;
        if decision.outcome == AdmissionOutcome::Admitted {
            let provider = decision
                .provider
                .as_deref()
                .filter(|value| !value.is_empty())
                .ok_or_else(|| {
                    refused(
                        ErrorCode::InvalidRequest,
                        "admitted decision has no provider",
                    )
                })?;
            let model = decision
                .model
                .as_deref()
                .filter(|value| !value.is_empty())
                .ok_or_else(|| {
                    refused(ErrorCode::InvalidRequest, "admitted decision has no model")
                })?;
            let reservation_id = format!("reservation:{decision_id}");
            let work_key = format!(
                "{kind}:{}:{}",
                decision.subject_id, decision.control_revision
            );
            let class = match decision.resource_class {
                AdmissionResourceClass::Read => "read",
                AdmissionResourceClass::RepositoryWrite => "repository-write",
                AdmissionResourceClass::Gate => "gate",
            };
            let existing_sql = format!(
                "SELECT {RESERVATION_COLUMNS} FROM admission_reservations \
                 WHERE work_key = ?1 AND state != 'released'"
            );
            if let Some(existing) = conn
                .query_row(&existing_sql, [&work_key], reservation_row)
                .optional()?
            {
                if existing.repository != decision.repository
                    || existing.provider != provider
                    || existing.model != model
                    || existing.resource_class != decision.resource_class
                {
                    return Err(refused(
                        ErrorCode::IdempotencyConflict,
                        "standing admission reservation has different resource facts",
                    ));
                }
                reservations.push(existing);
                continue;
            }
            conn.execute(
                "INSERT INTO admission_reservations (reservation_id, decision_id, work_key, \
                 subject_kind, subject_id, control_revision, repository, provider, model, \
                 resource_class, state, recovery_deadline, created_at, updated_at) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'reserved', ?11, ?12, ?12)",
                rusqlite::params![
                    reservation_id,
                    decision_id,
                    work_key,
                    kind,
                    decision.subject_id,
                    i64::try_from(decision.control_revision).map_err(|_| refused(
                        ErrorCode::InvalidRequest,
                        "control revision exceeds i64",
                    ))?,
                    decision.repository,
                    provider,
                    model,
                    class,
                    write.recovery_deadline,
                    now,
                ],
            )?;
            let sql = format!(
                "SELECT {RESERVATION_COLUMNS} FROM admission_reservations WHERE reservation_id = ?1"
            );
            reservations.push(conn.query_row(&sql, [&reservation_id], reservation_row)?);
        }
        if decision.outcome != AdmissionOutcome::Admitted {
            if let Some(wake) = &decision.next_eligible_wake_at {
                let desired_kind = match decision.subject_kind {
                    AdmissionSubjectKind::Run => Some(("run", decision.subject_id.clone())),
                    AdmissionSubjectKind::Epic => Some(("epic", decision.subject_id.clone())),
                    AdmissionSubjectKind::Packet => {
                        packet_authorization_subject_tx(conn, &decision.subject_id)?
                            .map(|(kind, id)| (kind.as_str(), id))
                    }
                };
                if let Some((desired_kind, desired_id)) = desired_kind {
                    conn.execute(
                        "UPDATE desired_work SET next_wake_at = ?1, last_error = ?2, updated_at = ?3 \
                         WHERE subject_kind = ?4 AND subject_id = ?5 AND control_revision = ?6 \
                           AND desired_state = 'running'",
                        rusqlite::params![
                            wake,
                            reason,
                            now,
                            desired_kind,
                            desired_id,
                            i64::try_from(decision.control_revision).unwrap_or(i64::MAX),
                        ],
                    )?;
                }
            }
        }
    }
    Ok(reservations)
}

impl Ledger {
    /// Resolve the desired-work subject whose control epoch authorizes a
    /// packet. Epic child identity is returned even before the epic desired
    /// row commits so the child can wait on the parent's submit fence.
    pub fn packet_authorization_subject(
        &self,
        packet_id: &str,
    ) -> Result<Option<(DesiredSubjectKind, String)>, LedgerError> {
        let packet_id = packet_id.to_owned();
        self.submit(move |conn| packet_authorization_subject_tx(conn, &packet_id))
    }

    /// One bounded transaction-consistent read. `extra` adds exactly the
    /// explicit submit subject without making any other Work eligible.
    pub fn admission_snapshot(
        &self,
        extra: Option<(DesiredSubjectKind, String)>,
    ) -> Result<AdmissionLedgerSnapshot, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction()?;
            let snapshot = snapshot_tx(
                &tx,
                extra.as_ref().map(|(kind, id)| (*kind, id.as_str())),
                &[],
            )?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Reconcile reservations that provably never transferred capacity to an
    /// effect identity, then take the one scheduling snapshot used for the
    /// next decision. The `BEGIN IMMEDIATE` boundary serializes this release
    /// with controller activation and packet claim: whichever wins defines
    /// whether the caller must freshly admit or recover an owned effect.
    pub fn admission_snapshot_releasing_unowned(
        &self,
        extra: Option<(DesiredSubjectKind, String)>,
        targets: Vec<(AdmissionSubjectKind, String)>,
    ) -> Result<AdmissionLedgerSnapshot, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            release_unowned_targets_tx(&tx, &targets)?;
            let snapshot = snapshot_tx(
                &tx,
                extra.as_ref().map(|(kind, id)| (*kind, id.as_str())),
                &targets,
            )?;
            tx.commit()?;
            Ok(snapshot)
        })
    }

    /// Revalidate the snapshot and write its full decisions plus admitted
    /// reservations in one `BEGIN IMMEDIATE` transaction.
    pub fn commit_admission_batch(
        &self,
        write: AdmissionBatchWrite,
    ) -> Result<Vec<AdmissionReservationRow>, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let rows = insert_batch_tx(&tx, &write)?;
            tx.commit()?;
            Ok(rows)
        })
    }

    /// Transfer capacity ownership to the effect identity. Replays with the
    /// same identity are harmless; a different owner is refused.
    pub fn activate_admission_reservation(
        &self,
        reservation_id: &str,
        owner_kind: &str,
        owner_id: &str,
    ) -> Result<AdmissionReservationRow, LedgerError> {
        let reservation_id = reservation_id.to_owned();
        let owner_kind = owner_kind.to_owned();
        let owner_id = owner_id.to_owned();
        self.submit(move |conn| {
            if !matches!(owner_kind.as_str(), "controller" | "attempt") {
                return Err(refused(ErrorCode::InvalidRequest, "unknown reservation owner kind"));
            }
            if owner_id.is_empty() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "reservation owner id must not be empty",
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let sql = format!(
                "SELECT {RESERVATION_COLUMNS} FROM admission_reservations WHERE reservation_id = ?1"
            );
            let before = tx
                .query_row(&sql, [&reservation_id], reservation_row)
                .optional()?
                .ok_or_else(|| refused(ErrorCode::InvalidRequest, "admission reservation missing"))?;
            match before.state {
                AdmissionReservationState::Released => {
                    return Err(refused(
                        ErrorCode::OperationInProgress,
                        "reservation is released",
                    ));
                }
                AdmissionReservationState::Orphaned => {
                    return Err(refused(
                        ErrorCode::OperationInProgress,
                        "orphaned reservation cannot be reactivated",
                    ));
                }
                AdmissionReservationState::Active => {
                    if before.owner_kind.as_deref() == Some(owner_kind.as_str())
                        && before.owner_id.as_deref() == Some(owner_id.as_str())
                    {
                        tx.commit()?;
                        return Ok(before);
                    }
                    return Err(refused(
                        ErrorCode::IdempotencyConflict,
                        "reservation owner changed",
                    ));
                }
                AdmissionReservationState::Reserved => {
                    if before.owner_kind.is_some() || before.owner_id.is_some() {
                        return Err(refused(
                            ErrorCode::OperationInProgress,
                            "reserved reservation is already owned",
                        ));
                    }
                }
            }
            let now = now_iso();
            let affected = tx.execute(
                "UPDATE admission_reservations SET state = 'active', owner_kind = ?1, owner_id = ?2, \
                 last_error = NULL, updated_at = ?3 WHERE reservation_id = ?4 \
                   AND state = 'reserved' AND owner_kind IS NULL AND owner_id IS NULL",
                rusqlite::params![owner_kind, owner_id, now, reservation_id],
            )?;
            if affected != 1 {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "reservation custody changed before activation",
                ));
            }
            let row = tx.query_row(&sql, [&reservation_id], reservation_row)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Release only the exact custody tuple the caller observed. A terminal
    /// reread is immutable and safe to return after a response-lost release.
    pub fn release_admission_reservation(
        &self,
        observed: &AdmissionReservationRow,
        detail: Option<&str>,
    ) -> Result<AdmissionReservationRow, LedgerError> {
        if observed.owner_kind.is_some() != observed.owner_id.is_some() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "admission reservation observation has a malformed owner pair",
            ));
        }
        if observed
            .owner_kind
            .as_deref()
            .is_some_and(|kind| !matches!(kind, "controller" | "attempt"))
        {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "admission reservation observation has an unknown owner kind",
            ));
        }
        let reservation_id = observed.reservation_id.clone();
        let observed_state = observed.state;
        let owner_kind = observed.owner_kind.clone();
        let owner_id = observed.owner_id.clone();
        let detail = detail.map(str::to_owned);
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let affected = if observed_state == AdmissionReservationState::Released {
                0
            } else {
                let now = now_iso();
                tx.execute(
                    "UPDATE admission_reservations SET state = 'released', last_error = ?1, \
                     updated_at = ?2, released_at = ?2 WHERE reservation_id = ?3 AND state = ?4 \
                       AND owner_kind IS ?5 AND owner_id IS ?6",
                    rusqlite::params![
                        detail,
                        now,
                        reservation_id,
                        observed_state.as_str(),
                        owner_kind,
                        owner_id,
                    ],
                )?
            };
            let sql = format!(
                "SELECT {RESERVATION_COLUMNS} FROM admission_reservations WHERE reservation_id = ?1"
            );
            let current = tx
                .query_row(&sql, [&reservation_id], reservation_row)
                .optional()?;
            let Some(row) = current else {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "admission reservation custody changed",
                ));
            };
            if affected == 0
                && !(row.state == AdmissionReservationState::Released
                    && row.owner_kind == owner_kind
                    && row.owner_id == owner_id)
            {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "admission reservation custody changed",
                ));
            }
            tx.commit()?;
            Ok(row)
        })
    }

    /// Replace one evidence-proven orphaned run-controller reservation after
    /// the desired-work generation has advanced. Releasing the old custody,
    /// recording why it is safe, and installing ownerless capacity for the
    /// successor are one transaction, so recovery never creates a capacity
    /// gap and never reactivates the orphaned row.
    pub fn supersede_orphaned_admission_reservation(
        &self,
        observed: &AdmissionReservationRow,
        successor: &AdmissionDecisionV1,
        generation: u32,
        recovery_deadline: &str,
    ) -> Result<AdmissionReservationRow, LedgerError> {
        if observed.subject_kind != AdmissionSubjectKind::Run
            || observed.state != AdmissionReservationState::Orphaned
            || observed.owner_kind.as_deref() != Some("controller")
        {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "only an orphaned run-controller reservation can be superseded",
            ));
        }
        if successor.schema != ADMISSION_DECISION_SCHEMA_V1
            || successor.outcome != AdmissionOutcome::Admitted
            || successor.subject_kind != observed.subject_kind
            || successor.subject_id != observed.subject_id
            || successor.control_revision != observed.control_revision
            || successor.repository != observed.repository
            || successor.provider.as_deref() != Some(observed.provider.as_str())
            || successor.model.as_deref() != Some(observed.model.as_str())
            || successor.resource_class != observed.resource_class
        {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "successor admission decision does not match orphaned reservation facts",
            ));
        }
        let owner = observed.owner_id.as_deref().ok_or_else(|| {
            refused(
                ErrorCode::InvalidRequest,
                "orphaned controller reservation has no owner identity",
            )
        })?;
        let (owner_prefix, owner_generation) = owner.rsplit_once(':').ok_or_else(|| {
            refused(
                ErrorCode::InvalidRequest,
                "orphaned controller reservation has malformed owner identity",
            )
        })?;
        let owner_generation = owner_generation.parse::<u32>().map_err(|_| {
            refused(
                ErrorCode::InvalidRequest,
                "orphaned controller reservation has malformed owner generation",
            )
        })?;
        let expected_prefix = format!("run:{}", observed.subject_id);
        if owner_prefix != expected_prefix || generation <= owner_generation {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "successor generation does not supersede the orphaned controller owner",
            ));
        }
        if recovery_deadline.is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "successor reservation recovery deadline must not be empty",
            ));
        }

        let observed = observed.clone();
        let successor = successor.clone();
        let recovery_deadline = recovery_deadline.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let successor_decision_id = format!(
                "admission:{}:run:{}",
                successor.batch_id, successor.subject_id
            );
            let persisted_successor = tx
                .query_row(
                    "SELECT decision_json FROM admission_decisions WHERE decision_id = ?1",
                    [&successor_decision_id],
                    |row| row.get::<_, String>(0),
                )
                .optional()?
                .ok_or_else(|| {
                    refused(
                        ErrorCode::OperationInProgress,
                        "successor admission decision is not durable",
                    )
                })?;
            if decode_admission_decision(&persisted_successor)? != successor {
                return Err(refused(
                    ErrorCode::IdempotencyConflict,
                    "successor admission decision differs from the durable record",
                ));
            }
            let replacement_id =
                format!("reservation:{successor_decision_id}:orphan-relaunch:{generation}");
            let sql = format!(
                "SELECT {RESERVATION_COLUMNS} FROM admission_reservations WHERE reservation_id = ?1"
            );
            let current = tx
                .query_row(&sql, [&observed.reservation_id], reservation_row)
                .optional()?
                .ok_or_else(|| {
                    refused(
                        ErrorCode::OperationInProgress,
                        "orphaned admission reservation custody changed",
                    )
                })?;

            if current.state == AdmissionReservationState::Released {
                let replacement = tx
                    .query_row(&sql, [&replacement_id], reservation_row)
                    .optional()?
                    .ok_or_else(|| {
                        refused(
                            ErrorCode::OperationInProgress,
                            "orphaned admission reservation was released by another transition",
                        )
                    })?;
                tx.commit()?;
                return Ok(replacement);
            }
            if current.state != observed.state
                || current.owner_kind != observed.owner_kind
                || current.owner_id != observed.owner_id
            {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "orphaned admission reservation custody changed",
                ));
            }

            let uncontained = crate::operations::uncontained_machine_operations_tx(
                &tx,
                &observed.subject_id,
                None,
            )?;
            if !uncontained.is_empty() {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "orphaned admission reservation still has an uncontained machine operation",
                ));
            }
            let live_attempts =
                crate::attempts::list_live_attempts_tx(&tx, Some(&observed.subject_id))?;
            if !live_attempts.is_empty() {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "orphaned admission reservation still has a live attempt",
                ));
            }

            let now = now_iso();
            let affected = tx.execute(
                "UPDATE admission_reservations SET state = 'released', \
                 last_error = 'orphan-superseded-by-generation', updated_at = ?1, released_at = ?1 \
                 WHERE reservation_id = ?2 AND state = 'orphaned' \
                   AND owner_kind = ?3 AND owner_id = ?4",
                rusqlite::params![
                    now,
                    observed.reservation_id,
                    observed.owner_kind,
                    observed.owner_id,
                ],
            )?;
            if affected != 1 {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "orphaned admission reservation custody changed",
                ));
            }
            crate::events::append_event_tx(
                &tx,
                Some(&observed.subject_id),
                "forged.admission.reservation.released",
                &json!({
                    "reservationId": observed.reservation_id,
                    "subject": {
                        "kind": observed.subject_kind,
                        "id": observed.subject_id,
                    },
                    "generation": generation,
                    "reason": "orphan-superseded-by-generation",
                    "evidence": {
                        "uncontainedOperations": 0,
                        "liveAttempts": 0,
                        "identity": "absent",
                    },
                }),
            )?;
            tx.execute(
                "INSERT INTO admission_reservations (reservation_id, decision_id, work_key, \
                 subject_kind, subject_id, control_revision, repository, provider, model, \
                 resource_class, state, recovery_deadline, created_at, updated_at) \
                 VALUES (?1, ?2, ?3, 'run', ?4, ?5, ?6, ?7, ?8, ?9, 'reserved', ?10, ?11, ?11)",
                rusqlite::params![
                    replacement_id,
                    successor_decision_id,
                    observed.work_key,
                    observed.subject_id,
                    i64::try_from(observed.control_revision).map_err(|_| refused(
                        ErrorCode::InvalidRequest,
                        "control revision exceeds i64",
                    ))?,
                    observed.repository,
                    observed.provider,
                    observed.model,
                    match observed.resource_class {
                        AdmissionResourceClass::Read => "read",
                        AdmissionResourceClass::RepositoryWrite => "repository-write",
                        AdmissionResourceClass::Gate => "gate",
                    },
                    recovery_deadline,
                    now,
                ],
            )?;
            let replacement = tx.query_row(&sql, [&replacement_id], reservation_row)?;
            tx.commit()?;
            Ok(replacement)
        })
    }

    /// Mark overdue unknown-effect reservations for bounded recovery. They
    /// remain capacity-bearing and therefore cannot silently oversubscribe.
    pub fn mark_expired_admission_orphaned(
        &self,
        now: &str,
    ) -> Result<Vec<AdmissionReservationRow>, LedgerError> {
        let now = now.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let mut due_stmt = tx.prepare(
                "SELECT reservation_id, subject_kind, subject_id FROM admission_reservations \
                 WHERE state IN ('reserved','active') AND recovery_deadline <= ?1 \
                   AND NOT (owner_kind = 'attempt' AND EXISTS ( \
                     SELECT 1 FROM attempts a WHERE CAST(a.attempt_id AS TEXT) = owner_id \
                       AND a.state IN ('running','revoking'))) \
                 ORDER BY reservation_id",
            )?;
            let due = due_stmt
                .query_map([&now], |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                    ))
                })?
                .collect::<Result<Vec<_>, _>>()?;
            drop(due_stmt);
            tx.execute(
                "UPDATE admission_reservations SET state = 'orphaned', \
                 last_error = 'effect identity requires reconciliation', updated_at = ?1 \
                 WHERE state IN ('reserved','active') AND recovery_deadline <= ?1 \
                   AND NOT (owner_kind = 'attempt' AND EXISTS ( \
                     SELECT 1 FROM attempts a WHERE CAST(a.attempt_id AS TEXT) = owner_id \
                       AND a.state IN ('running','revoking')))",
                [&now],
            )?;
            for (reservation_id, kind, subject_id) in due {
                let event_subject = if kind == "packet" {
                    tx.query_row(
                        "SELECT run_id FROM packets WHERE packet_id = ?1",
                        [&subject_id],
                        |row| row.get::<_, String>(0),
                    )
                    .optional()?
                } else {
                    Some(subject_id.clone())
                };
                crate::events::append_event_tx(
                    &tx,
                    event_subject.as_deref(),
                    "forged.admission.attention",
                    &json!({
                        "schema": "forged.admission.attention/1",
                        "condition": "unknown-effect",
                        "reservationId": reservation_id,
                        "subjectKind": kind,
                        "subjectId": subject_id,
                        "detail": "capacity retained until effect identity is reconciled",
                    }),
                )?;
            }
            let sql = format!(
                "SELECT {RESERVATION_COLUMNS} FROM admission_reservations \
                 WHERE state = 'orphaned' ORDER BY recovery_deadline, reservation_id"
            );
            let mut stmt = tx.prepare(&sql)?;
            let rows = stmt
                .query_map([], reservation_row)?
                .collect::<Result<Vec<_>, _>>()?;
            drop(stmt);
            tx.commit()?;
            Ok(rows)
        })
    }

    pub fn latest_admission_decisions(
        &self,
        subject_kind_filter: Option<AdmissionSubjectKind>,
        subject_id_filter: Option<&str>,
    ) -> Result<Vec<AdmissionDecisionV1>, LedgerError> {
        let kind = subject_kind_filter.map(|kind| match kind {
            AdmissionSubjectKind::Run => "run".to_owned(),
            AdmissionSubjectKind::Epic => "epic".to_owned(),
            AdmissionSubjectKind::Packet => "packet".to_owned(),
        });
        let id = subject_id_filter.map(str::to_owned);
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT d.decision_json FROM admission_decisions d \
                 WHERE (?1 IS NULL OR d.subject_kind = ?1) AND (?2 IS NULL OR d.subject_id = ?2) \
                   AND d.rowid = (SELECT d2.rowid FROM admission_decisions d2 \
                     WHERE d2.subject_kind = d.subject_kind AND d2.subject_id = d.subject_id \
                     ORDER BY d2.rowid DESC LIMIT 1) \
                 ORDER BY d.subject_kind, d.subject_id, d.decision_id",
            )?;
            let rows =
                stmt.query_map(rusqlite::params![kind, id], |row| row.get::<_, String>(0))?;
            let mut out = Vec::new();
            for raw in rows {
                out.push(decode_admission_decision(&raw?)?);
            }
            Ok(out)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{EffectClass, NewPacket, NewRun, RevokeScope, SpecFence};
    use crate::{NewWorkItem, WorkKind, WorkRevisionCause, WorkSpecFields, WorkStatus};
    use forged_types::{
        AdmissionCandidateV1, AdmissionInputsV1, AdmissionReason, OperationRequest, Outcome,
        PacketResult, RunId, Stage, ADMISSION_DECISION_SCHEMA_V1, ADMISSION_INPUTS_SCHEMA_V1,
    };

    fn seed_packet(ledger: &Ledger, suffix: &str) -> (String, String) {
        let run_id = format!("run-{suffix}");
        ledger
            .create_run(NewRun {
                run_id: RunId::new(&run_id).expect("run id"),
                work_id: format!("bead-{suffix}"),
                repo: "example/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: format!("work/{suffix}"),
            })
            .expect("run");
        let packet_id = ledger
            .open_packet(NewPacket {
                run_id: run_id.clone(),
                stage: Stage::Implement,
                seq: 1,
                spec_path: format!("specs/{suffix}.md"),
                spec_sha256: "feed".to_owned(),
                spec_revision: None,
                policy_revision: None,
                body_json: json!({
                    "providerHints": {
                        "provider": "codex",
                        "model": "gpt-test",
                        "sandbox": "workspaceWrite"
                    }
                })
                .to_string(),
            })
            .expect("packet");
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, &run_id, 1)
            .expect("authorize");
        (run_id, packet_id)
    }

    #[allow(clippy::too_many_arguments)]
    fn write_for(
        ledger: &Ledger,
        snapshot: AdmissionLedgerSnapshot,
        subject_kind: AdmissionSubjectKind,
        subject_id: &str,
        control_revision: u64,
        batch: &str,
        outcome: AdmissionOutcome,
        reason: AdmissionReason,
        recovery_deadline: &str,
    ) -> AdmissionBatchWrite {
        let run_id = match subject_kind {
            AdmissionSubjectKind::Packet => ledger.get_packet(subject_id).expect("packet").run_id,
            _ => subject_id.to_owned(),
        };
        let desired = ledger
            .get_desired_work(DesiredSubjectKind::Run, &run_id)
            .expect("desired query")
            .expect("desired");
        let candidate = AdmissionCandidateV1 {
            subject_kind,
            subject_id: subject_id.to_owned(),
            control_revision,
            work_id: format!("bead-{subject_id}"),
            work_revision: Some("revision-current".to_owned()),
            work_status: Some(if reason == AdmissionReason::WorkNotRunnable {
                "closed".to_owned()
            } else {
                "open".to_owned()
            }),
            priority: Some(1),
            repository: "example/repo".to_owned(),
            work_repository: Some(
                if reason == AdmissionReason::RepositoryMismatch {
                    "different/repo"
                } else {
                    "example/repo"
                }
                .to_owned(),
            ),
            input_error: None,
            desired_wake_at: desired.next_wake_at,
            provider: Some("codex".to_owned()),
            model: Some("gpt-test".to_owned()),
            resource_class: AdmissionResourceClass::RepositoryWrite,
            authorized_at: desired.created_at,
        };
        let next_eligible_wake_at = (outcome == AdmissionOutcome::Deferred)
            .then(|| "2030-01-01T00:00:05.000000000Z".to_owned());
        let inputs = AdmissionInputsV1 {
            schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
            as_of: snapshot.as_of,
            policy_revision: "policy-v1".to_owned(),
            ledger_revision: snapshot.ledger_revision,
            candidates: vec![candidate.clone()],
            capacity: snapshot.capacity.clone(),
            spend: snapshot.spend,
            latest_rate_limits: snapshot.latest_rate_limits,
        };
        AdmissionBatchWrite {
            inputs,
            decisions: vec![AdmissionDecisionV1 {
                schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
                batch_id: batch.to_owned(),
                subject_kind,
                subject_id: subject_id.to_owned(),
                control_revision,
                repository: candidate.repository,
                priority: candidate.priority,
                provider: candidate.provider,
                model: candidate.model,
                resource_class: candidate.resource_class,
                outcome,
                reason,
                reason_detail: None,
                policy_revision: "policy-v1".to_owned(),
                evidence: snapshot.capacity,
                next_eligible_wake_at,
            }],
            recovery_deadline: recovery_deadline.to_owned(),
        }
    }

    fn reserve(
        ledger: &Ledger,
        subject_kind: AdmissionSubjectKind,
        subject_id: &str,
        batch: &str,
        deadline: &str,
    ) -> AdmissionReservationRow {
        let run_id = match subject_kind {
            AdmissionSubjectKind::Packet => ledger.get_packet(subject_id).expect("packet").run_id,
            _ => subject_id.to_owned(),
        };
        let revision = ledger
            .get_desired_work(DesiredSubjectKind::Run, &run_id)
            .expect("desired query")
            .expect("desired")
            .control_revision;
        let snapshot = ledger.admission_snapshot(None).expect("snapshot");
        ledger
            .commit_admission_batch(write_for(
                ledger,
                snapshot,
                subject_kind,
                subject_id,
                revision,
                batch,
                AdmissionOutcome::Admitted,
                AdmissionReason::CapacityAvailable,
                deadline,
            ))
            .expect("reserve")
            .into_iter()
            .next()
            .expect("reservation")
    }

    fn claim_admitted(
        ledger: &Ledger,
        packet_id: &str,
        batch: &str,
    ) -> (AdmissionReservationRow, crate::types::ClaimedAttempt) {
        let reservation = reserve(
            ledger,
            AdmissionSubjectKind::Packet,
            packet_id,
            batch,
            "9999-01-01T00:00:00.000000000Z",
        );
        let attempt = ledger
            .claim_packet_with_admission(
                packet_id,
                "codex:test:1",
                &SpecFence::Sha256("feed".to_owned()),
                &reservation.reservation_id,
            )
            .expect("claim");
        (reservation, attempt)
    }

    #[test]
    fn closed_decoders_refuse_unknown_storage_values() {
        assert!(subject_kind(0, "portfolio").is_err());
        assert!(resource_class(0, "root").is_err());
        assert!(AdmissionReservationState::try_from("expired").is_err());
    }

    #[test]
    fn stale_release_cannot_steal_controller_or_attempt_custody() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "stale-release");

        let stale_controller = reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-stale-controller",
            "9999-01-01T00:00:00.000000000Z",
        );
        let active_controller = ledger
            .activate_admission_reservation(
                &stale_controller.reservation_id,
                "controller",
                &format!("run:{run_id}:1"),
            )
            .expect("activate controller");
        let error = ledger
            .release_admission_reservation(&stale_controller, Some("stale ownerless release"))
            .expect_err("stale ownerless observation must not release controller custody");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        let snapshot = ledger
            .admission_snapshot(None)
            .expect("controller snapshot");
        assert_eq!(snapshot.capacity.total_active, 1);
        assert_eq!(snapshot.reservations, vec![active_controller.clone()]);
        ledger
            .release_admission_reservation(&active_controller, Some("controller reconciled"))
            .expect("release exact controller custody");

        let stale_packet = reserve(
            &ledger,
            AdmissionSubjectKind::Packet,
            &packet_id,
            "batch-stale-packet",
            "9999-01-01T00:00:00.000000000Z",
        );
        let attempt = ledger
            .claim_packet_with_admission(
                &packet_id,
                "codex:test:stale",
                &SpecFence::Sha256("feed".to_owned()),
                &stale_packet.reservation_id,
            )
            .expect("claim packet");
        let error = ledger
            .release_admission_reservation(&stale_packet, Some("stale packet release"))
            .expect_err("stale ownerless observation must not release attempt custody");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        ledger
            .assert_admitted_attempt_live(&attempt.claim_token)
            .expect("attempt custody remains live");
        let snapshot = ledger.admission_snapshot(None).expect("attempt snapshot");
        assert_eq!(snapshot.capacity.total_active, 1);
        assert_eq!(snapshot.reservations.len(), 1);
        assert_eq!(
            snapshot.reservations[0].owner_kind.as_deref(),
            Some("attempt")
        );
        assert_eq!(
            snapshot.reservations[0].owner_id.as_deref(),
            Some(attempt.attempt_id.to_string().as_str())
        );
        ledger
            .fail_packet(&packet_id, &attempt.claim_token, "test cleanup")
            .expect("release attempt custody");
        assert_eq!(
            ledger
                .admission_snapshot(None)
                .expect("final snapshot")
                .capacity
                .total_active,
            0
        );
    }

    #[test]
    fn exact_release_replays_immutably_and_release_first_fences_transfer() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "release-first");

        let ownerless = reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-ownerless-release",
            "9999-01-01T00:00:00.000000000Z",
        );
        let released = ledger
            .release_admission_reservation(&ownerless, Some("first release"))
            .expect("release exact ownerless custody");
        assert_eq!(released.state, AdmissionReservationState::Released);
        assert_eq!(released.last_error.as_deref(), Some("first release"));
        assert_eq!(
            ledger
                .release_admission_reservation(&ownerless, Some("replayed predecessor"))
                .expect("predecessor replay"),
            released
        );
        assert_eq!(
            ledger
                .release_admission_reservation(&released, Some("released replay"))
                .expect("terminal replay"),
            released
        );
        let error = ledger
            .activate_admission_reservation(
                &ownerless.reservation_id,
                "controller",
                &format!("run:{run_id}:1"),
            )
            .expect_err("released custody cannot activate");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);

        let packet = reserve(
            &ledger,
            AdmissionSubjectKind::Packet,
            &packet_id,
            "batch-packet-release-first",
            "9999-01-01T00:00:00.000000000Z",
        );
        ledger
            .release_admission_reservation(&packet, Some("packet release wins"))
            .expect("release packet before claim");
        let error = ledger
            .claim_packet_with_admission(
                &packet_id,
                "codex:test:release-first",
                &SpecFence::Sha256("feed".to_owned()),
                &packet.reservation_id,
            )
            .expect_err("released packet custody cannot transfer");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        assert!(ledger
            .list_live_attempts(Some(&run_id))
            .expect("attempts")
            .is_empty());

        let ownerless = reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-owned-release",
            "9999-01-01T00:00:00.000000000Z",
        );
        let active = ledger
            .activate_admission_reservation(
                &ownerless.reservation_id,
                "controller",
                &format!("run:{run_id}:2"),
            )
            .expect("activate exact owner");
        let mut wrong_owner = active.clone();
        wrong_owner.owner_id = Some(format!("run:{run_id}:3"));
        let error = ledger
            .release_admission_reservation(&wrong_owner, Some("wrong owner"))
            .expect_err("different owner must refuse");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        let mut wrong_state = active.clone();
        wrong_state.state = AdmissionReservationState::Orphaned;
        let error = ledger
            .release_admission_reservation(&wrong_state, Some("wrong state"))
            .expect_err("different state must refuse");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        let released = ledger
            .release_admission_reservation(&active, Some("owned release"))
            .expect("release exact owner");
        assert_eq!(released.owner_kind, active.owner_kind);
        assert_eq!(released.owner_id, active.owner_id);
        assert_eq!(
            ledger
                .release_admission_reservation(&active, Some("owned replay"))
                .expect("owned predecessor replay"),
            released
        );
        assert_eq!(
            ledger
                .admission_snapshot(None)
                .expect("zero capacity")
                .capacity
                .total_active,
            0
        );
    }

    #[test]
    fn orphaned_custody_cannot_aba_to_active() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, _) = seed_packet(&ledger, "custody-aba");
        let reservation = reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-custody-aba",
            "2000-01-01T00:00:00.000000000Z",
        );
        let owner_id = format!("run:{run_id}:1");
        let active = ledger
            .activate_admission_reservation(&reservation.reservation_id, "controller", &owner_id)
            .expect("activate");
        assert_eq!(
            ledger
                .activate_admission_reservation(
                    &reservation.reservation_id,
                    "controller",
                    &owner_id,
                )
                .expect("active activation replay"),
            active,
            "an exact active replay must not rewrite audit fields"
        );
        let orphaned = ledger
            .mark_expired_admission_orphaned("2030-01-01T00:00:00.000000000Z")
            .expect("orphan expired custody")
            .into_iter()
            .next()
            .expect("orphan row");
        let error = ledger
            .activate_admission_reservation(&reservation.reservation_id, "controller", &owner_id)
            .expect_err("orphan must not reactivate to the same owner");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        let error = ledger
            .release_admission_reservation(&active, Some("stale active release"))
            .expect_err("stale active tuple must not release orphan custody");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        let snapshot = ledger.admission_snapshot(None).expect("orphan snapshot");
        assert_eq!(snapshot.capacity.total_active, 1);
        assert_eq!(snapshot.reservations, vec![orphaned.clone()]);
        let successor_write = write_for(
            &ledger,
            snapshot,
            AdmissionSubjectKind::Run,
            &run_id,
            orphaned.control_revision,
            "batch-custody-aba-successor",
            AdmissionOutcome::Admitted,
            AdmissionReason::CapacityAvailable,
            "2030-01-01T00:01:00.000000000Z",
        );
        let successor = successor_write.decisions[0].clone();
        ledger
            .commit_admission_batch(successor_write)
            .expect("persist successor admission decision");
        let replacement = ledger
            .supersede_orphaned_admission_reservation(
                &orphaned,
                &successor,
                2,
                "2030-01-01T00:01:00.000000000Z",
            )
            .expect("supersede exact orphan custody");
        assert_ne!(replacement.reservation_id, orphaned.reservation_id);
        assert_eq!(replacement.state, AdmissionReservationState::Reserved);
        assert!(replacement.owner_kind.is_none());
        assert!(replacement.owner_id.is_none());
        assert_eq!(
            ledger
                .admission_snapshot(None)
                .expect("successor capacity snapshot")
                .reservations,
            vec![replacement.clone()],
            "capacity transfers to a new row instead of reactivating the orphan"
        );
        let release: Value = ledger
            .latest_event_of_kind(&run_id, "forged.admission.reservation.released")
            .expect("release event query")
            .and_then(|event| serde_json::from_str(&event.payload_json).ok())
            .expect("release event");
        assert_eq!(release["reservationId"], json!(orphaned.reservation_id));
        assert_eq!(release["subject"], json!({"kind": "run", "id": run_id}));
        assert_eq!(release["generation"], json!(2));
        assert_eq!(release["reason"], json!("orphan-superseded-by-generation"));
        assert_eq!(
            release["evidence"],
            json!({
                "uncontainedOperations": 0,
                "liveAttempts": 0,
                "identity": "absent",
            })
        );
        let error = ledger
            .activate_admission_reservation(&orphaned.reservation_id, "controller", &owner_id)
            .expect_err("the late old generation stays fenced");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        ledger
            .activate_admission_reservation(
                &replacement.reservation_id,
                "controller",
                &format!("run:{run_id}:2"),
            )
            .expect("activate successor custody");
    }

    #[test]
    fn orphaned_custody_with_uncontained_machine_effect_cannot_be_superseded() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, _) = seed_packet(&ledger, "custody-unsafe-effect");
        let reservation = reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-custody-unsafe-effect",
            "2000-01-01T00:00:00.000000000Z",
        );
        ledger
            .activate_admission_reservation(
                &reservation.reservation_id,
                "controller",
                &format!("run:{run_id}:1"),
            )
            .expect("activate");
        let orphaned = ledger
            .mark_expired_admission_orphaned("2030-01-01T00:00:00.000000000Z")
            .expect("orphan expired custody")
            .into_iter()
            .next()
            .expect("orphan row");
        ledger
            .begin_operation(
                "gate",
                &OperationRequest {
                    schema_version: 1,
                    idempotency_key: "unsafe-gate-effect".to_owned(),
                    run_id: Some(run_id.clone()),
                    params: serde_json::Map::new(),
                },
                EffectClass::SafeRetry,
                None,
            )
            .expect("seed in-progress machine operation");
        let successor_write = write_for(
            &ledger,
            ledger.admission_snapshot(None).expect("successor snapshot"),
            AdmissionSubjectKind::Run,
            &run_id,
            orphaned.control_revision,
            "batch-custody-unsafe-effect-successor",
            AdmissionOutcome::Admitted,
            AdmissionReason::CapacityAvailable,
            "2030-01-01T00:01:00.000000000Z",
        );
        let successor = successor_write.decisions[0].clone();
        ledger
            .commit_admission_batch(successor_write)
            .expect("persist successor admission decision");

        let error = ledger
            .supersede_orphaned_admission_reservation(
                &orphaned,
                &successor,
                2,
                "2030-01-01T00:01:00.000000000Z",
            )
            .expect_err("uncontained machine effect must retain orphan custody");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        assert_eq!(
            ledger
                .admission_snapshot(None)
                .expect("retained orphan snapshot")
                .reservations,
            vec![orphaned]
        );
        assert!(
            ledger
                .latest_event_of_kind(&run_id, "forged.admission.reservation.released")
                .expect("release event query")
                .is_none(),
            "unsafe residue cannot emit release evidence"
        );
    }

    #[test]
    fn malformed_owner_pairs_and_nonreserved_packet_custody_fail_closed() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, _) = seed_packet(&ledger, "malformed-observation");
        let reserved = reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-malformed-observation",
            "9999-01-01T00:00:00.000000000Z",
        );
        for malformed in [
            AdmissionReservationRow {
                owner_kind: Some("controller".to_owned()),
                ..reserved.clone()
            },
            AdmissionReservationRow {
                owner_id: Some("run:malformed:1".to_owned()),
                ..reserved.clone()
            },
        ] {
            let error = ledger
                .release_admission_reservation(&malformed, Some("must fail closed"))
                .expect_err("half-owned observation");
            assert_eq!(error.code(), ErrorCode::InvalidRequest);
        }
        assert_eq!(
            ledger
                .admission_snapshot(None)
                .expect("unchanged observation row")
                .reservations,
            vec![reserved]
        );

        for (suffix, owner_kind, owner_id) in [
            ("kind", Some("controller"), None),
            ("id", None, Some("run:malformed:1")),
        ] {
            let dir = tempfile::tempdir().expect("tempdir");
            let path = dir.path().join("state.db");
            let ledger = Ledger::open(&path).expect("ledger");
            let (run_id, _) = seed_packet(&ledger, suffix);
            let reserved = reserve(
                &ledger,
                AdmissionSubjectKind::Run,
                &run_id,
                &format!("batch-malformed-stored-{suffix}"),
                "9999-01-01T00:00:00.000000000Z",
            );
            let connection = rusqlite::Connection::open(&path).expect("second connection");
            connection
                .execute(
                    "UPDATE admission_reservations SET owner_kind = ?1, owner_id = ?2 \
                     WHERE reservation_id = ?3",
                    rusqlite::params![owner_kind, owner_id, reserved.reservation_id],
                )
                .expect("inject malformed stored pair");
            let error = ledger
                .release_admission_reservation(&reserved, Some("must not mutate malformed row"))
                .expect_err("malformed stored row");
            assert_eq!(error.code(), ErrorCode::Internal);
            let state: String = connection
                .query_row(
                    "SELECT state FROM admission_reservations WHERE reservation_id = ?1",
                    [&reserved.reservation_id],
                    |row| row.get(0),
                )
                .expect("stored state");
            assert_eq!(state, "reserved");
        }

        for custody in ["orphaned", "owned"] {
            let dir = tempfile::tempdir().expect("tempdir");
            let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
            let (run_id, packet_id) = seed_packet(&ledger, custody);
            let reserved = reserve(
                &ledger,
                AdmissionSubjectKind::Packet,
                &packet_id,
                &format!("batch-packet-{custody}"),
                if custody == "orphaned" {
                    "2000-01-01T00:00:00.000000000Z"
                } else {
                    "9999-01-01T00:00:00.000000000Z"
                },
            );
            let exact = if custody == "orphaned" {
                ledger
                    .mark_expired_admission_orphaned("2030-01-01T00:00:00.000000000Z")
                    .expect("orphan packet custody")
                    .into_iter()
                    .next()
                    .expect("orphan row")
            } else {
                ledger
                    .activate_admission_reservation(
                        &reserved.reservation_id,
                        "controller",
                        &format!("run:{run_id}:1"),
                    )
                    .expect("own packet custody")
            };
            let error = ledger
                .claim_packet_with_admission(
                    &packet_id,
                    "codex:test:nonreserved",
                    &SpecFence::Sha256("feed".to_owned()),
                    &reserved.reservation_id,
                )
                .expect_err("only exact reserved ownerless custody transfers");
            assert_eq!(error.code(), ErrorCode::OperationInProgress);
            assert!(ledger
                .list_live_attempts(Some(&run_id))
                .expect("attempts")
                .is_empty());
            ledger
                .release_admission_reservation(&exact, Some("test cleanup"))
                .expect("release exact nonreserved custody");
        }
    }

    #[test]
    fn stale_batch_cannot_reserve_capacity() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let snapshot = ledger.admission_snapshot(None).expect("snapshot");
        let candidate = AdmissionCandidateV1 {
            subject_kind: AdmissionSubjectKind::Run,
            subject_id: "run-1".to_owned(),
            control_revision: 0,
            work_id: "bead-1".to_owned(),
            work_revision: Some("1".to_owned()),
            work_status: Some("open".to_owned()),
            priority: Some(0),
            repository: "/repo".to_owned(),
            work_repository: Some("/repo".to_owned()),
            input_error: None,
            desired_wake_at: None,
            provider: Some("codex".to_owned()),
            model: Some("m".to_owned()),
            resource_class: AdmissionResourceClass::RepositoryWrite,
            authorized_at: snapshot.as_of.clone(),
        };
        let inputs = AdmissionInputsV1 {
            schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
            as_of: snapshot.as_of,
            policy_revision: "policy".to_owned(),
            ledger_revision: "stale".to_owned(),
            candidates: vec![candidate.clone()],
            capacity: snapshot.capacity.clone(),
            spend: snapshot.spend,
            latest_rate_limits: snapshot.latest_rate_limits,
        };
        let decision = AdmissionDecisionV1 {
            schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
            batch_id: "batch".to_owned(),
            subject_kind: candidate.subject_kind,
            subject_id: candidate.subject_id,
            control_revision: 0,
            repository: candidate.repository,
            priority: candidate.priority,
            provider: candidate.provider,
            model: candidate.model,
            resource_class: candidate.resource_class,
            outcome: AdmissionOutcome::Admitted,
            reason: AdmissionReason::CapacityAvailable,
            reason_detail: None,
            policy_revision: "policy".to_owned(),
            evidence: snapshot.capacity,
            next_eligible_wake_at: None,
        };
        let error = ledger
            .commit_admission_batch(AdmissionBatchWrite {
                inputs,
                decisions: vec![decision],
                recovery_deadline: "9999-01-01T00:00:00.000000000Z".to_owned(),
            })
            .expect_err("stale revision");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
    }

    #[test]
    fn packet_or_repository_change_invalidates_the_admission_snapshot() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = Ledger::open(&path).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "mutable-input");
        let revision = ledger
            .get_desired_work(DesiredSubjectKind::Run, &run_id)
            .expect("desired query")
            .expect("desired")
            .control_revision;
        let snapshot = ledger.admission_snapshot(None).expect("snapshot");
        let write = write_for(
            &ledger,
            snapshot,
            AdmissionSubjectKind::Packet,
            &packet_id,
            revision,
            "batch-mutable-input",
            AdmissionOutcome::Admitted,
            AdmissionReason::CapacityAvailable,
            "9999-01-01T00:00:00.000000000Z",
        );
        let connection = rusqlite::Connection::open(&path).expect("second process");
        connection
            .execute(
                "UPDATE runs SET repo = 'changed/repo' WHERE run_id = ?1",
                [&run_id],
            )
            .expect("move repository during work read");
        connection
            .execute(
                "UPDATE packets SET body_json = json_set(body_json, '$.providerHints.model', \
                 'changed-model') WHERE packet_id = ?1",
                [&packet_id],
            )
            .expect("move packet facts during work read");
        let error = ledger
            .commit_admission_batch(write)
            .expect_err("mutable scheduler inputs invalidate the batch");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        assert!(
            error
                .to_string()
                .ends_with("admission ledger facts changed before allocation"),
            "wire refusal text changed: {error}"
        );
    }

    #[test]
    fn roster_revision_change_invalidates_the_admission_snapshot() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = Ledger::open(&path).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "roster-interleave");
        let revision = ledger
            .get_desired_work(DesiredSubjectKind::Run, &run_id)
            .expect("desired query")
            .expect("desired")
            .control_revision;
        let snapshot = ledger.admission_snapshot(None).expect("snapshot");
        let write = write_for(
            &ledger,
            snapshot,
            AdmissionSubjectKind::Packet,
            &packet_id,
            revision,
            "batch-roster-interleave",
            AdmissionOutcome::Admitted,
            AdmissionReason::CapacityAvailable,
            "9999-01-01T00:00:00.000000000Z",
        );
        let connection = rusqlite::Connection::open(&path).expect("second process");
        connection
            .execute(
                "INSERT INTO roster_revisions \
                 (run_id, revision, roster_ref_json, roster_sha256, roster_json, reason, created_at) \
                 VALUES (?1, 1, '{\"name\":\"changed\",\"version\":1}', 'changed', \
                 '{\"schema\":\"forged.resolved-roster/1\",\"rosterRef\":{\"name\":\"changed\",\"version\":1},\"roles\":{}}', \
                 'operator revision', '2030-01-01T00:00:00.000000000Z')",
                [&run_id],
            )
            .expect("append roster revision during work read");
        let error = ledger
            .commit_admission_batch(write)
            .expect_err("roster changes invalidate the batch");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
    }

    #[test]
    fn ownerless_controller_and_packet_crashes_require_fresh_decisions() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "crash");
        reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-run-open",
            "9999-01-01T00:00:00.000000000Z",
        );
        let snapshot = ledger
            .admission_snapshot_releasing_unowned(
                None,
                vec![(AdmissionSubjectKind::Run, run_id.clone())],
            )
            .expect("reconcile ownerless controller reservation");
        assert_eq!(snapshot.capacity.total_active, 0);
        assert!(snapshot.reservations.is_empty());
        let revision = ledger
            .get_desired_work(DesiredSubjectKind::Run, &run_id)
            .expect("desired query")
            .expect("desired")
            .control_revision;
        ledger
            .commit_admission_batch(write_for(
                &ledger,
                snapshot,
                AdmissionSubjectKind::Run,
                &run_id,
                revision,
                "batch-run-closed",
                AdmissionOutcome::Deferred,
                AdmissionReason::WorkNotRunnable,
                "9999-01-01T00:00:00.000000000Z",
            ))
            .expect("persist closed-work decision");
        let latest = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Run), Some(&run_id))
            .expect("latest run decision");
        assert_eq!(latest.len(), 1);
        assert_eq!(latest[0].reason, AdmissionReason::WorkNotRunnable);

        reserve(
            &ledger,
            AdmissionSubjectKind::Packet,
            &packet_id,
            "batch-packet-open",
            "9999-01-01T00:00:00.000000000Z",
        );
        let snapshot = ledger
            .admission_snapshot_releasing_unowned(
                None,
                vec![(AdmissionSubjectKind::Packet, packet_id.clone())],
            )
            .expect("reconcile ownerless packet reservation");
        assert_eq!(snapshot.capacity.total_active, 0);
        assert_eq!(snapshot.packet_facts.len(), 1);
        assert_eq!(snapshot.packet_facts[0].packet_id, packet_id);
        assert_eq!(snapshot.packet_facts[0].provider, "codex");
        assert_eq!(snapshot.packet_facts[0].model, "gpt-test");
        let revision = ledger
            .get_desired_work(DesiredSubjectKind::Run, &run_id)
            .expect("desired query")
            .expect("desired")
            .control_revision;
        ledger
            .commit_admission_batch(write_for(
                &ledger,
                snapshot,
                AdmissionSubjectKind::Packet,
                &packet_id,
                revision,
                "batch-packet-repo-moved",
                AdmissionOutcome::Deferred,
                AdmissionReason::RepositoryMismatch,
                "9999-01-01T00:00:00.000000000Z",
            ))
            .expect("persist repository mismatch");
        let error = ledger
            .claim_packet_with_admission(
                &packet_id,
                "codex:test:1",
                &SpecFence::Sha256("feed".to_owned()),
                "reservation:admission:batch-packet-open:packet:missing",
            )
            .expect_err("old admission cannot spawn");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
    }

    #[test]
    fn owned_orphan_keeps_capacity_until_identity_is_reconciled() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, _) = seed_packet(&ledger, "owned");
        let reservation = reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-owned",
            "2000-01-01T00:00:00.000000000Z",
        );
        ledger
            .activate_admission_reservation(
                &reservation.reservation_id,
                "controller",
                &format!("run:{run_id}:1"),
            )
            .expect("own reservation");
        let orphaned = ledger
            .mark_expired_admission_orphaned("2030-01-01T00:00:00.000000000Z")
            .expect("expire");
        assert_eq!(orphaned.len(), 1);
        assert_eq!(orphaned[0].state, AdmissionReservationState::Orphaned);
        let snapshot = ledger
            .admission_snapshot_releasing_unowned(
                None,
                vec![(AdmissionSubjectKind::Run, run_id.clone())],
            )
            .expect("snapshot");
        assert_eq!(snapshot.capacity.total_active, 1);
        assert_eq!(snapshot.reservations.len(), 1);
        assert_eq!(
            snapshot.reservations[0].owner_kind.as_deref(),
            Some("controller")
        );
        assert!(ledger
            .list_events(Some(&run_id), 0, 100)
            .expect("events")
            .iter()
            .any(|event| event.kind == "forged.admission.attention"));
    }

    #[test]
    fn expired_live_attempt_stays_active_without_foreground_spin_then_releases() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "long-attempt");
        let reservation = reserve(
            &ledger,
            AdmissionSubjectKind::Packet,
            &packet_id,
            "batch-long-attempt",
            "2000-01-01T00:00:00.000000000Z",
        );
        let attempt = ledger
            .claim_packet_with_admission(
                &packet_id,
                "codex:test:long",
                &SpecFence::Sha256("feed".to_owned()),
                &reservation.reservation_id,
            )
            .expect("claim");
        ledger
            .record_desired_outcome(
                DesiredSubjectKind::Run,
                &run_id,
                DesiredState::Running,
                crate::types::DesiredReconcileOutcome::Adopted,
                None,
                None,
            )
            .expect("park foreground wake");

        assert!(ledger
            .mark_expired_admission_orphaned("2030-01-01T00:00:00.000000000Z")
            .expect("reconcile expiry")
            .is_empty());
        assert_eq!(
            ledger
                .earliest_desired_wake("2030-01-01T00:00:00.000000000Z")
                .expect("earliest wake"),
            None,
            "a proven-live attempt relies on attempt settlement, not a stale recovery deadline"
        );
        ledger
            .assert_admitted_attempt_live(&attempt.claim_token)
            .expect("live attempt remains authorized");
        ledger
            .fail_packet(&packet_id, &attempt.claim_token, "transport: test end")
            .expect("terminal release");
        let snapshot = ledger.admission_snapshot(None).expect("snapshot");
        assert!(
            snapshot.reservations.is_empty(),
            "terminal path releases capacity"
        );
    }

    #[test]
    fn orphaned_controller_attention_does_not_retrigger_foreground_wake() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, _) = seed_packet(&ledger, "orphan-wake");
        let reservation = reserve(
            &ledger,
            AdmissionSubjectKind::Run,
            &run_id,
            "batch-orphan-wake",
            "2000-01-01T00:00:00.000000000Z",
        );
        ledger
            .activate_admission_reservation(
                &reservation.reservation_id,
                "controller",
                &format!("run:{run_id}:1"),
            )
            .expect("own controller reservation");
        ledger
            .record_desired_outcome(
                DesiredSubjectKind::Run,
                &run_id,
                DesiredState::Running,
                crate::types::DesiredReconcileOutcome::Adopted,
                None,
                None,
            )
            .expect("park desired wake");

        let first = ledger
            .mark_expired_admission_orphaned("2030-01-01T00:00:00.000000000Z")
            .expect("first reconcile");
        assert_eq!(first.len(), 1);
        assert_eq!(
            ledger
                .earliest_desired_wake("2030-01-01T00:00:00.000000000Z")
                .expect("earliest wake"),
            None,
            "terminal attention is parked until explicit domain reconciliation"
        );
        ledger
            .mark_expired_admission_orphaned("2030-01-01T00:00:01.000000000Z")
            .expect("repeated reconcile");
        let attention = ledger
            .list_events(Some(&run_id), 0, 100)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "forged.admission.attention")
            .count();
        assert_eq!(attention, 1, "repeated ticks do not duplicate attention");
    }

    #[test]
    fn packet_claim_is_atomically_fenced_by_desired_control_revision() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "paused");
        let reservation = reserve(
            &ledger,
            AdmissionSubjectKind::Packet,
            &packet_id,
            "batch-paused",
            "9999-01-01T00:00:00.000000000Z",
        );
        ledger
            .append_event_controlling_desired(
                DesiredSubjectKind::Run,
                &run_id,
                "forged.run.paused",
                json!({"controlId": "pause-1"}),
                DesiredState::Paused,
            )
            .expect("pause wins");
        let error = ledger
            .claim_packet_with_admission(
                &packet_id,
                "codex:test:1",
                &SpecFence::Sha256("feed".to_owned()),
                &reservation.reservation_id,
            )
            .expect_err("paused run cannot claim");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        assert!(ledger
            .list_live_attempts(None)
            .expect("attempts")
            .is_empty());

        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, &run_id, 1)
            .expect("resume authorization");
        let reservation = reserve(
            &ledger,
            AdmissionSubjectKind::Packet,
            &packet_id,
            "batch-revision",
            "9999-01-01T00:00:00.000000000Z",
        );
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, &run_id, 1)
            .expect("new control revision wins");
        let error = ledger
            .claim_packet_with_admission(
                &packet_id,
                "codex:test:2",
                &SpecFence::Sha256("feed".to_owned()),
                &reservation.reservation_id,
            )
            .expect_err("stale revision cannot claim");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        assert!(ledger
            .list_live_attempts(None)
            .expect("attempts")
            .is_empty());
    }

    #[test]
    fn supervisor_wake_parking_does_not_revoke_a_running_desired_run() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "parked");
        let reservation = reserve(
            &ledger,
            AdmissionSubjectKind::Packet,
            &packet_id,
            "batch-parked",
            "9999-01-01T00:00:00.000000000Z",
        );
        ledger
            .record_desired_outcome(
                DesiredSubjectKind::Run,
                &run_id,
                DesiredState::Running,
                crate::types::DesiredReconcileOutcome::Attention,
                None,
                Some("observe later".to_owned()),
            )
            .expect("park observation");
        let attempt = ledger
            .claim_packet_with_admission(
                &packet_id,
                "codex:test:1",
                &SpecFence::Sha256("feed".to_owned()),
                &reservation.reservation_id,
            )
            .expect("running desired state remains authoritative");
        ledger
            .assert_admitted_attempt_live(&attempt.claim_token)
            .expect("pre-spawn fence ignores supervisor wake metadata");
    }

    #[test]
    fn pre_spawn_fence_distinguishes_stale_token_and_each_moved_admission_leg() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("stale.db")).expect("ledger");
        let (_, packet_id) = seed_packet(&ledger, "stale-leg");
        let (_, attempt) = claim_admitted(&ledger, &packet_id, "batch-stale-leg");
        ledger
            .fail_packet(&packet_id, &attempt.claim_token, "test settlement")
            .expect("settle attempt");
        let before = ledger
            .get_attempt(attempt.attempt_id)
            .expect("attempt before stale fence");
        let error = ledger
            .assert_admitted_attempt_live(&attempt.claim_token)
            .expect_err("terminal token is stale");
        assert!(matches!(
            error,
            LedgerError::Refused {
                code: ErrorCode::StaleClaimToken,
                ..
            }
        ));
        assert_eq!(
            ledger
                .get_attempt(attempt.attempt_id)
                .expect("attempt after"),
            before
        );

        let ledger = Ledger::open(&dir.path().join("control.db")).expect("ledger");
        let (run_id, packet_id) = seed_packet(&ledger, "control-leg");
        let (reservation, attempt) = claim_admitted(&ledger, &packet_id, "batch-control-leg");
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, &run_id, 1)
            .expect("move desired control revision");
        let before = ledger.get_attempt(attempt.attempt_id).expect("before");
        let error = ledger
            .assert_admitted_attempt_live(&attempt.claim_token)
            .expect_err("control revision moved");
        assert_eq!(error.code(), ErrorCode::StaleClaimToken);
        let LedgerError::AdmissionMoved {
            leg,
            reservation: Some(old),
            current: Some(new),
        } = error
        else {
            panic!("expected control AdmissionMoved")
        };
        assert_eq!(leg, crate::AdmissionMoveLeg::Control);
        assert_eq!(old.control_revision, reservation.control_revision);
        assert_eq!(new.control_revision, reservation.control_revision + 1);
        assert_eq!(old.provider, "codex");
        assert_eq!(new.provider, "codex");
        assert_eq!(
            ledger.get_attempt(attempt.attempt_id).expect("after"),
            before
        );

        let path = dir.path().join("reservation.db");
        let ledger = Ledger::open(&path).expect("ledger");
        let (_, packet_id) = seed_packet(&ledger, "reservation-leg");
        let (_, attempt) = claim_admitted(&ledger, &packet_id, "batch-reservation-leg");
        rusqlite::Connection::open(&path)
            .expect("second process")
            .execute(
                "UPDATE admission_reservations SET state = 'released' WHERE owner_id = ?1",
                [attempt.attempt_id.to_string()],
            )
            .expect("remove active reservation");
        let before = ledger.get_attempt(attempt.attempt_id).expect("before");
        let error = ledger
            .assert_admitted_attempt_live(&attempt.claim_token)
            .expect_err("reservation moved");
        assert_eq!(error.code(), ErrorCode::StaleClaimToken);
        let LedgerError::AdmissionMoved {
            leg,
            reservation: None,
            current: Some(current),
        } = error
        else {
            panic!("expected reservation AdmissionMoved")
        };
        assert_eq!(leg, crate::AdmissionMoveLeg::Reservation);
        assert_eq!(current.provider, "codex");
        assert_eq!(
            ledger.get_attempt(attempt.attempt_id).expect("after"),
            before
        );

        let path = dir.path().join("facts.db");
        let ledger = Ledger::open(&path).expect("ledger");
        let (_, packet_id) = seed_packet(&ledger, "facts-leg");
        let (_, attempt) = claim_admitted(&ledger, &packet_id, "batch-facts-leg");
        rusqlite::Connection::open(&path)
            .expect("second process")
            .execute(
                "UPDATE packets SET body_json = json_set(body_json, \
                 '$.providerHints.model', 'revised-model') WHERE packet_id = ?1",
                [&packet_id],
            )
            .expect("revise durable provider facts");
        let before = ledger.get_attempt(attempt.attempt_id).expect("before");
        let error = ledger
            .assert_admitted_attempt_live(&attempt.claim_token)
            .expect_err("effective facts moved");
        assert_eq!(error.code(), ErrorCode::StaleClaimToken);
        let LedgerError::AdmissionMoved {
            leg,
            reservation: Some(old),
            current: Some(new),
        } = error
        else {
            panic!("expected facts AdmissionMoved")
        };
        assert_eq!(leg, crate::AdmissionMoveLeg::Facts);
        assert_eq!(old.model, "gpt-test");
        assert_eq!(new.model, "revised-model");
        assert_eq!(old.control_revision, new.control_revision);
        assert_eq!(
            ledger.get_attempt(attempt.attempt_id).expect("after"),
            before
        );
    }

    #[test]
    fn pre_spawn_fence_rejects_control_or_provider_facts_that_changed_after_claim() {
        for mutation in ["control", "provider"] {
            let dir = tempfile::tempdir().expect("tempdir");
            let path = dir.path().join("state.db");
            let ledger = Ledger::open(&path).expect("ledger");
            let (run_id, packet_id) = seed_packet(&ledger, mutation);
            let (_, attempt) = claim_admitted(&ledger, &packet_id, &format!("batch-{mutation}"));
            match mutation {
                "control" => {
                    ledger
                        .authorize_desired_work(DesiredSubjectKind::Run, &run_id, 1)
                        .expect("advance desired control epoch");
                }
                "provider" => {
                    let connection = rusqlite::Connection::open(&path).expect("second process");
                    connection
                        .execute(
                            "UPDATE packets SET body_json = json_set(body_json, \
                             '$.providerHints.model', 'revised-model') WHERE packet_id = ?1",
                            [&packet_id],
                        )
                        .expect("revise durable provider facts");
                }
                _ => unreachable!(),
            }
            let error = ledger
                .assert_admitted_attempt_live(&attempt.claim_token)
                .expect_err("changed authority cannot cross the pre-spawn fence");
            assert_eq!(error.code(), ErrorCode::StaleClaimToken);
        }
    }

    #[test]
    fn heartbeat_does_not_invalidate_semantic_admission_revision() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (_, packet_id) = seed_packet(&ledger, "heartbeat");
        let (_, attempt) = claim_admitted(&ledger, &packet_id, "batch-heartbeat");
        let before = ledger.admission_snapshot(None).expect("before");
        ledger
            .heartbeat_attempt(&attempt.claim_token)
            .expect("heartbeat");
        let after = ledger.admission_snapshot(None).expect("after");
        assert_eq!(before.ledger_revision, after.ledger_revision);
        assert_eq!(before.capacity, after.capacity);
    }

    #[test]
    fn revision_is_column_scoped_and_usage_insert_is_fenced() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = Ledger::open(&path).expect("ledger");
        let (run_id, _) = seed_packet(&ledger, "revision-scope");
        ledger
            .create_work_item(NewWorkItem {
                work_id: "uncovered-work".to_owned(),
                kind: WorkKind::Task,
                status: WorkStatus::Open,
                priority: None,
                metadata: BTreeMap::new(),
                spec: WorkSpecFields {
                    title: "uncovered".to_owned(),
                    description: String::new(),
                    acceptance_criteria: String::new(),
                    design: String::new(),
                    notes: String::new(),
                },
                cause: WorkRevisionCause::Authored,
            })
            .expect("work note parent");
        let before = ledger.admission_snapshot(None).expect("before");
        let _: u64 = before
            .ledger_revision
            .parse()
            .expect("revision is a stringified integer");

        let connection = rusqlite::Connection::open(&path).expect("second process");
        connection
            .execute(
                "INSERT INTO work_notes \
                 (note_id, work_id, kind, schema, actor, body_json, written_at) \
                 VALUES ('uncovered-note', 'uncovered-work', 'comment', 'comment/1', \
                         'operator', '{}', '2030-01-01T00:00:00Z')",
                [],
            )
            .expect("write genuinely uncovered table");
        let after_note = ledger.admission_snapshot(None).expect("after note");
        assert_eq!(before.ledger_revision, after_note.ledger_revision);

        connection
            .execute(
                "INSERT INTO usage \
                 (run_id, provider, model, input_tokens, output_tokens, ts) \
                 VALUES (?1, 'codex', 'gpt-test', 1, 1, '2030-01-01T00:00:00Z')",
                [&run_id],
            )
            .expect("append admission spend fact");
        let after_usage = ledger.admission_snapshot(None).expect("after usage");
        assert!(
            after_usage
                .ledger_revision
                .parse::<u64>()
                .expect("usage revision")
                > after_note
                    .ledger_revision
                    .parse::<u64>()
                    .expect("note revision")
        );
    }

    #[test]
    fn snapshot_memoizes_effective_facts_per_distinct_packet() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = Ledger::open(&path).expect("ledger");
        let (_, packet_id) = seed_packet(&ledger, "facts-cache");
        ledger
            .claim_packet(
                &packet_id,
                "codex:facts-cache:1",
                &SpecFence::Sha256("feed".to_owned()),
            )
            .expect("reservation-less live attempt");

        let connection = rusqlite::Connection::open(path).expect("snapshot connection");
        let targets = vec![(AdmissionSubjectKind::Packet, packet_id)];
        let mut packet_facts = PacketFactsCache::default();
        assert_eq!(
            requested_packet_facts(&connection, &targets, &mut packet_facts)
                .expect("target packet facts")
                .len(),
            1
        );
        assert_eq!(
            capacity(&connection, &mut packet_facts)
                .expect("capacity")
                .total_active,
            1
        );
        assert_eq!(packet_facts.resolutions, 1);
    }

    #[test]
    fn every_terminal_attempt_path_releases_capacity() {
        for terminal in ["complete", "fail", "reclaim", "stop", "timeout"] {
            let dir = tempfile::tempdir().expect("tempdir");
            let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
            let (_, packet_id) = seed_packet(&ledger, terminal);
            let (_, attempt) = claim_admitted(&ledger, &packet_id, &format!("batch-{terminal}"));
            match terminal {
                "complete" => ledger
                    .complete_packet(
                        &packet_id,
                        &attempt.claim_token,
                        &PacketResult {
                            schema: "forged.result/1".to_owned(),
                            packet_id: packet_id.clone(),
                            outcome: Outcome::Fix {
                                applied: true,
                                summary: "done".to_owned(),
                            },
                        },
                    )
                    .expect("complete"),
                "fail" => ledger
                    .fail_packet(&packet_id, &attempt.claim_token, "failed")
                    .expect("fail"),
                "reclaim" => {
                    ledger
                        .revoke_attempt(attempt.attempt_id, "dead")
                        .expect("revoke");
                    ledger.mark_reclaimed(attempt.attempt_id).expect("reclaim");
                }
                "stop" => {
                    ledger
                        .revoke_attempt_scoped(attempt.attempt_id, "stop", RevokeScope::Attempt)
                        .expect("revoke");
                    ledger.mark_stopped(attempt.attempt_id).expect("stop");
                }
                "timeout" => {
                    ledger
                        .revoke_attempt_scoped(
                            attempt.attempt_id,
                            "deadline: stage deadline exceeded: test",
                            RevokeScope::Deadline,
                        )
                        .expect("revoke");
                    ledger.mark_timed_out(attempt.attempt_id).expect("timeout");
                }
                _ => unreachable!(),
            }
            let snapshot = ledger.admission_snapshot(None).expect("snapshot");
            assert_eq!(snapshot.capacity.total_active, 0, "{terminal}");
            assert!(snapshot.reservations.is_empty(), "{terminal}");
        }
    }

    #[test]
    fn admission_batch_replay_is_exact_and_concurrent_snapshot_loses_cleanly() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let first = Ledger::open(&path).expect("first");
        let second = Ledger::open(&path).expect("second");
        let (run_a, _) = seed_packet(&first, "race-a");
        let (run_b, _) = seed_packet(&first, "race-b");
        let rev_a = first
            .get_desired_work(DesiredSubjectKind::Run, &run_a)
            .expect("desired")
            .expect("row")
            .control_revision;
        let rev_b = first
            .get_desired_work(DesiredSubjectKind::Run, &run_b)
            .expect("desired")
            .expect("row")
            .control_revision;
        let snapshot_a = first.admission_snapshot(None).expect("snapshot a");
        let snapshot_b = second.admission_snapshot(None).expect("snapshot b");
        let write_a = write_for(
            &first,
            snapshot_a,
            AdmissionSubjectKind::Run,
            &run_a,
            rev_a,
            "batch-race-a",
            AdmissionOutcome::Admitted,
            AdmissionReason::CapacityAvailable,
            "9999-01-01T00:00:00.000000000Z",
        );
        let write_b = write_for(
            &second,
            snapshot_b,
            AdmissionSubjectKind::Run,
            &run_b,
            rev_b,
            "batch-race-b",
            AdmissionOutcome::Admitted,
            AdmissionReason::CapacityAvailable,
            "9999-01-01T00:00:00.000000000Z",
        );
        let reserved = first
            .commit_admission_batch(write_a.clone())
            .expect("first commit");
        let replay = first.commit_admission_batch(write_a).expect("exact replay");
        assert_eq!(reserved, replay);
        let error = second
            .commit_admission_batch(write_b)
            .expect_err("stale concurrent snapshot");
        assert_eq!(error.code(), ErrorCode::OperationInProgress);
        assert_eq!(
            first
                .admission_snapshot(None)
                .expect("capacity")
                .capacity
                .total_active,
            1
        );
    }

    #[test]
    fn latest_admission_is_selected_by_append_order_not_caller_clock() {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let (subject_id, _) = seed_packet(&ledger, "clock-regression");
        let decision = |batch: &str, reason: AdmissionReason| AdmissionDecisionV1 {
            schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
            batch_id: batch.to_owned(),
            subject_kind: AdmissionSubjectKind::Run,
            subject_id: subject_id.clone(),
            control_revision: 0,
            repository: "/repo".to_owned(),
            priority: None,
            provider: Some("codex".to_owned()),
            model: Some("gpt".to_owned()),
            resource_class: AdmissionResourceClass::Read,
            outcome: AdmissionOutcome::Deferred,
            reason,
            reason_detail: None,
            policy_revision: "policy".to_owned(),
            evidence: AdmissionCapacityV1::default(),
            next_eligible_wake_at: None,
        };
        let older = decision("batch-appended-first", AdmissionReason::StaleRateLimit);
        let newer = decision("batch-appended-second", AdmissionReason::RateLimitCeiling);
        ledger
            .submit(move |conn| {
                for (id, value, created_at) in [
                    ("decision-first", older, "2099-01-01T00:00:00Z"),
                    ("decision-second", newer, "2000-01-01T00:00:00Z"),
                ] {
                    let reason = serde_json::to_value(value.reason)?;
                    conn.execute(
                        "INSERT INTO admission_batches (batch_id, schema, policy_revision, \
                         ledger_revision, inputs_sha256, inputs_json, as_of, created_at) \
                         VALUES (?1, 'forged.admission-inputs/1', 'policy', 'revision', ?2, \
                         '{}', ?3, ?3)",
                        rusqlite::params![&value.batch_id, "0".repeat(64), created_at],
                    )?;
                    conn.execute(
                        "INSERT INTO admission_decisions (decision_id, batch_id, subject_kind, \
                         subject_id, control_revision, outcome, reason, next_eligible_wake_at, \
                         decision_json, created_at) VALUES (?1, ?2, 'run', ?3, 0, 'deferred', \
                         ?4, NULL, ?5, ?6)",
                        rusqlite::params![
                            id,
                            &value.batch_id,
                            &value.subject_id,
                            reason.as_str().expect("reason string"),
                            serde_json::to_string(&value)?,
                            created_at,
                        ],
                    )?;
                }
                Ok(())
            })
            .expect("seed clock-regressed decisions");

        let latest = ledger
            .latest_admission_decisions(None, None)
            .expect("latest decisions");
        assert_eq!(latest.len(), 1);
        assert_eq!(latest[0].batch_id, "batch-appended-second");
        assert_eq!(
            ledger
                .inventory_snapshot(&[], crate::InventoryUsageSelection::Omit)
                .expect("same-snapshot admission")
                .admission_decisions[0]
                .batch_id,
            "batch-appended-second"
        );
        ledger.close().expect("close");
    }
}
