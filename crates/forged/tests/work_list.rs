//! `work list` — the discovery surface. An empty ledger enumerates to an
//! empty list rather than refusing, an epic is discoverable from its
//! `forged.epic.started` event ALONE (no forged path writes a `runs` row for
//! an epic), live seats are counted per run from one scan of every live
//! attempt, and a synthesized epic's `state`/`stopReason`/`updatedAt` are
//! derived from that epic's own durable events.
//!
//! Every lifecycle here is produced the way production produces it — real
//! `epic start`/`pause`/`resume`/`submit` through the CLI — because the
//! fabrication `.2` shipped (a runs row AND a start event, which no forged
//! path writes) is what hid the epic-discovery blocker.

mod support;

use std::collections::BTreeSet;

use serde_json::{json, Value};
use support::{fabricate_epic, fabricate_run, TestEnv};

/// Poll a forged command until it answers `ready`, or fail loudly.
fn wait_for(env: &TestEnv, args: &[&str], ready: impl Fn(&Value) -> bool) -> Value {
    let mut last = Value::Null;
    for _ in 0..600 {
        let (code, value) = env.forged(args);
        if code == 0 && ready(&value) {
            return value;
        }
        last = value;
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    panic!("timed out waiting for forged {args:?}: {last}")
}

/// Open the operator ledger directly. Only the two tests that must forge a
/// condition no API can produce — a timestamp tie, an unreadable payload —
/// use this.
fn sqlite(env: &TestEnv) -> rusqlite::Connection {
    rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db")
}

/// Hash a file the way `claim_packet` demands the caller hash it.
fn sha256_hex(path: &std::path::Path) -> String {
    use sha2::Digest as _;
    let bytes = std::fs::read(path).expect("spec bytes");
    sha2::Sha256::digest(&bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

/// Open `count` packets on `run_id` and leave each with a live attempt.
/// One packet per seat: `claim_packet` refuses a second live attempt on a
/// packet that already has one.
fn fabricate_live_seats(env: &TestEnv, run_id: &str, count: i64) {
    let ledger = env.ledger();
    let sha = sha256_hex(&env.spec);
    for seq in 1..=count {
        let packet_id = ledger
            .open_packet(forged_ledger::NewPacket {
                run_id: run_id.to_owned(),
                stage: forged_types::Stage::Implement,
                seq,
                spec_path: env.spec.to_string_lossy().into_owned(),
                spec_sha256: sha.clone(),
                spec_revision: None,
                body_json: json!({"fabricated": true}).to_string(),
            })
            .expect("open packet");
        ledger
            .claim_packet(
                &packet_id,
                &format!("forged:{packet_id}:0"),
                &forged_ledger::SpecFence::Sha256(sha.clone()),
            )
            .expect("claim packet");
    }
    ledger.close().expect("close");
}

fn runs_of(envelope: &Value) -> Vec<Value> {
    envelope["result"]["runs"]
        .as_array()
        .cloned()
        .unwrap_or_else(|| panic!("work list returns a runs array: {envelope}"))
}

fn entry(envelope: &Value, run_id: &str) -> Value {
    runs_of(envelope)
        .into_iter()
        .find(|r| r["id"] == json!(run_id))
        .unwrap_or_else(|| panic!("work list lists {run_id}: {envelope}"))
}

fn fabricate_run_in_repository(env: &TestEnv, run_id: &str, repository: &str) {
    let ledger = env.ledger();
    ledger
        .create_run(forged_ledger::NewRun {
            run_id: forged_types::RunId::new(run_id).expect("run id"),
            bead_id: format!("bead-{run_id}"),
            repo: repository.to_owned(),
            base_ref: "main".to_owned(),
            branch: format!("forged/{run_id}"),
        })
        .expect("create run");
    ledger.close().expect("close");
}

fn fabricate_epic_in_repository(env: &TestEnv, epic_id: &str, repository: &str) {
    let ledger = env.ledger();
    let repository = forged_types::normalize_repository_path(repository).expect("canonical repo");
    let label = forged_types::repository_label(&repository).expect("repo label");
    let title = format!("Epic {epic_id}");
    let identity = forged_types::WorkIdentityV1 {
        schema: forged_types::WORK_IDENTITY_SCHEMA_V1.to_owned(),
        subject: forged_types::WorkIdentitySubjectV1 {
            kind: forged_types::WorkIdentitySubjectKind::Epic,
            id: epic_id.to_owned(),
        },
        bead: forged_types::WorkIdentityBeadV1 {
            id: epic_id.to_owned(),
            title: Some(title.clone()),
            revision: None,
        },
        repository: Some(forged_types::WorkIdentityRepositoryV1 {
            path: repository.clone(),
            label: label.clone(),
        }),
        project: None,
        epic: None,
        display_title: forged_types::work_display_title(
            epic_id,
            Some(&title),
            Some(&label),
            None,
            None,
        ),
        captured_at: "2026-01-01T00:00:00.000000000Z".to_owned(),
        source: forged_types::WorkIdentitySource::Durable,
    };
    ledger
        .append_epic_started_with_identity(
            epic_id,
            json!({
                "schema": "forged.epic/1",
                "epicId": epic_id,
                "title": title,
                "repo": repository,
                "baseRef": "main",
                "integrationBranch": format!("forged/epic-{epic_id}"),
                "children": [],
            }),
            identity,
        )
        .expect("epic started event");
    ledger.close().expect("close");
}

fn run_ids(envelope: &Value) -> BTreeSet<String> {
    runs_of(envelope)
        .into_iter()
        .filter_map(|entry| entry["id"].as_str().map(str::to_owned))
        .collect()
}

fn queue_ids(envelope: &Value) -> BTreeSet<String> {
    envelope["result"]["queue"]["groups"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|group| group["entries"].as_array().into_iter().flatten())
        .filter_map(|entry| entry["id"].as_str().map(str::to_owned))
        .collect()
}

#[test]
fn an_empty_ledger_enumerates_to_an_empty_list() {
    let env = TestEnv::new("forged-work-list-empty");
    env.forged(&["init"]);
    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    assert_eq!(response["ok"], json!(true));
    assert_eq!(response["result"]["runs"], json!([]));
    let groups = response["result"]["queue"]["groups"]
        .as_array()
        .expect("the empty queue still names every group");
    assert_eq!(groups.len(), 5);
    assert!(groups.iter().all(|group| group["entries"] == json!([])));
    // No id in, no InvalidRequest out.
    assert_eq!(response["error"], Value::Null);
}

#[test]
fn the_operator_queue_is_human_named_grouped_and_honest_about_unknowns() {
    let env = TestEnv::new("forged-work-operator-queue");
    env.forged(&["init"]);
    fabricate_run(&env, "q-planned");
    fabricate_run(&env, "q-running");
    fabricate_run(&env, "q-stalled");
    fabricate_run(&env, "q-ready");
    fabricate_live_seats(&env, "q-running", 1);
    env.set_bead_field("bead-q-planned", "title", "Prepare the operator queue");
    env.set_bead_field("bead-q-stalled", "status", "in_progress");
    env.set_assignee("bead-q-stalled", "someone-else");
    env.set_bead_field("bead-q-ready", "status", "in_progress");
    env.set_assignee("bead-q-ready", "forged:bead-q-ready:0");
    let ledger = env.ledger();
    ledger
        .set_run_state(
            "q-stalled",
            forged_ledger::RunState::Stopped,
            Some("driver exited before settlement".to_owned()),
        )
        .expect("stop stalled run");
    ledger
        .settle_run(
            "q-ready",
            forged_ledger::RunOutcome::Clean,
            "reviewed candidate awaits delivery".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle ready run");
    ledger
        .append_event(
            Some("q-ready"),
            "proto.pr",
            json!({
                "schemaVersion": 1,
                "number": 42,
                "isDraft": true,
                "baseRefName": "main",
                "url": "https://example.invalid/pr/42",
            }),
        )
        .expect("record ready PR");
    ledger
        .append_event(
            Some("q-running"),
            "proto.pr",
            json!({
                "schemaVersion": 1,
                "number": 43,
                "isDraft": true,
                "baseRefName": "main",
                "url": "https://example.invalid/pr/43",
            }),
        )
        .expect("record in-flight draft PR");
    ledger.close().expect("close ledger");

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    let groups = response["result"]["queue"]["groups"]
        .as_array()
        .expect("queue groups");
    assert_eq!(
        groups
            .iter()
            .map(|group| group["name"].as_str().unwrap())
            .collect::<Vec<_>>(),
        vec![
            "Needs me",
            "Ready to merge",
            "Running",
            "Stalled or recoverable",
            "Planned",
        ]
    );
    // The enriched groups reach this surface too; the top-level `counts`
    // object does not, because `work_list` has no header to carry it.
    for group in groups {
        assert!(group["code"].is_string(), "{group}");
        assert!(group["excluded"]["livePlan"].is_u64(), "{group}");
    }
    assert_eq!(response["result"]["counts"], Value::Null, "{response}");
    let in_group = |name: &str, id: &str| {
        groups
            .iter()
            .find(|group| group["name"] == json!(name))
            .and_then(|group| group["entries"].as_array())
            .and_then(|entries| entries.iter().find(|entry| entry["id"] == json!(id)))
            .cloned()
            .unwrap_or_else(|| panic!("{id} is in {name}: {response}"))
    };
    assert_eq!(
        in_group("Ready to merge", "q-ready")["pr"]["number"],
        json!(42)
    );
    assert_eq!(
        in_group("Ready to merge", "q-ready")["pr"]["baseBranch"],
        json!("main")
    );
    assert_eq!(
        in_group("Ready to merge", "q-ready")["claimHealth"]["staleInProgress"],
        json!(false)
    );
    assert_eq!(
        in_group("Running", "q-running")["currentStage"],
        json!("implement")
    );
    let stalled = in_group("Stalled or recoverable", "q-stalled");
    assert_eq!(stalled["claimHealth"]["staleInProgress"], json!(true));
    assert!(stalled["blocker"].as_str().is_some());
    let planned = in_group("Planned", "q-planned");
    assert_eq!(planned["title"], planned["identity"]["displayTitle"]);
    assert_ne!(
        planned["title"],
        json!("Prepare the operator queue"),
        "a live Beads rename cannot rewrite legacy durable identity"
    );
    // The live title is carried BESIDE the frozen one, naming its authority,
    // so a consumer can render it without the rename invariant dissolving.
    assert_eq!(planned["titleSource"]["source"], json!("beads.title"));
    assert_eq!(planned["titleSource"]["beadId"], json!("bead-q-planned"));
    assert!(
        planned["titleSource"]["value"]
            .as_str()
            .expect("resolved title")
            .contains("Prepare the operator queue"),
        "{planned}"
    );
    assert_eq!(planned["ci"]["status"], json!("unknown"));
    for key in [
        "outcome",
        "delivery",
        "supersededBy",
        "controller",
        "nextAction",
    ] {
        assert!(
            planned.get(key).is_some(),
            "entry includes {key}: {planned}"
        );
    }

    let calls =
        std::fs::read_to_string(env.beads_dir.join("shim-state/calls.log")).expect("bd calls");
    assert_eq!(
        calls
            .lines()
            .filter(|line| line.starts_with("list "))
            .count(),
        1,
        "only bounded plan discovery remains a list call: {calls}"
    );
    assert_eq!(
        calls
            .lines()
            .filter(|line| line.starts_with("show "))
            .count(),
        2,
        "one exact claim hydrate plus one plan dependency hydrate: {calls}"
    );
}

#[test]
fn repository_scope_uses_exact_bead_metadata_for_slices_epics_and_renamed_checkouts() {
    let env = TestEnv::new("forged-work-list-repository-scope");
    env.forged(&["init"]);
    let forge = "/Users/operator/repositories/forge";
    let drover = "/Users/operator/repositories/drover";
    let smithy = "/Users/operator/repositories/smithy";
    let old_checkout = "/Users/operator/old/forge";
    let renamed_checkout = "/Users/operator/new/forge";

    fabricate_run_in_repository(&env, "repo-forge", forge);
    fabricate_epic_in_repository(&env, "repo-drover", drover);
    fabricate_run_in_repository(&env, "repo-smithy", smithy);
    fabricate_run_in_repository(&env, "repo-unknown", "/legacy/guessed/repository");
    fabricate_run_in_repository(&env, "repo-renamed", old_checkout);
    env.set_bead_repository("bead-repo-forge", forge);
    env.set_bead_repository("repo-drover", drover);
    env.set_bead_repository("bead-repo-smithy", smithy);
    // Override the shim's convenience default so this fixture really models
    // a Bead with no authoritative repository metadata.
    env.set_bead_field("bead-repo-unknown", "metadata", "{}");
    // The renamed checkout proves membership comes from current canonical
    // Bead metadata, not the launch-time repository column in the ledger.
    env.set_bead_repository("bead-repo-renamed", renamed_checkout);

    let scoped = |repository: &str| {
        let (code, response) = env.forged(&["work", "list", "--repo", repository]);
        assert_eq!(code, 0, "work list --repo {repository}: {response}");
        assert_eq!(run_ids(&response), queue_ids(&response), "queue parity");
        response
    };

    // Absolute path normalization is lexical and does not touch the live
    // checkout: a trailing `.` still names the exact stored identity.
    let forge_response = scoped(&format!("{forge}/."));
    assert_eq!(
        run_ids(&forge_response),
        BTreeSet::from(["repo-forge".to_owned()])
    );
    assert_eq!(
        entry(&forge_response, "repo-forge")["claimHealth"]["known"],
        json!(true)
    );
    let calls = env.bd_calls();
    assert_eq!(
        calls
            .iter()
            .filter(|call| call.starts_with("list "))
            .count(),
        2,
        "one exact membership batch plus one bounded plan discovery: {calls:?}"
    );
    let call = calls
        .iter()
        .find(|call| call.starts_with("list --id "))
        .expect("exact metadata membership call");
    for fragment in [
        "--id ",
        "--metadata-field repository=/Users/operator/repositories/forge",
        "--limit 0",
        "--brief",
        "--flat",
        "--json",
    ] {
        assert!(
            call.contains(fragment),
            "bounded native filter has {fragment:?}: {call}"
        );
    }

    assert_eq!(
        run_ids(&scoped(drover)),
        BTreeSet::from(["repo-drover".to_owned()])
    );
    assert_eq!(
        run_ids(&scoped(smithy)),
        BTreeSet::from(["repo-smithy".to_owned()])
    );
    let renamed = scoped(renamed_checkout);
    assert_eq!(
        run_ids(&renamed),
        BTreeSet::from(["repo-renamed".to_owned()])
    );
    assert_eq!(
        entry(&renamed, "repo-renamed")["repo"],
        json!(old_checkout),
        "the selector does not rewrite durable launch history"
    );

    for no_match in [
        old_checkout,
        "/legacy/guessed/repository",
        "/no/such/repository",
    ] {
        let response = scoped(no_match);
        assert_eq!(response["result"]["runs"], json!([]));
        assert_eq!(response["result"]["queue"]["total"], json!(0));
    }

    let (code, unfiltered) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "unfiltered work list: {unfiltered}");
    assert_eq!(
        run_ids(&unfiltered),
        BTreeSet::from([
            "repo-drover".to_owned(),
            "repo-forge".to_owned(),
            "repo-renamed".to_owned(),
            "repo-smithy".to_owned(),
            "repo-unknown".to_owned(),
        ]),
        "omitting --repo retains the operator-wide inventory, including an explicit unknown"
    );
    let unknown = entry(&unfiltered, "repo-unknown");
    assert_eq!(unknown["claimHealth"]["known"], json!(true));
    assert_eq!(unknown["repositoryScope"]["known"], json!(false));
    assert_eq!(unknown["repositoryScope"]["identity"], Value::Null);
    assert_eq!(
        entry(&unfiltered, "repo-forge")["repositoryScope"],
        json!({
            "known": true,
            "identity": forge,
            "source": "beads.metadata.repository",
        })
    );
}

#[test]
fn repository_scope_fails_closed_when_beads_cannot_establish_membership() {
    let env = TestEnv::new("forged-work-list-repository-outage");
    env.forged(&["init"]);
    let forge = "/Users/operator/repositories/forge";
    fabricate_run_in_repository(&env, "repo-outage", forge);
    env.set_bead_repository("bead-repo-outage", forge);
    env.set_bd_list_unreachable(true);

    let (code, scoped) = env.forged(&["work", "list", "--repo", forge]);
    assert_ne!(code, 0, "a scoped outage must not widen: {scoped}");
    assert_eq!(scoped["ok"], json!(false));
    assert_eq!(scoped["error"]["code"], json!("BEADS_ERROR"));
    assert!(scoped["result"].is_null(), "no scoped rows leak: {scoped}");

    // The no-selector path uses the independent exact `show` contract, so a
    // membership-list outage cannot erase otherwise available claim facts.
    let (code, unfiltered) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "unfiltered compatibility: {unfiltered}");
    assert_eq!(
        run_ids(&unfiltered),
        BTreeSet::from(["repo-outage".to_owned()])
    );
    assert_eq!(
        entry(&unfiltered, "repo-outage")["claimHealth"]["known"],
        json!(true)
    );
    assert_eq!(
        entry(&unfiltered, "repo-outage")["repositoryScope"],
        json!({
            "known": true,
            "identity": forge,
            "source": "beads.metadata.repository",
        })
    );
}

#[test]
fn an_empty_repository_selector_is_refused_instead_of_widening() {
    let env = TestEnv::new("forged-work-list-empty-repository");
    env.forged(&["init"]);
    fabricate_run(&env, "repo-widening-guard");

    let (code, response) = env.forged(&["work", "list", "--repo", "  "]);
    assert_ne!(code, 0, "empty repository is invalid: {response}");
    assert_eq!(response["error"]["code"], json!("INVALID_REQUEST"));
    assert!(response["result"].is_null());
    assert!(
        env.bd_calls().iter().all(|call| !call.starts_with("list ")),
        "invalid scope is refused before Beads"
    );
}

#[test]
fn a_slice_and_an_epic_are_labelled_by_their_events() {
    let env = TestEnv::new("forged-work-list-kind");
    env.forged(&["init"]);
    fabricate_run(&env, "wl-slice");
    fabricate_epic(&env, "wl-epic");

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    assert_eq!(runs_of(&response).len(), 2);

    let slice = entry(&response, "wl-slice");
    assert_eq!(slice["kind"], json!("slice"));
    assert_eq!(slice["beadId"], json!("bead-wl-slice"));
    assert_eq!(slice["branch"], json!("forged/wl-slice"));
    assert_eq!(slice["repo"], json!(env.repos.repo.to_string_lossy()));
    assert_eq!(slice["state"], json!("active"));
    assert_eq!(slice["stopReason"], Value::Null);
    assert!(slice["createdAt"].is_string(), "createdAt: {slice}");
    assert!(slice["updatedAt"].is_string(), "updatedAt: {slice}");
    // A run with no live attempt reports zero seats, not null.
    assert_eq!(slice["liveSeats"], json!(0));
    // A run with no usage rows costs zero — absent usage is data.
    assert_eq!(slice["costUsdKnown"], json!(0.0));
    assert_eq!(slice["rowsMissingCost"], json!(0));

    // An epic has no run row at all, so it is listed only if `work list`
    // reads the start event as a source of inventory, not just as a label.
    let epic = entry(&response, "wl-epic");
    assert_eq!(epic["kind"], json!("epic"));
    assert_eq!(epic["beadId"], json!("wl-epic"));
    assert_eq!(epic["repo"], json!(env.repos.repo.to_string_lossy()));
    assert_eq!(epic["branch"], json!("forged/epic-wl-epic"));
    assert_eq!(epic["state"], json!("active"));
    assert_eq!(epic["stopReason"], Value::Null);
    assert!(epic["createdAt"].is_string(), "createdAt: {epic}");
    assert_eq!(epic["updatedAt"], epic["createdAt"]);
    assert_eq!(epic["liveSeats"], json!(0));
    assert_eq!(epic["costUsdKnown"], json!(0.0));
    assert_eq!(epic["rowsMissingCost"], json!(0));
}

#[test]
fn live_seats_are_counted_per_run() {
    let env = TestEnv::new("forged-work-list-seats");
    env.forged(&["init"]);
    fabricate_run(&env, "wl-busy");
    fabricate_run(&env, "wl-idle");
    fabricate_live_seats(&env, "wl-busy", 2);

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    assert_eq!(entry(&response, "wl-busy")["liveSeats"], json!(2));
    assert_eq!(entry(&response, "wl-idle")["liveSeats"], json!(0));
}

/// The production path, end to end: `epic start` appends
/// `forged.epic.started` and writes NO run row, so an inventory built from
/// `list_runs()` alone would list the epic nowhere.
#[test]
fn a_started_epic_is_listed_though_it_has_no_run_row() {
    let env = TestEnv::new("forged-work-list-epic-start");
    env.seed_epic("epic-list", &[("child-list", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-list",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    // The started epic is the whole inventory: no child has run yet, and the
    // epic itself never gets a run row.
    assert_eq!(runs_of(&response).len(), 1);
    let epic = entry(&response, "epic-list");
    assert_eq!(epic["kind"], json!("epic"));
    assert_eq!(epic["beadId"], json!("epic-list"));
    assert_eq!(epic["repo"], json!(repo));
    assert_eq!(epic["branch"], json!("forged/epic-epic-list"));
    assert_eq!(epic["liveSeats"], json!(0));
}

/// Start one epic through the real CLI and hand back `(env, repo, spec)`.
fn started_epic(name: &str, epic: &str, child: &str) -> (TestEnv, String, String) {
    let env = TestEnv::new(name);
    env.seed_epic(epic, &[(child, &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        epic,
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    (env, repo, spec)
}

/// The epic entry `work list` currently reports.
fn epic_entry(env: &TestEnv, epic: &str) -> Value {
    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    entry(&response, epic)
}

/// An epic's lifecycle is observable even though it owns no `runs` row:
/// pause, resume, and the final PR each move `state`, the pause's reason
/// becomes `stopReason`, and every durable event moves `updatedAt` while
/// `createdAt` stays pinned to the start.
#[test]
fn an_epic_reports_the_state_its_events_describe() {
    let (env, _repo, _spec) =
        started_epic("forged-work-list-epic-state", "epic-state", "child-state");
    env.enable_dynamic_gh();

    // One event so far: active, no reason, and updatedAt IS the start.
    let epic = epic_entry(&env, "epic-state");
    assert_eq!(epic["state"], json!("active"));
    assert_eq!(epic["stopReason"], Value::Null);
    assert_eq!(epic["updatedAt"], epic["createdAt"]);
    let created_at = epic["createdAt"].clone();

    let (code, paused) = env.forged(&[
        "epic",
        "pause",
        "--epic",
        "epic-state",
        "--reason",
        "operator checkpoint",
    ]);
    assert_eq!(code, 0, "epic pause: {paused}");
    let epic = epic_entry(&env, "epic-state");
    assert_eq!(epic["state"], json!("paused"));
    // A stopReason that is structurally always null cannot be told apart
    // from an unimplemented one; this one names the operator's reason.
    assert_eq!(epic["stopReason"], json!("operator checkpoint"));
    assert_eq!(epic["createdAt"], created_at, "createdAt stays the start");
    assert_ne!(
        epic["updatedAt"], created_at,
        "a second durable event moves updatedAt: {epic}"
    );

    let (code, resumed) = env.forged(&[
        "epic",
        "resume",
        "--epic",
        "epic-state",
        "--reason",
        "operator approved continuation",
    ]);
    assert_eq!(code, 0, "epic resume: {resumed}");
    let epic = epic_entry(&env, "epic-state");
    assert_eq!(epic["state"], json!("active"), "resume reactivates: {epic}");
    assert_eq!(epic["stopReason"], Value::Null);

    // Drive the epic the whole way: the final PR is written by the
    // scheduler, not by the test.
    let (code, submitted) = env.forged(&["epic", "submit", "--epic", "epic-state"]);
    assert_eq!(code, 0, "epic submit: {submitted}");
    let driven = wait_for(&env, &["epic", "status", "--epic", "epic-state"], |value| {
        value["result"]["finalPr"]["number"].is_number()
    });
    assert_eq!(driven["result"]["finalPr"]["isDraft"], json!(true));
    let epic = epic_entry(&env, "epic-state");
    assert_eq!(epic["state"], json!("submitted"), "final PR: {epic}");
    assert_eq!(epic["stopReason"], Value::Null);
    assert_ne!(epic["updatedAt"], created_at);
}

/// Ordering is by event id, not by timestamp string: two control events
/// stamped in the same instant must not resolve by luck. The ledger writes
/// nanosecond stamps, so the tie is forged in SQL — the one condition no
/// API can produce.
#[test]
fn a_timestamp_tie_resolves_by_event_id() {
    let (env, _repo, _spec) = started_epic("forged-work-list-epic-tie", "epic-tie", "child-tie");
    for (command, reason) in [("pause", "hold"), ("resume", "continue")] {
        let (code, response) =
            env.forged(&["epic", command, "--epic", "epic-tie", "--reason", reason]);
        assert_eq!(code, 0, "epic {command}: {response}");
    }
    let tie = "2026-01-01T00:00:00.000000000Z";
    let touched = sqlite(&env)
        .execute(
            "UPDATE events SET ts = ?1 WHERE run_id = 'epic-tie' \
             AND kind IN ('forged.epic.paused', 'forged.epic.resumed')",
            [tie],
        )
        .expect("stamp the control events identically");
    assert_eq!(touched, 2, "one pause and one resume");

    let epic = epic_entry(&env, "epic-tie");
    assert_eq!(
        epic["state"],
        json!("active"),
        "the resume was appended later: {epic}"
    );
    assert_eq!(epic["stopReason"], Value::Null);
    assert_eq!(epic["updatedAt"], json!(tie));
}

/// The discriminating tie: pause, resume, pause, all stamped identically.
///
/// `a_timestamp_tie_resolves_by_event_id` above ends on a resume, so it
/// passes under a fold that simply lets the LAST KIND ITERATED win — the
/// resume scan runs after the pause scan either way. Ending on a pause
/// separates the two: append position says `paused` with the second pause's
/// reason, kind-major iteration says `active`.
#[test]
fn a_tie_ending_on_a_pause_still_resolves_by_append_position() {
    let (env, _repo, _spec) = started_epic(
        "forged-work-list-epic-tie-pause",
        "epic-tie-pause",
        "child-tie-pause",
    );
    for (command, reason) in [
        ("pause", "first hold"),
        ("resume", "continue"),
        ("pause", "second hold"),
    ] {
        let (code, response) = env.forged(&[
            "epic",
            command,
            "--epic",
            "epic-tie-pause",
            "--reason",
            reason,
        ]);
        assert_eq!(code, 0, "epic {command}: {response}");
    }
    let tie = "2026-01-01T00:00:00.000000000Z";
    let touched = sqlite(&env)
        .execute(
            "UPDATE events SET ts = ?1 WHERE run_id = 'epic-tie-pause' \
             AND kind IN ('forged.epic.paused', 'forged.epic.resumed')",
            [tie],
        )
        .expect("stamp the control events identically");
    assert_eq!(touched, 3, "two pauses and one resume");

    let epic = epic_entry(&env, "epic-tie-pause");
    assert_eq!(
        epic["state"],
        json!("paused"),
        "the LAST APPENDED control event was a pause: {epic}"
    );
    assert_eq!(
        epic["stopReason"],
        json!("second hold"),
        "and it carries that pause's reason, not the first's: {epic}"
    );
    assert_eq!(epic["updatedAt"], json!(tie));
}

/// A lifecycle payload that will not parse degrades exactly like an
/// unparseable start event: the epic stays discoverable and reports the
/// state its kind implies, with no reason invented.
#[test]
fn an_unreadable_pause_payload_still_lists_a_paused_epic() {
    let (env, _repo, _spec) = started_epic(
        "forged-work-list-epic-garbled",
        "epic-garbled",
        "child-garbled",
    );
    let (code, paused) = env.forged(&[
        "epic",
        "pause",
        "--epic",
        "epic-garbled",
        "--reason",
        "operator checkpoint",
    ]);
    assert_eq!(code, 0, "epic pause: {paused}");
    let touched = sqlite(&env)
        .execute(
            "UPDATE events SET payload_json = '{not json' \
             WHERE run_id = 'epic-garbled' AND kind = 'forged.epic.paused'",
            [],
        )
        .expect("garble the pause payload");
    assert_eq!(touched, 1);

    let epic = epic_entry(&env, "epic-garbled");
    assert_eq!(epic["state"], json!("paused"), "still paused: {epic}");
    assert_eq!(epic["stopReason"], Value::Null, "no reason invented");
}

/// The `runs` row is the durable state wherever one exists. A legacy/corrupt
/// id that carries BOTH an epic start event and a fabricated run row is ONE
/// entry: labelled `epic` by the event, with the row's columns. Production
/// now refuses routing an epic Bead through `run start`.
#[test]
fn an_id_with_a_run_row_and_a_start_event_is_one_epic_entry() {
    let (env, _, _) = started_epic("forged-work-list-both", "epic-both", "child-both");
    fabricate_run(&env, "epic-both");

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    assert_eq!(
        runs_of(&response).len(),
        1,
        "one entry, not two: {response}"
    );
    let epic = entry(&response, "epic-both");
    assert_eq!(epic["kind"], json!("epic"), "the start event labels it");
    // The row's branch, not the integration branch the start event named.
    assert_eq!(epic["branch"], json!("forged/epic-both"));
    assert_eq!(epic["state"], json!("active"));
    assert_eq!(epic["stopReason"], Value::Null);
}

/// A stopped run reports the reason its row carries. `run start` is the
/// only production writer of a `runs` row and `set_run_state` the only
/// writer of its stop columns — forged exposes no command that stops a run.
#[test]
fn a_stopped_run_reports_its_reason() {
    let env = TestEnv::new("forged-work-list-stopped");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "wl-stopped",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    let ledger = env.ledger();
    ledger
        .set_run_state(
            "wl-stopped",
            forged_ledger::RunState::Stopped,
            Some("operator stopped the run".to_owned()),
        )
        .expect("stop the run");
    ledger.close().expect("close");

    let (code, response) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "work list: {response}");
    let slice = entry(&response, "wl-stopped");
    assert_eq!(slice["kind"], json!("slice"));
    assert_eq!(slice["state"], json!("stopped"));
    assert_eq!(slice["stopReason"], json!("operator stopped the run"));
}
