//! Whole-run settlement through the CLI/core boundary.

mod support;

use serde_json::json;
use support::{fabricate_run, git, TestEnv};

fn seed(env: &TestEnv, run: &str) -> String {
    let bead = format!("bead-{run}");
    fabricate_run(env, run);
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, &format!("forged:{bead}:0"));
    bead
}

#[test]
fn landed_closes_releases_and_retires_with_exact_evidence() {
    let env = TestEnv::new("forged-run-landed");
    env.forged(&["init"]);
    let run = "landed-run";
    let bead = seed(&env, run);
    let sha = "a".repeat(40);
    let worktree = env.worktree(run);
    std::fs::create_dir_all(worktree.parent().expect("run dir")).expect("run dir");
    git(
        &env.repos.repo,
        &[
            "worktree",
            "add",
            "-b",
            "forged/landed-run",
            worktree.to_str().expect("path"),
            "main",
        ],
    );
    std::fs::write(worktree.join("squashed.txt"), "delivery\n").expect("worktree file");
    git(&worktree, &["add", "squashed.txt"]);
    git(&worktree, &["commit", "-m", "feat: squashed delivery"]);
    assert!(worktree.exists());

    let (code, response) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "landed",
        "--reason",
        "delivery verified",
        "--pr",
        "121",
        "--sha",
        &sha,
    ]);
    assert_eq!(code, 0, "{response}");
    assert_eq!(response["ok"], json!(true), "{response}");
    assert_eq!(response["result"]["outcome"], json!("landed"));
    assert_eq!(response["result"]["bead"]["closed"], json!(true));
    assert_eq!(response["result"]["bead"]["released"], json!(true));
    assert_eq!(response["result"]["worktreeRetired"], json!(true));
    assert!(
        !worktree.exists(),
        "a clean squash-merged branch retires without requiring ancestry"
    );
    assert_eq!(env.assignee(&bead), None);
    assert_eq!(
        std::fs::read_to_string(env.beads_dir.join(format!("shim-state/{bead}.status")))
            .expect("status"),
        "closed"
    );

    let ledger = env.ledger();
    let row = ledger.get_run(run).expect("run");
    assert_eq!(
        row.terminal_outcome,
        Some(forged_ledger::RunOutcome::Landed)
    );
    assert_eq!(row.delivery_pr, Some(121));
    assert_eq!(row.delivery_sha.as_deref(), Some(sha.as_str()));
    ledger.close().expect("close");

    let before = env.bd_calls().len();
    let (code, replay) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "landed",
        "--reason",
        "delivery verified",
        "--pr",
        "121",
        "--sha",
        &sha,
    ]);
    assert_eq!(code, 0, "{replay}");
    assert_eq!(replay["reused"], json!(true));
    assert_eq!(env.bd_calls().len(), before, "replay fires no Beads write");
}

#[test]
fn unresolved_outcomes_release_without_false_completion() {
    let env = TestEnv::new("forged-run-blocked");
    env.forged(&["init"]);
    let run = "blocked-run";
    let bead = seed(&env, run);

    let (code, response) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "input-required",
        "--reason",
        "operator must choose a migration strategy",
    ]);
    assert_eq!(code, 0, "{response}");
    assert_eq!(response["result"]["bead"]["status"], json!("blocked"));
    assert_eq!(response["result"]["bead"]["released"], json!(true));
    assert_eq!(response["result"]["worktreeRetired"], json!(false));
    assert_eq!(env.assignee(&bead), None);

    let ledger = env.ledger();
    let row = ledger.get_run(run).expect("run");
    assert_eq!(
        row.terminal_outcome,
        Some(forged_ledger::RunOutcome::InputRequired)
    );
    assert_eq!(
        row.stop_reason.as_deref(),
        Some("operator must choose a migration strategy")
    );
    ledger.close().expect("close");
}

#[test]
fn status_flags_an_orphaned_in_progress_bead() {
    let env = TestEnv::new("forged-run-stale-claim");
    env.forged(&["init"]);
    let run = "stale-run";
    seed(&env, run);

    let (code, response) = env.forged(&["run", "status", "--run", run]);
    assert_eq!(code, 0, "{response}");
    let health = &response["result"]["run"]["claimHealth"];
    assert_eq!(health["known"], json!(true));
    assert_eq!(health["status"], json!("in_progress"));
    assert_eq!(health["staleInProgress"], json!(true));
    assert!(
        health["detail"]
            .as_str()
            .is_some_and(|detail| detail.contains("no live controller")),
        "{response}"
    );
}

#[test]
fn clean_candidate_claim_is_awaiting_delivery_not_stale() {
    let env = TestEnv::new("forged-run-clean-claim");
    env.forged(&["init"]);
    let run = "clean-run";
    seed(&env, run);

    let (code, settled) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "clean",
        "--reason",
        "review approved; awaiting delivery",
    ]);
    assert_eq!(code, 0, "{settled}");
    let (code, response) = env.forged(&["run", "status", "--run", run]);
    assert_eq!(code, 0, "{response}");
    let health = &response["result"]["run"]["claimHealth"];
    assert_eq!(health["staleInProgress"], json!(false), "{response}");
    assert!(
        health["detail"]
            .as_str()
            .is_some_and(|detail| detail.contains("retains its Beads claim")),
        "{response}"
    );
}
