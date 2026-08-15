//! ProcessHost integration tests: real `/bin/sh` processes against a
//! tempdir status base. No herdr server and no `claude` binary required.

use std::collections::HashMap;
use std::time::Duration;

use forged_host::{Confirmed, HostError, Liveness, ProcessHost, SessionHost};

fn no_env() -> HashMap<String, String> {
    HashMap::new()
}

/// Poll `alive` until it reports `Exited`, or panic after ~10 s.
async fn wait_for_exit(host: &ProcessHost, id: &forged_host::HostSessionId) -> i32 {
    for _ in 0..200 {
        match host.alive(id).await.expect("alive") {
            Liveness::Exited(code) => return code,
            Liveness::Running => tokio::time::sleep(Duration::from_millis(50)).await,
            Liveness::Vanished => panic!("session vanished instead of exiting"),
        }
    }
    panic!("session never exited within the poll budget");
}

#[tokio::test]
async fn prepared_process_exposes_exact_sentinel_and_starts_only_after_boundary() {
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let marker = cwd.path().join("started");
    let host = ProcessHost::new(base.path());

    let prepared = host
        .prepare(cwd.path(), "touch started", &no_env())
        .await
        .expect("prepare");
    let id = prepared.id().clone();
    assert_eq!(
        prepared.sentinel_path(),
        base.path().join(id.as_str()).join("status")
    );
    assert!(prepared.herdr_identity().is_none());
    assert!(!marker.exists(), "prepare must not start the command");
    assert!(!prepared.sentinel_path().exists());

    let started = host.start(prepared).await.expect("start");
    assert_eq!(started, id);
    assert_eq!(wait_for_exit(&host, &started).await, 0);
    assert!(marker.exists());
}

#[tokio::test]
async fn prepared_process_can_be_rolled_back_without_starting() {
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let marker = cwd.path().join("started");
    let host = ProcessHost::new(base.path());
    let prepared = host
        .prepare(cwd.path(), "touch started", &no_env())
        .await
        .expect("prepare");
    let session_dir = prepared
        .sentinel_path()
        .parent()
        .expect("session directory")
        .to_path_buf();

    host.rollback_prepared(prepared).await;

    assert!(!marker.exists());
    assert!(
        !session_dir.exists(),
        "process rollback removes its empty reservation"
    );
}

#[tokio::test]
async fn foreign_process_host_refuses_a_prepared_handle() {
    let base_a = tempfile::tempdir().expect("tempdir");
    let base_b = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let marker = cwd.path().join("started");
    let owner = ProcessHost::new(base_a.path());
    let stranger = ProcessHost::new(base_b.path());
    let prepared = owner
        .prepare(cwd.path(), "touch started", &no_env())
        .await
        .expect("prepare");

    let error = stranger
        .start(prepared)
        .await
        .expect_err("foreign prepared handle");
    assert!(matches!(error, HostError::SessionNotFound { .. }));
    assert!(
        !marker.exists(),
        "foreign refusal must not start the command"
    );
}

#[tokio::test]
async fn round_trip_spawn_running_kill_verified() {
    // Criterion 2: spawn a sleep-based line, observe Running, and get a
    // VERIFIED kill — not one assumed from signal delivery.
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let host = ProcessHost::new(base.path());
    let id = host
        .spawn(cwd.path(), "sleep 30", &no_env())
        .await
        .expect("spawn");
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Running);

    let confirmed = host.kill_confirmed(&id).await.expect("kill_confirmed");
    assert_eq!(confirmed, Confirmed::Killed);

    // The group died before the sentinel could run: no invented exit code.
    assert_eq!(host.alive(&id).await.expect("alive"), Liveness::Vanished);

    // A second kill sees verified death on entry.
    let again = host.kill_confirmed(&id).await.expect("kill_confirmed");
    assert_eq!(again, Confirmed::AlreadyDead);
}

