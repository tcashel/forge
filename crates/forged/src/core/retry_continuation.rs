//! Reuse one completed implementation after a first-push interruption or a
//! pre-review gate failure. A successor always gathers fresh assurance.
//! Missing or changed evidence leaves the successor on its ordinary path.
//! The Resolve result references the original attempt; no successor packet
//! or completion is invented, and every successor gate still runs.

use forged_ledger::{AttemptState, OperationState, RunOutcome, RunRow, RunState};
use forged_proto::{machine_idempotency_key, MachineStage, ProtoEvent, RunView};
use forged_types::{ExecutionPackageV1, Outcome, SeatPurpose, Stage};
use serde_json::{json, Value};

use super::{on_ledger, spec, work_types::IssueSummary, Ctx, Failure};

pub(super) async fn resolve(
    ctx: &Ctx,
    run: &RunRow,
    claimed: &IssueSummary,
) -> Result<Option<Value>, Failure> {
    let run_id = run.run_id.clone();
    let Some(authorization) = on_ledger(&ctx.ledger, move |ledger| {
        ledger.latest_event_of_kind(&run_id, "forged.run.retry.authorized")
    })
    .await?
    else {
        return Ok(None);
    };
    let authorization: Value = serde_json::from_str(&authorization.payload_json)
        .map_err(|error| Failure::internal(format!("retry authorization: {error}")))?;
    if authorization.get("because").and_then(Value::as_str) != Some("world-changed") {
        return Ok(None);
    }
    let Some(source_id) = authorization.get("retryOf").and_then(Value::as_str) else {
        return Ok(None);
    };
    if source_id == run.run_id {
        return Ok(None);
    }
    let run_id = run.run_id.clone();
    let Some(definition) = on_ledger(&ctx.ledger, move |ledger| {
        ledger.get_run_definition(&run_id)
    })
    .await?
    else {
        return Ok(None);
    };
    let Some(start) = definition.started_from else {
        return Ok(None);
    };
    if authorization.get("startedFrom") != Some(&json!(start)) {
        return Ok(None);
    }
    let current = super::drive::project(ctx, &run.run_id).await?;
    let source = super::drive::project(ctx, source_id).await?;
    let source_key = source_id.to_owned();
    let (definition, terminal) = on_ledger(&ctx.ledger, move |ledger| {
        Ok((
            ledger.get_run_definition(&source_key)?,
            ledger.latest_event_of_kind(&source_key, "run.protocol-terminal")?,
        ))
    })
    .await?;
    let original: Option<ExecutionPackageV1> = definition
        .map(|row| serde_json::from_str(&row.package_json))
        .transpose()
        .map_err(|error| Failure::internal(format!("source execution package: {error}")))?;
    let terminal: Option<Value> = terminal
        .map(|row| serde_json::from_str(&row.payload_json))
        .transpose()
        .map_err(|error| Failure::internal(format!("source protocol terminal: {error}")))?;
    let gate_retry = pre_review_gate_terminal(&source, terminal.as_ref());
    let Some(mut proof) = implementation_evidence(
        &source,
        &current,
        claimed,
        &authorization,
        &start.sha,
        original.as_ref(),
        gate_retry,
    )?
    else {
        return Ok(None);
    };
    let worktree = ctx.config.worktree(&run.run_id);
    let tracking = format!("refs/remotes/origin/{}", run.base_ref);
    let Some(base_sha) = git_read(&worktree, &["rev-parse", "--verify", &tracking]).await else {
        return Ok(None);
    };
    if proof.get("baseSha").and_then(Value::as_str) != Some(base_sha.trim())
        || git_read(&worktree, &["rev-parse", "--verify", "HEAD"])
            .await
            .as_deref()
            .map(str::trim)
            != Some(start.sha.as_str())
        || git_read(
            &worktree,
            &["status", "--porcelain=v1", "--untracked-files=all"],
        )
        .await
        .as_deref()
            != Some("")
    {
        return Ok(None);
    }
    if gate_retry {
        let source_tree = ctx.config.worktree(source_id);
        if git_read(&source_tree, &["rev-parse", "--verify", "HEAD"])
            .await
            .as_deref()
            .map(str::trim)
            != Some(start.sha.as_str())
            || git_read(
                &source_tree,
                &["status", "--porcelain=v1", "--untracked-files=all"],
            )
            .await
            .as_deref()
                != Some("")
        {
            return Ok(None);
        }
    }
    proof["headSha"] = json!(start.sha);
    Ok(Some(proof))
}

