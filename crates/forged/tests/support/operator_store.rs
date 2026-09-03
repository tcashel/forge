//! Shared production-shaped operator-store fixture and next-action registry.
//!
//! This is data-only on purpose: relevance and coverage tests can select the
//! rows they need without paying to create a new process-backed store for
//! every assertion, while later budget tests can serialize the complete shape.

#![allow(dead_code)]

pub const SUBJECT_TOTAL: usize = 120;
pub const ATTENTION_TOTAL: usize = 62;
pub const BLOCKED_SYMPTOM_TOTAL: usize = 47;
pub const DECISION_TOTAL: usize = 10;
pub const RUNNING_TOTAL: usize = 2;
pub const RECENT_LANDED_TOTAL: usize = 3;

pub const COVERAGE_CONDITIONS: [&str; 7] = [
    "input-required",
    "restart-budget-exhausted",
    "review-budget-exhausted",
    "reviewer-disagreement",
    "quarantined",
    "missing-cost",
    "retry-exhausted",
];

pub const EXEMPT_CONDITIONS: [&str; 3] = [
    "ambiguous-effect",
    "merge-approval",
    "missing-evidence-attemptless",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FixtureLifecycle {
    Running,
    Landed,
    Stopped,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FixtureSubject {
    pub id: String,
    pub lifecycle: FixtureLifecycle,
    pub updated_at: &'static str,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FixtureAttention {
    pub subject_id: String,
    pub condition: &'static str,
    pub decision: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OperatorStoreFixture {
    pub captured_at: &'static str,
    pub subjects: Vec<FixtureSubject>,
    pub attention: Vec<FixtureAttention>,
}

/// Generate the shared store shape used by action-contract and budget tests.
pub fn operator_store_fixture() -> OperatorStoreFixture {
    let captured_at = "2026-09-03T12:00:00.000000000Z";
    let mut subjects = Vec::with_capacity(SUBJECT_TOTAL);
    for index in 0..SUBJECT_TOTAL {
        let (lifecycle, updated_at) = match index {
            0 | 1 => (FixtureLifecycle::Running, captured_at),
            2 => (FixtureLifecycle::Landed, "2026-09-03T11:00:00.000000000Z"),
            3 => (FixtureLifecycle::Landed, "2026-09-03T10:00:00.000000000Z"),
            4 => (FixtureLifecycle::Landed, "2026-09-03T09:00:00.000000000Z"),
            _ => (FixtureLifecycle::Stopped, "2026-09-02T08:00:00.000000000Z"),
        };
        subjects.push(FixtureSubject {
            id: format!("fixture-subject-{index:03}"),
            lifecycle,
            updated_at,
        });
    }

    let mut attention = Vec::with_capacity(ATTENTION_TOTAL);
    for subject in subjects.iter().skip(5).take(BLOCKED_SYMPTOM_TOTAL) {
        attention.push(FixtureAttention {
            subject_id: subject.id.clone(),
            condition: "blocked",
            decision: false,
        });
    }
    for (subject, condition) in subjects
        .iter()
        .skip(5 + BLOCKED_SYMPTOM_TOTAL)
        .zip(COVERAGE_CONDITIONS.iter().chain(EXEMPT_CONDITIONS.iter()))
    {
        attention.push(FixtureAttention {
            subject_id: subject.id.clone(),
            condition,
            decision: true,
        });
    }
    for (subject, condition) in subjects
        .iter()
        .skip(5 + BLOCKED_SYMPTOM_TOTAL + DECISION_TOTAL)
        .zip([
            "controller-dead",
            "failed-gate",
            "provider-degraded",
            "admission-deferred",
            "work-settlement-pending",
        ])
    {
        attention.push(FixtureAttention {
            subject_id: subject.id.clone(),
            condition,
            decision: false,
        });
    }

    OperatorStoreFixture {
        captured_at,
        subjects,
        attention,
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ActionSiteKind {
    Emitter,
    Remedy,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ActionSite {
    pub kind: ActionSiteKind,
    pub path: &'static str,
    pub marker: &'static str,
}

/// The complete registry of next-action emitters and direct remedy builders.
pub const ACTION_SITES: &[ActionSite] = &[
    ActionSite {
        kind: ActionSiteKind::Emitter,
        path: "src/core/work_ops.rs",
        marker: "pub(crate) fn projection_actions(",
    },
    ActionSite {
        kind: ActionSiteKind::Emitter,
        path: "src/core/ops.rs",
        marker: "pub(crate) fn run_projection_actions(",
    },
    ActionSite {
        kind: ActionSiteKind::Emitter,
        path: "src/core/attention.rs",
        marker: "pub(crate) fn recommendation_actions(",
    },
    ActionSite {
        kind: ActionSiteKind::Remedy,
        path: "src/core/handoff.rs",
        marker: "fn keyless_resubmit_remedy(",
    },
    ActionSite {
        kind: ActionSiteKind::Remedy,
        path: "src/core/handoff.rs",
        marker: "fn action_remedy(",
    },
    ActionSite {
        kind: ActionSiteKind::Remedy,
        path: "src/core/epic.rs",
        marker: "pause scheduling before abandoning the epic",
    },
    ActionSite {
        kind: ActionSiteKind::Remedy,
        path: "src/core/ops.rs",
        marker: "reopen the work item before retrying",
    },
];
