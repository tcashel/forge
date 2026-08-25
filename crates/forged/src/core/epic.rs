//! `epic/v1`: an event-sourced scheduler over Beads readiness and slice/v1.

use std::collections::{BTreeMap, BTreeSet};
use std::future::Future;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::Path;
use std::time::Duration;

use forged_ledger::{
    DesiredReconcileOutcome, DesiredState, DesiredSubjectKind, EffectClass,
    InventoryUsageSelection, Ledger, OperationState, RunOutcome, RunState, SlotOutcome,
};
use forged_proto::{NextAction, ProtoEvent, Terminal};
use forged_types::{
    AdmissionDecisionV1, AdmissionOutcome, AdmissionSubjectKind, ErrorCode, ExecutionPackageV1,
    NativeBeadSpecV1, OperationRequest, OperationResponse, RosterRevisionV1, Severity, Verdict,
    WorkIdentityContextV1, WorkIdentitySubjectKind,
};
use serde_json::{json, Map, Value};
use sha2::{Digest, Sha256};

use crate::adapters::ports::repo_slug;
use crate::core::{
    default_key, derive_key, err_response, fenced, ok_response, on_ledger, param_opt_str,
    param_str, read_only, Ctx, Failure,
};

// STARTED and the three lifecycle kinds below are `pub(super)` because the
// inventory (`super::ops::work_list`) derives an epic's entry from exactly
// these, and the input pair because the portfolio's attention rail folds an
// epic's hold out of exactly those two; every other kind stays private to
// the scheduler.
pub(super) const STARTED: &str = "forged.epic.started";
const INTEGRATION_READY: &str = "forged.epic.integration.ready";
const WAVE_STARTED: &str = "forged.epic.wave.started";
const CHILD_STARTED: &str = "forged.epic.child.started";
const CHILD_RESET: &str = "forged.epic.child.reset";
const CHILD_MERGED: &str = "forged.epic.child.merged";
pub(super) const INPUT_REQUIRED: &str = "forged.epic.input.required";
pub(super) const INPUT_RESOLVED: &str = "forged.epic.input.resolved";
pub(super) const PAUSED: &str = "forged.epic.paused";
pub(super) const RESUMED: &str = "forged.epic.resumed";
pub(super) const EPIC_PR: &str = "forged.epic.pr";
const ROSTER_REVISED: &str = "forged.epic.roster.revised";
const PACKAGE_MIGRATED: &str = "forged.epic.execution-package.migrated";
const PACKAGE_MIGRATION: &str = "forged.epic.execution-package/1";
const PLAN_STARTED: &str = "forged.epic.plan.started";
const PLAN_APPLIED: &str = "forged.epic.plan.applied";
const EPIC_POLL: Duration = Duration::from_millis(250);

#[derive(Debug, Clone)]
struct FrozenChild {
    id: String,
    title: String,
    issue_type: String,
    /// The child's frozen spec FILE, when it has one. `None` is the
    /// bead-sourced child: its run start reads the spec from the bead.
    spec_path: Option<String>,
    initially_closed: bool,
    /// New rolling epics may freeze an incomplete, blocked, unassigned stub.
    planning_stub: bool,
    frozen_fields: Option<NativeBeadSpecV1>,
    frozen_fields_sha256: Option<String>,
    frozen_revision: Option<String>,
    blockers: Vec<String>,
}

#[derive(Debug, Clone)]
struct EpicConfig {
    epic_id: String,
    title: String,
    repo: String,
    /// Deprecated external epic-map path retained for old start events.
    spec_path: Option<String>,
    base_ref: String,
    integration_branch: String,
    /// Frozen per-epic window. Events written before fan-out existed replay
    /// sequentially instead of silently inheriting a wider current config.
    max_active_children: u32,
    execution_package: ExecutionPackageV1,
    planning_package: Option<ExecutionPackageV1>,
    root_fields: Option<NativeBeadSpecV1>,
    children: Vec<FrozenChild>,
}

#[derive(Debug, Clone)]
struct ChildState {
    run_id: String,
    wave: u32,
    generation: u32,
    merged: Option<Value>,
}

#[derive(Debug, Clone)]
struct PlanningState {
    run_id: String,
    pre_digest: String,
    applied: Option<Value>,
}

