//! Attempt evidence for roster choices, without a model ranking or live fallbacks.
use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{AttemptState, ModelUsageSnapshot, UsageRecord};
use forged_types::{OperationRequest, Outcome, PacketResult, SeatPurpose, Verdict};
use serde::Serialize;
use serde_json::{json, Value};

use super::{on_ledger, param_opt_i64_strict, param_opt_str_strict, Ctx, Failure};

const INTERPRETATION: &str = "All scoped recorded attempts; each attempt counted once. Repeat attempts are packet-local; remediation means Fix-purpose work. Groups use requested launch selection when recorded, otherwise retained admission or a single usage-reported model. Effort is requested, not proof the provider honored it; null is unknown. Completed means protocol completion, not accepted quality. Costs include every usage model within an attempt and may be imputed. Missing usage is not free execution. Input tokens exclude cache reads and writes, reported separately. In-progress counts are recorded states, not process-liveness proof. Duration includes preparation. These observations do not establish causal model quality.";

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct Cost {
    known_usd: f64,
    rows_missing_cost: u64,
    attempts_without_usage: u64,
    billed_rows: u64,
    imputed_rows: u64,
    other_pricing_rows: u64,
}
impl Cost {
    fn add(&mut self, row: &UsageRecord) {
        match row.cost_usd {
            Some(value) => self.known_usd += value,
            None => self.rows_missing_cost += 1,
        }
        match row.pricing_basis.as_deref() {
            Some("billed") => self.billed_rows += 1,
            Some("imputed_api_rate") => self.imputed_rows += 1,
            _ => self.other_pricing_rows += 1,
        }
    }
}
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct Duration {
    samples: u64,
    total_seconds: f64,
    missing: u64,
}
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct Tokens {
    input: u64,
    output: u64,
    cache_read: u64,
    cache_write: u64,
}
impl Tokens {
    fn add(&mut self, row: &UsageRecord) {
        self.input += row.input_tokens;
        self.output += row.output_tokens;
        self.cache_read += row.cache_read_tokens.unwrap_or(0);
        self.cache_write += row.cache_write_tokens.unwrap_or(0);
    }
}

#[derive(Default, Serialize)]
struct UnattributedUsage {
    #[serde(flatten)]
    cost: Cost,
    tokens: Tokens,
}
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct ReviewVerdicts {
    approve: u64,
    request_changes: u64,
    block: u64,
    unknown: u64,
}
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct Metrics {
    attempts: u64,
    completed: u64,
    failed: u64,
    transport_failures: u64,
    reclaimed: u64,
    stopped: u64,
    in_progress: u64,
    repeat_attempts: u64,
    remediation_attempts: u64,
    launch_selection_attempts: u64,
    admission_selection_attempts: u64,
    usage_model_attempts: u64,
    multiple_usage_model_attempts: u64,
    usage_model_mismatch_attempts: u64,
    duration: Duration,
    cost: Cost,
    tokens: Tokens,
    review_verdicts: ReviewVerdicts,
}
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Serialize)]
struct Group {
    repository: String,
    role: Option<String>,
    provider: Option<String>,
    model: Option<String>,
    effort: Option<String>,
}

fn choice(value: &Value) -> Option<(String, String, Option<String>)> {
    let provider = value.get("provider")?.as_str()?.trim();
    let model = value.get("model")?.as_str()?.trim();
    if provider.is_empty() || model.is_empty() {
        return None;
    }
    let effort = match value.get("effort") {
        Some(Value::String(value)) if !value.trim().is_empty() => value.clone(),
        Some(Value::Null) => "provider-default".to_owned(),
        _ => return None,
    };
    Some((provider.to_owned(), model.to_owned(), Some(effort)))
}

pub(super) async fn report(
    ctx: &Ctx,
    req: &OperationRequest,
    repository: Option<String>,
) -> Result<Value, Failure> {
    let limit = param_opt_i64_strict(&req.params, "limit")?.unwrap_or(5);
    if !(1..=100).contains(&limit) {
        return Err(Failure::invalid("usage limit must be between 1 and 100"));
    }
    let run = param_opt_str_strict(&req.params, "run")?.map(str::to_owned);
    let snapshot = on_ledger(&ctx.ledger, {
        let repository = repository.clone();
        let run = run.clone();
        move |ledger| ledger.model_usage_snapshot(repository.as_deref(), run.as_deref())
    })
    .await?;
    let mut result = project(snapshot, repository, run, limit as usize)?;
    result["pricing"] = json!({
        "currentRateCard": super::ops::pricing_json(&ctx.config),
        "historicalRateCard": null,
        "note": "Historical imputation source and rate-card metadata were not captured. The current rate card is configuration context only; recorded costs were not repriced.",
    });
    Ok(result)
}

