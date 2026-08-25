//! Real-process desired-work supervisor coverage. These tests use the same
//! detached controller path as production and inspect effects, not labels.

mod support;

use std::process::Stdio;
use std::sync::{Mutex, MutexGuard};
use std::time::{Duration, Instant};

use forged_ledger::{DesiredReconcileOutcome, DesiredState, DesiredSubjectKind};
use nix::errno::Errno;
use nix::sys::signal::{kill, killpg, Signal};
use nix::unistd::Pid;
use serde_json::{json, Value};
use support::TestEnv;

const WAIT: Duration = Duration::from_secs(30);
// These cases deliberately create and signal detached process groups. Keep
// their OS-level fixtures disjoint while retaining production timing bounds.
static PROCESS_FIXTURE_LOCK: Mutex<()> = Mutex::new(());

fn serialize_process_fixture() -> MutexGuard<'static, ()> {
    PROCESS_FIXTURE_LOCK
        .lock()
        .unwrap_or_else(std::sync::PoisonError::into_inner)
}

fn start_run(env: &TestEnv, run: &str) {
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, response) = env.forged(&[
        "run",
        "start",
        "--bead",
        run,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {response}");
}

#[test]
fn recovered_live_attempt_persists_a_wake_no_later_than_its_deadline() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-provider-deadline-wake");
    let config_path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(
        &std::fs::read_to_string(&config_path).expect("read stage-budget config"),
    )
    .expect("config JSON");
    config["stage_budget_s"]["implement"] = json!(3);
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize stage-budget config"),
    )
    .expect("write stage-budget config");

    start_run(&env, "run-deadline-wake");
    env.set_scenario("implement", "hang", 1);
    let (code, submitted) = env.forged(&["run", "submit", "--run", "run-deadline-wake"]);
    assert_eq!(code, 0, "submit: {submitted}");
    wait_until("provider attempt starts", || {
        implementation_starts(&env, "run-deadline-wake") == 1
    });

    let (code, adopted) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "adopt tick: {adopted}");
    assert_eq!(adopted["result"]["subjects"][0]["action"], json!("adopted"));
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-deadline-wake")
        .expect("desired query")
        .expect("desired row");
    let attempt = ledger
        .list_live_attempts(Some("run-deadline-wake"))
        .expect("live attempts")
        .into_iter()
        .next()
        .expect("running provider attempt");
    let deadline = forged_proto::stage_deadline_at(&attempt.started_at, 3).expect("deadline");
    assert!(
        desired
            .next_wake_at
            .as_deref()
            .is_some_and(|wake| wake <= deadline.as_str()),
        "durable supervisor wake {:?} must not follow provider deadline {deadline}",
        desired.next_wake_at
    );
    ledger.close().expect("close");

    let _ = env.forged(&[
        "run",
        "stop",
        "--run",
        "run-deadline-wake",
        "--outcome",
        "cancelled",
        "--reason",
        "test cleanup",
    ]);
}

fn wait_until(what: &str, mut predicate: impl FnMut() -> bool) {
    let started = Instant::now();
    while !predicate() {
        assert!(started.elapsed() < WAIT, "timed out waiting for {what}");
        std::thread::sleep(Duration::from_millis(25));
    }
}

fn process_group_alive(group: i32) -> bool {
    matches!(
        kill(Pid::from_raw(-group), None),
        Ok(()) | Err(Errno::EPERM)
    )
}

fn controller_pid(response: &Value) -> i32 {
    response["result"]["controller"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid")
}

fn implementation_starts(env: &TestEnv, run: &str) -> usize {
    let prefix = format!("{run}/implementation/0");
    env.provider_log()
        .iter()
        .filter(|line| line.starts_with(&prefix) && line.contains(" start "))
        .count()
}

#[test]
fn never_submitted_and_failed_submissions_never_become_desired() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-authorization-boundary");
    start_run(&env, "run-never-submitted");
    let (code, report) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "empty tick: {report}");
    assert_eq!(
        report["result"]["schema"],
        json!("forged.supervise.report/1")
    );
    assert_eq!(report["result"]["considered"], json!(0));
    let ledger = env.ledger();
    assert!(ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-never-submitted")
        .expect("desired query")
        .is_none());
    ledger.close().expect("close");

    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config JSON");
    config["host_policy"] = json!("required");
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("config JSON"),
    )
    .expect("write config");
    start_run(&env, "run-failed-submit");
    let (code, failed) = env.forged(&["run", "submit", "--run", "run-failed-submit"]);
    assert_ne!(code, 0, "required absent Herdr must fail: {failed}");
    let ledger = env.ledger();
    assert!(ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-failed-submit")
        .expect("desired query")
        .is_none());
    ledger.close().expect("close");
}

