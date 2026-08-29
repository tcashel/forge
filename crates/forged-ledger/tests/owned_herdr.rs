use std::sync::{Arc, Barrier};

use forged_ledger::{
    AdmissionBatchWrite, DesiredReconcileOutcome, DesiredState, DesiredSubjectKind, Ledger,
    NewPacket, NewRun, OwnedHerdrCleanupReason, OwnedHerdrCleanupRelease, OwnedHerdrCleanupRetry,
    OwnedHerdrCleanupState, OwnedHerdrLifecycleState, SpecFence,
};
use forged_types::{
    AdmissionCandidateV1, AdmissionDecisionV1, AdmissionInputsV1, AdmissionOutcome,
    AdmissionReason, AdmissionResourceClass, AdmissionSubjectKind, ErrorCode, OwnedHerdrOwnerV1,
    OwnedHerdrSessionV1, OwnedHerdrSubjectKind, OwnedHerdrSubjectV1, RunId, Stage,
    ADMISSION_DECISION_SCHEMA_V1, ADMISSION_INPUTS_SCHEMA_V1, OWNED_HERDR_SESSION_SCHEMA_V1,
};

fn seed_attempt(ledger: &Ledger, run: &str, generation: Option<u32>) -> (String, i64, String) {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(run).expect("run id"),
            work_id: format!("bead-{run}"),
            repo: "/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: format!("work/{run}"),
        })
        .expect("run");
    let packet = ledger
        .open_packet(NewPacket {
            run_id: run.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "body".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("packet");
    if let Some(generation) = generation {
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, run, generation)
            .expect("desired");
    }
    let claim = ledger
        .claim_packet(
            &packet,
            "provider:test:1",
            &SpecFence::Sha256("body".to_owned()),
        )
        .expect("claim");
    (packet, claim.attempt_id, claim.claim_token)
}

fn attempt_identity(
    ownership_id: &str,
    run: &str,
    packet: &str,
    attempt_id: i64,
    claim_token: &str,
    generation: Option<u32>,
) -> OwnedHerdrSessionV1 {
    OwnedHerdrSessionV1 {
        schema: OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
        ownership_id: ownership_id.to_owned(),
        owner: OwnedHerdrOwnerV1::Attempt {
            subject: OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: run.to_owned(),
            },
            run_id: run.to_owned(),
            packet_id: packet.to_owned(),
            attempt_id,
            claim_token: claim_token.to_owned(),
            controller_generation: generation,
        },
        pane_id: "pane '$unsafe/../id'".to_owned(),
        socket_path: "/tmp/herdr socket.sock".to_owned(),
        protocol: 19,
        sentinel_path: "/tmp/sentinel dir/$opaque/status".to_owned(),
        layout_id: None,
    }
}

fn controller_identity(id: &str, run: &str, generation: u32) -> OwnedHerdrSessionV1 {
    OwnedHerdrSessionV1 {
        schema: OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
        ownership_id: id.to_owned(),
        owner: OwnedHerdrOwnerV1::Controller {
            subject: OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: run.to_owned(),
            },
            generation,
        },
        pane_id: format!("pane-controller-{generation}"),
        socket_path: "/tmp/herdr.sock".to_owned(),
        protocol: 19,
        sentinel_path: format!("/tmp/exact controller/{generation}/status"),
        layout_id: None,
    }
}

fn insert_controller_fixture(
    path: &std::path::Path,
    ownership_id: &str,
    run: &str,
    generation: u32,
    lifecycle: &str,
) {
    let conn = rusqlite::Connection::open(path).expect("open fixture database");
    conn.execute(
        "INSERT INTO owned_herdr_sessions (
           ownership_id, schema, owner_kind, subject_kind, subject_id,
           controller_generation, pane_id, socket_path, protocol, sentinel_path,
           lifecycle_state, cleanup_state, cleanup_retry_budget,
           cleanup_retry_used, registered_at, command_started_at, updated_at
         ) VALUES (?1, 'forged.owned-herdr-session/1', 'controller', 'run', ?2,
                   ?3, ?4, '/tmp/herdr.sock', 19, ?5, ?6, 'not-requested',
                   8, 0, '2026-01-01T00:00:00.000000000Z', ?7,
                   '2026-01-01T00:00:00.000000000Z')",
        rusqlite::params![
            ownership_id,
            run,
            i64::from(generation),
            format!("pane-{ownership_id}"),
            format!("/tmp/{ownership_id}/status"),
            lifecycle,
            (lifecycle == "command-started").then_some("2026-01-01T00:00:01.000000000Z"),
        ],
    )
    .expect("insert controller fixture");
}

