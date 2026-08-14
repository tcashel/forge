//! The bd JSON shape the bead-sourced spec depends on.
//!
//! `acceptance_criteria` and `revision` are in bd's documented output
//! contract. `design`, `notes`, and `spec_id` round-trip in 1.2.1 but are
//! NOT documented, so this test is the only thing standing between a bd
//! upgrade that quietly drops one of them and forged handing a seat a spec
//! with a section silently missing.
//!
//! It must fail loudly, not skip: `support::require_bd` PANICS when a bd
//! binary is present at an unaccepted version — the upgrade case, which is
//! exactly when this contract is most likely to have moved — and when
//! `FORGED_REQUIRE_BD=1` declares that a run without bd is a failed run. The
//! one skippable state left is a machine that provisioned no bd at all.

mod support;

use std::path::Path;

use forged_beads::show_issue;
use serde_json::Value;

const CONTEXT: &str = "the context body";
const ACCEPTANCE: &str = "the acceptance body";
const DESIGN: &str = "the design body";
const NOTES: &str = "the notes body";
const SPEC_ID: &str = "spec-42";

/// Create a bead carrying every spec field, returning its id.
fn create_spec_bead(bd: &Path, s: &support::Scratch) -> String {
    let out = support::raw_bd(
        bd,
        s,
        &[
            "create",
            "spec contract probe",
            "--context",
            CONTEXT,
            "--acceptance",
            ACCEPTANCE,
            "--design",
            DESIGN,
            "--notes",
            NOTES,
            "--spec-id",
            SPEC_ID,
            "--json",
        ],
    )
    .output()
    .expect("spawning bd create");
    assert!(
        out.status.success(),
        "bd create with the spec flags failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let value: Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("create envelope");
    value
        .get("data")
        .and_then(|data| data.get("id"))
        .and_then(Value::as_str)
        .expect("created bead id")
        .to_owned()
}

#[tokio::test]
async fn bd_show_carries_every_spec_field_and_a_revision() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("spec-contract");
    support::init_store(&bd, &s);
    let id = create_spec_bead(&bd, &s);

    // The raw shape first: these exact key names are what forged reads.
    let raw = support::show_bead(&bd, &s, &id);
    for (key, expected) in [
        ("description", CONTEXT),
        ("acceptance_criteria", ACCEPTANCE),
        ("design", DESIGN),
        ("notes", NOTES),
        ("spec_id", SPEC_ID),
    ] {
        let actual = raw.get(key).and_then(Value::as_str).unwrap_or_else(|| {
            panic!("bd show dropped {key:?} — the spec body loses a section: {raw}")
        });
        assert!(
            actual.contains(expected),
            "bd show {key:?} lost its content: {actual:?}"
        );
    }
    assert!(
        raw.get("revision").is_some_and(Value::is_number),
        "bd show must carry `revision` as a number — it is the packet fence: {raw}"
    );

    // And the typed read forged actually uses.
    let cfg = support::cfg_for(&bd, &s);
    let issue = show_issue(&cfg, &id).await.expect("show_issue");
    assert!(issue.description.contains(CONTEXT));
    assert_eq!(issue.acceptance_criteria, ACCEPTANCE);
    assert_eq!(issue.design, DESIGN);
    assert_eq!(issue.notes, NOTES);
    assert_eq!(issue.spec_id.as_deref(), Some(SPEC_ID));
    let revision = issue.revision.expect("a bead must report a revision");
    assert!(
        revision
            .trim_start_matches('-')
            .chars()
            .all(|c| c.is_ascii_digit())
            && !revision.is_empty(),
        "revision must survive as bd's own digits, sign included: {revision:?}"
    );
}

#[tokio::test]
async fn a_spec_edit_mints_a_new_revision() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("spec-contract-revision");
    support::init_store(&bd, &s);
    let id = create_spec_bead(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let before = show_issue(&cfg, &id)
        .await
        .expect("show before")
        .revision
        .expect("revision before");

    // A guarded write to a spec field is exactly what run revision means.
    let out = support::raw_bd(
        &bd,
        &s,
        &[
            "update",
            &id,
            "--design",
            "the design body, revised",
            "--json",
        ],
    )
    .output()
    .expect("spawning bd update");
    assert!(
        out.status.success(),
        "bd update --design failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    let after = show_issue(&cfg, &id).await.expect("show after");
    assert_eq!(after.design, "the design body, revised");
    assert_ne!(
        after.revision.expect("revision after"),
        before,
        "a write must mint a new revision — the fence detects drift by equality alone"
    );
    // Untouched fields keep their content, so the rendered body only changes
    // where the operator changed it.
    assert_eq!(after.acceptance_criteria, ACCEPTANCE);
    assert_eq!(after.notes, NOTES);
}

/// A bead that does not exist is an ANSWER, not an outage.
///
/// bd 1.2.1 refuses an unknown id with exit 1 and its envelope still
/// delivered. Charging that to a bounded transport-retry budget would spend
/// every retry and its backoff re-reading the same refusal before the run
/// reported the one thing an operator can act on — a deleted or mistyped
/// bead id. If a bd upgrade ever stops emitting the envelope on this path,
/// this test is what catches the misclassification.
#[tokio::test]
async fn a_bead_that_does_not_exist_is_not_a_transport_failure() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("spec-contract-missing");
    support::init_store(&bd, &s);
    // A store with a real bead in it, so the refusal is about the id alone.
    create_spec_bead(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);

    let err = show_issue(&cfg, "no-such-bead-xyz")
        .await
        .expect_err("bd must refuse an unknown id");
    assert!(
        !err.is_transport(),
        "an answered refusal must fail fast, not ride the retry budget: {err}"
    );
}

/// The reason the packet fence is the RENDERED BODY and not the revision.
///
/// bd's `revision` is a write token: a lease claim and a status change mint
/// a new one with not one byte of the spec touched, and the old value never
/// comes back. Every crash resume forged performs writes the bead — reclaim,
/// then re-claim — BEFORE it re-reads the spec, so a packet fenced on the
/// token would refuse its own resume as drift, permanently. If this test
/// ever starts failing because bd made `revision` content-derived, the fence
/// could be simplified; until then it must not be.
#[tokio::test]
async fn a_lease_write_mints_a_new_revision_though_the_spec_is_untouched() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("spec-contract-write-token");
    support::init_store(&bd, &s);
    let id = create_spec_bead(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let before = show_issue(&cfg, &id).await.expect("show before");
    let before_revision = before.revision.clone().expect("revision before");

    // The exact write forged performs to (re-)take a run's lease.
    let out = support::raw_bd(
        &bd,
        &s,
        &[
            "update",
            &id,
            "--claim",
            "--actor",
            "forged:probe",
            "--json",
        ],
    )
    .output()
    .expect("spawning bd update --claim");
    assert!(
        out.status.success(),
        "bd update --claim failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    // Not one spec field moved — the rendered body is byte-identical...
    let after = show_issue(&cfg, &id).await.expect("show after the claim");
    assert_eq!(after.description, before.description);
    assert_eq!(after.acceptance_criteria, before.acceptance_criteria);
    assert_eq!(after.design, before.design);
    assert_eq!(after.notes, before.notes);
    // ...and the revision moved anyway.
    assert_ne!(
        after.revision.expect("revision after the claim"),
        before_revision,
        "a lease claim mints a new revision: fencing a packet on the revision \
         would call forged's own resume drift"
    );
}
