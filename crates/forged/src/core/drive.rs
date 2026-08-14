//! `run advance` / `run drive`: project → advance → honor the action —
//! `advance` is one iteration of the loop, `drive` repeats it until `Stop`.
//! Machine steps are recorded through the operation store under
//! `machine_idempotency_key`; provider stages become packets executed by
//! the adapters.

use std::path::PathBuf;
use std::time::Duration;

use forged_gate::GateRequest;
use forged_git::GhClient;
use forged_ledger::{EffectClass, OperationState, RunRow};
use forged_proto::{
    machine_idempotency_key, MachineStage, NextAction, PacketIntent, ProtoEvent, RunView, Terminal,
};
use forged_types::{
    ExecutionPolicyV1, OperationRequest, OperationResponse, Outcome, Stage, Verdict,
};
use serde_json::{json, Map, Value};

use crate::adapters::execute::{
    build_packet, execute_packet, open_packet_op, ExecutionContext, PacketOutcome,
};
use crate::adapters::ports::{repo_slug, ForgedPorts};
use crate::config::now_iso;
use crate::core::spec::SpecSource;
use crate::core::{
    derive_key, err_response, fenced, ok_response, on_ledger, param_str, run_holder, Ctx, Failure,
};
use crate::failpoint;

/// Project one run into the engine's input. Definition-backed runs use their
/// frozen compatibility roster; legacy runs fall back to the once-read config.
pub async fn project(ctx: &Ctx, run_id: &str) -> Result<RunView, Failure> {
    let legacy_roster = ctx.config.roster.clone();
    let legacy_policy = ExecutionPolicyV1 {
        gate_commands: ctx.config.gate_commands.clone(),
        stage_budget_s: ctx
            .config
            .stage_budget_s
            .iter()
            .map(|(stage, budget)| (*stage, *budget))
            .collect(),
        transport_retry_budget: ctx.config.transport_retry_budget,
        host_policy: ctx.config.host_policy,
        herdr_socket: ctx.config.herdr_sock.clone(),
    };
    let run_id = run_id.to_owned();
    let now = now_iso();
    let ledger = ctx.ledger.clone();
    tokio::task::spawn_blocking(move || {
        let roster = match ledger.get_run_definition(&run_id).map_err(Failure::from)? {
            Some(definition) => serde_json::from_str(&definition.compatibility_roster_json)
                .map_err(|error| {
                    Failure::internal(format!(
                        "stored compatibility roster does not parse: {error}"
                    ))
                })?,
            None => legacy_roster,
        };
        forged_proto::project_run_with_policy(&ledger, &run_id, roster, legacy_policy, &now)
            .map_err(Failure::from)
    })
    .await
    .map_err(|e| Failure::internal(format!("join failure: {e}")))?
}

/// Whether a machine step at `round` has a terminal operation row — the
/// engine's own settlement test, mirrored for round detection.
fn op_settled_in(view: &RunView, step: MachineStage, round: u32) -> bool {
    let key = machine_idempotency_key(&view.run.run_id, step, round);
    view.settled_operations.iter().any(|o| {
        o.idempotency_key == key && o.name == step.as_str() && o.state == OperationState::Terminal
    })
}

/// The round a `RunMachine` action refers to, derived from the view.
fn round_of(view: &RunView, step: MachineStage) -> u32 {
    match step {
        MachineStage::ReGate => 1,
        MachineStage::Push if op_settled_in(view, MachineStage::Push, 0) => 1,
        _ => 0,
    }
}

/// The spec source recorded at run start (the `forged.run.spec` event).
///
/// A payload carrying `specPath` is the deprecated file route — including
/// every run started before the bead became the source of truth, which is
/// why the path is still read first.
pub async fn spec_source_of(ctx: &Ctx, run_id: &str) -> Result<SpecSource, Failure> {
    let run_id_owned = run_id.to_owned();
    let events = on_ledger(&ctx.ledger, move |l| {
        l.list_events(Some(&run_id_owned), 0, 4096)
    })
    .await?;
    for row in &events {
        if row.kind == "forged.run.spec" {
            if let Ok(payload) = serde_json::from_str::<Value>(&row.payload_json) {
                if let Some(path) = payload.get("specPath").and_then(Value::as_str) {
                    return Ok(SpecSource::File(path.to_owned()));
                }
                if let Some(bead) = payload.get("beadId").and_then(Value::as_str) {
                    return Ok(SpecSource::Bead(bead.to_owned()));
                }
            }
        }
    }
    Err(Failure::internal(format!(
        "run {run_id} has no recorded spec source"
    )))
}

