#![cfg(feature = "failpoints")]

//! Failpoint-only convergence process fixtures.

mod support;

use std::process::Stdio;

use forged_ledger::{AttemptState, DesiredReconcileOutcome, DesiredState, DesiredSubjectKind};
use forged_types::{AdmissionOutcome, AdmissionReason, AdmissionSubjectKind};
use nix::sys::signal::{kill, Signal};
use nix::unistd::Pid;
use serde_json::json;
use support::convergence::*;
use support::TestEnv;

/// The park contract (beads-ntc.15): a sibling holding the one
/// repository-write slot defers the run's remediation claim, and the
/// deferred controller parks — bounded wake, re-project, retry — instead of
/// exiting into a supervisor recycle that charged restart budget and killed
/// live seats.
#[cfg(feature = "failpoints")]
#[test]
fn capacity_deferral_parks_the_controller_instead_of_recycling() {
    let env = TestEnv::new("adm-park");
    set_admission(&env, 8, 1, 3);
    let parked = "adm-park-deferred";
    let holder = "adm-park-holder";
    start_run(&env, parked);
    start_run(&env, holder);

    // Hold the parked run's one review seat open so the fixture can seize
    // the repository-write slot deterministically before remediation claims.
    env.set_scenario("reviewclaude", "wait-release", 1);
    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        parked,
        "--idempotency-key",
        "adm-park-deferred-submit",
    ]);
    assert_eq!(code, 0, "parked submit: {submitted}");
    let parked_pid = controller_pid(&submitted);
    wait_until("parked run held inside its review seat", || {
        provider_starts(&env, "review-1")
            .iter()
            .any(|line| line.starts_with(&format!("{parked}/")))
    });

    // The fixture takes the one repository-write slot and stays inside it.
    env.set_scenario("implement", "hang", 1);
    let (code, held) = env.forged(&[
        "run",
        "submit",
        "--run",
        holder,
        "--idempotency-key",
        "adm-park-holder-submit",
    ]);
    assert_eq!(code, 0, "holder submit: {held}");
    wait_until("holder inside the write slot", || {
        provider_starts(&env, "implementation")
            .iter()
            .any(|line| line.starts_with(&format!("{holder}/")))
    });

    // Release the review: remediation opens, claims, and defers on the held
    // slot. The controller must park across repeated deferral wakes.
    env.release_stage("reviewclaude");
    let packet = format!("{parked}/remediation/0");
    wait_until("first durable capacity deferral", || {
        deferred_decisions(&env, &packet) >= 1
    });
    let window_start: Vec<(i64, AttemptState)> = attempts_for(&env, parked)
        .into_iter()
        .map(|attempt| (attempt.attempt_id, attempt.state))
        .collect();
    assert!(
        !window_start.is_empty(),
        "the parked controller carries settled seats into the deferral window"
    );
    wait_until("repeated deferral wakes without recycling", || {
        deferred_decisions(&env, &packet) >= 4
    });
    assert!(
        support::pid_alive(parked_pid),
        "the deferred controller must stay alive, not exit into a recycle"
    );

    // A due supervisor pass adopts the parked live controller and charges
    // nothing: generation and restart budget stay untouched, and no durable
    // pane cleanup is enqueued for the run's ownership rows.
    let ledger = env.ledger();
    let before = ledger
        .get_desired_work(DesiredSubjectKind::Run, parked)
        .expect("desired query")
        .expect("parked desired row");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            parked,
            DesiredState::Running,
            DesiredReconcileOutcome::Adopted,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make the parked row due");
    ledger.close().expect("close ledger");
    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "supervisor tick over a parked controller: {tick}");
    let ledger = env.ledger();
    let after = ledger
        .get_desired_work(DesiredSubjectKind::Run, parked)
        .expect("desired query")
        .expect("parked desired row");
    ledger.close().expect("close ledger");
    assert_eq!(after.restart_used, 0, "parking must not charge restarts");
    assert_eq!(
        after.controller_generation, before.controller_generation,
        "parking must not recycle the controller generation"
    );
    assert!(after.exhausted_at.is_none());
    assert!(
        support::pid_alive(parked_pid),
        "the adopted parked controller survives the supervisor pass"
    );
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open hermetic ownership ledger");
    let cleanup_requested: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM owned_herdr_sessions WHERE cleanup_state != 'not-requested'",
            [],
            |row| row.get(0),
        )
        .expect("count pane cleanup requests");
    assert_eq!(cleanup_requested, 0, "no pane cleanup may be enqueued");

    // Existing seats are untouched across the deferral window: no attempt
    // row of the parked run moved through failed/reclaimed, and the slot
    // holder's live seat kept running.
    let window_end: Vec<(i64, AttemptState)> = attempts_for(&env, parked)
        .into_iter()
        .map(|attempt| (attempt.attempt_id, attempt.state))
        .collect();
    assert_eq!(
        window_start, window_end,
        "the parked run's attempt rows must not transition during the window"
    );
    assert!(window_end
        .iter()
        .all(|(_, state)| !matches!(state, AttemptState::Failed | AttemptState::Reclaimed)));
    assert!(attempts_for(&env, holder)
        .iter()
        .any(|attempt| attempt.state == AttemptState::Running));

    // While parked, run status carries the typed deferral reason, and the
    // crossed wake threshold surfaces one deduplicated attention entry.
    let (code, status) = env.forged(&["run", "status", "--run", parked]);
    assert_eq!(code, 0, "parked run status: {status}");
    let admission = status["result"]["run"]["admission"]
        .as_array()
        .expect("run status admission facts");
    let remediation = admission
        .iter()
        .find(|decision| decision["packetId"] == json!(packet))
        .unwrap_or_else(|| panic!("remediation admission fact: {status}"));
    assert_eq!(remediation["outcome"], json!("deferred"), "{status}");
    assert_eq!(
        remediation["reason"],
        json!("repository-write-capacity"),
        "{status}"
    );
    let (code, listed) = env.forged(&["overview", "--detail", "full"]);
    assert_eq!(code, 0, "overview: {listed}");
    let parked_items = listed["result"]["attention"]
        .as_array()
        .expect("attention items")
        .iter()
        .filter(|item| {
            item["id"] == json!(parked) && item["condition"] == json!("admission-deferred")
        })
        .cloned()
        .collect::<Vec<_>>();
    assert_eq!(parked_items.len(), 1, "one deduplicated entry: {listed}");
    assert!(
        parked_items[0]["detail"]
            .as_str()
            .is_some_and(|detail| detail.contains("repository-write-capacity")),
        "the entry names the admission reason: {parked_items:?}"
    );

    // Releasing the slot admits the deferred packet: it is claimed, its
    // attempt row exists, and the attention entry clears through the admit.
    stop_run(&env, holder);
    wait_until("deferred packet admitted and claimed", || {
        let ledger = env.ledger();
        let admitted = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Packet), Some(packet.as_str()))
            .expect("latest packet decision")
            .into_iter()
            .any(|decision| decision.outcome == AdmissionOutcome::Admitted);
        ledger.close().expect("close ledger");
        admitted
            && attempts_for(&env, parked)
                .iter()
                .any(|attempt| attempt.packet_id == packet)
    });
    let (code, cleared) = env.forged(&["overview", "--detail", "full"]);
    assert_eq!(code, 0, "post-admit overview: {cleared}");
    assert!(
        cleared["result"]["attention"]
            .as_array()
            .expect("attention items")
            .iter()
            .all(|item| {
                item["id"] != json!(parked) || item["condition"] != json!("admission-deferred")
            }),
        "the admit is the domain transition that clears the entry: {cleared}"
    );

    // The released run drives itself to completion; nothing leaks capacity.
    wait_until("parked run completes after release", || {
        let (_, status) = env.forged(&["run", "status", "--run", parked]);
        status["result"]["run"]["outcome"] == json!("clean")
    });
    no_live_reservations(&env);
}

