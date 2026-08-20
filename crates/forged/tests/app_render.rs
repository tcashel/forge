//! Renderer-level tests for the App's Cost tab, candidate chooser, and
//! portfolio root view.
//!
//! The spend header is the one place the projection can lie to an operator:
//! an epic whose codex seats were priced from the operator's rate card must
//! not claim the provider billed it. These tests run `viewCost` out of
//! `assets/overview.html` itself against a DOM shim, so the assertion is on
//! what the tab renders — not on a Rust recomputation of its arithmetic,
//! which would still pass if the header stopped reading `usage.rows`.

mod support;

use std::process::Command;

use serde_json::{json, Value};
use support::{
    render_cost, render_dispatch, render_dispatch_before_server_tools,
    render_dispatch_without_server_tools, render_resolution,
    render_resolution_without_server_tools, require_node, run_agent_sessions_host,
    run_split_app_host, run_split_app_host_scenario,
};

/// One hoisted per-seat row, the shape `epic_overview` stamps.
fn row(run_id: &str, seat: &str, basis: &str, cost: f64, searches: u64) -> Value {
    json!({
        "runId": run_id,
        "packetId": format!("{run_id}/{seat}/0"),
        "attemptId": 1,
        "provider": if basis == "imputed_api_rate" { "codex" } else { "claude" },
        "model": "gpt-5.6-sol",
        "inputTokens": 1_000,
        "cacheReadTokens": 500,
        "outputTokens": 200,
        "costUsd": cost,
        "pricingBasis": basis,
        "webSearchRequests": searches,
    })
}

/// An epic projection carrying `rows`, in the shape `epic_overview` emits.
fn epic(rows: Vec<Value>) -> Value {
    let known: f64 = rows.iter().filter_map(|r| r["costUsd"].as_f64()).sum();
    json!({
        "kind": "epic",
        "id": "epic-one",
        "usage": {
            "rows": rows,
            "totals": {
                "inputTokens": 1_900,
                "cacheReadTokens": 600,
                "outputTokens": 250,
                "costUsdKnown": known,
                "rowsMissingCost": 0,
            },
            "pricing": {
                "ratesAsOf": "2026-05-01",
                "source": "operator rate card",
                "webSearchPer1k": 10.0,
            },
        },
    })
}

#[test]
fn an_epic_with_an_imputed_child_row_does_not_render_as_fully_billed() {
    let Some(node) = require_node() else { return };
    let rendered = render_cost(
        &node,
        &epic(vec![
            row("child-one", "implementation", "imputed_api_rate", 0.25, 2),
            row("child-two", "review-1", "billed", 0.75, 0),
        ]),
    );
    assert_eq!(
        rendered.spend_subtitle(),
        "$0.75 billed · $0.25 imputed",
        "the epic splits imputed spend out of the billed total: {}",
        rendered.text
    );
    assert!(
        !rendered.text.contains("provider-billed"),
        "an epic whose child ran a codex seat renders as provider-billed: {}",
        rendered.text
    );
}

/// The control for the assertion above: the header still says
/// "provider-billed" when nothing was imputed, so the test is not passing on
/// a header that never renders that string at all.
#[test]
fn an_epic_whose_child_rows_were_all_billed_still_renders_as_provider_billed() {
    let Some(node) = require_node() else { return };
    let rendered = render_cost(
        &node,
        &epic(vec![row("child-one", "implementation", "billed", 0.75, 0)]),
    );
    assert_eq!(
        rendered.spend_subtitle(),
        "provider-billed",
        "a fully billed epic reads as provider-billed: {}",
        rendered.text
    );
}

/// The other three things the spend header derives from `usage.rows`. Before
/// the hoist an epic rendered "—" priced attempts, no web-searches stat, and
/// the by-seat empty state.
#[test]
fn an_epic_counts_web_searches_attempts_and_seats_from_its_hoisted_rows() {
    let Some(node) = require_node() else { return };
    let rendered = render_cost(
        &node,
        &epic(vec![
            row("child-one", "implementation", "imputed_api_rate", 0.25, 2),
            row("child-two", "review-1", "billed", 0.75, 1),
        ]),
    );
    assert_eq!(rendered.stat("priced attempts"), "2", "{}", rendered.text);
    assert_eq!(rendered.stat("web searches"), "3", "{}", rendered.text);
    // Each row names the child that spent it, and the seat comes from the
    // packet id rather than the packet-row map, which is empty on an epic.
    assert!(
        rendered.text.contains("implementation · R0") && rendered.text.contains("child-one"),
        "the by-seat panel labels each hoisted row with its child run: {}",
        rendered.text
    );
    assert!(
        !rendered
            .text
            .contains("Per-seat rows live on each child run."),
        "the epic no longer defers per-seat rows to the children: {}",
        rendered.text
    );
}

/// An epic that genuinely spent nothing keeps the empty state — absent usage
/// is data, not a broken projection.
#[test]
fn an_epic_with_no_usage_renders_the_empty_state() {
    let Some(node) = require_node() else { return };
    let rendered = render_cost(&node, &epic(Vec::new()));
    assert!(
        rendered
            .text
            .contains("No usage recorded on any child run."),
        "an epic with no rows says so: {}",
        rendered.text
    );
}

