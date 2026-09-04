//! CLI/MCP parity (the two-adapters-over-one-core criterion): every manifest
//! operation exposed through both adapters produces identical `OperationResponse`
//! values — modulo the minted `operationId` — from the same core call.

mod support;

use serde_json::{json, Value};
use support::{fabricate_run, McpClient, TestEnv};

const OPERATION_SURFACE: &str = include_str!("../../../docs/reference/operation-surface.json");
const HOST_PARITY_FIXTURES: &str =
    include_str!("../../../plugins/forged/skills/manage-work/host-parity-fixtures.json");

fn manifest_mcp_tools(audience: Option<&str>) -> Vec<String> {
    let manifest: Value = serde_json::from_str(OPERATION_SURFACE).expect("surface manifest JSON");
    manifest["operations"]
        .as_array()
        .expect("surface manifest operations")
        .iter()
        .filter(|row| {
            row["mcp"] == json!(true)
                && audience.is_none_or(|audience| row["audience"] == json!(audience))
        })
        .map(|row| {
            row["name"]
                .as_str()
                .expect("surface operation name")
                .to_owned()
        })
        .collect()
}

fn manifest_lead_tools_by_write(is_write: bool) -> Vec<String> {
    let manifest: Value = serde_json::from_str(OPERATION_SURFACE).expect("surface manifest JSON");
    manifest["operations"]
        .as_array()
        .expect("surface manifest operations")
        .iter()
        .filter(|row| {
            row["mcp"] == json!(true)
                && row["audience"] == json!("lead")
                && (row["class"] != json!("read_only")) == is_write
        })
        .map(|row| {
            row["name"]
                .as_str()
                .expect("surface operation name")
                .to_owned()
        })
        .collect()
}

