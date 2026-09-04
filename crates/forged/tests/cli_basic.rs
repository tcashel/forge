//! Envelope-level CLI behavior: help coverage, key derivation and
//! overrides, replay semantics, the three explicit-key refusals, and
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
        "next",
        "doctor",
        "init",
        "definition",
        "run",
        "epic",
        "packet",
        "session",
        "claim-next",
        "gate",
        "reconcile",
        "usage",
        "events",
        "overview",
        "wait",
        "work",
        "worktree",
        "mcp",
    ] {
        assert!(top.contains(command), "--help must list {command}: {top}");
    }
    let next = help_text(&env, &["next", "--help"]);
    for flag in [
        "--repo",
        "--id",
        "--symptoms",
        "--section",
        "--limit",
        "--follow",
    ] {
        assert!(next.contains(flag), "next --help must document {flag}");
    }
    let run = help_text(&env, &["run", "--help"]);
    for sub in ["start", "advance", "drive", "status"] {
        assert!(run.contains(sub), "run --help must list {sub}");
    }
    let epic = help_text(&env, &["epic", "--help"]);
    for sub in ["start", "submit", "status", "pause", "resume", "resolve"] {
        assert!(epic.contains(sub), "epic --help must list {sub}");
    }
    let start = help_text(&env, &["run", "start", "--help"]);
    for flag in [
        "--work",
        "--repo",
        "--spec",
        "--base-ref",
        "--profile",
        "--roster",
        "--idempotency-key",
    ] {
        assert!(
            start.contains(flag),
            "run start --help must document {flag}"
        );
    }
    assert!(
        !start.contains("--bead"),
        "run start --help must not expose the retired --bead flag"
    );
    let definition = help_text(&env, &["definition", "validate", "--help"]);
    for flag in ["--profile", "--roster", "--idempotency-key"] {
        assert!(
            definition.contains(flag),
            "definition validate --help must document {flag}"
        );
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
    let session = help_text(&env, &["session", "--help"]);
    for sub in ["list", "read", "message", "stop"] {
        assert!(session.contains(sub), "session --help must list {sub}");
    }
    let message = help_text(&env, &["session", "message", "--help"]);
    for flag in ["--run", "--attempt", "--message", "--requested-by"] {
        assert!(
            message.contains(flag),
            "session message --help must document {flag}"
        );
    }
    let retire = help_text(&env, &["worktree", "retire", "--help"]);
    for flag in [
        "--run",
        "--force",
        "--run-state-terminal",
        "--idempotency-key",
    ] {
        assert!(
            retire.contains(flag),
            "worktree retire --help must document {flag}"
        );
    }
    let usage = help_text(&env, &["usage", "--help"]);
    assert!(usage.contains("ingest"), "usage --help must list ingest");
    let work = help_text(&env, &["work", "--help"]);
    assert!(work.contains("list"), "work --help must list list");
    let events = help_text(&env, &["events", "--help"]);
    for flag in ["--run", "--after", "--limit", "--summary"] {
        assert!(events.contains(flag), "events --help must document {flag}");
    }
    let overview = help_text(&env, &["overview", "--help"]);
    for flag in ["--run", "--epic", "--id", "--after", "--limit"] {
        assert!(
            overview.contains(flag),
            "overview --help must document {flag}"
        );
    }
    let wait = help_text(&env, &["wait", "--help"]);
    for flag in ["--id", "--until", "--timeout"] {
        assert!(wait.contains(flag), "wait --help must document {flag}");
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
fn init_creates_yaml_only_when_no_config_exists() {
    let env = TestEnv::new("forged-init-yaml");
    std::fs::remove_file(env.anvil.join("config.json")).expect("remove legacy fixture config");
    let (code, response) = env.forged(&["init"]);
    assert_eq!(code, 0, "init: {response}");
    let path = env.anvil.join("config.yaml");
    let original = std::fs::read_to_string(&path).expect("default YAML created");
    assert!(original.starts_with("# forged authoring config"));
    assert_eq!(response["result"]["config_path"], json!(path));
    assert!(!env.anvil.join("config.json").exists());

    let mut edited = original;
    edited.push_str("# operator note\n");
    std::fs::write(&path, &edited).expect("operator edit");
    let (code, _) = env.forged(&["init", "--idempotency-key", "init-yaml-again"]);
    assert_eq!(code, 0);
    assert_eq!(std::fs::read_to_string(path).expect("read"), edited);
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
        .begin_operation(
            "test",
            &request,
            forged_ledger::EffectClass::SafeRetry,
            None,
        )
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
        .begin_operation(
            "test",
            &request,
            forged_ledger::EffectClass::SafeRetry,
            None,
        )
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
fn explicit_key_operations_require_the_flag_at_clap() {
    let env = TestEnv::new("forged-explicit-keys");
    for (args, help_args) in [
        (
            &["artifact", "compact", "--attempt", "1"][..],
            &["artifact", "compact", "--help"][..],
        ),
        (
            &["claim-next", "--holder", "w1"][..],
            &["claim-next", "--help"][..],
        ),
        (
            &["worktree", "retire", "--run", "r1"][..],
            &["worktree", "retire", "--help"][..],
        ),
    ] {
        let out = env.forged_cmd(args).output().expect("forged clap refusal");
        assert_eq!(out.status.code(), Some(2), "{args:?}");
        assert!(out.stdout.is_empty(), "clap refusal wrote stdout: {args:?}");
        let stderr = String::from_utf8_lossy(&out.stderr);
        assert!(
            stderr.contains("--idempotency-key <IDEMPOTENCY_KEY>"),
            "clap refusal names the recovery flag for {args:?}: {stderr}"
        );

        let help = help_text(&env, help_args);
        let usage = help.lines().find(|line| line.starts_with("Usage:"));
        assert!(
            usage.is_some_and(|line| line.contains("--idempotency-key <IDEMPOTENCY_KEY>")),
            "required key is present in Usage for {help_args:?}: {help}"
        );
    }

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
fn doctor_probes_gh_presence_and_authentication() {
    // Presence alone is not the question: every PR step goes through an
    // authenticated gh, so the probe runs `gh auth status` and reads its
    // exit code.
    let env = TestEnv::new("forged-doctor-gh");
    let (code, resp) = env.forged(&["doctor"]);
    assert_eq!(code, 0, "doctor: {resp}");
    let probe = resp["result"]["probes"]
        .as_array()
        .expect("probes array")
        .iter()
        .find(|p| p["name"] == json!("gh-authenticated"))
        .expect("doctor carries the gh probe")
        .clone();
    assert_eq!(
        probe["ok"],
        json!(true),
        "the shim gh authenticates: {probe}"
    );

    // A gh that refuses `auth status` fails the probe rather than passing on
    // mere presence.
    env.gh_set("auth", "exit", "1");
    let (code, resp) = env.forged(&["doctor"]);
    assert_eq!(
        code, 0,
        "an unauthenticated gh is a failed probe, not an error"
    );
    let probe = resp["result"]["probes"]
        .as_array()
        .expect("probes array")
        .iter()
        .find(|p| p["name"] == json!("gh-authenticated"))
        .expect("gh probe")
        .clone();
    assert_eq!(probe["ok"], json!(false), "{probe}");
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
fn pre_dispatch_failures_are_envelopes_too_never_a_bare_exit() {
    // A failure BEFORE dispatch still owes stdout an envelope: empty stdout
    // with exit 1 is indistinguishable, to envelope-consuming automation,
    // from a crash. `env.forged` panics unless stdout parses as exactly one
    // JSON envelope, so reaching these assertions is itself the shape check.

    // 1. An unreadable --result file: the request never maps.
    let env = TestEnv::new("forged-pre-dispatch");
    let (code, resp) = env.forged(&[
        "packet",
        "complete",
        "--packet",
        "r/implement/1",
        "--attempt",
        "1",
        "--claim-token",
        "t",
        "--result",
        "/definitely/not/here.json",
    ]);
    assert_eq!(code, 1);
    assert_eq!(resp["ok"], json!(false));
    assert_eq!(resp["error"]["code"], json!("INVALID_REQUEST"));
    assert!(
        resp["error"]["message"]
            .as_str()
            .is_some_and(|m| m.contains("--result")),
        "the message names the unreadable file: {resp}"
    );

    // 2. A malformed config file, which fails every command alike.
    let bad = TestEnv::new("forged-pre-dispatch-config");
    std::fs::write(bad.anvil.join("config.json"), "{not json").expect("write bad config");
    let (code, resp) = bad.forged(&["doctor"]);
    assert_eq!(code, 1);
    assert_eq!(resp["ok"], json!(false));
    assert_eq!(resp["error"]["code"], json!("INVALID_REQUEST"));
    assert_eq!(resp["operationId"], json!("op:doctor:-:-:-"));

    // 3. An unopenable ledger is INTERNAL, not a bad request.
    let broken = TestEnv::new("forged-pre-dispatch-ledger");
    std::fs::create_dir_all(broken.anvil.join("state.db")).expect("occupy the db path");
    let (code, resp) = broken.forged(&["run", "status", "--run", "whatever"]);
    assert_eq!(code, 1);
    assert_eq!(resp["ok"], json!(false));
    assert_eq!(resp["error"]["code"], json!("INTERNAL"));
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
