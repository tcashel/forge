//! The detached heartbeat-guardian entrypoint, as a library function the
//! wave-4 bin slice will wire to a `forged packet heartbeat-guard --token T
//! --watch-pid P` subcommand.
//!
//! The guardian's whole point: heartbeat must mean "process alive". Each
//! round probes the watched pid FIRST and returns without further heartbeats
//! the moment it is dead.
//!
//! Pid probing shells the pair `/bin/kill -0` / `/bin/ps -o lstart=` by
//! absolute path (target platform macOS/arm64) rather than linking `nix`
//! (not in this crate's dep list); `lstart` output is treated as an opaque
//! string. These non-bd children inherit the process's REAL environment —
//! never the scratch `HOME` override — and each is bounded by
//! [`PID_PROBE_TIMEOUT_S`] so neither can block a guardian or a reaper
//! indefinitely.
//!
//! The probe is FAIL-CLOSED and tri-state ([`PidState`]): only a
//! confirmed-absent pid or a start-hint mismatch is death. Everything else —
//! spawn failure, timeout, a `kill` refusal that is not "no such process", an
//! unreadable `ps` — is [`PidState::Unknown`], which no caller may treat as
//! death: the reaper refuses to release on it and the guardian neither beats
//! nor reports the watched process exited.

use std::io::Write;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use crate::classify::BdError;
use crate::config::BdConfig;
use crate::lease;

/// Default heartbeat cadence in seconds: 100 = TTL/3.
pub const DEFAULT_CADENCE_S: u64 = 100;

/// Bound on each pid-probe child (`/bin/kill`, `/bin/ps`). A probe that
/// outlives it is [`PidState::Unknown`] — never "dead".
pub(crate) const PID_PROBE_TIMEOUT_S: u64 = 5;

/// How many consecutive rounds the guardian tolerates before giving up: three
/// heartbeat failures, or three pid probes it could not complete.
const CONSECUTIVE_LIMIT: u32 = 3;

/// `/bin/kill`'s copy for a pid that does not exist (macOS/BSD, probe-pinned:
/// `kill: 38272: No such process`). This is the ONLY kill-side evidence that
/// counts as death — `kill: 1: Operation not permitted` means the process
/// EXISTS but is not ours, which is a probe failure, not a death.
const NO_SUCH_PROCESS: &str = "No such process";

/// Configuration for one guardian run.
#[derive(Debug, Clone)]
pub struct GuardianConfig {
    /// The bd wrapper config to heartbeat through.
    pub bd: BdConfig,
    /// The bead whose lease is being kept alive.
    pub bead_id: String,
    /// The lease holder (the bd actor).
    pub holder: String,
    /// The pid whose liveness gates every heartbeat.
    pub watch_pid: u32,
    /// When provided, `ps -o lstart= -p <pid>` output is compared against
    /// this hint so a reused pid counts as dead.
    pub watch_start_hint: Option<String>,
    /// Seconds between rounds (default 100 = TTL/3, see
    /// [`DEFAULT_CADENCE_S`]).
    pub cadence_s: u64,
    /// When set, one line (unix epoch seconds) is appended per successful
    /// heartbeat — the handoff to the ledger (SQLite belongs to a sibling
    /// crate; this crate touches only bd, per its seam).
    pub beat_file: Option<PathBuf>,
}

impl GuardianConfig {
    /// Build a config with the default cadence, no start hint, and no beat
    /// file.
    pub fn new(bd: BdConfig, bead_id: String, holder: String, watch_pid: u32) -> Self {
        Self {
            bd,
            bead_id,
            holder,
            watch_pid,
            watch_start_hint: None,
            cadence_s: DEFAULT_CADENCE_S,
            beat_file: None,
        }
    }
}

/// Why the guardian returned.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GuardianExit {
    /// The watched process died: the guardian stopped WITHOUT further
    /// heartbeats.
    WatchedPidExited,
    /// A heartbeat was refused ([`BdError::HeartbeatRefused`]): the lease is
    /// no longer ours, so the guardian never beats again.
    LeaseLost,
    /// The guardian could not keep going: three consecutive non-refusal
    /// heartbeat failures (spawn, contention, envelope, timeout, or other bd
    /// errors), or three consecutive pid probes it could not complete
    /// ([`PidState::Unknown`] — fail-closed, an unprobeable pid is never
    /// reported as an exit). Any confirmed round resets the counters.
    BdUnavailable,
}

