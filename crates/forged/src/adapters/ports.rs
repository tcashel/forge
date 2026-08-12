//! The wave-4 `ReconcilePorts` implementation: thin pass-throughs onto the
//! merged wave-2 crates, plus the claimant-to-process resolution the proto
//! crate deliberately does not own.
//!
//! Identity model (operator-adjudicated): the bd lease holder is the
//! DRIVER's — one lease per slice, shared by every attempt of the run — and
//! per-attempt session identity is the packet directory's `provider.pid`
//! file plus the attempt row that names it. The two are deliberately
//! different strings: `attempts.claimant` carries
//! [`crate::core::session_claimant`], scoped to the packet, so the `session`
//! this adapter receives resolves to exactly ONE attempt and one packet
//! directory. Aggregating by the shared lease holder instead would let one
//! Review leg report its sibling's liveness and let revoking one leg kill
//! both providers. The lease holder is recovered from the session only at
//! the `reclaim_lease` seam, where bd is the one that needs it.
//!
//! A process that spawned an attempt holds its `HostSessionId` and asks the
//! host; any other process reads the pid file, which under `ProcessHost`'s
//! `setsid` is also the process-group id kills signal. The probe order
//! mirrors the host's documented ladder: the sentinel status file FIRST (it
//! is the only exit truth — a written status file means `Exited` whatever
//! the pid says), then the pid, and a signal only after the pid's identity
//! is verified against the start time captured at spawn. A packet directory
//! with no `provider.pid` is a spawn that never happened: `Vanished`, never
//! success.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Duration;

use forged_gate::GateRequest;
use forged_git::GhClient;
use forged_host::{HostSessionId, Liveness, SessionHost};
use forged_ledger::{AttemptRow, Ledger};
use forged_proto::{
    KillOutcome, LeaseReclaim, PortError, PrSnapshot, ReconcilePorts, ResolveState, SessionLiveness,
};
use forged_types::GateRow;
use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use serde_json::Value;

use crate::config::ForgedConfig;
use crate::failpoint;

/// A spawned session: the host that issued the id, plus the id — session
/// ids are valid only within the host instance that issued them.
type OwnedSession = (Arc<dyn SessionHost>, HostSessionId);

/// The concrete ports adapter.
pub struct ForgedPorts {
    ledger: Ledger,
    config: ForgedConfig,
    gh: GhClient,
    /// Sessions this process spawned, per attempt id.
    sessions: tokio::sync::Mutex<HashMap<i64, OwnedSession>>,
}

impl ForgedPorts {
    /// Build the adapter over an open ledger and the once-read config.
    pub fn new(ledger: Ledger, config: ForgedConfig) -> Self {
        ForgedPorts {
            ledger,
            config,
            gh: GhClient::new(),
            sessions: tokio::sync::Mutex::new(HashMap::new()),
        }
    }

    /// Record the session this process spawned for an attempt.
    pub async fn adopt_session(
        &self,
        attempt_id: i64,
        host: Arc<dyn SessionHost>,
        session: HostSessionId,
    ) {
        self.sessions
            .lock()
            .await
            .insert(attempt_id, (host, session));
    }

    async fn on_ledger<T, F>(&self, f: F) -> Result<T, PortError>
    where
        T: Send + 'static,
        F: FnOnce(&Ledger) -> Result<T, forged_ledger::LedgerError> + Send + 'static,
    {
        let handle = self.ledger.clone();
        tokio::task::spawn_blocking(move || f(&handle))
            .await
            .map_err(|e| PortError::Internal(format!("join failure: {e}")))?
            .map_err(|e| PortError::Internal(e.to_string()))
    }

    /// The ONE live (running or revoking) attempt whose claimant is
    /// `session`. A session claimant is packet-scoped and `claim_packet`
    /// refuses a second live attempt on a packet, so this is single-valued
    /// by construction; the newest row wins if a ledger ever disagrees.
    async fn attempt_for(&self, session: &str) -> Result<Option<AttemptRow>, PortError> {
        let live = self.on_ledger(|l| l.list_live_attempts(None)).await?;
        Ok(live
            .into_iter()
            .filter(|a| a.claimant == session)
            .max_by_key(|a| a.attempt_id))
    }

