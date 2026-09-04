//! Whole-run settlement through the CLI/core boundary.

mod support;

use std::path::PathBuf;

use serde_json::json;
use support::{fabricate_run, git, TestEnv};

fn seed(env: &TestEnv, run: &str) -> String {
    let work = format!("bead-{run}");
    fabricate_run(env, run);
    env.set_work_field(&work, "status", "in_progress");
    env.set_assignee(&work, &format!("forged:{work}:0"));
    work
}

#[test]
fn landed_closes_releases_and_retires_with_exact_evidence() {
    let env = TestEnv::new("forged-run-landed");
    env.forged(&["init"]);
    let run = "landed-run";
    let work = seed(&env, run);
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
    assert_eq!(env.assignee(&work), None);
    let ledger = env.ledger();
    let closes: Vec<serde_json::Value> = ledger
        .list_events(None, 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "work.updated")
        .map(|event| serde_json::from_str::<serde_json::Value>(&event.payload_json).unwrap())
        .filter(|payload| {
            payload["workId"] == json!(work) && payload["status"]["to"] == json!("closed")
        })
        .collect();
    assert_eq!(closes.len(), 1, "one guarded close: {closes:?}");
    assert_eq!(
        closes[0]["verb"],
        json!("close-held"),
        "landed close must use the holder-guarded CAS, never an unguarded close: {closes:?}"
    );
    assert_eq!(closes[0]["actor"], json!(format!("forged:{work}:0")));
    let item = ledger
        .work_item(&work)
        .expect("work item read")
        .expect("the bead exists");
    assert_eq!(item.status, forged_ledger::WorkStatus::Closed);

    let row = ledger.get_run(run).expect("run");
    assert_eq!(
        row.terminal_outcome,
        Some(forged_ledger::RunOutcome::Landed)
    );
    assert_eq!(row.delivery_pr, Some(121));
    assert_eq!(row.delivery_sha.as_deref(), Some(sha.as_str()));
    let settlement_events = ledger
        .list_events(Some(run), 0, 4096)
        .expect("settlement events");
    assert!(settlement_events
        .iter()
        .any(|event| event.kind == "run.bead-settlement.succeeded"));
    ledger.close().expect("close");

    let ledger = env.ledger();
    let writes_before = ledger
        .list_events(None, 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "work.updated")
        .count();
    ledger.close().expect("close");
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
    let ledger = env.ledger();
    let writes_after = ledger
        .list_events(None, 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "work.updated")
        .count();
    ledger.close().expect("close");
    assert_eq!(writes_after, writes_before, "replay fires no work write");
}

#[test]
fn landed_predecessor_leaves_successor_ownership_unchanged_and_visible() {
    let env = TestEnv::new("forged-run-landed-successor");
    env.forged(&["init"]);
    let run = "landed-predecessor";
    let work = seed(&env, run);
    let successor = "forged:successor:0";
    let revision_before = env.work_revision(&work);
    // The competing claim is constructed BEFORE the stop — the transactional
    // store has no mid-CAS window. The close refuses under the holder CAS
    // and the settlement pends.
    env.set_assignee(&work, successor);
    let sha = "b".repeat(40);

    let (code, response) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "landed",
        "--reason",
        "predecessor delivery landed",
        "--pr",
        "122",
        "--sha",
        &sha,
    ]);
    assert_eq!(code, 0, "{response}");
    assert_eq!(response["ok"], json!(true), "{response}");
    assert_eq!(response["result"]["bead"]["pending"], json!(true));
    assert_eq!(response["result"]["bead"]["settled"], json!(false));
    assert_eq!(env.assignee(&work).as_deref(), Some(successor));
    let ledger = env.ledger();
    let item = ledger
        .work_item(&work)
        .expect("work item read")
        .expect("the bead exists");
    assert_eq!(
        item.status.as_str(),
        "in_progress",
        "the successor claim stands untouched"
    );
    let work_writes: Vec<serde_json::Value> = ledger
        .list_events(None, 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "work.updated")
        .map(|event| serde_json::from_str::<serde_json::Value>(&event.payload_json).unwrap())
        .filter(|payload| payload["workId"] == json!(work))
        .collect();
    ledger.close().expect("close");
    assert!(
        work_writes.is_empty(),
        "the refused close under the predecessor CAS writes nothing — no \
         unguarded close, no settlement note mutation: {work_writes:?}"
    );
    assert_eq!(
        env.work_revision(&work),
        revision_before,
        "coordination refusals never move the revision"
    );
    let ledger = env.ledger();
    let pending = ledger
        .list_events(Some(run), 0, 4096)
        .expect("events")
        .into_iter()
        .find(|event| event.kind == "run.bead-settlement.pending")
        .expect("visible pending settlement event");
    let payload: serde_json::Value =
        serde_json::from_str(&pending.payload_json).expect("pending payload");
    assert_eq!(payload["beadId"], json!(work));
    assert_eq!(payload["outcome"], json!("landed"));
    assert_eq!(
        payload["expectedAssignee"],
        json!(format!("forged:{work}:0"))
    );
    assert_eq!(
        payload["observedHolder"],
        json!(format!("forged:{work}:0")),
        "run stop records the lease holder in force at pend time"
    );
    assert!(
        payload["error"]
            .as_str()
            .is_some_and(|error| error.contains(successor)),
        "{payload}"
    );
    ledger.close().expect("close ledger");

    let writes_before_replay = {
        let ledger = env.ledger();
        let count = ledger
            .list_events(None, 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "work.updated")
            .count();
        ledger.close().expect("close");
        count
    };
    let (code, replay) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "landed",
        "--reason",
        "predecessor delivery landed",
        "--pr",
        "122",
        "--sha",
        &sha,
    ]);
    assert_eq!(code, 0, "{replay}");
    assert_eq!(replay["reused"], json!(true), "{replay}");
    assert_eq!(
        {
            let ledger = env.ledger();
            let count = ledger
                .list_events(None, 0, 65_536)
                .expect("events")
                .into_iter()
                .filter(|event| event.kind == "work.updated")
                .count();
            ledger.close().expect("close");
            count
        },
        writes_before_replay,
        "replay fires no work write"
    );
    assert_eq!(env.assignee(&work).as_deref(), Some(successor));
}

