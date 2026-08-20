//! The non-drive core functions: doctor, init, run start/status, packet
//! lifecycle, gate run, reconcile, usage, work list, events, worktree
//! retire.

use std::collections::{BTreeMap, BTreeSet};
use std::path::{Component, Path, PathBuf};

use forged_gate::GateRequest;
use forged_ledger::{
    EffectClass, InventorySnapshot, InventoryUsage, InventoryUsageSelection, NewRun,
    NewRunDefinition, OperationState, RunState,
};
use forged_provider::{CodexDriver, ProviderDriver};
use forged_types::{
    request_sha256, AttentionCondition, AttentionItemV1, AttentionResolutionDisposition,
    AttentionState, ErrorCode, ExecutionPackageV1, OperationRequest, OperationResponse, RunId,
    WorkIdentityContextV1, WorkIdentitySubjectKind, WorkPacket, WorkRefKind, WorkRefV1,
};
use serde_json::{json, Value};

use crate::adapters::ports::{report_json, ForgedPorts};
use crate::config::{now_iso, stage_str};
use crate::core::{
    default_key, derive_key, epic, err_response, fenced, key_absent, ok_response, on_ledger,
    param_opt_str, param_str, read_only, session_claimant, split_packet_key, Ctx, Failure,
};

// ---------------------------------------------------------------- doctor

/// `doctor` — read-only: `run_doctor`'s probes plus this slice's own.
pub async fn doctor(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("doctor", req, || async {
        let mut probes: Vec<Value> = Vec::new();
        let doctor_cfg = forged_beads::DoctorConfig {
            bd: ctx.config.bd_config(),
            scratch_root: ctx.config.anvil_home.join("doctor-scratch"),
            herdr_sock: ctx.config.herdr_sock.clone(),
        };
        for probe in forged_beads::run_doctor(doctor_cfg).await {
            probes.push(json!({
                "name": probe.name,
                "ok": probe.ok,
                "detail": probe.detail,
            }));
        }
        // This slice's own probes.
        let ledger_ok = on_ledger(&ctx.ledger, |l| l.list_runs()).await;
        probes.push(json!({
            "name": "ledger-openable",
            "ok": ledger_ok.is_ok(),
            "detail": match &ledger_ok {
                Ok(runs) => format!(
                    "open at {} ({} runs)",
                    ctx.config.db_path.display(),
                    runs.len()
                ),
                Err(f) => f.message.clone(),
            },
        }));
        for binary in ["claude", "codex"] {
            let found = on_path(binary);
            probes.push(json!({
                "name": format!("provider-{binary}"),
                "ok": found.is_some(),
                "detail": found
                    .map(|p| p.display().to_string())
                    .unwrap_or_else(|| format!("{binary} not found on PATH")),
            }));
        }
        let gh = gh_auth_status().await;
        probes.push(json!({
            "name": "gh-authenticated",
            "ok": gh.is_ok(),
            "detail": match gh {
                Ok(detail) | Err(detail) => detail,
            },
        }));
        probes.push(json!({
            "name": "config-file",
            "ok": true,
            "detail": if ctx.config.config_file_read {
                format!("read {}", ctx.config.config_path.display())
            } else {
                format!(
                    "{} absent; every key at its documented default",
                    ctx.config.config_path.display()
                )
            },
        }));
        let (service_ok, service_detail) = crate::runtime::doctor_probe(&ctx.config).await;
        probes.push(json!({
            "name": "supervisor-service",
            "ok": service_ok,
            "detail": service_detail,
        }));
        Ok(json!({"probes": probes}))
    })
    .await
}

/// Probe `gh`: present AND authenticated. Presence alone is not the
/// question — every PR step this slice drives goes through an authenticated
/// `gh`, so the probe runs `gh auth status` against the real environment
/// and reads its exit code, the same convention the sibling doctors follow.
async fn gh_auth_status() -> Result<String, String> {
    let Some(path) = on_path("gh") else {
        return Err("gh not found on PATH".to_owned());
    };
    let out = tokio::process::Command::new(&path)
        .args(["auth", "status"])
        .stdin(std::process::Stdio::null())
        .output()
        .await
        .map_err(|e| format!("{} auth status: {e}", path.display()))?;
    if out.status.success() {
        Ok(format!("{} is authenticated", path.display()))
    } else {
        let detail = String::from_utf8_lossy(&out.stderr);
        let detail = detail.trim();
        let detail = if detail.is_empty() {
            String::from_utf8_lossy(&out.stdout).trim().to_owned()
        } else {
            detail.to_owned()
        };
        Err(format!("gh auth status failed: {detail}"))
    }
}

/// PATH lookup for a provider binary — presence only, nothing spawned.
fn on_path(binary: &str) -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    std::env::split_paths(&path)
        .map(|dir| dir.join(binary))
        .find(|candidate| candidate.is_file())
}

// ------------------------------------------------------------------ init

/// `init` — idempotent and bd-neutral: create `<anvil_home>/runs`, write
/// the default config when absent, run migrations (the open ledger already
/// did), and report the resolved paths. Touches no bd store.
pub async fn init(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    default_key(req, derive_key("init", None, None, None));
    fenced(
        ctx,
        "init",
        EffectClass::SafeRetry,
        req,
        None,
        |_op| async {
            let mut created: Vec<String> = Vec::new();
            if !ctx.config.runs_root.exists() {
                std::fs::create_dir_all(&ctx.config.runs_root)
                    .map_err(|e| Failure::internal(format!("creating runs root: {e}")))?;
                created.push("runs".to_owned());
            }
            if !ctx.config.config_path.exists() {
                let text = ctx.config.default_document().map_err(Failure::internal)?;
                if let Some(parent) = ctx.config.config_path.parent() {
                    std::fs::create_dir_all(parent)
                        .map_err(|e| Failure::internal(format!("creating config dir: {e}")))?;
                }
                std::fs::write(&ctx.config.config_path, text)
                    .map_err(|e| Failure::internal(format!("writing config: {e}")))?;
                created.push(
                    ctx.config
                        .config_path
                        .file_name()
                        .and_then(|name| name.to_str())
                        .unwrap_or("config.yaml")
                        .to_owned(),
                );
            }
            // The ledger was opened (and migrated) when this process started;
            // exercise it once so init proves the store answers.
            on_ledger(&ctx.ledger, |l| l.list_runs()).await?;
            Ok(json!({
                "anvil_home": ctx.config.anvil_home.to_string_lossy(),
                "runs_root": ctx.config.runs_root.to_string_lossy(),
                "db_path": ctx.config.db_path.to_string_lossy(),
                "config_path": ctx.config.config_path.to_string_lossy(),
                "created": created,
            }))
        },
    )
    .await
}

// ------------------------------------------------------------- run start

/// Resolve the Bead as work, not merely as a bag of spec fields.
///
/// `bd ready` is the authority for dependency readiness. Reading the issue
/// first makes the refusal useful (status and type), while the frontier read
/// prevents an open issue with active blockers from being dispatched. A
/// non-code Bead has an explicit route instead of being forced through a
/// commit-and-PR protocol that cannot represent its correct result.
async fn ready_slice_bead(ctx: &Ctx, bead: &str) -> Result<forged_beads::IssueSummary, Failure> {
    let issue = super::spec::read_bead(ctx, bead).await?;
    if issue.status != "open" {
        return Err(Failure::invalid(format!(
            "bead {bead} is {:?}, not open and ready",
            issue.status
        )));
    }
    match issue.issue_type.as_str() {
        "epic" => {
            return Err(Failure::invalid(format!(
                "bead {bead} is an epic; use `forged epic start`"
            )))
        }
        "chore" | "decision" | "milestone" => {
            return Err(Failure::invalid(format!(
                "bead {bead} is a no-diff {}; complete it directly through Beads, not slice/v1",
                issue.issue_type
            )))
        }
        "bug" | "feature" | "task" | "story" | "spike" => {}
        other => {
            return Err(Failure::invalid(format!(
                "bead {bead} has unsupported issue type {other:?}"
            )))
        }
    }
    let ready = forged_beads::ready_issues(&ctx.config.bd_config())
        .await
        .map_err(|error| super::spec::read_failure("reading the Beads ready frontier", error))?;
    if !ready.iter().any(|candidate| candidate.id == bead) {
        return Err(Failure::invalid(format!(
            "bead {bead} is absent from `bd ready`; resolve its blockers before starting a run"
        )));
    }
    Ok(issue)
}

/// `run start` — mint the RunId from the bead id (or the epic scheduler's
/// explicit child generation id) and fill `NewRun` from the config plus the
/// `--repo` and `--base-ref` arguments. The spec comes from the bead;
/// `--spec <path>` is the deprecated file route, honored for one release.
pub async fn run_start(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let compiled = match ctx.config.compile_definition(
        param_opt_str(&req.params, "profile"),
        param_opt_str(&req.params, "roster"),
    ) {
        Ok(compiled) => compiled,
        Err(errors) => {
            return err_response(
                &derive_key("run_start", None, None, None),
                &Failure::invalid(format!(
                    "execution definition is invalid: {}",
                    serde_json::to_string(&errors)
                        .unwrap_or_else(|_| "validation failed".to_owned())
                )),
            )
        }
    };
    run_start_with_definition(ctx, req, compiled).await
}

/// Start a run from an owned, already-compiled definition. This is the
/// epic scheduler boundary: child creation never resolves mutable authoring
/// names again.
pub(crate) async fn run_start_with_definition(
    ctx: &Ctx,
    req: &mut OperationRequest,
    compiled: crate::config::CompiledDefinition,
) -> OperationResponse {
    let bead = match param_str(&req.params, "bead") {
        Ok(v) => v.to_owned(),
        Err(f) => return err_response(&derive_key("run_start", None, None, None), &f),
    };
    let run_name = param_opt_str(&req.params, "run").unwrap_or(&bead);
    let run_id = match RunId::new(run_name.to_owned()) {
        Ok(id) => id,
        Err(e) => {
            return err_response(
                &derive_key("run_start", None, None, None),
                &Failure::invalid(format!("bead id does not mint a valid run id: {e}")),
            )
        }
    };
    default_key(
        req,
        derive_key("run_start", Some(run_id.as_str()), None, None),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.as_str().to_owned());
    }
    // Pre-policy binaries fenced run_start before packageSha256 joined the
    // request. A terminal row with that exact legacy hash must replay its
    // stored response verbatim; only new/current operations use the augmented
    // request identity below.
    let legacy_hash = match request_sha256(req) {
        Ok(hash) => hash,
        Err(error) => {
            return err_response(
                &req.idempotency_key,
                &Failure::invalid(format!("params cannot be canonicalized: {error}")),
            )
        }
    };
    let existing = {
        let key = req.idempotency_key.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.find_operation("run_start", &key)
        })
        .await
    };
    match existing {
        Ok(Some(row))
            if row.state == OperationState::Terminal && row.request_sha256 == legacy_hash =>
        {
            return fenced(
                ctx,
                "run_start",
                EffectClass::SafeRetry,
                req,
                None,
                |_operation| async {
                    Err(Failure::internal(
                        "terminal legacy run_start replay unexpectedly executed",
                    ))
                },
            )
            .await;
        }
        Ok(_) => {}
        Err(error) => return err_response(&req.idempotency_key, &error),
    }
    req.params.insert(
        "packageSha256".to_owned(),
        Value::String(compiled.package_sha256.clone()),
    );
    match recover_applied_run_start(ctx, req, &run_id).await {
        Ok(Some(response)) => return response,
        Ok(None) => {}
        Err(error) => return err_response(&req.idempotency_key, &error),
    }
    let params = req.params.clone();
    fenced(ctx, "run_start", EffectClass::SafeRetry, req, None, {
        move |operation_id| async move {
            let repo = super::work_identity::canonical_repository(param_str(&params, "repo")?)?;
            let spec = param_opt_str(&params, "spec").map(str::to_owned);
            let issue = ready_slice_bead(ctx, &bead).await?;
            // The spec source is settled BEFORE the run row exists: a bead
            // with no spec, or a spec path that is not there, must never
            // reach a seat as an empty spec.
            let source = match &spec {
                Some(path) => {
                    if !Path::new(path).exists() {
                        return Err(Failure::invalid(format!("spec {path:?} does not exist")));
                    }
                    tracing::warn!(
                        bead = %bead,
                        spec = %path,
                        "--spec is deprecated: the bead's own fields are the spec"
                    );
                    super::spec::SpecSource::File(path.clone())
                }
                None => {
                    // Resolving proves the bead carries a spec, and names
                    // every empty field when it does not.
                    super::spec::resolve_issue(&issue)?;
                    super::spec::SpecSource::Bead(bead.clone())
                }
            };
            let base_ref = match param_opt_str(&params, "baseRef") {
                Some(base) => base.to_owned(),
                None => default_branch_of(&repo).await,
            };
            let branch = format!("forged/{run_id}");
            let new_run = NewRun {
                run_id: run_id.clone(),
                bead_id: bead.clone(),
                repo: repo.clone(),
                base_ref: base_ref.clone(),
                branch: branch.clone(),
            };
            let package = compiled.package.clone();
            let package_sha256 = compiled.package_sha256.clone();
            let definition = NewRunDefinition {
                package: compiled.package,
                package_sha256: compiled.package_sha256,
                compatibility_roster: compiled.compatibility_roster,
            };
            // Persist the spec SOURCE for packet building — the run row has
            // no spec column, and every process must resolve the same one.
            // `specPath` stays in the payload for the deprecated file route,
            // so an in-flight run started by an older binary still reads.
            let project = super::work_identity::context_from_params(&params, "project");
            let epic = super::work_identity::context_from_params(&params, "epic");
            let identity = super::work_identity::durable_identity(
                WorkIdentitySubjectKind::Run,
                run_id.as_str(),
                &bead,
                Some(&issue.title),
                issue.revision.as_deref(),
                Some(&repo),
                project,
                epic,
            )?;
            let payload = match &source {
                super::spec::SpecSource::File(path) => json!({
                    "runId": run_id.as_str(),
                    "source": "file",
                    "specPath": path,
                    "deprecated": true,
                    "beadId": bead,
                    "beadTitle": identity.bead.title.clone(),
                    "beadRevision": issue.revision,
                    "repo": repo,
                    "operationId": operation_id,
                    "issueType": issue.issue_type,
                    "metadata": issue.metadata,
                    "project": identity.project.clone(),
                    "epic": identity.epic.clone(),
                }),
                super::spec::SpecSource::Bead(bead_id) => json!({
                    "runId": run_id.as_str(),
                    "source": "bead",
                    "beadId": bead_id,
                    "beadTitle": identity.bead.title.clone(),
                    "beadRevision": issue.revision,
                    "repo": repo,
                    "operationId": operation_id,
                    "issueType": issue.issue_type,
                    "metadata": issue.metadata,
                    "project": identity.project.clone(),
                    "epic": identity.epic.clone(),
                }),
            };
            let row = on_ledger(&ctx.ledger, move |ledger| {
                ledger.create_run_with_identity(new_run, definition, payload, identity)
            })
            .await?;
            crate::failpoint::hit("run.start.bundle.after");
            Ok(json!({
                "run_id": row.run_id,
                "bead_id": row.bead_id,
                "branch": branch,
                "base_ref": base_ref,
                "protocol_ref": package.protocol_ref,
                "profile_ref": package.profile_ref,
                "roster_ref": package.roster_ref,
                "package_sha256": package_sha256,
                "profile_sha256": package.profile_sha256,
                "roster_sha256": package.roster_sha256,
            }))
        }
    })
    .await
}

