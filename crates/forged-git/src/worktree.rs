//! Worktree lifecycle: prepare a run's worktree from a remote-tracking base,
//! and retire it once the run is done.
//!
//! All git invocations are argv-style via `tokio::process::Command` — never a
//! shell. This module reads no environment variables: callers pass the repo
//! and `runs_root` explicitly.

use std::ffi::OsString;
use std::path::{Component, Path, PathBuf};
use std::process::Output;

use forged_types::RunId;

use crate::error::GitError;

/// What to prepare: which repo, where runs live, and which base to cut from.
#[derive(Debug, Clone, PartialEq)]
pub struct WorktreeSpec {
    /// The main clone, e.g. `~/repositories/forge`. Absolute, no `..`.
    pub repo: PathBuf,
    /// The runs root; the caller resolves `$ANVIL_HOME/runs` — this crate
    /// reads no env. Absolute, no `..`.
    pub runs_root: PathBuf,
    /// Must satisfy `forged_types::RunId` validation.
    pub run_id: String,
    /// Branch created via `git worktree add -B <branch>`.
    pub branch: String,
    /// Bare branch name, e.g. `anvil/epic-beads-4zp`.
    pub base: String,
    /// When set, the resolved base sha must match exactly.
    pub expected_base_sha: Option<String>,
}

/// A successfully prepared worktree.
#[derive(Debug, Clone, PartialEq)]
pub struct PreparedWorktree {
    /// `<runs_root>/<run_id>/worktree`.
    pub worktree: PathBuf,
    /// `<runs_root>/<run_id>`.
    pub run_dir: PathBuf,
    /// The sha `refs/remotes/origin/<base>` resolved to.
    pub base_sha: String,
}

/// How to retire: force requires the caller's explicit attestation that the
/// run is terminal in the ledger — this crate cannot read the ledger.
#[derive(Debug, Clone, PartialEq)]
pub struct RetireOptions {
    /// Override cleanliness refusals. Only honored together with
    /// `run_state_terminal`.
    pub force: bool,
    /// The caller's attestation that the run reached a terminal state.
    pub run_state_terminal: bool,
}

/// Prepare `<runs_root>/<run_id>/worktree` checked out at
/// `refs/remotes/origin/<base>` on branch `<branch>`.
///
/// The fetch keeping the base fresh is best-effort: offline operation against
/// an already-fetched remote-tracking ref is supported. Resolution is strict:
/// a base that exists only as a local branch is refused with
/// [`GitError::BaseNotFound`]. Prepare is not idempotent — a pre-existing
/// worktree (on disk or registered) is refused with
/// [`GitError::WorktreeExists`]; the caller retires first.
pub async fn prepare_worktree(spec: &WorktreeSpec) -> Result<PreparedWorktree, GitError> {
    validate_abs_path(&spec.repo, "repo")?;
    validate_abs_path(&spec.runs_root, "runs_root")?;
    let run_id = RunId::new(spec.run_id.clone())?;
    validate_ref_name(&spec.branch, "branch")?;
    validate_ref_name(&spec.base, "base")?;

    let run_dir = spec.runs_root.join(run_id.as_str());
    let worktree = run_dir.join("worktree");

    if worktree.exists() || registered_worktree(&spec.repo, &worktree).await? {
        if worktree.exists() {
            if let Some(expected) = &spec.expected_base_sha {
                let head = git_output(
                    &worktree,
                    ["rev-parse", "--verify", "--end-of-options", "HEAD"],
                )
                .await?;
                require_success(&head, "git rev-parse existing worktree HEAD")?;
                let actual = String::from_utf8_lossy(&head.stdout).trim().to_owned();
                if *expected != actual {
                    return Err(GitError::BaseShaMismatch {
                        expected: expected.clone(),
                        actual,
                    });
                }
            }
        }
        return Err(GitError::WorktreeExists {
            path: worktree.to_string_lossy().into_owned(),
        });
    }

    // Best-effort fetch with the explicit refspec so the remote-tracking ref
    // actually updates; a nonzero fetch does not abort prepare.
    let refspec = format!(
        "+refs/heads/{base}:refs/remotes/origin/{base}",
        base = spec.base
    );
    let fetch = git_output(&spec.repo, ["fetch", "origin", refspec.as_str()]).await?;
    let fetch_stderr = if fetch.status.success() {
        String::new()
    } else {
        String::from_utf8_lossy(&fetch.stderr).into_owned()
    };

    // Strict resolution of the fully qualified remote-tracking ref — never a
    // bare name, so a local-only branch cannot satisfy it.
    let tracking = format!("refs/remotes/origin/{}", spec.base);
    let rev = git_output(
        &spec.repo,
        [
            "rev-parse",
            "--verify",
            "--end-of-options",
            tracking.as_str(),
        ],
    )
    .await?;
    if !rev.status.success() {
        let rev_stderr = String::from_utf8_lossy(&rev.stderr);
        let mut detail = format!("rev-parse {tracking}: {}", rev_stderr.trim());
        if !fetch_stderr.is_empty() {
            detail.push_str(&format!(
                "; fetch origin {refspec}: {}",
                fetch_stderr.trim()
            ));
        }
        return Err(GitError::BaseNotFound {
            base: spec.base.clone(),
            detail,
        });
    }
    let base_sha = String::from_utf8_lossy(&rev.stdout).trim().to_owned();

    if let Some(expected) = &spec.expected_base_sha {
        if *expected != base_sha {
            return Err(GitError::BaseShaMismatch {
                expected: expected.clone(),
                actual: base_sha,
            });
        }
    }

    std::fs::create_dir_all(&run_dir)?;
    let args: Vec<OsString> = vec![
        "worktree".into(),
        "add".into(),
        "-B".into(),
        spec.branch.clone().into(),
        "--end-of-options".into(),
        worktree.clone().into_os_string(),
        tracking.into(),
    ];
    let add = git_output(&spec.repo, &args).await?;
    require_success(&add, "git worktree add")?;

    Ok(PreparedWorktree {
        worktree,
        run_dir,
        base_sha,
    })
}