#[test]
fn capacity_queued_submit_replays_by_key_and_fresh_key_retries_later() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-queued-submit-replay");
    let config_path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(
        &std::fs::read_to_string(&config_path).expect("read config for admission limit"),
    )
    .expect("config JSON");
    config["admission"] = json!({
        "totalActive": 1,
        "providerActive": 4,
        "repositoryWriteActive": 1,
        "deferSeconds": 60,
    });
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize admission config"),
    )
    .expect("write admission config");

    start_run(&env, "run-capacity-holder");
    start_run(&env, "run-capacity-queued");
    env.set_scenario("implement", "hang", 2);
    let (code, holder) = env.forged(&[
        "run",
        "submit",
        "--run",
        "run-capacity-holder",
        "--idempotency-key",
        "capacity-holder",
    ]);
    assert_eq!(code, 0, "holder submit: {holder}");
    wait_until("holder attempt to consume capacity", || {
        implementation_starts(&env, "run-capacity-holder") == 1
    });

    let queued_args = [
        "run",
        "submit",
        "--run",
        "run-capacity-queued",
        "--idempotency-key",
        "capacity-queued",
    ];
    let (code, queued) = env.forged(&queued_args);
    assert_eq!(code, 0, "capacity queue: {queued}");
    assert_eq!(queued["result"]["queued"], json!(true));
    assert_eq!(queued["result"]["controller"], Value::Null);
    assert_eq!(queued["reused"], json!(false));

    let (code, replayed) = env.forged(&queued_args);
    assert_eq!(code, 0, "queued replay: {replayed}");
    assert_eq!(replayed["operationId"], queued["operationId"]);
    assert_eq!(replayed["result"], queued["result"]);
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(implementation_starts(&env, "run-capacity-queued"), 0);

    let (code, stopped) = env.forged(&[
        "run",
        "stop",
        "--run",
        "run-capacity-holder",
        "--outcome",
        "cancelled",
        "--reason",
        "release admission capacity",
    ]);
    assert_eq!(code, 0, "stop holder: {stopped}");
    wait_until("holder attempt capacity release", || {
        let ledger = env.ledger();
        let empty = ledger
            .list_live_attempts(Some("run-capacity-holder"))
            .expect("list holder attempts")
            .is_empty();
        ledger.close().expect("close holder ledger");
        empty
    });

    let (code, retried) = env.forged(&[
        "run",
        "submit",
        "--run",
        "run-capacity-queued",
        "--idempotency-key",
        "capacity-retry",
    ]);
    assert_eq!(code, 0, "fresh-key retry: {retried}");
    assert_eq!(retried["result"]["submitted"], json!(true));
    assert_ne!(retried["result"]["queued"], json!(true));
    assert!(retried["result"]["controller"].is_object());
    assert_ne!(retried["operationId"], queued["operationId"]);

    let _ = env.forged(&[
        "run",
        "stop",
        "--run",
        "run-capacity-queued",
        "--outcome",
        "cancelled",
        "--reason",
        "test cleanup",
    ]);
}

