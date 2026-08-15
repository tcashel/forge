//! Typed attention identity, surface parity, and occurrence-fenced controls.

mod support;

use serde_json::{json, Value};
use support::{fabricate_run, McpClient, TestEnv};

fn append(env: &TestEnv, run: &str, kind: &str, payload: Value) {
    let ledger = env.ledger();
    ledger
        .append_event(Some(run), kind, payload)
        .expect("append attention source");
    ledger.close().expect("close ledger");
}

fn overview(env: &TestEnv) -> Value {
    let (code, envelope) = env.forged(&["overview"]);
    assert_eq!(code, 0, "{envelope}");
    envelope["result"].clone()
}

fn quarantine(value: &Value) -> Value {
    value["attention"]
        .as_array()
        .and_then(|items| {
            items.iter().find(|item| {
                item["id"] == json!("attention-run") && item["condition"] == json!("quarantined")
            })
        })
        .cloned()
        .unwrap_or_else(|| panic!("quarantine attention is present: {value}"))
}

fn attention(value: &Value, run: &str, condition: &str) -> Option<Value> {
    value["attention"].as_array().and_then(|items| {
        items
            .iter()
            .find(|item| item["id"] == json!(run) && item["condition"] == json!(condition))
            .cloned()
    })
}

#[test]
fn attention_is_identical_across_surfaces_and_controls_are_occurrence_fenced() {
    let env = TestEnv::new("forged-attention-controls");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-run");
    append(
        &env,
        "attention-run",
        "proto.quarantine",
        json!({
            "packetId": "attention-run/implement/0",
            "attemptId": 7,
            "reason": "claim token is stale",
        }),
    );

    let initial = overview(&env);
    let item = quarantine(&initial);
    assert_eq!(item["schema"], json!("forged.attention-item/1"));
    assert_eq!(item["owner"], json!("human"));
    assert_eq!(item["severity"], json!("critical"));
    assert_eq!(item["state"], json!("open"));
    let attention_id = item["attentionId"].as_str().expect("attention id");
    let occurrence_id = item["occurrenceId"].as_str().expect("occurrence id");

    let (code, listed) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "{listed}");
    assert_eq!(listed["result"]["attention"], initial["attention"]);
    assert_eq!(listed["result"]["attentionTotal"], json!(1));

    let args = [
        "attention",
        "acknowledge",
        "--subject",
        "attention-run",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "lead-agent",
    ];
    let (code, acknowledged) = env.forged(&args);
    assert_eq!(code, 0, "{acknowledged}");
    assert_eq!(acknowledged["reused"], json!(false));
    let (code, replayed) = env.forged(&args);
    assert_eq!(code, 0, "{replayed}");
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(quarantine(&overview(&env))["state"], json!("acknowledged"));

    let mut mcp = McpClient::new(&env);
    let resolved = mcp.call_tool(
        "attention_resolve",
        json!({
            "schemaVersion": 1,
            "runId": "attention-run",
            "params": {
                "attentionId": attention_id,
                "occurrenceId": occurrence_id,
                "actor": "operator",
                "disposition": "accepted-risk",
                "note": "reviewed exact quarantined evidence",
            },
        }),
    );
    assert_eq!(resolved["ok"], json!(true), "{resolved}");
    assert_eq!(overview(&env)["attention"], json!([]));

    let (code, reopened) = env.forged(&[
        "attention",
        "reopen",
        "--subject",
        "attention-run",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
    ]);
    assert_eq!(code, 0, "{reopened}");
    assert_eq!(quarantine(&overview(&env))["state"], json!("open"));

    // A later causal source keeps the stable attention id but creates a new
    // occurrence. The old address can no longer affect it.
    append(
        &env,
        "attention-run",
        "proto.quarantine",
        json!({
            "packetId": "attention-run/implement/1",
            "attemptId": 8,
            "reason": "different bytes crossed the fence",
        }),
    );
    let recurrence = quarantine(&overview(&env));
    assert_eq!(recurrence["attentionId"], json!(attention_id));
    assert_ne!(recurrence["occurrenceId"], json!(occurrence_id));
    let (_, stale) = env.forged(&args);
    assert_eq!(stale["ok"], json!(false), "{stale}");
    assert_eq!(stale["error"]["code"], json!("INVALID_REQUEST"));
}

