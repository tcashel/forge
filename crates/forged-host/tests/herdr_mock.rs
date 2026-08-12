//! HerdrHost tests against a mock protocol-19 Unix-socket server. No real
//! herdr server and no `claude` binary required.

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use forged_host::{Confirmed, HerdrControl, HerdrHost, HostError, Liveness, SessionHost};
use serde_json::{json, Value};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::UnixListener;

/// What the mock does in response to one incoming request.
enum Action {
    /// Emit a broadcast frame BEFORE anything else queued after it.
    Emit(Value),
    /// Answer the request with a result.
    Respond(Value),
    /// Answer the request with an error object.
    RespondErr {
        code: &'static str,
        message: &'static str,
    },
    /// Drop the connection, leaving the request outstanding.
    Hangup,
}

struct Mock {
    socket_path: PathBuf,
    requests: Arc<Mutex<Vec<(String, Value)>>>,
    _tmp: tempfile::TempDir,
}

impl Mock {
    /// Start a one-connection NDJSON mock. `handler` is called per request
    /// with (method, params, per-method call count starting at 1).
    fn start<F>(mut handler: F) -> Mock
    where
        F: FnMut(&str, &Value, usize) -> Vec<Action> + Send + 'static,
    {
        let tmp = tempfile::tempdir().expect("tempdir");
        let socket_path = tmp.path().join("herdr.sock");
        let listener = UnixListener::bind(&socket_path).expect("bind mock socket");
        let requests: Arc<Mutex<Vec<(String, Value)>>> = Arc::new(Mutex::new(Vec::new()));
        let recorded = Arc::clone(&requests);
        tokio::spawn(async move {
            let Ok((stream, _)) = listener.accept().await else {
                return;
            };
            let (read_half, mut write_half) = stream.into_split();
            let mut lines = BufReader::new(read_half).lines();
            let mut counts: HashMap<String, usize> = HashMap::new();
            while let Ok(Some(line)) = lines.next_line().await {
                let Ok(frame) = serde_json::from_str::<Value>(&line) else {
                    continue;
                };
                let id = frame["id"].as_str().unwrap_or_default().to_string();
                let method = frame["method"].as_str().unwrap_or_default().to_string();
                let params = frame["params"].clone();
                recorded
                    .lock()
                    .expect("requests lock")
                    .push((method.clone(), params.clone()));
                let count = counts
                    .entry(method.clone())
                    .and_modify(|n| *n += 1)
                    .or_insert(1);
                for action in handler(&method, &params, *count) {
                    let frame = match action {
                        Action::Emit(frame) => frame,
                        Action::Respond(result) => json!({"id": id, "result": result}),
                        Action::RespondErr { code, message } => {
                            json!({"id": id, "error": {"code": code, "message": message}})
                        }
                        Action::Hangup => return,
                    };
                    let mut bytes = frame.to_string().into_bytes();
                    bytes.push(b'\n');
                    if write_half.write_all(&bytes).await.is_err() {
                        return;
                    }
                }
            }
        });
        Mock {
            socket_path,
            requests,
            _tmp: tmp,
        }
    }

    fn methods(&self) -> Vec<String> {
        self.requests
            .lock()
            .expect("requests lock")
            .iter()
            .map(|(method, _)| method.clone())
            .collect()
    }

    fn params_of(&self, method: &str) -> Value {
        self.requests
            .lock()
            .expect("requests lock")
            .iter()
            .find(|(m, _)| m == method)
            .map(|(_, params)| params.clone())
            .unwrap_or(Value::Null)
    }
}

fn pong(protocol: u32) -> Value {
    json!({"type": "pong", "version": "0.8.0", "protocol": protocol, "capabilities": {}})
}

fn pane_info(pane_id: &str) -> Value {
    json!({"type": "pane_info", "pane": {
        "pane_id": pane_id, "workspace_id": "ws-1", "tab_id": "tab-1",
        "terminal_id": "term-1", "focused": false, "agent_status": "idle",
        "revision": 1,
    }})
}

/// A live pane with a ready shell and a DRAINED foreground.
fn shell_ready(pane_id: &str) -> Value {
    json!({
        "pane_id": pane_id, "shell_pid": 4242,
        "foreground_process_group_id": 4242,
        "foreground_processes": [], "tty": "/dev/ttys001",
    })
}

fn pane_created(pane_id: &str) -> Value {
    json!({"event": "pane_created", "data": {"pane_id": pane_id, "workspace_id": "ws-1"}})
}

