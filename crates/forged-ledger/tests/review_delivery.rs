//! Migration-019 review delivery identity, transitions, and contention.

use std::fmt::Write as _;
use std::sync::{Arc, Barrier};

use forged_ledger::{
    Ledger, NewReviewFindingDelivery, NewRun, ReviewFindingDeliveryClaim, ReviewFindingDeliveryKey,
    ReviewFindingDeliveryOutcome, ReviewFindingDeliveryState,
};
use forged_types::{canonical_json_bytes, ReviewEpochKind, RunId};
use serde_json::json;
use sha2::{Digest, Sha256};

fn fixture() -> (tempfile::TempDir, Ledger, NewReviewFindingDelivery) {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    ledger
        .create_run(NewRun {
            run_id: RunId::new("review-ledger").expect("run id"),
            work_id: "bead-review-ledger".to_owned(),
            repo: "/tmp/repo".to_owned(),
            base_ref: "main".to_owned(),
            branch: "forged/review-ledger".to_owned(),
        })
        .expect("run");
    let canonical = canonical_json_bytes(&json!({
        "severity": "high",
        "file": "src/lib.rs",
        "line": 7,
        "message": "finding"
    }))
    .expect("canonical");
    let finding_id =
        Sha256::digest(&canonical)
            .iter()
            .fold(String::with_capacity(64), |mut out, byte| {
                let _ = write!(out, "{byte:02x}");
                out
            });
    let delivery = NewReviewFindingDelivery {
        key: ReviewFindingDeliveryKey {
            run_id: "review-ledger".to_owned(),
            repository_slug: "acme/widget".to_owned(),
            pr_number: 42,
            review_epoch_kind: ReviewEpochKind::SemanticRound,
            review_epoch: 2,
            snapshot_sha256: "b".repeat(64),
            finding_id: finding_id.clone(),
        },
        pr_url: "https://github.com/acme/widget/pull/42".to_owned(),
        canonical_finding_json: String::from_utf8(canonical).expect("utf8"),
        finding_sha256: finding_id,
    };
    (dir, ledger, delivery)
}

#[test]
fn exact_intent_transitions_uncertain_then_reconciles_to_permanent_delivery() {
    let (_dir, ledger, delivery) = fixture();
    let rows = ledger
        .prepare_review_finding_deliveries(vec![delivery.clone()])
        .expect("prepare");
    assert_eq!(rows[0].state, ReviewFindingDeliveryState::Pending);
    assert_eq!(rows[0].attempt_count, 0);

    let claimed = ledger
        .claim_review_finding_delivery(
            delivery.key.clone(),
            "2026-08-15T00:00:00.000000000Z".to_owned(),
            "2026-08-15T00:15:00.000000000Z".to_owned(),
        )
        .expect("claim");
    let ReviewFindingDeliveryClaim::Claimed(claimed) = claimed else {
        panic!("expected fresh claim")
    };
    let token = claimed.delivery_token.expect("token");
    let uncertain = ledger
        .mark_review_finding_delivery_uncertain(delivery.key.clone(), token.clone())
        .expect("pre-post marker");
    assert_eq!(uncertain.state, ReviewFindingDeliveryState::Uncertain);
    assert_eq!(uncertain.attempt_count, 1);
    let uncertain = ledger
        .uncertain_review_finding_delivery(delivery.key.clone(), token, "response lost".to_owned())
        .expect("record ambiguity");
    assert_eq!(uncertain.last_error.as_deref(), Some("response lost"));
    assert!(uncertain.delivery_token.is_none());

    let claimed = ledger
        .claim_review_finding_delivery(
            delivery.key.clone(),
            "2026-08-15T00:16:00.000000000Z".to_owned(),
            "2026-08-15T00:31:00.000000000Z".to_owned(),
        )
        .expect("reclaim");
    let ReviewFindingDeliveryClaim::Claimed(claimed) = claimed else {
        panic!("expected reconciliation claim")
    };
    let delivered = ledger
        .deliver_review_finding(
            delivery.key.clone(),
            claimed.delivery_token.expect("token"),
            ReviewFindingDeliveryOutcome::AlreadyPresent,
            format!("<!-- anvil-finding id={} -->", delivery.key.finding_id),
        )
        .expect("deliver");
    assert_eq!(delivered.state, ReviewFindingDeliveryState::Delivered);
    assert_eq!(
        delivered.external_outcome,
        Some(ReviewFindingDeliveryOutcome::AlreadyPresent)
    );

    assert!(matches!(
        ledger
            .claim_review_finding_delivery(
                delivery.key,
                "2026-08-16T00:00:00.000000000Z".to_owned(),
                "2026-08-16T00:15:00.000000000Z".to_owned(),
            )
            .expect("delivered replay"),
        ReviewFindingDeliveryClaim::Delivered(_)
    ));
}

