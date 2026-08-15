use std::sync::{Arc, Barrier};

use forged_ledger::{
    HerdrLayoutCleanupRelease, HerdrLayoutCleanupState, HerdrLayoutCreation,
    HerdrLayoutDegradationReason, HerdrLayoutLifecycleState, Ledger, NewPacket, NewRun,
    OwnedHerdrCleanupRelease, SpecFence,
};
use forged_types::{
    HerdrLayoutSubjectKind, HerdrLayoutSubjectV1, HerdrLayoutV1, OwnedHerdrOwnerV1,
    OwnedHerdrSessionV1, OwnedHerdrSubjectKind, OwnedHerdrSubjectV1, RunId, Stage,
    HERDR_LAYOUT_SCHEMA_V1, OWNED_HERDR_SESSION_SCHEMA_V1,
};

const NOW: &str = "2026-08-15T00:00:00.000000000Z";
const SOON: &str = "2026-08-15T00:01:00.000000000Z";
const LATER: &str = "2099-08-15T01:00:00.000000000Z";
const FAR: &str = "2099-08-15T02:00:00.000000000Z";
const ULTRA: &str = "2100-08-15T02:00:00.000000000Z";

fn seed_run(ledger: &Ledger, id: &str) {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(id).expect("run id"),
            bead_id: format!("bead-{id}"),
            repo: "/repo/forge".to_owned(),
            base_ref: "main".to_owned(),
            branch: format!("work/{id}"),
        })
        .expect("run");
}

fn subject(id: &str) -> HerdrLayoutSubjectV1 {
    HerdrLayoutSubjectV1 {
        kind: HerdrLayoutSubjectKind::Run,
        id: id.to_owned(),
    }
}

fn reserve(ledger: &Ledger, id: &str, token: &str, now: &str, lease: &str) -> HerdrLayoutCreation {
    ledger
        .reserve_herdr_layout_creation(
            subject(id),
            "/tmp/herdr.sock",
            19,
            "workspace:forge",
            &format!("Durable title [run:{id}]"),
            token,
            now,
            lease,
        )
        .expect("reserve")
}

fn register(
    ledger: &Ledger,
    row: &forged_ledger::HerdrLayoutRow,
    token: &str,
    tab: &str,
    root: &str,
) -> forged_ledger::HerdrLayoutRow {
    ledger
        .register_herdr_layout(
            &HerdrLayoutV1 {
                schema: HERDR_LAYOUT_SCHEMA_V1.to_owned(),
                layout_id: row.layout_id.clone(),
                revision: row.revision,
                subject: HerdrLayoutSubjectV1 {
                    kind: row.subject_kind,
                    id: row.subject_id.clone(),
                },
                socket_path: row.socket_path.clone(),
                protocol: row.protocol,
                workspace_id: row.workspace_id.clone(),
                tab_id: tab.to_owned(),
                root_pane_id: root.to_owned(),
                display_label: row.display_label.clone(),
                predecessor_layout_id: row.predecessor_layout_id.clone(),
            },
            token,
        )
        .expect("register")
}

#[test]
fn creation_is_fenced_replayed_and_expired_unknown_never_label_adopts() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    seed_run(&ledger, "layout-run");

    let HerdrLayoutCreation::Reserved(first) =
        reserve(&ledger, "layout-run", "creator-1", NOW, SOON)
    else {
        panic!("first reservation")
    };
    assert!(matches!(
        reserve(&ledger, "layout-run", "creator-2", NOW, SOON),
        HerdrLayoutCreation::Contended(ref row) if row.layout_id == first.layout_id
    ));

    let HerdrLayoutCreation::Reserved(successor) =
        reserve(&ledger, "layout-run", "creator-3", LATER, FAR)
    else {
        panic!("expired reservation must create a successor")
    };
    assert_ne!(successor.layout_id, first.layout_id);
    assert_eq!(
        successor.predecessor_layout_id.as_deref(),
        Some(first.layout_id.as_str())
    );
    let abandoned = ledger
        .get_herdr_layout(&first.layout_id)
        .expect("get")
        .expect("abandoned");
    assert_eq!(
        abandoned.lifecycle_state,
        HerdrLayoutLifecycleState::Degraded
    );
    assert_eq!(
        abandoned.degradation_reason,
        Some(HerdrLayoutDegradationReason::CreationAmbiguous)
    );
    assert_eq!(abandoned.cleanup_state, HerdrLayoutCleanupState::Attention);
    assert!(abandoned.tab_id.is_none());

    let registered = register(&ledger, &successor, "creator-3", "tab:2", "pane:root:2");
    assert_eq!(
        registered.lifecycle_state,
        HerdrLayoutLifecycleState::Registered
    );
    assert!(matches!(
        reserve(&ledger, "layout-run", "creator-4", LATER, FAR),
        HerdrLayoutCreation::Existing(ref row) if row.layout_id == successor.layout_id
    ));
}

