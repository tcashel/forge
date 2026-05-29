/**
 * forge session — record-only CLI hook called from the bash runner around
 * the agent invocation for execution / review / fix sessions.
 *
 * `forge session start` upserts a `sessions` row in `running` state.
 * `forge session finish` updates state / exit_code, and (when given a
 * stream-json file) parses tokens + cost into `sessions.metrics`.
 *
 * Failures are non-fatal: the runner appends to `$RUN_DIR/session-helper.log`
 * and continues. We exit 0 even on internal errors so a DB hiccup never
 * kills a customer-facing job. The runner is responsible for logging.
 */

import { parseArgs } from "node:util";
import { readResultFromFile } from "../../core/claude-stream.ts";
import { finalizeSession, type SessionPurpose, type SessionState, upsertSession } from "../../core/db/writes.ts";
import { estimateCost } from "../../core/pricing.ts";
import type { ForgeStore } from "../../core/store.ts";

export const HELP = `forge session <start|finish> [...flags]

Record-only helper invoked by the bash runner around an agent call.
Failures are logged but never exit non-zero — Forge guarantees the job
runner keeps going even if SQLite is wedged.

  start  --id <session-id> --purpose <execution|review|fix> --agent <name>
         [--model <m>] [--related-id <id>] [--cwd <path>]

  finish --id <session-id> --exit-code <n>
         [--stream-json-path <file>] [--reason <text>]
`;

const VALID_PURPOSES: SessionPurpose[] = ["execution", "review", "fix", "comment-fix"];

function logErr(msg: string): void {
  // Send to stderr but always exit 0. The bash runner pipes stderr into
  // a side log; never kill the job because of a session-helper miss.
  process.stderr.write(`forge session: ${msg}\n`);
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const sub = argv[0];
  const rest = argv.slice(1);
  try {
    if (sub === "start") {
      await runStart(rest, store);
      return;
    }
    if (sub === "finish") {
      await runFinish(rest, store);
      return;
    }
    logErr(`unknown subcommand: ${sub ?? "(missing)"}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logErr(msg);
  }
}

async function runStart(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      id: { type: "string" },
      purpose: { type: "string" },
      agent: { type: "string" },
      model: { type: "string" },
      "related-id": { type: "string" },
      cwd: { type: "string" },
    },
    strict: false,
  });

  const id = typeof values.id === "string" ? values.id : null;
  const purposeRaw = typeof values.purpose === "string" ? values.purpose : null;
  const agent = typeof values.agent === "string" ? values.agent : null;

  if (!id || !purposeRaw || !agent) {
    logErr("start requires --id, --purpose, and --agent");
    return;
  }
  if (!VALID_PURPOSES.includes(purposeRaw as SessionPurpose)) {
    logErr(`start: invalid --purpose '${purposeRaw}' (allowed: ${VALID_PURPOSES.join(", ")})`);
    return;
  }

  upsertSession(store.db.db, {
    id,
    purpose: purposeRaw as SessionPurpose,
    relatedId: typeof values["related-id"] === "string" ? values["related-id"] : null,
    agentAdapter: agent,
    model: typeof values.model === "string" ? values.model : null,
    startedAt: new Date().toISOString(),
    cwd: typeof values.cwd === "string" ? values.cwd : null,
    state: "running",
  });

  // Stamp the id on stdout so callers that want to capture it can grab
  // a single line (`SESSION_ID=$(forge session start ...)`).
  process.stdout.write(`${id}\n`);
}

async function runFinish(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      id: { type: "string" },
      "exit-code": { type: "string" },
      "stream-json-path": { type: "string" },
      reason: { type: "string" },
    },
    strict: false,
  });
  const id = typeof values.id === "string" ? values.id : null;
  const exitRaw = typeof values["exit-code"] === "string" ? values["exit-code"] : null;
  if (!id) {
    logErr("finish requires --id");
    return;
  }
  const exitCode = exitRaw === null ? null : Number.parseInt(exitRaw, 10);
  if (exitRaw !== null && !Number.isFinite(exitCode)) {
    logErr(`finish: --exit-code must be an integer (got '${exitRaw}')`);
    return;
  }
  const state: SessionState = exitCode === 0 ? "completed" : "failed";

  let metricsPatch: Parameters<typeof finalizeSession>[1]["metrics"] = {};
  const streamPath = typeof values["stream-json-path"] === "string" ? values["stream-json-path"] : null;
  if (streamPath) {
    const r = await readResultFromFile(streamPath);
    const costSource = r.totalCostUsd !== null ? "provider" : null;
    metricsPatch = {
      durationMs: r.durationMs,
      tokensIn: r.tokensIn,
      tokensOut: r.tokensOut,
      cacheRead: r.cacheRead,
      cacheCreate: r.cacheCreate,
      costUsd: r.totalCostUsd,
      costSource,
    };

    // Provider didn't report cost? Try the price table (no-op for claude
    // until pricing.ts has claude entries — which it intentionally
    // doesn't, because the provider path is the source of truth).
    if (costSource === null) {
      const row = store.db.db.prepare("SELECT agent_adapter, model FROM sessions WHERE id = ?").get(id) as
        | { agent_adapter: string; model: string | null }
        | undefined;
      if (row) {
        const est = estimateCost({
          agentAdapter: row.agent_adapter,
          model: row.model,
          tokensIn: r.tokensIn,
          tokensOut: r.tokensOut,
        });
        metricsPatch = { ...metricsPatch, ...est };
      }
    }
  }

  finalizeSession(store.db.db, {
    id,
    finishedAt: new Date().toISOString(),
    state,
    exitCode,
    error: typeof values.reason === "string" ? values.reason : null,
    metrics: metricsPatch,
  });
}
