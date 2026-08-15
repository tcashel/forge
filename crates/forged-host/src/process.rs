//! ProcessHost: plain `/bin/sh -c` processes in a fresh session/process
//! group, with the sentinel status file as the only exit-code truth.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;

use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use tokio::sync::Mutex;

use crate::identity::ProcessIdentity;
use crate::{
    next_host_instance, sentinel, Confirmed, HostError, HostSessionId, Liveness, PreparedSession,
    SessionHost,
};

/// Crate-static id counter shared by ALL ProcessHost instances, so ids never
/// collide across hosts in one process. No randomness or clock needed.
static NEXT_SESSION_ID: AtomicU64 = AtomicU64::new(0);

const TERM_POLLS: u32 = 50; // 100 ms apart ≈ 5 s
const KILL_POLLS: u32 = 20; // 100 ms apart ≈ 2 s
const POLL_INTERVAL: Duration = Duration::from_millis(100);

struct ProcSession {
    child: tokio::process::Child,
    /// Shell pid; because `pre_exec` calls `setsid()`, this doubles as the
    /// process-group id for `killpg` — no `getpgid` call.
    pid: u32,
    /// `None` when `ps` reported the child already absent at the post-spawn
    /// capture (a very fast line); the session stays valid and the sentinel
    /// plus `try_wait` decide `Exited` vs `Vanished`.
    identity: Option<ProcessIdentity>,
    status_path: PathBuf,
}

struct PreparedProcSession {
    token: u64,
    cwd: PathBuf,
    shell_line: String,
    env: HashMap<String, String>,
    status_path: PathBuf,
}

/// A [`SessionHost`] backend running each session as a plain process:
/// `/bin/sh -c "<line>; echo $? > <base>/<id>/status"`, `setsid()` in
/// `pre_exec` so the shell leads a fresh session/process group.
///
/// The host process environment is INHERITED and the caller's `env` map is
/// overlaid on top; hermetic environments are out of scope for this slice.
pub struct ProcessHost {
    base_status_dir: PathBuf,
    instance: u64,
    prepared: Mutex<HashMap<HostSessionId, PreparedProcSession>>,
    sessions: Mutex<HashMap<HostSessionId, ProcSession>>,
}

impl ProcessHost {
    /// Build a host that writes sentinel status files under
    /// `base_status_dir`. Infallible; no I/O at construction. The base is
    /// expected to be a per-run scratch dir; the host never deletes status
    /// files or directories — the caller owns retention.
    pub fn new(base_status_dir: impl Into<PathBuf>) -> Self {
        ProcessHost {
            base_status_dir: base_status_dir.into(),
            instance: next_host_instance(),
            prepared: Mutex::new(HashMap::new()),
            sessions: Mutex::new(HashMap::new()),
        }
    }

    fn remove_empty_status_dir(status_path: &Path) {
        if let Some(session_dir) = status_path.parent() {
            let _ = std::fs::remove_dir(session_dir);
        }
    }

    /// One dead-or-alive probe: `Child::try_wait()` FIRST (an
    /// exited-but-unreaped direct child remains visible to `ps` as a zombie
    /// with an unchanged lstart, so the identity check alone would never
    /// observe the held child's death), then the identity comparator. Only
    /// `Ok(Some(_))` is verified death and `Ok(None)` is verified liveness
    /// for the child this host still owns. Only a `try_wait` error falls back
    /// to the cross-process identity probe. The reaped exit status is
    /// discarded — the status file stays the only exit-code truth. Never
    /// holds the session lock across an await.
    async fn probe_dead(&self, id: &HostSessionId) -> Result<bool, HostError> {
        let identity = {
            let mut sessions = self.sessions.lock().await;
            let session = sessions
                .get_mut(id)
                .ok_or_else(|| HostError::session_not_found(id))?;
            match session.child.try_wait() {
                Ok(Some(_)) => return Ok(true),
                Ok(None) => return Ok(false),
                Err(_) => {}
            }
            session.identity.clone()
        };
        match identity {
            Some(identity) => Ok(!identity.is_same_process().await?),
            None => Ok(false),
        }
    }
}

#[async_trait::async_trait]
impl SessionHost for ProcessHost {
    async fn prepare(
        &self,
        cwd: &Path,
        shell_line: &str,
        env: &HashMap<String, String>,
    ) -> Result<PreparedSession, HostError> {
        sentinel::validate_shell_line(shell_line)?;

        // Mint an id and reserve <base>/<id>/ exclusively; on AlreadyExists
        // mint the next id and retry — never reuse an existing status file.
        let host_pid = std::process::id();
        let (id, status_path) = loop {
            let n = NEXT_SESSION_ID.fetch_add(1, Ordering::Relaxed);
            let id = HostSessionId(format!("proc-{host_pid}-{n}"));
            let session_dir = self.base_status_dir.join(id.as_str());
            let status_path = session_dir.join("status");
            sentinel::validate_status_path(&status_path)?;
            std::fs::create_dir_all(&self.base_status_dir)
                .map_err(|e| HostError::spawn_failed(format!("creating base status dir: {e}")))?;
            match std::fs::create_dir(&session_dir) {
                Ok(()) => break (id, status_path),
                Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => continue,
                Err(e) => {
                    return Err(HostError::spawn_failed(format!(
                        "creating session status dir: {e}"
                    )))
                }
            }
        };

        let prepared = PreparedSession::new(id.clone(), status_path.clone(), None, self.instance);
        self.prepared.lock().await.insert(
            id,
            PreparedProcSession {
                token: prepared.token(),
                cwd: cwd.to_path_buf(),
                shell_line: shell_line.to_string(),
                env: env.clone(),
                status_path,
            },
        );
        Ok(prepared)
    }

