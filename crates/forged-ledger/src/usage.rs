//! Usage rows and per-run totals. Token counts are the truth; `cost_usd` is
//! nullable by design and totals never invent a cost for a null row.

use std::collections::BTreeMap;

use forged_types::ErrorCode;
use rusqlite::Connection;

use crate::error::{internal, refused, LedgerError};
use crate::ledger::Ledger;
use crate::time::now_iso;
use crate::types::{NewUsage, UsageRecord, UsageTotals};

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

/// The six aggregate columns every totals query selects, in the order
/// [`sum_row`] decodes them.
const TOTAL_SUMS: &str = "COALESCE(SUM(input_tokens), 0), \
     COALESCE(SUM(output_tokens), 0), \
     COALESCE(SUM(COALESCE(cache_read_tokens, 0)), 0), \
     COALESCE(SUM(COALESCE(cache_write_tokens, 0)), 0), \
     COALESCE(SUM(cost_usd), 0.0), \
     COALESCE(SUM(CASE WHEN cost_usd IS NULL THEN 1 ELSE 0 END), 0)";

/// The raw sums, still in SQLite's own types.
type Sums = (i64, i64, i64, i64, f64, i64);

fn sum_row(row: &rusqlite::Row<'_>) -> Result<Sums, rusqlite::Error> {
    Ok((
        row.get(0)?,
        row.get(1)?,
        row.get(2)?,
        row.get(3)?,
        row.get(4)?,
        row.get(5)?,
    ))
}

fn totals_of(sums: Sums) -> Result<UsageTotals, LedgerError> {
    let (input, output, cache_read, cache_write, cost_known, missing) = sums;
    Ok(UsageTotals {
        input_tokens: as_u64(input, "input_tokens")?,
        output_tokens: as_u64(output, "output_tokens")?,
        cache_read_tokens: as_u64(cache_read, "cache_read_tokens")?,
        cache_write_tokens: as_u64(cache_write, "cache_write_tokens")?,
        cost_usd_known: cost_known,
        rows_missing_cost: u32::try_from(missing)
            .map_err(|_| internal("rows_missing_cost overflows u32"))?,
    })
}

/// Every run's totals in ONE grouped scan, inside the caller's transaction.
///
/// A run with no usage rows is ABSENT from the map rather than zero-valued:
/// `GROUP BY` emits nothing for it, and callers treat absent as zero the way
/// [`Ledger::usage_totals`] does. Projecting the whole inventory therefore
/// costs one query, never one per run.
pub(crate) fn usage_totals_per_run_tx(
    conn: &Connection,
) -> Result<BTreeMap<String, UsageTotals>, LedgerError> {
    let mut statement = conn.prepare(&format!(
        "SELECT run_id, {TOTAL_SUMS} FROM usage GROUP BY run_id"
    ))?;
    let rows = statement.query_map([], |row| {
        let run_id: String = row.get(0)?;
        Ok((
            run_id,
            (
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
            ),
        ))
    })?;
    let mut totals = BTreeMap::new();
    for row in rows {
        let (run_id, sums): (String, Sums) = row?;
        totals.insert(run_id, totals_of(sums)?);
    }
    Ok(totals)
}

/// Newest unpriced usage identity and update time per run. This is causal
/// identity for attention recurrence, not another totals query.
pub(crate) fn latest_missing_usage_per_run_tx(
    conn: &Connection,
) -> Result<BTreeMap<String, (i64, String)>, LedgerError> {
    let mut statement = conn.prepare(
        "SELECT u.run_id, u.usage_id, u.ts FROM usage u \
         WHERE u.cost_usd IS NULL AND u.usage_id = ( \
           SELECT MAX(u2.usage_id) FROM usage u2 \
           WHERE u2.run_id = u.run_id AND u2.cost_usd IS NULL) \
         ORDER BY u.run_id",
    )?;
    let rows = statement.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            (row.get::<_, i64>(1)?, row.get::<_, String>(2)?),
        ))
    })?;
    rows.collect::<Result<BTreeMap<_, _>, _>>()
        .map_err(Into::into)
}

