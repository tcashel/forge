//! Hermetic product-floor convergence matrix.
//!
//! Every fixture owns a scratch HOME, Anvil root, Beads shim store, local
//! repositories, provider shims, and GitHub shim. Nothing in this module may
//! consult operator state or a host service.

mod support;

use std::collections::BTreeSet;
use std::path::Path;
use std::process::Stdio;
use std::time::{Duration, Instant};

use forged_ledger::{
    AttemptState, DesiredReconcileOutcome, DesiredReconcileUpdate, DesiredRestartReservation,
    DesiredState, DesiredSubjectKind,
};
use forged_types::{AdmissionOutcome, AdmissionReason, AdmissionSubjectKind};
#[cfg(feature = "failpoints")]
use nix::errno::Errno;
#[cfg(feature = "failpoints")]
use nix::sys::signal::{kill, killpg, Signal};
#[cfg(feature = "failpoints")]
use nix::unistd::Pid;
// The malformed-facts injection freezes the controller without the
// failpoints feature; it uses fully qualified nix paths.
use serde_json::{json, Value};
use support::TestEnv;

const WAIT: Duration = Duration::from_secs(60);

fn wait_until(what: &str, mut predicate: impl FnMut() -> bool) {
    let started = Instant::now();
    while !predicate() {
        assert!(started.elapsed() < WAIT, "timed out waiting for {what}");
        std::thread::sleep(Duration::from_millis(25));
    }
}

fn set_config(env: &TestEnv, update: impl FnOnce(&mut Value)) {
    let path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_slice(&std::fs::read(&path).expect("read test config"))
            .expect("test config JSON");
    update(&mut config);
    std::fs::write(
        path,
        serde_json::to_vec_pretty(&config).expect("serialize test config"),
    )
    .expect("write test config");
}

fn set_admission(env: &TestEnv, total: u64, repository_write: u64, fanout: u64) {
    set_config(env, |config| {
        config["admission"] = json!({
            "totalActive": total,
            "providerActive": 8,
            "repositoryWriteActive": repository_write,
            "epicFanout": fanout,
            "deferSeconds": 1,
        });
    });
}

fn start_run(env: &TestEnv, run: &str) {
    env.seed_frontier(run);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        run,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start {run}: {started}");
}

fn start_epic(env: &TestEnv, epic: &str, children: &[(&str, &Path, bool)]) {
    env.enable_dynamic_gh();
    env.seed_epic(epic, children);
    assert_eq!(env.forged(&["init"]).0, 0);
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
    assert_eq!(code, 0, "epic start {epic}: {started}");
}

fn park_direct_epic(env: &TestEnv, epic: &str) {
    env.authorize_epic(epic);
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Epic,
            epic,
            DesiredState::Running,
            DesiredReconcileOutcome::Adopted,
            None,
            None,
        )
        .expect("park directly-driven epic outside supervisor scope");
    ledger.close().expect("close ledger");
}

fn provider_starts(env: &TestEnv, stage: &str) -> Vec<String> {
    let needle = format!("/{stage}/0 start ");
    env.provider_log()
        .into_iter()
        .filter(|line| line.contains(&needle))
        .collect()
}

#[cfg(feature = "failpoints")]
fn controller_pid(response: &Value) -> i32 {
    response["result"]["controller"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid")
}

#[cfg(feature = "failpoints")]
fn process_group_alive(group: i32) -> bool {
    matches!(
        kill(Pid::from_raw(-group), None),
        Ok(()) | Err(Errno::EPERM)
    )
}

#[cfg(feature = "failpoints")]
fn kill_group(group: i32) {
    match killpg(Pid::from_raw(group), Signal::SIGKILL) {
        Ok(()) | Err(Errno::ESRCH) => {}
        Err(error) => panic!("kill process group {group}: {error}"),
    }
}

#[cfg(feature = "failpoints")]
fn provider_pid(env: &TestEnv, run: &str) -> i32 {
    std::fs::read_to_string(
        env.latest_attempt_dir(run, "implementation", 0)
            .expect("implementation attempt directory")
            .join("provider.pid"),
    )
    .expect("provider pid")
    .trim()
    .parse()
    .expect("numeric provider pid")
}

fn stop_run(env: &TestEnv, run: &str) {
    let mut last = Value::Null;
    for _ in 0..200 {
        let (code, stopped) = env.forged(&[
            "run",
            "stop",
            "--run",
            run,
            "--outcome",
            "cancelled",
            "--reason",
            "convergence fixture cleanup",
        ]);
        if code == 0 {
            return;
        }
        last = stopped;
        std::thread::sleep(Duration::from_millis(25));
    }
    panic!("could not stop {run}: {last}");
}

fn no_live_reservations(env: &TestEnv) {
    let ledger = env.ledger();
    let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
    ledger.close().expect("close ledger");
    assert!(
        snapshot.reservations.is_empty(),
        "terminal fixture leaked capacity: {:?}",
        snapshot.reservations
    );
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open hermetic reservation ledger");
    let mut statement = connection
        .prepare("SELECT reservation_id, state FROM admission_reservations ORDER BY reservation_id")
        .expect("prepare reservation terminal-state query");
    let rows = statement
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .expect("query every reservation")
        .collect::<Result<Vec<_>, _>>()
        .expect("read every reservation");
    assert!(
        rows.iter().all(|(_, state)| state == "released"),
        "every reservation must reach the explicit released state: {rows:?}"
    );
}

fn expire_latest_retry(env: &TestEnv, run: &str) {
    let connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open hermetic retry clock");
    let (event_id, payload): (i64, String) = connection
        .query_row(
            "SELECT event_id, payload_json FROM events WHERE run_id = ?1 AND kind = 'proto.retry' ORDER BY event_id DESC LIMIT 1",
            [run],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("latest retry event");
    let mut payload: Value = serde_json::from_str(&payload).expect("retry payload");
    payload["retryAfter"] = json!("2000-01-01T00:00:00.000000000Z");
    connection
        .execute(
            "UPDATE events SET payload_json = ?1 WHERE event_id = ?2",
            rusqlite::params![serde_json::to_string(&payload).unwrap(), event_id],
        )
        .expect("advance hermetic retry clock");
}

fn attempts_for(env: &TestEnv, run: &str) -> Vec<forged_ledger::AttemptRow> {
    let ledger = env.ledger();
    let prefix = format!("{run}/");
    let attempts = (1..=128)
        .filter_map(|attempt_id| ledger.get_attempt(attempt_id).ok())
        .filter(|attempt| attempt.packet_id.starts_with(&prefix))
        .collect();
    ledger.close().expect("close ledger");
    attempts
}

fn assert_terminal_artifacts(env: &TestEnv, run: &str, expected: &[AttemptState]) {
    let attempts = attempts_for(env, run);
    let terminal = attempts
        .iter()
        .filter(|attempt| {
            matches!(
                attempt.state,
                AttemptState::Completed
                    | AttemptState::Failed
                    | AttemptState::Reclaimed
                    | AttemptState::Stopped
            )
        })
        .collect::<Vec<_>>();
    assert!(!terminal.is_empty(), "{run} produced no terminal attempts");
    for state in expected {
        assert!(
            terminal.iter().any(|attempt| attempt.state == *state),
            "{run} has no {state:?} attempt: {terminal:?}"
        );
    }

    let ledger = env.ledger();
    let mut paths = BTreeSet::new();
    let mut digests = BTreeSet::new();
    for attempt in terminal {
        let joined = ledger
            .get_attempt_artifact(attempt.attempt_id)
            .expect("artifact lookup")
            .unwrap_or_else(|| {
                panic!(
                    "terminal attempt {} ({:?}) has no manifest",
                    attempt.attempt_id, attempt.state
                )
            });
        assert!(paths.insert(joined.manifest_path.clone()));
        assert!(digests.insert(joined.manifest_sha256.clone()));
        let manifest_path = env.anvil.join("runs").join(run).join(&joined.manifest_path);
        let manifest: Value = serde_json::from_slice(
            &std::fs::read(&manifest_path).expect("read immutable manifest"),
        )
        .expect("manifest JSON");
        assert_eq!(
            manifest["attemptId"],
            json!(attempt.attempt_id),
            "manifest embeds its owning attempt: {}",
            manifest_path.display()
        );
        let (code, verified) = env.forged(&[
            "artifact",
            "verify",
            "--attempt",
            &attempt.attempt_id.to_string(),
        ]);
        assert_eq!(code, 0, "artifact verify: {verified}");
        assert_eq!(verified["result"]["verified"], json!(true), "{verified}");
        assert_eq!(verified["result"]["legacy"], json!(false), "{verified}");
        assert_eq!(verified["result"]["issues"], json!([]), "{verified}");
    }
    ledger.close().expect("close ledger");
}

#[cfg(feature = "failpoints")]
fn artifact_outcome(env: &TestEnv, run: &str, attempt_id: i64) -> String {
    let ledger = env.ledger();
    let joined = ledger
        .get_attempt_artifact(attempt_id)
        .expect("artifact lookup")
        .expect("joined artifact");
    ledger.close().expect("close ledger");
    let run_root = env.anvil.join("runs").join(run);
    let manifest: Value = serde_json::from_slice(
        &std::fs::read(run_root.join(joined.manifest_path)).expect("read manifest"),
    )
    .expect("manifest JSON");
    let result_path = manifest["files"]["result"]["path"]
        .as_str()
        .expect("manifest result path");
    let result: Value = serde_json::from_slice(
        &std::fs::read(run_root.join(result_path)).expect("read result evidence"),
    )
    .expect("result evidence JSON");
    result["outcome"]
        .as_str()
        .expect("result outcome")
        .to_owned()
}

fn exhaust_restart_budget(env: &TestEnv, run: &str) -> forged_ledger::DesiredWorkRow {
    let ledger = env.ledger();
    let restart_budget = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row")
        .restart_budget;
    for index in 0..=restart_budget {
        ledger
            .record_desired_outcome(
                DesiredSubjectKind::Run,
                run,
                DesiredState::Running,
                DesiredReconcileOutcome::Authorized,
                Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                None,
            )
            .expect("make desired row due");
        let token = format!("convergence-restart-{index}");
        let claimed = ledger
            .claim_desired_work(
                DesiredSubjectKind::Run,
                run,
                &token,
                "2099-01-01T00:00:00.000000000Z",
                "2099-01-01T00:01:00.000000000Z",
            )
            .expect("claim desired work")
            .expect("due desired row");
        match ledger
            .reserve_desired_restart(
                DesiredSubjectKind::Run,
                run,
                &token,
                claimed.controller_generation,
            )
            .expect("reserve restart")
        {
            DesiredRestartReservation::Reserved(reserved) => {
                assert!(index < restart_budget, "only the finite budget may reserve");
                ledger
                    .finish_desired_reconciliation(
                        DesiredSubjectKind::Run,
                        run,
                        &token,
                        DesiredReconcileUpdate {
                            desired_state: None,
                            outcome: DesiredReconcileOutcome::Backoff,
                            controller_generation: Some(reserved.controller_generation),
                            predecessor_generation: reserved.predecessor_generation,
                            next_wake_at: Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                            last_progress_at: None,
                            last_error: Some("fixture controller remained dead".to_owned()),
                            attention_condition: None,
                        },
                    )
                    .expect("finish reserved restart");
            }
            DesiredRestartReservation::Exhausted(exhausted) => {
                assert_eq!(index, restart_budget, "exhaust at the configured bound");
                assert_eq!(exhausted.restart_used, exhausted.restart_budget);
                assert!(exhausted.exhausted_at.is_some());
            }
        }
    }
    let exhausted = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row");
    ledger.close().expect("close ledger");
    exhausted
}

#[test]
fn show_hydrated_revision_admits_controller_and_packet() {
    let env = TestEnv::new("adm-show");
    let run = "adm-show";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 1);

    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-show-submit",
    ]);
    assert_eq!(code, 0, "submit: {submitted}");
    assert!(
        submitted["result"]["controller"].is_object(),
        "a complete show row must not false-defer the controller: {submitted}"
    );
    wait_until("show-hydrated packet admission", || {
        provider_starts(&env, "implementation").len() == 1
    });

    let ledger = env.ledger();
    let decisions = ledger
        .latest_admission_decisions(None, None)
        .expect("admission decisions");
    assert!(decisions.iter().any(|decision| {
        decision.subject_kind == AdmissionSubjectKind::Run
            && decision.subject_id == run
            && decision.outcome == AdmissionOutcome::Admitted
    }));
    assert!(decisions.iter().any(|decision| {
        decision.subject_kind == AdmissionSubjectKind::Packet
            && decision.subject_id == format!("{run}/implementation/0")
            && decision.outcome == AdmissionOutcome::Admitted
    }));
    ledger.close().expect("close ledger");

    // The bounded exact-read contract died with the transport: admission
    // reads are in-process snapshots carrying the revision by construction.

    stop_run(&env, run);
    no_live_reservations(&env);
}

