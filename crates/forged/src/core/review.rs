//! Exact-snapshot publication of durable review findings to a slice PR.

use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::path::Path;

use forged_git::GhClient;
use forged_ledger::{
    EffectClass, NewReviewFindingDelivery, OperationState, ReviewFindingDeliveryClaim,
    ReviewFindingDeliveryKey, ReviewFindingDeliveryOutcome, ReviewFindingDeliveryRow,
    ReviewPublicationSource,
};
use forged_proto::{machine_idempotency_key, MachineStage};
use forged_types::{
    canonical_json_bytes, github_repository_from_pr_url, request_sha256, ErrorCode, Finding,
    OperationRequest, OperationResponse, Outcome, PacketResult, ReviewEpochKind, ReviewEpochV1,
    ReviewPublicationFindingStatus, ReviewPublicationFindingV1, ReviewPublicationNoop,
    ReviewPublicationTargetV1, ReviewPublicationV1, SeatPurpose, Stage,
    REVIEW_PUBLICATION_SCHEMA_V1,
};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::adapters::ports::github_remote;
use crate::config::now_iso;
use crate::core::{
    derive_key, err_response, fenced, key_absent, ok_response, on_ledger, param_str, CoreResult,
    Ctx, Failure,
};
use crate::failpoint;

const RESULT_SCHEMA: &str = "forged.result/1";
const OPERATION_LEASE_SECONDS: i64 = 300;
const DELIVERY_LEASE_SECONDS: i64 = 900;
const BODY_MAX_BYTES: usize = 8_192;

#[derive(Debug, Clone)]
struct ExactFinding {
    finding_id: String,
    canonical_json: String,
    finding: Finding,
}

#[derive(Debug, Clone)]
struct ReviewSnapshot {
    run_id: String,
    repo: String,
    epoch: Option<ReviewEpochV1>,
    target: Option<ReviewPublicationTargetV1>,
    findings: Vec<ExactFinding>,
    snapshot_sha256: String,
}

fn sha256(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    let mut out = String::with_capacity(64);
    for byte in digest {
        let _ = write!(out, "{byte:02x}");
    }
    out
}

fn timestamp_shift(anchor: &str, seconds: i64) -> Result<String, Failure> {
    let timestamp = anchor
        .parse::<jiff::Timestamp>()
        .map_err(|error| Failure::internal(format!("invalid timestamp: {error}")))?;
    let shifted = timestamp
        .checked_add(jiff::Span::new().seconds(seconds))
        .map_err(|error| Failure::internal(format!("timestamp overflow: {error}")))?;
    Ok(forged_proto::widen_rfc3339(&shifted.to_string()))
}

fn exact_pr_target(
    operation: Option<&forged_ledger::OperationRow>,
) -> Result<Option<ReviewPublicationTargetV1>, Failure> {
    let Some(operation) = operation else {
        return Ok(None);
    };
    if operation.name != "draftpr" {
        return Err(Failure::internal(
            "draft-PR publication evidence is not a draftpr operation",
        ));
    }
    if operation.state != OperationState::Terminal {
        return Ok(None);
    }
    let raw = operation
        .response_json
        .as_deref()
        .ok_or_else(|| Failure::internal("terminal draft-PR operation has no response envelope"))?;
    let value = forged_types::parse_canonical(raw).map_err(|error| {
        Failure::internal(format!("draft-PR response envelope is malformed: {error}"))
    })?;
    let response: OperationResponse = serde_json::from_value(value).map_err(|error| {
        Failure::internal(format!(
            "draft-PR response envelope has an unknown shape: {error}"
        ))
    })?;
    if !response.ok && response.error.is_some() && response.result.is_none() {
        return Ok(None);
    }
    if !response.ok || response.error.is_some() {
        return Err(Failure::internal(
            "terminal draft-PR response has contradictory success fields",
        ));
    }
    let pr = response
        .result
        .as_ref()
        .and_then(|result| result.get("pr"))
        .ok_or_else(|| Failure::internal("draft-PR response has no pr result"))?;
    let number = pr
        .get("number")
        .and_then(Value::as_u64)
        .filter(|number| *number > 0)
        .ok_or_else(|| Failure::internal("draft-PR response has an invalid PR number"))?;
    let url = pr
        .get("url")
        .and_then(Value::as_str)
        .ok_or_else(|| Failure::internal("draft-PR response has no PR URL"))?;
    let repository = repository_from_pr_url(url, number)?;
    Ok(Some(ReviewPublicationTargetV1 {
        repository,
        number,
        url: url.to_owned(),
    }))
}

fn repository_from_pr_url(url: &str, expected_number: u64) -> Result<String, Failure> {
    github_repository_from_pr_url(url, expected_number).ok_or_else(|| {
        Failure::internal("draft-PR URL is not a canonical matching github.com pull request")
    })
}

