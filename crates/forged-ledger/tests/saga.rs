//! The shim test — this epic's riskiest-assumption retirement — plus the
//! mechanically enforced saga order, the fence, and the event stream.
//!
//! Pause/resume is choreographed with rendezvous channels, never timing.

use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::mpsc;
use std::sync::{Arc, Barrier};

use forged_ledger::{
    AttemptState, EffectClass, Ledger, NewPacket, NewRun, OperationOutcome, OperationState,
    RunOutcome, RunState, SpecFence,
};
use forged_types::{
    AcceptedRisk, ErrorCode, Finding, OperationRequest, OperationResponse, Outcome, PacketResult,
    RunId, Severity, Stage,
};
use serde_json::json;

fn make_run(ledger: &Ledger, id: &str) -> String {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(id).expect("valid run id"),
            bead_id: "bead-1".to_owned(),
            repo: "example/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: format!("feat/{id}"),
        })
        .expect("create run")
        .run_id
}

fn make_packet(ledger: &Ledger, run_id: &str) -> String {
    ledger
        .open_packet(NewPacket {
            run_id: run_id.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "specs/x.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            body_json: "{\"schema\":\"forged.packet/1\"}".to_owned(),
        })
        .expect("open packet")
}

fn request(key: &str, run_id: Option<&str>) -> OperationRequest {
    OperationRequest {
        schema_version: 1,
        idempotency_key: key.to_owned(),
        run_id: run_id.map(str::to_owned),
        params: serde_json::Map::new(),
    }
}

fn ok_response(operation_id: &str) -> OperationResponse {
    OperationResponse {
        ok: true,
        operation_id: operation_id.to_owned(),
        reused: false,
        result: Some(json!({"done": true})),
        error: None,
    }
}

fn fix_result(packet_id: &str) -> PacketResult {
    PacketResult {
        schema: "forged.result/1".to_owned(),
        packet_id: packet_id.to_owned(),
        outcome: Outcome::Fix {
            applied: true,
            summary: "done".to_owned(),
        },
    }
}

fn fresh(outcome: OperationOutcome) -> String {
    match outcome {
        OperationOutcome::Fresh(ticket) => ticket.operation_id,
        other => panic!("expected Fresh, got {other:?}"),
    }
}

fn acceptance(actor: &str, rationale: &str) -> AcceptedRisk {
    AcceptedRisk {
        accepted_by: actor.to_owned(),
        rationale: rationale.to_owned(),
        findings: vec![Finding {
            severity: Severity::High,
            file: Some("src/lib.rs".to_owned()),
            line: Some(17),
            message: "known residual risk".to_owned(),
        }],
    }
}

fn block_after_review_exhaustion(ledger: &Ledger, run_id: &str, rounds: u8) {
    ledger
        .append_event_kind_once(
            run_id,
            "run.protocol-terminal",
            json!({
                "schemaVersion": 1,
                "terminal": {
                    "reviewBudgetExhausted": {
                        "reviewRounds": rounds,
                        "finalVerdict": "requestChanges",
                    }
                }
            }),
        )
        .expect("review terminal");
    ledger
        .settle_run(
            run_id,
            RunOutcome::Blocked,
            format!("review budget exhausted after {rounds} rounds with verdict requestChanges"),
            None,
            None,
            None,
        )
        .expect("blocked settlement");
}

/// Shim variant 1: revoked mid-flight. The durable `revoking` marker lands
/// while the executor is paused before its fence check; the fence then
/// refuses, the effect never runs, and the operation row stays
/// `in_progress` for the reconciler.
#[test]
fn shim_revoked_mid_flight_never_fires_the_effect() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-shim-1");
    let packet = make_packet(&ledger, &run);
    let claim = ledger
        .claim_packet(
            &packet,
            "claude:sess-1:100",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");
    let operation_id = fresh(
        ledger
            .begin_operation(
                "shim.effect",
                &request("key-1", Some(&run)),
                EffectClass::SafeRetry,
                Some(&claim.claim_token),
            )
            .expect("begin"),
    );

    let counter = Arc::new(AtomicU32::new(0));
    let (paused_tx, paused_rx) = mpsc::channel::<()>();
    let (resume_tx, resume_rx) = mpsc::channel::<()>();
    let executor = {
        let ledger = ledger.clone();
        let token = claim.claim_token.clone();
        let counter = Arc::clone(&counter);
        std::thread::spawn(move || {
            paused_tx.send(()).expect("rendezvous: paused");
            resume_rx.recv().expect("rendezvous: resume");
            // The fence check guards the effect immediately before it fires.
            let fence = ledger.assert_attempt_live(&token);
            if fence.is_ok() {
                counter.fetch_add(1, Ordering::SeqCst);
            }
            fence
        })
    };

    paused_rx.recv().expect("executor reached the pause point");
    // Commits durably BEFORE the executor resumes.
    ledger
        .revoke_attempt(claim.attempt_id, "operator revoked")
        .expect("revoke");
    resume_tx.send(()).expect("rendezvous: resume");
    let fence = executor.join().expect("executor thread");
    assert_eq!(
        fence.expect_err("fence must refuse").code(),
        ErrorCode::StaleClaimToken
    );
    assert_eq!(counter.load(Ordering::SeqCst), 0, "the effect never ran");

    let err = ledger
        .complete_operation(&operation_id, &ok_response(&operation_id))
        .expect_err("a revoked attempt cannot land results");
    assert_eq!(err.code(), ErrorCode::StaleClaimToken);

    let row = ledger
        .find_operation("shim.effect", "key-1")
        .expect("find")
        .expect("row survives");
    assert_eq!(row.state, OperationState::InProgress);
    ledger.close().expect("close");
}

/// Shim variant 2: crash before the effect fires. After reopen, the
/// reconciler finds the in-flight row, releases it (safe-retry), and the
/// retry claims fresh; the effect runs exactly once.
#[test]
fn shim_crash_before_send_releases_and_retries_exactly_once() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let counter = AtomicU32::new(0);

    let ledger = Ledger::open(&path).expect("open");
    let run = make_run(&ledger, "run-shim-2");
    let operation_id = fresh(
        ledger
            .begin_operation(
                "shim.crash",
                &request("key-2", Some(&run)),
                EffectClass::SafeRetry,
                None,
            )
            .expect("begin"),
    );
    // The crash is simulated by the effect never firing; close joins the
    // writer thread so the reopen below races nothing.
    ledger.close().expect("close");

    let ledger = Ledger::open(&path).expect("reopen");
    let inflight = ledger.list_inflight_operations(None).expect("list");
    assert_eq!(inflight.len(), 1);
    assert_eq!(inflight[0].operation_id, operation_id);
    assert_eq!(inflight[0].effect_class, EffectClass::SafeRetry);

    ledger.release_operation(&operation_id).expect("release");
    let retry_id = fresh(
        ledger
            .begin_operation(
                "shim.crash",
                &request("key-2", Some(&run)),
                EffectClass::SafeRetry,
                None,
            )
            .expect("retry begins fresh"),
    );
    counter.fetch_add(1, Ordering::SeqCst); // the effect fires
    assert_eq!(counter.load(Ordering::SeqCst), 1);
    ledger
        .complete_operation(&retry_id, &ok_response(&retry_id))
        .expect("complete");
    ledger.close().expect("close");
}

