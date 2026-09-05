//! One reconnect projection for slice and epic execution.

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{
    AttemptState, EventRow, RevokeScope, RunOutcome, WorkItemSnapshot, WorkKind,
    WorkObservationSnapshot, WorkSpecFields, WorkStatus,
};
use forged_types::{
    AttentionItemV1, AttentionState, AttentionSubjectKind, Finding, OperationRequest,
    OperationResponse, Outcome, PacketResult, WorkIdentitySubjectKind, WorkIdentityV1, WorkRefKind,
    WorkRefV1,
};
use serde_json::{json, Map, Value};

use crate::core::{on_ledger, param_named_str, param_opt_str, read_only, Ctx, Failure};

fn request(run_id: &str, params: Value) -> OperationRequest {
    OperationRequest {
        schema_version: 1,
        idempotency_key: String::new(),
        run_id: Some(run_id.to_owned()),
        params: match params {
            Value::Object(map) => map,
            _ => Map::new(),
        },
    }
}

fn result(response: OperationResponse) -> Result<Value, Failure> {
    if response.ok {
        return Ok(response.result.unwrap_or(Value::Null));
    }
    let error = response.error.unwrap_or(forged_types::OpError {
        code: forged_types::ErrorCode::Internal,
        message: "overview dependency failed".to_owned(),
        recoverable: false,
        detail: None,
    });
    Err(Failure {
        code: error.code,
        message: error.message,
        recoverable: error.recoverable,
    })
}

async fn events(
    ctx: &Ctx,
    run_id: &str,
    kind: forged_types::WorkIdentitySubjectKind,
    after: i64,
    limit: u64,
    detail: super::ops::ProjectionDetail,
) -> Result<Value, Failure> {
    let detail = match detail {
        super::ops::ProjectionDetail::Summary => "summary",
        super::ops::ProjectionDetail::Full => "full",
    };
    let scope = match kind {
        forged_types::WorkIdentitySubjectKind::Run => json!({"run": run_id}),
        forged_types::WorkIdentitySubjectKind::Epic => {
            json!({"id": run_id, "subjectKind": "epic"})
        }
    };
    let mut params = scope.as_object().cloned().unwrap_or_default();
    params.extend(
        json!({"after": after, "limit": limit, "detail": detail})
            .as_object()
            .cloned()
            .unwrap_or_default(),
    );
    result(super::ops::events_tail(ctx, &request(run_id, Value::Object(params))).await)
}

const FULL_EVENT_HISTORY_LIMIT: u32 = 4_096;
const SUMMARY_EVENT_PAGE_LIMIT: u64 = 30;
const FULL_EVENT_PAGE_LIMIT: u64 = 100;

async fn subject_events_by_kind(
    ctx: &Ctx,
    run_id: &str,
    kind: &str,
) -> Result<Vec<Value>, Failure> {
    let run_id = run_id.to_owned();
    let kind = kind.to_owned();
    let rows = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_subject_events_by_kind(&run_id, &kind, FULL_EVENT_HISTORY_LIMIT)
    })
    .await?;
    rows.iter().map(event_json).collect()
}

async fn subject_events_by_kind_prefix(
    ctx: &Ctx,
    run_id: &str,
    prefix: &str,
) -> Result<Vec<Value>, Failure> {
    let run_id = run_id.to_owned();
    let prefix = prefix.to_owned();
    let rows = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_subject_events_by_kind_prefix(&run_id, &prefix, FULL_EVENT_HISTORY_LIMIT)
    })
    .await?;
    rows.iter().map(event_json).collect()
}

async fn packet_artifacts(ctx: &Ctx, view: &forged_proto::RunView) -> Result<Vec<Value>, Failure> {
    let run_id = view.run.run_id.clone();
    let joined = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_attempt_artifacts(&run_id)
    })
    .await?;
    let joined = joined
        .into_iter()
        .map(|row| (row.attempt_id, row))
        .collect::<BTreeMap<_, _>>();
    let run_id = view.run.run_id.clone();
    let compactions = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_attempt_artifact_compactions(&run_id)
    })
    .await?
    .into_iter()
    .map(|row| (row.attempt_id, row))
    .collect::<BTreeMap<_, _>>();
    let mut out = Vec::new();
    for packet in &view.packets {
        let (_, stage, seq) = super::split_packet_key(&packet.packet_id)?;
        let dir = ctx.config.packet_dir_key(&view.run.run_id, &stage, seq);
        let mut ids = view
            .terminal_attempts
            .get(&packet.packet_id)
            .into_iter()
            .flatten()
            .map(|attempt| attempt.attempt_id)
            .chain(
                view.live_attempts
                    .iter()
                    .filter(|attempt| attempt.packet_id == packet.packet_id)
                    .map(|attempt| attempt.attempt_id),
            )
            .collect::<Vec<_>>();
        ids.sort_unstable();
        ids.dedup();
        let attempts = ids
            .iter()
            .map(|attempt_id| match joined.get(attempt_id) {
                Some(row) => super::artifacts::joined_projection_with_compaction(
                    row,
                    compactions.get(attempt_id),
                ),
                None => super::artifacts::legacy_projection(&dir, *attempt_id),
            })
            .collect::<Vec<_>>();
        let legacy_files = ["prompt.md", "out.jsonl", "last.txt"]
            .into_iter()
            .map(|name| dir.join(name))
            .filter(|path| path.is_file())
            .map(|path| path.to_string_lossy().into_owned())
            .collect::<Vec<_>>();
        out.push(json!({
            "packetId": packet.packet_id,
            "directory": dir,
            // Backwards-compatible field for pre-attempt packet layouts.
            "files": legacy_files,
            "attempts": attempts,
        }));
    }
    Ok(out)
}

/// Per-packet terminal attempt history. The projection already carries live
/// attempts and the latest review findings; this carries what every settled
/// attempt actually landed, which is the only place a seat's own verdict,
/// summary, or failure note is readable without re-reading the ledger.
fn packet_history(view: &forged_proto::RunView) -> Value {
    view.terminal_attempts
        .iter()
        .map(|(packet_id, attempts)| {
            let rows = attempts
                .iter()
                .map(|attempt| {
                    json!({
                        "attemptId": attempt.attempt_id,
                        "state": attempt.state.as_str(),
                        "outcome": attempt.outcome,
                        "failNote": attempt.fail_note,
                        "startedAt": attempt.started_at,
                    })
                })
                .collect::<Vec<_>>();
            (packet_id.clone(), Value::Array(rows))
        })
        .collect::<Map<String, Value>>()
        .into()
}

async fn roster_revisions(ctx: &Ctx, run_id: &str) -> Result<Vec<Value>, Failure> {
    let run_id = run_id.to_owned();
    let rows = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_roster_revisions(&run_id)
    })
    .await?;
    rows.into_iter()
        .map(|row| {
            let roster_ref: Value = serde_json::from_str(&row.roster_ref_json)
                .map_err(|error| Failure::internal(format!("stored roster ref: {error}")))?;
            Ok(json!({
                "runId": row.run_id,
                "revision": row.revision,
                "rosterRef": roster_ref,
                "rosterSha256": row.roster_sha256,
                "reason": row.reason,
                "createdAt": row.created_at,
                "operationId": row.operation_id,
            }))
        })
        .collect()
}

async fn policy_revisions(ctx: &Ctx, run_id: &str) -> Result<Vec<Value>, Failure> {
    let run_id = run_id.to_owned();
    let rows = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_policy_revisions(&run_id)
    })
    .await?;
    rows.into_iter()
        .map(|row| {
            let policy: Value = serde_json::from_str(&row.policy_json)
                .map_err(|error| Failure::internal(format!("stored policy: {error}")))?;
            Ok(json!({
                "runId": row.run_id,
                "revision": row.revision,
                "policy": policy,
                "policySha256": row.policy_sha256,
                "reason": row.reason,
                "createdAt": row.created_at,
                "operationId": row.operation_id,
            }))
        })
        .collect()
}

fn summary_run_status(status: &Value) -> Value {
    json!({
        "runId": status.get("runId"),
        "state": status.get("state"),
        "stopReason": status.get("stopReason"),
        "outcome": status.get("outcome"),
        "currentStage": status.get("currentStage"),
        "gateState": status.get("gateState"),
        "seatChecks": status.get("gateState"),
        "claimHealth": status.get("claimHealth"),
        "nextAction": status.get("nextAction"),
    })
}

fn finding_counts(findings: &[Finding]) -> Value {
    let mut counts = BTreeMap::<String, usize>::new();
    for finding in findings {
        let severity = serde_json::to_value(finding)
            .ok()
            .and_then(|value| {
                value
                    .get("severity")
                    .and_then(Value::as_str)
                    .map(str::to_owned)
            })
            .unwrap_or_else(|| "unknown".to_owned());
        *counts.entry(severity).or_default() += 1;
    }
    json!({"total": findings.len(), "bySeverity": counts})
}

async fn run_overview(
    ctx: &Ctx,
    run_id: &str,
    after: i64,
    limit: u64,
    detail: super::ops::ProjectionDetail,
) -> Result<Value, Failure> {
    let identity =
        super::work_identity::load(ctx, forged_types::WorkIdentitySubjectKind::Run, run_id).await?;
    let subject = super::work_identity::projection_subject(
        &identity,
        forged_types::ProjectionSubjectKind::Run,
        run_id,
    );
    let status =
        result(super::ops::run_status(ctx, &request(run_id, json!({"run": run_id}))).await)?;
    let usage =
        result(super::ops::usage_report(ctx, &request(run_id, json!({"run": run_id}))).await)?;
    let event_page = events(
        ctx,
        run_id,
        forged_types::WorkIdentitySubjectKind::Run,
        after,
        limit,
        detail,
    )
    .await?;
    let view = super::drive::project(ctx, run_id).await?;
    let workers = if detail == super::ops::ProjectionDetail::Full {
        Some(result(
            super::sessions::session_list(ctx, &request(run_id, json!({"run": run_id}))).await,
        )?)
    } else {
        None
    };
    let packet_ids = view
        .packets
        .iter()
        .map(|packet| packet.packet_id.as_str())
        .collect::<std::collections::BTreeSet<_>>();
    let run_admission = {
        let decisions = on_ledger(&ctx.ledger, move |ledger| {
            ledger.latest_admission_decisions(None, None)
        })
        .await?;
        decisions
            .into_iter()
            .filter(|decision| {
                (decision.subject_kind == forged_types::AdmissionSubjectKind::Run
                    && decision.subject_id == run_id)
                    || (decision.subject_kind == forged_types::AdmissionSubjectKind::Packet
                        && packet_ids.contains(decision.subject_id.as_str()))
            })
            .collect::<Vec<_>>()
    };
    let findings = super::drive::latest_review_findings(&view);
    if detail == super::ops::ProjectionDetail::Summary {
        let worker_total = view.live_attempts.len();
        return Ok(json!({
            "schema": "forged.overview/1",
            "subject": subject,
            "kind": "slice",
            "id": run_id,
            "identity": status.pointer("/run/identity"),
            "events": event_page.get("events"),
            "cursor": event_page.get("last_event_id"),
            "coverage": event_page.get("coverage"),
            "status": summary_run_status(status.get("run").unwrap_or(&Value::Null)),
            "workers": {"total": worker_total},
            "gates": {
                "latestState": status.pointer("/run/gateState"),
            },
            "reviews": {
                "findingCounts": finding_counts(&findings),
            },
            "admission": {"total": run_admission.len()},
            "usage": {
                "totals": usage.pointer("/usage/totals").cloned().unwrap_or(Value::Null),
            },
        }));
    }
    let workers = workers.expect("full detail reads session metadata");
    let gates = subject_events_by_kind(ctx, run_id, "proto.gate").await?;
    let review_events = subject_events_by_kind(ctx, run_id, "proto.review").await?;
    let interventions = subject_events_by_kind_prefix(ctx, run_id, "forged.intervention.").await?;
    let roster_revisions = roster_revisions(ctx, run_id).await?;
    let policy_revisions = policy_revisions(ctx, run_id).await?;
    Ok(json!({
        "schema": "forged.overview/1",
        "subject": subject,
        "kind": "slice",
        "id": run_id,
        "identity": status.pointer("/run/identity"),
        "cursor": event_page.get("last_event_id"),
        "status": status.get("run"),
        "workers": workers,
        "gates": gates,
        "reviews": {
            "events": review_events,
            "latestFindings": findings,
        },
        "packetHistory": packet_history(&view),
        "artifacts": packet_artifacts(ctx, &view).await?,
        "interventions": interventions,
        "rosterRevisions": roster_revisions,
        "policyRevisions": policy_revisions,
        "admission": run_admission,
        "usage": usage,
        "events": event_page,
    }))
}

fn totals(value: &Value) -> BTreeMap<&'static str, f64> {
    let mut out = BTreeMap::new();
    let totals = value.pointer("/usage/totals").unwrap_or(&Value::Null);
    for key in [
        "inputTokens",
        "outputTokens",
        "cacheReadTokens",
        "cacheWriteTokens",
        "costUsdKnown",
        "rowsMissingCost",
    ] {
        out.insert(key, totals.get(key).and_then(Value::as_f64).unwrap_or(0.0));
    }
    out
}

