use std::path::PathBuf;
use std::sync::{Arc, Barrier};

use forged_ledger::{
    DesiredSubjectKind, HerdrLayoutCreation, HerdrProjectionChannel,
    HerdrProjectionPublicationState, Ledger, NewPacket, NewRun, SpecFence,
};
use forged_types::{
    claude_session_id, Deliverable, HerdrLayoutSubjectKind, HerdrLayoutSubjectV1, HerdrLayoutV1,
    HerdrProjectionLifecycle, HerdrProjectionTargetKind, HerdrSessionEvidenceSource,
    OwnedHerdrOwnerV1, OwnedHerdrSessionV1, OwnedHerdrSubjectKind, OwnedHerdrSubjectV1,
    ProviderHints, RunId, Sandbox, SpecRef, Stage, StageContract, WorkPacket,
    HERDR_LAYOUT_SCHEMA_V1, OWNED_HERDR_SESSION_SCHEMA_V1,
};

const NOW: &str = "2026-08-15T00:00:00.000000000Z";
const SOON: &str = "2026-08-15T00:01:00.000000000Z";
const LATER: &str = "2099-08-15T00:00:00.000000000Z";
const FAR: &str = "2100-08-15T00:00:00.000000000Z";

fn seed(ledger: &Ledger) -> (String, i64, String) {
    let run = "projection-run";
    ledger
        .create_run(NewRun {
            run_id: RunId::new(run).unwrap(),
            work_id: "bead-projection".into(),
            repo: "/repo/forge".into(),
            base_ref: "main".into(),
            branch: "work/projection".into(),
        })
        .unwrap();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, run, 1)
        .unwrap();
    let packet_id = format!("{run}/implement/1");
    let packet = WorkPacket {
        schema: "forged.packet/1".into(),
        packet_id: packet_id.clone(),
        run_id: run.into(),
        work_id: "bead-projection".into(),
        stage: Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: SpecRef {
            path: "spec.md".into(),
            sha256: "body".into(),
            revision: None,
        },
        worktree: PathBuf::from("/tmp/worktree"),
        branch: "work/projection".into(),
        base_ref: "main".into(),
        contract: StageContract {
            instructions: "implement".into(),
            gate_commands: vec![],
            deliverable: Deliverable::CommitsInWorktree,
            budget_s: 60,
            seat_commands: Vec::new(),
        },
        result_schema: "forged.result/1".into(),
        provider_hints: ProviderHints {
            provider: "claude".into(),
            model: "sonnet".into(),
            effort: None,
            sandbox: Sandbox::WorkspaceWrite,
            env: Default::default(),
        },
        field_notes: vec![],
    };
    let opened = ledger
        .open_packet(NewPacket {
            run_id: run.into(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".into(),
            spec_sha256: "body".into(),
            spec_revision: None,
            policy_revision: None,
            body_json: packet.stored_body().unwrap(),
        })
        .unwrap();
    assert_eq!(opened, packet_id);
    let claim = ledger
        .claim_packet(&opened, "provider:test", &SpecFence::Sha256("body".into()))
        .unwrap();
    (opened, claim.attempt_id, claim.claim_token)
}

