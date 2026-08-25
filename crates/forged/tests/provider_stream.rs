//! Offline executable-level proofs for the exact private provider runner.

use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use forged_provider::{
    load_provider_stream_status, ClaudeDriver, CodexDriver, PacketDirs, PiDriver, ProviderDriver,
    ProviderStreamRenderModeV1, ProviderStreamRequestV1, PROVIDER_STREAM_ARG,
};
use forged_types::{
    Deliverable, ProviderHints, Sandbox, SpecRef, Stage, StageContract, WorkPacket,
};

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_forged")
}

fn packet(provider: &str, worktree: &Path) -> WorkPacket {
    WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: "run-private/implement/1".to_owned(),
        run_id: "run-private".to_owned(),
        bead_id: "beads-private".to_owned(),
        stage: Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: SpecRef {
            path: worktree.join("spec.md").to_string_lossy().into_owned(),
            sha256: "0".repeat(64),
            revision: None,
        },
        worktree: worktree.to_path_buf(),
        branch: "work/private".to_owned(),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: String::new(),
            gate_commands: Vec::new(),
            deliverable: Deliverable::CommitsInWorktree,
            budget_s: 30,
        },
        result_schema: "forged.result.implement/1".to_owned(),
        provider_hints: ProviderHints {
            provider: provider.to_owned(),
            model: "model-1".to_owned(),
            effort: matches!(provider, "codex" | "pi").then(|| "high".to_owned()),
            sandbox: Sandbox::WorkspaceWrite,
        },
        field_notes: Vec::new(),
    }
}

fn make_request(
    root: &Path,
    worktree: &Path,
    provider: &str,
    attempt_id: i64,
    render_mode: ProviderStreamRenderModeV1,
) -> (PacketDirs, ProviderStreamRequestV1) {
    let dirs = PacketDirs::new(root.join("packets/implement/1"), attempt_id);
    std::fs::create_dir_all(dirs.path()).expect("attempt dir");
    std::fs::write(dirs.prompt(), "private prompt").expect("prompt");
    let packet = packet(provider, worktree);
    let driver: &dyn ProviderDriver = match provider {
        "claude" => &ClaudeDriver,
        "codex" => &CodexDriver,
        "pi" => &PiDriver,
        other => panic!("unsupported provider fixture {other}"),
    };
    let invocation = driver
        .invocation(&packet, &dirs, "claim-private")
        .expect("invocation");
    let request = ProviderStreamRequestV1::for_attempt(
        &packet,
        &invocation,
        &dirs,
        root,
        attempt_id,
        render_mode,
    )
    .expect("request");
    std::fs::write(
        dirs.provider_stream_request(),
        request.to_bytes().expect("request bytes"),
    )
    .expect("request file");
    (dirs, request)
}

fn write_shim(path: &Path, body: &str) {
    std::fs::write(path, body).expect("shim");
    std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o755)).expect("shim mode");
}

fn shim_path(bin_dir: &Path) -> std::ffi::OsString {
    let mut paths = vec![bin_dir.to_path_buf()];
    paths.extend(std::env::split_paths(
        &std::env::var_os("PATH").unwrap_or_default(),
    ));
    std::env::join_paths(paths).expect("joined PATH")
}