#[test]
fn source_backed_attention_cannot_substitute_for_domain_resolution() {
    let env = TestEnv::new("forged-attention-domain-boundary");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-blocked");
    let ledger = env.ledger();
    ledger
        .settle_run(
            "attention-blocked",
            forged_ledger::RunOutcome::Blocked,
            "operator decision required".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle blocked");
    ledger.close().expect("close ledger");
    let value = overview(&env);
    let blocked = value["attention"]
        .as_array()
        .and_then(|items| {
            items
                .iter()
                .find(|item| item["condition"] == json!("blocked"))
        })
        .expect("blocked attention");
    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-blocked",
        "--attention-id",
        blocked["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        blocked["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "operator",
        "--disposition",
        "fixed",
        "--note",
        "this must not bypass run settlement",
    ]);
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(refused["error"]["code"], json!("INVALID_REQUEST"));
    assert_eq!(overview(&env)["attentionTotal"], json!(1));
}

#[test]
fn delivery_requires_the_durably_observed_exact_pr_base() {
    let env = TestEnv::new("forged-attention-pr-base");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-pr-base");
    let ledger = env.ledger();
    ledger
        .settle_run(
            "attention-pr-base",
            forged_ledger::RunOutcome::Clean,
            "review approved".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle clean");
    ledger
        .append_event(
            Some("attention-pr-base"),
            "proto.pr",
            json!({
                "schemaVersion": 1,
                "number": 17,
                "isDraft": true,
                "baseRefName": "stacked-integration",
                "url": "https://example.invalid/pr/17",
            }),
        )
        .expect("wrong-base PR");
    ledger.close().expect("close ledger");

    let wrong = overview(&env);
    assert!(attention(&wrong, "attention-pr-base", "missing-evidence").is_some());
    assert!(wrong["queue"]["groups"]
        .as_array()
        .expect("groups")
        .iter()
        .find(|group| group["name"] == json!("Ready to merge"))
        .and_then(|group| group["entries"].as_array())
        .is_some_and(Vec::is_empty));

    append(
        &env,
        "attention-pr-base",
        "proto.pr",
        json!({
            "schemaVersion": 1,
            "number": 18,
            "isDraft": true,
            "baseRefName": env.repos.base,
            "url": "https://example.invalid/pr/18",
        }),
    );
    let exact = overview(&env);
    assert!(attention(&exact, "attention-pr-base", "merge-approval").is_some());
    assert!(attention(&exact, "attention-pr-base", "missing-evidence").is_none());
}

#[test]
fn missing_cost_only_accepts_the_explicit_unknown_disposition() {
    let env = TestEnv::new("forged-attention-missing-cost");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-cost");
    let ledger = env.ledger();
    ledger
        .record_usage(forged_ledger::NewUsage {
            run_id: "attention-cost".to_owned(),
            packet_id: Some("attention-cost/implement/0".to_owned()),
            attempt_id: None,
            provider: "codex".to_owned(),
            model: "gpt-test".to_owned(),
            input_tokens: 10,
            output_tokens: 2,
            cache_read_tokens: None,
            cache_write_tokens: None,
            cost_usd: None,
            pricing_basis: None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("unpriced usage");
    ledger.close().expect("close ledger");
    let item = attention(&overview(&env), "attention-cost", "missing-cost")
        .expect("missing-cost attention");
    let attention_id = item["attentionId"].as_str().expect("attention id");
    let occurrence_id = item["occurrenceId"].as_str().expect("occurrence id");

    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-cost",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
        "--disposition",
        "fixed",
    ]);
    assert_eq!(
        refused["error"]["code"],
        json!("INVALID_REQUEST"),
        "{refused}"
    );

    let (_, accepted) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-cost",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
        "--disposition",
        "accepted-unknown",
    ]);
    assert_eq!(accepted["ok"], json!(true), "{accepted}");
    assert!(attention(&overview(&env), "attention-cost", "missing-cost").is_none());
}

#[test]
fn exact_replay_survives_authoritative_source_clearance() {
    let env = TestEnv::new("forged-attention-replay-after-clear");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-input");
    append(
        &env,
        "attention-input",
        "forged.epic.input.required",
        json!({"code": "choice", "detail": "pick one"}),
    );
    let item =
        attention(&overview(&env), "attention-input", "input-required").expect("input attention");
    let args = [
        "attention",
        "acknowledge",
        "--subject",
        "attention-input",
        "--attention-id",
        item["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        item["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "lead-agent",
    ];
    let (_, first) = env.forged(&args);
    assert_eq!(first["ok"], json!(true), "{first}");
    append(
        &env,
        "attention-input",
        "forged.epic.input.resolved",
        json!({"resolutionId": "resolution-1"}),
    );
    assert!(attention(&overview(&env), "attention-input", "input-required").is_none());
    let (_, replay) = env.forged(&args);
    assert_eq!(replay["ok"], json!(true), "{replay}");
    assert_eq!(replay["reused"], json!(true), "{replay}");
}