fn reject_unknown_keys(value: &Value, allowed: &[&str], what: &str) -> Result<(), Failure> {
    let object = value
        .as_object()
        .ok_or_else(|| Failure::internal(format!("{what} is not an object")))?;
    if let Some(key) = object.keys().find(|key| !allowed.contains(&key.as_str())) {
        return Err(Failure::internal(format!(
            "{what} contains unknown field {key:?}"
        )));
    }
    Ok(())
}

fn validate_review_result_shape(value: &Value) -> Result<(), Failure> {
    reject_unknown_keys(value, &["schema", "packetId", "outcome"], "PacketResult")?;
    let outcome = value
        .get("outcome")
        .ok_or_else(|| Failure::internal("PacketResult has no outcome"))?;
    reject_unknown_keys(outcome, &["review"], "review outcome wrapper")?;
    let review = outcome
        .get("review")
        .ok_or_else(|| Failure::internal("PacketResult is not a review outcome"))?;
    reject_unknown_keys(
        review,
        &["verdict", "summary", "findings", "available"],
        "review outcome",
    )?;
    let findings = review
        .get("findings")
        .and_then(Value::as_array)
        .ok_or_else(|| Failure::internal("review outcome findings are not an array"))?;
    for (index, finding) in findings.iter().enumerate() {
        reject_unknown_keys(
            finding,
            &["severity", "file", "line", "message"],
            &format!("review finding {index}"),
        )?;
    }
    Ok(())
}

fn exact_findings(
    source: &ReviewPublicationSource,
) -> Result<(Option<ReviewEpochV1>, Vec<ExactFinding>), Failure> {
    let mut packets = Vec::with_capacity(source.packets.len());
    for row in &source.packets {
        let stored_value = forged_types::parse_canonical(&row.body_json).map_err(|error| {
            Failure::internal(format!(
                "stored packet {:?} is malformed: {error}",
                row.packet_id
            ))
        })?;
        reject_unknown_keys(
            &stored_value,
            &[
                "schema",
                "packetId",
                "runId",
                "beadId",
                "stage",
                "execution",
                "laneSeq",
                "spec",
                "worktree",
                "branch",
                "baseRef",
                "contract",
                "resultSchema",
                "providerHints",
                "fieldNotes",
            ],
            "stored packet",
        )
        .map_err(|error| {
            Failure::internal(format!(
                "stored packet {:?} has an unknown shape: {}",
                row.packet_id, error.message
            ))
        })?;
        let packet = forged_proto::stored_packet(row).map_err(|error| {
            Failure::internal(format!(
                "stored packet {:?} is malformed: {error}",
                row.packet_id
            ))
        })?;
        if packet.schema != "forged.packet/1"
            || packet.result_schema != RESULT_SCHEMA
            || packet.packet_id != row.packet_id
            || packet.run_id != row.run_id
        {
            return Err(Failure::internal(format!(
                "stored packet {:?} has an unknown or contradictory shape",
                row.packet_id
            )));
        }
        if source.definition_backed != packet.execution.is_some() {
            return Err(Failure::internal(
                "run mixes semantic and legacy packet identities",
            ));
        }
        packets.push((row, packet));
    }

    let (kind, greatest) = if source.definition_backed {
        let greatest = packets
            .iter()
            .filter_map(|(_, packet)| {
                let execution = packet.execution.as_ref()?;
                matches!(
                    execution.purpose,
                    SeatPurpose::Review | SeatPurpose::Synthesis
                )
                .then_some(u64::from(execution.round))
            })
            .max();
        (ReviewEpochKind::SemanticRound, greatest)
    } else {
        if packets.iter().any(|(row, _)| {
            matches!(row.stage, Stage::ReviewClaude | Stage::ReviewCodex) && row.seq < 0
        }) {
            return Err(Failure::internal(
                "legacy review packet carries a negative sequence",
            ));
        }
        let greatest = packets
            .iter()
            .filter_map(|(row, _)| {
                matches!(row.stage, Stage::ReviewClaude | Stage::ReviewCodex)
                    .then(|| u64::try_from(row.seq).ok())
                    .flatten()
            })
            .max();
        (ReviewEpochKind::LegacySeq, greatest)
    };
    let Some(greatest) = greatest else {
        return Ok((None, Vec::new()));
    };
    let epoch = ReviewEpochV1 {
        kind,
        value: greatest,
        id: format!("{}:{greatest}", kind.as_str()),
    };

    let selected: Vec<_> = packets
        .into_iter()
        .filter(|(row, packet)| match kind {
            ReviewEpochKind::SemanticRound => packet.execution.as_ref().is_some_and(|execution| {
                matches!(
                    execution.purpose,
                    SeatPurpose::Review | SeatPurpose::Synthesis
                ) && u64::from(execution.round) == greatest
            }),
            ReviewEpochKind::LegacySeq => {
                matches!(row.stage, Stage::ReviewClaude | Stage::ReviewCodex)
                    && u64::try_from(row.seq).ok() == Some(greatest)
            }
        })
        .collect();

    let mut exact: BTreeMap<String, ExactFinding> = BTreeMap::new();
    for (row, packet) in selected {
        let attempt = source
            .completed_attempts
            .iter()
            .filter(|attempt| attempt.packet_id == row.packet_id)
            .max_by_key(|attempt| attempt.attempt_id)
            .ok_or_else(|| {
                Failure::invalid(format!(
                    "latest review epoch is incomplete: packet {:?} has no completed attempt",
                    row.packet_id
                ))
            })?;
        let raw = attempt.result_json.as_deref().ok_or_else(|| {
            Failure::internal(format!(
                "completed attempt {} has no PacketResult",
                attempt.attempt_id
            ))
        })?;
        let value = forged_types::parse_canonical(raw).map_err(|error| {
            Failure::internal(format!(
                "newest completed result for {:?} is malformed: {error}",
                row.packet_id
            ))
        })?;
        validate_review_result_shape(&value).map_err(|error| {
            Failure::internal(format!(
                "newest completed result for {:?} has an unknown shape: {}",
                row.packet_id, error.message
            ))
        })?;
        let result: PacketResult = serde_json::from_value(value).map_err(|error| {
            Failure::internal(format!(
                "newest completed result for {:?} has an unknown shape: {error}",
                row.packet_id
            ))
        })?;
        if result.schema != packet.result_schema || result.packet_id != packet.packet_id {
            return Err(Failure::internal(format!(
                "newest completed result for {:?} contradicts its packet",
                row.packet_id
            )));
        }
        let Outcome::Review { findings, .. } = result.outcome else {
            return Err(Failure::internal(format!(
                "newest completed result for {:?} is not a review outcome",
                row.packet_id
            )));
        };
        for finding in findings {
            let value = serde_json::to_value(&finding).map_err(|error| {
                Failure::internal(format!("finding does not serialize: {error}"))
            })?;
            let bytes = canonical_json_bytes(&value).map_err(|error| {
                Failure::internal(format!("finding cannot canonicalize: {error}"))
            })?;
            let finding_id = sha256(&bytes);
            let canonical_json = String::from_utf8(bytes)
                .map_err(|_| Failure::internal("canonical finding JSON is not UTF-8"))?;
            let candidate = ExactFinding {
                finding_id: finding_id.clone(),
                canonical_json,
                finding,
            };
            if let Some(existing) = exact.get(&finding_id) {
                if existing.canonical_json != candidate.canonical_json {
                    return Err(Failure::internal("SHA-256 collision in review findings"));
                }
            } else {
                exact.insert(finding_id, candidate);
            }
        }
    }
    Ok((Some(epoch), exact.into_values().collect()))
}

