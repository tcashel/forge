#[cfg(feature = "failpoints")]
use std::process::Stdio;

use serde_json::{json, Value};

use super::TestEnv;
#[cfg(feature = "failpoints")]
use super::{git, rev_parse};

pub(crate) fn wait_for(env: &TestEnv, args: &[&str], ready: impl Fn(&Value) -> bool) -> Value {
    let mut last = Value::Null;
    for _ in 0..600 {
        let (code, value) = env.forged(args);
        if code == 0 && ready(&value) {
            return value;
        }
        last = value;
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    panic!("timed out waiting for forged {args:?}: {last}")
}

pub(crate) fn drive_internal_plan_to_stop(env: &TestEnv, run: &str) -> Value {
    let claim = format!("test:planning-settlement:{run}");
    let ledger = env.ledger();
    ledger
        .claim_desired_control(
            forged_ledger::DesiredSubjectKind::Epic,
            "epic-rolling",
            &claim,
            "2000-01-01T00:00:00.000000000Z",
            "2100-01-01T00:00:00.000000000Z",
        )
        .expect("claim epic pass boundary")
        .expect("epic pass boundary is claimable");
    ledger.close().expect("close ledger");

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "planning supervisor tick: {tick}");
    let stopped = wait_for(env, &["run", "status", "--run", run], |status| {
        status["result"]["run"]["state"] == json!("stopped")
    });
    let ledger = env.ledger();
    ledger
        .release_desired_claim(
            forged_ledger::DesiredSubjectKind::Epic,
            "epic-rolling",
            &claim,
        )
        .expect("release epic pass boundary");
    ledger.close().expect("close ledger");
    stopped
}

pub(crate) fn reach_rolling_planning_boundary(env: &TestEnv) -> usize {
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-rolling",
        &[
            ("child-wave", &env.spec, true),
            ("child-next", &env.spec, false),
            ("child-stub", &env.spec, false),
        ],
    );
    env.set_work_field("child-stub", "description", "");
    env.set_work_field("child-stub", "acceptance", "");
    env.set_work_field("child-stub", "design", "frozen hint");
    env.set_work_field("child-stub", "notes", "frozen note");
    env.set_work_field("child-stub", "status", "blocked");
    env.set_work_field("child-stub", "dependencies", "[]");
    env.set_work_field("child-stub", "priority", "0");
    env.set_work_field("child-next", "priority", "4");
    // `ready: false` no longer withholds an open child: readiness is a store
    // query. Hold child-next off the frontier the way the graph does, so the
    // release in `start_rolling_plan` is a real state change.
    env.set_work_field(
        "child-next",
        "dependencies",
        r#"[{"id":"child-next-blocker","dependency_type":"blocks","status":"open"}]"#,
    );
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-rolling",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    assert_eq!(
        started["result"]["planningPackage"]["protocolRef"]["name"],
        json!("epic-plan")
    );
    env.authorize_epic("epic-rolling");

    let (code, integration) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "integration: {integration}");
    let (code, dispatched) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "initial dispatch: {dispatched}");
    assert_eq!(
        dispatched["result"]["progress"]["launched"][0]["childId"],
        json!("child-wave")
    );
    let (code, admitted) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "initial child admission: {admitted}");
    let initial = wait_for(env, &["run", "status", "--run", "child-wave"], |value| {
        value["result"]["run"]["outcome"] == json!("clean")
    });
    assert_eq!(initial["result"]["run"]["state"], json!("stopped"));
    let (code, merged) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "initial merge: {merged}");
    assert_eq!(merged["result"]["progress"]["childId"], json!("child-wave"));
    env.gh_calls().len()
}

/// How many guarded planning applies landed for one work item — the
/// transactional witness the bd argv count used to approximate.
pub(crate) fn planning_applies(env: &TestEnv, work_id: &str) -> usize {
    let ledger = env.ledger();
    let count = ledger
        .list_events(None, 0, 65_536)
        .expect("work.updated events")
        .into_iter()
        .filter(|event| {
            event.kind == "work.updated"
                && serde_json::from_str::<Value>(&event.payload_json).is_ok_and(|payload| {
                    payload["workId"] == json!(work_id)
                        && payload["verb"] == json!("planning-apply")
                })
        })
        .count();
    ledger.close().expect("close ledger");
    count
}

