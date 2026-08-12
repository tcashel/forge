//! herdr connection plumbing: one demuxed NDJSON Unix-socket connection,
//! request/response correlation, and the replay gate that filters the stale
//! event prefix herdr replays on subscribe.

mod host;
pub(crate) mod wire;

pub use host::HerdrHost;

use std::collections::{HashMap, HashSet};
use std::path::Path;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use serde_json::Value;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::unix::{OwnedReadHalf, OwnedWriteHalf};
use tokio::net::UnixStream;
use tokio::sync::{mpsc, oneshot};

use crate::HostError;
use wire::{PaneEvent, PaneEventKind, WireError};

/// Every herdr RPC awaits its response with this timeout; timeout →
/// `HostError::Unavailable`.
pub(crate) const RPC_TIMEOUT: Duration = Duration::from_secs(5);

/// Bound on the pre-synchronization set of retained `pane_created` ids.
const GATE_RETAIN_CAP: usize = 1024;

/// How a single RPC failed.
pub(crate) enum CallError {
    /// Transport-level failure (connection gone, RPC timeout): proves
    /// nothing about any pane.
    Unavailable(String),
    /// The server answered with an error object.
    Rpc(WireError),
}

impl CallError {
    /// Collapse into a `HostError` where the caller has no pane-specific
    /// interpretation of RPC errors: a non-pane-specific error response is
    /// still a host-side failure.
    pub(crate) fn into_host_error(self) -> HostError {
        match self {
            CallError::Unavailable(message) => HostError::unavailable(message),
            CallError::Rpc(e) => HostError::unavailable(format!("herdr error: {}", e.message)),
        }
    }
}

/// Input to the replay gate: an interleaved stream of self pane
/// registrations (every `pane.split` response's pane_id) and demuxed events.
#[derive(Debug, Clone)]
pub(crate) enum GateInput {
    OwnPaneRegistered(String),
    Event(PaneEvent),
}

/// The replay gate: herdr replays a stale prefix of recent events on
/// subscribe, so nothing is trusted until an event provably about THIS host
/// instance's own pane is seen. A pure state machine — no I/O, no clock.
///
/// Before synchronization the gate retains the pane_id of each
/// `pane_created` seen (bounded), emits nothing, and drops all other event
/// kinds. It synchronizes when an `OwnPaneRegistered(id)` matches a retained
/// created id, or when a later `pane_created{id}` matches an
/// already-registered own id — covering both orderings. The synchronizing
/// event itself is not emitted; from that point events pass through ungated.
#[derive(Debug, Default)]
pub(crate) struct ReplayGate {
    synchronized: bool,
    retained_created: HashSet<String>,
    own_panes: HashSet<String>,
}

impl ReplayGate {
    pub(crate) fn new() -> Self {
        Self::default()
    }

    /// Feed one input; `Some(event)` only for events trusted for emission.
    pub(crate) fn feed(&mut self, input: GateInput) -> Option<PaneEvent> {
        match input {
            GateInput::OwnPaneRegistered(pane_id) => {
                if !self.synchronized {
                    if self.retained_created.contains(&pane_id) {
                        self.synchronize();
                    } else {
                        self.own_panes.insert(pane_id);
                    }
                }
                None
            }
            GateInput::Event(event) => {
                if self.synchronized {
                    return Some(event);
                }
                if event.kind == PaneEventKind::Created {
                    if self.own_panes.contains(&event.pane_id) {
                        // Synchronizing event: trusted from here on, but the
                        // event itself is not emitted.
                        self.synchronize();
                    } else if self.retained_created.len() < GATE_RETAIN_CAP {
                        self.retained_created.insert(event.pane_id);
                    }
                }
                None
            }
        }
    }

    fn synchronize(&mut self) {
        self.synchronized = true;
        self.retained_created.clear();
        self.own_panes.clear();
    }
}

/// A parsed incoming frame, demuxed by shape.
pub(crate) enum Frame {
    Response {
        id: String,
        result: Result<Value, WireError>,
    },
    Event(PaneEvent),
    /// Unparseable, neither id nor event, or an event kind we ignore.
    Skip,
}

