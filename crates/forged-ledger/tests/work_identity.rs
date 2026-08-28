use std::collections::{BTreeMap, HashMap};
use std::fmt::Write as _;

use forged_ledger::{InventoryUsageSelection, Ledger, NewRun, NewRunDefinition};
use forged_types::{
    canonical_json_bytes, repository_label, work_display_title, ErrorCode, ExecutionPackageV1,
    ExecutionPolicyV1, HostPolicyV1, ProfileDefinitionV1, ProfileRef, ProtocolRef,
    ResolvedRosterV1, RosterRef, RunId, WorkIdentityBeadV1, WorkIdentityContextV1,
    WorkIdentityRepositoryV1, WorkIdentitySource, WorkIdentitySubjectKind, WorkIdentitySubjectV1,
    WorkIdentityV1, EXECUTION_PACKAGE_SCHEMA_V1, PROFILE_SCHEMA_V1, RESOLVED_ROSTER_SCHEMA_V1,
    WORK_IDENTITY_SCHEMA_V1,
};
use serde::Serialize;
use serde_json::json;
use sha2::{Digest, Sha256};

fn digest<T: Serialize>(value: &T) -> String {
    let value = serde_json::to_value(value).expect("json value");
    let bytes = canonical_json_bytes(&value).expect("canonical json");
    let mut out = String::new();
    for byte in Sha256::digest(bytes) {
        write!(&mut out, "{byte:02x}").expect("hex");
    }
    out
}

fn definition() -> NewRunDefinition {
    let protocol_ref = ProtocolRef {
        name: "slice".to_owned(),
        version: 1,
    };
    let profile_ref = ProfileRef {
        name: "default".to_owned(),
        version: 1,
    };
    let roster_ref = RosterRef {
        name: "default".to_owned(),
        version: 1,
    };
    let profile = ProfileDefinitionV1 {
        schema: PROFILE_SCHEMA_V1.to_owned(),
        name: "default".to_owned(),
        protocol: protocol_ref.clone(),
        seats: Vec::new(),
        risk_context: "test".to_owned(),
        fix_round_budget: 0,
        escalate_on: Vec::new(),
        escalate_to: None,
    };
    let roster = ResolvedRosterV1 {
        schema: RESOLVED_ROSTER_SCHEMA_V1.to_owned(),
        roster_ref: roster_ref.clone(),
        roles: BTreeMap::new(),
    };
    let package = ExecutionPackageV1 {
        schema: EXECUTION_PACKAGE_SCHEMA_V1.to_owned(),
        protocol_ref,
        profile_ref,
        roster_ref,
        profile_sha256: digest(&profile),
        roster_sha256: digest(&roster),
        profile,
        profile_catalog: BTreeMap::new(),
        roster,
        policy: ExecutionPolicyV1 {
            gate_commands: Vec::new(),
            stage_budget_s: BTreeMap::new(),
            termination_grace_s: forged_types::DEFAULT_TERMINATION_GRACE_S,
            transport_retry_budget: 1,
            host_policy: HostPolicyV1::Off,
            herdr_socket: None,
        },
    };
    NewRunDefinition {
        package_sha256: digest(&package),
        package,
        compatibility_roster: HashMap::new(),
    }
}

fn identity(
    kind: WorkIdentitySubjectKind,
    subject_id: &str,
    bead_id: &str,
    title: Option<&str>,
    captured_at: &str,
    source: WorkIdentitySource,
) -> WorkIdentityV1 {
    let repository = WorkIdentityRepositoryV1 {
        path: "/Users/tripp/repositories/forge".to_owned(),
        label: repository_label("/Users/tripp/repositories/forge").expect("label"),
    };
    WorkIdentityV1 {
        schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
        subject: WorkIdentitySubjectV1 {
            kind,
            id: subject_id.to_owned(),
        },
        bead: WorkIdentityBeadV1 {
            id: bead_id.to_owned(),
            title: title.map(str::to_owned),
            revision: Some("opaque-revision".to_owned()),
        },
        display_title: work_display_title(subject_id, title, Some(&repository.label), None, None),
        repository: Some(repository),
        project: None,
        epic: None,
        captured_at: captured_at.to_owned(),
        source,
    }
}

