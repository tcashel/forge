//! In-process test fixtures: recording fake `ReconcilePorts`, hand-built
//! `RunView` builders, and scripted `PacketResult` values. Nothing here
//! spawns a subprocess or touches the network.

#![allow(dead_code)]

use std::collections::{BTreeMap, HashMap, VecDeque};
use std::sync::Mutex;

use forged_ledger::{
    AttemptRow, AttemptState, EffectClass, OperationRow, OperationState, PacketRow, RunRow,
    RunState,
};
use forged_proto::{
    machine_idempotency_key, GatePhase, KillOutcome, LeaseReclaim, MachineStage, PortError,
    PrSnapshot, ProtoEvent, ReconcilePorts, ResolveState, RunView, SessionLiveness,
    TerminalAttempt,
};
use forged_types::{
    GateRow, OperationRequest, Outcome, PacketResult, ProviderHints, Sandbox, Stage, Verdict,
};

/// The fixture epoch, in the ledger's fixed-width form.
pub const T0: &str = "2026-08-12T00:00:00.000000000Z";

/// The stage's wire string.
pub fn stage_str(stage: Stage) -> &'static str {
    match stage {
        Stage::Implement => "implement",
        Stage::ReviewClaude => "reviewclaude",
        Stage::ReviewCodex => "reviewcodex",
        Stage::Fix => "fix",
    }
}

/// Deterministic packet id.
pub fn packet_id(run_id: &str, stage: Stage, seq: i64) -> String {
    format!("{run_id}/{}/{seq}", stage_str(stage))
}

/// A roster covering all four provider stages.
pub fn full_roster() -> HashMap<Stage, ProviderHints> {
    let hint = |provider: &str, model: &str| ProviderHints {
        provider: provider.to_owned(),
        model: model.to_owned(),
        effort: None,
        sandbox: Sandbox::WorkspaceWrite,
    };
    HashMap::from([
        (Stage::Implement, hint("claude", "fable")),
        (Stage::ReviewClaude, hint("claude", "fable")),
        (Stage::ReviewCodex, hint("codex", "gpt")),
        (Stage::Fix, hint("claude", "fable")),
    ])
}

/// A review outcome from a present reviewer.
pub fn review(verdict: Verdict) -> Outcome {
    Outcome::Review {
        verdict,
        summary: "scripted".to_owned(),
        findings: vec![],
        available: true,
    }
}

/// The honest codex-absent report: available false, never an approval.
pub fn review_absent() -> Outcome {
    Outcome::Review {
        // The verdict field is present but the leg never contributes it.
        verdict: Verdict::Approve,
        summary: "provider absent".to_owned(),
        findings: vec![],
        available: false,
    }
}

/// A scripted implement outcome.
pub fn implement_ok(commits_ahead: u32) -> Outcome {
    Outcome::Implement {
        implemented: true,
        commits_ahead,
        summary: "built the slice".to_owned(),
        gate_state: Some("pass".to_owned()),
        note: None,
    }
}

/// A scripted fix outcome.
pub fn fix_ok() -> Outcome {
    Outcome::Fix {
        applied: true,
        summary: "applied the findings".to_owned(),
    }
}

/// A scripted packet result wrapping an outcome.
pub fn result_for(pid: &str, outcome: Outcome) -> PacketResult {
    PacketResult {
        schema: "forged.result/1".to_owned(),
        packet_id: pid.to_owned(),
        outcome,
    }
}

/// One passing (or failing) gate row.
pub fn gate_row(exit_code: i32) -> GateRow {
    GateRow {
        command: "cargo test --workspace".to_owned(),
        cwd: "/work".to_owned(),
        exit_code: Some(exit_code),
        duration_ms: 10,
        timed_out: false,
        stdout_preview: String::new(),
        stderr_preview: String::new(),
        artifact_path: "gates/test.log".to_owned(),
    }
}

/// Hand-built [`RunView`] fixtures.
pub struct ViewBuilder {
    run_id: String,
    stop_reason: Option<String>,
    packets: Vec<PacketRow>,
    terminal: BTreeMap<String, Vec<TerminalAttempt>>,
    live: Vec<AttemptRow>,
    inflight: Vec<OperationRow>,
    settled: Vec<OperationRow>,
    events: Vec<ProtoEvent>,
    roster: HashMap<Stage, ProviderHints>,
    budget: u32,
    next_attempt_id: i64,
}