#[test]
fn non_runnable_status_defers_only_that_row_in_a_mixed_admission_batch() {
    let env = TestEnv::new("adm-custom-status");
    let custom = "adm-deferred";
    let open = "adm-open";
    start_run(&env, custom);
    start_run(&env, open);
    env.set_work_field(custom, "status", "deferred");
    env.set_work_field(custom, "priority", "0");
    env.set_work_field(open, "priority", "1");
    env.authorize_run(custom);
    env.authorize_run(open);
    env.set_scenario("implement", "hang", 1);

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "mixed admission tick: {tick}");
    wait_until("open peer provider start", || {
        provider_starts(&env, "implementation")
            .iter()
            .any(|start| start.starts_with(&format!("{open}/")))
    });

    let ledger = env.ledger();
    let decisions = ledger
        .latest_admission_decisions(Some(AdmissionSubjectKind::Run), None)
        .expect("run admission decisions")
        .into_iter()
        .filter(|decision| decision.subject_id == custom || decision.subject_id == open)
        .collect::<Vec<_>>();
    let custom_decision = decisions
        .iter()
        .find(|decision| decision.subject_id == custom)
        .expect("custom-status decision");
    assert_eq!(custom_decision.outcome, AdmissionOutcome::Deferred);
    assert_eq!(custom_decision.reason, AdmissionReason::WorkNotRunnable);
    let open_decision = decisions
        .iter()
        .find(|decision| decision.subject_id == open)
        .expect("open decision");
    assert_eq!(open_decision.outcome, AdmissionOutcome::Admitted);
    assert_eq!(open_decision.reason, AdmissionReason::CapacityAvailable);
    assert_eq!(
        custom_decision.batch_id, open_decision.batch_id,
        "both rows must be evaluated from one exact hydration batch"
    );
    ledger.close().expect("close ledger");

    let starts = provider_starts(&env, "implementation");
    assert!(
        starts
            .iter()
            .all(|start| start.starts_with(&format!("{open}/"))),
        "the custom-status row is retained but never runnable: {starts:?}"
    );
    // Batch identity above (`custom_decision.batch_id == open_decision.
    // batch_id`) is the real proof of one exact hydration batch.

    stop_run(&env, open);
    stop_run(&env, custom);
    no_live_reservations(&env);
}

#[test]
fn priority_update_repairs_a_priorityless_item_before_admission() {
    let env = TestEnv::new("adm-priority-update");
    let run = "adm-priority-update";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 1);
    env.set_work_field(run, "priority", "");

    let (code, before) = env.forged(&["work", "show", "--id", run]);
    assert_eq!(code, 0, "show priority-less work: {before}");
    assert_eq!(before["result"]["work"]["priority"], Value::Null);
    let revision = before["result"]["work"]["revision"]
        .as_i64()
        .expect("ledger revision");
    let revision_arg = revision.to_string();
    let (code, repaired) = env.forged(&[
        "work",
        "update",
        "--id",
        run,
        "--expected-revision",
        &revision_arg,
        "--priority",
        "2",
    ]);
    assert_eq!(code, 0, "repair priority: {repaired}");
    assert_eq!(repaired["result"]["work"]["priority"], json!(2));
    assert_eq!(
        repaired["result"]["work"]["revision"],
        json!(revision),
        "priority repair must not mint a spec revision"
    );

    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-priority-update-submit",
    ]);
    assert_eq!(code, 0, "submit after priority repair: {submitted}");
    assert!(
        submitted["result"]["controller"].is_object(),
        "the repaired work item must admit immediately: {submitted}"
    );
    let ledger = env.ledger();
    let admitted = ledger
        .latest_admission_decisions(Some(AdmissionSubjectKind::Run), Some(run))
        .expect("run admission decision")
        .into_iter()
        .any(|decision| {
            decision.subject_id == run && decision.outcome == AdmissionOutcome::Admitted
        });
    ledger.close().expect("close ledger");
    assert!(
        admitted,
        "priority repair must clear WorkMalformed admission"
    );

    stop_run(&env, run);
    no_live_reservations(&env);
}

