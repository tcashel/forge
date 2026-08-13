//! Cost imputation for providers that report tokens but not money.
//!
//! Claude reports a billed `costUSD` per model and forged stores it
//! verbatim (`PricingBasis::Billed`). Codex reports tokens only, so a cost
//! for those rows has to be imputed from published API rates
//! (`PricingBasis::ImputedApiRate`). Rates live in operator config, not in
//! this binary: prices move, and a stale table baked into a release would
//! produce confidently wrong money. A model with no card entry keeps
//! `cost_usd: None` and counts in `rowsMissingCost` — forged never invents
//! a price it was not given.
//!
//! Server-side tool calls are billed per call rather than per token and add
//! to the turn's token cost. They are only ever imputed onto a row forged
//! is already pricing: a provider that billed the turn billed its tool
//! calls inside that same figure, so adding an estimate there would charge
//! one search twice.
//!
//! ## Why the tier decision is not a guess
//!
//! OpenAI prices a prompt above `long_context_threshold` input tokens at
//! the long-context rates, and the threshold is **per request**, not per
//! turn. A codex `turn.completed` event reports the sum over every request
//! in the turn — a 1.4M-token turn is routinely 27 requests of 50K — so
//! tiering off that total would overcharge by roughly 2x.
//!
//! The card therefore carries each model's `context_window`. When the
//! window is at or below the threshold, no single request can cross it, so
//! the short-context rates are provably correct for the whole turn no
//! matter how large the total. When the window is larger, the capture does
//! not carry enough information to decide, and [`RateCard::cost_of`]
//! returns `None` rather than pick a tier.

use std::collections::BTreeMap;

use forged_provider::{PricingBasis, UsageRow};
use serde::{Deserialize, Serialize};

/// Published rates for one context tier, in USD per million tokens.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct TierRates {
    /// Tokens billed at the uncached input rate.
    pub input: f64,
    /// Tokens served from the prompt cache.
    pub cached_input: f64,
    /// Tokens written into the prompt cache.
    pub cache_write: f64,
    /// Generated tokens, reasoning included.
    pub output: f64,
}

impl TierRates {
    /// Price one row's disjoint token buckets. Absent cache counts are 0 —
    /// [`UsageRow`] stores `None` for "the capture never said", which costs
    /// the same as zero.
    fn cost(&self, row: &UsageRow) -> f64 {
        let per_million = |tokens: u64, rate: f64| (tokens as f64) * rate / 1_000_000.0;
        per_million(row.input_tokens, self.input)
            + per_million(row.cache_read_tokens.unwrap_or(0), self.cached_input)
            + per_million(row.cache_write_tokens.unwrap_or(0), self.cache_write)
            + per_million(row.output_tokens, self.output)
    }
}

/// One model's entry in the rate card.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct ModelRates {
    /// The model's maximum prompt size in tokens. This is what makes the
    /// tier decision provable rather than assumed — see the module docs.
    pub context_window: u64,
    /// Prompts at or below `long_context_threshold` input tokens.
    pub short: TierRates,
    /// Prompts above it. Absent for models that publish a single tier, in
    /// which case `short` always applies.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub long: Option<TierRates>,
}

/// Per-call rates for server-side tools, in USD per thousand calls.
///
/// Tool calls are billed per call, not per token, and are additive to the
/// token cost of the turn that made them. The tokens a search feeds back
/// into the prompt are already counted in the row's input buckets and are
/// not re-priced here.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct ToolRates {
    /// Server-side web search. OpenAI publishes one rate for reasoning
    /// models and a higher one for the non-reasoning preview tool; forged
    /// rosters name reasoning models, so the card carries the one rate and
    /// an operator who needs the other edits it.
    pub web_search_per_1k: f64,
}

/// The operator's resolved rate card.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", deny_unknown_fields)]
pub struct RateCard {
    /// The date the rates were transcribed, surfaced by the overview so a
    /// stale card is visible rather than silent.
    pub rates_as_of: String,
    /// Where they were transcribed from.
    pub source: String,
    /// Input tokens above which long-context rates apply, per request.
    pub long_context_threshold: u64,
    /// Keyed by the model string the roster names.
    pub models: BTreeMap<String, ModelRates>,
    /// Per-call rates for server-side tools.
    pub tools: ToolRates,
}