#[tokio::test]
async fn natural_exit_reports_code_zero_from_the_sentinel() {
    // Criterion 3: a short line exits on its own; the status file exists
    // and alive reports Exited with the correct code.
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let host = ProcessHost::new(base.path());
    let id = host
        .spawn(cwd.path(), "true", &no_env())
        .await
        .expect("spawn");
    assert_eq!(wait_for_exit(&host, &id).await, 0);

    // The sentinel file itself must exist under <base>/<session-id>/status.
    let status_path = base.path().join(id.as_str()).join("status");
    assert!(status_path.exists(), "sentinel status file must exist");
}

#[tokio::test]
async fn natural_exit_reports_a_non_zero_code() {
    // `(exit 3)` fails without terminating the shell, so the sentinel
    // still runs (a bare `exit 3` would bypass it).
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let host = ProcessHost::new(base.path());
    let id = host
        .spawn(cwd.path(), "(exit 3)", &no_env())
        .await
        .expect("spawn");
    assert_eq!(wait_for_exit(&host, &id).await, 3);
}

#[tokio::test]
async fn spawn_refuses_sentinel_breaking_lines() {
    // Criterion 7: newline, empty/whitespace-only, and trailing `;`/`&`/`|`.
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let host = ProcessHost::new(base.path());
    for bad in [
        "echo a\necho b",
        "echo a\r",
        "",
        "   \t ",
        "sleep 5;",
        "sleep 5 &",
        "cat f |",
        "sleep 5; ",
    ] {
        let err = host
            .spawn(cwd.path(), bad, &no_env())
            .await
            .expect_err("must refuse");
        assert!(
            matches!(err, HostError::SpawnFailed { .. }),
            "expected SpawnFailed for {bad:?}, got {err:?}"
        );
    }
}

#[tokio::test]
async fn spawn_refuses_an_unsafe_status_path() {
    // Criterion 7: a status path outside [A-Za-z0-9/._-] is refused.
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let host = ProcessHost::new(base.path().join("bad dir!"));
    let err = host
        .spawn(cwd.path(), "true", &no_env())
        .await
        .expect_err("must refuse");
    assert!(matches!(err, HostError::SpawnFailed { .. }));
    assert!(
        !base.path().join("bad dir!").exists(),
        "refusal must not create the unsafe directory"
    );
}

#[tokio::test]
async fn env_overlays_the_inherited_environment() {
    let base = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let host = ProcessHost::new(base.path());
    let mut env = HashMap::new();
    env.insert("FORGED_HOST_TEST_MARK".to_string(), "mark-77".to_string());
    // The env value never rides in the line; the line only references the
    // variable by name.
    let id = host
        .spawn(
            cwd.path(),
            "test \"$FORGED_HOST_TEST_MARK\" = mark-77",
            &env,
        )
        .await
        .expect("spawn");
    assert_eq!(wait_for_exit(&host, &id).await, 0);
}

#[tokio::test]
async fn ids_are_valid_only_within_the_issuing_instance() {
    let base_a = tempfile::tempdir().expect("tempdir");
    let base_b = tempfile::tempdir().expect("tempdir");
    let cwd = tempfile::tempdir().expect("tempdir");
    let host_a = ProcessHost::new(base_a.path());
    let host_b = ProcessHost::new(base_b.path());
    let id = host_a
        .spawn(cwd.path(), "true", &no_env())
        .await
        .expect("spawn");

    let err = host_b.alive(&id).await.expect_err("foreign id");
    assert!(matches!(err, HostError::SessionNotFound { .. }));
    let err = host_b.kill_confirmed(&id).await.expect_err("foreign id");
    assert!(matches!(err, HostError::SessionNotFound { .. }));
    assert_eq!(host_b.attach_hint(&id), None);

    // ProcessHost never has an attach hint, even for its own sessions.
    assert_eq!(host_a.attach_hint(&id), None);
    let _ = host_a.kill_confirmed(&id).await;
}
