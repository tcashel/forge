#![cfg(feature = "failpoints")]

//! Failpoint-only real-process supervisor coverage.

mod support;

use std::os::unix::process::CommandExt;
use std::process::Stdio;

use forged_ledger::{
    AdmissionBatchWrite, AdmissionReservationState, DesiredReconcileOutcome, DesiredState,
    DesiredSubjectKind, EffectClass,
};
use forged_types::{
    AdmissionCandidateV1, AdmissionDecisionV1, AdmissionInputsV1, AdmissionOutcome,
    AdmissionReason, AdmissionResourceClass, AdmissionSubjectKind, OperationRequest,
    ADMISSION_DECISION_SCHEMA_V1, ADMISSION_INPUTS_SCHEMA_V1,
};
use nix::sys::signal::{killpg, Signal};
use nix::unistd::Pid;
use serde_json::{json, Value};
use support::supervise::*;
use support::TestEnv;

fn seed_identityless_orphaned_reservation(env: &TestEnv, run: &str) -> String {
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired work");
    let snapshot = ledger
        .admission_snapshot(Some((DesiredSubjectKind::Run, run.to_owned())))
        .expect("admission snapshot");
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let capacity = snapshot.capacity.clone();
    let candidate = AdmissionCandidateV1 {
        subject_kind: AdmissionSubjectKind::Run,
        subject_id: run.to_owned(),
        control_revision: desired.control_revision,
        work_id: run.to_owned(),
        work_revision: Some("fixture-revision".to_owned()),
        work_status: Some("open".to_owned()),
        priority: Some(1),
        repository: repository.clone(),
        work_repository: Some(repository.clone()),
        input_error: None,
        desired_wake_at: desired.next_wake_at,
        provider: Some("claude".to_owned()),
        model: Some("opus".to_owned()),
        resource_class: AdmissionResourceClass::RepositoryWrite,
        authorized_at: desired.created_at,
    };
    let batch_id = format!("identityless-orphan-{run}");
    let decision = AdmissionDecisionV1 {
        schema: ADMISSION_DECISION_SCHEMA_V1.to_owned(),
        batch_id,
        subject_kind: AdmissionSubjectKind::Run,
        subject_id: run.to_owned(),
        control_revision: desired.control_revision,
        repository,
        priority: Some(1),
        provider: Some("claude".to_owned()),
        model: Some("opus".to_owned()),
        resource_class: AdmissionResourceClass::RepositoryWrite,
        outcome: AdmissionOutcome::Admitted,
        reason: AdmissionReason::CapacityAvailable,
        reason_detail: None,
        policy_revision: "identityless-orphan-policy".to_owned(),
        evidence: capacity.clone(),
        next_eligible_wake_at: None,
    };
    let reservation = ledger
        .commit_admission_batch(AdmissionBatchWrite {
            inputs: AdmissionInputsV1 {
                schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
                as_of: snapshot.as_of,
                policy_revision: "identityless-orphan-policy".to_owned(),
                ledger_revision: snapshot.ledger_revision,
                candidates: vec![candidate],
                capacity,
                spend: snapshot.spend,
                latest_rate_limits: snapshot.latest_rate_limits,
            },
            decisions: vec![decision],
            recovery_deadline: "2000-01-01T00:00:00.000000000Z".to_owned(),
        })
        .expect("commit orphan admission")
        .into_iter()
        .next()
        .expect("reservation");
    ledger
        .activate_admission_reservation(
            &reservation.reservation_id,
            "controller",
            &format!("run:{run}:1"),
        )
        .expect("activate orphan owner");
    let orphaned = ledger
        .mark_expired_admission_orphaned("2099-01-01T00:00:00.000000000Z")
        .expect("mark identity-less owner orphaned")
        .into_iter()
        .find(|row| row.reservation_id == reservation.reservation_id)
        .expect("orphaned reservation");
    assert_eq!(orphaned.state, AdmissionReservationState::Orphaned);
    ledger.close().expect("close ledger");
    reservation.reservation_id
}

