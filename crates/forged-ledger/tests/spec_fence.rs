//! The spec fence: a packet is pinned to the bytes its seats read — the
//! rendered work body, or a file's content hash on the deprecated route —
//! and the three halves of the contract that fence has to keep at once. An
//! open packet refuses a seat once the BODY moves; a re-open re-pins it so
//! the run recovers; and a work revision that moved with no change to the
//! body claims anyway, because bd's revision is a write token that forged's
//! own lease claim moves before every resume.

use forged_ledger::{Ledger, NewPacket, NewRun, SpecFence};
use forged_types::{ErrorCode, RunId, Stage};

const REVISION_N: &str = "9146914492635073757";
const REVISION_N1: &str = "-6192208415116251521";
const BODY: &str = "5f0c1b3e-the-rendered-body";
const EDITED_BODY: &str = "9a7d24cc-the-edited-body";

fn ledger(dir: &tempfile::TempDir) -> Ledger {
    Ledger::open(&dir.path().join("state.db")).expect("open")
}

fn run(ledger: &Ledger, id: &str) -> String {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(id).expect("valid run id"),
            work_id: "bead-1".to_owned(),
            repo: "/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: format!("forged/{id}"),
        })
        .expect("create run")
        .run_id
}

/// A packet at one spec pin. `body_json` carries the DEFINITION and nothing
/// the spec columns already hold — exactly what `WorkPacket::stored_body`
/// writes — so it is invariant under a spec revision, which is what lets a
/// re-pin be told apart from a redefinition.
fn packet_at(run_id: &str, revision: &str, body_sha256: &str) -> NewPacket {
    NewPacket {
        run_id: run_id.to_owned(),
        stage: Stage::Implement,
        seq: 0,
        spec_path: format!("/runs/{run_id}/packets/implement/0/spec.md"),
        spec_sha256: body_sha256.to_owned(),
        spec_revision: Some(revision.to_owned()),
        policy_revision: None,
        body_json: format!("{{\"schema\":\"forged.packet/1\",\"branch\":\"forged/{run_id}\"}}"),
    }
}

/// What a caller observed on its one bd read for this claim.
fn observed(revision: &str, body_sha256: &str) -> SpecFence {
    SpecFence::Revision {
        revision: revision.to_owned(),
        body_sha256: body_sha256.to_owned(),
    }
}

#[test]
fn a_packet_open_against_one_body_refuses_a_seat_once_the_work_is_edited() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-pinned");
    let packet = ledger
        .open_packet(packet_at(&run_id, REVISION_N, BODY))
        .expect("open packet");

    // The work still renders the pinned body: the seat claims.
    let claimed = ledger
        .claim_packet(&packet, "claude:seat:1", &observed(REVISION_N, BODY))
        .expect("claim at the pinned body");
    ledger
        .fail_packet(&packet, &claimed.claim_token, "transport: reopened")
        .expect("release the packet for a re-claim");

    // The work is EDITED under the still-open packet: refused, exactly as
    // the hash check refuses a file edited under a running packet.
    let err = ledger
        .claim_packet(
            &packet,
            "claude:seat:2",
            &observed(REVISION_N1, EDITED_BODY),
        )
        .expect_err("an edited bead must refuse the claim");
    assert_eq!(err.code(), ErrorCode::SpecDrift);
    ledger.close().expect("close");
}

#[test]
fn a_revision_that_moved_without_the_body_claims_and_re_pins_the_row() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-write-token");
    let packet = ledger
        .open_packet(packet_at(&run_id, REVISION_N, BODY))
        .expect("open packet");

    // Crash resume: the reclaim and the re-claim of the run's bd lease both
    // WRITE the work, so the revision has moved by the time the resuming
    // worker re-reads it — with not one byte of the spec changed. Fencing on
    // the token here would refuse the run its own resume, forever, because
    // the old revision never comes back.
    let claimed = ledger
        .claim_packet(&packet, "claude:seat:2", &observed(REVISION_N1, BODY))
        .expect("a moved write token over an unchanged body must claim");

    let row = ledger.get_packet(&packet).expect("get packet");
    assert_eq!(
        row.spec_revision.as_deref(),
        Some(REVISION_N1),
        "the claim re-pins the row to the revision bd reports now"
    );
    assert_eq!(
        row.spec_sha256, BODY,
        "the re-pin touches the write token only — the body is what is pinned"
    );

    // And the packet is genuinely claimed, not merely re-pinned.
    ledger
        .fail_packet(&packet, &claimed.claim_token, "transport: reopened")
        .expect("the attempt exists under its own token");
    ledger.close().expect("close");
}

