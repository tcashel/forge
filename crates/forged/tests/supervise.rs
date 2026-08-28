//! Real-process desired-work supervisor coverage. These tests use the same
//! detached controller path as production and inspect effects, not labels.

mod support;

use std::process::Stdio;
use std::time::{Duration, Instant};

use forged_ledger::{DesiredReconcileOutcome, DesiredState, DesiredSubjectKind};
use nix::errno::Errno;
use nix::sys::signal::{kill, killpg, Signal};
use nix::unistd::Pid;
use serde_json::{json, Value};
use support::TestEnv;

const WAIT: Duration = Duration::from_secs(30);
// These cases deliberately create and signal detached process groups and
// assert production timing bounds, so they must never co-schedule. Under
// nextest the `supervise-process-fixtures` group in `.config/nextest.toml`
// enforces that; under any other runner the cases SKIP loudly instead of
// running unserialized. Never reintroduce an in-process lock here: nextest
// runs every test in its own process, where such a lock serializes nothing.

/// Confirm the runner keeps this binary's cases disjoint, or SKIP loudly.
/// `NEXTEST` is set in test environments by nextest (whose test group
/// serializes the binary); `RUST_TEST_THREADS=1` marks a deliberately serial
/// libtest run. The `--test-threads=1` flag leaves no environment trace and
/// cannot be honored here — use the environment variable instead.
fn require_serialized_runner() -> bool {
    if std::env::var_os("NEXTEST").is_some() {
        return true;
    }
    if std::env::var("RUST_TEST_THREADS").is_ok_and(|threads| threads == "1") {
        return true;
    }
    eprintln!(
        "SKIP: supervise cases need `cargo nextest run` (serialization \
         contract in .config/nextest.toml) or RUST_TEST_THREADS=1; test not run"
    );
    false
}

struct PausedProcessGroup(Option<i32>);

impl PausedProcessGroup {
    fn pause(group: i32) -> Self {
        killpg(Pid::from_raw(group), Signal::SIGSTOP).expect("pause controller process group");
        Self(Some(group))
    }

    fn resume(mut self) {
        let group = self.0.expect("paused process group");
        killpg(Pid::from_raw(group), Signal::SIGCONT).expect("resume controller process group");
        self.0 = None;
    }
}

impl Drop for PausedProcessGroup {
    fn drop(&mut self) {
        if let Some(group) = self.0.take() {
            let _ = killpg(Pid::from_raw(group), Signal::SIGCONT);
        }
    }
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
    if !require_serialized_runner() {
        return;
    }
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
    let controller = controller_pid(&submitted);
    wait_until("provider attempt starts", || {
        implementation_starts(&env, "run-deadline-wake") == 1
    });
    wait_until("provider submission fence release", || {
        let ledger = env.ledger();
        let released = ledger
            .read_merge_slot("controller-submit:run:run-deadline-wake")
            .expect("submit slot")
            .is_none();
        ledger.close().expect("close");
        released
    });
    // Hold the real detached controller at a live provider attempt so this
    // observation test cannot become a provider-timeout test on a slow host.
    let paused = PausedProcessGroup::pause(controller);
    let ledger = env.ledger();
    let attempt = ledger
        .list_live_attempts(Some("run-deadline-wake"))
        .expect("live attempts")
        .into_iter()
        .next()
        .expect("running provider attempt");
    let attempt_id = attempt.attempt_id;
    let deadline = forged_proto::stage_deadline_at(&attempt.started_at, 3).expect("deadline");
    ledger.close().expect("close");

    let (code, adopted) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "adopt tick: {adopted}");
    assert_eq!(adopted["result"]["subjects"][0]["action"], json!("adopted"));
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-deadline-wake")
        .expect("desired query")
        .expect("desired row");
    let live_attempts = ledger
        .list_live_attempts(Some("run-deadline-wake"))
        .expect("live attempts");
    assert_eq!(live_attempts.len(), 1, "one provider attempt remains live");
    assert_eq!(
        live_attempts[0].attempt_id, attempt_id,
        "supervisor observation must retain the same live attempt"
    );
    assert!(
        desired
            .next_wake_at
            .as_deref()
            .is_some_and(|wake| wake <= deadline.as_str()),
        "durable supervisor wake {:?} must not follow provider deadline {deadline}",
        desired.next_wake_at
    );
    ledger.close().expect("close");
    paused.resume();

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
    if !require_serialized_runner() {
        return;
    }
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
    if !require_serialized_runner() {
        return;
    }
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

