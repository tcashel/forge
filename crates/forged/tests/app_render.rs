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

use serde_json::{json, Value};
use support::{
    render_cost, render_dispatch, render_dispatch_without_server_tools, render_resolution,
    render_resolution_without_server_tools, require_node,
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
