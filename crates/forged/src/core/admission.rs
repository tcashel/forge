//! Pure admission projection/evaluation over one ledger snapshot and one
//! exact-ID work batch. No portfolio, controller files, process table, Herdr,
//! or filesystem state participates in scheduling.

use std::collections::{BTreeMap, BTreeSet};
use std::fmt::Write as _;
use std::future::Future;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use forged_ledger::{
    AdmissionBatchWrite, AdmissionDurableCandidate, AdmissionLedgerSnapshot,
    AdmissionReservationRow, AdmissionReservationState, DesiredState, DesiredSubjectKind,
};
use forged_types::{
    canonical_json_bytes, AdmissionCandidateV1, AdmissionDecisionV1, AdmissionInputsV1,
    AdmissionOutcome, AdmissionReason, AdmissionResourceClass, AdmissionSubjectKind,
    ExecutionPackageV1, ProviderCandidateV1, ProviderHints, Sandbox, ADMISSION_DECISION_SCHEMA_V1,
    ADMISSION_INPUTS_SCHEMA_V1,
};
use serde::Serialize;
use serde_json::Value;
use sha2::{Digest, Sha256};

use crate::config::{now_iso, AdmissionPolicy};
use crate::core::{on_ledger, Ctx, Failure};

const RESERVATION_RECOVERY_SECONDS: u64 = 60;
const SNAPSHOT_RETRY_LIMIT: usize = 16;
const SNAPSHOT_CHANGED_MESSAGE: &str = "admission ledger facts changed before allocation";
const SNAPSHOT_RETRY_BASE_MS: u64 = 2;
const SNAPSHOT_RETRY_MAX_MS: u64 = 64;
static SNAPSHOT_RETRY_JITTER_SEQUENCE: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Clone)]
pub(crate) struct AdmissionResult {
    pub(crate) decision: AdmissionDecisionV1,
    pub(crate) reservation: Option<AdmissionReservationRow>,
    pub(crate) orphaned_reservation: Option<AdmissionReservationRow>,
    pub(crate) packet_provider_hints: Option<ProviderHints>,
}

/// The durable packet identity plus the already-resolved launch resources
/// admission needs. Keeping this smaller than `WorkPacket` preserves the
/// legacy roster fallback for old packet bodies without weakening the
/// reservation or desired-work fences.
#[derive(Debug, Clone)]
pub(crate) struct PacketAdmission {
    pub(crate) packet_id: String,
    pub(crate) run_id: String,
    pub(crate) work_id: String,
}

impl From<&forged_types::WorkPacket> for PacketAdmission {
    fn from(packet: &forged_types::WorkPacket) -> Self {
        Self {
            packet_id: packet.packet_id.clone(),
            run_id: packet.run_id.clone(),
            work_id: packet.work_id.clone(),
        }
    }
}

fn hex(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        let _ = write!(out, "{byte:02x}");
    }
    out
}

fn digest<T: Serialize>(value: &T) -> Result<String, Failure> {
    let value = serde_json::to_value(value)
        .map_err(|error| Failure::internal(format!("serializing admission value: {error}")))?;
    let bytes = canonical_json_bytes(&value)
        .map_err(|error| Failure::internal(format!("canonicalizing admission value: {error}")))?;
    Ok(hex(&Sha256::digest(bytes)))
}

fn deadline_after(anchor: &str, seconds: u64) -> Result<String, Failure> {
    let timestamp: jiff::Timestamp = anchor.parse().map_err(|error| {
        Failure::internal(format!(
            "cannot parse admission timestamp {anchor:?}: {error}"
        ))
    })?;
    let deadline = jiff::Timestamp::from_nanosecond(
        timestamp
            .as_nanosecond()
            .saturating_add(i128::from(seconds).saturating_mul(1_000_000_000)),
    )
    .map_err(|error| Failure::internal(format!("admission deadline out of range: {error}")))?;
    Ok(forged_proto::widen_rfc3339(&deadline.to_string()))
}

fn resource(candidate: &ProviderCandidateV1) -> AdmissionResourceClass {
    match candidate.sandbox {
        Sandbox::ReadOnly => AdmissionResourceClass::Read,
        Sandbox::WorkspaceWrite => AdmissionResourceClass::RepositoryWrite,
    }
}

fn first_package_candidate(package: &ExecutionPackageV1) -> Option<&ProviderCandidateV1> {
    package.profile.seats.iter().find_map(|seat| {
        package
            .roster
            .roles
            .get(&seat.role)
            .and_then(|candidates| candidates.first())
    })
}

fn packet_candidate(body: &str) -> Option<(String, String, AdmissionResourceClass)> {
    let value: Value = serde_json::from_str(body).ok()?;
    let hints = value.get("providerHints")?;
    let provider = hints.get("provider")?.as_str()?.to_owned();
    let model = hints.get("model")?.as_str()?.to_owned();
    let class = match hints.get("sandbox")?.as_str()? {
        "readOnly" => AdmissionResourceClass::Read,
        "workspaceWrite" => AdmissionResourceClass::RepositoryWrite,
        _ => return None,
    };
    Some((provider, model, class))
}

fn package_candidate(raw: &str) -> Option<(String, String, AdmissionResourceClass)> {
    let package: ExecutionPackageV1 = serde_json::from_str(raw).ok()?;
    let candidate = first_package_candidate(&package)?;
    Some((
        candidate.provider.clone(),
        candidate.model.clone(),
        resource(candidate),
    ))
}

fn epic_facts(
    durable: &AdmissionDurableCandidate,
) -> Option<(String, String, String, AdmissionResourceClass)> {
    let started: Value = serde_json::from_str(durable.epic_started_json.as_deref()?).ok()?;
    let repository = started.get("repo")?.as_str()?.to_owned();
    let package = started.get("executionPackage").cloned().or_else(|| {
        let migration: Value = serde_json::from_str(durable.epic_package_json.as_deref()?).ok()?;
        migration.get("executionPackage").cloned()
    })?;
    let package: ExecutionPackageV1 = serde_json::from_value(package).ok()?;
    let candidate = first_package_candidate(&package)?;
    Some((
        repository,
        candidate.provider.clone(),
        candidate.model.clone(),
        // The epic pass reconciles durable child state and serializes
        // integration; it never runs a provider in the repository. Charging
        // the group as the package's first workspace-write seat makes the default
        // repositoryWriteActive=1 deadlock fan-out recovery while a detached
        // child attempt is live. Child controller/packet admission carries
        // the actual provider resource class.
        AdmissionResourceClass::Read,
    ))
}

fn durable_facts(
    durable: &AdmissionDurableCandidate,
) -> Option<(String, String, String, AdmissionResourceClass)> {
    match durable.subject_kind {
        DesiredSubjectKind::Run => {
            let repository = durable.repository.clone()?;
            let (provider, model, class) = durable
                .packet_body_json
                .as_deref()
                .and_then(packet_candidate)
                .or_else(|| durable.package_json.as_deref().and_then(package_candidate))?;
            Some((repository, provider, model, class))
        }
        DesiredSubjectKind::Epic => epic_facts(durable),
    }
}

fn subject_kind(kind: DesiredSubjectKind) -> AdmissionSubjectKind {
    match kind {
        DesiredSubjectKind::Run => AdmissionSubjectKind::Run,
        DesiredSubjectKind::Epic => AdmissionSubjectKind::Epic,
    }
}

fn runnable(status: &str) -> bool {
    matches!(status, "open" | "in_progress")
}

fn bounded_input_error(error: impl std::fmt::Display) -> String {
    let mut text = error.to_string().replace(['\n', '\r', '\t'], " ");
    if text.len() > 512 {
        text.truncate(512);
    }
    text
}

#[derive(Debug, Clone, Copy)]
struct DesiredAdmissionShape {
    desired_state: DesiredState,
    control_revision: u64,
    exhausted: bool,
    explicit: bool,
    requires_authorization: bool,
}

#[derive(Debug, Clone, Copy)]
struct WorkAdmissionShape<'a> {
    item: Option<&'a crate::core::work_types::IssueSummary>,
    input_error: Option<&'a str>,
}