#[cfg(feature = "failpoints")]
#[test]
fn identityless_orphan_is_relaunched_once_and_late_generation_is_fenced() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-identityless-orphan");
    let run = "run-identityless-orphan";
    start_run(&env, run);
    let ledger = env.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, run, 1)
        .expect("authorize orphan generation");
    ledger.close().expect("close ledger");
    let orphaned_id = seed_identityless_orphaned_reservation(&env, run);
    let controller_dir = env.anvil.join(format!("runs/{run}/controller"));
    assert!(
        !controller_dir.join("controller.json").exists(),
        "the activated owner died before publishing controller identity"
    );

    env.set_scenario("implement", "hang", 1);
    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "orphan recovery tick: {tick}");
    assert_eq!(tick["result"]["subjects"][0]["action"], json!("restarted"));
    wait_until("orphan replacement provider start", || {
        implementation_starts(&env, run) == 1
    });
    assert_eq!(implementation_starts(&env, run), 1, "exactly one relaunch");
    let (generation, replacement_pid) = current_controller_identity(&env, run);
    assert_eq!(generation, 2);
    assert!(process_group_alive(replacement_pid));

    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired work");
    assert_eq!(desired.controller_generation, 2);
    assert_eq!(
        desired.restart_used, 0,
        "first launch after authorization is free"
    );
    let release: Value = ledger
        .latest_event_of_kind(run, "forged.admission.reservation.released")
        .expect("release event query")
        .and_then(|event| serde_json::from_str(&event.payload_json).ok())
        .expect("orphan release evidence");
    assert_eq!(release["reservationId"], json!(orphaned_id));
    assert_eq!(release["subject"], json!({"kind": "run", "id": run}));
    assert_eq!(release["generation"], json!(2));
    assert_eq!(release["reason"], json!("orphan-superseded-by-generation"));
    assert_eq!(
        release["evidence"],
        json!({
            "uncontainedOperations": 0,
            "liveAttempts": 0,
            "identity": "absent",
        })
    );
    let events = ledger.list_events(Some(run), 0, 65_536).expect("events");
    assert_eq!(
        events
            .iter()
            .filter(|event| matches!(
                event.kind.as_str(),
                "forged.attention.acknowledged"
                    | "forged.attention.resolved"
                    | "forged.attention.reopened"
            ))
            .count(),
        0,
        "reservation recovery must not rewrite attention custody"
    );
    ledger.close().expect("close ledger");

    let late = env
        .forged_cmd(&["run", "drive", "--run", run])
        .process_group(0)
        .env(
            "FORGED_CONTROLLER_PID_PATH",
            controller_dir.join("controller-1-late.pid"),
        )
        .env(
            "FORGED_CONTROLLER_LSTART_PATH",
            controller_dir.join("controller-1-late.lstart"),
        )
        .env("FORGED_CONTROLLER_SCOPE", "run")
        .env("FORGED_CONTROLLER_ID", run)
        .env("FORGED_CONTROLLER_GENERATION", "1")
        .output()
        .expect("late generation runs");
    assert!(
        !late.status.success(),
        "late generation 1 must be refused after generation 2 is desired: {}",
        String::from_utf8_lossy(&late.stdout)
    );
    assert_eq!(
        implementation_starts(&env, run),
        1,
        "late generation cannot duplicate the provider effect"
    );
    assert!(
        process_group_alive(replacement_pid),
        "late predecessor cannot disturb the replacement"
    );

    stop_until_lands(
        &env,
        run,
        "identity-less orphan fixture cleanup",
        "identity-less orphan fixture stop lands",
    );
    wait_until("identity-less replacement death", || {
        !process_group_alive(replacement_pid)
    });
}

