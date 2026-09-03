#![cfg(feature = "failpoints")]

//! Failpoint-only end-to-end drive coverage.

use std::process::Stdio;

mod support;

use serde_json::{json, Value};
use support::e2e_drive::*;
use support::{git, rev_parse, TestEnv};

#[cfg(feature = "failpoints")]
#[test]
fn assurance_start_crash_recovers_one_run_and_one_draft_pr() {
    let env = TestEnv::new("forged-rolling-assurance-start-crash");
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-assurance-crash",
        &[("child-assurance-crash", &env.spec, false)],
    );
    env.set_work_field("child-assurance-crash", "status", "closed");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-assurance-crash",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    env.authorize_epic("epic-assurance-crash");
    assert_eq!(env.reconcile_epic("epic-assurance-crash").0, 0);
    let (code, draft) = env.reconcile_epic("epic-assurance-crash");
    assert_eq!(code, 0, "draft PR: {draft}");
    assert_eq!(draft["result"]["progress"]["terminal"], json!(false));

    env.wake_epic("epic-assurance-crash");
    let mut crashed = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "epic.assurance.start.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("assurance start child");
    assert!(
        !crashed.wait().expect("assurance start crash").success(),
        "the process must abort after the durable assurance checkpoint"
    );
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.started")
            .count(),
        1
    );
    ledger.close().expect("close ledger");

    let mut terminal = Value::Null;
    for _ in 0..64 {
        let (code, tick) = env.reconcile_epic("epic-assurance-crash");
        assert_eq!(code, 0, "assurance recovery tick: {tick}");
        terminal = tick;
        if terminal["result"]["stopped"]["assurance"].is_object() {
            break;
        }
    }
    assert!(
        terminal["result"]["stopped"]["assurance"].is_object(),
        "recovered assurance did not converge: {terminal}"
    );
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.started")
            .count(),
        1,
        "recovery reuses the durable assurance checkpoint"
    );
    assert!(ledger
        .get_run("epic-assurance-crash-epic-assurance")
        .is_ok_and(|run| run.state == forged_ledger::RunState::Stopped));
    ledger.close().expect("close ledger");
    let gh_calls = env.gh_calls();
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method POST")
                && call.join(" ").contains("/pulls"))
            .count(),
        1,
        "crash recovery must reuse the draft PR: {gh_calls:?}"
    );
    assert!(gh_calls
        .iter()
        .all(|call| !call.iter().any(|arg| arg == "merge")));
}

#[cfg(feature = "failpoints")]
#[test]
fn assurance_finalization_crashes_replay_completion_and_cleanup() {
    assert_assurance_finalization_cleanup_recovery(false);
    assert_assurance_finalization_cleanup_recovery(true);
}

