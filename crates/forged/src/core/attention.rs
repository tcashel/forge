//! Typed operator-attention projection and lifecycle controls.
//!
//! Attention is a view over durable domain facts. It does not authorize,
//! retry, resolve, or otherwise mutate the domain object that raised it.

use std::collections::{BTreeMap, BTreeSet};

use crate::core::work_types::IssueSummary;
use forged_ledger::{
    AdmissionReservationState, AttemptState, DesiredReconcileOutcome, DesiredState, EffectClass,
    InventorySnapshot, InventoryUsage, RunOutcome,
};
use forged_types::{
    attention_id, attention_occurrence_id, AdmissionOutcome, AdmissionReason,
    AttentionAcknowledgementV1, AttentionActionCode, AttentionCondition, AttentionEvidenceKind,
    AttentionEvidenceRefV1, AttentionItemV1, AttentionOwner, AttentionRecommendedActionV1,
    AttentionResolutionDisposition, AttentionResolutionV1, AttentionSeverity, AttentionState,
    AttentionSubjectKind, ATTENTION_ITEM_SCHEMA_V1,
};
use serde_json::{json, Value};

use crate::config::now_iso;

use super::{epic, split_packet_key, Failure};

pub(crate) const ACKNOWLEDGED: &str = "forged.attention.acknowledged";
pub(crate) const RESOLVED: &str = "forged.attention.resolved";
pub(crate) const REOPENED: &str = "forged.attention.reopened";
pub(crate) const BEAD_SETTLEMENT_PENDING: &str = "run.bead-settlement.pending";
pub(crate) const BEAD_SETTLEMENT_SUCCEEDED: &str = "run.bead-settlement.succeeded";

/// Event vocabulary needed in addition to the inventory lifecycle events.
pub(crate) const ATTENTION_EVENT_KINDS: [&str; 13] = [
    epic::INPUT_REQUIRED,
    epic::INPUT_RESOLVED,
    "proto.quarantine",
    BEAD_SETTLEMENT_PENDING,
    BEAD_SETTLEMENT_SUCCEEDED,
    "run.protocol-terminal",
    "proto.gate",
    "proto.review",
    "forged.admission.attention",
    "forged.supervisor.attention",
    ACKNOWLEDGED,
    RESOLVED,
    REOPENED,
];

#[derive(Debug, Clone)]
struct RawAttention {
    subject_kind: AttentionSubjectKind,
    subject_id: String,
    subject_title: Option<forged_types::WorkTitleV1>,
    repository: Option<String>,
    condition: AttentionCondition,
    severity: AttentionSeverity,
    owner: AttentionOwner,
    opened_at: String,
    updated_at: String,
    source_cursor: i64,
    source_id: String,
    detail: String,
    evidence: Value,
    evidence_ref: AttentionEvidenceRefV1,
    action: AttentionRecommendedActionV1,
}

#[derive(Debug)]
struct Projected {
    item: AttentionItemV1,
    source_cursor: i64,
}

pub(crate) fn policy(
    condition: AttentionCondition,
) -> (
    AttentionSeverity,
    AttentionOwner,
    AttentionRecommendedActionV1,
) {
    use AttentionActionCode as Action;
    use AttentionCondition as Condition;
    use AttentionOwner as Owner;
    use AttentionSeverity as Severity;
    let (severity, owner, code, text) = match condition {
        Condition::InputRequired => (
            Severity::High,
            Owner::Human,
            Action::ProvideInput,
            "Provide the requested input through the domain resolution command",
        ),
        Condition::Blocked => (
            Severity::High,
            Owner::Human,
            Action::ResolveBlocker,
            "Resolve the authoritative blocker before resuming work",
        ),
        Condition::BeadsSettlementPending => (
            Severity::Medium,
            Owner::LeadAgent,
            Action::ReconcileBeads,
            "Retry the exact Beads settlement promise",
        ),
        Condition::Revoking => (
            Severity::Medium,
            Owner::LeadAgent,
            Action::ReclaimAttempt,
            "Finish the fenced attempt reclaim",
        ),
        Condition::Quarantined => (
            Severity::Critical,
            Owner::Human,
            Action::AdjudicateQuarantine,
            "Adjudicate the quarantined result evidence",
        ),
        Condition::MergeApproval => (
            Severity::Medium,
            Owner::Human,
            Action::MergePullRequest,
            "Review and merge the recorded pull request",
        ),
        Condition::MissingCost => (
            Severity::Low,
            Owner::LeadAgent,
            Action::RepairPricing,
            "Repair pricing or explicitly accept the unknown spend",
        ),
        Condition::ControllerDead => (
            Severity::High,
            Owner::LeadAgent,
            Action::RecoverController,
            "Recover or resubmit the authorized controller",
        ),
        Condition::RestartBudgetExhausted => (
            Severity::High,
            Owner::Human,
            Action::ReauthorizeWork,
            "Address the recorded failure first, then resubmit the same \
             subject (run submit / epic submit) to authorize the next \
             control revision with a fresh restart budget",
        ),
        Condition::FailedGate => (
            Severity::High,
            Owner::LeadAgent,
            Action::RepairGate,
            "Repair the failed gate and record a later passing result",
        ),
        Condition::RetryExhausted => (
            Severity::High,
            Owner::LeadAgent,
            Action::ReviseRoster,
            "Revise provider policy or explicitly adjudicate exhaustion",
        ),
        Condition::ProviderDegraded => (
            Severity::Medium,
            Owner::LeadAgent,
            Action::WaitForProvider,
            "Wait for the recorded provider limit or revise policy",
        ),
        Condition::AdmissionDeferred => (
            Severity::Medium,
            Owner::LeadAgent,
            Action::WaitForCapacity,
            "Wait for the deferred admission or free the contended capacity",
        ),
        Condition::AmbiguousEffect => (
            Severity::Critical,
            Owner::Human,
            Action::AdjudicateEffect,
            "Observe and adjudicate the exact ambiguous external effect",
        ),
        // Recording evidence-absent is a durable, irreversible claim about
        // the audit trail; both exits — repairing the delivery PR or
        // adjudicating absence — are the operator's call, never an agent's.
        Condition::MissingEvidence => (
            Severity::High,
            Owner::Human,
            Action::RepairEvidence,
            "Repair or explicitly adjudicate the missing durable evidence",
        ),
        Condition::ReviewerDisagreement => (
            Severity::High,
            Owner::Human,
            Action::AdjudicateReview,
            "Adjudicate the conflicting review verdicts",
        ),
    };
    (
        severity,
        owner,
        AttentionRecommendedActionV1 {
            code,
            text: text.to_owned(),
        },
    )
}

fn subject_kind(entry: &Value) -> AttentionSubjectKind {
    if entry.get("kind").and_then(Value::as_str) == Some("epic") {
        AttentionSubjectKind::Epic
    } else {
        AttentionSubjectKind::Run
    }
}

/// The row's already-resolved title. Attention never re-derives the
/// precedence rule and never reads Beads itself.
fn subject_title(entry: &Value) -> Option<forged_types::WorkTitleV1> {
    serde_json::from_value(entry.get("titleSource")?.clone()).ok()
}

