//! herdr connection plumbing: one-shot NDJSON Unix-socket RPCs, one dedicated
//! long-lived subscription connection, and the replay gate that filters the
//! stale event prefix herdr replays on subscribe.

mod host;
pub(crate) mod wire;

pub use host::{
    HerdrAgentProjection, HerdrAgentRelease, HerdrCloseOutcome, HerdrControl, HerdrCreatedTab,
    HerdrHost, HerdrLayoutInspection, HerdrLayoutPane, HerdrLayoutSnapshot, HerdrLayoutTarget,
    HerdrMetadataProjection, HerdrProjectionOutcome, HerdrTabCreateError, PaneSnapshot,
};

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, OnceLock};
use std::time::Duration;

use serde_json::Value;
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader};
use tokio::net::UnixStream;
use tokio::task::AbortHandle;

use crate::HostError;
use wire::{PaneEvent, PaneEventKind, WireError};

/// Every herdr RPC awaits its response with this timeout; timeout →
/// `HostError::Unavailable`.
pub(crate) const RPC_TIMEOUT: Duration = Duration::from_secs(5);

/// A DISPATCHED request awaits no response, so this bounds the connect and
/// the write alone — deliberately a fraction of [`RPC_TIMEOUT`], which is
/// what a caller that has already settled must never spend.
pub(crate) const DISPATCH_BUDGET: Duration = Duration::from_millis(250);

/// How much of a dispatched request's answer is read before the drain gives
/// up. One JSON-RPC response frame is orders of magnitude smaller; the cap
/// exists so a peer that never terminates a line cannot grow this buffer.
const DRAIN_READ_CAP: u64 = 64 * 1024;

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
        let Some(pane_id) = data.pane_id() else {
            return Frame::Skip;
        };
        return Frame::Event(PaneEvent { kind, pane_id });
    }
    Frame::Skip
}

/// Herdr closes an ordinary request connection after its response. Event
/// subscriptions are the sole long-lived connection mode, so RPCs and event
/// observation must never share a socket.
pub(crate) struct Connection {
    socket_path: PathBuf,
    next_request_id: AtomicU64,
    gate: Arc<Mutex<ReplayGate>>,
    closed_panes: Arc<Mutex<HashSet<String>>>,
    subscription: OnceLock<AbortHandle>,
}

impl Drop for Connection {
    fn drop(&mut self) {
        if let Some(subscription) = self.subscription.get() {
            subscription.abort();
        }
    }
}

impl Connection {
    /// Retain the endpoint. Each ordinary call dials it independently; the
    /// protocol pin performed immediately by the caller proves reachability.
    pub(crate) async fn dial(socket_path: &Path) -> Result<Arc<Connection>, HostError> {
        Ok(Arc::new(Connection {
            socket_path: socket_path.to_path_buf(),
            next_request_id: AtomicU64::new(1),
            gate: Arc::new(Mutex::new(ReplayGate::new())),
            closed_panes: Arc::new(Mutex::new(HashSet::new())),
            subscription: OnceLock::new(),
        }))
    }

