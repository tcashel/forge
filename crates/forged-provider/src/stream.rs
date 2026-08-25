//! Exact hidden provider runner and bounded, allowlisted progress renderer.

use std::fs::{File, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::{Component, Path, PathBuf};
use std::process::{Command, ExitStatus, Stdio};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{mpsc, Arc};
use std::thread;
use std::time::{Duration, Instant};

use forged_types::{Sandbox, Stage, WorkPacket};
use nix::libc;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::codex::EFFORTS;
use crate::invocation::{validate_embedded_path, validate_model, Invocation, PacketDirs};
use crate::pi::PI_EFFORTS;
use crate::ProviderError;

/// Raw argv sentinel for the private provider-stream runner. It is deliberately
/// absent from Clap and MCP surfaces.
pub const PROVIDER_STREAM_ARG: &str = "__forged-provider-stream-v1";

const REQUEST_SCHEMA: &str = "forged.provider-stream-request/1";
const STATUS_SCHEMA: &str = "forged.provider-stream-status/1";
const REQUEST_FILE: &str = ".provider-stream-request.json";
const STATUS_FILE: &str = ".provider-stream-status.json";
const MAX_CONTROL_BYTES: u64 = 16 * 1024;
const MAX_CONTEXT_BYTES: usize = 240;
const MAX_READ_PER_TICK: u64 = 64 * 1024;
const MAX_LAG_BYTES: u64 = 1024 * 1024;
const READ_CHUNK_BYTES: usize = 8 * 1024;
const MAX_RECORD_BYTES: usize = 32 * 1024;
const EVENT_QUEUE_CAPACITY: usize = 64;
const MAX_DISPLAY_LINES: u64 = 160;
const MAX_DISPLAY_LINE_BYTES: usize = 384;
const DISPLAY_LINE_INTERVAL: Duration = Duration::from_millis(25);
const TAIL_INTERVAL: Duration = Duration::from_millis(40);
const RENDER_DRAIN_BUDGET: Duration = Duration::from_millis(250);
const RUNNER_TRANSPORT_EXIT: i32 = 125;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum ProviderKindV1 {
    Claude,
    Codex,
    Pi,
}

impl ProviderKindV1 {
    fn from_name(name: &str) -> Result<Self, ProviderError> {
        match name {
            "claude" => Ok(Self::Claude),
            "codex" => Ok(Self::Codex),
            "pi" => Ok(Self::Pi),
            _ => Err(ProviderError::Malformed {
                message: "provider-stream request has an unsupported provider".to_owned(),
            }),
        }
    }

    fn program(self) -> &'static str {
        match self {
            Self::Claude => "claude",
            Self::Codex => "codex",
            Self::Pi => "pi",
        }
    }
}

/// Whether the private runner may emit allowlisted progress to its terminal.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProviderStreamRenderModeV1 {
    /// No terminal progress is emitted. Used by ProcessHost and fallback.
    Disabled,
    /// A bounded renderer is enabled inside the exact owned Herdr pane.
    OwnedHerdrPane,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
enum CaptureOutcomeV1 {
    Complete,
    Failed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
enum RenderOutcomeV1 {
    Disabled,
    Complete,
    Degraded,
}

/// Closed failure classes produced by the private runner. No provider error
/// text or path is admitted to this vocabulary.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProviderStreamFailureClassV1 {
    /// Prompt input could not be opened safely.
    PromptOpen,
    /// Canonical raw capture could not be opened before spawn.
    RawOpen,
    /// The provider process could not be spawned.
    ProviderSpawn,
    /// Waiting for provider termination failed.
    ProviderWait,
    /// Canonical raw capture could not be durably synchronized.
    RawSync,
}

impl ProviderStreamFailureClassV1 {
    /// Stable diagnostic spelling.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::PromptOpen => "prompt-open",
            Self::RawOpen => "raw-open",
            Self::ProviderSpawn => "provider-spawn",
            Self::ProviderWait => "provider-wait",
            Self::RawSync => "raw-sync",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ProviderTerminationV1 {
    exit_code: Option<i32>,
    signal: Option<i32>,
}

/// Closed request passed to the hidden runner. It carries no prompt bytes,
/// credential, arbitrary environment, pane handle, or command string.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderStreamRequestV1 {
    schema: String,
    provider: ProviderKindV1,
    model: String,
    effort: Option<String>,
    sandbox: Sandbox,
    prompt_path: PathBuf,
    stdout_path: PathBuf,
    last_message_path: Option<PathBuf>,
    status_path: PathBuf,
    run_id: String,
    packet_id: String,
    attempt_id: i64,
    stage: Stage,
    artifact_dir: String,
    session_id: Option<String>,
    render_mode: ProviderStreamRenderModeV1,
}

impl ProviderStreamRequestV1 {
    /// Build one exact request from the already validated driver invocation.
    pub fn for_attempt(
        packet: &WorkPacket,
        invocation: &Invocation,
        dirs: &PacketDirs,
        run_root: &Path,
        attempt_id: i64,
        render_mode: ProviderStreamRenderModeV1,
    ) -> Result<Self, ProviderError> {
        if invocation.prompt_path != dirs.prompt()
            || invocation.stdout_path != dirs.stdout_working()
        {
            return Err(ProviderError::Malformed {
                message: "provider invocation paths do not match the exact attempt".to_owned(),
            });
        }
        let provider = ProviderKindV1::from_name(&packet.provider_hints.provider)?;
        let effort = match provider {
            ProviderKindV1::Claude => None,
            ProviderKindV1::Codex | ProviderKindV1::Pi => packet.provider_hints.effort.clone(),
        };
        let last_message_path = match provider {
            ProviderKindV1::Claude | ProviderKindV1::Pi => None,
            ProviderKindV1::Codex => Some(dirs.last_message_working()),
        };
        let artifact_dir = dirs
            .path()
            .strip_prefix(run_root)
            .map_err(|_| ProviderError::UnsafePath {
                path: dirs.path().display().to_string(),
                reason: "attempt directory is outside the run root".to_owned(),
            })?
            .to_string_lossy()
            .into_owned();
        let request = Self {
            schema: REQUEST_SCHEMA.to_owned(),
            provider,
            model: packet.provider_hints.model.clone(),
            effort,
            sandbox: packet.provider_hints.sandbox,
            prompt_path: dirs.prompt(),
            stdout_path: dirs.stdout_working(),
            last_message_path,
            status_path: dirs.provider_stream_status(),
            run_id: packet.run_id.clone(),
            packet_id: packet.packet_id.clone(),
            attempt_id,
            stage: packet.stage,
            artifact_dir,
            session_id: invocation.session_hint.clone(),
            render_mode,
        };
        request.validate_shape(&dirs.provider_stream_request(), false)?;
        Ok(request)
    }

    /// Serialize the closed request for immutable attempt-private storage.
    pub fn to_bytes(&self) -> Result<Vec<u8>, ProviderError> {
        let mut bytes =
            serde_json::to_vec_pretty(self).map_err(|error| ProviderError::Malformed {
                message: format!("cannot serialize provider-stream request: {error}"),
            })?;
        bytes.push(b'\n');
        if bytes.len() > MAX_CONTROL_BYTES as usize {
            return Err(ProviderError::Malformed {
                message: "provider-stream request exceeds its bounded size".to_owned(),
            });
        }
        Ok(bytes)
    }