fn repository(entry: &Value) -> Option<String> {
    entry
        .get("repo")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

fn event_value(text: &str) -> Value {
    serde_json::from_str(text).unwrap_or(Value::Null)
}

// A source carries the complete closed attention contract at the point it is
// created. Keeping that assembly in one helper is clearer than a dozen
// partially initialized builder states.
#[allow(clippy::too_many_arguments)]
fn add_raw(
    raw: &mut Vec<RawAttention>,
    entries: &BTreeMap<String, &Value>,
    subject_id: &str,
    condition: AttentionCondition,
    opened_at: impl Into<String>,
    updated_at: impl Into<String>,
    source_cursor: i64,
    source_id: impl Into<String>,
    detail: impl Into<String>,
    evidence: Value,
    evidence_kind: AttentionEvidenceKind,
    evidence_id: impl Into<String>,
) {
    let Some(entry) = entries.get(subject_id) else {
        return;
    };
    let (severity, owner, action) = policy(condition);
    raw.push(RawAttention {
        subject_kind: subject_kind(entry),
        subject_id: subject_id.to_owned(),
        subject_title: subject_title(entry),
        repository: repository(entry),
        condition,
        severity,
        owner,
        opened_at: opened_at.into(),
        updated_at: updated_at.into(),
        source_cursor,
        source_id: source_id.into(),
        detail: detail.into(),
        evidence,
        evidence_ref: AttentionEvidenceRefV1 {
            kind: evidence_kind,
            id: evidence_id.into(),
        },
        action,
    });
}

fn settlement_cursor(snapshot: &InventorySnapshot, id: &str) -> i64 {
    snapshot
        .events("run.settled")
        .iter()
        .rev()
        .find(|event| event.run_id.as_deref() == Some(id))
        .map_or(0, |event| event.event_id)
}

fn collect_domain_sources(
    snapshot: &InventorySnapshot,
    entries_slice: &[Value],
    beads: &[IssueSummary],
) -> Result<Vec<RawAttention>, Failure> {
    let InventoryUsage::Included {
        totals: usage_totals,
        latest_missing,
    } = &snapshot.usage
    else {
        return Err(Failure::internal(
            "attention projection requires included inventory usage",
        ));
    };
    let entries: BTreeMap<String, &Value> = entries_slice
        .iter()
        .filter_map(|entry| Some((entry.get("id")?.as_str()?.to_owned(), entry)))
        .collect();
    let mut raw = Vec::new();

    // Latest input event wins by append order. Resolution self-clears it.
    let mut input: BTreeMap<String, (&str, &forged_ledger::EventRow)> = BTreeMap::new();
    for kind in [epic::INPUT_REQUIRED, epic::INPUT_RESOLVED] {
        for event in snapshot.events(kind) {
            let Some(id) = event.run_id.as_ref() else {
                continue;
            };
            if input
                .get(id)
                .is_none_or(|(_, seen)| seen.event_id < event.event_id)
            {
                input.insert(id.clone(), (kind, event));
            }
        }
    }
    for (id, (kind, event)) in input {
        if kind != epic::INPUT_REQUIRED {
            continue;
        }
        let payload = event_value(&event.payload_json);
        let explanation = payload
            .get("detail")
            .and_then(Value::as_str)
            .unwrap_or("operator input is required")
            .to_owned();
        let code = payload
            .get("code")
            .and_then(Value::as_str)
            .unwrap_or("unstated");
        let child = payload
            .get("childId")
            .and_then(Value::as_str)
            .unwrap_or("the subject");
        let detail = format!("{child} is holding on {code}: {explanation}");
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::InputRequired,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            detail,
            payload,
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Terminal/domain outcome and delivery evidence.
    for (id, entry) in &entries {
        let outcome = entry.get("outcome").and_then(Value::as_str);
        let updated = entry
            .get("updatedAt")
            .and_then(Value::as_str)
            .unwrap_or_default();
        let cursor = settlement_cursor(snapshot, id);
        match outcome {
            Some("blocked") => add_raw(
                &mut raw,
                &entries,
                id,
                AttentionCondition::Blocked,
                updated,
                updated,
                cursor,
                format!("settlement:{cursor}:blocked"),
                format!(
                    "run is blocked: {}",
                    entry
                        .get("stopReason")
                        .and_then(Value::as_str)
                        .unwrap_or("no reason recorded")
                ),
                json!({"outcome": "blocked", "reason": entry.get("stopReason")}),
                AttentionEvidenceKind::Event,
                cursor.to_string(),
            ),
            Some("input-required") => add_raw(
                &mut raw,
                &entries,
                id,
                AttentionCondition::InputRequired,
                updated,
                updated,
                cursor,
                format!("settlement:{cursor}:input-required"),
                "run needs operator input",
                json!({"outcome": "input-required", "reason": entry.get("stopReason")}),
                AttentionEvidenceKind::Event,
                cursor.to_string(),
            ),
            Some(outcome @ ("clean" | "accepted-risk")) => {
                let pr = entry
                    .pointer("/delivery/pr")
                    .cloned()
                    .unwrap_or(Value::Null);
                let expected_base = entry.get("baseRef").and_then(Value::as_str);
                let recorded_base = entry.pointer("/delivery/prBase").and_then(Value::as_str);
                let exact_base = expected_base.is_some() && recorded_base == expected_base;
                let condition = if pr.is_null() || !exact_base {
                    AttentionCondition::MissingEvidence
                } else {
                    AttentionCondition::MergeApproval
                };
                let detail = if pr.is_null() {
                    format!("{outcome} candidate has no recorded delivery PR")
                } else if recorded_base.is_none() {
                    format!("{outcome} candidate PR {pr} has no durably observed base branch")
                } else if !exact_base {
                    format!(
                        "{outcome} candidate PR {pr} targets {:?}, not the required {:?}",
                        recorded_base, expected_base
                    )
                } else {
                    format!("{outcome} candidate is awaiting merge of PR {pr}")
                };
                add_raw(
                    &mut raw,
                    &entries,
                    id,
                    condition,
                    updated,
                    updated,
                    cursor,
                    format!(
                        "settlement:{cursor}:{outcome}:pr:{pr}:base:{}",
                        recorded_base.unwrap_or("missing")
                    ),
                    detail,
                    json!({
                        "outcome": outcome,
                        "pr": pr,
                        "expectedBase": expected_base,
                        "recordedBase": recorded_base,
                    }),
                    if pr.is_null() || !exact_base {
                        AttentionEvidenceKind::Event
                    } else {
                        AttentionEvidenceKind::PullRequest
                    },
                    if pr.is_null() {
                        cursor.to_string()
                    } else {
                        pr.to_string()
                    },
                );
            }
            _ => {}
        }
    }

    // Live Beads is authoritative for a blocked issue.
    let by_bead: BTreeMap<&str, &str> = entries_slice
        .iter()
        .filter_map(|entry| Some((entry.get("beadId")?.as_str()?, entry.get("id")?.as_str()?)))
        .collect();
    for issue in beads.iter().filter(|issue| issue.status == "blocked") {
        let Some(id) = by_bead.get(issue.id.as_str()) else {
            continue;
        };
        let entry = entries[id.to_owned()];
        let updated = entry
            .get("updatedAt")
            .and_then(Value::as_str)
            .unwrap_or_default();
        let source = format!(
            "bead:{}:{}",
            issue.id,
            issue.revision.as_deref().unwrap_or("unknown")
        );
        add_raw(
            &mut raw,
            &entries,
            id,
            AttentionCondition::Blocked,
            updated,
            updated,
            0,
            source,
            "Bead is blocked in the authoritative live store",
            json!({"beadId": issue.id, "status": issue.status, "revision": issue.revision}),
            AttentionEvidenceKind::Bead,
            &issue.id,
        );
    }

    // A later success clears the exact pending reconciliation promise.
    let mut bead_settlement: BTreeMap<String, (&str, &forged_ledger::EventRow)> = BTreeMap::new();
    for kind in [BEAD_SETTLEMENT_PENDING, BEAD_SETTLEMENT_SUCCEEDED] {
        for event in snapshot.events(kind) {
            let Some(id) = event.run_id.as_ref() else {
                continue;
            };
            if bead_settlement
                .get(id)
                .is_none_or(|(_, seen)| seen.event_id < event.event_id)
            {
                bead_settlement.insert(id.clone(), (kind, event));
            }
        }
    }
    for (id, (kind, event)) in bead_settlement {
        if kind != BEAD_SETTLEMENT_PENDING {
            continue;
        }
        let payload = event_value(&event.payload_json);
        let error = payload
            .get("error")
            .and_then(Value::as_str)
            .unwrap_or("unknown Beads error");
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::BeadsSettlementPending,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            format!("Beads reconciliation is pending: {error}"),
            payload,
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Revocation and quarantine custody.
    for attempt in snapshot
        .live_attempts
        .iter()
        .filter(|attempt| attempt.state == AttemptState::Revoking)
    {
        let Ok((id, _, _)) = split_packet_key(&attempt.packet_id) else {
            continue;
        };
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::Revoking,
            &attempt.updated_at,
            &attempt.updated_at,
            attempt.attempt_id,
            format!("attempt:{}", attempt.attempt_id),
            format!(
                "attempt {} is revoking: {}",
                attempt.attempt_id,
                attempt
                    .revoke_reason
                    .as_deref()
                    .unwrap_or("no reason recorded")
            ),
            json!({"attemptId": attempt.attempt_id, "packetId": attempt.packet_id, "reason": attempt.revoke_reason}),
            AttentionEvidenceKind::Attempt,
            attempt.attempt_id.to_string(),
        );
    }
    let mut latest_quarantine: BTreeMap<String, &forged_ledger::EventRow> = BTreeMap::new();
    for event in snapshot.events("proto.quarantine") {
        if let Some(id) = event.run_id.as_ref() {
            latest_quarantine.insert(id.clone(), event);
        }
    }
    for (id, event) in latest_quarantine {
        let payload = event_value(&event.payload_json);
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::Quarantined,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            format!(
                "result was quarantined: {}",
                payload
                    .get("reason")
                    .and_then(Value::as_str)
                    .unwrap_or("no reason recorded")
            ),
            payload,
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Partial spend uses the latest unpriced usage row as the occurrence.
    for (id, (usage_id, observed_at)) in latest_missing {
        let count = usage_totals
            .get(id)
            .map_or(0, |totals| totals.rows_missing_cost);
        if count == 0 {
            continue;
        }
        add_raw(
            &mut raw,
            &entries,
            id,
            AttentionCondition::MissingCost,
            observed_at,
            observed_at,
            *usage_id,
            format!("usage:{usage_id}"),
            format!("{count} usage rows carry no cost, so spend is partial"),
            json!({"rowsMissingCost": count, "usageId": usage_id}),
            AttentionEvidenceKind::Event,
            usage_id.to_string(),
        );
    }

    // Desired-work exhaustion is explicit. Controller-dead is narrower:
    // either the latest supervisor evidence names controller intervention,
    // or a promised supervisor wake is overdue. Generic desired `attention`
    // also represents input/admission holds and must never be relabelled.
    let as_of = now_iso();
    let mut supervisor_attention: BTreeMap<String, &forged_ledger::EventRow> = BTreeMap::new();
    for event in snapshot.events("forged.supervisor.attention") {
        let Some(id) = event.run_id.as_ref() else {
            continue;
        };
        if supervisor_attention
            .get(id)
            .is_none_or(|seen| seen.event_id < event.event_id)
        {
            supervisor_attention.insert(id.clone(), event);
        }
    }
    for desired in &snapshot.desired_work {
        if desired.exhausted_at.is_some()
            || desired.last_outcome == Some(DesiredReconcileOutcome::Exhausted)
        {
            add_raw(
                &mut raw,
                &entries,
                &desired.subject_id,
                AttentionCondition::RestartBudgetExhausted,
                desired
                    .exhausted_at
                    .as_deref()
                    .unwrap_or(&desired.updated_at),
                &desired.updated_at,
                i64::from(desired.control_revision as u32),
                format!(
                    "desired:{}:{}:{}:{}",
                    desired.subject_kind.as_str(),
                    desired.subject_id,
                    desired.control_revision,
                    desired.updated_at
                ),
                desired
                    .last_error
                    .clone()
                    .unwrap_or_else(|| "restart budget is exhausted".to_owned()),
                json!({
                    "controlRevision": desired.control_revision,
                    "restartBudget": desired.restart_budget,
                    "restartUsed": desired.restart_used,
                    "outcome": desired.last_outcome.map(|value| value.as_str()),
                }),
                AttentionEvidenceKind::DesiredWork,
                format!("{}:{}", desired.subject_kind.as_str(), desired.subject_id),
            );
            continue;
        }

        if desired.desired_state != DesiredState::Running {
            continue;
        }
        // A wake that is merely due is not evidence of death: authorization
        // and every reconcile finish schedule wakes at or near now, and the
        // supervisor polls every five seconds. Only a wake overdue by three
        // full polls reads as a dead-controller symptom — a fresh submit's
        // admission storm self-heals inside the grace instead of minting
        // false positives.
        const WAKE_OVERDUE_GRACE_SECONDS: u64 = 15;
        let overdue = desired.next_wake_at.as_deref().is_some_and(|wake| {
            super::supervise::deadline_after(wake, WAKE_OVERDUE_GRACE_SECONDS)
                .map(|deadline| deadline.as_str() <= as_of.as_str())
                .unwrap_or(wake <= as_of.as_str())
        });
        let explicit = supervisor_attention
            .get(&desired.subject_id)
            .and_then(|event| {
                let payload = event_value(&event.payload_json);
                let matches_current = payload.get("condition").and_then(Value::as_str)
                    == Some("controller-dead")
                    && payload.get("controllerGeneration").and_then(Value::as_u64)
                        == Some(u64::from(desired.controller_generation))
                    && payload.get("detail").and_then(Value::as_str)
                        == desired.last_error.as_deref()
                    && desired.last_outcome == Some(DesiredReconcileOutcome::Attention);
                matches_current.then_some((*event, payload))
            });
        if !overdue && explicit.is_none() {
            continue;
        }
        let (source_cursor, source_id, evidence_kind, evidence_id, opened_at, evidence) =
            if let Some((event, payload)) = explicit {
                (
                    event.event_id,
                    format!("event:{}", event.event_id),
                    AttentionEvidenceKind::Event,
                    event.event_id.to_string(),
                    event.ts.clone(),
                    payload,
                )
            } else {
                (
                    i64::from(desired.control_revision as u32),
                    format!(
                        "desired:{}:{}:{}:{}:wake:{}",
                        desired.subject_kind.as_str(),
                        desired.subject_id,
                        desired.control_revision,
                        desired.updated_at,
                        desired.next_wake_at.as_deref().unwrap_or("missing")
                    ),
                    AttentionEvidenceKind::DesiredWork,
                    format!("{}:{}", desired.subject_kind.as_str(), desired.subject_id),
                    desired.next_wake_at.clone().unwrap_or_default(),
                    json!({
                        "controlRevision": desired.control_revision,
                        "controllerGeneration": desired.controller_generation,
                        "nextWakeAt": desired.next_wake_at,
                        "outcome": desired.last_outcome.map(|value| value.as_str()),
                    }),
                )
            };
        add_raw(
            &mut raw,
            &entries,
            &desired.subject_id,
            AttentionCondition::ControllerDead,
            opened_at,
            &desired.updated_at,
            source_cursor,
            source_id,
            desired.last_error.clone().unwrap_or_else(|| {
                format!(
                    "supervisor wake {} is overdue",
                    desired.next_wake_at.as_deref().unwrap_or("unknown")
                )
            }),
            evidence,
            evidence_kind,
            evidence_id,
        );
    }

    // Latest failed gate is attention only when no automatic execution path
    // is live or scheduled and no closing terminal outcome settled the run.
    // Closing covers landed, superseded, cancelled, and accepted-risk: a
    // settled run repairs via a supersedes successor, never in place.
    // Blocked/input-required stops and legacy-stopped rows without a
    // terminal outcome keep flagging.
    let mut latest_gate: BTreeMap<String, &forged_ledger::EventRow> = BTreeMap::new();
    for event in snapshot.events("proto.gate") {
        if let Some(id) = event.run_id.as_ref() {
            latest_gate.insert(id.clone(), event);
        }
    }
    for (id, event) in latest_gate {
        let payload = event_value(&event.payload_json);
        if payload.get("passed").and_then(Value::as_bool) != Some(false) {
            continue;
        }
        let has_live = snapshot.live_attempts.iter().any(|attempt| {
            split_packet_key(&attempt.packet_id).is_ok_and(|(run_id, _, _)| run_id == id)
        });
        let has_scheduled = snapshot.desired_work.iter().any(|desired| {
            desired.subject_id == id
                && desired.desired_state == DesiredState::Running
                && desired.next_wake_at.is_some()
        });
        let has_closing_outcome = snapshot.runs.iter().any(|run| {
            run.run_id == id
                && matches!(
                    run.terminal_outcome,
                    Some(
                        RunOutcome::Landed
                            | RunOutcome::Superseded
                            | RunOutcome::Cancelled
                            | RunOutcome::AcceptedRisk
                    )
                )
        });
        if has_live || has_scheduled || has_closing_outcome {
            continue;
        }
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::FailedGate,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            "latest gate failed and no automatic repair path is active",
            payload,
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Terminal provider exhaustion.
    let mut latest_terminal: BTreeMap<String, &forged_ledger::EventRow> = BTreeMap::new();
    for event in snapshot.events("run.protocol-terminal") {
        if let Some(id) = event.run_id.as_ref() {
            latest_terminal.insert(id.clone(), event);
        }
    }
    for (id, event) in latest_terminal {
        let payload = event_value(&event.payload_json);
        if payload.pointer("/terminal/providerUnavailable").is_none() {
            continue;
        }
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::RetryExhausted,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            "provider retry budget is exhausted",
            payload,
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Only typed rate-limit decisions are provider degradation. Routine
    // capacity deferrals remain queued work until a parked controller
    // crosses its wake threshold and appends the durable marker below.
    for decision in &snapshot.admission_decisions {
        if decision.outcome != AdmissionOutcome::Deferred
            || !matches!(
                decision.reason,
                AdmissionReason::RateLimitCeiling | AdmissionReason::StaleRateLimit
            )
        {
            continue;
        }
        let subject_id = match decision.subject_kind {
            forged_types::AdmissionSubjectKind::Packet => {
                let Ok((run_id, _, _)) = split_packet_key(&decision.subject_id) else {
                    continue;
                };
                run_id
            }
            _ => decision.subject_id.clone(),
        };
        let Some(entry) = entries.get(&subject_id) else {
            continue;
        };
        let updated = entry
            .get("updatedAt")
            .and_then(Value::as_str)
            .unwrap_or_default();
        add_raw(
            &mut raw,
            &entries,
            &subject_id,
            AttentionCondition::ProviderDegraded,
            updated,
            updated,
            i64::from(decision.control_revision as u32),
            format!("admission:{}", decision.batch_id),
            format!("provider admission deferred: {:?}", decision.reason),
            serde_json::to_value(decision).unwrap_or(Value::Null),
            AttentionEvidenceKind::AdmissionDecision,
            &decision.batch_id,
        );
    }

    // A parked controller appends one durable marker after its wake
    // threshold. The item stands while that packet's LATEST admission
    // decision is still deferred and clears through the admit itself — no
    // attention control resolves it. Rate-limit deferrals keep their
    // ProviderDegraded projection above.
    let mut parked: BTreeMap<String, (&forged_ledger::EventRow, Value)> = BTreeMap::new();
    for event in snapshot.events("forged.admission.attention") {
        let Some(id) = event.run_id.as_ref() else {
            continue;
        };
        let payload = event_value(&event.payload_json);
        if payload.get("condition").and_then(Value::as_str) != Some("admission-deferred") {
            continue;
        }
        if parked
            .get(id)
            .is_none_or(|(seen, _)| seen.event_id < event.event_id)
        {
            parked.insert(id.clone(), (event, payload));
        }
    }
    for (id, (event, payload)) in parked {
        let Some(packet_id) = payload.get("packetId").and_then(Value::as_str) else {
            continue;
        };
        let deferred = snapshot.admission_decisions.iter().find(|decision| {
            decision.subject_kind == forged_types::AdmissionSubjectKind::Packet
                && decision.subject_id == packet_id
                && decision.outcome == AdmissionOutcome::Deferred
                && !matches!(
                    decision.reason,
                    AdmissionReason::RateLimitCeiling | AdmissionReason::StaleRateLimit
                )
        });
        let Some(decision) = deferred else {
            continue;
        };
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::AdmissionDeferred,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            format!(
                "run is parked: packet {packet_id} admission deferred ({:?})",
                decision.reason
            ),
            json!({
                "packetId": packet_id,
                "wakes": payload.get("wakes"),
                "decision": decision,
            }),
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Ambiguous external effects and retained unknown-effect capacity.
    for operation in &snapshot.inflight_operations {
        if operation.effect_class != EffectClass::HumanAmbiguous {
            continue;
        }
        let Some(id) = operation.run_id.as_ref() else {
            continue;
        };
        add_raw(
            &mut raw,
            &entries,
            id,
            AttentionCondition::AmbiguousEffect,
            &operation.created_at,
            &operation.updated_at,
            0,
            format!("operation:{}", operation.operation_id),
            format!(
                "external effect {} has an ambiguous outcome",
                operation.name
            ),
            json!({"operationId": operation.operation_id, "name": operation.name}),
            AttentionEvidenceKind::Operation,
            &operation.operation_id,
        );
    }
    for reservation in snapshot
        .admission_reservations
        .iter()
        .filter(|row| row.state == AdmissionReservationState::Orphaned)
    {
        let subject_id = match reservation.subject_kind {
            forged_types::AdmissionSubjectKind::Packet => {
                let Ok((run_id, _, _)) = split_packet_key(&reservation.subject_id) else {
                    continue;
                };
                run_id
            }
            _ => reservation.subject_id.clone(),
        };
        add_raw(
            &mut raw,
            &entries,
            &subject_id,
            AttentionCondition::AmbiguousEffect,
            &reservation.created_at,
            &reservation.updated_at,
            0,
            format!("reservation:{}", reservation.reservation_id),
            "admission reservation retains capacity until its external effect is known",
            json!({"reservationId": reservation.reservation_id, "state": reservation.state.as_str()}),
            AttentionEvidenceKind::Reservation,
            &reservation.reservation_id,
        );
    }

    // The snapshot performs the attempt-to-manifest anti-join inside its one
    // transaction. No artifact path is opened by this ordinary projection.
    for attempt in &snapshot.attempts_missing_artifacts {
        let Ok((id, _, _)) = split_packet_key(&attempt.packet_id) else {
            continue;
        };
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::MissingEvidence,
            &attempt.updated_at,
            &attempt.updated_at,
            attempt.attempt_id,
            format!("attempt:{}:manifest-missing", attempt.attempt_id),
            format!(
                "attempt {} has no durable artifact manifest",
                attempt.attempt_id
            ),
            json!({"attemptId": attempt.attempt_id, "packetId": attempt.packet_id}),
            AttentionEvidenceKind::Attempt,
            attempt.attempt_id.to_string(),
        );
    }

    // Materially different available verdicts at the newest review sequence.
    let mut reviews: BTreeMap<String, Vec<(&forged_ledger::EventRow, Value)>> = BTreeMap::new();
    for event in snapshot.events("proto.review") {
        let Some(id) = event.run_id.as_ref() else {
            continue;
        };
        let payload = event_value(&event.payload_json);
        reviews
            .entry(id.clone())
            .or_default()
            .push((event, payload));
    }
    for (id, rows) in reviews {
        let latest_seq = rows
            .iter()
            .filter_map(|(_, payload)| payload.get("seq").and_then(Value::as_i64))
            .max();
        let selected: Vec<_> = rows
            .into_iter()
            .filter(|(_, payload)| {
                payload.get("seq").and_then(Value::as_i64) == latest_seq
                    && payload.get("available").and_then(Value::as_bool) == Some(true)
            })
            .collect();
        let verdicts: BTreeSet<&str> = selected
            .iter()
            .filter_map(|(_, payload)| payload.get("verdict").and_then(Value::as_str))
            .collect();
        if verdicts.len() < 2 {
            continue;
        }
        let newest = selected
            .iter()
            .max_by_key(|(event, _)| event.event_id)
            .expect("nonempty disagreement");
        let event_ids: Vec<i64> = selected.iter().map(|(event, _)| event.event_id).collect();
        add_raw(
            &mut raw,
            &entries,
            &id,
            AttentionCondition::ReviewerDisagreement,
            &newest.0.ts,
            &newest.0.ts,
            newest.0.event_id,
            format!("reviews:{event_ids:?}"),
            format!(
                "reviewers disagree at sequence {:?}: {verdicts:?}",
                latest_seq
            ),
            json!({"seq": latest_seq, "eventIds": event_ids, "verdicts": verdicts}),
            AttentionEvidenceKind::Event,
            newest.0.event_id.to_string(),
        );
    }

    Ok(raw)
}

struct TransitionState {
    state: AttentionState,
    acknowledgement: Option<AttentionAcknowledgementV1>,
    resolution: Option<AttentionResolutionV1>,
    updated_at: Option<String>,
}

fn transition_state(
    snapshot: &InventorySnapshot,
    attention: &str,
    occurrence: &str,
) -> Result<TransitionState, Failure> {
    let mut transitions = Vec::new();
    for kind in [ACKNOWLEDGED, RESOLVED, REOPENED] {
        for event in snapshot.events(kind) {
            let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!("invalid stored attention transition: {error}"))
            })?;
            if payload.get("schema").and_then(Value::as_str)
                != Some("forged.attention-transition/1")
            {
                return Err(Failure::internal(format!(
                    "unknown stored attention transition schema in event {}",
                    event.event_id
                )));
            }
            if payload.get("attentionId").and_then(Value::as_str) == Some(attention)
                && payload.get("occurrenceId").and_then(Value::as_str) == Some(occurrence)
            {
                transitions.push((event, payload));
            }
        }
    }
    transitions.sort_by_key(|(event, _)| event.event_id);
    let mut state = AttentionState::Open;
    let mut acknowledgement = None;
    let mut resolution = None;
    let mut updated = None;
    for (event, payload) in transitions {
        let actor = payload
            .get("actor")
            .and_then(Value::as_str)
            .ok_or_else(|| Failure::internal("stored attention transition has no actor"))?;
        match event.kind.as_str() {
            ACKNOWLEDGED => {
                // A stale acknowledgement appended after resolution cannot
                // resurrect custody. The writer now refuses it atomically;
                // retain fail-closed projection for historical/manual rows.
                if state == AttentionState::Resolved {
                    continue;
                }
                state = AttentionState::Acknowledged;
                acknowledgement = Some(AttentionAcknowledgementV1 {
                    actor: actor.to_owned(),
                    at: event.ts.clone(),
                });
                resolution = None;
            }
            RESOLVED => {
                let disposition: AttentionResolutionDisposition =
                    serde_json::from_value(payload.get("disposition").cloned().ok_or_else(
                        || Failure::internal("stored resolution has no disposition"),
                    )?)
                    .map_err(|error| {
                        Failure::internal(format!("unknown stored resolution disposition: {error}"))
                    })?;
                state = AttentionState::Resolved;
                resolution = Some(AttentionResolutionV1 {
                    actor: actor.to_owned(),
                    disposition,
                    note: payload
                        .get("note")
                        .and_then(Value::as_str)
                        .unwrap_or_default()
                        .to_owned(),
                    at: event.ts.clone(),
                });
            }
            REOPENED => {
                if state != AttentionState::Resolved {
                    continue;
                }
                state = AttentionState::Open;
                acknowledgement = None;
                resolution = None;
            }
            _ => unreachable!("closed transition kinds"),
        }
        updated = Some(event.ts.clone());
    }
    Ok(TransitionState {
        state,
        acknowledgement,
        resolution,
        updated_at: updated,
    })
}

/// Conditions for which attention itself owns explicit custody. Other
/// conditions clear only through their authoritative domain transition.
/// Missing evidence is source-qualified, not condition-wide: only an
/// occurrence composed entirely of manifest-less attempts is adjudicable.
/// A clean/accepted-risk run whose delivery PR is missing or wrong-based
/// raises the same condition from settlement evidence, but that gap is
/// repairable — recording the exact-base PR clears it — so any occurrence
/// carrying non-attempt evidence refuses explicit resolution.
pub(crate) fn resolution_allowed(item: &AttentionItemV1) -> bool {
    match item.condition {
        AttentionCondition::Quarantined
        | AttentionCondition::MissingCost
        | AttentionCondition::RetryExhausted
        | AttentionCondition::ReviewerDisagreement => true,
        AttentionCondition::MissingEvidence => item
            .evidence_refs
            .iter()
            .all(|evidence| evidence.kind == AttentionEvidenceKind::Attempt),
        _ => false,
    }
}

/// The two triage classes: a `decision` waits on operator judgment or
/// authorization; a `symptom` clears only through a domain transition an
/// agent or the supervisor owns.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum AttentionClass {
    Decision,
    Symptom,
}

/// The fixed condition-to-class mapping every surface consumes. Exhaustive
/// on purpose: a new condition fails the build until it is classified.
/// Missing evidence is a decision condition-wide even though only
/// attempt-only occurrences accept explicit resolution: both of its exits
/// — record the exact-base delivery PR or adjudicate evidence-absent —
/// wait on operator judgment, never on a supervisor-owned transition.
pub(crate) fn classification(condition: AttentionCondition) -> AttentionClass {
    use AttentionCondition as Condition;
    match condition {
        Condition::InputRequired
        | Condition::MergeApproval
        | Condition::Quarantined
        | Condition::MissingCost
        | Condition::RetryExhausted
        | Condition::ReviewerDisagreement
        | Condition::AmbiguousEffect
        | Condition::RestartBudgetExhausted
        | Condition::MissingEvidence => AttentionClass::Decision,
        Condition::Blocked
        | Condition::BeadsSettlementPending
        | Condition::Revoking
        | Condition::ControllerDead
        | Condition::FailedGate
        | Condition::ProviderDegraded
        | Condition::AdmissionDeferred => AttentionClass::Symptom,
    }
}

/// Project active and resolved occurrences. Controls use the resolved rows;
/// operator surfaces filter them through [`project_active`].
pub(crate) fn project_all(
    snapshot: &InventorySnapshot,
    entries: &[Value],
    beads: &[IssueSummary],
) -> Result<Vec<AttentionItemV1>, Failure> {
    let raw = collect_domain_sources(snapshot, entries, beads)?;
    let mut buckets: BTreeMap<
        (AttentionSubjectKind, String, AttentionCondition),
        Vec<RawAttention>,
    > = BTreeMap::new();
    for source in raw {
        buckets
            .entry((
                source.subject_kind,
                source.subject_id.clone(),
                source.condition,
            ))
            .or_default()
            .push(source);
    }
    let mut projected = Vec::new();
    for ((subject_kind, subject_id, condition), mut sources) in buckets {
        sources.sort_by(|left, right| {
            (left.source_cursor, &left.source_id).cmp(&(right.source_cursor, &right.source_id))
        });
        let latest = sources.last().expect("nonempty attention bucket");
        let stable_id = attention_id(subject_kind, &subject_id, condition);
        let causal = sources
            .iter()
            .map(|source| source.source_id.as_str())
            .collect::<Vec<_>>()
            .join("\n");
        let occurrence_id = attention_occurrence_id(&stable_id, &causal);
        let transition = transition_state(snapshot, &stable_id, &occurrence_id)?;
        let mut evidence_refs: Vec<_> = sources
            .iter()
            .map(|source| source.evidence_ref.clone())
            .collect();
        evidence_refs.sort_by(|left, right| {
            (left.kind, left.id.as_str()).cmp(&(right.kind, right.id.as_str()))
        });
        evidence_refs.dedup();
        let opened_at = sources
            .iter()
            .map(|source| source.opened_at.as_str())
            .min()
            .unwrap_or_default()
            .to_owned();
        let updated_at = transition
            .updated_at
            .unwrap_or_else(|| latest.updated_at.clone());
        projected.push(Projected {
            source_cursor: latest.source_cursor,
            item: AttentionItemV1 {
                schema: ATTENTION_ITEM_SCHEMA_V1.to_owned(),
                legacy_id: subject_id.clone(),
                legacy_kind: if subject_kind == AttentionSubjectKind::Epic {
                    "epic".to_owned()
                } else {
                    "slice".to_owned()
                },
                attention_id: stable_id,
                occurrence_id,
                subject_kind,
                subject_id,
                subject_title: latest.subject_title.clone(),
                repository: latest.repository.clone(),
                condition,
                severity: latest.severity,
                owner: latest.owner,
                state: transition.state,
                opened_at,
                updated_at,
                detail: if sources.len() == 1 {
                    latest.detail.clone()
                } else {
                    format!("{} ({} durable sources)", latest.detail, sources.len())
                },
                evidence: latest.evidence.clone(),
                evidence_refs,
                recommended_action: latest.action.clone(),
                acknowledgement: transition.acknowledgement,
                resolution: transition.resolution,
            },
        });
    }
    projected.sort_by(|left, right| {
        (
            left.item.severity,
            left.item.owner,
            left.source_cursor,
            left.item.subject_id.as_str(),
            left.item.condition,
        )
            .cmp(&(
                right.item.severity,
                right.item.owner,
                right.source_cursor,
                right.item.subject_id.as_str(),
                right.item.condition,
            ))
    });
    Ok(projected.into_iter().map(|value| value.item).collect())
}

pub(crate) fn project_active(
    snapshot: &InventorySnapshot,
    entries: &[Value],
    beads: &[IssueSummary],
) -> Result<Vec<AttentionItemV1>, Failure> {
    Ok(project_all(snapshot, entries, beads)?
        .into_iter()
        .filter(|item| item.state != AttentionState::Resolved)
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use forged_ledger::{
        AdmissionReservationRow, DesiredSubjectKind, DesiredWorkRow, EventRow, InventoryUsage,
        RunRow, RunState,
    };
    use forged_types::{
        AdmissionCapacityV1, AdmissionDecisionV1, AdmissionResourceClass, AdmissionSubjectKind,
        ADMISSION_DECISION_SCHEMA_V1,
    };

    fn snapshot() -> InventorySnapshot {
        InventorySnapshot {
            runs: Vec::new(),
            live_attempts: Vec::new(),
            attempts_missing_artifacts: Vec::new(),
            usage: InventoryUsage::Included {
                totals: BTreeMap::new(),
                latest_missing: BTreeMap::new(),
            },
            latest_event: BTreeMap::new(),
            events_by_kind: BTreeMap::new(),
            desired_work: Vec::new(),
            inflight_operations: Vec::new(),
            admission_decisions: Vec::new(),
            admission_reservations: Vec::new(),
            work_identities: BTreeMap::new(),
        }
    }

    fn entry(id: &str) -> Value {
        json!({
            "id": id,
            "kind": "slice",
            "repo": "/repo",
            "baseRef": "main",
            "updatedAt": "2026-08-14T12:00:00.000000000Z",
        })
    }

    fn event(id: i64, run: &str, kind: &str, payload: Value) -> EventRow {
        EventRow {
            event_id: id,
            ts: format!("2026-08-14T12:00:00.{id:09}Z"),
            run_id: Some(run.to_owned()),
            kind: kind.to_owned(),
            payload_json: payload.to_string(),
        }
    }

    fn run_row(id: &str, state: RunState, terminal_outcome: Option<RunOutcome>) -> RunRow {
        RunRow {
            run_id: id.to_owned(),
            bead_id: "bead-gate".to_owned(),
            repo: "/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "forged/bead-gate".to_owned(),
            protocol: "anvil/1".to_owned(),
            state,
            stop_reason: None,
            created_at: "2026-08-14T11:00:00.000000000Z".to_owned(),
            updated_at: "2026-08-14T12:00:00.000000000Z".to_owned(),
            terminal_outcome,
            delivery_pr: None,
            delivery_sha: None,
            superseded_by: None,
        }
    }

    fn failed_gate_snapshot(run: RunRow) -> InventorySnapshot {
        let mut snapshot = snapshot();
        snapshot.events_by_kind.insert(
            "proto.gate".to_owned(),
            vec![event(
                1,
                &run.run_id,
                "proto.gate",
                json!({"passed": false}),
            )],
        );
        snapshot.runs.push(run);
        snapshot
    }

    fn desired(id: &str) -> DesiredWorkRow {
        DesiredWorkRow {
            subject_kind: DesiredSubjectKind::Run,
            subject_id: id.to_owned(),
            desired_state: DesiredState::Running,
            control_revision: 1,
            controller_generation: 2,
            predecessor_generation: Some(1),
            restart_budget: 3,
            restart_used: 1,
            next_wake_at: None,
            last_progress_at: None,
            last_outcome: Some(DesiredReconcileOutcome::Attention),
            last_error: Some("input is required".to_owned()),
            exhausted_at: None,
            reconcile_token: None,
            reconcile_lease_until: None,
            created_at: "2026-08-14T11:00:00.000000000Z".to_owned(),
            updated_at: "2026-08-14T12:00:00.000000000Z".to_owned(),
        }
    }

    #[test]
    fn packet_admission_sources_project_on_the_owning_run() {
        let mut snapshot = snapshot();
        snapshot.admission_decisions.push(AdmissionDecisionV1 {
            schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
            batch_id: "batch-rate-limit".to_owned(),
            subject_kind: AdmissionSubjectKind::Packet,
            subject_id: "run-packet/implement/0".to_owned(),
            control_revision: 1,
            repository: "/repo".to_owned(),
            priority: None,
            provider: Some("codex".to_owned()),
            model: Some("gpt".to_owned()),
            resource_class: AdmissionResourceClass::RepositoryWrite,
            outcome: AdmissionOutcome::Deferred,
            reason: AdmissionReason::RateLimitCeiling,
            policy_revision: "policy".to_owned(),
            evidence: AdmissionCapacityV1::default(),
            next_eligible_wake_at: None,
        });
        snapshot
            .admission_reservations
            .push(AdmissionReservationRow {
                reservation_id: "reservation-packet".to_owned(),
                decision_id: "decision-packet".to_owned(),
                work_key: "packet:run-packet/implement/0:1".to_owned(),
                subject_kind: AdmissionSubjectKind::Packet,
                subject_id: "run-packet/implement/0".to_owned(),
                control_revision: 1,
                repository: "/repo".to_owned(),
                provider: "codex".to_owned(),
                model: "gpt".to_owned(),
                resource_class: AdmissionResourceClass::RepositoryWrite,
                state: AdmissionReservationState::Orphaned,
                owner_kind: Some("attempt".to_owned()),
                owner_id: Some("attempt-1".to_owned()),
                recovery_deadline: "2026-08-14T11:00:00.000000000Z".to_owned(),
                last_error: Some("effect identity unknown".to_owned()),
                created_at: "2026-08-14T10:00:00.000000000Z".to_owned(),
                updated_at: "2026-08-14T11:00:00.000000000Z".to_owned(),
                released_at: None,
            });

        let items = project_active(&snapshot, &[entry("run-packet")], &[]).expect("project");
        let conditions: BTreeSet<_> = items.iter().map(|item| item.condition).collect();
        assert!(conditions.contains(&AttentionCondition::ProviderDegraded));
        assert!(conditions.contains(&AttentionCondition::AmbiguousEffect));
        assert!(items.iter().all(|item| item.subject_id == "run-packet"));
    }

    #[test]
    fn controller_dead_requires_supervisor_evidence_or_an_overdue_wake() {
        let mut snapshot = snapshot();
        snapshot.desired_work.push(desired("run-controller"));
        assert!(project_active(&snapshot, &[entry("run-controller")], &[])
            .expect("project generic attention")
            .iter()
            .all(|item| item.condition != AttentionCondition::ControllerDead));

        snapshot.desired_work[0].last_outcome = Some(DesiredReconcileOutcome::Backoff);
        snapshot.desired_work[0].last_error = Some("retry later".to_owned());
        snapshot.desired_work[0].next_wake_at = Some("2000-01-01T00:00:00.000000000Z".to_owned());
        assert!(project_active(&snapshot, &[entry("run-controller")], &[])
            .expect("project overdue wake")
            .iter()
            .any(|item| item.condition == AttentionCondition::ControllerDead));

        snapshot.desired_work[0] = desired("run-controller");
        snapshot.desired_work[0].last_error = Some("controller identity unknown".to_owned());
        snapshot.events_by_kind.insert(
            "forged.supervisor.attention".to_owned(),
            vec![event(
                9,
                "run-controller",
                "forged.supervisor.attention",
                json!({
                    "condition": "controller-dead",
                    "controllerGeneration": 2,
                    "detail": "controller identity unknown",
                }),
            )],
        );
        assert!(project_active(&snapshot, &[entry("run-controller")], &[])
            .expect("project explicit intervention")
            .iter()
            .any(|item| item.condition == AttentionCondition::ControllerDead));
    }

    #[test]
    fn later_unavailable_review_sequence_clears_old_disagreement() {
        let mut snapshot = snapshot();
        snapshot.events_by_kind.insert(
            "proto.review".to_owned(),
            vec![
                event(
                    1,
                    "run-review",
                    "proto.review",
                    json!({"seq": 1, "available": true, "verdict": "approve"}),
                ),
                event(
                    2,
                    "run-review",
                    "proto.review",
                    json!({"seq": 1, "available": true, "verdict": "block"}),
                ),
                event(
                    3,
                    "run-review",
                    "proto.review",
                    json!({"seq": 2, "available": false, "verdict": null}),
                ),
                event(
                    4,
                    "run-review",
                    "proto.review",
                    json!({"seq": 2, "available": false, "verdict": null}),
                ),
            ],
        );
        assert!(project_active(&snapshot, &[entry("run-review")], &[])
            .expect("project")
            .iter()
            .all(|item| item.condition != AttentionCondition::ReviewerDisagreement));
    }

    #[test]
    fn failed_gate_is_suppressed_by_every_closing_terminal_outcome() {
        for outcome in [
            RunOutcome::Landed,
            RunOutcome::Superseded,
            RunOutcome::Cancelled,
            RunOutcome::AcceptedRisk,
        ] {
            let snapshot =
                failed_gate_snapshot(run_row("run-gate", RunState::Stopped, Some(outcome)));
            assert!(
                project_active(&snapshot, &[entry("run-gate")], &[])
                    .expect("project")
                    .iter()
                    .all(|item| item.condition != AttentionCondition::FailedGate),
                "{outcome:?} must close the failed-gate item"
            );
        }
    }

    #[test]
    fn failed_gate_still_flags_runs_the_outcome_leaves_open() {
        for (state, outcome) in [
            (RunState::Stopped, Some(RunOutcome::Blocked)),
            (RunState::Stopped, Some(RunOutcome::InputRequired)),
            (RunState::Active, None),
        ] {
            let snapshot = failed_gate_snapshot(run_row("run-gate", state, outcome));
            assert!(
                project_active(&snapshot, &[entry("run-gate")], &[])
                    .expect("project")
                    .iter()
                    .any(|item| item.condition == AttentionCondition::FailedGate),
                "{state:?}/{outcome:?} must keep the failed-gate item open"
            );
        }
    }

    #[test]
    fn failed_gate_still_flags_a_legacy_stopped_run_without_an_outcome() {
        let snapshot = failed_gate_snapshot(run_row("run-gate", RunState::Stopped, None));
        assert!(project_active(&snapshot, &[entry("run-gate")], &[])
            .expect("project")
            .iter()
            .any(|item| item.condition == AttentionCondition::FailedGate));
    }

    #[test]
    fn attention_refuses_a_snapshot_that_omitted_usage_evidence() {
        let mut snapshot = snapshot();
        snapshot.usage = InventoryUsage::Omitted;
        let error = project_active(&snapshot, &[entry("run-usage")], &[])
            .expect_err("attention cannot interpret omitted usage as no missing cost");
        assert!(error.message.contains("requires included inventory usage"));
    }

    #[test]
    fn classification_pins_the_exact_decision_and_symptom_sets() {
        use AttentionCondition as Condition;
        let decisions = [
            Condition::InputRequired,
            Condition::MergeApproval,
            Condition::Quarantined,
            Condition::MissingCost,
            Condition::RetryExhausted,
            Condition::ReviewerDisagreement,
            Condition::AmbiguousEffect,
            Condition::RestartBudgetExhausted,
            Condition::MissingEvidence,
        ];
        let symptoms = [
            Condition::Blocked,
            Condition::BeadsSettlementPending,
            Condition::Revoking,
            Condition::ControllerDead,
            Condition::FailedGate,
            Condition::ProviderDegraded,
            Condition::AdmissionDeferred,
        ];
        assert_eq!(decisions.len(), 9);
        assert_eq!(symptoms.len(), 7);
        for condition in decisions {
            assert_eq!(
                classification(condition),
                AttentionClass::Decision,
                "{condition:?} is an operator decision"
            );
        }
        for condition in symptoms {
            assert_eq!(
                classification(condition),
                AttentionClass::Symptom,
                "{condition:?} clears through a domain transition"
            );
        }
        // The two pinned sets cover the whole closed condition contract; the
        // exhaustive match in `classification` breaks the build first when a
        // new condition appears, and this count breaks when a set drifts.
        let all: BTreeSet<String> = decisions
            .iter()
            .chain(symptoms.iter())
            .map(|condition| serde_json::to_string(condition).expect("closed condition"))
            .collect();
        assert_eq!(all.len(), 16, "one class per condition, no overlap");
    }

    #[test]
    fn parked_deferral_marker_stands_only_while_the_decision_stays_deferred() {
        let packet_decision = |outcome, reason| AdmissionDecisionV1 {
            schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
            batch_id: "batch-park".to_owned(),
            subject_kind: AdmissionSubjectKind::Packet,
            subject_id: "run-park/remediation/0".to_owned(),
            control_revision: 1,
            repository: "/repo".to_owned(),
            priority: None,
            provider: Some("claude".to_owned()),
            model: Some("opus".to_owned()),
            resource_class: AdmissionResourceClass::RepositoryWrite,
            outcome,
            reason,
            policy_revision: "policy".to_owned(),
            evidence: AdmissionCapacityV1::default(),
            next_eligible_wake_at: None,
        };
        let mut snapshot = snapshot();
        snapshot.events_by_kind.insert(
            "forged.admission.attention".to_owned(),
            vec![event(
                5,
                "run-park",
                "forged.admission.attention",
                json!({
                    "schema": "forged.admission.attention/1",
                    "condition": "admission-deferred",
                    "packetId": "run-park/remediation/0",
                    "wakes": 3,
                }),
            )],
        );

        // No decision joined: the marker alone raises nothing.
        assert!(project_active(&snapshot, &[entry("run-park")], &[])
            .expect("project marker without decision")
            .iter()
            .all(|item| item.condition != AttentionCondition::AdmissionDeferred));

        snapshot.admission_decisions.push(packet_decision(
            AdmissionOutcome::Deferred,
            AdmissionReason::RepositoryWriteCapacity,
        ));
        let items =
            project_active(&snapshot, &[entry("run-park")], &[]).expect("project parked deferral");
        let item = items
            .iter()
            .find(|item| item.condition == AttentionCondition::AdmissionDeferred)
            .expect("parked deferral item");
        assert_eq!(item.subject_id, "run-park");
        assert!(item.detail.contains("RepositoryWriteCapacity"), "{item:?}");

        // The admit is the domain transition that clears the entry.
        snapshot.admission_decisions[0] = packet_decision(
            AdmissionOutcome::Admitted,
            AdmissionReason::CapacityAvailable,
        );
        assert!(project_active(&snapshot, &[entry("run-park")], &[])
            .expect("project admitted packet")
            .iter()
            .all(|item| item.condition != AttentionCondition::AdmissionDeferred));
    }
}
