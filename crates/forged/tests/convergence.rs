//! Hermetic product-floor convergence matrix.
//!
//! Every fixture owns a scratch HOME, Anvil root, Beads shim store, local
//! repositories, provider shims, and GitHub shim. Nothing in this module may
//! consult operator state or a host service.

mod support;

use std::collections::BTreeSet;
use std::process::Stdio;
use std::time::Duration;
use support::convergence::*;

use forged_ledger::{
    AttemptState, DesiredReconcileOutcome, DesiredReconcileUpdate, DesiredRestartReservation,
    DesiredState, DesiredSubjectKind,
};
use forged_types::{AdmissionOutcome, AdmissionReason, AdmissionSubjectKind};
// The malformed-facts injection freezes the controller without the
// failpoints feature; it uses fully qualified nix paths.
use serde_json::{json, Value};
use support::TestEnv;

fn exhaust_restart_budget(env: &TestEnv, run: &str) -> forged_ledger::DesiredWorkRow {
    let ledger = env.ledger();
    let restart_budget = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row")
        .restart_budget;
    for index in 0..=restart_budget {
        ledger
            .record_desired_outcome(
                DesiredSubjectKind::Run,
                run,
                DesiredState::Running,
                DesiredReconcileOutcome::Authorized,
                Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                None,
            )
            .expect("make desired row due");
        let token = format!("convergence-restart-{index}");
        let claimed = ledger
            .claim_desired_work(
                DesiredSubjectKind::Run,
                run,
                &token,
                "2099-01-01T00:00:00.000000000Z",
                "2099-01-01T00:01:00.000000000Z",
            )
            .expect("claim desired work")
            .expect("due desired row");
        match ledger
            .reserve_desired_restart(
                DesiredSubjectKind::Run,
                run,
                &token,
                claimed.controller_generation,
            )
            .expect("reserve restart")
        {
            DesiredRestartReservation::Reserved(reserved) => {
                assert!(index < restart_budget, "only the finite budget may reserve");
                ledger
                    .finish_desired_reconciliation(
                        DesiredSubjectKind::Run,
                        run,
                        &token,
                        DesiredReconcileUpdate {
                            desired_state: None,
                            outcome: DesiredReconcileOutcome::Backoff,
                            controller_generation: Some(reserved.controller_generation),
                            predecessor_generation: reserved.predecessor_generation,
                            next_wake_at: Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                            last_progress_at: None,
                            last_error: Some("fixture controller remained dead".to_owned()),
                            attention_condition: None,
                        },
                    )
                    .expect("finish reserved restart");
            }
            DesiredRestartReservation::Exhausted(exhausted) => {
                assert_eq!(index, restart_budget, "exhaust at the configured bound");
                assert_eq!(exhausted.restart_used, exhausted.restart_budget);
                assert!(exhausted.exhausted_at.is_some());
            }
        }
    }
    let exhausted = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row");
    ledger.close().expect("close ledger");
    exhausted
}

#[test]
fn show_hydrated_revision_admits_controller_and_packet() {
    let env = TestEnv::new("adm-show");
    let run = "adm-show";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 1);

    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-show-submit",
    ]);
    assert_eq!(code, 0, "submit: {submitted}");
    assert!(
        submitted["result"]["controller"].is_object(),
        "a complete show row must not false-defer the controller: {submitted}"
    );
    wait_until("show-hydrated packet admission", || {
        provider_starts(&env, "implementation").len() == 1
    });

    let ledger = env.ledger();
    let decisions = ledger
        .latest_admission_decisions(None, None)
        .expect("admission decisions");
    assert!(decisions.iter().any(|decision| {
        decision.subject_kind == AdmissionSubjectKind::Run
            && decision.subject_id == run
            && decision.outcome == AdmissionOutcome::Admitted
    }));
    assert!(decisions.iter().any(|decision| {
        decision.subject_kind == AdmissionSubjectKind::Packet
            && decision.subject_id == format!("{run}/implementation/0")
            && decision.outcome == AdmissionOutcome::Admitted
    }));
    ledger.close().expect("close ledger");

    // The bounded exact-read contract died with the transport: admission
    // reads are in-process snapshots carrying the revision by construction.

    stop_run(&env, run);
    no_live_reservations(&env);
}