#[cfg(feature = "failpoints")]
#[test]
fn once_reports_superseded_when_foreground_progress_clears_a_deferred_claim() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-deferred-claim-superseded");
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
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

    let holder = "run-supervisor-capacity-holder";
    let target = "run-supervisor-deferred-target";
    start_run(&env, holder);
    start_run(&env, target);
    env.set_scenario("implement", "hang", 1);
    let (code, submitted) = env.forged(&["run", "submit", "--run", holder]);
    assert_eq!(code, 0, "holder submit: {submitted}");
    wait_until("holder consumes the only admission slot", || {
        implementation_starts(&env, holder) == 1
    });
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            holder,
            DesiredState::Running,
            DesiredReconcileOutcome::Adopted,
            Some("9999-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("park capacity holder observation");
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, target, 1)
        .expect("authorize due target");
    ledger.close().expect("close ledger");

    let failpoint = env.root.join("supervisor-deferred-finish-fp");
    std::fs::create_dir_all(&failpoint).expect("failpoint dir");
    let reached = failpoint.join("admission.batch.commit.after.reached");
    let release = failpoint.join("admission.batch.commit.after.release");
    let supervisor = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "admission.batch.commit.after")
        .env("FORGED_FAILPOINT_MODE", "pause")
        .env("FORGED_FAILPOINT_DIR", &failpoint)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("supervisor tick spawns");
    wait_until("supervisor commits the deferred decision", || {
        reached.exists()
    });

    // This is the exact production race: the detached controller or an
    // explicit control operation advances desired state after the tick's
    // observation but before its guarded reconciliation finish.
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            target,
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("9999-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("foreground progress clears the tick claim");
    ledger.close().expect("close ledger");
    std::fs::write(&release, b"").expect("release supervisor failpoint");

    let output = supervisor
        .wait_with_output()
        .expect("supervisor tick exits");
    assert!(
        output.status.success(),
        "recoverable ownership handoff failed the tick: stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let response: Value = serde_json::from_slice(&output.stdout).expect("supervisor response JSON");
    let report = response["result"]["subjects"]
        .as_array()
        .and_then(|subjects| {
            subjects
                .iter()
                .find(|subject| subject["desiredWork"]["subject"]["id"] == json!(target))
        })
        .expect("target subject report");
    assert_eq!(report["action"], json!("superseded"), "{response}");

    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        holder,
        "--outcome",
        "cancelled",
        "--reason",
        "test cleanup",
    ]);
    assert_eq!(code, 0, "holder cleanup: {cleanup}");
}

