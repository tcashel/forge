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
        "packetHistory": packet_history(&view),
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
