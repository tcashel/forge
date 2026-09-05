//! Machine failures spend repair budget before any new review or publication.

mod support;

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{AttemptState, PacketRow};
use forged_proto::{advance, GatePhase, MachineStage, NextAction, Terminal, TerminalAttempt};
use forged_types::{
    Capability, Deliverable, ExecutionPackageV1, Finding, HostPolicyV1, Outcome,
    ProfileDefinitionV1, ProfileRef, ProtocolRef, ProviderCandidateV1, ResolvedRosterV1, RoleId,
    RosterRef, Sandbox, SeatDefinitionV1, SeatId, SeatPurpose, Stage, StageContract, Verdict,
    WorkPacket,
};
use support::{ViewBuilder, T0};

fn role(value: &str) -> RoleId {
    RoleId::new(value).expect("role")
}

fn package() -> ExecutionPackageV1 {
    let protocol = ProtocolRef {
        name: "slice".to_owned(),
        version: 1,
    };
    let profile = ProfileDefinitionV1 {
        schema: "forged.profile/1".to_owned(),
        name: "test-slice".to_owned(),
        protocol: protocol.clone(),
        seats: vec![
            SeatDefinitionV1 {
                id: SeatId::new("implement").expect("seat"),
                role: role("implementation"),
                purpose: SeatPurpose::Implement,
            },
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
                    role("implementation"),
                    vec![candidate("codex", Sandbox::WorkspaceWrite)],
                ),
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
            seat_commands: Vec::new(),
            deadline_retry_budget: 1,
            seat_env: Default::default(),
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
        SeatPurpose::Implement => Deliverable::CommitsInWorktree,
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
            seat_commands: Vec::new(),
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
    let implement = one_intent(advance(&view));
    complete(
        &mut view,
        &implement,
        Outcome::Implement {
            implemented: true,
            commits_ahead: 1,
            summary: "candidate committed".to_owned(),
            gate_state: None,
            note: None,
        },
    );
    view
}

fn settle_machine(view: &mut forged_proto::RunView, step: MachineStage, round: u32, passed: bool) {
    let additions = ViewBuilder::new(&view.run.run_id)
        .op_done(step, round)
        .build();
    view.settled_operations.extend(additions.settled_operations);
    if matches!(step, MachineStage::Gate | MachineStage::ReGate) {
        view.proto_events.push(forged_proto::ProtoEvent::Gate {
            phase: if step == MachineStage::Gate {
                GatePhase::Gate
            } else {
                GatePhase::Regate
            },
            seq: i64::from(round),
            passed,
            rows: vec![support::gate_row(if passed { 0 } else { 1 })],
        });
    }
}

#[test]
fn failed_gate_repairs_before_push_pr_or_review_without_escalating() {
    let mut view = after_initial_gate("slice-gate-repair", false);
    let profile = &mut view.execution_package.as_mut().unwrap().profile;
    profile.escalate_on = vec![forged_types::EscalationTrigger::GateFailure];
    profile.escalate_to = Some(ProfileRef {
        name: "high".to_owned(),
        version: 1,
    });
    let fix = one_intent(advance(&view));
    assert_eq!(fix.execution.as_ref().unwrap().purpose, SeatPurpose::Fix);
    assert_eq!(fix.execution.as_ref().unwrap().round, 0);
    complete(
        &mut view,
        &fix,
        Outcome::Fix {
            applied: true,
            summary: "repaired gate".to_owned(),
        },
    );
    assert_eq!(advance(&view), NextAction::RunMachine(MachineStage::ReGate));
    settle_machine(&mut view, MachineStage::ReGate, 1, true);
    assert_eq!(advance(&view), NextAction::RunMachine(MachineStage::Push));
    settle_machine(&mut view, MachineStage::Push, 1, true);
    assert_eq!(
        advance(&view),
        NextAction::RunMachine(MachineStage::DraftPr)
    );
    settle_machine(&mut view, MachineStage::DraftPr, 0, true);
    let review_intent = one_intent(advance(&view));
    assert_eq!(
        review_intent.execution.as_ref().unwrap().purpose,
        SeatPurpose::Review
    );
    assert_eq!(review_intent.execution.as_ref().unwrap().round, 1);
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
fn failed_or_missing_gate_evidence_cannot_spend_review_tokens_with_no_repair_budget() {
    for missing in [false, true] {
        let mut view = after_initial_gate("slice-gate-stop", false);
        view.execution_package
            .as_mut()
            .unwrap()
            .profile
            .fix_round_budget = 0;
        if missing {
            view.proto_events.clear();
        }
        assert_eq!(
            advance(&view),
            NextAction::Stop(Terminal::ReviewBudgetExhausted {
                review_rounds: 0,
                final_verdict: None,
                final_verdict_is_durable: false,
                failed_review_seats: 0,
            })
        );
    }
}

#[test]
fn persisted_approval_against_failed_gate_cannot_complete_clean() {
    let mut view = after_initial_gate("slice-old-approval", true);
    settle_machine(&mut view, MachineStage::Push, 0, true);
    settle_machine(&mut view, MachineStage::DraftPr, 0, true);
    let review_intent = one_intent(advance(&view));
    complete(
        &mut view,
        &review_intent,
        review(Verdict::Approve, Vec::new()),
    );
    for event in &mut view.proto_events {
        if let forged_proto::ProtoEvent::Gate { passed, .. } = event {
            *passed = false;
        }
    }
    let fix = one_intent(advance(&view));
    assert_eq!(fix.execution.as_ref().unwrap().purpose, SeatPurpose::Fix);
    complete(
        &mut view,
        &fix,
        Outcome::Fix {
            applied: true,
            summary: "attempted fix".to_owned(),
        },
    );
    settle_machine(&mut view, MachineStage::ReGate, 1, false);
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::ReviewBudgetExhausted {
            review_rounds: 1,
            final_verdict: Some(Verdict::Approve),
            final_verdict_is_durable: true,
            failed_review_seats: 0,
        })
    );
}

