//! One reconnect projection for slice and epic execution.

use std::collections::BTreeMap;

use forged_types::{OperationRequest, OperationResponse};
use serde_json::{json, Map, Value};

use crate::core::{on_ledger, param_opt_str, param_str, read_only, Ctx, Failure};

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
    let roster_revisions = roster_revisions(ctx, run_id).await?;
    Ok(json!({
        "schema": "forged.overview/1",
        "kind": "slice",
        "id": run_id,
        "identity": status.pointer("/run/identity"),
        "cursor": event_page.get("last_event_id"),
        "status": status.get("run"),
        "workers": workers,
        "gates": event_payloads(&all_events, |kind| kind == "proto.gate"),
        "reviews": {
            "events": event_payloads(&all_events, |kind| kind == "proto.review"),
            "latestFindings": findings,
        },
        "packetHistory": packet_history(&view),
        "artifacts": packet_artifacts(ctx, &view).await?,
        "interventions": event_payloads(&all_events, |kind| kind.starts_with("forged.intervention.")),
        "rosterRevisions": roster_revisions,
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

async fn epic_overview(ctx: &Ctx, epic_id: &str, after: i64, limit: u64) -> Result<Value, Failure> {
    let status =
        result(super::epic::epic_status(ctx, &request(epic_id, json!({"epic": epic_id}))).await)?;
    let all_events = events(ctx, epic_id, 0, None).await?;
    let event_page = events(ctx, epic_id, after, Some(limit)).await?;
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

/// The newest entries a portfolio carries.
///
/// The inventory grows for the life of the operator's ledger and is never
/// pruned, so an uncapped portfolio eventually becomes a payload no host
/// will carry. Two hundred: an entry is a dozen scalar keys — ~300 bytes —
/// so a full page is under 100 KB, well below the epic projection this same
/// tool already returns, which embeds a whole child overview per child. It
/// is also more concurrent work than an operator runs, so truncation is the
/// exception `total` exists to announce; `work_list` serves the inventory
/// whole for a caller that wants the tail.
const PORTFOLIO_CAP: usize = 200;

/// The portfolio: every unit of work and what needs a human, for a caller
/// that cannot name a subject yet.
///
/// Newest first, capped at [`PORTFOLIO_CAP`] with the totals stated, so a
/// consumer distinguishes a complete answer from a truncated one. `spend`
/// and `attentionTotal` cover the WHOLE inventory, never the capped page:
/// a figure that quietly described only what fit would be read as complete.
/// `attention` is present and empty when nothing needs a human — an omitted
/// key is indistinguishable from an unimplemented one.
///
/// Carries no event page: `after`/`limit` address one subject's stream, and
/// the portfolio is the level above any subject.
async fn portfolio_overview(ctx: &Ctx, req: &OperationRequest) -> Result<Value, Failure> {
    let operations = super::ops::operations_projection(ctx, req).await?;
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
        .get("attention")
        .and_then(Value::as_array)
        .map_or(0, Vec::len);
    let attention = operations
        .get("attention")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .take(PORTFOLIO_CAP)
        .cloned()
        .collect::<Vec<_>>();
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
    let queue = json!({
        "groups": queue_groups,
        "total": total,
        "cap": PORTFOLIO_CAP,
        "asOf": operations.pointer("/capturedAt/ledger").cloned().unwrap_or(Value::Null),
    });
    Ok(json!({
        "schema": "forged.overview/1",
        "kind": "portfolio",
        "entries": entries,
        "total": total,
        "cap": PORTFOLIO_CAP,
        "liveSeats": live_seats,
        "attention": attention,
        "attentionTotal": attention_total,
        "queue": queue,
        "admission": admission,
        "spend": {
            "costUsdKnown": operations.pointer("/spend/costUsdKnown").cloned().unwrap_or(json!(0.0)),
            "rowsMissingCost": operations.pointer("/spend/rowsMissingCost").cloned().unwrap_or(json!(0)),
        },
        "sourceHealth": operations.get("sourceHealth").cloned().unwrap_or(Value::Null),
    }))
}

/// What a bare `id` resolved to.
enum Resolved {
    /// The id names one slice run.
    Slice(String),
    /// The id names one epic.
    Epic(String),
    /// The id named no single subject; the caller gets a chooser instead of
    /// a refusal, already shaped as a `forged.overview/1` payload.
    Candidates(Value),
}

/// Resolve a bare `id` to a kind through ONE inventory scan.
///
/// The inventory `work_list` serves is the resolution index — the only place
/// an epic with no `runs` row is discoverable — so resolution reads it whole
/// and matches in memory rather than issuing a lookup per candidate.
///
/// An exact id always wins over any prefix interpretation of the same
/// string, so a shorter id that prefixes a longer one is never shadowed by
/// it. A prefix resolves only when exactly one entry matches; zero is
/// `unknown` with an empty candidate list and two or more is `ambiguous`
/// with those entries. Neither is an error: a wrong guess degrades into a
/// menu, and "nothing could have been meant" is a successful answer.
async fn resolve(ctx: &Ctx, id: &str) -> Result<Resolved, Failure> {
    let entries = super::ops::inventory(ctx, super::ops::Spend::Omit).await?;
    let resolved = |entry: &Value| {
        let entry_id = entry["id"].as_str().unwrap_or_default().to_owned();
        match entry["kind"].as_str() {
            Some("epic") => Resolved::Epic(entry_id),
            _ => Resolved::Slice(entry_id),
        }
    };
    if let Some(entry) = entries.iter().find(|entry| entry["id"] == json!(id)) {
        return Ok(resolved(entry));
    }
    let candidates: Vec<Value> = entries
        .into_iter()
        .filter(|entry| {
            entry["id"]
                .as_str()
                .is_some_and(|entry_id| entry_id.starts_with(id))
        })
        .collect();
    if candidates.len() == 1 {
        return Ok(resolved(&candidates[0]));
    }
    Ok(Resolved::Candidates(json!({
        "schema": "forged.overview/1",
        "resolution": {
            "query": id,
            "reason": if candidates.is_empty() { "unknown" } else { "ambiguous" },
            "candidates": candidates,
        },
    })))
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
        for key in ["run", "epic", "id"] {
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
        match (run, epic, id) {
            (None, None, None) => portfolio_overview(ctx, req).await,
            (Some(run), None, None) => run_overview(ctx, run, after, limit).await,
            (None, Some(epic), None) => epic_overview(ctx, epic, after, limit).await,
            // A resolved id projects through the SAME call the explicit
            // param makes, so the two answers cannot drift.
            (None, None, Some(id)) => match resolve(ctx, id).await? {
                Resolved::Slice(run) => run_overview(ctx, &run, after, limit).await,
                Resolved::Epic(epic) => epic_overview(ctx, &epic, after, limit).await,
                Resolved::Candidates(payload) => Ok(payload),
            },
            _ => unreachable!(),
        }
    })
    .await
}

/// Exact work projection used by the Work Detail App.
///
/// Unlike [`overview`], this surface never resolves a bare id or widens to a
/// portfolio. The caller must supply the canonical kind and id it learned
/// from Operations, so a stale or malformed drawer target fails closed.
pub async fn work_detail(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("work_detail", req, || async {
        let kind = param_str(&req.params, "subjectKind")?;
        let id = param_str(&req.params, "subjectId")?;
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

        let mut projection = match kind {
            "run" | "slice" => run_overview(ctx, id, after, limit).await?,
            "epic" => epic_overview(ctx, id, after, limit).await?,
            other => {
                return Err(Failure::invalid(format!(
                    "work detail kind must be \"run\" or \"epic\", got {other:?}"
                )))
            }
        };
        let object = projection
            .as_object_mut()
            .ok_or_else(|| Failure::internal("work detail projection was not an object"))?;
        object.insert("schema".to_owned(), json!("forged.work-detail/1"));
        object.insert(
            "workRef".to_owned(),
            json!({
                "kind": if kind == "epic" { "epic" } else { "run" },
                "id": id,
            }),
        );
        Ok(projection)
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
