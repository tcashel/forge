//! Pure durable projection for `forged.provider-session-inventory/1`.
//!
//! Its only read is the dedicated transaction-consistent ledger snapshot.
//! No host, provider, process, filesystem, work-store, or GitHub boundary is used.

use std::cmp::Ordering;
use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{
    AttemptState, DesiredReconcileOutcome, DesiredState, DesiredSubjectKind, DesiredWorkRow,
    HerdrPaneProjectionRow, HerdrProjectionPublicationState, OwnedHerdrCleanupState,
    OwnedHerdrOwnerKind, OwnedHerdrSessionRow, ProviderSessionInventoryAfter,
    ProviderSessionInventoryQuery, ProviderSessionInventorySnapshot,
};
use forged_types::{
    canonical_json_bytes, normalize_repository_path, HerdrProjectionTargetV1, OperationRequest,
    PacketColumns, ProviderSessionActivity, ProviderSessionAttemptV1, ProviderSessionDesiredWorkV1,
    ProviderSessionDiagnosticAction, ProviderSessionEvidenceV1, ProviderSessionHostMode,
    ProviderSessionInventoryCoverageV1, ProviderSessionInventoryFiltersV1,
    ProviderSessionInventoryRowV1, ProviderSessionInventorySummaryV1, ProviderSessionInventoryV1,
    ProviderSessionLegacyHerdrV1, ProviderSessionOwnedHerdrV1, ProviderSessionOwnedMutableV1,
    ProviderSessionProjectionMutableV1, ProviderSessionProjectionV1,
    ProviderSessionPublicationChannelV1, ProviderSessionRecovery, SpecRef, WorkIdentitySubjectKind,
    WorkPacket, PROVIDER_SESSION_INVENTORY_SCHEMA_V1,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use super::{on_ledger, read_only, Ctx, Failure};

const DEFAULT_LIMIT: usize = 100;
const MAX_LIMIT: usize = 500;
const CURSOR_SCHEMA: &str = "forged.provider-session-inventory-cursor/1";
const SESSION_STARTED: &str = "forged.session.started";
const INTERVENTION_QUEUED: &str = "forged.intervention.queued";
const INTERVENTION_DELIVERED: &str = "forged.intervention.delivered";
const ERROR_MAX_BYTES: usize = 2_048;

#[derive(Debug)]
struct InventoryRequest {
    filters: ProviderSessionInventoryFiltersV1,
    limit: usize,
    cursor: Option<CursorV1>,
    fingerprint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CursorV1 {
    schema: String,
    fingerprint: String,
    filters: ProviderSessionInventoryFiltersV1,
    limit: usize,
    active: bool,
    updated_at: String,
    run_id: String,
    packet_id: String,
    attempt_id: i64,
}

#[derive(Debug, Clone)]
struct LegacySession {
    packet_id: String,
    host: String,
    pane_id: String,
    socket_path: Option<String>,
    status_path: Option<String>,
    controller_generation: Option<u32>,
    layout_id: Option<String>,
}

fn bounded(value: Option<&str>) -> Option<String> {
    value.map(|value| {
        if value.len() <= ERROR_MAX_BYTES {
            return value.to_owned();
        }
        let mut end = ERROR_MAX_BYTES;
        while !value.is_char_boundary(end) {
            end -= 1;
        }
        value[..end].to_owned()
    })
}

fn string_param(
    params: &serde_json::Map<String, Value>,
    name: &str,
) -> Result<Option<String>, Failure> {
    match params.get(name) {
        None => Ok(None),
        Some(Value::String(value)) if !value.trim().is_empty() => Ok(Some(value.trim().to_owned())),
        Some(_) => Err(Failure::invalid(format!(
            "session inventory {name} must be a non-empty string"
        ))),
    }
}

fn bool_param(
    params: &serde_json::Map<String, Value>,
    name: &str,
) -> Result<Option<bool>, Failure> {
    match params.get(name) {
        None => Ok(None),
        Some(Value::Bool(value)) => Ok(Some(*value)),
        Some(_) => Err(Failure::invalid(format!(
            "session inventory {name} must be a boolean"
        ))),
    }
}

fn limit_param(params: &serde_json::Map<String, Value>) -> Result<Option<usize>, Failure> {
    match params.get("limit") {
        None => Ok(None),
        Some(Value::Number(value)) => value
            .as_u64()
            .and_then(|value| usize::try_from(value).ok())
            .filter(|value| (1..=MAX_LIMIT).contains(value))
            .map(Some)
            .ok_or_else(|| Failure::invalid("session inventory limit must be from 1 through 500")),
        Some(_) => Err(Failure::invalid(
            "session inventory limit must be from 1 through 500",
        )),
    }
}

fn decode_hex(value: &str) -> Result<Vec<u8>, Failure> {
    if value.is_empty() || value.len() > 16_384 || !value.len().is_multiple_of(2) {
        return Err(Failure::invalid("session inventory cursor is malformed"));
    }
    value
        .as_bytes()
        .chunks_exact(2)
        .map(|pair| {
            let text = std::str::from_utf8(pair)
                .map_err(|_| Failure::invalid("session inventory cursor is malformed"))?;
            u8::from_str_radix(text, 16)
                .map_err(|_| Failure::invalid("session inventory cursor is malformed"))
        })
        .collect()
}

fn encode_cursor(cursor: &CursorV1) -> Result<String, Failure> {
    let bytes = serde_json::to_vec(cursor).map_err(|error| {
        Failure::internal(format!("serialize session inventory cursor: {error}"))
    })?;
    Ok(bytes.iter().map(|byte| format!("{byte:02x}")).collect())
}

fn decode_cursor(value: &str) -> Result<CursorV1, Failure> {
    let cursor: CursorV1 = serde_json::from_slice(&decode_hex(value)?)
        .map_err(|_| Failure::invalid("session inventory cursor is malformed"))?;
    if cursor.schema != CURSOR_SCHEMA
        || cursor.fingerprint.len() != 64
        || !(1..=MAX_LIMIT).contains(&cursor.limit)
        || cursor.updated_at.trim().is_empty()
        || cursor.run_id.trim().is_empty()
        || cursor.packet_id.trim().is_empty()
        || cursor.attempt_id <= 0
    {
        return Err(Failure::invalid("session inventory cursor is malformed"));
    }
    Ok(cursor)
}

fn request_fingerprint(
    filters: &ProviderSessionInventoryFiltersV1,
    limit: usize,
) -> Result<String, Failure> {
    let bytes = canonical_json_bytes(&json!({
        "schema": PROVIDER_SESSION_INVENTORY_SCHEMA_V1,
        "filters": filters,
        "limit": limit,
    }))
    .map_err(|error| Failure::internal(format!("canonical session inventory request: {error}")))?;
    Ok(Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect())
}

fn normalize_request(req: &OperationRequest) -> Result<InventoryRequest, Failure> {
    const ALLOWED: [&str; 9] = [
        "run",
        "epic",
        "repository",
        "provider",
        "model",
        "activity",
        "includeHistorical",
        "limit",
        "cursor",
    ];
    if let Some(unknown) = req
        .params
        .keys()
        .find(|key| !ALLOWED.contains(&key.as_str()))
    {
        return Err(Failure::invalid(format!(
            "unknown session inventory parameter {unknown:?}"
        )));
    }
    let cursor = string_param(&req.params, "cursor")?
        .map(|value| decode_cursor(&value))
        .transpose()?;
    let inherited = cursor.as_ref().map(|value| &value.filters);
    let repository = string_param(&req.params, "repository")?
        .or_else(|| inherited.and_then(|filters| filters.repository.clone()))
        .map(|value| {
            normalize_repository_path(&value).ok_or_else(|| {
                Failure::invalid(
                    "session inventory repository must be an absolute canonicalizable path",
                )
            })
        })
        .transpose()?;
    let activity = string_param(&req.params, "activity")?
        .map(|value| {
            ProviderSessionActivity::parse(&value).ok_or_else(|| {
                Failure::invalid(
                    "session inventory activity must be running, revoking, completed, failed, reclaimed, or stopped",
                )
            })
        })
        .transpose()?
        .or_else(|| inherited.and_then(|filters| filters.activity));
    let filters = ProviderSessionInventoryFiltersV1 {
        run_id: string_param(&req.params, "run")?
            .or_else(|| inherited.and_then(|filters| filters.run_id.clone())),
        epic_id: string_param(&req.params, "epic")?
            .or_else(|| inherited.and_then(|filters| filters.epic_id.clone())),
        repository,
        provider: string_param(&req.params, "provider")?
            .or_else(|| inherited.and_then(|filters| filters.provider.clone())),
        model: string_param(&req.params, "model")?
            .or_else(|| inherited.and_then(|filters| filters.model.clone())),
        activity,
        include_historical: bool_param(&req.params, "includeHistorical")?
            .or_else(|| inherited.map(|filters| filters.include_historical))
            .unwrap_or(false),
    };
    let limit = limit_param(&req.params)?
        .or_else(|| cursor.as_ref().map(|cursor| cursor.limit))
        .unwrap_or(DEFAULT_LIMIT);
    let fingerprint = request_fingerprint(&filters, limit)?;
    if cursor
        .as_ref()
        .is_some_and(|cursor| cursor.fingerprint != fingerprint)
    {
        return Err(Failure::invalid(
            "session inventory cursor belongs to a different normalized request",
        ));
    }
    Ok(InventoryRequest {
        filters,
        limit,
        cursor,
        fingerprint,
    })
}

fn packet(row: forged_ledger::PacketRow) -> Result<WorkPacket, Failure> {
    WorkPacket::from_stored_body(
        &row.body_json,
        PacketColumns {
            packet_id: row.packet_id,
            run_id: row.run_id,
            stage: row.stage,
            seq: row.seq,
            spec: SpecRef {
                path: row.spec_path,
                sha256: row.spec_sha256,
                revision: row.spec_revision,
            },
        },
    )
    .map_err(|error| Failure::internal(format!("malformed stored work packet: {error}")))
}

fn activity(state: AttemptState) -> ProviderSessionActivity {
    match state {
        AttemptState::Running => ProviderSessionActivity::Running,
        AttemptState::Revoking => ProviderSessionActivity::Revoking,
        AttemptState::Completed => ProviderSessionActivity::Completed,
        AttemptState::Failed => ProviderSessionActivity::Failed,
        AttemptState::Reclaimed => ProviderSessionActivity::Reclaimed,
        AttemptState::Stopped => ProviderSessionActivity::Stopped,
    }
}

fn desired_projection(row: &DesiredWorkRow) -> ProviderSessionDesiredWorkV1 {
    ProviderSessionDesiredWorkV1 {
        subject_kind: row.subject_kind.as_str().to_owned(),
        subject_id: row.subject_id.clone(),
        desired_state: row.desired_state.as_str().to_owned(),
        control_revision: row.control_revision,
        controller_generation: row.controller_generation,
        predecessor_generation: row.predecessor_generation,
        reconciliation_outcome: row.last_outcome.map(|value| value.as_str().to_owned()),
        restart_budget: row.restart_budget,
        restart_used: row.restart_used,
        next_wake_at: row.next_wake_at.clone(),
        last_progress_at: row.last_progress_at.clone(),
        last_error: bounded(row.last_error.as_deref()),
        exhausted_at: row.exhausted_at.clone(),
        updated_at: row.updated_at.clone(),
    }
}

fn recovery(desired: Option<&DesiredWorkRow>) -> ProviderSessionRecovery {
    // This is deliberately subject recovery, not another spelling of attempt
    // activity.  In particular, a historical attempt may belong to a subject
    // that is durably scheduled for recovery, while a running attempt does not
    // become healthy merely because its desired row says `running`.
    let Some(desired) = desired else {
        return ProviderSessionRecovery::NotSubmitted;
    };
    if desired.exhausted_at.is_some()
        || desired.last_outcome == Some(DesiredReconcileOutcome::Exhausted)
    {
        return ProviderSessionRecovery::Exhausted;
    }
    if desired.desired_state == DesiredState::Stopped
        || matches!(
            desired.last_outcome,
            Some(DesiredReconcileOutcome::Stopped | DesiredReconcileOutcome::Terminal)
        )
    {
        return ProviderSessionRecovery::Terminal;
    }
    if desired.desired_state == DesiredState::Paused
        || matches!(
            desired.last_outcome,
            Some(DesiredReconcileOutcome::Attention | DesiredReconcileOutcome::Paused)
        )
    {
        return ProviderSessionRecovery::Attention;
    }
    if matches!(
        desired.last_outcome,
        Some(
            DesiredReconcileOutcome::Authorized
                | DesiredReconcileOutcome::Restarting
                | DesiredReconcileOutcome::Backoff
        )
    ) {
        return ProviderSessionRecovery::Scheduled;
    }
    if desired.last_progress_at.is_some()
        && matches!(
            desired.last_outcome,
            Some(DesiredReconcileOutcome::Adopted | DesiredReconcileOutcome::Restarted)
        )
    {
        return ProviderSessionRecovery::Healthy;
    }
    ProviderSessionRecovery::Unknown
}

fn owned_projection(row: &OwnedHerdrSessionRow) -> Result<ProviderSessionOwnedHerdrV1, Failure> {
    Ok(ProviderSessionOwnedHerdrV1 {
        identity: row.identity().map_err(Failure::from)?,
        mutable: ProviderSessionOwnedMutableV1 {
            lifecycle_state: row.lifecycle_state.as_str().to_owned(),
            cleanup_state: row.cleanup_state.as_str().to_owned(),
            cleanup_reason: row.cleanup_reason.map(|value| value.as_str().to_owned()),
            cleanup_release: row.cleanup_release.map(|value| value.as_str().to_owned()),
            cleanup_retry_budget: row.cleanup_retry_budget,
            cleanup_retry_used: row.cleanup_retry_used,
            next_cleanup_at: row.next_cleanup_at.clone(),
            last_cleanup_error: bounded(row.last_cleanup_error.as_deref()),
            registered_at: row.registered_at.clone(),
            command_started_at: row.command_started_at.clone(),
            cleanup_requested_at: row.cleanup_requested_at.clone(),
            last_cleanup_attempt_at: row.last_cleanup_attempt_at.clone(),
            released_at: row.released_at.clone(),
            updated_at: row.updated_at.clone(),
        },
    })
}

#[allow(clippy::too_many_arguments)]
fn publication(
    next_sequence: u64,
    applied_sequence: Option<u64>,
    applied_revision: Option<u64>,
    state: HerdrProjectionPublicationState,
    retry_budget: u32,
    retry_used: u32,
    next_wake_at: &Option<String>,
    last_error: &Option<String>,
    last_attempt_at: &Option<String>,
    applied_at: &Option<String>,
) -> ProviderSessionPublicationChannelV1 {
    ProviderSessionPublicationChannelV1 {
        next_sequence,
        applied_sequence,
        applied_revision,
        state: state.as_str().to_owned(),
        retry_budget,
        retry_used,
        next_wake_at: next_wake_at.clone(),
        last_error: bounded(last_error.as_deref()),
        last_attempt_at: last_attempt_at.clone(),
        applied_at: applied_at.clone(),
    }
}

fn herdr_projection(row: &HerdrPaneProjectionRow) -> ProviderSessionProjectionV1 {
    ProviderSessionProjectionV1 {
        identity: row.identity.clone(),
        mutable: ProviderSessionProjectionMutableV1 {
            desired_revision: row.desired_revision,
            desired_lifecycle: row.desired_lifecycle.map(|value| value.as_str().to_owned()),
            desired_release: row.desired_release,
            metadata: publication(
                row.metadata_next_seq,
                row.metadata_applied_seq,
                row.metadata_applied_revision,
                row.metadata_state,
                row.metadata_retry_budget,
                row.metadata_retry_used,
                &row.metadata_next_wake_at,
                &row.metadata_last_error,
                &row.metadata_last_attempt_at,
                &row.metadata_applied_at,
            ),
            lifecycle: publication(
                row.lifecycle_next_seq,
                row.lifecycle_applied_seq,
                row.lifecycle_applied_revision,
                row.lifecycle_state,
                row.lifecycle_retry_budget,
                row.lifecycle_retry_used,
                &row.lifecycle_next_wake_at,
                &row.lifecycle_last_error,
                &row.lifecycle_last_attempt_at,
                &row.lifecycle_applied_at,
            ),
            provider_session: ProviderSessionEvidenceV1 {
                candidate: row.session_candidate.clone(),
                confirmed: row.session_confirmed.clone(),
                source: row
                    .session_evidence_source
                    .map(|value| value.as_str().to_owned()),
                observed_at: row.session_evidence_at.clone(),
                error: bounded(row.session_evidence_error.as_deref()),
            },
            created_at: row.created_at.clone(),
            updated_at: row.updated_at.clone(),
        },
    }
}

fn release_converged(row: &HerdrPaneProjectionRow) -> bool {
    row.desired_release
        && matches!(
            row.lifecycle_state,
            HerdrProjectionPublicationState::Applied | HerdrProjectionPublicationState::Missing
        )
        && row.lifecycle_applied_revision == Some(row.desired_revision)
}

fn legacy_sessions(
    snapshot: &ProviderSessionInventorySnapshot,
) -> Result<BTreeMap<i64, LegacySession>, Failure> {
    let mut sessions = BTreeMap::new();
    for event in snapshot.events(SESSION_STARTED) {
        let payload = serde_json::from_str::<Value>(&event.payload_json).map_err(|error| {
            Failure::internal(format!(
                "malformed stored session-start event {}: {error}",
                event.event_id
            ))
        })?;
        let version = payload.get("schemaVersion").and_then(Value::as_u64);
        let attempt_id = payload.get("attemptId").and_then(Value::as_i64);
        let packet_id = payload.get("packetId").and_then(Value::as_str);
        let host = payload.get("host").and_then(Value::as_str);
        let pane_id = payload.get("sessionId").and_then(Value::as_str);
        // Pre-versioned `session.started` rows are the known v1 compatibility
        // shape.  The existing run-scoped reader and sentinel router both
        // retain this interpretation; any explicit version outside 1/2 is
        // still unknown closed data and fails the whole projection.
        if !matches!(version, None | Some(1 | 2))
            || attempt_id.is_none_or(|value| value <= 0)
            || packet_id.is_none_or(str::is_empty)
            || !matches!(host, Some("process" | "herdr"))
            || pane_id.is_none_or(str::is_empty)
        {
            return Err(Failure::internal(format!(
                "stored session-start event {} has an unknown or malformed closed value",
                event.event_id
            )));
        }
        sessions.insert(
            attempt_id.unwrap_or_default(),
            LegacySession {
                packet_id: packet_id.unwrap_or_default().to_owned(),
                host: host.unwrap_or_default().to_owned(),
                pane_id: pane_id.unwrap_or_default().to_owned(),
                socket_path: payload
                    .get("socketPath")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                status_path: payload
                    .get("statusPath")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                controller_generation: payload
                    .get("controllerGeneration")
                    .and_then(Value::as_u64)
                    .and_then(|value| u32::try_from(value).ok()),
                layout_id: payload
                    .get("layoutId")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
            },
        );
    }
    Ok(sessions)
}

fn event_id(event: &forged_ledger::EventRow, kind: &str) -> Result<(String, String), Failure> {
    let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
        Failure::internal(format!(
            "malformed stored {kind} event {}: {error}",
            event.event_id
        ))
    })?;
    if payload.get("schemaVersion").and_then(Value::as_u64) != Some(1) {
        return Err(Failure::internal(format!(
            "unknown stored {kind} event schema at {}",
            event.event_id
        )));
    }
    let id = payload
        .get("interventionId")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            Failure::internal(format!(
                "malformed stored {kind} intervention identity at {}",
                event.event_id
            ))
        })?;
    let run_id = event.run_id.clone().ok_or_else(|| {
        Failure::internal(format!(
            "stored {kind} event {} has no run identity",
            event.event_id
        ))
    })?;
    Ok((run_id, id.to_owned()))
}

