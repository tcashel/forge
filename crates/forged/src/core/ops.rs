//! The non-drive core functions: doctor, init, run start/status, packet
//! lifecycle, gate run, reconcile, usage, work list, events, worktree
//! retire.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use forged_gate::GateRequest;
use forged_ledger::{
    AttemptState, EffectClass, InventorySnapshot, NewRun, NewRunDefinition, OperationState,
    RunState,
};
use forged_provider::{CodexDriver, PacketDirs, ProviderDriver};
use forged_types::{
    request_sha256, ErrorCode, OperationRequest, OperationResponse, RunId, WorkPacket,
};
use serde_json::{json, Value};

use crate::adapters::ports::{report_json, ForgedPorts};
use crate::config::{now_iso, stage_str};
use crate::core::{
    default_key, derive_key, epic, err_response, fenced, key_absent, on_ledger, param_opt_str,
    param_str, read_only, session_claimant, split_packet_key, Ctx, Failure,
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
    let params = req.params.clone();
    fenced(ctx, "run_start", EffectClass::SafeRetry, req, None, {
        move |_op| async move {
            let repo = param_str(&params, "repo")?.to_owned();
            let spec = param_opt_str(&params, "spec").map(str::to_owned);
            if !Path::new(&repo).is_absolute() {
                return Err(Failure::invalid(format!(
                    "--repo must be an absolute path, got {repo:?}"
                )));
            }
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
            let row = on_ledger(&ctx.ledger, move |ledger| {
                ledger.create_run_with_definition(new_run, definition)
            })
            .await?;
            // Persist the spec SOURCE for packet building — the run row has
            // no spec column, and every process must resolve the same one.
            // `specPath` stays in the payload for the deprecated file route,
            // so an in-flight run started by an older binary still reads.
            let run_for_event = row.run_id.clone();
            let payload = match &source {
                super::spec::SpecSource::File(path) => json!({
                    "runId": row.run_id,
                    "source": "file",
                    "specPath": path,
                    "deprecated": true,
                    "beadTitle": issue.title,
                    "issueType": issue.issue_type,
                    "metadata": issue.metadata,
                }),
                super::spec::SpecSource::Bead(bead_id) => json!({
                    "runId": row.run_id,
                    "source": "bead",
                    "beadId": bead_id,
                    "beadTitle": issue.title,
                    "issueType": issue.issue_type,
                    "metadata": issue.metadata,
                }),
            };
            on_ledger(&ctx.ledger, move |l| {
                l.append_event(Some(&run_for_event), "forged.run.spec", payload)
            })
            .await?;
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
        let (definition, revision, protocol_terminal) = on_ledger(&ctx.ledger, move |ledger| {
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
            Ok((
                ledger.get_run_definition(&run_id_owned)?,
                ledger.latest_roster_revision(&run_id_owned)?,
                protocol_terminal,
            ))
        })
        .await?;
        let action = forged_proto::advance(&view);
        let controller = super::handoff::controller_status(ctx, run_id).await?;
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
                "settledOperations": view.settled_operations.iter().map(|o| json!({
                    "name": o.name,
                    "idempotencyKey": o.idempotency_key,
                })).collect::<Vec<_>>(),
                "nextAction": if view.accepted_risk.is_none() && protocol_terminal.is_some() {
                    let terminal = protocol_terminal.expect("checked above");
                    json!({"stop": terminal})
                } else { match &action {
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
                }},
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
            let payload = json!({
                "schemaVersion": 1,
                "reviewRounds": review_rounds,
                "acceptance": acceptance.clone(),
            });
            {
                let run_id = run_id.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_event_kind_once(&run_id, "forged.review.risk_accepted", payload)
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
            // run's bd lease holder — see `core::session_claimant`. The
            // stored body carries the hints the packet was opened with.
            let view = super::drive::project(ctx, &row.run_id).await?;
            // ONE spec read for this claim: it answers both the fence the
            // ledger compares and the bytes the seat will read.
            let spec_ref = forged_proto::packet_spec(&row);
            let resolved =
                super::spec::resolve_for_packet(ctx, &spec_ref, &view.run.bead_id).await?;
            let fence = resolved.fence.clone();
            let provider = if view.execution_package.is_some() {
                super::drive::stored_packet_for_attempt(&view, &packet_id)?
                    .provider_hints
                    .provider
            } else {
                view.roster
                    .get(&row.stage)
                    .map(|hints| hints.provider.clone())
                    .ok_or_else(|| {
                        Failure::invalid(format!(
                            "legacy roster has no provider for {:?}",
                            row.stage
                        ))
                    })?
            };
            let claimant = session_claimant(&packet_id, &provider);
            let claimed = {
                let packet_id = packet_id.clone();
                on_ledger(&ctx.ledger, move |l| {
                    l.claim_packet(&packet_id, &claimant, &fence)
                })
                .await?
            };
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
/// Attribution matches [`crate::core::usage::capture_attempt`] exactly:
/// each packet directory holds the output of that packet's LATEST attempt,
/// so the row is keyed to that attempt's id. Recording `attempt_id: NULL`
/// here instead would miss the natural key that capture already wrote and
/// double the run's spend on every ingest.
async fn ingest_run(ctx: &Ctx, run_id: &str) -> Result<u64, Failure> {
    let packets = {
        let run_id = run_id.to_owned();
        on_ledger(&ctx.ledger, move |l| l.list_packets(&run_id)).await?
    };
    let latest_attempt = latest_attempt_per_packet(ctx, run_id).await;
    let mut ingested = 0u64;
    for row in packets {
        let packet: WorkPacket = match forged_proto::stored_packet(&row) {
            Ok(p) => p,
            Err(_) => continue,
        };
        let (_, stage_key, logical_seq) = crate::core::split_packet_key(&row.packet_id)?;
        let dirs = PacketDirs::new(ctx.config.packet_dir_key(run_id, &stage_key, logical_seq));
        let Ok(stdout) = std::fs::read_to_string(dirs.stdout()) else {
            continue;
        };
        let model = packet.provider_hints.model.clone();
        let provider = packet.provider_hints.provider.clone();
        let capture = match provider.as_str() {
            "codex" => CodexDriver.parse_usage(&stdout, &model)?,
            _ => forged_provider::ClaudeDriver.parse_usage(&stdout, &model)?,
        };
        let mut rows = capture.rows;
        if rows.is_empty() && provider == "codex" {
            // A codex turn that failed before reporting usage: fall back to
            // the rollout file. Absent usage is data — RolloutNotFound and
            // a missing session_ref are both zero rows and Ok.
            if let Some(thread_id) = capture.session_ref.as_deref() {
                match forged_provider::recover_usage_from_rollout(
                    &ctx.config.codex_home,
                    thread_id,
                    &model,
                )
                .await
                {
                    Ok(recovered) => rows = recovered.rows,
                    Err(forged_provider::ProviderError::RolloutNotFound { .. }) => {}
                    Err(other) => {
                        return Err(Failure::refused(ErrorCode::Internal, other.to_string()))
                    }
                }
            }
        }
        crate::core::usage::price(ctx, &mut rows);
        let attempt_id = latest_attempt.get(&row.packet_id).copied();
        for usage in rows {
            let new_usage =
                crate::core::usage::to_new_usage(run_id, &row.packet_id, attempt_id, usage);
            on_ledger(&ctx.ledger, move |l| l.record_usage(new_usage)).await?;
            ingested += 1;
        }
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
const LIFECYCLE_KINDS: [&str; 7] = [
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
    let snapshot = on_ledger(&ctx.ledger, |l| l.inventory_snapshot(&LIFECYCLE_KINDS)).await?;
    project_entries(&snapshot, spend)
}

/// Project one snapshot into inventory entries, oldest first.
///
/// The projection, separated from the read so the portfolio derives its
/// entries and its attention rail from the SAME snapshot: two reads would
/// let an attempt land between them and describe a run the entries do not.
fn project_entries(snapshot: &InventorySnapshot, spend: Spend) -> Result<Vec<Value>, Failure> {
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
        let mut entry = json!({
            "id": run.run_id.clone(),
            "kind": if epic { "epic" } else { "slice" },
            "beadId": run.bead_id.clone(),
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
        add_spend(snapshot, &spend, &run.run_id, &mut entry);
        inventory.push((run.created_at.clone(), run.run_id.clone(), entry));
    }
    // Whatever is left has a start event and no run row: a real epic.
    for (epic_id, (ts, payload)) in epics {
        let field = |name: &str| match payload.get(name) {
            Some(value @ Value::String(_)) => value.clone(),
            _ => Value::Null,
        };
        let bead_id = match field("epicId") {
            Value::Null => Value::from(epic_id.clone()),
            value => value,
        };
        let lifecycle = lifecycles.get(&epic_id);
        let updated_at = snapshot
            .latest_event
            .get(&epic_id)
            .map(|event| event.ts.clone())
            .unwrap_or_else(|| ts.clone());
        let mut entry = json!({
            "id": epic_id,
            "kind": "epic",
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
        add_spend(snapshot, &spend, &epic_id, &mut entry);
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
    let mut delivery = settled_delivery.unwrap_or_else(|| {
        (!pr_number.is_null())
            .then(|| json!({"pr": pr_number.clone(), "sha": Value::Null}))
            .unwrap_or(Value::Null)
    });
    // A clean settlement happens after review and before the human merge,
    // while the draft PR is recorded independently by the protocol. Merge
    // those two durable sources instead of letting the settlement's null PR
    // erase a real delivery candidate.
    if delivery.get("pr").is_some_and(Value::is_null) && !pr_number.is_null() {
        delivery["pr"] = pr_number;
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
/// Read from the snapshot's own `usage_totals` — the single grouped scan
/// taken inside the snapshot transaction — never a `usage_totals` query per
/// entry: an uncapped inventory would otherwise put one job per row through
/// the single ledger writer, and a figure read after the snapshot could
/// describe a state the entries and the rail never jointly held.
///
/// A run with no usage rows is ABSENT from that map, and absent is zero:
/// spend not incurred, not spend unmeasured.
fn add_spend(snapshot: &InventorySnapshot, spend: &Spend, id: &str, entry: &mut Value) {
    let Spend::Include = spend else {
        return;
    };
    let totals = snapshot.usage_totals.get(id);
    let cost_usd_known = totals.map_or(0.0, |t| t.cost_usd_known);
    let rows_missing_cost = totals.map_or(0, |t| t.rows_missing_cost);
    if let Some(object) = entry.as_object_mut() {
        object.insert("costUsdKnown".to_owned(), json!(cost_usd_known));
        object.insert("rowsMissingCost".to_owned(), json!(rows_missing_cost));
    }
}

/// The durable kinds the attention rail is folded from, on top of
/// [`LIFECYCLE_KINDS`]. `proto.quarantine` is spelled here rather than
/// imported because the ledger stores kind strings and the proto crate
/// exposes the vocabulary only through its parsed variants.
const ATTENTION_KINDS: [&str; 4] = [
    epic::INPUT_REQUIRED,
    epic::INPUT_RESOLVED,
    "proto.quarantine",
    "run.bead-settlement.pending",
];

/// One condition needing a human, in the order the rail reports them.
///
/// Severity, not alphabet: a subject holding for an answer or stuck
/// mid-reclaim blocks work, custody of a refused result is evidence a human
/// must adjudicate, and an unpriced usage row only makes a figure partial.
const CONDITIONS: [&str; 7] = [
    "input-required",
    "blocked",
    "beads-settlement-pending",
    "revoking",
    "quarantined",
    "awaiting-delivery",
    "missing-cost",
];

/// The whole inventory and what needs a human, from ONE snapshot.
pub struct Portfolio {
    /// Every inventory entry, oldest first — [`inventory`]'s own order.
    pub entries: Vec<Value>,
    /// One entry per (subject, condition), most severe condition first.
    pub attention: Vec<Value>,
    /// The operator-facing grouping shared by `work list` and Overview.
    pub queue: Value,
}

/// The portfolio: [`inventory`] with spend, plus the attention rail folded
/// from the same snapshot.
///
/// Costs ONE ledger job, exactly as `inventory` does: every condition the
/// rail reports has a durable source already inside the snapshot — the epic
/// input events, `proto.quarantine`, `attempts.state = 'revoking'` via
/// `live_attempts`, and the `usage_totals` map the entries are stamped from.
/// Neither spend nor any condition adds a query, so the entries, the spend
/// and the rail describe ONE ledger rather than a state that never held.
pub async fn portfolio(ctx: &Ctx) -> Result<Portfolio, Failure> {
    let kinds: Vec<&str> = LIFECYCLE_KINDS
        .iter()
        .chain(ATTENTION_KINDS.iter())
        .copied()
        .collect();
    let snapshot = on_ledger(&ctx.ledger, move |l| l.inventory_snapshot(&kinds)).await?;
    let mut entries = project_entries(&snapshot, Spend::Include)?;
    let attention = attention_rail(&snapshot, &entries);
    let queue = operator_queue(ctx, &snapshot, &mut entries, &attention).await;
    Ok(Portfolio {
        entries,
        attention,
        queue,
    })
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
async fn operator_queue(
    ctx: &Ctx,
    snapshot: &InventorySnapshot,
    entries: &mut [Value],
    attention: &[Value],
) -> Value {
    let bead_ids: Vec<String> = entries
        .iter()
        .filter_map(|entry| entry["beadId"].as_str().map(str::to_owned))
        .collect();
    let bead_read = forged_beads::list_issues(&ctx.config.bd_config(), &bead_ids).await;
    let bead_error = bead_read.as_ref().err().map(ToString::to_string);
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
        let controller = super::handoff::controller_status_from_snapshot(
            ctx,
            &id,
            controller_records.remove(&id).map(|(_, record)| record),
            snapshot.latest_event.get(&id),
        )
        .await;
        let issue = beads.get(&bead_id);
        let title = issue
            .map(|issue| issue.title.trim())
            .filter(|title| !title.is_empty())
            .map(str::to_owned)
            .unwrap_or_else(|| {
                format!(
                    "Legacy {} {bead_id}",
                    entry["kind"].as_str().unwrap_or("work")
                )
            });
        let expected = crate::core::run_holder(&bead_id);
        let controller_state = controller.get("state").and_then(Value::as_str);
        let controller_live = controller_state == Some("running");
        let execution_live = controller_live || entry["liveSeats"].as_u64().unwrap_or(0) > 0;
        let claim_known = issue.is_some();
        let claim_status = issue.map(|issue| issue.status.as_str());
        let assignee = issue.and_then(|issue| issue.assignee.as_deref());
        let holder_mismatch = assignee
            .is_some_and(|holder| holder != expected && holder != crate::core::FRONTIER_HOLDER);
        let outcome = entry["outcome"].as_str();
        let awaiting_delivery = matches!(outcome, Some("clean" | "accepted-risk"));
        let visibly_terminal = !entry["outcome"].is_null()
            || !entry["delivery"].is_null()
            || entry["state"] == json!("stopped");
        let dead_controller = !controller.is_null()
            && matches!(controller_state, Some("dead" | "vanished" | "exited"));
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
                matches!(controller_state, Some("dead" | "vanished" | "unknown")).then(|| {
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
                    "baseBranch": entry["baseRef"],
                    "isDraft": Value::Null,
                }),
                _ => Value::Null,
            },
            |record| {
                json!({
                    "number": record.get("number").cloned().unwrap_or(Value::Null),
                    "url": record.get("url").cloned().unwrap_or(Value::Null),
                    "baseBranch": record.get("base").cloned()
                        .unwrap_or_else(|| entry["baseRef"].clone()),
                    "isDraft": record.get("isDraft").cloned().unwrap_or(Value::Null),
                })
            },
        );
        let has_pr = !pr.is_null();
        let merge_actionable = awaiting_delivery && has_pr;
        let needs_intervention =
            attention_item.is_some() && attention_condition != Some("awaiting-delivery");
        let group = if needs_intervention || claim_status == Some("blocked") {
            "Needs me"
        } else if execution_live {
            "Running"
        } else if merge_actionable {
            "Ready to merge"
        } else if attention_item.is_some() {
            // A clean outcome without its promised PR is not mergeable.
            "Needs me"
        } else if !claim_known
            || stale
            || claim_status == Some("closed")
            || dead_controller
            || controller_state == Some("unknown")
            || entry["state"] == json!("stopped")
        {
            "Stalled or recoverable"
        } else {
            "Planned"
        };
        let next_action = match group {
            "Needs me" => "Resolve the recorded blocker, then resume execution".to_owned(),
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
            "Stalled or recoverable" => {
                "Inspect the blocker and resubmit only after controller death is verified"
                    .to_owned()
            }
            _ => "Submit a detached controller when this work should start".to_owned(),
        };
        if let Some(object) = entry.as_object_mut() {
            object.insert("title".to_owned(), json!(title));
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
            let items = grouped.remove(name).unwrap_or_default();
            json!({"name": name, "count": items.len(), "entries": items})
        })
        .collect();
    json!({"groups": groups, "total": entries.len(), "asOf": as_of})
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

/// `work list` — the discovery surface, serving [`inventory`] whole.
///
/// The one entry point that takes no id, so a caller with no prior knowledge
/// can enumerate the inventory and then address any entry.
pub async fn work_list(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("work_list", req, || async {
        let portfolio = portfolio(ctx).await?;
        Ok(json!({"runs": portfolio.entries, "queue": portfolio.queue}))
    })
    .await
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