// ------------------------------------------------------------ resolution

/// An unresolvable id degrades into a menu: the guard at `ingest` still
/// rejects an unknown schema, so a `resolution` payload stays on
/// `forged.overview/1` and the view has to draw it rather than fall through
/// to "a payload this view does not know how to draw".
#[test]
fn an_ambiguous_id_renders_every_candidate_with_its_kind_and_state() {
    let Some(node) = require_node() else { return };
    let rendered = render_resolution(
        &node,
        &json!({
            "query": "beads-mk2",
            "reason": "ambiguous",
            "candidates": [
                {"id": "beads-mk2.1", "kind": "slice", "state": "active", "beadId": "beads-mk2.1"},
                {"id": "beads-mk2.2", "kind": "epic", "state": "stopped", "beadId": "beads-mk2.2"},
            ],
        }),
    );
    for expected in [
        "beads-mk2.1",
        "beads-mk2.2",
        "slice",
        "epic",
        "active",
        "stopped",
    ] {
        assert!(
            rendered.text.contains(expected),
            "the chooser names {expected}: {}",
            rendered.text
        );
    }
    // Picking a candidate re-asks with the explicit param its kind implies —
    // never with the id that failed to resolve.
    let picks: Vec<Value> = rendered
        .nodes
        .iter()
        .filter_map(|n| n.get("picks").cloned())
        .collect();
    assert_eq!(
        picks.len(),
        2,
        "every candidate is pickable: {}",
        rendered.text
    );
    assert_eq!(picks[0]["params"], json!({"run": "beads-mk2.1"}));
    assert_eq!(picks[1]["params"], json!({"epic": "beads-mk2.2"}));
}

/// "Nothing could have been meant" is an answer, and the chooser says so
/// instead of rendering an empty grid.
#[test]
fn an_unknown_id_renders_an_empty_state_rather_than_an_empty_grid() {
    let Some(node) = require_node() else { return };
    let rendered = render_resolution(
        &node,
        &json!({"query": "nothing", "reason": "unknown", "candidates": []}),
    );
    assert!(
        rendered.text.contains("Nothing in the ledger matches"),
        "an unknown id says so: {}",
        rendered.text
    );
}

// --------------------------------------------------- dispatch, not just view

/// The chooser tests above call `viewResolution` directly, so they would all
/// still pass if `render` stopped routing a resolution payload to it. This
/// enters where the host enters — one envelope into `ingest` — and asserts
/// the branch was actually taken.
#[test]
fn a_resolution_envelope_reaches_the_chooser_through_ingest_and_render() {
    let Some(node) = require_node() else { return };
    let dispatched = render_dispatch(
        &node,
        &json!({
            "ok": true,
            "result": {
                "schema": "forged.overview/1",
                "resolution": {
                    "query": "beads-mk",
                    "reason": "ambiguous",
                    "candidates": [
                        {"id": "beads-mk2", "kind": "slice", "state": "active", "beadId": "beads-mk2"},
                        {"id": "beads-mk9", "kind": "epic", "state": "stopped", "beadId": "beads-mk9"},
                    ],
                },
            },
        }),
    );
    assert!(
        dispatched.error.is_null(),
        "a resolution is not an error: {}",
        dispatched.error
    );
    assert_eq!(
        dispatched.ident, "beads-mk",
        "the identity line carries the id that failed to resolve: {}",
        dispatched.text
    );
    assert_eq!(dispatched.chips, vec!["ambiguous".to_owned()]);
    assert!(
        dispatched.tabs_hidden,
        "a resolution has no single subject, so it draws no tabs: {}",
        dispatched.text
    );
    assert_eq!(
        dispatched.picks(),
        vec![
            json!({"schemaVersion": 1, "params": {"run": "beads-mk2"}}),
            json!({"schemaVersion": 1, "params": {"epic": "beads-mk9"}}),
        ],
        "each candidate re-asks with the explicit param its kind implies: {}",
        dispatched.text
    );
}

/// Refresh is offered on a resolution view, so it must have something to
/// send. `state.args` falls back to the query itself: re-asking the same
/// question is meaningful, because candidates are live work and one that was
/// ambiguous a minute ago can resolve on its own.
#[test]
fn a_resolution_leaves_refresh_able_to_re_ask_the_same_question() {
    let Some(node) = require_node() else { return };
    let dispatched = render_dispatch(
        &node,
        &json!({
            "schema": "forged.overview/1",
            "resolution": {"query": "beads-mk", "reason": "ambiguous", "candidates": []},
        }),
    );
    assert!(
        !dispatched.controls_hidden,
        "the resolution view offers Refresh: {}",
        dispatched.text
    );
    assert_eq!(
        dispatched.args,
        json!({"schemaVersion": 1, "params": {"id": "beads-mk"}}),
        "so Refresh re-asks the same id rather than sending nothing"
    );
}

// ------------------------------------------------------------- portfolio

