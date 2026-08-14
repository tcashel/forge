//! Acceptance tests for packets, the idempotent operation store, merge
//! slots, usage totals, and deterministic close.

use forged_ledger::{
    EffectClass, Ledger, NewPacket, NewRun, NewUsage, OperationOutcome, SlotOutcome, SpecFence,
};
use forged_types::{ErrorCode, OpError, OperationRequest, OperationResponse, RunId, Stage};
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

fn new_packet(run_id: &str) -> NewPacket {
    NewPacket {
        run_id: run_id.to_owned(),
        stage: Stage::Implement,
        seq: 7,
        spec_path: "specs/y.md".to_owned(),
        spec_sha256: "beef".to_owned(),
        spec_revision: None,
        body_json: "{\"schema\":\"forged.packet/1\"}".to_owned(),
    }
}

fn request(key: &str, run_id: Option<&str>, params: serde_json::Value) -> OperationRequest {
    let params = match params {
        serde_json::Value::Object(map) => map,
        _ => panic!("params literal must be an object"),
    };
    OperationRequest {
        schema_version: 1,
        idempotency_key: key.to_owned(),
        run_id: run_id.map(str::to_owned),
        params,
    }
}

fn ok_response(operation_id: &str) -> OperationResponse {
    OperationResponse {
        ok: true,
        operation_id: operation_id.to_owned(),
        reused: false,
        result: Some(json!({"n": 3})),
        error: None,
    }
}

fn fresh(outcome: OperationOutcome) -> String {
    match outcome {
        OperationOutcome::Fresh(ticket) => ticket.operation_id,
        other => panic!("expected Fresh, got {other:?}"),
    }
}

fn replayed(outcome: OperationOutcome) -> OperationResponse {
    match outcome {
        OperationOutcome::Replayed(response) => response,
        other => panic!("expected Replayed, got {other:?}"),
    }
}

#[test]
fn open_packet_is_idempotent_on_byte_identical_content() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-pkt");

    let id = ledger.open_packet(new_packet(&run)).expect("open packet");
    assert_eq!(id, format!("{run}/implement/7"));

    // Same triple → same id, no new row.
    let again = ledger.open_packet(new_packet(&run)).expect("re-open");
    assert_eq!(again, id);
    assert_eq!(ledger.list_packets(&run).expect("list").len(), 1);

    // A REVISED SPEC re-pins the unclaimed packet in place: spec columns
    // only, and the definition the packet was opened with is untouched.
    let mut revised = new_packet(&run);
    revised.spec_sha256 = "cafe".to_owned();
    revised.spec_revision = Some("-6192208415116251521".to_owned());
    assert_eq!(ledger.open_packet(revised.clone()).expect("re-pin"), id);
    assert_eq!(ledger.list_packets(&run).expect("list").len(), 1);
    let repinned = ledger.get_packet(&id).expect("get packet");
    assert_eq!(repinned.spec_sha256, "cafe");
    assert_eq!(
        repinned.spec_revision.as_deref(),
        Some("-6192208415116251521")
    );
    assert_eq!(
        repinned.body_json,
        new_packet(&run).body_json,
        "a re-pin revises the spec and nothing else"
    );

    // A DIFFERING BODY is a changed definition, not a revised spec, and a
    // packet's contract is fixed at open.
    let mut redefined = new_packet(&run);
    redefined.body_json.push(' ');
    let err = ledger
        .open_packet(redefined)
        .expect_err("a differing definition must be refused");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    assert_eq!(
        ledger.get_packet(&id).expect("get packet").body_json,
        new_packet(&run).body_json,
        "the refused re-open changed nothing"
    );
    // Put the spec back so the rest of this test reads the original pin.
    ledger.open_packet(new_packet(&run)).expect("restore");

    // Unknown run refuses with RunNotFound, explicitly, not via FK.
    let mut orphan = new_packet("run-missing");
    orphan.run_id = "run-missing".to_owned();
    let err = ledger.open_packet(orphan).expect_err("must refuse");
    assert_eq!(err.code(), ErrorCode::RunNotFound);

    let row = ledger.get_packet(&id).expect("get packet");
    assert_eq!(row.packet_id, id);
    assert_eq!(row.stage, Stage::Implement);
    assert_eq!(row.body_json, new_packet(&run).body_json);
    let err = ledger.get_packet("nope").expect_err("unknown packet");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    ledger.close().expect("close");
}