/// The draft PR number, from the settled `draftpr` machine operation.
pub(crate) fn pr_number_of(view: &RunView) -> Option<u64> {
    let key = machine_idempotency_key(&view.run.run_id, MachineStage::DraftPr, 0);
    view.settled_operations
        .iter()
        .find(|o| o.idempotency_key == key)
        .and_then(|o| o.response_json.as_deref())
        .and_then(|j| serde_json::from_str::<OperationResponse>(j).ok())
        .and_then(|r| r.result)
        .and_then(|v| {
            v.get("pr")
                .and_then(|p| p.get("number"))
                .and_then(Value::as_u64)
        })
}

/// The merged findings of the latest review fan-out.
pub(crate) fn latest_review_findings(view: &RunView) -> Vec<forged_types::Finding> {
    if view.execution_package.is_some() {
        let semantic: Vec<_> = view
            .packets
            .iter()
            .filter_map(|row| {
                let packet = forged_proto::stored_packet(row).ok()?;
                let execution = packet.execution?;
                (execution.purpose == forged_types::SeatPurpose::Review)
                    .then_some((row, execution.round))
            })
            .collect();
        let latest_round = semantic.iter().map(|(_, round)| *round).max();
        let mut findings = Vec::new();
        for (packet, _) in semantic
            .into_iter()
            .filter(|(_, round)| Some(*round) == latest_round)
        {
            if let Some(history) = view.terminal_attempts.get(&packet.packet_id) {
                if let Some(Outcome::Review {
                    findings: leg_findings,
                    ..
                }) = history
                    .iter()
                    .rev()
                    .find_map(|attempt| attempt.outcome.as_ref())
                {
                    findings.extend(leg_findings.iter().cloned());
                }
            }
        }
        return findings;
    }
    let latest_seq = view
        .packets
        .iter()
        .filter(|p| matches!(p.stage, Stage::ReviewClaude | Stage::ReviewCodex))
        .map(|p| p.seq)
        .max();
    let Some(seq) = latest_seq else {
        return Vec::new();
    };
    let mut findings = Vec::new();
    for packet in view
        .packets
        .iter()
        .filter(|p| matches!(p.stage, Stage::ReviewClaude | Stage::ReviewCodex) && p.seq == seq)
    {
        if let Some(history) = view.terminal_attempts.get(&packet.packet_id) {
            for attempt in history.iter().rev() {
                if let Some(Outcome::Review {
                    findings: leg_findings,
                    ..
                }) = &attempt.outcome
                {
                    findings.extend(leg_findings.iter().cloned());
                    break;
                }
            }
        }
    }
    findings
}

/// Stable, compact evidence from the latest semantic review round for a
/// synthesis seat. The synthesis provider receives outcomes, not transcripts.
fn latest_review_evidence(view: &RunView) -> Vec<String> {
    let semantic: Vec<_> = view
        .packets
        .iter()
        .filter_map(|row| {
            let packet = forged_proto::stored_packet(row).ok()?;
            let execution = packet.execution?;
            (execution.purpose == forged_types::SeatPurpose::Review).then_some((
                row,
                execution.round,
                execution.seat_id,
            ))
        })
        .collect();
    let latest_round = semantic.iter().map(|(_, round, _)| *round).max();
    semantic
        .into_iter()
        .filter(|(_, round, _)| Some(*round) == latest_round)
        .filter_map(|(packet, _, seat)| {
            let outcome = view
                .terminal_attempts
                .get(&packet.packet_id)?
                .iter()
                .rev()
                .find_map(|attempt| attempt.outcome.as_ref())?;
            serde_json::to_string(outcome)
                .ok()
                .map(|body| format!("seat {} outcome: {body}", seat.as_str()))
        })
        .collect()
}

