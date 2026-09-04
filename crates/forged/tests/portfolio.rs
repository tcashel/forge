//! `overview` with no scope — the portfolio. The one projection a caller
//! with no prior knowledge can ask for: every run and epic the ledger holds,
//! newest first and bounded, plus the rail naming what needs a human and the
//! durable evidence for it.
//!
//! Every condition here is fabricated from the source production writes it
//! to — an epic's own `input.required` event, a `proto.quarantine` row, an
//! attempt durably marked `revoking`, a usage row with a NULL cost — because
//! the rail's whole value is that it reads the ledger rather than guessing.

mod support;

use serde_json::{json, Value};
use support::{fabricate_epic, fabricate_run, McpClient, TestEnv};

fn portfolio(env: &TestEnv) -> Value {
    let (code, response) = env.forged(&["overview", "--detail", "full"]);
    assert_eq!(code, 0, "overview with no scope: {response}");
    assert_eq!(response["ok"], json!(true), "{response}");
    response["result"].clone()
}

fn entries(value: &Value) -> Vec<Value> {
    value["entries"]
        .as_array()
        .cloned()
        .unwrap_or_else(|| panic!("the portfolio carries an entries array: {value}"))
}

fn attention(value: &Value) -> Vec<Value> {
    value["attention"]
        .as_array()
        .cloned()
        .unwrap_or_else(|| panic!("the portfolio always carries an attention rail: {value}"))
}

fn item(value: &Value, id: &str, condition: &str) -> Value {
    attention(value)
        .into_iter()
        .find(|item| item["id"] == json!(id) && item["condition"] == json!(condition))
        .unwrap_or_else(|| panic!("the rail reports {id} as {condition}: {value}"))
}

/// Open one packet on `run_id`, claim it, and durably mark the attempt
/// `revoking` — the reclaim saga's first step, stopped before its kill.
fn fabricate_revoking(env: &TestEnv, run_id: &str, reason: &str) {
    use sha2::Digest as _;
    let sha: String = sha2::Sha256::digest(std::fs::read(&env.spec).expect("spec bytes"))
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect();
    let ledger = env.ledger();
    let packet_id = ledger
        .open_packet(forged_ledger::NewPacket {
            run_id: run_id.to_owned(),
            stage: forged_types::Stage::Implement,
            seq: 0,
            spec_path: env.spec.to_string_lossy().into_owned(),
            spec_sha256: sha.clone(),
            spec_revision: None,
            policy_revision: None,
            body_json: json!({"fabricated": true}).to_string(),
        })
        .expect("open packet");
    let attempt = ledger
        .claim_packet(
            &packet_id,
            &format!("forged:{packet_id}:0"),
            &forged_ledger::SpecFence::Sha256(sha),
        )
        .expect("claim packet");
    ledger
        .revoke_attempt(attempt.attempt_id, reason)
        .expect("revoke attempt");
    ledger.close().expect("close");
}

/// Record one usage row whose cost the provider never reported.
fn fabricate_unpriced_usage(env: &TestEnv, run_id: &str) {
    let ledger = env.ledger();
    ledger
        .record_usage(forged_ledger::NewUsage {
            run_id: run_id.to_owned(),
            packet_id: Some(format!("{run_id}/implement/0")),
            attempt_id: Some(1),
            provider: "codex".to_owned(),
            model: "gpt-5.6-sol".to_owned(),
            input_tokens: 1_000,
            output_tokens: 200,
            cache_read_tokens: None,
            cache_write_tokens: None,
            cost_usd: None,
            pricing_basis: None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        })
        .expect("record usage");
    ledger.close().expect("close");
}

/// Append one durable event under `id`, the way the writer that owns the
/// kind appends it.
fn append(env: &TestEnv, id: &str, kind: &str, payload: Value) {
    let ledger = env.ledger();
    ledger.append_event(Some(id), kind, payload).expect(kind);
    ledger.close().expect("close");
}

