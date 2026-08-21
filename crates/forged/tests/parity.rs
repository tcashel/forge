//! CLI/MCP parity (the two-adapters-over-one-core criterion): for each of
//! the forty-five public core functions, the CLI path and the MCP tool path produce
//! identical `OperationResponse` values — modulo the minted `operationId` —
//! from the same core call.

mod support;

use serde_json::{json, Value};
use support::{fabricate_run, McpClient, TestEnv};

/// Normalize the minted operationId (a per-call uuid) out of an envelope;
/// derived and read-default ids are deterministic and stay.
fn normalized(mut envelope: Value) -> Value {
    let id = envelope["operationId"].as_str().unwrap_or_default();
    let minted = id.len() == 36 && id.chars().filter(|c| *c == '-').count() == 4;
    if minted {
        envelope["operationId"] = json!("<minted>");
    }
    if envelope["result"]["queue"]["asOf"].is_string() {
        envelope["result"]["queue"]["asOf"] = json!("<sampled>");
    }
    if envelope["result"]["schema"] == json!("forged.work-history/1") {
        envelope["result"]["asOf"] = json!("<sampled>");
    }
    if envelope["result"]["schema"] == json!("forged.provider-session-inventory/1") {
        envelope["result"]["asOf"] = json!("<sampled>");
    }
    if envelope["result"]["capturedAt"]["ledger"].is_string() {
        envelope["result"]["capturedAt"]["ledger"] = json!("<sampled>");
    }
    if envelope["result"]["capturedAt"]["beads"].is_string() {
        envelope["result"]["capturedAt"]["beads"] = json!("<sampled>");
    }
    if envelope["result"]["capturedAt"]["history"].is_string() {
        envelope["result"]["capturedAt"]["history"] = json!("<sampled>");
    }
    if let Some(entries) = envelope["result"]["runs"].as_array_mut() {
        for entry in entries {
            if entry["progressAgeInput"]["asOf"].is_string() {
                entry["progressAgeInput"]["asOf"] = json!("<sampled>");
            }
        }
    }
    if let Some(groups) = envelope["result"]["queue"]["groups"].as_array_mut() {
        for entry in groups
            .iter_mut()
            .flat_map(|group| group["entries"].as_array_mut().into_iter().flatten())
        {
            if entry["progressAgeInput"]["asOf"].is_string() {
                entry["progressAgeInput"]["asOf"] = json!("<sampled>");
            }
        }
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
fn all_forty_five_tools_match_their_cli_counterparts() {
    let env = TestEnv::new("forged-parity");
    env.forged(&["init"]);
    fabricate_run(&env, "par-repository");
    let repository = env.repos.repo.to_string_lossy().into_owned();
    env.set_bead_repository("bead-par-repository", &repository);
    let mut mcp = McpClient::new(&env);

    // The server declares exactly the public operation tools.
    let mut tools = mcp.list_tools();
    tools.sort();
    let mut expected = vec![
        "claim_next",
        "artifact_verify",
        "artifact_compact",
        "attention_acknowledge",
        "attention_list",
        "attention_reopen",
        "attention_resolve",
        "doctor",
        "definition_validate",
        "events_tail",
        "operations_overview",
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
        "review_publish",
        "run_advance",
        "run_accept_risk",
        "run_adjudicate_settlement",
        "run_revise_roster",
        "run_start",
        "run_status",
        "run_stop",
        "run_submit",
        "session_list",
        "session_inventory",
        "session_message",
        "session_read",
        "session_stop",
        "usage_ingest",
        "usage_report",
        "work_detail",
        "work_list",
        "work_history",
        "work_map",
    ];
    expected.sort_unstable();
    assert_eq!(tools, expected, "the forty-five tools, exactly");

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
    assert!(
        description.contains("params.repo"),
        "work_list must describe its optional repository selector: {description}"
    );
    let repository_schema = work_list
        .pointer("/inputSchema/properties/params/properties/repo")
        .cloned()
        .unwrap_or(Value::Null);
    assert!(
        repository_schema.to_string().contains("string"),
        "work_list advertises params.repo as a string: {repository_schema}"
    );
    let work_history = mcp.tool("work_history");
    let history_schema = work_history
        .pointer("/inputSchema")
        .cloned()
        .unwrap_or(Value::Null)
        .to_string();
    for value in [
        "hour",
        "day",
        "week",
        "repository",
        "epic",
        "stage",
        "provider",
    ] {
        assert!(
            history_schema.contains(value),
            "work_history advertises closed value {value}: {history_schema}"
        );
    }
    let session_inventory = mcp.tool("session_inventory");
    assert_eq!(
        session_inventory.pointer("/_meta/ui/resourceUri"),
        Some(&json!("ui://forged/agent-sessions.html"))
    );
    let inventory_schema = session_inventory
        .pointer("/inputSchema")
        .cloned()
        .unwrap_or(Value::Null)
        .to_string();
    for value in [
        "running",
        "revoking",
        "completed",
        "failed",
        "reclaimed",
        "stopped",
    ] {
        assert!(
            inventory_schema.contains(value),
            "session_inventory advertises closed activity {value}: {inventory_schema}"
        );
    }

    let operations = mcp.tool("operations_overview");
    assert_eq!(
        operations.pointer("/_meta/ui/resourceUri"),
        Some(&json!("ui://forged/operations-overview.html"))
    );
    let operation_properties = operations
        .pointer("/inputSchema/properties/params/properties")
        .cloned()
        .unwrap_or(Value::Null);
    for param in ["repo", "group", "source", "limit"] {
        assert!(
            operation_properties.get(param).is_some(),
            "operations_overview advertises params.{param}: {operation_properties}"
        );
    }
    let attention_list = mcp.tool("attention_list");
    let attention_schema = attention_list
        .pointer("/inputSchema")
        .cloned()
        .unwrap_or(Value::Null)
        .to_string();
    for value in [
        "repo",
        "condition",
        "classification",
        "limit",
        "active",
        "open",
        "all",
        "decision",
        "symptom",
    ] {
        assert!(
            attention_schema.contains(value),
            "attention_list advertises closed value or parameter {value}: {attention_schema}"
        );
    }
    assert!(
        attention_list.pointer("/_meta/ui/resourceUri").is_none(),
        "attention_list attaches no UI resource in this slice: {attention_list}"
    );
    let detail = mcp.tool("work_detail");
    assert_eq!(
        detail.pointer("/_meta/ui/resourceUri"),
        Some(&json!("ui://forged/work-detail.html"))
    );
    let detail_properties = detail
        .pointer("/inputSchema/properties/params/properties")
        .cloned()
        .unwrap_or(Value::Null);
    for param in ["subjectKind", "subjectId", "after", "limit"] {
        assert!(
            detail_properties.get(param).is_some(),
            "work_detail advertises params.{param}: {detail_properties}"
        );
    }
    let work_map = mcp.tool("work_map");
    assert_eq!(
        work_map.pointer("/_meta/ui/resourceUri"),
        Some(&json!("ui://forged/work-map.html"))
    );
    let map_schema = work_map
        .pointer("/inputSchema")
        .cloned()
        .unwrap_or(Value::Null)
        .to_string();
    for value in [
        "operator",
        "repository",
        "epic",
        "needs-me",
        "ready-to-merge",
        "stalled-or-recoverable",
        "durable",
        "live-plan",
        "maxNodes",
        "focus",
    ] {
        assert!(
            map_schema.contains(value),
            "work_map advertises closed value or parameter {value}: {map_schema}"
        );
    }
    for (name, tool) in [
        ("work_list", &work_list),
        ("operations_overview", &operations),
        ("work_detail", &detail),
        ("work_map", &work_map),
        ("session_inventory", &session_inventory),
    ] {
        assert_eq!(
            tool.pointer("/inputSchema/additionalProperties"),
            Some(&json!(false)),
            "{name} rejects unknown envelope fields"
        );
        assert_eq!(
            tool.pointer("/inputSchema/properties/params/additionalProperties"),
            Some(&json!(false)),
            "{name} rejects unknown nested params"
        );
    }

    for (name, tool, uri) in [
        ("overview", &overview_tool, "ui://forged/overview.html"),
        (
            "operations_overview",
            &operations,
            "ui://forged/operations-overview.html",
        ),
        ("work_detail", &detail, "ui://forged/work-detail.html"),
        ("work_map", &work_map, "ui://forged/work-map.html"),
        (
            "session_inventory",
            &session_inventory,
            "ui://forged/agent-sessions.html",
        ),
    ] {
        assert_eq!(
            tool.pointer("/_meta/ui/resourceUri"),
            Some(&json!(uri)),
            "{name} advertises the standard App resource key"
        );
        assert_eq!(
            tool.pointer("/_meta/ui~1resourceUri"),
            Some(&json!(uri)),
            "{name} preserves the compatibility App resource key"
        );
        assert!(
            tool.pointer("/_meta/ui/csp").is_none()
                && tool.pointer("/_meta/ui/permissions").is_none(),
            "{name} tool metadata must not carry resource policy: {tool}"
        );
    }

    assert_eq!(
        mcp.list_resources(),
        vec![
            "ui://forged/overview.html".to_owned(),
            "ui://forged/operations-overview.html".to_owned(),
            "ui://forged/work-detail.html".to_owned(),
            "ui://forged/work-map.html".to_owned(),
            "ui://forged/agent-sessions.html".to_owned(),
        ]
    );
    for uri in [
        "ui://forged/overview.html",
        "ui://forged/operations-overview.html",
        "ui://forged/work-detail.html",
        "ui://forged/work-map.html",
        "ui://forged/agent-sessions.html",
    ] {
        let descriptor = mcp.resource(uri);
        assert!(
            descriptor.get("_meta").is_none(),
            "resource policy lives on contents, not the {uri} descriptor: {descriptor}"
        );
    }
    let app = mcp.read_resource("ui://forged/overview.html");
    assert_eq!(
        app.pointer("/contents/0/mimeType"),
        Some(&json!("text/html;profile=mcp-app"))
    );
    assert!(app
        .pointer("/contents/0/text")
        .and_then(Value::as_str)
        .is_some_and(|html| html.contains("Forged Control Plane")));
    for domain in [
        "baseUriDomains",
        "connectDomains",
        "frameDomains",
        "resourceDomains",
    ] {
        assert_eq!(
            app.pointer(&format!("/contents/0/_meta/ui/csp/{domain}")),
            Some(&json!([])),
            "Apps deny every {domain} capability"
        );
    }
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/permissions"),
        Some(&json!({}))
    );
    let app = mcp.read_resource("ui://forged/agent-sessions.html");
    assert!(app
        .pointer("/contents/0/text")
        .and_then(Value::as_str)
        .is_some_and(|html| html.contains("Forged Agent Sessions")
            && html.contains("forged.provider-session-inventory/1")
            && html.contains("session_inventory")
            && html.contains("work_detail")));
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/csp"),
        Some(&json!({
            "baseUriDomains": [],
            "connectDomains": [],
            "frameDomains": [],
            "resourceDomains": [],
        }))
    );
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/permissions"),
        Some(&json!({}))
    );
    let app = mcp.read_resource("ui://forged/operations-overview.html");
    assert!(app
        .pointer("/contents/0/text")
        .and_then(Value::as_str)
        .is_some_and(|html| html.contains("Forged Operations") && html.contains("work_detail")));
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/csp"),
        Some(&json!({
            "baseUriDomains": [],
            "connectDomains": [],
            "frameDomains": [],
            "resourceDomains": [],
        }))
    );
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/permissions"),
        Some(&json!({}))
    );
    let app = mcp.read_resource("ui://forged/work-detail.html");
    assert!(app
        .pointer("/contents/0/text")
        .and_then(Value::as_str)
        .is_some_and(|html| html.contains("Forged Work Detail") && html.contains("work_detail")));
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/csp"),
        Some(&json!({
            "baseUriDomains": [],
            "connectDomains": [],
            "frameDomains": [],
            "resourceDomains": [],
        }))
    );
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/permissions"),
        Some(&json!({}))
    );
    let app = mcp.read_resource("ui://forged/work-map.html");
    assert!(app
        .pointer("/contents/0/text")
        .and_then(Value::as_str)
        .is_some_and(|html| html.contains("Forged Work Map")
            && html.contains("work_map")
            && html.contains("work_detail")));
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/csp"),
        Some(&json!({
            "baseUriDomains": [],
            "connectDomains": [],
            "frameDomains": [],
            "resourceDomains": [],
        }))
    );
    assert_eq!(
        app.pointer("/contents/0/_meta/ui/permissions"),
        Some(&json!({}))
    );

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

    let cli = env
        .forged(&["review", "publish", "--run", "par-repository"])
        .1;
    let tool = mcp.call_tool(
        "review_publish",
        json!({
            "schemaVersion": 1,
            "runId": "par-repository",
            "params": {"run": "par-repository"}
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "review_publish parity");

    let cli = env
        .forged(&[
            "run",
            "stop",
            "--run",
            "absent",
            "--outcome",
            "blocked",
            "--reason",
            "cannot proceed",
        ])
        .1;
    let tool = mcp.call_tool(
        "run_stop",
        json!({
            "schemaVersion": 1,
            "runId": "absent",
            "params": {
                "run": "absent",
                "outcome": "blocked",
                "reason": "cannot proceed"
            }
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_stop parity");

    let cli = env
        .forged(&[
            "run",
            "adjudicate-settlement",
            "--run",
            "absent",
            "--outcome",
            "cancelled",
            "--actor",
            "operator",
            "--rationale",
            "legacy run predates durable driver identity",
            "--evidence-gap",
            "controller record has no /driver/pid and no lstart",
        ])
        .1;
    let tool = mcp.call_tool(
        "run_adjudicate_settlement",
        json!({
            "schemaVersion": 1,
            "runId": "absent",
            "params": {
                "run": "absent",
                "outcome": "cancelled",
                "pr": null,
                "sha": null,
                "supersededBy": null,
                "actor": "operator",
                "rationale": "legacy run predates durable driver identity",
                "evidenceGap": "controller record has no /driver/pid and no lstart"
            }
        }),
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "run_adjudicate_settlement parity"
    );

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

    let cli = env
        .forged(&[
            "work",
            "map",
            "--scope",
            "repository",
            "--repository",
            &repository,
            "--source",
            "durable",
            "--from",
            "2020-01-01T00:00:00Z",
            "--to",
            "2020-01-02T00:00:00Z",
            "--max-nodes",
            "25",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_map",
        envelope(json!({
            "scope": "repository",
            "repository": repository,
            "source": "durable",
            "from": "2020-01-01T00:00:00Z",
            "to": "2020-01-02T00:00:00Z",
            "maxNodes": 25
        })),
    );
    assert_eq!(normalized(cli), normalized(tool), "work_map parity");
    let structured = mcp.call_tool_result(
        "work_map",
        envelope(json!({"scope": "operator", "source": "durable"})),
    );
    assert!(structured["structuredContent"].is_object());

    let cli = env
        .forged(&[
            "operations",
            "overview",
            "--repo",
            &repository,
            "--limit",
            "25",
        ])
        .1;
    let tool = mcp.call_tool(
        "operations_overview",
        envelope(json!({"repo": repository, "limit": 25})),
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "operations_overview parity"
    );
    let structured = mcp.call_tool_result(
        "operations_overview",
        envelope(json!({"repo": repository, "limit": 25})),
    );
    assert!(structured["structuredContent"].is_object());

    let cli = env
        .forged(&["attention", "list", "--state", "all", "--limit", "25"])
        .1;
    let tool = mcp.call_tool(
        "attention_list",
        envelope(json!({"state": "all", "limit": 25})),
    );
    assert_eq!(tool["operationId"], json!("op:attention_list:read"));
    assert_eq!(
        tool["result"]["schema"],
        json!("forged.attention-list/1"),
        "{tool}"
    );
    assert_eq!(normalized(cli), normalized(tool), "attention_list parity");

    let cli = env
        .forged(&[
            "work",
            "detail",
            "--subject-kind",
            "run",
            "--subject-id",
            "absent",
            "--limit",
            "25",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_detail",
        envelope(json!({"subjectKind": "run", "subjectId": "absent", "limit": 25})),
    );
    assert_eq!(normalized(cli), normalized(tool), "work_detail parity");
    let structured = mcp.call_tool_result(
        "work_detail",
        envelope(json!({"subjectKind": "run", "subjectId": "absent", "limit": 25})),
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

    let cli = env
        .forged(&[
            "run",
            "accept-risk",
            "--run",
            "absent",
            "--accepted-by",
            "lead-agent",
            "--rationale",
            "known deployment boundary",
        ])
        .1;
    let tool = mcp.call_tool(
        "run_accept_risk",
        json!({
            "schemaVersion": 1,
            "runId": "absent",
            "params": {
                "run": "absent",
                "acceptedBy": "lead-agent",
                "rationale": "known deployment boundary"
            }
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_accept_risk parity");

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

    // artifact_verify: a missing attempt is the same read-only refusal.
    let cli = env.forged(&["artifact", "verify", "--attempt", "1"]).1;
    let tool = mcp.call_tool("artifact_verify", envelope(json!({"attempt": 1})));
    assert_eq!(normalized(cli), normalized(tool), "artifact_verify parity");

    // artifact_compact requires an explicit key on both adapters.
    let cli = env.forged(&["artifact", "compact", "--attempt", "1"]).1;
    let tool = mcp.call_tool("artifact_compact", envelope(json!({"attempt": 1})));
    assert_eq!(normalized(cli), normalized(tool), "artifact_compact parity");

    // Session controls: missing durable state refuses identically.
    let cli = env.forged(&["session", "list", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "session_list",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "session_list parity");

    let cli = env
        .forged(&[
            "session",
            "inventory",
            "--repository",
            &repository,
            "--provider",
            "codex",
            "--activity",
            "running",
            "--limit",
            "25",
        ])
        .1;
    let tool = mcp.call_tool(
        "session_inventory",
        envelope(json!({
            "repository": repository,
            "provider": "codex",
            "activity": "running",
            "limit": 25,
        })),
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "session_inventory parity"
    );
    let structured = mcp.call_tool_result(
        "session_inventory",
        envelope(json!({
            "repository": repository,
            "provider": "codex",
            "activity": "running",
            "limit": 25,
        })),
    );
    assert!(structured["structuredContent"].is_object());
    assert_eq!(
        structured["structuredContent"],
        serde_json::from_str::<Value>(
            structured["content"][0]["text"]
                .as_str()
                .expect("session_inventory text fallback"),
        )
        .expect("session_inventory JSON text fallback")
    );

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

    // work_list: no selector and the exact repository selector are the same
    // shared operation on both surfaces.
    let cli = env.forged(&["work", "list"]).1;
    let tool = mcp.call_tool("work_list", envelope(json!({})));
    assert_eq!(tool["operationId"], json!("op:work_list:read"));
    assert_eq!(normalized(cli), normalized(tool), "work_list parity");
    let cli = env.forged(&["work", "list", "--repo", &repository]).1;
    let tool = mcp.call_tool("work_list", envelope(json!({"repo": repository})));
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "repository-scoped work_list parity"
    );

    let cli = env
        .forged(&[
            "work",
            "history",
            "--from",
            "2026-08-01T00:00:00Z",
            "--to",
            "2026-09-01T00:00:00Z",
            "--bucket",
            "day",
            "--group-by",
            "repository",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_history",
        envelope(json!({
            "from": "2026-08-01T00:00:00Z",
            "to": "2026-09-01T00:00:00Z",
            "bucket": "day",
            "groupBy": "repository",
        })),
    );
    assert_eq!(tool["operationId"], json!("op:work_history:read"));
    assert_eq!(normalized(cli), normalized(tool), "work_history parity");

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

#[test]
fn work_list_refuses_present_non_string_repository_scopes() {
    let env = TestEnv::new("forged-work-list-mcp-params");
    env.forged(&["init"]);
    fabricate_run(&env, "mcp-repository-widening-guard");
    let mut mcp = McpClient::new(&env);

    for repository in [Value::Null, json!(7), json!({"path": "/repo"})] {
        let refusal = mcp.call_tool_error_result(
            "work_list",
            json!({"schemaVersion": 1, "params": {"repo": repository.clone()}}),
        );
        let text = refusal
            .pointer("/content/0/text")
            .and_then(Value::as_str)
            .unwrap_or_default();
        assert!(
            text.contains("failed to deserialize parameters"),
            "present non-string repo is refused before dispatch: {repository}: {refusal}"
        );
        assert!(
            serde_json::from_str::<Value>(text).is_err(),
            "transport refusal is not an unfiltered operation envelope: {text}"
        );
    }
}

#[test]
fn split_inventory_tools_refuse_unknown_fields_at_both_schema_boundaries() {
    let env = TestEnv::new("forged-split-app-unknown-fields");
    env.forged(&["init"]);
    let mut mcp = McpClient::new(&env);

    for (tool, arguments) in [
        (
            "work_list",
            json!({"schemaVersion": 1, "unexpected": true, "params": {}}),
        ),
        (
            "work_list",
            json!({"schemaVersion": 1, "params": {"unexpected": true}}),
        ),
        (
            "operations_overview",
            json!({"schemaVersion": 1, "unexpected": true, "params": {}}),
        ),
        (
            "operations_overview",
            json!({"schemaVersion": 1, "params": {"unexpected": true}}),
        ),
        (
            "attention_list",
            json!({"schemaVersion": 1, "unexpected": true, "params": {}}),
        ),
        (
            "attention_list",
            json!({"schemaVersion": 1, "params": {"unexpected": true}}),
        ),
        (
            "work_detail",
            json!({"schemaVersion": 1, "unexpected": true, "params": {"subjectKind": "run", "subjectId": "absent"}}),
        ),
        (
            "work_detail",
            json!({"schemaVersion": 1, "params": {"subjectKind": "run", "subjectId": "absent", "unexpected": true}}),
        ),
    ] {
        let refusal = mcp.call_tool_error_result(tool, arguments.clone());
        let text = refusal
            .pointer("/content/0/text")
            .and_then(Value::as_str)
            .unwrap_or_default();
        assert!(
            text.contains("failed to deserialize parameters") && text.contains("unknown field"),
            "{tool} must reject unknown fields before dispatch: {arguments}: {refusal}"
        );
        assert!(
            serde_json::from_str::<Value>(text).is_err(),
            "transport refusal is not an operation envelope: {text}"
        );
    }
}

#[test]
fn split_app_tools_refuse_malformed_typed_targets_before_dispatch() {
    let env = TestEnv::new("forged-split-app-mcp-params");
    env.forged(&["init"]);
    let mut mcp = McpClient::new(&env);

    for params in [
        json!({"repo": null}),
        json!({"group": 7}),
        json!({"source": {"kind": "durable"}}),
        json!({"limit": "25"}),
    ] {
        let refusal = mcp.call_tool_error_result(
            "operations_overview",
            json!({"schemaVersion": 1, "params": params.clone()}),
        );
        let text = refusal
            .pointer("/content/0/text")
            .and_then(Value::as_str)
            .unwrap_or_default();
        assert!(
            text.contains("failed to deserialize parameters"),
            "malformed Operations params are a transport refusal: {params}: {refusal}"
        );
    }

    for arguments in [
        json!({"schemaVersion": 1}),
        json!({"schemaVersion": 1, "params": {"subjectKind": "plan", "subjectId": "x"}}),
        json!({"schemaVersion": 1, "params": {"subjectKind": "run", "subjectId": " "}}),
        json!({"schemaVersion": 1, "params": {"subjectKind": "run", "subjectId": "x", "after": "0"}}),
    ] {
        let refusal = mcp.call_tool_error_result("work_detail", arguments.clone());
        let text = refusal
            .pointer("/content/0/text")
            .and_then(Value::as_str)
            .unwrap_or_default();
        assert!(
            text.contains("failed to deserialize parameters"),
            "malformed Work Detail target is refused before dispatch: {arguments}: {refusal}"
        );
    }

    // The closed attention_list state and classification enums refuse any
    // value outside their contract before dispatch, as does a present
    // null/wrong-typed scope.
    for params in [
        json!({"repo": null}),
        json!({"state": "resolved"}),
        json!({"classification": "root-cause"}),
        json!({"limit": "25"}),
    ] {
        let refusal = mcp.call_tool_error_result(
            "attention_list",
            json!({"schemaVersion": 1, "params": params.clone()}),
        );
        let text = refusal
            .pointer("/content/0/text")
            .and_then(Value::as_str)
            .unwrap_or_default();
        assert!(
            text.contains("failed to deserialize parameters"),
            "malformed attention_list params are a transport refusal: {params}: {refusal}"
        );
    }
}