#[test]
fn exact_active_controller_reservation_authorizes_pre_spawn_registration() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    let run = "controller-preauth";
    ledger
        .create_run(NewRun {
            run_id: RunId::new(run).expect("run id"),
            work_id: "bead-controller-preauth".to_owned(),
            repo: "/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "work/controller-preauth".to_owned(),
        })
        .expect("run");
    let snapshot = ledger
        .admission_snapshot(Some((DesiredSubjectKind::Run, run.to_owned())))
        .expect("snapshot");
    let capacity = snapshot.capacity.clone();
    let candidate = AdmissionCandidateV1 {
        subject_kind: AdmissionSubjectKind::Run,
        subject_id: run.to_owned(),
        control_revision: 0,
        work_id: "bead-controller-preauth".to_owned(),
        work_revision: Some("rev-1".to_owned()),
        work_status: Some("open".to_owned()),
        priority: Some(1),
        repository: "/repo".to_owned(),
        work_repository: Some("/repo".to_owned()),
        input_error: None,
        desired_wake_at: None,
        provider: Some("codex".to_owned()),
        model: Some("gpt-test".to_owned()),
        resource_class: AdmissionResourceClass::RepositoryWrite,
        authorized_at: snapshot.as_of.clone(),
    };
    let decision = AdmissionDecisionV1 {
        schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
        batch_id: "controller-preauth-batch".to_owned(),
        subject_kind: AdmissionSubjectKind::Run,
        subject_id: run.to_owned(),
        control_revision: 0,
        repository: "/repo".to_owned(),
        priority: Some(1),
        provider: Some("codex".to_owned()),
        model: Some("gpt-test".to_owned()),
        resource_class: AdmissionResourceClass::RepositoryWrite,
        outcome: AdmissionOutcome::Admitted,
        reason: AdmissionReason::CapacityAvailable,
        policy_revision: "policy-v1".to_owned(),
        evidence: capacity.clone(),
        next_eligible_wake_at: None,
    };
    let reservation = ledger
        .commit_admission_batch(AdmissionBatchWrite {
            inputs: AdmissionInputsV1 {
                schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
                as_of: snapshot.as_of,
                policy_revision: "policy-v1".to_owned(),
                ledger_revision: snapshot.ledger_revision,
                candidates: vec![candidate],
                capacity,
                spend: snapshot.spend,
                latest_rate_limits: snapshot.latest_rate_limits,
            },
            decisions: vec![decision],
            recovery_deadline: "2099-01-01T00:00:00.000000000Z".to_owned(),
        })
        .expect("commit admission")
        .into_iter()
        .next()
        .expect("reservation");
    ledger
        .activate_admission_reservation(
            &reservation.reservation_id,
            "controller",
            "run:controller-preauth:1",
        )
        .expect("activate exact controller reservation");

    ledger
        .register_owned_herdr_session(&controller_identity("own-preauth", run, 1))
        .expect("exact active reservation authorizes registration");
    assert!(ledger
        .register_owned_herdr_session(&controller_identity("own-wrong-generation", run, 2))
        .is_err());
}

#[test]
fn registered_without_start_becomes_due_only_after_atomic_attempt_settlement() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    let (packet, attempt_id, claim) = seed_attempt(&ledger, "run-unstarted", None);
    let identity = attempt_identity(
        "own-unstarted",
        "run-unstarted",
        &packet,
        attempt_id,
        &claim,
        None,
    );
    let registered = ledger
        .register_owned_herdr_session(&identity)
        .expect("register before start");
    assert_eq!(
        registered.lifecycle_state,
        OwnedHerdrLifecycleState::Registered
    );
    assert_eq!(registered.identity().expect("identity"), identity);
    assert!(ledger
        .list_due_owned_herdr_cleanup("2099-01-01T00:00:00.000000000Z", 10)
        .expect("due")
        .is_empty());

    ledger
        .fail_packet(&packet, &claim, "settled")
        .expect("settle");
    let row = ledger
        .get_owned_herdr_session("own-unstarted")
        .expect("get")
        .expect("row");
    assert_eq!(row.lifecycle_state, OwnedHerdrLifecycleState::OwnerTerminal);
    assert_eq!(row.cleanup_state, OwnedHerdrCleanupState::Pending);
    assert!(
        row.command_started_at.is_none(),
        "must not invent start evidence"
    );
    assert_eq!(
        ledger
            .list_due_owned_herdr_cleanup("2099-01-01T00:00:00.000000000Z", 10)
            .expect("due")
            .len(),
        1
    );
}

