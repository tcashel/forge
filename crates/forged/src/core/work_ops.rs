//! The typed work-authoring and repair operations — the surface that
//! replaces skills driving the bd CLI, and the no-dead-state promise made
//! operational: every reachable coordination state has a typed verb out.
//!
//! Every response carries the resulting snapshot plus `nextSteps`, because
//! the real consumer is a fresh-context agent that learns the system from
//! op responses, not documentation.

use std::collections::BTreeMap;

use forged_ledger::{
    EffectClass, NewWorkItem, WorkDepKind, WorkItemSnapshot, WorkKind, WorkRevisionCause,
    WorkSpecFields, WorkStatus,
};
use forged_types::{ErrorCode, OperationRequest, OperationResponse};
use serde_json::{json, Value};

use crate::core::{
    default_key, derive_key, err_response, fenced, on_ledger, param_opt_str, param_str, Ctx,
    Failure,
};

fn snapshot_json(snapshot: &WorkItemSnapshot, next_steps: &[&str]) -> Value {
    json!({
        "work": snapshot,
        "nextSteps": next_steps,
    })
}

fn metadata_of(
    params: &serde_json::Map<String, Value>,
) -> Result<BTreeMap<String, String>, Failure> {
    match params.get("metadata") {
        None | Some(Value::Null) => Ok(BTreeMap::new()),
        Some(Value::Object(map)) => {
            let mut out = BTreeMap::new();
            for (key, value) in map {
                let text = match value {
                    Value::String(text) => text.clone(),
                    other => other.to_string(),
                };
                out.insert(key.clone(), text);
            }
            Ok(out)
        }
        Some(_) => Err(Failure::invalid(
            "metadata must be an object of string values",
        )),
    }
}

fn expected_revision_of(params: &serde_json::Map<String, Value>) -> Result<i64, Failure> {
    match params.get("expectedRevision") {
        Some(Value::Number(number)) => number
            .as_i64()
            .ok_or_else(|| Failure::invalid("expectedRevision must be an integer ledger revision")),
        Some(Value::String(text)) => text.parse::<i64>().map_err(|_| {
            Failure::invalid(format!(
                "expectedRevision {text:?} is not an integer ledger revision; re-read the item"
            ))
        }),
        _ => Err(Failure::invalid(
            "expectedRevision is required: pass the revision you read (guards the CAS)",
        )),
    }
}

fn actor_of(params: &serde_json::Map<String, Value>) -> String {
    param_opt_str(params, "actor")
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("operator")
        .to_owned()
}

/// `work_create` — author a new work item with its revision-1 spec.
pub async fn work_create(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let id = match param_str(&req.params, "id") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_create", None, None, None),
                &Failure::invalid("id is required: the stable work item id to mint"),
            )
        }
    };
    let title = match param_str(&req.params, "title") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_create", Some(&id), None, None),
                &Failure::invalid("title is required and must be non-empty"),
            )
        }
    };
    default_key(req, derive_key("work_create", Some(&id), None, None));
    fenced(
        ctx,
        "work_create",
        EffectClass::SafeRetry,
        req,
        None,
        |_op| async {
            let kind = match param_opt_str(&req.params, "kind").unwrap_or("task") {
                "task" => WorkKind::Task,
                "epic" => WorkKind::Epic,
                other => {
                    return Err(Failure::invalid(format!(
                        "kind {other:?} is not task or epic"
                    )))
                }
            };
            let status = match param_opt_str(&req.params, "status").unwrap_or("open") {
                "open" => WorkStatus::Open,
                "blocked" => WorkStatus::Blocked,
                other => {
                    return Err(Failure::invalid(format!(
                        "status {other:?} is not authorable; items are created open or \
                         blocked and reach other states through their verbs"
                    )))
                }
            };
            let priority = req.params.get("priority").and_then(Value::as_i64);
            let metadata = metadata_of(&req.params)?;
            let new = NewWorkItem {
                work_id: id.clone(),
                kind,
                status,
                priority,
                metadata,
                spec: WorkSpecFields {
                    title: title.clone(),
                    description: param_opt_str(&req.params, "description")
                        .unwrap_or_default()
                        .to_owned(),
                    acceptance_criteria: param_opt_str(&req.params, "acceptanceCriteria")
                        .unwrap_or_default()
                        .to_owned(),
                    design: param_opt_str(&req.params, "design")
                        .unwrap_or_default()
                        .to_owned(),
                    notes: param_opt_str(&req.params, "notes")
                        .unwrap_or_default()
                        .to_owned(),
                },
                cause: WorkRevisionCause::Authored,
            };
            let snapshot = on_ledger(&ctx.ledger, move |l| l.create_work_item(new)).await?;
            Ok(snapshot_json(
                &snapshot,
                &[
                    "link dependencies with work_link",
                    "a blocked item joins the frontier when its blockers close or a \
                     planning apply promotes it",
                ],
            ))
        },
    )
    .await
}

