//! One reconnect projection for slice and epic execution.

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{
    AdmissionReservationState, AttemptState, DesiredReconcileOutcome, EffectClass, EventRow,
    RunOutcome, WorkObservationSnapshot,
};
use forged_types::{
    attention_id, attention_occurrence_id, AdmissionOutcome, AdmissionReason,
    AttentionAcknowledgementV1, AttentionCondition, AttentionEvidenceKind, AttentionEvidenceRefV1,
    AttentionItemV1, AttentionResolutionDisposition, AttentionResolutionV1, AttentionState,
    AttentionSubjectKind, Finding, OperationRequest, OperationResponse, Outcome, PacketResult,
    WorkRefKind, WorkRefV1, ATTENTION_ITEM_SCHEMA_V1,
};
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
        // Verbatim Operations counts. `coverage` is deliberately NOT passed
        // through: this payload already carries `cap`, and two
        // differently-defined caps in one envelope is a trap.
        "counts": operations.get("counts").cloned().unwrap_or(Value::Null),
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

// Work Detail is deliberately a denser projection than the compatibility
// Overview. Every collection has a hard response bound, while the `total`
// beside it continues to describe the complete subject snapshot.
const WORK_DETAIL_CAP: usize = 200;
const ATTENTION_EVIDENCE_CAP: usize = 50;

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
            } => Some(json!({
                "attemptId": attempt_id,
                "packetId": result.packet_id,
                "implemented": implemented,
                "commitsAhead": commits_ahead,
                "summary": summary,
                "gateState": gate_state,
                "passed": gate_state == "pass",
                "note": note,
            })),
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
                "identity": identity,
                "status": run_status(run),
                "delivery": run_delivery(run),
            })
        })
        .collect()
}