#[test]
fn every_failed_gate_consumes_the_same_bounded_repair_budget() {
    let mut view = after_initial_gate("slice-budget", false);
    view.execution_package
        .as_mut()
        .unwrap()
        .profile
        .fix_round_budget = 2;
    for round in 0..2 {
        let fix = one_intent(advance(&view));
        assert_eq!(fix.execution.as_ref().unwrap().purpose, SeatPurpose::Fix);
        assert_eq!(fix.execution.as_ref().unwrap().round, round);
        complete(
            &mut view,
            &fix,
            Outcome::Fix {
                applied: true,
                summary: "attempted repair".to_owned(),
            },
        );
        assert_eq!(advance(&view), NextAction::RunMachine(MachineStage::ReGate));
        settle_machine(&mut view, MachineStage::ReGate, u32::from(round) + 1, false);
    }
    assert!(matches!(
        advance(&view),
        NextAction::Stop(Terminal::ReviewBudgetExhausted {
            review_rounds: 0,
            ..
        })
    ));
}

#[test]
fn old_pending_review_is_drained_without_opening_synthesis_or_a_writer() {
    let mut view = after_initial_gate("slice-old-live-review", true);
    settle_machine(&mut view, MachineStage::Push, 0, true);
    settle_machine(&mut view, MachineStage::DraftPr, 0, true);
    let review_intent = one_intent(advance(&view));
    complete(
        &mut view,
        &review_intent,
        review(Verdict::Approve, Vec::new()),
    );
    view.terminal_attempts
        .remove(review_intent.packet_id.as_ref().unwrap());
    for event in &mut view.proto_events {
        if let forged_proto::ProtoEvent::Gate { passed, .. } = event {
            *passed = false;
        }
    }
    view.execution_package
        .as_mut()
        .unwrap()
        .profile
        .seats
        .push(SeatDefinitionV1 {
            id: SeatId::new("synthesis").unwrap(),
            role: role("synthesis"),
            purpose: SeatPurpose::Synthesis,
        });
    assert!(
        matches!(advance(&view), NextAction::AwaitPacket { packet_id, .. }
        if Some(&packet_id) == review_intent.packet_id.as_ref())
    );
}
