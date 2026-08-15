//! Durable per-subject Herdr tabs, placement leases, and root cleanup.
//!
//! Labels never grant authority. Every effect is addressed by the exact
//! socket/protocol/workspace/tab/root tuple returned by Herdr protocol 19.

use forged_types::{
    ErrorCode, HerdrLayoutSubjectKind, HerdrLayoutSubjectV1, HerdrLayoutV1,
    HERDR_LAYOUT_LABEL_MAX_BYTES, HERDR_LAYOUT_SCHEMA_V1,
};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior};

use crate::error::{column_decode_error, internal, refused, LedgerError};
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{
    HerdrLayoutCleanupReason, HerdrLayoutCleanupRelease, HerdrLayoutCleanupRetry,
    HerdrLayoutCleanupState, HerdrLayoutCreation, HerdrLayoutDegradationReason,
    HerdrLayoutLifecycleState, HerdrLayoutRow,
};

pub const HERDR_LAYOUT_CLEANUP_RETRY_BUDGET: u32 = 8;
const MAX_CLEANUP_BACKOFF_SECONDS: u64 = 300;

const COLUMNS: &str = "layout_id, schema, revision, subject_kind, subject_id, \
    socket_path, protocol, workspace_id, tab_id, root_pane_id, display_label, \
    lifecycle_state, degradation_reason, last_error, creation_token, \
    creation_lease_until, mutation_token, mutation_lease_until, cleanup_state, \
    cleanup_reason, cleanup_release, cleanup_token, cleanup_lease_until, \
    cleanup_retry_budget, cleanup_retry_used, next_cleanup_at, last_cleanup_error, \
    predecessor_layout_id, created_at, registered_at, replaced_at, \
    cleanup_requested_at, last_cleanup_attempt_at, released_at, updated_at";

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
) -> rusqlite::Result<HerdrLayoutSubjectKind> {
    let raw = row.get::<_, String>(index)?;
    match raw.as_str() {
        "run" => Ok(HerdrLayoutSubjectKind::Run),
        "epic" => Ok(HerdrLayoutSubjectKind::Epic),
        _ => Err(column_decode_error(
            index,
            "Herdr layout subject kind",
            &raw,
        )),
    }
}

fn layout_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<HerdrLayoutRow> {
    Ok(HerdrLayoutRow {
        layout_id: row.get(0)?,
        schema: row.get(1)?,
        revision: unsigned_column(row, 2, "layout revision")?,
        subject_kind: subject_kind_column(row, 3)?,
        subject_id: row.get(4)?,
        socket_path: row.get(5)?,
        protocol: unsigned_column(row, 6, "Herdr protocol")?,
        workspace_id: row.get(7)?,
        tab_id: row.get(8)?,
        root_pane_id: row.get(9)?,
        display_label: row.get(10)?,
        lifecycle_state: enum_column(row, 11, "Herdr layout lifecycle")?,
        degradation_reason: optional_enum_column(row, 12, "Herdr layout degradation")?,
        last_error: row.get(13)?,
        creation_token: row.get(14)?,
        creation_lease_until: row.get(15)?,
        mutation_token: row.get(16)?,
        mutation_lease_until: row.get(17)?,
        cleanup_state: enum_column(row, 18, "Herdr layout cleanup state")?,
        cleanup_reason: optional_enum_column(row, 19, "Herdr layout cleanup reason")?,
        cleanup_release: optional_enum_column(row, 20, "Herdr layout cleanup release")?,
        cleanup_token: row.get(21)?,
        cleanup_lease_until: row.get(22)?,
        cleanup_retry_budget: unsigned_column(row, 23, "layout cleanup retry budget")?,
        cleanup_retry_used: unsigned_column(row, 24, "layout cleanup retry usage")?,
        next_cleanup_at: row.get(25)?,
        last_cleanup_error: row.get(26)?,
        predecessor_layout_id: row.get(27)?,
        created_at: row.get(28)?,
        registered_at: row.get(29)?,
        replaced_at: row.get(30)?,
        cleanup_requested_at: row.get(31)?,
        last_cleanup_attempt_at: row.get(32)?,
        released_at: row.get(33)?,
        updated_at: row.get(34)?,
    })
}

fn get_tx(conn: &Connection, layout_id: &str) -> Result<Option<HerdrLayoutRow>, LedgerError> {
    let sql = format!("SELECT {COLUMNS} FROM herdr_layouts WHERE layout_id = ?1");
    conn.query_row(&sql, [layout_id], layout_row)
        .optional()
        .map_err(Into::into)
}

