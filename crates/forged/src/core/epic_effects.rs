//! Epic effects used by the supervisor ore pass.

use super::*;

pub(super) async fn ensure_integration(
    ctx: &Ctx,
    config: &EpicConfig,
    start_epoch: usize,
) -> Result<Value, Failure> {
    ensure_integration_impl(ctx, config, start_epoch).await
}

pub(super) async fn ensure_planning_run(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    state: &PlanningState,
) -> Result<PlanningRunEnsure, Failure> {
    ensure_planning_run_impl(ctx, config, child, state, false).await
}

pub(super) async fn dispatch_planning_run(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    state: &PlanningState,
) -> Result<PlanningRunEnsure, Failure> {
    ensure_planning_run_impl(ctx, config, child, state, true).await
}

pub(super) async fn capture_planning_checkpoint(
    ctx: &Ctx,
    view: &EpicView,
    child: &FrozenChild,
) -> Result<PlanningCheckpoint, Failure> {
    capture_planning_checkpoint_impl(ctx, view, child).await
}

pub(super) async fn apply_planning_result(
    ctx: &Ctx,
    view: &EpicView,
    child: &FrozenChild,
    state: &PlanningState,
    candidate: crate::adapters::execute::PlanCandidate,
) -> Result<ReconcileAction, Failure> {
    apply_planning_result_impl(ctx, view, child, state, candidate).await
}

pub(super) async fn merge_child(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    run: &forged_proto::RunView,
    evidence: Value,
) -> Result<ReconcileAction, Failure> {
    merge_child_impl(ctx, config, child, run, evidence).await
}

pub(super) async fn final_pr(ctx: &Ctx, view: &EpicView) -> Result<ReconcileAction, Failure> {
    final_pr_impl(ctx, view).await
}

pub(super) async fn ensure_assurance_run(
    ctx: &Ctx,
    config: &EpicConfig,
    state: &AssuranceState,
) -> Result<Value, Failure> {
    ensure_assurance_run_impl(ctx, config, state, false).await
}

pub(super) async fn dispatch_assurance_run(
    ctx: &Ctx,
    config: &EpicConfig,
    state: &AssuranceState,
) -> Result<Value, Failure> {
    ensure_assurance_run_impl(ctx, config, state, true).await
}

pub(super) async fn dispatch_assurance(
    ctx: &Ctx,
    view: &EpicView,
    pr: &Value,
) -> Result<ReconcileAction, Failure> {
    start_assurance_impl(ctx, view, pr, true).await
}

pub(super) async fn complete_assurance(
    ctx: &Ctx,
    view: &EpicView,
    state: &AssuranceState,
    run: &forged_proto::RunView,
) -> Result<ReconcileAction, Failure> {
    complete_assurance_impl(ctx, view, state, run).await
}

async fn ensure_integration_impl(
    ctx: &Ctx,
    config: &EpicConfig,
    start_epoch: usize,
) -> Result<Value, Failure> {
    // The setup key is epoch-scoped like epic_start's: a fresh epoch after
    // an abandon must RE-RUN integration setup (and land its own
    // INTEGRATION_READY in the new epoch), never replay the dead epoch's
    // stored response into a projection that cannot see its event.
    let stage_segment = (start_epoch > 0).then(|| format!("e{start_epoch}"));
    let key = derive_key(
        "epic_setup",
        Some(&config.epic_id),
        stage_segment.as_deref(),
        None,
    );
    let repo = config.repo.clone();
    let branch = config.integration_branch.clone();
    let base = config.base_ref.clone();
    let epic = config.epic_id.clone();
    let event_epic = epic.clone();
    let scratch = ctx
        .config
        .run_dir(&config.epic_id)
        .join("integration-setup");
    let ready = safe_effect(
        ctx,
        "epic_setup",
        key,
        &epic,
        json!({"repo": repo, "integrationBranch": branch, "baseRef": base}),
        move |_operation| async move {
            let sha =
                forged_git::ensure_integration_branch(Path::new(&repo), &branch, &base, &scratch)
                    .await?;
            let event = integration_ready_event(&branch, &base, &sha, start_epoch);
            append(ctx, &event_epic, INTEGRATION_READY, event.clone()).await?;
            Ok(event)
        },
    )
    .await?;
    // Land-or-verify OUTSIDE the effect. A replayed setup never re-runs the
    // closure, so an epic already wedged by an untagged stored response —
    // terminal-OK with no event its epoch can see — heals here on the next
    // tick. Within an epoch the append is an idempotent no-op.
    match (
        ready.get("branch").and_then(Value::as_str),
        ready.get("baseRef").and_then(Value::as_str),
        ready.get("cutSha").and_then(Value::as_str),
    ) {
        (Some(branch), Some(base), Some(sha)) => {
            let event = integration_ready_event(branch, base, sha, start_epoch);
            append(ctx, &config.epic_id, INTEGRATION_READY, event.clone()).await?;
            Ok(event)
        }
        _ => Ok(ready),
    }
}