    fn packet_dir_of(&self, packet_id: &str) -> Result<PathBuf, PortError> {
        let (run_id, stage, seq) =
            crate::core::split_packet_id(packet_id).map_err(|f| PortError::Internal(f.message))?;
        Ok(self.config.packet_dir(&run_id, stage, seq))
    }

    /// One attempt's liveness, resolved per the identity model.
    async fn attempt_liveness(&self, attempt: &AttemptRow) -> Result<SessionLiveness, PortError> {
        let owned = self.sessions.lock().await.get(&attempt.attempt_id).cloned();
        if let Some((host, session)) = owned {
            let live = host
                .alive(&session)
                .await
                .map_err(|e| PortError::Unavailable(e.to_string()))?;
            return Ok(match live {
                Liveness::Running => SessionLiveness::Running,
                Liveness::Exited(code) => SessionLiveness::Exited(code),
                Liveness::Vanished => SessionLiveness::Vanished,
            });
        }
        let dir = self.packet_dir_of(&attempt.packet_id)?;
        // The sentinel FIRST: it is the only exit truth, so a written status
        // file means Exited no matter what the pid reads as — a recycled pid
        // must never resurrect a session that already reported its code.
        if let Some(code) = read_sentinel_code(&dir, attempt.attempt_id) {
            return Ok(SessionLiveness::Exited(code));
        }
        let Some(pid) = read_pid(&dir) else {
            // A spawn that never happened.
            return Ok(SessionLiveness::Vanished);
        };
        // Only then the pid, guarded against reuse. An unverifiable identity
        // never produces a death verdict — the same fail-safe direction the
        // host's comparator takes when its capture came back empty.
        if pid_alive(pid) && pid_identity(&dir, pid).await != PidIdentity::Recycled {
            return Ok(SessionLiveness::Running);
        }
        // Dead with no status file seen: re-read ONCE before concluding
        // Vanished — the sentinel may have landed in between.
        match read_sentinel_code(&dir, attempt.attempt_id) {
            Some(code) => Ok(SessionLiveness::Exited(code)),
            None => Ok(SessionLiveness::Vanished),
        }
    }

    /// Whether this attempt's session is verifiably over: the sentinel
    /// landed, the pid is gone, or the pid now names a different process.
    /// Re-checked before every signal escalation.
    async fn attempt_settled(&self, dir: &Path, attempt_id: i64, pid: i32) -> bool {
        read_sentinel_code(dir, attempt_id).is_some()
            || !pid_alive(pid)
            || pid_identity(dir, pid).await == PidIdentity::Recycled
    }

