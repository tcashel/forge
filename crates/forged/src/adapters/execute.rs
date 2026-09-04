//! Packet building and execution: fill a `WorkPacket` from a
//! `PacketIntent`, materialize the packet directory, render the prompt,
//! spawn the provider through a `SessionHost`, await the sentinel, harvest
//! the result, and land or fail it. The section-(d) order is load-bearing.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Duration;

use forged_host::{PreparedSession, ProcessHost, SessionHost};
use forged_ledger::{AttemptRow, AttemptState, EffectClass, RevokeScope, RunRow};
use forged_proto::{LandOutcome, PacketIntent};
use forged_provider::{
    ClaudeDriver, CodexDriver, PacketDirs, PiDriver, PromptStage, PromptTemplates, ProviderDriver,
    ProviderStreamRenderModeV1, ProviderStreamRequestV1,
};
use forged_types::{
    Deliverable, ErrorCode, OperationRequest, Outcome, Stage, StageContract, WorkPacket,
};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::adapters::extract::{harvest_claude, harvest_codex, harvest_pi, Harvest};
use crate::adapters::ports::ForgedPorts;
use crate::config::{now_iso, stage_str, HostPolicy};
use crate::core::spec::{ResolvedSpec, SpecSource};
use crate::core::{on_ledger, session_claimant, Ctx, Failure};
use crate::failpoint;

/// One complete provider-authored planning artifact retained through critique
/// and bounded revision. Only `spec` crosses the work write seam.
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanCandidate {
    pub spec: forged_types::NativeWorkSpecV1,
    pub traceability: forged_types::PlanTraceabilityV1,
}

/// Immutable, orchestrator-materialized evidence for one integrated-assurance
/// round. The provider reads `path`; the typed hashes let the adapter refuse
/// changed evidence or an unbound repository head before rendering.
#[derive(Debug, Clone)]
pub struct AssuranceEvidence {
    /// Read-only bundle containing the frozen root spec, PR identity, complete
    /// diff, exact head SHA, and gate rows for that SHA.
    pub path: PathBuf,
    /// SHA-256 of the evidence file bytes at durable materialization.
    pub sha256: String,
    /// Exact integration HEAD reviewed and gated by this bundle.
    pub head_sha: String,
    /// Deterministic actionable findings synthesized from failed gate rows.
    pub failed_gate_findings: Vec<forged_types::Finding>,
}

/// Everything packet execution needs beyond the packet itself.
pub struct ExecutionContext {
    /// Frozen protocol selected by the run's immutable execution package.
    pub protocol: Option<forged_types::ProtocolRef>,
    /// The draft PR number, once one exists.
    pub pr_number: Option<u64>,
    /// The merged findings of the latest review fan-out (for Fix prompts).
    pub findings: Vec<forged_types::Finding>,
    /// Standing review evidence supplied to an adaptive synthesis seat.
    pub review_evidence: Vec<String>,
    /// Latest complete rolling-plan candidate, when this is `epic-plan/v1`.
    pub plan_candidate: Option<PlanCandidate>,
    /// Exact integrated-assurance evidence, only for `epic-assurance/v1`.
    pub assurance_evidence: Option<AssuranceEvidence>,
    /// Frozen consequence context used to classify review severity.
    pub risk_context: String,
    /// Frozen maximum number of remediation attempts.
    pub fix_round_budget: u8,
    /// The run's remote URL (for Fix prompts).
    pub push_url: String,
    /// Frozen process-host policy for this run.
    pub host_policy: HostPolicy,
    /// Frozen Herdr endpoint for this run.
    pub herdr_socket: Option<std::path::PathBuf>,
    /// Frozen upper bound for each provider termination phase.
    pub termination_grace_s: u64,
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
    /// A claimed attempt was retired before any provider ran, and charged to
    /// the same bounded budget. Distinct from `Transport` because nothing
    /// was transported: no seat spoke, so there is no stage result to read.
    Unspawned(String),
    /// Admission authority moved before spawn; retry immediately under the
    /// current facts without charging transport recovery.
    Readmit(String),
    /// A semantic failure was recorded.
    Semantic(String),
    /// Our own attempt was revoked mid-flight; the provider was stopped.
    Revoked,
}

fn deadline_reason(
    _exec: &ExecutionContext,
    packet: &WorkPacket,
    attempt_id: i64,
    started_at: &str,
    as_of: &str,
) -> Result<Option<String>, Failure> {
    let budget_s = u64::from(packet.contract.budget_s);
    let deadline = forged_proto::stage_deadline_at(started_at, budget_s)
        .map_err(|error| Failure::internal(error.to_string()))?;
    if !forged_proto::stage_deadline_reached(started_at, budget_s, as_of)
        .map_err(|error| Failure::internal(error.to_string()))?
    {
        return Ok(None);
    }
    Ok(Some(format!(
        "transport: stage deadline exceeded: attemptId={attempt_id} stage={} startedAt={} budgetS={} deadlineAt={} asOf={as_of}",
        stage_str(packet.stage),
        started_at,
        budget_s,
        deadline,
    )))
}

async fn settle_deadline_retry(
    ctx: &Ctx,
    run_id: &str,
    packet_id: &str,
    attempt_id: i64,
    note: String,
) -> Result<PacketOutcome, Failure> {
    let current = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
    if current.state == AttemptState::Failed && current.revoke_scope == Some(RevokeScope::Deadline)
    {
        return Ok(PacketOutcome::Transport(note));
    }
    if current.state != AttemptState::Revoking
        || current.revoke_scope != Some(RevokeScope::Deadline)
    {
        return Ok(PacketOutcome::Revoked);
    }
    let since = current.updated_at;
    let started_at = current.started_at;
    let run_id = run_id.to_owned();
    let packet_id = packet_id.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        forged_proto::grant_retry_for_attempt_under_active_policy(
            ledger,
            &run_id,
            &packet_id,
            attempt_id,
            &since,
            &started_at,
        )
        .map_err(|error| forged_ledger::LedgerError::Internal {
            message: error.to_string(),
        })
    })
    .await?;
    on_ledger(&ctx.ledger, move |ledger| ledger.mark_timed_out(attempt_id)).await?;
    Ok(PacketOutcome::Transport(note))
}

async fn deadline_marker(ctx: &Ctx, attempt_id: i64, note: &str) -> Result<AttemptRow, Failure> {
    let marker_note = note.to_owned();
    let marked = on_ledger(&ctx.ledger, move |ledger| {
        ledger.revoke_attempt_scoped(attempt_id, &marker_note, RevokeScope::Deadline)
    })
    .await;
    if let Err(error) = marked {
        if error.code != ErrorCode::InvalidRequest {
            return Err(error);
        }
    }
    on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await
}

/// Settle the adoption crash window before it can create a provider effect.
async fn settle_pre_spawn_deadline(
    ctx: &Ctx,
    exec: &ExecutionContext,
    packet: &WorkPacket,
    attempt_id: i64,
) -> Result<Option<PacketOutcome>, Failure> {
    let attempt = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
    let as_of = now_iso();
    let Some(note) = deadline_reason(exec, packet, attempt_id, &attempt.started_at, &as_of)? else {
        return Ok(None);
    };
    settle_known_pre_spawn_deadline(ctx, packet, attempt_id, note, "deadline-before-spawn")
        .await
        .map(Some)
}

async fn settle_known_pre_spawn_deadline(
    ctx: &Ctx,
    packet: &WorkPacket,
    attempt_id: i64,
    note: String,
    phase: &str,
) -> Result<PacketOutcome, Failure> {
    let marker = deadline_marker(ctx, attempt_id, &note).await?;
    if marker.state != AttemptState::Revoking || marker.revoke_scope != Some(RevokeScope::Deadline)
    {
        return if marker.state == AttemptState::Failed
            && marker.revoke_scope == Some(RevokeScope::Deadline)
        {
            Ok(PacketOutcome::Transport(note))
        } else {
            Ok(PacketOutcome::Revoked)
        };
    }
    preserve_pre_spawn_failure(ctx, packet, attempt_id, &note, phase).await?;
    settle_deadline_retry(ctx, &packet.run_id, &packet.packet_id, attempt_id, note).await
}

async fn settle_prepared_deadline(
    ctx: &Ctx,
    host: &Arc<dyn SessionHost>,
    prepared: PreparedSession,
    packet: &WorkPacket,
    attempt_id: i64,
    note: String,
) -> Result<PacketOutcome, Failure> {
    host.rollback_prepared(prepared).await;
    let marker = deadline_marker(ctx, attempt_id, &note).await?;
    if marker.state != AttemptState::Revoking || marker.revoke_scope != Some(RevokeScope::Deadline)
    {
        return if marker.state == AttemptState::Failed
            && marker.revoke_scope == Some(RevokeScope::Deadline)
        {
            Ok(PacketOutcome::Transport(note))
        } else {
            Ok(PacketOutcome::Revoked)
        };
    }
    preserve_pre_spawn_failure(ctx, packet, attempt_id, &note, "deadline-before-start").await?;
    settle_deadline_retry(ctx, &packet.run_id, &packet.packet_id, attempt_id, note).await
}

async fn settle_started_deadline(
    ctx: &Ctx,
    host: &Arc<dyn SessionHost>,
    session: &forged_host::HostSessionId,
    packet: &WorkPacket,
    attempt_id: i64,
    session_evidence: &Value,
    note: String,
) -> Result<PacketOutcome, Failure> {
    let (run_id, stage, seq) = crate::core::split_packet_key(&packet.packet_id)?;
    let run_root = ctx.config.run_dir(&run_id);
    let packet_dir = ctx.config.packet_dir_key(&run_id, &stage, seq);
    let dirs = PacketDirs::new(&packet_dir, attempt_id);
    let marker = deadline_marker(ctx, attempt_id, &note).await?;
    host.kill_confirmed(session)
        .await
        .map_err(|error| Failure {
            code: ErrorCode::HostUnavailable,
            message: format!(
                "stage deadline expired but provider death was not confirmed: {error}"
            ),
            recoverable: true,
        })?;
    crate::core::artifacts::finalize_provider_files(&run_root, &dirs)?;
    let out = crate::core::artifacts::read_output_text(&run_root, &dirs)?;
    crate::core::usage::capture_attempt(
        ctx,
        &packet.run_id,
        &packet.packet_id,
        Some(attempt_id),
        &packet.provider_hints.provider,
        &packet.provider_hints.model,
        &out,
    )
    .await;
    if marker.state != AttemptState::Revoking || marker.revoke_scope != Some(RevokeScope::Deadline)
    {
        if marker.state == AttemptState::Failed
            && marker.revoke_scope == Some(RevokeScope::Deadline)
        {
            return Ok(PacketOutcome::Transport(note));
        }
        crate::core::artifacts::materialize_and_join(
            ctx,
            packet,
            attempt_id,
            "revoked",
            &json!({"note": "attempt was revoked while its deadline expired"}),
            session_evidence,
        )
        .await?;
        return Ok(PacketOutcome::Revoked);
    }
    crate::core::artifacts::materialize_and_join(
        ctx,
        packet,
        attempt_id,
        "deadline",
        &json!({"reason": &note}),
        session_evidence,
    )
    .await?;
    settle_deadline_retry(ctx, &packet.run_id, &packet.packet_id, attempt_id, note).await
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

/// The semantic (stage key, round) a packet is filed under — the packet
/// directory's coordinates, and the same pair `run_attempt` derives.
pub(crate) fn packet_keys(packet: &WorkPacket) -> Result<(String, i64), Failure> {
    match &packet.execution {
        Some(execution) => Ok((execution.stage_id.clone(), i64::from(execution.round))),
        None => {
            let (_, stage, seq) = crate::core::split_packet_id(&packet.packet_id)?;
            Ok((stage_str(stage).to_owned(), seq))
        }
    }
}

/// The line a relaunched attempt reads about the work its packet already
/// holds: the last settled attempt of the same packet and the commits the
/// worktree carries ahead of the base ref. `None` for a packet's first
/// attempt on a clean tree, so the first prompt is byte-identical to today.
async fn relaunch_note(
    ctx: &Ctx,
    run_id: &str,
    packet: &WorkPacket,
) -> Result<Option<String>, Failure> {
    let prior = {
        let run_id = run_id.to_owned();
        let packet_id = packet.packet_id.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            let mut prior: Vec<i64> = Vec::new();
            for state in [
                AttemptState::Completed,
                AttemptState::Failed,
                AttemptState::Reclaimed,
            ] {
                prior.extend(
                    ledger
                        .list_attempts_in_state(Some(&run_id), state)?
                        .into_iter()
                        .filter(|attempt| attempt.packet_id == packet_id)
                        .map(|attempt| attempt.attempt_id),
                );
            }
            Ok(prior.into_iter().max())
        })
        .await?
    };
    let (commits_ahead, shas) =
        match super::ports::worktree_commits_ahead(&packet.worktree, &packet.base_ref).await {
            Ok(value) => value,
            // A worktree that does not exist yet has nothing to report.
            Err(_) => (0, Vec::new()),
        };
    match (prior, commits_ahead) {
        (None, 0) => Ok(None),
        (prior, commits_ahead) => {
            let attempt = prior.map_or_else(
                || "A prior attempt".to_owned(),
                |id| format!("Attempt {id} of this packet"),
            );
            let commits = if commits_ahead == 0 {
                "no commits".to_owned()
            } else {
                format!(
                    "{commits_ahead} commit(s) ({}) ahead of {}",
                    shas.join(", "),
                    packet.base_ref
                )
            };
            Ok(Some(format!(
                "{attempt} already ran here; the worktree carries {commits}. Continue \
                 from the committed state: do not redo, re-baseline, or re-verify it."
            )))
        }
    }
}

/// Fill every `WorkPacket` field the intent does not carry.
///
/// A work-sourced packet reads its spec from the packet directory, where
/// `run_attempt` materializes the rendered body; a file-sourced one keeps
/// pointing at the operator's file.
#[allow(clippy::too_many_arguments)]
pub fn build_packet(
    ctx: &Ctx,
    run: &RunRow,
    intent: &PacketIntent,
    source: &SpecSource,
    spec: &ResolvedSpec,
    gate_commands: &[String],
    seat_commands: &[String],
    seat_env: &std::collections::BTreeMap<String, String>,
    budget_s: u64,
    protocol: Option<&forged_types::ProtocolRef>,
) -> Result<WorkPacket, Failure> {
    let stage = intent.stage;
    let planning = protocol.is_some_and(|value| value.name == "epic-plan" && value.version == 1);
    let assurance =
        protocol.is_some_and(|value| value.name == "epic-assurance" && value.version == 1);
    let prompt_stage = if planning {
        match intent.execution.as_ref().map(|value| value.purpose) {
            Some(forged_types::SeatPurpose::Implement) => PromptStage::EpicPlan,
            Some(forged_types::SeatPurpose::Review | forged_types::SeatPurpose::Synthesis) => {
                PromptStage::EpicPlanReview
            }
            Some(forged_types::SeatPurpose::Fix) => PromptStage::EpicPlanRevision,
            None => PromptStage::for_stage(stage),
        }
    } else if assurance {
        match intent.execution.as_ref().map(|value| value.purpose) {
            Some(forged_types::SeatPurpose::Review | forged_types::SeatPurpose::Synthesis) => {
                PromptStage::EpicAssuranceReview
            }
            Some(forged_types::SeatPurpose::Fix) => PromptStage::EpicAssuranceFix,
            _ => {
                return Err(Failure::internal(
                    "epic-assurance/v1 cannot build an implement or legacy packet",
                ))
            }
        }
    } else {
        PromptStage::for_stage(stage)
    };
    let packet_id = intent
        .packet_id
        .clone()
        .unwrap_or_else(|| format!("{}/{}/{}", run.run_id, stage_str(stage), intent.seq));
    let deliverable = if planning && matches!(stage, Stage::Implement | Stage::Fix) {
        Deliverable::NativeWorkSpec
    } else if assurance {
        match prompt_stage {
            PromptStage::EpicAssuranceReview => Deliverable::ReviewBlock,
            PromptStage::EpicAssuranceFix => Deliverable::FixCommitsPushed,
            _ => unreachable!("assurance packet has an assurance prompt"),
        }
    } else {
        match stage {
            Stage::Implement => Deliverable::CommitsInWorktree,
            Stage::ReviewClaude | Stage::ReviewCodex => Deliverable::ReviewBlock,
            Stage::Fix => Deliverable::FixCommitsPushed,
        }
    };
    let instructions = if planning {
        match prompt_stage {
            PromptStage::EpicPlan => "author one complete native work specification",
            PromptStage::EpicPlanReview => "critique the exact native specification candidate",
            PromptStage::EpicPlanRevision => "revise the exact candidate from bounded critique",
            _ => unreachable!("planning packet has a planning prompt"),
        }
    } else if assurance {
        match prompt_stage {
            PromptStage::EpicAssuranceReview => {
                "review the exact materialized integrated-assurance evidence"
            }
            PromptStage::EpicAssuranceFix => {
                "remediate blocker, high, and failed-gate evidence on the integration branch"
            }
            _ => unreachable!("assurance packet has an assurance prompt"),
        }
    } else {
        match stage {
            Stage::Implement => "implement the spec in the worktree and report honestly",
            Stage::ReviewClaude | Stage::ReviewCodex => {
                "review the diff against the spec and report a verdict"
            }
            Stage::Fix => "address the merged review findings and push the fixes",
        }
    };
    let mut packet = WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id,
        run_id: run.run_id.clone(),
        work_id: run.work_id.clone(),
        stage,
        execution: intent.execution.clone(),
        lane_seq: intent.execution.as_ref().map(|_| intent.seq),
        spec: forged_types::SpecRef {
            path: String::new(),
            sha256: spec.sha256.clone(),
            revision: spec.revision(),
        },
        worktree: ctx.config.worktree(&run.run_id),
        branch: run.branch.clone(),
        base_ref: run.base_ref.clone(),
        contract: StageContract {
            instructions: instructions.to_owned(),
            gate_commands: if planning {
                Vec::new()
            } else {
                gate_commands.to_vec()
            },
            deliverable,
            budget_s: u32::try_from(budget_s).unwrap_or(u32::MAX),
            seat_commands: if planning {
                Vec::new()
            } else {
                seat_commands.to_vec()
            },
        },
        result_schema: prompt_stage.result_schema().to_owned(),
        provider_hints: {
            let mut hints = intent.hints.clone();
            hints.env = seat_env.clone();
            hints
        },
        field_notes: spec.work_context.clone(),
    };
    packet.spec.path = match source {
        SpecSource::File(path) => path.clone(),
        SpecSource::Work(_) => {
            let (stage_key, seq) = packet_keys(&packet)?;
            ctx.config
                .packet_dir_key(&run.run_id, &stage_key, seq)
                .join(crate::core::spec::WORK_SPEC_FILE)
                .to_string_lossy()
                .into_owned()
        }
    };
    Ok(packet)
}

