//! Durable handoff from an interactive lead session to a detached controller.
//!
//! The controller is only a host for `run drive` or `epic drive`; the ledger
//! remains execution truth. Herdr supplies a durable pane when available.

use std::collections::HashMap;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;
use std::time::{Duration, Instant};

use forged_host::{HerdrHost, ProcessHost, SessionHost};
use forged_ledger::{EffectClass, Ledger, OperationState, SlotOutcome};
use forged_types::{ErrorCode, OperationRequest, OperationResponse};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::config::{now_iso, HostPolicy};
use crate::core::{
    default_key, derive_key, err_response, fenced, key_absent, ok_response, on_ledger, param_str,
    Ctx, Failure,
};

const CONTROLLER_STARTED: &str = "forged.controller.started";
const CONTROLLER_FALLBACK: &str = "forged.controller.host.fallback";
const CONTROLLER_RECOVERED: &str = "forged.controller.recovered";
const RECORD_FILE: &str = "controller.json";
const SUBMIT_LOCK_WAIT: Duration = Duration::from_secs(30);
const DRIVER_PID_ENV: &str = "FORGED_CONTROLLER_PID_PATH";
const DRIVER_LSTART_ENV: &str = "FORGED_CONTROLLER_LSTART_PATH";

#[derive(Debug, Clone, Copy)]
enum Scope {
    Run,
    Epic,
}

impl Scope {
    fn noun(self) -> &'static str {
        match self {
            Scope::Run => "run",
            Scope::Epic => "epic",
        }
    }

    fn operation(self) -> &'static str {
        match self {
            Scope::Run => "run_submit",
            Scope::Epic => "epic_submit",
        }
    }
}

fn payload(row: &forged_ledger::EventRow) -> Option<Value> {
    serde_json::from_str(&row.payload_json).ok()
}

fn shell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\"'\"'"))
}

fn binary_identity(path: &Path) -> Result<Value, Failure> {
    let mut file = std::fs::File::open(path)
        .map_err(|error| Failure::internal(format!("opening forged executable: {error}")))?;
    let mut digest = Sha256::new();
    let mut buf = [0u8; 64 * 1024];
    loop {
        let read = file
            .read(&mut buf)
            .map_err(|error| Failure::internal(format!("hashing forged executable: {error}")))?;
        if read == 0 {
            break;
        }
        digest.update(&buf[..read]);
    }
    let sha256 = digest
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>();
    Ok(json!({
        "path": path,
        "version": env!("CARGO_PKG_VERSION"),
        "sha256": sha256,
    }))
}

fn current_binary_identity() -> Result<Value, Failure> {
    static IDENTITY: OnceLock<Result<Value, String>> = OnceLock::new();
    IDENTITY
        .get_or_init(|| {
            let path = std::env::current_exe()
                .map_err(|error| format!("resolving forged executable: {error}"))?;
            binary_identity(&path).map_err(|failure| failure.message)
        })
        .clone()
        .map_err(Failure::internal)
}

fn controller_shell_line(
    command: &str,
    output_path: &Path,
    exit_path: &Path,
    mirror_to_pane: bool,
) -> String {
    if !mirror_to_pane {
        return format!(
            "exec </dev/null >>{} 2>&1; {command}",
            shell_quote(&output_path.to_string_lossy())
        );
    }
    // POSIX sh has no pipefail. Persist the driver's status before tee and
    // make a final subshell reproduce it, so the host sentinel still records
    // the forged process rather than tee's exit code.
    format!(
        "{{ {command}; printf '%s\\n' \"$?\" > {}; }} 2>&1 | tee -a {}; \
         (exit \"$(cat {})\")",
        shell_quote(&exit_path.to_string_lossy()),
        shell_quote(&output_path.to_string_lossy()),
        shell_quote(&exit_path.to_string_lossy()),
    )
}