    fn validate_shape(
        &self,
        request_path: &Path,
        require_files: bool,
    ) -> Result<(), ProviderError> {
        if self.schema != REQUEST_SCHEMA || self.attempt_id <= 0 {
            return Err(ProviderError::Malformed {
                message: "provider-stream request has invalid schema or attempt identity"
                    .to_owned(),
            });
        }
        validate_model(&self.model)?;
        validate_context(&self.run_id)?;
        validate_context(&self.packet_id)?;
        validate_artifact_dir(&self.artifact_dir, self.attempt_id)?;
        match self.provider {
            ProviderKindV1::Codex => {
                if let Some(effort) = self.effort.as_deref() {
                    if !EFFORTS.contains(&effort) {
                        return Err(ProviderError::UnsupportedEffort {
                            effort: effort.to_owned(),
                        });
                    }
                }
            }
            ProviderKindV1::Pi => {
                if self
                    .effort
                    .as_deref()
                    .is_some_and(|effort| !PI_EFFORTS.contains(&effort))
                {
                    return Err(ProviderError::Malformed {
                        message: "pi provider-stream request carries unsupported effort".to_owned(),
                    });
                }
            }
            ProviderKindV1::Claude if self.effort.is_some() => {
                return Err(ProviderError::Malformed {
                    message: "claude provider-stream request carries provider effort".to_owned(),
                });
            }
            ProviderKindV1::Claude => {}
        }

        let Some(attempt_dir) = request_path.parent() else {
            return Err(ProviderError::UnsafePath {
                path: request_path.display().to_string(),
                reason: "request has no attempt directory".to_owned(),
            });
        };
        if !request_path.is_absolute()
            || request_path.file_name().and_then(|name| name.to_str()) != Some(REQUEST_FILE)
            || attempt_dir.file_name().and_then(|name| name.to_str())
                != Some(self.attempt_id.to_string().as_str())
        {
            return Err(ProviderError::UnsafePath {
                path: request_path.display().to_string(),
                reason: "request path does not identify the exact attempt".to_owned(),
            });
        }
        for path in [
            request_path,
            &self.prompt_path,
            &self.stdout_path,
            &self.status_path,
        ] {
            validate_embedded_path(path)?;
        }
        if let Some(path) = self.last_message_path.as_deref() {
            validate_embedded_path(path)?;
        }
        if self.prompt_path != attempt_dir.join("prompt.md")
            || self.stdout_path != attempt_dir.join(".out.jsonl.incomplete")
            || self.status_path != attempt_dir.join(STATUS_FILE)
        {
            return Err(ProviderError::UnsafePath {
                path: attempt_dir.display().to_string(),
                reason: "request paths are outside their closed attempt slots".to_owned(),
            });
        }
        match self.provider {
            ProviderKindV1::Claude
                if self.last_message_path.is_some() || !valid_session_id(&self.session_id) =>
            {
                return Err(ProviderError::Malformed {
                    message: "claude provider-stream request has invalid provider fields"
                        .to_owned(),
                });
            }
            ProviderKindV1::Codex
                if self.last_message_path.as_deref()
                    != Some(attempt_dir.join(".last.txt.incomplete").as_path())
                    || self.session_id.is_some() =>
            {
                return Err(ProviderError::Malformed {
                    message: "codex provider-stream request has invalid provider fields".to_owned(),
                });
            }
            ProviderKindV1::Pi if self.last_message_path.is_some() || self.session_id.is_some() => {
                return Err(ProviderError::Malformed {
                    message: "pi provider-stream request has invalid provider fields".to_owned(),
                });
            }
            _ => {}
        }
        if require_files {
            require_regular(attempt_dir, "attempt directory", true)?;
            require_regular(request_path, "provider-stream request", false)?;
            require_regular(&self.prompt_path, "provider prompt", false)?;
            refuse_symlink_if_present(&self.stdout_path)?;
            refuse_symlink_if_present(&self.status_path)?;
            if let Some(path) = self.last_message_path.as_deref() {
                refuse_symlink_if_present(path)?;
            }
        }
        Ok(())
    }

    fn render_enabled(&self) -> bool {
        self.render_mode == ProviderStreamRenderModeV1::OwnedHerdrPane
    }
}

/// Closed terminal record written only after provider termination and raw-file
/// synchronization.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProviderStreamStatusV1 {
    schema: String,
    run_id: String,
    packet_id: String,
    attempt_id: i64,
    provider: ProviderKindV1,
    termination: Option<ProviderTerminationV1>,
    capture: CaptureOutcomeV1,
    render: RenderOutcomeV1,
    captured_bytes: u64,
    renderer_bytes_read: u64,
    emitted_events: u64,
    dropped_events: u64,
    failure: Option<ProviderStreamFailureClassV1>,
}

impl ProviderStreamStatusV1 {
    /// A fixed transport failure when canonical capture did not complete.
    pub fn transport_failure(&self) -> Option<ProviderStreamFailureClassV1> {
        (self.capture == CaptureOutcomeV1::Failed)
            .then_some(self.failure)
            .flatten()
    }
}

/// Closed controller-side reasons a runner status cannot be trusted.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProviderStreamStatusFailure {
    /// No status file was written.
    Missing,
    /// The status file exceeded its strict size cap.
    Oversized,
    /// The status was not closed-schema valid JSON.
    Malformed,
    /// The durable identity or raw-byte count did not match the request.
    IdentityMismatch,
    /// The shell sentinel exit did not match the status outcome.
    ExitMismatch,
}

impl ProviderStreamStatusFailure {
    /// Stable diagnostic spelling.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Missing => "status-missing",
            Self::Oversized => "status-oversized",
            Self::Malformed => "status-malformed",
            Self::IdentityMismatch => "status-identity-mismatch",
            Self::ExitMismatch => "status-exit-mismatch",
        }
    }
}

