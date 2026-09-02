//! Typed attention identity, surface parity, and occurrence-fenced controls.

mod support;

use serde_json::{json, Value};
use support::{fabricate_run, HomeBeadsGuard, McpClient, TestEnv};

fn append(env: &TestEnv, run: &str, kind: &str, payload: Value) {
    let ledger = env.ledger();
    ledger
        .append_event(Some(run), kind, payload)
        .expect("append attention source");
    ledger.close().expect("close ledger");
}

fn overview(env: &TestEnv) -> Value {
    let (code, envelope) = env.forged(&["overview"]);
    assert_eq!(code, 0, "{envelope}");
    envelope["result"].clone()
}

fn quarantine(value: &Value) -> Value {
    value["attention"]
        .as_array()
        .and_then(|items| {
            items.iter().find(|item| {
                item["id"] == json!("attention-run") && item["condition"] == json!("quarantined")
            })
        })
        .cloned()
        .unwrap_or_else(|| panic!("quarantine attention is present: {value}"))
}

fn attention(value: &Value, run: &str, condition: &str) -> Option<Value> {
    value["attention"].as_array().and_then(|items| {
        items
            .iter()
            .find(|item| item["id"] == json!(run) && item["condition"] == json!(condition))
            .cloned()
    })
}

fn start_run(env: &TestEnv, run: &str) {
    env.seed_work_spec(
        run,
        "Exercise the advertised attention recovery verb.",
        "- the advertised verb executes",
    );
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        run,
        "--repo",
        &repository,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start {run}: {started}");
}

fn exhaust_restart_budget(env: &TestEnv, run: &str) {
    use forged_ledger::{
        DesiredReconcileOutcome, DesiredReconcileUpdate, DesiredRestartReservation, DesiredState,
        DesiredSubjectKind,
    };

    let ledger = env.ledger();
    let restart_budget = ledger
        .get_desired_work(DesiredSubjectKind::Run, run)
        .expect("desired query")
        .expect("desired row")
        .restart_budget;
    for index in 0..=restart_budget {
        ledger
            .record_desired_outcome(
                DesiredSubjectKind::Run,
                run,
                DesiredState::Running,
                DesiredReconcileOutcome::Authorized,
                Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                None,
            )
            .expect("make desired row due");
        let token = format!("attention-restart-{index}");
        let claimed = ledger
            .claim_desired_work(
                DesiredSubjectKind::Run,
                run,
                &token,
                "2099-01-01T00:00:00.000000000Z",
                "2099-01-01T00:01:00.000000000Z",
            )
            .expect("claim desired work")
            .expect("due desired row");
        match ledger
            .reserve_desired_restart(
                DesiredSubjectKind::Run,
                run,
                &token,
                claimed.controller_generation,
            )
            .expect("reserve restart")
        {
            DesiredRestartReservation::Reserved(reserved) => {
                assert!(index < restart_budget);
                ledger
                    .finish_desired_reconciliation(
                        DesiredSubjectKind::Run,
                        run,
                        &token,
                        DesiredReconcileUpdate {
                            desired_state: None,
                            outcome: DesiredReconcileOutcome::Backoff,
                            controller_generation: Some(reserved.controller_generation),
                            predecessor_generation: reserved.predecessor_generation,
                            next_wake_at: Some("2000-01-01T00:00:00.000000000Z".to_owned()),
                            last_progress_at: None,
                            last_error: Some("fixture controller remained dead".to_owned()),
                            attention_condition: None,
                        },
                    )
                    .expect("finish desired reconciliation");
            }
            DesiredRestartReservation::Exhausted(exhausted) => {
                assert_eq!(index, restart_budget);
                assert!(exhausted.exhausted_at.is_some());
            }
        }
    }
    ledger.close().expect("close ledger");
}

#[test]
fn attention_is_identical_across_surfaces_and_controls_are_occurrence_fenced() {
    let env = TestEnv::new("forged-attention-controls");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-run");
    append(
        &env,
        "attention-run",
        "proto.quarantine",
        json!({
            "packetId": "attention-run/implement/0",
            "attemptId": 7,
            "reason": "claim token is stale",
        }),
    );

    let initial = overview(&env);
    let item = quarantine(&initial);
    assert_eq!(item["schema"], json!("forged.attention-item/1"));
    assert_eq!(item["owner"], json!("human"));
    assert_eq!(item["severity"], json!("critical"));
    assert_eq!(item["state"], json!("open"));
    assert_eq!(
        item["nextActions"],
        json!([{
            "verb": "attention resolve",
            "args": {
                "subject": "attention-run",
                "attentionId": item["attentionId"],
                "occurrenceId": item["occurrenceId"],
                "actor": null,
                "disposition": null,
                "note": null,
            },
            "reason": "bind the adjudicated disposition and note for this exact quarantined occurrence",
        }]),
        "ore-070.5 deliberately moves the quarantined action pin"
    );
    let attention_id = item["attentionId"].as_str().expect("attention id");
    let occurrence_id = item["occurrenceId"].as_str().expect("occurrence id");

    let (code, listed) = env.forged(&["work", "list"]);
    assert_eq!(code, 0, "{listed}");
    assert_eq!(listed["result"]["attention"], initial["attention"]);
    assert_eq!(listed["result"]["attentionTotal"], json!(1));

    let args = [
        "attention",
        "acknowledge",
        "--subject",
        "attention-run",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "lead-agent",
    ];
    let (code, acknowledged) = env.forged(&args);
    assert_eq!(code, 0, "{acknowledged}");
    assert_eq!(acknowledged["reused"], json!(false));
    let (code, replayed) = env.forged(&args);
    assert_eq!(code, 0, "{replayed}");
    assert_eq!(replayed["reused"], json!(true));
    assert_eq!(quarantine(&overview(&env))["state"], json!("acknowledged"));

    let mut mcp = McpClient::new(&env);
    let resolved = mcp.call_tool(
        "attention_resolve",
        json!({
            "schemaVersion": 1,
            "runId": "attention-run",
            "params": {
                "attentionId": attention_id,
                "occurrenceId": occurrence_id,
                "actor": "operator",
                "disposition": item["nextActions"][0]["args"]["disposition"]
                    .as_str()
                    .unwrap_or("accepted-risk"),
                "note": "reviewed exact quarantined evidence",
            },
        }),
    );
    assert_eq!(resolved["ok"], json!(true), "{resolved}");
    assert_eq!(overview(&env)["attention"], json!([]));

    let (code, reopened) = env.forged(&[
        "attention",
        "reopen",
        "--subject",
        "attention-run",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
    ]);
    assert_eq!(code, 0, "{reopened}");
    assert_eq!(quarantine(&overview(&env))["state"], json!("open"));

    // A later causal source keeps the stable attention id but creates a new
    // occurrence. The old address can no longer affect it.
    append(
        &env,
        "attention-run",
        "proto.quarantine",
        json!({
            "packetId": "attention-run/implement/1",
            "attemptId": 8,
            "reason": "different bytes crossed the fence",
        }),
    );
    let recurrence = quarantine(&overview(&env));
    assert_eq!(recurrence["attentionId"], json!(attention_id));
    assert_ne!(recurrence["occurrenceId"], json!(occurrence_id));
    let (_, stale) = env.forged(&args);
    assert_eq!(stale["ok"], json!(false), "{stale}");
    assert_eq!(stale["error"]["code"], json!("INVALID_REQUEST"));
}

