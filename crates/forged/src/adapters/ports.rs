//! The wave-4 `ReconcilePorts` implementation: thin pass-throughs onto the
//! merged wave-2 crates, plus the claimant-to-process resolution the proto
//! crate deliberately does not own.
//!
//! Identity model (operator-adjudicated): the work lease holder is the
//! DRIVER's — one lease per slice, shared by every attempt of the run, and
//! ONE string across every process that touches it
//! ([`crate::core::lease_identity`]) — and per-attempt session identity is
//! the packet directory's `provider.pid` file plus the attempt row that
//! names it. The two are deliberately different strings:
//! `attempts.claimant` carries [`crate::core::session_claimant`], scoped to
//! the packet, so the `session` this adapter receives resolves to exactly
//! ONE attempt and one attempt directory. Aggregating by the shared lease
//! holder instead would let one Review leg report its sibling's liveness and
//! let revoking one leg kill both providers. The lease holder is recovered
//! from the session only at the `reclaim_lease` seam, where bd is the one
//! that needs it.
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
//!
//! An identity that never materializes AT ALL is the adjudicated bounded
//! orphan. Inside `IDENTITY_GRACE_S` the port defers; past it the attempt is
//! settled as a transport failure carrying `ORPHAN_NOTE`, and never answered
//! with `PortError::Unavailable` — see `ForgedPorts::fail_unidentifiable`
//! for the containment argument.

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
use forged_provider::PacketDirs;
use forged_types::GateRow;
use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use serde_json::Value;

use crate::config::ForgedConfig;
use crate::failpoint;

/// A spawned session: the host that issued the id, plus the id — session
/// ids are valid only within the host instance that issued them.
type OwnedSession = (Arc<dyn SessionHost>, HostSessionId);