#[test]
fn once_adopts_live_work_and_concurrent_ticks_restart_once() {
    if !require_serialized_runner() {
        return;
    }
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
    if !require_serialized_runner() {
        return;
    }
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
    wait_until("first provider identity", || {
        env.latest_attempt_dir(run, "implementation", 0)
            .is_some_and(|dir| {
                dir.join("provider.pid").exists() && dir.join("provider.lstart").exists()
            })
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
    if !require_serialized_runner() {
        return;
    }
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
    if !require_serialized_runner() {
        return;
    }
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
    if !require_serialized_runner() {
        return;
    }
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
    if !require_serialized_runner() {
        return;
    }
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

/// Seconds from `earlier` to `later`, both widened RFC3339 stamps.
fn seconds_between(earlier: &str, later: &str) -> f64 {
    let earlier: jiff::Timestamp = earlier.parse().expect("parse earlier stamp");
    let later: jiff::Timestamp = later.parse().expect("parse later stamp");
    (later.as_nanosecond() - earlier.as_nanosecond()) as f64 / 1e9
}

/// Give replacement admission room while a dead controller's attempt still
/// charges the default single repository-write slot — the same shape the
/// restart-singleton fixture uses.
fn raise_admission_limits(env: &TestEnv) {
    let config_path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(
        &std::fs::read_to_string(&config_path).expect("read admission config"),
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
        serde_json::to_vec_pretty(&config).expect("serialize admission config"),
    )
    .expect("write admission config");
}

fn terminal_marker(generation: Option<u32>, message: &str, recoverable: bool) -> Value {
    json!({
        "schemaVersion": 1,
        "generation": generation,
        "code": "INVALID_REQUEST",
        "message": message,
        "recoverable": recoverable,
    })
}

#[test]
fn nonrecoverable_terminal_halts_without_charging_the_budget() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-halt-nonrecoverable");
    raise_admission_limits(&env);
    start_run(&env, "run-halt");
    env.set_scenario("implement", "hang", 2);
    let (code, submitted) = env.forged(&["run", "submit", "--run", "run-halt"]);
    assert_eq!(code, 0, "submit: {submitted}");
    let first_pid = controller_pid(&submitted);
    wait_until("first controller provider start", || {
        implementation_starts(&env, "run-halt") == 1
    });
    killpg(Pid::from_raw(first_pid), Signal::SIGKILL).expect("kill controller group");
    wait_until("controller group death", || !process_group_alive(first_pid));

    let message = "unsupported reasoning effort \"max\": rejected by provider";
    let ledger = env.ledger();
    ledger
        .append_event(
            Some("run-halt"),
            "forged.controller.terminal",
            terminal_marker(Some(1), message, false),
        )
        .expect("terminal marker");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            "run-halt",
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make dead controller due");
    ledger.close().expect("close");

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "halt tick: {tick}");
    assert_eq!(tick["result"]["subjects"][0]["action"], json!("halted"));

    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-halt")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(
        desired.last_outcome,
        Some(DesiredReconcileOutcome::Exhausted)
    );
    assert!(desired.exhausted_at.is_some(), "halt is durable");
    assert_eq!(desired.restart_used, 0, "a halt charges no restart budget");
    assert!(
        desired.next_wake_at.is_none(),
        "a halted subject is not due"
    );
    let error = desired.last_error.as_deref().expect("halt evidence");
    assert!(error.contains("halted after one nonrecoverable"), "{error}");
    assert!(error.contains("unsupported reasoning effort"), "{error}");
    let events = ledger
        .list_events(Some("run-halt"), 0, 65_536)
        .expect("events");
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        1,
        "no replacement controller was spawned"
    );
    let attention: Vec<_> = events
        .iter()
        .filter(|event| event.kind == "forged.supervisor.attention")
        .collect();
    assert_eq!(attention.len(), 1, "exactly one attention event");
    assert!(
        attention[0]
            .payload_json
            .contains("restart-budget-exhausted"),
        "{}",
        attention[0].payload_json
    );
    assert!(
        attention[0]
            .payload_json
            .contains("unsupported reasoning effort"),
        "attention detail names the recorded failure: {}",
        attention[0].payload_json
    );
    ledger.close().expect("close");

    // A halted subject is not due: another tick neither respawns nor
    // duplicates attention.
    let (code, second) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "idle tick: {second}");
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("run-halt"), 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "forged.supervisor.attention")
            .count(),
        1
    );
    // The halt parks the subject with no wake, so its admission reservation
    // must be released NOW — held, it would pin the single repository-write
    // slot for unrelated work until a resubmit.
    let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
    assert!(
        snapshot.reservations.iter().all(|reservation| {
            reservation.subject_kind != forged_types::AdmissionSubjectKind::Run
                || reservation.subject_id != "run-halt"
        }),
        "a halted subject holds no admission reservation"
    );
    ledger.close().expect("close");

    // The typed recovery: a bare resubmit authorizes the next control
    // revision with a fresh budget.
    let (code, resubmitted) = env.forged(&["run", "submit", "--run", "run-halt"]);
    assert_eq!(code, 0, "resubmit after halt: {resubmitted}");
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-halt")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.desired_state, DesiredState::Running);
    assert!(desired.exhausted_at.is_none(), "resubmit clears the halt");
    assert_eq!(desired.restart_used, 0);
    assert_eq!(desired.control_revision, 2);
    ledger.close().expect("close");

    // Kill confirmation DEFERS while the resubmitted controller's start
    // time is not yet recorded, so the cleanup stop retries until the
    // identity is verifiable instead of racing it.
    wait_until("halt fixture stop lands", || {
        env.forged(&[
            "run",
            "stop",
            "--run",
            "run-halt",
            "--outcome",
            "cancelled",
            "--reason",
            "halt fixture cleanup",
        ])
        .0 == 0
    });
    let record: Value = serde_json::from_slice(
        &std::fs::read(env.anvil.join("runs/run-halt/controller/controller.json"))
            .expect("controller record"),
    )
    .expect("controller JSON");
    let pid = record["driver"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("resubmitted controller pid");
    wait_until("resubmitted controller group death", || {
        !process_group_alive(pid)
    });
}

