/**
 * forge wait <task-id> — block until the task reaches a terminal state.
 *
 * Linchpin for Claude Code conversational flows: launch, then wait,
 * then act on the outcome — all in one slash-command invocation.
 *
 * Flags:
 *   --until <csv>   Comma-separated terminal states. Default:
 *                   "done,failed,quality_failed".
 *                   Special: "pr_ready" → status=done AND prUrl != null.
 *   --timeout <d>   Duration like "30m", "2h", "90s" (default: 30m).
 *   --poll <d>      Polling interval (default: 3s).
 *   --json
 *
 * Heartbeat: in JSON mode emits NDJSON `{type:"heartbeat",...}` to
 * stderr each poll; in human mode emits one summary line per poll.
 * Final terminal status goes to stdout as a single JSON object.
 *
 * Exit codes: 0 satisfied, 3 stalled (tmux dead, status non-terminal),
 * 4 timeout, 1 unknown task.
 */

import { parseArgs } from "node:util";
import { isTmuxSessionAlive } from "../../core/launch.ts";
import type { ForgeStore, PlanStatus } from "../../core/store.ts";
import { CliError } from "../output.ts";

export const HELP = `forge wait <task-id> [...flags]

Block until the task reaches a terminal state. Used by the cc-plugin to
turn launch + outcome into a single conversational round.

Flags:
  --until <csv>     Comma-separated terminal states. Default:
                    "done,failed,quality_failed".
                    Special: "pr_ready" → status=done AND prUrl != null.
  --timeout <d>     Duration like "30m", "2h", "90s" (default: 30m).
  --poll <d>        Polling interval (default: 3s).
  --json

Heartbeats: in JSON mode, NDJSON \`{type:"heartbeat",...}\` to stderr each
poll; in human mode, one summary line per poll. Final terminal status to
stdout as a single JSON object.

Exit codes: 0 satisfied, 3 stalled, 4 timeout, 1 unknown task.
`;

const TERMINAL_DEFAULT: PlanStatus[] = ["done", "failed", "quality_failed"];

function parseDuration(s: string): number {
  const m = s.match(/^(\d+)\s*(ms|s|m|h)?$/);
  if (!m) throw new CliError("BAD_DURATION", `Invalid duration: ${s}`, { exitCode: 1 });
  const n = Number.parseInt(m[1], 10);
  const unit = m[2] ?? "s";
  return n * { ms: 1, s: 1000, m: 60000, h: 3600000 }[unit]!;
}

interface UntilSpec {
  statuses: Set<PlanStatus>;
  prRequired: boolean;
}

function parseUntil(csv: string | undefined): UntilSpec {
  if (!csv) return { statuses: new Set(TERMINAL_DEFAULT), prRequired: false };
  const parts = csv.split(",").map((s) => s.trim());
  const out: UntilSpec = { statuses: new Set(), prRequired: false };
  for (const p of parts) {
    if (p === "pr_ready") {
      out.statuses.add("done");
      out.prRequired = true;
    } else {
      out.statuses.add(p as PlanStatus);
    }
  }
  return out;
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      until: { type: "string" },
      timeout: { type: "string", default: "30m" },
      poll: { type: "string", default: "3s" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const id = positionals[0];
  if (!id) throw new CliError("MISSING_ARG", "Usage: forge wait <task-id>", { exitCode: 1 });

  const initial = store.getPlan(id);
  if (!initial) throw new CliError("UNKNOWN_TASK", `No task with id "${id}".`, { exitCode: 1 });

  const until = parseUntil(values.until as string | undefined);
  const timeoutMs = parseDuration(values.timeout as string);
  const pollMs = parseDuration(values.poll as string);
  const json = values.json === true;
  const start = Date.now();

  while (true) {
    const t = store.getPlan(id);
    if (!t) throw new CliError("DISAPPEARED", `Task ${id} disappeared mid-wait.`, { exitCode: 3 });
    store.syncPlanStatus(t);
    const cur = store.getPlan(id) ?? t;

    const satisfied = until.statuses.has(cur.status) && (!until.prRequired || cur.prUrl != null);
    if (satisfied) {
      const out = {
        planId: id,
        status: cur.status,
        satisfied: cur.status,
        prUrl: cur.prUrl,
        elapsedMs: Date.now() - start,
      };
      process.stdout.write(`${JSON.stringify(out)}\n`);
      return;
    }

    const tmuxAlive = cur.tmuxSession ? isTmuxSessionAlive(cur.tmuxSession) : false;
    const isTerminalAlready = ["done", "failed", "quality_failed"].includes(cur.status);
    if (!tmuxAlive && cur.tmuxSession && !isTerminalAlready) {
      throw new CliError("STALLED", `tmux session "${cur.tmuxSession}" is dead but task status is ${cur.status}.`, {
        hint: "Run `forge logs` and `forge status` to inspect.",
        exitCode: 3,
        detail: { status: cur.status, prUrl: cur.prUrl },
      });
    }

    if (Date.now() - start > timeoutMs) {
      throw new CliError("TIMEOUT", `Wait timed out after ${values.timeout} (still ${cur.status}).`, {
        exitCode: 4,
        detail: { status: cur.status, prUrl: cur.prUrl, elapsedMs: Date.now() - start },
      });
    }

    const heartbeat = {
      type: "heartbeat",
      planId: id,
      status: cur.status,
      tmuxAlive,
      prUrl: cur.prUrl,
      elapsedMs: Date.now() - start,
    };
    if (json) {
      process.stderr.write(`${JSON.stringify(heartbeat)}\n`);
    } else {
      const ageS = Math.round(heartbeat.elapsedMs / 1000);
      process.stderr.write(`[${ageS}s] status=${cur.status} tmuxAlive=${tmuxAlive}\n`);
    }

    await new Promise((r) => setTimeout(r, pollMs));
  }
}