#[test]
fn source_backed_attention_cannot_substitute_for_domain_resolution() {
    let env = TestEnv::new("forged-attention-domain-boundary");
    env.forged(&["init"]);
    env.set_work_field("bead-attention-blocked", "status", "blocked");
    fabricate_run(&env, "attention-blocked");
    let ledger = env.ledger();
    ledger
        .settle_run(
            "attention-blocked",
            forged_ledger::RunOutcome::Blocked,
            "operator decision required".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle blocked");
    ledger.close().expect("close ledger");
    let value = overview(&env);
    let blocked = value["attention"]
        .as_array()
        .and_then(|items| {
            items
                .iter()
                .find(|item| item["condition"] == json!("blocked"))
        })
        .expect("blocked attention");
    assert_eq!(
        blocked["nextActions"],
        json!([{
            "verb": "work reopen",
            "args": {"id": "bead-attention-blocked"},
            "reason": blocked["recommendedAction"]["text"],
        }]),
        "the closed recommendation mapping publishes one domain verb"
    );
    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-blocked",
        "--attention-id",
        blocked["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        blocked["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "operator",
        "--disposition",
        "fixed",
        "--note",
        "this must not bypass run settlement",
    ]);
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(refused["error"]["code"], json!("INVALID_REQUEST"));
    let remedy = &refused["error"]["detail"];
    assert_eq!(remedy["schema"], json!("forged.remedy/1"), "{refused}");
    assert_eq!(remedy["verb"], json!("work reopen"), "{refused}");
    assert_eq!(remedy["args"], json!({"id": "bead-attention-blocked"}));
    assert_eq!(
        remedy["reason"], blocked["recommendedAction"]["text"],
        "the remedy preserves the stored recommendation text"
    );
    assert_eq!(overview(&env)["attentionTotal"], json!(1));

    let id = remedy["args"]["id"].as_str().expect("remedy work id");
    let (code, reopened) = env.forged(&["work", "reopen", "--id", id]);
    assert_eq!(code, 0, "advertised work reopen succeeds: {reopened}");
    assert!(
        attention(&overview(&env), "attention-blocked", "blocked").is_none(),
        "the advertised domain transition clears the condition"
    );
}

#[test]
fn restart_exhaustion_advertises_stop_then_retry_and_clears_durably() {
    let env = TestEnv::new("forged-attention-restart-actions");
    env.forged(&["init"]);
    let run = "attention-restart";
    start_run(&env, run);
    env.authorize_run(run);
    exhaust_restart_budget(&env, run);

    let active = attention(&overview(&env), run, "restart-budget-exhausted")
        .expect("active exhausted run attention");
    assert_eq!(
        active["nextActions"],
        json!([{
            "verb": "run stop",
            "args": {"run": run, "outcome": null, "reason": null},
            "reason": "stop with an outcome and reason, then retry the terminal run",
        }]),
        "an active run must never advertise run retry"
    );
    let stop = &active["nextActions"][0];
    let (code, stopped) = env.forged(&[
        "run",
        "stop",
        "--run",
        stop["args"]["run"].as_str().expect("advertised run"),
        "--outcome",
        "cancelled",
        "--reason",
        "bind the exhausted run stop placeholders",
    ]);
    assert_eq!(code, 0, "advertised run stop succeeds: {stopped}");

    let terminal = attention(&overview(&env), run, "restart-budget-exhausted")
        .expect("terminal exhausted run attention");
    let retry = &terminal["nextActions"][0];
    assert_eq!(retry["verb"], json!("run retry"));
    assert_eq!(
        retry["args"],
        json!({"id": run, "runId": null}),
        "retry reuses the shared placeholder shape"
    );
    assert!(retry["reason"]
        .as_str()
        .is_some_and(|reason| reason.contains("current spec")));

    env.set_work_field(
        run,
        "notes",
        "The restart failure is addressed; retry this revision.",
    );
    let (code, retried) = env.forged(&[
        "run",
        "retry",
        "--id",
        retry["args"]["id"].as_str().expect("advertised run"),
    ]);
    assert_eq!(code, 0, "advertised run retry succeeds: {retried}");
    assert_eq!(retried["result"]["retryOf"], json!(run));
    assert!(
        attention(&overview(&env), run, "restart-budget-exhausted").is_none(),
        "a terminal exhausted source with a live same-work successor clears"
    );
    let (code, detail) = env.forged(&["work", "detail", "--id", run]);
    assert_eq!(code, 0, "original run Work Detail: {detail}");
    assert!(
        attention(&detail["result"], run, "restart-budget-exhausted").is_none(),
        "exact Work Detail must not retain a retry action after a live same-work successor: {detail}"
    );

    // Successor existence, not successor liveness, is the clearing fact:
    // the item must stay cleared after the successor itself settles.
    let (code, stopped_successor) = env.forged(&[
        "run",
        "stop",
        "--run",
        retried["result"]["runId"].as_str().expect("successor run"),
        "--outcome",
        "cancelled",
        "--reason",
        "settle the successor to prove durable clearance",
    ]);
    assert_eq!(code, 0, "successor stop succeeds: {stopped_successor}");
    assert!(
        attention(&overview(&env), run, "restart-budget-exhausted").is_none(),
        "clearance survives the successor's own settlement"
    );
    let (code, detail) = env.forged(&["work", "detail", "--id", run]);
    assert_eq!(code, 0, "post-settlement Work Detail: {detail}");
    assert!(
        attention(&detail["result"], run, "restart-budget-exhausted").is_none(),
        "exact Work Detail clearance survives the successor's settlement: {detail}"
    );
}

#[test]
fn epic_input_attention_advertises_and_executes_epic_resolve() {
    let env = TestEnv::new("forged-attention-epic-input-action");
    env.forged(&["init"]);
    let epic = "attention-epic-input";
    env.seed_epic(epic, &[("attention-epic-child", &env.spec, true)]);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "epic",
        "start",
        "--epic",
        epic,
        "--repo",
        &repository,
        "--spec",
        &spec,
        "--base-ref",
        "main",
    ]);
    assert_eq!(code, 0, "start epic: {started}");
    env.authorize_epic(epic);
    append(
        &env,
        epic,
        "forged.epic.input.required",
        json!({"code": "operator-choice", "detail": "choose the release lane", "childId": null}),
    );

    let item = attention(&overview(&env), epic, "input-required").expect("epic input attention");
    assert_eq!(
        item["nextActions"],
        json!([{
            "verb": "epic resolve",
            "args": {"epic": epic, "child": null, "note": null},
            "reason": "bind the held child when the input requirement names one and record the resolution note",
        }])
    );
    let action = &item["nextActions"][0];
    let (code, resolved) = env.forged(&[
        "epic",
        "resolve",
        "--epic",
        action["args"]["epic"].as_str().expect("advertised epic"),
        "--note",
        "ship through the integration lane",
    ]);
    assert_eq!(code, 0, "advertised epic resolve succeeds: {resolved}");
    assert!(
        attention(&overview(&env), epic, "input-required").is_none(),
        "the advertised domain transition clears the item"
    );
}

