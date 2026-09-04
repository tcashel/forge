//! `claim-next` ordering (BLOCKER-severity rule): a resumable ledger run is
//! preferred over a fresh frontier pull, the work-lease reclaim is scoped, a
//! refusal leaves the run untouched, and the retry deadline is honored.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

/// Fabricate a resumable run in the ledger: an Active run whose implement
/// packet has one transport-failed attempt and no live attempt, with the
/// resolve machine step settled (the shape a crashed driver leaves).
/// Every `work.lease.reclaimed` payload, oldest first. Work coordination
/// events carry no run id, so the scan is over the whole stream.
fn reclaims(env: &TestEnv) -> Vec<Value> {
    let ledger = env.ledger();
    let events = ledger.list_events(None, 0, 65_536).expect("events");
    ledger.close().expect("close");
    events
        .into_iter()
        .filter(|event| event.kind == "work.lease.reclaimed")
        .map(|event| serde_json::from_str::<Value>(&event.payload_json).expect("payload"))
        .collect()
}

/// The live status of one work item.
fn work_status(env: &TestEnv, work: &str) -> String {
    let ledger = env.ledger();
    let item = ledger.work_item(work).expect("work item read");
    ledger.close().expect("close");
    item.expect("the work item exists")
        .status
        .as_str()
        .to_owned()
}

fn fabricate_resumable(env: &TestEnv, run_id: &str) {
    // The run's work must exist as a ledger row: the resume reads its lease
    // holder, and an absent work item refuses instead of defaulting open.
    env.ensure_work_item(run_id);
    let ledger = env.ledger();
    let run = forged_ledger::NewRun {
        run_id: forged_types::RunId::new(run_id).expect("run id"),
        work_id: run_id.to_owned(),
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
            policy_revision: None,
            body_json: json!({
                "fabricated": true,
                "providerHints": {
                    "provider": "claude",
                    "model": "opus",
                    "sandbox": "workspaceWrite",
                },
            })
            .to_string(),
        })
        .expect("open packet");
    let claimed = ledger
        // The claimant is the per-attempt session identity: packet-scoped,
        // not the run's work lease holder.
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
    ledger
        .authorize_desired_work(forged_ledger::DesiredSubjectKind::Run, run_id, 0)
        .expect("authorize resumable test run");
    ledger.close().expect("close");
}

