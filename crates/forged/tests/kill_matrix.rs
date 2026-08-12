#![cfg(feature = "failpoints")]
//! The failpoint kill-matrix — the epic's falsifier rehearsal. Each
//! schedule launches the driver and the reconcilers as real child
//! processes of the forged binary, crashes or pauses them at forged-owned
//! boundaries, and asserts on FINAL REPO CONTENT and PROCESS NON-OVERLAP —
//! the actual commits and refs in the temp repo plus the shim log and the
//! ledger's attempt-order — never merely on ledger labels.

mod support;

use std::path::Path;
use std::process::{Child, Stdio};
use std::time::{Duration, Instant};

use serde_json::{json, Value};
use support::{assert_no_overlap, rev_parse, HomeBeadsGuard, TestEnv};

const WAIT: Duration = Duration::from_secs(60);

fn wait_until(what: &str, mut pred: impl FnMut() -> bool) {
    let start = Instant::now();
    while !pred() {
        assert!(start.elapsed() < WAIT, "timed out waiting for {what}");
        std::thread::sleep(Duration::from_millis(25));
    }
}

fn start_run(env: &TestEnv, bead: &str) {
    let (code, init) = env.forged(&["init"]);
    assert_eq!(code, 0, "init: {init}");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        bead,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
}

/// Spawn `run drive` as a real child, optionally armed with a failpoint.
fn spawn_drive(env: &TestEnv, run: &str, failpoint: Option<(&str, &str, &Path)>) -> Child {
    let mut cmd = env.forged_cmd(&["run", "drive", "--run", run]);
    if let Some((site, mode, dir)) = failpoint {
        cmd.env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", mode)
            .env("FORGED_FAILPOINT_DIR", dir);
    }
    cmd.stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .expect("drive child spawns")
}

fn read_pid(env: &TestEnv, run: &str, stage: &str, seq: i64) -> Option<i32> {
    std::fs::read_to_string(env.packet_dir(run, stage, seq).join("provider.pid"))
        .ok()
        .and_then(|t| t.trim().parse().ok())
}