/// Retire `<runs_root>/<run_id>`: refuse unless the worktree is clean and
/// resolved, then remove the worktree, prune git metadata, and delete exactly
/// the validated run dir — nothing else, ever.
///
/// A second retire of the same `run_id` always succeeds: an already-gone
/// worktree still prunes and deletes the run dir, and an absent run dir is
/// success. Refusals stand unless `opts.force && opts.run_state_terminal` —
/// both flags, explicitly.
pub async fn retire_worktree(
    repo: &Path,
    runs_root: &Path,
    run_id: &str,
    opts: &RetireOptions,
) -> Result<(), GitError> {
    validate_abs_path(repo, "repo")?;
    validate_abs_path(runs_root, "runs_root")?;
    let run_id = RunId::new(run_id.to_owned())?;

    let run_dir = runs_root.join(run_id.as_str());
    let worktree = run_dir.join("worktree");

    if !worktree.exists() {
        // Idempotent completion: prune metadata and delete the run dir.
        prune_worktrees(repo).await?;
        remove_run_dir(&run_dir)?;
        return Ok(());
    }

    if !(opts.force && opts.run_state_terminal) {
        check_clean(&worktree).await?;
    }

    let mut args: Vec<OsString> = vec!["worktree".into(), "remove".into()];
    if opts.force && opts.run_state_terminal {
        args.push("--force".into());
    }
    args.push(worktree.clone().into_os_string());
    let remove = git_output(repo, &args).await?;
    require_success(&remove, "git worktree remove")?;

    prune_worktrees(repo).await?;
    remove_run_dir(&run_dir)?;
    Ok(())
}

/// Verify that one validated run worktree is resolved and clean without
/// pruning metadata or removing either the worktree or its artifact dir.
/// An absent worktree is already clean for crash recovery.
pub async fn verify_worktree_clean(runs_root: &Path, run_id: &str) -> Result<(), GitError> {
    validate_abs_path(runs_root, "runs_root")?;
    let run_id = RunId::new(run_id.to_owned())?;
    let worktree = runs_root.join(run_id.as_str()).join("worktree");
    if worktree.exists() {
        check_clean(&worktree).await?;
    }
    Ok(())
}