#[tokio::test]
async fn controller_reads_and_messages_a_durable_pane_id() {
    let mock = Mock::start(|method, _params, _n| match method {
        "ping" => vec![Action::Respond(pong(19))],
        "pane.read" => vec![Action::Respond(json!({
            "type": "pane_read",
            "read": {
                "pane_id": "w1:p7",
                "workspace_id": "w1",
                "tab_id": "t1",
                "source": "recent_unwrapped",
                "format": "text",
                "text": "working on the gate",
                "revision": 42,
                "truncated": false
            }
        }))],
        "pane.send_input" => vec![Action::Respond(json!({"type": "ok"}))],
        other => panic!("unexpected request {other}"),
    });
    let control = HerdrControl::connect(&mock.socket_path)
        .await
        .expect("control connection");
    let snapshot = control.read_pane("w1:p7", 120).await.expect("read");
    assert_eq!(snapshot.pane_id, "w1:p7");
    assert_eq!(snapshot.text, "working on the gate");
    assert_eq!(snapshot.revision, 42);
    control
        .send_message("w1:p7", "Please checkpoint before changing the API")
        .await
        .expect("message");
    assert_eq!(
        mock.params_of("pane.read"),
        json!({
            "pane_id": "w1:p7",
            "source": "recent_unwrapped",
            "lines": 120,
            "format": "text",
            "strip_ansi": true
        })
    );
    assert_eq!(
        mock.params_of("pane.send_input"),
        json!({
            "pane_id": "w1:p7",
            "text": "Please checkpoint before changing the API",
            "keys": ["Enter"]
        })
    );
}

const PANE_NOT_FOUND: Action = Action::RespondErr {
    code: "PANE_NOT_FOUND",
    message: "pane not found",
};

/// The standard spawn-side script: connect handshake, split (optionally with
/// the pane_created event delivered BEFORE the split response), readiness
/// probe, and send_input. Returns None for methods the scenario must script.
fn spawn_script(method: &str, count: usize, emit_created: bool) -> Option<Vec<Action>> {
    match (method, count) {
        ("ping", 1) => Some(vec![Action::Respond(pong(19))]),
        ("events.subscribe", 1) => Some(vec![Action::Respond(json!({"type": "ok"}))]),
        ("pane.split", 1) => {
            let mut actions = Vec::new();
            if emit_created {
                actions.push(Action::Emit(pane_created("p1")));
            }
            actions.push(Action::Respond(pane_info("p1")));
            Some(actions)
        }
        ("pane.process_info", 1) => Some(vec![Action::Respond(shell_ready("p1"))]),
        ("pane.send_input", 1) => Some(vec![Action::Respond(json!({"type": "ok"}))]),
        _ => None,
    }
}

async fn connect_and_spawn(
    mock: &Mock,
    base: &std::path::Path,
    cwd: &std::path::Path,
) -> (HerdrHost, forged_host::HostSessionId) {
    let host = HerdrHost::connect(&mock.socket_path, base)
        .await
        .expect("connect");
    let mut env = HashMap::new();
    env.insert("FOO".to_string(), "bar".to_string());
    let id = host.spawn(cwd, "sleep 5", &env).await.expect("spawn");
    (host, id)
}

// ---------------------------------------------------------------------------
// Criterion 5: protocol-pin refusal.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn connect_refuses_protocol_18_and_issues_no_further_requests() {
    let mock = Mock::start(|method, _params, _n| match method {
        "ping" => vec![Action::Respond(pong(18))],
        other => panic!("unexpected request after protocol mismatch: {other}"),
    });
    let base = tempfile::tempdir().expect("tempdir");
    let err = match HerdrHost::connect(&mock.socket_path, base.path()).await {
        Ok(_) => panic!("protocol 18 must be refused"),
        Err(err) => err,
    };
    match err {
        HostError::ProtocolMismatch { expected, got } => {
            assert_eq!(expected, 19);
            assert_eq!(got, 18);
        }
        other => panic!("expected ProtocolMismatch, got {other:?}"),
    }
    // Give any stray traffic time to arrive, then confirm ping was the only
    // request ever issued.
    tokio::time::sleep(Duration::from_millis(200)).await;
    assert_eq!(mock.methods(), vec!["ping".to_string()]);
}