/// Fold one child's usage report into the epic's.
///
/// Rows pass through verbatim under an idempotent `runId` stamp. A row
/// already carries the run that spent it (`usage_row_json`), and for a child's
/// own rows the stamp rewrites that field with the value it already held; it
/// is applied unconditionally so a row reaching the epic by any other path
/// still names its child, which is what the App's by-seat table labels from.
///
/// `pricing` is the one operator rate card every child reads, so the FIRST
/// block supplied stands for the whole epic and later children are ignored —
/// including a child whose `ratesAsOf` disagrees. That divergence is not
/// surfaced anywhere today; it is deliberately not a reason to fail the
/// projection, and a caller needing to detect it must compare the children's
/// own blocks.
fn absorb_usage(
    overview: &Value,
    run_id: &str,
    rows: &mut Vec<Value>,
    pricing: &mut Option<Value>,
) {
    rows.extend(
        overview
            .pointer("/usage/rows")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
            .map(|row| {
                let mut row = row.clone();
                if let Some(object) = row.as_object_mut() {
                    object.insert("runId".to_owned(), json!(run_id));
                }
                row
            }),
    );
    if pricing.is_none() {
        *pricing = overview
            .pointer("/usage/pricing")
            .filter(|block| !block.is_null())
            .cloned();
    }
}

async fn epic_overview(
    ctx: &Ctx,
    epic_id: &str,
    after: i64,
    limit: u64,
    detail: super::ops::ProjectionDetail,
) -> Result<Value, Failure> {
    let identity =
        super::work_identity::load(ctx, forged_types::WorkIdentitySubjectKind::Epic, epic_id)
            .await?;
    let subject = super::work_identity::projection_subject(
        &identity,
        forged_types::ProjectionSubjectKind::Epic,
        epic_id,
    );
    let status =
        result(super::epic::epic_status(ctx, &request(epic_id, json!({"epic": epic_id}))).await)?;
    let event_page = events(
        ctx,
        epic_id,
        forged_types::WorkIdentitySubjectKind::Epic,
        after,
        limit,
        detail,
    )
    .await?;
    let epic_admission = {
        let epic_id = epic_id.to_owned();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.latest_admission_decisions(
                Some(forged_types::AdmissionSubjectKind::Epic),
                Some(&epic_id),
            )
        })
        .await?
    };
    let mut child_runs = Vec::new();
    let mut workers = Vec::new();
    let mut worker_total = 0u64;
    let mut gates = Vec::new();
    let mut passed_gates = 0u64;
    let mut failed_gates = 0u64;
    let mut unknown_gates = 0u64;
    let mut reviews = Vec::new();
    let mut review_total = 0u64;
    let mut artifacts = Vec::new();
    let mut interventions = Vec::new();
    let mut usage = BTreeMap::<&'static str, f64>::new();
    let mut usage_rows = Vec::new();
    let mut usage_pricing = None;
    for child in status
        .get("children")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        let Some(run_id) = child.get("runId").and_then(Value::as_str) else {
            continue;
        };
        match run_overview(ctx, run_id, 0, limit.min(25), detail).await {
            Ok(mut overview) => {
                if detail == super::ops::ProjectionDetail::Full {
                    workers.extend(
                        overview
                            .pointer("/workers/sessions")
                            .and_then(Value::as_array)
                            .into_iter()
                            .flatten()
                            .cloned(),
                    );
                    gates.extend(
                        overview
                            .get("gates")
                            .and_then(Value::as_array)
                            .into_iter()
                            .flatten()
                            .cloned(),
                    );
                    reviews.extend(
                        overview
                            .pointer("/reviews/latestFindings")
                            .and_then(Value::as_array)
                            .into_iter()
                            .flatten()
                            .cloned(),
                    );
                    artifacts.extend(
                        overview
                            .get("artifacts")
                            .and_then(Value::as_array)
                            .into_iter()
                            .flatten()
                            .cloned(),
                    );
                    interventions.extend(
                        overview
                            .get("interventions")
                            .and_then(Value::as_array)
                            .into_iter()
                            .flatten()
                            .cloned(),
                    );
                } else {
                    worker_total += overview
                        .pointer("/workers/total")
                        .and_then(Value::as_u64)
                        .unwrap_or(0);
                    match overview
                        .pointer("/gates/latestState")
                        .and_then(Value::as_str)
                    {
                        Some("passed") => passed_gates += 1,
                        Some("failed") => failed_gates += 1,
                        _ => unknown_gates += 1,
                    }
                    review_total += overview
                        .pointer("/reviews/findingCounts/total")
                        .and_then(Value::as_u64)
                        .unwrap_or(0);
                }
                for (key, value) in totals(&overview) {
                    *usage.entry(key).or_default() += value;
                }
                absorb_usage(&overview, run_id, &mut usage_rows, &mut usage_pricing);
                overview.as_object_mut().map(|value| value.remove("events"));
                child_runs.push(overview);
            }
            Err(error) => child_runs.push(json!({
                "kind": "slice",
                "id": run_id,
                "error": {"code": error.code, "message": error.message},
            })),
        }
    }
    if detail == super::ops::ProjectionDetail::Summary {
        return Ok(json!({
            "schema": "forged.overview/1",
            "subject": subject,
            "kind": "epic",
            "id": epic_id,
            "identity": status.get("identity"),
            "events": event_page.get("events"),
            "cursor": event_page.get("last_event_id"),
            "coverage": event_page.get("coverage"),
            "status": {
                "state": status.get("state"),
                "executionHealth": status.get("executionHealth"),
                "desiredState": status.get("desiredState"),
                "nextAction": status.get("nextAction"),
            },
            "children": {
                "total": child_runs.len(),
                "items": child_runs,
            },
            "workers": {"total": worker_total},
            "gates": {
                "passed": passed_gates,
                "failed": failed_gates,
                "unknown": unknown_gates,
            },
            "reviews": {"findingCounts": {"total": review_total}},
            "admission": {"total": epic_admission.len()},
            "usage": {"totals": usage},
            "inputRequired": status.get("inputRequired"),
            "paused": status.get("paused"),
        }));
    }
    let scheduler_events = subject_events_by_kind_prefix(ctx, epic_id, "forged.epic.").await?;
    Ok(json!({
        "schema": "forged.overview/1",
        "subject": subject,
        "kind": "epic",
        "id": epic_id,
        "identity": status.get("identity"),
        "cursor": event_page.get("last_event_id"),
        "status": status,
        "childRuns": child_runs,
        "workers": workers,
        "gates": gates,
        "reviews": reviews,
        "artifacts": artifacts,
        "interventions": interventions,
        "admission": epic_admission,
        "schedulerEvents": scheduler_events,
        "usage": {
            "rows": usage_rows,
            "totals": usage,
            // An epic with no children that reported usage still states the
            // card its spend would be priced against: absent usage is data.
            "pricing": usage_pricing.unwrap_or_else(|| super::ops::pricing_json(&ctx.config)),
        },
        "events": event_page,
        "inputRequired": status.get("inputRequired"),
        "paused": status.get("paused"),
    }))
}

/// The maximum diagnostic entries a full portfolio carries. Summary mode
/// inherits Operations' 30-row default.
///
/// The inventory grows for the life of the operator's ledger and is never
/// pruned, so an uncapped portfolio eventually becomes a payload no host
/// will carry. Full retains the v0.7.1 cap so its body remains a compatible
/// superset.
const PORTFOLIO_CAP: usize = 200;

/// The portfolio: every unit of work and what needs a human, for a caller
/// that cannot name a subject yet.
///
/// Newest first, 30 summary entries by default and up to
/// [`PORTFOLIO_CAP`] in full detail, with totals stated. `spend`
/// and `attentionTotal` cover the WHOLE inventory, never the capped page:
/// a figure that quietly described only what fit would be read as complete.
/// `attention` is present and empty when nothing needs a human — an omitted
/// key is indistinguishable from an unimplemented one.
///
/// Carries no event page: `after`/`limit` address one subject's stream, and
/// the portfolio is the level above any subject.
async fn portfolio_overview(ctx: &Ctx, req: &OperationRequest) -> Result<Value, Failure> {
    let detail = super::ops::projection_detail(req, "overview")?;
    let mut operations_req = req.clone();
    if detail == super::ops::ProjectionDetail::Full {
        operations_req
            .params
            .insert("limit".to_owned(), json!(PORTFOLIO_CAP));
        operations_req
            .params
            .insert("symptoms".to_owned(), json!(true));
    }
    let operations = super::ops::operations_projection(ctx, &operations_req).await?;
    let queue_groups = super::ops::durable_compatibility_groups(&operations);
    let entries = queue_groups
        .iter()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .cloned()
        .collect::<Vec<_>>();
    let total = operations
        .pointer("/counts/durable")
        .and_then(Value::as_u64)
        .unwrap_or(entries.len() as u64);
    let attention_total = operations
        .pointer("/counts/attention")
        .and_then(Value::as_u64)
        .unwrap_or(0);
    let attention = if detail == super::ops::ProjectionDetail::Full {
        operations
            .get("attention")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
            .take(PORTFOLIO_CAP)
            .cloned()
            .collect::<Vec<_>>()
            .into()
    } else {
        operations.get("attention").cloned().unwrap_or(Value::Null)
    };
    let admission = entries
        .iter()
        .flat_map(|entry| {
            entry
                .pointer("/admission/decisions")
                .and_then(Value::as_array)
                .into_iter()
                .flatten()
        })
        .cloned()
        .collect::<Vec<_>>();
    let live_seats = entries
        .iter()
        .filter_map(|entry| entry.get("liveSeats").and_then(Value::as_u64))
        .sum::<u64>();
    let cap = if detail == super::ops::ProjectionDetail::Full {
        json!(PORTFOLIO_CAP)
    } else {
        operations
            .pointer("/coverage/limit")
            .cloned()
            .unwrap_or(json!(30))
    };
    let queue = json!({
        "groups": queue_groups,
        "total": total,
        "cap": cap,
        "asOf": operations.pointer("/capturedAt/ledger").cloned().unwrap_or(Value::Null),
    });
    Ok(json!({
        "schema": "forged.overview/1",
        "subject": {
            "id": "portfolio",
            "kind": "portfolio",
            "title": "Forged portfolio",
            "repository": Value::Null,
            "revision": Value::Null,
        },
        "kind": "portfolio",
        "entries": entries,
        "total": total,
        "cap": cap,
        "liveSeats": live_seats,
        "attention": attention,
        "attentionTotal": attention_total,
        "queue": queue,
        "coverage": operations.get("coverage").cloned().unwrap_or(Value::Null),
        // Verbatim Operations counts.
        "counts": operations.get("counts").cloned().unwrap_or(Value::Null),
        "admission": admission,
        "spend": {
            "costUsdKnown": operations.pointer("/spend/costUsdKnown").cloned().unwrap_or(json!(0.0)),
            "rowsMissingCost": operations.pointer("/spend/rowsMissingCost").cloned().unwrap_or(json!(0)),
        },
        "sourceHealth": operations.get("sourceHealth").cloned().unwrap_or(Value::Null),
    }))
}

/// One result from the shared operator-id resolver. Every read surface uses
/// this contract so precedence and namespace disambiguation cannot drift.
pub(crate) enum ResolvedId {
    WorkItem(Box<WorkItemSnapshot>),
    Run(String),
    Epic(String),
    Attempt(Box<forged_ledger::AttemptRow>),
    Attention(Box<AttentionItemV1>),
    Unresolved(Value),
}

fn resolution(id: &str, reason: &str, candidates: Vec<Value>, disambiguate: bool) -> Value {
    json!({
        "query": id,
        "reason": reason,
        "candidates": candidates,
        "remedy": {
            "schema": "forged.remedy/1",
            "verb": "explain",
            "args": {"id": id},
            "reason": if disambiguate {
                "rerun this read with --subject-kind to select one namespace"
            } else {
                "inspect this id with explain --id"
            },
        },
    })
}

/// Resolve a bare `id` to a kind through the shared operator index.
///
/// Exact Work lookup retains the normative precedence. Durable run/epic
/// identities preserve otherwise-folded namespace collisions, and the
/// inventory `work_list` serves remains the bounded prefix index.
///
/// An exact id always wins over any prefix interpretation of the same
/// string, so a shorter id that prefixes a longer one is never shadowed by
/// it. A prefix resolves only when exactly one entry matches; zero is
/// `unknown` with an empty candidate list and two or more is `ambiguous`
/// with those entries. Neither is an error: a wrong guess degrades into a
/// menu, and "nothing could have been meant" is a successful answer.
pub(crate) async fn resolve_id(
    ctx: &Ctx,
    id: &str,
    subject_kind: Option<&str>,
) -> Result<ResolvedId, Failure> {
    resolve_id_with_attention(ctx, id, subject_kind, None).await
}