fn pid_alive(pid: i32) -> bool {
    std::process::Command::new("/bin/kill")
        .args(["-0", &pid.to_string()])
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

fn kill_group(pid: i32) {
    let _ = std::process::Command::new("/bin/kill")
        .args(["-9", &format!("-{pid}")])
        .stderr(Stdio::null())
        .status();
}

/// Attempt ids and states for a packet, from the ledger's attempt.state
/// events (commit order), plus the serialization assertion: no attempt
/// starts before its predecessor is terminal.
fn assert_attempts_serialized(env: &TestEnv, run: &str, packet_id: &str) {
    let ledger = env.ledger();
    let mut rows = Vec::new();
    let mut after = 0i64;
    loop {
        let page = ledger.list_events(Some(run), after, 256).expect("events");
        let full = page.len() == 256;
        if let Some(last) = page.last() {
            after = last.event_id;
        }
        rows.extend(page);
        if !full {
            break;
        }
    }
    ledger.close().expect("close");
    let mut open: Option<i64> = None;
    for row in rows.iter().filter(|r| r.kind == "attempt.state") {
        let payload: Value = serde_json::from_str(&row.payload_json).expect("payload");
        if payload["packetId"].as_str() != Some(packet_id) {
            continue;
        }
        let attempt = payload["attemptId"].as_i64().expect("attemptId");
        match payload["new"].as_str().expect("new state") {
            "running" => {
                assert!(
                    open.is_none(),
                    "attempt {attempt} of {packet_id} started while attempt \
                     {open:?} was still live — overlap in the ledger record"
                );
                open = Some(attempt);
            }
            "completed" | "failed" | "reclaimed" => {
                open = None;
            }
            _ => {}
        }
    }
}

fn attempt_states(env: &TestEnv, run: &str) -> Vec<(i64, String)> {
    let ledger = env.ledger();
    let live = ledger.list_live_attempts(Some(run)).expect("live");
    let mut out: Vec<(i64, String)> = live
        .iter()
        .map(|a| (a.attempt_id, a.state.as_str().to_owned()))
        .collect();
    // Terminal attempts by probing ids upward from 1.
    for id in 1..=64 {
        if let Ok(row) = ledger.get_attempt(id) {
            if !out.iter().any(|(i, _)| *i == id) {
                out.push((id, row.state.as_str().to_owned()));
            }
        }
    }
    out.sort();
    ledger.close().expect("close");
    out
}

// ------------------------------------------------------------- schedule 1

#[test]
fn kill_mid_packet_then_resume_through_claim_next() {
    let env = TestEnv::new("km1");
    start_run(&env, "bead-k1");
    env.set_scenario("implement", "hang", 1);
    let mut drive = spawn_drive(&env, "bead-k1", None);

    // The provider packet is in flight: the spawned shell wrote its pid
    // and the shim logged its start (so the hang scenario is consumed by
    // THIS attempt, never left armed for the resume).
    wait_until("implement provider.pid", || {
        read_pid(&env, "bead-k1", "implement", 1).is_some()
    });
    wait_until("implement shim start", || {
        env.provider_log()
            .iter()
            .any(|l| l.starts_with("bead-k1/implement/1") && l.contains(" start "))
    });
    let provider_pid = read_pid(&env, "bead-k1", "implement", 1).expect("pid");

    // Kill the driver mid-packet, then the orphaned provider group — the
    // machine died. Disarm the scenario so the timing of the kill can
    // never leave it armed.
    drive.kill().expect("kill driver");
    let _ = drive.wait();
    kill_group(provider_pid);
    wait_until("provider death", || !pid_alive(provider_pid));
    env.set_scenario("implement", "hang", 0);
    // A SIGKILLed shim never writes its `end` line; its pid — verified
    // dead above, before any successor starts — is excluded from the log
    // scan (the ledger's attempt-order record covers it).
    let killed_pids = shim_pids(&env, "bead-k1/implement/1");

    // Reconcile revokes the dead attempt and reclaims the scoped lease.
    let (code, reconciled) = env.forged(&["reconcile", "--run", "bead-k1"]);
    assert_eq!(code, 0, "reconcile: {reconciled}");
    assert!(
        reconciled["result"]["report"]["reclaimed"]
            .as_array()
            .is_some_and(|a| !a.is_empty()),
        "the dead attempt is reclaimed: {reconciled}"
    );

    // Resume through claim-next: the reopened packet of that same run.
    let (code, resumed) = env.forged(&[
        "claim-next",
        "--holder",
        "resumer",
        "--idempotency-key",
        "op:claim_next:k1",
    ]);
    assert_eq!(code, 0, "claim-next: {resumed}");
    assert_eq!(resumed["result"]["claimed"]["resumed"], json!(true));
    assert_eq!(
        resumed["result"]["claimed"]["packet_id"],
        json!("bead-k1/implement/1")
    );

    // Finish the run: drive adopts the resumed claim and completes.
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-k1"]);
    assert_eq!(code, 0, "resumed drive: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());

    // Final repo content, not ledger labels: the branch reached origin
    // with the implement and fix commits.
    let log = support::git(
        &env.repos.origin,
        &["log", "--format=%s", "refs/heads/forged/bead-k1"],
    );
    assert!(log.contains("shim implement"), "implement commit: {log}");
    assert!(log.contains("shim fix"), "fix commit: {log}");

    // Process non-overlap: the ledger's attempt order and the shim log.
    assert_attempts_serialized(&env, "bead-k1", "bead-k1/implement/1");
    support::assert_no_overlap_after_kills(
        &env.provider_log(),
        "bead-k1/implement/1",
        &killed_pids,
    );
}

/// The shim pids that have logged a `start` for a packet so far.
fn shim_pids(env: &TestEnv, packet_id: &str) -> Vec<i32> {
    env.provider_log()
        .iter()
        .filter(|l| l.starts_with(packet_id) && l.contains(" start "))
        .filter_map(|l| l.rsplit(' ').next()?.parse().ok())
        .collect()
}

// ------------------------------------------------------------- schedule 2

#[test]
fn pause_after_reservation_zombie_send_is_refused_and_quarantined() {
    let env = TestEnv::new("km2");
    start_run(&env, "bead-k2");
    let fp = env.root.join("fp2");
    std::fs::create_dir_all(&fp).expect("fp dir");
    let mut drive = spawn_drive(&env, "bead-k2", Some(("op.begin.after", "pause", &fp)));
    let reached = fp.join("op.begin.after.reached");
    let release = fp.join("op.begin.after.release");

    // Release each reserved operation until the RESULT-LANDING reservation
    // (the packet_complete row) is the one paused.
    let held_at_landing = loop {
        wait_until("op.begin.after.reached", || reached.exists());
        let ledger = env.ledger();
        let landing = ledger
            .list_inflight_operations(None)
            .expect("inflight")
            .iter()
            .any(|o| o.name == "packet_complete");
        ledger.close().expect("close");
        if landing {
            break true;
        }
        std::fs::write(&release, b"").expect("release");
        wait_until("release consumed", || !release.exists());
    };
    assert!(held_at_landing);

    // The operation row is reserved and the driver is frozen: let a
    // reconciler revoke the attempt out from under it.
    let (code, reconciled) = env.forged(&["reconcile", "--run", "bead-k2"]);
    assert_eq!(code, 0, "reconcile: {reconciled}");
    assert!(
        reconciled["result"]["report"]["reclaimed"]
            .as_array()
            .is_some_and(|a| !a.is_empty()),
        "the paused attempt is revoked and reclaimed: {reconciled}"
    );

    // Release the zombie and let the run finish (releasing every later
    // reservation as it comes).
    std::fs::write(&release, b"").expect("release the zombie");
    let exit = loop {
        if let Some(status) = drive.try_wait().expect("try_wait") {
            break status;
        }
        if reached.exists() {
            std::fs::write(&release, b"").expect("release later ops");
            let _ = wait_release_consumed(&release);
        }
        std::thread::sleep(Duration::from_millis(20));
    };
    assert!(exit.success(), "drive finishes after the quarantine");

    // The zombie result was refused at the fence and quarantined — never
    // landed. Attempt 1 is reclaimed; a successor attempt completed the
    // packet; the quarantine custody file holds the refused bytes.
    let states = attempt_states(&env, "bead-k2");
    assert!(
        states.iter().any(|(_, s)| s == "reclaimed"),
        "the zombie attempt is reclaimed: {states:?}"
    );
    let quarantine_root = env.anvil.join("runs/bead-k2/quarantine");
    let custody: Vec<_> = walk(&quarantine_root);
    assert!(
        custody.iter().any(|p| p.ends_with("result.json")),
        "refused bytes in custody under {}: {custody:?}",
        quarantine_root.display()
    );
    let (_, events) = env.forged(&["events", "--run", "bead-k2"]);
    assert!(
        events["result"]["events"]
            .as_array()
            .expect("events")
            .iter()
            .any(|e| e["kind"] == json!("proto.quarantine")),
        "the quarantine event is durable"
    );
    assert_attempts_serialized(&env, "bead-k2", "bead-k2/implement/1");
}

fn wait_release_consumed(release: &Path) -> bool {
    let start = Instant::now();
    while release.exists() {
        if start.elapsed() > Duration::from_secs(5) {
            return false;
        }
        std::thread::sleep(Duration::from_millis(10));
    }
    true
}

fn walk(dir: &Path) -> Vec<String> {
    let mut out = Vec::new();
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                out.extend(walk(&path));
            } else {
                out.push(path.to_string_lossy().into_owned());
            }
        }
    }
    out
}

