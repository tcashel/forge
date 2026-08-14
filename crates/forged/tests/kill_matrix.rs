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

use nix::errno::Errno;
use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use serde_json::{json, Value};
use support::{assert_no_overlap, pid_alive, rev_parse, HomeBeadsGuard, TestEnv};

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

fn start_epic(env: &TestEnv, epic: &str) {
    env.enable_dynamic_gh();
    env.seed_epic(epic, &[("child-crash", &env.spec, true)]);
    let (code, init) = env.forged(&["init"]);
    assert_eq!(code, 0, "init: {init}");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        epic,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
}

fn spawn_epic_drive(env: &TestEnv, epic: &str, failpoint: (&str, &str, &Path)) -> Child {
    let mut cmd = env.forged_cmd(&["epic", "drive", "--epic", epic]);
    cmd.env("FORGED_FAILPOINT", failpoint.0)
        .env("FORGED_FAILPOINT_MODE", failpoint.1)
        .env("FORGED_FAILPOINT_DIR", failpoint.2)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .expect("epic drive child spawns")
}

fn read_pid(env: &TestEnv, run: &str, stage: &str, seq: i64) -> Option<i32> {
    std::fs::read_to_string(env.packet_dir(run, stage, seq).join("provider.pid"))
        .ok()
        .and_then(|t| t.trim().parse().ok())
}