#[test]
fn provider_exhaustion_advertises_and_executes_run_roster_revision() {
    let env = TestEnv::new("forged-attention-roster-action");
    env.forged(&["init"]);
    env.add_uniform_roster("recovery", "codex", "gpt-5.6-sol");
    let run = "attention-roster";
    start_run(&env, run);
    append(
        &env,
        run,
        "run.protocol-terminal",
        json!({
            "schemaVersion": 1,
            "terminal": {"providerUnavailable": {"provider": "fixture"}},
        }),
    );

    let item =
        attention(&overview(&env), run, "retry-exhausted").expect("provider exhaustion attention");
    assert_eq!(
        item["nextActions"],
        json!([{
            "verb": "run revise-roster",
            "args": {"run": run, "roster": null, "reason": null},
            "reason": "bind a configured roster name and the reason for revising provider policy",
        }])
    );
    let action = &item["nextActions"][0];
    let (code, revised) = env.forged(&[
        "run",
        "revise-roster",
        "--run",
        action["args"]["run"].as_str().expect("advertised run"),
        "--roster",
        "recovery",
        "--reason",
        "the original provider is unavailable",
    ]);
    assert_eq!(code, 0, "advertised run revise-roster succeeds: {revised}");
    assert_eq!(revised["result"]["revision"], json!(2));
    assert_eq!(revised["result"]["roster_ref"]["name"], json!("recovery"));
}

#[test]
fn review_disagreement_advertises_accept_risk_only_after_a_persisted_terminal_review() {
    let env = TestEnv::new("forged-attention-review-actions");
    env.forged(&["init"]);
    let gated = "attention-review-gated";
    let ungated = "attention-review-ungated";
    start_run(&env, gated);
    fabricate_run(&env, ungated);
    for run in [gated, ungated] {
        let ledger = env.ledger();
        forged_proto::record(
            &ledger,
            run,
            forged_proto::ProtoEvent::Review {
                seq: 1,
                stage: forged_types::Stage::ReviewClaude,
                verdict: Some(forged_types::Verdict::Approve),
                available: true,
            },
        )
        .expect("record approving review");
        forged_proto::record(
            &ledger,
            run,
            forged_proto::ProtoEvent::Review {
                seq: 1,
                stage: forged_types::Stage::ReviewCodex,
                verdict: Some(forged_types::Verdict::RequestChanges),
                available: true,
            },
        )
        .expect("record requesting review");
        ledger.close().expect("close ledger");
    }

    let terminal = json!({
        "schemaVersion": 1,
        "terminal": {
            "reviewBudgetExhausted": {
                "reviewRounds": 2,
                "finalVerdict": "requestChanges",
            }
        },
    });
    append(&env, ungated, "run.protocol-terminal", terminal.clone());
    append(&env, gated, "run.protocol-terminal", terminal);

    let ungated_item =
        attention(&overview(&env), ungated, "reviewer-disagreement").expect("ungated disagreement");
    assert_eq!(
        ungated_item["nextActions"],
        json!([{
            "verb": "attention resolve",
            "args": {
                "subject": ungated,
                "attentionId": ungated_item["attentionId"],
                "occurrenceId": ungated_item["occurrenceId"],
                "actor": null,
                "disposition": null,
                "note": null,
            },
            "reason": "bind the adjudicated disposition and note for this exact review disagreement",
        }]),
        "accept-risk must be absent while terminal review evidence is not in the required stopped-blocked state"
    );

    let ledger = env.ledger();
    ledger
        .settle_run(
            gated,
            forged_ledger::RunOutcome::Blocked,
            "review budget exhausted after 2 rounds with verdict requestChanges".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle terminal review fixture");
    ledger.close().expect("close ledger");

    let gated_item =
        attention(&overview(&env), gated, "reviewer-disagreement").expect("gated disagreement");
    assert_eq!(
        gated_item["nextActions"][0]["verb"],
        json!("attention resolve")
    );
    let accept = &gated_item["nextActions"][1];
    assert_eq!(accept["verb"], json!("run accept-risk"));
    assert_eq!(
        accept["args"],
        json!({"run": gated, "acceptedBy": null, "rationale": null})
    );
    let (code, accepted) = env.forged(&[
        "run",
        "accept-risk",
        "--run",
        accept["args"]["run"].as_str().expect("advertised run"),
        "--accepted-by",
        "lead-agent",
        "--rationale",
        "the affected path is disabled in this deployment",
    ]);
    assert_eq!(code, 0, "advertised run accept-risk succeeds: {accepted}");
    assert_eq!(accepted["result"]["reviewRounds"], json!(2));
    assert_eq!(
        env.ledger()
            .get_run(gated)
            .expect("accepted-risk run")
            .terminal_outcome,
        Some(forged_ledger::RunOutcome::AcceptedRisk)
    );
    let after = attention(&overview(&env), gated, "reviewer-disagreement")
        .expect("disagreement remains explicitly resolvable");
    assert_eq!(
        after["nextActions"].as_array().expect("actions").len(),
        1,
        "accepted-risk state must not keep advertising a non-replayable generic acceptance"
    );
    assert_eq!(after["nextActions"][0]["verb"], json!("attention resolve"));
}

#[test]
fn delivery_requires_the_durably_observed_exact_pr_base() {
    let env = TestEnv::new("forged-attention-pr-base");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-pr-base");
    let ledger = env.ledger();
    ledger
        .settle_run(
            "attention-pr-base",
            forged_ledger::RunOutcome::Clean,
            "review approved".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle clean");
    ledger
        .append_event(
            Some("attention-pr-base"),
            "proto.pr",
            json!({
                "schemaVersion": 1,
                "number": 17,
                "isDraft": true,
                "baseRefName": "stacked-integration",
                "url": "https://example.invalid/pr/17",
            }),
        )
        .expect("wrong-base PR");
    ledger.close().expect("close ledger");

    let wrong = overview(&env);
    let gap = attention(&wrong, "attention-pr-base", "missing-evidence")
        .expect("wrong-base missing-evidence");
    assert_eq!(
        gap["nextActions"],
        json!([]),
        "repairable delivery evidence has no honest recording verb"
    );
    assert!(wrong["queue"]["groups"]
        .as_array()
        .expect("groups")
        .iter()
        .find(|group| group["name"] == json!("Ready to merge"))
        .and_then(|group| group["entries"].as_array())
        .is_some_and(Vec::is_empty));

    // A wrong-base delivery PR is a repairable gap, never adjudicable
    // absence: evidence-absent refuses on this flavour of the condition.
    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-pr-base",
        "--attention-id",
        gap["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        gap["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "operator",
        "--disposition",
        "evidence-absent",
        "--note",
        "must not silence a live delivery alarm",
    ]);
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(refused["error"]["code"], json!("INVALID_REQUEST"));
    assert!(
        refused["error"]["message"]
            .as_str()
            .expect("refusal message")
            .contains("repairable delivery"),
        "{refused}"
    );

    append(
        &env,
        "attention-pr-base",
        "proto.pr",
        json!({
            "schemaVersion": 1,
            "number": 18,
            "isDraft": true,
            "baseRefName": env.repos.base,
            "url": "https://example.invalid/pr/18",
        }),
    );
    let exact = overview(&env);
    let merge =
        attention(&exact, "attention-pr-base", "merge-approval").expect("merge approval attention");
    assert_eq!(
        merge["nextActions"],
        json!([]),
        "merging a pull request has no in-surface domain verb"
    );
    assert!(attention(&exact, "attention-pr-base", "missing-evidence").is_none());
}

#[test]
fn missing_cost_only_accepts_the_explicit_unknown_disposition() {
    let env = TestEnv::new("forged-attention-missing-cost");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-cost");
    let ledger = env.ledger();
    ledger
        .record_usage(forged_ledger::NewUsage {
            run_id: "attention-cost".to_owned(),
            packet_id: Some("attention-cost/implement/0".to_owned()),
            attempt_id: None,
            provider: "codex".to_owned(),
            model: "gpt-test".to_owned(),
            input_tokens: 10,
            output_tokens: 2,
            cache_read_tokens: None,
            cache_write_tokens: None,
            cost_usd: None,
            pricing_basis: None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("unpriced usage");
    ledger.close().expect("close ledger");
    let item = attention(&overview(&env), "attention-cost", "missing-cost")
        .expect("missing-cost attention");
    let attention_id = item["attentionId"].as_str().expect("attention id");
    let occurrence_id = item["occurrenceId"].as_str().expect("occurrence id");
    let action = &item["nextActions"][0];
    assert_eq!(action["verb"], json!("attention resolve"));
    assert_eq!(
        action["args"],
        json!({
            "subject": "attention-cost",
            "attentionId": item["attentionId"],
            "occurrenceId": item["occurrenceId"],
            "actor": null,
            "disposition": "accepted-unknown",
            "note": null,
        })
    );
    assert!(action["reason"]
        .as_str()
        .is_some_and(|reason| reason.contains("config file")));

    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-cost",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
        "--disposition",
        "fixed",
    ]);
    assert_eq!(
        refused["error"]["code"],
        json!("INVALID_REQUEST"),
        "{refused}"
    );

    let (_, accepted) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-cost",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
        "--disposition",
        action["args"]["disposition"]
            .as_str()
            .expect("pre-bound disposition"),
    ]);
    assert_eq!(accepted["ok"], json!(true), "{accepted}");
    assert!(attention(&overview(&env), "attention-cost", "missing-cost").is_none());
}