#[test]
fn duplicate_run_and_missing_run_refuse() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-dup");
    let err = ledger
        .create_run(NewRun {
            run_id: RunId::new(run.as_str()).expect("valid"),
            bead_id: "b".to_owned(),
            repo: "r".to_owned(),
            base_ref: "main".to_owned(),
            branch: "f".to_owned(),
        })
        .expect_err("duplicate id");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    let err = ledger.get_run("run-missing").expect_err("unknown run");
    assert_eq!(err.code(), ErrorCode::RunNotFound);
    let err = ledger.list_packets("run-missing").expect_err("unknown run");
    assert_eq!(err.code(), ErrorCode::RunNotFound);
    assert_eq!(ledger.list_runs().expect("list").len(), 1);
    ledger.close().expect("close");
}

#[test]
fn event_kind_once_rejects_a_competing_payload() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-kind-once");
    assert!(ledger
        .append_event_kind_once(&run, "upgrade.once", json!({"snapshot": 1}))
        .expect("first append"));
    assert!(!ledger
        .append_event_kind_once(&run, "upgrade.once", json!({"snapshot": 2}))
        .expect("competing append"));
    let events = ledger
        .list_events_by_kind("upgrade.once")
        .expect("events by kind");
    assert_eq!(events.len(), 1);
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&events[0].payload_json).expect("event payload"),
        json!({"snapshot": 1})
    );
    ledger.close().expect("close");
}

#[test]
fn idempotency_replays_byte_identically() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-idem");
    let req = request("key-a", Some(&run), json!({"a": 1}));

    let operation_id = fresh(
        ledger
            .begin_operation("op.do", &req, EffectClass::SafeRetry, None)
            .expect("begin"),
    );
    let stored = ok_response(&operation_id);
    ledger
        .complete_operation(&operation_id, &stored)
        .expect("complete");

    let first = replayed(
        ledger
            .begin_operation("op.do", &req, EffectClass::SafeRetry, None)
            .expect("replay"),
    );
    assert!(first.reused);
    assert_eq!(first.result, stored.result, "result payload verbatim");
    let second = replayed(
        ledger
            .begin_operation("op.do", &req, EffectClass::SafeRetry, None)
            .expect("replay again"),
    );
    // Two successive replays serialize byte-identically.
    assert_eq!(
        serde_json::to_string(&first).expect("serialize"),
        serde_json::to_string(&second).expect("serialize")
    );
    ledger.close().expect("close");
}

#[test]
fn stored_failures_replay_verbatim() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-failstore");
    let req = request("key-f", Some(&run), json!({}));

    let operation_id = fresh(
        ledger
            .begin_operation("op.fail", &req, EffectClass::SafeRetry, None)
            .expect("begin"),
    );
    let failure = OperationResponse {
        ok: false,
        operation_id: operation_id.clone(),
        reused: false,
        result: None,
        error: Some(OpError {
            code: ErrorCode::WorktreeDirty,
            message: "uncommitted changes".to_owned(),
            recoverable: true,
            detail: None,
        }),
    };
    ledger
        .complete_operation(&operation_id, &failure)
        .expect("store semantic failure");

    let replay = replayed(
        ledger
            .begin_operation("op.fail", &req, EffectClass::SafeRetry, None)
            .expect("replay"),
    );
    assert!(replay.reused);
    assert!(!replay.ok, "a stored failure replays as that failure");
    assert_eq!(replay.error, failure.error);
    ledger.close().expect("close");
}

