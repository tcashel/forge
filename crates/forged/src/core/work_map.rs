//! Authority-preserving, bounded Work Map projection.

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{InventorySnapshot, InventoryUsageSelection};
use forged_types::{
    ErrorCode, OperationRequest, OperationResponse, WorkIdentitySubjectKind, WorkIdentityV1,
    WorkMapCapturedAtV1, WorkMapCountsV1, WorkMapEdgeKind, WorkMapEdgeV1, WorkMapGraphHealthV1,
    WorkMapGroup, WorkMapNodeV1, WorkMapScopeKind, WorkMapScopeV1, WorkMapSource, WorkMapV1,
    WorkRefKind, WorkRefV1, WORK_MAP_SCHEMA_V1,
};
use serde_json::{json, Map, Value};

use crate::config::now_iso;
use crate::core::{on_ledger, read_only, Ctx, Failure};

const DEFAULT_MAX_NODES: usize = 250;
const MAX_NODES: usize = 500;
const HISTORY_SUBJECT_LIMIT: u64 = 200;

#[derive(Debug)]
struct MapRequest {
    scope: WorkMapScopeV1,
    group: Option<WorkMapGroup>,
    source: Option<WorkMapSource>,
    from: Option<String>,
    to: Option<String>,
    max_nodes: usize,
    focus: Option<WorkRefV1>,
}

fn optional_string(params: &Map<String, Value>, key: &str) -> Result<Option<String>, Failure> {
    let Some(value) = params.get(key) else {
        return Ok(None);
    };
    let value = value
        .as_str()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| Failure::invalid(format!("work map {key} must be a non-empty string")))?;
    Ok(Some(value.to_owned()))
}

fn normalize_request(req: &OperationRequest) -> Result<MapRequest, Failure> {
    const ALLOWED: [&str; 9] = [
        "scope",
        "repository",
        "epicId",
        "group",
        "source",
        "from",
        "to",
        "maxNodes",
        "focus",
    ];
    if let Some(unknown) = req
        .params
        .keys()
        .find(|key| !ALLOWED.contains(&key.as_str()))
    {
        return Err(Failure::invalid(format!(
            "unknown work map parameter {unknown:?}"
        )));
    }
    let scope_name =
        optional_string(&req.params, "scope")?.unwrap_or_else(|| "operator".to_owned());
    let kind = WorkMapScopeKind::parse(&scope_name).ok_or_else(|| {
        Failure::invalid(format!(
            "work map scope must be operator, repository, or epic, got {scope_name:?}"
        ))
    })?;
    let repository = optional_string(&req.params, "repository")?;
    let epic_id = optional_string(&req.params, "epicId")?;
    match kind {
        WorkMapScopeKind::Operator if repository.is_some() || epic_id.is_some() => {
            return Err(Failure::invalid(
                "operator work map scope accepts neither repository nor epicId",
            ));
        }
        WorkMapScopeKind::Repository => {
            let value = repository
                .as_deref()
                .ok_or_else(|| Failure::invalid("repository work map scope requires repository"))?;
            let normalized = forged_types::normalize_repository_path(value).ok_or_else(|| {
                Failure::invalid("work map repository must be an absolute lexical path")
            })?;
            if normalized != value {
                return Err(Failure::invalid(
                    "work map repository must already be in canonical lexical form",
                ));
            }
            if epic_id.is_some() {
                return Err(Failure::invalid(
                    "repository work map scope does not accept epicId",
                ));
            }
        }
        WorkMapScopeKind::Epic => {
            if epic_id.is_none() {
                return Err(Failure::invalid("epic work map scope requires epicId"));
            }
            if repository.is_some() {
                return Err(Failure::invalid(
                    "epic work map scope does not accept repository",
                ));
            }
        }
        _ => {}
    }
    let group = optional_string(&req.params, "group")?
        .map(|value| {
            WorkMapGroup::parse(&value)
                .ok_or_else(|| Failure::invalid(format!("unknown work map group {value:?}")))
        })
        .transpose()?;
    let source = optional_string(&req.params, "source")?
        .map(|value| {
            WorkMapSource::parse(&value)
                .ok_or_else(|| Failure::invalid(format!("unknown work map source {value:?}")))
        })
        .transpose()?;
    let max_nodes = req
        .params
        .get("maxNodes")
        .map(|value| {
            value
                .as_u64()
                .ok_or_else(|| Failure::invalid("work map maxNodes must be an unsigned integer"))
                .and_then(|value| {
                    usize::try_from(value)
                        .map_err(|_| Failure::invalid("work map maxNodes is too large"))
                })
        })
        .transpose()?
        .unwrap_or(DEFAULT_MAX_NODES);
    if !(1..=MAX_NODES).contains(&max_nodes) {
        return Err(Failure::invalid(format!(
            "work map maxNodes must be between 1 and {MAX_NODES}"
        )));
    }
    let focus = req
        .params
        .get("focus")
        .map(|value| {
            serde_json::from_value::<WorkRefV1>(value.clone())
                .map_err(|error| Failure::invalid(format!("invalid work map focus: {error}")))
                .and_then(|value| {
                    value.validate().map_err(|error| {
                        Failure::invalid(format!("invalid work map focus: {error}"))
                    })?;
                    Ok(value)
                })
        })
        .transpose()?;

    Ok(MapRequest {
        scope: WorkMapScopeV1 {
            kind,
            repository,
            epic_id,
        },
        group,
        source,
        from: optional_string(&req.params, "from")?,
        to: optional_string(&req.params, "to")?,
        max_nodes,
        focus,
    })
}

