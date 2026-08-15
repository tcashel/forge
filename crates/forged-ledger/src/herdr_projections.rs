//! Migration-018 durable Herdr display/custom-lifecycle projection queue.
//!
//! Projection discovery is ledger-only and exact: migration-014 ownership or
//! an active migration-017 root is the admission ticket.  Publication has no
//! bearing on those lifecycles and each channel allocates its sequence before
//! an RPC may be issued.

use forged_types::{
    claude_session_id, herdr_projection_names, validate_provider_session_id, ErrorCode,
    HerdrPaneProjectionV1, HerdrProjectionLifecycle, HerdrProjectionTargetKind,
    HerdrProjectionTargetV1, HerdrSessionEvidenceSource, PacketColumns, WorkIdentitySubjectKind,
    WorkIdentitySubjectV1, WorkPacket, HERDR_PANE_PROJECTION_SCHEMA_V1,
};
use rusqlite::{Connection, OptionalExtension, Transaction, TransactionBehavior};

use crate::error::{column_decode_error, internal, refused, LedgerError};
use crate::ledger::Ledger;
use crate::owned_herdr::{owned_row, COLUMNS as OWNED_COLUMNS};
use crate::packets::get_packet_tx;
use crate::time::now_iso;
use crate::types::{
    stage_as_str, AttemptState, HerdrPaneProjectionRow, HerdrProjectionChannel,
    HerdrProjectionPublicationState, OwnedHerdrLifecycleState, OwnedHerdrOwnerKind,
};

pub const HERDR_PROJECTION_RETRY_BUDGET: u32 = 8;
const MAX_RETRY_BACKOFF_SECONDS: u64 = 300;
const ERROR_MAX_BYTES: usize = 2_048;

pub(crate) const COLUMNS: &str = "projection_id, schema, target_kind, subject_kind, subject_id, \
    ownership_id, layout_id, pane_id, socket_path, protocol, controller_generation, \
    run_id, packet_id, attempt_id, claim_token, stage, provider, model, layout_revision, \
    metadata_source, lifecycle_source, lifecycle_agent, session_candidate, \
    session_confirmed, session_evidence_source, session_evidence_at, \
    session_evidence_error, desired_revision, desired_lifecycle, desired_release, \
    metadata_next_seq, metadata_applied_seq, metadata_applied_revision, metadata_state, \
    metadata_token, metadata_lease_until, metadata_retry_budget, metadata_retry_used, \
    metadata_next_wake_at, metadata_last_error, metadata_last_attempt_at, \
    metadata_applied_at, lifecycle_next_seq, lifecycle_applied_seq, \
    lifecycle_applied_revision, lifecycle_state, lifecycle_token, \
    lifecycle_lease_until, lifecycle_retry_budget, lifecycle_retry_used, \
    lifecycle_next_wake_at, lifecycle_last_error, lifecycle_last_attempt_at, \
    lifecycle_applied_at, created_at, updated_at";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ClaimedHerdrProjectionEffect {
    pub row: HerdrPaneProjectionRow,
    pub channel: HerdrProjectionChannel,
    pub sequence: u64,
    pub desired_revision: u64,
}

fn truncate(value: &str) -> String {
    if value.len() <= ERROR_MAX_BYTES {
        return value.to_owned();
    }
    let mut end = ERROR_MAX_BYTES;
    while !value.is_char_boundary(end) {
        end -= 1;
    }
    value[..end].to_owned()
}

fn deadline_after(anchor: &str, seconds: u64) -> Result<String, LedgerError> {
    let stamp = anchor
        .parse::<jiff::Timestamp>()
        .map_err(|error| internal(format!("invalid projection retry anchor: {error}")))?;
    let delta = jiff::Span::new().seconds(i64::try_from(seconds).unwrap_or(i64::MAX));
    stamp
        .checked_add(delta)
        .map(|value| {
            let raw = value.to_string();
            let body = raw.strip_suffix('Z').unwrap_or(&raw);
            let (secs, fraction) = body.split_once('.').unwrap_or((body, ""));
            format!("{secs}.{:0<9}Z", &fraction[..fraction.len().min(9)])
        })
        .map_err(|error| internal(format!("projection retry deadline overflow: {error}")))
}

fn u64_column(row: &rusqlite::Row<'_>, index: usize, what: &str) -> rusqlite::Result<u64> {
    let raw: i64 = row.get(index)?;
    u64::try_from(raw).map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(
            index,
            rusqlite::types::Type::Integer,
            format!("invalid {what} {raw}: {error}").into(),
        )
    })
}

