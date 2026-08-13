//! Packet building and execution: fill a `WorkPacket` from a
//! `PacketIntent`, materialize the packet directory, render the prompt,
//! spawn the provider through a `SessionHost`, await the sentinel, harvest
//! the result, and land or fail it. The section-(d) order is load-bearing.

use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;

use forged_host::{ProcessHost, SessionHost};
use forged_ledger::{EffectClass, RunRow};
use forged_proto::{LandOutcome, PacketIntent, ProtoEvent};
use forged_provider::{
    ClaudeDriver, CodexDriver, PacketDirs, PromptStage, PromptTemplates, ProviderDriver,
};
use forged_types::{Deliverable, OperationRequest, Stage, StageContract, WorkPacket};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::adapters::extract::{harvest_claude, harvest_codex, Harvest};
use crate::adapters::ports::ForgedPorts;
use crate::config::{now_iso, stage_str, HostPolicy};
use crate::core::{on_ledger, session_claimant, Ctx, Failure};
use crate::failpoint;

/// Everything packet execution needs beyond the packet itself.
pub struct ExecutionContext {
    /// The draft PR number, once one exists.
    pub pr_number: Option<u64>,
    /// The merged findings of the latest review fan-out (for Fix prompts).
    pub findings: Vec<forged_types::Finding>,
    /// Standing review evidence supplied to an adaptive synthesis seat.
    pub review_evidence: Vec<String>,
    /// The run's remote URL (for Fix prompts).
    pub push_url: String,
    /// Frozen process-host policy for this run.
    pub host_policy: HostPolicy,
    /// Frozen Herdr endpoint for this run.
    pub herdr_socket: Option<std::path::PathBuf>,
}

/// How one executed packet ended.
#[derive(Debug, Clone, PartialEq)]
pub enum PacketOutcome {
    /// The result landed.
    Landed(Box<forged_types::PacketResult>),
    /// The fence refused a stale token; the bytes were quarantined.
    Quarantined,
    /// A transport failure was recorded (free retry within the budget).
    Transport(String),
    /// A semantic failure was recorded.
    Semantic(String),
    /// Our own attempt was revoked mid-flight; the provider was stopped.
    Revoked,
}

/// SHA-256 hex over a file's bytes.
pub fn sha256_file(path: &Path) -> Result<String, Failure> {
    let bytes = std::fs::read(path)
        .map_err(|e| Failure::invalid(format!("cannot read spec {}: {e}", path.display())))?;
    let digest = Sha256::digest(&bytes);
    let mut hex = String::with_capacity(64);
    for byte in digest {
        use std::fmt::Write as _;
        let _ = write!(hex, "{byte:02x}");
    }
    Ok(hex)
}

/// The herdr workspace forged places this run's seats in: `forged-<repo>`,
/// where `<repo>` is the final component of the run's repo path.
///
/// The `forged-` prefix is the contract, not decoration. Operators label
/// their own herdr workspaces after the projects they work in, so a bare repo
/// name would resolve to the very workspace the run is being led FROM and
/// split the panes in use there. Only a workspace inside this namespace is
/// ever targeted.
///
/// `None` whenever the repo path names nothing usable, which leaves placement
/// untargeted rather than failing the spawn.
pub fn workspace_label_for_repo(repo: &str) -> Option<String> {
    let name = Path::new(repo).file_name()?.to_str()?;
    (!name.is_empty()).then(|| format!("forged-{name}"))
}

/// [`workspace_label_for_repo`] for a run whose repo must be read from the
/// ledger. `None` also when the run row cannot be read.
async fn workspace_label(ctx: &Ctx, run_id: &str) -> Option<String> {
    let run_id = run_id.to_owned();
    let run = on_ledger(&ctx.ledger, move |l| l.get_run(&run_id))
        .await
        .ok()?;
    workspace_label_for_repo(&run.repo)
}