fn graph_too_large(detail: impl Into<String>) -> Failure {
    Failure::refused(
        ErrorCode::GraphScopeTooLarge,
        format!(
            "{}; narrow scope, group, source, or lower the requested plan breadth",
            detail.into()
        ),
    )
}

fn identity(entry: &Value) -> Result<WorkIdentityV1, Failure> {
    serde_json::from_value(entry.get("identity").cloned().unwrap_or(Value::Null))
        .map_err(|error| Failure::internal(format!("operator entry has invalid identity: {error}")))
}

fn durable_in_scope(entry: &Value, scope: &WorkMapScopeV1) -> Result<bool, Failure> {
    let identity = identity(entry)?;
    Ok(match scope.kind {
        WorkMapScopeKind::Operator => true,
        WorkMapScopeKind::Repository => {
            identity
                .repository
                .as_ref()
                .map(|repository| repository.path.as_str())
                == scope.repository.as_deref()
        }
        WorkMapScopeKind::Epic => {
            let epic = scope.epic_id.as_deref();
            (identity.subject.kind == WorkIdentitySubjectKind::Epic
                && Some(identity.subject.id.as_str()) == epic)
                || identity.epic.as_ref().map(|value| value.id.as_str()) == epic
        }
    })
}

fn work_ref(kind: WorkRefKind, id: &str) -> Result<WorkRefV1, Failure> {
    WorkRefV1::new(kind, id)
        .map_err(|error| Failure::internal(format!("constructing Work Map reference: {error}")))
}

fn ref_key(reference: &WorkRefV1) -> String {
    format!(
        "{}:{}",
        match reference.kind {
            WorkRefKind::Plan => "plan",
            WorkRefKind::Run => "run",
            WorkRefKind::Epic => "epic",
        },
        reference.id
    )
}

fn entry_ref(entry: &Value) -> Result<WorkRefV1, Failure> {
    serde_json::from_value(entry.get("workRef").cloned().unwrap_or(Value::Null))
        .map_err(|error| Failure::internal(format!("operator entry has invalid workRef: {error}")))
}

/// Absent or null is "this surface resolved no title"; a present value that
/// does not decode is a producer defect and fails closed like `identity`.
fn title_source(entry: &Value) -> Result<Option<forged_types::WorkTitleV1>, Failure> {
    match entry.get("titleSource") {
        None | Some(Value::Null) => Ok(None),
        Some(value) => serde_json::from_value(value.clone())
            .map(Some)
            .map_err(|error| {
                Failure::internal(format!("operator entry has invalid titleSource: {error}"))
            }),
    }
}

fn queue_group(entry: &Value) -> Option<WorkMapGroup> {
    entry
        .get("queueGroup")
        .and_then(Value::as_str)
        .and_then(super::ops::queue_code)
        .and_then(WorkMapGroup::parse)
}

