//! Direct run-stream mail through the public lead and provider-seat doors.

mod support;

use std::path::PathBuf;

use forged_ledger::{NewPacket, SpecFence};
use forged_types::{
    Deliverable, ProviderHints, Sandbox, SpecRef, Stage, StageContract, WorkPacket,
};
use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

const RUN: &str = "seat-mail";

#[derive(Debug)]
struct LiveSeat {
    packet_id: String,
    attempt_id: i64,
    claim_token: String,
}

fn live_seat(env: &TestEnv, run_id: &str, seq: i64) -> LiveSeat {
    let packet_id = format!("{run_id}/implement/{seq}");
    let spec_sha = "a".repeat(64);
    let packet = WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: packet_id.clone(),
        run_id: run_id.to_owned(),
        work_id: format!("bead-{run_id}"),
        stage: Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: SpecRef {
            path: "beads://seat-mail-fixture".to_owned(),
            sha256: spec_sha.clone(),
            revision: None,
        },
        worktree: PathBuf::from("/unread/seat-mail-worktree"),
        branch: format!("forged/{run_id}"),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "exercise direct seat mail".to_owned(),
            gate_commands: Vec::new(),
            deliverable: Deliverable::CommitsInWorktree,
            budget_s: 3_600,
            seat_commands: Vec::new(),
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: ProviderHints {
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            effort: None,
            sandbox: Sandbox::ReadOnly,
            env: Default::default(),
        },
        field_notes: Vec::new(),
    };
    let ledger = env.ledger();
    ledger
        .open_packet(NewPacket {
            run_id: run_id.to_owned(),
            stage: Stage::Implement,
            seq,
            spec_path: packet.spec.path.clone(),
            spec_sha256: spec_sha.clone(),
            spec_revision: None,
            policy_revision: None,
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open packet");
    let attempt = ledger
        .claim_packet(
            &packet_id,
            &format!("fixture:{packet_id}"),
            &SpecFence::Sha256(spec_sha),
        )
        .expect("claim packet");
    ledger.close().expect("close ledger");
    LiveSeat {
        packet_id,
        attempt_id: attempt.attempt_id,
        claim_token: attempt.claim_token,
    }
}

fn setup(name: &str) -> (TestEnv, LiveSeat) {
    let env = TestEnv::new(name);
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_frontier("bead-seat-mail");
    fabricate_run(&env, RUN);
    let seat = live_seat(&env, RUN, 1);
    (env, seat)
}

fn seat_call(env: &TestEnv, seat: &LiveSeat, args: &[&str]) -> (i32, Value) {
    let output = env
        .forged_cmd(args)
        .env("FORGED_SEAT_ATTEMPT", seat.attempt_id.to_string())
        .env("FORGED_SEAT_TOKEN", &seat.claim_token)
        .output()
        .expect("seat command starts");
    let stdout = String::from_utf8_lossy(&output.stdout);
    let envelope = serde_json::from_str(stdout.trim()).unwrap_or_else(|error| {
        panic!(
            "seat command stdout is not JSON ({error}): {stdout}; stderr: {}",
            String::from_utf8_lossy(&output.stderr)
        )
    });
    (output.status.code().unwrap_or(-1), envelope)
}

fn event_payloads(env: &TestEnv, run_id: &str, kind: &str) -> Vec<Value> {
    let ledger = env.ledger();
    let payloads = ledger
        .list_events(Some(run_id), 0, 65_536)
        .expect("run events")
        .into_iter()
        .filter(|event| event.kind == kind)
        .map(|event| serde_json::from_str(&event.payload_json).expect("event payload"))
        .collect();
    ledger.close().expect("close ledger");
    payloads
}

fn queue(env: &TestEnv, attempt_id: i64, body: &str, urgent: bool) -> Value {
    let attempt = attempt_id.to_string();
    let mut args = vec![
        "session",
        "message",
        "--run",
        RUN,
        "--attempt",
        &attempt,
        "--message",
        body,
        "--ack-required",
    ];
    if urgent {
        args.push("--urgent");
    }
    let (code, response) = env.forged(&args);
    assert_eq!(code, 0, "queue message: {response}");
    response
}

#[test]
fn every_seat_verb_is_claim_token_fenced_and_refusals_write_nothing() {
    let (env, seat) = setup("forged-seat-mail-fence");
    let before = env
        .ledger()
        .list_events(Some(RUN), 0, 65_536)
        .expect("events before")
        .len();
    let attempt = seat.attempt_id.to_string();
    let (code, refused) = {
        let output = env
            .forged_cmd(&["seat", "inbox", "--attempt", &attempt])
            .env("FORGED_SEAT_ATTEMPT", &attempt)
            .env("FORGED_SEAT_TOKEN", "wrong-token")
            .output()
            .expect("wrong-token command starts");
        (
            output.status.code().unwrap_or(-1),
            serde_json::from_slice::<Value>(&output.stdout).expect("refusal JSON"),
        )
    };
    assert_ne!(code, 0, "wrong token refuses: {refused}");
    assert_eq!(refused["error"]["code"], json!("SEAT_FENCE"));
    assert_eq!(
        refused["error"]["detail"]["schema"],
        json!("forged.remedy/1")
    );
    assert_eq!(refused["error"]["detail"]["verb"], json!("run status"));
    assert_eq!(refused["error"]["detail"]["args"], json!({"run": RUN}));

    fabricate_run(&env, "other-seat-mail");
    let other = live_seat(&env, "other-seat-mail", 1);
    let other_attempt = other.attempt_id.to_string();
    let (code, cross_attempt) =
        seat_call(&env, &seat, &["seat", "inbox", "--attempt", &other_attempt]);
    assert_ne!(code, 0, "another attempt refuses: {cross_attempt}");
    assert_eq!(cross_attempt["error"]["code"], json!("SEAT_FENCE"));

    let too_large = env.root.join("too-large-note.txt");
    std::fs::write(&too_large, "x".repeat(4_097)).expect("oversize note");
    let too_large = too_large.to_string_lossy().into_owned();
    let (code, oversized) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "note",
            "--attempt",
            &attempt,
            "--body-file",
            &too_large,
        ],
    );
    assert_ne!(code, 0, "oversize note refuses: {oversized}");
    assert_eq!(oversized["error"]["code"], json!("INVALID_REQUEST"));
    assert!(oversized["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("4096 bytes")));

    let ledger = env.ledger();
    ledger
        .fail_packet(&seat.packet_id, &seat.claim_token, "fixture complete")
        .expect("finish attempt");
    ledger.close().expect("close ledger");
    let short_note = env.root.join("short-note.txt");
    std::fs::write(&short_note, "finished").expect("short note");
    let short_note = short_note.to_string_lossy().into_owned();
    let (code, completed) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "note",
            "--attempt",
            &attempt,
            "--body-file",
            &short_note,
        ],
    );
    assert_ne!(code, 0, "completed attempt refuses: {completed}");
    assert_eq!(completed["error"]["code"], json!("SEAT_FENCE"));

    let after = env
        .ledger()
        .list_events(Some(RUN), 0, 65_536)
        .expect("events after")
        .len();
    assert_eq!(
        after,
        before + 1,
        "only the fixture failure event was added"
    );
}

