//! Durable handoff from an interactive lead session to a detached controller.
//!
//! The controller is only a host for `run drive` or `epic drive`; the ledger
//! remains execution truth. Herdr supplies a durable pane when available.

use std::collections::HashMap;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use forged_host::{HerdrHost, ProcessHost, SessionHost};
use forged_ledger::{EffectClass, Ledger, OperationState, SlotOutcome};
use forged_types::{ErrorCode, OperationRequest, OperationResponse};
use serde_json::{json, Value};

use crate::config::{now_iso, HostPolicy};
use crate::core::{
    default_key, derive_key, err_response, fenced, key_absent, ok_response, on_ledger, param_str,
    Ctx, Failure,
};

const CONTROLLER_STARTED: &str = "forged.controller.started";
const CONTROLLER_FALLBACK: &str = "forged.controller.host.fallback";
const PID_FILE: &str = "controller.pid";
const LSTART_FILE: &str = "controller.lstart";
const RECORD_FILE: &str = "controller.json";
const OUTPUT_FILE: &str = "controller.log";
const SUBMIT_LOCK_WAIT: Duration = Duration::from_secs(30);

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
    let pid = pid_path.as_deref().and_then(read_pid);
    let expected = lstart_path
        .as_deref()
        .and_then(|path| std::fs::read_to_string(path).ok())
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty());
    let exit_code = status_path.as_deref().and_then(read_exit_code);
    let current = match pid {
        Some(pid) if exit_code.is_none() => crate::adapters::ports::lstart_of(pid).await,
        _ => None,
    };
    let state = if exit_code.is_some() {
        "exited"
    } else {
        match (pid, expected.as_deref(), current.as_deref()) {
            (Some(pid), Some(expected), Some(current)) if expected == current && pid_alive(pid) => {
                "running"
            }
            // No identity answer proves neither death nor permission to
            // duplicate the controller. Fail closed until a sentinel lands.
            (Some(pid), _, None) if pid_alive(pid) => "running-unverified",
            (Some(pid), None, Some(_)) if pid_alive(pid) => "running-unverified",
            _ => "vanished",
        }
    };
    let mut status = record.clone();
    if let Some(object) = status.as_object_mut() {
        object.insert("state".to_owned(), json!(state));
        object.insert("pid".to_owned(), json!(pid));
        object.insert("exitCode".to_owned(), json!(exit_code));
    }
    status
}

fn is_active(status: &Value) -> bool {
    matches!(
        status.get("state").and_then(Value::as_str),
        Some("running" | "running-unverified")
    )
}

/// Latest detached-controller projection, or null before the first submit.
pub(super) async fn controller_status(ctx: &Ctx, id: &str) -> Result<Value, Failure> {
    match latest_record(ctx, id).await? {
        Some(record) => Ok(status_for(&record).await),
        None => Ok(Value::Null),
    }
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
) -> Result<Value, Failure> {
    let dir = controller_dir(ctx, id);
    std::fs::create_dir_all(&dir)
        .map_err(|error| Failure::internal(format!("creating controller directory: {error}")))?;
    let pid_path = dir.join(PID_FILE);
    let lstart_path = dir.join(LSTART_FILE);
    let record_path = dir.join(RECORD_FILE);
    let output_path = dir.join(OUTPUT_FILE);
    let _ = std::fs::remove_file(&pid_path);
    let _ = std::fs::remove_file(&lstart_path);
    let status_base = dir.join("status").join(generation.to_string());

    let (host, host_kind, socket_path): (Box<dyn SessionHost>, &str, Option<String>) =
        match ctx.config.host_policy {
            HostPolicy::Off => (Box::new(ProcessHost::new(&status_base)), "process", None),
            HostPolicy::Preferred | HostPolicy::Required => match ctx.config.herdr_sock.as_ref() {
                None if ctx.config.host_policy == HostPolicy::Required => {
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
                        Box::new(host),
                        "herdr",
                        Some(socket.to_string_lossy().into_owned()),
                    ),
                    Err(error) if ctx.config.host_policy == HostPolicy::Preferred => {
                        record_fallback(ctx, id, scope, generation, &error.to_string()).await?;
                        (Box::new(ProcessHost::new(&status_base)), "process", None)
                    }
                    Err(error) => return Err(error.into()),
                },
            },
        };

    let exe = std::env::current_exe()
        .map_err(|error| Failure::internal(format!("resolving forged executable: {error}")))?;
    let command = format!(
        "{} {} drive --{} {}",
        shell_quote(&exe.to_string_lossy()),
        scope.noun(),
        scope.noun(),
        shell_quote(id),
    );
    let pid_capture = format!("echo $$ > {}", shell_quote(&pid_path.to_string_lossy()));
    let shell_line = if host_kind == "process" {
        format!(
            "exec </dev/null >>{} 2>&1; {pid_capture}; {command}",
            shell_quote(&output_path.to_string_lossy()),
        )
    } else {
        format!("{pid_capture}; {command}")
    };
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

    let session = host.spawn(Path::new(repo), &shell_line, &env).await?;
    let Some(pid) = await_pid(&pid_path).await else {
        let _ = host.kill_confirmed(&session).await;
        return Err(Failure::refused(
            ErrorCode::ProviderSpawnFailed,
            "detached controller pid never appeared",
        ));
    };
    let lstart = crate::adapters::ports::lstart_of(pid).await;
    if let Some(value) = &lstart {
        std::fs::write(&lstart_path, value).map_err(|error| {
            Failure::internal(format!("writing detached controller identity: {error}"))
        })?;
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
            let controller = spawn(ctx, &id, &repo, scope, next_generation).await?;
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
    use super::shell_quote;

    #[test]
    fn shell_quote_handles_spaces_and_apostrophes() {
        assert_eq!(shell_quote("plain"), "'plain'");
        assert_eq!(shell_quote("a b's"), "'a b'\"'\"'s'");
    }
}
