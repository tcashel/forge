//! Typed attention identity, surface parity, and occurrence-fenced controls.

mod support;

use serde_json::{json, Value};
use support::{fabricate_run, HomeBeadsGuard, McpClient, TestEnv};

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

// ---------------------------------------------------------- attention list

/// The shared attention_list fixture: two quarantined runs (one decision
/// group with two items, `att-a` older than `att-b`) and one blocked run
/// (one symptom group). Run names keep alphabetical and append order
/// aligned so item ordering is unambiguous.
fn seed_attention_list_fixture(env: &TestEnv) {
    env.forged(&["init"]);
    fabricate_run(env, "att-a");
    fabricate_run(env, "att-b");
    fabricate_run(env, "att-blocked");
    append(
        env,
        "att-a",
        "proto.quarantine",
        json!({"packetId": "att-a/implement/0", "attemptId": 1, "reason": "stale token"}),
    );
    append(
        env,
        "att-b",
        "proto.quarantine",
        json!({"packetId": "att-b/implement/0", "attemptId": 2, "reason": "stale token"}),
    );
    let ledger = env.ledger();
    ledger
        .settle_run(
            "att-blocked",
            forged_ledger::RunOutcome::Blocked,
            "operator decision required".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle blocked");
    ledger.close().expect("close ledger");
}

fn attention_list(env: &TestEnv, args: &[&str]) -> Value {
    let mut full = vec!["attention", "list"];
    full.extend_from_slice(args);
    let (code, envelope) = env.forged(&full);
    assert_eq!(code, 0, "{envelope}");
    envelope["result"].clone()
}

fn group<'v>(listed: &'v Value, condition: &str) -> &'v Value {
    listed["groups"]
        .as_array()
        .and_then(|groups| {
            groups
                .iter()
                .find(|group| group["condition"] == json!(condition))
        })
        .unwrap_or_else(|| panic!("{condition} group is present: {listed}"))
}

#[test]
fn attention_list_groups_decisions_first_and_serves_complete_rail_items() {
    let env = TestEnv::new("forged-attention-list-groups");
    seed_attention_list_fixture(&env);

    let listed = attention_list(&env, &[]);
    assert_eq!(listed["schema"], json!("forged.attention-list/1"));
    assert_eq!(
        listed["filters"],
        json!({
            "repo": Value::Null,
            "state": "active",
            "condition": Value::Null,
            "classification": Value::Null,
            "limit": 100,
        })
    );
    assert_eq!(
        listed["sourceHealth"]["ledger"]["state"],
        json!("available")
    );
    assert_eq!(listed["sourceHealth"]["beads"]["state"], json!("available"));
    assert!(listed["capturedAt"]["ledger"].is_string());
    assert!(listed["capturedAt"]["beads"].is_string());

    // Decisions render before symptoms; items are oldest-first within the
    // group; oldestOpenedAt names the first item's openedAt.
    let groups = listed["groups"].as_array().expect("groups");
    assert_eq!(groups.len(), 2, "{listed}");
    assert_eq!(groups[0]["condition"], json!("quarantined"));
    assert_eq!(groups[0]["classification"], json!("decision"));
    assert_eq!(groups[1]["condition"], json!("blocked"));
    assert_eq!(groups[1]["classification"], json!("symptom"));
    let quarantined = &groups[0];
    assert_eq!(quarantined["total"], json!(2));
    assert_eq!(quarantined["shown"], json!(2));
    assert_eq!(quarantined["items"][0]["id"], json!("att-a"));
    assert_eq!(quarantined["items"][1]["id"], json!("att-b"));
    assert_eq!(
        quarantined["oldestOpenedAt"], quarantined["items"][0]["openedAt"],
        "{listed}"
    );
    assert_eq!(
        listed["totals"],
        json!({
            "open": 3,
            "acknowledged": 0,
            "resolved": 0,
            "decisions": 2,
            "symptoms": 1,
            "shown": 3,
            "total": 3,
        })
    );

    // Items are the complete unmodified forged.attention-item/1 objects the
    // embedded operations_overview rail serves.
    let (code, ops) = env.forged(&["operations", "overview"]);
    assert_eq!(code, 0, "{ops}");
    for (run, condition) in [
        ("att-a", "quarantined"),
        ("att-b", "quarantined"),
        ("att-blocked", "blocked"),
    ] {
        let rail = attention(&ops["result"], run, condition)
            .unwrap_or_else(|| panic!("{run} {condition} is on the rail: {ops}"));
        let listed_item = group(&listed, condition)["items"]
            .as_array()
            .into_iter()
            .flatten()
            .find(|item| item["id"] == json!(run))
            .unwrap_or_else(|| panic!("{run} {condition} is listed: {listed}"))
            .clone();
        assert_eq!(
            listed_item, rail,
            "{run} {condition} must be byte-identical"
        );
    }
}

