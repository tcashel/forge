//! Durable ownership and cleanup of Herdr panes created by Forged.
//!
//! Registration commits before command start. Cleanup is a separate,
//! ownership-gated CAS saga: terminal work never depends on a pane-close
//! response, and a lost response converges through exact PANE_NOT_FOUND.

use forged_types::{
    ErrorCode, OwnedHerdrOwnerV1, OwnedHerdrSessionV1, OwnedHerdrSubjectKind,
    OWNED_HERDR_SESSION_SCHEMA_V1,
};
use rusqlite::{Connection, OptionalExtension, Transaction, TransactionBehavior};

use crate::error::{column_decode_error, internal, refused, LedgerError};
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{
    DesiredSubjectKind, OwnedHerdrCleanupReason, OwnedHerdrCleanupRelease, OwnedHerdrCleanupRetry,
    OwnedHerdrCleanupState, OwnedHerdrLifecycleState, OwnedHerdrOwnerKind, OwnedHerdrSessionRow,
};

pub const OWNED_HERDR_CLEANUP_RETRY_BUDGET: u32 = 8;
const MAX_CLEANUP_BACKOFF_SECONDS: u64 = 300;

pub(crate) const COLUMNS: &str = "ownership_id, schema, owner_kind, subject_kind, subject_id, \
    run_id, packet_id, attempt_id, claim_token, controller_generation, pane_id, \
    socket_path, protocol, sentinel_path, lifecycle_state, cleanup_state, \
    cleanup_reason, cleanup_release, cleanup_token, cleanup_lease_until, \
    cleanup_retry_budget, cleanup_retry_used, next_cleanup_at, last_cleanup_error, \
    registered_at, command_started_at, cleanup_requested_at, \
    last_cleanup_attempt_at, released_at, updated_at, layout_id";

fn unsigned_column<T>(row: &rusqlite::Row<'_>, index: usize, what: &str) -> rusqlite::Result<T>
where
    T: TryFrom<i64>,
    <T as TryFrom<i64>>::Error: std::error::Error + Send + Sync + 'static,
{
    let raw = row.get::<_, i64>(index)?;
    T::try_from(raw).map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(
            index,
            rusqlite::types::Type::Integer,
            format!("invalid {what} {raw}: {error}").into(),
        )
    })
}

fn optional_u32(
    row: &rusqlite::Row<'_>,
    index: usize,
    what: &str,
) -> rusqlite::Result<Option<u32>> {
    row.get::<_, Option<i64>>(index)?
        .map(u32::try_from)
        .transpose()
        .map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                index,
                rusqlite::types::Type::Integer,
                format!("invalid {what}: {error}").into(),
            )
        })
}