async fn git_read(worktree: &std::path::Path, args: &[&str]) -> Option<String> {
    let output = tokio::process::Command::new("git")
        .arg("-C")
        .arg(worktree)
        .args(args)
        .stdin(std::process::Stdio::null())
        .output()
        .await
        .ok()?;
    output
        .status
        .success()
        .then(|| String::from_utf8_lossy(&output.stdout).into_owned())
}

fn settled_result(view: &RunView, stage: MachineStage) -> Option<Value> {
    let key = machine_idempotency_key(&view.run.run_id, stage, 0);
    let row = view.settled_operations.iter().find(|row| {
        row.name == stage.as_str()
            && row.idempotency_key == key
            && row.state == OperationState::Terminal
    })?;
    let response: Value = serde_json::from_str(row.response_json.as_deref()?).ok()?;
    (response.get("ok").and_then(Value::as_bool) == Some(true))
        .then(|| response.get("result").cloned())?
}

fn implementation_evidence(
    source: &RunView,
    current: &RunView,
    claimed: &IssueSummary,
    authorization: &Value,
    head: &str,
    original: Option<&ExecutionPackageV1>,
    gate_retry: bool,
) -> Result<Option<Value>, Failure> {
    if source.run.state != RunState::Stopped
        || source.run.repo != current.run.repo
        || source.run.work_id != current.run.work_id
        || source.run.base_ref != current.run.base_ref
        || !source.live_attempts.is_empty()
        || !source.inflight_operations.is_empty()
        || !source.profile_escalations.is_empty()
        || !current.profile_escalations.is_empty()
        || !original_contract(current)
        || !current.packets.is_empty()
        || !source.execution_package.as_ref().is_some_and(|package| {
            package.protocol_ref.name == "slice" && package.protocol_ref.version == 1
        })
    {
        return Ok(None);
    }
    if gate_retry {
        if !original_roster(source)
            || source.active_policy_revision.is_none()
            || !original.is_some_and(|original| {
                [&source.execution_package, &current.execution_package]
                    .into_iter()
                    .all(|package| {
                        package.as_ref().is_some_and(|package| {
                            let mut compared = package.clone();
                            compared
                                .policy
                                .gate_commands
                                .clone_from(&original.policy.gate_commands);
                            &compared == original
                        })
                    })
            })
        {
            return Ok(None);
        }
    } else if source.run.terminal_outcome.is_some()
        || !source
            .run
            .stop_reason
            .as_deref()
            .is_some_and(|reason| reason.starts_with("input-required: git push "))
        || !original_contract(source)
        || source.execution_package != current.execution_package
        || source.packets.len() != 1
    {
        return Ok(None);
    }
    let mut implementations = source
        .packets
        .iter()
        .filter(|packet| packet.stage == Stage::Implement);
    let Some(packet) = implementations.next() else {
        return Ok(None);
    };
    if implementations.next().is_some() {
        return Ok(None);
    }
    let stored = forged_proto::project::stored_packet(packet)
        .map_err(|error| Failure::internal(format!("source implementation packet: {error}")))?;
    if packet.stage != Stage::Implement
        || packet.policy_revision != Some(1)
        || !stored.execution.is_some_and(|execution| {
            execution.purpose == SeatPurpose::Implement && execution.round == 0
        })
        || claimed.id != current.run.work_id
        || claimed.revision.is_none()
        || packet.spec_revision != claimed.revision
        || authorization.get("revision") != Some(&json!(claimed.revision))
    {
        return Ok(None);
    }
    // `claimed` is the snapshot returned in the same transaction that took
    // the successor's work lease, replacing the skipped packet's spec check.
    let resolved = spec::resolve_issue(claimed)?;
    if packet.spec_sha256 != resolved.sha256 {
        return Ok(None);
    }
    if gate_retry
        && !source
            .packets
            .iter()
            .filter(|row| row.packet_id != packet.packet_id)
            .all(|row| {
                row.stage == Stage::Fix
                    && row.spec_revision == packet.spec_revision
                    && row.spec_sha256 == packet.spec_sha256
                    && forged_proto::project::stored_packet(row)
                        .ok()
                        .and_then(|stored| stored.execution)
                        .is_some_and(|execution| execution.purpose == SeatPurpose::Fix)
                    && source
                        .terminal_attempts
                        .get(&row.packet_id)
                        .and_then(|attempts| attempts.last())
                        .is_some_and(|attempt| {
                            attempt.state == AttemptState::Completed
                                && matches!(
                                    attempt.outcome,
                                    Some(Outcome::Fix { applied: false, .. })
                                )
                        })
            })
    {
        return Ok(None);
    }
    let Some(attempt) = source
        .terminal_attempts
        .get(&packet.packet_id)
        .and_then(|attempts| attempts.last())
    else {
        return Ok(None);
    };
    if attempt.state != AttemptState::Completed
        || !matches!(
            attempt.outcome,
            Some(Outcome::Implement {
                implemented: true,
                commits_ahead: 1..,
                ..
            })
        )
    {
        return Ok(None);
    }
    let push_key = machine_idempotency_key(&source.run.run_id, MachineStage::Push, 0);
    let push_head = source.proto_events.iter().find_map(|event| match event {
        ProtoEvent::OperationRequest {
            name,
            idempotency_key,
            request,
            ..
        } if name == "push" && idempotency_key == &push_key => {
            request.params.get("expectedSha").and_then(Value::as_str)
        }
        _ => None,
    });
    let gate_result = settled_result(source, MachineStage::Gate);
    if (!gate_retry && push_head != Some(head))
        || (gate_retry
            && (gate_result.as_ref().and_then(|result| result.get("passed"))
                != Some(&json!(false))
                || source.proto_events.iter().any(|event| {
                    matches!(event,
                ProtoEvent::OperationRequest { name, .. } if name == "push")
                })))
        || source.proto_events.iter().any(
            |event| matches!(event, ProtoEvent::OperationRequest { name, .. } if name == "draftpr"),
        )
        || gate_result
            .and_then(|result| {
                result
                    .get("headSha")
                    .and_then(Value::as_str)
                    .map(str::to_owned)
            })
            .as_deref()
            != Some(head)
    {
        return Ok(None);
    }
    let Some(base_sha) = settled_result(source, MachineStage::Resolve)
        .and_then(|result| {
            result
                .get("baseSha")
                .and_then(Value::as_str)
                .map(str::to_owned)
        })
        .filter(|sha| !sha.is_empty())
    else {
        return Ok(None);
    };
    Ok(Some(json!({
        "sourceRunId": source.run.run_id,
        "sourcePacketId": packet.packet_id,
        "sourceAttemptId": attempt.attempt_id,
        "headSha": head,
        "baseSha": base_sha,
        "workRevision": claimed.revision,
        "specSha256": resolved.sha256,
    })))
}

