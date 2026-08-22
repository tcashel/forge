//! The MCP surface creates no operator state: durable state exists because
//! the operator used forged, never because a host handshook a server.
//! Mounting `forged mcp` on a bare HOME serves the whole protocol without a
//! ledger; tool calls refuse — creating nothing — until the operator
//! initializes, and the gate never latches in either direction.

mod support;

use std::path::PathBuf;
use std::process::Command;

use serde_json::{json, Value};

use support::{McpClient, TestEnv};

/// A bare operator HOME: the directory exists, `.anvil` does not. Stock
/// `TestEnv` pre-creates `.anvil` and a config file, so it cannot observe
/// the zero-imposition criterion.
struct BareHome {
    root: PathBuf,
    home: PathBuf,
}

fn bare_home(name: &str) -> BareHome {
    let root =
        PathBuf::from(env!("CARGO_TARGET_TMPDIR")).join(format!("{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    let home = root.join("home");
    std::fs::create_dir_all(&home).expect("creating bare home");
    BareHome { root, home }
}

impl BareHome {
    fn anvil(&self) -> PathBuf {
        self.home.join(".anvil")
    }

    /// A forged command whose only operator scope is the bare HOME.
    fn forged_cmd(&self, args: &[&str]) -> Command {
        let mut cmd = Command::new(env!("CARGO_BIN_EXE_forged"));
        cmd.args(args)
            .env("HOME", &self.home)
            .env_remove("ANVIL_HOME")
            .env_remove("FORGED_CONFIG")
            .env_remove("BEADS_DIR")
            .env_remove("HERDR_SOCK")
            .env_remove("FORGED_FAILPOINT")
            .env_remove("FORGED_FAILPOINT_MODE")
            .env_remove("FORGED_FAILPOINT_DIR")
            .current_dir(&self.root);
        cmd
    }
}

#[test]
fn a_bare_home_mount_serves_the_protocol_and_creates_nothing() {
    let bare = bare_home("forged-mcp-bare-mount");
    {
        let mut mcp = McpClient::from_command(bare.forged_cmd(&["mcp"]));
        let tools = mcp.list_tools();
        assert!(
            tools.iter().any(|name| name == "work_list"),
            "tools/list must answer without a ledger: {tools:?}"
        );
        let resources = mcp.list_resources();
        assert!(
            resources
                .iter()
                .any(|uri| uri == "ui://forged/overview.html"),
            "resources/list must answer without a ledger: {resources:?}"
        );
    }
    assert!(
        !bare.anvil().exists(),
        "a session mount must leave no ~/.anvil behind"
    );
}

#[test]
fn uninitialized_tool_calls_refuse_with_setup_guidance_and_create_nothing() {
    let bare = bare_home("forged-mcp-bare-refusal");
    let mut mcp = McpClient::from_command(bare.forged_cmd(&["mcp"]));
    // A read tool, a mutating tool, and doctor: every dispatch seam sits
    // behind the same gate.
    for tool in ["work_list", "run_start", "doctor"] {
        let response = mcp.call_tool(tool, json!({}));
        assert_eq!(response["ok"], json!(false), "{tool}: {response}");
        assert_eq!(
            response["error"]["code"],
            json!("INVALID_REQUEST"),
            "{tool}: {response}"
        );
        let message = response["error"]["message"].as_str().unwrap_or_default();
        assert!(
            message.contains("forged init") && message.contains("/forged:setup"),
            "{tool} refusal must carry both setup pointers: {message:?}"
        );
    }
    assert!(
        !bare.anvil().exists(),
        "uninitialized refusals must create nothing"
    );
}

#[test]
fn mid_session_initialization_unlatches_the_gate() {
    let bare = bare_home("forged-mcp-mid-session-init");
    let mut mcp = McpClient::from_command(bare.forged_cmd(&["mcp"]));
    let refused = mcp.call_tool("work_list", json!({}));
    assert_eq!(refused["ok"], json!(false), "{refused}");

    // The operator initializes while the mount is still up: the next call
    // on the SAME session opens normally — "uninitialized" is a fresh
    // predicate per call, never a latched answer.
    let init = bare
        .forged_cmd(&["init"])
        .output()
        .expect("forged init runs");
    assert!(
        init.status.success(),
        "forged init failed: {}",
        String::from_utf8_lossy(&init.stderr)
    );
    let opened = mcp.call_tool("work_list", json!({}));
    assert_eq!(opened["ok"], json!(true), "{opened}");
}

/// The one sampled stamp `work_list` carries on an empty scope.
fn normalized(mut envelope: Value) -> Value {
    assert!(
        envelope["result"]["queue"]["asOf"].is_string(),
        "work_list must stamp queue.asOf: {envelope}"
    );
    envelope["result"]["queue"]["asOf"] = json!("<sampled>");
    envelope
}

#[test]
fn an_initialized_scope_first_call_matches_the_eager_open_response() {
    let env = TestEnv::new("forged-mcp-lazy-golden");
    assert_eq!(env.forged(&["init"]).0, 0);
    let (code, eager) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "{eager}");

    // Strip the migration markers init wrote, so the FIRST lazy call must
    // rerun migration before its dispatch observes the ledger.
    let db = env.anvil.join("state.db");
    let markers = |conn: &rusqlite::Connection| -> i64 {
        conn.query_row("SELECT COUNT(*) FROM runtime_migrations", [], |row| {
            row.get(0)
        })
        .expect("count runtime migrations")
    };
    {
        let conn = rusqlite::Connection::open(&db).expect("open state.db");
        conn.execute("DELETE FROM runtime_migrations", [])
            .expect("clear migration markers");
        assert_eq!(markers(&conn), 0);
    }

    let mut mcp = McpClient::new(&env);
    let lazy = mcp.call_tool("work_list", json!({}));
    assert_eq!(
        normalized(lazy),
        normalized(eager),
        "the lazy first call must match the eager-open response"
    );
    let conn = rusqlite::Connection::open(&db).expect("reopen state.db");
    assert!(
        markers(&conn) > 0,
        "migration must complete inside the first state-needing call"
    );
}