async fn recover_applied_run_start(
    ctx: &Ctx,
    request: &OperationRequest,
    run_id: &RunId,
) -> Result<Option<OperationResponse>, Failure> {
    let name = "run_start".to_owned();
    let key = request.idempotency_key.clone();
    let row = on_ledger(&ctx.ledger, move |ledger| {
        ledger.find_operation(&name, &key)
    })
    .await?;
    let Some(row) = row.filter(|row| row.state == OperationState::InProgress) else {
        return Ok(None);
    };
    let hash = request_sha256(request)
        .map_err(|error| Failure::invalid(format!("params cannot be canonicalized: {error}")))?;
    if row.request_sha256 != hash {
        return Err(Failure::refused(
            ErrorCode::IdempotencyConflict,
            "run start key was stored with a different request",
        ));
    }
    let Some(result) = replay_atomic_run_start(ctx, run_id, &row.operation_id).await? else {
        return Ok(None);
    };
    let response = ok_response(&row.operation_id, false, result);
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

/// Recover the applied side of an interrupted atomic run creation without
/// consulting Beads. The operation id is written into `forged.run.spec` in
/// the same transaction as the run and identity, so a matching event proves
/// this exact safe-retry operation committed its effect.
async fn replay_atomic_run_start(
    ctx: &Ctx,
    run_id: &RunId,
    operation_id: &str,
) -> Result<Option<Value>, Failure> {
    let run_name = run_id.as_str().to_owned();
    let operation_id = operation_id.to_owned();
    let events = on_ledger(&ctx.ledger, {
        let run_name = run_name.clone();
        move |ledger| ledger.list_events(Some(&run_name), 0, 4096)
    })
    .await?;
    let landed = events.iter().any(|event| {
        event.kind == "forged.run.spec"
            && serde_json::from_str::<Value>(&event.payload_json)
                .ok()
                .and_then(|payload| {
                    payload
                        .get("operationId")
                        .and_then(Value::as_str)
                        .map(|stored| stored == operation_id)
                })
                .unwrap_or(false)
    });
    if !landed {
        return Ok(None);
    }
    let identity = on_ledger(&ctx.ledger, {
        let run_name = run_name.clone();
        move |ledger| ledger.get_work_identity(WorkIdentitySubjectKind::Run, &run_name)
    })
    .await?
    .ok_or_else(|| Failure::internal("atomic run creation event has no durable identity"))?;
    identity
        .validate_for_storage()
        .map_err(|error| Failure::internal(format!("stored work identity is invalid: {error}")))?;
    let (run, definition) = on_ledger(&ctx.ledger, move |ledger| {
        Ok((
            ledger.get_run(&run_name)?,
            ledger.get_run_definition(&run_name)?,
        ))
    })
    .await?;
    let definition = definition
        .ok_or_else(|| Failure::internal("atomic run creation has no durable definition"))?;
    let package: ExecutionPackageV1 = serde_json::from_str(&definition.package_json)
        .map_err(|error| Failure::internal(format!("stored execution package: {error}")))?;
    Ok(Some(json!({
        "run_id": run.run_id,
        "bead_id": run.bead_id,
        "branch": run.branch,
        "base_ref": run.base_ref,
        "protocol_ref": package.protocol_ref,
        "profile_ref": package.profile_ref,
        "roster_ref": package.roster_ref,
        "package_sha256": definition.package_sha256,
        "profile_sha256": definition.profile_sha256,
        "roster_sha256": definition.roster_sha256,
    })))
}

/// The repo's default branch, from its `origin/HEAD` symref; falls back to
/// `main`.
pub(crate) async fn default_branch_of(repo: &str) -> String {
    let out = tokio::process::Command::new("git")
        .arg("-C")
        .arg(repo)
        .args(["symbolic-ref", "--short", "refs/remotes/origin/HEAD"])
        .stdin(std::process::Stdio::null())
        .output()
        .await;
    if let Ok(out) = out {
        if out.status.success() {
            let name = String::from_utf8_lossy(&out.stdout).trim().to_owned();
            if let Some(bare) = name.strip_prefix("origin/") {
                if !bare.is_empty() {
                    return bare.to_owned();
                }
            }
        }
    }
    "main".to_owned()
}

// ------------------------------------------------------------ run status

/// `run status` — read-only projection of one run.
pub async fn run_status(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("run_status", req, || async {
        let run_id = param_str(&req.params, "run")?;
        let view = super::drive::project(ctx, run_id).await?;
        let run_id_owned = run_id.to_owned();
        let (definition, revision, protocol_terminal, admission_decisions) =
            on_ledger(&ctx.ledger, move |ledger| {
                let protocol_terminal = ledger
                    .list_events(Some(&run_id_owned), 0, 4096)?
                    .into_iter()
                    .find(|event| event.kind == "run.protocol-terminal")
                    .map(|event| {
                        serde_json::from_str::<Value>(&event.payload_json)
                            .map_err(forged_ledger::LedgerError::from)
                    })
                    .transpose()?
                    .and_then(|payload| payload.get("terminal").cloned());
                // Latest decision per packet: a parked run's deferral reason
                // is durable status, not something only the controller knows.
                let admission_decisions = ledger
                    .latest_admission_decisions(
                        Some(forged_types::AdmissionSubjectKind::Packet),
                        None,
                    )?
                    .into_iter()
                    .filter(|decision| {
                        split_packet_key(&decision.subject_id)
                            .is_ok_and(|(packet_run, _, _)| packet_run == run_id_owned)
                    })
                    .collect::<Vec<_>>();
                Ok((
                    ledger.get_run_definition(&run_id_owned)?,
                    ledger.latest_roster_revision(&run_id_owned)?,
                    protocol_terminal,
                    admission_decisions,
                ))
            })
            .await?;
        let action = forged_proto::advance(&view);
        let controller = super::handoff::controller_status(ctx, run_id).await?;
        let identity =
            super::work_identity::load(ctx, WorkIdentitySubjectKind::Run, run_id).await?;
        let herdr_layout = super::herdr_layout::status(
            ctx,
            forged_types::HerdrLayoutSubjectV1 {
                kind: forged_types::HerdrLayoutSubjectKind::Run,
                id: run_id.to_owned(),
            },
        )
        .await;
        let expected_assignee = crate::core::run_holder(&view.run.bead_id);
        let claim_health = match forged_beads::show_issue(&ctx.config.bd_config(), &view.run.bead_id).await {
            Ok(issue) => {
                let holder_mismatch = issue
                    .assignee
                    .as_deref()
                    .is_some_and(|holder| {
                        holder != expected_assignee && holder != crate::core::FRONTIER_HOLDER
                    });
                let controller_dead = !controller.is_null()
                    && matches!(
                        controller.get("state").and_then(Value::as_str),
                        Some("dead" | "vanished" | "exited")
                    );
                let execution_live = !view.live_attempts.is_empty()
                    || controller.get("state").and_then(Value::as_str) == Some("running");
                let awaiting_delivery = matches!(
                    view.run.terminal_outcome,
                    Some(
                        forged_ledger::RunOutcome::Clean
                            | forged_ledger::RunOutcome::AcceptedRisk
                    )
                );
                let stale = issue.status == "in_progress"
                    && (holder_mismatch
                        || (!awaiting_delivery
                            && (!execution_live
                                || view.run.state == RunState::Stopped
                                || controller_dead)));
                let detail = if holder_mismatch {
                    format!(
                        "Bead is assigned to {}, expected {expected_assignee}",
                        issue.assignee.as_deref().unwrap_or("nobody")
                    )
                } else if awaiting_delivery {
                    "Reviewed delivery retains its Beads claim until the PR lands".to_owned()
                } else if stale {
                    "Bead remains in_progress although durable execution is no longer live".to_owned()
                } else {
                    "Live Beads claim agrees with execution evidence".to_owned()
                };
                json!({
                    "known": true,
                    "status": issue.status,
                    "assignee": issue.assignee,
                    "expectedAssignee": expected_assignee,
                    "staleInProgress": stale,
                    "detail": detail,
                })
            }
            Err(error) => json!({
                "known": false,
                "status": Value::Null,
                "assignee": Value::Null,
                "expectedAssignee": expected_assignee,
                "staleInProgress": false,
                "detail": format!("Beads unavailable: {error}"),
            }),
        };
        let definition = match definition {
            Some(row) => {
                let package: forged_types::ExecutionPackageV1 = serde_json::from_str(&row.package_json)
                    .map_err(|error| Failure::internal(format!("stored execution package: {error}")))?;
                json!({
                "protocolRef": serde_json::from_str::<Value>(&row.protocol_ref_json)
                    .map_err(|error| Failure::internal(format!("stored protocol ref: {error}")))?,
                "profileRef": serde_json::from_str::<Value>(&row.profile_ref_json)
                    .map_err(|error| Failure::internal(format!("stored profile ref: {error}")))?,
                "rosterRef": serde_json::from_str::<Value>(&row.roster_ref_json)
                    .map_err(|error| Failure::internal(format!("stored roster ref: {error}")))?,
                "packageSha256": row.package_sha256,
                "profileSha256": row.profile_sha256,
                "rosterSha256": row.roster_sha256,
                "rosterRevision": revision.as_ref().map(|value| value.revision),
                "activeRosterRef": revision.as_ref()
                    .map(|value| serde_json::from_str::<Value>(&value.roster_ref_json))
                    .transpose()
                    .map_err(|error| Failure::internal(format!("stored roster ref: {error}")))?,
                "activeRosterSha256": revision.as_ref().map(|value| &value.roster_sha256),
                "policy": package.policy,
            })},
            None => Value::Null,
        };
        let execution = view.execution_package.as_ref().map(|package| {
            let active_name = view
                .profile_escalations
                .last()
                .map(|value| value.to.as_str())
                .unwrap_or(package.profile_ref.name.as_str());
            let active_profile = package
                .profile_catalog
                .get(active_name)
                .unwrap_or(&package.profile);
            let mut history = vec![json!({
                "profile": package.profile_ref,
                "trigger": Value::Null,
            })];
            history.extend(view.profile_escalations.iter().map(|value| {
                json!({
                    "profile": {"name": value.to, "version": 1},
                    "from": value.from,
                    "trigger": value.trigger,
                })
            }));
            let candidates = view
                .packets
                .iter()
                .filter_map(|row| {
                    let stored: WorkPacket = forged_proto::stored_packet(row).ok()?;
                    let semantic = stored.execution.clone()?;
                    let selected = super::drive::stored_packet_for_attempt(&view, &row.packet_id)
                        .unwrap_or(stored);
                    Some(json!({
                        "packetId": row.packet_id,
                        "stageId": semantic.stage_id,
                        "seatId": semantic.seat_id,
                        "roleId": semantic.role_id,
                        "purpose": semantic.purpose,
                        "round": semantic.round,
                        "provider": selected.provider_hints.provider,
                        "model": selected.provider_hints.model,
                        "effort": selected.provider_hints.effort,
                    }))
                })
                .collect::<Vec<_>>();
            json!({
                "protocolRef": package.protocol_ref,
                "activeProfileRef": {"name": active_name, "version": 1},
                "profileHistory": history,
                "topology": {
                    "seats": active_profile.seats,
                    "riskContext": active_profile.risk_context,
                    "fixRoundBudget": active_profile.fix_round_budget,
                    "escalateOn": active_profile.escalate_on,
                    "escalateTo": active_profile.escalate_to,
                },
                "candidateSelections": candidates,
            })
        });
        Ok(json!({
            "run": {
                "runId": view.run.run_id,
                "identity": identity,
                "herdrLayout": herdr_layout,
                "beadId": view.run.bead_id,
                "repo": view.run.repo,
                "baseRef": view.run.base_ref,
                "branch": view.run.branch,
                "state": match view.run.state {
                    RunState::Active => "active",
                    RunState::Stopped => "stopped",
                },
                "stopReason": view.run.stop_reason,
                "outcome": view.run.terminal_outcome.map(|value| value.as_str()),
                "delivery": {
                    "pr": view.run.delivery_pr,
                    "sha": view.run.delivery_sha,
                },
                "supersededBy": view.run.superseded_by,
                "claimHealth": claim_health,
                "protocolMode": if view.execution_package.is_some() { "adaptive" } else { "legacy" },
                "definition": definition,
                "execution": execution,
                "packets": view.packets.iter().map(|p| json!({
                    "packetId": p.packet_id,
                    "stage": forged_proto::stored_packet(p)
                        .ok()
                        .and_then(|packet| packet.execution.map(|value| value.stage_id))
                        .unwrap_or_else(|| stage_str(p.stage).to_owned()),
                    "storageLane": stage_str(p.stage),
                    "seq": p.seq,
                })).collect::<Vec<_>>(),
                "liveAttempts": view.live_attempts.iter().map(|a| json!({
                    "attemptId": a.attempt_id,
                    "packetId": a.packet_id,
                    "state": a.state.as_str(),
                    "claimant": a.claimant,
                })).collect::<Vec<_>>(),
                "admission": admission_decisions.iter().map(|decision| json!({
                    "packetId": decision.subject_id,
                    "outcome": decision.outcome,
                    "reason": decision.reason,
                    "nextEligibleWakeAt": decision.next_eligible_wake_at,
                })).collect::<Vec<_>>(),
                "settledOperations": view.settled_operations.iter().map(|o| json!({
                    "name": o.name,
                    "idempotencyKey": o.idempotency_key,
                })).collect::<Vec<_>>(),
                "nextAction": match protocol_terminal {
                    Some(terminal) if view.accepted_risk.is_none() => json!({"stop": terminal}),
                    _ => match &action {
                    forged_proto::NextAction::RunMachine(step) =>
                        json!({"runMachine": step.as_str()}),
                    forged_proto::NextAction::OpenPackets(intents) =>
                        json!({"openPackets": super::drive::intents_json(intents)}),
                    forged_proto::NextAction::AwaitPacket { packet_id, not_before } =>
                        json!({"awaitPacket": {"packetId": packet_id, "notBefore": not_before}}),
                    forged_proto::NextAction::EscalateProfile(escalation) =>
                        json!({"escalateProfile": {
                            "from": escalation.from,
                            "to": escalation.to,
                            "trigger": escalation.trigger,
                        }}),
                        forged_proto::NextAction::Stop(t) =>
                            json!({"stop": super::drive::terminal_json(t)}),
                    },
                },
                "controller": controller,
                "claimHealth": claim_health,
            }
        }))
    })
    .await
}

// ---------------------------------------------------- definition validate

/// Resolve and validate selected definitions without creating a run.
pub async fn definition_validate(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("definition_validate", req, || async {
        let profile = param_opt_str(&req.params, "profile");
        let roster = param_opt_str(&req.params, "roster");
        match ctx.config.compile_definition(profile, roster) {
            Ok(compiled) => {
                let package = compiled.package;
                Ok(json!({
                    "valid": true,
                    "errors": [],
                    "protocolRef": package.protocol_ref,
                    "profileRef": package.profile_ref,
                    "rosterRef": package.roster_ref,
                    "packageSha256": compiled.package_sha256,
                    "profileSha256": package.profile_sha256,
                    "rosterSha256": package.roster_sha256,
                    "roles": package.roster.roles.keys().map(|role| role.as_str()).collect::<Vec<_>>(),
                    "seats": package.profile.seats,
                    "policy": package.policy,
                }))
            }
            Err(errors) => Ok(json!({"valid": false, "errors": errors})),
        }
    })
    .await
}

// ------------------------------------------------------ run revise roster

/// Append an explicit roster revision compiled against the run's stored
/// profile catalog. No current-config profile is consulted.
pub async fn run_revise_roster(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let run_id = match param_str(&req.params, "run") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(&derive_key("run_revise_roster", None, None, None), &error)
        }
    };
    let roster_name = match param_str(&req.params, "roster") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(
                &derive_key("run_revise_roster", Some(&run_id), None, None),
                &error,
            )
        }
    };
    let reason = match param_str(&req.params, "reason") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(
                &derive_key("run_revise_roster", Some(&run_id), Some(&roster_name), None),
                &error,
            )
        }
    };
    let latest = {
        let run_for_lookup = run_id.clone();
        match on_ledger(&ctx.ledger, move |ledger| {
            ledger.latest_roster_revision(&run_for_lookup)
        })
        .await
        {
            Ok(value) => value,
            Err(error) => {
                return err_response(
                    &derive_key("run_revise_roster", Some(&run_id), Some(&roster_name), None),
                    &error,
                )
            }
        }
    };
    let revision = latest
        .as_ref()
        .filter(|row| {
            serde_json::from_str::<forged_types::RosterRef>(&row.roster_ref_json)
                .is_ok_and(|reference| reference.name == roster_name)
                && row.reason == reason
        })
        .map(|row| row.revision)
        .unwrap_or_else(|| {
            latest
                .as_ref()
                .map(|row| row.revision)
                .unwrap_or(0)
                .saturating_add(1)
        });
    default_key(
        req,
        derive_key(
            "run_revise_roster",
            Some(&run_id),
            Some(&roster_name),
            Some(i64::from(revision)),
        ),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    fenced(
        ctx,
        "run_revise_roster",
        EffectClass::SafeRetry,
        req,
        None,
        {
            move |operation| async move {
                let _submit_guard = super::handoff::acquire_run_submit(ctx, &run_id).await?;
                let definition = {
                    let run_id = run_id.clone();
                    on_ledger(&ctx.ledger, move |ledger| {
                        ledger.get_run_definition(&run_id)
                    })
                    .await?
                }
                .ok_or_else(|| Failure::invalid("legacy run has no revisable roster"))?;
                let package: forged_types::ExecutionPackageV1 =
                    serde_json::from_str(&definition.package_json).map_err(|error| {
                        Failure::internal(format!(
                            "stored execution package does not parse: {error}"
                        ))
                    })?;
                let (roster, roster_sha256) = ctx
                    .config
                    .compile_roster_revision(&package, &roster_name)
                    .map_err(|errors| {
                        Failure::invalid(format!(
                            "roster revision is invalid: {}",
                            serde_json::to_string(&errors)
                                .unwrap_or_else(|_| "validation failed".to_owned())
                        ))
                    })?;
                let row = {
                    let run_id = run_id.clone();
                    let digest = roster_sha256.clone();
                    on_ledger(&ctx.ledger, move |ledger| {
                        ledger.append_roster_revision(&run_id, roster, digest, reason, operation)
                    })
                    .await?
                };
                let roster_ref: Value = serde_json::from_str(&row.roster_ref_json)
                    .map_err(|error| Failure::internal(format!("stored roster ref: {error}")))?;
                Ok(json!({
                    "run_id": row.run_id,
                    "revision": row.revision,
                    "roster_ref": roster_ref,
                    "roster_sha256": roster_sha256,
                    "reason": row.reason,
                }))
            }
        },
    )
    .await
}

// ------------------------------------------------------- run accept risk

/// Record the operator's one auditable post-budget decision. Findings come
/// from the frozen run projection rather than caller input, so the evidence
/// accepted is exactly the deduplicated set the final remediation saw.
pub async fn run_accept_risk(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let run_id = match param_str(&req.params, "run") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(&derive_key("run_accept_risk", None, None, None), &error)
        }
    };
    let accepted_by = match param_str(&req.params, "acceptedBy") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        Ok(_) => {
            return err_response(
                &derive_key("run_accept_risk", Some(&run_id), None, None),
                &Failure::invalid("acceptedBy must not be empty"),
            )
        }
        Err(error) => {
            return err_response(
                &derive_key("run_accept_risk", Some(&run_id), None, None),
                &error,
            )
        }
    };
    let rationale = match param_str(&req.params, "rationale") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        Ok(_) => {
            return err_response(
                &derive_key("run_accept_risk", Some(&run_id), Some(&accepted_by), None),
                &Failure::invalid("rationale must not be empty"),
            )
        }
        Err(error) => {
            return err_response(
                &derive_key("run_accept_risk", Some(&run_id), Some(&accepted_by), None),
                &error,
            )
        }
    };
    let view = match super::drive::project(ctx, &run_id).await {
        Ok(value) => value,
        Err(error) => {
            return err_response(
                &derive_key("run_accept_risk", Some(&run_id), Some(&accepted_by), None),
                &error,
            )
        }
    };
    // Exhaustion normally settles the run before an operator can accept its
    // risk. Read the preserved protocol terminal (or an existing acceptance)
    // so the evidence gate survives the stopped state projection.
    let persisted_review_rounds = {
        let event_run = run_id.clone();
        match on_ledger(&ctx.ledger, move |ledger| {
            let mut accepted = None;
            let mut exhausted = None;
            for event in ledger.list_events(Some(&event_run), 0, 4096)? {
                let payload: Value = serde_json::from_str(&event.payload_json)?;
                match event.kind.as_str() {
                    "forged.review.risk_accepted" => {
                        accepted = payload.get("reviewRounds").and_then(Value::as_u64);
                    }
                    "run.protocol-terminal" => {
                        exhausted = payload
                            .pointer("/terminal/reviewBudgetExhausted/reviewRounds")
                            .and_then(Value::as_u64);
                    }
                    _ => {}
                }
            }
            Ok(accepted
                .or(exhausted)
                .and_then(|rounds| u8::try_from(rounds).ok()))
        })
        .await
        {
            Ok(value) => value,
            Err(error) => {
                return err_response(
                    &derive_key("run_accept_risk", Some(&run_id), Some(&accepted_by), None),
                    &error,
                )
            }
        }
    };
    let (review_rounds, acceptance) = match &view.accepted_risk {
        Some(existing)
            if existing.accepted_by == accepted_by && existing.rationale == rationale =>
        {
            let rounds = persisted_review_rounds.unwrap_or_else(|| {
                view.execution_package
                    .as_ref()
                    .map(|package| {
                        let name = view
                            .profile_escalations
                            .last()
                            .map(|event| event.to.as_str())
                            .unwrap_or(package.profile_ref.name.as_str());
                        package
                            .profile_catalog
                            .get(name)
                            .unwrap_or(&package.profile)
                            .fix_round_budget
                            .saturating_add(1)
                    })
                    .unwrap_or(1)
            });
            (rounds, existing.clone())
        }
        Some(_) => {
            return err_response(
                &derive_key("run_accept_risk", Some(&run_id), Some(&accepted_by), None),
                &Failure::invalid("risk was already accepted with different evidence"),
            )
        }
        None => {
            let rounds = match persisted_review_rounds {
                Some(rounds) => rounds,
                None => match forged_proto::advance(&view) {
                    forged_proto::NextAction::Stop(
                        forged_proto::Terminal::ReviewBudgetExhausted { review_rounds, .. },
                    ) => review_rounds,
                    _ => return err_response(
                        &derive_key("run_accept_risk", Some(&run_id), Some(&accepted_by), None),
                        &Failure::invalid(
                            "risk can be accepted only after the review round budget is exhausted",
                        ),
                    ),
                },
            };
            (
                rounds,
                forged_types::AcceptedRisk {
                    accepted_by: accepted_by.clone(),
                    rationale,
                    findings: super::drive::latest_review_findings(&view),
                },
            )
        }
    };
    default_key(
        req,
        derive_key(
            "run_accept_risk",
            Some(&run_id),
            Some(&accepted_by),
            Some(i64::from(review_rounds)),
        ),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    fenced(
        ctx,
        "run_accept_risk",
        EffectClass::SafeRetry,
        req,
        None,
        move |_operation| async move {
            {
                let run_id = run_id.clone();
                let acceptance = acceptance.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.accept_review_risk(&run_id, review_rounds, acceptance)
                })
                .await?;
            }
            let settlement = super::settlement::Settlement {
                outcome: forged_ledger::RunOutcome::AcceptedRisk,
                reason: super::settlement::accepted_risk_reason(&acceptance),
                delivery_pr: None,
                delivery_sha: None,
                superseded_by: None,
            };
            super::settlement::settle(ctx, &run_id, settlement).await?;
            Ok(json!({
                "runId": run_id,
                "reviewRounds": review_rounds,
                "acceptance": acceptance,
            }))
        },
    )
    .await
}