async fn resolve_id_with_attention(
    ctx: &Ctx,
    id: &str,
    subject_kind: Option<&str>,
    attention: Option<&[AttentionItemV1]>,
) -> Result<ResolvedId, Failure> {
    let subject_kind = subject_kind
        .map(|kind| match kind {
            "work" | "work-item" => Ok("work"),
            "run" | "slice" => Ok("run"),
            "epic" => Ok("epic"),
            "attempt" => Ok("attempt"),
            "attention" => Ok("attention"),
            other => Err(Failure::invalid(format!(
                "subjectKind must be work, run, epic, attempt, or attention, got {other:?}"
            ))),
        })
        .transpose()?;

    if subject_kind.is_none() || subject_kind == Some("work") {
        let work_id = id.to_owned();
        if let Some(work) = on_ledger(&ctx.ledger, move |ledger| ledger.work_item(&work_id)).await?
        {
            return Ok(ResolvedId::WorkItem(Box::new(work)));
        }
        if subject_kind.is_some() {
            return Ok(ResolvedId::Unresolved(resolution(
                id,
                "unknown",
                Vec::new(),
                false,
            )));
        }
    }

    let entries = super::ops::inventory(ctx, super::ops::Spend::Omit).await?;
    let resolved = |entry: &Value| {
        let entry_id = entry["id"].as_str().unwrap_or_default().to_owned();
        match entry["kind"].as_str() {
            Some("epic") => ResolvedId::Epic(entry_id),
            _ => ResolvedId::Run(entry_id),
        }
    };
    if subject_kind.is_none() || matches!(subject_kind, Some("run" | "epic")) {
        // Inventory intentionally folds a legacy run row and an epic start
        // with the same id into one epic entry. Identity rows preserve both
        // namespaces, so consult them for exact resolution and expose the
        // collision instead of silently picking the folded entry.
        let identities = on_ledger(&ctx.ledger, |ledger| ledger.list_work_identities()).await?;
        let exact_run =
            identities.get(&(forged_types::WorkIdentitySubjectKind::Run, id.to_owned()));
        let exact_epic =
            identities.get(&(forged_types::WorkIdentitySubjectKind::Epic, id.to_owned()));
        match subject_kind {
            Some("run") if exact_run.is_some() => return Ok(ResolvedId::Run(id.to_owned())),
            Some("epic") if exact_epic.is_some() => return Ok(ResolvedId::Epic(id.to_owned())),
            None if exact_run.is_some() && exact_epic.is_none() => {
                return Ok(ResolvedId::Run(id.to_owned()))
            }
            None if exact_epic.is_some() && exact_run.is_none() => {
                return Ok(ResolvedId::Epic(id.to_owned()))
            }
            _ => {}
        }
        if let (None, Some(exact_run), Some(exact_epic)) = (subject_kind, exact_run, exact_epic) {
            let candidate = |kind: &str, identity: &forged_types::WorkIdentityV1| {
                let mut candidate = entries
                    .iter()
                    .find(|entry| entry["id"] == json!(id))
                    .cloned()
                    .unwrap_or_else(|| json!({"id": id}));
                candidate["kind"] = json!(kind);
                candidate["identity"] = json!(identity);
                candidate["beadId"] = json!(identity.work.id);
                candidate
            };
            return Ok(ResolvedId::Unresolved(resolution(
                id,
                "ambiguous",
                vec![candidate("slice", exact_run), candidate("epic", exact_epic)],
                true,
            )));
        }
        if subject_kind.is_some() {
            return Ok(ResolvedId::Unresolved(resolution(
                id,
                "unknown",
                Vec::new(),
                false,
            )));
        }
    }

    if subject_kind.is_none() || subject_kind == Some("attempt") {
        if let Ok(attempt_id) = id.parse::<i64>() {
            if let Some(attempt) =
                on_ledger(&ctx.ledger, move |ledger| ledger.find_attempt(attempt_id)).await?
            {
                return Ok(ResolvedId::Attempt(Box::new(attempt)));
            }
        }
        if subject_kind.is_some() {
            return Ok(ResolvedId::Unresolved(resolution(
                id,
                "unknown",
                Vec::new(),
                false,
            )));
        }
    }

    if subject_kind.is_none() || subject_kind == Some("attention") {
        let item = if let Some(attention) = attention {
            attention
                .iter()
                .find(|item| item.attention_id == id)
                .cloned()
        } else {
            super::ops::all_attention(ctx)
                .await?
                .into_iter()
                .find(|item| item.attention_id == id)
        };
        if let Some(item) = item {
            return Ok(ResolvedId::Attention(Box::new(item)));
        }
        if subject_kind.is_some() {
            return Ok(ResolvedId::Unresolved(resolution(
                id,
                "unknown",
                Vec::new(),
                false,
            )));
        }
    }

    let candidates = entries
        .into_iter()
        .filter(|entry| {
            entry["id"]
                .as_str()
                .is_some_and(|entry_id| entry_id.starts_with(id))
        })
        .collect::<Vec<_>>();
    if candidates.len() == 1 {
        return Ok(resolved(&candidates[0]));
    }
    let ambiguous = !candidates.is_empty();
    Ok(ResolvedId::Unresolved(resolution(
        id,
        if !ambiguous { "unknown" } else { "ambiguous" },
        candidates,
        ambiguous,
    )))
}

pub(crate) enum ExecutionTarget {
    Run(String),
    Epic(String),
    Unresolved(Value),
}

pub(crate) async fn execution_target(
    ctx: &Ctx,
    id: &str,
    subject_kind: Option<&str>,
) -> Result<ExecutionTarget, Failure> {
    Ok(match resolve_id(ctx, id, subject_kind).await? {
        ResolvedId::Run(run) => ExecutionTarget::Run(run),
        ResolvedId::Epic(epic) => ExecutionTarget::Epic(epic),
        ResolvedId::Attempt(attempt) => {
            let (run, _, _) = super::split_packet_key(&attempt.packet_id)?;
            ExecutionTarget::Run(run)
        }
        ResolvedId::Attention(item) => match item.subject_kind {
            AttentionSubjectKind::Run => ExecutionTarget::Run(item.subject_id),
            AttentionSubjectKind::Epic => ExecutionTarget::Epic(item.subject_id),
        },
        ResolvedId::WorkItem(work) => {
            let work_id = work.work_id;
            let work_id_for_runs = work_id.clone();
            let mut runs = on_ledger(&ctx.ledger, move |ledger| ledger.list_runs()).await?;
            runs.retain(|run| run.work_id == work_id_for_runs);
            match runs.pop() {
                Some(run) => ExecutionTarget::Run(run.run_id),
                None if subject_kind.is_none() => {
                    // A started epic commonly has the same id as its root
                    // Work but deliberately has no runs row of its own. Work
                    // keeps exact resolver precedence; execution reads still
                    // recover the executable epic projection instead of a
                    // no-run dead end. Explicit `subjectKind: work` retains
                    // the per-kind no-run answer.
                    let epic_id = work_id.clone();
                    let epic = on_ledger(&ctx.ledger, move |ledger| {
                        ledger.get_work_identity(
                            forged_types::WorkIdentitySubjectKind::Epic,
                            &epic_id,
                        )
                    })
                    .await?;
                    match epic {
                        Some(_) => ExecutionTarget::Epic(work_id),
                        None => {
                            ExecutionTarget::Unresolved(resolution(id, "no-run", Vec::new(), false))
                        }
                    }
                }
                None => ExecutionTarget::Unresolved(resolution(id, "no-run", Vec::new(), false)),
            }
        }
        ResolvedId::Unresolved(value) => ExecutionTarget::Unresolved(value),
    })
}

const EXPLAIN_COLLECTION_CAP: usize = 50;

async fn explain_observation(
    ctx: &Ctx,
    kind: forged_types::WorkIdentitySubjectKind,
    id: &str,
) -> Result<WorkObservationSnapshot, Failure> {
    let id = id.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.work_observation_snapshot(
            kind,
            &id,
            0,
            forged_ledger::WORK_OBSERVATION_MAX_EVENT_LIMIT,
        )
    })
    .await
}

async fn complete_attention_observation(
    ctx: &Ctx,
    kind: forged_types::WorkIdentitySubjectKind,
    id: &str,
) -> Result<WorkObservationSnapshot, Failure> {
    let mut observation = explain_observation(ctx, kind, id).await?;
    while observation.events.has_more {
        let after = observation.events.next_after_event_id.ok_or_else(|| {
            Failure::internal("truncated work observation has no next event cursor")
        })?;
        let id = id.to_owned();
        let page = on_ledger(&ctx.ledger, move |ledger| {
            ledger.work_observation_snapshot(
                kind,
                &id,
                after,
                forged_ledger::WORK_OBSERVATION_MAX_EVENT_LIMIT,
            )
        })
        .await?;
        if page.events.rows.is_empty() {
            return Err(Failure::internal(
                "truncated work observation returned an empty next event page",
            ));
        }
        observation.events.rows.extend(page.events.rows);
        observation.events.next_after_event_id = page.events.next_after_event_id;
        observation.events.has_more = page.events.has_more;
    }
    Ok(observation)
}

/// Fold attention from one exact observation instead of scanning the whole
/// operator inventory. Blocking reads use this so their five-second decision
/// cadence costs one subject, regardless of portfolio size.
pub(crate) async fn subject_attention(
    ctx: &Ctx,
    kind: AttentionSubjectKind,
    id: &str,
) -> Result<Vec<AttentionItemV1>, Failure> {
    let observation_kind = match kind {
        AttentionSubjectKind::Run => forged_types::WorkIdentitySubjectKind::Run,
        AttentionSubjectKind::Epic => forged_types::WorkIdentitySubjectKind::Epic,
    };
    let observation = complete_attention_observation(ctx, observation_kind, id).await?;
    let live_work = crate::core::workstore::list_issues(
        &ctx.ledger,
        std::slice::from_ref(&observation.identity.work.id),
    )
    .await
    .ok()
    .and_then(|issues| {
        issues
            .into_iter()
            .find(|issue| issue.id == observation.identity.work.id)
    });
    let title = forged_types::resolve_work_title(
        &observation.identity,
        live_work.as_ref().map(|issue| issue.title.as_str()),
    );
    let decoded = decode_packets_and_results(&observation)?;
    let review = review_projection(&observation, &decoded.packets, &decoded.results);
    super::attention::project_observation(
        &observation,
        &review.disagreements,
        &decoded.results,
        &title,
        live_work.as_ref(),
        ctx.config.ack_window_s,
    )
}

fn run_observation_inputs<'a>(
    snapshot: &'a WorkObservationSnapshot,
    run: &forged_ledger::RunRow,
) -> super::health::HealthInputs<'a> {
    let desired = snapshot.desired_work.iter().find(|row| {
        row.subject_kind == forged_ledger::DesiredSubjectKind::Run && row.subject_id == run.run_id
    });
    let admission_deferred = snapshot.admission_decisions.iter().any(|decision| {
        decision.subject_kind == forged_types::AdmissionSubjectKind::Run
            && decision.subject_id == run.run_id
            && decision.outcome == forged_types::AdmissionOutcome::Deferred
    });
    let live_attempt = snapshot
        .attempts
        .iter()
        .any(|attempt| attempt.state == AttemptState::Running);
    super::health::HealthInputs::observation(
        true,
        run.state == forged_ledger::RunState::Stopped,
        false,
        run.terminal_outcome == Some(RunOutcome::InputRequired),
        admission_deferred,
        desired,
        live_attempt.then_some(true),
    )
}

fn epic_observation_inputs(snapshot: &WorkObservationSnapshot) -> super::health::HealthInputs<'_> {
    let complete_events = snapshot.events.after_event_id == 0 && !snapshot.events.has_more;
    let mut latest_pause: Option<(&str, i64)> = None;
    let mut latest_input: Option<(&str, i64)> = None;
    let mut terminal = false;
    if complete_events {
        for event in &snapshot.events.rows {
            match event.kind.as_str() {
                super::epic::PAUSED | super::epic::RESUMED => {
                    latest_pause = Some((&event.kind, event.event_id));
                }
                super::epic::INPUT_REQUIRED | super::epic::INPUT_RESOLVED => {
                    latest_input = Some((&event.kind, event.event_id));
                }
                super::epic::EPIC_PR => {
                    let nonterminal = serde_json::from_str::<Value>(&event.payload_json)
                        .ok()
                        .and_then(|payload| payload.get("terminal").and_then(Value::as_bool))
                        == Some(false);
                    terminal |= !nonterminal;
                }
                super::epic::ASSURANCE_COMPLETED => terminal = true,
                _ => {}
            }
        }
    }
    let desired = snapshot.desired_work.iter().find(|row| {
        row.subject_kind == forged_ledger::DesiredSubjectKind::Epic
            && row.subject_id == snapshot.subject.id
    });
    let admission_deferred = snapshot
        .admission_decisions
        .iter()
        .find(|decision| {
            decision.subject_kind == forged_types::AdmissionSubjectKind::Epic
                && decision.subject_id == snapshot.subject.id
        })
        .is_some_and(|decision| decision.outcome == forged_types::AdmissionOutcome::Deferred);
    super::health::HealthInputs::observation(
        true,
        terminal,
        latest_pause.is_some_and(|(kind, _)| kind == super::epic::PAUSED),
        latest_input.is_some_and(|(kind, _)| kind == super::epic::INPUT_REQUIRED),
        admission_deferred,
        desired,
        None,
    )
}

fn observation_inputs(
    snapshot: &WorkObservationSnapshot,
) -> Result<super::health::HealthInputs<'_>, Failure> {
    match snapshot.subject.kind {
        forged_types::WorkIdentitySubjectKind::Run => {
            let run = snapshot
                .runs
                .iter()
                .find(|run| run.run_id == snapshot.subject.id)
                .ok_or_else(|| {
                    Failure::internal("run observation snapshot omitted its requested run")
                })?;
            Ok(run_observation_inputs(snapshot, run))
        }
        forged_types::WorkIdentitySubjectKind::Epic => Ok(epic_observation_inputs(snapshot)),
    }
}

fn explain_how_with_verdict(inputs: super::health::HealthInputs<'_>, verdict: &str) -> Value {
    json!({
        "verdict": verdict,
        "inputs": inputs.summary(),
    })
}

fn explain_how(inputs: super::health::HealthInputs<'_>) -> Value {
    explain_how_with_verdict(inputs, super::health::execution_health(inputs))
}

