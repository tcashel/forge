//! One reconnect projection for slice and epic execution.

use std::collections::BTreeMap;

use forged_types::{OperationRequest, OperationResponse};
use serde_json::{json, Map, Value};

use crate::core::{on_ledger, param_opt_str, read_only, Ctx, Failure};

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

async fn events(ctx: &Ctx, run_id: &str, after: i64, limit: Option<u64>) -> Result<Value, Failure> {
    result(
        super::ops::events_tail(
            ctx,
            &request(
                run_id,
                json!({"run": run_id, "after": after, "limit": limit}),
            ),
        )
        .await,
    )
}

fn event_payloads(all: &Value, kind: impl Fn(&str) -> bool) -> Vec<Value> {
    all.get("events")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter(|event| event.get("kind").and_then(Value::as_str).is_some_and(&kind))
        .cloned()
        .collect()
}

fn packet_artifacts(ctx: &Ctx, view: &forged_proto::RunView) -> Vec<Value> {
    view.packets
        .iter()
        .filter_map(|packet| {
            let (_, stage, seq) = super::split_packet_key(&packet.packet_id).ok()?;
            let dir = ctx.config.packet_dir_key(&view.run.run_id, &stage, seq);
            let mut files = std::fs::read_dir(&dir)
                .into_iter()
                .flatten()
                .flatten()
                .filter_map(|entry| {
                    entry
                        .file_type()
                        .ok()
                        .filter(|kind| kind.is_file())
                        .map(|_| entry.path().to_string_lossy().into_owned())
                })
                .collect::<Vec<_>>();
            files.sort();
            Some(json!({
                "packetId": packet.packet_id,
                "directory": dir,
                "files": files,
            }))
        })
        .collect()
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

async fn run_overview(ctx: &Ctx, run_id: &str, after: i64, limit: u64) -> Result<Value, Failure> {
    let status =
        result(super::ops::run_status(ctx, &request(run_id, json!({"run": run_id}))).await)?;
    let workers =
        result(super::sessions::session_list(ctx, &request(run_id, json!({"run": run_id}))).await)?;
    let usage =
        result(super::ops::usage_report(ctx, &request(run_id, json!({"run": run_id}))).await)?;
    let all_events = events(ctx, run_id, 0, None).await?;
    let event_page = events(ctx, run_id, after, Some(limit)).await?;
    let view = super::drive::project(ctx, run_id).await?;
    let findings = super::drive::latest_review_findings(&view);
    let roster_revisions = roster_revisions(ctx, run_id).await?;
    Ok(json!({
        "schema": "forged.overview/1",
        "kind": "slice",
        "id": run_id,
        "cursor": event_page.get("last_event_id"),
        "status": status.get("run"),
        "workers": workers,
        "gates": event_payloads(&all_events, |kind| kind == "proto.gate"),
        "reviews": {
            "events": event_payloads(&all_events, |kind| kind == "proto.review"),
            "latestFindings": findings,
        },
        "artifacts": packet_artifacts(ctx, &view),
        "interventions": event_payloads(&all_events, |kind| kind.starts_with("forged.intervention.")),
        "rosterRevisions": roster_revisions,
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

async fn epic_overview(ctx: &Ctx, epic_id: &str, after: i64, limit: u64) -> Result<Value, Failure> {
    let status =
        result(super::epic::epic_status(ctx, &request(epic_id, json!({"epic": epic_id}))).await)?;
    let all_events = events(ctx, epic_id, 0, None).await?;
    let event_page = events(ctx, epic_id, after, Some(limit)).await?;
    let mut child_runs = Vec::new();
    let mut workers = Vec::new();
    let mut gates = Vec::new();
    let mut reviews = Vec::new();
    let mut artifacts = Vec::new();
    let mut interventions = Vec::new();
    let mut usage = BTreeMap::<&'static str, f64>::new();
    for child in status
        .get("children")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        let Some(run_id) = child.get("runId").and_then(Value::as_str) else {
            continue;
        };
        match run_overview(ctx, run_id, 0, limit.min(25)).await {
            Ok(mut overview) => {
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
                for (key, value) in totals(&overview) {
                    *usage.entry(key).or_default() += value;
                }
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
    Ok(json!({
        "schema": "forged.overview/1",
        "kind": "epic",
        "id": epic_id,
        "cursor": event_page.get("last_event_id"),
        "status": status,
        "childRuns": child_runs,
        "workers": workers,
        "gates": gates,
        "reviews": reviews,
        "artifacts": artifacts,
        "interventions": interventions,
        "schedulerEvents": event_payloads(&all_events, |kind| kind.starts_with("forged.epic.")),
        "usage": {"totals": usage},
        "events": event_page,
        "inputRequired": status.get("inputRequired"),
        "paused": status.get("paused"),
    }))
}

/// Read-only aggregate used by reconnecting agents and the MCP App.
pub async fn overview(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("overview", req, || async {
        let run = param_opt_str(&req.params, "run");
        let epic = param_opt_str(&req.params, "epic");
        if run.is_some() == epic.is_some() {
            return Err(Failure::invalid(
                "overview takes exactly one of params \"run\" or \"epic\"",
            ));
        }
        let after = req.params.get("after").and_then(Value::as_i64).unwrap_or(0);
        if after < 0 {
            return Err(Failure::invalid("overview after must be non-negative"));
        }
        let limit = req
            .params
            .get("limit")
            .and_then(Value::as_u64)
            .unwrap_or(100);
        if limit == 0 || limit > 1_000 {
            return Err(Failure::invalid(
                "overview limit must be between 1 and 1000",
            ));
        }
        match (run, epic) {
            (Some(run), None) => run_overview(ctx, run, after, limit).await,
            (None, Some(epic)) => epic_overview(ctx, epic, after, limit).await,
            _ => unreachable!(),
        }
    })
    .await
}