// ----------------------------------------------------------- packet show

/// `packet show` — read-only: the stored packet body plus its attempts.
pub async fn packet_show(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("packet_show", req, || async {
        let packet_id = param_str(&req.params, "packet")?.to_owned();
        let row = {
            let packet_id = packet_id.clone();
            on_ledger(&ctx.ledger, move |l| l.get_packet(&packet_id)).await?
        };
        let packet =
            serde_json::to_value(forged_proto::stored_packet(&row).map_err(|e| {
                Failure::internal(format!("stored packet body does not parse: {e}"))
            })?)
            .map_err(|e| Failure::internal(format!("cannot serialize packet: {e}")))?;
        let view = super::drive::project(ctx, &row.run_id).await?;
        let mut attempts: Vec<Value> = Vec::new();
        if let Some(history) = view.terminal_attempts.get(&packet_id) {
            for t in history {
                attempts.push(json!({
                    "attemptId": t.attempt_id,
                    "state": t.state.as_str(),
                    "failNote": t.fail_note,
                }));
            }
        }
        for a in view
            .live_attempts
            .iter()
            .filter(|a| a.packet_id == packet_id)
        {
            attempts.push(json!({
                "attemptId": a.attempt_id,
                "state": a.state.as_str(),
                "claimant": a.claimant,
            }));
        }
        Ok(json!({"packet": packet, "attempts": attempts}))
    })
    .await
}

// ---------------------------------------------------------- packet claim

