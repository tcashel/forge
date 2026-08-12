//! Ordered gate execution with artifact capture.
//!
//! Each command runs as `sh -c <command>` in its own process group with a
//! per-command deadline covering shell reap AND both stream drains. Full
//! stdout/stderr stream to per-command artifact files; the row carries a
//! byte-tail preview. Failures and timeouts are row data — the sequence
//! always runs to completion.

use std::collections::VecDeque;
use std::path::{Component, Path, PathBuf};
use std::process::Stdio;
use std::time::{Duration, Instant};

use nix::errno::Errno;
use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

use forged_types::GateRow;

use crate::error::GateError;

/// What to run, where, and under which limits.
#[derive(Debug, Clone, PartialEq)]
pub struct GateRequest {
    /// Ordered, exact caller-supplied shell lines.
    pub commands: Vec<String>,
    /// The worktree; commands run here. Absolute, no `..`.
    pub cwd: PathBuf,
    /// Per-attempt artifact directory, e.g. `<run_dir>/artifacts`; created if
    /// missing, refused if pre-existing and non-empty. Absolute, no `..`.
    pub artifacts_dir: PathBuf,
    /// Per-command deadline; 900s is the documented default.
    pub timeout_per_command: Duration,
    /// Preview tail size in bytes; 4000 is the documented default.
    pub preview_bytes: usize,
}

impl GateRequest {
    /// A request with the documented defaults baked in: 900s per command,
    /// 4000 preview bytes.
    pub fn new(commands: Vec<String>, cwd: PathBuf, artifacts_dir: PathBuf) -> Self {
        Self {
            commands,
            cwd,
            artifacts_dir,
            timeout_per_command: Duration::from_secs(900),
            preview_bytes: 4000,
        }
    }
}

/// One gate report: every command's row, in order, and the overall label.
#[derive(Debug, Clone, PartialEq)]
pub struct GateOutcome {
    /// One row per command, in command order.
    pub rows: Vec<GateRow>,
    /// True only when every row exited zero and nothing timed out.
    pub passed: bool,
}

/// Run every command in order and report one row each.
///
/// The runner never auto-fixes, never retries a command, and never mutates
/// the worktree: it executes what it was given and reports. A gate failure
/// is a successful call (`Ok` with `passed: false`); [`GateError`] is
/// reserved for environment and input failures where no honest row exists.
pub async fn run_gates(req: &GateRequest) -> Result<GateOutcome, GateError> {
    // Input refusals, checked before anything is created or spawned.
    validate_abs_path(&req.cwd, "cwd")?;
    validate_abs_path(&req.artifacts_dir, "artifacts_dir")?;
    if req.commands.is_empty() {
        // Never a vacuous pass: zero rows would read as a clean gate report.
        return Err(GateError::InvalidRequest {
            message: "commands must not be empty: an empty gate list cannot pass vacuously"
                .to_owned(),
        });
    }
    ensure_fresh_artifacts_dir(&req.artifacts_dir)?;

    let mut rows = Vec::with_capacity(req.commands.len());
    for (index, command) in req.commands.iter().enumerate() {
        let row = run_one(req, index + 1, command).await?;
        rows.push(row);
    }
    let passed = rows
        .iter()
        .all(|row| row.exit_code == Some(0) && !row.timed_out);
    Ok(GateOutcome { rows, passed })
}