fn attention_rows(entry: &Value) -> Vec<Value> {
    entry
        .pointer("/attentionItems/items")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default()
}

fn epic_context(identity: &WorkIdentityV1) -> Option<String> {
    if identity.subject.kind == WorkIdentitySubjectKind::Epic {
        Some(identity.subject.id.clone())
    } else {
        identity.epic.as_ref().map(|value| value.id.clone())
    }
}

fn durable_node(entry: &Value, history: Value) -> Result<WorkMapNodeV1, Failure> {
    let work_ref = entry_ref(entry)?;
    let identity = identity(entry)?;
    let repository = identity.repository.as_ref().map(|value| value.path.clone());
    let queue = json!({
        "source": "operations",
        "group": queue_group(entry).map(WorkMapGroup::as_str),
        "desired": entry.get("desired").cloned().unwrap_or(Value::Null),
        "admission": entry.get("admission").cloned().unwrap_or(Value::Null),
        "claimHealth": entry.get("claimHealth").cloned().unwrap_or(Value::Null),
        "nextAction": entry.get("nextAction").cloned().unwrap_or(Value::Null),
    });
    let execution = json!({
        "source": "ledger",
        "state": entry.get("state").cloned().unwrap_or(Value::Null),
        "outcome": entry.get("outcome").cloned().unwrap_or(Value::Null),
        "stopReason": entry.get("stopReason").cloned().unwrap_or(Value::Null),
        "delivery": entry.get("delivery").cloned().unwrap_or(Value::Null),
        "controller": entry.get("controller").cloned().unwrap_or(Value::Null),
        "pr": entry.get("pr").cloned().unwrap_or(Value::Null),
        "ci": entry.get("ci").cloned().unwrap_or(Value::Null),
        "supersededBy": entry.get("supersededBy").cloned().unwrap_or(Value::Null),
        "liveSeats": entry.get("liveSeats").cloned().unwrap_or(json!(0)),
        "currentStage": entry.get("currentStage").cloned().unwrap_or(Value::Null),
        "currentSeat": entry.get("currentSeat").cloned().unwrap_or(Value::Null),
        "currentAgent": entry.get("currentAgent").cloned().unwrap_or(Value::Null),
        "reviewReady": queue_group(entry) == Some(WorkMapGroup::ReadyToMerge),
        "recovery": {
            "blocker": entry.get("blocker").cloned().unwrap_or(Value::Null),
            "nextAction": entry.get("nextAction").cloned().unwrap_or(Value::Null),
        },
        "usage": {
            "costUsdKnown": entry.get("costUsdKnown").cloned().unwrap_or(json!(0.0)),
            "rowsMissingCost": entry.get("rowsMissingCost").cloned().unwrap_or(json!(0)),
        },
    });
    Ok(WorkMapNodeV1 {
        work_ref,
        source: "durable".to_owned(),
        context_only: false,
        identity: Some(identity.clone()),
        title_source: title_source(entry)?,
        repository,
        epic_id: epic_context(&identity),
        plan: Value::Null,
        queue,
        execution,
        history,
        attention: attention_rows(entry),
        detail_target: entry.get("detailTarget").cloned().unwrap_or(Value::Null),
    })
}

fn plan_node(entry: &Value) -> Result<WorkMapNodeV1, Failure> {
    let work_ref = entry_ref(entry)?;
    let identity = identity(entry)?;
    let repository = identity.repository.as_ref().map(|value| value.path.clone());
    Ok(WorkMapNodeV1 {
        work_ref,
        source: "live-plan".to_owned(),
        context_only: false,
        identity: Some(identity.clone()),
        title_source: title_source(entry)?,
        repository,
        epic_id: epic_context(&identity),
        plan: entry.get("plan").cloned().unwrap_or(Value::Null),
        queue: json!({
            "source": "operations",
            "group": queue_group(entry).map(WorkMapGroup::as_str),
            "desired": entry.get("desired").cloned().unwrap_or(Value::Null),
            "admission": entry.get("admission").cloned().unwrap_or(Value::Null),
            "claimHealth": entry.get("claimHealth").cloned().unwrap_or(Value::Null),
            "nextAction": entry.get("nextAction").cloned().unwrap_or(Value::Null),
        }),
        execution: entry.get("execution").cloned().unwrap_or(Value::Null),
        history: Value::Null,
        attention: attention_rows(entry),
        detail_target: Value::Null,
    })
}