#[test]
fn running_and_revoking_attempts_never_authorize_close_then_pane_not_found_releases() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    let (packet, attempt_id, claim) = seed_attempt(&ledger, "run-live", Some(1));
    let identity = attempt_identity("own-live", "run-live", &packet, attempt_id, &claim, Some(1));
    ledger
        .register_owned_herdr_session(&identity)
        .expect("register");
    ledger
        .mark_owned_herdr_command_started("own-live")
        .expect("started");
    assert!(ledger
        .list_due_owned_herdr_cleanup("2099-01-01T00:00:00.000000000Z", 10)
        .expect("due")
        .is_empty());
    ledger
        .revoke_attempt(attempt_id, "operator stop")
        .expect("revoking");
    assert!(ledger
        .list_due_owned_herdr_cleanup("2099-01-01T00:00:00.000000000Z", 10)
        .expect("due")
        .is_empty());
    ledger.mark_stopped(attempt_id).expect("terminal");
    let due = ledger
        .list_due_owned_herdr_cleanup("2099-01-01T00:00:00.000000000Z", 10)
        .expect("due");
    assert_eq!(due.len(), 1);
    let claimed = ledger
        .claim_owned_herdr_cleanup(
            "own-live",
            "cleanup-1",
            "2099-01-01T00:00:00.000000000Z",
            "2099-01-01T00:01:00.000000000Z",
        )
        .expect("claim")
        .expect("won");
    assert_eq!(claimed.sentinel_path, identity.sentinel_path);
    let released = ledger
        .ack_owned_herdr_cleanup(
            "own-live",
            "cleanup-1",
            OwnedHerdrCleanupRelease::PaneNotFound,
        )
        .expect("ack missing");
    assert_eq!(released.cleanup_state, OwnedHerdrCleanupState::Released);
    assert_eq!(
        released.cleanup_release,
        Some(OwnedHerdrCleanupRelease::PaneNotFound)
    );
}

#[test]
fn exact_controller_generation_and_terminal_state_gate_cleanup() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, "controller-run", 2)
        .expect("desired");
    let identity = controller_identity("own-controller", "controller-run", 2);
    ledger
        .register_owned_herdr_session(&identity)
        .expect("register");
    ledger
        .mark_owned_herdr_command_started("own-controller")
        .expect("started");
    assert!(ledger
        .request_owned_herdr_controller_cleanup(
            "own-controller",
            DesiredSubjectKind::Run,
            "controller-run",
            1,
            OwnedHerdrCleanupReason::ControllerDead,
        )
        .is_err());
    assert!(ledger
        .request_owned_herdr_controller_cleanup(
            "own-controller",
            DesiredSubjectKind::Run,
            "controller-run",
            2,
            OwnedHerdrCleanupReason::ControllerTerminal,
        )
        .is_err());
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            "controller-run",
            DesiredState::Stopped,
            DesiredReconcileOutcome::Terminal,
            None,
            None,
        )
        .expect("terminal desired");
    ledger
        .request_owned_herdr_controller_cleanup(
            "own-controller",
            DesiredSubjectKind::Run,
            "controller-run",
            2,
            OwnedHerdrCleanupReason::ControllerTerminal,
        )
        .expect("request terminal");
    assert_eq!(
        ledger
            .list_unreleased_owned_herdr_controllers()
            .expect("controllers")
            .len(),
        1
    );
}