fn select_snapshot(
    run_id: &str,
    repo: String,
    source: ReviewPublicationSource,
) -> Result<ReviewSnapshot, Failure> {
    let target = exact_pr_target(source.draft_pr_operation.as_ref())?;
    let (epoch, findings) = exact_findings(&source)?;
    let value = json!({
        "schema": REVIEW_PUBLICATION_SCHEMA_V1,
        "runId": run_id,
        "reviewEpoch": epoch,
        "pullRequest": target,
        "findingIds": findings.iter().map(|finding| finding.finding_id.as_str()).collect::<Vec<_>>(),
    });
    let bytes = canonical_json_bytes(&value)
        .map_err(|error| Failure::internal(format!("snapshot cannot canonicalize: {error}")))?;
    Ok(ReviewSnapshot {
        run_id: run_id.to_owned(),
        repo,
        epoch,
        target,
        findings,
        snapshot_sha256: sha256(&bytes),
    })
}

fn noop_result(snapshot: &ReviewSnapshot, noop: ReviewPublicationNoop) -> ReviewPublicationV1 {
    ReviewPublicationV1 {
        schema: REVIEW_PUBLICATION_SCHEMA_V1.to_owned(),
        run_id: snapshot.run_id.clone(),
        pull_request: snapshot.target.clone(),
        review_epoch: snapshot.epoch.clone(),
        snapshot_sha256: snapshot.snapshot_sha256.clone(),
        noop: Some(noop),
        total: 0,
        posted: 0,
        already_present: 0,
        delivered: 0,
        retryable: 0,
        uncertain: 0,
        findings: Vec::new(),
    }
}

fn delivery_generation(rows: &[ReviewFindingDeliveryRow]) -> Result<String, Failure> {
    let value = json!(rows
        .iter()
        .map(|row| json!({
            "findingId": row.key.finding_id,
            "state": row.state.as_str(),
            "attemptCount": row.attempt_count,
            // A definite pre-POST failure does not increment the POST count,
            // but it must still mint a new default receipt so the next call
            // can retry instead of replaying the prior partial batch forever.
            "updatedAt": row.updated_at,
        }))
        .collect::<Vec<_>>());
    canonical_json_bytes(&value)
        .map(|bytes| sha256(&bytes))
        .map_err(|error| {
            Failure::internal(format!("delivery generation cannot canonicalize: {error}"))
        })
}

