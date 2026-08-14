//! GhClient behavior against the fake gh shim: pinned argv contracts, typed
//! error classification, the duplicate-PR probe, and marker-deduplicated
//! finding comments. Every test runs from a non-git temp cwd; only the
//! `#[ignore]`d smoke test touches the real gh.

mod common;

use common::{enter_non_git_cwd, pr_json, Shim, SHIM_SCRIPT};
use forged_git::{CommentOutcome, GhClient, GhError};

const REPO: &str = "tcashel/forge";
const PR_FIELDS: &str = "number,state,isDraft,baseRefName,headRefName,url";

fn sv(args: &[&str]) -> Vec<String> {
    args.iter().map(|s| (*s).to_owned()).collect()
}

#[tokio::test]
async fn pr_view_parses_meta_and_pins_argv() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set(
        "pr_view",
        "stdout",
        &pr_json(7, "OPEN", false, "anvil/epic", "feat/x", "https://x/7"),
    );

    let pr = shim.client().pr_view(REPO, 7).await.expect("parses");
    assert_eq!(pr.number, 7);
    assert_eq!(pr.state, "OPEN");
    assert!(!pr.is_draft);
    assert_eq!(pr.base_ref_name, "anvil/epic");
    assert_eq!(pr.head_ref_name, "feat/x");
    assert_eq!(pr.url, "https://x/7");

    let calls = shim.calls();
    assert_eq!(
        calls,
        vec![sv(&[
            "pr", "view", "7", "--repo", REPO, "--json", PR_FIELDS
        ])]
    );
}

#[tokio::test]
async fn default_branch_uses_exactly_gh_api_repos() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set(
        "repo",
        "stdout",
        r#"{"id":1,"name":"forge","default_branch":"main","fork":false}"#,
    );

    let branch = shim
        .client()
        .default_branch(REPO)
        .await
        .expect("deserializes");
    assert_eq!(branch, "main");
    assert_eq!(shim.calls(), vec![sv(&["api", "repos/tcashel/forge"])]);
}

#[tokio::test]
async fn nonzero_exits_classify_into_typed_errors() {
    enter_non_git_cwd();

    // Exit status 4 is Auth regardless of stderr.
    let shim = Shim::new();
    shim.set("repo", "exit", "4");
    let err = shim.client().default_branch(REPO).await.expect_err("auth");
    assert!(matches!(err, GhError::Auth), "got {err:?}");

    // HTTP 401 / HTTP 403 on stderr are Auth.
    for http in ["HTTP 401: Unauthorized", "HTTP 403: Forbidden"] {
        let shim = Shim::new();
        shim.set("repo", "exit", "1");
        shim.set("repo", "stderr", http);
        let err = shim.client().default_branch(REPO).await.expect_err("auth");
        assert!(matches!(err, GhError::Auth), "{http}: got {err:?}");
    }

    // HTTP 404 is NotFound.
    let shim = Shim::new();
    shim.set("repo", "exit", "1");
    shim.set("repo", "stderr", "HTTP 404: Not Found");
    let err = shim
        .client()
        .default_branch(REPO)
        .await
        .expect_err("not found");
    assert!(matches!(err, GhError::NotFound), "got {err:?}");

    // Any other nonzero exit is Exec with status and stderr.
    let shim = Shim::new();
    shim.set("repo", "exit", "1");
    shim.set("repo", "stderr", "boom");
    let err = shim.client().default_branch(REPO).await.expect_err("exec");
    match err {
        GhError::Exec { status, stderr } => {
            assert_eq!(status, Some(1));
            assert!(stderr.contains("boom"), "stderr: {stderr}");
        }
        other => panic!("expected Exec, got {other:?}"),
    }
}

#[tokio::test]
async fn zero_exit_unparseable_stdout_is_json_error() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set("pr_view", "stdout", "this is not json");
    let err = shim.client().pr_view(REPO, 7).await.expect_err("json");
    assert!(matches!(err, GhError::Json { .. }), "got {err:?}");
}

#[tokio::test]
async fn pr_list_head_probes_head_and_base() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set("pr_list", "stdout", "[]");

    let none = shim
        .client()
        .pr_list_head(REPO, "feat/x", "anvil/epic")
        .await
        .expect("empty list");
    assert_eq!(none, None);

    shim.set(
        "pr_list",
        "stdout",
        &format!(
            "[{}]",
            pr_json(9, "OPEN", true, "anvil/epic", "feat/x", "https://x/9")
        ),
    );
    let some = shim
        .client()
        .pr_list_head(REPO, "feat/x", "anvil/epic")
        .await
        .expect("one entry");
    assert_eq!(some.map(|pr| pr.number), Some(9));

    let expected = sv(&[
        "pr",
        "list",
        "--repo",
        REPO,
        "--head",
        "feat/x",
        "--base",
        "anvil/epic",
        "--state",
        "open",
        "--json",
        PR_FIELDS,
    ]);
    assert_eq!(shim.calls(), vec![expected.clone(), expected]);
}

