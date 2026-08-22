//! Durable identity and convergent cleanup for Herdr sessions Forged owns.
//!
//! Host preparation reserves transport coordinates, this module turns those
//! exact coordinates into the migration-014 identity, and only then may the
//! caller send a command. Cleanup execution is added below the same boundary:
//! the ledger decides eligibility and Herdr is only the addressed effect.

use std::path::PathBuf;

use forged_host::{HerdrCloseOutcome, HerdrControl, HerdrSessionIdentity, PreparedSession};
use forged_ledger::{
    DesiredState, DesiredSubjectKind, OwnedHerdrCleanupReason, OwnedHerdrCleanupRelease,
    OwnedHerdrCleanupRetry, OwnedHerdrCleanupState, OwnedHerdrSessionRow,
};
use forged_types::{
    OwnedHerdrOwnerV1, OwnedHerdrSessionV1, OwnedHerdrSubjectKind, OwnedHerdrSubjectV1,
    OWNED_HERDR_SESSION_SCHEMA_V1,
};

use super::handoff::Scope;
use super::{on_ledger, Ctx, Failure};

const CLEANUP_BATCH: u32 = 64;
const CLEANUP_LEASE_SECONDS: u64 = 60;

pub(crate) async fn register(ctx: &Ctx, identity: OwnedHerdrSessionV1) -> Result<(), Failure> {
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.register_owned_herdr_session(&identity)?;
        Ok(())
    })
    .await
}

pub(crate) async fn mark_command_started(ctx: &Ctx, ownership_id: &str) -> Result<(), Failure> {
    let ownership_id = ownership_id.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.mark_owned_herdr_command_started(&ownership_id)?;
        Ok(())
    })
    .await
}

fn desired_kind(kind: OwnedHerdrSubjectKind) -> DesiredSubjectKind {
    match kind {
        OwnedHerdrSubjectKind::Run => DesiredSubjectKind::Run,
        OwnedHerdrSubjectKind::Epic => DesiredSubjectKind::Epic,
    }
}

fn deadline_after(anchor: &str, seconds: u64) -> Result<String, Failure> {
    let timestamp: jiff::Timestamp = anchor.parse().map_err(|error| {
        Failure::internal(format!(
            "cannot parse cleanup timestamp {anchor:?}: {error}"
        ))
    })?;
    let nanos = i128::from(seconds).saturating_mul(1_000_000_000);
    let deadline = jiff::Timestamp::from_nanosecond(
        timestamp.as_nanosecond().saturating_add(nanos),
    )
    .map_err(|error| Failure::internal(format!("cleanup deadline out of range: {error}")))?;
    Ok(forged_proto::widen_rfc3339(&deadline.to_string()))
}

fn bounded_error(error: &str) -> String {
    const MAX: usize = 2_048;
    if error.len() <= MAX {
        return error.to_owned();
    }
    let mut end = MAX;
    while !error.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}...[truncated]", &error[..end])
}

async fn request_controller_cleanup(
    ctx: &Ctx,
    row: &OwnedHerdrSessionRow,
    reason: OwnedHerdrCleanupReason,
) -> Result<(), Failure> {
    let ownership_id = row.ownership_id.clone();
    let kind = desired_kind(row.subject_kind);
    let subject_id = row.subject_id.clone();
    let generation = row
        .controller_generation
        .ok_or_else(|| Failure::internal("owned controller has no generation"))?;
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.request_owned_herdr_controller_cleanup(
            &ownership_id,
            kind,
            &subject_id,
            generation,
            reason,
        )?;
        Ok(())
    })
    .await
}

