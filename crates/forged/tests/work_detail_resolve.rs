//! `work detail --id` — kind-blind resolution for the exact projection. A
//! caller holding only a bead id asks with it and gets the same body the
//! exact pair returns; an id that resolves to no single subject gets the
//! candidates it could have meant, under this tool's own schema, rather
//! than a refusal. The exact pair stays an assertion: it never resolves.

mod support;

use serde_json::{json, Value};
use support::{fabricate_epic, fabricate_run, McpClient, TestEnv};

fn result(envelope: &Value) -> Value {
    envelope["result"].clone()
}

fn resolution(envelope: &Value) -> Value {
    envelope
        .pointer("/result/resolution")
        .cloned()
        .unwrap_or_else(|| panic!("an unresolvable id answers with a resolution: {envelope}"))
}

fn candidates(envelope: &Value) -> Vec<Value> {
    resolution(envelope)["candidates"]
        .as_array()
        .cloned()
        .unwrap_or_else(|| panic!("a resolution carries a candidate array: {envelope}"))
}

/// A minted per-call operationId (a uuid) compares unequal between two
/// calls that answer identically; normalize it the way `parity.rs` does.
fn normalized(mut envelope: Value) -> Value {
    let id = envelope["operationId"].as_str().unwrap_or_default();
    if id.len() == 36 && id.chars().filter(|c| *c == '-').count() == 4 {
        envelope["operationId"] = json!("<minted>");
    }
    envelope
}

/// The whole point: an agent holding only the id reads the same projection
/// the exact pair returns, with no `resolution` key marking it different.
#[test]
fn an_exact_run_id_answers_identically_to_the_exact_pair() {
    let env = TestEnv::new("forged-detail-resolve-exact");
    env.forged(&["init"]);
    fabricate_run(&env, "dr-slice");

    let (code, by_id) = env.forged(&["work", "detail", "--id", "dr-slice"]);
    assert_eq!(code, 0, "work detail --id: {by_id}");
    let (code, by_pair) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "run",
        "--subject-id",
        "dr-slice",
    ]);
    assert_eq!(code, 0, "work detail pair: {by_pair}");
    assert_eq!(result(&by_id), result(&by_pair), "run projections differ");
    assert_eq!(by_id["result"]["schema"], json!("forged.work-detail/1"));
    assert_eq!(by_id["result"]["workRef"]["kind"], json!("run"));
    // A unique resolution is transparent: the full detail body, unmarked.
    assert_eq!(by_id["result"].get("resolution"), None);
}

/// The resolution derives the epic subject kind from the inventory — an
/// exact epic id and a unique epic-id prefix both project what
/// `--subject-kind epic` asserts, never a hardcoded run.
#[test]
fn an_epic_id_and_a_unique_prefix_derive_the_epic_kind() {
    let env = TestEnv::new("forged-detail-resolve-epic");
    env.forged(&["init"]);
    fabricate_epic(&env, "dr-epic");
    fabricate_run(&env, "other-slice");

    let (code, by_pair) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "epic",
        "--subject-id",
        "dr-epic",
    ]);
    assert_eq!(code, 0, "work detail pair: {by_pair}");
    for id in ["dr-epic", "dr-ep"] {
        let (code, by_id) = env.forged(&["work", "detail", "--id", id]);
        assert_eq!(code, 0, "work detail --id {id}: {by_id}");
        assert_eq!(
            result(&by_id),
            result(&by_pair),
            "epic projections differ for {id}"
        );
        assert_eq!(by_id["result"]["workRef"]["kind"], json!("epic"));
        assert_eq!(by_id["result"].get("resolution"), None);
    }
}

/// A shorter id that prefixes a longer one is never shadowed by it.
#[test]
fn an_exact_id_outranks_every_prefix_reading_of_it() {
    let env = TestEnv::new("forged-detail-resolve-shadow");
    env.forged(&["init"]);
    fabricate_run(&env, "dr-dup");
    fabricate_run(&env, "dr-dup-extended");

    let (code, response) = env.forged(&["work", "detail", "--id", "dr-dup"]);
    assert_eq!(code, 0, "work detail --id: {response}");
    assert_eq!(
        response["result"]["id"],
        json!("dr-dup"),
        "the exact id lost to a prefix reading: {response}"
    );
    assert_eq!(response["result"].get("resolution"), None);
}