/// The run's remote URL, for the fix prompt's `push_url`.
async fn push_url_of(repo: &str) -> String {
    let out = tokio::process::Command::new("git")
        .arg("-C")
        .arg(repo)
        .args(["remote", "get-url", "origin"])
        .stdin(std::process::Stdio::null())
        .output()
        .await;
    match out {
        Ok(out) if out.status.success() => String::from_utf8_lossy(&out.stdout).trim().to_owned(),
        _ => String::new(),
    }
}

/// Serialize a `NextAction` for the wire.
fn action_json(action: &NextAction) -> Value {
    match action {
        NextAction::RunMachine(step) => json!({"runMachine": step.as_str()}),
        NextAction::OpenPackets(intents) => json!({
            "openPackets": intents
                .iter()
                .map(|i| json!({"stage": crate::config::stage_str(i.stage), "seq": i.seq}))
                .collect::<Vec<_>>()
        }),
        NextAction::AwaitPacket {
            packet_id,
            not_before,
        } => json!({"awaitPacket": {"packetId": packet_id, "notBefore": not_before}}),
        NextAction::EscalateProfile(escalation) => json!({
            "escalateProfile": {
                "from": escalation.from,
                "to": escalation.to,
                "trigger": escalation.trigger,
            }
        }),
        NextAction::Stop(terminal) => json!({"stop": terminal_json(terminal)}),
    }
}

/// Serialize a `Terminal` for the wire.
pub fn terminal_json(terminal: &Terminal) -> Value {
    match terminal {
        Terminal::Done { final_verdict } => json!({
            "done": {"finalVerdict": final_verdict.map(verdict_str)}
        }),
        Terminal::ProviderUnavailable { stage, attempts } => json!({
            "providerUnavailable": {
                "stage": crate::config::stage_str(*stage),
                "attempts": attempts,
            }
        }),
        Terminal::SemanticProviderUnavailable { stage_id, attempts } => json!({
            "providerUnavailable": {
                "stage": stage_id,
                "attempts": attempts,
            }
        }),
        Terminal::ExternallyStopped { reason } => {
            json!({"externallyStopped": {"reason": reason}})
        }
    }
}

fn verdict_str(v: Verdict) -> &'static str {
    match v {
        Verdict::Approve => "approve",
        Verdict::RequestChanges => "requestChanges",
        Verdict::Block => "block",
    }
}

/// What honoring one action produced.
enum Honored {
    /// The action ran; project again.
    Progressed,
    /// The action is a wait on someone else's live attempt (or a future
    /// retry deadline) — `advance` reports it; `drive` sleeps.
    Waiting,
    /// The run is over.
    Stopped(Terminal),
}

/// Honor one `NextAction`.
async fn honor(
    ctx: &Ctx,
    ports: &ForgedPorts,
    view: &RunView,
    action: &NextAction,
    wait_allowed: bool,
) -> Result<Honored, Failure> {
    match action {
        NextAction::Stop(terminal) => Ok(Honored::Stopped(terminal.clone())),
        NextAction::RunMachine(step) => {
            machine_op(ctx, view, *step).await?;
            Ok(Honored::Progressed)
        }
        NextAction::OpenPackets(intents) => {
            // ONE spec resolution for the whole batch — one bd read per
            // packet open, never one per seat.
            let source = spec_source_of(ctx, &view.run.run_id).await?;
            let spec = crate::core::spec::resolve(ctx, &source).await?;
            for intent in intents {
                let budget = view
                    .policy
                    .stage_budget_s
                    .get(&intent.stage)
                    .copied()
                    .ok_or_else(|| Failure::internal("frozen policy has no stage budget"))?;
                let packet = build_packet(
                    ctx,
                    &view.run,
                    intent,
                    &source,
                    &spec,
                    &view.policy.gate_commands,
                    budget,
                )?;
                open_packet_op(ctx, &packet).await?;
            }
            Ok(Honored::Progressed)
        }
        NextAction::EscalateProfile(escalation) => {
            let run_id = view.run.run_id.clone();
            let escalation = escalation.clone();
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.append_event_once(
                    &run_id,
                    "forged.profile.escalated",
                    json!({
                        "schemaVersion": 1,
                        "from": escalation.from,
                        "to": escalation.to,
                        "trigger": escalation.trigger,
                    }),
                )?;
                Ok(())
            })
            .await?;
            Ok(Honored::Progressed)
        }
        NextAction::AwaitPacket {
            packet_id,
            not_before,
        } => {
            honor_await(
                ctx,
                ports,
                view,
                packet_id,
                not_before.as_deref(),
                wait_allowed,
            )
            .await
        }
    }
}

