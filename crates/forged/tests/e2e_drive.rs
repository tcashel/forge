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
use support::{assert_no_overlap, git, render_cost, require_node, rev_parse, McpClient, TestEnv};

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
    // kill evidence catches up.
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

fn expire_latest_retry(env: &TestEnv, run: &str) {
    let connection =
        rusqlite::Connection::open(env.anvil.join("state.db")).expect("open retry clock");
    let (event_id, payload): (i64, String) = connection
        .query_row(
            "SELECT event_id, payload_json FROM events WHERE run_id = ?1 AND kind = 'proto.retry' ORDER BY event_id DESC LIMIT 1",
            [run],
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
}

#[test]
fn push_transport_retries_are_bounded_then_stop_as_input_required() {
    let env = TestEnv::new("forged-push-retry");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_frontier("bead-push-retry");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
    let submit_key = "epic-one-generation-one";
    let (code, submitted) = env.forged(&[
        "epic",
        "submit",
        "--epic",
        "epic-one",
        "--idempotency-key",
        submit_key,
    ]);
    assert_eq!(code, 0, "epic submit: {submitted}");
    assert_eq!(submitted["result"]["submitted"], json!(true));
    assert_eq!(submitted["result"]["controller"]["host"], json!("process"));
    assert!(submitted["result"]["controller"]["sessionId"].is_string());

    let mut provider_started = false;
    // A loaded CI runner can take well over the old five-second window to
    // schedule the detached controller and its child provider; the deadline
    // bounds a hang, not the happy path.
    for _ in 0..600 {
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

    let controller_pid = submitted["result"]["controller"]["driver"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
        .expect("epic controller pid");
    nix::sys::signal::killpg(
        nix::unistd::Pid::from_raw(controller_pid),
        nix::sys::signal::Signal::SIGKILL,
    )
    .expect("kill first epic controller group");
    wait_for(&env, &["epic", "status", "--epic", "epic-one"], |value| {
        matches!(
            value["result"]["controller"]["state"].as_str(),
            Some("exited" | "vanished")
        )
    });

    let (code, stale) = env.forged(&[
        "epic",
        "submit",
        "--epic",
        "epic-one",
        "--idempotency-key",
        submit_key,
    ]);
    assert_ne!(code, 0, "stale epic submit key must refuse: {stale}");
    assert_eq!(stale["error"]["code"], json!("IDEMPOTENCY_CONFLICT"));
    let submit_remedy = &stale["error"]["detail"];
    assert_eq!(
        submit_remedy,
        &json!({
            "schema": "forged.remedy/1",
            "verb": "epic submit",
            "args": {"epic": "epic-one"},
            "reason": "omit the idempotency key so forged can mint the next controller generation",
        })
    );
    env.set_scenario("implement", "slow", 1);
    let mut mcp = McpClient::new(&env);
    let resubmitted = mcp.call_tool(
        "epic_submit",
        json!({"schemaVersion": 1, "params": submit_remedy["args"]}),
    );
    assert_eq!(
        resubmitted["ok"],
        json!(true),
        "advertised keyless epic resubmit succeeds: {resubmitted}"
    );
    assert_eq!(resubmitted["result"]["controller"]["generation"], json!(2));

    let (code, refused) = env.forged(&[
        "epic",
        "abandon",
        "--epic",
        "epic-one",
        "--reason",
        "the integration geometry is wrong",
    ]);
    assert_ne!(code, 0, "live-controller abandon must refuse: {refused}");
    assert_eq!(refused["error"]["code"], json!("BEADS_CONTENTION"));
    let remedy = &refused["error"]["detail"];
    assert_eq!(
        remedy,
        &json!({
            "schema": "forged.remedy/1",
            "verb": "epic pause",
            "args": {
                "epic": "epic-one",
                "reason": "pause before abandoning this epic",
            },
            "reason": "pause the live controller before abandoning the epic",
        })
    );
    let paused = mcp.call_tool(
        "epic_pause",
        json!({"schemaVersion": 1, "params": remedy["args"]}),
    );
    assert_eq!(
        paused["ok"],
        json!(true),
        "advertised epic pause succeeds: {paused}"
    );
    let held = wait_for(&env, &["epic", "status", "--epic", "epic-one"], |value| {
        value["result"]["paused"].is_object()
            && value["result"]["controller"]["generation"] == json!(2)
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
    assert_eq!(resubmitted["result"]["controller"]["generation"], json!(3));

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

fn drive_internal_plan_to_stop(env: &TestEnv, run: &str) -> Value {
    for _ in 0..32 {
        let (_, status) = env.forged(&["run", "status", "--run", run]);
        if status["result"]["run"]["state"] == json!("stopped") {
            return status;
        }
        let (code, advanced) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
        assert_eq!(code, 0, "one planning tick: {advanced}");
        assert!(
            advanced["result"]["progress"]["planningAdvanced"].is_object(),
            "the epic advances at most one internal run step per tick: {advanced}"
        );
    }
    panic!("internal plan {run} did not stop within its frozen protocol bound")
}

#[test]
fn incomplete_blocked_stub_does_not_opt_into_rolling_planning() {
    let env = TestEnv::new("forged-rolling-explicit-authorization");
    env.seed_epic("epic-explicit", &[("forgotten-stub", &env.spec, false)]);
    env.set_work_field("forgotten-stub", "description", "");
    env.set_work_field("forgotten-stub", "acceptance", "");
    env.set_work_field("forgotten-stub", "design", "");
    env.set_work_field("forgotten-stub", "notes", "");
    env.set_work_field("forgotten-stub", "status", "blocked");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, refused) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-explicit",
        "--repo",
        &repo,
        "--base-ref",
        "main",
    ]);
    assert_ne!(code, 0, "rolling authority must be explicit: {refused}");
    assert!(refused["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("has no spec")));
    assert!(env
        .ledger()
        .list_events(Some("epic-explicit"), 0, 100)
        .expect("epic events")
        .iter()
        .all(|event| event.kind != "forged.epic.started"));
}

fn reach_rolling_planning_boundary(env: &TestEnv) -> usize {
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-rolling",
        &[
            ("child-wave", &env.spec, true),
            ("child-next", &env.spec, false),
            ("child-stub", &env.spec, false),
        ],
    );
    env.set_work_field("child-stub", "description", "");
    env.set_work_field("child-stub", "acceptance", "");
    env.set_work_field("child-stub", "design", "frozen hint");
    env.set_work_field("child-stub", "notes", "frozen note");
    env.set_work_field("child-stub", "status", "blocked");
    env.set_work_field("child-stub", "dependencies", "[]");
    env.set_work_field("child-stub", "priority", "0");
    env.set_work_field("child-next", "priority", "4");
    // `ready: false` no longer withholds an open child: readiness is a store
    // query. Hold child-next off the frontier the way the graph does, so the
    // release in `start_rolling_plan` is a real state change.
    env.set_work_field(
        "child-next",
        "dependencies",
        r#"[{"id":"child-next-blocker","dependency_type":"blocks","status":"open"}]"#,
    );
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-rolling",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    assert_eq!(
        started["result"]["planningPackage"]["protocolRef"]["name"],
        json!("epic-plan")
    );
    env.authorize_epic("epic-rolling");

    let (code, integration) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "integration: {integration}");
    let (code, wave) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "initial wave: {wave}");
    assert_eq!(
        wave["result"]["progress"]["children"],
        json!(["child-wave"])
    );
    let (code, launched) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "initial launch: {launched}");
    let initial = wait_for(env, &["run", "status", "--run", "child-wave"], |value| {
        value["result"]["run"]["outcome"] == json!("clean")
    });
    assert_eq!(initial["result"]["run"]["state"], json!("stopped"));
    let (code, merged) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "initial merge: {merged}");
    assert_eq!(merged["result"]["progress"]["childId"], json!("child-wave"));
    env.gh_calls().len()
}

/// How many guarded planning applies landed for one work item — the
/// transactional witness the bd argv count used to approximate.
fn planning_applies(env: &TestEnv, work_id: &str) -> usize {
    let ledger = env.ledger();
    let count = ledger
        .list_events(None, 0, 65_536)
        .expect("work.updated events")
        .into_iter()
        .filter(|event| {
            event.kind == "work.updated"
                && serde_json::from_str::<Value>(&event.payload_json).is_ok_and(|payload| {
                    payload["workId"] == json!(work_id)
                        && payload["verb"] == json!("planning-apply")
                })
        })
        .count();
    ledger.close().expect("close ledger");
    count
}

fn start_rolling_plan(env: &TestEnv) -> usize {
    let gh_before_plan = reach_rolling_planning_boundary(env);
    env.set_work_field("child-next-blocker", "status", "closed");
    let (code, planning) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "planning dispatch: {planning}");
    assert_eq!(
        planning["result"]["progress"]["planning"]["childId"],
        json!("child-stub")
    );
    let (_, status) = env.forged(&["epic", "status", "--epic", "epic-rolling"]);
    let children = status["result"]["children"]
        .as_array()
        .expect("child projection");
    let completed = children
        .iter()
        .find(|child| child["id"] == "child-wave")
        .expect("completed child projection");
    assert_eq!(completed["runId"], json!("child-wave"));
    assert!(completed["merged"].is_object());
    let stub = children
        .iter()
        .find(|child| child["id"] == "child-stub")
        .expect("stub projection");
    assert_eq!(stub["runId"], json!("child-stub-epic-plan"));
    assert_eq!(stub["phase"], json!("planning"));
    assert_eq!(status["result"]["counts"]["active"], json!(1));
    assert_eq!(status["result"]["counts"]["queuedDeferred"], json!(0));
    gh_before_plan
}

fn prepare_reviewed_rolling_plan(env: &TestEnv) -> usize {
    let gh_before_plan = start_rolling_plan(env);
    let plan_run = "child-stub-epic-plan";
    let stopped = drive_internal_plan_to_stop(env, plan_run);
    assert_eq!(stopped["result"]["run"]["outcome"], json!("clean"));
    assert!(
        env.worktree(plan_run).exists(),
        "reviewed planning artifacts remain until guarded apply"
    );
    assert_eq!(
        env.gh_calls().len(),
        gh_before_plan,
        "the complete planning protocol has zero GitHub effects"
    );
    gh_before_plan
}

