//! The spec fence: a packet is pinned to a bead revision (or, on the
//! deprecated file route, a content hash), and the two halves of the
//! contract that fence has to keep at once — an open packet refuses a seat
//! once the bead moves, and a re-open re-pins it so the run recovers.

use forged_ledger::{Ledger, NewPacket, NewRun, SpecFence};
use forged_types::{ErrorCode, RunId, Stage};

const REVISION_N: &str = "9146914492635073757";
const REVISION_N1: &str = "-6192208415116251521";

fn ledger(dir: &tempfile::TempDir) -> Ledger {
    Ledger::open(&dir.path().join("state.db")).expect("open")
}

fn run(ledger: &Ledger, id: &str) -> String {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(id).expect("valid run id"),
            bead_id: "bead-1".to_owned(),
            repo: "/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: format!("forged/{id}"),
        })
        .expect("create run")
        .run_id
}

fn packet_at(run_id: &str, revision: &str) -> NewPacket {
    NewPacket {
        run_id: run_id.to_owned(),
        stage: Stage::Implement,
        seq: 0,
        spec_path: format!("/runs/{run_id}/packets/implement/0/spec.md"),
        spec_sha256: format!("sha-of-{revision}"),
        spec_revision: Some(revision.to_owned()),
        body_json: format!("{{\"schema\":\"forged.packet/1\",\"rev\":\"{revision}\"}}"),
    }
}

#[test]
fn a_packet_open_against_revision_n_refuses_a_seat_once_the_bead_moves() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-pinned");
    let packet = ledger
        .open_packet(packet_at(&run_id, REVISION_N))
        .expect("open packet");

    // The bead is still at N: the seat claims.
    let claimed = ledger
        .claim_packet(
            &packet,
            "claude:seat:1",
            &SpecFence::Revision(REVISION_N.to_owned()),
        )
        .expect("claim at the pinned revision");
    ledger
        .fail_packet(&packet, &claimed.claim_token, "transport: reopened")
        .expect("release the packet for a re-claim");

    // The bead moves to N+1 under the still-open packet: refused, exactly as
    // the hash check refuses a file edited under a running packet.
    let err = ledger
        .claim_packet(
            &packet,
            "claude:seat:2",
            &SpecFence::Revision(REVISION_N1.to_owned()),
        )
        .expect_err("a moved bead must refuse the claim");
    assert_eq!(err.code(), ErrorCode::SpecDrift);
    ledger.close().expect("close");
}

#[test]
fn re_opening_after_a_spec_edit_pins_the_new_revision() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-repinned");
    let packet = ledger
        .open_packet(packet_at(&run_id, REVISION_N))
        .expect("open packet");

    // The edit, then the re-open the driver performs on its next advance.
    let repinned = ledger
        .open_packet(packet_at(&run_id, REVISION_N1))
        .expect("a revised spec must re-pin, not refuse");
    assert_eq!(repinned, packet, "re-pinning adds no second packet");
    assert_eq!(ledger.list_packets(&run_id).expect("list").len(), 1);
    let row = ledger.get_packet(&packet).expect("get packet");
    assert_eq!(row.spec_revision.as_deref(), Some(REVISION_N1));
    assert_eq!(row.spec_sha256, format!("sha-of-{REVISION_N1}"));

    // And the seat now claims at the NEW revision — the whole point: the
    // run survives a spec revision instead of being pinned to bytes nobody
    // can reach.
    assert!(ledger
        .claim_packet(
            &packet,
            "claude:seat:1",
            &SpecFence::Revision(REVISION_N1.to_owned()),
        )
        .is_ok());
    let err = ledger
        .claim_packet(
            &packet,
            "claude:seat:2",
            &SpecFence::Revision(REVISION_N.to_owned()),
        )
        .expect_err("the superseded revision must not claim");
    assert_eq!(err.code(), ErrorCode::PacketNotClaimable);
    ledger.close().expect("close");
}

#[test]
fn a_live_or_completed_attempt_refuses_the_re_pin() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-live");
    let packet = ledger
        .open_packet(packet_at(&run_id, REVISION_N))
        .expect("open packet");
    ledger
        .claim_packet(
            &packet,
            "claude:seat:1",
            &SpecFence::Revision(REVISION_N.to_owned()),
        )
        .expect("claim");

    // A seat is working from the pinned bytes right now; its spec must not
    // move underneath it.
    let err = ledger
        .open_packet(packet_at(&run_id, REVISION_N1))
        .expect_err("a live attempt must refuse the re-pin");
    assert_eq!(err.code(), ErrorCode::InvalidRequest);
    assert!(
        err.to_string().contains("running"),
        "the refusal must name the blocking state: {err}"
    );
    assert_eq!(
        ledger
            .get_packet(&packet)
            .expect("get packet")
            .spec_revision
            .as_deref(),
        Some(REVISION_N),
        "the refused re-pin must have written nothing"
    );
    ledger.close().expect("close");
}

#[test]
fn the_fence_arms_are_not_interchangeable() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = ledger(&dir);
    let run_id = run(&ledger, "run-arms");
    let bead = ledger
        .open_packet(packet_at(&run_id, REVISION_N))
        .expect("open bead-sourced packet");
    // A bead-sourced packet is never claimable by presenting a hash, even
    // one equal to the row's own spec_sha256.
    let err = ledger
        .claim_packet(
            &bead,
            "claude:seat:1",
            &SpecFence::Sha256(format!("sha-of-{REVISION_N}")),
        )
        .expect_err("a hash must not satisfy a revision fence");
    assert_eq!(err.code(), ErrorCode::SpecDrift);

    // And the file route keeps its hash fence untouched.
    let mut file = packet_at(&run_id, REVISION_N);
    file.seq = 1;
    file.spec_revision = None;
    file.spec_sha256 = "beef".to_owned();
    file.spec_path = "/specs/legacy.md".to_owned();
    let file_packet = ledger.open_packet(file).expect("open file-sourced packet");
    let err = ledger
        .claim_packet(
            &file_packet,
            "claude:seat:1",
            &SpecFence::Revision(REVISION_N.to_owned()),
        )
        .expect_err("a revision must not satisfy a hash fence");
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
