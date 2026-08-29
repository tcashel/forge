//! The typed work-authoring and repair operations — the surface that
//! replaces skills driving the bd CLI, and the no-dead-state promise made
//! operational: every reachable coordination state has a typed verb out.
//!
//! Every response carries the resulting snapshot plus `nextSteps`, because
//! the real consumer is a fresh-context agent that learns the system from
//! op responses, not documentation.

use std::collections::BTreeMap;

use base64::{engine::general_purpose::STANDARD, Engine as _};
use forged_ledger::{
    EffectClass, NewWorkItem, NewWorkNote, WorkDepKind, WorkItemFilters, WorkItemSnapshot,
    WorkKind, WorkNoteKind, WorkReadyAfter, WorkRevisionCause, WorkSpecFields, WorkStatus,
    WORK_NOTE_DEFAULT_LIMIT, WORK_NOTE_MAX_LIMIT,
};
use forged_types::{
    canonical_json_bytes, parse_canonical, request_sha256, ErrorCode, ExecutionApprovalV1,
    OperationRequest, OperationResponse, SpecRecommendationsV1, EXECUTION_APPROVAL_SCHEMA_V1,
    SPEC_RECOMMENDATIONS_SCHEMA_V1,
};
use serde_json::{json, Value};

use crate::core::{
    default_key, derive_key, err_response, fenced, on_ledger, param_opt_i64_strict, param_opt_str,
    param_opt_str_strict, param_str, Ctx, Failure,
};

const WORK_READY_DEFAULT_LIMIT: u64 = 100;
const WORK_READY_MAX_LIMIT: u64 = 500;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct WorkReadyCursor {
    priority: Option<i64>,
    work_id: String,
}

#[derive(Clone, Copy)]
enum WorkReadyDetail {
    Summary,
    Full,
}

impl WorkReadyDetail {
    fn as_str(self) -> &'static str {
        match self {
            Self::Summary => "summary",
            Self::Full => "full",
        }
    }
}

fn invalid_work_ready_cursor() -> Failure {
    Failure::invalid(
        "work_ready cursor is invalid; run work ready without --cursor to restart pagination",
    )
}

fn encode_work_ready_cursor(snapshot: &WorkItemSnapshot) -> Result<String, Failure> {
    let value = serde_json::to_value(WorkReadyCursor {
        priority: snapshot.priority,
        work_id: snapshot.work_id.clone(),
    })
    .map_err(|error| Failure::internal(format!("serialize work_ready cursor: {error}")))?;
    let bytes = canonical_json_bytes(&value)
        .map_err(|error| Failure::internal(format!("canonicalize work_ready cursor: {error}")))?;
    Ok(STANDARD.encode(bytes))
}

fn decode_work_ready_cursor(value: &str) -> Result<WorkReadyAfter, Failure> {
    if value.is_empty() || value.len() > 4_096 {
        return Err(invalid_work_ready_cursor());
    }
    let bytes = STANDARD
        .decode(value)
        .map_err(|_| invalid_work_ready_cursor())?;
    let cursor: WorkReadyCursor =
        serde_json::from_slice(&bytes).map_err(|_| invalid_work_ready_cursor())?;
    if cursor.work_id.trim().is_empty() {
        return Err(invalid_work_ready_cursor());
    }
    let canonical_value = serde_json::to_value(&cursor).map_err(|_| invalid_work_ready_cursor())?;
    let canonical_bytes =
        canonical_json_bytes(&canonical_value).map_err(|_| invalid_work_ready_cursor())?;
    if bytes != canonical_bytes {
        return Err(invalid_work_ready_cursor());
    }
    Ok(WorkReadyAfter {
        priority: cursor.priority,
        work_id: cursor.work_id,
    })
}

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

#[derive(Default)]
struct WorkSpecPatch {
    title: Option<String>,
    description: Option<String>,
    acceptance_criteria: Option<String>,
    design: Option<String>,
    notes: Option<String>,
}

