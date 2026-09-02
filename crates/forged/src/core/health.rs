//! One derived execution-health verdict per subject.
//!
//! The motivating production incident: answering "is it running?" required
//! reconciling an epic reading `active`, a desired state of `running`, a
//! last outcome of `exhausted`, `live: 0`, and a controller of `unknown` —
//! five fields, no verdict. Every operator surface now derives ONE closed
//! value from the same durable inputs through this module, so the
//! projections can disagree in detail but never in verdict.

use forged_ledger::{DesiredReconcileOutcome, DesiredState, DesiredWorkRow};
use serde_json::{json, Value};

/// The `last_error` prefix the supervisor writes when it halts after one
/// nonrecoverable controller failure. Health derivation reads it back to
/// distinguish `halted` (deterministic, resubmit repeats it until the cause
/// is fixed) from `exhausted` (the restart budget was consumed by repeated
/// deaths).
pub(crate) const HALTED_ERROR_PREFIX: &str = "halted after one nonrecoverable controller failure:";

/// Everything a surface knows about a subject's execution, durable-first.
/// A surface passes only what it actually observed; absent knowledge is
/// never guessed.
#[derive(Clone, Copy)]
pub(crate) struct HealthInputs<'a> {
    /// The subject has durable started state (an epic STARTED event, a run
    /// row).
    pub started: bool,
    /// The subject reached its terminal delivery boundary (draft PR
    /// delivered, run settled terminal).
    pub terminal: bool,
    /// An explicit pause is the latest pause-family event.
    pub paused: bool,
    /// An unresolved input requirement is open.
    pub input_required: bool,
    /// The latest admission decision deferred the subject.
    pub admission_deferred: bool,
    /// The supervisor row, when one exists.
    pub desired: Option<&'a DesiredWorkRow>,
    /// Live-process knowledge: `Some(true)` proved live (probe or live
    /// seat), `Some(false)` proved dead, `None` not probed. Consulted only
    /// where the durable rows alone cannot answer.
    pub controller_live: Option<bool>,
}

impl<'a> HealthInputs<'a> {
    /// Inputs available to `epic status`: complete epic lifecycle state plus
    /// live pass or child-run activity. A started epic is implicit here.
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn epic_status(
        terminal: bool,
        paused: bool,
        input_required: bool,
        admission_deferred: bool,
        desired: Option<&'a DesiredWorkRow>,
        controller_live: Option<bool>,
    ) -> Self {
        Self {
            started: true,
            terminal,
            paused,
            input_required,
            admission_deferred,
            desired,
            controller_live,
        }
    }

    /// Inputs available to the deliberately cheap portfolio projection.
    /// It observes terminal, admission, desired-work, and controller facts,
    /// but deliberately degrades `paused` and `input_required` to `false`;
    /// callers needing those verdicts use an exact observation surface.
    pub(crate) fn portfolio(
        terminal: bool,
        admission_deferred: bool,
        desired: Option<&'a DesiredWorkRow>,
        controller_live: Option<bool>,
    ) -> Self {
        Self {
            started: true,
            terminal,
            paused: false,
            input_required: false,
            admission_deferred,
            desired,
            controller_live,
        }
    }

    /// Inputs derived from one exact event-tail observation snapshot. This
    /// is the richest ledger-only constructor and the one `explain` uses.
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn observation(
        started: bool,
        terminal: bool,
        paused: bool,
        input_required: bool,
        admission_deferred: bool,
        desired: Option<&'a DesiredWorkRow>,
        controller_live: Option<bool>,
    ) -> Self {
        Self {
            started,
            terminal,
            paused,
            input_required,
            admission_deferred,
            desired,
            controller_live,
        }
    }

    /// Inputs available for one frozen epic-child row. Children observe
    /// start, terminal, planning-input, admission, and desired-work facts;
    /// they have neither a child pause state nor a live controller probe.
    pub(crate) fn frozen_child(
        started: bool,
        terminal: bool,
        input_required: bool,
        admission_deferred: bool,
        desired: Option<&'a DesiredWorkRow>,
    ) -> Self {
        Self {
            started,
            terminal,
            paused: false,
            input_required,
            admission_deferred,
            desired,
            controller_live: None,
        }
    }