impl ViewBuilder {
    /// A fresh active run.
    pub fn new(run_id: &str) -> Self {
        ViewBuilder {
            run_id: run_id.to_owned(),
            stop_reason: None,
            packets: Vec::new(),
            terminal: BTreeMap::new(),
            live: Vec::new(),
            inflight: Vec::new(),
            settled: Vec::new(),
            events: Vec::new(),
            roster: full_roster(),
            budget: 3,
            next_attempt_id: 1,
        }
    }

    /// Stop the run's lifecycle column with a reason.
    pub fn stopped(mut self, reason: &str) -> Self {
        self.stop_reason = Some(reason.to_owned());
        self
    }

    /// Record a machine step as settled: the request event, plus the
    /// terminal operation row that is the engine's only settlement evidence.
    pub fn op_done(mut self, step: MachineStage, round: u32) -> Self {
        let key = machine_idempotency_key(&self.run_id, step, round);
        self = self.op_requested_only(step, round);
        self.settled
            .push(self.op_row(step, &key, OperationState::Terminal));
        self
    }

    /// Record a machine step as requested with **no operation row at all**.
    ///
    /// Two real states wear this shape, and neither is settled: a crash
    /// between the request event and `begin_operation`, and a `SafeRetry`
    /// step whose row the reconciler released (deleted) for redo.
    pub fn op_requested_only(mut self, step: MachineStage, round: u32) -> Self {
        let key = machine_idempotency_key(&self.run_id, step, round);
        self.events.push(ProtoEvent::OperationRequest {
            name: step.as_str().to_owned(),
            idempotency_key: key.clone(),
            effect_class: "observe-only".to_owned(),
            request: OperationRequest {
                schema_version: 1,
                idempotency_key: key,
                run_id: Some(self.run_id.clone()),
                params: serde_json::Map::new(),
            },
        });
        self
    }

    /// Record a machine step as requested but still in flight.
    pub fn op_inflight(mut self, step: MachineStage, round: u32) -> Self {
        let key = machine_idempotency_key(&self.run_id, step, round);
        self = self.op_requested_only(step, round);
        self.inflight
            .push(self.op_row(step, &key, OperationState::InProgress));
        self
    }

    fn op_row(&self, step: MachineStage, key: &str, state: OperationState) -> OperationRow {
        OperationRow {
            operation_id: format!("op-{key}"),
            name: step.as_str().to_owned(),
            idempotency_key: key.to_owned(),
            request_sha256: "cafe".to_owned(),
            effect_class: EffectClass::ObserveOnly,
            run_id: Some(self.run_id.clone()),
            claim_token: None,
            state,
            response_json: match state {
                OperationState::Terminal => Some("{\"ok\":true}".to_owned()),
                OperationState::InProgress => None,
            },
            created_at: T0.to_owned(),
            updated_at: T0.to_owned(),
        }
    }

    /// Open a packet.
    pub fn packet(mut self, stage: Stage, seq: i64) -> Self {
        let pid = packet_id(&self.run_id, stage, seq);
        self.packets.push(PacketRow {
            packet_id: pid,
            run_id: self.run_id.clone(),
            stage,
            seq,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            body_json: "{}".to_owned(),
            created_at: T0.to_owned(),
        });
        self
    }

    /// Give a packet a live (running) attempt.
    pub fn live_attempt(mut self, stage: Stage, seq: i64) -> Self {
        let pid = packet_id(&self.run_id, stage, seq);
        let attempt_id = self.next_attempt_id;
        self.next_attempt_id += 1;
        self.live.push(AttemptRow {
            attempt_id,
            packet_id: pid,
            claim_token: format!("tok-{attempt_id}"),
            claimant: format!("claude:sess-{attempt_id}:1"),
            state: AttemptState::Running,
            revoke_reason: None,
            fail_note: None,
            result_json: None,
            started_at: T0.to_owned(),
            updated_at: T0.to_owned(),
            last_heartbeat_at: None,
            ended_at: None,
        });
        self
    }