fn pending_interventions(
    snapshot: &ProviderSessionInventorySnapshot,
) -> Result<BTreeMap<String, u64>, Failure> {
    let delivered = snapshot
        .events(INTERVENTION_DELIVERED)
        .iter()
        .map(|event| event_id(event, "intervention-delivered"))
        .collect::<Result<BTreeSet<_>, _>>()?;
    let queued = snapshot
        .events(INTERVENTION_QUEUED)
        .iter()
        .map(|event| event_id(event, "intervention-queued"))
        .collect::<Result<BTreeSet<_>, _>>()?;
    let mut counts = BTreeMap::new();
    for (run_id, id) in queued {
        if !delivered.contains(&(run_id.clone(), id)) {
            *counts.entry(run_id).or_insert(0) += 1;
        }
    }
    Ok(counts)
}

fn recommended_action(
    recovery: ProviderSessionRecovery,
    host: ProviderSessionHostMode,
    owned: Option<&OwnedHerdrSessionRow>,
    projection: Option<&HerdrPaneProjectionRow>,
) -> ProviderSessionDiagnosticAction {
    if matches!(
        recovery,
        ProviderSessionRecovery::Attention | ProviderSessionRecovery::Exhausted
    ) {
        return ProviderSessionDiagnosticAction::ResolveAttention;
    }
    if owned.is_some_and(|row| row.cleanup_state == OwnedHerdrCleanupState::Attention) {
        return ProviderSessionDiagnosticAction::InspectSession;
    }
    if projection.is_some_and(|row| {
        row.metadata_state == HerdrProjectionPublicationState::Attention
            || row.lifecycle_state == HerdrProjectionPublicationState::Attention
    }) {
        return ProviderSessionDiagnosticAction::InspectProjection;
    }
    if matches!(
        recovery,
        ProviderSessionRecovery::Scheduled | ProviderSessionRecovery::Unknown
    ) {
        return ProviderSessionDiagnosticAction::InspectController;
    }
    if matches!(
        host,
        ProviderSessionHostMode::LegacyHerdr | ProviderSessionHostMode::Unknown
    ) {
        return ProviderSessionDiagnosticAction::InspectWork;
    }
    ProviderSessionDiagnosticAction::None
}