// Run creation writes revision 1 for both contracts. Only later rows are
// operator amendments; absence is legacy evidence, not an original contract.
fn original_contract(view: &RunView) -> bool {
    view.active_policy_revision
        .as_ref()
        .is_some_and(|row| row.revision == 1 && row.reason == "run-created")
        && original_roster(view)
}

fn original_roster(view: &RunView) -> bool {
    view.active_roster_revision
        .as_ref()
        .is_some_and(|row| row.revision == 1 && row.reason == "run-created")
}

fn pre_review_gate_terminal(source: &RunView, event: Option<&Value>) -> bool {
    if source.run.terminal_outcome != Some(RunOutcome::Blocked) {
        return false;
    }
    let Some(event) = event.filter(|event| event.get("schemaVersion") == Some(&json!(1))) else {
        return false;
    };
    let terminal = event
        .pointer("/terminal/remediationFailed")
        .filter(|value| {
            value
                .get("round")
                .and_then(Value::as_u64)
                .is_some_and(|round| round > 0)
        })
        .or_else(|| {
            event
                .pointer("/terminal/reviewBudgetExhausted")
                .filter(|value| value.get("reviewRounds") == Some(&json!(0)))
        });
    terminal.is_some_and(|value| {
        value.get("finalVerdict") == Some(&Value::Null)
            && value
                .get("finalVerdictDurable")
                .is_none_or(|value| value == &json!(false))
            && value
                .get("failedReviewSeats")
                .is_none_or(|value| value == &json!(0))
    })
}
