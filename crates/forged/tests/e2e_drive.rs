//! The hermetic end-to-end slice: `run drive` to `Stop(Done { .. })` with
//! the fake providers serving Implement, both Review legs, and Fix; the gh
//! shim call log shows exactly one draft PR creation and zero merge or
//! ready-for-review calls; the origin repo holds the real commits.

mod support;

use serde_json::{json, Value};
use support::{assert_no_overlap, rev_parse, TestEnv};

#[test]
fn run_drive_reaches_done_with_one_draft_pr_and_real_commits() {
    let env = TestEnv::new("forged-e2e");
    let (code, init) = env.forged(&["init"]);
    assert_eq!(code, 0, "init: {init}");

    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run", "start", "--bead", "bead-e2e", "--repo", &repo, "--spec", &spec, "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    assert_eq!(started["result"]["run_id"], json!("bead-e2e"));
    assert_eq!(started["result"]["branch"], json!("forged/bead-e2e"));

    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-e2e"]);
    assert_eq!(code, 0, "run drive: {driven}");
    assert_eq!(
        driven["result"]["terminal"]["done"]["finalVerdict"],
        json!("approve"),
        "drive must stop Done(approve): {driven}"
    );

    // Exactly one draft PR creation; zero merge or ready-for-review calls.
    let gh = env.gh_calls();
    let creates = gh
        .iter()
        .filter(|argv| argv.iter().any(|a| a.contains("/pulls")) && argv.contains(&"POST".to_owned()))
        .count();
    assert_eq!(creates, 1, "exactly one PR creation: {gh:?}");
    assert!(
        gh.iter()
            .filter(|argv| argv.iter().any(|a| a.contains("/pulls")))
            .all(|argv| argv.contains(&"draft=true".to_owned())),
        "the one creation must be a draft: {gh:?}"
    );
    for forbidden in ["merge", "ready"] {
        assert!(
            !gh.iter().any(|argv| argv.contains(&forbidden.to_owned())),
            "no {forbidden} call may reach gh: {gh:?}"
        );
    }

    // Final repo content: the implement and fix commits reached the origin
    // branch — real refs, not ledger labels.
    let branch_sha = rev_parse(&env.repos.origin, "refs/heads/forged/bead-e2e");
    let worktree_sha = rev_parse(&env.worktree("bead-e2e"), "HEAD");
    assert_eq!(branch_sha, worktree_sha, "origin must hold the pushed head");
    let log = support::git(
        &env.repos.origin,
        &["log", "--format=%s", "refs/heads/forged/bead-e2e"],
    );
    assert!(log.contains("shim implement"), "implement commit: {log}");
    assert!(log.contains("shim fix"), "fix commit: {log}");

    // Provider selection routed by hints: the claude shim served implement
    // and reviewclaude; the codex shim served reviewcodex — the packet ids
    // in the shared shim log name the stages, and no packet's processes
    // overlapped.
    let plog = env.provider_log();
    for packet in [
        "bead-e2e/implement/1",
        "bead-e2e/reviewclaude/1",
        "bead-e2e/reviewcodex/1",
        "bead-e2e/fix/1",
        "bead-e2e/reviewclaude/2",
        "bead-e2e/reviewcodex/2",
    ] {
        assert!(
            plog.iter().any(|l| l.starts_with(packet)),
            "{packet} must have run: {plog:?}"
        );
        assert_no_overlap(&plog, packet);
    }

    // The guardian heartbeated the run's lease (per attempt) through bd,
    // under the derived per-run holder.
    let beats = env
        .bd_calls()
        .iter()
        .filter(|l| l.starts_with("heartbeat bead-e2e") && l.contains("forged:bead-e2e:0"))
        .count();
    assert!(beats >= 1, "guardian heartbeats: {:?}", env.bd_calls());

    // Usage ingestion maps the captured shim streams into ledger rows.
    let (code, ingested) = env.forged(&["usage", "ingest", "--run", "bead-e2e"]);
    assert_eq!(code, 0, "usage ingest: {ingested}");
    assert!(
        ingested["result"]["ingested"].as_u64().unwrap_or(0) >= 4,
        "usage rows from the six packets: {ingested}"
    );
    let (code, report) = env.forged(&["usage", "--run", "bead-e2e"]);
    assert_eq!(code, 0);
    assert!(
        report["result"]["totals"]["inputTokens"].as_u64().unwrap_or(0) > 0,
        "totals reflect ingested rows: {report}"
    );

    // The events surface replays the run's stream, proto kinds included.
    let (code, events) = env.forged(&["events", "--run", "bead-e2e"]);
    assert_eq!(code, 0, "events: {events}");
    let kinds: Vec<&str> = events["result"]["events"]
        .as_array()
        .expect("events array")
        .iter()
        .filter_map(|e| e["kind"].as_str())
        .collect();
    for kind in ["proto.gate", "proto.pr", "attempt.state", "proto.operation.request"] {
        assert!(kinds.contains(&kind), "{kind} in stream: {kinds:?}");
    }

    // run status projects the finished run.
    let (code, status) = env.forged(&["run", "status", "--run", "bead-e2e"]);
    assert_eq!(code, 0);
    assert!(
        status["result"]["run"]["nextAction"]["stop"]["done"].is_object(),
        "status shows the run stopped Done: {status}"
    );

    // packet show returns the stored packet body and its attempts.
    let (code, shown) = env.forged(&["packet", "show", "--packet", "bead-e2e/implement/1"]);
    assert_eq!(code, 0);
    assert_eq!(
        shown["result"]["packet"]["schema"],
        json!("forged.packet/1")
    );
    assert!(
        shown["result"]["attempts"]
            .as_array()
            .is_some_and(|a| !a.is_empty()),
        "implement packet has attempt history: {shown}"
    );
    assert_eq!(
        shown["result"]["packet"]["providerHints"]["provider"],
        json!("claude"),
        "implement routed to the claude driver"
    );
    let (_, codex_shown) = env.forged(&["packet", "show", "--packet", "bead-e2e/reviewcodex/1"]);
    assert_eq!(
        codex_shown["result"]["packet"]["providerHints"]["provider"],
        json!("codex"),
        "reviewcodex routed to the codex driver"
    );

    // Retire the worktree once the run is done (explicit key required).
    let (code, retired) = env.forged(&[
        "worktree",
        "retire",
        "--run",
        "bead-e2e",
        "--force",
        "--run-state-terminal",
        "--idempotency-key",
        "op:worktree_retire:e2e-1",
    ]);
    assert_eq!(code, 0, "worktree retire: {retired}");
    assert_eq!(retired["result"]["retired"], json!(true));
    assert!(!env.worktree("bead-e2e").exists());
}