#[test]
fn exact_targets_candidate_confirmation_sequences_and_terminal_release_are_durable() {
    let dir = tempfile::tempdir().unwrap();
    let ledger = Ledger::open(&dir.path().join("state.db")).unwrap();
    let (packet_id, attempt_id, claim) = seed(&ledger);

    let controller = OwnedHerdrSessionV1 {
        schema: OWNED_HERDR_SESSION_SCHEMA_V1.into(),
        ownership_id: "owner-controller".into(),
        owner: OwnedHerdrOwnerV1::Controller {
            subject: OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: "projection-run".into(),
            },
            generation: 1,
        },
        pane_id: "pane-controller".into(),
        socket_path: "/tmp/herdr.sock".into(),
        protocol: 19,
        sentinel_path: "/tmp/controller.status".into(),
        layout_id: None,
    };
    ledger.register_owned_herdr_session(&controller).unwrap();
    let attempt = OwnedHerdrSessionV1 {
        schema: OWNED_HERDR_SESSION_SCHEMA_V1.into(),
        ownership_id: "owner-attempt".into(),
        owner: OwnedHerdrOwnerV1::Attempt {
            subject: OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: "projection-run".into(),
            },
            run_id: "projection-run".into(),
            packet_id: packet_id.clone(),
            attempt_id,
            claim_token: claim.clone(),
            controller_generation: Some(1),
        },
        pane_id: "pane-attempt".into(),
        socket_path: "/tmp/herdr.sock".into(),
        protocol: 19,
        sentinel_path: "/tmp/attempt.status".into(),
        layout_id: None,
    };
    ledger.register_owned_herdr_session(&attempt).unwrap();
    ledger
        .mark_owned_herdr_command_started("owner-attempt")
        .unwrap();

    let layout_subject = HerdrLayoutSubjectV1 {
        kind: HerdrLayoutSubjectKind::Run,
        id: "projection-run".into(),
    };
    let HerdrLayoutCreation::Reserved(layout) = ledger
        .reserve_herdr_layout_creation(
            layout_subject.clone(),
            "/tmp/herdr.sock",
            19,
            "workspace-1",
            "Projection run [run:projection-run]",
            "layout-token",
            NOW,
            SOON,
        )
        .unwrap()
    else {
        panic!("layout reservation")
    };
    ledger
        .register_herdr_layout(
            &HerdrLayoutV1 {
                schema: HERDR_LAYOUT_SCHEMA_V1.into(),
                layout_id: layout.layout_id.clone(),
                revision: layout.revision,
                subject: layout_subject,
                socket_path: layout.socket_path,
                protocol: 19,
                workspace_id: layout.workspace_id,
                tab_id: "tab-1".into(),
                root_pane_id: "pane-anchor".into(),
                display_label: layout.display_label,
                predecessor_layout_id: None,
            },
            "layout-token",
        )
        .unwrap();

    assert_eq!(ledger.refresh_herdr_pane_projections().unwrap(), (3, 0));
    let rows = ledger
        .list_herdr_projections_for_subject(
            forged_types::WorkIdentitySubjectKind::Run,
            "projection-run",
        )
        .unwrap();
    assert_eq!(rows.len(), 3);
    assert!(rows
        .iter()
        .any(|row| row.target_kind() == HerdrProjectionTargetKind::Anchor));
    assert!(rows.iter().any(|row| {
        row.target_kind() == HerdrProjectionTargetKind::Controller
            && row.identity.lifecycle_source.is_none()
    }));
    let attempt_row = ledger
        .get_herdr_projection_for_ownership("owner-attempt")
        .unwrap()
        .unwrap();
    assert_eq!(
        attempt_row.session_candidate.as_deref(),
        Some(claude_session_id(&claim).as_str())
    );
    assert_eq!(
        attempt_row.desired_lifecycle,
        Some(HerdrProjectionLifecycle::Working)
    );
    assert!(!attempt_row
        .identity
        .lifecycle_source
        .as_deref()
        .unwrap()
        .starts_with("herdr:"));

    ledger
        .confirm_herdr_provider_session(
            "owner-attempt",
            "wrong",
            HerdrSessionEvidenceSource::ClaudeOutput,
        )
        .unwrap();
    assert!(ledger
        .get_herdr_projection_for_ownership("owner-attempt")
        .unwrap()
        .unwrap()
        .session_confirmed
        .is_none());
    let candidate = claude_session_id(&claim);
    let confirmed = ledger
        .confirm_herdr_provider_session(
            "owner-attempt",
            &candidate,
            HerdrSessionEvidenceSource::ClaudeOutput,
        )
        .unwrap()
        .unwrap();
    assert_eq!(
        confirmed.session_confirmed.as_deref(),
        Some(candidate.as_str())
    );

    let projection_id = confirmed.identity.projection_id.clone();
    let barrier = Arc::new(Barrier::new(4));
    let mut workers = Vec::new();
    for index in 0..4 {
        let contender = ledger.clone();
        let barrier = Arc::clone(&barrier);
        let projection_id = projection_id.clone();
        workers.push(std::thread::spawn(move || {
            let token = format!("worker-{index}");
            barrier.wait();
            let claim = contender
                .claim_herdr_projection_effect(
                    &projection_id,
                    HerdrProjectionChannel::Metadata,
                    &token,
                    LATER,
                    FAR,
                )
                .unwrap();
            (token, claim)
        }));
    }
    let winners = workers
        .into_iter()
        .map(|worker| worker.join().unwrap())
        .filter(|(_, claim)| claim.is_some())
        .collect::<Vec<_>>();
    assert_eq!(winners.len(), 1);
    let (first_token, first) = winners.into_iter().next().unwrap();
    let first = first.unwrap();
    assert_eq!(first.sequence, 1);
    ledger
        .retry_herdr_projection_effect(
            &projection_id,
            HerdrProjectionChannel::Metadata,
            &first_token,
            "lost response",
        )
        .unwrap();
    let second = ledger
        .claim_herdr_projection_effect(
            &projection_id,
            HerdrProjectionChannel::Metadata,
            "worker-2",
            FAR,
            "2101-08-15T00:00:00.000000000Z",
        )
        .unwrap()
        .unwrap();
    assert_eq!(second.sequence, 2);
    let applied = ledger
        .finish_herdr_projection_effect(
            &projection_id,
            HerdrProjectionChannel::Metadata,
            "worker-2",
            second.sequence,
            second.desired_revision,
            false,
        )
        .unwrap();
    assert_eq!(
        applied.metadata_state,
        HerdrProjectionPublicationState::Applied
    );

    ledger
        .fail_packet(&packet_id, &claim, "provider failed")
        .unwrap();
    assert_eq!(ledger.refresh_herdr_pane_projections().unwrap().1, 1);
    let terminal = ledger
        .get_herdr_projection_for_ownership("owner-attempt")
        .unwrap()
        .unwrap();
    assert!(terminal.desired_release);
    assert_eq!(
        terminal.desired_lifecycle,
        Some(HerdrProjectionLifecycle::Unknown)
    );
}

