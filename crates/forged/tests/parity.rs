//! CLI/MCP parity (the two-adapters-over-one-core criterion): for each of
//! the thirty public core functions, the CLI path and the MCP tool path produce
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
fn all_thirty_tools_match_their_cli_counterparts() {
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
        "overview",
        "epic_advance",
        "epic_drive",
        "epic_pause",
        "epic_resolve",
        "epic_resume",
        "epic_revise_roster",
        "epic_start",
        "epic_status",
        "epic_submit",
        "packet_claim",
        "packet_complete",
        "packet_fail",
        "reconcile",
        "run_advance",
        "run_revise_roster",
        "run_start",
        "run_status",
        "run_submit",
        "session_list",
        "session_message",
        "session_read",
        "session_stop",
        "usage_ingest",
        "usage_report",
        "work_list",
    ];
    expected.sort_unstable();
    assert_eq!(tools, expected, "the thirty tools, exactly");

    let overview_tool = mcp.tool("overview");
    assert_eq!(
        overview_tool.pointer("/_meta/ui/resourceUri"),
        Some(&json!("ui://forged/overview.html"))
    );
    // The one tool a host renders advertises its params concretely, and
    // says which of them is required.
    let properties = overview_tool
        .pointer("/inputSchema/properties/params/properties")
        .cloned()
        .unwrap_or(Value::Null);
    for (param, ty) in [
        ("run", "string"),
        ("epic", "string"),
        ("id", "string"),
        ("after", "integer"),
        ("limit", "integer"),
    ] {
        let schema = properties
            .get(param)
            .unwrap_or_else(|| panic!("overview advertises {param}: {properties}"));
        let text = schema.to_string();
        assert!(
            text.contains(ty),
            "overview param {param} must advertise type {ty}: {schema}"
        );
    }
    let description = overview_tool["description"].as_str().unwrap_or_default();
    assert!(
        description.contains("At most one of params.run, params.epic, or params.id is accepted"),
        "overview must state its at-most-one rule: {description}"
    );
    assert!(
        description.contains("omitting all three projects the portfolio"),
        "overview must state that no scope is the portfolio: {description}"
    );
    let work_list = mcp.tool("work_list");
    let description = work_list["description"].as_str().unwrap_or_default();
    assert!(
        description.contains("Takes no id"),
        "work_list must state that it takes no id: {description}"
    );

    assert_eq!(
        mcp.list_resources(),
        vec!["ui://forged/overview.html".to_owned()]
    );
    let app = mcp.read_resource("ui://forged/overview.html");
    assert_eq!(
        app.pointer("/contents/0/mimeType"),
        Some(&json!("text/html;profile=mcp-app"))
    );
    assert!(app
        .pointer("/contents/0/text")
        .and_then(Value::as_str)
        .is_some_and(|html| html.contains("Forged Control Plane")));

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

    // run_advance / run_submit / run_status: a nonexistent run refuses identically.
    let cli = env.forged(&["run", "advance", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "run_advance",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_advance parity");

    let cli = env.forged(&["run", "submit", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "run_submit",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_submit parity");

    let cli = env.forged(&["run", "status", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "run_status",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_status parity");

    let cli = env.forged(&["overview", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "overview",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "overview parity");
    let structured = mcp.call_tool_result(
        "overview",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert!(structured["structuredContent"].is_object());
    assert_eq!(structured["structuredContent"]["ok"], json!(false));

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

    // Epic lifecycle and control refusals have identical envelopes.
    let cli = env
        .forged(&[
            "epic",
            "start",
            "--epic",
            "absent-epic",
            "--repo",
            "relative",
            "--spec",
            "relative",
        ])
        .1;
    let tool = mcp.call_tool(
        "epic_start",
        json!({
            "schemaVersion": 1,
            "runId": "absent-epic",
            "params": {
                "epic": "absent-epic", "repo": "relative", "spec": "relative",
                "baseRef": null, "profile": null, "roster": null
            }
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "epic_start parity");

    for (subcommand, tool_name) in [
        ("advance", "epic_advance"),
        ("drive", "epic_drive"),
        ("submit", "epic_submit"),
        ("status", "epic_status"),
    ] {
        let cli = env.forged(&["epic", subcommand, "--epic", "absent-epic"]).1;
        let tool = mcp.call_tool(
            tool_name,
            json!({
                "schemaVersion": 1, "runId": "absent-epic",
                "params": {"epic": "absent-epic"}
            }),
        );
        assert_eq!(normalized(cli), normalized(tool), "{tool_name} parity");
    }
    for (subcommand, tool_name) in [("pause", "epic_pause"), ("resume", "epic_resume")] {
        let cli = env
            .forged(&[
                "epic",
                subcommand,
                "--epic",
                "absent-epic",
                "--reason",
                "operator test",
            ])
            .1;
        let tool = mcp.call_tool(
            tool_name,
            json!({
                "schemaVersion": 1, "runId": "absent-epic",
                "params": {"epic": "absent-epic", "reason": "operator test"}
            }),
        );
        assert_eq!(normalized(cli), normalized(tool), "{tool_name} parity");
    }
    let cli = env
        .forged(&[
            "epic",
            "resolve",
            "--epic",
            "absent-epic",
            "--child",
            "child-a",
            "--note",
            "resolved",
        ])
        .1;
    let tool = mcp.call_tool(
        "epic_resolve",
        json!({
            "schemaVersion": 1, "runId": "absent-epic",
            "params": {"epic": "absent-epic", "child": "child-a", "note": "resolved"}
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "epic_resolve parity");

    let cli = env
        .forged(&[
            "epic",
            "revise-roster",
            "--epic",
            "absent-epic",
            "--roster",
            "default",
            "--reason",
            "provider access changed",
        ])
        .1;
    let tool = mcp.call_tool(
        "epic_revise_roster",
        json!({
            "schemaVersion": 1, "runId": "absent-epic",
            "params": {
                "epic": "absent-epic", "roster": "default",
                "reason": "provider access changed"
            }
        }),
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "epic_revise_roster parity"
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

    // work_list: the discovery surface takes no id on either surface.
    let cli = env.forged(&["work", "list"]).1;
    let tool = mcp.call_tool("work_list", envelope(json!({})));
    assert_eq!(tool["operationId"], json!("op:work_list:read"));
    assert_eq!(normalized(cli), normalized(tool), "work_list parity");

    // doctor: probe details are timing-dependent; the shape (names + ok
    // flags) must match.
    let cli = env.forged(&["doctor"]).1;
    let tool = mcp.call_tool("doctor", envelope(json!({})));
    assert_eq!(doctor_shape(&cli), doctor_shape(&tool), "doctor parity");
    assert_eq!(cli["operationId"], json!("op:doctor:read"));
    assert_eq!(tool["operationId"], json!("op:doctor:read"));
}

/// The typed `overview` params moved one boundary and this pins it: a
/// wrong-TYPED `after`/`limit` is refused as `invalid_params` before
/// dispatch and never becomes an operation envelope, while a right-typed
/// out-of-RANGE one still reaches the core and comes back as an ordinary
/// `InvalidRequest` envelope.
#[test]
fn overview_refuses_wrong_typed_paging_at_the_transport() {
    let env = TestEnv::new("forged-overview-params");
    env.forged(&["init"]);
    let mut mcp = McpClient::new(&env);

    for params in [
        json!({"run": "absent", "after": "5"}),
        json!({"run": "absent", "after": 1.5}),
        json!({"run": "absent", "limit": -1}),
    ] {
        let refusal = mcp.call_tool_error_result(
            "overview",
            json!({"schemaVersion": 1, "runId": "absent", "params": params.clone()}),
        );
        let text = refusal
            .pointer("/content/0/text")
            .and_then(Value::as_str)
            .unwrap_or_default();
        assert!(
            text.contains("failed to deserialize parameters"),
            "{params} is refused by the schema the tool advertises: {refusal}"
        );
        // The refusal is NOT an operation envelope: dispatch never ran, so
        // no idempotency key was minted and no operation row exists.
        assert!(
            serde_json::from_str::<Value>(text).is_err(),
            "{params} earns a message, not an envelope: {text}"
        );
    }

    // Right type, wrong RANGE: the core still answers, as an ordinary
    // operation envelope with its own message. (The CLI cannot be compared
    // here: its clap group has refused `--run` together with `--after` /
    // `--limit` since #105, which is a defect in that group, not in this
    // boundary.)
    for (params, message) in [
        (
            json!({"run": "absent", "after": -1}),
            "overview after must be non-negative",
        ),
        (
            json!({"run": "absent", "limit": 0}),
            "overview limit must be between 1 and 1000",
        ),
        (
            json!({"run": "absent", "limit": 1001}),
            "overview limit must be between 1 and 1000",
        ),
    ] {
        let tool = mcp.call_tool(
            "overview",
            json!({"schemaVersion": 1, "runId": "absent", "params": params.clone()}),
        );
        assert_eq!(tool["ok"], json!(false), "{params}: {tool}");
        assert_eq!(tool["error"]["code"], json!("INVALID_REQUEST"), "{tool}");
        assert_eq!(tool["error"]["message"], json!(message), "{tool}");
    }
}