async fn ensure_planning_run_impl(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    state: &PlanningState,
    authorize: bool,
) -> Result<PlanningRunEnsure, Failure> {
    let input = state.input_body.as_deref().ok_or_else(|| {
        Failure::internal(format!(
            "new planning cycle {:?} has no durable input body",
            state.run_id
        ))
    })?;
    let input_path = ctx.config.run_dir(&state.run_id).join("planning-input.md");
    std::fs::create_dir_all(
        input_path
            .parent()
            .ok_or_else(|| Failure::internal("planning input has no parent"))?,
    )
    .map_err(|error| Failure::internal(format!("creating planning input directory: {error}")))?;
    match std::fs::read_to_string(&input_path) {
        Ok(existing) if existing == input => {}
        Ok(observed) => {
            let stopped = require_input_with_evidence(
                ctx,
                &config.epic_id,
                "planning-input-mismatch",
                Some(&child.id),
                format!(
                    "planning input {} differs from its durable checkpoint",
                    input_path.display()
                ),
                Some(json!({
                    "path": input_path,
                    "expectedSha256": bytes_digest(input.as_bytes()),
                    "observedSha256": bytes_digest(observed.as_bytes()),
                    "expectedBytes": input.len(),
                    "observedBytes": observed.len(),
                })),
            )
            .await?;
            return Ok(PlanningRunEnsure::Stop(stopped));
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            crate::runtime::atomic_write(&input_path, input.as_bytes(), 0o600)?;
        }
        Err(error) => {
            return Err(Failure::internal(format!(
                "reading frozen planning input: {error}"
            )))
        }
    }
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
    let mut request = OperationRequest {
        schema_version: 1,
        idempotency_key: derive_key("run_start", Some(&state.run_id), None, None),
        run_id: Some(state.run_id.clone()),
        params: match json!({
            "bead": config.epic_id,
            "run": state.run_id,
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
    let started = if authorize {
        crate::core::ops::dispatch_frontier_run(ctx, &mut request, compiled).await
    } else {
        crate::core::ops::run_start_with_definition(ctx, &mut request, compiled).await
    };
    response(started).map(PlanningRunEnsure::Started)
}

async fn capture_planning_checkpoint_impl(
    ctx: &Ctx,
    view: &EpicView,
    child: &FrozenChild,
) -> Result<PlanningCheckpoint, Failure> {
    if !view.config.rolling_authorized {
        return Err(Failure::invalid(format!(
            "epic {:?} has no durable rolling authorization",
            view.config.epic_id
        )));
    }
    let integration_sha = forged_git::remote_branch_sha(
        Path::new(&view.config.repo),
        &view.config.integration_branch,
    )
    .await?;
    let (live, live_legacy) =
        crate::core::workstore::epic_children_with_legacy(&ctx.ledger, &view.config.epic_id)
            .await?;
    let live = live
        .into_iter()
        .map(|issue| (issue.id.clone(), issue))
        .collect::<BTreeMap<_, _>>();
    let frozen_ids = view
        .config
        .children
        .iter()
        .map(|child| child.id.clone())
        .collect::<BTreeSet<_>>();
    let live_ids = live.keys().cloned().collect::<BTreeSet<_>>();
    let frozen_legacy = if view.config.legacy_membership_recorded {
        view.config
            .children
            .iter()
            .filter(|child| child.legacy_non_parent)
            .map(|child| child.id.clone())
            .collect::<BTreeSet<_>>()
    } else {
        // The old event omitted source classification. Its child IDs are
        // still the immutable bound; classify only those current members at
        // the first new rolling checkpoint and persist the result there.
        live_legacy.clone()
    };
    if live_ids != frozen_ids || live_legacy != frozen_legacy {
        return Err(Failure::invalid(format!(
            "epic inventory changed at rolling boundary: frozen {frozen_ids:?} with legacy {frozen_legacy:?}, live {live_ids:?} with legacy {live_legacy:?}"
        )));
    }
    let mut exact_ids = vec![view.config.epic_id.clone(), child.id.clone()];
    exact_ids.sort();
    exact_ids.dedup();
    let exact = crate::core::workstore::plan_issues(&ctx.ledger, &exact_ids)
        .await?
        .into_iter()
        .map(|row| (row.issue.id.clone(), row))
        .collect::<BTreeMap<_, _>>();
    let root = exact.get(&view.config.epic_id).ok_or_else(|| {
        Failure::invalid(format!(
            "rolling epic root {:?} is missing",
            view.config.epic_id
        ))
    })?;
    let frozen_root = json!({
        "title": view.config.title,
        "issueType": "epic",
        "revision": view.config.root_revision,
        "fields": view.config.root_fields,
    });
    let live_root = json!({
        "title": root.issue.title,
        "issueType": root.issue.issue_type,
        "revision": root.issue.revision,
        "fields": native_fields(&root.issue),
    });
    // A work revision is an opaque per-write provenance token, not a content
    // fence. Retain both revisions in the evidence above, but freeze only the
    // semantic root contract that rolling planning is authorized to preserve.
    let semantic_root_keys = ["title", "issueType", "fields"];
    if semantic_root_keys
        .iter()
        .any(|key| frozen_root.get(key) != live_root.get(key))
    {
        return Err(Failure::invalid(format!(
            "epic root {:?} changed since epic start: frozen {}, live {}",
            view.config.epic_id, frozen_root, live_root
        )));
    }
    let target = exact
        .get(&child.id)
        .ok_or_else(|| Failure::invalid(format!("planning stub {:?} is missing", child.id)))?;
    let mut members = view
        .config
        .children
        .iter()
        .map(|member| {
            json!({
                "id": member.id,
                "title": member.title,
                "issueType": member.issue_type,
                "initiallyClosed": member.initially_closed,
                "planningStub": member.planning_stub,
                "legacyNonParent": frozen_legacy.contains(&member.id),
                "blockers": member.blockers,
            })
        })
        .collect::<Vec<_>>();
    members.sort_by(|left, right| {
        left.get("id")
            .and_then(Value::as_str)
            .cmp(&right.get("id").and_then(Value::as_str))
    });
    let frozen_inventory = json!({
        "epicId": view.config.epic_id,
        "members": members,
    });
    let mut completed = view
        .config
        .children
        .iter()
        .filter_map(|member| {
            let issue = live.get(&member.id)?;
            let merged = view
                .children
                .get(&member.id)
                .and_then(|state| state.merged.clone());
            (member.initially_closed || issue.status == "closed" || merged.is_some()).then(|| {
                json!({
                    "id": member.id,
                    "initiallyClosed": member.initially_closed,
                    "status": issue.status,
                    "revision": issue.revision,
                    "merged": merged,
                })
            })
        })
        .collect::<Vec<_>>();
    completed.sort_by(|left, right| {
        left.get("id")
            .and_then(Value::as_str)
            .cmp(&right.get("id").and_then(Value::as_str))
    });
    Ok(PlanningCheckpoint {
        observed_revision: target.issue.revision.clone(),
        integration_sha,
        frozen_inventory,
        completed_child_evidence: Value::Array(completed),
        // Root dependency status is completion evidence, not root
        // structure. Persisting it here would make our own target blocked ->
        // open write look like root drift during post-image recovery.
        root_snapshot: issue_checkpoint(root, false),
        target_snapshot: issue_checkpoint(target, true),
    })
}

async fn apply_planning_result_impl(
    ctx: &Ctx,
    view: &EpicView,
    child: &FrozenChild,
    state: &PlanningState,
    candidate: crate::adapters::execute::PlanCandidate,
) -> Result<ReconcileAction, Failure> {
    let config = &view.config;
    let post_fields = candidate.spec;
    let traceability = candidate.traceability;
    let post_digest = fields_digest(&post_fields)?;
    let initial_issue = crate::core::workstore::show_issue(&ctx.ledger, &child.id).await?;
    let initial_digest = fields_digest(&native_fields(&initial_issue))?;
    if initial_digest == state.pre_digest
        && (initial_issue.status != "blocked" || initial_issue.assignee.is_some())
    {
        let input = require_input(
            ctx,
            &config.epic_id,
            "planning-stub-custody-changed",
            Some(&child.id),
            format!(
                "stub is {:?} under assignee {:?}; expected blocked and unassigned",
                initial_issue.status, initial_issue.assignee
            ),
        )
        .await?;
        return Ok(ReconcileAction::Stop(input));
    }
    if state.integration_sha.is_some() {
        let checkpoint = match capture_planning_checkpoint(ctx, view, child).await {
            Ok(checkpoint) => checkpoint,
            Err(error) => {
                let code = if error.code == ErrorCode::InvalidRequest {
                    "planning-checkpoint-drift"
                } else {
                    "planning-checkpoint-unavailable"
                };
                let input = require_input_with_evidence(
                    ctx,
                    &config.epic_id,
                    code,
                    Some(&child.id),
                    error.message.clone(),
                    Some(json!({"error": error.message})),
                )
                .await?;
                return Ok(ReconcileAction::Stop(input));
            }
        };
        if let Err(detail) = checkpoint_drift(state, &checkpoint, &post_digest) {
            let input = require_input_with_evidence(
                ctx,
                &config.epic_id,
                "planning-checkpoint-drift",
                Some(&child.id),
                detail.clone(),
                Some(json!({
                    "detail": detail,
                    "generation": state.generation,
                    "expected": {
                        "integrationSha": state.integration_sha,
                        "frozenInventory": state.inventory,
                        "completedChildEvidence": state.completed_evidence,
                        "rootSnapshot": state.root_snapshot,
                        "targetSnapshot": state.target_snapshot,
                    },
                    "observed": {
                        "integrationSha": checkpoint.integration_sha,
                        "frozenInventory": checkpoint.frozen_inventory,
                        "completedChildEvidence": checkpoint.completed_child_evidence,
                        "rootSnapshot": checkpoint.root_snapshot,
                        "targetSnapshot": checkpoint.target_snapshot,
                    },
                })),
            )
            .await?;
            return Ok(ReconcileAction::Stop(input));
        }
    }
    let issue = crate::core::workstore::show_issue(&ctx.ledger, &child.id).await?;
    let observed_revision = state
        .observed_revision
        .clone()
        .or_else(|| issue.revision.clone());
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
        return Ok(ReconcileAction::Stop(input));
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
            return Ok(ReconcileAction::Stop(input));
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
        return Ok(ReconcileAction::Stop(input));
    }
    let key = derive_key(
        "epic_plan_apply",
        Some(&config.epic_id),
        Some(&child.id),
        Some(i64::from(state.generation)),
    );
    let epic_id = config.epic_id.clone();
    let effect_epic_id = epic_id.clone();
    let child_id = child.id.clone();
    let pre_digest = state.pre_digest.clone();
    let post_for_effect = post_fields.clone();
    let post_digest_for_effect = post_digest.clone();
    let checkpoint_state = state.clone();
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
            if checkpoint_state.integration_sha.is_some() {
                let live_view = project(ctx, &effect_epic_id).await?;
                let live_child = live_view
                    .config
                    .children
                    .iter()
                    .find(|candidate| candidate.id == child_id)
                    .ok_or_else(|| {
                        Failure::invalid(format!(
                            "planning stub {child_id:?} left the frozen inventory"
                        ))
                    })?;
                let checkpoint = capture_planning_checkpoint(ctx, &live_view, live_child).await?;
                checkpoint_drift(&checkpoint_state, &checkpoint, &post_digest_for_effect)
                    .map_err(Failure::invalid)?;
            }
            let current = crate::core::workstore::show_issue(&ctx.ledger, &child_id).await?;
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
            let updated = crate::core::workstore::apply_native_spec_to_blocked_stub(
                &ctx.ledger,
                &child_id,
                &format!("forged:{effect_epic_id}"),
                &crate::core::work_types::NativeSpecUpdate {
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
            let current = crate::core::workstore::show_issue(&ctx.ledger, &child.id).await?;
            let digest = fields_digest(&native_fields(&current))?;
            if digest != post_digest || current.status != "open" || current.assignee.is_some() {
                let input = require_input_with_evidence(
                    ctx,
                    &config.epic_id,
                    "planning-guarded-apply-refused",
                    Some(&child.id),
                    error.message.clone(),
                    Some(json!({
                        "error": error.message,
                        "generation": state.generation,
                        "observedRevision": current.revision,
                        "observedDigest": digest,
                        "observedStatus": current.status,
                        "observedAssignee": current.assignee,
                    })),
                )
                .await?;
                return Ok(ReconcileAction::Stop(input));
            }
            json!({
                "id": current.id,
                "status": current.status,
                "revision": current.revision,
                "readback": current,
                "recovered": true,
            })
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
    let post_image = crate::core::workstore::show_issue(&ctx.ledger, &child.id).await?;
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
        "postReadback": post_image,
        "preDigest": state.pre_digest,
        "postDigest": post_digest,
        "result": {
            "spec": post_fields,
            "traceability": traceability,
        },
        "apply": applied,
    });
    append(ctx, &config.epic_id, PLAN_APPLIED, event.clone()).await?;
    Ok(ReconcileAction::Progress(event))
}

async fn merge_child_impl(
    ctx: &Ctx,
    config: &EpicConfig,
    child: &FrozenChild,
    run: &forged_proto::RunView,
    evidence: Value,
) -> Result<ReconcileAction, Failure> {
    let Some(pr_number) = crate::core::drive::pr_number_of(run) else {
        let input = require_input(
            ctx,
            &config.epic_id,
            "missing-child-pr",
            Some(&child.id),
            "clean terminal slice has no durable draft PR identity",
        )
        .await?;
        return Ok(ReconcileAction::Stop(input));
    };
    let remote = github_remote(Path::new(&config.repo))
        .await
        .map_err(Failure::from)?;
    let gh = forged_git::GhClient::new().with_host_opt(remote.gh_host());
    let slug = remote.slug.clone();
    let ready_key = derive_key(
        "epic_child_ready",
        Some(&config.epic_id),
        Some(&child.id),
        Some(pr_number as i64),
    );
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
    let gh = forged_git::GhClient::new().with_host_opt(remote.gh_host());
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
            let issue = crate::core::workstore::close_issue(
                &ctx.ledger,
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
    Ok(ReconcileAction::Progress(event))
}

async fn final_pr_impl(ctx: &Ctx, view: &EpicView) -> Result<ReconcileAction, Failure> {
    let remote = github_remote(Path::new(&view.config.repo))
        .await
        .map_err(Failure::from)?;
    let gh = forged_git::GhClient::new().with_host_opt(remote.gh_host());
    let slug = remote.slug;
    let key = derive_key("epic_pr", Some(&view.config.epic_id), None, None);
    let config = view.config.clone();
    let assurance_enabled = config.assurance_package.is_some();
    let integration_sha =
        forged_git::remote_branch_sha(Path::new(&config.repo), &config.integration_branch).await?;
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
                "headSha": integration_sha,
                "terminal": !assurance_enabled,
                "transitionId": operation,
            });
            if assurance_enabled {
                append(ctx, &config.epic_id, EPIC_PR, event.clone()).await?;
            } else {
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
            }
            Ok(event)
        },
    )
    .await?;
    if view.config.assurance_package.is_some() {
        Ok(ReconcileAction::Progress(
            json!({"draftPr": value, "terminal": false}),
        ))
    } else {
        Ok(ReconcileAction::Stop(json!({"finalPr": value})))
    }
}