fn enum_column<T>(row: &rusqlite::Row<'_>, index: usize, what: &str) -> rusqlite::Result<T>
where
    T: for<'a> TryFrom<&'a str, Error = LedgerError>,
{
    let raw = row.get::<_, String>(index)?;
    T::try_from(raw.as_str()).map_err(|_| column_decode_error(index, what, &raw))
}

fn optional_enum_column<T>(
    row: &rusqlite::Row<'_>,
    index: usize,
    what: &str,
) -> rusqlite::Result<Option<T>>
where
    T: for<'a> TryFrom<&'a str, Error = LedgerError>,
{
    row.get::<_, Option<String>>(index)?
        .map(|raw| T::try_from(raw.as_str()).map_err(|_| column_decode_error(index, what, &raw)))
        .transpose()
}

fn subject_kind_column(
    row: &rusqlite::Row<'_>,
    index: usize,
) -> rusqlite::Result<OwnedHerdrSubjectKind> {
    let raw = row.get::<_, String>(index)?;
    match raw.as_str() {
        "run" => Ok(OwnedHerdrSubjectKind::Run),
        "epic" => Ok(OwnedHerdrSubjectKind::Epic),
        _ => Err(column_decode_error(index, "owned Herdr subject kind", &raw)),
    }
}

pub(crate) fn owned_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<OwnedHerdrSessionRow> {
    let schema: String = row.get(1)?;
    if schema != OWNED_HERDR_SESSION_SCHEMA_V1 {
        return Err(column_decode_error(1, "owned Herdr schema", &schema));
    }
    let protocol: u32 = unsigned_column(row, 12, "Herdr protocol")?;
    if protocol != 19 {
        return Err(rusqlite::Error::FromSqlConversionFailure(
            12,
            rusqlite::types::Type::Integer,
            format!("unknown owned Herdr protocol in database: {protocol}").into(),
        ));
    }
    Ok(OwnedHerdrSessionRow {
        ownership_id: row.get(0)?,
        schema,
        owner_kind: enum_column(row, 2, "owned Herdr owner kind")?,
        subject_kind: subject_kind_column(row, 3)?,
        subject_id: row.get(4)?,
        run_id: row.get(5)?,
        packet_id: row.get(6)?,
        attempt_id: row.get(7)?,
        claim_token: row.get(8)?,
        controller_generation: optional_u32(row, 9, "controller generation")?,
        pane_id: row.get(10)?,
        socket_path: row.get(11)?,
        protocol,
        sentinel_path: row.get(13)?,
        lifecycle_state: enum_column(row, 14, "owned Herdr lifecycle state")?,
        cleanup_state: enum_column(row, 15, "owned Herdr cleanup state")?,
        cleanup_reason: optional_enum_column(row, 16, "owned Herdr cleanup reason")?,
        cleanup_release: optional_enum_column(row, 17, "owned Herdr cleanup release")?,
        cleanup_token: row.get(18)?,
        cleanup_lease_until: row.get(19)?,
        cleanup_retry_budget: unsigned_column(row, 20, "cleanup retry budget")?,
        cleanup_retry_used: unsigned_column(row, 21, "cleanup retry usage")?,
        next_cleanup_at: row.get(22)?,
        last_cleanup_error: row.get(23)?,
        registered_at: row.get(24)?,
        command_started_at: row.get(25)?,
        cleanup_requested_at: row.get(26)?,
        last_cleanup_attempt_at: row.get(27)?,
        released_at: row.get(28)?,
        updated_at: row.get(29)?,
        layout_id: row.get(30)?,
    })
}

fn get_tx(
    conn: &Connection,
    ownership_id: &str,
) -> Result<Option<OwnedHerdrSessionRow>, LedgerError> {
    let sql = format!("SELECT {COLUMNS} FROM owned_herdr_sessions WHERE ownership_id = ?1");
    conn.query_row(&sql, [ownership_id], owned_row)
        .optional()
        .map_err(Into::into)
}

fn required_tx(conn: &Connection, ownership_id: &str) -> Result<OwnedHerdrSessionRow, LedgerError> {
    get_tx(conn, ownership_id)?.ok_or_else(|| {
        refused(
            ErrorCode::InvalidRequest,
            format!("no owned Herdr session {ownership_id:?}"),
        )
    })
}

fn desired_kind(kind: OwnedHerdrSubjectKind) -> DesiredSubjectKind {
    match kind {
        OwnedHerdrSubjectKind::Run => DesiredSubjectKind::Run,
        OwnedHerdrSubjectKind::Epic => DesiredSubjectKind::Epic,
    }
}

fn validate_nonempty(value: &str, what: &str) -> Result<(), LedgerError> {
    if value.is_empty() {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!("owned Herdr {what} must not be empty"),
        ));
    }
    Ok(())
}