impl WorkSpecPatch {
    fn parse(
        params: &serde_json::Map<String, Value>,
        title_supported: bool,
    ) -> Result<Self, Failure> {
        if !title_supported && params.get("title").is_some_and(|value| !value.is_null()) {
            return Err(Failure::invalid(
                "work promote preserves title; use work update to change it",
            ));
        }
        let field =
            |name: &str| param_opt_str_strict(params, name).map(|value| value.map(str::to_owned));
        Ok(Self {
            title: if title_supported {
                field("title")?
            } else {
                None
            },
            description: field("description")?,
            acceptance_criteria: field("acceptanceCriteria")?,
            design: field("design")?,
            notes: field("notes")?,
        })
    }

    fn has_fields(&self) -> bool {
        self.title.is_some()
            || self.description.is_some()
            || self.acceptance_criteria.is_some()
            || self.design.is_some()
            || self.notes.is_some()
    }

    fn apply(self, current: WorkSpecFields) -> WorkSpecFields {
        WorkSpecFields {
            title: self.title.unwrap_or(current.title),
            description: self.description.unwrap_or(current.description),
            acceptance_criteria: self
                .acceptance_criteria
                .unwrap_or(current.acceptance_criteria),
            design: self.design.unwrap_or(current.design),
            notes: self.notes.unwrap_or(current.notes),
        }
    }
}

fn actor_of(params: &serde_json::Map<String, Value>) -> Result<String, Failure> {
    Ok(param_opt_str_strict(params, "actor")?
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("operator")
        .to_owned())
}

fn work_note_kind(value: &str) -> Result<WorkNoteKind, Failure> {
    WorkNoteKind::parse(value).ok_or_else(|| {
        Failure::invalid(format!(
            "work note kind {value:?} is not one of comment, critique, recommendation, approval"
        ))
    })
}

fn work_note_wire_string(
    params: &serde_json::Map<String, Value>,
    name: &str,
) -> Result<Option<String>, Failure> {
    match params.get(name) {
        None | Some(Value::Null) => Ok(None),
        Some(Value::String(value)) => Ok(Some(value.clone())),
        Some(_) => Err(Failure::invalid(format!(
            "work note {name} must be a string when present"
        ))),
    }
}

fn canonical_work_note_body(
    params: &serde_json::Map<String, Value>,
) -> Result<(Value, String), Failure> {
    let raw = work_note_wire_string(params, "bodyJson")?
        .ok_or_else(|| Failure::invalid("bodyJson is required: pass JSON from --body-file"))?;
    let value = parse_canonical(&raw).map_err(|error| {
        Failure::invalid(format!(
            "work note bodyJson must be JSON without duplicate keys or non-integer numbers: \
             {error}"
        ))
    })?;
    let bytes = canonical_json_bytes(&value).map_err(|error| {
        Failure::invalid(format!(
            "work note bodyJson must be JSON without duplicate keys or non-integer numbers: \
             {error}"
        ))
    })?;
    let body = String::from_utf8(bytes)
        .map_err(|error| Failure::internal(format!("canonical bodyJson is not UTF-8: {error}")))?;
    Ok((value, body))
}

fn work_note_schema(kind: WorkNoteKind, supplied: Option<String>) -> Result<String, Failure> {
    let expected = match kind {
        WorkNoteKind::Recommendation => Some(SPEC_RECOMMENDATIONS_SCHEMA_V1),
        WorkNoteKind::Approval => Some(EXECUTION_APPROVAL_SCHEMA_V1),
        WorkNoteKind::Comment | WorkNoteKind::Critique => None,
    };
    match (expected, supplied) {
        (Some(expected), Some(supplied)) if supplied != expected => Err(Failure::invalid(format!(
            "work note kind {:?} requires schema {expected:?}; --schema {supplied:?} is a \
             kind/schema mismatch",
            kind.as_str()
        ))),
        (Some(expected), _) => Ok(expected.to_owned()),
        (None, Some(supplied)) => Ok(supplied),
        (None, None) => Ok(format!("{}/0", kind.as_str())),
    }
}