/// Turn exact durable controller observations into cleanup eligibility.
/// Unknown, current-running, and record-less owners remain untouched.
async fn observe_controller(
    ctx: &Ctx,
    row: &OwnedHerdrSessionRow,
) -> Result<&'static str, Failure> {
    if row.cleanup_state != OwnedHerdrCleanupState::NotRequested {
        return Ok("already-requested");
    }
    let generation = row
        .controller_generation
        .ok_or_else(|| Failure::internal("owned controller has no generation"))?;
    let kind = desired_kind(row.subject_kind);
    let subject_id = row.subject_id.clone();
    let current = {
        let lookup = subject_id.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.get_desired_work(kind, &lookup)
        })
        .await?
    };
    let Some(current) = current else {
        return Ok("unknown-no-desired-work");
    };
    if current.controller_generation > generation {
        // A later generation can exist only after the desired-work restart
        // fence confirmed this predecessor absent.
        request_controller_cleanup(ctx, row, OwnedHerdrCleanupReason::ControllerDead).await?;
        return Ok("dead-predecessor");
    }
    if current.controller_generation < generation {
        return Ok("unknown-future-generation");
    }
    if current.desired_state == DesiredState::Stopped {
        request_controller_cleanup(ctx, row, OwnedHerdrCleanupReason::ControllerTerminal).await?;
        return Ok("terminal");
    }

    let Some(record) = super::handoff::record_for_generation(ctx, &subject_id, generation).await?
    else {
        // Registered without a durable driver identity is exactly the
        // ambiguous start seam. It is not death evidence and never closes.
        return Ok("unknown-no-controller-record");
    };
    let status = super::handoff::status_for(&record).await;
    match status.get("state").and_then(serde_json::Value::as_str) {
        Some("running") => Ok("running"),
        Some("unknown") | None => Ok("unknown-controller-identity"),
        Some("exited" | "vanished") => {
            let Some(target) = super::handoff::controller_fence_target_for_generation(
                ctx,
                &subject_id,
                generation,
            )
            .await?
            else {
                return Ok("unknown-controller-process-group");
            };
            super::handoff::kill_controller_confirmed(&target).await?;
            request_controller_cleanup(ctx, row, OwnedHerdrCleanupReason::ControllerDead).await?;
            Ok("dead")
        }
        Some(_) => Ok("unknown-controller-state"),
    }
}

fn host_identity(row: &OwnedHerdrSessionRow) -> HerdrSessionIdentity {
    HerdrSessionIdentity::from_durable(
        row.pane_id.clone(),
        PathBuf::from(&row.socket_path),
        row.protocol,
    )
}