#[derive(Debug, Clone)]
enum SentinelRoute {
    /// Migration-014 ownership or a schema-v2 ProcessHost event.
    Exact(PathBuf),
    /// A pre-migration session event explicitly authorizes compatibility
    /// scanning. New missing metadata never falls into this arm.
    Legacy,
    /// No durable status-path evidence exists.
    Absent,
}

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
        let (run_id, stage_key, seq) =
            crate::core::split_packet_key(packet_id).map_err(|f| PortError::Internal(f.message))?;
        Ok(self.config.packet_dir_key(&run_id, &stage_key, seq))
    }

    /// New attempts keep process identity inside their immutable attempt
    /// directory. A missing attempt directory identifies a pre-manifest
    /// legacy packet whose runtime files remain at packet level.
    fn runtime_dir_of(&self, attempt: &AttemptRow) -> Result<PathBuf, PortError> {
        let packet_dir = self.packet_dir_of(&attempt.packet_id)?;
        let attempt_dir = PacketDirs::new(&packet_dir, attempt.attempt_id).attempt_path();
        Ok(if attempt_dir.exists() {
            attempt_dir
        } else {
            packet_dir
        })
    }

    /// Whether an attempt's process identity is past the window in which it
    /// could still be materializing.
    ///
    /// The driver writes `provider.pid` (from the spawned shell itself) and
    /// `provider.lstart` within a second or two of the spawn. Inside that
    /// window a missing stamp means "the spawn is still in flight"; past it,
    /// the only thing that writes those files is gone, so no later pass will
    /// ever find them.
    fn identity_grace_elapsed(&self, attempt: &AttemptRow) -> bool {
        let anchor = attempt
            .last_heartbeat_at
            .as_deref()
            .unwrap_or(&attempt.started_at);
        let (Ok(anchor), Ok(now)) = (
            anchor.parse::<jiff::Timestamp>(),
            crate::config::now_iso().parse::<jiff::Timestamp>(),
        ) else {
            // An unparseable stamp is not evidence that the window is still
            // open; treat the identity as never established rather than
            // holding the attempt hostage to a bad row.
            return true;
        };
        now.as_second().saturating_sub(anchor.as_second()) > IDENTITY_GRACE_S
    }

    async fn sentinel_route(&self, attempt: &AttemptRow) -> Result<SentinelRoute, PortError> {
        let attempt_id = attempt.attempt_id;
        let claim_token = attempt.claim_token.clone();
        if let Some(owned) = self
            .on_ledger(move |ledger| ledger.find_owned_herdr_attempt(attempt_id, &claim_token))
            .await?
        {
            return Ok(SentinelRoute::Exact(PathBuf::from(owned.sentinel_path)));
        }

        let (run_id, _, _) = crate::core::split_packet_key(&attempt.packet_id)
            .map_err(|failure| PortError::Internal(failure.message))?;
        let events = self
            .on_ledger(move |ledger| ledger.list_events(Some(&run_id), 0, 65_536))
            .await?;
        let event = events.into_iter().rev().find_map(|row| {
            if row.kind != "forged.session.started" {
                return None;
            }
            let payload: Value = serde_json::from_str(&row.payload_json).ok()?;
            (payload.get("attemptId").and_then(Value::as_i64) == Some(attempt.attempt_id))
                .then_some(payload)
        });
        let Some(event) = event else {
            return Ok(SentinelRoute::Absent);
        };
        match event.get("schemaVersion").and_then(Value::as_u64) {
            None | Some(1) => Ok(SentinelRoute::Legacy),
            Some(2) => event
                .get("statusPath")
                .and_then(Value::as_str)
                .filter(|path| !path.is_empty())
                .map(|path| SentinelRoute::Exact(PathBuf::from(path)))
                .ok_or_else(|| {
                    PortError::Internal(format!(
                        "post-migration attempt {} has no exact sentinel path",
                        attempt.attempt_id
                    ))
                }),
            Some(other) => Err(PortError::Internal(format!(
                "attempt {} has unsupported session schema version {other}",
                attempt.attempt_id
            ))),
        }
    }

    /// Settle an attempt whose process identity was never established: fail
    /// it as a TRANSPORT failure with the pinned note, so the packet reopens
    /// on the transport-retry budget.
    ///
    /// This is the reconcile half of the bounded-orphan containment the
    /// operator adjudicated (2026-08-12). A crash between the host spawn and
    /// the shell writing `provider.pid` can leave a provider process no
    /// later process can name, and therefore cannot kill. The residual is
    /// accepted because it is contained: the orphan never heartbeats, so the
    /// work lease lapses and the packet is reclaimed, and its eventual result
    /// is fenced by a claim token that is no longer live, so it is
    /// quarantined rather than landed. What must NOT happen is the port
    /// answering `Unavailable` — that aborts the whole reconcile pass and
    /// wedges the attempt in `running`/`revoking` forever, which is exactly
    /// the failure this path exists to rule out.
    async fn fail_unidentifiable(&self, attempt: &AttemptRow) {
        let packet_id = attempt.packet_id.clone();
        let token = attempt.claim_token.clone();
        let _ = self
            .on_ledger(move |l| {
                l.fail_packet(&packet_id, &token, ORPHAN_NOTE)
                    // A row that already settled (revoking, failed, or won
                    // by a racing reconciler) needs no settling from us.
                    .or(Ok(()))
            })
            .await;
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
        let dir = self.runtime_dir_of(attempt)?;
        let sentinel = self.sentinel_route(attempt).await?;
        // The sentinel FIRST: it is the only exit truth, so a written status
        // file means Exited no matter what the pid reads as — a recycled pid
        // must never resurrect a session that already reported its code.
        if let Some(code) = read_routed_sentinel(&sentinel, &dir, attempt.attempt_id) {
            return Ok(SessionLiveness::Exited(code));
        }
        let Some(pid) = read_pid(&dir) else {
            // A spawn that never happened — or one whose shell died before
            // it could say so. Past the grace window the attempt is settled
            // as a transport failure rather than left for a kill that can
            // never be aimed.
            if self.identity_grace_elapsed(attempt) {
                self.fail_unidentifiable(attempt).await;
            }
            return Ok(SessionLiveness::Vanished);
        };
        // Only then the pid, guarded against reuse. An unverifiable identity
        // never produces a death verdict inside the grace window — the same
        // fail-safe direction the host's comparator takes when its capture
        // came back empty. Past it, the start stamp is never coming, so the
        // attempt is settled instead of reported live forever.
        match pid_identity(&dir, pid).await {
            PidIdentity::Unverifiable if self.identity_grace_elapsed(attempt) => {
                self.fail_unidentifiable(attempt).await;
                return Ok(SessionLiveness::Vanished);
            }
            identity => {
                if pid_alive(pid) && identity != PidIdentity::Recycled {
                    return Ok(SessionLiveness::Running);
                }
            }
        }
        // Dead with no status file seen: re-read ONCE before concluding
        // Vanished — the sentinel may have landed in between.
        match read_routed_sentinel(&sentinel, &dir, attempt.attempt_id) {
            Some(code) => Ok(SessionLiveness::Exited(code)),
            None => Ok(SessionLiveness::Vanished),
        }
    }

    /// Whether this attempt's session is verifiably over: the sentinel
    /// landed, the pid is gone, or the pid now names a different process.
    /// Re-checked before every signal escalation.
    async fn attempt_settled(
        &self,
        dir: &Path,
        attempt_id: i64,
        pid: i32,
        sentinel: &SentinelRoute,
    ) -> bool {
        read_routed_sentinel(sentinel, dir, attempt_id).is_some()
            || !pid_alive(pid)
            || pid_identity(dir, pid).await == PidIdentity::Recycled
    }

    /// Kill one attempt's session and verify death.
    async fn attempt_kill(
        &self,
        attempt: &AttemptRow,
        termination_grace_s: u64,
    ) -> Result<KillOutcome, PortError> {
        let owned = self.sessions.lock().await.get(&attempt.attempt_id).cloned();
        if let Some((host, session)) = owned {
            return match host.kill_confirmed(&session).await {
                Ok(forged_host::Confirmed::Killed) => Ok(KillOutcome::Killed),
                Ok(forged_host::Confirmed::AlreadyDead) => Ok(KillOutcome::AlreadyDead),
                Err(e) => Err(PortError::Unavailable(e.to_string())),
            };
        }
        let dir = self.runtime_dir_of(attempt)?;
        let attempt_id = attempt.attempt_id;
        let sentinel = self.sentinel_route(attempt).await?;
        // The sentinel FIRST, before any signal: a written status file means
        // the session already exited, so there is nothing to kill and the
        // recorded pid may since have been recycled onto a stranger.
        if read_routed_sentinel(&sentinel, &dir, attempt_id).is_some() {
            return Ok(KillOutcome::AlreadyDead);
        }
        let Some(pid) = read_pid(&dir) else {
            if attempt.revoke_scope == Some(forged_ledger::RevokeScope::Deadline) {
                return Err(PortError::Unavailable(format!(
                    "deadline attempt {attempt_id} has no verifiable provider pid; retaining custody"
                )));
            }
            if self.identity_grace_elapsed(attempt) {
                self.fail_unidentifiable(attempt).await;
            }
            return Ok(KillOutcome::AlreadyDead);
        };
        if !pid_alive(pid) {
            return Ok(KillOutcome::AlreadyDead);
        }
        // No signal until the pid is verifiably still OUR process. A
        // recycled pid means the session we were asked to kill is already
        // dead; an unverifiable one is never signalled — signalling a
        // process we cannot identify is exactly the harm the guard exists to
        // prevent.
        //
        // Inside the grace window the start stamp may still be landing, so
        // the port defers (`Unavailable`) and proto resumes from the durable
        // `revoking` marker on the next pass. Past it the stamp is never
        // coming: this is the adjudicated bounded orphan, so the attempt is
        // failed as a transport failure and the kill reports the only honest
        // answer it has — there is nothing here it may signal. `Unavailable`
        // past the window would abort every reconcile pass of the run
        // forever.
        match pid_identity(&dir, pid).await {
            PidIdentity::Recycled => return Ok(KillOutcome::AlreadyDead),
            PidIdentity::Unverifiable => {
                if attempt.revoke_scope == Some(forged_ledger::RevokeScope::Deadline) {
                    return Err(PortError::Unavailable(format!(
                        "deadline attempt {attempt_id}: pid {pid} identity is unverifiable; retaining custody"
                    )));
                }
                if self.identity_grace_elapsed(attempt) {
                    self.fail_unidentifiable(attempt).await;
                    return Ok(KillOutcome::AlreadyDead);
                }
                return Err(PortError::Unavailable(format!(
                    "attempt {attempt_id}: pid {pid} has no recorded start time yet; deferring \
                     rather than signalling a process whose identity cannot be verified"
                )));
            }
            PidIdentity::Same => {}
        }
        // The pid is the setsid leader, so it doubles as the process-group
        // id. TERM first, then KILL; success only on verified death, and the
        // sentinel is re-consulted before the escalation.
        let pgid = Pid::from_raw(pid);
        let _ = killpg(pgid, Signal::SIGTERM);
        let grace = Duration::from_secs(termination_grace_s);
        let deadline = tokio::time::Instant::now() + grace;
        loop {
            if self.attempt_settled(&dir, attempt_id, pid, &sentinel).await {
                return Ok(KillOutcome::Killed);
            }
            let now = tokio::time::Instant::now();
            if now >= deadline {
                break;
            }
            tokio::time::sleep(Duration::from_millis(100).min(deadline - now)).await;
        }
        if self.attempt_settled(&dir, attempt_id, pid, &sentinel).await {
            return Ok(KillOutcome::Killed);
        }
        let _ = killpg(pgid, Signal::SIGKILL);
        let deadline = tokio::time::Instant::now() + grace;
        loop {
            if self.attempt_settled(&dir, attempt_id, pid, &sentinel).await {
                return Ok(KillOutcome::Killed);
            }
            let now = tokio::time::Instant::now();
            if now >= deadline {
                break;
            }
            tokio::time::sleep(Duration::from_millis(100).min(deadline - now)).await;
        }
        Err(PortError::Unavailable(format!(
            "kill sent to pgid {pid} but death was never verified"
        )))
    }

    /// Preserve bytes for a revocation/reclaim performed by a different
    /// controller process. Legacy packet-level captures cannot be assigned
    /// unambiguously to an earlier attempt and remain on the fallback path;
    /// an attempt directory is exact identity and is finalized before the
    /// terminal saga transition.
    async fn preserve_after_kill(&self, attempt: &AttemptRow) -> Result<(), PortError> {
        let packet_dir = self.packet_dir_of(&attempt.packet_id)?;
        let dirs = PacketDirs::new(&packet_dir, attempt.attempt_id);
        if !dirs.path().is_dir() || !dirs.prompt().is_file() {
            return Ok(());
        }
        let packet_id = attempt.packet_id.clone();
        let row = self
            .on_ledger(move |ledger| ledger.get_packet(&packet_id))
            .await?;
        let packet = forged_proto::stored_packet(&row).map_err(|error| {
            PortError::Internal(format!("stored packet does not parse: {error}"))
        })?;
        let ctx = crate::core::Ctx {
            config: self.config.clone(),
            ledger: self.ledger.clone(),
        };
        let (run_id, _, _) = crate::core::split_packet_key(&packet.packet_id)
            .map_err(|error| PortError::Internal(error.to_string()))?;
        let run_root = ctx.config.run_dir(&run_id);
        crate::core::artifacts::finalize_provider_files(&run_root, &dirs)
            .map_err(|error| PortError::Internal(error.to_string()))?;
        let output = crate::core::artifacts::read_output_text(&run_root, &dirs)
            .map_err(|error| PortError::Internal(error.to_string()))?;
        crate::core::usage::capture_attempt(
            &ctx,
            &run_id,
            &packet.packet_id,
            Some(attempt.attempt_id),
            &packet.provider_hints.provider,
            &packet.provider_hints.model,
            &output,
        )
        .await;
        let outcome = if attempt.revoke_scope == Some(forged_ledger::RevokeScope::Deadline) {
            "deadline"
        } else {
            "revoked"
        };
        crate::core::artifacts::materialize_and_join(
            &ctx,
            &packet,
            attempt.attempt_id,
            outcome,
            &serde_json::json!({
                "reason": attempt.revoke_reason,
                "scope": attempt.revoke_scope.map(|scope| scope.as_str()),
            }),
            &serde_json::json!({
                "recovered": true,
                "providerClaimant": attempt.claimant,
            }),
        )
        .await
        .map(|_| ())
        .map_err(|error| PortError::Internal(error.to_string()))
    }

    async fn run_row(&self, run_id: &str) -> Result<forged_ledger::RunRow, PortError> {
        let run_id = run_id.to_owned();
        self.on_ledger(move |l| l.get_run(&run_id)).await
    }

    /// The work lease holder behind a per-attempt session claimant: the ONE
    /// identity the run's lease is held under, for the run the session
    /// names. `None` when the string is not a session claimant — then it is
    /// already whatever identity the caller meant, and is used verbatim.
    async fn lease_holder_of(&self, work: &str, session: &str) -> Option<String> {
        let run_id = run_of_session(session)?;
        crate::core::lease_identity(&self.ledger, work, &run_id)
            .await
            .ok()
    }
}