/// The seeded default card: OpenAI's published standard API rates.
///
/// Claude models are deliberately absent — the claude driver reports a
/// billed cost, and an imputed rate must never override money the provider
/// actually charged.
pub fn default_rate_card() -> RateCard {
    // `daybreak-blue-latest` and `daybreak-red-latest` are aliases that
    // currently resolve to sol and cyber; they are listed so a roster
    // naming the alias still prices.
    let sol = ModelRates {
        context_window: 272_000,
        short: TierRates {
            input: 5.00,
            cached_input: 0.50,
            cache_write: 6.25,
            output: 30.00,
        },
        long: Some(TierRates {
            input: 10.00,
            cached_input: 1.00,
            cache_write: 12.50,
            output: 45.00,
        }),
    };
    // Cyber publishes no long-context tier at all.
    let cyber = ModelRates {
        context_window: 272_000,
        short: TierRates {
            input: 12.50,
            cached_input: 1.25,
            cache_write: 15.625,
            output: 75.00,
        },
        long: None,
    };
    RateCard {
        rates_as_of: "2026-08-13".to_owned(),
        source: "https://developers.openai.com/api/docs/pricing".to_owned(),
        long_context_threshold: 272_000,
        tools: ToolRates {
            web_search_per_1k: 10.00,
        },
        models: BTreeMap::from([
            ("gpt-5.6-sol".to_owned(), sol.clone()),
            ("daybreak-blue-latest".to_owned(), sol),
            (
                "gpt-5.6-terra".to_owned(),
                ModelRates {
                    context_window: 272_000,
                    short: TierRates {
                        input: 2.00,
                        cached_input: 0.20,
                        cache_write: 2.50,
                        output: 12.00,
                    },
                    long: Some(TierRates {
                        input: 4.00,
                        cached_input: 0.40,
                        cache_write: 5.00,
                        output: 18.00,
                    }),
                },
            ),
            (
                "gpt-5.6-luna".to_owned(),
                ModelRates {
                    context_window: 272_000,
                    short: TierRates {
                        input: 0.20,
                        cached_input: 0.02,
                        cache_write: 0.25,
                        output: 1.20,
                    },
                    long: Some(TierRates {
                        input: 0.40,
                        cached_input: 0.04,
                        cache_write: 0.50,
                        output: 1.80,
                    }),
                },
            ),
            ("gpt-5.6-cyber".to_owned(), cyber.clone()),
            ("daybreak-red-latest".to_owned(), cyber),
            (
                "gpt-5.3-codex".to_owned(),
                ModelRates {
                    context_window: 272_000,
                    short: TierRates {
                        input: 1.75,
                        cached_input: 0.175,
                        // Not published separately for this model; the
                        // documented 1.25x uncached rule supplies it.
                        cache_write: 2.1875,
                        output: 14.00,
                    },
                    long: None,
                },
            ),
        ]),
    }
}

impl RateCard {
    /// Impute a cost for one row, or `None` when forged cannot stand
    /// behind the number.
    ///
    /// `None` on three distinct grounds, none of which is an error: the
    /// provider already billed the row (never override real money), the
    /// model has no card entry, or the model's context window exceeds the
    /// threshold so the per-request tier is not derivable from a turn
    /// total. Every one of them leaves the row counting in
    /// `rowsMissingCost`.
    pub fn cost_of(&self, row: &UsageRow) -> Option<(f64, PricingBasis)> {
        // A provider that billed the turn already billed its tool calls
        // inside that figure. Adding an imputed search charge on top would charge
        // the operator twice for one search.
        if row.cost_usd.is_some() {
            return None;
        }
        let rates = self.models.get(&row.model)?;
        let tier = match rates.long {
            // One published tier: it applies to every request.
            None => &rates.short,
            // A window that cannot exceed the threshold cannot be billed
            // at the long rate, whatever the turn total says.
            Some(_) if rates.context_window <= self.long_context_threshold => &rates.short,
            // Otherwise the turn total cannot tell us how any individual
            // request was priced. Refuse rather than guess.
            Some(_) => return None,
        };
        Some((
            tier.cost(row) + self.tool_cost(row),
            PricingBasis::ImputedApiRate,
        ))
    }