#[test]
fn rolling_epic_assures_the_exact_draft_pr_head_before_completion() {
    let env = TestEnv::new("forged-rolling-assurance");
    env.enable_dynamic_gh();
    env.seed_epic("epic-assurance", &[("child-done", &env.spec, false)]);
    env.set_work_field("child-done", "status", "closed");
    assert_eq!(env.forged(&["init"]).0, 0);

    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-assurance",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    assert_eq!(
        started["result"]["assurancePackage"]["protocolRef"]["name"],
        json!("epic-assurance")
    );
    env.authorize_epic("epic-assurance");

    let (code, integration) = env.forged(&["epic", "advance", "--epic", "epic-assurance"]);
    assert_eq!(code, 0, "integration: {integration}");
    let (code, draft) = env.forged(&["epic", "advance", "--epic", "epic-assurance"]);
    assert_eq!(code, 0, "draft PR: {draft}");
    assert_eq!(draft["result"]["progress"]["terminal"], json!(false));
    assert!(draft["result"]["progress"]["draftPr"].is_object());

    let (_, in_progress) = env.forged(&["epic", "status", "--epic", "epic-assurance"]);
    assert!(in_progress["result"]["draftPr"].is_object());
    assert!(in_progress["result"]["finalPr"].is_null());
    let (code, detail) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "epic",
        "--subject-id",
        "epic-assurance",
    ]);
    assert_eq!(code, 0, "assurance Work Detail: {detail}");
    assert_ne!(
        detail["result"]["status"]["state"],
        json!("submitted"),
        "the nonterminal draft PR must not complete Work Detail: {detail}"
    );
    assert_eq!(detail["result"]["delivery"]["known"], json!(true));
    assert_eq!(
        detail["result"]["delivery"]["sha"],
        draft["result"]["progress"]["draftPr"]["headSha"]
    );

    let mut terminal = Value::Null;
    for _ in 0..64 {
        let (code, tick) = env.forged(&["epic", "advance", "--epic", "epic-assurance"]);
        assert_eq!(code, 0, "assurance tick: {tick}");
        if tick["result"]["stopped"]["assurance"].is_object() {
            terminal = tick;
            break;
        }
        terminal = tick;
    }
    assert!(
        terminal["result"]["stopped"]["assurance"].is_object(),
        "assurance did not converge: {terminal}"
    );
    let evidence = &terminal["result"]["stopped"]["assurance"]["evidence"];
    assert_eq!(evidence["disposition"], json!("approved-clean"));
    assert_eq!(evidence["gate"]["passed"], json!(true));
    assert_eq!(evidence["terminalSha"], evidence["gate"]["headSha"]);
    assert!(!evidence["reviewers"]
        .as_array()
        .expect("reviewer evidence")
        .is_empty());
    assert_eq!(evidence["draftPr"]["isDraft"], json!(true));

    let branch = started["result"]["integrationBranch"]
        .as_str()
        .expect("integration branch");
    let remote_sha = rev_parse(&env.repos.origin, branch);
    assert_eq!(evidence["terminalSha"], json!(remote_sha));
    let assurance_worktree = env.worktree("epic-assurance-epic-assurance");
    assert!(
        !assurance_worktree.exists(),
        "terminal assurance retires its worktree"
    );
    assert!(
        !git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&assurance_worktree.to_string_lossy().into_owned()),
        "terminal assurance removes its worktree registration"
    );
    let (_, completed) = env.forged(&["epic", "status", "--epic", "epic-assurance"]);
    assert_eq!(completed["result"]["finalPr"]["number"], json!(7));
    assert_eq!(
        completed["result"]["assurance"]["terminalOutcome"],
        json!("clean")
    );
    assert_ne!(
        completed["result"]["assurance"]["integrationSha"], evidence["terminalSha"],
        "the bounded Fix round must produce the head that ReGate approves"
    );
    let (code, detail) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "epic",
        "--subject-id",
        "epic-assurance",
    ]);
    assert_eq!(code, 0, "completed assurance Work Detail: {detail}");
    assert_eq!(detail["result"]["status"]["state"], json!("submitted"));
    let provider_log = env.provider_log();
    assert!(
        provider_log
            .iter()
            .any(|line| line.starts_with("epic-assurance-epic-assurance/remediation/0 start ")),
        "assurance Fix packet: {provider_log:?}"
    );
    assert!(provider_log
        .iter()
        .all(|line| { !line.starts_with("epic-assurance-epic-assurance/implementation/") }));
    assert_eq!(
        env.work_status("epic-assurance"),
        "open",
        "internal assurance must not mutate or resolve the root Bead"
    );

    let gh_calls = env.gh_calls();
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method POST")
                && call.join(" ").contains("/pulls"))
            .count(),
        1,
        "draft PR creation remains exactly once: {gh_calls:?}"
    );
    assert!(gh_calls.iter().any(|call| {
        call.join(" ").contains("--method PATCH") && call.join(" ").contains("/pulls/7")
    }));
    assert!(gh_calls
        .iter()
        .all(|call| !call.iter().any(|arg| arg == "merge")));
}

#[test]
fn three_submitted_rolling_epics_converge_below_capacity_with_one_isolated_crux() {
    let env = TestEnv::new("forged-rolling-assurance-convergence");
    env.enable_dynamic_gh();
    set_admission(
        &env,
        json!({
            "totalActive": 2,
            "providerActive": 2,
            "repositoryWriteActive": 1,
            "epicFanout": 1,
            "deferSeconds": 1,
        }),
    );
    let epics = [
        ("epic-assurance-a", "child-assurance-a"),
        ("epic-assurance-b", "child-assurance-b"),
        ("epic-assurance-c", "child-assurance-c"),
    ];
    for (epic, child) in epics {
        env.seed_epic(epic, &[(child, &env.spec, false)]);
        env.set_work_field(child, "status", "closed");
    }
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    for (epic, _) in epics {
        let (code, started) = env.forged(&[
            "epic",
            "start",
            "--epic",
            epic,
            "--repo",
            &repo,
            "--base-ref",
            "main",
            "--rolling",
        ]);
        assert_eq!(code, 0, "rolling start {epic}: {started}");
    }

    // Hold EVERY first review: the two admitted runs park inside their
    // held reviews so both slots stay occupied, and the third run's
    // admission defers deterministically instead of winning a spawn race.
    env.set_scenario("reviewclaude", "wait-release", 3);
    for (epic, _) in epics {
        let (code, submitted) = env.forged(&["epic", "submit", "--epic", epic]);
        assert_eq!(code, 0, "epic submit {epic}: {submitted}");
        assert_eq!(submitted["result"]["submitted"], json!(true));
    }
    // Two fence facts must become observable, not merely the first: the held
    // review starting proves one epic won a slot, and a durable Deferred
    // decision proves a sibling hit the capacity fence. The siblings'
    // controllers can lag the winner on a slow host, so wait for each fact
    // on its own clock instead of reading the decisions the instant the
    // review starts.
    let mut review_started = false;
    let mut deferred = 0_usize;
    for _ in 0..1_200 {
        review_started = review_started
            || env
                .provider_log()
                .iter()
                .any(|line| line.contains("/review-1/0 start "));
        let ledger = env.ledger();
        deferred = ledger
            .latest_admission_decisions(None, None)
            .expect("admission decisions")
            .into_iter()
            .filter(|decision| decision.outcome == forged_types::AdmissionOutcome::Deferred)
            .count();
        ledger.close().expect("close ledger");
        if review_started && deferred > 0 {
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(50));
    }
    assert!(
        review_started,
        "one submitted epic reached assurance review"
    );
    if deferred == 0 {
        // The fence never recorded a deferral: name every decision and each
        // epic's projected state so the failing host explains itself.
        let ledger = env.ledger();
        let decisions = ledger
            .latest_admission_decisions(None, None)
            .expect("admission decisions");
        ledger.close().expect("close ledger");
        let statuses: Vec<String> = epics
            .iter()
            .map(|(epic, _)| {
                let (_, status) = env.forged(&["epic", "status", "--epic", epic]);
                format!("{epic}: {status}")
            })
            .collect();
        let mut evidence = String::new();
        for (epic, _) in epics {
            let controller = env
                .anvil
                .join("runs")
                .join(epic)
                .join("controller/controller-1.log");
            let log = std::fs::read_to_string(&controller).unwrap_or_default();
            let tail: Vec<&str> = log.lines().rev().take(30).collect();
            evidence.push_str(&format!("--- {epic} controller tail ---\n"));
            for line in tail.iter().rev() {
                evidence.push_str(line);
                evidence.push('\n');
            }
            let attempts = env
                .anvil
                .join("runs")
                .join(format!("{epic}-epic-assurance"))
                .join("packets/review-1/0/attempts");
            if let Ok(entries) = std::fs::read_dir(&attempts) {
                for entry in entries.flatten() {
                    for file in ["result.json", ".provider-stream-status.json"] {
                        let path = entry.path().join(file);
                        if let Ok(body) = std::fs::read_to_string(&path) {
                            evidence.push_str(&format!("--- {} ---\n{body}\n", path.display()));
                        }
                    }
                }
            }
        }
        panic!(
            "the below-N workload must exercise the durable capacity fence\n\
             decisions: {decisions:?}\n\
             provider log: {:?}\n\
             {}\n{evidence}",
            env.provider_log(),
            statuses.join("\n"),
        );
    }

    // The held round returns its ordinary finding. Its next review is the one
    // CRUX; after that terminal input releases capacity for both siblings.
    env.set_scenario("reviewclaude", "block", 1);
    env.release_stage("reviewclaude");
    let mut statuses = Vec::new();
    for _ in 0..1_200 {
        let (code, tick) = env.forged(&["supervise", "--once"]);
        assert_eq!(code, 0, "supervisor tick: {tick}");
        statuses = epics
            .iter()
            .map(|(epic, _)| {
                let (code, status) = env.forged(&["epic", "status", "--epic", epic]);
                assert_eq!(code, 0, "epic status {epic}: {status}");
                status
            })
            .collect();
        let complete = statuses
            .iter()
            .filter(|status| status["result"]["finalPr"].is_object())
            .count();
        let input_required = statuses
            .iter()
            .filter(|status| status["result"]["inputRequired"].is_object())
            .count();
        if complete == 2 && input_required == 1 {
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(100));
    }

    let completed = statuses
        .iter()
        .filter(|status| status["result"]["finalPr"].is_object())
        .collect::<Vec<_>>();
    let blocked = statuses
        .iter()
        .filter(|status| status["result"]["inputRequired"].is_object())
        .collect::<Vec<_>>();
    assert_eq!(
        completed.len(),
        2,
        "clean siblings must converge: {statuses:?}"
    );
    assert_eq!(blocked.len(), 1, "only the CRUX epic stops: {statuses:?}");
    for status in &completed {
        let evidence = &status["result"]["assurance"]["completed"]["evidence"];
        let branch = status["result"]["integrationBranch"]
            .as_str()
            .expect("integration branch");
        assert_eq!(evidence["disposition"], json!("approved-clean"));
        assert_eq!(evidence["terminalSha"], evidence["gate"]["headSha"]);
        assert_eq!(
            evidence["terminalSha"],
            json!(rev_parse(
                &env.repos.origin,
                &format!("refs/heads/{branch}")
            ))
        );
        assert_eq!(status["result"]["draftPr"]["isDraft"], json!(true));
    }
    let input = &blocked[0]["result"]["inputRequired"];
    assert_eq!(input["code"], json!("assurance-run-stopped"));
    assert_eq!(blocked[0]["result"]["finalPr"], Value::Null);
    assert_eq!(blocked[0]["result"]["draftPr"]["isDraft"], json!(true));
    assert_eq!(
        input["evidence"]["protocolTerminal"]["specAmendmentProposed"]["amendment"]["evidence"],
        json!("the frozen root excludes the required dependency mutation")
    );

    let pr_numbers = statuses
        .iter()
        .map(|status| {
            status["result"]["draftPr"]["number"]
                .as_u64()
                .expect("one draft PR")
        })
        .collect::<std::collections::BTreeSet<_>>();
    assert_eq!(pr_numbers.len(), 3, "one distinct draft PR per epic");
    let gh_calls = env.gh_calls();
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method POST")
                && call.join(" ").contains("/pulls"))
            .count(),
        3,
        "each submitted epic creates exactly one draft PR: {gh_calls:?}"
    );
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method PATCH")
                && call.join(" ").contains("/pulls/"))
            .count(),
        4,
        "the two assured PRs are each marked pending before terminal evidence: {gh_calls:?}"
    );
    assert!(gh_calls.iter().all(|call| {
        !call.iter().any(|arg| arg == "merge") && !call.iter().any(|arg| arg == "ready")
    }));
}

#[cfg(feature = "failpoints")]
#[test]
fn assurance_start_crash_recovers_one_run_and_one_draft_pr() {
    let env = TestEnv::new("forged-rolling-assurance-start-crash");
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-assurance-crash",
        &[("child-assurance-crash", &env.spec, false)],
    );
    env.set_work_field("child-assurance-crash", "status", "closed");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-assurance-crash",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    env.authorize_epic("epic-assurance-crash");
    assert_eq!(
        env.forged(&["epic", "advance", "--epic", "epic-assurance-crash"])
            .0,
        0
    );
    let (code, draft) = env.forged(&["epic", "advance", "--epic", "epic-assurance-crash"]);
    assert_eq!(code, 0, "draft PR: {draft}");
    assert_eq!(draft["result"]["progress"]["terminal"], json!(false));

    let mut crashed = env
        .forged_cmd(&["epic", "advance", "--epic", "epic-assurance-crash"])
        .env("FORGED_FAILPOINT", "epic.assurance.start.after")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("assurance start child");
    assert!(
        !crashed.wait().expect("assurance start crash").success(),
        "the process must abort after the durable assurance checkpoint"
    );
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.started")
            .count(),
        1
    );
    ledger.close().expect("close ledger");

    let mut terminal = Value::Null;
    for _ in 0..64 {
        let (code, tick) = env.forged(&["epic", "advance", "--epic", "epic-assurance-crash"]);
        assert_eq!(code, 0, "assurance recovery tick: {tick}");
        terminal = tick;
        if terminal["result"]["stopped"]["assurance"].is_object() {
            break;
        }
    }
    assert!(
        terminal["result"]["stopped"]["assurance"].is_object(),
        "recovered assurance did not converge: {terminal}"
    );
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.started")
            .count(),
        1,
        "recovery reuses the durable assurance checkpoint"
    );
    assert!(ledger
        .get_run("epic-assurance-crash-epic-assurance")
        .is_ok_and(|run| run.state == forged_ledger::RunState::Stopped));
    ledger.close().expect("close ledger");
    let gh_calls = env.gh_calls();
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method POST")
                && call.join(" ").contains("/pulls"))
            .count(),
        1,
        "crash recovery must reuse the draft PR: {gh_calls:?}"
    );
    assert!(gh_calls
        .iter()
        .all(|call| !call.iter().any(|arg| arg == "merge")));
}

