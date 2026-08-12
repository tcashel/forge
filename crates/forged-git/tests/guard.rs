//! Merge-guard refusal matrix and the merge happy path against the gh shim,
//! plus the full GitError -> ErrorCode mapping.

mod common;

use common::{enter_non_git_cwd, pr_json, Shim};
use forged_git::{assert_merge_allowed, merge_pr, GhError, GitError};
use forged_types::ErrorCode;

const REPO: &str = "tcashel/forge";
const EPIC: &str = "anvil/epic";
const PR_FIELDS: &str = "number,state,isDraft,baseRefName,headRefName,url";

fn sv(args: &[&str]) -> Vec<String> {
    args.iter().map(|s| (*s).to_owned()).collect()
}

fn guard_endpoint_calls() -> [Vec<String>; 2] {
    [
        sv(&["pr", "view", "7", "--repo", REPO, "--json", PR_FIELDS]),
        sv(&["api", "repos/tcashel/forge"]),
    ]
}

/// Scenario: PR 7 in `state`/`is_draft` on `base`, repo default branch
/// `default_branch`.
fn arrange(shim: &Shim, state: &str, is_draft: bool, base: &str, default_branch: &str) {
    shim.set(
        "pr_view",
        "stdout",
        &pr_json(7, state, is_draft, base, "feat/x", "https://x/7"),
    );
    shim.set(
        "repo",
        "stdout",
        &format!(r#"{{"default_branch":"{default_branch}"}}"#),
    );
}

#[tokio::test]
async fn base_mismatch_is_refused() {
    enter_non_git_cwd();
    let shim = Shim::new();
    arrange(&shim, "OPEN", false, "some/other", "main");

    let err = assert_merge_allowed(&shim.client(), REPO, 7, EPIC)
        .await
        .expect_err("refuses");
    match err {
        GitError::PrBaseMismatch { expected, actual } => {
            assert_eq!(expected, EPIC);
            assert_eq!(actual, "some/other");
        }
        other => panic!("expected PrBaseMismatch, got {other:?}"),
    }
}

#[tokio::test]
async fn default_branch_base_is_refused() {
    enter_non_git_cwd();
    let shim = Shim::new();
    arrange(&shim, "OPEN", false, "main", "main");

    let err = assert_merge_allowed(&shim.client(), REPO, 7, "main")
        .await
        .expect_err("refuses");
    match err {
        GitError::DefaultBranchForbidden { default_branch } => {
            assert_eq!(default_branch, "main");
        }
        other => panic!("expected DefaultBranchForbidden, got {other:?}"),
    }
}

#[tokio::test]
async fn closed_merged_and_draft_prs_are_not_mergeable() {
    enter_non_git_cwd();
    for (state, is_draft) in [("CLOSED", false), ("MERGED", false), ("OPEN", true)] {
        let shim = Shim::new();
        arrange(&shim, state, is_draft, EPIC, "main");

        let err = assert_merge_allowed(&shim.client(), REPO, 7, EPIC)
            .await
            .expect_err("refuses");
        match &err {
            GitError::PrNotMergeable {
                state: got_state,
                is_draft: got_draft,
            } => {
                assert_eq!(got_state, state);
                assert_eq!(*got_draft, is_draft);
            }
            other => panic!("expected PrNotMergeable, got {other:?}"),
        }
        assert_eq!(err.code(), ErrorCode::InvalidRequest);
    }
}

#[tokio::test]
async fn base_mismatch_wins_over_not_mergeable() {
    enter_non_git_cwd();
    let shim = Shim::new();
    arrange(&shim, "CLOSED", true, "some/other", "main");

    let err = assert_merge_allowed(&shim.client(), REPO, 7, EPIC)
        .await
        .expect_err("refuses");
    assert!(
        matches!(err, GitError::PrBaseMismatch { .. }),
        "got {err:?}"
    );
}

#[tokio::test]
async fn guard_fetches_both_endpoints_fresh_on_every_invocation() {
    enter_non_git_cwd();
    let shim = Shim::new();
    arrange(&shim, "OPEN", false, EPIC, "main");
    let client = shim.client();

    let pr = assert_merge_allowed(&client, REPO, 7, EPIC)
        .await
        .expect("first call passes");
    assert_eq!(pr.number, 7);

    // The scenario mutates between the two calls; a cached view would still
    // pass, a fresh fetch must refuse.
    arrange(&shim, "OPEN", false, "some/other", "main");
    let err = assert_merge_allowed(&client, REPO, 7, EPIC)
        .await
        .expect_err("second call refuses");
    assert!(
        matches!(err, GitError::PrBaseMismatch { .. }),
        "got {err:?}"
    );

    let [view, repo_call] = guard_endpoint_calls();
    assert_eq!(
        shim.calls(),
        vec![view.clone(), repo_call.clone(), view, repo_call],
        "both endpoints hit on every guard invocation"
    );
}

#[tokio::test]
async fn both_fetches_run_even_when_the_first_fails() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set("pr_view", "exit", "1");
    shim.set("pr_view", "stderr", "pr fetch broke");
    shim.set("repo", "exit", "1");
    shim.set("repo", "stderr", "repo fetch broke");

    let err = assert_merge_allowed(&shim.client(), REPO, 7, EPIC)
        .await
        .expect_err("propagates the PR-fetch error first");
    match &err {
        GitError::Gh(GhError::Exec { stderr, .. }) => {
            assert!(stderr.contains("pr fetch broke"), "stderr: {stderr}");
        }
        other => panic!("expected Gh(Exec), got {other:?}"),
    }
    assert_eq!(err.code(), ErrorCode::GhError);

    let [view, repo_call] = guard_endpoint_calls();
    assert_eq!(
        shim.calls(),
        vec![view, repo_call],
        "no short-circuit: both endpoints invoked and awaited"
    );
}