/// One open implement packet for `run`, stored as a decodable WorkPacket
/// body. Returns the packet id and the pinned spec sha for later claims.
fn open_implement_packet(env: &TestEnv, run: &str, seq: i64) -> (String, String) {
    let sha = "a".repeat(64);
    let packet = forged_types::WorkPacket {
        schema: "forged.packet/1".to_owned(),
        packet_id: format!("{run}/implement/{seq}"),
        run_id: run.to_owned(),
        work_id: format!("bead-{run}"),
        stage: forged_types::Stage::Implement,
        execution: None,
        lane_seq: None,
        spec: forged_types::SpecRef {
            path: "beads://fixture".to_owned(),
            sha256: sha.clone(),
            revision: None,
        },
        worktree: std::path::PathBuf::from("/unread/worktree"),
        branch: format!("work/{run}"),
        base_ref: "main".to_owned(),
        contract: forged_types::StageContract {
            instructions: "fixture".to_owned(),
            gate_commands: Vec::new(),
            deliverable: forged_types::Deliverable::CommitsInWorktree,
            budget_s: 60,
        },
        result_schema: "forged.result/1".to_owned(),
        provider_hints: forged_types::ProviderHints {
            provider: "fixture".to_owned(),
            model: "fixture".to_owned(),
            effort: None,
            sandbox: forged_types::Sandbox::ReadOnly,
        },
        field_notes: Vec::new(),
    };
    let ledger = env.ledger();
    let packet_id = ledger
        .open_packet(forged_ledger::NewPacket {
            run_id: run.to_owned(),
            stage: forged_types::Stage::Implement,
            seq,
            spec_path: packet.spec.path.clone(),
            spec_sha256: sha.clone(),
            spec_revision: None,
            policy_revision: None,
            body_json: packet.stored_body().expect("stored packet"),
        })
        .expect("open packet");
    ledger.close().expect("close ledger");
    (packet_id, sha)
}

/// Claim and terminally fail one attempt with NO artifact manifest — the
/// exact shape of a legacy pre-manifest attempt. Returns the attempt id.
fn fail_manifest_less_attempt(env: &TestEnv, packet_id: &str, sha: &str) -> i64 {
    let ledger = env.ledger();
    let claimed = ledger
        .claim_packet(
            packet_id,
            &format!("forged:{packet_id}:0"),
            &forged_ledger::SpecFence::Sha256(sha.to_owned()),
        )
        .expect("claim packet");
    ledger
        .fail_packet(
            packet_id,
            &claimed.claim_token,
            "session vanished before any manifest",
        )
        .expect("fail packet");
    ledger.close().expect("close ledger");
    claimed.attempt_id
}