#[test]
fn non_runnable_status_defers_only_that_row_in_a_mixed_admission_batch() {
    let env = TestEnv::new("adm-custom-status");
    let custom = "adm-deferred";
    let open = "adm-open";
    start_run(&env, custom);
    start_run(&env, open);
    env.set_work_field(custom, "status", "deferred");
    env.set_work_field(custom, "priority", "0");
    env.set_work_field(open, "priority", "1");
    env.authorize_run(custom);
    env.authorize_run(open);
    env.set_scenario("implement", "hang", 1);

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "mixed admission tick: {tick}");
    wait_until("open peer provider start", || {
        provider_starts(&env, "implementation")
            .iter()
            .any(|start| start.starts_with(&format!("{open}/")))
    });

    let ledger = env.ledger();
    let decisions = ledger
        .latest_admission_decisions(Some(AdmissionSubjectKind::Run), None)
        .expect("run admission decisions")
        .into_iter()
        .filter(|decision| decision.subject_id == custom || decision.subject_id == open)
        .collect::<Vec<_>>();
    let custom_decision = decisions
        .iter()
        .find(|decision| decision.subject_id == custom)
        .expect("custom-status decision");
    assert_eq!(custom_decision.outcome, AdmissionOutcome::Deferred);
    assert_eq!(custom_decision.reason, AdmissionReason::WorkNotRunnable);
    let open_decision = decisions
        .iter()
        .find(|decision| decision.subject_id == open)
        .expect("open decision");
    assert_eq!(open_decision.outcome, AdmissionOutcome::Admitted);
    assert_eq!(open_decision.reason, AdmissionReason::CapacityAvailable);
    assert_eq!(
        custom_decision.batch_id, open_decision.batch_id,
        "both rows must be evaluated from one exact hydration batch"
    );
    ledger.close().expect("close ledger");

    let starts = provider_starts(&env, "implementation");
    assert!(
        starts
            .iter()
            .all(|start| start.starts_with(&format!("{open}/"))),
        "the custom-status row is retained but never runnable: {starts:?}"
    );
    // Batch identity above (`custom_decision.batch_id == open_decision.
    // batch_id`) is the real proof of one exact hydration batch.

    stop_run(&env, open);
    stop_run(&env, custom);
    no_live_reservations(&env);
}

#[test]
fn priority_update_repairs_a_priorityless_item_before_admission() {
    let env = TestEnv::new("adm-priority-update");
    let run = "adm-priority-update";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 1);
    env.set_work_field(run, "priority", "");

    let (code, before) = env.forged(&["work", "show", "--id", run]);
    assert_eq!(code, 0, "show priority-less work: {before}");
    assert_eq!(before["result"]["work"]["priority"], Value::Null);
    let (code, refused) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-priority-missing-submit",
    ]);
    assert_ne!(code, 0, "priority-less submit must refuse: {refused}");
    assert!(
        refused["error"]["message"]
            .as_str()
            .is_some_and(
                |message| message.contains("bead-malformed") && message.contains("priority")
            ),
        "field-naming admission refusal: {refused}"
    );
    assert_eq!(
        refused["error"]["detail"],
        json!({
            "schema": "forged.remedy/1",
            "verb": "work update",
            "args": {
                "id": run,
                "expectedRevision": null,
                "priority": null,
            },
            "reason": "set a priority with the current work revision before submitting again",
        })
    );
    let ledger = env.ledger();
    assert!(ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .is_none());
    ledger.close().expect("close ledger");
    let revision = before["result"]["work"]["revision"]
        .as_i64()
        .expect("ledger revision");
    let revision_arg = revision.to_string();
    let (code, repaired) = env.forged(&[
        "work",
        "update",
        "--id",
        run,
        "--expected-revision",
        &revision_arg,
        "--priority",
        "2",
    ]);
    assert_eq!(code, 0, "repair priority: {repaired}");
    assert_eq!(repaired["result"]["work"]["priority"], json!(2));
    assert_eq!(
        repaired["result"]["work"]["revision"],
        json!(revision),
        "priority repair must not mint a spec revision"
    );

    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-priority-update-submit",
    ]);
    assert_eq!(code, 0, "submit after priority repair: {submitted}");
    assert!(
        submitted["result"]["controller"].is_object(),
        "the repaired work item must admit immediately: {submitted}"
    );
    let ledger = env.ledger();
    let admitted = ledger
        .latest_admission_decisions(Some(AdmissionSubjectKind::Run), Some(run))
        .expect("run admission decision")
        .into_iter()
        .any(|decision| {
            decision.subject_id == run && decision.outcome == AdmissionOutcome::Admitted
        });
    ledger.close().expect("close ledger");
    assert!(
        admitted,
        "priority repair must clear WorkMalformed admission"
    );

    stop_run(&env, run);
    no_live_reservations(&env);
}