#[test]
fn conflicts_in_progress_and_release_semantics() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-conflict");
    let req = request("key-c", Some(&run), json!({"x": 1}));

    let operation_id = fresh(
        ledger
            .begin_operation("op.c", &req, EffectClass::SafeRetry, None)
            .expect("begin"),
    );

    // Same key, different params → IdempotencyConflict.
    let different = request("key-c", Some(&run), json!({"x": 2}));
    let err = ledger
        .begin_operation("op.c", &different, EffectClass::SafeRetry, None)
        .expect_err("conflict");
    assert_eq!(err.code(), ErrorCode::IdempotencyConflict);

    // Concurrent second begin while in_progress → OperationInProgress.
    let err = ledger
        .begin_operation("op.c", &req, EffectClass::SafeRetry, None)
        .expect_err("in progress");
    assert_eq!(err.code(), ErrorCode::OperationInProgress);

    // release_operation removes the row so a retry gets Fresh.
    ledger.release_operation(&operation_id).expect("release");
    let retry_id = fresh(
        ledger
            .begin_operation("op.c", &req, EffectClass::SafeRetry, None)
            .expect("fresh after release"),
    );
    ledger
        .complete_operation(&retry_id, &ok_response(&retry_id))
        .expect("complete");

    // release on a terminal row refuses, the row survives, and a
    // subsequent begin still replays.
    let err = ledger
        .release_operation(&retry_id)
        .expect_err("terminal release");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    assert!(ledger
        .find_operation("op.c", "key-c")
        .expect("find")
        .is_some());
    let replay = replayed(
        ledger
            .begin_operation("op.c", &req, EffectClass::SafeRetry, None)
            .expect("replay"),
    );
    assert!(replay.reused);

    // Unknown ids refuse with InvalidRequest.
    for err in [
        ledger.release_operation("nope").expect_err("unknown"),
        ledger
            .complete_operation("nope", &ok_response("nope"))
            .expect_err("unknown"),
        ledger
            .resolve_interrupted_operation("nope", &ok_response("nope"))
            .expect_err("unknown"),
    ] {
        assert_eq!(err.code(), ErrorCode::InvalidRequest);
    }

    // A mismatched response.operation_id refuses.
    let operation_id = fresh(
        ledger
            .begin_operation(
                "op.mismatch",
                &request("key-m", Some(&run), json!({})),
                EffectClass::SafeRetry,
                None,
            )
            .expect("begin"),
    );
    let err = ledger
        .complete_operation(&operation_id, &ok_response("someone-else"))
        .expect_err("mismatched id");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    // schema_version != 1 refuses; float params refuse as InvalidRequest.
    let mut bad_schema = request("key-s", Some(&run), json!({}));
    bad_schema.schema_version = 2;
    let err = ledger
        .begin_operation("op.s", &bad_schema, EffectClass::SafeRetry, None)
        .expect_err("bad schema");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    let float_params = request("key-fl", Some(&run), json!({"x": 1.5}));
    let err = ledger
        .begin_operation("op.fl", &float_params, EffectClass::SafeRetry, None)
        .expect_err("float params");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    assert!(
        ledger
            .find_operation("op.fl", "key-fl")
            .expect("find")
            .is_none(),
        "refused before any row was written"
    );
    ledger.close().expect("close");
}

