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
  /** USD per 1M input tokens. */
  inputPer1M: number;
  /** USD per 1M output tokens. */
  outputPer1M: number;
  /** ISO date the prices were last verified against vendor pricing pages. */
  pricedAt: string;
}

type Adapter = "claude" | "codex" | "opencode" | "gemini";

/**
 * Pricing is empty by design: the only adapter we currently capture cost
 * for is claude, which goes through `total_cost_usd` from stream-json.
 * Add codex / opencode / gemini entries when empirical token capture
 * lands for those adapters (one Linear ticket per adapter — see Risks
 * in the spec).
 */
const TABLE: Partial<Record<Adapter, Record<string, ModelPrice>>> = {};

export interface EstimateInput {
  agentAdapter: string;
  model: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
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
  const cost = (input.tokensIn * price.inputPer1M + input.tokensOut * price.outputPer1M) / 1_000_000;
  return { costUsd: cost, costSource: "estimate", modelPricedAt: price.pricedAt };
}