/// Fill every `WorkPacket` field the intent does not carry.
pub fn build_packet(
    ctx: &Ctx,
    run: &RunRow,
    intent: &PacketIntent,
    spec_path: &str,
    spec_sha256: &str,
    gate_commands: &[String],
    budget_s: u64,
) -> WorkPacket {
    let stage = intent.stage;
    let packet_id = intent
        .packet_id
        .clone()
        .unwrap_or_else(|| format!("{}/{}/{}", run.run_id, stage_str(stage), intent.seq));
    let deliverable = match stage {
        Stage::Implement => Deliverable::CommitsInWorktree,
        Stage::ReviewClaude | Stage::ReviewCodex => Deliverable::ReviewBlock,
        Stage::Fix => Deliverable::FixCommitsPushed,
    };
    let instructions = match stage {
        Stage::Implement => "implement the spec in the worktree and report honestly",
        Stage::ReviewClaude | Stage::ReviewCodex => {
            "review the diff against the spec and report a verdict"
        }
        Stage::Fix => "address the merged review findings and push the fixes",
    };
    WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id,
        run_id: run.run_id.clone(),
        bead_id: run.bead_id.clone(),
        stage,
        execution: intent.execution.clone(),
        lane_seq: intent.execution.as_ref().map(|_| intent.seq),
        spec: forged_types::SpecRef {
            path: spec_path.to_owned(),
            sha256: spec_sha256.to_owned(),
        },
        worktree: ctx.config.worktree(&run.run_id),
        branch: run.branch.clone(),
        base_ref: run.base_ref.clone(),
        contract: StageContract {
            instructions: instructions.to_owned(),
            gate_commands: gate_commands.to_vec(),
            deliverable,
            budget_s: u32::try_from(budget_s).unwrap_or(u32::MAX),
        },
        result_schema: PromptStage::for_stage(stage).result_schema().to_owned(),
        provider_hints: intent.hints.clone(),
        field_notes: Vec::new(),
    }
}

/// Open a packet through the fence (`packet_open`, SafeRetry, ledger-local).
pub async fn open_packet_op(ctx: &Ctx, run: &RunRow, packet: &WorkPacket) -> Result<(), Failure> {
    let body_json = serde_json::to_string(packet)
        .map_err(|e| Failure::internal(format!("cannot serialize packet: {e}")))?;
    let (stage_key, logical_seq, lane_seq) = match &packet.execution {
        Some(execution) => (
            execution.stage_id.clone(),
            i64::from(execution.round),
            packet
                .lane_seq
                .ok_or_else(|| Failure::internal("semantic packet has no lane sequence"))?,
        ),
        None => {
            let (_, stage, seq) = crate::core::split_packet_id(&packet.packet_id)?;
            (stage_str(stage).to_owned(), seq, seq)
        }
    };
    let key = crate::core::derive_key(
        "packet_open",
        Some(&run.run_id),
        Some(&stage_key),
        Some(logical_seq),
    );
    let req = OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(run.run_id.clone()),
        params: match json!({"stage": stage_key, "seq": logical_seq}) {
            Value::Object(map) => map,
            _ => unreachable!("literal is an object"),
        },
    };
    let new_packet = forged_ledger::NewPacket {
        run_id: run.run_id.clone(),
        stage: packet.stage,
        seq: lane_seq,
        spec_path: packet.spec.path.clone(),
        spec_sha256: packet.spec.sha256.clone(),
        body_json,
    };
    let resp = crate::core::fenced(ctx, "packet_open", EffectClass::SafeRetry, &req, None, {
        let ledger = ctx.ledger.clone();
        move |_op_id| async move {
            let semantic_id = packet.execution.as_ref().map(|_| packet.packet_id.clone());
            let packet_id = tokio::task::spawn_blocking(move || match semantic_id {
                Some(packet_id) => ledger.open_packet_with_id(new_packet, packet_id),
                None => ledger.open_packet(new_packet),
            })
            .await
            .map_err(|e| Failure::internal(format!("join failure: {e}")))??;
            Ok(json!({"packetId": packet_id}))
        }
    })
    .await;
    if resp.ok {
        Ok(())
    } else {
        let err = resp.error.unwrap_or(forged_types::OpError {
            code: forged_types::ErrorCode::Internal,
            message: "packet open failed".to_owned(),
            recoverable: false,
            detail: None,
        });
        Err(Failure {
            code: err.code,
            message: err.message,
            recoverable: err.recoverable,
        })
    }
}