/// Honor `AwaitPacket`: with a live attempt it means wait (or adopt a
/// claimed-but-never-spawned or corpse attempt); with the packet open and
/// no live attempt it means claim it again, no earlier than `not_before`.
async fn honor_await(
    ctx: &Ctx,
    ports: &ForgedPorts,
    view: &RunView,
    packet_id: &str,
    not_before: Option<&str>,
    wait_allowed: bool,
) -> Result<Honored, Failure> {
    let live = view
        .live_attempts
        .iter()
        .find(|a| a.packet_id == packet_id)
        .cloned();
    if let Some(attempt) = live {
        let (run_id, stage_key, seq) = crate::core::split_packet_key(packet_id)?;
        let packet_dir = ctx.config.packet_dir_key(&run_id, &stage_key, seq);
        let pid = std::fs::read_to_string(packet_dir.join("provider.pid"))
            .ok()
            .and_then(|t| t.trim().parse::<i32>().ok());
        match pid {
            None => {
                // Claimed but never spawned — the crash window between claim
                // and spawn. Adopt: spawn under the row's own token.
                let exec = execution_context(ctx, view).await?;
                let packet = stored_packet_for_attempt(view, packet_id)?;
                let outcome = crate::adapters::execute::execute_adopted(
                    ctx,
                    ports,
                    &exec,
                    &packet,
                    attempt.attempt_id,
                    &attempt.claim_token,
                )
                .await?;
                after_outcome(outcome);
                Ok(Honored::Progressed)
            }
            Some(pid) if pid_alive(pid) => {
                // Someone else's provider is genuinely running.
                if wait_allowed {
                    tokio::time::sleep(Duration::from_millis(500)).await;
                    Ok(Honored::Progressed)
                } else {
                    Ok(Honored::Waiting)
                }
            }
            Some(_) => {
                // A corpse: run one reconcile pass so the saga revokes it.
                let config = forged_proto::ReconcileConfig {
                    stage_budget_s: view
                        .policy
                        .stage_budget_s
                        .iter()
                        .map(|(stage, budget)| (*stage, *budget))
                        .collect(),
                    gate_commands: view.policy.gate_commands.clone(),
                };
                let now = now_iso();
                forged_proto::reconcile(&ctx.ledger, &view.run.run_id, ports, &config, &now)
                    .await?;
                Ok(Honored::Progressed)
            }
        }
    } else {
        // Claim-again: honor the retry deadline first.
        if let Some(deadline) = not_before {
            let now = now_iso();
            if deadline > now.as_str() {
                if !wait_allowed {
                    return Ok(Honored::Waiting);
                }
                sleep_until(deadline).await;
            }
        }
        let exec = execution_context(ctx, view).await?;
        let packet = stored_packet_for_attempt(view, packet_id)?;
        // `execute_packet` owns everything that happens before an attempt
        // row exists on this path: it re-pins the packet to the spec it just
        // read (a bead edited underneath an open packet would otherwise
        // refuse `SpecDrift` on every retry, forever) and charges a
        // pre-claim bd outage to the packet's bounded retry budget.
        let outcome = execute_packet(ctx, ports, &exec, &packet).await?;
        after_outcome(outcome);
        Ok(Honored::Progressed)
    }
}

fn after_outcome(outcome: PacketOutcome) {
    match outcome {
        PacketOutcome::Landed(_) => tracing::info!("packet landed"),
        PacketOutcome::Quarantined => tracing::warn!("packet result quarantined"),
        PacketOutcome::Transport(note) => tracing::warn!(note, "transport failure recorded"),
        PacketOutcome::Unspawned(note) => {
            tracing::warn!(note, "attempt retired before any provider ran")
        }
        PacketOutcome::Semantic(note) => tracing::warn!(note, "semantic failure recorded"),
        PacketOutcome::Revoked => tracing::warn!("attempt revoked mid-flight"),
    }
}