fn kill_group(pid: i32) {
    match killpg(Pid::from_raw(pid), Signal::SIGKILL) {
        Ok(()) | Err(Errno::ESRCH) => {}
        Err(error) => panic!("kill provider process group {pid}: {error}"),
    }
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
        read_pid(&env, "bead-k1", "implementation", 0).is_some()
    });
    wait_until("implement shim start", || {
        env.provider_log()
            .iter()
            .any(|l| l.starts_with("bead-k1/implementation/0") && l.contains(" start "))
    });
    let provider_pid = read_pid(&env, "bead-k1", "implementation", 0).expect("pid");

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
    let killed_pids = shim_pids(&env, "bead-k1/implementation/0");

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
        json!("bead-k1/implementation/0")
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
    assert_attempts_serialized(&env, "bead-k1", "bead-k1/implementation/0");
    support::assert_no_overlap_after_kills(
        &env.provider_log(),
        "bead-k1/implementation/0",
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
    assert_attempts_serialized(&env, "bead-k2", "bead-k2/implementation/0");
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

// ------------------------------------------------------- epic merge recovery

#[test]
fn epic_merge_applied_then_controller_crashes_resumes_without_duplicate() {
    let env = TestEnv::new("km-epic-merge");
    start_epic(&env, "epic-crash");
    let fp = env.root.join("fp-epic-merge");
    std::fs::create_dir_all(&fp).expect("fp dir");
    let mut drive = spawn_epic_drive(&env, "epic-crash", ("epic.child.merge.after", "crash", &fp));
    let status = drive.wait().expect("epic drive crashes");
    assert!(!status.success(), "the controller dies after GitHub merged");

    let merges_before = env
        .gh_calls()
        .iter()
        .filter(|args| args.starts_with(&["pr".to_owned(), "merge".to_owned(), "7".to_owned()]))
        .count();
    assert_eq!(merges_before, 1, "GitHub received the child merge once");

    // A different OS process reaps the dead controller slot, releases the
    // interrupted SafeRetry row, observes PR #7 as already merged, records
    // the child, and creates the sole final draft PR.
    let (code, resumed) = env.forged(&["epic", "drive", "--epic", "epic-crash"]);
    assert_eq!(code, 0, "resumed epic drive: {resumed}");
    assert_eq!(resumed["result"]["stopped"]["finalPr"]["number"], json!(8));
    let merges_after = env
        .gh_calls()
        .iter()
        .filter(|args| args.starts_with(&["pr".to_owned(), "merge".to_owned(), "7".to_owned()]))
        .count();
    assert_eq!(merges_after, 1, "resume probes instead of re-merging");
    let (code, projected) = env.forged(&["epic", "status", "--epic", "epic-crash"]);
    assert_eq!(code, 0, "epic status: {projected}");
    assert!(projected["result"]["children"][0]["merged"].is_object());
    assert_eq!(projected["result"]["finalPr"]["number"], json!(8));
}

// -------------------------------------------------- detached handoff recovery

#[test]
fn controller_recorded_then_submitter_crashes_is_adopted_without_duplicate() {
    let env = TestEnv::new("km-controller-handoff");
    start_run(&env, "bead-khandoff");
    env.set_scenario("implement", "slow", 1);
    let fp = env.root.join("fp-controller-handoff");
    std::fs::create_dir_all(&fp).expect("fp dir");
    let mut submitter = env
        .forged_cmd(&["run", "submit", "--run", "bead-khandoff"])
        .env("FORGED_FAILPOINT", "controller.record.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .env("FORGED_FAILPOINT_DIR", &fp)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("submitter spawns");
    let status = submitter.wait().expect("submitter crashes");
    assert!(
        !status.success(),
        "submitter aborts after recording identity"
    );
    assert!(
        env.anvil
            .join("runs/bead-khandoff/controller/controller.json")
            .exists(),
        "the detached identity reached disk before the crash"
    );

    // A new lead session recovers the exact same controller and settles the
    // interrupted submit operation. It never starts a second controller.
    let (code, recovered) = env.forged(&["run", "submit", "--run", "bead-khandoff"]);
    assert_eq!(code, 0, "recover submit: {recovered}");
    assert_eq!(recovered["result"]["submitted"], json!(true));
    assert_eq!(recovered["result"]["alreadyRunning"], json!(false));
    {
        let ledger = env.ledger();
        let operation = ledger
            .find_operation("run_submit", "op:run_submit:bead-khandoff:-:1")
            .expect("submit operation probe")
            .expect("submit operation survives");
        assert_eq!(operation.state, forged_ledger::OperationState::Terminal);
        let controller_events = ledger
            .list_events(Some("bead-khandoff"), 0, 65_536)
            .expect("controller events")
            .into_iter()
            .filter(|row| row.kind == "forged.controller.started")
            .count();
        assert_eq!(controller_events, 1, "one durable controller identity");
        ledger.close().expect("close");
    }

    wait_until("detached run completion", || {
        let (code, projected) = env.forged(&["run", "status", "--run", "bead-khandoff"]);
        code == 0
            && projected["result"]["run"]["nextAction"]["stop"]["done"].is_object()
            && projected["result"]["run"]["controller"]["state"] == json!("exited")
    });
    let implementation_starts = env
        .provider_log()
        .iter()
        .filter(|line| {
            line.starts_with("bead-khandoff/implementation/0") && line.contains(" start ")
        })
        .count();
    assert_eq!(implementation_starts, 1, "no duplicate packet execution");
    assert_no_overlap(&env.provider_log(), "bead-khandoff/implementation/0");
}

// ------------------------------------------------------------- schedule 5

#[test]
fn two_racing_reconcilers_converge_to_reclaimed() {
    let env = TestEnv::new("km5");
    start_run(&env, "bead-k5");
    env.set_scenario("implement", "hang", 1);
    let mut drive = spawn_drive(&env, "bead-k5", None);
    wait_until("implement provider.pid", || {
        read_pid(&env, "bead-k5", "implementation", 0).is_some()
    });
    wait_until("implement shim start", || {
        env.provider_log()
            .iter()
            .any(|l| l.starts_with("bead-k5/implementation/0") && l.contains(" start "))
    });
    let provider_pid = read_pid(&env, "bead-k5", "implementation", 0).expect("pid");
    drive.kill().expect("kill driver");
    let _ = drive.wait();
    kill_group(provider_pid);
    wait_until("provider death", || !pid_alive(provider_pid));
    env.set_scenario("implement", "hang", 0);
    let killed_pids = shim_pids(&env, "bead-k5/implementation/0");

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
    assert_attempts_serialized(&env, "bead-k5", "bead-k5/implementation/0");
    support::assert_no_overlap_after_kills(
        &env.provider_log(),
        "bead-k5/implementation/0",
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
        read_pid(&env, "bead-k6", "implementation", 0).is_some()
    });
    let provider_pid = read_pid(&env, "bead-k6", "implementation", 0).expect("pid");
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
    assert_eq!(retry["payload"]["packetId"], json!("bead-k7/remediation/0"));
    assert_eq!(retry["payload"]["transportFailures"], json!(1));
    assert!(retry["payload"]["retryAfter"].as_str().is_some());

    // The transport retry did not consume the semantic fix round: the run
    // holds exactly ONE fix packet, retried in place.
    let (_, status) = env.forged(&["run", "status", "--run", "bead-k7"]);
    let fix_packets: Vec<Value> = status["result"]["run"]["packets"]
        .as_array()
        .expect("packets")
        .iter()
        .filter(|p| p["storageLane"] == json!("fix"))
        .cloned()
        .collect();
    assert_eq!(fix_packets.len(), 1, "one fix packet only: {fix_packets:?}");
    let fail_note = rows
        .iter()
        .filter(|e| e["kind"] == json!("attempt.state") && e["payload"]["new"] == json!("failed"))
        .find_map(|e| e["payload"]["reason"].as_str())
        .expect("the failed fix attempt note");
    assert_eq!(fail_note, "transport: codex turn failed: rate limit");
    assert_attempts_serialized(&env, "bead-k7", "bead-k7/remediation/0");
    assert_no_overlap(&env.provider_log(), "bead-k7/remediation/0");
}

// ------------------------------------------------------------- schedule 8

#[test]
fn a_crashed_reconcile_never_wedges_the_next_one() {
    // Reconcile's own operation row is deliberately run-UNSCOPED, so no
    // later pass can settle it. A pass killed after `op.begin.after` would
    // therefore wedge every subsequent reconcile of the run on
    // OPERATION_IN_PROGRESS if its key were replayable — the whole reason
    // each invocation carries a fresh nonce.
    let env = TestEnv::new("km8");
    env.write_config(None);
    start_run(&env, "bead-k8");
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-k8"]);
    assert_eq!(code, 0, "drive: {driven}");

    // Crash one reconcile at the boundary just past its own begin: the row
    // is committed `in_progress` and the process dies before completing it.
    let mut cmd = env.forged_cmd(&["reconcile", "--run", "bead-k8"]);
    let status = cmd
        .env("FORGED_FAILPOINT", "op.begin.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("reconcile child runs");
    assert!(!status.success(), "the crashed pass must not exit 0");

    // The very next pass proceeds — it neither replays nor collides.
    for attempt in 0..2 {
        let (code, again) = env.forged(&["reconcile", "--run", "bead-k8"]);
        assert_eq!(code, 0, "reconcile {attempt} after the crash: {again}");
        assert_eq!(again["reused"], json!(false), "never a replay: {again}");
        assert_ne!(
            again["error"]["code"],
            json!("OPERATION_IN_PROGRESS"),
            "an interrupted pass must not wedge the run: {again}"
        );
        assert!(again["result"]["report"].is_object(), "{again}");
    }
}

// ------------------------------------------------------------- schedule 9

#[test]
fn a_materialization_failure_leaves_no_running_attempt_behind() {
    // The window this closes: the attempt row goes `running` BEFORE the
    // packet directory exists, so a materialization failure used to return
    // to the caller leaving a `running` attempt with no process behind it —
    // a row that blocks its own re-claim and the re-pin that would clear the
    // cause, and that the reclaim saga can only retire by timing out a lease
    // nobody is renewing.
    let env = TestEnv::new("km9");
    env.write_config(None);
    start_run(&env, "bead-k9");
    let fp = env.root.join("fp9");
    std::fs::create_dir_all(&fp).expect("failpoint dir");
    let drive = spawn_drive(
        &env,
        "bead-k9",
        Some(("packet.materialize.before", "pause", &fp)),
    );

    // Paused at the post-claim, pre-spawn boundary: the attempt is claimed
    // and the packet directory does not exist yet. Put a FILE where it must
    // go, so the materialization fails for real.
    let reached = fp.join("packet.materialize.before.reached");
    wait_until("the materialization boundary", || reached.exists());
    let packet_dir = env.packet_dir("bead-k9", "implementation", 0);
    assert!(
        !packet_dir.exists(),
        "the boundary must precede the directory: {}",
        packet_dir.display()
    );
    std::fs::create_dir_all(packet_dir.parent().expect("packet parent"))
        .expect("packet parent dir");
    std::fs::write(&packet_dir, b"not a directory").expect("plant the materialization failure");
    std::fs::write(fp.join("packet.materialize.before.release"), b"").expect("release");

    let out = drive.wait_with_output().expect("drive child exits");
    assert!(
        !out.status.success(),
        "the refusal must reach the caller, not be swallowed"
    );

    // The row is settled under its own claim token: nothing is left running,
    // and the packet is re-claimable rather than wedged.
    let states = attempt_states(&env, "bead-k9");
    assert!(
        !states.is_empty(),
        "the attempt was claimed before the failure"
    );
    assert!(
        states.iter().all(|(_, state)| state != "running"),
        "no attempt may outlive the process it never got: {states:?}"
    );
    let ledger = env.ledger();
    let attempt = ledger.get_attempt(1).expect("the claimed attempt");
    ledger.close().expect("close");
    assert_eq!(attempt.state, forged_ledger::AttemptState::Failed);
    assert!(
        attempt
            .fail_note
            .as_deref()
            .is_some_and(|note| note.contains("before spawn")),
        "the note must say the attempt never reached a provider: {attempt:?}"
    );
    assert_attempts_serialized(&env, "bead-k9", "bead-k9/implementation/0");
}

// ------------------------------------------- schedule 9, the other doors

/// Start a BEAD-SOURCED run: `materialize` is a no-op for a file spec (there
/// is no rendered body to write), so only the bead route reaches the
/// post-claim, pre-spawn write these cases fail.
fn start_bead_run(env: &TestEnv, bead: &str) {
    let (code, init) = env.forged(&["init"]);
    assert_eq!(code, 0, "init: {init}");
    env.write_config(None);
    env.seed_bead_spec(bead, "## Context\\n\\nthe bead is the spec.", "- ship it");
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
}

/// Advance until the run's first packet row exists and no further.
fn advance_to_open_packet(env: &TestEnv, run: &str) -> forged_ledger::PacketRow {
    for _ in 0..40 {
        let ledger = env.ledger();
        let opened = ledger
            .list_packets(run)
            .unwrap_or_default()
            .into_iter()
            .next();
        ledger.close().expect("close");
        if let Some(packet) = opened {
            return packet;
        }
        let (code, advanced) = env.forged(&["run", "advance", "--run", run]);
        assert_eq!(code, 0, "advance {run}: {advanced}");
    }
    panic!("{run} never opened a packet")
}

/// Make the packet directory unwritable for real: a regular FILE where the
/// directory has to go, so materializing the seat's spec fails.
fn block_the_packet_dir(env: &TestEnv, run: &str, stage: &str, seq: i64) {
    let packet_dir = env.packet_dir(run, stage, seq);
    std::fs::create_dir_all(packet_dir.parent().expect("packet parent")).expect("packet parent");
    let _ = std::fs::remove_dir_all(&packet_dir);
    std::fs::write(&packet_dir, b"not a directory").expect("plant the materialization failure");
}

/// The settled attempt, asserting nothing was left running and the note says
/// no seat ever ran.
fn assert_retired_unspawned(env: &TestEnv, run: &str) -> forged_ledger::AttemptRow {
    let states = attempt_states(env, run);
    assert!(
        !states.is_empty(),
        "the attempt was claimed before the failure"
    );
    assert!(
        states.iter().all(|(_, state)| state != "running"),
        "no attempt may outlive the process it never got: {states:?}"
    );
    let ledger = env.ledger();
    let attempt = ledger.get_attempt(1).expect("the claimed attempt");
    ledger.close().expect("close");
    assert_eq!(attempt.state, forged_ledger::AttemptState::Failed);
    let note = attempt.fail_note.clone().unwrap_or_default();
    assert_eq!(
        forged_proto::classify_failure(&note),
        forged_proto::FailureKind::Unspawned,
        "a seat that never spawned must not read as this stage's answer: {note}"
    );
    attempt
}

#[test]
fn an_external_packet_claim_retires_its_own_unspawned_attempt() {
    // `packet claim` -> `packet complete` never enters `run_attempt`, so the
    // in-process pipeline's settlement covers none of it: the claim writes
    // the seat's spec itself, and a failure there is post-claim and
    // pre-spawn just the same.
    let env = TestEnv::new("km9a");
    start_bead_run(&env, "bead-k9a");
    let packet = advance_to_open_packet(&env, "bead-k9a");
    block_the_packet_dir(&env, "bead-k9a", "implementation", 0);

    let (code, refused) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_ne!(code, 0, "the refusal must reach the caller: {refused}");
    assert_retired_unspawned(&env, "bead-k9a");

    // Re-claimable, not wedged: clear the cause and the next claim takes it.
    std::fs::remove_file(env.packet_dir("bead-k9a", "implementation", 0)).expect("clear the block");
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_eq!(code, 0, "the packet must still be claimable: {claimed}");
}

#[test]
fn claim_next_retires_its_own_unspawned_attempt() {
    // The third door onto the same window. claim-next resumes a ledger run
    // and writes the seat's spec under the claim it just took; the settlement
    // has to be there too, or a resumed run wedges on a `running` row with no
    // process behind it.
    let env = TestEnv::new("km9b");
    start_bead_run(&env, "bead-k9b");
    let packet = advance_to_open_packet(&env, "bead-k9b");

    // Leave the run resumable: one transport-failed attempt, nothing live.
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_eq!(code, 0, "packet claim: {claimed}");
    let token = claimed["result"]["claim_token"]
        .as_str()
        .expect("token")
        .to_owned();
    let attempt_id = claimed["result"]["attempt_id"]
        .as_i64()
        .expect("attempt id")
        .to_string();
    let (code, failed) = env.forged(&[
        "packet",
        "fail",
        "--packet",
        &packet.packet_id,
        "--attempt",
        &attempt_id,
        "--claim-token",
        &token,
        "--note",
        "transport: session vanished",
    ]);
    assert_eq!(code, 0, "packet fail: {failed}");
    env.set_assignee("bead-k9b", "forged:bead-k9b:0");

    block_the_packet_dir(&env, "bead-k9b", "implementation", 0);
    let (code, refused) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:k9b",
    ]);
    assert_ne!(code, 0, "the refusal must reach the caller: {refused}");

    let states = attempt_states(&env, "bead-k9b");
    assert!(
        states.iter().all(|(_, state)| state != "running"),
        "no attempt may outlive the process it never got: {states:?}"
    );
    let ledger = env.ledger();
    let attempt = ledger.get_attempt(2).expect("the resumed attempt");
    ledger.close().expect("close");
    assert_eq!(attempt.state, forged_ledger::AttemptState::Failed);
    let note = attempt.fail_note.clone().unwrap_or_default();
    assert_eq!(
        forged_proto::classify_failure(&note),
        forged_proto::FailureKind::Unspawned,
        "a resumed seat that never spawned speaks no stage result: {note}"
    );
}