fn optional_u64(
    row: &rusqlite::Row<'_>,
    index: usize,
    what: &str,
) -> rusqlite::Result<Option<u64>> {
    row.get::<_, Option<i64>>(index)?
        .map(u64::try_from)
        .transpose()
        .map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                index,
                rusqlite::types::Type::Integer,
                format!("invalid {what}: {error}").into(),
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

fn subject_kind(index: usize, raw: &str) -> rusqlite::Result<WorkIdentitySubjectKind> {
    match raw {
        "run" => Ok(WorkIdentitySubjectKind::Run),
        "epic" => Ok(WorkIdentitySubjectKind::Epic),
        _ => Err(column_decode_error(
            index,
            "Herdr projection subject kind",
            raw,
        )),
    }
}

fn target_kind(index: usize, raw: &str) -> rusqlite::Result<HerdrProjectionTargetKind> {
    match raw {
        "anchor" => Ok(HerdrProjectionTargetKind::Anchor),
        "controller" => Ok(HerdrProjectionTargetKind::Controller),
        "attempt" => Ok(HerdrProjectionTargetKind::Attempt),
        _ => Err(column_decode_error(
            index,
            "Herdr projection target kind",
            raw,
        )),
    }
}

fn publication_state(index: usize, raw: &str) -> rusqlite::Result<HerdrProjectionPublicationState> {
    HerdrProjectionPublicationState::try_from(raw)
        .map_err(|_| column_decode_error(index, "Herdr projection publication state", raw))
}

fn evidence_source(index: usize, raw: &str) -> rusqlite::Result<HerdrSessionEvidenceSource> {
    match raw {
        "claude-output" => Ok(HerdrSessionEvidenceSource::ClaudeOutput),
        "codex-thread-started" => Ok(HerdrSessionEvidenceSource::CodexThreadStarted),
        _ => Err(column_decode_error(
            index,
            "Herdr session evidence source",
            raw,
        )),
    }
}

fn desired_lifecycle(index: usize, raw: &str) -> rusqlite::Result<HerdrProjectionLifecycle> {
    match raw {
        "working" => Ok(HerdrProjectionLifecycle::Working),
        "unknown" => Ok(HerdrProjectionLifecycle::Unknown),
        _ => Err(column_decode_error(
            index,
            "Herdr projection lifecycle",
            raw,
        )),
    }
}

pub(crate) fn projection_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<HerdrPaneProjectionRow> {
    let schema: String = row.get(1)?;
    if schema != HERDR_PANE_PROJECTION_SCHEMA_V1 {
        return Err(column_decode_error(1, "Herdr projection schema", &schema));
    }
    let kind = target_kind(2, &row.get::<_, String>(2)?)?;
    let subject = WorkIdentitySubjectV1 {
        kind: subject_kind(3, &row.get::<_, String>(3)?)?,
        id: row.get(4)?,
    };
    let ownership_id: Option<String> = row.get(5)?;
    let layout_id: Option<String> = row.get(6)?;
    let controller_generation = optional_u32(row, 10, "controller generation")?;
    let target = match kind {
        HerdrProjectionTargetKind::Anchor => HerdrProjectionTargetV1::Anchor {
            layout_id: layout_id
                .ok_or_else(|| column_decode_error(6, "Herdr anchor layout id", "missing"))?,
            layout_revision: optional_u32(row, 18, "layout revision")?.ok_or_else(|| {
                column_decode_error(18, "Herdr anchor layout revision", "missing")
            })?,
        },
        HerdrProjectionTargetKind::Controller => HerdrProjectionTargetV1::Controller {
            ownership_id: ownership_id.ok_or_else(|| {
                column_decode_error(5, "Herdr controller ownership id", "missing")
            })?,
            generation: controller_generation
                .ok_or_else(|| column_decode_error(10, "Herdr controller generation", "missing"))?,
        },
        HerdrProjectionTargetKind::Attempt => HerdrProjectionTargetV1::Attempt {
            ownership_id: ownership_id
                .ok_or_else(|| column_decode_error(5, "Herdr attempt ownership id", "missing"))?,
            run_id: row
                .get::<_, Option<String>>(11)?
                .ok_or_else(|| column_decode_error(11, "Herdr attempt run id", "missing"))?,
            packet_id: row
                .get::<_, Option<String>>(12)?
                .ok_or_else(|| column_decode_error(12, "Herdr attempt packet id", "missing"))?,
            attempt_id: row
                .get::<_, Option<i64>>(13)?
                .ok_or_else(|| column_decode_error(13, "Herdr attempt id", "missing"))?,
            claim_token: row
                .get::<_, Option<String>>(14)?
                .ok_or_else(|| column_decode_error(14, "Herdr attempt claim token", "missing"))?,
            controller_generation,
            stage: crate::types::stage_from_db(
                &row.get::<_, Option<String>>(15)?
                    .ok_or_else(|| column_decode_error(15, "Herdr attempt stage", "missing"))?,
            )
            .map_err(|_| column_decode_error(15, "Herdr attempt stage", "unknown"))?,
            provider: row
                .get::<_, Option<String>>(16)?
                .ok_or_else(|| column_decode_error(16, "Herdr attempt provider", "missing"))?,
            model: row
                .get::<_, Option<String>>(17)?
                .ok_or_else(|| column_decode_error(17, "Herdr attempt model", "missing"))?,
        },
    };
    let identity = HerdrPaneProjectionV1 {
        schema,
        projection_id: row.get(0)?,
        subject,
        target,
        pane_id: row.get(7)?,
        socket_path: row.get(8)?,
        protocol: u32::try_from(row.get::<_, i64>(9)?).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                9,
                rusqlite::types::Type::Integer,
                error.into(),
            )
        })?,
        metadata_source: row.get(19)?,
        lifecycle_source: row.get(20)?,
        lifecycle_agent: row.get(21)?,
    };
    identity.validate().map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(
            0,
            rusqlite::types::Type::Text,
            format!("invalid stored Herdr projection: {error}").into(),
        )
    })?;
    let session_candidate: Option<String> = row.get(22)?;
    if session_candidate.as_ref().is_some_and(|value| {
        value.is_empty() || value.len() > 256 || value.chars().any(char::is_control)
    }) {
        return Err(column_decode_error(
            22,
            "Herdr provider session candidate",
            "malformed",
        ));
    }
    let session_confirmed: Option<String> = row.get(23)?;
    if session_confirmed
        .as_deref()
        .is_some_and(|value| validate_provider_session_id(value).is_err())
    {
        return Err(column_decode_error(
            23,
            "Herdr confirmed provider session",
            "malformed",
        ));
    }
    let session_evidence_source = row
        .get::<_, Option<String>>(24)?
        .map(|raw| evidence_source(24, &raw))
        .transpose()?;
    if kind != HerdrProjectionTargetKind::Attempt
        && (session_candidate.is_some()
            || session_confirmed.is_some()
            || session_evidence_source.is_some()
            || row.get::<_, Option<String>>(25)?.is_some()
            || row.get::<_, Option<String>>(26)?.is_some())
    {
        return Err(column_decode_error(
            22,
            "non-attempt Herdr provider session evidence",
            "present",
        ));
    }
    if let (HerdrProjectionTargetV1::Attempt { provider, .. }, Some(source)) =
        (&identity.target, session_evidence_source)
    {
        let matching = matches!(
            (provider.as_str(), source),
            ("claude", HerdrSessionEvidenceSource::ClaudeOutput)
                | ("codex", HerdrSessionEvidenceSource::CodexThreadStarted)
        );
        if !matching {
            return Err(column_decode_error(
                24,
                "Herdr provider evidence mapping",
                source.as_str(),
            ));
        }
    }
    let lifecycle_state_raw: String = row.get(45)?;
    Ok(HerdrPaneProjectionRow {
        identity,
        session_candidate,
        session_confirmed,
        session_evidence_source,
        session_evidence_at: row.get(25)?,
        session_evidence_error: row.get(26)?,
        desired_revision: u64_column(row, 27, "desired revision")?,
        desired_lifecycle: row
            .get::<_, Option<String>>(28)?
            .map(|raw| desired_lifecycle(28, &raw))
            .transpose()?,
        desired_release: row.get::<_, i64>(29)? != 0,
        metadata_next_seq: u64_column(row, 30, "metadata next sequence")?,
        metadata_applied_seq: optional_u64(row, 31, "metadata applied sequence")?,
        metadata_applied_revision: optional_u64(row, 32, "metadata applied revision")?,
        metadata_state: publication_state(33, &row.get::<_, String>(33)?)?,
        metadata_token: row.get(34)?,
        metadata_lease_until: row.get(35)?,
        metadata_retry_budget: u32::try_from(row.get::<_, i64>(36)?).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                36,
                rusqlite::types::Type::Integer,
                error.into(),
            )
        })?,
        metadata_retry_used: u32::try_from(row.get::<_, i64>(37)?).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                37,
                rusqlite::types::Type::Integer,
                error.into(),
            )
        })?,
        metadata_next_wake_at: row.get(38)?,
        metadata_last_error: row.get(39)?,
        metadata_last_attempt_at: row.get(40)?,
        metadata_applied_at: row.get(41)?,
        lifecycle_next_seq: u64_column(row, 42, "lifecycle next sequence")?,
        lifecycle_applied_seq: optional_u64(row, 43, "lifecycle applied sequence")?,
        lifecycle_applied_revision: optional_u64(row, 44, "lifecycle applied revision")?,
        lifecycle_state: publication_state(45, &lifecycle_state_raw)?,
        lifecycle_token: row.get(46)?,
        lifecycle_lease_until: row.get(47)?,
        lifecycle_retry_budget: u32::try_from(row.get::<_, i64>(48)?).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                48,
                rusqlite::types::Type::Integer,
                error.into(),
            )
        })?,
        lifecycle_retry_used: u32::try_from(row.get::<_, i64>(49)?).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                49,
                rusqlite::types::Type::Integer,
                error.into(),
            )
        })?,
        lifecycle_next_wake_at: row.get(50)?,
        lifecycle_last_error: row.get(51)?,
        lifecycle_last_attempt_at: row.get(52)?,
        lifecycle_applied_at: row.get(53)?,
        created_at: row.get(54)?,
        updated_at: row.get(55)?,
    })
}