/// One portfolio payload, in the shape `portfolio_overview` emits.
fn portfolio(entries: Vec<Value>, attention: Vec<Value>) -> Value {
    let (total, held) = (entries.len(), attention.len());
    json!({
        "schema": "forged.overview/1",
        "kind": "portfolio",
        "entries": entries,
        "total": total,
        "cap": 200,
        "liveSeats": 2,
        "attention": attention,
        "attentionTotal": held,
        "spend": {"costUsdKnown": 1.25, "rowsMissingCost": 3},
    })
}

/// The root view, entered where the host enters. Lifting `viewPortfolio` and
/// calling it directly would prove the grid draws and prove nothing about
/// whether a portfolio payload ever reaches it — the gap the dispatch
/// harness exists to close.
#[test]
fn a_portfolio_envelope_reaches_the_root_view_through_ingest_and_render() {
    let Some(node) = require_node() else { return };
    let dispatched = render_dispatch(
        &node,
        &json!({"ok": true, "result": portfolio(
            vec![
                json!({"id": "pf-epic", "kind": "epic", "beadId": "pf-epic", "state": "active",
                       "branch": "forged/epic-pf-epic", "liveSeats": 0, "costUsdKnown": 0.0,
                       "rowsMissingCost": 3}),
                json!({"id": "pf-slice", "kind": "slice", "beadId": "bead-pf-slice",
                       "state": "active", "branch": "forged/pf-slice", "liveSeats": 2,
                       "costUsdKnown": 1.25, "rowsMissingCost": 0}),
            ],
            Vec::new(),
        )}),
    );
    assert!(
        dispatched.error.is_null(),
        "a portfolio is not an error: {}",
        dispatched.error
    );
    assert_eq!(
        dispatched.ident, "all work",
        "the portfolio has no subject to name: {}",
        dispatched.text
    );
    assert!(
        dispatched.tabs_hidden,
        "the portfolio is the level above a subject, so it draws no tabs: {}",
        dispatched.text
    );
    for expected in ["pf-epic", "pf-slice", "epic", "slice", "2 live", "$1.25"] {
        assert!(
            dispatched.text.contains(expected),
            "the root view renders {expected}: {}",
            dispatched.text
        );
    }
    // Clicking an entry re-asks under the explicit param its kind implies —
    // the same `choose` the candidate chooser has always used.
    assert_eq!(
        dispatched.picks(),
        vec![
            json!({"schemaVersion": 1, "params": {"epic": "pf-epic"}}),
            json!({"schemaVersion": 1, "params": {"run": "pf-slice"}}),
        ],
        "each entry drills in under its own kind: {}",
        dispatched.text
    );
    // And Refresh re-asks for the portfolio itself: it is addressed by
    // absence, never by a `run` key holding an id the payload never had.
    assert_eq!(
        dispatched.args,
        json!({"schemaVersion": 1, "params": {}}),
        "the portfolio re-asks with no scope"
    );
}

#[test]
fn the_portfolio_renders_the_shared_operator_queue_groups_and_actions() {
    let Some(node) = require_node() else { return };
    let entry = json!({
        "id": "queue-run",
        "kind": "slice",
        "beadId": "bead-queue-run",
        "title": "Renamed live title",
        "identity": {"displayTitle": "Make work legible [repositories/forge]"},
        "state": "active",
        "nextAction": "Submit a detached controller when this work should start",
    });
    let mut payload = portfolio(vec![entry.clone()], Vec::new());
    payload["queue"] = json!({
        "total": 1,
        "groups": [
            {"name": "Needs me", "count": 0, "entries": []},
            {"name": "Ready to merge", "count": 0, "entries": []},
            {"name": "Running", "count": 0, "entries": []},
            {"name": "Stalled or recoverable", "count": 0, "entries": []},
            {"name": "Planned", "count": 1, "entries": [entry]},
        ],
    });
    let dispatched = render_dispatch(&node, &json!({"ok": true, "result": payload}));
    for expected in [
        "Needs me",
        "Ready to merge",
        "Running",
        "Stalled or recoverable",
        "Planned",
        "Make work legible [repositories/forge]",
        "Next: Submit a detached controller",
    ] {
        assert!(
            dispatched.text.contains(expected),
            "the queue renders {expected}: {}",
            dispatched.text
        );
    }
    assert!(
        !dispatched.text.contains("Renamed live title"),
        "the App prefers the durable display identity: {}",
        dispatched.text
    );
}