#[test]
fn low_level_run_creation_always_gets_atomic_fallback_identity() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    ledger
        .create_run(NewRun {
            run_id: RunId::new("legacy-run").expect("run id"),
            bead_id: "bead-legacy".to_owned(),
            repo: "relative/legacy".to_owned(),
            base_ref: "main".to_owned(),
            branch: "forged/legacy-run".to_owned(),
        })
        .expect("create");
    let stored = ledger
        .get_work_identity(WorkIdentitySubjectKind::Run, "legacy-run")
        .expect("read")
        .expect("identity");
    assert_eq!(stored.source, WorkIdentitySource::LegacyFallback);
    assert_eq!(stored.display_title, "legacy-run");
    assert_eq!(
        stored.repository, None,
        "relative legacy repo is not invented"
    );
    let snapshot = ledger
        .inventory_snapshot(&[], InventoryUsageSelection::Omit)
        .expect("snapshot");
    assert_eq!(
        snapshot
            .work_identities
            .get(&(WorkIdentitySubjectKind::Run, "legacy-run".to_owned())),
        Some(&stored)
    );
}

#[test]
fn complete_run_bundle_is_atomic_and_exactly_replayable() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    let new_run = NewRun {
        run_id: RunId::new("run-identity").expect("run id"),
        bead_id: "bead-identity".to_owned(),
        repo: "/Users/tripp/repositories/forge".to_owned(),
        base_ref: "main".to_owned(),
        branch: "forged/run-identity".to_owned(),
    };
    let event = json!({
        "runId": "run-identity",
        "source": "bead",
        "beadId": "bead-identity",
        "beadTitle": "Durable identity",
        "beadRevision": "opaque-revision",
        "repo": "/Users/tripp/repositories/forge"
    });
    let original = identity(
        WorkIdentitySubjectKind::Run,
        "run-identity",
        "bead-identity",
        Some("Durable identity"),
        "2026-08-14T20:00:00.000000000Z",
        WorkIdentitySource::Durable,
    );
    ledger
        .create_run_with_identity(
            new_run.clone(),
            definition(),
            event.clone(),
            original.clone(),
        )
        .expect("create bundle");

    let mut replay = original.clone();
    replay.captured_at = "later retry clock".to_owned();
    ledger
        .create_run_with_identity(new_run.clone(), definition(), event, replay)
        .expect("exact replay");
    assert_eq!(
        ledger
            .list_events(Some("run-identity"), 0, 100)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "forged.run.spec")
            .count(),
        1
    );
    assert_eq!(
        ledger
            .get_work_identity(WorkIdentitySubjectKind::Run, "run-identity")
            .expect("read"),
        Some(original)
    );

    let mut conflict = identity(
        WorkIdentitySubjectKind::Run,
        "run-conflict",
        "bead-conflict",
        Some("Wrong title"),
        "now",
        WorkIdentitySource::Durable,
    );
    conflict.display_title = "not deterministic".to_owned();
    let error = ledger
        .create_run_with_identity(
            NewRun {
                run_id: RunId::new("run-conflict").expect("run id"),
                bead_id: "bead-conflict".to_owned(),
                repo: "/Users/tripp/repositories/forge".to_owned(),
                base_ref: "main".to_owned(),
                branch: "forged/run-conflict".to_owned(),
            },
            definition(),
            json!({
                "runId": "run-conflict",
                "beadId": "bead-conflict",
                "beadTitle": "Wrong title",
                "beadRevision": "opaque-revision",
                "repo": "/Users/tripp/repositories/forge"
            }),
            conflict,
        )
        .expect_err("invalid identity refuses whole bundle");
    assert_eq!(error.code(), ErrorCode::InvalidRequest);
    assert_eq!(
        ledger
            .get_run("run-conflict")
            .expect_err("no partial run")
            .code(),
        ErrorCode::RunNotFound
    );
}