/// The park contract under review fan-out (beads-ntc.15): an external seat
/// claims the larger-id review sibling inside the smaller sibling's
/// transport-retry window, so the re-claim defers on TotalCapacity while a
/// seat of the SAME run is live. The parked controller must hold across the
/// deferral and supervisor window without recycling, and the live sibling's
/// attempt row must survive it untouched — still completable under its
/// original claim token.
#[cfg(feature = "failpoints")]
#[test]
fn capacity_deferral_parks_while_a_sibling_seat_runs() {
    let env = TestEnv::new("adm-park-fan");
    set_admission(&env, 1, 1, 3);
    let run = "adm-park-fan";
    env.seed_frontier(run);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        run,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "high",
    ]);
    assert_eq!(code, 0, "run start {run}: {started}");

    // review-1's first claim fails on transport, granting the bounded retry
    // window this fixture uses to seize the one admission slot out of claim
    // order before the deterministic min-packet-id re-claim.
    env.set_scenario("reviewclaude", "rate-limit", 1);
    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "adm-park-fan-submit",
    ]);
    assert_eq!(code, 0, "submit: {submitted}");
    let controller = controller_pid(&submitted);
    let deferred_packet = format!("{run}/review-1/0");
    let live_packet = format!("{run}/review-2/0");
    wait_until("review-1 transport-failed and re-claimable", || {
        attempts_for(&env, run).iter().any(|attempt| {
            attempt.packet_id == deferred_packet && attempt.state == AttemptState::Failed
        })
    });

    // The external seat claims the larger-id sibling and stays inside it,
    // holding the single totalActive slot open across the park.
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &live_packet]);
    assert_eq!(code, 0, "external sibling claim: {claimed}");
    let live_attempt = claimed["result"]["attempt_id"]
        .as_i64()
        .expect("external attempt id");
    let live_token = claimed["result"]["claim_token"]
        .as_str()
        .expect("external claim token")
        .to_owned();

    // The retry deadline passes, the re-claim defers on the held slot, and
    // the controller parks with its sibling seat live.
    wait_until("first durable capacity deferral", || {
        deferred_decisions(&env, &deferred_packet) >= 1
    });
    let ledger = env.ledger();
    let decision = ledger
        .latest_admission_decisions(
            Some(AdmissionSubjectKind::Packet),
            Some(deferred_packet.as_str()),
        )
        .expect("latest sibling decision")
        .pop()
        .expect("deferred sibling decision");
    ledger.close().expect("close ledger");
    assert_eq!(decision.outcome, AdmissionOutcome::Deferred);
    assert_eq!(decision.reason, AdmissionReason::TotalCapacity);
    let window_start: Vec<(i64, AttemptState)> = attempts_for(&env, run)
        .into_iter()
        .map(|attempt| (attempt.attempt_id, attempt.state))
        .collect();
    assert!(
        window_start.contains(&(live_attempt, AttemptState::Running)),
        "the parked run carries one LIVE seat into the deferral window: {window_start:?}"
    );
    wait_until("repeated deferral wakes without recycling", || {
        deferred_decisions(&env, &deferred_packet) >= 4
    });
    assert!(
        support::pid_alive(controller),
        "the deferred controller must stay alive, not exit into a recycle"
    );

    // A due supervisor pass adopts the parked live controller and charges
    // nothing: generation and restart budget stay untouched, no durable pane
    // cleanup is enqueued, and the live sibling attempt does not move.
    let ledger = env.ledger();
    let before = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("parked desired row");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Adopted,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make the parked row due");
    ledger.close().expect("close ledger");
    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "supervisor tick over a parked controller: {tick}");
    let ledger = env.ledger();
    let after = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("parked desired row");
    ledger.close().expect("close ledger");
    assert_eq!(after.restart_used, 0, "parking must not charge restarts");
    assert_eq!(
        after.controller_generation, before.controller_generation,
        "parking must not recycle the controller generation"
    );
    assert!(after.exhausted_at.is_none());
    assert!(
        support::pid_alive(controller),
        "the adopted parked controller survives the supervisor pass"
    );
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open hermetic ownership ledger");
    let cleanup_requested: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM owned_herdr_sessions WHERE cleanup_state != 'not-requested'",
            [],
            |row| row.get(0),
        )
        .expect("count pane cleanup requests");
    assert_eq!(cleanup_requested, 0, "no pane cleanup may be enqueued");
    let window_end: Vec<(i64, AttemptState)> = attempts_for(&env, run)
        .into_iter()
        .map(|attempt| (attempt.attempt_id, attempt.state))
        .collect();
    assert_eq!(
        window_start, window_end,
        "the parked run's attempt rows must not transition during the window"
    );
    assert!(
        window_end.contains(&(live_attempt, AttemptState::Running)),
        "the live sibling seat survives the deferral and supervisor window: {window_end:?}"
    );

    // The surviving claim token still lands: the seat was never reclaimed or
    // fenced out while its run was parked. Landing frees the slot, the
    // deferred sibling admits, and the run drives itself to completion.
    let result_path = env.root.join("review-2-result.json");
    std::fs::write(
        &result_path,
        json!({
            "schema": "forged.result.review/1",
            "packetId": live_packet,
            "outcome": {"review": {
                "verdict": "approve",
                "summary": "external sibling review",
                "findings": [],
                "available": true,
            }},
        })
        .to_string(),
    )
    .expect("write external review result");
    let (code, landed) = env.forged(&[
        "packet",
        "complete",
        "--packet",
        &live_packet,
        "--attempt",
        &live_attempt.to_string(),
        "--claim-token",
        &live_token,
        "--result",
        &result_path.to_string_lossy(),
    ]);
    assert_eq!(code, 0, "external completion after the window: {landed}");
    assert_eq!(landed["result"]["outcome"], json!("Landed"), "{landed}");
    wait_until("deferred sibling admitted after the release", || {
        let ledger = env.ledger();
        let admitted = ledger
            .latest_admission_decisions(
                Some(AdmissionSubjectKind::Packet),
                Some(deferred_packet.as_str()),
            )
            .expect("latest sibling decision")
            .into_iter()
            .any(|decision| decision.outcome == AdmissionOutcome::Admitted);
        ledger.close().expect("close ledger");
        admitted
    });
    wait_until("parked run completes after release", || {
        let (_, status) = env.forged(&["run", "status", "--run", run]);
        status["result"]["run"]["outcome"] == json!("clean")
    });
    no_live_reservations(&env);
}