// ------------------------------------------------------------- schedule 3

#[test]
fn crash_before_send_never_fires_the_effect_and_releases_the_row() {
    let env = TestEnv::new("km3");
    start_run(&env, "bead-k3");
    let fp = env.root.join("fp3");
    std::fs::create_dir_all(&fp).expect("fp dir");
    // The first reservation in a fresh drive is the resolve step
    // (SafeRetry): crash between reserving and firing.
    let mut drive = spawn_drive(&env, "bead-k3", Some(("op.begin.after", "crash", &fp)));
    let status = drive.wait().expect("drive crashes");
    assert!(!status.success(), "the crash mode aborts the driver");

    // The effect never fired: no worktree, no bd claim.
    assert!(
        !env.worktree("bead-k3").exists(),
        "no worktree was prepared"
    );
    assert!(
        !env.bd_calls().iter().any(|l| l.starts_with("update ")),
        "no bd claim fired: {:?}",
        env.bd_calls()
    );
    // And the reserved row is in flight.
    {
        let ledger = env.ledger();
        let inflight = ledger.list_inflight_operations(None).expect("inflight");
        assert!(
            inflight.iter().any(|o| o.name == "resolve"),
            "the reserved resolve row survives the crash: {inflight:?}"
        );
        ledger.close().expect("close");
    }

    // Reconcile releases the SafeRetry row for redo.
    let (code, reconciled) = env.forged(&["reconcile", "--run", "bead-k3"]);
    assert_eq!(code, 0, "reconcile: {reconciled}");
    assert!(
        reconciled["result"]["report"]["released"]
            .as_array()
            .is_some_and(|a| !a.is_empty()),
        "the SafeRetry row is released for redo: {reconciled}"
    );
    {
        let ledger = env.ledger();
        assert!(
            ledger
                .find_operation("resolve", "bead-k3/resolve/0")
                .expect("probe")
                .is_none(),
            "the released row is gone"
        );
        ledger.close().expect("close");
    }

    // Redo completes the run and the repo holds the real content.
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-k3"]);
    assert_eq!(code, 0, "redo drive: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());
    let log = support::git(
        &env.repos.origin,
        &["log", "--format=%s", "refs/heads/forged/bead-k3"],
    );
    assert!(log.contains("shim implement"));
}

// ------------------------------------------------------------- schedule 4

#[test]
fn applied_then_response_lost_settles_by_observation_without_repeating() {
    let env = TestEnv::new("km4");
    start_run(&env, "bead-k4");
    let fp = env.root.join("fp4");
    std::fs::create_dir_all(&fp).expect("fp dir");
    // Crash right after the round-0 push fired, before its response was
    // recorded.
    let mut drive = spawn_drive(&env, "bead-k4", Some(("git.push.after", "crash", &fp)));
    let status = drive.wait().expect("drive crashes");
    assert!(!status.success());

    // The effect DID fire: the branch is on the remote.
    let pushed_sha = rev_parse(&env.repos.origin, "refs/heads/forged/bead-k4");
    assert!(!pushed_sha.is_empty());
    {
        let ledger = env.ledger();
        let inflight = ledger.list_inflight_operations(None).expect("inflight");
        assert!(
            inflight.iter().any(|o| o.name == "push"),
            "the push row is in flight: {inflight:?}"
        );
        ledger.close().expect("close");
    }

    // Reconcile settles ObserveOnly by observation — it confirms the
    // effect and does NOT repeat it.
    let (code, reconciled) = env.forged(&["reconcile", "--run", "bead-k4"]);
    assert_eq!(code, 0, "reconcile: {reconciled}");
    let observed = reconciled["result"]["report"]["observed"]
        .as_array()
        .cloned()
        .unwrap_or_default();
    assert!(
        !observed.is_empty(),
        "the push settles by observation: {reconciled}"
    );
    {
        let ledger = env.ledger();
        let row = ledger
            .find_operation("push", "bead-k4/push/0")
            .expect("probe")
            .expect("push row survives as the idempotency record");
        assert_eq!(row.state, forged_ledger::OperationState::Terminal);
        ledger.close().expect("close");
    }
    assert_eq!(
        rev_parse(&env.repos.origin, "refs/heads/forged/bead-k4"),
        pushed_sha,
        "the observation never re-pushed"
    );

    // The run walks on from the settled step and completes.
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-k4"]);
    assert_eq!(code, 0, "drive after observation: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());
}

// ------------------------------------------------------------- schedule 5

#[test]
fn two_racing_reconcilers_converge_to_reclaimed() {
    let env = TestEnv::new("km5");
    start_run(&env, "bead-k5");
    env.set_scenario("implement", "hang", 1);
    let mut drive = spawn_drive(&env, "bead-k5", None);
    wait_until("implement provider.pid", || {
        read_pid(&env, "bead-k5", "implement", 1).is_some()
    });
    wait_until("implement shim start", || {
        env.provider_log()
            .iter()
            .any(|l| l.starts_with("bead-k5/implement/1") && l.contains(" start "))
    });
    let provider_pid = read_pid(&env, "bead-k5", "implement", 1).expect("pid");
    drive.kill().expect("kill driver");
    let _ = drive.wait();
    kill_group(provider_pid);
    wait_until("provider death", || !pid_alive(provider_pid));
    env.set_scenario("implement", "hang", 0);
    let killed_pids = shim_pids(&env, "bead-k5/implement/1");

    // Two INDEPENDENT OS processes reconcile the same run, concurrently.
    let mut first = env
        .forged_cmd(&[
            "reconcile",
            "--run",
            "bead-k5",
            "--idempotency-key",
            "op:reconcile:k5-a",
        ])
        .stdout(Stdio::piped())
        .spawn()
        .expect("reconciler A");
    let mut second = env
        .forged_cmd(&[
            "reconcile",
            "--run",
            "bead-k5",
            "--idempotency-key",
            "op:reconcile:k5-b",
        ])
        .stdout(Stdio::piped())
        .spawn()
        .expect("reconciler B");
    let a = first.wait().expect("A exits");
    let b = second.wait().expect("B exits");
    assert!(
        a.success() && b.success(),
        "both reconcilers settle cleanly"
    );

    // Convergence: the attempt reached Reclaimed exactly once.
    let states = attempt_states(&env, "bead-k5");
    let reclaimed = states.iter().filter(|(_, s)| s == "reclaimed").count();
    assert_eq!(reclaimed, 1, "one reclaimed attempt: {states:?}");

    // At most two scoped reclaim attempts reached bd, at most one of which
    // reclaimed (the second sees the refusal shape); no reclaim named a
    // different holder.
    let reclaims: Vec<String> = env
        .bd_calls()
        .iter()
        .filter(|l| l.starts_with("reclaim ") && l.contains("--id bead-k5"))
        .cloned()
        .collect();
    assert!(
        (1..=2).contains(&reclaims.len()),
        "at most two scoped reclaims: {reclaims:?}"
    );
    for call in &reclaims {
        assert!(
            call.contains("--assignee forged:bead-k5:0"),
            "every reclaim is scoped to the expected holder: {call}"
        );
    }
    assert!(
        env.assignee("bead-k5").is_none(),
        "exactly one reclaim took effect"
    );

    // The run resumes and finishes with real content.
    let (code, resumed) = env.forged(&[
        "claim-next",
        "--holder",
        "resumer",
        "--idempotency-key",
        "op:claim_next:k5",
    ]);
    assert_eq!(code, 0, "claim-next: {resumed}");
    assert_eq!(resumed["result"]["claimed"]["resumed"], json!(true));
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-k5"]);
    assert_eq!(code, 0, "resumed drive: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());
    assert_attempts_serialized(&env, "bead-k5", "bead-k5/implement/1");
    support::assert_no_overlap_after_kills(
        &env.provider_log(),
        "bead-k5/implement/1",
        &killed_pids,
    );
}

// ------------------------------------------------------------- schedule 6

#[test]
fn a_live_slow_worker_inside_its_budget_is_not_robbed() {
    let env = TestEnv::new("km6");
    start_run(&env, "bead-k6");
    env.set_scenario("implement", "slow", 1);
    let mut drive = spawn_drive(&env, "bead-k6", None);
    wait_until("implement provider.pid", || {
        read_pid(&env, "bead-k6", "implement", 1).is_some()
    });
    let provider_pid = read_pid(&env, "bead-k6", "implement", 1).expect("pid");
    assert!(pid_alive(provider_pid), "the slow worker is alive");

    // Reconcile while the worker is alive and inside its budget.
    let (code, reconciled) = env.forged(&["reconcile", "--run", "bead-k6"]);
    assert_eq!(code, 0, "reconcile: {reconciled}");
    assert!(
        reconciled["result"]["report"]["left_running"]
            .as_array()
            .is_none(),
        "camelCase key only"
    );
    assert!(
        reconciled["result"]["report"]["leftRunning"]
            .as_array()
            .is_some_and(|a| !a.is_empty()),
        "the live worker is named left_running: {reconciled}"
    );
    assert!(
        !env.bd_calls()
            .iter()
            .any(|l| l.starts_with("reclaim ") && l.contains("--id bead-k6")),
        "its lease was never reclaimed: {:?}",
        env.bd_calls()
    );
    assert_eq!(
        env.assignee("bead-k6").as_deref(),
        Some("forged:bead-k6:0"),
        "the lease is intact"
    );

    // The worker finishes and the run completes untouched.
    let status = drive.wait().expect("drive completes");
    assert!(status.success(), "drive completes after the slow worker");
    let log = support::git(
        &env.repos.origin,
        &["log", "--format=%s", "refs/heads/forged/bead-k6"],
    );
    assert!(log.contains("shim implement"));
}

// ------------------------------------------------------------- schedule 7

#[test]
fn codex_rate_limit_during_fix_spares_the_semantic_round() {
    let env = TestEnv::new("km7");
    env.write_config(Some("codex"));
    start_run(&env, "bead-k7");
    env.set_scenario("fix", "rate-limit", 1);
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-k7"]);
    assert_eq!(code, 0, "drive: {driven}");
    assert!(
        driven["result"]["terminal"]["done"].is_object(),
        "the retried fix lands and the run completes: {driven}"
    );

    let (_, events) = env.forged(&["events", "--run", "bead-k7"]);
    let rows = events["result"]["events"]
        .as_array()
        .expect("events")
        .clone();
    let retry = rows
        .iter()
        .find(|e| e["kind"] == json!("proto.retry"))
        .expect("a proto.retry carries the backoff");
    assert_eq!(retry["payload"]["packetId"], json!("bead-k7/fix/1"));
    assert_eq!(retry["payload"]["transportFailures"], json!(1));
    assert!(retry["payload"]["retryAfter"].as_str().is_some());

    // The transport retry did not consume the semantic fix round: the run
    // holds exactly ONE fix packet, retried in place.
    let (_, status) = env.forged(&["run", "status", "--run", "bead-k7"]);
    let fix_packets: Vec<Value> = status["result"]["run"]["packets"]
        .as_array()
        .expect("packets")
        .iter()
        .filter(|p| p["stage"] == json!("fix"))
        .cloned()
        .collect();
    assert_eq!(fix_packets.len(), 1, "one fix packet only: {fix_packets:?}");
    let fail_note = rows
        .iter()
        .filter(|e| e["kind"] == json!("attempt.state") && e["payload"]["new"] == json!("failed"))
        .find_map(|e| e["payload"]["reason"].as_str())
        .expect("the failed fix attempt note");
    assert_eq!(fail_note, "transport: codex turn failed: rate limit");
    assert_attempts_serialized(&env, "bead-k7", "bead-k7/fix/1");
    assert_no_overlap(&env.provider_log(), "bead-k7/fix/1");
}

// ---------------------------------------------------- the embedded-bd case

#[test]
fn real_bd_lease_cycle_against_a_temp_beads_dir() {
    // The merged bd-test conventions, exactly: guard FIRST, sandboxed bd
    // (exact 1.2.1) or a loud SKIP, scratch HOME/BEADS_DIR/anvil under
    // CARGO_TARGET_TMPDIR, ancestor-clean store init.
    let _guard = HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("forged-km-bd");
    support::init_store(&bd, &s);
    let bead = support::create_bead(&bd, &s, "kill matrix lease bead");

    let cfg = forged_beads::BdConfig {
        bd_path: bd.clone(),
        beads_dir: s.beads.clone(),
        home_override: Some(s.home.clone()),
        anvil_home: s.anvil.clone(),
        work_dir: s.beads.clone(),
        read_timeout_s: 30,
        write_timeout_s: 60,
    };
    let rt = tokio::runtime::Runtime::new().expect("runtime");
    rt.block_on(async {
        // Claim under the derived driver-holder shape, exactly as the
        // resolve step does.
        let holder = "forged:bead-bd:0";
        let claimed = forged_beads::claim_specific(&cfg, &bead, holder)
            .await
            .expect("claim");
        assert_eq!(claimed.assignee, holder);
        assert_eq!(
            forged_beads::lease_holder(&cfg, &bead).await.expect("read"),
            Some(holder.to_owned()),
            "the sanctioned read reports the holder"
        );

        // The guardian's heartbeat path: owner renews, a wrong actor is
        // refused.
        forged_beads::heartbeat(&cfg, &bead, holder)
            .await
            .expect("owner heartbeat");
        assert!(
            matches!(
                forged_beads::heartbeat(&cfg, &bead, "someone-else:host:1").await,
                Err(forged_beads::BdError::HeartbeatRefused { .. })
            ),
            "wrong-actor heartbeat must be refused"
        );

        // The reclaim half of the cycle: an UNEXPIRED lease is
        // unreclaimable even at --older-than 0s — the refusal shape, not
        // an error — and the assignee is intact afterwards.
        let outcome = forged_beads::reclaim(&cfg, &bead, holder, 0)
            .await
            .expect("scoped reclaim probe");
        assert!(outcome.scoped, "bd confirms the reclaim was scoped");
        assert!(
            outcome.previous_owner.is_none(),
            "an unexpired lease is never reclaimed: {outcome:?}"
        );
    });
    let after = support::show_bead(&bd, &s, &bead);
    assert_eq!(
        after.get("assignee").and_then(Value::as_str),
        Some("forged:bead-bd:0"),
        "the lease survived the refused reclaim"
    );
    let _ = std::fs::remove_dir_all(&s.root);
}