#[cfg(feature = "failpoints")]
#[test]
fn orphan_with_uncontained_machine_effect_retains_ambiguous_custody() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-orphan-unsafe-residue");
    let run = "run-orphan-unsafe-residue";
    start_run(&env, run);
    let ledger = env.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, run, 1)
        .expect("authorize orphan generation");
    ledger.close().expect("close ledger");
    let orphaned_id = seed_identityless_orphaned_reservation(&env, run);
    let ledger = env.ledger();
    ledger
        .begin_operation(
            "gate",
            &OperationRequest {
                schema_version: 1,
                idempotency_key: "orphan-ambiguous-gate".to_owned(),
                run_id: Some(run.to_owned()),
                params: serde_json::Map::new(),
            },
            EffectClass::HumanAmbiguous,
            None,
        )
        .expect("seed ambiguous machine operation");
    ledger.close().expect("close ledger");

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "ambiguous orphan tick: {tick}");
    assert_eq!(tick["result"]["subjects"][0]["action"], json!("attention"));

    let ledger = env.ledger();
    let orphan = ledger
        .admission_snapshot(None)
        .expect("orphan snapshot")
        .reservations
        .into_iter()
        .find(|row| row.reservation_id == orphaned_id)
        .expect("orphan custody retained");
    assert_eq!(orphan.state, AdmissionReservationState::Orphaned);
    assert!(
        ledger
            .latest_event_of_kind(run, "forged.admission.reservation.released")
            .expect("release event query")
            .is_none(),
        "ambiguous machine residue cannot release orphan custody"
    );
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired work");
    assert_eq!(desired.controller_generation, 1);
    assert_eq!(
        desired.last_outcome,
        Some(DesiredReconcileOutcome::Attention)
    );
    ledger.close().expect("close ledger");
}

#[cfg(feature = "failpoints")]
#[test]
fn once_reports_superseded_when_foreground_progress_clears_a_deferred_claim() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-deferred-claim-superseded");
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config JSON");
    config["admission"] = json!({
        "totalActive": 1,
        "providerActive": 4,
        "repositoryWriteActive": 1,
        "deferSeconds": 60,
    });
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize admission config"),
    )
    .expect("write admission config");

    let holder = "run-supervisor-capacity-holder";
    let target = "run-supervisor-deferred-target";
    start_run(&env, holder);
    start_run(&env, target);
    env.set_scenario("implement", "hang", 1);
    let (code, submitted) = env.forged(&["run", "submit", "--run", holder]);
    assert_eq!(code, 0, "holder submit: {submitted}");
    wait_until("holder consumes the only admission slot", || {
        implementation_starts(&env, holder) == 1
    });
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            holder,
            DesiredState::Running,
            DesiredReconcileOutcome::Adopted,
            Some("9999-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("park capacity holder observation");
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, target, 1)
        .expect("authorize due target");
    ledger.close().expect("close ledger");

    let failpoint = env.root.join("supervisor-deferred-finish-fp");
    std::fs::create_dir_all(&failpoint).expect("failpoint dir");
    let reached = failpoint.join("admission.batch.commit.after.reached");
    let release = failpoint.join("admission.batch.commit.after.release");
    let supervisor = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "admission.batch.commit.after")
        .env("FORGED_FAILPOINT_MODE", "pause")
        .env("FORGED_FAILPOINT_DIR", &failpoint)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("supervisor tick spawns");
    wait_until("supervisor commits the deferred decision", || {
        reached.exists()
    });

    // This is the exact production race: the detached controller or an
    // explicit control operation advances desired state after the tick's
    // observation but before its guarded reconciliation finish.
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            target,
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("9999-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("foreground progress clears the tick claim");
    ledger.close().expect("close ledger");
    std::fs::write(&release, b"").expect("release supervisor failpoint");

    let output = supervisor
        .wait_with_output()
        .expect("supervisor tick exits");
    assert!(
        output.status.success(),
        "recoverable ownership handoff failed the tick: stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let response: Value = serde_json::from_slice(&output.stdout).expect("supervisor response JSON");
    let report = response["result"]["subjects"]
        .as_array()
        .and_then(|subjects| {
            subjects
                .iter()
                .find(|subject| subject["desiredWork"]["subject"]["id"] == json!(target))
        })
        .expect("target subject report");
    assert_eq!(report["action"], json!("superseded"), "{response}");

    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        holder,
        "--outcome",
        "cancelled",
        "--reason",
        "test cleanup",
    ]);
    assert_eq!(code, 0, "holder cleanup: {cleanup}");
}