struct EpicView {
    config: EpicConfig,
    integration: Option<Value>,
    waves: Vec<Value>,
    children: BTreeMap<String, ChildState>,
    planning: BTreeMap<String, PlanningState>,
    planning_generations: BTreeMap<String, u32>,
    planning_guidance: BTreeMap<String, String>,
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
                issue_type: child
                    .get("issueType")
                    .and_then(Value::as_str)
                    .unwrap_or("task")
                    .to_owned(),
                spec_path: child
                    .get("specPath")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                initially_closed: child
                    .get("initiallyClosed")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
                planning_stub: child
                    .get("planningStub")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
                frozen_fields: child
                    .get("frozenFields")
                    .filter(|value| !value.is_null())
                    .cloned()
                    .map(serde_json::from_value)
                    .transpose()
                    .map_err(|error| {
                        Failure::internal(format!("invalid frozen child fields: {error}"))
                    })?,
                frozen_fields_sha256: child
                    .get("frozenFieldsSha256")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                frozen_revision: child
                    .get("frozenRevision")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                blockers: child
                    .get("blockers")
                    .and_then(Value::as_array)
                    .map(|values| {
                        values
                            .iter()
                            .filter_map(Value::as_str)
                            .map(str::to_owned)
                            .collect()
                    })
                    .unwrap_or_default(),
            })
        })
        .collect::<Result<Vec<_>, Failure>>()?;
    Ok(EpicConfig {
        epic_id: string(value, "epicId")?,
        title: string(value, "title")?,
        repo: string(value, "repo")?,
        spec_path: value
            .get("specPath")
            .and_then(Value::as_str)
            .map(str::to_owned),
        base_ref: string(value, "baseRef")?,
        integration_branch: string(value, "integrationBranch")?,
        max_active_children: value
            .get("maxActiveChildren")
            .and_then(Value::as_u64)
            .and_then(|value| u32::try_from(value).ok())
            .filter(|value| *value > 0)
            .unwrap_or(1),
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
        planning_package: value
            .get("planningPackage")
            .filter(|value| !value.is_null())
            .cloned()
            .map(serde_json::from_value)
            .transpose()
            .map_err(|error| {
                Failure::internal(format!("epic planning package is invalid: {error}"))
            })?,
        root_fields: value
            .get("rootFields")
            .filter(|value| !value.is_null())
            .cloned()
            .map(serde_json::from_value)
            .transpose()
            .map_err(|error| {
                Failure::internal(format!("epic frozen root fields are invalid: {error}"))
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
        planning: BTreeMap::new(),
        planning_generations: BTreeMap::new(),
        planning_guidance: BTreeMap::new(),
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
            PLAN_STARTED => {
                let event = payload(&row)?;
                let child = string(&event, "childId")?;
                let generation = event
                    .get("generation")
                    .and_then(Value::as_u64)
                    .and_then(|value| u32::try_from(value).ok())
                    .unwrap_or_else(|| {
                        view.planning_generations
                            .get(&child)
                            .copied()
                            .unwrap_or(0)
                            .saturating_add(1)
                    });
                view.planning_generations.insert(child.clone(), generation);
                view.planning.insert(
                    child,
                    PlanningState {
                        run_id: string(&event, "runId")?,
                        pre_digest: string(&event, "preDigest")?,
                        applied: None,
                    },
                );
            }
            PLAN_APPLIED => {
                let event = payload(&row)?;
                let child = string(&event, "childId")?;
                if let Some(state) = view.planning.get_mut(&child) {
                    state.applied = Some(event);
                }
            }
            INPUT_REQUIRED => view.input = Some(payload(&row)?),
            INPUT_RESOLVED => {
                let event = payload(&row)?;
                view.input = None;
                if let Some(child) = event.get("childId").and_then(Value::as_str) {
                    let reset = view
                        .planning
                        .get(child)
                        .is_some_and(|state| state.applied.is_none());
                    if reset {
                        view.planning.remove(child);
                        if let Some(note) = event.get("note").and_then(Value::as_str) {
                            view.planning_guidance
                                .insert(child.to_owned(), note.to_owned());
                        }
                    }
                }
            }
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

struct EpicStopTransition {
    state: DesiredState,
    outcome: DesiredReconcileOutcome,
    error: Option<String>,
    identity_field: Option<&'static str>,
}

async fn append_stop_event(
    ctx: &Ctx,
    epic: &str,
    kind: &str,
    event: Value,
    transition: EpicStopTransition,
) -> Result<(), Failure> {
    let _submit_guard =
        super::handoff::acquire_submit(ctx, epic, super::handoff::Scope::Epic).await?;
    crate::failpoint::hit("epic.stop.guarded.before-commit");
    let epic = epic.to_owned();
    let kind = kind.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event_settling_desired(
            DesiredSubjectKind::Epic,
            &epic,
            &kind,
            event,
            transition.state,
            transition.outcome,
            false,
            transition.error,
            transition.identity_field,
        )
    })
    .await
}

/// Append a resolved-input transition while the caller holds the parent
/// epic submit fence. Resolution may happen while paused; clearing the input
/// rail must not silently turn the paused desired state back to running.
async fn append_resolution_event(
    ctx: &Ctx,
    epic: &str,
    event: Value,
    paused: bool,
) -> Result<(), Failure> {
    let epic = epic.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event_settling_desired(
            DesiredSubjectKind::Epic,
            &epic,
            INPUT_RESOLVED,
            event,
            if paused {
                DesiredState::Paused
            } else {
                DesiredState::Running
            },
            if paused {
                DesiredReconcileOutcome::Paused
            } else {
                DesiredReconcileOutcome::Authorized
            },
            !paused,
            None,
            Some("resolutionId"),
        )
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

fn is_no_diff(issue_type: &str) -> bool {
    matches!(issue_type, "chore" | "decision" | "milestone")
}

fn is_planning_stub(issue: &forged_beads::IssueSummary) -> bool {
    !is_no_diff(&issue.issue_type)
        && !super::spec::carries_spec(issue)
        && spec_pointer(&issue.description).is_none()
        && issue.status == "blocked"
        && issue.assignee.is_none()
}

fn native_fields(issue: &forged_beads::IssueSummary) -> NativeBeadSpecV1 {
    NativeBeadSpecV1 {
        description: issue.description.clone(),
        acceptance_criteria: issue.acceptance_criteria.clone(),
        design: issue.design.clone(),
        notes: issue.notes.clone(),
    }
}

fn fields_digest(fields: &NativeBeadSpecV1) -> Result<String, Failure> {
    let value = serde_json::to_value(fields)
        .map_err(|error| Failure::internal(format!("cannot encode native spec fields: {error}")))?;
    let bytes = forged_types::canonical_json_bytes(&value).map_err(|error| {
        Failure::internal(format!("cannot canonicalize native spec fields: {error}"))
    })?;
    let mut out = String::with_capacity(64);
    for byte in Sha256::digest(bytes) {
        use std::fmt::Write as _;
        let _ = write!(out, "{byte:02x}");
    }
    Ok(out)
}

fn complete_native_fields(fields: &NativeBeadSpecV1) -> bool {
    [
        &fields.description,
        &fields.acceptance_criteria,
        &fields.design,
        &fields.notes,
    ]
    .into_iter()
    .all(|value| !value.trim().is_empty())
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

async fn recover_applied_epic_resolution(
    ctx: &Ctx,
    key: &str,
    epic: &str,
    child: &str,
    note: &str,
) -> Result<Option<OperationResponse>, Failure> {
    let name = "epic_resolve".to_owned();
    let key_owned = key.to_owned();
    let row = on_ledger(&ctx.ledger, move |ledger| {
        ledger.find_operation(&name, &key_owned)
    })
    .await?;
    let Some(row) = row.filter(|row| row.state == OperationState::InProgress) else {
        return Ok(None);
    };
    let rows = epic_events(ctx, epic).await?;
    for event in rows
        .iter()
        .rev()
        .filter(|event| event.kind == INPUT_RESOLVED)
    {
        let landed = payload(event)?;
        if landed.get("resolutionId").and_then(Value::as_str) != Some(row.operation_id.as_str()) {
            continue;
        }
        if landed.get("childId").and_then(Value::as_str) != Some(child)
            || landed.get("note").and_then(Value::as_str) != Some(note)
        {
            return Err(Failure::refused(
                ErrorCode::IdempotencyConflict,
                format!(
                    "epic resolution operation {} landed with different child or note",
                    row.operation_id
                ),
            ));
        }
        let response = ok_response(&row.operation_id, false, landed);
        let operation_id = row.operation_id;
        let stored = response.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.resolve_interrupted_operation(&operation_id, &stored)
        })
        .await?;
        return Ok(Some(response));
    }
    Ok(None)
}

/// Settle the applied side of an interrupted atomic epic creation before
/// any current Beads read. The start event carries this exact operation id
/// and commits with the identity, so together they are sufficient recovery
/// evidence rather than a reason to rebuild from mutable authoring state.
async fn recover_applied_epic_start(
    ctx: &Ctx,
    key: &str,
    epic: &str,
    params: &Map<String, Value>,
) -> Result<Option<OperationResponse>, Failure> {
    let name = "epic_start".to_owned();
    let key_owned = key.to_owned();
    let row = on_ledger(&ctx.ledger, move |ledger| {
        ledger.find_operation(&name, &key_owned)
    })
    .await?;
    let Some(row) = row.filter(|row| row.state == OperationState::InProgress) else {
        return Ok(None);
    };
    let request = OperationRequest {
        schema_version: 1,
        idempotency_key: key.to_owned(),
        run_id: Some(epic.to_owned()),
        params: params.clone(),
    };
    let hash = forged_types::request_sha256(&request)
        .map_err(|error| Failure::invalid(format!("params cannot be canonicalized: {error}")))?;
    if row.request_sha256 != hash {
        return Err(Failure::refused(
            ErrorCode::IdempotencyConflict,
            "epic start key was stored with a different request",
        ));
    }
    let events = epic_events(ctx, epic).await?;
    let Some(landed) = events
        .iter()
        .find(|event| event.kind == STARTED)
        .map(payload)
        .transpose()?
        .filter(|value| {
            value.get("operationId").and_then(Value::as_str) == Some(row.operation_id.as_str())
        })
    else {
        return Ok(None);
    };
    // Absence is a torn/corrupt bundle. Never fall through to current Beads
    // and silently manufacture a different display identity.
    super::work_identity::load(ctx, WorkIdentitySubjectKind::Epic, epic).await?;
    let response = ok_response(&row.operation_id, false, landed);
    let operation_id = row.operation_id;
    let stored = response.clone();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.resolve_interrupted_operation(&operation_id, &stored)
    })
    .await?;
    let mut replayed = response;
    replayed.reused = true;
    Ok(Some(replayed))
}

