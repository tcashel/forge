//! Deadline convergence at the public operation and run-serialization seams.

mod support;

use std::path::PathBuf;

use forged_ledger::{AttemptState, RunOutcome, RunState, SpecFence};
use forged_types::{Deliverable, Outcome, PacketResult, Sandbox, Stage, WorkPacket};
use serde_json::json;
#[cfg(feature = "failpoints")]
use serde_json::Value;
use support::{fabricate_run, TestEnv};

fn start_bead_run(env: &TestEnv, bead: &str) {
    let (code, init) = env.forged(&["init"]);
    assert_eq!(code, 0, "init: {init}");
    env.seed_bead_spec(
        bead,
        "## Context\\n\\ntest deadline convergence",
        "- converges",
    );
    env.set_bead_field(bead, "revision", "1");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        bead,
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    env.authorize_run(bead);
}

fn advance_to_open_packet(env: &TestEnv, run: &str) -> forged_ledger::PacketRow {
    for _ in 0..40 {
        let ledger = env.ledger();
        let packet = ledger
            .list_packets(run)
            .expect("packets")
            .into_iter()
            .next();
        ledger.close().expect("close ledger");
        if let Some(packet) = packet {
            return packet;
        }
        let (code, advanced) = env.forged(&["run", "advance", "--run", run]);
        assert_eq!(code, 0, "advance {run}: {advanced}");
    }
    panic!("{run} never opened a packet");
}

fn backdate_attempt(env: &TestEnv, attempt_id: i64) {
    let connection = rusqlite::Connection::open(env.anvil.join("state.db")).expect("ledger db");
    connection
        .execute(
            "UPDATE attempts SET started_at = '2000-01-01T00:00:00.000000000Z', \
             updated_at = '2000-01-01T00:00:00.000000000Z', \
             last_heartbeat_at = '2000-01-01T00:00:00.000000000Z' \
             WHERE attempt_id = ?1",
            [attempt_id],
        )
        .expect("backdate attempt");
}

fn result_file(env: &TestEnv, packet_id: &str) -> PathBuf {
    let path = env.root.join("deadline-result.json");
    let result = PacketResult {
        schema: "forged.result/1".to_owned(),
        packet_id: packet_id.to_owned(),
        outcome: Outcome::Implement {
            implemented: true,
            commits_ahead: 1,
            summary: "late external result".to_owned(),
            gate_state: Some("pass".to_owned()),
            note: None,
        },
    };
    std::fs::write(
        &path,
        serde_json::to_vec(&result).expect("serialize result"),
    )
    .expect("write result");
    path
}

fn assert_no_capacity(env: &TestEnv) {
    let ledger = env.ledger();
    let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
    ledger.close().expect("close ledger");
    assert!(
        snapshot.reservations.is_empty(),
        "deadline aftermath leaked capacity: {:?}",
        snapshot.reservations
    );
}

#[test]
fn public_packet_complete_settles_a_late_result_and_releases_capacity() {
    let env = TestEnv::new("deadline-public-complete");
    let run = "deadline-pc";
    start_bead_run(&env, run);
    let packet = advance_to_open_packet(&env, run);
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_eq!(code, 0, "packet claim: {claimed}");
    let attempt_id = claimed["result"]["attempt_id"]
        .as_i64()
        .expect("attempt id");
    let claim_token = claimed["result"]["claim_token"]
        .as_str()
        .expect("claim token")
        .to_owned();
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .admission_snapshot(None)
            .expect("admission snapshot")
            .reservations
            .len(),
        1,
        "the external claim owns one capacity reservation"
    );
    ledger.close().expect("close ledger");
    backdate_attempt(&env, attempt_id);
    let result = result_file(&env, &packet.packet_id);

    let (code, completed) = env.forged(&[
        "packet",
        "complete",
        "--packet",
        &packet.packet_id,
        "--attempt",
        &attempt_id.to_string(),
        "--claim-token",
        &claim_token,
        "--result",
        result.to_str().expect("result path"),
    ]);
    assert_eq!(code, 0, "late packet completion: {completed}");
    assert_eq!(completed["result"]["outcome"], json!("Deadline"));

    let ledger = env.ledger();
    let run_row = ledger.get_run(run).expect("run");
    let attempt = ledger.get_attempt(attempt_id).expect("attempt");
    let pending = ledger
        .list_pending_settlement_aftermaths()
        .expect("pending aftermath");
    ledger.close().expect("close ledger");
    assert_eq!(run_row.state, RunState::Stopped);
    assert_eq!(run_row.terminal_outcome, Some(RunOutcome::Blocked));
    assert_eq!(attempt.state, AttemptState::Stopped);
    assert_eq!(
        attempt.revoke_scope,
        Some(forged_ledger::RevokeScope::Deadline)
    );
    assert!(
        pending.is_empty(),
        "deadline aftermath must converge inline"
    );
    assert_no_capacity(&env);
}