// ---------------------------------------------------------------------------
// Criterion 8a: mock-socket happy path.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn happy_path_over_the_mock_socket() {
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, true) {
            return actions;
        }
        match (method, n) {
            // kill_confirmed's entry probe sees the pane still live.
            ("pane.process_info", 2) => vec![Action::Respond(shell_ready("p1"))],
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            // The post-kill liveness probe: hang up with it outstanding.
            ("pane.process_info", 3) => vec![Action::Hangup],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;

    // Session id comes from the split response; hint is the pane locator.
    assert_eq!(id.as_str(), "p1");
    assert_eq!(host.attach_hint(&id), Some("herdr:pane:p1".to_string()));

    // Exact outgoing method names, in order, with their required params.
    assert_eq!(
        mock.methods(),
        vec![
            "ping",
            "events.subscribe",
            "pane.split",
            "pane.process_info",
            "pane.send_input",
        ]
    );
    let subscribe = mock.params_of("events.subscribe");
    assert_eq!(
        subscribe["subscriptions"],
        json!([
            {"type": "pane.created"},
            {"type": "pane.exited"},
            {"type": "pane.closed"},
        ])
    );
    let split = mock.params_of("pane.split");
    assert_eq!(split["direction"], "right");
    assert_eq!(split["cwd"], cwd.path().to_str().expect("utf-8 cwd"));
    assert_eq!(split["env"], json!({"FOO": "bar"}));
    assert_eq!(split["focus"], json!(false));
    let send_input = mock.params_of("pane.send_input");
    assert_eq!(send_input["pane_id"], "p1");
    let status_path = base.path().join("p1").join("status");
    assert_eq!(
        send_input["text"],
        format!("sleep 5; echo $? > {}", status_path.display())
    );
    assert_eq!(send_input["keys"], json!(["Enter"]));

    // The sentinel is the only exit-code truth.
    std::fs::write(&status_path, "7").expect("write sentinel");
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Exited(7));

    // Sentinel present on entry: kill closes the pane, reports AlreadyDead.
    assert_eq!(
        host.kill_confirmed(&id).await.expect("kill"),
        Confirmed::AlreadyDead
    );
    assert!(mock.methods().contains(&"pane.close".to_string()));

    // Dropping the mock connection fails the outstanding request with
    // Unavailable, and the host stays permanently unavailable.
    std::fs::remove_file(&status_path).expect("remove sentinel");
    let err = host.alive(&id).await.expect_err("connection dropped");
    assert!(matches!(err, HostError::Unavailable { .. }));
    let err = host.alive(&id).await.expect_err("still unavailable");
    assert!(matches!(err, HostError::Unavailable { .. }));
}

// ---------------------------------------------------------------------------
// Criterion 8b: the kill_confirmed matrix.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn kill_live_pane_with_empty_foreground_verifies_closure() {
    // Live pane, empty foreground, no sentinel; the post-close probe
    // answers pane-not-found → Killed.
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.process_info", 2) => vec![Action::Respond(shell_ready("p1"))],
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            ("pane.process_info", _) => vec![PANE_NOT_FOUND],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    assert_eq!(
        host.kill_confirmed(&id).await.expect("kill"),
        Confirmed::Killed
    );
}

#[tokio::test]
async fn kill_with_sentinel_on_entry_is_already_dead() {
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            // The entry probe still runs even with the sentinel present.
            ("pane.process_info", 2) => vec![Action::Respond(shell_ready("p1"))],
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    std::fs::write(base.path().join("p1").join("status"), "0\n").expect("write sentinel");
    assert_eq!(
        host.kill_confirmed(&id).await.expect("kill"),
        Confirmed::AlreadyDead
    );
    // The still-open pane really was closed on the way out.
    assert!(mock.methods().contains(&"pane.close".to_string()));
}

#[tokio::test]
async fn kill_with_sentinel_propagates_a_failed_close() {
    // Sentinel present but the pane is live and pane.close is REFUSED with
    // a non-pane-not-found error: the failure must propagate rather than
    // hide behind AlreadyDead with the pane left open.
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.process_info", 2) => vec![Action::Respond(shell_ready("p1"))],
            ("pane.close", 1) => vec![Action::RespondErr {
                code: "INTERNAL",
                message: "close refused",
            }],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    std::fs::write(base.path().join("p1").join("status"), "0\n").expect("write sentinel");
    let err = host
        .kill_confirmed(&id)
        .await
        .expect_err("a refused close must propagate");
    assert!(matches!(err, HostError::Unavailable { .. }));
}

#[tokio::test]
async fn kill_of_a_pane_already_missing_before_close_is_already_dead() {
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.process_info", 2) => vec![PANE_NOT_FOUND],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    assert_eq!(
        host.kill_confirmed(&id).await.expect("kill"),
        Confirmed::AlreadyDead
    );
    // pane.close was never attempted: the pane was verified missing first.
    assert!(!mock.methods().contains(&"pane.close".to_string()));
}

#[tokio::test]
async fn bare_close_acknowledgement_is_never_confirmation() {
    // The pane keeps resolving normally for the whole 5 s budget after an
    // acknowledged pane.close → KillVerifyTimeout.
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            // Every probe, before and after close, sees a live pane.
            ("pane.process_info", _) => vec![Action::Respond(shell_ready("p1"))],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    let err = host.kill_confirmed(&id).await.expect_err("must time out");
    assert!(matches!(err, HostError::KillVerifyTimeout));
}
