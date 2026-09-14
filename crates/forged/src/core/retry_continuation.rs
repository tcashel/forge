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

const HANDOFF_LIMIT: usize = 4096;
const HANDOFF_HEADER: &str = "Historical retry evidence only. The successor's current spec, code and check contract take precedence. Recheck applicable findings; fresh required gates and independent review still run. Prior passes or verdicts are not current validation.\n";
const HANDOFF_OMITTED: &str = "\n[Further predecessor evidence omitted at 4096 bytes; inspect the source run's packet/attempt and gate artifacts as needed.]";

/// Prompt context, never engine input. Read only the immediate authorized
/// predecessor; missing legacy evidence must not prevent an otherwise valid
/// retry. The attempt's existing prompt artifact freezes the rendered note.
pub(super) async fn handoff(ctx: &Ctx, current: &RunView) -> Option<String> {
    let id = current.run.run_id.clone();
    let authorization = match on_ledger(&ctx.ledger, move |ledger| {
        ledger.latest_event_of_kind(&id, "forged.run.retry.authorized")
    })
    .await
    {
        Ok(None) => return None,
        Ok(Some(row)) => serde_json::from_str::<Value>(&row.payload_json).ok(),
        Err(_) => None,
    };
    let Some(authorization) = authorization else {
        return Some(bounded_handoff("Retry provenance unavailable.".to_owned()));
    };
    let Some(source_id) = authorization.get("retryOf").and_then(Value::as_str) else {
        return Some(bounded_handoff("Retry source unknown.".to_owned()));
    };
    let source_key = source_id.to_owned();
    let source_run = on_ledger(&ctx.ledger, move |ledger| ledger.get_run(&source_key))
        .await
        .ok();
    let Some(source_run) = source_run else {
        return Some(bounded_handoff(format!(
            "Source run {source_id}: evidence unavailable."
        )));
    };
    if !handoff_lineage(&current.run, &source_run, &authorization) {
        return Some(bounded_handoff(
            "Predecessor evidence withheld: repository/work retry lineage mismatch.".to_owned(),
        ));
    }
    let source = match super::drive::project(ctx, source_id).await {
        Ok(source)
            if source.run.state == RunState::Stopped
                && source.live_attempts.is_empty()
                && source.inflight_operations.is_empty() =>
        {
            source
        }
        _ => {
            return Some(bounded_handoff(format!(
                "Source run {source_id}: settled evidence unavailable."
            )))
        }
    };
    let source_key = source_id.to_owned();
    let artifacts = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_attempt_artifacts(&source_key)
    })
    .await
    .unwrap_or_default();
    Some(render_handoff(
        &source,
        &authorization,
        &artifacts,
        &ctx.config.run_dir(source_id),
    ))
}

fn handoff_lineage(current: &RunRow, source: &RunRow, authorization: &Value) -> bool {
    source.run_id != current.run_id
        && source.repo == current.repo
        && source.work_id == current.work_id
        && authorization.get("retryOf").and_then(Value::as_str) == Some(source.run_id.as_str())
        && authorization.get("runId").and_then(Value::as_str) == Some(current.run_id.as_str())
        && authorization.get("workId").and_then(Value::as_str) == Some(current.work_id.as_str())
}

fn bounded_handoff(body: String) -> String {
    let mut note = format!("{HANDOFF_HEADER}{body}");
    if note.len() > HANDOFF_LIMIT {
        let mut end = HANDOFF_LIMIT - HANDOFF_OMITTED.len();
        while !note.is_char_boundary(end) {
            end -= 1;
        }
        note.truncate(end);
        note.push_str(HANDOFF_OMITTED);
    }
    note
}

