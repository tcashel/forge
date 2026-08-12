//! Usage rows and per-run totals. Token counts are the truth; `cost_usd` is
//! nullable by design and totals never invent a cost for a null row.

use forged_types::ErrorCode;

use crate::error::{internal, refused, LedgerError};
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{NewUsage, UsageTotals};

fn as_i64(value: u64, what: &str) -> Result<i64, LedgerError> {
    i64::try_from(value).map_err(|_| {
        refused(
            ErrorCode::InvalidRequest,
            format!("{what} {value} exceeds the storable range"),
        )
    })
}

fn opt_as_i64(value: Option<u64>, what: &str) -> Result<Option<i64>, LedgerError> {
    value.map(|v| as_i64(v, what)).transpose()
}

fn as_u64(value: i64, what: &str) -> Result<u64, LedgerError> {
    u64::try_from(value).map_err(|_| internal(format!("negative {what} sum {value}")))
}

impl Ledger {
    /// Record one usage row.
    pub fn record_usage(&self, usage: NewUsage) -> Result<(), LedgerError> {
        self.submit(move |conn| {
            let input_tokens = as_i64(usage.input_tokens, "input_tokens")?;
            let output_tokens = as_i64(usage.output_tokens, "output_tokens")?;
            let cache_read = opt_as_i64(usage.cache_read_tokens, "cache_read_tokens")?;
            let cache_write = opt_as_i64(usage.cache_write_tokens, "cache_write_tokens")?;
            let tx = conn.transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)?;
            tx.execute(
                "INSERT INTO usage (run_id, packet_id, attempt_id, provider, model, \
                 input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, \
                 cost_usd, pricing_basis, rate_limit_used_percent, ts) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
                rusqlite::params![
                    usage.run_id,
                    usage.packet_id,
                    usage.attempt_id,
                    usage.provider,
                    usage.model,
                    input_tokens,
                    output_tokens,
                    cache_read,
                    cache_write,
                    usage.cost_usd,
                    usage.pricing_basis,
                    usage.rate_limit_used_percent,
                    now_iso(),
                ],
            )?;
            tx.commit()?;
            Ok(())
        })
    }

    /// Token sums for a run. NULL cache-token columns contribute 0 to their
    /// sums; only `cost_usd` gets the missing-row treatment: non-null costs
    /// sum into `cost_usd_known` and null rows count in `rows_missing_cost`.
    pub fn usage_totals(&self, run_id: &str) -> Result<UsageTotals, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let (input, output, cache_read, cache_write, cost_known, missing): (
                i64,
                i64,
                i64,
                i64,
                f64,
                i64,
            ) = conn.query_row(
                "SELECT COALESCE(SUM(input_tokens), 0), \
                        COALESCE(SUM(output_tokens), 0), \
                        COALESCE(SUM(COALESCE(cache_read_tokens, 0)), 0), \
                        COALESCE(SUM(COALESCE(cache_write_tokens, 0)), 0), \
                        COALESCE(SUM(cost_usd), 0.0), \
                        COALESCE(SUM(CASE WHEN cost_usd IS NULL THEN 1 ELSE 0 END), 0) \
                 FROM usage WHERE run_id = ?1",
                [&run_id],
                |row| {
                    Ok((
                        row.get(0)?,
                        row.get(1)?,
                        row.get(2)?,
                        row.get(3)?,
                        row.get(4)?,
                        row.get(5)?,
                    ))
                },
            )?;
            Ok(UsageTotals {
                input_tokens: as_u64(input, "input_tokens")?,
                output_tokens: as_u64(output, "output_tokens")?,
                cache_read_tokens: as_u64(cache_read, "cache_read_tokens")?,
                cache_write_tokens: as_u64(cache_write, "cache_write_tokens")?,
                cost_usd_known: cost_known,
                rows_missing_cost: u32::try_from(missing)
                    .map_err(|_| internal("rows_missing_cost overflows u32"))?,
            })
        })
    }
}
