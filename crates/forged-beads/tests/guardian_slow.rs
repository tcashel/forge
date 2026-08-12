//! The slow (>TTL) guardian proof, `#[ignore]` and additionally gated on
//! `FORGED_SLOW_TESTS=1`: the guardian keeps a lease alive past bd's
//! hardcoded 5-minute TTL; after the watched pid dies the lease lapses and a
//! scoped reclaim succeeds, reporting the guardian's holder as
//! `previous_owner`.
//!
//! Run by hand (no quality gate passes `-- --ignored`):
//! `FORGED_SLOW_TESTS=1 cargo test -p forged-beads -- --ignored --nocapture`
//! Expect roughly TTL + guardian runtime of wall time (~11 minutes: ~330s
//! keeping the lease alive past the original expiry, then up to ~300s for
//! the abandoned lease to lapse).

mod support;

use std::time::Duration;

use forged_beads::{claim_specific, reclaim, run_guardian, GuardianConfig, GuardianExit};

#[tokio::test]
#[ignore = "slow >TTL lease-lapse proof; FORGED_SLOW_TESTS=1 cargo test -p forged-beads -- --ignored --nocapture"]
async fn guardian_keeps_lease_alive_past_ttl_then_lapse_is_reclaimable() {
    let _guard = support::HomeBeadsGuard::new();
    if std::env::var("FORGED_SLOW_TESTS").ok().as_deref() != Some("1") {
        eprintln!("SKIP: guardian_slow requires FORGED_SLOW_TESTS=1");
        return;
    }
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("guardian-slow");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let id = support::create_bead(&bd, &s, "slow guardian bead");
    claim_specific(&cfg, &id, "slow-holder")
        .await
        .expect("claim");
    eprintln!("[slow] claimed {id} as slow-holder; TTL is 300s");

    let mut child = std::process::Command::new("/bin/sleep")
        .arg("3600")
        .spawn()
        .expect("spawning watched child");
    let beat_file = s.root.join("beats");
    let gcfg = GuardianConfig {
        bd: cfg.clone(),
        bead_id: id.clone(),
        holder: "slow-holder".to_string(),
        watch_pid: child.id(),
        watch_start_hint: None,
        cadence_s: 100, // the default: TTL/3
        beat_file: Some(beat_file.clone()),
    };
    let handle = tokio::spawn(run_guardian(gcfg));

    // Outlive the ORIGINAL 300s lease expiry while the guardian beats.
    tokio::time::sleep(Duration::from_secs(330)).await;
    let outcome = reclaim(&cfg, &id, "slow-holder", 0)
        .await
        .expect("probe reclaim during guarded life");
    assert!(
        outcome.previous_owner.is_none(),
        "the guarded lease must still be alive past the original TTL: {outcome:?}"
    );
    eprintln!("[slow] t=330s: lease still alive past the original expiry (guardian works)");

    // Kill the watched pid; the guardian must stop beating.
    child.kill().expect("killing watched child");
    child.wait().expect("reaping watched child");
    let exit = tokio::time::timeout(Duration::from_secs(130), handle)
        .await
        .expect("guardian must exit within ~1 cadence of pid death")
        .expect("guardian task");
    assert_eq!(exit, GuardianExit::WatchedPidExited);
    let beats = std::fs::read_to_string(&beat_file).unwrap_or_default();
    eprintln!(
        "[slow] guardian exited after pid death; {} beats recorded",
        beats.lines().count()
    );

    // With no heartbeats, the lease lapses within TTL; a scoped reclaim then
    // succeeds and reports the guardian's holder as previous_owner.
    let mut reclaimed = None;
    for round in 0..20u32 {
        tokio::time::sleep(Duration::from_secs(30)).await;
        let outcome = reclaim(&cfg, &id, "slow-holder", 0)
            .await
            .expect("post-lapse reclaim probe");
        eprintln!("[slow] reclaim probe {round}: {outcome:?}");
        if outcome.previous_owner.is_some() {
            reclaimed = Some(outcome);
            break;
        }
    }
    let outcome = reclaimed.expect("the abandoned lease must lapse and reclaim within ~10 min");
    assert!(outcome.scoped);
    assert_eq!(
        outcome.previous_owner.as_deref(),
        Some("slow-holder"),
        "reclaim must report the guardian's holder as previous_owner"
    );
    eprintln!("[slow] PASS: lease lapsed after pid death and scoped reclaim reported previous_owner=slow-holder");
}
