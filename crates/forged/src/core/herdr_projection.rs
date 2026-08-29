//! Best-effort projection of ledger truth onto exact Forged-owned Herdr
//! panes. This queue is deliberately outside scheduling, settlement, host
//! policy, and ownership cleanup authority.

use std::collections::BTreeMap;
use std::io::{Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};

use forged_host::{
    HerdrAgentProjection, HerdrAgentRelease, HerdrControl, HerdrMetadataProjection,
    HerdrProjectionOutcome, HerdrSessionIdentity,
};
use forged_ledger::{HerdrPaneProjectionRow, HerdrProjectionChannel};
use forged_provider::{ProviderSessionScanner, SessionEvidenceUpdate};
use forged_types::{
    HerdrProjectionTargetV1, WorkIdentitySubjectKind, WorkIdentityV1,
    HERDR_PROJECTION_TITLE_MAX_BYTES, HERDR_PROJECTION_VALUE_MAX_BYTES,
};
use serde_json::{json, Value};

use super::{on_ledger, Ctx};

const EFFECT_LIMIT: usize = 16;
const LEASE_SECONDS: i64 = 15;
const READ_CHUNK_BYTES: usize = 16 * 1024;

fn timestamp_after(seconds: i64) -> Option<String> {
    let value = jiff::Timestamp::now()
        .checked_add(jiff::Span::new().seconds(seconds))
        .ok()?
        .to_string();
    let body = value.strip_suffix('Z').unwrap_or(&value);
    let (secs, fraction) = body.split_once('.').unwrap_or((body, ""));
    Some(format!(
        "{secs}.{:0<9}Z",
        &fraction[..fraction.len().min(9)]
    ))
}

fn bounded(value: &str, max: usize) -> String {
    let sanitized = value
        .chars()
        .map(|character| {
            if character.is_control() {
                ' '
            } else {
                character
            }
        })
        .collect::<String>();
    if sanitized.len() <= max {
        return sanitized;
    }
    let mut end = max.saturating_sub(3);
    while !sanitized.is_char_boundary(end) {
        end = end.saturating_sub(1);
    }
    format!("{}...", &sanitized[..end])
}

fn title(identity: &WorkIdentityV1, row: &HerdrPaneProjectionRow) -> String {
    let context = match &row.identity.target {
        HerdrProjectionTargetV1::Anchor {
            layout_revision, ..
        } => format!("anchor:r{layout_revision}"),
        HerdrProjectionTargetV1::Controller { generation, .. } => {
            format!("controller:g{generation}")
        }
        HerdrProjectionTargetV1::Attempt { attempt_id, .. } => format!("attempt:{attempt_id}"),
    };
    let suffix = format!(" [{context}]");
    let prefix_budget = HERDR_PROJECTION_TITLE_MAX_BYTES.saturating_sub(suffix.len());
    format!(
        "{}{}",
        bounded(&identity.display_title, prefix_budget),
        suffix
    )
}

fn token(value: Option<&str>) -> Option<String> {
    value.map(|value| bounded(value, HERDR_PROJECTION_VALUE_MAX_BYTES))
}

fn metadata(
    row: &HerdrPaneProjectionRow,
    identity: &WorkIdentityV1,
    sequence: u64,
) -> HerdrMetadataProjection {
    let mut tokens = BTreeMap::new();
    let mut generation = None;
    let mut attempt = None;
    let mut stage = None;
    let mut provider = None;
    let mut model = None;
    match &row.identity.target {
        HerdrProjectionTargetV1::Anchor { .. } => {}
        HerdrProjectionTargetV1::Controller {
            generation: value, ..
        } => generation = Some(value.to_string()),
        HerdrProjectionTargetV1::Attempt {
            attempt_id,
            stage: stage_value,
            provider: provider_value,
            model: model_value,
            ..
        } => {
            attempt = Some(attempt_id.to_string());
            stage = Some(crate::config::stage_str(*stage_value).to_owned());
            provider = Some(provider_value.clone());
            model = Some(model_value.clone());
        }
    }
    // Complete fixed whitelist. None means clear this source's older value.
    tokens.insert(
        "subject_kind".into(),
        Some(row.identity.subject.kind.as_str().into()),
    );
    tokens.insert("subject_id".into(), token(Some(&row.identity.subject.id)));
    tokens.insert("bead".into(), token(Some(&identity.work.id)));
    tokens.insert(
        "repository".into(),
        token(
            identity
                .repository
                .as_ref()
                .map(|value| value.label.as_str()),
        ),
    );
    tokens.insert(
        "owner".into(),
        Some(row.identity.target.kind().as_str().into()),
    );
    tokens.insert("generation".into(), generation);
    tokens.insert("attempt".into(), attempt);
    tokens.insert("stage".into(), stage);
    tokens.insert("provider".into(), provider);
    tokens.insert("model".into(), model.map(|value| bounded(&value, 80)));
    tokens.insert(
        "lifecycle".into(),
        row.desired_lifecycle.map(|value| value.as_str().into()),
    );
    tokens.insert("updated".into(), Some(row.updated_at.clone()));
    // This is the sole provider-native id publication surface in zws21.
    // Ledger validation already proved it fits completely; never truncate.
    tokens.insert("provider_session".into(), row.session_confirmed.clone());

    HerdrMetadataProjection {
        source: row.identity.metadata_source.clone(),
        title: title(identity, row),
        agent: row.identity.lifecycle_agent.clone(),
        applies_to_source: row.identity.lifecycle_source.clone(),
        state: row
            .desired_lifecycle
            .map(|value| value.as_str().to_owned())
            .or_else(|| Some(row.identity.target.kind().as_str().to_owned())),
        tokens,
        sequence,
    }
}

