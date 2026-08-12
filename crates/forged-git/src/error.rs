//! Typed errors for the worktree, gh, and merge-guard surfaces, plus their
//! mapping onto the closed `forged_types::ErrorCode` wire set.

use forged_types::ErrorCode;

/// A failure talking to the `gh` CLI.
///
/// Every gh subprocess failure is classified into one of these variants —
/// never a panic and never a silently-empty result.
#[derive(Debug, thiserror::Error)]
pub enum GhError {
    /// gh exited nonzero (or could not be spawned; `status` is `None` then
    /// and when gh died to a signal).
    #[error("gh failed with status {status:?}: {stderr}")]
    Exec { status: Option<i32>, stderr: String },
    /// gh exited zero but its stdout did not parse as the expected JSON.
    #[error("gh output did not parse: {message}")]
    Json { message: String },
    /// gh reported HTTP 404.
    #[error("gh resource not found")]
    NotFound,
    /// gh reported an authentication or authorization failure
    /// (exit status 4, HTTP 401, or HTTP 403).
    #[error("gh authentication or authorization failure")]
    Auth,
}

/// A failure in worktree lifecycle, ref resolution, or the merge guard.
#[derive(Debug, thiserror::Error)]
pub enum GitError {
    /// The worktree path already exists on disk or is already registered.
    #[error("worktree already exists: {path}")]
    WorktreeExists { path: String },
    /// The worktree has staged, modified, or untracked files.
    #[error("worktree is dirty: {paths:?}")]
    WorktreeDirty { paths: Vec<String> },
    /// The worktree has unmerged index entries or an in-progress
    /// merge/cherry-pick/revert/rebase.
    #[error("worktree has unresolved merge state: {paths:?}")]
    WorktreeUnresolved { paths: Vec<String> },
    /// The base branch does not resolve as a remote-tracking ref.
    #[error("base branch not found: {base}: {detail}")]
    BaseNotFound { base: String, detail: String },
    /// The resolved base sha differs from the caller's expectation.
    #[error("base sha mismatch: expected {expected}, actual {actual}")]
    BaseShaMismatch { expected: String, actual: String },
    /// The PR's fresh base ref differs from the expected base.
    #[error("PR base mismatch: expected {expected}, actual {actual}")]
    PrBaseMismatch { expected: String, actual: String },
    /// The PR is based on the repository default branch.
    #[error("PR targets the repository default branch: {default_branch}")]
    DefaultBranchForbidden { default_branch: String },
    /// The PR is not in a mergeable condition (not OPEN, or a draft).
    #[error("PR is not mergeable: state={state}, draft={is_draft}")]
    PrNotMergeable { state: String, is_draft: bool },
    /// A gh call failed.
    #[error(transparent)]
    Gh(#[from] GhError),
    /// The run id failed `forged_types::RunId` validation.
    #[error(transparent)]
    InvalidRunId(#[from] forged_types::RunIdError),
    /// A caller-supplied path or ref name is invalid (non-absolute or
    /// `..`-containing path; empty or `-`-prefixed branch/base name).
    #[error("invalid path or ref: {message}")]
    InvalidPath { message: String },
    /// A git subprocess exited nonzero.
    #[error("git command failed: {command}: {stderr}")]
    Exec { command: String, stderr: String },
    /// An underlying I/O failure.
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl GitError {
    /// The wire error code this failure maps onto.
    pub fn code(&self) -> ErrorCode {
        match self {
            GitError::WorktreeDirty { .. } | GitError::WorktreeUnresolved { .. } => {
                ErrorCode::WorktreeDirty
            }
            GitError::PrBaseMismatch { .. } => ErrorCode::PrBaseMismatch,
            GitError::DefaultBranchForbidden { .. } => ErrorCode::DefaultBranchForbidden,
            GitError::Gh(_) => ErrorCode::GhError,
            GitError::WorktreeExists { .. }
            | GitError::BaseNotFound { .. }
            | GitError::BaseShaMismatch { .. }
            | GitError::PrNotMergeable { .. }
            | GitError::InvalidRunId(_)
            | GitError::InvalidPath { .. } => ErrorCode::InvalidRequest,
            GitError::Exec { .. } | GitError::Io(_) => ErrorCode::Internal,
        }
    }
}