    /// Land a completed terminal attempt with an outcome.
    pub fn completed(mut self, stage: Stage, seq: i64, outcome: Outcome) -> Self {
        let pid = packet_id(&self.run_id, stage, seq);
        let attempt_id = self.next_attempt_id;
        self.next_attempt_id += 1;
        self.terminal.entry(pid).or_default().push(TerminalAttempt {
            attempt_id,
            state: AttemptState::Completed,
            outcome: Some(outcome),
            fail_note: None,
        });
        self
    }

    /// Land a failed terminal attempt with a note.
    pub fn failed(mut self, stage: Stage, seq: i64, note: &str) -> Self {
        let pid = packet_id(&self.run_id, stage, seq);
        let attempt_id = self.next_attempt_id;
        self.next_attempt_id += 1;
        self.terminal.entry(pid).or_default().push(TerminalAttempt {
            attempt_id,
            state: AttemptState::Failed,
            outcome: None,
            fail_note: Some(note.to_owned()),
        });
        self
    }

    /// Land a reclaimed terminal attempt.
    pub fn reclaimed(mut self, stage: Stage, seq: i64) -> Self {
        let pid = packet_id(&self.run_id, stage, seq);
        let attempt_id = self.next_attempt_id;
        self.next_attempt_id += 1;
        self.terminal.entry(pid).or_default().push(TerminalAttempt {
            attempt_id,
            state: AttemptState::Reclaimed,
            outcome: None,
            fail_note: None,
        });
        self
    }

    /// Record a `proto.retry` grant for a packet.
    pub fn retry_event(mut self, stage: Stage, seq: i64, failures: u32, after: &str) -> Self {
        let pid = packet_id(&self.run_id, stage, seq);
        self.events.push(ProtoEvent::Retry {
            packet_id: pid,
            transport_failures: failures,
            retry_after: after.to_owned(),
        });
        self
    }

    /// Record a `proto.gate` outcome.
    pub fn gate_event(mut self, phase: GatePhase, passed: bool) -> Self {
        self.events.push(ProtoEvent::Gate {
            phase,
            seq: match phase {
                GatePhase::Gate => 0,
                GatePhase::Regate => 1,
            },
            passed,
            rows: vec![gate_row(if passed { 0 } else { 1 })],
        });
        self
    }

    /// Override the transport-retry budget (fixtures default to 3).
    pub fn budget(mut self, budget: u32) -> Self {
        self.budget = budget;
        self
    }

    /// Drop a stage from the roster, leaving `advance` no hints to copy.
    pub fn without_roster_entry(mut self, stage: Stage) -> Self {
        self.roster.remove(&stage);
        self
    }

    /// Assemble the view.
    pub fn build(self) -> RunView {
        RunView {
            run: RunRow {
                run_id: self.run_id.clone(),
                bead_id: "bead-1".to_owned(),
                repo: "octo/demo".to_owned(),
                base_ref: "main".to_owned(),
                branch: "feat/x".to_owned(),
                protocol: "slice/v1".to_owned(),
                state: if self.stop_reason.is_some() {
                    RunState::Stopped
                } else {
                    RunState::Active
                },
                stop_reason: self.stop_reason,
                created_at: T0.to_owned(),
                updated_at: T0.to_owned(),
            },
            packets: self.packets,
            terminal_attempts: self.terminal,
            live_attempts: self.live,
            inflight_operations: self.inflight,
            settled_operations: self.settled,
            proto_events: self.events,
            roster: self.roster,
            gate_commands: vec!["cargo test --workspace".to_owned()],
            transport_retry_budget: self.budget,
            now: T0.to_owned(),
        }
    }
}

/// A builder positioned right after the round-0 machine prologue with the
/// implement stage completed: the next decision is the first review
/// fan-out's open.
pub fn through_draftpr(run_id: &str) -> ViewBuilder {
    ViewBuilder::new(run_id)
        .op_done(MachineStage::Resolve, 0)
        .packet(Stage::Implement, 1)
        .completed(Stage::Implement, 1, implement_ok(2))
        .op_done(MachineStage::Gate, 0)
        .op_done(MachineStage::Push, 0)
        .op_done(MachineStage::DraftPr, 0)
}

/// [`through_draftpr`] plus both first-fan-out review packets open.
pub fn at_first_review(run_id: &str) -> ViewBuilder {
    through_draftpr(run_id)
        .packet(Stage::ReviewClaude, 1)
        .packet(Stage::ReviewCodex, 1)
}

