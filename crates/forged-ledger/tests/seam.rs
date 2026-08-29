//! The seam proof: constructs every input type, reads every public row
//! field, matches every outcome/error variant, and calls every seam method
//! from OUTSIDE the crate — pinning the API wave-3/-4 are specified against,
//! plus the `Send + Sync` bound wave-4's `Arc<Ledger>` depends on.

use std::sync::Arc;

use forged_ledger::{
    default_db_path, AttemptState, ClaimedAttempt, EffectClass, Ledger, LedgerError, NewPacket,
    NewRun, NewUsage, OperationOutcome, OperationState, RetryErrorUpdate, RunState, SlotOutcome,
    SpecFence,
};
use forged_types::{
    ErrorCode, OperationRequest, OperationResponse, Outcome, PacketResult, RunId, Stage,
};
use serde_json::json;

fn assert_send_sync<T: Send + Sync>() {}

#[test]
fn ledger_is_send_sync_and_arc_shareable() {
    assert_send_sync::<Ledger>();

    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Arc::new(Ledger::open(&dir.path().join("state.db")).expect("open"));
    let mut handles = Vec::new();
    for _ in 0..2 {
        let shared = Arc::clone(&ledger);
        handles.push(std::thread::spawn(move || {
            shared.pragmas().expect("pragmas via Arc").user_version
        }));
    }
    for handle in handles {
        assert_eq!(handle.join().expect("thread"), 25);
    }
}

#[test]
fn default_db_path_is_total() {
    let path = default_db_path();
    assert!(path.ends_with("state.db"));
}

