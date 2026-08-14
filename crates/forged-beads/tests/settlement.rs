//! bd-gated terminal ownership contracts against pinned bd 1.2.1.

mod support;

use forged_beads::{
    claim_specific, close_held_issue, comment_once, release_unresolved_issue, show_issue, BdError,
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
async fn landed_close_is_one_guarded_close_and_release_with_idempotent_replay() {
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

    let closed = close_held_issue(&cfg, &id, "forged:test:0")
        .await
        .expect("close");
    assert_eq!(closed.status, "closed");
    assert_eq!(closed.assignee, None);
    let replay = close_held_issue(&cfg, &id, "forged:test:0")
        .await
        .expect("identical replay");
    assert_eq!(replay, closed);
    assert_eq!(show_issue(&cfg, &id).await.expect("show").assignee, None);
}

#[tokio::test]
async fn landed_close_cannot_mutate_successor_or_unowned_beads() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("settlement-landed-successor");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);

    let successor_id = support::create_bead(&bd, &s, "successor-owned terminal bead");
    claim_specific(&cfg, &successor_id, "forged:predecessor:0")
        .await
        .expect("predecessor claim");
    release_unresolved_issue(&cfg, &successor_id, "forged:predecessor:0", false)
        .await
        .expect("release predecessor");
    claim_specific(&cfg, &successor_id, "forged:successor:0")
        .await
        .expect("successor claim");
    let successor_before = show_issue(&cfg, &successor_id)
        .await
        .expect("show successor");
    let error = close_held_issue(&cfg, &successor_id, "forged:predecessor:0")
        .await
        .expect_err("predecessor must not close successor work");
    assert!(
        matches!(
            &error,
            BdError::LeaseHeld {
                holder: Some(holder),
                ..
            } if holder == "forged:successor:0"
        ),
        "unexpected successor refusal: {error}"
    );
    assert_eq!(
        show_issue(&cfg, &successor_id)
            .await
            .expect("show successor after"),
        successor_before,
        "foreign ownership refusal must write nothing"
    );

    let unowned_id = support::create_bead(&bd, &s, "unowned terminal bead");
    let unowned_before = show_issue(&cfg, &unowned_id).await.expect("show unowned");
    let error = close_held_issue(&cfg, &unowned_id, "forged:predecessor:0")
        .await
        .expect_err("unowned Bead is not predecessor-owned");
    assert!(
        matches!(&error, BdError::LeaseHeld { holder: None, .. }),
        "unexpected unowned refusal: {error}"
    );
    assert_eq!(
        show_issue(&cfg, &unowned_id)
            .await
            .expect("show unowned after"),
        unowned_before,
        "unowned refusal must write nothing"
    );
}