#[test]
fn missing_evidence_is_adjudicated_per_occurrence_with_its_full_attempt_scope() {
    let env = TestEnv::new("forged-attention-missing-evidence");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-evidence");
    let (packet_id, sha) = open_implement_packet(&env, "attention-evidence", 0);
    let first = fail_manifest_less_attempt(&env, &packet_id, &sha);
    let second = fail_manifest_less_attempt(&env, &packet_id, &sha);
    let mut expected = vec![first.to_string(), second.to_string()];
    expected.sort();

    let item = attention(&overview(&env), "attention-evidence", "missing-evidence")
        .expect("missing-evidence attention");
    assert_eq!(item["state"], json!("open"));
    assert_eq!(
        item["nextActions"],
        json!([{
            "verb": "attention resolve",
            "args": {
                "subject": "attention-evidence",
                "attentionId": item["attentionId"],
                "occurrenceId": item["occurrenceId"],
                "actor": null,
                "disposition": "evidence-absent",
                "note": null,
            },
            "reason": "bind a nonblank note explaining why this attempt-only evidence was never captured",
        }])
    );
    let evidence_action = item["nextActions"][0].clone();
    let attempt_refs: Vec<String> = item["evidenceRefs"]
        .as_array()
        .expect("evidence refs")
        .iter()
        .filter(|reference| reference["kind"] == json!("attempt"))
        .map(|reference| {
            reference["id"]
                .as_str()
                .expect("attempt evidence id")
                .to_owned()
        })
        .collect();
    assert_eq!(attempt_refs, expected, "{item}");
    let attention_id = item["attentionId"].as_str().expect("attention id");
    let occurrence_id = item["occurrenceId"].as_str().expect("occurrence id");

    // Surface parity while open: work_detail names the same occurrence, so
    // the address it serves can pass resolve validation.
    let (code, detail) = env.forged(&["work", "detail", "--id", "attention-evidence"]);
    assert_eq!(code, 0, "{detail}");
    let observed = attention(&detail["result"], "attention-evidence", "missing-evidence")
        .expect("work_detail missing-evidence");
    assert_eq!(observed["occurrenceId"], json!(occurrence_id), "{observed}");

    // Every other disposition refuses by name.
    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-evidence",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
        "--disposition",
        "fixed",
        "--note",
        "nothing was repaired",
    ]);
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(refused["error"]["code"], json!("INVALID_REQUEST"));
    assert!(
        refused["error"]["message"]
            .as_str()
            .expect("refusal message")
            .contains("evidence-absent"),
        "{refused}"
    );

    // The absence record demands its auditable rationale: a blank note
    // refuses.
    let (_, unnoted) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-evidence",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
        "--disposition",
        "evidence-absent",
        "--note",
        "   ",
    ]);
    assert_eq!(unnoted["ok"], json!(false), "{unnoted}");
    assert_eq!(unnoted["error"]["code"], json!("INVALID_REQUEST"));
    assert!(
        unnoted["error"]["message"]
            .as_str()
            .expect("refusal message")
            .contains("nonblank note"),
        "{unnoted}"
    );

    let (code, resolved) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-evidence",
        "--attention-id",
        attention_id,
        "--occurrence-id",
        occurrence_id,
        "--actor",
        "operator",
        "--disposition",
        evidence_action["args"]["disposition"]
            .as_str()
            .expect("pre-bound evidence disposition"),
        "--note",
        "attempts predate the artifact manifest",
    ]);
    assert_eq!(code, 0, "{resolved}");
    assert_eq!(resolved["ok"], json!(true), "{resolved}");

    // The durable transition records actor, rationale, and EVERY attempt id
    // from the occurrence's evidence.
    let ledger = env.ledger();
    let transitions = ledger
        .list_events_by_kind("forged.attention.resolved")
        .expect("resolved transitions");
    ledger.close().expect("close ledger");
    assert_eq!(transitions.len(), 1, "one durable resolution");
    let payload: Value =
        serde_json::from_str(&transitions[0].payload_json).expect("transition payload");
    assert_eq!(payload["actor"], json!("operator"));
    assert_eq!(payload["disposition"], json!("evidence-absent"));
    assert_eq!(
        payload["note"],
        json!("attempts predate the artifact manifest")
    );
    assert_eq!(payload["attemptIds"], json!(expected), "{payload}");

    // Resolved custody strips the occurrence from the attention list and
    // the same run's work_detail alike.
    assert!(attention(&overview(&env), "attention-evidence", "missing-evidence").is_none());
    let listed = attention_list(&env, &[]);
    assert!(
        listed["groups"]
            .as_array()
            .expect("groups")
            .iter()
            .all(|group| group["condition"] != json!("missing-evidence")),
        "{listed}"
    );
    let (code, detail) = env.forged(&["work", "detail", "--id", "attention-evidence"]);
    assert_eq!(code, 0, "{detail}");
    assert!(
        attention(&detail["result"], "attention-evidence", "missing-evidence").is_none(),
        "{detail}"
    );

    // A later manifest-less terminal attempt on the SAME run raises a fresh
    // open occurrence under the stable attention id.
    fail_manifest_less_attempt(&env, &packet_id, &sha);
    let recurrence = attention(&overview(&env), "attention-evidence", "missing-evidence")
        .expect("fresh occurrence");
    assert_eq!(recurrence["attentionId"], json!(attention_id));
    assert_ne!(recurrence["occurrenceId"], json!(occurrence_id));
    assert_eq!(recurrence["state"], json!("open"));
}

#[test]
fn evidence_absent_binds_to_missing_evidence_in_both_directions() {
    let env = TestEnv::new("forged-attention-evidence-absent-guard");
    env.forged(&["init"]);

    // On a different adjudicable condition the reverse guard refuses: the
    // audit vocabulary cannot claim absence where evidence exists.
    fabricate_run(&env, "attention-run");
    append(
        &env,
        "attention-run",
        "proto.quarantine",
        json!({
            "packetId": "attention-run/implement/0",
            "attemptId": 7,
            "reason": "claim token is stale",
        }),
    );
    let item = quarantine(&overview(&env));
    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-run",
        "--attention-id",
        item["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        item["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "operator",
        "--disposition",
        "evidence-absent",
        "--note",
        "wrong vocabulary",
    ]);
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(refused["error"]["code"], json!("INVALID_REQUEST"));
    assert!(
        refused["error"]["message"]
            .as_str()
            .expect("refusal message")
            .contains("evidence-absent"),
        "{refused}"
    );
    assert_eq!(quarantine(&overview(&env))["state"], json!("open"));

    // On a source-backed condition the domain-transition refusal still wins.
    fabricate_run(&env, "attention-blocked");
    let ledger = env.ledger();
    ledger
        .settle_run(
            "attention-blocked",
            forged_ledger::RunOutcome::Blocked,
            "operator decision required".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle blocked");
    ledger.close().expect("close ledger");
    let blocked =
        attention(&overview(&env), "attention-blocked", "blocked").expect("blocked attention");
    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-blocked",
        "--attention-id",
        blocked["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        blocked["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "operator",
        "--disposition",
        "evidence-absent",
        "--note",
        "this must not bypass run settlement",
    ]);
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(refused["error"]["code"], json!("INVALID_REQUEST"));
    assert_eq!(
        refused["error"]["message"],
        json!("this source-backed condition clears only through its domain transition"),
        "{refused}"
    );
}