/// Freeze the Beads inventory and child execution defaults.
pub async fn epic_start(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let epic = match param_str(&req.params, "epic") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key("epic_start", None, None, None), &error),
    };
    let rolling_authorized = match req.params.get("rolling") {
        None | Some(Value::Null) => false,
        Some(Value::Bool(value)) => *value,
        Some(_) => {
            return err_response(
                &derive_key("epic_start", Some(&epic), None, None),
                &Failure::invalid("epic start rolling must be a boolean"),
            )
        }
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
    match recover_applied_epic_start(ctx, &key, &epic, &params).await {
        Ok(Some(response)) => return response,
        Ok(None) => {}
        Err(error) => return err_response(&key, &error),
    }
    let result = safe_effect(
        ctx,
        "epic_start",
        key.clone(),
        &epic,
        Value::Object(params.clone()),
        {
            let epic = epic.clone();
            move |operation_id| async move {
                let existing_events = epic_events(ctx, &epic).await?;
                if let Some(started) = existing_events.iter().find(|row| row.kind == STARTED) {
                    let landed = payload(started)?;
                    if landed.get("operationId").and_then(Value::as_str)
                        == Some(operation_id.as_str())
                    {
                        // The start event and identity commit together. A
                        // response lost after that commit replays from those
                        // durable bytes without re-reading a renamed, deleted,
                        // or unavailable Bead.
                        return Ok(landed);
                    }
                    return status_json(ctx, project(ctx, &epic).await?).await;
                }
                let repo = super::work_identity::canonical_repository(param_str(&params, "repo")?)?;
                let legacy_spec = param_opt_str(&params, "spec").map(str::to_owned);
                if let Some(spec) = legacy_spec.as_deref() {
                    if !Path::new(spec).is_absolute() || !Path::new(spec).exists() {
                        return Err(Failure::invalid(format!(
                            "deprecated epic --spec {spec:?} is not an existing absolute path"
                        )));
                    }
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
                if issue.issue_type != "epic" {
                    return Err(Failure::invalid(format!(
                        "bead {epic} has issue type {:?}, not epic",
                        issue.issue_type
                    )));
                }
                let epic_spec = super::spec::resolve_issue(&issue)?;
                let root_fields = native_fields(&issue);
                let inventory = forged_beads::epic_children(&ctx.config.bd_config(), &epic).await?;
                if inventory.is_empty() {
                    return Err(Failure::invalid(format!(
                        "epic {epic} has no Beads children"
                    )));
                }
                let planning_ids = inventory
                    .iter()
                    .filter(|child| rolling_authorized && is_planning_stub(child))
                    .map(|child| child.id.clone())
                    .collect::<Vec<_>>();
                let dependency_rows = if planning_ids.is_empty() {
                    BTreeMap::new()
                } else {
                    forged_beads::plan_issues(&ctx.config.bd_config(), &planning_ids)
                        .await?
                        .into_iter()
                        .map(|row| (row.issue.id.clone(), row))
                        .collect::<BTreeMap<_, _>>()
                };
                let mut children = Vec::new();
                let mut rolling = false;
                for child in inventory {
                    // The bead's own fields win, but only when they are a
                    // WHOLE spec. A child missing either required section
                    // falls back to its `spec:` pointer — the route every
                    // epic frozen before this used — rather than freezing
                    // bead-sourced around a fragment.
                    let no_diff = is_no_diff(&child.issue_type);
                    let carries_spec = super::spec::carries_spec(&child);
                    let pointer = (!no_diff && !carries_spec)
                        .then(|| spec_pointer(&child.description))
                        .flatten();
                    let planning_stub = rolling_authorized && is_planning_stub(&child);
                    let child_spec = if no_diff || carries_spec || planning_stub {
                        None
                    } else {
                        let missing = super::spec::missing_spec_fields(&child).join(", ");
                        let pointer = pointer.ok_or_else(|| {
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
                    rolling |= planning_stub;
                    let frozen_fields = planning_stub.then(|| native_fields(&child));
                    let frozen_fields_sha256 =
                        frozen_fields.as_ref().map(fields_digest).transpose()?;
                    let blockers = dependency_rows
                        .get(&child.id)
                        .map(|row| {
                            row.dependencies
                                .iter()
                                .filter(|dependency| dependency.dependency_type.blocks_readiness())
                                .map(|dependency| dependency.id.clone())
                                .collect::<Vec<_>>()
                        })
                        .unwrap_or_default();
                    children.push(json!({
                        "id": child.id,
                        "title": child.title,
                        "issueType": child.issue_type,
                        "specPath": child_spec,
                        "initiallyClosed": child.status == "closed",
                        "planningStub": planning_stub,
                        "frozenFields": frozen_fields,
                        "frozenFieldsSha256": frozen_fields_sha256,
                        "frozenRevision": planning_stub.then_some(child.revision).flatten(),
                        "blockers": blockers,
                    }));
                }
                let planning_package = if rolling {
                    Some(
                        crate::config::compile_epic_plan_package(&compiled.package)
                            .map_err(|errors| {
                                Failure::invalid(format!(
                                    "epic planning definition is invalid: {}",
                                    serde_json::to_string(&errors).unwrap_or_default()
                                ))
                            })?
                            .package,
                    )
                } else {
                    None
                };
                let base_ref = match param_opt_str(&params, "baseRef") {
                    Some(value) => value.to_owned(),
                    None => super::ops::default_branch_of(&repo).await,
                };
                let integration_branch = format!("forged/epic-{epic}");
                let identity = super::work_identity::durable_identity(
                    WorkIdentitySubjectKind::Epic,
                    &epic,
                    &epic,
                    Some(&issue.title),
                    issue.revision.as_deref(),
                    Some(&repo),
                    super::work_identity::context_from_params(&params, "project"),
                    None,
                )?;
                let event = json!({
                    "schema": "forged.epic/1",
                    "epicId": epic,
                    "title": issue.title,
                    "repo": repo,
                    "operationId": operation_id,
                    "specSource": "bead",
                    "specRevision": issue.revision,
                    "specSha256": epic_spec.sha256,
                    "specPath": legacy_spec,
                    "deprecatedSpecPath": legacy_spec,
                    "baseRef": base_ref,
                    "integrationBranch": integration_branch,
                    "maxActiveChildren": ctx.config.admission.epic_fanout,
                    "profile": compiled.package.profile_ref.name,
                    "roster": compiled.package.roster_ref.name,
                    "packageSha256": compiled.package_sha256,
                    "executionPackage": compiled.package,
                    "planningPackage": planning_package,
                    "rollingAuthorized": rolling_authorized,
                    "rootFields": root_fields,
                    "children": children,
                });
                let epic_for_store = epic.clone();
                let event_for_store = event.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_epic_started_with_identity(
                        &epic_for_store,
                        event_for_store,
                        identity,
                    )
                })
                .await?;
                crate::failpoint::hit("epic.start.bundle.after");
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

fn desired_json(row: Option<&forged_ledger::DesiredWorkRow>) -> Value {
    row.map_or(Value::Null, |row| {
        json!({
            "state": row.desired_state.as_str(),
            "controlRevision": row.control_revision,
            "controllerGeneration": row.controller_generation,
            "nextWakeAt": row.next_wake_at,
            "lastOutcome": row.last_outcome.map(DesiredReconcileOutcome::as_str),
            "lastError": row.last_error,
            "restartUsed": row.restart_used,
            "restartBudget": row.restart_budget,
        })
    })
}

struct ChildDurable<'a> {
    run: Option<&'a forged_ledger::RunRow>,
    desired: Option<&'a forged_ledger::DesiredWorkRow>,
    admission: Option<&'a AdmissionDecisionV1>,
    controller: Option<&'a Value>,
    pr: Option<&'a Value>,
    planning_generation: Option<u32>,
    planning_blocker: Option<&'a Value>,
}

fn child_json(
    child: &FrozenChild,
    state: Option<&ChildState>,
    planning: Option<&PlanningState>,
    run_id: Option<&str>,
    bead_status: &str,
    identity: Value,
    durable: ChildDurable<'_>,
) -> Value {
    let ChildDurable {
        run,
        desired,
        admission,
        controller,
        pr,
        planning_generation,
        planning_blocker,
    } = durable;
    json!({
        "id": child.id,
        "identity": identity,
        "title": child.title,
        "issueType": child.issue_type,
        "specPath": child.spec_path,
        "beadsStatus": bead_status,
        "phase": if planning.is_some() { "planning" } else if state.is_some() { "implementation" } else { "unstarted" },
        "runId": run_id,
        "wave": state.map(|value| value.wave),
        "generation": state.map(|value| value.generation),
        "runState": run.map(|value| value.state.as_str()),
        "terminalOutcome": run.and_then(|value| value.terminal_outcome.map(RunOutcome::as_str)),
        "desired": desired_json(desired),
        "controller": controller,
        "admission": admission,
        "nextWakeAt": desired
            .and_then(|value| value.next_wake_at.as_deref())
            .or_else(|| admission.and_then(|value| value.next_eligible_wake_at.as_deref())),
        "pr": pr,
        "merged": state.and_then(|value| value.merged.as_ref()),
        "planning": planning.map(|value| json!({
            "cycle": planning_generation,
            "target": child.id,
            "runId": value.run_id,
            "preDigest": value.pre_digest,
            "applied": value.applied.is_some(),
            "observedRevision": value.applied.as_ref().and_then(|event| event.get("observedRevision")),
            "postRevision": value.applied.as_ref().and_then(|event| event.get("postRevision")),
            "postDigest": value.applied.as_ref().and_then(|event| event.get("postDigest")),
            "result": value.applied.as_ref().and_then(|event| event.get("result")),
            "blocker": planning_blocker,
        })),
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
    // One durable snapshot supplies every child run, identity, desired state,
    // admission decision, in-flight operation, and latest PR/controller
    // record. Child status never fans out into process-table or filesystem
    // probes; the epic controller's existing top-level projection remains a
    // single backwards-compatible liveness probe.
    let snapshot = on_ledger(&ctx.ledger, |ledger| {
        ledger.inventory_snapshot(
            &["proto.pr", "forged.controller.started"],
            InventoryUsageSelection::Omit,
        )
    })
    .await?;
    let identity = snapshot
        .work_identities
        .get(&(WorkIdentitySubjectKind::Epic, view.config.epic_id.clone()))
        .cloned()
        .ok_or_else(|| {
            Failure::internal(format!(
                "epic {:?} has no durable work identity",
                view.config.epic_id
            ))
        })?;
    let herdr_layout = super::herdr_layout::status(
        ctx,
        forged_types::HerdrLayoutSubjectV1 {
            kind: forged_types::HerdrLayoutSubjectKind::Epic,
            id: view.config.epic_id.clone(),
        },
    )
    .await;
    let (live, live_error) =
        match forged_beads::epic_children(&ctx.config.bd_config(), &view.config.epic_id).await {
            Ok(live) => (live, None),
            Err(error) => (Vec::new(), Some(error.to_string())),
        };
    let live: BTreeMap<_, _> = live
        .into_iter()
        .map(|issue| (issue.id.clone(), issue))
        .collect();
    let runs = snapshot
        .runs
        .iter()
        .map(|run| (run.run_id.as_str(), run))
        .collect::<BTreeMap<_, _>>();
    let desired = snapshot
        .desired_work
        .iter()
        .filter(|row| row.subject_kind == DesiredSubjectKind::Run)
        .map(|row| (row.subject_id.as_str(), row))
        .collect::<BTreeMap<_, _>>();
    let admissions = snapshot
        .admission_decisions
        .iter()
        .filter(|decision| decision.subject_kind == AdmissionSubjectKind::Run)
        .map(|decision| (decision.subject_id.as_str(), decision))
        .collect::<BTreeMap<_, _>>();
    let latest_payloads = |kind: &str| -> Result<BTreeMap<String, Value>, Failure> {
        let mut values = BTreeMap::new();
        for event in snapshot.events(kind) {
            let Some(run_id) = event.run_id.as_ref() else {
                continue;
            };
            let value: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "malformed {kind} event {}: {error}",
                    event.event_id
                ))
            })?;
            values.insert(run_id.clone(), value);
        }
        Ok(values)
    };
    let controllers = latest_payloads("forged.controller.started")?;
    let prs = latest_payloads("proto.pr")?;
    let slot_name = format!("epic:{}", view.config.epic_id);
    let integration_owner = on_ledger(&ctx.ledger, {
        let slot_name = slot_name.clone();
        move |ledger| ledger.read_merge_slot(&slot_name)
    })
    .await?;
    let integration_operation = snapshot.inflight_operations.iter().rev().find(|row| {
        row.run_id.as_deref() == Some(view.config.epic_id.as_str())
            && matches!(
                row.name.as_str(),
                "epic_child_ready" | "epic_child_merge" | "epic_child_close" | "epic_pr"
            )
    });

    let mut counts = BTreeMap::from([
        ("active", 0u64),
        ("queuedDeferred", 0),
        ("terminal", 0),
        ("held", 0),
        ("merged", 0),
    ]);
    let mut next_wakes = Vec::new();
    let epic_context = WorkIdentityContextV1 {
        id: view.config.epic_id.clone(),
        title: identity.bead.title.clone(),
    };
    let mut children = Vec::with_capacity(view.config.children.len());
    for child in &view.config.children {
        let state = view.children.get(&child.id);
        let planning_state = view.planning.get(&child.id);
        let planning = planning_state.filter(|state| state.applied.is_none());
        let planning_blocker = view.input.as_ref().filter(|input| {
            input.get("childId").and_then(Value::as_str) == Some(child.id.as_str())
        });
        let run_id = state
            .map(|state| state.run_id.as_str())
            .or_else(|| planning.map(|state| state.run_id.as_str()));
        let run = run_id.and_then(|run_id| runs.get(run_id).copied());
        let desired = run_id.and_then(|run_id| desired.get(run_id).copied());
        let admission = run_id.and_then(|run_id| admissions.get(run_id).copied());
        let terminal =
            run.is_some_and(|run| run.state == RunState::Stopped || run.terminal_outcome.is_some());
        let merged = state.is_some_and(|state| state.merged.is_some());
        let held = run
            .and_then(|run| run.terminal_outcome)
            .is_some_and(|outcome| !matches!(outcome, RunOutcome::Clean | RunOutcome::Landed))
            || admission.is_some_and(|decision| decision.outcome == AdmissionOutcome::Ineligible)
            || desired.is_some_and(|row| {
                matches!(
                    row.last_outcome,
                    Some(DesiredReconcileOutcome::Attention | DesiredReconcileOutcome::Exhausted)
                )
            });
        let queued = run_id.is_some()
            && planning.is_none()
            && !terminal
            && (desired.is_none()
                || admission
                    .is_some_and(|decision| decision.outcome == AdmissionOutcome::Deferred)
                || desired
                    .is_some_and(|row| row.last_outcome == Some(DesiredReconcileOutcome::Backoff)));
        if terminal {
            *counts.get_mut("terminal").expect("terminal counter") += 1;
        }
        if merged {
            *counts.get_mut("merged").expect("merged counter") += 1;
        }
        if held {
            *counts.get_mut("held").expect("held counter") += 1;
        }
        if queued {
            *counts.get_mut("queuedDeferred").expect("queue counter") += 1;
        }
        if run_id.is_some() && !terminal && !queued && !held {
            *counts.get_mut("active").expect("active counter") += 1;
        }
        if let Some(wake) = desired
            .and_then(|row| row.next_wake_at.as_deref())
            .or_else(|| admission.and_then(|row| row.next_eligible_wake_at.as_deref()))
        {
            next_wakes.push(wake.to_owned());
        }
        let live_issue = live.get(&child.id);
        let child_identity = if let Some(run_id) = run_id {
            serde_json::to_value(
                snapshot
                    .work_identities
                    .get(&(WorkIdentitySubjectKind::Run, run_id.to_owned()))
                    .ok_or_else(|| {
                        Failure::internal(format!("run {run_id:?} has no durable work identity"))
                    })?,
            )
            .map_err(|error| Failure::internal(format!("serialize work identity: {error}")))?
        } else if let Some(issue) = live_issue {
            serde_json::to_value(super::work_identity::live_plan_identity(
                WorkIdentitySubjectKind::Run,
                &child.id,
                &child.id,
                Some(&issue.title),
                issue.revision.as_deref(),
                Some(&view.config.repo),
                identity.project.clone(),
                Some(epic_context.clone()),
                issue.updated_at.as_deref().unwrap_or(&identity.captured_at),
            )?)
            .map_err(|error| Failure::internal(format!("serialize work identity: {error}")))?
        } else {
            Value::Null
        };
        let pr = run_id
            .and_then(|run_id| prs.get(run_id))
            .or_else(|| state.and_then(|state| state.merged.as_ref()));
        children.push(child_json(
            child,
            state,
            planning_state,
            run_id,
            live_issue
                .map(|issue| issue.status.as_str())
                .unwrap_or("unknown"),
            child_identity,
            ChildDurable {
                run,
                desired,
                admission,
                controller: run_id.and_then(|run_id| controllers.get(run_id)),
                pr,
                planning_generation: view.planning_generations.get(&child.id).copied(),
                planning_blocker,
            },
        ));
    }
    next_wakes.sort();
    Ok(json!({
        "schema": "forged.epic.status/1",
        "epicId": view.config.epic_id,
        "identity": identity,
        "herdrLayout": herdr_layout,
        "title": view.config.title,
        "repo": view.config.repo,
        "specPath": view.config.spec_path,
        "baseRef": view.config.base_ref,
        "integrationBranch": view.config.integration_branch,
        "maxActiveChildren": view.config.max_active_children,
        "counts": counts,
        "nextCoordinatorWakeAt": next_wakes.first(),
        "integrationOwner": integration_owner.map(|row| json!({
            "slot": row.slot,
            "holder": row.holder,
            "acquiredAt": row.acquired_at,
        })),
        "integrationOperation": integration_operation.map(|row| json!({
            "operationId": row.operation_id,
            "name": row.name,
            "idempotencyKey": row.idempotency_key,
            "state": "in-progress",
            "updatedAt": row.updated_at,
        })),
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
        "beadsInventory": {
            "available": live_error.is_none(),
            "detail": live_error,
        },
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
    require_input_with_evidence(ctx, epic, code, child, detail, None).await
}

async fn require_input_with_evidence(
    ctx: &Ctx,
    epic: &str,
    code: &str,
    child: Option<&str>,
    detail: impl Into<String>,
    evidence: Option<Value>,
) -> Result<Value, Failure> {
    let detail = detail.into();
    let mut event = json!({
        "code": code,
        "childId": child,
        "detail": detail.clone(),
    });
    if let (Some(object), Some(evidence)) = (event.as_object_mut(), evidence) {
        object.insert("evidence".to_owned(), evidence);
    }
    append_stop_event(
        ctx,
        epic,
        INPUT_REQUIRED,
        event.clone(),
        EpicStopTransition {
            state: DesiredState::Running,
            outcome: DesiredReconcileOutcome::Attention,
            error: Some(format!(
                "epic {epic} requires explicit input resolution: {detail}"
            )),
            identity_field: None,
        },
    )
    .await?;
    Ok(event)
}

async fn planning_protocol_terminal(ctx: &Ctx, run_id: &str) -> Result<Option<Value>, Failure> {
    let events = epic_events(ctx, run_id).await?;
    events
        .iter()
        .rev()
        .find(|event| event.kind == "run.protocol-terminal")
        .map(payload)
        .transpose()
        .map(|value| value.and_then(|value| value.get("terminal").cloned()))
}

fn clean_slice(view: &forged_proto::RunView) -> (bool, Value) {
    let terminal = forged_proto::advance(view);
    let approved = view.run.terminal_outcome == Some(forged_ledger::RunOutcome::Clean)
        || matches!(
            terminal,
            NextAction::Stop(Terminal::Done {
                final_verdict: Some(Verdict::Approve),
                final_verdict_is_durable: true,
                ..
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
    Wait(Value),
    Stop(Value),
}

struct PendingWave {
    number: u32,
    members: BTreeSet<String>,
    launch_order: BTreeMap<String, usize>,
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
            "epicId": config.epic_id,
            "epicTitle": config.title,
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

fn planning_run_id(child: &str, generation: u32) -> String {
    if generation == 1 {
        format!("{child}-epic-plan")
    } else {
        format!("{child}-epic-plan-g{generation}")
    }
}

async fn start_planning(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    generation: u32,
    guidance: Option<&str>,
) -> Result<Value, Failure> {
    let package = config
        .planning_package
        .clone()
        .ok_or_else(|| Failure::internal("rolling epic has no frozen planning package"))?;
    let compiled = crate::config::compile_frozen_package(package).map_err(|errors| {
        Failure::internal(format!(
            "frozen epic planning package is invalid: {}",
            serde_json::to_string(&errors).unwrap_or_default()
        ))
    })?;
    let frozen_fields = child.frozen_fields.as_ref().ok_or_else(|| {
        Failure::internal(format!("planning stub {:?} has no frozen fields", child.id))
    })?;
    let pre_digest = child.frozen_fields_sha256.clone().ok_or_else(|| {
        Failure::internal(format!("planning stub {:?} has no frozen digest", child.id))
    })?;
    let current =
        forged_beads::plan_issues(&ctx.config.bd_config(), std::slice::from_ref(&child.id))
            .await?
            .into_iter()
            .next()
            .ok_or_else(|| Failure::invalid(format!("planning stub {:?} is missing", child.id)))?;
    let observed_revision = current.issue.revision.clone();
    if fields_digest(&native_fields(&current.issue))? != pre_digest
        || current.issue.status != "blocked"
        || current.issue.assignee.is_some()
    {
        return Err(Failure::invalid(format!(
            "planning stub {:?} changed before cycle start",
            child.id
        )));
    }
    let run_id = planning_run_id(&child.id, generation);
    let input_path = ctx.config.run_dir(&run_id).join("planning-input.md");
    std::fs::create_dir_all(
        input_path
            .parent()
            .ok_or_else(|| Failure::internal("planning input has no parent"))?,
    )
    .map_err(|error| Failure::internal(format!("creating planning input directory: {error}")))?;
    let input = format!(
        "# Frozen epic outcome\n\n```json\n{}\n```\n\n# Designated child stub\n\n```json\n{}\n```\n\n# Frozen blockers\n\n```json\n{}\n```\n\n# Operator resolution\n\n{}\n",
        serde_json::to_string_pretty(&config.root_fields)
            .map_err(|error| Failure::internal(error.to_string()))?,
        serde_json::to_string_pretty(&json!({
            "childId": child.id,
            "fields": frozen_fields,
            "preDigest": pre_digest,
            "frozenRevision": child.frozen_revision,
            "observedRevision": observed_revision,
        }))
            .map_err(|error| Failure::internal(error.to_string()))?,
        serde_json::to_string_pretty(&child.blockers)
            .map_err(|error| Failure::internal(error.to_string()))?,
        guidance.unwrap_or("No prior operator resolution."),
    );
    match std::fs::read_to_string(&input_path) {
        Ok(existing) if existing == input => {}
        Ok(_) => {
            return Err(Failure::invalid(format!(
                "planning input {} differs from its frozen replay",
                input_path.display()
            )))
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            std::fs::write(&input_path, input.as_bytes()).map_err(|error| {
                Failure::internal(format!("writing frozen planning input: {error}"))
            })?;
        }
        Err(error) => {
            return Err(Failure::internal(format!(
                "reading frozen planning input: {error}"
            )))
        }
    }
    let mut request = OperationRequest {
        schema_version: 1,
        idempotency_key: derive_key("run_start", Some(&run_id), None, None),
        run_id: Some(run_id.clone()),
        params: match json!({
            "bead": config.epic_id,
            "run": run_id,
            "repo": config.repo,
            "internalSpec": input_path.to_string_lossy(),
            "baseRef": config.integration_branch,
            "epicId": config.epic_id,
            "epicTitle": config.title,
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
        "generation": generation,
        "preDigest": pre_digest,
        "observedRevision": observed_revision,
        "planningInput": input_path,
        "started": started,
    });
    append(ctx, &config.epic_id, PLAN_STARTED, event.clone()).await?;
    Ok(json!({"planning": event}))
}

async fn apply_planning_result(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    state: &PlanningState,
    candidate: crate::adapters::execute::PlanCandidate,
) -> Result<Step, Failure> {
    let post_fields = candidate.spec;
    let traceability = candidate.traceability;
    let post_digest = fields_digest(&post_fields)?;
    let issue = forged_beads::show_issue(&ctx.config.bd_config(), &child.id).await?;
    let observed_revision = issue.revision.clone();
    let current_digest = fields_digest(&native_fields(&issue))?;
    if current_digest != state.pre_digest && current_digest != post_digest {
        let input = require_input(
            ctx,
            &config.epic_id,
            "planning-stub-drift",
            Some(&child.id),
            format!(
                "native fields changed after planning began (observed revision {:?}, frozen digest {}, current digest {})",
                issue.revision, state.pre_digest, current_digest
            ),
        )
        .await?;
        return Ok(Step::Stop(input));
    }
    if let Err(error) =
        forged_git::verify_worktree_clean(&ctx.config.runs_root, &state.run_id).await
    {
        if matches!(
            error,
            forged_git::GitError::WorktreeDirty { .. }
                | forged_git::GitError::WorktreeUnresolved { .. }
        ) {
            let input = require_input(
                ctx,
                &config.epic_id,
                "planning-worktree-not-clean",
                Some(&child.id),
                format!(
                    "planning run {:?} cannot apply while its read-only worktree is dirty or conflicted: {error}",
                    state.run_id
                ),
            )
            .await?;
            return Ok(Step::Stop(input));
        }
        return Err(error.into());
    }
    if current_digest == state.pre_digest && (issue.status != "blocked" || issue.assignee.is_some())
    {
        let input = require_input(
            ctx,
            &config.epic_id,
            "planning-stub-custody-changed",
            Some(&child.id),
            format!(
                "stub is {:?} under assignee {:?}; expected blocked and unassigned",
                issue.status, issue.assignee
            ),
        )
        .await?;
        return Ok(Step::Stop(input));
    }
    let key = derive_key(
        "epic_plan_apply",
        Some(&config.epic_id),
        Some(&child.id),
        None,
    );
    let epic_id = config.epic_id.clone();
    let effect_epic_id = epic_id.clone();
    let child_id = child.id.clone();
    let pre_digest = state.pre_digest.clone();
    let post_for_effect = post_fields.clone();
    let post_digest_for_effect = post_digest.clone();
    let applied = safe_effect(
        ctx,
        "epic_plan_apply",
        key,
        &epic_id,
        json!({
            "childId": child.id,
            "observedRevision": observed_revision,
            "preDigest": state.pre_digest,
            "postDigest": post_digest,
            "fields": post_fields,
            "traceability": traceability,
        }),
        move |_operation| async move {
            let current = forged_beads::show_issue(&ctx.config.bd_config(), &child_id).await?;
            let digest = fields_digest(&native_fields(&current))?;
            if digest == post_digest_for_effect
                && current.status == "open"
                && current.assignee.is_none()
            {
                return Ok(json!({"id": child_id, "status": "open", "alreadyApplied": true}));
            }
            if digest != pre_digest || current.status != "blocked" || current.assignee.is_some() {
                return Err(Failure::invalid(format!(
                    "planning stub {child_id:?} changed before guarded apply"
                )));
            }
            let updated = forged_beads::apply_native_spec_to_blocked_stub(
                &ctx.config.bd_config(),
                &child_id,
                &format!("forged:{effect_epic_id}"),
                &forged_beads::NativeSpecUpdate {
                    description: post_for_effect.description,
                    acceptance_criteria: post_for_effect.acceptance_criteria,
                    design: post_for_effect.design,
                    notes: post_for_effect.notes,
                },
            )
            .await?;
            crate::failpoint::hit("epic.plan.apply.after-beads");
            Ok(json!({"id": updated.id, "status": updated.status, "revision": updated.revision}))
        },
    )
    .await;
    let applied = match applied {
        Ok(value) => value,
        Err(error) => {
            let current = forged_beads::show_issue(&ctx.config.bd_config(), &child.id).await?;
            let digest = fields_digest(&native_fields(&current))?;
            if digest != post_digest || current.status != "open" || current.assignee.is_some() {
                return Err(error);
            }
            json!({"id": current.id, "status": current.status, "recovered": true})
        }
    };
    forged_git::retire_worktree(
        Path::new(&config.repo),
        &ctx.config.runs_root,
        &state.run_id,
        &forged_git::RetireOptions {
            force: false,
            run_state_terminal: true,
        },
    )
    .await?;
    let post_image = forged_beads::show_issue(&ctx.config.bd_config(), &child.id).await?;
    if fields_digest(&native_fields(&post_image))? != post_digest
        || post_image.status != "open"
        || post_image.assignee.is_some()
    {
        return Err(Failure::internal(format!(
            "planning stub {:?} lost its exact post-image before event commit",
            child.id
        )));
    }
    let event = json!({
        "childId": child.id,
        "runId": state.run_id,
        "observedRevision": observed_revision,
        "postRevision": post_image.revision,
        "preDigest": state.pre_digest,
        "postDigest": post_digest,
        "result": {
            "spec": post_fields,
            "traceability": traceability,
        },
        "apply": applied,
    });
    append(ctx, &config.epic_id, PLAN_APPLIED, event.clone()).await?;
    Ok(Step::Progress(event))
}

/// Authorize and detach a child through the same run submission boundary a
/// lead session uses. The epic never calls a provider or a run driver: an
/// admitted controller owns the child from this point forward, while a
/// deferred response leaves durable desired work for the supervisor.
async fn submit_child(
    ctx: &Ctx,
    epic: &str,
    child: &FrozenChild,
    run_id: &str,
) -> Result<Value, Failure> {
    // Parent before child is the lock order used by packet launch too.
    // Pause/stop either wins before this bounded submit (and no child is
    // authorized) or waits until its controller identity/queued decision is
    // durable. Detached children are deliberately not killed by a later
    // parent pause.
    let _parent_guard =
        super::handoff::acquire_submit(ctx, epic, super::handoff::Scope::Epic).await?;
    let parent = project(ctx, epic).await?;
    if parent.paused.is_some() || parent.input.is_some() || parent.pr.is_some() {
        return Ok(json!({
            "childId": child.id,
            "runId": run_id,
            "submitted": false,
            "parentStopped": true,
        }));
    }
    let mut request = OperationRequest {
        schema_version: 1,
        idempotency_key: String::new(),
        run_id: Some(run_id.to_owned()),
        params: match json!({"run": run_id}) {
            Value::Object(map) => map,
            _ => Map::new(),
        },
    };
    let submitted = response(super::handoff::run_submit(ctx, &mut request).await)?;
    Ok(json!({
        "childId": child.id,
        "runId": run_id,
        "submission": submitted,
    }))
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
        move |operation| async move {
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
                "transitionId": operation,
            });
            append_stop_event(
                ctx,
                &config.epic_id,
                EPIC_PR,
                event.clone(),
                EpicStopTransition {
                    state: DesiredState::Stopped,
                    outcome: DesiredReconcileOutcome::Terminal,
                    error: None,
                    identity_field: Some("transitionId"),
                },
            )
            .await?;
            Ok(event)
        },
    )
    .await?;
    Ok(Step::Stop(json!({"finalPr": value})))
}

fn child_accounted(view: &EpicView, statuses: &BTreeMap<&str, &str>, child: &FrozenChild) -> bool {
    child.initially_closed
        || statuses
            .get(child.id.as_str())
            .is_some_and(|status| *status == "closed")
        || view
            .children
            .get(&child.id)
            .is_some_and(|state| state.merged.is_some())
}

async fn planning_after_completed_wave(
    ctx: &Ctx,
    view: &EpicView,
    statuses: &BTreeMap<&str, &str>,
) -> Result<Option<Step>, Failure> {
    if view.config.planning_package.is_none() || view.waves.is_empty() {
        return Ok(None);
    }
    let events = epic_events(ctx, &view.config.epic_id).await?;
    let latest_wave_event = events
        .iter()
        .rev()
        .find(|event| event.kind == WAVE_STARTED)
        .map(|event| event.event_id)
        .unwrap_or(0);
    let already_attempted = events
        .iter()
        .any(|event| event.event_id > latest_wave_event && event.kind == PLAN_STARTED);
    let retry_child = view.planning_guidance.keys().next().map(String::as_str);
    if already_attempted && retry_child.is_none() {
        return Ok(None);
    }

    let candidates = view
        .config
        .children
        .iter()
        .filter(|child| child.planning_stub)
        .filter(|child| !child_accounted(view, statuses, child))
        .filter(|child| !view.planning.contains_key(&child.id))
        .filter(|child| retry_child.is_none_or(|retry| child.id == retry))
        .collect::<Vec<_>>();
    let candidate_ids = candidates
        .iter()
        .map(|child| child.id.clone())
        .collect::<Vec<_>>();
    let plan_rows = forged_beads::plan_issues(&ctx.config.bd_config(), &candidate_ids)
        .await?
        .into_iter()
        .map(|row| (row.issue.id.clone(), row))
        .collect::<BTreeMap<_, _>>();
    let mut eligible = Vec::new();
    for child in candidates {
        let Some(row) = plan_rows.get(&child.id) else {
            let input = require_input(
                ctx,
                &view.config.epic_id,
                "planning-stub-missing",
                Some(&child.id),
                "frozen planning stub is absent from Beads",
            )
            .await?;
            return Ok(Some(Step::Stop(input)));
        };
        let live_blockers = row
            .dependencies
            .iter()
            .filter(|dependency| dependency.dependency_type.blocks_readiness())
            .map(|dependency| dependency.id.clone())
            .collect::<BTreeSet<_>>();
        let frozen_blockers = child.blockers.iter().cloned().collect::<BTreeSet<_>>();
        if live_blockers != frozen_blockers {
            let input = require_input(
                ctx,
                &view.config.epic_id,
                "planning-graph-drift",
                Some(&child.id),
                format!(
                    "blocking dependencies changed: frozen {frozen_blockers:?}, live {live_blockers:?}"
                ),
            )
            .await?;
            return Ok(Some(Step::Stop(input)));
        }
        let digest = fields_digest(&native_fields(&row.issue))?;
        if child.frozen_fields_sha256.as_deref() != Some(digest.as_str())
            || row.issue.status != "blocked"
            || row.issue.assignee.is_some()
        {
            let input = require_input(
                ctx,
                &view.config.epic_id,
                "planning-stub-drift",
                Some(&child.id),
                format!(
                    "stub changed before planning: status {:?}, assignee {:?}, digest {}",
                    row.issue.status, row.issue.assignee, digest
                ),
            )
            .await?;
            return Ok(Some(Step::Stop(input)));
        }
        let blockers_closed = row
            .dependencies
            .iter()
            .filter(|dependency| dependency.dependency_type.blocks_readiness())
            .all(|dependency| dependency.status.is_some_and(|status| status.is_closed()));
        if blockers_closed {
            eligible.push((row.issue.priority.unwrap_or(i64::MAX), child));
        }
    }
    eligible.sort_by(|(left_priority, left), (right_priority, right)| {
        left_priority
            .cmp(right_priority)
            .then_with(|| left.id.cmp(&right.id))
    });
    let Some((_, child)) = eligible.first() else {
        return Ok(None);
    };
    Ok(Some(Step::Progress(
        start_planning(
            ctx,
            &view.config,
            child,
            view.planning_generations
                .get(&child.id)
                .copied()
                .unwrap_or(0)
                .saturating_add(1),
            view.planning_guidance.get(&child.id).map(String::as_str),
        )
        .await?,
    )))
}

async fn advance_once(ctx: &Ctx, epic: &str) -> Result<Step, Failure> {
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

    let live = forged_beads::epic_children(&ctx.config.bd_config(), epic).await?;
    let issues = live
        .into_iter()
        .map(|issue| (issue.id.clone(), issue))
        .collect::<BTreeMap<_, _>>();
    let statuses = issues
        .iter()
        .map(|(id, issue)| (id.as_str(), issue.status.as_str()))
        .collect::<BTreeMap<_, _>>();

    let accounted = |child: &FrozenChild| child_accounted(&view, &statuses, child);

    // A planning run is internal cognition owned by the epic controller.
    // Reconcile it before opening another wave; a clean reviewed candidate
    // crosses the separate guarded Beads apply seam, while every failure
    // names its stub. No second controller or manual child dispatch exists.
    for child in &view.config.children {
        let Some(planning) = view
            .planning
            .get(&child.id)
            .filter(|state| state.applied.is_none())
        else {
            continue;
        };
        let run = super::drive::project(ctx, &planning.run_id).await?;
        if run.run.state == RunState::Stopped {
            if run.run.terminal_outcome == Some(RunOutcome::Clean) {
                let Some(candidate) = super::drive::latest_plan_candidate(&run) else {
                    let input = require_input(
                        ctx,
                        epic,
                        "planning-result-missing",
                        Some(&child.id),
                        "clean epic-plan run has no complete durable plan candidate",
                    )
                    .await?;
                    return Ok(Step::Stop(input));
                };
                return apply_planning_result(ctx, &view.config, child, planning, candidate).await;
            }
            let terminal = planning_protocol_terminal(ctx, &planning.run_id).await?;
            let amendment = terminal
                .as_ref()
                .and_then(|value| value.get("specAmendmentProposed"));
            let code = if amendment.is_some() {
                "planning-spec-amendment"
            } else {
                "planning-run-stopped"
            };
            let detail = amendment
                .and_then(|value| value.get("amendment"))
                .and_then(|value| value.get("summary"))
                .and_then(Value::as_str)
                .map(str::to_owned)
                .unwrap_or_else(|| {
                    format!(
                        "epic-plan run {} stopped with outcome {:?}: {}",
                        planning.run_id,
                        run.run.terminal_outcome,
                        run.run.stop_reason.as_deref().unwrap_or("no reason")
                    )
                });
            let input = require_input_with_evidence(
                ctx,
                epic,
                code,
                Some(&child.id),
                detail,
                Some(json!({
                    "runId": planning.run_id,
                    "outcome": run.run.terminal_outcome.map(RunOutcome::as_str),
                    "protocolTerminal": terminal,
                })),
            )
            .await?;
            return Ok(Step::Stop(input));
        }
        let request = OperationRequest {
            schema_version: 1,
            idempotency_key: String::new(),
            run_id: Some(planning.run_id.clone()),
            params: match json!({"run": planning.run_id}) {
                Value::Object(map) => map,
                _ => Map::new(),
            },
        };
        return Ok(Step::Progress(json!({
            "planningAdvanced": response(super::drive::run_advance(ctx, &request).await)?,
            "childId": child.id,
            "runId": planning.run_id,
        })));
    }
    if view.config.children.iter().all(accounted) {
        return final_pr(ctx, &view).await;
    }

    let desired = on_ledger(&ctx.ledger, |ledger| ledger.list_desired_work())
        .await?
        .into_iter()
        .filter(|row| row.subject_kind == DesiredSubjectKind::Run)
        .map(|row| (row.subject_id.clone(), row))
        .collect::<BTreeMap<_, _>>();
    let admissions = on_ledger(&ctx.ledger, |ledger| {
        ledger.latest_admission_decisions(Some(AdmissionSubjectKind::Run), None)
    })
    .await?
    .into_iter()
    .map(|decision| (decision.subject_id.clone(), decision))
    .collect::<BTreeMap<_, _>>();

    let mut clean_children = Vec::new();
    let mut held = Vec::<(String, &'static str, String)>::new();
    let mut missing_submission = Vec::new();
    let mut nonterminal = 0usize;
    let mut safe_nonterminal = false;
    let mut next_wakes = Vec::new();

    // Reconcile every started child from durable run state. No child is ever
    // advanced inline: its independent run controller owns protocol work.
    for child in &view.config.children {
        let Some(state) = view.children.get(&child.id) else {
            continue;
        };
        if state.merged.is_some() {
            continue;
        }
        let run = super::drive::project(ctx, &state.run_id).await?;
        if matches!(forged_proto::advance(&run), NextAction::Stop(_)) {
            let (is_clean, evidence) = clean_slice(&run);
            if is_clean {
                clean_children.push((state.wave, child.id.clone(), run, evidence));
            } else {
                held.push((
                    child.id.clone(),
                    "child-not-clean",
                    format!("slice requires adjudication: {evidence}"),
                ));
            }
            continue;
        }

        nonterminal = nonterminal.saturating_add(1);
        let desired_row = desired.get(&state.run_id);
        let decision = admissions.get(&state.run_id);
        if let Some(wake) = desired_row
            .and_then(|row| row.next_wake_at.as_ref())
            .or_else(|| decision.and_then(|row| row.next_eligible_wake_at.as_ref()))
        {
            next_wakes.push(wake.clone());
        }
        if desired_row.is_none() {
            missing_submission.push(child.id.clone());
            continue;
        }
        let durable_hold = decision
            .is_some_and(|decision| decision.outcome == AdmissionOutcome::Ineligible)
            || desired_row.is_some_and(|row| {
                row.desired_state != DesiredState::Running
                    || matches!(
                        row.last_outcome,
                        Some(
                            DesiredReconcileOutcome::Attention | DesiredReconcileOutcome::Exhausted
                        )
                    )
            });
        if durable_hold {
            held.push((
                child.id.clone(),
                "child-controller-held",
                format!(
                    "detached child cannot progress: desired={:?}, admission={:?}",
                    desired_row.and_then(|row| row.last_outcome),
                    decision.map(|row| (row.outcome, row.reason))
                ),
            ));
        } else {
            safe_nonterminal = true;
        }
    }

    // The existing epic slot plus the child-specific SafeRetry operation
    // serializes this complete ready/merge/close chain. Choose exactly one
    // clean child per tick in deterministic wave/id order.
    clean_children.sort_by(|left, right| (left.0, &left.1).cmp(&(right.0, &right.1)));
    if let Some((_, child_id, run, evidence)) = clean_children.into_iter().next() {
        let child = view
            .config
            .children
            .iter()
            .find(|child| child.id == child_id)
            .ok_or_else(|| Failure::internal(format!("frozen child {child_id:?} vanished")))?;
        return merge_child(ctx, &view.config, child, &run, evidence).await;
    }

    // Crash recovery: CHILD_STARTED is durable before submit. Re-enter the
    // shared submit operation for one such child before opening another
    // slot. The deterministic run id and submit key make this idempotent.
    missing_submission.sort();
    if let Some(child_id) = missing_submission.first() {
        let current = project(ctx, epic).await?;
        if let Some(paused) = current.paused {
            return Ok(Step::Stop(json!({"paused": paused})));
        }
        let child = view
            .config
            .children
            .iter()
            .find(|child| child.id == *child_id)
            .ok_or_else(|| Failure::internal(format!("frozen child {child_id:?} vanished")))?;
        let state = view
            .children
            .get(child_id)
            .ok_or_else(|| Failure::internal(format!("started child {child_id:?} vanished")))?;
        return Ok(Step::Progress(
            submit_child(ctx, epic, child, &state.run_id).await?,
        ));
    }

    // A wave is immutable once recorded. Only after every member joins may
    // the coordinator read and freeze a later global frontier.
    let pending_wave = view
        .waves
        .last()
        .map(|wave| -> Result<Option<PendingWave>, Failure> {
            let number = wave
                .get("wave")
                .and_then(Value::as_u64)
                .and_then(|value| u32::try_from(value).ok())
                .ok_or_else(|| Failure::internal("epic wave event has no valid wave"))?;
            let member_order = wave
                .get("children")
                .and_then(Value::as_array)
                .ok_or_else(|| Failure::internal("epic wave event has no children"))?
                .iter()
                .map(|value| {
                    value
                        .as_str()
                        .map(str::to_owned)
                        .ok_or_else(|| Failure::internal("epic wave child is not a string"))
                })
                .collect::<Result<Vec<_>, _>>()?;
            let members = member_order.iter().cloned().collect::<BTreeSet<_>>();
            let frozen_order = match wave.get("priorityOrder") {
                Some(value) => value
                    .as_array()
                    .ok_or_else(|| Failure::internal("epic wave priority order is not an array"))?
                    .iter()
                    .map(|entry| {
                        entry
                            .get("childId")
                            .and_then(Value::as_str)
                            .map(str::to_owned)
                            .ok_or_else(|| {
                                Failure::internal("epic wave priority entry has no child id")
                            })
                    })
                    .collect::<Result<Vec<_>, _>>()?,
                None => member_order,
            };
            if frozen_order.iter().cloned().collect::<BTreeSet<_>>() != members
                || frozen_order.len() != members.len()
            {
                return Err(Failure::internal(
                    "epic wave priority order does not match its frozen membership",
                ));
            }
            let launch_order = frozen_order
                .into_iter()
                .enumerate()
                .map(|(rank, child)| (child, rank))
                .collect::<BTreeMap<_, _>>();
            let joined = view
                .config
                .children
                .iter()
                .filter(|child| members.contains(&child.id))
                .all(&accounted);
            Ok((!joined).then_some(PendingWave {
                number,
                members,
                launch_order,
            }))
        })
        .transpose()?
        .flatten();

    let (wave, members, launch_order) = match pending_wave {
        Some(value) => (value.number, value.members, value.launch_order),
        None => {
            if let Some(step) = planning_after_completed_wave(ctx, &view, &statuses).await? {
                return Ok(step);
            }
            let ready = forged_beads::ready_epic_children(&ctx.config.bd_config(), epic)
                .await?
                .into_iter()
                .map(|issue| (issue.id.clone(), issue))
                .collect::<BTreeMap<_, _>>();
            let mut frontier = view
                .config
                .children
                .iter()
                .filter(|child| !accounted(child))
                .filter(|child| !view.children.contains_key(&child.id))
                .filter(|child| ready.contains_key(&child.id))
                .collect::<Vec<_>>();
            frontier.sort_by(|left, right| {
                ready
                    .get(&left.id)
                    .and_then(|issue| issue.priority)
                    .unwrap_or(i64::MAX)
                    .cmp(
                        &ready
                            .get(&right.id)
                            .and_then(|issue| issue.priority)
                            .unwrap_or(i64::MAX),
                    )
                    .then_with(|| left.id.cmp(&right.id))
            });
            if frontier.is_empty() {
                let unresolved = view
                    .config
                    .children
                    .iter()
                    .filter(|child| !accounted(child))
                    .map(|child| child.id.clone())
                    .collect::<Vec<_>>();
                let child = unresolved.first().map(String::as_str);
                let input = require_input(
                    ctx,
                    epic,
                    "no-ready-children",
                    child,
                    format!(
                        "Beads frontier contains none of the unresolved children: {unresolved:?}"
                    ),
                )
                .await?;
                return Ok(Step::Stop(input));
            }
            let wave = u32::try_from(view.waves.len())
                .unwrap_or(u32::MAX)
                .saturating_add(1);
            let order = frontier
                .iter()
                .map(|child| {
                    json!({
                        "childId": child.id,
                        "priority": ready.get(&child.id).and_then(|issue| issue.priority),
                    })
                })
                .collect::<Vec<_>>();
            let member_order = frontier
                .iter()
                .map(|child| child.id.clone())
                .collect::<Vec<_>>();
            // This commit is intentionally a distinct scheduler action. A
            // crash cannot leave the first child visible without the whole
            // deterministic frontier already durable.
            let wave_event = json!({
                "wave": wave,
                "children": member_order,
                "priorityOrder": order,
            });
            append(ctx, epic, WAVE_STARTED, wave_event.clone()).await?;
            return Ok(Step::Progress(wave_event));
        }
    };

    let mut pending = view
        .config
        .children
        .iter()
        .filter(|child| members.contains(&child.id))
        .filter(|child| !accounted(child))
        .filter(|child| !view.children.contains_key(&child.id))
        .collect::<Vec<_>>();
    pending.sort_by(|left, right| {
        launch_order
            .get(&left.id)
            .unwrap_or(&usize::MAX)
            .cmp(launch_order.get(&right.id).unwrap_or(&usize::MAX))
            .then_with(|| left.id.cmp(&right.id))
    });

    for child in pending.iter().filter(|child| is_no_diff(&child.issue_type)) {
        held.push((
            child.id.clone(),
            "non-code-child",
            format!(
                "{} is a no-diff {} Bead; complete it directly in Beads, then resolve this hold",
                child.id, child.issue_type
            ),
        ));
    }

    let available = usize::try_from(view.config.max_active_children)
        .unwrap_or(usize::MAX)
        .saturating_sub(nonterminal);
    let launchable = pending
        .iter()
        .copied()
        .filter(|child| !is_no_diff(&child.issue_type))
        .take(available)
        .collect::<Vec<_>>();
    if !launchable.is_empty() {
        let compiled = active_compiled_definition(&view)?;
        let mut launched = Vec::new();
        for child in launchable {
            // Pause is out-of-band. Observe it before each new child so at
            // most the current start/submit effect crosses the boundary.
            let current = project(ctx, epic).await?;
            if current.paused.is_some() || current.input.is_some() || current.pr.is_some() {
                break;
            }
            let generation = view
                .child_generations
                .get(&child.id)
                .copied()
                .unwrap_or(0)
                .saturating_add(1);
            let started =
                start_child(ctx, &view.config, child, wave, generation, compiled.clone()).await?;
            let run_id = string(&started, "runId")?;
            let current = project(ctx, epic).await?;
            let submission = if current.paused.is_some() {
                Value::Null
            } else {
                submit_child(ctx, epic, child, &run_id).await?
            };
            launched.push(json!({"started": started, "submitted": submission}));
        }
        if !launched.is_empty() {
            return Ok(Step::Progress(json!({"launched": launched})));
        }
        let current = project(ctx, epic).await?;
        if let Some(paused) = current.paused {
            return Ok(Step::Stop(json!({"paused": paused})));
        }
    }

    // Terminal failures and direct-action children wait until independent
    // controllers have finished or reached their durable wake. Only then is
    // the lowest child id promoted into the singular resolution rail.
    if safe_nonterminal {
        next_wakes.sort();
        return Ok(Step::Wait(json!({
            "reason": "children-running-or-deferred",
            "nextWakeAt": next_wakes.first(),
            "activeOrQueued": nonterminal,
        })));
    }
    held.sort_by(|left, right| left.0.cmp(&right.0));
    if let Some((child, code, detail)) = held.into_iter().next() {
        let input = require_input(ctx, epic, code, Some(&child), detail).await?;
        return Ok(Step::Stop(input));
    }

    if nonterminal > 0 {
        return Ok(Step::Wait(json!({
            "reason": "children-awaiting-reconciliation",
            "activeOrQueued": nonterminal,
        })));
    }

    let stalled_child = view
        .config
        .children
        .iter()
        .filter(|child| !accounted(child))
        .map(|child| child.id.as_str())
        .min();
    let input = require_input(
        ctx,
        epic,
        "wave-stalled",
        stalled_child,
        format!("wave {wave} has no safe launch, integration, or resolution candidate"),
    )
    .await?;
    Ok(Step::Stop(input))
}

async fn record_desired_stop(ctx: &Ctx, epic: &str, stop: &Value) -> Result<(), Failure> {
    // Share the controller-submit singleton through the durable stop write.
    // A supervisor that already owns the fence linearizes its spawn first;
    // otherwise this transition clears its claim before it can reserve or
    // spawn a generation.
    let _submit_guard =
        super::handoff::acquire_submit(ctx, epic, super::handoff::Scope::Epic).await?;
    let (state, outcome, detail) = if stop.get("finalPr").is_some() {
        (
            DesiredState::Stopped,
            DesiredReconcileOutcome::Terminal,
            None,
        )
    } else if stop.get("paused").is_some() {
        (DesiredState::Paused, DesiredReconcileOutcome::Paused, None)
    } else {
        // Input-required remains a separate explicit resolution rail. Keep
        // authorization, but park it with no wake until resume/resolve makes
        // the subject due again.
        (
            DesiredState::Running,
            DesiredReconcileOutcome::Attention,
            Some(format!("epic {epic} requires explicit input resolution")),
        )
    };
    let epic = epic.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.record_desired_outcome(
            DesiredSubjectKind::Epic,
            &epic,
            state,
            outcome,
            None,
            detail,
        )
    })
    .await
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
    match advance_once(ctx, &epic).await {
        Ok(Step::Progress(value)) => ok_response(&key, false, json!({"progress": value})),
        Ok(Step::Wait(value)) => ok_response(&key, false, json!({"waiting": value})),
        Ok(Step::Stop(value)) => match record_desired_stop(ctx, &epic, &value).await {
            Ok(()) => ok_response(&key, false, json!({"stopped": value})),
            Err(error) => err_response(&key, &error),
        },
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
    loop {
        // Ownership covers one bounded reconciliation tick only. In
        // particular, no merge slot or SQLite transaction survives the
        // poll below, so manual/replacement ticks and pause can linearize.
        let step = {
            let _guard = match acquire_driver(ctx, &epic).await {
                Ok(guard) => guard,
                Err(error) => return err_response(&key, &error),
            };
            advance_once(ctx, &epic).await
        };
        match step {
            Ok(Step::Progress(_)) => continue,
            Ok(Step::Wait(_)) => tokio::time::sleep(EPIC_POLL).await,
            Ok(Step::Stop(value)) => {
                if let Err(error) = record_desired_stop(ctx, &epic, &value).await {
                    return err_response(&key, &error);
                }
                return ok_response(&key, false, json!({"stopped": value}));
            }
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
    // Serialize the desired-state transition with manual submit and
    // supervisor restart. Pause remains out-of-band with respect to the
    // long-lived epic driver, but it cannot race a new controller spawn.
    let _submit_guard =
        match super::handoff::acquire_submit(ctx, &epic, super::handoff::Scope::Epic).await {
            Ok(guard) => guard,
            Err(error) => return err_response(&key, &error),
        };
    let event = json!({"reason": reason, "controlId": key.clone()});
    let event_epic = epic.clone();
    let desired_state = if kind == PAUSED {
        DesiredState::Paused
    } else {
        DesiredState::Running
    };
    let control_kind = kind.to_owned();
    match safe_effect(
        ctx,
        name,
        key.clone(),
        &epic,
        event.clone(),
        move |_operation| async move {
            project(ctx, &event_epic).await?;
            let desired_epic = event_epic.clone();
            let desired_event = event.clone();
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_event_controlling_desired(
                    DesiredSubjectKind::Epic,
                    &desired_epic,
                    &control_kind,
                    desired_event,
                    desired_state,
                )
            })
            .await?;
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
    let resolution_epoch = match epic_events(ctx, &epic).await {
        Ok(events) => i64::try_from(
            events
                .iter()
                .filter(|event| event.kind == INPUT_REQUIRED)
                .count(),
        )
        .unwrap_or(i64::MAX),
        Err(error) => {
            return err_response(
                &derive_key("epic_resolve", Some(&epic), Some(&child), None),
                &error,
            )
        }
    };
    default_key(
        req,
        derive_key(
            "epic_resolve",
            Some(&epic),
            Some(&child),
            Some(resolution_epoch),
        ),
    );
    let key = req.idempotency_key.clone();
    let _guard = match acquire_driver(ctx, &epic).await {
        Ok(guard) => guard,
        Err(error) => return err_response(&key, &error),
    };
    match recover_applied_epic_resolution(ctx, &key, &epic, &child, &note).await {
        Ok(Some(response)) => return response,
        Ok(None) => {}
        Err(error) => return err_response(&key, &error),
    }
    let event = json!({"childId": child, "note": note});
    let result = safe_effect(ctx, "epic_resolve", key.clone(), &epic, event.clone(), {
        let epic = epic.clone();
        let child = child.clone();
        move |operation| async move {
            let mut resolved_event = event.clone();
            let Some(resolved_object) = resolved_event.as_object_mut() else {
                return Err(Failure::internal("epic resolution event is not an object"));
            };
            resolved_object.insert("resolutionId".to_owned(), json!(operation));
            // Parent then child is the control order shared with launch. The
            // child fence joins any still-running terminal settlement before
            // reopening its Bead, preventing the old generation from
            // re-blocking it after resolution has already landed.
            let _parent_guard =
                super::handoff::acquire_submit(ctx, &epic, super::handoff::Scope::Epic).await?;
            let view = project(ctx, &epic).await?;
            let Some(frozen_child) = view.config.children.iter().find(|item| item.id == child)
            else {
                return Err(Failure::invalid(format!(
                    "child {child:?} is not in epic {epic:?}"
                )));
            };
            let Some(input) = view.input.as_ref() else {
                let rows = epic_events(ctx, &epic).await?;
                for row in rows.iter().filter(|row| row.kind == INPUT_RESOLVED) {
                    let landed = payload(row)?;
                    if landed.get("resolutionId") == resolved_event.get("resolutionId") {
                        return Ok(resolved_event);
                    }
                }
                return Err(Failure::invalid(format!(
                    "epic {epic:?} has no input requirement to resolve"
                )));
            };
            if input.get("childId").and_then(Value::as_str) != Some(child.as_str()) {
                return Err(Failure::invalid(format!(
                    "epic {epic:?} input requirement does not target child {child:?}"
                )));
            }
            let active_planning = view
                .planning
                .get(&child)
                .is_some_and(|state| state.applied.is_none());
            if frozen_child.planning_stub && active_planning {
                let issue = forged_beads::show_issue(&ctx.config.bd_config(), &child).await?;
                let fields = native_fields(&issue);
                let digest = fields_digest(&fields)?;
                if issue.status == "open"
                    && issue.assignee.is_none()
                    && complete_native_fields(&fields)
                {
                    if let Some(planning) = view
                        .planning
                        .get(&child)
                        .filter(|state| state.applied.is_none())
                    {
                        append(
                            ctx,
                            &epic,
                            PLAN_APPLIED,
                            json!({
                                "childId": child,
                                "runId": planning.run_id,
                                "preDigest": planning.pre_digest,
                                "postDigest": digest,
                                "observedRevision": issue.revision,
                                "apply": {"external": true, "status": "open"},
                            }),
                        )
                        .await?;
                    }
                } else if issue.status == "blocked" && issue.assignee.is_none() {
                    if let Some(planning) = view
                        .planning
                        .get(&child)
                        .filter(|state| state.applied.is_none())
                    {
                        if digest != planning.pre_digest {
                            return Err(Failure::invalid(format!(
                                "planning stub {child:?} changed without becoming a complete open spec"
                            )));
                        }
                    }
                } else {
                    return Err(Failure::invalid(format!(
                        "planning stub {child:?} must remain blocked and unassigned or be a complete open spec"
                    )));
                }
                append_resolution_event(ctx, &epic, resolved_event.clone(), view.paused.is_some())
                    .await?;
                crate::failpoint::hit("epic.resolve.desired.after");
                return Ok(resolved_event);
            }
            let previous = view.children.get(&child).cloned();
            let _child_guard = match previous.as_ref() {
                Some(previous) => {
                    Some(super::handoff::acquire_run_submit(ctx, &previous.run_id).await?)
                }
                None => None,
            };
            let issue = forged_beads::show_issue(&ctx.config.bd_config(), &child).await?;
            if issue.status != "closed" && issue.status != "open" {
                forged_beads::reopen_issue(
                    &ctx.config.bd_config(),
                    &child,
                    &format!("forged:{epic}"),
                )
                .await?;
            }
            if let Some(previous) = previous {
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
            append_resolution_event(ctx, &epic, resolved_event.clone(), view.paused.is_some())
                .await?;
            crate::failpoint::hit("epic.resolve.desired.after");
            Ok(resolved_event)
        }
    })
    .await;
    match result {
        Ok(value) => ok_response(&key, false, value),
        Err(error) => err_response(&key, &error),
    }
}