#[test]
fn idempotency_identity_spans_run_and_effect_class() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run_a = make_run(&ledger, "run-ident-a");
    let run_b = make_run(&ledger, "run-ident-b");
    let req = request("key-i", Some(&run_a), json!({"p": 1}));

    let operation_id = fresh(
        ledger
            .begin_operation("op.i", &req, EffectClass::SafeRetry, None)
            .expect("begin"),
    );
    ledger
        .complete_operation(&operation_id, &ok_response(&operation_id))
        .expect("complete");

    // Same name/key/params, DIFFERENT run → conflict, never a replay.
    let other_run = request("key-i", Some(&run_b), json!({"p": 1}));
    let err = ledger
        .begin_operation("op.i", &other_run, EffectClass::SafeRetry, None)
        .expect_err("different run");
    assert_eq!(err.code(), ErrorCode::IdempotencyConflict);

    // Same everything, different effect class → conflict.
    let err = ledger
        .begin_operation("op.i", &req, EffectClass::ObserveOnly, None)
        .expect_err("different effect class");
    assert_eq!(err.code(), ErrorCode::IdempotencyConflict);

    // Token-bearing request whose run_id is not the claiming attempt's run.
    let packet = ledger
        .open_packet(NewPacket {
            run_id: run_a.clone(),
            stage: Stage::Fix,
            seq: 1,
            spec_path: "specs/y.md".to_owned(),
            spec_sha256: "beef".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("open packet");
    let claim = ledger
        .claim_packet(
            &packet,
            "claude:sess:9",
            &SpecFence::Sha256("beef".to_owned()),
        )
        .expect("claim");
    let wrong_run = request("key-t", Some(&run_b), json!({}));
    let err = ledger
        .begin_operation(
            "op.t",
            &wrong_run,
            EffectClass::SafeRetry,
            Some(&claim.claim_token),
        )
        .expect_err("wrong run under token");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    let no_run = request("key-t", None, json!({}));
    let err = ledger
        .begin_operation(
            "op.t",
            &no_run,
            EffectClass::SafeRetry,
            Some(&claim.claim_token),
        )
        .expect_err("None run under token");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    // Unknown token refuses with StaleClaimToken.
    let err = ledger
        .begin_operation(
            "op.t",
            &request("key-t", Some(&run_a), json!({})),
            EffectClass::SafeRetry,
            Some("not-a-token"),
        )
        .expect_err("unknown token");
    assert_eq!(err.code(), ErrorCode::StaleClaimToken);
    ledger.close().expect("close");
}

#[test]
fn merge_slots_hold_release_and_force_release() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let slot = "example/repo#main";

    let acquired = match ledger
        .acquire_merge_slot(slot, "holder-a")
        .expect("acquire")
    {
        SlotOutcome::Acquired(row) => row,
        other => panic!("expected Acquired, got {other:?}"),
    };
    assert_eq!(acquired.holder, "holder-a");

    // Second holder → Held carrying the original holder and clock.
    match ledger.acquire_merge_slot(slot, "holder-b").expect("held") {
        SlotOutcome::Held(row) => {
            assert_eq!(row.holder, "holder-a");
            assert_eq!(row.acquired_at, acquired.acquired_at);
        }
        other => panic!("expected Held, got {other:?}"),
    }

    // Re-acquire while held: acquired_at exactly equals the value read
    // before — the clock never resets while held.
    match ledger
        .acquire_merge_slot(slot, "holder-a")
        .expect("re-acquire")
    {
        SlotOutcome::Acquired(row) => assert_eq!(row.acquired_at, acquired.acquired_at),
        other => panic!("expected Acquired, got {other:?}"),
    }

    // Wrong holder cannot release.
    let err = ledger
        .release_merge_slot(slot, "holder-b")
        .expect_err("wrong holder");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    ledger
        .release_merge_slot(slot, "holder-a")
        .expect("release");
    assert!(ledger.read_merge_slot(slot).expect("read").is_none());
    // Releasing an absent slot is idempotent.
    ledger
        .release_merge_slot(slot, "holder-a")
        .expect("idempotent release");

    // A subsequent acquire by a second holder gets a parseable clock >= the
    // prior value (lexicographic on the fixed-width format). Never strict.
    match ledger
        .acquire_merge_slot(slot, "holder-b")
        .expect("acquire after release")
    {
        SlotOutcome::Acquired(row) => {
            assert_eq!(row.holder, "holder-b");
            assert!(row.acquired_at >= acquired.acquired_at);
            assert!(row.acquired_at.parse::<jiff::Timestamp>().is_ok());
        }
        other => panic!("expected Acquired, got {other:?}"),
    }

    // Force release appends its event; on an absent slot it is event-free.
    ledger.force_release_merge_slot(slot).expect("force");
    assert!(ledger.read_merge_slot(slot).expect("read").is_none());
    let events = ledger.list_events(None, 0, 100).expect("events");
    let force_events: Vec<_> = events
        .iter()
        .filter(|e| e.kind == "merge_slot.force_released")
        .collect();
    assert_eq!(force_events.len(), 1);
    let payload: serde_json::Value =
        serde_json::from_str(&force_events[0].payload_json).expect("payload");
    assert_eq!(payload["slot"], json!(slot));
    assert_eq!(payload["holder"], json!("holder-b"));
    ledger.force_release_merge_slot(slot).expect("no-op force");
    let events = ledger.list_events(None, 0, 100).expect("events");
    assert_eq!(
        events
            .iter()
            .filter(|e| e.kind == "merge_slot.force_released")
            .count(),
        1,
        "force-releasing an absent slot is event-free"
    );
    ledger.close().expect("close");
}