/// Read and verify the terminal runner record against its immutable request,
/// canonical raw file, and shell-sentinel exit code.
pub fn load_provider_stream_status(
    request: &ProviderStreamRequestV1,
    runner_exit: i32,
) -> Result<ProviderStreamStatusV1, ProviderStreamStatusFailure> {
    let metadata = std::fs::symlink_metadata(&request.status_path).map_err(|error| {
        if error.kind() == std::io::ErrorKind::NotFound {
            ProviderStreamStatusFailure::Missing
        } else {
            ProviderStreamStatusFailure::Malformed
        }
    })?;
    if !metadata.file_type().is_file() || metadata.len() > MAX_CONTROL_BYTES {
        return Err(if metadata.len() > MAX_CONTROL_BYTES {
            ProviderStreamStatusFailure::Oversized
        } else {
            ProviderStreamStatusFailure::Malformed
        });
    }
    let mut status_file = open_read_no_follow(&request.status_path)
        .map_err(|_| ProviderStreamStatusFailure::Malformed)?;
    let mut bytes = Vec::new();
    Read::by_ref(&mut status_file)
        .take(MAX_CONTROL_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| ProviderStreamStatusFailure::Malformed)?;
    let status: ProviderStreamStatusV1 =
        serde_json::from_slice(&bytes).map_err(|_| ProviderStreamStatusFailure::Malformed)?;
    let raw_len = std::fs::symlink_metadata(&request.stdout_path)
        .ok()
        .filter(|metadata| metadata.file_type().is_file())
        .map(|metadata| metadata.len());
    if status.schema != STATUS_SCHEMA
        || status.run_id != request.run_id
        || status.packet_id != request.packet_id
        || status.attempt_id != request.attempt_id
        || status.provider != request.provider
        || (status.capture == CaptureOutcomeV1::Complete && raw_len != Some(status.captured_bytes))
        || (status.capture == CaptureOutcomeV1::Failed
            && raw_len.is_some_and(|length| length != status.captured_bytes))
        || (request.render_enabled() && status.render == RenderOutcomeV1::Disabled)
        || (!request.render_enabled() && status.render != RenderOutcomeV1::Disabled)
        || (status.capture == CaptureOutcomeV1::Complete) != status.failure.is_none()
        || (status.capture == CaptureOutcomeV1::Complete && status.termination.is_none())
        || status.renderer_bytes_read > status.captured_bytes
        || status.emitted_events > MAX_DISPLAY_LINES
        || (status.render == RenderOutcomeV1::Complete && status.dropped_events != 0)
        || (status.render == RenderOutcomeV1::Disabled
            && (status.renderer_bytes_read != 0
                || status.emitted_events != 0
                || status.dropped_events != 0))
    {
        return Err(ProviderStreamStatusFailure::IdentityMismatch);
    }
    let expected_exit = if status.capture == CaptureOutcomeV1::Complete {
        status
            .termination
            .as_ref()
            .map(termination_runner_exit)
            .ok_or(ProviderStreamStatusFailure::IdentityMismatch)?
    } else {
        RUNNER_TRANSPORT_EXIT
    };
    if runner_exit != expected_exit {
        return Err(ProviderStreamStatusFailure::ExitMismatch);
    }
    Ok(status)
}

/// Build the only shell line that may enter the private runner. All three
/// paths pass the same strict host-safe path validation as legacy invocations.
pub fn provider_stream_shell_line(
    executable: &Path,
    dirs: &PacketDirs,
) -> Result<String, ProviderError> {
    if !executable.is_absolute() {
        return Err(ProviderError::UnsafePath {
            path: executable.display().to_string(),
            reason: "provider-stream executable is not absolute".to_owned(),
        });
    }
    let executable = validate_embedded_path(executable)?;
    let pid = validate_embedded_path(&dirs.provider_pid())?;
    let request = validate_embedded_path(&dirs.provider_stream_request())?;
    Ok(format!(
        "echo $$ > {pid}; {executable} {PROVIDER_STREAM_ARG} {request}"
    ))
}

/// Execute one validated private request and return the exit code the outer
/// host shell must record. No normal Forged startup or envelope is involved.
pub fn run_provider_stream(request_path: &Path) -> Result<i32, ProviderError> {
    let request = read_request(request_path)?;
    run_request(&request, None)
}

fn read_request(path: &Path) -> Result<ProviderStreamRequestV1, ProviderError> {
    let metadata = std::fs::symlink_metadata(path)?;
    if !metadata.file_type().is_file() || metadata.len() > MAX_CONTROL_BYTES {
        return Err(ProviderError::Malformed {
            message: "provider-stream request is not a bounded regular file".to_owned(),
        });
    }
    let mut file = open_read_no_follow(path)?;
    let mut bytes = Vec::new();
    Read::by_ref(&mut file)
        .take(MAX_CONTROL_BYTES + 1)
        .read_to_end(&mut bytes)?;
    if bytes.len() > MAX_CONTROL_BYTES as usize {
        return Err(ProviderError::Malformed {
            message: "provider-stream request exceeds its bounded size".to_owned(),
        });
    }
    let request: ProviderStreamRequestV1 =
        serde_json::from_slice(&bytes).map_err(|_| ProviderError::Malformed {
            message: "provider-stream request is not closed-schema JSON".to_owned(),
        })?;
    request.validate_shape(path, true)?;
    Ok(request)
}

fn run_request(
    request: &ProviderStreamRequestV1,
    program_override: Option<&Path>,
) -> Result<i32, ProviderError> {
    let prompt = match open_read_no_follow(&request.prompt_path) {
        Ok(file) => file,
        Err(_) => {
            return terminal_transport(
                request,
                ProviderStreamFailureClassV1::PromptOpen,
                None,
                None,
            )
        }
    };
    let raw = match open_raw_no_follow(&request.stdout_path) {
        Ok(file) => file,
        Err(_) => {
            return terminal_transport(request, ProviderStreamFailureClassV1::RawOpen, None, None)
        }
    };
    let raw_child = match raw.try_clone() {
        Ok(file) => file,
        Err(_) => {
            return terminal_transport(request, ProviderStreamFailureClassV1::RawOpen, None, None)
        }
    };

    let renderer = request
        .render_enabled()
        .then(|| RendererHandle::start(request))
        .transpose()
        .unwrap_or_else(|_| Some(RendererHandle::degraded()));

    let mut command = provider_command(request, program_override);
    command
        .stdin(Stdio::from(prompt))
        .stdout(Stdio::from(raw_child))
        .stderr(Stdio::inherit());
    for name in forged_types::CONTROLLER_ENV {
        command.env_remove(name);
    }
    let mut child = match command.spawn() {
        Ok(child) => child,
        Err(_) => {
            let render = finish_renderer(renderer, request, false);
            return terminal_transport(
                request,
                ProviderStreamFailureClassV1::ProviderSpawn,
                None,
                Some(render),
            );
        }
    };
    let exit = match child.wait() {
        Ok(exit) => exit,
        Err(_) => {
            let _ = child.kill();
            let _ = child.wait();
            let render = finish_renderer(renderer, request, false);
            return terminal_transport(
                request,
                ProviderStreamFailureClassV1::ProviderWait,
                None,
                Some(render),
            );
        }
    };
    let termination = termination(exit);
    if raw.sync_all().is_err() {
        let render = finish_renderer(renderer, request, termination.exit_code == Some(0));
        return terminal_transport(
            request,
            ProviderStreamFailureClassV1::RawSync,
            Some(termination),
            Some(render),
        );
    }
    let captured_bytes = raw.metadata().map(|metadata| metadata.len()).unwrap_or(0);
    let render = finish_renderer(renderer, request, termination.exit_code == Some(0));
    let runner_exit = termination_runner_exit(&termination);
    let status = ProviderStreamStatusV1 {
        schema: STATUS_SCHEMA.to_owned(),
        run_id: request.run_id.clone(),
        packet_id: request.packet_id.clone(),
        attempt_id: request.attempt_id,
        provider: request.provider,
        termination: Some(termination),
        capture: CaptureOutcomeV1::Complete,
        render: render.outcome,
        captured_bytes,
        renderer_bytes_read: render.bytes_read,
        emitted_events: render.emitted,
        dropped_events: render.dropped,
        failure: None,
    };
    write_status(request, &status)?;
    Ok(runner_exit)
}