    /// Bounded wire summary of exactly the fields the health lattice reads.
    pub(crate) fn summary(self) -> Value {
        json!({
            "started": self.started,
            "terminal": self.terminal,
            "paused": self.paused,
            "inputRequired": self.input_required,
            "admissionDeferred": self.admission_deferred,
            "desired": self.desired.map(|desired| json!({
                "state": desired.desired_state.as_str(),
                "lastOutcome": desired.last_outcome.map(|outcome| outcome.as_str()),
                "exhausted": desired.exhausted_at.is_some(),
                "halted": desired.last_error.as_deref()
                    .is_some_and(|error| error.starts_with(HALTED_ERROR_PREFIX)),
            })),
            "controllerLive": self.controller_live,
        })
    }
}

/// The closed verdict set, in precedence order:
/// `terminal` > `not-started` > `input-required` > `paused` > `halted` /
/// `exhausted` / `stopped` (desired-row truth) > `queued` > `running` >
/// `unsubmitted`.
///
/// A desired row in `running` with a dead-but-budgeted controller is still
/// `running`: the supervisor's restart IS the running state. The doomed
/// cases the incident conflated with it — `halted` and `exhausted` — are
/// decided first from the same row.
pub(crate) fn execution_health(inputs: HealthInputs<'_>) -> &'static str {
    if inputs.terminal {
        return "terminal";
    }
    if !inputs.started {
        return "not-started";
    }
    if inputs.input_required {
        return "input-required";
    }
    if inputs.paused {
        return "paused";
    }
    if let Some(desired) = inputs.desired {
        if desired.exhausted_at.is_some()
            || desired.last_outcome == Some(DesiredReconcileOutcome::Exhausted)
        {
            let halted = desired
                .last_error
                .as_deref()
                .is_some_and(|error| error.starts_with(HALTED_ERROR_PREFIX));
            return if halted { "halted" } else { "exhausted" };
        }
        match desired.desired_state {
            DesiredState::Stopped => return "stopped",
            DesiredState::Paused => return "paused",
            DesiredState::Running => {}
        }
        if inputs.admission_deferred
            || desired.last_outcome == Some(DesiredReconcileOutcome::Backoff)
        {
            return "queued";
        }
        return "running";
    }
    if inputs.admission_deferred {
        return "queued";
    }
    if inputs.controller_live == Some(true) {
        return "running";
    }
    "unsubmitted"
}

/// Project a `forged.controller.terminal` event payload into the wire shape
/// every health-bearing surface attaches as `lastControllerFailure` — the
/// durable answer to "why is it not running" that previously lived only in
/// controller-local log files.
pub(crate) fn controller_failure_json(payload: &Value, at: &str) -> Value {
    json!({
        "code": payload.get("code").cloned().unwrap_or(Value::Null),
        "message": payload.get("message").cloned().unwrap_or(Value::Null),
        "recoverable": payload.get("recoverable").cloned().unwrap_or(Value::Null),
        "generation": payload.get("generation").cloned().unwrap_or(Value::Null),
        "at": at,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn desired(
        state: DesiredState,
        outcome: Option<DesiredReconcileOutcome>,
        exhausted: bool,
        error: Option<&str>,
    ) -> DesiredWorkRow {
        DesiredWorkRow {
            subject_kind: forged_ledger::DesiredSubjectKind::Epic,
            subject_id: "epic-health".to_owned(),
            desired_state: state,
            control_revision: 1,
            controller_generation: 1,
            predecessor_generation: None,
            restart_budget: 5,
            restart_used: 0,
            next_wake_at: None,
            last_progress_at: None,
            last_outcome: outcome,
            last_error: error.map(str::to_owned),
            exhausted_at: exhausted.then(|| "2026-08-27T00:00:00.000000000Z".to_owned()),
            reconcile_token: None,
            reconcile_lease_until: None,
            created_at: "2026-08-27T00:00:00.000000000Z".to_owned(),
            updated_at: "2026-08-27T00:00:00.000000000Z".to_owned(),
        }
    }

    fn base(desired: Option<&DesiredWorkRow>) -> HealthInputs<'_> {
        HealthInputs::observation(true, false, false, false, false, desired, None)
    }

    #[test]
    fn the_precedence_lattice_is_closed_and_ordered() {
        assert_eq!(
            execution_health(HealthInputs {
                terminal: true,
                ..base(None)
            }),
            "terminal"
        );
        assert_eq!(
            execution_health(HealthInputs {
                started: false,
                ..base(None)
            }),
            "not-started"
        );
        assert_eq!(
            execution_health(HealthInputs {
                input_required: true,
                ..base(None)
            }),
            "input-required"
        );
        assert_eq!(
            execution_health(HealthInputs {
                paused: true,
                ..base(None)
            }),
            "paused"
        );
        assert_eq!(execution_health(base(None)), "unsubmitted");
        assert_eq!(
            execution_health(HealthInputs {
                controller_live: Some(true),
                ..base(None)
            }),
            "running"
        );
        assert_eq!(
            execution_health(HealthInputs {
                admission_deferred: true,
                ..base(None)
            }),
            "queued"
        );
    }

    #[test]
    fn the_desired_row_decides_the_doomed_states_first() {
        let running = desired(DesiredState::Running, None, false, None);
        assert_eq!(execution_health(base(Some(&running))), "running");

        // The incident's exact shape: desired running, outcome exhausted —
        // formerly read back as "active".
        let exhausted = desired(
            DesiredState::Running,
            Some(DesiredReconcileOutcome::Exhausted),
            true,
            Some("restart budget is exhausted"),
        );
        assert_eq!(execution_health(base(Some(&exhausted))), "exhausted");

        let halted_error = format!("{HALTED_ERROR_PREFIX} git push refused");
        let halted = desired(
            DesiredState::Running,
            Some(DesiredReconcileOutcome::Exhausted),
            true,
            Some(&halted_error),
        );
        assert_eq!(execution_health(base(Some(&halted))), "halted");

        let backoff = desired(
            DesiredState::Running,
            Some(DesiredReconcileOutcome::Backoff),
            false,
            None,
        );
        assert_eq!(execution_health(base(Some(&backoff))), "queued");

        let stopped = desired(DesiredState::Stopped, None, false, None);
        assert_eq!(execution_health(base(Some(&stopped))), "stopped");

        // A dead-but-budgeted controller is still running: the supervisor's
        // restart IS the running state.
        assert_eq!(
            execution_health(HealthInputs {
                controller_live: Some(false),
                ..base(Some(&running))
            }),
            "running"
        );
    }

    #[test]
    fn surface_constructors_agree_on_every_field_they_both_observe() {
        let desired = desired(DesiredState::Running, None, false, None);
        let richest =
            HealthInputs::epic_status(false, true, true, true, Some(&desired), Some(true));
        let observation =
            HealthInputs::observation(true, false, true, true, true, Some(&desired), Some(true));
        let portfolio = HealthInputs::portfolio(false, true, Some(&desired), Some(true));
        let child = HealthInputs::frozen_child(true, false, true, true, Some(&desired));

        for candidate in [observation, portfolio, child] {
            assert_eq!(candidate.started, richest.started);
            assert_eq!(candidate.terminal, richest.terminal);
            assert_eq!(candidate.admission_deferred, richest.admission_deferred);
            assert!(std::ptr::eq(
                candidate.desired.expect("desired row"),
                richest.desired.expect("desired row")
            ));
        }
        assert_eq!(observation.paused, richest.paused);
        assert_eq!(observation.input_required, richest.input_required);
        assert_eq!(observation.controller_live, richest.controller_live);
        assert_eq!(child.input_required, richest.input_required);
        assert!(!child.paused);
        assert_eq!(child.controller_live, None);
        assert!(!portfolio.paused);
        assert!(!portfolio.input_required);
        assert_eq!(portfolio.controller_live, richest.controller_live);
    }

    #[test]
    fn health_input_literals_are_confined_to_the_constructor_module() {
        let core = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("src/core");
        for entry in std::fs::read_dir(core).expect("read core source") {
            let path = entry.expect("core source entry").path();
            if path.extension().and_then(|value| value.to_str()) != Some("rs")
                || path.file_name().and_then(|value| value.to_str()) == Some("health.rs")
            {
                continue;
            }
            let source = std::fs::read_to_string(&path).expect("read core module");
            assert!(
                !source.contains("HealthInputs {"),
                "{} contains a scattered HealthInputs literal",
                path.display()
            );
        }
    }
}