/// A detached `drive` process records ITS OWN pid and start time. The host
/// shell and Herdr pane are transport only and are never liveness truth.
pub(crate) async fn record_driver_identity_from_env() -> Result<(), String> {
    let pid_path = std::env::var_os(DRIVER_PID_ENV).map(PathBuf::from);
    let lstart_path = std::env::var_os(DRIVER_LSTART_ENV).map(PathBuf::from);
    let (Some(pid_path), Some(lstart_path)) = (pid_path, lstart_path) else {
        return Ok(());
    };
    if !pid_path.is_absolute() || !lstart_path.is_absolute() {
        return Err("detached controller identity paths must be absolute".to_owned());
    }
    let pid = i32::try_from(std::process::id())
        .map_err(|_| "detached controller pid does not fit i32".to_owned())?;
    let lstart = crate::adapters::ports::lstart_of(pid)
        .await
        .ok_or_else(|| format!("cannot verify detached controller pid {pid}"))?;
    // PID is the publication marker. A submitter that observes it is
    // guaranteed the matching start stamp was durably written first.
    std::fs::write(&lstart_path, format!("{lstart}\n"))
        .map_err(|error| format!("writing detached controller lstart: {error}"))?;
    std::fs::write(&pid_path, format!("{pid}\n"))
        .map_err(|error| format!("writing detached controller pid: {error}"))?;
    Ok(())
}

fn controller_dir(ctx: &Ctx, id: &str) -> PathBuf {
    ctx.config.run_dir(id).join("controller")
}

fn read_exit_code(path: &Path) -> Option<i32> {
    std::fs::read_to_string(path).ok()?.trim().parse().ok()
}

fn read_pid(path: &Path) -> Option<i32> {
    std::fs::read_to_string(path)
        .ok()?
        .trim()
        .parse::<i32>()
        .ok()
        .filter(|pid| *pid > 0)
}

fn pid_alive(pid: i32) -> bool {
    matches!(
        nix::sys::signal::kill(nix::unistd::Pid::from_raw(pid), None),
        Ok(()) | Err(nix::errno::Errno::EPERM)
    )
}

fn lstart_hash(value: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    value.hash(&mut hasher);
    hasher.finish()
}

fn submit_holder_identity(holder: &str) -> Option<(i32, Option<u64>)> {
    let mut fields = holder.strip_prefix("forged-submit:")?.split(':');
    let pid = fields.next()?.parse().ok()?;
    let identity = fields.next().and_then(|value| value.parse().ok());
    Some((pid, identity))
}

struct SubmitGuard {
    ledger: Ledger,
    slot: String,
    holder: String,
}

impl Drop for SubmitGuard {
    fn drop(&mut self) {
        let _ = self.ledger.release_merge_slot(&self.slot, &self.holder);
    }
}

/// Serialize generation allocation and controller spawning per logical id.
/// Request idempotency keys remain replay identities; they are deliberately
/// not the singleton boundary.
async fn acquire_submit(ctx: &Ctx, id: &str, scope: Scope) -> Result<SubmitGuard, Failure> {
    let slot = format!("controller-submit:{}:{id}", scope.noun());
    let pid = std::process::id() as i32;
    let identity = crate::adapters::ports::lstart_of(pid)
        .await
        .map(|value| lstart_hash(&value));
    let holder = format!(
        "forged-submit:{}:{}:{}",
        pid,
        identity
            .map(|value| value.to_string())
            .unwrap_or_else(|| "unknown".to_owned()),
        uuid::Uuid::new_v4()
    );
    let started = Instant::now();
    loop {
        let outcome = {
            let slot = slot.clone();
            let holder = holder.clone();
            on_ledger(&ctx.ledger, move |ledger| {
                ledger.acquire_merge_slot(&slot, &holder)
            })
            .await?
        };
        match outcome {
            SlotOutcome::Acquired(_) => {
                return Ok(SubmitGuard {
                    ledger: ctx.ledger.clone(),
                    slot,
                    holder,
                });
            }
            SlotOutcome::Held(row) => {
                let stale = match submit_holder_identity(&row.holder) {
                    Some((held_pid, held_identity)) => {
                        !pid_alive(held_pid)
                            || matches!(
                                (
                                    held_identity,
                                    crate::adapters::ports::lstart_of(held_pid).await
                                ),
                                (Some(recorded), Some(current))
                                    if recorded != lstart_hash(&current)
                            )
                    }
                    None => false,
                };
                if stale {
                    let slot = slot.clone();
                    on_ledger(&ctx.ledger, move |ledger| {
                        ledger.force_release_merge_slot(&slot)
                    })
                    .await?;
                    continue;
                }
                if started.elapsed() >= SUBMIT_LOCK_WAIT {
                    return Err(Failure::refused(
                        ErrorCode::BeadsContention,
                        format!(
                            "{} {id} controller submission is still owned by {}",
                            scope.noun(),
                            row.holder
                        ),
                    ));
                }
                tokio::time::sleep(Duration::from_millis(50)).await;
            }
        }
    }
}