#[test]
fn orphaned_submit_requires_no_current_or_later_desired_epoch_and_rechecks_due() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).expect("ledger");
    insert_controller_fixture(&path, "own-orphan", "orphan-run", 2, "command-started");
    let generic = ledger
        .request_owned_herdr_controller_cleanup(
            "own-orphan",
            DesiredSubjectKind::Run,
            "orphan-run",
            2,
            OwnedHerdrCleanupReason::OrphanedSubmit,
        )
        .expect_err("generic cleanup cannot assert probe evidence");
    assert_eq!(generic.code(), ErrorCode::InvalidRequest);
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, "orphan-run", 1)
        .expect("older desired epoch does not match the orphan");

    let requested = ledger
        .request_orphaned_owned_herdr_controller_cleanup(
            "own-orphan",
            DesiredSubjectKind::Run,
            "orphan-run",
            2,
        )
        .expect("request orphaned submit cleanup");
    assert_eq!(
        requested.cleanup_reason,
        Some(OwnedHerdrCleanupReason::OrphanedSubmit)
    );
    assert_eq!(
        requested.lifecycle_state,
        OwnedHerdrLifecycleState::OwnerDead
    );

    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, "orphan-run", 2)
        .expect("race in matching desired epoch");
    assert!(ledger
        .list_due_owned_herdr_cleanup("2099-01-01T00:00:00.000000000Z", 10)
        .expect("due with desired")
        .is_empty());

    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, "orphan-run", 3)
        .expect("normal resubmit advances beyond the orphan");
    assert_eq!(
        ledger
            .list_due_owned_herdr_cleanup("2099-01-01T00:00:00.000000000Z", 10)
            .expect("later generation keeps cleanup due")
            .len(),
        1
    );
    assert_eq!(
        ledger
            .earliest_owned_herdr_cleanup_wake("2099-01-01T00:00:00.000000000Z")
            .expect("later generation keeps cleanup wakeable")
            .as_deref(),
        Some("2099-01-01T00:00:00.000000000Z")
    );
    let claimed = ledger
        .claim_owned_herdr_cleanup(
            "own-orphan",
            "cleanup-orphan",
            "2099-01-01T00:00:00.000000000Z",
            "2099-01-01T00:01:00.000000000Z",
        )
        .expect("claim")
        .expect("eligible again");
    assert_eq!(
        claimed.cleanup_reason,
        Some(OwnedHerdrCleanupReason::OrphanedSubmit)
    );
    let released = ledger
        .ack_owned_herdr_cleanup(
            "own-orphan",
            "cleanup-orphan",
            OwnedHerdrCleanupRelease::PaneNotFound,
        )
        .expect("release");
    assert_eq!(released.cleanup_state, OwnedHerdrCleanupState::Released);
    assert_eq!(
        released.cleanup_release,
        Some(OwnedHerdrCleanupRelease::PaneNotFound)
    );
}

#[test]
fn controller_generation_inventory_includes_only_released_rows() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).expect("ledger");
    insert_controller_fixture(&path, "own-generation-1", "generation-run", 1, "registered");
    insert_controller_fixture(
        &path,
        "own-generation-3",
        "generation-run",
        3,
        "command-started",
    );
    ledger
        .request_abandoned_owned_herdr_cleanup("own-generation-1")
        .expect("registered controller uses abandoned cleanup");
    let claimed = ledger
        .claim_owned_herdr_cleanup(
            "own-generation-1",
            "cleanup-generation-1",
            "2099-01-01T00:00:00.000000000Z",
            "2099-01-01T00:01:00.000000000Z",
        )
        .expect("claim")
        .expect("due");
    assert_eq!(
        claimed.cleanup_reason,
        Some(OwnedHerdrCleanupReason::CommandNotStarted)
    );
    ledger
        .ack_owned_herdr_cleanup(
            "own-generation-1",
            "cleanup-generation-1",
            OwnedHerdrCleanupRelease::PaneNotFound,
        )
        .expect("release generation one");
    assert_eq!(
        ledger
            .max_owned_herdr_controller_generation(DesiredSubjectKind::Run, "generation-run")
            .expect("max generation"),
        Some(1)
    );
    assert_eq!(
        ledger
            .find_unreleased_owned_herdr_controller(DesiredSubjectKind::Run, "generation-run")
            .expect("unreleased controller")
            .expect("generation three remains fenced")
            .controller_generation,
        Some(3)
    );
}