#[cfg(feature = "failpoints")]
fn assert_assurance_finalization_cleanup_recovery(unresolved_cleanup: bool) {
    let env = TestEnv::new(if unresolved_cleanup {
        "forged-rolling-assurance-finalize-unresolved"
    } else {
        "forged-rolling-assurance-finalize-dirty"
    });
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-assurance-finalize-crash",
        &[("child-assurance-finalize-crash", &env.spec, false)],
    );
    env.set_work_field("child-assurance-finalize-crash", "status", "closed");
    assert_eq!(env.forged(&["init"]).0, 0);
    let default_sha = rev_parse(&env.repos.origin, "main");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-assurance-finalize-crash",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    env.authorize_epic("epic-assurance-finalize-crash");
    assert_eq!(
        env.forged(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"])
            .0,
        0
    );
    let (code, draft) = env.forged(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(code, 0, "draft PR: {draft}");
    let draft_pr = draft["result"]["progress"]["draftPr"].clone();

    let mut crashed = false;
    for _ in 0..64 {
        let status = env
            .forged_cmd(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"])
            .env("FORGED_FAILPOINT", "epic.assurance.pr-body.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("assurance finalization tick");
        if !status.success() {
            crashed = true;
            break;
        }
    }
    assert!(crashed, "finalization must reach the PR-body crash seam");

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.completed")
            .count(),
        0,
        "a body update alone is not terminal"
    );
    let desired = ledger
        .get_desired_work(
            forged_ledger::DesiredSubjectKind::Epic,
            "epic-assurance-finalize-crash",
        )
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.desired_state, forged_ledger::DesiredState::Running);
    ledger.close().expect("close ledger");

    let mut completion_crashed = false;
    for _ in 0..64 {
        let status = env
            .forged_cmd(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"])
            .env("FORGED_FAILPOINT", "epic.assurance.finalized.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("assurance completion tick");
        if !status.success() {
            completion_crashed = true;
            break;
        }
    }
    assert!(
        completion_crashed,
        "finalization must reach the completion-before-cleanup crash seam"
    );
    let assurance_worktree = env.worktree("epic-assurance-finalize-crash-epic-assurance");
    assert!(
        assurance_worktree.exists(),
        "the crash seam precedes assurance worktree retirement"
    );
    assert!(
        git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&assurance_worktree.to_string_lossy().into_owned()),
        "the crash seam leaves the worktree registered for replay"
    );
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.finalized")
            .count(),
        1,
        "final binding evidence lands once before cleanup"
    );
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.completed")
            .count(),
        0,
        "cleanup has not crossed the terminal completion boundary"
    );
    let desired = ledger
        .get_desired_work(
            forged_ledger::DesiredSubjectKind::Epic,
            "epic-assurance-finalize-crash",
        )
        .expect("desired query")
        .expect("desired row");
    assert_eq!(
        desired.desired_state,
        forged_ledger::DesiredState::Running,
        "the supervisor must retry cleanup before terminal settlement"
    );
    ledger.close().expect("close ledger");
    let connection = rusqlite::Connection::open(env.anvil.join("state.db"))
        .expect("open finalization operation database");
    let (operation_state, operation_response): (String, String) = connection
        .query_row(
            "SELECT state, response_json FROM operations
             WHERE name = 'epic_pr_finalize' AND run_id = 'epic-assurance-finalize-crash'",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("finalization operation");
    assert_eq!(
        operation_state, "terminal",
        "cleanup cannot bypass an in-progress external effect"
    );
    let operation_response: Value =
        serde_json::from_str(&operation_response).expect("finalization response JSON");
    assert_eq!(operation_response["ok"], json!(true));
    drop(connection);

    let unrelated_input = json!({
        "code": "operator-contract-question",
        "childId": "child-assurance-finalize-crash",
        "detail": "answer this unrelated question first",
    });
    let ledger = env.ledger();
    ledger
        .append_event_once(
            "epic-assurance-finalize-crash",
            "forged.epic.input.required",
            unrelated_input.clone(),
        )
        .expect("inject unrelated input hold");
    ledger.close().expect("close ledger");
    let (code, unrelated) =
        env.forged(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(code, 0, "unrelated input retains precedence: {unrelated}");
    assert_eq!(
        unrelated["result"]["stopped"]["inputRequired"], unrelated_input,
        "finalized cleanup must not bypass unrelated input"
    );
    assert!(
        assurance_worktree.exists(),
        "unrelated input prevents cleanup from touching the worktree"
    );
    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-assurance-finalize-crash",
        "--child",
        "child-assurance-finalize-crash",
        "--note",
        "unrelated question answered",
    ]);
    assert_eq!(code, 0, "resolve unrelated input: {resolved}");

    let blocker = if unresolved_cleanup {
        let assurance_git_dir = git(&assurance_worktree, &["rev-parse", "--absolute-git-dir"]);
        let merge_head = std::path::Path::new(assurance_git_dir.trim()).join("MERGE_HEAD");
        std::fs::write(&merge_head, format!("{default_sha}\n"))
            .expect("mark assurance worktree unresolved");
        merge_head
    } else {
        let dirty_path = assurance_worktree.join("operator-notes.txt");
        std::fs::write(&dirty_path, "preserve me\n").expect("dirty assurance worktree");
        dirty_path
    };
    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(code, 0, "blocked cleanup becomes typed input: {held}");
    let cleanup_input = held["result"]["stopped"]["inputRequired"].clone();
    assert_eq!(cleanup_input["code"], json!("assurance-cleanup-failed"));
    assert_eq!(
        cleanup_input["evidence"]["error"]["code"],
        if unresolved_cleanup {
            json!("WORKTREE_UNRESOLVED")
        } else {
            json!("WORKTREE_DIRTY")
        }
    );
    assert_eq!(
        cleanup_input["evidence"]["error"]["kind"],
        if unresolved_cleanup {
            json!("unresolved")
        } else {
            json!("dirty")
        }
    );
    assert_eq!(
        cleanup_input["evidence"]["runId"],
        json!("epic-assurance-finalize-crash-epic-assurance")
    );
    assert_eq!(
        cleanup_input["evidence"]["worktree"],
        json!(assurance_worktree)
    );
    assert_eq!(
        cleanup_input["evidence"]["error"]["paths"],
        if unresolved_cleanup {
            json!(["MERGE_HEAD"])
        } else {
            json!(["operator-notes.txt"])
        }
    );
    let (code, held_again) =
        env.forged(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(
        code, 0,
        "repeated dirty cleanup remains typed input: {held_again}"
    );
    assert_eq!(
        held_again["result"]["stopped"]["inputRequired"], cleanup_input,
        "the standing cleanup hold is reused verbatim"
    );
    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.input.required")
            .count(),
        2,
        "cleanup retries must not append duplicate input events"
    );
    ledger.close().expect("close ledger");
    std::fs::remove_file(&blocker).expect("clean assurance worktree blocker");

    let (code, status) = env.forged(&["epic", "status", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(code, 0, "status during cleanup gap: {status}");
    assert!(status["result"]["finalPr"].is_null());
    assert!(status["result"]["assurance"]["completed"].is_null());
    assert_eq!(
        status["result"]["inputRequired"], cleanup_input,
        "the cleanup hold remains inspectable until a clean retry"
    );
    let (code, detail) = env.forged(&[
        "work",
        "detail",
        "--subject-kind",
        "epic",
        "--subject-id",
        "epic-assurance-finalize-crash",
    ]);
    assert_eq!(code, 0, "Work Detail during cleanup gap: {detail}");
    assert_ne!(
        detail["result"]["status"]["state"],
        json!("submitted"),
        "no consumer may project terminal completion before cleanup: {detail}"
    );

    let mut terminal = Value::Null;
    for _ in 0..8 {
        let (code, tick) =
            env.forged(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"]);
        assert_eq!(code, 0, "assurance finalization recovery: {tick}");
        terminal = tick;
        if terminal["result"]["stopped"]["assurance"].is_object() {
            break;
        }
    }
    assert!(
        terminal["result"]["stopped"]["assurance"].is_object(),
        "replayed finalization did not complete: {terminal}"
    );
    assert_eq!(
        terminal["result"]["stopped"]["assurance"]["pr"]["number"],
        draft_pr["number"]
    );
    assert_eq!(
        terminal["result"]["stopped"]["assurance"]["pr"]["url"],
        draft_pr["url"]
    );
    assert!(!assurance_worktree.exists());
    assert!(
        !git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&assurance_worktree.to_string_lossy().into_owned()),
        "cleanup replay removes the worktree registration"
    );
    let (code, replayed) =
        env.forged(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(code, 0, "terminal cleanup replay: {replayed}");
    assert_eq!(
        replayed["result"]["stopped"]["assurance"]["pr"]["number"],
        draft_pr["number"]
    );
    assert!(!assurance_worktree.exists());

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.completed")
            .count(),
        1,
        "replay records one completion event"
    );
    let desired = ledger
        .get_desired_work(
            forged_ledger::DesiredSubjectKind::Epic,
            "epic-assurance-finalize-crash",
        )
        .expect("desired query")
        .expect("desired row");
    assert_eq!(desired.desired_state, forged_ledger::DesiredState::Stopped);
    assert_eq!(
        desired.last_outcome,
        Some(forged_ledger::DesiredReconcileOutcome::Terminal)
    );
    let events = ledger
        .list_events(Some("epic-assurance-finalize-crash"), 0, 65_536)
        .expect("epic events");
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.epic.input.required")
            .count(),
        2
    );
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.epic.input.resolved")
            .count(),
        2,
        "successful cleanup clears its typed input rail"
    );
    ledger.close().expect("close ledger");
    assert_eq!(rev_parse(&env.repos.origin, "main"), default_sha);

    let gh_calls = env.gh_calls();
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method POST")
                && call.join(" ").contains("/pulls"))
            .count(),
        1,
        "finalization recovery reuses the draft PR: {gh_calls:?}"
    );
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method PATCH")
                && call.join(" ").contains("/pulls/"))
            .count(),
        4,
        "each attempt clears stale approval before rechecking and publishing: {gh_calls:?}"
    );
    assert!(gh_calls.iter().all(|call| {
        !call.iter().any(|arg| arg == "merge") && !call.iter().any(|arg| arg == "ready")
    }));

    let unavailable_repo = env.root.join("repo-unavailable-after-completion");
    std::fs::rename(&env.repos.repo, &unavailable_repo)
        .expect("make repository unavailable after terminal completion");
    let (code, replayed_without_repo) =
        env.forged(&["epic", "advance", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(
        code, 0,
        "terminal replay must not touch the unavailable repository: {replayed_without_repo}"
    );
    assert_eq!(
        replayed_without_repo["result"]["stopped"]["assurance"]["pr"]["number"],
        draft_pr["number"]
    );
    let (code, terminal_status) =
        env.forged(&["epic", "status", "--epic", "epic-assurance-finalize-crash"]);
    assert_eq!(
        code, 0,
        "terminal status remains durable without the repository: {terminal_status}"
    );
    assert_eq!(
        terminal_status["result"]["finalPr"]["number"],
        draft_pr["number"]
    );
    assert!(terminal_status["result"]["inputRequired"].is_null());
}

#[cfg(feature = "failpoints")]
#[test]
fn assurance_finalization_crashes_replay_completion_and_cleanup() {
    assert_assurance_finalization_cleanup_recovery(false);
    assert_assurance_finalization_cleanup_recovery(true);
}

#[cfg(feature = "failpoints")]
#[test]
fn assurance_body_crash_then_drift_clears_stale_approval_before_stop() {
    let env = TestEnv::new("forged-rolling-assurance-finalize-crash-drift");
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-assurance-finalize-crash-drift",
        &[("child-assurance-finalize-crash-drift", &env.spec, false)],
    );
    env.set_work_field("child-assurance-finalize-crash-drift", "status", "closed");
    assert_eq!(env.forged(&["init"]).0, 0);
    let default_sha = rev_parse(&env.repos.origin, "main");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-assurance-finalize-crash-drift",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    env.authorize_epic("epic-assurance-finalize-crash-drift");
    assert_eq!(
        env.forged(&[
            "epic",
            "advance",
            "--epic",
            "epic-assurance-finalize-crash-drift",
        ])
        .0,
        0
    );
    let (code, draft) = env.forged(&[
        "epic",
        "advance",
        "--epic",
        "epic-assurance-finalize-crash-drift",
    ]);
    assert_eq!(code, 0, "draft PR: {draft}");
    let number = draft["result"]["progress"]["draftPr"]["number"]
        .as_u64()
        .expect("draft PR number");

    let mut crashed = false;
    for _ in 0..64 {
        let status = env
            .forged_cmd(&[
                "epic",
                "advance",
                "--epic",
                "epic-assurance-finalize-crash-drift",
            ])
            .env("FORGED_FAILPOINT", "epic.assurance.pr-body.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("assurance finalization tick");
        if !status.success() {
            crashed = true;
            break;
        }
    }
    assert!(crashed, "finalization must reach the PR-body crash seam");
    let body_path = env.gh_dir.join(format!("pr.{number}.body"));
    assert!(
        std::fs::read_to_string(&body_path)
            .expect("approved PR body")
            .contains("executed and integrally assured by forged"),
        "the crash seam must follow approval publication"
    );

    std::fs::write(env.gh_dir.join(format!("pr.{number}.head")), "main")
        .expect("drift PR head before replay");
    let (code, stopped) = env.forged(&[
        "epic",
        "advance",
        "--epic",
        "epic-assurance-finalize-crash-drift",
    ]);
    assert_eq!(code, 0, "crash-and-drift recovery: {stopped}");
    assert_eq!(
        stopped["result"]["stopped"]["code"],
        json!("assurance-final-evidence-mismatch"),
        "replay did not stop on final evidence drift: {stopped}"
    );
    let body = std::fs::read_to_string(&body_path).expect("recovered PR body");
    assert!(body.contains("has not completed integrated assurance"));
    assert!(body.contains("failed during crash recovery"));
    assert!(body.contains("Do not treat this pull request as assured"));
    assert!(!body.contains("executed and integrally assured by forged"));

    let ledger = env.ledger();
    assert_eq!(
        ledger
            .list_events(Some("epic-assurance-finalize-crash-drift"), 0, 65_536,)
            .expect("epic events")
            .iter()
            .filter(|event| event.kind == "forged.epic.assurance.completed")
            .count(),
        0,
        "drift recovery cannot record terminal assurance"
    );
    ledger.close().expect("close ledger");
    assert_eq!(rev_parse(&env.repos.origin, "main"), default_sha);
    let gh_calls = env.gh_calls();
    assert_eq!(
        gh_calls
            .iter()
            .filter(|call| call.join(" ").contains("--method POST")
                && call.join(" ").contains("/pulls"))
            .count(),
        1,
        "recovery reuses the original draft PR: {gh_calls:?}"
    );
    assert!(gh_calls.iter().all(|call| {
        !call.iter().any(|arg| arg == "merge") && !call.iter().any(|arg| arg == "ready")
    }));
}

#[test]
fn assurance_final_binding_drift_leaves_explicit_non_assured_body() {
    let env = TestEnv::new("forged-rolling-assurance-final-drift");
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-assurance-final-drift",
        &[("child-assurance-final-drift", &env.spec, false)],
    );
    env.set_work_field("child-assurance-final-drift", "status", "closed");
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-assurance-final-drift",
        "--repo",
        &repo,
        "--base-ref",
        "main",
        "--rolling",
    ]);
    assert_eq!(code, 0, "rolling start: {started}");
    env.authorize_epic("epic-assurance-final-drift");
    assert_eq!(
        env.forged(&["epic", "advance", "--epic", "epic-assurance-final-drift"])
            .0,
        0
    );
    let (code, draft) = env.forged(&["epic", "advance", "--epic", "epic-assurance-final-drift"]);
    assert_eq!(code, 0, "draft PR: {draft}");
    let number = draft["result"]["progress"]["draftPr"]["number"]
        .as_u64()
        .expect("draft PR number");

    // The shim moves the PR head after the assured-body PATCH. The finalizer
    // must catch that race in its post-publication readback and replace the
    // approval claim with explicit non-assured drift evidence.
    std::fs::write(env.gh_dir.join("drift-after-assured-update"), "main")
        .expect("arm finalization drift");
    let mut stopped = Value::Null;
    for _ in 0..64 {
        let (code, tick) = env.forged(&["epic", "advance", "--epic", "epic-assurance-final-drift"]);
        assert_eq!(code, 0, "assurance drift tick: {tick}");
        stopped = tick;
        if stopped["result"]["stopped"]["inputRequired"].is_object() {
            break;
        }
    }
    assert_eq!(
        stopped["result"]["stopped"]["inputRequired"]["code"],
        json!("assurance-finalization-drift"),
        "finalization did not stop on the raced binding: {stopped}"
    );
    let body = std::fs::read_to_string(env.gh_dir.join(format!("pr.{number}.body")))
        .expect("durable PR body");
    assert!(body.contains("has not completed integrated assurance"));
    assert!(body.contains("Final binding verification failed"));
    assert!(body.contains("Do not treat this pull request as assured"));
    assert!(!body.contains("executed and integrally assured by forged"));
    assert!(env.gh_calls().iter().all(|call| {
        !call.iter().any(|arg| arg == "merge") && !call.iter().any(|arg| arg == "ready")
    }));
}