async fn ensure_assurance_run_impl(
    ctx: &Ctx,
    config: &EpicConfig,
    state: &AssuranceState,
    authorize: bool,
) -> Result<Value, Failure> {
    let input_path = ctx.config.run_dir(&state.run_id).join("assurance-input.md");
    std::fs::create_dir_all(
        input_path
            .parent()
            .ok_or_else(|| Failure::internal("assurance input has no parent"))?,
    )
    .map_err(|error| Failure::internal(format!("creating assurance input directory: {error}")))?;
    match std::fs::read_to_string(&input_path) {
        Ok(existing) if existing == state.input_body => {}
        Ok(existing) => {
            return Err(Failure::invalid(format!(
                "assurance input {} differs from durable bytes: expected {}, observed {}",
                input_path.display(),
                bytes_digest(state.input_body.as_bytes()),
                bytes_digest(existing.as_bytes()),
            )))
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            crate::runtime::atomic_write(&input_path, state.input_body.as_bytes(), 0o600)?;
        }
        Err(error) => {
            return Err(Failure::internal(format!(
                "reading frozen assurance input: {error}"
            )))
        }
    }
    let package = config
        .assurance_package
        .clone()
        .ok_or_else(|| Failure::internal("epic has no frozen assurance package"))?;
    let compiled = crate::config::compile_frozen_package(package).map_err(|errors| {
        Failure::internal(format!(
            "frozen epic assurance package is invalid: {}",
            serde_json::to_string(&errors).unwrap_or_default()
        ))
    })?;
    let mut request = OperationRequest {
        schema_version: 1,
        idempotency_key: derive_key("run_start", Some(&state.run_id), None, None),
        run_id: Some(state.run_id.clone()),
        params: match json!({
            "bead": config.epic_id,
            "run": state.run_id,
            "repo": config.repo,
            "internalSpec": input_path.to_string_lossy(),
            "internalBranch": config.integration_branch,
            "baseRef": config.base_ref,
            "epicId": config.epic_id,
            "epicTitle": config.title,
        }) {
            Value::Object(map) => map,
            _ => Map::new(),
        },
    };
    let started_response = if authorize {
        crate::core::ops::dispatch_frontier_run(ctx, &mut request, compiled).await
    } else {
        crate::core::ops::run_start_with_definition(ctx, &mut request, compiled).await
    };
    let started = response(started_response)?;
    let run = crate::core::drive::project(ctx, &state.run_id).await?;
    if !run
        .proto_events
        .iter()
        .any(|event| matches!(event, ProtoEvent::Pr { .. }))
    {
        let number = final_pr_number(&state.pr)?;
        let is_draft = state
            .pr
            .get("isDraft")
            .and_then(Value::as_bool)
            .unwrap_or(true);
        let base_ref_name = state
            .pr
            .get("base")
            .and_then(Value::as_str)
            .map(str::to_owned);
        let url = state
            .pr
            .get("url")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned();
        let run_id = state.run_id.clone();
        let ledger = ctx.ledger.clone();
        tokio::task::spawn_blocking(move || {
            forged_proto::record(
                &ledger,
                &run_id,
                ProtoEvent::Pr {
                    number,
                    is_draft,
                    base_ref_name,
                    url,
                },
            )
        })
        .await
        .map_err(|error| Failure::internal(format!("record assurance PR join: {error}")))?
        .map_err(Failure::from)?;
    }
    Ok(started)
}