/// Demux one NDJSON line by shape: `id` present → response; `event` present
/// → event; anything else is skipped without tearing down the connection.
pub(crate) fn parse_frame(line: &str) -> Frame {
    let Ok(value) = serde_json::from_str::<Value>(line) else {
        return Frame::Skip;
    };
    if let Some(id) = value.get("id").and_then(Value::as_str) {
        let result = match value.get("error") {
            Some(error) => match serde_json::from_value::<WireError>(error.clone()) {
                Ok(wire_error) => Err(wire_error),
                Err(_) => Err(WireError {
                    code: error.clone(),
                    message: "malformed error object".to_string(),
                }),
            },
            None => Ok(value.get("result").cloned().unwrap_or(Value::Null)),
        };
        return Frame::Response {
            id: id.to_string(),
            result,
        };
    }
    if let Some(kind) = value.get("event").and_then(Value::as_str) {
        let Some(kind) = PaneEventKind::parse(kind) else {
            return Frame::Skip;
        };
        let Some(data) = value.get("data") else {
            return Frame::Skip;
        };
        let Ok(data) = serde_json::from_value::<wire::PaneEventData>(data.clone()) else {
            return Frame::Skip;
        };
        return Frame::Event(PaneEvent {
            kind,
            pane_id: data.pane_id,
        });
    }
    Frame::Skip
}

type Pending = Arc<Mutex<HashMap<String, oneshot::Sender<Result<Value, WireError>>>>>;

/// One demuxed connection to a herdr server. Requests go through a writer
/// task; responses and events come back through the demux task. On EOF or
/// any socket I/O error the pending requests are failed, the connection is
/// marked permanently unavailable, and the host NEVER reconnects —
/// reconnect/re-sync is a later slice.
pub(crate) struct Connection {
    writer_tx: mpsc::UnboundedSender<String>,
    pending: Pending,
    next_request_id: AtomicU64,
    unavailable: Arc<AtomicBool>,
    gate: Arc<Mutex<ReplayGate>>,
    closed_panes: Arc<Mutex<HashSet<String>>>,
}

impl Connection {
    /// Dial the socket and start the demux and writer tasks. No protocol
    /// traffic happens here — `ping`/`events.subscribe` are ordinary
    /// requests issued through the demux by the caller.
    pub(crate) async fn dial(socket_path: &Path) -> Result<Arc<Connection>, HostError> {
        let stream = UnixStream::connect(socket_path).await.map_err(|e| {
            HostError::unavailable(format!("connecting to {}: {e}", socket_path.display()))
        })?;
        let (read_half, write_half) = stream.into_split();
        let (writer_tx, writer_rx) = mpsc::unbounded_channel::<String>();
        let pending: Pending = Arc::new(Mutex::new(HashMap::new()));
        let unavailable = Arc::new(AtomicBool::new(false));
        let gate = Arc::new(Mutex::new(ReplayGate::new()));
        let closed_panes = Arc::new(Mutex::new(HashSet::new()));

        tokio::spawn(demux_task(
            read_half,
            Arc::clone(&pending),
            Arc::clone(&unavailable),
            Arc::clone(&gate),
            Arc::clone(&closed_panes),
        ));
        tokio::spawn(writer_task(
            write_half,
            writer_rx,
            Arc::clone(&pending),
            Arc::clone(&unavailable),
        ));

        Ok(Arc::new(Connection {
            writer_tx,
            pending,
            next_request_id: AtomicU64::new(1),
            unavailable,
            gate,
            closed_panes,
        }))
    }

    pub(crate) fn is_unavailable(&self) -> bool {
        self.unavailable.load(Ordering::SeqCst)
    }

    /// Record a `pane.split` response's pane_id with the replay gate.
    pub(crate) fn register_own_pane(&self, pane_id: &str) {
        let mut gate = self.gate.lock().expect("gate lock");
        let _ = gate.feed(GateInput::OwnPaneRegistered(pane_id.to_string()));
    }

    /// Whether a trusted `pane_closed` event has been observed for this
    /// pane. An accelerator only: nothing ever blocks waiting for it, and
    /// its absence never prevents a conclusion.
    pub(crate) fn pane_closed_observed(&self, pane_id: &str) -> bool {
        self.closed_panes
            .lock()
            .expect("closed_panes lock")
            .contains(pane_id)
    }