#[test]
fn unresolved_outcomes_release_without_false_completion() {
    let env = TestEnv::new("forged-run-blocked");
    env.forged(&["init"]);
    let run = "blocked-run";
    let work = seed(&env, run);

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
    assert_eq!(env.assignee(&work), None);

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
fn status_flags_an_orphaned_in_progress_work() {
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
            .is_some_and(|detail| detail.contains("execution is no longer live")),
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
            .is_some_and(|detail| detail.contains("retains its work claim")),
        "{response}"
    );
}

#[test]
fn settlement_refreshes_siblings_after_whole_run_deadline_reconciliation() {
    let env = TestEnv::new("forged-run-deadline-snapshot");
    env.forged(&["init"]);
    let run = "deadline-snapshot";
    seed(&env, run);

    let ledger = env.ledger();
    let mut attempts = Vec::new();
    for seq in 0..2 {
        let packet_id = format!("{run}/implement/{seq}");
        let digest = "a".repeat(64);
        let packet = forged_types::WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: packet_id.clone(),
            run_id: run.to_owned(),
            work_id: format!("bead-{run}"),
            stage: forged_types::Stage::Implement,
            execution: None,
            lane_seq: None,
            spec: forged_types::SpecRef {
                path: "beads://fixture".to_owned(),
                sha256: digest.clone(),
                revision: None,
            },
            worktree: PathBuf::from("/unread/worktree"),
            branch: format!("forged/{run}"),
            base_ref: "main".to_owned(),
            contract: forged_types::StageContract {
                instructions: "fixture".to_owned(),
                gate_commands: Vec::new(),
                deliverable: forged_types::Deliverable::CommitsInWorktree,
                budget_s: 1_800,
                seat_commands: Vec::new(),
            },
            result_schema: "forged.result/1".to_owned(),
            provider_hints: forged_types::ProviderHints {
                provider: "claude".to_owned(),
                model: "fixture".to_owned(),
                effort: None,
                sandbox: forged_types::Sandbox::ReadOnly,
            },
            field_notes: Vec::new(),
        };
        ledger
            .open_packet(forged_ledger::NewPacket {
                run_id: run.to_owned(),
                stage: forged_types::Stage::Implement,
                seq,
                spec_path: packet.spec.path.clone(),
                spec_sha256: digest.clone(),
                spec_revision: None,
                policy_revision: None,
                body_json: packet.stored_body().expect("stored packet"),
            })
            .expect("open packet");
        let attempt = ledger
            .claim_packet(
                &packet_id,
                &format!("claude:{packet_id}:2147483647"),
                &forged_ledger::SpecFence::Sha256(digest),
            )
            .expect("claim packet");
        let packet_dir = env.packet_dir(run, "implement", seq);
        std::fs::create_dir_all(&packet_dir).expect("packet dir");
        std::fs::write(packet_dir.join("provider.pid"), "2147483647").expect("dead pid");
        attempts.push(attempt.attempt_id);
    }
    let db = env.anvil.join("state.db");
    let connection = rusqlite::Connection::open(db).expect("open attempt clock");
    connection
        .execute(
            "UPDATE attempts SET started_at = '2020-01-01T00:00:00.000000000Z', \
             updated_at = '2020-01-01T00:00:00.000000000Z'",
            [],
        )
        .expect("expire attempts");
    drop(connection);
    ledger
        .revoke_attempt_scoped(
            attempts[0],
            "transport: stage deadline exceeded: seeded marker",
            forged_ledger::RevokeScope::Deadline,
        )
        .expect("seed first deadline marker");
    ledger.close().expect("close ledger");

    let (code, stopped) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "cancelled",
        "--reason",
        "operator cancelled",
    ]);
    assert_eq!(
        code, 0,
        "settlement must converge from refreshed rows: {stopped}"
    );
    assert_eq!(stopped["ok"], json!(true), "{stopped}");
    assert_eq!(
        stopped["result"]["stoppedAttempts"],
        json!(attempts),
        "settlement reports every attempt the run-scoped pass drained"
    );

    let ledger = env.ledger();
    for attempt_id in attempts.iter().copied() {
        let attempt = ledger.get_attempt(attempt_id).expect("settled attempt");
        assert_eq!(attempt.state, forged_ledger::AttemptState::Failed);
        assert_eq!(
            attempt.revoke_scope,
            Some(forged_ledger::RevokeScope::Deadline),
            "whole-run reconcile owns every expired attempt's terminal scope"
        );
    }
    ledger.close().expect("close ledger");
}