#[test]
fn recoverable_terminal_restarts_with_evidence_and_backoff() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-restart-evidence");
    raise_admission_limits(&env);
    start_run(&env, "run-backoff");
    env.set_scenario("implement", "hang", 4);
    let (code, submitted) = env.forged(&["run", "submit", "--run", "run-backoff"]);
    assert_eq!(code, 0, "submit: {submitted}");
    let first_pid = controller_pid(&submitted);
    wait_until("first controller provider start", || {
        implementation_starts(&env, "run-backoff") == 1
    });
    killpg(Pid::from_raw(first_pid), Signal::SIGKILL).expect("kill first controller group");
    wait_until("first controller group death", || {
        !process_group_alive(first_pid)
    });

    let ledger = env.ledger();
    ledger
        .append_event(
            Some("run-backoff"),
            "forged.controller.terminal",
            terminal_marker(Some(1), "transient boot failure", true),
        )
        .expect("terminal marker");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            "run-backoff",
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make dead controller due");
    ledger.close().expect("close");

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "restart tick: {tick}");
    assert_eq!(tick["result"]["subjects"][0]["action"], json!("restarted"));
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-backoff")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.restart_used, 1);
    assert_eq!(desired.controller_generation, 2);
    assert_eq!(
        desired.last_error.as_deref(),
        Some("restarted after controller failure: transient boot failure"),
        "a recoverable death restarts WITH its evidence preserved"
    );
    let wake = desired.next_wake_at.as_deref().expect("restart wake");
    assert!(
        seconds_between(&desired.updated_at, wake) >= 4.0,
        "first restart observes at the flat cadence: {} -> {wake}",
        desired.updated_at
    );
    ledger.close().expect("close");

    // Kill the replacement WITHOUT a fresh terminal marker: the stale
    // generation-1 marker must not halt generation 2 — this death takes the
    // ordinary restart with a doubled backoff.
    let record: Value = serde_json::from_slice(
        &std::fs::read(
            env.anvil
                .join("runs/run-backoff/controller/controller.json"),
        )
        .expect("controller record"),
    )
    .expect("controller JSON");
    assert_eq!(record["generation"], json!(2));
    let second_pid = record["driver"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("second controller pid");
    killpg(Pid::from_raw(second_pid), Signal::SIGKILL).expect("kill second controller group");
    wait_until("second controller group death", || {
        !process_group_alive(second_pid)
    });
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            "run-backoff",
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make second death due");
    ledger.close().expect("close");

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "second restart tick: {tick}");
    assert_eq!(tick["result"]["subjects"][0]["action"], json!("restarted"));
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "run-backoff")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.restart_used, 2);
    assert_eq!(desired.controller_generation, 3);
    let wake = desired.next_wake_at.as_deref().expect("backoff wake");
    assert!(
        seconds_between(&desired.updated_at, wake) >= 9.0,
        "the second restart doubles the observation backoff: {} -> {wake}",
        desired.updated_at
    );
    ledger.close().expect("close");

    let record: Value = serde_json::from_slice(
        &std::fs::read(
            env.anvil
                .join("runs/run-backoff/controller/controller.json"),
        )
        .expect("controller record"),
    )
    .expect("controller JSON");
    let third_pid = record["driver"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("third controller pid");
    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        "run-backoff",
        "--outcome",
        "cancelled",
        "--reason",
        "backoff fixture cleanup",
    ]);
    assert_eq!(code, 0, "stop backoff fixture: {cleanup}");
    wait_until("third controller group death", || {
        !process_group_alive(third_pid)
    });
}

#[test]
fn a_terminal_drive_error_records_durable_evidence() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-terminal-marker");
    let (code, response) = env.forged(&["run", "drive", "--run", "missing-run"]);
    assert_ne!(code, 0, "driving a missing run fails: {response}");
    let message = response["error"]["message"]
        .as_str()
        .expect("error message")
        .to_owned();
    let ledger = env.ledger();
    let terminals: Vec<_> = ledger
        .list_events(Some("missing-run"), 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| event.kind == "forged.controller.terminal")
        .collect();
    assert_eq!(terminals.len(), 1, "one terminal marker per terminal exit");
    let payload: Value =
        serde_json::from_str(&terminals[0].payload_json).expect("terminal payload");
    assert_eq!(payload["subjectId"], json!("missing-run"));
    assert_eq!(
        payload["generation"],
        Value::Null,
        "a foreground drive records no generation and can never gate a halt"
    );
    assert_eq!(payload["message"], json!(message));
    ledger.close().expect("close");
}
