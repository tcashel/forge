//! Deadline-specific recovery at the submit/supervisor boundaries.
//!
//! These fixtures stay hermetic: provider, bd, git, and controller effects
//! all live below one scratch TestEnv.

mod support;

#[cfg(feature = "failpoints")]
mod failpoint_tests {
    use std::process::Stdio;
    use std::time::{Duration, Instant};

    use forged_ledger::{AttemptState, EffectClass, RunState};
    use forged_types::OperationRequest;
    use nix::errno::Errno;
    use nix::sys::signal::{kill, killpg, Signal};
    use nix::unistd::Pid;
    use serde_json::{json, Value};

    use super::support::TestEnv;

    const WAIT: Duration = Duration::from_secs(15);

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

    fn kill_group(group: i32) {
        match killpg(Pid::from_raw(group), Signal::SIGKILL) {
            Ok(()) | Err(Errno::ESRCH) => {}
            Err(error) => panic!("kill process group {group}: {error}"),
        }
    }

    fn set_one_second_implementation_budget(env: &TestEnv) {
        let path = env.anvil.join("config.json");
        let mut config: Value =
            serde_json::from_slice(&std::fs::read(&path).expect("read deadline test config"))
                .expect("config JSON");
        config["stage_budget_s"]["implement"] = json!(1);
        std::fs::write(
            path,
            serde_json::to_vec_pretty(&config).expect("serialize deadline config"),
        )
        .expect("write deadline config");
    }

    fn start_run(env: &TestEnv, run: &str) {
        assert_eq!(env.forged(&["init"]).0, 0);
        let repo = env.repos.repo.to_string_lossy().into_owned();
        let spec = env.spec.to_string_lossy().into_owned();
        let (code, started) = env.forged(&[
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
        assert_eq!(code, 0, "run start {run}: {started}");
    }

    fn controller_pid(response: &Value) -> i32 {
        response["result"]["controller"]["pid"]
            .as_i64()
            .and_then(|pid| i32::try_from(pid).ok())
            .expect("controller pid")
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
    fn submit_recovery_settles_an_expired_attempt_under_its_held_guard() {
        let env = TestEnv::new("deadline-held-submit-guard");
        set_one_second_implementation_budget(&env);
        start_run(&env, "deadline-held-submit-guard");
        env.set_scenario("implement", "hang", 1);

        let (code, submitted) =
            env.forged(&["run", "submit", "--run", "deadline-held-submit-guard"]);
        assert_eq!(code, 0, "initial submit: {submitted}");
        let controller = controller_pid(&submitted);
        wait_until("provider start", || !env.provider_log().is_empty());

        // Ensure abandoned recovery has protocol work to reconcile while it
        // owns the run submit singleton. That pass observes the now-expired
        // attempt and must settle without reacquiring its own guard.
        let ledger = env.ledger();
        let request = OperationRequest {
            schema_version: 1,
            idempotency_key: "deadline-held-submit-guard/inflight".to_owned(),
            run_id: Some("deadline-held-submit-guard".to_owned()),
            params: serde_json::Map::new(),
        };
        ledger
            .begin_operation(
                "deadline-recovery-probe",
                &request,
                EffectClass::SafeRetry,
                None,
            )
            .expect("begin recoverable operation");
        ledger.close().expect("close ledger");

        kill_group(controller);
        wait_until("controller death", || !process_group_alive(controller));
        std::thread::sleep(Duration::from_millis(1_100));

        let started = Instant::now();
        let (code, recovered) =
            env.forged(&["run", "submit", "--run", "deadline-held-submit-guard"]);
        assert_eq!(code, 0, "deadline recovery submit: {recovered}");
        assert!(
            started.elapsed() < Duration::from_secs(10),
            "held-guard recovery self-contended instead of converging: {:?}",
            started.elapsed()
        );

        let ledger = env.ledger();
        let run = ledger
            .get_run("deadline-held-submit-guard")
            .expect("terminal run");
        let attempts = ledger
            .list_attempts_in_state(Some("deadline-held-submit-guard"), AttemptState::Stopped)
            .expect("stopped attempts");
        ledger.close().expect("close ledger");
        assert_eq!(run.state, RunState::Stopped);
        assert_eq!(attempts.len(), 1);
        assert_no_capacity(&env);
    }

    #[test]
    fn supervisor_replays_aftermath_after_terminalization_crash() {
        let env = TestEnv::new("deadline-aftermath-replay");
        set_one_second_implementation_budget(&env);
        start_run(&env, "deadline-aftermath-replay");
        env.authorize_run("deadline-aftermath-replay");
        env.set_scenario("implement", "hang", 1);

        let status = env
            .forged_cmd(&["run", "drive", "--run", "deadline-aftermath-replay"])
            .env("FORGED_FAILPOINT", "run.settle.controller-revoked.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing deadline driver");
        assert!(!status.success(), "settlement failpoint must crash");

        let ledger = env.ledger();
        let run = ledger
            .get_run("deadline-aftermath-replay")
            .expect("terminal run");
        let revoking = ledger
            .list_attempts_in_state(Some("deadline-aftermath-replay"), AttemptState::Revoking)
            .expect("revoking attempts");
        let pending = ledger
            .list_pending_settlement_aftermaths()
            .expect("pending aftermath");
        let active = ledger.admission_snapshot(None).expect("admission snapshot");
        ledger.close().expect("close ledger");
        assert_eq!(run.state, RunState::Stopped);
        assert_eq!(revoking.len(), 1, "the crash precedes attempt aftermath");
        assert_eq!(pending.len(), 1, "terminalization durably promises replay");
        assert_eq!(active.reservations.len(), 1, "capacity is still fenced");

        let (code, supervised) = env.forged(&["supervise", "--once"]);
        assert_eq!(code, 0, "aftermath replay tick: {supervised}");
        assert_eq!(
            supervised["result"]["beadSettlement"]["aftermath"][0]["action"],
            json!("replayed"),
            "{supervised}"
        );

        let ledger = env.ledger();
        let stopped = ledger
            .list_attempts_in_state(Some("deadline-aftermath-replay"), AttemptState::Stopped)
            .expect("stopped attempts");
        let pending = ledger
            .list_pending_settlement_aftermaths()
            .expect("pending aftermath");
        ledger.close().expect("close ledger");
        assert_eq!(stopped.len(), 1);
        assert!(pending.is_empty(), "aftermath promise must retire");
        assert_no_capacity(&env);
    }
}
