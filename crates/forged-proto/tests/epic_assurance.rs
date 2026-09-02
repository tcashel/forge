//! Transition contract for the internal `epic-assurance/v1` protocol.

mod support;

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{AttemptState, PacketRow};
use forged_proto::{advance, GatePhase, MachineStage, NextAction, Terminal, TerminalAttempt};
use forged_types::{
    Capability, Deliverable, ExecutionPackageV1, Finding, HostPolicyV1, Outcome,
    ProfileDefinitionV1, ProfileRef, ProtocolRef, ProviderCandidateV1, ResolvedRosterV1, RoleId,
    RosterRef, Sandbox, SeatDefinitionV1, SeatId, SeatPurpose, Severity, Stage, StageContract,
    Verdict, WorkPacket,
};
use support::{ViewBuilder, T0};

fn role(value: &str) -> RoleId {
    RoleId::new(value).expect("role")
}

fn package() -> ExecutionPackageV1 {
    let protocol = ProtocolRef {
        name: "epic-assurance".to_owned(),
        version: 1,
    };
    let profile = ProfileDefinitionV1 {
        schema: "forged.profile/1".to_owned(),
        name: "test-assurance".to_owned(),
        protocol: protocol.clone(),
        seats: vec![
            SeatDefinitionV1 {
                id: SeatId::new("review").expect("seat"),
                role: role("review.primary"),
                purpose: SeatPurpose::Review,
            },
            SeatDefinitionV1 {
                id: SeatId::new("fix").expect("seat"),
                role: role("remediation"),
                purpose: SeatPurpose::Fix,
            },
        ],
        risk_context: "integrated epic".to_owned(),
        fix_round_budget: 1,
        escalate_on: Vec::new(),
        escalate_to: None,
    };
    let candidate = |provider: &str, sandbox| ProviderCandidateV1 {
        provider: provider.to_owned(),
        model: "test".to_owned(),
        effort: None,
        sandbox,
        capabilities: BTreeSet::from_iter(
            [
                Some(Capability::RepositoryRead),
                Some(Capability::StructuredOutput),
                (sandbox == Sandbox::WorkspaceWrite).then_some(Capability::RepositoryWrite),
            ]
            .into_iter()
            .flatten(),
        ),
    };
    let roster_ref = RosterRef {
        name: "test".to_owned(),
        version: 1,
    };
    ExecutionPackageV1 {
        schema: "forged.execution-package/1".to_owned(),
        protocol_ref: protocol,
        profile_ref: ProfileRef {
            name: profile.name.clone(),
            version: 1,
        },
        roster_ref: roster_ref.clone(),
        profile_sha256: "profile".to_owned(),
        roster_sha256: "roster".to_owned(),
        profile,
        profile_catalog: BTreeMap::new(),
        roster: ResolvedRosterV1 {
            schema: "forged.resolved-roster/1".to_owned(),
            roster_ref,
            roles: BTreeMap::from([
                (
                    role("review.primary"),
                    vec![candidate("codex", Sandbox::ReadOnly)],
                ),
                (
                    role("remediation"),
                    vec![candidate("claude", Sandbox::WorkspaceWrite)],
                ),
            ]),
        },
        policy: forged_types::ExecutionPolicyV1 {
            gate_commands: vec!["cargo test --workspace".to_owned()],
            stage_budget_s: [
                Stage::Implement,
                Stage::ReviewClaude,
                Stage::ReviewCodex,
                Stage::Fix,
            ]
            .into_iter()
            .map(|stage| (stage, 60))
            .collect(),
            transport_retry_budget: 1,
            termination_grace_s: forged_types::DEFAULT_TERMINATION_GRACE_S,
            host_policy: HostPolicyV1::Off,
            herdr_socket: None,
        },
    }
}

fn complete(
    view: &mut forged_proto::RunView,
    intent: &forged_proto::PacketIntent,
    outcome: Outcome,
) {
    let execution = intent.execution.clone().expect("semantic intent");
    let packet_id = intent.packet_id.clone().expect("semantic packet id");
    let deliverable = match execution.purpose {
        SeatPurpose::Review | SeatPurpose::Synthesis => Deliverable::ReviewBlock,
        SeatPurpose::Fix => Deliverable::FixCommitsPushed,
        SeatPurpose::Implement => panic!("assurance must never open implementation"),
    };
    let packet = WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: packet_id.clone(),
        run_id: view.run.run_id.clone(),
        work_id: view.run.work_id.clone(),
        stage: intent.stage,
        execution: Some(execution),
        lane_seq: Some(intent.seq),
        spec: forged_types::SpecRef {
            path: "assurance-input.md".to_owned(),
            sha256: "spec".to_owned(),
            revision: None,
        },
        worktree: "/tmp/worktree".into(),
        branch: "forged/epic".to_owned(),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "assure".to_owned(),
            gate_commands: vec!["cargo test --workspace".to_owned()],
            deliverable,
            budget_s: 60,
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: intent.hints.clone(),
        field_notes: Vec::new(),
    };
    view.packets.push(PacketRow {
        packet_id: packet_id.clone(),
        run_id: view.run.run_id.clone(),
        stage: intent.stage,
        seq: intent.seq,
        spec_path: "assurance-input.md".to_owned(),
        spec_sha256: "spec".to_owned(),
        spec_revision: None,
        policy_revision: None,
        body_json: packet.stored_body().expect("stored packet"),
        created_at: T0.to_owned(),
    });
    view.terminal_attempts.insert(
        packet_id,
        vec![TerminalAttempt {
            attempt_id: i64::try_from(view.packets.len()).expect("attempt id"),
            state: AttemptState::Completed,
            outcome: Some(outcome),
            fail_note: None,
            started_at: T0.to_owned(),
        }],
    );
}

