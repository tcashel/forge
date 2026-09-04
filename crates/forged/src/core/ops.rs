//! The non-drive core functions: doctor, init, run start/status, packet
//! lifecycle, gate run, reconcile, usage, work list, events, worktree
//! retire.

use std::collections::{BTreeMap, BTreeSet};
use std::path::{Component, Path, PathBuf};

use forged_gate::GateRequest;
use forged_ledger::{
    EffectClass, InventorySnapshot, InventoryUsage, InventoryUsageSelection, NewRun,
    NewRunDefinition, OperationState, RevokeScope, RunState, WorkItemFilters, WorkNoteKind,
    WorkStatus,
};
use forged_provider::{CodexDriver, PiDriver, ProviderDriver};
use forged_types::{
    request_sha256, AttentionCondition, AttentionItemV1, AttentionResolutionDisposition,
    AttentionState, AttentionSubjectKind, ErrorCode, ExecutionPackageV1, ExecutionPolicyV1,
    OperationRequest, OperationResponse, RunId, WorkIdentityContextV1, WorkIdentitySubjectKind,
    WorkPacket, WorkRefKind, WorkRefV1,
};
use serde_json::{json, Value};

use crate::adapters::ports::{report_json, ForgedPorts};
use crate::config::{now_iso, stage_str};
use crate::core::{
    default_key, derive_key, epic, err_response, fenced, fenced_dynamic_authorizing_desired,
    key_absent, ok_response, on_ledger, param_opt_str, param_str, read_only, remedy_response,
    session_claimant, split_packet_key, unfenced_write, work_supersede_action, Ctx, Failure,
};

// ---------------------------------------------------------------- doctor

/// Every external doctor probe is bounded: a wedged child or socket must
/// report `ok: false` within this window, never hang the whole operation —
/// the contract the deleted bd doctor stated and this port keeps.
const PROBE_TIMEOUT_S: u64 = 10;