#[derive(Debug, Clone, Copy)]
struct LaunchAdmissionFacts<'a> {
    available: bool,
    provider: Option<&'a str>,
    model: Option<&'a str>,
}

/// The complete non-capacity admission predicate. Submit rehearses this
/// shape explicitly; admission uses the same result before applying mutable
/// capacity, spend, and rate policy.
fn invalid_reason(
    desired: DesiredAdmissionShape,
    work: WorkAdmissionShape<'_>,
    facts: LaunchAdmissionFacts<'_>,
    repository: &str,
) -> Option<AdmissionReason> {
    let work_repository = work.item.and_then(|item| item.metadata.get("repository"));
    if desired.requires_authorization && desired.control_revision == 0 {
        Some(AdmissionReason::Unauthorized)
    } else if !desired.explicit
        && desired.control_revision > 0
        && desired.desired_state != DesiredState::Running
    {
        Some(AdmissionReason::DesiredNotRunning)
    } else if desired.exhausted && !desired.explicit {
        Some(AdmissionReason::Exhausted)
    } else if work.input_error.is_some() || work.item.is_none() {
        Some(AdmissionReason::WorkUnavailable)
    } else if work.item.is_some_and(|item| {
        item.priority.is_none() || item.revision.is_none() || work_repository.is_none()
    }) {
        Some(AdmissionReason::WorkMalformed)
    } else if work.item.is_some_and(|item| !runnable(&item.status)) {
        Some(AdmissionReason::WorkNotRunnable)
    } else if !facts.available
        || facts.provider.is_none_or(str::is_empty)
        || facts.model.is_none_or(str::is_empty)
    {
        Some(AdmissionReason::WorkMalformed)
    } else if work_repository.map(String::as_str) != Some(repository) {
        Some(AdmissionReason::RepositoryMismatch)
    } else {
        None
    }
}

fn project_candidates(
    snapshot: &AdmissionLedgerSnapshot,
    issues: &[crate::core::work_types::IssueSummary],
    targets: &BTreeSet<(DesiredSubjectKind, String)>,
    explicit_submit: Option<&(DesiredSubjectKind, String)>,
    input_error: Option<&str>,
) -> Vec<(AdmissionCandidateV1, Option<AdmissionReason>)> {
    let issues = issues
        .iter()
        .map(|issue| (issue.id.as_str(), issue))
        .collect::<BTreeMap<_, _>>();
    let mut out = Vec::new();
    for durable in snapshot
        .candidates
        .iter()
        .filter(|row| targets.contains(&(row.subject_kind, row.subject_id.clone())))
    {
        let issue = durable
            .work_id
            .as_deref()
            .and_then(|work_id| issues.get(work_id).copied());
        let facts = durable_facts(durable);
        let (repository, provider, model, resource_class) = facts.clone().map_or_else(
            || {
                (
                    durable.repository.clone().unwrap_or_default(),
                    None,
                    None,
                    AdmissionResourceClass::Read,
                )
            },
            |(repository, provider, model, resource_class)| {
                (
                    repository,
                    (!provider.is_empty()).then_some(provider),
                    (!model.is_empty()).then_some(model),
                    resource_class,
                )
            },
        );
        let work_repository = issue.and_then(|issue| issue.metadata.get("repository").cloned());
        let candidate = AdmissionCandidateV1 {
            subject_kind: subject_kind(durable.subject_kind),
            subject_id: durable.subject_id.clone(),
            control_revision: durable.control_revision,
            work_id: durable
                .work_id
                .clone()
                .unwrap_or_else(|| durable.subject_id.clone()),
            work_revision: issue.and_then(|issue| issue.revision.clone()),
            work_status: issue.map(|issue| issue.status.clone()),
            priority: issue.and_then(|issue| issue.priority),
            repository: repository.clone(),
            work_repository: work_repository.clone(),
            input_error: input_error.map(str::to_owned),
            desired_wake_at: durable.next_wake_at.clone(),
            provider,
            model,
            resource_class,
            authorized_at: durable.authorized_at.clone(),
        };
        let is_explicit = explicit_submit.is_some_and(|target| {
            target.0 == durable.subject_kind && target.1 == durable.subject_id
        });
        let invalid = invalid_reason(
            DesiredAdmissionShape {
                desired_state: durable.desired_state,
                control_revision: durable.control_revision,
                exhausted: durable.exhausted,
                explicit: is_explicit,
                requires_authorization: false,
            },
            WorkAdmissionShape {
                item: issue,
                input_error,
            },
            LaunchAdmissionFacts {
                available: facts.is_some(),
                provider: candidate.provider.as_deref(),
                model: candidate.model.as_deref(),
            },
            &repository,
        );
        out.push((candidate, invalid));
    }
    out.sort_by(|(left, _), (right, _)| {
        left.priority
            .unwrap_or(i64::MAX)
            .cmp(&right.priority.unwrap_or(i64::MAX))
            .then_with(|| left.authorized_at.cmp(&right.authorized_at))
            .then_with(|| left.subject_kind.cmp(&right.subject_kind))
            .then_with(|| left.subject_id.cmp(&right.subject_id))
    });
    out
}

fn usage_reason(
    inputs: &AdmissionInputsV1,
    policy: &AdmissionPolicy,
    candidate: &AdmissionCandidateV1,
) -> Option<AdmissionReason> {
    let spend = inputs.spend.iter().find(|row| {
        candidate.provider.as_deref() == Some(row.provider.as_str())
            && candidate.model.as_deref() == Some(row.model.as_str())
    });
    if let Some(ceiling) = policy.token_ceiling {
        let tokens = spend
            .map(|row| row.input_tokens.saturating_add(row.output_tokens))
            .unwrap_or(0);
        if tokens >= ceiling {
            return Some(AdmissionReason::TokenCeiling);
        }
    }
    if let Some(ceiling) = policy.known_cost_ceiling_microusd {
        if spend.is_some_and(|row| row.rows_missing_cost > 0) {
            return Some(AdmissionReason::MissingCost);
        }
        if spend.is_some_and(|row| row.known_cost_microusd >= ceiling) {
            return Some(AdmissionReason::KnownCostCeiling);
        }
    }
    if let Some(ceiling) = policy.rate_limit_ceiling_millipercent {
        let Some(rate) = inputs.latest_rate_limits.iter().find(|row| {
            candidate.provider.as_deref() == Some(row.provider.as_str())
                && candidate.model.as_deref() == Some(row.model.as_str())
        }) else {
            return Some(AdmissionReason::StaleRateLimit);
        };
        let fresh_seconds = policy.rate_limit_fresh_seconds.unwrap_or(0);
        let observed = rate.observed_at.parse::<jiff::Timestamp>().ok();
        let as_of = inputs.as_of.parse::<jiff::Timestamp>().ok();
        let fresh = observed.zip(as_of).is_some_and(|(observed, as_of)| {
            let age = as_of
                .as_nanosecond()
                .saturating_sub(observed.as_nanosecond());
            age >= 0 && age <= i128::from(fresh_seconds) * 1_000_000_000
        });
        if !fresh || rate.used_millipercent.is_none() {
            return Some(AdmissionReason::StaleRateLimit);
        }
        if rate.used_millipercent.is_some_and(|used| used >= ceiling) {
            return Some(AdmissionReason::RateLimitCeiling);
        }
    }
    None
}

fn reason_detail(candidate: &AdmissionCandidateV1, reason: AdmissionReason) -> Option<String> {
    match reason {
        AdmissionReason::WorkMalformed => {
            let mut missing = Vec::new();
            if candidate.priority.is_none() {
                missing.push("priority");
            }
            if candidate.work_revision.is_none() {
                missing.push("revision");
            }
            if candidate.repository.trim().is_empty()
                || candidate
                    .work_repository
                    .as_deref()
                    .is_none_or(str::is_empty)
            {
                missing.push("repository");
            }
            if candidate.provider.as_deref().is_none_or(str::is_empty) {
                missing.push("provider");
            }
            if candidate.model.as_deref().is_none_or(str::is_empty) {
                missing.push("model");
            }
            Some(if missing.is_empty() {
                "one or more required work fields are malformed".to_owned()
            } else {
                format!("missing required field(s): {}", missing.join(", "))
            })
        }
        AdmissionReason::WorkNotRunnable => Some(format!(
            "status is not runnable: {}",
            candidate.work_status.as_deref().unwrap_or("missing")
        )),
        _ => None,
    }
}

