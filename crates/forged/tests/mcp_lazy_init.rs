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

/// The deletion race the precheck alone cannot close: the ledger passes the
/// existence check, vanishes before the open, and the gate's no-create open
/// must refuse — never mint a blank state.db. Deterministic via the
/// `mcp.ledger.open.before` failpoint, which pauses the opening call inside
/// exactly that window.
#[cfg(feature = "failpoints")]
#[test]
fn a_ledger_deleted_between_check_and_open_refuses_and_creates_nothing() {
    use std::time::{Duration, Instant};

    let wait_for = |marker: &std::path::Path, what: &str| {
        let deadline = Instant::now() + Duration::from_secs(30);
        while !marker.exists() {
            assert!(Instant::now() < deadline, "{what} never reached");
            std::thread::sleep(Duration::from_millis(20));
        }
    };

    let env = TestEnv::new("forged-mcp-open-race");
    assert_eq!(env.forged(&["init"]).0, 0);
    let db = env.anvil.join("state.db");
    assert!(db.exists(), "init must create the ledger");

    let fp_dir = env.root.join("failpoints");
    std::fs::create_dir_all(&fp_dir).expect("failpoint dir");
    let reached = fp_dir.join("mcp.ledger.open.before.reached");
    let release = fp_dir.join("mcp.ledger.open.before.release");
    let mut cmd = env.forged_cmd(&["mcp"]);
    cmd.env("FORGED_FAILPOINT", "mcp.ledger.open.before")
        .env("FORGED_FAILPOINT_MODE", "pause")
        .env("FORGED_FAILPOINT_DIR", &fp_dir);
    let mut mcp = McpClient::from_command(cmd);

    let paused_call = std::thread::spawn(move || {
        let response = mcp.call_tool("work_list", json!({}));
        (mcp, response)
    });
    wait_for(&reached, "the open failpoint");
    // The precheck has already passed; now the operator state vanishes.
    for suffix in ["", "-wal", "-shm"] {
        let _ = std::fs::remove_file(env.anvil.join(format!("state.db{suffix}")));
    }
    std::fs::write(&release, b"").expect("release the paused open");

    let (mut mcp, raced) = paused_call.join().expect("tool-call thread");
    assert_eq!(raced["ok"], json!(false), "{raced}");
    assert_eq!(raced["error"]["code"], json!("INVALID_REQUEST"), "{raced}");
    let message = raced["error"]["message"].as_str().unwrap_or_default();
    assert!(
        message.contains("forged init") && message.contains("/forged:setup"),
        "the raced refusal must carry both setup pointers: {message:?}"
    );
    assert!(
        !db.exists(),
        "the losing open must not re-create a blank ledger"
    );

    // The refusal did not latch: re-initialize and the SAME mount opens on
    // its next call (paused and released at the same site once more).
    assert_eq!(env.forged(&["init"]).0, 0);
    let retried_call = std::thread::spawn(move || mcp.call_tool("work_list", json!({})));
    wait_for(&reached, "the retrying open failpoint");
    std::fs::write(&release, b"").expect("release the retrying open");
    let retried = retried_call.join().expect("retry thread");
    assert_eq!(retried["ok"], json!(true), "{retried}");
}
