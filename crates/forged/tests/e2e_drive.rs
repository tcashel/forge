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
        "run",
        "start",
        "--bead",
        "bead-e2e",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
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
        .filter(|argv| {
            argv.iter().any(|a| a.contains("/pulls")) && argv.contains(&"POST".to_owned())
        })
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
        "bead-e2e/implementation/0",
        "bead-e2e/review-1/0",
        "bead-e2e/review-2/0",
        "bead-e2e/remediation/0",
        "bead-e2e/review-1/1",
        "bead-e2e/review-2/1",
    ] {
        assert!(
            plog.iter().any(|l| l.starts_with(packet)),
            "{packet} must have run: {plog:?}"
        );
        assert_no_overlap(&plog, packet);
    }

    // The two identity layers stayed apart: every attempt's claimant is the
    // PACKET-scoped session identity, so the two Review legs — which share
    // the run's one bd lease — are told apart by their claimants and each
    // resolves to its own packet directory. A run-scoped claimant here would
    // make liveness and kill aggregate across the legs.
    {
        let ledger = env.ledger();
        let mut seen = 0;
        for attempt_id in 1..=16i64 {
            let Ok(attempt) = ledger.get_attempt(attempt_id) else {
                continue;
            };
            seen += 1;
            // Seam contract 5, `<provider>:<session-or-host>:<pid>`, with
            // real values: the packet's own provider, the PACKET as the
            // session ref, and the driver process's pid.
            let (provider, rest) = attempt
                .claimant
                .split_once(':')
                .expect("claimant has a provider segment");
            let (packet, pid) = rest.rsplit_once(':').expect("claimant has a pid segment");
            assert!(
                ["claude", "codex"].contains(&provider),
                "attempt {attempt_id} names its real provider: {}",
                attempt.claimant
            );
            assert_eq!(
                packet, attempt.packet_id,
                "attempt {attempt_id} must claim under its packet-scoped session identity"
            );
            assert!(
                pid.parse::<u32>().is_ok_and(|p| p > 0),
                "attempt {attempt_id} carries a real driver pid: {}",
                attempt.claimant
            );
        }
        assert!(seen >= 6, "every packet's attempt was inspected: {seen}");
        ledger.close().expect("close");
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
        report["result"]["totals"]["inputTokens"]
            .as_u64()
            .unwrap_or(0)
            > 0,
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
    for kind in [
        "proto.gate",
        "proto.pr",
        "attempt.state",
        "proto.operation.request",
    ] {
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
    let (code, shown) = env.forged(&["packet", "show", "--packet", "bead-e2e/implementation/0"]);
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
    let (_, codex_shown) = env.forged(&["packet", "show", "--packet", "bead-e2e/review-2/0"]);
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
fn profiles_scale_topology_and_an_explicit_roster_revision_switches_provider_family() {
    // Lean proves inexpensive work uses one reviewer and no fix/synthesis.
    let lean = TestEnv::new("forged-profile-lean");
    lean.forged(&["init"]);
    lean.add_uniform_roster("all-claude", "claude", "opus");
    let repo = lean.repos.repo.to_string_lossy().into_owned();
    let spec = lean.spec.to_string_lossy().into_owned();
    let (code, started) = lean.forged(&[
        "run",
        "start",
        "--bead",
        "bead-lean",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
        "--roster",
        "all-claude",
    ]);
    assert_eq!(code, 0, "lean start: {started}");
    let (code, driven) = lean.forged(&["run", "drive", "--run", "bead-lean"]);
    assert_eq!(code, 0, "lean drive: {driven}");
    assert_eq!(
        driven["result"]["terminal"]["done"]["finalVerdict"],
        json!("requestChanges")
    );
    let log = lean.provider_log();
    assert!(log
        .iter()
        .any(|line| line.starts_with("bead-lean/review-1/0")));
    assert!(!log.iter().any(|line| line.contains("/review-2/")));
    assert!(!log.iter().any(|line| line.contains("/remediation/")));
    assert!(!log.iter().any(|line| line.contains("/synthesis/")));
    let ledger = lean.ledger();
    for attempt_id in 1..=8 {
        let Ok(attempt) = ledger.get_attempt(attempt_id) else {
            continue;
        };
        assert!(attempt.claimant.starts_with("claude:"));
    }
    ledger.close().expect("close lean ledger");

    // A run freezes topology, then an explicit revision replaces only its
    // provider roster. The subsequent full run is driven entirely by Codex.
    let switched = TestEnv::new("forged-roster-switch");
    switched.forged(&["init"]);
    switched.add_uniform_roster("all-codex", "codex", "gpt-5.6-sol");
    let repo = switched.repos.repo.to_string_lossy().into_owned();
    let spec = switched.spec.to_string_lossy().into_owned();
    let (code, started) = switched.forged(&[
        "run",
        "start",
        "--bead",
        "bead-switch",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "switch start: {started}");
    let original = started["result"]["roster_sha256"].clone();
    let (code, revised) = switched.forged(&[
        "run",
        "revise-roster",
        "--run",
        "bead-switch",
        "--roster",
        "all-codex",
        "--reason",
        "Anthropic harness unavailable",
    ]);
    assert_eq!(code, 0, "roster revision: {revised}");
    assert_eq!(revised["result"]["revision"], json!(2));
    assert_ne!(revised["result"]["roster_sha256"], original);
    let (code, status) = switched.forged(&["run", "status", "--run", "bead-switch"]);
    assert_eq!(code, 0, "status after revision: {status}");
    assert_eq!(
        status["result"]["run"]["definition"]["activeRosterRef"]["name"],
        json!("all-codex")
    );
    assert_eq!(
        status["result"]["run"]["definition"]["rosterRevision"],
        json!(2)
    );
    let (code, driven) = switched.forged(&["run", "drive", "--run", "bead-switch"]);
    assert_eq!(code, 0, "drive after roster revision: {driven}");
    let ledger = switched.ledger();
    for attempt_id in 1..=32 {
        let Ok(attempt) = ledger.get_attempt(attempt_id) else {
            continue;
        };
        assert!(
            attempt.claimant.starts_with("codex:"),
            "all-codex roster selected for {}: {}",
            attempt.packet_id,
            attempt.claimant
        );
    }
    ledger.close().expect("close ledger");
}

#[test]
fn transport_failure_advances_to_the_next_candidate_and_lands_once() {
    let env = TestEnv::new("forged-roster-fallback");
    env.forged(&["init"]);
    env.add_implementation_fallback_roster("fallback");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-fallback",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
        "--roster",
        "fallback",
    ]);
    assert_eq!(code, 0, "fallback start: {started}");
    // Resolve, open, and execute candidate 1. Advance the durable retry
    // clock in the test database instead of sleeping through the production
    // 30-second backoff; the next projection still reads the real event.
    for _ in 0..3 {
        let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-fallback"]);
        assert_eq!(code, 0, "fallback advance: {advanced}");
    }
    let db = env.anvil.join("state.db");
    let connection = rusqlite::Connection::open(&db).expect("open retry clock");
    let (event_id, payload): (i64, String) = connection
        .query_row(
            "SELECT event_id, payload_json FROM events WHERE run_id = ?1 AND kind = 'proto.retry' ORDER BY event_id DESC LIMIT 1",
            ["bead-fallback"],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("retry event");
    let mut payload: Value = serde_json::from_str(&payload).expect("retry payload");
    payload["retryAfter"] = json!("2000-01-01T00:00:00.000000000Z");
    connection
        .execute(
            "UPDATE events SET payload_json = ?1 WHERE event_id = ?2",
            rusqlite::params![
                serde_json::to_string(&payload).expect("retry json"),
                event_id
            ],
        )
        .expect("advance retry clock");
    drop(connection);

    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-fallback"]);
    assert_eq!(code, 0, "fallback drive: {driven}");

    let ledger = env.ledger();
    let first = ledger.get_attempt(1).expect("first implementation attempt");
    let second = ledger
        .get_attempt(2)
        .expect("fallback implementation attempt");
    assert!(first.claimant.starts_with("uninstalled:"), "{first:?}");
    assert!(second.claimant.starts_with("claude:"), "{second:?}");
    assert_eq!(first.state, forged_ledger::AttemptState::Failed);
    assert_eq!(second.state, forged_ledger::AttemptState::Completed);
    let completed_implementation = [first, second]
        .iter()
        .filter(|attempt| attempt.state == forged_ledger::AttemptState::Completed)
        .count();
    assert_eq!(
        completed_implementation, 1,
        "exactly one implementation landed"
    );
    ledger.close().expect("close ledger");
}

#[test]
fn high_profile_runs_three_reviews_and_a_synthesis_seat() {
    let env = TestEnv::new("forged-profile-high");
    env.forged(&["init"]);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-high",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "high",
    ]);
    assert_eq!(code, 0, "high start: {started}");
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-high"]);
    assert_eq!(code, 0, "high drive: {driven}");
    let log = env.provider_log();
    for seat in ["review-1", "review-2", "review-3", "synthesis"] {
        assert!(
            log.iter()
                .any(|line| line.starts_with(&format!("bead-high/{seat}/0"))),
            "{seat} ran: {log:?}"
        );
    }
}

