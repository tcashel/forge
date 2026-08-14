//! HerdrHost: sessions as herdr panes over the protocol-19 Unix socket,
//! treating panes as dumb terminals (the `agent.*` surface is never
//! consulted).

use std::collections::HashMap;
use std::fmt::Write as _;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use serde_json::json;
use tokio::time::Instant;

use super::wire::{PaneInfoResult, PaneReadResponse, Pong, ProcessInfo, ProcessInfoResponse};
use super::{CallError, Connection};
use crate::identity::ProcessIdentity;
use crate::{sentinel, Confirmed, HostError, HostSessionId, Liveness, SessionHost};

/// The protocol this crate is pinned to; anything else refuses to operate.
const HERDR_PROTOCOL: u32 = 19;

// Phase budgets are WALL-CLOCK deadlines, not iteration counts: each poll
// iteration may itself await a multi-second RPC or a subprocess, so counting
// iterations would let the real wait stretch far beyond the spec'd limit.
const READINESS_BUDGET: Duration = Duration::from_secs(3);
const READINESS_INTERVAL: Duration = Duration::from_millis(50);
const CLOSE_VERIFY_BUDGET: Duration = Duration::from_secs(5);
const KILL_REVERIFY_BUDGET: Duration = Duration::from_secs(2);
const KILL_POLL_INTERVAL: Duration = Duration::from_millis(100);

/// What a `pane.process_info` probe concluded about a pane.
enum PaneProbe {
    Info(ProcessInfo),
    /// The server answered pane-not-found: herdr pane ids are never reused,
    /// so this IS proof the pane is dead.
    Gone,
}

/// What the host retains for one session it spawned.
struct Seat {
    /// The sentinel path: the only exit-code truth for this session. It
    /// deliberately OUTLIVES [`SessionHost::release`] — an id this instance
    /// issued must keep resolving, or a later `alive`/`kill_confirmed` for a
    /// row that never settled answers [`HostError::SessionNotFound`] and
    /// aborts the reconcile pass that was going to reclaim it.
    status_path: PathBuf,
    /// The pane's close has been dispatched: nothing left to attach to.
    released: bool,
}

/// Map Herdr's opaque pane id to a collision-free shell-safe directory name.
/// Real ids contain `:`, and the sentinel path deliberately remains unquoted,
/// so the transport id itself must never become a path component.
fn status_dir_key(pane_id: &str) -> String {
    let mut key = String::with_capacity(5 + pane_id.len() * 2);
    key.push_str("pane-");
    for byte in pane_id.bytes() {
        write!(&mut key, "{byte:02x}").expect("writing to a String cannot fail");
    }
    key
}

/// A [`SessionHost`] backend that runs each session's shell line inside a
/// herdr pane, typed into the pane's existing interactive shell.
///
/// ASSUMPTION: the pane's shell is POSIX-compatible (sh, bash, zsh) — the
/// sentinel relies on `$?`, which is not portable to fish/nushell; those are
/// unsupported in this slice. No shell detection and no nested `/bin/sh -c`
/// wrapper is attempted.
///
/// The pane inherits herdr's environment; the caller's `env` map is passed
/// through `pane.split`'s additive `env` param, never interpolated into the
/// line. Ordinary RPCs use fresh one-shot connections; a separate event
/// subscription supplies closure observations as a best-effort accelerator.
pub struct HerdrHost {
    conn: Arc<Connection>,
    base_status_dir: PathBuf,
    sessions: Mutex<HashMap<HostSessionId, Seat>>,
    /// Label of the workspace seats are placed in, when the caller named one.
    /// `None` reproduces the pre-placement behaviour: an untargeted split,
    /// which herdr resolves against the UI-FOCUSED pane — one that may belong
    /// to the operator or another client.
    workspace_label: Option<String>,
    /// The resolved id for [`Self::workspace_label`], memoized after the
    /// first successful lookup.
    workspace: Mutex<Option<String>>,
}

