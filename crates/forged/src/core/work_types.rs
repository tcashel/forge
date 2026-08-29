//! The work-store consumer types — the nouns every projection, scheduler,
//! and driver speaks. They originated as the bd wire shapes and keep their
//! field-level contracts verbatim; the store behind them is the ledger.

use std::collections::BTreeMap;

/// The work fields forged consumes — the epic scheduler's inventory plus
/// the spec body a run is built from.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IssueSummary {
    /// Stable work id.
    pub id: String,
    /// Human-readable title.
    pub title: String,
    /// Markdown-ish issue description: the spec's Context and What We're
    /// Building sections, and on older imports the `spec:` and `repo:`
    /// pointers.
    pub description: String,
    /// Current work status.
    pub status: String,
    /// Native numeric scheduling priority. Missing or non-integral values
    /// remain `None` so admission can defer fail-closed.
    pub priority: Option<i64>,
    /// Current work assignee/lease holder, when any.
    pub assignee: Option<String>,
    /// Work issue type (`task`, `epic`, ...).
    pub issue_type: String,
    /// `acceptance_criteria` — the spec's Acceptance Criteria section.
    pub acceptance_criteria: String,
    /// `design` — the spec's Implementation Notes section.
    pub design: String,
    /// `notes` — the spec's Agent Instructions section.
    pub notes: String,
    /// `spec_id` — the work's link to an external specification document.
    pub spec_id: Option<String>,
    /// `metadata` — the JSON extension point carrying the spec's Quality
    /// Gates. Non-string values are kept as their compact JSON text: this
    /// map is transported, never interpreted. Gate commands a run actually
    /// executes stay frozen in its execution package.
    pub metadata: BTreeMap<String, String>,
    /// `revision` — bd's guarded-write optimistic-concurrency token, absent
    /// from responses that do not carry one (`create`, `update`, `ready`).
    ///
    /// OPAQUE, and kept as the response's own digits rather than an integer:
    /// it is compared for equality and nothing else — never ordered, parsed,
    /// incremented, or assumed positive (bd 1.2.1 emits negative values).
    pub revision: Option<String>,
    /// Authoritative work update time when the read shape carries it. Live
    /// plan identity uses this stable source timestamp instead of making an
    /// otherwise read-only projection vary with the wall clock.
    pub updated_at: Option<String>,
}

/// The complete provider-authored native specification written at one
/// rolling-planning boundary.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NativeSpecUpdate {
    /// Context and exact outcome.
    pub description: String,
    /// Observable completion contract.
    pub acceptance_criteria: String,
    /// Necessary implementation constraints.
    pub design: String,
    /// Instructions and explicit non-goals for the executing agent.
    pub notes: String,
}

/// One native work dependency coordinate carried by a hydrated plan row.
///
/// This is deliberately only identity and current status. Forged does not
/// reinterpret the work graph or manufacture readiness from display text.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanDependency {
    /// Canonical dependency Work id.
    pub id: String,
    /// Native dependency edge type from the pinned bd contract.
    pub dependency_type: PlanDependencyType,
    /// Current dependency status when the hydrated response carries it.
    pub status: Option<PlanDependencyStatus>,
}

/// Closed subset of pinned bd dependency kinds supported by plan inventory.
///
/// Only `blocks` affects scheduling readiness. The other four coordinates
/// remain visible to consumers as hierarchy, context, or provenance without
/// being promoted into blockers.
///
/// The subset stays closed on purpose: pinned bd 1.2.1 also advertises
/// `tracks`, `until`, `caused-by`, `validates`, and `relates-to`, and each
/// needs its own semantic review before a plan row may carry it. An
/// unadjudicated kind must keep failing the hydrate closed rather than being
/// skipped or coerced into `related`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum PlanDependencyType {
    /// A hard scheduling prerequisite.
    Blocks,
    /// A structural child-to-parent edge.
    ParentChild,
    /// A non-scheduling contextual link.
    Related,
    /// A non-scheduling provenance link.
    DiscoveredFrom,
    /// A non-scheduling provenance link from a replacement to the plan it
    /// replaced. The superseded target's status — including a missing or
    /// still-open one — is history, never a prerequisite.
    Supersedes,
}

impl PlanDependencyType {
    /// The native bd spelling retained on the wire.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Blocks => "blocks",
            Self::ParentChild => "parent-child",
            Self::Related => "related",
            Self::DiscoveredFrom => "discovered-from",
            Self::Supersedes => "supersedes",
        }
    }

    /// Whether this edge can prevent the issue from being ready.
    ///
    /// Only `blocks` does. `supersedes` in particular points at work the
    /// source replaced, which is routinely open or closed after the fact.
    pub const fn blocks_readiness(self) -> bool {
        matches!(self, Self::Blocks)
    }
}

impl TryFrom<&str> for PlanDependencyType {
    type Error = String;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "blocks" => Ok(Self::Blocks),
            "parent-child" => Ok(Self::ParentChild),
            "related" => Ok(Self::Related),
            "discovered-from" => Ok(Self::DiscoveredFrom),
            "supersedes" => Ok(Self::Supersedes),
            other => Err(format!("unknown dependency type {other:?}")),
        }
    }
}