fn legacy_seat(env: &TestEnv, run: &str, seq: i64, claimant: &str) -> i64 {
    let packet_id = format!("{run}/implement/{seq}");
    let packet = WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: packet_id.clone(),
        run_id: run.to_owned(),
        bead_id: format!("bead-{run}"),
        stage: Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: forged_types::SpecRef {
            path: env.spec.to_string_lossy().into_owned(),
            sha256: "fixture-sha".to_owned(),
            revision: None,
        },
        worktree: PathBuf::from("/unread/worktree"),
        branch: format!("forged/{run}"),
        base_ref: "main".to_owned(),
        contract: forged_types::StageContract {
            instructions: "fixture".to_owned(),
            gate_commands: Vec::new(),
            deliverable: Deliverable::CommitsInWorktree,
            budget_s: 60,
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: forged_types::ProviderHints {
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            effort: None,
            sandbox: Sandbox::ReadOnly,
        },
        field_notes: Vec::new(),
    };
    let ledger = env.ledger();
    ledger
        .open_packet(forged_ledger::NewPacket {
            run_id: run.to_owned(),
            stage: Stage::Implement,
            seq,
            spec_path: packet.spec.path.clone(),
            spec_sha256: packet.spec.sha256.clone(),
            spec_revision: None,
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open packet");
    let attempt = ledger
        .claim_packet(
            &packet_id,
            claimant,
            &SpecFence::Sha256("fixture-sha".to_owned()),
        )
        .expect("claim packet");
    ledger.close().expect("close ledger");
    attempt.attempt_id
}

#[test]
fn session_stop_settles_a_deadline_discovered_on_a_sibling_attempt() {
    let env = TestEnv::new("deadline-session-sibling");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "deadline-session-sibling";
    let bead = format!("bead-{run}");
    fabricate_run(&env, run);
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, &format!("forged:{bead}:0"));
    let stopped_id = legacy_seat(&env, run, 1, "fixture-target");
    let deadline_id = legacy_seat(&env, run, 2, "fixture-sibling");
    backdate_attempt(&env, deadline_id);

    let (code, stopped) = env.forged(&[
        "session",
        "stop",
        "--attempt",
        &stopped_id.to_string(),
        "--reason",
        "operator requested",
    ]);
    assert_eq!(code, 0, "session stop: {stopped}");
    assert!(
        stopped["result"]["report"]["deadlineExceeded"]
            .as_array()
            .is_some_and(|ids| ids.contains(&json!(deadline_id))),
        "the sibling deadline remains visible in the report: {stopped}"
    );

    let ledger = env.ledger();
    let run_row = ledger.get_run(run).expect("run");
    let named = ledger.get_attempt(stopped_id).expect("named attempt");
    let sibling = ledger.get_attempt(deadline_id).expect("sibling attempt");
    ledger.close().expect("close ledger");
    assert_eq!(run_row.state, RunState::Stopped);
    assert_eq!(run_row.terminal_outcome, Some(RunOutcome::Blocked));
    assert_eq!(named.state, AttemptState::Stopped);
    assert_eq!(sibling.state, AttemptState::Stopped);
    assert_eq!(
        sibling.revoke_scope,
        Some(forged_ledger::RevokeScope::Deadline)
    );
}

#[cfg(feature = "failpoints")]
#[test]
fn reconcile_keeps_the_run_slot_across_deadline_revocation_and_settlement() {
    use std::process::Stdio;
    use std::time::{Duration, Instant};

    let env = TestEnv::new("deadline-reconcile-held-slot");
    assert_eq!(env.forged(&["init"]).0, 0);
    let run = "deadline-reconcile-held-slot";
    let bead = format!("bead-{run}");
    fabricate_run(&env, run);
    env.set_bead_field(&bead, "status", "in_progress");
    env.set_assignee(&bead, &format!("forged:{bead}:0"));
    let attempt_id = legacy_seat(&env, run, 1, "fixture-deadline");
    backdate_attempt(&env, attempt_id);

    let failpoints = env.root.join("failpoints");
    std::fs::create_dir_all(&failpoints).expect("failpoint dir");
    let reconcile = env
        .forged_cmd(&["reconcile", "--run", run])
        .env("FORGED_FAILPOINT", "deadline.reconcile.settle.before")
        .env("FORGED_FAILPOINT_MODE", "pause")
        .env("FORGED_FAILPOINT_DIR", &failpoints)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn reconcile");
    let reached = failpoints.join("deadline.reconcile.settle.before.reached");
    let started = Instant::now();
    while !reached.exists() {
        assert!(
            started.elapsed() < Duration::from_secs(15),
            "timed out waiting for reconcile/settle seam"
        );
        std::thread::sleep(Duration::from_millis(25));
    }

    let ledger = env.ledger();
    assert_eq!(
        ledger.get_attempt(attempt_id).expect("attempt").state,
        AttemptState::Revoking
    );
    assert_eq!(ledger.get_run(run).expect("run").state, RunState::Active);
    assert!(
        ledger
            .read_merge_slot(&format!("controller-submit:run:{run}"))
            .expect("submit slot")
            .is_some(),
        "the run slot must bridge reconcile and settlement"
    );
    ledger.close().expect("close ledger");

    std::fs::write(
        failpoints.join("deadline.reconcile.settle.before.release"),
        b"release",
    )
    .expect("release failpoint");
    let output = reconcile.wait_with_output().expect("reconcile output");
    assert!(
        output.status.success(),
        "reconcile failed: stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let response: Value = serde_json::from_slice(&output.stdout).expect("response envelope");
    assert_eq!(response["ok"], json!(true), "{response}");

    let ledger = env.ledger();
    assert_eq!(ledger.get_run(run).expect("run").state, RunState::Stopped);
    assert!(
        ledger
            .read_merge_slot(&format!("controller-submit:run:{run}"))
            .expect("submit slot")
            .is_none(),
        "the slot releases after complete settlement"
    );
    ledger.close().expect("close ledger");
}