/// `packet claim` — fenced SafeRetry claim of one packet under its derived
/// per-attempt session claimant.
pub async fn packet_claim(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let packet_id = match param_str(&req.params, "packet") {
        Ok(p) => p.to_owned(),
        Err(f) => return err_response(&derive_key("packet_claim", None, None, None), &f),
    };
    let (run_id, stage, seq) = match crate::core::split_packet_key(&packet_id) {
        Ok(parts) => parts,
        Err(f) => return err_response(&derive_key("packet_claim", None, None, None), &f),
    };
    default_key(
        req,
        derive_key("packet_claim", Some(&run_id), Some(&stage), Some(seq)),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    fenced(ctx, "packet_claim", EffectClass::SafeRetry, req, None, {
        move |_op| async move {
            let row = {
                let packet_id = packet_id.clone();
                on_ledger(&ctx.ledger, move |l| l.get_packet(&packet_id)).await?
            };
            // The claimant is the PACKET-scoped session identity, not the
            // run's bd lease holder — see `core::session_claimant`.
            let view = super::drive::project(ctx, &row.run_id).await?;
            let packet_admission = super::admission::PacketAdmission {
                packet_id: packet_id.clone(),
                run_id: row.run_id.clone(),
                bead_id: view.run.bead_id.clone(),
            };
            let admission_guard = super::handoff::acquire_packet_submit(
                ctx,
                &packet_admission.packet_id,
                &packet_admission.run_id,
            )
            .await?;
            let admission = super::admission::admit_packet_facts(ctx, &packet_admission).await?;
            if admission.decision.outcome != forged_types::AdmissionOutcome::Admitted {
                return Err(Failure {
                    code: ErrorCode::OperationInProgress,
                    message: format!(
                        "packet {packet_id} deferred by admission: {:?}",
                        admission.decision.reason
                    ),
                    recoverable: true,
                });
            }
            let reservation_id = admission
                .reservation
                .ok_or_else(|| Failure::internal("admitted packet has no capacity reservation"))?
                .reservation_id;
            // ONE spec read for this claim: it answers both the fence the
            // ledger compares and the bytes the seat will read.
            let spec_ref = forged_proto::packet_spec(&row);
            let resolved =
                super::spec::resolve_for_packet(ctx, &spec_ref, &view.run.bead_id).await?;
            let fence = resolved.fence.clone();
            let provider = admission
                .packet_provider_hints
                .as_ref()
                .map(|hints| hints.provider.clone())
                .ok_or_else(|| Failure::internal("packet admission omitted provider facts"))?;
            let claimant = session_claimant(&packet_id, &provider);
            let claimed = {
                let packet_id = packet_id.clone();
                on_ledger(&ctx.ledger, move |l| {
                    l.claim_packet_with_admission(&packet_id, &claimant, &fence, &reservation_id)
                })
                .await?
            };
            crate::failpoint::hit("admission.reservation.transfer.after");
            drop(admission_guard);
            // The claim is what fenced these bytes, so the body is written
            // only once it has succeeded. An external seat on the
            // `packet claim` -> `packet complete` path never enters
            // `run_attempt`, so this is the only thing that puts the spec
            // where its own packet contract says it is.
            //
            // Post-claim and pre-spawn: a failure here settles the attempt
            // under its own token before it propagates (`abandon_claim`),
            // never leaving a `running` row with no process behind it.
            if let Err(failure) = super::spec::assert_pinned(&spec_ref, &resolved)
                .and_then(|()| super::spec::materialize(&resolved, Path::new(&spec_ref.path)))
            {
                return Err(crate::core::abandon_claim(
                    ctx,
                    &packet_id,
                    &claimed.claim_token,
                    failure,
                )
                .await);
            }
            Ok(json!({
                "attempt_id": claimed.attempt_id,
                "claim_token": claimed.claim_token,
            }))
        }
    })
    .await
}

// ------------------------------------------------------- packet complete

/// `packet complete` — fenced HumanAmbiguous result landing through
/// `land_packet_result` (never `Ledger::complete_packet` directly).
pub async fn packet_complete(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let packet_id = match param_str(&req.params, "packet") {
        Ok(p) => p.to_owned(),
        Err(f) => return err_response(&derive_key("packet_complete", None, None, None), &f),
    };
    let (run_id, stage, seq) = match crate::core::split_packet_key(&packet_id) {
        Ok(parts) => parts,
        Err(f) => return err_response(&derive_key("packet_complete", None, None, None), &f),
    };
    default_key(
        req,
        derive_key("packet_complete", Some(&run_id), Some(&stage), Some(seq)),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    let params = req.params.clone();
    fenced(
        ctx,
        "packet_complete",
        EffectClass::HumanAmbiguous,
        req,
        None,
        {
            move |_op| async move {
                let attempt_id = params
                    .get("attempt")
                    .and_then(Value::as_i64)
                    .ok_or_else(|| Failure::invalid("missing required param \"attempt\""))?;
                let claim_token = param_str(&params, "claimToken")?.to_owned();
                let result_value = params
                    .get("result")
                    .cloned()
                    .ok_or_else(|| Failure::invalid("missing required param \"result\""))?;
                let result: forged_types::PacketResult = serde_json::from_value(result_value)
                    .map_err(|e| Failure::invalid(format!("result is not a PacketResult: {e}")))?;
                let ports = ForgedPorts::new(ctx.ledger.clone(), ctx.config.clone());
                let outcome = forged_proto::land_packet_result(
                    &ctx.ledger,
                    &ports,
                    &run_id,
                    &packet_id,
                    attempt_id,
                    &claim_token,
                    &result,
                )
                .await?;
                Ok(match outcome {
                    forged_proto::LandOutcome::Completed => json!({"outcome": "Landed"}),
                    forged_proto::LandOutcome::Quarantined => json!({"outcome": "Quarantined"}),
                })
            }
        },
    )
    .await
}

// ----------------------------------------------------------- packet fail

/// `packet fail` — fenced SafeRetry failure report; the note's prefix decides
/// the classification, byte-exact: `transport:` and `unspawned:` both ride
/// the packet's bounded budget, anything else is semantic. See
/// `forged_proto::classify_failure`.
pub async fn packet_fail(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let packet_id = match param_str(&req.params, "packet") {
        Ok(p) => p.to_owned(),
        Err(f) => return err_response(&derive_key("packet_fail", None, None, None), &f),
    };
    let (run_id, stage, seq) = match crate::core::split_packet_key(&packet_id) {
        Ok(parts) => parts,
        Err(f) => return err_response(&derive_key("packet_fail", None, None, None), &f),
    };
    default_key(
        req,
        derive_key("packet_fail", Some(&run_id), Some(&stage), Some(seq)),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    let params = req.params.clone();
    fenced(ctx, "packet_fail", EffectClass::SafeRetry, req, None, {
        move |_op| async move {
            let claim_token = param_str(&params, "claimToken")?.to_owned();
            let note = param_str(&params, "note")?.to_owned();
            {
                let packet_id = packet_id.clone();
                let claim_token = claim_token.clone();
                let note = note.clone();
                on_ledger(&ctx.ledger, move |l| {
                    l.fail_packet(&packet_id, &claim_token, &note)
                })
                .await?;
            }
            let classification = match forged_proto::classify_failure(&note) {
                forged_proto::FailureKind::Transport => "transport",
                forged_proto::FailureKind::Unspawned => "unspawned",
                forged_proto::FailureKind::Semantic => "semantic",
            };
            Ok(json!({"classification": classification, "note": note}))
        }
    })
    .await
}

// ------------------------------------------------------ packet heartbeat

/// `packet heartbeat` — deliberately unfenced: carries the envelope,
/// defaults its key the way a read does, never touches the operation
/// store. Re-sending one is always safe.
pub async fn packet_heartbeat(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("packet_heartbeat", req, || async {
        let claim_token = param_str(&req.params, "claimToken")?.to_owned();
        on_ledger(&ctx.ledger, move |l| l.heartbeat_attempt(&claim_token)).await?;
        Ok(json!({"renewed": true}))
    })
    .await
}

// -------------------------------------------------------------- gate run

/// `gate run` — fenced SafeRetry gate pass; a failing gate is data in its
/// rows, never an error.
pub async fn gate_run(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let run_id = match param_str(&req.params, "run") {
        Ok(r) => r.to_owned(),
        Err(f) => return err_response(&derive_key("gate_run", None, None, None), &f),
    };
    let stage = param_opt_str(&req.params, "stage")
        .unwrap_or("gate")
        .to_owned();
    default_key(
        req,
        derive_key("gate_run", Some(&run_id), Some(&stage), None),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    let view = match crate::core::drive::project(ctx, &run_id).await {
        Ok(view) => view,
        Err(error) => return err_response(&req.idempotency_key, &error),
    };
    let gate_commands = view.policy.gate_commands;
    fenced(ctx, "gate_run", EffectClass::SafeRetry, req, None, {
        move |op_id| async move {
            let artifacts = ctx
                .config
                .run_dir(&run_id)
                .join("artifacts")
                .join(format!("gate_run-{op_id}"));
            let request = GateRequest::new(gate_commands, ctx.config.worktree(&run_id), artifacts);
            let outcome = forged_gate::run_gates(&request).await?;
            Ok(json!({
                "gates": serde_json::to_value(&outcome.rows)
                    .map_err(|e| Failure::internal(e.to_string()))?,
                "passed": outcome.passed,
            }))
        }
    })
    .await
}

// ------------------------------------------------------------- reconcile

/// `reconcile` — fenced SafeRetry pass of the proto reconciler; the sweep
/// count keys each pass freshly.
pub async fn reconcile(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let run_id = match param_str(&req.params, "run") {
        Ok(r) => r.to_owned(),
        Err(f) => return err_response(&derive_key("reconcile", None, None, None), &f),
    };
    if key_absent(req) {
        // A FRESH nonce per invocation, never a replayable sweep number: see
        // `core::reconcile_key` for why this one command must not be
        // replay-protected by its key.
        req.idempotency_key = super::reconcile_key(&run_id);
    }
    // The reconcile operation is deliberately run-UNSCOPED in the store: a
    // run-scoped row would be found by the pass's own
    // `list_inflight_operations(run)` sweep and released as SafeRetry — the
    // reconciler must not settle the operation that wraps it.
    req.run_id = None;
    fenced(ctx, "reconcile", EffectClass::SafeRetry, req, None, {
        move |_op| async move {
            let ports = ForgedPorts::new(ctx.ledger.clone(), ctx.config.clone());
            let view = crate::core::drive::project(ctx, &run_id).await?;
            let config = forged_proto::ReconcileConfig {
                stage_budget_s: view.policy.stage_budget_s.into_iter().collect(),
                gate_commands: view.policy.gate_commands,
            };
            let now = now_iso();
            let report =
                forged_proto::reconcile(&ctx.ledger, &run_id, &ports, &config, &now).await?;
            Ok(json!({"report": report_json(&report)}))
        }
    })
    .await
}

// ----------------------------------------------------------------- usage

fn totals_json(t: &forged_ledger::UsageTotals) -> Value {
    json!({
        "inputTokens": t.input_tokens,
        "outputTokens": t.output_tokens,
        "cacheReadTokens": t.cache_read_tokens,
        "cacheWriteTokens": t.cache_write_tokens,
        "costUsdKnown": t.cost_usd_known,
        "rowsMissingCost": t.rows_missing_cost,
    })
}

/// One stored usage row, projected. Token counts are disjoint buckets:
/// `inputTokens` is what was billed at the uncached rate, never a total.
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

/// The operator's rate card, as every usage report states it. One card is
/// read per process, so a run and the epic above it report the same block.
pub(crate) fn pricing_json(config: &crate::config::ForgedConfig) -> Value {
    json!({
        "ratesAsOf": config.pricing.rates_as_of,
        "source": config.pricing.source,
        "webSearchPer1k": config.pricing.tools.web_search_per_1k,
    })
}

/// Bare `usage` — the read-only summary report.
///
/// Totals say what a run cost; `rows` say which seat spent it. The row list
/// is the only place a cost's provenance is visible: a claude row carries
/// the money the provider billed, a codex row carries a cost imputed from
/// the operator's rate card, and a row with neither is honestly null and
/// counted in `rowsMissingCost`.
pub async fn usage_report(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("usage_report", req, || async {
        let run_ids: Vec<String> = match param_opt_str(&req.params, "run") {
            Some(run) => vec![run.to_owned()],
            None => on_ledger(&ctx.ledger, |l| l.list_runs())
                .await?
                .into_iter()
                .map(|r| r.run_id)
                .collect(),
        };
        let mut totals = forged_ledger::UsageTotals {
            input_tokens: 0,
            output_tokens: 0,
            cache_read_tokens: 0,
            cache_write_tokens: 0,
            cost_usd_known: 0.0,
            rows_missing_cost: 0,
        };
        let mut rows = Vec::new();
        for run_id in run_ids {
            let t = {
                let run_id = run_id.clone();
                on_ledger(&ctx.ledger, move |l| l.usage_totals(&run_id)).await?
            };
            totals.input_tokens += t.input_tokens;
            totals.output_tokens += t.output_tokens;
            totals.cache_read_tokens += t.cache_read_tokens;
            totals.cache_write_tokens += t.cache_write_tokens;
            totals.cost_usd_known += t.cost_usd_known;
            totals.rows_missing_cost += t.rows_missing_cost;
            let stored = on_ledger(&ctx.ledger, move |l| l.list_usage(&run_id)).await?;
            rows.extend(stored.iter().map(usage_row_json));
        }
        Ok(json!({
            "rows": rows,
            "totals": totals_json(&totals),
            "pricing": pricing_json(&ctx.config),
        }))
    })
    .await
}

/// `usage ingest` — reconciliation: re-derive usage from packet directories
/// and record what capture missed. Zero rows is `Ok` — absent usage is data.
///
/// Deliberately unfenced. Every row it writes carries the natural key
/// `(run, packet, attempt, provider, model)`, so re-recording is a no-op at
/// the storage layer and the operation fence has no dedup work left to do.
/// It used to be fenced, and that was the bug: one key per run meant the
/// second ingest replayed the first's stored response without re-reading
/// disk, so a run ingested at round 0 could never count its later rounds.
pub async fn usage_ingest(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let run = param_opt_str(&req.params, "run").map(str::to_owned);
    let all = req.params.get("all").and_then(Value::as_bool) == Some(true);
    if run.is_none() && !all {
        return err_response(
            &derive_key("usage_ingest", None, None, None),
            &Failure::invalid("usage ingest takes --run <id> or --all"),
        );
    }
    read_only("usage_ingest", req, || async {
        let run_ids: Vec<String> = match run {
            Some(run) => vec![run],
            None => on_ledger(&ctx.ledger, |l| l.list_runs())
                .await?
                .into_iter()
                .map(|r| r.run_id)
                .collect(),
        };
        let mut ingested = 0u64;
        for run_id in run_ids {
            ingested += ingest_run(ctx, &run_id).await?;
        }
        Ok(json!({"ingested": ingested}))
    })
    .await
}

/// Re-derive one run's usage from its packet directories.
///
/// Attempt manifests are the primary source and attribute every retained
/// capture exactly. A packet-level capture is read only when no manifest
/// exists for that packet, preserving the pre-0.2 latest-attempt fallback.
async fn ingest_run(ctx: &Ctx, run_id: &str) -> Result<u64, Failure> {
    let packets = {
        let run_id = run_id.to_owned();
        on_ledger(&ctx.ledger, move |l| l.list_packets(&run_id)).await?
    };
    let mut ingested = 0u64;
    let manifests = {
        let run_id = run_id.to_owned();
        on_ledger(&ctx.ledger, move |l| l.list_attempt_artifacts(&run_id)).await?
    };
    let compacted = {
        let run_id = run_id.to_owned();
        on_ledger(&ctx.ledger, move |l| {
            l.list_attempt_artifact_compactions(&run_id)
        })
        .await?
        .into_iter()
        .filter(|row| row.state == "completed")
        .map(|row| row.attempt_id)
        .collect::<BTreeSet<_>>()
    };
    let mut manifested_packets = BTreeSet::new();
    for artifact in manifests {
        if compacted.contains(&artifact.attempt_id) {
            manifested_packets.insert(artifact.packet_id.clone());
            continue;
        }
        let (provider, model, stdout) =
            super::artifacts::manifest_output(&ctx.config.run_dir(run_id), &artifact)?;
        manifested_packets.insert(artifact.packet_id.clone());
        ingested += ingest_capture(
            ctx,
            run_id,
            &artifact.packet_id,
            Some(artifact.attempt_id),
            &provider,
            &model,
            &stdout,
        )
        .await?;
    }

    // Compatibility projection: only packets with no attempt manifests read
    // the pre-0.2 packet-level capture, attributed to that packet's latest
    // attempt exactly as before.
    let latest_attempt = latest_attempt_per_packet(ctx, run_id).await;
    for row in packets {
        if manifested_packets.contains(&row.packet_id) {
            continue;
        }
        let packet: WorkPacket = match forged_proto::stored_packet(&row) {
            Ok(p) => p,
            Err(_) => continue,
        };
        let (_, stage_key, logical_seq) = crate::core::split_packet_key(&row.packet_id)?;
        let packet_dir = ctx.config.packet_dir_key(run_id, &stage_key, logical_seq);
        let Ok(stdout) = std::fs::read_to_string(packet_dir.join("out.jsonl")) else {
            continue;
        };
        let model = packet.provider_hints.model.clone();
        let provider = packet.provider_hints.provider.clone();
        let attempt_id = latest_attempt.get(&row.packet_id).copied();
        ingested += ingest_capture(
            ctx,
            run_id,
            &row.packet_id,
            attempt_id,
            &provider,
            &model,
            &stdout,
        )
        .await?;
    }
    Ok(ingested)
}

async fn ingest_capture(
    ctx: &Ctx,
    run_id: &str,
    packet_id: &str,
    attempt_id: Option<i64>,
    provider: &str,
    model: &str,
    stdout: &str,
) -> Result<u64, Failure> {
    let capture = match provider {
        "codex" => CodexDriver.parse_usage(stdout, model)?,
        _ => forged_provider::ClaudeDriver.parse_usage(stdout, model)?,
    };
    let mut rows = capture.rows;
    if rows.is_empty() && provider == "codex" {
        if let Some(thread_id) = capture.session_ref.as_deref() {
            match forged_provider::recover_usage_from_rollout(
                &ctx.config.codex_home,
                thread_id,
                model,
            )
            .await
            {
                Ok(recovered) => rows = recovered.rows,
                Err(forged_provider::ProviderError::RolloutNotFound { .. }) => {}
                Err(other) => return Err(Failure::refused(ErrorCode::Internal, other.to_string())),
            }
        }
    }
    crate::core::usage::price(ctx, &mut rows);
    let mut ingested = 0;
    for usage in rows {
        let new_usage = crate::core::usage::to_new_usage(run_id, packet_id, attempt_id, usage);
        on_ledger(&ctx.ledger, move |l| l.record_usage(new_usage)).await?;
        ingested += 1;
    }
    Ok(ingested)
}

/// The highest attempt id seen per packet — the one whose output the packet
/// directory currently holds. A run that cannot be projected yields an
/// empty map and the rows fall back to no attribution, which is still
/// stable across repeat ingests.
async fn latest_attempt_per_packet(ctx: &Ctx, run_id: &str) -> BTreeMap<String, i64> {
    let Ok(view) = crate::core::drive::project(ctx, run_id).await else {
        return BTreeMap::new();
    };
    let mut latest = BTreeMap::<String, i64>::new();
    let mut note = |packet_id: &str, attempt_id: i64| {
        let slot = latest.entry(packet_id.to_owned()).or_insert(attempt_id);
        *slot = (*slot).max(attempt_id);
    };
    for (packet_id, attempts) in &view.terminal_attempts {
        for attempt in attempts {
            note(packet_id, attempt.attempt_id);
        }
    }
    for attempt in &view.live_attempts {
        note(&attempt.packet_id, attempt.attempt_id);
    }
    latest
}

// ------------------------------------------------------------- inventory

/// The durable kinds an inventory entry's lifecycle is folded from.
const RUN_SETTLED: &str = "run.settled";
const PROTO_PR: &str = "proto.pr";
const CONTROLLER_STARTED: &str = "forged.controller.started";
pub(super) const LIFECYCLE_KINDS: [&str; 7] = [
    epic::STARTED,
    epic::PAUSED,
    epic::RESUMED,
    epic::EPIC_PR,
    PROTO_PR,
    RUN_SETTLED,
    CONTROLLER_STARTED,
];

/// A synthesized epic entry's derived lifecycle columns.
struct EpicLifecycle {
    /// `active`, `paused`, or `submitted`.
    state: &'static str,
    /// The reason the events name, or `Value::Null` when they name none.
    stop_reason: Value,
}

/// Every epic's lifecycle, folded from the three durable kinds that
/// describe one, keyed by epic id; an epic with no lifecycle event yet is
/// absent and its entry reports `active`.
///
/// A pure fold over one snapshot — never its own reads. Three indexed kind
/// scans already sit in that snapshot, so the fold costs the same whether
/// the ledger holds one epic or a hundred.
///
/// Between `paused` and `resumed` the greater `event_id` wins — the append
/// position, never the `ts` string, so two control events written in the
/// same second do not resolve by luck. A `forged.epic.pr` is terminal over
/// both: it is the precedence `epic_advance` applies when it stops, and an
/// epic that ended at its draft PR is not reopened by a later control
/// event. A payload that will not parse still yields the state its kind
/// implies, with no reason — the same degradation an unparseable start
/// event gets.
fn epic_lifecycles(snapshot: &InventorySnapshot) -> BTreeMap<String, EpicLifecycle> {
    let reason_of = |payload_json: &str| {
        let payload: Value = serde_json::from_str(payload_json).unwrap_or(Value::Null);
        match payload.get("reason") {
            Some(reason @ Value::String(_)) => reason.clone(),
            _ => Value::Null,
        }
    };
    let mut control: BTreeMap<String, (i64, EpicLifecycle)> = BTreeMap::new();
    for kind in [epic::PAUSED, epic::RESUMED] {
        for event in snapshot.events(kind) {
            let Some(epic_id) = event.run_id.clone() else {
                continue;
            };
            let lifecycle = if kind == epic::PAUSED {
                EpicLifecycle {
                    state: "paused",
                    stop_reason: reason_of(&event.payload_json),
                }
            } else {
                EpicLifecycle {
                    state: "active",
                    stop_reason: Value::Null,
                }
            };
            let superseded = control
                .get(&epic_id)
                .is_none_or(|(seen, _)| *seen < event.event_id);
            if superseded {
                control.insert(epic_id, (event.event_id, lifecycle));
            }
        }
    }
    let mut lifecycles: BTreeMap<String, EpicLifecycle> = control
        .into_iter()
        .map(|(epic_id, (_, lifecycle))| (epic_id, lifecycle))
        .collect();
    for event in snapshot.events(epic::EPIC_PR) {
        let Some(epic_id) = event.run_id.clone() else {
            continue;
        };
        lifecycles.insert(
            epic_id,
            EpicLifecycle {
                state: "submitted",
                stop_reason: Value::Null,
            },
        );
    }
    lifecycles
}

/// Whether inventory entries carry per-run spend.
///
/// Spend is read from the SAME snapshot the entries are projected from, so
/// `Include` costs no extra query; a caller resolving an id against the
/// inventory has no use for it, and `Omit` leaves both spend keys off the
/// entry rather than reporting a zero it did not measure.
pub enum Spend {
    Include,
    Omit,
}

/// The inventory: every unit of work the ledger holds, live or historical,
/// each labelled `slice` or `epic`. `work_list` serves it whole; `overview`
/// resolves a bare id against it.
///
/// Two sources, deliberately: a slice owns a `runs` row, but an epic never
/// does — `epic_start` only appends `forged.epic.started` under the epic
/// bead id, and the sole production writer of `runs` is `run_start`, called
/// per child. An inventory built from `list_runs()` alone therefore lists no
/// epic at all, so every started epic id with no `runs` row is synthesized
/// from its start event. `kind` stays derived from that event — the only
/// signal separating an epic from a slice; there is no column for it. One
/// construction, because a second implementation of that rule would drift
/// from the first.
///
/// A synthesized epic entry carries the same keys as a run entry so one
/// shape describes the whole inventory, with the values an epic actually
/// has: `branch` is the integration branch, `state` is `active` with no
/// stop reason (an epic has no ledger state to stop), and `createdAt` /
/// `updatedAt` are both the start ts — the entry projects that one event,
/// and epic lifecycle detail lives behind `epic_status`. Seats and spend sit
/// on the child slice rows that own the packets, so an epic reports its own
/// (zero) counts rather than double-counting its children.
///
/// Live seats and spend both come from the snapshot's own whole-ledger
/// scans grouped by run, never a per-run query. Absent usage is data: an
/// entry with no usage rows reports zero spend rather than failing.
pub async fn inventory(ctx: &Ctx, spend: Spend) -> Result<Vec<Value>, Failure> {
    // ONE snapshot, not a read per source: runs, live attempts, usage and
    // the lifecycle kinds are folded into a single entry each, and reading
    // them across separate transactions would let an epic's start event and
    // its pause land on opposite sides of a concurrent write.
    let usage_selection = match spend {
        Spend::Include => InventoryUsageSelection::Include,
        Spend::Omit => InventoryUsageSelection::Omit,
    };
    let snapshot = on_ledger(&ctx.ledger, move |l| {
        l.inventory_snapshot(&LIFECYCLE_KINDS, usage_selection)
    })
    .await?;
    project_entries(&snapshot, spend)
}

/// Project one snapshot into inventory entries, oldest first.
///
/// The projection, separated from the read so the portfolio derives its
/// entries and its attention rail from the SAME snapshot: two reads would
/// let an attempt land between them and describe a run the entries do not.
pub(super) fn project_entries(
    snapshot: &InventorySnapshot,
    spend: Spend,
) -> Result<Vec<Value>, Failure> {
    let lifecycles = epic_lifecycles(snapshot);
    // First start event per epic id; a payload that will not parse still
    // yields a discoverable id rather than hiding the epic.
    let mut epics: BTreeMap<String, (String, Value)> = BTreeMap::new();
    for event in snapshot.events(epic::STARTED) {
        let Some(epic_id) = event.run_id.clone() else {
            continue;
        };
        epics.entry(epic_id).or_insert_with(|| {
            (
                event.ts.clone(),
                serde_json::from_str(&event.payload_json).unwrap_or(Value::Null),
            )
        });
    }
    let mut live_seats: BTreeMap<String, u64> = BTreeMap::new();
    let mut current: BTreeMap<String, (i64, String, String)> = BTreeMap::new();
    for attempt in &snapshot.live_attempts {
        let (run_id, stage, _) = split_packet_key(&attempt.packet_id)?;
        *live_seats.entry(run_id.clone()).or_default() += 1;
        let replace = current
            .get(&run_id)
            .is_none_or(|(seen, _, _)| *seen < attempt.attempt_id);
        if replace {
            current.insert(
                run_id,
                (attempt.attempt_id, stage, attempt.claimant.clone()),
            );
        }
    }
    // (createdAt, id, entry) — one ordering over both sources, keeping
    // `list_runs`'s chronological shape now that epics interleave.
    let mut inventory: Vec<(String, String, Value)> =
        Vec::with_capacity(snapshot.runs.len() + epics.len());
    for run in &snapshot.runs {
        let epic = epics.remove(&run.run_id).is_some();
        let identity_kind = if epic {
            WorkIdentitySubjectKind::Epic
        } else {
            WorkIdentitySubjectKind::Run
        };
        let identity = snapshot
            .work_identities
            .get(&(identity_kind, run.run_id.clone()))
            .cloned()
            .ok_or_else(|| {
                Failure::internal(format!(
                    "{} {:?} has no durable work identity",
                    identity_kind.as_str(),
                    run.run_id
                ))
            })?;
        let bead_id = identity.bead.id.clone();
        let mut entry = json!({
            "id": run.run_id.clone(),
            "kind": if epic { "epic" } else { "slice" },
            "identity": identity,
            "beadId": bead_id,
            "repo": run.repo.clone(),
            "baseRef": run.base_ref.clone(),
            "branch": run.branch.clone(),
            "state": match run.state {
                RunState::Active => "active",
                RunState::Stopped => "stopped",
            },
            "stopReason": run.stop_reason.clone(),
            "outcome": run.terminal_outcome.map(|value| value.as_str()),
            "delivery": {
                "pr": run.delivery_pr,
                "sha": run.delivery_sha.clone(),
            },
            "supersededBy": run.superseded_by.clone(),
            "createdAt": run.created_at.clone(),
            "updatedAt": run.updated_at.clone(),
            "lastProgressAt": snapshot.latest_event.get(&run.run_id)
                .map(|event| json!(event.ts)).unwrap_or_else(|| json!(run.updated_at)),
            "liveSeats": live_seats.get(&run.run_id).copied().unwrap_or(0),
            "currentStage": current.get(&run.run_id).map(|(_, stage, _)| stage),
            "currentSeat": current.get(&run.run_id).map(|(_, stage, _)| stage),
            "currentAgent": current.get(&run.run_id).map(|(_, _, claimant)| claimant),
        });
        add_lifecycle(snapshot, &run.run_id, &mut entry);
        add_spend(&snapshot.usage, &spend, &run.run_id, &mut entry)?;
        inventory.push((run.created_at.clone(), run.run_id.clone(), entry));
    }
    // Whatever is left has a start event and no run row: a real epic.
    for (epic_id, (ts, payload)) in epics {
        let identity = snapshot
            .work_identities
            .get(&(WorkIdentitySubjectKind::Epic, epic_id.clone()))
            .cloned()
            .ok_or_else(|| {
                Failure::internal(format!("epic {epic_id:?} has no durable work identity"))
            })?;
        let field = |name: &str| match payload.get(name) {
            Some(value @ Value::String(_)) => value.clone(),
            _ => Value::Null,
        };
        let bead_id = identity.bead.id.clone();
        let lifecycle = lifecycles.get(&epic_id);
        let updated_at = snapshot
            .latest_event
            .get(&epic_id)
            .map(|event| event.ts.clone())
            .unwrap_or_else(|| ts.clone());
        let mut entry = json!({
            "id": epic_id,
            "kind": "epic",
            "identity": identity,
            "beadId": bead_id,
            "repo": field("repo"),
            "baseRef": field("baseRef"),
            "branch": field("integrationBranch"),
            "state": lifecycle.map(|l| l.state).unwrap_or("active"),
            "stopReason": lifecycle
                .map(|l| l.stop_reason.clone())
                .unwrap_or(Value::Null),
            "createdAt": ts,
            "updatedAt": updated_at,
            "lastProgressAt": updated_at,
            "liveSeats": live_seats.get(&epic_id).copied().unwrap_or(0),
            "currentStage": current.get(&epic_id).map(|(_, stage, _)| stage),
            "currentSeat": current.get(&epic_id).map(|(_, stage, _)| stage),
            "currentAgent": current.get(&epic_id).map(|(_, _, claimant)| claimant),
        });
        add_lifecycle(snapshot, &epic_id, &mut entry);
        add_spend(&snapshot.usage, &spend, &epic_id, &mut entry)?;
        inventory.push((ts, epic_id, entry));
    }
    inventory.sort_by(|left, right| (&left.0, &left.1).cmp(&(&right.0, &right.1)));
    Ok(inventory.into_iter().map(|(_, _, entry)| entry).collect())
}

/// Add the additive lifecycle contract. New `run.settled` writers can land
/// independently; legacy rows degrade to null outcome/delivery rather than
/// being guessed terminal.
fn add_lifecycle(snapshot: &InventorySnapshot, id: &str, entry: &mut Value) {
    let latest = |kind: &str| {
        snapshot
            .events(kind)
            .iter()
            .rev()
            .find(|event| event.run_id.as_deref() == Some(id))
            .and_then(|event| serde_json::from_str::<Value>(&event.payload_json).ok())
    };
    let settled = latest(RUN_SETTLED);
    let outcome = settled
        .as_ref()
        .and_then(|value| value.get("outcome"))
        .cloned()
        .unwrap_or(Value::Null);
    let superseded_by = settled
        .as_ref()
        .and_then(|value| value.get("supersededBy"))
        .cloned()
        .unwrap_or(Value::Null);
    let settled_delivery = settled
        .as_ref()
        .and_then(|value| value.get("delivery"))
        .cloned();
    let pr = latest(epic::EPIC_PR).or_else(|| latest(PROTO_PR));
    let pr_number = pr
        .as_ref()
        .and_then(|record| record.get("number"))
        .cloned()
        .unwrap_or(Value::Null);
    let pr_base = pr
        .as_ref()
        .and_then(|record| record.get("baseRefName").or_else(|| record.get("base")))
        .cloned()
        .unwrap_or(Value::Null);
    let mut delivery = settled_delivery.unwrap_or_else(|| {
        if pr_number.is_null() {
            Value::Null
        } else {
            json!({"pr": pr_number.clone(), "sha": Value::Null})
        }
    });
    // A clean settlement happens after review and before the human merge,
    // while the draft PR is recorded independently by the protocol. Merge
    // those two durable sources instead of letting the settlement's null PR
    // erase a real delivery candidate.
    if delivery.get("pr").is_some_and(Value::is_null) && !pr_number.is_null() {
        delivery["pr"] = pr_number;
    }
    if let Some(object) = delivery.as_object_mut() {
        object.insert("prBase".to_owned(), pr_base);
    }
    if let Some(object) = entry.as_object_mut() {
        object.insert("outcome".to_owned(), outcome);
        object.insert("delivery".to_owned(), delivery);
        object.insert("supersededBy".to_owned(), superseded_by);
        object.insert(
            "ci".to_owned(),
            json!({"status": "unknown", "detail": "CI state is not recorded durably"}),
        );
    }
}

/// Stamp one entry's spend, when the caller asked for it.
///
/// Read from the snapshot's included usage payload — the single grouped scan
/// taken inside the snapshot transaction — never a `usage_totals` query per
/// entry. An uncapped inventory would otherwise put one job per row through
/// the single ledger writer, and a figure read after the snapshot could
/// describe a state the entries and the rail never jointly held. An omitted
/// payload is refused instead of being projected as measured zero.
///
/// A run with no usage rows is ABSENT from that map, and absent is zero:
/// spend not incurred, not spend unmeasured.
fn add_spend(
    usage: &InventoryUsage,
    spend: &Spend,
    id: &str,
    entry: &mut Value,
) -> Result<(), Failure> {
    let Spend::Include = spend else {
        return Ok(());
    };
    let InventoryUsage::Included { totals, .. } = usage else {
        return Err(Failure::internal(
            "spend projection requires included inventory usage",
        ));
    };
    let totals = totals.get(id);
    let cost_usd_known = totals.map_or(0.0, |t| t.cost_usd_known);
    let rows_missing_cost = totals.map_or(0, |t| t.rows_missing_cost);
    if let Some(object) = entry.as_object_mut() {
        object.insert("costUsdKnown".to_owned(), json!(cost_usd_known));
        object.insert("rowsMissingCost".to_owned(), json!(rows_missing_cost));
    }
    Ok(())
}

#[cfg(test)]
mod spend_projection_tests {
    use super::*;

    #[test]
    fn included_empty_usage_is_measured_zero_but_omission_cannot_impersonate_it() {
        let included = InventoryUsage::Included {
            totals: BTreeMap::new(),
            latest_missing: BTreeMap::new(),
        };
        let mut measured = json!({});
        add_spend(&included, &Spend::Include, "run-a", &mut measured).expect("measured spend");
        assert_eq!(measured["costUsdKnown"], json!(0.0));
        assert_eq!(measured["rowsMissingCost"], json!(0));

        let mut omitted = json!({});
        add_spend(
            &InventoryUsage::Omitted,
            &Spend::Omit,
            "run-a",
            &mut omitted,
        )
        .expect("explicit omission");
        assert!(omitted.get("costUsdKnown").is_none());
        assert!(omitted.get("rowsMissingCost").is_none());

        let mut inconsistent = json!({});
        add_spend(
            &InventoryUsage::Omitted,
            &Spend::Include,
            "run-a",
            &mut inconsistent,
        )
        .expect_err("omitted usage cannot project measured zero");
        assert!(inconsistent.as_object().expect("object").is_empty());
    }
}

const QUEUE_GROUPS: [&str; 5] = [
    "Needs me",
    "Ready to merge",
    "Running",
    "Stalled or recoverable",
    "Planned",
];

/// Enrich the inventory and group it once for every operator surface.
///
/// Beads is queried once for exactly the ids in the ledger. Controller
/// records and progress events come from the already-open inventory
/// snapshot, avoiding a ledger projection per row.
pub(super) fn operator_queue(
    snapshot: &InventorySnapshot,
    entries: &mut [Value],
    attention: &[Value],
    bead_read: Result<Vec<forged_beads::IssueSummary>, String>,
) -> Value {
    let bead_error = bead_read.as_ref().err().cloned();
    let beads: BTreeMap<String, forged_beads::IssueSummary> = bead_read
        .unwrap_or_default()
        .into_iter()
        .map(|issue| (issue.id.clone(), issue))
        .collect();
    let mut attention_by_id: BTreeMap<&str, &Value> = BTreeMap::new();
    for item in attention {
        if let Some(id) = item["id"].as_str() {
            // The rail is already severity ordered; retain the first and
            // therefore most important blocker for the compact queue card.
            attention_by_id.entry(id).or_insert(item);
        }
    }
    let mut controller_records: BTreeMap<String, (i64, Value)> = BTreeMap::new();
    for event in snapshot.events(CONTROLLER_STARTED) {
        let Some(id) = event.run_id.clone() else {
            continue;
        };
        let Ok(record) = serde_json::from_str::<Value>(&event.payload_json) else {
            continue;
        };
        if controller_records
            .get(&id)
            .is_none_or(|(seen, _)| *seen < event.event_id)
        {
            controller_records.insert(id, (event.event_id, record));
        }
    }
    let mut pr_records: BTreeMap<String, (i64, Value)> = BTreeMap::new();
    for kind in [PROTO_PR, epic::EPIC_PR] {
        for event in snapshot.events(kind) {
            let Some(id) = event.run_id.clone() else {
                continue;
            };
            let Ok(record) = serde_json::from_str::<Value>(&event.payload_json) else {
                continue;
            };
            if pr_records
                .get(&id)
                .is_none_or(|(seen, _)| *seen < event.event_id)
            {
                pr_records.insert(id, (event.event_id, record));
            }
        }
    }
    let as_of = now_iso();
    let mut grouped: BTreeMap<&str, Vec<Value>> = QUEUE_GROUPS
        .iter()
        .map(|name| (*name, Vec::new()))
        .collect();

    for entry in entries.iter_mut() {
        let id = entry["id"].as_str().unwrap_or_default().to_owned();
        let bead_id = entry["beadId"].as_str().unwrap_or_default().to_owned();
        let record = controller_records.remove(&id).map(|(_, record)| record);
        let controller = durable_controller_status(snapshot, &id, record);
        let issue = beads.get(&bead_id);
        // Human-readable identity is frozen with the work. The bounded
        // Beads read below remains authoritative for claim health and
        // repository membership, but a later rename or outage must not
        // rewrite historical display state.
        let title = entry
            .pointer("/identity/displayTitle")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned();
        let expected = crate::core::run_holder(&bead_id);
        let controller_state = controller.get("state").and_then(Value::as_str);
        let controller_live = controller_state == Some("running");
        let execution_live = controller_live || entry["liveSeats"].as_u64().unwrap_or(0) > 0;
        let claim_known = issue.is_some();
        let claim_status = issue.map(|issue| issue.status.as_str());
        let assignee = issue.and_then(|issue| issue.assignee.as_deref());
        let repository_identity = issue
            .and_then(|issue| issue.metadata.get("repository"))
            .map(String::as_str)
            .filter(|identity| !identity.is_empty());
        let holder_mismatch = assignee
            .is_some_and(|holder| holder != expected && holder != crate::core::FRONTIER_HOLDER);
        let outcome = entry["outcome"].as_str();
        let awaiting_delivery = matches!(outcome, Some("clean" | "accepted-risk"));
        let visibly_terminal = !entry["outcome"].is_null()
            || !entry["delivery"].is_null()
            || entry["state"] == json!("stopped");
        let dead_controller = !controller.is_null()
            && matches!(controller_state, Some("dead" | "vanished" | "exited"));
        let unverified_controller_is_blocker = false;
        let stale = claim_status == Some("in_progress")
            && (holder_mismatch
                || (!awaiting_delivery
                    && (!execution_live || visibly_terminal || dead_controller)));
        let claim_detail = if !claim_known {
            bead_error
                .as_deref()
                .map(|error| format!("Beads unavailable: {error}"))
                .unwrap_or_else(|| "Bead was not returned by the bounded live read".to_owned())
        } else if holder_mismatch {
            format!(
                "Bead is assigned to {}, expected {expected}",
                assignee.unwrap_or("nobody")
            )
        } else if awaiting_delivery {
            "Reviewed delivery retains its Beads claim until the PR lands".to_owned()
        } else if stale {
            "Bead remains in_progress although durable execution is no longer live".to_owned()
        } else if claim_status == Some("blocked") {
            "Bead is blocked in the authoritative live store".to_owned()
        } else if claim_status == Some("closed") && !visibly_terminal {
            "Bead is closed while durable execution is not settled".to_owned()
        } else {
            "Live Beads claim agrees with execution evidence".to_owned()
        };
        let claim_health = json!({
            "known": claim_known,
            "status": claim_status,
            "assignee": assignee,
            "expectedAssignee": expected,
            "staleInProgress": stale,
            "detail": claim_detail,
        });
        let attention_item = attention_by_id.get(id.as_str()).copied();
        let attention_condition = attention_item.and_then(|item| item["condition"].as_str());
        let attention_owner = attention_item.and_then(|item| item["owner"].as_str());
        let blocker = attention_item
            .map(|item| item["detail"].clone())
            .or_else(|| {
                entry["stopReason"]
                    .is_string()
                    .then(|| entry["stopReason"].clone())
            })
            .or_else(|| (!claim_known).then(|| json!(claim_detail)))
            .or_else(|| {
                matches!(claim_status, Some("blocked" | "closed")).then(|| json!(claim_detail))
            })
            .or_else(|| stale.then(|| json!(claim_detail)))
            .or_else(|| {
                (matches!(controller_state, Some("dead" | "vanished"))
                    || unverified_controller_is_blocker)
                    .then(|| {
                        json!(format!(
                            "detached controller is {}",
                            controller_state.unwrap_or("unknown")
                        ))
                    })
            })
            .unwrap_or(Value::Null);
        let recorded_pr = pr_records.remove(&id).map(|(_, record)| record);
        let delivered_pr = entry.pointer("/delivery/pr").cloned();
        let pr = recorded_pr.map_or_else(
            || match delivered_pr {
                Some(value @ Value::Object(_)) => value,
                Some(number @ Value::Number(_)) => json!({
                    "number": number,
                    "url": Value::Null,
                    "baseBranch": entry.pointer("/delivery/prBase")
                        .cloned().unwrap_or(Value::Null),
                    "isDraft": Value::Null,
                }),
                _ => Value::Null,
            },
            |record| {
                json!({
                    "number": record.get("number").cloned().unwrap_or(Value::Null),
                    "url": record.get("url").cloned().unwrap_or(Value::Null),
                    "baseBranch": record.get("baseRefName")
                        .or_else(|| record.get("base"))
                        .cloned().unwrap_or(Value::Null),
                    "isDraft": record.get("isDraft").cloned().unwrap_or(Value::Null),
                })
            },
        );
        let has_pr = pr.get("number").is_some_and(Value::is_number);
        let exact_base = pr.get("baseBranch").and_then(Value::as_str)
            == entry.get("baseRef").and_then(Value::as_str);
        let merge_actionable = awaiting_delivery && has_pr && exact_base;
        let merge_attention = attention_condition == Some("merge-approval") && has_pr && exact_base;
        let group = if merge_attention || (merge_actionable && attention_item.is_none()) {
            "Ready to merge"
        } else if attention_owner == Some("human") || claim_status == Some("blocked") {
            "Needs me"
        } else if execution_live {
            "Running"
        } else if attention_owner == Some("lead-agent")
            || !claim_known
            || stale
            || claim_status == Some("closed")
            || dead_controller
            || unverified_controller_is_blocker
            || entry["state"] == json!("stopped")
        {
            "Stalled or recoverable"
        } else {
            "Planned"
        };
        let projected_action = attention_item
            .and_then(|item| item.pointer("/recommendedAction/text"))
            .and_then(Value::as_str)
            .map(str::to_owned);
        let next_action = match group {
            "Needs me" => projected_action.unwrap_or_else(|| {
                "Resolve the recorded blocker, then resume execution".to_owned()
            }),
            "Ready to merge" => format!(
                "Merge PR {} into {}",
                pr.get("number")
                    .map_or_else(|| "unknown".to_owned(), Value::to_string),
                pr.get("baseBranch")
                    .and_then(Value::as_str)
                    .unwrap_or("the recorded base")
            ),
            "Running" => entry["currentStage"].as_str().map_or_else(
                || "Let the verified controller advance the workflow".to_owned(),
                |stage| format!("Wait for {stage} to settle"),
            ),
            "Stalled or recoverable" => projected_action.unwrap_or_else(|| {
                "Inspect the blocker and resubmit only after controller death is verified"
                    .to_owned()
            }),
            _ => "Submit a detached controller when this work should start".to_owned(),
        };
        if let Some(object) = entry.as_object_mut() {
            object.insert("title".to_owned(), Value::String(title));
            object.insert(
                "repositoryScope".to_owned(),
                json!({
                    "known": repository_identity.is_some(),
                    "identity": repository_identity,
                    "source": repository_identity
                        .map(|_| "beads.metadata.repository")
                        .unwrap_or("unknown"),
                }),
            );
            if let Some(execution) = object.get_mut("execution").and_then(Value::as_object_mut) {
                execution.insert("controller".to_owned(), controller.clone());
            }
            object.insert("controller".to_owned(), controller);
            object.insert("claimHealth".to_owned(), claim_health);
            object.insert("blocker".to_owned(), blocker);
            object.insert("nextAction".to_owned(), json!(next_action));
            object.insert("pr".to_owned(), pr);
            object.insert(
                "spend".to_owned(),
                json!({
                    "costUsdKnown": object.get("costUsdKnown").cloned().unwrap_or(json!(0.0)),
                    "rowsMissingCost": object.get("rowsMissingCost").cloned().unwrap_or(json!(0)),
                }),
            );
            object.insert(
                "progressAgeInput".to_owned(),
                json!({"lastProgressAt": object.get("lastProgressAt"), "asOf": as_of}),
            );
            object.insert("queueGroup".to_owned(), json!(group));
        }
        grouped
            .get_mut(group)
            .expect("pinned queue group")
            .push(entry.clone());
    }
    let groups: Vec<Value> = QUEUE_GROUPS
        .iter()
        .map(|name| {
            let mut items = grouped.remove(name).unwrap_or_default();
            items.sort_by(|left, right| {
                let lp = left
                    .get("priority")
                    .and_then(Value::as_i64)
                    .unwrap_or(i64::MAX);
                let rp = right
                    .get("priority")
                    .and_then(Value::as_i64)
                    .unwrap_or(i64::MAX);
                lp.cmp(&rp)
                    .then_with(|| {
                        right
                            .get("updatedAt")
                            .and_then(Value::as_str)
                            .cmp(&left.get("updatedAt").and_then(Value::as_str))
                    })
                    .then_with(|| {
                        left.get("id")
                            .and_then(Value::as_str)
                            .cmp(&right.get("id").and_then(Value::as_str))
                    })
            });
            json!({"name": name, "count": items.len(), "entries": items})
        })
        .collect();
    json!({"groups": groups, "total": entries.len(), "asOf": as_of})
}

/// Controller evidence which never consults controller files or the OS.
///
/// A durable `running` desire is authorization, not liveness, so the state is
/// deliberately `unknown` unless a live attempt independently proves useful
/// execution. Operations can show that authorization and the last supervisor
/// outcome without turning a process probe into one job per row.
fn durable_controller_status(
    snapshot: &InventorySnapshot,
    id: &str,
    record: Option<Value>,
) -> Value {
    let desired = snapshot
        .desired_work
        .iter()
        .find(|row| row.subject_id == id);
    let Some(desired) = desired else {
        return record.map_or(Value::Null, |record| {
            json!({
                "state": "unknown",
                "verified": false,
                "source": "durable-event",
                "record": record,
                "detail": "controller event exists but no desired-work row proves current liveness",
                "lastProgressAt": snapshot.latest_event.get(id).map(|row| &row.ts),
                "lastProgressKind": snapshot.latest_event.get(id).map(|row| &row.kind),
                "lastProgressEventId": snapshot.latest_event.get(id).map(|row| row.event_id),
            })
        });
    };
    let state = match desired.desired_state {
        forged_ledger::DesiredState::Stopped => "stopped",
        forged_ledger::DesiredState::Paused => "paused",
        forged_ledger::DesiredState::Running => "unknown",
    };
    json!({
        "state": state,
        "verified": false,
        "source": "desired-work",
        "desiredState": desired.desired_state.as_str(),
        "generation": desired.controller_generation,
        "controlRevision": desired.control_revision,
        "restartBudget": desired.restart_budget,
        "restartUsed": desired.restart_used,
        "nextWakeAt": desired.next_wake_at,
        "lastOutcome": desired.last_outcome.map(|value| value.as_str()),
        "lastError": desired.last_error,
        "record": record,
        "detail": if state == "unknown" {
            "durable authorization exists; current process liveness was not probed"
        } else {
            "durable desired-work state is authoritative"
        },
        "lastProgressAt": snapshot.latest_event.get(id).map(|row| &row.ts),
        "lastProgressKind": snapshot.latest_event.get(id).map(|row| &row.kind),
        "lastProgressEventId": snapshot.latest_event.get(id).map(|row| row.event_id),
    })
}

/// Fold one snapshot into the attention rail.
///
/// Every entry names its subject, its condition, and the durable evidence
/// for it; a condition with many rows reports the count and the newest row
/// as its exemplar, so one entry stays one entry however long a run has been
/// failing. An empty rail means nothing needs attention.
///
/// `entries` supplies each subject's `kind` and the spend the rail's last
/// condition reads, so no id is looked up twice.
#[cfg(any())]
fn attention_rail(snapshot: &InventorySnapshot, entries: &[Value]) -> Vec<Value> {
    let kinds: BTreeMap<&str, &str> = entries
        .iter()
        .filter_map(|entry| Some((entry["id"].as_str()?, entry["kind"].as_str()?)))
        .collect();
    let item = |id: &str, condition: &str, detail: String, evidence: Value| {
        json!({
            "id": id,
            "kind": kinds.get(id).copied().unwrap_or("unknown"),
            "condition": condition,
            "detail": detail,
            "evidence": evidence,
        })
    };
    let mut rail: BTreeMap<&str, Vec<Value>> =
        CONDITIONS.iter().map(|c| (*c, Vec::new())).collect();
    let mut push = |condition: &'static str, entry: Value| {
        if let Some(items) = rail.get_mut(condition) {
            items.push(entry);
        }
    };

    // An epic holds for an answer until its own `input.resolved` clears it,
    // so the LATER of the two kinds decides — by append position, never the
    // `ts` string.
    let mut holding: BTreeMap<String, (i64, Option<Value>)> = BTreeMap::new();
    for kind in [epic::INPUT_REQUIRED, epic::INPUT_RESOLVED] {
        for event in snapshot.events(kind) {
            let Some(id) = event.run_id.clone() else {
                continue;
            };
            if holding
                .get(&id)
                .is_some_and(|(seen, _)| *seen > event.event_id)
            {
                continue;
            }
            let payload = (kind == epic::INPUT_REQUIRED)
                .then(|| serde_json::from_str(&event.payload_json).unwrap_or(Value::Null));
            holding.insert(id, (event.event_id, payload));
        }
    }
    for (id, (_, payload)) in &holding {
        let Some(payload) = payload else {
            continue;
        };
        let code = payload["code"].as_str().unwrap_or("unstated");
        let child = payload["childId"].as_str().unwrap_or("the epic");
        let detail = payload["detail"].as_str().unwrap_or_default();
        push(
            "input-required",
            item(
                id,
                "input-required",
                format!("{child} is holding on {code}: {detail}")
                    .trim()
                    .to_owned(),
                payload.clone(),
            ),
        );
    }

    // Slice settlement is itself operator-facing truth. A blocked/input
    // outcome needs adjudication; clean and accepted-risk candidates need a
    // delivery decision and must not disappear merely because no worker is
    // live anymore.
    for entry in entries {
        let Some(id) = entry["id"].as_str() else {
            continue;
        };
        let reason = entry["stopReason"].as_str().unwrap_or("no reason recorded");
        match entry["outcome"].as_str() {
            Some("blocked") => push(
                "blocked",
                item(
                    id,
                    "blocked",
                    format!("run is blocked: {reason}"),
                    json!({"outcome": "blocked", "reason": reason}),
                ),
            ),
            Some("input-required") => push(
                "input-required",
                item(
                    id,
                    "input-required",
                    format!("run needs operator input: {reason}"),
                    json!({"outcome": "input-required", "reason": reason}),
                ),
            ),
            Some(outcome @ ("clean" | "accepted-risk")) => {
                let pr = entry
                    .pointer("/delivery/pr")
                    .cloned()
                    .unwrap_or(Value::Null);
                push(
                    "awaiting-delivery",
                    item(
                        id,
                        "awaiting-delivery",
                        if pr.is_null() {
                            format!("{outcome} candidate has no recorded delivery PR")
                        } else {
                            format!("{outcome} candidate is awaiting merge of PR {pr}")
                        },
                        json!({"outcome": outcome, "pr": pr}),
                    ),
                );
            }
            _ => {}
        }
    }

    // A failed Beads reconciliation is a durable promise still owed. Keep
    // the latest failed write visible; the exact error and intended outcome
    // are the recovery evidence.
    let mut bead_pending: BTreeMap<String, Value> = BTreeMap::new();
    for event in snapshot.events("run.bead-settlement.pending") {
        let Some(id) = event.run_id.clone() else {
            continue;
        };
        let payload = serde_json::from_str(&event.payload_json).unwrap_or(Value::Null);
        bead_pending.insert(id, payload);
    }
    for (id, payload) in bead_pending {
        let error = payload["error"].as_str().unwrap_or("unknown Beads error");
        push(
            "beads-settlement-pending",
            item(
                &id,
                "beads-settlement-pending",
                format!("run outcome is stored but Beads reconciliation is pending: {error}"),
                payload,
            ),
        );
    }

    // `live_attempts` carries `running` and `revoking`; only the second is a
    // reclaim saga that has not reached its successor.
    let mut revoking: BTreeMap<String, (u64, Value)> = BTreeMap::new();
    for attempt in &snapshot.live_attempts {
        if attempt.state != AttemptState::Revoking {
            continue;
        }
        // `entries` already refused every malformed packet key.
        let Ok((run_id, _, _)) = split_packet_key(&attempt.packet_id) else {
            continue;
        };
        let seen = revoking.get(&run_id).map_or(0, |(count, _)| *count);
        revoking.insert(
            run_id,
            (
                seen + 1,
                json!({
                    "attemptId": attempt.attempt_id,
                    "packetId": attempt.packet_id,
                    "reason": attempt.revoke_reason,
                    "updatedAt": attempt.updated_at,
                }),
            ),
        );
    }
    for (id, (count, newest)) in &revoking {
        let reason = newest["reason"].as_str().unwrap_or("no reason recorded");
        push(
            "revoking",
            item(
                id,
                "revoking",
                format!(
                    "{count} attempt{} marked for revocation and not yet reclaimed: {reason}",
                    if *count == 1 { " is" } else { "s are" }
                ),
                json!({"count": count, "newest": newest}),
            ),
        );
    }

    // Custody has no durable release: a quarantine stays on the rail until
    // a human adjudicates the bytes, which is what the rail is for. The
    // revoking condition above self-clears, because a reclaimed attempt
    // leaves `live_attempts`.
    let mut quarantined: BTreeMap<String, (u64, Value)> = BTreeMap::new();
    for event in snapshot.events("proto.quarantine") {
        let Some(id) = event.run_id.clone() else {
            continue;
        };
        let seen = quarantined.get(&id).map_or(0, |(count, _)| *count);
        let payload: Value = serde_json::from_str(&event.payload_json).unwrap_or(Value::Null);
        quarantined.insert(
            id,
            (
                seen + 1,
                json!({
                    "eventId": event.event_id,
                    "packetId": payload["packetId"],
                    "attemptId": payload["attemptId"],
                    "reason": payload["reason"],
                }),
            ),
        );
    }
    for (id, (count, newest)) in &quarantined {
        let reason = newest["reason"].as_str().unwrap_or("no reason recorded");
        push(
            "quarantined",
            item(
                id,
                "quarantined",
                format!(
                    "{count} result{} refused at the fence and taken into custody: {reason}",
                    if *count == 1 { " was" } else { "s were" }
                ),
                json!({"count": count, "newest": newest}),
            ),
        );
    }

    // Measured spend, from the totals the entries already carry: a run with
    // unpriced rows makes every figure over it partial.
    for entry in entries {
        let missing = entry["rowsMissingCost"].as_u64().unwrap_or(0);
        if missing == 0 {
            continue;
        }
        let Some(id) = entry["id"].as_str() else {
            continue;
        };
        push(
            "missing-cost",
            item(
                id,
                "missing-cost",
                format!("{missing} usage rows carry no cost, so the spend shown is partial"),
                json!({
                    "rowsMissingCost": missing,
                    "costUsdKnown": entry["costUsdKnown"],
                }),
            ),
        );
    }

    CONDITIONS
        .iter()
        .filter_map(|condition| rail.remove(condition))
        .flatten()
        .collect()
}

/// Normalize one repository identity without consulting the filesystem.
///
/// Existing absolute checkout paths are collapsed lexically (`//`, `.`, and
/// `..`) but never canonicalized through the live checkout: a checkout rename
/// must not silently turn a stored identity into another one. Non-path
/// identities are retained as exact strings so a future remote identity can
/// use this same public selector.
fn repository_selector(req: &OperationRequest, operation: &str) -> Result<Option<String>, Failure> {
    let Some(value) = req.params.get("repo") else {
        return Ok(None);
    };
    let raw = value
        .as_str()
        .ok_or_else(|| Failure::invalid(format!("{operation} repo must be a non-empty string")))?;
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err(Failure::invalid(format!(
            "{operation} repo must be a non-empty string"
        )));
    }
    let path = Path::new(trimmed);
    if !path.is_absolute() {
        return Ok(Some(trimmed.to_owned()));
    }
    let mut normalized = PathBuf::new();
    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                if !normalized.pop() {
                    return Err(Failure::invalid(format!(
                        "{operation} repo cannot escape its absolute root: {trimmed:?}"
                    )));
                }
            }
            Component::Prefix(_) | Component::RootDir | Component::Normal(_) => {
                normalized.push(component.as_os_str());
            }
        }
    }
    Ok(Some(normalized.to_string_lossy().into_owned()))
}