async fn start_assurance_impl(
    ctx: &Ctx,
    view: &EpicView,
    pr: &Value,
    authorize: bool,
) -> Result<ReconcileAction, Failure> {
    let config = &view.config;
    let inspected: Result<(String, forged_git::PrMeta, String), Failure> = async {
        let integration_sha =
            forged_git::remote_branch_sha(Path::new(&config.repo), &config.integration_branch)
                .await?;
        let remote = github_remote(Path::new(&config.repo))
            .await
            .map_err(Failure::from)?;
        let number = final_pr_number(pr)?;
        let gh = forged_git::GhClient::new().with_host_opt(remote.gh_host());
        let fresh_pr = gh.pr_view(&remote.slug, number).await?;
        let fresh_pr_sha = gh.pr_head_sha(&remote.slug, number).await?;
        Ok((integration_sha, fresh_pr, fresh_pr_sha))
    }
    .await;
    let (integration_sha, fresh_pr, fresh_pr_sha) = match inspected {
        Ok(inspected) => inspected,
        Err(error) => {
            let stopped = require_input_with_evidence(
                ctx,
                &config.epic_id,
                "assurance-start-inspection-failed",
                None,
                error.message,
                Some(json!({
                    "integrationBranch": config.integration_branch,
                    "draftPr": pr,
                })),
            )
            .await?;
            return Ok(ReconcileAction::Stop(stopped));
        }
    };
    let pr_sha = pr
        .get("headSha")
        .and_then(Value::as_str)
        .ok_or_else(|| Failure::internal("new assurance draft PR has no frozen head SHA"))?;
    let exact_pr = fresh_pr.state == "OPEN"
        && fresh_pr.is_draft
        && fresh_pr.head_ref_name == config.integration_branch
        && fresh_pr.base_ref_name == config.base_ref;
    if pr_sha != integration_sha || fresh_pr_sha != integration_sha || !exact_pr {
        let stopped = require_input_with_evidence(
            ctx,
            &config.epic_id,
            "assurance-pr-head-drift",
            None,
            "draft PR or integration branch changed before assurance started",
            Some(json!({
                "draftPrSha": pr_sha,
                "remoteSha": integration_sha,
                "freshPrSha": fresh_pr_sha,
                "draftPr": pr,
                "freshPr": {
                    "number": fresh_pr.number,
                    "state": fresh_pr.state,
                    "isDraft": fresh_pr.is_draft,
                    "head": fresh_pr.head_ref_name,
                    "base": fresh_pr.base_ref_name,
                    "url": fresh_pr.url,
                },
            })),
        )
        .await?;
        return Ok(ReconcileAction::Stop(stopped));
    }
    let run_id = assurance_run_id(&config.epic_id);
    let input_body = format!(
        "# Frozen epic root contract\n\n```json\n{}\n```\n\n# Integrated outcome\n\n```json\n{}\n```\n",
        serde_json::to_string_pretty(&config.root_fields)
            .map_err(|error| Failure::internal(error.to_string()))?,
        serde_json::to_string_pretty(&json!({
            "epicId": config.epic_id,
            "repository": config.repo,
            "baseRef": config.base_ref,
            "integrationBranch": config.integration_branch,
            "integrationSha": integration_sha,
            "draftPr": pr,
            "waves": view.waves,
            "planningCycles": view.planning.iter().map(|(child, state)| json!({
                "childId": child,
                "runId": state.run_id,
                "generation": state.generation,
                "integrationSha": state.integration_sha,
                "applied": state.applied,
            })).collect::<Vec<_>>(),
            "children": view.children.iter().map(|(child, state)| json!({
                "childId": child,
                "runId": state.run_id,
                "wave": state.wave,
                "generation": state.generation,
                "merged": state.merged,
            })).collect::<Vec<_>>(),
        }))
        .map_err(|error| Failure::internal(error.to_string()))?,
    );
    let event = json!({
        "runId": run_id,
        "childId": config.epic_id,
        "integrationSha": integration_sha,
        "pr": pr,
        "assuranceInputBody": input_body,
    });
    append(ctx, &config.epic_id, ASSURANCE_STARTED, event.clone()).await?;
    crate::failpoint::hit("epic.assurance.start.after");
    let state = AssuranceState {
        run_id,
        integration_sha,
        pr: pr.clone(),
        input_body,
    };
    let started = if authorize {
        dispatch_assurance_run(ctx, config, &state).await?
    } else {
        ensure_assurance_run(ctx, config, &state).await?
    };
    Ok(ReconcileAction::Progress(
        json!({"assurance": event, "started": started}),
    ))
}

