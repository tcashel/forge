//! Integration-branch setup: the cut pushes from a disposable worktree whose
//! HEAD is the integration branch (never the operator checkout), and a
//! rejected push preserves the hook's full diagnostic.

mod common;

use std::path::Path;

use common::{rev_parse, setup_repos};
use forged_git::ensure_integration_branch;

/// Install an executable pre-push hook in `repo`.
fn install_pre_push(repo: &Path, script: &str) {
    use std::os::unix::fs::PermissionsExt;
    let hooks = repo.join(".git").join("hooks");
    std::fs::create_dir_all(&hooks).expect("mkdir hooks");
    let hook = hooks.join("pre-push");
    std::fs::write(&hook, script).expect("write pre-push hook");
    std::fs::set_permissions(&hook, std::fs::Permissions::from_mode(0o755))
        .expect("chmod pre-push hook");
}

/// A Husky-style hook that inspects HEAD instead of the pushed refs. Pushing
/// from the operator checkout (HEAD = main) would be rejected; pushing from
/// the integration scratch worktree is observed on the integration branch.
#[tokio::test]
async fn cut_pushes_from_integration_worktree_so_head_hooks_see_the_branch() {
    let repos = setup_repos("main");
    install_pre_push(
        &repos.repo,
        "#!/bin/sh\nif [ \"$(git rev-parse --abbrev-ref HEAD)\" = \"main\" ]; then\n  echo 'Cannot push directly to main branch'\n  exit 1\nfi\nexit 0\n",
    );
    let scratch = repos.runs_root.join("epic-t1").join("integration-setup");
    let sha = ensure_integration_branch(&repos.repo, "forged/epic-t1", "main", &scratch)
        .await
        .expect("cut succeeds despite a HEAD-inspecting pre-push hook");
    assert_eq!(sha, rev_parse(&repos.origin, "main"));
    assert_eq!(sha, rev_parse(&repos.origin, "forged/epic-t1"));
    assert!(
        !scratch.exists(),
        "the scratch worktree is removed after the push"
    );
}

#[tokio::test]
async fn rejected_push_preserves_hook_stdout_and_stderr() {
    let repos = setup_repos("main");
    install_pre_push(
        &repos.repo,
        "#!/bin/sh\necho 'HOOK-STDOUT-DETAIL'\necho 'HOOK-STDERR-DETAIL' >&2\nexit 1\n",
    );
    let scratch = repos.runs_root.join("epic-t2").join("integration-setup");
    let error = ensure_integration_branch(&repos.repo, "forged/epic-t2", "main", &scratch)
        .await
        .expect_err("the hook rejects every push");
    let message = error.to_string();
    assert!(
        message.contains("HOOK-STDERR-DETAIL"),
        "stderr survives: {message}"
    );
    assert!(
        message.contains("HOOK-STDOUT-DETAIL"),
        "hook stdout survives: {message}"
    );
    assert!(
        !scratch.exists(),
        "the scratch worktree is removed after a failed push"
    );
}

#[tokio::test]
async fn existing_remote_integration_branch_is_reused_without_pushing() {
    let repos = setup_repos("main");
    common::git(&repos.repo, &["push", "origin", "main:forged/epic-t3"]);
    // A hook rejecting every push proves the reuse path performs none.
    install_pre_push(&repos.repo, "#!/bin/sh\nexit 1\n");
    let scratch = repos.runs_root.join("epic-t3").join("integration-setup");
    let sha = ensure_integration_branch(&repos.repo, "forged/epic-t3", "main", &scratch)
        .await
        .expect("existing integration branch is reused");
    assert_eq!(sha, rev_parse(&repos.origin, "main"));
}

#[tokio::test]
async fn missing_base_branch_fails_with_the_fetch_diagnostic() {
    let repos = setup_repos("main");
    let scratch = repos.runs_root.join("epic-t4").join("integration-setup");
    let error = ensure_integration_branch(&repos.repo, "forged/epic-t4", "nope", &scratch)
        .await
        .expect_err("a missing base cannot be cut");
    let message = error.to_string();
    assert!(
        message.contains("fetch") || message.contains("nope"),
        "the fetch failure names the base: {message}"
    );
}

#[tokio::test]
async fn interrupted_cut_leftover_scratch_is_reclaimed() {
    let repos = setup_repos("main");
    let scratch = repos.runs_root.join("epic-t5").join("integration-setup");
    std::fs::create_dir_all(&scratch).expect("simulate a leftover scratch dir");
    std::fs::write(scratch.join("stale.txt"), "leftover").expect("stale file");
    let sha = ensure_integration_branch(&repos.repo, "forged/epic-t5", "main", &scratch)
        .await
        .expect("a leftover scratch path does not block the cut");
    assert_eq!(sha, rev_parse(&repos.origin, "forged/epic-t5"));
    assert!(!scratch.exists(), "the reclaimed scratch is removed");
}
