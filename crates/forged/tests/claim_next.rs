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
            spec_revision: None,
            body_json: json!({"fabricated": true}).to_string(),
        })
        .expect("open packet");
    let claimed = ledger
        // The claimant is the per-attempt session identity: packet-scoped,
        // not the run's bd lease holder.
        .claim_packet(
            &packet_id,
            &format!("forged:{packet_id}:0"),
            &forged_ledger::SpecFence::Sha256(sha.clone()),
        )
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

#[test]
fn a_lease_already_under_our_identity_resumes_without_retaking_it() {
    // Whitelisted resume branch (i): the reclaim REFUSES because the lease
    // is unexpired, and the holder it names is this run's own identity — a
    // driver restart resuming its own work. Proceed, and take no second
    // claim (there is nothing to retake).
    let env = TestEnv::new("forged-claim-next-ours");
    env.forged(&["init"]);
    fabricate_resumable(&env, "bead-ours");
    env.set_assignee("bead-ours", "forged:bead-ours:0");
    env.set_lease_unexpired("bead-ours");
    env.seed_frontier("bead-fresh");

    let (code, resp) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:ours-1",
    ]);
    assert_eq!(code, 0, "claim-next: {resp}");
    let claimed = &resp["result"]["claimed"];
    assert_eq!(
        claimed["resumed"],
        json!(true),
        "our own live lease is not a reason to skip the run: {resp}"
    );
    assert_eq!(claimed["run_id"], json!("bead-ours"));
    // No retake: the lease was already ours, so no claim call was needed.
    let calls = env.bd_calls();
    assert!(
        !calls
            .iter()
            .any(|l| l.starts_with("update bead-ours") && l.contains("--claim")),
        "a lease already under our identity is never re-claimed: {calls:?}"
    );
    assert!(
        !calls.iter().any(|l| l.starts_with("ready ")),
        "no frontier pull while a resumable run exists: {calls:?}"
    );
    assert_eq!(
        env.assignee("bead-ours").as_deref(),
        Some("forged:bead-ours:0")
    );
}

#[test]
fn an_unheld_bead_resumes_and_retakes_the_lease() {
    // Whitelisted resume branch (ii): no lease at all — expired and already
    // reclaimed, released by an earlier reconcile pass, or never taken.
    // Nothing can overlap, so resume and (re-)take the lease.
    let env = TestEnv::new("forged-claim-next-unheld");
    env.forged(&["init"]);
    fabricate_resumable(&env, "bead-unheld");
    env.seed_frontier("bead-fresh");

    let (code, resp) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:unheld-1",
    ]);
    assert_eq!(code, 0, "claim-next: {resp}");
    assert_eq!(resp["result"]["claimed"]["resumed"], json!(true), "{resp}");
    assert_eq!(resp["result"]["claimed"]["run_id"], json!("bead-unheld"));
    assert_eq!(
        env.assignee("bead-unheld").as_deref(),
        Some("forged:bead-unheld:0"),
        "the lease is retaken under the run's derived identity"
    );
}

#[test]
fn the_frontier_claim_and_run_drive_share_one_lease_identity() {
    // The composed path, end to end: claim-next pulls a FRESH bead, the
    // caller starts the run from it, and `run drive` resolves — which claims
    // the same bead again. One identity throughout, so the second claim is
    // this driver finding its own lease, never BEAD_LEASE_HELD against
    // itself. The operator's `--holder` never reaches bd.
    let env = TestEnv::new("forged-claim-next-composed");
    env.forged(&["init"]);
    env.seed_frontier("bead-composed");

    let (code, claimed) = env.forged(&[
        "claim-next",
        "--holder",
        "operator:laptop:4242",
        "--idempotency-key",
        "op:claim_next:composed-1",
    ]);
    assert_eq!(code, 0, "claim-next: {claimed}");
    assert_eq!(claimed["result"]["claimed"]["resumed"], json!(false));
    assert_eq!(
        claimed["result"]["claimed"]["bead_id"],
        json!("bead-composed")
    );
    assert_ne!(
        env.assignee("bead-composed").as_deref(),
        Some("operator:laptop:4242"),
        "the operator's --holder must never become the bd actor"
    );

    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-composed",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");

    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-composed"]);
    assert_eq!(code, 0, "run drive: {driven}");
    assert_eq!(
        driven["error"],
        Value::Null,
        "resolve must not wedge on the lease claim-next took: {driven}"
    );
    assert!(
        driven["result"]["terminal"]["done"].is_object(),
        "the run drives to Done over its own lease: {driven}"
    );
    let calls = env.bd_calls();
    assert!(
        !calls.iter().any(|l| l.contains("operator:laptop:4242")),
        "no bd call may carry the operator holder: {calls:?}"
    );
    // The guardian heartbeated the ONE identity the lease is held under.
    let holder = env.assignee("bead-composed").expect("the lease is held");
    assert!(
        calls
            .iter()
            .any(|l| l.starts_with("heartbeat bead-composed") && l.contains(&holder)),
        "the guardian heartbeats the identity actually in force ({holder}): {calls:?}"
    );
}
