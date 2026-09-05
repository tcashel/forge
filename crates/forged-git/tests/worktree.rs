//! prepare_worktree / retire_worktree behavior against throwaway temp git
//! repositories with local-path origin remotes. No test touches the network.

mod common;

use std::path::{Path, PathBuf};

use common::{commit_file, git, rev_parse, setup_repos};
use forged_git::{
    prepare_worktree, retire_worktree, verify_worktree_clean, GitError, PreparedWorktree,
    RetireOptions, WorktreeSpec,
};
use forged_types::ErrorCode;

const BASE: &str = "anvil/epic-test";

fn spec(repos: &common::Repos, run_id: &str, branch: &str) -> WorktreeSpec {
    WorktreeSpec {
        repo: repos.repo.clone(),
        runs_root: repos.runs_root.clone(),
        run_id: run_id.to_owned(),
        branch: branch.to_owned(),
        base: repos.base.clone(),
        expected_base_sha: None,
        start_sha: None,
    }
}

fn no_force() -> RetireOptions {
    RetireOptions {
        force: false,
        run_state_terminal: false,
    }
}

async fn prepare(repos: &common::Repos, run_id: &str, branch: &str) -> PreparedWorktree {
    prepare_worktree(&spec(repos, run_id, branch))
        .await
        .expect("prepare succeeds")
}

fn worktree_listed(repo: &Path, worktree: &Path) -> bool {
    git(repo, &["worktree", "list", "--porcelain"])
        .lines()
        .filter_map(|line| line.strip_prefix("worktree "))
        .any(|path| Path::new(path) == worktree)
}

#[tokio::test]
async fn prepare_creates_worktree_at_remote_base() {
    let repos = setup_repos(BASE);
    let origin_sha = rev_parse(&repos.origin, "HEAD");

    let prepared = prepare(&repos, "run-1", "feat/run-1").await;

    assert_eq!(prepared.run_dir, repos.runs_root.join("run-1"));
    assert_eq!(prepared.worktree, prepared.run_dir.join("worktree"));
    assert_eq!(prepared.base_sha, origin_sha);
    assert_eq!(rev_parse(&prepared.worktree, "HEAD"), origin_sha);
    let branch = git(&prepared.worktree, &["rev-parse", "--abbrev-ref", "HEAD"]);
    assert_eq!(branch.trim(), "feat/run-1");
}

#[tokio::test]
async fn retry_worktree_starts_from_a_local_only_committed_branch_head() {
    let repos = setup_repos(BASE);
    let base_sha = rev_parse(&repos.origin, "HEAD");
    let source = prepare(&repos, "run-source", "forged/run-source").await;
    for number in 1..=3 {
        commit_file(
            &source.worktree,
            &format!("commit-{number}.txt"),
            &format!("commit {number}\n"),
            &format!("source commit {number}"),
        );
    }
    let source_sha = rev_parse(&source.worktree, "HEAD");
    retire_worktree(
        &repos.repo,
        &repos.runs_root,
        "run-source",
        &RetireOptions {
            force: false,
            run_state_terminal: true,
        },
    )
    .await
    .expect("retire preserves the local branch");
    assert_eq!(rev_parse(&repos.repo, "forged/run-source"), source_sha);

    let mut successor = spec(&repos, "run-successor", "forged/run-successor");
    successor.start_sha = Some(source_sha.clone());
    let prepared = prepare_worktree(&successor)
        .await
        .expect("prepare successor from committed source head");

    assert_eq!(
        prepared.base_sha, base_sha,
        "base remains the original base"
    );
    assert_eq!(rev_parse(&prepared.worktree, "HEAD"), source_sha);
    assert_eq!(
        git(
            &prepared.worktree,
            &["rev-list", "--count", &format!("origin/{BASE}..HEAD")]
        )
        .trim(),
        "3"
    );
}

#[tokio::test]
async fn local_only_base_is_refused() {
    let repos = setup_repos(BASE);
    git(&repos.repo, &["branch", "localonly"]);

    let mut s = spec(&repos, "run-1", "feat/run-1");
    s.base = "localonly".to_owned();
    let err = prepare_worktree(&s)
        .await
        .expect_err("refuses local-only base");
    assert!(
        matches!(&err, GitError::BaseNotFound { base, .. } if base == "localonly"),
        "got {err:?}"
    );
}

#[tokio::test]
async fn unreachable_remote_with_resolvable_ref_succeeds() {
    let repos = setup_repos(BASE);
    let stale_sha = rev_parse(&repos.repo, &format!("refs/remotes/origin/{BASE}"));
    let nowhere = repos.root.join("nowhere");
    git(
        &repos.repo,
        &["remote", "set-url", "origin", nowhere.to_str().unwrap()],
    );

    let prepared = prepare(&repos, "run-1", "feat/run-1").await;
    assert_eq!(prepared.base_sha, stale_sha);
    assert_eq!(rev_parse(&prepared.worktree, "HEAD"), stale_sha);
}

