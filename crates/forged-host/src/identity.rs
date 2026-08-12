//! Pid-reuse-safe process identity: `(pid, lstart)` captured from
//! `ps -p <pid> -o lstart=` (macOS-only target per ADR-0012 makes this
//! acceptable; no new dependency).

/// A pid paired with the process start time reported by `ps -o lstart=`.
///
/// `ps` lstart has WHOLE-SECOND precision, so a pid recycled onto a new
/// process that starts within the same second as the old one would compare
/// as "the same process". That residual is ACCEPTED for this slice — a
/// documented limitation, not an open question: the deployment is a single
/// operator's macOS box, and the status file remains the only exit-code
/// truth regardless of what the identity comparator concludes.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ProcessIdentity {
    pub(crate) pid: u32,
    /// Trimmed `lstart` column captured at spawn; `ps` pads it with
    /// whitespace, so comparisons always trim both sides.
    pub(crate) lstart: String,
}

/// Run `ps -p <pid> -o lstart=` and return the trimmed stdout, or `None`
/// when the pid does not resolve (non-zero `ps` exit or empty trimmed
/// stdout) — the EXPECTED dead signal, never an error.
async fn lstart_of(pid: u32) -> Option<String> {
    let output = tokio::process::Command::new("ps")
        .args(["-p", &pid.to_string(), "-o", "lstart="])
        .output()
        .await
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let lstart = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if lstart.is_empty() {
        None
    } else {
        Some(lstart)
    }
}

impl ProcessIdentity {
    /// Capture the identity of a live pid. `None` means `ps` could not
    /// resolve the pid — the process is already gone; store no identity and
    /// keep the session valid (the sentinel and `try_wait` decide
    /// `Exited` vs `Vanished`).
    pub(crate) async fn capture(pid: u32) -> Option<Self> {
        let lstart = lstart_of(pid).await?;
        Some(ProcessIdentity { pid, lstart })
    }

    /// A pid is "the same process" only if `ps` still resolves it AND the
    /// trimmed lstart is unchanged. A non-zero `ps` exit or empty trimmed
    /// stdout means the pid is gone (dead); a mismatched lstart means the
    /// pid was recycled — the original process is dead either way.
    pub(crate) async fn is_same_process(&self) -> bool {
        match lstart_of(self.pid).await {
            Some(current) => current == self.lstart,
            None => false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn comparator_treats_mismatched_lstart_as_dead() {
        // Criterion 4: a live pid (our own) with a fabricated stored
        // start-time must compare as NOT the same process.
        let fabricated = ProcessIdentity {
            pid: std::process::id(),
            lstart: "Thu Jan  1 00:00:00 1970".to_string(),
        };
        assert!(!fabricated.is_same_process().await);
    }

    #[tokio::test]
    async fn comparator_matches_a_live_unchanged_pid() {
        let own = ProcessIdentity::capture(std::process::id())
            .await
            .expect("own pid resolves");
        assert!(own.is_same_process().await);
    }

    #[tokio::test]
    async fn capture_of_a_dead_pid_returns_none() {
        // Pid 0 is the kernel scheduler group; `ps -p 0` reports nothing
        // usable on macOS. Use an absurdly high pid instead.
        assert!(ProcessIdentity::capture(99_999_999).await.is_none());
    }
}