pub(crate) fn decision_reason(decision: &AdmissionDecisionV1) -> String {
    let reason = serde_json::to_value(decision.reason)
        .ok()
        .and_then(|value| value.as_str().map(str::to_owned))
        .unwrap_or_else(|| "admission-deferred".to_owned());
    decision
        .reason_detail
        .as_ref()
        .map_or(reason.clone(), |detail| format!("{reason}: {detail}"))
}

#[derive(Debug, Clone)]
pub(crate) struct AdmissionShapeRefusal {
    pub(crate) candidate: AdmissionCandidateV1,
    pub(crate) reason: AdmissionReason,
    pub(crate) reason_detail: Option<String>,
}

impl AdmissionShapeRefusal {
    pub(crate) fn detail(&self) -> String {
        let reason = serde_json::to_value(self.reason)
            .ok()
            .and_then(|value| value.as_str().map(str::to_owned))
            .unwrap_or_else(|| "admission-refused".to_owned());
        self.reason_detail
            .as_ref()
            .map_or(reason.clone(), |detail| format!("{reason}: {detail}"))
    }
}

/// Rehearse only the durable non-capacity predicate for one explicit submit.
/// The snapshot and bounded work hydration are read-only; mutable capacity,
/// spend, rate policy, reservations, and decision persistence stay in
/// [`admit`].
pub(crate) async fn preflight_shape(
    ctx: &Ctx,
    target: (DesiredSubjectKind, String),
) -> Result<Option<AdmissionShapeRefusal>, Failure> {
    let snapshot = on_ledger(&ctx.ledger, {
        let target = target.clone();
        move |ledger| ledger.admission_snapshot(Some(target))
    })
    .await?;
    let targets = BTreeSet::from([target.clone()]);
    let work_ids = snapshot
        .candidates
        .iter()
        .filter(|candidate| candidate.subject_kind == target.0 && candidate.subject_id == target.1)
        .filter_map(|candidate| candidate.work_id.clone())
        .collect::<Vec<_>>();
    let (issues, input_error) =
        match crate::core::workstore::list_issues(&ctx.ledger, &work_ids).await {
            Ok(issues) => (issues, None),
            Err(error) => (Vec::new(), Some(bounded_input_error(error))),
        };
    let mut projected = project_candidates(
        &snapshot,
        &issues,
        &targets,
        Some(&target),
        input_error.as_deref(),
    );
    if projected.len() != 1 {
        return Err(Failure::internal(format!(
            "submit admission preflight projected {} candidates, expected one",
            projected.len()
        )));
    }
    let (candidate, reason) = projected.remove(0);
    Ok(reason.map(|reason| AdmissionShapeRefusal {
        reason_detail: reason_detail(&candidate, reason),
        candidate,
        reason,
    }))
}

fn evaluate_with_repository_exemptions(
    mut inputs: AdmissionInputsV1,
    policy: &AdmissionPolicy,
    invalid: &BTreeMap<(AdmissionSubjectKind, String), AdmissionReason>,
    repository_exemptions: &BTreeSet<(AdmissionSubjectKind, String)>,
) -> Result<(AdmissionInputsV1, Vec<AdmissionDecisionV1>), Failure> {
    let batch_id = format!("admission:{}", digest(&inputs)?);
    let mut capacity = inputs.capacity.clone();
    let mut decisions = Vec::new();
    for candidate in &inputs.candidates {
        let key = (candidate.subject_kind, candidate.subject_id.clone());
        let reason = invalid
            .get(&key)
            .copied()
            .or_else(|| usage_reason(&inputs, policy, candidate));
        let provider = candidate.provider.as_deref().unwrap_or_default();
        let model = candidate.model.as_deref().unwrap_or_default();
        let provider_limit = policy
            .provider_overrides
            .get(provider)
            .copied()
            .unwrap_or(policy.provider_active);
        let model_key = format!("{provider}/{model}");
        let model_limit = policy.model_overrides.get(&model_key).copied();
        let provider_active = capacity.provider_active.get(provider).copied().unwrap_or(0);
        let model_active = capacity
            .model_active
            .get(&model_key)
            .copied()
            .or_else(|| capacity.model_active.get(model).copied())
            .unwrap_or(0);
        let repo_active = capacity
            .repository_write_active
            .get(&candidate.repository)
            .copied()
            .unwrap_or(0)
            .saturating_sub(u32::from(repository_exemptions.contains(&key)));
        let reason = reason
            .or_else(|| {
                (capacity.total_active >= policy.total_active)
                    .then_some(AdmissionReason::TotalCapacity)
            })
            .or_else(|| {
                (provider_active >= provider_limit).then_some(AdmissionReason::ProviderCapacity)
            })
            .or_else(|| {
                model_limit
                    .filter(|limit| model_active >= *limit)
                    .map(|_| AdmissionReason::ProviderCapacity)
            })
            .or_else(|| {
                (candidate.resource_class == AdmissionResourceClass::RepositoryWrite
                    && repo_active >= policy.repository_write_active)
                    .then_some(AdmissionReason::RepositoryWriteCapacity)
            });
        let evidence = capacity.clone();
        let (outcome, reason, wake) = match reason {
            None => (
                AdmissionOutcome::Admitted,
                AdmissionReason::CapacityAvailable,
                None,
            ),
            Some(
                reason @ (AdmissionReason::DesiredNotRunning
                | AdmissionReason::Unauthorized
                | AdmissionReason::Terminal
                | AdmissionReason::InputRequired
                | AdmissionReason::Exhausted
                | AdmissionReason::Superseded),
            ) => (AdmissionOutcome::Ineligible, reason, None),
            Some(reason) => (
                AdmissionOutcome::Deferred,
                reason,
                Some(deadline_after(&inputs.as_of, policy.defer_seconds)?),
            ),
        };
        if outcome == AdmissionOutcome::Admitted {
            capacity.total_active = capacity.total_active.saturating_add(1);
            *capacity
                .provider_active
                .entry(provider.to_owned())
                .or_default() += 1;
            *capacity.model_active.entry(model_key).or_default() += 1;
            if candidate.resource_class == AdmissionResourceClass::RepositoryWrite {
                *capacity
                    .repository_write_active
                    .entry(candidate.repository.clone())
                    .or_default() += 1;
            }
        }
        decisions.push(AdmissionDecisionV1 {
            schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
            batch_id: batch_id.clone(),
            subject_kind: candidate.subject_kind,
            subject_id: candidate.subject_id.clone(),
            control_revision: candidate.control_revision,
            repository: candidate.repository.clone(),
            priority: candidate.priority,
            provider: candidate.provider.clone(),
            model: candidate.model.clone(),
            resource_class: candidate.resource_class,
            outcome,
            reason,
            reason_detail: reason_detail(candidate, reason),
            policy_revision: inputs.policy_revision.clone(),
            evidence,
            next_eligible_wake_at: wake,
        });
    }
    // Preserve the sorted candidate bytes used to derive the decision order.
    inputs.candidates.shrink_to_fit();
    Ok((inputs, decisions))
}

pub(crate) fn evaluate(
    inputs: AdmissionInputsV1,
    policy: &AdmissionPolicy,
    invalid: &BTreeMap<(AdmissionSubjectKind, String), AdmissionReason>,
) -> Result<(AdmissionInputsV1, Vec<AdmissionDecisionV1>), Failure> {
    evaluate_with_repository_exemptions(inputs, policy, invalid, &BTreeSet::new())
}

fn snapshot_changed(failure: &Failure) -> bool {
    failure.code == forged_types::ErrorCode::OperationInProgress
        && failure.message.ends_with(SNAPSHOT_CHANGED_MESSAGE)
}

fn snapshot_retry_delay(attempt: usize, jitter: u64) -> Duration {
    let shift = u32::try_from(attempt).unwrap_or(u32::MAX).min(63);
    let ceiling_ms = SNAPSHOT_RETRY_BASE_MS
        .saturating_mul(1_u64 << shift)
        .min(SNAPSHOT_RETRY_MAX_MS);
    let floor_ms = (ceiling_ms / 2).max(1);
    let span = ceiling_ms - floor_ms + 1;
    Duration::from_millis(floor_ms + jitter % span)
}