#[tokio::test]
async fn unreachable_remote_and_unresolvable_ref_reports_both_failures() {
    let repos = setup_repos(BASE);
    let nowhere = repos.root.join("nowhere");
    git(
        &repos.repo,
        &["remote", "set-url", "origin", nowhere.to_str().unwrap()],
    );

    let mut s = spec(&repos, "run-1", "feat/run-1");
    s.base = "missing-base".to_owned();
    let err = prepare_worktree(&s).await.expect_err("refuses");
    match err {
        GitError::BaseNotFound { base, detail } => {
            assert_eq!(base, "missing-base");
            assert!(detail.contains("rev-parse"), "detail: {detail}");
            assert!(detail.contains("fetch"), "detail: {detail}");
        }
        other => panic!("expected BaseNotFound, got {other:?}"),
    }
}

#[tokio::test]
async fn second_prepare_sees_advanced_remote_base() {
    let repos = setup_repos(BASE);
    let first = prepare(&repos, "run-1", "feat/run-1").await;

    commit_file(&repos.origin, "g.txt", "advance\n", "advance base");
    let new_sha = rev_parse(&repos.origin, "HEAD");
    assert_ne!(first.base_sha, new_sha);

    let second = prepare(&repos, "run-2", "feat/run-2").await;
    assert_eq!(second.base_sha, new_sha);
    assert_eq!(rev_parse(&second.worktree, "HEAD"), new_sha);
}

#[tokio::test]
async fn stale_expected_base_sha_is_refused_and_creates_nothing() {
    let repos = setup_repos(BASE);
    let mut s = spec(&repos, "run-1", "feat/run-1");
    s.expected_base_sha = Some("0000000000000000000000000000000000000000".to_owned());

    let err = prepare_worktree(&s).await.expect_err("refuses stale sha");
    match err {
        GitError::BaseShaMismatch { expected, actual } => {
            assert_eq!(expected, "0000000000000000000000000000000000000000");
            assert_eq!(actual, rev_parse(&repos.origin, "HEAD"));
        }
        other => panic!("expected BaseShaMismatch, got {other:?}"),
    }
    let run_dir = repos.runs_root.join("run-1");
    assert!(!run_dir.exists(), "run dir must not be created");
}

#[tokio::test]
async fn second_prepare_for_same_run_id_is_refused() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;

    let err = prepare_worktree(&spec(&repos, "run-1", "feat/run-1"))
        .await
        .expect_err("refuses duplicate");
    assert!(
        matches!(err, GitError::WorktreeExists { .. }),
        "got {err:?}"
    );

    // A registered-but-deleted worktree is still refused via the registry.
    std::fs::remove_dir_all(&prepared.worktree).unwrap();
    let err = prepare_worktree(&spec(&repos, "run-1", "feat/run-1"))
        .await
        .expect_err("refuses registered worktree");
    assert!(
        matches!(err, GitError::WorktreeExists { .. }),
        "got {err:?}"
    );
}

#[tokio::test]
async fn reused_worktree_must_still_match_its_frozen_base_sha() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;
    let frozen = prepared.base_sha.clone();
    let mut replay = spec(&repos, "run-1", "feat/run-1");
    replay.expected_base_sha = Some(frozen.clone());
    let same = prepare_worktree(&replay)
        .await
        .expect_err("matching replay still reports the existing worktree");
    assert!(matches!(same, GitError::WorktreeExists { .. }));

    commit_file(
        &prepared.worktree,
        "unexpected.txt",
        "advanced\n",
        "unexpected advance",
    );
    let advanced = rev_parse(&prepared.worktree, "HEAD");
    let drift = prepare_worktree(&replay)
        .await
        .expect_err("reused worktree cannot hide base drift");
    assert!(matches!(
        drift,
        GitError::BaseShaMismatch { expected, actual }
            if expected == frozen && actual == advanced
    ));
}

#[tokio::test]
async fn invalid_run_id_is_refused_before_anything_runs() {
    let repos = setup_repos(BASE);
    for bad in ["../evil", "a/b", "-run", ""] {
        let err = prepare_worktree(&spec(&repos, bad, "feat/x"))
            .await
            .expect_err("refuses invalid run id");
        assert!(
            matches!(err, GitError::InvalidRunId(_)),
            "run id {bad:?} got {err:?}"
        );
        assert_eq!(err.code(), ErrorCode::InvalidRequest);

        let err = retire_worktree(&repos.repo, &repos.runs_root, bad, &no_force())
            .await
            .expect_err("retire refuses invalid run id");
        assert!(matches!(err, GitError::InvalidRunId(_)), "got {err:?}");
    }
}