async fn projected_lifecycle(
    ctx: &Ctx,
    identity: &WorkIdentityV1,
    attention: &[AttentionItemV1],
) -> Result<super::lifecycle::Lifecycle, Failure> {
    let work_id = identity.work.id.clone();
    let work = on_ledger(&ctx.ledger, move |ledger| ledger.work_item(&work_id)).await?;
    let work = work.unwrap_or_else(|| {
        let mut metadata = BTreeMap::new();
        if let Some(repository) = &identity.repository {
            metadata.insert("repository".to_owned(), repository.path.clone());
        }
        WorkItemSnapshot {
            work_id: identity.work.id.clone(),
            kind: if identity.subject.kind == WorkIdentitySubjectKind::Epic {
                WorkKind::Epic
            } else {
                WorkKind::Task
            },
            status: WorkStatus::Open,
            priority: None,
            assignee: None,
            metadata,
            revision: identity
                .work
                .revision
                .as_deref()
                .and_then(|revision| revision.parse().ok())
                .unwrap_or(0),
            spec: WorkSpecFields {
                title: identity
                    .work
                    .title
                    .clone()
                    .unwrap_or_else(|| identity.display_title.clone()),
                description: String::new(),
                acceptance_criteria: String::new(),
                design: String::new(),
                notes: String::new(),
            },
            created_at: identity.captured_at.clone(),
            updated_at: identity.captured_at.clone(),
        }
    });
    super::lifecycle::project(ctx, std::slice::from_ref(&work), attention)
        .await?
        .remove(&work.work_id)
        .ok_or_else(|| Failure::internal("lifecycle projection omitted its work item"))
}

pub(crate) async fn explain_work_item(
    ctx: &Ctx,
    work: WorkItemSnapshot,
    attention: &[AttentionItemV1],
) -> Result<Value, Failure> {
    let work_id = work.work_id.clone();
    let mut runs = on_ledger(&ctx.ledger, move |ledger| ledger.list_runs()).await?;
    runs.retain(|run| run.work_id == work_id);
    let latest = runs.last().cloned();
    let work_verdict = match work.status {
        forged_ledger::WorkStatus::Closed => Some("closed"),
        forged_ledger::WorkStatus::Deferred => Some("parked"),
        _ => None,
    };
    let how = if let Some(run) = latest.as_ref() {
        let observation =
            explain_observation(ctx, forged_types::WorkIdentitySubjectKind::Run, &run.run_id)
                .await?;
        let inputs = observation_inputs(&observation)?;
        let verdict = if run.terminal_outcome == Some(RunOutcome::Landed)
            || (run.delivery_pr.is_some() && run.delivery_sha.is_some())
        {
            "landed"
        } else if run.state == forged_ledger::RunState::Active {
            "running"
        } else {
            work_verdict.unwrap_or_else(|| super::health::execution_health(inputs))
        };
        explain_how_with_verdict(inputs, verdict)
    } else {
        let inputs =
            super::health::HealthInputs::observation(false, false, false, false, false, None, None);
        let verdict = work_verdict.unwrap_or_else(|| super::health::execution_health(inputs));
        explain_how_with_verdict(inputs, verdict)
    };
    let total = runs.len();
    let run_items = runs
        .iter()
        .rev()
        .take(EXPLAIN_COLLECTION_CAP)
        .map(|run| {
            json!({
                "id": run.run_id,
                "state": run.state.as_str(),
                "outcome": run.terminal_outcome.map(RunOutcome::as_str),
                "createdAt": run.created_at,
                "updatedAt": run.updated_at,
            })
        })
        .collect::<Vec<_>>();
    let lifecycle = super::lifecycle::project(ctx, std::slice::from_ref(&work), attention)
        .await?
        .remove(&work.work_id)
        .ok_or_else(|| Failure::internal("work lifecycle projection omitted its item"))?;
    let next = super::work_ops::projection_actions(&work, lifecycle.stage);
    Ok(json!({
        "schema": "forged.explain/1",
        "subject": {
            "id": work.work_id,
            "kind": "work",
            "title": work.spec.title,
            "repository": work.metadata.get("repository"),
            "revision": work.revision,
        },
        "kind": "work-item",
        "id": work.work_id,
        "what": {
            "kind": work.kind.as_str(),
            "title": work.spec.title,
            "status": work.status.as_str(),
            "priority": work.priority,
            "assignee": work.assignee,
            "revision": work.revision,
            "repository": work.metadata.get("repository"),
            "healthRunId": latest.as_ref().map(|run| run.run_id.as_str()),
            "runs": {
                "items": run_items,
                "total": total,
                "limit": EXPLAIN_COLLECTION_CAP,
                "truncated": total > EXPLAIN_COLLECTION_CAP,
            },
            "show": {
                "verb": "work show",
                "args": {"id": work.work_id},
            },
        },
        "how": how,
        "lifecycle": lifecycle,
        "next": next,
    }))
}

fn subject_attention_actions(
    attention: &[AttentionItemV1],
    kind: AttentionSubjectKind,
    id: &str,
) -> Vec<forged_types::OperationActionV1> {
    let mut actions = Vec::new();
    for item in attention.iter().filter(|item| {
        item.subject_kind == kind && item.subject_id == id && item.state != AttentionState::Resolved
    }) {
        for action in &item.next_actions {
            if !actions.contains(action) {
                actions.push(action.clone());
            }
        }
    }
    actions
}

/// Rank one subject's advertised actions into its `next`. Duplicates (same
/// verb and args) merge into the earliest occurrence and keep the strongest
/// class, so a lifecycle `can` and a decision `should` for one verb collapse
/// into one `should`. Then exactly one `should` survives — the first in
/// emitter order, which callers arrange lifecycle-first so a run's own
/// outcome outranks an open decision — and it moves to `next[0]`; every
/// later `should` demotes to `can`. Returns the list capped at
/// `EXPLAIN_COLLECTION_CAP` with the pre-cap total so the caller states
/// coverage.
fn rank_subject_actions(
    actions: Vec<forged_types::OperationActionV1>,
) -> (Vec<forged_types::OperationActionV1>, usize) {
    let mut merged: Vec<forged_types::OperationActionV1> = Vec::with_capacity(actions.len());
    for action in actions {
        if let Some(seen) = merged
            .iter_mut()
            .find(|seen| seen.verb == action.verb && seen.args == action.args)
        {
            if action.class == forged_types::ActionClass::Should {
                seen.class = forged_types::ActionClass::Should;
            }
            continue;
        }
        merged.push(action);
    }
    let total = merged.len();
    let mut first_should = None;
    for (index, action) in merged.iter_mut().enumerate() {
        if action.class != forged_types::ActionClass::Should {
            continue;
        }
        if first_should.is_none() {
            first_should = Some(index);
        } else {
            action.class = forged_types::ActionClass::Can;
        }
    }
    if let Some(index) = first_should {
        merged[..=index].rotate_right(1);
    }
    merged.truncate(EXPLAIN_COLLECTION_CAP);
    (merged, total)
}

fn next_coverage(shown: usize, total: usize) -> Value {
    json!({
        "shown": shown,
        "total": total,
        "limit": EXPLAIN_COLLECTION_CAP,
        "truncated": total > shown,
    })
}

pub(crate) async fn explain_run(
    ctx: &Ctx,
    id: String,
    attention: &[AttentionItemV1],
) -> Result<Value, Failure> {
    let observation =
        explain_observation(ctx, forged_types::WorkIdentitySubjectKind::Run, &id).await?;
    let run = observation
        .runs
        .iter()
        .find(|run| run.run_id == id)
        .ok_or_else(|| Failure::internal("run observation snapshot omitted its requested run"))?;
    let inputs = run_observation_inputs(&observation, run);
    let current_stage = observation
        .attempts
        .iter()
        .filter(|attempt| attempt.state == AttemptState::Running)
        .max_by_key(|attempt| attempt.attempt_id)
        .and_then(|attempt| super::split_packet_key(&attempt.packet_id).ok())
        .map(|(_, stage, _)| stage);
    let live_attempts = observation
        .attempts
        .iter()
        .filter(|attempt| attempt.state == AttemptState::Running)
        .count();
    let provenance = super::ops::run_provenance(ctx, &run.run_id).await?;
    let policy_revision = {
        let run_id = run.run_id.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.latest_policy_revision(&run_id)
        })
        .await?
        .map(|revision| revision.revision)
    };
    // Lifecycle first: the run's own outcome names the one `should`; open
    // decisions on the same subject merge into it or demote to `can`.
    let mut next = super::ops::run_projection_actions(run);
    next.extend(subject_attention_actions(
        attention,
        AttentionSubjectKind::Run,
        &id,
    ));
    let (next, next_total) = rank_subject_actions(next);
    let next_coverage = next_coverage(next.len(), next_total);
    let lifecycle = projected_lifecycle(ctx, &observation.identity, attention).await?;
    Ok(json!({
        "schema": "forged.explain/1",
        "subject": super::work_identity::projection_subject(
            &observation.identity,
            forged_types::ProjectionSubjectKind::Run,
            &run.run_id,
        ),
        "kind": "run",
        "id": run.run_id,
        "what": {
            "identity": observation.identity,
            "workId": run.work_id,
            "retryOf": provenance.retry_of,
            "startedFrom": provenance.started_from,
            "policyRevision": policy_revision,
            "state": run.state.as_str(),
            "outcome": run.terminal_outcome.map(RunOutcome::as_str),
            "stopReason": run.stop_reason,
            "currentStage": current_stage,
            "liveAttempts": live_attempts,
            "repository": run.repo,
            "baseRef": run.base_ref,
            "branch": run.branch,
            "createdAt": run.created_at,
            "updatedAt": run.updated_at,
        },
        "how": explain_how(inputs),
        "lifecycle": lifecycle,
        "next": next,
        "nextCoverage": next_coverage,
    }))
}

pub(crate) async fn explain_epic(
    ctx: &Ctx,
    id: String,
    attention: &[AttentionItemV1],
) -> Result<Value, Failure> {
    let observation =
        explain_observation(ctx, forged_types::WorkIdentitySubjectKind::Epic, &id).await?;
    let (status, delivery, inputs) = epic_status_delivery(&observation)?;
    let verdict = status
        .get("executionHealth")
        .and_then(Value::as_str)
        .ok_or_else(|| Failure::internal("epic observation omitted execution health"))?;
    let total = observation.epic_children.len();
    let children = observation
        .epic_children
        .iter()
        .take(EXPLAIN_COLLECTION_CAP)
        .map(|child| {
            json!({
                "childId": child.child_id,
                "runId": child.run_id,
                "phase": child.phase.as_str(),
            })
        })
        .collect::<Vec<_>>();
    let (next, next_total) = rank_subject_actions(subject_attention_actions(
        attention,
        AttentionSubjectKind::Epic,
        &id,
    ));
    let next_coverage = next_coverage(next.len(), next_total);
    let lifecycle = projected_lifecycle(ctx, &observation.identity, attention).await?;
    Ok(json!({
        "schema": "forged.explain/1",
        "subject": super::work_identity::projection_subject(
            &observation.identity,
            forged_types::ProjectionSubjectKind::Epic,
            &id,
        ),
        "kind": "epic",
        "id": id,
        "what": {
            "identity": observation.identity,
            "workId": observation.identity.work.id,
            "state": status.get("state"),
            "delivery": delivery,
            "children": {
                "items": children,
                "total": total,
                "limit": EXPLAIN_COLLECTION_CAP,
                "truncated": total > EXPLAIN_COLLECTION_CAP,
            },
        },
        "how": explain_how_with_verdict(inputs, verdict),
        "lifecycle": lifecycle,
        "next": next,
        "nextCoverage": next_coverage,
    }))
}

async fn explain_attempt(
    ctx: &Ctx,
    resolved: forged_ledger::AttemptRow,
    attention: &[AttentionItemV1],
) -> Result<Value, Failure> {
    let (run_id, stage, _) = super::split_packet_key(&resolved.packet_id)?;
    let observation =
        explain_observation(ctx, forged_types::WorkIdentitySubjectKind::Run, &run_id).await?;
    let run = observation
        .runs
        .iter()
        .find(|run| run.run_id == run_id)
        .ok_or_else(|| Failure::internal("attempt observation omitted its owning run"))?;
    let attempt = observation
        .attempts
        .iter()
        .find(|attempt| attempt.attempt_id == resolved.attempt_id)
        .ok_or_else(|| Failure::internal("attempt observation omitted its requested attempt"))?;
    let policy_revision = {
        let packet_id = attempt.packet_id.clone();
        on_ledger(&ctx.ledger, move |ledger| ledger.get_packet(&packet_id))
            .await?
            .policy_revision
    };
    let inputs = run_observation_inputs(&observation, run);
    let mut how = explain_how(inputs);
    how["attempt"] = json!({"state": attempt.state.as_str(), "stage": stage});
    let next = super::ops::run_projection_actions(run);
    let lifecycle = projected_lifecycle(ctx, &observation.identity, attention).await?;
    Ok(json!({
        "schema": "forged.explain/1",
        "subject": super::work_identity::projection_subject(
            &observation.identity,
            forged_types::ProjectionSubjectKind::Attempt,
            attempt.attempt_id.to_string(),
        ),
        "kind": "attempt",
        "id": attempt.attempt_id,
        "what": {
            "runId": run_id,
            "packetId": attempt.packet_id,
            "policyRevision": policy_revision,
            "state": attempt.state.as_str(),
            "stage": stage,
            "startedAt": attempt.started_at,
            "updatedAt": attempt.updated_at,
            "endedAt": attempt.ended_at,
        },
        "how": how,
        "lifecycle": lifecycle,
        "next": next,
    }))
}

