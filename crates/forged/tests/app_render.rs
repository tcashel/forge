//! Renderer-level tests for the App's Cost tab.
//!
//! The spend header is the one place the projection can lie to an operator:
//! an epic whose codex seats were priced from the operator's rate card must
//! not claim the provider billed it. These tests run `viewCost` out of
//! `assets/overview.html` itself against a DOM shim, so the assertion is on
//! what the tab renders — not on a Rust recomputation of its arithmetic,
//! which would still pass if the header stopped reading `usage.rows`.

mod support;

use serde_json::{json, Value};
use support::{render_cost, require_node};

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