#[test]
fn unknown_stored_vocabulary_fails_closed() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).unwrap();
    let (packet_id, attempt_id, claim) = seed(&ledger);
    let attempt = OwnedHerdrSessionV1 {
        schema: OWNED_HERDR_SESSION_SCHEMA_V1.into(),
        ownership_id: "owner-corrupt".into(),
        owner: OwnedHerdrOwnerV1::Attempt {
            subject: OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: "projection-run".into(),
            },
            run_id: "projection-run".into(),
            packet_id,
            attempt_id,
            claim_token: claim,
            controller_generation: Some(1),
        },
        pane_id: "pane-corrupt".into(),
        socket_path: "/tmp/herdr.sock".into(),
        protocol: 19,
        sentinel_path: "/tmp/corrupt.status".into(),
        layout_id: None,
    };
    ledger.register_owned_herdr_session(&attempt).unwrap();
    ledger.refresh_herdr_pane_projections().unwrap();
    ledger.close().unwrap();

    let conn = rusqlite::Connection::open(&path).unwrap();
    conn.execute_batch(
        "PRAGMA ignore_check_constraints=ON;
         DROP TRIGGER herdr_projection_identity_immutable;
         UPDATE herdr_pane_projections SET target_kind='legacy-pane';",
    )
    .unwrap();
    drop(conn);
    let ledger = Ledger::open(&path).unwrap();
    assert!(ledger
        .list_herdr_projections_for_subject(
            forged_types::WorkIdentitySubjectKind::Run,
            "projection-run",
        )
        .is_err());
}