#[test]
fn once_adopts_live_work_and_concurrent_ticks_restart_once() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-restart-singleton");
    let config_path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(
        &std::fs::read_to_string(&config_path).expect("read restart admission config"),
    )
    .expect("config JSON");
    config["admission"] = json!({
        "totalActive": 8,
        "providerActive": 4,
        "repositoryWriteActive": 2,
        "deferSeconds": 60,
    });
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize restart admission config"),
    )
    .expect("write restart admission config");
    start_run(&env, "run-supervised");
    env.set_scenario("implement", "hang", 2);
    let (code, submitted) = env.forged(&["run", "submit", "--run", "run-supervised"]);
    assert_eq!(code, 0, "submit: {submitted}");
    let first_pid = controller_pid(&submitted);

    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-supervised")
        .expect("desired query")
        .expect("successful submit authorizes");
    assert_eq!(desired.desired_state, DesiredState::Running);
    assert_eq!(desired.controller_generation, 1);
    ledger.close().expect("close");

    // The live provider now occupies the default repository-write slot.
    // Adoption is observation and must still precede replacement admission.
    wait_until("first controller provider start", || {
        implementation_starts(&env, "run-supervised") == 1
    });

    let (code, adopted) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "adopt tick: {adopted}");
    assert_eq!(adopted["result"]["subjects"][0]["action"], json!("adopted"));
    assert_eq!(
        adopted["result"]["subjects"][0]["desiredWork"]["controllerGeneration"],
        json!(1)
    );

    killpg(Pid::from_raw(first_pid), Signal::SIGKILL).expect("kill first controller group");
    wait_until("first controller group death", || {
        !process_group_alive(first_pid)
    });
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            "run-supervised",
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make killed controller immediately due");
    ledger.close().expect("close");

    let spawn_tick = || {
        env.forged_cmd(&["supervise", "--once"])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("supervisor tick spawns")
    };
    let first = spawn_tick();
    let second = spawn_tick();
    let outputs = [
        first.wait_with_output().expect("first tick exits"),
        second.wait_with_output().expect("second tick exits"),
    ];
    for output in &outputs {
        assert!(
            output.status.success(),
            "tick failed: stdout={} stderr={}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
    }

    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-supervised")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.controller_generation, 2);
    assert_eq!(desired.restart_used, 1);
    let starts = ledger
        .list_events(Some("run-supervised"), 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "forged.controller.started")
        .count();
    assert_eq!(starts, 2, "one initial generation plus one restart");
    let restarted = ledger
        .list_events(Some("run-supervised"), 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "forged.supervisor.restarted")
        .count();
    assert_eq!(restarted, 1, "predecessor evidence is singleton");
    ledger.close().expect("close");

    let record: Value = serde_json::from_slice(
        &std::fs::read(
            env.anvil
                .join("runs/run-supervised/controller/controller.json"),
        )
        .expect("controller record"),
    )
    .expect("controller JSON");
    assert_eq!(record["generation"], json!(2));
    let second_pid = record["driver"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("second controller pid");
    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        "run-supervised",
        "--outcome",
        "cancelled",
        "--reason",
        "restart singleton test cleanup",
    ]);
    assert_eq!(code, 0, "stop restart fixture: {cleanup}");
    wait_until("second controller group death", || {
        !process_group_alive(second_pid)
    });
}