/// Shim variant 3: the effect applied but the response was lost. The test
/// plays the observing reconciler: it settles the row, and a fresh
/// `begin_operation` replays the settled result without re-firing.
#[test]
fn shim_applied_then_response_lost_settles_by_observation() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let counter = AtomicU32::new(0);

    let ledger = Ledger::open(&path).expect("open");
    let run = make_run(&ledger, "run-shim-3");
    let operation_id = fresh(
        ledger
            .begin_operation(
                "shim.applied",
                &request("key-3", Some(&run)),
                EffectClass::ObserveOnly,
                None,
            )
            .expect("begin"),
    );
    counter.fetch_add(1, Ordering::SeqCst); // the effect executes
    ledger.close().expect("close before complete_operation");

    let ledger = Ledger::open(&path).expect("reopen");
    let settled = ok_response(&operation_id);
    ledger
        .resolve_interrupted_operation(&operation_id, &settled)
        .expect("resolve");

    let outcome = ledger
        .begin_operation(
            "shim.applied",
            &request("key-3", Some(&run)),
            EffectClass::ObserveOnly,
            None,
        )
        .expect("begin after settle");
    match outcome {
        OperationOutcome::Replayed(response) => {
            assert!(response.reused, "replay carries reused: true");
            assert!(response.ok);
            assert_eq!(response.result, settled.result);
        }
        other => panic!("expected Replayed, got {other:?}"),
    }
    assert_eq!(counter.load(Ordering::SeqCst), 1, "the effect never re-ran");
    ledger.close().expect("close");
}