fn get_tx(
    conn: &Connection,
    projection_id: &str,
) -> Result<Option<HerdrPaneProjectionRow>, LedgerError> {
    let sql = format!("SELECT {COLUMNS} FROM herdr_pane_projections WHERE projection_id = ?1");
    conn.query_row(&sql, [projection_id], projection_row)
        .optional()
        .map_err(Into::into)
}

fn required_tx(
    conn: &Connection,
    projection_id: &str,
) -> Result<HerdrPaneProjectionRow, LedgerError> {
    get_tx(conn, projection_id)?.ok_or_else(|| {
        refused(
            ErrorCode::InvalidRequest,
            format!("no Herdr projection {projection_id:?}"),
        )
    })
}

fn insert_projection_tx(
    tx: &Transaction<'_>,
    identity: &HerdrPaneProjectionV1,
    desired_lifecycle: Option<HerdrProjectionLifecycle>,
    desired_release: bool,
    candidate: Option<&str>,
) -> Result<bool, LedgerError> {
    identity.validate().map_err(|error| {
        refused(
            ErrorCode::InvalidRequest,
            format!("invalid Herdr projection: {error}"),
        )
    })?;
    let (
        ownership_id,
        layout_id,
        controller_generation,
        run_id,
        packet_id,
        attempt_id,
        claim_token,
        stage,
        provider,
        model,
        layout_revision,
    ) = match &identity.target {
        HerdrProjectionTargetV1::Anchor {
            layout_id,
            layout_revision,
        } => (
            None,
            Some(layout_id.as_str()),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            Some(i64::from(*layout_revision)),
        ),
        HerdrProjectionTargetV1::Controller {
            ownership_id,
            generation,
        } => (
            Some(ownership_id.as_str()),
            None,
            Some(i64::from(*generation)),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
        ),
        HerdrProjectionTargetV1::Attempt {
            ownership_id,
            run_id,
            packet_id,
            attempt_id,
            claim_token,
            controller_generation,
            stage,
            provider,
            model,
        } => (
            Some(ownership_id.as_str()),
            None,
            controller_generation.map(i64::from),
            Some(run_id.as_str()),
            Some(packet_id.as_str()),
            Some(*attempt_id),
            Some(claim_token.as_str()),
            Some(stage_as_str(*stage)),
            Some(provider.as_str()),
            Some(model.as_str()),
            None,
        ),
    };
    let now = now_iso();
    let lifecycle_state = if desired_lifecycle.is_some() || desired_release {
        "pending"
    } else {
        "not-requested"
    };
    let inserted = tx.execute(
        "INSERT OR IGNORE INTO herdr_pane_projections (
           projection_id, schema, target_kind, subject_kind, subject_id,
           ownership_id, layout_id, pane_id, socket_path, protocol,
           controller_generation, run_id, packet_id, attempt_id, claim_token,
           stage, provider, model, layout_revision, metadata_source,
           lifecycle_source, lifecycle_agent, session_candidate,
           desired_revision, desired_lifecycle, desired_release,
           metadata_state, metadata_retry_budget, metadata_next_wake_at,
           lifecycle_state, lifecycle_retry_budget, lifecycle_next_wake_at,
           created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10,
                   ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20,
                   ?21, ?22, ?23, 1, ?24, ?25, 'pending', ?26, ?27,
                   ?28, ?26, ?29, ?27, ?27)",
        rusqlite::params![
            identity.projection_id,
            identity.schema,
            identity.target.kind().as_str(),
            identity.subject.kind.as_str(),
            identity.subject.id,
            ownership_id,
            layout_id,
            identity.pane_id,
            identity.socket_path,
            i64::from(identity.protocol),
            controller_generation,
            run_id,
            packet_id,
            attempt_id,
            claim_token,
            stage,
            provider,
            model,
            layout_revision,
            identity.metadata_source,
            identity.lifecycle_source,
            identity.lifecycle_agent,
            candidate,
            desired_lifecycle.map(HerdrProjectionLifecycle::as_str),
            i64::from(desired_release),
            i64::from(HERDR_PROJECTION_RETRY_BUDGET),
            now,
            lifecycle_state,
            (desired_lifecycle.is_some() || desired_release).then_some(now.clone()),
        ],
    )?;
    if inserted == 0 {
        let standing = required_tx(tx, &identity.projection_id)?;
        if standing.identity != *identity {
            return Err(refused(
                ErrorCode::IdempotencyConflict,
                "Herdr projection id conflicts with immutable stored identity",
            ));
        }
    }
    Ok(inserted == 1)
}