/// The one operator-visible lie this slice produces the data to replace: the
/// durable group counted 0 while conditions were open, and the App printed
/// `nothing is waiting` over the top of them.
#[test]
fn the_portfolio_never_says_nothing_is_waiting_while_conditions_are_open() {
    let Some(node) = require_node() else { return };
    let entry = json!({
        "id": "held-run",
        "kind": "slice",
        "beadId": "bead-held-run",
        "identity": {"displayTitle": "bead-held-run [repositories/forge]"},
        "titleSource": {
            "known": true,
            "value": "Repair the bead read [repositories/forge]",
            "source": "beads.title",
            "beadId": "bead-held-run",
        },
        "state": "active",
    });
    let mut payload = portfolio(
        vec![entry.clone()],
        vec![json!({
            "id": "held-run",
            "kind": "slice",
            "condition": "blocked",
            "severity": "high",
            "detail": "an open condition",
        })],
    );
    payload["queue"] = json!({
        "total": 18,
        "groups": [
            {"name": "Needs me", "count": 1, "entries": [entry],
             "code": "needs-me", "shown": 18, "total": 18,
             "excluded": {"livePlan": 17}},
        ],
    });
    let dispatched = render_dispatch(&node, &json!({"ok": true, "result": payload}));
    assert!(
        !dispatched.text.contains("nothing is waiting"),
        "an open condition contradicts the sentence: {}",
        dispatched.text
    );
    assert!(
        dispatched.text.contains("+17 planned"),
        "excluded plan rows are secondary context: {}",
        dispatched.text
    );
    // Secondary context, never summed into the headline.
    assert!(
        dispatched.text.contains("1\nneeds me"),
        "the headline is the durable group's own count: {}",
        dispatched.text
    );
    assert!(
        !dispatched.text.contains("18\nneeds me"),
        "the excluded rows are never summed into the headline: {}",
        dispatched.text
    );
    // A live title is rendered, and marked as a current read rather than
    // presented as launch evidence.
    assert!(
        dispatched
            .text
            .contains("Repair the bead read [repositories/forge]"),
        "the resolved title reaches the card: {}",
        dispatched.text
    );
    assert!(
        dispatched.text.contains("live title"),
        "a current Beads read is marked live: {}",
        dispatched.text
    );
}

/// The rail is the answer to "what needs a human", so it has to be drawn
/// from the payload's own conditions rather than re-derived by the App.
#[test]
fn the_portfolio_draws_every_attention_entry_it_was_given() {
    let Some(node) = require_node() else { return };
    let dispatched = render_dispatch(
        &node,
        &json!({"ok": true, "result": portfolio(
            vec![json!({"id": "pf-epic", "kind": "epic", "state": "active"})],
            vec![
                json!({"id": "pf-epic", "kind": "epic", "condition": "input-required",
                       "detail": "pf-child is holding on bd-unready: the bead is not ready",
                       "evidence": {"code": "bd-unready"}}),
                json!({"id": "pf-slice", "kind": "slice", "condition": "missing-cost",
                       "detail": "3 usage rows carry no cost, so the spend shown is partial",
                       "evidence": {"rowsMissingCost": 3}}),
            ],
        )}),
    );
    let held = dispatched
        .rail_item("input required")
        .unwrap_or_else(|| panic!("the rail names the hold: {:?}", dispatched.rail));
    let detail = held["detail"].as_str().unwrap_or_default();
    assert!(
        detail.contains("pf-epic") && detail.contains("bd-unready"),
        "a rail item states its id and its evidence: {detail}"
    );
    assert!(
        dispatched.rail_item("missing cost").is_some(),
        "every condition reaches the rail: {:?}",
        dispatched.rail
    );
    // The count is of CONDITIONS, and it says so. These two sit on two
    // different subjects here, but one run can raise several at once —
    // "2 need a human" would then claim two subjects are waiting when one
    // is, which is a lie about the size of the queue.
    assert_eq!(
        dispatched.chips,
        vec![
            "1 in the ledger".to_owned(),
            "2 conditions need a human".to_owned()
        ],
        "the identity strip counts the ledger and the conditions waiting"
    );
}

/// An empty rail is a successful answer meaning nothing needs attention, and
/// an empty portfolio is not a broken projection.
#[test]
fn an_empty_portfolio_draws_an_empty_state_and_no_rail() {
    let Some(node) = require_node() else { return };
    let dispatched = render_dispatch(
        &node,
        &json!({"ok": true, "result": {
            "schema": "forged.overview/1",
            "kind": "portfolio",
            "entries": [],
            "total": 0,
            "cap": 200,
            "liveSeats": 0,
            "attention": [],
            "attentionTotal": 0,
            "spend": {"costUsdKnown": 0.0, "rowsMissingCost": 0},
        }}),
    );
    assert!(dispatched.rail.is_empty(), "{:?}", dispatched.rail);
    assert!(
        dispatched.text.contains("Nothing in the ledger yet"),
        "an empty ledger says so: {}",
        dispatched.text
    );
    assert!(
        dispatched.picks().is_empty(),
        "there is nothing to drill into: {}",
        dispatched.text
    );
}

/// The bound reaches the operator: a truncated page says which slice of the
/// ledger it is, so a complete answer is distinguishable from a partial one.
#[test]
fn a_truncated_portfolio_says_it_is_showing_only_the_newest() {
    let Some(node) = require_node() else { return };
    let mut payload = portfolio(
        vec![json!({"id": "pf-one", "kind": "slice", "state": "active"})],
        Vec::new(),
    );
    payload["total"] = json!(201);
    let dispatched = render_dispatch(&node, &json!({"ok": true, "result": payload}));
    assert!(
        dispatched.text.contains("newest 1 of 201"),
        "the page states its bound: {}",
        dispatched.text
    );
}