#[test]
fn queued_mail_polls_reads_and_acks_once_with_urgent_first() {
    let (env, seat) = setup("forged-seat-mail-poll");
    let normal = queue(&env, seat.attempt_id, "normal instruction", false);
    let urgent = queue(&env, seat.attempt_id, "urgent instruction", true);
    assert_eq!(urgent["result"]["delivery"], json!("queued"));
    let urgent_id = urgent["result"]["messageId"]
        .as_str()
        .expect("message id")
        .to_owned();
    let urgent_replay = queue(&env, seat.attempt_id, "urgent instruction", true);
    assert_eq!(urgent_replay["reused"], json!(true));
    assert_eq!(urgent_replay["result"], urgent["result"]);

    let attempt = seat.attempt_id.to_string();
    let (code, page) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "inbox",
            "--attempt",
            &attempt,
            "--bodies",
            "--limit",
            "10",
        ],
    );
    assert_eq!(code, 0, "poll inbox: {page}");
    assert_eq!(page["result"]["coverage"]["shown"], json!(2));
    assert_eq!(page["result"]["coverage"]["total"], json!(2));
    assert_eq!(page["result"]["coverage"]["truncated"], json!(false));
    assert!(page["result"]["coverage"]["nextCursor"].is_number());
    assert_eq!(
        page["result"]["nextSince"],
        page["result"]["coverage"]["nextCursor"]
    );
    assert_eq!(page["result"]["messages"][0]["importance"], json!("urgent"));
    assert_eq!(
        page["result"]["messages"][0]["body"],
        json!("urgent instruction")
    );
    assert_eq!(
        page["result"]["messages"][1]["body"],
        json!("normal instruction")
    );

    let (_, replayed_page) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "inbox",
            "--attempt",
            &attempt,
            "--bodies",
            "--limit",
            "10",
        ],
    );
    assert_eq!(replayed_page["reused"], json!(true));
    assert_eq!(replayed_page["result"], page["result"]);
    assert_eq!(
        event_payloads(&env, RUN, "forged.message.delivered").len(),
        2
    );
    assert_eq!(event_payloads(&env, RUN, "forged.message.read").len(), 2);

    let later = queue(&env, seat.attempt_id, "later instruction", false);
    let next_since = page["result"]["nextSince"]
        .as_i64()
        .expect("numeric nextSince")
        .to_string();
    let (_, advanced) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "inbox",
            "--attempt",
            &attempt,
            "--since",
            &next_since,
            "--bodies",
            "--limit",
            "10",
        ],
    );
    assert_eq!(advanced["reused"], json!(false));
    assert_eq!(advanced["result"]["coverage"]["shown"], json!(1));
    assert_eq!(
        advanced["result"]["messages"][0]["messageId"],
        later["result"]["messageId"]
    );

    let (code, ack) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "ack",
            "--attempt",
            &attempt,
            "--message",
            &urgent_id,
        ],
    );
    assert_eq!(code, 0, "ack message: {ack}");
    let (_, replayed_ack) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "ack",
            "--attempt",
            &attempt,
            "--message",
            &urgent_id,
        ],
    );
    assert_eq!(replayed_ack["reused"], json!(true));
    assert_eq!(event_payloads(&env, RUN, "forged.message.acked").len(), 1);

    let normal_id = normal["result"]["messageId"].as_str().expect("normal id");
    let unknown_id = format!("not-{normal_id}");
    let (code, wrong_message) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "ack",
            "--attempt",
            &attempt,
            "--message",
            &unknown_id,
        ],
    );
    assert_ne!(code, 0, "unknown message refuses: {wrong_message}");
    assert_eq!(wrong_message["error"]["code"], json!("INVALID_REQUEST"));
    assert_eq!(
        wrong_message["error"]["detail"]["verb"],
        json!("seat inbox")
    );
    assert_eq!(
        wrong_message["error"]["detail"]["args"],
        json!({"attempt": seat.attempt_id})
    );

    let queued = event_payloads(&env, RUN, "forged.message.queued");
    assert_eq!(queued.len(), 3);
    assert_eq!(queued[1]["from"]["kind"], json!("lead"));
    assert_eq!(
        queued[1]["to"],
        json!({"kind": "attempt", "id": seat.attempt_id})
    );
    assert_eq!(queued[1]["kind"], json!("instruction"));
    assert_eq!(queued[1]["importance"], json!("urgent"));
    assert_eq!(queued[1]["ackRequired"], json!(true));
}