fn projection_identity_for_owned(
    owned: &crate::types::OwnedHerdrSessionRow,
    packet: Option<&WorkPacket>,
) -> Result<HerdrPaneProjectionV1, LedgerError> {
    let subject_kind = match owned.subject_kind {
        forged_types::OwnedHerdrSubjectKind::Run => WorkIdentitySubjectKind::Run,
        forged_types::OwnedHerdrSubjectKind::Epic => WorkIdentitySubjectKind::Epic,
    };
    let target = match owned.owner_kind {
        OwnedHerdrOwnerKind::Controller => HerdrProjectionTargetV1::Controller {
            ownership_id: owned.ownership_id.clone(),
            generation: owned
                .controller_generation
                .ok_or_else(|| internal("controller projection has no generation"))?,
        },
        OwnedHerdrOwnerKind::Attempt => {
            let packet = packet.ok_or_else(|| internal("attempt projection has no packet"))?;
            HerdrProjectionTargetV1::Attempt {
                ownership_id: owned.ownership_id.clone(),
                run_id: owned
                    .run_id
                    .clone()
                    .ok_or_else(|| internal("attempt projection has no run"))?,
                packet_id: owned
                    .packet_id
                    .clone()
                    .ok_or_else(|| internal("attempt projection has no packet id"))?,
                attempt_id: owned
                    .attempt_id
                    .ok_or_else(|| internal("attempt projection has no attempt id"))?,
                claim_token: owned
                    .claim_token
                    .clone()
                    .ok_or_else(|| internal("attempt projection has no claim token"))?,
                controller_generation: owned.controller_generation,
                stage: packet.stage,
                provider: packet.provider_hints.provider.clone(),
                model: packet.provider_hints.model.clone(),
            }
        }
    };
    let (projection_id, metadata_source, lifecycle) = herdr_projection_names(&target);
    let (lifecycle_source, lifecycle_agent) = match &target {
        HerdrProjectionTargetV1::Attempt { provider, .. } => {
            (Some(lifecycle), Some(provider.clone()))
        }
        _ => (None, None),
    };
    Ok(HerdrPaneProjectionV1 {
        schema: HERDR_PANE_PROJECTION_SCHEMA_V1.to_owned(),
        projection_id,
        subject: WorkIdentitySubjectV1 {
            kind: subject_kind,
            id: owned.subject_id.clone(),
        },
        target,
        pane_id: owned.pane_id.clone(),
        socket_path: owned.socket_path.clone(),
        protocol: owned.protocol,
        metadata_source,
        lifecycle_source,
        lifecycle_agent,
    })
}

fn packet_from_row(row: crate::types::PacketRow) -> Result<WorkPacket, LedgerError> {
    WorkPacket::from_stored_body(
        &row.body_json,
        PacketColumns {
            packet_id: row.packet_id,
            run_id: row.run_id,
            stage: row.stage,
            seq: row.seq,
            spec: forged_types::SpecRef {
                path: row.spec_path,
                sha256: row.spec_sha256,
                revision: row.spec_revision,
            },
        },
    )
    .map_err(Into::into)
}

fn desired_for_attempt(
    lifecycle: OwnedHerdrLifecycleState,
    state: AttemptState,
) -> (Option<HerdrProjectionLifecycle>, bool) {
    if lifecycle == OwnedHerdrLifecycleState::Registered {
        return (None, false);
    }
    match state {
        AttemptState::Running => (Some(HerdrProjectionLifecycle::Working), false),
        AttemptState::Revoking => (Some(HerdrProjectionLifecycle::Unknown), false),
        AttemptState::Completed
        | AttemptState::Failed
        | AttemptState::Reclaimed
        | AttemptState::Stopped => (Some(HerdrProjectionLifecycle::Unknown), true),
    }
}