/// Open a packet through the fence (`packet_open`, SafeRetry, ledger-local).
///
/// THE FIRST OPEN IS AN OPERATION AND A RE-PIN IS NOT ([`repin_packet`]),
/// and the two differ because of what each one is. This is the packet's
/// CREATION: it runs inside the advance that opens a whole stage's packets
/// together, and replaying its stored response after a crash is exactly
/// right, because the row it would create already exists. A re-pin is a pure
/// row update whose result must CHANGE when the work does — fence that on a
/// key and the key has to carry the world's state, and a content address is
/// not injective over time (a work edited A -> B -> A mints the key A
/// already stored, and the replay writes nothing). The ledger's own
/// `Immediate` transaction is the re-pin's fence instead: atomic, re-read
/// every time, with no memory of an earlier call to replay.
///
/// So the key is (run, stage, seq) — the packet's identity, and nothing
/// about its spec.
pub async fn open_packet_op(
    ctx: &Ctx,
    packet: &WorkPacket,
    policy_revision: Option<u32>,
) -> Result<(), Failure> {
    let body_json = packet
        .stored_body()
        .map_err(|e| Failure::internal(format!("cannot serialize packet: {e}")))?;
    let run_id = packet.run_id.clone();
    let target = open_target(packet, body_json, policy_revision)?;
    let key = crate::core::derive_key(
        "packet_open",
        Some(&run_id),
        Some(&target.stage_key),
        Some(target.logical_seq),
    );
    let req = OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(run_id.clone()),
        params: match json!({
            "stage": target.stage_key,
            "seq": target.logical_seq,
        }) {
            Value::Object(map) => map,
            _ => unreachable!("literal is an object"),
        },
    };
    let OpenTarget {
        new_packet,
        semantic_id,
        ..
    } = target;
    let resp = crate::core::fenced(ctx, "packet_open", EffectClass::SafeRetry, &req, None, {
        let ledger = ctx.ledger.clone();
        move |_op_id| async move {
            let packet_id =
                tokio::task::spawn_blocking(move || apply_open(&ledger, new_packet, semantic_id))
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

/// The ledger write one packet open performs, plus the key segments the
/// operation envelope derives from the same packet.
///
/// Shared by the fenced first open and the direct re-pin so both write the
/// identical row: a re-pin that built its row differently would be a second
/// definition of the packet.
struct OpenTarget {
    stage_key: String,
    logical_seq: i64,
    new_packet: forged_ledger::NewPacket,
    /// Present only for a semantic packet, whose id the caller assigns.
    semantic_id: Option<String>,
}

fn open_target(
    packet: &WorkPacket,
    body_json: String,
    policy_revision: Option<u32>,
) -> Result<OpenTarget, Failure> {
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
    Ok(OpenTarget {
        stage_key,
        logical_seq,
        new_packet: forged_ledger::NewPacket {
            run_id: packet.run_id.clone(),
            stage: packet.stage,
            seq: lane_seq,
            spec_path: packet.spec.path.clone(),
            spec_sha256: packet.spec.sha256.clone(),
            spec_revision: packet.spec.revision.clone(),
            policy_revision,
            body_json,
        },
        semantic_id: packet.execution.as_ref().map(|_| packet.packet_id.clone()),
    })
}

/// The one ledger call every packet open makes.
fn apply_open(
    ledger: &forged_ledger::Ledger,
    new_packet: forged_ledger::NewPacket,
    semantic_id: Option<String>,
) -> Result<String, forged_ledger::LedgerError> {
    match semantic_id {
        Some(packet_id) => ledger.open_packet_with_id(new_packet, packet_id),
        None => ledger.open_packet(new_packet),
    }
}

/// Build the render context for a stage — top-level keys exactly
/// `PromptStage::variables()`.
fn prompt_stage_of(
    packet: &WorkPacket,
    protocol: Option<&forged_types::ProtocolRef>,
) -> Result<PromptStage, Failure> {
    let planning = protocol.is_some_and(|value| value.name == "epic-plan" && value.version == 1);
    if planning {
        return Ok(match packet.execution.as_ref().map(|value| value.purpose) {
            Some(forged_types::SeatPurpose::Implement) => PromptStage::EpicPlan,
            Some(forged_types::SeatPurpose::Review | forged_types::SeatPurpose::Synthesis) => {
                PromptStage::EpicPlanReview
            }
            Some(forged_types::SeatPurpose::Fix) => PromptStage::EpicPlanRevision,
            None => PromptStage::for_stage(packet.stage),
        });
    }
    let assurance =
        protocol.is_some_and(|value| value.name == "epic-assurance" && value.version == 1);
    if assurance {
        return match packet.execution.as_ref().map(|value| value.purpose) {
            Some(forged_types::SeatPurpose::Review | forged_types::SeatPurpose::Synthesis) => {
                Ok(PromptStage::EpicAssuranceReview)
            }
            Some(forged_types::SeatPurpose::Fix) => Ok(PromptStage::EpicAssuranceFix),
            _ => Err(Failure::internal(
                "epic-assurance/v1 packet has an implement or legacy purpose",
            )),
        };
    }
    Ok(PromptStage::for_stage(packet.stage))
}

fn assurance_evidence(exec: &ExecutionContext) -> Result<&AssuranceEvidence, Failure> {
    let evidence = exec
        .assurance_evidence
        .as_ref()
        .ok_or_else(|| Failure::internal("epic-assurance/v1 packet has no frozen evidence"))?;
    if exec.pr_number.is_none_or(|number| number == 0) {
        return Err(Failure::internal(
            "epic-assurance/v1 evidence has no draft PR number",
        ));
    }
    if evidence.head_sha.trim().is_empty() {
        return Err(Failure::internal(
            "epic-assurance/v1 evidence has no exact head SHA",
        ));
    }
    let metadata = std::fs::metadata(&evidence.path).map_err(|error| {
        Failure::invalid(format!(
            "cannot inspect assurance evidence {}: {error}",
            evidence.path.display()
        ))
    })?;
    if !metadata.permissions().readonly() {
        return Err(Failure::invalid(format!(
            "epic-assurance/v1 evidence is not read-only: {}",
            evidence.path.display()
        )));
    }
    let actual = sha256_file(&evidence.path)?;
    if actual != evidence.sha256 {
        return Err(Failure::invalid(format!(
            "epic-assurance/v1 evidence digest changed: expected {}, got {actual}",
            evidence.sha256
        )));
    }
    if evidence.failed_gate_findings.iter().any(|finding| {
        !matches!(
            finding.severity,
            forged_types::Severity::Blocker | forged_types::Severity::High
        ) || finding.message.trim().is_empty()
            || !finding
                .file
                .as_deref()
                .is_some_and(|location| location.trim().starts_with("gate:"))
    }) {
        return Err(Failure::internal(
            "epic-assurance/v1 failed gate findings must be blocker/high with a gate: location and actionable message",
        ));
    }
    Ok(evidence)
}

fn assurance_fix_findings(exec: &ExecutionContext) -> Vec<forged_types::Finding> {
    let mut findings = exec.findings.clone();
    if let Some(evidence) = &exec.assurance_evidence {
        findings.extend(evidence.failed_gate_findings.iter().cloned());
    }
    findings.sort_by(|left, right| {
        let severity = |value| match value {
            forged_types::Severity::Blocker => 0,
            forged_types::Severity::High => 1,
            forged_types::Severity::Medium => 2,
            forged_types::Severity::Low => 3,
        };
        severity(left.severity)
            .cmp(&severity(right.severity))
            .then_with(|| left.file.cmp(&right.file))
            .then_with(|| left.line.cmp(&right.line))
            .then_with(|| left.message.cmp(&right.message))
    });
    findings.dedup_by(|left, right| {
        left.severity == right.severity
            && left.file == right.file
            && left.line == right.line
            && left.message == right.message
    });
    findings
}

fn assurance_is_synthesis(packet: &WorkPacket) -> bool {
    packet
        .execution
        .as_ref()
        .is_some_and(|value| value.purpose == forged_types::SeatPurpose::Synthesis)
}

fn assurance_review_context(
    exec: &ExecutionContext,
    packet: &WorkPacket,
) -> Result<Value, Failure> {
    let evidence = assurance_evidence(exec)?;
    let is_synthesis = assurance_is_synthesis(packet);
    Ok(json!({
        "bead_id": packet.work_id,
        "pr_number": exec.pr_number.unwrap_or(0),
        "evidence_path": evidence.path.to_string_lossy(),
        "head_sha": evidence.head_sha,
        "review_evidence": if is_synthesis {
            exec.review_evidence.clone()
        } else {
            Vec::new()
        },
        "risk_context": exec.risk_context,
        "is_synthesis": is_synthesis,
        "packet_id": packet.packet_id,
        "result_schema": packet.result_schema,
    }))
}

fn assurance_fix_context(
    exec: &ExecutionContext,
    packet: &WorkPacket,
    fix_round: i64,
) -> Result<Value, Failure> {
    let evidence = assurance_evidence(exec)?;
    Ok(json!({
        "bead_id": packet.work_id,
        "pr_number": exec.pr_number.unwrap_or(0),
        "worktree": packet.worktree.to_string_lossy(),
        "branch": packet.branch,
        "round": fix_round + 1,
        "total_rounds": i64::from(exec.fix_round_budget),
        "gate_commands": packet.contract.gate_commands,
        "push_url": exec.push_url,
        "evidence_path": evidence.path.to_string_lossy(),
        "reviewed_head_sha": evidence.head_sha,
        "findings": forged_provider::normalize_findings(&assurance_fix_findings(exec)),
        "field_notes": packet.field_notes,
        "packet_id": packet.packet_id,
        "result_schema": packet.result_schema,
    }))
}

fn render_context(
    exec: &ExecutionContext,
    packet: &WorkPacket,
    fix_round: i64,
) -> Result<Value, Failure> {
    let worktree = packet.worktree.to_string_lossy().into_owned();
    let stage = prompt_stage_of(packet, exec.protocol.as_ref())?;
    let value = match stage {
        PromptStage::Implement => json!({
            "bead_id": packet.work_id,
            "worktree": worktree,
            "branch": packet.branch,
            "base_ref": format!("origin/{}", packet.base_ref),
            "spec_path": packet.spec.path,
            "gate_commands": packet.contract.gate_commands,
            "seat_commands": packet.contract.seat_commands,
            "field_notes": packet.field_notes,
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::Review => json!({
            "bead_id": packet.work_id,
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
            "risk_context": exec.risk_context,
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::Fix => json!({
            "bead_id": packet.work_id,
            "pr_number": exec.pr_number.unwrap_or(0),
            "worktree": worktree,
            "round": if packet.execution.is_some() { fix_round + 1 } else { fix_round },
            "total_rounds": if packet.execution.is_some() {
                i64::from(exec.fix_round_budget)
            } else {
                1
            },
            "gate_commands": packet.contract.gate_commands,
            "seat_commands": packet.contract.seat_commands,
            "push_url": exec.push_url,
            "findings": forged_provider::normalize_findings(&exec.findings),
            "field_notes": packet.field_notes,
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::EpicPlan => json!({
            "bead_id": packet.work_id,
            "spec_path": packet.spec.path,
            "field_notes": packet.field_notes,
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::EpicPlanReview => json!({
            "bead_id": packet.work_id,
            "spec_path": packet.spec.path,
            "candidate_plan": serde_json::to_string(&exec.plan_candidate).unwrap_or_default(),
            "review_evidence": if packet.execution.as_ref().is_some_and(|value|
                value.purpose == forged_types::SeatPurpose::Synthesis
            ) {
                exec.review_evidence.clone()
            } else {
                Vec::new()
            },
            "risk_context": exec.risk_context,
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::EpicPlanRevision => json!({
            "bead_id": packet.work_id,
            "spec_path": packet.spec.path,
            "candidate_plan": serde_json::to_string(&exec.plan_candidate).unwrap_or_default(),
            "findings": forged_provider::normalize_findings(&exec.findings),
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::EpicAssuranceReview => return assurance_review_context(exec, packet),
        PromptStage::EpicAssuranceFix => return assurance_fix_context(exec, packet, fix_round),
    };
    Ok(value)
}

fn driver_for(provider: &str) -> Result<Box<dyn ProviderDriver>, Failure> {
    match provider {
        "claude" => Ok(Box::new(ClaudeDriver)),
        "codex" => Ok(Box::new(CodexDriver)),
        "pi" => Ok(Box::new(PiDriver)),
        other => Err(Failure::invalid(format!(
            "unknown provider {other:?} in packet hints"
        ))),
    }
}

enum PidObservation {
    Ready(u32),
    Deadline(String),
    Missing,
}

enum ProviderIdentityObservation {
    Ready(String),
    Deadline(String),
    Missing,
}

/// Poll `<attempt_dir>/provider.pid` until the spawned shell writes it, the
/// bounded identity window closes, or the attempt's earlier stage deadline
/// wins. A pid observed at the exact deadline is late.
async fn await_pid(
    attempt_dir: &Path,
    exec: &ExecutionContext,
    packet: &WorkPacket,
    attempt_id: i64,
    started_at: &str,
) -> Result<PidObservation, Failure> {
    let budget_s = u64::from(packet.contract.budget_s);
    let deadline: jiff::Timestamp = forged_proto::stage_deadline_at(started_at, budget_s)
        .map_err(|error| Failure::internal(error.to_string()))?
        .parse()
        .map_err(|error| Failure::internal(format!("invalid stage deadline: {error}")))?;
    for _ in 0..50 {
        let as_of = now_iso();
        if let Some(note) = deadline_reason(exec, packet, attempt_id, started_at, &as_of)? {
            return Ok(PidObservation::Deadline(note));
        }
        if let Ok(text) = std::fs::read_to_string(attempt_dir.join("provider.pid")) {
            if let Ok(pid) = text.trim().parse::<u32>() {
                let as_of = now_iso();
                return Ok(
                    match deadline_reason(exec, packet, attempt_id, started_at, &as_of)? {
                        Some(note) => PidObservation::Deadline(note),
                        None => PidObservation::Ready(pid),
                    },
                );
            }
        }
        let now: jiff::Timestamp = as_of
            .parse()
            .map_err(|error| Failure::internal(format!("invalid current timestamp: {error}")))?;
        let remaining_ns = deadline.as_nanosecond() - now.as_nanosecond();
        let remaining_ns = u64::try_from(remaining_ns)
            .map_err(|_| Failure::internal("stage deadline duration does not fit u64"))?;
        tokio::time::sleep(Duration::from_nanos(remaining_ns).min(Duration::from_millis(100)))
            .await;
    }
    let as_of = now_iso();
    Ok(
        match deadline_reason(exec, packet, attempt_id, started_at, &as_of)? {
            Some(note) => PidObservation::Deadline(note),
            None => PidObservation::Missing,
        },
    )
}

/// A provider pid is not safely recoverable cross-process until its start
/// stamp is durable. `ps` can briefly miss a just-spawned process under host
/// load, so use the same bounded identity window as detached controllers.
async fn await_provider_lstart<F, Fut>(
    pid: u32,
    exec: &ExecutionContext,
    packet: &WorkPacket,
    attempt_id: i64,
    started_at: &str,
    lstart_of: F,
) -> Result<ProviderIdentityObservation, Failure>
where
    F: Fn(i32) -> Fut,
    Fut: std::future::Future<Output = Option<String>>,
{
    let Ok(pid) = i32::try_from(pid) else {
        return Ok(ProviderIdentityObservation::Missing);
    };
    let budget_s = u64::from(packet.contract.budget_s);
    let deadline: jiff::Timestamp = forged_proto::stage_deadline_at(started_at, budget_s)
        .map_err(|error| Failure::internal(error.to_string()))?
        .parse()
        .map_err(|error| Failure::internal(format!("invalid stage deadline: {error}")))?;
    for _ in 0..20 {
        let as_of = now_iso();
        if let Some(note) = deadline_reason(exec, packet, attempt_id, started_at, &as_of)? {
            return Ok(ProviderIdentityObservation::Deadline(note));
        }
        let now: jiff::Timestamp = as_of
            .parse()
            .map_err(|error| Failure::internal(format!("invalid current timestamp: {error}")))?;
        let remaining_ns = deadline.as_nanosecond() - now.as_nanosecond();
        let remaining_ns = u64::try_from(remaining_ns)
            .map_err(|_| Failure::internal("stage deadline duration does not fit u64"))?;
        if let Ok(Some(lstart)) =
            tokio::time::timeout(Duration::from_nanos(remaining_ns), lstart_of(pid)).await
        {
            let as_of = now_iso();
            return Ok(
                match deadline_reason(exec, packet, attempt_id, started_at, &as_of)? {
                    Some(note) => ProviderIdentityObservation::Deadline(note),
                    None => ProviderIdentityObservation::Ready(lstart),
                },
            );
        }
        let as_of = now_iso();
        if let Some(note) = deadline_reason(exec, packet, attempt_id, started_at, &as_of)? {
            return Ok(ProviderIdentityObservation::Deadline(note));
        }
        let now: jiff::Timestamp = as_of
            .parse()
            .map_err(|error| Failure::internal(format!("invalid current timestamp: {error}")))?;
        let remaining_ns = deadline.as_nanosecond() - now.as_nanosecond();
        let remaining_ns = u64::try_from(remaining_ns)
            .map_err(|_| Failure::internal("stage deadline duration does not fit u64"))?;
        tokio::time::sleep(Duration::from_nanos(remaining_ns).min(Duration::from_millis(50))).await;
    }
    let as_of = now_iso();
    Ok(
        match deadline_reason(exec, packet, attempt_id, started_at, &as_of)? {
            Some(note) => ProviderIdentityObservation::Deadline(note),
            None => ProviderIdentityObservation::Missing,
        },
    )
}

/// Execute one open packet end to end: re-pin, claim, render, spawn, await,
/// harvest, land or fail. Follows the section-(d) order exactly.
///
/// This is the claim-again path — the only caller is `honor_await` with the
/// packet open and no live attempt — so it is also the one home for
/// everything that can go wrong BEFORE an attempt row exists.
pub async fn execute_packet(
    ctx: &Ctx,
    ports: &ForgedPorts,
    exec: &ExecutionContext,
    packet: &WorkPacket,
) -> Result<PacketOutcome, Failure> {
    let packet_id = packet.packet_id.clone();
    // Keep reservation creation and attempt ownership transfer under one
    // cross-process singleton. Without this, a concurrent claimant could
    // mistake our newly committed ownerless reservation for crash debris.
    let admission_guard =
        crate::core::handoff::acquire_packet_submit(ctx, &packet.packet_id, &packet.run_id).await?;

    // Admission precedes every provider-facing read or spawn. A deferred
    // packet has no attempt row and therefore cannot masquerade as active.
    let admission = crate::core::admission::admit_packet(ctx, packet).await?;
    if admission.decision.outcome != forged_types::AdmissionOutcome::Admitted {
        return Err(Failure {
            code: ErrorCode::OperationInProgress,
            message: format!(
                "packet {packet_id} deferred by admission: {}",
                crate::core::admission::decision_reason(&admission.decision)
            ),
            recoverable: true,
        });
    }
    let mut admitted_hints = admission
        .packet_provider_hints
        .clone()
        .ok_or_else(|| Failure::internal("packet admission omitted provider launch facts"))?;
    // Admission decides the launch facts (provider, model, sandbox); the
    // operator's seat environment is frozen in the packet and rides along.
    admitted_hints.env = packet.provider_hints.env.clone();
    let reservation_id = admission
        .reservation
        .ok_or_else(|| Failure::internal("admitted packet has no capacity reservation"))?
        .reservation_id;
    let mut admitted_packet = packet.clone();
    admitted_packet.provider_hints = admitted_hints;
    let packet = &admitted_packet;

    // ONE spec read for this claim: it answers both the fence the ledger
    // compares and the bytes the seat will read, so the seat can never work
    // from a body the claim did not fence.
    //
    // A failure here is PRE-CLAIM: there is no attempt row and no claim
    // token to fail one under, so a transport failure is charged to the
    // packet's bounded budget through its grant alone. Untracked, an
    // unreachable bd would refuse here for free, forever.
    let spec = match crate::core::spec::resolve_for_packet(ctx, &packet.spec, &packet.work_id).await
    {
        Ok(spec) => spec,
        Err(failure) if failure.recoverable => {
            let note = format!("transport: the claim could not read the spec: {failure}");
            return grant_pre_claim_retry(ctx, &packet_id, note).await;
        }
        Err(failure) => return Err(failure),
    };

    // RE-PIN BEFORE THE CLAIM. The claim fences on the rendered body, so a
    // work edited under an already-open packet refuses `SpecDrift` — and
    // nothing else on this path re-opens the packet, so the run would retry
    // the identical refusal until a human intervened.
    let packet = &repin_packet(ctx, packet, &spec).await?;

    // Claim under the PER-ATTEMPT session identity (the work lease stays the
    // run's, held by the driver): the ledger re-checks the stored fence
    // against what the caller just observed — the caller re-reads, the
    // ledger does no file or process IO.
    let fence = spec.fence.clone();
    let claimed = {
        let packet_id = packet_id.clone();
        let claimant = session_claimant(&packet_id, &packet.provider_hints.provider);
        on_ledger(&ctx.ledger, move |l| {
            l.claim_packet_with_admission(&packet_id, &claimant, &fence, &reservation_id)
        })
        .await?
    };
    failpoint::hit("admission.reservation.transfer.after");
    drop(admission_guard);
    run_attempt(
        ctx,
        ports,
        exec,
        packet,
        &spec,
        claimed.attempt_id,
        &claimed.claim_token,
    )
    .await
}

/// Re-pin an open packet to the spec just resolved, returning the packet the
/// claim should fence on.
///
/// WORK-SOURCED PACKETS ONLY. A file-sourced spec is fenced by the hash of a
/// file the operator owns, and nothing moves that file but an operator edit:
/// `claim_packet` refusing `SpecDrift` on it IS the fence doing its job.
/// Re-pinning here would adopt the edit silently, and nothing downstream
/// would catch it — `assert_pinned` returns early for a file spec. The gate
/// is the same one `resolve_for_packet` branches on.
///
/// Otherwise a no-op unless the rendered body moved: the claim itself
/// re-pins a moved REVISION over an unchanged body.
///
/// NOT AN OPERATION. A re-pin writes three spec columns and nothing else —
/// no bd call, no GitHub call, no spawn — so there is no external effect to
/// deduplicate, and the operation layer exists for external effects. Its
/// result must also change whenever the work does, which is precisely what
/// a fence keyed on an idempotency key refuses to do: encode the spec in the
/// key and a work edited A -> B -> A reproduces the key its first open at A
/// already stored, replaying that response over a row still pinned at B.
/// `Ledger::repin_packet_spec`'s own `Immediate` transaction is the right
/// fence and the only one needed — atomic, re-reading current state on every
/// call, and its refusal on a live attempt still stands.
///
/// Nothing is read back out to write it in again. The definition never
/// becomes a parameter, so this cannot move it and there is no window
/// between checking it and writing — which also means the caller's packet
/// may legitimately differ from the stored definition, as it does whenever
/// `stored_packet_for_attempt` rebinds provider hints to the active roster
/// revision.
async fn repin_packet(
    ctx: &Ctx,
    packet: &WorkPacket,
    spec: &ResolvedSpec,
) -> Result<WorkPacket, Failure> {
    let mut repinned = packet.clone();
    repinned.spec = repin_spec_ref(ctx, &packet.packet_id, &packet.spec, spec).await?;
    Ok(repinned)
}

/// The re-pin, over the spec ref alone.
///
/// `claim_next` resumes an open packet without ever building a `WorkPacket`,
/// and it needs this same transition: a work edited under an open packet
/// leaves the row pinned to bytes nobody can reach, and a claim against the
/// current body is refused as drift until something re-pins. Two claim paths
/// that disagree about that is how the ledger-first resume ended up unable to
/// recover a spec edit at all, so both call THIS, not a copy of it.
///
/// A file-sourced packet (no revision) and an unchanged body are both no-ops:
/// the deprecated route keeps its own hash fence, and re-pinning to what is
/// already stored would be a write with nothing to write.
pub(crate) async fn repin_spec_ref(
    ctx: &Ctx,
    packet_id: &str,
    pinned: &forged_types::SpecRef,
    spec: &ResolvedSpec,
) -> Result<forged_types::SpecRef, Failure> {
    if pinned.revision.is_none() || spec.sha256 == pinned.sha256 {
        return Ok(pinned.clone());
    }
    let mut repinned = pinned.clone();
    repinned.sha256 = spec.sha256.clone();
    repinned.revision = spec.revision();
    let packet_id = packet_id.to_owned();
    let spec_path = repinned.path.clone();
    let spec_sha256 = repinned.sha256.clone();
    let spec_revision = repinned.revision.clone();
    on_ledger(&ctx.ledger, move |l| {
        l.repin_packet_spec(packet_id, spec_path, spec_sha256, spec_revision)
    })
    .await?;
    Ok(repinned)
}

/// Charge a PRE-CLAIM transport failure to the packet's bounded budget.
///
/// No attempt row is written: there is no claim token to fence one with, and
/// inventing a terminal attempt for work no seat ever held would falsify the
/// packet's history. The `proto.retry` grant carries both the count and the
/// deadline, which is exactly what `advance` reads for a packet with no
/// terminal attempts of its own.
///
/// Nothing fences this path — the failure is pre-claim by definition — so
/// the charge is read-and-append inside ONE ledger transaction
/// (`grant_retry`). Two advances racing the same outage would otherwise read
/// the same count and both write `n + 1`.
pub(crate) async fn grant_pre_claim_retry(
    ctx: &Ctx,
    packet_id: &str,
    note: String,
) -> Result<PacketOutcome, Failure> {
    let (run_id, _, _) = crate::core::split_packet_key(packet_id)?;
    let now = now_iso();
    charge_retry(ctx, &run_id, packet_id, now.clone(), now).await?;
    Ok(PacketOutcome::Transport(note))
}

/// Append one packet's `proto.retry` grant, mapping the proto error onto the
/// ledger's.
async fn charge_retry(
    ctx: &Ctx,
    run_id: &str,
    packet_id: &str,
    since: String,
    failure_started_at: String,
) -> Result<(), Failure> {
    let run_id = run_id.to_owned();
    let packet_id = packet_id.to_owned();
    on_ledger(&ctx.ledger, move |l| {
        forged_proto::grant_retry_under_active_policy(
            l,
            &run_id,
            &packet_id,
            &since,
            &failure_started_at,
        )
        .map_err(|e| match e {
            forged_proto::ProtoError::Ledger(inner) => inner,
            other => forged_ledger::LedgerError::Internal {
                message: other.to_string(),
            },
        })
    })
    .await?;
    Ok(())
}

/// Adopt an already-claimed attempt whose provider was never spawned (the
/// crash window between claim and spawn): spawn under the row's own token
/// and run the rest of the pipeline unchanged.
///
/// The spec is re-resolved here because adoption claims nothing, so no
/// ledger comparison stands behind it; the attempt refuses outright if the
/// work has moved off the body the packet pins.
///
/// A spec failure SETTLES the attempt before it propagates. The attempt is
/// already `running` with no process behind it: left that way, the row keeps
/// blocking both a re-claim and the re-pin that would clear the drift, and
/// `honor_await` re-enters adoption and fails identically forever. Failing
/// it hands the packet back to the reclaim saga, which can retire it.
pub async fn execute_adopted(
    ctx: &Ctx,
    ports: &ForgedPorts,
    exec: &ExecutionContext,
    packet: &WorkPacket,
    attempt_id: i64,
    claim_token: &str,
) -> Result<PacketOutcome, Failure> {
    // Recovery must not create an effect for an attempt whose immutable
    // started_at deadline passed while its prior controller was absent.
    if let Some(outcome) = settle_pre_spawn_deadline(ctx, exec, packet, attempt_id).await? {
        return Ok(outcome);
    }
    let spec = match crate::core::spec::resolve_for_packet(ctx, &packet.spec, &packet.work_id).await
    {
        Ok(spec) => spec,
        Err(failure) => {
            return settle_adoption(ctx, packet, attempt_id, claim_token, failure).await
        }
    };
    if let Err(failure) = crate::core::spec::assert_pinned(&packet.spec, &spec) {
        return settle_adoption(ctx, packet, attempt_id, claim_token, failure).await;
    }
    run_attempt(ctx, ports, exec, packet, &spec, attempt_id, claim_token).await
}

/// Retire an adopted attempt whose spec could not be resolved or no longer
/// matches what the packet pins.
async fn settle_adoption(
    ctx: &Ctx,
    packet: &WorkPacket,
    attempt_id: i64,
    claim_token: &str,
    failure: Failure,
) -> Result<PacketOutcome, Failure> {
    settle_unspawned(
        ctx,
        packet,
        attempt_id,
        claim_token,
        PreSpawnFailure {
            transport_note: format!("transport: adoption could not read the spec: {failure}"),
            refusal_note: format!("unspawned: adoption refused: {failure}"),
            failure,
            phase: "adoption",
        },
    )
    .await
}

/// Retire a claimed attempt whose host-fallback event could not be recorded.
///
/// The fallback is recorded between the claim and the spawn, so a failure
/// here is the shape nothing on that stretch may propagate on its own: the
/// row is already `running` with no process behind it.
async fn settle_host_fallback(
    ctx: &Ctx,
    packet: &WorkPacket,
    attempt_id: i64,
    claim_token: &str,
    failure: Failure,
) -> Result<PacketOutcome, Failure> {
    // Both notes name the seam; the PREFIX carries the recoverable split, so
    // the row stays diagnosable either way rather than reading as a generic
    // pre-spawn refusal.
    settle_unspawned(
        ctx,
        packet,
        attempt_id,
        claim_token,
        PreSpawnFailure {
            transport_note: format!(
                "transport: the host fallback could not be recorded: {failure}"
            ),
            refusal_note: format!("unspawned: the host fallback could not be recorded: {failure}"),
            failure,
            phase: "host-selection",
        },
    )
    .await
}

/// Retire a claimed attempt that will never reach a provider, under its own
/// claim token, BEFORE the failure propagates to the caller.
///
/// The row is `running` with no process behind it. Left that way it blocks
/// both the re-claim and the re-pin that would clear the cause, `honor_await`
/// re-enters the identical failure forever, and the reclaim saga has to time
/// out a lease that no process is renewing.
///
/// EITHER WAY THE NOTE SAYS NO SEAT RAN, because no seat did. A `transport:`
/// note carries a recoverable failure and an `unspawned:` note an
/// unrecoverable one, and `classify_failure` reads both as the packet
/// standing on its bounded-retry budget rather than as this stage's answer.
/// That distinction is load-bearing: a plain note classifies SEMANTIC, and a
/// semantic failure IS a stage result — `contribution` merges it into the
/// review fan-out as `RequestChanges`, and `advance` spends a remediation
/// round on it — so a review seat that never spawned would speak a verdict it
/// never had and a fix seat that never spawned could end the run.
///
/// The row is failed either way, so the packet is re-claimable and
/// re-pinnable; the budget is what bounds a cause that will not clear. An
/// unrecoverable failure still surfaces to the caller rather than being
/// swallowed into the retry.
struct PreSpawnFailure<'a> {
    transport_note: String,
    refusal_note: String,
    failure: Failure,
    phase: &'a str,
}

async fn settle_unspawned(
    ctx: &Ctx,
    packet: &WorkPacket,
    attempt_id: i64,
    claim_token: &str,
    settlement: PreSpawnFailure<'_>,
) -> Result<PacketOutcome, Failure> {
    let PreSpawnFailure {
        transport_note,
        refusal_note,
        failure,
        phase,
    } = settlement;
    let note = if failure.recoverable {
        &transport_note
    } else {
        &refusal_note
    };
    let evidence = preserve_pre_spawn_failure(ctx, packet, attempt_id, note, phase).await;
    let settled = fail_and_grant_retry(ctx, &packet.packet_id, claim_token, note.clone()).await;
    let outcome = settled?;
    evidence?;
    if failure.recoverable {
        Ok(outcome)
    } else {
        Err(failure)
    }
}

async fn preserve_pre_spawn_failure(
    ctx: &Ctx,
    packet: &WorkPacket,
    attempt_id: i64,
    note: &str,
    phase: &str,
) -> Result<(), Failure> {
    let (run_id, stage, seq) = crate::core::split_packet_key(&packet.packet_id)?;
    let run_root = ctx.config.run_dir(&run_id);
    let packet_dir = ctx.config.packet_dir_key(&run_id, &stage, seq);
    let dirs = PacketDirs::new(&packet_dir, attempt_id);
    crate::core::artifacts::prepare_attempt(&run_root, &dirs)?;
    if !crate::core::artifacts::prompt_exists(&run_root, &dirs)? {
        let prompt = format!(
            "Forged did not start a provider for this attempt.\nPhase: {phase}\nFailure: {note}\n"
        );
        crate::core::artifacts::materialize_prompt(&run_root, &dirs, prompt.as_bytes())?;
    }
    crate::core::artifacts::finalize_provider_files(&run_root, &dirs)?;
    crate::core::artifacts::materialize_and_join(
        ctx,
        packet,
        attempt_id,
        "transport",
        &json!({"note": note, "providerStarted": false}),
        &json!({"host": null, "spawned": false, "phase": phase}),
    )
    .await?;
    Ok(())
}

async fn fail_pre_spawn_transport(
    ctx: &Ctx,
    packet: &WorkPacket,
    attempt_id: i64,
    claim_token: &str,
    note: String,
    phase: &str,
) -> Result<PacketOutcome, Failure> {
    let evidence = preserve_pre_spawn_failure(ctx, packet, attempt_id, &note, phase).await;
    let settled = fail_and_grant_retry(ctx, &packet.packet_id, claim_token, note).await;
    let outcome = settled?;
    evidence?;
    Ok(outcome)
}

/// The shared attempt pipeline: render, spawn, await, harvest, settle.
async fn run_attempt(
    ctx: &Ctx,
    ports: &ForgedPorts,
    exec: &ExecutionContext,
    packet: &WorkPacket,
    spec: &ResolvedSpec,
    attempt_id: i64,
    claim_token: &str,
) -> Result<PacketOutcome, Failure> {
    let run_id = packet.run_id.clone();
    let packet_id = packet.packet_id.clone();
    let claim_token = claim_token.to_owned();
    let run_root = ctx.config.run_dir(&run_id);
    // This field is immutable. Read it once for the owned attempt so the
    // 200-ms liveness cadence never becomes a ledger polling loop and later
    // heartbeats cannot move the deadline.
    let attempt_started_at = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id))
        .await?
        .started_at;
    let as_of = now_iso();
    if let Some(note) = deadline_reason(exec, packet, attempt_id, &attempt_started_at, &as_of)? {
        return settle_known_pre_spawn_deadline(
            ctx,
            packet,
            attempt_id,
            note,
            "deadline-before-preparation",
        )
        .await;
    }

    // 1. Everything between the claim and the spawn. The attempt is already
    // `running` with no process behind it, so NOTHING in here may propagate
    // on its own: every exit settles the row under its own claim token
    // first (`settle_unspawned`).
    //
    // The packet directory, the spec the seat reads, and the rendered
    // prompt are materialized here. The spec bytes are written from the read
    // this attempt was fenced on, so every seat of this packet reads the
    // same bytes.
    let unprepared_packet = packet.clone();
    let packet = packet.clone();
    let prepared = async {
        let mut packet = packet;
        let interventions = crate::core::sessions::pending_interventions(ctx, &run_id).await?;
        packet
            .field_notes
            .extend(interventions.iter().map(|intervention| {
                format!(
                    "Intervention {} from {}: {}",
                    intervention.id, intervention.requested_by, intervention.message
                )
            }));
        if let Some(note) = relaunch_note(ctx, &run_id, &packet).await? {
            packet.field_notes.push(note);
        }
        // Renewal targets the lease that is actually held — renewal is
        // owner-only, and a renewal under a second, derived identity would
        // be refused and let the run's own lease lapse under it. Internal
        // runs (epic-plan / epic-assurance) claim NO work lease by design
        // and never renew; an ORDINARY run must actually hold its lease at
        // spawn — a foreign or absent row means the work was reclaimed or
        // released between Resolve and this attempt, and spawning a
        // provider beside the new holder is exactly the double-writer the
        // lease exists to prevent.
        let internal_run = matches!(
            exec.protocol.as_ref().map(|p| p.name.as_str()),
            Some("epic-plan") | Some("epic-assurance")
        );
        let holder = crate::core::lease_identity(&ctx.ledger, &packet.work_id, &run_id).await?;
        let lease_is_ours = if internal_run {
            false
        } else {
            let row = {
                let work = packet.work_id.clone();
                on_ledger(&ctx.ledger, move |l| l.work_lease(&work)).await?
            };
            match row {
                Some(row) if row.holder == holder => true,
                Some(row) => {
                    return Err(Failure {
                        code: ErrorCode::WorkLeaseHeld,
                        message: format!(
                            "work lease for {} is held by {:?}; refusing to spawn beside it",
                            packet.work_id, row.holder
                        ),
                        recoverable: true,
                    })
                }
                None => {
                    return Err(Failure {
                        code: ErrorCode::WorkLeaseHeld,
                        message: format!(
                            "no work lease held for {}; the run's claim was released or \
                             reclaimed — refusing to spawn unfenced",
                            packet.work_id
                        ),
                        recoverable: true,
                    })
                }
            }
        };
        let (stage_key, seq) = match &packet.execution {
            Some(execution) => (execution.stage_id.clone(), i64::from(execution.round)),
            None => {
                let (_, stage, seq) = crate::core::split_packet_id(&packet_id)?;
                (stage_str(stage).to_owned(), seq)
            }
        };
        let packet_dir = ctx.config.packet_dir_key(&run_id, &stage_key, seq);
        failpoint::hit("packet.materialize.before");
        let dirs = PacketDirs::new(&packet_dir, attempt_id);
        crate::core::artifacts::prepare_attempt(&run_root, &dirs)?;
        crate::core::spec::assert_pinned(&packet.spec, spec)?;
        crate::core::spec::materialize(spec, Path::new(&packet.spec.path))?;
        let templates = PromptTemplates::load()?;
        let context = render_context(exec, &packet, seq)?;
        let prompt_stage = prompt_stage_of(&packet, exec.protocol.as_ref())?;
        let prompt = templates.render(prompt_stage, &context)?;
        crate::core::artifacts::materialize_prompt(&run_root, &dirs, prompt.as_bytes())?;
        Ok::<_, Failure>((packet, interventions, holder, lease_is_ours, packet_dir))
    }
    .await;
    let (packet, interventions, holder, lease_is_ours, packet_dir) = match prepared {
        Ok(prepared) => prepared,
        Err(failure) => {
            let as_of = now_iso();
            if let Some(note) = deadline_reason(
                exec,
                &unprepared_packet,
                attempt_id,
                &attempt_started_at,
                &as_of,
            )? {
                return settle_known_pre_spawn_deadline(
                    ctx,
                    &unprepared_packet,
                    attempt_id,
                    note,
                    "deadline-during-preparation",
                )
                .await;
            }
            let transport = format!("transport: the attempt could not be prepared: {failure}");
            let refusal = format!("unspawned: attempt refused before spawn: {failure}");
            return settle_unspawned(
                ctx,
                &unprepared_packet,
                attempt_id,
                &claim_token,
                PreSpawnFailure {
                    transport_note: transport,
                    refusal_note: refusal,
                    failure,
                    phase: "preparation",
                },
            )
            .await;
        }
    };
    let dirs = PacketDirs::new(&packet_dir, attempt_id);
    let as_of = now_iso();
    if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)? {
        return settle_known_pre_spawn_deadline(
            ctx,
            &packet,
            attempt_id,
            note,
            "deadline-during-preparation",
        )
        .await;
    }

    // 2. The sentinel-free shell line.
    let driver = match driver_for(&packet.provider_hints.provider) {
        Ok(driver) => driver,
        Err(error) => {
            let note = format!("transport: provider adapter unavailable: {}", error.message);
            return fail_pre_spawn_transport(
                ctx,
                &packet,
                attempt_id,
                &claim_token,
                note,
                "adapter-selection",
            )
            .await;
        }
    };
    let invocation = match driver
        .invocation(&packet, &dirs, &claim_token)
        .map_err(Failure::from)
    {
        Ok(invocation) => invocation,
        Err(failure) => {
            let transport = format!("transport: the provider invocation failed: {failure}");
            let refusal = format!("unspawned: attempt refused before spawn: {failure}");
            return settle_unspawned(
                ctx,
                &packet,
                attempt_id,
                &claim_token,
                PreSpawnFailure {
                    transport_note: transport,
                    refusal_note: refusal,
                    failure,
                    phase: "invocation",
                },
            )
            .await;
        }
    };
    let provider_session_candidate = invocation.session_hint.clone();

    // 3. A stale pid file from a prior attempt is removed first: absence
    // means "spawn never happened", and only this attempt's shell may write
    // the file back. The exact private runner command is built only after
    // host selection, because display is enabled solely for an owned Herdr
    // provider pane.
    let pid_path = dirs.provider_pid();
    let _ = std::fs::remove_file(&pid_path);
    let _ = std::fs::remove_file(dirs.provider_lstart());
    let status_base = dirs.status();
    let mut env = HashMap::new();
    if let Ok(path) = std::env::var("PATH") {
        env.insert("PATH".to_owned(), path);
    }
    // Serialize every Herdr layout/spawn effect against pause, stop, and
    // settlement. A control transition that wins this fence makes the
    // admission stale before workspace/tab creation can occur.
    let submit_guard =
        crate::core::handoff::acquire_packet_submit(ctx, &packet_id, &run_id).await?;
    let fence = {
        let claim_token = claim_token.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            Ok(ledger.assert_admitted_attempt_live(&claim_token))
        })
        .await?
    };
    match fence {
        Ok(()) => {}
        Err(forged_ledger::LedgerError::AdmissionMoved {
            leg,
            reservation,
            current,
        }) => {
            let display = |facts: Option<&forged_ledger::AdmissionFenceFacts>| match facts {
                Some(facts) => format!(
                    "{}/{}/{}@rev{}",
                    facts.provider,
                    facts.model,
                    match facts.resource_class {
                        forged_types::AdmissionResourceClass::Read => "read",
                        forged_types::AdmissionResourceClass::RepositoryWrite => {
                            "repository-write"
                        }

                        forged_types::AdmissionResourceClass::Gate => "gate",
                    },
                    facts.control_revision
                ),
                None => "?".to_owned(),
            };
            let note = format!(
                "readmit: admission {leg} moved: {} -> {}",
                display(reservation.as_deref()),
                display(current.as_deref())
            );
            return match fail_pre_spawn_transport(
                ctx,
                &packet,
                attempt_id,
                &claim_token,
                note,
                "admission-fence",
            )
            .await
            {
                Err(failure) if failure.code == forged_types::ErrorCode::StaleClaimToken => {
                    Ok(PacketOutcome::Revoked)
                }
                outcome => outcome,
            };
        }
        Err(error) => return Err(error.into()),
    }
    let as_of = now_iso();
    if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)? {
        return settle_known_pre_spawn_deadline(
            ctx,
            &packet,
            attempt_id,
            note,
            "deadline-before-host-selection",
        )
        .await;
    }
    let (owned_subject, _) = crate::core::herdr_ownership::attempt_subject(&run_id)?;
    let layout_subject = forged_types::HerdrLayoutSubjectV1 {
        kind: match owned_subject.kind {
            forged_types::OwnedHerdrSubjectKind::Run => forged_types::HerdrLayoutSubjectKind::Run,
            forged_types::OwnedHerdrSubjectKind::Epic => forged_types::HerdrLayoutSubjectKind::Epic,
        },
        id: owned_subject.id,
    };
    // Herdr is the preferred visibility adapter. The ledger records the
    // actual host selection, so a missing socket can never masquerade as a
    // Herdr-backed session.
    let (host, host_kind, socket_path, layout_mutation): (
        Arc<dyn SessionHost>,
        &str,
        Option<String>,
        Option<crate::core::herdr_layout::MutationLease>,
    ) = match exec.host_policy {
        HostPolicy::Off => (
            Arc::new(
                ProcessHost::new(&status_base).with_termination_grace_s(exec.termination_grace_s),
            ),
            "process",
            None,
            None,
        ),
        HostPolicy::Preferred | HostPolicy::Required => match exec.herdr_socket.as_ref() {
            None => {
                if exec.host_policy == HostPolicy::Required {
                    return fail_pre_spawn_transport(
                        ctx,
                        &packet,
                        attempt_id,
                        &claim_token,
                        "transport: Herdr is required but no socket is configured".to_owned(),
                        "host-selection",
                    )
                    .await;
                }
                if let Err(failure) = crate::core::sessions::record_host_fallback(
                    ctx,
                    &run_id,
                    &packet_id,
                    attempt_id,
                    "no Herdr socket is configured",
                )
                .await
                {
                    return settle_host_fallback(ctx, &packet, attempt_id, &claim_token, failure)
                        .await;
                }
                (
                    Arc::new(
                        ProcessHost::new(&status_base)
                            .with_termination_grace_s(exec.termination_grace_s),
                    ),
                    "process",
                    None,
                    None,
                )
            }
            Some(sock) => match forged_host::HerdrHost::connect(sock, &status_base).await {
                Ok(herdr) => {
                    let herdr = herdr.with_termination_grace_s(exec.termination_grace_s);
                    let (herdr, mutation) = match workspace_label(ctx, &run_id).await {
                        Some(label) => {
                            let herdr = herdr.with_workspace(label.clone());
                            crate::core::herdr_layout::configure(
                                ctx,
                                herdr,
                                &label,
                                layout_subject,
                                &packet.worktree,
                                &env,
                            )
                            .await
                        }
                        None => (herdr, None),
                    };
                    (
                        Arc::new(herdr),
                        "herdr",
                        Some(sock.to_string_lossy().into_owned()),
                        mutation,
                    )
                }
                Err(error) if exec.host_policy == HostPolicy::Preferred => {
                    if let Err(failure) = crate::core::sessions::record_host_fallback(
                        ctx,
                        &run_id,
                        &packet_id,
                        attempt_id,
                        &error.to_string(),
                    )
                    .await
                    {
                        return settle_host_fallback(
                            ctx,
                            &packet,
                            attempt_id,
                            &claim_token,
                            failure,
                        )
                        .await;
                    }
                    (
                        Arc::new(
                            ProcessHost::new(&status_base)
                                .with_termination_grace_s(exec.termination_grace_s),
                        ),
                        "process",
                        None,
                        None,
                    )
                }
                Err(error) => {
                    let as_of = now_iso();
                    if let Some(note) =
                        deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)?
                    {
                        return settle_known_pre_spawn_deadline(
                            ctx,
                            &packet,
                            attempt_id,
                            note,
                            "deadline-during-host-selection",
                        )
                        .await;
                    }
                    return fail_pre_spawn_transport(
                        ctx,
                        &packet,
                        attempt_id,
                        &claim_token,
                        format!("transport: required Herdr host unavailable: {error}"),
                        "host-selection",
                    )
                    .await;
                }
            },
        },
    };
    let attach_hint =
        (host_kind == "herdr").then(|| format!("forged session read --attempt {attempt_id}"));
    let mut layout_mutation = layout_mutation;
    let as_of = now_iso();
    if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)? {
        crate::core::herdr_layout::finish_mutation(ctx, layout_mutation.take(), None, Some(&note))
            .await;
        return settle_known_pre_spawn_deadline(
            ctx,
            &packet,
            attempt_id,
            note,
            "deadline-during-host-setup",
        )
        .await;
    }
    let render_mode = if host_kind == "herdr" {
        ProviderStreamRenderModeV1::OwnedHerdrPane
    } else {
        ProviderStreamRenderModeV1::Disabled
    };
    let provider_stream_request = match ProviderStreamRequestV1::for_attempt(
        &packet,
        &invocation,
        &dirs,
        &run_root,
        attempt_id,
        render_mode,
    )
    .map_err(Failure::from)
    {
        Ok(request) => request,
        Err(failure) => {
            crate::core::herdr_layout::finish_mutation(
                ctx,
                layout_mutation.take(),
                None,
                Some(&failure.to_string()),
            )
            .await;
            let note = format!("transport: private provider runner request failed: {failure}");
            return fail_pre_spawn_transport(
                ctx,
                &packet,
                attempt_id,
                &claim_token,
                note,
                "runner-request",
            )
            .await;
        }
    };
    if let Err(failure) = crate::core::artifacts::materialize_provider_stream_request(
        &run_root,
        &dirs,
        &provider_stream_request,
    ) {
        crate::core::herdr_layout::finish_mutation(
            ctx,
            layout_mutation.take(),
            None,
            Some(&failure.to_string()),
        )
        .await;
        let note = format!("transport: private provider runner request was not durable: {failure}");
        return fail_pre_spawn_transport(
            ctx,
            &packet,
            attempt_id,
            &claim_token,
            note,
            "runner-request",
        )
        .await;
    }
    let executable = match std::env::current_exe() {
        Ok(executable) => executable,
        Err(error) => {
            crate::core::herdr_layout::finish_mutation(
                ctx,
                layout_mutation.take(),
                None,
                Some(&error.to_string()),
            )
            .await;
            return fail_pre_spawn_transport(
                ctx,
                &packet,
                attempt_id,
                &claim_token,
                "transport: exact Forged executable identity is unavailable".to_owned(),
                "runner-executable",
            )
            .await;
        }
    };
    let shell_line = match forged_provider::provider_stream_shell_line(&executable, &dirs)
        .map_err(Failure::from)
    {
        Ok(shell_line) => shell_line,
        Err(failure) => {
            crate::core::herdr_layout::finish_mutation(
                ctx,
                layout_mutation.take(),
                None,
                Some(&failure.to_string()),
            )
            .await;
            let note = format!("transport: exact private provider runner is unsafe: {failure}");
            return fail_pre_spawn_transport(
                ctx,
                &packet,
                attempt_id,
                &claim_token,
                note,
                "runner-executable",
            )
            .await;
        }
    };
    // The bounded-orphan window (operator-adjudicated, accepted as a
    // residual): a crash between here and the shell writing `provider.pid`
    // leaves a provider no later process can identify, so no later process
    // can kill it. It is CONTAINED rather than prevented — nothing this
    // side of the spawn can make a process identity durable before the
    // process exists. The orphan never heartbeats, so the work lease lapses
    // and the packet is reclaimed; and its eventual result is fenced by a
    // claim token that is no longer live, so `land_packet_result` quarantines
    // it instead of landing it. Reconcile's half of the containment is in
    // `adapters::ports`: an attempt whose identity never materialized past
    // the grace window is failed as a transport failure, never an
    // unavailable port.
    failpoint::hit("provider.spawn.before");
    let prepared = match host.prepare(&packet.worktree, &shell_line, &env).await {
        Ok(prepared) => prepared,
        Err(error) => {
            let as_of = now_iso();
            if let Some(note) =
                deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)?
            {
                crate::core::herdr_layout::finish_mutation(
                    ctx,
                    layout_mutation.take(),
                    None,
                    Some(&note),
                )
                .await;
                return settle_known_pre_spawn_deadline(
                    ctx,
                    &packet,
                    attempt_id,
                    note,
                    "deadline-during-host-prepare",
                )
                .await;
            }
            crate::core::herdr_layout::finish_mutation(
                ctx,
                layout_mutation.take(),
                None,
                Some(&error.to_string()),
            )
            .await;
            let note = format!("transport: provider prepare failed: {error}");
            return fail_pre_spawn_transport(
                ctx,
                &packet,
                attempt_id,
                &claim_token,
                note,
                "host-prepare",
            )
            .await;
        }
    };
    let as_of = now_iso();
    if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)? {
        crate::core::herdr_layout::finish_mutation(ctx, layout_mutation.take(), None, Some(&note))
            .await;
        return settle_prepared_deadline(ctx, &host, prepared, &packet, attempt_id, note).await;
    }
    let status_path = prepared.sentinel_path().to_string_lossy().into_owned();
    let (ownership, controller_generation) = crate::core::herdr_ownership::attempt_identity(
        &prepared,
        &run_id,
        &packet_id,
        attempt_id,
        &claim_token,
    )?;
    if let Some(identity) = ownership.as_ref() {
        if let Err(failure) = crate::core::herdr_ownership::register(ctx, identity.clone()).await {
            let as_of = now_iso();
            if let Some(note) =
                deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)?
            {
                crate::core::herdr_layout::finish_mutation(
                    ctx,
                    layout_mutation.take(),
                    Some(&prepared),
                    Some(&note),
                )
                .await;
                return settle_prepared_deadline(ctx, &host, prepared, &packet, attempt_id, note)
                    .await;
            }
            crate::core::herdr_layout::finish_mutation(
                ctx,
                layout_mutation.take(),
                Some(&prepared),
                None,
            )
            .await;
            host.rollback_prepared(prepared).await;
            let transport = format!("transport: provider ownership registration failed: {failure}");
            let refusal = format!("unspawned: provider ownership registration refused: {failure}");
            return settle_unspawned(
                ctx,
                &packet,
                attempt_id,
                &claim_token,
                PreSpawnFailure {
                    transport_note: transport,
                    refusal_note: refusal,
                    failure,
                    phase: "ownership-registration",
                },
            )
            .await;
        }
        // Projection persistence is best effort and contains no host effect.
        // It may never change whether this prepared provider starts.
        let _ = crate::core::herdr_projection::refresh(ctx).await;
        crate::core::herdr_projection::record_candidate(
            ctx,
            &identity.ownership_id,
            provider_session_candidate.as_deref(),
        )
        .await;
    }
    crate::core::herdr_layout::finish_mutation(ctx, layout_mutation.take(), Some(&prepared), None)
        .await;
    failpoint::hit("provider.ownership.register.after");
    let as_of = now_iso();
    if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)? {
        return settle_prepared_deadline(ctx, &host, prepared, &packet, attempt_id, note).await;
    }
    let spawned = host.start(prepared).await;
    failpoint::hit("provider.spawn.after");
    let as_of = now_iso();
    let start_deadline_note =
        deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)?;
    let session = match spawned {
        Ok(session) => session,
        Err(error) if ownership.is_some() => {
            // `pane.send_input` is not idempotent. A transport error may be a
            // lost success response, and HerdrHost's best-effort close is not
            // death proof. Keep the exact attempt, claim, admission capacity,
            // and ownership live so recovery can observe its durable sentinel
            // or provider pid; settling here could admit a duplicate effect.
            if let Some(note) = start_deadline_note {
                let _ = deadline_marker(ctx, attempt_id, &note).await?;
            }
            return Err(Failure {
                code: error.wire_code(),
                message: format!(
                    "Herdr provider start outcome is ambiguous; retaining exact attempt for recovery: {error}"
                ),
                recoverable: true,
            });
        }
        Err(e) => {
            // ProcessHost reports start failure only before it publishes a
            // child, so no provider effect can exist on this branch.
            if let Some(note) = start_deadline_note {
                return settle_known_pre_spawn_deadline(
                    ctx,
                    &packet,
                    attempt_id,
                    note,
                    "deadline-during-start",
                )
                .await;
            }
            let note = format!("transport: provider spawn failed: {e}");
            crate::core::artifacts::materialize_and_join(
                ctx,
                &packet,
                attempt_id,
                "transport",
                &json!({"note": &note}),
                &json!({"host": host_kind, "spawned": false}),
            )
            .await?;
            return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
        }
    };
    let mut session_evidence = json!({
        "host": host_kind,
        "sessionId": session.as_str(),
        "socketPath": socket_path.clone(),
        "statusPath": status_path.clone(),
        "controllerGeneration": controller_generation,
        "ownershipId": ownership.as_ref().map(|identity| &identity.ownership_id),
        "layoutId": ownership.as_ref().and_then(|identity| identity.layout_id.as_deref()),
        "attachHint": attach_hint.clone(),
    });
    if let Some(identity) = ownership.as_ref() {
        if let Err(error) =
            crate::core::herdr_ownership::mark_command_started(ctx, &identity.ownership_id).await
        {
            let as_of = now_iso();
            if let Some(note) =
                deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)?
            {
                return settle_started_deadline(
                    ctx,
                    &host,
                    &session,
                    &packet,
                    attempt_id,
                    &session_evidence,
                    note,
                )
                .await;
            }
            // The command may be live. Never retry send_input. Contain it by
            // verified kill; if that cannot be proved, leave the running
            // attempt and durable ownership for cross-process recovery.
            if host.kill_confirmed(&session).await.is_ok() {
                let note = format!(
                    "transport: provider command-start evidence failed after start: {error}"
                );
                return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
            }
            return Err(error);
        }
        let _ = crate::core::herdr_projection::refresh(ctx).await;
    }
    failpoint::hit("provider.ownership.started.after");
    let as_of = now_iso();
    if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)? {
        return settle_started_deadline(
            ctx,
            &host,
            &session,
            &packet,
            attempt_id,
            &session_evidence,
            note,
        )
        .await;
    }
    if let Err(error) = crate::core::sessions::record_session_started(
        ctx,
        crate::core::sessions::SessionStarted {
            run_id: &run_id,
            packet_id: &packet_id,
            attempt_id,
            host: host_kind,
            session_id: session.as_str(),
            socket_path: socket_path.as_deref(),
            status_path: &status_path,
            controller_generation,
            layout_id: ownership
                .as_ref()
                .and_then(|identity| identity.layout_id.as_deref()),
            attach_hint: attach_hint.as_deref(),
        },
    )
    .await
    {
        let as_of = now_iso();
        if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)?
        {
            return settle_started_deadline(
                ctx,
                &host,
                &session,
                &packet,
                attempt_id,
                &session_evidence,
                note,
            )
            .await;
        }
        if host.kill_confirmed(&session).await.is_ok() {
            let note = format!("transport: provider session record failed after start: {error}");
            return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
        }
        return Err(error);
    }
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
    // an unguarded provider renews no work lease, so another worker would
    // reclaim its apparently-expired work while it is still writing to the
    // worktree. Stop the session, record a transport failure, and let the
    // transport-retry budget decide whether to try again.
    let pid = match await_pid(dirs.path(), exec, &packet, attempt_id, &attempt_started_at).await? {
        PidObservation::Ready(pid) => pid,
        PidObservation::Deadline(note) => {
            return settle_started_deadline(
                ctx,
                &host,
                &session,
                &packet,
                attempt_id,
                &session_evidence,
                note,
            )
            .await;
        }
        PidObservation::Missing => {
            let stopped = host.kill_confirmed(&session).await;
            drop(submit_guard);
            stopped.map_err(|error| Failure {
                code: ErrorCode::HostUnavailable,
                message: format!(
                    "provider pid was not durable and its process group could not be stopped: {error}"
                ),
                recoverable: true,
            })?;
            let note = "transport: provider pid file never appeared".to_owned();
            crate::core::artifacts::materialize_and_join(
                ctx,
                &packet,
                attempt_id,
                "transport",
                &json!({"note": &note}),
                &session_evidence,
            )
            .await?;
            return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
        }
    };
    // The start-time stamp beside the pid is the pid-reuse guard for every
    // process that did not spawn this attempt (see `adapters::ports`). Do not
    // let an effect-capable provider continue without that durable identity:
    // a later revoker could not safely signal it.
    let identity_failure = match await_provider_lstart(
        pid,
        exec,
        &packet,
        attempt_id,
        &attempt_started_at,
        crate::adapters::ports::lstart_of,
    )
    .await?
    {
        ProviderIdentityObservation::Ready(lstart) => {
            std::fs::write(dirs.provider_lstart(), lstart)
                .err()
                .map(|error| format!("cannot persist provider start time: {error}"))
        }
        ProviderIdentityObservation::Deadline(note) => {
            return settle_started_deadline(
                ctx,
                &host,
                &session,
                &packet,
                attempt_id,
                &session_evidence,
                note,
            )
            .await;
        }
        ProviderIdentityObservation::Missing => {
            Some("provider start time never appeared".to_owned())
        }
    };
    if let Some(detail) = identity_failure {
        // A terminal sentinel is sufficient containment even when a very
        // short-lived process vanished before `ps` could capture its start
        // time. Otherwise the spawning host must prove the group stopped
        // before the attempt may be settled and retried.
        let observed = host.alive(&session).await;
        let as_of = now_iso();
        if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)?
        {
            return settle_started_deadline(
                ctx,
                &host,
                &session,
                &packet,
                attempt_id,
                &session_evidence,
                note,
            )
            .await;
        }
        if !matches!(observed, Ok(forged_host::Liveness::Exited(_))) {
            let stopped = host.kill_confirmed(&session).await;
            drop(submit_guard);
            stopped.map_err(|error| Failure {
                code: ErrorCode::HostUnavailable,
                message: format!(
                    "provider identity was not durable and its process group could not be stopped: {error}"
                ),
                recoverable: true,
            })?;
            let note = format!("transport: {detail}");
            crate::core::artifacts::materialize_and_join(
                ctx,
                &packet,
                attempt_id,
                "transport",
                &json!({"note": &note}),
                &session_evidence,
            )
            .await?;
            return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
        }
    }
    // A concurrent stop/pause may proceed only after the provider has a
    // cross-process identity that its revoker can verify. Before this point
    // the spawning driver is the sole process able to contain the effect.
    drop(submit_guard);

    // Await completion by polling the host; the sentinel status file is the
    // only exit-code truth.
    let mut beats: u32 = 0;
    let mut session_scanner =
        forged_provider::ProviderSessionScanner::new(&packet.provider_hints.provider);
    let liveness = loop {
        let observed = match host.alive(&session).await {
            Ok(observed) => observed,
            Err(e) => {
                return Err(e.into());
            }
        };
        // `alive` is an observation, not a timestamp of when the provider
        // exited. Check the immutable deadline after every observation and
        // before accepting even a terminal sentinel; otherwise a provider
        // that exits between polls can cross its deadline and still have
        // late output harvested as success.
        let as_of = now_iso();
        if let Some(note) = deadline_reason(exec, &packet, attempt_id, &attempt_started_at, &as_of)?
        {
            let marker = deadline_marker(ctx, attempt_id, &note).await?;
            if marker.state != AttemptState::Revoking {
                return if marker.state == AttemptState::Failed
                    && marker.revoke_scope == Some(RevokeScope::Deadline)
                {
                    Ok(PacketOutcome::Transport(note))
                } else {
                    Ok(PacketOutcome::Revoked)
                };
            }
            host.kill_confirmed(&session)
                .await
                .map_err(|error| Failure {
                    code: ErrorCode::HostUnavailable,
                    message: format!(
                        "stage deadline expired but provider death was not confirmed: {error}"
                    ),
                    recoverable: true,
                })?;
            crate::core::artifacts::finalize_provider_files(&run_root, &dirs)?;
            let out = crate::core::artifacts::read_output_text(&run_root, &dirs)?;
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
            if marker.revoke_scope != Some(RevokeScope::Deadline) {
                crate::core::artifacts::materialize_and_join(
                    ctx,
                    &packet,
                    attempt_id,
                    "revoked",
                    &json!({"note": "attempt was revoked while its deadline expired"}),
                    &session_evidence,
                )
                .await?;
                return Ok(PacketOutcome::Revoked);
            }
            crate::core::artifacts::materialize_and_join(
                ctx,
                &packet,
                attempt_id,
                "deadline",
                &json!({"reason": &note}),
                &session_evidence,
            )
            .await?;
            return settle_deadline_retry(ctx, &run_id, &packet_id, attempt_id, note).await;
        }
        match observed {
            forged_host::Liveness::Running => {
                beats += 1;
                if beats.is_multiple_of(25) {
                    // Heartbeats prove liveness but never renew the frozen
                    // wall-clock deadline anchored at `started_at`. The
                    // attempt heartbeat and the work-lease renewal ride the
                    // same cadence: a REFUSED renewal means the claim or the
                    // lease was taken out from under us, and the attempt
                    // self-terminates exactly as if revoked — the guardian
                    // process this replaces never even reported it. Only the
                    // typed refusals revoke: any other ledger error is
                    // transport (a busy writer under load), the beat is
                    // skipped, and the next beat renews — the lease TTL
                    // absorbs missed beats by construction.
                    let token = claim_token.clone();
                    let renewed =
                        on_ledger(&ctx.ledger, move |l| l.heartbeat_attempt(&token)).await;
                    let lease_renewed = if lease_is_ours {
                        let work = packet.work_id.clone();
                        let lease_holder = holder.clone();
                        on_ledger(&ctx.ledger, move |l| {
                            l.heartbeat_work_lease(
                                &work,
                                &lease_holder,
                                forged_ledger::WORK_LEASE_TTL_S,
                            )
                        })
                        .await
                    } else {
                        Ok(())
                    };
                    let claim_refused = matches!(
                        &renewed,
                        Err(failure) if failure.code == ErrorCode::StaleClaimToken
                    );
                    let lease_refused = matches!(
                        &lease_renewed,
                        Err(failure) if failure.code == ErrorCode::WorkLeaseHeld
                    );
                    if claim_refused || lease_refused {
                        // Our claim or our lease was taken out from under us:
                        // stop the provider and report. Its tokens were still
                        // spent; freeze this attempt's private capture before
                        // any successor is allowed to proceed. The settle
                        // below is fenced by CONFIRMED death: an unconfirmed
                        // kill skips this beat and retries containment on the
                        // next one rather than making the packet
                        // successor-eligible while the provider may still be
                        // writing.
                        if host.kill_confirmed(&session).await.is_err() {
                            continue;
                        }
                        crate::core::artifacts::finalize_provider_files(&run_root, &dirs)?;
                        let out = crate::core::artifacts::read_output_text(&run_root, &dirs)?;
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
                        crate::core::artifacts::materialize_and_join(
                            ctx,
                            &packet,
                            attempt_id,
                            "revoked",
                            &json!({"note": "attempt claim or work lease was lost while provider was running"}),
                            &session_evidence,
                        )
                        .await?;
                        if !claim_refused {
                            // Lease-loss alone: the ATTEMPT is still live in
                            // the ledger (no revoker touched it), so it must
                            // settle durably here or the packet strands with
                            // a live attempt nothing will ever finish. A
                            // refused renewal is terminal for this attempt,
                            // never transport.
                            let packet_for_fail = packet_id.clone();
                            let token = claim_token.clone();
                            let note = format!(
                                "work lease lost: {}",
                                lease_renewed
                                    .err()
                                    .map(|failure| failure.message)
                                    .unwrap_or_default()
                            );
                            on_ledger(&ctx.ledger, move |l| {
                                l.fail_packet(&packet_for_fail, &token, &note)
                            })
                            .await?;
                        }
                        return Ok(PacketOutcome::Revoked);
                    }
                }
                if beats.is_multiple_of(5) {
                    if let Some(identity) = ownership.as_ref() {
                        crate::core::herdr_projection::discover_provider_session(
                            ctx,
                            &identity.ownership_id,
                            &mut session_scanner,
                            &dirs.stdout_working(),
                            false,
                        )
                        .await;
                    }
                }
                tokio::time::sleep(Duration::from_millis(200)).await;
            }
            other => break other,
        }
    };

    // The shell sentinel is the runner exit. Its closed status proves the
    // provider termination/capture split without admitting renderer output
    // into execution truth. A missing or mismatched status is transport on
    // the natural terminal path; renderer-only degradation is diagnostic.
    let provider_stream_transport = match liveness {
        forged_host::Liveness::Exited(code) => {
            match forged_provider::load_provider_stream_status(&provider_stream_request, code) {
                Ok(status) => {
                    let failure = status.transport_failure();
                    if let Value::Object(metadata) = &mut session_evidence {
                        metadata.insert(
                            "providerStream".to_owned(),
                            serde_json::to_value(&status).unwrap_or_else(|_| {
                                json!({"status": "invalid", "errorClass": "status-serialization"})
                            }),
                        );
                    }
                    failure.map(|failure| {
                        format!("transport: private provider runner {}", failure.as_str())
                    })
                }
                Err(failure) => {
                    if let Value::Object(metadata) = &mut session_evidence {
                        metadata.insert(
                            "providerStream".to_owned(),
                            json!({"status": "invalid", "errorClass": failure.as_str()}),
                        );
                    }
                    Some(format!(
                        "transport: private provider runner {}",
                        failure.as_str()
                    ))
                }
            }
        }
        forged_host::Liveness::Vanished => {
            if let Value::Object(metadata) = &mut session_evidence {
                metadata.insert(
                    "providerStream".to_owned(),
                    json!({"status": "unavailable", "errorClass": "session-vanished"}),
                );
            }
            None
        }
        forged_host::Liveness::Running => unreachable!("loop breaks only on terminal liveness"),
    };

    // Provider output was streamed to private names. Publish those names
    // only after the provider is terminal; no successor shares this attempt
    // directory, and the manifest written below is the completion marker.
    crate::core::artifacts::finalize_provider_files(&run_root, &dirs)?;

    // 5. Record what this attempt spent, before deciding what it produced.
    //
    // Here and nowhere else: the capture is complete, the attempt id is in
    // hand, and the outcome has not yet branched. The attempt-addressed
    // capture makes later reconciliation possible too, but the live path
    // still records spend immediately rather than depending on a backfill.
    let out = crate::core::artifacts::read_output_text(&run_root, &dirs)?;
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
    let provider = packet.provider_hints.provider.as_str();
    let transport_patterns = ctx.config.transport_patterns_for(provider);
    let harvest = if let Some(note) = provider_stream_transport {
        Harvest::Transport(note)
    } else {
        match liveness {
            forged_host::Liveness::Vanished => {
                Harvest::Transport("transport: session vanished".to_owned())
            }
            forged_host::Liveness::Exited(_code) => match provider {
                "codex" => {
                    let last = crate::core::artifacts::read_final_message_text(&run_root, &dirs)?;
                    harvest_codex(
                        &out,
                        last.as_deref(),
                        &packet.result_schema,
                        &packet_id,
                        &transport_patterns,
                    )
                }
                "pi" => harvest_pi(&out, &packet.result_schema, &packet_id, &transport_patterns),
                _ => harvest_claude(&out, &packet.result_schema, &packet_id, &transport_patterns),
            },
            forged_host::Liveness::Running => unreachable!("loop breaks only on terminal liveness"),
        }
    };
    let harvest = match harvest {
        Harvest::Result(result) => match crate::adapters::extract::validate_result_for_packet(
            &result,
            exec.protocol.as_ref(),
            packet.execution.as_ref().map(|value| value.purpose),
        ) {
            Ok(()) => Harvest::Result(result),
            Err(note) => Harvest::Semantic(note),
        },
        other => other,
    };

    let (artifact_outcome, artifact_detail) = match &harvest {
        Harvest::Result(result) => (
            "result",
            serde_json::to_value(result.as_ref()).map_err(|error| {
                Failure::internal(format!("serializing harvested result evidence: {error}"))
            })?,
        ),
        Harvest::Transport(note) => ("transport", json!({"note": note})),
        Harvest::Semantic(note) => ("semantic", json!({"note": note})),
    };
    crate::core::artifacts::materialize_and_join(
        ctx,
        &packet,
        attempt_id,
        artifact_outcome,
        &artifact_detail,
        &session_evidence,
    )
    .await?;
    failpoint::hit("provider.result.recorded.after");

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

    // One final bounded evidence pass happens only after the attempt result
    // has settled. Its success or failure cannot alter that result.
    if let Some(identity) = ownership.as_ref() {
        crate::core::herdr_projection::discover_provider_session(
            ctx,
            &identity.ownership_id,
            &mut session_scanner,
            &dirs.stdout(),
            true,
        )
        .await;
        let _ = crate::core::herdr_projection::refresh(ctx).await;
    }

    // A Herdr terminal is now durable supervisor work. Never make pane
    // cleanup part of, or capable of changing, the settled attempt result.
    // ProcessHost owns no migration-014 row and retains its no-op release.
    if ownership.is_none() {
        host.release(&session).await;
    }
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
            if let Outcome::Review {
                verdict,
                findings,
                available,
                ..
            } = &result.outcome
            {
                let packet_id_for_read = packet_id.to_owned();
                let packet = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.get_packet(&packet_id_for_read)
                })
                .await?;
                let stored = forged_proto::stored_packet(&packet).map_err(|error| {
                    Failure::internal(format!("stored review packet does not parse: {error}"))
                })?;
                let execution = stored.execution.as_ref();
                let event = json!({
                    "schemaVersion": 1,
                    "packetId": packet_id,
                    "attemptId": attempt_id,
                    "seatId": execution.map(|value| value.seat_id.as_str()),
                    "roleId": execution.map(|value| value.role_id.as_str()),
                    "purpose": execution.map(|value| value.purpose),
                    "round": execution.map(|value| value.round),
                    "stage": stored.stage,
                    "seq": packet.seq,
                    "verdict": verdict,
                    "available": available,
                    "findingCount": findings.len(),
                });
                let run_for_event = run_id.to_owned();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.append_event_once(
                        &run_for_event,
                        "forged.review.seat.settled",
                        event,
                    )?;
                    Ok(())
                })
                .await?;
            }
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

