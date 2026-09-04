use std::collections::BTreeSet;
use std::path::Path;
use std::time::{Duration, Instant};

use forged_ledger::AttemptState;
#[cfg(feature = "failpoints")]
use nix::errno::Errno;
#[cfg(feature = "failpoints")]
use nix::sys::signal::{kill, killpg, Signal};
#[cfg(feature = "failpoints")]
use nix::unistd::Pid;
use serde_json::{json, Value};

use super::{fabricate_run, TestEnv};

pub(crate) const WAIT: Duration = Duration::from_secs(60);

pub(crate) fn wait_until(what: &str, mut predicate: impl FnMut() -> bool) {
    let started = Instant::now();
    while !predicate() {
        assert!(started.elapsed() < WAIT, "timed out waiting for {what}");
        std::thread::sleep(Duration::from_millis(25));
    }
}

pub(crate) fn set_config(env: &TestEnv, update: impl FnOnce(&mut Value)) {
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

pub(crate) fn set_admission(env: &TestEnv, total: u64, repository_write: u64, fanout: u64) {
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

pub(crate) fn start_run(env: &TestEnv, run: &str) {
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

pub(crate) fn fabricate_live_attempt(env: &TestEnv, run: &str) {
    fabricate_run(env, run);
    let sha = "a".repeat(64);
    let packet = forged_types::WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: format!("{run}/implement/1"),
        run_id: run.to_owned(),
        work_id: format!("bead-{run}"),
        stage: forged_types::Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: forged_types::SpecRef {
            path: "beads://fixture".to_owned(),
            sha256: sha.clone(),
            revision: None,
        },
        worktree: env.root.join("fabricated-worktree"),
        branch: format!("work/{run}"),
        base_ref: "main".to_owned(),
        contract: forged_types::StageContract {
            instructions: "hold one fabricated capacity seat".to_owned(),
            gate_commands: Vec::new(),
            deliverable: forged_types::Deliverable::CommitsInWorktree,
            budget_s: 60,
            seat_commands: Vec::new(),
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: forged_types::ProviderHints {
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            effort: None,
            sandbox: forged_types::Sandbox::ReadOnly,
        },
        field_notes: Vec::new(),
    };
    let ledger = env.ledger();
    let packet_id = ledger
        .open_packet(forged_ledger::NewPacket {
            run_id: run.to_owned(),
            stage: forged_types::Stage::Implement,
            seq: 1,
            spec_path: packet.spec.path.clone(),
            spec_sha256: sha.clone(),
            spec_revision: None,
            policy_revision: None,
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open fabricated packet");
    ledger
        .claim_packet(
            &packet_id,
            &format!("fixture:{packet_id}"),
            &forged_ledger::SpecFence::Sha256(sha),
        )
        .expect("claim fabricated packet");
    ledger.close().expect("close ledger");
}

pub(crate) fn start_epic(env: &TestEnv, epic: &str, children: &[(&str, &Path, bool)]) {
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

pub(crate) fn provider_starts(env: &TestEnv, stage: &str) -> Vec<String> {
    let needle = format!("/{stage}/0 start ");
    env.provider_log()
        .into_iter()
        .filter(|line| line.contains(&needle))
        .collect()
}

#[cfg(feature = "failpoints")]
pub(crate) fn controller_pid(response: &Value) -> i32 {
    response["result"]["controller"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid")
}

#[cfg(feature = "failpoints")]
pub(crate) fn process_group_alive(group: i32) -> bool {
    matches!(
        kill(Pid::from_raw(-group), None),
        Ok(()) | Err(Errno::EPERM)
    )
}

#[cfg(feature = "failpoints")]
pub(crate) fn kill_group(group: i32) {
    match killpg(Pid::from_raw(group), Signal::SIGKILL) {
        Ok(()) | Err(Errno::ESRCH) => {}
        Err(error) => panic!("kill process group {group}: {error}"),
    }
}

#[cfg(feature = "failpoints")]
pub(crate) fn provider_pid(env: &TestEnv, run: &str) -> i32 {
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

pub(crate) fn stop_run(env: &TestEnv, run: &str) {
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

pub(crate) fn no_live_reservations(env: &TestEnv) {
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

pub(crate) fn expire_latest_retry(env: &TestEnv, run: &str) {
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

pub(crate) fn attempts_for(env: &TestEnv, run: &str) -> Vec<forged_ledger::AttemptRow> {
    let ledger = env.ledger();
    let prefix = format!("{run}/");
    let attempts = (1..=128)
        .filter_map(|attempt_id| ledger.get_attempt(attempt_id).ok())
        .filter(|attempt| attempt.packet_id.starts_with(&prefix))
        .collect();
    ledger.close().expect("close ledger");
    attempts
}

pub(crate) fn assert_terminal_artifacts(env: &TestEnv, run: &str, expected: &[AttemptState]) {
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
pub(crate) fn artifact_outcome(env: &TestEnv, run: &str, attempt_id: i64) -> String {
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

#[cfg(feature = "failpoints")]
pub(crate) fn deferred_decisions(env: &TestEnv, packet: &str) -> i64 {
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