#[test]
fn concurrent_publishers_have_one_cas_winner() {
    let (_dir, ledger, delivery) = fixture();
    ledger
        .prepare_review_finding_deliveries(vec![delivery.clone()])
        .expect("prepare");
    let barrier = Arc::new(Barrier::new(8));
    let mut threads = Vec::new();
    for _ in 0..8 {
        let ledger = ledger.clone();
        let key = delivery.key.clone();
        let barrier = Arc::clone(&barrier);
        threads.push(std::thread::spawn(move || {
            barrier.wait();
            ledger
                .claim_review_finding_delivery(
                    key,
                    "2026-08-15T00:00:00.000000000Z".to_owned(),
                    "2026-08-15T00:15:00.000000000Z".to_owned(),
                )
                .expect("claim outcome")
        }));
    }
    let outcomes: Vec<_> = threads
        .into_iter()
        .map(|thread| thread.join().expect("thread"))
        .collect();
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| matches!(outcome, ReviewFindingDeliveryClaim::Claimed(_)))
            .count(),
        1
    );
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| matches!(outcome, ReviewFindingDeliveryClaim::Busy(_)))
            .count(),
        7
    );
}

#[test]
fn immutable_key_conflicts_and_corrupt_digest_decoding_fail_closed() {
    let (dir, ledger, delivery) = fixture();
    ledger
        .prepare_review_finding_deliveries(vec![delivery.clone()])
        .expect("prepare");
    let mut conflicting = delivery.clone();
    conflicting.pr_url = "https://github.com/acme/other/pull/42".to_owned();
    let error = ledger
        .prepare_review_finding_deliveries(vec![conflicting])
        .expect_err("same key cannot change target");
    assert_eq!(error.code(), forged_types::ErrorCode::InvalidRequest);
    ledger.close().expect("close");

    let path = dir.path().join("state.db");
    let connection = rusqlite::Connection::open(&path).expect("raw db");
    connection
        .execute_batch("PRAGMA ignore_check_constraints=ON;")
        .expect("test corruption mode");
    connection
        .execute(
            "UPDATE review_finding_deliveries SET finding_sha256 = ?1",
            ["c".repeat(64)],
        )
        .expect("corrupt digest");
    drop(connection);

    let ledger = Ledger::open(&path).expect("reopen");
    let error = ledger
        .prepare_review_finding_deliveries(vec![delivery])
        .expect_err("digest corruption fails closed");
    assert_eq!(error.code(), forged_types::ErrorCode::Internal);
    assert!(error.to_string().contains("identity") || error.to_string().contains("digest"));
}

#[test]
fn partial_delivered_evidence_and_pending_errors_fail_closed() {
    for corruption in [
        "external_outcome = 'posted'",
        "last_error = 'impossible pending error'",
        "pr_url = 'https://github.com/acme/other/pull/42'",
        "canonical_finding_json = '{\"severity\":\"high\",\"file\":\"src/lib.rs\",\"line\":7,\"message\":\"finding\",\"extra\":true}'",
    ] {
        let (dir, ledger, delivery) = fixture();
        ledger
            .prepare_review_finding_deliveries(vec![delivery.clone()])
            .expect("prepare");
        ledger.close().expect("close");

        let path = dir.path().join("state.db");
        let connection = rusqlite::Connection::open(&path).expect("raw db");
        connection
            .execute_batch("PRAGMA ignore_check_constraints=ON;")
            .expect("test corruption mode");
        connection
            .execute(
                &format!("UPDATE review_finding_deliveries SET {corruption}"),
                [],
            )
            .expect("corrupt delivery state");
        drop(connection);

        let ledger = Ledger::open(&path).expect("reopen");
        let error = ledger
            .prepare_review_finding_deliveries(vec![delivery])
            .expect_err("impossible state fails closed");
        assert_eq!(error.code(), forged_types::ErrorCode::Internal);
    }
}