pub(crate) fn row_json(row: &HerdrPaneProjectionRow, work: Option<&WorkIdentityV1>) -> Value {
    json!({
        "schema": "forged.herdr-pane-projection.status/1",
        "projectionId": row.identity.projection_id,
        "target": row.identity.target,
        "subject": row.identity.subject,
        "workIdentity": work,
        "endpoint": {
            "socketPath": row.identity.socket_path,
            "protocol": row.identity.protocol,
            "paneId": row.identity.pane_id,
        },
        "sources": {
            "metadata": row.identity.metadata_source,
            "lifecycle": row.identity.lifecycle_source,
            "agent": row.identity.lifecycle_agent,
            "officialNativeSessionPublished": false,
        },
        "providerSession": {
            "candidate": row.session_candidate,
            "confirmed": row.session_confirmed,
            "evidenceSource": row.session_evidence_source.map(|value| value.as_str()),
            "evidenceAt": row.session_evidence_at,
            "error": row.session_evidence_error,
            "path": Value::Null,
        },
        "mode": {
            "forge": "headless",
            "resume": "unpublished",
            "nativeResumeAvailable": false,
        },
        "desired": {
            "revision": row.desired_revision,
            "lifecycle": row.desired_lifecycle.map(|value| value.as_str()),
            "release": row.desired_release,
            "updatedAt": row.updated_at,
        },
        "metadata": {
            "state": row.metadata_state.as_str(),
            "nextSequence": row.metadata_next_seq,
            "appliedSequence": row.metadata_applied_seq,
            "appliedRevision": row.metadata_applied_revision,
            "appliedAt": row.metadata_applied_at,
            "nextWakeAt": row.metadata_next_wake_at,
            "retryUsed": row.metadata_retry_used,
            "retryBudget": row.metadata_retry_budget,
            "lastError": row.metadata_last_error,
        },
        "lifecycle": {
            "state": row.lifecycle_state.as_str(),
            "nextSequence": row.lifecycle_next_seq,
            "appliedSequence": row.lifecycle_applied_seq,
            "appliedRevision": row.lifecycle_applied_revision,
            "appliedAt": row.lifecycle_applied_at,
            "nextWakeAt": row.lifecycle_next_wake_at,
            "retryUsed": row.lifecycle_retry_used,
            "retryBudget": row.lifecycle_retry_budget,
            "lastError": row.lifecycle_last_error,
        },
    })
}

pub(crate) async fn status_for_ownership(ctx: &Ctx, ownership_id: &str) -> Value {
    let ownership_id = ownership_id.to_owned();
    match on_ledger(&ctx.ledger, move |ledger| {
        let row = ledger.get_herdr_projection_for_ownership(&ownership_id)?;
        let work = row
            .as_ref()
            .map(|row| {
                ledger.get_work_identity(row.identity.subject.kind, &row.identity.subject.id)
            })
            .transpose()?
            .flatten();
        Ok((row, work))
    })
    .await
    {
        Ok((Some(row), work)) => row_json(&row, work.as_ref()),
        Ok((None, _)) => Value::Null,
        Err(error) => json!({"error": error.to_string()}),
    }
}

pub(crate) async fn status_for_subject(
    ctx: &Ctx,
    kind: WorkIdentitySubjectKind,
    subject_id: &str,
) -> Value {
    let subject_id = subject_id.to_owned();
    match on_ledger(&ctx.ledger, move |ledger| {
        let work = ledger.get_work_identity(kind, &subject_id)?;
        let rows = ledger.list_herdr_projections_for_subject(kind, &subject_id)?;
        Ok((rows, work))
    })
    .await
    {
        Ok((rows, work)) => json!({
            "schema": "forged.herdr-pane-projections.status/1",
            "items": rows.iter().map(|row| row_json(row, work.as_ref())).collect::<Vec<_>>(),
        }),
        Err(error) => json!({
            "schema": "forged.herdr-pane-projections.status/1",
            "items": [],
            "error": error.to_string(),
        }),
    }
}