fn boundary_node(id: &str, status: Value) -> Result<WorkMapNodeV1, Failure> {
    Ok(WorkMapNodeV1 {
        work_ref: work_ref(WorkRefKind::Plan, id)?,
        source: "beads-boundary".to_owned(),
        context_only: true,
        identity: None,
        title_source: None,
        repository: None,
        epic_id: None,
        plan: json!({"source": "beads-boundary", "status": status}),
        queue: json!({"source": "none"}),
        execution: json!({"source": "none", "state": "not-started"}),
        history: Value::Null,
        attention: Vec::new(),
        detail_target: Value::Null,
    })
}

fn dependency_kind(kind: crate::core::work_types::PlanDependencyType) -> WorkMapEdgeKind {
    match kind {
        crate::core::work_types::PlanDependencyType::Blocks => WorkMapEdgeKind::Blocks,
        crate::core::work_types::PlanDependencyType::ParentChild => WorkMapEdgeKind::ParentChild,
        crate::core::work_types::PlanDependencyType::Related => WorkMapEdgeKind::Related,
        crate::core::work_types::PlanDependencyType::DiscoveredFrom => {
            WorkMapEdgeKind::DiscoveredFrom
        }
        crate::core::work_types::PlanDependencyType::Supersedes => WorkMapEdgeKind::Supersedes,
    }
}

fn add_edge(
    edges: &mut Vec<WorkMapEdgeV1>,
    indexes: &mut BTreeMap<(String, String, WorkMapEdgeKind), usize>,
    source: WorkRefV1,
    target: WorkRefV1,
    kind: WorkMapEdgeKind,
    context_only: bool,
    evidence: &str,
) {
    let key = (ref_key(&source), ref_key(&target), kind);
    if let Some(index) = indexes.get(&key).copied() {
        let edge = &mut edges[index];
        edge.context_only &= context_only;
        if !edge.evidence.iter().any(|value| value == evidence) {
            edge.evidence.push(evidence.to_owned());
        }
        return;
    }
    indexes.insert(key, edges.len());
    edges.push(WorkMapEdgeV1 {
        source,
        target,
        kind,
        context_only,
        evidence: vec![evidence.to_owned()],
    });
}

fn route_attention(entries: &mut [Value], attention: &[Value]) -> Result<(), Failure> {
    for entry in entries {
        let id = entry
            .get("id")
            .and_then(Value::as_str)
            .ok_or_else(|| Failure::internal("operator entry has no id"))?;
        let work_id = entry
            .get("beadId")
            .and_then(Value::as_str)
            .unwrap_or_default();
        let is_plan = entry.get("source").and_then(Value::as_str) == Some("live-plan");
        let items = attention
            .iter()
            .filter(|item| {
                let work_evidence = item
                    .get("evidenceRefs")
                    .and_then(Value::as_array)
                    .into_iter()
                    .flatten()
                    .any(|reference| {
                        reference.get("kind").and_then(Value::as_str) == Some("bead")
                            && reference.get("id").and_then(Value::as_str) == Some(work_id)
                    });
                if is_plan {
                    work_evidence
                } else {
                    !work_evidence && item.get("subjectId").and_then(Value::as_str) == Some(id)
                }
            })
            .cloned()
            .collect::<Vec<_>>();
        entry
            .as_object_mut()
            .ok_or_else(|| Failure::internal("operator entry is not an object"))?
            .insert(
                "attentionItems".to_owned(),
                json!({"source": "projection", "items": items}),
            );
    }
    Ok(())
}