fn validate_work_note_contract(
    kind: WorkNoteKind,
    schema: &str,
    body: &Value,
) -> Result<(), Failure> {
    let result = match kind {
        WorkNoteKind::Recommendation => {
            SpecRecommendationsV1::parse_value(body.clone()).map(|_| ())
        }
        WorkNoteKind::Approval => ExecutionApprovalV1::parse_value(body.clone()).map(|_| ()),
        WorkNoteKind::Comment | WorkNoteKind::Critique => return Ok(()),
    };
    result.map_err(|error| {
        Failure::invalid(format!(
            "work note {:?} payload for schema {schema:?} violates {error}",
            kind.as_str()
        ))
    })
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
            let kind = match param_opt_str_strict(&req.params, "kind")?.unwrap_or("task") {
                "task" => WorkKind::Task,
                "epic" => WorkKind::Epic,
                other => {
                    return Err(Failure::invalid(format!(
                        "kind {other:?} is not task or epic"
                    )))
                }
            };
            let status = match param_opt_str_strict(&req.params, "status")?.unwrap_or("open") {
                "open" => WorkStatus::Open,
                "blocked" => WorkStatus::Blocked,
                other => {
                    return Err(Failure::invalid(format!(
                        "status {other:?} is not authorable; items are created open or \
                         blocked and reach other states through their verbs"
                    )))
                }
            };
            let priority = param_opt_i64_strict(&req.params, "priority")?;
            let metadata = metadata_of(&req.params)?;
            let new = NewWorkItem {
                work_id: id.clone(),
                kind,
                status,
                priority,
                metadata,
                spec: WorkSpecFields {
                    title: title.clone(),
                    description: param_opt_str_strict(&req.params, "description")?
                        .unwrap_or_default()
                        .to_owned(),
                    acceptance_criteria: param_opt_str_strict(&req.params, "acceptanceCriteria")?
                        .unwrap_or_default()
                        .to_owned(),
                    design: param_opt_str_strict(&req.params, "design")?
                        .unwrap_or_default()
                        .to_owned(),
                    notes: param_opt_str_strict(&req.params, "notes")?
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

/// `work_update` — one revision-CAS over optional spec and priority writes.
/// Priority is coordination state, so it never mints a revision.
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
    // The expected revision is part of the derived key: without it a
    // second keyless update of the same item either conflicts on the fence
    // or replays the first response verbatim — multi-revision authoring is
    // the NORMAL path for a keyless agent.
    let expected = match expected_revision_of(&req.params) {
        Ok(expected) => expected,
        Err(error) => {
            return err_response(&derive_key("work_update", Some(&id), None, None), &error)
        }
    };
    let priority = match param_opt_i64_strict(&req.params, "priority") {
        Ok(priority) => priority,
        Err(error) => {
            return err_response(
                &derive_key("work_update", Some(&id), None, Some(expected)),
                &error,
            )
        }
    };
    let actor = match actor_of(&req.params) {
        Ok(actor) => actor,
        Err(error) => {
            return err_response(
                &derive_key("work_update", Some(&id), None, Some(expected)),
                &error,
            )
        }
    };
    req.params.insert("actor".to_owned(), json!(actor));
    let patch = match WorkSpecPatch::parse(&req.params, true) {
        Ok(patch) => patch,
        Err(error) => {
            return err_response(
                &derive_key("work_update", Some(&id), None, Some(expected)),
                &error,
            )
        }
    };
    let has_spec = patch.has_fields();
    if !has_spec && priority.is_none() {
        return err_response(
            &derive_key("work_update", Some(&id), None, Some(expected)),
            &Failure::invalid(
                "work update requires a spec field or priority; use work promote for a \
                 blocked/deferred stub or work reopen for a closed item",
            ),
        );
    }
    let default = if !has_spec {
        // Priority does not move the revision, so include both coordination
        // pre/post-images. This keeps null -> 2 -> 1 -> 2 as three effects
        // instead of replaying the first response on the final transition.
        let before = {
            let id = id.clone();
            on_ledger(&ctx.ledger, move |ledger| ledger.work_item(&id))
                .await
                .ok()
                .flatten()
                .and_then(|snapshot| snapshot.priority)
                .map_or_else(|| "null".to_owned(), |value| value.to_string())
        };
        format!(
            "{}:priority-{before}-to-{}",
            derive_key("work_update", Some(&id), None, Some(expected)),
            priority.unwrap_or_default()
        )
    } else {
        derive_key("work_update", Some(&id), None, Some(expected))
    };
    default_key(req, default);
    fenced(
        ctx,
        "work_update",
        EffectClass::SafeRetry,
        req,
        None,
        |_op| async {
            let current = {
                let id = id.clone();
                on_ledger(&ctx.ledger, move |l| l.work_item(&id)).await?
            }
            .ok_or_else(|| Failure::invalid(format!("work item {id:?} does not exist")))?;
            let spec = has_spec.then(|| patch.apply(current.spec));
            let id_owned = id.clone();
            let snapshot = on_ledger(&ctx.ledger, move |l| {
                l.update_work_item(&id_owned, expected, spec, priority, &actor)
            })
            .await?;
            Ok(snapshot_json(
                &snapshot,
                &[
                    "priority-only updates leave revision unchanged; spec fields mint exactly one",
                    "a moved revision refuses with BEADS_CONTENTION: re-read and re-apply",
                ],
            ))
        },
    )
    .await
}

/// `work_promote` — operation-atomic planning apply for a blocked or deferred
/// stub, guarded by the caller's observed revision.
pub async fn work_promote(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let id = match param_str(&req.params, "id") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_promote", None, None, None),
                &Failure::invalid("id is required"),
            )
        }
    };
    let expected = match expected_revision_of(&req.params) {
        Ok(expected) => expected,
        Err(error) => {
            return err_response(&derive_key("work_promote", Some(&id), None, None), &error)
        }
    };
    let actor = match actor_of(&req.params) {
        Ok(actor) => actor,
        Err(error) => {
            return err_response(
                &derive_key("work_promote", Some(&id), None, Some(expected)),
                &error,
            )
        }
    };
    req.params.insert("actor".to_owned(), json!(actor));
    let patch = match WorkSpecPatch::parse(&req.params, false) {
        Ok(patch) => patch,
        Err(error) => {
            return err_response(
                &derive_key("work_promote", Some(&id), None, Some(expected)),
                &error,
            )
        }
    };
    let current_read = {
        let id = id.clone();
        on_ledger(&ctx.ledger, move |ledger| ledger.work_item(&id)).await
    };
    let current = match current_read {
        Ok(Some(current)) => current,
        Ok(None) => {
            return err_response(
                &derive_key("work_promote", Some(&id), None, Some(expected)),
                &Failure::invalid(format!("work item {id:?} does not exist")),
            )
        }
        Err(error) => {
            return err_response(
                &derive_key("work_promote", Some(&id), None, Some(expected)),
                &error,
            )
        }
    };
    let spec = patch.apply(current.spec);
    default_key(
        req,
        derive_key("work_promote", Some(&id), None, Some(expected)),
    );
    let key = req.idempotency_key.clone();
    match on_ledger(&ctx.ledger, {
        let request = req.clone();
        move |ledger| ledger.apply_work_promote_operation(&request, &id, expected, &actor, spec)
    })
    .await
    {
        Ok(response) => response,
        Err(error) => err_response(&key, &error),
    }
}