#[test]
fn resolving_pre_cycle_planning_stop_never_opens_the_placeholder() {
    let env = TestEnv::new("forged-rolling-pre-cycle-resolve");
    reach_rolling_planning_boundary(&env);
    env.set_work_field(
        "child-stub",
        "dependencies",
        r#"[{"id":"late-blocker","dependency_type":"blocks","status":"closed"}]"#,
    );
    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "pre-cycle drift becomes typed input: {held}");
    assert_eq!(
        held["result"]["stopped"]["code"],
        json!("planning-graph-drift")
    );
    assert!(env
        .ledger()
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .iter()
        .all(|event| event.kind != "forged.epic.plan.started"));

    env.set_work_field("child-stub", "dependencies", "[]");
    let updates_before = planning_applies(&env, "child-stub");
    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-rolling",
        "--child",
        "child-stub",
        "--note",
        "the accidental dependency was removed; retry the planning boundary",
    ]);
    assert_eq!(code, 0, "resolve pre-cycle drift: {resolved}");
    assert_eq!(
        env.work_status("child-stub"),
        "blocked",
        "resolution must not materialize the placeholder"
    );
    assert_eq!(
        planning_applies(&env, "child-stub"),
        updates_before,
        "pre-cycle resolution performs no guarded apply"
    );

    let (code, restarted) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "planning retries after resolution: {restarted}");
    assert_eq!(
        restarted["result"]["progress"]["planning"]["childId"],
        json!("child-stub")
    );
}

#[test]
fn durable_planning_input_mismatch_is_child_addressed_and_preserved() {
    let env = TestEnv::new("forged-rolling-input-mismatch");
    start_rolling_plan(&env);
    let (code, prepared) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "prepare active planning run: {prepared}");
    assert!(prepared["result"]["progress"]["planningAdvanced"].is_object());
    let worktree = env.worktree("child-stub-epic-plan");
    assert!(worktree.exists());
    let input = env
        .anvil
        .join("runs/child-stub-epic-plan/planning-input.md");
    std::fs::write(&input, "partial planning input\n").expect("simulate surviving torn input");

    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "input mismatch becomes typed epic input: {held}");
    assert_eq!(
        held["result"]["stopped"]["code"],
        json!("planning-input-mismatch")
    );
    assert_eq!(held["result"]["stopped"]["childId"], json!("child-stub"));
    assert!(held["result"]["stopped"]["evidence"]["expectedSha256"].is_string());
    assert!(held["result"]["stopped"]["evidence"]["observedSha256"].is_string());
    assert_eq!(
        std::fs::read_to_string(&input).expect("preserved mismatch"),
        "partial planning input\n",
        "mismatched evidence is preserved for adjudication"
    );
    let (_, active) = env.forged(&["run", "status", "--run", "child-stub-epic-plan"]);
    assert_eq!(active["result"]["run"]["state"], json!("active"));

    #[cfg(feature = "failpoints")]
    for crash in 1..=2 {
        let status = env
            .forged_cmd(&[
                "epic",
                "resolve",
                "--epic",
                "epic-rolling",
                "--child",
                "child-stub",
                "--note",
                "discard the torn input and retry from its durable checkpoint",
            ])
            .env("FORGED_FAILPOINT", "run.settle.controller-revoked.after")
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .expect("crashing planning resolution");
        assert!(!status.success(), "settlement crash {crash} must fire");
        let (_, interrupted) = env.forged(&["run", "status", "--run", "child-stub-epic-plan"]);
        assert_eq!(interrupted["result"]["run"]["state"], json!("stopped"));
        assert_eq!(interrupted["result"]["run"]["outcome"], json!("cancelled"));
        assert!(
            worktree.exists(),
            "terminal state alone cannot authorize retirement after crash {crash}"
        );
        assert!(git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&worktree.to_string_lossy().into_owned()));
    }

    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-rolling",
        "--child",
        "child-stub",
        "--note",
        "discard the torn input and retry from its durable checkpoint",
    ]);
    assert_eq!(code, 0, "resolve active planning hold: {resolved}");
    let (_, stopped) = env.forged(&["run", "status", "--run", "child-stub-epic-plan"]);
    assert_eq!(stopped["result"]["run"]["state"], json!("stopped"));
    assert_eq!(
        stopped["result"]["run"]["outcome"],
        json!("cancelled"),
        "resolution fences the active cycle before cleanup"
    );
    assert!(!worktree.exists());
    assert!(!git(&env.repos.repo, &["worktree", "list", "--porcelain"])
        .contains(&worktree.to_string_lossy().into_owned()));
    let (code, restarted) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(
        code, 0,
        "restart after active-cycle resolution: {restarted}"
    );
    assert_eq!(
        restarted["result"]["progress"]["planning"]["runId"],
        json!("child-stub-epic-plan-g2")
    );
}

#[test]
fn rolling_plan_worktree_uses_the_persisted_integration_sha() {
    let env = TestEnv::new("forged-rolling-frozen-sha");
    start_rolling_plan(&env);
    let started = env
        .ledger()
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .into_iter()
        .find(|event| event.kind == "forged.epic.plan.started")
        .expect("planning checkpoint");
    let checkpoint: Value =
        serde_json::from_str(&started.payload_json).expect("planning checkpoint payload");
    let frozen = checkpoint["integrationSha"]
        .as_str()
        .expect("durable integration sha")
        .to_owned();
    assert_eq!(
        frozen,
        rev_parse(&env.repos.origin, "refs/heads/forged/epic-epic-rolling")
    );

    git(&env.repos.origin, &["checkout", "forged/epic-epic-rolling"]);
    std::fs::write(env.repos.origin.join("integration-drift.txt"), "drift\n")
        .expect("advance integration branch");
    git(&env.repos.origin, &["add", "integration-drift.txt"]);
    git(&env.repos.origin, &["commit", "-m", "advance integration"]);
    assert_ne!(
        frozen,
        rev_parse(&env.repos.origin, "refs/heads/forged/epic-epic-rolling")
    );

    let (code, refused) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_ne!(
        code, 0,
        "a moved integration ref must fail closed: {refused}"
    );
    assert!(refused["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("base sha mismatch")));
}

#[test]
fn blocking_plan_review_resolves_into_a_fresh_child_bound_cycle() {
    let env = TestEnv::new("forged-rolling-block-resolve");
    let gh_before_plan = start_rolling_plan(&env);
    env.set_scenario("epic-plan-review", "block", 1);

    let stopped = drive_internal_plan_to_stop(&env, "child-stub-epic-plan");
    assert_eq!(stopped["result"]["run"]["outcome"], json!("input-required"));
    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "project planning input: {held}");
    assert_eq!(
        held["result"]["stopped"]["childId"],
        json!("child-stub"),
        "input is child-addressed: {held}"
    );
    assert_eq!(
        held["result"]["stopped"]["code"],
        json!("planning-spec-amendment")
    );
    assert_eq!(
        held["result"]["stopped"]["evidence"]["protocolTerminal"]["specAmendmentProposed"]
            ["amendment"]["evidence"],
        json!("the frozen root excludes the required dependency mutation")
    );
    assert_eq!(env.gh_calls().len(), gh_before_plan);
    let first_worktree = env.worktree("child-stub-epic-plan");
    assert!(first_worktree.exists());
    assert!(git(&env.repos.repo, &["worktree", "list", "--porcelain"])
        .contains(&first_worktree.to_string_lossy().into_owned()));

    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-rolling",
        "--child",
        "child-stub",
        "--note",
        "root authority remains unchanged; keep the child scope",
    ]);
    assert_eq!(code, 0, "resolve blocked planning: {resolved}");
    assert!(
        !first_worktree.exists(),
        "resolution retires the rejected planning cycle before forgetting it"
    );
    assert!(
        !git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&first_worktree.to_string_lossy().into_owned()),
        "resolution removes the rejected cycle's worktree registration"
    );
    let (code, restarted) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "restart planning: {restarted}");
    assert_eq!(
        restarted["result"]["progress"]["planning"]["runId"],
        json!("child-stub-epic-plan-g2")
    );

    let redriven = drive_internal_plan_to_stop(&env, "child-stub-epic-plan-g2");
    assert_eq!(redriven["result"]["run"]["outcome"], json!("clean"));
    let (code, applied) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "apply resolved planning: {applied}");
    assert_eq!(
        applied["result"]["progress"]["childId"],
        json!("child-stub")
    );
}