fn ensure_all_tx(tx: &Transaction<'_>) -> Result<usize, LedgerError> {
    let owned_sql = format!(
        "SELECT {OWNED_COLUMNS} FROM owned_herdr_sessions
         WHERE cleanup_state != 'released' ORDER BY registered_at, ownership_id"
    );
    let owned = {
        let mut statement = tx.prepare(&owned_sql)?;
        let rows = statement
            .query_map([], owned_row)?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };
    let mut inserted = 0;
    for row in owned {
        let (packet, desired, release, candidate) =
            if row.owner_kind == OwnedHerdrOwnerKind::Attempt {
                let packet_id = row
                    .packet_id
                    .as_deref()
                    .ok_or_else(|| internal("attempt ownership has no packet id"))?;
                let packet = packet_from_row(get_packet_tx(tx, packet_id)?)?;
                if packet.provider_hints.provider != "claude"
                    && packet.provider_hints.provider != "codex"
                {
                    continue;
                }
                let attempt = crate::attempts::get_attempt_tx(
                    tx,
                    row.attempt_id
                        .ok_or_else(|| internal("attempt ownership has no attempt id"))?,
                )?;
                let (desired, release) = desired_for_attempt(row.lifecycle_state, attempt.state);
                let candidate = (packet.provider_hints.provider == "claude")
                    .then(|| claude_session_id(row.claim_token.as_deref().unwrap_or_default()));
                (Some(packet), desired, release, candidate)
            } else {
                (None, None, false, None)
            };
        let identity = projection_identity_for_owned(&row, packet.as_ref())?;
        inserted += usize::from(insert_projection_tx(
            tx,
            &identity,
            desired,
            release,
            candidate.as_deref(),
        )?);
    }

    let layouts = {
        let mut statement = tx.prepare(
            "SELECT layout_id, revision, subject_kind, subject_id, socket_path,
                    protocol, root_pane_id
             FROM herdr_layouts
             WHERE lifecycle_state = 'registered' AND cleanup_state != 'released'
               AND root_pane_id IS NOT NULL
             ORDER BY created_at, layout_id",
        )?;
        let rows = statement
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    u32::try_from(row.get::<_, i64>(1)?).map_err(|error| {
                        rusqlite::Error::FromSqlConversionFailure(
                            1,
                            rusqlite::types::Type::Integer,
                            error.into(),
                        )
                    })?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, String>(4)?,
                    u32::try_from(row.get::<_, i64>(5)?).map_err(|error| {
                        rusqlite::Error::FromSqlConversionFailure(
                            5,
                            rusqlite::types::Type::Integer,
                            error.into(),
                        )
                    })?,
                    row.get::<_, String>(6)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };
    for (layout_id, revision, kind, subject_id, socket_path, protocol, pane_id) in layouts {
        let target = HerdrProjectionTargetV1::Anchor {
            layout_id,
            layout_revision: revision,
        };
        let (projection_id, metadata_source, _) = herdr_projection_names(&target);
        let identity = HerdrPaneProjectionV1 {
            schema: HERDR_PANE_PROJECTION_SCHEMA_V1.to_owned(),
            projection_id,
            subject: WorkIdentitySubjectV1 {
                kind: subject_kind(2, &kind).map_err(LedgerError::from)?,
                id: subject_id,
            },
            target,
            pane_id,
            socket_path,
            protocol,
            metadata_source,
            lifecycle_source: None,
            lifecycle_agent: None,
        };
        inserted += usize::from(insert_projection_tx(tx, &identity, None, false, None)?);
    }
    Ok(inserted)
}

fn refresh_desired_tx(tx: &Transaction<'_>) -> Result<usize, LedgerError> {
    let sql = format!("SELECT {COLUMNS} FROM herdr_pane_projections WHERE target_kind = 'attempt'");
    let rows = {
        let mut statement = tx.prepare(&sql)?;
        let rows = statement
            .query_map([], projection_row)?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };
    let mut changed = 0;
    for row in rows {
        let HerdrProjectionTargetV1::Attempt {
            attempt_id,
            ownership_id,
            ..
        } = &row.identity.target
        else {
            unreachable!()
        };
        let attempt = crate::attempts::get_attempt_tx(tx, *attempt_id)?;
        let owned_sql =
            format!("SELECT {OWNED_COLUMNS} FROM owned_herdr_sessions WHERE ownership_id = ?1");
        let owned = tx.query_row(&owned_sql, [ownership_id], owned_row)?;
        let (desired, release) = desired_for_attempt(owned.lifecycle_state, attempt.state);
        if desired == row.desired_lifecycle && release == row.desired_release {
            continue;
        }
        let now = now_iso();
        tx.execute(
            "UPDATE herdr_pane_projections SET desired_revision = desired_revision + 1,
               desired_lifecycle = ?1, desired_release = ?2,
               metadata_state = CASE WHEN metadata_state = 'missing' THEN 'missing' ELSE 'pending' END,
               metadata_token = NULL, metadata_lease_until = NULL,
               metadata_next_wake_at = CASE WHEN metadata_state = 'missing' THEN NULL ELSE ?3 END,
               lifecycle_state = CASE WHEN lifecycle_state = 'missing' THEN 'missing' ELSE 'pending' END,
               lifecycle_token = NULL, lifecycle_lease_until = NULL,
               lifecycle_next_wake_at = CASE WHEN lifecycle_state = 'missing' THEN NULL ELSE ?3 END,
               updated_at = ?3 WHERE projection_id = ?4",
            rusqlite::params![
                desired.map(HerdrProjectionLifecycle::as_str),
                i64::from(release),
                now,
                row.identity.projection_id
            ],
        )?;
        changed += 1;
    }
    Ok(changed)
}

fn channel_columns(channel: HerdrProjectionChannel) -> (&'static str, &'static str, &'static str) {
    match channel {
        HerdrProjectionChannel::Metadata => (
            "metadata_state",
            "metadata_next_wake_at",
            "metadata_lease_until",
        ),
        HerdrProjectionChannel::Lifecycle => (
            "lifecycle_state",
            "lifecycle_next_wake_at",
            "lifecycle_lease_until",
        ),
    }
}