/// A controller connection for durable pane ids recorded by forged. Unlike
/// [`HerdrHost`], it does not own or spawn sessions.
pub struct HerdrControl {
    conn: Arc<Connection>,
}

/// Plain-text pane output safe to expose through CLI/MCP.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaneSnapshot {
    pub pane_id: String,
    pub workspace_id: String,
    pub tab_id: String,
    pub text: String,
    pub revision: u64,
    pub truncated: bool,
}

async fn connect_pinned(socket_path: &Path) -> Result<Arc<Connection>, HostError> {
    let conn = Connection::dial(socket_path).await?;
    let pong_value = conn
        .call("ping", json!({}))
        .await
        .map_err(CallError::into_host_error)?;
    let pong: Pong = serde_json::from_value(pong_value)
        .map_err(|_| HostError::unavailable("malformed pong from herdr"))?;
    if pong.protocol != HERDR_PROTOCOL {
        return Err(HostError::ProtocolMismatch {
            expected: HERDR_PROTOCOL,
            got: pong.protocol,
        });
    }
    Ok(conn)
}

impl HerdrControl {
    /// Connect to protocol 19 without subscribing to session events.
    pub async fn connect(socket_path: impl AsRef<Path>) -> Result<Self, HostError> {
        Ok(Self {
            conn: connect_pinned(socket_path.as_ref()).await?,
        })
    }

    /// Read a bounded recent-unwrapped text snapshot.
    pub async fn read_pane(&self, pane_id: &str, lines: u32) -> Result<PaneSnapshot, HostError> {
        let value = self
            .conn
            .call(
                "pane.read",
                json!({
                    "pane_id": pane_id,
                    "source": "recent_unwrapped",
                    "lines": lines,
                    "format": "text",
                    "strip_ansi": true,
                }),
            )
            .await
            .map_err(CallError::into_host_error)?;
        let response: PaneReadResponse = serde_json::from_value(value)
            .map_err(|_| HostError::unavailable("malformed pane.read result from herdr"))?;
        Ok(PaneSnapshot {
            pane_id: response.read.pane_id,
            workspace_id: response.read.workspace_id,
            tab_id: response.read.tab_id,
            text: response.read.text,
            revision: response.read.revision,
            truncated: response.read.truncated,
        })
    }

    /// Deliver one message plus Enter to an interactive agent pane.
    pub async fn send_message(&self, pane_id: &str, message: &str) -> Result<(), HostError> {
        if message.trim().is_empty() {
            return Err(HostError::spawn_failed("message must not be empty"));
        }
        if message.len() > 16 * 1024 {
            return Err(HostError::spawn_failed("message exceeds 16 KiB"));
        }
        self.conn
            .call(
                "pane.send_input",
                json!({"pane_id": pane_id, "text": message, "keys": ["Enter"]}),
            )
            .await
            .map_err(CallError::into_host_error)?;
        Ok(())
    }
}

impl HerdrHost {
    /// Dial `socket_path`, pin the protocol with `ping` (anything other
    /// than 19 → [`HostError::ProtocolMismatch`], and no further requests
    /// are issued), then subscribe to the pane events. The default is never
    /// applied here — pass [`HerdrHost::default_socket_path`] explicitly.
    pub async fn connect(
        socket_path: impl AsRef<Path>,
        base_status_dir: impl Into<PathBuf>,
    ) -> Result<Self, HostError> {
        let conn = connect_pinned(socket_path.as_ref()).await?;
        conn.subscribe(json!({
            "subscriptions": [
                {"type": "pane.created"},
                {"type": "pane.exited"},
                {"type": "pane.closed"},
            ],
        }))
        .await
        .map_err(CallError::into_host_error)?;
        Ok(HerdrHost {
            conn,
            base_status_dir: base_status_dir.into(),
            sessions: Mutex::new(HashMap::new()),
            workspace_label: None,
            workspace: Mutex::new(None),
        })
    }