#[tokio::test]
async fn invalid_paths_and_ref_names_are_refused() {
    let repos = setup_repos(BASE);

    let mut s = spec(&repos, "run-1", "feat/run-1");
    s.repo = PathBuf::from("relative/repo");
    let err = prepare_worktree(&s).await.expect_err("relative repo");
    assert!(matches!(err, GitError::InvalidPath { .. }), "got {err:?}");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    let mut s = spec(&repos, "run-1", "feat/run-1");
    s.runs_root = repos.root.join("runs").join("..").join("runs");
    let err = prepare_worktree(&s).await.expect_err("dotdot runs_root");
    assert!(matches!(err, GitError::InvalidPath { .. }), "got {err:?}");

    let mut s = spec(&repos, "run-1", "feat/run-1");
    s.branch = "-evil".to_owned();
    let err = prepare_worktree(&s).await.expect_err("dash branch");
    assert!(
        matches!(&err, GitError::InvalidPath { message } if message.contains("branch")),
        "got {err:?}"
    );

    let mut s = spec(&repos, "run-1", "feat/run-1");
    s.base = String::new();
    let err = prepare_worktree(&s).await.expect_err("empty base");
    assert!(
        matches!(&err, GitError::InvalidPath { message } if message.contains("base")),
        "got {err:?}"
    );

    let err = retire_worktree(Path::new("rel"), &repos.runs_root, "run-1", &no_force())
        .await
        .expect_err("retire relative repo");
    assert!(matches!(err, GitError::InvalidPath { .. }), "got {err:?}");
}

#[tokio::test]
async fn clean_worktree_retires_without_force() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;
    let sibling = repos.runs_root.join("run-other");
    std::fs::create_dir(&sibling).unwrap();

    retire_worktree(&repos.repo, &repos.runs_root, "run-1", &no_force())
        .await
        .expect("clean retire succeeds");

    assert!(!prepared.worktree.exists());
    assert!(!prepared.run_dir.exists());
    assert!(!worktree_listed(&repos.repo, &prepared.worktree));
    assert!(sibling.exists(), "sibling run dir must survive");
}

#[tokio::test]
async fn dirty_worktree_is_refused_with_bare_paths() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;
    std::fs::write(prepared.worktree.join("junk.txt"), "junk\n").unwrap();

    let err = retire_worktree(&repos.repo, &repos.runs_root, "run-1", &no_force())
        .await
        .expect_err("dirty refuses");
    match &err {
        GitError::WorktreeDirty { paths } => {
            assert_eq!(paths, &vec!["junk.txt".to_owned()]);
        }
        other => panic!("expected WorktreeDirty, got {other:?}"),
    }
    assert_eq!(err.code(), ErrorCode::WorktreeDirty);
    assert!(prepared.worktree.exists(), "refusal must not delete");
}

#[tokio::test]
async fn verify_clean_never_retires_the_worktree_or_artifacts() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;

    verify_worktree_clean(&repos.runs_root, "run-1")
        .await
        .expect("clean worktree verifies");
    assert!(prepared.worktree.exists());
    assert!(prepared.run_dir.exists());

    std::fs::write(prepared.worktree.join("junk.txt"), "junk\n").unwrap();
    let err = verify_worktree_clean(&repos.runs_root, "run-1")
        .await
        .expect_err("dirty worktree refuses");
    assert!(matches!(err, GitError::WorktreeDirty { .. }), "got {err:?}");
    assert!(
        prepared.worktree.exists(),
        "refusal must not delete worktree"
    );
    assert!(
        prepared.run_dir.exists(),
        "refusal must not delete artifacts"
    );
}

#[tokio::test]
async fn unmerged_index_is_refused_as_unresolved() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;
    let wt = &prepared.worktree;
    let base_sha = prepared.base_sha.clone();

    commit_file(wt, "f.txt", "ours\n", "ours");
    git(wt, &["checkout", "-b", "theirs", &base_sha]);
    commit_file(wt, "f.txt", "theirs\n", "theirs");
    git(wt, &["checkout", "feat/run-1"]);
    let merge = common::git_raw(wt, &["merge", "theirs"]);
    assert!(!merge.status.success(), "merge must conflict");

    let err = retire_worktree(&repos.repo, &repos.runs_root, "run-1", &no_force())
        .await
        .expect_err("unresolved refuses");
    match &err {
        GitError::WorktreeUnresolved { paths } => {
            assert_eq!(paths, &vec!["f.txt".to_owned()]);
        }
        other => panic!("expected WorktreeUnresolved, got {other:?}"),
    }
    assert_eq!(err.code(), ErrorCode::WorktreeDirty);
}

