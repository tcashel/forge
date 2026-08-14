//! bd-gated terminal ownership contracts against pinned bd 1.2.1.

mod support;

use forged_beads::{
    claim_specific, close_issue, comment_once, release_issue, release_unresolved_issue, show_issue,
};

#[tokio::test]
async fn unresolved_release_is_guarded_and_actionable() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("settlement-unresolved");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let id = support::create_bead(&bd, &s, "unresolved terminal bead");
    claim_specific(&cfg, &id, "forged:test:0")
        .await
        .expect("claim");

    assert!(comment_once(
        &cfg,
        &id,
        "forged:test:0",
        "[forged-run:test:blocked]",
        "waiting for operator input",
    )
    .await
    .expect("comment"));
    assert!(
        !comment_once(
            &cfg,
            &id,
            "forged:test:0",
            "[forged-run:test:blocked]",
            "waiting for operator input",
        )
        .await
        .expect("comment replay"),
        "the durable marker deduplicates a crash replay"
    );

    let issue = release_unresolved_issue(&cfg, &id, "forged:test:0", true)
        .await
        .expect("release blocked");
    assert_eq!(issue.status, "blocked");
    assert_eq!(issue.assignee, None);
    let replay = release_unresolved_issue(&cfg, &id, "forged:test:0", true)
        .await
        .expect("idempotent replay");
    assert_eq!(replay, issue);
}

#[tokio::test]
async fn landed_close_clears_historical_assignment() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("settlement-landed");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let id = support::create_bead(&bd, &s, "landed terminal bead");
    claim_specific(&cfg, &id, "forged:test:0")
        .await
        .expect("claim");

    close_issue(&cfg, &id, "forged:test:0", "PR #7 at deadbeef")
        .await
        .expect("close");
    let released = release_issue(&cfg, &id, "forged:test:0")
        .await
        .expect("release");
    assert_eq!(released.status, "closed");
    assert_eq!(released.assignee, None);
    assert_eq!(show_issue(&cfg, &id).await.expect("show").assignee, None);
}