#[test]
fn epic_start_and_identity_commit_once_and_replay_together() {
    let dir = tempfile::tempdir().expect("tempdir");
    let ledger = Ledger::open(&dir.path().join("state.db")).expect("ledger");
    let event = json!({
        "schema": "forged.epic/1",
        "epicId": "epic-identity",
        "title": "Identity epic",
        "repo": "/Users/tripp/repositories/forge",
        "specRevision": "opaque-revision"
    });
    let original = identity(
        WorkIdentitySubjectKind::Epic,
        "epic-identity",
        "epic-identity",
        Some("Identity epic"),
        "2026-08-14T20:00:00.000000000Z",
        WorkIdentitySource::Durable,
    );
    assert!(ledger
        .append_epic_started_with_identity("epic-identity", event.clone(), original.clone())
        .expect("first start"));
    let mut replay = original.clone();
    replay.captured_at = "later retry clock".to_owned();
    assert!(!ledger
        .append_epic_started_with_identity("epic-identity", event, replay)
        .expect("replay"));
    assert_eq!(
        ledger
            .list_events(Some("epic-identity"), 0, 100)
            .expect("events")
            .len(),
        1
    );
    assert_eq!(
        ledger
            .get_work_identity(WorkIdentitySubjectKind::Epic, "epic-identity")
            .expect("identity"),
        Some(original)
    );
}

#[test]
fn a_fresh_epoch_recaptures_an_identity_a_pane_projection_references() {
    // Herdr pane projections hold a non-deferrable FK onto work_identities;
    // the abandon-boundary re-capture DELETEs and re-INSERTs the same
    // identity primary key, which only commits under deferred FK checking.
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).expect("ledger");
    let event = json!({
        "schema": "forged.epic/1",
        "epicId": "epic-herdr",
        "title": "Herdr epic",
        "repo": "/Users/tripp/repositories/forge",
        "specRevision": "opaque-revision"
    });
    let original = identity(
        WorkIdentitySubjectKind::Epic,
        "epic-herdr",
        "epic-herdr",
        Some("Herdr epic"),
        "2026-08-14T20:00:00.000000000Z",
        WorkIdentitySource::Durable,
    );
    assert!(ledger
        .append_epic_started_with_identity("epic-herdr", event.clone(), original.clone())
        .expect("first start"));
    ledger
        .append_event(
            Some("epic-herdr"),
            "forged.epic.abandoned",
            json!({"reason": "bad base", "controlId": "op:epic_abandon:epic-herdr:-:0"}),
        )
        .expect("abandon boundary");
    ledger.close().expect("close");
    {
        let conn = rusqlite::Connection::open(&path).expect("raw conn");
        conn.execute_batch(
            "PRAGMA foreign_keys=ON;
             INSERT INTO owned_herdr_sessions (
               ownership_id, schema, owner_kind, subject_kind, subject_id,
               controller_generation, pane_id, socket_path, protocol,
               sentinel_path, lifecycle_state, cleanup_state,
               cleanup_retry_budget, cleanup_retry_used, registered_at,
               command_started_at, updated_at
             ) VALUES (
               'fk-owned', 'forged.owned-herdr-session/1',
               'controller', 'epic', 'epic-herdr', 1,
               'fk-pane', '/tmp/fk-herdr.sock', 19,
               '/tmp/fk-owned/status', 'command-started',
               'not-requested', 8, 0, 't', 't', 't'
             );
             INSERT INTO herdr_pane_projections (
               projection_id, schema, target_kind, subject_kind, subject_id,
               ownership_id, pane_id, socket_path, protocol,
               controller_generation, metadata_source, desired_revision,
               desired_release, metadata_next_seq, metadata_state,
               metadata_retry_budget, metadata_retry_used,
               lifecycle_next_seq, lifecycle_state, lifecycle_retry_budget,
               lifecycle_retry_used, created_at, updated_at
             ) VALUES (
               'fk-projection', 'forged.herdr-pane-projection/1',
               'controller', 'epic', 'epic-herdr', 'fk-owned',
               'fk-pane', '/tmp/fk-herdr.sock', 19, 1,
               'forged:projection:metadata:fk', 1, 0, 0, 'pending',
               8, 0, 0, 'not-requested', 8, 0, 't', 't'
             );",
        )
        .expect("seed a projection referencing the identity");
    }
    let ledger = Ledger::open(&path).expect("reopen");
    let mut fresh = original.clone();
    fresh.captured_at = "2026-08-28T09:00:00.000000000Z".to_owned();
    assert!(
        ledger
            .append_epic_started_with_identity("epic-herdr", event, fresh.clone())
            .expect("fresh-epoch start with a referencing projection"),
        "the fresh epoch appends"
    );
    assert_eq!(
        ledger
            .get_work_identity(WorkIdentitySubjectKind::Epic, "epic-herdr")
            .expect("identity"),
        Some(fresh),
        "the boundary re-capture replaced the identity"
    );
}

