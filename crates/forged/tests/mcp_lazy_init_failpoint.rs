#![cfg(feature = "failpoints")]

//! Failpoint-only MCP lazy-initialization coverage.

mod support;

use serde_json::json;
use support::{McpClient, TestEnv};

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