async fn events(ctx: &Ctx, id: &str) -> Result<Vec<forged_ledger::EventRow>, Failure> {
    let id = id.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_events(Some(&id), 0, 65_536)
    })
    .await
}

fn generation(record: &Value) -> u32 {
    record
        .get("generation")
        .and_then(Value::as_u64)
        .and_then(|value| u32::try_from(value).ok())
        .unwrap_or(0)
}

async fn latest_record(ctx: &Ctx, id: &str) -> Result<Option<Value>, Failure> {
    let event_record = events(ctx, id)
        .await?
        .into_iter()
        .rev()
        .find(|row| row.kind == CONTROLLER_STARTED)
        .and_then(|row| payload(&row));
    let file_record = std::fs::read_to_string(controller_dir(ctx, id).join(RECORD_FILE))
        .ok()
        .and_then(|text| serde_json::from_str::<Value>(&text).ok());
    Ok(match (event_record, file_record) {
        (Some(event), Some(file)) if generation(&file) > generation(&event) => Some(file),
        (Some(event), _) => Some(event),
        (None, file) => file,
    })
}

fn controller_state(
    exit_code: Option<i32>,
    pid: Option<i32>,
    expected: Option<&str>,
    current: Option<&str>,
    pid_is_alive: bool,
) -> &'static str {
    if exit_code.is_some() {
        return "exited";
    }
    match (pid, expected, current) {
        (Some(_), Some(expected), Some(current)) if expected == current && pid_is_alive => {
            "running"
        }
        // No identity answer proves neither life nor permission to duplicate
        // the controller. Say unknown, never "running".
        (Some(_), _, None) if pid_is_alive => "unknown",
        (Some(_), None, Some(_)) if pid_is_alive => "unknown",
        _ => "vanished",
    }
}

async fn status_for(record: &Value) -> Value {
    let pid_path = record
        .get("pidPath")
        .and_then(Value::as_str)
        .map(PathBuf::from);
    let lstart_path = record
        .get("lstartPath")
        .and_then(Value::as_str)
        .map(PathBuf::from);
    let status_path = record
        .get("statusPath")
        .and_then(Value::as_str)
        .map(PathBuf::from);
    let pid = record
        .pointer("/driver/pid")
        .and_then(Value::as_i64)
        .and_then(|value| i32::try_from(value).ok())
        .or_else(|| pid_path.as_deref().and_then(read_pid));
    let expected = record
        .pointer("/driver/lstart")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .or_else(|| {
            lstart_path
                .as_deref()
                .and_then(|path| std::fs::read_to_string(path).ok())
                .map(|value| value.trim().to_owned())
                .filter(|value| !value.is_empty())
        });
    let exit_code = status_path.as_deref().and_then(read_exit_code);
    let current = match pid {
        Some(pid) if exit_code.is_none() => crate::adapters::ports::lstart_of(pid).await,
        _ => None,
    };
    let state = controller_state(
        exit_code,
        pid,
        expected.as_deref(),
        current.as_deref(),
        pid.is_some_and(pid_alive),
    );
    let mut status = record.clone();
    if let Some(object) = status.as_object_mut() {
        object.insert("state".to_owned(), json!(state));
        object.insert("pid".to_owned(), json!(pid));
        object.insert("exitCode".to_owned(), json!(exit_code));
        let current_binary = current_binary_identity().ok();
        let mismatch = match (
            record.pointer("/binary/sha256").and_then(Value::as_str),
            current_binary
                .as_ref()
                .and_then(|value| value.get("sha256"))
                .and_then(Value::as_str),
        ) {
            (Some(recorded), Some(current)) => Some(recorded != current),
            _ => None,
        };
        object.insert(
            "currentBinary".to_owned(),
            current_binary.unwrap_or(Value::Null),
        );
        object.insert("binaryMismatch".to_owned(), json!(mismatch));
    }
    status
}