/// Refuse a retire when the worktree carries unresolved merge state or any
/// staged, modified, or untracked change.
async fn check_clean(worktree: &Path) -> Result<(), GitError> {
    // Resolve the worktree's REAL git dir: in a linked worktree,
    // `<worktree>/.git` is a file, never a directory to path-join.
    let git_dir_out = git_output(worktree, ["rev-parse", "--absolute-git-dir"]).await?;
    require_success(&git_dir_out, "git rev-parse --absolute-git-dir")?;
    let git_dir = PathBuf::from(
        String::from_utf8_lossy(&git_dir_out.stdout)
            .trim()
            .to_owned(),
    );

    let unmerged = git_output(worktree, ["ls-files", "-u", "-z"]).await?;
    require_success(&unmerged, "git ls-files -u -z")?;
    if !unmerged.stdout.is_empty() {
        let mut paths: Vec<String> = unmerged
            .stdout
            .split(|&b| b == 0)
            .filter(|entry| !entry.is_empty())
            .map(|entry| {
                let path = entry.splitn(2, |&b| b == b'\t').nth(1).unwrap_or(entry);
                String::from_utf8_lossy(path).into_owned()
            })
            .collect();
        paths.sort();
        paths.dedup();
        return Err(GitError::WorktreeUnresolved { paths });
    }

    const MARKERS: [&str; 5] = [
        "MERGE_HEAD",
        "CHERRY_PICK_HEAD",
        "REVERT_HEAD",
        "rebase-merge",
        "rebase-apply",
    ];
    let mut hit_markers: Vec<String> = MARKERS
        .iter()
        .filter(|marker| git_dir.join(marker).exists())
        .map(|marker| (*marker).to_owned())
        .collect();
    if !hit_markers.is_empty() {
        hit_markers.sort();
        return Err(GitError::WorktreeUnresolved { paths: hit_markers });
    }

    let status = git_output(
        worktree,
        ["status", "--porcelain", "-z", "--untracked-files=all"],
    )
    .await?;
    require_success(&status, "git status --porcelain -z")?;
    if !status.stdout.is_empty() {
        return Err(GitError::WorktreeDirty {
            paths: parse_porcelain_z(&status.stdout),
        });
    }
    Ok(())
}

/// Parse `git status --porcelain -z` output into bare repo-relative paths:
/// status prefixes stripped, rename entries recording the destination only,
/// decoded lossily, sorted, deduplicated.
fn parse_porcelain_z(bytes: &[u8]) -> Vec<String> {
    let mut paths = Vec::new();
    let mut tokens = bytes.split(|&b| b == 0).filter(|t| !t.is_empty());
    while let Some(token) = tokens.next() {
        if token.len() < 4 {
            continue;
        }
        let x = token[0];
        let y = token[1];
        paths.push(String::from_utf8_lossy(&token[3..]).into_owned());
        if matches!(x, b'R' | b'C') || matches!(y, b'R' | b'C') {
            // The following NUL-token is the rename/copy source; skip it.
            let _ = tokens.next();
        }
    }
    paths.sort();
    paths.dedup();
    paths
}

/// Whether `worktree` is already registered in `git worktree list --porcelain`.
async fn registered_worktree(repo: &Path, worktree: &Path) -> Result<bool, GitError> {
    let list = git_output(repo, ["worktree", "list", "--porcelain"]).await?;
    require_success(&list, "git worktree list --porcelain")?;
    let listing = String::from_utf8_lossy(&list.stdout);
    let worktree_str = worktree.to_string_lossy();
    Ok(listing
        .lines()
        .filter_map(|line| line.strip_prefix("worktree "))
        .any(|path| path == worktree_str))
}

async fn prune_worktrees(repo: &Path) -> Result<(), GitError> {
    let prune = git_output(repo, ["worktree", "prune"]).await?;
    require_success(&prune, "git worktree prune")
}

/// Delete exactly the validated run dir; absence is success.
fn remove_run_dir(run_dir: &Path) -> Result<(), GitError> {
    match std::fs::remove_dir_all(run_dir) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(GitError::Io(e)),
    }
}

/// Run `git -C <dir> <args>` and capture its output.
async fn git_output<I, S>(dir: &Path, args: I) -> Result<Output, GitError>
where
    I: IntoIterator<Item = S>,
    S: AsRef<std::ffi::OsStr>,
{
    let mut cmd = tokio::process::Command::new("git");
    cmd.arg("-C")
        .arg(dir)
        .args(args)
        .stdin(std::process::Stdio::null());
    cmd.output().await.map_err(GitError::Io)
}

fn require_success(output: &Output, command: &str) -> Result<(), GitError> {
    if output.status.success() {
        Ok(())
    } else {
        Err(GitError::Exec {
            command: command.to_owned(),
            stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
        })
    }
}

fn validate_abs_path(path: &Path, name: &str) -> Result<(), GitError> {
    let has_parent_component = path
        .components()
        .any(|component| matches!(component, Component::ParentDir));
    if !path.is_absolute() || has_parent_component {
        return Err(GitError::InvalidPath {
            message: format!(
                "{name} must be an absolute path without `..` components: {}",
                path.display()
            ),
        });
    }
    Ok(())
}

fn validate_ref_name(value: &str, field: &str) -> Result<(), GitError> {
    if value.is_empty() || value.starts_with('-') {
        return Err(GitError::InvalidPath {
            message: format!(
                "{field} must be a non-empty ref name not starting with `-`, got {value:?}"
            ),
        });
    }
    Ok(())
}
