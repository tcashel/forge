//! bd-gated fast guardian tests: beats accrue while the watched pid lives,
//! the guardian returns `WatchedPidExited` within ~2 cadences of the pid
//! dying and beats no further, and a non-owner holder gets `LeaseLost` on
//! its first round.

mod support;

use std::time::Duration;

use forged_beads::{claim_specific, run_guardian, GuardianConfig, GuardianExit};

fn beat_count(path: &std::path::Path) -> usize {
    std::fs::read_to_string(path)
        .map(|s| s.lines().filter(|l| !l.trim().is_empty()).count())
        .unwrap_or(0)
}

#[tokio::test]
async fn guardian_beats_then_returns_watched_pid_exited() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("guardian-fast");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let id = support::create_bead(&bd, &s, "guardian bead");
    claim_specific(&cfg, &id, "guard-holder").await.expect("claim");

    let mut child = std::process::Command::new("/bin/sleep")
        .arg("300")
        .spawn()
        .expect("spawning watched child");
    let beat_file = s.root.join("beats");
    let gcfg = GuardianConfig {
        bd: cfg.clone(),
        bead_id: id.clone(),
        holder: "guard-holder".to_string(),
        watch_pid: child.id(),
        watch_start_hint: None,
        cadence_s: 2,
        beat_file: Some(beat_file.clone()),
    };
    let handle = tokio::spawn(run_guardian(gcfg));

    // At cadence 2 the beat file accrues >= 2 beats within ~7s.
    let mut waited = 0u64;
    while beat_count(&beat_file) < 2 && waited < 20 {
        tokio::time::sleep(Duration::from_secs(1)).await;
        waited += 1;
    }
    assert!(
        beat_count(&beat_file) >= 2,
        "expected >= 2 beats while the watched pid lives, got {}",
        beat_count(&beat_file)
    );

    // Killing the child makes the guardian return WatchedPidExited within
    // ~2 cadences and beat no further.
    child.kill().expect("killing watched child");
    child.wait().expect("reaping watched child");
    let exit = tokio::time::timeout(Duration::from_secs(8), handle)
        .await
        .expect("guardian must exit within ~2 cadences of pid death")
        .expect("guardian task");
    assert_eq!(exit, GuardianExit::WatchedPidExited);
    let after_exit = beat_count(&beat_file);
    tokio::time::sleep(Duration::from_secs(3)).await;
    assert_eq!(
        beat_count(&beat_file),
        after_exit,
        "no beats may land after WatchedPidExited"
    );
}

#[tokio::test]
async fn guardian_with_non_owner_holder_returns_lease_lost_first_round() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("guardian-nonowner");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let id = support::create_bead(&bd, &s, "non-owner guardian bead");
    claim_specific(&cfg, &id, "real-owner").await.expect("claim");

    let mut child = std::process::Command::new("/bin/sleep")
        .arg("300")
        .spawn()
        .expect("spawning watched child");
    let gcfg = GuardianConfig {
        bd: cfg.clone(),
        bead_id: id.clone(),
        holder: "not-the-owner".to_string(),
        watch_pid: child.id(),
        watch_start_hint: None,
        cadence_s: 2,
        beat_file: None,
    };
    let exit = tokio::time::timeout(Duration::from_secs(15), run_guardian(gcfg))
        .await
        .expect("non-owner guardian must return on its first round");
    assert_eq!(exit, GuardianExit::LeaseLost);
    child.kill().expect("killing watched child");
    child.wait().expect("reaping watched child");
}