    /// Place every seat this host spawns inside the workspace named `label`,
    /// creating it on first use.
    ///
    /// The label is the caller's to choose and MUST be one only forged owns:
    /// targeting a workspace the operator works in defeats the purpose, since
    /// the seats then split the panes the operator is using.
    pub fn with_workspace(mut self, label: impl Into<String>) -> Self {
        self.workspace_label = Some(label.into());
        self
    }

    /// The workspace id seats are placed in, resolved once and memoized.
    ///
    /// Every failure degrades to `None`, which spawns an untargeted pane. A
    /// pane in the wrong workspace is a strictly better outcome than a seat
    /// that cannot start, so placement never propagates an error. This crate
    /// carries no logging dependency; the degraded case is silent by
    /// construction and is why `workspace.list` is re-consulted on each new
    /// host rather than cached process-wide — a workspace the operator closed
    /// is recreated on the next spawn instead of stranding placement.
    async fn workspace_id(&self) -> Option<String> {
        let label = self.workspace_label.as_deref()?;
        if let Some(id) = self.workspace.lock().expect("workspace lock").clone() {
            return Some(id);
        }
        let id = self.resolve_workspace(label).await?;
        *self.workspace.lock().expect("workspace lock") = Some(id.clone());
        Some(id)
    }

    /// Find the workspace labelled `label`, else create it unfocused.
    ///
    /// `focus: false` is load-bearing: creating a workspace must never move
    /// the operator's focus, and a run that starts while they are working
    /// elsewhere has to stay invisible until they go looking for it.
    async fn resolve_workspace(&self, label: &str) -> Option<String> {
        let listed = self.conn.call("workspace.list", json!({})).await.ok()?;
        let existing = listed
            .get("workspaces")
            .and_then(serde_json::Value::as_array)
            .into_iter()
            .flatten()
            .find(|workspace| {
                workspace.get("label").and_then(serde_json::Value::as_str) == Some(label)
            })
            .and_then(|workspace| workspace.get("workspace_id"))
            .and_then(serde_json::Value::as_str)
            .map(str::to_owned);
        if let Some(id) = existing {
            return Some(id);
        }
        let created = self
            .conn
            .call("workspace.create", json!({"label": label, "focus": false}))
            .await
            .ok()?;
        created
            .get("workspace")
            .and_then(|workspace| workspace.get("workspace_id"))
            .and_then(serde_json::Value::as_str)
            .map(str::to_owned)
    }

    /// `$HOME/.config/herdr/herdr.sock`.
    pub fn default_socket_path() -> PathBuf {
        std::env::home_dir()
            .unwrap_or_default()
            .join(".config/herdr/herdr.sock")
    }

    fn session_status_path(&self, id: &HostSessionId) -> Result<PathBuf, HostError> {
        self.sessions
            .lock()
            .expect("sessions lock")
            .get(id)
            .map(|seat| seat.status_path.clone())
            .ok_or_else(|| HostError::session_not_found(id))
    }

    /// Probe a pane. Pane-not-found is proof of pane death; any other error
    /// response (transport failure, RPC timeout, connection loss) is
    /// [`HostError::Unavailable`] and proves nothing.
    async fn probe_pane(&self, pane_id: &str) -> Result<PaneProbe, HostError> {
        match self
            .conn
            .call("pane.process_info", json!({"pane_id": pane_id}))
            .await
        {
            Ok(value) => {
                let response: ProcessInfoResponse =
                    serde_json::from_value(value).map_err(|_| {
                        HostError::unavailable("malformed pane.process_info result from herdr")
                    })?;
                Ok(PaneProbe::Info(response.process_info))
            }
            Err(CallError::Rpc(e)) if e.is_pane_not_found() => Ok(PaneProbe::Gone),
            Err(other) => Err(other.into_host_error()),
        }
    }

