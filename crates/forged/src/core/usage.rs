//! Usage capture: turn one attempt's provider stdout into priced ledger
//! rows.
//!
//! Two callers reach this, and they must agree on the row identity or the
//! natural key stops deduplicating: [`capture_attempt`] runs when an
//! attempt settles, and `usage ingest` re-derives the same rows from the
//! same packet directory afterwards. Both attribute to a real attempt id
//! for that reason — an ingest that recorded `attempt_id: NULL` would key
//! differently and double the run's spend.
//!
//! Capture never fails its caller. An attempt that produced work is not
//! void because its token counts were unreadable, and absent usage is data
//! throughout this codebase; every failure here is logged and swallowed.

use forged_ledger::NewUsage;
use forged_provider::{ClaudeDriver, CodexDriver, PiDriver, ProviderDriver, UsageRow};

use super::{on_ledger, Ctx};

/// Parse `stdout` with the driver that produced it, price what the
/// provider did not bill, and record one row per model.
///
/// Returns how many rows were recorded — zero whenever the capture carried
/// no usage, which is a normal outcome for a transport failure or a
/// session that vanished before reporting.
pub async fn capture_attempt(
    ctx: &Ctx,
    run_id: &str,
    packet_id: &str,
    attempt_id: Option<i64>,
    provider: &str,
    model: &str,
    stdout: &str,
) -> u64 {
    let parsed = match provider {
        "codex" => CodexDriver.parse_usage(stdout, model),
        "pi" => PiDriver.parse_usage(stdout, model),
        _ => ClaudeDriver.parse_usage(stdout, model),
    };
    let mut rows = match parsed {
        Ok(capture) => capture.rows,
        Err(error) => {
            tracing::warn!(%packet_id, %error, "usage capture did not parse");
            return 0;
        }
    };
    price(ctx, &mut rows);
    let mut recorded = 0;
    for row in rows {
        let new_usage = to_new_usage(run_id, packet_id, attempt_id, row);
        match on_ledger(&ctx.ledger, move |l| l.record_usage(new_usage)).await {
            Ok(()) => recorded += 1,
            Err(failure) => {
                tracing::warn!(%packet_id, error = %failure.message, "usage row not recorded")
            }
        }
    }
    recorded
}

/// Stamp an imputed cost onto every row the provider left unpriced.
/// [`crate::pricing::RateCard::cost_of`] declines the rest — a billed row,
/// an unlisted model, or a tier it cannot prove — and those keep a NULL
/// cost and count in `rowsMissingCost`.
pub fn price(ctx: &Ctx, rows: &mut [UsageRow]) {
    for row in rows.iter_mut() {
        if let Some((cost, basis)) = ctx.config.pricing.cost_of(row) {
            row.cost_usd = Some(cost);
            row.pricing_basis = basis;
        }
    }
}

/// Map a parsed row onto its ledger input under a fixed attribution.
pub fn to_new_usage(
    run_id: &str,
    packet_id: &str,
    attempt_id: Option<i64>,
    row: UsageRow,
) -> NewUsage {
    NewUsage {
        run_id: run_id.to_owned(),
        packet_id: Some(packet_id.to_owned()),
        attempt_id,
        provider: row.provider,
        model: row.model,
        input_tokens: row.input_tokens,
        output_tokens: row.output_tokens,
        cache_read_tokens: row.cache_read_tokens,
        cache_write_tokens: row.cache_write_tokens,
        cost_usd: row.cost_usd,
        pricing_basis: Some(row.pricing_basis.as_str().to_owned()),
        rate_limit_used_percent: row.rate_limit_used_percent,
        web_search_requests: row.web_search_requests,
    }
}