    /// Issue one request and await its response with the 5 s RPC timeout.
    pub(crate) async fn call(&self, method: &str, params: Value) -> Result<Value, CallError> {
        if self.is_unavailable() {
            return Err(CallError::Unavailable(
                "herdr connection is gone; the host does not reconnect".to_string(),
            ));
        }
        let n = self.next_request_id.fetch_add(1, Ordering::SeqCst);
        let request_id = format!("forged-{n}");
        let (tx, rx) = oneshot::channel();
        self.pending
            .lock()
            .expect("pending lock")
            .insert(request_id.clone(), tx);
        // Re-check after insert so a concurrent teardown cannot strand us.
        if self.is_unavailable() {
            self.pending
                .lock()
                .expect("pending lock")
                .remove(&request_id);
            return Err(CallError::Unavailable(
                "herdr connection is gone; the host does not reconnect".to_string(),
            ));
        }
        let frame = serde_json::json!({
            "id": request_id,
            "method": method,
            "params": params,
        });
        let line = frame.to_string();
        if self.writer_tx.send(line).is_err() {
            self.pending
                .lock()
                .expect("pending lock")
                .remove(&request_id);
            return Err(CallError::Unavailable(
                "herdr writer task is gone".to_string(),
            ));
        }
        match tokio::time::timeout(RPC_TIMEOUT, rx).await {
            Ok(Ok(Ok(result))) => Ok(result),
            Ok(Ok(Err(wire_error))) => Err(CallError::Rpc(wire_error)),
            Ok(Err(_dropped)) => Err(CallError::Unavailable(
                "herdr connection closed with the request outstanding".to_string(),
            )),
            Err(_elapsed) => {
                self.pending
                    .lock()
                    .expect("pending lock")
                    .remove(&request_id);
                Err(CallError::Unavailable(format!(
                    "herdr did not answer {method} within the RPC timeout"
                )))
            }
        }
    }
}

/// Fail every pending request (dropping the senders completes each caller's
/// await with a channel error mapped to `HostError::Unavailable`) and mark
/// the connection permanently unavailable.
fn tear_down(pending: &Pending, unavailable: &AtomicBool) {
    unavailable.store(true, Ordering::SeqCst);
    pending.lock().expect("pending lock").clear();
}

async fn demux_task(
    read_half: OwnedReadHalf,
    pending: Pending,
    unavailable: Arc<AtomicBool>,
    gate: Arc<Mutex<ReplayGate>>,
    closed_panes: Arc<Mutex<HashSet<String>>>,
) {
    let mut lines = BufReader::new(read_half).lines();
    // EOF or any socket I/O error falls out of the loop into tear_down.
    while let Ok(Some(line)) = lines.next_line().await {
        match parse_frame(&line) {
            Frame::Response { id, result } => {
                let sender = pending.lock().expect("pending lock").remove(&id);
                if let Some(sender) = sender {
                    let _ = sender.send(result);
                }
            }
            Frame::Event(event) => {
                let emitted = {
                    let mut gate = gate.lock().expect("gate lock");
                    gate.feed(GateInput::Event(event))
                };
                if let Some(event) = emitted {
                    if event.kind == PaneEventKind::Closed {
                        closed_panes
                            .lock()
                            .expect("closed_panes lock")
                            .insert(event.pane_id);
                    }
                }
            }
            Frame::Skip => {
                eprintln!("forged-host: skipping unrecognized herdr frame: {line}");
            }
        }
    }
    tear_down(&pending, &unavailable);
}

