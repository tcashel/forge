//! Idempotent integration-branch setup for epic execution.

use std::path::Path;
use std::process::Stdio;

use crate::GitError;

async fn git(repo: &Path, args: &[&str]) -> Result<std::process::Output, GitError> {
    tokio::process::Command::new("git")
        .arg("-C")
        .arg(repo)
        .args(args)
        .stdin(Stdio::null())
        .output()
        .await
        .map_err(|error| GitError::Exec {
            command: format!("git {}", args.join(" ")),
            stderr: error.to_string(),
        })
}

fn stdout(output: &std::process::Output, context: &str) -> Result<String, GitError> {
    if output.status.success() {
        return Ok(String::from_utf8_lossy(&output.stdout).trim().to_owned());
    }
    // Hooks and remotes explain rejections on either stream; a diagnostic
    // that drops stdout can reduce a hook refusal to "failed to push some
    // refs", so both streams survive into the durable error.
    let stderr = String::from_utf8_lossy(&output.stderr);
    let out = String::from_utf8_lossy(&output.stdout);
    let detail = match (stderr.trim().is_empty(), out.trim().is_empty()) {
        (false, true) => stderr.into_owned(),
        (true, false) => out.into_owned(),
        (true, true) => String::new(),
        (false, false) => format!("{}\nstdout: {}", stderr.trim_end(), out.trim_end()),
    };
    Err(GitError::Exec {
        command: format!("{context} (status {:?})", output.status.code()),
        stderr: detail,
    })
}

async fn validate_branch(repo: &Path, branch: &str) -> Result<(), GitError> {
    let full = format!("refs/heads/{branch}");
    let output = git(repo, &["check-ref-format", &full]).await?;
    stdout(&output, "git check-ref-format").map(|_| ())
}

/// Resolve one exact remote branch without fetching or mutating local refs.
///
/// A missing branch is an error: callers use this value as a durable
/// execution checkpoint and must never silently substitute a local ref.
pub async fn remote_branch_sha(repo: &Path, branch: &str) -> Result<String, GitError> {
    validate_branch(repo, branch).await?;
    let remote_ref = format!("refs/heads/{branch}");
    let output = git(
        repo,
        &["ls-remote", "--exit-code", "--heads", "origin", &remote_ref],
    )
    .await?;
    let line = stdout(&output, "git ls-remote remote branch")?;
    line.split_whitespace()
        .next()
        .filter(|sha| !sha.is_empty())
        .map(str::to_owned)
        .ok_or_else(|| GitError::Exec {
            command: "git ls-remote remote branch".to_owned(),
            stderr: "successful probe returned no sha".to_owned(),
        })
}

/// Ensure `origin/<integration>` exists, cutting it from the fetched
/// `origin/<base>` only when absent. Existing integration refs are reused.
///
/// The cut is pushed from a disposable worktree at `scratch` checked out on
/// the integration branch, never from the operator checkout: repository
/// pre-push hooks that inspect `HEAD` must observe the ref being pushed,
/// not whatever the operator happens to have checked out. Hooks are never
/// bypassed.
pub async fn ensure_integration_branch(
    repo: &Path,
    integration: &str,
    base: &str,
    scratch: &Path,
) -> Result<String, GitError> {
    validate_branch(repo, integration).await?;
    validate_branch(repo, base).await?;
    let integration_ref = format!("refs/heads/{integration}");
    let probe = git(
        repo,
        &[
            "ls-remote",
            "--exit-code",
            "--heads",
            "origin",
            &integration_ref,
        ],
    )
    .await?;
    if probe.status.success() {
        let line = String::from_utf8_lossy(&probe.stdout);
        return line
            .split_whitespace()
            .next()
            .map(str::to_owned)
            .ok_or_else(|| GitError::Exec {
                command: "git ls-remote integration branch".to_owned(),
                stderr: "successful probe returned no sha".to_owned(),
            });
    }
    // `ls-remote --exit-code` uses 2 for a clean miss. Any other failure is
    // transport/auth and must not be treated as an absent branch.
    if probe.status.code() != Some(2) {
        return stdout(&probe, "git ls-remote integration branch").map(|_| String::new());
    }

    let fetched = git(repo, &["fetch", "origin", base]).await?;
    stdout(&fetched, "git fetch integration base")?;
    let remote_base = format!("refs/remotes/origin/{base}");
    let resolved = git(repo, &["rev-parse", &remote_base]).await?;
    let sha = stdout(&resolved, "git rev-parse integration base")?;

    let scratch_str = scratch.to_str().ok_or_else(|| GitError::Exec {
        command: "integration scratch worktree".to_owned(),
        stderr: format!("scratch path {} is not valid UTF-8", scratch.display()),
    })?;
    if let Some(parent) = scratch.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|error| GitError::Exec {
                command: "integration scratch worktree".to_owned(),
                stderr: error.to_string(),
            })?;
    }
    // Leftover scratch state from an interrupted cut is disposable, and the
    // remote branch is absent here, so resetting a stale local branch to the
    // fresh cut with `-B` loses nothing durable. Registered, unregistered,
    // and pruned-but-present leftovers are all reclaimed.
    let _ = git(repo, &["worktree", "remove", "--force", scratch_str]).await;
    let _ = tokio::fs::remove_dir_all(scratch).await;
    let _ = git(repo, &["worktree", "prune"]).await;
    let added = git(
        repo,
        &[
            "worktree",
            "add",
            "--force",
            "-B",
            integration,
            scratch_str,
            &sha,
        ],
    )
    .await?;
    stdout(&added, "git worktree add integration scratch")?;
    let pushed = git(scratch, &["push", "origin", integration]).await;
    // Removal is best-effort: the next cut clears leftovers before adding.
    let _ = git(repo, &["worktree", "remove", "--force", scratch_str]).await;
    stdout(&pushed?, "git push integration branch")?;
    Ok(sha)
}