#[cfg(feature = "failpoints")]
#[test]
fn restart_recovers_a_preparing_admission_after_spawn_crash() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-recover-preparing-admission");
    let config_path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(
        &std::fs::read_to_string(&config_path).expect("read restart admission config"),
    )
    .expect("config JSON");
    config["admission"] = json!({
        "totalActive": 8,
        "providerActive": 4,
        "repositoryWriteActive": 2,
        "deferSeconds": 60,
    });
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize restart admission config"),
    )
    .expect("write restart admission config");

    let run = "run-recover-preparing-admission";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 2);
    let (code, submitted) = env.forged(&["run", "submit", "--run", run]);
    assert_eq!(code, 0, "submit: {submitted}");
    let first_pid = controller_pid(&submitted);
    wait_until("first controller provider start", || {
        implementation_starts(&env, run) == 1
    });
    killpg(Pid::from_raw(first_pid), Signal::SIGKILL).expect("kill first controller group");
    wait_until("first controller group death", || {
        !process_group_alive(first_pid)
    });
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make killed controller immediately due");
    ledger.close().expect("close");

    let status = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "controller.spawn.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("crashing supervisor tick");
    assert!(!status.success(), "spawn failpoint must crash");

    let controller_dir = env.anvil.join(format!("runs/{run}/controller"));
    let admission_path = controller_dir.join("runtime-admission.json");
    wait_until("generation two process identity", || {
        controller_dir.join("controller-2.pid").exists()
            && controller_dir.join("controller-2.lstart").exists()
    });
    let admission: Value = serde_json::from_slice(
        &std::fs::read(&admission_path).expect("preserved runtime admission"),
    )
    .expect("admission JSON");
    assert_eq!(admission["generation"], json!(2));
    assert_eq!(admission["state"], json!("preparing"));
    let predecessor: Value = serde_json::from_slice(
        &std::fs::read(controller_dir.join("controller.json")).expect("predecessor record"),
    )
    .expect("controller JSON");
    assert_eq!(predecessor["generation"], json!(1));
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make spawn-crash recovery immediately due");
    ledger.close().expect("close");

    let (code, recovered) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "recovery tick: {recovered}");
    assert_eq!(
        recovered["result"]["subjects"][0]["action"],
        json!("adopted"),
        "{recovered}"
    );
    let record: Value = serde_json::from_slice(
        &std::fs::read(controller_dir.join("controller.json")).expect("recovered record"),
    )
    .expect("controller JSON");
    assert_eq!(record["generation"], json!(2));
    assert_eq!(record["recoveredAfterSpawnCrash"], json!(true));
    assert!(
        !admission_path.exists(),
        "matching recovered identity must clear the runtime fence"
    );
    let ledger = env.ledger();
    let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
    assert!(snapshot.reservations.iter().all(|reservation| {
        reservation.subject_kind != forged_types::AdmissionSubjectKind::Run
            || reservation.subject_id != run
    }));
    ledger.close().expect("close");
    assert_eq!(
        implementation_starts(&env, run),
        1,
        "controller recovery must not duplicate the provider effect"
    );

    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "cancelled",
        "--reason",
        "preparing-admission recovery test cleanup",
    ]);
    assert_eq!(code, 0, "stop recovery fixture: {cleanup}");
}

#[test]
fn live_controller_adoption_bypasses_full_repository_capacity() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-adopt-full-capacity");
    start_run(&env, "run-adopt-full");
    env.set_scenario("implement", "hang", 1);
    let (code, submitted) = env.forged(&["run", "submit", "--run", "run-adopt-full"]);
    assert_eq!(code, 0, "submit: {submitted}");
    let controller = controller_pid(&submitted);
    wait_until("provider fills repository capacity", || {
        implementation_starts(&env, "run-adopt-full") == 1
    });

    let (code, adopted) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "adopt tick: {adopted}");
    assert_eq!(adopted["result"]["subjects"][0]["action"], json!("adopted"));
    assert_eq!(
        adopted["result"]["subjects"][0]["desiredWork"]["controllerGeneration"],
        json!(1)
    );
    assert_eq!(implementation_starts(&env, "run-adopt-full"), 1);

    let ledger = env.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, "run-adopt-full", 2)
        .expect("advance desired generation without replacing the live controller");
    ledger.close().expect("close");
    let (code, mismatch) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "mismatched-generation tick: {mismatch}");
    assert_eq!(
        mismatch["result"]["subjects"][0]["action"],
        json!("attention")
    );
    assert_eq!(
        mismatch["result"]["subjects"][0]["desiredWork"]["controllerGeneration"],
        json!(2),
        "an older live generation must never roll durable authority backward"
    );
    assert_eq!(implementation_starts(&env, "run-adopt-full"), 1);

    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        "run-adopt-full",
        "--outcome",
        "cancelled",
        "--reason",
        "full-capacity adoption test cleanup",
    ]);
    assert_eq!(code, 0, "stop adoption fixture: {cleanup}");
    wait_until("adoption fixture controller group death", || {
        !process_group_alive(controller)
    });
}