/// Saga order enforced mechanically, per the acceptance criterion.
#[test]
fn saga_order_is_enforced_mechanically() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-saga");
    let packet = make_packet(&ledger, &run);
    let claim = ledger
        .claim_packet(
            &packet,
            "claude:sess-2:200",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    // reclaimed is unreachable from running.
    let err = ledger
        .mark_reclaimed(claim.attempt_id)
        .expect_err("must refuse");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    ledger
        .revoke_attempt(claim.attempt_id, "stalled")
        .expect("revoke");

    // While revoking, the fence refuses everything under that token.
    let err = ledger
        .complete_packet(&packet, &claim.claim_token, &fix_result(&packet))
        .expect_err("complete while revoking");
    assert_eq!(err.code(), ErrorCode::StaleClaimToken);
    let err = ledger
        .heartbeat_attempt(&claim.claim_token)
        .expect_err("heartbeat while revoking");
    assert_eq!(err.code(), ErrorCode::StaleClaimToken);
    let err = ledger
        .assert_attempt_live(&claim.claim_token)
        .expect_err("assert while revoking");
    assert_eq!(err.code(), ErrorCode::StaleClaimToken);
    let err = ledger
        .begin_operation(
            "saga.op",
            &request("saga-key", Some(&run)),
            EffectClass::SafeRetry,
            Some(&claim.claim_token),
        )
        .expect_err("token-bearing begin while revoking");
    assert_eq!(err.code(), ErrorCode::StaleClaimToken);
    let err = ledger
        .claim_packet(
            &packet,
            "claude:sess-3:300",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect_err("claim while revoking");
    assert_eq!(err.code(), ErrorCode::PacketNotClaimable);

    // Re-revoking is idempotent: original reason and timestamps preserved.
    let before = ledger.get_attempt(claim.attempt_id).expect("get");
    ledger
        .revoke_attempt(claim.attempt_id, "a different reason")
        .expect("idempotent revoke");
    let after = ledger.get_attempt(claim.attempt_id).expect("get");
    assert_eq!(after, before);

    ledger.mark_reclaimed(claim.attempt_id).expect("reclaim");
    let reclaimed = ledger.get_attempt(claim.attempt_id).expect("get");
    assert_eq!(reclaimed.state, AttemptState::Reclaimed);
    assert_eq!(reclaimed.revoke_reason.as_deref(), Some("stalled"));
    assert!(reclaimed.ended_at.is_some());

    // A successor claim succeeds with a fresh token only after reclaimed.
    let successor = ledger
        .claim_packet(
            &packet,
            "claude:sess-4:400",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("successor claim");
    assert_ne!(successor.claim_token, claim.claim_token);
    assert_ne!(successor.attempt_id, claim.attempt_id);
    ledger.close().expect("close");
}

/// `stopped` is the attempt-local terminal exit from `revoking`: reachable
/// only through the durable marker, distinguishable from `reclaimed`, and
/// leaving the packet claimable at once.
#[test]
fn mark_stopped_is_the_only_path_into_stopped() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-stopped");
    let packet = make_packet(&ledger, &run);
    let claim = ledger
        .claim_packet(
            &packet,
            "claude:sess-8:800",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    // stopped is unreachable from running: no path skips the marker.
    let err = ledger
        .mark_stopped(claim.attempt_id)
        .expect_err("must refuse");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    ledger
        .revoke_attempt_scoped(
            claim.attempt_id,
            "operator requested",
            forged_ledger::RevokeScope::Attempt,
        )
        .expect("revoke");
    ledger.mark_stopped(claim.attempt_id).expect("stop");

    let stopped = ledger.get_attempt(claim.attempt_id).expect("get");
    // The scope survives the transition too: a reader of the terminal row
    // knows an operator stopped this, not that the saga reclaimed it.
    assert_eq!(
        stopped.revoke_scope,
        Some(forged_ledger::RevokeScope::Attempt)
    );
    assert_eq!(stopped.state, AttemptState::Stopped);
    assert_ne!(stopped.state, AttemptState::Reclaimed);
    assert_eq!(stopped.revoke_reason.as_deref(), Some("operator requested"));
    assert!(stopped.ended_at.is_some());

    // The transition is on the wire as its own event, so a reader tells an
    // operator's stop from the saga's reclaim without the row.
    let events = ledger
        .list_events(Some(&run), 0, 100)
        .expect("run-scoped events");
    let event = events
        .iter()
        .filter(|e| e.kind == "attempt.state")
        .map(|e| serde_json::from_str::<serde_json::Value>(&e.payload_json).expect("payload"))
        .find(|p| p["new"] == "stopped")
        .expect("stopped transition event");
    assert_eq!(event["old"], json!("revoking"));
    assert_eq!(event["reason"], json!("operator requested"));
    assert_eq!(event["attemptId"], json!(claim.attempt_id));

    // Terminal both ways: no second exit, and no return to reclaimed.
    let err = ledger
        .mark_reclaimed(claim.attempt_id)
        .expect_err("stopped is terminal");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    // And the packet is claimable with no waiting period.
    ledger
        .claim_packet(
            &packet,
            "claude:sess-9:900",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("successor claim after a stop");
    ledger.close().expect("close");
}

/// The fail note is readable both ways: `fail_note` on the row and,
/// verbatim, as the `attempt.state` event's reason.
#[test]
fn fail_packet_note_lands_in_row_and_event() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-fail");
    let packet = make_packet(&ledger, &run);
    let claim = ledger
        .claim_packet(
            &packet,
            "claude:sess-5:500",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");
    let note = "gate exploded: linker OOM";
    ledger
        .fail_packet(&packet, &claim.claim_token, note)
        .expect("fail");

    let attempt = ledger.get_attempt(claim.attempt_id).expect("get");
    assert_eq!(attempt.state, AttemptState::Failed);
    assert_eq!(attempt.fail_note.as_deref(), Some(note));
    assert!(attempt.ended_at.is_some());

    let events = ledger
        .list_events(Some(&run), 0, 100)
        .expect("run-scoped events");
    let failed = events
        .iter()
        .filter(|e| e.kind == "attempt.state")
        .map(|e| serde_json::from_str::<serde_json::Value>(&e.payload_json).expect("payload"))
        .find(|p| p["new"] == "failed")
        .expect("failed transition event");
    assert_eq!(failed["reason"], json!(note));
    assert_eq!(failed["old"], json!("running"));
    assert_eq!(failed["attemptId"], json!(claim.attempt_id));
    assert_eq!(failed["packetId"], json!(packet));

    // A failed packet is re-claimable.
    ledger
        .claim_packet(
            &packet,
            "claude:sess-6:600",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("re-claim after failed");
    ledger.close().expect("close");
}

/// `set_run_state` semantics, including idempotence and no cascade.
#[test]
fn set_run_state_rules_hold() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-state");
    let packet = make_packet(&ledger, &run);
    let claim = ledger
        .claim_packet(
            &packet,
            "claude:sess-7:700",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");

    let err = ledger
        .set_run_state(&run, RunState::Stopped, None)
        .expect_err("stop needs a reason");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    let err = ledger
        .set_run_state(&run, RunState::Active, Some("why".to_owned()))
        .expect_err("active takes no reason");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    ledger
        .set_run_state(&run, RunState::Stopped, Some("budget".to_owned()))
        .expect("stop");
    let row = ledger.get_run(&run).expect("get");
    assert_eq!(row.state, RunState::Stopped);
    assert_eq!(row.stop_reason.as_deref(), Some("budget"));

    // No cascade: the live attempt stays running.
    let attempt = ledger.get_attempt(claim.attempt_id).expect("get");
    assert_eq!(attempt.state, AttemptState::Running);

    // Idempotent re-stop: no write, no second event, original reason kept.
    ledger
        .set_run_state(&run, RunState::Stopped, Some("a new reason".to_owned()))
        .expect("idempotent stop");
    let row = ledger.get_run(&run).expect("get");
    assert_eq!(row.stop_reason.as_deref(), Some("budget"));
    let stop_events: Vec<_> = ledger
        .list_events(Some(&run), 0, 100)
        .expect("events")
        .into_iter()
        .filter(|e| e.kind == "run.state")
        .collect();
    assert_eq!(stop_events.len(), 1, "one effective transition, one event");
    let payload: serde_json::Value =
        serde_json::from_str(&stop_events[0].payload_json).expect("payload");
    assert_eq!(
        payload,
        json!({"runId": run, "old": "active", "new": "stopped", "reason": "budget"})
    );

    // Reactivation clears stop_reason and appends a second run.state event.
    ledger
        .set_run_state(&run, RunState::Active, None)
        .expect("reactivate");
    let row = ledger.get_run(&run).expect("get");
    assert_eq!(row.state, RunState::Active);
    assert_eq!(row.stop_reason, None);
    let run_events: Vec<_> = ledger
        .list_events(Some(&run), 0, 100)
        .expect("events")
        .into_iter()
        .filter(|e| e.kind == "run.state")
        .collect();
    assert_eq!(run_events.len(), 2);
    ledger.close().expect("close");
}

/// Events are append-only with strictly increasing ids, and attempt
/// transitions carry the owning run's id (the run-scoped listing proves it).
#[test]
fn events_are_append_only_and_run_attributed() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-events");
    let packet = make_packet(&ledger, &run);
    let claim = ledger
        .claim_packet(
            &packet,
            "claude:sess-8:800",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect("claim");
    ledger
        .revoke_attempt(claim.attempt_id, "shutting down")
        .expect("revoke");
    ledger.mark_reclaimed(claim.attempt_id).expect("reclaim");
    ledger
        .append_event(None, "custom.kind", json!({"free": "form"}))
        .expect("append");

    let all = ledger.list_events(None, 0, 100).expect("all events");
    assert!(all.len() >= 4);
    for pair in all.windows(2) {
        assert!(pair[0].event_id < pair[1].event_id, "strictly increasing");
    }
    assert!(
        all.iter().any(|e| e.run_id.is_none()),
        "None filter includes NULL-run rows"
    );

    let scoped = ledger
        .list_events(Some(&run), 0, 100)
        .expect("run-scoped events");
    let transitions: Vec<String> = scoped
        .iter()
        .filter(|e| e.kind == "attempt.state")
        .map(|e| {
            let p: serde_json::Value = serde_json::from_str(&e.payload_json).expect("payload");
            p["new"].as_str().expect("new is a string").to_owned()
        })
        .collect();
    assert_eq!(transitions, ["running", "revoking", "reclaimed"]);
    assert!(
        scoped
            .iter()
            .all(|e| e.run_id.as_deref() == Some(run.as_str())),
        "Some filter excludes NULLs"
    );

    // The claim event has old: null; the revoking event carries the reason.
    let claim_payload: serde_json::Value = serde_json::from_str(
        &scoped
            .iter()
            .find(|e| e.kind == "attempt.state")
            .expect("claim event")
            .payload_json,
    )
    .expect("payload");
    assert_eq!(claim_payload["old"], json!(null));
    assert_eq!(claim_payload["reason"], json!(null));
    let revoking = scoped
        .iter()
        .filter(|e| e.kind == "attempt.state")
        .map(|e| serde_json::from_str::<serde_json::Value>(&e.payload_json).expect("payload"))
        .find(|p| p["new"] == "revoking")
        .expect("revoking event");
    assert_eq!(revoking["reason"], json!("shutting down"));

    // Pagination: exclusive after_event_id, ascending, limit 0 → empty.
    let first_id = scoped[0].event_id;
    let after = ledger
        .list_events(Some(&run), first_id, 100)
        .expect("after first");
    assert_eq!(after.len(), scoped.len() - 1);
    assert!(ledger
        .list_events(None, 0, 0)
        .expect("limit zero")
        .is_empty());
    ledger.close().expect("close");
}

/// The marker's SCOPE is durable and first-writer-wins. Without it a
/// `revoking` row cannot say whose revocation it is, and the recovery path
/// finishes an operator's stop through the bead-scoped reclaim it exists to
/// avoid.
#[test]
fn a_revoking_marker_records_the_scope_that_placed_it() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-scope");
    let fence = SpecFence::Sha256("cafe".to_owned());

    // The saga's own entry point is bead-scoped.
    let saga_packet = make_packet(&ledger, &run);
    // One live attempt per packet, so the two revocations need two packets.
    let stop_packet = ledger
        .open_packet(NewPacket {
            run_id: run.clone(),
            stage: Stage::Implement,
            seq: 2,
            spec_path: "specs/x.md".to_owned(),
            spec_sha256: "cafe".to_owned(),
            spec_revision: None,
            body_json: "{\"schema\":\"forged.packet/1\"}".to_owned(),
        })
        .expect("open packet");
    let saga = ledger
        .claim_packet(&saga_packet, "claude:sess-1:100", &fence)
        .expect("claim");
    ledger
        .revoke_attempt(saga.attempt_id, "session vanished")
        .expect("revoke");
    assert_eq!(
        ledger
            .get_attempt(saga.attempt_id)
            .expect("get")
            .revoke_scope,
        Some(forged_ledger::RevokeScope::Bead)
    );

    // An operator's stop is attempt-scoped, and a second revocation of an
    // already-marked row changes NOTHING: reason, scope, and stamps all
    // belong to the writer that committed the marker.
    let stop = ledger
        .claim_packet(&stop_packet, "claude:sess-2:200", &fence)
        .expect("claim");
    ledger
        .revoke_attempt_scoped(
            stop.attempt_id,
            "operator requested",
            forged_ledger::RevokeScope::Attempt,
        )
        .expect("revoke");
    ledger
        .revoke_attempt(stop.attempt_id, "session vanished")
        .expect("a second revocation of a revoking row is a no-op");
    let row = ledger.get_attempt(stop.attempt_id).expect("get");
    assert_eq!(row.revoke_scope, Some(forged_ledger::RevokeScope::Attempt));
    assert_eq!(row.revoke_reason.as_deref(), Some("operator requested"));
    ledger.close().expect("close");
}

#[test]
fn whole_run_settlement_is_immutable_idempotent_and_evented() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-settlement");
    let sha = "a".repeat(40);
    let packet = make_packet(&ledger, &run);

    let landed = ledger
        .settle_run(
            &run,
            RunOutcome::Landed,
            "merged cleanly".to_owned(),
            Some(121),
            Some(sha.clone()),
            None,
        )
        .expect("settle");
    assert_eq!(landed.state, RunState::Stopped);
    assert_eq!(landed.terminal_outcome, Some(RunOutcome::Landed));
    assert_eq!(landed.delivery_pr, Some(121));
    assert_eq!(landed.delivery_sha.as_deref(), Some(sha.as_str()));

    let replay = ledger
        .settle_run(
            &run,
            RunOutcome::Landed,
            "merged cleanly".to_owned(),
            Some(121),
            Some(sha),
            None,
        )
        .expect("identical replay");
    assert_eq!(replay, landed);
    let settlement_events: Vec<_> = ledger
        .list_events(Some(&run), 0, 100)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "run.settled")
        .collect();
    assert_eq!(settlement_events.len(), 1);
    let claim_after_stop = ledger
        .claim_packet(
            &packet,
            "claude:late:99",
            &SpecFence::Sha256("cafe".to_owned()),
        )
        .expect_err("a terminal run cannot race in a successor attempt");
    assert_eq!(claim_after_stop.code(), ErrorCode::PacketNotClaimable);

    let conflict = ledger
        .settle_run(
            &run,
            RunOutcome::Cancelled,
            "changed my mind".to_owned(),
            None,
            None,
            None,
        )
        .expect_err("terminal outcome cannot be rewritten");
    assert_eq!(conflict.code(), ErrorCode::InvalidRequest);
    ledger.close().expect("close");
}

#[test]
fn settlement_requires_outcome_specific_evidence() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let landed = make_run(&ledger, "run-bad-landed");
    let superseded = make_run(&ledger, "run-bad-superseded");

    let missing = ledger
        .settle_run(
            &landed,
            RunOutcome::Landed,
            "merged".to_owned(),
            Some(7),
            Some("short".to_owned()),
            None,
        )
        .expect_err("abbreviated SHA is not immutable evidence");
    assert_eq!(missing.code(), ErrorCode::InvalidRequest);
    assert_eq!(
        ledger.get_run(&landed).expect("run").state,
        RunState::Active
    );

    let unnamed = ledger
        .settle_run(
            &superseded,
            RunOutcome::Superseded,
            "replaced".to_owned(),
            None,
            None,
            None,
        )
        .expect_err("a successor is required");
    assert_eq!(unnamed.code(), ErrorCode::InvalidRequest);
    ledger.close().expect("close");
}