#[test]
fn metadata_poll_does_not_consume_the_unread_body() {
    let (env, seat) = setup("forged-seat-mail-unread-body");
    queue(&env, seat.attempt_id, "read me after metadata", false);
    let attempt = seat.attempt_id.to_string();

    let (code, metadata) = seat_call(&env, &seat, &["seat", "inbox", "--attempt", &attempt]);
    assert_eq!(code, 0, "metadata inbox: {metadata}");
    assert_eq!(metadata["result"]["coverage"]["shown"], json!(1));
    assert!(metadata["result"]["messages"][0].get("body").is_none());
    assert_eq!(
        event_payloads(&env, RUN, "forged.message.delivered").len(),
        1
    );
    assert!(event_payloads(&env, RUN, "forged.message.read").is_empty());

    let (code, body) = seat_call(
        &env,
        &seat,
        &["seat", "inbox", "--attempt", &attempt, "--bodies"],
    );
    assert_eq!(code, 0, "body inbox: {body}");
    assert_eq!(
        body["result"]["messages"][0]["body"],
        json!("read me after metadata")
    );
    assert_eq!(event_payloads(&env, RUN, "forged.message.read").len(), 1);
    assert_eq!(
        event_payloads(&env, RUN, "forged.message.delivered").len(),
        1,
        "fetching an unread body does not duplicate its delivered marker"
    );
}