/// Project controller truth from lifecycle rows already held by an
/// inventory snapshot. This keeps portfolio construction to one ledger
/// transaction; only the per-controller identity files and OS process table
/// are consulted here.
pub(super) async fn controller_status_from_snapshot(
    ctx: &Ctx,
    id: &str,
    event_record: Option<Value>,
    progress: Option<&forged_ledger::EventRow>,
) -> Value {
    let file_record = std::fs::read_to_string(controller_dir(ctx, id).join(RECORD_FILE))
        .ok()
        .and_then(|text| serde_json::from_str::<Value>(&text).ok());
    let record = match (event_record, file_record) {
        (Some(event), Some(file)) if generation(&file) > generation(&event) => Some(file),
        (Some(event), _) => Some(event),
        (None, file) => file,
    };
    let Some(record) = record else {
        return Value::Null;
    };
    let mut status = status_for(&record).await;
    if let Some(object) = status.as_object_mut() {
        object.insert(
            "lastProgressAt".to_owned(),
            progress.map_or(Value::Null, |row| json!(row.ts)),
        );
        object.insert(
            "lastProgressKind".to_owned(),
            progress.map_or(Value::Null, |row| json!(row.kind)),
        );
        object.insert(
            "lastProgressEventId".to_owned(),
            progress.map_or(Value::Null, |row| json!(row.event_id)),
        );
    }
    status
}

fn is_active(status: &Value) -> bool {
    status.get("state").and_then(Value::as_str) == Some("running")
}

fn is_unknown(status: &Value) -> bool {
    status.get("state").and_then(Value::as_str) == Some("unknown")
}

/// Latest detached-controller projection, or null before the first submit.
pub(super) async fn controller_status(ctx: &Ctx, id: &str) -> Result<Value, Failure> {
    let record = latest_record(ctx, id).await?;
    let progress = events(ctx, id).await?.into_iter().last();
    Ok(controller_status_from_snapshot(ctx, id, record, progress.as_ref()).await)
}

async fn append_once(ctx: &Ctx, id: &str, kind: &str, value: Value) -> Result<(), Failure> {
    let id = id.to_owned();
    let kind = kind.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event_once(&id, &kind, value)?;
        Ok(())
    })
    .await
}

async fn record_fallback(
    ctx: &Ctx,
    id: &str,
    scope: Scope,
    generation: u32,
    reason: &str,
) -> Result<(), Failure> {
    append_once(
        ctx,
        id,
        CONTROLLER_FALLBACK,
        json!({
            "schemaVersion": 1,
            "scope": scope.noun(),
            "generation": generation,
            "requested": "herdr",
            "selected": "process",
            "reason": reason,
        }),
    )
    .await
}

/// Once the submit singleton has verified the preceding controller dead,
/// interrupted effects are attributable to that predecessor. Run recovery
/// uses the full reconciler (including observe-before-redo effects); epic
/// effects are all SafeRetry and can be handed back directly.
async fn recover_abandoned(
    ctx: &Ctx,
    id: &str,
    scope: Scope,
    generation: u32,
) -> Result<(), Failure> {
    let id_for_rows = id.to_owned();
    let inflight = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_inflight_operations(Some(&id_for_rows))
    })
    .await?;
    if inflight.is_empty() {
        return Ok(());
    }
    let result = match scope {
        Scope::Run => {
            let view = super::drive::project(ctx, id).await?;
            let config = forged_proto::ReconcileConfig {
                stage_budget_s: view.policy.stage_budget_s.into_iter().collect(),
                gate_commands: view.policy.gate_commands,
            };
            let ports =
                crate::adapters::ports::ForgedPorts::new(ctx.ledger.clone(), ctx.config.clone());
            let report =
                forged_proto::reconcile(&ctx.ledger, id, &ports, &config, &now_iso()).await?;
            crate::adapters::ports::report_json(&report)
        }
        Scope::Epic => {
            let mut released = Vec::new();
            for row in inflight {
                if row.effect_class != EffectClass::SafeRetry {
                    continue;
                }
                let operation_id = row.operation_id.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.release_operation(&operation_id)
                })
                .await?;
                released.push(row.operation_id);
            }
            json!({"released": released})
        }
    };
    append_once(
        ctx,
        id,
        CONTROLLER_RECOVERED,
        json!({
            "schemaVersion": 1,
            "scope": scope.noun(),
            "generation": generation,
            "result": result,
        }),
    )
    .await
}

