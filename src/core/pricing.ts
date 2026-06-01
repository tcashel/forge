/**
 * Hand-maintained price table for non-claude adapters. Claude uses
 * provider-reported `total_cost_usd` from stream-json `result` events;
 * pricing.ts is only consulted when the adapter does not report cost
 * (codex / opencode / gemini) AND empirical token capture is wired up
 * for that adapter.
 *
 * `pricedAt` is a UI tell — when a row's `modelPricedAt` matches an
 * obviously-stale date, the dashboard should flag the cost as
 * potentially out-of-date. Rows for adapters we haven't measured stay
 * absent from the table and produce `null` cost with `costSource = null`.
 */

export type CostSource = "provider" | "estimate";

export interface ModelPrice {
  /** USD per 1M (non-cached) input tokens. */
  inputPer1M: number;
  /** USD per 1M output tokens. */
  outputPer1M: number;
  /**
   * USD per 1M cached (cache-read) input tokens. Optional: when absent,
   * cached input is charged at the full `inputPer1M` rate. Vendors that
   * fold cached tokens into the reported `input_tokens` (codex) bill them
   * at a discount, so pricing them separately avoids overstating cost.
   */
  cachedInputPer1M?: number;
  /** ISO date the prices were last verified against vendor pricing pages. */
  pricedAt: string;
}

type Adapter = "claude" | "codex" | "opencode" | "gemini";

/**
 * claude is intentionally absent: it reports `total_cost_usd` directly via
 * stream-json, so the provider path is the source of truth and this table
 * is never consulted for it.
 *
 * codex reports tokens only (no cost) in its `turn.completed` usage event,
 * so we estimate from this table. Keys must be the exact model ids Forge
 * launches codex with (see `gpt-5.5`, the configured `defaultModel` /
 * critic-b model). Prices are OpenAI's standard API rates for gpt-5.5
 * ($5 / 1M input, $0.50 / 1M cached input, $30 / 1M output) —
 * https://developers.openai.com/api/docs/pricing
 * and https://openai.com/index/introducing-gpt-5-5/ (verified 2026-05-31).
 * codex folds cached tokens into the reported `input_tokens`, so we split
 * them back out and price the cached portion at the discounted rate.
 * opencode / gemini stay absent until their tokens are captured empirically.
 */
const TABLE: Partial<Record<Adapter, Record<string, ModelPrice>>> = {
  codex: {
    "gpt-5.5": { inputPer1M: 5, cachedInputPer1M: 0.5, outputPer1M: 30, pricedAt: "2026-05-31" },
  },
};

export interface EstimateInput {
  agentAdapter: string;
  model: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  /**
   * Cache-read input tokens already counted inside `tokensIn` (codex folds
   * them in). When provided, this portion is billed at the model's cached
   * rate and the remainder at the full input rate, so cached input isn't
   * overcharged. Pass null/omit for vendors that report input and cache
   * tokens as disjoint counts.
   */
  cachedTokensIn?: number | null;
}

export interface EstimateResult {
  costUsd: number | null;
  costSource: CostSource | null;
  modelPricedAt: string | null;
}

/**
 * Compute a cost estimate from token counts and the in-memory price
 * table. Returns all-null when:
 *   - the adapter or model isn't priced
 *   - tokens are unknown
 * Callers should not invoke for claude (provider cost wins; this would
 * always return null anyway because the table omits claude).
 */
export function estimateCost(input: EstimateInput): EstimateResult {
  const adapter = TABLE[input.agentAdapter as Adapter];
  if (!adapter || !input.model) return { costUsd: null, costSource: null, modelPricedAt: null };
  const price = adapter[input.model];
  if (!price) return { costUsd: null, costSource: null, modelPricedAt: null };
  if (input.tokensIn === null || input.tokensOut === null) {
    return { costUsd: null, costSource: null, modelPricedAt: null };
  }
  // Split cached input out of the full-rate input when both a cached count
  // and a cached rate are available; otherwise charge everything at the
  // full input rate. Clamp so a malformed cached count can't go negative.
  const cachedIn =
    price.cachedInputPer1M !== undefined ? Math.min(Math.max(input.cachedTokensIn ?? 0, 0), input.tokensIn) : 0;
  const fullRateIn = input.tokensIn - cachedIn;
  const cost =
    (fullRateIn * price.inputPer1M +
      cachedIn * (price.cachedInputPer1M ?? price.inputPer1M) +
      input.tokensOut * price.outputPer1M) /
    1_000_000;
  return { costUsd: cost, costSource: "estimate", modelPricedAt: price.pricedAt };
}
