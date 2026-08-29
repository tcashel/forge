//! Pure admission projection/evaluation over one ledger snapshot and one
//! exact-ID Beads batch. No portfolio, controller files, process table, Herdr,
//! or filesystem state participates in scheduling.

use std::collections::{BTreeMap, BTreeSet};
use std::fmt::Write as _;

use forged_ledger::{
    AdmissionBatchWrite, AdmissionDurableCandidate, AdmissionLedgerSnapshot,
    AdmissionReservationRow, DesiredState, DesiredSubjectKind,
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

#[derive(Debug, Clone)]
pub(crate) struct AdmissionResult {
    pub(crate) decision: AdmissionDecisionV1,
    pub(crate) reservation: Option<AdmissionReservationRow>,
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
    pub(crate) bead_id: String,
}

impl From<&forged_types::WorkPacket> for PacketAdmission {
    fn from(packet: &forged_types::WorkPacket) -> Self {
        Self {
            packet_id: packet.packet_id.clone(),
            run_id: packet.run_id.clone(),
            bead_id: packet.bead_id.clone(),
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
        // The epic controller reconciles durable child state and serializes
        // integration; it never runs a provider in the repository. Charging
        // it as the package's first workspace-write seat makes the default
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
            .bead_id
            .as_deref()
            .and_then(|bead_id| issues.get(bead_id).copied());
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
        let bead_repository = issue.and_then(|issue| issue.metadata.get("repository").cloned());
        let candidate = AdmissionCandidateV1 {
            subject_kind: subject_kind(durable.subject_kind),
            subject_id: durable.subject_id.clone(),
            control_revision: durable.control_revision,
            bead_id: durable
                .bead_id
                .clone()
                .unwrap_or_else(|| durable.subject_id.clone()),
            bead_revision: issue.and_then(|issue| issue.revision.clone()),
            bead_status: issue.map(|issue| issue.status.clone()),
            priority: issue.and_then(|issue| issue.priority),
            repository: repository.clone(),
            bead_repository: bead_repository.clone(),
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
        let invalid = if !is_explicit
            && durable.control_revision > 0
            && durable.desired_state != DesiredState::Running
        {
            Some(AdmissionReason::DesiredNotRunning)
        } else if durable.exhausted && !is_explicit {
            Some(AdmissionReason::Exhausted)
        } else if input_error.is_some() || issue.is_none() {
            Some(AdmissionReason::BeadUnavailable)
        } else if issue.is_some_and(|issue| {
            issue.priority.is_none() || issue.revision.is_none() || bead_repository.is_none()
        }) {
            Some(AdmissionReason::BeadMalformed)
        } else if issue.is_some_and(|issue| !runnable(&issue.status)) {
            Some(AdmissionReason::BeadNotRunnable)
        } else if facts.is_none() || candidate.provider.is_none() || candidate.model.is_none() {
            Some(AdmissionReason::BeadMalformed)
        } else if bead_repository.as_deref() != Some(repository.as_str()) {
            Some(AdmissionReason::RepositoryMismatch)
        } else {
            None
        };
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

pub(crate) fn evaluate(
    mut inputs: AdmissionInputsV1,
    policy: &AdmissionPolicy,
    invalid: &BTreeMap<(AdmissionSubjectKind, String), AdmissionReason>,
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
            .unwrap_or(0);
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
            policy_revision: inputs.policy_revision.clone(),
            evidence,
            next_eligible_wake_at: wake,
        });
    }
    // Preserve the sorted candidate bytes used to derive the decision order.
    inputs.candidates.shrink_to_fit();
    Ok((inputs, decisions))
}

fn snapshot_changed(failure: &Failure) -> bool {
    failure.code == forged_types::ErrorCode::OperationInProgress
        && failure.message.ends_with(SNAPSHOT_CHANGED_MESSAGE)
}

pub(crate) async fn admit(
    ctx: &Ctx,
    targets: Vec<(DesiredSubjectKind, String)>,
    explicit_submit: Option<(DesiredSubjectKind, String)>,
) -> Result<Vec<AdmissionResult>, Failure> {
    for attempt in 0..SNAPSHOT_RETRY_LIMIT {
        match admit_once(ctx, targets.clone(), explicit_submit.clone()).await {
            Err(failure) if snapshot_changed(&failure) && attempt + 1 < SNAPSHOT_RETRY_LIMIT => {
                tokio::task::yield_now().await;
            }
            result => return result,
        }
    }
    unreachable!("bounded admission retry loop always returns")
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
    // Only an owned effect identity can enter recovery without a new Beads
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
                packet_provider_hints: None,
            });
        }
    }
    if fresh_targets.is_empty() {
        return Ok(recovered);
    }
    let bead_ids = snapshot
        .candidates
        .iter()
        .filter(|candidate| {
            fresh_targets.contains(&(candidate.subject_kind, candidate.subject_id.clone()))
        })
        .filter_map(|candidate| candidate.bead_id.clone())
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect::<Vec<_>>();
    // Exactly one bounded read, regardless of candidate count.
    let (issues, input_error) =
        match crate::core::workstore::list_issues(&ctx.ledger, &bead_ids).await {
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
    let (inputs, decisions) = evaluate(inputs, &ctx.config.admission, &invalid)?;
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
    for attempt in 0..SNAPSHOT_RETRY_LIMIT {
        match admit_packet_facts_once(ctx, packet).await {
            Err(failure) if snapshot_changed(&failure) && attempt + 1 < SNAPSHOT_RETRY_LIMIT => {
                tokio::task::yield_now().await;
            }
            result => return result,
        }
    }
    unreachable!("bounded packet admission retry loop always returns")
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
    if packet_facts.run_id != packet.run_id || packet_facts.bead_id != packet.bead_id {
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
            packet_provider_hints: Some(ProviderHints {
                provider: packet_facts.provider.clone(),
                model: packet_facts.model.clone(),
                effort: packet_facts.effort.clone(),
                sandbox: match packet_facts.resource_class {
                    AdmissionResourceClass::Read => Sandbox::ReadOnly,
                    AdmissionResourceClass::RepositoryWrite => Sandbox::WorkspaceWrite,
                },
            }),
        });
    }
    let (issues, input_error) = match crate::core::workstore::list_issues(
        &ctx.ledger,
        std::slice::from_ref(&packet.bead_id),
    )
    .await
    {
        Ok(issues) => (issues, None),
        Err(error) => (Vec::new(), Some(bounded_input_error(error))),
    };
    let issue = issues.iter().find(|issue| issue.id == packet.bead_id);
    let repository = packet_facts.repository.clone();
    let bead_repository = issue.and_then(|issue| issue.metadata.get("repository").cloned());
    let candidate = AdmissionCandidateV1 {
        subject_kind: AdmissionSubjectKind::Packet,
        subject_id: packet.packet_id.clone(),
        control_revision: durable.control_revision,
        bead_id: packet.bead_id.clone(),
        bead_revision: issue.and_then(|issue| issue.revision.clone()),
        bead_status: issue.map(|issue| issue.status.clone()),
        priority: issue.and_then(|issue| issue.priority),
        repository: repository.clone(),
        bead_repository: bead_repository.clone(),
        input_error: input_error.clone(),
        desired_wake_at: durable.next_wake_at.clone(),
        provider: (!packet_facts.provider.is_empty()).then(|| packet_facts.provider.clone()),
        model: (!packet_facts.model.is_empty()).then(|| packet_facts.model.clone()),
        resource_class: packet_facts.resource_class,
        authorized_at: durable.authorized_at.clone(),
    };
    let invalid = if durable.control_revision == 0 {
        Some(AdmissionReason::Unauthorized)
    } else if durable.desired_state != DesiredState::Running {
        Some(AdmissionReason::DesiredNotRunning)
    } else if durable.exhausted {
        Some(AdmissionReason::Exhausted)
    } else if input_error.is_some() || issue.is_none() {
        Some(AdmissionReason::BeadUnavailable)
    } else if issue.is_some_and(|issue| {
        issue.priority.is_none() || issue.revision.is_none() || bead_repository.is_none()
    }) {
        Some(AdmissionReason::BeadMalformed)
    } else if issue.is_some_and(|issue| !runnable(&issue.status)) {
        Some(AdmissionReason::BeadNotRunnable)
    } else if candidate.provider.is_none() || candidate.model.is_none() {
        Some(AdmissionReason::BeadMalformed)
    } else if bead_repository.as_deref() != Some(repository.as_str()) {
        Some(AdmissionReason::RepositoryMismatch)
    } else {
        None
    };
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
        decision,
        packet_provider_hints: Some(ProviderHints {
            provider: packet_facts.provider.clone(),
            model: packet_facts.model.clone(),
            effort: packet_facts.effort.clone(),
            sandbox: match packet_facts.resource_class {
                AdmissionResourceClass::Read => Sandbox::ReadOnly,
                AdmissionResourceClass::RepositoryWrite => Sandbox::WorkspaceWrite,
            },
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use forged_types::{AdmissionCapacityV1, AdmissionRateLimitV1, AdmissionSpendV1};

    #[test]
    fn protocol_names_never_make_a_blocked_bead_runnable() {
        assert!(!runnable("blocked"));
    }

    fn candidate(id: &str, priority: i64, provider: &str) -> AdmissionCandidateV1 {
        AdmissionCandidateV1 {
            subject_kind: AdmissionSubjectKind::Run,
            subject_id: id.to_owned(),
            control_revision: 1,
            bead_id: id.to_owned(),
            bead_revision: Some("r".to_owned()),
            bead_status: Some("open".to_owned()),
            priority: Some(priority),
            repository: format!("/{id}"),
            bead_repository: Some(format!("/{id}")),
            input_error: None,
            desired_wake_at: Some("2030-01-01T00:00:00.000000000Z".to_owned()),
            provider: Some(provider.to_owned()),
            model: Some("m".to_owned()),
            resource_class: AdmissionResourceClass::RepositoryWrite,
            authorized_at: "2030-01-01T00:00:00.000000000Z".to_owned(),
        }
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
    fn unavailable_and_closed_beads_defer_with_a_durable_wake() {
        let policy = AdmissionPolicy::default();
        for reason in [
            AdmissionReason::BeadUnavailable,
            AdmissionReason::BeadNotRunnable,
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
    fn bounded_beads_error_is_sanitized_for_persisted_evidence() {
        let error = format!("{}\nsecret\tline", "x".repeat(600));
        let bounded = bounded_input_error(error);
        assert_eq!(bounded.len(), 512);
        assert!(!bounded.contains(['\n', '\r', '\t']));
    }
}