#[test]
fn merged_delivery_evidence_defers_adjudication_until_the_pr_is_repaired() {
    let env = TestEnv::new("forged-attention-evidence-merged");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-merged");
    let (packet_id, sha) = open_implement_packet(&env, "attention-merged", 0);
    let attempt = fail_manifest_less_attempt(&env, &packet_id, &sha);
    let ledger = env.ledger();
    ledger
        .settle_run(
            "attention-merged",
            forged_ledger::RunOutcome::Clean,
            "review approved".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle clean");
    ledger.close().expect("close ledger");

    // The clean run without a delivery PR and the manifest-less attempt
    // share one condition, so they merge into one occurrence. Adjudicating
    // it as absent would silence the live, repairable delivery alarm.
    let merged = attention(&overview(&env), "attention-merged", "missing-evidence")
        .expect("merged missing-evidence");
    assert!(
        merged["evidenceRefs"]
            .as_array()
            .expect("evidence refs")
            .iter()
            .any(|reference| reference["kind"] == json!("event")),
        "{merged}"
    );
    let (_, refused) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-merged",
        "--attention-id",
        merged["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        merged["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "operator",
        "--disposition",
        "evidence-absent",
        "--note",
        "the delivery gap is still live",
    ]);
    assert_eq!(refused["ok"], json!(false), "{refused}");
    assert_eq!(refused["error"]["code"], json!("INVALID_REQUEST"));
    assert!(
        refused["error"]["message"]
            .as_str()
            .expect("refusal message")
            .contains("repairable delivery"),
        "{refused}"
    );

    // Known divergence, pinned: work_detail projects from the ledger alone
    // and cannot name the settlement source (its id embeds a bd feed
    // cursor), so while the delivery gap is live its attempt-only
    // occurrence id differs from the rail's merged id and a resolve
    // against it fails closed as stale. The rail is the resolve surface.
    let (code, detail) = env.forged(&["work", "detail", "--id", "attention-merged"]);
    assert_eq!(code, 0, "{detail}");
    let derived = attention(&detail["result"], "attention-merged", "missing-evidence")
        .expect("work_detail missing-evidence");
    assert!(
        derived["evidenceRefs"]
            .as_array()
            .expect("evidence refs")
            .iter()
            .all(|reference| reference["kind"] == json!("attempt")),
        "{derived}"
    );
    assert_ne!(derived["occurrenceId"], merged["occurrenceId"], "{detail}");
    let (_, stale) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-merged",
        "--attention-id",
        derived["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        derived["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "operator",
        "--disposition",
        "evidence-absent",
        "--note",
        "the delivery gap is still live",
    ]);
    assert_eq!(stale["ok"], json!(false), "{stale}");
    assert!(
        stale["error"]["message"]
            .as_str()
            .expect("stale message")
            .contains("stale because newer causal evidence exists"),
        "{stale}"
    );

    // Recording the exact-base PR repairs the delivery gap; the surviving
    // occurrence covers only the manifest-less attempt and is adjudicable.
    append(
        &env,
        "attention-merged",
        "proto.pr",
        json!({
            "schemaVersion": 1,
            "number": 21,
            "isDraft": true,
            "baseRefName": env.repos.base,
            "url": "https://example.invalid/pr/21",
        }),
    );
    let repaired = overview(&env);
    assert!(attention(&repaired, "attention-merged", "merge-approval").is_some());
    let remaining = attention(&repaired, "attention-merged", "missing-evidence")
        .expect("attempt-scoped missing-evidence");
    assert_ne!(remaining["occurrenceId"], merged["occurrenceId"]);
    assert!(
        remaining["evidenceRefs"]
            .as_array()
            .expect("evidence refs")
            .iter()
            .all(|reference| reference["kind"] == json!("attempt")),
        "{remaining}"
    );
    // With the settlement source gone the anti-joins agree again, so the
    // occurrence id work_detail prints is the one the rail validates.
    let (code, detail) = env.forged(&["work", "detail", "--id", "attention-merged"]);
    assert_eq!(code, 0, "{detail}");
    let repaired_view = attention(&detail["result"], "attention-merged", "missing-evidence")
        .expect("work_detail attempt-scoped missing-evidence");
    assert_eq!(
        repaired_view["occurrenceId"], remaining["occurrenceId"],
        "{detail}"
    );
    let (code, resolved) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        "attention-merged",
        "--attention-id",
        remaining["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        remaining["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "operator",
        "--disposition",
        "evidence-absent",
        "--note",
        "attempt predates the artifact manifest",
    ]);
    assert_eq!(code, 0, "{resolved}");
    assert_eq!(resolved["ok"], json!(true), "{resolved}");
    let ledger = env.ledger();
    let transitions = ledger
        .list_events_by_kind("forged.attention.resolved")
        .expect("resolved transitions");
    ledger.close().expect("close ledger");
    assert_eq!(transitions.len(), 1, "one durable resolution");
    let payload: Value =
        serde_json::from_str(&transitions[0].payload_json).expect("transition payload");
    assert_eq!(
        payload["attemptIds"],
        json!([attempt.to_string()]),
        "{payload}"
    );
    assert!(attention(&overview(&env), "attention-merged", "missing-evidence").is_none());
}

#[test]
fn interrupted_attempts_never_owe_a_manifest_on_any_surface() {
    let env = TestEnv::new("forged-attention-interrupted");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-interrupted");
    let (packet_id, sha) = open_implement_packet(&env, "attention-interrupted", 0);
    let ledger = env.ledger();
    let reclaimed = ledger
        .claim_packet(
            &packet_id,
            &format!("forged:{packet_id}:0"),
            &forged_ledger::SpecFence::Sha256(sha.clone()),
        )
        .expect("claim for reclaim");
    ledger
        .revoke_attempt(reclaimed.attempt_id, "driver died mid-flight")
        .expect("revoke before reclaim");
    ledger
        .mark_reclaimed(reclaimed.attempt_id)
        .expect("mark reclaimed");
    let stopped = ledger
        .claim_packet(
            &packet_id,
            &format!("forged:{packet_id}:1"),
            &forged_ledger::SpecFence::Sha256(sha),
        )
        .expect("claim for stop");
    ledger
        .revoke_attempt(stopped.attempt_id, "operator stop")
        .expect("revoke before stop");
    ledger
        .mark_stopped(stopped.attempt_id)
        .expect("mark stopped");
    ledger.close().expect("close ledger");

    assert!(
        attention(&overview(&env), "attention-interrupted", "missing-evidence").is_none(),
        "an interrupted attempt never owed a manifest"
    );
    let (code, detail) = env.forged(&["work", "detail", "--id", "attention-interrupted"]);
    assert_eq!(code, 0, "{detail}");
    assert!(
        attention(
            &detail["result"],
            "attention-interrupted",
            "missing-evidence"
        )
        .is_none(),
        "{detail}"
    );
}

#[test]
fn exact_replay_survives_authoritative_source_clearance() {
    let env = TestEnv::new("forged-attention-replay-after-clear");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-input");
    append(
        &env,
        "attention-input",
        "forged.epic.input.required",
        json!({"code": "choice", "detail": "pick one"}),
    );
    let item =
        attention(&overview(&env), "attention-input", "input-required").expect("input attention");
    let args = [
        "attention",
        "acknowledge",
        "--subject",
        "attention-input",
        "--attention-id",
        item["attentionId"].as_str().expect("attention id"),
        "--occurrence-id",
        item["occurrenceId"].as_str().expect("occurrence id"),
        "--actor",
        "lead-agent",
    ];
    let (_, first) = env.forged(&args);
    assert_eq!(first["ok"], json!(true), "{first}");
    append(
        &env,
        "attention-input",
        "forged.epic.input.resolved",
        json!({"resolutionId": "resolution-1"}),
    );
    assert!(attention(&overview(&env), "attention-input", "input-required").is_none());
    let (_, replay) = env.forged(&args);
    assert_eq!(replay["ok"], json!(true), "{replay}");
    assert_eq!(replay["reused"], json!(true), "{replay}");
}

// ---------------------------------------------------------- attention list

/// The shared attention_list fixture: two quarantined runs (one decision
/// group with two items, `att-b` older than `att-a` — append order and
/// alphabetical order deliberately DISAGREE so the oldest-first assertions
/// cannot pass on an id sort) and one blocked run (one symptom group).
fn seed_attention_list_fixture(env: &TestEnv) {
    env.forged(&["init"]);
    fabricate_run(env, "att-a");
    fabricate_run(env, "att-b");
    fabricate_run(env, "att-blocked");
    append(
        env,
        "att-b",
        "proto.quarantine",
        json!({"packetId": "att-b/implement/0", "attemptId": 1, "reason": "stale token"}),
    );
    append(
        env,
        "att-a",
        "proto.quarantine",
        json!({"packetId": "att-a/implement/0", "attemptId": 2, "reason": "stale token"}),
    );
    let ledger = env.ledger();
    ledger
        .settle_run(
            "att-blocked",
            forged_ledger::RunOutcome::Blocked,
            "operator decision required".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle blocked");
    ledger.close().expect("close ledger");
}

fn attention_list(env: &TestEnv, args: &[&str]) -> Value {
    let mut full = vec!["attention", "list"];
    full.extend_from_slice(args);
    let (code, envelope) = env.forged(&full);
    assert_eq!(code, 0, "{envelope}");
    envelope["result"].clone()
}

fn group<'v>(listed: &'v Value, condition: &str) -> &'v Value {
    listed["groups"]
        .as_array()
        .and_then(|groups| {
            groups
                .iter()
                .find(|group| group["condition"] == json!(condition))
        })
        .unwrap_or_else(|| panic!("{condition} group is present: {listed}"))
}