/// The schema guard is what makes the resolution contract meaningful: a
/// payload on any other schema is still an error, not a chooser.
#[test]
fn an_unknown_schema_is_still_refused_by_ingest() {
    let Some(node) = require_node() else { return };
    let dispatched = render_dispatch(
        &node,
        &json!({"schema": "forged.resolution/1", "resolution": {"query": "x", "candidates": []}}),
    );
    assert_eq!(
        dispatched.error["code"],
        json!("unexpected"),
        "an unknown schema is refused: {}",
        dispatched.error
    );
    assert_eq!(
        dispatched.navigation_picks(),
        vec![json!({"schemaVersion": 1, "params": {}})],
        "the refusal can return to the portfolio instead of repeating itself"
    );
    assert_eq!(
        dispatched.navigation_param_keys(),
        vec![json!([])],
        "portfolio navigation means no scope key, not an undefined scoped id"
    );
}

#[test]
fn portfolio_navigation_is_disabled_when_the_host_cannot_serve_it() {
    let Some(node) = require_node() else { return };
    let dispatched = render_dispatch_without_server_tools(
        &node,
        &json!({"ok": false, "error": {"code": "INVALID_REQUEST", "message": "refused"}}),
    );
    assert!(
        dispatched.navigation_picks().is_empty(),
        "a limited host must receive no live portfolio handler"
    );
    assert!(
        dispatched.subident.iter().any(|node| {
            node["class"] == json!("up")
                && node["text"] == json!("↑ all work")
                && node["disabled"] == json!(true)
        }),
        "the portfolio control remains visible but reads as disabled: {:?}",
        dispatched.subident
    );
}

#[test]
fn a_capable_late_handshake_reenables_portfolio_navigation() {
    let Some(node) = require_node() else { return };
    let dispatched = render_dispatch_before_server_tools(
        &node,
        &json!({"ok": false, "error": {"code": "INVALID_REQUEST", "message": "refused"}}),
    );
    assert_eq!(
        dispatched.navigation_picks(),
        vec![json!({"schemaVersion": 1, "params": {}})],
        "the handshake rebuilds a refusal drawn before capabilities arrived"
    );
    assert!(
        dispatched.subident.iter().any(|node| {
            node["class"] == json!("up")
                && node["text"] == json!("↑ all work")
                && node["disabled"] == json!(false)
        }),
        "the rebuilt portfolio control is enabled: {:?}",
        dispatched.subident
    );
}

/// A host that does not proxy `tools/call` cannot navigate, so the chooser
/// must not offer a pick it cannot serve.
///
/// `refresh`'s own `!host.connected` guard does not cover this: the handshake
/// sets `connected` true and only afterwards disables the controls, so a card
/// clicked here would send a call the host refuses and replace a chooser the
/// operator can still read with an `unreachable` error.
#[test]
fn a_host_without_server_tools_gets_candidates_it_cannot_click() {
    let Some(node) = require_node() else { return };
    let resolution = json!({
        "query": "beads-mk",
        "reason": "ambiguous",
        "candidates": [
            {"id": "beads-mk2", "kind": "slice", "state": "active", "beadId": "beads-mk2"},
            {"id": "beads-mk9", "kind": "epic", "state": "stopped", "beadId": "beads-mk9"},
        ],
    });

    let capable = render_resolution(&node, &resolution);
    assert_eq!(
        capable.picks().len(),
        2,
        "a capable host picks: {}",
        capable.text
    );

    let limited = render_resolution_without_server_tools(&node, &resolution);
    assert!(
        limited.picks().is_empty(),
        "no card may fire a call this host cannot serve: {}",
        limited.text
    );
    // The candidates are still WORTH SEEING — the answer to "which one did
    // you mean" is information, not a button.
    for expected in ["beads-mk2", "beads-mk9", "slice", "epic"] {
        assert!(
            limited.text.contains(expected),
            "the chooser still names {expected}: {}",
            limited.text
        );
    }
    assert!(
        limited.text.contains("does not proxy tool calls"),
        "and says why they cannot be opened: {}",
        limited.text
    );
}

#[test]
fn split_apps_are_dependency_free_safe_and_javascript_valid() {
    let Some(node) = require_node() else { return };
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("assets");
    let operations = root.join("operations-overview.html");
    let detail = root.join("work-detail.html");
    let map = root.join("work-map.html");
    let sessions = root.join("agent-sessions.html");

    for (path, schema, tool) in [
        (
            &operations,
            "forged.operations-overview/1",
            "operations_overview",
        ),
        (&detail, "forged.work-detail/1", "work_detail"),
        (&map, "forged.work-map/1", "work_map"),
        (
            &sessions,
            "forged.provider-session-inventory/1",
            "session_inventory",
        ),
    ] {
        let html = std::fs::read_to_string(path).expect("read split App");
        for required in [
            schema,
            tool,
            "ui/initialize",
            "ui/notifications/tool-result",
            "ui/notifications/size-changed",
            "hostCapabilities",
        ] {
            assert!(
                html.contains(required),
                "{} contains its {required} contract",
                path.display()
            );
        }
        assert!(
            !html.contains("innerHTML"),
            "{} never renders tool data as HTML",
            path.display()
        );

        let output = Command::new(&node)
            .args([
                "-e",
                "const fs=require('fs');const h=fs.readFileSync(process.argv[1],'utf8');const m=h.match(/<script>([\\s\\S]*?)<\\/script>/);if(!m)throw Error('missing script');new Function(m[1]);",
            ])
            .arg(path)
            .output()
            .expect("parse App JavaScript");
        assert!(
            output.status.success(),
            "{} JavaScript parses: {}",
            path.display(),
            String::from_utf8_lossy(&output.stderr)
        );
    }

    let html = std::fs::read_to_string(operations).expect("read Operations App");
    assert!(html.contains("entry.detailTarget"));
    assert!(html.contains("host.capabilities.serverTools"));
    let html = std::fs::read_to_string(map).expect("read Work Map App");
    assert!(html.contains("node.detailTarget"));
    assert!(html.contains("subjectKind"));
    assert!(html.contains("ArrowDown") && html.contains("ArrowUp"));
    let html = std::fs::read_to_string(sessions).expect("read Agent Sessions App");
    assert!(html.contains("detailTarget(row)"));
    assert!(html.contains("name:\"work_detail\""));
    assert!(html.contains("name:\"session_inventory\""));
    for forbidden in [
        "session_read",
        "session_message",
        "session_stop",
        "localStorage",
        "sessionStorage",
        "fetch(",
        "idempotencyKey",
    ] {
        assert!(
            !html.contains(forbidden),
            "Agent Sessions contains forbidden capability {forbidden}"
        );
    }
}