impl Ledger {
    /// Discover missing rows only from exact eligible migration-014/017
    /// records and coalesce canonical attempt lifecycle transitions.
    pub fn refresh_herdr_pane_projections(&self) -> Result<(usize, usize), LedgerError> {
        self.submit(|conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let inserted = ensure_all_tx(&tx)?;
            let changed = refresh_desired_tx(&tx)?;
            tx.commit()?;
            Ok((inserted, changed))
        })
    }

    pub fn get_herdr_pane_projection(
        &self,
        projection_id: &str,
    ) -> Result<Option<HerdrPaneProjectionRow>, LedgerError> {
        let projection_id = projection_id.to_owned();
        self.submit(move |conn| get_tx(conn, &projection_id))
    }

    pub fn get_herdr_projection_for_ownership(
        &self,
        ownership_id: &str,
    ) -> Result<Option<HerdrPaneProjectionRow>, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        self.submit(move |conn| {
            let sql =
                format!("SELECT {COLUMNS} FROM herdr_pane_projections WHERE ownership_id = ?1");
            conn.query_row(&sql, [ownership_id], projection_row)
                .optional()
                .map_err(Into::into)
        })
    }

    pub fn list_herdr_projections_for_subject(
        &self,
        kind: WorkIdentitySubjectKind,
        subject_id: &str,
    ) -> Result<Vec<HerdrPaneProjectionRow>, LedgerError> {
        let subject_id = subject_id.to_owned();
        self.submit(move |conn| {
            let sql = format!(
                "SELECT {COLUMNS} FROM herdr_pane_projections
                 WHERE subject_kind = ?1 AND subject_id = ?2
                 ORDER BY created_at, projection_id"
            );
            let mut statement = conn.prepare(&sql)?;
            let rows = statement
                .query_map(rusqlite::params![kind.as_str(), subject_id], projection_row)?;
            rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
        })
    }

    /// Store the adapter-provided candidate independently of confirmation.
    pub fn record_herdr_session_candidate(
        &self,
        ownership_id: &str,
        candidate: Option<&str>,
    ) -> Result<Option<HerdrPaneProjectionRow>, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        let candidate = candidate.map(str::to_owned);
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let sql =
                format!("SELECT {COLUMNS} FROM herdr_pane_projections WHERE ownership_id = ?1");
            let Some(before) = tx
                .query_row(&sql, [&ownership_id], projection_row)
                .optional()?
            else {
                tx.commit()?;
                return Ok(None);
            };
            if before.target_kind() != HerdrProjectionTargetKind::Attempt {
                return Err(refused(
                    ErrorCode::InvalidRequest,
                    "only an attempt projection can carry a provider session candidate",
                ));
            }
            if before.session_candidate == candidate {
                tx.commit()?;
                return Ok(Some(before));
            }
            let candidate_valid = candidate.as_ref().is_none_or(|value| {
                !value.is_empty() && value.len() <= 256 && !value.chars().any(char::is_control)
            });
            if !candidate_valid {
                tx.execute(
                    "UPDATE herdr_pane_projections SET session_evidence_error = ?1,
                       updated_at = ?2 WHERE projection_id = ?3",
                    rusqlite::params![
                        "provider session candidate is empty, malformed, or oversized",
                        now_iso(),
                        before.identity.projection_id
                    ],
                )?;
            } else if candidate.is_none() {
                tx.commit()?;
                return Ok(Some(before));
            } else if before.session_candidate.is_some() {
                tx.execute(
                    "UPDATE herdr_pane_projections SET session_evidence_error = ?1,
                       updated_at = ?2 WHERE projection_id = ?3",
                    rusqlite::params![
                        "provider session candidate conflict",
                        now_iso(),
                        before.identity.projection_id
                    ],
                )?;
            } else {
                tx.execute(
                    "UPDATE herdr_pane_projections SET session_candidate = ?1,
                       updated_at = ?2 WHERE projection_id = ?3",
                    rusqlite::params![candidate, now_iso(), before.identity.projection_id],
                )?;
            }
            let after = required_tx(&tx, &before.identity.projection_id)?;
            tx.commit()?;
            Ok(Some(after))
        })
    }

    /// Confirm bounded provider output. Claude evidence must match its
    /// deterministic adapter candidate; Codex confirms its first valid
    /// `thread.started` id.
    pub fn confirm_herdr_provider_session(
        &self,
        ownership_id: &str,
        observed: &str,
        source: HerdrSessionEvidenceSource,
    ) -> Result<Option<HerdrPaneProjectionRow>, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        let observed = observed.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let sql = format!(
                "SELECT {COLUMNS} FROM herdr_pane_projections WHERE ownership_id = ?1"
            );
            let Some(before) = tx
                .query_row(&sql, [&ownership_id], projection_row)
                .optional()?
            else {
                tx.commit()?;
                return Ok(None);
            };
            let provider = match &before.identity.target {
                HerdrProjectionTargetV1::Attempt { provider, .. } => provider.as_str(),
                _ => {
                    return Err(refused(
                        ErrorCode::InvalidRequest,
                        "only an attempt projection can confirm a provider session",
                    ))
                }
            };
            let source_matches = matches!(
                (provider, source),
                ("claude", HerdrSessionEvidenceSource::ClaudeOutput)
                    | ("codex", HerdrSessionEvidenceSource::CodexThreadStarted)
            );
            let candidate_matches = provider != "claude"
                || before.session_candidate.as_deref() == Some(observed.as_str());
            let valid = validate_provider_session_id(&observed).is_ok()
                && source_matches
                && candidate_matches;
            if !valid {
                let detail = if !source_matches {
                    "provider session evidence source mismatch"
                } else if !candidate_matches {
                    "provider session evidence conflicts with adapter candidate"
                } else {
                    "provider session evidence is empty, malformed, or oversized"
                };
                tx.execute(
                    "UPDATE herdr_pane_projections SET session_evidence_error = ?1,
                       updated_at = ?2 WHERE projection_id = ?3",
                    rusqlite::params![detail, now_iso(), before.identity.projection_id],
                )?;
            } else if before.session_confirmed.as_deref() == Some(observed.as_str()) {
                tx.commit()?;
                return Ok(Some(before));
            } else if before.session_confirmed.is_some() {
                tx.execute(
                    "UPDATE herdr_pane_projections SET session_evidence_error = ?1,
                       updated_at = ?2 WHERE projection_id = ?3",
                    rusqlite::params![
                        "confirmed provider session conflict",
                        now_iso(),
                        before.identity.projection_id
                    ],
                )?;
            } else {
                let now = now_iso();
                tx.execute(
                    "UPDATE herdr_pane_projections SET session_confirmed = ?1,
                       session_evidence_source = ?2, session_evidence_at = ?3,
                       session_evidence_error = NULL, desired_revision = desired_revision + 1,
                       metadata_state = CASE WHEN metadata_state = 'missing' THEN 'missing' ELSE 'pending' END,
                       metadata_token = NULL, metadata_lease_until = NULL,
                       metadata_next_wake_at = CASE WHEN metadata_state = 'missing' THEN NULL ELSE ?3 END,
                       updated_at = ?3 WHERE projection_id = ?4",
                    rusqlite::params![
                        observed,
                        source.as_str(),
                        now,
                        before.identity.projection_id
                    ],
                )?;
            }
            let after = required_tx(&tx, &before.identity.projection_id)?;
            tx.commit()?;
            Ok(Some(after))
        })
    }

    /// Persist bounded malformed/missing discovery evidence without ever
    /// promoting it to confirmation.
    pub fn record_herdr_session_evidence_error(
        &self,
        ownership_id: &str,
        detail: &str,
    ) -> Result<Option<HerdrPaneProjectionRow>, LedgerError> {
        let ownership_id = ownership_id.to_owned();
        let detail = truncate(detail);
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let sql =
                format!("SELECT {COLUMNS} FROM herdr_pane_projections WHERE ownership_id = ?1");
            let Some(before) = tx
                .query_row(&sql, [&ownership_id], projection_row)
                .optional()?
            else {
                tx.commit()?;
                return Ok(None);
            };
            if before.session_confirmed.is_none() {
                tx.execute(
                    "UPDATE herdr_pane_projections SET session_evidence_error = ?1,
                       updated_at = ?2 WHERE projection_id = ?3",
                    rusqlite::params![detail, now_iso(), before.identity.projection_id],
                )?;
            }
            let after = required_tx(&tx, &before.identity.projection_id)?;
            tx.commit()?;
            Ok(Some(after))
        })
    }

    pub fn list_due_herdr_projection_effects(
        &self,
        now: &str,
        limit: usize,
    ) -> Result<Vec<(String, HerdrProjectionChannel)>, LedgerError> {
        let now = now.to_owned();
        self.submit(move |conn| {
            let mut due = Vec::new();
            for channel in [
                HerdrProjectionChannel::Metadata,
                HerdrProjectionChannel::Lifecycle,
            ] {
                let (state, wake, lease) = channel_columns(channel);
                let sql = format!(
                    "SELECT projection_id FROM herdr_pane_projections WHERE
                     ({state} IN ('pending','retry-wait') AND {wake} <= ?1)
                     OR ({state} = 'leased' AND {lease} <= ?1)
                     ORDER BY COALESCE({wake}, {lease}), projection_id LIMIT ?2"
                );
                let mut statement = conn.prepare(&sql)?;
                let rows = statement.query_map(
                    rusqlite::params![now, i64::try_from(limit).unwrap_or(i64::MAX)],
                    |row| row.get::<_, String>(0),
                )?;
                for row in rows {
                    due.push((row?, channel));
                    if due.len() >= limit {
                        return Ok(due);
                    }
                }
            }
            Ok(due)
        })
    }

    /// Claim and durably allocate a strictly greater sequence before any
    /// caller can issue the corresponding RPC.
    pub fn claim_herdr_projection_effect(
        &self,
        projection_id: &str,
        channel: HerdrProjectionChannel,
        token: &str,
        now: &str,
        lease_until: &str,
    ) -> Result<Option<ClaimedHerdrProjectionEffect>, LedgerError> {
        let projection_id = projection_id.to_owned();
        let token = token.to_owned();
        let now = now.to_owned();
        let lease_until = lease_until.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &projection_id)?;
            let (state, wake, lease) = channel_columns(channel);
            let (standing_state, standing_wake, standing_lease, next_seq) = match channel {
                HerdrProjectionChannel::Metadata => (
                    before.metadata_state,
                    before.metadata_next_wake_at.as_deref(),
                    before.metadata_lease_until.as_deref(),
                    before.metadata_next_seq,
                ),
                HerdrProjectionChannel::Lifecycle => (
                    before.lifecycle_state,
                    before.lifecycle_next_wake_at.as_deref(),
                    before.lifecycle_lease_until.as_deref(),
                    before.lifecycle_next_seq,
                ),
            };
            let due = matches!(
                standing_state,
                HerdrProjectionPublicationState::Pending
                    | HerdrProjectionPublicationState::RetryWait
            ) && standing_wake.is_some_and(|wake| wake <= now.as_str())
                || standing_state == HerdrProjectionPublicationState::Leased
                    && standing_lease.is_some_and(|lease| lease <= now.as_str());
            if !due {
                tx.commit()?;
                return Ok(None);
            }
            let sequence = next_seq.checked_add(1).ok_or_else(|| {
                refused(
                    ErrorCode::OperationInProgress,
                    "Herdr projection sequence exhausted",
                )
            })?;
            let prefix = channel.as_str();
            let sql = format!(
                "UPDATE herdr_pane_projections SET {state} = 'leased',
                   {prefix}_token = ?1, {lease} = ?2, {wake} = NULL,
                   {prefix}_next_seq = ?3, {prefix}_last_attempt_at = ?4,
                   updated_at = ?4 WHERE projection_id = ?5"
            );
            tx.execute(
                &sql,
                rusqlite::params![
                    token,
                    lease_until,
                    i64::try_from(sequence).map_err(|_| internal("sequence overflow"))?,
                    now,
                    projection_id
                ],
            )?;
            let row = required_tx(&tx, &projection_id)?;
            let desired_revision = row.desired_revision;
            tx.commit()?;
            Ok(Some(ClaimedHerdrProjectionEffect {
                row,
                channel,
                sequence,
                desired_revision,
            }))
        })
    }

    pub fn finish_herdr_projection_effect(
        &self,
        projection_id: &str,
        channel: HerdrProjectionChannel,
        token: &str,
        sequence: u64,
        desired_revision: u64,
        missing: bool,
    ) -> Result<HerdrPaneProjectionRow, LedgerError> {
        let projection_id = projection_id.to_owned();
        let token = token.to_owned();
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &projection_id)?;
            let standing_token = match channel {
                HerdrProjectionChannel::Metadata => before.metadata_token.as_deref(),
                HerdrProjectionChannel::Lifecycle => before.lifecycle_token.as_deref(),
            };
            if standing_token != Some(token.as_str()) {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "Herdr projection effect lease is no longer held",
                ));
            }
            let prefix = channel.as_str();
            let state = if missing {
                "missing"
            } else if before.desired_revision == desired_revision {
                "applied"
            } else {
                "pending"
            };
            let now = now_iso();
            let next_wake = (state == "pending").then_some(now.clone());
            let sql = format!(
                "UPDATE herdr_pane_projections SET {prefix}_state = ?1,
                   {prefix}_token = NULL, {prefix}_lease_until = NULL,
                   {prefix}_next_wake_at = ?2, {prefix}_applied_seq = ?3,
                   {prefix}_applied_revision = ?4, {prefix}_applied_at = ?5,
                   {prefix}_last_error = NULL, updated_at = ?5
                 WHERE projection_id = ?6"
            );
            tx.execute(
                &sql,
                rusqlite::params![
                    state,
                    next_wake,
                    i64::try_from(sequence).map_err(|_| internal("sequence overflow"))?,
                    i64::try_from(desired_revision).map_err(|_| internal("revision overflow"))?,
                    now,
                    projection_id
                ],
            )?;
            let row = required_tx(&tx, &projection_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    pub fn retry_herdr_projection_effect(
        &self,
        projection_id: &str,
        channel: HerdrProjectionChannel,
        token: &str,
        detail: &str,
    ) -> Result<HerdrPaneProjectionRow, LedgerError> {
        let projection_id = projection_id.to_owned();
        let token = token.to_owned();
        let detail = truncate(detail);
        self.submit(move |conn| {
            let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
            let before = required_tx(&tx, &projection_id)?;
            let (standing_token, used, budget) = match channel {
                HerdrProjectionChannel::Metadata => (
                    before.metadata_token.as_deref(),
                    before.metadata_retry_used,
                    before.metadata_retry_budget,
                ),
                HerdrProjectionChannel::Lifecycle => (
                    before.lifecycle_token.as_deref(),
                    before.lifecycle_retry_used,
                    before.lifecycle_retry_budget,
                ),
            };
            if standing_token != Some(token.as_str()) {
                return Err(refused(
                    ErrorCode::OperationInProgress,
                    "Herdr projection effect lease is no longer held",
                ));
            }
            let next_used = used.saturating_add(1).min(budget);
            let exhausted = next_used >= budget;
            let now = now_iso();
            let backoff = 1u64
                .checked_shl(next_used.saturating_sub(1).min(31))
                .unwrap_or(u64::MAX)
                .min(MAX_RETRY_BACKOFF_SECONDS);
            let wake = if exhausted {
                None
            } else {
                Some(deadline_after(&now, backoff)?)
            };
            let prefix = channel.as_str();
            let sql = format!(
                "UPDATE herdr_pane_projections SET {prefix}_state = ?1,
                   {prefix}_token = NULL, {prefix}_lease_until = NULL,
                   {prefix}_retry_used = ?2, {prefix}_next_wake_at = ?3,
                   {prefix}_last_error = ?4, updated_at = ?5
                 WHERE projection_id = ?6"
            );
            tx.execute(
                &sql,
                rusqlite::params![
                    if exhausted { "attention" } else { "retry-wait" },
                    i64::from(next_used),
                    wake,
                    detail,
                    now,
                    projection_id
                ],
            )?;
            let row = required_tx(&tx, &projection_id)?;
            tx.commit()?;
            Ok(row)
        })
    }

    pub fn earliest_herdr_projection_wake(&self, now: &str) -> Result<Option<String>, LedgerError> {
        let now = now.to_owned();
        self.submit(move |conn| {
            conn.query_row(
                "SELECT MIN(wake) FROM (
                   SELECT CASE WHEN metadata_state = 'leased' THEN metadata_lease_until
                               ELSE metadata_next_wake_at END AS wake
                   FROM herdr_pane_projections
                   WHERE metadata_state IN ('pending','leased','retry-wait')
                   UNION ALL
                   SELECT CASE WHEN lifecycle_state = 'leased' THEN lifecycle_lease_until
                               ELSE lifecycle_next_wake_at END AS wake
                   FROM herdr_pane_projections
                   WHERE lifecycle_state IN ('pending','leased','retry-wait')
                 ) WHERE wake IS NOT NULL AND wake >= ?1",
                [now],
                |row| row.get(0),
            )
            .map_err(Into::into)
        })
    }
}