async fn explain_attention(
    ctx: &Ctx,
    item: AttentionItemV1,
    attention: &[AttentionItemV1],
) -> Result<Value, Failure> {
    let observation_kind = match item.subject_kind {
        AttentionSubjectKind::Run => forged_types::WorkIdentitySubjectKind::Run,
        AttentionSubjectKind::Epic => forged_types::WorkIdentitySubjectKind::Epic,
    };
    let observation = explain_observation(ctx, observation_kind, &item.subject_id).await?;
    let inputs = observation_inputs(&observation)?;
    let mut how = explain_how(inputs);
    how["attention"] = json!({
        "state": item.state,
        "condition": item.condition,
    });
    let lifecycle = projected_lifecycle(ctx, &observation.identity, attention).await?;
    Ok(json!({
        "schema": "forged.explain/1",
        "subject": super::work_identity::projection_subject(
            &observation.identity,
            forged_types::ProjectionSubjectKind::Attention,
            &item.attention_id,
        ),
        "kind": "attention",
        "id": item.attention_id,
        "what": {
            "occurrenceId": item.occurrence_id,
            "subjectKind": item.subject_kind,
            "subjectId": item.subject_id,
            "subjectTitle": item.subject_title,
            "repository": item.repository,
            "condition": item.condition,
            "severity": item.severity,
            "owner": item.owner,
            "state": item.state,
            "openedAt": item.opened_at,
            "updatedAt": item.updated_at,
        },
        "how": how,
        "lifecycle": lifecycle,
        "next": item.next_actions,
    }))
}

/// Resolve and explain any operator-visible durable id without requiring a
/// kind guess. The response is deliberately compact: identity and lifecycle,
/// one health verdict with its exact inputs, then existing typed actions.
pub async fn explain(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("explain", req, || async {
        let id = param_named_str(&req.params, "id")
            .ok_or_else(|| Failure::invalid("explain param \"id\" must name a subject"))?
            .to_owned();
        let subject_kind = param_opt_str(&req.params, "subjectKind");
        let attention = super::ops::all_attention(ctx).await?;
        let resolved = resolve_id_with_attention(ctx, &id, subject_kind, Some(&attention)).await?;
        let projected = match resolved {
            ResolvedId::WorkItem(work) => explain_work_item(ctx, *work, &attention).await,
            ResolvedId::Run(run) => explain_run(ctx, run, &attention).await,
            ResolvedId::Epic(epic) => explain_epic(ctx, epic, &attention).await,
            ResolvedId::Attempt(attempt) => explain_attempt(ctx, *attempt, &attention).await,
            ResolvedId::Attention(item) => explain_attention(ctx, *item, &attention).await,
            ResolvedId::Unresolved(resolution) => Ok(json!({
                "schema": "forged.explain/1",
                "resolution": resolution,
            })),
        }?;
        Ok(forged_types::with_work_twins(projected))
    })
    .await
}

/// Read-only aggregate used by reconnecting agents and the MCP App.
///
/// Takes an explicit `run` or `epic`, a bare `id` resolved against the
/// inventory, or NO scope at all — which projects the portfolio, the one
/// answer to "what is running" that presumes no prior knowledge. An explicit
/// kind and an `id` are different requests — an assertion about a kind versus
/// a question about one — so passing both is refused rather than silently
/// preferring one, which would hide a caller's bug; so is naming both kinds.
///
/// The portfolio is the answer to OMITTING every scope key, never to sending
/// one that names nothing: `param_opt_str` reads `""`, `null` and a non-string
/// alike as absent, so a scope key present and unusable is refused up front.
/// Without that, `{"run": ""}` — a caller whose id interpolation produced
/// nothing — would silently widen from the one run it meant to the whole
/// ledger, and the refusal this tool has always given for it would be lost.
pub async fn overview(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("overview", req, || async {
        let run = param_opt_str(&req.params, "run");
        let epic = param_opt_str(&req.params, "epic");
        let id = param_opt_str(&req.params, "id");
        let subject_kind = param_opt_str(&req.params, "subjectKind");
        let detail = super::ops::projection_detail(req, "overview")?;
        super::ops::projection_symptoms(req, "overview")?;
        for key in ["run", "epic", "id", "subjectKind"] {
            if req.params.contains_key(key) && param_opt_str(&req.params, key).is_none() {
                return Err(Failure::invalid(format!(
                    "overview param {key:?} must name a subject; omit it entirely \
                     to project the portfolio"
                )));
            }
        }
        if id.is_some() && (run.is_some() || epic.is_some()) {
            return Err(Failure::invalid(
                "overview takes param \"id\" or an explicit \"run\"/\"epic\", never both",
            ));
        }
        if subject_kind.is_some() && id.is_none() {
            return Err(Failure::invalid(
                "overview param \"subjectKind\" requires param \"id\"",
            ));
        }
        if run.is_some() && epic.is_some() {
            return Err(Failure::invalid(
                "overview takes at most one of params \"run\", \"epic\", or \"id\"; \
                 omitting all three projects the portfolio",
            ));
        }
        let after = req.params.get("after").and_then(Value::as_i64).unwrap_or(0);
        if after < 0 {
            return Err(Failure::invalid("overview after must be non-negative"));
        }
        let limit = req.params.get("limit").and_then(Value::as_u64).unwrap_or(
            if detail == super::ops::ProjectionDetail::Full {
                FULL_EVENT_PAGE_LIMIT
            } else {
                SUMMARY_EVENT_PAGE_LIMIT
            },
        );
        if limit == 0 || limit > 1_000 {
            return Err(Failure::invalid(
                "overview limit must be between 1 and 1000",
            ));
        }
        // `after`/`limit` page ONE subject's event tail. The portfolio has no
        // tail — it is an inventory, and it states its own bound through
        // `cap` and `total`. Accepting these and discarding them would answer
        // a paging request with an unpaged body and call it success, so a
        // caller that passed them is told they do not apply here rather than
        // being quietly given something else.
        if run.is_none() && epic.is_none() && id.is_none() {
            for name in ["after", "limit"] {
                if req.params.contains_key(name) {
                    return Err(Failure::invalid(format!(
                        "overview {name:?} pages one subject's events and does not apply to \
                         the portfolio; name a \"run\", \"epic\", or \"id\""
                    )));
                }
            }
        }
        let projected = match (run, epic, id) {
            (None, None, None) => portfolio_overview(ctx, req).await,
            (Some(run), None, None) => run_overview(ctx, run, after, limit, detail).await,
            (None, Some(epic), None) => epic_overview(ctx, epic, after, limit, detail).await,
            // A resolved id projects through the SAME call the explicit
            // param makes, so the two answers cannot drift.
            (None, None, Some(id)) => match execution_target(ctx, id, subject_kind).await? {
                ExecutionTarget::Run(run) => run_overview(ctx, &run, after, limit, detail).await,
                ExecutionTarget::Epic(epic) => {
                    epic_overview(ctx, &epic, after, limit, detail).await
                }
                ExecutionTarget::Unresolved(resolution) => Ok(json!({
                    "schema": "forged.overview/1",
                    "resolution": resolution,
                })),
            },
            _ => unreachable!(),
        }?;
        Ok(forged_types::with_work_twins(projected))
    })
    .await
}

// Work Detail is deliberately a denser projection than the compatibility
// Overview. Every collection has a hard response bound, while the `total`
// beside it continues to describe the complete subject snapshot.
const WORK_DETAIL_CAP: usize = 200;

fn bounded(mut items: Vec<Value>, cap: usize) -> Value {
    let total = items.len();
    items.truncate(cap);
    json!({
        "items": items,
        "total": total,
        "limit": cap,
        "truncated": total > cap,
    })
}

fn run_status(row: &forged_ledger::RunRow) -> Value {
    json!({
        "source": "ledger",
        "state": row.state.as_str(),
        "stopReason": row.stop_reason,
        "outcome": row.terminal_outcome.map(RunOutcome::as_str),
        "supersededBy": row.superseded_by,
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
    })
}

fn run_delivery(row: &forged_ledger::RunRow) -> Value {
    json!({
        "source": "ledger",
        "known": row.delivery_pr.is_some() || row.delivery_sha.is_some(),
        "pr": row.delivery_pr,
        "sha": row.delivery_sha,
    })
}

fn desired_json(row: &forged_ledger::DesiredWorkRow) -> Value {
    json!({
        "subjectKind": row.subject_kind.as_str(),
        "subjectId": row.subject_id,
        "state": row.desired_state.as_str(),
        "controlRevision": row.control_revision,
        "controllerGeneration": row.controller_generation,
        "predecessorGeneration": row.predecessor_generation,
        "restartBudget": row.restart_budget,
        "restartUsed": row.restart_used,
        "nextWakeAt": row.next_wake_at,
        "lastProgressAt": row.last_progress_at,
        "lastOutcome": row.last_outcome.map(|value| value.as_str()),
        "lastError": row.last_error,
        "exhaustedAt": row.exhausted_at,
        "reconcileLeaseUntil": row.reconcile_lease_until,
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
    })
}

fn reservation_json(row: &forged_ledger::AdmissionReservationRow) -> Value {
    json!({
        "reservationId": row.reservation_id,
        "decisionId": row.decision_id,
        "workKey": row.work_key,
        "subjectKind": row.subject_kind,
        "subjectId": row.subject_id,
        "controlRevision": row.control_revision,
        "repository": row.repository,
        "provider": row.provider,
        "model": row.model,
        "resourceClass": row.resource_class,
        "state": row.state.as_str(),
        "ownerKind": row.owner_kind,
        "ownerId": row.owner_id,
        "recoveryDeadline": row.recovery_deadline,
        "lastError": row.last_error,
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
        "releasedAt": row.released_at,
    })
}

fn packet_json(row: &forged_ledger::PacketRow) -> Value {
    json!({
        "packetId": row.packet_id,
        "runId": row.run_id,
        "stage": row.stage,
        "seq": row.seq,
        "spec": {
            "path": row.spec_path,
            "sha256": row.spec_sha256,
            "revision": row.spec_revision,
        },
        "policyRevision": row.policy_revision,
        "createdAt": row.created_at,
    })
}

fn bounded_findings(findings: &[Finding]) -> Value {
    let values = findings
        .iter()
        .take(WORK_DETAIL_CAP)
        .map(|finding| {
            serde_json::to_value(finding).expect("the closed Finding contract always serializes")
        })
        .collect::<Vec<_>>();
    json!({
        "items": values,
        "total": findings.len(),
        "limit": WORK_DETAIL_CAP,
        "truncated": findings.len() > WORK_DETAIL_CAP,
    })
}

/// Serialize only the typed result fields Work Detail needs. In particular,
/// review findings retain their own bound instead of smuggling an unbounded
/// vector through an otherwise bounded attempt row.
fn result_json(result: &PacketResult) -> Value {
    let outcome = match &result.outcome {
        Outcome::Implement {
            implemented,
            commits_ahead,
            summary,
            gate_state,
            note,
        } => json!({
            "kind": "implement",
            "implemented": implemented,
            "commitsAhead": commits_ahead,
            "summary": summary,
            "gateState": gate_state,
            "seatChecks": gate_state,
            "note": note,
        }),
        Outcome::Review {
            verdict,
            summary,
            findings,
            available,
        } => json!({
            "kind": "review",
            "verdict": verdict,
            "summary": summary,
            "available": available,
            "findings": bounded_findings(findings),
        }),
        Outcome::Fix { applied, summary } => json!({
            "kind": "fix",
            "applied": applied,
            "summary": summary,
        }),
        Outcome::Plan {
            spec,
            traceability,
            cruxes,
        } => json!({
            "kind": "plan",
            "spec": spec,
            "traceability": traceability,
            "cruxes": cruxes,
        }),
        Outcome::SpecAmendment { amendment } => json!({
            "kind": "spec-amendment",
            "amendment": amendment,
        }),
    };
    json!({
        "schema": result.schema,
        "packetId": result.packet_id,
        "outcome": outcome,
    })
}

struct DecodedExecution {
    packets: BTreeMap<String, forged_types::WorkPacket>,
    results: BTreeMap<i64, PacketResult>,
}

fn decode_packets_and_results(
    snapshot: &WorkObservationSnapshot,
) -> Result<DecodedExecution, Failure> {
    let mut packets = BTreeMap::new();
    for row in &snapshot.packets {
        let packet = forged_proto::stored_packet(row).map_err(|error| {
            Failure::internal(format!(
                "stored packet {:?} does not decode as WorkPacket: {error}",
                row.packet_id
            ))
        })?;
        if packet.schema != "forged.packet/1" {
            return Err(Failure::internal(format!(
                "stored packet {:?} has unsupported schema {:?}",
                row.packet_id, packet.schema
            )));
        }
        if packet.result_schema.trim().is_empty() {
            return Err(Failure::internal(format!(
                "stored packet {:?} has an empty result schema",
                row.packet_id
            )));
        }
        packets.insert(row.packet_id.clone(), packet);
    }

    let mut results = BTreeMap::new();
    for attempt in &snapshot.attempts {
        let Some(raw) = attempt.result_json.as_deref() else {
            continue;
        };
        let result: PacketResult = serde_json::from_str(raw).map_err(|error| {
            Failure::internal(format!(
                "attempt {} has an invalid stored PacketResult: {error}",
                attempt.attempt_id
            ))
        })?;
        let packet = packets.get(&attempt.packet_id).ok_or_else(|| {
            Failure::internal(format!(
                "attempt {} names missing packet {:?}",
                attempt.attempt_id, attempt.packet_id
            ))
        })?;
        if result.packet_id != attempt.packet_id {
            return Err(Failure::internal(format!(
                "attempt {} result packetId {:?} disagrees with {:?}",
                attempt.attempt_id, result.packet_id, attempt.packet_id
            )));
        }
        if result.schema != packet.result_schema {
            return Err(Failure::internal(format!(
                "attempt {} result schema {:?} disagrees with packet schema {:?}",
                attempt.attempt_id, result.schema, packet.result_schema
            )));
        }
        results.insert(attempt.attempt_id, result);
    }
    Ok(DecodedExecution { packets, results })
}

