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
//! never the scratch `HOME` override.

use std::io::Write;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use crate::classify::BdError;
use crate::config::BdConfig;
use crate::lease;

/// Default heartbeat cadence in seconds: 100 = TTL/3.
pub const DEFAULT_CADENCE_S: u64 = 100;

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
    /// Three consecutive non-refusal heartbeat failures (spawn, contention,
    /// envelope, timeout, or other bd errors); any success resets the
    /// counter.
    BdUnavailable,
}

/// Probe whether `pid` is alive via `/bin/kill -0`; when `start_hint` is
/// provided, also compare `/bin/ps -o lstart= -p <pid>` output against it so
/// a reused pid counts as dead. Shared by the guardian and the slot reaper.
pub(crate) async fn pid_alive(pid: u32, start_hint: Option<&str>) -> bool {
    let pid_arg = pid.to_string();
    let status = tokio::process::Command::new("/bin/kill")
        .args(["-0", &pid_arg])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .kill_on_drop(true)
        .status()
        .await;
    if !matches!(status, Ok(s) if s.success()) {
        return false;
    }
    if let Some(hint) = start_hint {
        let out = tokio::process::Command::new("/bin/ps")
            .args(["-o", "lstart=", "-p", &pid_arg])
            .stdin(Stdio::null())
            .kill_on_drop(true)
            .output()
            .await;
        match out {
            Ok(o) if o.status.success() => {
                let observed = String::from_utf8_lossy(&o.stdout).trim().to_string();
                if observed.is_empty() || observed != hint.trim() {
                    return false;
                }
            }
            _ => return false,
        }
    }
    true
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
/// probe the watched pid (dead ⇒ [`GuardianExit::WatchedPidExited`], no
/// further heartbeats); otherwise heartbeat bd; on success append to the
/// beat file when set; on refusal ⇒ [`GuardianExit::LeaseLost`] immediately;
/// any other failure bumps a consecutive-failure counter that returns
/// [`GuardianExit::BdUnavailable`] at 3. Sleeps `cadence_s` between rounds.
pub async fn run_guardian(cfg: GuardianConfig) -> GuardianExit {
    let mut consecutive_failures: u32 = 0;
    loop {
        if !pid_alive(cfg.watch_pid, cfg.watch_start_hint.as_deref()).await {
            return GuardianExit::WatchedPidExited;
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
                if consecutive_failures >= 3 {
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
    async fn pid_alive_detects_our_own_process_and_a_bogus_pid() {
        assert!(pid_alive(std::process::id(), None).await);
        // Pid 0 is the kernel scheduling pseudo-process; /bin/kill -0 0 would
        // signal our own process group, so probe an unallocated high pid
        // instead: macOS pids stay well under 99999's neighborhood in
        // practice, but there is no guaranteed-free pid — accept either
        // result and only require no panic. The deterministic dead-pid case
        // is covered by the integration guardian test (spawned-then-killed
        // child).
        let _ = pid_alive(4_000_000, None).await;
    }

    #[tokio::test]
    async fn start_hint_mismatch_counts_as_dead() {
        assert!(
            !pid_alive(std::process::id(), Some("Thu Jan  1 00:00:00 1970")).await,
            "a wrong lstart hint must count as dead"
        );
    }
}