    /// Per-call charges for the server-side tools a row reported. Additive
    /// to token cost, and zero when the capture counted no calls.
    fn tool_cost(&self, row: &UsageRow) -> f64 {
        (row.web_search_requests.unwrap_or(0) as f64) * self.tools.web_search_per_1k / 1_000.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn row(model: &str, input: u64, cache_read: u64, output: u64) -> UsageRow {
        UsageRow {
            provider: "codex".to_owned(),
            model: model.to_owned(),
            input_tokens: input,
            output_tokens: output,
            cache_read_tokens: Some(cache_read),
            cache_write_tokens: Some(0),
            cost_usd: None,
            pricing_basis: PricingBasis::None,
            rate_limit_used_percent: None,
            web_search_requests: None,
        }
    }

    #[test]
    fn a_huge_turn_total_still_prices_at_short_context_rates() {
        // The real beads-mk2 review-2 seat: 1,453,441 prompt tokens across
        // 27 requests, the largest of them 88,362. Every request sat under
        // the 272K threshold, and the model's window makes that provable
        // without reading a single per-request count.
        let card = default_rate_card();
        let priced = card
            .cost_of(&row("gpt-5.6-sol", 120_961, 1_332_480, 19_884))
            .expect("a seeded model prices");
        assert_eq!(priced.1, PricingBasis::ImputedApiRate);
        // 120961*5 + 1332480*0.5 + 19884*30, per million.
        assert!(
            (priced.0 - 1.867_565).abs() < 1e-6,
            "short-context rates: {}",
            priced.0
        );
    }

    #[test]
    fn a_window_above_the_threshold_refuses_to_pick_a_tier() {
        let mut card = default_rate_card();
        card.models
            .get_mut("gpt-5.6-sol")
            .expect("seeded")
            .context_window = 1_000_000;
        assert!(
            card.cost_of(&row("gpt-5.6-sol", 10, 0, 10)).is_none(),
            "a turn total cannot decide a per-request tier"
        );
    }

    #[test]
    fn a_single_tier_model_always_prices() {
        let mut card = default_rate_card();
        card.models
            .get_mut("gpt-5.6-cyber")
            .expect("seeded")
            .context_window = 1_000_000;
        assert!(
            card.cost_of(&row("gpt-5.6-cyber", 10, 0, 10)).is_some(),
            "no long tier means the short rates are unconditional"
        );
    }

    #[test]
    fn web_searches_are_charged_per_call_on_top_of_tokens() {
        let card = default_rate_card();
        let mut searched = row("gpt-5.6-sol", 1_000_000, 0, 0);
        searched.web_search_requests = Some(40);
        let base = card
            .cost_of(&row("gpt-5.6-sol", 1_000_000, 0, 0))
            .expect("prices")
            .0;
        let with_tools = card.cost_of(&searched).expect("prices").0;
        // 40 calls at $10.00/1k.
        assert!(
            (with_tools - base - 0.40).abs() < 1e-9,
            "{with_tools} vs {base}"
        );
    }

    #[test]
    fn a_billed_row_is_not_charged_again_for_its_searches() {
        // Claude reports a billed cost that already covers its server-side
        // tools. Imputing a search charge on top would bill twice for one
        // search.
        let mut billed = row("gpt-5.6-sol", 10, 0, 10);
        billed.cost_usd = Some(0.5);
        billed.web_search_requests = Some(500);
        assert!(default_rate_card().cost_of(&billed).is_none());
    }

    #[test]
    fn a_billed_row_is_never_overridden() {
        let mut billed = row("gpt-5.6-sol", 10, 0, 10);
        billed.cost_usd = Some(0.5);
        assert!(default_rate_card().cost_of(&billed).is_none());
    }

    #[test]
    fn an_unlisted_model_stays_unpriced() {
        assert!(default_rate_card()
            .cost_of(&row("some-model-we-never-heard-of", 10, 0, 10))
            .is_none());
    }
}
