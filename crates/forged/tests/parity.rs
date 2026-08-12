//! CLI/MCP parity (the two-adapters-over-one-core criterion): for each of
//! the seventeen public core functions, the CLI path and the MCP tool path produce
//! identical `OperationResponse` values — modulo the minted `operationId` —
//! from the same core call.

mod support;

use serde_json::{json, Value};
use support::{McpClient, TestEnv};

/// Normalize the minted operationId (a per-call uuid) out of an envelope;
/// derived and read-default ids are deterministic and stay.
fn normalized(mut envelope: Value) -> Value {
    let id = envelope["operationId"].as_str().unwrap_or_default();
    let minted = id.len() == 36 && id.chars().filter(|c| *c == '-').count() == 4;
    if minted {
        envelope["operationId"] = json!("<minted>");
    }
    envelope
}

/// Strip volatile probe details from a doctor envelope, keeping names and
/// ok flags.
fn doctor_shape(envelope: &Value) -> Value {
    let probes: Vec<Value> = envelope["result"]["probes"]
        .as_array()
        .cloned()
        .unwrap_or_default()
        .iter()
        .map(|p| json!({"name": p["name"], "ok": p["ok"]}))
        .collect();
    json!({"ok": envelope["ok"], "probes": probes})
}

#[test]
fn all_seventeen_tools_match_their_cli_counterparts() {
    let env = TestEnv::new("forged-parity");
    env.forged(&["init"]);
    let mut mcp = McpClient::new(&env);

    // The server declares exactly the public operation tools.
    let mut tools = mcp.list_tools();
    tools.sort();
    let mut expected = vec![
        "claim_next",
        "doctor",
        "definition_validate",
        "events_tail",
        "packet_claim",
        "packet_complete",
        "packet_fail",
        "reconcile",
        "run_advance",
        "run_revise_roster",
        "run_start",
        "run_status",
        "session_list",
        "session_message",
        "session_read",
        "session_stop",
        "usage_report",
    ];
    expected.sort_unstable();
    assert_eq!(tools, expected, "the seventeen tools, exactly");

    let envelope = |params: Value| json!({"schemaVersion": 1, "params": params});

    let cli = env.forged(&["definition", "validate"]).1;
    let tool = mcp.call_tool("definition_validate", envelope(json!({})));
    assert_eq!(cli, tool, "definition_validate parity");

    // run_start: an invalid (relative) repo path refuses identically.
    let cli = env
        .forged(&[
            "run", "start", "--bead", "par-a", "--repo", "rel/path", "--spec", "nope.md",
        ])
        .1;
    let tool = mcp.call_tool(
        "run_start",
        envelope(json!({"bead": "par-a", "repo": "rel/path", "spec": "nope.md"})),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_start parity");

    // run_advance / run_status: a nonexistent run refuses identically.
    let cli = env.forged(&["run", "advance", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "run_advance",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_advance parity");

    let cli = env.forged(&["run", "status", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "run_status",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_status parity");

    // run_revise_roster: a nonexistent run refuses identically.
    let cli = env
        .forged(&[
            "run",
            "revise-roster",
            "--run",
            "absent",
            "--roster",
            "default",
            "--reason",
            "provider access changed",
        ])
        .1;
    let tool = mcp.call_tool(
        "run_revise_roster",
        json!({
            "schemaVersion": 1,
            "runId": "absent",
            "params": {
                "run": "absent",
                "roster": "default",
                "reason": "provider access changed"
            }
        }),
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "run_revise_roster parity"
    );

    // packet_claim: an absent packet refuses identically.
    let cli = env
        .forged(&["packet", "claim", "--packet", "absent/implement/1"])
        .1;
    let tool = mcp.call_tool(
        "packet_claim",
        envelope(json!({"packet": "absent/implement/1"})),
    );
    assert_eq!(normalized(cli), normalized(tool), "packet_claim parity");

    // packet_complete: a missing attempt param refuses identically. The CLI
    // requires --attempt, so both surfaces are exercised with params built
    // the same way (result inline).
    let result_file = env.root.join("result.json");
    std::fs::write(
        &result_file,
        r#"{"schema":"forged.result.implement/1","packetId":"absent/implement/1","outcome":{"implement":{"implemented":true,"commitsAhead":1,"summary":"s","gateState":"pass","note":null}}}"#,
    )
    .expect("result file");
    let cli = env
        .forged(&[
            "packet",
            "complete",
            "--packet",
            "absent/implement/1",
            "--attempt",
            "1",
            "--claim-token",
            "t",
            "--result",
            result_file.to_str().expect("utf8"),
            "--idempotency-key",
            "op:packet_complete:par-cli",
        ])
        .1;
    let result_json: Value =
        serde_json::from_str(&std::fs::read_to_string(&result_file).expect("read result"))
            .expect("result json");
    let tool = mcp.call_tool(
        "packet_complete",
        json!({
            "schemaVersion": 1,
            "idempotencyKey": "op:packet_complete:par-mcp",
            "params": {
                "packet": "absent/implement/1",
                "attempt": 1,
                "claimToken": "t",
                "result": result_json,
            },
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "packet_complete parity");

    // packet_fail: a stale token refuses identically.
    let cli = env
        .forged(&[
            "packet",
            "fail",
            "--packet",
            "absent/implement/1",
            "--attempt",
            "1",
            "--claim-token",
            "t",
            "--note",
            "transport: gone",
        ])
        .1;
    let tool = mcp.call_tool(
        "packet_fail",
        envelope(json!({
            "packet": "absent/implement/1",
            "attempt": 1,
            "claimToken": "t",
            "note": "transport: gone",
        })),
    );
    assert_eq!(normalized(cli), normalized(tool), "packet_fail parity");

    // Session controls: missing durable state refuses identically.
    let cli = env.forged(&["session", "list", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "session_list",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "session_list parity");

    let cli = env.forged(&["session", "read", "--attempt", "1"]).1;
    let tool = mcp.call_tool(
        "session_read",
        envelope(json!({"attempt": 1, "lines": 120})),
    );
    assert_eq!(normalized(cli), normalized(tool), "session_read parity");

    let cli = env
        .forged(&[
            "session",
            "message",
            "--run",
            "absent",
            "--message",
            "checkpoint",
            "--idempotency-key",
            "op:session_message:par-cli",
        ])
        .1;
    let tool = mcp.call_tool(
        "session_message",
        json!({
            "schemaVersion": 1,
            "idempotencyKey": "op:session_message:par-mcp",
            "runId": "absent",
            "params": {
                "run": "absent", "attempt": null, "message": "checkpoint",
                "requestedBy": "operator"
            }
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "session_message parity");

    let cli = env
        .forged(&[
            "session",
            "stop",
            "--attempt",
            "1",
            "--reason",
            "operator requested",
        ])
        .1;
    let tool = mcp.call_tool(
        "session_stop",
        envelope(json!({"attempt": 1, "reason": "operator requested"})),
    );
    assert_eq!(normalized(cli), normalized(tool), "session_stop parity");

    // claim_next: the missing-key refusal is identical; the real call (an
    // empty frontier) is identical too, under distinct explicit keys.
    let cli = env.forged(&["claim-next", "--holder", "w"]).1;
    let tool = mcp.call_tool("claim_next", envelope(json!({"holder": "w"})));
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "claim_next refusal parity"
    );

    let cli = env
        .forged(&[
            "claim-next",
            "--holder",
            "w",
            "--idempotency-key",
            "op:claim_next:cli-1",
        ])
        .1;
    let tool = mcp.call_tool(
        "claim_next",
        json!({
            "schemaVersion": 1,
            "idempotencyKey": "op:claim_next:mcp-1",
            "params": {"holder": "w"},
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "claim_next parity");

    // reconcile: a nonexistent run refuses identically.
    let cli = env.forged(&["reconcile", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "reconcile",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "reconcile parity");

    // usage_report and events_tail: identical read-only envelopes.
    let cli = env.forged(&["usage"]).1;
    let tool = mcp.call_tool("usage_report", envelope(json!({})));
    assert_eq!(normalized(cli), normalized(tool), "usage_report parity");

    let cli = env.forged(&["events"]).1;
    let tool = mcp.call_tool("events_tail", envelope(json!({})));
    assert_eq!(normalized(cli), normalized(tool), "events_tail parity");

    // doctor: probe details are timing-dependent; the shape (names + ok
    // flags) must match.
    let cli = env.forged(&["doctor"]).1;
    let tool = mcp.call_tool("doctor", envelope(json!({})));
    assert_eq!(doctor_shape(&cli), doctor_shape(&tool), "doctor parity");
    assert_eq!(cli["operationId"], json!("op:doctor:read"));
    assert_eq!(tool["operationId"], json!("op:doctor:read"));
}