#[test]
fn malformed_packet_facts_defer_without_reservation_or_provider_effect() {
    let env = TestEnv::new("adm-null");
    let run = "adm-null";
    start_run(&env, run);

    // Controller admission consumes the healthy row; the packet's own exact
    // admission read then finds it malformed (a NULL priority is the
    // WorkMalformed arm). The controller is frozen across the injection so
    // the two admissions cannot race.
    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-null-submit",
    ]);
    assert_eq!(code, 0, "submit: {submitted}");
    assert!(
        submitted["result"]["controller"].is_object(),
        "the healthy full row admits the controller: {submitted}"
    );
    let frozen = submitted["result"]["controller"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid");
    nix::sys::signal::killpg(
        nix::unistd::Pid::from_raw(frozen),
        nix::sys::signal::Signal::SIGSTOP,
    )
    .expect("freeze the controller before injecting malformed facts");
    env.set_work_field(run, "priority", "");
    nix::sys::signal::killpg(
        nix::unistd::Pid::from_raw(frozen),
        nix::sys::signal::Signal::SIGCONT,
    )
    .expect("resume the controller");
    wait_until("packet BeadMalformed decision", || {
        let ledger = env.ledger();
        let found = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Packet), None)
            .expect("packet admission decisions")
            .iter()
            .any(|decision| {
                decision.subject_id == format!("{run}/implementation/0")
                    && decision.outcome == AdmissionOutcome::Deferred
                    && decision.reason == AdmissionReason::WorkMalformed
            });
        ledger.close().expect("close ledger");
        found
    });
    assert!(
        env.provider_log().is_empty(),
        "revision-less packet admission must have zero provider effect"
    );

    // Only the capacity reason family parks. A WorkMalformed deferral never
    // clears by waiting, so the controller keeps the exit contract instead
    // of parking into a silent starve.
    let controller = submitted["result"]["controller"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid");
    wait_until("controller exits on the non-capacity deferral", || {
        !support::pid_alive(controller)
    });

    let ledger = env.ledger();
    let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
    assert!(snapshot.reservations.iter().all(|reservation| {
        reservation.subject_kind != AdmissionSubjectKind::Packet
            || reservation.subject_id != format!("{run}/implementation/0")
    }));
    ledger.close().expect("close ledger");

    stop_run(&env, run);
    no_live_reservations(&env);
}

#[cfg(feature = "failpoints")]
fn deferred_decisions(env: &TestEnv, packet: &str) -> i64 {
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open hermetic decision ledger");
    connection
        .query_row(
            "SELECT COUNT(*) FROM admission_decisions \
             WHERE subject_kind = 'packet' AND subject_id = ?1 AND outcome = 'deferred'",
            [packet],
            |row| row.get(0),
        )
        .expect("count durable deferral decisions")
}

/// The park contract (beads-ntc.15): a sibling holding the one
/// repository-write slot defers the run's remediation claim, and the
/// deferred controller parks — bounded wake, re-project, retry — instead of
/// exiting into a supervisor recycle that charged restart budget and killed
/// live seats.
#[cfg(feature = "failpoints")]
#[test]
fn capacity_deferral_parks_the_controller_instead_of_recycling() {
    let env = TestEnv::new("adm-park");
    set_admission(&env, 8, 1, 3);
    let parked = "adm-park-deferred";
    let holder = "adm-park-holder";
    start_run(&env, parked);
    start_run(&env, holder);

    // Hold the parked run's one review seat open so the fixture can seize
    // the repository-write slot deterministically before remediation claims.
    env.set_scenario("reviewclaude", "wait-release", 1);
    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        parked,
        "--idempotency-key",
        "adm-park-deferred-submit",
    ]);
    assert_eq!(code, 0, "parked submit: {submitted}");
    let parked_pid = controller_pid(&submitted);
    wait_until("parked run held inside its review seat", || {
        provider_starts(&env, "review-1")
            .iter()
            .any(|line| line.starts_with(&format!("{parked}/")))
    });

    // The fixture takes the one repository-write slot and stays inside it.
    env.set_scenario("implement", "hang", 1);
    let (code, held) = env.forged(&[
        "run",
        "submit",
        "--run",
        holder,
        "--idempotency-key",
        "adm-park-holder-submit",
    ]);
    assert_eq!(code, 0, "holder submit: {held}");
    wait_until("holder inside the write slot", || {
        provider_starts(&env, "implementation")
            .iter()
            .any(|line| line.starts_with(&format!("{holder}/")))
    });

    // Release the review: remediation opens, claims, and defers on the held
    // slot. The controller must park across repeated deferral wakes.
    env.release_stage("reviewclaude");
    let packet = format!("{parked}/remediation/0");
    wait_until("first durable capacity deferral", || {
        deferred_decisions(&env, &packet) >= 1
    });
    let window_start: Vec<(i64, AttemptState)> = attempts_for(&env, parked)
        .into_iter()
        .map(|attempt| (attempt.attempt_id, attempt.state))
        .collect();
    assert!(
        !window_start.is_empty(),
        "the parked controller carries settled seats into the deferral window"
    );
    wait_until("repeated deferral wakes without recycling", || {
        deferred_decisions(&env, &packet) >= 4
    });
    assert!(
        support::pid_alive(parked_pid),
        "the deferred controller must stay alive, not exit into a recycle"
    );

    // A due supervisor pass adopts the parked live controller and charges
    // nothing: generation and restart budget stay untouched, and no durable
    // pane cleanup is enqueued for the run's ownership rows.
    let ledger = env.ledger();
    let before = ledger
        .get_desired_work(DesiredSubjectKind::Run, parked)
        .expect("desired query")
        .expect("parked desired row");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            parked,
            DesiredState::Running,
            DesiredReconcileOutcome::Adopted,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make the parked row due");
    ledger.close().expect("close ledger");
    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "supervisor tick over a parked controller: {tick}");
    let ledger = env.ledger();
    let after = ledger
        .get_desired_work(DesiredSubjectKind::Run, parked)
        .expect("desired query")
        .expect("parked desired row");
    ledger.close().expect("close ledger");
    assert_eq!(after.restart_used, 0, "parking must not charge restarts");
    assert_eq!(
        after.controller_generation, before.controller_generation,
        "parking must not recycle the controller generation"
    );
    assert!(after.exhausted_at.is_none());
    assert!(
        support::pid_alive(parked_pid),
        "the adopted parked controller survives the supervisor pass"
    );
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open hermetic ownership ledger");
    let cleanup_requested: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM owned_herdr_sessions WHERE cleanup_state != 'not-requested'",
            [],
            |row| row.get(0),
        )
        .expect("count pane cleanup requests");
    assert_eq!(cleanup_requested, 0, "no pane cleanup may be enqueued");

    // Existing seats are untouched across the deferral window: no attempt
    // row of the parked run moved through failed/reclaimed, and the slot
    // holder's live seat kept running.
    let window_end: Vec<(i64, AttemptState)> = attempts_for(&env, parked)
        .into_iter()
        .map(|attempt| (attempt.attempt_id, attempt.state))
        .collect();
    assert_eq!(
        window_start, window_end,
        "the parked run's attempt rows must not transition during the window"
    );
    assert!(window_end
        .iter()
        .all(|(_, state)| !matches!(state, AttemptState::Failed | AttemptState::Reclaimed)));
    assert!(attempts_for(&env, holder)
        .iter()
        .any(|attempt| attempt.state == AttemptState::Running));

    // While parked, run status carries the typed deferral reason, and the
    // crossed wake threshold surfaces one deduplicated attention entry.
    let (code, status) = env.forged(&["run", "status", "--run", parked]);
    assert_eq!(code, 0, "parked run status: {status}");
    let admission = status["result"]["run"]["admission"]
        .as_array()
        .expect("run status admission facts");
    let remediation = admission
        .iter()
        .find(|decision| decision["packetId"] == json!(packet))
        .unwrap_or_else(|| panic!("remediation admission fact: {status}"));
    assert_eq!(remediation["outcome"], json!("deferred"), "{status}");
    assert_eq!(
        remediation["reason"],
        json!("repository-write-capacity"),
        "{status}"
    );
    let (code, listed) = env.forged(&["overview"]);
    assert_eq!(code, 0, "overview: {listed}");
    let parked_items = listed["result"]["attention"]
        .as_array()
        .expect("attention items")
        .iter()
        .filter(|item| {
            item["id"] == json!(parked) && item["condition"] == json!("admission-deferred")
        })
        .cloned()
        .collect::<Vec<_>>();
    assert_eq!(parked_items.len(), 1, "one deduplicated entry: {listed}");
    assert!(
        parked_items[0]["detail"]
            .as_str()
            .is_some_and(|detail| detail.contains("RepositoryWriteCapacity")),
        "the entry names the admission reason: {parked_items:?}"
    );

    // Releasing the slot admits the deferred packet: it is claimed, its
    // attempt row exists, and the attention entry clears through the admit.
    stop_run(&env, holder);
    wait_until("deferred packet admitted and claimed", || {
        let ledger = env.ledger();
        let admitted = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Packet), Some(packet.as_str()))
            .expect("latest packet decision")
            .into_iter()
            .any(|decision| decision.outcome == AdmissionOutcome::Admitted);
        ledger.close().expect("close ledger");
        admitted
            && attempts_for(&env, parked)
                .iter()
                .any(|attempt| attempt.packet_id == packet)
    });
    let (code, cleared) = env.forged(&["overview"]);
    assert_eq!(code, 0, "post-admit overview: {cleared}");
    assert!(
        cleared["result"]["attention"]
            .as_array()
            .expect("attention items")
            .iter()
            .all(|item| {
                item["id"] != json!(parked) || item["condition"] != json!("admission-deferred")
            }),
        "the admit is the domain transition that clears the entry: {cleared}"
    );

    // The released run drives itself to completion; nothing leaks capacity.
    wait_until("parked run completes after release", || {
        let (_, status) = env.forged(&["run", "status", "--run", parked]);
        status["result"]["run"]["outcome"] == json!("clean")
    });
    no_live_reservations(&env);
}