fn validate_registration_tx(
    conn: &Connection,
    identity: &OwnedHerdrSessionV1,
) -> Result<(), LedgerError> {
    if identity.schema != OWNED_HERDR_SESSION_SCHEMA_V1 {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!("unsupported owned Herdr schema {:?}", identity.schema),
        ));
    }
    for (value, what) in [
        (identity.ownership_id.as_str(), "ownership id"),
        (identity.pane_id.as_str(), "pane id"),
        (identity.socket_path.as_str(), "socket path"),
        (identity.sentinel_path.as_str(), "sentinel path"),
        (identity.owner.subject().id.as_str(), "subject id"),
    ] {
        validate_nonempty(value, what)?;
    }
    if identity.protocol != 19 {
        return Err(refused(
            ErrorCode::InvalidRequest,
            format!("unsupported owned Herdr protocol {}", identity.protocol),
        ));
    }

    match &identity.owner {
        OwnedHerdrOwnerV1::Controller {
            subject,
            generation,
        } => {
            if *generation == 0 {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "owned controller generation must be positive",
                ));
            }
            let desired: Option<(i64, String)> = conn
                .query_row(
                    "SELECT controller_generation, desired_state FROM desired_work \
                     WHERE subject_kind = ?1 AND subject_id = ?2",
                    rusqlite::params![subject.kind.as_str(), subject.id],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .optional()?;
            if desired != Some((i64::from(*generation), "running".to_owned())) {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "owned controller is not the exact running desired epoch",
                ));
            }
        }
        OwnedHerdrOwnerV1::Attempt {
            subject,
            run_id,
            packet_id,
            attempt_id,
            claim_token,
            controller_generation,
        } => {
            validate_nonempty(run_id, "run id")?;
            validate_nonempty(packet_id, "packet id")?;
            validate_nonempty(claim_token, "claim token")?;
            if *attempt_id <= 0 || controller_generation == &Some(0) {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "owned attempt identity has an invalid attempt or generation",
                ));
            }
            let joined: Option<(String, String, String, String)> = conn
                .query_row(
                    "SELECT p.run_id, a.packet_id, a.claim_token, a.state \
                     FROM attempts a JOIN packets p ON p.packet_id = a.packet_id \
                     WHERE a.attempt_id = ?1",
                    [attempt_id],
                    |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
                )
                .optional()?;
            if joined.as_ref()
                != Some(&(
                    run_id.clone(),
                    packet_id.clone(),
                    claim_token.clone(),
                    "running".to_owned(),
                ))
            {
                return Err(refused(
                    ErrorCode::StaleClaimToken,
                    "owned Herdr attempt does not match an exact running attempt",
                ));
            }
            match controller_generation {
                None => {
                    if subject.kind != OwnedHerdrSubjectKind::Run || subject.id != *run_id {
                        return Err(refused(
                            ErrorCode::InvalidRequest,
                            "generation-less attempt must be owned by its direct run",
                        ));
                    }
                }
                Some(generation) => {
                    let authorization =
                        crate::admission::packet_authorization_subject_tx(conn, packet_id)?;
                    if authorization.as_ref()
                        != Some(&(desired_kind(subject.kind), subject.id.clone()))
                    {
                        return Err(refused(
                            ErrorCode::InvalidRequest,
                            "attempt controller subject does not match packet authorization",
                        ));
                    }
                    let current: Option<(i64, String)> = conn
                        .query_row(
                            "SELECT controller_generation, desired_state FROM desired_work \
                             WHERE subject_kind = ?1 AND subject_id = ?2",
                            rusqlite::params![subject.kind.as_str(), subject.id],
                            |row| Ok((row.get(0)?, row.get(1)?)),
                        )
                        .optional()?;
                    if current != Some((i64::from(*generation), "running".to_owned())) {
                        return Err(refused(
                            ErrorCode::OperationInProgress,
                            "attempt controller generation is not the exact running desired epoch",
                        ));
                    }
                }
            }
        }
    }
    if let Some(layout_id) = identity.layout_id.as_deref() {
        validate_nonempty(layout_id, "layout id")?;
        let subject = identity.owner.subject();
        let layout: Option<(String, String, String, i64, String, String)> = conn
            .query_row(
                "SELECT subject_kind, subject_id, socket_path, protocol, \
                        lifecycle_state, cleanup_state \
                 FROM herdr_layouts WHERE layout_id = ?1",
                [layout_id],
                |row| {
                    Ok((
                        row.get(0)?,
                        row.get(1)?,
                        row.get(2)?,
                        row.get(3)?,
                        row.get(4)?,
                        row.get(5)?,
                    ))
                },
            )
            .optional()?;
        if layout
            != Some((
                subject.kind.as_str().to_owned(),
                subject.id.clone(),
                identity.socket_path.clone(),
                i64::from(identity.protocol),
                "registered".to_owned(),
                "not-requested".to_owned(),
            ))
        {
            return Err(refused(
                ErrorCode::OperationInProgress,
                "owned Herdr session does not join the exact active layout",
            ));
        }
    }
    Ok(())
}

fn same_identity(row: &OwnedHerdrSessionRow, identity: &OwnedHerdrSessionV1) -> bool {
    row.identity().is_ok_and(|stored| stored == *identity)
}

struct RegistrationColumns<'a> {
    owner_kind: &'static str,
    subject_kind: &'static str,
    run_id: Option<&'a str>,
    packet_id: Option<&'a str>,
    attempt_id: Option<i64>,
    claim_token: Option<&'a str>,
    generation: Option<u32>,
}

fn registration_columns(identity: &OwnedHerdrSessionV1) -> RegistrationColumns<'_> {
    match &identity.owner {
        OwnedHerdrOwnerV1::Controller {
            subject,
            generation,
        } => RegistrationColumns {
            owner_kind: "controller",
            subject_kind: subject.kind.as_str(),
            run_id: None,
            packet_id: None,
            attempt_id: None,
            claim_token: None,
            generation: Some(*generation),
        },
        OwnedHerdrOwnerV1::Attempt {
            subject,
            run_id,
            packet_id,
            attempt_id,
            claim_token,
            controller_generation,
        } => RegistrationColumns {
            owner_kind: "attempt",
            subject_kind: subject.kind.as_str(),
            run_id: Some(run_id),
            packet_id: Some(packet_id),
            attempt_id: Some(*attempt_id),
            claim_token: Some(claim_token),
            generation: *controller_generation,
        },
    }
}

fn deadline_after(anchor: &str, seconds: u64) -> Result<String, LedgerError> {
    let timestamp: jiff::Timestamp = anchor
        .parse()
        .map_err(|error| internal(format!("invalid cleanup timestamp {anchor:?}: {error}")))?;
    let nanos = i128::from(seconds).saturating_mul(1_000_000_000);
    let deadline =
        jiff::Timestamp::from_nanosecond(timestamp.as_nanosecond().saturating_add(nanos))
            .map_err(|error| internal(format!("cleanup deadline out of range: {error}")))?;
    let rendered = deadline.to_string();
    let body = rendered.strip_suffix('Z').unwrap_or(&rendered);
    let (seconds, fraction) = body.split_once('.').unwrap_or((body, ""));
    Ok(format!(
        "{seconds}.{:0<9}Z",
        &fraction[..fraction.len().min(9)]
    ))
}