/// `doctor` — read-only: `run_doctor`'s probes plus this slice's own.
pub async fn doctor(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("doctor", req, || async {
        let mut probes: Vec<Value> = Vec::new();
        // gh reachability: PR creation and review delivery need it.
        let gh = tokio::time::timeout(
            std::time::Duration::from_secs(PROBE_TIMEOUT_S),
            tokio::process::Command::new("gh")
                .args(["auth", "status"])
                .stdin(std::process::Stdio::null())
                .stdout(std::process::Stdio::null())
                .stderr(std::process::Stdio::null())
                .kill_on_drop(true)
                .status(),
        )
        .await
        .unwrap_or_else(|_| {
            Err(std::io::Error::other(format!(
                "timed out after {PROBE_TIMEOUT_S}s"
            )))
        });
        probes.push(match gh {
            Ok(status) if status.success() => {
                json!({"name": "gh-auth", "ok": true, "detail": "gh auth status ok"})
            }
            Ok(status) => json!({
                "name": "gh-auth",
                "ok": false,
                "detail": format!("gh auth status exited {:?}", status.code()),
            }),
            Err(error) => json!({
                "name": "gh-auth",
                "ok": false,
                "detail": format!("gh not runnable: {error}"),
            }),
        });
        // herdr is an EXTERNAL, OPTIONAL daemon: absence is a normal
        // `ok: false`, never a blocker.
        let herdr_path = ctx
            .config
            .herdr_sock
            .clone()
            .or_else(|| std::env::var_os("HERDR_SOCK").map(PathBuf::from))
            .or_else(|| {
                std::env::var_os("HOME")
                    .map(|home| PathBuf::from(home).join(".config/herdr/herdr.sock"))
            });
        probes.push(match &herdr_path {
            Some(path) => match tokio::time::timeout(
                std::time::Duration::from_secs(PROBE_TIMEOUT_S),
                tokio::net::UnixStream::connect(path),
            )
            .await
            .unwrap_or_else(|_| {
                Err(std::io::Error::other(format!(
                    "timed out after {PROBE_TIMEOUT_S}s"
                )))
            }) {
                Ok(_) => json!({
                    "name": "herdr-ping",
                    "ok": true,
                    "detail": format!("herdr reachable at {}", path.display()),
                }),
                Err(error) => json!({
                    "name": "herdr-ping",
                    "ok": false,
                    "detail": format!("{}: {error}", path.display()),
                }),
            },
            None => json!({
                "name": "herdr-ping",
                "ok": false,
                "detail": "no herdr socket path resolvable (no HERDR_SOCK and no HOME)",
            }),
        });
        // anvil home write probe.
        let anvil_probe = (|| -> Result<String, String> {
            let dir = &ctx.config.anvil_home;
            std::fs::create_dir_all(dir).map_err(|e| format!("creating {}: {e}", dir.display()))?;
            let probe_file = dir.join(format!("doctor-probe-{}", std::process::id()));
            std::fs::write(&probe_file, b"doctor probe")
                .map_err(|e| format!("writing {}: {e}", probe_file.display()))?;
            std::fs::remove_file(&probe_file)
                .map_err(|e| format!("removing {}: {e}", probe_file.display()))?;
            Ok(format!("{} writable", dir.display()))
        })();
        probes.push(match anvil_probe {
            Ok(detail) => json!({"name": "anvil-home-writable", "ok": true, "detail": detail}),
            Err(detail) => json!({"name": "anvil-home-writable", "ok": false, "detail": detail}),
        });
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
        let work_findings = on_ledger(&ctx.ledger, |l| l.work_store_findings()).await;
        probes.push(match &work_findings {
            Ok(findings) if findings.is_empty() => json!({
                "name": "work-store-integrity",
                "ok": true,
                "detail": "every enumerable work-store invariant holds",
            }),
            Ok(findings) => json!({
                "name": "work-store-integrity",
                "ok": false,
                "detail": format!("{} finding(s); each names its typed repair", findings.len()),
                "findings": findings,
            }),
            Err(failure) => json!({
                "name": "work-store-integrity",
                "ok": false,
                "detail": failure.message,
            }),
        });
        let mut provider_binaries = vec!["claude", "codex"];
        if ctx.config.rosters.values().any(|roster| {
            roster
                .roles
                .values()
                .flatten()
                .any(|candidate| candidate.provider == "pi")
        }) {
            provider_binaries.push("pi");
        }
        for binary in provider_binaries {
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
        // The digest names the exact content being SERVED, not merely that a
        // file parses: an operator comparing it against the file on disk can
        // prove whether a long-lived surface is behind an edit.
        probes.push(json!({
            "name": "config-file",
            "ok": true,
            "detail": match (&ctx.config.config_file_read, &ctx.config.config_sha256) {
                (true, Some(sha)) => format!(
                    "serving {} (sha256 {})",
                    ctx.config.config_path.display(),
                    sha
                ),
                _ => format!(
                    "{} absent; every key at its documented default",
                    ctx.config.config_path.display()
                ),
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
pub(super) async fn gh_auth_status() -> Result<String, String> {
    let Some(path) = on_path("gh") else {
        return Err("gh not found on PATH".to_owned());
    };
    let out = tokio::time::timeout(
        std::time::Duration::from_secs(PROBE_TIMEOUT_S),
        tokio::process::Command::new(&path)
            .args(["auth", "status"])
            .stdin(std::process::Stdio::null())
            .kill_on_drop(true)
            .output(),
    )
    .await
    .map_err(|_| format!("gh auth status timed out after {PROBE_TIMEOUT_S}s"))?
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
pub(super) fn on_path(binary: &str) -> Option<PathBuf> {
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

/// Resolve the Work as work, not merely as a bag of spec fields.
///
/// `bd ready` is the authority for dependency readiness. Reading the issue
/// first makes the refusal useful (status and type), while the frontier read
/// prevents an open issue with active blockers from being dispatched. The
/// one alternative shape is the exact `in_progress` custody `claim-next`
/// obtains from that frontier under [`crate::core::FRONTIER_HOLDER`]: pinned
/// bd moves a successful claim out of `open`, so requiring it to remain in
/// `bd ready` would make the composed claim-next -> run-start path
/// impossible — but the blocker gate does NOT drop for that shape: the
/// issue's own hydrated dependencies must still prove no active blocker,
/// so a blocker added between claim-next and run start (or standing behind
/// a stale frontier claim) refuses exactly as the frontier read would.
/// A non-code Work has an explicit route instead of being forced through a
/// commit-and-PR protocol that cannot represent its correct result.
async fn ready_slice_work(
    ctx: &Ctx,
    work: &str,
) -> Result<crate::core::work_types::IssueSummary, Failure> {
    let issue = super::spec::read_work(ctx, work).await?;
    let frontier_claimed = issue.status == "in_progress"
        && issue.assignee.as_deref() == Some(crate::core::FRONTIER_HOLDER);
    if issue.status != "open" && !frontier_claimed {
        return Err(Failure::invalid(format!(
            "work {work} is {:?} under assignee {:?}, not open and ready or held by the forged frontier",
            issue.status, issue.assignee
        )));
    }
    match issue.issue_type.as_str() {
        "epic" => {
            return Err(Failure::invalid(format!(
                "work {work} is an epic; use `forged epic start`"
            )))
        }
        "chore" | "decision" | "milestone" => {
            return Err(Failure::invalid(format!(
                "work {work} is a no-diff {}; complete it directly through the work store, not slice/v1",
                issue.issue_type
            )))
        }
        "bug" | "feature" | "task" | "story" | "spike" => {}
        other => {
            return Err(Failure::invalid(format!(
                "work {work} has unsupported issue type {other:?}"
            )))
        }
    }
    if frontier_claimed {
        let row = super::workstore::plan_issue(&ctx.ledger, &issue.id).await?;
        let readiness = Some(row.readiness());
        if readiness != Some(crate::core::work_types::PlanReadiness::Claimed) {
            return Err(Failure::invalid(format!(
                "work {work} is frontier-claimed but its dependencies do not prove it ready \
                 ({readiness:?}); resolve its blockers before starting a run"
            )));
        }
    }
    if !frontier_claimed {
        let ready = super::workstore::ready_issues(&ctx.ledger).await?;
        if !ready.iter().any(|candidate| candidate.id == work) {
            return Err(Failure::invalid(format!(
                "work {work} is absent from the ready frontier; resolve its blockers before starting a run"
            )));
        }
    }
    Ok(issue)
}

/// `run start` — mint the RunId from the work id (or the epic pass's
/// explicit child generation id) and fill `NewRun` from the config plus the
/// `--repo` and `--base-ref` arguments. The spec comes from the work;
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
/// epic group boundary: child creation never resolves mutable authoring
/// names again.
pub(crate) async fn run_start_with_definition(
    ctx: &Ctx,
    req: &mut OperationRequest,
    compiled: crate::config::CompiledDefinition,
) -> OperationResponse {
    let work = match param_str(&req.params, "bead") {
        Ok(v) => v.to_owned(),
        Err(f) => return err_response(&derive_key("run_start", None, None, None), &f),
    };
    let run_name = param_opt_str(&req.params, "run").unwrap_or(&work);
    let run_id = match RunId::new(run_name.to_owned()) {
        Ok(id) => id,
        Err(e) => {
            return err_response(
                &derive_key("run_start", None, None, None),
                &Failure::invalid(format!("work id does not mint a valid run id: {e}")),
            )
        }
    };
    // The key's sequence segment is the released-attempt epoch: a corrected
    // start after a released failure must never reuse a key whose request
    // event already carries a different payload.
    let epoch = match super::released_retry_seq(ctx, run_id.as_str(), "run_start").await {
        Ok(epoch) => epoch,
        Err(error) => {
            return err_response(
                &derive_key("run_start", Some(run_id.as_str()), None, None),
                &error,
            )
        }
    };
    default_key(
        req,
        derive_key("run_start", Some(run_id.as_str()), None, epoch),
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
            create_run_from_definition(ctx, &params, work, run_id, compiled, operation_id, None)
                .await
        }
    })
    .await
}

/// Mint and authorize one epic frontier run without spawning it. The
/// operation identity is exactly `run_start`; its successful response and
/// generation-zero desired authorization commit through one dynamic fence.
pub(crate) async fn dispatch_frontier_run(
    ctx: &Ctx,
    req: &mut OperationRequest,
    compiled: crate::config::CompiledDefinition,
) -> OperationResponse {
    let work = match param_str(&req.params, "bead") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key("run_start", None, None, None), &error),
    };
    let run_name = param_opt_str(&req.params, "run").unwrap_or(&work);
    let run_id = match RunId::new(run_name.to_owned()) {
        Ok(run_id) => run_id,
        Err(error) => {
            return err_response(
                &derive_key("run_start", None, None, None),
                &Failure::invalid(format!("work id does not mint a valid run id: {error}")),
            )
        }
    };
    let epoch = match super::released_retry_seq(ctx, run_id.as_str(), "run_start").await {
        Ok(epoch) => epoch,
        Err(error) => {
            return err_response(
                &derive_key("run_start", Some(run_id.as_str()), None, None),
                &error,
            )
        }
    };
    default_key(
        req,
        derive_key("run_start", Some(run_id.as_str()), None, epoch),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.as_str().to_owned());
    }
    req.params.insert(
        "packageSha256".to_owned(),
        Value::String(compiled.package_sha256.clone()),
    );
    let submit_guard = match super::handoff::acquire_run_submit(ctx, run_id.as_str()).await {
        Ok(guard) => guard,
        Err(error) => return err_response(&req.idempotency_key, &error),
    };
    match recover_applied_frontier_dispatch(ctx, req, &run_id).await {
        Ok(Some(response)) => return response,
        Ok(None) => {}
        Err(error) => return err_response(&req.idempotency_key, &error),
    }
    let params = req.params.clone();
    let run_for_effect = run_id.clone();
    let response = fenced_dynamic_authorizing_desired(
        ctx,
        "run_start",
        EffectClass::SafeRetry,
        req,
        move |operation_id| async move {
            let started = create_run_from_definition(
                ctx,
                &params,
                work,
                run_for_effect.clone(),
                compiled,
                operation_id,
                None,
            )
            .await?;
            let authorization =
                super::handoff::authorize_frontier_run(ctx, run_for_effect.as_str(), &submit_guard)
                    .await?;
            Ok((started, authorization))
        },
    )
    .await;
    if response.ok {
        // A controller-era `run_start` may replay here without the desired
        // authorization that loop dispatch now seals atomically. Bridge only
        // that already-terminal compatibility case; fresh loop dispatches
        // commit the operation response and desired row together above.
        let desired_id = run_id.as_str().to_owned();
        let desired = on_ledger(&ctx.ledger, {
            let desired_id = desired_id.clone();
            move |ledger| {
                ledger.get_desired_work(forged_ledger::DesiredSubjectKind::Run, &desired_id)
            }
        })
        .await;
        if matches!(desired, Ok(None)) {
            if let Err(error) = on_ledger(&ctx.ledger, move |ledger| {
                ledger.authorize_desired_work(
                    forged_ledger::DesiredSubjectKind::Run,
                    &desired_id,
                    0,
                )?;
                Ok(())
            })
            .await
            {
                return err_response(&req.idempotency_key, &error);
            }
        } else if let Err(error) = desired {
            return err_response(&req.idempotency_key, &error);
        }
    }
    response
}

async fn create_run_from_definition(
    ctx: &Ctx,
    params: &serde_json::Map<String, Value>,
    work: String,
    run_id: RunId,
    compiled: crate::config::CompiledDefinition,
    operation_id: String,
    retry_of: Option<String>,
) -> Result<Value, Failure> {
    let repo = super::work_identity::canonical_repository(param_str(params, "repo")?)?;
    let internal_protocol = match (
        compiled.package.protocol_ref.name.as_str(),
        compiled.package.protocol_ref.version,
    ) {
        ("epic-plan", 1) => Some("epic-plan"),
        ("epic-assurance", 1) => Some("epic-assurance"),
        _ => None,
    };
    let spec = if let Some(protocol) = internal_protocol {
        if params.get("spec").is_some_and(|value| !value.is_null()) {
            return Err(Failure::invalid(format!(
                "{protocol}/v1 internal runs do not accept deprecated spec"
            )));
        }
        Some(
            param_str(params, "internalSpec")
                .map(str::to_owned)
                .map_err(|_| {
                    Failure::invalid(format!("{protocol}/v1 internal run requires internalSpec"))
                })?,
        )
    } else {
        if params
            .get("internalSpec")
            .is_some_and(|value| !value.is_null())
        {
            return Err(Failure::invalid(
                "internalSpec is reserved for runtime-derived epic runs",
            ));
        }
        if params
            .get("internalBranch")
            .is_some_and(|value| !value.is_null())
        {
            return Err(Failure::invalid(
                "internalBranch is reserved for runtime-derived epic runs",
            ));
        }
        param_opt_str(params, "spec").map(str::to_owned)
    };
    let issue = if let Some(protocol) = internal_protocol {
        let issue = super::spec::read_work(ctx, &work).await?;
        if param_opt_str(params, "epicId") != Some(work.as_str())
            || issue.issue_type != "epic"
            || !matches!(issue.status.as_str(), "open" | "in_progress")
        {
            return Err(Failure::invalid(format!(
                "{protocol}/v1 run must bind to its open parent epic {work}"
            )));
        }
        issue
    } else {
        ready_slice_work(ctx, &work).await?
    };
    // The spec source is settled BEFORE the run row exists: a work with no
    // spec, or a spec path that is not there, must never reach a seat empty.
    let source = match &spec {
        Some(path) => {
            if !Path::new(path).exists() {
                return Err(Failure::invalid(format!("spec {path:?} does not exist")));
            }
            if internal_protocol.is_none() {
                tracing::warn!(
                    work = %work,
                    spec = %path,
                    "--spec is deprecated: the work item's own fields are the spec"
                );
            }
            super::spec::SpecSource::File(path.clone())
        }
        None => {
            super::spec::resolve_issue(&issue)?;
            super::spec::SpecSource::Work(work.clone())
        }
    };
    let base_ref = match param_opt_str(params, "baseRef") {
        Some(base) => base.to_owned(),
        None => default_branch_of(&repo).await,
    };
    let branch = match internal_protocol {
        Some("epic-assurance") => param_str(params, "internalBranch")?.to_owned(),
        Some(_) => {
            if params
                .get("internalBranch")
                .is_some_and(|value| !value.is_null())
            {
                return Err(Failure::invalid(
                    "internalBranch is supported only by epic-assurance/v1",
                ));
            }
            format!("forged/{run_id}")
        }
        None => format!("forged/{run_id}"),
    };
    let new_run = NewRun {
        run_id: run_id.clone(),
        work_id: work.clone(),
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
    let project = super::work_identity::context_from_params(params, "project");
    let epic = super::work_identity::context_from_params(params, "epic");
    let identity = super::work_identity::durable_identity(
        WorkIdentitySubjectKind::Run,
        run_id.as_str(),
        &work,
        Some(&issue.title),
        issue.revision.as_deref(),
        Some(&repo),
        project,
        epic,
    )?;
    let mut payload = match &source {
        super::spec::SpecSource::File(path) => json!({
            "runId": run_id.as_str(),
            "source": "file",
            "specPath": path,
            "deprecated": true,
            "beadId": work,
            "beadTitle": identity.work.title.clone(),
            "beadRevision": issue.revision,
            "repo": repo,
            "operationId": operation_id,
            "issueType": issue.issue_type,
            "metadata": issue.metadata,
            "project": identity.project.clone(),
            "epic": identity.epic.clone(),
        }),
        super::spec::SpecSource::Work(work_id) => json!({
            "runId": run_id.as_str(),
            "source": "bead",
            "beadId": work_id,
            "beadTitle": identity.work.title.clone(),
            "beadRevision": issue.revision,
            "repo": repo,
            "operationId": operation_id,
            "issueType": issue.issue_type,
            "metadata": issue.metadata,
            "project": identity.project.clone(),
            "epic": identity.epic.clone(),
        }),
    };
    if let Some(retry_of) = &retry_of {
        payload["retryOf"] = json!(retry_of);
    }
    let row = on_ledger(&ctx.ledger, move |ledger| {
        ledger.create_run_with_identity(new_run, definition, payload, identity)
    })
    .await?;
    crate::failpoint::hit("run.start.bundle.after");
    Ok(json!({
        "run_id": row.run_id,
        "bead_id": row.work_id,
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

const RETRY_CHAIN_LIMIT: usize = 4096;

fn retry_root(run_id: &str) -> &str {
    run_id
        .rsplit_once("-r")
        .filter(|(_, suffix)| {
            !suffix.is_empty() && suffix.bytes().all(|byte| byte.is_ascii_digit())
        })
        .map_or(run_id, |(root, _)| root)
}

pub(crate) fn retry_action(
    run_id: &str,
    reason: impl Into<String>,
) -> forged_types::OperationActionV1 {
    retry_action_with_class(run_id, reason, forged_types::ActionClass::Can)
}

pub(crate) fn retry_action_with_class(
    run_id: &str,
    reason: impl Into<String>,
    class: forged_types::ActionClass,
) -> forged_types::OperationActionV1 {
    let Value::Object(args) = json!({"id": run_id, "runId": Value::Null}) else {
        unreachable!("run retry action args are an object")
    };
    forged_types::OperationActionV1 {
        verb: "run retry".to_owned(),
        args,
        reason: reason.into(),
        class,
    }
}

pub(crate) fn retry_reason(run: &forged_ledger::RunRow) -> &'static str {
    if matches!(
        run.terminal_outcome,
        Some(forged_ledger::RunOutcome::Blocked | forged_ledger::RunOutcome::InputRequired)
    ) {
        "apply the requested decision or amendment, then retry"
    } else {
        "re-run the current spec after the world changed"
    }
}

fn action(verb: &str, args: Value, reason: impl Into<String>) -> forged_types::OperationActionV1 {
    classified_action(verb, args, reason, forged_types::ActionClass::Can)
}

fn classified_action(
    verb: &str,
    args: Value,
    reason: impl Into<String>,
    class: forged_types::ActionClass,
) -> forged_types::OperationActionV1 {
    let Value::Object(args) = args else {
        unreachable!("operation action args are an object")
    };
    forged_types::OperationActionV1 {
        verb: verb.to_owned(),
        args,
        reason: reason.into(),
        class,
    }
}

fn retry_refusal(
    key: &str,
    failure: Failure,
    remedy: forged_types::OperationActionV1,
) -> OperationResponse {
    remedy_response(key, &failure, forged_types::RemedyV1::from(remedy))
}

/// `run retry` — mint a flat successor on the same current Work revision,
/// compile live execution config, and authorize ordinary supervision. The new
/// desired row carries its own default restart budget; existing desired rows
/// and settlement/transport retry budgets remain untouched.
pub async fn run_retry(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let source_id = match param_str(&req.params, "id") {
        Ok(value) => value.to_owned(),
        Err(error) => return err_response(&derive_key("run_retry", None, None, None), &error),
    };
    default_key(req, derive_key("run_retry", Some(&source_id), None, None));
    if req.run_id.is_none() {
        req.run_id = Some(source_id.clone());
    }
    let replay = {
        let request = req.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.replay_event_operation("run_retry", &request)
        })
        .await
    };
    match replay {
        Ok(Some(response)) => return response,
        Ok(None) => {}
        Err(error) => return err_response(&req.idempotency_key, &error),
    }

    let source = {
        let id = source_id.clone();
        match on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&id)).await {
            Ok(run) => run,
            Err(error) => return err_response(&req.idempotency_key, &error),
        }
    };
    if source.state != RunState::Stopped {
        return retry_refusal(
            &req.idempotency_key,
            Failure::invalid(format!(
                "run {source_id} is not terminal; stop it before retrying"
            )),
            action(
                "run stop",
                json!({"run": source_id, "outcome": Value::Null, "reason": Value::Null}),
                "choose the terminal outcome and reason before stopping the run",
            ),
        );
    }
    if source.terminal_outcome == Some(forged_ledger::RunOutcome::Landed) {
        return retry_refusal(
            &req.idempotency_key,
            Failure::invalid(format!(
                "run {source_id} already landed as PR {} at {}; delivery evidence is immutable",
                source
                    .delivery_pr
                    .map(|value| format!("#{value}"))
                    .unwrap_or_else(|| "<unknown>".to_owned()),
                source.delivery_sha.as_deref().unwrap_or("<unknown>")
            )),
            action(
                "work show",
                json!({"id": source.work_id}),
                "inspect the delivered work and its immutable evidence",
            ),
        );
    }
    if let Some(successor) = &source.superseded_by {
        return retry_refusal(
            &req.idempotency_key,
            Failure::invalid(format!(
                "run {source_id} was superseded by {successor}; retry the successor's work instead"
            )),
            action(
                "run status",
                json!({"run": successor}),
                format!("inspect successor run {successor}"),
            ),
        );
    }

    let work = match super::workstore::show_issue(&ctx.ledger, &source.work_id).await {
        Ok(work) => work,
        Err(error) => return err_response(&req.idempotency_key, &error),
    };
    let superseders = {
        let work_id = source.work_id.clone();
        match on_ledger(&ctx.ledger, move |ledger| ledger.work_superseders(&work_id)).await {
            Ok(rows) => rows,
            Err(error) => return err_response(&req.idempotency_key, &error),
        }
    };
    if let Some(successor) = superseders.first() {
        return retry_refusal(
            &req.idempotency_key,
            Failure::invalid(format!(
                "work {} was superseded by {successor}",
                source.work_id
            )),
            action(
                "work show",
                json!({"id": successor}),
                format!("inspect successor work {successor}"),
            ),
        );
    }
    if work.status == "closed" {
        return retry_refusal(
            &req.idempotency_key,
            Failure::invalid(format!(
                "work {} is closed and cannot admit a retry",
                source.work_id
            )),
            classified_action(
                "work reopen",
                json!({"id": source.work_id}),
                "reopen the work item before retrying",
                forged_types::ActionClass::Repair,
            ),
        );
    }
    if work.status != "open" {
        return err_response(
            &req.idempotency_key,
            &Failure::invalid(format!(
                "work {} must be open before retrying; current status is {}",
                source.work_id, work.status
            )),
        );
    }

    let explicit_successor = param_opt_str(&req.params, "runId").is_some();
    let successor_name = if let Some(explicit) = param_opt_str(&req.params, "runId") {
        explicit.to_owned()
    } else {
        let root = retry_root(&source_id).to_owned();
        let candidates = {
            let root = root.clone();
            match on_ledger(&ctx.ledger, move |ledger| {
                ledger.retry_chain_runs(&root, RETRY_CHAIN_LIMIT + 1)
            })
            .await
            {
                Ok(rows) => rows,
                Err(error) => return err_response(&req.idempotency_key, &error),
            }
        };
        if candidates.len() > RETRY_CHAIN_LIMIT {
            return retry_refusal(
                &req.idempotency_key,
                Failure::refused(
                    ErrorCode::GraphScopeTooLarge,
                    format!("retry chain {root} exceeds the bounded lookup"),
                ),
                retry_action(&source_id, "pass --run-id to choose a successor explicitly"),
            );
        }
        let prefix = format!("{root}-r");
        let mut highest = 0u64;
        for candidate in &candidates {
            let Some(suffix) = candidate.run_id.strip_prefix(&prefix) else {
                continue;
            };
            if suffix.is_empty() || !suffix.bytes().all(|byte| byte.is_ascii_digit()) {
                continue;
            }
            if candidate.work_id != source.work_id {
                return retry_refusal(
                    &req.idempotency_key,
                    Failure::invalid(format!(
                        "derived retry chain {root} collides with existing run {} on work {}; pass --run-id",
                        candidate.run_id, candidate.work_id
                    )),
                    retry_action(&source_id, "pass --run-id to choose a non-colliding successor"),
                );
            }
            let Some(number) = suffix.parse::<u64>().ok() else {
                return retry_refusal(
                    &req.idempotency_key,
                    Failure::invalid(format!(
                        "retry suffix for {} exceeds the numeric range; pass --run-id",
                        candidate.run_id
                    )),
                    retry_action(
                        &source_id,
                        "pass --run-id to choose the successor explicitly",
                    ),
                );
            };
            highest = highest.max(number);
        }
        let Some(number) = highest.checked_add(1) else {
            return retry_refusal(
                &req.idempotency_key,
                Failure::invalid(format!(
                    "retry suffix for {root} exceeds the numeric range; pass --run-id"
                )),
                retry_action(
                    &source_id,
                    "pass --run-id to choose the successor explicitly",
                ),
            );
        };
        format!("{root}-r{number}")
    };
    let successor = match RunId::new(successor_name.clone()) {
        Ok(id) => id,
        Err(error) => {
            return retry_refusal(
                &req.idempotency_key,
                Failure::invalid(format!(
                    "retry successor {successor_name:?} is invalid: {error}; pass --run-id"
                )),
                retry_action(&source_id, "pass --run-id with a valid successor id"),
            )
        }
    };
    let submit_guard = match super::handoff::acquire_run_submit(ctx, successor.as_str()).await {
        Ok(guard) => guard,
        Err(error) => return err_response(&req.idempotency_key, &error),
    };
    let collision = {
        let id = successor.as_str().to_owned();
        on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&id)).await
    };
    match collision {
        Ok(winner) if explicit_successor || winner.work_id != source.work_id => {
            return retry_refusal(
                &req.idempotency_key,
                Failure::invalid(format!(
                    "retry successor {} already exists on work {}; choose a different --run-id",
                    winner.run_id, winner.work_id
                )),
                retry_action(
                    &source_id,
                    "pass a different --run-id to choose a non-colliding successor",
                ),
            )
        }
        Ok(winner) => {
            return err_response(
                &req.idempotency_key,
                &Failure::invalid(format!(
                    "retry successor {} already exists on work {}; concurrent retry winner is {}",
                    winner.run_id, winner.work_id, winner.run_id
                )),
            )
        }
        Err(error) if error.code == ErrorCode::RunNotFound => {}
        Err(error) => return err_response(&req.idempotency_key, &error),
    }
    let compiled = match ctx.config.compile_definition(
        param_opt_str(&req.params, "profile"),
        param_opt_str(&req.params, "roster"),
    ) {
        Ok(compiled) => compiled,
        Err(errors) => {
            return err_response(
                &req.idempotency_key,
                &Failure::invalid(format!(
                    "execution definition is invalid: {}",
                    serde_json::to_string(&errors)
                        .unwrap_or_else(|_| "validation failed".to_owned())
                )),
            )
        }
    };
    let mut start_params = req.params.clone();
    start_params.insert("bead".to_owned(), json!(source.work_id));
    start_params.insert("repo".to_owned(), json!(source.repo));
    start_params.insert("baseRef".to_owned(), json!(source.base_ref));
    start_params.remove("spec");
    let source_id_for_effect = source_id.clone();
    let successor_for_effect = successor.clone();
    let work_id = source.work_id.clone();
    let response = fenced_dynamic_authorizing_desired(
        ctx,
        "run_retry",
        EffectClass::SafeRetry,
        req,
        move |operation_id| async move {
            let started = create_run_from_definition(
                ctx,
                &start_params,
                work_id.clone(),
                successor_for_effect.clone(),
                compiled,
                operation_id.clone(),
                Some(source_id_for_effect.clone()),
            )
            .await?;
            let spec_event_run = successor_for_effect.as_str().to_owned();
            let spec_event = on_ledger(&ctx.ledger, move |ledger| {
                ledger.latest_event_of_kind(&spec_event_run, "forged.run.spec")
            })
            .await?
            .ok_or_else(|| Failure::internal("retry successor has no frozen spec event"))?;
            let spec_payload: Value = serde_json::from_str(&spec_event.payload_json)
                .map_err(|error| Failure::internal(format!("stored retry spec event: {error}")))?;
            let revision = spec_payload
                .get("workRevision")
                .or_else(|| spec_payload.get("beadRevision"))
                .cloned()
                .ok_or_else(|| Failure::internal("retry successor spec has no revision"))?;
            let (submitted, authorization) = super::handoff::authorize_retry_successor(
                ctx,
                successor_for_effect.as_str(),
                &submit_guard,
            )
            .await?;
            let event = json!({
                "schemaVersion": 1,
                "runId": successor_for_effect.as_str(),
                "retryOf": source_id_for_effect,
                "workId": work_id,
                "revision": revision,
                "packageSha256": started.get("package_sha256"),
                "operationId": operation_id,
                "submission": submitted,
            });
            let event_run = successor_for_effect.as_str().to_owned();
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_event(Some(&event_run), "forged.run.retry.authorized", event)
            })
            .await?;
            Ok((
                json!({
                    "runId": successor_for_effect.as_str(),
                    "retryOf": source_id_for_effect,
                    "workId": work_id,
                    "revision": revision,
                    "packageSha256": started.get("package_sha256"),
                    "profileSha256": started.get("profile_sha256"),
                    "rosterSha256": started.get("roster_sha256"),
                    "protocolRef": started.get("protocol_ref"),
                    "profileRef": started.get("profile_ref"),
                    "rosterRef": started.get("roster_ref"),
                    "branch": started.get("branch"),
                    "baseRef": started.get("base_ref"),
                    "submission": submitted,
                }),
                authorization,
            ))
        },
    )
    .await;
    response
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

async fn recover_applied_frontier_dispatch(
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
            "frontier run start key was stored with a different request",
        ));
    }
    let Some(result) = replay_atomic_run_start(ctx, run_id, &row.operation_id).await? else {
        return Ok(None);
    };
    let response = ok_response(&row.operation_id, false, result);
    let operation_id = row.operation_id;
    let stored = response.clone();
    let desired_id = run_id.as_str().to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.resolve_interrupted_operation_authorizing_desired(
            &operation_id,
            &stored,
            forged_ledger::DesiredSubjectKind::Run,
            &desired_id,
            0,
        )
    })
    .await?;
    let mut replayed = response;
    replayed.reused = true;
    Ok(Some(replayed))
}