fn cycle_nodes(edges: &[WorkMapEdgeV1], refs: &BTreeMap<String, WorkRefV1>) -> Vec<WorkRefV1> {
    fn visit(
        node: &str,
        graph: &BTreeMap<String, Vec<String>>,
        stack: &mut Vec<String>,
        active: &mut BTreeMap<String, usize>,
        visited: &mut BTreeSet<String>,
        cyclic: &mut BTreeSet<String>,
    ) {
        if visited.contains(node) {
            return;
        }
        active.insert(node.to_owned(), stack.len());
        stack.push(node.to_owned());
        if let Some(targets) = graph.get(node) {
            for target in targets {
                if let Some(index) = active.get(target).copied() {
                    cyclic.extend(stack[index..].iter().cloned());
                } else if !visited.contains(target) {
                    visit(target, graph, stack, active, visited, cyclic);
                }
            }
        }
        stack.pop();
        active.remove(node);
        visited.insert(node.to_owned());
    }

    let mut graph: BTreeMap<String, Vec<String>> = BTreeMap::new();
    for edge in edges {
        if edge.kind != WorkMapEdgeKind::ExecutionOf {
            graph
                .entry(ref_key(&edge.source))
                .or_default()
                .push(ref_key(&edge.target));
        }
    }
    let mut stack = Vec::new();
    let mut active = BTreeMap::new();
    let mut visited = BTreeSet::new();
    let mut cyclic = BTreeSet::new();
    for node in graph.keys() {
        visit(
            node,
            &graph,
            &mut stack,
            &mut active,
            &mut visited,
            &mut cyclic,
        );
    }
    cyclic
        .into_iter()
        .filter_map(|key| refs.get(&key).cloned())
        .collect()
}

async fn history_projection(
    ctx: &Ctx,
    request: &MapRequest,
) -> Result<(Value, Value, Option<String>, Value), Failure> {
    let mut params = Map::new();
    if let Some(from) = &request.from {
        params.insert("from".to_owned(), json!(from));
    }
    if let Some(to) = &request.to {
        params.insert("to".to_owned(), json!(to));
    }
    if let Some(repository) = &request.scope.repository {
        params.insert("repo".to_owned(), json!(repository));
    }
    if let Some(epic) = &request.scope.epic_id {
        params.insert("epic".to_owned(), json!(epic));
    }
    params.insert("groupBy".to_owned(), json!("none"));
    params.insert("limit".to_owned(), json!(HISTORY_SUBJECT_LIMIT));
    let response = super::history::work_history(
        ctx,
        &OperationRequest {
            schema_version: 1,
            idempotency_key: "op:work_map:history".to_owned(),
            run_id: None,
            params,
        },
    )
    .await;
    if !response.ok {
        let error = response.error.unwrap_or(forged_types::OpError {
            code: ErrorCode::Internal,
            message: "history failed without an error".to_owned(),
            recoverable: false,
            detail: None,
        });
        if error.code == ErrorCode::InvalidRequest {
            return Err(Failure::invalid(error.message));
        }
        return Ok((
            Value::Null,
            json!({"state":"unavailable","error":error.message}),
            None,
            json!({"coverage": Value::Null, "nextCursor": Value::Null}),
        ));
    }
    let body = response.result.unwrap_or(Value::Null);
    let coverage = body.get("coverage").cloned().unwrap_or(Value::Null);
    let degraded = coverage
        .get("degraded")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let health = json!({
        "state": if degraded { "degraded" } else { "available" },
        "coverage": coverage,
    });
    let captured = body.get("asOf").and_then(Value::as_str).map(str::to_owned);
    let join_coverage = json!({
        "coverage": body.get("coverage").cloned().unwrap_or(Value::Null),
        "nextCursor": body.get("nextCursor").cloned().unwrap_or(Value::Null),
    });
    Ok((body, health, captured, join_coverage))
}

fn history_by_subject(body: &Value) -> BTreeMap<String, Value> {
    body.get("subjects")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(|subject| {
            let kind = subject.pointer("/identity/subject/kind")?.as_str()?;
            let id = subject.pointer("/identity/subject/id")?.as_str()?;
            Some((format!("{kind}:{id}"), subject.clone()))
        })
        .collect()
}