fn request_cleanup_tx(
    conn: &Connection,
    ownership_id: &str,
    lifecycle: OwnedHerdrLifecycleState,
    reason: OwnedHerdrCleanupReason,
    now: &str,
) -> Result<OwnedHerdrSessionRow, LedgerError> {
    let before = required_tx(conn, ownership_id)?;
    if before.cleanup_state == OwnedHerdrCleanupState::Released {
        return Ok(before);
    }
    if before.cleanup_state != OwnedHerdrCleanupState::NotRequested {
        if before.cleanup_reason == Some(reason) {
            return Ok(before);
        }
        return Err(refused(
            ErrorCode::IdempotencyConflict,
            format!("owned Herdr session {ownership_id:?} has another cleanup reason"),
        ));
    }
    conn.execute(
        "UPDATE owned_herdr_sessions SET lifecycle_state = ?1, cleanup_state = 'pending', \
           cleanup_reason = ?2, next_cleanup_at = ?3, cleanup_requested_at = ?3, \
           last_cleanup_error = NULL, updated_at = ?3 WHERE ownership_id = ?4 \
           AND cleanup_state = 'not-requested'",
        rusqlite::params![lifecycle.as_str(), reason.as_str(), now, ownership_id],
    )?;
    required_tx(conn, ownership_id)
}

/// Called from the exact attempt-settlement transaction, after the attempt
/// row has become terminal. It cannot create cleanup for a running/revoking
/// attempt and it never changes the settled result.
pub(crate) fn request_attempt_cleanup_tx(
    tx: &Transaction<'_>,
    attempt_id: i64,
    now: &str,
) -> Result<(), LedgerError> {
    let exact: Option<(String, String, String)> = tx
        .query_row(
            "SELECT p.run_id, a.packet_id, a.claim_token FROM attempts a \
             JOIN packets p ON p.packet_id = a.packet_id \
             WHERE a.attempt_id = ?1 AND a.state IN \
                   ('completed','failed','reclaimed','stopped')",
            [attempt_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()?;
    let Some((run_id, packet_id, claim_token)) = exact else {
        return Ok(());
    };
    tx.execute(
        "UPDATE owned_herdr_sessions SET lifecycle_state = 'owner-terminal', \
           cleanup_state = 'pending', cleanup_reason = 'attempt-settled', \
           next_cleanup_at = ?1, cleanup_requested_at = ?1, \
           last_cleanup_error = NULL, updated_at = ?1 \
         WHERE owner_kind = 'attempt' AND attempt_id = ?2 AND run_id = ?3 \
           AND packet_id = ?4 AND claim_token = ?5 \
           AND cleanup_state = 'not-requested'",
        rusqlite::params![now, attempt_id, run_id, packet_id, claim_token],
    )?;
    Ok(())
}

/// Exact controller evidence transition used from a transaction that has
/// already durably established terminal/dead reality.
pub(crate) fn request_controller_cleanup_tx(
    conn: &Connection,
    kind: DesiredSubjectKind,
    subject_id: &str,
    generation: u32,
    reason: OwnedHerdrCleanupReason,
    now: &str,
) -> Result<(), LedgerError> {
    let lifecycle = match reason {
        OwnedHerdrCleanupReason::ControllerTerminal => OwnedHerdrLifecycleState::OwnerTerminal,
        OwnedHerdrCleanupReason::ControllerDead => OwnedHerdrLifecycleState::OwnerDead,
        _ => {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "controller cleanup requires controller terminal/dead evidence",
            ))
        }
    };
    conn.execute(
        "UPDATE owned_herdr_sessions SET lifecycle_state = ?1, cleanup_state = 'pending', \
           cleanup_reason = ?2, next_cleanup_at = ?3, cleanup_requested_at = ?3, \
           last_cleanup_error = NULL, updated_at = ?3 \
         WHERE owner_kind = 'controller' AND subject_kind = ?4 AND subject_id = ?5 \
           AND controller_generation = ?6 AND cleanup_state = 'not-requested'",
        rusqlite::params![
            lifecycle.as_str(),
            reason.as_str(),
            now,
            kind.as_str(),
            subject_id,
            i64::from(generation),
        ],
    )?;
    Ok(())
}

fn cleanup_due(row: &OwnedHerdrSessionRow, now: &str) -> bool {
    match row.cleanup_state {
        OwnedHerdrCleanupState::Pending | OwnedHerdrCleanupState::RetryWait => row
            .next_cleanup_at
            .as_deref()
            .is_some_and(|wake| wake <= now),
        OwnedHerdrCleanupState::Leased => row
            .cleanup_lease_until
            .as_deref()
            .is_some_and(|lease| lease <= now),
        OwnedHerdrCleanupState::NotRequested
        | OwnedHerdrCleanupState::Attention
        | OwnedHerdrCleanupState::Released => false,
    }
}

