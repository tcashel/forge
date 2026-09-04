use std::path::PathBuf;

use forged_types::{
    canonical_json_bytes, AdmissionCandidateV1, AdmissionCapacityV1, AdmissionInputsV1,
    AdmissionResourceClass, AdmissionSubjectKind, Deliverable, PacketColumns, ProviderHints,
    Sandbox, SpecRef, Stage, StageContract, WorkIdentityContextV1, WorkIdentityRepositoryV1,
    WorkIdentitySource, WorkIdentitySubjectKind, WorkIdentitySubjectV1, WorkIdentityV1,
    WorkIdentityWorkV1, WorkPacket, ADMISSION_INPUTS_SCHEMA_V1, WORK_IDENTITY_SCHEMA_V1,
};
use serde::Deserialize;

/// Opaque output captured by compiling git tag v0.7.1 at commit
/// 23ebbf858fa2aa600312b5e21aa453c185f1996f
/// and executing these three public storage serializers from that checkout.
/// The current crate only reads the fixture; it cannot manufacture the
/// expected bytes with the implementation under test.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct V071PersistedBytes {
    version: String,
    commit: String,
    packet_body_json: String,
    admission_inputs_json: String,
    run_identity_json: String,
}

fn fixture() -> V071PersistedBytes {
    serde_json::from_str(include_str!("fixtures/v071-persisted-bytes.json"))
        .expect("v0.7.1 persisted-byte fixture")
}

fn packet() -> WorkPacket {
    WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: "pkt-1".to_owned(),
        run_id: "run-1".to_owned(),
        work_id: "bead-1".to_owned(),
        stage: Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: SpecRef {
            path: "specs/bead-1.md".to_owned(),
            sha256: "cafe".to_owned(),
            revision: None,
        },
        worktree: PathBuf::from("/tmp/worktrees/run-1"),
        branch: "feat/bead-1".to_owned(),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "build it".to_owned(),
            gate_commands: vec!["cargo test --workspace".to_owned()],
            deliverable: Deliverable::CommitsInWorktree,
            budget_s: 3600,
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: ProviderHints {
            provider: "claude".to_owned(),
            model: "opus".to_owned(),
            effort: Some("high".to_owned()),
            sandbox: Sandbox::WorkspaceWrite,
        },
        field_notes: vec!["watch the seam".to_owned()],
    }
}

fn admission_inputs() -> AdmissionInputsV1 {
    AdmissionInputsV1 {
        schema: ADMISSION_INPUTS_SCHEMA_V1.to_owned(),
        as_of: "2026-01-01T00:00:01Z".to_owned(),
        policy_revision: "policy-1".to_owned(),
        ledger_revision: "42".to_owned(),
        candidates: vec![AdmissionCandidateV1 {
            subject_kind: AdmissionSubjectKind::Run,
            subject_id: "run-1".to_owned(),
            control_revision: 7,
            work_id: "ore-1".to_owned(),
            work_revision: Some("3".to_owned()),
            work_status: Some("open".to_owned()),
            priority: Some(1),
            repository: "/repo".to_owned(),
            work_repository: Some("/repo".to_owned()),
            input_error: None,
            desired_wake_at: None,
            provider: Some("codex".to_owned()),
            model: Some("model".to_owned()),
            resource_class: AdmissionResourceClass::RepositoryWrite,
            authorized_at: "2026-01-01T00:00:00Z".to_owned(),
        }],
        capacity: AdmissionCapacityV1::default(),
        spend: Vec::new(),
        latest_rate_limits: Vec::new(),
    }
}

fn identity() -> WorkIdentityV1 {
    WorkIdentityV1 {
        schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
        subject: WorkIdentitySubjectV1 {
            kind: WorkIdentitySubjectKind::Run,
            id: "run-1".to_owned(),
        },
        work: WorkIdentityWorkV1 {
            id: "bead-1".to_owned(),
            title: None,
            revision: None,
        },
        repository: Some(WorkIdentityRepositoryV1 {
            path: "/Users/tripp/repositories/forge".to_owned(),
            label: "repositories/forge".to_owned(),
        }),
        project: None,
        epic: Some(WorkIdentityContextV1 {
            id: "epic-1".to_owned(),
            title: Some("Operations".to_owned()),
        }),
        display_title: "Operations / run-1 [repositories/forge]".to_owned(),
        captured_at: "2026-08-19T00:00:00.000000000Z".to_owned(),
        source: WorkIdentitySource::LegacyFallback,
    }
}

#[test]
fn current_storage_bytes_are_identical_to_genuine_v071_output() {
    let fixture = fixture();
    assert_eq!(fixture.version, "v0.7.1");
    assert_eq!(fixture.commit, "23ebbf858fa2aa600312b5e21aa453c185f1996f");

    let packet = packet();
    assert_eq!(packet.stored_body().unwrap(), fixture.packet_body_json);
    let current_inputs = String::from_utf8(
        canonical_json_bytes(&serde_json::to_value(admission_inputs()).unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(current_inputs, fixture.admission_inputs_json);
    assert_eq!(
        serde_json::to_string(&identity()).unwrap(),
        fixture.run_identity_json
    );
}

#[test]
fn a_packet_body_persisted_by_v071_reopens_under_the_current_binary() {
    let fixture = fixture();
    let expected = packet();
    let reopened = WorkPacket::from_stored_body(
        &fixture.packet_body_json,
        PacketColumns {
            packet_id: expected.packet_id.clone(),
            run_id: expected.run_id.clone(),
            stage: expected.stage,
            seq: 1,
            spec: expected.spec.clone(),
        },
    )
    .expect("v0.7.1 packet body reopens");
    assert_eq!(reopened, expected);

    let reopened_identity: WorkIdentityV1 =
        serde_json::from_str(&fixture.run_identity_json).expect("v0.7.1 identity reopens");
    assert_eq!(reopened_identity, identity());

    let reopened_inputs: AdmissionInputsV1 =
        serde_json::from_str(&fixture.admission_inputs_json).expect("v0.7.1 inputs reopen");
    assert_eq!(reopened_inputs, admission_inputs());
}