#[test]
fn re_opening_after_a_spec_edit_pins_the_new_body() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-repinned");
    let packet = ledger
        .open_packet(packet_at(&run_id, REVISION_N, BODY))
        .expect("open packet");

    // The edit, then the re-open the driver performs on its next advance.
    let repinned = ledger
        .open_packet(packet_at(&run_id, REVISION_N1, EDITED_BODY))
        .expect("a revised spec must re-pin, not refuse");
    assert_eq!(repinned, packet, "re-pinning adds no second packet");
    assert_eq!(ledger.list_packets(&run_id).expect("list").len(), 1);
    let row = ledger.get_packet(&packet).expect("get packet");
    assert_eq!(row.spec_revision.as_deref(), Some(REVISION_N1));
    assert_eq!(row.spec_sha256, EDITED_BODY);
    assert_eq!(
        row.body_json,
        packet_at(&run_id, REVISION_N, BODY).body_json,
        "a re-pin revises the spec columns and leaves the definition alone"
    );

    // A DIFFERING DEFINITION is not a revised spec: the packet's contract is
    // fixed when it is opened.
    let mut redefined = packet_at(&run_id, REVISION_N1, EDITED_BODY);
    redefined.body_json = "{\"schema\":\"forged.packet/1\",\"branch\":\"other\"}".to_owned();
    let err = ledger
        .open_packet(redefined)
        .expect_err("a re-open may re-pin the spec and nothing else");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);

    // And the seat now claims at the NEW body — the whole point: the run
    // survives a spec revision instead of being pinned to bytes nobody can
    // reach any more.
    assert!(ledger
        .claim_packet(
            &packet,
            "claude:seat:1",
            &observed(REVISION_N1, EDITED_BODY)
        )
        .is_ok());
    let err = ledger
        .claim_packet(&packet, "claude:seat:2", &observed(REVISION_N, BODY))
        .expect_err("the superseded body must not claim");
    assert_eq!(err.code(), ErrorCode::PacketNotClaimable);
    ledger.close().expect("close");
}

#[test]
fn a_live_or_completed_attempt_refuses_the_re_pin() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-live");
    let packet = ledger
        .open_packet(packet_at(&run_id, REVISION_N, BODY))
        .expect("open packet");
    ledger
        .claim_packet(&packet, "claude:seat:1", &observed(REVISION_N, BODY))
        .expect("claim");

    // A seat is working from the pinned bytes right now; its spec must not
    // move underneath it.
    let err = ledger
        .open_packet(packet_at(&run_id, REVISION_N1, EDITED_BODY))
        .expect_err("a live attempt must refuse the re-pin");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    assert!(
        err.to_string().contains("running"),
        "the refusal must name the blocking state: {err}"
    );
    assert_eq!(
        ledger.get_packet(&packet).expect("get packet").spec_sha256,
        BODY,
        "the refused re-pin must have written nothing"
    );
    ledger.close().expect("close");
}

#[test]
fn the_fence_arms_are_not_interchangeable() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-arms");
    let work = ledger
        .open_packet(packet_at(&run_id, REVISION_N, BODY))
        .expect("open bead-sourced packet");
    // A work-sourced packet is never claimable by presenting a hash, even
    // one equal to the row's own spec_sha256.
    let err = ledger
        .claim_packet(&work, "claude:seat:1", &SpecFence::Sha256(BODY.to_owned()))
        .expect_err("a hash must not satisfy a bead fence");
    assert_eq!(err.code(), ErrorCode::SpecDrift);

    // And the file route keeps its hash fence untouched.
    let mut file = packet_at(&run_id, REVISION_N, BODY);
    file.seq = 1;
    file.spec_revision = None;
    file.spec_sha256 = "beef".to_owned();
    file.spec_path = "/specs/legacy.md".to_owned();
    let file_packet = ledger.open_packet(file).expect("open file-sourced packet");
    let err = ledger
        .claim_packet(&file_packet, "claude:seat:1", &observed(REVISION_N, "beef"))
        .expect_err("a bead fence must not satisfy a hash fence");
    assert_eq!(err.code(), ErrorCode::SpecDrift);
    assert!(ledger
        .claim_packet(
            &file_packet,
            "claude:seat:1",
            &SpecFence::Sha256("beef".to_owned()),
        )
        .is_ok());
    ledger.close().expect("close");
}

