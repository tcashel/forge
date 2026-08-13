//! `epic/v1`: an event-sourced scheduler over Beads readiness and slice/v1.

use std::collections::{BTreeMap, BTreeSet};
use std::future::Future;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::Path;

use forged_ledger::{EffectClass, Ledger, OperationState, SlotOutcome};
use forged_proto::{NextAction, ProtoEvent, Terminal};
use forged_types::{
    ExecutionPackageV1, OperationRequest, OperationResponse, RosterRevisionV1, Severity, Verdict,
};
use serde_json::{json, Map, Value};

use crate::adapters::ports::repo_slug;
use crate::core::{
    default_key, derive_key, err_response, fenced, ok_response, on_ledger, param_opt_str,
    param_str, read_only, Ctx, Failure,
};

const STARTED: &str = "forged.epic.started";
const INTEGRATION_READY: &str = "forged.epic.integration.ready";
const WAVE_STARTED: &str = "forged.epic.wave.started";
const CHILD_STARTED: &str = "forged.epic.child.started";
const CHILD_RESET: &str = "forged.epic.child.reset";
const CHILD_MERGED: &str = "forged.epic.child.merged";
const INPUT_REQUIRED: &str = "forged.epic.input.required";
const INPUT_RESOLVED: &str = "forged.epic.input.resolved";
const PAUSED: &str = "forged.epic.paused";
const RESUMED: &str = "forged.epic.resumed";
const EPIC_PR: &str = "forged.epic.pr";
const ROSTER_REVISED: &str = "forged.epic.roster.revised";
const PACKAGE_MIGRATED: &str = "forged.epic.execution-package.migrated";
const PACKAGE_MIGRATION: &str = "forged.epic.execution-package/1";

#[derive(Debug, Clone)]
struct FrozenChild {
    id: String,
    title: String,
    /// The child's frozen spec FILE, when it has one. `None` is the
    /// bead-sourced child: its run start reads the spec from the bead.
    spec_path: Option<String>,
    initially_closed: bool,
}

#[derive(Debug, Clone)]
struct EpicConfig {
    epic_id: String,
    title: String,
    repo: String,
    spec_path: String,
    base_ref: String,
    integration_branch: String,
    execution_package: ExecutionPackageV1,
    children: Vec<FrozenChild>,
}

#[derive(Debug, Clone)]
struct ChildState {
    run_id: String,
    wave: u32,
    generation: u32,
    merged: Option<Value>,
}

struct EpicView {
    config: EpicConfig,
    integration: Option<Value>,
    waves: Vec<Value>,
    children: BTreeMap<String, ChildState>,
    child_generations: BTreeMap<String, u32>,
    input: Option<Value>,
    paused: Option<Value>,
    pr: Option<Value>,
    roster_revisions: Vec<RosterRevisionV1>,
    cursor: i64,
}

fn payload(row: &forged_ledger::EventRow) -> Result<Value, Failure> {
    serde_json::from_str(&row.payload_json).map_err(|error| {
        Failure::internal(format!("malformed epic event {}: {error}", row.event_id))
    })
}

fn string(value: &Value, key: &str) -> Result<String, Failure> {
    value
        .get(key)
        .and_then(Value::as_str)
        .map(str::to_owned)
        .ok_or_else(|| Failure::internal(format!("epic event has no {key:?}")))
}

fn parse_config(value: &Value, migration: Option<&Value>) -> Result<EpicConfig, Failure> {
    let children = value
        .get("children")
        .and_then(Value::as_array)
        .ok_or_else(|| Failure::internal("epic start event has no children"))?
        .iter()
        .map(|child| {
            Ok(FrozenChild {
                id: string(child, "id")?,
                title: string(child, "title")?,
                spec_path: child
                    .get("specPath")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                initially_closed: child
                    .get("initiallyClosed")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
            })
        })
        .collect::<Result<Vec<_>, Failure>>()?;
    Ok(EpicConfig {
        epic_id: string(value, "epicId")?,
        title: string(value, "title")?,
        repo: string(value, "repo")?,
        spec_path: string(value, "specPath")?,
        base_ref: string(value, "baseRef")?,
        integration_branch: string(value, "integrationBranch")?,
        execution_package: serde_json::from_value(
            value
                .get("executionPackage")
                .or_else(|| migration.and_then(|event| event.get("executionPackage")))
                .cloned()
                .ok_or_else(|| {
                    Failure::internal("epic has no durable execution package or migration")
                })?,
        )
        .map_err(|error| {
            Failure::internal(format!("epic execution package is invalid: {error}"))
        })?,
        children,
    })
}

