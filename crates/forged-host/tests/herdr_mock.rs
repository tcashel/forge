//! HerdrHost tests against a mock protocol-19 Unix-socket server. No real
//! herdr server and no `claude` binary required.

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use forged_host::{Confirmed, HerdrControl, HerdrHost, HostError, Liveness, SessionHost};
use serde_json::{json, Value};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::UnixListener;

const TEST_PANE_ID: &str = "w1:p7";

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
    /// Hold the connection open and never answer: the unresponsive server an
    /// awaited RPC spends its whole timeout on.
    Stall,
}

/// Long enough that any wait on an answer would be unmistakable in a test.
const STALL: Duration = Duration::from_secs(30);

struct Mock {
    socket_path: PathBuf,
    requests: Arc<Mutex<Vec<(String, Value)>>>,
    connections: Arc<AtomicUsize>,
    _tmp: tempfile::TempDir,
}

impl Mock {
    /// Start an NDJSON mock with Herdr's real connection contract: ordinary
    /// RPC connections close after one response, while `events.subscribe`
    /// stays open. `handler` is called with the global per-method call count.
    fn start<F>(handler: F) -> Mock
    where
        F: FnMut(&str, &Value, usize) -> Vec<Action> + Send + 'static,
    {
        let tmp = tempfile::tempdir().expect("tempdir");
        let socket_path = tmp.path().join("herdr.sock");
        let listener = UnixListener::bind(&socket_path).expect("bind mock socket");
        let requests: Arc<Mutex<Vec<(String, Value)>>> = Arc::new(Mutex::new(Vec::new()));
        let recorded = Arc::clone(&requests);
        let connections = Arc::new(AtomicUsize::new(0));
        let accepted = Arc::clone(&connections);
        let counts: Arc<Mutex<HashMap<String, usize>>> = Arc::new(Mutex::new(HashMap::new()));
        let handler = Arc::new(Mutex::new(handler));
        tokio::spawn(async move {
            while let Ok((stream, _)) = listener.accept().await {
                accepted.fetch_add(1, Ordering::SeqCst);
                let recorded = Arc::clone(&recorded);
                let counts = Arc::clone(&counts);
                let handler = Arc::clone(&handler);
                tokio::spawn(async move {
                    let (read_half, mut write_half) = stream.into_split();
                    let mut lines = BufReader::new(read_half).lines();
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
                        let count = {
                            let mut counts = counts.lock().expect("counts lock");
                            let count = counts.entry(method.clone()).or_insert(0);
                            *count += 1;
                            *count
                        };
                        let actions =
                            handler.lock().expect("handler lock")(&method, &params, count);
                        for action in actions {
                            let frame = match action {
                                Action::Emit(frame) => frame,
                                Action::Respond(result) => json!({"id": id, "result": result}),
                                Action::RespondErr { code, message } => {
                                    json!({"id": id, "error": {"code": code, "message": message}})
                                }
                                Action::Hangup => return,
                                Action::Stall => {
                                    tokio::time::sleep(STALL).await;
                                    return;
                                }
                            };
                            let mut bytes = frame.to_string().into_bytes();
                            bytes.push(b'\n');
                            if write_half.write_all(&bytes).await.is_err() {
                                return;
                            }
                        }
                        if method != "events.subscribe" {
                            return;
                        }
                    }
                });
            }
        });
        Mock {
            socket_path,
            requests,
            connections,
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

    fn connection_count(&self) -> usize {
        self.connections.load(Ordering::SeqCst)
    }

    fn count_of(&self, method: &str) -> usize {
        self.methods().iter().filter(|m| *m == method).count()
    }

    /// Wait until `method` has been received `count` times. A dispatched
    /// request is deliberately not awaited by the host, so the mock's record
    /// of it lands asynchronously — asserting on it without waiting would be
    /// a race, not a stricter test.
    async fn wait_for(&self, method: &str, count: usize) {
        let deadline = std::time::Instant::now() + Duration::from_secs(5);
        while self.count_of(method) < count {
            assert!(
                std::time::Instant::now() < deadline,
                "timed out waiting for {count} {method} call(s); saw {:?}",
                self.methods()
            );
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
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
        "type": "pane_process_info",
        "process_info": {
            "pane_id": pane_id, "shell_pid": 4242,
            "foreground_process_group_id": 4242,
            "foreground_processes": [], "tty": "/dev/ttys001",
        }
    })
}

fn pane_created(pane_id: &str) -> Value {
    json!({
        "event": "pane_created",
        "data": {
            "type": "pane_created",
            "pane": {"pane_id": pane_id, "workspace_id": "ws-1"},
        }
    })
}

fn only_status_path(base: &std::path::Path) -> PathBuf {
    let mut entries = std::fs::read_dir(base).expect("read status base");
    let session_dir = entries
        .next()
        .expect("one status directory")
        .expect("status directory entry")
        .path();
    assert!(entries.next().is_none(), "only one status directory");
    session_dir.join("status")
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
        mock.connection_count(),
        3,
        "ping, read, and send are one-shot"
    );
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
                actions.push(Action::Emit(pane_created(TEST_PANE_ID)));
            }
            actions.push(Action::Respond(pane_info(TEST_PANE_ID)));
            Some(actions)
        }
        ("pane.process_info", 1) => Some(vec![Action::Respond(shell_ready(TEST_PANE_ID))]),
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
            ("pane.process_info", 2) => vec![Action::Respond(shell_ready(TEST_PANE_ID))],
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            // The post-kill liveness probe: hang up with it outstanding.
            ("pane.process_info", 3) => vec![Action::Hangup],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;

    assert_eq!(
        mock.connection_count(),
        5,
        "ping, subscription, split, readiness, and send use distinct sockets"
    );

    // Session id comes from the split response; hint is the pane locator.
    assert_eq!(id.as_str(), TEST_PANE_ID);
    assert_eq!(
        host.attach_hint(&id),
        Some(format!("herdr:pane:{TEST_PANE_ID}"))
    );

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
    assert_eq!(send_input["pane_id"], TEST_PANE_ID);
    let status_path = only_status_path(base.path());
    assert!(
        !status_path.to_string_lossy().contains(':'),
        "opaque pane ids must be encoded in status paths"
    );
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

    // Dropping each fresh request fails that request with Unavailable; a
    // later request still gets an independent connection and result.
    std::fs::remove_file(&status_path).expect("remove sentinel");
    let err = host.alive(&id).await.expect_err("connection dropped");
    assert!(matches!(err, HostError::Unavailable { .. }));
    let err = host
        .alive(&id)
        .await
        .expect_err("second request also dropped");
    assert!(matches!(err, HostError::Unavailable { .. }));
}