fn project(
    snapshot: ModelUsageSnapshot,
    repository: Option<String>,
    run: Option<String>,
    limit: usize,
) -> Result<Value, Failure> {
    let runs = snapshot
        .runs
        .iter()
        .map(|run| (&run.run_id, run))
        .collect::<BTreeMap<_, _>>();
    let packets = snapshot
        .packets
        .iter()
        .map(|row| (&row.packet_id, row))
        .collect::<BTreeMap<_, _>>();
    let attempts = snapshot
        .attempts
        .iter()
        .map(|row| (row.attempt_id, row))
        .collect::<BTreeMap<_, _>>();
    let mut usage = BTreeMap::<i64, Vec<&UsageRecord>>::new();
    let mut unmatched = UnattributedUsage::default();
    let mut unattributed_usage_rows = 0;
    for row in &snapshot.usage {
        let owner = row.attempt_id.and_then(|id| attempts.get(&id).copied());
        if let Some(attempt) = owner.filter(|attempt| {
            row.packet_id.as_deref() == Some(attempt.packet_id.as_str())
                && packets
                    .get(&attempt.packet_id)
                    .is_some_and(|packet| packet.run_id == row.run_id)
        }) {
            usage.entry(attempt.attempt_id).or_default().push(row);
        } else {
            unattributed_usage_rows += 1;
            unmatched.cost.add(row);
            unmatched.tokens.add(row);
        }
    }
    let mut selections = BTreeMap::new();
    for event in &snapshot.session_started_events {
        let Ok(payload) = serde_json::from_str::<Value>(&event.payload_json) else {
            continue;
        };
        let Some(id) = payload.get("attemptId").and_then(Value::as_i64) else {
            continue;
        };
        let Some(attempt) = attempts.get(&id) else {
            continue;
        };
        let Some(packet) = packets.get(&attempt.packet_id) else {
            continue;
        };
        if payload.get("packetId").and_then(Value::as_str) != Some(attempt.packet_id.as_str())
            || event.run_id.as_deref() != Some(packet.run_id.as_str())
        {
            continue;
        }
        if let Some(selected) = payload.get("selection").and_then(choice) {
            selections.entry(id).or_insert(selected);
        }
    }
    let mut reserved = BTreeMap::<i64, BTreeSet<(String, String)>>::new();
    for row in &snapshot.admission_reservations {
        let Some(id) = row
            .owner_id
            .as_deref()
            .and_then(|id| id.parse::<i64>().ok())
        else {
            continue;
        };
        if attempts
            .get(&id)
            .is_some_and(|attempt| row.subject_id == attempt.packet_id)
            && !row.provider.trim().is_empty()
            && !row.model.trim().is_empty()
        {
            reserved
                .entry(id)
                .or_default()
                .insert((row.provider.clone(), row.model.clone()));
        }
    }
    let mut groups = BTreeMap::<Group, Metrics>::new();
    let mut ordinals = BTreeMap::<&str, u64>::new();
    let mut unknown_model_attempts = 0;
    let mut unknown_effort_attempts = 0;
    for attempt in &snapshot.attempts {
        let packet = packets
            .get(&attempt.packet_id)
            .ok_or_else(|| Failure::internal("model usage attempt omitted packet"))?;
        let run = runs
            .get(&packet.run_id)
            .ok_or_else(|| Failure::internal("model usage packet omitted run"))?;
        let stored = forged_proto::stored_packet(packet).ok();
        let role = stored
            .as_ref()
            .and_then(|packet| packet.execution.as_ref())
            .map(|execution| execution.role_id.as_str().to_owned());
        let purpose = stored
            .as_ref()
            .and_then(|packet| packet.execution.as_ref())
            .map(|execution| execution.purpose);
        let rows = usage
            .get(&attempt.attempt_id)
            .map(Vec::as_slice)
            .unwrap_or(&[]);
        let observed = rows
            .iter()
            .map(|row| (row.provider.clone(), row.model.clone()))
            .collect::<BTreeSet<_>>();
        let reservation = reserved
            .get(&attempt.attempt_id)
            .filter(|rows| rows.len() == 1);
        let fallback = reservation.or_else(|| (observed.len() == 1).then_some(&observed));
        let launch = selections.get(&attempt.attempt_id);
        let selection = launch.cloned().or_else(|| {
            fallback
                .and_then(|rows| rows.first())
                .map(|(provider, model)| (provider.clone(), model.clone(), None))
        });
        let mismatch = selection.as_ref().is_some_and(|(provider, model, _)| {
            observed
                .iter()
                .any(|observed| observed != &(provider.clone(), model.clone()))
        });
        let (provider, model, effort) = selection
            .map_or((None, None, None), |(provider, model, effort)| {
                (Some(provider), Some(model), effort)
            });
        unknown_model_attempts += u64::from(model.is_none());
        unknown_effort_attempts += u64::from(effort.is_none());
        let metrics = groups
            .entry(Group {
                repository: run.repo.clone(),
                role,
                provider,
                model,
                effort,
            })
            .or_default();
        metrics.attempts += 1;
        metrics.launch_selection_attempts += u64::from(launch.is_some());
        metrics.admission_selection_attempts +=
            u64::from(launch.is_none() && reservation.is_some());
        metrics.usage_model_attempts +=
            u64::from(launch.is_none() && reservation.is_none() && observed.len() == 1);
        metrics.multiple_usage_model_attempts += u64::from(observed.len() > 1);
        metrics.usage_model_mismatch_attempts += u64::from(mismatch);
        let ordinal = ordinals.entry(&attempt.packet_id).or_default();
        *ordinal += 1;
        metrics.repeat_attempts += u64::from(*ordinal > 1);
        metrics.remediation_attempts += u64::from(
            purpose == Some(SeatPurpose::Fix)
                || (purpose.is_none() && packet.stage == forged_types::Stage::Fix),
        );
        match attempt.state {
            AttemptState::Completed => metrics.completed += 1,
            AttemptState::Failed => {
                metrics.failed += 1;
                metrics.transport_failures += u64::from(
                    attempt
                        .fail_note
                        .as_deref()
                        .is_some_and(|note| note.starts_with("transport:")),
                );
            }
            AttemptState::Reclaimed => metrics.reclaimed += 1,
            AttemptState::Stopped => metrics.stopped += 1,
            AttemptState::Running | AttemptState::Revoking => metrics.in_progress += 1,
        }
        let duration = attempt.ended_at.as_deref().and_then(|ended| {
            let start = attempt.started_at.parse::<jiff::Timestamp>().ok()?;
            let end = ended.parse::<jiff::Timestamp>().ok()?;
            let nanos = end.as_nanosecond() - start.as_nanosecond();
            (nanos >= 0).then_some(nanos as f64 / 1_000_000_000.0)
        });
        if let Some(seconds) = duration {
            metrics.duration.samples += 1;
            metrics.duration.total_seconds += seconds;
        } else if !matches!(
            attempt.state,
            AttemptState::Running | AttemptState::Revoking
        ) {
            metrics.duration.missing += 1;
        }
        if purpose == Some(SeatPurpose::Review)
            || (purpose.is_none()
                && matches!(
                    packet.stage,
                    forged_types::Stage::ReviewClaude | forged_types::Stage::ReviewCodex
                ))
        {
            let result = attempt
                .result_json
                .as_deref()
                .and_then(|raw| serde_json::from_str::<PacketResult>(raw).ok());
            match result.map(|result| result.outcome) {
                Some(Outcome::Review {
                    verdict,
                    available: true,
                    ..
                }) => match verdict {
                    Verdict::Approve => metrics.review_verdicts.approve += 1,
                    Verdict::RequestChanges => metrics.review_verdicts.request_changes += 1,
                    Verdict::Block => metrics.review_verdicts.block += 1,
                },
                _ => metrics.review_verdicts.unknown += 1,
            }
        }
        metrics.cost.attempts_without_usage += u64::from(rows.is_empty());
        for row in rows {
            metrics.cost.add(row);
            metrics.tokens.add(row);
        }
    }
    let from = snapshot.attempts.iter().map(|row| &row.started_at).min();
    let to = snapshot
        .attempts
        .iter()
        .map(|row| row.ended_at.as_ref().unwrap_or(&row.updated_at))
        .max();
    let total = groups.len();
    let groups = groups
        .into_iter()
        .take(limit)
        .map(|(group, metrics)| {
            let mut row = serde_json::to_value(group)
                .map_err(|error| Failure::internal(error.to_string()))?;
            let fields = serde_json::to_value(metrics)
                .map_err(|error| Failure::internal(error.to_string()))?;
            if let (Some(row), Some(fields)) = (row.as_object_mut(), fields.as_object()) {
                row.extend(fields.clone());
            }
            Ok(row)
        })
        .collect::<Result<Vec<_>, Failure>>()?;
    Ok(json!({
        "schema": "forged.model-usage/1", "capturedAt": crate::config::now_iso(),
        "scope": {"repository": repository, "run": run}, "observed": {"from": from, "to": to}, "interpretation": INTERPRETATION,
        "coverage": {"shown": groups.len(), "total": total, "truncated": groups.len() < total}, "groups": groups,
        "attribution": {"unknownModelAttempts": unknown_model_attempts, "unknownEffortAttempts": unknown_effort_attempts, "unattributedUsageRows": unattributed_usage_rows},
        "unattributedUsage": unmatched,
    }))
}