#[tokio::test]
async fn create_draft_pr_returns_existing_open_pr_without_creating() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set(
        "pr_list",
        "stdout",
        &format!(
            "[{}]",
            pr_json(11, "OPEN", true, "anvil/epic", "feat/x", "https://x/11")
        ),
    );

    let pr = shim
        .client()
        .create_draft_pr(REPO, "feat/x", "anvil/epic", "title", "body")
        .await
        .expect("existing PR returned");
    assert_eq!(pr.number, 11);

    let calls = shim.calls();
    assert_eq!(calls.len(), 1, "probe only, no create: {calls:?}");
    assert_eq!(calls[0][..2], sv(&["pr", "list"])[..]);
}

#[tokio::test]
async fn create_draft_pr_proceeds_when_head_pr_targets_other_base() {
    enter_non_git_cwd();
    let shim = Shim::new();
    // The probe filters on base server-side: the same-head PR onto a
    // different base is not returned, so the probe comes back empty.
    shim.set("pr_list", "stdout", "[]");
    shim.set(
        "create_pr",
        "stdout",
        concat!(
            r#"{"number":12,"state":"open","draft":true,"#,
            r#""base":{"ref":"anvil/epic","sha":"abc"},"head":{"ref":"feat/x","sha":"def"},"#,
            r#""html_url":"https://x/12","title":"title"}"#
        ),
    );

    let pr = shim
        .client()
        .create_draft_pr(REPO, "feat/x", "anvil/epic", "title", "body text")
        .await
        .expect("creates");
    assert_eq!(pr.number, 12);
    assert_eq!(pr.state, "OPEN");
    assert!(pr.is_draft);
    assert_eq!(pr.base_ref_name, "anvil/epic");
    assert_eq!(pr.head_ref_name, "feat/x");
    assert_eq!(pr.url, "https://x/12");

    let calls = shim.calls();
    assert_eq!(calls.len(), 2, "probe then create: {calls:?}");
    let probe = &calls[0];
    assert!(probe.contains(&"--head".to_owned()), "probe: {probe:?}");
    assert!(probe.contains(&"--base".to_owned()), "probe: {probe:?}");
    assert_eq!(
        calls[1],
        sv(&[
            "api",
            "--method",
            "POST",
            "repos/tcashel/forge/pulls",
            "-f",
            "title=title",
            "-f",
            "head=feat/x",
            "-f",
            "base=anvil/epic",
            "-f",
            "body=body text",
            "-F",
            "draft=true",
        ])
    );
}

#[tokio::test]
async fn finding_comments_deduplicate_on_the_exact_marker() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set("list_comments", "stdout", "[]");
    shim.set(
        "post_comment",
        "stdout",
        r#"{"id":1,"body":"<!-- anvil-finding id=f-1 -->\nfinding body"}"#,
    );

    let first = shim
        .client()
        .ensure_finding_comment(REPO, 5, "f-1", "finding body")
        .await
        .expect("posts");
    assert_eq!(first, CommentOutcome::Posted);

    // The list call is paginated, and the posted body's FIRST line is the
    // byte-exact marker.
    let calls = shim.calls();
    assert_eq!(
        calls[0],
        sv(&["api", "repos/tcashel/forge/issues/5/comments", "--paginate"])
    );
    assert_eq!(
        calls[1],
        sv(&[
            "api",
            "--method",
            "POST",
            "repos/tcashel/forge/issues/5/comments",
            "-f",
            "body=<!-- anvil-finding id=f-1 -->\nfinding body",
        ])
    );

    // Second call with the marker now present: AlreadyPresent, no new post.
    shim.set(
        "list_comments",
        "stdout",
        r#"[{"body":"<!-- anvil-finding id=f-1 -->\nfinding body","id":1}]"#,
    );
    let second = shim
        .client()
        .ensure_finding_comment(REPO, 5, "f-1", "finding body")
        .await
        .expect("dedupes");
    assert_eq!(second, CommentOutcome::AlreadyPresent);

    let posts = shim
        .calls()
        .into_iter()
        .filter(|argv| argv.get(1).map(String::as_str) == Some("--method"))
        .count();
    assert_eq!(posts, 1, "exactly one comment created");
}