async fn complete_assurance_impl(
    ctx: &Ctx,
    view: &EpicView,
    state: &AssuranceState,
    run: &forged_proto::RunView,
) -> Result<ReconcileAction, Failure> {
    let config = &view.config;
    let prepared: Result<_, Failure> = async {
        let gate = latest_gate_evidence(run)?;
        let expected_sha = gate
            .get("headSha")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned();
        let number = final_pr_number(&state.pr)?;
        let key = derive_key(
            "epic_pr_finalize",
            Some(&config.epic_id),
            Some(&expected_sha),
            Some(i64::try_from(number).unwrap_or(i64::MAX)),
        );
        let operation_name = "epic_pr_finalize".to_owned();
        let operation_key = key.clone();
        let operation = on_ledger(&ctx.ledger, move |ledger| {
            ledger.find_operation(&operation_name, &operation_key)
        })
        .await?;
        let replaying_finalization = operation.is_some_and(|operation| {
            operation.state == OperationState::InProgress
                && operation.run_id.as_deref() == Some(config.epic_id.as_str())
        });
        let pending_body = format!(
            "Epic {} has not completed integrated assurance.\n\n## Assurance status\n\nFinal binding verification is pending. Do not treat this pull request as assured.\n\nExpected candidate SHA: `{expected_sha}`.",
            config.epic_id,
        );
        let remote = github_remote(Path::new(&config.repo))
            .await
            .map_err(Failure::from)?;
        if replaying_finalization {
            forged_git::GhClient::new()
                .with_host_opt(remote.gh_host())
                .update_pr_body(&remote.slug, number, &pending_body)
                .await?;
        }
        Ok((
            gate,
            expected_sha,
            number,
            key,
            pending_body,
            replaying_finalization,
            remote,
        ))
    }
    .await;
    let (gate, gate_sha, number, key, pending_body, replaying_finalization, remote) = match prepared
    {
        Ok(prepared) => prepared,
        Err(error) => {
            let stopped = require_input_with_evidence(
                ctx,
                &config.epic_id,
                "assurance-final-inspection-failed",
                None,
                error.message.clone(),
                Some(json!({
                    "runId": state.run_id,
                    "initialSha": state.integration_sha,
                    "draftPr": state.pr,
                    "errorCode": error.code,
                    "recoverable": error.recoverable,
                })),
            )
            .await?;
            return Ok(ReconcileAction::Stop(stopped));
        }
    };
    let inspected: Result<AssuranceFinalInspection, Failure> = async {
        let local_sha = git_head(&ctx.config.worktree(&state.run_id)).await?;
        let remote_sha =
            forged_git::remote_branch_sha(Path::new(&config.repo), &config.integration_branch)
                .await?;
        let slug = remote.slug.clone();
        let gh = forged_git::GhClient::new().with_host_opt(remote.gh_host());
        let pr = gh.pr_view(&slug, number).await?;
        let pr_sha = gh.pr_head_sha(&slug, number).await?;
        Ok(AssuranceFinalInspection {
            gate: gate.clone(),
            local_sha,
            remote_sha,
            slug,
            number,
            pr,
            pr_sha,
        })
    }
    .await;
    let AssuranceFinalInspection {
        gate,
        local_sha,
        remote_sha,
        slug,
        number,
        pr,
        pr_sha,
    } = match inspected {
        Ok(inspected) => inspected,
        Err(error) => {
            let stopped = require_input_with_evidence(
                ctx,
                &config.epic_id,
                "assurance-final-inspection-failed",
                None,
                error.message.clone(),
                Some(json!({
                    "runId": state.run_id,
                    "initialSha": state.integration_sha,
                    "draftPr": state.pr,
                    "errorCode": error.code,
                    "recoverable": error.recoverable,
                })),
            )
            .await?;
            return Ok(ReconcileAction::Stop(stopped));
        }
    };
    let findings = crate::core::drive::latest_review_findings(run);
    let severe = findings
        .iter()
        .any(|finding| matches!(finding.severity, Severity::Blocker | Severity::High));
    let exact = local_sha == remote_sha && remote_sha == pr_sha && pr_sha == gate_sha;
    let pr_exact = pr.state == "OPEN"
        && pr.is_draft
        && pr.head_ref_name == config.integration_branch
        && pr.base_ref_name == config.base_ref;
    let fix_packets = run
        .packets
        .iter()
        .filter_map(|packet| forged_proto::stored_packet(packet).ok())
        .filter(|packet| {
            packet
                .execution
                .as_ref()
                .is_some_and(|execution| execution.purpose == SeatPurpose::Fix)
        })
        .count();
    let fix_changed_sha = fix_packets == 0 || local_sha != state.integration_sha;
    let gate_passed = gate.get("passed").and_then(Value::as_bool).unwrap_or(false);
    if !exact || !pr_exact || !fix_changed_sha || !gate_passed || severe {
        let mismatch_evidence = json!({
            "runId": state.run_id,
            "initialSha": state.integration_sha,
            "localSha": local_sha,
            "remoteSha": remote_sha,
            "prSha": pr_sha,
            "gate": gate,
            "pr": {
                "number": pr.number,
                "state": pr.state,
                "isDraft": pr.is_draft,
                "head": pr.head_ref_name,
                "base": pr.base_ref_name,
                "url": pr.url,
            },
            "fixPackets": fix_packets,
            "fixChangedSha": fix_changed_sha,
            "findings": findings,
        });
        if replaying_finalization {
            let drift_body = format!(
                "Epic {} has not completed integrated assurance.\n\n## Assurance drift\n\nFinal binding verification failed during crash recovery. Do not treat this pull request as assured.\n\n```json\n{}\n```",
                config.epic_id,
                serde_json::to_string_pretty(&mismatch_evidence)
                    .map_err(|error| Failure::internal(error.to_string()))?,
            );
            forged_git::GhClient::new()
                .with_host_opt(remote.gh_host())
                .update_pr_body(&slug, number, &drift_body)
                .await?;
        }
        let stopped = require_input_with_evidence(
            ctx,
            &config.epic_id,
            "assurance-final-evidence-mismatch",
            None,
            "integrated assurance did not bind one clean exact draft PR head",
            Some(mismatch_evidence),
        )
        .await?;
        return Ok(ReconcileAction::Stop(stopped));
    }
    let reviewers = run
        .packets
        .iter()
        .filter_map(|packet| forged_proto::stored_packet(packet).ok())
        .filter_map(|packet| {
            let execution = packet.execution?;
            matches!(
                execution.purpose,
                SeatPurpose::Review | SeatPurpose::Synthesis
            )
            .then(|| {
                json!({
                    "packetId": packet.packet_id,
                    "stageId": execution.stage_id,
                    "seatId": execution.seat_id,
                    "roleId": execution.role_id,
                    "purpose": execution.purpose,
                    "round": execution.round,
                })
            })
        })
        .collect::<Vec<_>>();
    let evidence = json!({
        "schema": "forged.epic-assurance.result/1",
        "epicId": config.epic_id,
        "runId": state.run_id,
        "rootContract": config.root_fields,
        "waves": view.waves,
        "planningCycles": view.planning.iter().map(|(child, planning)| json!({
            "childId": child,
            "runId": planning.run_id,
            "generation": planning.generation,
            "integrationSha": planning.integration_sha,
            "result": planning.applied,
        })).collect::<Vec<_>>(),
        "children": view.children.iter().map(|(child, child_state)| json!({
            "childId": child,
            "runId": child_state.run_id,
            "wave": child_state.wave,
            "merged": child_state.merged,
        })).collect::<Vec<_>>(),
        "draftPr": {
            "number": pr.number,
            "url": pr.url,
            "head": pr.head_ref_name,
            "base": pr.base_ref_name,
            "isDraft": pr.is_draft,
        },
        "gate": gate,
        "reviewers": reviewers,
        "findings": findings,
        "disposition": "approved-clean",
        "terminalSha": local_sha,
    });
    let body = format!(
        "Epic {} executed and integrally assured by forged.\n\n## Exact terminal evidence\n\n```json\n{}\n```",
        config.epic_id,
        serde_json::to_string_pretty(&evidence)
            .map_err(|error| Failure::internal(error.to_string()))?,
    );
    let epic_id = config.epic_id.clone();
    let slug_for_effect = slug.clone();
    let evidence_for_event = evidence.clone();
    let repo_for_effect = config.repo.clone();
    let branch_for_effect = config.integration_branch.clone();
    let base_for_effect = config.base_ref.clone();
    let host_for_effect = remote.gh_host().map(str::to_owned);
    let expected_sha = local_sha.clone();
    let worktree_for_effect = ctx.config.worktree(&state.run_id);
    let finalized = safe_effect(
        ctx,
        "epic_pr_finalize",
        key,
        &config.epic_id,
        json!({"pr": number, "headSha": local_sha, "bodySha256": bytes_digest(body.as_bytes())}),
        move |operation| async move {
            let gh = forged_git::GhClient::new().with_host_opt(host_for_effect);
            // A prior process may have crashed after publishing approval but
            // before sealing ASSURANCE_COMPLETED. Clear that claim before
            // every replayable binding check so drift can never strand stale
            // approval text on the durable external PR.
            if !replaying_finalization {
                gh.update_pr_body(&slug_for_effect, number, &pending_body)
                    .await?;
            }
            let mut approval_published = false;
            let verified_pr = loop {
                let inspected: Result<_, Failure> = async {
                    let final_remote_sha = forged_git::remote_branch_sha(
                        Path::new(&repo_for_effect),
                        &branch_for_effect,
                    )
                    .await?;
                    let final_pr = gh.pr_view(&slug_for_effect, number).await?;
                    let final_pr_sha = gh.pr_head_sha(&slug_for_effect, number).await?;
                    let final_local_sha = git_head(&worktree_for_effect).await?;
                    Ok((
                        final_local_sha,
                        final_remote_sha,
                        final_pr,
                        final_pr_sha,
                    ))
                }
                .await;
                let (final_local_sha, final_remote_sha, final_pr, final_pr_sha) = match inspected {
                    Ok(inspected) => inspected,
                    Err(error) => {
                        if approval_published {
                            let failed_body = format!(
                                "Epic {epic_id} has not completed integrated assurance.\n\n## Assurance inspection failed\n\nFinal binding verification failed after approval publication. Do not treat this pull request as assured.\n\nError: `{}`",
                                error.message,
                            );
                            gh.update_pr_body(&slug_for_effect, number, &failed_body)
                                .await?;
                        }
                        return Err(error);
                    }
                };
                if final_local_sha != expected_sha
                    || final_remote_sha != expected_sha
                    || final_pr_sha != expected_sha
                    || final_pr.state != "OPEN"
                    || !final_pr.is_draft
                    || final_pr.head_ref_name != branch_for_effect
                    || final_pr.base_ref_name != base_for_effect
                {
                    let drift_evidence = json!({
                        "runId": evidence_for_event["runId"],
                        "expectedSha": expected_sha,
                        "localSha": final_local_sha,
                        "remoteSha": final_remote_sha,
                        "prSha": final_pr_sha,
                        "pr": {
                            "number": final_pr.number,
                            "state": final_pr.state,
                            "isDraft": final_pr.is_draft,
                            "head": final_pr.head_ref_name,
                            "base": final_pr.base_ref_name,
                            "url": final_pr.url,
                        },
                    });
                    let drift_body = format!(
                        "Epic {epic_id} has not completed integrated assurance.\n\n## Assurance drift\n\nFinal binding verification failed. Do not treat this pull request as assured.\n\n```json\n{}\n```",
                        serde_json::to_string_pretty(&drift_evidence)
                            .map_err(|error| Failure::internal(error.to_string()))?,
                    );
                    gh.update_pr_body(&slug_for_effect, number, &drift_body)
                        .await?;
                    let stopped = require_input_with_evidence(
                        ctx,
                        &epic_id,
                        "assurance-finalization-drift",
                        None,
                        "draft PR or integration branch moved during assurance finalization",
                        Some(drift_evidence),
                    )
                    .await?;
                    return Ok(json!({"inputRequired": stopped}));
                }
                if approval_published {
                    break final_pr;
                }
                let published: Result<_, Failure> = gh
                    .update_pr_body(&slug_for_effect, number, &body)
                    .await
                    .map_err(Into::into);
                if let Err(error) = published {
                    let failed_body = format!(
                        "Epic {epic_id} has not completed integrated assurance.\n\n## Assurance publication failed\n\nThe approval body could not be durably verified. Do not treat this pull request as assured.\n\nError: `{}`",
                        error.message,
                    );
                    gh.update_pr_body(&slug_for_effect, number, &failed_body)
                        .await?;
                    return Err(error);
                }
                approval_published = true;
            };
            crate::failpoint::hit("epic.assurance.pr-body.after");
            let event = json!({
                "transitionId": operation,
                "pr": {
                    "number": verified_pr.number,
                    "url": verified_pr.url,
                    "head": verified_pr.head_ref_name,
                    "base": verified_pr.base_ref_name,
                    "isDraft": verified_pr.is_draft,
                },
                "evidence": evidence_for_event,
            });
            Ok(event)
        },
    )
    .await;
    let value = match finalized {
        Ok(value) if value.get("inputRequired").is_some() => {
            return Ok(ReconcileAction::Stop(value));
        }
        Ok(value) => value,
        Err(error) => {
            let stopped = require_input_with_evidence(
                ctx,
                &config.epic_id,
                "assurance-finalization-failed",
                None,
                error.message.clone(),
                Some(json!({
                    "runId": state.run_id,
                    "expectedSha": local_sha,
                    "pr": number,
                    "errorCode": error.code,
                    "recoverable": error.recoverable,
                })),
            )
            .await?;
            return Ok(ReconcileAction::Stop(stopped));
        }
    };
    // The replayable external effect is sealed before its cleanup checkpoint.
    // This event is nonterminal; ASSURANCE_COMPLETED lands only after the
    // assurance worktree has been retired.
    append(ctx, &config.epic_id, ASSURANCE_FINALIZED, value.clone()).await?;
    crate::failpoint::hit("epic.assurance.finalized.after");
    if let Some(input) = complete_assurance_cleanup(ctx, view, &value).await? {
        return Ok(ReconcileAction::Stop(json!({"inputRequired": input})));
    }
    Ok(ReconcileAction::Stop(
        json!({"finalPr": state.pr, "assurance": value}),
    ))
}