/// The start-time stamp written beside `provider.pid` at spawn — the
/// out-of-process half of the host's pid-reuse guard.
pub const PROVIDER_LSTART: &str = "provider.lstart";

/// How long after an attempt's last sign of life its process identity may
/// still be materializing. Generous by an order of magnitude: the pid file
/// and its start stamp are written within a second or two of the spawn.
const IDENTITY_GRACE_S: i64 = 60;

/// The pinned note for an attempt whose provider identity never appeared —
/// `transport:`-prefixed, so the engine classifies it as a transport failure
/// and the packet reopens on the transport-retry budget.
const ORPHAN_NOTE: &str = "transport: provider identity never established";

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

/// Whether `session` is a per-attempt claimant, and if so the run it names.
fn run_of_session(session: &str) -> Option<String> {
    let packet_id = crate::core::packet_of_session(session)?;
    let (run_id, _, _) = crate::core::split_packet_key(packet_id).ok()?;
    Some(run_id)
}

/// Find the attempt's sentinel. New runtime dirs use
/// `<attempt>/status/<session>/status`; legacy packet dirs retain
/// `<packet>/status/<attempt>/<session>/status`.
fn read_sentinel_code(runtime_dir: &Path, attempt_id: i64) -> Option<i32> {
    for base in [
        runtime_dir.join("status"),
        runtime_dir.join("status").join(attempt_id.to_string()),
    ] {
        let Ok(entries) = std::fs::read_dir(base) else {
            continue;
        };
        for entry in entries.flatten() {
            let status = entry.path().join("status");
            if let Ok(text) = std::fs::read_to_string(&status) {
                if let Ok(code) = text.trim().parse::<i32>() {
                    return Some(code);
                }
            }
        }
    }
    None
}

