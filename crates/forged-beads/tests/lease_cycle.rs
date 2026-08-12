//! bd-gated lease-cycle integration test: create → claim → heartbeat ok →
//! wrong-actor heartbeat refused → scoped reclaim at `--older-than 0s`
//! against the unexpired lease returns Ok with `scoped: true` and an EMPTY
//! reclaimed list, and the bead keeps its original assignee.

mod support;

use forged_beads::{claim_specific, heartbeat, invoke, reclaim, BdError};
use serde_json::Value;

#[tokio::test]
async fn lease_cycle() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("lease-cycle");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let id = support::create_bead(&bd, &s, "lease cycle bead");

    let claimed = claim_specific(&cfg, &id, "actor-a").await.expect("claim");
    assert_eq!(claimed.id, id);
    assert_eq!(claimed.assignee, "actor-a");

    heartbeat(&cfg, &id, "actor-a")
        .await
        .expect("owner heartbeat");

    match heartbeat(&cfg, &id, "actor-b").await {
        Err(BdError::HeartbeatRefused { bead, stderr }) => {
            assert_eq!(bead, id);
            assert!(
                stderr.contains("already claimed") || stderr.contains("not claimable"),
                "unexpected refusal copy: {stderr}"
            );
        }
        other => panic!("wrong-actor heartbeat must be HeartbeatRefused, got {other:?}"),
    }

    // Scoped reclaim of the UNEXPIRED lease: bd exits 0 — refusal is
    // expressed as an empty result, not an error.
    let outcome = reclaim(&cfg, &id, "actor-a", 0)
        .await
        .expect("scoped reclaim of an unexpired lease is Ok");
    assert!(outcome.scoped, "expected scoped: true, got {outcome:?}");
    assert!(
        outcome.previous_owner.is_none(),
        "unexpired lease must not be reclaimed: {outcome:?}"
    );

    // The bead keeps its original assignee.
    let show = invoke::read(&cfg, &["show", &id, "--json"])
        .await
        .expect("show");
    let obj = forged_beads::envelope::first_obj(&show).expect("show data");
    assert_eq!(
        obj.get("assignee").and_then(Value::as_str),
        Some("actor-a"),
        "assignee must be intact after the refused reclaim"
    );
}