/// `work list` — the discovery surface, serving [`inventory`] whole or the
/// exact repository subset named by Bead metadata.
///
/// The one entry point that takes no id, so a caller with no prior knowledge
/// can enumerate the inventory and then address any entry.
pub async fn work_list(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("work_list", req, || async {
        let projection = operations_projection(ctx, req).await?;
        if req.params.contains_key("repo")
            && projection.pointer("/sourceHealth/beads/state").and_then(Value::as_str)
                != Some("available")
        {
            return Err(Failure {
                code: ErrorCode::BeadsError,
                message: "work_list repository membership is unavailable".to_owned(),
                recoverable: false,
            });
        }
        let groups = durable_compatibility_groups(&projection);
        let runs = groups
            .iter()
            .flat_map(|group| group["entries"].as_array().into_iter().flatten())
            .cloned()
            .collect::<Vec<_>>();
        let total = runs.len();
        let attention = projection
            .get("attention")
            .cloned()
            .unwrap_or_else(|| json!([]));
        let total = projection
            .pointer("/counts/durable")
            .and_then(Value::as_u64)
            .unwrap_or(total as u64);
        Ok(json!({
            "runs": runs,
            "queue": {
                "groups": groups,
                "total": total,
                "cap": projection.pointer("/coverage/limit").cloned().unwrap_or(json!(OPERATIONS_DEFAULT_LIMIT)),
                "asOf": projection.pointer("/capturedAt/ledger").cloned().unwrap_or(Value::Null),
            },
            "attentionTotal": attention.as_array().map_or(0, Vec::len),
            "attention": attention,
            "sourceHealth": projection.get("sourceHealth").cloned().unwrap_or(Value::Null),
        }))
    })
    .await
}