/// Fail the attempt and charge its packet's bounded budget: store the note,
/// then append the `proto.retry` grant carrying the packet's failure count
/// and the backoff deadline computed from the failed attempt's `ended_at` —
/// what lets kill-matrix case 7 assert the fix round is untouched.
///
/// The note's own prefix is what classifies the failure. `transport:` and
/// `unspawned:` stand on the bounded retry budget; `readmit:` is immediately
/// claimable under current admission facts and receives no retry grant.
pub(crate) async fn fail_and_grant_retry(
    ctx: &Ctx,
    packet_id: &str,
    claim_token: &str,
    note: String,
) -> Result<PacketOutcome, Failure> {
    let (run_id, _, _) = crate::core::split_packet_key(packet_id)?;
    let (failed_at, started_at) = {
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
            Ok((
                attempt.ended_at.clone().unwrap_or(attempt.updated_at),
                attempt.started_at,
            ))
        })
        .await?
    };
    let kind = forged_proto::classify_failure(&note);
    if kind != forged_proto::FailureKind::Readmit {
        charge_retry(ctx, &run_id, packet_id, failed_at, started_at).await?;
    }
    // The note's prefix classified the failure for the ledger; report the
    // same distinction to the caller rather than calling an unspawned seat
    // a transport failure.
    Ok(match kind {
        forged_proto::FailureKind::Unspawned => PacketOutcome::Unspawned(note),
        forged_proto::FailureKind::Readmit => PacketOutcome::Readmit(note),
        _ => PacketOutcome::Transport(note),
    })
}