/// `work_update` — guarded spec write: revision-CAS over the five spec
/// fields; omitted fields keep their current bytes.
pub async fn work_update(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let id = match param_str(&req.params, "id") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_update", None, None, None),
                &Failure::invalid("id is required"),
            )
        }
    };
    default_key(req, derive_key("work_update", Some(&id), None, None));
    fenced(
        ctx,
        "work_update",
        EffectClass::SafeRetry,
        req,
        None,
        |_op| async {
            let expected = expected_revision_of(&req.params)?;
            let current = {
                let id = id.clone();
                on_ledger(&ctx.ledger, move |l| l.work_item(&id)).await?
            }
            .ok_or_else(|| Failure::invalid(format!("work item {id:?} does not exist")))?;
            let field = |name: &str, fallback: &str| {
                param_opt_str(&req.params, name)
                    .map(str::to_owned)
                    .unwrap_or_else(|| fallback.to_owned())
            };
            let spec = WorkSpecFields {
                title: field("title", &current.spec.title),
                description: field("description", &current.spec.description),
                acceptance_criteria: field("acceptanceCriteria", &current.spec.acceptance_criteria),
                design: field("design", &current.spec.design),
                notes: field("notes", &current.spec.notes),
            };
            let id_owned = id.clone();
            let snapshot = on_ledger(&ctx.ledger, move |l| {
                l.update_work_spec(&id_owned, expected, spec, WorkRevisionCause::Authored)
            })
            .await?;
            Ok(snapshot_json(
                &snapshot,
                &["a moved revision refuses with BEADS_CONTENTION: re-read and re-apply"],
            ))
        },
    )
    .await
}

/// `work_link` — add one typed dependency edge.
pub async fn work_link(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let from = match param_str(&req.params, "fromId") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_link", None, None, None),
                &Failure::invalid("fromId is required (the dependent item)"),
            )
        }
    };
    let to = match param_str(&req.params, "toId") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_link", Some(&from), None, None),
                &Failure::invalid("toId is required (the dependency target)"),
            )
        }
    };
    let kind = match param_opt_str(&req.params, "kind").unwrap_or("blocks") {
        "blocks" => WorkDepKind::Blocks,
        "parent-child" => WorkDepKind::ParentChild,
        "related" => WorkDepKind::Related,
        "discovered-from" => WorkDepKind::DiscoveredFrom,
        "supersedes" => WorkDepKind::Supersedes,
        other => {
            return err_response(
                &derive_key("work_link", Some(&from), Some(&to), None),
                &Failure::invalid(format!(
                    "kind {other:?} is not one of blocks, parent-child, related, \
                     discovered-from, supersedes"
                )),
            )
        }
    };
    default_key(req, derive_key("work_link", Some(&from), Some(&to), None));
    fenced(
        ctx,
        "work_link",
        EffectClass::SafeRetry,
        req,
        None,
        |_op| async {
            let from_owned = from.clone();
            let to_owned = to.clone();
            on_ledger(&ctx.ledger, move |l| {
                l.add_work_dep(&from_owned, &to_owned, kind)
            })
            .await?;
            Ok(json!({
                "linked": {"fromId": from, "toId": to, "kind": kind},
                "nextSteps": ["only blocks edges gate readiness"],
            }))
        },
    )
    .await
}

/// One-id repair/coordination verbs sharing a shape: `work_close`,
/// `work_reopen`, `work_release`, `work_supersede`, `work_revert`.
async fn one_id_verb(
    ctx: &Ctx,
    req: &mut OperationRequest,
    name: &'static str,
    run: impl FnOnce(String, String, serde_json::Map<String, Value>) -> Result<WorkVerb, Failure>,
) -> OperationResponse {
    let id = match param_str(&req.params, "id") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key(name, None, None, None),
                &Failure::invalid("id is required"),
            )
        }
    };
    let actor = actor_of(&req.params);
    let verb = match run(id.clone(), actor, req.params.clone()) {
        Ok(verb) => verb,
        Err(error) => return err_response(&derive_key(name, Some(&id), None, None), &error),
    };
    default_key(req, derive_key(name, Some(&id), None, None));
    fenced(ctx, name, EffectClass::SafeRetry, req, None, |_op| async {
        let (snapshot, next) = verb.apply(ctx).await?;
        Ok(snapshot_json(&snapshot, &[next]))
    })
    .await
}

enum WorkVerb {
    Close {
        id: String,
        actor: String,
        reason: String,
    },
    Reopen {
        id: String,
        actor: String,
    },
    Release {
        id: String,
        actor: String,
    },
    Supersede {
        id: String,
        actor: String,
        successor: String,
    },
    Revert {
        id: String,
        actor: String,
        expected: i64,
        to: i64,
    },
}