pub(crate) fn start_rolling_plan(env: &TestEnv) -> usize {
    let gh_before_plan = reach_rolling_planning_boundary(env);
    let (code, planning) = env.reconcile_epic("epic-rolling");
    assert_eq!(code, 0, "planning dispatch: {planning}");
    assert_eq!(
        planning["result"]["progress"]["planning"]["childId"],
        json!("child-stub")
    );
    let (_, status) = env.forged(&["epic", "status", "--epic", "epic-rolling"]);
    let children = status["result"]["children"]
        .as_array()
        .expect("child projection");
    let completed = children
        .iter()
        .find(|child| child["id"] == "child-wave")
        .expect("completed child projection");
    assert_eq!(completed["runId"], json!("child-wave"));
    assert!(completed["merged"].is_object());
    let stub = children
        .iter()
        .find(|child| child["id"] == "child-stub")
        .expect("stub projection");
    assert_eq!(stub["runId"], json!("child-stub-epic-plan"));
    assert_eq!(stub["phase"], json!("planning"));
    assert_eq!(status["result"]["counts"]["active"], json!(1));
    assert_eq!(status["result"]["counts"]["queuedDeferred"], json!(0));
    gh_before_plan
}

pub(crate) fn prepare_reviewed_rolling_plan(env: &TestEnv) -> usize {
    let gh_before_plan = start_rolling_plan(env);
    let plan_run = "child-stub-epic-plan";
    let stopped = drive_internal_plan_to_stop(env, plan_run);
    assert_eq!(stopped["result"]["run"]["outcome"], json!("clean"));
    assert!(
        env.worktree(plan_run).exists(),
        "reviewed planning artifacts remain until guarded apply"
    );
    assert_eq!(
        env.gh_calls().len(),
        gh_before_plan,
        "the complete planning protocol has zero GitHub effects"
    );
    gh_before_plan
}