#[cfg(feature = "failpoints")]
#[test]
fn convergence_crash_matrix_is_effect_exact() {
    // The three new admission seams converge to one owned effect and release
    // every superseded reservation.
    for (suffix, site, committed, owner) in [
        ("before", "admission.batch.commit.before", false, None),
        ("after", "admission.batch.commit.after", true, None),
        (
            "transfer",
            "admission.reservation.transfer.after",
            true,
            Some("controller"),
        ),
    ] {
        let run = format!("conv-admission-{suffix}");
        let env = TestEnv::new(&run);
        start_run(&env, &run);
        env.set_scenario("implement", "hang", 1);
        let status = env
            .forged_cmd(&["run", "submit", "--run", &run])
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing submitter");
        assert!(!status.success(), "{site} must crash");
        let ledger = env.ledger();
        let decisions = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Run), Some(&run))
            .expect("admission decisions");
        let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
        ledger.close().expect("close ledger");
        assert_eq!(!decisions.is_empty(), committed, "{site}: {decisions:?}");
        if committed {
            let reservation = snapshot
                .reservations
                .iter()
                .find(|reservation| reservation.subject_id == run)
                .expect("committed reservation survives crash");
            assert_eq!(reservation.owner_kind.as_deref(), owner, "{site}");
            if site == "admission.reservation.transfer.after" {
                assert_eq!(
                    snapshot.capacity.total_active, 1,
                    "controller transfer crash retains exactly one admission slot"
                );
            }
        } else {
            assert!(snapshot
                .reservations
                .iter()
                .all(|reservation| reservation.subject_id != run));
        }

        let (code, replayed) = env.forged(&["run", "submit", "--run", &run]);
        assert_eq!(code, 0, "replay {site}: {replayed}");
        wait_until(&format!("one provider start after {site}"), || {
            provider_starts(&env, "implementation").len() == 1
        });
        let ledger = env.ledger();
        assert_eq!(
            ledger
                .list_events(Some(&run), 0, 65_536)
                .expect("events")
                .iter()
                .filter(|event| event.kind == "forged.controller.started")
                .count(),
            1,
            "{site} replay creates one controller"
        );
        ledger.close().expect("close ledger");
        stop_run(&env, &run);
        no_live_reservations(&env);
    }

    // The same boundaries also fence packet admission. Before transfer no
    // attempt exists; after transfer the dead claimant is reclaimed before
    // the one provider-visible successor starts.
    for (suffix, site, committed, transferred) in [
        ("before", "admission.batch.commit.before", false, false),
        ("after", "admission.batch.commit.after", true, false),
        (
            "transfer",
            "admission.reservation.transfer.after",
            true,
            true,
        ),
    ] {
        let run = format!("conv-packet-admission-{suffix}");
        let env = TestEnv::new(&run);
        start_run(&env, &run);
        env.authorize_run(&run);
        let status = env
            .forged_cmd(&["run", "drive", "--run", &run])
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing packet driver");
        assert!(!status.success(), "packet {site} must crash");
        assert!(provider_starts(&env, "implementation").is_empty());
        let ledger = env.ledger();
        let decisions = ledger
            .latest_admission_decisions(Some(AdmissionSubjectKind::Packet), None)
            .expect("packet decisions");
        assert_eq!(!decisions.is_empty(), committed, "packet {site}");
        let live = ledger
            .list_live_attempts(Some(&run))
            .expect("live attempts");
        assert_eq!(!live.is_empty(), transferred, "packet {site}: {live:?}");
        if transferred {
            let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
            assert_eq!(
                snapshot.capacity.total_active, 1,
                "packet transfer crash retains exactly one admission slot"
            );
            ledger
                .assert_admitted_attempt_live(&live[0].claim_token)
                .expect("transferred packet remains authorized before reconciliation");
        }
        ledger.close().expect("close ledger");
        if transferred {
            let (code, reconciled) = env.forged(&["reconcile", "--run", &run]);
            assert_eq!(code, 0, "reconcile packet transfer: {reconciled}");
            assert!(reconciled["result"]["report"]["reclaimed"]
                .as_array()
                .is_some_and(|items| !items.is_empty()));
        }
        let (code, driven) = env.forged(&["run", "drive", "--run", &run]);
        assert_eq!(code, 0, "packet replay {site}: {driven}");
        assert_eq!(provider_starts(&env, "implementation").len(), 1);
        no_live_reservations(&env);
    }

    // A controller identity recorded before the submitter dies is adopted by
    // replay. The detached effect and its durable event remain singleton.
    let handoff = TestEnv::new("convergence-controller-record");
    start_run(&handoff, "conv-controller-record");
    handoff.set_scenario("implement", "hang", 1);
    let status = handoff
        .forged_cmd(&["run", "submit", "--run", "conv-controller-record"])
        .env("FORGED_FAILPOINT", "controller.record.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("crashing controller submitter");
    assert!(!status.success());
    assert!(handoff
        .anvil
        .join("runs/conv-controller-record/controller/controller.json")
        .exists());
    let (code, recovered) = handoff.forged(&["run", "submit", "--run", "conv-controller-record"]);
    assert_eq!(code, 0, "recover recorded controller: {recovered}");
    wait_until("one provider under the adopted controller", || {
        provider_starts(&handoff, "implementation").len() == 1
    });
    let ledger = handoff.ledger();
    assert_eq!(
        ledger
            .list_events(Some("conv-controller-record"), 0, 65_536)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        1
    );
    ledger.close().expect("close ledger");
    stop_run(&handoff, "conv-controller-record");
    no_live_reservations(&handoff);

    // Provider spawn has two different response-loss shapes. Before the
    // spawn, replay adopts the already-claimed attempt and proves no provider
    // ran under a second claim.
    // After the spawn, the first local provider is allowed to finish before
    // recovery, so any successor is serialized and the repository effect is
    // still singular.
    for (suffix, site, starts_at_crash) in [
        ("before", "provider.spawn.before", 0),
        ("after", "provider.spawn.after", 1),
    ] {
        let run = format!("conv-provider-spawn-{suffix}");
        let env = TestEnv::new(&run);
        start_run(&env, &run);
        env.authorize_run(&run);
        let status = env
            .forged_cmd(&["run", "drive", "--run", &run])
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing provider driver");
        assert!(!status.success(), "{site} must crash");
        let mut expected_states = vec![AttemptState::Completed];
        if starts_at_crash == 0 {
            assert!(provider_starts(&env, "implementation").is_empty());
        } else {
            wait_until("post-spawn provider completion", || {
                env.provider_log()
                    .iter()
                    .any(|line| line.starts_with(&run) && line.contains(" end "))
            });
            let provider_group = provider_pid(&env, &run);
            wait_until("post-spawn provider process group exit", || {
                !process_group_alive(provider_group)
            });
            assert_eq!(provider_starts(&env, "implementation").len(), 1);
            let (code, reconciled) = env.forged(&["reconcile", "--run", &run]);
            assert_eq!(code, 0, "reconcile {site}: {reconciled}");
            let predecessor = attempts_for(&env, &run)
                .into_iter()
                .find(|attempt| attempt.packet_id == format!("{run}/implementation/0"))
                .expect("spawn-boundary predecessor");
            assert!(
                matches!(
                    predecessor.state,
                    AttemptState::Failed | AttemptState::Reclaimed
                ),
                "{site} predecessor settles before a successor: {predecessor:?}"
            );
            expected_states.insert(0, predecessor.state);
            if predecessor.state == AttemptState::Failed {
                for _ in 0..8 {
                    let (code, advanced) = env.forged(&["run", "advance", "--run", &run]);
                    assert_eq!(code, 0, "advance {site}: {advanced}");
                    let ledger = env.ledger();
                    let has_retry = ledger
                        .list_events(Some(&run), 0, 65_536)
                        .expect("events")
                        .iter()
                        .any(|event| event.kind == "proto.retry");
                    ledger.close().expect("close ledger");
                    if has_retry {
                        break;
                    }
                }
                expire_latest_retry(&env, &run);
            }
        }
        let (code, resumed) = env.forged(&["run", "drive", "--run", &run]);
        assert_eq!(code, 0, "resume {site}: {resumed}");
        let starts = provider_starts(&env, "implementation");
        assert_eq!(starts.len(), starts_at_crash + 1, "{site}: {starts:?}");
        support::assert_no_overlap(&env.provider_log(), &format!("{run}/implementation/0"));
        let log = support::git(
            &env.worktree(&run),
            &["log", "--format=%s", "origin/main..HEAD"],
        );
        assert_eq!(
            log.lines()
                .filter(|line| line.contains("shim implement"))
                .count(),
            1,
            "{site} leaves one implementation effect: {log}"
        );
        assert_terminal_artifacts(&env, &run, &expected_states);
        no_live_reservations(&env);
    }

    // Killing the controller and racing supervisors admits one replacement.
    let supervisors = TestEnv::new("convergence-controller-supervisor-death");
    start_run(&supervisors, "conv-controller-death");
    supervisors.set_scenario("implement", "hang", 2);
    let (code, submitted) =
        supervisors.forged(&["run", "submit", "--run", "conv-controller-death"]);
    assert_eq!(code, 0, "submit controller death fixture: {submitted}");
    let first_pid = controller_pid(&submitted);
    wait_until("first controller provider", || {
        provider_starts(&supervisors, "implementation").len() == 1
    });
    let first_provider = provider_pid(&supervisors, "conv-controller-death");
    kill_group(first_pid);
    kill_group(first_provider);
    wait_until("first controller death", || !process_group_alive(first_pid));
    wait_until("first provider death", || {
        !process_group_alive(first_provider)
    });
    let (code, reclaimed) = supervisors.forged(&["reconcile", "--run", "conv-controller-death"]);
    assert_eq!(code, 0, "reclaim dead controller attempt: {reclaimed}");
    assert!(reclaimed["result"]["report"]["reclaimed"]
        .as_array()
        .is_some_and(|items| !items.is_empty()));
    let reclaimed_attempt = attempts_for(&supervisors, "conv-controller-death")
        .into_iter()
        .find(|attempt| attempt.state == AttemptState::Reclaimed)
        .expect("reclaimed controller-owned attempt");
    assert_terminal_artifacts(
        &supervisors,
        "conv-controller-death",
        &[AttemptState::Reclaimed],
    );
    assert_eq!(
        artifact_outcome(
            &supervisors,
            "conv-controller-death",
            reclaimed_attempt.attempt_id,
        ),
        "revoked"
    );
    let ledger = supervisors.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            "conv-controller-death",
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make dead controller due");
    ledger.close().expect("close ledger");
    for _ in 0..4 {
        let spawn_tick = || {
            supervisors
                .forged_cmd(&["supervise", "--once"])
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
                .expect("supervisor tick")
        };
        let outputs = [
            spawn_tick().wait_with_output().expect("tick A"),
            spawn_tick().wait_with_output().expect("tick B"),
        ];
        assert!(outputs.iter().all(|output| output.status.success()));
        let ledger = supervisors.ledger();
        let restarted = ledger
            .get_desired_work(DesiredSubjectKind::Run, "conv-controller-death")
            .expect("desired query")
            .is_some_and(|row| row.controller_generation == 2);
        ledger.close().expect("close ledger");
        if restarted {
            break;
        }
    }
    let ledger = supervisors.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, "conv-controller-death")
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.controller_generation, 2);
    assert_eq!(desired.restart_used, 0);
    assert_eq!(
        ledger
            .list_events(Some("conv-controller-death"), 0, 65_536)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        2,
        "one original and one replacement controller"
    );
    ledger.close().expect("close ledger");
    stop_run(&supervisors, "conv-controller-death");
    no_live_reservations(&supervisors);

    // Killing a foreground supervisor leaves the one live controller alone;
    // the next supervisor adopts it instead of manufacturing work.
    let supervisor = TestEnv::new("convergence-supervisor-death");
    start_run(&supervisor, "conv-supervisor-death");
    supervisor.set_scenario("implement", "hang", 1);
    let (code, submitted) = supervisor.forged(&["run", "submit", "--run", "conv-supervisor-death"]);
    assert_eq!(code, 0, "submit supervisor fixture: {submitted}");
    let session = supervisor
        .forged_cmd(&["supervise"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("foreground supervisor");
    let supervisor_pid = i32::try_from(session.id()).expect("supervisor pid");
    wait_until("foreground supervisor adoption", || {
        let ledger = supervisor.ledger();
        let adopted = ledger
            .get_desired_work(DesiredSubjectKind::Run, "conv-supervisor-death")
            .expect("desired query")
            .is_some_and(|row| row.last_outcome == Some(DesiredReconcileOutcome::Adopted));
        ledger.close().expect("close ledger");
        adopted
    });
    wait_until("supervisor fixture provider", || {
        provider_starts(&supervisor, "implementation").len() == 1
    });
    kill(Pid::from_raw(supervisor_pid), Signal::SIGKILL).expect("kill supervisor");
    let _ = session.wait_with_output();
    let (code, adopted) = supervisor.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "replacement supervisor: {adopted}");
    assert_eq!(provider_starts(&supervisor, "implementation").len(), 1);
    stop_run(&supervisor, "conv-supervisor-death");
    no_live_reservations(&supervisor);

    // Provider evidence committed before settlement is reused as proof after
    // the crashed driver is reclaimed; the repository effect lands once.
    let result = TestEnv::new("convergence-provider-result");
    start_run(&result, "conv-provider-result");
    result.authorize_run("conv-provider-result");
    let status = result
        .forged_cmd(&["run", "drive", "--run", "conv-provider-result"])
        .env("FORGED_FAILPOINT", "provider.result.recorded.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("crashing provider-result driver");
    assert!(!status.success());
    let ledger = result.ledger();
    let first = ledger.get_attempt(1).expect("first attempt");
    assert_eq!(first.state, AttemptState::Running);
    assert!(ledger
        .get_attempt_artifact(first.attempt_id)
        .expect("artifact lookup")
        .is_some());
    ledger.close().expect("close ledger");
    let (code, reconciled) = result.forged(&["reconcile", "--run", "conv-provider-result"]);
    assert_eq!(code, 0, "reconcile provider-result crash: {reconciled}");
    assert!(reconciled["result"]["report"]["reclaimed"]
        .as_array()
        .is_some_and(|items| !items.is_empty()));
    let (code, claimed) = result.forged(&[
        "claim-next",
        "--holder",
        "convergence-resumer",
        "--idempotency-key",
        "convergence-provider-result-resume",
    ]);
    assert_eq!(code, 0, "claim successor: {claimed}");
    let (code, driven) = result.forged(&["run", "drive", "--run", "conv-provider-result"]);
    assert_eq!(code, 0, "resume provider result: {driven}");
    assert_terminal_artifacts(
        &result,
        "conv-provider-result",
        &[AttemptState::Reclaimed, AttemptState::Completed],
    );
    let log = support::git(
        &result.worktree("conv-provider-result"),
        &["log", "--format=%s", "origin/main..HEAD"],
    );
    assert_eq!(
        log.lines()
            .filter(|line| line.contains("shim implement"))
            .count(),
        1,
        "the replay observes the already-applied implementation: {log}"
    );
    no_live_reservations(&result);

    // Draft-PR response loss is probed on replay. Pre-call death creates
    // nothing; post-call death observes the one already-created PR.
    for (suffix, site, creates_at_crash) in [
        ("before", "gh.call.before", 0),
        ("after", "gh.call.after", 1),
    ] {
        let run = format!("conv-gh-create-{suffix}");
        let env = TestEnv::new(&run);
        env.enable_dynamic_gh();
        start_run(&env, &run);
        env.authorize_run(&run);
        let status = env
            .forged_cmd(&["run", "drive", "--run", &run])
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing draft-PR driver");
        assert!(!status.success(), "{site} must crash");
        let create_count = |env: &TestEnv| {
            env.gh_calls()
                .iter()
                .filter(|call| {
                    call.iter().any(|arg| arg.contains("/pulls"))
                        && call.iter().any(|arg| arg == "POST")
                })
                .count()
        };
        assert_eq!(create_count(&env), creates_at_crash, "{site}");
        let (code, reconciled) = env.forged(&["reconcile", "--run", &run]);
        assert_eq!(code, 0, "reconcile {site}: {reconciled}");
        let (code, resumed) = env.forged(&["run", "drive", "--run", &run]);
        assert_eq!(code, 0, "resume {site}: {resumed}");
        assert_eq!(create_count(&env), 1, "{site} creates one draft PR total");
        no_live_reservations(&env);
    }

    // GitHub accepted the child merge, then the pass died. A later pass probes
    // the durable external state and never repeats the merge.
    let gh = TestEnv::new("convergence-gh-effect");
    let gh_spec = gh.spec.clone();
    start_epic(&gh, "conv-gh-effect", &[("conv-gh-child", &gh_spec, true)]);
    gh.authorize_epic("conv-gh-effect");
    assert_eq!(gh.reconcile_epic("conv-gh-effect").0, 0);
    assert_eq!(gh.reconcile_epic("conv-gh-effect").0, 0);
    // Every tick in the window runs with the failpoint armed: pre-merge
    // progress is untouched (the failpoint sits after the merge effect), and
    // whichever tick first attempts the merge crashes — deterministically,
    // regardless of whether cleanliness and the merge land in one tick.
    wait_until("the merging pass crashes at the failpoint", || {
        gh.wake_epic("conv-gh-effect");
        let status = gh
            .forged_cmd(&["supervise", "--once"])
            .env("FORGED_FAILPOINT", "epic.child.merge.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("armed epic pass");
        !status.success()
    });
    let merge_count = |env: &TestEnv| {
        env.gh_calls()
            .iter()
            .filter(|call| {
                call.first().is_some_and(|arg| arg == "pr")
                    && call.get(1).is_some_and(|arg| arg == "merge")
            })
            .count()
    };
    assert_eq!(merge_count(&gh), 1);
    let (code, resumed) = gh.drive_epic_to_stop("conv-gh-effect");
    assert_eq!(code, 0, "resume epic merge: {resumed}");
    assert_eq!(merge_count(&gh), 1, "merge is observed, never repeated");
    no_live_reservations(&gh);

    // A provider failure with no retry budget stops once and stays stopped.
    let budget = TestEnv::new("convergence-provider-budget");
    set_config(&budget, |config| {
        config["transport_retry_budget"] = json!(0)
    });
    start_run(&budget, "conv-provider-budget");
    budget.authorize_run("conv-provider-budget");
    budget.set_scenario("implement", "rate-limit", 1);
    let _ = budget.forged(&["run", "drive", "--run", "conv-provider-budget"]);
    let starts = provider_starts(&budget, "implementation").len();
    assert_eq!(starts, 1);
    let _ = budget.forged(&["run", "drive", "--run", "conv-provider-budget"]);
    assert_eq!(provider_starts(&budget, "implementation").len(), starts);
    assert_terminal_artifacts(&budget, "conv-provider-budget", &[AttemptState::Failed]);
    no_live_reservations(&budget);
}