/// Append a frozen package for every epic created before start events carried
/// the package itself. An existing child definition is the strongest durable
/// source; an epic with no child yet freezes its named authoring definition at
/// this explicit upgrade boundary. Repeated starts append nothing.
pub(crate) async fn migrate_legacy_epics(ctx: &Ctx) -> Result<usize, Failure> {
    let migration_complete = on_ledger(&ctx.ledger, |ledger| {
        ledger.runtime_migration_completed(PACKAGE_MIGRATION)
    })
    .await?;
    if migration_complete {
        return Ok(0);
    }
    let started = on_ledger(&ctx.ledger, |ledger| ledger.list_events_by_kind(STARTED)).await?;
    let migrated = on_ledger(&ctx.ledger, |ledger| {
        ledger.list_events_by_kind(PACKAGE_MIGRATED)
    })
    .await?;
    let completed = migrated
        .iter()
        .filter_map(|row| row.run_id.clone())
        .collect::<BTreeSet<_>>();
    let candidates = started
        .into_iter()
        .map(|row| {
            let event_id = row.event_id;
            let epic_id = row.run_id.clone().ok_or_else(|| {
                Failure::internal(format!("epic start event {event_id} has no epic id"))
            })?;
            if completed.contains(&epic_id) {
                return Ok(None);
            }
            let event = payload(&row)?;
            Ok((event.get("executionPackage").is_none()).then_some((epic_id, event)))
        })
        .collect::<Result<Vec<_>, Failure>>()?
        .into_iter()
        .flatten()
        .collect::<Vec<_>>();
    let candidate_ids = candidates
        .iter()
        .map(|(epic_id, _)| epic_id.clone())
        .collect::<BTreeSet<_>>();
    let child_started = if candidate_ids.is_empty() {
        Vec::new()
    } else {
        on_ledger(&ctx.ledger, |ledger| {
            ledger.list_events_by_kind(CHILD_STARTED)
        })
        .await?
    };
    let first_child = child_started.into_iter().try_fold(
        BTreeMap::<String, String>::new(),
        |mut index, row| {
            let Some(epic_id) = row
                .run_id
                .clone()
                .filter(|epic_id| candidate_ids.contains(epic_id))
            else {
                return Ok::<_, Failure>(index);
            };
            let event = payload(&row)?;
            let run_id = string(&event, "runId")?;
            index.entry(epic_id).or_insert(run_id);
            Ok(index)
        },
    )?;
    let mut migration_count = 0;
    for (epic_id, event) in candidates {
        let profile = string(&event, "profile")?;
        let roster = string(&event, "roster")?;
        let legacy_package_sha256 = string(&event, "packageSha256")?;
        let child_run_id = first_child.get(&epic_id).cloned();
        let child_definition = match child_run_id.clone() {
            Some(run_id) => {
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.get_run_definition(&run_id)
                })
                .await?
            }
            None => None,
        };
        let child_package = child_definition
            .map(|definition| {
                serde_json::from_str::<ExecutionPackageV1>(&definition.package_json).map_err(
                    |error| {
                        Failure::internal(format!(
                            "legacy epic {epic_id:?} child package is invalid: {error}"
                        ))
                    },
                )
            })
            .transpose()?
            .filter(|package| {
                package.profile_ref.name == profile && package.roster_ref.name == roster
            });
        let (compiled, source, source_run_id) = match child_package {
            Some(package) => (
                crate::config::compile_frozen_package(package).map_err(|errors| {
                    Failure::internal(format!(
                        "legacy epic {epic_id:?} child definition is invalid: {}",
                        serde_json::to_string(&errors).unwrap_or_default()
                    ))
                })?,
                "child-definition",
                child_run_id,
            ),
            None => (
                ctx.config
                    .compile_definition(Some(&profile), Some(&roster))
                    .map_err(|errors| {
                        Failure::invalid(format!(
                            "cannot freeze legacy epic {epic_id:?}; restore its profile and roster: {}",
                            serde_json::to_string(&errors).unwrap_or_default()
                        ))
                    })?,
                "upgrade-config",
                None,
            ),
        };
        let migration = json!({
            "schema": "forged.epic.execution-package-migration/1",
            "epicId": epic_id,
            "legacyPackageSha256": legacy_package_sha256,
            "packageSha256": compiled.package_sha256,
            "source": source,
            "sourceRunId": source_run_id,
            "executionPackage": compiled.package,
        });
        let epic_for_store = epic_id.clone();
        let inserted = on_ledger(&ctx.ledger, move |ledger| {
            ledger.append_event_kind_once(&epic_for_store, PACKAGE_MIGRATED, migration)
        })
        .await?;
        migration_count += usize::from(inserted);
    }
    on_ledger(&ctx.ledger, |ledger| {
        ledger.mark_runtime_migration_completed(PACKAGE_MIGRATION)
    })
    .await?;
    Ok(migration_count)
}

async fn epic_events(ctx: &Ctx, epic: &str) -> Result<Vec<forged_ledger::EventRow>, Failure> {
    let epic = epic.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_events(Some(&epic), 0, 65_536)
    })
    .await
}

async fn project(ctx: &Ctx, epic: &str) -> Result<EpicView, Failure> {
    let events = epic_events(ctx, epic).await?;
    let started = events
        .iter()
        .find(|row| row.kind == STARTED)
        .ok_or_else(|| Failure::invalid(format!("epic {epic:?} has not been started")))?;
    let migration = events
        .iter()
        .find(|row| row.kind == PACKAGE_MIGRATED)
        .map(payload)
        .transpose()?;
    let config = parse_config(&payload(started)?, migration.as_ref())?;
    let mut view = EpicView {
        config,
        integration: None,
        waves: Vec::new(),
        children: BTreeMap::new(),
        child_generations: BTreeMap::new(),
        input: None,
        paused: None,
        pr: None,
        roster_revisions: Vec::new(),
        cursor: events.last().map(|row| row.event_id).unwrap_or(0),
    };
    for row in events {
        match row.kind.as_str() {
            INTEGRATION_READY => view.integration = Some(payload(&row)?),
            WAVE_STARTED => view.waves.push(payload(&row)?),
            CHILD_STARTED => {
                let event = payload(&row)?;
                let child = string(&event, "childId")?;
                let generation = event
                    .get("generation")
                    .and_then(Value::as_u64)
                    .and_then(|value| u32::try_from(value).ok())
                    .unwrap_or_else(|| {
                        view.child_generations
                            .get(&child)
                            .copied()
                            .unwrap_or(0)
                            .saturating_add(1)
                    });
                view.child_generations.insert(child.clone(), generation);
                view.children.insert(
                    child,
                    ChildState {
                        run_id: string(&event, "runId")?,
                        wave: event.get("wave").and_then(Value::as_u64).unwrap_or(0) as u32,
                        generation,
                        merged: None,
                    },
                );
            }
            CHILD_RESET => {
                let event = payload(&row)?;
                view.children.remove(&string(&event, "childId")?);
            }
            CHILD_MERGED => {
                let event = payload(&row)?;
                let child = string(&event, "childId")?;
                if let Some(state) = view.children.get_mut(&child) {
                    state.merged = Some(event);
                }
            }
            INPUT_REQUIRED => view.input = Some(payload(&row)?),
            INPUT_RESOLVED => view.input = None,
            PAUSED => view.paused = Some(payload(&row)?),
            RESUMED => view.paused = None,
            EPIC_PR => view.pr = Some(payload(&row)?),
            ROSTER_REVISED => {
                let revision = serde_json::from_value(payload(&row)?).map_err(|error| {
                    Failure::internal(format!("epic roster revision is invalid: {error}"))
                })?;
                view.roster_revisions.push(revision);
            }
            _ => {}
        }
    }
    Ok(view)
}