#[cfg(feature = "failpoints")]
pub(crate) fn assert_assurance_finalization_cleanup_recovery(unresolved_cleanup: bool) {
    let env = TestEnv::new(if unresolved_cleanup {
        "forged-rolling-assurance-finalize-unresolved"
    } else {
        "forged-rolling-assurance-finalize-dirty"
    });
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-assurance-finalize-crash",
        &[("child-assurance-finalize-crash", &env.spec, false)],
    );
    env.set_work_field("child-assurance-finalize-crash", "status", "closed");
    assert_eq!(env.forged(&["init"]).0, 0);
    let default_sha = rev_parse(&env.repos.origin, "main");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-assurance-finalize-crash",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    env.authorize_epic("epic-assurance-finalize-crash");
    assert_eq!(env.reconcile_epic("epic-assurance-finalize-crash").0, 0);
    let (code, draft) = env.reconcile_epic("epic-assurance-finalize-crash");
    assert_eq!(code, 0, "draft PR: {draft}");
    let draft_pr = draft["result"]["progress"]["draftPr"].clone();

    let mut crashed = false;
    for _ in 0..64 {
        env.wake_epic("epic-assurance-finalize-crash");
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

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.completed")
            .count(),
        0,
        "a body update alone is not terminal"
    );
    let desired = ledger
        .get_desired_work(
            forged_ledger::DesiredSubjectKind::Epic,
            "epic-assurance-finalize-crash",
        )
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.desired_state, forged_ledger::DesiredState::Running);
    ledger.close().expect("close ledger");

    let mut completion_crashed = false;
    for _ in 0..64 {
        env.wake_epic("epic-assurance-finalize-crash");
        let status = env
            .forged_cmd(&["supervise", "--once"])
            .env("FORGED_FAILPOINT", "epic.assurance.finalized.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("assurance completion tick");
        if !status.success() {
            completion_crashed = true;
            break;
        }
    }
    assert!(
        completion_crashed,
        "finalization must reach the completion-before-cleanup crash seam"
    );
    let assurance_worktree = env.worktree("epic-assurance-finalize-crash-epic-assurance");
    assert!(
        assurance_worktree.exists(),
        "the crash seam precedes assurance worktree retirement"
    );
    assert!(
        git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&assurance_worktree.to_string_lossy().into_owned()),
        "the crash seam leaves the worktree registered for replay"
    );
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.finalized")
            .count(),
        1,
        "final binding evidence lands once before cleanup"
    );
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.completed")
            .count(),
        0,
        "cleanup has not crossed the terminal completion boundary"
    );
    let desired = ledger
        .get_desired_work(
            forged_ledger::DesiredSubjectKind::Epic,
            "epic-assurance-finalize-crash",
        )
        .expect("desired query")
        .expect("desired row");
    assert_eq!(
        desired.desired_state,
        forged_ledger::DesiredState::Running,
        "the supervisor must retry cleanup before terminal settlement"
    );
    ledger.close().expect("close ledger");
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open finalization operation database");
    let (operation_state, operation_response): (String, String) = connection
        .query_row(
            "SELECT state, response_json FROM operations
             WHERE name = 'epic_pr_finalize' AND run_id = 'epic-assurance-finalize-crash'",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("finalization operation");
    assert_eq!(
        operation_state, "terminal",
        "cleanup cannot bypass an in-progress external effect"
    );
    let operation_response: Value =
        serde_json::from_str(&operation_response).expect("finalization response JSON");
    assert_eq!(operation_response["ok"], json!(true));
    drop(connection);

    let unrelated_input = json!({
        "code": "operator-contract-question",
        "childId": "child-assurance-finalize-crash",
        "detail": "answer this unrelated question first",
    });
    let ledger = env.ledger();
    ledger
        .append_event_once(
            "epic-assurance-finalize-crash",
            "forged.epic.input.required",
            unrelated_input.clone(),
        )
        .expect("inject unrelated input hold");
    ledger.close().expect("close ledger");
    let (code, unrelated) = env.reconcile_epic("epic-assurance-finalize-crash");
    assert_eq!(code, 0, "unrelated input retains precedence: {unrelated}");
    assert_eq!(
        unrelated["result"]["stopped"], unrelated_input,
        "finalized cleanup must not bypass unrelated input"
    );
    assert!(
        assurance_worktree.exists(),
        "unrelated input prevents cleanup from touching the worktree"
    );
    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-assurance-finalize-crash",
        "--child",
        "child-assurance-finalize-crash",
        "--note",
        "unrelated question answered",
    ]);
    assert_eq!(code, 0, "resolve unrelated input: {resolved}");

    let blocker = if unresolved_cleanup {
        let assurance_git_dir = git(&assurance_worktree, &["rev-parse", "--absolute-git-dir"]);
        let merge_head = std::path::Path::new(assurance_git_dir.trim()).join("MERGE_HEAD");
        std::fs::write(&merge_head, format!("{default_sha}\n"))
            .expect("mark assurance worktree unresolved");
        merge_head
    } else {
        let dirty_path = assurance_worktree.join("operator-notes.txt");
        std::fs::write(&dirty_path, "preserve me\n").expect("dirty assurance worktree");
        dirty_path
    };
    let (code, held) = env.reconcile_epic("epic-assurance-finalize-crash");
    assert_eq!(code, 0, "blocked cleanup becomes typed input: {held}");
    let cleanup_input = held["result"]["stopped"].clone();
    assert_eq!(cleanup_input["code"], json!("assurance-cleanup-failed"));
    assert_eq!(
        cleanup_input["evidence"]["error"]["code"],
        if unresolved_cleanup {
            json!("WORKTREE_UNRESOLVED")
        } else {
            json!("WORKTREE_DIRTY")
        }
    );
    assert_eq!(
        cleanup_input["evidence"]["error"]["kind"],
        if unresolved_cleanup {
            json!("unresolved")
        } else {
            json!("dirty")
        }
    );
    assert_eq!(
        cleanup_input["evidence"]["runId"],
        json!("epic-assurance-finalize-crash-epic-assurance")
    );
    assert_eq!(
        cleanup_input["evidence"]["worktree"],
        json!(assurance_worktree)
    );
    assert_eq!(
        cleanup_input["evidence"]["error"]["paths"],
        if unresolved_cleanup {
            json!(["MERGE_HEAD"])
        } else {
            json!(["operator-notes.txt"])
        }
    );
    let (code, held_again) = env.reconcile_epic("epic-assurance-finalize-crash");
    assert_eq!(
        code, 0,
        "repeated dirty cleanup remains typed input: {held_again}"
    );
    assert_eq!(
        held_again["result"]["stopped"], cleanup_input,
        "the standing cleanup hold is reused verbatim"
    );
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.input.required")
            .count(),
        2,
        "cleanup retries must not append duplicate input events"
    );
    ledger.close().expect("close ledger");
    std::fs::remove_file(&blocker).expect("clean assurance worktree blocker");

    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(code, 0, "status during cleanup gap: {status}");
    assert!(status["result"]["finalPr"].is_null());
    assert!(status["result"]["assurance"]["completed"].is_null());
    assert_eq!(
        status["result"]["inputRequired"], cleanup_input,
        "the cleanup hold remains inspectable until explicit resolution"
    );
    let (code, detail) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "epic",
        "--subject-id",
        "epic-assurance-finalize-crash",
    ]);
    assert_eq!(code, 0, "Work Detail during cleanup gap: {detail}");
    assert_ne!(
        detail["result"]["status"]["state"],
        json!("submitted"),
        "no consumer may project terminal completion before cleanup: {detail}"
    );
    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-assurance-finalize-crash",
        "--note",
        "assurance cleanup blocker removed",
    ]);
    assert_eq!(code, 0, "resolve assurance cleanup hold: {resolved}");

    let mut terminal = Value::Null;
    for _ in 0..8 {
        let (code, tick) = env.reconcile_epic("epic-assurance-finalize-crash");
        assert_eq!(code, 0, "assurance finalization recovery: {tick}");
        terminal = tick;
        if terminal["result"]["stopped"]["assurance"].is_object() {
            break;
        }
    }
    assert!(
        terminal["result"]["stopped"]["assurance"].is_object(),
        "replayed finalization did not complete: {terminal}"
    );
    assert_eq!(
        terminal["result"]["stopped"]["assurance"]["pr"]["number"],
        draft_pr["number"]
    );
    assert_eq!(
        terminal["result"]["stopped"]["assurance"]["pr"]["url"],
        draft_pr["url"]
    );
    assert!(!assurance_worktree.exists());
    assert!(
        !git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&assurance_worktree.to_string_lossy().into_owned()),
        "cleanup replay removes the worktree registration"
    );
    let (code, replayed) =
        env.forged(&["epic", "status", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(code, 0, "terminal cleanup projection: {replayed}");
    assert_eq!(
        replayed["result"]["assurance"]["completed"]["pr"]["number"],
        draft_pr["number"]
    );
    assert!(!assurance_worktree.exists());

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.completed")
            .count(),
        1,
        "replay records one completion event"
    );
    let desired = ledger
        .get_desired_work(
            forged_ledger::DesiredSubjectKind::Epic,
            "epic-assurance-finalize-crash",
        )
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.desired_state, forged_ledger::DesiredState::Stopped);
    assert_eq!(
        desired.last_outcome,
        Some(forged_ledger::DesiredReconcileOutcome::Terminal)
    );
    let events = ledger
        .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
        .expect("epic events");
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.epic.input.required")
            .count(),
        2
    );
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.epic.input.resolved")
            .count(),
        2,
        "successful cleanup clears its typed input rail"
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
        "finalization recovery reuses the draft PR: {gh_calls:?}"
    );
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method PATCH")
                && call.join(" ").contains("/pulls/"))
            .count(),
        4,
        "each attempt clears stale approval before rechecking and publishing: {gh_calls:?}"
    );
    assert!(gh_calls.iter().all(|call| {
        !call.iter().any(|arg| arg == "merge") && !call.iter().any(|arg| arg == "ready")
    }));

    let unavailable_repo = env.root.join("repo-unavailable-after-completion");
    std::fs::rename(&env.repos.repo, &unavailable_repo)
        .expect("make repository unavailable after terminal completion");
    let (code, terminal_status) =
        env.forged(&["epic", "status", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(
        code, 0,
        "terminal status remains durable without the repository: {terminal_status}"
    );
    assert_eq!(
        terminal_status["result"]["finalPr"]["number"],
        draft_pr["number"]
    );
    assert!(terminal_status["result"]["inputRequired"].is_null());
}