#[test]
fn hidden_runner_bypasses_startup_strips_controller_env_and_preserves_raw_bytes() {
    let root = tempfile::tempdir().expect("root");
    let worktree = root.path().join("worktree");
    let bin_dir = root.path().join("bin");
    std::fs::create_dir_all(&worktree).expect("worktree");
    std::fs::create_dir_all(&bin_dir).expect("bin");
    let (dirs, request) = make_request(
        root.path(),
        &worktree,
        "claude",
        7,
        ProviderStreamRenderModeV1::Disabled,
    );
    let marker = root.path().join("marker");
    let cwd_marker = root.path().join("cwd");
    write_shim(
        &bin_dir.join("claude"),
        r#"#!/bin/sh
if [ -n "${FORGED_CONTROLLER_PID_PATH+x}" ] || \
   [ -n "${FORGED_CONTROLLER_LSTART_PATH+x}" ] || \
   [ -n "${FORGED_CONTROLLER_SCOPE+x}" ] || \
   [ -n "${FORGED_CONTROLLER_ID+x}" ] || \
   [ -n "${FORGED_CONTROLLER_GENERATION+x}" ]; then
  printf 'leaked' > "$FORGED_TEST_MARKER"
  exit 91
fi
printf '%s' "$FORGED_PROVIDER_OWNED" > "$FORGED_TEST_MARKER"
pwd > "$FORGED_TEST_CWD"
cat >/dev/null
printf '%s\n' '{"type":"system","subtype":"init"}' '{"type":"result","is_error":false}'
"#,
    );
    let malformed_config = root.path().join("malformed.yaml");
    std::fs::write(&malformed_config, "not: [valid").expect("malformed config");
    let output = Command::new(binary())
        .arg(PROVIDER_STREAM_ARG)
        .arg(dirs.provider_stream_request())
        .current_dir(&worktree)
        .env("PATH", shim_path(&bin_dir))
        .env("FORGED_CONFIG", &malformed_config)
        .env("FORGED_CONTROLLER_PID_PATH", "/must/not/reach/provider")
        .env("FORGED_CONTROLLER_LSTART_PATH", "/must/not/reach/provider")
        .env("FORGED_CONTROLLER_SCOPE", "must-not-reach-provider")
        .env("FORGED_CONTROLLER_ID", "must-not-reach-provider")
        .env("FORGED_CONTROLLER_GENERATION", "999")
        .env("FORGED_PROVIDER_OWNED", "preserved")
        .env("FORGED_TEST_MARKER", &marker)
        .env("FORGED_TEST_CWD", &cwd_marker)
        .output()
        .expect("private runner");
    assert_eq!(output.status.code(), Some(0), "stderr={:?}", output.stderr);
    assert!(output.stdout.is_empty(), "disabled rendering wrote stdout");
    assert_eq!(
        std::fs::read_to_string(&marker).expect("marker"),
        "preserved"
    );
    assert_eq!(
        std::fs::canonicalize(PathBuf::from(
            std::fs::read_to_string(&cwd_marker).expect("cwd").trim()
        ))
        .expect("canonical shim cwd"),
        std::fs::canonicalize(&worktree).expect("canonical worktree")
    );
    assert_eq!(
        std::fs::read(dirs.stdout_working()).expect("raw"),
        b"{\"type\":\"system\",\"subtype\":\"init\"}\n{\"type\":\"result\",\"is_error\":false}\n"
    );
    let status = load_provider_stream_status(&request, 0).expect("closed status");
    assert_eq!(status.transport_failure(), None);
}

#[test]
fn codex_runner_keeps_final_message_outside_the_raw_stream() {
    let root = tempfile::tempdir().expect("root");
    let worktree = root.path().join("worktree");
    let bin_dir = root.path().join("bin");
    std::fs::create_dir_all(&worktree).expect("worktree");
    std::fs::create_dir_all(&bin_dir).expect("bin");
    let (dirs, request) = make_request(
        root.path(),
        &worktree,
        "codex",
        8,
        ProviderStreamRenderModeV1::Disabled,
    );
    write_shim(
        &bin_dir.join("codex"),
        r#"#!/bin/sh
last=''
previous=''
for argument in "$@"; do
  if [ "$previous" = '-o' ]; then last=$argument; fi
  previous=$argument
done
cat >/dev/null
printf 'final-message-only' > "$last"
printf '%s\n' '{"type":"thread.started","thread_id":"thread-private"}' '{"type":"turn.completed","usage":{"input_tokens":1,"cached_input_tokens":0,"output_tokens":1}}'
"#,
    );
    let output = Command::new(binary())
        .arg(PROVIDER_STREAM_ARG)
        .arg(dirs.provider_stream_request())
        .current_dir(&worktree)
        .env("PATH", shim_path(&bin_dir))
        .output()
        .expect("private codex runner");
    assert_eq!(output.status.code(), Some(0), "stderr={:?}", output.stderr);
    assert!(output.stdout.is_empty());
    assert_eq!(
        std::fs::read_to_string(dirs.last_message_working()).expect("last"),
        "final-message-only"
    );
    let raw = std::fs::read_to_string(dirs.stdout_working()).expect("raw");
    assert!(raw.contains("thread.started"));
    assert!(!raw.contains("final-message-only"));
    assert_eq!(
        load_provider_stream_status(&request, 0)
            .expect("status")
            .transport_failure(),
        None
    );
}