fn terminal_transport(
    request: &ProviderStreamRequestV1,
    failure: ProviderStreamFailureClassV1,
    termination: Option<ProviderTerminationV1>,
    render_report: Option<RenderReport>,
) -> Result<i32, ProviderError> {
    let captured_bytes = std::fs::metadata(&request.stdout_path)
        .map(|metadata| metadata.len())
        .unwrap_or(0);
    let render = render_report.unwrap_or_else(|| {
        if request.render_enabled() {
            RenderReport {
                outcome: RenderOutcomeV1::Degraded,
                bytes_read: 0,
                emitted: 0,
                dropped: 0,
            }
        } else {
            RenderReport::disabled()
        }
    });
    let status = ProviderStreamStatusV1 {
        schema: STATUS_SCHEMA.to_owned(),
        run_id: request.run_id.clone(),
        packet_id: request.packet_id.clone(),
        attempt_id: request.attempt_id,
        provider: request.provider,
        termination,
        capture: CaptureOutcomeV1::Failed,
        render: render.outcome,
        captured_bytes,
        renderer_bytes_read: render.bytes_read,
        emitted_events: render.emitted,
        dropped_events: render.dropped,
        failure: Some(failure),
    };
    write_status(request, &status)?;
    Ok(RUNNER_TRANSPORT_EXIT)
}

fn provider_command(request: &ProviderStreamRequestV1, override_path: Option<&Path>) -> Command {
    let program = override_path
        .map(Path::as_os_str)
        .unwrap_or_else(|| request.provider.program().as_ref());
    let mut command = Command::new(program);
    match request.provider {
        ProviderKindV1::Claude => {
            command.args([
                "-p",
                "--output-format",
                "stream-json",
                "--verbose",
                "--dangerously-skip-permissions",
                "--session-id",
                request
                    .session_id
                    .as_deref()
                    .expect("validated claude request has a session id"),
                "--model",
                &request.model,
            ]);
        }
        ProviderKindV1::Codex => {
            let sandbox = match request.sandbox {
                Sandbox::ReadOnly => "read-only",
                Sandbox::WorkspaceWrite => "workspace-write",
            };
            command.args([
                "exec",
                "--json",
                "--skip-git-repo-check",
                "--sandbox",
                sandbox,
                "-m",
                &request.model,
            ]);
            if let Some(effort) = request.effort.as_deref() {
                command.args(["-c", &format!("model_reasoning_effort=\"{effort}\"")]);
            }
            command
                .arg("-o")
                .arg(
                    request
                        .last_message_path
                        .as_deref()
                        .expect("validated codex request has final-message path"),
                )
                .arg("-");
        }
        ProviderKindV1::Pi => {
            command.args([
                "--mode",
                "json",
                "-p",
                "--no-session",
                "--no-extensions",
                "--approve",
                "--model",
                &request.model,
                "--append-system-prompt",
                "You are a Forged packet worker. Follow the frozen packet and repository skills. Do not invoke Forge lead planning, dispatch, or lifecycle-control skills.",
            ]);
            if let Some(effort) = request.effort.as_deref() {
                command.args(["--thinking", effort]);
            }
            if request.sandbox == Sandbox::ReadOnly {
                command.args(["--tools", "read,grep,find,ls"]);
            }
            command.env("FORGED_PI_WORKER", "1");
        }
    }
    command
}

fn write_status(
    request: &ProviderStreamRequestV1,
    status: &ProviderStreamStatusV1,
) -> Result<(), ProviderError> {
    if std::fs::symlink_metadata(&request.status_path).is_ok() {
        return Err(ProviderError::Malformed {
            message: "provider-stream status slot is already occupied".to_owned(),
        });
    }
    let mut bytes =
        serde_json::to_vec_pretty(status).map_err(|error| ProviderError::Malformed {
            message: format!("cannot serialize provider-stream status: {error}"),
        })?;
    bytes.push(b'\n');
    let parent = request
        .status_path
        .parent()
        .ok_or_else(|| ProviderError::UnsafePath {
            path: request.status_path.display().to_string(),
            reason: "status has no attempt directory".to_owned(),
        })?;
    let temporary = parent.join(format!(
        ".provider-stream-status.tmp-{}",
        std::process::id()
    ));
    let mut options = OpenOptions::new();
    options.create_new(true).write(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options.open(&temporary)?;
    file.write_all(&bytes)?;
    file.sync_all()?;
    drop(file);
    let publish = std::fs::hard_link(&temporary, &request.status_path);
    let cleanup = std::fs::remove_file(&temporary);
    publish?;
    cleanup?;
    File::open(parent)?.sync_all()?;
    Ok(())
}

fn termination(status: ExitStatus) -> ProviderTerminationV1 {
    #[cfg(unix)]
    {
        use std::os::unix::process::ExitStatusExt;
        ProviderTerminationV1 {
            exit_code: status.code(),
            signal: status.signal(),
        }
    }
    #[cfg(not(unix))]
    {
        ProviderTerminationV1 {
            exit_code: status.code(),
            signal: None,
        }
    }
}

fn termination_runner_exit(termination: &ProviderTerminationV1) -> i32 {
    termination
        .exit_code
        .unwrap_or_else(|| 128 + termination.signal.unwrap_or(1).clamp(1, 127))
}

fn valid_session_id(value: &Option<String>) -> bool {
    value.as_deref().is_some_and(|value| {
        !value.is_empty()
            && value.len() <= 80
            && value
                .bytes()
                .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
    })
}

fn open_read_no_follow(path: &Path) -> std::io::Result<File> {
    let mut options = OpenOptions::new();
    options.read(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.custom_flags(libc::O_NOFOLLOW | libc::O_CLOEXEC);
    }
    options.open(path)
}

fn open_raw_no_follow(path: &Path) -> std::io::Result<File> {
    let mut options = OpenOptions::new();
    options.create(true).truncate(true).write(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options
            .mode(0o600)
            .custom_flags(libc::O_NOFOLLOW | libc::O_CLOEXEC);
    }
    options.open(path)
}

fn validate_context(value: &str) -> Result<(), ProviderError> {
    let valid = !value.is_empty()
        && value.len() <= MAX_CONTEXT_BYTES
        && value.bytes().all(|byte| {
            byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b':' | b'/')
        });
    if valid {
        Ok(())
    } else {
        Err(ProviderError::Malformed {
            message: "provider-stream context is not bounded safe ASCII".to_owned(),
        })
    }
}

fn validate_artifact_dir(value: &str, attempt_id: i64) -> Result<(), ProviderError> {
    validate_context(value)?;
    let path = Path::new(value);
    let components = path.components().collect::<Vec<_>>();
    let attempt = attempt_id.to_string();
    let valid = !path.is_absolute()
        && components
            .iter()
            .all(|component| matches!(component, Component::Normal(_)))
        && components.len() >= 3
        && components[components.len() - 2].as_os_str() == "attempts"
        && components[components.len() - 1].as_os_str() == attempt.as_str();
    if valid {
        Ok(())
    } else {
        Err(ProviderError::Malformed {
            message: "provider-stream artifact location is not the exact attempt".to_owned(),
        })
    }
}