fn required_tx(conn: &Connection, layout_id: &str) -> Result<HerdrLayoutRow, LedgerError> {
    get_tx(conn, layout_id)?.ok_or_else(|| {
        refused(
            ErrorCode::InvalidRequest,
            format!("unknown Herdr layout {layout_id:?}"),
        )
    })
}

fn active_tx(
    conn: &Connection,
    subject: &HerdrLayoutSubjectV1,
    socket_path: &str,
    protocol: u32,
) -> Result<Option<HerdrLayoutRow>, LedgerError> {
    let sql = format!(
        "SELECT {COLUMNS} FROM herdr_layouts \
         WHERE subject_kind = ?1 AND subject_id = ?2 AND socket_path = ?3 \
           AND protocol = ?4 AND lifecycle_state IN ('creating','registered')"
    );
    conn.query_row(
        &sql,
        rusqlite::params![
            subject.kind.as_str(),
            subject.id,
            socket_path,
            i64::from(protocol)
        ],
        layout_row,
    )
    .optional()
    .map_err(Into::into)
}

#[allow(clippy::too_many_arguments)]
fn validate_creation(
    conn: &Connection,
    subject: &HerdrLayoutSubjectV1,
    socket_path: &str,
    protocol: u32,
    workspace_id: &str,
    display_label: &str,
    token: &str,
    now: &str,
    lease_until: &str,
) -> Result<(), LedgerError> {
    for (value, what) in [
        (subject.id.as_str(), "subject id"),
        (socket_path, "socket path"),
        (workspace_id, "workspace id"),
        (display_label, "display label"),
        (token, "creation token"),
    ] {
        if value.trim().is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                format!("Herdr layout {what} must not be empty"),
            ));
        }
    }
    if protocol != 19 || display_label.len() > HERDR_LAYOUT_LABEL_MAX_BYTES {
        return Err(refused(
            ErrorCode::InvalidRequest,
            "Herdr layout protocol or display label is invalid",
        ));
    }
    if lease_until <= now {
        return Err(refused(
            ErrorCode::InvalidRequest,
            "Herdr layout creation lease must be in the future",
        ));
    }
    let identity_exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM work_identities \
         WHERE subject_kind = ?1 AND subject_id = ?2)",
        rusqlite::params![subject.kind.as_str(), subject.id],
        |row| row.get(0),
    )?;
    if !identity_exists {
        return Err(refused(
            ErrorCode::InvalidRequest,
            "Herdr layout subject has no durable WorkIdentityV1",
        ));
    }
    Ok(())
}

#[allow(clippy::too_many_arguments)]
fn insert_creation_tx(
    conn: &Connection,
    subject: &HerdrLayoutSubjectV1,
    socket_path: &str,
    protocol: u32,
    workspace_id: &str,
    display_label: &str,
    token: &str,
    now: &str,
    lease_until: &str,
    predecessor: Option<&str>,
) -> Result<HerdrLayoutRow, LedgerError> {
    let revision: i64 = conn.query_row(
        "SELECT COALESCE(MAX(revision), 0) + 1 FROM herdr_layouts \
         WHERE subject_kind = ?1 AND subject_id = ?2 \
           AND socket_path = ?3 AND protocol = ?4",
        rusqlite::params![
            subject.kind.as_str(),
            subject.id,
            socket_path,
            i64::from(protocol)
        ],
        |row| row.get(0),
    )?;
    let layout_id = uuid::Uuid::now_v7().to_string();
    conn.execute(
        "INSERT INTO herdr_layouts (
           layout_id, schema, revision, subject_kind, subject_id, socket_path,
           protocol, workspace_id, display_label, lifecycle_state,
           creation_token, creation_lease_until, cleanup_state,
           cleanup_retry_budget, cleanup_retry_used, predecessor_layout_id,
           created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'creating',
                   ?10, ?11, 'not-requested', ?12, 0, ?13, ?14, ?14)",
        rusqlite::params![
            layout_id,
            HERDR_LAYOUT_SCHEMA_V1,
            revision,
            subject.kind.as_str(),
            subject.id,
            socket_path,
            i64::from(protocol),
            workspace_id,
            display_label,
            token,
            lease_until,
            i64::from(HERDR_LAYOUT_CLEANUP_RETRY_BUDGET),
            predecessor,
            now,
        ],
    )?;
    required_tx(conn, &layout_id)
}