#[test]
fn foreground_mode_exits_cleanly_on_sigint_without_duplicate_effects() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-foreground-signal");
    start_run(&env, "run-foreground");
    env.set_scenario("implement", "hang", 2);
    let (code, submitted) = env.forged(&["run", "submit", "--run", "run-foreground"]);
    assert_eq!(code, 0, "submit: {submitted}");
    let controller = controller_pid(&submitted);

    let supervisor = env
        .forged_cmd(&["supervise"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("foreground supervisor spawns");
    let supervisor_pid = i32::try_from(supervisor.id()).expect("supervisor pid fits i32");

    wait_until("foreground adoption without a duplicate effect", || {
        let ledger = env.ledger();
        let adopted = ledger
            .get_desired_work(DesiredSubjectKind::Run, "run-foreground")
            .expect("desired query")
            .is_some_and(|row| {
                row.last_outcome == Some(DesiredReconcileOutcome::Adopted)
                    && row.controller_generation == 1
                    && row.restart_used == 0
            });
        ledger.close().expect("close");
        adopted && implementation_starts(&env, "run-foreground") == 1
    });

    kill(Pid::from_raw(supervisor_pid), Signal::SIGINT).expect("signal foreground supervisor");
    let output = supervisor
        .wait_with_output()
        .expect("foreground supervisor exits");
    assert!(
        output.status.success(),
        "supervisor failed: stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let response: Value = serde_json::from_slice(&output.stdout).expect("supervisor response JSON");
    assert_eq!(
        response["result"]["schema"],
        json!("forged.supervise.session/1")
    );
    assert_eq!(response["result"]["reason"], json!("signal"));
    assert!(response["result"]["ticks"]
        .as_u64()
        .is_some_and(|ticks| ticks >= 1));
    assert_eq!(
        response["result"]["lastReport"]["schema"],
        json!("forged.supervise.report/1")
    );

    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-foreground")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.controller_generation, 1);
    assert_eq!(desired.restart_used, 0);
    let starts = ledger
        .list_events(Some("run-foreground"), 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "forged.controller.started")
        .count();
    assert_eq!(starts, 1, "foreground reconciliation only adopted");
    ledger.close().expect("close");
    assert_eq!(implementation_starts(&env, "run-foreground"), 1);

    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        "run-foreground",
        "--outcome",
        "cancelled",
        "--reason",
        "foreground signal test cleanup",
    ]);
    assert_eq!(code, 0, "stop foreground fixture: {cleanup}");
    wait_until("foreground controller cleanup", || {
        !process_group_alive(controller)
    });
}

#[test]
fn foreground_mode_exits_cleanly_on_sigterm() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-foreground-sigterm");
    start_run(&env, "run-sigterm");
    env.set_scenario("implement", "hang", 2);
    let (code, submitted) = env.forged(&["run", "submit", "--run", "run-sigterm"]);
    assert_eq!(code, 0, "submit: {submitted}");
    let controller = controller_pid(&submitted);
    let supervisor = env
        .forged_cmd(&["supervise"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("foreground supervisor spawns");
    let supervisor_pid = i32::try_from(supervisor.id()).expect("supervisor pid fits i32");

    wait_until("SIGTERM handler is active after a completed tick", || {
        let ledger = env.ledger();
        let adopted = ledger
            .get_desired_work(DesiredSubjectKind::Run, "run-sigterm")
            .expect("desired query")
            .is_some_and(|row| row.last_outcome == Some(DesiredReconcileOutcome::Adopted));
        ledger.close().expect("close");
        adopted
    });
    kill(Pid::from_raw(supervisor_pid), Signal::SIGTERM).expect("SIGTERM foreground supervisor");
    let output = supervisor
        .wait_with_output()
        .expect("foreground supervisor exits");
    assert!(
        output.status.success(),
        "supervisor failed: stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let response: Value = serde_json::from_slice(&output.stdout).expect("supervisor response JSON");
    assert_eq!(
        response["result"]["schema"],
        json!("forged.supervise.session/1")
    );
    assert_eq!(response["result"]["reason"], json!("sigterm"));
    assert!(response["result"]["ticks"]
        .as_u64()
        .is_some_and(|ticks| ticks >= 1));
    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        "run-sigterm",
        "--outcome",
        "cancelled",
        "--reason",
        "SIGTERM test cleanup",
    ]);
    assert_eq!(code, 0, "stop SIGTERM fixture: {cleanup}");
    wait_until("SIGTERM fixture controller group death", || {
        !process_group_alive(controller)
    });
}