fn exact_attempt_terminal_tx(
    conn: &Connection,
    row: &OwnedHerdrSessionRow,
) -> Result<bool, LedgerError> {
    let (Some(run_id), Some(packet_id), Some(attempt_id), Some(claim_token)) = (
        row.run_id.as_deref(),
        row.packet_id.as_deref(),
        row.attempt_id,
        row.claim_token.as_deref(),
    ) else {
        return Ok(false);
    };
    let exact: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM attempts a \
         JOIN packets p ON p.packet_id = a.packet_id \
         WHERE a.attempt_id = ?1 AND a.claim_token = ?2 AND a.packet_id = ?3 \
           AND p.run_id = ?4 AND a.state IN ('completed','failed','reclaimed','stopped'))",
        rusqlite::params![attempt_id, claim_token, packet_id, run_id],
        |result| result.get(0),
    )?;
    if !exact {
        return Ok(false);
    }
    let Some(generation) = row.controller_generation else {
        return Ok(row.subject_kind == OwnedHerdrSubjectKind::Run && row.subject_id == run_id);
    };
    let authorization = crate::admission::packet_authorization_subject_tx(conn, packet_id)?;
    if authorization != Some((desired_kind(row.subject_kind), row.subject_id.clone())) {
        return Ok(false);
    }
    let current: Option<i64> = conn
        .query_row(
            "SELECT controller_generation FROM desired_work \
             WHERE subject_kind = ?1 AND subject_id = ?2",
            rusqlite::params![row.subject_kind.as_str(), row.subject_id],
            |result| result.get(0),
        )
        .optional()?;
    Ok(current.is_some_and(|value| value >= i64::from(generation)))
}

fn exact_controller_settled_tx(
    conn: &Connection,
    row: &OwnedHerdrSessionRow,
) -> Result<bool, LedgerError> {
    let Some(generation) = row.controller_generation else {
        return Ok(false);
    };
    let current: Option<(i64, String)> = conn
        .query_row(
            "SELECT controller_generation, desired_state FROM desired_work \
             WHERE subject_kind = ?1 AND subject_id = ?2",
            rusqlite::params![row.subject_kind.as_str(), row.subject_id],
            |result| Ok((result.get(0)?, result.get(1)?)),
        )
        .optional()?;
    Ok(match (row.lifecycle_state, row.cleanup_reason) {
        (
            OwnedHerdrLifecycleState::OwnerTerminal,
            Some(OwnedHerdrCleanupReason::ControllerTerminal),
        ) => current
            .is_some_and(|(value, state)| value == i64::from(generation) && state == "stopped"),
        (OwnedHerdrLifecycleState::OwnerDead, Some(OwnedHerdrCleanupReason::ControllerDead)) => {
            current.is_some_and(|(value, _)| value >= i64::from(generation))
        }
        _ => false,
    })
}

fn cleanup_eligible_tx(conn: &Connection, row: &OwnedHerdrSessionRow) -> Result<bool, LedgerError> {
    if row.lifecycle_state == OwnedHerdrLifecycleState::Registered
        && row.cleanup_reason == Some(OwnedHerdrCleanupReason::CommandNotStarted)
    {
        return Ok(true);
    }
    match row.owner_kind {
        OwnedHerdrOwnerKind::Attempt => exact_attempt_terminal_tx(conn, row),
        OwnedHerdrOwnerKind::Controller => exact_controller_settled_tx(conn, row),
    }
}