fn deadline_after(anchor: &str, seconds: u64) -> Result<String, LedgerError> {
    let timestamp: jiff::Timestamp = anchor
        .parse()
        .map_err(|error| internal(format!("invalid layout timestamp {anchor:?}: {error}")))?;
    let nanos = i128::from(seconds).saturating_mul(1_000_000_000);
    let deadline =
        jiff::Timestamp::from_nanosecond(timestamp.as_nanosecond().saturating_add(nanos))
            .map_err(|error| internal(format!("layout deadline out of range: {error}")))?;
    let rendered = deadline.to_string();
    let body = rendered.strip_suffix('Z').unwrap_or(&rendered);
    let (seconds, fraction) = body.split_once('.').unwrap_or((body, ""));
    Ok(format!(
        "{seconds}.{:0<9}Z",
        &fraction[..fraction.len().min(9)]
    ))
}

fn same_registration(row: &HerdrLayoutRow, requested: &HerdrLayoutV1) -> bool {
    row.identity().is_ok_and(|stored| stored == *requested)
}

impl Ledger {
    /// Reserve `tab.create` before the effect. An expired reservation is
    /// ambiguous, never replayed: it becomes durable attention and a new
    /// revision is reserved without adopting any label-matched tab.
    #[allow(clippy::too_many_arguments)]
    pub fn reserve_herdr_layout_creation(
        &self,
        subject: HerdrLayoutSubjectV1,
        socket_path: &str,
        protocol: u32,
        workspace_id: &str,
        display_label: &str,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<HerdrLayoutCreation, LedgerError> {
        let socket_path = socket_path.to_owned();
        let workspace_id = workspace_id.to_owned();
        let display_label = display_label.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            validate_creation(
                &tx,
                &subject,
                &socket_path,
                protocol,
                &workspace_id,
                &display_label,
                &token,
                &now,
                &lease_until,
            )?;
            let mut predecessor = None;
            if let Some(existing) = active_tx(&tx, &subject, &socket_path, protocol)? {
                match existing.lifecycle_state {
                    HerdrLayoutLifecycleState::Registered => {
                        tx.commit()?;
                        return Ok(HerdrLayoutCreation::Existing(existing));
                    }
                    HerdrLayoutLifecycleState::Creating
                        if existing
                            .creation_lease_until
                            .as_deref()
                            .is_some_and(|until| until > now.as_str()) =>
                    {
                        tx.commit()?;
                        return Ok(HerdrLayoutCreation::Contended(existing));
                    }
                    HerdrLayoutLifecycleState::Creating => {
                        let detail = "layout creation lease expired with an unknown tab.create outcome";
                        tx.execute(
                            "UPDATE herdr_layouts SET lifecycle_state = 'degraded',
                               degradation_reason = 'creation-ambiguous', last_error = ?1,
                               creation_token = NULL, creation_lease_until = NULL,
                               cleanup_state = 'attention', last_cleanup_error = ?1,
                               updated_at = ?2 WHERE layout_id = ?3 AND lifecycle_state = 'creating'",
                            rusqlite::params![detail, now, existing.layout_id],
                        )?;
                        predecessor = Some(existing.layout_id);
                    }
                    _ => unreachable!("active index contains only creating or registered"),
                }
            }
            if predecessor.is_none() {
                predecessor = tx
                    .query_row(
                        "SELECT layout_id FROM herdr_layouts
                         WHERE subject_kind = ?1 AND subject_id = ?2
                           AND socket_path = ?3 AND protocol = ?4
                         ORDER BY revision DESC LIMIT 1",
                        rusqlite::params![
                            subject.kind.as_str(),
                            subject.id,
                            socket_path,
                            i64::from(protocol)
                        ],
                        |row| row.get(0),
                    )
                    .optional()?;
            }
            let row = insert_creation_tx(
                &tx,
                &subject,
                &socket_path,
                protocol,
                &workspace_id,
                &display_label,
                &token,
                &now,
                &lease_until,
                predecessor.as_deref(),
            )?;
            tx.commit()?;
            Ok(HerdrLayoutCreation::Reserved(row))
        })
    }

    /// Retire a verified-missing/mismatched locator and reserve exactly one
    /// successor. Existing linked panes retain the predecessor id.
    #[allow(clippy::too_many_arguments)]
    pub fn replace_herdr_layout(
        &self,
        layout_id: &str,
        reason: HerdrLayoutDegradationReason,
        detail: &str,
        workspace_id: &str,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<HerdrLayoutCreation, LedgerError> {
        if !matches!(
            reason,
            HerdrLayoutDegradationReason::VerificationMissing
                | HerdrLayoutDegradationReason::VerificationMismatch
        ) {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "layout replacement requires exact verification failure",
            ));
        }
        let layout_id = layout_id.to_owned();
        let detail = detail.to_owned();
        let workspace_id = workspace_id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &layout_id)?;
            validate_creation(
                &tx,
                &HerdrLayoutSubjectV1 {
                    kind: before.subject_kind,
                    id: before.subject_id.clone(),
                },
                &before.socket_path,
                before.protocol,
                &workspace_id,
                &before.display_label,
                &token,
                &now,
                &lease_until,
            )?;
            let subject = HerdrLayoutSubjectV1 {
                kind: before.subject_kind,
                id: before.subject_id.clone(),
            };
            if before.lifecycle_state != HerdrLayoutLifecycleState::Registered {
                if let Some(active) =
                    active_tx(&tx, &subject, &before.socket_path, before.protocol)?
                {
                    let result = if active.lifecycle_state == HerdrLayoutLifecycleState::Registered
                    {
                        HerdrLayoutCreation::Existing(active)
                    } else {
                        HerdrLayoutCreation::Contended(active)
                    };
                    tx.commit()?;
                    return Ok(result);
                }
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "Herdr layout is no longer the active registered locator",
                ));
            }
            tx.execute(
                "UPDATE herdr_layouts SET lifecycle_state = 'replaced',
                   degradation_reason = ?1, last_error = ?2, replaced_at = ?3,
                   mutation_token = NULL, mutation_lease_until = NULL, updated_at = ?3
                 WHERE layout_id = ?4 AND lifecycle_state = 'registered'",
                rusqlite::params![reason.as_str(), detail, now, layout_id],
            )?;
            let successor = insert_creation_tx(
                &tx,
                &subject,
                &before.socket_path,
                before.protocol,
                &workspace_id,
                &before.display_label,
                &token,
                &now,
                &lease_until,
                Some(&layout_id),
            )?;
            tx.commit()?;
            Ok(HerdrLayoutCreation::Reserved(successor))
        })
    }

    /// Commit exact tab/root coordinates after `tab.create` and before any
    /// controller/provider pane is reserved in the layout.
    pub fn register_herdr_layout(
        &self,
        identity: &HerdrLayoutV1,
        creation_token: &str,
    ) -> Result<HerdrLayoutRow, LedgerError> {
        identity.validate().map_err(|error| {
            refused(
                ErrorCode::InvalidRequest,
                format!("invalid Herdr layout identity: {error}"),
            )
        })?;
        if creation_token.is_empty() {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "Herdr layout creation token must not be empty",
            ));
        }
        let identity = identity.clone();
        let creation_token = creation_token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &identity.layout_id)?;
            if before.lifecycle_state == HerdrLayoutLifecycleState::Registered {
                if same_registration(&before, &identity) {
                    tx.commit()?;
                    return Ok(before);
                }
                return Err(refused(
                    ErrorCode::IdempotencyConflict,
                    "Herdr layout registration identity differs from durable coordinates",
                ));
            }
            if before.lifecycle_state != HerdrLayoutLifecycleState::Creating
                || before.creation_token.as_deref() != Some(&creation_token)
                || before.schema != identity.schema
                || before.revision != identity.revision
                || before.subject_kind != identity.subject.kind
                || before.subject_id != identity.subject.id
                || before.socket_path != identity.socket_path
                || before.protocol != identity.protocol
                || before.workspace_id != identity.workspace_id
                || before.display_label != identity.display_label
                || before.predecessor_layout_id != identity.predecessor_layout_id
            {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "Herdr layout creation reservation is stale",
                ));
            }
            let now = now_iso();
            tx.execute(
                "UPDATE herdr_layouts SET tab_id = ?1, root_pane_id = ?2,
                   lifecycle_state = 'registered', creation_token = NULL,
                   creation_lease_until = NULL, registered_at = ?3, updated_at = ?3
                 WHERE layout_id = ?4 AND lifecycle_state = 'creating'
                   AND creation_token = ?5",
                rusqlite::params![
                    identity.tab_id,
                    identity.root_pane_id,
                    now,
                    identity.layout_id,
                    creation_token
                ],
            )?;
            let row = required_tx(&tx, &identity.layout_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Settle a failed/ambiguous creation. Exact coordinates are retained
    /// only when the response was known and can therefore be cleaned safely.
    pub fn degrade_herdr_layout_creation(
        &self,
        layout_id: &str,
        creation_token: &str,
        reason: HerdrLayoutDegradationReason,
        detail: &str,
        locator: Option<(&str, &str)>,
    ) -> Result<HerdrLayoutRow, LedgerError> {
        if !matches!(
            reason,
            HerdrLayoutDegradationReason::CreationAmbiguous
                | HerdrLayoutDegradationReason::RegistrationFailed
        ) {
            return Err(refused(
                ErrorCode::InvalidRequest,
                "creation degradation requires a creation-specific reason",
            ));
        }
        let layout_id = layout_id.to_owned();
        let creation_token = creation_token.to_owned();
        let detail = detail.to_owned();
        let locator = locator.map(|(tab, root)| (tab.to_owned(), root.to_owned()));
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &layout_id)?;
            if before.lifecycle_state == HerdrLayoutLifecycleState::Degraded
                && before.degradation_reason == Some(reason)
            {
                tx.commit()?;
                return Ok(before);
            }
            if before.lifecycle_state != HerdrLayoutLifecycleState::Creating
                || before.creation_token.as_deref() != Some(&creation_token)
            {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "Herdr layout creation reservation is stale",
                ));
            }
            let now = now_iso();
            match locator {
                Some((tab_id, root_pane_id)) => {
                    if tab_id.is_empty() || root_pane_id.is_empty() {
                        return Err(refused(
                            ErrorCode::InvalidRequest,
                            "degraded layout locator must be complete",
                        ));
                    }
                    tx.execute(
                        "UPDATE herdr_layouts SET tab_id = ?1, root_pane_id = ?2,
                           lifecycle_state = 'degraded', degradation_reason = ?3,
                           last_error = ?4, creation_token = NULL,
                           creation_lease_until = NULL, cleanup_state = 'pending',
                           cleanup_reason = 'layout-degraded', next_cleanup_at = ?5,
                           cleanup_requested_at = ?5, updated_at = ?5
                         WHERE layout_id = ?6 AND lifecycle_state = 'creating'
                           AND creation_token = ?7",
                        rusqlite::params![
                            tab_id,
                            root_pane_id,
                            reason.as_str(),
                            detail,
                            now,
                            layout_id,
                            creation_token
                        ],
                    )?;
                }
                None => {
                    if reason == HerdrLayoutDegradationReason::CreationAmbiguous {
                        tx.execute(
                            "UPDATE herdr_layouts SET lifecycle_state = 'degraded',
                               degradation_reason = ?1, last_error = ?2,
                               creation_token = NULL, creation_lease_until = NULL,
                               cleanup_state = 'attention', last_cleanup_error = ?2,
                               updated_at = ?3 WHERE layout_id = ?4
                               AND lifecycle_state = 'creating' AND creation_token = ?5",
                            rusqlite::params![
                                reason.as_str(),
                                detail,
                                now,
                                layout_id,
                                creation_token
                            ],
                        )?;
                    } else {
                        // An explicit RPC refusal proves no tab/root effect
                        // exists, so there is nothing to clean or attend.
                        tx.execute(
                            "UPDATE herdr_layouts SET lifecycle_state = 'degraded',
                               degradation_reason = ?1, last_error = ?2,
                               creation_token = NULL, creation_lease_until = NULL,
                               updated_at = ?3 WHERE layout_id = ?4
                               AND lifecycle_state = 'creating' AND creation_token = ?5",
                            rusqlite::params![
                                reason.as_str(),
                                detail,
                                now,
                                layout_id,
                                creation_token
                            ],
                        )?;
                    }
                }
            }
            let row = required_tx(&tx, &layout_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    pub fn get_active_herdr_layout(
        &self,
        subject: HerdrLayoutSubjectV1,
        socket_path: &str,
        protocol: u32,
    ) -> Result<Option<HerdrLayoutRow>, LedgerError> {
        let socket_path = socket_path.to_owned();
        self.submit(move |conn| active_tx(conn, &subject, &socket_path, protocol))
    }

    pub fn get_herdr_layout(&self, layout_id: &str) -> Result<Option<HerdrLayoutRow>, LedgerError> {
        let layout_id = layout_id.to_owned();
        self.submit(move |conn| get_tx(conn, &layout_id))
    }

    pub fn list_herdr_layouts_for_subject(
        &self,
        subject: HerdrLayoutSubjectV1,
    ) -> Result<Vec<HerdrLayoutRow>, LedgerError> {
        self.submit(move |conn| {
            let sql = format!(
                "SELECT {COLUMNS} FROM herdr_layouts WHERE subject_kind = ?1 \
                 AND subject_id = ?2 ORDER BY socket_path, protocol, revision"
            );
            let mut statement = conn.prepare(&sql)?;
            let rows = statement.query_map(
                rusqlite::params![subject.kind.as_str(), subject.id],
                layout_row,
            )?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }

    /// Acquire the one cross-process geometry mutation lease for a layout.
    pub fn claim_herdr_layout_mutation(
        &self,
        layout_id: &str,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<Option<HerdrLayoutRow>, LedgerError> {
        let layout_id = layout_id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            if token.is_empty() || lease_until <= now {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "layout mutation token must be non-empty and lease must be future",
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let Some(before) = get_tx(&tx, &layout_id)? else {
                tx.commit()?;
                return Ok(None);
            };
            if before.lifecycle_state != HerdrLayoutLifecycleState::Registered
                || before.cleanup_state != HerdrLayoutCleanupState::NotRequested
            {
                tx.commit()?;
                return Ok(None);
            }
            if before.mutation_token.as_deref() == Some(&token) {
                tx.commit()?;
                return Ok(Some(before));
            }
            if before
                .mutation_lease_until
                .as_deref()
                .is_some_and(|until| until > now.as_str())
            {
                tx.commit()?;
                return Ok(None);
            }
            let affected = tx.execute(
                "UPDATE herdr_layouts SET mutation_token = ?1,
                   mutation_lease_until = ?2, updated_at = ?3
                 WHERE layout_id = ?4 AND lifecycle_state = 'registered'
                   AND cleanup_state = 'not-requested'
                   AND (mutation_token IS NULL OR mutation_lease_until <= ?3)",
                rusqlite::params![token, lease_until, now, layout_id],
            )?;
            let row = if affected == 1 {
                get_tx(&tx, &layout_id)?
            } else {
                None
            };
            tx.commit()?;
            Ok(row)
        })
    }

    pub fn finish_herdr_layout_mutation(
        &self,
        layout_id: &str,
        token: &str,
        degradation: Option<&str>,
    ) -> Result<HerdrLayoutRow, LedgerError> {
        let layout_id = layout_id.to_owned();
        let token = token.to_owned();
        let degradation = degradation.map(str::to_owned);
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &layout_id)?;
            if before.mutation_token.as_deref() != Some(&token) {
                return Err(refused(
                    ErrorCode::StaleClaimToken,
                    "Herdr layout mutation token is stale",
                ));
            }
            let now = now_iso();
            match degradation {
                Some(detail) => {
                    tx.execute(
                        "UPDATE herdr_layouts SET mutation_token = NULL,
                           mutation_lease_until = NULL,
                           degradation_reason = 'placement-failed', last_error = ?1,
                           updated_at = ?2 WHERE layout_id = ?3 AND mutation_token = ?4",
                        rusqlite::params![detail, now, layout_id, token],
                    )?;
                }
                None => {
                    tx.execute(
                        "UPDATE herdr_layouts SET mutation_token = NULL,
                           mutation_lease_until = NULL, updated_at = ?1
                         WHERE layout_id = ?2 AND mutation_token = ?3",
                        rusqlite::params![now, layout_id, token],
                    )?;
                }
            }
            let row = required_tx(&tx, &layout_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    /// Exact owned panes allowed to participate in geometry selection.
    pub fn list_unreleased_owned_panes_for_layout(
        &self,
        layout_id: &str,
    ) -> Result<Vec<String>, LedgerError> {
        let layout_id = layout_id.to_owned();
        self.submit(move |conn| {
            let mut statement = conn.prepare(
                "SELECT pane_id FROM owned_herdr_sessions WHERE layout_id = ?1
                 AND cleanup_state != 'released' ORDER BY pane_id",
            )?;
            let rows = statement.query_map([layout_id], |row| row.get(0))?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }
}

fn linked_sessions_safe_tx(conn: &Connection, layout_id: &str) -> Result<bool, LedgerError> {
    conn.query_row(
        "SELECT NOT EXISTS(SELECT 1 FROM owned_herdr_sessions
         WHERE layout_id = ?1 AND cleanup_state != 'released')",
        [layout_id],
        |row| row.get(0),
    )
    .map_err(Into::into)
}

fn subject_terminal_tx(conn: &Connection, row: &HerdrLayoutRow) -> Result<bool, LedgerError> {
    match row.subject_kind {
        HerdrLayoutSubjectKind::Run => conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM runs WHERE run_id = ?1 AND state = 'stopped')",
                [&row.subject_id],
                |result| result.get(0),
            )
            .map_err(Into::into),
        HerdrLayoutSubjectKind::Epic => conn
            .query_row(
                "SELECT EXISTS(
                   SELECT 1 FROM desired_work WHERE subject_kind = 'epic'
                     AND subject_id = ?1 AND desired_state = 'stopped'
                   UNION ALL
                   SELECT 1 FROM events WHERE run_id = ?1 AND kind = 'forged.epic.pr'
                 )",
                [&row.subject_id],
                |result| result.get(0),
            )
            .map_err(Into::into),
    }
}

fn cleanup_eligible_tx(conn: &Connection, row: &HerdrLayoutRow) -> Result<bool, LedgerError> {
    if row.root_pane_id.is_none() || !linked_sessions_safe_tx(conn, &row.layout_id)? {
        return Ok(false);
    }
    match row.lifecycle_state {
        HerdrLayoutLifecycleState::Registered => subject_terminal_tx(conn, row),
        HerdrLayoutLifecycleState::Replaced | HerdrLayoutLifecycleState::Degraded => Ok(true),
        HerdrLayoutLifecycleState::Creating => Ok(false),
    }
}

fn cleanup_due(row: &HerdrLayoutRow, now: &str) -> bool {
    match row.cleanup_state {
        HerdrLayoutCleanupState::Pending | HerdrLayoutCleanupState::RetryWait => row
            .next_cleanup_at
            .as_deref()
            .is_some_and(|wake| wake <= now),
        HerdrLayoutCleanupState::Leased => row
            .cleanup_lease_until
            .as_deref()
            .is_some_and(|lease| lease <= now),
        _ => false,
    }
}

impl Ledger {
    /// Promote safe roots into the independent cleanup queue. This never
    /// changes subject settlement and never closes a linked pane.
    pub fn request_ready_herdr_layout_cleanup(&self) -> Result<Vec<HerdrLayoutRow>, LedgerError> {
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let sql = format!(
                "SELECT {COLUMNS} FROM herdr_layouts WHERE cleanup_state = 'not-requested'
                 AND root_pane_id IS NOT NULL AND lifecycle_state IN ('registered','degraded','replaced')
                 ORDER BY subject_kind, subject_id, socket_path, protocol, revision"
            );
            let rows = {
                let mut statement = tx.prepare(&sql)?;
                let rows = statement
                    .query_map([], layout_row)?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            };
            let now = now_iso();
            let mut requested = Vec::new();
            for row in rows {
                if !cleanup_eligible_tx(&tx, &row)? {
                    continue;
                }
                let reason = match row.lifecycle_state {
                    HerdrLayoutLifecycleState::Registered => {
                        HerdrLayoutCleanupReason::SubjectTerminal
                    }
                    HerdrLayoutLifecycleState::Replaced => {
                        HerdrLayoutCleanupReason::LayoutReplaced
                    }
                    HerdrLayoutLifecycleState::Degraded => {
                        HerdrLayoutCleanupReason::LayoutDegraded
                    }
                    HerdrLayoutLifecycleState::Creating => unreachable!(),
                };
                tx.execute(
                    "UPDATE herdr_layouts SET cleanup_state = 'pending', cleanup_reason = ?1,
                       next_cleanup_at = ?2, cleanup_requested_at = ?2, updated_at = ?2
                     WHERE layout_id = ?3 AND cleanup_state = 'not-requested'",
                    rusqlite::params![reason.as_str(), now, row.layout_id],
                )?;
                requested.push(required_tx(&tx, &row.layout_id)?);
            }
            tx.commit()?;
            Ok(requested)
        })
    }

    pub fn list_due_herdr_layout_cleanup(
        &self,
        now: &str,
        limit: u32,
    ) -> Result<Vec<HerdrLayoutRow>, LedgerError> {
        let now = now.to_owned();
        self.submit(move |conn| {
            if limit == 0 {
                return Ok(Vec::new());
            }
            let sql = format!(
                "SELECT {COLUMNS} FROM herdr_layouts
                 WHERE cleanup_state IN ('pending','leased','retry-wait')
                 ORDER BY COALESCE(next_cleanup_at, cleanup_lease_until), layout_id"
            );
            let mut statement = conn.prepare(&sql)?;
            let rows = statement.query_map([], layout_row)?;
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

    pub fn claim_herdr_layout_cleanup(
        &self,
        layout_id: &str,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<Option<HerdrLayoutRow>, LedgerError> {
        let layout_id = layout_id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            if token.is_empty() || lease_until <= now {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "layout cleanup token must be non-empty and lease must be future",
                ));
            }
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let Some(before) = get_tx(&tx, &layout_id)? else {
                tx.commit()?;
                return Ok(None);
            };
            if !cleanup_due(&before, &now) || !cleanup_eligible_tx(&tx, &before)? {
                tx.commit()?;
                return Ok(None);
            }
            let affected = tx.execute(
                "UPDATE herdr_layouts SET cleanup_state = 'leased', cleanup_token = ?1,
                   cleanup_lease_until = ?2, next_cleanup_at = NULL,
                   last_cleanup_attempt_at = ?3, updated_at = ?3
                 WHERE layout_id = ?4 AND (
                   (cleanup_state IN ('pending','retry-wait') AND next_cleanup_at <= ?3)
                   OR (cleanup_state = 'leased' AND cleanup_lease_until <= ?3))",
                rusqlite::params![token, lease_until, now, layout_id],
            )?;
            let row = if affected == 1 {
                get_tx(&tx, &layout_id)?
            } else {
                None
            };
            tx.commit()?;
            Ok(row)
        })
    }

    pub fn ack_herdr_layout_cleanup(
        &self,
        layout_id: &str,
        token: &str,
        release: HerdrLayoutCleanupRelease,
    ) -> Result<HerdrLayoutRow, LedgerError> {
        let layout_id = layout_id.to_owned();
        let token = token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &layout_id)?;
            if before.cleanup_state == HerdrLayoutCleanupState::Released {
                if before.cleanup_release == Some(release) {
                    tx.commit()?;
                    return Ok(before);
                }
                return Err(refused(
                    ErrorCode::IdempotencyConflict,
                    "Herdr layout cleanup already has another release outcome",
                ));
            }
            if before.cleanup_state != HerdrLayoutCleanupState::Leased
                || before.cleanup_token.as_deref() != Some(&token)
            {
                return Err(refused(
                    ErrorCode::StaleClaimToken,
                    "Herdr layout cleanup token is stale",
                ));
            }
            let now = now_iso();
            tx.execute(
                "UPDATE herdr_layouts SET cleanup_state = 'released', cleanup_release = ?1,
                   cleanup_token = NULL, cleanup_lease_until = NULL, released_at = ?2,
                   updated_at = ?2 WHERE layout_id = ?3 AND cleanup_state = 'leased'
                   AND cleanup_token = ?4",
                rusqlite::params![release.as_str(), now, layout_id, token],
            )?;
            let row = required_tx(&tx, &layout_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    pub fn retry_herdr_layout_cleanup(
        &self,
        layout_id: &str,
        token: &str,
        now: &str,
        detail: &str,
    ) -> Result<HerdrLayoutCleanupRetry, LedgerError> {
        let layout_id = layout_id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let detail = detail.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &layout_id)?;
            if before.cleanup_state != HerdrLayoutCleanupState::Leased
                || before.cleanup_token.as_deref() != Some(&token)
            {
                return Err(refused(
                    ErrorCode::StaleClaimToken,
                    "Herdr layout cleanup token is stale",
                ));
            }
            let used = before.cleanup_retry_used.saturating_add(1);
            if used >= before.cleanup_retry_budget {
                tx.execute(
                    "UPDATE herdr_layouts SET cleanup_state = 'attention',
                       cleanup_token = NULL, cleanup_lease_until = NULL,
                       cleanup_retry_used = ?1, last_cleanup_error = ?2,
                       updated_at = ?3 WHERE layout_id = ?4 AND cleanup_token = ?5",
                    rusqlite::params![i64::from(used), detail, now, layout_id, token],
                )?;
                let row = required_tx(&tx, &layout_id)?;
                tx.commit()?;
                return Ok(HerdrLayoutCleanupRetry::Exhausted(row));
            }
            let exponent = used.saturating_sub(1).min(31);
            let seconds = 5u64
                .saturating_mul(1u64 << exponent)
                .min(MAX_CLEANUP_BACKOFF_SECONDS);
            let next = deadline_after(&now, seconds)?;
            tx.execute(
                "UPDATE herdr_layouts SET cleanup_state = 'retry-wait',
                   cleanup_token = NULL, cleanup_lease_until = NULL,
                   cleanup_retry_used = ?1, next_cleanup_at = ?2,
                   last_cleanup_error = ?3, updated_at = ?4
                 WHERE layout_id = ?5 AND cleanup_token = ?6",
                rusqlite::params![i64::from(used), next, detail, now, layout_id, token],
            )?;
            let row = required_tx(&tx, &layout_id)?;
            tx.commit()?;
            Ok(HerdrLayoutCleanupRetry::Scheduled(row))
        })
    }

    pub fn earliest_herdr_layout_cleanup_wake(
        &self,
        _now: &str,
    ) -> Result<Option<String>, LedgerError> {
        self.submit(move |conn| {
            conn.query_row(
                "SELECT MIN(COALESCE(next_cleanup_at, cleanup_lease_until))
                 FROM herdr_layouts WHERE cleanup_state IN ('pending','leased','retry-wait')",
                [],
                |row| row.get(0),
            )
            .map_err(Into::into)
        })
    }
}