fn attempt_json(row: &forged_ledger::AttemptRow, results: &BTreeMap<i64, PacketResult>) -> Value {
    json!({
        "attemptId": row.attempt_id,
        "packetId": row.packet_id,
        "claimant": row.claimant,
        "state": row.state.as_str(),
        "revokeReason": row.revoke_reason,
        "revokeScope": row.revoke_scope.map(|value| value.as_str()),
        "failNote": row.fail_note,
        "result": results.get(&row.attempt_id).map(result_json),
        "startedAt": row.started_at,
        "updatedAt": row.updated_at,
        "lastHeartbeatAt": row.last_heartbeat_at,
        "endedAt": row.ended_at,
    })
}

fn usage_row_json(row: &forged_ledger::UsageRecord) -> Value {
    json!({
        "runId": row.run_id,
        "packetId": row.packet_id,
        "attemptId": row.attempt_id,
        "provider": row.provider,
        "model": row.model,
        "inputTokens": row.input_tokens,
        "outputTokens": row.output_tokens,
        "cacheReadTokens": row.cache_read_tokens,
        "cacheWriteTokens": row.cache_write_tokens,
        "costUsd": row.cost_usd,
        "pricingBasis": row.pricing_basis,
        "rateLimitUsedPercent": row.rate_limit_used_percent,
        "webSearchRequests": row.web_search_requests,
        "ts": row.ts,
    })
}

fn usage_totals_json(totals: &forged_ledger::UsageTotals) -> Value {
    json!({
        "inputTokens": totals.input_tokens,
        "outputTokens": totals.output_tokens,
        "cacheReadTokens": totals.cache_read_tokens,
        "cacheWriteTokens": totals.cache_write_tokens,
        "costUsdKnown": totals.cost_usd_known,
        "rowsMissingCost": totals.rows_missing_cost,
    })
}

fn operation_json(row: &forged_ledger::OperationRow) -> Value {
    json!({
        "operationId": row.operation_id,
        "name": row.name,
        "idempotencyKey": row.idempotency_key,
        "requestSha256": row.request_sha256,
        "effectClass": row.effect_class.as_str(),
        "runId": row.run_id,
        "claimToken": row.claim_token,
        "state": row.state.as_str(),
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
    })
}

fn owned_session_json(row: &forged_ledger::OwnedHerdrSessionRow) -> Result<Value, Failure> {
    let identity = row.identity().map_err(Failure::from)?;
    Ok(json!({
        "ownership": identity,
        // Compatibility names used by the current Work Detail App.
        "sessionId": row.ownership_id,
        "seat": row.owner_kind.as_str(),
        "state": row.lifecycle_state.as_str(),
        "cleanupState": row.cleanup_state.as_str(),
        "cleanupReason": row.cleanup_reason.map(|value| value.as_str()),
        "cleanupRelease": row.cleanup_release.map(|value| value.as_str()),
        "cleanupRetryBudget": row.cleanup_retry_budget,
        "cleanupRetryUsed": row.cleanup_retry_used,
        "nextCleanupAt": row.next_cleanup_at,
        "lastCleanupError": row.last_cleanup_error,
        "registeredAt": row.registered_at,
        "commandStartedAt": row.command_started_at,
        "cleanupRequestedAt": row.cleanup_requested_at,
        "lastCleanupAttemptAt": row.last_cleanup_attempt_at,
        "releasedAt": row.released_at,
        "updatedAt": row.updated_at,
    }))
}

fn event_json(row: &EventRow) -> Result<Value, Failure> {
    let payload: Value = serde_json::from_str(&row.payload_json).map_err(|error| {
        Failure::internal(format!(
            "event {} has invalid stored JSON: {error}",
            row.event_id
        ))
    })?;
    Ok(json!({
        "eventId": row.event_id,
        "ts": row.ts,
        "runId": row.run_id,
        "kind": row.kind,
        "payload": payload,
    }))
}

fn artifact_groups(snapshot: &WorkObservationSnapshot) -> (Vec<Value>, usize) {
    let artifacts = snapshot
        .attempt_artifacts
        .iter()
        .map(|row| (row.attempt_id, row))
        .collect::<BTreeMap<_, _>>();
    let compactions = snapshot
        .artifact_compactions
        .iter()
        .map(|row| (row.attempt_id, row))
        .collect::<BTreeMap<_, _>>();
    let mut attempts_by_packet = BTreeMap::<&str, Vec<Value>>::new();
    for attempt in &snapshot.attempts {
        let manifest = artifacts.get(&attempt.attempt_id).map(|row| {
            json!({
                "schema": row.manifest_schema,
                "path": row.manifest_path,
                "sha256": row.manifest_sha256,
                "retentionClass": row.retention_class,
                "createdAt": row.created_at,
            })
        });
        let compaction = compactions.get(&attempt.attempt_id).map(|row| {
            json!({
                "operationId": row.operation_id,
                "tombstonePath": row.tombstone_path,
                "tombstoneSha256": row.tombstone_sha256,
                "state": row.state,
                "bytesRemoved": row.bytes_removed,
                "createdAt": row.created_at,
                "completedAt": row.completed_at,
            })
        });
        attempts_by_packet
            .entry(&attempt.packet_id)
            .or_default()
            .push(json!({
                "attemptId": attempt.attempt_id,
                "state": attempt.state.as_str(),
                "manifest": manifest,
                "compaction": compaction,
            }));
    }

    let total = attempts_by_packet.len();
    let groups = attempts_by_packet
        .into_iter()
        .map(|(packet_id, mut attempts)| {
            let attempt_total = attempts.len();
            attempts.truncate(WORK_DETAIL_CAP);
            json!({
                "packetId": packet_id,
                "attempts": attempts,
                "attemptTotal": attempt_total,
                "attemptLimit": WORK_DETAIL_CAP,
                "attemptsTruncated": attempt_total > WORK_DETAIL_CAP,
            })
        })
        .take(WORK_DETAIL_CAP)
        .collect();
    (groups, total)
}

fn gate_rows(results: &BTreeMap<i64, PacketResult>) -> Vec<Value> {
    results
        .iter()
        .filter_map(|(attempt_id, result)| match &result.outcome {
            Outcome::Implement {
                implemented,
                commits_ahead,
                summary,
                gate_state: Some(gate_state),
                note,
            } => {
                let passed = match gate_state.as_str() {
                    "pass" => Some(true),
                    "fail" => Some(false),
                    _ => None,
                };
                Some(json!({
                        "attemptId": attempt_id,
                        "packetId": result.packet_id,
                        "implemented": implemented,
                        "commitsAhead": commits_ahead,
                        "summary": summary,
                        "gateState": gate_state,
                "seatChecks": gate_state,
                        "passed": passed,
                        "note": note,
                    }))
            }
            _ => None,
        })
        .collect()
}

struct ReviewProjection {
    rows: Vec<Value>,
    latest_findings: Vec<Finding>,
    disagreements: Vec<(String, i64, String, Value)>,
}

fn review_projection(
    snapshot: &WorkObservationSnapshot,
    packets: &BTreeMap<String, forged_types::WorkPacket>,
    results: &BTreeMap<i64, PacketResult>,
) -> ReviewProjection {
    let attempts = snapshot
        .attempts
        .iter()
        .map(|attempt| (attempt.attempt_id, attempt))
        .collect::<BTreeMap<_, _>>();
    let mut rows = Vec::new();
    let mut by_run_round = BTreeMap::<(String, u32), Vec<(i64, &PacketResult)>>::new();
    for (attempt_id, result) in results {
        let Outcome::Review {
            verdict,
            summary,
            findings,
            available,
        } = &result.outcome
        else {
            continue;
        };
        let packet = packets
            .get(&result.packet_id)
            .expect("result decoding already proved packet ownership");
        let round = packet.execution.as_ref().map_or_else(
            || {
                snapshot
                    .packets
                    .iter()
                    .find(|row| row.packet_id == result.packet_id)
                    .and_then(|row| u32::try_from(row.seq).ok())
                    .unwrap_or(u32::MAX)
            },
            |execution| u32::from(execution.round),
        );
        let seat = packet
            .execution
            .as_ref()
            .map(|execution| execution.seat_id.as_str().to_owned());
        rows.push(json!({
            "attemptId": attempt_id,
            "packetId": result.packet_id,
            "runId": packet.run_id,
            "round": round,
            "seat": seat,
            "verdict": verdict,
            "summary": summary,
            "available": available,
            "findings": bounded_findings(findings),
        }));
        if *available {
            by_run_round
                .entry((packet.run_id.clone(), round))
                .or_default()
                .push((*attempt_id, result));
        }
    }

    let latest_rounds = by_run_round.keys().fold(
        BTreeMap::<String, u32>::new(),
        |mut rounds, (run, round)| {
            rounds
                .entry(run.clone())
                .and_modify(|standing| *standing = (*standing).max(*round))
                .or_insert(*round);
            rounds
        },
    );
    let mut latest_findings = Vec::new();
    let mut seen = BTreeSet::new();
    let mut disagreements = Vec::new();
    for ((run_id, round), outcomes) in by_run_round {
        if latest_rounds.get(&run_id) != Some(&round) {
            continue;
        }
        let mut verdicts = BTreeSet::new();
        let mut newest_attempt = 0;
        for (attempt_id, result) in outcomes {
            newest_attempt = newest_attempt.max(attempt_id);
            let Outcome::Review {
                verdict, findings, ..
            } = &result.outcome
            else {
                unreachable!("review bucket contains only review outcomes")
            };
            verdicts.insert(format!("{verdict:?}"));
            for finding in findings {
                let key = serde_json::to_string(finding)
                    .expect("the closed Finding contract always serializes");
                if seen.insert(key) {
                    latest_findings.push(finding.clone());
                }
            }
        }
        if verdicts.len() > 1 {
            disagreements.push((
                run_id,
                newest_attempt,
                format!("review-round:{round}:attempt:{newest_attempt}"),
                json!({"round": round, "verdicts": verdicts}),
            ));
        }
    }
    // A malformed attempt reference cannot enter `by_run_round`; keep this
    // explicit use so a future projection cannot silently drop that check.
    debug_assert!(results
        .keys()
        .all(|attempt_id| attempts.contains_key(attempt_id)));
    ReviewProjection {
        rows,
        latest_findings,
        disagreements,
    }
}

fn child_rows(snapshot: &WorkObservationSnapshot) -> Vec<Value> {
    let identities = snapshot
        .child_identities
        .iter()
        .map(|identity| (identity.subject.id.as_str(), identity))
        .collect::<BTreeMap<_, _>>();
    let runs = snapshot
        .runs
        .iter()
        .map(|run| (run.run_id.as_str(), run))
        .collect::<BTreeMap<_, _>>();
    snapshot
        .epic_children
        .iter()
        .map(|child| {
            let run = runs
                .get(child.run_id.as_str())
                .expect("the observation snapshot validates every epic child run");
            let identity = identities
                .get(child.run_id.as_str())
                .expect("the observation snapshot validates every epic child identity");
            json!({
                "eventId": child.event_id,
                "childId": child.child_id,
                "runId": child.run_id,
                "phase": child.phase.as_str(),
                "identity": identity,
                "status": run_status(run),
                "delivery": run_delivery(run),
            })
        })
        .collect()
}