#[test]
fn a_fresh_work_is_never_claimed_while_a_resumable_run_exists() {
    let env = TestEnv::new("forged-claim-next");
    env.forged(&["init"]);
    fabricate_resumable(&env, "bead-cn");
    // The dead driver's lease is still on the work, and a fresh work sits
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

    // The fresh work was NOT claimed: it is still open and unheld on the
    // frontier, which is now a query over exactly those two facts.
    assert_eq!(
        env.assignee("bead-fresh"),
        None,
        "no frontier claim fired while a resumable run exists"
    );
    assert_eq!(work_status(&env, "bead-fresh"), "open");

    // The reclaim was scoped: it names this run's work and the derived
    // holder, and nothing else was reclaimed.
    let reclaimed = reclaims(&env);
    assert_eq!(
        reclaimed.len(),
        1,
        "exactly one scoped reclaim: {reclaimed:?}"
    );
    assert_eq!(reclaimed[0]["workId"], json!("bead-cn"), "scoped by id");
    assert_eq!(
        reclaimed[0]["previousOwner"],
        json!("forged:bead-cn:0"),
        "scoped by the derived holder"
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
fn failed_subject_enrichment_cannot_return_a_successful_claim() {
    let env = TestEnv::new("forged-claim-next-subject-failure");
    env.forged(&["init"]);
    fabricate_resumable(&env, "bead-subject-failure");

    let connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open fixture db");
    connection
        .execute(
            "DELETE FROM work_identities WHERE subject_kind = 'run' AND subject_id = ?1",
            ["bead-subject-failure"],
        )
        .expect("remove identity required by the projection");
    drop(connection);

    let (code, response) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:subject-failure-1",
    ]);
    assert_ne!(code, 0, "missing subject identity must fail: {response}");
    assert_eq!(response["ok"], json!(false));
    assert_eq!(response["result"], Value::Null);
    assert!(
        response["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("work identity")),
        "the failure names the missing projection dependency: {response}"
    );
}

#[test]
fn anothers_live_lease_leaves_the_run_alone() {
    // The refusal shape: the work-lease reclaim reclaims nothing because another
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

    // No fresh work was pulled while a resumable run remained.
    assert_eq!(
        env.assignee("bead-fresh"),
        None,
        "no frontier claim fired while a resumable run exists"
    );
    assert_eq!(work_status(&env, "bead-fresh"), "open");

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
    // No retake: the lease was already ours, so the far-future expiry
    // `set_lease_unexpired` pinned is still exactly where it was. A retake
    // runs `claim_specific_work`, which rewrites `expires_at` to now + TTL.
    let ledger = env.ledger();
    let lease = ledger
        .work_lease("bead-ours")
        .expect("lease read")
        .expect("the lease is still held");
    ledger.close().expect("close");
    assert_eq!(lease.holder, "forged:bead-ours:0");
    assert_eq!(
        lease.expires_at, "2099-01-01T00:00:00.000000000Z",
        "a lease already under our identity is never re-claimed: {lease:?}"
    );
    // No frontier claim fired while a resumable run existed.
    assert_eq!(env.assignee("bead-fresh"), None);
    assert_eq!(
        env.assignee("bead-ours").as_deref(),
        Some("forged:bead-ours:0")
    );
}

#[test]
fn an_unheld_work_resumes_and_retakes_the_lease() {
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
fn a_frontier_claimed_in_progress_work_starts_and_drives_under_one_lease_identity() {
    // The composed path, end to end: claim-next pulls a FRESH work, the
    // caller starts the run from it, and `run drive` resolves — which claims
    // the same work again. One identity throughout, so the second claim is
    // this driver finding its own lease, never BEAD_LEASE_HELD against
    // itself. The operator's `--holder` never reaches bd.
    let env = TestEnv::new("forged-claim-next-composed");
    env.forged(&["init"]);
    env.seed_work_spec(
        "bead-composed",
        "## Context\\n\\nthe frontier claim composes with run start.",
        "- the claimed bead starts and drives",
    );
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
    assert_eq!(
        work_status(&env, "bead-composed"),
        "in_progress",
        "claim-next must move the ready bead to the claimed status"
    );
    assert_eq!(
        env.assignee("bead-composed").as_deref(),
        Some("forged:frontier:0"),
        "the fresh bead is held under the pre-run frontier identity"
    );
    assert_ne!(
        env.assignee("bead-composed").as_deref(),
        Some("operator:laptop:4242"),
        "the operator's --holder must never become the bd actor"
    );

    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-composed",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    assert_eq!(
        env.assignee("bead-composed").as_deref(),
        Some("forged:frontier:0"),
        "run start must accept the exact frontier-held in_progress shape \
         without re-claiming it: {started}"
    );
    env.authorize_run("bead-composed");

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
    // The operator's --holder never became a custody identity anywhere in
    // the ledger's work record.
    let ledger = env.ledger();
    let events = ledger.list_events(None, 0, 65_536).expect("events");
    let lease = ledger.work_lease("bead-composed").expect("lease read");
    ledger.close().expect("close");
    assert!(
        !events
            .iter()
            .any(|event| event.payload_json.contains("operator:laptop:4242")),
        "no work event may carry the operator holder"
    );
    // ONE identity end to end. Lease renewal rides the attempt heartbeat,
    // and a renewal under any other identity refuses with WorkLeaseHeld and
    // self-terminates the attempt — so reaching Done over a lease still
    // held by the frontier identity IS the proof the renewal used it.
    assert_eq!(
        lease.expect("the lease is held").holder,
        "forged:frontier:0"
    );
    assert_eq!(
        env.assignee("bead-composed").as_deref(),
        Some("forged:frontier:0")
    );

    env.seed_work_spec(
        "bead-foreign-claimed",
        "## Context\\n\\na foreign claim must not start.",
        "- only frontier custody is accepted",
    );
    env.set_work_field("bead-foreign-claimed", "status", "in_progress");
    env.set_assignee("bead-foreign-claimed", "other-worker");
    let (code, refused) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-foreign-claimed",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_ne!(
        code, 0,
        "an in_progress bead held outside the frontier must not start: {refused}"
    );
    let message = refused["error"]["message"].as_str().unwrap_or_default();
    assert!(
        message.contains("in_progress") && message.contains("other-worker"),
        "the refusal must identify the rejected status and holder: {refused}"
    );
}