#[test]
fn attention_list_serves_the_plan_only_blocked_bead_exactly_as_the_rail() {
    let env = TestEnv::new("forged-attention-list-plan-blocked");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    env.set_bead_field("plan-blk", "status", "blocked");
    env.set_bead_field("plan-blk", "title", "Blocked plan-only bead");
    env.set_bead_repository("plan-blk", &repository);

    let (code, ops) = env.forged(&["operations", "overview"]);
    assert_eq!(code, 0, "{ops}");
    let rail = attention(&ops["result"], "plan-blk", "blocked")
        .unwrap_or_else(|| panic!("plan-only blocked bead is on the rail: {ops}"));

    let listed = attention_list(&env, &[]);
    let blocked = group(&listed, "blocked");
    assert_eq!(blocked["classification"], json!("symptom"));
    assert_eq!(blocked["total"], json!(1));
    assert_eq!(
        blocked["items"][0], rail,
        "the collection universe is the operations universe, not a ledger-only subset"
    );
}

#[test]
fn attention_list_truncation_is_a_stated_global_sequential_take() {
    let env = TestEnv::new("forged-attention-list-truncation");
    seed_attention_list_fixture(&env);

    let listed = attention_list(&env, &["--limit", "2"]);
    assert_eq!(listed["filters"]["limit"], json!(2));
    assert_eq!(listed["totals"]["total"], json!(3));
    assert_eq!(listed["totals"]["shown"], json!(2));
    let quarantined = group(&listed, "quarantined");
    assert_eq!(quarantined["total"], json!(2));
    assert_eq!(quarantined["shown"], json!(2));
    let blocked = group(&listed, "blocked");
    assert_eq!(
        blocked["total"],
        json!(1),
        "a starved group states its total"
    );
    assert_eq!(blocked["shown"], json!(0));
    assert_eq!(blocked["items"], json!([]));

    // The take is sequential in rendered order: one slot serves the oldest
    // decision, never a per-group share.
    let listed = attention_list(&env, &["--limit", "1"]);
    let quarantined = group(&listed, "quarantined");
    assert_eq!(quarantined["shown"], json!(1));
    assert_eq!(quarantined["items"][0]["id"], json!("att-a"));
    assert_eq!(group(&listed, "blocked")["shown"], json!(0));
    assert_eq!(listed["totals"]["shown"], json!(1));
    assert_eq!(listed["totals"]["total"], json!(3));
}