#[test]
fn split_apps_obey_the_host_lifecycle_without_trusting_tool_text() {
    let Some(node) = require_node() else { return };
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("assets");

    for (name, operations, work_map, agent_sessions) in [
        ("operations-overview.html", true, false, false),
        ("work-detail.html", false, false, false),
        ("work-map.html", false, true, false),
        ("agent-sessions.html", false, false, true),
    ] {
        let report = run_split_app_host(&node, &root.join(name));
        assert_eq!(report["operations"], json!(operations), "{name}: {report}");
        assert_eq!(report["workMap"], json!(work_map), "{name}: {report}");
        assert_eq!(
            report["agentSessions"],
            json!(agent_sessions),
            "{name}: {report}"
        );
        assert_eq!(report["initialTheme"], json!("dark"), "{name}: {report}");
        assert_eq!(
            report["initialVariable"],
            json!("violet"),
            "{name}: {report}"
        );
        assert_eq!(report["changedTheme"], json!("light"), "{name}: {report}");
        assert_eq!(report["changedVariable"], json!("teal"), "{name}: {report}");
        assert!(
            report["sizeNotifications"]
                .as_array()
                .is_some_and(|notifications| notifications.iter().any(|notification| {
                    notification.pointer("/params/width") == Some(&json!(720))
                        && notification.pointer("/params/height") == Some(&json!(640))
                })),
            "{name} reports changed host size: {report}"
        );

        assert_eq!(report["innerHTMLWrites"], json!(0), "{name}: {report}");
        assert_eq!(report["injected"], json!(false), "{name}: {report}");
        assert!(
            report["text"]
                .as_array()
                .is_some_and(|texts| texts.contains(&report["malicious"])),
            "{name} preserves hostile tool text as text: {report}"
        );
        assert_eq!(
            report["toolCalls"],
            json!(0),
            "{name} cannot call tools without serverTools: {report}"
        );

        assert!(
            report
                .pointer("/beforeTeardown/timers")
                .and_then(Value::as_u64)
                > Some(0),
            "{name} has a real pending request to cancel: {report}"
        );
        assert!(
            report
                .pointer("/beforeTeardown/frames")
                .and_then(Value::as_u64)
                > Some(0),
            "{name} has a real pending size frame to cancel: {report}"
        );
        assert_eq!(
            report.pointer("/beforeTeardown/observer"),
            Some(&json!(true))
        );
        assert_eq!(report.pointer("/afterTeardown/timers"), Some(&json!(0)));
        assert_eq!(report.pointer("/afterTeardown/frames"), Some(&json!(0)));
        assert_eq!(
            report.pointer("/afterTeardown/observerDisconnected"),
            Some(&json!(true))
        );
        assert_eq!(
            report.pointer("/afterTeardown/messageListeners"),
            Some(&json!(0))
        );
        assert_eq!(report["teardownAck"], json!(true), "{name}: {report}");

        if operations {
            let rows = report["rows"].as_array().expect("Operations rows");
            assert_eq!(rows.len(), 2, "both Operations rows render: {report}");
            assert_eq!(rows[0]["disabled"], json!(true));
            assert_eq!(
                rows[0]["title"],
                json!("Plan-only work has no durable detail yet")
            );
            assert_eq!(rows[1]["disabled"], json!(true));
            assert_eq!(
                rows[1]["title"],
                json!("Exact detail target run:run-1; this host cannot call server tools")
            );
            assert!(
                report["text"]
                    .as_array()
                    .is_some_and(|texts| texts.contains(&json!("run:run-1"))),
                "Operations visibly renders the canonical exact selector: {report}"
            );
        } else if work_map {
            let rows = report["mapNodes"].as_array().expect("Work Map nodes");
            assert_eq!(rows.len(), 2, "both Work Map nodes render: {report}");
            assert!(
                report["text"]
                    .as_array()
                    .is_some_and(|texts| texts.contains(&json!("run-1"))
                        && texts.contains(&report["malicious"])),
                "Work Map safely renders exact ids and hostile titles as text: {report}"
            );
        } else if agent_sessions {
            assert_eq!(
                report["sessionRows"].as_array().map(Vec::len),
                Some(1),
                "Agent Sessions renders one server-ordered row: {report}"
            );
            let text = report["text"].to_string();
            for allowed in [
                "run-1",
                "pane-1",
                "candidate-1",
                "provider-1",
                "inspect-work",
            ] {
                assert!(
                    text.contains(allowed),
                    "Agent Sessions shows {allowed}: {report}"
                );
            }
            for secret in [
                "secret-claimant",
                "secret-revoke",
                "secret-failure",
                "secret-desired-error",
                "secret-cleanup-error",
                "secret-claim-token",
                "secret-metadata-error",
                "secret-lifecycle-error",
                "secret-provider-error",
                "/secret/socket",
                "/secret/sentinel",
                "/secret/projection-socket",
            ] {
                assert!(
                    !text.contains(secret),
                    "Agent Sessions must omit stored sensitive value {secret}: {report}"
                );
            }
        }
    }
}