#[tokio::test]
async fn subscription_eof_does_not_poison_rpc_calls() {
    let mock = Mock::start(|method, _params, n| {
        if method == "events.subscribe" {
            return vec![Action::Respond(json!({"type": "ok"})), Action::Hangup];
        }
        spawn_script(method, n, true).unwrap_or_else(|| panic!("unexpected request {method:?}"))
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let host = HerdrHost::connect(&mock.socket_path, base.path())
        .await
        .expect("connect");

    // Let the subscription reader observe EOF before proving ordinary calls
    // remain independent of that best-effort event channel.
    tokio::time::sleep(Duration::from_millis(50)).await;
    let mut env = HashMap::new();
    env.insert("FOO".to_string(), "bar".to_string());
    let id = host
        .spawn(cwd.path(), "sleep 5", &env)
        .await
        .expect("spawn after subscription EOF");
    assert_eq!(id.as_str(), TEST_PANE_ID);
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
            ("pane.process_info", 2) => vec![Action::Respond(shell_ready(TEST_PANE_ID))],
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
            ("pane.process_info", 2) => vec![Action::Respond(shell_ready(TEST_PANE_ID))],
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    std::fs::write(only_status_path(base.path()), "0\n").expect("write sentinel");
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
            ("pane.process_info", 2) => vec![Action::Respond(shell_ready(TEST_PANE_ID))],
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
    std::fs::write(only_status_path(base.path()), "0\n").expect("write sentinel");
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
            ("pane.process_info", _) => vec![Action::Respond(shell_ready(TEST_PANE_ID))],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    let err = host.kill_confirmed(&id).await.expect_err("must time out");
    assert!(matches!(err, HostError::KillVerifyTimeout));
}

// ---------------------------------------------------------------------------
// Release: a settled seat gives its pane back, and cannot fail doing so.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn release_closes_the_spawned_pane_and_keeps_answering_for_it() {
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    // The line finished on its own: the sentinel is the settle signal.
    std::fs::write(only_status_path(base.path()), "0\n").expect("write sentinel");
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Exited(0));

    host.release(&id).await;
    mock.wait_for("pane.close", 1).await;

    // Exactly one close, aimed at the pane this host spawned, with no probe
    // or verification traffic around it.
    assert_eq!(
        mock.methods(),
        vec![
            "ping",
            "events.subscribe",
            "pane.split",
            "pane.process_info",
            "pane.send_input",
            "pane.close",
        ]
    );
    assert_eq!(
        mock.params_of("pane.close"),
        json!({"pane_id": TEST_PANE_ID})
    );
    // The terminal is given up, so there is nothing left to attach to — but
    // the session itself is NOT forgotten: it still answers from the
    // sentinel, with no further traffic.
    assert_eq!(host.attach_hint(&id), None);
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Exited(0));
    assert_eq!(mock.count_of("pane.close"), 1);
}