#[test]
fn a_required_herdr_host_settles_before_the_spawn_rather_than_propagating() {
    // The host selection sits between the claim and the spawn, on the same
    // stretch where nothing may propagate on its own. With Herdr REQUIRED and
    // no endpoint, the attempt is charged to the packet's bounded budget and
    // the row is settled — never left running, and never a stage result.
    let env = TestEnv::new("km9c");
    let (code, init) = env.forged(&["init"]);
    assert_eq!(code, 0, "init: {init}");
    env.write_config(None);
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config json");
    config["host_policy"] = json!("required");
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("config json"),
    )
    .expect("rewrite config");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-k9c",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");

    let packet = advance_to_open_packet(&env, "bead-k9c");
    let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-k9c"]);
    assert_eq!(
        code, 0,
        "a transport failure is recorded, not raised: {advanced}"
    );

    let states = attempt_states(&env, "bead-k9c");
    assert!(
        states.iter().all(|(_, state)| state != "running"),
        "no attempt may outlive the host it never got: {states:?}"
    );
    let ledger = env.ledger();
    let attempt = ledger.get_attempt(1).expect("the claimed attempt");
    let grants: Vec<Value> = ledger
        .list_events(Some("bead-k9c"), 0, 4096)
        .expect("events")
        .into_iter()
        .filter(|row| row.kind == "proto.retry")
        .map(|row| serde_json::from_str(&row.payload_json).expect("retry payload"))
        .collect();
    ledger.close().expect("close");
    assert_eq!(attempt.state, forged_ledger::AttemptState::Failed);
    let note = attempt.fail_note.clone().unwrap_or_default();
    assert_eq!(
        forged_proto::classify_failure(&note),
        forged_proto::FailureKind::Transport,
        "a missing host is an outage, never the seat's answer: {note}"
    );
    assert_eq!(
        grants.last().map(|grant| grant["packetId"].clone()),
        Some(json!(packet.packet_id)),
        "the attempt is charged to its packet's bounded budget: {grants:?}"
    );

    // And nothing was spawned: no provider ever ran for this packet.
    assert!(
        !env.provider_log()
            .iter()
            .any(|line| line.starts_with(&packet.packet_id)),
        "the settlement must precede any spawn: {:?}",
        env.provider_log()
    );
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