    fn next_request_id(&self) -> String {
        let n = self.next_request_id.fetch_add(1, Ordering::SeqCst);
        format!("forged-{n}")
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

    /// Issue one request on one fresh connection and await its response. This
    /// mirrors Herdr's transport contract: the server closes ordinary request
    /// sockets after the first response.
    pub(crate) async fn call(&self, method: &str, params: Value) -> Result<Value, CallError> {
        let request_id = self.next_request_id();
        let frame = serde_json::json!({
            "id": &request_id,
            "method": method,
            "params": params,
        });
        let line = format!("{}\n", frame);
        let socket_path = &self.socket_path;

        let response = tokio::time::timeout(RPC_TIMEOUT, async {
            let stream = UnixStream::connect(socket_path).await.map_err(|error| {
                CallError::Unavailable(format!("connecting to {}: {error}", socket_path.display()))
            })?;
            let (read_half, mut write_half) = stream.into_split();
            write_half
                .write_all(line.as_bytes())
                .await
                .map_err(|error| {
                    CallError::Unavailable(format!("writing herdr {method} request: {error}"))
                })?;
            let mut lines = BufReader::new(read_half).lines();
            loop {
                let next = lines.next_line().await.map_err(|error| {
                    CallError::Unavailable(format!("reading herdr {method} response: {error}"))
                })?;
                let Some(incoming) = next else {
                    return Err(CallError::Unavailable(format!(
                        "herdr closed the {method} connection before responding"
                    )));
                };
                match parse_frame(&incoming) {
                    Frame::Response { id, result } if id == request_id => {
                        return result.map_err(CallError::Rpc);
                    }
                    Frame::Response { .. } => {
                        return Err(CallError::Unavailable(format!(
                            "herdr returned a mismatched response id for {method}"
                        )));
                    }
                    Frame::Event(event) => {
                        observe_event(&self.gate, &self.closed_panes, event);
                    }
                    Frame::Skip => {
                        eprintln!("forged-host: skipping unrecognized herdr frame: {incoming}");
                    }
                }
            }
        })
        .await;

        match response {
            Ok(result) => result,
            Err(_elapsed) => Err(CallError::Unavailable(format!(
                "herdr did not answer {method} within the RPC timeout"
            ))),
        }
    }

    /// Fire one request and never let its response reach the caller.
    ///
    /// The write IS the whole contract for the CALLER: no answer is awaited
    /// on their thread, so an unresponsive herdr costs them one socket write
    /// rather than [`RPC_TIMEOUT`]. Only for callers that have already
    /// settled and whose correctness does not depend on the request's
    /// outcome — the residual is an unclosed pane, never a delayed or
    /// altered settlement. Bounded by [`DISPATCH_BUDGET`] because reaching a
    /// socket whose backlog is full can itself block.
    ///
    /// Forgetting the outcome is not the same as never observing it: a
    /// failure here leaves a residual an operator would otherwise only meet
    /// as a stray shell, so a detached task DOES read the response, and a
    /// refusal that says the request was not honoured is logged at `warn`.
    /// The caller waits for none of it.
    ///
    /// Two outcomes are deliberately silent. A refusal proving the pane is
    /// ALREADY gone is the goal state reached by another route, not a
    /// failure. And a drain that cannot read or outlives [`RPC_TIMEOUT`]
    /// says nothing about whether herdr honoured the request — logging a
    /// warning there would report a residual that may not exist.
    pub(crate) async fn dispatch(&self, method: &str, params: Value) {
        let request_id = self.next_request_id();
        let frame = serde_json::json!({
            "id": &request_id,
            "method": method,
            "params": params,
        });
        let line = format!("{}\n", frame);
        let socket_path = &self.socket_path;
        let sent = tokio::time::timeout(DISPATCH_BUDGET, async {
            let mut stream = match UnixStream::connect(socket_path).await {
                Ok(stream) => stream,
                Err(error) => {
                    tracing::warn!(
                        method,
                        socket = %socket_path.display(),
                        %error,
                        "herdr dispatch never connected; request unsent"
                    );
                    return None;
                }
            };
            if let Err(error) = stream.write_all(line.as_bytes()).await {
                tracing::warn!(method, %error, "herdr dispatch write failed; request unsent");
                return None;
            }
            Some(stream)
        })
        .await;
        let stream = match sent {
            Ok(Some(stream)) => stream,
            Ok(None) => return,
            Err(_elapsed) => {
                // NOT "unsent": the budget can expire after a partial or
                // even a complete write, so delivery is genuinely unknown
                // here. Reporting it as unsent would send an operator
                // looking for a pane that may well have closed.
                tracing::warn!(
                    method,
                    budget_ms = u64::try_from(DISPATCH_BUDGET.as_millis()).unwrap_or(u64::MAX),
                    "herdr dispatch exceeded its budget; delivery unknown"
                );
                return;
            }
        };

        // Drain the answer in the background, keeping only its refusal.
        // Herdr sees an ordinary peer that stays until it has replied —
        // hanging up on the request we just wrote would invite the server to
        // abandon it — and nothing here is ever awaited by the caller.
        let method = method.to_owned();
        tokio::spawn(async move {
            let _ = tokio::time::timeout(RPC_TIMEOUT, async move {
                // Bounded: this reads a peer's answer into memory with
                // nothing awaiting it, so an unterminated line must not be
                // able to grow without limit.
                let mut lines = BufReader::new(stream.take(DRAIN_READ_CAP)).lines();
                while let Ok(Some(incoming)) = lines.next_line().await {
                    if let Frame::Response {
                        id,
                        result: Err(error),
                    } = parse_frame(&incoming)
                    {
                        // A pane herdr cannot find is a pane already closed:
                        // the request's whole purpose is served, so this is
                        // the one refusal that is not worth an operator's
                        // attention.
                        if id == request_id && !error.is_pane_not_found() {
                            tracing::warn!(
                                method,
                                code = %error.code,
                                message = %error.message,
                                "herdr refused the dispatched request"
                            );
                        }
                    }
                }
            })
            .await;
        });
    }

    /// Open Herdr's dedicated long-lived subscription mode. Ordinary RPCs
    /// continue to use independent sockets while this reader observes events.
    pub(crate) async fn subscribe(&self, params: Value) -> Result<(), CallError> {
        if self.subscription.get().is_some() {
            return Err(CallError::Unavailable(
                "herdr event subscription already started".to_string(),
            ));
        }

        let request_id = self.next_request_id();
        let frame = serde_json::json!({
            "id": &request_id,
            "method": "events.subscribe",
            "params": params,
        });
        let line = format!("{}\n", frame);
        let socket_path = &self.socket_path;
        let gate = Arc::clone(&self.gate);
        let closed_panes = Arc::clone(&self.closed_panes);

        let setup = tokio::time::timeout(RPC_TIMEOUT, async {
            let stream = UnixStream::connect(socket_path).await.map_err(|error| {
                CallError::Unavailable(format!(
                    "connecting subscription to {}: {error}",
                    socket_path.display()
                ))
            })?;
            let (read_half, mut write_half) = stream.into_split();
            write_half
                .write_all(line.as_bytes())
                .await
                .map_err(|error| {
                    CallError::Unavailable(format!("writing herdr subscription request: {error}"))
                })?;
            let mut lines = BufReader::new(read_half).lines();
            loop {
                let next = lines.next_line().await.map_err(|error| {
                    CallError::Unavailable(format!("reading herdr subscription response: {error}"))
                })?;
                let Some(incoming) = next else {
                    return Err(CallError::Unavailable(
                        "herdr closed the subscription connection before acknowledging it"
                            .to_string(),
                    ));
                };
                match parse_frame(&incoming) {
                    Frame::Response { id, result } if id == request_id => {
                        result.map_err(CallError::Rpc)?;
                        return Ok((lines, write_half));
                    }
                    Frame::Response { .. } => {
                        return Err(CallError::Unavailable(
                            "herdr returned a mismatched subscription response id".to_string(),
                        ));
                    }
                    Frame::Event(event) => observe_event(&gate, &closed_panes, event),
                    Frame::Skip => {
                        eprintln!("forged-host: skipping unrecognized herdr frame: {incoming}");
                    }
                }
            }
        })
        .await;
        let (mut lines, write_half) = match setup {
            Ok(result) => result?,
            Err(_elapsed) => {
                return Err(CallError::Unavailable(
                    "herdr did not acknowledge events.subscribe within the RPC timeout".to_string(),
                ));
            }
        };

        let task = tokio::spawn(async move {
            // Herdr keeps subscriptions alive only while the full duplex socket
            // remains open, even though this client sends no more requests.
            let _write_half = write_half;
            while let Ok(Some(incoming)) = lines.next_line().await {
                match parse_frame(&incoming) {
                    Frame::Event(event) => observe_event(&gate, &closed_panes, event),
                    Frame::Response { .. } => {}
                    Frame::Skip => {
                        eprintln!("forged-host: skipping unrecognized herdr frame: {incoming}");
                    }
                }
            }
        });
        let abort = task.abort_handle();
        if let Err(abort) = self.subscription.set(abort) {
            abort.abort();
            return Err(CallError::Unavailable(
                "herdr event subscription raced with another start".to_string(),
            ));
        }
        Ok(())
    }
}

fn observe_event(
    gate: &Mutex<ReplayGate>,
    closed_panes: &Mutex<HashSet<String>>,
    event: PaneEvent,
) {
    let emitted = gate
        .lock()
        .expect("gate lock")
        .feed(GateInput::Event(event));
    if let Some(event) = emitted {
        if event.kind == PaneEventKind::Closed {
            closed_panes
                .lock()
                .expect("closed_panes lock")
                .insert(event.pane_id);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use tokio::net::UnixListener;

    /// Criterion 6 fixture: the exact event shapes from the wire contract —
    /// stale foreign `pane_created`/`pane_exited` lines, then the
    /// self-triggered `pane_created`, then a genuine `pane_exited`.
    const REPLAY_NDJSON: &str = concat!(
        r#"{"event":"pane_created","data":{"type":"pane_created","pane":{"pane_id":"stale-1","workspace_id":"ws-0"}}}"#,
        "\n",
        r#"{"event":"pane_exited","data":{"pane_id":"stale-1","workspace_id":"ws-0"}}"#,
        "\n",
        r#"{"event":"pane_created","data":{"type":"pane_created","pane":{"pane_id":"self-pane","workspace_id":"ws-0"}}}"#,
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
    fn pane_not_found_requires_the_exact_protocol_code() {
        let not_found = WireError {
            code: Value::String("pane_not_found".to_string()),
            message: "pane not found".to_string(),
        };
        assert!(not_found.is_pane_not_found());
        let by_message = WireError {
            code: Value::Null,
            message: "no such pane: p9".to_string(),
        };
        assert!(!by_message.is_pane_not_found());
        let wrong_case = WireError {
            code: Value::String("PANE_NOT_FOUND".to_string()),
            message: "pane not found".to_string(),
        };
        assert!(!wrong_case.is_pane_not_found());
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

    // -----------------------------------------------------------------------
    // Dispatch failure logging. Every way a fire-and-forget request can fail
    // leaves a residual the operator would otherwise meet only as a stray
    // shell, so the `warn` IS the observable: restoring the original silence
    // must fail a test rather than merely change one. Each branch below is
    // driven through the real `dispatch`, never through a stand-in.
    // -----------------------------------------------------------------------

    /// Every warning this process emits, rendered as `message field=value …`.
    fn captured() -> &'static Mutex<Vec<String>> {
        static CAPTURED: OnceLock<Mutex<Vec<String>>> = OnceLock::new();
        CAPTURED.get_or_init(|| Mutex::new(Vec::new()))
    }

    struct CaptureLayer;

    impl<S: tracing::Subscriber> tracing_subscriber::Layer<S> for CaptureLayer {
        fn on_event(
            &self,
            event: &tracing::Event<'_>,
            _ctx: tracing_subscriber::layer::Context<'_, S>,
        ) {
            if event.metadata().level() > &tracing::Level::WARN {
                return;
            }
            let mut rendered = String::new();
            event.record(&mut RenderFields(&mut rendered));
            captured().lock().expect("capture lock").push(rendered);
        }
    }

    struct RenderFields<'a>(&'a mut String);

    impl tracing::field::Visit for RenderFields<'_> {
        fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
            use std::fmt::Write as _;
            let _ = write!(self.0, " {}={value:?}", field.name());
        }
    }

    /// Route this process's warnings into [`captured`]. Deliberately the
    /// GLOBAL subscriber: the refusal branch logs from a detached task that
    /// no thread-local default would ever cover. Tests therefore share one
    /// buffer and each identifies its own line by its unique method name.
    fn capture_warnings() {
        static INSTALLED: OnceLock<()> = OnceLock::new();
        INSTALLED.get_or_init(|| {
            use tracing_subscriber::layer::SubscriberExt as _;
            use tracing_subscriber::util::SubscriberInitExt as _;
            let _ = tracing_subscriber::registry().with(CaptureLayer).try_init();
        });
    }

    /// Wait for a captured warning containing `needle`, failing with
    /// everything that WAS captured.
    async fn warning_containing(needle: &str) -> String {
        let deadline = std::time::Instant::now() + Duration::from_secs(5);
        loop {
            let hit = captured()
                .lock()
                .expect("capture lock")
                .iter()
                .find(|line| line.contains(needle))
                .cloned();
            if let Some(line) = hit {
                return line;
            }
            if std::time::Instant::now() >= deadline {
                // Cloned out first: a guard alive across the panic would
                // poison the buffer and fail every other test for the wrong
                // reason.
                let seen = captured().lock().expect("capture lock").clone();
                panic!("no warning mentioning {needle:?}; captured: {seen:?}");
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    }

    /// A body far larger than any socket buffer, so a peer that never reads
    /// necessarily leaves the write unfinished instead of silently absorbing
    /// it — the stalled and hung-up sockets below both depend on that.
    fn oversized_params() -> Value {
        serde_json::json!({ "blob": "x".repeat(4 * 1024 * 1024) })
    }

    #[tokio::test]
    async fn dispatch_warns_when_the_socket_cannot_be_reached() {
        capture_warnings();
        let tmp = tempfile::tempdir().expect("tempdir");
        let absent = tmp.path().join("herdr.sock");
        let connection = Connection::dial(&absent).await.expect("dial");

        connection
            .dispatch("test.dispatch.unreachable", Value::Null)
            .await;

        let line = warning_containing("test.dispatch.unreachable").await;
        assert!(line.contains("never connected"), "{line}");
        assert!(
            line.contains(&absent.display().to_string()),
            "the unreachable socket must be named: {line}"
        );
    }

    #[tokio::test]
    async fn dispatch_warns_when_the_write_fails() {
        capture_warnings();
        let tmp = tempfile::tempdir().expect("tempdir");
        let socket_path = tmp.path().join("herdr.sock");
        let listener = UnixListener::bind(&socket_path).expect("bind");
        // Accept and hang up at once: the peer is gone long before an
        // oversized body could drain into the socket.
        tokio::spawn(async move {
            let (stream, _) = listener.accept().await.expect("accept");
            drop(stream);
        });
        let connection = Connection::dial(&socket_path).await.expect("dial");

        connection
            .dispatch("test.dispatch.hangup", oversized_params())
            .await;

        let line = warning_containing("test.dispatch.hangup").await;
        assert!(line.contains("write failed"), "{line}");
    }

    #[tokio::test]
    async fn dispatch_warns_when_it_exceeds_its_budget() {
        capture_warnings();
        let tmp = tempfile::tempdir().expect("tempdir");
        let socket_path = tmp.path().join("herdr.sock");
        let listener = UnixListener::bind(&socket_path).expect("bind");
        // Accept and never read: the herdr whose backlog is full, on which
        // the write can only stall.
        let stalled = tokio::spawn(async move {
            let (_held, _) = listener.accept().await.expect("accept");
            std::future::pending::<()>().await;
        });
        let connection = Connection::dial(&socket_path).await.expect("dial");

        let started = std::time::Instant::now();
        connection
            .dispatch("test.dispatch.stalled", oversized_params())
            .await;
        let elapsed = started.elapsed();

        let line = warning_containing("test.dispatch.stalled").await;
        assert!(line.contains("exceeded its budget"), "{line}");
        assert!(
            line.contains(&format!("budget_ms={}", DISPATCH_BUDGET.as_millis())),
            "{line}"
        );
        // The point of the budget: a settled caller never pays an RPC's wait.
        assert!(elapsed < RPC_TIMEOUT, "dispatch waited {elapsed:?}");
        stalled.abort();
    }

    #[tokio::test]
    async fn dispatch_warns_when_herdr_refuses_the_request() {
        capture_warnings();
        let tmp = tempfile::tempdir().expect("tempdir");
        let socket_path = tmp.path().join("herdr.sock");
        let listener = UnixListener::bind(&socket_path).expect("bind");
        // Answer with an error object carrying the request's own id: the one
        // shape the background drain exists to notice.
        tokio::spawn(async move {
            let (stream, _) = listener.accept().await.expect("accept");
            let (read_half, mut write_half) = stream.into_split();
            let mut lines = BufReader::new(read_half).lines();
            let request = lines.next_line().await.expect("read").expect("request");
            let frame: Value = serde_json::from_str(&request).expect("request json");
            let id = frame["id"].as_str().expect("request id").to_string();
            let response = serde_json::json!({
                "id": id,
                "error": {"code": "INTERNAL", "message": "close refused by the test"},
            });
            write_half
                .write_all(format!("{response}\n").as_bytes())
                .await
                .expect("write response");
        });
        let connection = Connection::dial(&socket_path).await.expect("dial");

        connection
            .dispatch("test.dispatch.refused", Value::Null)
            .await;

        let line = warning_containing("test.dispatch.refused").await;
        assert!(line.contains("refused the dispatched request"), "{line}");
        assert!(
            line.contains("INTERNAL"),
            "the refusal code is lost: {line}"
        );
        assert!(
            line.contains("close refused by the test"),
            "the refusal message is lost: {line}"
        );
    }
}