fn render_handoff(
    source: &RunView,
    authorization: &Value,
    artifacts: &[forged_ledger::AttemptArtifactRow],
    source_dir: &std::path::Path,
) -> String {
    let mut provenance = vec![format!(
        "Source run {}; artifacts={}. Successor recorded start: {}.\n",
        source.run.run_id,
        source_dir.display(),
        authorization.get("startedFrom").unwrap_or(&Value::Null)
    )];
    let mut metadata = Vec::new();
    let mut details = Vec::new();
    let reviews: Vec<_> = source
        .packets
        .iter()
        .filter_map(|row| {
            let packet = forged_proto::stored_packet(row).ok()?;
            let round = match &packet.execution {
                Some(execution)
                    if matches!(
                        execution.purpose,
                        SeatPurpose::Review | SeatPurpose::Synthesis
                    ) =>
                {
                    i64::from(execution.round)
                }
                None if matches!(row.stage, Stage::ReviewClaude | Stage::ReviewCodex) => row.seq,
                _ => return None,
            };
            let attempt = source
                .terminal_attempts
                .get(&row.packet_id)
                .and_then(|history| {
                    history
                        .iter()
                        .rev()
                        .find(|attempt| attempt.state == AttemptState::Completed)
                });
            Some((row, packet, round, attempt))
        })
        .collect();
    let latest_opened = reviews.iter().map(|(_, _, round, _)| *round).max();
    let latest_available = reviews
        .iter()
        .filter_map(|(_, _, round, attempt)| {
            matches!(
                attempt.and_then(|attempt| attempt.outcome.as_ref()),
                Some(Outcome::Review {
                    available: true,
                    ..
                })
            )
            .then_some(*round)
        })
        .max();
    if latest_opened > latest_available {
        provenance.push(format!("Latest opened review round {} is incomplete/unavailable; completed available evidence round={}.\n",
            latest_opened.unwrap(), latest_available.map_or_else(|| "none".to_owned(), |round| round.to_string())));
    }
    let round = latest_available.or(latest_opened);
    let mut reviews: Vec<_> = reviews
        .into_iter()
        .filter(|(_, _, candidate, _)| Some(*candidate) == round)
        .collect();
    reviews.sort_by(|(a, _, _, _), (b, _, _, _)| a.packet_id.cmp(&b.packet_id));
    if reviews.is_empty() {
        metadata.push("Review evidence unavailable.\n".to_owned());
    }
    for (row, packet, round, attempt) in reviews {
        details.push(format!("Review packet {} round {round}; source spec sha256={}; review head association=unknown (not recorded).\n",
            row.packet_id, row.spec_sha256));
        metadata.push(format!(
            "Review packet {} recorded gate contract={}.\n",
            row.packet_id,
            json!(packet.contract.gate_commands)
        ));
        if let Some((
            attempt,
            Outcome::Review {
                verdict,
                findings,
                available,
                ..
            },
        )) =
            attempt.and_then(|attempt| attempt.outcome.as_ref().map(|outcome| (attempt, outcome)))
        {
            let artifact = artifacts.iter().find(|artifact| {
                artifact.attempt_id == attempt.attempt_id
                    && artifact.packet_id == row.packet_id
                    && artifact.run_id == source.run.run_id
            });
            details.push(if *available {
                format!(
                    "Attempt {}; historical verdict={}; available=true.\n",
                    attempt.attempt_id,
                    json!(verdict)
                )
            } else {
                format!(
                    "Attempt {}; available=false; no valid review verdict.\n",
                    attempt.attempt_id
                )
            });
            metadata.push(format!(
                "Attempt {}: {}.\n",
                attempt.attempt_id,
                artifact
                    .map(|artifact| format!(
                        "manifest={} sha256={}",
                        source_dir.join(&artifact.manifest_path).display(),
                        artifact.manifest_sha256
                    ))
                    .unwrap_or_else(|| "artifact reference unavailable".to_owned())
            ));
            if *available {
                details.extend(findings.iter().map(|finding| {
                    format!(
                        "Review finding (packet {}, attempt {}): {}\n",
                        row.packet_id,
                        attempt.attempt_id,
                        json!(finding)
                    )
                }));
            }
        } else {
            metadata.push("Completed review result unavailable.\n".to_owned());
        }
    }
    // Gate responses bind the actual executed rows to their recorded head.
    // Source HEAD and its currently overlaid policy may have changed since.
    if let Some(operation) = source
        .settled_operations
        .iter()
        .filter(|operation| {
            matches!(operation.name.as_str(), "gate" | "regate")
                && operation.state == OperationState::Terminal
        })
        .max_by(|a, b| (&a.created_at, &a.operation_id).cmp(&(&b.created_at, &b.operation_id)))
    {
        let response = operation
            .response_json
            .as_deref()
            .and_then(|raw| serde_json::from_str::<Value>(raw).ok());
        let result = response
            .as_ref()
            .filter(|response| response.get("ok") == Some(&json!(true)))
            .and_then(|response| response.get("result"));
        let head = result
            .and_then(|result| result.get("headSha"))
            .and_then(Value::as_str)
            .filter(|head| !head.is_empty())
            .unwrap_or("unknown");
        provenance.push(format!(
            "Gate operation {} ({}); recorded gate head={head}; historical passed={}.\n",
            operation.operation_id,
            operation.idempotency_key,
            result
                .and_then(|result| result.get("passed"))
                .unwrap_or(&Value::Null)
        ));
        if let Some(rows) = result
            .and_then(|result| result.get("gates"))
            .and_then(|rows| {
                serde_json::from_value::<Vec<forged_types::GateRow>>(rows.clone()).ok()
            })
        {
            metadata.push(format!("Executed commands/status: {}\n", json!(rows.iter().map(|row| json!({"command": row.command, "exit": row.exit_code, "timedOut": row.timed_out})).collect::<Vec<_>>())));
            // Reference one useful existing log, never copy unstructured
            // stdout/stderr into a new provider prompt.
            if let Some(row) = rows
                .iter()
                .find(|row| row.timed_out || row.exit_code != Some(0))
                .or_else(|| rows.first())
            {
                metadata.push(format!(
                    "Gate artifact={} (other logs remain with this source operation).\n",
                    row.artifact_path
                ));
            }
        } else {
            metadata.push("Executed command evidence unavailable.\n".to_owned());
        }
    } else {
        provenance.push("Gate evidence unavailable; recorded gate head=unknown.\n".to_owned());
    }
    // Keep actionable findings ahead of potentially large command/path
    // metadata. Source identity and artifact root survive truncation.
    provenance.extend(details);
    provenance.extend(metadata);
    bounded_handoff(provenance.concat())
}

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