fn quote_lines(value: &str, out: &mut String) {
    if value.is_empty() {
        out.push_str("> _(empty)_\n");
        return;
    }
    for line in value.lines() {
        out.push_str("> ");
        out.push_str(line);
        out.push('\n');
    }
}

fn bounded_body(finding: &Finding) -> String {
    let mut body = format!(
        "### Forged review finding\n\n**Severity:** {:?}\n\n",
        finding.severity
    );
    if let Some(file) = &finding.file {
        body.push_str("**File:**\n");
        quote_lines(file, &mut body);
        body.push('\n');
    }
    if let Some(line) = finding.line {
        let _ = writeln!(body, "**Line:** {line}\n");
    }
    body.push_str("**Finding:**\n");
    quote_lines(&finding.message, &mut body);
    if body.len() <= BODY_MAX_BYTES {
        return body;
    }
    let suffix = "\n> _(presentation truncated; identity preserves the complete finding)_\n";
    let mut end = BODY_MAX_BYTES.saturating_sub(suffix.len());
    while !body.is_char_boundary(end) {
        end -= 1;
    }
    body.truncate(end);
    body.push_str(suffix);
    body
}

fn publication_result(
    snapshot: &ReviewSnapshot,
    outcomes: Vec<ReviewPublicationFindingV1>,
) -> ReviewPublicationV1 {
    let posted = outcomes
        .iter()
        .filter(|item| item.status == ReviewPublicationFindingStatus::Posted)
        .count() as u64;
    let already_present = outcomes
        .iter()
        .filter(|item| item.status == ReviewPublicationFindingStatus::AlreadyPresent)
        .count() as u64;
    let retryable = outcomes
        .iter()
        .filter(|item| item.status == ReviewPublicationFindingStatus::Retryable)
        .count() as u64;
    let uncertain = outcomes
        .iter()
        .filter(|item| item.status == ReviewPublicationFindingStatus::Uncertain)
        .count() as u64;
    ReviewPublicationV1 {
        schema: REVIEW_PUBLICATION_SCHEMA_V1.to_owned(),
        run_id: snapshot.run_id.clone(),
        pull_request: snapshot.target.clone(),
        review_epoch: snapshot.epoch.clone(),
        snapshot_sha256: snapshot.snapshot_sha256.clone(),
        noop: None,
        total: outcomes.len() as u64,
        posted,
        already_present,
        delivered: outcomes.len() as u64 - retryable - uncertain,
        retryable,
        uncertain,
        findings: outcomes,
    }
}