fn epic_status_delivery(snapshot: &WorkObservationSnapshot) -> Result<(Value, Value), Failure> {
    let desired = snapshot.desired_work.iter().find(|row| {
        row.subject_kind == forged_ledger::DesiredSubjectKind::Epic
            && row.subject_id == snapshot.subject.id
    });
    let complete_events = snapshot.events.after_event_id == 0 && !snapshot.events.has_more;
    let mut latest_pause: Option<(&str, &EventRow)> = None;
    let mut latest_input: Option<(&str, &EventRow)> = None;
    let mut latest_pr: Option<&EventRow> = None;
    if complete_events {
        for event in &snapshot.events.rows {
            match event.kind.as_str() {
                super::epic::PAUSED | super::epic::RESUMED => {
                    latest_pause = Some((&event.kind, event))
                }
                super::epic::INPUT_REQUIRED | super::epic::INPUT_RESOLVED => {
                    latest_input = Some((&event.kind, event));
                }
                super::epic::EPIC_PR => latest_pr = Some(event),
                _ => {}
            }
        }
    }
    let state = if latest_pr.is_some() {
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
    let status = json!({
        "source": "ledger",
        "state": state,
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
            "sha": payload.get("sha"),
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
    Ok((status, delivery))
}

#[derive(Clone)]
struct ObservationAttentionSource {
    subject_kind: AttentionSubjectKind,
    subject_id: String,
    repository: Option<String>,
    condition: AttentionCondition,
    opened_at: String,
    updated_at: String,
    cursor: i64,
    source_id: String,
    detail: String,
    evidence: Value,
    evidence_ref: AttentionEvidenceRefV1,
}

#[allow(clippy::too_many_arguments)]
fn attention_source(
    sources: &mut Vec<ObservationAttentionSource>,
    kind: AttentionSubjectKind,
    subject_id: impl Into<String>,
    repository: Option<String>,
    condition: AttentionCondition,
    opened_at: impl Into<String>,
    updated_at: impl Into<String>,
    cursor: i64,
    source_id: impl Into<String>,
    detail: impl Into<String>,
    evidence: Value,
    evidence_kind: AttentionEvidenceKind,
    evidence_id: impl Into<String>,
) {
    sources.push(ObservationAttentionSource {
        subject_kind: kind,
        subject_id: subject_id.into(),
        repository,
        condition,
        opened_at: opened_at.into(),
        updated_at: updated_at.into(),
        cursor,
        source_id: source_id.into(),
        detail: detail.into(),
        evidence,
        evidence_ref: AttentionEvidenceRefV1 {
            kind: evidence_kind,
            id: evidence_id.into(),
        },
    });
}

fn attention_subject(
    snapshot: &WorkObservationSnapshot,
    run_id: &str,
) -> (AttentionSubjectKind, String, Option<String>) {
    if let Some(run) = snapshot.runs.iter().find(|row| row.run_id == run_id) {
        (
            AttentionSubjectKind::Run,
            run_id.to_owned(),
            Some(run.repo.clone()),
        )
    } else {
        (
            AttentionSubjectKind::Epic,
            snapshot.subject.id.clone(),
            snapshot
                .identity
                .repository
                .as_ref()
                .map(|repository| repository.path.clone()),
        )
    }
}

fn apply_observed_attention_transitions(
    snapshot: &WorkObservationSnapshot,
    item: &mut AttentionItemV1,
) -> Result<(), Failure> {
    // An incomplete event page cannot prove the absence of an older control.
    // The response reports that incomplete control coverage explicitly.
    if snapshot.events.after_event_id != 0
        || snapshot.events.has_more
        || (snapshot.subject.kind == forged_types::WorkIdentitySubjectKind::Epic
            && item.subject_kind == AttentionSubjectKind::Run)
    {
        return Ok(());
    }
    let mut transitions = Vec::new();
    for event in &snapshot.events.rows {
        if !matches!(
            event.kind.as_str(),
            super::attention::ACKNOWLEDGED
                | super::attention::RESOLVED
                | super::attention::REOPENED
        ) {
            continue;
        }
        let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
            Failure::internal(format!(
                "attention transition event {} has invalid stored JSON: {error}",
                event.event_id
            ))
        })?;
        if payload.get("schema").and_then(Value::as_str) != Some("forged.attention-transition/1") {
            return Err(Failure::internal(format!(
                "attention transition event {} has an unsupported schema",
                event.event_id
            )));
        }
        if payload.get("attentionId").and_then(Value::as_str) == Some(item.attention_id.as_str())
            && payload.get("occurrenceId").and_then(Value::as_str)
                == Some(item.occurrence_id.as_str())
        {
            transitions.push((event, payload));
        }
    }
    transitions.sort_by_key(|(event, _)| event.event_id);
    for (event, payload) in transitions {
        let actor = payload
            .get("actor")
            .and_then(Value::as_str)
            .ok_or_else(|| Failure::internal("stored attention transition has no actor"))?;
        match event.kind.as_str() {
            super::attention::ACKNOWLEDGED if item.state != AttentionState::Resolved => {
                item.state = AttentionState::Acknowledged;
                item.acknowledgement = Some(AttentionAcknowledgementV1 {
                    actor: actor.to_owned(),
                    at: event.ts.clone(),
                });
                item.resolution = None;
            }
            super::attention::RESOLVED => {
                let disposition: AttentionResolutionDisposition =
                    serde_json::from_value(payload.get("disposition").cloned().ok_or_else(
                        || Failure::internal("stored resolution has no disposition"),
                    )?)
                    .map_err(|error| {
                        Failure::internal(format!(
                            "stored resolution has an unknown disposition: {error}"
                        ))
                    })?;
                item.state = AttentionState::Resolved;
                item.resolution = Some(AttentionResolutionV1 {
                    actor: actor.to_owned(),
                    disposition,
                    note: payload
                        .get("note")
                        .and_then(Value::as_str)
                        .unwrap_or_default()
                        .to_owned(),
                    at: event.ts.clone(),
                });
            }
            super::attention::REOPENED if item.state == AttentionState::Resolved => {
                item.state = AttentionState::Open;
                item.acknowledgement = None;
                item.resolution = None;
            }
            _ => {}
        }
        item.updated_at = event.ts.clone();
    }
    Ok(())
}

/// The title for one attention item's OWN subject.
///
/// `attention_subject` answers `(Run, <child run id>, ...)` for every child
/// of an epic, so filling from `snapshot.identity` unconditionally would
/// stamp the epic's title and bead id onto an item naming a child run.
fn observed_subject_title(
    snapshot: &WorkObservationSnapshot,
    subject_kind: AttentionSubjectKind,
    subject_id: &str,
    subject: &forged_types::WorkTitleV1,
) -> Option<forged_types::WorkTitleV1> {
    let matches_subject = subject_id == snapshot.subject.id
        && match snapshot.subject.kind {
            forged_types::WorkIdentitySubjectKind::Run => subject_kind == AttentionSubjectKind::Run,
            forged_types::WorkIdentitySubjectKind::Epic => {
                subject_kind == AttentionSubjectKind::Epic
            }
        };
    if matches_subject {
        return Some(subject.clone());
    }
    snapshot
        .child_identities
        .iter()
        .find(|identity| identity.subject.id == subject_id)
        .map(|identity| forged_types::resolve_work_title(identity, None))
}

fn observation_attention(
    snapshot: &WorkObservationSnapshot,
    review: &ReviewProjection,
    results: &BTreeMap<i64, PacketResult>,
    subject_title: &forged_types::WorkTitleV1,
) -> Result<Vec<Value>, Failure> {
    let mut sources = Vec::new();
    let artifacts = snapshot
        .attempt_artifacts
        .iter()
        .map(|row| row.attempt_id)
        .collect::<BTreeSet<_>>();

    for run in &snapshot.runs {
        let (kind, subject, repository) = attention_subject(snapshot, &run.run_id);
        let condition = match run.terminal_outcome {
            Some(RunOutcome::Blocked) => Some(AttentionCondition::Blocked),
            Some(RunOutcome::InputRequired) => Some(AttentionCondition::InputRequired),
            _ => None,
        };
        if let Some(condition) = condition {
            attention_source(
                &mut sources,
                kind,
                subject,
                repository,
                condition,
                &run.updated_at,
                &run.updated_at,
                0,
                format!(
                    "run:{}:{}",
                    run.run_id,
                    run.terminal_outcome
                        .expect("matched terminal outcome")
                        .as_str()
                ),
                run.stop_reason
                    .clone()
                    .unwrap_or_else(|| "terminal run requires intervention".to_owned()),
                json!({
                    "runId": run.run_id,
                    "outcome": run.terminal_outcome.map(RunOutcome::as_str),
                    "reason": run.stop_reason,
                }),
                AttentionEvidenceKind::Event,
                format!("run:{}", run.run_id),
            );
        }
    }

    for desired in &snapshot.desired_work {
        if desired.exhausted_at.is_none()
            && desired.last_outcome != Some(DesiredReconcileOutcome::Exhausted)
        {
            continue;
        }
        let (kind, subject, repository) =
            if desired.subject_kind == forged_ledger::DesiredSubjectKind::Run {
                attention_subject(snapshot, &desired.subject_id)
            } else {
                (
                    AttentionSubjectKind::Epic,
                    snapshot.subject.id.clone(),
                    snapshot
                        .identity
                        .repository
                        .as_ref()
                        .map(|repository| repository.path.clone()),
                )
            };
        attention_source(
            &mut sources,
            kind,
            subject,
            repository,
            AttentionCondition::RestartBudgetExhausted,
            desired
                .exhausted_at
                .as_deref()
                .unwrap_or(&desired.updated_at),
            &desired.updated_at,
            i64::from(desired.control_revision as u32),
            format!(
                "desired:{}:{}:{}:{}",
                desired.subject_kind.as_str(),
                desired.subject_id,
                desired.control_revision,
                desired.updated_at
            ),
            desired
                .last_error
                .clone()
                .unwrap_or_else(|| "restart budget is exhausted".to_owned()),
            json!({
                "controlRevision": desired.control_revision,
                "restartBudget": desired.restart_budget,
                "restartUsed": desired.restart_used,
                "outcome": desired.last_outcome.map(|value| value.as_str()),
            }),
            AttentionEvidenceKind::DesiredWork,
            format!("{}:{}", desired.subject_kind.as_str(), desired.subject_id),
        );
    }

    for attempt in &snapshot.attempts {
        let run_id = snapshot
            .packets
            .iter()
            .find(|packet| packet.packet_id == attempt.packet_id)
            .map(|packet| packet.run_id.as_str())
            .unwrap_or(snapshot.subject.id.as_str());
        let (kind, subject, repository) = attention_subject(snapshot, run_id);
        if attempt.state == AttemptState::Revoking {
            attention_source(
                &mut sources,
                kind,
                subject.clone(),
                repository.clone(),
                AttentionCondition::Revoking,
                &attempt.updated_at,
                &attempt.updated_at,
                attempt.attempt_id,
                format!("attempt:{}", attempt.attempt_id),
                format!("attempt {} is revoking", attempt.attempt_id),
                json!({
                    "attemptId": attempt.attempt_id,
                    "packetId": attempt.packet_id,
                    "reason": attempt.revoke_reason,
                }),
                AttentionEvidenceKind::Attempt,
                attempt.attempt_id.to_string(),
            );
        }
        if matches!(
            attempt.state,
            AttemptState::Completed
                | AttemptState::Failed
                | AttemptState::Reclaimed
                | AttemptState::Stopped
        ) && !artifacts.contains(&attempt.attempt_id)
        {
            attention_source(
                &mut sources,
                kind,
                subject,
                repository,
                AttentionCondition::MissingEvidence,
                &attempt.updated_at,
                &attempt.updated_at,
                attempt.attempt_id,
                format!("attempt:{}:manifest-missing", attempt.attempt_id),
                format!(
                    "attempt {} has no durable artifact manifest",
                    attempt.attempt_id
                ),
                json!({"attemptId": attempt.attempt_id, "packetId": attempt.packet_id}),
                AttentionEvidenceKind::Attempt,
                attempt.attempt_id.to_string(),
            );
        }
    }

    for decision in &snapshot.admission_decisions {
        if decision.outcome != AdmissionOutcome::Deferred
            || !matches!(
                decision.reason,
                AdmissionReason::RateLimitCeiling | AdmissionReason::StaleRateLimit
            )
        {
            continue;
        }
        let run_id = snapshot
            .packets
            .iter()
            .find(|packet| packet.packet_id == decision.subject_id)
            .map(|packet| packet.run_id.as_str())
            .or_else(|| {
                snapshot
                    .runs
                    .iter()
                    .find(|run| run.run_id == decision.subject_id)
                    .map(|run| run.run_id.as_str())
            })
            .unwrap_or(snapshot.subject.id.as_str());
        let (kind, subject, repository) = attention_subject(snapshot, run_id);
        attention_source(
            &mut sources,
            kind,
            subject,
            repository,
            AttentionCondition::ProviderDegraded,
            snapshot.identity.captured_at.clone(),
            snapshot.identity.captured_at.clone(),
            i64::from(decision.control_revision as u32),
            format!("admission:{}", decision.batch_id),
            format!("provider admission deferred: {:?}", decision.reason),
            serde_json::to_value(decision).map_err(|error| {
                Failure::internal(format!("serializing admission decision: {error}"))
            })?,
            AttentionEvidenceKind::AdmissionDecision,
            decision.batch_id.clone(),
        );
    }

    for operation in &snapshot.inflight_operations {
        if operation.effect_class != EffectClass::HumanAmbiguous {
            continue;
        }
        let run_id = operation
            .run_id
            .as_deref()
            .unwrap_or(snapshot.subject.id.as_str());
        let (kind, subject, repository) = attention_subject(snapshot, run_id);
        attention_source(
            &mut sources,
            kind,
            subject,
            repository,
            AttentionCondition::AmbiguousEffect,
            &operation.created_at,
            &operation.updated_at,
            0,
            format!("operation:{}", operation.operation_id),
            format!(
                "external effect {} has an ambiguous outcome",
                operation.name
            ),
            json!({"operationId": operation.operation_id, "name": operation.name}),
            AttentionEvidenceKind::Operation,
            operation.operation_id.clone(),
        );
    }
    for reservation in &snapshot.admission_reservations {
        if reservation.state != AdmissionReservationState::Orphaned {
            continue;
        }
        let run_id = snapshot
            .packets
            .iter()
            .find(|packet| packet.packet_id == reservation.subject_id)
            .map(|packet| packet.run_id.as_str())
            .unwrap_or(snapshot.subject.id.as_str());
        let (kind, subject, repository) = attention_subject(snapshot, run_id);
        attention_source(
            &mut sources,
            kind,
            subject,
            repository,
            AttentionCondition::AmbiguousEffect,
            &reservation.created_at,
            &reservation.updated_at,
            0,
            format!("reservation:{}", reservation.reservation_id),
            "admission reservation retains capacity until its external effect is known",
            json!({
                "reservationId": reservation.reservation_id,
                "state": reservation.state.as_str(),
            }),
            AttentionEvidenceKind::Reservation,
            reservation.reservation_id.clone(),
        );
    }

    for (run_id, attempt_id, source_id, evidence) in &review.disagreements {
        let (kind, subject, repository) = attention_subject(snapshot, run_id);
        let updated_at = snapshot
            .attempts
            .iter()
            .find(|attempt| attempt.attempt_id == *attempt_id)
            .map(|attempt| attempt.updated_at.clone())
            .unwrap_or_else(|| snapshot.identity.captured_at.clone());
        attention_source(
            &mut sources,
            kind,
            subject,
            repository,
            AttentionCondition::ReviewerDisagreement,
            &updated_at,
            &updated_at,
            *attempt_id,
            source_id,
            "reviewers disagree at the latest available review round",
            evidence.clone(),
            AttentionEvidenceKind::Attempt,
            attempt_id.to_string(),
        );
    }

    // A latest implementation result that explicitly did not pass its gate
    // is actionable only after automatic execution has stopped.
    let mut latest_gate = BTreeMap::<String, (i64, &str)>::new();
    for (attempt_id, result) in results {
        let Outcome::Implement {
            gate_state: Some(state),
            ..
        } = &result.outcome
        else {
            continue;
        };
        let run_id = snapshot
            .packets
            .iter()
            .find(|packet| packet.packet_id == result.packet_id)
            .map(|packet| packet.run_id.clone())
            .unwrap_or_else(|| snapshot.subject.id.clone());
        latest_gate.insert(run_id, (*attempt_id, state));
    }
    for (run_id, (attempt_id, state)) in latest_gate {
        let live = snapshot.attempts.iter().any(|attempt| {
            matches!(
                attempt.state,
                AttemptState::Running | AttemptState::Revoking
            ) && snapshot
                .packets
                .iter()
                .any(|packet| packet.packet_id == attempt.packet_id && packet.run_id == run_id)
        });
        let scheduled = snapshot.desired_work.iter().any(|desired| {
            desired.desired_state == forged_ledger::DesiredState::Running
                && desired.next_wake_at.is_some()
                && (desired.subject_id == run_id
                    || (snapshot.subject.kind == forged_types::WorkIdentitySubjectKind::Epic
                        && desired.subject_kind == forged_ledger::DesiredSubjectKind::Epic
                        && desired.subject_id == snapshot.subject.id))
        });
        if state == "pass" || live || scheduled {
            continue;
        }
        let (kind, subject, repository) = attention_subject(snapshot, &run_id);
        let updated_at = snapshot
            .attempts
            .iter()
            .find(|attempt| attempt.attempt_id == attempt_id)
            .map(|attempt| attempt.updated_at.clone())
            .unwrap_or_else(|| snapshot.identity.captured_at.clone());
        attention_source(
            &mut sources,
            kind,
            subject,
            repository,
            AttentionCondition::FailedGate,
            &updated_at,
            &updated_at,
            attempt_id,
            format!("attempt:{attempt_id}:gate:{state}"),
            format!("latest recorded gate state is {state:?}"),
            json!({"attemptId": attempt_id, "gateState": state}),
            AttentionEvidenceKind::Attempt,
            attempt_id.to_string(),
        );
    }

    // Missing cost is complete in the snapshot. The latest selected row's
    // attribution is a deterministic recurrence source.
    for (run_id, totals) in &snapshot.usage_totals {
        if totals.rows_missing_cost == 0 {
            continue;
        }
        let Some((offset, row)) = snapshot
            .usage_rows
            .iter()
            .enumerate()
            .rev()
            .find(|(_, row)| row.run_id == *run_id && row.cost_usd.is_none())
        else {
            return Err(Failure::internal(format!(
                "usage totals for {run_id:?} report missing cost without a causal row"
            )));
        };
        let (kind, subject, repository) = attention_subject(snapshot, run_id);
        let source_id = format!(
            "usage:{}:{}:{}:{}:{}",
            run_id,
            row.packet_id.as_deref().unwrap_or("-"),
            row.attempt_id
                .map_or_else(|| "-".to_owned(), |id| id.to_string()),
            row.provider,
            offset
        );
        attention_source(
            &mut sources,
            kind,
            subject,
            repository,
            AttentionCondition::MissingCost,
            &row.ts,
            &row.ts,
            i64::try_from(offset).unwrap_or(i64::MAX),
            source_id,
            format!(
                "{} usage rows carry no cost, so spend is partial",
                totals.rows_missing_cost
            ),
            json!({
                "runId": run_id,
                "rowsMissingCost": totals.rows_missing_cost,
                "packetId": row.packet_id,
                "attemptId": row.attempt_id,
            }),
            AttentionEvidenceKind::Event,
            format!("usage:{run_id}:{offset}"),
        );
    }

    // Event-backed conditions are projected only when this page is the
    // complete subject stream. Otherwise their current state is unknown and
    // the response reports incomplete event/control coverage instead of
    // manufacturing an empty or stale condition.
    let events_complete = snapshot.events.after_event_id == 0 && !snapshot.events.has_more;
    if events_complete {
        let mut latest_input: Option<&EventRow> = None;
        let mut latest_quarantine = BTreeMap::<String, &EventRow>::new();
        let mut latest_settlement: Option<&EventRow> = None;
        let mut latest_terminal = BTreeMap::<String, &EventRow>::new();
        for event in &snapshot.events.rows {
            match event.kind.as_str() {
                super::epic::INPUT_REQUIRED | super::epic::INPUT_RESOLVED => {
                    latest_input = Some(event)
                }
                "proto.quarantine" => {
                    if let Some(run_id) = event.run_id.as_ref() {
                        latest_quarantine.insert(run_id.clone(), event);
                    }
                }
                super::attention::BEAD_SETTLEMENT_PENDING
                | super::attention::BEAD_SETTLEMENT_SUCCEEDED => latest_settlement = Some(event),
                "run.protocol-terminal" => {
                    if let Some(run_id) = event.run_id.as_ref() {
                        latest_terminal.insert(run_id.clone(), event);
                    }
                }
                _ => {}
            }
        }
        if let Some(event) = latest_input.filter(|event| event.kind == super::epic::INPUT_REQUIRED)
        {
            let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "input event {} has invalid stored JSON: {error}",
                    event.event_id
                ))
            })?;
            attention_source(
                &mut sources,
                AttentionSubjectKind::Epic,
                snapshot.subject.id.clone(),
                snapshot
                    .identity
                    .repository
                    .as_ref()
                    .map(|repository| repository.path.clone()),
                AttentionCondition::InputRequired,
                &event.ts,
                &event.ts,
                event.event_id,
                format!("event:{}", event.event_id),
                payload
                    .get("detail")
                    .and_then(Value::as_str)
                    .unwrap_or("operator input is required"),
                payload.clone(),
                AttentionEvidenceKind::Event,
                event.event_id.to_string(),
            );
        }
        if let Some(event) = latest_settlement
            .filter(|event| event.kind == super::attention::BEAD_SETTLEMENT_PENDING)
        {
            let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "settlement event {} has invalid stored JSON: {error}",
                    event.event_id
                ))
            })?;
            attention_source(
                &mut sources,
                if snapshot.subject.kind == forged_types::WorkIdentitySubjectKind::Epic {
                    AttentionSubjectKind::Epic
                } else {
                    AttentionSubjectKind::Run
                },
                snapshot.subject.id.clone(),
                snapshot
                    .identity
                    .repository
                    .as_ref()
                    .map(|repository| repository.path.clone()),
                AttentionCondition::BeadsSettlementPending,
                &event.ts,
                &event.ts,
                event.event_id,
                format!("event:{}", event.event_id),
                payload
                    .get("error")
                    .and_then(Value::as_str)
                    .unwrap_or("Beads settlement is pending"),
                payload.clone(),
                AttentionEvidenceKind::Event,
                event.event_id.to_string(),
            );
        }
        for (run_id, event) in latest_quarantine {
            let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "quarantine event {} has invalid stored JSON: {error}",
                    event.event_id
                ))
            })?;
            let (kind, subject, repository) = attention_subject(snapshot, &run_id);
            attention_source(
                &mut sources,
                kind,
                subject,
                repository,
                AttentionCondition::Quarantined,
                &event.ts,
                &event.ts,
                event.event_id,
                format!("event:{}", event.event_id),
                "result evidence is quarantined",
                payload,
                AttentionEvidenceKind::Event,
                event.event_id.to_string(),
            );
        }
        for (run_id, event) in latest_terminal {
            let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "terminal event {} has invalid stored JSON: {error}",
                    event.event_id
                ))
            })?;
            if payload.pointer("/terminal/providerUnavailable").is_none() {
                continue;
            }
            let (kind, subject, repository) = attention_subject(snapshot, &run_id);
            attention_source(
                &mut sources,
                kind,
                subject,
                repository,
                AttentionCondition::RetryExhausted,
                &event.ts,
                &event.ts,
                event.event_id,
                format!("event:{}", event.event_id),
                "provider retry budget is exhausted",
                payload,
                AttentionEvidenceKind::Event,
                event.event_id.to_string(),
            );
        }
    }

    let mut grouped = BTreeMap::<
        (AttentionSubjectKind, String, AttentionCondition),
        Vec<ObservationAttentionSource>,
    >::new();
    for source in sources {
        grouped
            .entry((
                source.subject_kind,
                source.subject_id.clone(),
                source.condition,
            ))
            .or_default()
            .push(source);
    }
    let mut projected = Vec::new();
    for ((subject_kind, subject_id, condition), mut sources) in grouped {
        sources.sort_by(|left, right| {
            (left.cursor, left.source_id.as_str()).cmp(&(right.cursor, right.source_id.as_str()))
        });
        let latest = sources
            .last()
            .expect("nonempty observation attention bucket");
        let stable_id = attention_id(subject_kind, &subject_id, condition);
        let causal = sources
            .iter()
            .map(|source| source.source_id.as_str())
            .collect::<Vec<_>>()
            .join("\n");
        let occurrence_id = attention_occurrence_id(&stable_id, &causal);
        let mut evidence_refs = sources
            .iter()
            .map(|source| source.evidence_ref.clone())
            .collect::<Vec<_>>();
        evidence_refs.sort_by(|left, right| {
            (left.kind, left.id.as_str()).cmp(&(right.kind, right.id.as_str()))
        });
        evidence_refs.dedup();
        evidence_refs.truncate(ATTENTION_EVIDENCE_CAP);
        let (severity, owner, action) = super::attention::policy(condition);
        let mut item = AttentionItemV1 {
            schema: ATTENTION_ITEM_SCHEMA_V1.to_owned(),
            legacy_id: subject_id.clone(),
            legacy_kind: if subject_kind == AttentionSubjectKind::Epic {
                "epic".to_owned()
            } else {
                "slice".to_owned()
            },
            attention_id: stable_id,
            occurrence_id,
            subject_kind,
            subject_title: observed_subject_title(
                snapshot,
                subject_kind,
                &subject_id,
                subject_title,
            ),
            subject_id,
            repository: latest.repository.clone(),
            condition,
            severity,
            owner,
            state: AttentionState::Open,
            opened_at: sources
                .iter()
                .map(|source| source.opened_at.as_str())
                .min()
                .unwrap_or_default()
                .to_owned(),
            updated_at: latest.updated_at.clone(),
            detail: if sources.len() == 1 {
                latest.detail.clone()
            } else {
                format!("{} ({} durable sources)", latest.detail, sources.len())
            },
            evidence: latest.evidence.clone(),
            evidence_refs,
            recommended_action: action,
            acknowledgement: None,
            resolution: None,
        };
        apply_observed_attention_transitions(snapshot, &mut item)?;
        if item.state != AttentionState::Resolved {
            projected.push((severity, owner, latest.cursor, item));
        }
    }
    projected.sort_by(|left, right| {
        (
            left.0,
            left.1,
            left.2,
            left.3.subject_id.as_str(),
            left.3.condition,
        )
            .cmp(&(
                right.0,
                right.1,
                right.2,
                right.3.subject_id.as_str(),
                right.3.condition,
            ))
    });
    projected
        .into_iter()
        .map(|(_, _, _, item)| {
            serde_json::to_value(item)
                .map_err(|error| Failure::internal(format!("serializing attention item: {error}")))
        })
        .collect()
}