#[cfg(feature = "failpoints")]
#[test]
fn restart_recovers_a_preparing_admission_after_spawn_crash() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-recover-preparing-admission");
    let config_path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(
        &std::fs::read_to_string(&config_path).expect("read restart admission config"),
    )
    .expect("config JSON");
    config["admission"] = json!({
        "totalActive": 8,
        "providerActive": 4,
        "repositoryWriteActive": 2,
        "deferSeconds": 60,
    });
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("serialize restart admission config"),
    )
    .expect("write restart admission config");

    let run = "run-recover-preparing-admission";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 2);
    let (code, submitted) = env.forged(&["run", "submit", "--run", run]);
    assert_eq!(code, 0, "submit: {submitted}");
    let first_pid = controller_pid(&submitted);
    wait_until("first controller provider start", || {
        implementation_starts(&env, run) == 1
    });
    wait_until("first provider identity", || {
        env.latest_attempt_dir(run, "implementation", 0)
            .is_some_and(|dir| {
                dir.join("provider.pid").exists() && dir.join("provider.lstart").exists()
            })
    });
    killpg(Pid::from_raw(first_pid), Signal::SIGKILL).expect("kill first controller group");
    wait_until("first controller group death", || {
        !process_group_alive(first_pid)
    });
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make killed controller immediately due");
    ledger.close().expect("close");

    let status = env
        .forged_cmd(&["supervise", "--once"])
        .env("FORGED_FAILPOINT", "controller.spawn.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("crashing supervisor tick");
    assert!(!status.success(), "spawn failpoint must crash");

    let controller_dir = env.anvil.join(format!("runs/{run}/controller"));
    let admission_path = controller_dir.join("runtime-admission.json");
    wait_until("generation two process identity", || {
        controller_dir.join("controller-2.pid").exists()
            && controller_dir.join("controller-2.lstart").exists()
    });
    let admission: Value = serde_json::from_slice(
        &std::fs::read(&admission_path).expect("preserved runtime admission"),
    )
    .expect("admission JSON");
    assert_eq!(admission["generation"], json!(2));
    assert_eq!(admission["state"], json!("preparing"));
    let predecessor: Value = serde_json::from_slice(
        &std::fs::read(controller_dir.join("controller.json")).expect("predecessor record"),
    )
    .expect("controller JSON");
    assert_eq!(predecessor["generation"], json!(1));
    let ledger = env.ledger();
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Authorized,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make spawn-crash recovery immediately due");
    ledger.close().expect("close");

    let (code, recovered) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "recovery tick: {recovered}");
    assert_eq!(
        recovered["result"]["subjects"][0]["action"],
        json!("adopted"),
        "{recovered}"
    );
    let record: Value = serde_json::from_slice(
        &std::fs::read(controller_dir.join("controller.json")).expect("recovered record"),
    )
    .expect("controller JSON");
    assert_eq!(record["generation"], json!(2));
    assert_eq!(record["recoveredAfterSpawnCrash"], json!(true));
    assert!(
        !admission_path.exists(),
        "matching recovered identity must clear the runtime fence"
    );
    let ledger = env.ledger();
    let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
    assert!(snapshot.reservations.iter().all(|reservation| {
        reservation.subject_kind != forged_types::AdmissionSubjectKind::Run
            || reservation.subject_id != run
    }));
    ledger.close().expect("close");
    assert_eq!(
        implementation_starts(&env, run),
        1,
        "controller recovery must not duplicate the provider effect"
    );

    let (code, cleanup) = env.forged(&[
        "run",
        "stop",
        "--run",
        run,
        "--outcome",
        "cancelled",
        "--reason",
        "preparing-admission recovery test cleanup",
    ]);
    assert_eq!(code, 0, "stop recovery fixture: {cleanup}");
}