/// A degraded plan source must reach the model as WORDS.
///
/// On 2026-08-17 one unsupported dependency kind made the whole plan source
/// unavailable, and the Operations App told the model an unqualified
/// "0 shown of 0" — the structured response carried the source-health error
/// the whole time. The context now names the non-available source and its
/// bounded error before any count, and an available source stays concise.
#[test]
fn operations_model_context_names_a_degraded_plan_source_before_its_counts() {
    let Some(node) = require_node() else { return };
    let asset = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("assets")
        .join("operations-overview.html");
    let error = "hydrated issue \"beads-cvr\" dependency \"beads-vdv\" has unknown dependency type \"supersedes\"";
    let overview = |plan: Value, entries: Value, coverage: Value| {
        json!({
            "structuredContent": {"ok": true, "result": {
                "schema": "forged.operations-overview/1",
                "scope": {"repository": "/repo"},
                "sourceHealth": {
                    "ledger": {"state": "available"},
                    "beads": {"state": "available", "error": Value::Null},
                    "plan": plan,
                },
                "coverage": coverage,
                "counts": {"live": 0, "queued": 0, "attention": 0, "planOnly": 0, "reviewReady": 0},
                "spend": {"costUsdKnown": 0},
                "attention": [],
                "queue": {"groups": [{"code": "planned", "label": "Planned", "total": 0, "shown": 0, "entries": entries}]},
            }},
        })
    };
    let scenario = |result: Value| {
        json!({
            "toolResult": result,
            "hostCapabilities": {"updateModelContext": true},
            "allowedTools": [],
        })
    };

    let degraded = run_split_app_host_scenario(
        &node,
        &asset,
        &scenario(overview(
            json!({"state": "unavailable", "error": error, "discovered": 0, "limit": 500, "truncated": false}),
            json!([]),
            json!({"total": 0, "shown": 0, "matching": 0, "truncated": false}),
        )),
    );
    let context = degraded["modelContext"]
        .as_array()
        .and_then(|texts| texts.last())
        .and_then(Value::as_str)
        .unwrap_or_else(|| panic!("the App pushed no model context: {degraded}"));
    let degradation = context
        .find("plan unavailable")
        .unwrap_or_else(|| panic!("the degraded plan source is not named: {context}"));
    assert!(
        context.contains(error),
        "the bounded source-health error never reached the model: {context}"
    );
    let counts = context
        .find("shown of")
        .unwrap_or_else(|| panic!("the counts line is missing: {context}"));
    assert!(
        degradation < counts,
        "zero counts must not be read before the reason they are zero: {context}"
    );
    assert!(
        context.contains("NOT authoritative"),
        "an empty queue must never read as authoritative coverage: {context}"
    );
    // The visual surface is unchanged: the pills still report every source.
    let rendered = degraded["text"].to_string();
    for pill in ["ledger available", "beads available", "plan unavailable"] {
        assert!(
            rendered.contains(pill),
            "health pill {pill} is missing: {rendered}"
        );
    }

    let healthy = run_split_app_host_scenario(
        &node,
        &asset,
        &scenario(overview(
            json!({"state": "available", "error": Value::Null, "discovered": 1, "limit": 500, "truncated": false}),
            json!([{"id": "plan-one", "state": "planned", "source": "live-plan", "identity": {"displayTitle": "Planned slice"}, "detailTarget": Value::Null}]),
            json!({"total": 1, "shown": 1, "matching": 1, "truncated": false}),
        )),
    );
    let context = healthy["modelContext"]
        .as_array()
        .and_then(|texts| texts.last())
        .and_then(Value::as_str)
        .unwrap_or_else(|| panic!("the App pushed no model context: {healthy}"));
    assert!(
        !context.contains("Source degradation"),
        "an available source stays concise: {context}"
    );
    assert!(
        context.starts_with("Forged Operations for /repo: 1 shown of 1 matching"),
        "the ordinary context is unchanged: {context}"
    );
    assert!(
        context.contains("- planned: plan-one Planned slice"),
        "the ordinary context still names its rows: {context}"
    );
    assert!(
        healthy["text"].to_string().contains("plan available"),
        "health pills continue to render: {healthy}"
    );
}