// ------------------------------------------------- the driver's own re-pin

/// `repin_packet_spec` is the seam the driver uses, and it keeps the same
/// contract as a re-open without ever being handed the definition: the spec
/// columns move, the body does not, and there is no `body_json` parameter
/// that could move it.
#[test]
fn the_driver_repin_moves_the_spec_columns_and_nothing_else() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-driver-repin");
    let opened = packet_at(&run_id, REVISION_N, BODY);
    let definition = opened.body_json.clone();
    let packet = ledger.open_packet(opened).expect("open packet");

    ledger
        .repin_packet_spec(
            packet.clone(),
            format!("/runs/{run_id}/packets/implement/0/spec.md"),
            EDITED_BODY.to_owned(),
            Some(REVISION_N1.to_owned()),
        )
        .expect("a revised spec must re-pin");

    let row = ledger.get_packet(&packet).expect("get packet");
    assert_eq!(row.spec_sha256, EDITED_BODY);
    assert_eq!(row.spec_revision.as_deref(), Some(REVISION_N1));
    assert_eq!(
        row.body_json, definition,
        "a re-pin revises the spec columns and leaves the definition alone"
    );
    assert_eq!(
        ledger.list_packets(&run_id).expect("list").len(),
        1,
        "re-pinning adds no second packet"
    );

    // And the seat now claims at the NEW body, which is the whole point.
    assert!(ledger
        .claim_packet(
            &packet,
            "claude:seat:1",
            &observed(REVISION_N1, EDITED_BODY)
        )
        .is_ok());
    ledger.close().expect("close");
}

/// Re-pinning to what is already stored is a no-op, NOT a refusal — the
/// driver re-pins on every advance that resolves a spec, so the common case
/// is that nothing moved. It must not have to ask first.
#[test]
fn a_driver_repin_to_the_stored_values_is_a_no_op() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-repin-noop");
    let opened = packet_at(&run_id, REVISION_N, BODY);
    let path = opened.spec_path.clone();
    let packet = ledger.open_packet(opened).expect("open packet");
    ledger
        .claim_packet(&packet, "claude:seat:1", &observed(REVISION_N, BODY))
        .expect("claim");

    // A live attempt would refuse a MOVING re-pin; this one moves nothing,
    // so it must be allowed even so.
    ledger
        .repin_packet_spec(
            packet.clone(),
            path,
            BODY.to_owned(),
            Some(REVISION_N.to_owned()),
        )
        .expect("re-pinning to the stored values is a no-op");
    ledger.close().expect("close");
}

/// A seat is working from the pinned bytes right now; its spec must not move
/// underneath it, and a refused re-pin writes nothing.
#[test]
fn a_live_attempt_refuses_the_driver_repin() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-repin-live");
    let opened = packet_at(&run_id, REVISION_N, BODY);
    let path = opened.spec_path.clone();
    let packet = ledger.open_packet(opened).expect("open packet");
    ledger
        .claim_packet(&packet, "claude:seat:1", &observed(REVISION_N, BODY))
        .expect("claim");

    let err = ledger
        .repin_packet_spec(
            packet.clone(),
            path,
            EDITED_BODY.to_owned(),
            Some(REVISION_N1.to_owned()),
        )
        .expect_err("a live attempt must refuse the re-pin");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    assert!(
        err.to_string().contains("running"),
        "the refusal must name the blocking state: {err}"
    );
    assert_eq!(
        ledger.get_packet(&packet).expect("get packet").spec_sha256,
        BODY,
        "the refused re-pin must have written nothing"
    );
    ledger.close().expect("close");
}

/// A packet that was never opened cannot be re-pinned into existence: the
/// re-pin revises a row, and inventing one would hand a seat a packet no
/// `packet_open` ever fenced.
#[test]
fn an_unopened_packet_cannot_be_repinned() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-repin-absent");
    let err = ledger
        .repin_packet_spec(
            format!("{run_id}/implement/0"),
            "/spec.md".to_owned(),
            BODY.to_owned(),
            Some(REVISION_N.to_owned()),
        )
        .expect_err("an absent packet must refuse");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    ledger.close().expect("close");
}