impl Ledger {
    /// Record one usage row, keyed by
    /// `(run_id, packet_id, attempt_id, provider, model)`.
    ///
    /// Upsert, not insert: the same attempt's capture may be read more than
    /// once — once when it settles and again by a later `usage ingest` over
    /// the same packet directory — and the second read must not double the
    /// first. Re-recording overwrites, so the newest read of a capture wins.
    pub fn record_usage(&self, usage: NewUsage) -> Result<(), LedgerError> {
        self.submit(move |conn| {
            let input_tokens = as_i64(usage.input_tokens, "input_tokens")?;
            let output_tokens = as_i64(usage.output_tokens, "output_tokens")?;
            let cache_read = opt_as_i64(usage.cache_read_tokens, "cache_read_tokens")?;
            let cache_write = opt_as_i64(usage.cache_write_tokens, "cache_write_tokens")?;
            let web_searches = opt_as_i64(usage.web_search_requests, "web_search_requests")?;
            let tx = conn.transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)?;
            tx.execute(
                "INSERT INTO usage (run_id, packet_id, attempt_id, provider, model, \
                 input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, \
                 cost_usd, pricing_basis, rate_limit_used_percent, ts, \
                 web_search_requests) \
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14) \
                 ON CONFLICT (run_id, COALESCE(packet_id, ''), COALESCE(attempt_id, -1), \
                 provider, model) DO UPDATE SET \
                 input_tokens = excluded.input_tokens, \
                 output_tokens = excluded.output_tokens, \
                 cache_read_tokens = excluded.cache_read_tokens, \
                 cache_write_tokens = excluded.cache_write_tokens, \
                 cost_usd = excluded.cost_usd, \
                 pricing_basis = excluded.pricing_basis, \
                 rate_limit_used_percent = excluded.rate_limit_used_percent, \
                 web_search_requests = excluded.web_search_requests, \
                 ts = excluded.ts",
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
                    web_searches,
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
            let sums = conn.query_row(
                &format!("SELECT {TOTAL_SUMS} FROM usage WHERE run_id = ?1"),
                [&run_id],
                sum_row,
            )?;
            totals_of(sums)
        })
    }

    /// Every stored usage row for a run, oldest first.
    ///
    /// Totals answer "what did this run cost"; these answer "which seat
    /// spent it". Rows are returned exactly as stored — a NULL `cost_usd`
    /// stays NULL rather than becoming 0, so a seat whose provider bills no
    /// money is distinguishable from one that cost nothing.
    pub fn list_usage(&self, run_id: &str) -> Result<Vec<UsageRecord>, LedgerError> {
        let run_id = run_id.to_owned();
        self.submit(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT run_id, packet_id, attempt_id, provider, model, \
                        input_tokens, output_tokens, cache_read_tokens, \
                        cache_write_tokens, cost_usd, pricing_basis, \
                        rate_limit_used_percent, ts, web_search_requests \
                 FROM usage WHERE run_id = ?1 ORDER BY usage_id",
            )?;
            let rows = stmt
                .query_map([&run_id], |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, Option<String>>(1)?,
                        row.get::<_, Option<i64>>(2)?,
                        row.get::<_, String>(3)?,
                        row.get::<_, String>(4)?,
                        row.get::<_, i64>(5)?,
                        row.get::<_, i64>(6)?,
                        row.get::<_, Option<i64>>(7)?,
                        row.get::<_, Option<i64>>(8)?,
                        row.get::<_, Option<f64>>(9)?,
                        row.get::<_, Option<String>>(10)?,
                        row.get::<_, Option<f64>>(11)?,
                        row.get::<_, String>(12)?,
                        row.get::<_, Option<i64>>(13)?,
                    ))
                })?
                .collect::<Result<Vec<_>, _>>()?;
            rows.into_iter()
                .map(|r| {
                    Ok(UsageRecord {
                        run_id: r.0,
                        packet_id: r.1,
                        attempt_id: r.2,
                        provider: r.3,
                        model: r.4,
                        input_tokens: as_u64(r.5, "input_tokens")?,
                        output_tokens: as_u64(r.6, "output_tokens")?,
                        cache_read_tokens: r
                            .7
                            .map(|v| as_u64(v, "cache_read_tokens"))
                            .transpose()?,
                        cache_write_tokens: r
                            .8
                            .map(|v| as_u64(v, "cache_write_tokens"))
                            .transpose()?,
                        cost_usd: r.9,
                        pricing_basis: r.10,
                        rate_limit_used_percent: r.11,
                        ts: r.12,
                        web_search_requests: r
                            .13
                            .map(|v| as_u64(v, "web_search_requests"))
                            .transpose()?,
                    })
                })
                .collect()
        })
    }
}