fn snapshot_retry_jitter() -> u64 {
    let sequence = SNAPSHOT_RETRY_JITTER_SEQUENCE.fetch_add(1, Ordering::Relaxed);
    let clock = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos() as u64;
    clock ^ sequence.wrapping_mul(0x9e37_79b9_7f4a_7c15)
}

async fn retry_snapshot_changes<T, F, Fut>(mut operation: F) -> Result<T, Failure>
where
    F: FnMut() -> Fut,
    Fut: Future<Output = Result<T, Failure>>,
{
    for attempt in 0..SNAPSHOT_RETRY_LIMIT {
        match operation().await {
            Err(failure) if snapshot_changed(&failure) && attempt + 1 < SNAPSHOT_RETRY_LIMIT => {
                tokio::time::sleep(snapshot_retry_delay(attempt, snapshot_retry_jitter())).await;
            }
            result => return result,
        }
    }
    unreachable!("bounded admission retry loop always returns")
}

/// Only the exact run reservation whose old controller is absent may stop
/// counting against that same run's repository-write decision. The orphan
/// remains capacity-bearing in the ledger until reconciliation has advanced
/// the desired generation and atomically replaces its custody.
///
/// The probe is total by construction: an exemption is an affirmative absence
/// proof, so a failure to prove absence is never an error for the pass. One
/// subject's unreadable evidence leaves that subject counted and routed to its
/// own per-subject reconciliation path; it never aborts admission for every
/// other claimed subject in the tick.
async fn orphaned_repository_exemptions(
    ctx: &Ctx,
    snapshot: &AdmissionLedgerSnapshot,
    targets: &BTreeSet<(DesiredSubjectKind, String)>,
) -> BTreeMap<(AdmissionSubjectKind, String), AdmissionReservationRow> {
    let mut exemptions = BTreeMap::new();
    for reservation in snapshot.reservations.iter().filter(|reservation| {
        reservation.subject_kind == AdmissionSubjectKind::Run
            && reservation.resource_class == AdmissionResourceClass::RepositoryWrite
            && reservation.state == AdmissionReservationState::Orphaned
            && reservation.owner_kind.as_deref() == Some("controller")
            && targets.contains(&(DesiredSubjectKind::Run, reservation.subject_id.clone()))
    }) {
        let Some(owner) = reservation.owner_id.as_deref() else {
            continue;
        };
        let Some((owner_scope, owner_id, owner_generation)) =
            super::handoff::admission_controller_owner(owner)
        else {
            continue;
        };
        if owner_scope != "run" || owner_id != reservation.subject_id {
            continue;
        }
        let run_id = reservation.subject_id.clone();
        let evidence = on_ledger(&ctx.ledger, {
            let run_id = run_id.clone();
            move |ledger| {
                let desired = ledger.get_desired_work(DesiredSubjectKind::Run, &run_id)?;
                Ok(
                    desired.is_some_and(|row| row.controller_generation == owner_generation)
                        && ledger
                            .uncontained_machine_operations(&run_id, None)?
                            .is_empty()
                        && ledger.list_live_attempts(Some(&run_id))?.is_empty(),
                )
            }
        })
        .await;
        if !matches!(evidence, Ok(true)) {
            continue;
        }
        let record = super::handoff::recover_reserved_record(
            ctx,
            &run_id,
            super::handoff::Scope::Run,
            owner_generation,
        )
        .await;
        if !matches!(record, Ok(None)) {
            continue;
        }
        exemptions.insert(
            (AdmissionSubjectKind::Run, reservation.subject_id.clone()),
            reservation.clone(),
        );
    }
    exemptions
}

pub(crate) async fn admit(
    ctx: &Ctx,
    targets: Vec<(DesiredSubjectKind, String)>,
    explicit_submit: Option<(DesiredSubjectKind, String)>,
) -> Result<Vec<AdmissionResult>, Failure> {
    retry_snapshot_changes(|| admit_once(ctx, targets.clone(), explicit_submit.clone())).await
}

async fn admit_once(
    ctx: &Ctx,
    targets: Vec<(DesiredSubjectKind, String)>,
    explicit_submit: Option<(DesiredSubjectKind, String)>,
) -> Result<Vec<AdmissionResult>, Failure> {
    let target_set = targets.into_iter().collect::<BTreeSet<_>>();
    let snapshot = {
        let extra = explicit_submit.clone();
        let release_targets = target_set
            .iter()
            .map(|(kind, id)| (subject_kind(*kind), id.clone()))
            .collect();
        on_ledger(&ctx.ledger, move |ledger| {
            ledger.admission_snapshot_releasing_unowned(extra, release_targets)
        })
        .await?
    };
    let orphaned_exemptions = orphaned_repository_exemptions(ctx, &snapshot, &target_set).await;
    // Only an owned effect identity can enter recovery without a new work
    // and policy decision. Ownerless reservations were released atomically
    // before this snapshot because they prove no effect transfer occurred.
    let mut recovered = Vec::new();
    let mut fresh_targets = target_set.clone();
    for durable in snapshot.candidates.iter().filter(|candidate| {
        target_set.contains(&(candidate.subject_kind, candidate.subject_id.clone()))
    }) {
        let kind = subject_kind(durable.subject_kind);
        if let Some(reservation) = snapshot.reservations.iter().find(|reservation| {
            reservation.subject_kind == kind
                && reservation.subject_id == durable.subject_id
                && reservation.control_revision == durable.control_revision
                && (reservation.owner_kind.is_some() || reservation.owner_id.is_some())
                && !orphaned_exemptions.contains_key(&(kind, durable.subject_id.clone()))
        }) {
            let decision = snapshot
                .reservation_decisions
                .iter()
                .find(|decision| {
                    decision.subject_kind == kind
                        && decision.subject_id == durable.subject_id
                        && decision.control_revision == durable.control_revision
                })
                .cloned()
                .ok_or_else(|| {
                    Failure::internal("admission reservation has no persisted decision")
                })?;
            fresh_targets.remove(&(durable.subject_kind, durable.subject_id.clone()));
            recovered.push(AdmissionResult {
                decision,
                reservation: Some(reservation.clone()),
                orphaned_reservation: None,
                packet_provider_hints: None,
            });
        }
    }
    if fresh_targets.is_empty() {
        return Ok(recovered);
    }
    let work_ids = snapshot
        .candidates
        .iter()
        .filter(|candidate| {
            fresh_targets.contains(&(candidate.subject_kind, candidate.subject_id.clone()))
        })
        .filter_map(|candidate| candidate.work_id.clone())
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect::<Vec<_>>();
    // Exactly one bounded read, regardless of candidate count.
    let (issues, input_error) =
        match crate::core::workstore::list_issues(&ctx.ledger, &work_ids).await {
            Ok(issues) => (issues, None),
            Err(error) => (Vec::new(), Some(bounded_input_error(error))),
        };
    let projected = project_candidates(
        &snapshot,
        &issues,
        &fresh_targets,
        explicit_submit.as_ref(),
        input_error.as_deref(),
    );
    if projected.is_empty() {
        return Ok(recovered);
    }
    let invalid = projected
        .iter()
        .filter_map(|(candidate, reason)| {
            reason.map(|reason| {
                (
                    (candidate.subject_kind, candidate.subject_id.clone()),
                    reason,
                )
            })
        })
        .collect::<BTreeMap<_, _>>();
    let candidates = projected
        .into_iter()
        .map(|(candidate, _)| candidate)
        .collect();
    let policy_revision = digest(&ctx.config.admission)?;
    let inputs = AdmissionInputsV1 {
        schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
        as_of: snapshot.as_of.clone(),
        policy_revision,
        ledger_revision: snapshot.ledger_revision,
        candidates,
        capacity: snapshot.capacity,
        spend: snapshot.spend,
        latest_rate_limits: snapshot.latest_rate_limits,
    };
    let exemption_keys = orphaned_exemptions.keys().cloned().collect();
    let (inputs, decisions) = evaluate_with_repository_exemptions(
        inputs,
        &ctx.config.admission,
        &invalid,
        &exemption_keys,
    )?;
    let recovery_deadline = deadline_after(&now_iso(), RESERVATION_RECOVERY_SECONDS)?;
    let reservations = {
        let write = AdmissionBatchWrite {
            inputs,
            decisions: decisions.clone(),
            recovery_deadline,
        };
        crate::failpoint::hit("admission.batch.commit.before");
        let reservations = on_ledger(&ctx.ledger, move |ledger| {
            ledger.commit_admission_batch(write)
        })
        .await?;
        crate::failpoint::hit("admission.batch.commit.after");
        reservations
    };
    let by_subject = reservations
        .into_iter()
        .map(|reservation| {
            (
                (reservation.subject_kind, reservation.subject_id.clone()),
                reservation,
            )
        })
        .collect::<BTreeMap<_, _>>();
    recovered.extend(
        decisions
            .into_iter()
            .map(|decision| AdmissionResult {
                reservation: by_subject
                    .get(&(decision.subject_kind, decision.subject_id.clone()))
                    .cloned(),
                orphaned_reservation: orphaned_exemptions
                    .get(&(decision.subject_kind, decision.subject_id.clone()))
                    .cloned(),
                decision,
                packet_provider_hints: None,
            })
            .collect::<Vec<_>>(),
    );
    Ok(recovered)
}

