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

use forged_beads::{
    apply_native_spec_to_blocked_stub, assign_unassigned_issue, plan_inventory,
    ready_epic_children, show_issue, NativeSpecUpdate, PlanDependencyStatus, PlanDependencyType,
    PlanReadiness, BLOCKED_CLAIM_REFUSAL,
};
use serde_json::{json, Value};

const CONTEXT: &str = "the context body";
const ACCEPTANCE: &str = "the acceptance body";
const DESIGN: &str = "the design body";
const NOTES: &str = "the notes body";
const SPEC_ID: &str = "spec-42";

/// Read one bead through the exact `show --brief-deps --json` shape the live
/// plan hydrate uses, and return its first data object.
fn brief_deps(bd: &Path, s: &support::Scratch, id: &str) -> Value {
    let out = support::raw_bd(bd, s, &["show", id, "--brief-deps", "--json"])
        .output()
        .expect("spawning bd show --brief-deps");
    assert!(
        out.status.success(),
        "bd show --brief-deps failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let value: Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("show envelope");
    match value.get("data").cloned().expect("show envelope data") {
        Value::Array(items) => items.into_iter().next().expect("bd show returned no issue"),
        other => other,
    }
}

fn create_epic(bd: &Path, s: &support::Scratch, title: &str) -> String {
    let out = support::raw_bd(bd, s, &["create", title, "--type", "epic", "--json"])
        .output()
        .expect("creating epic");
    assert!(
        out.status.success(),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
    let value: Value = serde_json::from_slice(&out.stdout).expect("create envelope");
    value["data"]["id"].as_str().expect("epic id").to_owned()
}

#[tokio::test]
async fn epic_ready_frontier_is_parent_scoped_and_uncapped() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("ready-epic-uncapped");
    support::init_store(&bd, &s);
    let epic = create_epic(&bd, &s, "large rolling epic");
    for index in 0..105 {
        let out = support::raw_bd(
            &bd,
            &s,
            &[
                "create",
                &format!("child {index:03}"),
                "--parent",
                &epic,
                "--json",
            ],
        )
        .output()
        .expect("creating child");
        assert!(
            out.status.success(),
            "{}",
            String::from_utf8_lossy(&out.stderr)
        );
    }
    let ready = ready_epic_children(&support::cfg_for(&bd, &s), &epic)
        .await
        .expect("parent frontier");
    assert_eq!(
        ready.len(),
        105,
        "the bd default page must not hide children"
    );
}

#[tokio::test]
async fn rolling_plan_apply_is_guarded_and_exact() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("rolling-plan-apply");
    support::init_store(&bd, &s);
    let id = create_status_bead(&bd, &s, "planning stub", "blocked");
    let spec = NativeSpecUpdate {
        description: "context and outcome".to_owned(),
        acceptance_criteria: "observable acceptance".to_owned(),
        design: "minimal design".to_owned(),
        notes: "no scope expansion".to_owned(),
    };
    let applied = apply_native_spec_to_blocked_stub(
        &support::cfg_for(&bd, &s),
        &id,
        "forged:test-epic",
        &spec,
    )
    .await
    .expect("guarded apply");
    assert_eq!(applied.status, "open");
    assert_eq!(applied.assignee, None);
    assert_eq!(applied.description, spec.description);
    assert_eq!(applied.acceptance_criteria, spec.acceptance_criteria);
    assert_eq!(applied.design, spec.design);
    assert_eq!(applied.notes, spec.notes);

    let refused = apply_native_spec_to_blocked_stub(
        &support::cfg_for(&bd, &s),
        &id,
        "forged:test-epic",
        &spec,
    )
    .await;
    assert!(
        refused.is_err(),
        "an open post-image is not a fresh guarded write"
    );
}

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