pub(super) async fn epic_repo(ctx: &Ctx, epic: &str) -> Result<String, Failure> {
    Ok(project(ctx, epic).await?.config.repo)
}

pub(super) async fn epic_host_policy(
    ctx: &Ctx,
    epic: &str,
) -> Result<(forged_types::HostPolicyV1, Option<std::path::PathBuf>), Failure> {
    let view = project(ctx, epic).await?;
    let policy = &view.config.execution_package.policy;
    Ok((policy.host_policy, policy.herdr_socket.clone()))
}

pub(super) async fn epic_submission_stop(ctx: &Ctx, epic: &str) -> Result<Option<Value>, Failure> {
    let view = project(ctx, epic).await?;
    Ok(if let Some(pr) = view.pr {
        Some(json!({"finalPr": pr}))
    } else if let Some(paused) = view.paused {
        Some(json!({"paused": paused}))
    } else {
        view.input.map(|input| json!({"inputRequired": input}))
    })
}

async fn append(ctx: &Ctx, epic: &str, kind: &str, value: Value) -> Result<(), Failure> {
    let epic = epic.to_owned();
    let kind = kind.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event_once(&epic, &kind, value)?;
        Ok(())
    })
    .await
}

fn spec_pointer(description: &str) -> Option<String> {
    description.lines().find_map(|line| {
        line.trim()
            .strip_prefix("spec:")
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_owned)
    })
}

fn response(resp: OperationResponse) -> Result<Value, Failure> {
    if resp.ok {
        return Ok(resp.result.unwrap_or(Value::Null));
    }
    let error = resp.error.unwrap_or(forged_types::OpError {
        code: forged_types::ErrorCode::Internal,
        message: "epic operation failed".to_owned(),
        recoverable: false,
        detail: None,
    });
    Err(Failure {
        code: error.code,
        message: error.message,
        recoverable: error.recoverable,
    })
}

/// An epic controller is singular. Its slot holder is a real PID; a later
/// process may reap only a confirmed-dead holder before resuming.
struct DriverGuard {
    ledger: Ledger,
    slot: String,
    holder: String,
}

impl Drop for DriverGuard {
    fn drop(&mut self) {
        let _ = self.ledger.release_merge_slot(&self.slot, &self.holder);
    }
}

fn pid_alive(pid: i32) -> bool {
    matches!(
        nix::sys::signal::kill(nix::unistd::Pid::from_raw(pid), None),
        Ok(()) | Err(nix::errno::Errno::EPERM)
    )
}

fn lstart_hash(value: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    value.hash(&mut hasher);
    hasher.finish()
}

fn holder_identity(holder: &str) -> Option<(i32, Option<u64>)> {
    let mut fields = holder.strip_prefix("forged-epic:")?.split(':');
    let pid = fields.next()?.parse().ok()?;
    let identity = fields.next().and_then(|value| value.parse().ok());
    Some((pid, identity))
}

async fn acquire_driver(ctx: &Ctx, epic: &str) -> Result<DriverGuard, Failure> {
    let slot = format!("epic:{epic}");
    let pid = std::process::id() as i32;
    let identity = crate::adapters::ports::lstart_of(pid)
        .await
        .map(|value| lstart_hash(&value));
    let holder = format!(
        "forged-epic:{}:{}:{}",
        pid,
        identity
            .map(|value| value.to_string())
            .unwrap_or_else(|| "unknown".to_owned()),
        uuid::Uuid::new_v4()
    );
    let first = {
        let slot = slot.clone();
        let holder = holder.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.acquire_merge_slot(&slot, &holder)
        })
        .await?
    };
    match first {
        SlotOutcome::Acquired(_) => {}
        SlotOutcome::Held(row) => match holder_identity(&row.holder) {
            Some((held_pid, held_identity))
                if !pid_alive(held_pid)
                    || matches!(
                        (held_identity, crate::adapters::ports::lstart_of(held_pid).await),
                        (Some(recorded), Some(current)) if recorded != lstart_hash(&current)
                    ) =>
            {
                let slot_for_release = slot.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.force_release_merge_slot(&slot_for_release)
                })
                .await?;
                let slot_for_acquire = slot.clone();
                let holder_for_acquire = holder.clone();
                let acquired = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.acquire_merge_slot(&slot_for_acquire, &holder_for_acquire)
                })
                .await?;
                if !matches!(acquired, SlotOutcome::Acquired(_)) {
                    return Err(Failure::invalid(format!(
                        "epic {epic} controller changed while reclaiming"
                    )));
                }
            }
            _ => {
                return Err(Failure::refused(
                    forged_types::ErrorCode::BeadsContention,
                    format!("epic {epic} is already driven by {}", row.holder),
                ))
            }
        },
    }
    Ok(DriverGuard {
        ledger: ctx.ledger.clone(),
        slot,
        holder,
    })
}

/// With the singular controller lock held, an in-progress SafeRetry action
/// belongs to a dead predecessor (or this process after a caught error). All
/// epic effects below are probe-before-mutate, so releasing permits recovery.
async fn prepare_retry(ctx: &Ctx, name: &str, key: &str) -> Result<(), Failure> {
    let name_owned = name.to_owned();
    let key_owned = key.to_owned();
    let row = on_ledger(&ctx.ledger, move |ledger| {
        ledger.find_operation(&name_owned, &key_owned)
    })
    .await?;
    if let Some(row) = row.filter(|row| row.state == OperationState::InProgress) {
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.release_operation(&row.operation_id)
        })
        .await?;
    }
    Ok(())
}

async fn safe_effect<F, Fut>(
    ctx: &Ctx,
    name: &str,
    key: String,
    epic: &str,
    params: Value,
    effect: F,
) -> Result<Value, Failure>
where
    F: FnOnce(String) -> Fut,
    Fut: Future<Output = Result<Value, Failure>>,
{
    prepare_retry(ctx, name, &key).await?;
    let req = OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(epic.to_owned()),
        params: match params {
            Value::Object(map) => map,
            _ => Map::new(),
        },
    };
    response(fenced(ctx, name, EffectClass::SafeRetry, &req, None, effect).await)
}

