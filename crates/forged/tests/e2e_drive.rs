//! The hermetic end-to-end slice: `run drive` to `Stop(Done { .. })` with
//! the fake providers serving Implement, both Review legs, and Fix; the gh
//! shim call log shows exactly one draft PR creation and zero merge or
//! ready-for-review calls; the origin repo holds the real commits.

use std::fmt::Write as _;
use std::os::unix::fs::PermissionsExt;
use std::process::Stdio;

mod support;

use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use support::{assert_no_overlap, git, render_cost, require_node, rev_parse, TestEnv};

fn canonical_json_and_sha(value: &Value) -> (String, String) {
    let bytes = forged_types::canonical_json_bytes(value).expect("canonical fixture JSON");
    let mut sha256 = String::with_capacity(64);
    for byte in Sha256::digest(&bytes) {
        write!(&mut sha256, "{byte:02x}").expect("digest formatting");
    }
    (
        String::from_utf8(bytes).expect("canonical JSON is UTF-8"),
        sha256,
    )
}

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

fn stop_run_when_kill_evidence_is_ready(env: &TestEnv, run: &str, reason: &str) -> Value {
    // The provider process can become observable before its start-time
    // fingerprint is durably recorded. `run stop` deliberately refuses to
    // signal in that window, so retry the same SafeRetry operation until the
    // guardian evidence catches up.
    wait_for(
        env,
        &[
            "run",
            "stop",
            "--run",
            run,
            "--outcome",
            "cancelled",
            "--reason",
            reason,
        ],
        |_| true,
    )
}

fn set_admission(env: &TestEnv, policy: Value) {
    let path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&path).expect("read forged test config"))
            .expect("forged test config JSON");
    config["admission"] = policy;
    std::fs::write(
        path,
        serde_json::to_string_pretty(&config).expect("serialize admission config"),
    )
    .expect("write admission config");
}

#[test]
fn push_transport_retries_are_bounded_then_stop_as_input_required() {
    let env = TestEnv::new("forged-push-retry");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-push-retry",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "start: {started}");
    env.authorize_run("bead-push-retry");
    let (code, resolved) = env.forged(&["run", "advance", "--run", "bead-push-retry"]);
    assert_eq!(code, 0, "resolve: {resolved}");
    assert_eq!(resolved["result"]["action"]["runMachine"], json!("resolve"));

    let helper = env.shim_bin.join("git-remote-fail");
    std::fs::write(
        &helper,
        "#!/bin/sh\necho attempt >> \"$FORGED_SHIM_DIR/push-attempts\"\necho 'fatal: Could not resolve host: github.com' >&2\nexit 1\n",
    )
    .expect("write remote helper");
    std::fs::set_permissions(&helper, std::fs::Permissions::from_mode(0o755))
        .expect("chmod remote helper");
    git(
        &env.repos.repo,
        &["remote", "set-url", "origin", "fail::remote"],
    );

    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-push-retry"]);
    assert_ne!(
        code, 0,
        "the missing push is not a completed effect: {driven}"
    );
    let reason = driven["error"]["message"]
        .as_str()
        .expect("input-required error");
    assert!(reason.starts_with("input-required: git push network transport failed"));
    let attempts = std::fs::read_to_string(env.shim_dir.join("push-attempts"))
        .expect("attempt log")
        .lines()
        .count();
    assert_eq!(attempts, 4, "default retry budget is three retries");
    let (_, status) = env.forged(&["run", "status", "--run", "bead-push-retry"]);
    assert_eq!(status["result"]["run"]["state"], json!("stopped"));
    assert_eq!(
        status["result"]["run"]["nextAction"]["stop"]["externallyStopped"]["reason"],
        json!(reason)
    );
    let ledger = env.ledger();
    let push = ledger
        .find_operation("push", "bead-push-retry/push/0")
        .expect("push probe")
        .expect("interrupted push survives");
    assert_eq!(push.state, forged_ledger::OperationState::InProgress);
    ledger.close().expect("close");
}