#[test]
fn gate_failure_and_review_conflict_follow_stored_escalation_edges_once() {
    // Gate failure raises lean to its stored standard edge and survives
    // repeated projection/drive without duplicating the transition.
    let gate = TestEnv::new("forged-escalate-gate");
    gate.forged(&["init"]);
    let config_path = gate.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("gate config"))
            .expect("gate config json");
    config["gate_commands"] = json!(["false"]);
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("gate config json"),
    )
    .expect("write failing gate");
    let repo = gate.repos.repo.to_string_lossy().into_owned();
    let spec = gate.spec.to_string_lossy().into_owned();
    assert_eq!(
        gate.forged(&[
            "run",
            "start",
            "--bead",
            "bead-gate-edge",
            "--repo",
            &repo,
            "--spec",
            &spec,
            "--base-ref",
            "main",
            "--profile",
            "lean",
        ])
        .0,
        0
    );
    assert_eq!(
        gate.forged(&["run", "drive", "--run", "bead-gate-edge"]).0,
        0
    );
    assert_eq!(
        gate.forged(&["run", "drive", "--run", "bead-gate-edge"]).0,
        0
    );
    let (_, events) = gate.forged(&["events", "--run", "bead-gate-edge"]);
    let escalations: Vec<_> = events["result"]["events"]
        .as_array()
        .expect("events")
        .iter()
        .filter(|event| event["kind"] == json!("forged.profile.escalated"))
        .collect();
    assert_eq!(escalations.len(), 1, "one durable gate escalation");
    assert_eq!(escalations[0]["payload"]["from"], json!("lean"));
    assert_eq!(escalations[0]["payload"]["to"], json!("standard"));
    assert_eq!(escalations[0]["payload"]["trigger"], json!("gateFailure"));

    // Conflicting standard reviewers raise to high and materialize only its
    // added review/synthesis seats.
    let conflict = TestEnv::new("forged-escalate-conflict");
    conflict.forged(&["init"]);
    let repo = conflict.repos.repo.to_string_lossy().into_owned();
    let spec = conflict.spec.to_string_lossy().into_owned();
    assert_eq!(
        conflict
            .forged(&[
                "run",
                "start",
                "--bead",
                "bead-conflict-edge",
                "--repo",
                &repo,
                "--spec",
                &spec,
                "--base-ref",
                "main",
            ])
            .0,
        0
    );
    conflict.set_scenario("reviewclaude", "approve", 1);
    assert_eq!(
        conflict
            .forged(&["run", "drive", "--run", "bead-conflict-edge"])
            .0,
        0
    );
    let (_, status) = conflict.forged(&["run", "status", "--run", "bead-conflict-edge"]);
    assert_eq!(
        status["result"]["run"]["execution"]["activeProfileRef"]["name"],
        json!("high")
    );
    assert_eq!(
        status["result"]["run"]["execution"]["profileHistory"]
            .as_array()
            .map(Vec::len),
        Some(2)
    );
    let log = conflict.provider_log();
    assert!(log
        .iter()
        .any(|line| line.starts_with("bead-conflict-edge/review-3/0")));
    assert!(log
        .iter()
        .any(|line| line.starts_with("bead-conflict-edge/synthesis/0")));
}