#[test]
fn migration_015_uses_only_durable_events_and_child_epic_context() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    Ledger::open(&path)
        .expect("initial schema")
        .close()
        .expect("close");
    {
        let conn = rusqlite::Connection::open(&path).expect("raw");
        conn.execute_batch(
            r#"DROP TABLE bead_settlement_retry;
             DROP TABLE review_finding_deliveries;
             DROP TRIGGER herdr_projection_identity_immutable;
             DROP INDEX herdr_projection_lifecycle_wake;
             DROP INDEX herdr_projection_metadata_wake;
             DROP INDEX herdr_projection_lifecycle_token;
             DROP INDEX herdr_projection_metadata_token;
             DROP INDEX herdr_projection_layout_target;
             DROP INDEX herdr_projection_owned_target;
             DROP TABLE herdr_pane_projections;
             DROP TRIGGER owned_herdr_layout_immutable;
             DROP INDEX owned_herdr_layout;
             ALTER TABLE owned_herdr_sessions DROP COLUMN layout_id;
             DROP TRIGGER herdr_layout_locator_once;
             DROP TRIGGER herdr_layout_identity_immutable;
             DROP INDEX herdr_layout_cleanup_wake;
             DROP INDEX herdr_layout_cleanup_token;
             DROP INDEX herdr_layout_mutation_token;
             DROP INDEX herdr_layout_creation_token;
             DROP INDEX herdr_layout_exact_root;
             DROP INDEX herdr_layout_exact_tab;
             DROP INDEX one_active_herdr_layout;
             DROP TABLE herdr_layouts;
             DROP TRIGGER work_identity_immutable;
             DROP TABLE work_identities;
             DROP INDEX events_run_event;
             DROP TABLE work_leases;
             DROP INDEX work_deps_to;
             DROP TABLE work_deps;
             DROP TRIGGER work_revisions_append_only_update;
             DROP TRIGGER work_revisions_append_only_delete;
             DROP TABLE work_revisions;
             DROP TABLE work_items;
             PRAGMA user_version=14;
             INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, state, created_at, updated_at)
               VALUES ('child-run', 'child-bead', '/Users/tripp/repositories/./forge', 'main',
                       'forged/child-run', 'active', 'run-time', 'run-time');
             INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, state, created_at, updated_at)
               VALUES ('fallback-run', 'fallback-bead', '/Users/tripp/repositories/forge', 'main',
                       'forged/fallback-run', 'active', 'fallback-time', 'fallback-time');
             INSERT INTO runs (run_id, bead_id, repo, base_ref, branch, state, created_at, updated_at)
               VALUES ('plan-run', 'epic-one', '/Users/tripp/repositories/forge', 'main',
                       'forged/plan-run', 'active', 'plan-time', 'plan-time');
             INSERT INTO events (ts, run_id, kind, payload_json) VALUES
               ('epic-time', 'epic-one', 'forged.epic.started',
                '{"epicId":"epic-one","title":"Epic One","repo":"/Users/tripp/repositories/forge","specRevision":-42}'),
               ('spec-time', 'child-run', 'forged.run.spec',
                '{"runId":"child-run","source":"bead","beadId":"child-bead","beadTitle":"Child Work"}'),
               ('child-time', 'epic-one', 'forged.epic.child.started',
                '{"childId":"child-bead","runId":"child-run","generation":1}'),
               ('plan-time', 'epic-one', 'forged.epic.plan.started',
                '{"childId":"stub-bead","runId":"plan-run","generation":1}');"#,
        )
        .expect("seed v14");
    }
    let ledger = Ledger::open(&path).expect("migrate 015");
    assert_eq!(ledger.pragmas().expect("pragmas").user_version, 22);
    let epic = ledger
        .get_work_identity(WorkIdentitySubjectKind::Epic, "epic-one")
        .expect("read")
        .expect("epic identity");
    assert_eq!(epic.bead.title.as_deref(), Some("Epic One"));
    assert_eq!(epic.bead.revision.as_deref(), Some("-42"));
    assert_eq!(epic.source, WorkIdentitySource::Durable);
    let child = ledger
        .get_work_identity(WorkIdentitySubjectKind::Run, "child-run")
        .expect("read")
        .expect("child identity");
    assert_eq!(
        child.epic,
        Some(WorkIdentityContextV1 {
            id: "epic-one".to_owned(),
            title: Some("Epic One".to_owned()),
        })
    );
    assert_eq!(
        child.repository.expect("repository").path,
        "/Users/tripp/repositories/forge"
    );
    assert_eq!(child.source, WorkIdentitySource::Durable);
    let plan = ledger
        .get_work_identity(WorkIdentitySubjectKind::Run, "plan-run")
        .expect("read")
        .expect("planning identity");
    assert_eq!(
        plan.epic,
        Some(WorkIdentityContextV1 {
            id: "epic-one".to_owned(),
            title: Some("Epic One".to_owned()),
        })
    );
    let fallback = ledger
        .get_work_identity(WorkIdentitySubjectKind::Run, "fallback-run")
        .expect("read")
        .expect("fallback");
    assert_eq!(fallback.bead.title, None, "migration invents no title");
    assert_eq!(fallback.source, WorkIdentitySource::LegacyFallback);
    assert_eq!(fallback.display_title, "fallback-run [repositories/forge]");
}