/// A builder positioned at the re-review fan-out: first review merged to
/// `RequestChanges`, the fix round consumed by a completed fix, round-1
/// machine steps done, and both seq-2 review packets open.
pub fn at_rereview(run_id: &str) -> ViewBuilder {
    at_first_review(run_id)
        .completed(Stage::ReviewClaude, 1, review(Verdict::RequestChanges))
        .completed(Stage::ReviewCodex, 1, review(Verdict::Approve))
        .packet(Stage::Fix, 1)
        .completed(Stage::Fix, 1, fix_ok())
        .op_done(MachineStage::ReGate, 1)
        .op_done(MachineStage::Push, 1)
        .packet(Stage::ReviewClaude, 2)
        .packet(Stage::ReviewCodex, 2)
}

/// What a recorded fake-port call looked like, including what it returned
/// where the assertion needs it.
#[derive(Debug, Clone, PartialEq)]
pub enum PortCall {
    /// `liveness(session)`.
    Liveness(String),
    /// `kill_confirmed(session)` and whether it returned `Killed`.
    KillConfirmed {
        /// The session argument, verbatim.
        session: String,
        /// Whether this call returned `KillOutcome::Killed`.
        returned_killed: bool,
    },
    /// `reclaim_lease(bead, holder, older_than_s)`.
    ReclaimLease {
        /// The bead argument.
        bead: String,
        /// The holder argument, verbatim.
        holder: String,
        /// The grace window.
        older_than_s: u64,
    },
    /// `commits_ahead(run_id)`.
    CommitsAhead(String),
    /// `rerun_gates(run_id, commands)`.
    RerunGates {
        /// The run.
        run_id: String,
        /// The commands, in order.
        commands: Vec<String>,
    },
    /// `quarantine(run_id, attempt_id, name, body)`.
    Quarantine {
        /// The run.
        run_id: String,
        /// The attempt custody is filed under.
        attempt_id: i64,
        /// The bare file name.
        name: String,
        /// The refused bytes.
        body: Vec<u8>,
    },
    /// `resolve_state(run_id)`.
    ResolveState(String),
    /// `pr_for_head(repo, head, base)`.
    PrForHead {
        /// The repo slug.
        repo: String,
        /// The head branch.
        head: String,
        /// The base branch.
        base: String,
    },
    /// `remote_sha(run_id, branch)`.
    RemoteSha {
        /// The run.
        run_id: String,
        /// The branch.
        branch: String,
    },
}

/// A recording fake: every method records its arguments and returns a
/// scripted value (or a realistic default when the script is empty).
#[derive(Default)]
pub struct FakePorts {
    /// Every call, in order.
    pub calls: Mutex<Vec<PortCall>>,
    /// Scripted liveness answers; default `Vanished`.
    pub liveness_script: Mutex<VecDeque<SessionLiveness>>,
    /// Scripted kill answers; default: first call `Killed`, later calls
    /// `AlreadyDead` (one process only dies once).
    pub kill_script: Mutex<VecDeque<KillOutcome>>,
    /// Scripted reclaim answers; default: first call per holder echoes the
    /// holder scoped, later calls return the empty refusal shape.
    pub reclaim_script: Mutex<VecDeque<LeaseReclaim>>,
    /// Scripted commits-ahead answers; default 0.
    pub commits_script: Mutex<VecDeque<u32>>,
    /// Scripted gate re-runs; default empty (vacuously passing).
    pub gates_script: Mutex<VecDeque<Vec<GateRow>>>,
    /// Scripted PR observations; default `None`.
    pub pr_script: Mutex<VecDeque<Option<PrSnapshot>>>,
    /// Scripted remote shas; default `None`.
    pub sha_script: Mutex<VecDeque<Option<String>>>,
    /// Scripted resolve states; default worktree present, no lease holder.
    pub resolve_script: Mutex<VecDeque<ResolveState>>,
}

impl FakePorts {
    /// A fresh silent fake.
    pub fn new() -> Self {
        Self::default()
    }

    fn push(&self, call: PortCall) {
        self.calls.lock().expect("calls lock").push(call);
    }

    /// The recorded calls, cloned.
    pub fn recorded(&self) -> Vec<PortCall> {
        self.calls.lock().expect("calls lock").clone()
    }
}

