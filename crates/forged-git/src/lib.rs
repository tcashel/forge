//! forged-git owns worktrees, the merge guard, and the gh wrapper.
//!
//! Worktree lifecycle (`prepare_worktree` / `retire_worktree`) runs argv-style
//! git subprocesses only — never a shell. The gh wrapper (`GhClient`) shells
//! out to the `gh` CLI with `--json`/`gh api` output parsed into typed
//! structs, and the merge guard (`assert_merge_allowed` / `merge_pr`)
//! re-fetches PR metadata and the repository default branch on every
//! invocation so its view is never staler than the mutation it protects.
//!
//! This crate reads no environment variables: callers pass `runs_root` and
//! repo paths explicitly.

mod error;

pub use error::{GhError, GitError};
