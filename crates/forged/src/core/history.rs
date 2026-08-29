//! Pure projection policy for `forged.work-history/1`.
//!
//! The only read crosses [`forged_ledger::Ledger::history_snapshot`]. All
//! filtering, bucketing, rates, pagination, and high-cardinality folding are
//! computed from that immutable value: no current work, filesystem, process,
//! provider, service, or GitHub fallback exists in this module.

use std::cmp::Ordering;
use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{AttemptState, HistorySnapshot, RunOutcome, RunState};
use forged_types::{
    canonical_json_bytes, normalize_repository_path, OperationRequest, WorkHistoryBucket,
    WorkHistoryBucketV1, WorkHistoryCoverageV1, WorkHistoryFiltersV1, WorkHistoryGroupBy,
    WorkHistoryMetricsV1, WorkHistoryPricingV1, WorkHistorySeriesV1, WorkHistorySettlementCountsV1,
    WorkHistorySubjectV1, WorkHistoryV1, WorkHistoryWindowV1, WorkIdentitySubjectKind,
    WorkIdentityV1, WORK_HISTORY_SCHEMA_V1,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use super::{on_ledger, read_only, Ctx, Failure};

const NANOS_PER_HOUR: i128 = 3_600_000_000_000;
const NANOS_PER_DAY: i128 = 24 * NANOS_PER_HOUR;
const MAX_WINDOW_NANOS: i128 = 366 * NANOS_PER_DAY;
const DEFAULT_WINDOW_NANOS: i128 = 30 * NANOS_PER_DAY;
const MAX_BUCKETS: usize = 400;
const DEFAULT_SUBJECT_LIMIT: usize = 50;
const MAX_SUBJECT_LIMIT: usize = 200;
const MAX_GROUPS: usize = 50;
const CURSOR_SCHEMA: &str = "forged.work-history-cursor/1";

#[derive(Debug)]
struct HistoryRequest {
    as_of: String,
    from: String,
    to: String,
    from_ns: i128,
    to_ns: i128,
    bucket: WorkHistoryBucket,
    bucket_ns: i128,
    bucket_count: usize,
    group_by: WorkHistoryGroupBy,
    filters: WorkHistoryFiltersV1,
    limit: usize,
    cursor: Option<CursorV1>,
    fingerprint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CursorV1 {
    schema: String,
    fingerprint: String,
    as_of: String,
    from: String,
    to: String,
    bucket: WorkHistoryBucket,
    group_by: WorkHistoryGroupBy,
    filters: WorkHistoryFiltersV1,
    last_activity_at: String,
    subject_kind: WorkIdentitySubjectKind,
    subject_id: String,
}

#[derive(Debug, Clone, Default)]
struct PricingAcc {
    rows: u64,
    cost_usd_known: f64,
    rows_missing_cost: u64,
}

#[derive(Debug, Clone, Default)]
struct MetricsAcc {
    runs_started: u64,
    runs_settled: u64,
    settlements: WorkHistorySettlementCountsV1,
    epics_started: u64,
    epics_paused: u64,
    epics_resumed: u64,
    epic_final_prs: u64,
    attempts_started: u64,
    repeat_attempts: u64,
    attempt_state_transitions: u64,
    transitions_running: u64,
    transitions_completed: u64,
    transitions_failed: u64,
    transitions_revoking: u64,
    transitions_reclaimed: u64,
    transitions_stopped: u64,
    terminal_attempts: u64,
    attempts_completed: u64,
    attempts_failed: u64,
    attempts_reclaimed: u64,
    attempts_stopped: u64,
    escalated_runs: BTreeSet<String>,
    attempt_activity_runs: BTreeSet<String>,
    usage_rows: u64,
    input_tokens: u64,
    output_tokens: u64,
    cache_read_tokens: u64,
    cache_write_tokens: u64,
    web_search_requests: u64,
    cost_usd_known: f64,
    rows_missing_cost: u64,
    pricing: BTreeMap<String, PricingAcc>,
}

impl MetricsAcc {
    fn settlement(&mut self, outcome: RunOutcome) {
        self.runs_settled += 1;
        match outcome {
            RunOutcome::Clean => self.settlements.clean += 1,
            RunOutcome::Blocked => self.settlements.blocked += 1,
            RunOutcome::InputRequired => self.settlements.input_required += 1,
            RunOutcome::Cancelled => self.settlements.cancelled += 1,
            RunOutcome::AcceptedRisk => self.settlements.accepted_risk += 1,
            RunOutcome::Superseded => self.settlements.superseded += 1,
            RunOutcome::Landed => self.settlements.landed += 1,
        }
    }

    fn attempt_transition(&mut self, state: AttemptState) {
        self.attempt_state_transitions += 1;
        match state {
            AttemptState::Running => self.transitions_running += 1,
            AttemptState::Completed => self.transitions_completed += 1,
            AttemptState::Failed => self.transitions_failed += 1,
            AttemptState::Revoking => self.transitions_revoking += 1,
            AttemptState::Reclaimed => self.transitions_reclaimed += 1,
            AttemptState::Stopped => self.transitions_stopped += 1,
        }
    }

    fn terminal_attempt(&mut self, state: AttemptState) {
        self.terminal_attempts += 1;
        match state {
            AttemptState::Completed => self.attempts_completed += 1,
            AttemptState::Failed => self.attempts_failed += 1,
            AttemptState::Reclaimed => self.attempts_reclaimed += 1,
            AttemptState::Stopped => self.attempts_stopped += 1,
            AttemptState::Running | AttemptState::Revoking => {}
        }
    }

    fn usage(&mut self, row: &forged_ledger::UsageRecord) {
        self.usage_rows += 1;
        self.input_tokens = self.input_tokens.saturating_add(row.input_tokens);
        self.output_tokens = self.output_tokens.saturating_add(row.output_tokens);
        self.cache_read_tokens = self
            .cache_read_tokens
            .saturating_add(row.cache_read_tokens.unwrap_or(0));
        self.cache_write_tokens = self
            .cache_write_tokens
            .saturating_add(row.cache_write_tokens.unwrap_or(0));
        self.web_search_requests = self
            .web_search_requests
            .saturating_add(row.web_search_requests.unwrap_or(0));
        let basis = row
            .pricing_basis
            .as_deref()
            .filter(|value| !value.trim().is_empty())
            .unwrap_or("unknown")
            .to_owned();
        let pricing = self.pricing.entry(basis).or_default();
        pricing.rows += 1;
        if let Some(cost) = row.cost_usd {
            self.cost_usd_known += cost;
            pricing.cost_usd_known += cost;
        } else {
            self.rows_missing_cost += 1;
            pricing.rows_missing_cost += 1;
        }
    }

    fn merge(&mut self, other: &Self) {
        self.runs_started += other.runs_started;
        self.runs_settled += other.runs_settled;
        self.settlements.clean += other.settlements.clean;
        self.settlements.blocked += other.settlements.blocked;
        self.settlements.input_required += other.settlements.input_required;
        self.settlements.cancelled += other.settlements.cancelled;
        self.settlements.accepted_risk += other.settlements.accepted_risk;
        self.settlements.superseded += other.settlements.superseded;
        self.settlements.landed += other.settlements.landed;
        self.epics_started += other.epics_started;
        self.epics_paused += other.epics_paused;
        self.epics_resumed += other.epics_resumed;
        self.epic_final_prs += other.epic_final_prs;
        self.attempts_started += other.attempts_started;
        self.repeat_attempts += other.repeat_attempts;
        self.attempt_state_transitions += other.attempt_state_transitions;
        self.transitions_running += other.transitions_running;
        self.transitions_completed += other.transitions_completed;
        self.transitions_failed += other.transitions_failed;
        self.transitions_revoking += other.transitions_revoking;
        self.transitions_reclaimed += other.transitions_reclaimed;
        self.transitions_stopped += other.transitions_stopped;
        self.terminal_attempts += other.terminal_attempts;
        self.attempts_completed += other.attempts_completed;
        self.attempts_failed += other.attempts_failed;
        self.attempts_reclaimed += other.attempts_reclaimed;
        self.attempts_stopped += other.attempts_stopped;
        self.escalated_runs
            .extend(other.escalated_runs.iter().cloned());
        self.attempt_activity_runs
            .extend(other.attempt_activity_runs.iter().cloned());
        self.usage_rows += other.usage_rows;
        self.input_tokens = self.input_tokens.saturating_add(other.input_tokens);
        self.output_tokens = self.output_tokens.saturating_add(other.output_tokens);
        self.cache_read_tokens = self
            .cache_read_tokens
            .saturating_add(other.cache_read_tokens);
        self.cache_write_tokens = self
            .cache_write_tokens
            .saturating_add(other.cache_write_tokens);
        self.web_search_requests = self
            .web_search_requests
            .saturating_add(other.web_search_requests);
        self.cost_usd_known += other.cost_usd_known;
        self.rows_missing_cost += other.rows_missing_cost;
        for (basis, source) in &other.pricing {
            let target = self.pricing.entry(basis.clone()).or_default();
            target.rows += source.rows;
            target.cost_usd_known += source.cost_usd_known;
            target.rows_missing_cost += source.rows_missing_cost;
        }
    }

    fn activity(&self) -> u64 {
        self.runs_started
            + self.runs_settled
            + self.epics_started
            + self.epics_paused
            + self.epics_resumed
            + self.epic_final_prs
            + self.attempts_started
            + self.terminal_attempts
            + self.attempt_state_transitions
            + self.usage_rows
            + u64::try_from(self.escalated_runs.len()).unwrap_or(u64::MAX)
    }

    fn project(&self) -> WorkHistoryMetricsV1 {
        let ratio = |numerator: u64, denominator: u64| {
            (denominator != 0).then(|| numerator as f64 / denominator as f64)
        };
        WorkHistoryMetricsV1 {
            runs_started: self.runs_started,
            runs_settled: self.runs_settled,
            settlements: self.settlements.clone(),
            epics_started: self.epics_started,
            epics_paused: self.epics_paused,
            epics_resumed: self.epics_resumed,
            epic_final_prs: self.epic_final_prs,
            attempts_started: self.attempts_started,
            repeat_attempts: self.repeat_attempts,
            attempt_state_transitions: self.attempt_state_transitions,
            transitions_running: self.transitions_running,
            transitions_completed: self.transitions_completed,
            transitions_failed: self.transitions_failed,
            transitions_revoking: self.transitions_revoking,
            transitions_reclaimed: self.transitions_reclaimed,
            transitions_stopped: self.transitions_stopped,
            terminal_attempts: self.terminal_attempts,
            attempts_completed: self.attempts_completed,
            attempts_failed: self.attempts_failed,
            attempts_reclaimed: self.attempts_reclaimed,
            attempts_stopped: self.attempts_stopped,
            rework_rate: ratio(self.repeat_attempts, self.attempts_started),
            failure_rate: ratio(
                self.attempts_failed + self.attempts_reclaimed + self.attempts_stopped,
                self.terminal_attempts,
            ),
            escalated_runs: u64::try_from(self.escalated_runs.len()).unwrap_or(u64::MAX),
            runs_with_attempt_activity: u64::try_from(self.attempt_activity_runs.len())
                .unwrap_or(u64::MAX),
            escalation_rate: ratio(
                u64::try_from(self.escalated_runs.len()).unwrap_or(u64::MAX),
                u64::try_from(self.attempt_activity_runs.len()).unwrap_or(u64::MAX),
            ),
            usage_rows: self.usage_rows,
            input_tokens: self.input_tokens,
            output_tokens: self.output_tokens,
            cache_read_tokens: self.cache_read_tokens,
            cache_write_tokens: self.cache_write_tokens,
            web_search_requests: self.web_search_requests,
            cost_usd_known: self.cost_usd_known,
            rows_missing_cost: self.rows_missing_cost,
            pricing: self
                .pricing
                .iter()
                .map(|(basis, value)| WorkHistoryPricingV1 {
                    basis: basis.clone(),
                    rows: value.rows,
                    cost_usd_known: value.cost_usd_known,
                    rows_missing_cost: value.rows_missing_cost,
                })
                .collect(),
        }
    }
}

#[derive(Debug, Clone)]
struct GroupAcc {
    key: String,
    label: String,
    epic_identity: Option<WorkIdentityV1>,
    metrics: MetricsAcc,
    buckets: Vec<MetricsAcc>,
}

impl GroupAcc {
    fn new(
        key: String,
        label: String,
        epic_identity: Option<WorkIdentityV1>,
        bucket_count: usize,
    ) -> Self {
        Self {
            key,
            label,
            epic_identity,
            metrics: MetricsAcc::default(),
            buckets: vec![MetricsAcc::default(); bucket_count],
        }
    }

    fn merge(&mut self, other: &Self) {
        self.metrics.merge(&other.metrics);
        for (target, source) in self.buckets.iter_mut().zip(&other.buckets) {
            target.merge(source);
        }
    }
}

#[derive(Debug, Clone)]
struct SubjectAcc {
    identity: WorkIdentityV1,
    first_ns: i128,
    last_ns: i128,
    metrics: MetricsAcc,
}

#[derive(Debug, Clone)]
struct PacketDimension {
    run_id: String,
    stage: Option<String>,
    provider: Option<String>,
}

struct Builder<'a> {
    request: &'a HistoryRequest,
    identities: &'a BTreeMap<(WorkIdentitySubjectKind, String), WorkIdentityV1>,
    aggregate: MetricsAcc,
    groups: BTreeMap<String, GroupAcc>,
    subjects: BTreeMap<(WorkIdentitySubjectKind, String), SubjectAcc>,
}

impl<'a> Builder<'a> {
    fn identity(
        &self,
        kind: WorkIdentitySubjectKind,
        id: &str,
    ) -> Result<&WorkIdentityV1, Failure> {
        self.identities.get(&(kind, id.to_owned())).ok_or_else(|| {
            Failure::internal(format!(
                "historical {kind:?} {id:?} has no durable identity"
            ))
        })
    }

    fn matches(&self, identity: &WorkIdentityV1) -> bool {
        if self
            .request
            .filters
            .subject_id
            .as_deref()
            .is_some_and(|id| id != identity.subject.id)
        {
            return false;
        }
        if self
            .request
            .filters
            .repository
            .as_deref()
            .is_some_and(|repo| {
                identity
                    .repository
                    .as_ref()
                    .map(|value| value.path.as_str())
                    != Some(repo)
            })
        {
            return false;
        }
        if let Some(epic) = self.request.filters.epic_id.as_deref() {
            let own_epic = identity.subject.kind == WorkIdentitySubjectKind::Epic
                && identity.subject.id == epic;
            let child_epic = identity.epic.as_ref().map(|value| value.id.as_str()) == Some(epic);
            if !own_epic && !child_epic {
                return false;
            }
        }
        true
    }

    fn group(
        &self,
        identity: &WorkIdentityV1,
        stage: Option<&str>,
        provider: Option<&str>,
    ) -> Result<(String, String, Option<WorkIdentityV1>), Failure> {
        let unknown = || ("unknown".to_owned(), "Unknown".to_owned(), None);
        Ok(match self.request.group_by {
            WorkHistoryGroupBy::None => ("all".to_owned(), "All work".to_owned(), None),
            WorkHistoryGroupBy::Repository => {
                identity.repository.as_ref().map_or_else(unknown, |repo| {
                    (
                        format!("repository:{}", repo.path),
                        repo.label.clone(),
                        None,
                    )
                })
            }
            WorkHistoryGroupBy::Epic => {
                let epic_id = if identity.subject.kind == WorkIdentitySubjectKind::Epic {
                    Some(identity.subject.id.as_str())
                } else {
                    identity.epic.as_ref().map(|epic| epic.id.as_str())
                };
                let Some(epic_id) = epic_id else {
                    return Ok(unknown());
                };
                let epic_identity = self
                    .identity(WorkIdentitySubjectKind::Epic, epic_id)?
                    .clone();
                (
                    format!("epic:{epic_id}"),
                    epic_identity.display_title.clone(),
                    Some(epic_identity),
                )
            }
            WorkHistoryGroupBy::Stage => stage
                .filter(|value| !value.trim().is_empty())
                .map_or_else(unknown, |stage| {
                    (format!("stage:{stage}"), stage.to_owned(), None)
                }),
            WorkHistoryGroupBy::Provider => provider
                .filter(|value| !value.trim().is_empty())
                .map_or_else(unknown, |provider| {
                    (format!("provider:{provider}"), provider.to_owned(), None)
                }),
        })
    }

    fn record<F>(
        &mut self,
        kind: WorkIdentitySubjectKind,
        id: &str,
        ts_ns: i128,
        stage: Option<&str>,
        provider: Option<&str>,
        update: F,
    ) -> Result<(), Failure>
    where
        F: Fn(&mut MetricsAcc),
    {
        let identity = self.identity(kind, id)?.clone();
        if !self.matches(&identity) {
            return Ok(());
        }
        let offset = ts_ns - self.request.from_ns;
        if offset < 0 || ts_ns >= self.request.to_ns {
            return Ok(());
        }
        let bucket = usize::try_from(offset / self.request.bucket_ns)
            .map_err(|_| Failure::internal("history bucket index overflow"))?;
        if bucket >= self.request.bucket_count {
            return Err(Failure::internal(
                "history fact escaped its normalized buckets",
            ));
        }
        let (group_key, label, epic_identity) = self.group(&identity, stage, provider)?;

        update(&mut self.aggregate);
        let group = self.groups.entry(group_key.clone()).or_insert_with(|| {
            GroupAcc::new(group_key, label, epic_identity, self.request.bucket_count)
        });
        update(&mut group.metrics);
        update(&mut group.buckets[bucket]);

        let subject = self
            .subjects
            .entry((kind, id.to_owned()))
            .or_insert_with(|| SubjectAcc {
                identity,
                first_ns: ts_ns,
                last_ns: ts_ns,
                metrics: MetricsAcc::default(),
            });
        subject.first_ns = subject.first_ns.min(ts_ns);
        subject.last_ns = subject.last_ns.max(ts_ns);
        update(&mut subject.metrics);
        Ok(())
    }

    /// Retain a legacy stopped row that has durable in-window activity but no
    /// settlement event. This deliberately creates no aggregate/group metric:
    /// `runs.updated_at` proves the row was active, not what transition occurred.
    fn retain_legacy_subject(
        &mut self,
        kind: WorkIdentitySubjectKind,
        id: &str,
        ts_ns: i128,
    ) -> Result<(), Failure> {
        let key = (kind, id.to_owned());
        if self.subjects.contains_key(&key) || !in_window(self.request, ts_ns) {
            return Ok(());
        }
        let identity = self.identity(kind, id)?.clone();
        if !self.matches(&identity) {
            return Ok(());
        }
        self.subjects.insert(
            key,
            SubjectAcc {
                identity,
                first_ns: ts_ns,
                last_ns: ts_ns,
                metrics: MetricsAcc::default(),
            },
        );
        Ok(())
    }
}

fn utc_timestamp(value: &str, field: &str) -> Result<(String, i128), Failure> {
    let value = value.trim();
    let utc_suffix = value.ends_with('Z')
        || value.ends_with('z')
        || value.ends_with("+00:00")
        || value.ends_with("-00:00");
    if !utc_suffix {
        return Err(Failure::invalid(format!(
            "work history {field} must be an RFC3339 UTC timestamp"
        )));
    }
    let timestamp: jiff::Timestamp = value.parse().map_err(|error| {
        Failure::invalid(format!(
            "work history {field} is not an RFC3339 timestamp: {error}"
        ))
    })?;
    Ok((
        forged_proto::widen_rfc3339(&timestamp.to_string()),
        timestamp.as_nanosecond(),
    ))
}

fn stored_timestamp(value: &str, field: &str) -> Result<i128, Failure> {
    let (_, nanos) = utc_timestamp(value, field)
        .map_err(|error| Failure::internal(format!("malformed stored timestamp: {error}")))?;
    Ok(nanos)
}

fn timestamp_text(nanos: i128) -> Result<String, Failure> {
    let timestamp = jiff::Timestamp::from_nanosecond(nanos)
        .map_err(|error| Failure::internal(format!("history timestamp out of range: {error}")))?;
    Ok(forged_proto::widen_rfc3339(&timestamp.to_string()))
}

fn param_string(
    params: &serde_json::Map<String, Value>,
    name: &str,
) -> Result<Option<String>, Failure> {
    match params.get(name) {
        None => Ok(None),
        Some(Value::String(value)) if !value.trim().is_empty() => Ok(Some(value.trim().to_owned())),
        Some(_) => Err(Failure::invalid(format!(
            "work history {name} must be a non-empty string"
        ))),
    }
}

fn decode_hex(value: &str) -> Result<Vec<u8>, Failure> {
    if value.is_empty() || value.len() > 8_192 || !value.len().is_multiple_of(2) {
        return Err(Failure::invalid("work history cursor is malformed"));
    }
    value
        .as_bytes()
        .chunks_exact(2)
        .map(|pair| {
            let text = std::str::from_utf8(pair)
                .map_err(|_| Failure::invalid("work history cursor is malformed"))?;
            u8::from_str_radix(text, 16)
                .map_err(|_| Failure::invalid("work history cursor is malformed"))
        })
        .collect()
}

fn encode_cursor(cursor: &CursorV1) -> Result<String, Failure> {
    let bytes = serde_json::to_vec(cursor)
        .map_err(|error| Failure::internal(format!("serialize history cursor: {error}")))?;
    Ok(bytes.iter().map(|byte| format!("{byte:02x}")).collect())
}

fn decode_cursor(value: &str) -> Result<CursorV1, Failure> {
    let bytes = decode_hex(value)?;
    let cursor: CursorV1 = serde_json::from_slice(&bytes)
        .map_err(|_| Failure::invalid("work history cursor is malformed"))?;
    if cursor.schema != CURSOR_SCHEMA
        || cursor.subject_id.trim().is_empty()
        || cursor.as_of.trim().is_empty()
        || cursor.from.trim().is_empty()
        || cursor.to.trim().is_empty()
        || cursor
            .filters
            .repository
            .as_deref()
            .is_some_and(|value| value.trim().is_empty())
        || cursor
            .filters
            .epic_id
            .as_deref()
            .is_some_and(|value| value.trim().is_empty())
        || cursor
            .filters
            .subject_id
            .as_deref()
            .is_some_and(|value| value.trim().is_empty())
    {
        return Err(Failure::invalid("work history cursor is malformed"));
    }
    Ok(cursor)
}

fn fingerprint(
    from: &str,
    to: &str,
    bucket: WorkHistoryBucket,
    group_by: WorkHistoryGroupBy,
    filters: &WorkHistoryFiltersV1,
) -> Result<String, Failure> {
    let value = json!({
        "schema": WORK_HISTORY_SCHEMA_V1,
        "from": from,
        "to": to,
        "bucket": bucket,
        "groupBy": group_by,
        "filters": filters,
    });
    let bytes = canonical_json_bytes(&value)
        .map_err(|error| Failure::internal(format!("canonical history request: {error}")))?;
    Ok(Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect())
}

fn normalize_request(req: &OperationRequest) -> Result<HistoryRequest, Failure> {
    const ALLOWED: [&str; 9] = [
        "from", "to", "bucket", "groupBy", "repo", "epic", "subject", "limit", "cursor",
    ];
    if let Some(unknown) = req
        .params
        .keys()
        .find(|key| !ALLOWED.contains(&key.as_str()))
    {
        return Err(Failure::invalid(format!(
            "unknown work history parameter {unknown:?}"
        )));
    }

    let cursor = param_string(&req.params, "cursor")?
        .map(|value| decode_cursor(&value))
        .transpose()?;
    let sampled_as_of = crate::config::now_iso();
    let as_of_raw = cursor
        .as_ref()
        .map_or_else(|| sampled_as_of.as_str(), |cursor| cursor.as_of.as_str());
    let (as_of, _) = utc_timestamp(as_of_raw, "asOf")?;
    let to_raw = param_string(&req.params, "to")?
        .or_else(|| cursor.as_ref().map(|cursor| cursor.to.clone()))
        .unwrap_or_else(|| as_of.clone());
    let (to, to_ns) = utc_timestamp(&to_raw, "to")?;
    let from_raw = match param_string(&req.params, "from")? {
        Some(value) => value,
        None => match &cursor {
            Some(cursor) => cursor.from.clone(),
            None => timestamp_text(to_ns.saturating_sub(DEFAULT_WINDOW_NANOS))?,
        },
    };
    let (from, from_ns) = utc_timestamp(&from_raw, "from")?;
    let span = to_ns - from_ns;
    if span <= 0 {
        return Err(Failure::invalid(
            "work history window must satisfy from < to",
        ));
    }
    if span > MAX_WINDOW_NANOS {
        return Err(Failure::invalid(
            "work history window cannot exceed 366 days",
        ));
    }

    let bucket_name = param_string(&req.params, "bucket")?
        .or_else(|| {
            cursor
                .as_ref()
                .map(|cursor| cursor.bucket.as_str().to_owned())
        })
        .unwrap_or_else(|| "day".to_owned());
    let bucket = WorkHistoryBucket::parse(&bucket_name)
        .ok_or_else(|| Failure::invalid("work history bucket must be hour, day, or week"))?;
    let bucket_ns = match bucket {
        WorkHistoryBucket::Hour => NANOS_PER_HOUR,
        WorkHistoryBucket::Day => NANOS_PER_DAY,
        WorkHistoryBucket::Week => 7 * NANOS_PER_DAY,
    };
    let bucket_count_i128 = (span + bucket_ns - 1) / bucket_ns;
    let bucket_count = usize::try_from(bucket_count_i128)
        .map_err(|_| Failure::invalid("work history bucket count is too large"))?;
    if bucket_count > MAX_BUCKETS {
        return Err(Failure::invalid(
            "work history window would exceed 400 buckets",
        ));
    }

    let group_name = param_string(&req.params, "groupBy")?
        .or_else(|| {
            cursor
                .as_ref()
                .map(|cursor| cursor.group_by.as_str().to_owned())
        })
        .unwrap_or_else(|| "none".to_owned());
    let group_by = WorkHistoryGroupBy::parse(&group_name).ok_or_else(|| {
        Failure::invalid("work history groupBy must be none, repository, epic, stage, or provider")
    })?;
    let repository = param_string(&req.params, "repo")?
        .or_else(|| {
            cursor
                .as_ref()
                .and_then(|cursor| cursor.filters.repository.clone())
        })
        .map(|value| {
            normalize_repository_path(&value).ok_or_else(|| {
                Failure::invalid("work history repo must be an absolute canonicalizable path")
            })
        })
        .transpose()?;
    let filters = WorkHistoryFiltersV1 {
        repository,
        epic_id: param_string(&req.params, "epic")?.or_else(|| {
            cursor
                .as_ref()
                .and_then(|cursor| cursor.filters.epic_id.clone())
        }),
        subject_id: param_string(&req.params, "subject")?.or_else(|| {
            cursor
                .as_ref()
                .and_then(|cursor| cursor.filters.subject_id.clone())
        }),
    };
    let limit = match req.params.get("limit") {
        None => DEFAULT_SUBJECT_LIMIT,
        Some(value) => {
            let value = value
                .as_u64()
                .ok_or_else(|| Failure::invalid("work history limit must be a positive integer"))?;
            let value = usize::try_from(value)
                .map_err(|_| Failure::invalid("work history limit is too large"))?;
            if value == 0 || value > MAX_SUBJECT_LIMIT {
                return Err(Failure::invalid(
                    "work history limit must be between 1 and 200",
                ));
            }
            value
        }
    };
    let fingerprint = fingerprint(&from, &to, bucket, group_by, &filters)?;
    if cursor
        .as_ref()
        .is_some_and(|cursor| cursor.fingerprint != fingerprint)
    {
        return Err(Failure::invalid(
            "work history cursor belongs to a different normalized request",
        ));
    }
    if let Some(cursor) = &cursor {
        utc_timestamp(&cursor.last_activity_at, "cursor.lastActivityAt")?;
    }
    Ok(HistoryRequest {
        as_of,
        from,
        to,
        from_ns,
        to_ns,
        bucket,
        bucket_ns,
        bucket_count,
        group_by,
        filters,
        limit,
        cursor,
        fingerprint,
    })
}

fn run_outcome(value: &str) -> Result<RunOutcome, Failure> {
    match value {
        "clean" => Ok(RunOutcome::Clean),
        "blocked" => Ok(RunOutcome::Blocked),
        "input-required" => Ok(RunOutcome::InputRequired),
        "cancelled" => Ok(RunOutcome::Cancelled),
        "accepted-risk" => Ok(RunOutcome::AcceptedRisk),
        "superseded" => Ok(RunOutcome::Superseded),
        "landed" => Ok(RunOutcome::Landed),
        _ => Err(Failure::internal(format!(
            "run.settled carries unknown outcome {value:?}"
        ))),
    }
}

fn attempt_state(value: &str) -> Result<AttemptState, Failure> {
    match value {
        "running" => Ok(AttemptState::Running),
        "completed" => Ok(AttemptState::Completed),
        "failed" => Ok(AttemptState::Failed),
        "revoking" => Ok(AttemptState::Revoking),
        "reclaimed" => Ok(AttemptState::Reclaimed),
        "stopped" => Ok(AttemptState::Stopped),
        _ => Err(Failure::internal(format!(
            "attempt.state carries unknown state {value:?}"
        ))),
    }
}

fn packet_dimensions(
    snapshot: &HistorySnapshot,
) -> Result<BTreeMap<String, PacketDimension>, Failure> {
    let mut out = BTreeMap::new();
    for row in &snapshot.packets {
        stored_timestamp(&row.created_at, "packets.created_at")?;
        let packet = forged_proto::stored_packet(row).map_err(|error| {
            Failure::internal(format!(
                "packet {:?} is not decodable: {error}",
                row.packet_id
            ))
        })?;
        let stage = packet.execution.map_or_else(
            || {
                Some(
                    match row.stage {
                        forged_types::Stage::Implement => "implement",
                        forged_types::Stage::ReviewClaude => "reviewclaude",
                        forged_types::Stage::ReviewCodex => "reviewcodex",
                        forged_types::Stage::Fix => "fix",
                    }
                    .to_owned(),
                )
            },
            |execution| Some(execution.stage_id),
        );
        let provider = (!packet.provider_hints.provider.trim().is_empty())
            .then(|| packet.provider_hints.provider.trim().to_owned());
        out.insert(
            row.packet_id.clone(),
            PacketDimension {
                run_id: row.run_id.clone(),
                stage,
                provider,
            },
        );
    }
    Ok(out)
}

fn in_window(request: &HistoryRequest, nanos: i128) -> bool {
    nanos >= request.from_ns && nanos < request.to_ns
}

fn project(snapshot: HistorySnapshot, request: &HistoryRequest) -> Result<WorkHistoryV1, Failure> {
    for identity in snapshot.work_identities.values() {
        stored_timestamp(&identity.captured_at, "work_identities.captured_at")?;
    }
    let packets = packet_dimensions(&snapshot)?;
    let mut builder = Builder {
        request,
        identities: &snapshot.work_identities,
        aggregate: MetricsAcc::default(),
        groups: BTreeMap::new(),
        subjects: BTreeMap::new(),
    };
    if request.group_by == WorkHistoryGroupBy::None {
        builder.groups.insert(
            "all".to_owned(),
            GroupAcc::new(
                "all".to_owned(),
                "All work".to_owned(),
                None,
                request.bucket_count,
            ),
        );
    }
    let mut legacy_stopped = BTreeSet::new();

    for run in &snapshot.runs {
        let created = stored_timestamp(&run.created_at, "runs.created_at")?;
        let updated = stored_timestamp(&run.updated_at, "runs.updated_at")?;
        if in_window(request, created) {
            builder.record(
                WorkIdentitySubjectKind::Run,
                &run.run_id,
                created,
                None,
                None,
                |metrics| metrics.runs_started += 1,
            )?;
        }
        if run.state == RunState::Stopped && run.terminal_outcome.is_none() {
            legacy_stopped.insert(run.run_id.clone());
            builder.retain_legacy_subject(WorkIdentitySubjectKind::Run, &run.run_id, updated)?;
        }
    }

    for event in &snapshot.events {
        let ts = stored_timestamp(&event.ts, "events.ts")?;
        let subject_id = event
            .run_id
            .as_deref()
            .filter(|value| !value.is_empty())
            .ok_or_else(|| {
                Failure::internal(format!(
                    "history event {} ({}) has no subject id",
                    event.event_id, event.kind
                ))
            })?;
        let payload: Value = serde_json::from_str(&event.payload_json).map_err(|error| {
            Failure::internal(format!(
                "history event {} ({}) payload is not JSON: {error}",
                event.event_id, event.kind
            ))
        })?;
        match event.kind.as_str() {
            "run.settled" => {
                let outcome = payload
                    .get("outcome")
                    .and_then(Value::as_str)
                    .ok_or_else(|| Failure::internal("run.settled has no outcome"))
                    .and_then(run_outcome)?;
                builder.record(
                    WorkIdentitySubjectKind::Run,
                    subject_id,
                    ts,
                    None,
                    None,
                    |metrics| metrics.settlement(outcome),
                )?;
            }
            "forged.epic.started" => builder.record(
                WorkIdentitySubjectKind::Epic,
                subject_id,
                ts,
                None,
                None,
                |metrics| metrics.epics_started += 1,
            )?,
            "forged.epic.paused" => builder.record(
                WorkIdentitySubjectKind::Epic,
                subject_id,
                ts,
                None,
                None,
                |metrics| metrics.epics_paused += 1,
            )?,
            "forged.epic.resumed" => builder.record(
                WorkIdentitySubjectKind::Epic,
                subject_id,
                ts,
                None,
                None,
                |metrics| metrics.epics_resumed += 1,
            )?,
            "forged.epic.pr" => builder.record(
                WorkIdentitySubjectKind::Epic,
                subject_id,
                ts,
                None,
                None,
                |metrics| metrics.epic_final_prs += 1,
            )?,
            "forged.profile.escalated" => {
                let run_id = subject_id.to_owned();
                builder.record(
                    WorkIdentitySubjectKind::Run,
                    subject_id,
                    ts,
                    None,
                    None,
                    |metrics| {
                        metrics.escalated_runs.insert(run_id.clone());
                    },
                )?;
            }
            "attempt.state" => {
                let packet_id = payload
                    .get("packetId")
                    .and_then(Value::as_str)
                    .filter(|value| !value.is_empty())
                    .ok_or_else(|| Failure::internal("attempt.state has no packetId"))?;
                if payload.get("attemptId").and_then(Value::as_i64).is_none() {
                    return Err(Failure::internal("attempt.state has no attemptId"));
                }
                let state = payload
                    .get("new")
                    .and_then(Value::as_str)
                    .ok_or_else(|| Failure::internal("attempt.state has no new state"))
                    .and_then(attempt_state)?;
                let dimensions = packets.get(packet_id).ok_or_else(|| {
                    Failure::internal(format!(
                        "attempt.state references missing packet {packet_id:?}"
                    ))
                })?;
                if dimensions.run_id != subject_id {
                    return Err(Failure::internal(format!(
                        "attempt.state subject {subject_id:?} disagrees with packet owner {:?}",
                        dimensions.run_id
                    )));
                }
                let run_id = subject_id.to_owned();
                builder.record(
                    WorkIdentitySubjectKind::Run,
                    subject_id,
                    ts,
                    dimensions.stage.as_deref(),
                    dimensions.provider.as_deref(),
                    |metrics| {
                        metrics.attempt_transition(state);
                        metrics.attempt_activity_runs.insert(run_id.clone());
                    },
                )?;
            }
            other => {
                return Err(Failure::internal(format!(
                    "history snapshot returned unrelated event {other:?}"
                )))
            }
        }
    }

    for row in &snapshot.attempts {
        let dimensions = packets.get(&row.attempt.packet_id).ok_or_else(|| {
            Failure::internal(format!(
                "attempt {} references missing packet {:?}",
                row.attempt.attempt_id, row.attempt.packet_id
            ))
        })?;
        if dimensions.run_id != row.run_id {
            return Err(Failure::internal(
                "attempt packet owner changed inside snapshot",
            ));
        }
        let started = stored_timestamp(&row.attempt.started_at, "attempts.started_at")?;
        stored_timestamp(&row.attempt.updated_at, "attempts.updated_at")?;
        if in_window(request, started) {
            let run_id = row.run_id.clone();
            let repeat = row.ordinal > 1;
            builder.record(
                WorkIdentitySubjectKind::Run,
                &row.run_id,
                started,
                dimensions.stage.as_deref(),
                dimensions.provider.as_deref(),
                |metrics| {
                    metrics.attempts_started += 1;
                    metrics.repeat_attempts += u64::from(repeat);
                    metrics.attempt_activity_runs.insert(run_id.clone());
                },
            )?;
        }
        match (&row.attempt.ended_at, row.attempt.state) {
            (Some(ended), state) => {
                let ended = stored_timestamp(ended, "attempts.ended_at")?;
                if !matches!(
                    state,
                    AttemptState::Completed
                        | AttemptState::Failed
                        | AttemptState::Reclaimed
                        | AttemptState::Stopped
                ) {
                    return Err(Failure::internal(format!(
                        "non-terminal attempt {} carries ended_at",
                        row.attempt.attempt_id
                    )));
                }
                if in_window(request, ended) {
                    let run_id = row.run_id.clone();
                    builder.record(
                        WorkIdentitySubjectKind::Run,
                        &row.run_id,
                        ended,
                        dimensions.stage.as_deref(),
                        dimensions.provider.as_deref(),
                        |metrics| {
                            metrics.terminal_attempt(state);
                            metrics.attempt_activity_runs.insert(run_id.clone());
                        },
                    )?;
                }
            }
            (
                None,
                AttemptState::Completed
                | AttemptState::Failed
                | AttemptState::Reclaimed
                | AttemptState::Stopped,
            ) => {
                return Err(Failure::internal(format!(
                    "terminal attempt {} has no ended_at",
                    row.attempt.attempt_id
                )))
            }
            (None, _) => {}
        }
    }

    for row in &snapshot.usage {
        let ts = stored_timestamp(&row.ts, "usage.ts")?;
        let dimensions = row
            .packet_id
            .as_deref()
            .map(|packet_id| {
                packets.get(packet_id).ok_or_else(|| {
                    Failure::internal(format!("usage row references missing packet {packet_id:?}"))
                })
            })
            .transpose()?;
        if dimensions.is_some_and(|value| value.run_id != row.run_id) {
            return Err(Failure::internal(
                "usage packet owner changed inside snapshot",
            ));
        }
        let provider = (!row.provider.trim().is_empty()).then_some(row.provider.trim());
        builder.record(
            WorkIdentitySubjectKind::Run,
            &row.run_id,
            ts,
            dimensions.and_then(|value| value.stage.as_deref()),
            provider,
            |metrics| metrics.usage(row),
        )?;
    }

    let durable_subjects = builder.subjects.len();
    let legacy_count = legacy_stopped
        .iter()
        .filter(|run_id| {
            builder
                .subjects
                .contains_key(&(WorkIdentitySubjectKind::Run, (*run_id).clone()))
        })
        .count();
    let missing_cost = builder.aggregate.rows_missing_cost;
    let metrics = builder.aggregate.project();
    let (series, combined_groups) = project_groups(builder.groups, request)?;
    let (subjects, next_cursor) = project_subjects(builder.subjects, request)?;

    let mut degradation_facts = Vec::new();
    if legacy_count > 0 {
        degradation_facts.push(format!(
            "{legacy_count} legacy stopped run(s) have no durable run.settled transition"
        ));
    }
    if missing_cost > 0 {
        degradation_facts.push(format!("{missing_cost} usage row(s) retain unknown cost"));
    }
    if combined_groups > 0 {
        degradation_facts.push(format!(
            "{combined_groups} low-activity group(s) were combined into other"
        ));
    }
    let coverage = WorkHistoryCoverageV1 {
        durable_subjects: u64::try_from(durable_subjects).unwrap_or(u64::MAX),
        returned_subjects: u64::try_from(subjects.len()).unwrap_or(u64::MAX),
        legacy_stopped_without_settlement: u64::try_from(legacy_count).unwrap_or(u64::MAX),
        live_plan_subjects_excluded: true,
        max_groups: MAX_GROUPS as u32,
        groups_combined_into_other: u64::try_from(combined_groups).unwrap_or(u64::MAX),
        degraded: !degradation_facts.is_empty(),
        degradation_facts,
    };
    Ok(WorkHistoryV1 {
        schema: WORK_HISTORY_SCHEMA_V1.to_owned(),
        as_of: request.as_of.clone(),
        window: WorkHistoryWindowV1 {
            from: request.from.clone(),
            to: request.to.clone(),
            bucket: request.bucket,
            bucket_count: request.bucket_count as u32,
        },
        group_by: request.group_by,
        filters: request.filters.clone(),
        coverage,
        metrics,
        series,
        subjects,
        next_cursor,
    })
}

fn bucket_rows(
    group: &GroupAcc,
    request: &HistoryRequest,
) -> Result<Vec<WorkHistoryBucketV1>, Failure> {
    group
        .buckets
        .iter()
        .enumerate()
        .map(|(index, metrics)| {
            let start = request.from_ns + index as i128 * request.bucket_ns;
            let end = (start + request.bucket_ns).min(request.to_ns);
            Ok(WorkHistoryBucketV1 {
                from: timestamp_text(start)?,
                to: timestamp_text(end)?,
                metrics: metrics.project(),
            })
        })
        .collect()
}

fn project_groups(
    groups: BTreeMap<String, GroupAcc>,
    request: &HistoryRequest,
) -> Result<(Vec<WorkHistorySeriesV1>, usize), Failure> {
    let mut groups: Vec<GroupAcc> = groups.into_values().collect();
    groups.sort_by(|left, right| {
        right
            .metrics
            .activity()
            .cmp(&left.metrics.activity())
            .then_with(|| left.key.cmp(&right.key))
    });
    let mut combined = Vec::new();
    if groups.len() > MAX_GROUPS {
        let slots = MAX_GROUPS - 1;
        let unknown = groups.iter().position(|group| group.key == "unknown");
        let mut retain = BTreeSet::new();
        if let Some(index) = unknown {
            retain.insert(index);
        }
        for index in 0..groups.len() {
            if retain.len() >= slots {
                break;
            }
            retain.insert(index);
        }
        let mut kept = Vec::with_capacity(MAX_GROUPS);
        for (index, group) in groups.into_iter().enumerate() {
            if retain.contains(&index) {
                kept.push(group);
            } else {
                combined.push(group);
            }
        }
        let mut other = GroupAcc::new(
            "other".to_owned(),
            "Other".to_owned(),
            None,
            request.bucket_count,
        );
        for group in &combined {
            other.merge(group);
        }
        kept.sort_by(|left, right| {
            right
                .metrics
                .activity()
                .cmp(&left.metrics.activity())
                .then_with(|| left.key.cmp(&right.key))
        });
        kept.push(other);
        groups = kept;
    }
    let series = groups
        .into_iter()
        .map(|group| {
            Ok(WorkHistorySeriesV1 {
                key: group.key.clone(),
                label: group.label.clone(),
                epic_identity: group.epic_identity.clone(),
                metrics: group.metrics.project(),
                buckets: bucket_rows(&group, request)?,
            })
        })
        .collect::<Result<Vec<_>, Failure>>()?;
    Ok((series, combined.len()))
}

fn subject_order(left: &SubjectAcc, right: &SubjectAcc) -> Ordering {
    right
        .last_ns
        .cmp(&left.last_ns)
        .then_with(|| left.identity.subject.kind.cmp(&right.identity.subject.kind))
        .then_with(|| left.identity.subject.id.cmp(&right.identity.subject.id))
}

fn is_after_cursor(subject: &SubjectAcc, cursor: &CursorV1) -> Result<bool, Failure> {
    let cursor_ns = stored_timestamp(&cursor.last_activity_at, "cursor.lastActivityAt")?;
    Ok(subject.last_ns < cursor_ns
        || (subject.last_ns == cursor_ns
            && (subject.identity.subject.kind > cursor.subject_kind
                || (subject.identity.subject.kind == cursor.subject_kind
                    && subject.identity.subject.id > cursor.subject_id))))
}

fn project_subjects(
    subjects: BTreeMap<(WorkIdentitySubjectKind, String), SubjectAcc>,
    request: &HistoryRequest,
) -> Result<(Vec<WorkHistorySubjectV1>, Option<String>), Failure> {
    let mut subjects: Vec<SubjectAcc> = subjects.into_values().collect();
    subjects.sort_by(subject_order);
    if let Some(cursor) = &request.cursor {
        subjects = subjects
            .into_iter()
            .filter_map(|subject| match is_after_cursor(&subject, cursor) {
                Ok(true) => Some(Ok(subject)),
                Ok(false) => None,
                Err(error) => Some(Err(error)),
            })
            .collect::<Result<Vec<_>, Failure>>()?;
    }
    let more = subjects.len() > request.limit;
    subjects.truncate(request.limit);
    let next_cursor = if more {
        let last = subjects
            .last()
            .ok_or_else(|| Failure::internal("history pagination lost its last subject"))?;
        Some(encode_cursor(&CursorV1 {
            schema: CURSOR_SCHEMA.to_owned(),
            fingerprint: request.fingerprint.clone(),
            as_of: request.as_of.clone(),
            from: request.from.clone(),
            to: request.to.clone(),
            bucket: request.bucket,
            group_by: request.group_by,
            filters: request.filters.clone(),
            last_activity_at: timestamp_text(last.last_ns)?,
            subject_kind: last.identity.subject.kind,
            subject_id: last.identity.subject.id.clone(),
        })?)
    } else {
        None
    };
    let rows = subjects
        .into_iter()
        .map(|subject| {
            Ok(WorkHistorySubjectV1 {
                identity: subject.identity,
                first_activity_at: timestamp_text(subject.first_ns)?,
                last_activity_at: timestamp_text(subject.last_ns)?,
                metrics: subject.metrics.project(),
            })
        })
        .collect::<Result<Vec<_>, Failure>>()?;
    Ok((rows, next_cursor))
}

/// Shared CLI/MCP work-history operation.
pub async fn work_history(ctx: &Ctx, req: &OperationRequest) -> forged_types::OperationResponse {
    read_only("work_history", req, || async {
        let request = normalize_request(req)?;
        let from = request.from.clone();
        let to = request.to.clone();
        let snapshot = on_ledger(&ctx.ledger, move |ledger| {
            ledger.history_snapshot(&from, &to)
        })
        .await?;
        let result = project(snapshot, &request)?;
        serde_json::to_value(result)
            .map_err(|error| Failure::internal(format!("serialize work history: {error}")))
    })
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cursor_is_opaque_and_request_bound() {
        let cursor = CursorV1 {
            schema: CURSOR_SCHEMA.to_owned(),
            fingerprint: "abc".to_owned(),
            as_of: "2030-01-31T00:00:00.000000000Z".to_owned(),
            from: "2030-01-01T00:00:00.000000000Z".to_owned(),
            to: "2030-01-31T00:00:00.000000000Z".to_owned(),
            bucket: WorkHistoryBucket::Day,
            group_by: WorkHistoryGroupBy::None,
            filters: WorkHistoryFiltersV1 {
                repository: None,
                epic_id: None,
                subject_id: None,
            },
            last_activity_at: "2030-01-01T00:00:00.000000000Z".to_owned(),
            subject_kind: WorkIdentitySubjectKind::Run,
            subject_id: "run-a".to_owned(),
        };
        let encoded = encode_cursor(&cursor).expect("encode");
        assert!(!encoded.contains("run-a"));
        let decoded = decode_cursor(&encoded).expect("decode");
        assert_eq!(decoded.fingerprint, "abc");
        assert_eq!(decoded.subject_id, "run-a");
    }

    #[test]
    fn zero_denominators_project_as_null_rates() {
        let metrics = MetricsAcc::default().project();
        assert!(metrics.rework_rate.is_none());
        assert!(metrics.failure_rate.is_none());
        assert!(metrics.escalation_rate.is_none());
    }

    #[test]
    fn cursor_alone_restores_the_default_window_and_normalized_query() {
        let first = normalize_request(&OperationRequest {
            schema_version: 1,
            idempotency_key: "first".to_owned(),
            run_id: None,
            params: serde_json::Map::new(),
        })
        .expect("first page request");
        let encoded = encode_cursor(&CursorV1 {
            schema: CURSOR_SCHEMA.to_owned(),
            fingerprint: first.fingerprint.clone(),
            as_of: first.as_of.clone(),
            from: first.from.clone(),
            to: first.to.clone(),
            bucket: first.bucket,
            group_by: first.group_by,
            filters: first.filters.clone(),
            last_activity_at: first.from.clone(),
            subject_kind: WorkIdentitySubjectKind::Run,
            subject_id: "run-a".to_owned(),
        })
        .expect("cursor");
        let mut params = serde_json::Map::new();
        params.insert("cursor".to_owned(), Value::String(encoded));
        let continuation = normalize_request(&OperationRequest {
            schema_version: 1,
            idempotency_key: "continuation".to_owned(),
            run_id: None,
            params,
        })
        .expect("continuation request");
        assert_eq!(continuation.as_of, first.as_of);
        assert_eq!(continuation.from, first.from);
        assert_eq!(continuation.to, first.to);
        assert_eq!(continuation.fingerprint, first.fingerprint);
    }
}