#[async_trait::async_trait]
impl ReconcilePorts for FakePorts {
    async fn liveness(&self, session: &str) -> Result<SessionLiveness, PortError> {
        self.push(PortCall::Liveness(session.to_owned()));
        let scripted = self.liveness_script.lock().expect("lock").pop_front();
        Ok(scripted.unwrap_or(SessionLiveness::Vanished))
    }

    async fn kill_confirmed(&self, session: &str) -> Result<KillOutcome, PortError> {
        let scripted = self.kill_script.lock().expect("lock").pop_front();
        let outcome = scripted.unwrap_or_else(|| {
            let killed_before = self.calls.lock().expect("lock").iter().any(|c| {
                matches!(
                    c,
                    PortCall::KillConfirmed {
                        returned_killed: true,
                        ..
                    }
                )
            });
            if killed_before {
                KillOutcome::AlreadyDead
            } else {
                KillOutcome::Killed
            }
        });
        self.push(PortCall::KillConfirmed {
            session: session.to_owned(),
            returned_killed: outcome == KillOutcome::Killed,
        });
        Ok(outcome)
    }

    async fn reclaim_lease(
        &self,
        bead: &str,
        holder: &str,
        older_than_s: u64,
    ) -> Result<LeaseReclaim, PortError> {
        let scripted = self.reclaim_script.lock().expect("lock").pop_front();
        let outcome =
            scripted.unwrap_or_else(|| {
                let reclaimed_before =
                    self.calls.lock().expect("lock").iter().any(
                        |c| matches!(c, PortCall::ReclaimLease { holder: h, .. } if h == holder),
                    );
                if reclaimed_before {
                    LeaseReclaim {
                        scoped: true,
                        previous_owner: None,
                    }
                } else {
                    LeaseReclaim {
                        scoped: true,
                        previous_owner: Some(holder.to_owned()),
                    }
                }
            });
        self.push(PortCall::ReclaimLease {
            bead: bead.to_owned(),
            holder: holder.to_owned(),
            older_than_s,
        });
        Ok(outcome)
    }

    async fn commits_ahead(&self, run_id: &str) -> Result<u32, PortError> {
        self.push(PortCall::CommitsAhead(run_id.to_owned()));
        Ok(self
            .commits_script
            .lock()
            .expect("lock")
            .pop_front()
            .unwrap_or(0))
    }

    async fn rerun_gates(
        &self,
        run_id: &str,
        commands: &[String],
    ) -> Result<Vec<GateRow>, PortError> {
        self.push(PortCall::RerunGates {
            run_id: run_id.to_owned(),
            commands: commands.to_vec(),
        });
        Ok(self
            .gates_script
            .lock()
            .expect("lock")
            .pop_front()
            .unwrap_or_default())
    }

    async fn quarantine(
        &self,
        run_id: &str,
        attempt_id: i64,
        name: &str,
        body: &[u8],
    ) -> Result<(), PortError> {
        self.push(PortCall::Quarantine {
            run_id: run_id.to_owned(),
            attempt_id,
            name: name.to_owned(),
            body: body.to_vec(),
        });
        Ok(())
    }

    async fn resolve_state(&self, run_id: &str) -> Result<ResolveState, PortError> {
        self.push(PortCall::ResolveState(run_id.to_owned()));
        let scripted = self.resolve_script.lock().expect("lock").pop_front();
        Ok(scripted.unwrap_or(ResolveState {
            worktree_present: true,
            lease_holder: None,
        }))
    }

    async fn pr_for_head(
        &self,
        repo: &str,
        head: &str,
        base: &str,
    ) -> Result<Option<PrSnapshot>, PortError> {
        self.push(PortCall::PrForHead {
            repo: repo.to_owned(),
            head: head.to_owned(),
            base: base.to_owned(),
        });
        Ok(self
            .pr_script
            .lock()
            .expect("lock")
            .pop_front()
            .unwrap_or(None))
    }

    async fn remote_sha(&self, run_id: &str, branch: &str) -> Result<Option<String>, PortError> {
        self.push(PortCall::RemoteSha {
            run_id: run_id.to_owned(),
            branch: branch.to_owned(),
        });
        Ok(self
            .sha_script
            .lock()
            .expect("lock")
            .pop_front()
            .unwrap_or(None))
    }
}
