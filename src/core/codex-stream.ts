/**
 * Parser for `codex exec --json` JSONL output. Sibling of claude-stream.ts;
 * reuses its `ClaudeResultMetrics` shape so every finalize path stores one
 * metrics record regardless of adapter.
 *
 * Consumer: src/cli/cmd/session.ts and the review/comment-fix workers read
 * the persisted `.stream.jsonl` sidecar (teed by `codexJobCommand`) to pull
 * tokens into sessions.metrics. Codex reports tokens only — never cost — so
 * `totalCostUsd` is always null here and the price table (estimateCost)
 * fills it downstream.
 *
 * Token normalization: codex's raw `input_tokens` is the TOTAL input,
 * including the cached portion. We split it so the stored buckets match
 * claude's semantics — `tokensIn` = uncached/full-rate input,
 * `cacheRead` = cached input — making per-bucket comparison and the
 * Activity rollups adapter-agnostic. (claude already reports these as
 * disjoint counts.)
 *
 * Fixture: tests/fixtures/codex-stream-result.jsonl, captured from
 * `codex exec --json` (codex-cli 0.135.0). Field names below match what the
 * CLI actually emits there:
 *   {"type":"turn.completed","usage":{"input_tokens":N,"cached_input_tokens":N,
 *    "output_tokens":N,"reasoning_output_tokens":N}}
 */

import type { ClaudeResultMetrics } from "./claude-stream.ts";

const EMPTY: ClaudeResultMetrics = {
  durationMs: null,
  totalCostUsd: null,
  numTurns: null,
  stopReason: null,
  tokensIn: null,
  tokensOut: null,
  cacheRead: null,
  cacheCreate: null,
};

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * Parse a single `turn.completed` event payload. Returns null when the
 * event isn't a `turn.completed` carrying a usage object. Codex's usage
 * fields map (after normalization) to:
 *   - input_tokens - cached_input_tokens → tokensIn  (uncached/full-rate input)
 *   - cached_input_tokens                → cacheRead  (cached input)
 *   - output_tokens                      → tokensOut
 * Codex's `input_tokens` is the TOTAL input (cached included), so we subtract
 * the cached portion to leave only full-rate input in `tokensIn` — matching
 * claude's disjoint-counts semantics. Codex doesn't report cache-creation
 * tokens, a per-turn duration, or cost, so those map to null (cost is later
 * estimated from the price table).
 */
export function parseCodexTurnEvent(evt: Record<string, unknown>): ClaudeResultMetrics | null {
  if (evt.type !== "turn.completed") return null;
  const usage = evt.usage;
  if (!usage || typeof usage !== "object") return null;
  const u = usage as Record<string, unknown>;
  const totalIn = num(u.input_tokens);
  const cachedIn = num(u.cached_input_tokens);
  // Subtract cached out of the total so tokensIn is uncached-only. Clamp at 0
  // in case a malformed payload reports cached > total.
  const uncachedIn = totalIn === null ? null : Math.max(totalIn - (cachedIn ?? 0), 0);
  return {
    durationMs: null,
    totalCostUsd: null,
    numTurns: null,
    stopReason: null,
    tokensIn: uncachedIn,
    tokensOut: num(u.output_tokens),
    cacheRead: cachedIn,
    cacheCreate: null,
  };
}

/**
 * Scan a codex JSONL file line-by-line for the final `turn.completed`
 * usage event. Returns EMPTY metrics if the file is missing, unreadable,
 * or carries no usage event — callers treat that as "tokens unknown" and
 * still finalize the session. The last event wins (codex reports usage
 * cumulatively per turn; a single `codex exec` emits one).
 */
export async function readCodexResultFromFile(filePath: string): Promise<ClaudeResultMetrics> {
  let text: string;
  try {
    const fs = await import("node:fs");
    text = fs.readFileSync(filePath, "utf-8");
  } catch {
    return { ...EMPTY };
  }
  let found: ClaudeResultMetrics | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) continue;
    const r = parseCodexTurnEvent(parsed as Record<string, unknown>);
    if (r) found = r;
  }
  return found ?? { ...EMPTY };
}
