//! Bead-sourced specs end to end: a run started from a bead alone, the
//! rendered body every seat reads, the revision fence under a spec edit,
//! and the refusals that keep an empty spec away from a seat.

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

    // The packet pins the bead's revision, not a file hash, and its spec
    // path is the body materialized inside the packet directory.
    let packet = advance_to_open_packet(&env, "bead-sourced");
    assert_eq!(
        packet.spec_revision.as_deref(),
        Some("-6192208415116251521"),
        "a bead-sourced packet pins the bead revision: {packet:?}"
    );
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
    // body it was fenced on, and all of them pinned the same revision.
    let ledger = env.ledger();
    let packets = ledger.list_packets("bead-sourced").expect("packets");
    assert!(packets.len() > 1, "the run opened more than one packet");
    for packet in &packets {
        assert_eq!(
            packet.spec_revision.as_deref(),
            Some("-6192208415116251521"),
            "every packet pins the same revision: {packet:?}"
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
    for field in ["description", "acceptance_criteria", "design", "notes"] {
        assert!(
            message.contains(field),
            "the refusal must name the empty field {field:?}: {message}"
        );
    }
    // And nothing was created: an empty spec never reaches a seat because
    // the run never exists.
    let ledger = env.ledger();
    assert!(ledger.get_run("bead-empty").is_err(), "no run row");
    ledger.close().expect("close");
}

#[test]
fn a_seat_claim_refuses_once_the_bead_moves_off_the_pinned_revision() {
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
    assert_eq!(
        packet.spec_revision.as_deref(),
        Some("-6192208415116251521")
    );

    // The operator revises the spec; bd mints a new revision for the write.
    env.set_bead_field("bead-edited", "acceptance", "- revised acceptance");
    env.set_bead_field("bead-edited", "revision", "9146914492635073757");

    // The packet is still pinned to the revision it was opened at, so the
    // seat claim refuses — exactly as the hash check refuses a file edited
    // under an open packet.
    let (code, drifted) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_ne!(code, 0, "a moved bead must refuse the claim: {drifted}");
    assert_eq!(drifted["error"]["code"], json!("SPEC_DRIFT"));

    // Putting the bead back where the packet pinned it lets the seat claim
    // again: the fence is equality on the revision, nothing else.
    env.set_bead_field("bead-edited", "revision", "-6192208415116251521");
    let (code, claimed) = env.forged(&["packet", "claim", "--packet", &packet.packet_id]);
    assert_eq!(code, 0, "claim at the pinned revision: {claimed}");
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
fn a_spec_edit_between_stages_pins_the_new_revision_on_the_next_packet_open() {
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
            env.set_bead_field("bead-repinned", "acceptance", "- revised acceptance");
            env.set_bead_field("bead-repinned", "revision", "9146914492635073757");
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
    assert_eq!(
        later.spec_revision.as_deref(),
        Some("9146914492635073757"),
        "a packet opened after the edit pins the NEW revision: {later:?}"
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