#[tokio::test]
async fn merge_pr_on_a_refused_pr_performs_no_mutation() {
    enter_non_git_cwd();
    let shim = Shim::new();
    arrange(&shim, "OPEN", true, EPIC, "main");

    let err = merge_pr(&shim.client(), REPO, 7, EPIC)
        .await
        .expect_err("refuses");
    assert!(
        matches!(err, GitError::PrNotMergeable { .. }),
        "got {err:?}"
    );

    let merges = shim
        .calls()
        .into_iter()
        .filter(|argv| {
            argv.first().map(String::as_str) == Some("pr")
                && argv.get(1).map(String::as_str) == Some("merge")
        })
        .count();
    assert_eq!(merges, 0, "call log shows no merge invocation");
}

#[tokio::test]
async fn merge_happy_path_runs_exactly_one_pinned_merge() {
    enter_non_git_cwd();
    let shim = Shim::new();
    arrange(&shim, "OPEN", false, EPIC, "main");
    shim.set("pr_merge", "stdout", "");

    let pr = merge_pr(&shim.client(), REPO, 7, EPIC)
        .await
        .expect("merges");
    // The returned PrMeta is the guard's fetch, not a re-read.
    assert_eq!(pr.number, 7);
    assert_eq!(pr.state, "OPEN");
    assert_eq!(pr.base_ref_name, EPIC);

    let [view, repo_call] = guard_endpoint_calls();
    assert_eq!(
        shim.calls(),
        vec![
            view,
            repo_call,
            sv(&[
                "pr",
                "merge",
                "7",
                "--repo",
                REPO,
                "--squash",
                "--delete-branch=false",
            ]),
        ],
        "exactly one merge, preceded by both guard endpoints, nothing between"
    );
}

#[test]
fn git_error_codes_map_the_full_matrix() {
    let io = || std::io::Error::other("io");
    let cases: Vec<(GitError, ErrorCode)> = vec![
        (
            GitError::WorktreeExists {
                path: "p".to_owned(),
            },
            ErrorCode::InvalidRequest,
        ),
        (
            GitError::WorktreeDirty { paths: vec![] },
            ErrorCode::WorktreeDirty,
        ),
        (
            GitError::WorktreeUnresolved { paths: vec![] },
            ErrorCode::WorktreeDirty,
        ),
        (
            GitError::BaseNotFound {
                base: "b".to_owned(),
                detail: "d".to_owned(),
            },
            ErrorCode::InvalidRequest,
        ),
        (
            GitError::BaseShaMismatch {
                expected: "e".to_owned(),
                actual: "a".to_owned(),
            },
            ErrorCode::InvalidRequest,
        ),
        (
            GitError::PrBaseMismatch {
                expected: "e".to_owned(),
                actual: "a".to_owned(),
            },
            ErrorCode::PrBaseMismatch,
        ),
        (
            GitError::DefaultBranchForbidden {
                default_branch: "main".to_owned(),
            },
            ErrorCode::DefaultBranchForbidden,
        ),
        (
            GitError::PrNotMergeable {
                state: "CLOSED".to_owned(),
                is_draft: false,
            },
            ErrorCode::InvalidRequest,
        ),
        (GitError::Gh(GhError::NotFound), ErrorCode::GhError),
        (GitError::Gh(GhError::Auth), ErrorCode::GhError),
        (
            GitError::Gh(GhError::Json {
                message: "m".to_owned(),
            }),
            ErrorCode::GhError,
        ),
        (
            GitError::Gh(GhError::Exec {
                status: Some(1),
                stderr: "s".to_owned(),
            }),
            ErrorCode::GhError,
        ),
        (
            GitError::InvalidRunId(forged_types::RunIdError::Charset),
            ErrorCode::InvalidRequest,
        ),
        (
            GitError::InvalidPath {
                message: "m".to_owned(),
            },
            ErrorCode::InvalidRequest,
        ),
        (
            GitError::Exec {
                command: "c".to_owned(),
                stderr: "s".to_owned(),
            },
            ErrorCode::Internal,
        ),
        (GitError::Io(io()), ErrorCode::Internal),
    ];
    for (err, expected) in cases {
        assert_eq!(err.code(), expected, "for {err:?}");
    }
}