/// Freeze the Beads inventory and child execution defaults.
pub async fn epic_start(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let epic = match param_str(&req.params, "epic") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key("epic_start", None, None, None), &error),
    };
    default_key(req, derive_key("epic_start", Some(&epic), None, None));
    if req.run_id.is_none() {
        req.run_id = Some(epic.clone());
    }
    let _guard = match acquire_driver(ctx, &epic).await {
        Ok(guard) => guard,
        Err(error) => return err_response(&req.idempotency_key, &error),
    };
    let params = req.params.clone();
    let key = req.idempotency_key.clone();
    let result = safe_effect(
        ctx,
        "epic_start",
        key.clone(),
        &epic,
        Value::Object(params.clone()),
        {
            let epic = epic.clone();
            move |_operation| async move {
                let existing_events = epic_events(ctx, &epic).await?;
                if existing_events.iter().any(|row| row.kind == STARTED) {
                    return status_json(ctx, project(ctx, &epic).await?).await;
                }
                let repo = param_str(&params, "repo")?.to_owned();
                let spec = param_str(&params, "spec")?.to_owned();
                if !Path::new(&repo).is_absolute() || !Path::new(&spec).is_absolute() {
                    return Err(Failure::invalid(
                        "epic --repo and --spec must be absolute paths",
                    ));
                }
                if !Path::new(&spec).exists() {
                    return Err(Failure::invalid(format!(
                        "epic spec {spec:?} does not exist"
                    )));
                }
                let compiled = ctx
                    .config
                    .compile_definition(
                        param_opt_str(&params, "profile"),
                        param_opt_str(&params, "roster"),
                    )
                    .map_err(|errors| {
                        Failure::invalid(format!(
                            "epic child definition is invalid: {}",
                            serde_json::to_string(&errors).unwrap_or_default()
                        ))
                    })?;
                let issue = forged_beads::show_issue(&ctx.config.bd_config(), &epic).await?;
                let inventory = forged_beads::epic_children(&ctx.config.bd_config(), &epic).await?;
                if inventory.is_empty() {
                    return Err(Failure::invalid(format!(
                        "epic {epic} has no Beads children"
                    )));
                }
                let mut children = Vec::new();
                for child in inventory {
                    // The bead's own fields win, but only when they are a
                    // WHOLE spec. A child missing either required section
                    // falls back to its `spec:` pointer — the route every
                    // epic frozen before this used — rather than freezing
                    // bead-sourced around a fragment.
                    let child_spec = if super::spec::carries_spec(&child) {
                        None
                    } else {
                        let missing = super::spec::missing_spec_fields(&child).join(", ");
                        let pointer = spec_pointer(&child.description).ok_or_else(|| {
                            Failure::invalid(format!(
                                "epic child {} has no spec: {missing} empty and it carries no \
                                 spec: pointer",
                                child.id
                            ))
                        })?;
                        if !Path::new(&pointer).is_absolute() || !Path::new(&pointer).exists() {
                            return Err(Failure::invalid(format!(
                                "epic child {} spec {:?} is not an existing absolute path",
                                child.id, pointer
                            )));
                        }
                        Some(pointer)
                    };
                    children.push(json!({
                        "id": child.id,
                        "title": child.title,
                        "specPath": child_spec,
                        "initiallyClosed": child.status == "closed",
                    }));
                }
                let base_ref = match param_opt_str(&params, "baseRef") {
                    Some(value) => value.to_owned(),
                    None => super::ops::default_branch_of(&repo).await,
                };
                let integration_branch = format!("forged/epic-{epic}");
                let event = json!({
                    "schema": "forged.epic/1",
                    "epicId": epic,
                    "title": issue.title,
                    "repo": repo,
                    "specPath": spec,
                    "baseRef": base_ref,
                    "integrationBranch": integration_branch,
                    "profile": compiled.package.profile_ref.name,
                    "roster": compiled.package.roster_ref.name,
                    "packageSha256": compiled.package_sha256,
                    "executionPackage": compiled.package,
                    "children": children,
                });
                append(ctx, &epic, STARTED, event.clone()).await?;
                Ok(event)
            }
        },
    )
    .await;
    match result {
        Ok(value) => ok_response(&key, false, value),
        Err(error) => err_response(&key, &error),
    }
}

fn child_json(child: &FrozenChild, state: Option<&ChildState>, bead_status: &str) -> Value {
    json!({
        "id": child.id,
        "title": child.title,
        "specPath": child.spec_path,
        "beadsStatus": bead_status,
        "runId": state.map(|value| value.run_id.as_str()),
        "wave": state.map(|value| value.wave),
        "generation": state.map(|value| value.generation),
        "merged": state.and_then(|value| value.merged.as_ref()),
    })
}

fn active_execution_package(view: &EpicView) -> ExecutionPackageV1 {
    let mut package = view.config.execution_package.clone();
    if let Some(revision) = view.roster_revisions.last() {
        package.roster_ref = revision.roster_ref.clone();
        package.roster_sha256 = revision.roster_sha256.clone();
        package.roster = revision.roster.clone();
    }
    package
}

fn active_compiled_definition(
    view: &EpicView,
) -> Result<crate::config::CompiledDefinition, Failure> {
    crate::config::compile_frozen_package(active_execution_package(view)).map_err(|errors| {
        Failure::internal(format!(
            "frozen epic definition is invalid: {}",
            serde_json::to_string(&errors).unwrap_or_default()
        ))
    })
}

async fn status_json(ctx: &Ctx, view: EpicView) -> Result<Value, Failure> {
    let active_definition = active_compiled_definition(&view)?;
    let controller = super::handoff::controller_status(ctx, &view.config.epic_id).await?;
    let live = forged_beads::epic_children(&ctx.config.bd_config(), &view.config.epic_id).await?;
    let statuses: BTreeMap<_, _> = live
        .into_iter()
        .map(|issue| (issue.id, issue.status))
        .collect();
    let children = view
        .config
        .children
        .iter()
        .map(|child| {
            child_json(
                child,
                view.children.get(&child.id),
                statuses
                    .get(&child.id)
                    .map(String::as_str)
                    .unwrap_or("unknown"),
            )
        })
        .collect::<Vec<_>>();
    Ok(json!({
        "schema": "forged.epic.status/1",
        "epicId": view.config.epic_id,
        "title": view.config.title,
        "repo": view.config.repo,
        "specPath": view.config.spec_path,
        "baseRef": view.config.base_ref,
        "integrationBranch": view.config.integration_branch,
        "profile": view.config.execution_package.profile_ref.name,
        "roster": view.roster_revisions.last()
            .map(|revision| revision.roster_ref.name.as_str())
            .unwrap_or(&view.config.execution_package.roster_ref.name),
        "packageSha256": active_definition.package_sha256,
        "rosterRevisions": view.roster_revisions,
        "cursor": view.cursor,
        "integration": view.integration,
        "waves": view.waves,
        "children": children,
        "inputRequired": view.input,
        "paused": view.paused,
        "finalPr": view.pr,
        "controller": controller,
    }))
}