fn read_exact_sentinel(path: &Path) -> Option<i32> {
    std::fs::read_to_string(path).ok()?.trim().parse().ok()
}

fn read_routed_sentinel(route: &SentinelRoute, runtime_dir: &Path, attempt_id: i64) -> Option<i32> {
    match route {
        SentinelRoute::Exact(path) => read_exact_sentinel(path),
        SentinelRoute::Legacy => read_sentinel_code(runtime_dir, attempt_id),
        SentinelRoute::Absent => None,
    }
}

/// The GitHub routing identity derived from one `origin` URL read.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GitHubRemote {
    pub slug: String,
    pub host: String,
    /// Whether the authority is reached over ssh, where `~/.ssh/config`
    /// aliasing applies to the hostname.
    pub ssh: bool,
}

const ACCEPTED_GITHUB_REMOTES: &str = "git@host:owner/repo(.git), \
ssh://user@host/owner/repo(.git), or https://host/owner/repo(.git)";

impl GitHubRemote {
    /// The host to pin gh children to. An https authority is a real
    /// hostname and always pins, dotted or not. A dotless ssh authority
    /// is an alias whose real API hostname only the operator's ssh config
    /// knows; pinning `GH_HOST` to the alias would break gh on setups the
    /// default-host resolution already serves, so it never pins.
    pub fn gh_host(&self) -> Option<&str> {
        (!self.ssh || self.host.contains('.')).then_some(self.host.as_str())
    }
}

/// Derive the GitHub slug and host from one raw `origin` URL read.
pub async fn github_remote(repo: &Path) -> Result<GitHubRemote, PortError> {
    let out = tokio::process::Command::new("git")
        .arg("-C")
        .arg(repo)
        .args(["config", "--get", "remote.origin.url"])
        .stdin(std::process::Stdio::null())
        .output()
        .await
        .map_err(|error| PortError::Gh(format!("reading origin remote URL: {error}")))?;
    if !out.status.success() {
        return Err(PortError::Gh(format!(
            "reading origin remote URL: {}",
            String::from_utf8_lossy(&out.stderr)
        )));
    }
    let url = String::from_utf8_lossy(&out.stdout).trim().to_owned();
    remote_from_url(&url)
}

/// Parse the GitHub `owner/name` slug from a supported remote URL.
#[allow(dead_code)]
pub fn slug_from_url(url: &str) -> Result<String, PortError> {
    Ok(remote_from_url(url)?.slug)
}

/// Parse the bare GitHub hostname from a supported remote URL.
#[allow(dead_code)]
pub fn host_from_url(url: &str) -> Result<String, PortError> {
    Ok(remote_from_url(url)?.host)
}

fn remote_from_url(url: &str) -> Result<GitHubRemote, PortError> {
    let trimmed = url.strip_suffix(".git").unwrap_or(url);
    let (host, path, ssh) = if let Some(rest) = trimmed.strip_prefix("ssh://") {
        let (authority, path) = rest.split_once('/').ok_or_else(|| remote_error(url))?;
        let (user, host) = authority
            .rsplit_once('@')
            .ok_or_else(|| remote_error(url))?;
        if user.is_empty() {
            return Err(remote_error(url));
        }
        (host, path, true)
    } else if let Some(rest) = trimmed.strip_prefix("https://") {
        let (host, path) = rest.split_once('/').ok_or_else(|| remote_error(url))?;
        (host, path, false)
    } else {
        let (authority, path) = trimmed.split_once(':').ok_or_else(|| remote_error(url))?;
        let (user, host) = authority
            .rsplit_once('@')
            .ok_or_else(|| remote_error(url))?;
        if user.is_empty() || authority.contains('/') {
            return Err(remote_error(url));
        }
        (host, path, true)
    };

    if host.is_empty()
        || host.contains(['/', ':', '@', '?', '#'])
        || host.chars().any(char::is_whitespace)
    {
        return Err(remote_error(url));
    }
    let mut parts = path.split('/');
    let owner = parts.next().unwrap_or_default();
    let name = parts.next().unwrap_or_default();
    if owner.is_empty()
        || name.is_empty()
        || parts.next().is_some()
        || owner.contains(['?', '#'])
        || name.contains(['?', '#'])
    {
        return Err(remote_error(url));
    }

    Ok(GitHubRemote {
        slug: format!("{owner}/{name}"),
        host: host.to_owned(),
        ssh,
    })
}