#[test]
fn competing_registration_and_cleanup_claim_each_have_one_winner() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).expect("ledger");
    let (packet, attempt_id, claim) = seed_attempt(&ledger, "run-race", None);
    let barrier = Arc::new(Barrier::new(2));
    let mut registrations = Vec::new();
    for n in 0..2 {
        let path = path.clone();
        let barrier = Arc::clone(&barrier);
        let mut identity = attempt_identity(
            &format!("own-race-{n}"),
            "run-race",
            &packet,
            attempt_id,
            &claim,
            None,
        );
        identity.pane_id = format!("pane-race-{n}");
        identity.sentinel_path = format!("/tmp/race-{n}/status");
        registrations.push(std::thread::spawn(move || {
            let ledger = Ledger::open(&path).expect("open");
            barrier.wait();
            ledger.register_owned_herdr_session(&identity)
        }));
    }
    let results: Vec<_> = registrations
        .into_iter()
        .map(|thread| thread.join().expect("join"))
        .collect();
    assert_eq!(results.iter().filter(|result| result.is_ok()).count(), 1);
    let winner = results.into_iter().find_map(Result::ok).expect("winner");
    ledger.fail_packet(&packet, &claim, "done").expect("settle");

    let barrier = Arc::new(Barrier::new(2));
    let mut claims = Vec::new();
    for n in 0..2 {
        let path = path.clone();
        let barrier = Arc::clone(&barrier);
        let ownership_id = winner.ownership_id.clone();
        claims.push(std::thread::spawn(move || {
            let ledger = Ledger::open(&path).expect("open");
            barrier.wait();
            ledger.claim_owned_herdr_cleanup(
                &ownership_id,
                &format!("cleanup-racer-{n}"),
                "2099-01-01T00:00:00.000000000Z",
                "2099-01-01T00:01:00.000000000Z",
            )
        }));
    }
    let claims: Vec<_> = claims
        .into_iter()
        .map(|thread| thread.join().expect("join").expect("claim call"))
        .collect();
    assert_eq!(claims.iter().filter(|row| row.is_some()).count(), 1);
}

#[test]
fn expired_lease_recovers_and_retry_budget_parks_without_hot_loop() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    let (packet, attempt_id, claim) = seed_attempt(&ledger, "run-retry", None);
    let identity = attempt_identity("own-retry", "run-retry", &packet, attempt_id, &claim, None);
    ledger
        .register_owned_herdr_session(&identity)
        .expect("register");
    ledger.fail_packet(&packet, &claim, "done").expect("settle");
    ledger
        .claim_owned_herdr_cleanup(
            "own-retry",
            "lost-worker",
            "2030-01-01T00:00:00.000000000Z",
            "2030-01-01T00:00:10.000000000Z",
        )
        .expect("claim")
        .expect("won");
    assert!(ledger
        .claim_owned_herdr_cleanup(
            "own-retry",
            "too-early",
            "2030-01-01T00:00:09.000000000Z",
            "2030-01-01T00:00:20.000000000Z",
        )
        .expect("claim")
        .is_none());
    let mut row = ledger
        .claim_owned_herdr_cleanup(
            "own-retry",
            "recovered",
            "2030-01-01T00:00:11.000000000Z",
            "2030-01-01T00:01:00.000000000Z",
        )
        .expect("reclaim")
        .expect("recovered");
    for n in 1..=row.cleanup_retry_budget {
        let token = row.cleanup_token.clone().expect("token");
        let now = row
            .last_cleanup_attempt_at
            .clone()
            .expect("attempt timestamp");
        match ledger
            .retry_owned_herdr_cleanup("own-retry", &token, &now, "socket unavailable")
            .expect("retry")
        {
            OwnedHerdrCleanupRetry::Scheduled(scheduled) => {
                assert!(n < row.cleanup_retry_budget);
                let wake = scheduled.next_cleanup_at.clone().expect("wake");
                row = ledger
                    .claim_owned_herdr_cleanup(
                        "own-retry",
                        &format!("retry-{n}"),
                        &wake,
                        "2099-01-01T00:00:00.000000000Z",
                    )
                    .expect("claim retry")
                    .expect("won retry");
            }
            OwnedHerdrCleanupRetry::Exhausted(exhausted) => {
                assert_eq!(n, row.cleanup_retry_budget);
                row = exhausted;
            }
        }
    }
    assert_eq!(row.cleanup_state, OwnedHerdrCleanupState::Attention);
    assert!(ledger
        .earliest_owned_herdr_cleanup_wake("2099-01-01T00:00:00.000000000Z")
        .expect("wake")
        .is_none());
}
