//! Cross-connection races: independently-opened `Ledger`s on the same DB
//! file exercise the same file-level SQLite locking a multi-process race
//! would, without a helper binary.

use std::sync::{Arc, Barrier};

use forged_ledger::{AttemptState, Ledger, NewPacket, NewRun, SpecFence};
use forged_types::{ErrorCode, RunId, Stage};

fn seed_packet(ledger: &Ledger, run_id: &str) -> String {
    ledger
        .create_run(NewRun {
            run_id: RunId::new(run_id).expect("valid run id"),
            bead_id: "bead-race".to_owned(),
            repo: "example/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: format!("feat/{run_id}"),
        })
        .expect("create run");
    ledger
        .open_packet(NewPacket {
            run_id: run_id.to_owned(),
            stage: Stage::Implement,
            seq: 1,
            spec_path: "specs/race.md".to_owned(),
            spec_sha256: "feed".to_owned(),
            spec_revision: None,
            body_json: "{}".to_owned(),
        })
        .expect("open packet")
}

/// 8 threads, EACH holding its own independently-opened `Ledger` on the same
/// temp DB file, barrier-released to claim the same packet: exactly one
/// wins; the other seven all get `PacketNotClaimable`; exactly one `running`
/// attempt row exists afterward.
#[test]
fn eight_independent_ledgers_race_one_claim() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let seeder = Ledger::open(&path).expect("open seeder");
    let packet = seed_packet(&seeder, "run-race");

    let barrier = Arc::new(Barrier::new(8));
    let mut handles = Vec::new();
    for idx in 0..8 {
        let path = path.clone();
        let packet = packet.clone();
        let barrier = Arc::clone(&barrier);
        handles.push(std::thread::spawn(move || {
            let ledger = Ledger::open(&path).expect("independent open");
            barrier.wait();
            let outcome = ledger.claim_packet(
                &packet,
                &format!("claude:racer-{idx}:1"),
                &SpecFence::Sha256("feed".to_owned()),
            );
            ledger.close().expect("close racer");
            outcome
        }));
    }

    let mut wins = 0;
    let mut refusals = 0;
    for handle in handles {
        match handle.join().expect("racer thread") {
            Ok(_) => wins += 1,
            Err(err) => {
                assert_eq!(err.code(), ErrorCode::PacketNotClaimable, "{err}");
                refusals += 1;
            }
        }
    }
    assert_eq!(wins, 1, "exactly one winner");
    assert_eq!(refusals, 7);

    let live = seeder.list_live_attempts(None).expect("live attempts");
    assert_eq!(live.len(), 1);
    assert_eq!(live[0].state, AttemptState::Running);
    seeder.close().expect("close seeder");
}

/// 8 threads calling `Ledger::open` on the same fresh temp path all return
/// Ok and `user_version` ends at the latest embedded migration.
#[test]
fn eight_concurrent_opens_migrate_once() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");

    let barrier = Arc::new(Barrier::new(8));
    let mut handles = Vec::new();
    for _ in 0..8 {
        let path = path.clone();
        let barrier = Arc::clone(&barrier);
        handles.push(std::thread::spawn(move || {
            barrier.wait();
            Ledger::open(&path)
        }));
    }
    let mut ledgers = Vec::new();
    for handle in handles {
        ledgers.push(handle.join().expect("open thread").expect("open succeeds"));
    }
    for ledger in &ledgers {
        assert_eq!(ledger.pragmas().expect("pragmas").user_version, 20);
    }
    for ledger in ledgers {
        ledger.close().expect("close");
    }
}

/// 8 clones of ONE ledger, barrier-released to `close` concurrently: every
/// closer returns `Ok` — and only after the writer thread has exited (close
/// holds the writer mutex across the join), so the immediate reopen races
/// nothing.
#[test]
fn concurrent_closers_all_wait_for_the_writer_to_exit() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).expect("open");
    seed_packet(&ledger, "run-close-race");

    let barrier = Arc::new(Barrier::new(8));
    let mut handles = Vec::new();
    for _ in 0..8 {
        let clone = ledger.clone();
        let barrier = Arc::clone(&barrier);
        handles.push(std::thread::spawn(move || {
            barrier.wait();
            clone.close()
        }));
    }
    drop(ledger);
    for handle in handles {
        handle
            .join()
            .expect("closer thread")
            .expect("every concurrent close is Ok");
    }

    // Reopen immediately — no sleep anywhere: every closer waited for the
    // real exit, including the ones that found the handle already taken.
    let reopened = Ledger::open(&path).expect("reopen");
    assert_eq!(
        reopened.list_runs().expect("list").len(),
        1,
        "state persisted"
    );
    reopened.close().expect("close reopened");
}

/// Spec drift: a claim whose re-hashed spec differs from the stored hash
/// refuses with `SpecDrift` and inserts no attempt row.
#[test]
fn spec_drift_refuses_and_inserts_nothing() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("open");
    let packet = seed_packet(&ledger, "run-drift");

    let err = ledger
        .claim_packet(
            &packet,
            "claude:sess:1",
            &SpecFence::Sha256("0000".to_owned()),
        )
        .expect_err("drifted hash must refuse");
    assert_eq!(err.code(), ErrorCode::SpecDrift);
    assert!(
        ledger
            .list_live_attempts(None)
            .expect("live attempts")
            .is_empty(),
        "no attempt row inserted"
    );
    ledger.close().expect("close");
}