fn row_order(
    left: &ProviderSessionInventoryRowV1,
    right: &ProviderSessionInventoryRowV1,
) -> Ordering {
    right
        .attempt
        .activity
        .is_active()
        .cmp(&left.attempt.activity.is_active())
        .then_with(|| right.attempt.updated_at.cmp(&left.attempt.updated_at))
        .then_with(|| left.run_id.cmp(&right.run_id))
        .then_with(|| left.packet_id.cmp(&right.packet_id))
        .then_with(|| left.attempt_id.cmp(&right.attempt_id))
}

fn after_cursor(row: &ProviderSessionInventoryRowV1, cursor: &CursorV1) -> bool {
    let marker = (
        cursor.active,
        cursor.updated_at.as_str(),
        cursor.run_id.as_str(),
        cursor.packet_id.as_str(),
        cursor.attempt_id,
    );
    let candidate = (
        row.attempt.activity.is_active(),
        row.attempt.updated_at.as_str(),
        row.run_id.as_str(),
        row.packet_id.as_str(),
        row.attempt_id,
    );
    (!candidate.0 && marker.0)
        || (candidate.0 == marker.0
            && (candidate.1 < marker.1
                || (candidate.1 == marker.1
                    && (candidate.2 > marker.2
                        || (candidate.2 == marker.2
                            && (candidate.3 > marker.3
                                || (candidate.3 == marker.3 && candidate.4 > marker.4)))))))
}

