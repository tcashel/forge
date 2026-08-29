#![cfg(feature = "failpoints")]

//! Crash recovery for a submit whose Herdr pane vanished before controller
//! identity and desired-work publication completed.

mod support;

use std::io::{BufRead, BufReader, Write};
use std::os::unix::net::UnixListener;
use std::process::Stdio;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use forged_ledger::{
    AdmissionBatchWrite, AdmissionReservationState, DesiredSubjectKind, OwnedHerdrCleanupReason,
    OwnedHerdrCleanupRelease, OwnedHerdrCleanupState,
};
use forged_types::{
    AdmissionCandidateV1, AdmissionDecisionV1, AdmissionInputsV1, AdmissionOutcome,
    AdmissionReason, AdmissionResourceClass, AdmissionSubjectKind, ADMISSION_DECISION_SCHEMA_V1,
    ADMISSION_INPUTS_SCHEMA_V1,
};
use serde_json::{json, Value};
use support::TestEnv;

struct PaneNotFoundServer {
    socket_path: std::path::PathBuf,
    stop: Arc<AtomicBool>,
    methods: Arc<Mutex<Vec<String>>>,
    thread: Option<std::thread::JoinHandle<()>>,
}

impl PaneNotFoundServer {
    fn start(socket: &std::path::Path) -> Self {
        let listener = UnixListener::bind(socket).expect("bind Herdr fixture");
        listener
            .set_nonblocking(true)
            .expect("nonblocking Herdr fixture");
        let stop = Arc::new(AtomicBool::new(false));
        let stopped = Arc::clone(&stop);
        let methods = Arc::new(Mutex::new(Vec::new()));
        let recorded = Arc::clone(&methods);
        let thread = std::thread::spawn(move || {
            while !stopped.load(Ordering::SeqCst) {
                let (mut stream, _) = match listener.accept() {
                    Ok(accepted) => accepted,
                    Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                        std::thread::sleep(Duration::from_millis(5));
                        continue;
                    }
                    Err(error) => panic!("accept Herdr fixture: {error}"),
                };
                // macOS accepted sockets inherit the listener's O_NONBLOCK
                // (Linux clears it); reading before the client's bytes land
                // would panic with WouldBlock under parallel test load.
                stream
                    .set_nonblocking(false)
                    .expect("blocking Herdr stream");
                // These tests crash the client ON PURPOSE (failpoint kills
                // mid-exchange): a vanished peer — read error, EOF before a
                // request, or a half-written line — is a dropped connection,
                // never a fixture failure. Only a well-formed request that
                // names an unexpected method stays fatal.
                let mut line = String::new();
                match BufReader::new(stream.try_clone().expect("clone fixture stream"))
                    .read_line(&mut line)
                {
                    Ok(0) | Err(_) => continue,
                    Ok(_) => {}
                }
                let Ok(request) = serde_json::from_str::<Value>(&line) else {
                    continue;
                };
                let (Some(id), Some(method)) = (request["id"].as_str(), request["method"].as_str())
                else {
                    continue;
                };
                recorded
                    .lock()
                    .expect("methods lock")
                    .push(method.to_owned());
                let response = match method {
                    "ping" => json!({
                        "id": id,
                        "result": {
                            "type": "pong",
                            "version": "test",
                            "protocol": 19,
                            "capabilities": {},
                        },
                    }),
                    "pane.process_info" | "pane.close" => json!({
                        "id": id,
                        "error": {"code": "pane_not_found", "message": "gone"},
                    }),
                    "pane.report_metadata" | "pane.report_agent" | "pane.release_agent" => {
                        json!({"id": id, "result": {"type": "ok"}})
                    }
                    other => panic!("unexpected Herdr fixture method {other}"),
                };
                // The peer may crash between request and response; a failed
                // write is the same dropped connection as a failed read.
                let _ = writeln!(stream, "{response}");
            }
        });
        Self {
            socket_path: socket.to_path_buf(),
            stop,
            methods,
            thread: Some(thread),
        }
    }

    fn methods(&self) -> Vec<String> {
        self.methods.lock().expect("methods lock").clone()
    }
}

impl Drop for PaneNotFoundServer {
    fn drop(&mut self) {
        // Best-effort on every step: this Drop also runs while a test
        // assertion unwinds, and a fixture-side panic here would abort the
        // process and mask the real failure.
        self.stop.store(true, Ordering::SeqCst);
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
        let _ = std::fs::remove_file(&self.socket_path);
    }
}