impl WorkVerb {
    async fn apply(self, ctx: &Ctx) -> Result<(WorkItemSnapshot, &'static str), Failure> {
        match self {
            WorkVerb::Close { id, actor, reason } => {
                let snapshot = on_ledger(&ctx.ledger, move |l| {
                    l.close_work_item(&id, &actor, &reason)
                })
                .await?;
                Ok((snapshot, "work_reopen is the deliberate exit from closed"))
            }
            WorkVerb::Reopen { id, actor } => {
                let snapshot =
                    on_ledger(&ctx.ledger, move |l| l.reopen_work_item(&id, &actor)).await?;
                Ok((
                    snapshot,
                    "the item is schedulable once unblocked and unheld",
                ))
            }
            WorkVerb::Release { id, actor } => {
                let snapshot =
                    on_ledger(&ctx.ledger, move |l| l.release_work_item(&id, &actor)).await?;
                Ok((
                    snapshot,
                    "custody cleared; a foreign holder refuses with BEAD_LEASE_HELD",
                ))
            }
            WorkVerb::Supersede {
                id,
                actor,
                successor,
            } => {
                let snapshot = on_ledger(&ctx.ledger, move |l| {
                    l.supersede_work_item(&id, &successor, &actor)
                })
                .await?;
                Ok((snapshot, "the successor carries the supersedes edge"))
            }
            WorkVerb::Revert {
                id,
                actor,
                expected,
                to,
            } => {
                let snapshot = on_ledger(&ctx.ledger, move |l| {
                    l.revert_work_spec(&id, expected, to, &actor)
                })
                .await?;
                Ok((
                    snapshot,
                    "the revert minted a new revision copying the old bytes; nothing was lost",
                ))
            }
        }
    }
}

/// `work_close` — close with a recorded reason.
pub async fn work_close(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let mut moved = req.clone();
    one_id_verb(ctx, &mut moved, "work_close", |id, actor, params| {
        let reason = param_opt_str(&params, "reason")
            .filter(|value| !value.trim().is_empty())
            .ok_or_else(|| Failure::invalid("reason is required and must be non-empty"))?
            .to_owned();
        Ok(WorkVerb::Close { id, actor, reason })
    })
    .await
}

/// `work_reopen` — status open from any state, custody untouched.
pub async fn work_reopen(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let mut moved = req.clone();
    one_id_verb(ctx, &mut moved, "work_reopen", |id, actor, _params| {
        Ok(WorkVerb::Reopen { id, actor })
    })
    .await
}

/// `work_release` — clear custody under the actor CAS.
pub async fn work_release(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let mut moved = req.clone();
    one_id_verb(ctx, &mut moved, "work_release", |id, actor, _params| {
        Ok(WorkVerb::Release { id, actor })
    })
    .await
}

/// `work_supersede` — the redispatch verb: link the successor and close the
/// superseded item atomically.
pub async fn work_supersede(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let mut moved = req.clone();
    one_id_verb(ctx, &mut moved, "work_supersede", |id, actor, params| {
        let successor = param_opt_str(&params, "successorId")
            .filter(|value| !value.trim().is_empty())
            .ok_or_else(|| {
                Failure::invalid("successorId is required: create it first with work_create")
            })?
            .to_owned();
        Ok(WorkVerb::Supersede {
            id,
            actor,
            successor,
        })
    })
    .await
}

/// `work_revert` — mint revision N+1 copying an earlier revision's bytes.
pub async fn work_revert(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let mut moved = req.clone();
    one_id_verb(ctx, &mut moved, "work_revert", |id, actor, params| {
        let expected = expected_revision_of(&params)?;
        let to = params
            .get("toRevision")
            .and_then(Value::as_i64)
            .ok_or_else(|| Failure::invalid("toRevision is required (the revision to restore)"))?;
        Ok(WorkVerb::Revert {
            id,
            actor,
            expected,
            to,
        })
    })
    .await
}

/// `work_show` — one item with its dependencies (the `bd show` replacement,
/// read-only by construction).
pub async fn work_show(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let id = match param_str(&req.params, "id") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_show", None, None, None),
                &Failure::invalid("id is required"),
            )
        }
    };
    crate::core::read_only("work_show", req, || async {
        let snapshot = {
            let id = id.clone();
            on_ledger(&ctx.ledger, move |l| l.work_item(&id)).await?
        }
        .ok_or_else(|| {
            let mut failure = Failure::invalid(format!("work item {id:?} does not exist"));
            failure.code = ErrorCode::InvalidRequest;
            failure
        })?;
        let deps = {
            let id = id.clone();
            on_ledger(&ctx.ledger, move |l| l.work_dependencies(&id)).await?
        };
        Ok(json!({"work": snapshot, "dependencies": deps}))
    })
    .await
}

/// `work_ready` — the ready frontier (read-only).
pub async fn work_ready(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    crate::core::read_only("work_ready", req, || async {
        let ready = on_ledger(&ctx.ledger, |l| l.ready_work_items()).await?;
        Ok(json!({"ready": ready}))
    })
    .await
}