fn require_regular(path: &Path, label: &str, directory: bool) -> Result<(), ProviderError> {
    let metadata = std::fs::symlink_metadata(path)?;
    let matches = if directory {
        metadata.file_type().is_dir()
    } else {
        metadata.file_type().is_file()
    };
    if matches {
        Ok(())
    } else {
        Err(ProviderError::Malformed {
            message: format!(
                "{label} is not a regular {}",
                if directory { "directory" } else { "file" }
            ),
        })
    }
}

fn refuse_symlink_if_present(path: &Path) -> Result<(), ProviderError> {
    match std::fs::symlink_metadata(path) {
        Ok(metadata) if metadata.file_type().is_symlink() || !metadata.file_type().is_file() => {
            Err(ProviderError::Malformed {
                message: "provider-stream output slot is not a regular file".to_owned(),
            })
        }
        Ok(_) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error.into()),
    }
}

#[derive(Debug, Clone, Copy)]
enum WarningClass {
    RateLimited,
    Disconnected,
    Timeout,
    Overloaded,
    ProviderFailed,
    Unknown,
}

impl WarningClass {
    fn text(self) -> &'static str {
        match self {
            Self::RateLimited => "rate limited",
            Self::Disconnected => "disconnected",
            Self::Timeout => "timed out",
            Self::Overloaded => "provider overloaded",
            Self::ProviderFailed => "provider failed",
            Self::Unknown => "provider warning",
        }
    }
}

#[derive(Debug)]
enum ProgressEvent {
    Started,
    Working,
    ToolStarted(&'static str),
    ToolCompleted(&'static str),
    Warning(WarningClass),
    Completed,
    DisplayDegraded,
    Artifact(String),
}

impl ProgressEvent {
    fn line(&self, request: &ProviderStreamRequestV1) -> String {
        match self {
            Self::Started => format!(
                "[forged] {} attempt {} started",
                stage_label(request.stage),
                request.attempt_id
            ),
            Self::Working => "[forged] provider working".to_owned(),
            Self::ToolStarted(category) => format!("[forged] {category} started"),
            Self::ToolCompleted(category) => format!("[forged] {category} completed"),
            Self::Warning(class) => format!("[forged] warning: {}", class.text()),
            Self::Completed => "[forged] provider completed".to_owned(),
            Self::DisplayDegraded => "[forged] progress display degraded".to_owned(),
            Self::Artifact(path) => format!("[forged] artifacts pending at {path}"),
        }
    }
}

fn stage_label(stage: Stage) -> &'static str {
    match stage {
        Stage::Implement => "implementation",
        Stage::ReviewClaude => "claude review",
        Stage::ReviewCodex => "codex review",
        Stage::Fix => "remediation",
    }
}

#[derive(Default)]
struct RenderCounters {
    bytes_read: AtomicU64,
    emitted: AtomicU64,
    dropped: AtomicU64,
    degraded: AtomicBool,
}

#[derive(Debug, Clone, Copy)]
struct RenderReport {
    outcome: RenderOutcomeV1,
    bytes_read: u64,
    emitted: u64,
    dropped: u64,
}

impl RenderReport {
    fn disabled() -> Self {
        Self {
            outcome: RenderOutcomeV1::Disabled,
            bytes_read: 0,
            emitted: 0,
            dropped: 0,
        }
    }
}

struct RendererHandle {
    stop: Arc<AtomicBool>,
    sender: Option<mpsc::SyncSender<ProgressEvent>>,
    tail_done: mpsc::Receiver<()>,
    writer_done: mpsc::Receiver<()>,
    counters: Arc<RenderCounters>,
}

impl RendererHandle {
    fn start(request: &ProviderStreamRequestV1) -> Result<Self, std::io::Error> {
        let (sender, receiver) = mpsc::sync_channel(EVENT_QUEUE_CAPACITY);
        let (tail_done_tx, tail_done) = mpsc::channel();
        let (writer_done_tx, writer_done) = mpsc::channel();
        let stop = Arc::new(AtomicBool::new(false));
        let counters = Arc::new(RenderCounters::default());

        let writer_request = request.clone();
        let writer_counters = Arc::clone(&counters);
        thread::Builder::new()
            .name("forged-progress-writer".to_owned())
            .spawn(move || {
                write_progress(receiver, &writer_request, &writer_counters);
                let _ = writer_done_tx.send(());
            })?;

        let tail_path = request.stdout_path.clone();
        let provider = request.provider;
        let tail_sender = sender.clone();
        let tail_stop = Arc::clone(&stop);
        let tail_counters = Arc::clone(&counters);
        thread::Builder::new()
            .name("forged-progress-tailer".to_owned())
            .spawn(move || {
                tail_progress(
                    &tail_path,
                    provider,
                    &tail_sender,
                    &tail_stop,
                    &tail_counters,
                );
                let _ = tail_done_tx.send(());
            })?;

        enqueue(&sender, ProgressEvent::Started, &counters);
        Ok(Self {
            stop,
            sender: Some(sender),
            tail_done,
            writer_done,
            counters,
        })
    }

    fn degraded() -> Self {
        let (_tail_tx, tail_done) = mpsc::channel();
        let (_writer_tx, writer_done) = mpsc::channel();
        let counters = Arc::new(RenderCounters::default());
        counters.degraded.store(true, Ordering::Relaxed);
        Self {
            stop: Arc::new(AtomicBool::new(true)),
            sender: None,
            tail_done,
            writer_done,
            counters,
        }
    }