/// Legacy discovery never included plan-only Beads. Preserve that boundary
/// while sourcing its ordering and grouping from Operations.
///
/// `count` and `entries` keep their legacy durable-only meaning. `code`,
/// `shown` and `total` are verbatim passthroughs of the source group, and
/// `excluded.livePlan` is COUNTED from that group's rows rather than derived
/// as `total - count`: under the page cap `total > shown`, so the
/// subtraction would invent rows the caller never saw.
pub(super) fn durable_compatibility_groups(projection: &Value) -> Vec<Value> {
    projection
        .pointer("/queue/groups")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .map(|group| {
            let rows = group
                .get("entries")
                .and_then(Value::as_array)
                .into_iter()
                .flatten()
                .collect::<Vec<_>>();
            let entries = rows
                .iter()
                .filter(|entry| entry.get("source").and_then(Value::as_str) == Some("durable"))
                .map(|entry| (*entry).clone())
                .collect::<Vec<_>>();
            let live_plan = rows
                .iter()
                .filter(|entry| entry.get("source").and_then(Value::as_str) == Some("live-plan"))
                .count();
            json!({
                "name": group.get("label").cloned().unwrap_or(Value::Null),
                "count": entries.len(),
                "entries": entries,
                "code": group.get("code").cloned().unwrap_or(Value::Null),
                "shown": group.get("shown").cloned().unwrap_or(Value::Null),
                "total": group.get("total").cloned().unwrap_or(Value::Null),
                "excluded": {"livePlan": live_plan},
            })
        })
        .collect()
}

const OPERATIONS_DEFAULT_LIMIT: u64 = 200;
const OPERATIONS_MAX_LIMIT: u64 = 500;
const LIVE_PLAN_LIMIT: usize = 500;

pub(super) fn queue_code(label: &str) -> Option<&'static str> {
    match label {
        "Needs me" => Some("needs-me"),
        "Ready to merge" => Some("ready-to-merge"),
        "Running" => Some("running"),
        "Stalled or recoverable" => Some("stalled-or-recoverable"),
        "Planned" => Some("planned"),
        _ => None,
    }
}

fn operations_filter(req: &OperationRequest, key: &str) -> Result<Option<String>, Failure> {
    let Some(value) = req.params.get(key) else {
        return Ok(None);
    };
    let value = value
        .as_str()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            Failure::invalid(format!(
                "operations_overview {key} must be a non-empty string"
            ))
        })?;
    Ok(Some(value.to_owned()))
}

fn work_ref(kind: WorkRefKind, id: &str) -> Result<Value, Failure> {
    let reference = WorkRefV1::new(kind, id).map_err(|error| {
        Failure::internal(format!("constructing operator work reference: {error}"))
    })?;
    serde_json::to_value(reference)
        .map_err(|error| Failure::internal(format!("serializing operator work reference: {error}")))
}

pub(super) fn live_plan_entry(
    plan: &forged_beads::PlanIssue,
    captured_at: &str,
) -> Result<Value, Failure> {
    let repository = plan
        .issue
        .metadata
        .get("repository")
        .map(String::as_str)
        .filter(|value| !value.trim().is_empty());
    let kind = if plan.issue.issue_type == "epic" {
        WorkIdentitySubjectKind::Epic
    } else {
        WorkIdentitySubjectKind::Run
    };
    let epic = plan.parent.as_ref().map(|id| WorkIdentityContextV1 {
        id: id.clone(),
        title: None,
    });
    let captured_at = plan.issue.updated_at.as_deref().unwrap_or(captured_at);
    let identity = super::work_identity::live_plan_identity(
        kind,
        &plan.issue.id,
        &plan.issue.id,
        Some(&plan.issue.title),
        plan.issue.revision.as_deref(),
        repository,
        None,
        epic,
        captured_at,
    )?;
    let reference = work_ref(WorkRefKind::Plan, &plan.issue.id)?;
    Ok(json!({
        "id": plan.issue.id,
        "kind": if kind == WorkIdentitySubjectKind::Epic { "epic" } else { "plan" },
        "source": "live-plan",
        "workRef": reference,
        "detailTarget": Value::Null,
        "identity": identity,
        "beadId": plan.issue.id,
        "repo": repository,
        "baseRef": Value::Null,
        "branch": Value::Null,
        "state": "planned",
        "stopReason": Value::Null,
        "outcome": Value::Null,
        "delivery": Value::Null,
        "supersededBy": Value::Null,
        "createdAt": captured_at,
        "updatedAt": captured_at,
        "lastProgressAt": captured_at,
        "liveSeats": 0,
        "currentStage": Value::Null,
        "currentSeat": Value::Null,
        "currentAgent": Value::Null,
        "costUsdKnown": 0.0,
        "rowsMissingCost": 0,
        "priority": plan.issue.priority,
        "plan": {
            "source": "beads",
            "status": plan.issue.status,
            "readiness": plan.readiness(),
            "priority": plan.issue.priority,
            "assignee": plan.issue.assignee,
            "issueType": plan.issue.issue_type,
            "revision": plan.issue.revision,
            "parent": plan.parent,
            "dependencies": plan.dependencies,
        },
    }))
}

fn operations_subject_matches(
    kind: WorkIdentitySubjectKind,
    id: &str,
    subject_kind: forged_types::AdmissionSubjectKind,
    subject_id: &str,
) -> bool {
    match subject_kind {
        forged_types::AdmissionSubjectKind::Run => {
            kind == WorkIdentitySubjectKind::Run && subject_id == id
        }
        forged_types::AdmissionSubjectKind::Epic => {
            kind == WorkIdentitySubjectKind::Epic && subject_id == id
        }
        forged_types::AdmissionSubjectKind::Packet => {
            kind == WorkIdentitySubjectKind::Run
                && split_packet_key(subject_id).is_ok_and(|(run_id, _, _)| run_id == id)
        }
    }
}

fn desired_fact(row: &forged_ledger::DesiredWorkRow) -> Value {
    json!({
        "source": "ledger",
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
        "updatedAt": row.updated_at,
    })
}

fn reservation_fact(row: &forged_ledger::AdmissionReservationRow) -> Value {
    json!({
        "reservationId": row.reservation_id,
        "decisionId": row.decision_id,
        "subjectKind": match row.subject_kind {
            forged_types::AdmissionSubjectKind::Run => "run",
            forged_types::AdmissionSubjectKind::Epic => "epic",
            forged_types::AdmissionSubjectKind::Packet => "packet",
        },
        "subjectId": row.subject_id,
        "controlRevision": row.control_revision,
        "repository": row.repository,
        "provider": row.provider,
        "model": row.model,
        "resourceClass": match row.resource_class {
            forged_types::AdmissionResourceClass::Read => "read",
            forged_types::AdmissionResourceClass::RepositoryWrite => "repository-write",
        },
        "state": row.state.as_str(),
        "ownerKind": row.owner_kind,
        "ownerId": row.owner_id,
        "recoveryDeadline": row.recovery_deadline,
        "lastError": row.last_error,
        "updatedAt": row.updated_at,
    })
}

pub(super) fn enrich_operations_facts(
    snapshot: &InventorySnapshot,
    attention: &[Value],
    entries: &mut [Value],
) -> Result<(), Failure> {
    for entry in entries {
        let id = entry
            .get("id")
            .and_then(Value::as_str)
            .ok_or_else(|| Failure::internal("operator entry has no canonical id"))?
            .to_owned();
        let kind = if entry.get("kind").and_then(Value::as_str) == Some("epic") {
            WorkIdentitySubjectKind::Epic
        } else {
            WorkIdentitySubjectKind::Run
        };
        let is_plan = entry.get("source").and_then(Value::as_str) == Some("live-plan");
        let desired = snapshot
            .desired_work
            .iter()
            .find(|row| {
                row.subject_id == id
                    && row.subject_kind.as_str()
                        == if kind == WorkIdentitySubjectKind::Epic {
                            "epic"
                        } else {
                            "run"
                        }
            })
            .map(desired_fact)
            .unwrap_or(Value::Null);
        let decisions = snapshot
            .admission_decisions
            .iter()
            .filter(|decision| {
                operations_subject_matches(kind, &id, decision.subject_kind, &decision.subject_id)
            })
            .map(|decision| {
                serde_json::to_value(decision).map_err(|error| {
                    Failure::internal(format!("serializing admission decision: {error}"))
                })
            })
            .collect::<Result<Vec<_>, _>>()?;
        let reservations = snapshot
            .admission_reservations
            .iter()
            .filter(|reservation| {
                operations_subject_matches(
                    kind,
                    &id,
                    reservation.subject_kind,
                    &reservation.subject_id,
                )
            })
            .map(reservation_fact)
            .collect::<Vec<_>>();
        let attention_items = attention
            .iter()
            .filter(|item| item.get("subjectId").and_then(Value::as_str) == Some(id.as_str()))
            .cloned()
            .collect::<Vec<_>>();
        let delivery = entry.get("delivery").cloned().unwrap_or(Value::Null);
        let execution = json!({
            "source": "ledger",
            "liveSeats": entry.get("liveSeats").cloned().unwrap_or(json!(0)),
            "currentStage": entry.get("currentStage").cloned().unwrap_or(Value::Null),
            "currentSeat": entry.get("currentSeat").cloned().unwrap_or(Value::Null),
            "currentAgent": entry.get("currentAgent").cloned().unwrap_or(Value::Null),
        });
        let object = entry
            .as_object_mut()
            .ok_or_else(|| Failure::internal("operator entry is not an object"))?;
        object.insert(
            "desired".to_owned(),
            if is_plan {
                json!({"source": "none", "value": Value::Null})
            } else {
                desired
            },
        );
        object.insert(
            "admission".to_owned(),
            if is_plan {
                json!({"source": "none", "decisions": [], "reservations": []})
            } else {
                json!({
                    "source": "ledger",
                    "decisions": decisions,
                    "reservations": reservations,
                })
            },
        );
        object.insert(
            "attentionItems".to_owned(),
            json!({"source": "projection", "items": attention_items}),
        );
        object.insert(
            "execution".to_owned(),
            if is_plan {
                json!({"source": "none", "state": "not-started"})
            } else {
                execution
            },
        );
        object.insert(
            "deliveryFact".to_owned(),
            if is_plan {
                json!({"source": "none", "value": Value::Null})
            } else {
                json!({"source": "ledger", "value": delivery})
            },
        );
    }
    Ok(())
}

