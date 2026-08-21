//! `overview --id` — kind-blind resolution. A caller that cannot know
//! whether an id names a slice or an epic asks with the bare id and gets the
//! projection the explicit param would have returned; an id that resolves to
//! no single subject gets the candidates it could have meant, on the same
//! schema, rather than a refusal.

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

/// The whole point: an agent that guessed the kind wrong, and one that never
/// guessed at all, read the same projection.
#[test]
fn an_exact_id_answers_identically_to_the_explicit_param() {
    let env = TestEnv::new("forged-resolve-exact");
    // The epic goes through `epic start`, so the epic projection has the
    // durable package it reads; a fabricated start event alone would compare
    // two refusals to each other.
    env.seed_epic("rs-epic", &[("rs-child", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    fabricate_run(&env, "rs-slice");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "rs-epic",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");

    let (code, by_id) = env.forged(&["overview", "--id", "rs-slice"]);
    assert_eq!(code, 0, "overview --id: {by_id}");
    let (code, by_run) = env.forged(&["overview", "--run", "rs-slice"]);
    assert_eq!(code, 0, "overview --run: {by_run}");
    assert_eq!(result(&by_id), result(&by_run), "slice projections differ");
    assert_eq!(by_id["result"]["kind"], json!("slice"));

    let (code, by_id) = env.forged(&["overview", "--id", "rs-epic"]);
    assert_eq!(code, 0, "overview --id: {by_id}");
    let (code, by_epic) = env.forged(&["overview", "--epic", "rs-epic"]);
    assert_eq!(code, 0, "overview --epic: {by_epic}");
    assert_eq!(result(&by_id), result(&by_epic), "epic projections differ");
    assert_eq!(by_id["result"]["kind"], json!("epic"));
}

/// An id naming nothing is a successful "nothing", not an error: the answer
/// to "what could this be" is sometimes an empty list.
#[test]
fn an_unknown_id_answers_with_an_empty_candidate_list() {
    let env = TestEnv::new("forged-resolve-unknown");
    env.forged(&["init"]);
    fabricate_run(&env, "rs-slice");

    let (code, response) = env.forged(&["overview", "--id", "nothing-by-that-name"]);
    assert_eq!(code, 0, "an unknown id is not an error: {response}");
    assert_eq!(response["ok"], json!(true));
    assert_eq!(response["error"], Value::Null);
    // The App refuses any other schema, so a candidate list that invented one
    // would render as "a payload this view does not know how to draw".
    assert_eq!(response["result"]["schema"], json!("forged.overview/1"));
    assert_eq!(
        resolution(&response)["query"],
        json!("nothing-by-that-name")
    );
    assert_eq!(resolution(&response)["reason"], json!("unknown"));
    assert_eq!(candidates(&response), Vec::<Value>::new());
    // The complete envelope, pinned whole: resolution is shared with
    // work_detail now, and overview's wrapper must not drift by a key.
    assert_eq!(
        response["result"],
        json!({
            "schema": "forged.overview/1",
            "resolution": {
                "query": "nothing-by-that-name",
                "reason": "unknown",
                "candidates": [],
            },
        })
    );
    // No single subject, so none of the projection keys.
    for key in ["status", "workers", "kind", "id", "usage", "events"] {
        assert_eq!(
            response["result"].get(key),
            None,
            "a resolution must not carry {key}: {response}"
        );
    }
}

#[test]
fn an_ambiguous_prefix_lists_what_could_have_been_meant() {
    let env = TestEnv::new("forged-resolve-ambiguous");
    env.forged(&["init"]);
    fabricate_run(&env, "rs-one");
    fabricate_run(&env, "rs-two");
    fabricate_epic(&env, "rs-three");

    let (code, response) = env.forged(&["overview", "--id", "rs-"]);
    assert_eq!(code, 0, "an ambiguous id is not an error: {response}");
    assert_eq!(response["result"]["schema"], json!("forged.overview/1"));
    assert_eq!(resolution(&response)["reason"], json!("ambiguous"));
    let listed = candidates(&response);
    assert_eq!(listed.len(), 3, "every prefix match is listed: {response}");
    let mut ids: Vec<&str> = listed
        .iter()
        .map(|c| c["id"].as_str().unwrap_or_default())
        .collect();
    ids.sort_unstable();
    assert_eq!(ids, ["rs-one", "rs-three", "rs-two"]);
    for candidate in &listed {
        // Enough to choose without a second call.
        for key in ["id", "kind", "state", "beadId"] {
            assert!(
                candidate.get(key).is_some_and(|v| !v.is_null()),
                "a candidate names {key}: {candidate}"
            );
        }
        // Resolution reads the inventory once; spend is the one field that
        // costs a query per entry, so candidates carry none.
        assert_eq!(candidate.get("costUsdKnown"), None, "{candidate}");
        assert_eq!(candidate.get("rowsMissingCost"), None, "{candidate}");
    }
    let epic = listed
        .iter()
        .find(|c| c["id"] == json!("rs-three"))
        .expect("the epic is a candidate");
    assert_eq!(epic["kind"], json!("epic"));
    assert_eq!(epic["state"], json!("active"));
}

#[test]
fn a_prefix_matching_one_entry_resolves_to_it() {
    let env = TestEnv::new("forged-resolve-prefix");
    env.forged(&["init"]);
    fabricate_run(&env, "rs-only-slice");
    fabricate_epic(&env, "other-epic");

    let (code, response) = env.forged(&["overview", "--id", "rs-only"]);
    assert_eq!(code, 0, "overview --id: {response}");
    assert_eq!(response["result"]["kind"], json!("slice"));
    assert_eq!(response["result"]["id"], json!("rs-only-slice"));
}

/// A shorter id that prefixes a longer one is never shadowed by it.
#[test]
fn an_exact_id_outranks_every_prefix_reading_of_it() {
    let env = TestEnv::new("forged-resolve-shadow");
    env.forged(&["init"]);
    fabricate_run(&env, "rs-dup");
    fabricate_run(&env, "rs-dup-extended");

    let (code, response) = env.forged(&["overview", "--id", "rs-dup"]);
    assert_eq!(code, 0, "overview --id: {response}");
    assert_eq!(
        response["result"]["id"],
        json!("rs-dup"),
        "the exact id lost to a prefix reading: {response}"
    );
    assert_eq!(response["result"].get("resolution"), None);
}

/// Resolution and assertion are different requests; preferring one silently
/// would hide the caller's bug.
#[test]
fn an_id_alongside_an_explicit_kind_is_refused() {
    let env = TestEnv::new("forged-resolve-conflict");
    env.forged(&["init"]);
    let mut mcp = McpClient::new(&env);

    for explicit in ["run", "epic"] {
        let response = mcp.call_tool(
            "overview",
            json!({"schemaVersion": 1, "params": {"id": "rs-a", explicit: "rs-b"}}),
        );
        assert_eq!(response["ok"], json!(false), "{explicit}: {response}");
        assert_eq!(response["error"]["code"], json!("INVALID_REQUEST"));
        let message = response["error"]["message"].as_str().unwrap_or_default();
        assert!(
            message.contains("id") && message.contains(explicit),
            "the refusal must name the conflict: {message}"
        );
    }

    // Both explicit params is still refused, exactly as before.
    let response = mcp.call_tool(
        "overview",
        json!({"schemaVersion": 1, "params": {"run": "rs-a", "epic": "rs-b"}}),
    );
    assert_eq!(response["ok"], json!(false), "{response}");
    assert_eq!(response["error"]["code"], json!("INVALID_REQUEST"));

    // Naming NO subject is the one relaxation: it asks about no kind at all
    // and answers with the portfolio. `tests/portfolio.rs` owns that
    // contract; here it only has to not be a refusal.
    let response = mcp.call_tool("overview", json!({"schemaVersion": 1, "params": {}}));
    assert_eq!(response["ok"], json!(true), "{response}");
    assert_eq!(response["result"]["kind"], json!("portfolio"));
}