#[test]
fn pi_runner_keeps_project_cognition_and_emits_canonical_json() {
    let root = tempfile::tempdir().expect("root");
    let worktree = root.path().join("worktree");
    let bin_dir = root.path().join("bin");
    std::fs::create_dir_all(&worktree).expect("worktree");
    std::fs::create_dir_all(&bin_dir).expect("bin");
    let (dirs, request) = make_request(
        root.path(),
        &worktree,
        "pi",
        13,
        ProviderStreamRenderModeV1::Disabled,
    );
    let arguments = root.path().join("pi-arguments");
    write_shim(
        &bin_dir.join("pi"),
        r#"#!/bin/sh
printf '%s\n' "$@" > "$FORGED_TEST_ARGUMENTS"
[ "$FORGED_PI_WORKER" = 1 ] || exit 92
cat >/dev/null
printf '%s\n' '{"type":"message_end","message":{"role":"assistant","content":[{"type":"text","text":"done"}],"usage":{"input":1,"output":1,"cacheRead":0,"cacheWrite":0},"stopReason":"stop"}}' '{"type":"agent_settled"}'
"#,
    );
    let output = Command::new(binary())
        .arg(PROVIDER_STREAM_ARG)
        .arg(dirs.provider_stream_request())
        .current_dir(&worktree)
        .env("PATH", shim_path(&bin_dir))
        .env("FORGED_TEST_ARGUMENTS", &arguments)
        .output()
        .expect("private Pi runner");
    assert_eq!(output.status.code(), Some(0), "stderr={:?}", output.stderr);
    let args = std::fs::read_to_string(arguments).expect("Pi arguments");
    for required in [
        "--mode",
        "json",
        "--no-session",
        "--no-extensions",
        "--approve",
        "--thinking",
        "high",
    ] {
        assert!(
            args.lines().any(|line| line == required),
            "missing {required}: {args}"
        );
    }
    assert!(!args.lines().any(|line| line == "--no-skills"));
    assert!(!args.lines().any(|line| line == "--no-context-files"));
    let raw = std::fs::read_to_string(dirs.stdout_working()).expect("raw");
    assert!(raw.contains("message_end"));
    assert!(raw.contains("agent_settled"));
    assert_eq!(
        load_provider_stream_status(&request, 0)
            .expect("status")
            .transport_failure(),
        None
    );
}

#[test]
fn enabled_renderer_is_bounded_lossy_and_never_echoes_provider_payloads() {
    let root = tempfile::tempdir().expect("root");
    let worktree = root.path().join("worktree");
    let bin_dir = root.path().join("bin");
    std::fs::create_dir_all(&worktree).expect("worktree");
    std::fs::create_dir_all(&bin_dir).expect("bin");
    let (dirs, request) = make_request(
        root.path(),
        &worktree,
        "claude",
        9,
        ProviderStreamRenderModeV1::OwnedHerdrPane,
    );
    write_shim(
        &bin_dir.join("claude"),
        r#"#!/bin/sh
cat >/dev/null
printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"SECRET-/Users/alice-\u001b]52;payload","input":{"command":"rm -rf SECRET"}}]}}'
i=0
while [ "$i" -lt 300 ]; do
  printf '%s\n' '{"type":"system","subtype":"init","transcript":"SECRET reasoning"}'
  i=$((i + 1))
done
printf '%s\n' '{"type":"result","is_error":true,"result":"rate limit SECRET /Users/alice \u001b[31m"}'
printf '\377not-json\n'
"#,
    );
    let output = Command::new(binary())
        .arg(PROVIDER_STREAM_ARG)
        .arg(dirs.provider_stream_request())
        .current_dir(&worktree)
        .env("PATH", shim_path(&bin_dir))
        .output()
        .expect("rendered private runner");
    assert_eq!(output.status.code(), Some(0), "stderr={:?}", output.stderr);
    let display = String::from_utf8(output.stdout).expect("fixed display is utf8");
    assert!(display.contains("[forged] implementation attempt 9 started"));
    assert!(
        display.len() <= 16 * 1024,
        "display exceeded its bounded budget"
    );
    for forbidden in [
        "SECRET",
        "/Users/alice",
        "rm -rf",
        "reasoning",
        "{\"type\"",
        "\u{1b}",
    ] {
        assert!(!display.contains(forbidden), "display leaked {forbidden:?}");
    }
    let raw = std::fs::read(dirs.stdout_working()).expect("raw");
    assert!(raw
        .windows(b"SECRET".len())
        .any(|window| window == b"SECRET"));
    assert!(raw.contains(&0xff), "invalid UTF-8 byte was not preserved");
    let status = load_provider_stream_status(&request, 0).expect("closed status");
    let status = serde_json::to_value(status).expect("status value");
    assert_eq!(status["render"], "degraded");
    assert!(status["emittedEvents"].as_u64().unwrap_or(u64::MAX) <= 160);
    assert!(status["droppedEvents"].as_u64().unwrap_or(0) > 0);
}