#[cfg(test)]
mod handoff_tests {
    use super::*;
    use forged_ledger::{EffectClass, Ledger, NewPacket, NewRun, OperationRow, SpecFence};
    use forged_types::{Finding, PacketResult, RunId, Severity, Verdict};

    async fn fixture(root: &std::path::Path) -> (Ctx, RunView, RunView, Value) {
        let config = crate::config::scratch_config(root);
        let ledger = Ledger::open(&config.db_path).unwrap();
        let ctx = Ctx { config, ledger };
        for id in ["previous", "successor"] {
            ctx.ledger
                .create_run(NewRun {
                    run_id: RunId::new(id).unwrap(),
                    work_id: "shared-work".to_owned(),
                    repo: root.join("repo").to_string_lossy().into_owned(),
                    base_ref: "main".to_owned(),
                    branch: format!("forged/{id}"),
                })
                .unwrap();
        }
        let source = ctx.ledger.get_run("previous").unwrap();
        let packet = crate::adapters::execute::build_packet(
            &ctx,
            &source,
            &forged_proto::PacketIntent {
                stage: Stage::ReviewCodex,
                seq: 0,
                hints: ctx.config.roster[&Stage::ReviewCodex].clone(),
                execution: None,
                packet_id: None,
            },
            &spec::SpecSource::File("spec.md".to_owned()),
            &spec::ResolvedSpec {
                body: None,
                sha256: "source-spec".to_owned(),
                fence: SpecFence::Sha256("source-spec".to_owned()),
                work_context: Vec::new(),
            },
            &["source-review-check".to_owned()],
            &[],
            &Default::default(),
            60,
            None,
        )
        .unwrap();
        let packet_id = ctx
            .ledger
            .open_packet(NewPacket {
                run_id: source.run_id.clone(),
                stage: packet.stage,
                seq: 0,
                spec_path: packet.spec.path.clone(),
                spec_sha256: packet.spec.sha256.clone(),
                spec_revision: None,
                policy_revision: None,
                body_json: packet.stored_body().unwrap(),
            })
            .unwrap();
        let claim = ctx
            .ledger
            .claim_packet(
                &packet_id,
                "synthetic-reviewer",
                &SpecFence::Sha256("source-spec".to_owned()),
            )
            .unwrap();
        ctx.ledger
            .complete_packet(
                &packet_id,
                &claim.claim_token,
                &PacketResult {
                    schema: "forged.result/1".to_owned(),
                    packet_id: packet_id.clone(),
                    outcome: Outcome::Review {
                        verdict: Verdict::RequestChanges,
                        summary: "bounded correction".to_owned(),
                        available: true,
                        findings: vec![Finding {
                            severity: Severity::High,
                            file: Some("src/parser.rs".to_owned()),
                            line: Some(42),
                            message: "Avoid rescanning the entire input for each boundary"
                                .to_owned(),
                        }],
                    },
                },
            )
            .unwrap();
        ctx.ledger
            .set_run_state(
                "previous",
                RunState::Stopped,
                Some("review budget".to_owned()),
            )
            .unwrap();
        let mut source = super::super::drive::project(&ctx, "previous")
            .await
            .unwrap();
        source.settled_operations.push(OperationRow {
            operation_id: "source-gate-op".to_owned(), name: "gate".to_owned(), idempotency_key: "previous/gate/0".to_owned(),
            request_sha256: "request".to_owned(), effect_class: EffectClass::SafeRetry, run_id: Some("previous".to_owned()), claim_token: None,
            state: OperationState::Terminal, created_at: "2026-01-01T00:00:00Z".to_owned(), updated_at: "2026-01-01T00:00:00Z".to_owned(),
            response_json: Some(json!({"ok": true, "result": {"headSha": "recorded-head", "passed": false,
                "gates": [{"command": "recorded-check", "cwd": "/synthetic/repo", "exitCode": 1, "durationMs": 1,
                    "timedOut": false, "stdoutPreview": "DO_NOT_COPY_STDOUT", "stderrPreview": "DO_NOT_COPY_STDERR",
                    "artifactPath": "/synthetic/artifacts/gate.log"}]}}).to_string()),
        });
        let current = super::super::drive::project(&ctx, "successor")
            .await
            .unwrap();
        let authorization = json!({"schemaVersion": 1, "runId": "successor", "retryOf": "previous", "workId": "shared-work",
            "because": "spec-amended", "revision": "2", "startedFrom": {"branch": "forged/previous", "sha": "recorded-head"}});
        (ctx, source, current, authorization)
    }