/// Reconcile all due durable pane cleanup, independently of runnable desired
/// work. The returned report is observational; cleanup failure never rewrites
/// a terminal attempt or controller result.
pub(crate) async fn reconcile(ctx: &Ctx) -> Result<serde_json::Value, Failure> {
    let controllers = on_ledger(&ctx.ledger, |ledger| {
        ledger.list_unreleased_owned_herdr_controllers()
    })
    .await?;
    let mut observations = Vec::with_capacity(controllers.len());
    for row in controllers {
        let observation = match observe_controller(ctx, &row).await {
            Ok(observation) => serde_json::json!({
                "ownershipId": row.ownership_id,
                "subject": {"kind": row.subject_kind.as_str(), "id": row.subject_id},
                "generation": row.controller_generation,
                "observation": observation,
            }),
            Err(error) => serde_json::json!({
                "ownershipId": row.ownership_id,
                "subject": {"kind": row.subject_kind.as_str(), "id": row.subject_id},
                "generation": row.controller_generation,
                "observation": "attention",
                "error": bounded_error(&error.to_string()),
            }),
        };
        observations.push(observation);
    }

    let now = crate::config::now_iso();
    let due = {
        let now = now.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.list_due_owned_herdr_cleanup(&now, CLEANUP_BATCH)
        })
        .await?
    };
    let mut effects = Vec::with_capacity(due.len());
    for candidate in due {
        let token = format!("herdr-cleanup:{}", uuid::Uuid::now_v7());
        let claimed_at = crate::config::now_iso();
        let lease_until = deadline_after(&claimed_at, CLEANUP_LEASE_SECONDS)?;
        let ownership_id = candidate.ownership_id.clone();
        let claim_token = token.clone();
        let claimed = on_ledger(&ctx.ledger, move |ledger| {
            ledger.claim_owned_herdr_cleanup(&ownership_id, &claim_token, &claimed_at, &lease_until)
        })
        .await?;
        let Some(claimed) = claimed else {
            effects.push(serde_json::json!({
                "ownershipId": candidate.ownership_id,
                "outcome": "contended",
            }));
            continue;
        };

        let identity = host_identity(&claimed);
        let close = match HerdrControl::connect_for(&identity).await {
            Ok(control) => control.close_owned(&identity).await,
            Err(error) => Err(error),
        };
        match close {
            Ok(outcome) => {
                let release = match outcome {
                    HerdrCloseOutcome::Closed => OwnedHerdrCleanupRelease::Closed,
                    HerdrCloseOutcome::AlreadyMissing => OwnedHerdrCleanupRelease::PaneNotFound,
                };
                let ownership_id = claimed.ownership_id.clone();
                let claim_token = token.clone();
                on_ledger(&ctx.ledger, move |ledger| {
                    ledger.ack_owned_herdr_cleanup(&ownership_id, &claim_token, release)?;
                    Ok(())
                })
                .await?;
                effects.push(serde_json::json!({
                    "ownershipId": claimed.ownership_id,
                    "paneId": claimed.pane_id,
                    "outcome": release.as_str(),
                }));
            }
            Err(error) => {
                let detail = bounded_error(&error.to_string());
                let ownership_id = claimed.ownership_id.clone();
                let claim_token = token.clone();
                let retry_at = crate::config::now_iso();
                let retry_detail = detail.clone();
                let retry = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.retry_owned_herdr_cleanup(
                        &ownership_id,
                        &claim_token,
                        &retry_at,
                        &retry_detail,
                    )
                })
                .await?;
                let (outcome, next_wake_at) = match retry {
                    OwnedHerdrCleanupRetry::Scheduled(row) => ("retry-wait", row.next_cleanup_at),
                    OwnedHerdrCleanupRetry::Exhausted(_) => ("attention", None),
                };
                effects.push(serde_json::json!({
                    "ownershipId": claimed.ownership_id,
                    "paneId": claimed.pane_id,
                    "outcome": outcome,
                    "nextWakeAt": next_wake_at,
                    "error": detail,
                }));
            }
        }
    }

    Ok(serde_json::json!({
        "schema": "forged.herdr-cleanup.report/1",
        "observedControllers": observations,
        "considered": effects.len(),
        "effects": effects,
    }))
}

pub(crate) async fn earliest_wake(ctx: &Ctx, now: &str) -> Result<Option<String>, Failure> {
    let now = now.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.earliest_owned_herdr_cleanup_wake(&now)
    })
    .await
}

/// Build the exact controller ownership identity for a prepared Herdr pane.
/// ProcessHost sessions return `None` and never create a migration-014 row.
pub(super) fn controller_identity(
    prepared: &PreparedSession,
    scope: Scope,
    subject_id: &str,
    generation: u32,
) -> Result<Option<OwnedHerdrSessionV1>, Failure> {
    if generation == 0 {
        return Err(Failure::internal(
            "detached controller Herdr ownership requires a non-zero generation",
        ));
    }
    identity(
        prepared,
        OwnedHerdrOwnerV1::Controller {
            subject: OwnedHerdrSubjectV1 {
                kind: match scope {
                    Scope::Run => OwnedHerdrSubjectKind::Run,
                    Scope::Epic => OwnedHerdrSubjectKind::Epic,
                },
                id: subject_id.to_owned(),
            },
            generation,
        },
    )
}

/// Build the exact attempt ownership identity for a prepared Herdr pane.
///
/// Direct foreground drive is intentionally generation-less. A detached
/// controller must publish the complete environment triple; partial,
/// malformed, or mismatched controller context refuses rather than silently
/// downgrading the attempt to direct-drive ownership.
pub(crate) fn attempt_identity(
    prepared: &PreparedSession,
    run_id: &str,
    packet_id: &str,
    attempt_id: i64,
    claim_token: &str,
) -> Result<(Option<OwnedHerdrSessionV1>, Option<u32>), Failure> {
    let (subject, controller_generation) = attempt_subject(run_id)?;
    let identity = identity(
        prepared,
        OwnedHerdrOwnerV1::Attempt {
            subject,
            run_id: run_id.to_owned(),
            packet_id: packet_id.to_owned(),
            attempt_id,
            claim_token: claim_token.to_owned(),
            controller_generation,
        },
    )?;
    Ok((identity, controller_generation))
}

