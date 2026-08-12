//! `claim-next` ordering (BLOCKER-severity rule): a resumable ledger run is
//! preferred over a fresh bd frontier pull, the bd reclaim is scoped, a
//! refusal leaves the run untouched, and the retry deadline is honored.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

/// Fabricate a resumable run in the ledger: an Active run whose implement
/// packet has one transport-failed attempt and no live attempt, with the
/// resolve machine step settled (the shape a crashed driver leaves).
fn fabricate_resumable(env: &TestEnv, run_id: &str) {
    let ledger = env.ledger();
    let run = forged_ledger::NewRun {
        run_id: forged_types::RunId::new(run_id).expect("run id"),
        bead_id: run_id.to_owned(),
        repo: env.repos.repo.to_string_lossy().into_owned(),
        base_ref: env.repos.base.clone(),
        branch: format!("forged/{run_id}"),
    };
    ledger.create_run(run).expect("create run");
    ledger
        .append_event(
            Some(run_id),
            "forged.run.spec",
            json!({"runId": run_id, "specPath": env.spec.to_string_lossy()}),
        )
        .expect("spec event");

    // Settle the resolve machine step so `advance` reaches Implement.
    let key = forged_proto::machine_idempotency_key(run_id, forged_proto::MachineStage::Resolve, 0);
    let request = forged_types::OperationRequest {
        schema_version: 1,
        idempotency_key: key,
        run_id: Some(run_id.to_owned()),
        params: serde_json::Map::new(),
    };
    let ticket = match ledger
        .begin_operation(
            "resolve",
            &request,
            forged_ledger::EffectClass::SafeRetry,
            None,
        )
        .expect("begin resolve")
    {
        forged_ledger::OperationOutcome::Fresh(ticket) => ticket,
        other => panic!("fresh resolve expected: {other:?}"),
    };
    ledger
        .complete_operation(
            &ticket.operation_id,
            &forged_types::OperationResponse {
                ok: true,
                operation_id: ticket.operation_id.clone(),
                reused: false,
                result: Some(json!({"worktree": "fabricated"})),
                error: None,
            },
        )
        .expect("complete resolve");

    // Open the implement packet and leave one transport-failed attempt.
    let spec_bytes = std::fs::read(&env.spec).expect("spec bytes");
    let sha = {
        use sha2::Digest as _;
        let digest = sha2::Sha256::digest(&spec_bytes);
        digest
            .iter()
            .map(|b| format!("{b:02x}"))
            .collect::<String>()
    };
    let packet_id = ledger
        .open_packet(forged_ledger::NewPacket {
            run_id: run_id.to_owned(),
            stage: forged_types::Stage::Implement,
            seq: 1,
            spec_path: env.spec.to_string_lossy().into_owned(),
            spec_sha256: sha.clone(),
            body_json: json!({"fabricated": true}).to_string(),
        })
        .expect("open packet");
    let claimed = ledger
        // The claimant is the per-attempt session identity: packet-scoped,
        // not the run's bd lease holder.
        .claim_packet(&packet_id, &format!("forged:{packet_id}:0"), &sha)
        .expect("claim packet");
    ledger
        .fail_packet(
            &packet_id,
            &claimed.claim_token,
            "transport: session vanished",
        )
        .expect("fail packet");
    ledger.close().expect("close");
}

#[test]
fn a_fresh_bead_is_never_claimed_while_a_resumable_run_exists() {
    let env = TestEnv::new("forged-claim-next");
    env.forged(&["init"]);
    fabricate_resumable(&env, "bead-cn");
    // The dead driver's lease is still on the bead, and a fresh bead sits
    // ready on the frontier.
    env.set_assignee("bead-cn", "forged:bead-cn:0");
    env.seed_frontier("bead-fresh");

    let (code, resumed) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:cn-1",
    ]);
    assert_eq!(code, 0, "claim-next: {resumed}");
    let claimed = &resumed["result"]["claimed"];
    assert_eq!(claimed["resumed"], json!(true), "ledger first: {resumed}");
    assert_eq!(claimed["run_id"], json!("bead-cn"));
    assert_eq!(claimed["packet_id"], json!("bead-cn/implement/1"));
    assert!(claimed["attempt_id"].as_i64().is_some());
    assert!(claimed["claim_token"].as_str().is_some());

    // The fresh bead was NOT claimed: no frontier pull reached bd, and the
    // frontier still holds it.
    let calls = env.bd_calls();
    assert!(
        !calls.iter().any(|l| l.starts_with("ready ")),
        "no frontier pull while a resumable run exists: {calls:?}"
    );
    assert!(
        std::fs::read_to_string(env.beads_dir.join("shim-state/frontier"))
            .expect("frontier")
            .contains("bead-fresh"),
        "the fresh bead stays on the frontier"
    );

    // The reclaim was scoped: --id and --assignee both present, naming the
    // derived holder.
    let reclaim = calls
        .iter()
        .find(|l| l.starts_with("reclaim "))
        .expect("a scoped reclaim ran");
    assert!(reclaim.contains("--id bead-cn"), "scoped by id: {reclaim}");
    assert!(
        reclaim.contains("--assignee forged:bead-cn:0"),
        "scoped by assignee: {reclaim}"
    );
    // And the lease is back under the derived holder.
    assert_eq!(env.assignee("bead-cn").as_deref(), Some("forged:bead-cn:0"));

    // With the resumed attempt now live, the run is no longer resumable:
    // the next claim-next falls through to the frontier.
    let (code, fresh) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-2",
        "--idempotency-key",
        "op:claim_next:cn-2",
    ]);
    assert_eq!(code, 0, "second claim-next: {fresh}");
    assert_eq!(fresh["result"]["claimed"]["resumed"], json!(false));
    assert_eq!(fresh["result"]["claimed"]["bead_id"], json!("bead-fresh"));
}