/// Admit one provider-attempt claim. The parent run is fetched through the
/// same snapshot solely to prove authorization and repository identity; the
/// reservation itself is packet-addressed for atomic attempt transfer.
pub(crate) async fn admit_packet(
    ctx: &Ctx,
    packet: &forged_types::WorkPacket,
) -> Result<AdmissionResult, Failure> {
    admit_packet_facts(ctx, &PacketAdmission::from(packet)).await
}

pub(crate) async fn admit_packet_facts(
    ctx: &Ctx,
    packet: &PacketAdmission,
) -> Result<AdmissionResult, Failure> {
    retry_snapshot_changes(|| admit_packet_facts_once(ctx, packet)).await
}

async fn admit_packet_facts_once(
    ctx: &Ctx,
    packet: &PacketAdmission,
) -> Result<AdmissionResult, Failure> {
    let run_id = packet.run_id.clone();
    let packet_id = packet.packet_id.clone();
    let snapshot = on_ledger(&ctx.ledger, {
        let run_id = run_id.clone();
        move |ledger| {
            ledger.admission_snapshot_releasing_unowned(
                Some((DesiredSubjectKind::Run, run_id)),
                vec![(AdmissionSubjectKind::Packet, packet_id)],
            )
        }
    })
    .await?;
    let durable = snapshot
        .candidates
        .iter()
        .find(|candidate| {
            candidate.subject_kind == DesiredSubjectKind::Run && candidate.subject_id == run_id
        })
        .or_else(|| {
            snapshot
                .candidates
                .iter()
                .find(|candidate| candidate.delegated_run_id.as_deref() == Some(run_id.as_str()))
        })
        .ok_or_else(|| Failure::internal("run vanished from admission snapshot"))?;
    let packet_facts = snapshot
        .packet_facts
        .iter()
        .find(|facts| facts.packet_id == packet.packet_id)
        .ok_or_else(|| Failure::internal("packet vanished from admission snapshot"))?;
    if packet_facts.run_id != packet.run_id || packet_facts.work_id != packet.work_id {
        return Err(Failure::refused(
            forged_types::ErrorCode::OperationInProgress,
            "packet identity changed before admission",
        ));
    }
    if let Some(reservation) = snapshot.reservations.iter().find(|reservation| {
        reservation.subject_kind == AdmissionSubjectKind::Packet
            && reservation.subject_id == packet.packet_id
            && reservation.control_revision == durable.control_revision
            && (reservation.owner_kind.is_some() || reservation.owner_id.is_some())
    }) {
        let decision = snapshot
            .reservation_decisions
            .iter()
            .find(|decision| {
                decision.subject_kind == AdmissionSubjectKind::Packet
                    && decision.subject_id == packet.packet_id
                    && decision.control_revision == durable.control_revision
            })
            .cloned()
            .ok_or_else(|| Failure::internal("packet reservation has no persisted decision"))?;
        return Ok(AdmissionResult {
            decision,
            reservation: Some(reservation.clone()),
            orphaned_reservation: None,
            packet_provider_hints: Some(ProviderHints {
                provider: packet_facts.provider.clone(),
                model: packet_facts.model.clone(),
                effort: packet_facts.effort.clone(),
                sandbox: match packet_facts.resource_class {
                    AdmissionResourceClass::Read => Sandbox::ReadOnly,
                    AdmissionResourceClass::RepositoryWrite => Sandbox::WorkspaceWrite,

                    // A gate reservation never launches a packet; the read-only sandbox

                    // is the conservative shape for a class that has no seat.
                    AdmissionResourceClass::Gate => Sandbox::ReadOnly,
                },
            }),
        });
    }
    let (issues, input_error) = match crate::core::workstore::list_issues(
        &ctx.ledger,
        std::slice::from_ref(&packet.work_id),
    )
    .await
    {
        Ok(issues) => (issues, None),
        Err(error) => (Vec::new(), Some(bounded_input_error(error))),
    };
    let issue = issues.iter().find(|issue| issue.id == packet.work_id);
    let repository = packet_facts.repository.clone();
    let work_repository = issue.and_then(|issue| issue.metadata.get("repository").cloned());
    let candidate = AdmissionCandidateV1 {
        subject_kind: AdmissionSubjectKind::Packet,
        subject_id: packet.packet_id.clone(),
        control_revision: durable.control_revision,
        work_id: packet.work_id.clone(),
        work_revision: issue.and_then(|issue| issue.revision.clone()),
        work_status: issue.map(|issue| issue.status.clone()),
        priority: issue.and_then(|issue| issue.priority),
        repository: repository.clone(),
        work_repository: work_repository.clone(),
        input_error: input_error.clone(),
        desired_wake_at: durable.next_wake_at.clone(),
        provider: (!packet_facts.provider.is_empty()).then(|| packet_facts.provider.clone()),
        model: (!packet_facts.model.is_empty()).then(|| packet_facts.model.clone()),
        resource_class: packet_facts.resource_class,
        authorized_at: durable.authorized_at.clone(),
    };
    let invalid = invalid_reason(
        DesiredAdmissionShape {
            desired_state: durable.desired_state,
            control_revision: durable.control_revision,
            exhausted: durable.exhausted,
            explicit: false,
            requires_authorization: true,
        },
        WorkAdmissionShape {
            item: issue,
            input_error: input_error.as_deref(),
        },
        LaunchAdmissionFacts {
            available: true,
            provider: candidate.provider.as_deref(),
            model: candidate.model.as_deref(),
        },
        &repository,
    );
    let policy_revision = digest(&ctx.config.admission)?;
    let inputs = AdmissionInputsV1 {
        schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
        as_of: snapshot.as_of.clone(),
        policy_revision,
        ledger_revision: snapshot.ledger_revision,
        candidates: vec![candidate],
        capacity: snapshot.capacity,
        spend: snapshot.spend,
        latest_rate_limits: snapshot.latest_rate_limits,
    };
    let invalid = invalid
        .map(|reason| {
            BTreeMap::from([(
                (AdmissionSubjectKind::Packet, packet.packet_id.clone()),
                reason,
            )])
        })
        .unwrap_or_default();
    let (inputs, mut decisions) = evaluate(inputs, &ctx.config.admission, &invalid)?;
    let decision = decisions
        .pop()
        .ok_or_else(|| Failure::internal("packet admission produced no decision"))?;
    let recovery_deadline = deadline_after(&now_iso(), RESERVATION_RECOVERY_SECONDS)?;
    crate::failpoint::hit("admission.batch.commit.before");
    let reservations = on_ledger(&ctx.ledger, {
        let decision = decision.clone();
        move |ledger| {
            ledger.commit_admission_batch(AdmissionBatchWrite {
                inputs,
                decisions: vec![decision],
                recovery_deadline,
            })
        }
    })
    .await?;
    crate::failpoint::hit("admission.batch.commit.after");
    Ok(AdmissionResult {
        reservation: reservations.into_iter().next(),
        orphaned_reservation: None,
        decision,
        packet_provider_hints: Some(ProviderHints {
            provider: packet_facts.provider.clone(),
            model: packet_facts.model.clone(),
            effort: packet_facts.effort.clone(),
            sandbox: match packet_facts.resource_class {
                AdmissionResourceClass::Read => Sandbox::ReadOnly,
                AdmissionResourceClass::RepositoryWrite => Sandbox::WorkspaceWrite,

                // A gate reservation never launches a packet; the read-only sandbox

                // is the conservative shape for a class that has no seat.
                AdmissionResourceClass::Gate => Sandbox::ReadOnly,
            },
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    use forged_ledger::{Ledger, NewPacket, NewRun, NewRunDefinition, SpecFence};
    use forged_types::{
        AdmissionCapacityV1, AdmissionRateLimitV1, AdmissionSpendV1, ExecutionPolicyV1,
        HostPolicyV1, ProfileDefinitionV1, ProfileRef, ProtocolRef, ResolvedRosterV1, RoleId,
        RosterRef, RunId, Stage, DEFAULT_TERMINATION_GRACE_S, EXECUTION_PACKAGE_SCHEMA_V1,
        PROFILE_SCHEMA_V1, RESOLVED_ROSTER_SCHEMA_V1,
    };

    #[test]
    fn protocol_names_never_make_a_blocked_work_runnable() {
        assert!(!runnable("blocked"));
    }

    #[test]
    fn explicit_shape_bypasses_only_desired_state_and_exhaustion() {
        let mut metadata = BTreeMap::new();
        metadata.insert("repository".to_owned(), "/repo".to_owned());
        let mut item = crate::core::work_types::IssueSummary {
            id: "work-shape".to_owned(),
            title: "Work shape".to_owned(),
            description: String::new(),
            status: "open".to_owned(),
            priority: Some(2),
            assignee: None,
            issue_type: "task".to_owned(),
            acceptance_criteria: String::new(),
            design: String::new(),
            notes: String::new(),
            spec_id: None,
            metadata,
            revision: Some("1".to_owned()),
            updated_at: None,
        };
        let facts = LaunchAdmissionFacts {
            available: true,
            provider: Some("codex"),
            model: Some("gpt"),
        };
        let desired = DesiredAdmissionShape {
            desired_state: DesiredState::Stopped,
            control_revision: 1,
            exhausted: true,
            explicit: true,
            requires_authorization: false,
        };
        assert_eq!(
            invalid_reason(
                desired,
                WorkAdmissionShape {
                    item: Some(&item),
                    input_error: None,
                },
                facts,
                "/repo",
            ),
            None
        );
        item.priority = None;
        assert_eq!(
            invalid_reason(
                desired,
                WorkAdmissionShape {
                    item: Some(&item),
                    input_error: None,
                },
                facts,
                "/repo",
            ),
            Some(AdmissionReason::WorkMalformed)
        );
        item.priority = Some(2);
        assert_eq!(
            invalid_reason(
                DesiredAdmissionShape {
                    explicit: false,
                    ..desired
                },
                WorkAdmissionShape {
                    item: Some(&item),
                    input_error: None,
                },
                facts,
                "/repo",
            ),
            Some(AdmissionReason::DesiredNotRunning)
        );
    }

    #[test]
    fn snapshot_retry_backoff_is_bounded_and_jittered() {
        for attempt in 0..SNAPSHOT_RETRY_LIMIT - 1 {
            let lower = snapshot_retry_delay(attempt, 0);
            let upper = snapshot_retry_delay(attempt, u64::MAX);
            assert!(lower >= Duration::from_millis(1));
            assert!(lower <= Duration::from_millis(SNAPSHOT_RETRY_MAX_MS));
            assert!(upper >= Duration::from_millis(1));
            assert!(upper <= Duration::from_millis(SNAPSHOT_RETRY_MAX_MS));
        }
        assert_ne!(
            snapshot_retry_delay(3, 0),
            snapshot_retry_delay(3, u64::MAX),
            "the retry seam must vary within its bounded window"
        );
    }

    #[tokio::test]
    async fn snapshot_change_refusal_retries_before_returning_success() {
        let calls = std::sync::atomic::AtomicUsize::new(0);
        let result = retry_snapshot_changes(|| {
            let attempt = calls.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            async move {
                if attempt == 0 {
                    Err(Failure {
                        code: forged_types::ErrorCode::OperationInProgress,
                        message: format!("ledger: {SNAPSHOT_CHANGED_MESSAGE}"),
                        recoverable: true,
                    })
                } else {
                    Ok("admitted")
                }
            }
        })
        .await
        .expect("second snapshot succeeds");
        assert_eq!(result, "admitted");
        assert_eq!(calls.load(std::sync::atomic::Ordering::Relaxed), 2);
    }

    #[tokio::test]
    async fn scheduling_write_interleave_is_rejected_then_retried() {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("state.db");
        let ledger = Ledger::open(&path).expect("ledger");
        let run_id = "run-retry-interleave".to_owned();
        ledger
            .create_run(NewRun {
                run_id: RunId::new(&run_id).expect("run id"),
                work_id: "bead-retry-interleave".to_owned(),
                repo: "example/repo".to_owned(),
                base_ref: "main".to_owned(),
                branch: "work/retry-interleave".to_owned(),
            })
            .expect("run");
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, &run_id, 1)
            .expect("authorize");
        let calls = std::sync::atomic::AtomicUsize::new(0);
        let reservations = retry_snapshot_changes(|| {
            let attempt = calls.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            let ledger = ledger.clone();
            let path = path.clone();
            let run_id = run_id.clone();
            async move {
                let snapshot = ledger.admission_snapshot(None).map_err(Failure::from)?;
                let inputs = AdmissionInputsV1 {
                    schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
                    as_of: snapshot.as_of,
                    policy_revision: "policy".to_owned(),
                    ledger_revision: snapshot.ledger_revision,
                    candidates: vec![candidate(&run_id, 0, "codex")],
                    capacity: snapshot.capacity,
                    spend: snapshot.spend,
                    latest_rate_limits: snapshot.latest_rate_limits,
                };
                let (inputs, decisions) =
                    evaluate(inputs, &AdmissionPolicy::default(), &BTreeMap::new())?;
                if attempt == 0 {
                    rusqlite::Connection::open(path)
                        .expect("second process")
                        .execute(
                            "UPDATE runs SET repo = 'changed/repo' WHERE run_id = ?1",
                            [&run_id],
                        )
                        .expect("interleave scheduling write");
                }
                ledger
                    .commit_admission_batch(AdmissionBatchWrite {
                        inputs,
                        decisions,
                        recovery_deadline: "9999-01-01T00:00:00Z".to_owned(),
                    })
                    .map_err(Failure::from)
            }
        })
        .await
        .expect("fresh snapshot admits after stale refusal");
        assert_eq!(calls.load(std::sync::atomic::Ordering::Relaxed), 2);
        assert_eq!(reservations.len(), 1);
    }

    fn candidate(id: &str, priority: i64, provider: &str) -> AdmissionCandidateV1 {
        AdmissionCandidateV1 {
            subject_kind: AdmissionSubjectKind::Run,
            subject_id: id.to_owned(),
            control_revision: 1,
            work_id: id.to_owned(),
            work_revision: Some("r".to_owned()),
            work_status: Some("open".to_owned()),
            priority: Some(priority),
            repository: format!("/{id}"),
            work_repository: Some(format!("/{id}")),
            input_error: None,
            desired_wake_at: Some("2030-01-01T00:00:00.000000000Z".to_owned()),
            provider: Some(provider.to_owned()),
            model: Some("m".to_owned()),
            resource_class: AdmissionResourceClass::RepositoryWrite,
            authorized_at: "2030-01-01T00:00:00.000000000Z".to_owned(),
        }
    }

    fn capacity_roster(sandbox: Sandbox, version: u32) -> ResolvedRosterV1 {
        ResolvedRosterV1 {
            schema: RESOLVED_ROSTER_SCHEMA_V1.to_owned(),
            roster_ref: RosterRef {
                name: "capacity".to_owned(),
                version,
            },
            roles: BTreeMap::from([(
                RoleId::new("implement").expect("role"),
                vec![ProviderCandidateV1 {
                    provider: "codex".to_owned(),
                    model: "gpt-test".to_owned(),
                    effort: None,
                    sandbox,
                    capabilities: BTreeSet::new(),
                }],
            )]),
        }
    }

    fn capacity_definition(sandbox: Sandbox) -> NewRunDefinition {
        let protocol_ref = ProtocolRef {
            name: "slice".to_owned(),
            version: 1,
        };
        let profile_ref = ProfileRef {
            name: "capacity".to_owned(),
            version: 1,
        };
        let roster = capacity_roster(sandbox, 1);
        let profile = ProfileDefinitionV1 {
            schema: PROFILE_SCHEMA_V1.to_owned(),
            name: "capacity".to_owned(),
            protocol: protocol_ref.clone(),
            seats: Vec::new(),
            risk_context: "test".to_owned(),
            fix_round_budget: 0,
            escalate_on: Vec::new(),
            escalate_to: None,
        };
        let package = ExecutionPackageV1 {
            schema: EXECUTION_PACKAGE_SCHEMA_V1.to_owned(),
            protocol_ref,
            profile_ref,
            roster_ref: roster.roster_ref.clone(),
            profile_sha256: digest(&profile).expect("profile digest"),
            roster_sha256: digest(&roster).expect("roster digest"),
            profile,
            profile_catalog: BTreeMap::new(),
            roster,
            policy: ExecutionPolicyV1 {
                gate_commands: Vec::new(),
                stage_budget_s: BTreeMap::new(),
                termination_grace_s: DEFAULT_TERMINATION_GRACE_S,
                transport_retry_budget: 1,
                seat_commands: Vec::new(),
                deadline_retry_budget: 1,
                seat_env: Default::default(),
                host_policy: HostPolicyV1::Off,
                herdr_socket: None,
            },
        };
        NewRunDefinition {
            package_sha256: digest(&package).expect("package digest"),
            package,
            compatibility_roster: HashMap::new(),
        }
    }

    fn capacity_after_roster_flip(
        suffix: &str,
        initial: Sandbox,
        revised: Sandbox,
    ) -> AdmissionLedgerSnapshot {
        let dir = tempfile::tempdir().expect("tempdir");
        let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
        let run_id = format!("run-capacity-{suffix}");
        ledger
            .create_run_with_definition(
                NewRun {
                    run_id: RunId::new(&run_id).expect("run id"),
                    work_id: format!("bead-capacity-{suffix}"),
                    repo: "example/repo".to_owned(),
                    base_ref: "main".to_owned(),
                    branch: format!("work/capacity-{suffix}"),
                },
                capacity_definition(initial),
            )
            .expect("run");
        let packet_id = ledger
            .open_packet(NewPacket {
                run_id: run_id.clone(),
                stage: Stage::Implement,
                seq: 1,
                spec_path: format!("specs/capacity-{suffix}.md"),
                spec_sha256: "feed".to_owned(),
                spec_revision: None,
                policy_revision: None,
                body_json: serde_json::json!({
                    "providerHints": {
                        "provider": "codex",
                        "model": "gpt-test",
                        "sandbox": initial,
                    },
                    "execution": {"roleId": "implement"},
                })
                .to_string(),
            })
            .expect("packet");
        ledger
            .authorize_desired_work(DesiredSubjectKind::Run, &run_id, 1)
            .expect("authorize");
        ledger
            .claim_packet(
                &packet_id,
                "codex:capacity:1",
                &SpecFence::Sha256("feed".to_owned()),
            )
            .expect("reservation-less claim");
        let before = ledger
            .admission_snapshot_releasing_unowned(
                Some((DesiredSubjectKind::Run, run_id.clone())),
                vec![(AdmissionSubjectKind::Packet, packet_id.clone())],
            )
            .expect("snapshot before revision");
        let roster = capacity_roster(revised, 2);
        ledger
            .append_roster_revision(
                &run_id,
                roster.clone(),
                digest(&roster).expect("revised roster digest"),
                "capacity class flip".to_owned(),
                format!("operation:capacity-{suffix}"),
            )
            .expect("roster revision");
        let after = ledger
            .admission_snapshot_releasing_unowned(
                Some((DesiredSubjectKind::Run, run_id)),
                vec![(AdmissionSubjectKind::Packet, packet_id)],
            )
            .expect("snapshot after revision");
        assert_ne!(
            before.packet_facts[0].resource_class, after.packet_facts[0].resource_class,
            "{suffix}"
        );
        after
    }

    #[test]
    fn reservationless_capacity_uses_effective_roster_class_in_both_directions() {
        for (suffix, initial, revised, class, charged, outcome, reason) in [
            (
                "write-read",
                Sandbox::WorkspaceWrite,
                Sandbox::ReadOnly,
                AdmissionResourceClass::Read,
                0,
                AdmissionOutcome::Admitted,
                AdmissionReason::CapacityAvailable,
            ),
            (
                "read-write",
                Sandbox::ReadOnly,
                Sandbox::WorkspaceWrite,
                AdmissionResourceClass::RepositoryWrite,
                1,
                AdmissionOutcome::Deferred,
                AdmissionReason::RepositoryWriteCapacity,
            ),
        ] {
            let snapshot = capacity_after_roster_flip(suffix, initial, revised);
            assert!(snapshot.reservations.is_empty(), "{suffix}");
            assert_eq!(snapshot.capacity.total_active, 1, "{suffix}");
            assert_eq!(snapshot.packet_facts.len(), 1, "{suffix}");
            assert_eq!(snapshot.packet_facts[0].resource_class, class, "{suffix}");
            assert_eq!(
                snapshot
                    .capacity
                    .repository_write_active
                    .get("example/repo")
                    .copied()
                    .unwrap_or_default(),
                charged,
                "{suffix}"
            );

            let mut writer = candidate("genuine-writer", 0, "claude");
            writer.repository = "example/repo".to_owned();
            writer.work_repository = Some("example/repo".to_owned());
            let inputs = AdmissionInputsV1 {
                schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
                as_of: snapshot.as_of,
                policy_revision: "policy".to_owned(),
                ledger_revision: snapshot.ledger_revision,
                candidates: vec![writer],
                capacity: snapshot.capacity,
                spend: snapshot.spend,
                latest_rate_limits: snapshot.latest_rate_limits,
            };
            let (_, decisions) =
                evaluate(inputs, &AdmissionPolicy::default(), &BTreeMap::new()).expect("evaluate");
            assert_eq!(decisions[0].outcome, outcome, "{suffix}");
            assert_eq!(decisions[0].reason, reason, "{suffix}");
        }
    }

    #[test]
    fn orphaned_repository_capacity_exemption_is_exactly_subject_scoped() {
        let orphan = candidate("orphan", 0, "codex");
        let mut neighbor = candidate("neighbor", 1, "codex");
        neighbor.repository = orphan.repository.clone();
        neighbor.work_repository = orphan.work_repository.clone();
        let repository = orphan.repository.clone();
        let inputs = AdmissionInputsV1 {
            schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
            as_of: "2030-01-01T00:00:00.000000000Z".to_owned(),
            policy_revision: "policy".to_owned(),
            ledger_revision: "ledger".to_owned(),
            candidates: vec![orphan, neighbor],
            capacity: AdmissionCapacityV1 {
                total_active: 1,
                provider_active: BTreeMap::from([("codex".to_owned(), 1)]),
                model_active: BTreeMap::from([("codex/m".to_owned(), 1)]),
                repository_write_active: BTreeMap::from([(repository, 1)]),
                gate_active: 0,
            },
            spend: Vec::new(),
            latest_rate_limits: Vec::new(),
        };
        let exemptions = BTreeSet::from([(AdmissionSubjectKind::Run, "orphan".to_owned())]);
        let (_, decisions) = evaluate_with_repository_exemptions(
            inputs,
            &AdmissionPolicy::default(),
            &BTreeMap::new(),
            &exemptions,
        )
        .expect("evaluate orphan exemption");
        assert_eq!(decisions[0].subject_id, "orphan");
        assert_eq!(decisions[0].outcome, AdmissionOutcome::Admitted);
        assert_eq!(decisions[0].reason, AdmissionReason::CapacityAvailable);
        assert_eq!(decisions[1].subject_id, "neighbor");
        assert_eq!(decisions[1].outcome, AdmissionOutcome::Deferred);
        assert_eq!(
            decisions[1].reason,
            AdmissionReason::RepositoryWriteCapacity
        );
    }

    #[test]
    fn identical_inputs_are_byte_identical_and_priority_order_wins() {
        let policy = AdmissionPolicy {
            total_active: 1,
            ..AdmissionPolicy::default()
        };
        let inputs = AdmissionInputsV1 {
            schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
            as_of: "2030-01-01T00:00:00.000000000Z".to_owned(),
            policy_revision: "p".to_owned(),
            ledger_revision: "l".to_owned(),
            candidates: vec![candidate("low", 2, "codex"), candidate("high", 0, "claude")],
            capacity: AdmissionCapacityV1::default(),
            spend: Vec::<AdmissionSpendV1>::new(),
            latest_rate_limits: Vec::<AdmissionRateLimitV1>::new(),
        };
        let mut sorted = inputs.clone();
        sorted
            .candidates
            .sort_by_key(|candidate| candidate.priority);
        let (_, first) = evaluate(sorted.clone(), &policy, &BTreeMap::new()).expect("evaluate");
        let (_, second) = evaluate(sorted, &policy, &BTreeMap::new()).expect("evaluate");
        assert_eq!(first, second);
        assert_eq!(first[0].subject_id, "high");
        assert_eq!(first[0].outcome, AdmissionOutcome::Admitted);
        assert_eq!(first[1].reason, AdmissionReason::TotalCapacity);
        assert_eq!(
            serde_json::to_vec(&first).unwrap(),
            serde_json::to_vec(&second).unwrap()
        );
    }

    #[test]
    fn decision_content_is_byte_identical_across_revision_token_formats() {
        let inputs = AdmissionInputsV1 {
            schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
            as_of: "2030-01-01T00:00:00.000000000Z".to_owned(),
            policy_revision: "policy".to_owned(),
            ledger_revision: "a".repeat(64),
            candidates: vec![candidate("fixed", 0, "codex")],
            capacity: AdmissionCapacityV1::default(),
            spend: Vec::new(),
            latest_rate_limits: Vec::new(),
        };
        let mut sequenced = inputs.clone();
        sequenced.ledger_revision = "42".to_owned();
        let (_, hashed_decisions) =
            evaluate(inputs, &AdmissionPolicy::default(), &BTreeMap::new()).expect("hashed");
        let (_, sequenced_decisions) =
            evaluate(sequenced, &AdmissionPolicy::default(), &BTreeMap::new()).expect("sequenced");
        let comparable_bytes = |decisions: Vec<AdmissionDecisionV1>| {
            let mut value = serde_json::to_value(decisions).expect("decision JSON");
            for decision in value.as_array_mut().expect("decision array") {
                decision["batchId"] = Value::String("revision-derived-batch".to_owned());
            }
            serde_json::to_vec(&value).expect("decision bytes")
        };
        assert_eq!(
            comparable_bytes(hashed_decisions),
            comparable_bytes(sequenced_decisions),
            "only the input-derived replay identity may reflect the revision token"
        );
    }

    #[test]
    fn unknown_cost_is_not_zero_under_a_cost_ceiling() {
        let policy = AdmissionPolicy {
            known_cost_ceiling_microusd: Some(1_000_000),
            ..AdmissionPolicy::default()
        };
        let mut inputs = AdmissionInputsV1 {
            schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
            as_of: "2030-01-01T00:00:00.000000000Z".to_owned(),
            policy_revision: "p".to_owned(),
            ledger_revision: "l".to_owned(),
            candidates: vec![candidate("one", 0, "codex")],
            capacity: AdmissionCapacityV1::default(),
            spend: vec![AdmissionSpendV1 {
                provider: "codex".to_owned(),
                model: "m".to_owned(),
                input_tokens: 1,
                output_tokens: 1,
                known_cost_microusd: 0,
                rows_missing_cost: 1,
            }],
            latest_rate_limits: vec![],
        };
        inputs
            .candidates
            .sort_by_key(|candidate| candidate.priority);
        let (_, decisions) = evaluate(inputs, &policy, &BTreeMap::new()).expect("evaluate");
        assert_eq!(decisions[0].reason, AdmissionReason::MissingCost);
    }

    #[test]
    fn unavailable_and_closed_work_defer_with_a_durable_wake() {
        let policy = AdmissionPolicy::default();
        for reason in [
            AdmissionReason::WorkUnavailable,
            AdmissionReason::WorkNotRunnable,
            AdmissionReason::RepositoryMismatch,
        ] {
            let inputs = AdmissionInputsV1 {
                schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
                as_of: "2030-01-01T00:00:00.000000000Z".to_owned(),
                policy_revision: "p".to_owned(),
                ledger_revision: "l".to_owned(),
                candidates: vec![candidate("one", 0, "codex")],
                capacity: AdmissionCapacityV1::default(),
                spend: vec![],
                latest_rate_limits: vec![],
            };
            let invalid = BTreeMap::from([((AdmissionSubjectKind::Run, "one".to_owned()), reason)]);
            let (_, decisions) = evaluate(inputs, &policy, &invalid).expect("evaluate");
            assert_eq!(decisions[0].outcome, AdmissionOutcome::Deferred);
            assert_eq!(decisions[0].reason, reason);
            assert!(decisions[0].next_eligible_wake_at.is_some());
        }
    }

    #[test]
    fn malformed_and_unrunnable_decisions_name_the_failing_fields() {
        let policy = AdmissionPolicy::default();
        let mut malformed = candidate("missing-priority", 0, "codex");
        malformed.priority = None;
        let inputs = AdmissionInputsV1 {
            schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
            as_of: "2030-01-01T00:00:00.000000000Z".to_owned(),
            policy_revision: "p".to_owned(),
            ledger_revision: "l".to_owned(),
            candidates: vec![malformed],
            capacity: AdmissionCapacityV1::default(),
            spend: vec![],
            latest_rate_limits: vec![],
        };
        let invalid = BTreeMap::from([(
            (AdmissionSubjectKind::Run, "missing-priority".to_owned()),
            AdmissionReason::WorkMalformed,
        )]);
        let (_, decisions) = evaluate(inputs, &policy, &invalid).expect("evaluate malformed");
        assert_eq!(decisions[0].outcome, AdmissionOutcome::Deferred);
        assert_eq!(decisions[0].reason, AdmissionReason::WorkMalformed);
        assert_eq!(
            decisions[0].reason_detail.as_deref(),
            Some("missing required field(s): priority")
        );
        assert_eq!(
            decision_reason(&decisions[0]),
            "bead-malformed: missing required field(s): priority"
        );

        let mut unrunnable = candidate("blocked-work", 0, "codex");
        unrunnable.work_status = Some("blocked".to_owned());
        let inputs = AdmissionInputsV1 {
            schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
            as_of: "2030-01-01T00:00:00.000000000Z".to_owned(),
            policy_revision: "p".to_owned(),
            ledger_revision: "l".to_owned(),
            candidates: vec![unrunnable],
            capacity: AdmissionCapacityV1::default(),
            spend: vec![],
            latest_rate_limits: vec![],
        };
        let invalid = BTreeMap::from([(
            (AdmissionSubjectKind::Run, "blocked-work".to_owned()),
            AdmissionReason::WorkNotRunnable,
        )]);
        let (_, decisions) = evaluate(inputs, &policy, &invalid).expect("evaluate unrunnable");
        assert_eq!(
            decisions[0].reason_detail.as_deref(),
            Some("status is not runnable: blocked")
        );
    }

    #[test]
    fn bounded_work_error_is_sanitized_for_persisted_evidence() {
        let error = format!("{}\nsecret\tline", "x".repeat(600));
        let bounded = bounded_input_error(error);
        assert_eq!(bounded.len(), 512);
        assert!(!bounded.contains(['\n', '\r', '\t']));
    }
}