#[test]
fn attention_list_state_scopes_reconcile_with_custody_truth() {
    let env = TestEnv::new("forged-attention-list-states");
    seed_attention_list_fixture(&env);

    let listed = attention_list(&env, &[]);
    let items = group(&listed, "quarantined")["items"]
        .as_array()
        .cloned()
        .expect("quarantined items");
    let address = |item: &Value| {
        (
            item["id"].as_str().expect("subject").to_owned(),
            item["attentionId"]
                .as_str()
                .expect("attention id")
                .to_owned(),
            item["occurrenceId"]
                .as_str()
                .expect("occurrence id")
                .to_owned(),
        )
    };
    let (subject_a, attention_a, occurrence_a) = address(&items[0]);
    let (subject_b, attention_b, occurrence_b) = address(&items[1]);
    let (code, acknowledged) = env.forged(&[
        "attention",
        "acknowledge",
        "--subject",
        &subject_a,
        "--attention-id",
        &attention_a,
        "--occurrence-id",
        &occurrence_a,
        "--actor",
        "lead-agent",
    ]);
    assert_eq!(code, 0, "{acknowledged}");
    let (code, resolved) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        &subject_b,
        "--attention-id",
        &attention_b,
        "--occurrence-id",
        &occurrence_b,
        "--actor",
        "operator",
        "--disposition",
        "accepted-risk",
        "--note",
        "reviewed",
    ]);
    assert_eq!(code, 0, "{resolved}");

    // Default active: open plus acknowledged, resolved stripped — exactly
    // project_active's semantics.
    let active = attention_list(&env, &[]);
    assert_eq!(active["totals"]["total"], json!(2));
    assert_eq!(active["totals"]["open"], json!(1));
    assert_eq!(active["totals"]["acknowledged"], json!(1));
    assert_eq!(active["totals"]["resolved"], json!(0));

    // state=open excludes the acknowledged item.
    let open = attention_list(&env, &["--state", "open"]);
    assert_eq!(open["totals"]["total"], json!(1));
    assert_eq!(open["totals"]["open"], json!(1));
    assert_eq!(open["totals"]["acknowledged"], json!(0));
    assert_eq!(group(&open, "blocked")["total"], json!(1));

    // state=all serves the resolved occurrence and the totals reconcile:
    // open + acknowledged + resolved == total == decisions + symptoms.
    let all = attention_list(&env, &["--state", "all"]);
    assert_eq!(
        all["totals"],
        json!({
            "open": 1,
            "acknowledged": 1,
            "resolved": 1,
            "decisions": 2,
            "symptoms": 1,
            "shown": 3,
            "total": 3,
        })
    );
    let resolved_item = group(&all, "quarantined")["items"]
        .as_array()
        .into_iter()
        .flatten()
        .find(|item| item["id"] == json!(subject_b))
        .cloned()
        .expect("resolved occurrence is served under state=all");
    assert_eq!(resolved_item["state"], json!("resolved"));

    // The exact condition and classification filters narrow the same truth.
    let quarantined = attention_list(&env, &["--state", "all", "--condition", "quarantined"]);
    assert_eq!(quarantined["totals"]["total"], json!(2));
    assert_eq!(quarantined["totals"]["symptoms"], json!(0));
    let symptoms = attention_list(&env, &["--state", "all", "--classification", "symptom"]);
    assert_eq!(symptoms["totals"]["total"], json!(1));
    assert_eq!(symptoms["totals"]["decisions"], json!(0));
}

#[test]
fn attention_list_keeps_ledger_backed_items_when_beads_is_unavailable() {
    // Guard FIRST, per the bd test conventions: even a shim-backed outage
    // run must prove no machine-global ~/.beads appears.
    let _guard = HomeBeadsGuard::new();
    let env = TestEnv::new("forged-attention-list-outage");
    env.forged(&["init"]);
    fabricate_run(&env, "att-outage");
    append(
        &env,
        "att-outage",
        "proto.quarantine",
        json!({"packetId": "att-outage/implement/0", "attemptId": 3, "reason": "stale token"}),
    );
    env.set_bd_list_unreachable(true);
    env.set_bd_show_unreachable(true);

    let listed = attention_list(&env, &[]);
    assert_eq!(
        listed["sourceHealth"]["ledger"]["state"],
        json!("available")
    );
    assert_eq!(
        listed["sourceHealth"]["beads"]["state"],
        json!("unavailable"),
        "a Beads outage is reported, never a closed read: {listed}"
    );
    assert_eq!(
        listed["sourceHealth"]["plan"]["state"],
        json!("unavailable")
    );
    let quarantined = group(&listed, "quarantined");
    assert_eq!(quarantined["total"], json!(1));
    assert_eq!(quarantined["items"][0]["id"], json!("att-outage"));
}

#[test]
fn attention_list_filters_and_bounds_fail_closed() {
    let env = TestEnv::new("forged-attention-list-invalid");
    env.forged(&["init"]);
    for args in [
        vec!["attention", "list", "--repo", " "],
        vec!["attention", "list", "--condition", "needs-coffee"],
        vec!["attention", "list", "--limit", "0"],
        vec!["attention", "list", "--limit", "501"],
    ] {
        let (code, response) = env.forged(&args);
        assert_ne!(
            code, 0,
            "invalid attention_list filter unexpectedly widened: {response}"
        );
        assert_eq!(
            response["error"]["code"],
            json!("INVALID_REQUEST"),
            "{response}"
        );
    }
}