impl Ledger {
    /// Register the exact pane identity before Herdr receives a Forged
    /// command. Exact replay returns the existing row; any competing identity
    /// for the same owner, pane, or sentinel refuses.
    pub fn register_owned_herdr_session(
        &self,
        identity: &OwnedHerdrSessionV1,
    ) -> Result<OwnedHerdrSessionRow, LedgerError> {
        let identity = identity.clone();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            validate_registration_tx(&tx, &identity)?;
            if let Some(existing) = get_tx(&tx, &identity.ownership_id)? {
                if same_identity(&existing, &identity) {
                    tx.commit()?;
                    return Ok(existing);
                }
                return Err(refused(
                    ErrorCode::IdempotencyConflict,
                    format!(
                        "owned Herdr ownership id {:?} has a different identity",
                        identity.ownership_id
                    ),
                ));
            }

            let columns = registration_columns(&identity);
            let subject_id = identity.owner.subject().id.clone();
            let now = now_iso();
            let inserted = tx.execute(
                "INSERT INTO owned_herdr_sessions (
                   ownership_id, schema, owner_kind, subject_kind, subject_id,
                   run_id, packet_id, attempt_id, claim_token, controller_generation,
                   pane_id, socket_path, protocol, sentinel_path, lifecycle_state,
                   cleanup_state, cleanup_retry_budget, cleanup_retry_used,
                   registered_at, updated_at, layout_id
                 ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10,
                           ?11, ?12, ?13, ?14, 'registered', 'not-requested',
                           ?15, 0, ?16, ?16, ?17)",
                rusqlite::params![
                    identity.ownership_id,
                    identity.schema,
                    columns.owner_kind,
                    columns.subject_kind,
                    subject_id,
                    columns.run_id,
                    columns.packet_id,
                    columns.attempt_id,
                    columns.claim_token,
                    columns.generation.map(i64::from),
                    identity.pane_id,
                    identity.socket_path,
                    i64::from(identity.protocol),
                    identity.sentinel_path,
                    i64::from(OWNED_HERDR_CLEANUP_RETRY_BUDGET),
                    now,
                    identity.layout_id,
                ],
            );
            if let Err(error) = inserted {
                if matches!(
                    error,
                    rusqlite::Error::SqliteFailure(
                        rusqlite::ffi::Error {
                            code: rusqlite::ErrorCode::ConstraintViolation,
                            ..
                        },
                        _
                    )
                ) {
                    return Err(refused(
                        ErrorCode::IdempotencyConflict,
                        "a different owned Herdr identity already occupies this owner or pane",
                    ));
                }
                return Err(error.into());
            }
            let row = required_tx(&tx, &identity.ownership_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    pub fn get_owned_herdr_session(
        &self,
        ownership_id: &str,
    ) -> Result<Option<OwnedHerdrSessionRow>, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        self.submit(move |conn| get_tx(conn, &ownership_id))
    }

    pub fn find_owned_herdr_attempt(
        &self,
        attempt_id: i64,
        claim_token: &str,
    ) -> Result<Option<OwnedHerdrSessionRow>, LedgerError> {
        let claim_token = claim_token.to_owned();
        self.submit(move |conn| {
            let sql = format!(
                "SELECT {COLUMNS} FROM owned_herdr_sessions WHERE owner_kind = 'attempt' \
                 AND attempt_id = ?1 AND claim_token = ?2"
            );
            conn.query_row(&sql, rusqlite::params![attempt_id, claim_token], owned_row)
                .optional()
                .map_err(Into::into)
        })
    }

    pub fn find_owned_herdr_controller(
        &self,
        kind: DesiredSubjectKind,
        subject_id: &str,
        generation: u32,
    ) -> Result<Option<OwnedHerdrSessionRow>, LedgerError> {
        let subject_id = subject_id.to_owned();
        self.submit(move |conn| {
            let sql = format!(
                "SELECT {COLUMNS} FROM owned_herdr_sessions WHERE owner_kind = 'controller' \
                 AND subject_kind = ?1 AND subject_id = ?2 AND controller_generation = ?3"
            );
            conn.query_row(
                &sql,
                rusqlite::params![kind.as_str(), subject_id, i64::from(generation)],
                owned_row,
            )
            .optional()
            .map_err(Into::into)
        })
    }