#[test]
fn rolling_planning_package_remains_frozen_across_epic_roster_revisions() {
    let env = TestEnv::new("forged-rolling-plan-frozen-roster");
    env.add_uniform_roster("all-codex", "codex", "gpt-5.6-sol");
    start_rolling_plan(&env);
    let first_run = "child-stub-epic-plan";
    let first_definition = env
        .ledger()
        .get_run_definition(first_run)
        .expect("read first planning definition")
        .expect("first planning definition");
    env.set_scenario("epic-plan-review", "block", 1);
    let stopped = drive_internal_plan_to_stop(&env, first_run);
    assert_eq!(stopped["result"]["run"]["outcome"], json!("input-required"));
    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "project planning stop: {held}");
    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-rolling",
        "--child",
        "child-stub",
        "--note",
        "retry within the frozen planning contract",
    ]);
    assert_eq!(code, 0, "resolve first planning cycle: {resolved}");
    let (code, revised) = env.forged(&[
        "epic",
        "revise-roster",
        "--epic",
        "epic-rolling",
        "--roster",
        "all-codex",
        "--reason",
        "implementation provider unavailable",
    ]);
    assert_eq!(code, 0, "revise implementation roster: {revised}");
    let (code, restarted) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "start second planning cycle: {restarted}");
    assert_eq!(
        restarted["result"]["progress"]["planning"]["runId"],
        json!("child-stub-epic-plan-g2")
    );
    let second_definition = env
        .ledger()
        .get_run_definition("child-stub-epic-plan-g2")
        .expect("read second planning definition")
        .expect("second planning definition");
    assert_eq!(
        second_definition.package_sha256, first_definition.package_sha256,
        "implementation roster revisions must not rewrite the root-frozen planning package"
    );
    assert_eq!(
        second_definition.package_json, first_definition.package_json,
        "every planning cycle reuses the exact frozen package"
    );
}

#[test]
fn adjudicating_internal_plan_settlement_never_mutates_the_parent_epic_work() {
    let env = TestEnv::new("forged-rolling-plan-adjudication");
    start_rolling_plan(&env);
    let run = "child-stub-epic-plan";
    let ledger = env.ledger();
    ledger
        .append_event(
            Some(run),
            "forged.controller.started",
            json!({"scope": "run", "id": run, "generation": 1}),
        )
        .expect("legacy missing-identity controller evidence");
    ledger.close().expect("close ledger");
    let mutations = |env: &TestEnv| {
        let ledger = env.ledger();
        let count = ledger
            .list_events(None, 0, 65_536)
            .expect("events")
            .into_iter()
            .filter(|event| event.kind == "work.updated")
            .count();
        ledger.close().expect("close ledger");
        count
    };
    let before = mutations(&env);

    let (code, settled) = env.forged(&[
        "run",
        "adjudicate-settlement",
        "--run",
        run,
        "--outcome",
        "cancelled",
        "--actor",
        "operator",
        "--rationale",
        "internal planning controller identity was not recorded",
        "--evidence-gap",
        "controller.started carries no driver pid or start identity",
    ]);
    assert_eq!(
        code, 0,
        "adjudicate internal planning settlement: {settled}"
    );
    assert!(settled["result"]["bead"].is_null());
    assert_eq!(settled["result"]["worktreeRetired"], json!(false));
    assert!(
        env.anvil
            .join("runs")
            .join(run)
            .join("planning-input.md")
            .exists(),
        "the internal planning artifact directory is preserved"
    );
    assert_eq!(
        mutations(&env),
        before,
        "adjudication performs no parent or child work mutation"
    );
    assert_eq!(env.work_status("epic-rolling"), "open");
    assert_eq!(env.work_status("child-stub"), "blocked");

    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "epic consumes internal stop: {held}");
    assert_eq!(held["result"]["stopped"]["childId"], json!("child-stub"));
}

#[test]
fn rolling_epic_plans_applies_and_opens_the_next_wave_without_manual_handoff() {
    let env = TestEnv::new("forged-rolling-epic");
    let gh_before_plan = prepare_reviewed_rolling_plan(&env);

    let (code, applied) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "guarded apply: {applied}");
    assert_eq!(
        applied["result"]["progress"]["childId"],
        json!("child-stub")
    );
    assert!(!env.worktree("child-stub-epic-plan").exists());
    assert_eq!(env.gh_calls().len(), gh_before_plan);
    assert_eq!(env.work_status("child-stub"), "open");
    assert_eq!(
        env.work_field("child-stub", "description"),
        "planned context and outcome"
    );
    assert_eq!(
        env.work_field("child-stub", "acceptance"),
        "planned observable acceptance"
    );
    let (_, status) = env.forged(&["epic", "status", "--epic", "epic-rolling"]);
    let planned = status["result"]["children"]
        .as_array()
        .and_then(|children| children.iter().find(|child| child["id"] == "child-stub"))
        .expect("planned child status");
    assert_eq!(planned["planning"]["cycle"], json!(1));
    assert_eq!(planned["planning"]["target"], json!("child-stub"));
    assert_eq!(planned["planning"]["applied"], json!(true));
    assert!(planned["planning"]["preDigest"].is_string());
    assert!(planned["planning"]["postDigest"].is_string());
    assert!(planned["planning"]["postRevision"].is_string());
    let events = env
        .ledger()
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events");
    let started = events
        .iter()
        .find(|event| event.kind == "forged.epic.plan.started")
        .expect("planning checkpoint");
    let started: Value = serde_json::from_str(&started.payload_json).expect("started payload");
    assert!(started["integrationSha"].is_string());
    assert!(started["frozenInventory"]["members"].is_array());
    assert!(started["completedChildEvidence"].is_array());
    assert!(started["rootSnapshot"].is_object());
    assert!(started["targetSnapshot"].is_object());
    let applied_event = events
        .iter()
        .find(|event| event.kind == "forged.epic.plan.applied")
        .expect("applied event");
    let applied_event: Value =
        serde_json::from_str(&applied_event.payload_json).expect("applied payload");
    assert_eq!(
        applied_event["postReadback"]["revision"],
        applied_event["postRevision"]
    );
    assert_eq!(
        planned["planning"]["result"]["traceability"]["requirements"][0],
        json!("preserve the frozen epic outcome")
    );

    let (code, wave) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "automatic continuation: {wave}");
    assert_eq!(
        wave["result"]["progress"]["children"],
        json!(["child-stub", "child-next"]),
        "the applied stub becomes the next frozen wave without resolve/resubmit"
    );
    // The frontier read is an in-process query with no wire form; the
    // guarded apply's transaction is its own witness.
    assert_eq!(
        planning_applies(&env, "child-stub"),
        1,
        "exactly one guarded apply landed"
    );
}

#[test]
fn dirty_planning_worktree_blocks_apply_and_preserves_child_artifacts() {
    let env = TestEnv::new("forged-rolling-dirty-plan");
    prepare_reviewed_rolling_plan(&env);
    let worktree = env.worktree("child-stub-epic-plan");
    let dirty_path = worktree.join("provider-mutation.txt");
    std::fs::write(&dirty_path, "unexpected write\n").expect("dirty planning worktree");

    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "dirty worktree becomes typed epic input: {held}");
    assert_eq!(
        held["result"]["stopped"]["code"],
        json!("planning-worktree-not-clean")
    );
    assert_eq!(held["result"]["stopped"]["childId"], json!("child-stub"));
    assert!(worktree.exists(), "dirty artifacts remain for adjudication");
    assert_eq!(
        env.work_status("child-stub"),
        "blocked",
        "no Beads mutation crosses the dirty-worktree gate"
    );

    let (code, refused) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-rolling",
        "--child",
        "child-stub",
        "--note",
        "retry after preserving the provider artifact",
    ]);
    assert_ne!(code, 0, "dirty planning cleanup must refuse: {refused}");
    assert_eq!(refused["error"]["code"], json!("WORKTREE_DIRTY"));
    let (_, status) = env.forged(&["epic", "status", "--epic", "epic-rolling"]);
    assert_eq!(
        status["result"]["inputRequired"]["code"],
        json!("planning-worktree-not-clean"),
        "failed cleanup leaves the original adjudication hold durable"
    );
    assert!(worktree.exists(), "failed cleanup preserves the artifacts");
    assert!(env
        .ledger()
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .iter()
        .all(|event| event.kind != "forged.epic.input.resolved"));

    std::fs::remove_file(&dirty_path).expect("clean planning worktree");
    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-rolling",
        "--child",
        "child-stub",
        "--note",
        "retry after preserving the provider artifact",
    ]);
    assert_eq!(code, 0, "cleaned planning cycle resolves: {resolved}");
    assert!(!worktree.exists(), "clean retry retires the old cycle");
    assert!(
        !git(&env.repos.repo, &["worktree", "list", "--porcelain"])
            .contains(&worktree.to_string_lossy().into_owned()),
        "clean retry removes the old worktree registration"
    );
    let (code, restarted) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "cleaned planning cycle restarts: {restarted}");
    assert_eq!(
        restarted["result"]["progress"]["planning"]["runId"],
        json!("child-stub-epic-plan-g2")
    );
}

#[test]
fn assigned_blocked_stub_blocks_apply_and_preserves_child_artifacts() {
    let env = TestEnv::new("forged-rolling-assigned-plan");
    prepare_reviewed_rolling_plan(&env);
    env.set_work_field("child-stub", "assignee", "foreign-owner");
    let worktree = env.worktree("child-stub-epic-plan");

    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "assigned stub becomes typed epic input: {held}");
    assert_eq!(
        held["result"]["stopped"]["code"],
        json!("planning-stub-custody-changed")
    );
    assert_eq!(held["result"]["stopped"]["childId"], json!("child-stub"));
    assert!(
        worktree.exists(),
        "custody refusal preserves plan artifacts"
    );
    assert_eq!(
        env.work_status("child-stub"),
        "blocked",
        "no work mutation crosses the custody gate"
    );
    assert_eq!(
        planning_applies(&env, "child-stub"),
        0,
        "custody refusal performs no guarded apply"
    );
}

#[test]
fn structural_stub_drift_blocks_apply_with_exact_checkpoint_evidence() {
    let env = TestEnv::new("forged-rolling-structural-drift");
    prepare_reviewed_rolling_plan(&env);
    env.set_work_field("child-stub", "title", "Retitled outside the rolling cycle");
    let worktree = env.worktree("child-stub-epic-plan");

    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "structural drift becomes typed epic input: {held}");
    assert_eq!(
        held["result"]["stopped"]["code"],
        json!("planning-checkpoint-drift")
    );
    assert_eq!(held["result"]["stopped"]["childId"], json!("child-stub"));
    assert!(held["result"]["stopped"]["evidence"]["expected"]["targetSnapshot"].is_object());
    assert!(held["result"]["stopped"]["evidence"]["observed"]["targetSnapshot"].is_object());
    assert!(worktree.exists(), "drift preserves planning artifacts");
    assert_eq!(
        planning_applies(&env, "child-stub"),
        0,
        "structural drift performs no guarded apply"
    );
}

