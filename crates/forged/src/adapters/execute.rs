//! Packet building and execution: fill a `WorkPacket` from a
//! `PacketIntent`, materialize the packet directory, render the prompt,
//! spawn the provider through a `SessionHost`, await the sentinel, harvest
//! the result, and land or fail it. The section-(d) order is load-bearing.

use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;

use forged_host::{ProcessHost, SessionHost};
use forged_ledger::{AttemptRow, EffectClass, RevokeScope, RunRow};
use forged_proto::{LandOutcome, PacketIntent};
use forged_provider::{
    ClaudeDriver, CodexDriver, PacketDirs, PromptStage, PromptTemplates, ProviderDriver,
    ProviderStreamRenderModeV1, ProviderStreamRequestV1,
};
use forged_types::{
    Deliverable, ErrorCode, OperationRequest, Outcome, Stage, StageContract, WorkPacket,
};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::adapters::extract::{harvest_claude, harvest_codex, Harvest};
use crate::adapters::ports::ForgedPorts;
use crate::config::{now_iso, stage_str, HostPolicy};
use crate::core::spec::{ResolvedSpec, SpecSource};
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
    /// A semantic failure was recorded.
    Semantic(String),
    /// Our own attempt was revoked mid-flight; the provider was stopped.
    Revoked,
    /// The immutable stage wall-clock deadline expired. The attempt remains
    /// revoking until the core terminalizes the owning run, so no automatic
    /// successor can open after a crash.
    Deadline { attempt_id: i64, reason: String },
}

fn stage_deadline(started_at: &str, budget_s: u32) -> Result<String, Failure> {
    let started = started_at.parse::<jiff::Timestamp>().map_err(|error| {
        Failure::internal(format!(
            "invalid attempt start timestamp {started_at:?}: {error}"
        ))
    })?;
    let deadline = jiff::Timestamp::from_nanosecond(
        started
            .as_nanosecond()
            .saturating_add(i128::from(budget_s).saturating_mul(1_000_000_000)),
    )
    .map_err(|error| Failure::internal(format!("stage deadline out of range: {error}")))?;
    Ok(forged_proto::widen_rfc3339(&deadline.to_string()))
}

async fn deadline_reason(
    ctx: &Ctx,
    packet: &WorkPacket,
    attempt_id: i64,
) -> Result<Option<(AttemptRow, String)>, Failure> {
    let attempt = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
    let deadline = stage_deadline(&attempt.started_at, packet.contract.budget_s)?;
    let as_of = now_iso();
    if as_of < deadline {
        return Ok(None);
    }
    let reason = format!(
        "stage deadline exceeded: attemptId={attempt_id} stage={} startedAt={} budgetS={} deadlineAt={} asOf={as_of}",
        stage_str(packet.stage),
        attempt.started_at,
        packet.contract.budget_s,
        deadline,
    );
    Ok(Some((attempt, reason)))
}

async fn revoke_deadline(ctx: &Ctx, attempt_id: i64, reason: &str) -> Result<bool, Failure> {
    let reason = reason.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.revoke_attempt_scoped(attempt_id, &reason, RevokeScope::Deadline)
    })
    .await?;
    let current = on_ledger(&ctx.ledger, move |ledger| ledger.get_attempt(attempt_id)).await?;
    Ok(current.revoke_scope == Some(RevokeScope::Deadline))
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