/// The genuine expiry half of the cycle, against the real bd binary: claim a
/// bead, never heartbeat it, and let bd's 5-minute TTL actually lapse, then
/// scoped-reclaim it and watch the lease come back.
///
/// `#[ignore]`d and additionally gated on `FORGED_SLOW_TESTS=1` by the
/// operator's convention (2026-08-12): it costs ~6 minutes of real waiting,
/// so the in-suite case above keeps the fast refusal shape and this one is
/// run deliberately —
/// `FORGED_SLOW_TESTS=1 cargo test -p forged --features failpoints -- --ignored --nocapture`.
#[test]
#[ignore = "slow: waits out bd's real 5-minute lease TTL (set FORGED_SLOW_TESTS=1)"]
fn real_bd_lease_expiry_then_scoped_reclaim() {
    let _guard = HomeBeadsGuard::new();
    if std::env::var("FORGED_SLOW_TESTS").unwrap_or_default() != "1" {
        eprintln!("SKIP: real-bd expiry cycle needs FORGED_SLOW_TESTS=1");
        return;
    }
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("forged-km-bd-expiry");
    support::init_store(&bd, &s);
    let bead = support::create_bead(&bd, &s, "kill matrix expiry bead");

    let cfg = forged_beads::BdConfig {
        bd_path: bd.clone(),
        beads_dir: s.beads.clone(),
        home_override: Some(s.home.clone()),
        anvil_home: s.anvil.clone(),
        work_dir: s.beads.clone(),
        read_timeout_s: 30,
        write_timeout_s: 60,
    };
    // The dead driver's identity: claimed once, then never heartbeated
    // again — exactly what a killed guardian leaves behind.
    let holder = "forged:bead-expiry:0";
    let rt = tokio::runtime::Runtime::new().expect("runtime");
    let (elapsed, outcome) = rt.block_on(async {
        let claimed = forged_beads::claim_specific(&cfg, &bead, holder)
            .await
            .expect("claim");
        assert_eq!(claimed.assignee, holder);
        eprintln!(
            "claimed {bead} under {holder}; lease_expires_at={:?}",
            support::show_bead(&bd, &s, &bead).get("lease_expires_at")
        );
        // Poll the scoped reclaim until the TTL genuinely lapses. Every call
        // before expiry answers the refusal shape, which is itself the
        // assertion that an unexpired lease is unreclaimable.
        let started = Instant::now();
        let deadline = Duration::from_secs(600);
        loop {
            let outcome = forged_beads::reclaim(&cfg, &bead, holder, 0)
                .await
                .expect("scoped reclaim");
            assert!(outcome.scoped, "bd confirms the reclaim was scoped");
            if outcome.previous_owner.is_some() {
                break (started.elapsed(), outcome);
            }
            assert!(
                started.elapsed() < deadline,
                "bd's lease never expired within {deadline:?} — TTL assumption broken"
            );
            tokio::time::sleep(Duration::from_secs(15)).await;
        }
    });

    assert_eq!(
        outcome.previous_owner.as_deref(),
        Some(holder),
        "the reclaim names the dead holder it took the lease from"
    );
    let after = support::show_bead(&bd, &s, &bead);
    eprintln!(
        "reclaimed after {}s: previous_owner={:?}, bead now status={:?} assignee={:?}",
        elapsed.as_secs(),
        outcome.previous_owner,
        after.get("status"),
        after.get("assignee"),
    );
    assert_eq!(
        after
            .get("assignee")
            .and_then(Value::as_str)
            .unwrap_or_default(),
        "",
        "the lease is released: {after}"
    );
    assert_eq!(
        after.get("status").and_then(Value::as_str),
        Some("open"),
        "the bead returns to the frontier: {after}"
    );
    let _ = std::fs::remove_dir_all(&s.root);
}
