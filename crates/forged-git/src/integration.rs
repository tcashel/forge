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
    Err(GitError::Exec {
        command: format!("{context} (status {:?})", output.status.code()),
        stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
    })
}

async fn validate_branch(repo: &Path, branch: &str) -> Result<(), GitError> {
    let full = format!("refs/heads/{branch}");
    let output = git(repo, &["check-ref-format", &full]).await?;
    stdout(&output, "git check-ref-format").map(|_| ())
}

/// Ensure `origin/<integration>` exists, cutting it from the fetched
/// `origin/<base>` only when absent. Existing integration refs are reused.
pub async fn ensure_integration_branch(
    repo: &Path,
    integration: &str,
    base: &str,
    expected_base_sha: Option<&str>,
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
        let sha = line
            .split_whitespace()
            .next()
            .map(str::to_owned)
            .ok_or_else(|| GitError::Exec {
                command: "git ls-remote integration branch".to_owned(),
                stderr: "successful probe returned no sha".to_owned(),
            })?;
        if let Some(expected) = expected_base_sha {
            if sha != expected {
                return Err(GitError::BaseShaMismatch {
                    expected: expected.to_owned(),
                    actual: sha,
                });
            }
        }
        return Ok(sha);
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
    if let Some(expected) = expected_base_sha {
        if sha != expected {
            return Err(GitError::BaseShaMismatch {
                expected: expected.to_owned(),
                actual: sha,
            });
        }
    }
    let refspec = format!("{sha}:{integration_ref}");
    let pushed = git(repo, &["push", "origin", &refspec]).await?;
    stdout(&pushed, "git push integration branch")?;
    Ok(sha)
}