#[test]
fn run_addressed_boundary_mail_is_not_polled_by_the_current_attempt() {
    let (env, seat) = setup("forged-seat-mail-boundary-only");
    let (code, queued) = env.forged(&[
        "session",
        "message",
        "--run",
        RUN,
        "--message",
        "next attempt only",
    ]);
    assert_eq!(code, 0, "queue boundary message: {queued}");
    let attempt = seat.attempt_id.to_string();
    let (code, inbox) = seat_call(
        &env,
        &seat,
        &["seat", "inbox", "--attempt", &attempt, "--bodies"],
    );
    assert_eq!(code, 0, "poll current attempt: {inbox}");
    assert_eq!(inbox["result"]["coverage"]["shown"], json!(0));
    assert!(event_payloads(&env, RUN, "forged.message.delivered").is_empty());
}

#[test]
fn urgent_first_truncated_pages_do_not_skip_older_normal_mail() {
    let (env, seat) = setup("forged-seat-mail-cursor");
    let normal = queue(&env, seat.attempt_id, "older normal", false);
    let urgent = queue(&env, seat.attempt_id, "newer urgent", true);
    let attempt = seat.attempt_id.to_string();
    let (code, first) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "inbox",
            "--attempt",
            &attempt,
            "--bodies",
            "--limit",
            "1",
        ],
    );
    assert_eq!(code, 0, "first page: {first}");
    assert_eq!(first["result"]["coverage"]["truncated"], json!(true));
    assert_eq!(
        first["result"]["messages"][0]["messageId"],
        urgent["result"]["messageId"]
    );
    let cursor = first["result"]["coverage"]["nextCursor"]
        .as_i64()
        .expect("numeric cursor")
        .to_string();

    let (code, second) = seat_call(
        &env,
        &seat,
        &[
            "seat",
            "inbox",
            "--attempt",
            &attempt,
            "--since",
            &cursor,
            "--bodies",
            "--limit",
            "1",
        ],
    );
    assert_eq!(code, 0, "second page: {second}");
    assert_eq!(second["result"]["coverage"]["truncated"], json!(false));
    assert_eq!(
        second["result"]["messages"][0]["messageId"],
        normal["result"]["messageId"]
    );
}