    /// Best-effort `pane.close`, ignoring the result entirely — used only
    /// for rollback after a partially failed spawn, where the pane is not
    /// yet a session and no caller depends on its fate.
    async fn best_effort_close(&self, pane_id: &str) {
        let _ = self
            .conn
            .call("pane.close", json!({"pane_id": pane_id}))
            .await;
    }

    /// Everything after a successful `pane.split`: shell-readiness wait,
    /// status-dir creation, and the single `pane.send_input`. Any failure
    /// here makes the caller roll the pane back with a best-effort close.
    async fn finish_spawn(&self, pane_id: &str, shell_line: &str) -> Result<PathBuf, HostError> {
        // Wait for the pane's shell before typing into it, within a
        // wall-clock deadline; sleep only the remaining budget.
        let deadline = Instant::now() + READINESS_BUDGET;
        loop {
            match self.probe_pane(pane_id).await? {
                PaneProbe::Gone => {
                    return Err(HostError::spawn_failed(
                        "pane disappeared before its shell started",
                    ))
                }
                PaneProbe::Info(info) if info.shell_pid.is_some() => break,
                PaneProbe::Info(_) => {}
            }
            let now = Instant::now();
            if now >= deadline {
                return Err(HostError::spawn_failed(
                    "pane shell never became ready within the 3 s budget",
                ));
            }
            tokio::time::sleep(READINESS_INTERVAL.min(deadline - now)).await;
        }

        // Reserve <base>/<encoded-pane-id>/ exclusively. Pane ids are opaque
        // transport identifiers (and contain shell-unsafe `:`), so encode
        // their bytes rather than weakening sentinel-path validation. Herdr
        // never reuses pane ids, so an existing dir is always an error.
        let session_dir = self.base_status_dir.join(status_dir_key(pane_id));
        let status_path = session_dir.join("status");
        sentinel::validate_status_path(&status_path)?;
        std::fs::create_dir_all(&self.base_status_dir)
            .map_err(|e| HostError::spawn_failed(format!("creating base status dir: {e}")))?;
        std::fs::create_dir(&session_dir)
            .map_err(|e| HostError::spawn_failed(format!("reserving session status dir: {e}")))?;

        // Typed exactly once, never retried: send_input is not idempotent
        // and a duplicate would run the line twice.
        let full_line = sentinel::append_sentinel(shell_line, &status_path);
        self.conn
            .call(
                "pane.send_input",
                json!({"pane_id": pane_id, "text": full_line, "keys": ["Enter"]}),
            )
            .await
            .map_err(|e| match e {
                CallError::Rpc(e) => {
                    HostError::spawn_failed(format!("pane.send_input refused: {}", e.message))
                }
                other => other.into_host_error(),
            })?;
        Ok(status_path)
    }

    /// Poll until every captured foreground identity reads dead, within a
    /// wall-clock `budget`. `Ok(true)` when all are verified dead;
    /// `Ok(false)` when the deadline passes first; `Err` when an identity
    /// probe could not run at all (which proves nothing about death).
    async fn all_targets_dead(
        &self,
        targets: &[ProcessIdentity],
        budget: Duration,
    ) -> Result<bool, HostError> {
        let deadline = Instant::now() + budget;
        loop {
            let mut any_alive = false;
            for target in targets {
                if target.is_same_process().await? {
                    any_alive = true;
                    break;
                }
            }
            if !any_alive {
                return Ok(true);
            }
            let now = Instant::now();
            if now >= deadline {
                return Ok(false);
            }
            tokio::time::sleep(KILL_POLL_INTERVAL.min(deadline - now)).await;
        }
    }
}