#[test]
fn raw_capture_is_byte_identical_across_render_modes() {
    let root = tempfile::tempdir().expect("root");
    let worktree = root.path().join("worktree");
    let bin_dir = root.path().join("bin");
    std::fs::create_dir_all(&worktree).expect("worktree");
    std::fs::create_dir_all(&bin_dir).expect("bin");
    write_shim(
        &bin_dir.join("claude"),
        r#"#!/bin/sh
cat >/dev/null
printf '%s\n' '{"type":"system","subtype":"init"}' '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Read","input":{"file_path":"private"}}]}}' '{"type":"result","is_error":false}'
printf '\377tail\n'
"#,
    );

    let mut captures = Vec::new();
    for (attempt_id, mode) in [
        (10, ProviderStreamRenderModeV1::Disabled),
        (11, ProviderStreamRenderModeV1::OwnedHerdrPane),
    ] {
        let (dirs, request) = make_request(root.path(), &worktree, "claude", attempt_id, mode);
        let output = Command::new(binary())
            .arg(PROVIDER_STREAM_ARG)
            .arg(dirs.provider_stream_request())
            .current_dir(&worktree)
            .env("PATH", shim_path(&bin_dir))
            .output()
            .expect("private runner");
        assert_eq!(output.status.code(), Some(0), "stderr={:?}", output.stderr);
        assert_eq!(
            load_provider_stream_status(&request, 0)
                .expect("status")
                .transport_failure(),
            None
        );
        captures.push(std::fs::read(dirs.stdout_working()).expect("raw capture"));
    }

    assert_eq!(captures[0], captures[1]);
}

#[test]
fn provider_stderr_and_nonzero_exit_remain_provider_owned() {
    let root = tempfile::tempdir().expect("root");
    let worktree = root.path().join("worktree");
    let bin_dir = root.path().join("bin");
    std::fs::create_dir_all(&worktree).expect("worktree");
    std::fs::create_dir_all(&bin_dir).expect("bin");
    let (dirs, request) = make_request(
        root.path(),
        &worktree,
        "claude",
        12,
        ProviderStreamRenderModeV1::Disabled,
    );
    write_shim(
        &bin_dir.join("claude"),
        "#!/bin/sh\ncat >/dev/null\nprintf '%s\\n' '{\"type\":\"result\",\"is_error\":true}'\nprintf 'provider-stderr\\n' >&2\nexit 23\n",
    );

    let output = Command::new(binary())
        .arg(PROVIDER_STREAM_ARG)
        .arg(dirs.provider_stream_request())
        .current_dir(&worktree)
        .env("PATH", shim_path(&bin_dir))
        .output()
        .expect("private runner");
    assert_eq!(output.status.code(), Some(23));
    assert_eq!(output.stderr, b"provider-stderr\n");
    assert_eq!(
        std::fs::read(dirs.stdout_working()).expect("raw capture"),
        b"{\"type\":\"result\",\"is_error\":true}\n"
    );
    assert_eq!(
        load_provider_stream_status(&request, 23)
            .expect("status")
            .transport_failure(),
        None
    );
}

#[test]
fn private_runner_is_absent_from_help_and_rejects_extra_argv_without_an_envelope() {
    let help = Command::new(binary()).arg("--help").output().expect("help");
    let help = String::from_utf8(help.stdout).expect("utf8 help");
    assert!(!help.contains(PROVIDER_STREAM_ARG));

    let output = Command::new(binary())
        .args([PROVIDER_STREAM_ARG, "/tmp/request", "extra"])
        .output()
        .expect("invalid private argv");
    assert_eq!(output.status.code(), Some(125));
    assert!(output.stdout.is_empty());
    let stderr = String::from_utf8(output.stderr).expect("utf8 stderr");
    assert!(stderr.contains("private provider-stream argv is invalid"));
    assert!(!stderr.contains("schemaVersion"));
}