    #[tokio::test]
    async fn handoff_uses_immediate_authorized_source_without_mutating_it() {
        let root = tempfile::tempdir().unwrap();
        let (ctx, _, current, authorization) = fixture(root.path()).await;
        assert!(
            handoff(&ctx, &current).await.is_none(),
            "ordinary first attempts have no new context"
        );
        // A predecessor's own retry link must never cause ancestor traversal.
        ctx.ledger
            .append_event(
                Some("previous"),
                "forged.run.retry.authorized",
                json!({"retryOf": "missing-ancestor"}),
            )
            .unwrap();
        ctx.ledger
            .append_event(
                Some("successor"),
                "forged.run.retry.authorized",
                authorization,
            )
            .unwrap();
        let source_before = ctx.ledger.get_run("previous").unwrap();
        let events_before = ctx.ledger.list_events(Some("previous"), 0, 1000).unwrap();
        let note = handoff(&ctx, &current).await.unwrap();
        assert!(note.contains("Avoid rescanning"));
        assert!(!note.contains("missing-ancestor"));
        assert!(note.contains("artifact reference unavailable"));
        assert_eq!(ctx.ledger.get_run("previous").unwrap(), source_before);
        assert_eq!(
            ctx.ledger.list_events(Some("previous"), 0, 1000).unwrap(),
            events_before
        );
        let mut revised = current;
        revised.policy.gate_commands = vec!["successor-new-check".to_owned()];
        assert_eq!(
            handoff(&ctx, &revised).await.unwrap(),
            note,
            "successor policy cannot rewrite historical evidence"
        );
        ctx.ledger
            .append_event(
                Some("successor"),
                "forged.run.retry.authorized",
                json!({"retryOf": "missing-source"}),
            )
            .unwrap();
        assert!(handoff(&ctx, &revised)
            .await
            .unwrap()
            .contains("evidence unavailable"));
    }

    #[tokio::test]
    async fn handoff_keeps_changed_head_spec_and_checks_historical() {
        let root = tempfile::tempdir().unwrap();
        let (_, mut source, current, mut authorization) = fixture(root.path()).await;
        assert!(handoff_lineage(&current.run, &source.run, &authorization));
        authorization["startedFrom"]["sha"] = json!("successor-changed-head");
        source.policy.gate_commands = vec!["source-policy-revised-later".to_owned()];
        let note = render_handoff(&source, &authorization, &[], root.path());
        for evidence in [
            "Historical retry evidence only",
            "recorded-head",
            "successor-changed-head",
            "source-spec",
            "recorded-check",
            "source-review-check",
            "fresh required gates",
            "current spec, code and check contract take precedence",
        ] {
            assert!(note.contains(evidence), "missing {evidence}: {note}");
        }
        for excluded in [
            "source-policy-revised-later",
            "DO_NOT_COPY_STDOUT",
            "DO_NOT_COPY_STDERR",
        ] {
            assert!(!note.contains(excluded));
        }
        assert!(note.contains("review head association=unknown"));
        if let Some(Outcome::Review { available, .. }) = source
            .terminal_attempts
            .values_mut()
            .next()
            .unwrap()
            .last_mut()
            .unwrap()
            .outcome
            .as_mut()
        {
            *available = false;
        }
        let unavailable = render_handoff(&source, &authorization, &[], root.path());
        assert!(unavailable.contains("available=false"));
        assert!(!unavailable.contains("Avoid rescanning"));
        let mut result: Value =
            serde_json::from_str(source.settled_operations[0].response_json.as_ref().unwrap())
                .unwrap();
        result["result"].as_object_mut().unwrap().remove("headSha");
        source.settled_operations[0].response_json = Some(result.to_string());
        assert!(render_handoff(&source, &authorization, &[], root.path())
            .contains("recorded gate head=unknown"));
        source.settled_operations.clear();
        assert!(render_handoff(&source, &authorization, &[], root.path())
            .contains("Gate evidence unavailable"));
        source.terminal_attempts.clear();
        assert!(render_handoff(&source, &authorization, &[], root.path())
            .contains("Completed review result unavailable"));
    }