    async fn start(&self, prepared: PreparedSession) -> Result<HostSessionId, HostError> {
        if !prepared.issued_by(self.instance) {
            return Err(HostError::session_not_found(prepared.id()));
        }
        let id = prepared.id().clone();
        let pending = {
            let mut sessions = self.prepared.lock().await;
            let matches = sessions.get(&id).is_some_and(|pending| {
                pending.token == prepared.token()
                    && pending.status_path == prepared.sentinel_path()
                    && prepared.herdr_identity().is_none()
            });
            if !matches {
                return Err(HostError::session_not_found(&id));
            }
            sessions
                .remove(&id)
                .expect("matching prepared process disappeared under lock")
        };

        let full_line = sentinel::append_sentinel(&pending.shell_line, &pending.status_path);
        let mut command = tokio::process::Command::new("/bin/sh");
        command
            .arg("-c")
            .arg(&full_line)
            .current_dir(&pending.cwd)
            .envs(&pending.env);
        // SAFETY: setsid is async-signal-safe; the closure does nothing else.
        unsafe {
            command.pre_exec(|| {
                nix::unistd::setsid()
                    .map_err(|errno| std::io::Error::from_raw_os_error(errno as i32))?;
                Ok(())
            });
        }
        let mut child = match command.spawn() {
            Ok(child) => child,
            Err(error) => {
                Self::remove_empty_status_dir(&pending.status_path);
                return Err(HostError::spawn_failed(format!(
                    "spawning /bin/sh: {error}"
                )));
            }
        };
        let Some(pid) = child.id() else {
            let _ = child.kill().await;
            Self::remove_empty_status_dir(&pending.status_path);
            return Err(HostError::spawn_failed("spawned child has no pid"));
        };
        let identity = ProcessIdentity::capture(pid).await;

        let mut sessions = self.sessions.lock().await;
        sessions.insert(
            id.clone(),
            ProcSession {
                child,
                pid,
                identity,
                status_path: pending.status_path,
            },
        );
        Ok(id)
    }

    async fn rollback_prepared(&self, prepared: PreparedSession) {
        if !prepared.issued_by(self.instance) {
            return;
        }
        let id = prepared.id().clone();
        let removed = {
            let mut sessions = self.prepared.lock().await;
            let matches = sessions.get(&id).is_some_and(|pending| {
                pending.token == prepared.token()
                    && pending.status_path == prepared.sentinel_path()
                    && prepared.herdr_identity().is_none()
            });
            if matches {
                sessions.remove(&id)
            } else {
                None
            }
        };
        if let Some(pending) = removed {
            Self::remove_empty_status_dir(&pending.status_path);
        }
    }

    async fn alive(&self, id: &HostSessionId) -> Result<Liveness, HostError> {
        // Status file first; reap the exited child while we're at it.
        let (status_path, identity, child_state) = {
            let mut sessions = self.sessions.lock().await;
            let session = sessions
                .get_mut(id)
                .ok_or_else(|| HostError::session_not_found(id))?;
            if let Some(code) = sentinel::read_status(&session.status_path)? {
                let _ = session.child.try_wait();
                return Ok(Liveness::Exited(code));
            }
            let child_state = session.child.try_wait();
            (
                session.status_path.clone(),
                session.identity.clone(),
                child_state,
            )
        };

        let dead = match child_state {
            Ok(Some(_)) => true,
            Ok(None) => false,
            Err(_) => match identity {
                Some(identity) => !identity.is_same_process().await?,
                None => false,
            },
        };
        if !dead {
            return Ok(Liveness::Running);
        }

        // Dead observation with no status file seen: re-read ONCE before
        // concluding Vanished — the sentinel may have landed in between.
        match sentinel::read_status(&status_path)? {
            Some(code) => {
                let mut sessions = self.sessions.lock().await;
                if let Some(session) = sessions.get_mut(id) {
                    let _ = session.child.try_wait();
                }
                Ok(Liveness::Exited(code))
            }
            None => Ok(Liveness::Vanished),
        }
    }

    async fn kill_confirmed(&self, id: &HostSessionId) -> Result<Confirmed, HostError> {
        // Entry check: death already verified → AlreadyDead.
        if self.probe_dead(id).await? {
            return Ok(Confirmed::AlreadyDead);
        }
        let pgid = {
            let sessions = self.sessions.lock().await;
            let session = sessions
                .get(id)
                .ok_or_else(|| HostError::session_not_found(id))?;
            Pid::from_raw(session.pid as i32)
        };

        // SIGTERM the group; ESRCH means it is already gone — the poll
        // below verifies either way. Never confirm on signal-send success.
        let _ = killpg(pgid, Signal::SIGTERM);
        for _ in 0..TERM_POLLS {
            if self.probe_dead(id).await? {
                return Ok(Confirmed::Killed);
            }
            tokio::time::sleep(POLL_INTERVAL).await;
        }

        let _ = killpg(pgid, Signal::SIGKILL);
        for _ in 0..KILL_POLLS {
            if self.probe_dead(id).await? {
                return Ok(Confirmed::Killed);
            }
            tokio::time::sleep(POLL_INTERVAL).await;
        }
        Err(HostError::KillVerifyTimeout)
    }

    /// Nothing to release: a plain process owns no terminal. The session
    /// entry stays, per the trait's retention contract, so a later `alive`
    /// still answers from the sentinel.
    async fn release(&self, _id: &HostSessionId) {}

    fn attach_hint(&self, _id: &HostSessionId) -> Option<String> {
        None
    }
}