/// Closed issue statuses carried by dependency summaries from pinned bd.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum PlanDependencyStatus {
    /// The prerequisite has not started.
    Open,
    /// The prerequisite is currently claimed.
    InProgress,
    /// The prerequisite is explicitly blocked.
    Blocked,
    /// The prerequisite is deferred.
    Deferred,
    /// The prerequisite is complete.
    Closed,
    /// The prerequisite is intentionally persistent.
    Pinned,
    /// The prerequisite is actively hooked by a worker.
    Hooked,
}

impl PlanDependencyStatus {
    /// The native bd spelling retained on the wire.
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Open => "open",
            Self::InProgress => "in_progress",
            Self::Blocked => "blocked",
            Self::Deferred => "deferred",
            Self::Closed => "closed",
            Self::Pinned => "pinned",
            Self::Hooked => "hooked",
        }
    }

    /// Whether this dependency is complete.
    pub const fn is_closed(self) -> bool {
        matches!(self, Self::Closed)
    }
}

impl std::ops::Deref for PlanDependencyStatus {
    type Target = str;

    fn deref(&self) -> &Self::Target {
        self.as_str()
    }
}

impl TryFrom<&str> for PlanDependencyStatus {
    type Error = String;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "open" => Ok(Self::Open),
            "in_progress" => Ok(Self::InProgress),
            "blocked" => Ok(Self::Blocked),
            "deferred" => Ok(Self::Deferred),
            "closed" => Ok(Self::Closed),
            "pinned" => Ok(Self::Pinned),
            "hooked" => Ok(Self::Hooked),
            other => Err(format!("unknown dependency status {other:?}")),
        }
    }
}

/// Readiness supported by one hydrated plan row's current facts.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum PlanReadiness {
    /// Every hard prerequisite is known closed.
    Ready,
    /// The issue or a hard prerequisite is known blocked.
    Blocked,
    /// The issue is already claimed and all hard prerequisites are closed.
    Claimed,
    /// The issue is explicitly deferred and all hard prerequisites are closed.
    Deferred,
    /// A hard prerequisite omitted the status needed to decide readiness.
    Unknown,
}

/// One current, nonterminal work-plan row.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanIssue {
    /// The same issue fields every Forged work consumer uses.
    #[serde(flatten)]
    pub issue: IssueSummary,
    /// Native parent id, when present.
    pub parent: Option<String>,
    /// Bounded dependency summaries from the single hydrate call.
    pub dependencies: Vec<PlanDependency>,
}

impl PlanIssue {
    /// Derive only readiness established by the hydrated dependency facts.
    ///
    /// A known non-closed `blocks` edge is conclusive even if another blocker
    /// omitted its status. If no known blocker proves the issue blocked, any
    /// missing hard-blocker status keeps the result unknown. Structural and
    /// informational edges never affect readiness.
    pub fn readiness(&self) -> PlanReadiness {
        if self.issue.status == "blocked" {
            return PlanReadiness::Blocked;
        }

        let blockers = self
            .dependencies
            .iter()
            .filter(|dependency| dependency.dependency_type.blocks_readiness());
        let mut missing_status = false;
        for blocker in blockers {
            match blocker.status {
                Some(status) if !status.is_closed() => return PlanReadiness::Blocked,
                Some(_) => {}
                None => missing_status = true,
            }
        }
        if missing_status {
            return PlanReadiness::Unknown;
        }

        match self.issue.status.as_str() {
            "open" => PlanReadiness::Ready,
            "in_progress" => PlanReadiness::Claimed,
            "deferred" => PlanReadiness::Deferred,
            _ => PlanReadiness::Unknown,
        }
    }
}

/// The bounded live-plan inventory and its coverage truth.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanInventory {
    /// Hydrated rows in discovery order.
    pub issues: Vec<PlanIssue>,
    /// More rows matched than the caller's display bound.
    pub truncated: bool,
    /// Number of rows observed by the bounded N+1 discovery call.
    pub discovered: usize,
}

/// Scope for the Work Map's one bounded work-graph read.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WorkMapPlanScope {
    /// All live operator-scoped plans.
    Operator,
    /// Live plans whose persisted repository metadata exactly matches.
    Repository(String),
    /// The named epic and its direct live children.
    Epic(String),
}

/// Current plan rows plus exact Work summaries needed by the shared
/// Operations classifier. Both collections come from the same final hydrate;
/// no separate claim/membership process is needed.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkMapPlanInventory {
    /// Hydrated live plan rows selected for display.
    pub issues: Vec<PlanIssue>,
    /// Exact durable-linked Work summaries available to classification.
    pub exact_issues: Vec<IssueSummary>,
    /// More live plan rows matched than the caller's bound.
    pub truncated: bool,
    /// Number of live plan rows observed before the display bound.
    pub discovered: usize,
}