#[test]
fn accepted_risk_settlement_replays_exactly_and_compares_singleton_payload() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-risk-replay");
    block_after_review_exhaustion(&ledger, &run, 3);
    let evidence = acceptance("lead-agent", "feature is disabled in production");

    let mismatched = ledger
        .accept_review_risk(&run, 2, evidence.clone())
        .expect_err("caller evidence must match persisted exhaustion");
    assert_eq!(mismatched.code(), ErrorCode::InvalidRequest);
    assert_eq!(
        ledger
            .get_run(&run)
            .expect("still blocked")
            .terminal_outcome,
        Some(RunOutcome::Blocked)
    );
    assert!(ledger
        .list_events(Some(&run), 0, 100)
        .expect("events")
        .iter()
        .all(|event| event.kind != "forged.review.risk_accepted"));

    let settled = ledger
        .accept_review_risk(&run, 3, evidence.clone())
        .expect("accept risk");
    assert_eq!(settled.terminal_outcome, Some(RunOutcome::AcceptedRisk));
    assert_eq!(
        settled.stop_reason.as_deref(),
        Some("review risk accepted by lead-agent: feature is disabled in production")
    );
    assert_eq!(
        ledger
            .accept_review_risk(&run, 3, evidence.clone())
            .expect("exact replay"),
        settled
    );

    let competing = ledger
        .accept_review_risk(&run, 3, acceptance("lead-agent", "a different rationale"))
        .expect_err("competing evidence must not replay");
    assert_eq!(competing.code(), ErrorCode::InvalidRequest);
    let events = ledger.list_events(Some(&run), 0, 100).expect("events");
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.review.risk_accepted")
            .count(),
        1
    );
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "run.settled")
            .count(),
        2,
        "blocked and accepted-risk each settle exactly once"
    );
    ledger.close().expect("close");
}