    fn finish(mut self, request: &ProviderStreamRequestV1, success: bool) -> RenderReport {
        self.stop.store(true, Ordering::Release);
        let deadline = Instant::now() + RENDER_DRAIN_BUDGET;
        if self.tail_done.recv_timeout(RENDER_DRAIN_BUDGET).is_err() {
            self.counters.degraded.store(true, Ordering::Relaxed);
        }
        if let Some(sender) = self.sender.take() {
            enqueue(
                &sender,
                if success {
                    ProgressEvent::Completed
                } else {
                    ProgressEvent::Warning(WarningClass::ProviderFailed)
                },
                &self.counters,
            );
            enqueue(
                &sender,
                ProgressEvent::Artifact(request.artifact_dir.clone()),
                &self.counters,
            );
            drop(sender);
        }
        let remaining = deadline.saturating_duration_since(Instant::now());
        if self.writer_done.recv_timeout(remaining).is_err() {
            self.counters.degraded.store(true, Ordering::Relaxed);
        }
        let dropped = self.counters.dropped.load(Ordering::Relaxed);
        let degraded = self.counters.degraded.load(Ordering::Relaxed) || dropped > 0;
        RenderReport {
            outcome: if degraded {
                RenderOutcomeV1::Degraded
            } else {
                RenderOutcomeV1::Complete
            },
            bytes_read: self.counters.bytes_read.load(Ordering::Relaxed),
            emitted: self.counters.emitted.load(Ordering::Relaxed),
            dropped,
        }
    }
}

fn finish_renderer(
    renderer: Option<RendererHandle>,
    request: &ProviderStreamRequestV1,
    success: bool,
) -> RenderReport {
    renderer
        .map(|renderer| renderer.finish(request, success))
        .unwrap_or_else(RenderReport::disabled)
}

fn enqueue(
    sender: &mpsc::SyncSender<ProgressEvent>,
    event: ProgressEvent,
    counters: &RenderCounters,
) {
    match sender.try_send(event) {
        Ok(()) => {}
        Err(mpsc::TrySendError::Full(_)) | Err(mpsc::TrySendError::Disconnected(_)) => {
            counters.dropped.fetch_add(1, Ordering::Relaxed);
            counters.degraded.store(true, Ordering::Relaxed);
        }
    }
}

fn write_progress(
    receiver: mpsc::Receiver<ProgressEvent>,
    request: &ProviderStreamRequestV1,
    counters: &RenderCounters,
) {
    let stdout = std::io::stdout();
    let mut output = stdout.lock();
    let mut last_line: Option<Instant> = None;
    let mut written = 0u64;
    while let Ok(event) = receiver.recv() {
        if written >= MAX_DISPLAY_LINES {
            counters.dropped.fetch_add(1, Ordering::Relaxed);
            counters.degraded.store(true, Ordering::Relaxed);
            continue;
        }
        if let Some(last) = last_line {
            let remaining = DISPLAY_LINE_INTERVAL.saturating_sub(last.elapsed());
            if !remaining.is_zero() {
                thread::sleep(remaining);
            }
        }
        let line = event.line(request);
        if line.len() > MAX_DISPLAY_LINE_BYTES
            || output.write_all(line.as_bytes()).is_err()
            || output.write_all(b"\n").is_err()
            || output.flush().is_err()
        {
            counters.dropped.fetch_add(1, Ordering::Relaxed);
            counters.degraded.store(true, Ordering::Relaxed);
            return;
        }
        counters.emitted.fetch_add(1, Ordering::Relaxed);
        written += 1;
        last_line = Some(Instant::now());
    }
    if counters.dropped.load(Ordering::Relaxed) > 0 && written < MAX_DISPLAY_LINES {
        let marker = b"[forged] progress events dropped\n";
        if output.write_all(marker).is_ok() && output.flush().is_ok() {
            counters.emitted.fetch_add(1, Ordering::Relaxed);
        }
    }
}

fn tail_progress(
    path: &Path,
    provider: ProviderKindV1,
    sender: &mpsc::SyncSender<ProgressEvent>,
    stop: &AtomicBool,
    counters: &RenderCounters,
) {
    let mut file = match open_read_no_follow(path) {
        Ok(file) => file,
        Err(_) => {
            counters.degraded.store(true, Ordering::Relaxed);
            enqueue(sender, ProgressEvent::DisplayDegraded, counters);
            return;
        }
    };
    let mut offset = 0u64;
    let mut partial = Vec::new();
    let mut discard_until_newline = false;
    let mut warned = false;
    loop {
        let stopping = stop.load(Ordering::Acquire);
        let length = file
            .metadata()
            .map(|metadata| metadata.len())
            .unwrap_or(offset);
        if length < offset {
            offset = 0;
            partial.clear();
            discard_until_newline = false;
            mark_degraded(sender, counters, &mut warned);
        } else if length.saturating_sub(offset) > MAX_LAG_BYTES {
            offset = length - MAX_LAG_BYTES;
            if file.seek(SeekFrom::Start(offset)).is_err() {
                mark_degraded(sender, counters, &mut warned);
                return;
            }
            partial.clear();
            discard_until_newline = true;
            counters.dropped.fetch_add(1, Ordering::Relaxed);
            counters.degraded.store(true, Ordering::Relaxed);
        }
        let available = length.saturating_sub(offset);
        let final_read_truncated = stopping && available > MAX_READ_PER_TICK;
        let mut remaining = available.min(MAX_READ_PER_TICK);
        while remaining > 0 {
            let mut chunk = [0u8; READ_CHUNK_BYTES];
            let wanted = remaining.min(READ_CHUNK_BYTES as u64) as usize;
            let read = match file.read(&mut chunk[..wanted]) {
                Ok(0) => break,
                Ok(read) => read,
                Err(_) => {
                    mark_degraded(sender, counters, &mut warned);
                    return;
                }
            };
            offset = offset.saturating_add(read as u64);
            remaining = remaining.saturating_sub(read as u64);
            counters
                .bytes_read
                .fetch_add(read as u64, Ordering::Relaxed);
            consume_chunk(
                &chunk[..read],
                provider,
                sender,
                counters,
                &mut partial,
                &mut discard_until_newline,
                &mut warned,
            );
        }
        if stopping {
            if final_read_truncated {
                counters.dropped.fetch_add(1, Ordering::Relaxed);
                mark_degraded(sender, counters, &mut warned);
            }
            if !partial.is_empty() && !discard_until_newline {
                consume_record(&partial, provider, sender, counters, &mut warned);
            }
            return;
        }
        thread::sleep(TAIL_INTERVAL);
    }
}

fn consume_chunk(
    mut chunk: &[u8],
    provider: ProviderKindV1,
    sender: &mpsc::SyncSender<ProgressEvent>,
    counters: &RenderCounters,
    partial: &mut Vec<u8>,
    discard_until_newline: &mut bool,
    warned: &mut bool,
) {
    if *discard_until_newline {
        let Some(end) = chunk.iter().position(|byte| *byte == b'\n') else {
            return;
        };
        chunk = &chunk[end + 1..];
        *discard_until_newline = false;
    }
    partial.extend_from_slice(chunk);
    while let Some(end) = partial.iter().position(|byte| *byte == b'\n') {
        let mut rest = partial.split_off(end + 1);
        partial.truncate(end);
        consume_record(partial, provider, sender, counters, warned);
        std::mem::swap(partial, &mut rest);
    }
    if partial.len() > MAX_RECORD_BYTES {
        partial.clear();
        *discard_until_newline = true;
        counters.dropped.fetch_add(1, Ordering::Relaxed);
        mark_degraded(sender, counters, warned);
    }
}

fn consume_record(
    record: &[u8],
    provider: ProviderKindV1,
    sender: &mpsc::SyncSender<ProgressEvent>,
    counters: &RenderCounters,
    warned: &mut bool,
) {
    if record.is_empty() {
        return;
    }
    let Ok(text) = std::str::from_utf8(record) else {
        counters.dropped.fetch_add(1, Ordering::Relaxed);
        mark_degraded(sender, counters, warned);
        return;
    };
    let Ok(value) = serde_json::from_str::<Value>(text) else {
        counters.dropped.fetch_add(1, Ordering::Relaxed);
        mark_degraded(sender, counters, warned);
        return;
    };
    if let Some(event) = normalize(provider, &value) {
        enqueue(sender, event, counters);
    }
}

fn mark_degraded(
    sender: &mpsc::SyncSender<ProgressEvent>,
    counters: &RenderCounters,
    warned: &mut bool,
) {
    counters.degraded.store(true, Ordering::Relaxed);
    if !*warned {
        enqueue(sender, ProgressEvent::DisplayDegraded, counters);
        *warned = true;
    }
}

fn normalize(provider: ProviderKindV1, value: &Value) -> Option<ProgressEvent> {
    match provider {
        ProviderKindV1::Claude => normalize_claude(value),
        ProviderKindV1::Codex => normalize_codex(value),
        ProviderKindV1::Pi => normalize_pi(value),
    }
}

fn normalize_claude(value: &Value) -> Option<ProgressEvent> {
    match value.get("type").and_then(Value::as_str) {
        Some("system") => Some(ProgressEvent::Working),
        Some("assistant") => value
            .pointer("/message/content")
            .and_then(Value::as_array)
            .and_then(|content| {
                content.iter().find_map(|item| {
                    (item.get("type").and_then(Value::as_str) == Some("tool_use"))
                        .then(|| tool_category(item.get("name").and_then(Value::as_str)))
                })
            })
            .map(ProgressEvent::ToolStarted),
        Some("user") => value
            .pointer("/message/content")
            .and_then(Value::as_array)
            .filter(|content| {
                content
                    .iter()
                    .any(|item| item.get("type").and_then(Value::as_str) == Some("tool_result"))
            })
            .map(|_| ProgressEvent::ToolCompleted("tool activity")),
        Some("result") if value.get("is_error").and_then(Value::as_bool) == Some(true) => {
            Some(ProgressEvent::Warning(classify_warning(
                value.get("result").and_then(Value::as_str),
            )))
        }
        Some("result") => Some(ProgressEvent::Completed),
        _ => None,
    }
}

fn normalize_codex(value: &Value) -> Option<ProgressEvent> {
    match value.get("type").and_then(Value::as_str) {
        Some("thread.started" | "turn.started") => Some(ProgressEvent::Working),
        Some("item.started") => value
            .pointer("/item/type")
            .and_then(Value::as_str)
            .and_then(codex_item_category)
            .map(ProgressEvent::ToolStarted),
        Some("item.completed") => value
            .pointer("/item/type")
            .and_then(Value::as_str)
            .and_then(codex_item_category)
            .map(ProgressEvent::ToolCompleted),
        Some("turn.failed") => Some(ProgressEvent::Warning(classify_warning(
            value.pointer("/error/message").and_then(Value::as_str),
        ))),
        Some("turn.completed") => Some(ProgressEvent::Completed),
        _ => None,
    }
}

fn normalize_pi(value: &Value) -> Option<ProgressEvent> {
    match value.get("type").and_then(Value::as_str) {
        Some("agent_start" | "turn_start") => Some(ProgressEvent::Working),
        Some("tool_execution_start") => Some(ProgressEvent::ToolStarted(tool_category(
            value.get("toolName").and_then(Value::as_str),
        ))),
        Some("tool_execution_end") => Some(ProgressEvent::ToolCompleted(tool_category(
            value.get("toolName").and_then(Value::as_str),
        ))),
        Some("message_end")
            if value.pointer("/message/role").and_then(Value::as_str) == Some("assistant")
                && matches!(
                    value.pointer("/message/stopReason").and_then(Value::as_str),
                    Some("error" | "aborted")
                ) =>
        {
            Some(ProgressEvent::Warning(classify_warning(
                value
                    .pointer("/message/errorMessage")
                    .and_then(Value::as_str),
            )))
        }
        Some("agent_settled") => Some(ProgressEvent::Completed),
        _ => None,
    }
}

fn tool_category(name: Option<&str>) -> &'static str {
    match name {
        Some("Bash" | "Shell" | "bash" | "terminal" | "command_execution") => "command",
        Some(
            "Read" | "Glob" | "Grep" | "read" | "grep" | "find" | "ls" | "search" | "web_search",
        ) => "search",
        Some("Edit" | "Write" | "edit" | "write" | "NotebookEdit" | "apply_patch") => "file change",
        Some("Task" | "Agent") => "delegation",
        _ => "tool activity",
    }
}