/// Recover the applied side of an interrupted atomic run creation without
/// consulting current work. The operation id is written into `forged.run.spec` in
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
        "bead_id": run.work_id,
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

fn packet_stage(view: &forged_proto::RunView, packet_id: &str) -> Option<String> {
    view.packets
        .iter()
        .find(|packet| packet.packet_id == packet_id)
        .map(|packet| {
            forged_proto::stored_packet(packet)
                .ok()
                .and_then(|packet| packet.execution.map(|value| value.stage_id))
                .unwrap_or_else(|| stage_str(packet.stage).to_owned())
        })
}

fn run_status_position<'a>(
    view: &'a forged_proto::RunView,
    action: &'a forged_proto::NextAction,
) -> (Option<String>, Option<&'a str>) {
    if let Some(attempt) = view
        .live_attempts
        .iter()
        .max_by_key(|attempt| attempt.attempt_id)
    {
        return (
            packet_stage(view, &attempt.packet_id),
            Some(attempt.started_at.as_str()),
        );
    }
    let stage = match action {
        forged_proto::NextAction::RunMachine(step) => Some(step.as_str().to_owned()),
        forged_proto::NextAction::OpenPackets(intents) => intents.first().map(|intent| {
            intent
                .execution
                .as_ref()
                .map(|value| value.stage_id.clone())
                .unwrap_or_else(|| stage_str(intent.stage).to_owned())
        }),
        forged_proto::NextAction::AwaitPacket { packet_id, .. } => packet_stage(view, packet_id),
        forged_proto::NextAction::EscalateProfile(_) | forged_proto::NextAction::Stop(_) => None,
    };
    (stage, None)
}

fn run_status_gate_state(view: &forged_proto::RunView) -> Option<&'static str> {
    if let Some(passed) = view
        .proto_events
        .iter()
        .rev()
        .find_map(|event| match event {
            forged_proto::ProtoEvent::Gate { passed, .. } => Some(*passed),
            _ => None,
        })
    {
        return Some(if passed { "passed" } else { "failed" });
    }
    view.terminal_attempts
        .values()
        .flatten()
        .filter_map(|attempt| {
            let forged_types::Outcome::Implement {
                gate_state: Some(state),
                ..
            } = attempt.outcome.as_ref()?
            else {
                return None;
            };
            let state = match state.as_str() {
                "pass" => "passed",
                "fail" => "failed",
                _ => return None,
            };
            Some((attempt.attempt_id, state))
        })
        .max_by_key(|(attempt_id, _)| *attempt_id)
        .map(|(_, state)| state)
}

pub(crate) fn run_projection_actions(
    run: &forged_ledger::RunRow,
) -> Vec<forged_types::OperationActionV1> {
    if run.state == RunState::Active {
        return vec![action(
            "run stop",
            json!({"run": run.run_id, "outcome": null, "reason": null}),
            "choose the terminal outcome and reason before stopping the run",
        )];
    }
    if run.terminal_outcome == Some(forged_ledger::RunOutcome::Landed) {
        return vec![action(
            "work show",
            json!({"id": run.work_id}),
            "inspect the delivered work and its immutable evidence",
        )];
    }
    if let Some(successor) = &run.superseded_by {
        return vec![action(
            "run status",
            json!({"run": successor}),
            format!("inspect successor run {successor}"),
        )];
    }
    match run.terminal_outcome {
        Some(forged_ledger::RunOutcome::Clean | forged_ledger::RunOutcome::AcceptedRisk) => {
            return vec![
                classified_action(
                    "run stop",
                    json!({
                        "run": run.run_id,
                        "outcome": "landed",
                        "reason": null,
                        "pr": null,
                        "sha": null,
                    }),
                    "merge the reviewed PR on GitHub first",
                    forged_types::ActionClass::Should,
                ),
                retry_action(&run.run_id, retry_reason(run)),
            ];
        }
        Some(forged_ledger::RunOutcome::Blocked | forged_ledger::RunOutcome::InputRequired) => {
            return vec![
                classified_action(
                    "work update",
                    json!({
                        "id": run.work_id,
                        "expectedRevision": null,
                        "description": null,
                    }),
                    retry_reason(run),
                    forged_types::ActionClass::Should,
                ),
                retry_action(&run.run_id, retry_reason(run)),
            ];
        }
        Some(forged_ledger::RunOutcome::Superseded) => {
            unreachable!("superseded implies a recorded successor")
        }
        Some(forged_ledger::RunOutcome::Cancelled) | None => {}
        Some(forged_ledger::RunOutcome::Landed) => unreachable!("handled above"),
    }
    let mut supersede = work_supersede_action(&run.work_id);
    supersede.reason =
        "use work supersede when the spec must change; create the successor first with work create"
            .to_owned();
    vec![retry_action(&run.run_id, retry_reason(run)), supersede]
}

pub(crate) async fn run_retry_of(ctx: &Ctx, run_id: &str) -> Result<Option<String>, Failure> {
    let run_id = run_id.to_owned();
    let event = on_ledger(&ctx.ledger, move |ledger| {
        Ok(ledger
            .latest_event_of_kind(&run_id, "forged.run.retry.authorized")?
            .or(ledger.latest_event_of_kind(&run_id, "forged.run.spec")?))
    })
    .await?;
    event
        .map(|event| {
            serde_json::from_str::<Value>(&event.payload_json)
                .map_err(|error| Failure::internal(format!("stored retry provenance: {error}")))
                .map(|payload| {
                    payload
                        .get("retryOf")
                        .and_then(Value::as_str)
                        .map(str::to_owned)
                })
        })
        .transpose()
        .map(Option::flatten)
}