#[cfg(feature = "failpoints")]
#[test]
fn preidentity_nonrecoverable_terminal_halts_and_resubmit_launches_next_generation() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-halt-preidentity");
    let run = "run-halt-preidentity";
    start_run(&env, run);
    let message = "failpoint controller.bootstrap.refuse: injected failure";
    let ledger = env.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, run, 1)
        .expect("authorize generation without a controller record");
    ledger.close().expect("close");

    let controller_dir = env.anvil.join(format!("runs/{run}/controller"));
    std::fs::create_dir_all(&controller_dir).expect("controller directory");
    let mut bootstrap = env.forged_cmd(&["run", "drive", "--run", run]);
    bootstrap
        .process_group(0)
        .env(
            "FORGED_CONTROLLER_PID_PATH",
            controller_dir.join("controller-1.pid"),
        )
        .env(
            "FORGED_CONTROLLER_LSTART_PATH",
            controller_dir.join("controller-1.lstart"),
        )
        .env("FORGED_CONTROLLER_SCOPE", "run")
        .env("FORGED_CONTROLLER_ID", run)
        .env("FORGED_CONTROLLER_GENERATION", "1")
        .env("FORGED_FAILPOINT", "controller.bootstrap.refuse")
        .env("FORGED_FAILPOINT_MODE", "fail");
    let bootstrap = bootstrap.output().expect("bootstrap controller runs");
    assert!(
        !bootstrap.status.success(),
        "injected bootstrap refusal must terminate the controller: {}",
        String::from_utf8_lossy(&bootstrap.stdout)
    );
    assert!(controller_dir.join("controller-1.pid").exists());
    assert!(controller_dir.join("controller-1.lstart").exists());
    assert!(
        !controller_dir.join("controller.json").exists(),
        "the controller died before its identity record was persisted"
    );
    let ledger = env.ledger();
    let terminal: Value = ledger
        .latest_event_of_kind(run, "forged.controller.terminal")
        .expect("terminal query")
        .and_then(|event| serde_json::from_str(&event.payload_json).ok())
        .expect("terminal marker");
    assert_eq!(terminal["generation"], json!(1));
    assert_eq!(terminal["code"], json!("INVALID_REQUEST"));
    assert_eq!(terminal["recoverable"], json!(false));
    ledger.close().expect("close");

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "halt tick: {tick}");
    assert_eq!(tick["result"]["subjects"][0]["action"], json!("halted"));

    let ledger = env.ledger();
    let halted = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row");
    assert_eq!(halted.controller_generation, 1);
    assert_eq!(halted.restart_used, 0, "pre-identity halt is free");
    assert!(
        halted.exhausted_at.is_some(),
        "pre-identity halt is durable"
    );
    assert!(halted.next_wake_at.is_none(), "halt has no future wake");
    let error = halted.last_error.as_deref().expect("halt evidence");
    assert!(error.contains("halted after one nonrecoverable"), "{error}");
    assert!(error.contains(message), "{error}");
    let events = ledger.list_events(Some(run), 0, 65_536).expect("events");
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.controller.started")
            .count(),
        0,
        "the dead generation never persisted controller identity"
    );
    let snapshot = ledger.admission_snapshot(None).expect("admission snapshot");
    assert!(
        snapshot.reservations.iter().all(|reservation| {
            reservation.subject_kind != forged_types::AdmissionSubjectKind::Run
                || reservation.subject_id != run
        }),
        "the halt releases its admission reservation"
    );
    let halted_at = halted.exhausted_at.clone();
    ledger.close().expect("close");

    env.set_scenario("implement", "hang", 1);
    let submit_args = [
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "preidentity-halt-resubmit",
    ];
    let (code, submitted) = env.forged(&submit_args);
    assert_eq!(code, 0, "resubmit halted subject: {submitted}");
    assert_eq!(submitted["result"]["controller"]["generation"], json!(2));
    let second_pid = controller_pid(&submitted);
    wait_until("resubmitted provider start", || {
        implementation_starts(&env, run) == 1
    });
    assert!(process_group_alive(second_pid), "generation 2 is live");
    let record: Value = serde_json::from_slice(
        &std::fs::read(
            env.anvil
                .join(format!("runs/{run}/controller/controller.json")),
        )
        .expect("generation 2 controller record"),
    )
    .expect("controller JSON");
    assert_eq!(record["generation"], json!(2));

    let ledger = env.ledger();
    let relaunched = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row");
    assert_eq!(relaunched.controller_generation, 2);
    assert_eq!(relaunched.control_revision, 2);
    assert!(relaunched.exhausted_at.is_none(), "real launch clears halt");
    assert_ne!(halted_at, relaunched.exhausted_at);
    ledger.close().expect("close");

    let (code, replayed) = env.forged(&submit_args);
    assert_eq!(code, 0, "replay successful resubmit: {replayed}");
    assert_eq!(replayed["reused"], json!(true));
    let ledger = env.ledger();
    let replay_row = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row");
    assert_eq!(replay_row.control_revision, 2, "halt clears exactly once");
    assert!(replay_row.exhausted_at.is_none());
    ledger.close().expect("close");

    let refused_run = "run-halt-refused";
    start_run(&env, refused_run);
    exhaust_desired_without_controller(&env, refused_run, 1, "fixture refusal");
    let ledger = env.ledger();
    let before_refusal = ledger
        .get_desired_work(DesiredSubjectKind::Run, refused_run)
        .expect("desired query")
        .expect("desired row");
    ledger.close().expect("close");
    let (code, refused) = env.forged(&[
        "run",
        "submit",
        "--run",
        refused_run,
        "--idempotency-key",
        "preidentity-halt-refused",
    ]);
    assert_ne!(code, 0, "capacity-blocked resubmit must refuse: {refused}");
    assert_eq!(refused["error"]["code"], json!("OPERATION_IN_PROGRESS"));
    assert_eq!(refused["error"]["recoverable"], json!(true));
    let ledger = env.ledger();
    let after_refusal = ledger
        .get_desired_work(DesiredSubjectKind::Run, refused_run)
        .expect("desired query")
        .expect("desired row");
    assert_eq!(after_refusal.exhausted_at, before_refusal.exhausted_at);
    assert_eq!(
        after_refusal.control_revision,
        before_refusal.control_revision
    );
    assert_eq!(
        after_refusal.controller_generation,
        before_refusal.controller_generation
    );
    ledger.close().expect("close");
    assert!(
        !env.anvil
            .join(format!("runs/{refused_run}/controller/controller.json"))
            .exists(),
        "refused submit launches no controller"
    );

    stop_until_lands(
        &env,
        run,
        "pre-identity halt fixture cleanup",
        "pre-identity halt cleanup lands",
    );
    wait_until("resubmitted controller group death", || {
        !process_group_alive(second_pid)
    });
}