#[test]
fn run_uses_its_frozen_roster_after_the_authoring_config_changes() {
    let env = TestEnv::new("forged-frozen-roster");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-frozen",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start: {started}");
    assert_eq!(started["result"]["profile_ref"]["name"], json!("standard"));
    assert_eq!(started["result"]["roster_ref"]["name"], json!("default"));
    let original_digest = started["result"]["package_sha256"]
        .as_str()
        .expect("package digest")
        .to_owned();

    // Make the live authoring roster unusable. A projection that consulted
    // config again would fail before the implement packet could run.
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config json");
    config["roster"]["implement"]["provider"] = json!("unavailable-provider");
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("serialize config"),
    )
    .expect("rewrite config");

    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-frozen"]);
    assert_eq!(code, 0, "drive must use the stored roster: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());

    let (code, status) = env.forged(&["run", "status", "--run", "bead-frozen"]);
    assert_eq!(code, 0, "status: {status}");
    assert_eq!(
        status["result"]["run"]["definition"]["packageSha256"],
        json!(original_digest)
    );
    assert_eq!(
        status["result"]["run"]["definition"]["rosterRevision"],
        json!(1)
    );
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
        "run",
        "start",
        "--bead",
        "bead-sem",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    env.set_scenario("implement", "no-block", 1);
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-sem"]);
    assert_eq!(code, 0, "drive after semantic retry: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());

    // The ledger recorded the semantic note verbatim and no proto.retry.
    let (_, events) = env.forged(&["events", "--run", "bead-sem"]);
    let rows = events["result"]["events"]
        .as_array()
        .expect("events")
        .clone();
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
    assert_no_overlap(&plog, "bead-sem/implementation/0");
    let starts = plog
        .iter()
        .filter(|l| l.starts_with("bead-sem/implementation/0") && l.contains(" start "))
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
        "run",
        "start",
        "--bead",
        "bead-tr",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    env.set_scenario("implement", "rate-limit", 1);
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-tr"]);
    assert_eq!(code, 0, "drive after transport retry: {driven}");
    assert!(driven["result"]["terminal"]["done"].is_object());

    let (_, events) = env.forged(&["events", "--run", "bead-tr"]);
    let rows = events["result"]["events"]
        .as_array()
        .expect("events")
        .clone();
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
fn a_provider_that_never_reports_its_pid_is_killed_not_left_unguarded() {
    // No `provider.pid` inside the wait window means no guardian, and a
    // provider with no guardian stops renewing the bd lease while still
    // writing to the worktree — another worker would reclaim its
    // apparently-expired work. The spawn is treated as failed: the session
    // is killed, the packet fails `transport:`, and the transport-retry
    // budget decides what happens next.
    let env = TestEnv::new("forged-e2e-nopid");
    env.forged(&["init"]);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-nopid",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);

    // Occupy the pid path with a DIRECTORY: the spawned shell's
    // `echo $$ > provider.pid` fails, the provider still runs, and the file
    // never appears — deterministically, with no race against the shim.
    let packet_dir = env.packet_dir("bead-nopid", "implementation", 0);
    std::fs::create_dir_all(packet_dir.join("provider.pid")).expect("occupy the pid path");
    // A provider that would otherwise outlive the window, so the kill is
    // observable rather than a no-op on an already-exited shim.
    env.set_scenario("implement", "hang", 1);

    // `run advance` is one iteration each: resolve, open the packet, then
    // execute it. `drive` would sleep out the 30s transport backoff.
    for _ in 0..3 {
        let (code, resp) = env.forged(&["run", "advance", "--run", "bead-nopid"]);
        assert_eq!(code, 0, "run advance: {resp}");
    }

    // The packet failed with the pinned transport note, and the retry was
    // granted rather than the semantic budget consumed.
    let (_, events) = env.forged(&["events", "--run", "bead-nopid"]);
    let rows = events["result"]["events"]
        .as_array()
        .expect("events")
        .clone();
    let notes: Vec<String> = rows
        .iter()
        .filter(|e| e["kind"] == json!("attempt.state") && e["payload"]["new"] == json!("failed"))
        .filter_map(|e| e["payload"]["reason"].as_str().map(str::to_owned))
        .collect();
    assert_eq!(
        notes,
        vec!["transport: provider pid file never appeared".to_owned()],
        "the pinned note: {rows:?}"
    );
    let retry = rows
        .iter()
        .find(|e| e["kind"] == json!("proto.retry"))
        .expect("a transport failure grants a proto.retry");
    assert_eq!(retry["payload"]["transportFailures"], json!(1));

    // The provider itself was stopped: it started, never reached its `end`
    // line, and its pid is verifiably gone.
    let plog = env.provider_log();
    let start = plog
        .iter()
        .find(|l| l.starts_with("bead-nopid/implementation/0") && l.contains(" start "))
        .expect("the provider did start");
    assert!(
        !plog
            .iter()
            .any(|l| l.starts_with("bead-nopid/implementation/0") && l.contains(" end ")),
        "the hung provider was killed, so it never wrote its end line: {plog:?}"
    );
    let pid: i32 = start
        .rsplit(' ')
        .next()
        .and_then(|p| p.parse().ok())
        .expect("the log line ends with the provider pid");
    assert!(
        !support::pid_alive(pid),
        "the unguarded provider {pid} must be dead, not left running"
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
        "run",
        "start",
        "--bead",
        "bead-rec",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
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

    // Every invocation derives a FRESH key: no reconcile is ever a replay of
    // the last one, which is what keeps an interrupted pass from wedging the
    // run (see `core::reconcile_key`).
    let mut ids = vec![reconciled["operationId"].clone()];
    for _ in 0..2 {
        let (code, again) = env.forged(&["reconcile", "--run", "bead-rec"]);
        assert_eq!(code, 0, "reconcile: {again}");
        assert_eq!(again["reused"], json!(false), "never a replay: {again}");
        ids.push(again["operationId"].clone());
    }
    let unique: std::collections::BTreeSet<String> =
        ids.iter().map(std::string::ToString::to_string).collect();
    assert_eq!(unique.len(), ids.len(), "distinct operation ids: {ids:?}");
}