/// Read-only epic projection.
pub async fn epic_status(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("epic_status", req, || async {
        let epic = param_str(&req.params, "epic")?;
        status_json(ctx, project(ctx, epic).await?).await
    })
    .await
}

/// Append one explicit roster revision to an epic. The epic controller lock
/// makes the active-child set stable while every unmerged child receives the
/// same resolved snapshot; future children inherit it from the epic stream.
pub async fn epic_revise_roster(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let epic = match param_str(&req.params, "epic") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(&derive_key("epic_revise_roster", None, None, None), &error)
        }
    };
    let roster_name = match param_str(&req.params, "roster") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(
                &derive_key("epic_revise_roster", Some(&epic), None, None),
                &error,
            )
        }
    };
    let reason = match param_str(&req.params, "reason") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        Ok(_) => {
            return err_response(
                &derive_key("epic_revise_roster", Some(&epic), Some(&roster_name), None),
                &Failure::invalid("roster revision requires a non-empty reason"),
            )
        }
        Err(error) => {
            return err_response(
                &derive_key("epic_revise_roster", Some(&epic), Some(&roster_name), None),
                &error,
            )
        }
    };
    let _guard = match acquire_driver(ctx, &epic).await {
        Ok(guard) => guard,
        Err(error) => {
            return err_response(
                &derive_key("epic_revise_roster", Some(&epic), Some(&roster_name), None),
                &error,
            )
        }
    };
    let view = match project(ctx, &epic).await {
        Ok(view) => view,
        Err(error) => {
            return err_response(
                &derive_key("epic_revise_roster", Some(&epic), Some(&roster_name), None),
                &error,
            )
        }
    };
    let (roster, roster_sha256) = match ctx
        .config
        .compile_roster_revision(&view.config.execution_package, &roster_name)
    {
        Ok(value) => value,
        Err(errors) => {
            return err_response(
                &derive_key("epic_revise_roster", Some(&epic), Some(&roster_name), None),
                &Failure::invalid(format!(
                    "roster revision is invalid: {}",
                    serde_json::to_string(&errors).unwrap_or_default()
                )),
            )
        }
    };
    let matching_latest = view.roster_revisions.last().is_some_and(|revision| {
        revision.roster_sha256 == roster_sha256 && revision.reason == reason
    });
    let revision = if matching_latest {
        view.roster_revisions
            .last()
            .map(|value| value.revision)
            .unwrap_or(1)
    } else {
        view.roster_revisions
            .last()
            .map(|value| value.revision)
            .unwrap_or(1)
            .saturating_add(1)
    };
    default_key(
        req,
        derive_key(
            "epic_revise_roster",
            Some(&epic),
            Some(&roster_name),
            Some(i64::from(revision)),
        ),
    );
    req.params.insert(
        "rosterSha256".to_owned(),
        Value::String(roster_sha256.clone()),
    );
    if req.run_id.is_none() {
        req.run_id = Some(epic.clone());
    }
    let event = RosterRevisionV1 {
        revision,
        roster_ref: roster.roster_ref.clone(),
        roster_sha256: roster_sha256.clone(),
        roster: roster.clone(),
        reason: reason.clone(),
    };
    let event_value = match serde_json::to_value(&event) {
        Ok(value) => value,
        Err(error) => {
            return err_response(
                &req.idempotency_key,
                &Failure::internal(format!("serializing epic roster revision: {error}")),
            )
        }
    };
    let active_runs = view
        .children
        .values()
        .filter(|state| state.merged.is_none())
        .map(|state| state.run_id.clone())
        .collect::<Vec<_>>();
    let key = req.idempotency_key.clone();
    let result = safe_effect(
        ctx,
        "epic_revise_roster",
        key.clone(),
        &epic,
        Value::Object(req.params.clone()),
        {
            let epic = epic.clone();
            move |_operation| async move {
                let epic_for_store = epic.clone();
                let operation_prefix = format!("epic-roster:{epic}:{revision}");
                let child_reason = format!("epic {epic}: {reason}");
                let value_for_store = event_value.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_roster_revisions_with_event(forged_ledger::RosterRevisionBatch {
                        epic_id: epic_for_store,
                        event_kind: ROSTER_REVISED.to_owned(),
                        event_payload: value_for_store,
                        run_ids: active_runs,
                        roster,
                        roster_sha256,
                        reason: child_reason,
                        operation_prefix,
                    })
                })
                .await?;
                Ok(event_value)
            }
        },
    )
    .await;
    match result {
        Ok(value) => ok_response(&key, false, value),
        Err(error) => err_response(&key, &error),
    }
}

async fn require_input(
    ctx: &Ctx,
    epic: &str,
    code: &str,
    child: Option<&str>,
    detail: impl Into<String>,
) -> Result<Value, Failure> {
    let event = json!({
        "code": code,
        "childId": child,
        "detail": detail.into(),
    });
    append(ctx, epic, INPUT_REQUIRED, event.clone()).await?;
    Ok(event)
}

fn clean_slice(view: &forged_proto::RunView) -> (bool, Value) {
    let terminal = forged_proto::advance(view);
    let approved = matches!(
        terminal,
        NextAction::Stop(Terminal::Done {
            final_verdict: Some(Verdict::Approve)
        })
    );
    let gate_passed = view
        .proto_events
        .iter()
        .rev()
        .find_map(|event| match event {
            ProtoEvent::Gate { passed, .. } => Some(*passed),
            _ => None,
        })
        == Some(true);
    let findings = super::drive::latest_review_findings(view);
    let severe = findings
        .iter()
        .any(|finding| matches!(finding.severity, Severity::Blocker | Severity::High));
    (
        approved && gate_passed && !severe,
        json!({
            "approved": approved,
            "gatePassed": gate_passed,
            "blockerOrHigh": severe,
            "findings": findings,
        }),
    )
}