/// `run status` — read-only projection of one run.
pub async fn run_status(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("run_status", req, || async {
        let run_id = param_str(&req.params, "run")?;
        let view = super::drive::project(ctx, run_id).await?;
        let run_id_owned = run_id.to_owned();
        let (definition, revision, protocol_terminal, admission_decisions, deadline_kills) =
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
                    ledger.count_attempts_with_revoke_scope(
                        &run_id_owned,
                        RevokeScope::Deadline,
                    )?,
                ))
            })
            .await?;
        let action = forged_proto::advance(&view);
        let (current_stage, started_at) = run_status_position(&view, &action);
        let gate_state = run_status_gate_state(&view);
        let controller = super::handoff::controller_status(ctx, run_id).await?;
        let identity =
            super::work_identity::load(ctx, WorkIdentitySubjectKind::Run, run_id).await?;
        let retry_of = run_retry_of(ctx, run_id).await?;
        let herdr_layout = super::herdr_layout::status(
            ctx,
            forged_types::HerdrLayoutSubjectV1 {
                kind: forged_types::HerdrLayoutSubjectKind::Run,
                id: run_id.to_owned(),
            },
        )
        .await;
        let expected_assignee = crate::core::run_holder(&view.run.work_id);
        let claim_health = match super::workstore::show_issue(&ctx.ledger, &view.run.work_id).await
        {
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
                        "Work is assigned to {}, expected {expected_assignee}",
                        issue.assignee.as_deref().unwrap_or("nobody")
                    )
                } else if awaiting_delivery {
                    "Reviewed delivery retains its work claim until the PR lands".to_owned()
                } else if stale {
                    "Work remains in_progress although durable execution is no longer live".to_owned()
                } else {
                    "Live work claim agrees with execution evidence".to_owned()
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
                "detail": format!("Work unavailable: {error}"),
            }),
        };
        let definition = match definition {
            Some(row) => json!({
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
                "policyRevision": view.active_policy_revision.as_ref()
                    .map(|value| value.revision),
                "activePolicySha256": view.active_policy_revision.as_ref()
                    .map(|value| &value.policy_sha256),
                "policy": &view.policy,
            }),
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
                        "policyRevision": row.policy_revision,
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
        let mut run = json!({
                "runId": view.run.run_id,
                "retryOf": retry_of,
                "identity": identity,
                "herdrLayout": herdr_layout,
                "beadId": view.run.work_id,
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
                    "policyRevision": p.policy_revision,
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
                "deadlineKills": deadline_kills,
                "nextActions": run_projection_actions(&view.run),
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
        });
        let run = run
            .as_object_mut()
            .expect("run status projection is an object");
        if let Some(current_stage) = current_stage {
            run.insert(
                "currentStage".to_owned(),
                Value::String(current_stage),
            );
        }
        if let Some(gate_state) = gate_state {
            run.insert(
                "gateState".to_owned(),
                Value::String(gate_state.to_owned()),
            );
        }
        if let Some(started_at) = started_at {
            run.insert(
                "startedAt".to_owned(),
                Value::String(started_at.to_owned()),
            );
        }
        let subject = super::work_identity::projection_subject(
            &identity,
            forged_types::ProjectionSubjectKind::Run,
            run_id,
        );
        Ok(forged_types::with_work_twins(json!({
            "subject": subject,
            "run": run,
        })))
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

// ------------------------------------------------------ run revise policy

pub(crate) fn splice_policy(
    standing: &ExecutionPolicyV1,
    current: ExecutionPolicyV1,
) -> ExecutionPolicyV1 {
    ExecutionPolicyV1 {
        gate_commands: current.gate_commands,
        stage_budget_s: current.stage_budget_s,
        transport_retry_budget: current.transport_retry_budget,
        seat_commands: current.seat_commands,
        deadline_retry_budget: current.deadline_retry_budget,
        seat_env: current.seat_env,
        termination_grace_s: standing.termination_grace_s,
        host_policy: standing.host_policy,
        herdr_socket: standing.herdr_socket.clone(),
    }
}

/// Append a config-sourced operational-policy revision while retaining the
/// standing identity-adjacent fields.
pub async fn run_revise_policy(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let run_id = match param_str(&req.params, "run") {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(&derive_key("run_revise_policy", None, None, None), &error)
        }
    };
    let reason = match param_str(&req.params, "reason") {
        Ok(value) if !value.trim().is_empty() => value.to_owned(),
        Ok(_) => {
            return err_response(
                &derive_key("run_revise_policy", Some(&run_id), None, None),
                &Failure::invalid("policy revision requires a non-empty reason"),
            )
        }
        Err(error) => {
            return err_response(
                &derive_key("run_revise_policy", Some(&run_id), None, None),
                &error,
            )
        }
    };
    for field in [
        "gateCommands",
        "gate_commands",
        "stageBudgetS",
        "stage_budget_s",
        "transportRetryBudget",
        "transport_retry_budget",
    ] {
        if req.params.contains_key(field) {
            return err_response(
                &derive_key("run_revise_policy", Some(&run_id), None, None),
                &Failure::invalid(
                    "policy fields are sourced only from current config; edit config.yaml, then \
                     run `forged run revise-policy --run <id> --reason <reason>`",
                ),
            );
        }
    }
    let definition = {
        let run_for_lookup = run_id.clone();
        match on_ledger(&ctx.ledger, move |ledger| {
            ledger.get_run_definition(&run_for_lookup)
        })
        .await
        {
            Ok(Some(value)) => value,
            Ok(None) => {
                return err_response(
                    &derive_key("run_revise_policy", Some(&run_id), None, None),
                    &Failure::invalid("legacy run has no revisable policy"),
                )
            }
            Err(error) => {
                return err_response(
                    &derive_key("run_revise_policy", Some(&run_id), None, None),
                    &error,
                )
            }
        }
    };
    let package: ExecutionPackageV1 = match serde_json::from_str(&definition.package_json) {
        Ok(value) => value,
        Err(error) => {
            return err_response(
                &derive_key("run_revise_policy", Some(&run_id), None, None),
                &Failure::internal(format!("stored execution package does not parse: {error}")),
            )
        }
    };
    let latest = {
        let run_for_lookup = run_id.clone();
        match on_ledger(&ctx.ledger, move |ledger| {
            ledger.latest_policy_revision(&run_for_lookup)
        })
        .await
        {
            Ok(value) => value,
            Err(error) => {
                return err_response(
                    &derive_key("run_revise_policy", Some(&run_id), None, None),
                    &error,
                )
            }
        }
    };
    let standing = match latest.as_ref() {
        Some(row) => match serde_json::from_str::<ExecutionPolicyV1>(&row.policy_json) {
            Ok(value) => value,
            Err(error) => {
                return err_response(
                    &derive_key("run_revise_policy", Some(&run_id), None, None),
                    &Failure::internal(format!("stored policy revision does not parse: {error}")),
                )
            }
        },
        None => package.policy,
    };
    let current = match ctx.config.execution_policy() {
        Ok(value) => value,
        Err(errors) => {
            return err_response(
                &derive_key("run_revise_policy", Some(&run_id), None, None),
                &Failure::invalid(format!(
                    "policy revision is invalid: {}",
                    serde_json::to_string(&errors)
                        .unwrap_or_else(|_| "validation failed".to_owned())
                )),
            )
        }
    };
    let policy = splice_policy(&standing, current);
    if let Some(error) = policy.validate().into_iter().next() {
        return err_response(
            &derive_key("run_revise_policy", Some(&run_id), None, None),
            &Failure::invalid(format!(
                "policy revision is invalid at {}: {}",
                error.path, error.message
            )),
        );
    }
    let policy_sha256 = match crate::config::digest_of(&policy) {
        Ok(value) => value,
        Err(error) => {
            return err_response(
                &derive_key("run_revise_policy", Some(&run_id), None, None),
                &Failure::internal(format!("digesting policy revision: {error}")),
            )
        }
    };
    let matching_latest = latest
        .as_ref()
        .is_some_and(|row| row.policy_sha256 == policy_sha256 && row.reason == reason);
    let revision = if matching_latest {
        latest.as_ref().map(|row| row.revision).unwrap_or(1)
    } else {
        latest
            .as_ref()
            .map(|row| row.revision)
            .unwrap_or(0)
            .saturating_add(1)
    };
    default_key(
        req,
        derive_key(
            "run_revise_policy",
            Some(&run_id),
            None,
            Some(i64::from(revision)),
        ),
    );
    req.params.insert(
        "policySha256".to_owned(),
        Value::String(policy_sha256.clone()),
    );
    if req.run_id.is_none() {
        req.run_id = Some(run_id.clone());
    }
    fenced(
        ctx,
        "run_revise_policy",
        EffectClass::SafeRetry,
        req,
        None,
        move |operation| async move {
            let _submit_guard = super::handoff::acquire_run_submit(ctx, &run_id).await?;
            let row = {
                let run_id = run_id.clone();
                let digest = policy_sha256.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_policy_revision(&run_id, policy, digest, reason, operation)
                })
                .await?
            };
            let policy: Value = serde_json::from_str(&row.policy_json)
                .map_err(|error| Failure::internal(format!("stored policy revision: {error}")))?;
            Ok(json!({
                "run_id": row.run_id,
                "revision": row.revision,
                "policy": policy,
                "policy_sha256": row.policy_sha256,
                "reason": row.reason,
            }))
        },
    )
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
    // A terminal review failure normally settles the run before an operator
    // can accept its risk. Read the preserved protocol terminal (or an
    // existing acceptance) so the evidence gate survives the stopped state
    // projection.
    let persisted_review_rounds = {
        let event_run = run_id.clone();
        match on_ledger(&ctx.ledger, move |ledger| {
            let mut accepted = None;
            let mut terminal_rounds = None;
            for event in ledger.list_events(Some(&event_run), 0, 4096)? {
                let payload: Value = serde_json::from_str(&event.payload_json)?;
                match event.kind.as_str() {
                    "forged.review.risk_accepted" => {
                        accepted = payload.get("reviewRounds").and_then(Value::as_u64);
                    }
                    "run.protocol-terminal" => {
                        terminal_rounds = risk_terminal_review_rounds(&payload).map(u64::from);
                    }
                    _ => {}
                }
            }
            Ok(accepted
                .or(terminal_rounds)
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
                    forged_proto::NextAction::Stop(forged_proto::Terminal::RemediationFailed {
                        round,
                        ..
                    }) => round,
                    forged_proto::NextAction::Stop(forged_proto::Terminal::Done {
                        review_rounds,
                        final_verdict,
                        ..
                    }) if final_verdict != Some(forged_types::Verdict::Approve) => review_rounds,
                    _ => return err_response(
                        &derive_key("run_accept_risk", Some(&run_id), Some(&accepted_by), None),
                        &Failure::invalid(
                            "risk can be accepted only after a terminal non-approve review outcome",
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

pub(crate) fn risk_terminal_review_rounds(payload: &Value) -> Option<u8> {
    let terminal = payload.get("terminal")?;
    if let Some(value) = terminal.get("reviewBudgetExhausted") {
        if !is_non_approve_terminal_verdict(value) {
            return None;
        }
        return value
            .get("reviewRounds")
            .and_then(Value::as_u64)
            .and_then(|rounds| u8::try_from(rounds).ok());
    }
    if let Some(value) = terminal.get("remediationFailed") {
        if !is_non_approve_terminal_verdict(value) {
            return None;
        }
        return value
            .get("round")
            .and_then(Value::as_u64)
            .and_then(|round| u8::try_from(round).ok());
    }
    let done = terminal.get("done")?;
    if !is_non_approve_terminal_verdict(done) {
        return None;
    }
    done.get("reviewRounds")
        .and_then(Value::as_u64)
        .and_then(|rounds| u8::try_from(rounds).ok())
}

fn is_non_approve_terminal_verdict(value: &Value) -> bool {
    matches!(
        value.get("finalVerdict"),
        Some(Value::String(verdict)) if matches!(verdict.as_str(), "requestChanges" | "block")
    ) || value.get("finalVerdict") == Some(&Value::Null)
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
        let identity =
            super::work_identity::load(ctx, WorkIdentitySubjectKind::Run, &row.run_id).await?;
        let subject = super::work_identity::projection_subject(
            &identity,
            forged_types::ProjectionSubjectKind::Run,
            &row.run_id,
        );
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
        Ok(forged_types::with_work_twins(json!({
            "subject": subject,
            "packet": packet,
            "policyRevision": row.policy_revision,
            "attempts": attempts,
        })))
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
            // run's work lease holder — see `core::session_claimant`.
            let view = super::drive::project(ctx, &row.run_id).await?;
            let packet_admission = super::admission::PacketAdmission {
                packet_id: packet_id.clone(),
                run_id: row.run_id.clone(),
                work_id: view.run.work_id.clone(),
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
                        "packet {packet_id} deferred by admission: {}",
                        super::admission::decision_reason(&admission.decision)
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
                super::spec::resolve_for_packet(ctx, &spec_ref, &view.run.work_id).await?;
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
    let result_value = match req.params.get("result").cloned() {
        Some(result) => result,
        None => {
            return err_response(
                &req.idempotency_key,
                &Failure::invalid("missing required param \"result\""),
            )
        }
    };
    let result: forged_types::PacketResult = match serde_json::from_value(result_value) {
        Ok(result) => result,
        Err(error) => {
            return err_response(
                &req.idempotency_key,
                &Failure::invalid(format!("result is not a PacketResult: {error}")),
            )
        }
    };
    // Replay and in-progress recovery come BEFORE the closed-set gate: a
    // request stored before this vocabulary existed (legacy prose
    // gateState) must keep replaying its stored response verbatim on a
    // byte-identical retry, and an in-flight row keeps answering through
    // the fence. Only a FRESH request faces validation; a fresh writer
    // racing itself stores the identical already-valid payload, so the
    // probe-then-validate window cannot strand anything.
    let existing = {
        let key = req.idempotency_key.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.find_operation("packet_complete", &key)
        })
        .await
    };
    let existing = match existing {
        Ok(row) => row,
        Err(error) => return err_response(&req.idempotency_key, &error),
    };
    if existing.is_none() {
        let view = match super::drive::project(ctx, &run_id).await {
            Ok(view) => view,
            Err(error) => return err_response(&req.idempotency_key, &error),
        };
        let packet = match view
            .packets
            .iter()
            .find(|packet| packet.packet_id == packet_id)
            .ok_or_else(|| Failure::invalid(format!("packet {packet_id:?} does not exist")))
            .and_then(|row| {
                forged_proto::stored_packet(row).map_err(|error| {
                    Failure::internal(format!("stored packet body does not parse: {error}"))
                })
            }) {
            Ok(packet) => packet,
            Err(error) => return err_response(&req.idempotency_key, &error),
        };
        if let Err(message) = crate::adapters::extract::validate_result_for_packet(
            &result,
            view.execution_package
                .as_ref()
                .map(|package| &package.protocol_ref),
            packet.execution.as_ref().map(|execution| execution.purpose),
        ) {
            return err_response(&req.idempotency_key, &Failure::invalid(message));
        }
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
                forged_proto::FailureKind::Readmit => "readmit",
                forged_proto::FailureKind::Semantic => "semantic",
            };
            Ok(json!({"classification": classification, "note": note}))
        }
    })
    .await
}

// ------------------------------------------------------ packet heartbeat

/// `packet heartbeat` — deliberately unfenced because a heartbeat is a
/// naturally idempotent lease renewal. It carries the envelope, defaults its
/// key the way a read does, and never touches the operation store; re-sending
/// one is always safe.
pub async fn packet_heartbeat(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    unfenced_write("packet_heartbeat", req, || async {
        let claim_token = param_str(&req.params, "claimToken")?.to_owned();
        on_ledger(&ctx.ledger, move |l| l.heartbeat_attempt(&claim_token)).await?;
        Ok(json!({"renewed": true}))
    })
    .await
}

// -------------------------------------------------------------- gate run

/// Bind the envelope identity to the run selected by operation params.
/// MCP callers can supply both aliases independently; refusing disagreement
/// before projection or fencing keeps the durable operation and its effect on
/// the same run. The CLI always supplies matching values.
fn bind_envelope_run(
    req: &mut OperationRequest,
    operation: &str,
    run_id: &str,
) -> Result<(), Failure> {
    if let Some(envelope) = req.run_id.as_deref() {
        if envelope != run_id {
            return Err(Failure::invalid(format!(
                "{operation} envelope runId {envelope:?} conflicts with params.run {run_id:?}"
            )));
        }
    }
    req.run_id = Some(run_id.to_owned());
    Ok(())
}

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
    if let Err(error) = bind_envelope_run(req, "gate_run", &run_id) {
        return err_response(&req.idempotency_key, &error);
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
                termination_grace_s: view.policy.termination_grace_s,
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
    unfenced_write("usage_ingest", req, || async {
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
        "pi" => PiDriver.parse_usage(stdout, model)?,
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
pub(super) const LIFECYCLE_KINDS: [&str; 9] = [
    epic::STARTED,
    epic::PAUSED,
    epic::RESUMED,
    epic::ABANDONED,
    epic::EPIC_PR,
    epic::ASSURANCE_COMPLETED,
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
/// both: it is the precedence the epic reconciler applies when it stops, and an
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
    // Epoch boundaries (an abandon, or the start that opens the next
    // epoch) are FACTS that supersede anything earlier — terminal folds
    // included — while within one epoch the old precedence stands: a
    // draft-PR terminal is never reopened by a later control event.
    let mut boundaries: BTreeMap<String, i64> = BTreeMap::new();
    // ABANDONED folds as stopped-with-reason and STARTED as active so a
    // fresh epoch's start (a later event) supersedes the dead epoch's
    // boundary — and every control event from an epoch that ended is
    // superseded by that epoch's own ABANDONED, all by append position.
    for kind in [epic::PAUSED, epic::RESUMED, epic::ABANDONED, epic::STARTED] {
        for event in snapshot.events(kind) {
            let Some(epic_id) = event.run_id.clone() else {
                continue;
            };
            if kind == epic::ABANDONED || kind == epic::STARTED {
                let seen = boundaries.entry(epic_id.clone()).or_insert(0);
                *seen = (*seen).max(event.event_id);
            }
            let lifecycle = if kind == epic::PAUSED {
                EpicLifecycle {
                    state: "paused",
                    stop_reason: reason_of(&event.payload_json),
                }
            } else if kind == epic::ABANDONED {
                EpicLifecycle {
                    state: "stopped",
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
    // Terminal folds stay terminal over the CONTROL events of their own
    // epoch, but an abandon boundary or a fresh start written AFTER them is
    // a later fact.
    let mut boundary_aware = |epic_id: String, event_id: i64, lifecycle: EpicLifecycle| {
        let later_boundary = boundaries
            .get(&epic_id)
            .is_some_and(|boundary| *boundary > event_id);
        if !later_boundary {
            control.insert(epic_id, (event_id, lifecycle));
        }
    };
    for event in snapshot.events(epic::EPIC_PR) {
        let Some(epic_id) = event.run_id.clone() else {
            continue;
        };
        let nonterminal = serde_json::from_str::<Value>(&event.payload_json)
            .ok()
            .and_then(|payload| payload.get("terminal").and_then(Value::as_bool))
            == Some(false);
        if nonterminal {
            continue;
        }
        boundary_aware(
            epic_id,
            event.event_id,
            EpicLifecycle {
                state: "submitted",
                stop_reason: Value::Null,
            },
        );
    }
    for event in snapshot.events(epic::ASSURANCE_COMPLETED) {
        let Some(epic_id) = event.run_id.clone() else {
            continue;
        };
        boundary_aware(
            epic_id,
            event.event_id,
            EpicLifecycle {
                state: "submitted",
                stop_reason: Value::Null,
            },
        );
    }
    control
        .into_iter()
        .map(|(epic_id, (_, lifecycle))| (epic_id, lifecycle))
        .collect()
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
/// work id, and the sole production writer of `runs` is `run_start`, called
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
        // The LATEST start's payload wins — a restarted epic reports the
        // fresh epoch's geometry — while createdAt keeps the first start.
        let payload = serde_json::from_str(&event.payload_json).unwrap_or(Value::Null);
        epics
            .entry(epic_id)
            .and_modify(|(_, stored)| *stored = payload.clone())
            .or_insert_with(|| (event.ts.clone(), payload));
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
        let work_id = identity.work.id.clone();
        let mut entry = json!({
            "id": run.run_id.clone(),
            "kind": if epic { "epic" } else { "slice" },
            "identity": identity,
            "beadId": work_id,
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
        let work_id = identity.work.id.clone();
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
            "beadId": work_id,
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
/// Work is queried once for exactly the ids in the ledger. Controller
/// records and progress events come from the already-open inventory
/// snapshot, avoiding a ledger projection per row.
pub(super) fn operator_queue(
    snapshot: &InventorySnapshot,
    entries: &mut [Value],
    attention: &[Value],
    work_read: Result<Vec<crate::core::work_types::IssueSummary>, String>,
) -> Value {
    let work_error = work_read.as_ref().err().cloned();
    let work: BTreeMap<String, crate::core::work_types::IssueSummary> = work_read
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
        let work_id = entry
            .get("workId")
            .or_else(|| entry.get("beadId"))
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned();
        let record = controller_records.remove(&id).map(|(_, record)| record);
        let controller = durable_controller_status(snapshot, &id, record);
        let issue = work.get(&work_id);
        // Human-readable identity is frozen with the work. The bounded
        // The work read below remains authoritative for claim health and
        // repository membership, but a later rename or outage must not
        // rewrite historical display state.
        let title = entry
            .pointer("/identity/displayTitle")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned();
        let expected = crate::core::run_holder(&work_id);
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
            work_error
                .as_deref()
                .map(|error| format!("Work unavailable: {error}"))
                .unwrap_or_else(|| "Work was not returned by the bounded live read".to_owned())
        } else if holder_mismatch {
            format!(
                "Work is assigned to {}, expected {expected}",
                assignee.unwrap_or("nobody")
            )
        } else if awaiting_delivery {
            "Reviewed delivery retains its work claim until the PR lands".to_owned()
        } else if stale {
            "Work remains in_progress although durable execution is no longer live".to_owned()
        } else if claim_status == Some("blocked") {
            "Work is blocked in the authoritative live store".to_owned()
        } else if claim_status == Some("closed") && !visibly_terminal {
            "Work is closed while durable execution is not settled".to_owned()
        } else {
            "Live work claim agrees with execution evidence".to_owned()
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
        let entry_desired = snapshot
            .desired_work
            .iter()
            .find(|row| row.subject_id == id);
        let entry_deferred = snapshot
            .admission_decisions
            .iter()
            .find(|decision| decision.subject_id == id)
            .is_some_and(|decision| decision.outcome == forged_types::AdmissionOutcome::Deferred);
        let execution_health =
            super::health::execution_health(super::health::HealthInputs::portfolio(
                visibly_terminal,
                entry_deferred,
                entry_desired,
                if execution_live {
                    Some(true)
                } else if dead_controller {
                    Some(false)
                } else {
                    None
                },
            ));
        if let Some(object) = entry.as_object_mut() {
            object.insert(
                "executionHealth".to_owned(),
                Value::String(execution_health.to_owned()),
            );
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

/// Normalize one repository identity without consulting the filesystem.
///
/// Existing absolute checkout paths are collapsed lexically (`//`, `.`, and
/// `..`) but never canonicalized through the live checkout: a checkout rename
/// must not silently turn a stored identity into another one. Non-path
/// identities are retained as exact strings so a future remote identity can
/// use this same public selector.
pub(super) fn repository_selector(
    req: &OperationRequest,
    operation: &str,
) -> Result<Option<String>, Failure> {
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

fn work_status_selector(
    req: &OperationRequest,
    operation: &str,
) -> Result<Option<WorkStatus>, Failure> {
    let Some(value) = req.params.get("status") else {
        return Ok(None);
    };
    let value = value
        .as_str()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            Failure::invalid(format!("{operation} status must be a non-empty string"))
        })?;
    WorkStatus::parse(value).map(Some).ok_or_else(|| {
        Failure::invalid(format!(
            "{operation} status {value:?} is not open, in_progress, blocked, deferred, or closed"
        ))
    })
}

fn assignee_selector(req: &OperationRequest, operation: &str) -> Result<Option<String>, Failure> {
    let Some(value) = req.params.get("assignee") else {
        return Ok(None);
    };
    let value = value
        .as_str()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            Failure::invalid(format!("{operation} assignee must be a non-empty string"))
        })?;
    Ok(Some(value.to_owned()))
}

/// `work list` — the discovery surface, serving 30 summary rows by default or
/// the exact bounded subset selected from native work status, custody, and
/// metadata. `detail=full` restores the diagnostic row fields.
///
/// The one entry point that takes no id, so a caller with no prior knowledge
/// can enumerate the inventory and then address any entry.
pub async fn work_list(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("work_list", req, || async {
        let projection = operations_projection(ctx, req).await?;
        if ["repo", "status", "assignee"]
            .iter()
            .any(|key| req.params.contains_key(*key))
            && projection
                .pointer("/sourceHealth/work/state")
                .or_else(|| projection.pointer("/sourceHealth/beads/state"))
                .and_then(Value::as_str)
                != Some("available")
        {
            return Err(Failure {
                code: ErrorCode::WorkError,
                message: "work_list filtered membership is unavailable".to_owned(),
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
            .unwrap_or_else(|| json!({"counts": {"decisions": 0, "symptoms": 0, "acknowledged": 0}, "decisions": []}));
        let total = projection
            .pointer("/counts/durable")
            .and_then(Value::as_u64)
            .unwrap_or(total as u64);
        Ok(forged_types::with_work_twins(json!({
            "subject": {
                "id": "portfolio",
                "kind": "portfolio",
                "title": "Forged work inventory",
                "repository": req.params.get("repo"),
                "revision": Value::Null,
            },
            "runs": runs,
            "queue": {
                "groups": groups,
                "total": total,
                "cap": projection.pointer("/coverage/limit").cloned().unwrap_or(json!(OPERATIONS_DEFAULT_LIMIT)),
                "asOf": projection.pointer("/capturedAt/ledger").cloned().unwrap_or(Value::Null),
            },
            "coverage": projection.get("coverage").cloned().unwrap_or(Value::Null),
            "attentionTotal": projection.pointer("/counts/attention").cloned().unwrap_or(json!(0)),
            "attention": attention,
            "sourceHealth": projection.get("sourceHealth").cloned().unwrap_or(Value::Null),
        })))
    })
    .await
}

/// Legacy discovery never included plan-only work. Preserve that boundary
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
                .filter(|entry| {
                    let source = entry
                        .get("source")
                        .or_else(|| entry.pointer("/subject/source"))
                        .and_then(Value::as_str);
                    source == Some("durable")
                        || (source.is_none()
                            && entry.pointer("/subject/kind").and_then(Value::as_str)
                                != Some("plan"))
                })
                .map(|entry| (*entry).clone())
                .collect::<Vec<_>>();
            let live_plan = rows
                .iter()
                .filter(|entry| {
                    let source = entry
                        .get("source")
                        .or_else(|| entry.pointer("/subject/source"))
                        .and_then(Value::as_str);
                    source == Some("live-plan")
                        || (source.is_none()
                            && entry.pointer("/subject/kind").and_then(Value::as_str)
                                == Some("plan"))
                })
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

const OPERATIONS_DEFAULT_LIMIT: u64 = 30;
const OPERATIONS_MAX_LIMIT: u64 = 200;
const LIVE_PLAN_LIMIT: usize = 500;

#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum ProjectionDetail {
    Summary,
    Full,
}

pub(super) fn projection_detail(
    req: &OperationRequest,
    operation: &str,
) -> Result<ProjectionDetail, Failure> {
    match req.params.get("detail") {
        None => Ok(ProjectionDetail::Summary),
        Some(Value::String(value)) if value == "summary" => Ok(ProjectionDetail::Summary),
        Some(Value::String(value)) if value == "full" => Ok(ProjectionDetail::Full),
        Some(_) => Err(Failure::invalid(format!(
            "{operation} detail must be \"summary\" or \"full\""
        ))),
    }
}

pub(super) fn projection_symptoms(
    req: &OperationRequest,
    operation: &str,
) -> Result<bool, Failure> {
    match req.params.get("symptoms") {
        None => Ok(false),
        Some(Value::Bool(value)) => Ok(*value),
        Some(_) => Err(Failure::invalid(format!(
            "{operation} symptoms must be a boolean"
        ))),
    }
}

/// The entry's classed next actions: every unresolved attention item's
/// `nextActions`, deduplicated by (verb, args). A summary row keeps the
/// typed `next` the driver reads (ADR-0036) without carrying the items.
fn operations_next_actions(entry: &Value) -> Value {
    let mut actions: Vec<Value> = Vec::new();
    for item in entry
        .pointer("/attentionItems/items")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        if item.get("state").and_then(Value::as_str) == Some("resolved") {
            continue;
        }
        for action in item
            .get("nextActions")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
        {
            let duplicate = actions.iter().any(|seen| {
                seen.get("verb") == action.get("verb") && seen.get("args") == action.get("args")
            });
            if !duplicate {
                actions.push(action.clone());
            }
        }
    }
    Value::Array(actions)
}

fn operations_attention_counts(entry: &Value) -> Value {
    let mut decisions = 0usize;
    let mut symptoms = 0usize;
    for item in entry
        .pointer("/attentionItems/items")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        let condition = item
            .get("condition")
            .cloned()
            .and_then(|value| serde_json::from_value::<AttentionCondition>(value).ok());
        match condition.map(super::attention::classification) {
            Some(super::attention::AttentionClass::Decision) => decisions += 1,
            Some(super::attention::AttentionClass::Symptom) => symptoms += 1,
            None => {}
        }
    }
    json!({"decisions": decisions, "symptoms": symptoms})
}

fn operations_subject(entry: &Value) -> Value {
    let identity = entry.get("identity").cloned().unwrap_or(Value::Null);
    let id = entry.get("id").and_then(Value::as_str);
    let title = entry
        .pointer("/titleSource/value")
        .and_then(Value::as_str)
        .or_else(|| entry.get("title").and_then(Value::as_str))
        .or_else(|| identity.get("displayTitle").and_then(Value::as_str))
        .map(|title| {
            let concise = title
                .strip_suffix(']')
                .and_then(|title| title.rsplit_once(" [").map(|(title, _)| title))
                .unwrap_or(title);
            if concise.strip_prefix("bead-") == id {
                id.unwrap_or(concise)
            } else {
                concise
            }
        });
    json!({
        "kind": if entry.get("source").and_then(Value::as_str) == Some("live-plan") {
            if entry.get("kind").and_then(Value::as_str) == Some("epic") {
                json!("epic")
            } else {
                json!("work")
            }
        } else {
            identity.pointer("/subject/kind").cloned().unwrap_or_else(|| {
                if entry.get("kind").and_then(Value::as_str) == Some("epic") {
                    json!("epic")
                } else {
                    json!("run")
                }
            })
        },
        "id": entry.get("id").cloned().unwrap_or(Value::Null),
        "title": title,
        "repository": identity.pointer("/repository/path")
            .cloned()
            .or_else(|| entry.get("repo").cloned())
            .unwrap_or(Value::Null),
        "revision": identity.pointer("/bead/revision")
            .or_else(|| identity.pointer("/work/revision"))
            .cloned()
            .unwrap_or(Value::Null),
    })
}

fn operations_claim_health(entry: &Value) -> Value {
    let claim = entry.get("claimHealth").unwrap_or(&Value::Null);
    if claim.get("known").and_then(Value::as_bool) != Some(true) {
        json!("unknown")
    } else if claim.get("staleInProgress").and_then(Value::as_bool) == Some(true) {
        json!("stale")
    } else {
        json!("ok")
    }
}

fn operations_next_action(entry: &Value) -> Value {
    match entry.get("queueGroup").and_then(Value::as_str) {
        Some("Planned") => {
            if entry.get("source").and_then(Value::as_str) == Some("live-plan") {
                json!("run start")
            } else {
                json!("run submit")
            }
        }
        Some("Stalled or recoverable") => json!("verify controller, then resubmit"),
        _ => entry.get("nextAction").cloned().unwrap_or(Value::Null),
    }
}

fn operations_entry(entry: Value, detail: ProjectionDetail) -> Value {
    let subject = operations_subject(&entry);
    let attention = operations_attention_counts(&entry);
    if detail == ProjectionDetail::Full {
        let mut entry = entry;
        if let Some(object) = entry.as_object_mut() {
            object.insert("subject".to_owned(), subject);
            object.insert("attention".to_owned(), attention);
        }
        return entry;
    }
    let mut summary = json!({
        "subject": subject,
        "state": entry.get("state").cloned().unwrap_or(Value::Null),
        "executionHealth": entry.get("executionHealth").cloned().unwrap_or(Value::Null),
        "claimHealth": operations_claim_health(&entry),
        "currentStage": entry.get("currentStage").cloned().unwrap_or(Value::Null),
        "liveSeats": entry.get("liveSeats").cloned().unwrap_or(json!(0)),
        "spend": entry.get("spend").cloned().unwrap_or(Value::Null),
        "nextAction": operations_next_action(&entry),
        "next": operations_next_actions(&entry),
        "pr": entry.get("pr").cloned().unwrap_or(Value::Null),
        "delivery": entry.get("delivery").cloned().unwrap_or(Value::Null),
        "attention": attention,
    });
    if entry.get("source").and_then(Value::as_str) == Some("live-plan") {
        let plan = entry.get("plan").unwrap_or(&Value::Null);
        summary["plan"] = json!({
            "status": plan.get("status"),
            "readiness": plan.get("readiness"),
            "issueType": plan.get("issueType"),
            "priority": plan.get("priority"),
            "assignee": plan.get("assignee"),
            "parent": plan.get("parent"),
            "dependencyCount": plan
                .get("dependencies")
                .and_then(Value::as_array)
                .map_or(0, Vec::len),
        });
    }
    summary
}

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
    plan: &crate::core::work_types::PlanIssue,
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

            forged_types::AdmissionResourceClass::Gate => "gate",
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
                "beadId": identity.work.id,
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

/// The exact, unique Work ids one bounded live read covers.
///
/// Several runs legitimately share one Work — a resubmission, a superseded
/// attempt, an epic child re-driven — so the per-row ledger projection is not
/// a set. The exact-hydrate contract requires one row per requested id;
/// handing it a repeat fails the whole read closed.
pub(super) fn entry_work_ids(entries: &[Value]) -> Vec<String> {
    entries
        .iter()
        .filter_map(|entry| {
            entry
                .get("workId")
                .or_else(|| entry.get("beadId"))
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
/// carries a current work title only for a row whose identity froze without
/// one, and always names the authority that answered.
pub(super) fn decorate_titles(
    entries: &mut [Value],
    work: &[crate::core::work_types::IssueSummary],
) -> Result<(), Failure> {
    let titles: BTreeMap<&str, &str> = work
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
            titles.get(identity.work.id.as_str()).copied(),
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
    work_captured_at: String,
    entries: Vec<Value>,
    work_summaries: Vec<crate::core::work_types::IssueSummary>,
    claim_error: Option<String>,
    plan_error: Option<String>,
    plan_discovered: usize,
    plan_truncated: bool,
}

impl OperationsUniverse {
    /// The shared degradation posture: a work-store outage keeps ledger-backed
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
    filters: WorkItemFilters,
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

    let work_ids = entry_work_ids(&entries);
    let filter_active =
        filters.repository.is_some() || filters.status.is_some() || filters.assignee.is_some();
    let plan_filters = filters.clone();
    let claim_filters = filters;
    let (plan_read, claim_read) = tokio::join!(
        super::workstore::plan_inventory(&ctx.ledger, plan_filters, LIVE_PLAN_LIMIT),
        super::workstore::list_issues_filtered(&ctx.ledger, &work_ids, claim_filters)
    );
    let work_captured_at = now_iso();
    let (mut plans, plan_truncated, plan_discovered, mut plan_error) = match plan_read {
        Ok(inventory) => (
            inventory.issues,
            inventory.truncated,
            inventory.discovered,
            None,
        ),
        Err(error) => (Vec::new(), false, 0, Some(error.to_string())),
    };
    let (claim_work, claim_error) = match claim_read {
        Ok(issues) => (issues, None),
        Err(error) => (Vec::new(), Some(error.to_string())),
    };
    if filter_active {
        let matching_work = claim_work
            .iter()
            .map(|issue| issue.id.as_str())
            .collect::<BTreeSet<_>>();
        entries.retain(|entry| {
            entry
                .get("workId")
                .or_else(|| entry.get("beadId"))
                .and_then(Value::as_str)
                .is_some_and(|id| matching_work.contains(id))
        });
    }
    let represented: BTreeSet<String> = entries
        .iter()
        .filter_map(|entry| {
            entry
                .get("workId")
                .or_else(|| entry.get("beadId"))
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
            match live_plan_entry(plan, &work_captured_at) {
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
        let plans_by_id: BTreeMap<&str, &crate::core::work_types::PlanIssue> = plans
            .iter()
            .map(|plan| (plan.issue.id.as_str(), plan))
            .collect();
        for entry in &mut entries {
            let work_id = entry
                .get("workId")
                .or_else(|| entry.get("beadId"))
                .and_then(Value::as_str)
                .map(str::to_owned);
            if let Some(plan) = work_id.as_deref().and_then(|id| plans_by_id.get(id)) {
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

    let mut work_summaries = claim_work;
    let mut known_work = work_summaries
        .iter()
        .map(|issue| issue.id.clone())
        .collect::<BTreeSet<_>>();
    work_summaries.extend(
        plans
            .iter()
            .map(|plan| plan.issue.clone())
            .filter(|issue| known_work.insert(issue.id.clone())),
    );
    decorate_titles(&mut entries, &work_summaries)?;
    Ok(OperationsUniverse {
        snapshot,
        ledger_captured_at,
        work_captured_at,
        entries,
        work_summaries,
        claim_error,
        plan_error,
        plan_discovered,
        plan_truncated,
    })
}

const NEXT_DEFAULT_LIMIT: usize = 30;
const NEXT_MAX_LIMIT: u64 = 500;
const NEXT_DEFAULT_BYTE_LIMIT: usize = 4096;

#[derive(Clone, Copy, PartialEq, Eq)]
enum NextSection {
    Decisions,
    Running,
    Ready,
    Landed,
}

impl NextSection {
    fn parse(value: &str) -> Option<Self> {
        match value {
            "decisions" => Some(Self::Decisions),
            "running" => Some(Self::Running),
            "ready" => Some(Self::Ready),
            "landed" => Some(Self::Landed),
            _ => None,
        }
    }
}

fn next_section(req: &OperationRequest) -> Result<Option<NextSection>, Failure> {
    let Some(value) = req.params.get("section") else {
        return Ok(None);
    };
    let value = value.as_str().ok_or_else(|| {
        Failure::invalid("next section must be decisions, running, ready, or landed")
    })?;
    NextSection::parse(value).map(Some).ok_or_else(|| {
        Failure::invalid(format!(
            "next section {value:?} is not decisions, running, ready, or landed"
        ))
    })
}

fn next_bool(req: &OperationRequest, name: &str) -> Result<bool, Failure> {
    match req.params.get(name) {
        None => Ok(false),
        Some(Value::Bool(value)) => Ok(*value),
        Some(_) => Err(Failure::invalid(format!("next {name} must be a boolean"))),
    }
}

fn next_age_min(captured_at: &str, since: Option<&str>) -> u64 {
    let Some(since) = since else { return 0 };
    let (Ok(now), Ok(then)) = (
        captured_at.parse::<jiff::Timestamp>(),
        since.parse::<jiff::Timestamp>(),
    ) else {
        return 0;
    };
    let nanos = now.as_nanosecond().saturating_sub(then.as_nanosecond());
    u64::try_from(nanos / 60_000_000_000).unwrap_or(u64::MAX)
}

fn next_within_last_day(captured_at: &str, updated_at: Option<&str>) -> bool {
    let Some(updated_at) = updated_at else {
        return false;
    };
    let (Ok(now), Ok(updated)) = (
        captured_at.parse::<jiff::Timestamp>(),
        updated_at.parse::<jiff::Timestamp>(),
    ) else {
        return false;
    };
    let age = now.as_nanosecond() - updated.as_nanosecond();
    (0..=86_400_000_000_000).contains(&age)
}

fn next_title(value: &str) -> String {
    if value.chars().count() <= 60 {
        return value.to_owned();
    }
    let mut title = value.chars().take(59).collect::<String>();
    title.push('…');
    title
}

fn next_entry_title(entry: &Value) -> String {
    let id = entry.get("id").and_then(Value::as_str).unwrap_or("unknown");
    let title = entry
        .pointer("/titleSource/value")
        .and_then(Value::as_str)
        .or_else(|| entry.get("title").and_then(Value::as_str))
        .or_else(|| {
            entry
                .pointer("/identity/displayTitle")
                .and_then(Value::as_str)
        })
        .unwrap_or(id);
    next_title(title)
}

fn next_entry_kind(entry: &Value) -> &'static str {
    if entry.get("kind").and_then(Value::as_str) == Some("epic") {
        "epic"
    } else if entry.get("source").and_then(Value::as_str) == Some("live-plan") {
        "plan"
    } else {
        "run"
    }
}

fn next_entry_revision(entry: &Value) -> Value {
    entry
        .pointer("/identity/bead/revision")
        .or_else(|| entry.pointer("/plan/revision"))
        .cloned()
        .unwrap_or(Value::Null)
}

fn next_subject(revision: Value) -> Value {
    json!({"revision": revision})
}

fn next_entry_lifecycle(entry: &Value) -> String {
    entry
        .get("outcome")
        .and_then(Value::as_str)
        .or_else(|| entry.pointer("/plan/status").and_then(Value::as_str))
        .or_else(|| entry.get("state").and_then(Value::as_str))
        .unwrap_or("unknown")
        .to_owned()
}

fn next_entry_health(entry: Option<&Value>, fallback: &str) -> Value {
    entry
        .and_then(|entry| entry.get("executionHealth"))
        .cloned()
        .unwrap_or_else(|| json!(fallback))
}

fn next_actions(value: &Value) -> Vec<Value> {
    value.as_array().into_iter().flatten().cloned().collect()
}

fn next_should(actions: &[Value]) -> Value {
    actions
        .iter()
        .find(|action| action.get("class").and_then(Value::as_str) == Some("should"))
        .map(|action| {
            json!({
                "verb": action.get("verb").cloned().unwrap_or(Value::Null),
                "args": action.get("args").cloned().unwrap_or_else(|| json!({})),
            })
        })
        .unwrap_or(Value::Null)
}

fn next_can_count(actions: &[Value]) -> usize {
    actions
        .iter()
        .filter(|action| action.get("class").and_then(Value::as_str) == Some("can"))
        .count()
}

fn next_entry_spend(entry: &Value) -> (f64, u64) {
    (
        entry
            .get("costUsdKnown")
            .and_then(Value::as_f64)
            .unwrap_or(0.0),
        entry
            .get("rowsMissingCost")
            .and_then(Value::as_u64)
            .unwrap_or(0),
    )
}

fn next_is_epic_member(entry: &Value, epic_id: &str) -> bool {
    entry.get("id").and_then(Value::as_str) == Some(epic_id)
        || entry.pointer("/identity/epic/id").and_then(Value::as_str) == Some(epic_id)
        || entry.pointer("/plan/parent").and_then(Value::as_str) == Some(epic_id)
}

fn attach_plan_to_entry(entry: &mut Value, plan: &crate::core::work_types::PlanIssue) {
    let Some(object) = entry.as_object_mut() else {
        return;
    };
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

/// Hydrate an exact epic scope before any portfolio presentation bound is
/// applied. The root and both native and legacy children come from exact
/// ledger identities, so an epic ordered after the 500-row live-plan window
/// remains addressable and its ready children remain selectable.
async fn hydrate_next_epic_scope(
    ctx: &Ctx,
    epic_id: &str,
    captured_at: &str,
    entries: &mut Vec<Value>,
    work_summaries: &mut Vec<crate::core::work_types::IssueSummary>,
) -> Result<BTreeSet<String>, Failure> {
    let root = super::workstore::show_issue(&ctx.ledger, epic_id).await?;
    if root.issue_type != "epic" {
        return Err(Failure::invalid(format!(
            "next id {epic_id:?} does not name an epic"
        )));
    }
    let (children, _) = super::workstore::epic_children_with_legacy(&ctx.ledger, epic_id).await?;
    let mut ids = Vec::with_capacity(children.len().saturating_add(1));
    ids.push(root.id.clone());
    ids.extend(children.iter().map(|child| child.id.clone()));
    let plans = super::workstore::plan_issues(&ctx.ledger, &ids).await?;
    let scope_ids = ids.into_iter().collect::<BTreeSet<_>>();

    let plans_by_id = plans
        .iter()
        .map(|plan| (plan.issue.id.as_str(), plan))
        .collect::<BTreeMap<_, _>>();
    for entry in entries.iter_mut() {
        let work_id = entry
            .get("beadId")
            .and_then(Value::as_str)
            .map(str::to_owned);
        if let Some(plan) = work_id.as_deref().and_then(|id| plans_by_id.get(id)) {
            attach_plan_to_entry(entry, plan);
        }
    }
    let represented = entry_work_ids(entries).into_iter().collect::<BTreeSet<_>>();
    for plan in plans
        .iter()
        .filter(|plan| plan.issue.status != "closed")
        .filter(|plan| !represented.contains(&plan.issue.id))
    {
        entries.push(live_plan_entry(plan, captured_at)?);
    }

    let mut known = work_summaries
        .iter()
        .map(|issue| issue.id.clone())
        .collect::<BTreeSet<_>>();
    for plan in plans {
        if known.insert(plan.issue.id.clone()) {
            work_summaries.push(plan.issue);
        }
    }
    decorate_titles(entries, work_summaries)?;
    Ok(scope_ids)
}

fn next_spend(entries: &[Value], subject_id: &str, kind: &str) -> Value {
    let mut known = 0.0;
    let mut missing = 0u64;
    let mut matched = false;
    for entry in entries.iter().filter(|entry| {
        entry.get("id").and_then(Value::as_str) == Some(subject_id)
            || (kind == "epic" && next_is_epic_member(entry, subject_id))
    }) {
        matched = true;
        let (entry_known, entry_missing) = next_entry_spend(entry);
        known += entry_known;
        missing = missing.saturating_add(entry_missing);
    }
    if !matched || missing == 0 {
        json!(known)
    } else {
        Value::Null
    }
}

struct NextRow<'a> {
    id: &'a str,
    kind: &'a str,
    title: String,
    state: Value,
    age_min: u64,
    spend_usd: Value,
    actions: &'a [Value],
    lifecycle: String,
    health: Value,
    revision: Value,
}

fn next_row(row: NextRow<'_>) -> Value {
    json!({
        "id": row.id,
        "kind": row.kind,
        // id and kind above are the compact subject identity. Keep the
        // frozen work revision nested where identity-bearing consumers
        // already look for it without repeating those strings per row.
        "subject": next_subject(row.revision),
        "title": row.title,
        "state": row.state,
        "ageMin": row.age_min,
        "spendUsd": row.spend_usd,
        "should": next_should(row.actions),
        "canCount": next_can_count(row.actions),
        "lifecycle": row.lifecycle,
        "health": row.health,
    })
}

fn next_attention_row(
    item: &AttentionItemV1,
    entry: Option<&Value>,
    entries: &[Value],
    captured_at: &str,
    expand_next: bool,
) -> Result<Value, Failure> {
    let kind = match item.subject_kind {
        AttentionSubjectKind::Run => "run",
        AttentionSubjectKind::Epic => "epic",
    };
    let title = item
        .subject_title
        .as_ref()
        .filter(|title| title.known)
        .map(|title| title.value.as_str())
        .or_else(|| {
            entry.and_then(|entry| entry.pointer("/titleSource/value").and_then(Value::as_str))
        })
        .unwrap_or(&item.subject_id);
    let actions = serde_json::to_value(&item.next_actions)
        .map_err(|error| Failure::internal(format!("serializing next actions: {error}")))?;
    let actions = next_actions(&actions);
    let mut row = next_row(NextRow {
        id: &item.subject_id,
        kind,
        title: next_title(title),
        state: serde_json::to_value(item.condition)
            .map_err(|error| Failure::internal(format!("serializing attention: {error}")))?,
        age_min: next_age_min(captured_at, Some(&item.updated_at)),
        spend_usd: next_spend(entries, &item.subject_id, kind),
        actions: &actions,
        lifecycle: entry.map_or_else(|| "unknown".to_owned(), next_entry_lifecycle),
        health: next_entry_health(entry, "unknown"),
        revision: entry.map_or(Value::Null, next_entry_revision),
    });
    if expand_next {
        row["next"] = Value::Array(actions);
    }
    Ok(row)
}

fn next_running_row(
    entry: &Value,
    snapshot: &InventorySnapshot,
    entries: &[Value],
    captured_at: &str,
) -> Result<Value, Failure> {
    let id = entry
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| Failure::internal("running next row has no id"))?;
    let attempt = snapshot
        .live_attempts
        .iter()
        .filter(|attempt| {
            split_packet_key(&attempt.packet_id).is_ok_and(|(run_id, _, _)| run_id == id)
        })
        .max_by_key(|attempt| attempt.attempt_id);
    let stage = attempt
        .and_then(|attempt| split_packet_key(&attempt.packet_id).ok())
        .map(|(_, stage, _)| stage)
        .or_else(|| {
            entry
                .get("currentStage")
                .and_then(Value::as_str)
                .map(str::to_owned)
        });
    let actions = next_actions(&operations_next_actions(entry));
    let kind = next_entry_kind(entry);
    let mut row = next_row(NextRow {
        id,
        kind,
        title: next_entry_title(entry),
        state: stage.clone().map_or(Value::Null, Value::String),
        age_min: next_age_min(
            captured_at,
            attempt.map(|attempt| attempt.started_at.as_str()),
        ),
        spend_usd: next_spend(entries, id, kind),
        actions: &actions,
        lifecycle: "running".to_owned(),
        health: next_entry_health(Some(entry), "running"),
        revision: next_entry_revision(entry),
    });
    row["stage"] = stage.map_or(Value::Null, Value::String);
    row["seat"] = attempt
        .map(|attempt| Value::String(attempt.claimant.clone()))
        .unwrap_or(Value::Null);
    Ok(row)
}

fn next_landed_row(entry: &Value, entries: &[Value], captured_at: &str) -> Result<Value, Failure> {
    let id = entry
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| Failure::internal("landed next row has no id"))?;
    let kind = next_entry_kind(entry);
    let mut row = next_row(NextRow {
        id,
        kind,
        title: next_entry_title(entry),
        state: json!("landed"),
        age_min: next_age_min(captured_at, entry.get("updatedAt").and_then(Value::as_str)),
        spend_usd: next_spend(entries, id, kind),
        actions: &[],
        lifecycle: "landed".to_owned(),
        health: next_entry_health(Some(entry), "terminal"),
        revision: next_entry_revision(entry),
    });
    row["pr"] = entry
        .pointer("/delivery/pr")
        .filter(|value| !value.is_null())
        .or_else(|| entry.pointer("/pr/number"))
        .cloned()
        .unwrap_or(Value::Null);
    Ok(row)
}

fn next_section_page(values: &[Value], limit: usize) -> Vec<Value> {
    values.iter().take(limit).cloned().collect()
}

fn next_default_limits(totals: [usize; 4], symptoms: Option<usize>) -> ([usize; 4], usize) {
    let mut limits = [0usize; 4];
    let mut remaining = NEXT_DEFAULT_LIMIT;
    for (index, total) in totals.iter().copied().enumerate() {
        limits[index] = total.min(remaining);
        remaining = remaining.saturating_sub(limits[index]);
    }
    let symptom_limit = symptoms.map_or(0, |total| total.min(remaining));
    (limits, symptom_limit)
}

fn next_coverage(shown: usize, total: usize) -> Value {
    json!({
        "shown": shown,
        "total": total,
        "truncated": shown < total,
    })
}

/// Keep the default driver read inside its byte contract without lying about
/// coverage. Decision rows have highest priority, followed by running, ready,
/// and landed; optional symptoms are discarded first. Explicit section reads
/// are the widening escape hatch and do not use this byte cap.
fn bound_next_default_result(result: &mut Value, limit: usize) {
    while serde_json::to_vec(result).is_ok_and(|bytes| bytes.len() > limit) {
        let mut removed = None;
        for section in ["symptoms", "landed", "ready", "running", "decisions"] {
            let Some(rows) = result
                .pointer_mut(&format!("/sections/{section}"))
                .and_then(Value::as_array_mut)
            else {
                continue;
            };
            if rows.pop().is_some() {
                removed = Some((section, rows.len()));
                break;
            }
        }
        let Some((section, shown)) = removed else {
            break;
        };
        if let Some(coverage) = result
            .pointer_mut(&format!("/coverage/sections/{section}"))
            .and_then(Value::as_object_mut)
        {
            let total = coverage
                .get("total")
                .and_then(Value::as_u64)
                .unwrap_or(shown as u64);
            coverage.insert("shown".to_owned(), json!(shown));
            coverage.insert("truncated".to_owned(), json!((shown as u64) < total));
        }
        if let Some(shown_total) = result.pointer("/coverage/shown").and_then(Value::as_u64) {
            result["coverage"]["shown"] = json!(shown_total.saturating_sub(1));
        }
        result["coverage"]["truncated"] = json!(true);
        if section == "symptoms" {
            let hidden = result
                .pointer("/hidden/symptoms")
                .and_then(Value::as_u64)
                .unwrap_or(0);
            result["hidden"]["symptoms"] = json!(hidden.saturating_add(1));
        }
    }
}

/// Bytes the success envelope adds around a `next` result. The byte budget
/// is a promise about what the agent reads, so the envelope is charged
/// against it rather than the inner object alone.
fn next_envelope_overhead(operation_id: &str) -> usize {
    serde_json::to_vec(&super::ok_response(operation_id, false, Value::Null))
        .map(|bytes| bytes.len().saturating_sub("null".len()))
        .unwrap_or(0)
}

/// `next` — the bounded decision-first lead surface.
///
/// Audience: lead. One operations universe read supplies attention, running,
/// landed, spend, and identity; one ready-frontier read and one note-presence
/// read supply the wave-1 planning lifecycle. It never calls the Operations
/// response facade and never loads specification bodies into its result.
pub async fn next(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("next", req, || async {
        let repository = repository_selector(req, "next")?;
        let epic_id = req
            .params
            .get("id")
            .map(|value| {
                value
                    .as_str()
                    .map(str::trim)
                    .filter(|value| !value.is_empty())
                    .map(str::to_owned)
                    .ok_or_else(|| Failure::invalid("next id must name one epic"))
            })
            .transpose()?;
        if repository.is_some() && epic_id.is_some() {
            return Err(Failure::invalid("next accepts --repo or --id, not both"));
        }
        let section = next_section(req)?;
        let section_limit = req
            .params
            .get("limit")
            .map(|value| {
                value
                    .as_u64()
                    .ok_or_else(|| Failure::invalid("next limit must be an unsigned integer"))
            })
            .transpose()?;
        if section_limit.is_some() && section.is_none() {
            return Err(Failure::invalid("next limit requires a section"));
        }
        let section_limit = section_limit.unwrap_or(NEXT_DEFAULT_LIMIT as u64);
        if !(1..=NEXT_MAX_LIMIT).contains(&section_limit) {
            return Err(Failure::invalid(format!(
                "next limit must be between 1 and {NEXT_MAX_LIMIT}"
            )));
        }
        let include_symptoms = next_bool(req, "symptoms")?;

        let universe = collect_operations_universe(
            ctx,
            WorkItemFilters {
                repository: repository.clone(),
                ..WorkItemFilters::default()
            },
        )
        .await?;
        let mut source_health = universe.source_health();
        if repository.is_some()
            && source_health
                .pointer("/beads/state")
                .and_then(Value::as_str)
                != Some("available")
        {
            return Err(Failure::refused(
                ErrorCode::WorkError,
                "next repository membership is unavailable",
            ));
        }
        let OperationsUniverse {
            snapshot,
            work_captured_at,
            mut entries,
            mut work_summaries,
            claim_error,
            plan_truncated,
            ..
        } = universe;
        let captured_at = work_captured_at;
        let epic_scope_work_ids = match epic_id.as_deref() {
            Some(epic_id) => {
                let ids = hydrate_next_epic_scope(
                    ctx,
                    epic_id,
                    &captured_at,
                    &mut entries,
                    &mut work_summaries,
                )
                .await?;
                source_health["plan"] = json!({
                    "state": "available",
                    "error": Value::Null,
                    "discovered": ids.len(),
                    "limit": ids.len(),
                    "truncated": false,
                });
                Some(ids)
            }
            None => None,
        };
        let attention_items =
            super::attention::project_active(&snapshot, &entries, &work_summaries)?;
        let attention_json = attention_items
            .iter()
            .map(|item| {
                serde_json::to_value(item).map_err(|error| {
                    Failure::internal(format!("serializing attention item: {error}"))
                })
            })
            .collect::<Result<Vec<_>, _>>()?;
        enrich_operations_facts(&snapshot, &attention_json, &mut entries)?;
        let work_read = match claim_error {
            Some(error) => Err(error),
            None => Ok(work_summaries),
        };
        let _queue = operator_queue(&snapshot, &mut entries, &attention_json, work_read);

        if let (Some(epic_id), Some(scope_ids)) = (epic_id.as_deref(), epic_scope_work_ids.as_ref())
        {
            entries.retain(|entry| {
                next_is_epic_member(entry, epic_id)
                    || entry
                        .get("beadId")
                        .and_then(Value::as_str)
                        .is_some_and(|id| scope_ids.contains(id))
            });
        }
        let scoped_ids = entries
            .iter()
            .filter_map(|entry| entry.get("id").and_then(Value::as_str))
            .collect::<BTreeSet<_>>();
        let parked_ids = entries
            .iter()
            .filter(|entry| {
                entry.pointer("/plan/status").and_then(Value::as_str) == Some("deferred")
                    || entry.pointer("/claimHealth/status").and_then(Value::as_str)
                        == Some("deferred")
            })
            .filter_map(|entry| entry.get("id").and_then(Value::as_str))
            .collect::<BTreeSet<_>>();
        let entry_by_id = entries
            .iter()
            .filter_map(|entry| Some((entry.get("id")?.as_str()?, entry)))
            .collect::<BTreeMap<_, _>>();

        let expand_decisions = section == Some(NextSection::Decisions);
        let mut decisions = Vec::new();
        let mut symptoms = Vec::new();
        for item in attention_items.iter().filter(|item| {
            item.state == AttentionState::Open
                && scoped_ids.contains(item.subject_id.as_str())
                && !parked_ids.contains(item.subject_id.as_str())
        }) {
            let row = next_attention_row(
                item,
                entry_by_id.get(item.subject_id.as_str()).copied(),
                &entries,
                &captured_at,
                expand_decisions,
            )?;
            match super::attention::classification(item.condition) {
                super::attention::AttentionClass::Decision => decisions.push(row),
                super::attention::AttentionClass::Symptom => symptoms.push(row),
            }
        }

        let mut running = entries
            .iter()
            .filter(|entry| entry.get("liveSeats").and_then(Value::as_u64).unwrap_or(0) > 0)
            .map(|entry| next_running_row(entry, &snapshot, &entries, &captured_at))
            .collect::<Result<Vec<_>, _>>()?;
        running.sort_by(|left, right| left["id"].as_str().cmp(&right["id"].as_str()));

        let (ready_items, ready_total, ready_has_more) =
            if let Some(scope_ids) = epic_scope_work_ids.as_ref() {
                let items = on_ledger(&ctx.ledger, |ledger| ledger.ready_work_items()).await?;
                let items = items
                    .into_iter()
                    .filter(|item| scope_ids.contains(&item.work_id))
                    .collect::<Vec<_>>();
                let total = items.len();
                (items, total, false)
            } else {
                let page = on_ledger(&ctx.ledger, {
                    let repository = repository.clone();
                    move |ledger| {
                        ledger.ready_work_items_page_filtered(
                            WorkItemFilters {
                                repository,
                                ..WorkItemFilters::default()
                            },
                            None,
                            NEXT_MAX_LIMIT as usize,
                        )
                    }
                })
                .await?;
                let total = usize::try_from(page.total).unwrap_or(usize::MAX);
                (page.items, total, page.has_more)
            };
        let scope_plan_truncated = if epic_id.is_some() {
            false
        } else {
            plan_truncated
        };
        let ready_ids = ready_items
            .iter()
            .map(|item| item.work_id.clone())
            .collect::<Vec<_>>();
        let critiqued = on_ledger(&ctx.ledger, move |ledger| {
            ledger.work_items_with_note_kind(&ready_ids, WorkNoteKind::Recommendation)
        })
        .await?;
        let ready = ready_items
            .into_iter()
            .map(|item| {
                let (lifecycle, evidence) = if item.status == WorkStatus::Blocked {
                    ("held", "status: blocked")
                } else if item.spec.notes.contains("[ ]") {
                    ("held", "notes: unchecked checkbox")
                } else if critiqued.contains(&item.work_id) {
                    ("critiqued", "recommendation note exists")
                } else {
                    ("drafted", "no recommendation note")
                };
                let mut row = next_row(NextRow {
                    id: &item.work_id,
                    kind: item.kind.as_str(),
                    title: next_title(&item.spec.title),
                    state: json!(item.status.as_str()),
                    age_min: next_age_min(&captured_at, Some(&item.updated_at)),
                    spend_usd: json!(0.0),
                    actions: &[],
                    lifecycle: lifecycle.to_owned(),
                    health: json!("unsubmitted"),
                    revision: json!(item.revision),
                });
                row["basis"] = json!(format!("{evidence}; adjudicated: unknown-until-.8"));
                row
            })
            .collect::<Vec<_>>();

        let mut landed = entries
            .iter()
            .filter(|entry| entry.get("outcome").and_then(Value::as_str) == Some("landed"))
            .filter(|entry| {
                next_within_last_day(&captured_at, entry.get("updatedAt").and_then(Value::as_str))
            })
            .map(|entry| next_landed_row(entry, &entries, &captured_at))
            .collect::<Result<Vec<_>, _>>()?;
        landed.sort_by(|left, right| left["ageMin"].as_u64().cmp(&right["ageMin"].as_u64()));

        let totals = [decisions.len(), running.len(), ready_total, landed.len()];
        let (mut default_limits, symptom_limit) =
            next_default_limits(totals, include_symptoms.then_some(symptoms.len()));
        if let Some(section) = section {
            let index = match section {
                NextSection::Decisions => 0,
                NextSection::Running => 1,
                NextSection::Ready => 2,
                NextSection::Landed => 3,
            };
            default_limits[index] = totals[index].min(section_limit as usize);
        }
        let decision_rows = next_section_page(&decisions, default_limits[0]);
        let running_rows = next_section_page(&running, default_limits[1]);
        let ready_rows = next_section_page(&ready, default_limits[2]);
        let landed_rows = next_section_page(&landed, default_limits[3]);
        let symptom_rows = if include_symptoms {
            next_section_page(&symptoms, symptom_limit)
        } else {
            Vec::new()
        };
        let shown = decision_rows.len()
            + running_rows.len()
            + ready_rows.len()
            + landed_rows.len()
            + symptom_rows.len();
        let total = totals.iter().sum::<usize>() + usize::from(include_symptoms) * symptoms.len();
        let mut sections = json!({
            "decisions": decision_rows,
            "running": running_rows,
            "ready": ready_rows,
            "landed": landed_rows,
        });
        if include_symptoms {
            sections["symptoms"] = Value::Array(symptom_rows.clone());
        }
        let mut coverage_sections = json!({
            "decisions": next_coverage(decision_rows.len(), totals[0]),
            "running": next_coverage(running_rows.len(), totals[1]),
            "ready": next_coverage(ready_rows.len(), totals[2]),
            "landed": next_coverage(landed_rows.len(), totals[3]),
        });
        if include_symptoms {
            coverage_sections["symptoms"] = next_coverage(symptom_rows.len(), symptoms.len());
        }
        let bound_default_portfolio =
            section.is_none() && repository.is_none() && epic_id.is_none();
        let scope = if let Some(repository) = repository {
            json!({"repository": repository})
        } else if let Some(epic_id) = epic_id {
            json!({"epic": epic_id})
        } else {
            json!({"portfolio": true})
        };
        let mut result = json!({
            "schema": "forged.next/1",
            "capturedAt": captured_at,
            "scope": scope,
            "sections": sections,
            "hidden": {
                "symptoms": symptoms.len().saturating_sub(symptom_rows.len()),
                "parked": parked_ids.len(),
            },
            "coverage": {
                "limit": NEXT_DEFAULT_LIMIT,
                "shown": shown,
                "total": total,
                "truncated": shown < total || ready_has_more || scope_plan_truncated,
                "sourceHealth": source_health,
                "sections": coverage_sections,
            },
        });
        if bound_default_portfolio {
            // The projection boundary adds compatibility twins after this
            // returns; add them first so the bound measures the final shape
            // (that pass is idempotent), and charge the success envelope
            // against the same budget.
            forged_types::add_work_twins(&mut result);
            let operation_id = if super::key_absent(req) {
                super::read_key("next")
            } else {
                req.idempotency_key.clone()
            };
            let budget =
                NEXT_DEFAULT_BYTE_LIMIT.saturating_sub(next_envelope_overhead(&operation_id));
            bound_next_default_result(&mut result, budget);
        }
        Ok(result)
    })
    .await
}

/// `operations overview` — the bounded, read-only operator surface.
///
/// One ledger snapshot supplies every durable fact. The work store contributes one
/// exact claim/membership batch alongside one bounded N+1 plan discovery and
/// one exact-id dependency hydrate. An outage retains unscoped durable rows
/// and is reported as degraded instead of widening scope or inventing plan
/// truth. This hot path never performs a controller-file or OS liveness probe
/// per row.
pub async fn operations_overview(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("operations_overview", req, || async {
        let repository = repository_selector(req, "operations_overview")?;
        let status = work_status_selector(req, "work_list")?;
        let assignee = assignee_selector(req, "work_list")?;
        let detail = projection_detail(req, "operations_overview")?;
        let include_symptoms = projection_symptoms(req, "operations_overview")?;
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

        let universe = collect_operations_universe(
            ctx,
            WorkItemFilters {
                repository: repository.clone(),
                status,
                assignee,
            },
        )
        .await?;
        let source_health = universe.source_health();
        let OperationsUniverse {
            snapshot,
            ledger_captured_at,
            work_captured_at,
            mut entries,
            work_summaries,
            claim_error,
            plan_truncated,
            ..
        } = universe;
        let attention_items =
            super::attention::project_active(&snapshot, &entries, &work_summaries)?;
        let attention_decisions = attention_items
            .iter()
            .filter(|item| {
                super::attention::classification(item.condition)
                    == super::attention::AttentionClass::Decision
            })
            .count();
        let attention_symptoms = attention_items.len().saturating_sub(attention_decisions);
        let attention_acknowledged = attention_items
            .iter()
            .filter(|item| item.state == AttentionState::Acknowledged)
            .count();
        let attention = attention_items
            .into_iter()
            .map(|item| {
                serde_json::to_value(item).map_err(|error| {
                    Failure::internal(format!("serializing attention item: {error}"))
                })
            })
            .collect::<Result<Vec<_>, _>>()?;
        enrich_operations_facts(&snapshot, &attention, &mut entries)?;

        let work_read = match claim_error.as_ref() {
            Some(error) => Err(error.clone()),
            None => Ok(work_summaries),
        };
        let mut queue = operator_queue(&snapshot, &mut entries, &attention, work_read);
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
            let shown: Vec<Value> = rows
                .into_iter()
                .take(remaining)
                .map(|entry| operations_entry(entry, detail))
                .collect();
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
        let decisions = attention
            .iter()
            .filter(|item| {
                item.get("condition")
                    .cloned()
                    .and_then(|value| serde_json::from_value::<AttentionCondition>(value).ok())
                    .is_some_and(|condition| {
                        super::attention::classification(condition)
                            == super::attention::AttentionClass::Decision
                    })
            })
            .take(limit as usize)
            .cloned()
            .collect::<Vec<_>>();
        let symptoms = include_symptoms.then(|| {
            attention
                .iter()
                .filter(|item| {
                    item.get("condition")
                        .cloned()
                        .and_then(|value| serde_json::from_value::<AttentionCondition>(value).ok())
                        .is_some_and(|condition| {
                            super::attention::classification(condition)
                                == super::attention::AttentionClass::Symptom
                        })
                })
                .take(limit as usize)
                .cloned()
                .collect::<Vec<_>>()
        });
        let mut attention_projection = json!({
            "counts": {
                "decisions": attention_decisions,
                "symptoms": attention_symptoms,
                "acknowledged": attention_acknowledged,
            },
            "decisions": decisions,
        });
        if let Some(symptoms) = symptoms {
            attention_projection["symptoms"] = json!(symptoms);
        }
        let attention = if detail == ProjectionDetail::Full {
            json!(attention)
        } else {
            attention_projection
        };
        Ok(forged_types::with_work_twins(json!({
            "schema": "forged.operations-overview/1",
            "subject": {
                "id": "portfolio",
                "kind": "portfolio",
                "title": "Forged operations",
                "repository": repository,
                "revision": Value::Null,
            },
            "scope": {"repository": repository},
            "capturedAt": {
                "ledger": ledger_captured_at,
                "beads": work_captured_at,
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
                "nextCursor": Value::Null,
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
                "attention": attention_decisions + attention_symptoms,
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
        })))
    })
    .await
}

/// Return the new Operations projection to compatibility facades without
/// reimplementing its ledger/work joins or queue policy.
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
/// live plan entries plus claim/plan work summaries — projected through
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

        let universe = collect_operations_universe(
            ctx,
            WorkItemFilters {
                repository: repo.clone(),
                ..WorkItemFilters::default()
            },
        )
        .await?;
        let items = super::attention::project_all(
            &universe.snapshot,
            &universe.entries,
            &universe.work_summaries,
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

        Ok(forged_types::with_work_twins(json!({
            "schema": "forged.attention-list/1",
            "subject": {
                "id": "attention",
                "kind": "portfolio",
                "title": "Forged attention",
                "repository": repo,
                "revision": Value::Null,
            },
            "capturedAt": {
                "ledger": &universe.ledger_captured_at,
                "beads": &universe.work_captured_at,
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
            "coverage": {
                "shown": shown_total,
                "total": total,
                "truncated": shown_total < total,
                "nextCursor": Value::Null,
            },
            "groups": groups,
        })))
    })
    .await
}

pub(crate) async fn all_attention(ctx: &Ctx) -> Result<Vec<AttentionItemV1>, Failure> {
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
    let work_ids = entry_work_ids(&entries);
    // A work-store outage cannot authorize a control over a condition that only
    // the work store can prove. Other ledger-backed items remain addressable.
    let work = super::workstore::list_issues(&ctx.ledger, &work_ids)
        .await
        .unwrap_or_default();
    decorate_titles(&mut entries, &work)?;
    super::attention::project_all(&snapshot, &entries, &work)
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
    // The subject travels as the envelope `runId` (the CLI's `--subject`),
    // and `params.subjectId` is accepted as an alias because attention_list
    // hands the id back under that name. When both appear they must agree.
    let envelope_subject = req.run_id.as_deref().filter(|value| !value.is_empty());
    let params_subject = req
        .params
        .get("subjectId")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty());
    let subject = match (envelope_subject, params_subject) {
        (Some(envelope), Some(alias)) if envelope != alias => {
            return err_response(
                &derive_key(name, Some(envelope), None, None),
                &Failure::invalid(format!(
                    "envelope runId {envelope:?} conflicts with params.subjectId {alias:?}"
                )),
            )
        }
        (Some(value), _) | (None, Some(value)) => value.to_owned(),
        (None, None) => {
            return err_response(
                &derive_key(name, None, None, None),
                &Failure::invalid(
                    "attention control requires a subject id: pass the item's \
                     subjectId as the envelope runId or as params.subjectId",
                ),
            )
        }
    };
    req.run_id = Some(subject.clone());
    // The alias is addressing, not payload: strip it after resolution so
    // both documented request forms canonicalize to one idempotency
    // identity — a retry that switches forms must replay, not conflict.
    req.params.remove("subjectId");
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
            if !super::attention::resolution_allowed(item) {
                let message = if item.condition == forged_types::AttentionCondition::MissingEvidence
                {
                    "this missing-evidence occurrence includes repairable delivery evidence and clears only through the recorded exact-base delivery PR"
                } else {
                    "this source-backed condition clears only through its domain transition"
                };
                let failure = Failure::invalid(message);
                return item.next_actions.first().cloned().map_or_else(
                    || err_response(&operation_key, &failure),
                    |action| {
                        remedy_response(
                            &operation_key,
                            &failure,
                            forged_types::RemedyV1::from(action),
                        )
                    },
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
                                "attention disposition must be fixed, accepted-risk, accepted-unknown, superseded, evidence-absent, or automatic",
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
            if item.condition == forged_types::AttentionCondition::MissingEvidence
                && disposition != AttentionResolutionDisposition::EvidenceAbsent
            {
                return err_response(
                    &operation_key,
                    &Failure::invalid(
                        "missing-evidence can only be resolved with evidence-absent, the explicit record that the evidence was never captured",
                    ),
                );
            }
            if disposition == AttentionResolutionDisposition::EvidenceAbsent
                && item.condition != forged_types::AttentionCondition::MissingEvidence
            {
                return err_response(
                    &operation_key,
                    &Failure::invalid(
                        "evidence-absent records absent evidence and cannot resolve any other condition",
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
            // The absence record is only auditable with its rationale; an
            // empty note would durably claim absence while explaining
            // nothing.
            if disposition == AttentionResolutionDisposition::EvidenceAbsent
                && note.trim().is_empty()
            {
                return err_response(
                    &operation_key,
                    &Failure::invalid(
                        "evidence-absent requires a nonblank note stating the auditable rationale",
                    ),
                );
            }
            payload["disposition"] =
                serde_json::to_value(disposition).expect("closed attention disposition serializes");
            payload["note"] = json!(note);
            // A missing-evidence occurrence aggregates every manifest-less
            // attempt of its run; the durable record must state that full
            // scope, so the adjudicated attempt ids ride in this transition
            // payload (the wire item is unchanged).
            if item.condition == forged_types::AttentionCondition::MissingEvidence {
                let attempt_ids: Vec<&str> = item
                    .evidence_refs
                    .iter()
                    .filter(|evidence| {
                        evidence.kind == forged_types::AttentionEvidenceKind::Attempt
                    })
                    .map(|evidence| evidence.id.as_str())
                    .collect();
                payload["attemptIds"] = json!(attempt_ids);
            }
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
fn events_selector<'a>(
    params: &'a serde_json::Map<String, Value>,
    key: &str,
) -> Result<Option<&'a str>, Failure> {
    match params.get(key) {
        None => Ok(None),
        Some(Value::String(value)) if !value.trim().is_empty() => Ok(Some(value)),
        Some(_) => Err(Failure::invalid(format!(
            "events param {key:?} must be a non-empty string"
        ))),
    }
}

pub async fn events_tail(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    read_only("events_tail", req, || async {
        let direct_run = events_selector(&req.params, "run")?;
        let id = events_selector(&req.params, "id")?;
        let subject_kind = param_opt_str(&req.params, "subjectKind");
        if direct_run.is_some() && id.is_some() {
            return Err(Failure::invalid(
                "events takes param \"run\" or param \"id\", never both",
            ));
        }
        if subject_kind.is_some() && id.is_none() {
            return Err(Failure::invalid(
                "events param \"subjectKind\" requires param \"id\"",
            ));
        }
        let target = match (direct_run, id) {
            (Some(run), None) => {
                // `--run` predates kinded selectors and names an event-stream
                // id. Preserve legacy epic streams and typo-as-empty-page
                // behavior while classifying a known durable identity when
                // one exists.
                let run_id = run.to_owned();
                let identity_id = run_id.clone();
                let kind = on_ledger(&ctx.ledger, move |ledger| {
                    if ledger
                        .get_work_identity(WorkIdentitySubjectKind::Run, &identity_id)?
                        .is_some()
                    {
                        Ok(WorkIdentitySubjectKind::Run)
                    } else if ledger
                        .get_work_identity(WorkIdentitySubjectKind::Epic, &identity_id)?
                        .is_some()
                    {
                        Ok(WorkIdentitySubjectKind::Epic)
                    } else {
                        Ok(WorkIdentitySubjectKind::Run)
                    }
                })
                .await?;
                Some((kind, run_id))
            }
            (None, Some(id)) => {
                match super::observe::execution_target(ctx, id, subject_kind).await? {
                    super::observe::ExecutionTarget::Run(run) => {
                        Some((WorkIdentitySubjectKind::Run, run))
                    }
                    super::observe::ExecutionTarget::Epic(epic) => {
                        Some((WorkIdentitySubjectKind::Epic, epic))
                    }
                    super::observe::ExecutionTarget::Unresolved(resolution) => {
                        return Ok(json!({
                            "schema": "forged.events/1",
                            "resolution": resolution,
                        }))
                    }
                }
            }
            (None, None) => None,
            _ => unreachable!(),
        };
        let run = target.as_ref().map(|(_, id)| id.clone());
        let subject = match target.as_ref() {
            Some((kind, id)) => {
                let identity_id = id.clone();
                let identity_kind = *kind;
                let identity = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.get_work_identity(identity_kind, &identity_id)
                })
                .await?;
                let projection_kind = match kind {
                    WorkIdentitySubjectKind::Run => forged_types::ProjectionSubjectKind::Run,
                    WorkIdentitySubjectKind::Epic => forged_types::ProjectionSubjectKind::Epic,
                };
                identity.map_or_else(
                    || forged_types::ProjectionSubjectV1 {
                        id: id.clone(),
                        kind: projection_kind,
                        title: None,
                        repository: None,
                        revision: None,
                    },
                    |identity| {
                        super::work_identity::projection_subject(&identity, projection_kind, id)
                    },
                )
            }
            None => forged_types::ProjectionSubjectV1 {
                id: "portfolio".to_owned(),
                kind: forged_types::ProjectionSubjectKind::Portfolio,
                title: Some("Forged event stream".to_owned()),
                repository: None,
                revision: None,
            },
        };
        let after = req.params.get("after").and_then(Value::as_i64).unwrap_or(0);
        if after < 0 {
            return Err(Failure::invalid("events after must be non-negative"));
        }
        let limit = req
            .params
            .get("limit")
            .map(|value| {
                value
                    .as_u64()
                    .ok_or_else(|| Failure::invalid("events limit must be an unsigned integer"))
            })
            .transpose()?
            .unwrap_or(100);
        if !(1..=1_000).contains(&limit) {
            return Err(Failure::invalid("events limit must be between 1 and 1000"));
        }
        let detail = projection_detail(req, "events")?;
        let summary_flag = req
            .params
            .get("summary")
            .map(|summary| {
                summary
                    .as_bool()
                    .ok_or_else(|| Failure::invalid("events summary must be a boolean"))
            })
            .transpose()?;
        if summary_flag.is_some() && req.params.contains_key("detail") {
            return Err(Failure::invalid(
                "events summary cannot be combined with detail",
            ));
        }
        // `events --summary` predates projection detail. Preserve its
        // no-flag contract: payloads are complete unless summary mode was
        // explicitly selected by either spelling.
        let summary = summary_flag.unwrap_or_else(|| {
            req.params.contains_key("detail") && detail == ProjectionDetail::Summary
        });
        let (mut rows, total) = {
            let run = run.clone();
            on_ledger(&ctx.ledger, move |l| {
                let page_limit = u32::try_from(limit.saturating_add(1)).unwrap_or(1_001);
                l.list_events_with_count(run.as_deref(), after, page_limit)
            })
            .await?
        };
        let truncated = rows.len() > limit as usize;
        rows.truncate(limit as usize);
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
        let shown = events.len();
        Ok(forged_types::with_work_twins(json!({
            "schema": "forged.events/1",
            "subject": subject,
            "events": events,
            "last_event_id": last_event_id,
            "summary": summary,
            "coverage": {
                "shown": shown,
                "total": total,
                "truncated": truncated,
                "nextCursor": truncated.then_some(last_event_id),
            },
        })))
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
    if let Err(error) = bind_envelope_run(&mut req, "worktree_retire", &run_id) {
        return err_response(&req.idempotency_key, &error);
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

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;
    use std::path::PathBuf;

    use forged_types::{ExecutionPolicyV1, HostPolicyV1, Stage};
    use serde_json::{json, Value};

    use super::{
        bound_next_default_result, next_default_limits, next_envelope_overhead, next_landed_row,
        next_spend, next_title, next_within_last_day, splice_policy,
    };

    #[test]
    fn next_byte_budget_covers_the_whole_success_envelope() {
        let result = json!({
            "schema": "forged.next/1",
            "sections": {"decisions": [{"id": "a"}, {"id": "b"}, {"id": "c"}]},
            "coverage": {
                "shown": 3,
                "total": 3,
                "truncated": false,
                "sections": {"decisions": {"shown": 3, "total": 3, "truncated": false}}
            },
            "hidden": {"symptoms": 0}
        });
        let envelope = crate::core::ok_response("op:next:read", false, result.clone());
        let envelope_len = serde_json::to_vec(&envelope).unwrap().len();
        let result_len = serde_json::to_vec(&result).unwrap().len();
        assert_eq!(
            next_envelope_overhead("op:next:read") + result_len,
            envelope_len
        );

        let mut bounded = result;
        let limit = result_len - 1;
        bound_next_default_result(&mut bounded, limit);
        assert!(serde_json::to_vec(&bounded).unwrap().len() <= limit);
        assert_eq!(
            bounded["sections"]["decisions"].as_array().unwrap().len(),
            2
        );
        assert_eq!(bounded["coverage"]["shown"], json!(2));
        assert_eq!(bounded["coverage"]["truncated"], json!(true));
        assert_eq!(
            bounded["coverage"]["sections"]["decisions"],
            json!({"shown": 2, "total": 3, "truncated": true})
        );
    }

    #[test]
    fn next_spend_is_known_only_when_every_matching_usage_row_is_costed() {
        let entries = vec![
            json!({"id": "epic-1", "costUsdKnown": 1.25, "rowsMissingCost": 0}),
            json!({
                "id": "run-1", "identity": {"epic": {"id": "epic-1"}},
                "costUsdKnown": 2.75, "rowsMissingCost": 0
            }),
        ];
        assert_eq!(next_spend(&entries, "epic-1", "epic"), json!(4.0));
        assert_eq!(next_spend(&entries, "never-used", "run"), json!(0.0));

        let mut missing = entries;
        missing[1]["rowsMissingCost"] = json!(1);
        assert_eq!(next_spend(&missing, "epic-1", "epic"), Value::Null);
    }

    #[test]
    fn next_symptoms_share_the_default_global_row_budget() {
        assert_eq!(
            next_default_limits([10, 2, 0, 3], Some(47)),
            ([10, 2, 0, 3], 15)
        );
        assert_eq!(
            next_default_limits([30, 2, 0, 3], Some(47)),
            ([30, 0, 0, 0], 0)
        );
        assert_eq!(next_default_limits([10, 2, 0, 3], None), ([10, 2, 0, 3], 0));
    }

    #[test]
    fn next_string_and_recent_delivery_bounds_are_exact() {
        assert_eq!(next_title(&"x".repeat(61)).chars().count(), 60);
        assert!(next_within_last_day(
            "2026-09-03T12:00:00Z",
            Some("2026-09-02T12:00:00Z")
        ));
        assert!(!next_within_last_day(
            "2026-09-03T12:00:00Z",
            Some("2026-09-02T11:59:59Z")
        ));
        assert!(!next_within_last_day("2026-09-03T12:00:00Z", None));

        let legacy = json!({
            "id": "legacy-landed",
            "delivery": {"pr": Value::Null},
            "pr": {"number": 260},
            "updatedAt": "2026-09-03T11:00:00Z",
            "costUsdKnown": 0.0,
            "rowsMissingCost": 0,
        });
        let row = next_landed_row(
            &legacy,
            std::slice::from_ref(&legacy),
            "2026-09-03T12:00:00Z",
        )
        .expect("legacy landed row");
        assert_eq!(row["pr"], json!(260));
    }

    #[test]
    fn policy_splice_changes_only_the_revisable_trio() {
        let standing = ExecutionPolicyV1 {
            gate_commands: vec!["wrong gate".to_owned()],
            stage_budget_s: BTreeMap::from([
                (Stage::Implement, 10),
                (Stage::ReviewClaude, 11),
                (Stage::ReviewCodex, 12),
                (Stage::Fix, 13),
            ]),
            termination_grace_s: 17,
            transport_retry_budget: 1,
            seat_commands: Vec::new(),
            deadline_retry_budget: 1,
            seat_env: Default::default(),
            host_policy: HostPolicyV1::Preferred,
            herdr_socket: Some(PathBuf::from("/standing/herdr.sock")),
        };
        let current = ExecutionPolicyV1 {
            gate_commands: vec!["correct gate".to_owned()],
            stage_budget_s: BTreeMap::from([
                (Stage::Implement, 20),
                (Stage::ReviewClaude, 21),
                (Stage::ReviewCodex, 22),
                (Stage::Fix, 23),
            ]),
            termination_grace_s: 99,
            transport_retry_budget: 5,
            seat_commands: Vec::new(),
            deadline_retry_budget: 1,
            seat_env: Default::default(),
            host_policy: HostPolicyV1::Off,
            herdr_socket: Some(PathBuf::from("/drifted/herdr.sock")),
        };

        let spliced = splice_policy(&standing, current.clone());
        assert_eq!(spliced.gate_commands, current.gate_commands);
        assert_eq!(spliced.stage_budget_s, current.stage_budget_s);
        assert_eq!(
            spliced.transport_retry_budget,
            current.transport_retry_budget
        );
        assert_eq!(spliced.termination_grace_s, standing.termination_grace_s);
        assert_eq!(spliced.host_policy, standing.host_policy);
        assert_eq!(spliced.herdr_socket, standing.herdr_socket);
    }
}