#[cfg(test)]
mod tests {
    use forged_types::{
        Deliverable, Finding, HostPolicyV1, ProtocolRef, ProviderHints, RoleId, Sandbox,
        SeatExecutionV1, SeatId, SeatPurpose, Severity, SpecRef, Stage, StageContract, WorkPacket,
    };

    use super::*;

    fn assurance_packet(purpose: SeatPurpose) -> WorkPacket {
        let stage = match purpose {
            SeatPurpose::Review | SeatPurpose::Synthesis => Stage::ReviewClaude,
            SeatPurpose::Fix => Stage::Fix,
            SeatPurpose::Implement => Stage::Implement,
        };
        WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: format!("run-1/assurance-{purpose:?}/0"),
            run_id: "run-1".to_owned(),
            work_id: "epic-1".to_owned(),
            stage,
            execution: Some(SeatExecutionV1 {
                stage_id: "assurance-review".to_owned(),
                seat_id: SeatId::new("assurance-seat").expect("seat"),
                role_id: RoleId::new("reviewer").expect("role"),
                purpose,
                round: 0,
            }),
            lane_seq: Some(1),
            spec: SpecRef {
                path: "beads://epic-1".to_owned(),
                sha256: "a".repeat(64),
                revision: Some("root-revision".to_owned()),
            },
            worktree: PathBuf::from("/tmp/worktrees/epic-1"),
            branch: "forged/epic-epic-1".to_owned(),
            base_ref: "main".to_owned(),
            contract: StageContract {
                instructions: "assure".to_owned(),
                gate_commands: vec!["cargo test --workspace".to_owned()],
                deliverable: if purpose == SeatPurpose::Fix {
                    Deliverable::FixCommitsPushed
                } else {
                    Deliverable::ReviewBlock
                },
                budget_s: 600,
                seat_commands: Vec::new(),
            },
            result_schema: if purpose == SeatPurpose::Fix {
                "forged.result.fix/1".to_owned()
            } else {
                "forged.result.review/1".to_owned()
            },
            provider_hints: ProviderHints {
                provider: "claude".to_owned(),
                model: "fixture".to_owned(),
                effort: None,
                sandbox: if purpose == SeatPurpose::Fix {
                    Sandbox::WorkspaceWrite
                } else {
                    Sandbox::ReadOnly
                },
                env: Default::default(),
            },
            field_notes: Vec::new(),
        }
    }

    fn assurance_context(path: &Path) -> ExecutionContext {
        ExecutionContext {
            protocol: Some(ProtocolRef {
                name: "epic-assurance".to_owned(),
                version: 1,
            }),
            pr_number: Some(73),
            findings: Vec::new(),
            review_evidence: Vec::new(),
            plan_candidate: None,
            assurance_evidence: Some(AssuranceEvidence {
                path: path.to_path_buf(),
                sha256: sha256_file(path).expect("evidence digest"),
                head_sha: "0123456789abcdef".to_owned(),
                failed_gate_findings: Vec::new(),
            }),
            risk_context: "High consequence integration.".to_owned(),
            fix_round_budget: 2,
            push_url: "https://example.invalid/repo.git".to_owned(),
            host_policy: HostPolicyV1::Off,
            herdr_socket: None,
            termination_grace_s: 5,
        }
    }

    fn freeze_evidence(path: &Path) {
        let mut permissions = std::fs::metadata(path)
            .expect("evidence metadata")
            .permissions();
        permissions.set_readonly(true);
        std::fs::set_permissions(path, permissions).expect("freeze evidence");
    }

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

    #[test]
    fn assurance_review_and_synthesis_bind_the_exact_evidence() {
        let evidence = tempfile::NamedTempFile::new().expect("evidence file");
        std::fs::write(evidence.path(), "root spec\nfull diff\ngates\n").expect("evidence");
        freeze_evidence(evidence.path());
        let mut exec = assurance_context(evidence.path());

        let review = assurance_packet(SeatPurpose::Review);
        assert_eq!(
            prompt_stage_of(&review, exec.protocol.as_ref()).expect("review stage"),
            PromptStage::EpicAssuranceReview
        );
        let review_context = render_context(&exec, &review, 0).expect("review context");
        assert_eq!(
            review_context.get("evidence_path").and_then(Value::as_str),
            evidence.path().to_str()
        );
        assert_eq!(
            review_context.get("head_sha").and_then(Value::as_str),
            Some("0123456789abcdef")
        );
        assert_eq!(
            review_context.get("is_synthesis").and_then(Value::as_bool),
            Some(false)
        );

        exec.review_evidence = vec!["review-1: approve".to_owned()];
        let synthesis = assurance_packet(SeatPurpose::Synthesis);
        let synthesis_context = render_context(&exec, &synthesis, 0).expect("synthesis context");
        assert_eq!(
            synthesis_context
                .pointer("/review_evidence/0")
                .and_then(Value::as_str),
            Some("review-1: approve")
        );
        assert_eq!(
            synthesis_context
                .get("is_synthesis")
                .and_then(Value::as_bool),
            Some(true)
        );
    }

    #[test]
    fn planning_review_evidence_is_visible_only_to_synthesis() {
        let exec = ExecutionContext {
            protocol: Some(ProtocolRef {
                name: "epic-plan".to_owned(),
                version: 1,
            }),
            pr_number: None,
            findings: Vec::new(),
            review_evidence: vec!["review-1: request changes".to_owned()],
            plan_candidate: None,
            assurance_evidence: None,
            risk_context: "High consequence plan.".to_owned(),
            fix_round_budget: 1,
            push_url: String::new(),
            host_policy: HostPolicyV1::Off,
            herdr_socket: None,
            termination_grace_s: 5,
        };

        let review = assurance_packet(SeatPurpose::Review);
        let review_context = render_context(&exec, &review, 0).expect("review context");
        assert_eq!(review_context["review_evidence"], json!([]));

        let synthesis = assurance_packet(SeatPurpose::Synthesis);
        let synthesis_context = render_context(&exec, &synthesis, 0).expect("synthesis context");
        assert_eq!(
            synthesis_context["review_evidence"],
            json!(["review-1: request changes"])
        );
    }

    #[test]
    fn assurance_fix_merges_and_orders_review_and_failed_gate_findings() {
        let evidence = tempfile::NamedTempFile::new().expect("evidence file");
        std::fs::write(evidence.path(), "root spec\nfull diff\nfailed gate\n").expect("evidence");
        freeze_evidence(evidence.path());
        let mut exec = assurance_context(evidence.path());
        exec.findings = vec![Finding {
            severity: Severity::High,
            file: Some("src/lib.rs".to_owned()),
            line: Some(42),
            message: "review failure".to_owned(),
        }];
        exec.assurance_evidence
            .as_mut()
            .expect("assurance evidence")
            .failed_gate_findings = vec![Finding {
            severity: Severity::Blocker,
            file: Some("gate:cargo test --workspace".to_owned()),
            line: None,
            message: "exit 101; fix the failing assertion".to_owned(),
        }];

        let packet = assurance_packet(SeatPurpose::Fix);
        let context = render_context(&exec, &packet, 0).expect("fix context");
        assert_eq!(
            context
                .pointer("/findings/0/location")
                .and_then(Value::as_str),
            Some("gate:cargo test --workspace")
        );
        assert_eq!(
            context
                .pointer("/findings/1/location")
                .and_then(Value::as_str),
            Some("src/lib.rs:42")
        );
        assert_eq!(
            context.get("reviewed_head_sha").and_then(Value::as_str),
            Some("0123456789abcdef")
        );

        exec.assurance_evidence
            .as_mut()
            .expect("assurance evidence")
            .failed_gate_findings[0]
            .message = " ".to_owned();
        assert!(render_context(&exec, &packet, 0)
            .expect_err("failed gate evidence must be actionable")
            .message
            .contains("failed gate findings must be blocker/high"));
    }

    #[test]
    fn assurance_refuses_changed_evidence_and_implement_purposes() {
        let evidence = tempfile::NamedTempFile::new().expect("evidence file");
        std::fs::write(evidence.path(), "frozen evidence\n").expect("evidence");
        let exec = assurance_context(evidence.path());
        let review = assurance_packet(SeatPurpose::Review);
        assert!(render_context(&exec, &review, 0)
            .expect_err("writable evidence must fail")
            .message
            .contains("evidence is not read-only"));

        std::fs::write(evidence.path(), "changed evidence\n").expect("tamper evidence");
        freeze_evidence(evidence.path());
        assert!(render_context(&exec, &review, 0)
            .expect_err("changed evidence must fail")
            .message
            .contains("evidence digest changed"));

        let implement = assurance_packet(SeatPurpose::Implement);
        assert!(prompt_stage_of(&implement, exec.protocol.as_ref())
            .expect_err("assurance has no implement seat")
            .message
            .contains("implement or legacy"));
    }
}