async fn await_pid(path: &Path) -> Option<i32> {
    for _ in 0..50 {
        if let Some(pid) = read_pid(path) {
            return Some(pid);
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    None
}

async fn spawn(
    ctx: &Ctx,
    id: &str,
    repo: &str,
    scope: Scope,
    generation: u32,
    host_policy: HostPolicy,
    herdr_socket: Option<PathBuf>,
) -> Result<Value, Failure> {
    let dir = controller_dir(ctx, id);
    std::fs::create_dir_all(&dir)
        .map_err(|error| Failure::internal(format!("creating controller directory: {error}")))?;
    let pid_path = dir.join(format!("controller-{generation}.pid"));
    let lstart_path = dir.join(format!("controller-{generation}.lstart"));
    let record_path = dir.join(RECORD_FILE);
    let output_path = dir.join(format!("controller-{generation}.log"));
    let drive_exit_path = dir.join(format!("controller-{generation}.drive-exit"));
    let _ = std::fs::remove_file(&pid_path);
    let _ = std::fs::remove_file(&lstart_path);
    let _ = std::fs::remove_file(&drive_exit_path);
    let status_base = dir.join("status").join(generation.to_string());

    let (host, host_kind, socket_path): (Box<dyn SessionHost>, &str, Option<String>) =
        match host_policy {
            HostPolicy::Off => (Box::new(ProcessHost::new(&status_base)), "process", None),
            HostPolicy::Preferred | HostPolicy::Required => match herdr_socket.as_ref() {
                None if host_policy == HostPolicy::Required => {
                    return Err(Failure::refused(
                        ErrorCode::HostUnavailable,
                        "Herdr is required but no socket is configured",
                    ));
                }
                None => {
                    record_fallback(ctx, id, scope, generation, "no Herdr socket is configured")
                        .await?;
                    (Box::new(ProcessHost::new(&status_base)), "process", None)
                }
                Some(socket) => match HerdrHost::connect(socket, &status_base).await {
                    Ok(host) => (
                        Box::new(
                            match crate::adapters::execute::workspace_label_for_repo(repo) {
                                Some(label) => host.with_workspace(label),
                                None => host,
                            },
                        ),
                        "herdr",
                        Some(socket.to_string_lossy().into_owned()),
                    ),
                    Err(error) if host_policy == HostPolicy::Preferred => {
                        record_fallback(ctx, id, scope, generation, &error.to_string()).await?;
                        (Box::new(ProcessHost::new(&status_base)), "process", None)
                    }
                    Err(error) => return Err(error.into()),
                },
            },
        };

    let exe = std::env::current_exe()
        .map_err(|error| Failure::internal(format!("resolving forged executable: {error}")))?;
    let binary = current_binary_identity()?;
    let command = format!(
        "{} {} drive --{} {}",
        shell_quote(&exe.to_string_lossy()),
        scope.noun(),
        scope.noun(),
        shell_quote(id),
    );
    let shell_line = controller_shell_line(
        &command,
        &output_path,
        &drive_exit_path,
        host_kind == "herdr",
    );
    let mut env = HashMap::new();
    if let Ok(path) = std::env::var("PATH") {
        env.insert("PATH".to_owned(), path);
    }
    env.insert(
        "ANVIL_HOME".to_owned(),
        ctx.config.anvil_home.to_string_lossy().into_owned(),
    );
    env.insert(
        "FORGED_CONFIG".to_owned(),
        ctx.config.config_path.to_string_lossy().into_owned(),
    );
    env.insert(
        "BEADS_DIR".to_owned(),
        ctx.config.beads_dir.to_string_lossy().into_owned(),
    );
    env.insert(
        DRIVER_PID_ENV.to_owned(),
        pid_path.to_string_lossy().into_owned(),
    );
    env.insert(
        DRIVER_LSTART_ENV.to_owned(),
        lstart_path.to_string_lossy().into_owned(),
    );

    let session = host.spawn(Path::new(repo), &shell_line, &env).await?;
    let Some(pid) = await_pid(&pid_path).await else {
        let _ = host.kill_confirmed(&session).await;
        return Err(Failure::refused(
            ErrorCode::ProviderSpawnFailed,
            "detached controller pid never appeared",
        ));
    };
    let lstart = std::fs::read_to_string(&lstart_path)
        .ok()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty());
    let current_lstart = crate::adapters::ports::lstart_of(pid).await;
    if lstart.is_none() || lstart != current_lstart {
        let _ = host.kill_confirmed(&session).await;
        return Err(Failure::refused(
            ErrorCode::ProviderSpawnFailed,
            "detached controller identity was not verifiable",
        ));
    }
    let status_path = status_base.join(session.as_str()).join("status");
    let record = json!({
        "schemaVersion": 1,
        "scope": scope.noun(),
        "id": id,
        "generation": generation,
        "host": host_kind,
        "sessionId": session.as_str(),
        "socketPath": socket_path,
        "attachHint": host.attach_hint(&session),
        "driver": {"pid": pid, "lstart": lstart},
        "binary": binary,
        "pidPath": pid_path,
        "lstartPath": lstart_path,
        "statusPath": status_path,
        "outputPath": output_path,
        "submittedAt": now_iso(),
    });
    std::fs::write(
        &record_path,
        serde_json::to_vec_pretty(&record).map_err(|error| {
            Failure::internal(format!("serializing controller record: {error}"))
        })?,
    )
    .map_err(|error| Failure::internal(format!("writing controller record: {error}")))?;
    crate::failpoint::hit("controller.record.after");
    append_once(ctx, id, CONTROLLER_STARTED, record.clone()).await?;
    Ok(status_for(&record).await)
}

async fn submit(ctx: &Ctx, req: &mut OperationRequest, scope: Scope) -> OperationResponse {
    if req.schema_version != 1 {
        return err_response(
            &derive_key(scope.operation(), req.run_id.as_deref(), None, None),
            &Failure::invalid(format!("unsupported schemaVersion {}", req.schema_version)),
        );
    }
    let id = match param_str(&req.params, scope.noun()) {
        Ok(value) => value.to_owned(),
        Err(error) => {
            return err_response(&derive_key(scope.operation(), None, None, None), &error)
        }
    };
    let repo = match scope {
        Scope::Run => {
            let run_id = id.clone();
            match on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&run_id)).await {
                Ok(row) => row.repo,
                Err(error) => {
                    return err_response(
                        &derive_key(scope.operation(), Some(&id), None, None),
                        &error,
                    )
                }
            }
        }
        Scope::Epic => match super::epic::epic_repo(ctx, &id).await {
            Ok(repo) => repo,
            Err(error) => {
                return err_response(
                    &derive_key(scope.operation(), Some(&id), None, None),
                    &error,
                )
            }
        },
    };
    if req.run_id.is_none() {
        req.run_id = Some(id.clone());
    }
    let _submit_guard = match acquire_submit(ctx, &id, scope).await {
        Ok(guard) => guard,
        Err(error) => {
            return err_response(
                &derive_key(scope.operation(), Some(&id), None, None),
                &error,
            )
        }
    };

    let records = match events(ctx, &id).await {
        Ok(records) => records,
        Err(error) => {
            return err_response(
                &derive_key(scope.operation(), Some(&id), None, None),
                &error,
            )
        }
    };
    let mut max_generation = records
        .iter()
        .filter(|row| row.kind == CONTROLLER_STARTED)
        .filter_map(payload)
        .map(|value| generation(&value))
        .max()
        .unwrap_or(0);
    let mut latest_status = Value::Null;
    if let Ok(Some(record)) = latest_record(ctx, &id).await {
        max_generation = max_generation.max(generation(&record));
        let status = status_for(&record).await;
        latest_status = status.clone();
        if is_active(&status) {
            // Recover the ledger row if the submitting process died after
            // writing controller.json but before appending the event.
            if let Err(error) = append_once(ctx, &id, CONTROLLER_STARTED, record).await {
                return err_response(
                    &derive_key(scope.operation(), Some(&id), None, None),
                    &error,
                );
            }
            let key = if key_absent(req) {
                derive_key(
                    scope.operation(),
                    Some(&id),
                    None,
                    Some(i64::from(generation(&status))),
                )
            } else {
                req.idempotency_key.clone()
            };
            let name = scope.operation().to_owned();
            let key_for_probe = key.clone();
            let row = match on_ledger(&ctx.ledger, move |ledger| {
                ledger.find_operation(&name, &key_for_probe)
            })
            .await
            {
                Ok(row) => row,
                Err(error) => return err_response(&key, &error),
            };
            if let Some(row) = row {
                let request_hash = match forged_types::request_sha256(req) {
                    Ok(hash) => hash,
                    Err(error) => {
                        return err_response(
                            &key,
                            &Failure::invalid(format!("params cannot be canonicalized: {error}")),
                        )
                    }
                };
                if request_hash != row.request_sha256 {
                    return err_response(
                        &key,
                        &Failure::refused(
                            ErrorCode::IdempotencyConflict,
                            format!(
                                "operation {:?} key {:?} was stored with a different request",
                                scope.operation(),
                                key
                            ),
                        ),
                    );
                }
                if row.state == OperationState::Terminal {
                    let Some(stored) = row.response_json else {
                        return err_response(
                            &key,
                            &Failure::internal("terminal submit operation has no response"),
                        );
                    };
                    return match serde_json::from_str::<OperationResponse>(&stored) {
                        Ok(mut response) => {
                            response.reused = true;
                            response
                        }
                        Err(error) => err_response(
                            &key,
                            &Failure::internal(format!(
                                "stored submit response is malformed: {error}"
                            )),
                        ),
                    };
                }
                let response = ok_response(
                    &row.operation_id,
                    false,
                    json!({"submitted": true, "alreadyRunning": false, "controller": status}),
                );
                let operation_id = row.operation_id;
                let response_for_store = response.clone();
                if let Err(error) = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.resolve_interrupted_operation(&operation_id, &response_for_store)
                })
                .await
                {
                    return err_response(&key, &error);
                }
                return response;
            }
            return ok_response(
                &key,
                true,
                json!({"submitted": false, "alreadyRunning": true, "controller": status}),
            );
        }
        if is_unknown(&status) {
            return err_response(
                &derive_key(scope.operation(), Some(&id), None, None),
                &Failure {
                    code: ErrorCode::HostUnavailable,
                    message: format!(
                        "{} {id} controller identity is unverified; refusing a duplicate spawn",
                        scope.noun()
                    ),
                    recoverable: true,
                },
            );
        }
        if let Err(error) = recover_abandoned(ctx, &id, scope, generation(&status)).await {
            return err_response(
                &derive_key(scope.operation(), Some(&id), None, None),
                &error,
            );
        }
    }

    let stopped = match scope {
        Scope::Run => match super::drive::project(ctx, &id).await {
            Ok(view) => match forged_proto::advance(&view) {
                forged_proto::NextAction::Stop(terminal) => {
                    Some(json!({"terminal": super::drive::terminal_json(&terminal)}))
                }
                _ => None,
            },
            Err(error) => {
                return err_response(
                    &derive_key(scope.operation(), Some(&id), None, None),
                    &error,
                )
            }
        },
        Scope::Epic => match super::epic::epic_submission_stop(ctx, &id).await {
            Ok(value) => value,
            Err(error) => {
                return err_response(
                    &derive_key(scope.operation(), Some(&id), None, None),
                    &error,
                )
            }
        },
    };
    if let Some(stopped) = stopped {
        return ok_response(
            &derive_key(
                scope.operation(),
                Some(&id),
                Some("stopped"),
                Some(i64::from(max_generation)),
            ),
            false,
            json!({
                "submitted": false,
                "alreadyRunning": false,
                "stopped": stopped,
                "controller": latest_status,
            }),
        );
    }

    let next_generation = max_generation.saturating_add(1);
    if !key_absent(req) {
        let name = scope.operation().to_owned();
        let key = req.idempotency_key.clone();
        let key_for_probe = key.clone();
        match on_ledger(&ctx.ledger, move |ledger| {
            ledger.find_operation(&name, &key_for_probe)
        })
        .await
        {
            Ok(Some(row)) if row.state == OperationState::Terminal => {
                return err_response(
                    &key,
                    &Failure::refused(
                        ErrorCode::IdempotencyConflict,
                        format!(
                            "submit key {key:?} belongs to a controller that is no longer live; \
                             use a fresh key to start generation {next_generation}"
                        ),
                    ),
                );
            }
            Ok(_) => {}
            Err(error) => return err_response(&key, &error),
        }
    }
    let (host_policy, herdr_socket) = match scope {
        Scope::Run => match super::drive::project(ctx, &id).await {
            Ok(view) => (view.policy.host_policy, view.policy.herdr_socket),
            Err(error) => return err_response(&req.idempotency_key, &error),
        },
        Scope::Epic => match super::epic::epic_host_policy(ctx, &id).await {
            Ok(policy) => policy,
            Err(error) => return err_response(&req.idempotency_key, &error),
        },
    };
    default_key(
        req,
        derive_key(
            scope.operation(),
            Some(&id),
            None,
            Some(i64::from(next_generation)),
        ),
    );
    fenced(ctx, scope.operation(), EffectClass::SafeRetry, req, None, {
        move |_operation| async move {
            let controller = spawn(
                ctx,
                &id,
                &repo,
                scope,
                next_generation,
                host_policy,
                herdr_socket,
            )
            .await?;
            Ok(json!({"submitted": true, "alreadyRunning": false, "controller": controller}))
        }
    })
    .await
}