/// The whole guard, in one place: no scope is the portfolio, each single
/// scope still projects its own subject, and every combination stays
/// refused. The relaxation must not become a hole.
#[test]
fn no_scope_projects_the_portfolio_and_every_combination_stays_refused() {
    let env = TestEnv::new("forged-portfolio-guard");
    env.forged(&["init"]);
    fabricate_run(&env, "pf-slice");
    fabricate_epic(&env, "pf-epic");
    let mut mcp = McpClient::new(&env, None);

    let none = mcp.call_tool("overview", json!({"schemaVersion": 1, "params": {}}));
    assert_eq!(none["ok"], json!(true), "no scope is not a refusal: {none}");
    assert_eq!(none["result"]["kind"], json!("portfolio"));
    // An absent params object is the same request as an empty one.
    let bare = mcp.call_tool("overview", json!({"schemaVersion": 1}));
    assert_eq!(bare["result"]["kind"], json!("portfolio"), "{bare}");

    let run = mcp.call_tool(
        "overview",
        json!({"schemaVersion": 1, "params": {"run": "pf-slice"}}),
    );
    assert_eq!(run["result"]["kind"], json!("slice"), "{run}");
    let id = mcp.call_tool(
        "overview",
        json!({"schemaVersion": 1, "params": {"id": "pf-slice"}}),
    );
    assert_eq!(id["result"]["kind"], json!("slice"), "{id}");
    // A fabricated epic has a start event and no execution package, so the
    // epic projection refuses it on its own terms — which is the proof the
    // param still ROUTES there rather than being read as no scope at all.
    let epic = mcp.call_tool(
        "overview",
        json!({"schemaVersion": 1, "params": {"epic": "pf-epic"}}),
    );
    assert_eq!(epic["error"]["code"], json!("INTERNAL"), "{epic}");
    assert!(
        epic["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("execution package")),
        "the epic projection answered, not the param guard: {epic}"
    );

    for params in [
        json!({"run": "pf-slice", "epic": "pf-epic"}),
        json!({"run": "pf-slice", "id": "pf-slice"}),
        json!({"epic": "pf-epic", "id": "pf-epic"}),
        json!({"run": "pf-slice", "epic": "pf-epic", "id": "pf-slice"}),
        // The portfolio is addressed by ABSENCE, so a scope key PRESENT and
        // naming nothing keeps the refusal it has always drawn. Without
        // this, a caller whose id interpolation produced "" would silently
        // widen from the one subject it meant to the whole ledger.
        json!({"run": ""}),
        json!({"epic": ""}),
        json!({"id": ""}),
    ] {
        let refused = mcp.call_tool("overview", json!({"schemaVersion": 1, "params": params}));
        assert_eq!(
            refused["ok"],
            json!(false),
            "a scope that names nothing is still refused: {refused}"
        );
        assert_eq!(
            refused["error"]["code"],
            json!("INVALID_REQUEST"),
            "{refused}"
        );
    }

    // Same guard over the CLI: `forged overview` with no flags is the
    // portfolio, and a flag passed with an empty value is refused rather
    // than widening to it. The CLI omits an unpassed flag instead of
    // sending null, so the two surfaces send the same request.
    let (code, cli_bare) = env.forged(&["overview"]);
    assert_eq!(code, 0, "{cli_bare}");
    assert_eq!(cli_bare["result"]["kind"], json!("portfolio"), "{cli_bare}");
    let (_, cli_empty) = env.forged(&["overview", "--run", ""]);
    assert_eq!(cli_empty["ok"], json!(false), "{cli_empty}");
    assert_eq!(
        cli_empty["error"]["code"],
        json!("INVALID_REQUEST"),
        "{cli_empty}"
    );
}

/// The payload's two pinned strings, and the entry keys it carries: the
/// portfolio adds no per-row field, so an entry is the inventory row the
/// discovery surface already serves.
#[test]
fn the_portfolio_is_an_overview_payload_carrying_inventory_entries() {
    let env = TestEnv::new("forged-portfolio-shape");
    env.forged(&["init"]);
    fabricate_run(&env, "pf-slice");
    fabricate_epic(&env, "pf-epic");

    let value = portfolio(&env);
    assert_eq!(value["schema"], json!("forged.overview/1"));
    assert_eq!(value["kind"], json!("portfolio"));

    let entries = entries(&value);
    assert_eq!(entries.len(), 2, "{value}");
    let slice = entries
        .iter()
        .find(|entry| entry["id"] == json!("pf-slice"))
        .unwrap_or_else(|| panic!("the portfolio lists the slice: {value}"));
    for key in [
        "id",
        "kind",
        "beadId",
        "repo",
        "branch",
        "state",
        "createdAt",
        "updatedAt",
    ] {
        assert!(
            slice[key].is_string(),
            "an entry carries {key} as a string: {slice}"
        );
    }
    assert_eq!(slice["kind"], json!("slice"));
    assert_eq!(slice["stopReason"], Value::Null);
    assert_eq!(slice["liveSeats"], json!(0));
    // Absent usage is data: a run with no rows costs zero rather than
    // failing, and says so with the same keys `work list` uses.
    assert_eq!(slice["costUsdKnown"], json!(0.0));
    assert_eq!(slice["rowsMissingCost"], json!(0));
    let epic = entries
        .iter()
        .find(|entry| entry["id"] == json!("pf-epic"))
        .unwrap_or_else(|| panic!("the portfolio lists the epic: {value}"));
    assert_eq!(epic["kind"], json!("epic"), "{value}");

    // An empty rail is an answer, not an omission.
    assert_eq!(value["attention"], json!([]));
    assert_eq!(value["attentionTotal"], json!(0));
    assert_eq!(
        value["spend"],
        json!({"costUsdKnown": 0.0, "rowsMissingCost": 0})
    );
    // The portfolio is the level above a subject, so it carries no id and
    // no event page.
    assert_eq!(value["id"], Value::Null);
    assert_eq!(value["events"], Value::Null);
}

/// An empty ledger answers with an empty portfolio rather than refusing:
/// "nothing is running" is the answer to "what is running".
#[test]
fn an_empty_ledger_answers_with_an_empty_portfolio() {
    let env = TestEnv::new("forged-portfolio-empty");
    env.forged(&["init"]);

    let value = portfolio(&env);
    assert_eq!(value["kind"], json!("portfolio"));
    assert_eq!(value["entries"], json!([]));
    assert_eq!(value["total"], json!(0));
    assert_eq!(value["attention"], json!([]));
    assert_eq!(value["liveSeats"], json!(0));
}

#[test]
fn work_list_and_no_scope_overview_share_the_same_operator_groups() {
    let env = TestEnv::new("forged-portfolio-shared-queue");
    env.forged(&["init"]);
    fabricate_run(&env, "pf-queued");

    let overview = portfolio(&env);
    let (code, listed) = env.forged(&["work", "list", "--detail", "full"]);
    assert_eq!(code, 0, "work list: {listed}");
    let overview_groups = overview["queue"]["groups"]
        .as_array()
        .expect("overview queue groups");
    let listed_groups = listed["result"]["queue"]["groups"]
        .as_array()
        .expect("work-list queue groups");
    assert_eq!(
        overview_groups
            .iter()
            .map(|group| (&group["name"], &group["count"]))
            .collect::<Vec<_>>(),
        listed_groups
            .iter()
            .map(|group| (&group["name"], &group["count"]))
            .collect::<Vec<_>>(),
        "both surfaces use one grouping contract"
    );
    assert_eq!(
        overview_groups
            .iter()
            .flat_map(|group| group["entries"].as_array().into_iter().flatten())
            .map(|entry| entry["id"].clone())
            .collect::<Vec<_>>(),
        vec![json!("pf-queued")]
    );
}

/// Each condition names its subject, its condition, and the durable row it
/// was read from. All four come from ONE snapshot — the same one the
/// entries come from.
#[test]
fn the_rail_names_every_condition_with_the_evidence_for_it() {
    let env = TestEnv::new("forged-portfolio-rail");
    env.forged(&["init"]);
    fabricate_run(&env, "pf-revoking");
    fabricate_run(&env, "pf-quarantined");
    fabricate_run(&env, "pf-unpriced");
    fabricate_epic(&env, "pf-holding");

    append(
        &env,
        "pf-holding",
        "forged.epic.input.required",
        json!({"code": "bd-unready", "childId": "pf-child", "detail": "the bead is not ready"}),
    );
    fabricate_revoking(&env, "pf-revoking", "the seat stopped heartbeating");
    append(
        &env,
        "pf-quarantined",
        "proto.quarantine",
        json!({
            "packetId": "pf-quarantined/implement/0",
            "attemptId": 7,
            "reason": "claim token is no longer live",
        }),
    );
    fabricate_unpriced_usage(&env, "pf-unpriced");

    let value = portfolio(&env);
    assert_eq!(value["attentionTotal"], json!(4), "{value}");

    let holding = item(&value, "pf-holding", "input-required");
    assert_eq!(holding["kind"], json!("epic"));
    assert_eq!(holding["evidence"]["code"], json!("bd-unready"));
    assert_eq!(holding["evidence"]["childId"], json!("pf-child"));
    assert!(
        holding["detail"]
            .as_str()
            .is_some_and(|detail| detail.contains("bd-unready")),
        "the detail names the code: {holding}"
    );

    let revoking = item(&value, "pf-revoking", "revoking");
    assert_eq!(revoking["kind"], json!("slice"));
    assert_eq!(
        revoking["evidence"]["reason"],
        json!("the seat stopped heartbeating")
    );
    assert_eq!(
        revoking["evidence"]["packetId"],
        json!("pf-revoking/implement/0")
    );

    let quarantined = item(&value, "pf-quarantined", "quarantined");
    assert_eq!(
        quarantined["evidence"]["reason"],
        json!("claim token is no longer live")
    );
    assert_eq!(quarantined["evidence"]["attemptId"], json!(7));

    // Spend is measured: the unpriced row is surfaced on the entry, in the
    // rail, and in the portfolio total, so a partial figure never reads as
    // a complete one.
    let unpriced = item(&value, "pf-unpriced", "missing-cost");
    assert_eq!(unpriced["evidence"]["rowsMissingCost"], json!(1));
    assert_eq!(value["spend"]["rowsMissingCost"], json!(1));
    let entry = entries(&value)
        .into_iter()
        .find(|entry| entry["id"] == json!("pf-unpriced"))
        .expect("the unpriced run is listed");
    assert_eq!(entry["rowsMissingCost"], json!(1));
    assert_eq!(entry["costUsdKnown"], json!(0.0));

    // Closed severity order: critical custody, high human input, medium
    // automated reclaim, then low partial-spend evidence.
    let conditions: Vec<Value> = attention(&value)
        .iter()
        .map(|item| item["condition"].clone())
        .collect();
    assert_eq!(
        conditions,
        vec![
            json!("quarantined"),
            json!("input-required"),
            json!("revoking"),
            json!("missing-cost"),
        ],
        "{value}"
    );
}

#[test]
fn settled_slices_remain_visible_at_the_operator_boundary() {
    let env = TestEnv::new("forged-portfolio-settled");
    env.forged(&["init"]);
    for run in ["pf-blocked", "pf-ready", "pf-beads-pending"] {
        fabricate_run(&env, run);
    }
    let ledger = env.ledger();
    ledger
        .settle_run(
            "pf-blocked",
            forged_ledger::RunOutcome::Blocked,
            "migration choice is unresolved".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle blocked run");
    ledger
        .settle_run(
            "pf-ready",
            forged_ledger::RunOutcome::Clean,
            "review approved".to_owned(),
            None,
            None,
            None,
        )
        .expect("settle clean run");
    ledger
        .append_event(
            Some("pf-ready"),
            "proto.pr",
            json!({"number": 88, "base": "main", "isDraft": true}),
        )
        .expect("record delivery PR");
    ledger
        .append_event(
            Some("pf-beads-pending"),
            "run.bead-settlement.pending",
            json!({
                "beadId": "bead-pf-beads-pending",
                "outcome": "blocked",
                "error": "team Beads server is unavailable",
            }),
        )
        .expect("record pending Beads write");
    ledger.close().expect("close ledger");

    let value = portfolio(&env);
    assert_eq!(value["attentionTotal"], json!(3), "{value}");
    assert_eq!(
        item(&value, "pf-blocked", "blocked")["evidence"]["outcome"],
        json!("blocked")
    );
    assert_eq!(
        item(&value, "pf-ready", "merge-approval")["evidence"]["pr"],
        json!(88)
    );
    assert_eq!(
        item(&value, "pf-beads-pending", "beads-settlement-pending")["evidence"]["error"],
        json!("team Beads server is unavailable")
    );

    append(
        &env,
        "pf-beads-pending",
        "run.bead-settlement.succeeded",
        json!({
            "schema": "forged.bead-settlement/1",
            "beadId": "bead-pf-beads-pending",
            "outcome": "blocked",
            "settled": true,
        }),
    );
    let reconciled = portfolio(&env);
    assert_eq!(reconciled["attentionTotal"], json!(2), "{reconciled}");
    assert!(attention(&reconciled)
        .iter()
        .all(|item| item["condition"] != json!("beads-settlement-pending")));
}

/// An epic that got its answer is no longer holding: the LATER of the two
/// input events decides, so a resolved hold leaves the rail.
#[test]
fn a_resolved_hold_leaves_the_rail() {
    let env = TestEnv::new("forged-portfolio-resolved");
    env.forged(&["init"]);
    fabricate_epic(&env, "pf-answered");
    append(
        &env,
        "pf-answered",
        "forged.epic.input.required",
        json!({"code": "bd-unready", "childId": "pf-child", "detail": "the bead is not ready"}),
    );
    let held = portfolio(&env);
    assert_eq!(held["attentionTotal"], json!(1), "{held}");

    append(
        &env,
        "pf-answered",
        "forged.epic.input.resolved",
        json!({"code": "bd-unready", "childId": "pf-child"}),
    );
    let answered = portfolio(&env);
    assert_eq!(answered["attention"], json!([]), "{answered}");
    assert_eq!(answered["attentionTotal"], json!(0));
}

/// The bound: an inventory larger than the cap reports the NEWEST entries,
/// states the total, and states the cap — so a consumer distinguishes a
/// complete answer from a truncated one instead of guessing.
#[test]
fn a_ledger_past_the_cap_reports_the_newest_entries_and_states_the_total() {
    let env = TestEnv::new("forged-portfolio-cap");
    env.forged(&["init"]);
    let ledger = env.ledger();
    // Zero-padded ids: `created_at` ties inside one second are broken by id,
    // so the newest-first order is the reverse of this sequence.
    for seq in 0..=200 {
        ledger
            .create_run(forged_ledger::NewRun {
                run_id: forged_types::RunId::new(format!("pf-{seq:03}")).expect("run id"),
                work_id: format!("bead-pf-{seq:03}"),
                repo: env.repos.repo.to_string_lossy().into_owned(),
                base_ref: env.repos.base.clone(),
                branch: format!("forged/pf-{seq:03}"),
            })
            .expect("create run");
    }
    ledger.close().expect("close");

    let value = portfolio(&env);
    let cap = value["cap"]
        .as_u64()
        .unwrap_or_else(|| panic!("the portfolio states its cap: {value}"));
    assert_eq!(value["total"], json!(201), "the total is the whole ledger");
    let entries = entries(&value);
    assert_eq!(entries.len() as u64, cap, "the page is exactly the cap");
    assert_eq!(entries[0]["id"], json!("pf-200"), "newest first");
    assert!(
        !entries.iter().any(|entry| entry["id"] == json!("pf-000")),
        "the oldest entry is the one truncated away"
    );
}

/// The two overview projections stopped contradicting each other. The
/// portfolio's durable-only group states what it excluded rather than
/// reporting 0 while Operations reports the same instant differently.
#[test]
fn a_compatibility_group_states_what_it_excluded_instead_of_reporting_zero() {
    let env = TestEnv::new("forged-portfolio-excluded");
    env.forged(&["init"]);
    fabricate_run(&env, "pf-durable");
    env.set_work_field("bead-pf-durable", "status", "open");
    for plan in ["pf-plan-one", "pf-plan-two"] {
        env.set_work_field(plan, "title", "Planned only");
        env.set_work_field(plan, "status", "open");
    }

    let value = portfolio(&env);
    let groups = value["queue"]["groups"]
        .as_array()
        .unwrap_or_else(|| panic!("the portfolio carries queue groups: {value}"));
    let planned = groups
        .iter()
        .find(|group| group["name"] == json!("Planned"))
        .unwrap_or_else(|| panic!("the Planned group is present: {value}"));

    let durable = planned["entries"].as_array().expect("group entries").len();
    let excluded = planned["excluded"]["livePlan"]
        .as_u64()
        .expect("excluded live-plan count") as usize;
    assert_eq!(durable, 1, "one durable row: {planned}");
    assert_eq!(excluded, 2, "two live-plan rows: {planned}");
    assert_eq!(planned["count"], json!(durable), "{planned}");
    assert_eq!(planned["shown"], json!(durable + excluded), "{planned}");
    assert_eq!(planned["code"], json!("planned"), "{planned}");
    // `total` is the source group's own total, so it stays honest past the
    // page cap where `total - count` would invent rows.
    assert_eq!(planned["total"], json!(durable + excluded), "{planned}");

    // The verbatim Operations counts and additive coverage ride the header;
    // `entries` keeps its legacy durable-only boundary.
    assert_eq!(value["counts"]["planOnly"], json!(2), "{value}");
    assert_eq!(value["counts"]["durable"], json!(1), "{value}");
    assert_eq!(value["coverage"]["shown"], json!(3), "{value}");
    assert_eq!(value["coverage"]["total"], json!(3), "{value}");
    assert_eq!(value["coverage"]["nextCursor"], Value::Null, "{value}");
    let rows = entries(&value);
    assert_eq!(rows.len(), 1, "{value}");
    assert!(
        rows.iter().all(|entry| entry["source"] == json!("durable")),
        "{value}"
    );
}