#[tokio::test]
async fn a_released_session_still_answers_liveness_and_kill() {
    // The wedge this rules out: a release that forgot the session would make
    // every later `alive`/`kill_confirmed` answer `SessionNotFound`, which
    // the reconcile port surfaces as an unavailable host and which aborts
    // the whole pass. An attempt settles and its ROW settles at different
    // moments — a pass reaching a released session after a refused settle
    // must still be able to reclaim the packet.
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            // The pane is gone once the close lands; ids are never reused.
            ("pane.process_info", _) => vec![PANE_NOT_FOUND],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    std::fs::write(only_status_path(base.path()), "0\n").expect("write sentinel");

    host.release(&id).await;
    mock.wait_for("pane.close", 1).await;

    // The sentinel is still this session's exit truth...
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Exited(0));
    // ...and a kill aimed at it reports verified prior death rather than
    // failing the caller with an unknown session.
    assert_eq!(
        host.kill_confirmed(&id).await.expect("kill"),
        Confirmed::AlreadyDead
    );
    // Prior death was already verified, so no second close was issued.
    assert_eq!(mock.count_of("pane.close"), 1);
}

#[tokio::test]
async fn a_released_session_with_no_sentinel_reports_vanished_not_unknown() {
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.close", 1) => vec![Action::Respond(json!({"type": "ok"}))],
            ("pane.process_info", _) => vec![PANE_NOT_FOUND],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;

    host.release(&id).await;
    mock.wait_for("pane.close", 1).await;

    // No status file was ever written: the honest answer is Vanished, and no
    // exit code is invented — the same answer any un-released session with a
    // dead pane gets.
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Vanished);
}

#[tokio::test]
async fn release_never_waits_for_herdr_to_answer() {
    // The settlement contract: releasing fires the close and returns. A
    // herdr that accepts the request and never answers would cost an awaited
    // RPC its full five-second timeout; it must cost a release nothing, and
    // must leave the settled session's answers untouched.
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.close", _) => vec![Action::Stall],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    std::fs::write(only_status_path(base.path()), "0\n").expect("write sentinel");

    let started = std::time::Instant::now();
    host.release(&id).await;
    let elapsed = started.elapsed();

    // Well inside the RPC timeout an awaited close would have burned.
    assert!(
        elapsed < Duration::from_secs(2),
        "release waited {elapsed:?} on an unresponsive herdr"
    );
    // The close really was dispatched, not skipped.
    mock.wait_for("pane.close", 1).await;
    // And the settled session is exactly as it was: same exit code, same
    // (absent) attach hint, no error anywhere.
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Exited(0));
    assert_eq!(host.attach_hint(&id), None);
}