    pub fn list_unreleased_owned_herdr_controllers(
        &self,
    ) -> Result<Vec<OwnedHerdrSessionRow>, LedgerError> {
        self.submit(move |conn| {
            let sql = format!(
                "SELECT {COLUMNS} FROM owned_herdr_sessions WHERE owner_kind = 'controller' \
                 AND cleanup_state != 'released' \
                 ORDER BY subject_kind, subject_id, controller_generation"
            );
            let mut statement = conn.prepare(&sql)?;
            let rows = statement.query_map([], owned_row)?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }

    /// Durable publication marker after the command was successfully sent.
    pub fn mark_owned_herdr_command_started(
        &self,
        ownership_id: &str,
    ) -> Result<OwnedHerdrSessionRow, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &ownership_id)?;
            if before.lifecycle_state == OwnedHerdrLifecycleState::CommandStarted {
                tx.commit()?;
                return Ok(before);
            }
            if before.lifecycle_state != OwnedHerdrLifecycleState::Registered
                || before.cleanup_state != OwnedHerdrCleanupState::NotRequested
            {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "owned Herdr session is already terminal or cleaning up",
                ));
            }
            let now = now_iso();
            tx.execute(
                "UPDATE owned_herdr_sessions SET lifecycle_state = 'command-started', \
                 command_started_at = ?1, updated_at = ?1 WHERE ownership_id = ?2 \
                 AND lifecycle_state = 'registered' AND cleanup_state = 'not-requested'",
                rusqlite::params![now, ownership_id],
            )?;
            let row = required_tx(&tx, &ownership_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Cleanup a reserved pane into which no Forged command was sent.
    pub fn request_abandoned_owned_herdr_cleanup(
        &self,
        ownership_id: &str,
    ) -> Result<OwnedHerdrSessionRow, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &ownership_id)?;
            if before.lifecycle_state != OwnedHerdrLifecycleState::Registered
                && before.cleanup_reason != Some(OwnedHerdrCleanupReason::CommandNotStarted)
            {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "cannot abandon an owned Herdr command that started",
                ));
            }
            let row = request_cleanup_tx(
                &tx,
                &ownership_id,
                OwnedHerdrLifecycleState::Registered,
                OwnedHerdrCleanupReason::CommandNotStarted,
                &now_iso(),
            )?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Persist exact controller terminal/dead evidence supplied only after
    /// the core's confirmed controller observation.
    pub fn request_owned_herdr_controller_cleanup(
        &self,
        ownership_id: &str,
        kind: DesiredSubjectKind,
        subject_id: &str,
        generation: u32,
        reason: OwnedHerdrCleanupReason,
    ) -> Result<OwnedHerdrSessionRow, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        let subject_id = subject_id.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &ownership_id)?;
            if before.owner_kind != OwnedHerdrOwnerKind::Controller
                || before.subject_kind.as_str() != kind.as_str()
                || before.subject_id != subject_id
                || before.controller_generation != Some(generation)
            {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "controller cleanup identity does not exactly match ownership",
                ));
            }
            let current: Option<(i64, String)> = tx
                .query_row(
                    "SELECT controller_generation, desired_state FROM desired_work \
                     WHERE subject_kind = ?1 AND subject_id = ?2",
                    rusqlite::params![kind.as_str(), subject_id],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .optional()?;
            let durable = match reason {
                OwnedHerdrCleanupReason::ControllerTerminal => {
                    current.as_ref().is_some_and(|(value, state)| {
                        *value == i64::from(generation) && state == "stopped"
                    })
                }
                OwnedHerdrCleanupReason::ControllerDead => current
                    .as_ref()
                    .is_some_and(|(value, _)| *value >= i64::from(generation)),
                _ => false,
            };
            if !durable {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "controller cleanup has no matching durable desired epoch",
                ));
            }
            request_controller_cleanup_tx(&tx, kind, &subject_id, generation, reason, &now_iso())?;
            let row = required_tx(&tx, &ownership_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Due cleanup candidates in canonical order. This inventory is wholly
    /// independent of desired-work runnable state.
    pub fn list_due_owned_herdr_cleanup(
        &self,
        now: &str,
        limit: u32,
    ) -> Result<Vec<OwnedHerdrSessionRow>, LedgerError> {
        let now = now.to_owned();
        self.submit(move |conn| {
            if limit == 0 {
                return Ok(Vec::new());
            }
            let sql = format!(
                "SELECT {COLUMNS} FROM owned_herdr_sessions \
                 WHERE cleanup_state IN ('pending','leased','retry-wait') \
                 ORDER BY COALESCE(next_cleanup_at, cleanup_lease_until), ownership_id"
            );
            let mut statement = conn.prepare(&sql)?;
            let rows = statement.query_map([], owned_row)?;
            let mut due = Vec::new();
            for row in rows {
                let row = row?;
                if cleanup_due(&row, &now) && cleanup_eligible_tx(conn, &row)? {
                    due.push(row);
                    if due.len() == limit as usize {
                        break;
                    }
                }
            }
            Ok(due)
        })
    }

    /// Claim one exact due cleanup under a cross-process lease. An expired
    /// lease is reclaimable; a live lease cannot be stolen.
    pub fn claim_owned_herdr_cleanup(
        &self,
        ownership_id: &str,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<Option<OwnedHerdrSessionRow>, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            if token.is_empty() || lease_until <= now {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "cleanup token must be non-empty and lease must be in the future",
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let Some(before) = get_tx(&tx, &ownership_id)? else {
                tx.commit()?;
                return Ok(None);
            };
            if !cleanup_due(&before, &now) || !cleanup_eligible_tx(&tx, &before)? {
                tx.commit()?;
                return Ok(None);
            }
            let affected = tx.execute(
                "UPDATE owned_herdr_sessions SET cleanup_state = 'leased', \
                   cleanup_token = ?1, cleanup_lease_until = ?2, next_cleanup_at = NULL, \
                   last_cleanup_attempt_at = ?3, updated_at = ?3 \
                 WHERE ownership_id = ?4 AND (
                   (cleanup_state IN ('pending','retry-wait') AND next_cleanup_at <= ?3)
                   OR (cleanup_state = 'leased' AND cleanup_lease_until <= ?3)
                 )",
                rusqlite::params![token, lease_until, now, ownership_id],
            )?;
            let row = if affected == 1 {
                get_tx(&tx, &ownership_id)?
            } else {
                None
            };
            tx.commit()?;
            Ok(row)
        })
    }

    /// Acknowledged close and exact PANE_NOT_FOUND both converge to release.
    pub fn ack_owned_herdr_cleanup(
        &self,
        ownership_id: &str,
        token: &str,
        release: OwnedHerdrCleanupRelease,
    ) -> Result<OwnedHerdrSessionRow, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        let token = token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &ownership_id)?;
            if before.cleanup_state == OwnedHerdrCleanupState::Released {
                if before.cleanup_release == Some(release) {
                    tx.commit()?;
                    return Ok(before);
                }
                return Err(refused(
                    ErrorCode::IdempotencyConflict,
                    "owned Herdr cleanup was released with another outcome",
                ));
            }
            if before.cleanup_state != OwnedHerdrCleanupState::Leased
                || before.cleanup_token.as_deref() != Some(&token)
            {
                return Err(refused(
                    ErrorCode::StaleClaimToken,
                    "owned Herdr cleanup lease is not held by this token",
                ));
            }
            let now = now_iso();
            tx.execute(
                "UPDATE owned_herdr_sessions SET cleanup_state = 'released', \
                   cleanup_release = ?1, cleanup_token = NULL, cleanup_lease_until = NULL, \
                   next_cleanup_at = NULL, last_cleanup_error = NULL, released_at = ?2, \
                   updated_at = ?2 WHERE ownership_id = ?3 AND cleanup_state = 'leased' \
                   AND cleanup_token = ?4",
                rusqlite::params![release.as_str(), now, ownership_id, token],
            )?;
            let row = required_tx(&tx, &ownership_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Persist a transient close failure. Backoff grows exponentially and is
    /// capped; the finite budget eventually parks the row in attention.
    pub fn retry_owned_herdr_cleanup(
        &self,
        ownership_id: &str,
        token: &str,
        now: &str,
        error: &str,
    ) -> Result<OwnedHerdrCleanupRetry, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let error = error.to_owned();
        self.submit(move |conn| {
            if error.is_empty() {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "cleanup retry error must not be empty",
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &ownership_id)?;
            if before.cleanup_state != OwnedHerdrCleanupState::Leased
                || before.cleanup_token.as_deref() != Some(&token)
            {
                return Err(refused(
                    ErrorCode::StaleClaimToken,
                    "owned Herdr cleanup lease is not held by this token",
                ));
            }
            let used = before.cleanup_retry_used.saturating_add(1);
            let exhausted = used >= before.cleanup_retry_budget;
            let next = if exhausted {
                None
            } else {
                let power = used.saturating_sub(1).min(31);
                let seconds = (1_u64 << power).min(MAX_CLEANUP_BACKOFF_SECONDS);
                Some(deadline_after(&now, seconds)?)
            };
            tx.execute(
                "UPDATE owned_herdr_sessions SET cleanup_state = ?1, cleanup_token = NULL, \
                   cleanup_lease_until = NULL, cleanup_retry_used = ?2, \
                   next_cleanup_at = ?3, last_cleanup_error = ?4, updated_at = ?5 \
                 WHERE ownership_id = ?6 AND cleanup_state = 'leased' \
                   AND cleanup_token = ?7",
                rusqlite::params![
                    if exhausted { "attention" } else { "retry-wait" },
                    i64::from(used.min(before.cleanup_retry_budget)),
                    next,
                    error,
                    now,
                    ownership_id,
                    token,
                ],
            )?;
            let row = required_tx(&tx, &ownership_id)?;
            tx.commit()?;
            Ok(if exhausted {
                OwnedHerdrCleanupRetry::Exhausted(row)
            } else {
                OwnedHerdrCleanupRetry::Scheduled(row)
            })
        })
    }

    /// Earliest eligible cleanup deadline. Expired leases return `now` once,
    /// not their stale past deadline; attention/released rows are excluded.
    pub fn earliest_owned_herdr_cleanup_wake(
        &self,
        now: &str,
    ) -> Result<Option<String>, LedgerError> {
        let now = now.to_owned();
        self.submit(move |conn| {
            let sql = format!(
                "SELECT {COLUMNS} FROM owned_herdr_sessions \
                 WHERE cleanup_state IN ('pending','leased','retry-wait')"
            );
            let mut statement = conn.prepare(&sql)?;
            let rows = statement.query_map([], owned_row)?;
            let mut earliest: Option<String> = None;
            for row in rows {
                let row = row?;
                if !cleanup_eligible_tx(conn, &row)? {
                    continue;
                }
                let deadline = match row.cleanup_state {
                    OwnedHerdrCleanupState::Leased => row.cleanup_lease_until,
                    OwnedHerdrCleanupState::Pending | OwnedHerdrCleanupState::RetryWait => {
                        row.next_cleanup_at
                    }
                    _ => None,
                };
                if let Some(deadline) = deadline {
                    let bounded = if deadline <= now {
                        now.clone()
                    } else {
                        deadline
                    };
                    if earliest.as_ref().is_none_or(|current| bounded < *current) {
                        earliest = Some(bounded);
                    }
                }
            }
            Ok(earliest)
        })
    }
}