/// The park contract under review fan-out (beads-ntc.15): an external seat
/// claims the larger-id review sibling inside the smaller sibling's
/// transport-retry window, so the re-claim defers on TotalCapacity while a
/// seat of the SAME run is live. The parked controller must hold across the
/// deferral and supervisor window without recycling, and the live sibling's
/// attempt row must survive it untouched — still completable under its
/// original claim token.
#[cfg(feature = "failpoints")]
#[test]
fn capacity_deferral_parks_while_a_sibling_seat_runs() {
    let env = TestEnv::new("adm-park-fan");
    set_admission(&env, 1, 1, 3);
    let run = "adm-park-fan";
    env.seed_frontier(run);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        run,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "high",
    ]);
    assert_eq!(code, 0, "run start {run}: {started}");

    // review-1's first claim fails on transport, granting the bounded retry
    // window this fixture uses to seize the one admission slot out of claim
    // order before the deterministic min-packet-id re-claim.
    env.set_scenario("reviewclaude", "rate-limit", 1);
    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-park-fan-submit",
    ]);
    assert_eq!(code, 0, "submit: {submitted}");
    let controller = controller_pid(&submitted);
    let deferred_packet = format!("{run}/review-1/0");
    let live_packet = format!("{run}/review-2/0");
    wait_until("review-1 transport-failed and re-claimable", || {
        attempts_for(&env, run).iter().any(|attempt| {
            attempt.packet_id == deferred_packet && attempt.state == AttemptState::Failed
        })
    });

    // The external seat claims the larger-id sibling and stays inside it,
    // holding the single totalActive slot open across the park.
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &live_packet]);
    assert_eq!(code, 0, "external sibling claim: {claimed}");
    let live_attempt = claimed["result"]["attempt_id"]
        .as_i64()
        .expect("external attempt id");
    let live_token = claimed["result"]["claim_token"]
        .as_str()
        .expect("external claim token")
        .to_owned();

    // The retry deadline passes, the re-claim defers on the held slot, and
    // the controller parks with its sibling seat live.
    wait_until("first durable capacity deferral", || {
        deferred_decisions(&env, &deferred_packet) >= 1
    });
    let ledger = env.ledger();
    let decision = ledger
        .latest_admission_decisions(
            Some(AdmissionSubjectKind::Packet),
            Some(deferred_packet.as_str()),
        )
        .expect("latest sibling decision")
        .pop()
        .expect("deferred sibling decision");
    ledger.close().expect("close ledger");
    assert_eq!(decision.outcome, AdmissionOutcome::Deferred);
    assert_eq!(decision.reason, AdmissionReason::TotalCapacity);
    let window_start: Vec<(i64, AttemptState)> = attempts_for(&env, run)
        .into_iter()
        .map(|attempt| (attempt.attempt_id, attempt.state))
        .collect();
    assert!(
        window_start.contains(&(live_attempt, AttemptState::Running)),
        "the parked run carries one LIVE seat into the deferral window: {window_start:?}"
    );
    wait_until("repeated deferral wakes without recycling", || {
        deferred_decisions(&env, &deferred_packet) >= 4
    });
    assert!(
        support::pid_alive(controller),
        "the deferred controller must stay alive, not exit into a recycle"
    );

    // A due supervisor pass adopts the parked live controller and charges
    // nothing: generation and restart budget stay untouched, no durable pane
    // cleanup is enqueued, and the live sibling attempt does not move.
    let ledger = env.ledger();
    let before = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("parked desired row");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Adopted,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make the parked row due");
    ledger.close().expect("close ledger");
    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "supervisor tick over a parked controller: {tick}");
    let ledger = env.ledger();
    let after = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("parked desired row");
    ledger.close().expect("close ledger");
    assert_eq!(after.restart_used, 0, "parking must not charge restarts");
    assert_eq!(
        after.controller_generation, before.controller_generation,
        "parking must not recycle the controller generation"
    );
    assert!(after.exhausted_at.is_none());
    assert!(
        support::pid_alive(controller),
        "the adopted parked controller survives the supervisor pass"
    );
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open hermetic ownership ledger");
    let cleanup_requested: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM owned_herdr_sessions WHERE cleanup_state != 'not-requested'",
            [],
            |row| row.get(0),
        )
        .expect("count pane cleanup requests");
    assert_eq!(cleanup_requested, 0, "no pane cleanup may be enqueued");
    let window_end: Vec<(i64, AttemptState)> = attempts_for(&env, run)
        .into_iter()
        .map(|attempt| (attempt.attempt_id, attempt.state))
        .collect();
    assert_eq!(
        window_start, window_end,
        "the parked run's attempt rows must not transition during the window"
    );
    assert!(
        window_end.contains(&(live_attempt, AttemptState::Running)),
        "the live sibling seat survives the deferral and supervisor window: {window_end:?}"
    );

    // The surviving claim token still lands: the seat was never reclaimed or
    // fenced out while its run was parked. Landing frees the slot, the
    // deferred sibling admits, and the run drives itself to completion.
    let result_path = env.root.join("review-2-result.json");
    std::fs::write(
        &result_path,
        json!({
            "schema": "forged.result.review/1",
            "packetId": live_packet,
            "outcome": {"review": {
                "verdict": "approve",
                "summary": "external sibling review",
                "findings": [],
                "available": true,
            }},
        })
        .to_string(),
    )
    .expect("write external review result");
    let (code, landed) = env.forged(&[
        "packet",
        "complete",
        "--packet",
        &live_packet,
        "--attempt",
        &live_attempt.to_string(),
        "--claim-token",
        &live_token,
        "--result",
        &result_path.to_string_lossy(),
    ]);
    assert_eq!(code, 0, "external completion after the window: {landed}");
    assert_eq!(landed["result"]["outcome"], json!("Landed"), "{landed}");
    wait_until("deferred sibling admitted after the release", || {
        let ledger = env.ledger();
        let admitted = ledger
            .latest_admission_decisions(
                Some(AdmissionSubjectKind::Packet),
                Some(deferred_packet.as_str()),
            )
            .expect("latest sibling decision")
            .into_iter()
            .any(|decision| decision.outcome == AdmissionOutcome::Admitted);
        ledger.close().expect("close ledger");
        admitted
    });
    wait_until("parked run completes after release", || {
        let (_, status) = env.forged(&["run", "status", "--run", run]);
        status["result"]["run"]["outcome"] == json!("clean")
    });
    no_live_reservations(&env);
}

