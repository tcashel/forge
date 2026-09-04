use std::path::PathBuf;

use forged_ledger::{EffectClass, NewPacket, OperationOutcome};
use forged_types::{
    Deliverable, Finding, OperationRequest, OperationResponse, Outcome, PacketResult,
    ProviderHints, Sandbox, Severity, SpecRef, Stage, StageContract, Verdict, WorkPacket,
};
use serde_json::{json, Map, Value};

use super::TestEnv;

pub(crate) fn review_packet(run_id: &str, seq: i64) -> WorkPacket {
    let packet_id = format!("{run_id}/reviewclaude/{seq}");
    WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id,
        run_id: run_id.to_owned(),
        work_id: format!("bead-{run_id}"),
        stage: Stage::ReviewClaude,
        execution: None,
        lane_seq: None,
        spec: SpecRef {
            path: "beads://fixture".to_owned(),
            sha256: "a".repeat(64),
            revision: Some("fixture-revision".to_owned()),
        },
        worktree: PathBuf::from("/unread/worktree"),
        branch: format!("work/{run_id}"),
        base_ref: "main".to_owned(),
        contract: StageContract {
            instructions: "review".to_owned(),
            gate_commands: Vec::new(),
            deliverable: Deliverable::ReviewBlock,
            budget_s: 60,
            seat_commands: Vec::new(),
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: ProviderHints {
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            effort: None,
            sandbox: Sandbox::ReadOnly,
            env: Default::default(),
        },
        field_notes: Vec::new(),
    }
}

pub(crate) fn open_review_packet(env: &TestEnv, run_id: &str, seq: i64) -> String {
    let packet = review_packet(run_id, seq);
    let packet_id = packet.packet_id.clone();
    let ledger = env.ledger();
    ledger
        .open_packet(NewPacket {
            run_id: run_id.to_owned(),
            stage: packet.stage,
            seq,
            spec_path: packet.spec.path.clone(),
            spec_sha256: packet.spec.sha256.clone(),
            spec_revision: packet.spec.revision.clone(),
            policy_revision: None,
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open review packet");
    ledger.close().expect("close ledger");
    packet_id
}

pub(crate) fn insert_completed(env: &TestEnv, packet_id: &str, raw_result: &str) -> i64 {
    let connection = rusqlite::Connection::open(env.anvil.join("state.db")).expect("open db");
    connection
        .execute(
            "INSERT INTO attempts (
               packet_id, claim_token, claimant, state, result_json,
               started_at, updated_at, ended_at
             ) VALUES (?1, ?2, 'fixture', 'completed', ?3,
               '2026-08-15T00:00:00.000000000Z',
               '2026-08-15T00:00:01.000000000Z',
               '2026-08-15T00:00:01.000000000Z')",
            rusqlite::params![packet_id, uuid::Uuid::now_v7().to_string(), raw_result],
        )
        .expect("insert completed attempt");
    connection.last_insert_rowid()
}

pub(crate) fn result(packet_id: &str, findings: Vec<Finding>) -> String {
    serde_json::to_string(&PacketResult {
        schema: "forged.result/1".to_owned(),
        packet_id: packet_id.to_owned(),
        outcome: Outcome::Review {
            verdict: if findings.is_empty() {
                Verdict::Approve
            } else {
                Verdict::RequestChanges
            },
            summary: "fixture review".to_owned(),
            findings,
            available: true,
        },
    })
    .expect("review result")
}

pub(crate) fn finding(severity: Severity, message: &str) -> Finding {
    Finding {
        severity,
        file: Some("src/lib.rs".to_owned()),
        line: Some(7),
        message: message.to_owned(),
    }
}

pub(crate) fn seed_draft_pr(env: &TestEnv, run_id: &str, number: u64) {
    let ledger = env.ledger();
    let key = forged_proto::machine_idempotency_key(run_id, forged_proto::MachineStage::DraftPr, 0);
    let request = OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(run_id.to_owned()),
        params: Map::from_iter([
            ("head".to_owned(), json!(format!("forged/{run_id}"))),
            ("base".to_owned(), json!("main")),
        ]),
    };
    let operation_id = match ledger
        .begin_operation("draftpr", &request, EffectClass::ObserveOnly, None)
        .expect("begin draftpr")
    {
        OperationOutcome::Fresh(ticket) => ticket.operation_id,
        OperationOutcome::Replayed(_) => panic!("fixture draftpr unexpectedly replayed"),
    };
    let response = OperationResponse {
        operation_id: operation_id.clone(),
        reused: false,
        ok: true,
        result: Some(json!({
            "pr": {
                "number": number,
                "isDraft": true,
                "baseRefName": "main",
                "headRefName": format!("forged/{run_id}"),
                "url": format!("https://github.com/acme/widget/pull/{number}")
            }
        })),
        error: None,
    };
    ledger
        .complete_operation(&operation_id, &response)
        .expect("complete draftpr");
    ledger.close().expect("close ledger");
}

pub(crate) fn set_gh_success(env: &TestEnv) {
    env.gh_set("list_comments", "stdout", "[]");
    env.gh_set("post_comment", "stdout", r#"{"id":1,"body":"created"}"#);
}

pub(crate) fn publish(env: &TestEnv, run_id: &str) -> (i32, Value) {
    env.forged(&["review", "publish", "--run", run_id])
}