fn epic_status_delivery(
    snapshot: &WorkObservationSnapshot,
) -> Result<(Value, Value, super::health::HealthInputs<'_>), Failure> {
    let desired = snapshot.desired_work.iter().find(|row| {
        row.subject_kind == forged_ledger::DesiredSubjectKind::Epic
            && row.subject_id == snapshot.subject.id
    });
    let complete_events = snapshot.events.after_event_id == 0 && !snapshot.events.has_more;
    let mut latest_pause: Option<(&str, &EventRow)> = None;
    let mut latest_input: Option<(&str, &EventRow)> = None;
    let mut latest_pr: Option<&EventRow> = None;
    let mut latest_terminal_pr: Option<&EventRow> = None;
    let mut latest_assurance_completion: Option<&EventRow> = None;
    if complete_events {
        for event in &snapshot.events.rows {
            match event.kind.as_str() {
                super::epic::PAUSED | super::epic::RESUMED => {
                    latest_pause = Some((&event.kind, event))
                }
                super::epic::INPUT_REQUIRED | super::epic::INPUT_RESOLVED => {
                    latest_input = Some((&event.kind, event));
                }
                super::epic::EPIC_PR => {
                    latest_pr = Some(event);
                    let nonterminal = serde_json::from_str::<Value>(&event.payload_json)
                        .ok()
                        .and_then(|payload| payload.get("terminal").and_then(Value::as_bool))
                        == Some(false);
                    if !nonterminal {
                        latest_terminal_pr = Some(event);
                    }
                }
                super::epic::ASSURANCE_COMPLETED => latest_assurance_completion = Some(event),
                _ => {}
            }
        }
    }
    let state = if latest_terminal_pr.is_some() || latest_assurance_completion.is_some() {
        "submitted"
    } else if latest_input.is_some_and(|(kind, _)| kind == super::epic::INPUT_REQUIRED) {
        "input-required"
    } else if latest_pause.is_some_and(|(kind, _)| kind == super::epic::PAUSED) {
        "paused"
    } else {
        desired.map_or("active", |row| row.desired_state.as_str())
    };
    let updated_at = desired
        .map(|row| row.updated_at.clone())
        .or_else(|| snapshot.events.rows.last().map(|event| event.ts.clone()))
        .unwrap_or_else(|| snapshot.identity.captured_at.clone());
    // The latest recorded controller terminal failure, scanned from the same
    // complete event tail the other event-derived fields use.
    let last_controller_failure = complete_events
        .then(|| {
            snapshot
                .events
                .rows
                .iter()
                .rev()
                .find(|event| event.kind == super::handoff::CONTROLLER_TERMINAL_EVENT)
                .and_then(|event| {
                    serde_json::from_str::<Value>(&event.payload_json)
                        .ok()
                        .map(|payload| super::health::controller_failure_json(&payload, &event.ts))
                })
        })
        .flatten();
    let health_inputs = epic_observation_inputs(snapshot);
    let execution_health = super::health::execution_health(health_inputs);
    let status = json!({
        "source": "ledger",
        "state": state,
        "executionHealth": execution_health,
        "lastControllerFailure": last_controller_failure,
        "desiredState": desired.map(|row| row.desired_state.as_str()),
        "controlRevision": desired.map(|row| row.control_revision),
        "lastOutcome": desired.and_then(|row| row.last_outcome.map(|value| value.as_str())),
        "lastError": desired.and_then(|row| row.last_error.as_deref()),
        "updatedAt": updated_at,
        "eventDerivedFieldsComplete": complete_events,
    });
    let delivery = if let Some(event) = latest_pr {
        let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
            Failure::internal(format!(
                "epic delivery event {} has invalid stored JSON: {error}",
                event.event_id
            ))
        })?;
        json!({
            "source": "ledger-event",
            "known": true,
            "pr": payload.get("number"),
            "sha": payload.get("headSha").or_else(|| payload.get("sha")),
            "base": payload.get("baseRefName").or_else(|| payload.get("base")),
            "eventId": event.event_id,
        })
    } else {
        json!({
            "source": "ledger-event",
            "known": false,
            "pr": Value::Null,
            "sha": Value::Null,
            "eventCoverageComplete": complete_events,
        })
    };
    Ok((status, delivery, health_inputs))
}

/// Project exact Work Detail, spending ONE bounded work read on the
/// subject's own work so the drill-down destination every other App links to
/// can state what the work is called.
///
/// The read is fail-soft on purpose: Work Detail is what an operator opens
/// when something is wrong, which is exactly when work may be unavailable.
/// A failed or empty read reports `source: "unknown"` and the projection
/// returns normally; the error is never propagated and this schema carries
/// no `sourceHealth`.
async fn project_work_detail(
    ctx: &Ctx,
    snapshot: WorkObservationSnapshot,
) -> Result<Value, Failure> {
    let live_work = crate::core::workstore::list_issues(
        &ctx.ledger,
        std::slice::from_ref(&snapshot.identity.work.id),
    )
    .await
    .ok()
    .and_then(|issues| {
        issues
            .into_iter()
            .find(|issue| issue.id == snapshot.identity.work.id)
    });
    let title_source = forged_types::resolve_work_title(
        &snapshot.identity,
        live_work.as_ref().map(|issue| issue.title.as_str()),
    );
    let work_ref = WorkRefV1::new(
        match snapshot.subject.kind {
            forged_types::WorkIdentitySubjectKind::Run => WorkRefKind::Run,
            forged_types::WorkIdentitySubjectKind::Epic => WorkRefKind::Epic,
        },
        snapshot.subject.id.clone(),
    )
    .map_err(|error| Failure::internal(format!("constructing Work Detail reference: {error}")))?;
    let decoded = decode_packets_and_results(&snapshot)?;
    let review = review_projection(&snapshot, &decoded.packets, &decoded.results);
    let gates = gate_rows(&decoded.results);
    let attention = super::attention::project_observation(
        &snapshot,
        &review.disagreements,
        &decoded.results,
        &title_source,
        live_work.as_ref(),
        ctx.config.ack_window_s,
    )?
    .into_iter()
    .map(|item| {
        serde_json::to_value(item)
            .map_err(|error| Failure::internal(format!("serializing attention item: {error}")))
    })
    .collect::<Result<Vec<_>, _>>()?;

    let (status, delivery) = match snapshot.subject.kind {
        forged_types::WorkIdentitySubjectKind::Run => {
            let run = snapshot
                .runs
                .iter()
                .find(|row| row.run_id == snapshot.subject.id)
                .ok_or_else(|| {
                    Failure::internal("run observation snapshot omitted its requested run")
                })?;
            (run_status(run), run_delivery(run))
        }
        forged_types::WorkIdentitySubjectKind::Epic => {
            let (status, delivery, _) = epic_status_delivery(&snapshot)?;
            (status, delivery)
        }
    };

    let desired = bounded(
        snapshot.desired_work.iter().map(desired_json).collect(),
        WORK_DETAIL_CAP,
    );
    let decisions = snapshot
        .admission_decisions
        .iter()
        .map(|decision| {
            serde_json::to_value(decision).map_err(|error| {
                Failure::internal(format!("serializing admission decision: {error}"))
            })
        })
        .collect::<Result<Vec<_>, _>>()?;
    let admission_decisions = bounded(decisions, WORK_DETAIL_CAP);
    let admission_reservations = bounded(
        snapshot
            .admission_reservations
            .iter()
            .map(reservation_json)
            .collect(),
        WORK_DETAIL_CAP,
    );
    let children = bounded(child_rows(&snapshot), WORK_DETAIL_CAP);
    let packet_rows = bounded(
        snapshot.packets.iter().map(packet_json).collect(),
        WORK_DETAIL_CAP,
    );
    let attempt_rows = bounded(
        snapshot
            .attempts
            .iter()
            .map(|attempt| attempt_json(attempt, &decoded.results))
            .collect(),
        WORK_DETAIL_CAP,
    );
    let sessions = snapshot
        .owned_herdr_sessions
        .iter()
        .map(owned_session_json)
        .collect::<Result<Vec<_>, _>>()?;
    let workers = bounded(sessions, WORK_DETAIL_CAP);
    let (artifact_rows, artifact_total) = artifact_groups(&snapshot);

    let usage_rows = bounded(
        snapshot.usage_rows.iter().map(usage_row_json).collect(),
        WORK_DETAIL_CAP,
    );
    let usage_by_run = bounded(
        snapshot
            .usage_totals
            .iter()
            .map(|(run_id, totals)| json!({"runId": run_id, "totals": usage_totals_json(totals)}))
            .collect(),
        WORK_DETAIL_CAP,
    );
    let mut input_tokens = 0u64;
    let mut output_tokens = 0u64;
    let mut cache_read_tokens = 0u64;
    let mut cache_write_tokens = 0u64;
    let mut cost_usd_known = 0.0f64;
    let mut rows_missing_cost = 0u64;
    for totals in snapshot.usage_totals.values() {
        input_tokens = input_tokens
            .checked_add(totals.input_tokens)
            .ok_or_else(|| Failure::internal("Work Detail input-token total overflowed"))?;
        output_tokens = output_tokens
            .checked_add(totals.output_tokens)
            .ok_or_else(|| Failure::internal("Work Detail output-token total overflowed"))?;
        cache_read_tokens = cache_read_tokens
            .checked_add(totals.cache_read_tokens)
            .ok_or_else(|| Failure::internal("Work Detail cache-read total overflowed"))?;
        cache_write_tokens = cache_write_tokens
            .checked_add(totals.cache_write_tokens)
            .ok_or_else(|| Failure::internal("Work Detail cache-write total overflowed"))?;
        cost_usd_known += totals.cost_usd_known;
        if !cost_usd_known.is_finite() {
            return Err(Failure::internal(
                "Work Detail known-cost total is not finite",
            ));
        }
        rows_missing_cost = rows_missing_cost
            .checked_add(u64::from(totals.rows_missing_cost))
            .ok_or_else(|| Failure::internal("Work Detail missing-cost total overflowed"))?;
    }

    let effects = bounded(
        snapshot
            .inflight_operations
            .iter()
            .map(operation_json)
            .collect(),
        WORK_DETAIL_CAP,
    );
    let gate_rows = bounded(gates, WORK_DETAIL_CAP);
    let review_rows = bounded(review.rows, WORK_DETAIL_CAP);
    let latest_finding_total = review.latest_findings.len();
    let latest_findings = review
        .latest_findings
        .into_iter()
        .take(WORK_DETAIL_CAP)
        .map(|finding| {
            serde_json::to_value(finding).expect("the closed Finding contract always serializes")
        })
        .collect::<Vec<_>>();
    let attention_total = attention.len();
    let attention_rows = attention
        .into_iter()
        .take(WORK_DETAIL_CAP)
        .collect::<Vec<_>>();
    let event_rows = snapshot
        .events
        .rows
        .iter()
        .map(event_json)
        .collect::<Result<Vec<_>, _>>()?;
    let cursor = snapshot
        .events
        .next_after_event_id
        .unwrap_or(snapshot.events.after_event_id);
    let event_total = event_rows.len();
    let event_limit = snapshot.events.limit;
    let event_after = snapshot.events.after_event_id;
    let event_has_more = snapshot.events.has_more;
    let deadline_kills = snapshot
        .attempts
        .iter()
        .filter(|attempt| {
            attempt.revoke_scope == Some(RevokeScope::Deadline)
                && !matches!(
                    attempt.state,
                    AttemptState::Running | AttemptState::Revoking
                )
        })
        .count();

    let subject = super::work_identity::projection_subject(
        &snapshot.identity,
        match snapshot.subject.kind {
            forged_types::WorkIdentitySubjectKind::Run => forged_types::ProjectionSubjectKind::Run,
            forged_types::WorkIdentitySubjectKind::Epic => {
                forged_types::ProjectionSubjectKind::Epic
            }
        },
        &snapshot.subject.id,
    );
    Ok(json!({
        "schema": "forged.work-detail/1",
        "subject": subject,
        // Compatibility aliases retained for the current App shell.
        "kind": if snapshot.subject.kind == forged_types::WorkIdentitySubjectKind::Epic {
            "epic"
        } else {
            "slice"
        },
        "id": snapshot.subject.id,
        "workRef": work_ref,
        "identity": snapshot.identity,
        "titleSource": title_source,
        "cursor": cursor,
        "status": status,
        "delivery": delivery,
        "deadlineKills": deadline_kills,
        "desired": desired,
        "admission": {
            "source": "ledger",
            "decisions": admission_decisions,
            "reservations": admission_reservations,
        },
        "children": children,
        "packets": packet_rows,
        "attempts": attempt_rows,
        "workers": {
            "source": "durable-owned-herdr",
            "sessions": workers["items"],
            "total": workers["total"],
            "limit": workers["limit"],
            "truncated": workers["truncated"],
        },
        // The App currently consumes this compatibility array directly.
        "artifacts": artifact_rows,
        "artifactCoverage": {
            "total": artifact_total,
            "limit": WORK_DETAIL_CAP,
            "truncated": artifact_total > WORK_DETAIL_CAP,
            "source": "ledger-manifest-metadata",
        },
        "usage": {
            "source": "ledger",
            "rows": usage_rows["items"],
            "rowTotal": usage_rows["total"],
            "rowLimit": usage_rows["limit"],
            "rowsTruncated": usage_rows["truncated"],
            "byRun": usage_by_run,
            "totals": {
                "inputTokens": input_tokens,
                "outputTokens": output_tokens,
                "cacheReadTokens": cache_read_tokens,
                "cacheWriteTokens": cache_write_tokens,
                "costUsdKnown": cost_usd_known,
                "rowsMissingCost": rows_missing_cost,
            },
        },
        "effectCustody": effects,
        "gates": gate_rows,
        "reviews": {
            "results": review_rows["items"],
            "resultTotal": review_rows["total"],
            "resultLimit": review_rows["limit"],
            "resultsTruncated": review_rows["truncated"],
            // Compatibility array consumed by the current Work Detail App.
            "latestFindings": latest_findings,
            "latestFindingTotal": latest_finding_total,
            "latestFindingLimit": WORK_DETAIL_CAP,
            "latestFindingsTruncated": latest_finding_total > WORK_DETAIL_CAP,
        },
        "attention": attention_rows,
        "attentionTotal": attention_total,
        "attentionLimit": WORK_DETAIL_CAP,
        "attentionTruncated": attention_total > WORK_DETAIL_CAP,
        "attentionCoverage": {
            "source": "atomic-work-observation",
            "subjectScoped": true,
            "eventBackedConditionsComplete": event_after == 0
                && !event_has_more
                && (snapshot.subject.kind == forged_types::WorkIdentitySubjectKind::Run
                    || snapshot.epic_children.is_empty()),
            "controlsComplete": event_after == 0
                && !event_has_more
                && (snapshot.subject.kind == forged_types::WorkIdentitySubjectKind::Run
                    || snapshot.epic_children.is_empty()),
        },
        "events": {
            "source": "ledger",
            "after": event_after,
            "limit": event_limit,
            "events": event_rows,
            "total": event_total,
            "truncated": event_has_more,
            "hasMore": event_has_more,
            "nextAfter": cursor,
        },
    }))
}