enum Step {
    Progress(Value),
    Stop(Value),
}

async fn ensure_integration(ctx: &Ctx, config: &EpicConfig) -> Result<Value, Failure> {
    let key = derive_key("epic_setup", Some(&config.epic_id), None, None);
    let repo = config.repo.clone();
    let branch = config.integration_branch.clone();
    let base = config.base_ref.clone();
    let epic = config.epic_id.clone();
    let event_epic = epic.clone();
    safe_effect(
        ctx,
        "epic_setup",
        key,
        &epic,
        json!({"repo": repo, "integrationBranch": branch, "baseRef": base}),
        move |_operation| async move {
            let sha =
                forged_git::ensure_integration_branch(Path::new(&repo), &branch, &base).await?;
            let event = json!({"branch": branch, "baseRef": base, "cutSha": sha});
            append(ctx, &event_epic, INTEGRATION_READY, event.clone()).await?;
            Ok(event)
        },
    )
    .await
}

async fn start_child(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    wave: u32,
    generation: u32,
    compiled: crate::config::CompiledDefinition,
) -> Result<Value, Failure> {
    let run_id = if generation == 1 {
        child.id.clone()
    } else {
        format!("{}-g{generation}", child.id)
    };
    let mut request = OperationRequest {
        schema_version: 1,
        idempotency_key: derive_key("run_start", Some(&run_id), None, None),
        run_id: Some(run_id.clone()),
        params: match json!({
            "bead": child.id,
            "run": run_id,
            "repo": config.repo,
            "spec": child.spec_path,
            "baseRef": config.integration_branch,
        }) {
            Value::Object(map) => map,
            _ => Map::new(),
        },
    };
    let started =
        response(super::ops::run_start_with_definition(ctx, &mut request, compiled).await)?;
    let event = json!({
        "childId": child.id,
        "runId": run_id,
        "wave": wave,
        "generation": generation,
        "branch": started.get("branch"),
        "baseRef": config.integration_branch,
    });
    append(ctx, &config.epic_id, CHILD_STARTED, event.clone()).await?;
    Ok(event)
}

async fn merge_child(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    run: &forged_proto::RunView,
    evidence: Value,
) -> Result<Step, Failure> {
    let Some(pr_number) = super::drive::pr_number_of(run) else {
        let input = require_input(
            ctx,
            &config.epic_id,
            "missing-child-pr",
            Some(&child.id),
            "clean terminal slice has no durable draft PR identity",
        )
        .await?;
        return Ok(Step::Stop(input));
    };
    let slug = repo_slug(Path::new(&config.repo))
        .await
        .map_err(|error| Failure::internal(error.to_string()))?;
    let ready_key = derive_key(
        "epic_child_ready",
        Some(&config.epic_id),
        Some(&child.id),
        Some(pr_number as i64),
    );
    let gh = forged_git::GhClient::new();
    let ready = safe_effect(
        ctx,
        "epic_child_ready",
        ready_key,
        &config.epic_id,
        json!({"child": child.id, "pr": pr_number, "base": config.integration_branch}),
        {
            let slug = slug.clone();
            let base = config.integration_branch.clone();
            move |_operation| async move {
                let pr = gh.mark_pr_ready(&slug, pr_number, &base).await?;
                Ok(json!({"number": pr.number, "url": pr.url, "isDraft": pr.is_draft}))
            }
        },
    )
    .await?;
    let merge_key = derive_key(
        "epic_child_merge",
        Some(&config.epic_id),
        Some(&child.id),
        Some(pr_number as i64),
    );
    let gh = forged_git::GhClient::new();
    let merged = safe_effect(
        ctx,
        "epic_child_merge",
        merge_key,
        &config.epic_id,
        json!({"child": child.id, "pr": pr_number, "base": config.integration_branch}),
        {
            let slug = slug.clone();
            let base = config.integration_branch.clone();
            move |_operation| async move {
                let pr = forged_git::merge_pr_idempotent(&gh, &slug, pr_number, &base).await?;
                crate::failpoint::hit("epic.child.merge.after");
                Ok(json!({"number": pr.number, "url": pr.url, "base": pr.base_ref_name}))
            }
        },
    )
    .await?;
    let close_key = derive_key(
        "epic_child_close",
        Some(&config.epic_id),
        Some(&child.id),
        None,
    );
    let child_id = child.id.clone();
    let epic_id = config.epic_id.clone();
    safe_effect(
        ctx,
        "epic_child_close",
        close_key,
        &config.epic_id,
        json!({"child": child.id, "pr": pr_number}),
        move |_operation| async move {
            let issue = forged_beads::close_issue(
                &ctx.config.bd_config(),
                &child_id,
                &format!("forged:{epic_id}"),
                &format!("clean slice PR #{pr_number} merged into integration branch"),
            )
            .await?;
            Ok(json!({"id": issue.id, "status": issue.status}))
        },
    )
    .await?;
    let event = json!({
        "childId": child.id,
        "runId": run.run.run_id,
        "pr": pr_number,
        "ready": ready,
        "merge": merged,
        "evidence": evidence,
    });
    append(ctx, &config.epic_id, CHILD_MERGED, event.clone()).await?;
    Ok(Step::Progress(event))
}

