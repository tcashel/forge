//! Typed operator-attention projection and lifecycle controls.
//!
//! Attention is a view over durable domain facts. It does not authorize,
//! retry, resolve, or otherwise mutate the domain object that raised it.

use std::collections::{BTreeMap, BTreeSet};

use crate::core::work_types::IssueSummary;
use forged_ledger::{
    AdmissionReservationState, AttemptState, DesiredReconcileOutcome, DesiredState, EffectClass,
    EventRow, InventorySnapshot, InventoryUsage, RunOutcome, RunState, WorkObservationSnapshot,
};
use forged_types::{
    attention_id, attention_occurrence_id, AdmissionOutcome, AdmissionReason,
    AttentionAcknowledgementV1, AttentionActionCode, AttentionCondition, AttentionEvidenceKind,
    AttentionEvidenceRefV1, AttentionItemV1, AttentionOwner, AttentionRecommendedActionV1,
    AttentionResolutionDisposition, AttentionResolutionV1, AttentionSeverity, AttentionState,
    AttentionSubjectKind, OperationActionV1, Outcome, PacketResult, WorkIdentitySubjectKind,
    WorkTitleV1, ATTENTION_ITEM_SCHEMA_V1,
};
use serde_json::{json, Value};

use crate::config::now_iso;

use super::{epic, split_packet_key, Failure};

pub(crate) const ACKNOWLEDGED: &str = "forged.attention.acknowledged";
pub(crate) const RESOLVED: &str = "forged.attention.resolved";
pub(crate) const REOPENED: &str = "forged.attention.reopened";
pub(crate) const WORK_SETTLEMENT_PENDING: &str = "run.bead-settlement.pending";
pub(crate) const WORK_SETTLEMENT_SUCCEEDED: &str = "run.bead-settlement.succeeded";

/// Event vocabulary needed in addition to the inventory lifecycle events.
pub(crate) const ATTENTION_EVENT_KINDS: [&str; 13] = [
    epic::INPUT_REQUIRED,
    epic::INPUT_RESOLVED,
    "proto.quarantine",
    WORK_SETTLEMENT_PENDING,
    WORK_SETTLEMENT_SUCCEEDED,
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
    subject_id: String,
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

enum ProjectionSurface<'a> {
    Inventory,
    Observation {
        snapshot: &'a WorkObservationSnapshot,
        review_disagreements: &'a [(String, i64, String, Value)],
        results: &'a BTreeMap<i64, PacketResult>,
        subject_title: &'a WorkTitleV1,
    },
}

impl ProjectionSurface<'_> {
    fn is_observation(&self) -> bool {
        matches!(self, Self::Observation { .. })
    }
}

struct ProjectionInput<'a> {
    runs: &'a [forged_ledger::RunRow],
    attempts: &'a [forged_ledger::AttemptRow],
    attempts_missing_artifacts: Vec<&'a forged_ledger::AttemptRow>,
    events: Vec<&'a EventRow>,
    desired_work: &'a [forged_ledger::DesiredWorkRow],
    inflight_operations: &'a [forged_ledger::OperationRow],
    admission_decisions: &'a [forged_types::AdmissionDecisionV1],
    admission_reservations: &'a [forged_ledger::AdmissionReservationRow],
    usage: ProjectionUsage<'a>,
    entries: &'a [Value],
    work: &'a [IssueSummary],
    surface: ProjectionSurface<'a>,
}