/// Project exact Work Detail, spending ONE bounded Beads read on the
/// subject's own bead so the drill-down destination every other App links to
/// can state what the work is called.
///
/// The read is fail-soft on purpose: Work Detail is what an operator opens
/// when something is wrong, which is exactly when Beads may be unavailable.
/// A failed or empty read reports `source: "unknown"` and the projection
/// returns normally; the error is never propagated and this schema carries
/// no `sourceHealth`.
async fn project_work_detail(
    ctx: &Ctx,
    snapshot: WorkObservationSnapshot,
) -> Result<Value, Failure> {
    let live_title = forged_beads::list_issues(
        &ctx.config.bd_config(),
        std::slice::from_ref(&snapshot.identity.bead.id),
    )
    .await
    .ok()
    .into_iter()
    .flatten()
    .find(|issue| issue.id == snapshot.identity.bead.id)
    .map(|issue| issue.title);
    let title_source = forged_types::resolve_work_title(&snapshot.identity, live_title.as_deref());
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
    let attention = observation_attention(&snapshot, &review, &decoded.results, &title_source)?;

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
        forged_types::WorkIdentitySubjectKind::Epic => epic_status_delivery(&snapshot)?,
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

    Ok(json!({
        "schema": "forged.work-detail/1",
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

/// Exact work projection used by the Work Detail App.
///
/// Unlike [`overview`], this surface never resolves a bare id or widens to a
/// portfolio. The caller must supply the canonical kind and id it learned
/// from Operations, so a stale or malformed drawer target fails closed.
pub async fn work_detail(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("work_detail", req, || async {
        let kind = match param_str(&req.params, "subjectKind")? {
            "run" => forged_types::WorkIdentitySubjectKind::Run,
            "epic" => forged_types::WorkIdentitySubjectKind::Epic,
            other => {
                return Err(Failure::invalid(format!(
                    "work detail kind must be \"run\" or \"epic\", got {other:?}"
                )))
            }
        };
        let id = param_str(&req.params, "subjectId")?.to_owned();
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
        let snapshot = on_ledger(&ctx.ledger, move |ledger| {
            ledger.work_observation_snapshot(kind, &id, after, event_limit)
        })
        .await?;
        project_work_detail(ctx, snapshot).await
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
