//! Bead-sourced specs end to end: a run started from a bead alone, the
//! rendered body every seat reads, the body fence under a spec edit (and
//! under the write token bd moves on every write), and the refusals that
//! keep an empty spec away from a seat.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

const DESCRIPTION: &str = "## Context\\n\\nthe bead is the spec.";
const ACCEPTANCE: &str = "- the seat reads the bead, not a file";

/// Advance a run one action at a time until its first packet is open, and
/// no further: the next advance would claim and execute it.
fn advance_to_open_packet(env: &TestEnv, run: &str) -> forged_ledger::PacketRow {
    for _ in 0..40 {
        let ledger = env.ledger();
        let opened = ledger
            .list_packets(run)
            .unwrap_or_default()
            .into_iter()
            .next();
        ledger.close().expect("close");
        if let Some(packet) = opened {
            return packet;
        }
        let (code, advanced) = env.forged(&["run", "advance", "--run", run]);
        assert_eq!(code, 0, "advance {run}: {advanced}");
    }
    panic!("{run} never opened a packet")
}

fn wait_for(env: &TestEnv, args: &[&str], ready: impl Fn(&Value) -> bool) -> Value {
    let mut last = Value::Null;
    for _ in 0..600 {
        let (code, value) = env.forged(args);
        if code == 0 && ready(&value) {
            return value;
        }
        last = value;
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    panic!("timed out waiting for forged {args:?}: {last}")
}

#[test]
fn a_run_starts_from_a_bead_alone_and_every_seat_reads_the_rendered_body() {
    let env = TestEnv::new("forged-bead-spec");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_bead_spec("bead-sourced", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();

    // No --spec: the bead's own fields are the spec.
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-sourced",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "bead-sourced run start: {started}");
    assert_eq!(started["result"]["run_id"], json!("bead-sourced"));

    // The packet is bead-sourced — it carries a revision where a file-sourced
    // one carries none — and its spec path is the body materialized inside
    // the packet directory.
    let packet = advance_to_open_packet(&env, "bead-sourced");
    assert!(
        packet.spec_revision.is_some(),
        "a bead-sourced packet records the bead revision: {packet:?}"
    );
    let pinned_body = packet.spec_sha256.clone();
    assert!(
        !packet.body_json.contains("\"spec\""),
        "body_json must not duplicate the spec its row carries as columns: {}",
        packet.body_json
    );

    // Drive far enough for the seat to actually run, then read what it read.
    let stopped = wait_for(&env, &["run", "drive", "--run", "bead-sourced"], |value| {
        value["ok"] == json!(true)
    });
    assert!(
        stopped["result"]["terminal"].is_object(),
        "drive must terminate: {stopped}"
    );
    let materialized = env
        .packet_dir("bead-sourced", "implementation", 0)
        .join("spec.md");
    let body = std::fs::read_to_string(&materialized)
        .unwrap_or_else(|e| panic!("seat spec at {}: {e}", materialized.display()));
    assert!(
        body.contains("the bead is the spec."),
        "the description section must reach the seat: {body}"
    );
    assert!(
        body.contains("## Acceptance Criteria") && body.contains(ACCEPTANCE),
        "the acceptance section must reach the seat under its heading: {body}"
    );

    // Byte-identical for every seat of the run: each packet materialized the
    // body it was fenced on, and all of them pinned the same BODY. Not the
    // same revision — bd mints a fresh one on every write to the bead, and
    // the run writes its own lease between packets.
    let ledger = env.ledger();
    let packets = ledger.list_packets("bead-sourced").expect("packets");
    assert!(packets.len() > 1, "the run opened more than one packet");
    for packet in &packets {
        assert_eq!(
            packet.spec_sha256, pinned_body,
            "every packet pins the same body: {packet:?}"
        );
        let seat_body = std::fs::read_to_string(&packet.spec_path).unwrap_or_else(|e| {
            panic!("seat spec for {}: {e}", packet.packet_id);
        });
        assert_eq!(seat_body, body, "every seat reads byte-identical bytes");
    }
    ledger.close().expect("close");
}

#[test]
fn a_bead_with_no_spec_fields_is_refused_by_name_at_run_start() {
    let env = TestEnv::new("forged-bead-spec-empty");
    assert_eq!(env.forged(&["init"]).0, 0);
    // Title and status only: nothing a seat could implement.
    env.set_bead_field("bead-empty", "title", "an empty bead");
    env.set_bead_field("bead-empty", "status", "open");
    let repo = env.repos.repo.to_string_lossy().into_owned();

    let (code, refused) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-empty",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_ne!(code, 0, "an empty bead must not start a run: {refused}");
    let message = refused["error"]["message"]
        .as_str()
        .unwrap_or_default()
        .to_owned();
    assert!(
        message.contains("bead-empty"),
        "the refusal must name the bead: {message}"
    );
    for field in ["description", "acceptance_criteria"] {
        assert!(
            message.contains(field),
            "the refusal must name the empty required field {field:?}: {message}"
        );
    }
    for commentary in ["design", "notes"] {
        assert!(
            !message.contains(commentary),
            "commentary is not required and must not be named: {message}"
        );
    }

    // Half a spec is refused too, and names only the half that is missing.
    env.set_bead_field("bead-half", "title", "half a bead");
    env.set_bead_field("bead-half", "status", "open");
    env.set_bead_field("bead-half", "description", DESCRIPTION);
    let (code, half) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-half",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_ne!(code, 0, "a bead with no acceptance is refused: {half}");
    let message = half["error"]["message"].as_str().unwrap_or_default();
    assert!(message.contains("bead-half"), "{message}");
    assert!(
        message.contains("acceptance_criteria is empty"),
        "the one empty required field is named: {message}"
    );
    assert!(
        !message.contains("description"),
        "a populated field is never named: {message}"
    );

    // And nothing was created: an empty spec never reaches a seat because
    // the run never exists.
    let ledger = env.ledger();
    assert!(ledger.get_run("bead-empty").is_err(), "no run row");
    assert!(ledger.get_run("bead-half").is_err(), "no run row");
    ledger.close().expect("close");
}

#[test]
fn a_seat_claim_refuses_an_edited_bead_but_survives_a_moved_write_token() {
    let env = TestEnv::new("forged-bead-spec-edit");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_bead_spec("bead-edited", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-edited",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");

    let packet = advance_to_open_packet(&env, "bead-edited");
    let pinned_revision = packet.spec_revision.clone().expect("a bead-sourced packet");

    // The operator revises the spec. bd mints a new revision for the write —
    // and so does the shim — but it is the changed BODY that has to refuse
    // the claim, exactly as the hash check refuses a file edited under an
    // open packet.
    env.set_bead_field("bead-edited", "acceptance", "- revised acceptance");
    let (code, drifted) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_ne!(code, 0, "an edited bead must refuse the claim: {drifted}");
    assert_eq!(drifted["error"]["code"], json!("SPEC_DRIFT"));

    // The operator puts the spec back. The revision has now moved TWICE and
    // will never return to the value the packet pinned — bd's revision is a
    // write token, not a digest — so a fence on the token alone would refuse
    // this claim forever. The body is what is pinned, and it matches.
    env.set_bead_field("bead-edited", "acceptance", ACCEPTANCE);
    assert_ne!(
        env.bead_revision("bead-edited"),
        pinned_revision,
        "the write token must have moved off the pinned value"
    );
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_eq!(code, 0, "claim at the pinned body: {claimed}");

    // And the claim re-pinned the row to the token bd reports now, so the
    // next reader of this packet is not comparing against a dead value.
    let ledger = env.ledger();
    let row = ledger.get_packet(&packet.packet_id).expect("packet row");
    ledger.close().expect("close");
    assert_eq!(
        row.spec_revision.as_deref(),
        Some(env.bead_revision("bead-edited").as_str()),
        "the claim re-pins the write token: {row:?}"
    );
    assert_eq!(
        row.spec_sha256, packet.spec_sha256,
        "the re-pin must not move the body the packet is fenced on"
    );

    // The claim also wrote the body where the packet contract says the seat
    // reads it — `packet claim` -> `packet complete` never enters the
    // in-process attempt pipeline, so nothing else would.
    let seat_body = std::fs::read_to_string(&row.spec_path)
        .unwrap_or_else(|e| panic!("seat spec at {}: {e}", row.spec_path));
    assert!(
        seat_body.contains("## Acceptance Criteria") && seat_body.contains(ACCEPTANCE),
        "an externally claimed seat must find its rendered spec: {seat_body}"
    );
}

#[test]
fn a_bead_edited_under_an_open_packet_is_re_pinned_and_claimed_at_the_new_body() {
    // The wedge this closes: `honor_await`'s claim-again branch reached
    // `execute_packet` without ever re-opening the packet, so a packet whose
    // bead moved underneath it refused `SpecDrift` on the fence and then
    // retried the identical refusal, forever, with no path back.
    let env = TestEnv::new("forged-bead-spec-recover");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_bead_spec("bead-recovered", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-recovered",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");

    let packet = advance_to_open_packet(&env, "bead-recovered");
    let opened_at = packet.spec_sha256.clone();

    // The operator revises the spec while the packet is open and unclaimed.
    env.set_bead_field("bead-recovered", "acceptance", "- revised acceptance");

    // One advance: the claim-again branch re-pins the packet and claims it.
    let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-recovered"]);
    assert_eq!(
        code, 0,
        "an edit under an open packet must not wedge the run: {advanced}"
    );

    let ledger = env.ledger();
    let row = ledger.get_packet(&packet.packet_id).expect("packet row");
    let attempt = ledger.get_attempt(1).expect("the packet was claimed");
    ledger.close().expect("close");
    assert_eq!(attempt.packet_id, packet.packet_id);
    assert_ne!(
        row.spec_sha256, opened_at,
        "the packet must be re-pinned to the body its bead carries now: {row:?}"
    );
    assert_eq!(
        row.body_json, packet.body_json,
        "a re-pin revises the spec and leaves the definition alone"
    );
    let body = std::fs::read_to_string(&row.spec_path)
        .unwrap_or_else(|e| panic!("seat spec at {}: {e}", row.spec_path));
    assert!(
        body.contains("- revised acceptance"),
        "the claimed seat reads the revised body: {body}"
    );
}

#[test]
fn an_adoption_that_finds_drift_settles_its_attempt_instead_of_looping() {
    // Adoption is the crash window between claim and spawn: a `running`
    // attempt with no process behind it. It claims nothing, so re-reading the
    // spec is the only fence it has — and a refusal there used to propagate
    // with the attempt left running, which blocks both the re-claim and the
    // re-pin that would clear it, so the driver re-entered adoption and failed
    // identically forever.
    let env = TestEnv::new("forged-bead-spec-adopt");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_bead_spec("bead-adopted", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-adopted",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");

    // Claim without ever spawning a provider: exactly the crashed shape.
    let packet = advance_to_open_packet(&env, "bead-adopted");
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_eq!(code, 0, "packet claim: {claimed}");

    // The operator revises the spec while that pid-less attempt is live.
    env.set_bead_field("bead-adopted", "acceptance", "- revised acceptance");

    let (code, drifted) = env.forged(&["run", "advance", "--run", "bead-adopted"]);
    assert_ne!(code, 0, "adoption must refuse a drifted bead: {drifted}");
    assert_eq!(drifted["error"]["code"], json!("SPEC_DRIFT"));

    // The attempt is SETTLED, so the packet is re-claimable and the ledger
    // will accept the re-pin that clears the drift. A second advance must
    // therefore not report the same adoption failure again.
    let ledger = env.ledger();
    let live = ledger
        .list_live_attempts(Some("bead-adopted"))
        .expect("live attempts");
    ledger.close().expect("close");
    assert!(
        live.is_empty(),
        "a refused adoption must retire its own attempt: {live:?}"
    );
    let (_, again) = env.forged(&["run", "advance", "--run", "bead-adopted"]);
    assert_ne!(
        again["error"]["message"], drifted["error"]["message"],
        "the run must not be wedged re-adopting the same dead attempt: {again}"
    );
}

#[test]
fn a_file_sourced_run_still_works_and_is_recorded_as_deprecated() {
    let env = TestEnv::new("forged-bead-spec-file");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-file",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "file-sourced run start: {started}");

    let packet = advance_to_open_packet(&env, "bead-file");
    let ledger = env.ledger();
    assert_eq!(
        packet.spec_revision, None,
        "a file-sourced packet keeps the hash fence, not a revision"
    );
    assert_eq!(packet.spec_path, spec, "the seat reads the operator's file");

    let deprecated = ledger
        .list_events(Some("bead-file"), 0, 4096)
        .expect("events")
        .into_iter()
        .filter(|row| row.kind == "forged.run.spec")
        .map(|row| serde_json::from_str::<Value>(&row.payload_json).expect("payload"))
        .next()
        .expect("the run records its spec source");
    assert_eq!(deprecated["source"], json!("file"));
    assert_eq!(deprecated["deprecated"], json!(true));
    assert_eq!(deprecated["specPath"], json!(spec));
    ledger.close().expect("close");
}

#[test]
fn a_spec_edit_between_stages_pins_the_new_body_on_the_next_packet_open() {
    // The defect this whole change exists to fix: under the file route the
    // re-open replayed its stored response and pinned nothing new, so a spec
    // could not be revised for a live run at all.
    let env = TestEnv::new("forged-bead-spec-repin");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_bead_spec("bead-repinned", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-repinned",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");

    let mut edited = false;
    let mut later: Option<forged_ledger::PacketRow> = None;
    for _ in 0..40 {
        let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-repinned"]);
        assert_eq!(code, 0, "advance: {advanced}");
        // Revise the spec the moment the implement seat is done and before
        // the review packets are opened.
        let implement_done = env.provider_log().iter().any(|line| {
            line.starts_with("bead-repinned/implementation/0") && line.contains(" end ")
        });
        if implement_done && !edited {
            // The edit alone: bd mints the new revision for the write, the
            // way it does for every write to a bead.
            env.set_bead_field("bead-repinned", "acceptance", "- revised acceptance");
            edited = true;
        }
        let ledger = env.ledger();
        let packets = ledger.list_packets("bead-repinned").unwrap_or_default();
        ledger.close().expect("close");
        if edited && packets.len() > 1 {
            later = packets
                .into_iter()
                .find(|packet| !packet.packet_id.contains("/implementation/"));
            break;
        }
    }
    assert!(
        edited,
        "the implement seat must run before the spec is revised"
    );
    let later = later.expect("a packet opened after the edit");
    let ledger = env.ledger();
    let implement = ledger
        .list_packets("bead-repinned")
        .expect("packets")
        .into_iter()
        .find(|packet| packet.packet_id.contains("/implementation/"))
        .expect("the implement packet");
    ledger.close().expect("close");
    assert!(
        later.spec_revision.is_some(),
        "a packet opened after the edit is still bead-sourced: {later:?}"
    );
    assert_ne!(
        later.spec_sha256, implement.spec_sha256,
        "a packet opened after the edit pins the NEW body: {later:?}"
    );

    // Its seat materializes the REVISED body when it claims — the spec was
    // genuinely revised for a live run, which the file route could not do.
    let driven = wait_for(&env, &["run", "drive", "--run", "bead-repinned"], |value| {
        value["ok"] == json!(true)
    });
    assert!(driven["result"]["terminal"].is_object(), "drive: {driven}");
    let body = std::fs::read_to_string(&later.spec_path).expect("materialized spec");
    assert!(
        body.contains("- revised acceptance"),
        "the seat opened after the edit reads the revised spec: {body}"
    );
}

#[test]
fn a_bead_edited_back_to_the_body_the_packet_opened_at_still_re_pins() {
    // The replay wedge INSIDE the re-pin. `packet_open` is keyed on the
    // target fence, so a bead moved A -> B -> A re-opens under the key the
    // first open at A already stored: the operation replays its recorded
    // response, the ledger UPDATE never runs, and the re-pin reports success
    // with the row still pinned at B. Every claim afterwards refuses
    // `SpecDrift`, forever — the wedge the re-pin exists to close, reopened.
    let env = TestEnv::new("forged-bead-spec-cycle");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_bead_spec("bead-cycled", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-cycled",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");

    let packet = advance_to_open_packet(&env, "bead-cycled");
    let opened_at = packet.spec_sha256.clone();

    // A -> B. The seat fails transport, which hands the packet back
    // re-claimable instead of completing it.
    env.set_bead_field("bead-cycled", "acceptance", "- revised acceptance");
    env.set_scenario("implement", "rate-limit", 1);
    let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-cycled"]);
    assert_eq!(code, 0, "advance at the revised body: {advanced}");
    let ledger = env.ledger();
    let at_revision = ledger
        .get_packet(&packet.packet_id)
        .expect("packet row")
        .spec_sha256;
    ledger.close().expect("close");
    assert_ne!(
        at_revision, opened_at,
        "the packet must first re-pin to the revised body"
    );

    // B -> A: back to the exact body this packet was OPENED at.
    env.set_bead_field("bead-cycled", "acceptance", ACCEPTANCE);
    expire_retry_deadline(&env, "bead-cycled");
    let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-cycled"]);
    assert_eq!(code, 0, "advance back at the original body: {advanced}");

    let ledger = env.ledger();
    let row = ledger.get_packet(&packet.packet_id).expect("packet row");
    ledger.close().expect("close");
    assert_eq!(
        row.spec_sha256, opened_at,
        "the row must follow the bead back, not stay pinned where it left: {row:?}"
    );
    assert_eq!(
        row.body_json, packet.body_json,
        "a re-pin revises the spec and leaves the definition alone"
    );

    // AND CLAIMABLE THERE — the half a replayed re-pin passes by reporting
    // `Ok` over a row still pinned at B. The claim fences on the row, so a
    // row left behind refuses `SpecDrift` on every claim from here on.
    let ledger = env.ledger();
    let attempts: Vec<forged_ledger::AttemptRow> = (1..=8)
        .filter_map(|id| ledger.get_attempt(id).ok())
        .filter(|attempt| attempt.packet_id == packet.packet_id)
        .collect();
    ledger.close().expect("close");
    assert!(
        attempts.len() > 1,
        "the advance at the original body must claim the packet again: {attempts:?}"
    );
    let latest = attempts.last().expect("an attempt");
    assert_ne!(
        latest.state,
        forged_ledger::AttemptState::Failed,
        "the re-claim at the pinned body must not refuse: {latest:?}"
    );
    let body = std::fs::read_to_string(&row.spec_path)
        .unwrap_or_else(|e| panic!("seat spec at {}: {e}", row.spec_path));
    assert!(
        body.contains(ACCEPTANCE) && !body.contains("- revised acceptance"),
        "the seat must read the body the row followed back to: {body}"
    );
}

#[test]
fn the_re_pins_refusals_still_stand_now_that_it_bypasses_the_operation() {
    // The guards live in `Ledger::open_packet_with_id`'s own transaction,
    // which is the whole reason the re-pin may leave the operation layer:
    // dropping the fence must not drop a refusal with it.
    let env = TestEnv::new("forged-bead-spec-guards");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_bead_spec("bead-guarded", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-guarded",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    let packet = advance_to_open_packet(&env, "bead-guarded");

    // A LIVE ATTEMPT refuses the re-pin: a seat's spec must never move
    // underneath it.
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_eq!(code, 0, "packet claim: {claimed}");
    let ledger = env.ledger();
    let mut revised = forged_ledger::NewPacket {
        run_id: packet.run_id.clone(),
        stage: packet.stage,
        seq: packet.seq,
        spec_path: packet.spec_path.clone(),
        spec_sha256: "cafe".to_owned(),
        spec_revision: Some("a-later-write-token".to_owned()),
        body_json: packet.body_json.clone(),
    };
    let refused = ledger
        .open_packet_with_id(revised.clone(), packet.packet_id.clone())
        .expect_err("a live attempt must refuse the re-pin");
    assert_eq!(refused.code(), forged_types::ErrorCode::InvalidRequest);
    assert_eq!(
        ledger
            .get_packet(&packet.packet_id)
            .expect("packet row")
            .spec_sha256,
        packet.spec_sha256,
        "the refused re-pin changed nothing"
    );

    // A DIFFERING BODY is a changed definition, not a revised spec, and is
    // refused with `InvalidRequest` whatever the attempt state.
    revised.spec_sha256 = packet.spec_sha256.clone();
    revised.spec_revision = packet.spec_revision.clone();
    revised.body_json.push(' ');
    let refused = ledger
        .open_packet_with_id(revised, packet.packet_id.clone())
        .expect_err("a differing definition must be refused");
    assert_eq!(refused.code(), forged_types::ErrorCode::InvalidRequest);
    assert_eq!(
        ledger
            .get_packet(&packet.packet_id)
            .expect("packet row")
            .body_json,
        packet.body_json,
        "the refused re-open changed nothing"
    );
    ledger.close().expect("close");

    // End to end: with that live attempt standing, an operator edit cannot
    // be adopted under the seat either — the drive path hits the same guard.
    env.set_bead_field("bead-guarded", "acceptance", "- revised acceptance");
    let (code, drifted) = env.forged(&["run", "advance", "--run", "bead-guarded"]);
    assert_ne!(
        code, 0,
        "a live seat must refuse the drifted bead: {drifted}"
    );
    assert_eq!(drifted["error"]["code"], json!("SPEC_DRIFT"));
}

#[test]
fn a_spec_file_edited_under_an_open_packet_is_still_refused() {
    // The re-pin is for BEAD-sourced packets alone. A file-sourced spec is
    // fenced by the hash of a file the operator owns; adopting an edit to it
    // silently would retire the one fence that route has, and nothing
    // downstream would catch it — `assert_pinned` returns early for a file
    // spec.
    let env = TestEnv::new("forged-bead-spec-file-edit");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-file-edit",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "file-sourced run start: {started}");

    let packet = advance_to_open_packet(&env, "bead-file-edit");
    assert_eq!(
        packet.spec_revision, None,
        "the file route pins no revision"
    );
    std::fs::write(
        &env.spec,
        "# a spec the operator edited under the run
",
    )
    .expect("revise the spec file");

    let (_, advanced) = env.forged(&["run", "advance", "--run", "bead-file-edit"]);
    let ledger = env.ledger();
    let row = ledger.get_packet(&packet.packet_id).expect("packet row");
    let claimed = ledger.get_attempt(1).ok();
    ledger.close().expect("close");
    assert_eq!(
        row.spec_sha256, packet.spec_sha256,
        "an edited spec file must not be adopted under an open packet: {row:?}"
    );
    assert!(
        claimed.is_none(),
        "the edit must refuse the claim, not seat it: {claimed:?} ({advanced})"
    );
}

/// The packet's latest `proto.retry` grant: its failure count and deadline.
fn latest_retry(env: &TestEnv, run: &str) -> Value {
    let ledger = env.ledger();
    let events = ledger.list_events(Some(run), 0, 4096).expect("events");
    ledger.close().expect("close");
    events
        .iter()
        .rev()
        .find(|row| row.kind == "proto.retry")
        .map(|row| serde_json::from_str::<Value>(&row.payload_json).expect("retry payload"))
        .unwrap_or(Value::Null)
}

/// Bring a granted retry deadline forward so the next advance may claim,
/// instead of sleeping through the production backoff.
fn expire_retry_deadline(env: &TestEnv, run: &str) {
    let db = env.anvil.join("state.db");
    let connection = rusqlite::Connection::open(&db).expect("open retry clock");
    let (event_id, payload): (i64, String) = connection
        .query_row(
            "SELECT event_id, payload_json FROM events WHERE run_id = ?1 AND kind = 'proto.retry' \
             ORDER BY event_id DESC LIMIT 1",
            [run],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("a granted retry");
    let mut payload: Value = serde_json::from_str(&payload).expect("retry payload");
    payload["retryAfter"] = json!("2000-01-01T00:00:00.000000000Z");
    connection
        .execute(
            "UPDATE events SET payload_json = ?1 WHERE event_id = ?2",
            rusqlite::params![
                serde_json::to_string(&payload).expect("retry json"),
                event_id
            ],
        )
        .expect("advance retry clock");
}

#[test]
fn an_unreachable_bd_at_claim_time_is_transport_and_is_charged_to_the_budget() {
    let env = TestEnv::new("forged-bead-spec-outage");
    assert_eq!(env.forged(&["init"]).0, 0);
    // One free retry, so exhaustion is two grants away rather than four.
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config json");
    config["transport_retry_budget"] = json!(1);
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("config json"),
    )
    .expect("rewrite config");
    env.seed_bead_spec("bead-outage", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-outage",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    let packet = advance_to_open_packet(&env, "bead-outage");

    // bd goes away. The claim cannot read the fence, which says NOTHING
    // about whether the spec changed.
    env.set_bd_show_unreachable(true);
    let (code, failed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_ne!(code, 0, "an unreachable bd must fail the claim: {failed}");
    assert_ne!(
        failed["error"]["code"],
        json!("SPEC_DRIFT"),
        "an unreachable bd must never be reported as drift: {failed}"
    );
    assert_eq!(
        failed["error"]["recoverable"],
        json!(true),
        "the claim must stay on the bounded-retry budget: {failed}"
    );

    // The driver's own claim-again path CHARGES that budget. The failure is
    // pre-claim — no claim token exists to fence an attempt with — so the
    // grant is the whole record of it, and no terminal attempt is invented.
    let (code, first) = env.forged(&["run", "advance", "--run", "bead-outage"]);
    assert_eq!(
        code, 0,
        "a transport failure is recorded, not raised: {first}"
    );
    assert_eq!(
        latest_retry(&env, "bead-outage")["transportFailures"],
        json!(1),
        "the first pre-claim outage is charged to the budget"
    );
    let ledger = env.ledger();
    assert!(
        ledger
            .list_live_attempts(Some("bead-outage"))
            .expect("live attempts")
            .is_empty(),
        "a pre-claim failure leaves no attempt behind"
    );
    assert!(
        ledger.get_attempt(1).is_err(),
        "no attempt row is invented for work no seat ever held"
    );
    ledger.close().expect("close");

    // The grant also holds the packet off until its backoff has passed.
    let (code, waiting) = env.forged(&["run", "advance", "--run", "bead-outage"]);
    assert_eq!(code, 0, "advance: {waiting}");
    assert_eq!(
        latest_retry(&env, "bead-outage")["transportFailures"],
        json!(1),
        "the granted deadline is honored rather than burned instantly"
    );

    // Past the deadline, the outage costs the second and last retry, and the
    // budget is then spent.
    expire_retry_deadline(&env, "bead-outage");
    let (code, second) = env.forged(&["run", "advance", "--run", "bead-outage"]);
    assert_eq!(code, 0, "advance: {second}");
    assert_eq!(
        latest_retry(&env, "bead-outage")["transportFailures"],
        json!(2),
        "an unreachable bd cannot repeat without limit"
    );
    let (code, exhausted) = env.forged(&["run", "advance", "--run", "bead-outage"]);
    assert_eq!(code, 0, "advance: {exhausted}");
    assert!(
        exhausted["result"]["action"]["stop"]["providerUnavailable"].is_object(),
        "a spent budget stops the run instead of retrying forever: {exhausted}"
    );
}

#[test]
fn a_bd_outage_that_clears_inside_the_budget_lets_the_packet_recover() {
    // The other half of the budget's contract, and the one that says it is a
    // BUDGET rather than a countdown to a stop: a bounded retry that only
    // ever ends in exhaustion is indistinguishable from a hang. bd going away
    // and coming back must leave the run exactly where it would have been.
    let env = TestEnv::new("forged-bead-spec-recovers");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_bead_spec("bead-recovers", DESCRIPTION, ACCEPTANCE);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-recovers",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    let packet = advance_to_open_packet(&env, "bead-recovers");

    // One outage, charged: the budget of three is now one down.
    env.set_bd_show_unreachable(true);
    let (code, charged) = env.forged(&["run", "advance", "--run", "bead-recovers"]);
    assert_eq!(
        code, 0,
        "a transport failure is recorded, not raised: {charged}"
    );
    assert_eq!(
        latest_retry(&env, "bead-recovers")["transportFailures"],
        json!(1),
        "the outage is charged"
    );

    // bd comes back well inside the budget.
    env.set_bd_show_unreachable(false);
    expire_retry_deadline(&env, "bead-recovers");
    let (code, recovered) = env.forged(&["run", "advance", "--run", "bead-recovers"]);
    assert_eq!(
        code, 0,
        "the packet must claim once bd answers: {recovered}"
    );

    // The seat ran, at the body the packet pins, and the outage cost nothing
    // beyond the one charge it earned.
    let ledger = env.ledger();
    let attempt = ledger.get_attempt(1).expect("the packet was claimed");
    let row = ledger.get_packet(&packet.packet_id).expect("packet row");
    ledger.close().expect("close");
    assert_eq!(attempt.packet_id, packet.packet_id);
    assert_eq!(
        row.spec_sha256, packet.spec_sha256,
        "a recovered claim pins the same body it opened at: {row:?}"
    );
    assert_eq!(
        latest_retry(&env, "bead-recovers")["transportFailures"],
        json!(1),
        "a successful claim charges the budget nothing further"
    );
    let body = std::fs::read_to_string(&row.spec_path)
        .unwrap_or_else(|e| panic!("seat spec at {}: {e}", row.spec_path));
    assert!(
        body.contains(ACCEPTANCE),
        "the recovered seat reads the rendered body: {body}"
    );

    // And the run goes on to finish: the outage delayed it, nothing more.
    let driven = wait_for(&env, &["run", "drive", "--run", "bead-recovers"], |value| {
        value["ok"] == json!(true)
    });
    assert!(
        driven["result"]["terminal"]["done"].is_object(),
        "an outage inside the budget must not change where the run ends: {driven}"
    );
}

#[test]
fn an_epic_child_prefers_its_bead_fields_over_its_spec_pointer() {
    let env = TestEnv::new("forged-bead-spec-epic");
    env.enable_dynamic_gh();
    assert_eq!(env.forged(&["init"]).0, 0);
    // Two children: one carrying a spec of its own (with a `spec:` pointer
    // still in its description), one carrying only the pointer.
    env.seed_epic(
        "epic-bead",
        &[
            ("child-fields", &env.spec, true),
            ("child-pointer", &env.spec, false),
        ],
    );
    env.set_bead_field(
        "child-fields",
        "description",
        &format!("spec: {}\\n{DESCRIPTION}", env.spec.display()),
    );
    env.set_bead_field("child-fields", "acceptance", ACCEPTANCE);

    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-bead",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");

    let children = started["result"]["children"]
        .as_array()
        .expect("frozen children")
        .clone();
    let by_id = |id: &str| -> Value {
        children
            .iter()
            .find(|child| child["id"] == json!(id))
            .cloned()
            .unwrap_or_else(|| panic!("child {id} in {children:?}"))
    };
    assert!(
        by_id("child-fields")["specPath"].is_null(),
        "a child carrying spec fields is frozen bead-sourced: {:?}",
        by_id("child-fields")
    );
    assert_eq!(
        by_id("child-pointer")["specPath"],
        json!(spec),
        "a child carrying only a `spec:` pointer keeps the file route"
    );

    // And the bead-sourced child's run really is fenced on its own bead.
    let mut packet = None;
    for _ in 0..12 {
        let (code, advanced) = env.forged(&["epic", "advance", "--epic", "epic-bead"]);
        assert_eq!(code, 0, "epic advance: {advanced}");
        let ledger = env.ledger();
        packet = ledger
            .list_packets("child-fields")
            .unwrap_or_default()
            .into_iter()
            .next();
        ledger.close().expect("close");
        if packet.is_some() {
            break;
        }
    }
    let packet = packet.expect("the epic started the bead-sourced child");
    assert!(
        packet.spec_revision.is_some(),
        "the child run is bead-sourced, not file-sourced: {packet:?}"
    );
    assert!(
        packet.spec_path.ends_with("/spec.md") && !packet.spec_path.starts_with(&spec),
        "a bead-sourced child reads the materialized body, not the pointed-to \
         file: {packet:?}"
    );
}