async fn publish_effect(
    ctx: &Ctx,
    snapshot: ReviewSnapshot,
    rows: Vec<ReviewFindingDeliveryRow>,
) -> CoreResult {
    let target = snapshot
        .target
        .as_ref()
        .ok_or_else(|| Failure::internal("publication effect has no PR target"))?;
    let findings: BTreeMap<&str, &ExactFinding> = snapshot
        .findings
        .iter()
        .map(|finding| (finding.finding_id.as_str(), finding))
        .collect();
    // Delivered and busy rows replay from the ledger alone; the origin
    // remote is read only when a claimed row actually needs GitHub, so a
    // fully-delivered batch reconstructs without the checkout.
    let mut pinned_gh: Option<GhClient> = None;
    let mut outcomes = Vec::with_capacity(rows.len());
    let mut busy = false;

    for row in rows {
        let finding = findings
            .get(row.key.finding_id.as_str())
            .ok_or_else(|| Failure::internal("delivery row is outside the frozen snapshot"))?;
        let now = now_iso();
        let lease_until = timestamp_shift(&now, DELIVERY_LEASE_SECONDS)?;
        let key = row.key.clone();
        let claim = on_ledger(&ctx.ledger, move |ledger| {
            ledger.claim_review_finding_delivery(key, now, lease_until)
        })
        .await?;
        let claimed = match claim {
            ReviewFindingDeliveryClaim::Delivered(_) => {
                outcomes.push(ReviewPublicationFindingV1 {
                    finding_id: row.key.finding_id,
                    status: ReviewPublicationFindingStatus::Delivered,
                    error: None,
                });
                continue;
            }
            ReviewFindingDeliveryClaim::Busy(_) => {
                busy = true;
                continue;
            }
            ReviewFindingDeliveryClaim::Claimed(claimed) => claimed,
        };
        let token = claimed
            .delivery_token
            .clone()
            .ok_or_else(|| Failure::internal("claimed review delivery has no token"))?;
        let gh = match pinned_gh.as_ref() {
            Some(gh) => gh,
            None => {
                let remote = github_remote(Path::new(&snapshot.repo))
                    .await
                    .map_err(Failure::from)?;
                &*pinned_gh.insert(GhClient::new().with_host_opt(remote.gh_host()))
            }
        };

        failpoint::hit("review.publish.probe.before");
        let present = gh
            .finding_comment_present(&target.repository, target.number, &finding.finding_id)
            .await;
        failpoint::hit("review.publish.probe.after");
        match present {
            Err(error) => {
                let message = error.to_string();
                let key = claimed.key.clone();
                let token = token.clone();
                let stored = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.retry_review_finding_delivery(key, token, message)
                })
                .await?;
                outcomes.push(ReviewPublicationFindingV1 {
                    finding_id: stored.key.finding_id,
                    status: ReviewPublicationFindingStatus::Retryable,
                    error: stored.last_error,
                });
                continue;
            }
            Ok(true) => {
                let key = claimed.key.clone();
                let token = token.clone();
                let evidence = format!("<!-- anvil-finding id={} -->", finding.finding_id);
                let stored = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.deliver_review_finding(
                        key,
                        token,
                        ReviewFindingDeliveryOutcome::AlreadyPresent,
                        evidence,
                    )
                })
                .await?;
                outcomes.push(ReviewPublicationFindingV1 {
                    finding_id: stored.key.finding_id,
                    status: ReviewPublicationFindingStatus::AlreadyPresent,
                    error: None,
                });
                continue;
            }
            Ok(false) => {}
        }

        let key = claimed.key.clone();
        let token_for_mark = token.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.mark_review_finding_delivery_uncertain(key, token_for_mark)
        })
        .await?;

        failpoint::hit("review.publish.post.before");
        let posted = gh
            .post_finding_comment(
                &target.repository,
                target.number,
                &finding.finding_id,
                &bounded_body(&finding.finding),
            )
            .await;
        failpoint::hit("review.publish.post.after");
        match posted {
            Ok(()) => {
                let key = claimed.key.clone();
                let evidence = format!("<!-- anvil-finding id={} -->", finding.finding_id);
                let stored = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.deliver_review_finding(
                        key,
                        token,
                        ReviewFindingDeliveryOutcome::Posted,
                        evidence,
                    )
                })
                .await?;
                outcomes.push(ReviewPublicationFindingV1 {
                    finding_id: stored.key.finding_id,
                    status: ReviewPublicationFindingStatus::Posted,
                    error: None,
                });
            }
            Err(error) => {
                let message = error.to_string();
                let key = claimed.key.clone();
                let stored = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.uncertain_review_finding_delivery(key, token, message)
                })
                .await?;
                outcomes.push(ReviewPublicationFindingV1 {
                    finding_id: stored.key.finding_id,
                    status: ReviewPublicationFindingStatus::Uncertain,
                    error: stored.last_error,
                });
            }
        }
    }

    if busy {
        return Err(Failure {
            code: ErrorCode::OperationInProgress,
            message: "review publication has findings leased by another caller".to_owned(),
            recoverable: true,
        });
    }
    serde_json::to_value(publication_result(&snapshot, outcomes)).map_err(|error| {
        Failure::internal(format!("publication result does not serialize: {error}"))
    })
}

async fn resume_inflight(
    ctx: &Ctx,
    req: &OperationRequest,
    operation: forged_ledger::OperationRow,
    snapshot: ReviewSnapshot,
    rows: Vec<ReviewFindingDeliveryRow>,
) -> OperationResponse {
    let hash = match request_sha256(req) {
        Ok(hash) => hash,
        Err(error) => {
            return err_response(
                &req.idempotency_key,
                &Failure::invalid(format!("params cannot be canonicalized: {error}")),
            )
        }
    };
    if operation.request_sha256 != hash
        || operation.run_id != req.run_id
        || operation.effect_class != EffectClass::ObserveOnly
    {
        return err_response(
            &req.idempotency_key,
            &Failure::refused(
                ErrorCode::IdempotencyConflict,
                "review publication key was stored with a different request",
            ),
        );
    }
    let now = now_iso();
    let stale_before = match timestamp_shift(&now, -OPERATION_LEASE_SECONDS) {
        Ok(value) => value,
        Err(error) => return err_response(&req.idempotency_key, &error),
    };
    let operation_id = operation.operation_id.clone();
    let resume_id = operation_id.clone();
    let hash_for_resume = hash.clone();
    if let Err(error) = on_ledger(&ctx.ledger, move |ledger| {
        ledger.resume_stale_review_publish_operation(
            &resume_id,
            &hash_for_resume,
            &stale_before,
            &now,
        )
    })
    .await
    {
        return err_response(&operation_id, &error);
    }
    match publish_effect(ctx, snapshot, rows).await {
        Ok(result) => {
            let response = ok_response(&operation_id, false, result);
            let response_for_store = response.clone();
            let store_id = operation_id.clone();
            match on_ledger(&ctx.ledger, move |ledger| {
                ledger.complete_operation(&store_id, &response_for_store)
            })
            .await
            {
                Ok(()) => response,
                Err(error) => err_response(&operation_id, &error),
            }
        }
        Err(error) => err_response(&operation_id, &error),
    }
}