#[cfg(test)]
mod settle_tests {
    //! Settlement first durably records the provider result and requests pane
    //! cleanup. The supervisor performs that cleanup independently, so a
    //! Herdr refusal must never rewrite the result that already settled.

    use std::collections::BTreeMap;
    use std::path::PathBuf;
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::sync::Mutex;

    use forged_ledger::Ledger;
    use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
    use tokio::net::UnixListener;

    use super::*;
    use crate::config::ForgedConfig;

    const RUN_ID: &str = "run-release";
    const PANE_ID: &str = "w1:p7";
    const DEADLINE_CROSS_DELAY: Duration = Duration::from_millis(1_250);

    /// Every method the mock was asked for, in arrival order.
    type MethodLog = Arc<Mutex<Vec<String>>>;

    #[derive(Clone, Copy)]
    enum MockBehavior {
        Normal,
        RefuseClose,
        LoseSendResponse,
        DelayPreparePastDeadline,
    }

    /// A protocol-19 Herdr exercising either a refused cleanup or the
    /// ambiguous start seam where send_input may have landed before EOF.
    fn start_mock_herdr(socket_path: &Path, behavior: MockBehavior) -> MethodLog {
        let listener = UnixListener::bind(socket_path).expect("bind mock herdr socket");
        let seen: MethodLog = Arc::new(Mutex::new(Vec::new()));
        let recorded = Arc::clone(&seen);
        let closed = Arc::new(AtomicBool::new(false));
        tokio::spawn(async move {
            while let Ok((stream, _)) = listener.accept().await {
                let recorded = Arc::clone(&recorded);
                let closed = Arc::clone(&closed);
                tokio::spawn(async move {
                    let (read_half, mut write_half) = stream.into_split();
                    let mut lines = BufReader::new(read_half).lines();
                    while let Ok(Some(line)) = lines.next_line().await {
                        let Ok(frame) = serde_json::from_str::<Value>(&line) else {
                            continue;
                        };
                        let id = frame["id"].as_str().unwrap_or_default().to_owned();
                        let method = frame["method"].as_str().unwrap_or_default().to_owned();
                        recorded.lock().expect("method log").push(method.clone());
                        if method == "pane.send_input"
                            && matches!(behavior, MockBehavior::LoseSendResponse)
                        {
                            // Drop the response after observing the request:
                            // the client cannot know whether Herdr accepted it.
                            return;
                        }
                        if method == "pane.split"
                            && matches!(behavior, MockBehavior::DelayPreparePastDeadline)
                        {
                            tokio::time::sleep(DEADLINE_CROSS_DELAY).await;
                        }
                        let frame = match method.as_str() {
                            "ping" => json!({"id": id, "result": {"type": "pong",
                                "version": "0.8.0", "protocol": 19, "capabilities": {}}}),
                            "events.subscribe" | "pane.send_input" => {
                                json!({"id": id, "result": {"type": "ok"}})
                            }
                            "workspace.list" => json!({"id": id, "result": {
                                "type": "workspace_list", "workspaces": []}}),
                            "workspace.create" => json!({"id": id, "result": {"workspace": {
                                "workspace_id": "ws-1", "label": "forged-test"}}}),
                            "tab.create" => json!({"id": id, "result": {
                                "type": "tab_created",
                                "tab": {"workspace_id": "ws-1", "tab_id": "tab-1"},
                                "root_pane": {"pane_id": "root-1"}}}),
                            "pane.layout" => json!({"id": id, "result": {
                                "type": "pane_layout", "layout": {
                                    "workspace_id": "ws-1", "tab_id": "tab-1",
                                    "zoomed": false,
                                    "area": {"x": 0, "y": 0, "width": 160, "height": 48},
                                    "focused_pane_id": "root-1",
                                    "panes": [{"pane_id": "root-1", "focused": false,
                                        "rect": {"x": 0, "y": 0,
                                            "width": 160, "height": 48}}],
                                    "splits": []}}}),
                            "pane.split" => json!({"id": id, "result": {"type": "pane_info",
                                "pane": {"pane_id": PANE_ID, "workspace_id": "ws-1",
                                "tab_id": "tab-1", "terminal_id": "term-1", "focused": false,
                                "agent_status": "idle", "revision": 1}}}),
                            "pane.process_info" if closed.load(Ordering::SeqCst) => json!({
                                "id": id, "error": {
                                    "code": "pane_not_found", "message": "pane not found"}}),
                            "pane.process_info" => json!({"id": id, "result": {
                                "type": "pane_process_info", "process_info": {
                                "pane_id": PANE_ID, "shell_pid": 4242,
                                "foreground_process_group_id": 4242,
                                "foreground_processes": [], "tty": "/dev/ttys001"}}}),
                            "pane.close" if matches!(behavior, MockBehavior::RefuseClose) => {
                                json!({"id": id, "error": {
                                    "code": "INTERNAL", "message": "close refused"}})
                            }
                            "pane.close" => {
                                closed.store(true, Ordering::SeqCst);
                                json!({"id": id, "result": {"type": "ok"}})
                            }
                            other => panic!("unexpected herdr request {other:?}"),
                        };
                        let mut bytes = frame.to_string().into_bytes();
                        bytes.push(b'\n');
                        if write_half.write_all(&bytes).await.is_err() {
                            return;
                        }
                        if method != "events.subscribe" {
                            return;
                        }
                    }
                });
            }
        });
        seen
    }

