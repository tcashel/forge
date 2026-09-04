mod support;

use std::process::{Child, Stdio};
use std::time::{Duration, Instant};

use forged_ledger::RunOutcome;
use serde_json::{json, Value};
use support::{fabricate_run, McpClient, TestEnv};

fn spawn_wait(env: &TestEnv, args: &[&str]) -> Child {
    env.forged_cmd(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("wait process starts")
}

fn finish_wait(child: Child) -> (i32, Value) {
    let output = child.wait_with_output().expect("wait process exits");
    let code = output.status.code().unwrap_or(1);
    let stdout = String::from_utf8(output.stdout).expect("wait stdout is utf-8");
    let value = serde_json::from_str(stdout.trim()).unwrap_or_else(|error| {
        panic!(
            "wait stdout is an operation envelope ({error}): stdout={stdout:?} stderr={:?}",
            String::from_utf8_lossy(&output.stderr)
        )
    });
    (code, value)
}

#[test]
fn stage_waits_use_the_run_cursor_and_work_tuple() {
    let env = TestEnv::new("forged-wait-stage");
    env.forged(&["init"]);
    fabricate_run(&env, "wait-quiet");
    fabricate_run(&env, "wait-event");
    env.ensure_work_item("wait-revision");
    env.ensure_work_item("wait-status");

    let quiet = spawn_wait(&env, &["wait", "--id", "wait-quiet", "--timeout", "1"]);
    let event = spawn_wait(&env, &["wait", "--id", "wait-event", "--timeout", "5"]);
    let revision = spawn_wait(&env, &["wait", "--id", "wait-revision", "--timeout", "5"]);
    let status = spawn_wait(&env, &["wait", "--id", "wait-status", "--timeout", "5"]);

    std::thread::sleep(Duration::from_millis(1_500));
    let ledger = env.ledger();
    ledger
        .append_event(
            Some("wait-event"),
            "forged.packet.stage.changed",
            json!({"stage": "review"}),
        )
        .expect("append stage event");
    ledger.close().expect("close event writer");
    env.set_work_field("wait-revision", "description", "revision two");
    env.set_work_field("wait-status", "status", "blocked");

    let (code, quiet) = finish_wait(quiet);
    assert_eq!(code, 0, "quiet wait: {quiet}");
    assert_eq!(quiet["result"]["changed"], json!(false), "{quiet}");
    assert_eq!(quiet["result"]["explain"]["kind"], json!("run"));

    for (label, child) in [("event", event), ("revision", revision), ("status", status)] {
        let (code, response) = finish_wait(child);
        assert_eq!(code, 0, "{label} wait: {response}");
        assert_eq!(response["result"]["changed"], json!(true), "{response}");
        assert_eq!(response["result"]["schema"], json!("forged.wait/1"));
        assert_eq!(
            response["result"]["explain"]["schema"],
            json!("forged.explain/1")
        );
    }
}

#[test]
fn invalid_ids_and_timeout_bounds_refuse_immediately_with_recovery() {
    let env = TestEnv::new("forged-wait-refusals");
    env.forged(&["init"]);
    fabricate_run(&env, "wait-ambiguous-one");
    fabricate_run(&env, "wait-ambiguous-two");

    for id in ["wait-missing", "wait-ambiguous"] {
        let started = Instant::now();
        let (code, response) = env.forged(&["wait", "--id", id, "--timeout", "10"]);
        assert_eq!(code, 1, "{response}");
        assert!(started.elapsed() < Duration::from_secs(2), "{response}");
        assert_eq!(response["error"]["code"], json!("INVALID_REQUEST"));
        assert_eq!(response["error"]["detail"]["query"], json!(id));
        assert_eq!(
            response["error"]["detail"]["remedy"]["schema"],
            json!("forged.remedy/1")
        );
        assert_eq!(
            response["error"]["detail"]["remedy"]["verb"],
            json!("explain")
        );
        if id == "wait-ambiguous" {
            assert_eq!(
                response["error"]["detail"]["candidates"]
                    .as_array()
                    .map(Vec::len),
                Some(2)
            );
        }
    }

    for timeout in ["0", "-1", "4000"] {
        let (code, response) =
            env.forged(&["wait", "--id", "wait-ambiguous-one", "--timeout", timeout]);
        assert_eq!(code, 1, "{response}");
        assert_eq!(response["error"]["code"], json!("INVALID_REQUEST"));
        assert!(
            response["error"]["message"]
                .as_str()
                .is_some_and(|message| message.contains("between 1 and 3600")),
            "{response}"
        );
    }
}

#[test]
fn decision_wait_uses_the_five_second_subject_fold() {
    let env = TestEnv::new("forged-wait-decision");
    env.forged(&["init"]);
    fabricate_run(&env, "wait-decision");
    let started = Instant::now();
    let waiting = spawn_wait(
        &env,
        &[
            "wait",
            "--id",
            "wait-decision",
            "--until",
            "decision",
            "--timeout",
            "7",
        ],
    );
    std::thread::sleep(Duration::from_millis(1_500));
    let ledger = env.ledger();
    ledger
        .append_event(
            Some("wait-decision"),
            "forged.epic.input.required",
            json!({"code": "choice", "detail": "pick one"}),
        )
        .expect("append decision source");
    ledger.close().expect("close decision writer");

    let (code, response) = finish_wait(waiting);
    assert_eq!(code, 0, "{response}");
    assert_eq!(response["result"]["changed"], json!(true), "{response}");
    assert!(started.elapsed() >= Duration::from_millis(4_500));
    assert!(started.elapsed() < Duration::from_secs(7));
}

#[test]
fn terminal_wait_and_mcp_return_the_same_shape_and_text_reuses_explain() {
    let env = TestEnv::new("forged-wait-terminal");
    env.forged(&["init"]);
    fabricate_run(&env, "wait-terminal");
    let ledger = env.ledger();
    ledger
        .settle_run(
            "wait-terminal",
            RunOutcome::Blocked,
            "terminal fixture".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle terminal run");
    ledger.close().expect("close terminal writer");

    let (code, cli) = env.forged(&[
        "wait",
        "--id",
        "wait-terminal",
        "--until",
        "terminal",
        "--timeout",
        "1",
    ]);
    assert_eq!(code, 0, "{cli}");
    assert_eq!(cli["result"]["changed"], json!(true));

    let mut mcp = McpClient::new(&env, None);
    let tool = mcp.tool("wait");
    let description = tool["description"].as_str().unwrap_or_default();
    assert!(description.contains("defaults to 240 seconds"), "{tool}");
    assert!(description.contains("maximum 3600 seconds"), "{tool}");
    let mcp_response = mcp.call_tool(
        "wait",
        json!({"id": "wait-terminal", "until": "terminal", "timeout": 1}),
    );
    assert_eq!(mcp_response["result"], cli["result"]);

    let output = env
        .forged_cmd(&[
            "--text",
            "wait",
            "--id",
            "wait-terminal",
            "--until",
            "terminal",
            "--timeout",
            "1",
        ])
        .output()
        .expect("text wait exits");
    assert!(output.status.success(), "{:?}", output);
    let text = String::from_utf8(output.stdout).expect("text wait is utf-8");
    assert!(text.starts_with("EXPLAIN"), "{text}");
    assert!(text.contains("id: wait-terminal"), "{text}");
}