#[cfg(feature = "failpoints")]
#[test]
fn assurance_body_crash_then_drift_clears_stale_approval_before_stop() {
    let env = TestEnv::new("forged-rolling-assurance-finalize-crash-drift");
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-assurance-finalize-crash-drift",
        &[("child-assurance-finalize-crash-drift", &env.spec, false)],
    );
    env.set_work_field("child-assurance-finalize-crash-drift", "status", "closed");
    assert_eq!(env.forged(&["init"]).0, 0);
    let default_sha = rev_parse(&env.repos.origin, "main");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-assurance-finalize-crash-drift",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    env.authorize_epic("epic-assurance-finalize-crash-drift");
    assert_eq!(
        env.reconcile_epic("epic-assurance-finalize-crash-drift").0,
        0
    );
    let (code, draft) = env.reconcile_epic("epic-assurance-finalize-crash-drift");
    assert_eq!(code, 0, "draft PR: {draft}");
    let number = draft["result"]["progress"]["draftPr"]["number"]
        .as_u64()
        .expect("draft PR number");

    let mut crashed = false;
    for _ in 0..64 {
        env.wake_epic("epic-assurance-finalize-crash-drift");
        let status = env
            .forged_cmd(&["supervise", "--once"])
            .env("FORGED_FAILPOINT", "epic.assurance.pr-body.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("assurance finalization tick");
        if !status.success() {
            crashed = true;
            break;
        }
    }
    assert!(crashed, "finalization must reach the PR-body crash seam");
    let body_path = env.gh_dir.join(format!("pr.{number}.body"));
    assert!(
        std::fs::read_to_string(&body_path)
            .expect("approved PR body")
            .contains("executed and integrally assured by forged"),
        "the crash seam must follow approval publication"
    );

    std::fs::write(env.gh_dir.join(format!("pr.{number}.head")), "main")
        .expect("drift PR head before replay");
    let (code, stopped) = env.reconcile_epic("epic-assurance-finalize-crash-drift");
    assert_eq!(code, 0, "crash-and-drift recovery: {stopped}");
    assert_eq!(
        stopped["result"]["stopped"]["code"],
        json!("assurance-final-evidence-mismatch"),
        "replay did not stop on final evidence drift: {stopped}"
    );
    let body = std::fs::read_to_string(&body_path).expect("recovered PR body");
    assert!(body.contains("has not completed integrated assurance"));
    assert!(body.contains("failed during crash recovery"));
    assert!(body.contains("Do not treat this pull request as assured"));
    assert!(!body.contains("executed and integrally assured by forged"));

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash-drift"), 0, 65_536,)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.completed")
            .count(),
        0,
        "drift recovery cannot record terminal assurance"
    );
    ledger.close().expect("close ledger");
    assert_eq!(rev_parse(&env.repos.origin, "main"), default_sha);
    let gh_calls = env.gh_calls();
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method POST")
                && call.join(" ").contains("/pulls"))
            .count(),
        1,
        "recovery reuses the original draft PR: {gh_calls:?}"
    );
    assert!(gh_calls.iter().all(|call| {
        !call.iter().any(|arg| arg == "merge") && !call.iter().any(|arg| arg == "ready")
    }));
}

#[test]
fn durable_planning_input_mismatch_is_child_addressed_and_preserved() {
    let env = TestEnv::new("forged-rolling-input-mismatch");
    env.set_scenario("epic-plan", "hang", 1);
    start_rolling_plan(&env);
    let (code, prepared) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "prepare active planning run: {prepared}");
    assert_eq!(
        prepared["result"]["waiting"]["reason"],
        json!("planning-running-or-deferred"),
        "planning controller starts through the supervisor tick: {prepared}"
    );
    assert_eq!(
        prepared["result"]["waiting"]["runId"],
        json!("child-stub-epic-plan")
    );
    let worktree = env.worktree("child-stub-epic-plan");
    assert!(worktree.exists());
    let input = env
        .anvil
        .join("runs/child-stub-epic-plan/planning-input.md");
    std::fs::write(&input, "partial planning input\n").expect("simulate surviving torn input");

    let (code, held) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "input mismatch becomes typed epic input: {held}");
    assert_eq!(
        held["result"]["stopped"]["code"],
        json!("planning-input-mismatch")
    );
    assert_eq!(held["result"]["stopped"]["childId"], json!("child-stub"));
    assert!(held["result"]["stopped"]["evidence"]["expectedSha256"].is_string());
    assert!(held["result"]["stopped"]["evidence"]["observedSha256"].is_string());
    assert_eq!(
        std::fs::read_to_string(&input).expect("preserved mismatch"),
        "partial planning input\n",
        "mismatched evidence is preserved for adjudication"
    );
    let (_, active) = env.forged(&["run", "status", "--run", "child-stub-epic-plan"]);
    assert_eq!(active["result"]["run"]["state"], json!("active"));

    #[cfg(feature = "failpoints")]
    for crash in 1..=2 {
        let status = env
            .forged_cmd(&[
                "epic",
                "resolve",
                "--epic",
                "epic-rolling",
                "--child",
                "child-stub",
                "--note",
                "discard the torn input and retry from its durable checkpoint",
            ])
            .env("FORGED_FAILPOINT", "run.settle.controller-revoked.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing planning resolution");
        assert!(!status.success(), "settlement crash {crash} must fire");
        let (_, interrupted) = env.forged(&["run", "status", "--run", "child-stub-epic-plan"]);
        assert_eq!(interrupted["result"]["run"]["state"], json!("stopped"));
        assert_eq!(interrupted["result"]["run"]["outcome"], json!("cancelled"));
        assert!(
            worktree.exists(),
            "terminal state alone cannot authorize retirement after crash {crash}"
        );
        assert!(git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&worktree.to_string_lossy().into_owned()));
    }

    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-rolling",
        "--child",
        "child-stub",
        "--note",
        "discard the torn input and retry from its durable checkpoint",
    ]);
    assert_eq!(code, 0, "resolve active planning hold: {resolved}");
    let (_, stopped) = env.forged(&["run", "status", "--run", "child-stub-epic-plan"]);
    assert_eq!(stopped["result"]["run"]["state"], json!("stopped"));
    assert_eq!(
        stopped["result"]["run"]["outcome"],
        json!("cancelled"),
        "resolution fences the active cycle before cleanup"
    );
    assert!(!worktree.exists());
    assert!(!git(&env.repos.repo, &["worktree", "list", "--porcelain"])
        .contains(&worktree.to_string_lossy().into_owned()));
    let (code, restarted) = env.reconcile_epic("epic-rolling");
    assert_eq!(
        code, 0,
        "restart after active-cycle resolution: {restarted}"
    );
    assert_eq!(
        restarted["result"]["progress"]["planning"]["runId"],
        json!("child-stub-epic-plan-g2"),
        "resolved planning restarts through the pass: {restarted}"
    );
}