#[test]
fn convergence_authorization_admission_and_fanout() {
    // Ready rows remain inert until the operator submits exactly once.
    let env = TestEnv::new("convergence-authorization");
    start_run(&env, "conv-one-submit");
    let (code, idle) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "unsubmitted supervisor tick: {idle}");
    assert_eq!(idle["result"]["considered"], json!(0));
    let ledger = env.ledger();
    assert!(ledger
        .get_desired_work(DesiredSubjectKind::Run, "conv-one-submit")
        .expect("desired query")
        .is_none());
    ledger.close().expect("close ledger");
    assert!(env.provider_log().is_empty());

    env.set_scenario("implement", "hang", 1);
    let submit_args = [
        "run",
        "submit",
        "--run",
        "conv-one-submit",
        "--idempotency-key",
        "convergence-one-submit",
    ];
    let (code, submitted) = env.forged(&submit_args);
    assert_eq!(code, 0, "submit: {submitted}");
    let (code, replayed) = env.forged(&submit_args);
    assert_eq!(code, 0, "submit replay: {replayed}");
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(
        replayed["result"]["controller"]["generation"],
        submitted["result"]["controller"]["generation"]
    );
    wait_until("the one authorized provider start", || {
        provider_starts(&env, "implementation").len() == 1
    });
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "conv-one-submit")
        .expect("desired query")
        .expect("one submitted desired row");
    assert_eq!(desired.control_revision, 1);
    assert_eq!(
        ledger
            .list_events(Some("conv-one-submit"), 0, 65_536)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        1
    );
    ledger.close().expect("close ledger");
    stop_run(&env, "conv-one-submit");
    no_live_reservations(&env);

    // Two independent children consume the exact two slots. The third has a
    // durable capacity wake; the dependency-constrained fourth is absent.
    let fanout = TestEnv::new("convergence-fanout");
    set_admission(&fanout, 2, 2, 3);
    let fanout_spec = fanout.spec.clone();
    start_epic(
        &fanout,
        "conv-fanout",
        &[
            ("conv-child-a", &fanout_spec, true),
            ("conv-child-b", &fanout_spec, true),
            ("conv-child-c", &fanout_spec, true),
            ("conv-child-dependent", &fanout_spec, false),
        ],
    );
    fanout.set_work_field("conv-child-a", "priority", "0");
    fanout.set_work_field("conv-child-b", "priority", "1");
    fanout.set_work_field("conv-child-c", "priority", "9");
    // Readiness is a store query now: the dependent child is withheld by a
    // real open blocker, not the retired `ready: false` flag.
    fanout.set_work_field(
        "conv-child-dependent",
        "dependencies",
        r#"[{"id":"conv-fanout-blocker","dependency_type":"blocks","status":"open"}]"#,
    );
    park_direct_epic(&fanout, "conv-fanout");
    fanout.set_scenario("implement", "hang", 3);
    let driver = fanout
        .forged_cmd(&["epic", "drive", "--epic", "conv-fanout"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("fanout driver");
    wait_until("two admitted child attempts", || {
        provider_starts(&fanout, "implementation").len() == 2
    });
    std::thread::sleep(Duration::from_millis(400));
    let first_two = provider_starts(&fanout, "implementation");
    assert_eq!(first_two.len(), 2, "capacity fence: {first_two:?}");
    let provider_log = fanout.provider_log();
    assert!(
        first_two.iter().all(|start| {
            let packet = start.split_whitespace().next().expect("packet id");
            !provider_log
                .iter()
                .any(|line| line.starts_with(packet) && line.contains(" end "))
        }),
        "both independent children are simultaneously inside their provider intervals: {provider_log:?}"
    );

    let ledger = fanout.ledger();
    assert_eq!(
        ledger
            .list_live_attempts(None)
            .expect("live attempts")
            .into_iter()
            .filter(|attempt| attempt.packet_id.contains("/implementation/0"))
            .count(),
        2,
        "the durable attempt rows agree with the overlapping effect log"
    );
    let decisions = ledger
        .latest_admission_decisions(None, None)
        .expect("admission decisions")
        .into_iter()
        .filter(|decision| {
            decision.subject_id.starts_with("conv-child-")
                && (decision.subject_kind == AdmissionSubjectKind::Run
                    || decision.subject_id.ends_with("/implementation/0"))
        })
        .collect::<Vec<_>>();
    assert_eq!(
        decisions
            .iter()
            .filter(|decision| {
                decision.subject_kind == AdmissionSubjectKind::Packet
                    && decision.outcome == AdmissionOutcome::Admitted
            })
            .count(),
        2,
        "two admitted packet decisions: {decisions:?}"
    );
    let deferred = decisions
        .iter()
        .find(|decision| {
            decision.outcome == AdmissionOutcome::Deferred
                && decision.subject_id.starts_with("conv-child-")
        })
        .expect("capacity-deferred third child");
    assert!(deferred.next_eligible_wake_at.is_some());
    assert!(!ledger
        .list_runs()
        .expect("runs")
        .iter()
        .any(|run| run.run_id == "conv-child-dependent"));
    let epic_events = ledger
        .list_events(Some("conv-fanout"), 0, 65_536)
        .expect("epic events");
    let wave_position = epic_events
        .iter()
        .position(|event| event.kind == "forged.epic.wave.started")
        .expect("wave start event");
    let first_child_position = epic_events
        .iter()
        .position(|event| event.kind == "forged.epic.child.started")
        .expect("child start event");
    assert!(
        wave_position < first_child_position,
        "wave commits before children"
    );
    ledger.close().expect("close ledger");

    let first = first_two[0].split('/').next().expect("child id").to_owned();
    stop_run(&fanout, &first);
    std::thread::sleep(Duration::from_millis(1_100));
    wait_until("deferred child durable wake", || {
        let _ = fanout.forged(&["supervise", "--once"]);
        provider_starts(&fanout, "implementation").len() == 3
    });
    let starts = provider_starts(&fanout, "implementation");
    let started_children = starts
        .iter()
        .filter_map(|line| line.split('/').next())
        .collect::<BTreeSet<_>>();
    assert_eq!(
        started_children.len(),
        3,
        "all independent children: {starts:?}"
    );
    for child in started_children {
        support::assert_no_overlap(&fanout.provider_log(), &format!("{child}/implementation/0"));
        if child != first {
            stop_run(&fanout, child);
        }
    }
    let output = driver.wait_with_output().expect("fanout driver exits");
    assert!(
        output.status.success(),
        "fanout driver: stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    no_live_reservations(&fanout);

    // A one-slot epic proves integration and GitHub effects are serialized.
    let serial = TestEnv::new("convergence-serialized-integration");
    set_admission(&serial, 8, 1, 1);
    let serial_spec = serial.spec.clone();
    start_epic(
        &serial,
        "conv-serial",
        &[
            ("conv-serial-a", &serial_spec, true),
            ("conv-serial-b", &serial_spec, true),
        ],
    );
    park_direct_epic(&serial, "conv-serial");
    let (code, driven) = serial.forged(&["epic", "drive", "--epic", "conv-serial"]);
    assert_eq!(code, 0, "serialized epic: {driven}");
    assert!(driven["result"]["stopped"]["finalPr"].is_object());
    let calls = serial.gh_calls();
    let merges = calls
        .iter()
        .enumerate()
        .filter(|(_, call)| {
            call.first().is_some_and(|arg| arg == "pr")
                && call.get(1).is_some_and(|arg| arg == "merge")
        })
        .map(|(index, _)| index)
        .collect::<Vec<_>>();
    let creates = calls
        .iter()
        .enumerate()
        .filter(|(_, call)| {
            call.iter().any(|arg| arg.contains("/pulls")) && call.iter().any(|arg| arg == "POST")
        })
        .map(|(index, _)| index)
        .collect::<Vec<_>>();
    assert_eq!(
        merges.len(),
        2,
        "one integration merge per child: {calls:?}"
    );
    assert_eq!(
        creates.len(),
        3,
        "two child PRs and one final PR: {calls:?}"
    );
    assert!(
        merges.iter().all(|index| *index < *creates.last().unwrap()),
        "final PR follows both serialized child merges: {calls:?}"
    );
    no_live_reservations(&serial);
}

#[cfg(feature = "failpoints")]
#[test]
fn convergence_crash_matrix_is_effect_exact() {
    // The three new admission seams converge to one owned effect and release
    // every superseded reservation.
    for (suffix, site, committed, owner) in [
        ("before", "admission.batch.commit.before", false, None),
        ("after", "admission.batch.commit.after", true, None),
        (
            "transfer",
            "admission.reservation.transfer.after",
            true,
            Some("controller"),
        ),
    ] {
        let run = format!("conv-admission-{suffix}");
        let env = TestEnv::new(&run);
        start_run(&env, &run);
        env.set_scenario("implement", "hang", 1);
        let status = env
            .forged_cmd(&["run", "submit", "--run", &run])
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing submitter");
        assert!(!status.success(), "{site} must crash");
        let ledger = env.ledger();
        let decisions = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Run), Some(&run))
            .expect("admission decisions");
        let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
        ledger.close().expect("close ledger");
        assert_eq!(!decisions.is_empty(), committed, "{site}: {decisions:?}");
        if committed {
            let reservation = snapshot
                .reservations
                .iter()
                .find(|reservation| reservation.subject_id == run)
                .expect("committed reservation survives crash");
            assert_eq!(reservation.owner_kind.as_deref(), owner, "{site}");
            if site == "admission.reservation.transfer.after" {
                assert_eq!(
                    snapshot.capacity.total_active, 1,
                    "controller transfer crash retains exactly one admission slot"
                );
            }
        } else {
            assert!(snapshot
                .reservations
                .iter()
                .all(|reservation| reservation.subject_id != run));
        }

        let (code, replayed) = env.forged(&["run", "submit", "--run", &run]);
        assert_eq!(code, 0, "replay {site}: {replayed}");
        wait_until(&format!("one provider start after {site}"), || {
            provider_starts(&env, "implementation").len() == 1
        });
        let ledger = env.ledger();
        assert_eq!(
            ledger
                .list_events(Some(&run), 0, 65_536)
                .expect("events")
                .iter()
                .filter(|event| event.kind == "forged.controller.started")
                .count(),
            1,
            "{site} replay creates one controller"
        );
        ledger.close().expect("close ledger");
        stop_run(&env, &run);
        no_live_reservations(&env);
    }

    // The same boundaries also fence packet admission. Before transfer no
    // attempt exists; after transfer the dead claimant is reclaimed before
    // the one provider-visible successor starts.
    for (suffix, site, committed, transferred) in [
        ("before", "admission.batch.commit.before", false, false),
        ("after", "admission.batch.commit.after", true, false),
        (
            "transfer",
            "admission.reservation.transfer.after",
            true,
            true,
        ),
    ] {
        let run = format!("conv-packet-admission-{suffix}");
        let env = TestEnv::new(&run);
        start_run(&env, &run);
        env.authorize_run(&run);
        let status = env
            .forged_cmd(&["run", "drive", "--run", &run])
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing packet driver");
        assert!(!status.success(), "packet {site} must crash");
        assert!(provider_starts(&env, "implementation").is_empty());
        let ledger = env.ledger();
        let decisions = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Packet), None)
            .expect("packet decisions");
        assert_eq!(!decisions.is_empty(), committed, "packet {site}");
        let live = ledger
            .list_live_attempts(Some(&run))
            .expect("live attempts");
        assert_eq!(!live.is_empty(), transferred, "packet {site}: {live:?}");
        if transferred {
            let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
            assert_eq!(
                snapshot.capacity.total_active, 1,
                "packet transfer crash retains exactly one admission slot"
            );
            ledger
                .assert_admitted_attempt_live(&live[0].claim_token)
                .expect("transferred packet remains authorized before reconciliation");
        }
        ledger.close().expect("close ledger");
        if transferred {
            let (code, reconciled) = env.forged(&["reconcile", "--run", &run]);
            assert_eq!(code, 0, "reconcile packet transfer: {reconciled}");
            assert!(reconciled["result"]["report"]["reclaimed"]
                .as_array()
                .is_some_and(|items| !items.is_empty()));
        }
        let (code, driven) = env.forged(&["run", "drive", "--run", &run]);
        assert_eq!(code, 0, "packet replay {site}: {driven}");
        assert_eq!(provider_starts(&env, "implementation").len(), 1);
        no_live_reservations(&env);
    }

    // A controller identity recorded before the submitter dies is adopted by
    // replay. The detached effect and its durable event remain singleton.
    let handoff = TestEnv::new("convergence-controller-record");
    start_run(&handoff, "conv-controller-record");
    handoff.set_scenario("implement", "hang", 1);
    let status = handoff
        .forged_cmd(&["run", "submit", "--run", "conv-controller-record"])
        .env("FORGED_FAILPOINT", "controller.record.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("crashing controller submitter");
    assert!(!status.success());
    assert!(handoff
        .anvil
        .join("runs/conv-controller-record/controller/controller.json")
        .exists());
    let (code, recovered) = handoff.forged(&["run", "submit", "--run", "conv-controller-record"]);
    assert_eq!(code, 0, "recover recorded controller: {recovered}");
    wait_until("one provider under the adopted controller", || {
        provider_starts(&handoff, "implementation").len() == 1
    });
    let ledger = handoff.ledger();
    assert_eq!(
        ledger
            .list_events(Some("conv-controller-record"), 0, 65_536)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        1
    );
    ledger.close().expect("close ledger");
    stop_run(&handoff, "conv-controller-record");
    no_live_reservations(&handoff);

    // Provider spawn has two different response-loss shapes. Before the
    // spawn, replay adopts the already-claimed attempt and proves no provider
    // ran under a second claim.
    // After the spawn, the first local provider is allowed to finish before
    // recovery, so any successor is serialized and the repository effect is
    // still singular.
    for (suffix, site, starts_at_crash) in [
        ("before", "provider.spawn.before", 0),
        ("after", "provider.spawn.after", 1),
    ] {
        let run = format!("conv-provider-spawn-{suffix}");
        let env = TestEnv::new(&run);
        start_run(&env, &run);
        env.authorize_run(&run);
        let status = env
            .forged_cmd(&["run", "drive", "--run", &run])
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing provider driver");
        assert!(!status.success(), "{site} must crash");
        let mut expected_states = vec![AttemptState::Completed];
        if starts_at_crash == 0 {
            assert!(provider_starts(&env, "implementation").is_empty());
        } else {
            wait_until("post-spawn provider completion", || {
                env.provider_log()
                    .iter()
                    .any(|line| line.starts_with(&run) && line.contains(" end "))
            });
            let provider_group = provider_pid(&env, &run);
            wait_until("post-spawn provider process group exit", || {
                !process_group_alive(provider_group)
            });
            assert_eq!(provider_starts(&env, "implementation").len(), 1);
            let (code, reconciled) = env.forged(&["reconcile", "--run", &run]);
            assert_eq!(code, 0, "reconcile {site}: {reconciled}");
            let predecessor = attempts_for(&env, &run)
                .into_iter()
                .find(|attempt| attempt.packet_id == format!("{run}/implementation/0"))
                .expect("spawn-boundary predecessor");
            assert!(
                matches!(
                    predecessor.state,
                    AttemptState::Failed | AttemptState::Reclaimed
                ),
                "{site} predecessor settles before a successor: {predecessor:?}"
            );
            expected_states.insert(0, predecessor.state);
            if predecessor.state == AttemptState::Failed {
                for _ in 0..8 {
                    let (code, advanced) = env.forged(&["run", "advance", "--run", &run]);
                    assert_eq!(code, 0, "advance {site}: {advanced}");
                    let ledger = env.ledger();
                    let has_retry = ledger
                        .list_events(Some(&run), 0, 65_536)
                        .expect("events")
                        .iter()
                        .any(|event| event.kind == "proto.retry");
                    ledger.close().expect("close ledger");
                    if has_retry {
                        break;
                    }
                }
                expire_latest_retry(&env, &run);
            }
        }
        let (code, resumed) = env.forged(&["run", "drive", "--run", &run]);
        assert_eq!(code, 0, "resume {site}: {resumed}");
        let starts = provider_starts(&env, "implementation");
        assert_eq!(starts.len(), starts_at_crash + 1, "{site}: {starts:?}");
        support::assert_no_overlap(&env.provider_log(), &format!("{run}/implementation/0"));
        let log = support::git(
            &env.worktree(&run),
            &["log", "--format=%s", "origin/main..HEAD"],
        );
        assert_eq!(
            log.lines()
                .filter(|line| line.contains("shim implement"))
                .count(),
            1,
            "{site} leaves one implementation effect: {log}"
        );
        assert_terminal_artifacts(&env, &run, &expected_states);
        no_live_reservations(&env);
    }

    // Killing the controller and racing supervisors admits one replacement.
    let supervisors = TestEnv::new("convergence-controller-supervisor-death");
    start_run(&supervisors, "conv-controller-death");
    supervisors.set_scenario("implement", "hang", 2);
    let (code, submitted) =
        supervisors.forged(&["run", "submit", "--run", "conv-controller-death"]);
    assert_eq!(code, 0, "submit controller death fixture: {submitted}");
    let first_pid = controller_pid(&submitted);
    wait_until("first controller provider", || {
        provider_starts(&supervisors, "implementation").len() == 1
    });
    let first_provider = provider_pid(&supervisors, "conv-controller-death");
    kill_group(first_pid);
    kill_group(first_provider);
    wait_until("first controller death", || !process_group_alive(first_pid));
    wait_until("first provider death", || {
        !process_group_alive(first_provider)
    });
    let (code, reclaimed) = supervisors.forged(&["reconcile", "--run", "conv-controller-death"]);
    assert_eq!(code, 0, "reclaim dead controller attempt: {reclaimed}");
    assert!(reclaimed["result"]["report"]["reclaimed"]
        .as_array()
        .is_some_and(|items| !items.is_empty()));
    let reclaimed_attempt = attempts_for(&supervisors, "conv-controller-death")
        .into_iter()
        .find(|attempt| attempt.state == AttemptState::Reclaimed)
        .expect("reclaimed controller-owned attempt");
    assert_terminal_artifacts(
        &supervisors,
        "conv-controller-death",
        &[AttemptState::Reclaimed],
    );
    assert_eq!(
        artifact_outcome(
            &supervisors,
            "conv-controller-death",
            reclaimed_attempt.attempt_id,
        ),
        "revoked"
    );
    let ledger = supervisors.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            "conv-controller-death",
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make dead controller due");
    ledger.close().expect("close ledger");
    for _ in 0..4 {
        let spawn_tick = || {
            supervisors
                .forged_cmd(&["supervise", "--once"])
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
                .expect("supervisor tick")
        };
        let outputs = [
            spawn_tick().wait_with_output().expect("tick A"),
            spawn_tick().wait_with_output().expect("tick B"),
        ];
        assert!(outputs.iter().all(|output| output.status.success()));
        let ledger = supervisors.ledger();
        let restarted = ledger
            .get_desired_work(DesiredSubjectKind::Run, "conv-controller-death")
            .expect("desired query")
            .is_some_and(|row| row.controller_generation == 2);
        ledger.close().expect("close ledger");
        if restarted {
            break;
        }
    }
    let ledger = supervisors.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "conv-controller-death")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.controller_generation, 2);
    assert_eq!(desired.restart_used, 1);
    assert_eq!(
        ledger
            .list_events(Some("conv-controller-death"), 0, 65_536)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        2,
        "one original and one replacement controller"
    );
    ledger.close().expect("close ledger");
    stop_run(&supervisors, "conv-controller-death");
    no_live_reservations(&supervisors);

    // Killing a foreground supervisor leaves the one live controller alone;
    // the next supervisor adopts it instead of manufacturing work.
    let supervisor = TestEnv::new("convergence-supervisor-death");
    start_run(&supervisor, "conv-supervisor-death");
    supervisor.set_scenario("implement", "hang", 1);
    let (code, submitted) = supervisor.forged(&["run", "submit", "--run", "conv-supervisor-death"]);
    assert_eq!(code, 0, "submit supervisor fixture: {submitted}");
    let session = supervisor
        .forged_cmd(&["supervise"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("foreground supervisor");
    let supervisor_pid = i32::try_from(session.id()).expect("supervisor pid");
    wait_until("foreground supervisor adoption", || {
        let ledger = supervisor.ledger();
        let adopted = ledger
            .get_desired_work(DesiredSubjectKind::Run, "conv-supervisor-death")
            .expect("desired query")
            .is_some_and(|row| row.last_outcome == Some(DesiredReconcileOutcome::Adopted));
        ledger.close().expect("close ledger");
        adopted
    });
    wait_until("supervisor fixture provider", || {
        provider_starts(&supervisor, "implementation").len() == 1
    });
    kill(Pid::from_raw(supervisor_pid), Signal::SIGKILL).expect("kill supervisor");
    let _ = session.wait_with_output();
    let (code, adopted) = supervisor.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "replacement supervisor: {adopted}");
    assert_eq!(provider_starts(&supervisor, "implementation").len(), 1);
    stop_run(&supervisor, "conv-supervisor-death");
    no_live_reservations(&supervisor);

    // Provider evidence committed before settlement is reused as proof after
    // the crashed driver is reclaimed; the repository effect lands once.
    let result = TestEnv::new("convergence-provider-result");
    start_run(&result, "conv-provider-result");
    result.authorize_run("conv-provider-result");
    let status = result
        .forged_cmd(&["run", "drive", "--run", "conv-provider-result"])
        .env("FORGED_FAILPOINT", "provider.result.recorded.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("crashing provider-result driver");
    assert!(!status.success());
    let ledger = result.ledger();
    let first = ledger.get_attempt(1).expect("first attempt");
    assert_eq!(first.state, AttemptState::Running);
    assert!(ledger
        .get_attempt_artifact(first.attempt_id)
        .expect("artifact lookup")
        .is_some());
    ledger.close().expect("close ledger");
    let (code, reconciled) = result.forged(&["reconcile", "--run", "conv-provider-result"]);
    assert_eq!(code, 0, "reconcile provider-result crash: {reconciled}");
    assert!(reconciled["result"]["report"]["reclaimed"]
        .as_array()
        .is_some_and(|items| !items.is_empty()));
    let (code, claimed) = result.forged(&[
        "claim-next",
        "--holder",
        "convergence-resumer",
        "--idempotency-key",
        "convergence-provider-result-resume",
    ]);
    assert_eq!(code, 0, "claim successor: {claimed}");
    let (code, driven) = result.forged(&["run", "drive", "--run", "conv-provider-result"]);
    assert_eq!(code, 0, "resume provider result: {driven}");
    assert_terminal_artifacts(
        &result,
        "conv-provider-result",
        &[AttemptState::Reclaimed, AttemptState::Completed],
    );
    let log = support::git(
        &result.worktree("conv-provider-result"),
        &["log", "--format=%s", "origin/main..HEAD"],
    );
    assert_eq!(
        log.lines()
            .filter(|line| line.contains("shim implement"))
            .count(),
        1,
        "the replay observes the already-applied implementation: {log}"
    );
    no_live_reservations(&result);

    // Draft-PR response loss is probed on replay. Pre-call death creates
    // nothing; post-call death observes the one already-created PR.
    for (suffix, site, creates_at_crash) in [
        ("before", "gh.call.before", 0),
        ("after", "gh.call.after", 1),
    ] {
        let run = format!("conv-gh-create-{suffix}");
        let env = TestEnv::new(&run);
        env.enable_dynamic_gh();
        start_run(&env, &run);
        env.authorize_run(&run);
        let status = env
            .forged_cmd(&["run", "drive", "--run", &run])
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing draft-PR driver");
        assert!(!status.success(), "{site} must crash");
        let create_count = |env: &TestEnv| {
            env.gh_calls()
                .iter()
                .filter(|call| {
                    call.iter().any(|arg| arg.contains("/pulls"))
                        && call.iter().any(|arg| arg == "POST")
                })
                .count()
        };
        assert_eq!(create_count(&env), creates_at_crash, "{site}");
        let (code, reconciled) = env.forged(&["reconcile", "--run", &run]);
        assert_eq!(code, 0, "reconcile {site}: {reconciled}");
        let (code, resumed) = env.forged(&["run", "drive", "--run", &run]);
        assert_eq!(code, 0, "resume {site}: {resumed}");
        assert_eq!(create_count(&env), 1, "{site} creates one draft PR total");
        no_live_reservations(&env);
    }

    // GitHub accepted the child merge, then the controller died. Resume
    // probes the durable external state and never repeats the merge.
    let gh = TestEnv::new("convergence-gh-effect");
    let gh_spec = gh.spec.clone();
    start_epic(&gh, "conv-gh-effect", &[("conv-gh-child", &gh_spec, true)]);
    park_direct_epic(&gh, "conv-gh-effect");
    let status = gh
        .forged_cmd(&["epic", "drive", "--epic", "conv-gh-effect"])
        .env("FORGED_FAILPOINT", "epic.child.merge.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("crashing epic driver");
    assert!(!status.success());
    let merge_count = |env: &TestEnv| {
        env.gh_calls()
            .iter()
            .filter(|call| {
                call.first().is_some_and(|arg| arg == "pr")
                    && call.get(1).is_some_and(|arg| arg == "merge")
            })
            .count()
    };
    assert_eq!(merge_count(&gh), 1);
    let (code, resumed) = gh.forged(&["epic", "drive", "--epic", "conv-gh-effect"]);
    assert_eq!(code, 0, "resume epic merge: {resumed}");
    assert_eq!(merge_count(&gh), 1, "merge is observed, never repeated");
    no_live_reservations(&gh);

    // A provider failure with no retry budget stops once and stays stopped.
    let budget = TestEnv::new("convergence-provider-budget");
    set_config(&budget, |config| {
        config["transport_retry_budget"] = json!(0)
    });
    start_run(&budget, "conv-provider-budget");
    budget.authorize_run("conv-provider-budget");
    budget.set_scenario("implement", "rate-limit", 1);
    let _ = budget.forged(&["run", "drive", "--run", "conv-provider-budget"]);
    let starts = provider_starts(&budget, "implementation").len();
    assert_eq!(starts, 1);
    let _ = budget.forged(&["run", "drive", "--run", "conv-provider-budget"]);
    assert_eq!(provider_starts(&budget, "implementation").len(), starts);
    assert_terminal_artifacts(&budget, "conv-provider-budget", &[AttemptState::Failed]);
    no_live_reservations(&budget);
}

#[test]
fn convergence_attempt_evidence_is_complete() {
    // A transient provider failure retries in place. Every failed and
    // completed attempt gets a distinct immutable manifest accepted by the
    // public verifier.
    let retry = TestEnv::new("convergence-attempt-evidence-retry");
    set_config(&retry, |config| config["transport_retry_budget"] = json!(1));
    start_run(&retry, "conv-evidence-retry");
    retry.authorize_run("conv-evidence-retry");
    retry.set_scenario("implement", "rate-limit", 1);
    for _ in 0..8 {
        let (code, advanced) = retry.forged(&["run", "advance", "--run", "conv-evidence-retry"]);
        assert_eq!(code, 0, "advance retry fixture: {advanced}");
        let ledger = retry.ledger();
        let has_retry = ledger
            .list_events(Some("conv-evidence-retry"), 0, 65_536)
            .expect("events")
            .iter()
            .any(|event| event.kind == "proto.retry");
        ledger.close().expect("close ledger");
        if has_retry {
            break;
        }
    }
    expire_latest_retry(&retry, "conv-evidence-retry");
    let (code, driven) = retry.forged(&["run", "drive", "--run", "conv-evidence-retry"]);
    assert_eq!(code, 0, "drive retry fixture: {driven}");
    let implementation = attempts_for(&retry, "conv-evidence-retry")
        .into_iter()
        .filter(|attempt| attempt.packet_id == "conv-evidence-retry/implementation/0")
        .collect::<Vec<_>>();
    assert_eq!(
        implementation.len(),
        2,
        "one failed attempt and one successor"
    );
    assert_eq!(implementation[0].state, AttemptState::Failed);
    assert_eq!(implementation[1].state, AttemptState::Completed);
    assert_ne!(implementation[0].attempt_id, implementation[1].attempt_id);
    let ledger = retry.ledger();
    assert_eq!(
        ledger
            .list_events(Some("conv-evidence-retry"), 0, 65_536)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "proto.retry")
            .count(),
        1,
        "the failed attempt has exactly one durable retry edge"
    );
    ledger.close().expect("close ledger");
    assert_terminal_artifacts(
        &retry,
        "conv-evidence-retry",
        &[AttemptState::Failed, AttemptState::Completed],
    );
    no_live_reservations(&retry);

    // Attempt-scoped stop is a separate terminal class. The provider driver
    // remains alive long enough to freeze its private output before its stale
    // settlement is rejected.
    let stopped = TestEnv::new("convergence-attempt-evidence-stopped");
    start_run(&stopped, "conv-evidence-stopped");
    stopped.authorize_run("conv-evidence-stopped");
    stopped.set_scenario("implement", "hang", 1);
    let driver = stopped
        .forged_cmd(&["run", "drive", "--run", "conv-evidence-stopped"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("stopped-attempt driver");
    wait_until("stoppable provider attempt", || {
        !provider_starts(&stopped, "implementation").is_empty()
    });
    wait_until("provider start-time identity", || {
        stopped
            .latest_attempt_dir("conv-evidence-stopped", "implementation", 0)
            .is_some_and(|dir| dir.join("provider.lstart").exists())
    });
    let attempt_id = {
        let ledger = stopped.ledger();
        let attempt = ledger
            .list_live_attempts(Some("conv-evidence-stopped"))
            .expect("live attempts")
            .into_iter()
            .next()
            .expect("live attempt");
        ledger.close().expect("close ledger");
        attempt.attempt_id
    };
    let (code, response) = stopped.forged(&[
        "session",
        "stop",
        "--attempt",
        &attempt_id.to_string(),
        "--reason",
        "convergence evidence fixture",
    ]);
    assert_eq!(code, 0, "session stop: {response}");
    let _ = driver.wait_with_output().expect("stopped driver exits");
    wait_until("stopped attempt manifest", || {
        let ledger = stopped.ledger();
        let joined = ledger
            .get_attempt_artifact(attempt_id)
            .expect("artifact lookup")
            .is_some();
        ledger.close().expect("close ledger");
        joined
    });
    assert_terminal_artifacts(&stopped, "conv-evidence-stopped", &[AttemptState::Stopped]);
    stop_run(&stopped, "conv-evidence-stopped");
    no_live_reservations(&stopped);
}

#[test]
fn convergence_review_and_attention_are_bounded() {
    let reviews = TestEnv::new("convergence-review-budget");
    assert_eq!(reviews.forged(&["init"]).0, 0);
    set_config(&reviews, |config| {
        config["profiles"] = json!({
            "standard": {
                "schema": "forged.profile/1",
                "name": "standard",
                "protocol": {"name": "slice", "version": 1},
                "seats": [
                    {"id": "implementation", "role": "implementation", "purpose": "implement"},
                    {"id": "review-1", "role": "review.primary", "purpose": "review"},
                    {"id": "remediation", "role": "remediation", "purpose": "fix"}
                ],
                "riskContext": "Hermetic convergence fixture.",
                "fixRoundBudget": 2,
                "escalateOn": []
            }
        });
    });
    reviews.set_scenario("reviewclaude", "request-changes", 3);
    let repo = reviews.repos.repo.to_string_lossy().into_owned();
    let spec = reviews.spec.to_string_lossy().into_owned();
    reviews.seed_frontier("conv-review-budget");
    let (code, started) = reviews.forged(&[
        "run",
        "start",
        "--work",
        "conv-review-budget",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start review budget: {started}");
    reviews.authorize_run("conv-review-budget");
    let (code, driven) = reviews.forged(&["run", "drive", "--run", "conv-review-budget"]);
    assert_eq!(code, 0, "drive review budget: {driven}");
    assert_eq!(
        driven["result"]["terminal"]["reviewBudgetExhausted"],
        json!({"reviewRounds": 3, "finalVerdict": "requestChanges"})
    );
    let starts = reviews
        .provider_log()
        .into_iter()
        .filter(|line| line.contains(" start "))
        .collect::<Vec<_>>();
    assert_eq!(
        starts
            .iter()
            .filter(|line| line.contains("/review-1/"))
            .count(),
        3
    );
    assert_eq!(
        starts
            .iter()
            .filter(|line| line.contains("/remediation/"))
            .count(),
        2
    );
    let before_replay = starts.len();
    let (code, terminal_replay) = reviews.forged(&["run", "drive", "--run", "conv-review-budget"]);
    assert_eq!(code, 0, "terminal replay: {terminal_replay}");
    assert_eq!(
        reviews
            .provider_log()
            .iter()
            .filter(|line| line.contains(" start "))
            .count(),
        before_replay,
        "no successor packet appears after exact exhaustion"
    );
    let ledger = reviews.ledger();
    assert_eq!(ledger.list_runs().expect("runs").len(), 1);
    ledger.close().expect("close ledger");
    no_live_reservations(&reviews);

    // Exhaust the supervisor restart budget through the real atomic ledger
    // methods. The fourth reservation emits one attention occurrence and
    // makes later ticks inert.
    let attention = TestEnv::new("convergence-restart-attention");
    start_run(&attention, "conv-restart-attention");
    let ledger = attention.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, "conv-restart-attention", 0)
        .expect("authorize desired run");
    ledger.close().expect("close ledger");
    let exhausted_before = exhaust_restart_budget(&attention, "conv-restart-attention");
    let restart_budget = exhausted_before.restart_budget;
    let ledger = attention.ledger();
    let attention_events_before = ledger
        .list_events(Some("conv-restart-attention"), 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| {
            event.kind == "forged.supervisor.attention"
                && event.payload_json.contains("restart-budget-exhausted")
        })
        .count();
    assert_eq!(attention_events_before, 1);
    ledger.close().expect("close ledger");

    for _ in 0..3 {
        let (code, tick) = attention.forged(&["supervise", "--once"]);
        assert_eq!(code, 0, "post-exhaustion tick: {tick}");
    }
    let ledger = attention.ledger();
    let exhausted_after = ledger
        .get_desired_work(DesiredSubjectKind::Run, "conv-restart-attention")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(exhausted_after.restart_used, exhausted_before.restart_used);
    assert_eq!(exhausted_after.updated_at, exhausted_before.updated_at);
    assert_eq!(
        ledger
            .list_events(Some("conv-restart-attention"), 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| {
                event.kind == "forged.supervisor.attention"
                    && event.payload_json.contains("restart-budget-exhausted")
            })
            .count(),
        1,
        "exhaustion attention is a singleton"
    );
    ledger.close().expect("close ledger");
    let (code, overview) = attention.forged(&["overview"]);
    assert_eq!(code, 0, "attention overview: {overview}");
    let items = overview["result"]["attention"]
        .as_array()
        .expect("attention array");
    assert_eq!(
        items
            .iter()
            .filter(|item| item["condition"] == json!("restart-budget-exhausted"))
            .count(),
        1
    );
    let exhausted_item = items
        .iter()
        .find(|item| item["condition"] == json!("restart-budget-exhausted"))
        .expect("restart exhaustion item");
    assert_eq!(exhausted_item["owner"], json!("human"));
    assert_eq!(
        exhausted_item["recommendedAction"]["code"],
        json!("reauthorize-work")
    );
    assert_eq!(
        exhausted_item["evidence"]["restartBudget"],
        json!(restart_budget)
    );
    assert_eq!(
        exhausted_item["evidence"]["restartUsed"],
        json!(restart_budget)
    );
    assert_eq!(
        exhausted_item["evidence"]["controlRevision"],
        json!(exhausted_before.control_revision)
    );
    assert_eq!(exhausted_item["evidence"]["outcome"], json!("exhausted"));
    assert_eq!(
        exhausted_item["evidenceRefs"],
        json!([{"kind": "desired-work", "id": "run:conv-restart-attention"}])
    );

    let attention_id = exhausted_item["attentionId"]
        .as_str()
        .expect("stable attention id")
        .to_owned();
    let occurrence_id = exhausted_item["occurrenceId"]
        .as_str()
        .expect("attention occurrence id")
        .to_owned();
    let (code, stable_overview) = attention.forged(&["overview"]);
    assert_eq!(code, 0, "stable attention overview: {stable_overview}");
    let stable_item = stable_overview["result"]["attention"]
        .as_array()
        .expect("attention array")
        .iter()
        .find(|item| item["condition"] == json!("restart-budget-exhausted"))
        .expect("stable restart exhaustion item");
    assert_eq!(stable_item["attentionId"], json!(attention_id));
    assert_eq!(stable_item["occurrenceId"], json!(occurrence_id));

    attention.authorize_run("conv-restart-attention");
    let recurrent = exhaust_restart_budget(&attention, "conv-restart-attention");
    assert!(recurrent.control_revision > exhausted_before.control_revision);
    let (code, recurrent_overview) = attention.forged(&["overview"]);
    assert_eq!(
        code, 0,
        "recurrent attention overview: {recurrent_overview}"
    );
    let recurrent_item = recurrent_overview["result"]["attention"]
        .as_array()
        .expect("attention array")
        .iter()
        .find(|item| item["condition"] == json!("restart-budget-exhausted"))
        .expect("recurrent restart exhaustion item");
    assert_eq!(recurrent_item["attentionId"], json!(attention_id));
    assert_ne!(recurrent_item["occurrenceId"], json!(occurrence_id));
    no_live_reservations(&attention);
}