/// A queue row is a fixed-width CSS grid, so the title mark has to ride
/// inside the title cell. Appending it as its own child pushed `source` into
/// the `meta` column and wrapped the row onto a second line — and every
/// durable row marks `live title`, so that is the ordinary case, not an edge.
#[test]
fn a_marked_operations_row_still_fills_exactly_its_declared_grid_columns() {
    let Some(node) = require_node() else { return };
    let asset = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("assets")
        .join("operations-overview.html");
    let html = std::fs::read_to_string(&asset).expect("read Operations App");
    // The expected cell count is the asset's own column count, so the two
    // cannot drift apart silently.
    let declaration = html
        .split_once(".row {")
        .and_then(|(_, rest)| rest.split_once('}'))
        .map(|(rule, _)| rule.to_owned())
        .expect("the .row rule");
    let columns = declaration
        .split_once("grid-template-columns:")
        .and_then(|(_, rest)| rest.split_once(';'))
        .map(|(tracks, _)| tracks.matches("minmax(").count())
        .expect("the .row column tracks");
    assert!(
        columns > 1,
        "the row rule declares its columns: {declaration}"
    );

    let entry = |id: &str, title_source: Value| {
        json!({
            "id": id,
            "state": "active",
            "source": "durable",
            "identity": {"displayTitle": format!("{id} [/repo]")},
            "titleSource": title_source,
            "detailTarget": {"subjectKind": "run", "subjectId": id},
        })
    };
    let report = run_split_app_host_scenario(
        &node,
        &asset,
        &json!({
            "hostCapabilities": {"updateModelContext": true},
            "allowedTools": [],
            "toolResult": {"structuredContent": {"ok": true, "result": {
                "schema": "forged.operations-overview/1",
                "scope": {"repository": "/repo"},
                "sourceHealth": {
                    "ledger": {"state": "available"},
                    "beads": {"state": "available"},
                    "plan": {"state": "available"},
                },
                "coverage": {"total": 3, "shown": 3, "matching": 3, "truncated": false},
                "counts": {"live": 3, "queued": 0, "attention": 0, "planOnly": 0, "reviewReady": 0},
                "spend": {"costUsdKnown": 0},
                "attention": [],
                "queue": {"groups": [{"code": "running", "label": "Running", "total": 3, "shown": 3, "entries": [
                    entry("run-live", json!({
                        "known": true,
                        "value": "Repair the bead read",
                        "source": "beads.title",
                        "beadId": "beads-ntc.4",
                    })),
                    entry("run-untitled", json!({
                        "known": false,
                        "value": "run-untitled",
                        "source": "subject.id",
                    })),
                    entry("run-plain", Value::Null),
                ]}]},
            }}},
        }),
    );

    let rows = report["rows"].as_array().expect("Operations rows");
    assert_eq!(rows.len(), 3, "every row renders: {report}");
    for row in rows {
        assert_eq!(
            row["cells"].as_u64(),
            Some(columns as u64),
            "a row must occupy exactly its {columns} grid columns: {report}"
        );
    }
    let text = report["text"].to_string();
    for expected in [
        "Repair the bead read",
        "live title",
        "untitled id",
        "durable",
    ] {
        assert!(
            text.contains(expected),
            "the row still shows {expected}: {report}"
        );
    }
}

#[test]
fn agent_sessions_controls_are_bounded_exact_and_read_only() {
    let Some(node) = require_node() else { return };
    let asset = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("assets")
        .join("agent-sessions.html");
    let report = run_agent_sessions_host(&node, &asset);

    assert_eq!(report["automaticToolCalls"], json!(0), "{report}");
    assert_eq!(report["toolCalls"], json!(4), "{report}");
    assert_eq!(
        report["interactiveCalls"],
        json!([
            {
                "name": "session_inventory",
                "arguments": {"schemaVersion": 1, "params": {"repository": "/repo", "provider": "codex", "limit": 25}}
            },
            {
                "name": "session_inventory",
                "arguments": {"schemaVersion": 1, "params": {"repository": "/repo", "provider": "codex", "includeHistorical": true, "limit": 25}}
            },
            {
                "name": "session_inventory",
                "arguments": {"schemaVersion": 1, "params": {"repository": "/repo", "provider": "codex", "cursor": "cursor-next", "includeHistorical": true, "limit": 25}}
            },
            {
                "name": "work_detail",
                "arguments": {"schemaVersion": 1, "params": {"subjectKind": "run", "subjectId": "run-next"}}
            }
        ]),
        "refresh is single-flight, history drops a prior cursor, next uses the exact request-bound cursor, and detail uses only the canonical run: {report}"
    );
    let text = report["text"].to_string();
    assert!(
        text.contains("Next page work"),
        "latest page renders: {report}"
    );
    assert!(
        !text.contains(report["malicious"].as_str().unwrap_or_default()),
        "page replacement does not accumulate the initial row: {report}"
    );
    assert_eq!(
        report.pointer("/afterTeardown/timers"),
        Some(&json!(0)),
        "all explicit read and model-context requests tear down: {report}"
    );
}