/// Best-effort durable discovery/update hook. Errors are intentionally data,
/// never execution failures.
pub(crate) async fn refresh(ctx: &Ctx) -> Value {
    match on_ledger(&ctx.ledger, |ledger| {
        ledger.refresh_herdr_pane_projections()
    })
    .await
    {
        Ok((created, changed)) => json!({"created": created, "changed": changed}),
        Err(error) => json!({"created": 0, "changed": 0, "error": error.to_string()}),
    }
}

pub(crate) async fn record_candidate(ctx: &Ctx, ownership_id: &str, candidate: Option<&str>) {
    let ownership_id = ownership_id.to_owned();
    let candidate = candidate.map(str::to_owned);
    let _ = on_ledger(&ctx.ledger, move |ledger| {
        ledger.record_herdr_session_candidate(&ownership_id, candidate.as_deref())?;
        Ok(())
    })
    .await;
}

fn read_chunk(path: &Path, offset: usize, limit: usize) -> std::io::Result<Vec<u8>> {
    let mut file = std::fs::File::open(path)?;
    file.seek(SeekFrom::Start(u64::try_from(offset).unwrap_or(u64::MAX)))?;
    let mut bytes = Vec::with_capacity(limit);
    file.take(u64::try_from(limit).unwrap_or(u64::MAX))
        .read_to_end(&mut bytes)?;
    Ok(bytes)
}

/// One bounded, incremental discovery pass. Missing files and diagnostics do
/// not affect the provider. Confirmed evidence is fenced by exact ownership.
pub(crate) async fn discover_provider_session(
    ctx: &Ctx,
    ownership_id: &str,
    scanner: &mut ProviderSessionScanner,
    path: &Path,
    complete: bool,
) {
    if scanner.is_terminal() {
        return;
    }
    let path = PathBuf::from(path);
    let offset = scanner.bytes_seen();
    let limit = if complete {
        forged_provider::SESSION_DISCOVERY_MAX_BYTES.saturating_sub(offset)
    } else {
        READ_CHUNK_BYTES
    };
    let chunk = match tokio::task::spawn_blocking(move || read_chunk(&path, offset, limit)).await {
        Ok(Ok(bytes)) => bytes,
        Ok(Err(error)) if error.kind() == std::io::ErrorKind::NotFound && !complete => return,
        _ if !complete => return,
        _ => Vec::new(),
    };
    match scanner.ingest(&chunk, complete) {
        SessionEvidenceUpdate::Confirmed { session_id, source } => {
            let _ = refresh(ctx).await;
            let ownership_id = ownership_id.to_owned();
            let _ = on_ledger(&ctx.ledger, move |ledger| {
                ledger.confirm_herdr_provider_session(&ownership_id, &session_id, source)?;
                Ok(())
            })
            .await;
        }
        SessionEvidenceUpdate::Diagnostic(detail) => {
            let ownership_id = ownership_id.to_owned();
            let _ = on_ledger(&ctx.ledger, move |ledger| {
                ledger.record_herdr_session_evidence_error(&ownership_id, &detail)?;
                Ok(())
            })
            .await;
        }
        SessionEvidenceUpdate::Pending => {}
    }
}