    /// Kill one attempt's session and verify death.
    async fn attempt_kill(&self, attempt: &AttemptRow) -> Result<KillOutcome, PortError> {
        let owned = self.sessions.lock().await.get(&attempt.attempt_id).cloned();
        if let Some((host, session)) = owned {
            return match host.kill_confirmed(&session).await {
                Ok(forged_host::Confirmed::Killed) => Ok(KillOutcome::Killed),
                Ok(forged_host::Confirmed::AlreadyDead) => Ok(KillOutcome::AlreadyDead),
                Err(e) => Err(PortError::Unavailable(e.to_string())),
            };
        }
        let dir = self.packet_dir_of(&attempt.packet_id)?;
        let attempt_id = attempt.attempt_id;
        // The sentinel FIRST, before any signal: a written status file means
        // the session already exited, so there is nothing to kill and the
        // recorded pid may since have been recycled onto a stranger.
        if read_sentinel_code(&dir, attempt_id).is_some() {
            return Ok(KillOutcome::AlreadyDead);
        }
        let Some(pid) = read_pid(&dir) else {
            return Ok(KillOutcome::AlreadyDead);
        };
        if !pid_alive(pid) {
            return Ok(KillOutcome::AlreadyDead);
        }
        // No signal until the pid is verifiably still OUR process. A
        // recycled pid means the session we were asked to kill is already
        // dead; an unverifiable one is refused rather than guessed at —
        // signalling a process we cannot identify is exactly the harm the
        // guard exists to prevent, and proto resumes from the durable
        // `revoking` marker on the next pass.
        match pid_identity(&dir, pid).await {
            PidIdentity::Recycled => return Ok(KillOutcome::AlreadyDead),
            PidIdentity::Unverifiable => {
                return Err(PortError::Unavailable(format!(
                    "attempt {attempt_id}: pid {pid} has no recorded start time; refusing to \
                     signal a process whose identity cannot be verified"
                )))
            }
            PidIdentity::Same => {}
        }
        // The pid is the setsid leader, so it doubles as the process-group
        // id. TERM first, then KILL; success only on verified death, and the
        // sentinel is re-consulted before the escalation.
        let pgid = Pid::from_raw(pid);
        let _ = killpg(pgid, Signal::SIGTERM);
        for _ in 0..50 {
            if self.attempt_settled(&dir, attempt_id, pid).await {
                return Ok(KillOutcome::Killed);
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        if self.attempt_settled(&dir, attempt_id, pid).await {
            return Ok(KillOutcome::Killed);
        }
        let _ = killpg(pgid, Signal::SIGKILL);
        for _ in 0..20 {
            if self.attempt_settled(&dir, attempt_id, pid).await {
                return Ok(KillOutcome::Killed);
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        Err(PortError::Unavailable(format!(
            "kill sent to pgid {pid} but death was never verified"
        )))
    }

    async fn run_row(&self, run_id: &str) -> Result<forged_ledger::RunRow, PortError> {
        let run_id = run_id.to_owned();
        self.on_ledger(move |l| l.get_run(&run_id)).await
    }
}

/// The start-time stamp written beside `provider.pid` at spawn — the
/// out-of-process half of the host's pid-reuse guard.
pub const PROVIDER_LSTART: &str = "provider.lstart";

/// Read `<packet_dir>/provider.pid`.
fn read_pid(packet_dir: &Path) -> Option<i32> {
    let text = std::fs::read_to_string(packet_dir.join("provider.pid")).ok()?;
    text.trim().parse::<i32>().ok()
}

/// What a pid's start time says about whether it is still the process the
/// attempt spawned.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum PidIdentity {
    /// `ps` resolves the pid and its start time is unchanged.
    Same,
    /// The pid is gone, or it now names a process that started later — the
    /// original is dead either way.
    Recycled,
    /// No start time was recorded (or `ps` itself could not run), so nothing
    /// can be concluded. Never a death verdict; never a licence to signal.
    Unverifiable,
}

/// `ps -p <pid> -o lstart=`, trimmed. `None` distinguishes nothing here:
/// callers treat a missing answer as "the pid does not resolve".
pub async fn lstart_of(pid: i32) -> Option<String> {
    let out = tokio::process::Command::new("ps")
        .args(["-p", &pid.to_string(), "-o", "lstart="])
        .stdin(std::process::Stdio::null())
        .output()
        .await
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let lstart = String::from_utf8_lossy(&out.stdout).trim().to_owned();
    (!lstart.is_empty()).then_some(lstart)
}

/// Compare a pid against the start time captured when the attempt spawned
/// it, mirroring `forged_host`'s in-process `ProcessIdentity` comparator
/// for the processes this one did not spawn.
async fn pid_identity(packet_dir: &Path, pid: i32) -> PidIdentity {
    let Ok(recorded) = std::fs::read_to_string(packet_dir.join(PROVIDER_LSTART)) else {
        return PidIdentity::Unverifiable;
    };
    let recorded = recorded.trim().to_owned();
    if recorded.is_empty() {
        return PidIdentity::Unverifiable;
    }
    match lstart_of(pid).await {
        Some(current) if current == recorded => PidIdentity::Same,
        Some(_) | None => PidIdentity::Recycled,
    }
}

/// Whether `pid` names a live process (signal 0 probe; a permission refusal
/// counts as alive — the process exists).
fn pid_alive(pid: i32) -> bool {
    match nix::sys::signal::kill(Pid::from_raw(pid), None) {
        Ok(()) => true,
        Err(nix::errno::Errno::EPERM) => true,
        Err(_) => false,
    }
}

/// The bd lease holder behind a per-attempt session claimant: the run's
/// one lease, derived from the packet the session names. `None` when the
/// string is not a session claimant — then it is already whatever identity
/// the caller meant, and is used verbatim.
fn lease_holder_of(session: &str) -> Option<String> {
    let packet_id = crate::core::packet_of_session(session)?;
    let (run_id, _, _) = crate::core::split_packet_id(packet_id).ok()?;
    Some(crate::core::run_holder(&run_id))
}

/// Find the attempt's sentinel status file under
/// `<packet_dir>/status/<attempt_id>/<session>/status` — the only exit-code
/// truth.
fn read_sentinel_code(packet_dir: &Path, attempt_id: i64) -> Option<i32> {
    let base = packet_dir.join("status").join(attempt_id.to_string());
    let entries = std::fs::read_dir(&base).ok()?;
    for entry in entries.flatten() {
        let status = entry.path().join("status");
        if let Ok(text) = std::fs::read_to_string(&status) {
            if let Ok(code) = text.trim().parse::<i32>() {
                return Some(code);
            }
        }
    }
    None
}

/// Derive the GitHub `owner/name` slug from a checkout's `origin` remote —
/// a pure function of the stored absolute path; no sidecar file.
pub async fn repo_slug(repo: &Path) -> Result<String, PortError> {
    let out = tokio::process::Command::new("git")
        .arg("-C")
        .arg(repo)
        .args(["remote", "get-url", "origin"])
        .stdin(std::process::Stdio::null())
        .output()
        .await
        .map_err(|e| PortError::Unavailable(format!("git remote get-url: {e}")))?;
    if !out.status.success() {
        return Err(PortError::Refused(format!(
            "git remote get-url origin: {}",
            String::from_utf8_lossy(&out.stderr)
        )));
    }
    let url = String::from_utf8_lossy(&out.stdout).trim().to_owned();
    Ok(slug_from_url(&url))
}

/// Parse `owner/name` out of the known remote-url shapes, falling back to
/// the last two path components so hermetic local-path remotes still
/// resolve to a stable slug.
pub fn slug_from_url(url: &str) -> String {
    let trimmed = url.strip_suffix(".git").unwrap_or(url);
    let after_colon = match trimmed.rsplit_once(':') {
        Some((head, tail)) if !head.starts_with("http") => tail,
        _ => trimmed,
    };
    let parts: Vec<&str> = after_colon.split('/').filter(|p| !p.is_empty()).collect();
    match parts.as_slice() {
        [.., owner, name] => format!("{owner}/{name}"),
        [name] => (*name).to_owned(),
        [] => trimmed.to_owned(),
    }
}

#[async_trait::async_trait]
impl ReconcilePorts for ForgedPorts {
    async fn liveness(&self, session: &str) -> Result<SessionLiveness, PortError> {
        // ONE attempt, never an aggregate: a sibling Review leg running
        // under the same run must not answer for this one.
        match self.attempt_for(session).await? {
            Some(attempt) => self.attempt_liveness(&attempt).await,
            None => Ok(SessionLiveness::Vanished),
        }
    }

    async fn kill_confirmed(&self, session: &str) -> Result<KillOutcome, PortError> {
        match self.attempt_for(session).await? {
            Some(attempt) => self.attempt_kill(&attempt).await,
            None => Ok(KillOutcome::AlreadyDead),
        }
    }

    async fn reclaim_lease(
        &self,
        bead: &str,
        holder: &str,
        older_than_s: u64,
    ) -> Result<LeaseReclaim, PortError> {
        // `holder` is the attempt's claimant verbatim — per-attempt session
        // identity. bd knows only the OTHER layer: the run's one lease,
        // taken under the driver's lease holder. The scoped reclaim must
        // therefore name that identity, and the answer is reported back in
        // the vocabulary the caller used, so a caller comparing
        // `previous_owner` against the claimant it passed reads a truthful
        // "the lease was taken from the identity you named". A holder that
        // is not a session claimant passes through untouched.
        let lease_holder = lease_holder_of(holder);
        let bd_holder = lease_holder.as_deref().unwrap_or(holder);
        let bd = self.config.bd_config();
        failpoint::hit("bd.reclaim.before");
        let outcome = forged_beads::reclaim(&bd, bead, bd_holder, older_than_s)
            .await
            .map_err(|e| PortError::Unavailable(e.to_string()))?;
        failpoint::hit("bd.reclaim.after");
        Ok(LeaseReclaim {
            scoped: outcome.scoped,
            previous_owner: outcome.previous_owner.map(|owner| {
                if owner == bd_holder {
                    holder.to_owned()
                } else {
                    owner
                }
            }),
        })
    }

    async fn commits_ahead(&self, run_id: &str) -> Result<u32, PortError> {
        let run = self.run_row(run_id).await?;
        let worktree = self.config.worktree(run_id);
        let range = format!("refs/remotes/origin/{}..HEAD", run.base_ref);
        let out = tokio::process::Command::new("git")
            .arg("-C")
            .arg(&worktree)
            .args(["rev-list", "--count", &range])
            .stdin(std::process::Stdio::null())
            .output()
            .await
            .map_err(|e| PortError::Unavailable(format!("git rev-list: {e}")))?;
        if !out.status.success() {
            return Err(PortError::Refused(format!(
                "git rev-list {range}: {}",
                String::from_utf8_lossy(&out.stderr)
            )));
        }
        String::from_utf8_lossy(&out.stdout)
            .trim()
            .parse::<u32>()
            .map_err(|e| PortError::Internal(format!("unparseable rev-list count: {e}")))
    }

    async fn rerun_gates(
        &self,
        run_id: &str,
        commands: &[String],
    ) -> Result<Vec<GateRow>, PortError> {
        let worktree = self.config.worktree(run_id);
        let artifacts = self
            .config
            .run_dir(run_id)
            .join("artifacts")
            .join(format!("reconcile-{}", uuid::Uuid::now_v7()));
        let request = GateRequest::new(commands.to_vec(), worktree, artifacts);
        let outcome = forged_gate::run_gates(&request)
            .await
            .map_err(|e| PortError::Refused(e.to_string()))?;
        Ok(outcome.rows)
    }

    async fn quarantine(
        &self,
        run_id: &str,
        attempt_id: i64,
        name: &str,
        body: &[u8],
    ) -> Result<(), PortError> {
        // `name` is a bare file name, never a path.
        if name.is_empty() || name.contains('/') || name.contains('\\') || name.contains("..") {
            return Err(PortError::Refused(format!(
                "quarantine name {name:?} is not a bare file name"
            )));
        }
        let dir = self
            .config
            .run_dir(run_id)
            .join("quarantine")
            .join(attempt_id.to_string());
        std::fs::create_dir_all(&dir)
            .map_err(|e| PortError::Internal(format!("creating {}: {e}", dir.display())))?;
        std::fs::write(dir.join(name), body)
            .map_err(|e| PortError::Internal(format!("writing quarantine {name}: {e}")))?;
        Ok(())
    }

    async fn resolve_state(&self, run_id: &str) -> Result<ResolveState, PortError> {
        let run = self.run_row(run_id).await?;
        let worktree_present = self.config.worktree(run_id).exists();
        let bd = self.config.bd_config();
        let lease_holder = forged_beads::lease_holder(&bd, &run.bead_id)
            .await
            .map_err(|e| PortError::Unavailable(e.to_string()))?;
        Ok(ResolveState {
            worktree_present,
            lease_holder,
        })
    }

    async fn pr_for_head(
        &self,
        repo: &str,
        head: &str,
        base: &str,
    ) -> Result<Option<PrSnapshot>, PortError> {
        let slug = repo_slug(Path::new(repo)).await?;
        failpoint::hit("gh.call.before");
        let pr = self
            .gh
            .pr_list_head(&slug, head, base)
            .await
            .map_err(|e| PortError::Unavailable(e.to_string()))?;
        failpoint::hit("gh.call.after");
        Ok(pr.map(|p| PrSnapshot {
            number: p.number,
            is_draft: p.is_draft,
            base_ref_name: p.base_ref_name,
            head_ref_name: p.head_ref_name,
            url: p.url,
        }))
    }

    async fn remote_sha(&self, run_id: &str, branch: &str) -> Result<Option<String>, PortError> {
        let run = self.run_row(run_id).await?;
        let refspec = format!("refs/heads/{branch}");
        let out = tokio::process::Command::new("git")
            .arg("-C")
            .arg(&run.repo)
            .args(["ls-remote", "origin", &refspec])
            .stdin(std::process::Stdio::null())
            .output()
            .await
            .map_err(|e| PortError::Unavailable(format!("git ls-remote: {e}")))?;
        if !out.status.success() {
            return Err(PortError::Unavailable(format!(
                "git ls-remote origin {refspec}: {}",
                String::from_utf8_lossy(&out.stderr)
            )));
        }
        let stdout = String::from_utf8_lossy(&out.stdout);
        Ok(stdout
            .split_whitespace()
            .next()
            .filter(|sha| !sha.is_empty())
            .map(str::to_owned))
    }
}

/// Serialize a `ReconcileReport` for the wire.
pub fn report_json(report: &forged_proto::ReconcileReport) -> Value {
    serde_json::json!({
        "leftRunning": report.left_running,
        "reclaimed": report.reclaimed,
        "released": report.released,
        "observed": report.observed,
        "quarantined": report.quarantined,
        "harvestMismatches": report.harvest_mismatches,
        "deferred": report.deferred,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_session_claimant_resolves_to_one_packet_and_the_runs_lease_holder() {
        // The two identity layers: the claimant names the attempt's packet,
        // and only the bd seam translates it back to the run's one lease.
        let session = crate::core::session_claimant("run-1/reviewcodex/2");
        assert_eq!(session, "forged:run-1/reviewcodex/2:0");
        assert_eq!(
            crate::core::packet_of_session(&session),
            Some("run-1/reviewcodex/2")
        );
        assert_eq!(
            lease_holder_of(&session).as_deref(),
            Some("forged:run-1:0"),
            "both Review legs of a run reclaim under the ONE lease holder"
        );
        // The sibling leg is a different session but the same lease holder.
        let sibling = crate::core::session_claimant("run-1/reviewclaude/2");
        assert_ne!(sibling, session);
        assert_eq!(lease_holder_of(&sibling), lease_holder_of(&session));
        // Anything that is not a session claimant is used verbatim.
        assert_eq!(lease_holder_of("someone-else:host:99"), None);
        assert_eq!(lease_holder_of("forged:run-1:0"), None);
    }

    #[test]
    fn slug_parses_the_known_remote_shapes() {
        assert_eq!(
            slug_from_url("git@github.com:tcashel/forge.git"),
            "tcashel/forge"
        );
        assert_eq!(
            slug_from_url("https://github.com/tcashel/forge"),
            "tcashel/forge"
        );
        assert_eq!(
            slug_from_url("https://github.com/tcashel/forge.git"),
            "tcashel/forge"
        );
        // Hermetic local-path remotes resolve to their last two components.
        assert_eq!(slug_from_url("/tmp/root/origin"), "root/origin");
    }
}
