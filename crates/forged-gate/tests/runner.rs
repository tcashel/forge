//! run_gates behavior: ordering, run-all-after-failure, process-group
//! timeout kills, artifact capture, previews, refusals, and the
//! GateError -> ErrorCode mapping. All tests run against throwaway temp
//! directories.

use std::path::{Path, PathBuf};
use std::time::Duration;

use forged_gate::{run_gates, GateError, GateRequest};
use forged_types::ErrorCode;
use nix::errno::Errno;
use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;

struct Dirs {
    _tmp: tempfile::TempDir,
    cwd: PathBuf,
    artifacts: PathBuf,
}

fn dirs() -> Dirs {
    let tmp = tempfile::tempdir().expect("tempdir");
    let root = tmp.path().canonicalize().expect("canonicalize");
    let cwd = root.join("cwd");
    std::fs::create_dir(&cwd).expect("mkdir cwd");
    Dirs {
        _tmp: tmp,
        cwd,
        artifacts: root.join("artifacts"),
    }
}

fn request(dirs: &Dirs, commands: &[&str]) -> GateRequest {
    GateRequest::new(
        commands.iter().map(|c| (*c).to_owned()).collect(),
        dirs.cwd.clone(),
        dirs.artifacts.clone(),
    )
}

/// Poll until the process group is gone (SIGKILL delivered and members
/// reaped); panics if it survives the grace window.
async fn assert_group_gone(pgid: i32) {
    for _ in 0..100 {
        if killpg(Pid::from_raw(pgid), None::<Signal>) == Err(Errno::ESRCH) {
            return;
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    panic!("process group {pgid} still alive");
}

fn read_pgid(path: &Path) -> i32 {
    std::fs::read_to_string(path)
        .expect("pid file written")
        .trim()
        .parse()
        .expect("pid parses")
}

#[test]
fn new_bakes_in_documented_defaults() {
    let req = GateRequest::new(
        vec!["true".to_owned()],
        PathBuf::from("/cwd"),
        PathBuf::from("/artifacts"),
    );
    assert_eq!(req.timeout_per_command, Duration::from_secs(900));
    assert_eq!(req.preview_bytes, 4000);
}

#[tokio::test]
async fn rows_come_back_in_order_and_failures_do_not_stop_the_sequence() {
    let dirs = dirs();
    let commands = ["printf one", "false", "echo after-failure"];
    let outcome = run_gates(&request(&dirs, &commands)).await.expect("runs");

    assert_eq!(outcome.rows.len(), 3);
    assert!(!outcome.passed);
    for (row, command) in outcome.rows.iter().zip(commands) {
        assert_eq!(row.command, command);
        assert_eq!(row.cwd, dirs.cwd.to_string_lossy());
        assert!(!row.timed_out);
    }
    assert_eq!(outcome.rows[0].exit_code, Some(0));
    assert_eq!(outcome.rows[1].exit_code, Some(1));
    assert_eq!(outcome.rows[2].exit_code, Some(0));

    // Every command has both artifact logs, 1-based, and artifact_path
    // points at the stdout log.
    for n in 1..=3 {
        let stdout_log = dirs.artifacts.join(format!("gate-{n}-stdout.log"));
        let stderr_log = dirs.artifacts.join(format!("gate-{n}-stderr.log"));
        assert!(stdout_log.exists(), "missing {}", stdout_log.display());
        assert!(stderr_log.exists(), "missing {}", stderr_log.display());
        assert_eq!(
            outcome.rows[n - 1].artifact_path,
            stdout_log.to_string_lossy()
        );
    }
    assert_eq!(outcome.rows[2].stdout_preview, "after-failure\n");
}

#[tokio::test]
async fn all_clean_zero_exits_pass_and_rows_serialize_camel_case() {
    let dirs = dirs();
    let outcome = run_gates(&request(&dirs, &["true", "echo ok"]))
        .await
        .expect("runs");
    assert!(outcome.passed);

    let value = serde_json::to_value(&outcome.rows).expect("serializes");
    let row = &value[1];
    assert_eq!(row["exitCode"], serde_json::json!(0));
    assert_eq!(row["timedOut"], serde_json::json!(false));
    assert_eq!(row["stdoutPreview"], serde_json::json!("ok\n"));
    assert_eq!(row["stderrPreview"], serde_json::json!(""));
    assert!(row["durationMs"].is_u64());
    assert!(row["artifactPath"]
        .as_str()
        .expect("string")
        .ends_with("gate-2-stdout.log"));
    assert!(row.get("exit_code").is_none(), "snake_case must not appear");
}

#[tokio::test]
async fn timeout_kills_the_whole_process_group_and_later_commands_still_run() {
    let dirs = dirs();
    let pid_file = dirs.cwd.join("pid");
    let command = format!("echo $$ > {}; sleep 300 & wait", pid_file.display());
    let mut req = request(&dirs, &[&command, "echo survivor"]);
    req.timeout_per_command = Duration::from_millis(500);

    let outcome = run_gates(&req).await.expect("runs");
    assert_eq!(outcome.rows.len(), 2);
    assert!(outcome.rows[0].timed_out);
    assert_eq!(outcome.rows[0].exit_code, None);
    assert!(!outcome.passed);

    // Later commands still run after a timeout.
    assert!(!outcome.rows[1].timed_out);
    assert_eq!(outcome.rows[1].exit_code, Some(0));
    assert_eq!(outcome.rows[1].stdout_preview, "survivor\n");

    // The spawned children died with the group.
    assert_group_gone(read_pgid(&pid_file)).await;
}

#[tokio::test]
async fn escaped_background_descendant_still_times_out_and_dies() {
    let dirs = dirs();
    let pid_file = dirs.cwd.join("pid");
    // The immediate shell exits at once; the background sleep inherits the
    // pipes and would hold the drains open forever without the group kill.
    let command = format!("echo $$ > {}; sleep 300 &", pid_file.display());
    let mut req = request(&dirs, &[&command, "echo next"]);
    req.timeout_per_command = Duration::from_millis(500);

    let outcome = run_gates(&req).await.expect("runs");
    assert!(outcome.rows[0].timed_out);
    assert_eq!(outcome.rows[0].exit_code, None);

    // Both artifact streams finished.
    assert!(dirs.artifacts.join("gate-1-stdout.log").exists());
    assert!(dirs.artifacts.join("gate-1-stderr.log").exists());

    // The next gate ran.
    assert_eq!(outcome.rows[1].exit_code, Some(0));
    assert_eq!(outcome.rows[1].stdout_preview, "next\n");

    assert_group_gone(read_pgid(&pid_file)).await;
}

#[tokio::test]
async fn full_output_lands_on_disk_and_preview_is_the_exact_byte_tail() {
    let dirs = dirs();
    // 1500 lines x 5 ASCII bytes = 7500 bytes > the 4000-byte preview.
    let outcome = run_gates(&request(
        &dirs,
        &[concat!(
            "awk 'BEGIN{for(i=1;i<=1500;i++)printf \"%04d\\n\", i}'; ",
            "echo err-line 1>&2"
        )],
    ))
    .await
    .expect("runs");

    let expected_full: String = (1..=1500).map(|i| format!("{i:04}\n")).collect();
    let on_disk =
        std::fs::read_to_string(dirs.artifacts.join("gate-1-stdout.log")).expect("stdout log");
    assert_eq!(on_disk, expected_full, "artifact holds everything");

    let row = &outcome.rows[0];
    assert_eq!(row.stdout_preview.len(), 4000);
    assert_eq!(
        row.stdout_preview,
        expected_full[expected_full.len() - 4000..],
        "preview is exactly the LAST preview_bytes bytes"
    );

    let err_on_disk =
        std::fs::read_to_string(dirs.artifacts.join("gate-1-stderr.log")).expect("stderr log");
    assert_eq!(err_on_disk, "err-line\n");
    assert_eq!(row.stderr_preview, "err-line\n");
}

#[tokio::test]
async fn signal_death_encodes_128_plus_signal_never_none() {
    let dirs = dirs();
    let outcome = run_gates(&request(&dirs, &["kill -TERM $$"]))
        .await
        .expect("runs");
    let row = &outcome.rows[0];
    assert!(!row.timed_out);
    assert_eq!(row.exit_code, Some(128 + 15), "SIGTERM death encodes 143");
    assert!(!outcome.passed);
}

#[tokio::test]
async fn missing_and_unexecutable_commands_are_ordinary_failing_rows() {
    let dirs = dirs();
    let outcome = run_gates(&request(&dirs, &["definitely-not-a-command-xyz"]))
        .await
        .expect("runs");
    assert_eq!(outcome.rows[0].exit_code, Some(127));
    assert!(!outcome.passed);
}

#[tokio::test]
async fn gate_children_see_immediate_eof_on_stdin() {
    let dirs = dirs();
    let mut req = request(&dirs, &["cat"]);
    req.timeout_per_command = Duration::from_secs(30);
    let outcome = run_gates(&req).await.expect("runs");
    assert_eq!(
        outcome.rows[0].exit_code,
        Some(0),
        "cat sees EOF, not a hang"
    );
    assert!(!outcome.rows[0].timed_out);
}

#[tokio::test]
async fn empty_commands_are_refused_never_a_vacuous_pass() {
    let dirs = dirs();
    let err = run_gates(&request(&dirs, &[])).await.expect_err("refuses");
    match &err {
        GateError::InvalidRequest { message } => {
            assert!(message.contains("commands"), "message: {message}");
        }
        other => panic!("expected InvalidRequest, got {other:?}"),
    }
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    assert!(
        !dirs.artifacts.exists(),
        "refusal happens before anything is created"
    );
}

#[tokio::test]
async fn pre_existing_non_empty_artifacts_dir_is_refused() {
    let dirs = dirs();
    std::fs::create_dir(&dirs.artifacts).unwrap();
    std::fs::write(dirs.artifacts.join("evidence.log"), "prior evidence\n").unwrap();

    let err = run_gates(&request(&dirs, &["true"]))
        .await
        .expect_err("refuses");
    match &err {
        GateError::InvalidRequest { message } => {
            assert!(message.contains("artifacts_dir"), "message: {message}");
        }
        other => panic!("expected InvalidRequest, got {other:?}"),
    }
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    // Prior evidence untouched, nothing new created.
    let entries: Vec<_> = std::fs::read_dir(&dirs.artifacts)
        .unwrap()
        .map(|e| e.unwrap().file_name())
        .collect();
    assert_eq!(entries, vec![std::ffi::OsString::from("evidence.log")]);
    assert_eq!(
        std::fs::read_to_string(dirs.artifacts.join("evidence.log")).unwrap(),
        "prior evidence\n"
    );
}

#[tokio::test]
async fn an_empty_pre_existing_artifacts_dir_is_accepted() {
    let dirs = dirs();
    std::fs::create_dir(&dirs.artifacts).unwrap();
    let outcome = run_gates(&request(&dirs, &["true"])).await.expect("runs");
    assert!(outcome.passed);
}

#[tokio::test]
async fn relative_or_dotdot_paths_are_refused_before_any_side_effect() {
    let dirs = dirs();

    let mut req = request(&dirs, &["true"]);
    req.cwd = PathBuf::from("relative/cwd");
    let err = run_gates(&req).await.expect_err("refuses relative cwd");
    match &err {
        GateError::InvalidRequest { message } => {
            assert!(message.contains("cwd"), "message: {message}");
        }
        other => panic!("expected InvalidRequest, got {other:?}"),
    }

    let mut req = request(&dirs, &["true"]);
    req.artifacts_dir = dirs.cwd.join("..").join("artifacts");
    let err = run_gates(&req).await.expect_err("refuses dotdot");
    match &err {
        GateError::InvalidRequest { message } => {
            assert!(message.contains("artifacts_dir"), "message: {message}");
        }
        other => panic!("expected InvalidRequest, got {other:?}"),
    }
    assert!(!dirs.artifacts.exists());
}

#[tokio::test]
async fn artifacts_dir_creation_failure_is_a_typed_error() {
    let dirs = dirs();
    let blocking_file = dirs.cwd.join("blocker");
    std::fs::write(&blocking_file, "not a dir").unwrap();

    let mut req = request(&dirs, &["true"]);
    req.artifacts_dir = blocking_file.join("artifacts");
    let err = run_gates(&req).await.expect_err("cannot create");
    assert!(matches!(err, GateError::ArtifactsDir { .. }), "got {err:?}");
    assert_eq!(err.code(), ErrorCode::Internal);
}

#[tokio::test]
async fn unspawnable_commands_are_a_typed_error() {
    let dirs = dirs();
    let mut req = request(&dirs, &["true"]);
    req.cwd = dirs.cwd.join("does-not-exist");
    let err = run_gates(&req).await.expect_err("cannot spawn");
    assert!(matches!(err, GateError::Spawn { .. }), "got {err:?}");
    assert_eq!(err.code(), ErrorCode::Internal);
}

#[test]
fn gate_error_codes_map_the_full_matrix() {
    let cases: Vec<(GateError, ErrorCode)> = vec![
        (
            GateError::InvalidRequest {
                message: "m".to_owned(),
            },
            ErrorCode::InvalidRequest,
        ),
        (
            GateError::ArtifactsDir {
                path: "p".to_owned(),
                source: std::io::Error::other("io"),
            },
            ErrorCode::Internal,
        ),
        (
            GateError::Spawn {
                command: "c".to_owned(),
                source: std::io::Error::other("io"),
            },
            ErrorCode::Internal,
        ),
        (
            GateError::Io(std::io::Error::other("io")),
            ErrorCode::Internal,
        ),
    ];
    for (err, expected) in cases {
        assert_eq!(err.code(), expected, "for {err:?}");
    }
}