async fn final_pr(ctx: &Ctx, view: &EpicView) -> Result<Step, Failure> {
    let slug = repo_slug(Path::new(&view.config.repo))
        .await
        .map_err(|error| Failure::internal(error.to_string()))?;
    let key = derive_key("epic_pr", Some(&view.config.epic_id), None, None);
    let config = view.config.clone();
    let operation_epic = config.epic_id.clone();
    let journal = view
        .children
        .iter()
        .filter_map(|(id, state)| {
            state
                .merged
                .as_ref()
                .map(|merged| format!("- {id}: {merged}"))
        })
        .collect::<Vec<_>>()
        .join("\n");
    let gh = forged_git::GhClient::new();
    let value = safe_effect(
        ctx,
        "epic_pr",
        key,
        &operation_epic,
        json!({"head": config.integration_branch, "base": config.base_ref}),
        move |_operation| async move {
            let body = format!(
                "Epic {} executed by forged.\n\n## Wave journal\n{}",
                config.epic_id,
                if journal.is_empty() {
                    "(no newly merged children)"
                } else {
                    &journal
                }
            );
            let pr = gh
                .create_draft_pr(
                    &slug,
                    &config.integration_branch,
                    &config.base_ref,
                    &config.title,
                    &body,
                )
                .await?;
            let event = json!({
                "number": pr.number,
                "url": pr.url,
                "isDraft": pr.is_draft,
                "head": pr.head_ref_name,
                "base": pr.base_ref_name,
            });
            append(ctx, &config.epic_id, EPIC_PR, event.clone()).await?;
            Ok(event)
        },
    )
    .await?;
    Ok(Step::Stop(json!({"finalPr": value})))
}

async fn advance_once(ctx: &Ctx, epic: &str, drive_child: bool) -> Result<Step, Failure> {
    let view = project(ctx, epic).await?;
    if let Some(pr) = view.pr {
        return Ok(Step::Stop(json!({"finalPr": pr})));
    }
    if let Some(paused) = view.paused {
        return Ok(Step::Stop(json!({"paused": paused})));
    }
    if let Some(input) = view.input {
        return Ok(Step::Stop(json!({"inputRequired": input})));
    }
    if view.integration.is_none() {
        return Ok(Step::Progress(ensure_integration(ctx, &view.config).await?));
    }

    // Resume or settle an already-bound child before opening more work.
    for child in &view.config.children {
        let Some(state) = view.children.get(&child.id) else {
            continue;
        };
        if state.merged.is_some() {
            continue;
        }
        let run = super::drive::project(ctx, &state.run_id).await?;
        if matches!(forged_proto::advance(&run), NextAction::Stop(_)) {
            let (clean, evidence) = clean_slice(&run);
            if !clean {
                let input = require_input(
                    ctx,
                    epic,
                    "child-not-clean",
                    Some(&child.id),
                    format!("slice requires adjudication: {evidence}"),
                )
                .await?;
                return Ok(Step::Stop(input));
            }
            return merge_child(ctx, &view.config, child, &run, evidence).await;
        }
        let request = OperationRequest {
            schema_version: 1,
            idempotency_key: String::new(),
            run_id: Some(state.run_id.clone()),
            params: match json!({"run": state.run_id}) {
                Value::Object(map) => map,
                _ => Map::new(),
            },
        };
        let result = if drive_child {
            super::drive::run_drive(ctx, &request).await
        } else {
            super::drive::run_advance(ctx, &request).await
        };
        if !result.ok {
            let detail = result
                .error
                .as_ref()
                .map(|error| error.message.clone())
                .unwrap_or_else(|| "child run failed".to_owned());
            let input =
                require_input(ctx, epic, "child-run-failed", Some(&child.id), detail).await?;
            return Ok(Step::Stop(input));
        }
        return Ok(Step::Progress(
            json!({"child": child.id, "run": result.result}),
        ));
    }

    let live = forged_beads::epic_children(&ctx.config.bd_config(), epic).await?;
    let statuses: BTreeMap<_, _> = live
        .into_iter()
        .map(|issue| (issue.id, issue.status))
        .collect();
    let all_accounted = view.config.children.iter().all(|child| {
        child.initially_closed
            || view
                .children
                .get(&child.id)
                .is_some_and(|state| state.merged.is_some())
    });
    if all_accounted {
        return final_pr(ctx, &view).await;
    }

    let ready: BTreeSet<String> = forged_beads::ready_issues(&ctx.config.bd_config())
        .await?
        .into_iter()
        .map(|issue| issue.id)
        .collect();
    let pending_wave = view.waves.last().and_then(|wave| {
        let number = wave.get("wave")?.as_u64()? as u32;
        let children: BTreeSet<&str> = wave
            .get("children")?
            .as_array()?
            .iter()
            .filter_map(Value::as_str)
            .collect();
        let pending = view
            .config
            .children
            .iter()
            .filter(|child| children.contains(child.id.as_str()))
            .filter(|child| !view.children.contains_key(&child.id))
            .filter(|child| ready.contains(&child.id))
            .collect::<Vec<_>>();
        (!pending.is_empty()).then_some((number, pending))
    });
    let mut frontier: Vec<&FrozenChild> = pending_wave
        .as_ref()
        .map(|(_, children)| children.clone())
        .unwrap_or_else(|| {
            view.config
                .children
                .iter()
                .filter(|child| !child.initially_closed)
                .filter(|child| !view.children.contains_key(&child.id))
                .filter(|child| {
                    statuses
                        .get(&child.id)
                        .is_none_or(|status| status != "closed")
                })
                .filter(|child| ready.contains(&child.id))
                .collect()
        });
    frontier.sort_by(|a, b| a.id.cmp(&b.id));
    if frontier.is_empty() {
        let unresolved = view
            .config
            .children
            .iter()
            .filter(|child| !child.initially_closed && !view.children.contains_key(&child.id))
            .map(|child| child.id.clone())
            .collect::<Vec<_>>();
        let input = require_input(
            ctx,
            epic,
            "no-ready-children",
            None,
            format!("Beads frontier contains none of the unresolved children: {unresolved:?}"),
        )
        .await?;
        return Ok(Step::Stop(input));
    }
    let wave = pending_wave
        .as_ref()
        .map(|(number, _)| *number)
        .unwrap_or_else(|| u32::try_from(view.waves.len()).unwrap_or(u32::MAX) + 1);
    if pending_wave.is_none() {
        let wave_event = json!({
            "wave": wave,
            "children": frontier.iter().map(|child| child.id.as_str()).collect::<Vec<_>>(),
        });
        append(ctx, epic, WAVE_STARTED, wave_event).await?;
    }
    let generation = view
        .child_generations
        .get(&frontier[0].id)
        .copied()
        .unwrap_or(0)
        .saturating_add(1);
    let compiled = active_compiled_definition(&view)?;
    Ok(Step::Progress(
        start_child(ctx, &view.config, frontier[0], wave, generation, compiled).await?,
    ))
}