fn host_fixture_tools() -> Vec<String> {
    let fixture: Value =
        serde_json::from_str(HOST_PARITY_FIXTURES).expect("host-parity fixture JSON");
    fixture["tools"]
        .as_array()
        .expect("host-parity fixture tools")
        .iter()
        .map(|name| name.as_str().expect("host-parity tool name").to_owned())
        .collect()
}

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
    if envelope["result"]["capturedAt"]["work"].is_string() {
        envelope["result"]["capturedAt"]["work"] = json!("<sampled>");
    }
    if envelope["result"]["capturedAt"]["history"].is_string() {
        envelope["result"]["capturedAt"]["history"] = json!("<sampled>");
    }
    if envelope["result"]["note"]["noteId"].is_string() {
        envelope["result"]["note"]["noteId"] = json!("<minted>");
    }
    if envelope["result"]["note"]["writtenAt"].is_string() {
        envelope["result"]["note"]["writtenAt"] = json!("<sampled>");
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

fn assert_subject_parity(cli: &Value, tool: &Value, context: &str) {
    for (surface, envelope) in [("CLI", cli), ("MCP", tool)] {
        let subject = envelope
            .pointer("/result/subject")
            .and_then(Value::as_object)
            .unwrap_or_else(|| panic!("{context} {surface} projection has a subject: {envelope}"));
        for key in ["id", "kind", "title", "repository", "revision"] {
            assert!(
                subject.contains_key(key),
                "{context} {surface} subject carries {key}: {envelope}"
            );
        }
    }
    assert_eq!(
        cli["result"]["subject"], tool["result"]["subject"],
        "{context}"
    );
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

fn cli_envelope_text(env: &TestEnv, args: &[&str]) -> (i32, String) {
    let output = env.forged_cmd(args).output().expect("forged CLI runs");
    let text = String::from_utf8(output.stdout).expect("CLI envelope is UTF-8");
    (
        output.status.code().unwrap_or(-1),
        text.trim_end_matches(['\r', '\n']).to_owned(),
    )
}

fn envelope(params: Value) -> Value {
    json!({"schemaVersion": 1, "params": params})
}

fn start_run(env: &TestEnv, run: &str) {
    env.seed_work_spec(
        run,
        "Exercise one MCP run-identity regression.",
        "Conflicting run aliases are rejected without effects.",
    );
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let (code, response) = env.forged(&[
        "run",
        "start",
        "--work",
        run,
        "--repo",
        &repository,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start {run}: {response}");
}

fn prepare_run_worktree(env: &TestEnv, run: &str) {
    let spec = forged_git::WorktreeSpec {
        repo: env.repos.repo.clone(),
        runs_root: env.anvil.join("runs"),
        run_id: run.to_owned(),
        branch: format!("forged/{run}"),
        base: env.repos.base.clone(),
        expected_base_sha: None,
    };
    tokio::runtime::Runtime::new()
        .expect("test runtime")
        .block_on(forged_git::prepare_worktree(&spec))
        .expect("prepare run worktree");
}

#[test]
fn all_manifest_tools_match_their_cli_counterparts() {
    let env = TestEnv::new("forged-parity");
    env.forged(&["init"]);
    fabricate_run(&env, "par-repository");
    let repository = env.repos.repo.to_string_lossy().into_owned();
    env.set_work_repository("bead-par-repository", &repository);
    // The fixture work exists for repository projections only; park it so
    // the claim_next parity leg still sees an empty ready frontier (the
    // ledger frontier is a query over open unassigned items).
    env.set_work_field("bead-par-repository", "status", "blocked");
    let mut lead_mcp = McpClient::new(&env, None);

    // Default discovery is exactly the lead audience declared by the
    // manifest. Hidden tools remain callable because audience is a listing
    // filter, never an authorization boundary.
    let mut lead_tools = lead_mcp.list_tools();
    lead_tools.sort();
    let mut expected_lead = manifest_mcp_tools(Some("lead"));
    expected_lead.sort_unstable();
    assert_eq!(
        lead_tools, expected_lead,
        "the manifest lead tools, exactly"
    );
    let hidden =
        lead_mcp.call_tool_result("operations_overview", envelope(json!({"repo": repository})));
    assert_eq!(hidden["isError"], json!(false), "{hidden}");

    let mut mcp = McpClient::new(&env, Some("all"));
    let mut tools = mcp.list_tools();
    tools.sort();
    let mut expected = manifest_mcp_tools(None);
    expected.sort_unstable();
    assert_eq!(tools, expected, "all manifest MCP tools, exactly");

    for audience in ["machine", "operator"] {
        let mut audience_mcp = McpClient::new(&env, Some(audience));
        let mut listed = audience_mcp.list_tools();
        listed.sort();
        let mut expected = manifest_mcp_tools(Some(audience));
        expected.sort_unstable();
        assert_eq!(listed, expected, "the manifest {audience} tools, exactly");
    }

    let host_tools = host_fixture_tools();
    let missing = lead_tools
        .iter()
        .filter(|name| !host_tools.contains(name))
        .cloned()
        .collect::<Vec<_>>();
    assert!(
        missing.is_empty(),
        "host-parity fixture is missing lead MCP tools: {missing:?}"
    );

    // Both MCP result paths turn a failed operation response into a tool
    // error without changing one byte of the CLI-compatible JSON text.
    let (code, cli_text) = cli_envelope_text(&env, &["run", "status", "--run", "absent"]);
    assert_eq!(code, 1);
    let raw = mcp.call_tool_result("run_status", json!({"run": "absent"}));
    assert_eq!(raw["isError"], json!(true));
    assert_eq!(raw["content"][0]["text"], json!(cli_text));

    let (code, cli_text) = cli_envelope_text(&env, &["overview", "--run", "absent"]);
    assert_eq!(code, 1);
    let raw = mcp.call_tool_result("overview", envelope(json!({"run": "absent"})));
    assert_eq!(raw["isError"], json!(true));
    assert_eq!(raw["content"][0]["text"], json!(cli_text));
    assert_eq!(
        raw["structuredContent"],
        serde_json::from_str::<Value>(&cli_text).expect("structured failure envelope")
    );

    let (code, cli_text) = cli_envelope_text(&env, &["explain", "--id", "bead-par-repository"]);
    assert_eq!(code, 0);
    let raw = mcp.call_tool_result("explain", json!({"id": "bead-par-repository"}));
    assert_eq!(raw["isError"], json!(false));
    assert_eq!(raw["content"][0]["text"], json!(cli_text));
    assert_eq!(
        raw["structuredContent"],
        serde_json::from_str::<Value>(&cli_text).expect("structured explain envelope")
    );

    let overview_tool = mcp.tool("overview");
    assert_eq!(
        overview_tool.pointer("/_meta/ui/resourceUri"),
        Some(&json!("ui://forged/overview.html"))
    );
    // Host-rendered tools advertise their params concretely, including which
    // fields are required.
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
    assert!(
        properties["detail"]
            .to_string()
            .contains("ProjectionDetailParam"),
        "overview advertises the closed detail enum: {properties}"
    );
    assert!(
        properties.get("symptoms").is_some(),
        "overview advertises params.symptoms: {properties}"
    );
    let description = overview_tool["description"].as_str().unwrap_or_default();
    assert!(
        description.contains("At most one of params.run, params.epic, or params.id is accepted"),
        "overview must state its at-most-one rule: {description}"
    );
    assert!(
        description.contains("omitting all three projects the portfolio"),
        "overview must state that no scope is the portfolio: {description}"
    );
    for name in [
        "explain",
        "overview",
        "operations_overview",
        "run_status",
        "work_show",
        "work_list",
        "work_detail",
        "attention_list",
    ] {
        let tool = mcp.tool(name);
        let description = tool["description"].as_str().unwrap_or_default();
        assert!(
            description.contains("nextActions"),
            "{name} must advertise nextActions: {description}"
        );
    }
    let work_list = mcp.tool("work_list");
    let description = work_list["description"].as_str().unwrap_or_default();
    assert!(
        description.contains("Takes no id"),
        "work_list must state that it takes no id: {description}"
    );
    for param in ["repo", "status", "assignee"] {
        assert!(
            description.contains(param),
            "work_list must describe {param}: {description}"
        );
        let schema = work_list
            .pointer(&format!("/inputSchema/properties/{param}"))
            .cloned()
            .unwrap_or(Value::Null);
        assert!(
            schema.to_string().contains("string"),
            "work_list advertises params.{param} as a string: {schema}"
        );
    }
    let work_ready = mcp.tool("work_ready");
    let ready_schema = work_ready
        .pointer("/inputSchema/properties")
        .cloned()
        .unwrap_or(Value::Null);
    for param in ["repo", "cursor", "detail", "limit", "all"] {
        assert!(
            ready_schema.get(param).is_some(),
            "work_ready advertises params.{param}: {ready_schema}"
        );
    }
    assert!(
        ready_schema["detail"].to_string().contains("full"),
        "work_ready advertises full detail: {ready_schema}"
    );
    let description = work_ready["description"].as_str().unwrap_or_default();
    for statement in [
        "summary rows by default",
        "repo",
        "cursor",
        "detail",
        "limit",
        "all",
        "nextCursor",
        "100",
        "500",
    ] {
        assert!(
            description.contains(statement),
            "work_ready description states {statement:?}: {description}"
        );
    }
    let work_note_add = mcp.tool("work_note_add");
    let add_schema = work_note_add
        .pointer("/inputSchema/properties")
        .cloned()
        .unwrap_or(Value::Null);
    for param in ["id", "kind", "bodyJson", "schema", "actor"] {
        assert!(
            add_schema.get(param).is_some(),
            "work_note_add advertises params.{param}: {add_schema}"
        );
    }
    let work_update = mcp.tool("work_update");
    let update_description = work_update["description"].as_str().unwrap_or_default();
    for statement in [
        "priority-only write leaves revision unchanged",
        "spec field mints exactly one revision",
        "work_update",
        "work_promote",
        "work_reopen",
    ] {
        assert!(
            update_description.contains(statement),
            "work_update description states {statement:?}: {update_description}"
        );
    }
    let work_promote = mcp.tool("work_promote");
    let promote_description = work_promote["description"].as_str().unwrap_or_default();
    for statement in [
        "revision N+1",
        "cause planning-apply",
        "status open",
        "work_update",
        "work_reopen",
    ] {
        assert!(
            promote_description.contains(statement),
            "work_promote description states {statement:?}: {promote_description}"
        );
    }
    for kind in ["comment", "critique", "recommendation", "approval"] {
        assert!(
            work_note_add["inputSchema"].to_string().contains(kind),
            "work_note_add advertises kind {kind}: {}",
            work_note_add["inputSchema"]
        );
    }
    let work_note_list = mcp.tool("work_note_list");
    let list_schema = work_note_list
        .pointer("/inputSchema/properties")
        .cloned()
        .unwrap_or(Value::Null);
    for param in ["id", "kind", "limit"] {
        assert!(
            list_schema.get(param).is_some(),
            "work_note_list advertises params.{param}: {list_schema}"
        );
    }
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
    for param in ["repo", "group", "source", "limit", "detail", "symptoms"] {
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
    for param in [
        "subjectKind",
        "subjectId",
        "id",
        "after",
        "limit",
        "detail",
        "symptoms",
    ] {
        assert!(
            detail_properties.get(param).is_some(),
            "work_detail advertises params.{param}: {detail_properties}"
        );
    }
    let explain = mcp.tool("explain");
    assert!(
        explain.pointer("/inputSchema/properties/id").is_some(),
        "explain advertises its required id: {explain}"
    );
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
    for name in &lead_tools {
        let tool = mcp.tool(name);
        let properties = tool
            .pointer("/inputSchema/properties")
            .and_then(Value::as_object);
        for field in ["schemaVersion", "runId", "params"] {
            assert!(
                properties.is_none_or(|properties| !properties.contains_key(field)),
                "lead tool {name} must not advertise envelope field {field}: {tool}"
            );
        }
    }
    for name in manifest_lead_tools_by_write(false) {
        let tool = mcp.tool(&name);
        assert!(
            tool.pointer("/inputSchema/properties/idempotencyKey")
                .is_none(),
            "lead read {name} must not advertise idempotencyKey: {tool}"
        );
    }
    for name in manifest_lead_tools_by_write(true) {
        let tool = mcp.tool(&name);
        assert!(
            tool.pointer("/inputSchema/properties/idempotencyKey")
                .is_some(),
            "lead write {name} must advertise optional idempotencyKey: {tool}"
        );
    }
    for (name, tool) in [("explain", &explain), ("work_list", &work_list)] {
        assert_eq!(
            tool.pointer("/inputSchema/additionalProperties"),
            Some(&json!(false)),
            "{name} rejects unknown flat arguments"
        );
    }
    for (name, tool) in [
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
        .is_some_and(|html| html.contains("Forged Operations")
            && html.contains("operations_overview")
            && html.contains("attention_list")
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

    let cli = env.forged(&["definition", "validate"]).1;
    let tool = mcp.call_tool("definition_validate", json!({}));
    assert_eq!(cli, tool, "definition_validate parity");

    let cli = env.forged(&["run", "status", "--run", "par-repository"]).1;
    let tool = mcp.call_tool("run_status", json!({"run": "par-repository"}));
    assert_subject_parity(&cli, &tool, "run_status subject parity");
    assert_eq!(
        normalized(cli),
        normalized(tool.clone()),
        "run_status action parity"
    );
    assert!(
        tool.pointer("/result/run/nextActions")
            .is_some_and(Value::is_array),
        "run_status keeps every old field and adds nextActions: {tool}"
    );

    let cli = env
        .forged(&["work", "show", "--id", "bead-par-repository"])
        .1;
    let tool = mcp.call_tool("work_show", json!({"id": "bead-par-repository"}));
    assert_subject_parity(&cli, &tool, "work_show subject parity");
    assert_eq!(
        normalized(cli),
        normalized(tool.clone()),
        "work_show action parity"
    );
    assert!(
        tool.pointer("/result/nextActions")
            .is_some_and(Value::is_array),
        "work_show keeps every old field and adds nextActions: {tool}"
    );

    let cli = env.forged(&["explain", "--id", "bead-par-repository"]).1;
    let tool = mcp.call_tool("explain", json!({"id": "bead-par-repository"}));
    assert_subject_parity(&cli, &tool, "explain subject parity");
    assert_eq!(normalized(cli), normalized(tool.clone()), "explain parity");
    assert_eq!(tool["result"]["kind"], json!("work-item"));
    assert!(tool["result"]["next"].is_array(), "{tool}");

    // run_start: an invalid (relative) repo path refuses identically.
    let cli = env
        .forged(&[
            "run", "start", "--work", "par-a", "--repo", "rel/path", "--spec", "nope.md",
        ])
        .1;
    let tool = mcp.call_tool(
        "run_start",
        json!({"bead": "par-a", "repo": "rel/path", "spec": "nope.md"}),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_start parity");

    let cli = env.forged(&["run", "retry", "--id", "absent"]).1;
    let tool = mcp.call_tool(
        "run_retry",
        json!({
            "id": "absent", "runId": null, "profile": null, "roster": null
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_retry parity");

    // run_advance / run_submit / run_status: a nonexistent run refuses identically.
    let cli = env.forged(&["run", "advance", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "run_advance",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_advance parity");

    let cli = env.forged(&["run", "submit", "--run", "absent"]).1;
    let tool = mcp.call_tool("run_submit", json!({"run": "absent"}));
    assert_eq!(normalized(cli), normalized(tool), "run_submit parity");

    let cli = env.forged(&["run", "status", "--run", "absent"]).1;
    let tool = mcp.call_tool("run_status", json!({"run": "absent"}));
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
            "run": "absent",
            "outcome": "blocked",
            "reason": "cannot proceed"
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
            "run": "absent",
            "outcome": "cancelled",
            "pr": null,
            "sha": null,
            "supersededBy": null,
            "actor": "operator",
            "rationale": "legacy run predates durable driver identity",
            "evidenceGap": "controller record has no /driver/pid and no lstart"
        }),
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "run_adjudicate_settlement parity"
    );

    let cli = env
        .forged(&[
            "overview",
            "--run",
            "absent",
            "--detail",
            "summary",
            "--symptoms",
        ])
        .1;
    let tool = mcp.call_tool(
        "overview",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent", "detail": "summary", "symptoms": true}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "overview parity");
    let cli = env
        .forged(&["overview", "--run", "par-repository", "--detail", "summary"])
        .1;
    let tool = mcp.call_tool(
        "overview",
        json!({
            "schemaVersion": 1,
            "runId": "par-repository",
            "params": {"run": "par-repository", "detail": "summary"}
        }),
    );
    assert_subject_parity(&cli, &tool, "overview subject parity");
    assert_eq!(normalized(cli), normalized(tool), "overview subject parity");
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
    assert_subject_parity(&cli, &tool, "work_map subject parity");
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
        normalized(tool.clone()),
        "operations_overview parity"
    );
    assert_eq!(tool["result"]["attention"]["counts"]["symptoms"], json!(1));
    assert_eq!(tool["result"]["attention"]["decisions"], json!([]));
    assert!(
        tool["result"]["attention"].get("symptoms").is_none(),
        "summary attention omits symptom rows unless requested: {tool}"
    );
    let symptoms = mcp.call_tool(
        "operations_overview",
        envelope(json!({"repo": repository, "limit": 25, "symptoms": true})),
    );
    assert!(
        symptoms
            .pointer("/result/attention/symptoms/0/nextActions")
            .is_some_and(Value::is_array),
        "requested symptom items retain nextActions: {symptoms}"
    );
    let structured = mcp.call_tool_result(
        "operations_overview",
        envelope(json!({"repo": repository, "limit": 25})),
    );
    assert!(structured["structuredContent"].is_object());

    let cli = env
        .forged(&["attention", "list", "--state", "all", "--limit", "25"])
        .1;
    let tool = mcp.call_tool("attention_list", json!({"state": "all", "limit": 25}));
    assert_subject_parity(&cli, &tool, "attention_list subject parity");
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
            "--detail",
            "summary",
            "--symptoms",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_detail",
        envelope(json!({"subjectKind": "run", "subjectId": "absent", "limit": 25, "detail": "summary", "symptoms": true})),
    );
    assert_eq!(normalized(cli), normalized(tool), "work_detail parity");
    let structured = mcp.call_tool_result(
        "work_detail",
        envelope(json!({"subjectKind": "run", "subjectId": "absent", "limit": 25})),
    );
    assert!(structured["structuredContent"].is_object());
    assert_eq!(structured["structuredContent"]["ok"], json!(false));

    // The bare-id form: a resolved id and an unresolvable one both answer
    // identically on both surfaces.
    let cli = env.forged(&["work", "detail", "--id", "par-repository"]).1;
    let tool = mcp.call_tool("work_detail", envelope(json!({"id": "par-repository"})));
    assert_subject_parity(&cli, &tool, "work_detail subject parity");
    assert_eq!(
        tool["result"]["schema"],
        json!("forged.work-detail/1"),
        "{tool}"
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "work_detail bare-id parity"
    );
    let cli = env.forged(&["work", "detail", "--id", "absent"]).1;
    let tool = mcp.call_tool("work_detail", envelope(json!({"id": "absent"})));
    assert_eq!(
        tool["ok"],
        json!(true),
        "an unknown id is not an error: {tool}"
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "work_detail resolution parity"
    );

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
            "run": "absent",
            "roster": "default",
            "reason": "provider access changed"
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
            "run": "absent",
            "acceptedBy": "lead-agent",
            "rationale": "known deployment boundary"
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "run_accept_risk parity");

    // The read-only rehearsal reports a relative repo identically. (The
    // params carry the CLI's explicit nulls so both surfaces match exactly.)
    let cli = env
        .forged(&[
            "epic",
            "preflight",
            "--epic",
            "absent-epic",
            "--repo",
            "relative",
        ])
        .1;
    let tool = mcp.call_tool(
        "epic_preflight",
        json!({
            "epic": "absent-epic", "repo": "relative",
            "baseRef": null, "profile": null, "roster": null, "rolling": false
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "epic_preflight parity");

    // Epic lifecycle and control refusals have identical envelopes. The
    // start carries an explicit key: its DEFAULT key folds in the released
    // count, so two sequential released failures legitimately differ there
    // (the released-epoch regression test owns that contract).
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
            "--idempotency-key",
            "parity-epic-start",
        ])
        .1;
    let tool = mcp.call_tool(
        "epic_start",
        json!({
            "idempotencyKey": "parity-epic-start",
            "epic": "absent-epic", "repo": "relative", "spec": "relative",
            "baseRef": null, "profile": null, "roster": null
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "epic_start parity");

    for (subcommand, tool_name) in [("submit", "epic_submit"), ("status", "epic_status")] {
        let cli = env.forged(&["epic", subcommand, "--epic", "absent-epic"]).1;
        let tool = mcp.call_tool(tool_name, json!({"epic": "absent-epic"}));
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
                "epic": "absent-epic", "reason": "operator test"
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
            "epic": "absent-epic", "child": "child-a", "note": "resolved"
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
            "epic": "absent-epic", "roster": "default",
            "reason": "provider access changed"
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
        ])
        .1;
    let result_json: Value =
        serde_json::from_str(&std::fs::read_to_string(&result_file).expect("read result"))
            .expect("result json");
    let tool = mcp.call_tool(
        "packet_complete",
        json!({
            "schemaVersion": 1,
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

    // packet_show: an absent packet is the same read-only refusal.
    let cli = env
        .forged(&["packet", "show", "--packet", "absent/implement/1"])
        .1;
    let tool = mcp.call_tool(
        "packet_show",
        envelope(json!({"packet": "absent/implement/1"})),
    );
    assert_eq!(normalized(cli), normalized(tool), "packet_show parity");

    // artifact_verify: a missing attempt is the same read-only refusal.
    let cli = env.forged(&["artifact", "verify", "--attempt", "1"]).1;
    let tool = mcp.call_tool("artifact_verify", envelope(json!({"attempt": 1})));
    assert_eq!(normalized(cli), normalized(tool), "artifact_verify parity");

    // artifact_compact requires an explicit key at Clap; the shared handler
    // retains the same backstop for MCP and direct core callers.
    let missing_key = mcp.call_tool_result("artifact_compact", envelope(json!({"attempt": 1})));
    assert_eq!(missing_key["isError"], json!(true));
    let missing_key_envelope: Value = serde_json::from_str(
        missing_key["content"][0]["text"]
            .as_str()
            .expect("artifact_compact refusal text"),
    )
    .expect("artifact_compact refusal envelope");
    assert_eq!(
        missing_key_envelope["error"]["code"],
        json!("INVALID_REQUEST")
    );
    let cli = env
        .forged(&[
            "artifact",
            "compact",
            "--attempt",
            "1",
            "--idempotency-key",
            "artifact-parity",
        ])
        .1;
    let tool = mcp.call_tool(
        "artifact_compact",
        json!({
            "schemaVersion": 1,
            "idempotencyKey": "artifact-parity",
            "params": {"attempt": 1},
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "artifact_compact parity");

    // Session controls: missing durable state refuses identically.
    let cli = env.forged(&["session", "list", "--run", "absent"]).1;
    let tool = mcp.call_tool("session_list", json!({"run": "absent"}));
    assert_eq!(normalized(cli), normalized(tool), "session_list parity");
    let cli = env.forged(&["session", "list", "--id", "par-repository"]).1;
    let tool = mcp.call_tool("session_list", json!({"id": "par-repository"}));
    assert_subject_parity(&cli, &tool, "session_list subject parity");
    assert_eq!(normalized(cli), normalized(tool), "session_list id parity");

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
    let tool = mcp.call_tool("session_read", json!({"attempt": 1, "lines": 120}));
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
            "idempotencyKey": "op:session_message:par-mcp",
            "run": "absent", "attempt": null, "message": "checkpoint",
            "requestedBy": "operator"
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

    // claim_next is required at Clap; MCP keeps the core refusal backstop.
    let missing_key = mcp.call_tool_result("claim_next", envelope(json!({"holder": "w"})));
    assert_eq!(missing_key["isError"], json!(true));
    let missing_key_envelope: Value = serde_json::from_str(
        missing_key["content"][0]["text"]
            .as_str()
            .expect("claim_next refusal text"),
    )
    .expect("claim_next refusal envelope");
    assert_eq!(
        missing_key_envelope["error"]["code"],
        json!("INVALID_REQUEST")
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
    assert_subject_parity(&cli, &tool, "claim_next subject parity");
    assert_eq!(normalized(cli), normalized(tool), "claim_next parity");

    // gate_run: a nonexistent run refuses before the operation fence on both
    // surfaces, leaving byte-equivalent envelopes.
    let cli = env.forged(&["gate", "run", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "gate_run",
        json!({
            "schemaVersion": 1,
            "runId": "absent",
            "params": {"run": "absent", "stage": null},
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "gate_run parity");

    // reconcile: a nonexistent run refuses identically.
    let cli = env.forged(&["reconcile", "--run", "absent"]).1;
    let tool = mcp.call_tool(
        "reconcile",
        json!({"schemaVersion": 1, "runId": "absent", "params": {"run": "absent"}}),
    );
    assert_eq!(normalized(cli), normalized(tool), "reconcile parity");

    // usage_report and events_tail: identical read-only envelopes.
    let cli = env.forged(&["usage"]).1;
    let tool = mcp.call_tool("usage_report", json!({}));
    assert_eq!(normalized(cli), normalized(tool), "usage_report parity");

    let cli = env.forged(&["events", "--id", "par-repository"]).1;
    let tool = mcp.call_tool("events_tail", envelope(json!({"id": "par-repository"})));
    assert_subject_parity(&cli, &tool, "events_tail subject parity");
    assert_eq!(normalized(cli), normalized(tool), "events_tail parity");

    // work_list: no selector and the exact repository selector are the same
    // shared operation on both surfaces.
    let cli = env.forged(&["work", "list"]).1;
    let tool = mcp.call_tool("work_list", json!({}));
    assert_subject_parity(&cli, &tool, "work_list subject parity");
    assert_eq!(tool["operationId"], json!("op:work_list:read"));
    assert_eq!(normalized(cli), normalized(tool), "work_list parity");
    let cli = env
        .forged(&["work", "list", "--repo", &repository, "--status", "open"])
        .1;
    let tool = mcp.call_tool("work_list", json!({"repo": repository, "status": "open"}));
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "composed-filter work_list parity"
    );

    let note_body = env.root.join("parity-note.json");
    std::fs::write(&note_body, r#"{"z":1,"a":2}"#).expect("write parity note");
    let note_body = note_body.to_str().expect("UTF-8 note path");
    let cli = env
        .forged(&[
            "work",
            "note",
            "add",
            "--id",
            "bead-par-repository",
            "--kind",
            "critique",
            "--body-file",
            note_body,
            "--idempotency-key",
            "op:work_note_add:par-cli",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_note_add",
        json!({
            "idempotencyKey": "op:work_note_add:par-mcp",
            "id": "bead-par-repository",
            "kind": "critique",
            "bodyJson": r#"{"z":1,"a":2}"#,
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "work_note_add parity");
    let cli = env
        .forged(&[
            "work",
            "note",
            "list",
            "--id",
            "bead-par-repository",
            "--kind",
            "critique",
            "--limit",
            "25",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_note_list",
        json!({
            "id": "bead-par-repository",
            "kind": "critique",
            "limit": 25,
        }),
    );
    assert_eq!(tool["operationId"], json!("op:work_note_list:read"));
    assert_eq!(normalized(cli), normalized(tool), "work_note_list parity");

    let cli = env
        .forged(&[
            "work",
            "update",
            "--id",
            "absent-priority-update",
            "--expected-revision",
            "1",
            "--priority",
            "2",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_update",
        json!({
            "id": "absent-priority-update",
            "expectedRevision": 1,
            "priority": 2,
        }),
    );
    assert_eq!(
        normalized(cli),
        normalized(tool),
        "priority work_update parity"
    );

    let cli = env
        .forged(&[
            "work",
            "promote",
            "--id",
            "absent-promote",
            "--expected-revision",
            "1",
            "--description",
            "planned",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_promote",
        json!({
            "id": "absent-promote",
            "expectedRevision": 1,
            "description": "planned",
        }),
    );
    assert_eq!(normalized(cli), normalized(tool), "work_promote parity");

    let cli = env
        .forged(&[
            "work",
            "ready",
            "--repo",
            &repository,
            "--full",
            "--limit",
            "25",
        ])
        .1;
    let tool = mcp.call_tool(
        "work_ready",
        json!({"repo": repository, "detail": "full", "limit": 25}),
    );
    assert_subject_parity(&cli, &tool, "work_ready subject parity");
    assert_eq!(tool["operationId"], json!("op:work_ready:read"));
    assert_eq!(normalized(cli), normalized(tool), "work_ready parity");

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
    let tool = mcp.call_tool("doctor", json!({}));
    assert_eq!(doctor_shape(&cli), doctor_shape(&tool), "doctor parity");
    assert_eq!(cli["operationId"], json!("op:doctor:read"));
    assert_eq!(tool["operationId"], json!("op:doctor:read"));
}

#[test]
fn worktree_retire_matches_over_cli_and_mcp() {
    const RUN: &str = "par-worktree-retire";
    const KEY: &str = "op:worktree_retire:parity";

    // Retire is stateful, so exercise each adapter against an identical,
    // isolated fixture rather than turning the second call into a replay.
    let cli_env = TestEnv::new("forged-worktree-retire-cli-parity");
    cli_env.forged(&["init"]);
    fabricate_run(&cli_env, RUN);
    let (code, cli_text) = cli_envelope_text(
        &cli_env,
        &["worktree", "retire", "--run", RUN, "--idempotency-key", KEY],
    );
    assert_eq!(code, 0, "CLI retire: {cli_text}");

    let mcp_env = TestEnv::new("forged-worktree-retire-mcp-parity");
    mcp_env.forged(&["init"]);
    fabricate_run(&mcp_env, RUN);
    let mut mcp = McpClient::new(&mcp_env, Some("all"));
    let missing_key = mcp.call_tool_result(
        "worktree_retire",
        envelope(json!({"run": RUN, "force": false, "runStateTerminal": false})),
    );
    assert_eq!(missing_key["isError"], json!(true));

    let raw = mcp.call_tool_result(
        "worktree_retire",
        json!({
            "schemaVersion": 1,
            "idempotencyKey": KEY,
            "runId": RUN,
            "params": {"run": RUN, "force": false, "runStateTerminal": false},
        }),
    );
    assert_eq!(raw["isError"], json!(false));
    let cli: Value = serde_json::from_str(&cli_text).expect("CLI retire envelope");
    let tool: Value = serde_json::from_str(
        raw["content"][0]["text"]
            .as_str()
            .expect("MCP retire envelope text"),
    )
    .expect("MCP retire envelope");
    assert_eq!(normalized(cli), normalized(tool));
}

/// Only MCP can independently supply envelope runId and params.run. A
/// disagreement must be rejected before gate projection, operation fencing,
/// or artifact creation, otherwise the recorded run and executed worktree
/// diverge.
#[test]
fn gate_run_rejects_conflicting_mcp_run_aliases_without_effects() {
    const TARGET: &str = "par-gate-target";
    const ENVELOPE: &str = "par-gate-envelope";
    const KEY: &str = "op:gate_run:conflicting-mcp-aliases";

    let env = TestEnv::new("forged-gate-run-conflicting-mcp-aliases");
    env.forged(&["init"]);
    start_run(&env, TARGET);
    prepare_run_worktree(&env, TARGET);
    fabricate_run(&env, ENVELOPE);
    let artifacts = env.anvil.join("runs").join(TARGET).join("artifacts");
    assert!(!artifacts.exists(), "fixture starts without gate artifacts");

    let mut mcp = McpClient::new(&env, Some("all"));
    let response = mcp.call_tool(
        "gate_run",
        json!({
            "schemaVersion": 1,
            "idempotencyKey": KEY,
            "runId": ENVELOPE,
            "params": {"run": TARGET, "stage": "gate"},
        }),
    );
    assert_eq!(response["ok"], json!(false), "{response}");
    assert_eq!(
        response["error"]["code"],
        json!("INVALID_REQUEST"),
        "{response}"
    );
    assert!(
        response["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("conflicts with params.run")),
        "the refusal names the conflicting aliases: {response}"
    );
    drop(mcp);

    let ledger = env.ledger();
    assert!(
        ledger
            .find_operation("gate_run", KEY)
            .expect("gate operation lookup")
            .is_none(),
        "the refusal creates no operation"
    );
    ledger.close().expect("close ledger");
    assert!(!artifacts.exists(), "the refusal creates no gate artifacts");
}

/// A forced retirement must never fence one run while deleting another run's
/// dirty worktree. Rejecting the two MCP aliases before the fence preserves
/// both the worktree and its uncommitted file without minting an operation.
#[test]
fn worktree_retire_rejects_conflicting_mcp_run_aliases_without_effects() {
    const TARGET: &str = "par-retire-target";
    const ENVELOPE: &str = "par-retire-envelope";
    const KEY: &str = "op:worktree_retire:conflicting-mcp-aliases";

    let env = TestEnv::new("forged-retire-conflicting-mcp-aliases");
    env.forged(&["init"]);
    start_run(&env, TARGET);
    prepare_run_worktree(&env, TARGET);
    fabricate_run(&env, ENVELOPE);
    let dirty = env.worktree(TARGET).join("uncommitted.txt");
    std::fs::write(&dirty, "must survive\n").expect("write dirty fixture");

    let mut mcp = McpClient::new(&env, Some("all"));
    let response = mcp.call_tool(
        "worktree_retire",
        json!({
            "schemaVersion": 1,
            "idempotencyKey": KEY,
            "runId": ENVELOPE,
            "params": {"run": TARGET, "force": true, "runStateTerminal": true},
        }),
    );
    assert_eq!(response["ok"], json!(false), "{response}");
    assert_eq!(
        response["error"]["code"],
        json!("INVALID_REQUEST"),
        "{response}"
    );
    assert!(
        response["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("conflicts with params.run")),
        "the refusal names the conflicting aliases: {response}"
    );
    drop(mcp);

    let ledger = env.ledger();
    assert!(
        ledger
            .find_operation("worktree_retire", KEY)
            .expect("retire operation lookup")
            .is_none(),
        "the refusal creates no operation"
    );
    ledger.close().expect("close ledger");
    assert!(dirty.exists(), "the dirty target worktree survives refusal");
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
    let mut mcp = McpClient::new(&env, Some("all"));

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
fn work_filters_refuse_present_non_string_values() {
    let env = TestEnv::new("forged-work-list-mcp-params");
    env.forged(&["init"]);
    fabricate_run(&env, "mcp-repository-widening-guard");
    let mut mcp = McpClient::new(&env, Some("all"));

    for field in ["repo", "status", "assignee"] {
        for value in [Value::Null, json!(7), json!({"value": "wrong"})] {
            let params = serde_json::Map::from_iter([(field.to_owned(), value.clone())]);
            let refusal = mcp.call_tool_error_result("work_list", Value::Object(params));
            let text = refusal
                .pointer("/content/0/text")
                .and_then(Value::as_str)
                .unwrap_or_default();
            assert!(
                text.contains("failed to deserialize parameters"),
                "present non-string {field} is refused before dispatch: {value}: {refusal}"
            );
            assert!(
                serde_json::from_str::<Value>(text).is_err(),
                "transport refusal is not an unfiltered operation envelope: {text}"
            );
        }
    }
}

#[test]
fn flat_and_enveloped_typed_tools_refuse_unknown_fields() {
    let env = TestEnv::new("forged-split-app-unknown-fields");
    env.forged(&["init"]);
    let mut mcp = McpClient::new(&env, Some("all"));

    for (tool, arguments) in [
        ("work_list", json!({"unexpected": true})),
        (
            "operations_overview",
            json!({"schemaVersion": 1, "unexpected": true, "params": {}}),
        ),
        (
            "operations_overview",
            json!({"schemaVersion": 1, "params": {"unexpected": true}}),
        ),
        ("attention_list", json!({"unexpected": true})),
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
    let mut mcp = McpClient::new(&env, Some("all"));

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
        json!({"schemaVersion": 1, "params": {"id": " "}}),
        json!({"schemaVersion": 1, "params": {"id": null}}),
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
        let refusal = mcp.call_tool_error_result("attention_list", params.clone());
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