/// Run the 1-based `n`th command and produce its row.
async fn run_one(req: &GateRequest, n: usize, command: &str) -> Result<GateRow, GateError> {
    let stdout_path = req.artifacts_dir.join(format!("gate-{n}-stdout.log"));
    let stderr_path = req.artifacts_dir.join(format!("gate-{n}-stderr.log"));
    // Create both artifact files before spawning — a creation failure starts
    // nothing.
    let stdout_file = create_artifact(&stdout_path).await?;
    let stderr_file = create_artifact(&stderr_path).await?;

    let started = Instant::now();
    let deadline = tokio::time::Instant::now() + req.timeout_per_command;

    let mut cmd = tokio::process::Command::new("sh");
    cmd.arg("-c")
        .arg(command)
        .current_dir(&req.cwd)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    {
        // Own process group, so a timeout can kill every descendant.
        use std::os::unix::process::CommandExt;
        cmd.as_std_mut().process_group(0);
    }
    let mut child = cmd.spawn().map_err(|e| GateError::Spawn {
        command: command.to_owned(),
        source: e,
    })?;
    let pgid = child
        .id()
        .and_then(|pid| i32::try_from(pid).ok())
        .map(Pid::from_raw);

    let (stdout_pipe, stderr_pipe) = match (child.stdout.take(), child.stderr.take()) {
        (Some(out), Some(err)) => (out, err),
        _ => {
            // Already failing: the kill and reap are best-effort so the
            // original error is the one reported.
            let _ = kill_group(pgid);
            let _ = child.wait().await;
            return Err(GateError::Io(std::io::Error::other(
                "child stdio pipes missing after spawn",
            )));
        }
    };
    let mut stdout_task = tokio::spawn(drain(stdout_pipe, stdout_file, req.preview_bytes));
    let mut stderr_task = tokio::spawn(drain(stderr_pipe, stderr_file, req.preview_bytes));

    // A command is complete only when the shell has been reaped AND both
    // drain tasks reached EOF. One deadline, started before spawn, covers
    // that entire completion; results are captured incrementally so a
    // mid-await timeout loses nothing already finished.
    let mut wait_result: Option<std::io::Result<std::process::ExitStatus>> = None;
    let mut stdout_result: Option<std::io::Result<Vec<u8>>> = None;
    let mut stderr_result: Option<std::io::Result<Vec<u8>>> = None;
    let timed_out = {
        let completion = async {
            wait_result = Some(child.wait().await);
            stdout_result = Some(flatten_join((&mut stdout_task).await));
            stderr_result = Some(flatten_join((&mut stderr_task).await));
        };
        tokio::time::timeout_at(deadline, completion).await.is_err()
    };

    if timed_out {
        // SIGKILL the recorded process group even if the leader already
        // exited: a background descendant can hold the pipes open. A
        // non-ESRCH failure means the group may still be running and the
        // unbounded reap/drain below could hang on it, so fail out instead
        // of reporting a timeout row whose cleanup never happened.
        kill_group(pgid).map_err(GateError::Io)?;
        if wait_result.is_none() {
            // Retain the reap outcome: a wait failure here must surface as
            // GateError::Io below, never vanish into a timeout row.
            wait_result = Some(child.wait().await);
        }
        if stdout_result.is_none() {
            stdout_result = Some(flatten_join((&mut stdout_task).await));
        }
        if stderr_result.is_none() {
            stderr_result = Some(flatten_join((&mut stderr_task).await));
        }
    }

    let stdout_result =
        stdout_result.unwrap_or_else(|| Err(std::io::Error::other("stdout drain unresolved")));
    let stderr_result =
        stderr_result.unwrap_or_else(|| Err(std::io::Error::other("stderr drain unresolved")));

    // Post-spawn capture/wait failures: best-effort group kill and reap
    // (already failing, so the capture error stays the reported one), then
    // Err — no honest complete row exists.
    let (stdout_tail, stderr_tail) = match (stdout_result, stderr_result) {
        (Ok(out), Ok(err)) => (out, err),
        (out, err) => {
            let _ = kill_group(pgid);
            let _ = child.wait().await;
            let first = out
                .err()
                .or_else(|| err.err())
                .unwrap_or_else(|| std::io::Error::other("stream capture failed without an error"));
            return Err(GateError::Io(first));
        }
    };
    let exit_code = if timed_out {
        // A timeout row asserts the cleanup happened: the group kill above
        // succeeded, so the leader reap must also have. A wait failure is
        // GateError::Io — never a plausible-looking timed_out row.
        match wait_result {
            Some(Ok(_)) => None,
            Some(Err(e)) => return Err(GateError::Io(e)),
            None => {
                return Err(GateError::Io(std::io::Error::other(
                    "child wait unresolved after timeout cleanup",
                )))
            }
        }
    } else {
        let status = match wait_result {
            Some(Ok(status)) => status,
            Some(Err(e)) => {
                let _ = kill_group(pgid);
                return Err(GateError::Io(e));
            }
            None => {
                let _ = kill_group(pgid);
                return Err(GateError::Io(std::io::Error::other(
                    "child wait unresolved without a timeout",
                )));
            }
        };
        Some(exit_code_of(status))
    };

    let duration = started.elapsed();
    Ok(GateRow {
        command: command.to_owned(),
        cwd: req.cwd.to_string_lossy().into_owned(),
        exit_code,
        duration_ms: u64::try_from(duration.as_millis()).unwrap_or(u64::MAX),
        timed_out,
        stdout_preview: String::from_utf8_lossy(&stdout_tail).into_owned(),
        stderr_preview: String::from_utf8_lossy(&stderr_tail).into_owned(),
        artifact_path: stdout_path.to_string_lossy().into_owned(),
    })
}