#[cfg(feature = "failpoints")]
#[test]
fn stale_nonrecoverable_terminal_without_identity_takes_the_restart_path() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-stale-preidentity-terminal");
    let run = "run-stale-preidentity";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 1);
    let ledger = env.ledger();
    ledger
        .authorize_desired_work(DesiredSubjectKind::Run, run, 2)
        .expect("authorize recordless generation 2");
    ledger
        .append_event(
            Some(run),
            "forged.controller.terminal",
            terminal_marker(Some(1), "stale deterministic refusal", false),
        )
        .expect("stale terminal marker");
    ledger.close().expect("close");

    let (code, tick) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "restart tick: {tick}");
    assert_eq!(tick["result"]["subjects"][0]["action"], json!("restarted"));
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.controller_generation, 3);
    assert_eq!(desired.restart_used, 0);
    assert!(desired.exhausted_at.is_none(), "stale marker never halts");
    ledger.close().expect("close");
    let (generation, pid) = current_controller_identity(&env, run);
    assert_eq!(generation, 3);
    stop_until_lands(
        &env,
        run,
        "recordless stale fixture cleanup",
        "recordless stale fixture stop lands",
    );
    wait_until("recordless stale replacement death", || {
        !process_group_alive(pid)
    });
}

#[cfg(feature = "failpoints")]
#[test]
fn stale_nonrecoverable_terminal_with_identity_takes_the_restart_path() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-stale-recorded-terminal");
    raise_admission_limits(&env);
    let run = "run-stale-recorded";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 3);
    let (code, submitted) = env.forged(&["run", "submit", "--run", run]);
    assert_eq!(code, 0, "submit: {submitted}");
    wait_until("first controller provider start", || {
        implementation_starts(&env, run) == 1
    });
    kill_controller_and_make_due(
        &env,
        run,
        1,
        "INVALID_REQUEST",
        "recoverable first death",
        true,
    );
    let (code, first_restart) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "first restart: {first_restart}");
    assert_eq!(
        first_restart["result"]["subjects"][0]["action"],
        json!("restarted")
    );

    let (generation, second_pid) = current_controller_identity(&env, run);
    assert_eq!(generation, 2);
    killpg(Pid::from_raw(second_pid), Signal::SIGKILL).expect("kill generation 2");
    wait_until("generation 2 death", || !process_group_alive(second_pid));
    let ledger = env.ledger();
    ledger
        .append_event(
            Some(run),
            "forged.controller.terminal",
            terminal_marker(Some(1), "stale deterministic refusal", false),
        )
        .expect("stale nonrecoverable terminal");
    ledger
        .record_desired_outcome(
            DesiredSubjectKind::Run,
            run,
            DesiredState::Running,
            DesiredReconcileOutcome::Restarted,
            Some("2000-01-01T00:00:00.000000000Z".to_owned()),
            None,
        )
        .expect("make generation 2 due");
    ledger.close().expect("close");

    let (code, second_restart) = env.forged(&["supervise", "--once"]);
    assert_eq!(code, 0, "second restart: {second_restart}");
    assert_eq!(
        second_restart["result"]["subjects"][0]["action"],
        json!("restarted")
    );
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.controller_generation, 3);
    assert_eq!(desired.restart_used, 1);
    assert!(desired.exhausted_at.is_none(), "stale marker never halts");
    ledger.close().expect("close");
    let (_, third_pid) = current_controller_identity(&env, run);
    stop_until_lands(
        &env,
        run,
        "recorded stale fixture cleanup",
        "recorded stale fixture stop lands",
    );
    wait_until("recorded stale replacement death", || {
        !process_group_alive(third_pid)
    });
}