#[derive(Clone, Copy)]
enum ProjectionUsage<'a> {
    Inventory(&'a InventoryUsage),
    Observation(&'a WorkObservationSnapshot),
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
        Condition::WorkSettlementPending => (
            Severity::Medium,
            Owner::LeadAgent,
            Action::ReconcileWork,
            "Retry the exact work settlement promise",
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
        Condition::DeadlineExhausted => (
            Severity::High,
            Owner::LeadAgent,
            Action::ResumeSeat,
            "Resume the deadline-killed stage from the worktree the seat left",
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

/// Closed recommendation-code to domain-verb table. A new code stays
/// non-executable until its transition has an end-to-end honesty test.
#[allow(clippy::too_many_arguments)]
pub(crate) fn recommendation_actions(
    recommendation: &AttentionRecommendedActionV1,
    subject_id: &str,
    attention_id: &str,
    occurrence_id: &str,
    subject_kind: AttentionSubjectKind,
    run: Option<&forged_ledger::RunRow>,
    desired_state: Option<DesiredState>,
    work_id: Option<&str>,
    occurrence_resolution_allowed: bool,
    risk_acceptance_allowed: bool,
    evidence: Option<&Value>,
) -> Vec<OperationActionV1> {
    use AttentionActionCode as Action;
    let classified_action =
        |verb: &str, args: Value, reason: &str, class: forged_types::ActionClass| {
            let Value::Object(args) = args else {
                unreachable!("attention action args are objects")
            };
            OperationActionV1 {
                verb: verb.to_owned(),
                args,
                reason: reason.to_owned(),
                class,
            }
        };
    let attention_resolution =
        |disposition: Value, reason: &str, class: forged_types::ActionClass| {
            classified_action(
                "attention resolve",
                json!({
                    "subject": subject_id,
                    "attentionId": attention_id,
                    "occurrenceId": occurrence_id,
                    "actor": Value::Null,
                    "disposition": disposition,
                    "note": Value::Null,
                }),
                reason,
                class,
            )
        };
    let retryable = run.filter(|run| {
        run.state == RunState::Stopped
            && !matches!(
                run.terminal_outcome,
                Some(RunOutcome::Landed | RunOutcome::Superseded)
            )
            && run.superseded_by.is_none()
    });
    match recommendation.code {
        Action::ResolveBlocker => {
            let Some(work_id) = work_id else {
                return Vec::new();
            };
            vec![classified_action(
                "work reopen",
                json!({"id": work_id}),
                &recommendation.text,
                forged_types::ActionClass::Repair,
            )]
        }
        Action::ProvideInput => match subject_kind {
            AttentionSubjectKind::Epic => vec![classified_action(
                "epic resolve",
                json!({"epic": subject_id, "child": Value::Null, "note": Value::Null}),
                "bind the held child when the input requirement names one and record the resolution note",
                forged_types::ActionClass::Should,
            )],
            AttentionSubjectKind::Run => retryable.map_or_else(Vec::new, |run| {
                let work_id = work_id.unwrap_or(&run.work_id);
                vec![
                    classified_action(
                        "work update",
                        json!({
                            "id": work_id,
                            "expectedRevision": Value::Null,
                            "description": Value::Null,
                        }),
                        super::ops::retry_reason(run),
                        forged_types::ActionClass::Should,
                    ),
                    super::ops::retry_action(subject_id, super::ops::retry_reason(run)),
                ]
            }),
        },
        Action::AdjudicateQuarantine => vec![attention_resolution(
            Value::Null,
            "bind the adjudicated disposition and note for this exact quarantined occurrence",
            forged_types::ActionClass::Should,
        )],
        Action::RepairPricing => vec![attention_resolution(
            json!("accepted-unknown"),
            "edit the config file to repair pricing, or bind a note accepting this unknown spend",
            forged_types::ActionClass::Should,
        )],
        Action::ReviseRoster => match subject_kind {
            AttentionSubjectKind::Run => {
                // A revision binds at the run's next durable boundary; a
                // stopped run has none, so there the revision is optional
                // context and the lifecycle `run retry` carries the `should`.
                let class = if run.is_some_and(|run| run.state == RunState::Active) {
                    forged_types::ActionClass::Should
                } else {
                    forged_types::ActionClass::Can
                };
                vec![classified_action(
                    "run revise-roster",
                    json!({"run": subject_id, "roster": Value::Null, "reason": Value::Null}),
                    "bind a configured roster name and the reason for revising provider policy",
                    class,
                )]
            }
            AttentionSubjectKind::Epic => vec![classified_action(
                "epic revise-roster",
                json!({"epic": subject_id, "roster": Value::Null, "reason": Value::Null}),
                "bind a configured roster name and the reason for revising provider policy",
                forged_types::ActionClass::Should,
            )],
        },
        Action::ResumeSeat => match subject_kind {
            AttentionSubjectKind::Run => {
                let uncommitted = evidence
                    .and_then(|value| value.pointer("/terminal/deadlineExhausted/uncommitted"))
                    .and_then(Value::as_u64)
                    .unwrap_or(0);
                if uncommitted > 0 {
                    // The seat's work is still in the worktree and a retry
                    // would discard it: steer the next attempt instead and
                    // leave the landing to the lead until retry keeps the
                    // branch (ore-080.9). No `should` is honest here.
                    vec![classified_action(
                        "session message",
                        json!({"run": subject_id, "attempt": Value::Null, "message": Value::Null}),
                        &format!(
                            "{uncommitted} uncommitted file(s) remain in the worktree; queue guidance for the next attempt or land the worktree by hand, since run retry would discard the work"
                        ),
                        forged_types::ActionClass::Can,
                    )]
                } else {
                    retryable.map_or_else(Vec::new, |run| {
                        vec![super::ops::retry_action_with_class(
                            subject_id,
                            super::ops::retry_reason(run),
                            forged_types::ActionClass::Should,
                        )]
                    })
                }
            }
            AttentionSubjectKind::Epic => Vec::new(),
        },
        Action::AdjudicateReview => {
            if subject_kind == AttentionSubjectKind::Run && risk_acceptance_allowed {
                let mut actions = vec![classified_action(
                    "run accept-risk",
                    json!({"run": subject_id, "acceptedBy": Value::Null, "rationale": Value::Null}),
                    "bind the accepting operator and rationale after the persisted terminal non-approve review outcome",
                    forged_types::ActionClass::Should,
                )];
                if let Some(run) = retryable {
                    actions.push(super::ops::retry_action(
                        subject_id,
                        super::ops::retry_reason(run),
                    ));
                }
                actions.push(classified_action(
                    "run adjudicate-settlement",
                    json!({
                        "run": subject_id,
                        "outcome": "landed",
                        "pr": Value::Null,
                        "sha": Value::Null,
                        "actor": Value::Null,
                        "rationale": Value::Null,
                        "evidenceGap": Value::Null,
                    }),
                    "repair the review-budget settlement with explicit delivery evidence",
                    forged_types::ActionClass::Repair,
                ));
                actions
            } else {
                vec![attention_resolution(
                    Value::Null,
                    "bind the adjudicated disposition and note for this exact review disagreement",
                    forged_types::ActionClass::Should,
                )]
            }
        }
        Action::ReauthorizeWork => match subject_kind {
            AttentionSubjectKind::Run => {
                if let Some(run) = retryable {
                    vec![super::ops::retry_action_with_class(
                        subject_id,
                        super::ops::retry_reason(run),
                        forged_types::ActionClass::Should,
                    )]
                } else if run.is_some_and(|run| run.state == RunState::Active) {
                    vec![classified_action(
                        "run stop",
                        json!({"run": subject_id, "outcome": Value::Null, "reason": Value::Null}),
                        "stop with an outcome and reason, then retry the terminal run",
                        forged_types::ActionClass::Should,
                    )]
                } else {
                    Vec::new()
                }
            }
            AttentionSubjectKind::Epic => {
                if desired_state == Some(DesiredState::Paused) {
                    vec![classified_action(
                        "epic resume",
                        json!({"epic": subject_id, "reason": Value::Null}),
                        "bind the reason for resuming the paused epic",
                        forged_types::ActionClass::Should,
                    )]
                } else {
                    vec![classified_action(
                        "epic submit",
                        json!({"epic": subject_id}),
                        "resubmit the epic to authorize a fresh controller revision",
                        forged_types::ActionClass::Should,
                    )]
                }
            }
        },
        Action::RepairEvidence if occurrence_resolution_allowed => vec![attention_resolution(
            json!("evidence-absent"),
            "bind a nonblank note explaining why this attempt-only evidence was never captured",
            forged_types::ActionClass::Repair,
        )],
        // These decision codes have no honesty-tested in-surface domain verb.
        // RepairEvidence is likewise empty for the repairable, non-attempt
        // half because no delivery-evidence recording verb exists.
        Action::MergePullRequest | Action::AdjudicateEffect | Action::RepairEvidence => Vec::new(),
        Action::ReconcileWork
        | Action::ReclaimAttempt
        | Action::RecoverController
        | Action::RepairGate
        | Action::WaitForProvider
        | Action::WaitForCapacity => Vec::new(),
    }
}

fn subject_kind(entry: &Value) -> AttentionSubjectKind {
    if entry.get("kind").and_then(Value::as_str) == Some("epic") {
        AttentionSubjectKind::Epic
    } else {
        AttentionSubjectKind::Run
    }
}

/// The row's already-resolved title. Attention never re-derives the
/// precedence rule and never reads work itself.
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

struct SubjectMetadata {
    kind: AttentionSubjectKind,
    title: Option<WorkTitleV1>,
    repository: Option<String>,
    revision: Option<String>,
}

fn subject_metadata(input: &ProjectionInput<'_>, id: &str) -> Option<SubjectMetadata> {
    let ProjectionSurface::Observation {
        snapshot,
        subject_title,
        ..
    } = &input.surface
    else {
        let entry = input
            .entries
            .iter()
            .find(|entry| entry.get("id").and_then(Value::as_str) == Some(id))?;
        return Some(SubjectMetadata {
            kind: subject_kind(entry),
            title: subject_title(entry),
            repository: repository(entry),
            revision: entry
                .pointer("/identity/bead/revision")
                .or_else(|| entry.pointer("/identity/work/revision"))
                .and_then(Value::as_str)
                .map(str::to_owned),
        });
    };
    if let Some(run) = snapshot.runs.iter().find(|run| run.run_id == id) {
        let title =
            if snapshot.subject.kind == WorkIdentitySubjectKind::Run && snapshot.subject.id == id {
                Some((*subject_title).clone())
            } else {
                snapshot
                    .child_identities
                    .iter()
                    .find(|identity| identity.subject.id == id)
                    .map(|identity| forged_types::resolve_work_title(identity, None))
            };
        return Some(SubjectMetadata {
            kind: AttentionSubjectKind::Run,
            title,
            repository: Some(run.repo.clone()),
            revision: snapshot
                .child_identities
                .iter()
                .find(|identity| identity.subject.id == id)
                .or_else(|| (snapshot.identity.subject.id == id).then_some(&snapshot.identity))
                .and_then(|identity| identity.work.revision.clone()),
        });
    }
    (snapshot.subject.id == id).then(|| SubjectMetadata {
        kind: match snapshot.subject.kind {
            WorkIdentitySubjectKind::Run => AttentionSubjectKind::Run,
            WorkIdentitySubjectKind::Epic => AttentionSubjectKind::Epic,
        },
        title: Some((*subject_title).clone()),
        repository: snapshot
            .identity
            .repository
            .as_ref()
            .map(|repository| repository.path.clone()),
        revision: snapshot.identity.work.revision.clone(),
    })
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
    let (severity, owner, action) = policy(condition);
    raw.push(RawAttention {
        subject_id: subject_id.to_owned(),
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

fn settlement_cursor(events: &[&EventRow], id: &str) -> i64 {
    events
        .iter()
        .rev()
        .find(|event| event.kind == "run.settled" && event.run_id.as_deref() == Some(id))
        .map_or(0, |event| event.event_id)
}

fn exhausted_run_has_successor(input: &ProjectionInput<'_>, subject_id: &str) -> bool {
    let Some(subject) = input.runs.iter().find(|run| run.run_id == subject_id) else {
        return false;
    };
    let terminal = subject.state == RunState::Stopped || subject.terminal_outcome.is_some();
    terminal
        && match &input.surface {
            ProjectionSurface::Inventory => input.runs.iter().any(|candidate| {
                candidate.run_id != subject.run_id
                    && candidate.work_id == subject.work_id
                    && candidate.created_at >= subject.created_at
            }),
            ProjectionSurface::Observation { snapshot, .. } => {
                snapshot.runs_with_same_work_successors.contains(subject_id)
            }
        }
}

fn persisted_risk_acceptance_allowed(input: &ProjectionInput<'_>, subject_id: &str) -> bool {
    let Some(run) = input.runs.iter().find(|run| run.run_id == subject_id) else {
        return false;
    };
    if run.state != RunState::Stopped || run.terminal_outcome != Some(RunOutcome::Blocked) {
        return false;
    }
    let first = events(input, "run.protocol-terminal")
        .filter(|event| event.run_id.as_deref() == Some(subject_id))
        .min_by_key(|event| event.event_id);
    let latest = events(input, "run.protocol-terminal")
        .filter(|event| event.run_id.as_deref() == Some(subject_id));
    let latest = latest.max_by_key(|event| event.event_id);
    let rounds = |event: &EventRow| {
        super::ops::risk_terminal_review_rounds(&event_value(&event.payload_json))
    };
    first
        .and_then(rounds)
        .is_some_and(|first_rounds| latest.and_then(rounds) == Some(first_rounds))
}

fn events<'a>(input: &'a ProjectionInput<'_>, kind: &'a str) -> impl Iterator<Item = &'a EventRow> {
    input
        .events
        .iter()
        .copied()
        .filter(move |event| event.kind == kind)
}

fn observed_reservation_subject<'a>(
    observation_subject: &'a str,
    packet_run: Option<&'a str>,
    kind: forged_types::AdmissionSubjectKind,
) -> &'a str {
    if kind == forged_types::AdmissionSubjectKind::Packet {
        packet_run.unwrap_or(observation_subject)
    } else {
        observation_subject
    }
}

fn collect_domain_sources(input: &ProjectionInput<'_>) -> Result<Vec<RawAttention>, Failure> {
    let entries_slice = input.entries;
    let work = input.work;
    let observation = input.surface.is_observation();
    let entries: BTreeMap<String, &Value> = entries_slice
        .iter()
        .filter_map(|entry| Some((entry.get("id")?.as_str()?.to_owned(), entry)))
        .collect();
    let work_by_id: BTreeMap<&str, &IssueSummary> = work
        .iter()
        .map(|issue| (issue.id.as_str(), issue))
        .collect();
    let mut raw = Vec::new();

    // Latest input event wins by append order. Resolution self-clears it.
    let mut latest_input: BTreeMap<String, (&str, &forged_ledger::EventRow)> = BTreeMap::new();
    for kind in [epic::INPUT_REQUIRED, epic::INPUT_RESOLVED] {
        for event in events(input, kind) {
            let Some(id) = event.run_id.as_ref() else {
                continue;
            };
            if latest_input
                .get(id)
                .is_none_or(|(_, seen)| seen.event_id < event.event_id)
            {
                latest_input.insert(id.clone(), (kind, event));
            }
        }
    }
    for (id, (kind, event)) in latest_input {
        if kind != epic::INPUT_REQUIRED {
            continue;
        }
        let payload = if observation {
            serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "input event {} has invalid stored JSON: {error}",
                    event.event_id
                ))
            })?
        } else {
            event_value(&event.payload_json)
        };
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
        let detail = if observation {
            explanation
        } else {
            format!("{child} is holding on {code}: {explanation}")
        };
        add_raw(
            &mut raw,
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
        let cursor = if observation {
            0
        } else {
            settlement_cursor(&input.events, id)
        };
        match outcome {
            Some("blocked") => {
                let live_status = entry
                    .get("workId")
                    .or_else(|| entry.get("beadId"))
                    .and_then(Value::as_str)
                    .and_then(|work_id| work_by_id.get(work_id))
                    .map(|issue| issue.status.as_str());
                if live_status.is_some_and(|status| status != "blocked") {
                    continue;
                }
                let reason = entry.get("stopReason").and_then(Value::as_str);
                let (source_id, detail, evidence, evidence_id) = if observation {
                    (
                        format!("run:{id}:blocked"),
                        reason
                            .unwrap_or("terminal run requires intervention")
                            .to_owned(),
                        json!({"runId": id, "outcome": "blocked", "reason": entry.get("stopReason")}),
                        format!("run:{id}"),
                    )
                } else {
                    (
                        format!("settlement:{cursor}:blocked"),
                        format!("run is blocked: {}", reason.unwrap_or("no reason recorded")),
                        json!({"outcome": "blocked", "reason": entry.get("stopReason")}),
                        cursor.to_string(),
                    )
                };
                add_raw(
                    &mut raw,
                    id,
                    AttentionCondition::Blocked,
                    updated,
                    updated,
                    cursor,
                    source_id,
                    detail,
                    evidence,
                    AttentionEvidenceKind::Event,
                    evidence_id,
                );
            }
            Some("input-required") => {
                let (source_id, detail, evidence, evidence_id) = if observation {
                    (
                        format!("run:{id}:input-required"),
                        entry
                            .get("stopReason")
                            .and_then(Value::as_str)
                            .unwrap_or("terminal run requires intervention")
                            .to_owned(),
                        json!({"runId": id, "outcome": "input-required", "reason": entry.get("stopReason")}),
                        format!("run:{id}"),
                    )
                } else {
                    (
                        format!("settlement:{cursor}:input-required"),
                        "run needs operator input".to_owned(),
                        json!({"outcome": "input-required", "reason": entry.get("stopReason")}),
                        cursor.to_string(),
                    )
                };
                add_raw(
                    &mut raw,
                    id,
                    AttentionCondition::InputRequired,
                    updated,
                    updated,
                    cursor,
                    source_id,
                    detail,
                    evidence,
                    AttentionEvidenceKind::Event,
                    evidence_id,
                );
            }
            Some(outcome @ ("clean" | "accepted-risk")) if !observation => {
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

    if !observation {
        // Live work is authoritative for a blocked issue on the inventory
        // surface. Work Detail carries only the requested work row and uses
        // it as a guard rather than minting a second causal source.
        let by_work: BTreeMap<&str, &str> = entries_slice
            .iter()
            .filter_map(|entry| {
                Some((
                    entry
                        .get("workId")
                        .or_else(|| entry.get("beadId"))?
                        .as_str()?,
                    entry.get("id")?.as_str()?,
                ))
            })
            .collect();
        for issue in work.iter().filter(|issue| issue.status == "blocked") {
            let Some(id) = by_work.get(issue.id.as_str()) else {
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
                id,
                AttentionCondition::Blocked,
                updated,
                updated,
                0,
                source,
                "Work is blocked in the authoritative live store",
                json!({"beadId": issue.id, "status": issue.status, "revision": issue.revision}),
                AttentionEvidenceKind::Work,
                &issue.id,
            );
        }
    }

    // A later success clears the exact pending reconciliation promise.
    let mut work_settlement: BTreeMap<String, (&str, &forged_ledger::EventRow)> = BTreeMap::new();
    for kind in [WORK_SETTLEMENT_PENDING, WORK_SETTLEMENT_SUCCEEDED] {
        for event in events(input, kind) {
            let Some(id) = event.run_id.as_ref() else {
                continue;
            };
            if work_settlement
                .get(id)
                .is_none_or(|(_, seen)| seen.event_id < event.event_id)
            {
                work_settlement.insert(id.clone(), (kind, event));
            }
        }
    }
    for (id, (kind, event)) in work_settlement {
        if kind != WORK_SETTLEMENT_PENDING {
            continue;
        }
        let payload = if observation {
            serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "settlement event {} has invalid stored JSON: {error}",
                    event.event_id
                ))
            })?
        } else {
            event_value(&event.payload_json)
        };
        let error = payload
            .get("error")
            .and_then(Value::as_str)
            .unwrap_or(if observation {
                "Work settlement is pending"
            } else {
                "unknown work error"
            });
        add_raw(
            &mut raw,
            &id,
            AttentionCondition::WorkSettlementPending,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            if observation {
                error.to_owned()
            } else {
                format!("Work reconciliation is pending: {error}")
            },
            payload,
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Revocation and quarantine custody.
    for attempt in input
        .attempts
        .iter()
        .filter(|attempt| attempt.state == AttemptState::Revoking)
    {
        let Ok((id, _, _)) = split_packet_key(&attempt.packet_id) else {
            continue;
        };
        add_raw(
            &mut raw,
            &id,
            AttentionCondition::Revoking,
            &attempt.updated_at,
            &attempt.updated_at,
            attempt.attempt_id,
            format!("attempt:{}", attempt.attempt_id),
            if observation {
                format!("attempt {} is revoking", attempt.attempt_id)
            } else {
                format!(
                    "attempt {} is revoking: {}",
                    attempt.attempt_id,
                    attempt
                        .revoke_reason
                        .as_deref()
                        .unwrap_or("no reason recorded")
                )
            },
            json!({"attemptId": attempt.attempt_id, "packetId": attempt.packet_id, "reason": attempt.revoke_reason}),
            AttentionEvidenceKind::Attempt,
            attempt.attempt_id.to_string(),
        );
    }
    let mut latest_quarantine: BTreeMap<String, &forged_ledger::EventRow> = BTreeMap::new();
    for event in events(input, "proto.quarantine") {
        if let Some(id) = event.run_id.as_ref() {
            latest_quarantine.insert(id.clone(), event);
        }
    }
    for (id, event) in latest_quarantine {
        let payload = if observation {
            serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "quarantine event {} has invalid stored JSON: {error}",
                    event.event_id
                ))
            })?
        } else {
            event_value(&event.payload_json)
        };
        add_raw(
            &mut raw,
            &id,
            AttentionCondition::Quarantined,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            if observation {
                "result evidence is quarantined".to_owned()
            } else {
                format!(
                    "result was quarantined: {}",
                    payload
                        .get("reason")
                        .and_then(Value::as_str)
                        .unwrap_or("no reason recorded")
                )
            },
            payload,
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Partial spend uses the latest unpriced usage row as the occurrence.
    if let ProjectionUsage::Observation(observed) = input.usage {
        for (id, totals) in &observed.usage_totals {
            if totals.rows_missing_cost == 0 {
                continue;
            }
            let Some((offset, row)) = observed
                .usage_rows
                .iter()
                .enumerate()
                .rev()
                .find(|(_, row)| row.run_id == *id && row.cost_usd.is_none())
            else {
                return Err(Failure::internal(format!(
                    "usage totals for {id:?} report missing cost without a causal row"
                )));
            };
            let source_id = format!(
                "usage:{}:{}:{}:{}:{}",
                id,
                row.packet_id.as_deref().unwrap_or("-"),
                row.attempt_id
                    .map_or_else(|| "-".to_owned(), |id| id.to_string()),
                row.provider,
                offset
            );
            add_raw(
                &mut raw,
                id,
                AttentionCondition::MissingCost,
                &row.ts,
                &row.ts,
                i64::try_from(offset).unwrap_or(i64::MAX),
                source_id,
                format!(
                    "{} usage rows carry no cost, so spend is partial",
                    totals.rows_missing_cost
                ),
                json!({
                    "runId": id,
                    "rowsMissingCost": totals.rows_missing_cost,
                    "packetId": row.packet_id,
                    "attemptId": row.attempt_id,
                }),
                AttentionEvidenceKind::Event,
                format!("usage:{id}:{offset}"),
            );
        }
    } else if let ProjectionUsage::Inventory(InventoryUsage::Included {
        totals,
        latest_missing,
    }) = input.usage
    {
        for (id, (usage_id, observed_at)) in latest_missing {
            let count = totals.get(id).map_or(0, |totals| totals.rows_missing_cost);
            if count == 0 {
                continue;
            }
            add_raw(
                &mut raw,
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
    } else {
        return Err(Failure::internal(
            "attention projection requires included inventory usage",
        ));
    }

    // Desired-work exhaustion is explicit. Controller-dead is narrower:
    // either the latest supervisor evidence names controller intervention,
    // or a promised supervisor wake is overdue. Generic desired `attention`
    // also represents input/admission holds and must never be relabelled.
    let as_of = now_iso();
    let mut supervisor_attention: BTreeMap<String, &forged_ledger::EventRow> = BTreeMap::new();
    for event in events(input, "forged.supervisor.attention") {
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
    for desired in input.desired_work {
        if desired.exhausted_at.is_some()
            || desired.last_outcome == Some(DesiredReconcileOutcome::Exhausted)
        {
            if desired.subject_kind == forged_ledger::DesiredSubjectKind::Run
                && exhausted_run_has_successor(input, &desired.subject_id)
            {
                continue;
            }
            add_raw(
                &mut raw,
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

        if observation {
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
    if let ProjectionSurface::Observation {
        snapshot: observed,
        results,
        ..
    } = &input.surface
    {
        let mut latest_gate = BTreeMap::<String, (i64, &str)>::new();
        for (attempt_id, result) in results.iter() {
            let Outcome::Implement {
                gate_state: Some(state),
                ..
            } = &result.outcome
            else {
                continue;
            };
            let run_id = observed
                .packets
                .iter()
                .find(|packet| packet.packet_id == result.packet_id)
                .map(|packet| packet.run_id.clone())
                .unwrap_or_else(|| observed.subject.id.clone());
            latest_gate.insert(run_id, (*attempt_id, state));
        }
        for (id, (attempt_id, state)) in latest_gate {
            if state != "fail" {
                continue;
            }
            let has_live = observed.attempts.iter().any(|attempt| {
                matches!(
                    attempt.state,
                    AttemptState::Running | AttemptState::Revoking
                ) && observed
                    .packets
                    .iter()
                    .any(|packet| packet.packet_id == attempt.packet_id && packet.run_id == id)
            });
            let has_scheduled = observed.desired_work.iter().any(|desired| {
                desired.desired_state == DesiredState::Running
                    && desired.next_wake_at.is_some()
                    && (desired.subject_id == id
                        || (observed.subject.kind == WorkIdentitySubjectKind::Epic
                            && desired.subject_kind == forged_ledger::DesiredSubjectKind::Epic
                            && desired.subject_id == observed.subject.id))
            });
            if has_live || has_scheduled {
                continue;
            }
            let updated_at = observed
                .attempts
                .iter()
                .find(|attempt| attempt.attempt_id == attempt_id)
                .map(|attempt| attempt.updated_at.as_str())
                .unwrap_or(observed.identity.captured_at.as_str());
            add_raw(
                &mut raw,
                &id,
                AttentionCondition::FailedGate,
                updated_at,
                updated_at,
                attempt_id,
                format!("attempt:{attempt_id}:gate:{state}"),
                format!("latest recorded gate state is {state:?}"),
                json!({"attemptId": attempt_id, "gateState": state}),
                AttentionEvidenceKind::Attempt,
                attempt_id.to_string(),
            );
        }
    } else {
        let mut latest_gate: BTreeMap<String, &forged_ledger::EventRow> = BTreeMap::new();
        for event in events(input, "proto.gate") {
            if let Some(id) = event.run_id.as_ref() {
                latest_gate.insert(id.clone(), event);
            }
        }
        for (id, event) in latest_gate {
            let payload = event_value(&event.payload_json);
            if payload.get("passed").and_then(Value::as_bool) != Some(false) {
                continue;
            }
            let has_live = input.attempts.iter().any(|attempt| {
                split_packet_key(&attempt.packet_id).is_ok_and(|(run_id, _, _)| run_id == id)
            });
            let has_scheduled = input.desired_work.iter().any(|desired| {
                desired.subject_id == id
                    && desired.desired_state == DesiredState::Running
                    && desired.next_wake_at.is_some()
            });
            let has_closing_outcome = input.runs.iter().any(|run| {
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
    }

    // Terminal provider exhaustion.
    let mut latest_terminal: BTreeMap<String, &forged_ledger::EventRow> = BTreeMap::new();
    for event in events(input, "run.protocol-terminal") {
        if let Some(id) = event.run_id.as_ref() {
            latest_terminal.insert(id.clone(), event);
        }
    }
    for (id, event) in latest_terminal {
        let payload = if observation {
            serde_json::from_str(&event.payload_json).map_err(|error| {
                Failure::internal(format!(
                    "terminal event {} has invalid stored JSON: {error}",
                    event.event_id
                ))
            })?
        } else {
            event_value(&event.payload_json)
        };
        let (condition, detail) = if payload.pointer("/terminal/providerUnavailable").is_some() {
            (
                AttentionCondition::RetryExhausted,
                "provider retry budget is exhausted",
            )
        } else if payload.pointer("/terminal/deadlineExhausted").is_some() {
            (
                AttentionCondition::DeadlineExhausted,
                "stage deadline relaunch budget is exhausted",
            )
        } else {
            continue;
        };
        add_raw(
            &mut raw,
            &id,
            condition,
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

    // Only typed rate-limit decisions are provider degradation. Routine
    // capacity deferrals remain queued work until a parked controller
    // crosses its wake threshold and appends the durable marker below.
    for decision in input.admission_decisions {
        if decision.outcome != AdmissionOutcome::Deferred
            || !matches!(
                decision.reason,
                AdmissionReason::RateLimitCeiling | AdmissionReason::StaleRateLimit
            )
        {
            continue;
        }
        let subject_id = match (&input.surface, decision.subject_kind) {
            (
                ProjectionSurface::Observation {
                    snapshot: observed, ..
                },
                forged_types::AdmissionSubjectKind::Packet,
            ) => observed
                .packets
                .iter()
                .find(|packet| packet.packet_id == decision.subject_id)
                .map(|packet| packet.run_id.clone())
                .unwrap_or_else(|| observed.subject.id.clone()),
            (_, forged_types::AdmissionSubjectKind::Packet) => {
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
        let updated = match &input.surface {
            ProjectionSurface::Inventory => entry
                .get("updatedAt")
                .and_then(Value::as_str)
                .unwrap_or_default(),
            ProjectionSurface::Observation {
                snapshot: observed, ..
            } => observed.identity.captured_at.as_str(),
        };
        add_raw(
            &mut raw,
            &subject_id,
            AttentionCondition::ProviderDegraded,
            updated,
            updated,
            i64::from(decision.control_revision as u32),
            format!("admission:{}", decision.batch_id),
            format!(
                "provider admission deferred: {}",
                super::admission::decision_reason(decision)
            ),
            if observation {
                serde_json::to_value(decision).map_err(|error| {
                    Failure::internal(format!("serializing admission decision: {error}"))
                })?
            } else {
                serde_json::to_value(decision).unwrap_or(Value::Null)
            },
            AttentionEvidenceKind::AdmissionDecision,
            &decision.batch_id,
        );
    }

    // A parked controller or the supervisor appends one durable marker after
    // its wake threshold. Packet markers carry packetId; supervisor markers
    // carry run/epic subjectKind and use the event subject directly. Either
    // stands only while that exact subject's LATEST admission decision is
    // still deferred and clears through the admit itself. Rate-limit
    // deferrals keep their ProviderDegraded projection above.
    let mut parked: BTreeMap<
        String,
        (
            &forged_ledger::EventRow,
            Value,
            &forged_types::AdmissionDecisionV1,
        ),
    > = BTreeMap::new();
    for event in events(input, "forged.admission.attention") {
        let Some(event_subject_id) = event.run_id.as_ref() else {
            continue;
        };
        let payload = event_value(&event.payload_json);
        if payload.get("condition").and_then(Value::as_str) != Some("admission-deferred") {
            continue;
        }
        let (decision_kind, decision_id) =
            if let Some(packet_id) = payload.get("packetId").and_then(Value::as_str) {
                (
                    forged_types::AdmissionSubjectKind::Packet,
                    packet_id.to_owned(),
                )
            } else {
                let kind = match payload.get("subjectKind").and_then(Value::as_str) {
                    Some("run") => forged_types::AdmissionSubjectKind::Run,
                    Some("epic") => forged_types::AdmissionSubjectKind::Epic,
                    _ => continue,
                };
                (kind, event_subject_id.clone())
            };
        let marker_reason = match payload.get("reason").cloned() {
            None => None,
            Some(value) => match serde_json::from_value::<AdmissionReason>(value) {
                Ok(reason) => Some(reason),
                Err(_) => continue,
            },
        };
        let deferred = input.admission_decisions.iter().find(|decision| {
            decision.subject_kind == decision_kind
                && decision.subject_id == decision_id
                && decision.outcome == AdmissionOutcome::Deferred
                && marker_reason.is_none_or(|reason| decision.reason == reason)
                && !matches!(
                    decision.reason,
                    AdmissionReason::RateLimitCeiling | AdmissionReason::StaleRateLimit
                )
        });
        let Some(decision) = deferred else {
            continue;
        };
        if parked
            .get(event_subject_id)
            .is_none_or(|(seen, _, _)| seen.event_id < event.event_id)
        {
            parked.insert(event_subject_id.clone(), (event, payload, decision));
        }
    }
    for (event_subject_id, (event, payload, decision)) in parked {
        let packet_id = payload.get("packetId").and_then(Value::as_str);
        let id = match (&input.surface, packet_id) {
            (ProjectionSurface::Inventory, _) => event_subject_id,
            (
                ProjectionSurface::Observation {
                    snapshot: observed, ..
                },
                Some(packet_id),
            ) => observed
                .packets
                .iter()
                .find(|packet| packet.packet_id == packet_id)
                .map(|packet| packet.run_id.clone())
                .unwrap_or_else(|| observed.subject.id.clone()),
            (ProjectionSurface::Observation { .. }, None) => event_subject_id,
        };
        let detail = packet_id.map_or_else(
            || {
                format!(
                    "{} admission remains deferred ({})",
                    payload
                        .get("subjectKind")
                        .and_then(Value::as_str)
                        .unwrap_or("subject"),
                    super::admission::decision_reason(decision)
                )
            },
            |packet_id| {
                format!(
                    "run is parked: packet {packet_id} admission deferred ({})",
                    super::admission::decision_reason(decision)
                )
            },
        );
        add_raw(
            &mut raw,
            &id,
            AttentionCondition::AdmissionDeferred,
            &event.ts,
            &event.ts,
            event.event_id,
            format!("event:{}", event.event_id),
            detail,
            json!({
                "packetId": packet_id,
                "subjectKind": payload.get("subjectKind"),
                "wakes": payload.get("wakes"),
                "decision": decision,
            }),
            AttentionEvidenceKind::Event,
            event.event_id.to_string(),
        );
    }

    // Ambiguous external effects and retained unknown-effect capacity.
    for operation in input.inflight_operations {
        if operation.effect_class != EffectClass::HumanAmbiguous {
            continue;
        }
        let id = match operation.run_id.as_deref() {
            Some(id) => id,
            None => match &input.surface {
                ProjectionSurface::Inventory => continue,
                ProjectionSurface::Observation {
                    snapshot: observed, ..
                } => observed.subject.id.as_str(),
            },
        };
        add_raw(
            &mut raw,
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
    for reservation in input
        .admission_reservations
        .iter()
        .filter(|row| row.state == AdmissionReservationState::Orphaned)
    {
        let subject_id = match &input.surface {
            ProjectionSurface::Observation {
                snapshot: observed, ..
            } => observed_reservation_subject(
                &observed.subject.id,
                observed
                    .packets
                    .iter()
                    .find(|packet| packet.packet_id == reservation.subject_id)
                    .map(|packet| packet.run_id.as_str()),
                reservation.subject_kind,
            )
            .to_owned(),
            ProjectionSurface::Inventory
                if reservation.subject_kind == forged_types::AdmissionSubjectKind::Packet =>
            {
                let Ok((run_id, _, _)) = split_packet_key(&reservation.subject_id) else {
                    continue;
                };
                run_id
            }
            _ => reservation.subject_id.clone(),
        };
        add_raw(
            &mut raw,
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
    for attempt in &input.attempts_missing_artifacts {
        let id = match &input.surface {
            ProjectionSurface::Inventory => {
                let Ok((id, _, _)) = split_packet_key(&attempt.packet_id) else {
                    continue;
                };
                id
            }
            ProjectionSurface::Observation {
                snapshot: observed, ..
            } => observed
                .packets
                .iter()
                .find(|packet| packet.packet_id == attempt.packet_id)
                .map(|packet| packet.run_id.clone())
                .unwrap_or_else(|| observed.subject.id.clone()),
        };
        add_raw(
            &mut raw,
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

    // ReviewProjection is the observation-side authority; inventory uses
    // the complete proto.review stream. Both normalize into the same raw
    // source contract before the one item fold below.
    if let ProjectionSurface::Observation {
        snapshot: observed,
        review_disagreements,
        ..
    } = &input.surface
    {
        for (id, attempt_id, source_id, evidence) in review_disagreements.iter() {
            let updated_at = observed
                .attempts
                .iter()
                .find(|attempt| attempt.attempt_id == *attempt_id)
                .map(|attempt| attempt.updated_at.as_str())
                .unwrap_or(observed.identity.captured_at.as_str());
            add_raw(
                &mut raw,
                id,
                AttentionCondition::ReviewerDisagreement,
                updated_at,
                updated_at,
                *attempt_id,
                source_id,
                "reviewers disagree at the latest available review round",
                evidence.clone(),
                AttentionEvidenceKind::Attempt,
                attempt_id.to_string(),
            );
        }
    } else {
        let mut reviews: BTreeMap<String, Vec<(&forged_ledger::EventRow, Value)>> = BTreeMap::new();
        for event in events(input, "proto.review") {
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
    events: &[&EventRow],
    complete: bool,
    observation: bool,
    attention: &str,
    occurrence: &str,
) -> Result<TransitionState, Failure> {
    if !complete {
        return Ok(TransitionState {
            state: AttentionState::Open,
            acknowledgement: None,
            resolution: None,
            updated_at: None,
        });
    }
    let mut transitions = Vec::new();
    for event in events {
        if !matches!(event.kind.as_str(), ACKNOWLEDGED | RESOLVED | REOPENED) {
            continue;
        }
        let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
            Failure::internal(if observation {
                format!(
                    "attention transition event {} has invalid stored JSON: {error}",
                    event.event_id
                )
            } else {
                format!("invalid stored attention transition: {error}")
            })
        })?;
        if payload.get("schema").and_then(Value::as_str) != Some("forged.attention-transition/1") {
            return Err(Failure::internal(if observation {
                format!(
                    "attention transition event {} has an unsupported schema",
                    event.event_id
                )
            } else {
                format!(
                    "unknown stored attention transition schema in event {}",
                    event.event_id
                )
            }));
        }
        if payload.get("attentionId").and_then(Value::as_str) == Some(attention)
            && payload.get("occurrenceId").and_then(Value::as_str) == Some(occurrence)
        {
            transitions.push((*event, payload));
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
                    if observation {
                        updated = Some(event.ts.clone());
                    }
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
                        Failure::internal(if observation {
                            format!("stored resolution has an unknown disposition: {error}")
                        } else {
                            format!("unknown stored resolution disposition: {error}")
                        })
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
                    if observation {
                        updated = Some(event.ts.clone());
                    }
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
    resolution_allowed_for(item.condition, &item.evidence_refs)
}

fn resolution_allowed_for(
    condition: AttentionCondition,
    evidence_refs: &[AttentionEvidenceRefV1],
) -> bool {
    match condition {
        AttentionCondition::Quarantined
        | AttentionCondition::MissingCost
        | AttentionCondition::RetryExhausted
        | AttentionCondition::ReviewerDisagreement => true,
        AttentionCondition::MissingEvidence => evidence_refs
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
        | Condition::DeadlineExhausted
        | Condition::ReviewerDisagreement
        | Condition::AmbiguousEffect
        | Condition::RestartBudgetExhausted
        | Condition::MissingEvidence => AttentionClass::Decision,
        Condition::Blocked
        | Condition::WorkSettlementPending
        | Condition::Revoking
        | Condition::ControllerDead
        | Condition::FailedGate
        | Condition::ProviderDegraded
        | Condition::AdmissionDeferred => AttentionClass::Symptom,
    }
}

/// The only attention fold. Both inventory and Work Detail normalize their
/// facts into this private input, so transition replay and item assembly
/// cannot drift into a second implementation.
fn project(input: ProjectionInput<'_>) -> Result<Vec<AttentionItemV1>, Failure> {
    let raw = collect_domain_sources(&input)?;
    let blocked_work: BTreeSet<&str> = input
        .work
        .iter()
        .filter(|issue| issue.status == "blocked")
        .map(|issue| issue.id.as_str())
        .collect();
    let work_by_subject: BTreeMap<&str, &str> = input
        .entries
        .iter()
        .filter_map(|entry| {
            let subject = entry.get("id")?.as_str()?;
            let work_id = entry
                .get("workId")
                .or_else(|| entry.get("beadId"))?
                .as_str()?;
            blocked_work.contains(work_id).then_some((subject, work_id))
        })
        .collect();
    let mut buckets: BTreeMap<(String, AttentionCondition), Vec<RawAttention>> = BTreeMap::new();
    for source in raw {
        buckets
            .entry((source.subject_id.clone(), source.condition))
            .or_default()
            .push(source);
    }
    let mut projected = Vec::new();
    for ((subject_id, condition), mut sources) in buckets {
        let Some(subject) = subject_metadata(&input, &subject_id) else {
            continue;
        };
        let subject_kind = subject.kind;
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
        let (transition_events, controls_complete, observation): (Vec<&EventRow>, bool, bool) =
            match &input.surface {
                ProjectionSurface::Inventory => (
                    [ACKNOWLEDGED, RESOLVED, REOPENED]
                        .into_iter()
                        .flat_map(|kind| events(&input, kind))
                        .collect(),
                    true,
                    false,
                ),
                ProjectionSurface::Observation {
                    snapshot: observed, ..
                } => (
                    observed.events.rows.iter().collect(),
                    observed.events.after_event_id == 0
                        && !observed.events.has_more
                        && !(observed.subject.kind == WorkIdentitySubjectKind::Epic
                            && subject_kind == AttentionSubjectKind::Run),
                    true,
                ),
            };
        let transition = transition_state(
            &transition_events,
            controls_complete,
            observation,
            &stable_id,
            &occurrence_id,
        )?;
        let mut evidence_refs: Vec<_> = sources
            .iter()
            .map(|source| source.evidence_ref.clone())
            .collect();
        evidence_refs.sort_by(|left, right| {
            (left.kind, left.id.as_str()).cmp(&(right.kind, right.id.as_str()))
        });
        evidence_refs.dedup();
        if input.surface.is_observation() {
            evidence_refs.truncate(50);
        }
        let opened_at = sources
            .iter()
            .map(|source| source.opened_at.as_str())
            .min()
            .unwrap_or_default()
            .to_owned();
        let updated_at = transition
            .updated_at
            .unwrap_or_else(|| latest.updated_at.clone());
        let recommended_action = latest.action.clone();
        let run = input.runs.iter().find(|run| run.run_id == subject_id);
        let desired_state = input
            .desired_work
            .iter()
            .find(|desired| {
                desired.subject_id == subject_id
                    && matches!(
                        (desired.subject_kind, subject_kind),
                        (
                            forged_ledger::DesiredSubjectKind::Run,
                            AttentionSubjectKind::Run
                        ) | (
                            forged_ledger::DesiredSubjectKind::Epic,
                            AttentionSubjectKind::Epic
                        )
                    )
            })
            .map(|desired| desired.desired_state);
        let occurrence_resolution_allowed = resolution_allowed_for(condition, &evidence_refs);
        let next_actions = recommendation_actions(
            &recommended_action,
            &subject_id,
            &stable_id,
            &occurrence_id,
            subject_kind,
            run,
            desired_state,
            work_by_subject.get(subject_id.as_str()).copied(),
            occurrence_resolution_allowed,
            persisted_risk_acceptance_allowed(&input, &subject_id),
            Some(&latest.evidence),
        );
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
                subject_id: subject_id.clone(),
                subject: Some(forged_types::ProjectionSubjectV1 {
                    id: subject_id,
                    kind: match subject_kind {
                        AttentionSubjectKind::Run => forged_types::ProjectionSubjectKind::Run,
                        AttentionSubjectKind::Epic => forged_types::ProjectionSubjectKind::Epic,
                    },
                    title: subject.title.as_ref().map(|title| title.value.clone()),
                    repository: subject.repository.clone(),
                    revision: subject.revision,
                }),
                subject_title: subject.title,
                repository: subject.repository,
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
                recommended_action,
                next_actions,
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

/// Project active and resolved inventory occurrences. Controls consume the
/// resolved rows; operator inventory surfaces filter through
/// [`project_active`].
pub(crate) fn project_all(
    snapshot: &InventorySnapshot,
    entries: &[Value],
    work: &[IssueSummary],
) -> Result<Vec<AttentionItemV1>, Failure> {
    project(ProjectionInput {
        runs: &snapshot.runs,
        attempts: &snapshot.live_attempts,
        attempts_missing_artifacts: snapshot.attempts_missing_artifacts.iter().collect(),
        events: snapshot.events_by_kind.values().flatten().collect(),
        desired_work: &snapshot.desired_work,
        inflight_operations: &snapshot.inflight_operations,
        admission_decisions: &snapshot.admission_decisions,
        admission_reservations: &snapshot.admission_reservations,
        usage: ProjectionUsage::Inventory(&snapshot.usage),
        entries,
        work,
        surface: ProjectionSurface::Inventory,
    })
}

/// Adapt one exact Work Detail snapshot into the shared attention projector.
/// The bounded observation remains the authority for review results and gate
/// outcomes, while the normalized inventory view supplies the common domain
/// rows consumed by the fold.
pub(crate) fn project_observation(
    observed: &WorkObservationSnapshot,
    review_disagreements: &[(String, i64, String, Value)],
    results: &BTreeMap<i64, PacketResult>,
    subject_title: &WorkTitleV1,
    live_work: Option<&IssueSummary>,
) -> Result<Vec<AttentionItemV1>, Failure> {
    let artifacts = observed
        .attempt_artifacts
        .iter()
        .map(|row| row.attempt_id)
        .collect::<BTreeSet<_>>();
    let events_complete = observed.events.after_event_id == 0 && !observed.events.has_more;
    let events = if events_complete {
        observed.events.rows.iter().collect()
    } else {
        Vec::new()
    };

    let entries = observed
        .runs
        .iter()
        .map(|run| {
            json!({
                "id": run.run_id,
                "beadId": run.work_id,
                "outcome": run.terminal_outcome.map(RunOutcome::as_str),
                "updatedAt": run.updated_at,
                "stopReason": run.stop_reason,
            })
        })
        .collect::<Vec<_>>();
    let work = live_work.into_iter().cloned().collect::<Vec<_>>();
    Ok(project(ProjectionInput {
        runs: &observed.runs,
        attempts: &observed.attempts,
        attempts_missing_artifacts: observed
            .attempts
            .iter()
            .filter(|attempt| {
                matches!(
                    attempt.state,
                    AttemptState::Completed | AttemptState::Failed
                ) && !artifacts.contains(&attempt.attempt_id)
            })
            .collect(),
        events,
        desired_work: &observed.desired_work,
        inflight_operations: &observed.inflight_operations,
        admission_decisions: &observed.admission_decisions,
        admission_reservations: &observed.admission_reservations,
        usage: ProjectionUsage::Observation(observed),
        entries: &entries,
        work: &work,
        surface: ProjectionSurface::Observation {
            snapshot: observed,
            review_disagreements,
            results,
            subject_title,
        },
    })?
    .into_iter()
    .filter(|item| item.state != AttentionState::Resolved)
    .collect())
}

pub(crate) fn project_active(
    snapshot: &InventorySnapshot,
    entries: &[Value],
    work: &[IssueSummary],
) -> Result<Vec<AttentionItemV1>, Failure> {
    Ok(project_all(snapshot, entries, work)?
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
            work_id: "bead-gate".to_owned(),
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

    fn action_verbs(
        condition: AttentionCondition,
        subject_kind: AttentionSubjectKind,
        run: Option<&RunRow>,
        desired_state: Option<DesiredState>,
        resolution_allowed: bool,
        risk_allowed: bool,
    ) -> Vec<String> {
        recommendation_actions(
            &policy(condition).2,
            "subject-1",
            "attention-1",
            "occurrence-1",
            subject_kind,
            run,
            desired_state,
            None,
            resolution_allowed,
            risk_allowed,
            None,
        )
        .into_iter()
        .map(|action| action.verb)
        .collect()
    }

    #[allow(clippy::too_many_arguments)]
    fn assert_one_should(
        condition: AttentionCondition,
        subject_kind: AttentionSubjectKind,
        run: Option<&RunRow>,
        desired_state: Option<DesiredState>,
        resolution_allowed: bool,
        risk_allowed: bool,
        expected_verb: &str,
    ) {
        let actions = recommendation_actions(
            &policy(condition).2,
            "subject-1",
            "attention-1",
            "occurrence-1",
            subject_kind,
            run,
            desired_state,
            Some("bead-subject-1"),
            resolution_allowed,
            risk_allowed,
            None,
        );
        let should = actions
            .iter()
            .filter(|action| action.class == forged_types::ActionClass::Should)
            .collect::<Vec<_>>();
        assert_eq!(should.len(), 1, "{condition:?}: {actions:?}");
        assert_eq!(should[0].verb, expected_verb, "{condition:?}: {actions:?}");
    }

    #[test]
    fn attention_resolution_action_carries_the_complete_control_address() {
        let actions = recommendation_actions(
            &policy(AttentionCondition::Quarantined).2,
            "run-1",
            "attention-1",
            "occurrence-1",
            AttentionSubjectKind::Run,
            None,
            None,
            None,
            true,
            false,
            None,
        );
        assert_eq!(actions.len(), 1);
        assert_eq!(actions[0].verb, "attention resolve");
        assert_eq!(
            actions[0].args,
            json!({
                "subject": "run-1",
                "attentionId": "attention-1",
                "occurrenceId": "occurrence-1",
                "actor": null,
                "disposition": null,
                "note": null,
            })
            .as_object()
            .expect("action arguments")
            .clone()
        );
    }

    #[test]
    fn decision_action_table_is_subject_and_state_qualified() {
        let active = run_row("subject-1", RunState::Active, None);
        let retryable = run_row(
            "subject-1",
            RunState::Stopped,
            Some(RunOutcome::InputRequired),
        );
        let landed = run_row("subject-1", RunState::Stopped, Some(RunOutcome::Landed));

        assert_eq!(
            action_verbs(
                AttentionCondition::InputRequired,
                AttentionSubjectKind::Epic,
                None,
                None,
                false,
                false,
            ),
            ["epic resolve"]
        );
        assert!(action_verbs(
            AttentionCondition::InputRequired,
            AttentionSubjectKind::Run,
            Some(&active),
            None,
            false,
            false,
        )
        .is_empty());
        assert_eq!(
            action_verbs(
                AttentionCondition::InputRequired,
                AttentionSubjectKind::Run,
                Some(&retryable),
                None,
                false,
                false,
            ),
            ["work update", "run retry"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::Quarantined,
                AttentionSubjectKind::Run,
                Some(&active),
                None,
                true,
                false,
            ),
            ["attention resolve"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::MissingCost,
                AttentionSubjectKind::Run,
                Some(&active),
                None,
                true,
                false,
            ),
            ["attention resolve"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::RetryExhausted,
                AttentionSubjectKind::Run,
                Some(&active),
                None,
                true,
                false,
            ),
            ["run revise-roster"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::RetryExhausted,
                AttentionSubjectKind::Epic,
                None,
                None,
                true,
                false,
            ),
            ["epic revise-roster"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::ReviewerDisagreement,
                AttentionSubjectKind::Run,
                Some(&retryable),
                None,
                true,
                true,
            ),
            ["run accept-risk", "run retry", "run adjudicate-settlement"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::ReviewerDisagreement,
                AttentionSubjectKind::Run,
                Some(&retryable),
                None,
                true,
                false,
            ),
            ["attention resolve"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::RestartBudgetExhausted,
                AttentionSubjectKind::Run,
                Some(&active),
                None,
                false,
                false,
            ),
            ["run stop"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::RestartBudgetExhausted,
                AttentionSubjectKind::Run,
                Some(&retryable),
                None,
                false,
                false,
            ),
            ["run retry"]
        );
        assert!(action_verbs(
            AttentionCondition::RestartBudgetExhausted,
            AttentionSubjectKind::Run,
            Some(&landed),
            None,
            false,
            false,
        )
        .is_empty());
        assert_eq!(
            action_verbs(
                AttentionCondition::RestartBudgetExhausted,
                AttentionSubjectKind::Epic,
                None,
                Some(DesiredState::Paused),
                false,
                false,
            ),
            ["epic resume"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::RestartBudgetExhausted,
                AttentionSubjectKind::Epic,
                None,
                Some(DesiredState::Stopped),
                false,
                false,
            ),
            ["epic submit"]
        );
        assert_eq!(
            action_verbs(
                AttentionCondition::MissingEvidence,
                AttentionSubjectKind::Run,
                Some(&active),
                None,
                true,
                false,
            ),
            ["attention resolve"]
        );
        assert!(action_verbs(
            AttentionCondition::MissingEvidence,
            AttentionSubjectKind::Run,
            Some(&active),
            None,
            false,
            false,
        )
        .is_empty());
        assert!(action_verbs(
            AttentionCondition::MergeApproval,
            AttentionSubjectKind::Run,
            Some(&active),
            None,
            false,
            false,
        )
        .is_empty());
        assert!(action_verbs(
            AttentionCondition::AmbiguousEffect,
            AttentionSubjectKind::Run,
            Some(&active),
            None,
            false,
            false,
        )
        .is_empty());
    }

    #[test]
    fn coverage_and_exempt_decisions_pin_should_cardinality() {
        let active = run_row("subject-1", RunState::Active, None);
        let retryable = run_row(
            "subject-1",
            RunState::Stopped,
            Some(RunOutcome::InputRequired),
        );
        let review_budget = run_row("subject-1", RunState::Stopped, Some(RunOutcome::Blocked));

        assert_one_should(
            AttentionCondition::InputRequired,
            AttentionSubjectKind::Run,
            Some(&retryable),
            None,
            false,
            false,
            "work update",
        );
        assert_one_should(
            AttentionCondition::RestartBudgetExhausted,
            AttentionSubjectKind::Run,
            Some(&retryable),
            None,
            false,
            false,
            "run retry",
        );
        assert_one_should(
            AttentionCondition::ReviewerDisagreement,
            AttentionSubjectKind::Run,
            Some(&review_budget),
            None,
            true,
            true,
            "run accept-risk",
        );
        assert_one_should(
            AttentionCondition::ReviewerDisagreement,
            AttentionSubjectKind::Run,
            Some(&active),
            None,
            true,
            false,
            "attention resolve",
        );
        assert_one_should(
            AttentionCondition::Quarantined,
            AttentionSubjectKind::Run,
            Some(&active),
            None,
            true,
            false,
            "attention resolve",
        );
        assert_one_should(
            AttentionCondition::MissingCost,
            AttentionSubjectKind::Run,
            Some(&active),
            None,
            true,
            false,
            "attention resolve",
        );
        assert_one_should(
            AttentionCondition::RetryExhausted,
            AttentionSubjectKind::Run,
            Some(&active),
            None,
            true,
            false,
            "run revise-roster",
        );

        let review_actions = recommendation_actions(
            &policy(AttentionCondition::ReviewerDisagreement).2,
            "subject-1",
            "attention-1",
            "occurrence-1",
            AttentionSubjectKind::Run,
            Some(&review_budget),
            None,
            Some("bead-subject-1"),
            true,
            true,
            None,
        );
        assert!(review_actions.iter().any(|action| {
            action.verb == "run retry" && action.class == forged_types::ActionClass::Can
        }));
        assert!(review_actions.iter().any(|action| {
            action.verb == "run adjudicate-settlement"
                && action.class == forged_types::ActionClass::Repair
        }));

        for (condition, resolution_allowed) in [
            (AttentionCondition::AmbiguousEffect, false),
            (AttentionCondition::MergeApproval, false),
            (AttentionCondition::MissingEvidence, false),
        ] {
            let actions = recommendation_actions(
                &policy(condition).2,
                "subject-1",
                "attention-1",
                "occurrence-1",
                AttentionSubjectKind::Run,
                Some(&active),
                None,
                Some("bead-subject-1"),
                resolution_allowed,
                false,
                None,
            );
            assert!(
                actions
                    .iter()
                    .all(|action| action.class != forged_types::ActionClass::Should),
                "{condition:?}: {actions:?}"
            );
        }
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
            reason_detail: None,
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
            Condition::WorkSettlementPending,
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
            reason_detail: None,
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
        assert!(
            item.detail.contains("repository-write-capacity"),
            "{item:?}"
        );

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

    #[test]
    fn supervisor_markers_join_run_and_epic_decisions_without_packet_ids() {
        for (index, (subject_kind, subject_id, entry_kind)) in [
            (AdmissionSubjectKind::Run, "run-deferred", "slice"),
            (AdmissionSubjectKind::Epic, "epic-deferred", "epic"),
        ]
        .into_iter()
        .enumerate()
        {
            let decision = |outcome, reason| AdmissionDecisionV1 {
                schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
                batch_id: format!("batch-{subject_id}"),
                subject_kind,
                subject_id: subject_id.to_owned(),
                control_revision: 1,
                repository: "/repo".to_owned(),
                priority: Some(2),
                provider: Some("claude".to_owned()),
                model: Some("opus".to_owned()),
                resource_class: AdmissionResourceClass::Read,
                outcome,
                reason,
                reason_detail: None,
                policy_revision: "policy".to_owned(),
                evidence: AdmissionCapacityV1::default(),
                next_eligible_wake_at: None,
            };
            let mut snapshot = snapshot();
            snapshot.events_by_kind.insert(
                "forged.admission.attention".to_owned(),
                vec![event(
                    i64::try_from(index + 1).expect("event id"),
                    subject_id,
                    "forged.admission.attention",
                    json!({
                        "schema": "forged.admission.attention/1",
                        "condition": "admission-deferred",
                        "subjectKind": serde_json::to_value(subject_kind)
                            .expect("subject kind"),
                        "reason": "total-capacity",
                        "wakes": 3,
                    }),
                )],
            );
            snapshot.admission_decisions.push(decision(
                AdmissionOutcome::Deferred,
                AdmissionReason::TotalCapacity,
            ));
            let mut subject_entry = entry(subject_id);
            subject_entry["kind"] = json!(entry_kind);
            let items = project_active(&snapshot, &[subject_entry.clone()], &[])
                .expect("project supervisor deferral");
            let item = items
                .iter()
                .find(|item| item.condition == AttentionCondition::AdmissionDeferred)
                .expect("supervisor deferral item");
            assert_eq!(item.subject_id, subject_id);
            assert!(item.detail.contains("total-capacity"), "{item:?}");

            snapshot.admission_decisions[0] = decision(
                AdmissionOutcome::Admitted,
                AdmissionReason::CapacityAvailable,
            );
            assert!(project_active(&snapshot, &[subject_entry], &[])
                .expect("project admitted subject")
                .iter()
                .all(|item| item.condition != AttentionCondition::AdmissionDeferred));
        }
    }

    #[test]
    fn epic_observation_keeps_run_reservation_identity_on_the_epic() {
        let subject = observed_reservation_subject(
            "epic-owner",
            Some("child-run"),
            AdmissionSubjectKind::Run,
        );
        assert_eq!(subject, "epic-owner");
        let stable = attention_id(
            AttentionSubjectKind::Epic,
            subject,
            AttentionCondition::AmbiguousEffect,
        );
        assert_eq!(
            stable,
            "fc9d8fb4d7d601fc67b888c24bfb0facbc91b6634f108b76eb5f4ded2071c1fb"
        );
        assert_ne!(
            stable,
            attention_id(
                AttentionSubjectKind::Run,
                "child-run",
                AttentionCondition::AmbiguousEffect,
            )
        );
        assert_eq!(
            attention_occurrence_id(&stable, "reservation:reservation-run"),
            "17007eceae60891f195f5cde6319106b458fd4fe19ed3194d8ad02117f96b848"
        );
    }

    #[test]
    fn observation_transition_noops_advance_time_and_parse_errors_name_the_event() {
        let resolved = event(
            7,
            "run-transition",
            RESOLVED,
            json!({
                "schema": "forged.attention-transition/1",
                "attentionId": "attention",
                "occurrenceId": "occurrence",
                "actor": "operator",
                "disposition": "fixed",
            }),
        );
        let stale = event(
            8,
            "run-transition",
            ACKNOWLEDGED,
            json!({
                "schema": "forged.attention-transition/1",
                "attentionId": "attention",
                "occurrenceId": "occurrence",
                "actor": "lead",
            }),
        );
        let state = transition_state(&[&resolved, &stale], true, true, "attention", "occurrence")
            .expect("project observation transitions");
        assert_eq!(state.state, AttentionState::Resolved);
        assert_eq!(state.updated_at, Some(stale.ts));

        let mut invalid = event(9, "run-transition", ACKNOWLEDGED, Value::Null);
        invalid.payload_json = "{".to_owned();
        let error = match transition_state(&[&invalid], true, true, "attention", "occurrence") {
            Err(error) => error,
            Ok(_) => panic!("invalid stored transition was accepted"),
        };
        assert!(error.message.contains("transition event 9"), "{error:?}");
    }
}