#[test]
fn accepted_risk_repairs_only_an_exact_legacy_torn_event() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let exact_run = make_run(&ledger, "run-risk-torn-exact");
    let conflict_run = make_run(&ledger, "run-risk-torn-conflict");
    let evidence = acceptance("lead-agent", "known containment");
    for run in [&exact_run, &conflict_run] {
        block_after_review_exhaustion(&ledger, run, 2);
    }
    ledger
        .append_event_kind_once(
            &exact_run,
            "forged.review.risk_accepted",
            json!({
                "schemaVersion": 1,
                "reviewRounds": 2,
                "acceptance": evidence,
            }),
        )
        .expect("legacy exact event");
    ledger
        .accept_review_risk(&exact_run, 2, evidence.clone())
        .expect("exact torn write can finish atomically");
    assert_eq!(
        ledger
            .list_events(Some(&exact_run), 0, 100)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.review.risk_accepted")
            .count(),
        1
    );

    ledger
        .append_event_kind_once(
            &conflict_run,
            "forged.review.risk_accepted",
            json!({
                "schemaVersion": 1,
                "reviewRounds": 2,
                "acceptance": acceptance("another-operator", "different evidence"),
            }),
        )
        .expect("legacy competing event");
    let conflict = ledger
        .accept_review_risk(&conflict_run, 2, evidence)
        .expect_err("different singleton payload must be refused");
    assert_eq!(conflict.code(), ErrorCode::InvalidRequest);
    assert_eq!(
        ledger.get_run(&conflict_run).expect("run").terminal_outcome,
        Some(RunOutcome::Blocked)
    );
    ledger.close().expect("close");
}