#[test]
fn epic_drive_runs_ready_children_merges_integration_and_stops_at_one_draft_pr() {
    let env = TestEnv::new("forged-epic-e2e");
    env.enable_dynamic_gh();
    env.seed_epic("epic-one", &[("child-one", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-one",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    assert_eq!(started["result"]["schema"], json!("forged.epic/1"));

    env.set_scenario("implement", "slow", 1);
    let (code, submitted) = env.forged(&["epic", "submit", "--epic", "epic-one"]);
    assert_eq!(code, 0, "epic submit: {submitted}");
    assert_eq!(submitted["result"]["submitted"], json!(true));
    assert_eq!(submitted["result"]["controller"]["host"], json!("process"));
    assert!(submitted["result"]["controller"]["sessionId"].is_string());

    let mut provider_started = false;
    for _ in 0..100 {
        if env
            .provider_log()
            .iter()
            .any(|line| line.starts_with("child-one/implementation/0") && line.contains(" start "))
        {
            provider_started = true;
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(50));
    }
    assert!(provider_started, "detached epic reached a live provider");
    let (code, paused) = env.forged(&[
        "epic",
        "pause",
        "--epic",
        "epic-one",
        "--reason",
        "operator checkpoint",
    ]);
    assert_eq!(
        code, 0,
        "out-of-band pause while controller owns slot: {paused}"
    );
    let held = wait_for(&env, &["epic", "status", "--epic", "epic-one"], |value| {
        value["result"]["paused"].is_object()
            && value["result"]["controller"]["state"] == json!("exited")
    });
    assert!(
        held["result"]["finalPr"].is_null(),
        "pause precedes merge: {held}"
    );
    let (code, resumed) = env.forged(&[
        "epic",
        "resume",
        "--epic",
        "epic-one",
        "--reason",
        "operator approved continuation",
    ]);
    assert_eq!(code, 0, "resume: {resumed}");
    let (code, resubmitted) = env.forged(&["epic", "submit", "--epic", "epic-one"]);
    assert_eq!(code, 0, "epic resubmit: {resubmitted}");
    assert_eq!(resubmitted["result"]["controller"]["generation"], json!(2));

    let driven = wait_for(&env, &["epic", "status", "--epic", "epic-one"], |value| {
        value["result"]["finalPr"]["number"] == json!(8)
    });
    assert_eq!(
        driven["result"]["finalPr"]["number"],
        json!(8),
        "child PR #7 is merged and one epic PR #8 remains: {driven}"
    );
    assert_eq!(driven["result"]["finalPr"]["isDraft"], json!(true));

    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-one"]);
    assert_eq!(code, 0, "epic status: {status}");
    assert_eq!(status["result"]["finalPr"]["number"], json!(8));
    assert_eq!(status["result"]["waves"].as_array().map(Vec::len), Some(1));
    assert_eq!(
        status["result"]["children"][0]["beadsStatus"],
        json!("closed")
    );
    assert!(status["result"]["children"][0]["merged"].is_object());
    assert!(status["result"]["inputRequired"].is_null());

    let (code, overview) = env.forged(&["overview", "--epic", "epic-one"]);
    assert_eq!(code, 0, "epic overview: {overview}");
    assert_eq!(overview["result"]["schema"], json!("forged.overview/1"));
    assert_eq!(overview["result"]["kind"], json!("epic"));
    assert_eq!(
        overview["result"]["childRuns"].as_array().map(Vec::len),
        Some(1)
    );
    assert!(!overview["result"]["gates"].as_array().unwrap().is_empty());
    assert!(overview["result"]["cursor"].as_i64().is_some());

    // packetHistory carries what every settled attempt landed — the only
    // place a seat's own verdict or failure note is readable without
    // re-reading the ledger.
    let history = overview["result"]["childRuns"][0]["packetHistory"]
        .as_object()
        .expect("child run packet history");
    assert!(!history.is_empty(), "settled packets: {overview}");
    let implement = history
        .iter()
        .find(|(packet_id, _)| packet_id.contains("implement"))
        .map(|(_, attempts)| attempts)
        .expect("an implement packet settled");
    assert_eq!(implement[0]["state"], json!("completed"));
    assert!(
        implement[0]["outcome"]["implement"]["implemented"].is_boolean(),
        "the landed outcome is projected verbatim: {implement}"
    );

    // Usage is recorded by the attempt that spent it, with no operator
    // step in between. Nothing in this test runs `usage ingest`.
    let usage = &overview["result"]["childRuns"][0]["usage"];
    let totals = &usage["totals"];
    assert!(
        totals["outputTokens"].as_u64().unwrap_or(0) > 0,
        "capture recorded tokens without an ingest pass: {usage}"
    );
    let rows = usage["rows"].as_array().expect("usage rows");
    assert!(!rows.is_empty(), "the report carries its rows: {usage}");
    assert!(
        rows.iter()
            .all(|row| row["attemptId"].is_i64() && row["packetId"].is_string()),
        "every row names the attempt that spent it: {rows:?}"
    );

    // The epic carries the same usage shape a slice does: per-seat rows,
    // stamped with the child that spent them, and the rate card behind
    // them. Its totals stay the sum across children.
    let epic_usage = &overview["result"]["usage"];
    let epic_rows = epic_usage["rows"].as_array().expect("epic usage rows");
    assert_eq!(
        epic_rows.len(),
        rows.len(),
        "the epic hoists its children's rows: {epic_usage}"
    );
    assert!(
        epic_rows
            .iter()
            .all(|row| row["runId"] == json!("child-one")),
        "every hoisted row names the child run it came from: {epic_rows:?}"
    );
    assert!(
        epic_usage["pricing"]["ratesAsOf"].is_string(),
        "the epic reports the rate card its children read: {epic_usage}"
    );
    // Totals are the sum across children and this epic has exactly one, so
    // every field must survive hoisting identically — not just the one a spot
    // check would notice. Comparing the key SET as well as each value is what
    // catches a field silently dropped from the sum: an assertion naming only
    // `outputTokens` passes while the other five are mangled.
    let epic_totals = epic_usage["totals"]
        .as_object()
        .expect("the epic reports totals");
    let child_totals = totals.as_object().expect("the child reports totals");
    let mut epic_keys: Vec<&String> = epic_totals.keys().collect();
    let mut child_keys: Vec<&String> = child_totals.keys().collect();
    epic_keys.sort();
    child_keys.sort();
    assert_eq!(
        epic_keys, child_keys,
        "the epic reports the same totals shape a slice does: {epic_usage}"
    );
    for (key, child_value) in child_totals {
        let epic_value = epic_totals.get(key).and_then(Value::as_f64);
        assert!(
            epic_value.is_some(),
            "the epic total {key} is numeric: {epic_usage}"
        );
        assert_eq!(
            epic_value,
            child_value.as_f64(),
            "hoisting rows left {key} alone: {epic_usage}"
        );
    }

    // The normal one-reviewer profile stays on its primary provider. The
    // hoisted child rows therefore remain provider-billed end to end.
    assert!(
        epic_rows
            .iter()
            .all(|row| row["pricingBasis"] == json!("billed")),
        "standard child rows remain billed: {epic_rows:?}"
    );
    if let Some(node) = require_node() {
        let rendered = render_cost(&node, &overview["result"]);
        assert!(
            rendered.text.contains("provider-billed"),
            "a fully billed standard run says so: {}",
            rendered.text
        );
        assert_eq!(rendered.spend_subtitle(), "provider-billed");
        assert_eq!(
            rendered.stat("priced attempts"),
            epic_rows.len().to_string(),
            "the priced-attempt count is the hoisted row count: {}",
            rendered.text
        );
    }

    let gh = env.gh_calls();
    assert!(gh.iter().any(|args| args.starts_with(&[
        "pr".to_owned(),
        "ready".to_owned(),
        "7".to_owned()
    ])));
    assert!(gh.iter().any(|args| args.starts_with(&[
        "pr".to_owned(),
        "merge".to_owned(),
        "7".to_owned()
    ])));
    assert!(!gh
        .iter()
        .any(|args| { args.starts_with(&["pr".to_owned(), "merge".to_owned(), "8".to_owned(),]) }));
    let creates = gh
        .iter()
        .filter(|args| args.iter().any(|arg| arg.contains("/pulls")))
        .count();
    assert_eq!(creates, 2, "one child PR plus one epic PR: {gh:?}");
}

#[test]
fn epic_fanout_freezes_two_slots_and_a_failed_child_does_not_block_its_sibling() {
    let env = TestEnv::new("forged-epic-fanout");
    set_admission(
        &env,
        json!({
            "totalActive": 8,
            "providerActive": 4,
            "repositoryWriteActive": 2,
            "epicFanout": 2,
            "deferSeconds": 60,
            // No rate-limit observation exists in this hermetic fixture, so
            // run submit durably queues every child without spawning a real
            // detached process. That makes the fan-out window deterministic.
            "rateLimitCeilingMillipercent": 90_000,
            "rateLimitFreshSeconds": 60,
        }),
    );
    env.seed_epic(
        "epic-fanout",
        &[
            ("child-a", &env.spec, true),
            ("child-b", &env.spec, true),
            ("child-c", &env.spec, true),
        ],
    );
    env.set_bead_field("child-a", "priority", "0");
    env.set_bead_field("child-b", "priority", "1");
    env.set_bead_field("child-c", "priority", "9");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-fanout",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    assert_eq!(started["result"]["maxActiveChildren"], json!(2));
    env.authorize_epic("epic-fanout");

    let (code, integration) = env.forged(&["epic", "advance", "--epic", "epic-fanout"]);
    assert_eq!(code, 0, "integration tick: {integration}");
    let (code, wave) = env.forged(&["epic", "advance", "--epic", "epic-fanout"]);
    assert_eq!(code, 0, "wave tick: {wave}");
    assert_eq!(
        wave["result"]["progress"]["children"],
        json!(["child-a", "child-b", "child-c"])
    );
    // The whole launch order is part of the frozen wave. A later Beads edit
    // can affect a future frontier, but cannot reshuffle already-recorded
    // membership around a crash/restart boundary.
    env.set_bead_field("child-c", "priority", "-1");
    let (code, launched) = env.forged(&["epic", "advance", "--epic", "epic-fanout"]);
    assert_eq!(code, 0, "launch tick: {launched}");
    assert_eq!(
        launched["result"]["progress"]["launched"]
            .as_array()
            .map(Vec::len),
        Some(2)
    );

    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-fanout"]);
    assert_eq!(code, 0, "fan-out status: {status}");
    assert_eq!(status["result"]["maxActiveChildren"], json!(2));
    assert_eq!(status["result"]["counts"]["queuedDeferred"], json!(2));
    assert_eq!(status["result"]["counts"]["active"], json!(0));
    let children = status["result"]["children"].as_array().expect("children");
    let run_id = |id: &str| {
        children
            .iter()
            .find(|child| child["id"] == json!(id))
            .map(|child| child["runId"].clone())
            .expect("frozen child")
    };
    assert_eq!(run_id("child-a"), json!("child-a"));
    assert_eq!(run_id("child-b"), json!("child-b"));
    assert!(run_id("child-c").is_null());

    let events = env
        .ledger()
        .list_events(Some("epic-fanout"), 0, 65_536)
        .expect("epic events");
    let wave_position = events
        .iter()
        .position(|event| event.kind == "forged.epic.wave.started")
        .expect("wave event");
    let first_child_position = events
        .iter()
        .position(|event| event.kind == "forged.epic.child.started")
        .expect("child event");
    assert!(wave_position < first_child_position, "wave commits first");

    let ledger = env.ledger();
    ledger
        .settle_run(
            "child-a",
            forged_ledger::RunOutcome::Blocked,
            "fixture child failed independently".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle failed child");
    ledger.close().expect("close ledger");

    let (code, replacement) = env.forged(&["epic", "advance", "--epic", "epic-fanout"]);
    assert_eq!(code, 0, "slot-opening tick: {replacement}");
    assert_eq!(
        replacement["result"]["progress"]["launched"]
            .as_array()
            .map(Vec::len),
        Some(1),
        "the independent third child fills the released slot: {replacement}"
    );
    let (_, status) = env.forged(&["epic", "status", "--epic", "epic-fanout"]);
    assert_eq!(status["result"]["counts"]["queuedDeferred"], json!(2));
    assert_eq!(status["result"]["counts"]["terminal"], json!(1));
    assert_eq!(status["result"]["counts"]["held"], json!(1));
    assert!(status["result"]["inputRequired"].is_null());
    assert_eq!(
        status["result"]["children"]
            .as_array()
            .and_then(|children| children.iter().find(|child| child["id"] == "child-c"))
            .map(|child| child["runId"].clone()),
        Some(json!("child-c"))
    );

    let ledger = env.ledger();
    for child in ["child-b", "child-c"] {
        ledger
            .settle_run(
                child,
                forged_ledger::RunOutcome::Blocked,
                "fixture child failed independently".to_owned(),
                None,
                None,
                None,
            )
            .expect("settle remaining failed child");
    }
    ledger.close().expect("close ledger");
    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-fanout"]);
    assert_eq!(code, 0, "held-wave tick: {held}");
    assert_eq!(
        held["result"]["stopped"]["childId"],
        json!("child-a"),
        "failed children enter the resolution rail one-at-a-time by child id: {held}"
    );
}

#[test]
fn epic_fanout_obeys_repository_write_capacity_for_detached_child_attempts() {
    for repository_limit in [1, 2] {
        let env = TestEnv::new(&format!("forged-epic-write-limit-{repository_limit}"));
        set_admission(
            &env,
            json!({
                "totalActive": 8,
                "providerActive": 4,
                "repositoryWriteActive": repository_limit,
                "epicFanout": 2,
                "deferSeconds": 1,
            }),
        );
        env.seed_epic(
            "epic-write-limit",
            &[
                ("write-child-a", &env.spec, true),
                ("write-child-b", &env.spec, true),
            ],
        );
        assert_eq!(env.forged(&["init"]).0, 0);
        let repo = env.repos.repo.to_string_lossy().into_owned();
        let spec = env.spec.to_string_lossy().into_owned();
        let (code, started) = env.forged(&[
            "epic",
            "start",
            "--epic",
            "epic-write-limit",
            "--repo",
            &repo,
            "--spec",
            &spec,
            "--base-ref",
            "main",
        ]);
        assert_eq!(code, 0, "epic start: {started}");
        env.authorize_epic("epic-write-limit");
        let ledger = env.ledger();
        ledger
            .record_desired_outcome(
                forged_ledger::DesiredSubjectKind::Epic,
                "epic-write-limit",
                forged_ledger::DesiredState::Running,
                forged_ledger::DesiredReconcileOutcome::Adopted,
                None,
                None,
            )
            .expect("park the directly-driven epic outside supervisor scope");
        ledger.close().expect("close ledger");
        // The two implementations are a barrier: neither exits until the
        // test settles its run, so overlap (or its absence) is unambiguous.
        env.set_scenario("implement", "hang", 2);
        let driver = env
            .forged_cmd(&["epic", "drive", "--epic", "epic-write-limit"])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("epic driver starts");

        let implementation_starts = || {
            env.provider_log()
                .into_iter()
                .filter(|line| line.contains("/implementation/0 start "))
                .collect::<Vec<_>>()
        };
        let mut starts = Vec::new();
        for _ in 0..200 {
            starts = implementation_starts();
            let expected = if repository_limit == 2 { 2 } else { 1 };
            if starts.len() >= expected {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(50));
        }
        assert_eq!(
            starts.len(),
            if repository_limit == 2 { 2 } else { 1 },
            "initial workspace-write overlap at limit {repository_limit}: {starts:?}"
        );

        if repository_limit == 1 {
            std::thread::sleep(std::time::Duration::from_millis(500));
            assert_eq!(
                implementation_starts().len(),
                1,
                "the default repository slot serializes child attempts"
            );
            let first = if starts[0].starts_with("write-child-a/") {
                "write-child-a"
            } else {
                "write-child-b"
            };
            let second = if first == "write-child-a" {
                "write-child-b"
            } else {
                "write-child-a"
            };
            let _stopped =
                stop_run_when_kill_evidence_is_ready(&env, first, "release barrier fixture");
            std::thread::sleep(std::time::Duration::from_millis(1_100));
            for _ in 0..100 {
                let _ = env.forged(&["supervise", "--once"]);
                starts = implementation_starts();
                if starts.len() == 2 {
                    break;
                }
                std::thread::sleep(std::time::Duration::from_millis(100));
            }
            assert_eq!(
                starts.len(),
                2,
                "the queued sibling starts only after the first slot is released: {starts:?}"
            );
            let _stopped =
                stop_run_when_kill_evidence_is_ready(&env, second, "release barrier fixture");
        } else {
            for child in ["write-child-a", "write-child-b"] {
                let _stopped =
                    stop_run_when_kill_evidence_is_ready(&env, child, "release barrier fixture");
            }
        }

        let output = driver.wait_with_output().expect("epic driver exits");
        assert!(
            output.status.success(),
            "epic driver failed: stdout={} stderr={}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
    }
}

#[test]
fn interventions_cross_a_durable_boundary_and_sessions_stay_observable() {
    let env = TestEnv::new("forged-session-boundary");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-session",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "start: {started}");
    env.authorize_run("bead-session");

    let (code, queued) = env.forged(&[
        "session",
        "message",
        "--run",
        "bead-session",
        "--message",
        "Keep the public API source compatible.",
        "--requested-by",
        "lead-agent",
    ]);
    assert_eq!(code, 0, "queue: {queued}");
    assert_eq!(queued["result"]["delivery"], json!("queued"));

    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-session"]);
    assert_eq!(code, 0, "drive: {driven}");
    let prompt = std::fs::read_to_string(
        env.latest_attempt_dir("bead-session", "implementation", 0)
            .expect("implementation attempt directory")
            .join("prompt.md"),
    )
    .expect("implementation prompt");
    assert!(
        prompt.contains("lead-agent"),
        "intervention identity: {prompt}"
    );
    assert!(
        prompt.contains("Keep the public API source compatible."),
        "intervention text: {prompt}"
    );

    let (code, listed) = env.forged(&["session", "list", "--run", "bead-session"]);
    assert_eq!(code, 0, "session list: {listed}");
    assert_eq!(listed["result"]["pendingInterventions"], json!(0));
    let sessions = listed["result"]["sessions"]
        .as_array()
        .expect("sessions array");
    assert!(!sessions.is_empty(), "durable session rows: {listed}");
    assert!(sessions.iter().all(|session| session["host"] == "process"));
    assert!(sessions
        .iter()
        .all(|session| session["attachHint"].is_null()));

    let (_, events) = env.forged(&["events", "--run", "bead-session", "--limit", "1000"]);
    let kinds: Vec<&str> = events["result"]["events"]
        .as_array()
        .expect("events")
        .iter()
        .filter_map(|event| event["kind"].as_str())
        .collect();
    for kind in [
        "forged.intervention.queued",
        "forged.intervention.delivered",
        "forged.host.fallback",
        "forged.session.started",
    ] {
        assert!(kinds.contains(&kind), "{kind} is durable: {kinds:?}");
    }
}

#[test]
fn a_rejected_cross_run_intervention_never_enters_the_target_queue() {
    let env = TestEnv::new("forged-session-ownership");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    for bead in ["bead-message-target", "bead-message-owner"] {
        let (code, started) = env.forged(&[
            "run",
            "start",
            "--bead",
            bead,
            "--repo",
            &repo,
            "--spec",
            &spec,
            "--base-ref",
            "main",
            "--profile",
            "lean",
        ]);
        assert_eq!(code, 0, "start {bead}: {started}");
        env.authorize_run(bead);
    }
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-message-owner"]);
    assert_eq!(code, 0, "owner drive: {driven}");
    let owner_attempt = env
        .ledger()
        .get_attempt(1)
        .expect("owner implementation attempt");
    assert!(
        owner_attempt.packet_id.starts_with("bead-message-owner/"),
        "attempt fixture belongs to the owner run"
    );

    let (code, refused) = env.forged(&[
        "session",
        "message",
        "--run",
        "bead-message-target",
        "--attempt",
        &owner_attempt.attempt_id.to_string(),
        "--message",
        "must not cross the run boundary",
    ]);
    assert_ne!(code, 0, "cross-run target must be refused: {refused}");
    assert!(refused["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("does not belong")));
    let (_, events) = env.forged(&["events", "--run", "bead-message-target", "--limit", "1000"]);
    assert!(events["result"]["events"]
        .as_array()
        .expect("events")
        .iter()
        .all(|event| event["kind"] != json!("forged.intervention.queued")));
}

#[test]
fn concurrent_submit_keys_share_one_controller_generation() {
    let env = TestEnv::new("forged-submit-singleton");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-submit-singleton",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "start: {started}");
    env.set_scenario("implement", "slow", 1);

    let spawn = |key: &str| {
        env.forged_cmd(&[
            "run",
            "submit",
            "--run",
            "bead-submit-singleton",
            "--idempotency-key",
            key,
        ])
        .stdout(Stdio::piped())
        .spawn()
        .expect("submitter spawns")
    };
    let first = spawn("submit-race-a");
    let second = spawn("submit-race-b");
    let outputs = [
        first.wait_with_output().expect("first submit exits"),
        second.wait_with_output().expect("second submit exits"),
    ];
    let responses = outputs
        .iter()
        .map(|output| {
            assert!(output.status.success(), "submit output: {output:?}");
            serde_json::from_slice::<Value>(&output.stdout).expect("submit response")
        })
        .collect::<Vec<_>>();
    assert_eq!(
        responses
            .iter()
            .filter(|response| response["result"]["submitted"] == json!(true))
            .count(),
        1,
        "one request spawns: {responses:?}"
    );
    assert_eq!(
        responses
            .iter()
            .filter(|response| response["result"]["alreadyRunning"] == json!(true))
            .count(),
        1,
        "the other request adopts: {responses:?}"
    );

    let status = wait_for(
        &env,
        &["run", "status", "--run", "bead-submit-singleton"],
        |value| value["result"]["run"]["nextAction"]["stop"].is_object(),
    );
    assert_eq!(
        status["result"]["run"]["controller"]["generation"],
        json!(1)
    );
    let (_, events) = env.forged(&[
        "events",
        "--run",
        "bead-submit-singleton",
        "--limit",
        "1000",
    ]);
    let controller_starts = events["result"]["events"]
        .as_array()
        .expect("events")
        .iter()
        .filter(|event| event["kind"] == json!("forged.controller.started"))
        .count();
    assert_eq!(controller_starts, 1, "one durable controller identity");
}

#[test]
fn resolving_an_unclean_child_starts_a_fresh_generation() {
    let env = TestEnv::new("forged-epic-child-retry");
    env.enable_dynamic_gh();
    env.seed_epic("epic-retry", &[("child-retry", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-retry",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    env.authorize_epic("epic-retry");
    env.set_scenario("implement", "no-block", 1);
    let (code, stopped) = env.forged(&["epic", "drive", "--epic", "epic-retry"]);
    assert_eq!(code, 0, "first drive reaches input: {stopped}");
    assert_eq!(
        stopped["result"]["stopped"]["code"],
        json!("child-not-clean"),
        "unexpected first-generation stop: {stopped}"
    );

    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-retry",
        "--child",
        "child-retry",
        "--note",
        "spec corrected; execute a fresh slice",
    ]);
    assert_eq!(code, 0, "resolve: {resolved}");
    env.set_scenario("reviewclaude", "approve", 1);
    let (code, driven) = env.forged(&["epic", "drive", "--epic", "epic-retry"]);
    assert_eq!(code, 0, "second generation drive: {driven}");
    assert!(
        driven["result"]["stopped"]["finalPr"].is_object(),
        "second generation reaches the epic PR: {driven}"
    );
    let (_, status) = env.forged(&["epic", "status", "--epic", "epic-retry"]);
    assert_eq!(
        status["result"]["children"][0]["runId"],
        json!("child-retry-g2")
    );
    assert_eq!(status["result"]["children"][0]["generation"], json!(2));
    assert!(status["result"]["children"][0]["merged"].is_object());
    assert!(status["result"]["inputRequired"].is_null());
}

#[test]
fn repeated_epic_pause_resume_cycles_get_distinct_transition_keys() {
    let env = TestEnv::new("forged-epic-control-cycles");
    env.seed_epic("epic-controls", &[("child-controls", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-controls",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start: {started}");

    let mut ids = Vec::new();
    for (command, reason) in [
        ("pause", "same checkpoint"),
        ("resume", "same continuation"),
        ("pause", "same checkpoint"),
        ("resume", "same continuation"),
    ] {
        let (code, response) = env.forged(&[
            "epic",
            command,
            "--epic",
            "epic-controls",
            "--reason",
            reason,
        ]);
        assert_eq!(code, 0, "{command}: {response}");
        ids.push(response["operationId"].as_str().unwrap().to_owned());
        if ids.len() == 3 {
            let (code, status) = env.forged(&["epic", "status", "--epic", "epic-controls"]);
            assert_eq!(code, 0, "status after repeated-reason pause: {status}");
            assert!(
                status["result"]["paused"].is_object(),
                "the second same-reason pause must remain in event projection: {status}"
            );
        }
    }
    assert_ne!(ids[0], ids[2], "pause epochs differ");
    assert_ne!(ids[1], ids[3], "resume epochs differ");
    let (_, events) = env.forged(&["events", "--run", "epic-controls", "--limit", "1000"]);
    let kinds = events["result"]["events"]
        .as_array()
        .expect("events")
        .iter()
        .filter_map(|event| event["kind"].as_str())
        .collect::<Vec<_>>();
    assert_eq!(
        kinds
            .iter()
            .filter(|kind| **kind == "forged.epic.paused")
            .count(),
        2
    );
    assert_eq!(
        kinds
            .iter()
            .filter(|kind| **kind == "forged.epic.resumed")
            .count(),
        2
    );
}

#[test]
fn roster_failover_cycles_get_distinct_revision_keys() {
    let env = TestEnv::new("forged-roster-cycles");
    env.forged(&["init"]);
    env.add_uniform_roster("outage", "codex", "gpt-5.6-sol");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-roster-cycles",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start: {started}");

    for (expected, roster, reason) in [
        (2, "outage", "anthropic unavailable"),
        (3, "default", "anthropic restored"),
        (4, "outage", "second anthropic outage"),
    ] {
        let (code, revised) = env.forged(&[
            "run",
            "revise-roster",
            "--run",
            "bead-roster-cycles",
            "--roster",
            roster,
            "--reason",
            reason,
        ]);
        assert_eq!(code, 0, "revise to {roster}: {revised}");
        assert_eq!(revised["result"]["revision"], json!(expected));
    }
}

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

    env.set_scenario("implement", "slow", 1);
    let (code, submitted) = env.forged(&["run", "submit", "--run", "bead-e2e"]);
    assert_eq!(code, 0, "run submit: {submitted}");
    assert_eq!(submitted["result"]["submitted"], json!(true));
    assert_eq!(submitted["result"]["controller"]["host"], json!("process"));
    let (code, duplicate) = env.forged(&["run", "submit", "--run", "bead-e2e"]);
    assert_eq!(code, 0, "duplicate submit: {duplicate}");
    assert_eq!(duplicate["reused"], json!(true));
    assert_eq!(duplicate["result"]["submitted"], json!(true));
    assert_eq!(duplicate["result"]["alreadyRunning"], json!(false));
    assert_eq!(
        duplicate["result"]["controller"]["sessionId"],
        submitted["result"]["controller"]["sessionId"]
    );

    let driven = wait_for(&env, &["run", "status", "--run", "bead-e2e"], |value| {
        value["result"]["run"]["nextAction"]["stop"]["done"]["finalVerdict"] == json!("approve")
    });
    assert_eq!(
        driven["result"]["run"]["nextAction"]["stop"]["done"]["finalVerdict"],
        json!("approve"),
        "drive must stop Done(approve): {driven}"
    );
    let stopped = wait_for(&env, &["run", "status", "--run", "bead-e2e"], |value| {
        value["result"]["run"]["controller"]["state"] == json!("exited")
    });
    assert_eq!(stopped["result"]["run"]["controller"]["exitCode"], json!(0));
    let (code, terminal_submit) = env.forged(&["run", "submit", "--run", "bead-e2e"]);
    assert_eq!(code, 0, "terminal submit is a no-op: {terminal_submit}");
    assert_eq!(terminal_submit["result"]["submitted"], json!(false));
    assert!(terminal_submit["result"]["stopped"]["terminal"].is_object());
    assert_eq!(
        terminal_submit["result"]["controller"]["generation"],
        json!(1),
        "a completed run never starts a second controller"
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

    // Provider selection routed the normal profile's implementation,
    // repo-aware review, and remediation through their declared seats.
    let plog = env.provider_log();
    for packet in [
        "bead-e2e/implementation/0",
        "bead-e2e/review-1/0",
        "bead-e2e/remediation/0",
        "bead-e2e/review-1/1",
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
        assert!(seen >= 4, "every packet's attempt was inspected: {seen}");
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
        "forged.review.seat.settled",
    ] {
        assert!(kinds.contains(&kind), "{kind} in stream: {kinds:?}");
    }
    let review_events = events["result"]["events"]
        .as_array()
        .expect("events")
        .iter()
        .filter(|event| event["kind"] == json!("forged.review.seat.settled"))
        .collect::<Vec<_>>();
    assert!(
        !review_events.is_empty()
            && review_events
                .iter()
                .all(|event| event["payload"]["seatId"].is_string()),
        "each review verdict is visible as its seat settles: {review_events:?}"
    );

    let (code, summaries) = env.forged(&[
        "events",
        "--run",
        "bead-e2e",
        "--summary",
        "--limit",
        "1000",
    ]);
    assert_eq!(code, 0, "summary events: {summaries}");
    assert_eq!(summaries["result"]["summary"], json!(true));
    let gate = summaries["result"]["events"]
        .as_array()
        .expect("events")
        .iter()
        .find(|event| event["kind"] == json!("proto.gate"))
        .expect("gate summary");
    assert!(
        gate["payload"]["rows"].is_null(),
        "gate logs are omitted: {gate}"
    );
    assert!(
        gate["payload"]["artifactPaths"].is_array(),
        "gate artifacts remain drill-down pointers: {gate}"
    );

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
    lean.authorize_run("bead-lean");
    let (code, driven) = lean.forged(&["run", "drive", "--run", "bead-lean"]);
    assert_eq!(code, 0, "lean drive: {driven}");
    assert_eq!(
        driven["result"]["terminal"]["reviewBudgetExhausted"],
        json!({"reviewRounds": 1, "finalVerdict": "requestChanges"})
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
    switched.authorize_run("bead-switch");
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
    let (code, overview) = switched.forged(&["overview", "--run", "bead-switch"]);
    assert_eq!(code, 0, "overview after revision: {overview}");
    let revisions = overview["result"]["rosterRevisions"]
        .as_array()
        .expect("roster revision history");
    assert_eq!(revisions.len(), 2, "initial plus explicit revision");
    assert_eq!(revisions[1]["revision"], json!(2));
    assert_eq!(revisions[1]["rosterRef"]["name"], json!("all-codex"));
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
    env.authorize_run("bead-fallback");
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
fn roster_revision_resets_transport_fallback_to_its_first_candidate() {
    let env = TestEnv::new("forged-roster-revision-fallback");
    env.forged(&["init"]);
    env.add_uniform_roster("revised-order", "claude", "opus");
    env.append_implementation_candidate("revised-order", "codex", "gpt-5.6-sol");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "bead-revision-fallback",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "start: {started}");
    env.authorize_run("bead-revision-fallback");
    env.set_scenario("implement", "rate-limit", 1);
    for _ in 0..3 {
        let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-revision-fallback"]);
        assert_eq!(code, 0, "advance to retry boundary: {advanced}");
    }
    let first = env.ledger().get_attempt(1).expect("old roster attempt");
    assert_eq!(first.state, forged_ledger::AttemptState::Failed);
    assert!(first.claimant.starts_with("claude:"), "{first:?}");

    let (code, revised) = env.forged(&[
        "run",
        "revise-roster",
        "--run",
        "bead-revision-fallback",
        "--roster",
        "revised-order",
        "--reason",
        "switch after transport failure",
    ]);
    assert_eq!(code, 0, "revise: {revised}");
    assert_eq!(revised["result"]["revision"], json!(2));

    let db = env.anvil.join("state.db");
    let connection = rusqlite::Connection::open(&db).expect("open retry clock");
    let (event_id, payload): (i64, String) = connection
        .query_row(
            "SELECT event_id, payload_json FROM events WHERE run_id = ?1 AND kind = 'proto.retry' ORDER BY event_id DESC LIMIT 1",
            ["bead-revision-fallback"],
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

    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-revision-fallback"]);
    assert_eq!(code, 0, "drive revised roster: {driven}");
    let ledger = env.ledger();
    let first_revised = ledger.get_attempt(2).expect("first revised attempt");
    assert!(
        first_revised.claimant.starts_with("claude:"),
        "the revised roster starts at candidate zero: {first_revised:?}"
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
    env.authorize_run("bead-high");
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
fn review_budget_above_one_exhausts_exactly_and_accept_risk_is_durable() {
    let env = TestEnv::new("forged-review-budget");
    env.forged(&["init"]);
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("config"))
            .expect("config json");
    config["profiles"] = json!({
        "standard": {
            "schema": "forged.profile/1",
            "name": "standard",
            "protocol": {"name": "slice", "version": 1},
            "seats": [
                {"id": "implementation", "role": "implementation", "purpose": "implement"},
                {"id": "review-1", "role": "review.primary", "purpose": "review"},
                {"id": "remediation", "role": "remediation", "purpose": "fix"}
            ],
            "riskContext": "Routine reversible test change.",
            "fixRoundBudget": 2,
            "escalateOn": []
        }
    });
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("config json"),
    )
    .expect("write config");
    env.set_scenario("reviewclaude", "request-changes", 3);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    assert_eq!(
        env.forged(&[
            "run",
            "start",
            "--bead",
            "bead-round-budget",
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
    env.authorize_run("bead-round-budget");
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-round-budget"]);
    assert_eq!(code, 0, "drive: {driven}");
    assert_eq!(
        driven["result"]["terminal"]["reviewBudgetExhausted"],
        json!({"reviewRounds": 3, "finalVerdict": "requestChanges"})
    );
    let starts: Vec<_> = env
        .provider_log()
        .into_iter()
        .filter(|line| line.contains(" start "))
        .collect();
    assert_eq!(
        starts
            .iter()
            .filter(|line| line.contains("/review-1/"))
            .count(),
        3
    );
    assert_eq!(
        starts
            .iter()
            .filter(|line| line.contains("/remediation/"))
            .count(),
        2
    );

    let (code, accepted) = env.forged(&[
        "run",
        "accept-risk",
        "--run",
        "bead-round-budget",
        "--accepted-by",
        "lead-agent",
        "--rationale",
        "the affected path is disabled in this deployment",
    ]);
    assert_eq!(code, 0, "accept risk: {accepted}");
    assert_eq!(
        accepted["result"]["acceptance"]["acceptedBy"],
        json!("lead-agent")
    );
    assert_eq!(
        accepted["result"]["acceptance"]["findings"]
            .as_array()
            .map(Vec::len),
        Some(1)
    );
    let (code, replayed) = env.forged(&[
        "run",
        "accept-risk",
        "--run",
        "bead-round-budget",
        "--accepted-by",
        "lead-agent",
        "--rationale",
        "the affected path is disabled in this deployment",
    ]);
    assert_eq!(code, 0, "accept-risk replay: {replayed}");
    assert_eq!(replayed["reused"], json!(true));
    let (code, exact_new_operation) = env.forged(&[
        "run",
        "accept-risk",
        "--run",
        "bead-round-budget",
        "--accepted-by",
        "lead-agent",
        "--rationale",
        "the affected path is disabled in this deployment",
        "--idempotency-key",
        "risk-exact-replay-new-operation",
    ]);
    assert_eq!(code, 0, "exact ledger replay: {exact_new_operation}");
    assert_eq!(exact_new_operation["reused"], json!(false));
    let (code, competing) = env.forged(&[
        "run",
        "accept-risk",
        "--run",
        "bead-round-budget",
        "--accepted-by",
        "another-operator",
        "--rationale",
        "different acceptance evidence",
        "--idempotency-key",
        "risk-competing-evidence",
    ]);
    assert_ne!(code, 0, "competing evidence must be refused: {competing}");
    assert_eq!(
        competing["error"]["code"],
        json!("INVALID_REQUEST"),
        "competing singleton payload is not an idempotent replay"
    );
    let (_, status) = env.forged(&["run", "status", "--run", "bead-round-budget"]);
    assert_eq!(status["result"]["run"]["outcome"], json!("accepted-risk"));
    assert_eq!(
        status["result"]["run"]["nextAction"]["stop"]["acceptedRisk"]["rationale"],
        json!("the affected path is disabled in this deployment")
    );
    let (_, events) = env.forged(&["events", "--run", "bead-round-budget"]);
    assert_eq!(
        events["result"]["events"]
            .as_array()
            .expect("events")
            .iter()
            .filter(|event| event["kind"] == json!("forged.review.risk_accepted"))
            .count(),
        1
    );
}

#[test]
fn implementer_spec_amendment_stops_before_gate_or_review() {
    let env = TestEnv::new("forged-spec-amendment");
    env.forged(&["init"]);
    env.set_scenario("implement", "spec-amendment", 1);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    assert_eq!(
        env.forged(&[
            "run",
            "start",
            "--bead",
            "bead-amendment",
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
    env.authorize_run("bead-amendment");
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-amendment"]);
    assert_eq!(code, 0, "drive: {driven}");
    assert_eq!(
        driven["result"]["terminal"]["specAmendmentProposed"]["stageId"],
        json!("implementation")
    );
    assert_eq!(
        driven["result"]["terminal"]["specAmendmentProposed"]["amendment"]["proposedChange"],
        json!("target the replacement API")
    );
    let (_, status) = env.forged(&["run", "status", "--run", "bead-amendment"]);
    assert_eq!(status["result"]["run"]["outcome"], json!("input-required"));
    let log = env.provider_log();
    assert_eq!(
        log.iter().filter(|line| line.contains(" start ")).count(),
        1,
        "no gate-independent reviewer or fixer should run: {log:?}"
    );
}

#[test]
fn gate_failure_escalates_once_but_standard_review_never_escalates_topology() {
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
    gate.authorize_run("bead-gate-edge");
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

    // Standard is deliberately one repo-aware reviewer and never raises
    // itself into the high-assurance panel after a review result.
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
    conflict.authorize_run("bead-conflict-edge");
    assert_eq!(
        conflict
            .forged(&["run", "drive", "--run", "bead-conflict-edge"])
            .0,
        0
    );
    let (_, status) = conflict.forged(&["run", "status", "--run", "bead-conflict-edge"]);
    assert_eq!(
        status["result"]["run"]["execution"]["activeProfileRef"]["name"],
        json!("standard")
    );
    assert_eq!(
        status["result"]["run"]["execution"]["profileHistory"]
            .as_array()
            .map(Vec::len),
        Some(1)
    );
    let log = conflict.provider_log();
    assert!(log
        .iter()
        .any(|line| line.starts_with("bead-conflict-edge/review-1/0")));
    assert!(!log.iter().any(|line| line.contains("/review-2/")));
    assert!(!log.iter().any(|line| line.contains("/review-3/")));
    assert!(!log.iter().any(|line| line.contains("/synthesis/")));
}

#[test]
fn pre_policy_run_package_is_migrated_once_and_then_stays_frozen() {
    let env = TestEnv::new("forged-legacy-run-policy");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--bead",
        "legacy-policy-run",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start: {started}");
    env.authorize_run("legacy-policy-run");

    // Recreate the exact pre-policy durable shape: package JSON and its hash
    // both omit `policy`, with no migration overlay yet.
    let db = env.anvil.join("state.db");
    let connection = rusqlite::Connection::open(&db).expect("open legacy run fixture");
    let package_json: String = connection
        .query_row(
            "SELECT package_json FROM run_definitions WHERE run_id = ?1",
            ["legacy-policy-run"],
            |row| row.get(0),
        )
        .expect("stored package");
    let mut legacy_package: Value = serde_json::from_str(&package_json).expect("package JSON");
    legacy_package
        .as_object_mut()
        .expect("package object")
        .remove("policy");
    let (legacy_json, legacy_sha256) = canonical_json_and_sha(&legacy_package);
    connection
        .execute(
            "UPDATE run_definitions SET package_json = ?1, package_sha256 = ?2 WHERE run_id = ?3",
            rusqlite::params![legacy_json, legacy_sha256, "legacy-policy-run"],
        )
        .expect("install legacy package");
    connection
        .execute(
            "DELETE FROM runtime_migrations WHERE name = 'forged.run.execution-policy/1'",
            [],
        )
        .expect("restore pre-upgrade migration state");
    drop(connection);

    let (code, migrated) = env.forged(&["run", "status", "--run", "legacy-policy-run"]);
    assert_eq!(code, 0, "legacy status migrates: {migrated}");
    assert_eq!(
        migrated["result"]["run"]["definition"]["policy"]["gateCommands"],
        json!(["true"])
    );
    let migrated_sha256 = migrated["result"]["run"]["definition"]["packageSha256"]
        .as_str()
        .expect("migrated digest")
        .to_owned();

    // A later authoring change must not leak through the compatibility seam.
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config JSON");
    config["gate_commands"] = json!(["false"]);
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("serialize config"),
    )
    .expect("rewrite config");
    let (code, driven) = env.forged(&["run", "drive", "--run", "legacy-policy-run"]);
    assert_eq!(code, 0, "drive uses the migrated true gate: {driven}");
    let (_, repeated) = env.forged(&["run", "status", "--run", "legacy-policy-run"]);
    assert_eq!(
        repeated["result"]["run"]["definition"]["packageSha256"],
        json!(migrated_sha256)
    );
    assert_eq!(
        repeated["result"]["run"]["definition"]["policy"]["gateCommands"],
        json!(["true"])
    );

    let connection = rusqlite::Connection::open(&db).expect("inspect migration overlay");
    let overlays: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM run_package_migrations WHERE run_id = ?1",
            ["legacy-policy-run"],
            |row| row.get(0),
        )
        .expect("overlay count");
    assert_eq!(
        overlays, 1,
        "repeat process starts never duplicate overlays"
    );
    let original_json: String = connection
        .query_row(
            "SELECT package_json FROM run_definitions WHERE run_id = ?1",
            ["legacy-policy-run"],
            |row| row.get(0),
        )
        .expect("original package");
    assert!(
        serde_json::from_str::<Value>(&original_json).expect("original JSON")["policy"].is_null(),
        "the original immutable definition row remains untouched"
    );
}

#[test]
fn pre_upgrade_run_start_operation_replays_with_its_legacy_request_hash() {
    let env = TestEnv::new("forged-legacy-run-start-replay");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let args = [
        "run",
        "start",
        "--bead",
        "legacy-start-replay",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ];
    let (code, started) = env.forged(&args);
    assert_eq!(code, 0, "start: {started}");

    // Recreate the exact pre-upgrade request identity in both durable seams:
    // the operation hash and its recoverable proto.operation.request event.
    let db = env.anvil.join("state.db");
    let connection = rusqlite::Connection::open(&db).expect("open legacy operation fixture");
    let (event_id, payload_json): (i64, String) = connection
        .query_row(
            "SELECT event_id, payload_json FROM events WHERE run_id = ?1 \
             AND kind = 'proto.operation.request'",
            ["legacy-start-replay"],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("run-start request event");
    let mut payload: Value = serde_json::from_str(&payload_json).expect("request event JSON");
    payload["request"]["params"]
        .as_object_mut()
        .expect("request params")
        .remove("packageSha256");
    let legacy_request: forged_types::OperationRequest =
        serde_json::from_value(payload["request"].clone()).expect("legacy request");
    let legacy_hash = forged_types::request_sha256(&legacy_request).expect("legacy request hash");
    connection
        .execute(
            "UPDATE operations SET request_sha256 = ?1 \
             WHERE name = 'run_start' AND idempotency_key = ?2",
            rusqlite::params![legacy_hash, legacy_request.idempotency_key],
        )
        .expect("install legacy operation hash");
    connection
        .execute(
            "UPDATE events SET payload_json = ?1 WHERE event_id = ?2",
            rusqlite::params![
                serde_json::to_string(&payload).expect("legacy request event"),
                event_id
            ],
        )
        .expect("install legacy request event");
    drop(connection);

    let (code, replayed) = env.forged(&args);
    assert_eq!(code, 0, "legacy terminal operation replays: {replayed}");
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(replayed["result"], started["result"]);
}

#[test]
fn pre_snapshot_epic_start_gets_one_package_event_and_remains_driveable() {
    let env = TestEnv::new("forged-legacy-epic-package");
    env.seed_epic(
        "legacy-package-epic",
        &[("legacy-package-child", &env.spec, true)],
    );
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "legacy-package-epic",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    env.authorize_epic("legacy-package-epic");

    // Recreate a pre-snapshot forged.epic/1 start event. Its legacy profile,
    // roster, and package digest remain, but the full package is absent.
    let db = env.anvil.join("state.db");
    let connection = rusqlite::Connection::open(&db).expect("open legacy epic fixture");
    let (event_id, payload_json): (i64, String) = connection
        .query_row(
            "SELECT event_id, payload_json FROM events \
             WHERE run_id = ?1 AND kind = 'forged.epic.started'",
            ["legacy-package-epic"],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("epic start event");
    let mut legacy_start: Value = serde_json::from_str(&payload_json).expect("start JSON");
    legacy_start
        .as_object_mut()
        .expect("start object")
        .remove("executionPackage");
    legacy_start
        .as_object_mut()
        .expect("start object")
        .remove("maxActiveChildren");
    connection
        .execute(
            "UPDATE events SET payload_json = ?1 WHERE event_id = ?2",
            rusqlite::params![
                serde_json::to_string(&legacy_start).expect("legacy start JSON"),
                event_id
            ],
        )
        .expect("install legacy start event");
    connection
        .execute(
            "DELETE FROM runtime_migrations WHERE name = 'forged.epic.execution-package/1'",
            [],
        )
        .expect("restore pre-upgrade migration state");
    drop(connection);

    let (code, migrated) = env.forged(&["epic", "status", "--epic", "legacy-package-epic"]);
    assert_eq!(code, 0, "legacy epic status migrates: {migrated}");
    assert_eq!(
        migrated["result"]["maxActiveChildren"],
        json!(1),
        "pre-fan-out epic events retain sequential replay"
    );

    // Once frozen, later config changes do not affect either projection or
    // child creation from the epic package.
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config JSON");
    config["gate_commands"] = json!(["false"]);
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("serialize config"),
    )
    .expect("rewrite config");
    for _ in 0..3 {
        let (code, advanced) = env.forged(&["epic", "advance", "--epic", "legacy-package-epic"]);
        assert_eq!(code, 0, "legacy epic lifecycle advances: {advanced}");
    }
    let ledger = env.ledger();
    let child_definition = ledger
        .get_run_definition("legacy-package-child")
        .expect("child definition query")
        .expect("child definition");
    ledger.close().expect("close ledger");
    let child_package: forged_types::ExecutionPackageV1 =
        serde_json::from_str(&child_definition.package_json).expect("child package");
    assert_eq!(child_package.policy.gate_commands, ["true"]);

    let connection = rusqlite::Connection::open(&db).expect("inspect epic migration");
    let migrations: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM events WHERE run_id = ?1 \
             AND kind = 'forged.epic.execution-package.migrated'",
            ["legacy-package-epic"],
            |row| row.get(0),
        )
        .expect("epic migration count");
    assert_eq!(migrations, 1, "repeat process starts append one migration");
    let migration_json: String = connection
        .query_row(
            "SELECT payload_json FROM events WHERE run_id = ?1 \
             AND kind = 'forged.epic.execution-package.migrated'",
            ["legacy-package-epic"],
            |row| row.get(0),
        )
        .expect("epic migration payload");
    let migration: Value = serde_json::from_str(&migration_json).expect("migration JSON");
    assert_eq!(migration["source"], json!("upgrade-config"));
    assert_eq!(
        migration["executionPackage"]["policy"]["gateCommands"],
        json!(["true"])
    );
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
    env.authorize_run("bead-frozen");
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
    config["gate_commands"] = json!(["false"]);
    config["stage_budget_s"]["implement"] = json!(1);
    config["transport_retry_budget"] = json!(0);
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
    assert_eq!(
        status["result"]["run"]["definition"]["policy"]["gateCommands"],
        json!(["true"]),
        "the gate policy is frozen with the run rather than reread"
    );
    assert_eq!(
        status["result"]["run"]["definition"]["policy"]["transportRetryBudget"],
        json!(3)
    );
}

#[test]
fn epic_roster_revision_updates_current_and_future_children() {
    let env = TestEnv::new("forged-epic-roster-revision");
    env.enable_dynamic_gh();
    env.add_uniform_roster("all-codex", "codex", "gpt-5.6-sol");
    env.seed_epic(
        "epic-roster",
        &[
            ("roster-child-one", &env.spec, true),
            ("roster-child-two", &env.spec, false),
        ],
    );
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-roster",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "epic start: {started}");
    env.authorize_epic("epic-roster");
    assert!(started["result"]["executionPackage"].is_object());

    // Resolution, durable wave commit, then the first bounded child launch.
    for _ in 0..3 {
        let (code, advanced) = env.forged(&["epic", "advance", "--epic", "epic-roster"]);
        assert_eq!(code, 0, "advance to first child: {advanced}");
    }
    let (code, revised) = env.forged(&[
        "epic",
        "revise-roster",
        "--epic",
        "epic-roster",
        "--roster",
        "all-codex",
        "--reason",
        "anthropic access unavailable",
    ]);
    assert_eq!(code, 0, "epic roster revision: {revised}");
    assert_eq!(revised["result"]["revision"], json!(2));
    assert_eq!(revised["result"]["rosterRef"]["name"], json!("all-codex"));
    let current_revision = env
        .ledger()
        .latest_roster_revision("roster-child-one")
        .expect("read current child revision")
        .expect("current child revision");
    assert_eq!(current_revision.revision, 2);
    assert_eq!(
        serde_json::from_str::<Value>(&current_revision.roster_ref_json).expect("roster ref")
            ["name"],
        json!("all-codex")
    );

    env.set_scenario("reviewclaude", "approve", 2);
    env.seed_frontier("roster-child-two");
    let (code, driven) = env.forged(&["epic", "drive", "--epic", "epic-roster"]);
    assert_eq!(code, 0, "drive revised epic: {driven}");
    let ledger = env.ledger();
    let future_definition = ledger
        .get_run_definition("roster-child-two")
        .expect("read future child definition")
        .expect("future child definition");
    let future_package: forged_types::ExecutionPackageV1 =
        serde_json::from_str(&future_definition.package_json).expect("future package");
    assert_eq!(future_package.roster_ref.name, "all-codex");
    let runs = ["roster-child-one", "roster-child-two"];
    for run in runs {
        let attempt = ledger
            .list_packets(run)
            .expect("packets")
            .into_iter()
            .find(|packet| {
                forged_proto::stored_packet(packet)
                    .ok()
                    .and_then(|packet| packet.execution)
                    .is_some_and(|execution| {
                        execution.purpose == forged_types::SeatPurpose::Implement
                    })
            })
            .and_then(|packet| {
                ledger
                    .list_live_attempts(Some(run))
                    .ok()
                    .and_then(|attempts| {
                        attempts
                            .into_iter()
                            .find(|attempt| attempt.packet_id == packet.packet_id)
                    })
                    .or_else(|| {
                        let events = ledger.list_events(Some(run), 0, 4096).ok()?;
                        let attempt_id = events.into_iter().find_map(|event| {
                            let value: Value = serde_json::from_str(&event.payload_json).ok()?;
                            (event.kind == "attempt.state"
                                && value.get("packetId")?.as_str()? == packet.packet_id)
                                .then(|| value.get("attemptId")?.as_i64())
                                .flatten()
                        })?;
                        ledger.get_attempt(attempt_id).ok()
                    })
            })
            .expect("implementation attempt");
        assert!(
            attempt.claimant.starts_with("codex:"),
            "{run} must use the revised roster: {attempt:?}"
        );
    }
    ledger.close().expect("close ledger");
    let (_, status) = env.forged(&["epic", "status", "--epic", "epic-roster"]);
    assert_eq!(status["result"]["roster"], json!("all-codex"));
    assert_eq!(
        status["result"]["rosterRevisions"].as_array().map(Vec::len),
        Some(1)
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
    env.authorize_run("bead-sem");
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
    env.authorize_run("bead-tr");
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
    env.authorize_run("bead-nopid");

    // This fresh ledger's first claim has attempt id 1. Occupy that
    // attempt-scoped pid path with a DIRECTORY: the spawned shell's
    // `echo $$ > provider.pid` fails, the provider still runs, and the file
    // never appears — deterministically, with no race against the shim.
    let attempt_dir = env
        .packet_dir("bead-nopid", "implementation", 0)
        .join("attempts/1");
    std::fs::create_dir_all(attempt_dir.join("provider.pid")).expect("occupy the pid path");
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
    env.authorize_run("bead-rec");
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