#[test]
fn anothers_live_lease_leaves_the_run_alone() {
    // The refusal shape: the bd reclaim reclaims nothing because another
    // worker's lease is live — claim-next leaves the run untouched and
    // pulls the frontier instead.
    let env = TestEnv::new("forged-claim-next-refusal");
    env.forged(&["init"]);
    fabricate_resumable(&env, "bead-held");
    env.set_assignee("bead-held", "someone-else:host:99");
    env.seed_frontier("bead-open");

    let (code, resp) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:held-1",
    ]);
    assert_eq!(code, 0, "claim-next: {resp}");
    assert_eq!(
        resp["result"]["claimed"]["resumed"],
        json!(false),
        "a live foreign lease must not be robbed: {resp}"
    );
    assert_eq!(resp["result"]["claimed"]["bead_id"], json!("bead-open"));
    // The other worker's lease is intact.
    assert_eq!(
        env.assignee("bead-held").as_deref(),
        Some("someone-else:host:99")
    );
    // And the run's packet was never claimed.
    let ledger = env.ledger();
    assert!(
        ledger
            .list_live_attempts(Some("bead-held"))
            .expect("live")
            .is_empty(),
        "the held run keeps no new attempt"
    );
    ledger.close().expect("close");
}

#[test]
fn a_refusal_skips_that_run_and_the_scan_reaches_the_next_resumable() {
    // The scan is EXHAUSTIVE: a candidate whose lease is live under another
    // worker is skipped, not treated as "no ledger run is resumable". A
    // second resumable run sitting behind the refusal must be resumed, and
    // the fresh frontier must stay untouched.
    let env = TestEnv::new("forged-claim-next-scan");
    env.forged(&["init"]);
    // Ledger order is creation order: the refused run is scanned first.
    fabricate_resumable(&env, "bead-held");
    fabricate_resumable(&env, "bead-next");
    env.set_assignee("bead-held", "someone-else:host:99");
    env.set_assignee("bead-next", "forged:bead-next:0");
    env.seed_frontier("bead-fresh");

    let (code, resp) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:scan-1",
    ]);
    assert_eq!(code, 0, "claim-next: {resp}");
    let claimed = &resp["result"]["claimed"];
    assert_eq!(claimed["resumed"], json!(true), "a run resumed: {resp}");
    assert_eq!(
        claimed["run_id"],
        json!("bead-next"),
        "the scan continued past the refusal to the second resumable run: {resp}"
    );
    assert_eq!(claimed["packet_id"], json!("bead-next/implement/1"));

    // No fresh bead was pulled while a resumable run remained.
    let calls = env.bd_calls();
    assert!(
        !calls.iter().any(|l| l.starts_with("ready ")),
        "no frontier pull while a resumable run exists: {calls:?}"
    );
    assert!(
        std::fs::read_to_string(env.beads_dir.join("shim-state/frontier"))
            .expect("frontier")
            .contains("bead-fresh"),
        "the fresh bead stays on the frontier"
    );

    // The refused run was left entirely alone.
    assert_eq!(
        env.assignee("bead-held").as_deref(),
        Some("someone-else:host:99"),
        "the foreign lease is intact"
    );
    let ledger = env.ledger();
    assert!(
        ledger
            .list_live_attempts(Some("bead-held"))
            .expect("live")
            .is_empty(),
        "the refused run keeps no new attempt"
    );
    ledger.close().expect("close");
}

#[test]
fn a_pending_retry_deadline_defers_the_resume() {
    // never re-attempt early: a proto.retry deadline in the future makes
    // the run not-yet-resumable.
    let env = TestEnv::new("forged-claim-next-backoff");
    env.forged(&["init"]);
    fabricate_resumable(&env, "bead-wait");
    env.set_assignee("bead-wait", "forged:bead-wait:0");
    {
        let ledger = env.ledger();
        ledger
            .append_event(
                Some("bead-wait"),
                "proto.retry",
                json!({
                    "schemaVersion": 1,
                    "packetId": "bead-wait/implement/1",
                    "transportFailures": 1,
                    "retryAfter": "2099-01-01T00:00:00.000000000Z",
                }),
            )
            .expect("retry event");
        ledger.close().expect("close");
    }
    let (code, resp) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:wait-1",
    ]);
    assert_eq!(code, 0);
    assert_eq!(
        resp["result"]["claimed"],
        Value::Null,
        "a future retry deadline defers the resume: {resp}"
    );
}