#[cfg(feature = "failpoints")]
#[test]
fn rolling_plan_apply_recovers_exact_post_image_without_a_second_work_write() {
    let env = TestEnv::new("forged-rolling-apply-crash");
    prepare_reviewed_rolling_plan(&env);
    env.wake_epic("epic-rolling");
    let mut crashed = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "epic.plan.apply.after-beads")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("epic pass child");
    assert!(
        !crashed.wait().expect("epic pass crash").success(),
        "the process must abort after the Beads write"
    );

    assert_eq!(env.work_status("child-stub"), "open");
    assert_eq!(
        env.work_field("child-stub", "description"),
        "planned context and outcome"
    );
    let update_count = || planning_applies(&env, "child-stub");
    assert_eq!(update_count(), 1, "the guarded apply landed once");
    let ledger = env.ledger();
    let applied_before = ledger
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .into_iter()
        .filter(|event| event.kind == "forged.epic.plan.applied")
        .count();
    ledger.close().expect("close ledger");
    assert_eq!(applied_before, 0, "the crash precedes the epic event");

    let (code, recovered) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "recover exact post-image: {recovered}");
    assert_eq!(
        recovered["result"]["progress"]["apply"]["alreadyApplied"],
        json!(true)
    );
    assert_eq!(
        update_count(),
        1,
        "recovery must not repeat the Beads write"
    );
    let ledger = env.ledger();
    let applied = ledger
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .into_iter()
        .find(|event| event.kind == "forged.epic.plan.applied")
        .expect("applied event");
    let applied_payload: Value =
        serde_json::from_str(&applied.payload_json).expect("applied payload");
    ledger.close().expect("close ledger");
    assert!(applied_payload["observedRevision"].is_string());
    assert!(applied_payload["postRevision"].is_string());
    assert_eq!(
        applied_payload["postReadback"]["revision"],
        applied_payload["postRevision"]
    );
    assert_eq!(
        applied_payload["postDigest"],
        recovered["result"]["progress"]["postDigest"]
    );

    let (code, continuation) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "automatic continuation: {continuation}");
    assert_eq!(
        continuation["result"]["progress"]["launched"][0]["childId"],
        json!("child-stub")
    );
}