/// Publish the exact latest durable review snapshot for one run.
pub async fn review_publish(ctx: &Ctx, req: &mut OperationRequest) -> OperationResponse {
    let run_id = match param_str(&req.params, "run") {
        Ok(run_id) => run_id.to_owned(),
        Err(error) => return err_response(&derive_key("review_publish", None, None, None), &error),
    };
    if req.run_id.as_deref().is_some_and(|stored| stored != run_id) {
        return err_response(
            &derive_key("review_publish", Some(&run_id), None, None),
            &Failure::invalid("request.run_id does not match params.run"),
        );
    }
    req.run_id = Some(run_id.clone());
    let draft_key = machine_idempotency_key(&run_id, MachineStage::DraftPr, 0);
    let run_for_source = run_id.clone();
    let (run, source) = match on_ledger(&ctx.ledger, move |ledger| {
        let run = ledger.get_run(&run_for_source)?;
        let source = ledger.review_publication_source(&run_for_source, &draft_key)?;
        Ok((run, source))
    })
    .await
    {
        Ok(source) => source,
        Err(error) => {
            return err_response(
                &derive_key("review_publish", Some(&run_id), None, None),
                &error,
            )
        }
    };
    let snapshot = match select_snapshot(&run_id, run.repo, source) {
        Ok(snapshot) => snapshot,
        Err(error) => {
            return err_response(
                &derive_key("review_publish", Some(&run_id), None, None),
                &error,
            )
        }
    };
    let noop = if snapshot.target.is_none() {
        Some(ReviewPublicationNoop::NoPullRequest)
    } else if snapshot.epoch.is_none() {
        Some(ReviewPublicationNoop::NoReviewEpoch)
    } else if snapshot.findings.is_empty() {
        Some(ReviewPublicationNoop::NoFindings)
    } else {
        None
    };
    if let Some(noop) = noop {
        let key = if key_absent(req) {
            format!("op:review_publish:{}:{}", run_id, snapshot.snapshot_sha256)
        } else {
            req.idempotency_key.clone()
        };
        let value = match serde_json::to_value(noop_result(&snapshot, noop)) {
            Ok(value) => value,
            Err(error) => {
                return err_response(
                    &key,
                    &Failure::internal(format!("no-op result does not serialize: {error}")),
                )
            }
        };
        return ok_response(&key, false, value);
    }

    let target = snapshot.target.as_ref().expect("non-noop target");
    let epoch = snapshot.epoch.as_ref().expect("non-noop epoch");
    let deliveries = snapshot
        .findings
        .iter()
        .map(|finding| NewReviewFindingDelivery {
            key: ReviewFindingDeliveryKey {
                run_id: run_id.clone(),
                repository_slug: target.repository.clone(),
                pr_number: target.number,
                review_epoch_kind: epoch.kind,
                review_epoch: epoch.value,
                snapshot_sha256: snapshot.snapshot_sha256.clone(),
                finding_id: finding.finding_id.clone(),
            },
            pr_url: target.url.clone(),
            canonical_finding_json: finding.canonical_json.clone(),
            finding_sha256: finding.finding_id.clone(),
        })
        .collect();
    let rows = match on_ledger(&ctx.ledger, move |ledger| {
        ledger.prepare_review_finding_deliveries(deliveries)
    })
    .await
    {
        Ok(rows) => rows,
        Err(error) => {
            return err_response(
                &derive_key("review_publish", Some(&run_id), None, None),
                &error,
            )
        }
    };
    if key_absent(req) {
        let current_generation = match delivery_generation(&rows) {
            Ok(generation) => generation,
            Err(error) => {
                return err_response(
                    &derive_key("review_publish", Some(&run_id), None, None),
                    &error,
                )
            }
        };
        // A partial TERMINAL batch advances to the current delivery-state
        // generation so the next default call can retry undelivered rows.
        // An IN-FLIGHT wrapper is different: adopt its original generation
        // and reconcile it rather than orphaning an ObserveOnly operation
        // merely because a pre-POST marker changed one delivery row.
        let prefix = format!("op:review_publish:{}:{}:", run_id, snapshot.snapshot_sha256);
        let run_for_inflight = run_id.clone();
        let inflight = match on_ledger(&ctx.ledger, move |ledger| {
            ledger.list_inflight_operations(Some(&run_for_inflight))
        })
        .await
        {
            Ok(rows) => rows,
            Err(error) => {
                return err_response(
                    &derive_key("review_publish", Some(&run_id), None, None),
                    &error,
                )
            }
        };
        let matching: Vec<_> = inflight
            .iter()
            .filter(|operation| operation.name == "review_publish")
            .filter_map(|operation| {
                operation
                    .idempotency_key
                    .strip_prefix(&prefix)
                    .filter(|generation| {
                        generation.len() == 64
                            && generation
                                .bytes()
                                .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
                    })
                    .map(|generation| (operation.idempotency_key.clone(), generation.to_owned()))
            })
            .collect();
        match matching.as_slice() {
            [] => {
                req.idempotency_key = format!("{prefix}{current_generation}");
            }
            [(key, _generation)] => {
                req.idempotency_key = key.clone();
            }
            _ => {
                return err_response(
                    &derive_key("review_publish", Some(&run_id), None, None),
                    &Failure::internal(
                        "multiple in-flight review publications address the same snapshot",
                    ),
                )
            }
        }
    }
    req.params.insert(
        "snapshotSha256".to_owned(),
        Value::String(snapshot.snapshot_sha256.clone()),
    );

    let existing = {
        let key = req.idempotency_key.clone();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.find_operation("review_publish", &key)
        })
        .await
    };
    match existing {
        Ok(Some(operation)) if operation.state == OperationState::InProgress => {
            resume_inflight(ctx, req, operation, snapshot, rows).await
        }
        Ok(_) => {
            let snapshot_for_effect = snapshot.clone();
            let rows_for_effect = rows.clone();
            fenced(
                ctx,
                "review_publish",
                EffectClass::ObserveOnly,
                req,
                None,
                move |_operation_id| async move {
                    publish_effect(ctx, snapshot_for_effect, rows_for_effect).await
                },
            )
            .await
        }
        Err(error) => err_response(&req.idempotency_key, &error),
    }
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use forged_ledger::{AttemptRow, AttemptState, PacketRow, ReviewPublicationSource};
    use forged_types::{
        Deliverable, Finding, Outcome, PacketResult, ProviderHints, RoleId, Sandbox,
        SeatExecutionV1, SeatId, SeatPurpose, Severity, SpecRef, Stage, StageContract, Verdict,
        WorkPacket,
    };

    use super::{exact_findings, repository_from_pr_url, validate_review_result_shape};

    fn packet(
        run_id: &str,
        stage_id: &str,
        round: u8,
        purpose: SeatPurpose,
        seq: i64,
    ) -> PacketRow {
        let packet_id = format!("{run_id}/{stage_id}/{round}");
        let packet = WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: packet_id.clone(),
            run_id: run_id.to_owned(),
            work_id: "bead".to_owned(),
            stage: Stage::ReviewClaude,
            execution: Some(SeatExecutionV1 {
                stage_id: stage_id.to_owned(),
                seat_id: SeatId::new(format!("seat-{seq}")).expect("seat"),
                role_id: RoleId::new("reviewer").expect("role"),
                purpose,
                round,
            }),
            lane_seq: Some(seq),
            spec: SpecRef {
                path: "beads://fixture".to_owned(),
                sha256: "a".repeat(64),
                revision: Some("rev".to_owned()),
            },
            worktree: PathBuf::from("/tmp/worktree"),
            branch: "branch".to_owned(),
            base_ref: "main".to_owned(),
            contract: StageContract {
                instructions: "review".to_owned(),
                gate_commands: Vec::new(),
                deliverable: Deliverable::ReviewBlock,
                budget_s: 60,
                seat_commands: Vec::new(),
            },
            result_schema: "forged.result/1".to_owned(),
            provider_hints: ProviderHints {
                provider: "fixture".to_owned(),
                model: "fixture".to_owned(),
                effort: None,
                sandbox: Sandbox::ReadOnly,
            },
            field_notes: Vec::new(),
        };
        PacketRow {
            packet_id,
            run_id: run_id.to_owned(),
            stage: Stage::ReviewClaude,
            seq,
            spec_path: packet.spec.path.clone(),
            spec_sha256: packet.spec.sha256.clone(),
            spec_revision: packet.spec.revision.clone(),
            policy_revision: None,
            body_json: packet.stored_body().expect("stored body"),
            created_at: format!("t-{seq}"),
        }
    }

    fn attempt(id: i64, packet_id: &str, findings: Vec<Finding>) -> AttemptRow {
        let result = PacketResult {
            schema: "forged.result/1".to_owned(),
            packet_id: packet_id.to_owned(),
            outcome: Outcome::Review {
                verdict: Verdict::RequestChanges,
                summary: "review".to_owned(),
                findings,
                available: true,
            },
        };
        AttemptRow {
            attempt_id: id,
            packet_id: packet_id.to_owned(),
            claim_token: format!("claim-{id}"),
            claimant: "fixture".to_owned(),
            state: AttemptState::Completed,
            revoke_reason: None,
            revoke_scope: None,
            fail_note: None,
            result_json: Some(serde_json::to_string(&result).expect("result")),
            started_at: "t".to_owned(),
            updated_at: "t".to_owned(),
            last_heartbeat_at: None,
            ended_at: Some("t".to_owned()),
        }
    }

    fn finding(message: &str) -> Finding {
        Finding {
            severity: Severity::High,
            file: None,
            line: None,
            message: message.to_owned(),
        }
    }

    #[test]
    fn exact_pr_url_parser_binds_slug_and_number() {
        assert_eq!(
            repository_from_pr_url("https://github.com/acme/widget/pull/42", 42).expect("valid"),
            "acme/widget"
        );
        assert!(repository_from_pr_url("https://github.com/acme/widget/pull/43", 42).is_err());
        assert!(repository_from_pr_url("https://example.invalid/acme/widget/pull/42", 42).is_err());
        assert!(repository_from_pr_url("https://github.com/acme/widget/pull/42/", 42).is_err());
    }

    #[test]
    fn semantic_epoch_uses_greatest_review_or_synthesis_round() {
        let older = packet("run", "review-old", 1, SeatPurpose::Review, 1);
        let review = packet("run", "review-new", 2, SeatPurpose::Review, 2);
        let synthesis = packet("run", "synthesis", 2, SeatPurpose::Synthesis, 3);
        let source = ReviewPublicationSource {
            definition_backed: true,
            completed_attempts: vec![
                attempt(1, &older.packet_id, vec![finding("old")]),
                attempt(2, &review.packet_id, vec![finding("review")]),
                attempt(3, &synthesis.packet_id, vec![finding("synthesis")]),
            ],
            packets: vec![older, review, synthesis],
            draft_pr_operation: None,
        };
        let (epoch, findings) = exact_findings(&source).expect("semantic snapshot");
        let epoch = epoch.expect("epoch");
        assert_eq!(epoch.id, "semantic-round:2");
        assert_eq!(findings.len(), 2);
        assert!(findings
            .iter()
            .all(|finding| finding.finding.message != "old"));
    }

    #[test]
    fn semantic_and_legacy_packet_shapes_cannot_mix() {
        let semantic = packet("run", "review", 1, SeatPurpose::Review, 1);
        let mut legacy = semantic.clone();
        let mut body: serde_json::Value = serde_json::from_str(&legacy.body_json).expect("body");
        body.as_object_mut().expect("object").remove("execution");
        legacy.body_json = serde_json::to_string(&body).expect("body JSON");
        let source = ReviewPublicationSource {
            definition_backed: true,
            packets: vec![legacy],
            completed_attempts: Vec::new(),
            draft_pr_operation: None,
        };
        assert!(exact_findings(&source)
            .expect_err("mixed shape")
            .to_string()
            .contains("mixes semantic and legacy"));
    }

    #[test]
    fn unknown_stored_packet_fields_fail_closed() {
        let mut packet = packet("run", "review", 1, SeatPurpose::Review, 1);
        let mut body: serde_json::Value = serde_json::from_str(&packet.body_json).expect("body");
        body.as_object_mut()
            .expect("object")
            .insert("futureIdentity".to_owned(), serde_json::json!("unknown"));
        packet.body_json = serde_json::to_string(&body).expect("body JSON");
        let source = ReviewPublicationSource {
            definition_backed: true,
            packets: vec![packet],
            completed_attempts: Vec::new(),
            draft_pr_operation: None,
        };
        assert!(exact_findings(&source)
            .expect_err("unknown packet field")
            .to_string()
            .contains("unknown shape"));
    }

    #[test]
    fn review_result_shape_rejects_unknown_nested_fields() {
        let value = serde_json::json!({
            "schema": "forged.result/1",
            "packetId": "packet",
            "outcome": {
                "review": {
                    "verdict": "requestChanges",
                    "summary": "review",
                    "findings": [{
                        "severity": "high",
                        "file": null,
                        "line": null,
                        "message": "finding",
                        "normalizedMessage": "must not be accepted",
                    }],
                    "available": true,
                }
            }
        });
        assert!(validate_review_result_shape(&value)
            .expect_err("unknown finding field")
            .to_string()
            .contains("unknown field"));
    }

    #[test]
    fn negative_legacy_review_sequence_fails_closed() {
        let mut legacy = packet("run", "review", 1, SeatPurpose::Review, -1);
        let mut body: serde_json::Value = serde_json::from_str(&legacy.body_json).expect("body");
        body.as_object_mut().expect("object").remove("execution");
        legacy.body_json = serde_json::to_string(&body).expect("body JSON");
        let source = ReviewPublicationSource {
            definition_backed: false,
            packets: vec![legacy],
            completed_attempts: Vec::new(),
            draft_pr_operation: None,
        };
        assert!(exact_findings(&source)
            .expect_err("negative legacy sequence")
            .to_string()
            .contains("negative sequence"));
    }
}