async fn project(ctx: &Ctx, request: MapRequest) -> Result<Value, Failure> {
    let kinds: Vec<&str> = super::ops::LIFECYCLE_KINDS
        .iter()
        .chain(super::attention::ATTENTION_EVENT_KINDS.iter())
        .copied()
        .collect();
    let snapshot: InventorySnapshot = on_ledger(&ctx.ledger, move |ledger| {
        ledger.inventory_snapshot(&kinds, InventoryUsageSelection::Include)
    })
    .await?;
    let ledger_captured_at = now_iso();
    let mut entries = super::ops::project_entries(&snapshot, super::ops::Spend::Include)?;
    entries.extend(super::ops::desired_only_entries(&snapshot, &entries)?);
    super::ops::decorate_durable_entries(&mut entries)?;
    entries = entries
        .into_iter()
        .filter_map(|entry| match durable_in_scope(&entry, &request.scope) {
            Ok(true) => Some(Ok(entry)),
            Ok(false) => None,
            Err(error) => Some(Err(error)),
        })
        .collect::<Result<Vec<_>, _>>()?;
    if request.source == Some(WorkMapSource::LivePlan) {
        entries.clear();
    }
    if entries.len() > request.max_nodes {
        return Err(graph_too_large(format!(
            "{} durable nodes exceed maxNodes {}",
            entries.len(),
            request.max_nodes
        )));
    }
    let exact_ids = super::ops::entry_work_ids(&entries);
    let plan_scope = match request.scope.kind {
        WorkMapScopeKind::Operator => crate::core::work_types::WorkMapPlanScope::Operator,
        WorkMapScopeKind::Repository => crate::core::work_types::WorkMapPlanScope::Repository(
            request
                .scope
                .repository
                .clone()
                .expect("validated repository"),
        ),
        WorkMapScopeKind::Epic => crate::core::work_types::WorkMapPlanScope::Epic(
            request.scope.epic_id.clone().expect("validated epic"),
        ),
    };
    let plan_limit = request.max_nodes.saturating_sub(entries.len()).max(1);
    let plan_read =
        super::workstore::work_map_plan_inventory(&ctx.ledger, &plan_scope, &exact_ids, plan_limit)
            .await;
    let work_captured_at = now_iso();
    let (plan_inventory, plan_error) = match plan_read {
        Ok(inventory) => (Some(inventory), None),
        Err(error) => (None, Some(error.to_string())),
    };
    if request.source != Some(WorkMapSource::Durable)
        && plan_inventory.as_ref().is_some_and(|value| value.truncated)
    {
        let inventory = plan_inventory.as_ref().expect("checked");
        return Err(graph_too_large(format!(
            "at least {} live-plan nodes plus {} durable nodes exceed maxNodes {}",
            inventory.discovered,
            entries.len(),
            request.max_nodes
        )));
    }

    let mut plan_issues = Vec::new();
    let work_summaries = if let Some(inventory) = &plan_inventory {
        plan_issues = inventory.issues.clone();
        inventory.exact_issues.clone()
    } else {
        Vec::new()
    };
    if request.source != Some(WorkMapSource::Durable) {
        for plan in &plan_issues {
            entries.push(super::ops::live_plan_entry(plan, &work_captured_at)?);
        }
    }
    super::ops::decorate_titles(&mut entries, &work_summaries)?;
    let attention = super::attention::project_active(&snapshot, &entries, &work_summaries)?
        .into_iter()
        .map(|item| {
            serde_json::to_value(item).map_err(|error| {
                Failure::internal(format!("serializing Work Map attention: {error}"))
            })
        })
        .collect::<Result<Vec<_>, _>>()?;
    super::ops::enrich_operations_facts(&snapshot, &attention, &mut entries)?;
    let work_read = plan_error
        .as_ref()
        .map_or_else(|| Ok(work_summaries.clone()), |error| Err(error.clone()));
    let _queue = super::ops::operator_queue(&snapshot, &mut entries, &attention, work_read);
    route_attention(&mut entries, &attention)?;

    entries.retain(|entry| {
        request.source.is_none_or(|source| match source {
            WorkMapSource::Durable => {
                entry.get("source").and_then(Value::as_str) != Some("live-plan")
            }
            WorkMapSource::LivePlan => {
                entry.get("source").and_then(Value::as_str) == Some("live-plan")
            }
        }) && request
            .group
            .is_none_or(|group| queue_group(entry) == Some(group))
    });
    if entries.len() > request.max_nodes {
        return Err(graph_too_large(format!(
            "{} filtered nodes exceed maxNodes {}",
            entries.len(),
            request.max_nodes
        )));
    }

    let (history_body, history_health, history_captured_at, mut history_coverage) =
        history_projection(ctx, &request).await?;
    let history = history_by_subject(&history_body);
    let mut nodes = Vec::with_capacity(entries.len());
    let mut history_attached = 0u64;
    let mut history_eligible = 0u64;
    for entry in &entries {
        if entry.get("source").and_then(Value::as_str) == Some("live-plan") {
            nodes.push(plan_node(entry)?);
        } else {
            history_eligible += 1;
            let reference = entry_ref(entry)?;
            let row = history
                .get(&ref_key(&reference))
                .cloned()
                .unwrap_or(Value::Null);
            if !row.is_null() {
                history_attached += 1;
            }
            nodes.push(durable_node(entry, row)?);
        }
    }

    let mut refs: BTreeMap<String, WorkRefV1> = nodes
        .iter()
        .map(|node| (ref_key(&node.work_ref), node.work_ref.clone()))
        .collect();
    let mut edges = Vec::new();
    let mut edge_indexes = BTreeMap::new();
    let known_plan_status = work_summaries
        .iter()
        .map(|issue| (issue.id.clone(), json!(issue.status)))
        .collect::<BTreeMap<_, _>>();
    let mut boundary_status: BTreeMap<String, Value> = BTreeMap::new();
    for node in nodes.iter().filter(|node| node.source == "durable") {
        let Some(identity) = &node.identity else {
            continue;
        };
        let target = work_ref(WorkRefKind::Plan, &identity.work.id)?;
        let context_only = !refs.contains_key(&ref_key(&target))
            && known_plan_status.contains_key(&identity.work.id);
        if context_only {
            boundary_status
                .entry(identity.work.id.clone())
                .or_insert_with(|| known_plan_status[&identity.work.id].clone());
        }
        add_edge(
            &mut edges,
            &mut edge_indexes,
            node.work_ref.clone(),
            target,
            WorkMapEdgeKind::ExecutionOf,
            context_only,
            "identity.bead",
        );
    }

    let visible_plans = nodes
        .iter()
        .filter(|node| node.work_ref.kind == WorkRefKind::Plan && !node.context_only)
        .map(|node| node.work_ref.id.clone())
        .collect::<BTreeSet<_>>();
    let mut missing_blocker_status = Vec::new();
    for plan in plan_issues
        .iter()
        .filter(|plan| visible_plans.contains(&plan.issue.id))
    {
        let source = work_ref(WorkRefKind::Plan, &plan.issue.id)?;
        if let Some(parent) = &plan.parent {
            let target = work_ref(WorkRefKind::Plan, parent)?;
            let context_only = !refs.contains_key(&ref_key(&target));
            if context_only {
                boundary_status.entry(parent.clone()).or_insert_with(|| {
                    known_plan_status
                        .get(parent)
                        .cloned()
                        .unwrap_or(Value::Null)
                });
            }
            add_edge(
                &mut edges,
                &mut edge_indexes,
                source.clone(),
                target,
                WorkMapEdgeKind::ParentChild,
                context_only,
                "plan.parent",
            );
        }
        for dependency in &plan.dependencies {
            let target = work_ref(WorkRefKind::Plan, &dependency.id)?;
            let context_only = !refs.contains_key(&ref_key(&target));
            let kind = dependency_kind(dependency.dependency_type);
            if context_only {
                boundary_status
                    .entry(dependency.id.clone())
                    .or_insert_with(|| {
                        known_plan_status
                            .get(&dependency.id)
                            .cloned()
                            .or_else(|| dependency.status.map(|status| json!(status.as_str())))
                            .unwrap_or(Value::Null)
                    });
            }
            if dependency.dependency_type == crate::core::work_types::PlanDependencyType::Blocks
                && dependency.status.is_none()
            {
                missing_blocker_status.push(json!({
                    "source": source.clone(),
                    "target": target.clone(),
                    "type": "blocks",
                }));
            }
            add_edge(
                &mut edges,
                &mut edge_indexes,
                source.clone(),
                target,
                kind,
                context_only,
                "plan.dependencies",
            );
        }
    }
    if nodes.len().saturating_add(boundary_status.len()) > request.max_nodes {
        return Err(graph_too_large(format!(
            "{} graph nodes including boundary context exceed maxNodes {}",
            nodes.len().saturating_add(boundary_status.len()),
            request.max_nodes
        )));
    }
    for (id, status) in boundary_status {
        let node = boundary_node(&id, status)?;
        refs.insert(ref_key(&node.work_ref), node.work_ref.clone());
        nodes.push(node);
    }

    let dangling_targets = edges
        .iter()
        .filter(|edge| !refs.contains_key(&ref_key(&edge.target)))
        .map(|edge| (ref_key(&edge.target), edge.target.clone()))
        .collect::<BTreeMap<_, _>>()
        .into_values()
        .collect::<Vec<_>>();
    let cycles = cycle_nodes(&edges, &refs);
    if let Some(focus) = &request.focus {
        if !refs.contains_key(&ref_key(focus)) {
            return Err(Failure::invalid(format!(
                "work map focus {} is outside the bounded scope",
                ref_key(focus)
            )));
        }
    }
    let graph_health = WorkMapGraphHealthV1 {
        healthy: cycles.is_empty()
            && dangling_targets.is_empty()
            && missing_blocker_status.is_empty(),
        cycle_nodes: cycles,
        dangling_targets,
        missing_blocker_status,
    };
    let context_only = nodes.iter().filter(|node| node.context_only).count() as u64;
    let plan_count = nodes
        .iter()
        .filter(|node| node.work_ref.kind == WorkRefKind::Plan)
        .count() as u64;
    let run_count = nodes
        .iter()
        .filter(|node| node.work_ref.kind == WorkRefKind::Run)
        .count() as u64;
    // Subject kind, not reference kind: an epic is minted as a `plan`
    // reference so its edges resolve, so this count overlaps `plan_count`.
    let epic_count = nodes
        .iter()
        .filter_map(|node| node.identity.as_ref())
        .filter(|identity| identity.subject.kind == WorkIdentitySubjectKind::Epic)
        .count() as u64;
    let attention_count = nodes.iter().map(|node| node.attention.len() as u64).sum();
    if let Some(object) = history_coverage.as_object_mut() {
        object.insert("eligibleNodes".to_owned(), json!(history_eligible));
        object.insert("attachedNodes".to_owned(), json!(history_attached));
        object.insert(
            "unattachedNodes".to_owned(),
            json!(history_eligible.saturating_sub(history_attached)),
        );
    }
    let plan_state = plan_inventory.as_ref().map_or("unavailable", |inventory| {
        if inventory.truncated {
            "partial"
        } else {
            "available"
        }
    });
    let source_health = json!({
        "ledger": {"state": "available"},
        "beads": {
            "state": if plan_error.is_some() { "unavailable" } else { "available" },
            "error": plan_error,
        },
        "plan": {
            "state": plan_state,
            "discovered": plan_inventory.as_ref().map(|value| value.discovered),
            "limit": plan_limit,
            "truncated": plan_inventory.as_ref().is_some_and(|value| value.truncated),
        },
        "history": history_health,
    });
    let response = WorkMapV1 {
        schema: WORK_MAP_SCHEMA_V1.to_owned(),
        scope: request.scope,
        filters: json!({
            "group": request.group.map(WorkMapGroup::as_str),
            "source": request.source.map(WorkMapSource::as_str),
            "from": request.from,
            "to": request.to,
            "maxNodes": request.max_nodes,
        }),
        focus: request.focus,
        captured_at: WorkMapCapturedAtV1 {
            ledger: ledger_captured_at,
            work: plan_inventory.as_ref().map(|_| work_captured_at),
            history: history_captured_at,
        },
        source_health,
        counts: WorkMapCountsV1 {
            nodes: nodes.len() as u64,
            plan: plan_count,
            runs: run_count,
            epics: epic_count,
            context_only,
            edges: edges.len() as u64,
            attention: attention_count,
            history_attached,
            history_unattached: history_eligible.saturating_sub(history_attached),
        },
        nodes,
        edges,
        graph_health,
        history_coverage,
    };
    serde_json::to_value(response)
        .map_err(|error| Failure::internal(format!("serializing Work Map: {error}")))
}

pub async fn work_map(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("work_map", req, || async {
        let request = normalize_request(req)?;
        project(ctx, request).await
    })
    .await
}