/// Detach a slice driver and return its durable controller identity.
pub async fn run_submit(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    submit(ctx, req, Scope::Run).await
}

/// Detach an epic driver and return its durable controller identity.
pub async fn epic_submit(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    submit(ctx, req, Scope::Epic).await
}

#[cfg(test)]
mod tests {
    use super::{controller_shell_line, controller_state, shell_quote, status_for};
    use serde_json::json;
    use std::path::Path;

    #[test]
    fn shell_quote_handles_spaces_and_apostrophes() {
        assert_eq!(shell_quote("plain"), "'plain'");
        assert_eq!(shell_quote("a b's"), "'a b'\"'\"'s'");
    }

    #[test]
    fn both_hosts_get_a_durable_log_without_losing_driver_status() {
        let process = controller_shell_line(
            "forged run drive --run bead-1",
            Path::new("/tmp/controller.log"),
            Path::new("/tmp/driver.exit"),
            false,
        );
        assert_eq!(
            process,
            "exec </dev/null >>'/tmp/controller.log' 2>&1; forged run drive --run bead-1"
        );
        let herdr = controller_shell_line(
            "forged run drive --run bead-1",
            Path::new("/tmp/controller.log"),
            Path::new("/tmp/driver.exit"),
            true,
        );
        assert!(herdr.contains("2>&1 | tee -a '/tmp/controller.log'"));
        assert!(herdr.contains("printf '%s\\n' \"$?\" > '/tmp/driver.exit'"));
        assert!(herdr.ends_with("(exit \"$(cat '/tmp/driver.exit')\")"));
    }

    #[tokio::test]
    async fn installed_binary_mismatch_is_visible() {
        let record = json!({
            "driver": {
                "pid": std::process::id(),
                "lstart": "Thu Jan  1 00:00:00 1970",
            },
            "binary": {"sha256": "definitely-not-this-binary"},
        });
        let status = status_for(&record).await;
        assert_eq!(status["binaryMismatch"], json!(true));
    }

    #[test]
    fn a_recycled_pid_is_never_projected_as_running() {
        assert_eq!(
            controller_state(
                None,
                Some(42),
                Some("Thu Jan  1 00:00:00 1970"),
                Some("Fri Jan  2 00:00:00 1970"),
                true,
            ),
            "vanished"
        );
    }

    #[tokio::test]
    async fn missing_start_identity_is_unknown_not_running() {
        let record = json!({"driver": {"pid": std::process::id()}});
        let status = status_for(&record).await;
        assert_eq!(status["state"], json!("unknown"));
    }
}