#[test]
fn explicit_lost_response_stays_unaddressable_and_successor_keeps_lineage() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    seed_run(&ledger, "ambiguous-run");
    let HerdrLayoutCreation::Reserved(first) =
        reserve(&ledger, "ambiguous-run", "creator-1", NOW, SOON)
    else {
        panic!("first reservation")
    };
    let degraded = ledger
        .degrade_herdr_layout_creation(
            &first.layout_id,
            "creator-1",
            HerdrLayoutDegradationReason::CreationAmbiguous,
            "connection lost after tab.create request",
            None,
        )
        .expect("record ambiguous effect");
    assert_eq!(degraded.cleanup_state, HerdrLayoutCleanupState::Attention);
    assert!(degraded.tab_id.is_none());
    assert!(degraded.root_pane_id.is_none());

    let HerdrLayoutCreation::Reserved(successor) =
        reserve(&ledger, "ambiguous-run", "creator-2", NOW, SOON)
    else {
        panic!("successor reservation")
    };
    assert_eq!(
        successor.predecessor_layout_id.as_deref(),
        Some(first.layout_id.as_str())
    );
    assert_ne!(successor.layout_id, first.layout_id);
}

#[test]
fn mutation_has_one_cross_process_winner_and_exact_owned_panes_only() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    seed_run(&ledger, "race-run");
    let HerdrLayoutCreation::Reserved(row) = reserve(&ledger, "race-run", "creator", NOW, SOON)
    else {
        panic!("reserved")
    };
    let layout = register(&ledger, &row, "creator", "tab:race", "pane:root");

    let barrier = Arc::new(Barrier::new(3));
    let mut joins = Vec::new();
    for token in ["mutation-a", "mutation-b"] {
        let ledger = ledger.clone();
        let barrier = Arc::clone(&barrier);
        let id = layout.layout_id.clone();
        joins.push(std::thread::spawn(move || {
            barrier.wait();
            ledger
                .claim_herdr_layout_mutation(&id, token, NOW, SOON)
                .expect("claim")
                .map(|row| (token, row))
        }));
    }
    barrier.wait();
    let winners = joins
        .into_iter()
        .filter_map(|join| join.join().expect("thread"))
        .collect::<Vec<_>>();
    assert_eq!(winners.len(), 1);
    ledger
        .finish_herdr_layout_mutation(&layout.layout_id, winners[0].0, None)
        .expect("finish");
    assert!(ledger
        .list_unreleased_owned_panes_for_layout(&layout.layout_id)
        .expect("panes")
        .is_empty());
}

