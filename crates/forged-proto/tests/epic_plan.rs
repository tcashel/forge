//! Provider-neutral contract fixture for the closed, nonpublishing
//! `epic-plan/v1` transition graph.

mod support;

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{AttemptState, PacketRow};
use forged_proto::{advance, MachineStage, NextAction, Terminal, TerminalAttempt};
use forged_types::{
    Capability, Deliverable, ExecutionPackageV1, HostPolicyV1, NativeWorkSpecV1, Outcome,
    ProfileDefinitionV1, ProfileRef, ProtocolRef, ProviderCandidateV1, ResolvedRosterV1, RoleId,
    RosterRef, Sandbox, SeatDefinitionV1, SeatId, SeatPurpose, SpecAmendment, Stage, StageContract,
    Verdict, WorkPacket,
};
use support::{ViewBuilder, T0};

fn role(value: &str) -> RoleId {
    RoleId::new(value).expect("role")
}

fn package() -> ExecutionPackageV1 {
    let protocol = ProtocolRef {
        name: "epic-plan".to_owned(),
        version: 1,
    };
    let profile = ProfileDefinitionV1 {
        schema: "forged.profile/1".to_owned(),
        name: "test-epic-plan".to_owned(),
        protocol: protocol.clone(),
        seats: vec![
            SeatDefinitionV1 {
                id: SeatId::new("plan-author").expect("seat"),
                role: role("assessment"),
                purpose: SeatPurpose::Implement,
            },
            SeatDefinitionV1 {
                id: SeatId::new("plan-critic").expect("seat"),
                role: role("review.primary"),
                purpose: SeatPurpose::Review,
            },
            SeatDefinitionV1 {
                id: SeatId::new("plan-revision").expect("seat"),
                role: role("assessment"),
                purpose: SeatPurpose::Fix,
            },
        ],
        risk_context: "routine".to_owned(),
        fix_round_budget: 1,
        escalate_on: Vec::new(),
        escalate_to: None,
    };
    let candidate = |provider: &str| ProviderCandidateV1 {
        provider: provider.to_owned(),
        model: "test".to_owned(),
        effort: None,
        sandbox: Sandbox::ReadOnly,
        capabilities: BTreeSet::from([Capability::RepositoryRead, Capability::StructuredOutput]),
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
                (role("assessment"), vec![candidate("claude")]),
                (role("review.primary"), vec![candidate("codex")]),
            ]),
        },
        policy: forged_types::ExecutionPolicyV1 {
            gate_commands: vec!["must-not-run".to_owned()],
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
    let packet = WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: packet_id.clone(),
        run_id: view.run.run_id.clone(),
        work_id: view.run.work_id.clone(),
        stage: intent.stage,
        execution: Some(execution),
        lane_seq: Some(intent.seq),
        spec: forged_types::SpecRef {
            path: "planning-input.md".to_owned(),
            sha256: "spec".to_owned(),
            revision: None,
        },
        worktree: "/tmp/worktree".into(),
        branch: "forged/plan".to_owned(),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "plan".to_owned(),
            gate_commands: Vec::new(),
            deliverable: Deliverable::NativeWorkSpec,
            budget_s: 60,
        },
        result_schema: "forged.result.epic-plan/1".to_owned(),
        provider_hints: intent.hints.clone(),
        field_notes: Vec::new(),
    };
    view.packets.push(PacketRow {
        packet_id: packet_id.clone(),
        run_id: view.run.run_id.clone(),
        stage: intent.stage,
        seq: intent.seq,
        spec_path: "planning-input.md".to_owned(),
        spec_sha256: "spec".to_owned(),
        spec_revision: None,
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

fn plan(label: &str) -> Outcome {
    Outcome::Plan {
        spec: NativeWorkSpecV1 {
            description: format!("description {label}"),
            acceptance_criteria: "observable acceptance".to_owned(),
            design: "minimal design".to_owned(),
            notes: "no scope expansion".to_owned(),
        },
        traceability: forged_types::PlanTraceabilityV1 {
            assumptions: Vec::new(),
            requirements: vec!["frozen root requirement".to_owned()],
        },
        cruxes: Vec::new(),
    }
}

fn one_intent(action: NextAction) -> forged_proto::PacketIntent {
    let NextAction::OpenPackets(mut intents) = action else {
        panic!("expected provider packet, got {action:?}");
    };
    assert_eq!(intents.len(), 1);
    intents.remove(0)
}

#[test]
fn planning_revises_and_re_reviews_without_gate_push_or_pr() {
    let mut view = ViewBuilder::new("plan-run")
        .op_done(MachineStage::Resolve, 0)
        .build();
    view.execution_package = Some(package());

    let author = one_intent(advance(&view));
    assert_eq!(author.stage, Stage::Implement);
    assert_eq!(author.hints.sandbox, Sandbox::ReadOnly);
    complete(&mut view, &author, plan("initial"));

    let critic = one_intent(advance(&view));
    assert!(matches!(
        critic.stage,
        Stage::ReviewClaude | Stage::ReviewCodex
    ));
    complete(
        &mut view,
        &critic,
        Outcome::Review {
            verdict: Verdict::RequestChanges,
            summary: "one bounded gap".to_owned(),
            findings: vec![forged_types::Finding {
                severity: forged_types::Severity::High,
                file: None,
                line: None,
                message: "Requirement R1 lacks an observable readback; add it".to_owned(),
            }],
            available: true,
        },
    );

    let revision = one_intent(advance(&view));
    assert_eq!(revision.stage, Stage::Fix);
    assert_eq!(revision.hints.sandbox, Sandbox::ReadOnly);
    complete(&mut view, &revision, plan("revised"));

    let re_review = one_intent(advance(&view));
    complete(
        &mut view,
        &re_review,
        Outcome::Review {
            verdict: Verdict::Approve,
            summary: "complete".to_owned(),
            findings: Vec::new(),
            available: true,
        },
    );
    assert_eq!(
        advance(&view),
        NextAction::Stop(Terminal::Done {
            review_rounds: 2,
            final_verdict: Some(Verdict::Approve),
            final_verdict_is_durable: true,
            failed_review_seats: 0,
        })
    );
}

#[test]
fn blocking_critique_stops_for_operator_instead_of_opening_revision() {
    let mut view = ViewBuilder::new("blocked-plan")
        .op_done(MachineStage::Resolve, 0)
        .build();
    view.execution_package = Some(package());

    let author = one_intent(advance(&view));
    complete(&mut view, &author, plan("initial"));
    let critic = one_intent(advance(&view));
    complete(
        &mut view,
        &critic,
        Outcome::SpecAmendment {
            amendment: SpecAmendment {
                summary: "root authority must change".to_owned(),
                evidence: "frozen root excludes the required dependency mutation".to_owned(),
                proposed_change: "authorize dependency mutation or remove the requirement"
                    .to_owned(),
            },
        },
    );

    let NextAction::Stop(Terminal::SpecAmendmentProposed { amendment, .. }) = advance(&view) else {
        panic!("blocking critique must stop for input");
    };
    assert_eq!(
        amendment.evidence,
        "frozen root excludes the required dependency mutation"
    );
    assert_eq!(
        amendment.proposed_change,
        "authorize dependency mutation or remove the requirement"
    );
}