/// Create one unassigned bead in an exact built-in status.
fn create_status_bead(bd: &Path, s: &support::Scratch, title: &str, status: &str) -> String {
    let out = support::raw_bd(bd, s, &["create", title, "--status", status, "--json"])
        .output()
        .expect("spawning bd create with status");
    assert!(
        out.status.success(),
        "bd create --status {status} failed: {}",
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

/// The landed settlement custody contract against pinned bd itself.
///
/// `--claim` is legal only over open (apart from an idempotent re-claim by
/// the actor already holding an in_progress bead). In particular it refuses
/// blocked with the exact copy that caused the live retry loop, while one
/// null-assignee-guarded field update can take either blocked or open custody
/// without `--force`.
#[tokio::test]
async fn claimable_statuses_are_pinned_and_plain_guarded_assignment_takes_both_landed_shapes() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("spec-contract-claimable-status");
    support::init_store(&bd, &s);
    let actor = "forged:claim-contract";

    let id = create_status_bead(&bd, &s, "claimable open", "open");
    let out = support::raw_bd(
        &bd,
        &s,
        &["update", &id, "--claim", "--actor", actor, "--json"],
    )
    .output()
    .expect("spawning claim over open");
    assert!(
        out.status.success(),
        "bd must claim status open: stdout={} stderr={}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    let issue = show_issue(&support::cfg_for(&bd, &s), &id)
        .await
        .expect("show claimed bead");
    assert_eq!(issue.status, "in_progress");
    assert_eq!(issue.assignee.as_deref(), Some(actor));

    let replay = support::raw_bd(
        &bd,
        &s,
        &["update", &id, "--claim", "--actor", actor, "--json"],
    )
    .output()
    .expect("spawning idempotent claim replay");
    assert!(
        replay.status.success(),
        "the current actor may replay its in_progress claim: stdout={} stderr={}",
        String::from_utf8_lossy(&replay.stdout),
        String::from_utf8_lossy(&replay.stderr)
    );

    let mut blocked = None;
    for status in [
        "in_progress",
        "blocked",
        "deferred",
        "closed",
        "pinned",
        "hooked",
    ] {
        let id = create_status_bead(&bd, &s, &format!("not claimable {status}"), status);
        let out = support::raw_bd(
            &bd,
            &s,
            &["update", &id, "--claim", "--actor", actor, "--json"],
        )
        .output()
        .expect("spawning claim over a non-claimable status");
        assert!(
            !out.status.success(),
            "bd must refuse --claim over {status}: {}",
            String::from_utf8_lossy(&out.stdout)
        );
        let answer = format!(
            "{}\n{}",
            String::from_utf8_lossy(&out.stdout),
            String::from_utf8_lossy(&out.stderr)
        );
        let refusal = format!("issue not claimable: status {status}");
        assert!(
            answer.contains(&refusal),
            "bd's {status} refusal must retain the pinned claim rule: {answer}"
        );
        let issue = show_issue(&support::cfg_for(&bd, &s), &id)
            .await
            .expect("show refused bead");
        assert_eq!(issue.status, status, "a refused claim changes no status");
        assert_eq!(issue.assignee, None, "a refused claim assigns nobody");
        if status == "blocked" {
            assert_eq!(refusal, BLOCKED_CLAIM_REFUSAL);
            blocked = Some(id);
        }
    }

    let cfg = support::cfg_for(&bd, &s);
    let blocked = blocked.expect("blocked fixture");
    let assigned = assign_unassigned_issue(&cfg, &blocked, actor, "blocked")
        .await
        .expect("plain guarded assignment must bypass blocked claimability");
    assert_eq!(assigned.status, "in_progress");
    assert_eq!(assigned.assignee.as_deref(), Some(actor));

    let open = create_status_bead(&bd, &s, "guarded open custody", "open");
    let assigned = assign_unassigned_issue(&cfg, &open, actor, "open")
        .await
        .expect("plain guarded assignment must take open custody");
    assert_eq!(assigned.status, "in_progress");
    assert_eq!(assigned.assignee.as_deref(), Some(actor));
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

/// The 2026-08-17 compatibility incident, against the pinned binary itself.
///
/// bd 1.2.1 accepts `supersedes` as a native dependency type, and one such
/// edge on a live plan row used to make the ENTIRE repository-scoped plan
/// source unavailable — Operations then reported an unqualified empty plan.
/// This probe creates the real edge and reads it back through the same
/// `show --brief-deps --json` shape plan inventory uses, so a bd upgrade
/// that renames the relation or moves it out of `dependencies` fails here
/// rather than silently emptying an operator's plan again.
#[tokio::test]
async fn a_native_supersedes_edge_hydrates_as_non_blocking_provenance() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("spec-contract-supersedes");
    support::init_store(&bd, &s);
    let superseded = support::create_bead(&bd, &s, "superseded original");
    let replacement = support::create_bead(&bd, &s, "superseding replacement");

    let out = support::raw_bd(
        &bd,
        &s,
        &[
            "dep",
            "add",
            &replacement,
            &superseded,
            "--type",
            "supersedes",
            "--json",
        ],
    )
    .output()
    .expect("spawning bd dep add --type supersedes");
    assert!(
        out.status.success(),
        "pinned bd refused a native supersedes edge: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    // The raw shape first: these exact keys, on the SOURCE row, are what the
    // plan hydrate reads. The superseded target carries no edge of its own.
    let raw = brief_deps(&bd, &s, &replacement);
    let dependencies = raw
        .get("dependencies")
        .and_then(Value::as_array)
        .unwrap_or_else(|| panic!("bd dropped the supersedes edge from the source row: {raw}"));
    assert_eq!(dependencies.len(), 1, "exactly one edge: {raw}");
    assert_eq!(
        dependencies[0].get("id").and_then(Value::as_str),
        Some(superseded.as_str()),
        "the edge points at the superseded bead: {raw}"
    );
    assert_eq!(
        dependencies[0]
            .get("dependency_type")
            .and_then(Value::as_str),
        Some("supersedes"),
        "bd spells the native relation `supersedes`: {raw}"
    );
    let target = brief_deps(&bd, &s, &superseded);
    assert!(
        target
            .get("dependencies")
            .and_then(Value::as_array)
            .is_none_or(Vec::is_empty),
        "the native edge is directed source-to-target only: {target}"
    );

    // And the typed projection forged actually serves.
    let cfg = support::cfg_for(&bd, &s);
    let inventory = plan_inventory(&cfg, None, 10)
        .await
        .expect("a live plan carrying a supersedes edge must hydrate");
    assert_eq!(inventory.discovered, 2, "both scratch beads are live");
    assert!(!inventory.truncated);
    let source = inventory
        .issues
        .iter()
        .find(|issue| issue.issue.id == replacement)
        .unwrap_or_else(|| {
            panic!(
                "the superseding plan row is missing: {:?}",
                inventory.issues
            )
        });
    assert_eq!(source.dependencies.len(), 1);
    assert_eq!(source.dependencies[0].id, superseded);
    assert_eq!(
        source.dependencies[0].dependency_type,
        PlanDependencyType::Supersedes
    );
    assert!(
        !source.dependencies[0].dependency_type.blocks_readiness(),
        "provenance is not a scheduling prerequisite"
    );
    assert_eq!(
        source.dependencies[0].status,
        Some(PlanDependencyStatus::Open),
        "the superseded bead is still open — exactly the incident's shape"
    );
    assert_eq!(
        source.readiness(),
        PlanReadiness::Ready,
        "an open superseded target must not block its replacement"
    );
    assert_eq!(
        serde_json::to_value(&source.dependencies).expect("serialize dependencies"),
        json!([{"id": superseded, "dependencyType": "supersedes", "status": "open"}]),
        "the wire keeps the native kind rather than collapsing it"
    );
}