#[async_trait::async_trait]
impl SessionHost for HerdrHost {
    async fn spawn(
        &self,
        cwd: &Path,
        shell_line: &str,
        env: &HashMap<String, String>,
    ) -> Result<HostSessionId, HostError> {
        sentinel::validate_shell_line(shell_line)?;
        let cwd = cwd
            .to_str()
            .ok_or_else(|| HostError::spawn_failed("cwd is not valid UTF-8"))?;

        // Placement is decided HERE and never revised. herdr pane ids are
        // workspace-qualified and a pane moved between workspaces receives a
        // NEW id; the id returned below becomes this session's
        // `HostSessionId`, which the reclaim saga is fenced on. Relocating a
        // pane afterwards would therefore invalidate a live session identity
        // and break confirmed-death verification.
        let mut split = json!({"direction": "right", "cwd": cwd, "env": env, "focus": false});
        if let Some(workspace) = self.workspace_id().await {
            split["workspace_id"] = json!(workspace);
        }
        let split_result = self
            .conn
            .call("pane.split", split)
            .await
            .map_err(|e| match e {
                CallError::Rpc(e) => {
                    HostError::spawn_failed(format!("pane.split refused: {}", e.message))
                }
                other => other.into_host_error(),
            })?;
        let pane: PaneInfoResult = serde_json::from_value(split_result)
            .map_err(|_| HostError::unavailable("malformed pane.split result from herdr"))?;
        let pane_id = pane.pane.pane_id;
        // Feed the replay gate the pane_id we now own.
        self.conn.register_own_pane(&pane_id);

        match self.finish_spawn(&pane_id, shell_line).await {
            Ok(status_path) => {
                let id = HostSessionId(pane_id);
                self.sessions.lock().expect("sessions lock").insert(
                    id.clone(),
                    Seat {
                        status_path,
                        released: false,
                    },
                );
                Ok(id)
            }
            Err(original) => {
                self.best_effort_close(&pane_id).await;
                Err(original)
            }
        }
    }

    async fn alive(&self, id: &HostSessionId) -> Result<Liveness, HostError> {
        let status_path = self.session_status_path(id)?;
        // Status file first: the only exit-code truth.
        if let Some(code) = sentinel::read_status(&status_path)? {
            return Ok(Liveness::Exited(code));
        }
        let pane_id = id.as_str();
        // pane_closed events and pane-not-found responses are dead
        // observations; a drained foreground is NOT (the line may not have
        // started yet; callers own timeouts).
        let dead_observed = self.conn.pane_closed_observed(pane_id)
            || match self.probe_pane(pane_id).await? {
                PaneProbe::Gone => true,
                PaneProbe::Info(_) => false,
            };
        if !dead_observed {
            return Ok(Liveness::Running);
        }
        // Re-read ONCE after the dead observation before concluding.
        match sentinel::read_status(&status_path)? {
            Some(code) => Ok(Liveness::Exited(code)),
            None => Ok(Liveness::Vanished),
        }
    }