/// `work_note_add` — append evidence about a spec without minting a spec
/// revision. The note row and terminal idempotency receipt land atomically.
pub async fn work_note_add(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let id = match param_str(&req.params, "id") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_note_add", None, None, None),
                &Failure::invalid("id is required: pass the existing work item id"),
            )
        }
    };
    let kind = match work_note_wire_string(&req.params, "kind")
        .and_then(|value| value.ok_or_else(|| Failure::invalid("kind is required")))
        .and_then(|value| work_note_kind(&value))
    {
        Ok(kind) => kind,
        Err(error) => {
            return err_response(&derive_key("work_note_add", Some(&id), None, None), &error)
        }
    };
    let schema = match work_note_wire_string(&req.params, "schema")
        .and_then(|schema| work_note_schema(kind, schema))
    {
        Ok(schema) => schema,
        Err(error) => {
            return err_response(
                &derive_key("work_note_add", Some(&id), Some(kind.as_str()), None),
                &error,
            )
        }
    };
    let (body, body_json) = match canonical_work_note_body(&req.params) {
        Ok(body) => body,
        Err(error) => {
            let error = if matches!(kind, WorkNoteKind::Recommendation | WorkNoteKind::Approval) {
                Failure::invalid(format!(
                    "work note {:?} payload for schema {schema:?} violates field bodyJson: {}",
                    kind.as_str(),
                    error.message
                ))
            } else {
                error
            };
            return err_response(
                &derive_key("work_note_add", Some(&id), Some(kind.as_str()), None),
                &error,
            );
        }
    };
    if let Err(error) = validate_work_note_contract(kind, &schema, &body) {
        return err_response(
            &derive_key("work_note_add", Some(&id), Some(kind.as_str()), None),
            &error,
        );
    }
    let actor = match work_note_wire_string(&req.params, "actor") {
        Ok(actor) => actor.unwrap_or_else(|| "operator".to_owned()),
        Err(error) => {
            return err_response(
                &derive_key("work_note_add", Some(&id), Some(kind.as_str()), None),
                &error,
            )
        }
    };

    // Normalize semantic defaults and canonical body bytes before hashing:
    // omitted defaults and their explicit spellings are one idempotent
    // request, as are differently formatted renderings of the same JSON.
    req.params.insert("id".to_owned(), json!(id));
    req.params.insert("kind".to_owned(), json!(kind.as_str()));
    req.params.insert("schema".to_owned(), json!(schema));
    req.params.insert("actor".to_owned(), json!(actor));
    req.params.insert("bodyJson".to_owned(), json!(body_json));
    if crate::core::key_absent(req) {
        let hash = match request_sha256(req) {
            Ok(hash) => hash,
            Err(error) => {
                return err_response(
                    &derive_key("work_note_add", Some(&id), Some(kind.as_str()), None),
                    &Failure::invalid(format!("params cannot be canonicalized: {error}")),
                )
            }
        };
        default_key(req, format!("op:work_note_add:{id}:{hash}"));
    }
    let new = NewWorkNote {
        work_id: id,
        kind,
        schema,
        actor,
        body_json,
    };
    let key = req.idempotency_key.clone();
    match on_ledger(&ctx.ledger, {
        let request = req.clone();
        move |ledger| ledger.apply_work_note_operation("work_note_add", &request, new)
    })
    .await
    {
        Ok(response) => response,
        Err(error) => err_response(&key, &error),
    }
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
    let kind_text = match param_opt_str_strict(&req.params, "kind") {
        Ok(value) => value.unwrap_or("blocks"),
        Err(error) => {
            return err_response(
                &derive_key("work_link", Some(&from), Some(&to), None),
                &error,
            )
        }
    };
    let kind = match kind_text {
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
    // The edge kind is part of the derived key: work_deps rows are keyed by
    // (from, to, kind), so two keyless links of different kinds on one pair
    // are distinct effects.
    default_key(req, format!("op:work_link:{from}:{to}:{}", kind.as_str()));
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
    let actor = match actor_of(&req.params) {
        Ok(actor) => actor,
        Err(error) => return err_response(&derive_key(name, Some(&id), None, None), &error),
    };
    let verb = match run(id.clone(), actor, req.params.clone()) {
        Ok(verb) => verb,
        Err(error) => return err_response(&derive_key(name, Some(&id), None, None), &error),
    };
    // The derived key carries the item's PRE-STATE and the request digest:
    // coordination verbs never mint revisions, so the pre-state (status +
    // revision) plus the params fully determine the transition — a retry of
    // the same intent replays a correct-shaped response, while a genuinely
    // new pass over the same state (close -> reopen -> close with a new
    // reason) derives a fresh key and executes. A missing item keeps the
    // bare key and falls through to the verb's own refusal.
    let salted = {
        let id_owned = id.clone();
        on_ledger(&ctx.ledger, move |l| l.work_item(&id_owned))
            .await
            .ok()
            .flatten()
            .map(|item| {
                let digest = forged_types::request_sha256(req)
                    .map(|hex| hex[..12].to_owned())
                    .unwrap_or_else(|_| "malformed".to_owned());
                format!(
                    "op:{name}:{id}:{}r{}:{digest}",
                    item.status.as_str(),
                    item.revision
                )
            })
    };
    default_key(
        req,
        salted.unwrap_or_else(|| derive_key(name, Some(&id), None, None)),
    );
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
        let notes_count = {
            let id = id.clone();
            on_ledger(&ctx.ledger, move |l| l.work_note_count(&id)).await?
        };
        Ok(json!({
            "work": snapshot,
            "dependencies": deps,
            "notesCount": notes_count,
        }))
    })
    .await
}