#[test]
fn competing_acceptances_leave_one_matching_event_outcome_and_reason() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Arc::new(Ledger::open(&dir.path().join("state.db")).expect("open"));
    let run = make_run(&ledger, "run-risk-race");
    block_after_review_exhaustion(&ledger, &run, 2);
    let barrier = Arc::new(Barrier::new(3));

    let handles: Vec<_> = [
        ("operator-a", "containment a"),
        ("operator-b", "containment b"),
    ]
    .into_iter()
    .map(|(actor, rationale)| {
        let ledger = ledger.clone();
        let barrier = barrier.clone();
        let run = run.clone();
        std::thread::spawn(move || {
            barrier.wait();
            ledger.accept_review_risk(&run, 2, acceptance(actor, rationale))
        })
    })
    .collect();
    barrier.wait();
    let results: Vec<_> = handles
        .into_iter()
        .map(|handle| handle.join().expect("join"))
        .collect();
    assert_eq!(results.iter().filter(|result| result.is_ok()).count(), 1);
    assert_eq!(results.iter().filter(|result| result.is_err()).count(), 1);

    let row = ledger.get_run(&run).expect("run");
    let event = ledger
        .list_events(Some(&run), 0, 100)
        .expect("events")
        .into_iter()
        .find(|event| event.kind == "forged.review.risk_accepted")
        .expect("acceptance event");
    let payload: serde_json::Value = serde_json::from_str(&event.payload_json).expect("payload");
    let actor = payload
        .pointer("/acceptance/acceptedBy")
        .and_then(serde_json::Value::as_str)
        .expect("actor");
    let rationale = payload
        .pointer("/acceptance/rationale")
        .and_then(serde_json::Value::as_str)
        .expect("rationale");
    let expected_reason = format!("review risk accepted by {actor}: {rationale}");
    assert_eq!(row.terminal_outcome, Some(RunOutcome::AcceptedRisk));
    assert_eq!(row.stop_reason.as_deref(), Some(expected_reason.as_str()));
    drop(ledger);
}