#[cfg(feature = "failpoints")]
#[test]
fn nonrecoverable_gh_error_consumes_backoff_budget_instead_of_halting() {
    if !require_serialized_runner() {
        return;
    }
    let env = TestEnv::new("supervise-gh-error-budget");
    raise_admission_limits(&env);
    let run = "run-gh-error-budget";
    start_run(&env, run);
    env.set_scenario("implement", "hang", 8);
    let (code, submitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "gh-budget-first-submit",
    ]);
    assert_eq!(code, 0, "submit: {submitted}");
    wait_until("first controller provider start", || {
        implementation_starts(&env, run) == 1
    });

    for generation in 1..=7 {
        let message = format!("transient gh outage at generation {generation}");
        kill_controller_and_make_due(&env, run, generation, "GH_ERROR", &message, false);
        let (code, tick) = env.forged(&["supervise", "--once"]);
        assert_eq!(code, 0, "generation {generation} tick: {tick}");
        let ledger = env.ledger();
        let desired = ledger
            .get_desired_work(DesiredSubjectKind::Run, run)
            .expect("desired query")
            .expect("desired row");
        if generation <= 6 {
            assert_eq!(
                tick["result"]["subjects"][0]["action"],
                json!("restarted"),
                "GH_ERROR must never halt"
            );
            assert_eq!(desired.restart_used, generation - 1);
            assert_eq!(desired.controller_generation, generation + 1);
            assert!(desired.exhausted_at.is_none());
            let expected_backoff = 5_u64.saturating_mul(2_u64.pow(generation.saturating_sub(2)));
            let wake = desired.next_wake_at.as_deref().expect("restart wake");
            assert!(
                seconds_between(&desired.updated_at, wake) >= expected_backoff as f64 - 1.0,
                "generation {generation} follows backoff {expected_backoff}s: {} -> {wake}",
                desired.updated_at
            );
        } else {
            assert_eq!(tick["result"]["subjects"][0]["action"], json!("exhausted"));
            assert_eq!(desired.restart_used, 5);
            assert_eq!(desired.controller_generation, 7);
            assert!(desired.exhausted_at.is_some());
            assert_eq!(
                desired.last_outcome,
                Some(DesiredReconcileOutcome::Exhausted)
            );
        }
        ledger.close().expect("close");
    }

    let (code, resubmitted) = env.forged(&[
        "run",
        "submit",
        "--run",
        run,
        "--idempotency-key",
        "gh-budget-resubmit",
    ]);
    assert_eq!(code, 0, "resubmit after bounded exhaustion: {resubmitted}");
    assert_eq!(resubmitted["result"]["controller"]["generation"], json!(8));
    let eighth_pid = controller_pid(&resubmitted);
    let ledger = env.ledger();
    let desired = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.controller_generation, 8);
    assert_eq!(desired.restart_used, 0);
    assert!(desired.exhausted_at.is_none());
    ledger.close().expect("close");
    stop_until_lands(
        &env,
        run,
        "GH_ERROR budget fixture cleanup",
        "GH_ERROR budget fixture stop lands",
    );
    wait_until("generation 8 controller death", || {
        !process_group_alive(eighth_pid)
    });
}