/// Build the render context for a stage — top-level keys exactly
/// `PromptStage::variables()`.
fn render_context(
    exec: &ExecutionContext,
    packet: &WorkPacket,
    fix_round: i64,
) -> Result<Value, Failure> {
    let worktree = packet.worktree.to_string_lossy().into_owned();
    let stage = PromptStage::for_stage(packet.stage);
    let value = match stage {
        PromptStage::Implement => json!({
            "bead_id": packet.bead_id,
            "worktree": worktree,
            "branch": packet.branch,
            "base_ref": format!("origin/{}", packet.base_ref),
            "spec_path": packet.spec.path,
            "gate_commands": packet.contract.gate_commands,
            "field_notes": packet.field_notes,
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::Review => json!({
            "bead_id": packet.bead_id,
            "pr_number": exec.pr_number.unwrap_or(0),
            "spec_path": packet.spec.path,
            "worktree": worktree,
            "field_notes": if packet.execution.as_ref().is_some_and(|value|
                value.purpose == forged_types::SeatPurpose::Synthesis
            ) {
                let mut notes = vec![
                    "Synthesize the standing independent review evidence into one controlling verdict; do not perform a fresh independent review.".to_owned()
                ];
                notes.extend(exec.review_evidence.iter().cloned());
                notes
            } else {
                packet.field_notes.clone()
            },
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::Fix => json!({
            "bead_id": packet.bead_id,
            "pr_number": exec.pr_number.unwrap_or(0),
            "worktree": worktree,
            "round": fix_round,
            "total_rounds": 1,
            "gate_commands": packet.contract.gate_commands,
            "push_url": exec.push_url,
            "findings": forged_provider::normalize_findings(&exec.findings),
            "field_notes": packet.field_notes,
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
    };
    Ok(value)
}

fn driver_for(provider: &str) -> Result<Box<dyn ProviderDriver>, Failure> {
    match provider {
        "claude" => Ok(Box::new(ClaudeDriver)),
        "codex" => Ok(Box::new(CodexDriver)),
        other => Err(Failure::invalid(format!(
            "unknown provider {other:?} in packet hints"
        ))),
    }
}

/// Poll `<packet_dir>/provider.pid` until the spawned shell writes it.
async fn await_pid(packet_dir: &Path) -> Option<u32> {
    for _ in 0..50 {
        if let Ok(text) = std::fs::read_to_string(packet_dir.join("provider.pid")) {
            if let Ok(pid) = text.trim().parse::<u32>() {
                return Some(pid);
            }
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    None
}

/// The packet's transport-failure count so far, from its latest
/// `proto.retry` grant.
async fn prior_transport_failures(ctx: &Ctx, run_id: &str, packet_id: &str) -> u32 {
    let run_id = run_id.to_owned();
    let packet_id = packet_id.to_owned();
    let events = on_ledger(&ctx.ledger, move |l| {
        let mut out = Vec::new();
        let mut after = 0i64;
        loop {
            let page = l.list_events(Some(&run_id), after, 256)?;
            let full = page.len() == 256;
            if let Some(last) = page.last() {
                after = last.event_id;
            }
            out.extend(page);
            if !full {
                return Ok(out);
            }
        }
    })
    .await
    .unwrap_or_default();
    let parsed = forged_proto::parse_proto_events(&events).unwrap_or_default();
    parsed
        .iter()
        .rev()
        .find_map(|e| match e {
            ProtoEvent::Retry {
                packet_id: p,
                transport_failures,
                ..
            } if *p == packet_id => Some(*transport_failures),
            _ => None,
        })
        .unwrap_or(0)
}

/// Execute one open packet end to end: claim, render, spawn, await,
/// harvest, land or fail. Follows the section-(d) order exactly.
pub async fn execute_packet(
    ctx: &Ctx,
    ports: &ForgedPorts,
    exec: &ExecutionContext,
    packet: &WorkPacket,
) -> Result<PacketOutcome, Failure> {
    let packet_id = packet.packet_id.clone();

    // Claim under the PER-ATTEMPT session identity (the bd lease stays the
    // run's, held by the driver): the ledger re-checks the stored spec hash
    // against the current file bytes — the caller re-hashes, the ledger does
    // no file IO.
    let current_sha = sha256_file(Path::new(&packet.spec.path))?;
    let claimed = {
        let packet_id = packet_id.clone();
        let claimant = session_claimant(&packet_id, &packet.provider_hints.provider);
        on_ledger(&ctx.ledger, move |l| {
            l.claim_packet(&packet_id, &claimant, &current_sha)
        })
        .await?
    };
    run_attempt(
        ctx,
        ports,
        exec,
        packet,
        claimed.attempt_id,
        &claimed.claim_token,
    )
    .await
}

/// Adopt an already-claimed attempt whose provider was never spawned (the
/// crash window between claim and spawn): spawn under the row's own token
/// and run the rest of the pipeline unchanged.
pub async fn execute_adopted(
    ctx: &Ctx,
    ports: &ForgedPorts,
    exec: &ExecutionContext,
    packet: &WorkPacket,
    attempt_id: i64,
    claim_token: &str,
) -> Result<PacketOutcome, Failure> {
    run_attempt(ctx, ports, exec, packet, attempt_id, claim_token).await
}

/// The shared attempt pipeline: render, spawn, await, harvest, settle.
async fn run_attempt(
    ctx: &Ctx,
    ports: &ForgedPorts,
    exec: &ExecutionContext,
    packet: &WorkPacket,
    attempt_id: i64,
    claim_token: &str,
) -> Result<PacketOutcome, Failure> {
    let mut packet = packet.clone();
    let run_id = packet.run_id.clone();
    let packet_id = packet.packet_id.clone();
    let interventions = crate::core::sessions::pending_interventions(ctx, &run_id).await?;
    packet
        .field_notes
        .extend(interventions.iter().map(|intervention| {
            format!(
                "Intervention {} from {}: {}",
                intervention.id, intervention.requested_by, intervention.message
            )
        }));
    // The guardian heartbeats the lease that is actually held — bd's
    // heartbeat is owner-only, and a heartbeat under a second, derived
    // identity would be refused and let the run's own lease lapse under it.
    let holder =
        crate::core::lease_identity(&ctx.config.bd_config(), &packet.bead_id, &run_id).await?;
    let (stage_key, seq) = match &packet.execution {
        Some(execution) => (execution.stage_id.as_str(), i64::from(execution.round)),
        None => {
            let (_, stage, seq) = crate::core::split_packet_id(&packet_id)?;
            (stage_str(stage), seq)
        }
    };
    let claim_token = claim_token.to_owned();

    // 1. Materialize the packet directory and render the prompt.
    let packet_dir = ctx.config.packet_dir_key(&run_id, stage_key, seq);
    std::fs::create_dir_all(&packet_dir)
        .map_err(|e| Failure::internal(format!("creating {}: {e}", packet_dir.display())))?;
    let dirs = PacketDirs::new(&packet_dir);
    let templates = PromptTemplates::load()?;
    let context = render_context(exec, &packet, seq)?;
    let prompt = templates.render(PromptStage::for_stage(packet.stage), &context)?;
    std::fs::write(dirs.prompt(), prompt)
        .map_err(|e| Failure::internal(format!("writing prompt: {e}")))?;

    // 2. The sentinel-free shell line.
    let driver = match driver_for(&packet.provider_hints.provider) {
        Ok(driver) => driver,
        Err(error) => {
            let note = format!("transport: provider adapter unavailable: {}", error.message);
            return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
        }
    };
    let invocation = driver.invocation(&packet, &dirs, &claim_token)?;

    // 3. Prefix the pid capture (no exec — the host appends the sentinel to
    // the same shell, and `$$` is that shell's pid either way) and spawn
    // with PATH passed explicitly. A stale pid file from a prior attempt is
    // removed first: absence means "spawn never happened", and only this
    // attempt's shell may write the file back.
    let pid_path = packet_dir.join("provider.pid");
    let _ = std::fs::remove_file(&pid_path);
    let _ = std::fs::remove_file(packet_dir.join(crate::adapters::ports::PROVIDER_LSTART));
    let shell_line = format!(
        "echo $$ > {}; {}",
        pid_path.to_string_lossy(),
        invocation.shell_line
    );
    let status_base = packet_dir.join("status").join(attempt_id.to_string());
    // Herdr is the preferred visibility adapter. The ledger records the
    // actual host selection, so a missing socket can never masquerade as a
    // Herdr-backed session.
    let (host, host_kind, socket_path): (Arc<dyn SessionHost>, &str, Option<String>) =
        match exec.host_policy {
            HostPolicy::Off => (Arc::new(ProcessHost::new(&status_base)), "process", None),
            HostPolicy::Preferred | HostPolicy::Required => match exec.herdr_socket.as_ref() {
                None => {
                    if exec.host_policy == HostPolicy::Required {
                        return fail_and_grant_retry(
                            ctx,
                            &packet_id,
                            &claim_token,
                            "transport: Herdr is required but no socket is configured".to_owned(),
                        )
                        .await;
                    }
                    crate::core::sessions::record_host_fallback(
                        ctx,
                        &run_id,
                        &packet_id,
                        attempt_id,
                        "no Herdr socket is configured",
                    )
                    .await?;
                    (Arc::new(ProcessHost::new(&status_base)), "process", None)
                }
                Some(sock) => match forged_host::HerdrHost::connect(sock, &status_base).await {
                    Ok(herdr) => (
                        Arc::new(match workspace_label(ctx, &run_id).await {
                            Some(label) => herdr.with_workspace(label),
                            None => herdr,
                        }),
                        "herdr",
                        Some(sock.to_string_lossy().into_owned()),
                    ),
                    Err(error) if exec.host_policy == HostPolicy::Preferred => {
                        crate::core::sessions::record_host_fallback(
                            ctx,
                            &run_id,
                            &packet_id,
                            attempt_id,
                            &error.to_string(),
                        )
                        .await?;
                        (Arc::new(ProcessHost::new(&status_base)), "process", None)
                    }
                    Err(error) => {
                        return fail_and_grant_retry(
                            ctx,
                            &packet_id,
                            &claim_token,
                            format!("transport: required Herdr host unavailable: {error}"),
                        )
                        .await;
                    }
                },
            },
        };
    let attach_hint =
        (host_kind == "herdr").then(|| format!("forged session read --attempt {attempt_id}"));
    let mut env = HashMap::new();
    if let Ok(path) = std::env::var("PATH") {
        env.insert("PATH".to_owned(), path);
    }
    // The bounded-orphan window (operator-adjudicated, accepted as a
    // residual): a crash between here and the shell writing `provider.pid`
    // leaves a provider no later process can identify, so no later process
    // can kill it. It is CONTAINED rather than prevented — nothing this
    // side of the spawn can make a process identity durable before the
    // process exists. The orphan never heartbeats, so the bd lease lapses
    // and the packet is reclaimed; and its eventual result is fenced by a
    // claim token that is no longer live, so `land_packet_result` quarantines
    // it instead of landing it. Reconcile's half of the containment is in
    // `adapters::ports`: an attempt whose identity never materialized past
    // the grace window is failed as a transport failure, never an
    // unavailable port.
    failpoint::hit("provider.spawn.before");
    let spawned = host.spawn(&packet.worktree, &shell_line, &env).await;
    failpoint::hit("provider.spawn.after");
    let session = match spawned {
        Ok(session) => session,
        Err(e) => {
            // A spawn failure is transport: the provider never got to think.
            let note = format!("transport: provider spawn failed: {e}");
            return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
        }
    };
    crate::core::sessions::record_session_started(
        ctx,
        crate::core::sessions::SessionStarted {
            run_id: &run_id,
            packet_id: &packet_id,
            attempt_id,
            host: host_kind,
            session_id: session.as_str(),
            socket_path: socket_path.as_deref(),
            attach_hint: attach_hint.as_deref(),
        },
    )
    .await?;
    crate::core::sessions::record_interventions_delivered(
        ctx,
        &run_id,
        &packet_id,
        attempt_id,
        &interventions,
        "boundary",
    )
    .await?;
    ports
        .adopt_session(attempt_id, Arc::clone(&host), session.clone())
        .await;

    // 4. The one pid: the spawned shell, which under setsid is also the
    // process-group id. Guardian heartbeats stop the moment it dies.
    //
    // No pid inside the window is a FAILED SPAWN, not a reason to continue:
    // an unguarded provider renews no bd lease, so another worker would
    // reclaim its apparently-expired work while it is still writing to the
    // worktree. Stop the session, record a transport failure, and let the
    // transport-retry budget decide whether to try again.
    let Some(pid) = await_pid(&packet_dir).await else {
        let _ = host.kill_confirmed(&session).await;
        let note = "transport: provider pid file never appeared".to_owned();
        return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
    };
    // The start-time stamp beside the pid is the pid-reuse guard for every
    // process that did not spawn this attempt (see `adapters::ports`).
    if let Some(lstart) = crate::adapters::ports::lstart_of(i32::try_from(pid).unwrap_or(-1)).await
    {
        let _ = std::fs::write(
            packet_dir.join(crate::adapters::ports::PROVIDER_LSTART),
            lstart,
        );
    }
    failpoint::hit("guardian.start");
    let gcfg = forged_beads::GuardianConfig::new(
        ctx.config.bd_config(),
        packet.bead_id.clone(),
        holder.clone(),
        pid,
    );
    let mut guardian = Some(tokio::spawn(forged_beads::run_guardian(gcfg)));

    // Await completion by polling the host; the sentinel status file is the
    // only exit-code truth.
    let mut beats: u32 = 0;
    let liveness = loop {
        match host.alive(&session).await {
            Ok(forged_host::Liveness::Running) => {
                beats += 1;
                if beats.is_multiple_of(25) {
                    // Keep the ledger's budget anchor honest while we wait.
                    let token = claim_token.clone();
                    let renewed =
                        on_ledger(&ctx.ledger, move |l| l.heartbeat_attempt(&token)).await;
                    if renewed.is_err() {
                        // Our attempt was revoked out from under us: stop the
                        // provider and report. Its tokens were still spent,
                        // and the successor attempt is about to overwrite
                        // the capture, so read it before killing the shell.
                        let _ = host.kill_confirmed(&session).await;
                        if let Some(handle) = guardian.take() {
                            handle.abort();
                        }
                        let out = std::fs::read_to_string(dirs.stdout()).unwrap_or_default();
                        crate::core::usage::capture_attempt(
                            ctx,
                            &run_id,
                            &packet_id,
                            Some(attempt_id),
                            &packet.provider_hints.provider,
                            &packet.provider_hints.model,
                            &out,
                        )
                        .await;
                        return Ok(PacketOutcome::Revoked);
                    }
                }
                tokio::time::sleep(Duration::from_millis(200)).await;
            }
            Ok(other) => break other,
            Err(e) => {
                if let Some(handle) = guardian.take() {
                    handle.abort();
                }
                return Err(e.into());
            }
        }
    };
    if let Some(handle) = guardian.take() {
        handle.abort();
    }

    // 5. Record what this attempt spent, before deciding what it produced.
    //
    // Here and nowhere else: the capture is complete, the attempt id is in
    // hand, and the outcome has not yet branched. A batch pass over packet
    // directories cannot reach this point — the packet directory is keyed
    // by stage and round, so the next attempt overwrites `out.jsonl` and
    // the tokens this one burned become unrecoverable. Rework spend is
    // only ever visible from inside the attempt that spent it.
    let out = std::fs::read_to_string(dirs.stdout()).unwrap_or_default();
    crate::core::usage::capture_attempt(
        ctx,
        &run_id,
        &packet_id,
        Some(attempt_id),
        &packet.provider_hints.provider,
        &packet.provider_hints.model,
        &out,
    )
    .await;

    // 6. Harvest per the extraction contract.
    let harvest = match liveness {
        forged_host::Liveness::Vanished => {
            Harvest::Transport("transport: session vanished".to_owned())
        }
        forged_host::Liveness::Exited(_code) => match packet.provider_hints.provider.as_str() {
            "codex" => {
                let last = std::fs::read_to_string(dirs.last_message()).ok();
                harvest_codex(&out, last.as_deref(), &packet.result_schema, &packet_id)
            }
            _ => harvest_claude(&out, &packet.result_schema, &packet_id),
        },
        forged_host::Liveness::Running => unreachable!("loop breaks only on terminal liveness"),
    };

    // 7. Settle. Every arm BINDS rather than returns, so the three settle
    // paths share one exit and none of them can skip the release below.
    let settled = match harvest {
        Harvest::Result(result) => {
            // Land through the seam that turns a stale-token refusal into a
            // quarantine — never Ledger::complete_packet directly. The
            // landing is itself a fenced HumanAmbiguous operation whose key
            // carries the attempt (an explicit key: attempts of one packet
            // must not replay each other's envelopes).
            land_result(
                ctx,
                ports,
                &run_id,
                &packet_id,
                attempt_id,
                &claim_token,
                *result,
            )
            .await
        }
        Harvest::Transport(note) => fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await,
        Harvest::Semantic(note) => {
            let packet_for_fail = packet_id.clone();
            let token = claim_token.clone();
            let fail_note = note.clone();
            on_ledger(&ctx.ledger, move |l| {
                l.fail_packet(&packet_for_fail, &token, &fail_note)
            })
            .await
            .map(|()| PacketOutcome::Semantic(note))
        }
    };

    // Release the seat's terminal, after the section-(d) order rather than
    // inside it. Bookkeeping, never fencing: the attempt is settled either
    // way, so this can neither fail it nor delay it. The revoked path above
    // does NOT come here — its `kill_confirmed` already closed the pane as
    // part of verified death.
    host.release(&session).await;
    settled
}

/// Land a harvested result under the fenced `packet_complete` operation.
pub async fn land_result(
    ctx: &Ctx,
    ports: &ForgedPorts,
    run_id: &str,
    packet_id: &str,
    attempt_id: i64,
    claim_token: &str,
    result: forged_types::PacketResult,
) -> Result<PacketOutcome, Failure> {
    let (_, stage_key, seq) = crate::core::split_packet_key(packet_id)?;
    let key = format!(
        "op:packet_complete:{run_id}:{}:{seq}:a{attempt_id}",
        stage_key
    );
    let req = OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(run_id.to_owned()),
        params: match json!({"packet": packet_id, "attempt": attempt_id}) {
            Value::Object(map) => map,
            _ => unreachable!("literal is an object"),
        },
    };
    let ledger = ctx.ledger.clone();
    let resp = crate::core::fenced(
        ctx,
        "packet_complete",
        EffectClass::HumanAmbiguous,
        &req,
        None,
        {
            let run_id = run_id.to_owned();
            let packet_id = packet_id.to_owned();
            let claim_token = claim_token.to_owned();
            let result = result.clone();
            move |_op_id| async move {
                let outcome = forged_proto::land_packet_result(
                    &ledger,
                    ports,
                    &run_id,
                    &packet_id,
                    attempt_id,
                    &claim_token,
                    &result,
                )
                .await?;
                Ok(match outcome {
                    LandOutcome::Completed => json!({"outcome": "Landed"}),
                    LandOutcome::Quarantined => json!({"outcome": "Quarantined"}),
                })
            }
        },
    )
    .await;
    if resp.ok {
        let landed = resp
            .result
            .as_ref()
            .and_then(|r| r.get("outcome"))
            .and_then(Value::as_str)
            == Some("Landed");
        if landed {
            Ok(PacketOutcome::Landed(Box::new(result)))
        } else {
            Ok(PacketOutcome::Quarantined)
        }
    } else {
        let err = resp.error.unwrap_or(forged_types::OpError {
            code: forged_types::ErrorCode::Internal,
            message: "landing failed".to_owned(),
            recoverable: false,
            detail: None,
        });
        Err(Failure {
            code: err.code,
            message: err.message,
            recoverable: err.recoverable,
        })
    }
}

/// Record a transport failure and grant the retry: fail the packet with the
/// `transport:` note, then append the `proto.retry` event carrying the
/// packet's transport-failure count and the backoff deadline computed from
/// the failed attempt's `ended_at` — what lets kill-matrix case 7 assert
/// the fix round is untouched.
async fn fail_and_grant_retry(
    ctx: &Ctx,
    packet_id: &str,
    claim_token: &str,
    note: String,
) -> Result<PacketOutcome, Failure> {
    let (run_id, _, _) = crate::core::split_packet_key(packet_id)?;
    let failed_at = {
        let packet_id = packet_id.to_owned();
        let token = claim_token.to_owned();
        let note = note.clone();
        on_ledger(&ctx.ledger, move |l| {
            l.fail_packet(&packet_id, &token, &note)?;
            let attempt =
                l.find_attempt_by_token(&token)?
                    .ok_or(forged_ledger::LedgerError::Internal {
                        message: "failed attempt not found by token".to_owned(),
                    })?;
            Ok(attempt.ended_at.clone().unwrap_or(attempt.updated_at))
        })
        .await?
    };
    let count = prior_transport_failures(ctx, &run_id, packet_id).await + 1;
    let deadline = forged_proto::backoff_deadline(&failed_at, count.saturating_sub(1))
        .unwrap_or_else(|_| now_iso());
    let event = ProtoEvent::Retry {
        packet_id: packet_id.to_owned(),
        transport_failures: count,
        retry_after: deadline,
    };
    {
        let run_id = run_id.clone();
        on_ledger(&ctx.ledger, move |l| {
            forged_proto::record(l, &run_id, event).map_err(|e| match e {
                forged_proto::ProtoError::Ledger(inner) => inner,
                other => forged_ledger::LedgerError::Internal {
                    message: other.to_string(),
                },
            })
        })
        .await?;
    }
    Ok(PacketOutcome::Transport(note))
}

#[cfg(test)]
mod tests {
    use super::workspace_label_for_repo;

    #[test]
    fn the_label_namespaces_the_repo_name_under_forged() {
        assert_eq!(
            workspace_label_for_repo("/Users/x/repositories/forge").as_deref(),
            Some("forged-forge")
        );
        assert_eq!(
            workspace_label_for_repo("/Users/x/repositories/drover").as_deref(),
            Some("forged-drover")
        );
    }

    #[test]
    fn the_label_never_collides_with_the_operators_own_workspace() {
        // The whole point: an operator labels their workspace after the
        // project (`forge`), leads the run from it, and forged must NOT
        // target it. Every derived label is prefixed, so no repo name can
        // ever produce the bare name the operator uses.
        for repo in [
            "/Users/x/repositories/forge",
            "/Users/x/drover",
            "/forged-forge",
            "relative/path/anvil",
        ] {
            let label = workspace_label_for_repo(repo).expect("a label");
            assert!(
                label.starts_with("forged-"),
                "{repo} produced an unprefixed label {label}"
            );
            assert_ne!(
                label,
                std::path::Path::new(repo)
                    .file_name()
                    .expect("a name")
                    .to_string_lossy(),
                "{repo} produced the operator's own workspace name"
            );
        }
    }

    #[test]
    fn a_repo_path_naming_nothing_leaves_placement_untargeted() {
        // `None` degrades to an untargeted split rather than failing a spawn.
        assert_eq!(workspace_label_for_repo("/"), None);
        assert_eq!(workspace_label_for_repo(""), None);
        assert_eq!(workspace_label_for_repo(".."), None);
    }
}