/// `work_note_list` — bounded annotation bodies, oldest first.
pub async fn work_note_list(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let id = match param_str(&req.params, "id") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        _ => {
            return err_response(
                &derive_key("work_note_list", None, None, None),
                &Failure::invalid("id is required: pass the existing work item id"),
            )
        }
    };
    crate::core::read_only("work_note_list", req, || async {
        let kind = work_note_wire_string(&req.params, "kind")?
            .map(|value| work_note_kind(&value))
            .transpose()?;
        let limit = req
            .params
            .get("limit")
            .map(|value| {
                value.as_u64().ok_or_else(|| {
                    Failure::invalid("work note list limit must be an unsigned integer")
                })
            })
            .transpose()?
            .unwrap_or(WORK_NOTE_DEFAULT_LIMIT);
        if !(1..=WORK_NOTE_MAX_LIMIT).contains(&limit) {
            return Err(Failure::invalid(format!(
                "work note list limit must be between 1 and {WORK_NOTE_MAX_LIMIT}"
            )));
        }
        let page = {
            let id = id.clone();
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.list_work_notes(&id, kind, limit)
            })
            .await?
        };
        let mut filters = json!({"id": id, "limit": limit});
        if let Some(kind) = kind {
            filters["kind"] = json!(kind.as_str());
        }
        Ok(json!({
            "filters": filters,
            "totals": {"shown": page.notes.len(), "total": page.total},
            "notes": page.notes,
        }))
    })
    .await
}