/// Fill every `WorkPacket` field the intent does not carry.
///
/// A bead-sourced packet reads its spec from the packet directory, where
/// `run_attempt` materializes the rendered body; a file-sourced one keeps
/// pointing at the operator's file.
pub fn build_packet(
    ctx: &Ctx,
    run: &RunRow,
    intent: &PacketIntent,
    source: &SpecSource,
    spec: &ResolvedSpec,
    gate_commands: &[String],
    budget_s: u64,
) -> Result<WorkPacket, Failure> {
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
    let budget_s = u32::try_from(budget_s).map_err(|_| {
        Failure::invalid("stage budget exceeds the packet contract's 32-bit seconds field")
    })?;
    let mut packet = WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id,
        run_id: run.run_id.clone(),
        bead_id: run.bead_id.clone(),
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
            gate_commands: gate_commands.to_vec(),
            deliverable,
            budget_s,
        },
        result_schema: PromptStage::for_stage(stage).result_schema().to_owned(),
        provider_hints: intent.hints.clone(),
        field_notes: spec.bead_context.clone(),
    };
    packet.spec.path = match source {
        SpecSource::File(path) => path.clone(),
        SpecSource::Bead(_) => {
            let (stage_key, seq) = packet_keys(&packet)?;
            ctx.config
                .packet_dir_key(&run.run_id, &stage_key, seq)
                .join(crate::core::spec::BEAD_SPEC_FILE)
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
/// row update whose result must CHANGE when the bead does — fence that on a
/// key and the key has to carry the world's state, and a content address is
/// not injective over time (a bead edited A -> B -> A mints the key A
/// already stored, and the replay writes nothing). The ledger's own
/// `Immediate` transaction is the re-pin's fence instead: atomic, re-read
/// every time, with no memory of an earlier call to replay.
///
/// So the key is (run, stage, seq) — the packet's identity, and nothing
/// about its spec.
pub async fn open_packet_op(ctx: &Ctx, packet: &WorkPacket) -> Result<(), Failure> {
    let body_json = packet
        .stored_body()
        .map_err(|e| Failure::internal(format!("cannot serialize packet: {e}")))?;
    let run_id = packet.run_id.clone();
    let target = open_target(packet, body_json)?;
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

fn open_target(packet: &WorkPacket, body_json: String) -> Result<OpenTarget, Failure> {
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
            "risk_context": exec.risk_context,
            "packet_id": packet.packet_id,
            "result_schema": packet.result_schema,
        }),
        PromptStage::Fix => json!({
            "bead_id": packet.bead_id,
            "pr_number": exec.pr_number.unwrap_or(0),
            "worktree": worktree,
            "round": if packet.execution.is_some() { fix_round + 1 } else { fix_round },
            "total_rounds": if packet.execution.is_some() {
                i64::from(exec.fix_round_budget)
            } else {
                1
            },
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

/// Poll `<attempt_dir>/provider.pid` until the spawned shell writes it.
async fn await_pid(attempt_dir: &Path) -> Option<u32> {
    for _ in 0..50 {
        if let Ok(text) = std::fs::read_to_string(attempt_dir.join("provider.pid")) {
            if let Ok(pid) = text.trim().parse::<u32>() {
                return Some(pid);
            }
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    None
}

/// A provider pid is not safely recoverable cross-process until its start
/// stamp is durable. `ps` can briefly miss a just-spawned process under host
/// load, so use the same bounded identity window as detached controllers.
async fn await_provider_lstart(pid: u32) -> Option<String> {
    let pid = i32::try_from(pid).ok()?;
    for _ in 0..20 {
        if let Some(lstart) = crate::adapters::ports::lstart_of(pid).await {
            return Some(lstart);
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    None
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
                "packet {packet_id} deferred by admission: {:?}",
                admission.decision.reason
            ),
            recoverable: true,
        });
    }
    let admitted_hints = admission
        .packet_provider_hints
        .clone()
        .ok_or_else(|| Failure::internal("packet admission omitted provider launch facts"))?;
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
    let spec = match crate::core::spec::resolve_for_packet(ctx, &packet.spec, &packet.bead_id).await
    {
        Ok(spec) => spec,
        Err(failure) if failure.recoverable => {
            let note = format!("transport: the claim could not read the spec: {failure}");
            return grant_pre_claim_retry(ctx, &packet_id, note).await;
        }
        Err(failure) => return Err(failure),
    };

    // RE-PIN BEFORE THE CLAIM. The claim fences on the rendered body, so a
    // bead edited under an already-open packet refuses `SpecDrift` — and
    // nothing else on this path re-opens the packet, so the run would retry
    // the identical refusal until a human intervened.
    let packet = &repin_packet(ctx, packet, &spec).await?;

    // Claim under the PER-ATTEMPT session identity (the bd lease stays the
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
/// BEAD-SOURCED PACKETS ONLY. A file-sourced spec is fenced by the hash of a
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
/// result must also change whenever the bead does, which is precisely what
/// a fence keyed on an idempotency key refuses to do: encode the spec in the
/// key and a bead edited A -> B -> A reproduces the key its first open at A
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
/// and it needs this same transition: a bead edited under an open packet
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
    charge_retry(ctx, &run_id, packet_id, now_iso()).await?;
    Ok(PacketOutcome::Transport(note))
}

/// Append one packet's `proto.retry` grant, mapping the proto error onto the
/// ledger's.
async fn charge_retry(
    ctx: &Ctx,
    run_id: &str,
    packet_id: &str,
    since: String,
) -> Result<(), Failure> {
    let run_id = run_id.to_owned();
    let packet_id = packet_id.to_owned();
    on_ledger(&ctx.ledger, move |l| {
        forged_proto::grant_retry(l, &run_id, &packet_id, &since).map_err(|e| match e {
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
/// bead has moved off the body the packet pins.
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
    let spec = match crate::core::spec::resolve_for_packet(ctx, &packet.spec, &packet.bead_id).await
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

    // Recovered claims can already be over budget before a provider is
    // spawned. Fence them from the same immutable start + stored packet
    // contract used by the live loop.
    if let Some((_attempt, reason)) = deadline_reason(ctx, packet, attempt_id).await? {
        if revoke_deadline(ctx, attempt_id, &reason).await? {
            return Ok(PacketOutcome::Deadline { attempt_id, reason });
        }
        return Ok(PacketOutcome::Revoked);
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
        // The guardian heartbeats the lease that is actually held — bd's
        // heartbeat is owner-only, and a heartbeat under a second, derived
        // identity would be refused and let the run's own lease lapse under
        // it.
        let holder =
            crate::core::lease_identity(&ctx.config.bd_config(), &packet.bead_id, &run_id).await?;
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
        let prompt = templates.render(PromptStage::for_stage(packet.stage), &context)?;
        crate::core::artifacts::materialize_prompt(&run_root, &dirs, prompt.as_bytes())?;
        Ok::<_, Failure>((packet, interventions, holder, packet_dir))
    }
    .await;
    let (packet, interventions, holder, packet_dir) = match prepared {
        Ok(prepared) => prepared,
        Err(failure) => {
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
    {
        let claim_token = claim_token.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.assert_admitted_attempt_live(&claim_token)
        })
        .await?;
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
            Arc::new(ProcessHost::new(&status_base)),
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
                    Arc::new(ProcessHost::new(&status_base)),
                    "process",
                    None,
                    None,
                )
            }
            Some(sock) => match forged_host::HerdrHost::connect(sock, &status_base).await {
                Ok(herdr) => {
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
                        Arc::new(ProcessHost::new(&status_base)),
                        "process",
                        None,
                        None,
                    )
                }
                Err(error) => {
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
    // process exists. The orphan never heartbeats, so the bd lease lapses
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
    let spawned = host.start(prepared).await;
    failpoint::hit("provider.spawn.after");
    let session = match spawned {
        Ok(session) => session,
        Err(error) if ownership.is_some() => {
            // `pane.send_input` is not idempotent. A transport error may be a
            // lost success response, and HerdrHost's best-effort close is not
            // death proof. Keep the exact attempt, claim, admission capacity,
            // and ownership live so recovery can observe its durable sentinel
            // or provider pid; settling here could admit a duplicate effect.
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
    if let Some(identity) = ownership.as_ref() {
        if let Err(error) =
            crate::core::herdr_ownership::mark_command_started(ctx, &identity.ownership_id).await
        {
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
    let mut session_evidence = json!({
        "host": host_kind,
        "sessionId": session.as_str(),
        "socketPath": socket_path,
        "statusPath": status_path,
        "controllerGeneration": controller_generation,
        "ownershipId": ownership.as_ref().map(|identity| &identity.ownership_id),
        "layoutId": ownership.as_ref().and_then(|identity| identity.layout_id.as_deref()),
        "attachHint": attach_hint,
    });
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
    let Some(pid) = await_pid(dirs.path()).await else {
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
    };
    // The start-time stamp beside the pid is the pid-reuse guard for every
    // process that did not spawn this attempt (see `adapters::ports`). Do not
    // let an effect-capable provider continue without that durable identity:
    // a later revoker could not safely signal it.
    let identity_failure = match await_provider_lstart(pid).await {
        Some(lstart) => std::fs::write(dirs.provider_lstart(), lstart)
            .err()
            .map(|error| format!("cannot persist provider start time: {error}")),
        None => Some("provider start time never appeared".to_owned()),
    };
    if let Some(detail) = identity_failure {
        // A terminal sentinel is sufficient containment even when a very
        // short-lived process vanished before `ps` could capture its start
        // time. Otherwise the spawning host must prove the group stopped
        // before the attempt may be settled and retried.
        if !matches!(
            host.alive(&session).await,
            Ok(forged_host::Liveness::Exited(_))
        ) {
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
    let mut session_scanner =
        forged_provider::ProviderSessionScanner::new(&packet.provider_hints.provider);
    let liveness = loop {
        match host.alive(&session).await {
            Ok(forged_host::Liveness::Running) => {
                if let Some((_attempt, reason)) = deadline_reason(ctx, &packet, attempt_id).await? {
                    if !revoke_deadline(ctx, attempt_id, &reason).await? {
                        let _ = host.kill_confirmed(&session).await;
                        if let Some(handle) = guardian.take() {
                            handle.abort();
                        }
                        return Ok(PacketOutcome::Revoked);
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
                    if let Some(handle) = guardian.take() {
                        handle.abort();
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
                        "deadline",
                        &json!({"reason": &reason}),
                        &session_evidence,
                    )
                    .await?;
                    return Ok(PacketOutcome::Deadline { attempt_id, reason });
                }
                beats += 1;
                if beats.is_multiple_of(25) {
                    // Keep the ledger's budget anchor honest while we wait.
                    let token = claim_token.clone();
                    let renewed =
                        on_ledger(&ctx.ledger, move |l| l.heartbeat_attempt(&token)).await;
                    if renewed.is_err() {
                        // Our attempt was revoked out from under us: stop the
                        // provider and report. Its tokens were still spent;
                        // freeze this attempt's private capture before any
                        // successor is allowed to proceed.
                        let _ = host.kill_confirmed(&session).await;
                        if let Some(handle) = guardian.take() {
                            handle.abort();
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
                            &json!({"note": "attempt claim was revoked while provider was running"}),
                            &session_evidence,
                        )
                        .await?;
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
    let harvest = if let Some(note) = provider_stream_transport {
        Harvest::Transport(note)
    } else {
        match liveness {
            forged_host::Liveness::Vanished => {
                Harvest::Transport("transport: session vanished".to_owned())
            }
            forged_host::Liveness::Exited(_code) => match packet.provider_hints.provider.as_str() {
                "codex" => {
                    let last = crate::core::artifacts::read_final_message_text(&run_root, &dirs)?;
                    harvest_codex(&out, last.as_deref(), &packet.result_schema, &packet_id)
                }
                _ => harvest_claude(&out, &packet.result_schema, &packet_id),
            },
            forged_host::Liveness::Running => unreachable!("loop breaks only on terminal liveness"),
        }
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
/// The note's own prefix is what classifies the failure (`transport:` or
/// `unspawned:`); both stand on this one budget.
pub(crate) async fn fail_and_grant_retry(
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
    charge_retry(ctx, &run_id, packet_id, failed_at).await?;
    // The note's prefix classified the failure for the ledger; report the
    // same distinction to the caller rather than calling an unspawned seat
    // a transport failure.
    Ok(match forged_proto::classify_failure(&note) {
        forged_proto::FailureKind::Unspawned => PacketOutcome::Unspawned(note),
        _ => PacketOutcome::Transport(note),
    })
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

#[cfg(test)]
mod settle_tests {
    //! Settlement first durably records the provider result and requests pane
    //! cleanup. The supervisor performs that cleanup independently, so a
    //! Herdr refusal must never rewrite the result that already settled.

    use std::collections::BTreeMap;
    use std::os::unix::fs::PermissionsExt;
    use std::path::PathBuf;
    use std::sync::Mutex;

    use forged_ledger::Ledger;
    use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
    use tokio::net::UnixListener;

    use super::*;
    use crate::config::ForgedConfig;

    const RUN_ID: &str = "run-release";
    const PANE_ID: &str = "w1:p7";

    /// Every method the mock was asked for, in arrival order.
    type MethodLog = Arc<Mutex<Vec<String>>>;

    #[derive(Clone, Copy)]
    enum MockBehavior {
        RefuseClose,
        LoseSendResponse,
    }

    /// A protocol-19 Herdr exercising either a refused cleanup or the
    /// ambiguous start seam where send_input may have landed before EOF.
    fn start_mock_herdr(socket_path: &Path, behavior: MockBehavior) -> MethodLog {
        let listener = UnixListener::bind(socket_path).expect("bind mock herdr socket");
        let seen: MethodLog = Arc::new(Mutex::new(Vec::new()));
        let recorded = Arc::clone(&seen);
        tokio::spawn(async move {
            while let Ok((stream, _)) = listener.accept().await {
                let recorded = Arc::clone(&recorded);
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
                            "pane.process_info" => json!({"id": id, "result": {
                                "type": "pane_process_info", "process_info": {
                                "pane_id": PANE_ID, "shell_pid": 4242,
                                "foreground_process_group_id": 4242,
                                "foreground_processes": [], "tty": "/dev/ttys001"}}}),
                            "pane.close" if matches!(behavior, MockBehavior::RefuseClose) => {
                                json!({"id": id, "error": {
                                    "code": "INTERNAL", "message": "close refused"}})
                            }
                            "pane.close" => json!({"id": id, "result": {"type": "ok"}}),
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

    /// The one bd call this path makes is admission's exact-id READ. A stub
    /// answering the run's native scheduling fields keeps the test off the
    /// operator's pinned bd, and the run never reaches a bd WRITE — those
    /// take a lock under the machine's real anvil home.
    fn write_bd_stub(path: &Path, repository: &Path) {
        let response = json!({
            "schema_version": 1,
            "data": [{
                "id": RUN_ID,
                "title": "settlement test",
                "status": "open",
                "priority": 2,
                "issue_type": "task",
                "revision": 1,
                "metadata": {"repository": repository.to_string_lossy()},
            }],
        });
        let response = response.to_string().replace('\'', "'\"'\"'");
        std::fs::write(path, format!("#!/bin/sh\nprintf '%s\\n' '{response}'\n")).expect("bd stub");
        std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o755))
            .expect("bd stub mode");
    }

    /// A provably dead pid: by the time an attempt settles its provider
    /// shell has exited, so the guardian's first probe ends the guardian.
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
    async fn play_provider(packet_dir: PathBuf, status_base: PathBuf, capture: String) {
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
        std::fs::write(
            packet_dir.join("provider.pid"),
            exited_provider_pid().to_string(),
        )
        .expect("pid file");
        std::fs::write(session_dir.join("status"), "0\n").expect("sentinel");
    }

    fn config_for(root: &Path, socket: &Path) -> ForgedConfig {
        ForgedConfig {
            anvil_home: root.to_path_buf(),
            runs_root: root.join("runs"),
            db_path: root.join("state.db"),
            config_path: root.join("config.json"),
            config_file_read: false,
            roster: HashMap::new(),
            profiles: BTreeMap::new(),
            rosters: BTreeMap::new(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: Vec::new(),
            stage_budget_s: HashMap::new(),
            transport_retry_budget: 3,
            bd_path: root.join("bd"),
            beads_dir: root.join("beads"),
            codex_home: root.join("codex"),
            host_policy: HostPolicy::Required,
            herdr_sock: Some(socket.to_path_buf()),
            pricing: crate::pricing::default_rate_card(),
            admission: crate::config::AdmissionPolicy::default(),
        }
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

    async fn claimed_fixture(root: &Path, socket: &Path) -> ClaimedFixture {
        write_bd_stub(&root.join("bd"), root);
        std::fs::create_dir_all(root.join("beads")).expect("beads dir");

        let ledger = Ledger::open(&root.join("state.db")).expect("open ledger");
        ledger
            .create_run(forged_ledger::NewRun {
                run_id: forged_types::RunId::new(RUN_ID).expect("run id"),
                bead_id: RUN_ID.to_owned(),
                repo: root.to_string_lossy().into_owned(),
                base_ref: "main".to_owned(),
                branch: format!("forged/{RUN_ID}"),
            })
            .expect("create run");
        let run = ledger.get_run(RUN_ID).expect("run row");

        let spec_path = root.join("spec.md");
        std::fs::write(&spec_path, "# spec\n").expect("spec");
        let spec_sha = sha256_file(&spec_path).expect("spec sha");
        let ctx = Ctx {
            config: config_for(root, socket),
            ledger: ledger.clone(),
        };
        let ports = ForgedPorts::new(ledger.clone(), ctx.config.clone());
        let exec = ExecutionContext {
            pr_number: None,
            findings: Vec::new(),
            review_evidence: Vec::new(),
            risk_context: "routine".to_owned(),
            fix_round_budget: 1,
            push_url: String::new(),
            host_policy: HostPolicy::Required,
            herdr_socket: Some(socket.to_path_buf()),
        };
        let intent = PacketIntent {
            stage: Stage::Implement,
            seq: 1,
            hints: forged_types::ProviderHints {
                provider: "claude".to_owned(),
                model: "claude-test".to_owned(),
                effort: None,
                sandbox: forged_types::Sandbox::WorkspaceWrite,
            },
            execution: None,
            packet_id: None,
        };
        let source = crate::core::spec::SpecSource::File(spec_path.to_string_lossy().into_owned());
        let resolved = crate::core::spec::ResolvedSpec {
            body: None,
            sha256: spec_sha.clone(),
            fence: forged_ledger::SpecFence::Sha256(spec_sha.clone()),
            bead_context: Vec::new(),
        };
        let packet =
            build_packet(&ctx, &run, &intent, &source, &resolved, &[], 600).expect("packet");
        std::fs::create_dir_all(&packet.worktree).expect("worktree");
        let packet_id = ledger
            .open_packet(forged_ledger::NewPacket {
                run_id: RUN_ID.to_owned(),
                stage: Stage::Implement,
                seq: 1,
                spec_path: packet.spec.path.clone(),
                spec_sha256: spec_sha.clone(),
                spec_revision: None,
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