fn summarize_work_detail(full: &Value) -> Value {
    let gate_items = full
        .get("gates")
        .and_then(|value| value.get("items"))
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let findings = full
        .pointer("/reviews/latestFindings")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let mut finding_by_severity = BTreeMap::<String, usize>::new();
    for finding in &findings {
        let severity = finding
            .get("severity")
            .and_then(Value::as_str)
            .unwrap_or("unknown")
            .to_owned();
        *finding_by_severity.entry(severity).or_default() += 1;
    }
    let attention = full
        .get("attention")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let mut decisions = 0usize;
    let mut symptoms = 0usize;
    let mut acknowledged = 0usize;
    // The summary keeps the typed `next` the driver reads (ADR-0036): every
    // unresolved item's classed actions, deduplicated by (verb, args).
    let mut next: Vec<Value> = Vec::new();
    for item in &attention {
        if item.get("state").and_then(Value::as_str) == Some("acknowledged") {
            acknowledged += 1;
        }
        if item.get("state").and_then(Value::as_str) != Some("resolved") {
            for action in item
                .get("nextActions")
                .and_then(Value::as_array)
                .into_iter()
                .flatten()
            {
                let duplicate = next.iter().any(|seen| {
                    seen.get("verb") == action.get("verb") && seen.get("args") == action.get("args")
                });
                if !duplicate {
                    next.push(action.clone());
                }
            }
        }
        let condition = item.get("condition").cloned().and_then(|value| {
            serde_json::from_value::<forged_types::AttentionCondition>(value).ok()
        });
        match condition.map(super::attention::classification) {
            Some(super::attention::AttentionClass::Decision) => decisions += 1,
            Some(super::attention::AttentionClass::Symptom) => symptoms += 1,
            None => {}
        }
    }
    json!({
        "schema": "forged.work-detail/1",
        "subject": full.get("subject"),
        "kind": full.get("kind"),
        "id": full.get("id"),
        "workRef": full.get("workRef"),
        "identity": full.get("identity"),
        "titleSource": full.get("titleSource"),
        "status": full.get("status"),
        "delivery": full.get("delivery"),
        "deadlineKills": full.get("deadlineKills"),
        "nextAction": attention
            .first()
            .and_then(|item| item.get("recommendedAction"))
            .or_else(|| full.pointer("/status/nextAction")),
        "next": next,
        "desired": {"total": full.pointer("/desired/total")},
        "admission": {
            "decisionTotal": full.pointer("/admission/decisions/total"),
            "reservationTotal": full.pointer("/admission/reservations/total"),
        },
        "children": {"total": full.pointer("/children/total")},
        "workers": {"total": full.pointer("/workers/total")},
        "usage": {"totals": full.pointer("/usage/totals")},
        "effectCustody": {"total": full.pointer("/effectCustody/total")},
        "gates": {
            "total": full.pointer("/gates/total"),
            "latest": gate_items.last(),
        },
        "reviews": {
            "resultTotal": full.pointer("/reviews/resultTotal"),
            "findingCounts": {"total": findings.len(), "bySeverity": finding_by_severity},
        },
        "attention": {
            "counts": {
                "decisions": decisions,
                "symptoms": symptoms,
                "acknowledged": acknowledged,
            },
            "total": full.get("attentionTotal"),
        },
    })
}

/// Work projection used by the Work Detail App.
///
/// Addressed by EXACTLY one form: the canonical `subjectKind`/`subjectId`
/// pair, or a bare `id` resolved with [`overview`]'s semantics. The pair is
/// an assertion and stays exact — a stale or malformed drawer target fails
/// closed and never prefix-resolves. The bare id is a question: an id that
/// resolves to no single subject answers with the same `resolution` object
/// overview emits, under this tool's own schema key. Sending both forms is
/// refused rather than silently preferring one, which would hide a caller's
/// bug; so is half a pair. Enforcement lives here so the CLI and MCP refuse
/// with identical envelopes.
pub async fn work_detail(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("work_detail", req, || async {
        let detail = super::ops::projection_detail(req, "work detail")?;
        super::ops::projection_symptoms(req, "work detail")?;
        // A present addressing key must name a subject: `param_named_str`
        // reads `""`, whitespace, `null` and a non-string alike as absent,
        // and treating those as omitted would answer a caller's failed
        // interpolation with a refusal about the wrong mistake — or, worse,
        // resolve the other form it did not mean. The MCP transport refuses
        // the same values at deserialize; this keeps the CLI as strict.
        for key in ["subjectKind", "subjectId", "id"] {
            if req.params.contains_key(key) && param_named_str(&req.params, key).is_none() {
                return Err(Failure::invalid(format!(
                    "work detail param {key:?} must name a subject"
                )));
            }
        }
        let bare = param_named_str(&req.params, "id").map(str::to_owned);
        let subject_kind = param_named_str(&req.params, "subjectKind");
        let subject_id = param_named_str(&req.params, "subjectId").map(str::to_owned);
        if bare.is_some() && subject_id.is_some() {
            return Err(Failure::invalid(
                "work detail takes param \"id\" or the exact \"subjectKind\"/\"subjectId\" pair, never both",
            ));
        }
        if bare.is_none() && subject_kind.is_some() != subject_id.is_some() {
            return Err(Failure::invalid(
                "work detail params \"subjectKind\" and \"subjectId\" travel as a pair; \
                 send both or address by \"id\" with optional \"subjectKind\"",
            ));
        }
        let exact = match (subject_kind, subject_id.as_ref()) {
            (Some(kind), Some(id)) => {
                let kind = match kind {
                    "run" => forged_types::WorkIdentitySubjectKind::Run,
                    "epic" => forged_types::WorkIdentitySubjectKind::Epic,
                    other => {
                        return Err(Failure::invalid(format!(
                            "work detail kind must be \"run\" or \"epic\", got {other:?}"
                        )))
                    }
                };
                Some((kind, id.clone()))
            }
            (None, None) if bare.is_none() => {
                return Err(Failure::invalid(
                    "work detail requires param \"id\" or the exact \
                     \"subjectKind\"/\"subjectId\" pair",
                ))
            }
            (_, None) if bare.is_some() => None,
            _ => unreachable!("a half pair is refused above"),
        };
        let after = req.params.get("after").and_then(Value::as_i64).unwrap_or(0);
        if after < 0 {
            return Err(Failure::invalid("work detail after must be non-negative"));
        }
        let limit = req
            .params
            .get("limit")
            .and_then(Value::as_u64)
            .unwrap_or(100);
        if limit == 0 || limit > 1_000 {
            return Err(Failure::invalid(
                "work detail limit must be between 1 and 1000",
            ));
        }
        let event_limit = u32::try_from(limit)
            .map_err(|_| Failure::invalid("work detail limit does not fit u32"))?;
        let (kind, id) = match (exact, bare) {
            (Some(pair), None) => pair,
            // Resolution reads its own inventory snapshot and the detail
            // then projects a fresh one; on the append-only ledger a subject
            // resolved by the first cannot vanish from the second, so the
            // two answers agree — the resolved kind is the inventory's,
            // never a guess.
            (None, Some(bare)) => match execution_target(ctx, &bare, subject_kind).await? {
                ExecutionTarget::Run(run) => (forged_types::WorkIdentitySubjectKind::Run, run),
                ExecutionTarget::Epic(epic) => (forged_types::WorkIdentitySubjectKind::Epic, epic),
                ExecutionTarget::Unresolved(resolution) => {
                    return Ok(json!({
                        "schema": "forged.work-detail/1",
                        "resolution": resolution,
                    }))
                }
            },
            _ => unreachable!("exactly one addressing form survives the checks above"),
        };
        let snapshot = on_ledger(&ctx.ledger, move |ledger| {
            ledger.work_observation_snapshot(kind, &id, after, event_limit)
        })
        .await?;
        let full = project_work_detail(ctx, snapshot).await?;
        let projected = if detail == super::ops::ProjectionDetail::Full {
            full
        } else {
            summarize_work_detail(&full)
        };
        Ok(forged_types::with_work_twins(projected))
    })
    .await
}

#[cfg(test)]
mod rank_tests {
    use forged_types::{ActionClass, OperationActionV1};
    use serde_json::json;

    use super::{rank_subject_actions, EXPLAIN_COLLECTION_CAP};

    // Deserialized, not constructed: the relevance registry scans this
    // crate for direct `OperationActionV1` construction sites, and a test
    // helper is not an emitter.
    fn action(verb: &str, run: &str, class: ActionClass) -> OperationActionV1 {
        serde_json::from_value(json!({
            "verb": verb,
            "args": {"run": run},
            "reason": "",
            "class": class,
        }))
        .expect("test action deserializes")
    }

    #[test]
    fn lifecycle_should_outranks_a_decision_should_which_demotes_to_can() {
        let (ranked, total) = rank_subject_actions(vec![
            action("run stop", "r", ActionClass::Should),
            action("attention resolve", "r", ActionClass::Should),
        ]);
        assert_eq!(total, 2);
        assert_eq!(ranked[0].verb, "run stop");
        assert_eq!(ranked[0].class, ActionClass::Should);
        assert_eq!(ranked[1].class, ActionClass::Can);
    }

    #[test]
    fn a_decision_should_upgrades_the_same_lifecycle_can_instead_of_duplicating() {
        let (ranked, total) = rank_subject_actions(vec![
            action("run retry", "r", ActionClass::Can),
            action("work supersede", "r", ActionClass::Can),
            action("run retry", "r", ActionClass::Should),
        ]);
        assert_eq!(total, 2, "duplicates merge before ranking");
        assert_eq!(ranked.len(), 2);
        assert_eq!(ranked[0].verb, "run retry");
        assert_eq!(ranked[0].class, ActionClass::Should);
        assert_eq!(
            ranked
                .iter()
                .filter(|action| action.class == ActionClass::Should)
                .count(),
            1
        );
    }

    #[test]
    fn the_first_should_moves_to_the_front_and_the_cap_reports_the_total() {
        let mut actions = (0..EXPLAIN_COLLECTION_CAP + 3)
            .map(|index| action("can", &format!("r{index}"), ActionClass::Can))
            .collect::<Vec<_>>();
        actions.push(action("should", "r", ActionClass::Should));
        let (ranked, total) = rank_subject_actions(actions);
        assert_eq!(total, EXPLAIN_COLLECTION_CAP + 4);
        assert_eq!(ranked.len(), EXPLAIN_COLLECTION_CAP);
        assert_eq!(ranked[0].verb, "should");
        assert!(ranked[0].args.contains_key("run"));
    }
}

#[cfg(test)]
mod usage_tests {
    use serde_json::{json, Value};

    use super::absorb_usage;

    fn child(run_id: &str, basis: &str, cost: f64, rates_as_of: &str) -> Value {
        json!({
            "kind": "slice",
            "id": run_id,
            "usage": {
                "rows": [{
                    "runId": run_id,
                    "packetId": format!("{run_id}/implementation/0"),
                    "attemptId": 1,
                    "provider": "codex",
                    "model": "gpt-5.6-sol",
                    "costUsd": cost,
                    "pricingBasis": basis,
                    "webSearchRequests": 2,
                }],
                "totals": {"costUsdKnown": cost},
                "pricing": {
                    "ratesAsOf": rates_as_of,
                    "source": "operator rate card",
                    "webSearchPer1k": 10.0,
                },
            },
        })
    }

    #[test]
    fn hoisted_rows_carry_their_child_run_and_are_otherwise_verbatim() {
        let mut rows = Vec::new();
        let mut pricing = None;
        absorb_usage(
            &child("child-one", "billed", 0.25, "2026-05-01"),
            "child-one",
            &mut rows,
            &mut pricing,
        );
        absorb_usage(
            &child("child-two", "billed", 0.50, "2026-05-01"),
            "child-two",
            &mut rows,
            &mut pricing,
        );
        assert_eq!(rows.len(), 2);
        assert_eq!(rows[0]["runId"], json!("child-one"));
        assert_eq!(rows[1]["runId"], json!("child-two"));
        assert_eq!(rows[1]["packetId"], json!("child-two/implementation/0"));
        assert_eq!(rows[1]["webSearchRequests"], json!(2));
    }

    #[test]
    fn diverging_rate_cards_report_the_first_child_and_do_not_fail() {
        let mut rows = Vec::new();
        let mut pricing = None;
        absorb_usage(
            &child("child-one", "billed", 0.25, "2026-05-01"),
            "child-one",
            &mut rows,
            &mut pricing,
        );
        absorb_usage(
            &child("child-two", "billed", 0.50, "2026-01-01"),
            "child-two",
            &mut rows,
            &mut pricing,
        );
        assert_eq!(pricing.expect("pricing")["ratesAsOf"], json!("2026-05-01"));
    }

    #[test]
    fn a_failed_child_contributes_no_rows_and_no_pricing() {
        let mut rows = Vec::new();
        let mut pricing = None;
        absorb_usage(
            &json!({"kind": "slice", "id": "child-one", "error": {"code": "internal"}}),
            "child-one",
            &mut rows,
            &mut pricing,
        );
        assert!(rows.is_empty());
        assert!(pricing.is_none());
    }

    /// The App's spend header calls an epic "provider-billed" exactly when
    /// no hoisted row is imputed; a codex child priced from the rate card
    /// must therefore reach it as an `imputed_api_rate` row with a cost.
    #[test]
    fn an_imputed_child_row_keeps_the_epic_from_reading_as_fully_billed() {
        let mut rows = Vec::new();
        let mut pricing = None;
        absorb_usage(
            &child("child-one", "imputed_api_rate", 0.25, "2026-05-01"),
            "child-one",
            &mut rows,
            &mut pricing,
        );
        let imputed: f64 = rows
            .iter()
            .filter(|row| row["pricingBasis"] == json!("imputed_api_rate"))
            .filter_map(|row| row["costUsd"].as_f64())
            .sum();
        assert!(
            imputed > 0.0,
            "imputed spend is visible on the epic: {rows:?}"
        );
    }
}