/// One epic scheduler action.
pub async fn epic_advance(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let epic = match param_str(&req.params, "epic") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key("epic_advance", None, None, None), &error),
    };
    let key = derive_key("epic_advance", Some(&epic), None, None);
    let _guard = match acquire_driver(ctx, &epic).await {
        Ok(guard) => guard,
        Err(error) => return err_response(&key, &error),
    };
    match advance_once(ctx, &epic, false).await {
        Ok(Step::Progress(value)) => ok_response(&key, false, json!({"progress": value})),
        Ok(Step::Stop(value)) => ok_response(&key, false, json!({"stopped": value})),
        Err(error) => err_response(&key, &error),
    }
}

/// Drive an epic through child slices and waves until a durable human stop.
pub async fn epic_drive(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let epic = match param_str(&req.params, "epic") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key("epic_drive", None, None, None), &error),
    };
    let key = derive_key("epic_drive", Some(&epic), None, None);
    let _guard = match acquire_driver(ctx, &epic).await {
        Ok(guard) => guard,
        Err(error) => return err_response(&key, &error),
    };
    loop {
        match advance_once(ctx, &epic, true).await {
            Ok(Step::Progress(_)) => continue,
            Ok(Step::Stop(value)) => return ok_response(&key, false, json!({"stopped": value})),
            Err(error) => return err_response(&key, &error),
        }
    }
}

async fn control_event(
    ctx: &Ctx,
    req: &mut OperationRequest,
    name: &str,
    kind: &str,
    require_idle_driver: bool,
) -> OperationResponse {
    let epic = match param_str(&req.params, "epic") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key(name, None, None, None), &error),
    };
    let reason = match param_str(&req.params, "reason") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key(name, Some(&epic), None, None), &error),
    };
    let control_epoch = match epic_events(ctx, &epic).await {
        Ok(events) => {
            let predecessor = if kind == PAUSED { RESUMED } else { PAUSED };
            let completed = events
                .iter()
                .filter(|event| event.kind == predecessor)
                .count();
            let epoch = if kind == PAUSED {
                completed.saturating_add(1)
            } else {
                completed
            };
            i64::try_from(epoch).unwrap_or(i64::MAX)
        }
        Err(error) => return err_response(&derive_key(name, Some(&epic), None, None), &error),
    };
    default_key(
        req,
        derive_key(name, Some(&epic), None, Some(control_epoch)),
    );
    let key = req.idempotency_key.clone();
    // Pause is an out-of-band control signal specifically so a lead session
    // can stop a detached controller at its next durable boundary. Resume is
    // accepted only after that controller has observed the pause and released
    // its singular driver slot.
    let _guard = match require_idle_driver {
        true => match acquire_driver(ctx, &epic).await {
            Ok(guard) => Some(guard),
            Err(error) => return err_response(&key, &error),
        },
        false => None,
    };
    let event = json!({"reason": reason});
    let event_epic = epic.clone();
    match safe_effect(
        ctx,
        name,
        key.clone(),
        &epic,
        event.clone(),
        move |_operation| async move {
            project(ctx, &event_epic).await?;
            append(ctx, &event_epic, kind, event.clone()).await?;
            Ok(event)
        },
    )
    .await
    {
        Ok(value) => ok_response(&key, false, value),
        Err(error) => err_response(&key, &error),
    }
}

/// Pause an epic.
pub async fn epic_pause(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    control_event(ctx, req, "epic_pause", PAUSED, false).await
}

/// Resume a paused epic (input-required remains until explicitly resolved).
pub async fn epic_resume(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    control_event(ctx, req, "epic_resume", RESUMED, true).await
}

/// Resolve one held child after a lead session adjudicated its input/spec.
pub async fn epic_resolve(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let epic = match param_str(&req.params, "epic") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key("epic_resolve", None, None, None), &error),
    };
    let child = match param_str(&req.params, "child") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(&derive_key("epic_resolve", Some(&epic), None, None), &error)
        }
    };
    let note = match param_str(&req.params, "note") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(
                &derive_key("epic_resolve", Some(&epic), Some(&child), None),
                &error,
            )
        }
    };
    default_key(
        req,
        derive_key("epic_resolve", Some(&epic), Some(&child), None),
    );
    let key = req.idempotency_key.clone();
    let _guard = match acquire_driver(ctx, &epic).await {
        Ok(guard) => guard,
        Err(error) => return err_response(&key, &error),
    };
    let event = json!({"childId": child, "note": note});
    let result = safe_effect(ctx, "epic_resolve", key.clone(), &epic, event.clone(), {
        let epic = epic.clone();
        let child = child.clone();
        move |_operation| async move {
            let view = project(ctx, &epic).await?;
            if !view.config.children.iter().any(|item| item.id == child) {
                return Err(Failure::invalid(format!(
                    "child {child:?} is not in epic {epic:?}"
                )));
            }
            let Some(input) = view.input.as_ref() else {
                return Err(Failure::invalid(format!(
                    "epic {epic:?} has no input requirement to resolve"
                )));
            };
            if input.get("childId").and_then(Value::as_str) != Some(child.as_str()) {
                return Err(Failure::invalid(format!(
                    "epic {epic:?} input requirement does not target child {child:?}"
                )));
            }
            let issue = forged_beads::show_issue(&ctx.config.bd_config(), &child).await?;
            if issue.status != "closed" && issue.status != "open" {
                forged_beads::reopen_issue(
                    &ctx.config.bd_config(),
                    &child,
                    &format!("forged:{epic}"),
                )
                .await?;
            }
            if let Some(previous) = view.children.get(&child) {
                append(
                    ctx,
                    &epic,
                    CHILD_RESET,
                    json!({
                        "childId": child,
                        "previousRunId": previous.run_id,
                        "nextGeneration": previous.generation.saturating_add(1),
                        "note": note,
                    }),
                )
                .await?;
            }
            append(ctx, &epic, INPUT_RESOLVED, event.clone()).await?;
            Ok(event)
        }
    })
    .await;
    match result {
        Ok(value) => ok_response(&key, false, value),
        Err(error) => err_response(&key, &error),
    }
}