    /// Block until the mock has seen `method`; a dispatched request lands
    /// asynchronously, so asserting on it without waiting would be a race.
    async fn wait_for(seen: &MethodLog, method: &str) {
        let deadline = std::time::Instant::now() + Duration::from_secs(5);
        while !seen.lock().expect("method log").iter().any(|m| m == method) {
            assert!(
                std::time::Instant::now() < deadline,
                "herdr never saw {method}; saw {:?}",
                seen.lock().expect("method log")
            );
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
    }

    /// A provably dead pid: by the time an attempt settles its provider
    /// shell has exited, so any liveness probe sees a dead process.
    fn exited_provider_pid() -> u32 {
        let mut child = std::process::Command::new("/bin/sh")
            .arg("-c")
            .arg("exit 0")
            .spawn()
            .expect("spawn a throwaway child");
        let pid = child.id();
        child.wait().expect("reap the throwaway child");
        pid
    }

    /// A claude stream-json capture whose final result carries a landable
    /// implement block.
    fn claude_capture(packet_id: &str) -> String {
        let result = json!({
            "schema": "forged.result.implement/1",
            "packetId": packet_id,
            "outcome": {"implement": {
                "implemented": true, "commitsAhead": 1,
                "summary": "the seat did the work", "gateState": "pass", "note": null}},
        });
        let text = format!(
            "done.\n\n```forged-result\n{}\n```\n",
            serde_json::to_string(&result).expect("result json")
        );
        let init = json!({"type": "system", "subtype": "init", "session_id": "test-claude"});
        let last = json!({"type": "result", "subtype": "success", "is_error": false,
            "result": text, "session_id": "test-claude", "total_cost_usd": 0.01,
            "usage": {"input_tokens": 5, "cache_read_input_tokens": 1,
                      "cache_creation_input_tokens": 1, "output_tokens": 2}});
        format!("{init}\n{last}\n")
    }

    /// Stand in for the provider the mock pane never actually runs: the pid
    /// the shell would have echoed, the stream capture, and finally the
    /// sentinel that settles the session. The status dir the host reserves
    /// during spawn is the start signal — writing the pid before that would
    /// race the removal of the previous attempt's file.
    async fn play_provider_after(
        packet_dir: PathBuf,
        status_base: PathBuf,
        capture: String,
        delay: Duration,
        write_pid: bool,
        pid_before_delay: bool,
    ) {
        let deadline = std::time::Instant::now() + Duration::from_secs(10);
        let session_dir = loop {
            if let Some(entry) = std::fs::read_dir(&status_base)
                .ok()
                .and_then(|mut entries| entries.next())
            {
                break entry.expect("status dir entry").path();
            }
            assert!(
                std::time::Instant::now() < deadline,
                "the host never reserved a status dir under {}",
                status_base.display()
            );
            tokio::time::sleep(Duration::from_millis(20)).await;
        };
        if write_pid && pid_before_delay {
            std::fs::write(
                packet_dir.join("provider.pid"),
                exited_provider_pid().to_string(),
            )
            .expect("pid file");
        }
        tokio::time::sleep(delay).await;
        let request: Value = serde_json::from_slice(
            &std::fs::read(packet_dir.join(".provider-stream-request.json"))
                .expect("private runner request"),
        )
        .expect("request json");
        assert_eq!(
            request["renderMode"], "owned-herdr-pane",
            "Herdr-owned provider sessions must request the bounded renderer"
        );
        let capture_bytes = capture.len();
        std::fs::write(packet_dir.join(".out.jsonl.incomplete"), capture).expect("stream capture");
        std::fs::write(
            packet_dir.join(".provider-stream-status.json"),
            serde_json::to_vec_pretty(&json!({
                "schema": "forged.provider-stream-status/1",
                "runId": request["runId"],
                "packetId": request["packetId"],
                "attemptId": request["attemptId"],
                "provider": "claude",
                "termination": {"exitCode": 0, "signal": null},
                "capture": "complete",
                // The mock does not execute a terminal renderer. Degradation
                // is presentation-only and must not change settlement.
                "render": "degraded",
                "capturedBytes": capture_bytes,
                "rendererBytesRead": 0,
                "emittedEvents": 0,
                "droppedEvents": 0,
                "failure": null,
            }))
            .expect("runner status json"),
        )
        .expect("runner status");
        if write_pid && !pid_before_delay {
            std::fs::write(
                packet_dir.join("provider.pid"),
                exited_provider_pid().to_string(),
            )
            .expect("pid file");
        }
        std::fs::write(session_dir.join("status"), "0\n").expect("sentinel");
    }

    async fn play_provider(packet_dir: PathBuf, status_base: PathBuf, capture: String) {
        play_provider_after(
            packet_dir,
            status_base,
            capture,
            Duration::ZERO,
            true,
            false,
        )
        .await;
    }

    fn config_for(root: &Path, socket: &Path) -> ForgedConfig {
        ForgedConfig {
            anvil_home: root.to_path_buf(),
            runs_root: root.join("runs"),
            db_path: root.join("state.db"),
            config_path: root.join("config.json"),
            config_path_override: None,
            config_file_read: false,
            config_sha256: None,
            roster: HashMap::new(),
            profiles: BTreeMap::new(),
            rosters: BTreeMap::new(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: Vec::new(),
            stage_budget_s: HashMap::new(),
            transport_retry_budget: 3,
            seat_commands: Vec::new(),
            deadline_retry_budget: 1,
            seat_env: Default::default(),
            transport_patterns: Vec::new(),
            provider_transport_patterns: Default::default(),
            bd_path: root.join("bd"),
            beads_dir: root.join("beads"),
            codex_home: root.join("codex"),
            host_policy: HostPolicy::Required,
            herdr_sock: Some(socket.to_path_buf()),
            pricing: crate::pricing::default_rate_card(),
            admission: crate::config::AdmissionPolicy::default(),
        }
    }

    fn install_policy_cutoff(root: &Path, created_at: &str) {
        let connection =
            rusqlite::Connection::open(root.join("state.db")).expect("open policy fixture");
        connection
            .execute(
                "INSERT INTO policy_revisions \
                 (run_id, revision, policy_json, policy_sha256, reason, created_at) \
                 VALUES (?1, 2, '{}', 'fixture', 'fixture cutoff', ?2)",
                rusqlite::params![RUN_ID, created_at],
            )
            .expect("insert policy cutoff");
    }

    fn retry_state(ledger: &Ledger, packet_id: &str) -> u32 {
        let events = ledger
            .list_events(Some(RUN_ID), 0, 1_000)
            .expect("retry events");
        forged_proto::transport_failures_of(&events, packet_id).expect("retry state")
    }

    struct ClaimedFixture {
        ctx: Ctx,
        ledger: Ledger,
        ports: ForgedPorts,
        exec: ExecutionContext,
        packet: WorkPacket,
        resolved: crate::core::spec::ResolvedSpec,
        packet_id: String,
        attempt_id: i64,
        claim_token: String,
        packet_dir: PathBuf,
    }

    async fn claimed_fixture_with_budget(
        root: &Path,
        socket: &Path,
        budget_s: u64,
    ) -> ClaimedFixture {
        std::fs::create_dir_all(root.join("beads")).expect("beads dir");

        let ledger = Ledger::open(&root.join("state.db")).expect("open ledger");
        ledger
            .create_run(forged_ledger::NewRun {
                run_id: forged_types::RunId::new(RUN_ID).expect("run id"),
                work_id: RUN_ID.to_owned(),
                repo: root.to_string_lossy().into_owned(),
                base_ref: "main".to_owned(),
                branch: format!("forged/{RUN_ID}"),
            })
            .expect("create run");
        let run = ledger.get_run(RUN_ID).expect("run row");
        ledger
            .create_work_item(forged_ledger::NewWorkItem {
                work_id: RUN_ID.to_owned(),
                kind: forged_ledger::WorkKind::Task,
                status: forged_ledger::WorkStatus::Open,
                priority: Some(2),
                // Admission refuses a work whose repository metadata does
                // not match the run's `repo` column — the bd stub this
                // replaced always carried it.
                metadata: std::collections::BTreeMap::from([(
                    "repository".to_owned(),
                    root.to_string_lossy().into_owned(),
                )]),
                spec: forged_ledger::WorkSpecFields {
                    title: RUN_ID.to_owned(),
                    description: "fixture".to_owned(),
                    acceptance_criteria: "- fixture".to_owned(),
                    design: String::new(),
                    notes: String::new(),
                },
                cause: forged_ledger::WorkRevisionCause::Authored,
            })
            .expect("seed work item");
        // An ordinary run must actually hold its work lease at attempt
        // spawn — the fixture claims under the run's derived holder exactly
        // as drive's worktree-prepare stage does.
        ledger
            .claim_specific_work(
                RUN_ID,
                &crate::core::run_holder(RUN_ID),
                forged_ledger::WORK_LEASE_TTL_S,
            )
            .expect("claim work lease");

        let spec_path = root.join("spec.md");
        std::fs::write(&spec_path, "# spec\n").expect("spec");
        let spec_sha = sha256_file(&spec_path).expect("spec sha");
        let ctx = Ctx {
            config: config_for(root, socket),
            ledger: ledger.clone(),
        };
        let ports = ForgedPorts::new(ledger.clone(), ctx.config.clone());
        let exec = ExecutionContext {
            protocol: None,
            pr_number: None,
            findings: Vec::new(),
            review_evidence: Vec::new(),
            plan_candidate: None,
            assurance_evidence: None,
            risk_context: "routine".to_owned(),
            fix_round_budget: 1,
            push_url: String::new(),
            host_policy: HostPolicy::Required,
            herdr_socket: Some(socket.to_path_buf()),
            termination_grace_s: 5,
        };
        let intent = PacketIntent {
            stage: Stage::Implement,
            seq: 1,
            hints: forged_types::ProviderHints {
                provider: "claude".to_owned(),
                model: "claude-test".to_owned(),
                effort: None,
                sandbox: forged_types::Sandbox::WorkspaceWrite,
                env: Default::default(),
            },
            execution: None,
            packet_id: None,
        };
        let source = crate::core::spec::SpecSource::File(spec_path.to_string_lossy().into_owned());
        let resolved = crate::core::spec::ResolvedSpec {
            body: None,
            sha256: spec_sha.clone(),
            fence: forged_ledger::SpecFence::Sha256(spec_sha.clone()),
            work_context: Vec::new(),
        };
        let packet = build_packet(
            &ctx,
            &run,
            &intent,
            &source,
            &resolved,
            &[],
            &[],
            &Default::default(),
            budget_s,
            None,
        )
        .expect("packet");
        std::fs::create_dir_all(&packet.worktree).expect("worktree");
        let packet_id = ledger
            .open_packet(forged_ledger::NewPacket {
                run_id: RUN_ID.to_owned(),
                stage: Stage::Implement,
                seq: 1,
                spec_path: packet.spec.path.clone(),
                spec_sha256: spec_sha.clone(),
                spec_revision: None,
                policy_revision: None,
                body_json: packet.stored_body().expect("packet json"),
            })
            .expect("open packet");
        assert_eq!(packet_id, packet.packet_id);
        ledger
            .authorize_desired_work(forged_ledger::DesiredSubjectKind::Run, RUN_ID, 1)
            .expect("authorize run");
        let reservation_id = crate::core::admission::admit_packet(&ctx, &packet)
            .await
            .expect("admit packet")
            .reservation
            .expect("admission reservation")
            .reservation_id;
        let claimed = ledger
            .claim_packet_with_admission(
                &packet_id,
                &session_claimant(&packet_id, "claude"),
                &forged_ledger::SpecFence::Sha256(spec_sha),
                &reservation_id,
            )
            .expect("claim packet");
        let packet_dir = ctx.config.packet_dir_key(RUN_ID, "implement", 1);
        std::fs::create_dir_all(&packet_dir).expect("packet dir");

        ClaimedFixture {
            ctx,
            ledger,
            ports,
            exec,
            packet,
            resolved,
            packet_id,
            attempt_id: claimed.attempt_id,
            claim_token: claimed.claim_token,
            packet_dir,
        }
    }

    async fn claimed_fixture(root: &Path, socket: &Path) -> ClaimedFixture {
        claimed_fixture_with_budget(root, socket, 600).await
    }

    #[tokio::test]
    async fn overdue_adoption_settles_before_any_provider_effect() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let fixture = claimed_fixture_with_budget(root.path(), &socket, 1).await;
        tokio::time::sleep(Duration::from_millis(1_100)).await;

        let outcome = execute_adopted(
            &fixture.ctx,
            &fixture.ports,
            &fixture.exec,
            &fixture.packet,
            fixture.attempt_id,
            &fixture.claim_token,
        )
        .await
        .expect("overdue adoption settles");
        assert!(matches!(outcome, PacketOutcome::Transport(_)));
        assert!(
            fixture
                .ledger
                .list_events(Some(RUN_ID), 0, 1_000)
                .expect("events")
                .iter()
                .all(|event| event.kind != "forged.session.started"),
            "deadline settlement must occur before any provider session starts"
        );

        let attempt = fixture
            .ledger
            .get_attempt(fixture.attempt_id)
            .expect("attempt");
        assert_eq!(attempt.state, AttemptState::Failed);
        assert_eq!(attempt.revoke_scope, Some(RevokeScope::Deadline));
        assert!(attempt
            .fail_note
            .as_deref()
            .is_some_and(|note| note.starts_with("transport: stage deadline exceeded")));
        let events = fixture
            .ledger
            .list_events(Some(RUN_ID), 0, 1_000)
            .expect("events");
        assert_eq!(
            events
                .iter()
                .filter(|event| event.kind == "proto.retry")
                .count(),
            1,
            "the overdue attempt earns exactly one attempt-addressed successor grant"
        );
        let attempt_owner = fixture.attempt_id.to_string();
        assert!(fixture
            .ledger
            .admission_snapshot(None)
            .expect("admission snapshot")
            .reservations
            .iter()
            .filter(|reservation| {
                reservation.owner_kind.as_deref() == Some("attempt")
                    && reservation.owner_id.as_deref() == Some(attempt_owner.as_str())
            })
            .all(|reservation| reservation.released_at.is_some()));

        let dirs = PacketDirs::new(&fixture.packet_dir, fixture.attempt_id);
        let result: serde_json::Value = serde_json::from_slice(
            &std::fs::read(dirs.result()).expect("deadline result evidence"),
        )
        .expect("result JSON");
        assert_eq!(result["detail"]["providerStarted"], false);
        let session: serde_json::Value = serde_json::from_slice(
            &std::fs::read(dirs.session()).expect("deadline session evidence"),
        )
        .expect("session JSON");
        assert_eq!(session["metadata"]["phase"], "deadline-before-spawn");
    }

    #[tokio::test]
    async fn preparation_that_crosses_the_deadline_never_starts_the_provider() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let seen = start_mock_herdr(&socket, MockBehavior::DelayPreparePastDeadline);
        let fixture = claimed_fixture_with_budget(root.path(), &socket, 1).await;

        let outcome = run_attempt(
            &fixture.ctx,
            &fixture.ports,
            &fixture.exec,
            &fixture.packet,
            &fixture.resolved,
            fixture.attempt_id,
            &fixture.claim_token,
        )
        .await
        .expect("expired preparation settles through the deadline path");

        assert!(matches!(outcome, PacketOutcome::Transport(_)));
        let methods = seen.lock().expect("method log").clone();
        assert!(
            !methods.iter().any(|method| method == "pane.send_input"),
            "no provider command may cross the deadline fence: {methods:?}"
        );
        assert!(
            methods.iter().any(|method| method == "pane.close"),
            "the prepared pane must be rolled back: {methods:?}"
        );
        let attempt = fixture
            .ledger
            .get_attempt(fixture.attempt_id)
            .expect("attempt");
        assert_eq!(attempt.state, AttemptState::Failed);
        assert_eq!(attempt.revoke_scope, Some(RevokeScope::Deadline));
        assert!(attempt
            .fail_note
            .as_deref()
            .is_some_and(|note| note.starts_with("transport: stage deadline exceeded")));
        let dirs = PacketDirs::new(&fixture.packet_dir, fixture.attempt_id);
        let session: Value = serde_json::from_slice(
            &std::fs::read(dirs.session()).expect("deadline session evidence"),
        )
        .expect("session JSON");
        assert_eq!(session["metadata"]["phase"], "deadline-before-start");
    }