/// A short /tmp path, deliberately NOT under CARGO_TARGET_TMPDIR: sun_path
/// caps a Unix socket address at 104 bytes on macOS and target tmpdir paths
/// routinely exceed it. The pid+nonce name is collision-free and the
/// fixture's Drop removes it best-effort.
fn fixture_socket_path(tag: &str) -> std::path::PathBuf {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("clock after epoch")
        .as_nanos();
    std::path::PathBuf::from(format!(
        "/tmp/forged-{tag}-{}-{nonce}.sock",
        std::process::id()
    ))
}

fn start_run(env: &TestEnv, run: &str) {
    env.seed_work_spec(
        run,
        "Recover the submit.",
        "The replacement controller starts.",
    );
    env.seed_frontier(run);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        run,
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
}

fn seed_orphaned_reservation(env: &TestEnv, run: &str) {
    let ledger = env.ledger();
    let snapshot = ledger
        .admission_snapshot(Some((DesiredSubjectKind::Run, run.to_owned())))
        .expect("admission snapshot");
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let capacity = snapshot.capacity.clone();
    let candidate = AdmissionCandidateV1 {
        subject_kind: AdmissionSubjectKind::Run,
        subject_id: run.to_owned(),
        control_revision: 0,
        work_id: run.to_owned(),
        work_revision: Some("fixture-revision".to_owned()),
        work_status: Some("open".to_owned()),
        priority: Some(1),
        repository: repository.clone(),
        work_repository: Some(repository.clone()),
        input_error: None,
        desired_wake_at: None,
        provider: Some("claude".to_owned()),
        model: Some("opus".to_owned()),
        resource_class: AdmissionResourceClass::RepositoryWrite,
        authorized_at: snapshot.as_of.clone(),
    };
    let decision = AdmissionDecisionV1 {
        schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
        batch_id: "orphaned-submit-batch".to_owned(),
        subject_kind: AdmissionSubjectKind::Run,
        subject_id: run.to_owned(),
        control_revision: 0,
        repository,
        priority: Some(1),
        provider: Some("claude".to_owned()),
        model: Some("opus".to_owned()),
        resource_class: AdmissionResourceClass::RepositoryWrite,
        outcome: AdmissionOutcome::Admitted,
        reason: AdmissionReason::CapacityAvailable,
        policy_revision: "orphaned-submit-policy".to_owned(),
        evidence: capacity.clone(),
        next_eligible_wake_at: None,
    };
    let reservation = ledger
        .commit_admission_batch(AdmissionBatchWrite {
            inputs: AdmissionInputsV1 {
                schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
                as_of: snapshot.as_of,
                policy_revision: "orphaned-submit-policy".to_owned(),
                ledger_revision: snapshot.ledger_revision,
                candidates: vec![candidate],
                capacity,
                spend: snapshot.spend,
                latest_rate_limits: snapshot.latest_rate_limits,
            },
            decisions: vec![decision],
            recovery_deadline: "2000-01-01T00:00:00.000000000Z".to_owned(),
        })
        .expect("commit admission")
        .into_iter()
        .next()
        .expect("reservation");
    ledger
        .activate_admission_reservation(
            &reservation.reservation_id,
            "controller",
            &format!("run:{run}:1"),
        )
        .expect("activate controller reservation");
    let orphaned = ledger
        .mark_expired_admission_orphaned("2099-01-01T00:00:00.000000000Z")
        .expect("orphan reservation");
    assert!(orphaned.iter().any(|row| {
        row.reservation_id == reservation.reservation_id
            && row.state == AdmissionReservationState::Orphaned
    }));
    ledger.close().expect("close ledger");
}

fn seed_owned_pane(env: &TestEnv, run: &str, socket: &std::path::Path) {
    let conn = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db");
    conn.execute(
        "INSERT INTO owned_herdr_sessions (
           ownership_id, schema, owner_kind, subject_kind, subject_id,
           controller_generation, pane_id, socket_path, protocol, sentinel_path,
           lifecycle_state, cleanup_state, cleanup_retry_budget,
           cleanup_retry_used, registered_at, command_started_at, updated_at
         ) VALUES ('orphaned-submit-owner', 'forged.owned-herdr-session/1',
                   'controller', 'run', ?1, 1, 'orphaned-pane', ?2, 19,
                   '/tmp/orphaned-submit/status', 'command-started',
                   'not-requested', 8, 0, '2026-01-01T00:00:00.000000000Z',
                   '2026-01-01T00:00:01.000000000Z',
                   '2026-01-01T00:00:01.000000000Z')",
        rusqlite::params![run, socket.to_string_lossy()],
    )
    .expect("insert orphaned ownership");
}