#[test]
fn storage_rejects_live_plan_and_decoder_rejects_unknown_values() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let ledger = Ledger::open(&path).expect("ledger");
    let live = identity(
        WorkIdentitySubjectKind::Run,
        "planned",
        "planned",
        Some("Planned"),
        "now",
        WorkIdentitySource::LivePlan,
    );
    assert_eq!(
        ledger
            .store_work_identity(live)
            .expect_err("live plans are not history")
            .code(),
        ErrorCode::InvalidRequest
    );
    ledger.close().expect("close");
    {
        let conn = rusqlite::Connection::open(&path).expect("raw");
        conn.execute_batch(
            "PRAGMA ignore_check_constraints=ON;
             INSERT INTO work_identities (
               schema, subject_kind, subject_id, bead_id, display_title, captured_at, source
             ) VALUES (
               'forged.work-identity/1', 'run', 'corrupt', 'corrupt', 'corrupt', 'now', 'future'
             );
             INSERT INTO work_identities (
               schema, subject_kind, subject_id, bead_id, display_title, captured_at, source
             ) VALUES (
               'forged.work-identity/2', 'run', 'bad-schema', 'bad-schema', 'bad-schema', 'now', 'durable'
             );",
        )
        .expect("corrupt row");
    }
    let ledger = Ledger::open(&path).expect("reopen");
    assert_eq!(
        ledger
            .get_work_identity(WorkIdentitySubjectKind::Run, "corrupt")
            .expect_err("closed decoder")
            .code(),
        ErrorCode::Internal
    );
    assert_eq!(
        ledger
            .get_work_identity(WorkIdentitySubjectKind::Run, "bad-schema")
            .expect_err("unknown schema fails closed")
            .code(),
        ErrorCode::Internal
    );
}