#[test]
fn progress_projects_latest_snapshot_into_status_and_next() {
    let (env, seat) = setup("forged-seat-mail-progress");
    let attempt = seat.attempt_id.to_string();
    for (index, snapshot) in [
        json!({
            "phase": "implementation", "commitsAhead": 1, "seatChecks": null,
            "blockers": [], "etaMin": 15
        }),
        json!({
            "phase": "seat-checks", "commitsAhead": 2, "seatChecks": "pass",
            "blockers": [], "etaMin": 0
        }),
    ]
    .into_iter()
    .enumerate()
    {
        let path = env.root.join(format!("progress-{index}.json"));
        std::fs::write(&path, serde_json::to_vec(&snapshot).expect("snapshot JSON"))
            .expect("snapshot file");
        let path = path.to_string_lossy().into_owned();
        let (code, response) = seat_call(
            &env,
            &seat,
            &[
                "seat",
                "progress",
                "--attempt",
                &attempt,
                "--snapshot-file",
                &path,
            ],
        );
        assert_eq!(code, 0, "progress {index}: {response}");
    }
    assert_eq!(event_payloads(&env, RUN, "forged.seat.progress").len(), 2);

    let (code, status) = env.forged(&["run", "status", "--run", RUN]);
    assert_eq!(code, 0, "run status: {status}");
    assert_eq!(
        status["result"]["run"]["progress"]["phase"],
        json!("seat-checks")
    );
    assert_eq!(
        status["result"]["run"]["progress"]["commitsAhead"],
        json!(2)
    );
    assert_eq!(
        status["result"]["run"]["progress"]["seatChecks"],
        json!("pass")
    );

    let repository = env.repos.repo.to_string_lossy().into_owned();
    let (code, next) = env.forged(&["next", "--repo", &repository]);
    assert_eq!(code, 0, "next: {next}");
    let running = next["result"]["sections"]["running"]
        .as_array()
        .expect("running rows")
        .iter()
        .find(|row| row["id"] == RUN)
        .unwrap_or_else(|| panic!("next includes {RUN}: {next}"));
    assert_eq!(running["progress"]["phase"], json!("seat-checks"));
    assert_eq!(running["commitsAhead"], json!(2));
    assert_eq!(running["mail"]["unacked"], json!(0));
}

#[test]
fn overdue_ack_and_slow_stage_publish_classified_message_actions() {
    let (env, seat) = setup("forged-seat-mail-attention");
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read test config"))
            .expect("test config JSON");
    config["ack_window_s"] = json!(0);
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("config JSON"),
    )
    .expect("write test config");

    queue(&env, seat.attempt_id, "ack this instruction", true);
    let attempt = seat.attempt_id.to_string();
    let (code, inbox) = seat_call(
        &env,
        &seat,
        &["seat", "inbox", "--attempt", &attempt, "--bodies"],
    );
    assert_eq!(code, 0, "deliver required message: {inbox}");
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open attention fixture database");
    connection
        .execute(
            "UPDATE attempts SET started_at = ?1, updated_at = ?1 WHERE attempt_id = ?2",
            rusqlite::params!["2020-01-01T00:00:00.000000000Z", seat.attempt_id],
        )
        .expect("age running attempt");

    let repository = env.repos.repo.to_string_lossy().into_owned();
    let (code, listed) = env.forged(&[
        "attention",
        "list",
        "--repo",
        &repository,
        "--classification",
        "symptom",
    ]);
    assert_eq!(code, 0, "attention list: {listed}");
    let groups = listed["result"]["groups"]
        .as_array()
        .expect("attention groups");
    let ack = groups
        .iter()
        .find(|group| group["condition"] == "ack-overdue")
        .unwrap_or_else(|| panic!("ack-overdue group: {listed}"));
    let ack_action = &ack["items"][0]["nextActions"][0];
    assert_eq!(ack_action["verb"], json!("session message"));
    assert_eq!(ack_action["class"], json!("should"));
    assert_eq!(ack_action["args"]["run"], json!(RUN));
    assert_eq!(ack_action["args"]["attempt"], json!(seat.attempt_id));

    let slow = groups
        .iter()
        .find(|group| group["condition"] == "slow-stage")
        .unwrap_or_else(|| panic!("slow-stage group: {listed}"));
    let slow_action = &slow["items"][0]["nextActions"][0];
    assert_eq!(slow_action["verb"], json!("session message"));
    assert_eq!(slow_action["class"], json!("can"));
    assert_eq!(slow_action["args"]["run"], json!(RUN));
    assert_eq!(slow_action["args"]["attempt"], json!(seat.attempt_id));
}