#[test]
fn a_work_sourced_packet_resumes_and_its_lease_writes_never_move_the_revision() {
    // The crash-resume path for the supported route. `claim-next` RECLAIMS
    // and then RE-CLAIMS the run's lease before it re-reads the spec. Those
    // are coordination writes, and coordination never mints a revision — so
    // the token the packet was opened at is still the live one, and the
    // resume is fenced on the rendered body either way.
    let env = TestEnv::new("forged-claim-next-bead");
    env.forged(&["init"]);
    env.seed_work_spec(
        "bead-resume",
        "## Context\\n\\nthe bead is the spec.",
        "- the resume survives its own lease write",
    );
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-resume",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    env.authorize_run("bead-resume");

    // Advance to an open packet, then leave the shape a crashed driver
    // leaves: one transport-failed attempt, no live attempt.
    let packet = loop {
        let ledger = env.ledger();
        let opened = ledger
            .list_packets("bead-resume")
            .unwrap_or_default()
            .into_iter()
            .next();
        ledger.close().expect("close");
        if let Some(packet) = opened {
            break packet;
        }
        let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-resume"]);
        assert_eq!(code, 0, "advance: {advanced}");
    };
    let opened_at = packet.spec_revision.clone().expect("a bead-sourced packet");
    let ledger = env.ledger();
    let claimed = ledger
        .claim_packet(
            &packet.packet_id,
            &format!("forged:{}:0", packet.packet_id),
            &forged_ledger::SpecFence::Revision {
                revision: opened_at.clone(),
                body_sha256: packet.spec_sha256.clone(),
            },
        )
        .expect("claim at the pinned body");
    ledger
        .fail_packet(
            &packet.packet_id,
            &claimed.claim_token,
            "transport: session vanished",
        )
        .expect("fail packet");
    ledger.close().expect("close");

    let (code, resumed) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:bead-resume-1",
    ]);
    assert_eq!(code, 0, "the bead-sourced packet must resume: {resumed}");
    let claimed = &resumed["result"]["claimed"];
    assert_eq!(claimed["resumed"], json!(true), "ledger first: {resumed}");
    assert_eq!(claimed["packet_id"], json!(packet.packet_id));

    // The lease writes did NOT move the token: revisions are minted by spec
    // writes alone, and the claim re-pins the row to where the store is now
    // rather than leaving a dead value behind.
    let ledger = env.ledger();
    let row = ledger.get_packet(&packet.packet_id).expect("packet row");
    ledger.close().expect("close");
    assert_eq!(
        env.work_revision("bead-resume"),
        opened_at,
        "custody and lease churn must never move the revision"
    );
    assert_eq!(
        row.spec_revision.as_deref(),
        Some(env.work_revision("bead-resume").as_str()),
        "the resuming claim pins the live write token: {row:?}"
    );
    assert_eq!(
        row.spec_sha256, packet.spec_sha256,
        "the body it is fenced on never moved"
    );

    // And the resumed seat finds the rendered body on disk: `claim-next`
    // hands work to an EXTERNAL worker, which never enters the in-process
    // attempt pipeline that used to be the only writer of this file.
    let body = std::fs::read_to_string(&row.spec_path)
        .unwrap_or_else(|e| panic!("resumed seat spec at {}: {e}", row.spec_path));
    assert!(
        body.contains("## Acceptance Criteria")
            && body.contains("- the resume survives its own lease write"),
        "the resumed seat must find its spec materialized: {body}"
    );
}

/// The ledger-first resume must recover a spec edit, exactly as `run advance`
/// does.
///
/// `beads-fbt` taught `execute_packet` to re-pin an edited work under an open
/// packet, because a packet pinned to bytes nobody can reach refuses every
/// claim as drift, forever. `claim-next` is the OTHER claim path and it did
/// not get that fix — so the recovery workflow an operator reaches for by
/// hand was the one that could not recover.
#[test]
fn a_work_edited_under_an_open_packet_is_re_pinned_by_the_resume() {
    let env = TestEnv::new("forged-claim-next-repin");
    env.forged(&["init"]);
    env.seed_work_spec(
        "bead-repin",
        "## Context\\n\\nthe bead is the spec.",
        "- the resume re-pins an edited spec",
    );
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-repin",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    env.authorize_run("bead-repin");

    // Advance to an open packet, then leave the shape a crashed driver
    // leaves: one transport-failed attempt, no live attempt.
    let packet = loop {
        let ledger = env.ledger();
        let opened = ledger
            .list_packets("bead-repin")
            .unwrap_or_default()
            .into_iter()
            .next();
        ledger.close().expect("close");
        if let Some(packet) = opened {
            break packet;
        }
        let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-repin"]);
        assert_eq!(code, 0, "advance: {advanced}");
    };
    let opened_at_body = packet.spec_sha256.clone();
    let ledger = env.ledger();
    let claimed = ledger
        .claim_packet(
            &packet.packet_id,
            &format!("forged:{}:0", packet.packet_id),
            &forged_ledger::SpecFence::Revision {
                revision: packet.spec_revision.clone().expect("bead-sourced"),
                body_sha256: packet.spec_sha256.clone(),
            },
        )
        .expect("claim at the pinned body");
    ledger
        .fail_packet(
            &packet.packet_id,
            &claimed.claim_token,
            "transport: session vanished",
        )
        .expect("fail packet");
    ledger.close().expect("close");

    // The operator revises the spec while the packet sits open and unclaimed
    // — the whole reason the work is the source of truth.
    env.set_work_field("bead-repin", "acceptance", "- revised acceptance");

    let (code, resumed) = env.forged(&[
        "claim-next",
        "--holder",
        "worker-1",
        "--idempotency-key",
        "op:claim_next:bead-repin-1",
    ]);
    assert_eq!(
        code, 0,
        "an edited bead must not wedge the resume: {resumed}"
    );
    assert_eq!(
        resumed["result"]["claimed"]["packet_id"],
        json!(packet.packet_id)
    );

    let ledger = env.ledger();
    let row = ledger.get_packet(&packet.packet_id).expect("packet row");
    ledger.close().expect("close");
    assert_ne!(
        row.spec_sha256, opened_at_body,
        "the row must be re-pinned to the body the bead carries now: {row:?}"
    );

    // And the resumed seat reads the REVISED body, not the one the packet
    // was opened at — a re-pin that left the file behind would hand the
    // worker bytes the ledger no longer fences.
    let body = std::fs::read_to_string(&row.spec_path)
        .unwrap_or_else(|e| panic!("resumed seat spec at {}: {e}", row.spec_path));
    assert!(
        body.contains("revised acceptance"),
        "the seat reads the revised spec: {body}"
    );
}