#[test]
fn attention_list_groups_decisions_first_and_serves_complete_rail_items() {
    let env = TestEnv::new("forged-attention-list-groups");
    seed_attention_list_fixture(&env);

    let listed = attention_list(&env, &[]);
    assert_eq!(listed["schema"], json!("forged.attention-list/1"));
    assert_eq!(
        listed["filters"],
        json!({
            "repo": Value::Null,
            "state": "active",
            "condition": Value::Null,
            "classification": Value::Null,
            "limit": 100,
        })
    );
    assert_eq!(
        listed["sourceHealth"]["ledger"]["state"],
        json!("available")
    );
    assert_eq!(listed["sourceHealth"]["beads"]["state"], json!("available"));
    assert!(listed["capturedAt"]["ledger"].is_string());
    assert!(listed["capturedAt"]["beads"].is_string());

    // Decisions render before symptoms; items are oldest-first within the
    // group; oldestOpenedAt names the first item's openedAt.
    let groups = listed["groups"].as_array().expect("groups");
    assert_eq!(groups.len(), 2, "{listed}");
    assert_eq!(groups[0]["condition"], json!("quarantined"));
    assert_eq!(groups[0]["classification"], json!("decision"));
    assert_eq!(groups[1]["condition"], json!("blocked"));
    assert_eq!(groups[1]["classification"], json!("symptom"));
    let quarantined = &groups[0];
    assert_eq!(quarantined["total"], json!(2));
    assert_eq!(quarantined["shown"], json!(2));
    assert_eq!(quarantined["items"][0]["id"], json!("att-b"));
    assert_eq!(quarantined["items"][1]["id"], json!("att-a"));
    assert_eq!(
        quarantined["oldestOpenedAt"], quarantined["items"][0]["openedAt"],
        "{listed}"
    );
    assert_eq!(
        listed["totals"],
        json!({
            "open": 3,
            "acknowledged": 0,
            "resolved": 0,
            "decisions": 2,
            "symptoms": 1,
            "shown": 3,
            "total": 3,
        })
    );

    // Items are the complete unmodified forged.attention-item/1 objects the
    // embedded operations_overview rail serves.
    let (code, ops) = env.forged(&["operations", "overview"]);
    assert_eq!(code, 0, "{ops}");
    for (run, condition) in [
        ("att-a", "quarantined"),
        ("att-b", "quarantined"),
        ("att-blocked", "blocked"),
    ] {
        let rail = attention(&ops["result"], run, condition)
            .unwrap_or_else(|| panic!("{run} {condition} is on the rail: {ops}"));
        let listed_item = group(&listed, condition)["items"]
            .as_array()
            .into_iter()
            .flatten()
            .find(|item| item["id"] == json!(run))
            .unwrap_or_else(|| panic!("{run} {condition} is listed: {listed}"))
            .clone();
        assert_eq!(
            listed_item, rail,
            "{run} {condition} must be byte-identical"
        );
    }
}

#[test]
fn attention_list_serves_the_plan_only_blocked_work_exactly_as_the_rail() {
    let env = TestEnv::new("forged-attention-list-plan-blocked");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    env.set_work_field("plan-blk", "status", "blocked");
    env.set_work_field("plan-blk", "title", "Blocked plan-only bead");
    env.set_work_repository("plan-blk", &repository);

    let (code, ops) = env.forged(&["operations", "overview"]);
    assert_eq!(code, 0, "{ops}");
    let rail = attention(&ops["result"], "plan-blk", "blocked")
        .unwrap_or_else(|| panic!("plan-only blocked bead is on the rail: {ops}"));

    let listed = attention_list(&env, &[]);
    let blocked = group(&listed, "blocked");
    assert_eq!(blocked["classification"], json!("symptom"));
    assert_eq!(blocked["total"], json!(1));
    assert_eq!(
        blocked["items"][0], rail,
        "the collection universe is the operations universe, not a ledger-only subset"
    );
}

#[test]
fn attention_list_truncation_is_a_stated_global_sequential_take() {
    let env = TestEnv::new("forged-attention-list-truncation");
    seed_attention_list_fixture(&env);

    let listed = attention_list(&env, &["--limit", "2"]);
    assert_eq!(listed["filters"]["limit"], json!(2));
    assert_eq!(listed["totals"]["total"], json!(3));
    assert_eq!(listed["totals"]["shown"], json!(2));
    let quarantined = group(&listed, "quarantined");
    assert_eq!(quarantined["total"], json!(2));
    assert_eq!(quarantined["shown"], json!(2));
    let blocked = group(&listed, "blocked");
    assert_eq!(
        blocked["total"],
        json!(1),
        "a starved group states its total"
    );
    assert_eq!(blocked["shown"], json!(0));
    assert_eq!(blocked["items"], json!([]));

    // The take is sequential in rendered order: one slot serves the oldest
    // decision, never a per-group share.
    let listed = attention_list(&env, &["--limit", "1"]);
    let quarantined = group(&listed, "quarantined");
    assert_eq!(quarantined["shown"], json!(1));
    assert_eq!(quarantined["items"][0]["id"], json!("att-b"));
    assert_eq!(group(&listed, "blocked")["shown"], json!(0));
    assert_eq!(listed["totals"]["shown"], json!(1));
    assert_eq!(listed["totals"]["total"], json!(3));
}

#[test]
fn attention_list_state_scopes_reconcile_with_custody_truth() {
    let env = TestEnv::new("forged-attention-list-states");
    seed_attention_list_fixture(&env);

    let listed = attention_list(&env, &[]);
    let items = group(&listed, "quarantined")["items"]
        .as_array()
        .cloned()
        .expect("quarantined items");
    let address = |item: &Value| {
        (
            item["id"].as_str().expect("subject").to_owned(),
            item["attentionId"]
                .as_str()
                .expect("attention id")
                .to_owned(),
            item["occurrenceId"]
                .as_str()
                .expect("occurrence id")
                .to_owned(),
        )
    };
    let (subject_a, attention_a, occurrence_a) = address(&items[0]);
    let (subject_b, attention_b, occurrence_b) = address(&items[1]);
    let (code, acknowledged) = env.forged(&[
        "attention",
        "acknowledge",
        "--subject",
        &subject_a,
        "--attention-id",
        &attention_a,
        "--occurrence-id",
        &occurrence_a,
        "--actor",
        "lead-agent",
    ]);
    assert_eq!(code, 0, "{acknowledged}");
    let (code, resolved) = env.forged(&[
        "attention",
        "resolve",
        "--subject",
        &subject_b,
        "--attention-id",
        &attention_b,
        "--occurrence-id",
        &occurrence_b,
        "--actor",
        "operator",
        "--disposition",
        "accepted-risk",
        "--note",
        "reviewed",
    ]);
    assert_eq!(code, 0, "{resolved}");

    // Default active: open plus acknowledged, resolved stripped — exactly
    // project_active's semantics.
    let active = attention_list(&env, &[]);
    assert_eq!(active["totals"]["total"], json!(2));
    assert_eq!(active["totals"]["open"], json!(1));
    assert_eq!(active["totals"]["acknowledged"], json!(1));
    assert_eq!(active["totals"]["resolved"], json!(0));

    // state=open excludes the acknowledged item.
    let open = attention_list(&env, &["--state", "open"]);
    assert_eq!(open["totals"]["total"], json!(1));
    assert_eq!(open["totals"]["open"], json!(1));
    assert_eq!(open["totals"]["acknowledged"], json!(0));
    assert_eq!(group(&open, "blocked")["total"], json!(1));

    // state=all serves the resolved occurrence and the totals reconcile:
    // open + acknowledged + resolved == total == decisions + symptoms.
    let all = attention_list(&env, &["--state", "all"]);
    assert_eq!(
        all["totals"],
        json!({
            "open": 1,
            "acknowledged": 1,
            "resolved": 1,
            "decisions": 2,
            "symptoms": 1,
            "shown": 3,
            "total": 3,
        })
    );
    let resolved_item = group(&all, "quarantined")["items"]
        .as_array()
        .into_iter()
        .flatten()
        .find(|item| item["id"] == json!(subject_b))
        .cloned()
        .expect("resolved occurrence is served under state=all");
    assert_eq!(resolved_item["state"], json!("resolved"));

    // The exact condition and classification filters narrow the same truth.
    let quarantined = attention_list(&env, &["--state", "all", "--condition", "quarantined"]);
    assert_eq!(quarantined["totals"]["total"], json!(2));
    assert_eq!(quarantined["totals"]["symptoms"], json!(0));
    let symptoms = attention_list(&env, &["--state", "all", "--classification", "symptom"]);
    assert_eq!(symptoms["totals"]["total"], json!(1));
    assert_eq!(symptoms["totals"]["decisions"], json!(0));
}