fn stop_run(env: &TestEnv, run: &str) {
    for _ in 0..200 {
        if env
            .forged(&[
                "run",
                "stop",
                "--run",
                run,
                "--outcome",
                "cancelled",
                "--reason",
                "orphan recovery fixture cleanup",
            ])
            .0
            == 0
        {
            return;
        }
        std::thread::sleep(Duration::from_millis(25));
    }
    panic!("run did not stop");
}

#[test]
fn ordinary_orphan_recovery_without_a_reservation_releases_and_resubmits() {
    let env = TestEnv::new("herdr-orphan-plain");
    let run = "herdr-orphan-plain-run";
    start_run(&env, run);
    let socket = fixture_socket_path("herdr-orphan-plain");
    let server = PaneNotFoundServer::start(&socket);
    seed_owned_pane(&env, run, &socket);

    // No orphaned reservation: the ordinary recovery branch alone must
    // observe the pane gone, record the release evidence, and reopen
    // submission at the next generation.
    let (code, recovered) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "recovery tick: {recovered}");
    let ledger = env.ledger();
    let released = ledger
        .get_owned_herdr_session("orphaned-submit-owner")
        .expect("get ownership")
        .expect("ownership row");
    assert_eq!(
        released.cleanup_reason,
        Some(OwnedHerdrCleanupReason::OrphanedSubmit)
    );
    assert_eq!(
        released.cleanup_release,
        Some(OwnedHerdrCleanupRelease::PaneNotFound)
    );
    assert_eq!(released.cleanup_state, OwnedHerdrCleanupState::Released);
    ledger.close().expect("close ledger");

    env.set_scenario("implement", "hang", 1);
    let (code, submitted) = env.forged(&["run", "submit", "--run", run]);
    assert_eq!(code, 0, "resubmit: {submitted}");
    assert_eq!(submitted["result"]["controller"]["generation"], json!(2));
    assert!(submitted["result"]["controller"]["pid"].is_number());
    let methods = server.methods();
    assert_eq!(
        methods
            .iter()
            .filter(|method| method.as_str() == "pane.close")
            .count(),
        1,
        "the recovery closes the orphaned pane exactly once: {methods:?}"
    );
    stop_run(&env, run);
}

#[test]
fn crash_after_probe_recovers_then_expired_reservation_resubmits_at_next_generation() {
    let env = TestEnv::new("herdr-orphan-failpoint");
    let run = "herdr-orphan-run";
    start_run(&env, run);
    seed_orphaned_reservation(&env, run);
    let socket = fixture_socket_path("herdr-orphan");
    let server = PaneNotFoundServer::start(&socket);
    seed_owned_pane(&env, run, &socket);

    let mut crashed = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "controller.orphaned-submit.probe.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("supervisor child");
    assert!(!crashed.wait().expect("wait for crash").success());
    let ledger = env.ledger();
    let before = ledger
        .get_owned_herdr_session("orphaned-submit-owner")
        .expect("get ownership")
        .expect("ownership row");
    assert_eq!(before.cleanup_state, OwnedHerdrCleanupState::NotRequested);
    assert_eq!(before.cleanup_reason, None);
    ledger.close().expect("close ledger");

    let (code, recovered) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "recovery tick: {recovered}");
    assert_eq!(
        recovered["result"]["cleanup"]["observedControllers"][0]["observation"],
        json!("orphaned-submit-pane-not-found")
    );
    let ledger = env.ledger();
    let released = ledger
        .get_owned_herdr_session("orphaned-submit-owner")
        .expect("get ownership")
        .expect("ownership row");
    assert_eq!(
        released.cleanup_reason,
        Some(OwnedHerdrCleanupReason::OrphanedSubmit)
    );
    assert_eq!(
        released.cleanup_release,
        Some(OwnedHerdrCleanupRelease::PaneNotFound)
    );
    assert_eq!(released.cleanup_state, OwnedHerdrCleanupState::Released);
    ledger.close().expect("close ledger");

    env.set_scenario("implement", "hang", 1);
    let (code, submitted) = env.forged(&["run", "submit", "--run", run]);
    assert_eq!(code, 0, "resubmit: {submitted}");
    assert_eq!(submitted["result"]["controller"]["generation"], json!(2));
    assert!(submitted["result"]["controller"]["pid"].is_number());
    let methods = server.methods();
    assert_eq!(
        methods
            .iter()
            .filter(|method| method.as_str() == "pane.process_info")
            .count(),
        2,
        "one crashed probe and one recovery probe: {methods:?}"
    );
    assert_eq!(
        methods
            .iter()
            .filter(|method| method.as_str() == "pane.close")
            .count(),
        1,
        "only recovery reaches close: {methods:?}"
    );
    stop_run(&env, run);
}
