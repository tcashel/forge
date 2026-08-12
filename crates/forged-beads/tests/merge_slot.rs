//! bd-gated merge-slot integration test: create → acquire → busy second
//! acquire → SlotBusy; the reaper releases a recorded dead holder with that
//! exact `--holder`, refuses an unrecorded holder, and leaves a live
//! recorded holder alone.

mod support;

use std::time::Duration;

use forged_beads::{
    reap_stale_holders, slot_acquire, slot_check, slot_create, slot_release, BdError, ReapOutcome,
    RecordedHolder,
};

#[tokio::test]
async fn merge_slot_discipline_and_reaper() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("merge-slot");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);

    slot_create(&cfg).await.expect("slot create");
    let acq = slot_acquire(&cfg, "holder-x", Duration::from_millis(200))
        .await
        .expect("first acquire");
    assert_eq!(acq.holder, "holder-x");
    assert!(acq.acquired_at_epoch_s > 0, "wrapper clock reading present");

    let status = slot_check(&cfg).await.expect("check while held");
    assert!(status.held);
    assert_eq!(status.holder.as_deref(), Some("holder-x"));

    // Second acquire is refused: retried within the budget, then SlotBusy —
    // never Contention, LeaseHeld, or Beads.
    match slot_acquire(&cfg, "holder-y", Duration::from_millis(400)).await {
        Err(BdError::SlotBusy { holder }) => {
            assert_eq!(
                holder.as_deref(),
                Some("holder-x"),
                "holder from the final check"
            );
        }
        other => panic!("held acquire must end SlotBusy, got {other:?}"),
    }

    slot_release(&cfg, "holder-x")
        .await
        .expect("release holder-x");
    let status = slot_check(&cfg).await.expect("check after release");
    assert!(!status.held, "slot must be free after release");

    // Reaper: a RECORDED holder whose pid is a spawned-then-killed child
    // releases the slot with that exact holder.
    let mut child = std::process::Command::new("/bin/sleep")
        .arg("300")
        .spawn()
        .expect("spawning attempt child");
    let dead_pid = child.id();
    slot_acquire(&cfg, "reap-holder", Duration::from_millis(200))
        .await
        .expect("acquire as reap-holder");
    child.kill().expect("killing attempt child");
    child.wait().expect("reaping attempt child");
    let recorded = [RecordedHolder {
        holder: "reap-holder".to_string(),
        attempt_pid: dead_pid,
        pid_start_hint: None,
    }];
    let report = reap_stale_holders(&cfg, &recorded).await;
    assert_eq!(report.entries.len(), 1, "one outcome entry: {report:?}");
    assert_eq!(report.entries[0].holder, "reap-holder");
    assert_eq!(report.entries[0].outcome, ReapOutcome::Released);
    let status = slot_check(&cfg).await.expect("check after reap");
    assert!(
        !status.held,
        "reaper must have released the dead holder's slot"
    );

    // Reaper run while an UNRECORDED holder owns the slot refuses to act.
    slot_acquire(&cfg, "stranger", Duration::from_millis(200))
        .await
        .expect("acquire as stranger");
    let report = reap_stale_holders(&cfg, &recorded).await;
    assert_eq!(report.entries.len(), 1, "one outcome entry: {report:?}");
    assert_eq!(report.entries[0].holder, "stranger");
    assert_eq!(report.entries[0].outcome, ReapOutcome::UnknownHolder);
    let status = slot_check(&cfg).await.expect("check after refused reap");
    assert_eq!(
        status.holder.as_deref(),
        Some("stranger"),
        "an unrecorded holder must be left untouched"
    );
    slot_release(&cfg, "stranger")
        .await
        .expect("release stranger");

    // A live recorded holder is left alone.
    let mut live_child = std::process::Command::new("/bin/sleep")
        .arg("300")
        .spawn()
        .expect("spawning live attempt child");
    let live_pid = live_child.id();
    slot_acquire(&cfg, "alive-holder", Duration::from_millis(200))
        .await
        .expect("acquire as alive-holder");
    let recorded_live = [RecordedHolder {
        holder: "alive-holder".to_string(),
        attempt_pid: live_pid,
        pid_start_hint: None,
    }];
    let report = reap_stale_holders(&cfg, &recorded_live).await;
    assert_eq!(report.entries.len(), 1, "one outcome entry: {report:?}");
    assert_eq!(report.entries[0].outcome, ReapOutcome::HolderAlive);
    let status = slot_check(&cfg).await.expect("check after alive reap");
    assert!(status.held, "a live recorded holder must be left alone");
    live_child.kill().expect("killing live child");
    live_child.wait().expect("reaping live child");
    slot_release(&cfg, "alive-holder")
        .await
        .expect("release alive-holder");

    // A holder whose pid cannot be probed CONCLUSIVELY is never reaped. Pid 1
    // exists but is not ours, so `/bin/kill -0 1` fails with "Operation not
    // permitted" — a probe failure, not a death. Fail-open here would release
    // a live holder's merge slot.
    slot_acquire(&cfg, "unprobeable-holder", Duration::from_millis(200))
        .await
        .expect("acquire as unprobeable-holder");
    let recorded_unprobeable = [RecordedHolder {
        holder: "unprobeable-holder".to_string(),
        attempt_pid: 1,
        pid_start_hint: None,
    }];
    let report = reap_stale_holders(&cfg, &recorded_unprobeable).await;
    assert!(
        report
            .entries
            .iter()
            .all(|e| e.outcome != ReapOutcome::Released),
        "an inconclusive pid probe must never release: {report:?}"
    );
    let status = slot_check(&cfg)
        .await
        .expect("check after unprobeable reap");
    assert_eq!(
        status.holder.as_deref(),
        Some("unprobeable-holder"),
        "the slot must still be held after a refused reap"
    );
    slot_release(&cfg, "unprobeable-holder")
        .await
        .expect("release unprobeable-holder");
}