#[tokio::test]
async fn repeated_releases_are_silent_whatever_herdr_answers() {
    // First release: herdr refuses the close outright. Second: it answers
    // pane-not-found, which is proof the goal state already holds. Third: it
    // drops the connection. None of it is ever read — `release` returns `()`
    // by construction — and none of it may disturb the settled session.
    let mock = Mock::start(|method, _params, n| {
        if let Some(actions) = spawn_script(method, n, false) {
            return actions;
        }
        match (method, n) {
            ("pane.close", 1) => vec![Action::RespondErr {
                code: "INTERNAL",
                message: "close refused",
            }],
            ("pane.close", 2) => vec![PANE_NOT_FOUND],
            ("pane.close", _) => vec![Action::Hangup],
            other => panic!("unexpected request {other:?}"),
        }
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let (host, id) = connect_and_spawn(&mock, base.path(), cwd.path()).await;
    std::fs::write(only_status_path(base.path()), "0\n").expect("write sentinel");

    host.release(&id).await;
    host.release(&id).await;
    host.release(&id).await;
    mock.wait_for("pane.close", 3).await;

    assert_eq!(mock.count_of("pane.close"), 3);
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Exited(0));
}

// ---------------------------------------------------------------------------
// Placement: seats land in a forged-owned workspace, never the focused one.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn a_host_with_a_workspace_reuses_a_matching_label_and_targets_the_split() {
    let mock = Mock::start(|method, _params, n| match (method, n) {
        // The operator's own `forge` workspace is present and must be
        // ignored; only the `forged-` prefixed one is ever targeted.
        ("workspace.list", 1) => vec![Action::Respond(json!({
            "type": "workspace_list",
            "workspaces": [
                {"workspace_id": "w6", "label": "drover"},
                {"workspace_id": "w7", "label": "forge"},
                {"workspace_id": "w9", "label": "forged-forge"},
            ],
        }))],
        (m, c) => spawn_script(m, c, true).unwrap_or_default(),
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("cwd");
    let host = HerdrHost::connect(&mock.socket_path, base.path())
        .await
        .expect("connect")
        .with_workspace("forged-forge");
    host.spawn(cwd.path(), "sleep 5", &HashMap::new())
        .await
        .expect("spawn");

    let split = mock.params_of("pane.split");
    assert_eq!(
        split["workspace_id"], "w9",
        "the split must target the forged-owned workspace"
    );
    assert!(
        !mock.methods().iter().any(|m| m == "workspace.create"),
        "a matching label must be reused, never duplicated: {:?}",
        mock.methods()
    );
}

#[tokio::test]
async fn a_host_with_a_workspace_creates_it_unfocused_when_absent() {
    let mock = Mock::start(|method, _params, n| match (method, n) {
        ("workspace.list", 1) => vec![Action::Respond(json!({
            "type": "workspace_list",
            "workspaces": [{"workspace_id": "w7", "label": "forge"}],
        }))],
        ("workspace.create", 1) => vec![Action::Respond(json!({
            "workspace": {"workspace_id": "w9", "label": "forged-forge"},
        }))],
        (m, c) => spawn_script(m, c, true).unwrap_or_default(),
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("cwd");
    let host = HerdrHost::connect(&mock.socket_path, base.path())
        .await
        .expect("connect")
        .with_workspace("forged-forge");
    host.spawn(cwd.path(), "sleep 5", &HashMap::new())
        .await
        .expect("spawn");

    let created = mock.params_of("workspace.create");
    assert_eq!(created["label"], "forged-forge");
    assert_eq!(
        created["focus"],
        json!(false),
        "creating a workspace must never move the operator's focus"
    );
    assert_eq!(mock.params_of("pane.split")["workspace_id"], "w9");
}

#[tokio::test]
async fn placement_failure_degrades_to_an_untargeted_split() {
    // A seat that cannot start is worse than a pane in the wrong place, so
    // an unusable workspace surface must not fail the spawn.
    let mock = Mock::start(|method, _params, n| match (method, n) {
        ("workspace.list", 1) => vec![Action::RespondErr {
            code: "INTERNAL",
            message: "workspace surface unavailable",
        }],
        ("workspace.create", 1) => vec![Action::RespondErr {
            code: "INTERNAL",
            message: "workspace surface unavailable",
        }],
        (m, c) => spawn_script(m, c, true).unwrap_or_default(),
    });
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("cwd");
    let host = HerdrHost::connect(&mock.socket_path, base.path())
        .await
        .expect("connect")
        .with_workspace("forged-forge");
    let id = host
        .spawn(cwd.path(), "sleep 5", &HashMap::new())
        .await
        .expect("the spawn must still succeed");
    assert_eq!(id.as_str(), TEST_PANE_ID);
    assert!(
        mock.params_of("pane.split").get("workspace_id").is_none(),
        "an unresolved workspace must leave the split untargeted"
    );
}