#[test]
fn submit_preflight_refuses_every_non_capacity_shape_family_with_a_remedy() {
    let blocked = TestEnv::new("adm-preflight-blocked");
    start_run(&blocked, "adm-preflight-blocked");
    blocked.set_work_field("adm-preflight-blocked", "status", "blocked");
    let (code, refusal) = blocked.forged(&["run", "submit", "--run", "adm-preflight-blocked"]);
    assert_ne!(code, 0, "blocked work must refuse: {refusal}");
    assert!(
        refusal["error"]["message"]
            .as_str()
            .is_some_and(
                |message| message.contains("bead-not-runnable") && message.contains("blocked")
            ),
        "status-naming refusal: {refusal}"
    );
    assert_eq!(refusal["error"]["detail"]["verb"], json!("work promote"));

    let closed = TestEnv::new("adm-preflight-closed");
    start_run(&closed, "adm-preflight-closed");
    closed.set_work_field("adm-preflight-closed", "status", "closed");
    let (code, refusal) = closed.forged(&["run", "submit", "--run", "adm-preflight-closed"]);
    assert_ne!(code, 0, "closed work must refuse: {refusal}");
    assert!(
        refusal["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("closed")),
        "status-naming refusal: {refusal}"
    );
    assert_eq!(refusal["error"]["detail"]["verb"], json!("work reopen"));

    let mismatch = TestEnv::new("adm-preflight-repository");
    start_run(&mismatch, "adm-preflight-repository");
    mismatch.set_work_repository("adm-preflight-repository", "/other/repository");
    let expected_repository = mismatch.repos.repo.to_string_lossy();
    let (code, refusal) = mismatch.forged(&["run", "submit", "--run", "adm-preflight-repository"]);
    assert_ne!(code, 0, "repository mismatch must refuse: {refusal}");
    let message = refusal["error"]["message"]
        .as_str()
        .expect("repository refusal message");
    assert!(message.contains("repository-mismatch"), "{refusal}");
    assert!(message.contains(expected_repository.as_ref()), "{refusal}");
    assert!(message.contains("/other/repository"), "{refusal}");
    assert_eq!(refusal["error"]["detail"]["verb"], json!("work update"));

    let unavailable = TestEnv::new("adm-preflight-unavailable");
    start_run(&unavailable, "adm-preflight-unavailable");
    rusqlite::Connection::open(unavailable.anvil.join("state.db"))
        .expect("open work ledger")
        .execute(
            "UPDATE runs SET bead_id = 'missing-work-item' WHERE run_id = ?1",
            ["adm-preflight-unavailable"],
        )
        .expect("remove run work identity");
    let (code, refusal) =
        unavailable.forged(&["run", "submit", "--run", "adm-preflight-unavailable"]);
    assert_ne!(code, 0, "unavailable work must refuse: {refusal}");
    assert!(
        refusal["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("bead-unavailable")
                && message.contains("missing-work-item")),
        "work-identity refusal: {refusal}"
    );
    assert_eq!(refusal["error"]["detail"]["verb"], json!("work show"));

    let roster = TestEnv::new("adm-preflight-roster");
    start_run(&roster, "adm-preflight-roster");
    rusqlite::Connection::open(roster.anvil.join("state.db"))
        .expect("open definition ledger")
        .execute(
            "UPDATE run_definitions SET package_json = '{}' WHERE run_id = ?1",
            ["adm-preflight-roster"],
        )
        .expect("remove provider/model launch facts");
    let (code, refusal) = roster.forged(&["run", "submit", "--run", "adm-preflight-roster"]);
    assert_ne!(code, 0, "missing launch facts must refuse: {refusal}");
    assert!(
        refusal["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("provider") && message.contains("model")),
        "roster-seam refusal: {refusal}"
    );
    assert_eq!(
        refusal["error"]["detail"]["verb"],
        json!("run revise-roster")
    );
}

#[test]
fn epic_submit_queues_without_controller_admission_preflight() {
    let env = TestEnv::new("adm-epic-preflight");
    let child_spec = env.spec.clone();
    start_epic(
        &env,
        "adm-epic-preflight",
        &[("adm-epic-preflight-child", child_spec.as_path(), true)],
    );
    env.set_work_field("adm-epic-preflight", "priority", "");
    let (code, queued) = env.forged(&["epic", "submit", "--epic", "adm-epic-preflight"]);
    assert_eq!(code, 0, "group authorization must queue: {queued}");
    assert_eq!(queued["result"]["phase"], json!("queued"));
    assert!(queued["result"]["controller"].is_null());
}

#[test]
fn capacity_saturation_still_authorizes_and_queues_submit() {
    let env = TestEnv::new("adm-preflight-capacity");
    set_admission(&env, 1, 8, 3);
    start_run(&env, "adm-preflight-capacity-target");
    fabricate_live_attempt(&env, "adm-preflight-capacity-holder");

    let (code, queued) = env.forged(&[
        "run",
        "submit",
        "--run",
        "adm-preflight-capacity-target",
        "--idempotency-key",
        "adm-preflight-capacity-submit",
    ]);
    assert_eq!(code, 0, "capacity saturation must queue: {queued}");
    assert_eq!(queued["result"]["submitted"], json!(true));
    assert_eq!(queued["result"]["queued"], json!(true));
    assert_eq!(queued["result"]["controller"], Value::Null);
    assert_eq!(
        queued["result"]["admission"]["reason"],
        json!("total-capacity")
    );
    let ledger = env.ledger();
    assert!(ledger
        .get_desired_work(DesiredSubjectKind::Run, "adm-preflight-capacity-target")
        .expect("desired query")
        .is_some());
    ledger.close().expect("close ledger");
}

#[test]
fn malformed_packet_facts_defer_without_reservation_or_provider_effect() {
    let env = TestEnv::new("adm-null");
    let run = "adm-null";
    start_run(&env, run);

    // Controller admission consumes the healthy row; the packet's own exact
    // admission read then finds it malformed (a NULL priority is the
    // WorkMalformed arm). The controller is frozen across the injection so
    // the two admissions cannot race.
    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-null-submit",
    ]);
    assert_eq!(code, 0, "submit: {submitted}");
    assert!(
        submitted["result"]["controller"].is_object(),
        "the healthy full row admits the controller: {submitted}"
    );
    let frozen = submitted["result"]["controller"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid");
    nix::sys::signal::killpg(
        nix::unistd::Pid::from_raw(frozen),
        nix::sys::signal::Signal::SIGSTOP,
    )
    .expect("freeze the controller before injecting malformed facts");
    env.set_work_field(run, "priority", "");
    nix::sys::signal::killpg(
        nix::unistd::Pid::from_raw(frozen),
        nix::sys::signal::Signal::SIGCONT,
    )
    .expect("resume the controller");
    wait_until("packet BeadMalformed decision", || {
        let ledger = env.ledger();
        let found = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Packet), None)
            .expect("packet admission decisions")
            .iter()
            .any(|decision| {
                decision.subject_id == format!("{run}/implementation/0")
                    && decision.outcome == AdmissionOutcome::Deferred
                    && decision.reason == AdmissionReason::WorkMalformed
            });
        ledger.close().expect("close ledger");
        found
    });
    assert!(
        env.provider_log().is_empty(),
        "revision-less packet admission must have zero provider effect"
    );

    // Only the capacity reason family parks. A WorkMalformed deferral never
    // clears by waiting, so the controller keeps the exit contract instead
    // of parking into a silent starve.
    let controller = submitted["result"]["controller"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("controller pid");
    wait_until("controller exits on the non-capacity deferral", || {
        !support::pid_alive(controller)
    });

    let ledger = env.ledger();
    let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
    assert!(snapshot.reservations.iter().all(|reservation| {
        reservation.subject_kind != AdmissionSubjectKind::Packet
            || reservation.subject_id != format!("{run}/implementation/0")
    }));
    ledger.close().expect("close ledger");

    stop_run(&env, run);
    no_live_reservations(&env);
}