pub(super) fn desired_only_entries(
    snapshot: &InventorySnapshot,
    entries: &[Value],
) -> Result<Vec<Value>, Failure> {
    let represented = entries
        .iter()
        .filter_map(|entry| {
            let id = entry.get("id")?.as_str()?.to_owned();
            let kind = if entry.get("kind").and_then(Value::as_str) == Some("epic") {
                WorkIdentitySubjectKind::Epic
            } else {
                WorkIdentitySubjectKind::Run
            };
            Some((kind, id))
        })
        .collect::<BTreeSet<_>>();
    snapshot
        .desired_work
        .iter()
        .filter_map(|desired| {
            let kind = match desired.subject_kind {
                forged_ledger::DesiredSubjectKind::Run => WorkIdentitySubjectKind::Run,
                forged_ledger::DesiredSubjectKind::Epic => WorkIdentitySubjectKind::Epic,
            };
            (!represented.contains(&(kind, desired.subject_id.clone()))).then_some((kind, desired))
        })
        .map(|(kind, desired)| {
            let identity = snapshot
                .work_identities
                .get(&(kind, desired.subject_id.clone()))
                .cloned()
                .ok_or_else(|| {
                    Failure::internal(format!(
                        "desired {} {:?} has no durable work identity",
                        kind.as_str(),
                        desired.subject_id
                    ))
                })?;
            let repository = identity.repository.as_ref().map(|value| value.path.clone());
            Ok(json!({
                "id": desired.subject_id,
                "kind": if kind == WorkIdentitySubjectKind::Epic { "epic" } else { "slice" },
                "identity": identity,
                "beadId": identity.bead.id,
                "repo": repository,
                "baseRef": Value::Null,
                "branch": Value::Null,
                "state": "desired",
                "stopReason": Value::Null,
                "outcome": Value::Null,
                "delivery": Value::Null,
                "supersededBy": Value::Null,
                "createdAt": desired.created_at,
                "updatedAt": desired.updated_at,
                "lastProgressAt": desired.last_progress_at.as_ref().unwrap_or(&desired.updated_at),
                "liveSeats": 0,
                "currentStage": Value::Null,
                "currentSeat": Value::Null,
                "currentAgent": Value::Null,
                "costUsdKnown": 0.0,
                "rowsMissingCost": 0,
                "desiredOnly": true,
            }))
        })
        .collect()
}

/// The exact, unique Bead ids one bounded live read covers.
///
/// Several runs legitimately share one Bead — a resubmission, a superseded
/// attempt, an epic child re-driven — so the per-row ledger projection is not
/// a set. The exact-hydrate contract requires one row per requested id;
/// handing it a repeat fails the whole read closed.
pub(super) fn entry_bead_ids(entries: &[Value]) -> Vec<String> {
    entries
        .iter()
        .filter_map(|entry| {
            entry
                .get("beadId")
                .and_then(Value::as_str)
                .map(str::to_owned)
        })
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect::<Vec<_>>()
}

/// Resolve one display title per operator row before any surface reads it.
///
/// `titleSource` is a SIBLING of the frozen `identity`: it never rewrites
/// `identity.displayTitle` or `title`, which remain launch evidence. It
/// carries a current Beads title only for a row whose identity froze without
/// one, and always names the authority that answered.
pub(super) fn decorate_titles(
    entries: &mut [Value],
    beads: &[forged_beads::IssueSummary],
) -> Result<(), Failure> {
    let titles: BTreeMap<&str, &str> = beads
        .iter()
        .map(|issue| (issue.id.as_str(), issue.title.as_str()))
        .collect();
    for entry in entries {
        let identity: forged_types::WorkIdentityV1 =
            serde_json::from_value(entry.get("identity").cloned().unwrap_or(Value::Null)).map_err(
                |error| Failure::internal(format!("operator row has invalid identity: {error}")),
            )?;
        let resolved = forged_types::resolve_work_title(
            &identity,
            titles.get(identity.bead.id.as_str()).copied(),
        );
        let resolved = serde_json::to_value(resolved).map_err(|error| {
            Failure::internal(format!("serializing operator row title: {error}"))
        })?;
        entry
            .as_object_mut()
            .ok_or_else(|| Failure::internal("operator row is not an object"))?
            .insert("titleSource".to_owned(), resolved);
    }
    Ok(())
}

/// Attach the canonical durable navigation coordinates shared by Operations
/// and Work Map. This is presentation identity only; all authority-bearing
/// fields remain those already projected from the atomic ledger snapshot.
pub(super) fn decorate_durable_entries(entries: &mut [Value]) -> Result<(), Failure> {
    for entry in entries {
        let object = entry
            .as_object_mut()
            .ok_or_else(|| Failure::internal("durable operator row is not an object"))?;
        let (kind, kind_name) = if object.get("kind").and_then(Value::as_str) == Some("epic") {
            (WorkRefKind::Epic, "epic")
        } else {
            (WorkRefKind::Run, "run")
        };
        let id = object
            .get("id")
            .and_then(Value::as_str)
            .ok_or_else(|| Failure::internal("durable operator row has no id"))?
            .to_owned();
        object.insert("source".to_owned(), json!("durable"));
        object.insert("workRef".to_owned(), work_ref(kind, &id)?);
        object.insert(
            "detailTarget".to_owned(),
            json!({"subjectKind": kind_name, "subjectId": id}),
        );
    }
    Ok(())
}

/// The one operator collection universe: the atomic ledger snapshot, durable
/// and desired-only entries joined with one bounded live-plan discovery and
/// one exact claim batch, titles resolved. Operations and the attention
/// listing project this same universe so no surface serves a narrower one.
struct OperationsUniverse {
    snapshot: InventorySnapshot,
    ledger_captured_at: String,
    beads_captured_at: String,
    entries: Vec<Value>,
    bead_summaries: Vec<forged_beads::IssueSummary>,
    claim_error: Option<String>,
    plan_error: Option<String>,
    plan_discovered: usize,
    plan_truncated: bool,
}

impl OperationsUniverse {
    /// The shared degradation posture: a Beads outage keeps ledger-backed
    /// rows and is reported per source instead of failing the read closed.
    fn source_health(&self) -> Value {
        json!({
            "ledger": {"state": "available"},
            "beads": {
                "state": if self.claim_error.is_some() { "unavailable" } else { "available" },
                "error": &self.claim_error,
            },
            "plan": {
                "state": if self.plan_error.is_some() { "unavailable" } else if self.plan_truncated { "partial" } else { "available" },
                "error": &self.plan_error,
                "discovered": self.plan_discovered,
                "limit": LIVE_PLAN_LIMIT,
                "truncated": self.plan_truncated,
            },
        })
    }
}

async fn collect_operations_universe(
    ctx: &Ctx,
    repository: Option<String>,
) -> Result<OperationsUniverse, Failure> {
    let kinds: Vec<&str> = LIFECYCLE_KINDS
        .iter()
        .chain(super::attention::ATTENTION_EVENT_KINDS.iter())
        .copied()
        .collect();
    let snapshot = on_ledger(&ctx.ledger, move |ledger| {
        ledger.inventory_snapshot(&kinds, InventoryUsageSelection::Include)
    })
    .await?;
    let ledger_captured_at = now_iso();
    let mut entries = project_entries(&snapshot, Spend::Include)?;
    entries.extend(desired_only_entries(&snapshot, &entries)?);
    decorate_durable_entries(&mut entries)?;

    let bead_ids = entry_bead_ids(&entries);
    let plan_cfg = ctx.config.bd_config();
    let claim_cfg = ctx.config.bd_config();
    let plan_repository = repository.clone();
    let claim_repository = repository.clone();
    let (plan_read, claim_read) = tokio::join!(
        forged_beads::plan_inventory(&plan_cfg, plan_repository.as_deref(), LIVE_PLAN_LIMIT,),
        async {
            match claim_repository.as_deref() {
                Some(repository) => {
                    forged_beads::list_issues_for_repository(&claim_cfg, &bead_ids, repository)
                        .await
                }
                None => forged_beads::list_issues(&claim_cfg, &bead_ids).await,
            }
        }
    );
    let beads_captured_at = now_iso();
    let (mut plans, plan_truncated, plan_discovered, mut plan_error) = match plan_read {
        Ok(inventory) => (
            inventory.issues,
            inventory.truncated,
            inventory.discovered,
            None,
        ),
        Err(error) => (Vec::new(), false, 0, Some(error.to_string())),
    };
    let (claim_beads, claim_error) = match claim_read {
        Ok(issues) => (issues, None),
        Err(error) => (Vec::new(), Some(error.to_string())),
    };
    if repository.is_some() {
        let matching_beads = claim_beads
            .iter()
            .map(|issue| issue.id.as_str())
            .collect::<BTreeSet<_>>();
        entries.retain(|entry| {
            entry
                .get("beadId")
                .and_then(Value::as_str)
                .is_some_and(|id| matching_beads.contains(id))
        });
    }
    let represented: BTreeSet<String> = entries
        .iter()
        .filter_map(|entry| {
            entry
                .get("beadId")
                .and_then(Value::as_str)
                .map(str::to_owned)
        })
        .collect();
    let mut plan_entries = Vec::new();
    if plan_error.is_none() {
        let mut conversion_error = None;
        for plan in plans
            .iter()
            .filter(|plan| !represented.contains(&plan.issue.id))
        {
            match live_plan_entry(plan, &beads_captured_at) {
                Ok(entry) => plan_entries.push(entry),
                Err(error) => {
                    conversion_error = Some(format!(
                        "live plan identity for {:?} was unsafe: {}",
                        plan.issue.id, error.message
                    ));
                    break;
                }
            }
        }
        if let Some(error) = conversion_error {
            plan_error = Some(error);
            plan_entries.clear();
            plans.clear();
        }
    }

    if plan_error.is_none() {
        let plans_by_id: BTreeMap<&str, &forged_beads::PlanIssue> = plans
            .iter()
            .map(|plan| (plan.issue.id.as_str(), plan))
            .collect();
        for entry in &mut entries {
            let bead_id = entry
                .get("beadId")
                .and_then(Value::as_str)
                .map(str::to_owned);
            if let Some(plan) = bead_id.as_deref().and_then(|id| plans_by_id.get(id)) {
                if let Some(object) = entry.as_object_mut() {
                    object.insert("priority".to_owned(), json!(plan.issue.priority));
                    object.insert(
                        "plan".to_owned(),
                        json!({
                            "source": "beads",
                            "status": plan.issue.status,
                            "readiness": plan.readiness(),
                            "priority": plan.issue.priority,
                            "assignee": plan.issue.assignee,
                            "issueType": plan.issue.issue_type,
                            "revision": plan.issue.revision,
                            "parent": plan.parent,
                            "dependencies": plan.dependencies,
                        }),
                    );
                }
            }
        }
        entries.extend(plan_entries);
    }

    let mut bead_summaries = claim_beads;
    let mut known_beads = bead_summaries
        .iter()
        .map(|issue| issue.id.clone())
        .collect::<BTreeSet<_>>();
    bead_summaries.extend(
        plans
            .iter()
            .map(|plan| plan.issue.clone())
            .filter(|issue| known_beads.insert(issue.id.clone())),
    );
    decorate_titles(&mut entries, &bead_summaries)?;
    Ok(OperationsUniverse {
        snapshot,
        ledger_captured_at,
        beads_captured_at,
        entries,
        bead_summaries,
        claim_error,
        plan_error,
        plan_discovered,
        plan_truncated,
    })
}

/// `operations overview` — the bounded, read-only operator surface.
///
/// One ledger snapshot supplies every durable fact. Beads contributes one
/// exact claim/membership batch alongside one bounded N+1 plan discovery and
/// one exact-id dependency hydrate. An outage retains unscoped durable rows
/// and is reported as degraded instead of widening scope or inventing plan
/// truth. This hot path never performs a controller-file or OS liveness probe
/// per row.
pub async fn operations_overview(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("operations_overview", req, || async {
        let repository = repository_selector(req, "operations_overview")?;
        let limit = req
            .params
            .get("limit")
            .map(|value| {
                value.as_u64().ok_or_else(|| {
                    Failure::invalid("operations_overview limit must be an unsigned integer")
                })
            })
            .transpose()?
            .unwrap_or(OPERATIONS_DEFAULT_LIMIT);
        if !(1..=OPERATIONS_MAX_LIMIT).contains(&limit) {
            return Err(Failure::invalid(format!(
                "operations_overview limit must be between 1 and {OPERATIONS_MAX_LIMIT}"
            )));
        }
        let group_filter = operations_filter(req, "group")?;
        if group_filter.as_deref().is_some_and(|value| {
            !QUEUE_GROUPS
                .iter()
                .filter_map(|label| queue_code(label))
                .any(|code| code == value)
        }) {
            return Err(Failure::invalid(format!(
                "unknown operations_overview group {:?}",
                group_filter.as_deref().unwrap_or_default()
            )));
        }
        let source_filter = operations_filter(req, "source")?;
        if source_filter
            .as_deref()
            .is_some_and(|value| !matches!(value, "durable" | "live-plan"))
        {
            return Err(Failure::invalid(format!(
                "unknown operations_overview source {:?}",
                source_filter.as_deref().unwrap_or_default()
            )));
        }

        let universe = collect_operations_universe(ctx, repository.clone()).await?;
        let source_health = universe.source_health();
        let OperationsUniverse {
            snapshot,
            ledger_captured_at,
            beads_captured_at,
            mut entries,
            bead_summaries,
            claim_error,
            plan_truncated,
            ..
        } = universe;
        let attention = super::attention::project_active(&snapshot, &entries, &bead_summaries)?
            .into_iter()
            .map(|item| {
                serde_json::to_value(item).map_err(|error| {
                    Failure::internal(format!("serializing attention item: {error}"))
                })
            })
            .collect::<Result<Vec<_>, _>>()?;
        enrich_operations_facts(&snapshot, &attention, &mut entries)?;

        let bead_read = match claim_error.as_ref() {
            Some(error) => Err(error.clone()),
            None => Ok(bead_summaries),
        };
        let mut queue = operator_queue(&snapshot, &mut entries, &attention, bead_read);
        let mut remaining = limit as usize;
        let mut shown_total = 0usize;
        let mut matching_total = 0usize;
        let mut groups = Vec::new();
        for group in queue
            .get_mut("groups")
            .and_then(Value::as_array_mut)
            .into_iter()
            .flatten()
        {
            let label = group
                .get("name")
                .and_then(Value::as_str)
                .unwrap_or_default();
            let Some(code) = queue_code(label) else {
                continue;
            };
            if group_filter.as_deref().is_some_and(|filter| filter != code) {
                continue;
            }
            let mut rows = group
                .get("entries")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            if let Some(source) = source_filter.as_deref() {
                rows.retain(|entry| entry.get("source").and_then(Value::as_str) == Some(source));
            }
            let total = rows.len();
            matching_total += total;
            let shown: Vec<Value> = rows.into_iter().take(remaining).collect();
            remaining = remaining.saturating_sub(shown.len());
            shown_total += shown.len();
            groups.push(json!({
                "code": code,
                "label": label,
                "total": total,
                "shown": shown.len(),
                "entries": shown,
            }));
        }
        let total = entries.len();
        let cost_usd_known: f64 = entries
            .iter()
            .filter_map(|entry| entry.get("costUsdKnown").and_then(Value::as_f64))
            .sum();
        let rows_missing_cost: u64 = entries
            .iter()
            .filter_map(|entry| entry.get("rowsMissingCost").and_then(Value::as_u64))
            .sum();
        let live = entries
            .iter()
            .filter(|entry| entry.get("liveSeats").and_then(Value::as_u64).unwrap_or(0) > 0)
            .count();
        let admitted = entries
            .iter()
            .filter(|entry| {
                entry
                    .pointer("/admission/decisions")
                    .and_then(Value::as_array)
                    .is_some_and(|decisions| {
                        decisions.iter().any(|decision| {
                            decision.get("outcome").and_then(Value::as_str) == Some("admitted")
                        })
                    })
                    || entry
                        .pointer("/admission/reservations")
                        .and_then(Value::as_array)
                        .is_some_and(|reservations| !reservations.is_empty())
            })
            .count();
        let queued = entries
            .iter()
            .filter(|entry| {
                entry
                    .pointer("/admission/decisions")
                    .and_then(Value::as_array)
                    .is_some_and(|decisions| {
                        decisions.iter().any(|decision| {
                            decision.get("outcome").and_then(Value::as_str) == Some("deferred")
                        })
                    })
            })
            .count();
        let review_ready = entries
            .iter()
            .filter(|entry| {
                entry.get("queueGroup").and_then(Value::as_str) == Some("Ready to merge")
            })
            .count();
        let recent = entries
            .iter()
            .filter(|entry| {
                entry.get("source").and_then(Value::as_str) == Some("durable")
                    && (entry.get("state").and_then(Value::as_str) == Some("stopped")
                        || entry.get("outcome").is_some_and(|value| !value.is_null()))
            })
            .count();
        Ok(json!({
            "schema": "forged.operations-overview/1",
            "scope": {"repository": repository},
            "capturedAt": {
                "ledger": ledger_captured_at,
                "beads": beads_captured_at,
            },
            "sourceHealth": source_health,
            "coverage": {
                "total": matching_total,
                "available": total,
                "matching": matching_total,
                "shown": shown_total,
                "limit": limit,
                "filteredOut": total.saturating_sub(matching_total),
                "truncated": shown_total < matching_total || plan_truncated,
            },
            "counts": {
                "durable": entries
                    .iter()
                    .filter(|entry| entry.get("source").and_then(Value::as_str) == Some("durable"))
                    .count(),
                "live": live,
                "admitted": admitted,
                "queued": queued,
                "reviewReady": review_ready,
                "recent": recent,
                "attention": attention.len(),
                "planOnly": entries
                    .iter()
                    .filter(|entry| {
                        entry.get("source").and_then(Value::as_str) == Some("live-plan")
                    })
                    .count(),
            },
            "queue": {"groups": groups, "total": matching_total},
            "attention": attention,
            "spend": {
                "costUsdKnown": cost_usd_known,
                "rowsMissingCost": rows_missing_cost,
                "complete": rows_missing_cost == 0,
            },
        }))
    })
    .await
}

/// Return the new Operations projection to compatibility facades without
/// reimplementing its ledger/Beads joins or queue policy.
pub(super) async fn operations_projection(
    ctx: &Ctx,
    req: &OperationRequest,
) -> Result<Value, Failure> {
    let response = operations_overview(ctx, req).await;
    if response.ok {
        return Ok(response.result.unwrap_or(Value::Null));
    }
    let error = response.error.unwrap_or(forged_types::OpError {
        code: ErrorCode::Internal,
        message: "operations projection failed without an error".to_owned(),
        recoverable: false,
        detail: None,
    });
    Err(Failure {
        code: error.code,
        message: error.message,
        recoverable: error.recoverable,
    })
}

// ------------------------------------------------------- attention controls

const ATTENTION_LIST_DEFAULT_LIMIT: u64 = 100;
const ATTENTION_LIST_MAX_LIMIT: u64 = 500;

/// The custody-state scope `attention list` serves. `Active` reproduces
/// `project_active`'s semantics exactly: open plus acknowledged.
#[derive(Clone, Copy, PartialEq, Eq)]
enum AttentionListState {
    Active,
    Open,
    All,
}

impl AttentionListState {
    fn as_str(self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Open => "open",
            Self::All => "all",
        }
    }
}