#[test]
fn linked_attempt_blocks_root_cleanup_until_exact_pane_is_released() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    seed_run(&ledger, "cleanup-run");
    let packet = ledger
        .open_packet(NewPacket {
            run_id: "cleanup-run".to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "spec.md".to_owned(),
            spec_sha256: "spec".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("packet");
    let attempt = ledger
        .claim_packet(
            &packet,
            "provider:test",
            &SpecFence::Sha256("spec".to_owned()),
        )
        .expect("claim");
    let HerdrLayoutCreation::Reserved(row) = reserve(&ledger, "cleanup-run", "creator", NOW, SOON)
    else {
        panic!("reserved")
    };
    let layout = register(&ledger, &row, "creator", "tab:cleanup", "pane:root");
    let owned = OwnedHerdrSessionV1 {
        schema: OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
        ownership_id: "owned-cleanup".to_owned(),
        owner: OwnedHerdrOwnerV1::Attempt {
            subject: OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: "cleanup-run".to_owned(),
            },
            run_id: "cleanup-run".to_owned(),
            packet_id: packet.clone(),
            attempt_id: attempt.attempt_id,
            claim_token: attempt.claim_token.clone(),
            controller_generation: None,
        },
        pane_id: "pane:attempt".to_owned(),
        socket_path: "/tmp/herdr.sock".to_owned(),
        protocol: 19,
        sentinel_path: "/tmp/status/attempt".to_owned(),
        layout_id: Some(layout.layout_id.clone()),
    };
    ledger.register_owned_herdr_session(&owned).expect("owned");
    ledger
        .mark_owned_herdr_command_started(&owned.ownership_id)
        .expect("started");
    assert_eq!(
        ledger
            .list_unreleased_owned_panes_for_layout(&layout.layout_id)
            .expect("panes"),
        vec!["pane:attempt".to_owned()]
    );
    ledger
        .set_run_state(
            "cleanup-run",
            forged_ledger::RunState::Stopped,
            Some("done".to_owned()),
        )
        .expect("terminal run");
    assert!(ledger
        .request_ready_herdr_layout_cleanup()
        .expect("request")
        .is_empty());

    ledger
        .fail_packet(&packet, &attempt.claim_token, "done")
        .expect("settle attempt");
    let owned_claim = ledger
        .claim_owned_herdr_cleanup(&owned.ownership_id, "owned-lease", LATER, FAR)
        .expect("owned claim")
        .expect("owned due");
    assert_eq!(owned_claim.ownership_id, owned.ownership_id);
    ledger
        .ack_owned_herdr_cleanup(
            &owned.ownership_id,
            "owned-lease",
            OwnedHerdrCleanupRelease::Closed,
        )
        .expect("owned release");

    let requested = ledger
        .request_ready_herdr_layout_cleanup()
        .expect("request root");
    assert_eq!(requested.len(), 1);
    let claimed = ledger
        .claim_herdr_layout_cleanup(&layout.layout_id, "layout-lease", LATER, FAR)
        .expect("claim root")
        .expect("root due");
    assert_eq!(claimed.root_pane_id.as_deref(), Some("pane:root"));
    let released = ledger
        .ack_herdr_layout_cleanup(
            &layout.layout_id,
            "layout-lease",
            HerdrLayoutCleanupRelease::Closed,
        )
        .expect("root release");
    assert_eq!(released.cleanup_state, HerdrLayoutCleanupState::Released);
}

