//! The merge guard: every merge-class mutation re-verifies the PR against
//! live GitHub state immediately before mutating, so the guard's view can
//! never be staler than the mutation it protects.
//!
//! Ships fully tested and unused by slice/v1 — nothing in the epic calls it
//! on a live PR; it exists so the epic layer inherits a verified guard.

use crate::error::GitError;
use crate::gh::{GhClient, PrMeta};

/// Verify that merging `pr_number` is allowed.
///
/// Always performs BOTH live fetches per invocation — fresh PR metadata and
/// the repository default branch — with no caching, no memoization, and no
/// trust in a caller-supplied [`PrMeta`]. Both endpoint calls are invoked and
/// awaited on every invocation without short-circuiting; a PR-fetch error
/// propagates first, then a default-branch-fetch error. Refusals, in order:
///
/// 1. [`GitError::PrBaseMismatch`] — the fresh base differs from
///    `expected_base`.
/// 2. [`GitError::DefaultBranchForbidden`] — the fresh base is the
///    repository default branch.
/// 3. [`GitError::PrNotMergeable`] — the fresh PR is not OPEN, or is a
///    draft.
///
/// All three refusals are unconditional: there is no override flag, and none
/// may be added.
pub async fn assert_merge_allowed(
    gh: &GhClient,
    repo: &str,
    pr_number: u64,
    expected_base: &str,
) -> Result<PrMeta, GitError> {
    // Invoke and await both endpoints before propagating either error.
    let pr_result = gh.pr_view(repo, pr_number).await;
    let default_branch_result = gh.default_branch(repo).await;
    let pr = pr_result?;
    let default_branch = default_branch_result?;

    if pr.base_ref_name != expected_base {
        return Err(GitError::PrBaseMismatch {
            expected: expected_base.to_owned(),
            actual: pr.base_ref_name,
        });
    }
    if pr.base_ref_name == default_branch {
        return Err(GitError::DefaultBranchForbidden { default_branch });
    }
    if pr.state != "OPEN" || pr.is_draft {
        return Err(GitError::PrNotMergeable {
            state: pr.state,
            is_draft: pr.is_draft,
        });
    }
    Ok(pr)
}

/// Squash-merge `pr_number` after running [`assert_merge_allowed`]
/// immediately beforehand — the guard is inside this function, so the
/// mutation cannot be reached without it, and NOTHING runs between the
/// guard's verification calls and the merge invocation: no other subprocess,
/// no re-fetch, no logging shell-out.
///
/// Squash is the epic's merge strategy; the branch is explicitly kept. On
/// success this returns the [`PrMeta`] the guard just fetched, not a re-read.
pub async fn merge_pr(
    gh: &GhClient,
    repo: &str,
    pr_number: u64,
    expected_base: &str,
) -> Result<PrMeta, GitError> {
    let pr = assert_merge_allowed(gh, repo, pr_number, expected_base).await?;
    let number = pr_number.to_string();
    gh.run(&[
        "pr",
        "merge",
        &number,
        "--repo",
        repo,
        "--squash",
        "--delete-branch=false",
    ])
    .await?;
    Ok(pr)
}