#[test]
fn root_drift_before_planning_checkpoint_stops_against_frozen_contract() {
    let env = TestEnv::new("forged-rolling-root-drift");
    reach_rolling_planning_boundary(&env);
    env.set_work_field(
        "epic-rolling",
        "description",
        "Changed outside the frozen epic contract",
    );
    env.set_work_field("child-next-blocker", "status", "closed");

    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "root drift becomes typed epic input: {held}");
    assert_eq!(
        held["result"]["stopped"]["code"],
        json!("planning-checkpoint-drift")
    );
    assert_eq!(held["result"]["stopped"]["childId"], json!("child-stub"));
    assert!(held["result"]["stopped"]["evidence"]["error"]
        .as_str()
        .is_some_and(|detail| detail.contains("changed since epic start")));
    assert!(env
        .ledger()
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .iter()
        .all(|event| event.kind != "forged.epic.plan.started"));
}

#[test]
fn root_revision_only_churn_does_not_hold_planning_or_apply() {
    let env = TestEnv::new("forged-rolling-root-revision-churn");
    reach_rolling_planning_boundary(&env);
    let frozen_revision = env.work_revision("epic-rolling");
    env.set_work_field("epic-rolling", "title", "Test epic");
    assert_ne!(
        env.work_revision("epic-rolling"),
        frozen_revision,
        "the unchanged semantic root must still receive a new write token"
    );
    env.set_work_field("child-next-blocker", "status", "closed");

    let (code, planning) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(
        code, 0,
        "revision-only churn must not hold planning: {planning}"
    );
    assert_eq!(
        planning["result"]["progress"]["planning"]["childId"],
        json!("child-stub")
    );

    let planned = drive_internal_plan_to_stop(&env, "child-stub-epic-plan");
    assert_eq!(planned["result"]["run"]["outcome"], json!("clean"));
    let planned_revision = env.work_revision("epic-rolling");
    env.set_work_field("epic-rolling", "title", "Test epic");
    assert_ne!(
        env.work_revision("epic-rolling"),
        planned_revision,
        "the unchanged semantic root must receive another write token before apply"
    );

    let (code, applied) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(
        code, 0,
        "revision-only churn must not hold guarded apply: {applied}"
    );
    assert_eq!(
        applied["result"]["progress"]["childId"],
        json!("child-stub")
    );
    assert!(env
        .ledger()
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .iter()
        .all(|event| event.kind != "forged.epic.input.required"));
}

#[test]
fn resolving_post_apply_implementation_failure_uses_ordinary_child_reset() {
    let env = TestEnv::new("forged-rolling-post-apply-reset");
    prepare_reviewed_rolling_plan(&env);
    let (code, applied) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "apply plan: {applied}");
    // Isolate the post-apply wave to the planned stub: hold the sibling off
    // the frontier again now that the apply has opened child-stub.
    env.set_work_field("child-next", "status", "blocked");
    let (code, wave) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "post-plan wave: {wave}");
    env.set_scenario("implement", "wait-release", 1);
    let (code, launched) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "launch planned child: {launched}");
    assert_eq!(
        launched["result"]["progress"]["launched"][0]["started"]["runId"],
        json!("child-stub")
    );
    let stopped = stop_run_when_kill_evidence_is_ready(
        &env,
        "child-stub",
        "fixture implementation failure after planning applied",
    );
    assert_eq!(stopped["result"]["outcome"], json!("cancelled"));
    let (code, held) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "implementation failure becomes input: {held}");
    assert_eq!(held["result"]["stopped"]["childId"], json!("child-stub"));

    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        "epic-rolling",
        "--child",
        "child-stub",
        "--note",
        "retry the implementation under the already-applied plan",
    ]);
    assert_eq!(code, 0, "ordinary implementation resolution: {resolved}");
    let events = env
        .ledger()
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events");
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "forged.epic.plan.started")
            .count(),
        1,
        "post-apply resolution does not restart planning"
    );
    assert!(events.iter().any(|event| {
        event.kind == "forged.epic.child.reset"
            && serde_json::from_str::<Value>(&event.payload_json)
                .is_ok_and(|payload| payload["childId"] == json!("child-stub"))
    }));
    let (code, relaunched) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "ordinary generation relaunch: {relaunched}");
    assert_eq!(
        relaunched["result"]["progress"]["launched"][0]["started"]["runId"],
        json!("child-stub-g2")
    );
}

#[cfg(feature = "failpoints")]
#[test]
fn rolling_plan_apply_recovers_exact_post_image_without_a_second_work_write() {
    let env = TestEnv::new("forged-rolling-apply-crash");
    prepare_reviewed_rolling_plan(&env);
    let mut crashed = env
        .forged_cmd(&["epic", "advance", "--epic", "epic-rolling"])
        .env("FORGED_FAILPOINT", "epic.plan.apply.after-beads")
        .env("FORGED_FAILPOINT_MODE", "crash")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("epic advance child");
    assert!(
        !crashed.wait().expect("epic advance crash").success(),
        "the process must abort after the Beads write"
    );

    assert_eq!(env.work_status("child-stub"), "open");
    assert_eq!(
        env.work_field("child-stub", "description"),
        "planned context and outcome"
    );
    let update_count = || planning_applies(&env, "child-stub");
    assert_eq!(update_count(), 1, "the guarded apply landed once");
    let ledger = env.ledger();
    let applied_before = ledger
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .into_iter()
        .filter(|event| event.kind == "forged.epic.plan.applied")
        .count();
    ledger.close().expect("close ledger");
    assert_eq!(applied_before, 0, "the crash precedes the epic event");

    let (code, recovered) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "recover exact post-image: {recovered}");
    assert_eq!(
        recovered["result"]["progress"]["apply"]["alreadyApplied"],
        json!(true)
    );
    assert_eq!(
        update_count(),
        1,
        "recovery must not repeat the Beads write"
    );
    let ledger = env.ledger();
    let applied = ledger
        .list_events(Some("epic-rolling"), 0, 65_536)
        .expect("epic events")
        .into_iter()
        .find(|event| event.kind == "forged.epic.plan.applied")
        .expect("applied event");
    let applied_payload: Value =
        serde_json::from_str(&applied.payload_json).expect("applied payload");
    ledger.close().expect("close ledger");
    assert!(applied_payload["observedRevision"].is_string());
    assert!(applied_payload["postRevision"].is_string());
    assert_eq!(
        applied_payload["postReadback"]["revision"],
        applied_payload["postRevision"]
    );
    assert_eq!(
        applied_payload["postDigest"],
        recovered["result"]["progress"]["postDigest"]
    );

    let (code, wave) = env.forged(&["epic", "advance", "--epic", "epic-rolling"]);
    assert_eq!(code, 0, "automatic continuation: {wave}");
    assert_eq!(
        wave["result"]["progress"]["children"],
        json!(["child-stub", "child-next"])
    );
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
    env.set_work_field("child-a", "priority", "0");
    env.set_work_field("child-b", "priority", "1");
    env.set_work_field("child-c", "priority", "9");
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
    // The whole launch order is part of the frozen wave. A later work edit
    // can affect a future frontier, but cannot reshuffle already-recorded
    // membership around a crash/restart boundary.
    env.set_work_field("child-c", "priority", "-1");
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
        // A loaded CI runner can take well over ten seconds to schedule the
        // detached child controller and its provider; bound a hang at the
        // same 30-second window used by the other detached-provider tests.
        for _ in 0..600 {
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
    env.seed_frontier("bead-session");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
    assert!(
        sessions.iter().all(|session| {
            session["identity"] == listed["result"]["identity"]
                && session["identity"]["subject"]["id"] == json!("bead-session")
                && session["identity"]["source"] == json!("durable")
        }),
        "every provider session inherits the run's exact durable identity: {listed}"
    );

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
    for work in ["bead-message-target", "bead-message-owner"] {
        env.seed_frontier(work);
        let (code, started) = env.forged(&[
            "run",
            "start",
            "--work",
            work,
            "--repo",
            &repo,
            "--spec",
            &spec,
            "--base-ref",
            "main",
            "--profile",
            "lean",
        ]);
        assert_eq!(code, 0, "start {work}: {started}");
        env.authorize_run(work);
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
    env.seed_frontier("bead-submit-singleton");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
    let adopted = responses
        .iter()
        .find(|response| response["result"]["alreadyRunning"] == json!(true))
        .expect("one submit adopts the live controller");
    assert_eq!(
        adopted["reused"],
        json!(false),
        "a fresh authorization is not an operation replay: {adopted}"
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
    env.seed_frontier("bead-roster-cycles");
    env.add_uniform_roster("outage", "codex", "gpt-5.6-sol");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
    env.seed_frontier("bead-e2e");
    assert_eq!(code, 0, "init: {init}");

    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
    // the run's one work lease — are told apart by their claimants and each
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

    // The run's work lease is held under the ONE derived per-run identity
    // (`run_holder`), which is what the bd heartbeat argv used to witness.
    // Renewal itself rides the attempt heartbeat every 25 polls (~5s) and is
    // covered by the lease-loss self-termination test; a 4-second stage
    // never reaches a renewal tick.
    let ledger = env.ledger();
    let lease = ledger
        .work_lease("bead-e2e")
        .expect("lease query")
        .expect("the run holds its work lease");
    assert_eq!(lease.holder, "forged:bead-e2e:0");
    assert_eq!(
        ledger
            .work_item("bead-e2e")
            .expect("work item")
            .expect("bead")
            .assignee
            .as_deref(),
        Some("forged:bead-e2e:0"),
        "custody and lease move together under one identity"
    );
    ledger.close().expect("close");

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
    lean.seed_frontier("bead-lean");
    lean.add_uniform_roster("all-claude", "claude", "opus");
    let repo = lean.repos.repo.to_string_lossy().into_owned();
    let spec = lean.spec.to_string_lossy().into_owned();
    let (code, started) = lean.forged(&[
        "run",
        "start",
        "--work",
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
    switched.seed_frontier("bead-switch");
    switched.add_uniform_roster("all-codex", "codex", "gpt-5.6-sol");
    let repo = switched.repos.repo.to_string_lossy().into_owned();
    let spec = switched.spec.to_string_lossy().into_owned();
    let (code, started) = switched.forged(&[
        "run",
        "start",
        "--work",
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
    env.seed_frontier("bead-fallback");
    env.add_implementation_fallback_roster("fallback");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
fn real_provider_timeout_falls_back_to_the_next_candidate() {
    let env = TestEnv::new("forged-timeout-fallback");
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read timeout config"))
            .expect("timeout config JSON");
    config["stage_budget_s"]["implement"] = json!(1);
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("timeout config JSON"),
    )
    .expect("write timeout config");
    env.add_uniform_roster("timeout-fallback", "claude", "opus");
    env.append_implementation_candidate("timeout-fallback", "codex", "gpt-5.6-sol");
    env.set_scenario("implement", "hang", 1);
    env.forged(&["init"]);
    env.seed_frontier("bead-timeout-fallback");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-timeout-fallback",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
        "--roster",
        "timeout-fallback",
    ]);
    assert_eq!(code, 0, "timeout fallback start: {started}");
    env.authorize_run("bead-timeout-fallback");
    for _ in 0..3 {
        let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-timeout-fallback"]);
        assert_eq!(code, 0, "timeout advance: {advanced}");
    }
    expire_latest_retry(&env, "bead-timeout-fallback");
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-timeout-fallback"]);
    assert_eq!(code, 0, "fallback drive: {driven}");

    let ledger = env.ledger();
    let first = ledger.get_attempt(1).expect("timed-out attempt");
    let second = ledger.get_attempt(2).expect("fallback attempt");
    assert!(first.claimant.starts_with("claude:"), "{first:?}");
    assert_eq!(first.state, forged_ledger::AttemptState::Failed);
    assert_eq!(
        first.revoke_scope,
        Some(forged_ledger::RevokeScope::Deadline)
    );
    assert!(first
        .fail_note
        .as_deref()
        .is_some_and(|note| note.starts_with("transport: stage deadline exceeded")));
    assert!(second.claimant.starts_with("codex:"), "{second:?}");
    assert_eq!(second.state, forged_ledger::AttemptState::Completed);
    assert_eq!(
        ledger
            .list_events(Some("bead-timeout-fallback"), 0, 1_000)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "proto.retry")
            .count(),
        1
    );
    ledger.close().expect("close ledger");
}

#[test]
fn real_provider_timeouts_exhaust_the_frozen_retry_budget() {
    let env = TestEnv::new("forged-timeout-exhaustion");
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read timeout config"))
            .expect("timeout config JSON");
    config["stage_budget_s"]["implement"] = json!(1);
    config["transport_retry_budget"] = json!(1);
    std::fs::write(
        &config_path,
        serde_json::to_vec_pretty(&config).expect("timeout config JSON"),
    )
    .expect("write timeout config");
    env.set_scenario("implement", "hang", 2);
    env.forged(&["init"]);
    env.seed_frontier("bead-timeout-exhaustion");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-timeout-exhaustion",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "timeout exhaustion start: {started}");
    env.authorize_run("bead-timeout-exhaustion");
    for _ in 0..3 {
        let (code, advanced) = env.forged(&["run", "advance", "--run", "bead-timeout-exhaustion"]);
        assert_eq!(code, 0, "first timeout advance: {advanced}");
    }
    expire_latest_retry(&env, "bead-timeout-exhaustion");
    let (code, second_timeout) =
        env.forged(&["run", "advance", "--run", "bead-timeout-exhaustion"]);
    assert_eq!(code, 0, "second timeout: {second_timeout}");
    let (code, exhausted) = env.forged(&["run", "drive", "--run", "bead-timeout-exhaustion"]);
    assert_eq!(code, 0, "exhaustion drive: {exhausted}");
    assert_eq!(
        exhausted["result"]["terminal"]["providerUnavailable"]["stage"],
        json!("implementation")
    );
    assert_eq!(
        exhausted["result"]["terminal"]["providerUnavailable"]["attempts"],
        json!(2)
    );

    let ledger = env.ledger();
    let attempts: Vec<_> = (1..=2)
        .map(|attempt_id| ledger.get_attempt(attempt_id).expect("timeout attempt"))
        .collect();
    assert!(attempts.iter().all(|attempt| {
        attempt.state == forged_ledger::AttemptState::Failed
            && attempt.revoke_scope == Some(forged_ledger::RevokeScope::Deadline)
    }));
    assert_eq!(
        ledger
            .list_events(Some("bead-timeout-exhaustion"), 0, 1_000)
            .expect("events")
            .iter()
            .filter(|event| event.kind == "proto.retry")
            .count(),
        2,
        "each timed-out attempt is charged exactly once"
    );
    ledger.close().expect("close ledger");
}

#[test]
fn roster_revision_resets_transport_fallback_to_its_first_candidate() {
    let env = TestEnv::new("forged-roster-revision-fallback");
    env.forged(&["init"]);
    env.seed_frontier("bead-revision-fallback");
    env.add_uniform_roster("revised-order", "claude", "opus");
    env.append_implementation_candidate("revised-order", "codex", "gpt-5.6-sol");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
    env.seed_frontier("bead-high");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
fn synthetic_review_failure_is_honest_and_both_new_terminals_accept_risk() {
    let env = TestEnv::new("forged-review-terminal-exits");
    env.forged(&["init"]);
    env.seed_frontier("bead-review-provenance");
    env.seed_frontier("bead-done-risk");
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
                {"id": "review-2", "role": "review.secondary", "purpose": "review"},
                {"id": "remediation", "role": "remediation", "purpose": "fix"}
            ],
            "riskContext": "Exercise review verdict provenance.",
            "fixRoundBudget": 1,
            "escalateOn": []
        }
    });
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("config json"),
    )
    .expect("write config");
    env.set_scenario("reviewclaude", "approve", 1);
    env.set_scenario("reviewcodex", "no-block", 1);
    env.set_scenario("fix", "no-block", 1);

    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-review-provenance",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start: {started}");
    env.authorize_run("bead-review-provenance");
    let (code, driven) = env.forged(&["run", "drive", "--run", "bead-review-provenance"]);
    assert_eq!(code, 0, "drive: {driven}");
    assert_eq!(
        driven["result"]["terminal"]["remediationFailed"],
        json!({
            "round": 1,
            "finalVerdict": "requestChanges",
            "finalVerdictDurable": false,
            "failedReviewSeats": 1,
        }),
        "control still fails closed, but the synthetic verdict is attributed"
    );

    let (_, status) = env.forged(&["run", "status", "--run", "bead-review-provenance"]);
    assert_eq!(status["result"]["run"]["outcome"], json!("blocked"));
    assert_eq!(
        status["result"]["run"]["stopReason"],
        json!("verdict unavailable: 1 review seat(s) failed without a result")
    );
    let (_, events) = env.forged(&["events", "--run", "bead-review-provenance"]);
    let durable_verdicts = events["result"]["events"]
        .as_array()
        .expect("events")
        .iter()
        .filter(|event| event["kind"] == json!("forged.review.seat.settled"))
        .map(|event| event["payload"]["verdict"].clone())
        .collect::<Vec<_>>();
    assert_eq!(durable_verdicts, vec![json!("approve")]);

    let (code, accepted) = env.forged(&[
        "run",
        "accept-risk",
        "--run",
        "bead-review-provenance",
        "--accepted-by",
        "lead-agent",
        "--rationale",
        "the failed review seat is bounded by deployment controls",
    ]);
    assert_eq!(code, 0, "accept remediation-failed risk: {accepted}");
    assert_eq!(accepted["result"]["reviewRounds"], json!(1));

    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-done-risk",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start done fixture: {started}");
    let ledger = env.ledger();
    ledger
        .append_event_kind_once(
            "bead-done-risk",
            "run.protocol-terminal",
            json!({
                "schemaVersion": 1,
                "terminal": {
                    "done": {
                        "reviewRounds": 4,
                        "finalVerdict": "block",
                    }
                }
            }),
        )
        .expect("done terminal");
    ledger
        .settle_run(
            "bead-done-risk",
            forged_ledger::RunOutcome::Blocked,
            "protocol exhausted its review rounds with verdict block".to_owned(),
            None,
            None,
            None,
        )
        .expect("block done fixture");
    ledger.close().expect("close ledger");

    let (code, accepted) = env.forged(&[
        "run",
        "accept-risk",
        "--run",
        "bead-done-risk",
        "--accepted-by",
        "lead-agent",
        "--rationale",
        "the blocking verdict is accepted for this deployment",
    ]);
    assert_eq!(code, 0, "accept non-approve done risk: {accepted}");
    assert_eq!(accepted["result"]["reviewRounds"], json!(4));
}