#[test]
fn cleanup_has_one_cas_winner_and_transient_failure_retries_to_exact_missing() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    seed_run(&ledger, "cleanup-race");
    let HerdrLayoutCreation::Reserved(row) = reserve(&ledger, "cleanup-race", "creator", NOW, SOON)
    else {
        panic!("reserved")
    };
    let layout = register(
        &ledger,
        &row,
        "creator",
        "tab:cleanup-race",
        "pane:root-race",
    );
    ledger
        .set_run_state(
            "cleanup-race",
            forged_ledger::RunState::Stopped,
            Some("done".to_owned()),
        )
        .expect("terminal run");
    assert_eq!(
        ledger
            .request_ready_herdr_layout_cleanup()
            .expect("request")
            .len(),
        1
    );

    let barrier = Arc::new(Barrier::new(3));
    let mut joins = Vec::new();
    for token in ["cleanup-a", "cleanup-b"] {
        let ledger = ledger.clone();
        let barrier = Arc::clone(&barrier);
        let id = layout.layout_id.clone();
        joins.push(std::thread::spawn(move || {
            barrier.wait();
            ledger
                .claim_herdr_layout_cleanup(&id, token, LATER, FAR)
                .expect("claim")
                .map(|row| (token, row))
        }));
    }
    barrier.wait();
    let winners = joins
        .into_iter()
        .filter_map(|join| join.join().expect("thread"))
        .collect::<Vec<_>>();
    assert_eq!(winners.len(), 1);
    let first_token = winners[0].0;
    let retry = ledger
        .retry_herdr_layout_cleanup(
            &layout.layout_id,
            first_token,
            LATER,
            "Herdr temporarily unavailable",
        )
        .expect("retry");
    let forged_ledger::HerdrLayoutCleanupRetry::Scheduled(waiting) = retry else {
        panic!("first transport failure must remain retryable")
    };
    assert_eq!(waiting.cleanup_state, HerdrLayoutCleanupState::RetryWait);
    assert_eq!(waiting.cleanup_retry_used, 1);
    assert!(waiting
        .next_cleanup_at
        .as_deref()
        .is_some_and(|wake| wake > LATER));
    assert!(ledger
        .claim_herdr_layout_cleanup(&layout.layout_id, "too-early", LATER, FAR)
        .expect("early claim")
        .is_none());
    ledger
        .claim_herdr_layout_cleanup(&layout.layout_id, "cleanup-retry", FAR, ULTRA)
        .expect("retry claim")
        .expect("retry due");
    let released = ledger
        .ack_herdr_layout_cleanup(
            &layout.layout_id,
            "cleanup-retry",
            HerdrLayoutCleanupRelease::PaneNotFound,
        )
        .expect("exact missing converges");
    assert_eq!(released.cleanup_state, HerdrLayoutCleanupState::Released);
    assert_eq!(
        released.cleanup_release,
        Some(HerdrLayoutCleanupRelease::PaneNotFound)
    );
}

#[test]
fn verified_missing_locator_has_one_replacement_and_never_moves_old_sessions() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    seed_run(&ledger, "replace-run");
    let HerdrLayoutCreation::Reserved(row) = reserve(&ledger, "replace-run", "creator", NOW, SOON)
    else {
        panic!("reserved")
    };
    let original = register(&ledger, &row, "creator", "tab:old", "pane:old-root");
    let HerdrLayoutCreation::Reserved(replacement) = ledger
        .replace_herdr_layout(
            &original.layout_id,
            HerdrLayoutDegradationReason::VerificationMissing,
            "exact root returned pane_not_found",
            "workspace:forge",
            "replacement",
            NOW,
            SOON,
        )
        .expect("replace")
    else {
        panic!("replacement reservation")
    };
    assert_eq!(
        replacement.predecessor_layout_id.as_deref(),
        Some(original.layout_id.as_str())
    );
    let old = ledger
        .get_herdr_layout(&original.layout_id)
        .expect("old")
        .expect("old row");
    assert_eq!(old.lifecycle_state, HerdrLayoutLifecycleState::Replaced);
    assert_eq!(old.root_pane_id.as_deref(), Some("pane:old-root"));
    let current = register(
        &ledger,
        &replacement,
        "replacement",
        "tab:new",
        "pane:new-root",
    );
    assert_ne!(current.layout_id, original.layout_id);
}

#[test]
fn unknown_stored_layout_vocabulary_fails_closed() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).expect("ledger");
    seed_run(&ledger, "closed-layout");
    let HerdrLayoutCreation::Reserved(row) =
        reserve(&ledger, "closed-layout", "creator", NOW, SOON)
    else {
        panic!("reservation")
    };
    let layout = register(&ledger, &row, "creator", "tab:closed", "pane:closed");
    ledger.close().expect("close ledger");

    let raw = rusqlite::Connection::open(&path).expect("raw database");
    raw.execute_batch("PRAGMA ignore_check_constraints = ON;")
        .expect("disable checks for corruption fixture");
    raw.execute(
        "UPDATE herdr_layouts SET lifecycle_state = 'future-state' WHERE layout_id = ?1",
        [&layout.layout_id],
    )
    .expect("inject unknown vocabulary");
    drop(raw);

    let ledger = Ledger::open(&path).expect("reopen ledger");
    let error = ledger
        .get_herdr_layout(&layout.layout_id)
        .expect_err("unknown lifecycle must not decode");
    assert!(error.to_string().contains("Herdr layout lifecycle"));
}