#[test]
fn attention_list_serves_ledger_backed_items_from_the_store() {
    let _guard = HomeBeadsGuard::new();
    let env = TestEnv::new("forged-attention-list-outage");
    env.forged(&["init"]);
    fabricate_run(&env, "att-outage");
    append(
        &env,
        "att-outage",
        "proto.quarantine",
        json!({"packetId": "att-outage/implement/0", "attemptId": 3, "reason": "stale token"}),
    );

    let listed = attention_list(&env, &[]);
    assert_eq!(
        listed["sourceHealth"]["ledger"]["state"],
        json!("available")
    );
    assert_eq!(listed["sourceHealth"]["beads"]["state"], json!("available"));
    assert_eq!(listed["sourceHealth"]["plan"]["state"], json!("available"));
    let quarantined = group(&listed, "quarantined");
    assert_eq!(quarantined["total"], json!(1));
    assert_eq!(quarantined["items"][0]["id"], json!("att-outage"));
}

#[test]
fn attention_list_filters_and_bounds_fail_closed() {
    let env = TestEnv::new("forged-attention-list-invalid");
    env.forged(&["init"]);
    for args in [
        vec!["attention", "list", "--repo", " "],
        vec!["attention", "list", "--condition", "needs-coffee"],
        vec!["attention", "list", "--limit", "0"],
        vec!["attention", "list", "--limit", "501"],
    ] {
        let (code, response) = env.forged(&args);
        assert_ne!(
            code, 0,
            "invalid attention_list filter unexpectedly widened: {response}"
        );
        assert_eq!(
            response["error"]["code"],
            json!("INVALID_REQUEST"),
            "{response}"
        );
    }
}

/// The repo scope is an exact match on the durable item repository: the
/// fixture's own repository keeps its item, a foreign repository keeps
/// none, and both answers state their totals. (Run-backed fixture items
/// carry the fabricated run's repo, so the positively scoped item here is
/// a plan-only blocked work whose repository is set explicitly.)
#[test]
fn attention_list_repo_scope_matches_the_durable_item_repository() {
    let env = TestEnv::new("forged-attention-list-repo-scope");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    env.set_work_field("plan-scope", "status", "blocked");
    env.set_work_field("plan-scope", "title", "Scoped blocked bead");
    env.set_work_repository("plan-scope", &repository);
    let listed = attention_list(&env, &["--repo", &repository]);
    assert_eq!(listed["totals"]["total"], json!(1), "{listed}");
    assert_eq!(
        group(&listed, "blocked")["items"][0]["id"],
        json!("plan-scope"),
        "{listed}"
    );
    let foreign = attention_list(&env, &["--repo", "/nowhere/else"]);
    assert_eq!(foreign["totals"]["total"], json!(0), "{foreign}");
    assert_eq!(foreign["groups"], json!([]), "{foreign}");
}

/// The subject id travels as the envelope `runId` (the CLI's `--subject`),
/// and `params.subjectId` — the name `attention_list` hands back — is an
/// accepted alias. Absence names both forms; disagreement refuses.
#[test]
fn attention_controls_accept_the_subject_id_alias() {
    let env = TestEnv::new("forged-attention-subject-alias");
    env.forged(&["init"]);
    fabricate_run(&env, "attention-run");
    append(
        &env,
        "attention-run",
        "proto.quarantine",
        json!({
            "packetId": "attention-run/implement/0",
            "attemptId": 7,
            "reason": "claim token is stale",
        }),
    );
    let item = quarantine(&overview(&env));
    let attention_id = item["attentionId"].as_str().expect("attention id");
    let occurrence_id = item["occurrenceId"].as_str().expect("occurrence id");
    let mut mcp = McpClient::new(&env);

    let base = json!({
        "attentionId": attention_id,
        "occurrenceId": occurrence_id,
        "actor": "operator",
    });

    let refused = mcp.call_tool(
        "attention_acknowledge",
        json!({"schemaVersion": 1, "params": base}),
    );
    assert_eq!(refused["ok"], json!(false), "{refused}");
    let message = refused["error"]["message"].as_str().expect("message");
    assert!(message.contains("params.subjectId"), "{message}");
    assert!(message.contains("runId"), "{message}");

    let mut conflicted = base.clone();
    conflicted["subjectId"] = json!("attention-run");
    let conflicted = mcp.call_tool(
        "attention_acknowledge",
        json!({"schemaVersion": 1, "runId": "another-run", "params": conflicted}),
    );
    assert_eq!(conflicted["ok"], json!(false), "{conflicted}");
    assert!(
        conflicted["error"]["message"]
            .as_str()
            .expect("message")
            .contains("conflicts"),
        "{conflicted}"
    );

    let mut aliased = base.clone();
    aliased["subjectId"] = json!("attention-run");
    let acknowledged = mcp.call_tool(
        "attention_acknowledge",
        json!({"schemaVersion": 1, "params": aliased}),
    );
    assert_eq!(acknowledged["ok"], json!(true), "{acknowledged}");
    assert_eq!(acknowledged["reused"], json!(false), "{acknowledged}");
    assert_eq!(quarantine(&overview(&env))["state"], json!("acknowledged"));

    // The two documented request forms share one idempotency identity: a
    // retry that switches from the alias form to the envelope form replays
    // the stored response instead of conflicting.
    let replayed = mcp.call_tool(
        "attention_acknowledge",
        json!({"schemaVersion": 1, "runId": "attention-run", "params": base}),
    );
    assert_eq!(replayed["ok"], json!(true), "{replayed}");
    assert_eq!(replayed["reused"], json!(true), "{replayed}");
}