#[allow(clippy::too_many_lines)]
#[test]
fn every_seam_member_is_consumable() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");

    // Pragmas: every field.
    let pragmas = ledger.pragmas().expect("pragmas");
    let _: (&String, i64, bool, i64, i64) = (
        &pragmas.journal_mode,
        pragmas.synchronous,
        pragmas.foreign_keys,
        pragmas.busy_timeout_ms,
        pragmas.user_version,
    );

    // Runs.
    let run_row = ledger
        .create_run(NewRun {
            run_id: RunId::new("run-seam").expect("valid"),
            work_id: "bead".to_owned(),
            repo: "repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/seam".to_owned(),
        })
        .expect("create_run");
    let _: (&String, &String, &String, &String, &String, &String) = (
        &run_row.run_id,
        &run_row.work_id,
        &run_row.repo,
        &run_row.base_ref,
        &run_row.branch,
        &run_row.protocol,
    );
    let _: (RunState, &Option<String>, &String, &String) = (
        run_row.state,
        &run_row.stop_reason,
        &run_row.created_at,
        &run_row.updated_at,
    );
    let run = run_row.run_id.clone();
    ledger.get_run(&run).expect("get_run");
    let stopped_run = ledger
        .create_run(NewRun {
            run_id: RunId::new("run-seam-stopped").expect("valid"),
            work_id: "bead-stopped".to_owned(),
            repo: "repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/seam-stopped".to_owned(),
        })
        .expect("create stopped seam run")
        .run_id;
    ledger
        .set_run_state(&stopped_run, RunState::Stopped, Some("pause".to_owned()))
        .expect("set_run_state");
    let reactivation = ledger
        .set_run_state(&stopped_run, RunState::Active, None)
        .expect_err("set_run_state refuses reactivation");
    assert_eq!(reactivation.code(), ErrorCode::InvalidRequest);
    assert_eq!(ledger.list_runs().expect("list_runs").len(), 2);

    // Packets.
    let packet_id = ledger
        .open_packet(NewPacket {
            run_id: run.clone(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "specs/seam.md".to_owned(),
            spec_sha256: "abcd".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("open_packet");
    let packet_row = ledger.get_packet(&packet_id).expect("get_packet");
    let _: (
        &String,
        &String,
        Stage,
        i64,
        &String,
        &String,
        &String,
        &String,
    ) = (
        &packet_row.packet_id,
        &packet_row.run_id,
        packet_row.stage,
        packet_row.seq,
        &packet_row.spec_path,
        &packet_row.spec_sha256,
        &packet_row.body_json,
        &packet_row.created_at,
    );
    assert_eq!(ledger.list_packets(&run).expect("list_packets").len(), 1);

    // Attempts.
    let ClaimedAttempt {
        attempt_id,
        claim_token,
    } = ledger
        .claim_packet(
            &packet_id,
            "claude:seam:1",
            &SpecFence::Sha256("abcd".to_owned()),
        )
        .expect("claim_packet");
    ledger
        .heartbeat_attempt(&claim_token)
        .expect("heartbeat_attempt");
    ledger
        .assert_attempt_live(&claim_token)
        .expect("assert_attempt_live");
    let attempt_row = ledger.get_attempt(attempt_id).expect("get_attempt");
    let _: (i64, &String, &String, &String, AttemptState) = (
        attempt_row.attempt_id,
        &attempt_row.packet_id,
        &attempt_row.claim_token,
        &attempt_row.claimant,
        attempt_row.state,
    );
    let _: &Option<String> = &attempt_row.revoke_reason;
    let _: &Option<String> = &attempt_row.fail_note;
    let _: &Option<String> = &attempt_row.result_json;
    let _: &String = &attempt_row.started_at;
    let _: &String = &attempt_row.updated_at;
    let _: &Option<String> = &attempt_row.last_heartbeat_at;
    let _: &Option<String> = &attempt_row.ended_at;
    assert!(ledger
        .find_attempt_by_token(&claim_token)
        .expect("find_attempt_by_token")
        .is_some());
    assert_eq!(
        ledger
            .list_live_attempts(Some(&run))
            .expect("list_live_attempts")
            .len(),
        1
    );

    // Operations, via a token-bearing begin.
    let request = OperationRequest {
        schema_version: 1,
        idempotency_key: "seam-key".to_owned(),
        run_id: Some(run.clone()),
        params: serde_json::Map::new(),
    };
    let outcome = ledger
        .begin_operation(
            "seam.op",
            &request,
            EffectClass::SafeRetry,
            Some(&claim_token),
        )
        .expect("begin_operation");
    let operation_id = match outcome {
        OperationOutcome::Fresh(ticket) => ticket.operation_id,
        OperationOutcome::Replayed(response) => response.operation_id,
    };
    let op_row = ledger
        .find_operation("seam.op", "seam-key")
        .expect("find_operation")
        .expect("row");
    let _: (&String, &String, &String, &String, EffectClass) = (
        &op_row.operation_id,
        &op_row.name,
        &op_row.idempotency_key,
        &op_row.request_sha256,
        op_row.effect_class,
    );
    let _: &Option<String> = &op_row.run_id;
    let _: &Option<String> = &op_row.claim_token;
    let _: OperationState = op_row.state;
    let _: &Option<String> = &op_row.response_json;
    let _: &String = &op_row.created_at;
    let _: &String = &op_row.updated_at;
    assert_eq!(
        ledger
            .list_inflight_operations(Some(&run))
            .expect("list_inflight_operations")
            .len(),
        1
    );
    ledger
        .complete_operation(
            &operation_id,
            &OperationResponse {
                ok: true,
                operation_id: operation_id.clone(),
                reused: false,
                result: Some(json!({})),
                error: None,
            },
        )
        .expect("complete_operation");
    // release_operation and resolve_interrupted_operation on a terminal row
    // both refuse — matching every LedgerError variant while we are at it.
    for err in [
        ledger
            .release_operation(&operation_id)
            .expect_err("release_operation"),
        ledger
            .resolve_interrupted_operation(
                &operation_id,
                &OperationResponse {
                    ok: true,
                    operation_id: operation_id.clone(),
                    reused: false,
                    result: None,
                    error: None,
                },
            )
            .expect_err("resolve_interrupted_operation"),
    ] {
        match err {
            LedgerError::Refused { code, message } => {
                assert_eq!(code, ErrorCode::InvalidRequest);
                assert!(!message.is_empty());
            }
            LedgerError::Internal { message } => panic!("unexpected Internal: {message}"),
        }
    }

    // Attempt terminal path.
    ledger
        .complete_packet(
            &packet_id,
            &claim_token,
            &PacketResult {
                schema: "forged.result/1".to_owned(),
                packet_id: packet_id.clone(),
                outcome: Outcome::Fix {
                    applied: true,
                    summary: "seam".to_owned(),
                },
            },
        )
        .expect("complete_packet");
    // fail/revoke/mark_reclaimed exercised for signature: all refuse on a
    // completed attempt.
    assert!(ledger.fail_packet(&packet_id, &claim_token, "n").is_err());
    assert!(ledger.revoke_attempt(attempt_id, "r").is_err());
    assert!(ledger.mark_reclaimed(attempt_id).is_err());

    // Merge slots: both outcomes.
    let acquired = ledger
        .acquire_merge_slot("repo#main", "seam-holder")
        .expect("acquire_merge_slot");
    match acquired {
        SlotOutcome::Acquired(row) => {
            let _: (&String, &String, &String) = (&row.slot, &row.holder, &row.acquired_at);
        }
        SlotOutcome::Held(row) => panic!("unexpectedly held by {}", row.holder),
    }
    match ledger
        .acquire_merge_slot("repo#main", "other")
        .expect("contended acquire")
    {
        SlotOutcome::Held(row) => assert_eq!(row.holder, "seam-holder"),
        SlotOutcome::Acquired(row) => panic!("stolen by {}", row.holder),
    }
    assert!(ledger
        .read_merge_slot("repo#main")
        .expect("read_merge_slot")
        .is_some());
    ledger
        .release_merge_slot("repo#main", "seam-holder")
        .expect("release_merge_slot");
    ledger
        .force_release_merge_slot("repo#main")
        .expect("force_release_merge_slot");

    // Events.
    ledger
        .append_event(Some(&run), "seam.event", json!({"k": 1}))
        .expect("append_event");
    assert!(ledger
        .append_event_kind_once(&run, "seam.once", json!({"k": 1}))
        .expect("append_event_kind_once"));
    assert_eq!(
        ledger
            .list_events_by_kind("seam.once")
            .expect("list_events_by_kind")
            .len(),
        1
    );
    let events = ledger.list_events(None, 0, 100).expect("list_events");
    let event = events.last().expect("at least one event");
    let _: (i64, &String, &Option<String>, &String, &String) = (
        event.event_id,
        &event.ts,
        &event.run_id,
        &event.kind,
        &event.payload_json,
    );
    assert!(!ledger
        .runtime_migration_completed("seam.migration")
        .expect("runtime_migration_completed"));
    assert!(ledger
        .mark_runtime_migration_completed("seam.migration")
        .expect("mark_runtime_migration_completed"));
    assert!(ledger
        .runtime_migration_completed("seam.migration")
        .expect("runtime migration completed"));

    // Usage.
    ledger
        .record_usage(NewUsage {
            run_id: run.clone(),
            packet_id: Some(packet_id),
            attempt_id: Some(attempt_id),
            provider: "claude".to_owned(),
            model: "fable".to_owned(),
            input_tokens: 10,
            output_tokens: 5,
            cache_read_tokens: None,
            cache_write_tokens: None,
            cost_usd: None,
            pricing_basis: None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("record_usage");
    let totals = ledger.usage_totals(&run).expect("usage_totals");
    let _: (u64, u64, u64, u64, f64, u32) = (
        totals.input_tokens,
        totals.output_tokens,
        totals.cache_read_tokens,
        totals.cache_write_tokens,
        totals.cost_usd_known,
        totals.rows_missing_cost,
    );

    ledger.close().expect("close");
}

/// The work-settlement seam: pending-list discovery, the probe-observation
/// upsert, claim/charge/finish, transactional watermark stamping, and the
/// episode reset — every exported settlement row field read from outside.
#[test]
fn work_settlement_seam_members_are_consumable() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    ledger
        .create_run(NewRun {
            run_id: RunId::new("run-settle").expect("valid"),
            work_id: "bead-settle".to_owned(),
            repo: "repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "feat/settle".to_owned(),
        })
        .expect("create_run");
    assert!(ledger
        .list_pending_work_settlements()
        .expect("empty discovery")
        .is_empty());
    ledger
        .append_event(
            Some("run-settle"),
            "run.bead-settlement.pending",
            json!({"schemaVersion": 1, "beadId": "bead-settle", "outcome": "landed",
                   "settled": false, "pending": true, "error": "lease held"}),
        )
        .expect("pending event");

    // Discovery: every PendingWorkSettlementRow field.
    let pending = ledger
        .list_pending_work_settlements()
        .expect("discovery")
        .remove(0);
    let _: (&String, i64, &String, &Option<String>) = (
        &pending.run_id,
        pending.event_id,
        &pending.payload_json,
        &pending.probe_wake_at,
    );

    // Probe-observation upsert creates the row without opening the budget.
    ledger
        .record_work_settlement_probe(
            "run-settle",
            "2030-01-01T00:01:00.000000000Z",
            60,
            "in_progress",
            Some("forged:bead-settle:0".to_owned()),
            Some("-1".to_owned()),
        )
        .expect("record_bead_settlement_probe");

    // Claim / charge (with the watermark stamp) / finish.
    let claimed = ledger
        .claim_work_settlement_retry(
            "run-settle",
            "seam-token",
            "2030-01-01T00:00:00.000000000Z",
            "2030-01-01T00:01:00.000000000Z",
        )
        .expect("claim_bead_settlement_retry")
        .expect("claimed");
    assert_eq!(claimed.budget, forged_ledger::WORK_SETTLEMENT_RETRY_BUDGET);
    let charged = ledger
        .charge_work_settlement_retry(
            "run-settle",
            "seam-token",
            "2030-01-01T00:00:30.000000000Z",
            "2030-01-01T00:08:00.000000000Z",
            pending.event_id,
        )
        .expect("charge_bead_settlement_retry");
    assert_eq!(charged.event_id, Some(pending.event_id));

    // The pass-minted re-record stamps the watermark transactionally.
    assert!(ledger
        .append_work_settlement_pending_if_pending(
            "run-settle",
            pending.event_id,
            json!({"schemaVersion": 1, "beadId": "bead-settle", "outcome": "landed",
                   "settled": false, "pending": true, "error": "still held", "attempt": 1}),
        )
        .expect("append_bead_settlement_pending_if_pending"));
    // A charge for a superseded pending event refuses at the stream head.
    ledger
        .charge_work_settlement_retry(
            "run-settle",
            "seam-token",
            "2030-01-01T00:00:30.000000000Z",
            "2030-01-01T00:08:00.000000000Z",
            pending.event_id,
        )
        .expect_err("charge refuses once its pending event is superseded");
    assert!(ledger
        .finish_work_settlement_retry(
            "run-settle",
            "seam-token",
            RetryErrorUpdate::Set("still held".to_owned())
        )
        .expect("finish_bead_settlement_retry"));
    // A failed probe read defers the wake without touching observations.
    ledger
        .defer_work_settlement_probe("run-settle", "2030-01-01T00:02:00.000000000Z", 120)
        .expect("defer_bead_settlement_probe");
    // The other two RetryErrorUpdate arms are addressable at the seam.
    assert!(!ledger
        .finish_work_settlement_retry("run-settle", "seam-token", RetryErrorUpdate::Keep)
        .expect("finish keep (already released)"));
    assert!(!ledger
        .finish_work_settlement_retry("run-settle", "seam-token", RetryErrorUpdate::Clear)
        .expect("finish clear (already released)"));

    // Every WorkSettlementRetryRow field.
    let row = ledger
        .get_work_settlement_retry("run-settle")
        .expect("get_bead_settlement_retry")
        .expect("row");
    let _: (&String, u32, u32, &Option<String>, &Option<String>) = (
        &row.run_id,
        row.budget,
        row.used,
        &row.next_wake_at,
        &row.last_error,
    );
    let _: (&Option<String>, &Option<String>, Option<i64>) =
        (&row.claim_token, &row.claim_lease_until, row.event_id);
    let _: (&Option<String>, Option<u32>, &Option<String>) = (
        &row.probe_wake_at,
        row.probe_interval_s,
        &row.last_observed_status,
    );
    let _: (&Option<String>, &Option<String>, &String, &String) = (
        &row.last_observed_assignee,
        &row.last_observed_revision,
        &row.created_at,
        &row.updated_at,
    );
    let repended = ledger
        .list_pending_work_settlements()
        .expect("re-discovery")
        .remove(0);
    assert_eq!(row.event_id, Some(repended.event_id));

    // Epoch reset: the pass's own re-record loses; a newer episode wins.
    assert!(!ledger
        .reset_work_settlement_retry_for_new_episode("run-settle", repended.event_id)
        .expect("own re-record reset"));
    ledger
        .append_event(
            Some("run-settle"),
            "run.bead-settlement.pending",
            json!({"schemaVersion": 1, "beadId": "bead-settle", "outcome": "landed",
                   "settled": false, "pending": true, "error": "new episode"}),
        )
        .expect("new episode pending");
    let fresh = ledger
        .list_pending_work_settlements()
        .expect("fresh discovery")
        .remove(0);
    assert!(ledger
        .reset_work_settlement_retry_for_new_episode("run-settle", fresh.event_id)
        .expect("reset_bead_settlement_retry_for_new_episode"));

    // Convergence retires the run at the stream itself.
    assert!(ledger
        .append_work_settlement_succeeded_if_pending(
            "run-settle",
            fresh.event_id,
            json!({"schema": "forged.bead-settlement/1", "beadId": "bead-settle",
                   "outcome": "landed", "settled": true}),
        )
        .expect("append_bead_settlement_succeeded_if_pending"));
    assert!(ledger
        .list_pending_work_settlements()
        .expect("retired discovery")
        .is_empty());
    ledger.close().expect("close");
}

#[test]
fn enums_round_trip_their_ddl_strings() {
    for (state, s) in [(RunState::Active, "active"), (RunState::Stopped, "stopped")] {
        assert_eq!(state.as_str(), s);
        assert_eq!(RunState::try_from(s).expect("parse"), state);
    }
    for (state, s) in [
        (AttemptState::Running, "running"),
        (AttemptState::Completed, "completed"),
        (AttemptState::Failed, "failed"),
        (AttemptState::Revoking, "revoking"),
        (AttemptState::Reclaimed, "reclaimed"),
        (AttemptState::Stopped, "stopped"),
    ] {
        assert_eq!(state.as_str(), s);
        assert_eq!(AttemptState::try_from(s).expect("parse"), state);
    }
    for (scope, s) in [
        (forged_ledger::RevokeScope::Work, "bead"),
        (forged_ledger::RevokeScope::Attempt, "attempt"),
        (forged_ledger::RevokeScope::Deadline, "deadline"),
    ] {
        assert_eq!(scope.as_str(), s);
        assert_eq!(
            forged_ledger::RevokeScope::try_from(s).expect("parse"),
            scope
        );
    }
    assert!(forged_ledger::RevokeScope::try_from("run").is_err());
    for (class, s) in [
        (EffectClass::SafeRetry, "safe-retry"),
        (EffectClass::ObserveOnly, "observe-only"),
        (EffectClass::HumanAmbiguous, "human-ambiguous"),
    ] {
        assert_eq!(class.as_str(), s);
        assert_eq!(EffectClass::try_from(s).expect("parse"), class);
    }
    for (state, s) in [
        (OperationState::InProgress, "in_progress"),
        (OperationState::Terminal, "terminal"),
    ] {
        assert_eq!(state.as_str(), s);
        assert_eq!(OperationState::try_from(s).expect("parse"), state);
    }
    assert!(RunState::try_from("bogus").is_err());
}