fn review(verdict: Verdict, findings: Vec<Finding>) -> Outcome {
    Outcome::Review {
        verdict,
        summary: "assurance review".to_owned(),
        findings,
        available: true,
    }
}

fn one_intent(action: NextAction) -> forged_proto::PacketIntent {
    let NextAction::OpenPackets(mut intents) = action else {
        panic!("expected provider packet, got {action:?}");
    };
    assert_eq!(intents.len(), 1);
    intents.remove(0)
}

fn after_initial_gate(run_id: &str, passed: bool) -> forged_proto::RunView {
    let mut view = ViewBuilder::new(run_id)
        .op_done(MachineStage::Resolve, 0)
        .op_done(MachineStage::Gate, 0)
        .gate_event(GatePhase::Gate, passed)
        .build();
    view.execution_package = Some(package());
    view
}

#[test]
fn assurance_starts_with_gate_and_clean_review_completes_without_publish_steps() {
    let mut before_gate = ViewBuilder::new("assure-clean")
        .op_done(MachineStage::Resolve, 0)
        .build();
    before_gate.execution_package = Some(package());
    assert_eq!(
        advance(&before_gate),
        NextAction::RunMachine(MachineStage::Gate),
        "there is no implementation or initial push/PR step"
    );

    let mut view = after_initial_gate("assure-clean", true);
    let review_intent = one_intent(advance(&view));
    assert_eq!(review_intent.execution.as_ref().unwrap().round, 0);
    assert_eq!(
        review_intent.execution.as_ref().unwrap().purpose,
        SeatPurpose::Review
    );
    complete(
        &mut view,
        &review_intent,
        review(Verdict::Approve, Vec::new()),
    );
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            review_rounds: 1,
            final_verdict: Some(Verdict::Approve),
            final_verdict_is_durable: true,
            failed_review_seats: 0,
        })
    );
}

#[test]
fn failed_gate_forces_fix_regate_push_and_rereview() {
    let mut view = after_initial_gate("assure-repair", false);
    let first_review = one_intent(advance(&view));
    complete(
        &mut view,
        &first_review,
        review(Verdict::Approve, Vec::new()),
    );

    let fix = one_intent(advance(&view));
    assert_eq!(fix.execution.as_ref().unwrap().purpose, SeatPurpose::Fix);
    complete(
        &mut view,
        &fix,
        Outcome::Fix {
            applied: true,
            summary: "fixed gate".to_owned(),
        },
    );
    assert_eq!(advance(&view), NextAction::RunMachine(MachineStage::ReGate));

    view = {
        let mut rebuilt = view.clone();
        let additions = ViewBuilder::new("assure-repair")
            .op_done(MachineStage::ReGate, 1)
            .gate_event(GatePhase::Regate, true)
            .build();
        rebuilt
            .settled_operations
            .extend(additions.settled_operations);
        rebuilt.proto_events.extend(additions.proto_events);
        rebuilt
    };
    assert_eq!(advance(&view), NextAction::RunMachine(MachineStage::Push));
    let additions = ViewBuilder::new("assure-repair")
        .op_done(MachineStage::Push, 1)
        .build();
    view.settled_operations.extend(additions.settled_operations);
    view.proto_events.extend(additions.proto_events);

    let second_review = one_intent(advance(&view));
    assert_eq!(second_review.execution.as_ref().unwrap().round, 1);
    complete(
        &mut view,
        &second_review,
        review(Verdict::Approve, Vec::new()),
    );
    assert!(matches!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            review_rounds: 2,
            final_verdict: Some(Verdict::Approve),
            final_verdict_is_durable: true,
            ..
        })
    ));
}

#[test]
fn blocker_or_high_finding_is_not_a_clean_approval() {
    let mut view = after_initial_gate("assure-severe", true);
    let review_intent = one_intent(advance(&view));
    complete(
        &mut view,
        &review_intent,
        review(
            Verdict::Approve,
            vec![Finding {
                severity: Severity::High,
                file: Some("src/lib.rs".to_owned()),
                line: Some(7),
                message: "unresolved data-loss path".to_owned(),
            }],
        ),
    );
    let fix = one_intent(advance(&view));
    assert_eq!(fix.execution.as_ref().unwrap().purpose, SeatPurpose::Fix);
}

#[test]
fn approval_cannot_complete_against_a_failed_regate() {
    let mut view = after_initial_gate("assure-regate-failed", true);
    let first_review = one_intent(advance(&view));
    complete(
        &mut view,
        &first_review,
        review(Verdict::RequestChanges, Vec::new()),
    );
    let fix = one_intent(advance(&view));
    complete(
        &mut view,
        &fix,
        Outcome::Fix {
            applied: true,
            summary: "attempted repair".to_owned(),
        },
    );

    let additions = ViewBuilder::new("assure-regate-failed")
        .op_done(MachineStage::ReGate, 1)
        .gate_event(GatePhase::Regate, false)
        .op_done(MachineStage::Push, 1)
        .build();
    view.settled_operations.extend(additions.settled_operations);
    view.proto_events.extend(additions.proto_events);
    let second_review = one_intent(advance(&view));
    complete(
        &mut view,
        &second_review,
        review(Verdict::Approve, Vec::new()),
    );

    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::ReviewBudgetExhausted {
            review_rounds: 2,
            final_verdict: Some(Verdict::Approve),
            final_verdict_is_durable: true,
            failed_review_seats: 0,
        })
    );
}