/// Exact work subject that owns a provider attempt. Detached epic children
/// inherit their epic controller subject; direct drives remain run-scoped.
pub(crate) fn attempt_subject(run_id: &str) -> Result<(OwnedHerdrSubjectV1, Option<u32>), Failure> {
    let context = super::handoff::controller_context_for_attempt(run_id)?;
    Ok(match context {
        Some((scope, id, generation)) => (
            OwnedHerdrSubjectV1 {
                kind: match scope {
                    Scope::Run => OwnedHerdrSubjectKind::Run,
                    Scope::Epic => OwnedHerdrSubjectKind::Epic,
                },
                id,
            },
            Some(generation),
        ),
        None => (
            OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: run_id.to_owned(),
            },
            None,
        ),
    })
}

fn identity(
    prepared: &PreparedSession,
    owner: OwnedHerdrOwnerV1,
) -> Result<Option<OwnedHerdrSessionV1>, Failure> {
    let Some(herdr) = prepared.herdr_identity() else {
        return Ok(None);
    };
    let ownership_id = ownership_id(&owner)?;
    Ok(Some(OwnedHerdrSessionV1 {
        schema: OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
        ownership_id,
        owner,
        pane_id: herdr.pane_id().to_owned(),
        socket_path: herdr.socket_path().to_string_lossy().into_owned(),
        protocol: herdr.protocol(),
        sentinel_path: prepared.sentinel_path().to_string_lossy().into_owned(),
        layout_id: prepared.herdr_layout_id().map(str::to_owned),
    }))
}