fn codex_item_category(kind: &str) -> Option<&'static str> {
    match kind {
        "command_execution" => Some("command"),
        "file_change" => Some("file change"),
        "web_search" | "web_search_call" => Some("search"),
        "mcp_tool_call" => Some("tool activity"),
        // Agent messages and reasoning are deliberately not progress input.
        _ => None,
    }
}

fn classify_warning(message: Option<&str>) -> WarningClass {
    let Some(message) = message else {
        return WarningClass::Unknown;
    };
    let message = message.to_ascii_lowercase();
    if message.contains("rate limit") || message.contains("too many requests") {
        WarningClass::RateLimited
    } else if message.contains("disconnect") || message.contains("connection") {
        WarningClass::Disconnected
    } else if message.contains("timeout") || message.contains("timed out") {
        WarningClass::Timeout
    } else if message.contains("overload") || message.contains("capacity") {
        WarningClass::Overloaded
    } else if message.contains("fail") || message.contains("error") {
        WarningClass::ProviderFailed
    } else {
        WarningClass::Unknown
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ClaudeDriver, CodexDriver, PiDriver, ProviderDriver};
    use forged_types::{Deliverable, ProviderHints, SpecRef, StageContract};
    use std::os::unix::fs::PermissionsExt;
    use tempfile::tempdir;

    fn packet(provider: &str, root: &Path) -> WorkPacket {
        WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: "run-1/implement/1".to_owned(),
            run_id: "run-1".to_owned(),
            bead_id: "beads-1".to_owned(),
            stage: Stage::Implement,
            execution: None,
            lane_seq: None,
            spec: SpecRef {
                path: root.join("spec.md").to_string_lossy().into_owned(),
                sha256: "0".repeat(64),
                revision: None,
            },
            worktree: root.to_path_buf(),
            branch: "work/test".to_owned(),
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

    fn request_fixture(provider: &str) -> (tempfile::TempDir, ProviderStreamRequestV1, PathBuf) {
        let root = tempdir().expect("tempdir");
        let packet_dir = root.path().join("packets/implement/1");
        let dirs = PacketDirs::new(&packet_dir, 7);
        std::fs::create_dir_all(dirs.path()).expect("attempt dir");
        std::fs::write(dirs.prompt(), "prompt").expect("prompt");
        let packet = packet(provider, root.path());
        let driver: &dyn ProviderDriver = match provider {
            "claude" => &ClaudeDriver,
            "codex" => &CodexDriver,
            "pi" => &PiDriver,
            other => panic!("unsupported fixture provider {other}"),
        };
        let invocation = driver
            .invocation(&packet, &dirs, "claim-token")
            .expect("invocation");
        let request = ProviderStreamRequestV1::for_attempt(
            &packet,
            &invocation,
            &dirs,
            root.path(),
            7,
            ProviderStreamRenderModeV1::Disabled,
        )
        .expect("request");
        let path = dirs.provider_stream_request();
        std::fs::write(&path, request.to_bytes().expect("bytes")).expect("request file");
        (root, request, path)
    }

    #[test]
    fn closed_request_rejects_extra_fields_and_mismatched_slots() {
        let (_root, request, path) = request_fixture("claude");
        let mut value = serde_json::to_value(&request).expect("value");
        value
            .as_object_mut()
            .expect("object")
            .insert("command".to_owned(), Value::String("unsafe".to_owned()));
        std::fs::write(&path, serde_json::to_vec(&value).expect("json")).expect("replace request");
        assert!(read_request(&path).is_err());

        let (_root, request, path) = request_fixture("claude");
        let mut value = serde_json::to_value(&request).expect("value");
        value.as_object_mut().expect("object").insert(
            "stdoutPath".to_owned(),
            Value::String(
                request
                    .stdout_path
                    .with_file_name("other.jsonl")
                    .to_string_lossy()
                    .into_owned(),
            ),
        );
        std::fs::write(&path, serde_json::to_vec(&value).expect("json")).expect("replace request");
        assert!(read_request(&path).is_err());
    }

    #[test]
    fn request_refuses_symlinked_prompt_and_raw_slots() {
        use std::os::unix::fs::symlink;

        let (root, request, path) = request_fixture("claude");
        let outside = root.path().join("outside");
        std::fs::write(&outside, "outside").expect("outside");
        std::fs::remove_file(&request.prompt_path).expect("remove prompt");
        symlink(&outside, &request.prompt_path).expect("prompt symlink");
        assert!(read_request(&path).is_err());

        let (_root, request, path) = request_fixture("claude");
        symlink("/dev/null", &request.stdout_path).expect("raw symlink");
        assert!(read_request(&path).is_err());
    }

    #[test]
    fn normalizers_never_copy_provider_strings() {
        let secret = "SECRET-home-/Users/alice-command-rm-rf";
        let claude = serde_json::json!({
            "type": "assistant",
            "message": {"content": [{"type":"tool_use", "name": secret,
                "input": {"command": secret}}]},
            "session_id": secret
        });
        let codex = serde_json::json!({
            "type": "turn.failed", "error": {"message": secret}
        });
        for event in [normalize_claude(&claude), normalize_codex(&codex)] {
            let line = event
                .expect("fixed event")
                .line(&request_fixture("claude").1);
            assert!(!line.contains(secret));
            assert!(!line.contains("/Users/alice"));
        }
    }

    #[test]
    fn provider_stdout_is_a_direct_exact_file_capture() {
        let (_root, request, _path) = request_fixture("claude");
        let shim = request
            .prompt_path
            .parent()
            .expect("attempt")
            .join("provider-shim");
        std::fs::write(
            &shim,
            "#!/bin/sh\ncat >/dev/null\nprintf '%s\\n' '{\"type\":\"system\",\"subtype\":\"init\"}' '{\"type\":\"result\",\"is_error\":false}'\n",
        )
        .expect("shim");
        std::fs::set_permissions(&shim, std::fs::Permissions::from_mode(0o755)).expect("shim mode");
        let code = run_request(&request, Some(&shim)).expect("runner");
        assert_eq!(code, 0);
        assert_eq!(
            std::fs::read(&request.stdout_path).expect("raw"),
            b"{\"type\":\"system\",\"subtype\":\"init\"}\n{\"type\":\"result\",\"is_error\":false}\n"
        );
        let status = load_provider_stream_status(&request, code).expect("valid status");
        assert_eq!(status.transport_failure(), None);
    }

    #[test]
    fn prompt_open_failure_writes_a_valid_closed_transport_status() {
        let (_root, request, _path) = request_fixture("claude");
        std::fs::remove_file(&request.prompt_path).expect("remove prompt");
        let code = run_request(&request, Some(Path::new("/never-spawned"))).expect("runner status");
        assert_eq!(code, RUNNER_TRANSPORT_EXIT);
        let status = load_provider_stream_status(&request, code).expect("valid failed status");
        assert_eq!(
            status.transport_failure(),
            Some(ProviderStreamFailureClassV1::PromptOpen)
        );
        assert!(!request.stdout_path.exists());
    }

    #[test]
    fn status_reader_fails_closed_on_exit_identity_and_schema_drift() {
        let (_root, request, _path) = request_fixture("claude");
        let shim = request
            .prompt_path
            .parent()
            .expect("attempt")
            .join("provider-shim");
        std::fs::write(&shim, "#!/bin/sh\ncat >/dev/null\nprintf '{}\\n'\n").expect("shim");
        std::fs::set_permissions(&shim, std::fs::Permissions::from_mode(0o755)).expect("shim mode");
        assert_eq!(run_request(&request, Some(&shim)).expect("runner"), 0);
        assert_eq!(
            load_provider_stream_status(&request, 9),
            Err(ProviderStreamStatusFailure::ExitMismatch)
        );

        let mut value: Value =
            serde_json::from_slice(&std::fs::read(&request.status_path).expect("status bytes"))
                .expect("status value");
        value.as_object_mut().expect("object").insert(
            "packetId".to_owned(),
            Value::String("different/implement/1".to_owned()),
        );
        std::fs::write(
            &request.status_path,
            serde_json::to_vec(&value).expect("json"),
        )
        .expect("replace status");
        assert_eq!(
            load_provider_stream_status(&request, 0),
            Err(ProviderStreamStatusFailure::IdentityMismatch)
        );

        value.as_object_mut().expect("object").insert(
            "transcript".to_owned(),
            Value::String("forbidden".to_owned()),
        );
        std::fs::write(
            &request.status_path,
            serde_json::to_vec(&value).expect("json"),
        )
        .expect("replace status");
        assert_eq!(
            load_provider_stream_status(&request, 0),
            Err(ProviderStreamStatusFailure::Malformed)
        );
    }

    #[test]
    fn pi_runner_preserves_skills_and_context_but_disables_extensions() {
        let (_root, mut request, _path) = request_fixture("pi");
        request.sandbox = Sandbox::ReadOnly;
        let command = provider_command(&request, None);
        let args = command
            .get_args()
            .map(|value| value.to_string_lossy().into_owned())
            .collect::<Vec<_>>();
        assert!(args.iter().any(|arg| arg == "--no-extensions"));
        assert!(args.iter().any(|arg| arg == "--approve"));
        assert!(args.windows(2).any(|pair| pair == ["--thinking", "high"]));
        assert!(args
            .windows(2)
            .any(|pair| pair == ["--tools", "read,grep,find,ls"]));
        assert!(!args.iter().any(|arg| arg.contains("bash")));
        assert!(!args.iter().any(|arg| arg == "--no-skills"));
        assert!(!args.iter().any(|arg| arg == "--no-context-files"));
        assert!(command.get_envs().any(|(key, value)| {
            key == "FORGED_PI_WORKER" && value.is_some_and(|value| value == "1")
        }));
    }

    #[test]
    fn shell_line_uses_only_exact_executable_pid_and_request_paths() {
        let (_root, request, path) = request_fixture("codex");
        let dirs = PacketDirs::new(
            request
                .prompt_path
                .parent()
                .expect("attempt")
                .parent()
                .expect("attempts")
                .parent()
                .expect("packet"),
            7,
        );
        let line = provider_stream_shell_line(Path::new("/tmp/forged"), &dirs).expect("line");
        assert!(line.contains(PROVIDER_STREAM_ARG));
        assert!(line.contains(path.to_str().expect("path")));
        assert!(!line.contains("codex exec"));
        assert!(!line.contains("claude -p"));
    }
}