fn remote_error(url: &str) -> PortError {
    PortError::Gh(format!(
        "origin remote URL {url:?} is unsupported; accepted forms: {ACCEPTED_GITHUB_REMOTES}"
    ))
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

    async fn kill_confirmed(
        &self,
        session: &str,
        termination_grace_s: u64,
    ) -> Result<KillOutcome, PortError> {
        match self.attempt_for(session).await? {
            Some(attempt) => {
                let outcome = self.attempt_kill(&attempt, termination_grace_s).await?;
                self.preserve_after_kill(&attempt).await?;
                Ok(outcome)
            }
            None => Ok(KillOutcome::AlreadyDead),
        }
    }

    async fn reclaim_lease(
        &self,
        work: &str,
        holder: &str,
        older_than_s: u64,
    ) -> Result<LeaseReclaim, PortError> {
        // `holder` is the attempt's claimant verbatim — per-attempt session
        // identity. bd knows only the OTHER layer: the run's one lease,
        // taken under the driver's lease holder. The scoped reclaim must
        // therefore name that identity — the one actually in force, which is
        // what `lease_identity` resolves — and the answer is reported back
        // in the vocabulary the caller used, so a caller comparing
        // `previous_owner` against the claimant it passed reads a truthful
        // "the lease was taken from the identity you named". A holder that
        // is not a session claimant passes through untouched.
        let lease_holder = self.lease_holder_of(work, holder).await;
        let store_holder = lease_holder.as_deref().unwrap_or(holder);
        failpoint::hit("work.reclaim.before");
        let previous_owner =
            crate::core::workstore::reclaim(&self.ledger, work, store_holder, older_than_s)
                .await
                .map_err(|e| PortError::Unavailable(e.message))?;
        failpoint::hit("work.reclaim.after");
        Ok(LeaseReclaim {
            // The in-ledger reclaim is scoped by construction: it takes both
            // the item and the expected previous holder.
            scoped: true,
            previous_owner: previous_owner.map(|owner| {
                if owner == store_holder {
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
        let lease_holder = crate::core::workstore::lease_holder(&self.ledger, &run.work_id)
            .await
            .map_err(|e| PortError::Unavailable(e.message))?;
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
        let remote = github_remote(Path::new(repo)).await?;
        let gh = self.gh.clone().with_host_opt(remote.gh_host());
        failpoint::hit("gh.call.before");
        let pr = gh
            .pr_list_head(&remote.slug, head, base)
            .await
            .map_err(|error| PortError::Gh(error.to_string()))?;
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
        "stopped": report.stopped,
        "released": report.released,
        "observed": report.observed,
        "quarantined": report.quarantined,
        "harvestMismatches": report.harvest_mismatches,
        "deferred": report.deferred,
        "timedOut": report.timed_out,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A ledger holding one running attempt on one packet, plus the config
    /// whose `packet_dir` that attempt resolves to.
    fn one_running_attempt(root: &Path) -> (ForgedConfig, Ledger, AttemptRow) {
        let ledger = Ledger::open(&root.join("state.db")).expect("open ledger");
        ledger
            .create_run(forged_ledger::NewRun {
                run_id: forged_types::RunId::new("run-orphan").expect("run id"),
                work_id: "run-orphan".to_owned(),
                repo: root.to_string_lossy().into_owned(),
                base_ref: "main".to_owned(),
                branch: "forged/run-orphan".to_owned(),
            })
            .expect("create run");
        let packet_id = ledger
            .open_packet(forged_ledger::NewPacket {
                run_id: "run-orphan".to_owned(),
                stage: forged_types::Stage::Implement,
                seq: 1,
                spec_path: "/dev/null".to_owned(),
                spec_sha256: "sha".to_owned(),
                spec_revision: None,
                policy_revision: None,
                body_json: "{}".to_owned(),
            })
            .expect("open packet");
        let claimed = ledger
            .claim_packet(
                &packet_id,
                "claude:run-orphan/implement/1:1",
                &forged_ledger::SpecFence::Sha256("sha".to_owned()),
            )
            .expect("claim packet");
        let attempt = ledger.get_attempt(claimed.attempt_id).expect("attempt");
        let config = ForgedConfig {
            anvil_home: root.to_path_buf(),
            runs_root: root.join("runs"),
            db_path: root.join("state.db"),
            config_path: root.join("config.json"),
            config_path_override: None,
            config_file_read: false,
            config_sha256: None,
            roster: HashMap::new(),
            profiles: std::collections::BTreeMap::new(),
            rosters: std::collections::BTreeMap::new(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: Vec::new(),
            stage_budget_s: HashMap::new(),
            transport_retry_budget: 3,
            transport_patterns: Vec::new(),
            provider_transport_patterns: Default::default(),
            bd_path: root.join("bd"),
            beads_dir: root.join("beads"),
            codex_home: root.join("codex"),
            host_policy: crate::config::HostPolicy::Off,
            herdr_sock: None,
            pricing: crate::pricing::default_rate_card(),
            admission: crate::config::AdmissionPolicy::default(),
        };
        (config, ledger, attempt)
    }

    /// The same row, anchored far enough in the past that its process
    /// identity can never still be materializing.
    fn backdated(attempt: &AttemptRow) -> AttemptRow {
        AttemptRow {
            started_at: "2020-01-01T00:00:00.000000000Z".to_owned(),
            last_heartbeat_at: None,
            ..attempt.clone()
        }
    }

    #[test]
    fn an_identity_that_never_appeared_fails_the_attempt_instead_of_the_port() {
        // The bounded-orphan containment: a pid with no start stamp is a
        // process nothing may signal. Inside the grace window the port
        // DEFERS (the stamp may still be landing); past it the attempt is
        // settled as a transport failure — never `PortError::Unavailable`,
        // which would abort every reconcile pass of the run forever.
        let tmp = tempfile::tempdir().expect("tempdir");
        let (config, ledger, attempt) = one_running_attempt(tmp.path());
        let dir = config.packet_dir_key("run-orphan", "implement", 1);
        std::fs::create_dir_all(&dir).expect("packet dir");
        // A live pid (this test process) and NO `provider.lstart`: exactly
        // the crash window between the host spawn and the identity stamp.
        std::fs::write(dir.join("provider.pid"), std::process::id().to_string()).expect("pid");
        let ports = ForgedPorts::new(ledger.clone(), config);
        let rt = tokio::runtime::Runtime::new().expect("runtime");

        assert!(
            !ports.identity_grace_elapsed(&attempt),
            "a fresh attempt is still inside its grace window"
        );
        let deferred = rt.block_on(ports.attempt_kill(&attempt, 1));
        assert!(
            matches!(deferred, Err(PortError::Unavailable(_))),
            "inside the window the port defers: {deferred:?}"
        );
        assert_eq!(
            ledger
                .get_attempt(attempt.attempt_id)
                .expect("attempt")
                .state,
            forged_ledger::AttemptState::Running,
            "a deferral settles nothing"
        );

        let old = backdated(&attempt);
        assert!(ports.identity_grace_elapsed(&old));
        let settled = rt.block_on(ports.attempt_kill(&old, 1));
        assert!(
            matches!(settled, Ok(KillOutcome::AlreadyDead)),
            "past the window the kill reports the only honest answer it has: {settled:?}"
        );
        let row = ledger.get_attempt(attempt.attempt_id).expect("attempt");
        assert_eq!(row.state, forged_ledger::AttemptState::Failed);
        assert_eq!(
            row.fail_note.as_deref(),
            Some("transport: provider identity never established"),
            "the pinned note, `transport:`-prefixed so the packet reopens on \
             the transport-retry budget"
        );
        // And liveness agrees rather than reporting the orphan live forever.
        assert_eq!(
            rt.block_on(ports.attempt_liveness(&old)).expect("liveness"),
            SessionLiveness::Vanished
        );
        ledger.close().expect("close");
    }

    #[test]
    fn a_deadline_never_signals_or_releases_an_unverifiable_live_pid() {
        let tmp = tempfile::tempdir().expect("tempdir");
        let (config, ledger, attempt) = one_running_attempt(tmp.path());
        let dir = config.packet_dir_key("run-orphan", "implement", 1);
        std::fs::create_dir_all(&dir).expect("packet dir");
        let pid = i32::try_from(std::process::id()).expect("pid");
        std::fs::write(dir.join("provider.pid"), pid.to_string()).expect("pid file");
        let ports = ForgedPorts::new(ledger.clone(), config);
        ledger
            .revoke_attempt_scoped(
                attempt.attempt_id,
                "transport: stage deadline exceeded: test",
                forged_ledger::RevokeScope::Deadline,
            )
            .expect("deadline marker");
        let marked = ledger.get_attempt(attempt.attempt_id).expect("marked");
        let rt = tokio::runtime::Runtime::new().expect("runtime");

        let refused = rt.block_on(ports.attempt_kill(&marked, 1));
        assert!(matches!(refused, Err(PortError::Unavailable(_))));
        assert!(pid_alive(pid), "the unverifiable process was not signalled");
        let retained = ledger.get_attempt(marked.attempt_id).expect("attempt");
        assert_eq!(retained.state, forged_ledger::AttemptState::Revoking);
        assert_eq!(
            retained.revoke_scope,
            Some(forged_ledger::RevokeScope::Deadline)
        );
        ledger.close().expect("close");
    }

    #[test]
    fn a_deadline_kills_only_its_verified_process_group() {
        use std::os::unix::process::CommandExt;

        let tmp = tempfile::tempdir().expect("tempdir");
        let (config, ledger, attempt) = one_running_attempt(tmp.path());
        let dir = config.packet_dir_key("run-orphan", "implement", 1);
        std::fs::create_dir_all(&dir).expect("packet dir");
        let status = dir.join("verified-provider.status");
        let mut child = std::process::Command::new("sh")
            .args(["-c", r#"trap '' TERM; while :; do sleep 1; done"#])
            .process_group(0)
            .spawn()
            .expect("isolated provider group");
        let pid = i32::try_from(child.id()).expect("pid");
        let ports = ForgedPorts::new(ledger.clone(), config);
        let rt = tokio::runtime::Runtime::new().expect("runtime");
        std::thread::sleep(Duration::from_millis(100));
        let lstart = rt.block_on(lstart_of(pid)).unwrap_or_else(|| {
            let _ = killpg(Pid::from_raw(pid), Signal::SIGKILL);
            let _ = child.wait();
            panic!("provider start identity");
        });
        std::fs::write(dir.join("provider.pid"), pid.to_string()).expect("pid file");
        std::fs::write(dir.join("provider.lstart"), lstart).expect("lstart file");
        ledger
            .append_event_once(
                "run-orphan",
                "forged.session.started",
                serde_json::json!({
                    "schemaVersion": 2,
                    "attemptId": attempt.attempt_id,
                    "packetId": attempt.packet_id,
                    "host": "process",
                    "sessionId": "deadline-test",
                    "socketPath": null,
                    "statusPath": status,
                    "controllerGeneration": null,
                    "attachHint": null,
                }),
            )
            .expect("session identity");
        ledger
            .revoke_attempt_scoped(
                attempt.attempt_id,
                "transport: stage deadline exceeded: test",
                forged_ledger::RevokeScope::Deadline,
            )
            .expect("deadline marker");
        let marked = ledger.get_attempt(attempt.attempt_id).expect("marked");
        let reaper = std::thread::spawn(move || child.wait().expect("reap provider"));

        let kill_started = std::time::Instant::now();
        assert_eq!(
            rt.block_on(ports.attempt_kill(&marked, 1))
                .expect("verified kill"),
            KillOutcome::Killed
        );
        let elapsed = kill_started.elapsed();
        assert!(
            elapsed >= Duration::from_millis(900) && elapsed < Duration::from_secs(3),
            "recovered termination must consume the one-second frozen grace, took {elapsed:?}"
        );
        reaper.join().expect("provider reaper");
        assert!(!pid_alive(pid), "the exact provider group is dead");
        let retained = ledger.get_attempt(attempt.attempt_id).expect("attempt");
        assert_eq!(retained.state, forged_ledger::AttemptState::Revoking);
        assert_eq!(
            retained.revoke_scope,
            Some(forged_ledger::RevokeScope::Deadline),
            "termination alone cannot settle or release custody"
        );
        ledger.close().expect("close");
    }

    #[test]
    fn a_session_claimant_carries_seam_contract_5_and_resolves_to_one_packet() {
        // Seam contract 5, `<provider>:<session-or-host>:<pid>`, with real
        // values: the packet's provider, the packet as the session ref, and
        // this process's own pid.
        let session = crate::core::session_claimant("run-1/reviewcodex/2", "codex");
        assert_eq!(
            session,
            format!("codex:run-1/reviewcodex/2:{}", std::process::id())
        );
        assert_eq!(
            crate::core::packet_of_session(&session),
            Some("run-1/reviewcodex/2")
        );
        assert_eq!(
            run_of_session(&session).as_deref(),
            Some("run-1"),
            "both Review legs of a run reclaim under the ONE run lease"
        );
        // The sibling leg is a different session (different provider AND a
        // different packet) but the same run, so the same lease.
        let sibling = crate::core::session_claimant("run-1/reviewclaude/2", "claude");
        assert_ne!(sibling, session);
        assert_eq!(run_of_session(&sibling), run_of_session(&session));
        // Anything that is not a session claimant is used verbatim.
        assert_eq!(run_of_session("someone-else:host:99"), None);
        assert_eq!(
            run_of_session("forged:run-1:0"),
            None,
            "a run-scoped lease holder is not a packet-scoped claimant"
        );
        assert_eq!(run_of_session(crate::core::FRONTIER_HOLDER), None);
    }

    #[test]
    fn post_migration_process_session_uses_only_its_exact_durable_sentinel() {
        let tmp = tempfile::tempdir().expect("tempdir");
        let (config, ledger, attempt) = one_running_attempt(tmp.path());
        let ports = ForgedPorts::new(ledger.clone(), config);
        let runtime = ports.runtime_dir_of(&attempt).expect("runtime");
        let decoy = runtime.join("status/convincing-foreign/status");
        std::fs::create_dir_all(decoy.parent().expect("decoy parent")).expect("decoy dir");
        std::fs::write(&decoy, "99\n").expect("decoy status");
        let exact = tmp.path().join("opaque exact $ sentinel/status");
        std::fs::create_dir_all(exact.parent().expect("exact parent")).expect("exact dir");
        std::fs::write(&exact, "7\n").expect("exact status");
        ledger
            .append_event_once(
                "run-orphan",
                "forged.session.started",
                serde_json::json!({
                    "schemaVersion": 2,
                    "attemptId": attempt.attempt_id,
                    "packetId": attempt.packet_id,
                    "host": "process",
                    "sessionId": "opaque/session",
                    "socketPath": null,
                    "statusPath": exact,
                    "controllerGeneration": null,
                    "attachHint": null,
                }),
            )
            .expect("session event");
        let rt = tokio::runtime::Runtime::new().expect("runtime");
        assert_eq!(
            rt.block_on(ports.attempt_liveness(&attempt))
                .expect("liveness"),
            SessionLiveness::Exited(7),
            "the convincing scanned status must not override the exact path"
        );
    }

    #[test]
    fn post_migration_owned_herdr_session_uses_exact_row_and_missing_metadata_never_scans() {
        let tmp = tempfile::tempdir().expect("tempdir");
        let (config, ledger, attempt) = one_running_attempt(tmp.path());
        let ports = ForgedPorts::new(ledger.clone(), config);
        let runtime = ports.runtime_dir_of(&attempt).expect("runtime");
        let decoy = runtime.join("status/foreign/status");
        std::fs::create_dir_all(decoy.parent().expect("decoy parent")).expect("decoy dir");
        std::fs::write(&decoy, "99\n").expect("decoy status");
        let rt = tokio::runtime::Runtime::new().expect("runtime");
        assert!(matches!(
            rt.block_on(ports.sentinel_route(&attempt))
                .expect("route without metadata"),
            SentinelRoute::Absent
        ));

        let exact = tmp.path().join("owned exact/status");
        std::fs::create_dir_all(exact.parent().expect("exact parent")).expect("exact dir");
        std::fs::write(&exact, "3\n").expect("exact status");
        let identity = forged_types::OwnedHerdrSessionV1 {
            schema: forged_types::OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
            ownership_id: "owned-attempt".to_owned(),
            owner: forged_types::OwnedHerdrOwnerV1::Attempt {
                subject: forged_types::OwnedHerdrSubjectV1 {
                    kind: forged_types::OwnedHerdrSubjectKind::Run,
                    id: "run-orphan".to_owned(),
                },
                run_id: "run-orphan".to_owned(),
                packet_id: attempt.packet_id.clone(),
                attempt_id: attempt.attempt_id,
                claim_token: attempt.claim_token.clone(),
                controller_generation: None,
            },
            pane_id: "opaque:$ pane".to_owned(),
            socket_path: "/tmp/not-contacted.sock".to_owned(),
            protocol: 19,
            sentinel_path: exact.to_string_lossy().into_owned(),
            layout_id: None,
        };
        ledger
            .register_owned_herdr_session(&identity)
            .expect("register owned session");
        assert_eq!(
            rt.block_on(ports.attempt_liveness(&attempt))
                .expect("liveness"),
            SessionLiveness::Exited(3)
        );
    }

    #[test]
    fn slug_and_host_parse_the_known_remote_shapes() {
        for url in [
            "git@github.com:tcashel/forge",
            "git@github.com:tcashel/forge.git",
            "ssh://git@github.com/tcashel/forge",
            "ssh://git@github.com/tcashel/forge.git",
            "https://github.com/tcashel/forge",
            "https://github.com/tcashel/forge.git",
        ] {
            assert_eq!(slug_from_url(url).expect("slug"), "tcashel/forge");
            assert_eq!(host_from_url(url).expect("host"), "github.com");
        }

        // An ssh-alias authority parses (the slug is real) but is not worth
        // pinning: only the operator's ssh config knows the alias's API
        // host, and GH_HOST=<alias> would break gh where the default host
        // already works. Dotted hosts pin; dotless ones do not.
        let alias = remote_from_url("git@work:org/repo.git").expect("alias parses");
        assert_eq!(alias.slug, "org/repo");
        assert_eq!(alias.host, "work");
        assert_eq!(alias.gh_host(), None, "alias host is never pinned");
        let dotted = remote_from_url("git@ghe.example.com:org/repo.git").expect("ghe parses");
        assert_eq!(dotted.gh_host(), Some("ghe.example.com"));
        // An https authority is a real hostname even without a dot — a
        // single-label intranet GHE origin pins; ssh:// aliases do not.
        let https = remote_from_url("https://github/acme/widget.git").expect("https parses");
        assert_eq!(https.gh_host(), Some("github"));
        let ssh_alias = remote_from_url("ssh://git@work/org/repo").expect("ssh alias parses");
        assert_eq!(ssh_alias.gh_host(), None);

        let url = "/tmp/root/origin";
        let error = host_from_url(url).expect_err("local path has no GitHub host");
        assert!(matches!(error, PortError::Gh(_)));
        let message = error.to_string();
        assert!(message.contains(url), "remote URL is named: {message}");
        assert!(
            message.contains(ACCEPTED_GITHUB_REMOTES),
            "accepted forms are named: {message}"
        );
        let failure = crate::core::Failure::from(error);
        assert_eq!(failure.code, forged_types::ErrorCode::GhError);
    }

    #[test]
    fn forged_ports_pins_gh_to_the_origin_host() {
        use std::os::unix::fs::PermissionsExt;

        let tmp = tempfile::tempdir().expect("tempdir");
        let (config, ledger, _) = one_running_attempt(tmp.path());
        let initialized = std::process::Command::new("git")
            .arg("-C")
            .arg(tmp.path())
            .args(["init", "--quiet"])
            .status()
            .expect("git init spawns");
        assert!(initialized.success(), "git init succeeds");
        let remote = std::process::Command::new("git")
            .arg("-C")
            .arg(tmp.path())
            .args([
                "remote",
                "add",
                "origin",
                "git@ghe.example.com:org/repo.git",
            ])
            .status()
            .expect("git remote add spawns");
        assert!(remote.success(), "git remote add succeeds");

        let host_log = tmp.path().join("gh-host.log");
        let script = tmp.path().join("gh");
        std::fs::write(
            &script,
            "#!/bin/sh\nprintf '%s' \"$GH_HOST\" > \"$GH_HOST_LOG\"\nprintf '[{\"number\":9,\"state\":\"OPEN\",\"isDraft\":true,\"baseRefName\":\"main\",\"headRefName\":\"topic\",\"url\":\"https://ghe.example.com/org/repo/pull/9\"}]'\n",
        )
        .expect("write fake gh");
        std::fs::set_permissions(&script, std::fs::Permissions::from_mode(0o755))
            .expect("chmod fake gh");

        let mut ports = ForgedPorts::new(ledger.clone(), config);
        ports.gh = GhClient::with_program(script)
            .env("GH_HOST", "ambient.example.com")
            .env("GH_HOST_LOG", &host_log);
        let rt = tokio::runtime::Runtime::new().expect("runtime");
        let pr = rt
            .block_on(ports.pr_for_head(tmp.path().to_str().expect("repo path"), "topic", "main"))
            .expect("GHE PR probe succeeds")
            .expect("matching PR");

        assert_eq!(pr.number, 9);
        assert_eq!(
            std::fs::read_to_string(host_log).expect("captured host"),
            "ghe.example.com"
        );
        ledger.close().expect("close ledger");
    }
}