fn project(
    snapshot: ProviderSessionInventorySnapshot,
    request: &InventoryRequest,
) -> Result<ProviderSessionInventoryV1, Failure> {
    let packet_rows: BTreeMap<String, _> = snapshot
        .packets
        .iter()
        .cloned()
        .map(|row| (row.packet_id.clone(), row))
        .collect();
    let run_ids: BTreeSet<String> = snapshot.runs.iter().map(|run| run.run_id.clone()).collect();
    let desired: BTreeMap<(DesiredSubjectKind, String), _> = snapshot
        .desired_work
        .iter()
        .map(|row| ((row.subject_kind, row.subject_id.clone()), row))
        .collect();
    let mut owned_by_attempt = BTreeMap::<i64, &OwnedHerdrSessionRow>::new();
    for owned in &snapshot.owned_herdr_sessions {
        if owned.owner_kind != OwnedHerdrOwnerKind::Attempt {
            continue;
        }
        let attempt_id = owned
            .attempt_id
            .ok_or_else(|| Failure::internal("stored attempt-owned Herdr row has no attempt id"))?;
        if owned_by_attempt.insert(attempt_id, owned).is_some() {
            return Err(Failure::internal(format!(
                "attempt {attempt_id} has multiple durable Herdr owners"
            )));
        }
    }
    let mut projection_by_attempt = BTreeMap::<i64, &HerdrPaneProjectionRow>::new();
    for projection in &snapshot.herdr_projections {
        let HerdrProjectionTargetV1::Attempt { attempt_id, .. } = &projection.identity.target
        else {
            continue;
        };
        if projection_by_attempt
            .insert(*attempt_id, projection)
            .is_some()
        {
            return Err(Failure::internal(format!(
                "attempt {attempt_id} has multiple durable Herdr projections"
            )));
        }
    }
    let legacy = legacy_sessions(&snapshot)?;
    let pending = pending_interventions(&snapshot)?;
    let mut coverage = ProviderSessionInventoryCoverageV1::default();
    let mut rows = Vec::new();
    for attempt in &snapshot.attempts {
        let packet_row = packet_rows.get(&attempt.packet_id).ok_or_else(|| {
            Failure::internal(format!("attempt {} has no packet", attempt.attempt_id))
        })?;
        if !run_ids.contains(&packet_row.run_id) {
            return Err(Failure::internal(format!(
                "packet {:?} has no run",
                packet_row.packet_id
            )));
        }
        let packet = packet(packet_row.clone())?;
        let identity = snapshot
            .work_identities
            .get(&(WorkIdentitySubjectKind::Run, packet.run_id.clone()))
            .ok_or_else(|| {
                Failure::internal(format!(
                    "run {:?} has no durable work identity",
                    packet.run_id
                ))
            })?
            .clone();
        let repository = identity
            .repository
            .as_ref()
            .map(|repository| repository.path.clone())
            .ok_or_else(|| {
                Failure::internal(format!(
                    "run {:?} has no canonical repository",
                    packet.run_id
                ))
            })?;
        let attempt_activity = activity(attempt.state);
        let owned = owned_by_attempt.get(&attempt.attempt_id).copied();
        let projection = projection_by_attempt.get(&attempt.attempt_id).copied();
        if let Some(owned) = owned {
            if owned.run_id.as_deref() != Some(packet.run_id.as_str())
                || owned.packet_id.as_deref() != Some(packet.packet_id.as_str())
                || owned.claim_token.as_deref() != Some(attempt.claim_token.as_str())
            {
                return Err(Failure::internal(format!(
                    "attempt {} has a mismatched durable Herdr owner",
                    attempt.attempt_id
                )));
            }
        }
        if let Some(projection) = projection {
            let HerdrProjectionTargetV1::Attempt {
                ownership_id,
                run_id,
                packet_id,
                claim_token,
                stage,
                provider,
                model,
                ..
            } = &projection.identity.target
            else {
                unreachable!("projection map only contains attempt targets")
            };
            if owned.map(|row| row.ownership_id.as_str()) != Some(ownership_id.as_str())
                || run_id != &packet.run_id
                || packet_id != &packet.packet_id
                || claim_token != &attempt.claim_token
                || *stage != packet.stage
                || provider != &packet.provider_hints.provider
                || model != &packet.provider_hints.model
            {
                return Err(Failure::internal(format!(
                    "attempt {} has a mismatched durable Herdr projection",
                    attempt.attempt_id
                )));
            }
        }
        let include_default = attempt_activity.is_active()
            || owned.is_some_and(|row| row.cleanup_state != OwnedHerdrCleanupState::Released)
            || projection.is_some_and(|row| row.desired_release && !release_converged(row));
        if !request.filters.include_historical && !include_default {
            continue;
        }
        let epic_id = identity.epic.as_ref().map(|epic| epic.id.clone());
        if request
            .filters
            .run_id
            .as_deref()
            .is_some_and(|value| value != packet.run_id)
            || request
                .filters
                .epic_id
                .as_deref()
                .is_some_and(|value| epic_id.as_deref() != Some(value))
            || request
                .filters
                .repository
                .as_deref()
                .is_some_and(|value| value != repository)
            || request
                .filters
                .provider
                .as_deref()
                .is_some_and(|value| value != packet.provider_hints.provider)
            || request
                .filters
                .model
                .as_deref()
                .is_some_and(|value| value != packet.provider_hints.model)
            || request
                .filters
                .activity
                .is_some_and(|value| value != attempt_activity)
        {
            continue;
        }
        let desired_row = desired
            .get(&(DesiredSubjectKind::Run, packet.run_id.clone()))
            .copied()
            .or_else(|| {
                epic_id.as_ref().and_then(|epic_id| {
                    desired
                        .get(&(DesiredSubjectKind::Epic, epic_id.clone()))
                        .copied()
                })
            });
        if desired_row.is_none() {
            coverage.missing_desired_work += 1;
        }
        if owned.is_some() && projection.is_none() {
            coverage.missing_owned_projection += 1;
        }
        let legacy_row = legacy.get(&attempt.attempt_id);
        if legacy_row.is_some_and(|row| row.packet_id != packet.packet_id) {
            return Err(Failure::internal(format!(
                "attempt {} has mismatched durable session metadata",
                attempt.attempt_id
            )));
        }
        let (host_mode, legacy_herdr) = if owned.is_some() {
            (ProviderSessionHostMode::OwnedHerdr, None)
        } else if legacy_row.is_some_and(|row| row.host == "process") {
            (ProviderSessionHostMode::Process, None)
        } else if let Some(row) = legacy_row.filter(|row| row.host == "herdr") {
            (
                ProviderSessionHostMode::LegacyHerdr,
                Some(ProviderSessionLegacyHerdrV1 {
                    pane_id: row.pane_id.clone(),
                    socket_path: row.socket_path.clone(),
                    status_path: row.status_path.clone(),
                    controller_generation: row.controller_generation,
                    layout_id: row.layout_id.clone(),
                }),
            )
        } else {
            (ProviderSessionHostMode::Unknown, None)
        };
        match host_mode {
            ProviderSessionHostMode::LegacyHerdr => coverage.legacy_herdr_rows += 1,
            ProviderSessionHostMode::Process => coverage.process_rows += 1,
            ProviderSessionHostMode::Unknown => coverage.unknown_host_rows += 1,
            ProviderSessionHostMode::OwnedHerdr => {}
        }
        let subject_recovery = recovery(desired_row);
        rows.push(ProviderSessionInventoryRowV1 {
            run_id: packet.run_id.clone(),
            packet_id: packet.packet_id.clone(),
            attempt_id: attempt.attempt_id,
            epic_id,
            identity,
            repository,
            stage: packet.stage,
            provider: packet.provider_hints.provider,
            model: packet.provider_hints.model,
            attempt: ProviderSessionAttemptV1 {
                activity: attempt_activity,
                claimant: attempt.claimant.clone(),
                revoke_reason: bounded(attempt.revoke_reason.as_deref()),
                revoke_scope: attempt.revoke_scope.map(|value| value.as_str().to_owned()),
                fail_note: bounded(attempt.fail_note.as_deref()),
                started_at: attempt.started_at.clone(),
                updated_at: attempt.updated_at.clone(),
                last_heartbeat_at: attempt.last_heartbeat_at.clone(),
                ended_at: attempt.ended_at.clone(),
            },
            recovery: subject_recovery,
            desired_work: desired_row.map(desired_projection),
            pending_interventions: pending.get(&packet.run_id).copied().unwrap_or(0),
            host_mode,
            owned_herdr: owned.map(owned_projection).transpose()?,
            legacy_herdr,
            projection: projection.map(herdr_projection),
            provider_session_id: projection.and_then(|row| row.session_confirmed.clone()),
            recommended_action: recommended_action(subject_recovery, host_mode, owned, projection),
        });
    }
    rows.sort_by(row_order);
    if let Some(cursor) = &request.cursor {
        rows.retain(|row| after_cursor(row, cursor));
    }
    let more = rows.len() > request.limit;
    rows.truncate(request.limit);
    let next_cursor = if more {
        let last = rows
            .last()
            .ok_or_else(|| Failure::internal("session inventory pagination lost its last row"))?;
        Some(encode_cursor(&CursorV1 {
            schema: CURSOR_SCHEMA.to_owned(),
            fingerprint: request.fingerprint.clone(),
            filters: request.filters.clone(),
            limit: request.limit,
            active: last.attempt.activity.is_active(),
            updated_at: last.attempt.updated_at.clone(),
            run_id: last.run_id.clone(),
            packet_id: last.packet_id.clone(),
            attempt_id: last.attempt_id,
        })?)
    } else {
        None
    };
    let count = |predicate: fn(&ProviderSessionInventoryRowV1) -> bool| {
        u64::try_from(rows.iter().filter(|row| predicate(row)).count()).unwrap_or(u64::MAX)
    };
    coverage.missing_desired_work = count(|row| row.desired_work.is_none());
    coverage.missing_owned_projection =
        count(|row| row.owned_herdr.is_some() && row.projection.is_none());
    coverage.legacy_herdr_rows = count(|row| row.host_mode == ProviderSessionHostMode::LegacyHerdr);
    coverage.process_rows = count(|row| row.host_mode == ProviderSessionHostMode::Process);
    coverage.unknown_host_rows = count(|row| row.host_mode == ProviderSessionHostMode::Unknown);
    let summary = ProviderSessionInventorySummaryV1 {
        total_matched: snapshot.total_matched,
        returned: u64::try_from(rows.len()).unwrap_or(u64::MAX),
        active: count(|row| row.attempt.activity.is_active()),
        historical: count(|row| !row.attempt.activity.is_active()),
        owned_herdr: count(|row| row.host_mode == ProviderSessionHostMode::OwnedHerdr),
        process: coverage.process_rows,
        legacy_herdr: coverage.legacy_herdr_rows,
        unknown_host: coverage.unknown_host_rows,
    };
    coverage.shown = summary.returned;
    coverage.total = summary.total_matched;
    coverage.truncated = next_cursor.is_some();
    coverage.next_cursor = next_cursor.clone();
    for (count, name) in [
        (coverage.missing_desired_work, "missing-desired-work"),
        (
            coverage.missing_owned_projection,
            "missing-owned-projection",
        ),
        (coverage.legacy_herdr_rows, "legacy-herdr-rows"),
        (coverage.unknown_host_rows, "unknown-host-rows"),
    ] {
        if count != 0 {
            coverage.degradation_facts.push(format!("{name}:{count}"));
        }
    }
    Ok(ProviderSessionInventoryV1 {
        schema: PROVIDER_SESSION_INVENTORY_SCHEMA_V1.to_owned(),
        as_of: snapshot.as_of,
        filters: request.filters.clone(),
        coverage,
        summary,
        rows,
        next_cursor,
    })
}