#[test]
fn convergence_authorization_admission_and_fanout() {
    // Ready rows remain inert until the operator submits exactly once.
    let env = TestEnv::new("convergence-authorization");
    start_run(&env, "conv-one-submit");
    let (code, idle) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "unsubmitted supervisor tick: {idle}");
    assert_eq!(idle["result"]["considered"], json!(0));
    let ledger = env.ledger();
    assert!(ledger
        .get_desired_work(DesiredSubjectKind::Run, "conv-one-submit")
        .expect("desired query")
        .is_none());
    ledger.close().expect("close ledger");
    assert!(env.provider_log().is_empty());

    env.set_scenario("implement", "hang", 1);
    let submit_args = [
        "run",
        "submit",
        "--run",
        "conv-one-submit",
        "--idempotency-key",
        "convergence-one-submit",
    ];
    let (code, submitted) = env.forged(&submit_args);
    assert_eq!(code, 0, "submit: {submitted}");
    let (code, replayed) = env.forged(&submit_args);
    assert_eq!(code, 0, "submit replay: {replayed}");
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(
        replayed["result"]["controller"]["generation"],
        submitted["result"]["controller"]["generation"]
    );
    wait_until("the one authorized provider start", || {
        provider_starts(&env, "implementation").len() == 1
    });
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "conv-one-submit")
        .expect("desired query")
        .expect("one submitted desired row");
    assert_eq!(desired.control_revision, 1);
    assert_eq!(
        ledger
            .list_events(Some("conv-one-submit"), 0, 65_536)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        1
    );
    ledger.close().expect("close ledger");
    stop_run(&env, "conv-one-submit");
    no_live_reservations(&env);

    // Two independent children consume the exact two slots. The third has a
    // durable capacity wake; the dependency-constrained fourth is absent.
    let fanout = TestEnv::new("convergence-fanout");
    set_admission(&fanout, 2, 2, 3);
    let fanout_spec = fanout.spec.clone();
    start_epic(
        &fanout,
        "conv-fanout",
        &[
            ("conv-child-a", &fanout_spec, true),
            ("conv-child-b", &fanout_spec, true),
            ("conv-child-c", &fanout_spec, true),
            ("conv-child-dependent", &fanout_spec, false),
        ],
    );
    fanout.set_work_field("conv-child-a", "priority", "0");
    fanout.set_work_field("conv-child-b", "priority", "1");
    fanout.set_work_field("conv-child-c", "priority", "9");
    // Readiness is a store query now: the dependent child is withheld by a
    // real open blocker, not the retired `ready: false` flag.
    fanout.set_work_field(
        "conv-child-dependent",
        "dependencies",
        r#"[{"id":"conv-fanout-blocker","dependency_type":"blocks","status":"open"}]"#,
    );
    fanout.authorize_epic("conv-fanout");
    fanout.set_scenario("implement", "hang", 3);
    assert_eq!(fanout.reconcile_epic("conv-fanout").0, 0);
    let (code, dispatched) = fanout.reconcile_epic("conv-fanout");
    assert_eq!(code, 0, "fanout dispatch: {dispatched}");
    assert_eq!(
        dispatched["result"]["progress"]["launched"]
            .as_array()
            .map(Vec::len),
        Some(3),
        "the pass queues every independent child before admission: {dispatched}"
    );
    assert_eq!(fanout.reconcile_epic("conv-fanout").0, 0);
    wait_until("two admitted child attempts", || {
        provider_starts(&fanout, "implementation").len() == 2
    });
    std::thread::sleep(Duration::from_millis(400));
    let first_two = provider_starts(&fanout, "implementation");
    assert_eq!(first_two.len(), 2, "capacity fence: {first_two:?}");
    let provider_log = fanout.provider_log();
    assert!(
        first_two.iter().all(|start| {
            let packet = start.split_whitespace().next().expect("packet id");
            !provider_log
                .iter()
                .any(|line| line.starts_with(packet) && line.contains(" end "))
        }),
        "both independent children are simultaneously inside their provider intervals: {provider_log:?}"
    );

    let ledger = fanout.ledger();
    assert_eq!(
        ledger
            .list_live_attempts(None)
            .expect("live attempts")
            .into_iter()
            .filter(|attempt| attempt.packet_id.contains("/implementation/0"))
            .count(),
        2,
        "the durable attempt rows agree with the overlapping effect log"
    );
    let decisions = ledger
        .latest_admission_decisions(None, None)
        .expect("admission decisions")
        .into_iter()
        .filter(|decision| {
            decision.subject_id.starts_with("conv-child-")
                && (decision.subject_kind == AdmissionSubjectKind::Run
                    || decision.subject_id.ends_with("/implementation/0"))
        })
        .collect::<Vec<_>>();
    assert_eq!(
        decisions
            .iter()
            .filter(|decision| {
                decision.subject_kind == AdmissionSubjectKind::Packet
                    && decision.outcome == AdmissionOutcome::Admitted
            })
            .count(),
        2,
        "two admitted packet decisions: {decisions:?}"
    );
    let deferred = decisions
        .iter()
        .find(|decision| {
            decision.outcome == AdmissionOutcome::Deferred
                && decision.subject_id.starts_with("conv-child-")
        })
        .expect("capacity-deferred third child");
    assert!(deferred.next_eligible_wake_at.is_some());
    assert!(!ledger
        .list_runs()
        .expect("runs")
        .iter()
        .any(|run| run.run_id == "conv-child-dependent"));
    let epic_events = ledger
        .list_events(Some("conv-fanout"), 0, 65_536)
        .expect("epic events");
    assert!(epic_events
        .iter()
        .all(|event| event.kind != "forged.epic.wave.started"));
    ledger.close().expect("close ledger");

    let first = first_two[0].split('/').next().expect("child id").to_owned();
    stop_run(&fanout, &first);
    std::thread::sleep(Duration::from_millis(1_100));
    wait_until("deferred child durable wake", || {
        let _ = fanout.reconcile_epic("conv-fanout");
        provider_starts(&fanout, "implementation").len() == 3
    });
    let starts = provider_starts(&fanout, "implementation");
    let started_children = starts
        .iter()
        .filter_map(|line| line.split('/').next())
        .collect::<BTreeSet<_>>();
    assert_eq!(
        started_children.len(),
        3,
        "all independent children: {starts:?}"
    );
    for child in started_children {
        support::assert_no_overlap(&fanout.provider_log(), &format!("{child}/implementation/0"));
        if child != first {
            stop_run(&fanout, child);
        }
    }
    no_live_reservations(&fanout);

    // A one-slot epic proves integration and GitHub effects are serialized.
    let serial = TestEnv::new("convergence-serialized-integration");
    set_admission(&serial, 8, 1, 1);
    let serial_spec = serial.spec.clone();
    start_epic(
        &serial,
        "conv-serial",
        &[
            ("conv-serial-a", &serial_spec, true),
            ("conv-serial-b", &serial_spec, true),
        ],
    );
    serial.authorize_epic("conv-serial");
    let (code, driven) = serial.drive_epic_to_stop("conv-serial");
    assert_eq!(code, 0, "serialized epic: {driven}");
    assert!(driven["result"]["stopped"]["finalPr"].is_object());
    let calls = serial.gh_calls();
    let merges = calls
        .iter()
        .enumerate()
        .filter(|(_, call)| {
            call.first().is_some_and(|arg| arg == "pr")
                && call.get(1).is_some_and(|arg| arg == "merge")
        })
        .map(|(index, _)| index)
        .collect::<Vec<_>>();
    let creates = calls
        .iter()
        .enumerate()
        .filter(|(_, call)| {
            call.iter().any(|arg| arg.contains("/pulls")) && call.iter().any(|arg| arg == "POST")
        })
        .map(|(index, _)| index)
        .collect::<Vec<_>>();
    assert_eq!(
        merges.len(),
        2,
        "one integration merge per child: {calls:?}"
    );
    assert_eq!(
        creates.len(),
        3,
        "two child PRs and one final PR: {calls:?}"
    );
    assert!(
        merges.iter().all(|index| *index < *creates.last().unwrap()),
        "final PR follows both serialized child merges: {calls:?}"
    );
    no_live_reservations(&serial);
}