#[test]
fn semantic_failure_consumes_no_transport_budget_and_reclaims() {
    // A no-block implement attempt fails semantically; the driver claims
    // again and the second attempt lands. The failure note is the pinned
    // "no forged-result block".
    let env = TestEnv::new("forged-e2e-semantic");
    env.forged(&["init"]);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    env.forged(&[
        "run", "start", "--bead", "bead-sem", "--repo", &repo, "--spec", &spec, "--base-ref",
        "main",
    ]);
    env.set_scenario("implement", "no-block", 1);
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-sem"]);
    assert_eq!(code, 0, "drive after semantic retry: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());

    // The ledger recorded the semantic note verbatim and no proto.retry.
    let (_, events) = env.forged(&["events", "--run", "bead-sem"]);
    let rows = events["result"]["events"].as_array().expect("events").clone();
    let failed_notes: Vec<String> = rows
        .iter()
        .filter(|e| e["kind"] == json!("attempt.state") && e["payload"]["new"] == json!("failed"))
        .filter_map(|e| e["payload"]["reason"].as_str().map(str::to_owned))
        .collect();
    assert_eq!(
        failed_notes,
        vec!["no forged-result block".to_owned()],
        "the pinned semantic note"
    );
    assert!(
        !rows.iter().any(|e| e["kind"] == json!("proto.retry")),
        "a semantic failure grants no transport retry"
    );
    let plog = env.provider_log();
    assert_no_overlap(&plog, "bead-sem/implement/1");
    let starts = plog
        .iter()
        .filter(|l| l.starts_with("bead-sem/implement/1") && l.contains(" start "))
        .count();
    assert_eq!(starts, 2, "one failed and one successful attempt: {plog:?}");
}

#[test]
fn claude_rate_limit_is_a_free_transport_retry() {
    // The claude marker branch: an is_error result carrying "rate limit"
    // fails transport, grants a proto.retry, and the retry lands. Uses a
    // small stage budget so the deadline math stays observable.
    let env = TestEnv::new("forged-e2e-transport");
    env.forged(&["init"]);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    env.forged(&[
        "run", "start", "--bead", "bead-tr", "--repo", &repo, "--spec", &spec, "--base-ref",
        "main",
    ]);
    env.set_scenario("implement", "rate-limit", 1);
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-tr"]);
    assert_eq!(code, 0, "drive after transport retry: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());

    let (_, events) = env.forged(&["events", "--run", "bead-tr"]);
    let rows = events["result"]["events"].as_array().expect("events").clone();
    let retry = rows
        .iter()
        .find(|e| e["kind"] == json!("proto.retry"))
        .expect("a transport failure grants a proto.retry event");
    assert_eq!(retry["payload"]["transportFailures"], json!(1));
    assert!(retry["payload"]["retryAfter"].as_str().is_some());
    let note = rows
        .iter()
        .filter(|e| e["kind"] == json!("attempt.state") && e["payload"]["new"] == json!("failed"))
        .find_map(|e| e["payload"]["reason"].as_str())
        .expect("failed attempt note");
    assert!(
        note.starts_with("transport:"),
        "the note's transport: prefix is the classification: {note}"
    );
}

#[test]
fn reconcile_runs_the_ports_end_to_end_on_a_live_run() {
    // AC 9's default-features leg: the ForgedPorts adapter is driven by
    // forged_proto::reconcile against a real (finished) run.
    let env = TestEnv::new("forged-e2e-reconcile");
    env.forged(&["init"]);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    env.forged(&[
        "run", "start", "--bead", "bead-rec", "--repo", &repo, "--spec", &spec, "--base-ref",
        "main",
    ]);
    let (code, _) = env.forged(&["run", "drive", "--run", "bead-rec"]);
    assert_eq!(code, 0);
    let (code, reconciled) = env.forged(&["reconcile", "--run", "bead-rec"]);
    assert_eq!(code, 0, "reconcile: {reconciled}");
    assert!(reconciled["result"]["report"].is_object());
    // A finished run has nothing live: nothing reclaimed, nothing robbed.
    assert_eq!(reconciled["result"]["report"]["reclaimed"], json!([]));
    assert_eq!(reconciled["result"]["report"]["leftRunning"], json!([]));

    // Each sweep derives a fresh key: a second reconcile is not a replay.
    let (code, second) = env.forged(&["reconcile", "--run", "bead-rec"]);
    assert_eq!(code, 0);
    assert_eq!(second["reused"], json!(false));
    assert_ne!(second["operationId"], reconciled["operationId"]);

    let sweep_keys: Vec<Value> = {
        let ledger = env.ledger();
        let keys = ["op:reconcile:bead-rec:-:0", "op:reconcile:bead-rec:-:1"]
            .iter()
            .map(|k| {
                json!(ledger
                    .find_operation("reconcile", k)
                    .expect("probe")
                    .is_some())
            })
            .collect();
        ledger.close().expect("close");
        keys
    };
    assert_eq!(sweep_keys, vec![json!(true), json!(true)]);
}