/// `work_ready` — the ready frontier (read-only).
pub async fn work_ready(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    crate::core::read_only("work_ready", req, || async {
        let detail = match req.params.get("detail") {
            None => WorkReadyDetail::Summary,
            Some(Value::String(value)) if value == "full" => WorkReadyDetail::Full,
            Some(_) => {
                return Err(Failure::invalid(
                    "work_ready detail must be \"full\" when present",
                ))
            }
        };
        let limit = req
            .params
            .get("limit")
            .map(|value| {
                value
                    .as_u64()
                    .ok_or_else(|| Failure::invalid("work_ready limit must be an unsigned integer"))
            })
            .transpose()?
            .unwrap_or(WORK_READY_DEFAULT_LIMIT);
        if !(1..=WORK_READY_MAX_LIMIT).contains(&limit) {
            return Err(Failure::invalid(format!(
                "work_ready limit must be between 1 and {WORK_READY_MAX_LIMIT}"
            )));
        }
        let cursor = match req.params.get("cursor") {
            None => None,
            Some(Value::String(value)) => Some(decode_work_ready_cursor(value)?),
            Some(_) => return Err(invalid_work_ready_cursor()),
        };

        let repository = super::ops::repository_selector(req, "work_ready")?;

        let filters = WorkItemFilters {
            repository: repository.clone(),
            ..WorkItemFilters::default()
        };
        let page = on_ledger(&ctx.ledger, move |l| {
            l.ready_work_items_page_filtered(filters, cursor, limit as usize)
        })
        .await?;
        let next_cursor = if page.has_more {
            page.items
                .last()
                .map(encode_work_ready_cursor)
                .transpose()?
        } else {
            None
        };
        let total = page.total;
        let ready = match detail {
            WorkReadyDetail::Summary => page
                .items
                .into_iter()
                .map(|item| {
                    json!({
                        "id": item.work_id,
                        "title": item.spec.title,
                        "kind": item.kind,
                        "status": item.status,
                        "priority": item.priority,
                        "repository": item.metadata.get("repository"),
                        "revision": item.revision,
                    })
                })
                .collect::<Vec<_>>(),
            WorkReadyDetail::Full => page
                .items
                .into_iter()
                .map(|item| json!(item))
                .collect::<Vec<_>>(),
        };
        let mut applied_filters = json!({
            "detail": detail.as_str(),
            "limit": limit,
        });
        if let Some(repository) = repository {
            applied_filters["repo"] = json!(repository);
        }
        Ok(json!({
            "filters": applied_filters,
            "totals": {
                "shown": ready.len(),
                "total": total,
            },
            "ready": ready,
            "nextCursor": next_cursor,
        }))
    })
    .await
}