async fn writer_task(
    mut write_half: OwnedWriteHalf,
    mut writer_rx: mpsc::UnboundedReceiver<String>,
    pending: Pending,
    unavailable: Arc<AtomicBool>,
) {
    while let Some(line) = writer_rx.recv().await {
        let write = async {
            write_half.write_all(line.as_bytes()).await?;
            write_half.write_all(b"\n").await
        };
        if write.await.is_err() {
            tear_down(&pending, &unavailable);
            return;
        }
    }
    // Writer channel closed: the host was dropped; nothing pending to fail.
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Criterion 6 fixture: the exact event shapes from the wire contract —
    /// stale foreign `pane_created`/`pane_exited` lines, then the
    /// self-triggered `pane_created`, then a genuine `pane_exited`.
    const REPLAY_NDJSON: &str = concat!(
        r#"{"event":"pane_created","data":{"pane_id":"stale-1","workspace_id":"ws-0"}}"#,
        "\n",
        r#"{"event":"pane_exited","data":{"pane_id":"stale-1","workspace_id":"ws-0"}}"#,
        "\n",
        r#"{"event":"pane_created","data":{"pane_id":"self-pane","workspace_id":"ws-0"}}"#,
        "\n",
        r#"{"event":"pane_exited","data":{"pane_id":"self-pane","workspace_id":"ws-0"}}"#,
    );

    fn events() -> Vec<PaneEvent> {
        REPLAY_NDJSON
            .lines()
            .map(|line| match parse_frame(line) {
                Frame::Event(event) => event,
                _ => panic!("fixture line did not parse as an event: {line}"),
            })
            .collect()
    }

    #[test]
    fn replay_prefix_dropped_when_self_created_arrives_before_registration() {
        let [stale_created, stale_exited, self_created, genuine_exited]: [PaneEvent; 4] =
            events().try_into().expect("four fixture events");
        let mut gate = ReplayGate::new();
        assert_eq!(gate.feed(GateInput::Event(stale_created)), None);
        assert_eq!(gate.feed(GateInput::Event(stale_exited)), None);
        // Self pane_created arrives BEFORE the pane.split response registers it.
        assert_eq!(gate.feed(GateInput::Event(self_created)), None);
        assert_eq!(
            gate.feed(GateInput::OwnPaneRegistered("self-pane".to_string())),
            None,
            "the synchronizing input emits nothing"
        );
        let emitted = gate.feed(GateInput::Event(genuine_exited.clone()));
        assert_eq!(emitted, Some(genuine_exited));
    }

    #[test]
    fn replay_prefix_dropped_when_registration_arrives_before_self_created() {
        let [stale_created, stale_exited, self_created, genuine_exited]: [PaneEvent; 4] =
            events().try_into().expect("four fixture events");
        let mut gate = ReplayGate::new();
        assert_eq!(gate.feed(GateInput::Event(stale_created)), None);
        assert_eq!(gate.feed(GateInput::Event(stale_exited)), None);
        // pane.split response registers the pane BEFORE its created event.
        assert_eq!(
            gate.feed(GateInput::OwnPaneRegistered("self-pane".to_string())),
            None
        );
        assert_eq!(
            gate.feed(GateInput::Event(self_created)),
            None,
            "the synchronizing event itself is not emitted"
        );
        let emitted = gate.feed(GateInput::Event(genuine_exited.clone()));
        assert_eq!(emitted, Some(genuine_exited));
    }

    #[test]
    fn ungated_events_pass_through_after_sync() {
        let mut gate = ReplayGate::new();
        let _ = gate.feed(GateInput::OwnPaneRegistered("p".to_string()));
        let created = PaneEvent {
            kind: PaneEventKind::Created,
            pane_id: "p".to_string(),
        };
        assert_eq!(gate.feed(GateInput::Event(created)), None);
        let closed = PaneEvent {
            kind: PaneEventKind::Closed,
            pane_id: "other".to_string(),
        };
        assert_eq!(gate.feed(GateInput::Event(closed.clone())), Some(closed));
    }

    #[test]
    fn pre_sync_non_created_events_are_dropped() {
        let mut gate = ReplayGate::new();
        let closed = PaneEvent {
            kind: PaneEventKind::Closed,
            pane_id: "x".to_string(),
        };
        assert_eq!(gate.feed(GateInput::Event(closed)), None);
    }

    #[test]
    fn pane_not_found_heuristic() {
        let not_found = WireError {
            code: Value::String("PANE_NOT_FOUND".to_string()),
            message: "pane not found".to_string(),
        };
        assert!(not_found.is_pane_not_found());
        let by_message = WireError {
            code: Value::Null,
            message: "no such pane: p9".to_string(),
        };
        assert!(by_message.is_pane_not_found());
        let other = WireError {
            code: Value::String("INTERNAL".to_string()),
            message: "boom".to_string(),
        };
        assert!(!other.is_pane_not_found());
        // A bare "not found" about something OTHER than the pane must never
        // read as pane death.
        let workspace = WireError {
            code: Value::String("WORKSPACE_NOT_FOUND".to_string()),
            message: "workspace not found".to_string(),
        };
        assert!(!workspace.is_pane_not_found());
        let method = WireError {
            code: Value::String("METHOD_NOT_FOUND".to_string()),
            message: "method not found: pane.fly".to_string(),
        };
        assert!(!method.is_pane_not_found());
    }
}