#[test]
fn unresolved_input_reparks_but_resolution_wakes_the_next_tick() {
    let _serial = serialize_process_fixture();
    let env = TestEnv::new("supervise-input-resolution");
    env.enable_dynamic_gh();
    env.seed_epic("epic-input", &[("direct-decision", &env.spec, true)]);
    env.set_bead_field("direct-decision", "type", "decision");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-input",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    let (code, prepared) = env.forged(&["epic", "advance", "--epic", "epic-input"]);
    assert_eq!(code, 0, "prepare integration: {prepared}");
    assert!(prepared["result"]["progress"].is_object());

    let ledger = env.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Epic, "epic-input", 0)
        .expect("authorize desired epic");
    ledger.close().expect("close");
    let (code, wave) = env.forged(&["epic", "advance", "--epic", "epic-input"]);
    assert_eq!(code, 0, "commit complete wave: {wave}");
    assert!(wave["result"]["progress"]["wave"].is_number());
    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-input"]);
    assert_eq!(code, 0, "input stop: {held}");
    assert_eq!(held["result"]["stopped"]["code"], json!("non-code-child"));
    let ledger = env.ledger();
    let parked = ledger
        .get_desired_work(DesiredSubjectKind::Epic, "epic-input")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(
        parked.last_outcome,
        Some(DesiredReconcileOutcome::Attention)
    );
    assert!(parked.next_wake_at.is_none());
    ledger.close().expect("close");

    let (code, resumed) = env.forged(&[
        "epic",
        "resume",
        "--epic",
        "epic-input",
        "--reason",
        "reconsider without resolving",
    ]);
    assert_eq!(code, 0, "resume: {resumed}");
    let (code, unresolved_tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "unresolved tick: {unresolved_tick}");
    assert_eq!(
        unresolved_tick["result"]["subjects"][0]["action"],
        json!("attention")
    );
    let ledger = env.ledger();
    let still_parked = ledger
        .get_desired_work(DesiredSubjectKind::Epic, "epic-input")
        .expect("desired query")
        .expect("desired row");
    assert!(still_parked.next_wake_at.is_none());
    assert_eq!(still_parked.controller_generation, 0);
    assert_eq!(
        ledger
            .list_events(Some("epic-input"), 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        0,
        "resume alone cannot bypass unresolved input"
    );
    ledger.close().expect("close");

    env.set_bead_field("direct-decision", "type", "task");
    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-input",
        "--child",
        "direct-decision",
        "--note",
        "converted the decision into executable work",
    ]);
    assert_eq!(code, 0, "resolve: {resolved}");
    let ledger = env.ledger();
    let due = ledger
        .get_desired_work(DesiredSubjectKind::Epic, "epic-input")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(due.last_outcome, Some(DesiredReconcileOutcome::Authorized));
    assert!(due.next_wake_at.is_some(), "resolution wakes desired work");
    ledger.close().expect("close");

    env.set_scenario("implement", "hang", 2);
    let (code, continued) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "resolved tick: {continued}");
    assert_eq!(
        continued["result"]["subjects"][0]["action"],
        json!("restarted")
    );
    let ledger = env.ledger();
    let running = ledger
        .get_desired_work(DesiredSubjectKind::Epic, "epic-input")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(running.controller_generation, 1);
    assert_eq!(
        ledger
            .list_events(Some("epic-input"), 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        1
    );
    ledger.close().expect("close");

    let record: Value = serde_json::from_slice(
        &std::fs::read(env.anvil.join("runs/epic-input/controller/controller.json"))
            .expect("controller record"),
    )
    .expect("controller JSON");
    if let Some(pid) = record["driver"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
    {
        let _ = killpg(Pid::from_raw(pid), Signal::SIGKILL);
    }
}