/// What a pid probe established. Fail-closed by construction: the absence of
/// evidence is [`PidState::Unknown`], never evidence of absence.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum PidState {
    /// The process exists (and, when a start hint was given, matches it).
    Alive,
    /// CONFIRMED dead: `/bin/kill -0` reported no such process, or the
    /// `ps -o lstart=` hint mismatched (the pid was reused).
    Dead,
    /// The probe could not be completed — spawn failure, timeout, a `kill`
    /// refusal that is not "no such process", or an unreadable `ps`. Callers
    /// must NOT act as if the process were dead: releasing a lease or a merge
    /// slot on this state is exactly the fail-open the fencing discipline
    /// forbids.
    Unknown,
}

/// Run one probe child under [`PID_PROBE_TIMEOUT_S`]. `None` covers both a
/// spawn failure and a timeout — the two probe failures that must surface as
/// [`PidState::Unknown`]. The child is dropped on elapse and `kill_on_drop`
/// reaps it.
async fn probe_child(program: &str, args: &[&str]) -> Option<std::process::Output> {
    let mut cmd = tokio::process::Command::new(program);
    cmd.args(args)
        .stdin(Stdio::null())
        .kill_on_drop(true)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    match tokio::time::timeout(Duration::from_secs(PID_PROBE_TIMEOUT_S), cmd.output()).await {
        Ok(Ok(out)) => Some(out),
        Ok(Err(_)) | Err(_) => None,
    }
}

/// Probe `pid` via `/bin/kill -0`; when `start_hint` is provided, also compare
/// `/bin/ps -o lstart= -p <pid>` output against it so a reused pid counts as
/// dead. Shared by the guardian and the slot reaper.
///
/// Only two outcomes are [`PidState::Dead`]: `kill` reporting
/// [`NO_SUCH_PROCESS`], and a start-hint mismatch. Every other non-alive
/// outcome is [`PidState::Unknown`] — including a `ps` that exits nonzero,
/// which can only mean the probe raced the process's exit or failed outright,
/// and which the NEXT round's `kill` probe settles for real.
pub(crate) async fn probe_pid(pid: u32, start_hint: Option<&str>) -> PidState {
    let pid_arg = pid.to_string();
    let Some(kill) = probe_child("/bin/kill", &["-0", &pid_arg]).await else {
        return PidState::Unknown;
    };
    if !kill.status.success() {
        return if String::from_utf8_lossy(&kill.stderr).contains(NO_SUCH_PROCESS) {
            PidState::Dead
        } else {
            PidState::Unknown
        };
    }
    let Some(hint) = start_hint else {
        return PidState::Alive;
    };
    let Some(ps) = probe_child("/bin/ps", &["-o", "lstart=", "-p", &pid_arg]).await else {
        return PidState::Unknown;
    };
    if !ps.status.success() {
        return PidState::Unknown;
    }
    let observed = String::from_utf8_lossy(&ps.stdout).trim().to_string();
    if observed.is_empty() {
        return PidState::Unknown;
    }
    if observed == hint.trim() {
        PidState::Alive
    } else {
        PidState::Dead
    }
}

fn append_beat(beat_file: &PathBuf) {
    // Best-effort: a beat-file write problem must never stop the guardian.
    if let Ok(epoch) = SystemTime::now().duration_since(UNIX_EPOCH) {
        let _ = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(beat_file)
            .and_then(|mut f| writeln!(f, "{}", epoch.as_secs()));
    }
}