pub async fn session_inventory(
    ctx: &Ctx,
    req: &OperationRequest,
) -> forged_types::OperationResponse {
    read_only("session_inventory", req, || async {
        let request = normalize_request(req)?;
        let query = ProviderSessionInventoryQuery {
            filters: request.filters.clone(),
            limit: request.limit.saturating_add(1).min(MAX_LIMIT + 1),
            after: request
                .cursor
                .as_ref()
                .map(|cursor| ProviderSessionInventoryAfter {
                    active: cursor.active,
                    updated_at: cursor.updated_at.clone(),
                    run_id: cursor.run_id.clone(),
                    packet_id: cursor.packet_id.clone(),
                    attempt_id: cursor.attempt_id,
                }),
        };
        let snapshot = on_ledger(&ctx.ledger, move |ledger| {
            ledger.provider_session_inventory_snapshot(query)
        })
        .await?;
        let result = project(snapshot, &request)?;
        serde_json::to_value(result)
            .map_err(|error| Failure::internal(format!("serialize session inventory: {error}")))
    })
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    const TS: &str = "2030-01-01T00:00:00.000000000Z";

    fn owned_fixture() -> OwnedHerdrSessionRow {
        use forged_ledger::{
            OwnedHerdrCleanupState, OwnedHerdrLifecycleState, OwnedHerdrOwnerKind,
        };
        use forged_types::OwnedHerdrSubjectKind;

        OwnedHerdrSessionRow {
            ownership_id: "ownership-1".to_owned(),
            schema: forged_types::OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
            owner_kind: OwnedHerdrOwnerKind::Attempt,
            subject_kind: OwnedHerdrSubjectKind::Run,
            subject_id: "run-a".to_owned(),
            run_id: Some("run-a".to_owned()),
            packet_id: Some("run-a/implement/1".to_owned()),
            attempt_id: Some(1),
            claim_token: Some("claim-1".to_owned()),
            controller_generation: None,
            pane_id: "%pane:opaque".to_owned(),
            socket_path: "/tmp/herdr.sock".to_owned(),
            protocol: 19,
            sentinel_path: "/tmp/sentinel".to_owned(),
            lifecycle_state: OwnedHerdrLifecycleState::CommandStarted,
            cleanup_state: OwnedHerdrCleanupState::NotRequested,
            cleanup_reason: None,
            cleanup_release: None,
            cleanup_token: None,
            cleanup_lease_until: None,
            cleanup_retry_budget: 8,
            cleanup_retry_used: 0,
            next_cleanup_at: None,
            last_cleanup_error: None,
            registered_at: TS.to_owned(),
            command_started_at: Some(TS.to_owned()),
            cleanup_requested_at: None,
            last_cleanup_attempt_at: None,
            released_at: None,
            updated_at: TS.to_owned(),
            layout_id: None,
        }
    }

    fn projection_fixture() -> HerdrPaneProjectionRow {
        use forged_types::{
            HerdrPaneProjectionV1, HerdrProjectionLifecycle, HerdrProjectionTargetV1,
            HerdrSessionEvidenceSource, WorkIdentitySubjectV1, HERDR_PANE_PROJECTION_SCHEMA_V1,
        };
        HerdrPaneProjectionRow {
            identity: HerdrPaneProjectionV1 {
                schema: HERDR_PANE_PROJECTION_SCHEMA_V1.to_owned(),
                projection_id: "projection-1".to_owned(),
                subject: WorkIdentitySubjectV1 {
                    kind: WorkIdentitySubjectKind::Run,
                    id: "run-a".to_owned(),
                },
                target: HerdrProjectionTargetV1::Attempt {
                    ownership_id: "ownership-1".to_owned(),
                    run_id: "run-a".to_owned(),
                    packet_id: "run-a/implement/1".to_owned(),
                    attempt_id: 1,
                    claim_token: "claim-1".to_owned(),
                    controller_generation: None,
                    stage: forged_types::Stage::Implement,
                    provider: "claude".to_owned(),
                    model: "model-a".to_owned(),
                },
                pane_id: "%pane:opaque".to_owned(),
                socket_path: "/tmp/herdr.sock".to_owned(),
                protocol: 19,
                metadata_source: "forged.projection.attempt.projection-1".to_owned(),
                lifecycle_source: Some("forged.lifecycle.attempt.projection-1".to_owned()),
                lifecycle_agent: Some("claude".to_owned()),
            },
            session_candidate: Some("candidate-native-id".to_owned()),
            session_confirmed: Some("confirmed-native-id".to_owned()),
            session_evidence_source: Some(HerdrSessionEvidenceSource::ClaudeOutput),
            session_evidence_at: Some(TS.to_owned()),
            session_evidence_error: None,
            desired_revision: 3,
            desired_lifecycle: Some(HerdrProjectionLifecycle::Working),
            desired_release: false,
            metadata_next_seq: 4,
            metadata_applied_seq: Some(3),
            metadata_applied_revision: Some(2),
            metadata_state: HerdrProjectionPublicationState::Pending,
            metadata_token: None,
            metadata_lease_until: None,
            metadata_retry_budget: 8,
            metadata_retry_used: 1,
            metadata_next_wake_at: Some(TS.to_owned()),
            metadata_last_error: None,
            metadata_last_attempt_at: Some(TS.to_owned()),
            metadata_applied_at: Some(TS.to_owned()),
            lifecycle_next_seq: 2,
            lifecycle_applied_seq: Some(1),
            lifecycle_applied_revision: Some(3),
            lifecycle_state: HerdrProjectionPublicationState::Applied,
            lifecycle_token: None,
            lifecycle_lease_until: None,
            lifecycle_retry_budget: 8,
            lifecycle_retry_used: 0,
            lifecycle_next_wake_at: None,
            lifecycle_last_error: None,
            lifecycle_last_attempt_at: Some(TS.to_owned()),
            lifecycle_applied_at: Some(TS.to_owned()),
            created_at: TS.to_owned(),
            updated_at: TS.to_owned(),
        }
    }

    fn owned_snapshot() -> ProviderSessionInventorySnapshot {
        use forged_ledger::{AttemptRow, PacketRow, RunRow, RunState};
        use forged_types::{
            Deliverable, ProviderHints, Sandbox, Stage, StageContract, WorkIdentityRepositoryV1,
            WorkIdentitySource, WorkIdentitySubjectV1, WorkIdentityV1, WorkIdentityWorkV1,
            WORK_IDENTITY_SCHEMA_V1,
        };

        let packet = WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: "run-a/implement/1".to_owned(),
            run_id: "run-a".to_owned(),
            work_id: "bead-a".to_owned(),
            stage: Stage::Implement,
            execution: None,
            lane_seq: None,
            spec: SpecRef {
                path: "/tmp/spec".to_owned(),
                sha256: "a".repeat(64),
                revision: None,
            },
            worktree: "/tmp/worktree".into(),
            branch: "work/a".to_owned(),
            base_ref: "main".to_owned(),
            contract: StageContract {
                instructions: "test".to_owned(),
                gate_commands: Vec::new(),
                deliverable: Deliverable::CommitsInWorktree,
                budget_s: 10,
                seat_commands: Vec::new(),
            },
            result_schema: "forged.result.implement/1".to_owned(),
            provider_hints: ProviderHints {
                provider: "claude".to_owned(),
                model: "model-a".to_owned(),
                effort: None,
                sandbox: Sandbox::WorkspaceWrite,
            },
            field_notes: Vec::new(),
        };
        let identity = WorkIdentityV1 {
            schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
            subject: WorkIdentitySubjectV1 {
                kind: WorkIdentitySubjectKind::Run,
                id: "run-a".to_owned(),
            },
            work: WorkIdentityWorkV1 {
                id: "bead-a".to_owned(),
                title: Some("Same title".to_owned()),
                revision: Some("revision-a".to_owned()),
            },
            repository: Some(WorkIdentityRepositoryV1 {
                path: "/tmp/repo".to_owned(),
                label: "repo".to_owned(),
            }),
            project: None,
            epic: None,
            display_title: "Same title [repo]".to_owned(),
            captured_at: TS.to_owned(),
            source: WorkIdentitySource::Durable,
        };
        ProviderSessionInventorySnapshot {
            as_of: TS.to_owned(),
            total_matched: 1,
            attempts: vec![AttemptRow {
                attempt_id: 1,
                packet_id: packet.packet_id.clone(),
                claim_token: "claim-1".to_owned(),
                claimant: "claude:worker".to_owned(),
                state: AttemptState::Running,
                revoke_reason: None,
                revoke_scope: None,
                fail_note: None,
                result_json: None,
                started_at: TS.to_owned(),
                updated_at: TS.to_owned(),
                last_heartbeat_at: Some(TS.to_owned()),
                ended_at: None,
            }],
            packets: vec![PacketRow {
                packet_id: packet.packet_id.clone(),
                run_id: packet.run_id.clone(),
                stage: packet.stage,
                seq: 1,
                spec_path: packet.spec.path.clone(),
                spec_sha256: packet.spec.sha256.clone(),
                spec_revision: None,
                policy_revision: None,
                body_json: packet.stored_body().expect("stored packet"),
                created_at: TS.to_owned(),
            }],
            runs: vec![RunRow {
                run_id: "run-a".to_owned(),
                work_id: "bead-a".to_owned(),
                repo: "/tmp/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: "work/a".to_owned(),
                protocol: "anvil/1".to_owned(),
                state: RunState::Active,
                stop_reason: None,
                created_at: TS.to_owned(),
                updated_at: TS.to_owned(),
                terminal_outcome: None,
                delivery_pr: None,
                delivery_sha: None,
                superseded_by: None,
            }],
            desired_work: Vec::new(),
            work_identities: BTreeMap::from([(
                (WorkIdentitySubjectKind::Run, "run-a".to_owned()),
                identity,
            )]),
            owned_herdr_sessions: vec![owned_fixture()],
            herdr_projections: vec![projection_fixture()],
            events_by_kind: BTreeMap::new(),
        }
    }

    #[test]
    fn cursor_is_opaque_and_bound_to_all_filters() {
        let filters = ProviderSessionInventoryFiltersV1 {
            run_id: Some("run-a".to_owned()),
            include_historical: true,
            ..Default::default()
        };
        let fingerprint = request_fingerprint(&filters, 50).expect("fingerprint");
        let encoded = encode_cursor(&CursorV1 {
            schema: CURSOR_SCHEMA.to_owned(),
            fingerprint: fingerprint.clone(),
            filters,
            limit: 50,
            active: true,
            updated_at: "2030-01-01T00:00:00.000000000Z".to_owned(),
            run_id: "run-a".to_owned(),
            packet_id: "run-a/implement/1".to_owned(),
            attempt_id: 1,
        })
        .expect("encode");
        assert!(!encoded.contains("run-a"));
        assert_eq!(
            decode_cursor(&encoded).expect("decode").fingerprint,
            fingerprint
        );
    }

    #[test]
    fn desired_running_alone_is_not_healthy() {
        let row = DesiredWorkRow {
            subject_kind: DesiredSubjectKind::Run,
            subject_id: "run-a".to_owned(),
            desired_state: DesiredState::Running,
            control_revision: 1,
            controller_generation: 1,
            predecessor_generation: None,
            restart_budget: 5,
            restart_used: 0,
            next_wake_at: None,
            last_progress_at: None,
            last_outcome: None,
            last_error: None,
            exhausted_at: None,
            reconcile_token: None,
            reconcile_lease_until: None,
            created_at: "2030-01-01T00:00:00.000000000Z".to_owned(),
            updated_at: "2030-01-01T00:00:00.000000000Z".to_owned(),
        };
        assert_eq!(recovery(Some(&row)), ProviderSessionRecovery::Unknown);
    }

    #[test]
    fn terminal_attempt_does_not_overwrite_scheduled_subject_recovery() {
        let row = DesiredWorkRow {
            subject_kind: DesiredSubjectKind::Run,
            subject_id: "run-a".to_owned(),
            desired_state: DesiredState::Running,
            control_revision: 1,
            controller_generation: 2,
            predecessor_generation: Some(1),
            restart_budget: 5,
            restart_used: 1,
            next_wake_at: Some(TS.to_owned()),
            last_progress_at: None,
            last_outcome: Some(DesiredReconcileOutcome::Backoff),
            last_error: Some("retry scheduled".to_owned()),
            exhausted_at: None,
            reconcile_token: None,
            reconcile_lease_until: None,
            created_at: TS.to_owned(),
            updated_at: TS.to_owned(),
        };
        assert_eq!(recovery(Some(&row)), ProviderSessionRecovery::Scheduled);
    }

    #[test]
    fn unversioned_session_started_remains_known_legacy_evidence() {
        let mut snapshot = owned_snapshot();
        snapshot.events_by_kind.insert(
            SESSION_STARTED.to_owned(),
            vec![forged_ledger::EventRow {
                event_id: 1,
                ts: TS.to_owned(),
                run_id: Some("run-a".to_owned()),
                kind: SESSION_STARTED.to_owned(),
                payload_json: serde_json::json!({
                    "attemptId": 1,
                    "packetId": "run-a/implement/1",
                    "host": "herdr",
                    "sessionId": "%legacy-pane"
                })
                .to_string(),
            }],
        );
        let legacy = legacy_sessions(&snapshot).expect("known unversioned legacy event");
        assert_eq!(
            legacy.get(&1).map(|row| row.pane_id.as_str()),
            Some("%legacy-pane")
        );
    }

    #[test]
    fn owned_identity_mutable_projection_and_provider_session_remain_distinct() {
        let request = InventoryRequest {
            filters: ProviderSessionInventoryFiltersV1::default(),
            limit: 100,
            cursor: None,
            fingerprint: "unused".to_owned(),
        };
        let inventory = project(owned_snapshot(), &request).expect("inventory");
        let row = inventory.rows.first().expect("owned row");
        assert_eq!(row.host_mode, ProviderSessionHostMode::OwnedHerdr);
        assert_eq!(
            row.owned_herdr.as_ref().unwrap().identity.pane_id,
            "%pane:opaque"
        );
        assert_eq!(
            row.projection
                .as_ref()
                .unwrap()
                .mutable
                .provider_session
                .candidate
                .as_deref(),
            Some("candidate-native-id")
        );
        assert_eq!(
            row.provider_session_id.as_deref(),
            Some("confirmed-native-id")
        );
        assert_ne!(
            row.provider_session_id.as_deref(),
            Some(row.owned_herdr.as_ref().unwrap().identity.pane_id.as_str())
        );
        assert_eq!(row.recovery, ProviderSessionRecovery::NotSubmitted);
        assert_eq!(inventory.coverage.missing_desired_work, 1);
    }

    #[test]
    fn release_convergence_requires_terminal_publication_at_current_revision() {
        let mut projection = projection_fixture();
        projection.desired_release = true;
        projection.lifecycle_state = HerdrProjectionPublicationState::Applied;
        projection.lifecycle_applied_revision = Some(projection.desired_revision);
        assert!(release_converged(&projection));
        projection.lifecycle_applied_revision = Some(projection.desired_revision - 1);
        assert!(!release_converged(&projection));
        projection.lifecycle_applied_revision = Some(projection.desired_revision);
        projection.lifecycle_state = HerdrProjectionPublicationState::Pending;
        assert!(!release_converged(&projection));
        projection.lifecycle_state = HerdrProjectionPublicationState::Missing;
        assert!(release_converged(&projection));
    }
}
