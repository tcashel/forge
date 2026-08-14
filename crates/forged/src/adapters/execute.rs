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
use forged_proto::{LandOutcome, PacketIntent};
use forged_provider::{
    ClaudeDriver, CodexDriver, PacketDirs, PromptStage, PromptTemplates, ProviderDriver,
};
use forged_types::{Deliverable, OperationRequest, Stage, StageContract, WorkPacket};
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
            budget_s: u32::try_from(budget_s).unwrap_or(u32::MAX),
        },
        result_schema: PromptStage::for_stage(stage).result_schema().to_owned(),
        provider_hints: intent.hints.clone(),
        field_notes: Vec::new(),
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
            l.claim_packet(&packet_id, &claimant, &fence)
        })
        .await?
    };
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
        Err(failure) => return settle_adoption(ctx, packet, claim_token, failure).await,
    };
    if let Err(failure) = crate::core::spec::assert_pinned(&packet.spec, &spec) {
        return settle_adoption(ctx, packet, claim_token, failure).await;
    }
    run_attempt(ctx, ports, exec, packet, &spec, attempt_id, claim_token).await
}

/// Retire an adopted attempt whose spec could not be resolved or no longer
/// matches what the packet pins.
async fn settle_adoption(
    ctx: &Ctx,
    packet: &WorkPacket,
    claim_token: &str,
    failure: Failure,
) -> Result<PacketOutcome, Failure> {
    settle_unspawned(
        ctx,
        &packet.packet_id,
        claim_token,
        format!("transport: adoption could not read the spec: {failure}"),
        format!("unspawned: adoption refused: {failure}"),
        failure,
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
    packet_id: &str,
    claim_token: &str,
    failure: Failure,
) -> Result<PacketOutcome, Failure> {
    // Both notes name the seam; the PREFIX carries the recoverable split, so
    // the row stays diagnosable either way rather than reading as a generic
    // pre-spawn refusal.
    settle_unspawned(
        ctx,
        packet_id,
        claim_token,
        format!("transport: the host fallback could not be recorded: {failure}"),
        format!("unspawned: the host fallback could not be recorded: {failure}"),
        failure,
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
/// review fan-out as `RequestChanges`, and `advance` spends the run's one fix
/// round on it — so a review seat that never spawned would speak a verdict it
/// never had and a fix seat that never spawned would end the run.
///
/// The row is failed either way, so the packet is re-claimable and
/// re-pinnable; the budget is what bounds a cause that will not clear. An
/// unrecoverable failure still surfaces to the caller rather than being
/// swallowed into the retry.
async fn settle_unspawned(
    ctx: &Ctx,
    packet_id: &str,
    claim_token: &str,
    transport_note: String,
    refusal_note: String,
    failure: Failure,
) -> Result<PacketOutcome, Failure> {
    if failure.recoverable {
        return fail_and_grant_retry(ctx, packet_id, claim_token, transport_note).await;
    }
    fail_and_grant_retry(ctx, packet_id, claim_token, refusal_note).await?;
    Err(failure)
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

    // 1. Everything between the claim and the spawn. The attempt is already
    // `running` with no process behind it, so NOTHING in here may propagate
    // on its own: every exit settles the row under its own claim token
    // first (`settle_unspawned`).
    //
    // The packet directory, the spec the seat reads, and the rendered
    // prompt are materialized here. The spec bytes are written from the read
    // this attempt was fenced on, so every seat of this packet reads the
    // same bytes.
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
        std::fs::create_dir_all(&packet_dir)
            .map_err(|e| Failure::internal(format!("creating {}: {e}", packet_dir.display())))?;
        crate::core::spec::assert_pinned(&packet.spec, spec)?;
        crate::core::spec::materialize(spec, Path::new(&packet.spec.path))?;
        let dirs = PacketDirs::new(&packet_dir);
        let templates = PromptTemplates::load()?;
        let context = render_context(exec, &packet, seq)?;
        let prompt = templates.render(PromptStage::for_stage(packet.stage), &context)?;
        std::fs::write(dirs.prompt(), prompt)
            .map_err(|e| Failure::internal(format!("writing prompt: {e}")))?;
        Ok::<_, Failure>((packet, interventions, holder, packet_dir))
    }
    .await;
    let (packet, interventions, holder, packet_dir) = match prepared {
        Ok(prepared) => prepared,
        Err(failure) => {
            let transport = format!("transport: the attempt could not be prepared: {failure}");
            let refusal = format!("unspawned: attempt refused before spawn: {failure}");
            return settle_unspawned(ctx, &packet_id, &claim_token, transport, refusal, failure)
                .await;
        }
    };
    let dirs = PacketDirs::new(&packet_dir);

    // 2. The sentinel-free shell line.
    let driver = match driver_for(&packet.provider_hints.provider) {
        Ok(driver) => driver,
        Err(error) => {
            let note = format!("transport: provider adapter unavailable: {}", error.message);
            return fail_and_grant_retry(ctx, &packet_id, &claim_token, note).await;
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
            return settle_unspawned(ctx, &packet_id, &claim_token, transport, refusal, failure)
                .await;
        }
    };

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
    let (host, host_kind, socket_path): (Arc<dyn SessionHost>, &str, Option<String>) = match exec
        .host_policy
    {
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
                if let Err(failure) = crate::core::sessions::record_host_fallback(
                    ctx,
                    &run_id,
                    &packet_id,
                    attempt_id,
                    "no Herdr socket is configured",
                )
                .await
                {
                    return settle_host_fallback(ctx, &packet_id, &claim_token, failure).await;
                }
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
                    if let Err(failure) = crate::core::sessions::record_host_fallback(
                        ctx,
                        &run_id,
                        &packet_id,
                        attempt_id,
                        &error.to_string(),
                    )
                    .await
                    {
                        return settle_host_fallback(ctx, &packet_id, &claim_token, failure).await;
                    }
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
    //! The settle path gives the seat's terminal back on the way out. That
    //! release is bookkeeping — the ledger already holds the work — so a
    //! herdr that refuses the close must not reach the settlement.

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

    /// A protocol-19 herdr that carries one seat's spawn through and REFUSES
    /// every `pane.close`.
    fn start_refusing_herdr(socket_path: &Path) -> MethodLog {
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
                            "pane.split" => json!({"id": id, "result": {"type": "pane_info",
                                "pane": {"pane_id": PANE_ID, "workspace_id": "ws-1",
                                "tab_id": "tab-1", "terminal_id": "term-1", "focused": false,
                                "agent_status": "idle", "revision": 1}}}),
                            "pane.process_info" => json!({"id": id, "result": {
                                "type": "pane_process_info", "process_info": {
                                "pane_id": PANE_ID, "shell_pid": 4242,
                                "foreground_process_group_id": 4242,
                                "foreground_processes": [], "tty": "/dev/ttys001"}}}),
                            // The defect under test: the seat's terminal
                            // refuses to go.
                            "pane.close" => json!({"id": id, "error": {
                                "code": "INTERNAL", "message": "close refused"}}),
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

    /// The one bd call this path makes is the lease-holder READ. A stub
    /// answering an empty envelope keeps the test off the operator's pinned
    /// bd, and the run never reaches a bd WRITE — those take a lock under
    /// the machine's real anvil home.
    fn write_bd_stub(path: &Path) {
        std::fs::write(
            path,
            "#!/bin/sh\nprintf '{\"schema_version\":1,\"data\":[]}\\n'\n",
        )
        .expect("bd stub");
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
        std::fs::write(packet_dir.join("out.jsonl"), capture).expect("stream capture");
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
        }
    }

    #[tokio::test]
    async fn a_refused_pane_close_does_not_change_what_settled() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let seen = start_refusing_herdr(&socket);
        write_bd_stub(&root.path().join("bd"));
        std::fs::create_dir_all(root.path().join("beads")).expect("beads dir");

        let ledger = Ledger::open(&root.path().join("state.db")).expect("open ledger");
        ledger
            .create_run(forged_ledger::NewRun {
                run_id: forged_types::RunId::new(RUN_ID).expect("run id"),
                bead_id: RUN_ID.to_owned(),
                repo: root.path().to_string_lossy().into_owned(),
                base_ref: "main".to_owned(),
                branch: format!("forged/{RUN_ID}"),
            })
            .expect("create run");
        let run = ledger.get_run(RUN_ID).expect("run row");

        let spec_path = root.path().join("spec.md");
        std::fs::write(&spec_path, "# spec\n").expect("spec");
        let spec_sha = sha256_file(&spec_path).expect("spec sha");

        let ctx = Ctx {
            config: config_for(root.path(), &socket),
            ledger: ledger.clone(),
        };
        let ports = ForgedPorts::new(ledger.clone(), ctx.config.clone());
        // Required, not Preferred: a fallback to the process host would
        // silently skip the very release this test is about.
        let exec = ExecutionContext {
            pr_number: None,
            findings: Vec::new(),
            review_evidence: Vec::new(),
            push_url: String::new(),
            host_policy: HostPolicy::Required,
            herdr_socket: Some(socket.clone()),
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
        // The deprecated file route: this test is about the seat's pane, not
        // about where its spec came from, and a file-sourced spec needs no bd.
        let source = crate::core::spec::SpecSource::File(spec_path.to_string_lossy().into_owned());
        let resolved = crate::core::spec::ResolvedSpec {
            body: None,
            sha256: spec_sha.clone(),
            fence: forged_ledger::SpecFence::Sha256(spec_sha.clone()),
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
        let claimed = ledger
            .claim_packet(
                &packet_id,
                &session_claimant(&packet_id, "claude"),
                &forged_ledger::SpecFence::Sha256(spec_sha.clone()),
            )
            .expect("claim packet");

        let packet_dir = ctx.config.packet_dir_key(RUN_ID, "implement", 1);
        std::fs::create_dir_all(&packet_dir).expect("packet dir");
        tokio::spawn(play_provider(
            packet_dir.clone(),
            packet_dir
                .join("status")
                .join(claimed.attempt_id.to_string()),
            claude_capture(&packet_id),
        ));

        let outcome = run_attempt(
            &ctx,
            &ports,
            &exec,
            &packet,
            &resolved,
            claimed.attempt_id,
            &claimed.claim_token,
        )
        .await
        .expect("the attempt settles");

        // The close really was attempted, and really was refused...
        wait_for(&seen, "pane.close").await;
        // ...and the settlement is exactly the one the provider earned.
        match outcome {
            PacketOutcome::Landed(result) => assert_eq!(result.packet_id, packet_id),
            other => panic!("a refused close changed the outcome: {other:?}"),
        }
        let attempt = ledger.get_attempt(claimed.attempt_id).expect("attempt row");
        assert_eq!(attempt.state, forged_ledger::AttemptState::Completed);
        assert!(
            attempt
                .result_json
                .clone()
                .is_some_and(|json| json.contains("the seat did the work")),
            "the ledger must hold the result the seat reported"
        );

        // The durable record still carries the hint — it is an append-only
        // event and nothing rewrites it — but the pane it names is released,
        // so `session list` must stop advertising it. A hint that fails
        // BECAUSE the release worked is worse than no hint at all.
        assert!(
            crate::core::sessions::stored_attach_hint_for_test(&ctx, RUN_ID, claimed.attempt_id)
                .await
                .is_some(),
            "the durable event still names an attach command"
        );
        let listed = crate::core::sessions::session_list(
            &ctx,
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
            .find(|s| s["attemptId"] == serde_json::json!(claimed.attempt_id))
            .expect("the settled attempt is listed");
        assert!(
            settled["attachHint"].is_null(),
            "a released pane must advertise no attach command: {settled}"
        );
    }
}