/// An id naming nothing is a successful "nothing", not an error, and the
/// envelope is pinned whole: the same resolution grammar overview emits,
/// under this tool's own schema key.
#[test]
fn an_unknown_id_answers_with_an_empty_candidate_list() {
    let env = TestEnv::new("forged-detail-resolve-unknown");
    env.forged(&["init"]);
    fabricate_run(&env, "dr-slice");

    let (code, response) = env.forged(&["work", "detail", "--id", "nothing-by-that-name"]);
    assert_eq!(code, 0, "an unknown id is not an error: {response}");
    assert_eq!(response["ok"], json!(true));
    assert_eq!(response["error"], Value::Null);
    assert_eq!(
        response["result"],
        json!({
            "schema": "forged.work-detail/1",
            "resolution": {
                "query": "nothing-by-that-name",
                "reason": "unknown",
                "candidates": [],
            },
        })
    );
}

#[test]
fn an_ambiguous_prefix_lists_what_could_have_been_meant() {
    let env = TestEnv::new("forged-detail-resolve-ambiguous");
    env.forged(&["init"]);
    fabricate_run(&env, "dr-one");
    fabricate_run(&env, "dr-two");
    fabricate_epic(&env, "dr-three");

    let (code, response) = env.forged(&["work", "detail", "--id", "dr-"]);
    assert_eq!(code, 0, "an ambiguous id is not an error: {response}");
    assert_eq!(response["ok"], json!(true));
    assert_eq!(response["result"]["schema"], json!("forged.work-detail/1"));
    assert_eq!(resolution(&response)["reason"], json!("ambiguous"));
    let listed = candidates(&response);
    assert_eq!(listed.len(), 3, "every prefix match is listed: {response}");
    let mut ids: Vec<&str> = listed
        .iter()
        .map(|c| c["id"].as_str().unwrap_or_default())
        .collect();
    ids.sort_unstable();
    assert_eq!(ids, ["dr-one", "dr-three", "dr-two"]);
    for candidate in &listed {
        // Enough to choose without a second call.
        for key in ["id", "kind", "state", "beadId"] {
            assert!(
                candidate.get(key).is_some_and(|v| !v.is_null()),
                "a candidate names {key}: {candidate}"
            );
        }
    }
    // No single subject, so none of the projection keys.
    for key in ["status", "workers", "kind", "id", "usage", "events"] {
        assert_eq!(
            response["result"].get(key),
            None,
            "a resolution must not carry {key}: {response}"
        );
    }
}

/// Exactly one addressing form, enforced in the core: the CLI and MCP
/// refuse with IDENTICAL envelopes, never a clap usage error on one side
/// and an operation refusal on the other.
#[test]
fn mixed_half_or_absent_addressing_is_refused_identically_everywhere() {
    let env = TestEnv::new("forged-detail-resolve-refusals");
    env.forged(&["init"]);
    let mut mcp = McpClient::new(&env);

    for (cli_args, params) in [
        (
            vec![
                "work",
                "detail",
                "--id",
                "dr-a",
                "--subject-kind",
                "run",
                "--subject-id",
                "dr-b",
            ],
            json!({"id": "dr-a", "subjectKind": "run", "subjectId": "dr-b"}),
        ),
        (
            vec!["work", "detail", "--subject-kind", "run"],
            json!({"subjectKind": "run"}),
        ),
        (
            vec!["work", "detail", "--subject-id", "dr-a"],
            json!({"subjectId": "dr-a"}),
        ),
        (vec!["work", "detail"], json!({})),
    ] {
        let (code, cli) = env.forged(&cli_args);
        assert_ne!(code, 0, "{cli_args:?} must refuse: {cli}");
        let tool = mcp.call_tool(
            "work_detail",
            json!({"schemaVersion": 1, "params": params.clone()}),
        );
        assert_eq!(tool["ok"], json!(false), "{params}: {tool}");
        assert_eq!(tool["error"]["code"], json!("INVALID_REQUEST"), "{tool}");
        assert_eq!(
            normalized(cli),
            normalized(tool),
            "CLI and MCP refusals diverge for {params}"
        );
    }

    // The mixed-form refusal names the conflict rather than picking a side.
    let tool = mcp.call_tool(
        "work_detail",
        json!({"schemaVersion": 1, "params": {"id": "dr-a", "subjectKind": "run", "subjectId": "dr-b"}}),
    );
    let message = tool["error"]["message"].as_str().unwrap_or_default();
    assert!(
        message.contains("id") && message.contains("subjectKind"),
        "the refusal must name the conflict: {message}"
    );

    // A present-but-empty id from the CLI is refused up front, never read
    // as "no form named". (The MCP transport refuses it before dispatch;
    // `parity.rs` pins that boundary.)
    let (code, cli) = env.forged(&["work", "detail", "--id", ""]);
    assert_ne!(code, 0, "{cli}");
    assert_eq!(cli["error"]["code"], json!("INVALID_REQUEST"));
    assert!(
        cli["error"]["message"]
            .as_str()
            .unwrap_or_default()
            .contains("must name a subject"),
        "{cli}"
    );
}