    #[tokio::test]
    async fn pid_acquisition_uses_the_stage_deadline_not_the_identity_window() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let seen = start_mock_herdr(&socket, MockBehavior::Normal);
        let fixture = claimed_fixture_with_budget(root.path(), &socket, 1).await;
        let attempt_dirs = PacketDirs::new(&fixture.packet_dir, fixture.attempt_id);
        tokio::spawn(play_provider_after(
            attempt_dirs.attempt_path(),
            attempt_dirs.status(),
            claude_capture(&fixture.packet_id),
            Duration::from_millis(100),
            false,
            false,
        ));
        let started = std::time::Instant::now();

        let outcome = run_attempt(
            &fixture.ctx,
            &fixture.ports,
            &fixture.exec,
            &fixture.packet,
            &fixture.resolved,
            fixture.attempt_id,
            &fixture.claim_token,
        )
        .await
        .expect("missing pid settles at the earlier stage deadline");

        assert!(
            started.elapsed() < Duration::from_secs(3),
            "the five-second pid identity window outlived the stage budget"
        );
        let PacketOutcome::Transport(note) = outcome else {
            panic!("deadline must settle as transport")
        };
        assert!(note.starts_with("transport: stage deadline exceeded"));
        assert!(!note.contains("pid file never appeared"));
        let attempt = fixture
            .ledger
            .get_attempt(fixture.attempt_id)
            .expect("attempt");
        assert_eq!(attempt.state, AttemptState::Failed);
        assert_eq!(attempt.revoke_scope, Some(RevokeScope::Deadline));
        let result: Value = serde_json::from_slice(
            &std::fs::read(attempt_dirs.result()).expect("deadline result evidence"),
        )
        .expect("result JSON");
        assert_eq!(result["outcome"], "deadline");
        assert!(
            seen.lock()
                .expect("method log")
                .iter()
                .any(|method| method == "pane.close"),
            "deadline containment must close the started provider pane"
        );
    }

    #[tokio::test]
    async fn provider_identity_acquisition_uses_the_stage_deadline() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let fixture = claimed_fixture_with_budget(root.path(), &socket, 1).await;
        let entered = Arc::new(AtomicBool::new(false));
        let probe_entered = Arc::clone(&entered);
        let started_at = now_iso();
        let started = std::time::Instant::now();

        let observation = await_provider_lstart(
            1,
            &fixture.exec,
            &fixture.packet,
            fixture.attempt_id,
            &started_at,
            move |_| {
                let probe_entered = Arc::clone(&probe_entered);
                async move {
                    probe_entered.store(true, Ordering::SeqCst);
                    tokio::time::sleep(Duration::from_secs(5)).await;
                    None
                }
            },
        )
        .await
        .expect("provider identity acquisition");

        assert!(entered.load(Ordering::SeqCst), "the lstart probe must run");
        assert!(
            started.elapsed() < Duration::from_secs(2),
            "the five-second lstart probe outlived the one-second stage budget"
        );
        assert!(
            matches!(observation, ProviderIdentityObservation::Deadline(_)),
            "the stage deadline must win over missing provider identity"
        );
    }

    #[tokio::test]
    async fn execution_deadline_uses_the_exact_nanosecond_boundary() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let fixture = claimed_fixture_with_budget(root.path(), &socket, 2).await;

        let started = "2026-08-25T00:00:00.000000123Z";
        assert!(deadline_reason(
            &fixture.exec,
            &fixture.packet,
            fixture.attempt_id,
            started,
            "2026-08-25T00:00:02.000000122Z",
        )
        .expect("before deadline")
        .is_none());
        assert!(deadline_reason(
            &fixture.exec,
            &fixture.packet,
            fixture.attempt_id,
            started,
            "2026-08-25T00:00:02.000000123Z",
        )
        .expect("at deadline")
        .is_some());
    }

    #[tokio::test]
    async fn terminal_output_observed_after_the_deadline_cannot_land() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let seen = start_mock_herdr(&socket, MockBehavior::Normal);
        let fixture = claimed_fixture_with_budget(root.path(), &socket, 1).await;
        let attempt_dirs = PacketDirs::new(&fixture.packet_dir, fixture.attempt_id);
        tokio::spawn(play_provider_after(
            attempt_dirs.attempt_path(),
            attempt_dirs.status(),
            claude_capture(&fixture.packet_id),
            Duration::from_millis(1_100),
            true,
            true,
        ));

        let outcome = run_attempt(
            &fixture.ctx,
            &fixture.ports,
            &fixture.exec,
            &fixture.packet,
            &fixture.resolved,
            fixture.attempt_id,
            &fixture.claim_token,
        )
        .await
        .expect("late terminal output settles as a timeout");
        assert!(matches!(outcome, PacketOutcome::Transport(_)));

        let attempt = fixture
            .ledger
            .get_attempt(fixture.attempt_id)
            .expect("attempt");
        assert_eq!(attempt.state, AttemptState::Failed);
        assert_eq!(attempt.revoke_scope, Some(RevokeScope::Deadline));
        assert_eq!(
            fixture
                .ledger
                .list_events(Some(RUN_ID), 0, 1_000)
                .expect("events")
                .iter()
                .filter(|event| event.kind == "proto.retry")
                .count(),
            1,
            "the late terminal observation earns exactly one retry"
        );
        let methods = seen.lock().expect("method log").clone();
        assert_eq!(
            methods
                .iter()
                .filter(|method| method.as_str() == "pane.close")
                .count(),
            1,
            "verified terminal cleanup is performed exactly once"
        );
        let result: Value = serde_json::from_slice(
            &std::fs::read(attempt_dirs.result()).expect("deadline evidence"),
        )
        .expect("deadline evidence JSON");
        assert_eq!(result["outcome"], "deadline");
    }

    #[tokio::test]
    async fn an_operator_marker_winning_the_deadline_race_never_charges_retry() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let fixture = claimed_fixture_with_budget(root.path(), &socket, 1).await;
        fixture
            .ledger
            .revoke_attempt_scoped(
                fixture.attempt_id,
                "operator stop won",
                RevokeScope::Attempt,
            )
            .expect("operator marker");
        tokio::time::sleep(Duration::from_millis(1_100)).await;

        let outcome = execute_adopted(
            &fixture.ctx,
            &fixture.ports,
            &fixture.exec,
            &fixture.packet,
            fixture.attempt_id,
            &fixture.claim_token,
        )
        .await
        .expect("marker race converges");
        assert_eq!(outcome, PacketOutcome::Revoked);

        // A stale caller reaching the settlement helper after the marker
        // race must be fenced there too, before it can append a retry.
        let stale = settle_deadline_retry(
            &fixture.ctx,
            RUN_ID,
            &fixture.packet_id,
            fixture.attempt_id,
            "transport: stale deadline settlement".to_owned(),
        )
        .await
        .expect("stale settlement is fenced");
        assert_eq!(stale, PacketOutcome::Revoked);

        let attempt = fixture
            .ledger
            .get_attempt(fixture.attempt_id)
            .expect("attempt");
        assert_eq!(attempt.state, AttemptState::Revoking);
        assert_eq!(attempt.revoke_scope, Some(RevokeScope::Attempt));
        assert_eq!(
            fixture
                .ledger
                .list_events(Some(RUN_ID), 0, 1_000)
                .expect("events")
                .iter()
                .filter(|event| event.kind == "proto.retry")
                .count(),
            0,
            "the non-deadline marker owns settlement and earns no retry"
        );
        let dirs = PacketDirs::new(&fixture.packet_dir, fixture.attempt_id);
        assert!(
            !dirs.result().exists(),
            "deadline evidence must not be written for another revocation scope"
        );
    }

    #[tokio::test]
    async fn pre_cutoff_failures_at_all_three_sites_are_not_rescored() {
        let settle_root = tempfile::tempdir().expect("settle tempdir");
        let settle_socket = settle_root.path().join("herdr.sock");
        let settle = claimed_fixture(settle_root.path(), &settle_socket).await;
        install_policy_cutoff(settle_root.path(), "9999-01-01T00:00:00.000000000Z");
        settle
            .ledger
            .revoke_attempt_scoped(
                settle.attempt_id,
                "transport: stage deadline exceeded: pre-cutoff settle fixture",
                RevokeScope::Deadline,
            )
            .expect("deadline marker");
        let before = retry_state(&settle.ledger, &settle.packet_id);
        let outcome = settle_deadline_retry(
            &settle.ctx,
            RUN_ID,
            &settle.packet_id,
            settle.attempt_id,
            "transport: stage deadline exceeded: pre-cutoff settle fixture".to_owned(),
        )
        .await
        .expect("settle pre-cutoff deadline");
        assert!(matches!(outcome, PacketOutcome::Transport(_)));
        assert_eq!(retry_state(&settle.ledger, &settle.packet_id), before);
        assert_eq!(
            settle
                .ledger
                .get_attempt(settle.attempt_id)
                .expect("settled attempt")
                .state,
            AttemptState::Failed
        );

        let charge_root = tempfile::tempdir().expect("charge tempdir");
        let charge_socket = charge_root.path().join("herdr.sock");
        let charge = claimed_fixture(charge_root.path(), &charge_socket).await;
        install_policy_cutoff(charge_root.path(), "9999-01-01T00:00:00.000000000Z");
        let before = retry_state(&charge.ledger, &charge.packet_id);
        charge_retry(
            &charge.ctx,
            RUN_ID,
            &charge.packet_id,
            now_iso(),
            "2000-01-01T00:00:00.000000000Z".to_owned(),
        )
        .await
        .expect("skip pre-cutoff pre-claim failure");
        assert_eq!(retry_state(&charge.ledger, &charge.packet_id), before);

        let reconcile_root = tempfile::tempdir().expect("reconcile tempdir");
        let reconcile_socket = reconcile_root.path().join("herdr.sock");
        let _seen = start_mock_herdr(&reconcile_socket, MockBehavior::Normal);
        let reconcile_fixture = claimed_fixture(reconcile_root.path(), &reconcile_socket).await;
        install_policy_cutoff(reconcile_root.path(), "9999-01-01T00:00:00.000000000Z");
        let reconcile_dirs =
            PacketDirs::new(&reconcile_fixture.packet_dir, reconcile_fixture.attempt_id);
        std::fs::create_dir_all(reconcile_dirs.attempt_path()).expect("attempt dir");
        std::fs::write(
            reconcile_dirs.attempt_path().join("provider.pid"),
            exited_provider_pid().to_string(),
        )
        .expect("dead provider pid");
        reconcile_fixture
            .ledger
            .revoke_attempt_scoped(
                reconcile_fixture.attempt_id,
                "transport: stage deadline exceeded: pre-cutoff reconcile fixture",
                RevokeScope::Deadline,
            )
            .expect("reconcile deadline marker");
        let before = retry_state(&reconcile_fixture.ledger, &reconcile_fixture.packet_id);
        let report = forged_proto::reconcile(
            &reconcile_fixture.ledger,
            RUN_ID,
            &reconcile_fixture.ports,
            &forged_proto::ReconcileConfig {
                stage_budget_s: Default::default(),
                termination_grace_s: 5,
                gate_commands: Vec::new(),
            },
            &now_iso(),
        )
        .await
        .expect("reconcile pre-cutoff deadline");
        assert_eq!(report.timed_out, vec![reconcile_fixture.attempt_id]);
        assert_eq!(
            retry_state(&reconcile_fixture.ledger, &reconcile_fixture.packet_id),
            before
        );

        for (ledger, packet_id) in [
            (&settle.ledger, settle.packet_id.as_str()),
            (&charge.ledger, charge.packet_id.as_str()),
            (
                &reconcile_fixture.ledger,
                reconcile_fixture.packet_id.as_str(),
            ),
        ] {
            assert_eq!(retry_state(ledger, packet_id), 0);
            assert!(ledger
                .list_events(Some(RUN_ID), 0, 1_000)
                .expect("events")
                .iter()
                .all(|event| event.kind != "proto.retry"));
        }
    }

    #[tokio::test]
    async fn pre_claim_retry_carries_the_active_policy_revision() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let fixture = claimed_fixture(root.path(), &socket).await;
        install_policy_cutoff(root.path(), "2000-01-01T00:00:00.000000000Z");

        let outcome = grant_pre_claim_retry(
            &fixture.ctx,
            &fixture.packet_id,
            "transport: pre-claim fixture".to_owned(),
        )
        .await
        .expect("grant retry");
        assert!(matches!(outcome, PacketOutcome::Transport(_)));
        let retries = fixture
            .ledger
            .list_events(Some(RUN_ID), 0, 1_000)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "proto.retry")
            .collect::<Vec<_>>();
        assert_eq!(retries.len(), 1);
        let payload: Value = serde_json::from_str(&retries[0].payload_json).expect("retry payload");
        assert_eq!(payload["policyRevision"], Value::from(2));
        assert!(payload.get("attemptId").is_none());
    }

    #[tokio::test]
    async fn a_refused_pane_close_does_not_change_what_settled() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let seen = start_mock_herdr(&socket, MockBehavior::RefuseClose);
        let fixture = claimed_fixture(root.path(), &socket).await;
        let attempt_dirs = PacketDirs::new(&fixture.packet_dir, fixture.attempt_id);
        tokio::spawn(play_provider(
            attempt_dirs.attempt_path(),
            attempt_dirs.status(),
            claude_capture(&fixture.packet_id),
        ));

        let outcome = run_attempt(
            &fixture.ctx,
            &fixture.ports,
            &fixture.exec,
            &fixture.packet,
            &fixture.resolved,
            fixture.attempt_id,
            &fixture.claim_token,
        )
        .await
        .expect("the attempt settles");

        // Settlement requests cleanup but never performs the external effect
        // inline: the result is durable before a supervisor tick can close.
        let owned = fixture
            .ledger
            .find_owned_herdr_attempt(fixture.attempt_id, &fixture.claim_token)
            .expect("ownership lookup")
            .expect("owned provider pane");
        assert_eq!(
            owned.cleanup_state,
            forged_ledger::OwnedHerdrCleanupState::Pending
        );
        let layout_id = owned
            .layout_id
            .as_deref()
            .expect("required-Herdr attempt joins its durable layout");
        let layout = fixture
            .ledger
            .get_herdr_layout(layout_id)
            .expect("layout lookup")
            .expect("durable layout");
        assert_eq!(
            layout.lifecycle_state,
            forged_ledger::HerdrLayoutLifecycleState::Registered
        );
        assert!(
            !seen
                .lock()
                .expect("method log")
                .iter()
                .any(|method| method == "pane.close"),
            "settlement must not close inline"
        );

        let cleanup = crate::core::herdr_ownership::reconcile(&fixture.ctx)
            .await
            .expect("supervisor cleanup tick");
        assert_eq!(cleanup["effects"][0]["outcome"], "retry-wait");

        // The close really was attempted, and really was refused...
        wait_for(&seen, "pane.close").await;
        // ...and the settlement is exactly the one the provider earned.
        match outcome {
            PacketOutcome::Landed(result) => assert_eq!(result.packet_id, fixture.packet_id),
            other => panic!("a refused close changed the outcome: {other:?}"),
        }
        let attempt = fixture
            .ledger
            .get_attempt(fixture.attempt_id)
            .expect("attempt row");
        assert_eq!(attempt.state, forged_ledger::AttemptState::Completed);
        assert!(
            attempt
                .result_json
                .clone()
                .is_some_and(|json| json.contains("the seat did the work")),
            "the ledger must hold the result the seat reported"
        );

        // The durable record still carries the hint — it is an append-only
        // event and nothing rewrites it — but a terminal attempt is not an
        // attachable session even while durable cleanup is retrying.
        assert!(
            crate::core::sessions::stored_attach_hint_for_test(
                &fixture.ctx,
                RUN_ID,
                fixture.attempt_id,
            )
            .await
            .is_some(),
            "the durable event still names an attach command"
        );
        let listed = crate::core::sessions::session_list(
            &fixture.ctx,
            &forged_types::OperationRequest {
                schema_version: 1,
                idempotency_key: "session_list:test".to_owned(),
                run_id: Some(RUN_ID.to_owned()),
                params: serde_json::json!({"run": RUN_ID})
                    .as_object()
                    .cloned()
                    .expect("params"),
            },
        )
        .await;
        let sessions = listed.result.expect("session list result");
        let settled = sessions["sessions"]
            .as_array()
            .expect("sessions array")
            .iter()
            .find(|s| s["attemptId"] == serde_json::json!(fixture.attempt_id))
            .expect("the settled attempt is listed");
        assert!(
            settled["attachHint"].is_null(),
            "a settled attempt must advertise no attach command: {settled}"
        );
        assert_eq!(settled["layoutId"], layout_id);
    }

    #[tokio::test]
    async fn a_lost_send_response_retains_attempt_and_capacity_for_recovery() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let seen = start_mock_herdr(&socket, MockBehavior::LoseSendResponse);
        let fixture = claimed_fixture(root.path(), &socket).await;

        let error = run_attempt(
            &fixture.ctx,
            &fixture.ports,
            &fixture.exec,
            &fixture.packet,
            &fixture.resolved,
            fixture.attempt_id,
            &fixture.claim_token,
        )
        .await
        .expect_err("lost send response remains ambiguous");
        assert!(error.recoverable);
        assert!(error.message.contains("retaining exact attempt"));

        wait_for(&seen, "pane.close").await;
        let methods = seen.lock().expect("method log").clone();
        assert_eq!(
            methods
                .iter()
                .filter(|method| method.as_str() == "pane.send_input")
                .count(),
            1,
            "an ambiguous non-idempotent send is never retried: {methods:?}"
        );
        assert_eq!(
            methods
                .iter()
                .filter(|method| method.as_str() == "pane.close")
                .count(),
            1,
            "the host attempts one bounded close: {methods:?}"
        );

        let attempt = fixture
            .ledger
            .get_attempt(fixture.attempt_id)
            .expect("attempt row");
        assert_eq!(attempt.state, forged_ledger::AttemptState::Running);
        fixture
            .ledger
            .assert_admitted_attempt_live(&fixture.claim_token)
            .expect("ambiguous effect retains admission capacity");
        let owned = fixture
            .ledger
            .find_owned_herdr_attempt(fixture.attempt_id, &fixture.claim_token)
            .expect("ownership lookup")
            .expect("durable exact pane");
        assert_eq!(
            owned.lifecycle_state,
            forged_ledger::OwnedHerdrLifecycleState::Registered
        );
        assert_eq!(
            owned.cleanup_state,
            forged_ledger::OwnedHerdrCleanupState::NotRequested
        );
        assert!(
            owned.layout_id.is_some(),
            "ambiguous command retains layout join"
        );
    }
}