fn pid_alive(pid: i32) -> bool {
    matches!(
        nix::sys::signal::kill(nix::unistd::Pid::from_raw(pid), None),
        Ok(()) | Err(nix::errno::Errno::EPERM)
    )
}

/// Sleep until a widened RFC-3339 deadline (bounded polls, never a busy
/// loop).
async fn sleep_until(deadline: &str) {
    loop {
        let now = now_iso();
        if now.as_str() >= deadline {
            return;
        }
        tokio::time::sleep(Duration::from_millis(500)).await;
    }
}

/// The stored `WorkPacket` for a packet row, rehydrated with the spec its
/// columns pin.
pub(crate) fn stored_packet_for_attempt(
    view: &RunView,
    packet_id: &str,
) -> Result<forged_types::WorkPacket, Failure> {
    let row = view
        .packets
        .iter()
        .find(|p| p.packet_id == packet_id)
        .ok_or_else(|| Failure::invalid(format!("no packet {packet_id:?} in view")))?;
    let mut packet = forged_proto::stored_packet(row)
        .map_err(|e| Failure::internal(format!("stored packet body does not parse: {e}")))?;
    if let (Some(package), Some(execution)) = (&view.execution_package, &packet.execution) {
        let candidates = package
            .roster
            .roles
            .get(&execution.role_id)
            .ok_or_else(|| {
                Failure::invalid(format!(
                    "active roster revision has no role {:?}",
                    execution.role_id.as_str()
                ))
            })?;
        let failures = view
            .terminal_attempts
            .get(packet_id)
            .map(|history| {
                transport_fallback_index(
                    history,
                    view.active_roster_revision
                        .as_ref()
                        .map(|revision| revision.created_at.as_str()),
                )
            })
            .unwrap_or(0);
        let index = failures.min(candidates.len().saturating_sub(1));
        let candidate = candidates.get(index).ok_or_else(|| {
            Failure::invalid(format!(
                "active roster role {:?} has no candidates",
                execution.role_id.as_str()
            ))
        })?;
        packet.provider_hints = forged_types::ProviderHints {
            provider: candidate.provider.clone(),
            model: candidate.model.clone(),
            effort: candidate.effort.clone(),
            sandbox: candidate.sandbox,
        };
    }
    Ok(packet)
}

fn transport_fallback_index(
    history: &[forged_proto::TerminalAttempt],
    revision_started_at: Option<&str>,
) -> usize {
    history
        .iter()
        .filter(|attempt| {
            revision_started_at.is_none_or(|boundary| attempt.started_at.as_str() >= boundary)
                && attempt.state == forged_ledger::AttemptState::Failed
                && forged_proto::classify_failure(attempt.fail_note.as_deref().unwrap_or(""))
                    == forged_proto::FailureKind::Transport
        })
        .count()
}

/// Assemble the execution context for provider packets.
async fn execution_context(_ctx: &Ctx, view: &RunView) -> Result<ExecutionContext, Failure> {
    Ok(ExecutionContext {
        pr_number: pr_number_of(view),
        findings: latest_review_findings(view),
        review_evidence: latest_review_evidence(view),
        push_url: push_url_of(&view.run.repo).await,
        host_policy: view.policy.host_policy,
        herdr_socket: view.policy.herdr_socket.clone(),
    })
}