#[test]
fn re_recording_one_attempt_overwrites_instead_of_doubling() {
    // Usage is captured when an attempt settles and can be re-derived from
    // the same packet directory afterwards by `usage ingest`. Without the
    // natural key the second read would double the run's spend.
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-usage-upsert");
    let row = |output: u64, cost: f64| NewUsage {
        run_id: run.clone(),
        packet_id: Some("run/implementation/0".to_owned()),
        attempt_id: Some(7),
        provider: "codex".to_owned(),
        model: "gpt-5.6-sol".to_owned(),
        input_tokens: 100,
        output_tokens: output,
        cache_read_tokens: Some(10),
        cache_write_tokens: None,
        cost_usd: Some(cost),
        pricing_basis: Some("imputed_api_rate".to_owned()),
        rate_limit_used_percent: None,
        web_search_requests: None,
    };
    ledger.record_usage(row(200, 0.25)).expect("first record");
    ledger.record_usage(row(250, 0.30)).expect("second record");

    let rows = ledger.list_usage(&run).expect("list");
    assert_eq!(rows.len(), 1, "one attempt is one row: {rows:?}");
    assert_eq!(rows[0].output_tokens, 250, "the newest read wins");
    let totals = ledger.usage_totals(&run).expect("totals");
    assert_eq!(totals.input_tokens, 100, "not doubled");
    assert!((totals.cost_usd_known - 0.30).abs() < f64::EPSILON);

    // A different attempt of the same packet is a different row: tokens
    // burned on a failed attempt are the run's rework cost, not a
    // duplicate of the attempt that replaced it.
    let mut retry = row(400, 0.50);
    retry.attempt_id = Some(8);
    ledger.record_usage(retry).expect("retry record");
    assert_eq!(ledger.list_usage(&run).expect("list").len(), 2);

    ledger.close().expect("close");
}

#[test]
fn usage_totals_report_missing_costs_honestly() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let run = make_run(&ledger, "run-usage");

    ledger
        .record_usage(NewUsage {
            run_id: run.clone(),
            packet_id: None,
            attempt_id: None,
            provider: "claude".to_owned(),
            model: "fable".to_owned(),
            input_tokens: 1000,
            output_tokens: 200,
            cache_read_tokens: Some(50),
            cache_write_tokens: None,
            cost_usd: Some(0.25),
            pricing_basis: Some("list".to_owned()),
            rate_limit_used_percent: Some(3.5),
            web_search_requests: Some(4),
        })
        .expect("record");
    ledger
        .record_usage(NewUsage {
            run_id: run.clone(),
            packet_id: Some("p".to_owned()),
            attempt_id: Some(1),
            provider: "codex".to_owned(),
            model: "gpt".to_owned(),
            input_tokens: 500,
            output_tokens: 100,
            cache_read_tokens: None,
            cache_write_tokens: Some(25),
            cost_usd: None,
            pricing_basis: None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("record");
    // Another run's rows never leak into this run's totals.
    let other = make_run(&ledger, "run-usage-other");
    ledger
        .record_usage(NewUsage {
            run_id: other,
            packet_id: None,
            attempt_id: None,
            provider: "claude".to_owned(),
            model: "fable".to_owned(),
            input_tokens: 9999,
            output_tokens: 9999,
            cache_read_tokens: None,
            cache_write_tokens: None,
            cost_usd: None,
            pricing_basis: None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("record");

    let totals = ledger.usage_totals(&run).expect("totals");
    assert_eq!(totals.input_tokens, 1500);
    assert_eq!(totals.output_tokens, 300);
    assert_eq!(totals.cache_read_tokens, 50);
    assert_eq!(totals.cache_write_tokens, 25);
    assert!((totals.cost_usd_known - 0.25).abs() < f64::EPSILON);
    assert_eq!(totals.rows_missing_cost, 1);
    ledger.close().expect("close");
}

#[test]
fn close_is_deterministic_and_idempotent() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).expect("open");
    make_run(&ledger, "run-close");
    let survivor = ledger.clone();

    ledger.close().expect("close");
    // Reopen immediately — no sleep anywhere: close joined the writer.
    let reopened = Ledger::open(&path).expect("reopen");
    assert_eq!(
        reopened.list_runs().expect("list").len(),
        1,
        "state persisted"
    );
    reopened.close().expect("close reopened");

    // A call on a surviving clone refuses with Internal.
    let err = survivor.get_run("run-close").expect_err("must refuse");
    assert_eq!(err.code(), ErrorCode::Internal);
    assert!(
        err.to_string()
            .contains("ledger writer thread is unavailable"),
        "unexpected message: {err}"
    );
    // A second close is an idempotent Ok.
    survivor.close().expect("second close");
}