    #[tokio::test]
    async fn handoff_refuses_other_repository_work_or_retry_lineage() {
        let root = tempfile::tempdir().unwrap();
        let (ctx, source, current, authorization) = fixture(root.path()).await;
        for mismatch in ["repo", "work", "self", "runId", "retryOf", "workId"] {
            let mut row = source.run.clone();
            let mut link = authorization.clone();
            match mismatch {
                "repo" => row.repo.push_str("-different"),
                "work" => row.work_id.push_str("-different"),
                "self" => row.run_id = current.run.run_id.clone(),
                key => link[key] = json!("other"),
            }
            assert!(
                !handoff_lineage(&current.run, &row, &link),
                "accepted {mismatch}"
            );
        }
        let mut unauthorized = authorization;
        unauthorized["workId"] = json!("other");
        ctx.ledger
            .append_event(
                Some("successor"),
                "forged.run.retry.authorized",
                unauthorized,
            )
            .unwrap();
        let note = handoff(&ctx, &current).await.unwrap();
        assert!(note.contains("lineage mismatch"));
        assert!(!note.contains("Avoid rescanning"));
    }

    #[tokio::test]
    async fn handoff_retains_completed_findings_after_an_interrupted_or_unavailable_round() {
        let root = tempfile::tempdir().unwrap();
        let (_, mut source, _, authorization) = fixture(root.path()).await;
        let mut newer = source.packets[0].clone();
        newer.seq = 1;
        newer.packet_id = format!("{}/1", newer.packet_id.rsplit_once('/').unwrap().0);
        let newer_id = newer.packet_id.clone();
        source.packets.push(newer);
        for unavailable in [false, true] {
            if unavailable {
                source.terminal_attempts.insert(
                    newer_id.clone(),
                    vec![forged_proto::TerminalAttempt {
                        attempt_id: 99,
                        state: AttemptState::Completed,
                        outcome: Some(Outcome::Review {
                            available: false,
                            verdict: Verdict::Approve,
                            summary: "not available".to_owned(),
                            findings: vec![Finding {
                                severity: Severity::High,
                                file: None,
                                line: None,
                                message: "UNAVAILABLE_FINDING".to_owned(),
                            }],
                        }),
                        fail_note: None,
                        started_at: "2026-01-02T00:00:00Z".to_owned(),
                    }],
                );
            }
            let note = render_handoff(&source, &authorization, &[], root.path());
            assert!(note.contains("Avoid rescanning"));
            assert!(note.contains("Latest opened review round 1 is incomplete/unavailable"));
            assert!(note.contains("completed available evidence round=0"));
            assert!(!note.contains("UNAVAILABLE_FINDING"));
            assert!(!note.contains("historical verdict=\"approve\""));
            assert!(note.len() <= HANDOFF_LIMIT);
        }
    }

    #[tokio::test]
    async fn handoff_prioritizes_findings_and_bounds_every_utf8_byte() {
        let root = tempfile::tempdir().unwrap();
        let (_, mut source, _, authorization) = fixture(root.path()).await;
        let mut result: Value =
            serde_json::from_str(source.settled_operations[0].response_json.as_ref().unwrap())
                .unwrap();
        result["result"]["gates"][0]["command"] = json!("界".repeat(5000));
        result["result"]["gates"][0]["artifactPath"] = json!("long-artifact/".repeat(5000));
        source.settled_operations[0].response_json = Some(result.to_string());
        let note = render_handoff(&source, &authorization, &[], root.path());
        assert!(note.len() <= HANDOFF_LIMIT);
        assert!(note.ends_with(HANDOFF_OMITTED));
        assert!(
            note.contains("Avoid rescanning"),
            "supporting metadata must not crowd out the finding"
        );
        assert!(note.contains("Source run previous; artifacts="));
        assert!(note.contains("recorded gate head=recorded-head"));
        assert_eq!(
            render_handoff(&source, &authorization, &[], root.path()),
            note
        );
        assert!(bounded_handoff("界".repeat(5000)).len() <= HANDOFF_LIMIT);
    }
}