/// Run one machine step through the fence under its machine key.
async fn machine_op(ctx: &Ctx, view: &RunView, step: MachineStage) -> Result<(), Failure> {
    let run = &view.run;
    let round = round_of(view, step);
    let key = machine_idempotency_key(&run.run_id, step, round);
    let class = match step {
        MachineStage::Resolve | MachineStage::Gate | MachineStage::ReGate => EffectClass::SafeRetry,
        MachineStage::Push | MachineStage::DraftPr => EffectClass::ObserveOnly,
    };
    let params: Map<String, Value> = match step {
        MachineStage::Resolve => obj(json!({
            // The request descriptor names the DERIVED holder: params are
            // hashed for idempotency, so this must not vary with whatever
            // the bead happens to be held under at the moment of a redo.
            // The identity actually taken is reported in the result.
            "leaseHolder": run_holder(&run.bead_id),
            "repo": run.repo,
            "base": run.base_ref,
            "branch": run.branch,
        })),
        MachineStage::Push => {
            let sha = rev_parse_head(&ctx.config.worktree(&run.run_id)).await?;
            obj(json!({"expectedSha": sha, "branch": run.branch}))
        }
        MachineStage::DraftPr => obj(json!({"head": run.branch, "base": run.base_ref})),
        MachineStage::Gate | MachineStage::ReGate => obj(json!({})),
    };
    let req = OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(run.run_id.clone()),
        params,
    };
    let run = run.clone();
    let gate_commands = view.policy.gate_commands.clone();
    let resp =
        fenced(
            ctx,
            step.as_str(),
            class,
            &req,
            None,
            move |op_id| async move {
                machine_effect(ctx, &run, step, round, &op_id, &gate_commands).await
            },
        )
        .await;
    if resp.ok {
        Ok(())
    } else {
        let err = resp.error.unwrap_or(forged_types::OpError {
            code: forged_types::ErrorCode::Internal,
            message: format!("machine step {} failed", step.as_str()),
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

fn obj(value: Value) -> Map<String, Value> {
    match value {
        Value::Object(map) => map,
        _ => Map::new(),
    }
}

async fn rev_parse_head(worktree: &PathBuf) -> Result<String, Failure> {
    let out = tokio::process::Command::new("git")
        .arg("-C")
        .arg(worktree)
        .args(["rev-parse", "HEAD"])
        .stdin(std::process::Stdio::null())
        .output()
        .await
        .map_err(|e| Failure::internal(format!("git rev-parse: {e}")))?;
    if !out.status.success() {
        return Err(Failure::internal(format!(
            "git rev-parse HEAD: {}",
            String::from_utf8_lossy(&out.stderr)
        )));
    }
    Ok(String::from_utf8_lossy(&out.stdout).trim().to_owned())
}

/// The machine-step effect bodies.
async fn machine_effect(
    ctx: &Ctx,
    run: &RunRow,
    step: MachineStage,
    round: u32,
    op_id: &str,
    gate_commands: &[String],
) -> Result<Value, Failure> {
    match step {
        MachineStage::Resolve => {
            let spec = forged_git::WorktreeSpec {
                repo: PathBuf::from(&run.repo),
                runs_root: ctx.config.runs_root.clone(),
                run_id: run.run_id.clone(),
                branch: run.branch.clone(),
                base: run.base_ref.clone(),
                expected_base_sha: None,
            };
            let prepared = match forged_git::prepare_worktree(&spec).await {
                Ok(prepared) => Some(prepared),
                // A redo after a crash finds our own worktree in place —
                // prepare is deliberately not idempotent, the redo is.
                Err(forged_git::GitError::WorktreeExists { .. }) => None,
                Err(e) => return Err(e.into()),
            };
            // ONE lease identity end to end: a bead already held under the
            // pre-run identity a fresh `claim-next` claimed it with — or
            // under this run's derived holder from an earlier pass — IS this
            // run's lease. Claim under that string rather than a second,
            // differing one: bd refuses a claim by any other actor outright
            // ("issue already claimed by …"), which is how a driver used to
            // wedge on BEAD_LEASE_HELD against its own frontier claim.
            let bd = ctx.config.bd_config();
            let holder = crate::core::lease_identity(&bd, &run.bead_id, &run.run_id).await?;
            failpoint::hit("bd.claim.before");
            forged_beads::claim_specific(&bd, &run.bead_id, &holder).await?;
            failpoint::hit("bd.claim.after");
            Ok(json!({
                "worktree": ctx.config.worktree(&run.run_id).to_string_lossy(),
                "baseSha": prepared.map(|p| p.base_sha),
                "leaseHolder": holder,
            }))
        }
        MachineStage::Gate | MachineStage::ReGate => {
            let artifacts = ctx
                .config
                .run_dir(&run.run_id)
                .join("artifacts")
                .join(format!("{}-{op_id}", step.as_str()));
            let request = GateRequest::new(
                gate_commands.to_vec(),
                ctx.config.worktree(&run.run_id),
                artifacts,
            );
            let outcome = forged_gate::run_gates(&request).await?;
            let phase = if step == MachineStage::ReGate {
                forged_proto::GatePhase::Regate
            } else {
                forged_proto::GatePhase::Gate
            };
            let event = ProtoEvent::Gate {
                phase,
                seq: i64::from(round),
                passed: outcome.passed,
                rows: outcome.rows.clone(),
            };
            record_event(ctx, &run.run_id, event).await?;
            Ok(json!({
                "gates": serde_json::to_value(&outcome.rows)
                    .map_err(|e| Failure::internal(e.to_string()))?,
                "passed": outcome.passed,
            }))
        }
        MachineStage::Push => {
            let worktree = ctx.config.worktree(&run.run_id);
            let expected = rev_parse_head(&worktree).await?;
            failpoint::hit("git.push.before");
            let refspec = format!("{0}:refs/heads/{0}", run.branch);
            let out = tokio::process::Command::new("git")
                .arg("-C")
                .arg(&worktree)
                .args(["push", "origin", &refspec])
                .stdin(std::process::Stdio::null())
                .output()
                .await
                .map_err(|e| Failure::internal(format!("git push: {e}")))?;
            failpoint::hit("git.push.after");
            if !out.status.success() {
                return Err(Failure::internal(format!(
                    "git push origin {refspec}: {}",
                    String::from_utf8_lossy(&out.stderr)
                )));
            }
            Ok(json!({"remoteSha": expected, "branch": run.branch}))
        }
        MachineStage::DraftPr => {
            let slug = repo_slug(std::path::Path::new(&run.repo))
                .await
                .map_err(|e| Failure::internal(e.to_string()))?;
            let title = format!("{}: {}", run.bead_id, run.branch);
            let body = format!(
                "Draft PR opened by forged for run {} (bead {}).",
                run.run_id, run.bead_id
            );
            let gh = GhClient::new();
            failpoint::hit("gh.call.before");
            let pr = gh
                .create_draft_pr(&slug, &run.branch, &run.base_ref, &title, &body)
                .await?;
            failpoint::hit("gh.call.after");
            let event = ProtoEvent::Pr {
                number: pr.number,
                is_draft: pr.is_draft,
                url: pr.url.clone(),
            };
            record_event(ctx, &run.run_id, event).await?;
            Ok(json!({
                "pr": {
                    "number": pr.number,
                    "isDraft": pr.is_draft,
                    "baseRefName": pr.base_ref_name,
                    "headRefName": pr.head_ref_name,
                    "url": pr.url,
                }
            }))
        }
    }
}

async fn record_event(ctx: &Ctx, run_id: &str, event: ProtoEvent) -> Result<(), Failure> {
    let run_id = run_id.to_owned();
    on_ledger(&ctx.ledger, move |l| {
        forged_proto::record(l, &run_id, event).map_err(|e| match e {
            forged_proto::ProtoError::Ledger(inner) => inner,
            other => forged_ledger::LedgerError::Internal {
                message: other.to_string(),
            },
        })
    })
    .await
}

/// Guard against a semantically failing implement looping forever: cap the
/// driver's re-claims per packet.
const SEMANTIC_RECLAIM_CAP: usize = 3;

fn semantic_failures(view: &RunView, packet_id: &str) -> usize {
    view.terminal_attempts
        .get(packet_id)
        .map(|h| {
            h.iter()
                .filter(|t| {
                    t.state == forged_ledger::AttemptState::Failed
                        && forged_proto::classify_failure(t.fail_note.as_deref().unwrap_or(""))
                            == forged_proto::FailureKind::Semantic
                })
                .count()
        })
        .unwrap_or(0)
}

/// One iteration: project → advance → honor. Never waits on someone else's
/// live attempt — it reports instead.
pub async fn run_advance(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let run_id = match param_str(&req.params, "run") {
        Ok(r) => r.to_owned(),
        Err(f) => return err_response(&derive_key("run_advance", None, None, None), &f),
    };
    let ports = ForgedPorts::new(ctx.ledger.clone(), ctx.config.clone());
    let echo = derive_key("run_advance", Some(&run_id), None, None);
    match advance_once(ctx, &ports, &run_id, false).await {
        Ok((action, key)) => ok_response(
            key.as_deref().unwrap_or(&echo),
            false,
            json!({"run_id": run_id, "action": action}),
        ),
        Err(f) => err_response(&echo, &f),
    }
}

async fn advance_once(
    ctx: &Ctx,
    ports: &ForgedPorts,
    run_id: &str,
    wait_allowed: bool,
) -> Result<(Value, Option<String>), Failure> {
    let view = project(ctx, run_id).await?;
    let action = forged_proto::advance(&view);
    let machine_key = match &action {
        NextAction::RunMachine(step) => Some(machine_idempotency_key(
            run_id,
            *step,
            round_of(&view, *step),
        )),
        _ => None,
    };
    honor(ctx, ports, &view, &action, wait_allowed).await?;
    Ok((action_json(&action), machine_key))
}

/// The loop: project → advance → honor → repeat until `Stop`.
pub async fn run_drive(ctx: &Ctx, req: &OperationRequest) -> OperationResponse {
    let echo = derive_key("run_drive", req.run_id.as_deref(), None, None);
    let run_id = match param_str(&req.params, "run") {
        Ok(r) => r.to_owned(),
        Err(f) => return err_response(&echo, &f),
    };
    let ports = ForgedPorts::new(ctx.ledger.clone(), ctx.config.clone());
    loop {
        let view = match project(ctx, &run_id).await {
            Ok(view) => view,
            Err(f) => return err_response(&echo, &f),
        };
        let action = forged_proto::advance(&view);
        if let NextAction::AwaitPacket { packet_id, .. } = &action {
            if semantic_failures(&view, packet_id) >= SEMANTIC_RECLAIM_CAP {
                return err_response(
                    &echo,
                    &Failure::internal(format!(
                        "packet {packet_id} failed semantically {SEMANTIC_RECLAIM_CAP} times; \
                         refusing to loop"
                    )),
                );
            }
        }
        match honor(ctx, &ports, &view, &action, true).await {
            Ok(Honored::Stopped(terminal)) => {
                return ok_response(
                    &echo,
                    false,
                    json!({"run_id": run_id, "terminal": terminal_json(&terminal)}),
                );
            }
            Ok(_) => continue,
            Err(f) => return err_response(&echo, &f),
        }
    }
}

/// Serialize open-packet intents for status payloads.
pub fn intents_json(intents: &[PacketIntent]) -> Value {
    json!(intents
        .iter()
        .map(|intent| json!({
            "stage": intent.execution.as_ref().map(|value| value.stage_id.as_str())
                .unwrap_or_else(|| crate::config::stage_str(intent.stage)),
            "seq": intent.seq,
            "seat": intent.execution.as_ref().map(|value| value.seat_id.as_str()),
        }))
        .collect::<Vec<_>>())
}

#[cfg(test)]
mod adaptive_tests {
    use forged_ledger::AttemptState;
    use forged_proto::TerminalAttempt;

    use super::transport_fallback_index;

    fn failed(note: &str) -> TerminalAttempt {
        TerminalAttempt {
            attempt_id: 1,
            state: AttemptState::Failed,
            outcome: None,
            fail_note: Some(note.to_owned()),
            started_at: "2026-08-12T00:00:00.000000000Z".to_owned(),
        }
    }

    #[test]
    fn only_transport_failures_advance_the_ordered_provider_fallback() {
        assert_eq!(transport_fallback_index(&[], None), 0);
        assert_eq!(
            transport_fallback_index(&[failed("no forged-result block")], None),
            0
        );
        assert_eq!(
            transport_fallback_index(
                &[
                    failed("transport: provider unavailable"),
                    failed("malformed result"),
                    failed("transport: rate limit"),
                ],
                None
            ),
            2
        );
        assert_eq!(
            transport_fallback_index(
                &[failed("transport: provider unavailable")],
                Some("2026-08-12T00:00:00.000000001Z"),
            ),
            0
        );
    }
}