fn ownership_id(owner: &OwnedHerdrOwnerV1) -> Result<String, Failure> {
    let owner_bytes = serde_json::to_vec(owner)
        .map_err(|error| Failure::internal(format!("serializing Herdr owner: {error}")))?;
    Ok(uuid::Uuid::new_v5(&uuid::Uuid::NAMESPACE_OID, &owner_bytes).to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use forged_ledger::{Ledger, NewPacket, NewRun, OwnedHerdrCleanupState, SpecFence};
    use forged_types::{RunId, Stage};
    use serde_json::{json, Value};
    use std::collections::{BTreeMap, HashMap};
    use std::sync::{Arc, Mutex};
    use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
    use tokio::net::UnixListener;

    fn config(root: &std::path::Path) -> crate::config::ForgedConfig {
        crate::config::ForgedConfig {
            anvil_home: root.to_path_buf(),
            runs_root: root.join("runs"),
            db_path: root.join("state.db"),
            config_path: root.join("config.json"),
            config_file_read: false,
            roster: HashMap::new(),
            profiles: BTreeMap::new(),
            rosters: BTreeMap::new(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: Vec::new(),
            stage_budget_s: HashMap::new(),
            transport_retry_budget: 3,
            bd_path: root.join("bd"),
            beads_dir: root.join("beads"),
            codex_home: root.join("codex"),
            host_policy: crate::config::HostPolicy::Off,
            herdr_sock: None,
            pricing: crate::pricing::default_rate_card(),
            admission: crate::config::AdmissionPolicy::default(),
        }
    }

    async fn cleanup_server(socket: &std::path::Path) -> Arc<Mutex<Vec<String>>> {
        let listener = UnixListener::bind(socket).expect("bind cleanup socket");
        let methods = Arc::new(Mutex::new(Vec::new()));
        let recorded = Arc::clone(&methods);
        tokio::spawn(async move {
            while let Ok((stream, _)) = listener.accept().await {
                let recorded = Arc::clone(&recorded);
                tokio::spawn(async move {
                    let (read, mut write) = stream.into_split();
                    let mut lines = BufReader::new(read).lines();
                    let Ok(Some(line)) = lines.next_line().await else {
                        return;
                    };
                    let request: Value = serde_json::from_str(&line).expect("request json");
                    let id = request["id"].as_str().expect("request id");
                    let method = request["method"].as_str().expect("method").to_owned();
                    recorded.lock().expect("methods lock").push(method.clone());
                    let result = match method.as_str() {
                        "ping" => json!({
                            "type": "pong",
                            "version": "test",
                            "protocol": 19,
                            "capabilities": {},
                        }),
                        "pane.close" => json!({"type": "ok"}),
                        other => panic!("unexpected cleanup request {other}"),
                    };
                    let response = format!("{}\n", json!({"id": id, "result": result}));
                    write
                        .write_all(response.as_bytes())
                        .await
                        .expect("write response");
                });
            }
        });
        methods
    }

    async fn loss_then_missing_server(socket: &std::path::Path) -> Arc<Mutex<Vec<String>>> {
        let listener = UnixListener::bind(socket).expect("bind cleanup socket");
        let methods = Arc::new(Mutex::new(Vec::new()));
        let recorded = Arc::clone(&methods);
        tokio::spawn(async move {
            while let Ok((stream, _)) = listener.accept().await {
                let recorded = Arc::clone(&recorded);
                tokio::spawn(async move {
                    let (read, mut write) = stream.into_split();
                    let mut lines = BufReader::new(read).lines();
                    let Ok(Some(line)) = lines.next_line().await else {
                        return;
                    };
                    let request: Value = serde_json::from_str(&line).expect("request json");
                    let id = request["id"].as_str().expect("request id");
                    let method = request["method"].as_str().expect("method").to_owned();
                    let close_number = {
                        let mut methods = recorded.lock().expect("methods lock");
                        methods.push(method.clone());
                        methods
                            .iter()
                            .filter(|candidate| candidate.as_str() == "pane.close")
                            .count()
                    };
                    let frame = match method.as_str() {
                        "ping" => json!({
                            "id": id,
                            "result": {
                                "type": "pong",
                                "version": "test",
                                "protocol": 19,
                                "capabilities": {},
                            },
                        }),
                        "pane.close" if close_number == 1 => return,
                        "pane.close" => json!({
                            "id": id,
                            "error": {"code": "pane_not_found", "message": "gone"},
                        }),
                        other => panic!("unexpected cleanup request {other}"),
                    };
                    write
                        .write_all(format!("{frame}\n").as_bytes())
                        .await
                        .expect("write response");
                });
            }
        });
        methods
    }

    fn seed_terminal_attempt(
        ledger: &Ledger,
        socket: &std::path::Path,
        ownership_id: &str,
    ) -> OwnedHerdrSessionV1 {
        let run_id = format!("{ownership_id}-run");
        ledger
            .create_run(NewRun {
                run_id: RunId::new(&run_id).expect("run id"),
                bead_id: format!("bead-{ownership_id}"),
                repo: "/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: format!("work/{ownership_id}"),
            })
            .expect("run");
        let packet = ledger
            .open_packet(NewPacket {
                run_id: run_id.clone(),
                stage: Stage::Implement,
                seq: 1,
                spec_path: "spec.md".to_owned(),
                spec_sha256: "spec".to_owned(),
                spec_revision: None,
                body_json: "{}".to_owned(),
            })
            .expect("packet");
        let attempt = ledger
            .claim_packet(
                &packet,
                "provider:test",
                &SpecFence::Sha256("spec".to_owned()),
            )
            .expect("claim");
        let identity = OwnedHerdrSessionV1 {
            schema: OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
            ownership_id: ownership_id.to_owned(),
            owner: OwnedHerdrOwnerV1::Attempt {
                subject: OwnedHerdrSubjectV1 {
                    kind: OwnedHerdrSubjectKind::Run,
                    id: run_id.clone(),
                },
                run_id,
                packet_id: packet.clone(),
                attempt_id: attempt.attempt_id,
                claim_token: attempt.claim_token.clone(),
                controller_generation: None,
            },
            pane_id: format!("opaque:{ownership_id}"),
            socket_path: socket.to_string_lossy().into_owned(),
            protocol: 19,
            sentinel_path: format!("/tmp/exact/{ownership_id}/status"),
            layout_id: None,
        };
        ledger
            .register_owned_herdr_session(&identity)
            .expect("register");
        ledger
            .mark_owned_herdr_command_started(&identity.ownership_id)
            .expect("started");
        ledger
            .fail_packet(&packet, &attempt.claim_token, "settled result")
            .expect("settle");
        identity
    }

    #[test]
    fn owner_identity_is_deterministic_and_epoch_scoped() {
        assert_eq!(
            OWNED_HERDR_SESSION_SCHEMA_V1,
            "forged.owned-herdr-session/1"
        );
        let owner = OwnedHerdrOwnerV1::Controller {
            subject: OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: "run-1".to_owned(),
            },
            generation: 2,
        };
        assert_eq!(ownership_id(&owner).unwrap(), ownership_id(&owner).unwrap());
        let next = OwnedHerdrOwnerV1::Controller {
            subject: OwnedHerdrSubjectV1 {
                kind: OwnedHerdrSubjectKind::Run,
                id: "run-1".to_owned(),
            },
            generation: 3,
        };
        assert_ne!(ownership_id(&owner).unwrap(), ownership_id(&next).unwrap());
    }

    #[tokio::test]
    async fn supervisor_tick_cleans_a_terminal_attempt_with_no_desired_work() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let methods = cleanup_server(&socket).await;
        let ledger = Ledger::open(&root.path().join("state.db")).expect("ledger");
        ledger
            .create_run(NewRun {
                run_id: RunId::new("cleanup-run").expect("run id"),
                bead_id: "bead-cleanup".to_owned(),
                repo: "/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: "work/cleanup".to_owned(),
            })
            .expect("run");
        let packet = ledger
            .open_packet(NewPacket {
                run_id: "cleanup-run".to_owned(),
                stage: Stage::Implement,
                seq: 1,
                spec_path: "spec.md".to_owned(),
                spec_sha256: "spec".to_owned(),
                spec_revision: None,
                body_json: "{}".to_owned(),
            })
            .expect("packet");
        let attempt = ledger
            .claim_packet(
                &packet,
                "provider:test",
                &SpecFence::Sha256("spec".to_owned()),
            )
            .expect("claim");
        let identity = OwnedHerdrSessionV1 {
            schema: OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
            ownership_id: "cleanup-owner".to_owned(),
            owner: OwnedHerdrOwnerV1::Attempt {
                subject: OwnedHerdrSubjectV1 {
                    kind: OwnedHerdrSubjectKind::Run,
                    id: "cleanup-run".to_owned(),
                },
                run_id: "cleanup-run".to_owned(),
                packet_id: packet.clone(),
                attempt_id: attempt.attempt_id,
                claim_token: attempt.claim_token.clone(),
                controller_generation: None,
            },
            pane_id: "opaque:$ pane/1".to_owned(),
            socket_path: socket.to_string_lossy().into_owned(),
            protocol: 19,
            sentinel_path: root
                .path()
                .join("exact unsafe $ path/status")
                .to_string_lossy()
                .into_owned(),
            layout_id: None,
        };
        ledger
            .register_owned_herdr_session(&identity)
            .expect("register");
        ledger
            .mark_owned_herdr_command_started(&identity.ownership_id)
            .expect("started");
        ledger
            .fail_packet(&packet, &attempt.claim_token, "done")
            .expect("terminal settlement");
        let ctx = Ctx {
            config: config(root.path()),
            ledger: ledger.clone(),
        };

        let mut settlement = super::super::supervise::BeadSettlementPass::new();
        let report = super::super::supervise::tick(&ctx, &mut settlement, true)
            .await
            .expect("tick");
        assert!(report["subjects"].as_array().expect("subjects").is_empty());
        assert_eq!(report["cleanup"]["effects"][0]["outcome"], "closed");
        assert_eq!(report["nextWakeAt"], Value::Null);
        assert_eq!(
            ledger
                .get_owned_herdr_session(&identity.ownership_id)
                .expect("get")
                .expect("owned")
                .cleanup_state,
            OwnedHerdrCleanupState::Released
        );
        assert_eq!(
            methods.lock().expect("methods lock").as_slice(),
            ["ping", "pane.close"]
        );
    }

    #[tokio::test]
    async fn recordless_controller_is_not_closed_until_a_later_generation_proves_it_dead() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let methods = cleanup_server(&socket).await;
        let ledger = Ledger::open(&root.path().join("state.db")).expect("ledger");
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, "controller-run", 1)
            .expect("generation one");
        let identity = OwnedHerdrSessionV1 {
            schema: OWNED_HERDR_SESSION_SCHEMA_V1.to_owned(),
            ownership_id: "controller-owner-1".to_owned(),
            owner: OwnedHerdrOwnerV1::Controller {
                subject: OwnedHerdrSubjectV1 {
                    kind: OwnedHerdrSubjectKind::Run,
                    id: "controller-run".to_owned(),
                },
                generation: 1,
            },
            pane_id: "opaque-controller-pane".to_owned(),
            socket_path: socket.to_string_lossy().into_owned(),
            protocol: 19,
            sentinel_path: root
                .path()
                .join("controller exact/status")
                .to_string_lossy()
                .into_owned(),
            layout_id: None,
        };
        ledger
            .register_owned_herdr_session(&identity)
            .expect("register controller");
        ledger
            .mark_owned_herdr_command_started(&identity.ownership_id)
            .expect("started");
        let ctx = Ctx {
            config: config(root.path()),
            ledger: ledger.clone(),
        };

        let unknown = reconcile(&ctx).await.expect("unknown pass");
        assert_eq!(
            unknown["observedControllers"][0]["observation"],
            "unknown-no-controller-record"
        );
        assert!(methods.lock().expect("methods lock").is_empty());
        assert_eq!(
            ledger
                .get_owned_herdr_session(&identity.ownership_id)
                .expect("get")
                .expect("row")
                .cleanup_state,
            OwnedHerdrCleanupState::NotRequested
        );

        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, "controller-run", 2)
            .expect("later confirmed-dead generation");
        let cleaned = reconcile(&ctx).await.expect("cleanup pass");
        assert_eq!(cleaned["effects"][0]["outcome"], "closed");
        assert_eq!(
            methods.lock().expect("methods lock").as_slice(),
            ["ping", "pane.close"]
        );
        assert_eq!(
            ledger
                .get_owned_herdr_session(&identity.ownership_id)
                .expect("get")
                .expect("row")
                .cleanup_state,
            OwnedHerdrCleanupState::Released
        );
    }

    #[tokio::test]
    async fn lost_close_response_retries_then_exact_missing_converges() {
        let root = tempfile::tempdir().expect("tempdir");
        let socket = root.path().join("herdr.sock");
        let methods = loss_then_missing_server(&socket).await;
        let ledger = Ledger::open(&root.path().join("state.db")).expect("ledger");
        let identity = seed_terminal_attempt(&ledger, &socket, "loss-owner");
        let ctx = Ctx {
            config: config(root.path()),
            ledger: ledger.clone(),
        };

        let first = reconcile(&ctx).await.expect("lost-response pass");
        assert_eq!(first["effects"][0]["outcome"], "retry-wait");
        assert_eq!(
            ledger
                .get_owned_herdr_session(&identity.ownership_id)
                .expect("get")
                .expect("row")
                .cleanup_state,
            OwnedHerdrCleanupState::RetryWait
        );
        tokio::time::sleep(std::time::Duration::from_millis(1_100)).await;
        let second = reconcile(&ctx).await.expect("missing pass");
        assert_eq!(second["effects"][0]["outcome"], "pane-not-found");
        assert_eq!(
            ledger
                .get_owned_herdr_session(&identity.ownership_id)
                .expect("get")
                .expect("row")
                .cleanup_state,
            OwnedHerdrCleanupState::Released
        );
        assert_eq!(
            methods.lock().expect("methods lock").as_slice(),
            ["ping", "pane.close", "ping", "pane.close"]
        );
    }
}
