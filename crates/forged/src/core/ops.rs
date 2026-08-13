//! The non-drive core functions: doctor, init, run start/status, packet
//! lifecycle, gate run, reconcile, usage, events, worktree retire.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use forged_gate::GateRequest;
use forged_ledger::{EffectClass, NewRun, NewRunDefinition, OperationState, RunState};
use forged_provider::{CodexDriver, PacketDirs, ProviderDriver};
use forged_types::{
    request_sha256, ErrorCode, OperationRequest, OperationResponse, RunId, WorkPacket,
};
use serde_json::{json, Value};

use crate::adapters::ports::{report_json, ForgedPorts};
use crate::config::{now_iso, stage_str};
use crate::core::{
    default_key, derive_key, err_response, fenced, key_absent, on_ledger, param_opt_str, param_str,
    read_only, session_claimant, Ctx, Failure,
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
                    super::spec::resolve_bead(ctx, &bead).await?;
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
                }),
                super::spec::SpecSource::Bead(bead_id) => json!({
                    "runId": row.run_id,
                    "source": "bead",
                    "beadId": bead_id,
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
        let (definition, revision) = on_ledger(&ctx.ledger, move |ledger| {
            Ok((
                ledger.get_run_definition(&run_id_owned)?,
                ledger.latest_roster_revision(&run_id_owned)?,
            ))
        })
        .await?;
        let action = forged_proto::advance(&view);
        let controller = super::handoff::controller_status(ctx, run_id).await?;
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
                "nextAction": match &action {
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
                "controller": controller,
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
            let fence = super::spec::resolve_for_packet(
                ctx,
                &forged_proto::packet_spec(&row),
                &view.run.bead_id,
            )
            .await?
            .fence;
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

/// `packet fail` — fenced SafeRetry failure report; the note's `transport:`
/// prefix decides the classification, byte-exact.
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
            "pricing": {
                "ratesAsOf": ctx.config.pricing.rates_as_of,
                "source": ctx.config.pricing.source,
                "webSearchPer1k": ctx.config.pricing.tools.web_search_per_1k,
            },
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

// ---------------------------------------------------------------- events

/// `events` — read-only, paginated; proto rows are validated through the
/// replay parser on the way out.
pub async fn events_tail(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("events_tail", req, || async {
        let run = param_opt_str(&req.params, "run").map(str::to_owned);
        let after = req.params.get("after").and_then(Value::as_i64).unwrap_or(0);
        let limit = req.params.get("limit").and_then(Value::as_u64);
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
                json!({
                    "eventId": r.event_id,
                    "ts": r.ts,
                    "runId": r.run_id,
                    "kind": r.kind,
                    "payload": serde_json::from_str::<Value>(&r.payload_json)
                        .unwrap_or(Value::Null),
                })
            })
            .collect();
        Ok(json!({"events": events, "last_event_id": last_event_id}))
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