#[tokio::test]
async fn mid_rebase_marker_with_clean_status_is_refused() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;

    // The REAL git dir of a linked worktree — <worktree>/.git is a file, so
    // a naive path-join could never find this directory.
    let git_dir = git(&prepared.worktree, &["rev-parse", "--absolute-git-dir"]);
    let git_dir = PathBuf::from(git_dir.trim());
    assert!(
        prepared.worktree.join(".git").is_file(),
        "linked worktree .git must be a file"
    );
    std::fs::create_dir(git_dir.join("rebase-merge")).unwrap();

    let status = git(
        &prepared.worktree,
        &["status", "--porcelain", "--untracked-files=all"],
    );
    assert!(status.is_empty(), "worktree must look clean: {status}");

    let err = retire_worktree(&repos.repo, &repos.runs_root, "run-1", &no_force())
        .await
        .expect_err("mid-rebase refuses");
    match &err {
        GitError::WorktreeUnresolved { paths } => {
            assert_eq!(paths, &vec!["rebase-merge".to_owned()]);
        }
        other => panic!("expected WorktreeUnresolved, got {other:?}"),
    }
}

#[tokio::test]
async fn merge_head_marker_is_refused_with_marker_name() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;
    let git_dir = git(&prepared.worktree, &["rev-parse", "--absolute-git-dir"]);
    let git_dir = PathBuf::from(git_dir.trim());
    std::fs::write(
        git_dir.join("MERGE_HEAD"),
        format!("{}\n", prepared.base_sha),
    )
    .unwrap();

    let err = retire_worktree(&repos.repo, &repos.runs_root, "run-1", &no_force())
        .await
        .expect_err("marker refuses");
    match &err {
        GitError::WorktreeUnresolved { paths } => {
            assert_eq!(paths, &vec!["MERGE_HEAD".to_owned()]);
        }
        other => panic!("expected WorktreeUnresolved, got {other:?}"),
    }
}

#[tokio::test]
async fn force_requires_both_flags() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;
    std::fs::write(prepared.worktree.join("junk.txt"), "junk\n").unwrap();
    let sibling = repos.runs_root.join("run-other");
    std::fs::create_dir(&sibling).unwrap();

    let force_only = RetireOptions {
        force: true,
        run_state_terminal: false,
    };
    let err = retire_worktree(&repos.repo, &repos.runs_root, "run-1", &force_only)
        .await
        .expect_err("force alone refuses");
    assert!(matches!(err, GitError::WorktreeDirty { .. }), "got {err:?}");

    let terminal_only = RetireOptions {
        force: false,
        run_state_terminal: true,
    };
    let err = retire_worktree(&repos.repo, &repos.runs_root, "run-1", &terminal_only)
        .await
        .expect_err("attestation alone refuses");
    assert!(matches!(err, GitError::WorktreeDirty { .. }), "got {err:?}");

    let both = RetireOptions {
        force: true,
        run_state_terminal: true,
    };
    retire_worktree(&repos.repo, &repos.runs_root, "run-1", &both)
        .await
        .expect("force with attestation succeeds");
    assert!(!prepared.worktree.exists());
    assert!(!prepared.run_dir.exists());
    assert!(!worktree_listed(&repos.repo, &prepared.worktree));
    assert!(sibling.exists(), "sibling run dir must survive");
}

#[tokio::test]
async fn retire_is_idempotent() {
    let repos = setup_repos(BASE);
    let prepared = prepare(&repos, "run-1", "feat/run-1").await;

    retire_worktree(&repos.repo, &repos.runs_root, "run-1", &no_force())
        .await
        .expect("first retire");
    retire_worktree(&repos.repo, &repos.runs_root, "run-1", &no_force())
        .await
        .expect("second retire also succeeds");

    // Worktree dir deleted out from under git: retire still completes.
    let prepared2 = prepare(&repos, "run-2", "feat/run-2").await;
    std::fs::remove_dir_all(&prepared2.worktree).unwrap();
    retire_worktree(&repos.repo, &repos.runs_root, "run-2", &no_force())
        .await
        .expect("retire of deleted worktree succeeds");
    assert!(!prepared2.run_dir.exists());
    assert!(!worktree_listed(&repos.repo, &prepared2.worktree));

    // A run id that never existed retires cleanly too.
    retire_worktree(&repos.repo, &repos.runs_root, "run-never", &no_force())
        .await
        .expect("absent run dir is success");
    let _ = prepared;
}