    async fn kill_confirmed(&self, id: &HostSessionId) -> Result<Confirmed, HostError> {
        let status_path = self.session_status_path(id)?;
        let pane_id = id.as_str().to_string();

        // Entry reads, once each, before acting: sentinel then pane probe.
        let sentinel_present = sentinel::read_status(&status_path)?.is_some();
        let entry_probe = self.probe_pane(&pane_id).await?;
        if sentinel_present {
            // The line already finished: verified prior death. If the pane
            // still exists, close it FOR REAL — only pane-not-found is
            // tolerated; a transport failure, RPC timeout, or any other
            // error response propagates rather than hiding behind
            // AlreadyDead with the pane possibly left open.
            if let PaneProbe::Info(_) = entry_probe {
                match self
                    .conn
                    .call("pane.close", json!({"pane_id": &pane_id}))
                    .await
                {
                    Ok(_) => {}
                    Err(CallError::Rpc(e)) if e.is_pane_not_found() => {}
                    Err(other) => return Err(other.into_host_error()),
                }
            }
            return Ok(Confirmed::AlreadyDead);
        }
        let info = match entry_probe {
            // Verified missing BEFORE pane.close was attempted.
            PaneProbe::Gone => return Ok(Confirmed::AlreadyDead),
            PaneProbe::Info(info) => info,
        };

        // Capture the foreground pids with their lstart identities before
        // closing. A pid `ps` cannot resolve at capture is already dead.
        let mut targets = Vec::new();
        for process in &info.foreground_processes {
            if let Some(identity) = ProcessIdentity::capture(process.pid).await {
                targets.push(identity);
            }
        }
        let pgid = info.foreground_process_group_id;

        // pane.close plays the SIGTERM role. A pane-not-found error is
        // tolerated rather than propagated: it feeds the verification.
        let close_reported_gone = match self
            .conn
            .call("pane.close", json!({"pane_id": &pane_id}))
            .await
        {
            Ok(_) => false,
            Err(CallError::Rpc(e)) if e.is_pane_not_found() => true,
            Err(other) => return Err(other.into_host_error()),
        };

        if targets.is_empty() {
            // The pane was live on entry with nothing forged-started
            // running (empty foreground, no sentinel). Closing a live pane
            // is a kill — but a bare close acknowledgement is NEVER
            // confirmation on its own: verify pane absence.
            if close_reported_gone {
                return Ok(Confirmed::Killed);
            }
            let deadline = Instant::now() + CLOSE_VERIFY_BUDGET;
            loop {
                if self.conn.pane_closed_observed(&pane_id) {
                    return Ok(Confirmed::Killed);
                }
                if let PaneProbe::Gone = self.probe_pane(&pane_id).await? {
                    return Ok(Confirmed::Killed);
                }
                let now = Instant::now();
                if now >= deadline {
                    return Err(HostError::KillVerifyTimeout);
                }
                tokio::time::sleep(KILL_POLL_INTERVAL.min(deadline - now)).await;
            }
        }

        // Verify every captured pid dead; escalate to SIGKILL on the
        // foreground process group if survivors remain.
        if self.all_targets_dead(&targets, CLOSE_VERIFY_BUDGET).await? {
            return Ok(Confirmed::Killed);
        }
        if let Some(pgid) = pgid {
            let _ = killpg(Pid::from_raw(pgid), Signal::SIGKILL);
        }
        if self
            .all_targets_dead(&targets, KILL_REVERIFY_BUDGET)
            .await?
        {
            return Ok(Confirmed::Killed);
        }
        Err(HostError::KillVerifyTimeout)
    }

    /// Dispatch the pane's close and mark the seat released. Deliberately
    /// NOT `kill_confirmed`'s close: no probe, no verification, no re-check
    /// budget, and no wait for herdr's answer — a settled attempt must never
    /// block on the terminal it is giving back, so the request is fired and
    /// its response is never read.
    ///
    /// The seat itself SURVIVES. Releasing gives up the terminal, never the
    /// session identity: a reconcile pass that reaches an attempt this
    /// process already released — a row left `revoking` by a refused settle,
    /// say — must still get a liveness answer and a confirmable kill out of
    /// it, and `SessionNotFound` there would abort the pass that was going
    /// to reclaim the packet.
    async fn release(&self, id: &HostSessionId) {
        {
            let mut sessions = self.sessions.lock().expect("sessions lock");
            if let Some(seat) = sessions.get_mut(id) {
                seat.released = true;
            }
        }
        self.conn
            .dispatch("pane.close", json!({"pane_id": id.as_str()}))
            .await;
    }

    fn attach_hint(&self, id: &HostSessionId) -> Option<String> {
        let sessions = self.sessions.lock().expect("sessions lock");
        // A released seat still resolves for liveness, but its pane is
        // closing: there is no terminal left for a UI to attach to.
        match sessions.get(id) {
            Some(seat) if !seat.released => Some(format!("herdr:pane:{}", id.as_str())),
            _ => None,
        }
    }
}