#[test]
fn acceptance_and_supersede_race_has_one_self_consistent_winner() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Arc::new(Ledger::open(&dir.path().join("state.db")).expect("open"));
    let run = make_run(&ledger, "run-risk-supersede-race");
    block_after_review_exhaustion(&ledger, &run, 2);
    let barrier = Arc::new(Barrier::new(3));

    let accept = {
        let ledger = ledger.clone();
        let barrier = barrier.clone();
        let run = run.clone();
        std::thread::spawn(move || {
            barrier.wait();
            ledger.accept_review_risk(&run, 2, acceptance("lead", "known containment"))
        })
    };
    let supersede = {
        let ledger = ledger.clone();
        let barrier = barrier.clone();
        let run = run.clone();
        std::thread::spawn(move || {
            barrier.wait();
            ledger.settle_run(
                &run,
                RunOutcome::Superseded,
                "replaced by corrected run".to_owned(),
                None,
                None,
                Some("successor-run".to_owned()),
            )
        })
    };
    barrier.wait();
    let accepted = accept.join().expect("accept join");
    let superseded = supersede.join().expect("supersede join");
    assert_ne!(
        accepted.is_ok(),
        superseded.is_ok(),
        "exactly one transition wins"
    );

    let row = ledger.get_run(&run).expect("run");
    let accepted_events = ledger
        .list_events(Some(&run), 0, 100)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "forged.review.risk_accepted")
        .count();
    match row.terminal_outcome {
        Some(RunOutcome::AcceptedRisk) => {
            assert!(accepted.is_ok());
            assert_eq!(accepted_events, 1);
            assert_eq!(
                row.stop_reason.as_deref(),
                Some("review risk accepted by lead: known containment")
            );
        }
        Some(RunOutcome::Superseded) => {
            assert!(superseded.is_ok());
            assert_eq!(accepted_events, 0);
            assert_eq!(row.superseded_by.as_deref(), Some("successor-run"));
        }
        other => panic!("unexpected terminal outcome: {other:?}"),
    }
    drop(ledger);
}
