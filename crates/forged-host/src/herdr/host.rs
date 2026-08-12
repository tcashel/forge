//! HerdrHost: sessions as herdr panes over the protocol-19 Unix socket,
//! treating panes as dumb terminals (the `agent.*` surface is never
//! consulted).

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use serde_json::json;
use tokio::time::Instant;

use super::wire::{PaneInfoResult, PaneReadResponse, Pong, ProcessInfo};
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
/// line. On connection loss the host becomes permanently unavailable and
/// never reconnects.
pub struct HerdrHost {
    conn: Arc<Connection>,
    base_status_dir: PathBuf,
    sessions: Mutex<HashMap<HostSessionId, PathBuf>>,
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
        conn.call(
            "events.subscribe",
            json!({
                "subscriptions": [
                    {"type": "pane.created"},
                    {"type": "pane.exited"},
                    {"type": "pane.closed"},
                ],
            }),
        )
        .await
        .map_err(CallError::into_host_error)?;
        Ok(HerdrHost {
            conn,
            base_status_dir: base_status_dir.into(),
            sessions: Mutex::new(HashMap::new()),
        })
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
            .cloned()
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
                let info: ProcessInfo = serde_json::from_value(value).map_err(|_| {
                    HostError::unavailable("malformed pane.process_info result from herdr")
                })?;
                Ok(PaneProbe::Info(info))
            }
            Err(CallError::Rpc(e)) if e.is_pane_not_found() => Ok(PaneProbe::Gone),
            Err(other) => Err(other.into_host_error()),
        }
    }

    /// Best-effort `pane.close`, ignoring the result entirely — used only
    /// for rollback after a partially failed spawn.
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

        // Reserve <base>/<pane-id>/ exclusively; pane ids are never reused,
        // so an existing dir means something is wrong — never reuse a
        // status file.
        let session_dir = self.base_status_dir.join(pane_id);
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
        if self.conn.is_unavailable() {
            return Err(HostError::unavailable("herdr connection is gone"));
        }
        sentinel::validate_shell_line(shell_line)?;
        let cwd = cwd
            .to_str()
            .ok_or_else(|| HostError::spawn_failed("cwd is not valid UTF-8"))?;

        let split_result = self
            .conn
            .call(
                "pane.split",
                json!({"direction": "right", "cwd": cwd, "env": env, "focus": false}),
            )
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
                self.sessions
                    .lock()
                    .expect("sessions lock")
                    .insert(id.clone(), status_path);
                Ok(id)
            }
            Err(original) => {
                self.best_effort_close(&pane_id).await;
                Err(original)
            }
        }
    }

    async fn alive(&self, id: &HostSessionId) -> Result<Liveness, HostError> {
        if self.conn.is_unavailable() {
            return Err(HostError::unavailable("herdr connection is gone"));
        }
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
        if self.conn.is_unavailable() {
            return Err(HostError::unavailable("herdr connection is gone"));
        }
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

    fn attach_hint(&self, id: &HostSessionId) -> Option<String> {
        let sessions = self.sessions.lock().expect("sessions lock");
        if sessions.contains_key(id) {
            Some(format!("herdr:pane:{}", id.as_str()))
        } else {
            None
        }
    }
}