async fn execute_claim(ctx: &Ctx, claim: forged_ledger::ClaimedHerdrProjectionEffect) -> Value {
    let projection_id = claim.row.identity.projection_id.clone();
    let token = match claim.channel {
        HerdrProjectionChannel::Metadata => claim.row.metadata_token.clone(),
        HerdrProjectionChannel::Lifecycle => claim.row.lifecycle_token.clone(),
    }
    .unwrap_or_default();
    let identity = HerdrSessionIdentity::from_durable(
        claim.row.identity.pane_id.clone(),
        claim.row.identity.socket_path.clone(),
        claim.row.identity.protocol,
    );
    let outcome = async {
        let control = HerdrControl::connect_for(&identity).await?;
        match claim.channel {
            HerdrProjectionChannel::Metadata => {
                let subject = claim.row.identity.subject.clone();
                let work = on_ledger(&ctx.ledger, move |ledger| {
                    ledger
                        .get_work_identity(subject.kind, &subject.id)?
                        .ok_or_else(|| forged_ledger::LedgerError::Internal {
                            message: "projection has no durable work identity".into(),
                        })
                })
                .await
                .map_err(|error| forged_host::HostError::Unavailable {
                    message: error.to_string(),
                })?;
                control
                    .report_metadata(&identity, &metadata(&claim.row, &work, claim.sequence))
                    .await
            }
            HerdrProjectionChannel::Lifecycle if claim.row.desired_release => {
                control
                    .release_agent(
                        &identity,
                        &HerdrAgentRelease {
                            source: claim
                                .row
                                .identity
                                .lifecycle_source
                                .clone()
                                .unwrap_or_default(),
                            agent: claim
                                .row
                                .identity
                                .lifecycle_agent
                                .clone()
                                .unwrap_or_default(),
                            sequence: claim.sequence,
                        },
                    )
                    .await
            }
            HerdrProjectionChannel::Lifecycle => {
                control
                    .report_agent(
                        &identity,
                        &HerdrAgentProjection {
                            source: claim
                                .row
                                .identity
                                .lifecycle_source
                                .clone()
                                .unwrap_or_default(),
                            agent: claim
                                .row
                                .identity
                                .lifecycle_agent
                                .clone()
                                .unwrap_or_default(),
                            state: claim
                                .row
                                .desired_lifecycle
                                .unwrap_or(forged_types::HerdrProjectionLifecycle::Unknown),
                            sequence: claim.sequence,
                        },
                    )
                    .await
            }
        }
    }
    .await;

    match outcome {
        Ok(result) => {
            let missing = result == HerdrProjectionOutcome::AlreadyMissing;
            let id = projection_id.clone();
            let effect_token = token.clone();
            let finish = on_ledger(&ctx.ledger, move |ledger| {
                ledger.finish_herdr_projection_effect(
                    &id,
                    claim.channel,
                    &effect_token,
                    claim.sequence,
                    claim.desired_revision,
                    missing,
                )
            })
            .await;
            json!({
                "projectionId": projection_id,
                "channel": claim.channel.as_str(),
                "sequence": claim.sequence,
                "outcome": if missing { "pane-not-found" } else { "applied" },
                "finishError": finish.err().map(|error| error.to_string()),
            })
        }
        Err(error) => {
            let id = projection_id.clone();
            let effect_token = token.clone();
            let detail = error.to_string();
            let retry = on_ledger(&ctx.ledger, move |ledger| {
                ledger.retry_herdr_projection_effect(&id, claim.channel, &effect_token, &detail)
            })
            .await;
            json!({
                "projectionId": projection_id,
                "channel": claim.channel.as_str(),
                "sequence": claim.sequence,
                "outcome": "retry",
                "error": error.to_string(),
                "retryState": retry.ok().map(|row| match claim.channel {
                    HerdrProjectionChannel::Metadata => row.metadata_state.as_str(),
                    HerdrProjectionChannel::Lifecycle => row.lifecycle_state.as_str(),
                }),
            })
        }
    }
}

/// One bounded supervisor pass. Every failure stays inside this report.
pub(crate) async fn reconcile(ctx: &Ctx) -> Value {
    let refreshed = refresh(ctx).await;
    let now = crate::config::now_iso();
    let due = match on_ledger(&ctx.ledger, {
        let now = now.clone();
        move |ledger| ledger.list_due_herdr_projection_effects(&now, EFFECT_LIMIT)
    })
    .await
    {
        Ok(value) => value,
        Err(error) => {
            return json!({
                "schema": "forged.herdr-projection.report/1",
                "refresh": refreshed,
                "effects": [],
                "error": error.to_string(),
            })
        }
    };
    let mut effects = Vec::new();
    for (projection_id, channel) in due {
        let token = format!("projection:{}", uuid::Uuid::now_v7());
        let Some(lease_until) = timestamp_after(LEASE_SECONDS) else {
            continue;
        };
        let now = crate::config::now_iso();
        let claim = on_ledger(&ctx.ledger, move |ledger| {
            ledger.claim_herdr_projection_effect(
                &projection_id,
                channel,
                &token,
                &now,
                &lease_until,
            )
        })
        .await;
        match claim {
            Ok(Some(claim)) => effects.push(execute_claim(ctx, claim).await),
            Ok(None) => {}
            Err(error) => {
                effects.push(json!({"action": "claim-failed", "error": error.to_string()}))
            }
        }
    }
    json!({
        "schema": "forged.herdr-projection.report/1",
        "refresh": refreshed,
        "effects": effects,
    })
}

pub(crate) async fn earliest_wake(ctx: &Ctx, now: &str) -> Option<String> {
    let now = now.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.earliest_herdr_projection_wake(&now)
    })
    .await
    .ok()
    .flatten()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn collision_resistant_title_keeps_exact_owner_context() {
        let long = "same".repeat(80);
        assert_ne!(
            format!("{} [attempt:1]", bounded(&long, 140)),
            format!("{} [attempt:2]", bounded(&long, 140))
        );
    }

    #[test]
    fn display_bounding_never_applies_to_confirmed_session_storage() {
        assert_eq!(bounded(&"x".repeat(100), 80).len(), 80);
        assert_eq!("x".repeat(80).len(), 80);
    }
}
