/**
 * Shared parser for `claude --print --output-format stream-json --verbose` lines.
 *
 * Consumers:
 *   - src/core/plan-chat.ts (planner SSE) — uses the full event vocabulary.
 *   - src/cli/cmd/session.ts (job/review/fix session finalize) — reads the
 *     `result` event from the persisted `.stream.jsonl` file to extract
 *     tokens + cost into sessions.metrics.
 *
 * Fixture: tests/fixtures/claude-stream-result.jsonl. Field names below
 * match what the CLI actually emits there.
 */
export interface ClaudeResultMetrics {
  durationMs: number | null;
  totalCostUsd: number | null;
  numTurns: number | null;
  stopReason: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  cacheRead: number | null;
  cacheCreate: number | null;
}

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

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

/**
 * Parse a single `result` event payload. Returns null when the event
 * isn't a `result`. Field names match the CLI's stream-json output (see
 * tests/fixtures/claude-stream-result.jsonl):
 *   - duration_ms, num_turns, stop_reason, total_cost_usd
 *   - usage.input_tokens / output_tokens / cache_read_input_tokens /
 *     cache_creation_input_tokens
 */
export function parseResultEvent(evt: Record<string, unknown>): ClaudeResultMetrics | null {
  if (evt.type !== "result") return null;
  const usage = (evt.usage ?? {}) as Record<string, unknown>;
  return {
    durationMs: num(evt.duration_ms),
    totalCostUsd: num(evt.total_cost_usd),
    numTurns: num(evt.num_turns),
    stopReason: str(evt.stop_reason),
    tokensIn: num(usage.input_tokens),
    tokensOut: num(usage.output_tokens),
    cacheRead: num(usage.cache_read_input_tokens),
    cacheCreate: num(usage.cache_creation_input_tokens),
  };
}

/**
 * Scan a stream-json file line-by-line for the final `result` event.
 * Returns EMPTY metrics if the file is missing, unreadable, or contains
 * no `result` event — callers should treat that as "tokens unknown" and
 * still finalize the session.
 */
export async function readResultFromFile(filePath: string): Promise<ClaudeResultMetrics> {
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
    const r = parseResultEvent(parsed as Record<string, unknown>);
    if (r) found = r;
  }
  return found ?? { ...EMPTY };
}