/// Run the heartbeat guardian until it has a reason to stop. Loop per round:
/// probe the watched pid (CONFIRMED dead ⇒ [`GuardianExit::WatchedPidExited`],
/// no further heartbeats); otherwise heartbeat bd; on success append to the
/// beat file when set; on refusal ⇒ [`GuardianExit::LeaseLost`] immediately;
/// any other failure bumps a consecutive-failure counter that returns
/// [`GuardianExit::BdUnavailable`] at 3. Sleeps `cadence_s` between rounds.
///
/// A pid probe that could not be completed ([`PidState::Unknown`]) is
/// fail-closed in BOTH directions: the round is skipped rather than beaten
/// (a heartbeat must mean "process alive", and this round could not establish
/// that) and the guardian does NOT claim the watched process exited. Three
/// consecutive unprobeable rounds end the guardian with
/// [`GuardianExit::BdUnavailable`].
pub async fn run_guardian(cfg: GuardianConfig) -> GuardianExit {
    let mut consecutive_failures: u32 = 0;
    let mut unconfirmed_probes: u32 = 0;
    loop {
        match probe_pid(cfg.watch_pid, cfg.watch_start_hint.as_deref()).await {
            PidState::Dead => return GuardianExit::WatchedPidExited,
            PidState::Unknown => {
                unconfirmed_probes += 1;
                if unconfirmed_probes >= CONSECUTIVE_LIMIT {
                    return GuardianExit::BdUnavailable;
                }
                tokio::time::sleep(Duration::from_secs(cfg.cadence_s)).await;
                continue;
            }
            PidState::Alive => unconfirmed_probes = 0,
        }
        match lease::heartbeat(&cfg.bd, &cfg.bead_id, &cfg.holder).await {
            Ok(()) => {
                consecutive_failures = 0;
                if let Some(beat_file) = &cfg.beat_file {
                    append_beat(beat_file);
                }
            }
            Err(BdError::HeartbeatRefused { .. }) => {
                // Never keep beating a lease we no longer hold.
                return GuardianExit::LeaseLost;
            }
            Err(_) => {
                consecutive_failures += 1;
                if consecutive_failures >= CONSECUTIVE_LIMIT {
                    return GuardianExit::BdUnavailable;
                }
            }
        }
        tokio::time::sleep(Duration::from_secs(cfg.cadence_s)).await;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn probe_pid_reports_our_own_process_alive() {
        assert_eq!(probe_pid(std::process::id(), None).await, PidState::Alive);
        // Pid 0 is the kernel scheduling pseudo-process; /bin/kill -0 0 would
        // signal our own process group, so probe an unallocated high pid
        // instead: macOS pids stay well under 4 million, but there is no
        // guaranteed-free pid — require only that it is never reported Alive.
        // The deterministic dead-pid case is covered by the integration
        // guardian test (spawned-then-killed child).
        assert_ne!(probe_pid(4_000_000, None).await, PidState::Alive);
    }

    #[tokio::test]
    async fn start_hint_mismatch_counts_as_dead() {
        assert_eq!(
            probe_pid(std::process::id(), Some("Thu Jan  1 00:00:00 1970")).await,
            PidState::Dead,
            "a wrong lstart hint means the pid was reused: confirmed dead"
        );
    }

    #[tokio::test]
    async fn a_matching_start_hint_keeps_the_pid_alive() {
        let pid = std::process::id();
        let hint = probe_child("/bin/ps", &["-o", "lstart=", "-p", &pid.to_string()])
            .await
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
            .expect("ps must run on the target platform");
        assert_eq!(probe_pid(pid, Some(&hint)).await, PidState::Alive);
    }

    #[tokio::test]
    async fn an_unrunnable_probe_child_is_unknown_never_dead() {
        // The fail-closed seam: a probe that cannot run yields None here, and
        // None is what probe_pid turns into Unknown — never Dead.
        assert!(probe_child("/bin/no-such-probe-binary", &["-0", "1"])
            .await
            .is_none());
    }

    #[tokio::test]
    async fn a_permission_refusal_is_unknown_not_dead() {
        // /bin/kill -0 1 exits nonzero with "Operation not permitted": pid 1
        // EXISTS but is not ours. Treating that as death is the fail-open the
        // reaper must never do. (Running as root the same probe succeeds and
        // reports Alive — either way, never Dead.)
        assert_ne!(
            probe_pid(1, None).await,
            PidState::Dead,
            "pid 1 exists: a permission refusal must never read as death"
        );
    }
}