/// Copy a child stream to its artifact file while keeping a rolling tail of
/// the last `preview_bytes` bytes, measured before lossy conversion.
async fn drain(
    mut src: impl tokio::io::AsyncRead + Unpin,
    mut file: tokio::fs::File,
    preview_bytes: usize,
) -> std::io::Result<Vec<u8>> {
    let mut tail: VecDeque<u8> = VecDeque::with_capacity(preview_bytes.min(64 * 1024));
    let mut buf = [0u8; 8192];
    loop {
        let n = src.read(&mut buf).await?;
        if n == 0 {
            break;
        }
        file.write_all(&buf[..n]).await?;
        tail.extend(&buf[..n]);
        if tail.len() > preview_bytes {
            tail.drain(..tail.len() - preview_bytes);
        }
    }
    file.flush().await?;
    Ok(tail.into_iter().collect())
}

/// Nonzero exits report `code()`; a signal death that was not our timeout
/// kill encodes `128 + signal`, so `exit_code: None` uniquely means timed
/// out.
fn exit_code_of(status: std::process::ExitStatus) -> i32 {
    use std::os::unix::process::ExitStatusExt;
    match status.code() {
        Some(code) => code,
        None => status.signal().map_or(-1, |signal| 128 + signal),
    }
}

/// SIGKILL the whole process group. ESRCH alone is tolerated as success —
/// every member already exited and was reaped, which IS completed cleanup.
/// Any other failure is returned, because the group may still be running
/// and the caller must not report cleanup that never happened.
fn kill_group(pgid: Option<Pid>) -> std::io::Result<()> {
    let Some(pgid) = pgid else {
        // No pgid was ever recorded, so there is nothing to signal.
        return Ok(());
    };
    match killpg(pgid, Signal::SIGKILL) {
        Ok(()) | Err(Errno::ESRCH) => Ok(()),
        Err(errno) => Err(std::io::Error::from_raw_os_error(errno as i32)),
    }
}

fn flatten_join(
    joined: Result<std::io::Result<Vec<u8>>, tokio::task::JoinError>,
) -> std::io::Result<Vec<u8>> {
    match joined {
        Ok(inner) => inner,
        Err(join_error) => Err(std::io::Error::other(join_error)),
    }
}

async fn create_artifact(path: &Path) -> Result<tokio::fs::File, GateError> {
    tokio::fs::File::create(path)
        .await
        .map_err(|e| GateError::ArtifactsDir {
            path: path.to_string_lossy().into_owned(),
            source: e,
        })
}

/// The artifacts dir must be absent or empty when the call starts, so a
/// retried stage can never silently overwrite or interleave with prior
/// evidence.
fn ensure_fresh_artifacts_dir(dir: &Path) -> Result<(), GateError> {
    match std::fs::read_dir(dir) {
        Ok(mut entries) => {
            if entries.next().is_some() {
                return Err(GateError::InvalidRequest {
                    message: format!(
                        "artifacts_dir must be absent or empty, but {} is not empty",
                        dir.display()
                    ),
                });
            }
            Ok(())
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            std::fs::create_dir_all(dir).map_err(|e| GateError::ArtifactsDir {
                path: dir.to_string_lossy().into_owned(),
                source: e,
            })
        }
        Err(e) => Err(GateError::ArtifactsDir {
            path: dir.to_string_lossy().into_owned(),
            source: e,
        }),
    }
}

fn validate_abs_path(path: &Path, name: &str) -> Result<(), GateError> {
    let has_parent_component = path
        .components()
        .any(|component| matches!(component, Component::ParentDir));
    if !path.is_absolute() || has_parent_component {
        return Err(GateError::InvalidRequest {
            message: format!(
                "{name} must be an absolute path without `..` components: {}",
                path.display()
            ),
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn kill_group_tolerates_a_vanished_group_as_success() {
        // i32::MAX exceeds every platform's pid cap (Linux PID_MAX_LIMIT is
        // 2^22; macOS is far lower), so this group cannot exist: killpg
        // reports ESRCH, which kill_group reports as completed cleanup.
        assert!(kill_group(Some(Pid::from_raw(i32::MAX))).is_ok());
    }

    #[test]
    fn kill_group_without_a_recorded_pgid_is_success() {
        assert!(kill_group(None).is_ok());
    }
}