#[test]
fn convergence_attempt_evidence_is_complete() {
    // A transient provider failure retries in place. Every failed and
    // completed attempt gets a distinct immutable manifest accepted by the
    // public verifier.
    let retry = TestEnv::new("convergence-attempt-evidence-retry");
    set_config(&retry, |config| config["transport_retry_budget"] = json!(1));
    start_run(&retry, "conv-evidence-retry");
    retry.authorize_run("conv-evidence-retry");
    retry.set_scenario("implement", "rate-limit", 1);
    for _ in 0..8 {
        let (code, advanced) = retry.forged(&["run", "advance", "--run", "conv-evidence-retry"]);
        assert_eq!(code, 0, "advance retry fixture: {advanced}");
        let ledger = retry.ledger();
        let has_retry = ledger
            .list_events(Some("conv-evidence-retry"), 0, 65_536)
            .expect("events")
            .iter()
            .any(|event| event.kind == "proto.retry");
        ledger.close().expect("close ledger");
        if has_retry {
            break;
        }
    }
    expire_latest_retry(&retry, "conv-evidence-retry");
    let (code, driven) = retry.forged(&["run", "drive", "--run", "conv-evidence-retry"]);
    assert_eq!(code, 0, "drive retry fixture: {driven}");
    let implementation = attempts_for(&retry, "conv-evidence-retry")
        .into_iter()
        .filter(|attempt| attempt.packet_id == "conv-evidence-retry/implementation/0")
        .collect::<Vec<_>>();
    assert_eq!(
        implementation.len(),
        2,
        "one failed attempt and one successor"
    );
    assert_eq!(implementation[0].state, AttemptState::Failed);
    assert_eq!(implementation[1].state, AttemptState::Completed);
    assert_ne!(implementation[0].attempt_id, implementation[1].attempt_id);
    let ledger = retry.ledger();
    assert_eq!(
        ledger
            .list_events(Some("conv-evidence-retry"), 0, 65_536)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "proto.retry")
            .count(),
        1,
        "the failed attempt has exactly one durable retry edge"
    );
    ledger.close().expect("close ledger");
    assert_terminal_artifacts(
        &retry,
        "conv-evidence-retry",
        &[AttemptState::Failed, AttemptState::Completed],
    );
    no_live_reservations(&retry);

    // Attempt-scoped stop is a separate terminal class. The provider driver
    // remains alive long enough to freeze its private output before its stale
    // settlement is rejected.
    let stopped = TestEnv::new("convergence-attempt-evidence-stopped");
    start_run(&stopped, "conv-evidence-stopped");
    stopped.authorize_run("conv-evidence-stopped");
    stopped.set_scenario("implement", "hang", 1);
    let driver = stopped
        .forged_cmd(&["run", "drive", "--run", "conv-evidence-stopped"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("stopped-attempt driver");
    wait_until("stoppable provider attempt", || {
        !provider_starts(&stopped, "implementation").is_empty()
    });
    wait_until("provider start-time identity", || {
        stopped
            .latest_attempt_dir("conv-evidence-stopped", "implementation", 0)
            .is_some_and(|dir| dir.join("provider.lstart").exists())
    });
    let attempt_id = {
        let ledger = stopped.ledger();
        let attempt = ledger
            .list_live_attempts(Some("conv-evidence-stopped"))
            .expect("live attempts")
            .into_iter()
            .next()
            .expect("live attempt");
        ledger.close().expect("close ledger");
        attempt.attempt_id
    };
    let (code, response) = stopped.forged(&[
        "session",
        "stop",
        "--attempt",
        &attempt_id.to_string(),
        "--reason",
        "convergence evidence fixture",
    ]);
    assert_eq!(code, 0, "session stop: {response}");
    let _ = driver.wait_with_output().expect("stopped driver exits");
    wait_until("stopped attempt manifest", || {
        let ledger = stopped.ledger();
        let joined = ledger
            .get_attempt_artifact(attempt_id)
            .expect("artifact lookup")
            .is_some();
        ledger.close().expect("close ledger");
        joined
    });
    assert_terminal_artifacts(&stopped, "conv-evidence-stopped", &[AttemptState::Stopped]);
    stop_run(&stopped, "conv-evidence-stopped");
    no_live_reservations(&stopped);
}

#[test]
fn convergence_review_and_attention_are_bounded() {
    let reviews = TestEnv::new("convergence-review-budget");
    assert_eq!(reviews.forged(&["init"]).0, 0);
    set_config(&reviews, |config| {
        config["profiles"] = json!({
            "standard": {
                "schema": "forged.profile/1",
                "name": "standard",
                "protocol": {"name": "slice", "version": 1},
                "seats": [
                    {"id": "implementation", "role": "implementation", "purpose": "implement"},
                    {"id": "review-1", "role": "review.primary", "purpose": "review"},
                    {"id": "remediation", "role": "remediation", "purpose": "fix"}
                ],
                "riskContext": "Hermetic convergence fixture.",
                "fixRoundBudget": 2,
                "escalateOn": []
            }
        });
    });
    reviews.set_scenario("reviewclaude", "request-changes", 3);
    let repo = reviews.repos.repo.to_string_lossy().into_owned();
    let spec = reviews.spec.to_string_lossy().into_owned();
    reviews.seed_frontier("conv-review-budget");
    let (code, started) = reviews.forged(&[
        "run",
        "start",
        "--work",
        "conv-review-budget",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start review budget: {started}");
    reviews.authorize_run("conv-review-budget");
    let (code, driven) = reviews.forged(&["run", "drive", "--run", "conv-review-budget"]);
    assert_eq!(code, 0, "drive review budget: {driven}");
    assert_eq!(
        driven["result"]["terminal"]["reviewBudgetExhausted"],
        json!({"reviewRounds": 3, "finalVerdict": "requestChanges"})
    );
    let starts = reviews
        .provider_log()
        .into_iter()
        .filter(|line| line.contains(" start "))
        .collect::<Vec<_>>();
    assert_eq!(
        starts
            .iter()
            .filter(|line| line.contains("/review-1/"))
            .count(),
        3
    );
    assert_eq!(
        starts
            .iter()
            .filter(|line| line.contains("/remediation/"))
            .count(),
        2
    );
    let before_replay = starts.len();
    let (code, terminal_replay) = reviews.forged(&["run", "drive", "--run", "conv-review-budget"]);
    assert_eq!(code, 0, "terminal replay: {terminal_replay}");
    assert_eq!(
        reviews
            .provider_log()
            .iter()
            .filter(|line| line.contains(" start "))
            .count(),
        before_replay,
        "no successor packet appears after exact exhaustion"
    );
    let ledger = reviews.ledger();
    assert_eq!(ledger.list_runs().expect("runs").len(), 1);
    ledger.close().expect("close ledger");
    no_live_reservations(&reviews);

    // Exhaust the supervisor restart budget through the real atomic ledger
    // methods. The fourth reservation emits one attention occurrence and
    // makes later ticks inert.
    let attention = TestEnv::new("convergence-restart-attention");
    start_run(&attention, "conv-restart-attention");
    let ledger = attention.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, "conv-restart-attention", 0)
        .expect("authorize desired run");
    ledger.close().expect("close ledger");
    let exhausted_before = exhaust_restart_budget(&attention, "conv-restart-attention");
    let restart_budget = exhausted_before.restart_budget;
    let ledger = attention.ledger();
    let attention_events_before = ledger
        .list_events(Some("conv-restart-attention"), 0, 65_536)
        .expect("events")
        .into_iter()
        .filter(|event| {
            event.kind == "forged.supervisor.attention"
                && event.payload_json.contains("restart-budget-exhausted")
        })
        .count();
    assert_eq!(attention_events_before, 1);
    ledger.close().expect("close ledger");

    for _ in 0..3 {
        let (code, tick) = attention.forged(&["supervise", "--once"]);
        assert_eq!(code, 0, "post-exhaustion tick: {tick}");
    }
    let ledger = attention.ledger();
    let exhausted_after = ledger
        .get_desired_work(DesiredSubjectKind::Run, "conv-restart-attention")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(exhausted_after.restart_used, exhausted_before.restart_used);
    assert_eq!(exhausted_after.updated_at, exhausted_before.updated_at);
    assert_eq!(
        ledger
            .list_events(Some("conv-restart-attention"), 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| {
                event.kind == "forged.supervisor.attention"
                    && event.payload_json.contains("restart-budget-exhausted")
            })
            .count(),
        1,
        "exhaustion attention is a singleton"
    );
    ledger.close().expect("close ledger");
    let (code, overview) = attention.forged(&["overview", "--detail", "full"]);
    assert_eq!(code, 0, "attention overview: {overview}");
    let items = overview["result"]["attention"]
        .as_array()
        .expect("attention array");
    assert_eq!(
        items
            .iter()
            .filter(|item| item["condition"] == json!("restart-budget-exhausted"))
            .count(),
        1
    );
    let exhausted_item = items
        .iter()
        .find(|item| item["condition"] == json!("restart-budget-exhausted"))
        .expect("restart exhaustion item");
    assert_eq!(exhausted_item["owner"], json!("human"));
    assert_eq!(
        exhausted_item["recommendedAction"]["code"],
        json!("reauthorize-work")
    );
    assert_eq!(
        exhausted_item["evidence"]["restartBudget"],
        json!(restart_budget)
    );
    assert_eq!(
        exhausted_item["evidence"]["restartUsed"],
        json!(restart_budget)
    );
    assert_eq!(
        exhausted_item["evidence"]["controlRevision"],
        json!(exhausted_before.control_revision)
    );
    assert_eq!(exhausted_item["evidence"]["outcome"], json!("exhausted"));
    assert_eq!(
        exhausted_item["evidenceRefs"],
        json!([{"kind": "desired-work", "id": "run:conv-restart-attention"}])
    );

    let attention_id = exhausted_item["attentionId"]
        .as_str()
        .expect("stable attention id")
        .to_owned();
    let occurrence_id = exhausted_item["occurrenceId"]
        .as_str()
        .expect("attention occurrence id")
        .to_owned();
    let (code, stable_overview) = attention.forged(&["overview", "--detail", "full"]);
    assert_eq!(code, 0, "stable attention overview: {stable_overview}");
    let stable_item = stable_overview["result"]["attention"]
        .as_array()
        .expect("attention array")
        .iter()
        .find(|item| item["condition"] == json!("restart-budget-exhausted"))
        .expect("stable restart exhaustion item");
    assert_eq!(stable_item["attentionId"], json!(attention_id));
    assert_eq!(stable_item["occurrenceId"], json!(occurrence_id));

    attention.authorize_run("conv-restart-attention");
    let recurrent = exhaust_restart_budget(&attention, "conv-restart-attention");
    assert!(recurrent.control_revision > exhausted_before.control_revision);
    let (code, recurrent_overview) = attention.forged(&["overview", "--detail", "full"]);
    assert_eq!(
        code, 0,
        "recurrent attention overview: {recurrent_overview}"
    );
    let recurrent_item = recurrent_overview["result"]["attention"]
        .as_array()
        .expect("attention array")
        .iter()
        .find(|item| item["condition"] == json!("restart-budget-exhausted"))
        .expect("recurrent restart exhaustion item");
    assert_eq!(recurrent_item["attentionId"], json!(attention_id));
    assert_ne!(recurrent_item["occurrenceId"], json!(occurrence_id));
    no_live_reservations(&attention);
}