fn attention_list_filter<'p>(
    req: &'p OperationRequest,
    key: &str,
) -> Result<Option<&'p str>, Failure> {
    let Some(value) = req.params.get(key) else {
        return Ok(None);
    };
    let value = value
        .as_str()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            Failure::invalid(format!("attention_list {key} must be a non-empty string"))
        })?;
    Ok(Some(value))
}

/// `attention list` — the authoritative read-only attention projection.
///
/// The collection universe is the Operations universe — ledger entries plus
/// live plan entries plus claim/plan bead summaries — projected through
/// `project_all` and state-filtered afterwards, so `state=all` can serve the
/// resolved occurrences `project_active` strips. Items are complete
/// unmodified `forged.attention-item/1` objects, grouped by condition with
/// decisions before symptoms and oldest first, truncation always stated.
pub async fn attention_list(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("attention_list", req, || async {
        use super::attention::{classification, AttentionClass};
        let repo = repository_selector(req, "attention_list")?;
        let state = match attention_list_filter(req, "state")? {
            None | Some("active") => AttentionListState::Active,
            Some("open") => AttentionListState::Open,
            Some("all") => AttentionListState::All,
            Some(other) => {
                return Err(Failure::invalid(format!(
                    "unknown attention_list state {other:?}"
                )))
            }
        };
        let condition = attention_list_filter(req, "condition")?
            .map(|value| {
                serde_json::from_value::<AttentionCondition>(json!(value)).map_err(|_| {
                    Failure::invalid(format!("unknown attention_list condition {value:?}"))
                })
            })
            .transpose()?;
        let class = match attention_list_filter(req, "classification")? {
            None => None,
            Some("decision") => Some(AttentionClass::Decision),
            Some("symptom") => Some(AttentionClass::Symptom),
            Some(other) => {
                return Err(Failure::invalid(format!(
                    "unknown attention_list classification {other:?}"
                )))
            }
        };
        let limit = req
            .params
            .get("limit")
            .map(|value| {
                value.as_u64().ok_or_else(|| {
                    Failure::invalid("attention_list limit must be an unsigned integer")
                })
            })
            .transpose()?
            .unwrap_or(ATTENTION_LIST_DEFAULT_LIMIT);
        if !(1..=ATTENTION_LIST_MAX_LIMIT).contains(&limit) {
            return Err(Failure::invalid(format!(
                "attention_list limit must be between 1 and {ATTENTION_LIST_MAX_LIMIT}"
            )));
        }

        let universe = collect_operations_universe(ctx, repo.clone()).await?;
        let items = super::attention::project_all(
            &universe.snapshot,
            &universe.entries,
            &universe.bead_summaries,
        )?;
        let items: Vec<AttentionItemV1> = items
            .into_iter()
            .filter(|item| match state {
                AttentionListState::Active => item.state != AttentionState::Resolved,
                AttentionListState::Open => item.state == AttentionState::Open,
                AttentionListState::All => true,
            })
            .filter(|item| {
                repo.as_deref()
                    .is_none_or(|repo| item.repository.as_deref() == Some(repo))
            })
            .filter(|item| condition.is_none_or(|condition| item.condition == condition))
            .filter(|item| class.is_none_or(|class| classification(item.condition) == class))
            .collect();

        // Totals are post-filter, pre-limit, so they reconcile:
        // open + acknowledged + resolved == total == decisions + symptoms.
        let total = items.len();
        let open = items
            .iter()
            .filter(|item| item.state == AttentionState::Open)
            .count();
        let acknowledged = items
            .iter()
            .filter(|item| item.state == AttentionState::Acknowledged)
            .count();
        let resolved = items
            .iter()
            .filter(|item| item.state == AttentionState::Resolved)
            .count();
        let decisions = items
            .iter()
            .filter(|item| classification(item.condition) == AttentionClass::Decision)
            .count();
        let symptoms = total - decisions;

        let mut by_condition: BTreeMap<AttentionCondition, Vec<AttentionItemV1>> = BTreeMap::new();
        for item in items {
            by_condition.entry(item.condition).or_default().push(item);
        }
        let mut ordered: Vec<(
            AttentionCondition,
            AttentionClass,
            String,
            Vec<AttentionItemV1>,
        )> = Vec::new();
        for (condition, mut group) in by_condition {
            group.sort_by(|left, right| {
                (left.opened_at.as_str(), left.subject_id.as_str())
                    .cmp(&(right.opened_at.as_str(), right.subject_id.as_str()))
            });
            let oldest = group
                .first()
                .map(|item| item.opened_at.clone())
                .unwrap_or_default();
            ordered.push((condition, classification(condition), oldest, group));
        }
        ordered.sort_by(|left, right| {
            (left.1 != AttentionClass::Decision, left.2.as_str(), left.0).cmp(&(
                right.1 != AttentionClass::Decision,
                right.2.as_str(),
                right.0,
            ))
        });

        // Global sequential take in rendered order, the sibling policy: a
        // truncated group still states its own total, nothing goes silent.
        let mut remaining = limit as usize;
        let mut shown_total = 0usize;
        let mut groups = Vec::new();
        for (condition, class, oldest, group) in ordered {
            let group_total = group.len();
            let shown = group
                .into_iter()
                .take(remaining)
                .map(|item| {
                    serde_json::to_value(item).map_err(|error| {
                        Failure::internal(format!("serializing attention item: {error}"))
                    })
                })
                .collect::<Result<Vec<_>, _>>()?;
            remaining = remaining.saturating_sub(shown.len());
            shown_total += shown.len();
            groups.push(json!({
                "condition": condition,
                "classification": class,
                "total": group_total,
                "shown": shown.len(),
                "oldestOpenedAt": oldest,
                "items": shown,
            }));
        }

        Ok(json!({
            "schema": "forged.attention-list/1",
            "capturedAt": {
                "ledger": &universe.ledger_captured_at,
                "beads": &universe.beads_captured_at,
            },
            "filters": {
                "repo": repo,
                "state": state.as_str(),
                "condition": condition,
                "classification": class,
                "limit": limit,
            },
            "sourceHealth": universe.source_health(),
            "totals": {
                "open": open,
                "acknowledged": acknowledged,
                "resolved": resolved,
                "decisions": decisions,
                "symptoms": symptoms,
                "shown": shown_total,
                "total": total,
            },
            "groups": groups,
        }))
    })
    .await
}

async fn all_attention(ctx: &Ctx) -> Result<Vec<AttentionItemV1>, Failure> {
    let kinds: Vec<&str> = LIFECYCLE_KINDS
        .iter()
        .chain(super::attention::ATTENTION_EVENT_KINDS.iter())
        .copied()
        .collect();
    let snapshot = on_ledger(&ctx.ledger, move |ledger| {
        ledger.inventory_snapshot(&kinds, InventoryUsageSelection::Include)
    })
    .await?;
    let mut entries = project_entries(&snapshot, Spend::Include)?;
    let bead_ids = entry_bead_ids(&entries);
    // A Beads outage cannot authorize a control over a condition that only
    // Beads can prove. Other ledger-backed items remain addressable.
    let beads = forged_beads::list_issues(&ctx.config.bd_config(), &bead_ids)
        .await
        .unwrap_or_default();
    decorate_titles(&mut entries, &beads)?;
    super::attention::project_all(&snapshot, &entries, &beads)
}

#[derive(Clone, Copy)]
enum AttentionControl {
    Acknowledge,
    Resolve,
    Reopen,
}

impl AttentionControl {
    fn name(self) -> &'static str {
        match self {
            Self::Acknowledge => "attention_acknowledge",
            Self::Resolve => "attention_resolve",
            Self::Reopen => "attention_reopen",
        }
    }

    fn event_kind(self) -> &'static str {
        match self {
            Self::Acknowledge => super::attention::ACKNOWLEDGED,
            Self::Resolve => super::attention::RESOLVED,
            Self::Reopen => super::attention::REOPENED,
        }
    }
}

async fn control_attention(
    ctx: &Ctx,
    req: &mut OperationRequest,
    control: AttentionControl,
) -> OperationResponse {
    let name = control.name();
    let subject = match req.run_id.as_deref().filter(|value| !value.is_empty()) {
        Some(value) => value.to_owned(),
        None => {
            return err_response(
                &derive_key(name, None, None, None),
                &Failure::invalid("attention control requires a subject id"),
            )
        }
    };
    let attention_id = match param_str(&req.params, "attentionId") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key(name, Some(&subject), None, None), &error),
    };
    let occurrence_id = match param_str(&req.params, "occurrenceId") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key(name, Some(&subject), None, None), &error),
    };
    let actor = match param_str(&req.params, "actor") {
        Ok(value) if value.len() <= 200 => value.to_owned(),
        Ok(_) => {
            return err_response(
                &derive_key(name, Some(&subject), None, None),
                &Failure::invalid("attention actor must be at most 200 bytes"),
            )
        }
        Err(error) => return err_response(&derive_key(name, Some(&subject), None, None), &error),
    };
    default_key(
        req,
        format!("op:{name}:{subject}:{attention_id}:{occurrence_id}"),
    );
    let operation_key = req.idempotency_key.clone();
    let items = match all_attention(ctx).await {
        Ok(items) => items,
        Err(error) => return err_response(&operation_key, &error),
    };
    let item = items.iter().find(|item| {
        item.subject_id == subject
            && item.attention_id == attention_id
            && item.occurrence_id == occurrence_id
    });
    if item.is_none()
        && items.iter().any(|candidate| {
            candidate.subject_id == subject && candidate.attention_id == attention_id
        })
    {
        return err_response(
            &operation_key,
            &Failure::invalid("attention occurrence is stale because newer causal evidence exists"),
        );
    }
    let replay_request = req.clone();
    match on_ledger(&ctx.ledger, move |ledger| {
        ledger.replay_event_operation(name, &replay_request)
    })
    .await
    {
        Ok(Some(response)) => return response,
        Ok(None) => {}
        Err(error) => return err_response(&operation_key, &error),
    }
    let Some(item) = item else {
        return err_response(
            &operation_key,
            &Failure::invalid(
                "attention occurrence is stale, unknown, or no longer backed by durable truth",
            ),
        );
    };

    let mut payload = json!({
        "schema": "forged.attention-transition/1",
        "attentionId": attention_id,
        "occurrenceId": occurrence_id,
        "actor": actor,
    });
    let next_state = match control {
        AttentionControl::Acknowledge => {
            if item.state == AttentionState::Resolved {
                return err_response(
                    &operation_key,
                    &Failure::invalid("resolved attention must be reopened before acknowledgement"),
                );
            }
            AttentionState::Acknowledged
        }
        AttentionControl::Resolve => {
            if !super::attention::resolution_allowed(item.condition) {
                return err_response(
                    &operation_key,
                    &Failure::invalid(
                        "this source-backed condition clears only through its domain transition",
                    ),
                );
            }
            let disposition_value = match req.params.get("disposition").cloned() {
                Some(value) => value,
                None => {
                    return err_response(
                        &operation_key,
                        &Failure::invalid("missing required param \"disposition\""),
                    )
                }
            };
            let disposition: AttentionResolutionDisposition =
                match serde_json::from_value(disposition_value) {
                    Ok(value) => value,
                    Err(_) => {
                        return err_response(
                            &operation_key,
                            &Failure::invalid(
                                "attention disposition must be fixed, accepted-risk, accepted-unknown, superseded, or automatic",
                            ),
                        )
                    }
                };
            if item.condition == forged_types::AttentionCondition::MissingCost
                && disposition != AttentionResolutionDisposition::AcceptedUnknown
            {
                return err_response(
                    &operation_key,
                    &Failure::invalid(
                        "missing-cost can only be resolved with accepted-unknown while pricing remains absent",
                    ),
                );
            }
            let note = req
                .params
                .get("note")
                .and_then(Value::as_str)
                .unwrap_or_default();
            if note.len() > 2_000 {
                return err_response(
                    &operation_key,
                    &Failure::invalid("attention resolution note must be at most 2000 bytes"),
                );
            }
            payload["disposition"] =
                serde_json::to_value(disposition).expect("closed attention disposition serializes");
            payload["note"] = json!(note);
            AttentionState::Resolved
        }
        AttentionControl::Reopen => AttentionState::Open,
    };
    let result = json!({
        "schema": "forged.attention-transition-result/1",
        "subjectId": subject,
        "attentionId": attention_id,
        "occurrenceId": occurrence_id,
        "state": next_state,
    });
    let request = req.clone();
    match on_ledger(&ctx.ledger, move |ledger| {
        ledger.apply_event_operation(name, &request, control.event_kind(), payload, result)
    })
    .await
    {
        Ok(response) => response,
        Err(error) => err_response(&operation_key, &error),
    }
}

pub async fn attention_acknowledge(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    control_attention(ctx, req, AttentionControl::Acknowledge).await
}

pub async fn attention_resolve(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    control_attention(ctx, req, AttentionControl::Resolve).await
}

pub async fn attention_reopen(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    control_attention(ctx, req, AttentionControl::Reopen).await
}

// ---------------------------------------------------------------- events

const EVENT_SUMMARY_STRING_MAX: usize = 500;
const EVENT_SUMMARY_ARRAY_MAX: usize = 8;
const EVENT_SUMMARY_DEPTH_MAX: usize = 3;

fn bounded_event_value(value: &Value, depth: usize) -> Value {
    if depth >= EVENT_SUMMARY_DEPTH_MAX {
        return match value {
            Value::Array(items) => json!({"omitted": "array", "count": items.len()}),
            Value::Object(map) => json!({"omitted": "object", "count": map.len()}),
            other => other.clone(),
        };
    }
    match value {
        Value::String(text) => {
            let mut chars = text.chars();
            let shortened: String = chars.by_ref().take(EVENT_SUMMARY_STRING_MAX).collect();
            if chars.next().is_some() {
                json!({"text": shortened, "truncated": true, "charactersAtLeast": EVENT_SUMMARY_STRING_MAX + 1})
            } else {
                Value::String(text.clone())
            }
        }
        Value::Array(items) => {
            let values = items
                .iter()
                .take(EVENT_SUMMARY_ARRAY_MAX)
                .map(|item| bounded_event_value(item, depth + 1))
                .collect::<Vec<_>>();
            if items.len() > EVENT_SUMMARY_ARRAY_MAX {
                json!({"items": values, "total": items.len(), "truncated": true})
            } else {
                Value::Array(values)
            }
        }
        Value::Object(map) => Value::Object(
            map.iter()
                .map(|(key, item)| (key.clone(), bounded_event_value(item, depth + 1)))
                .collect(),
        ),
        other => other.clone(),
    }
}

fn event_summary(kind: &str, payload: &Value) -> Value {
    if kind != "proto.gate" {
        return bounded_event_value(payload, 0);
    }
    let rows = payload
        .get("rows")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let commands = rows
        .iter()
        .filter_map(|row| row.get("command").and_then(Value::as_str))
        .map(str::to_owned)
        .collect::<Vec<_>>();
    let failed_commands = rows
        .iter()
        .filter(|row| row.get("exitCode").and_then(Value::as_i64) != Some(0))
        .filter_map(|row| row.get("command").and_then(Value::as_str))
        .map(str::to_owned)
        .collect::<Vec<_>>();
    let artifacts = rows
        .iter()
        .filter_map(|row| row.get("artifactPath").and_then(Value::as_str))
        .map(str::to_owned)
        .collect::<Vec<_>>();
    json!({
        "schemaVersion": payload.get("schemaVersion"),
        "phase": payload.get("phase"),
        "seq": payload.get("seq"),
        "passed": payload.get("passed"),
        "commands": commands,
        "failedCommands": failed_commands,
        "artifactPaths": artifacts,
    })
}

/// `events` — read-only, paginated; proto rows are validated through the
/// replay parser on the way out.
pub async fn events_tail(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("events_tail", req, || async {
        let run = param_opt_str(&req.params, "run").map(str::to_owned);
        let after = req.params.get("after").and_then(Value::as_i64).unwrap_or(0);
        let limit = req.params.get("limit").and_then(Value::as_u64);
        let summary = req
            .params
            .get("summary")
            .and_then(Value::as_bool)
            .unwrap_or(false);
        let rows = {
            let run = run.clone();
            on_ledger(&ctx.ledger, move |l| {
                let mut out = Vec::new();
                let mut cursor = after;
                loop {
                    let page_size: u32 = match limit {
                        Some(limit) => {
                            let remaining = limit.saturating_sub(out.len() as u64);
                            if remaining == 0 {
                                return Ok(out);
                            }
                            u32::try_from(remaining.min(256)).unwrap_or(256)
                        }
                        None => 256,
                    };
                    let page = l.list_events(run.as_deref(), cursor, page_size)?;
                    let full = page.len() == page_size as usize;
                    if let Some(last) = page.last() {
                        cursor = last.event_id;
                    }
                    out.extend(page);
                    if !full {
                        return Ok(out);
                    }
                }
            })
            .await?
        };
        // Render proto.* kinds through the replay parser — a stream this
        // command cannot replay is surfaced, not hidden.
        forged_proto::parse_proto_events(&rows).map_err(Failure::from)?;
        let last_event_id = rows.last().map(|r| r.event_id).unwrap_or(after);
        let events: Vec<Value> = rows
            .iter()
            .map(|r| {
                let payload = serde_json::from_str::<Value>(&r.payload_json).unwrap_or(Value::Null);
                json!({
                    "eventId": r.event_id,
                    "ts": r.ts,
                    "runId": r.run_id,
                    "kind": r.kind,
                    "payload": if summary { event_summary(&r.kind, &payload) } else { payload },
                })
            })
            .collect();
        Ok(json!({"events": events, "last_event_id": last_event_id, "summary": summary}))
    })
    .await
}

// ------------------------------------------------------- worktree retire

/// `worktree retire` — fenced ObserveOnly retire, settled by the worktree's
/// absence; the explicit idempotency key is required (checked in dispatch).
pub async fn worktree_retire(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let mut req = req.clone();
    let run_id = match param_str(&req.params, "run") {
        Ok(r) => r.to_owned(),
        Err(f) => return err_response(&req.idempotency_key, &f),
    };
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    let params = req.params.clone();
    fenced(
        ctx,
        "worktree_retire",
        EffectClass::ObserveOnly,
        &req,
        None,
        {
            move |_op| async move {
                let force = params.get("force").and_then(Value::as_bool) == Some(true);
                let run_state_terminal =
                    params.get("runStateTerminal").and_then(Value::as_bool) == Some(true);
                let run = {
                    let run_id = run_id.clone();
                    on_ledger(&ctx.ledger, move |l| l.get_run(&run_id)).await?
                };
                let opts = forged_git::RetireOptions {
                    force,
                    run_state_terminal,
                };
                forged_git::retire_worktree(
                    Path::new(&run.repo),
                    &ctx.config.runs_root,
                    &run_id,
                    &opts,
                )
                .await?;
                Ok(json!({"retired": true, "run_id": run_id}))
            }
        },
    )
    .await
}
