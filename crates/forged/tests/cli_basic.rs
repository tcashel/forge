//! Envelope-level CLI behavior: help coverage, key derivation and
//! overrides, replay semantics, the two explicit-key refusals, and
//! read-only defaults.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

fn help_text(env: &TestEnv, args: &[&str]) -> String {
    let out = env.forged_cmd(args).output().expect("forged --help runs");
    format!(
        "{}{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    )
}

#[test]
fn help_lists_every_command_and_subcommand_flags() {
    let env = TestEnv::new("forged-help");
    let top = help_text(&env, &["--help"]);
    for command in [
        "doctor",
        "init",
        "run",
        "packet",
        "claim-next",
        "gate",
        "reconcile",
        "usage",
        "events",
        "worktree",
        "mcp",
    ] {
        assert!(top.contains(command), "--help must list {command}: {top}");
    }
    let run = help_text(&env, &["run", "--help"]);
    for sub in ["start", "advance", "drive", "status"] {
        assert!(run.contains(sub), "run --help must list {sub}");
    }
    let start = help_text(&env, &["run", "start", "--help"]);
    for flag in ["--bead", "--repo", "--spec", "--base-ref", "--idempotency-key"] {
        assert!(start.contains(flag), "run start --help must document {flag}");
    }
    let packet = help_text(&env, &["packet", "--help"]);
    for sub in ["show", "claim", "complete", "fail", "heartbeat"] {
        assert!(packet.contains(sub), "packet --help must list {sub}");
    }
    let complete = help_text(&env, &["packet", "complete", "--help"]);
    for flag in ["--packet", "--attempt", "--claim-token", "--result"] {
        assert!(
            complete.contains(flag),
            "packet complete --help must document {flag}"
        );
    }
    let retire = help_text(&env, &["worktree", "retire", "--help"]);
    for flag in ["--run", "--force", "--run-state-terminal", "--idempotency-key"] {
        assert!(
            retire.contains(flag),
            "worktree retire --help must document {flag}"
        );
    }
    let usage = help_text(&env, &["usage", "--help"]);
    assert!(usage.contains("ingest"), "usage --help must list ingest");
    let events = help_text(&env, &["events", "--help"]);
    for flag in ["--run", "--after", "--limit"] {
        assert!(events.contains(flag), "events --help must document {flag}");
    }
}

#[test]
fn init_derives_its_key_replays_and_is_idempotent() {
    let env = TestEnv::new("forged-init");
    let (code, first) = env.forged(&["init"]);
    assert_eq!(code, 0, "init: {first}");
    assert_eq!(first["ok"], json!(true));
    assert_eq!(first["reused"], json!(false));
    assert!(env.anvil.join("runs").exists());

    // Same derived key op:init:-:-:- → replay: the stored envelope with
    // reused: true, effect not re-fired.
    let (code, second) = env.forged(&["init"]);
    assert_eq!(code, 0);
    assert_eq!(second["ok"], json!(true));
    assert_eq!(second["reused"], json!(true));
    assert_eq!(second["operationId"], first["operationId"]);
    assert_eq!(second["result"], first["result"]);

    // An explicit key overrides the derivation and re-runs the effect.
    let (code, third) = env.forged(&["init", "--idempotency-key", "op:init:fresh"]);
    assert_eq!(code, 0);
    assert_eq!(third["reused"], json!(false));
    assert_ne!(third["operationId"], first["operationId"]);
}

#[test]
fn replay_uses_the_ledger_operation_outcome() {
    // AC 5 at the seam: re-running a mutating request with the same key
    // replays via OperationOutcome::Replayed and never re-fires.
    let env = TestEnv::new("forged-replay-seam");
    let ledger = env.ledger();
    let params = match json!({"a": 1}) {
        Value::Object(map) => map,
        _ => unreachable!(),
    };
    let request = forged_types::OperationRequest {
        schema_version: 1,
        idempotency_key: "op:test:replay".to_owned(),
        run_id: None,
        params,
    };
    let first = ledger
        .begin_operation("test", &request, forged_ledger::EffectClass::SafeRetry, None)
        .expect("begin");
    let ticket = match first {
        forged_ledger::OperationOutcome::Fresh(ticket) => ticket,
        other => panic!("first begin must be fresh: {other:?}"),
    };
    let response = forged_types::OperationResponse {
        ok: true,
        operation_id: ticket.operation_id.clone(),
        reused: false,
        result: Some(json!({"n": 1})),
        error: None,
    };
    ledger
        .complete_operation(&ticket.operation_id, &response)
        .expect("complete");
    let second = ledger
        .begin_operation("test", &request, forged_ledger::EffectClass::SafeRetry, None)
        .expect("second begin");
    match second {
        forged_ledger::OperationOutcome::Replayed(replayed) => {
            assert!(replayed.reused, "replay must set reused: true");
            assert_eq!(replayed.operation_id, ticket.operation_id);
            assert_eq!(replayed.result, Some(json!({"n": 1})));
        }
        other => panic!("second begin must replay: {other:?}"),
    }
    ledger.close().expect("close");
}

#[test]
fn claim_next_and_worktree_retire_require_an_explicit_key() {
    let env = TestEnv::new("forged-explicit-keys");
    let (code, resp) = env.forged(&["claim-next", "--holder", "w1"]);
    assert_eq!(code, 1);
    assert_eq!(resp["ok"], json!(false));
    assert_eq!(resp["error"]["code"], json!("INVALID_REQUEST"));

    let (code, resp) = env.forged(&["worktree", "retire", "--run", "r1"]);
    assert_eq!(code, 1);
    assert_eq!(resp["error"]["code"], json!("INVALID_REQUEST"));

    // With a key, claim-next against an empty frontier is a SUCCESS with
    // claimed: null — never an error.
    let (code, resp) = env.forged(&[
        "claim-next",
        "--holder",
        "w1",
        "--idempotency-key",
        "op:claim_next:manual-1",
    ]);
    assert_eq!(code, 0, "empty frontier is success: {resp}");
    assert_eq!(resp["ok"], json!(true));
    assert_eq!(resp["result"]["claimed"], Value::Null);
}

#[test]
fn read_only_commands_default_their_key_and_never_touch_the_store() {
    let env = TestEnv::new("forged-read-defaults");
    let (code, resp) = env.forged(&["events"]);
    assert_eq!(code, 0);
    assert_eq!(resp["operationId"], json!("op:events_tail:read"));
    assert_eq!(resp["reused"], json!(false));

    let (code, resp) = env.forged(&["usage"]);
    assert_eq!(code, 0);
    assert_eq!(resp["operationId"], json!("op:usage_report:read"));
    assert_eq!(resp["result"]["rows"], json!([]));

    // The operation store holds nothing after reads.
    let ledger = env.ledger();
    assert!(ledger
        .find_operation("events_tail", "op:events_tail:read")
        .expect("probe")
        .is_none());
    assert!(ledger
        .find_operation("usage_report", "op:usage_report:read")
        .expect("probe")
        .is_none());
    ledger.close().expect("close");
}

#[test]
fn errors_are_envelopes_on_stdout_with_exit_one() {
    let env = TestEnv::new("forged-error-envelopes");
    let (code, resp) = env.forged(&["run", "status", "--run", "nope"]);
    assert_eq!(code, 1);
    assert_eq!(resp["ok"], json!(false));
    assert_eq!(resp["error"]["code"], json!("RUN_NOT_FOUND"));

    let (code, resp) = env.forged(&["run", "advance", "--run", "nope"]);
    assert_eq!(code, 1);
    assert_eq!(resp["error"]["code"], json!("RUN_NOT_FOUND"));

    let (code, resp) = env.forged(&["reconcile", "--run", "nope"]);
    assert_eq!(code, 1);
    assert_eq!(resp["ok"], json!(false));
}

#[test]
fn packet_heartbeat_is_unfenced_and_read_shaped() {
    let env = TestEnv::new("forged-heartbeat");
    let (code, resp) = env.forged(&[
        "packet",
        "heartbeat",
        "--packet",
        "r/implement/1",
        "--attempt",
        "1",
        "--claim-token",
        "no-such-token",
    ]);
    // A stale token refuses, but the key was defaulted like a read and the
    // operation store was never touched.
    assert_eq!(code, 1);
    assert_eq!(resp["operationId"], json!("op:packet_heartbeat:read"));
    assert_eq!(resp["error"]["code"], json!("STALE_CLAIM_TOKEN"));
    let ledger = env.ledger();
    assert!(ledger
        .list_inflight_operations(None)
        .expect("inflight")
        .is_empty());
    ledger.close().expect("close");
}