#[tokio::test]
async fn marker_match_is_whole_line_never_substring() {
    enter_non_git_cwd();
    let shim = Shim::new();
    // A marker for id `abcd` must NOT satisfy a probe for id `abc`.
    shim.set(
        "list_comments",
        "stdout",
        r#"[{"body":"<!-- anvil-finding id=abcd -->\nother finding"}]"#,
    );
    shim.set(
        "post_comment",
        "stdout",
        r#"{"id":2,"body":"<!-- anvil-finding id=abc -->\nbody"}"#,
    );

    let outcome = shim
        .client()
        .ensure_finding_comment(REPO, 5, "abc", "body")
        .await
        .expect("posts despite near-collision");
    assert_eq!(outcome, CommentOutcome::Posted);
}

#[tokio::test]
async fn empty_comment_listing_stdout_is_json_error_and_never_posts() {
    enter_non_git_cwd();
    // No list_comments scenario file: the shim exits zero with EMPTY stdout.
    // A genuinely empty comment list is one `[]` page, so zero parsed pages
    // is GhError::Json — and no comment may be posted on the strength of an
    // unparsed listing, or the dedup guarantee is gone.
    let shim = Shim::new();
    shim.set(
        "post_comment",
        "stdout",
        r#"{"id":3,"body":"<!-- anvil-finding id=f-1 -->\nbody"}"#,
    );

    let err = shim
        .client()
        .ensure_finding_comment(REPO, 5, "f-1", "body")
        .await
        .expect_err("empty listing stdout is an error");
    assert!(matches!(err, GhError::Json { .. }), "got {err:?}");

    // Whitespace-only stdout is the same refusal.
    shim.set("list_comments", "stdout", "  \n\t\n");
    let err = shim
        .client()
        .ensure_finding_comment(REPO, 5, "f-1", "body")
        .await
        .expect_err("whitespace listing stdout is an error");
    assert!(matches!(err, GhError::Json { .. }), "got {err:?}");

    let posts = shim
        .calls()
        .into_iter()
        .filter(|argv| argv.get(1).map(String::as_str) == Some("--method"))
        .count();
    assert_eq!(posts, 0, "no comment posted after an unparseable listing");
}

#[tokio::test]
async fn unparseable_post_reply_is_json_error_not_posted() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set("list_comments", "stdout", "[]");
    shim.set("post_comment", "stdout", "created, but not json");

    let err = shim
        .client()
        .ensure_finding_comment(REPO, 5, "f-1", "body")
        .await
        .expect_err("malformed POST reply is an error");
    assert!(matches!(err, GhError::Json { .. }), "got {err:?}");
}

#[tokio::test]
async fn plain_gh_resolves_through_the_child_path_only() {
    enter_non_git_cwd();
    let shim = Shim::new();
    shim.set("repo", "stdout", r#"{"default_branch":"trunk"}"#);

    // GhClient::new() runs plain `gh`; the shim dir is prepended to PATH on
    // the CHILD only — the test process PATH is never mutated.
    let branch = shim
        .path_client()
        .default_branch(REPO)
        .await
        .expect("resolves via child PATH");
    assert_eq!(branch, "trunk");
}

/// Live smoke test — `#[ignore]`d so the default `cargo test` run never
/// touches the network. Run with `cargo test -- --ignored` on a machine with
/// an authenticated gh.
#[tokio::test]
#[ignore]
async fn live_gh_api_smoke() {
    let branch = GhClient::new()
        .default_branch("tcashel/forge")
        .await
        .expect("live gh api call succeeds");
    assert!(!branch.is_empty());
}

/// The shim's exec'd path is published, not written: once `new` returns,
/// `bin/gh` is the only entry there, carries its mode, and holds exactly the
/// script. A surviving staging entry means the rename did not happen and the
/// path the tests exec was opened for writing.
#[test]
fn shim_publishes_gh_by_rename_leaving_no_staging_entry() {
    use std::os::unix::fs::PermissionsExt;

    let shim = Shim::new();

    let mut entries: Vec<String> = std::fs::read_dir(&shim.bin_dir)
        .expect("read bin dir")
        .map(|entry| {
            entry
                .expect("dir entry")
                .file_name()
                .to_string_lossy()
                .into_owned()
        })
        .collect();
    entries.sort();
    assert_eq!(entries, vec!["gh".to_owned()]);

    let program = shim.bin_dir.join("gh");
    let mode = std::fs::metadata(&program)
        .expect("gh exists")
        .permissions()
        .mode();
    assert_eq!(mode & 0o777, 0o755, "published with its mode");
    assert_eq!(
        std::fs::read_to_string(&program).expect("read gh"),
        SHIM_SCRIPT
    );
}