#[test]
fn review_budget_above_one_exhausts_exactly_and_accept_risk_is_durable() {
    let env = TestEnv::new("forged-review-budget");
    env.forged(&["init"]);
    env.seed_frontier("bead-round-budget");
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
            "--work",
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
    env.seed_frontier("bead-amendment");
    env.set_scenario("implement", "spec-amendment", 1);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    assert_eq!(
        env.forged(&[
            "run",
            "start",
            "--work",
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
    gate.seed_frontier("bead-gate-edge");
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
            "--work",
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
    conflict.seed_frontier("bead-conflict-edge");
    let repo = conflict.repos.repo.to_string_lossy().into_owned();
    let spec = conflict.spec.to_string_lossy().into_owned();
    assert_eq!(
        conflict
            .forged(&[
                "run",
                "start",
                "--work",
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
    env.seed_frontier("legacy-policy-run");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
fn stored_old_policy_with_an_excessive_budget_fails_before_execution() {
    let env = TestEnv::new("forged-old-package-budget-bound");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_frontier("old-package-budget-bound");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "old-package-budget-bound",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start: {started}");

    // Emulate a package frozen by the prior binary: the old shape has no
    // terminationGraceS and accepted an unbounded u64 stage budget.
    let db = env.anvil.join("state.db");
    let connection = rusqlite::Connection::open(&db).expect("open old-package fixture");
    let package_json: String = connection
        .query_row(
            "SELECT package_json FROM run_definitions WHERE run_id = ?1",
            ["old-package-budget-bound"],
            |row| row.get(0),
        )
        .expect("stored package");
    let mut package: Value = serde_json::from_str(&package_json).expect("package JSON");
    package["policy"]["stageBudgetS"]["implement"] = json!(u64::MAX);
    package["policy"]
        .as_object_mut()
        .expect("policy object")
        .remove("terminationGraceS");
    let (package_json, package_sha256) = canonical_json_and_sha(&package);
    connection
        .execute(
            "UPDATE run_definitions SET package_json = ?1, package_sha256 = ?2 WHERE run_id = ?3",
            rusqlite::params![package_json, package_sha256, "old-package-budget-bound"],
        )
        .expect("install old package");
    drop(connection);

    let (code, rejected) = env.forged(&["run", "advance", "--run", "old-package-budget-bound"]);
    assert_eq!(code, 1, "invalid stored policy must fail: {rejected}");
    assert_eq!(rejected["error"]["code"], json!("INTERNAL"));
    assert_eq!(
        rejected["error"]["message"],
        json!(concat!(
            "projection: projected execution policy is invalid at ",
            "$.policy.stageBudgetS.Implement: stage budget must fit the packet ",
            "contract's 32-bit seconds field"
        ))
    );
    assert!(
        env.provider_log().is_empty(),
        "no provider effect may start"
    );
    let ledger = env.ledger();
    assert!(
        ledger
            .list_live_attempts(Some("old-package-budget-bound"))
            .expect("attempts")
            .is_empty(),
        "invalid stored policy must fail before an attempt or reservation"
    );
    ledger.close().expect("close ledger");
}

#[test]
fn pre_upgrade_run_start_operation_replays_with_its_legacy_request_hash() {
    let env = TestEnv::new("forged-legacy-run-start-replay");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_frontier("legacy-start-replay");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let args = [
        "run",
        "start",
        "--work",
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
    env.seed_frontier("bead-frozen");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
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
    env.set_work_field(
        "roster-child-two",
        "dependencies",
        r#"[{"id":"roster-child-two-blocker","dependency_type":"blocks","status":"open"}]"#,
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
    env.set_work_field("roster-child-two-blocker", "status", "closed");
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
    env.seed_frontier("bead-sem");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    env.forged(&[
        "run",
        "start",
        "--work",
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
    env.seed_frontier("bead-tr");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    env.forged(&[
        "run",
        "start",
        "--work",
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
    // No `provider.pid` inside the wait window means no revocable identity:
    // an unidentified provider stops renewing the work lease while still
    // writing to the worktree — another worker would reclaim its
    // apparently-expired work. The spawn is treated as failed: the session
    // is killed, the packet fails `transport:`, and the transport-retry
    // budget decides what happens next.
    let env = TestEnv::new("forged-e2e-nopid");
    env.forged(&["init"]);
    env.seed_frontier("bead-nopid");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    env.forged(&[
        "run",
        "start",
        "--work",
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
    env.seed_frontier("bead-rec");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    env.forged(&[
        "run",
        "start",
        "--work",
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

/// A replayed start must present the same canonical baseRef bytes the first
/// invocation froze: normalization applies on every pass, and only the
/// origin probe is skipped once durable state exists. Before this held, the
/// identical command refused with IdempotencyConflict after STARTED.
#[test]
fn an_origin_prefixed_base_ref_start_replays_identically() {
    let env = TestEnv::new("forged-epic-base-ref-replay");
    env.seed_epic("epic-replay", &[("child-r1", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let args = [
        "epic",
        "start",
        "--epic",
        "epic-replay",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "origin/main",
    ];
    let (code, started) = env.forged(&args);
    assert_eq!(code, 0, "first start: {started}");
    assert_eq!(started["result"]["baseRef"], json!("main"));
    let (code, replayed) = env.forged(&args);
    assert_eq!(code, 0, "identical replay: {replayed}");
}

/// One derived execution-health verdict on every operator surface, and the
/// wave-level deferral summary that makes single-writer serialization read
/// as expected behavior instead of a stall.
#[test]
fn execution_health_and_deferrals_read_from_every_surface() {
    let env = TestEnv::new("forged-epic-health");
    env.enable_dynamic_gh();
    env.seed_epic(
        "epic-defer",
        &[("child-d1", &env.spec, true), ("child-d2", &env.spec, true)],
    );
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-defer",
        "--repo",
        &repo,
        "--spec",
        &spec,
    ]);
    assert_eq!(code, 0, "epic start: {started}");

    // Started but never submitted: the verdict says so, and no desired row
    // or failure is invented.
    let (code, unsubmitted) = env.forged(&["epic", "status", "--epic", "epic-defer"]);
    assert_eq!(code, 0, "{unsubmitted}");
    assert_eq!(
        unsubmitted["result"]["executionHealth"],
        json!("unsubmitted")
    );
    assert!(unsubmitted["result"]["desired"].is_null());
    assert!(unsubmitted["result"]["lastControllerFailure"].is_null());
    assert_eq!(unsubmitted["result"]["deferred"], json!({}));

    // A standalone hang run holds the single repository-write slot with
    // settled custody BEFORE the epic dispatches: racing the epic's own
    // children against each other is not deterministic (a slow child spawn
    // releases and re-admits the slot), but a provider that is already live
    // holds it for the whole observation.
    env.set_scenario("implement", "hang", 1);
    env.seed_frontier("blocker-writer");
    let (code, blocker) = env.forged(&[
        "run",
        "start",
        "--work",
        "blocker-writer",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "blocker start: {blocker}");
    env.authorize_run("blocker-writer");
    let (code, blocker_submitted) = env.forged(&["run", "submit", "--run", "blocker-writer"]);
    assert_eq!(code, 0, "blocker submit: {blocker_submitted}");
    // The provider start line IS the custody proof: once the hang provider
    // is live it holds the repository-write slot for the whole observation.
    wait_for(
        &env,
        &["run", "status", "--run", "blocker-writer"],
        |value| {
            value["result"]["run"]["state"].is_string()
                && env
                    .provider_log()
                    .iter()
                    .any(|line| line.contains("blocker-writer/implementation/0 start "))
        },
    );

    let (code, submitted) = env.forged(&["epic", "submit", "--epic", "epic-defer"]);
    assert_eq!(code, 0, "epic submit: {submitted}");
    assert_eq!(submitted["result"]["phase"], json!("spawned"));
    assert_eq!(submitted["result"]["controlRevision"], json!(1));

    // Both ready wave-1 children collide with the held repository-write
    // slot: they defer, and the wave-level summary says why without
    // diffing per-child admission blobs.
    let status = wait_for(&env, &["epic", "status", "--epic", "epic-defer"], |value| {
        value["result"]["deferred"]["repository-write-capacity"] == json!(2)
    });
    assert_eq!(status["result"]["executionHealth"], json!("running"));
    let children = status["result"]["children"].as_array().expect("children");
    for id in ["child-d1", "child-d2"] {
        let child = children
            .iter()
            .find(|child| child["id"] == json!(id))
            .unwrap_or_else(|| panic!("child {id} in status: {status}"));
        assert_eq!(
            child["executionHealth"],
            json!("queued"),
            "the deferred child reads queued: {status}"
        );
    }

    // The portfolio row carries the same derived verdict.
    let (code, operations) = env.forged(&["operations", "overview"]);
    assert_eq!(code, 0, "{operations}");
    let entry = operations["result"]["queue"]["groups"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|group| group["entries"].as_array())
        .flatten()
        .find(|entry| entry["id"] == json!("epic-defer"))
        .cloned()
        .unwrap_or_else(|| panic!("epic entry in operations: {operations}"));
    assert!(
        entry["executionHealth"].is_string(),
        "portfolio verdict present: {entry}"
    );

    // And the work-detail status block.
    let (code, detail) = env.forged(&["work", "detail", "--id", "epic-defer"]);
    assert_eq!(code, 0, "{detail}");
    assert!(
        detail["result"]["status"]["executionHealth"].is_string(),
        "work detail verdict present: {detail}"
    );

    // Wind down: pause scheduling first so nothing new dispatches, then stop
    // the hanging child with the typed kill path. The paused verdict is
    // durable the moment the pause event lands — it never waits on the
    // detached controller's own exit cadence.
    let (code, paused) = env.forged(&[
        "epic",
        "pause",
        "--epic",
        "epic-defer",
        "--reason",
        "test wind-down",
    ]);
    assert_eq!(code, 0, "{paused}");
    stop_run_when_kill_evidence_is_ready(&env, "blocker-writer", "test wind-down");
    let held = wait_for(&env, &["epic", "status", "--epic", "epic-defer"], |value| {
        value["result"]["paused"].is_object()
    });
    assert_eq!(held["result"]["executionHealth"], json!("paused"));

    // Fixture teardown, not semantics: the paused detached controller exits
    // on its own schedule, so reap its process group directly rather than
    // waiting out that cadence.
    let record: Value = serde_json::from_slice(
        &std::fs::read(env.anvil.join("runs/epic-defer/controller/controller.json"))
            .expect("epic controller record"),
    )
    .expect("controller JSON");
    if let Some(pid) = record["driver"]["pid"]
        .as_i64()
        .and_then(|pid| i32::try_from(pid).ok())
    {
        let group = nix::unistd::Pid::from_raw(-pid);
        let _ = nix::sys::signal::kill(group, nix::sys::signal::Signal::SIGKILL);
    }
}

/// A released start attempt frees its operations row while the recorded
/// `proto.operation.request` event survives. The corrected retry must take
/// the next released-epoch key instead of appending a second, differing
/// payload under the released one.
#[test]
fn a_released_epic_start_never_reuses_its_request_key() {
    let env = TestEnv::new("forged-epic-start-release-epoch");
    env.seed_epic("epic-epoch", &[("child-one", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();

    // An unknown profile fails INSIDE the fenced effect: the request event
    // is durable and the operation releases.
    let (code, failed) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-epoch",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--profile",
        "nonexistent-profile",
    ]);
    assert_ne!(code, 0, "{failed}");

    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-epoch",
        "--repo",
        &repo,
        "--spec",
        &spec,
    ]);
    assert_eq!(code, 0, "corrected start: {started}");
    assert_eq!(started["result"]["schema"], json!("forged.epic/1"));

    let ledger = env.ledger();
    let events = ledger
        .list_events(Some("epic-epoch"), 0, 65_536)
        .expect("epic events");
    let request_keys: Vec<String> = events
        .iter()
        .filter(|row| row.kind == "proto.operation.request")
        .filter_map(|row| serde_json::from_str::<serde_json::Value>(&row.payload_json).ok())
        .filter(|payload| payload["name"] == json!("epic_start"))
        .filter_map(|payload| payload["idempotencyKey"].as_str().map(str::to_owned))
        .collect();
    let released = events
        .iter()
        .filter(|row| row.kind == "operation.released")
        .count();
    ledger.close().expect("close");
    assert_eq!(released, 1, "{request_keys:?}");
    assert_eq!(request_keys.len(), 2, "{request_keys:?}");
    assert_ne!(request_keys[0], request_keys[1], "{request_keys:?}");
    assert!(
        request_keys[1].ends_with(":1"),
        "the corrected start takes the next released epoch: {request_keys:?}"
    );
}

/// An explicitly keyed attempt that releases occupies its own key. Only the
/// derived series advances the default start epoch — otherwise one explicit
/// release would strand every future keyless replay past its stored row.
#[test]
fn explicit_key_releases_never_advance_the_default_start_epoch() {
    let env = TestEnv::new("forged-epic-start-explicit-epoch");
    env.seed_epic("epic-noise", &[("child-one", &env.spec, true)]);
    assert_eq!(env.forged(&["init"]).0, 0);
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();

    let ledger = env.ledger();
    ledger
        .append_event(
            Some("epic-noise"),
            "operation.released",
            json!({
                "operationId": "operator-custom-key",
                "name": "epic_start",
                "idempotencyKey": "operator-custom-key",
            }),
        )
        .expect("seed explicit-key release");
    ledger.close().expect("close");

    // The keyless failing start still takes the bare historical key.
    let (code, failed) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-noise",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--profile",
        "nonexistent-profile",
    ]);
    assert_ne!(code, 0, "{failed}");
    assert_eq!(
        failed["operationId"],
        json!("op:epic_start:epic-noise:-:-"),
        "{failed}"
    );

    // The corrected keyless retry counts ONLY the derived release.
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        "epic-noise",
        "--repo",
        &repo,
        "--spec",
        &spec,
    ]);
    assert_eq!(code, 0, "{started}");
    assert_eq!(
        started["operationId"],
        json!("op:epic_start:epic-noise:-:1"),
        "{started}"
    );
}

#[test]
fn a_reclaimed_work_lease_self_terminates_the_attempt_with_frozen_evidence() {
    // The two behaviours that replaced the guardian, proved end to end:
    // (1) the work lease is RENEWED mid-attempt on the 25-beat heartbeat
    // cadence, and (2) a renewal refused because the lease was reclaimed
    // out from under the attempt self-terminates it exactly like a
    // revocation — provider confirmed dead, capture frozen, and the attempt
    // settled durably so the packet never strands with a live attempt.
    let env = TestEnv::new("forged-e2e-lease-loss");
    env.forged(&["init"]);
    env.seed_frontier("bead-lease-loss");
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "bead-lease-loss",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "run start: {started}");
    env.authorize_run("bead-lease-loss");
    env.set_scenario("implement", "wait-release", 1);

    // Resolve + open, then execute in the background: the provider holds at
    // wait-release, so the attempt outlives several heartbeat ticks.
    for _ in 0..2 {
        let (code, resp) = env.forged(&["run", "advance", "--run", "bead-lease-loss"]);
        assert_eq!(code, 0, "run advance: {resp}");
    }
    let mut executing = env
        .forged_cmd(&["run", "advance", "--run", "bead-lease-loss"])
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .expect("background execute step");

    let lease_of = || {
        let ledger = env.ledger();
        let lease = ledger.work_lease("bead-lease-loss").expect("lease read");
        ledger.close().expect("close");
        lease
    };
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(30);
    let initial = loop {
        if let Some(lease) = lease_of() {
            break lease;
        }
        assert!(
            std::time::Instant::now() < deadline,
            "the executing attempt never took its work lease"
        );
        std::thread::sleep(std::time::Duration::from_millis(100));
    };
    assert_eq!(initial.holder, "forged:bead-lease-loss:0");

    // (1) Renewal: the 25-beat cadence (~5s at the 200ms poll) pushes
    // `expires_at` forward while the provider holds.
    let renew_deadline = std::time::Instant::now() + std::time::Duration::from_secs(20);
    loop {
        match lease_of() {
            Some(lease) if lease.expires_at > initial.expires_at => break,
            _ => {}
        }
        assert!(
            std::time::Instant::now() < renew_deadline,
            "the attempt heartbeat never renewed the work lease"
        );
        std::thread::sleep(std::time::Duration::from_millis(250));
    }

    // (2) Reclaim the lease out from under the live attempt: force expiry
    // (the scoped reclaim refuses an unexpired lease) and reclaim under the
    // recorded holder — exactly what a successor's claim-next would do.
    {
        let connection =
            rusqlite::Connection::open(env.anvil.join("state.db")).expect("open state.db");
        connection
            .execute(
                "UPDATE work_leases SET expires_at = '2020-01-01T00:00:00.000000000Z' \
                 WHERE work_id = 'bead-lease-loss'",
                [],
            )
            .expect("force lease expiry");
    }
    let ledger = env.ledger();
    let reclaimed = ledger
        .reclaim_work_lease("bead-lease-loss", "forged:bead-lease-loss:0", 0)
        .expect("scoped reclaim");
    ledger.close().expect("close");
    assert_eq!(
        reclaimed.previous_owner.as_deref(),
        Some("forged:bead-lease-loss:0"),
        "the reclaim fired"
    );

    // The next renewal tick refuses and the attempt self-terminates: the
    // background execute step exits on its own, no release file ever
    // written.
    let exit_deadline = std::time::Instant::now() + std::time::Duration::from_secs(30);
    loop {
        match executing.try_wait().expect("poll execute step") {
            Some(_) => break,
            None => {
                assert!(
                    std::time::Instant::now() < exit_deadline,
                    "the attempt did not self-terminate after lease loss"
                );
                std::thread::sleep(std::time::Duration::from_millis(250));
            }
        }
    }

    // Durable settlement: no live attempt remains, and the failure names
    // the lease loss.
    let ledger = env.ledger();
    let live = ledger
        .list_live_attempts(Some("bead-lease-loss"))
        .expect("live");
    assert!(
        live.is_empty(),
        "the packet must not strand with a live attempt: {live:?}"
    );
    ledger.close().expect("close");
    let (_, events) = env.forged(&["events", "--run", "bead-lease-loss"]);
    let rows = events["result"]["events"]
        .as_array()
        .expect("events")
        .clone();
    assert!(
        rows.iter().any(|event| {
            event["kind"] == json!("attempt.state")
                && event["payload"]["new"] == json!("failed")
                && event["payload"]["reason"]
                    .as_str()
                    .is_some_and(|reason| reason.starts_with("work lease lost:"))
        }),
        "the attempt settled with the lease-loss note: {rows:?}"
    );
    // Capture froze: the attempt's provider files were finalized.
    let manifest = env
        .packet_dir("bead-lease-loss", "implementation", 0)
        .join("attempts/1");
    assert!(manifest.exists(), "the attempt's capture directory exists");
}
