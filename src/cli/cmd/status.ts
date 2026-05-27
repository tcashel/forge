/**
 * forge status <task-id> — show task + run state.
 *
 * Flags:
 *   --json
 *   --tail N        Lines of agent.log to include (default: 0 in --json, 8 in human)
 */

import { parseArgs } from "node:util";
import { isTmuxSessionAlive } from "../../core/launch.ts";
import type { ForgeStore } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge status <task-id> [...flags]

Show task and run state.

Flags:
  --json
  --tail N    Lines of agent.log to include (default: 0 in --json, 8 human)
`;

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      json: { type: "boolean", default: false },
      tail: { type: "string" },
    },
    strict: false,
    allowPositionals: true,
  });

  const id = positionals[0];
  if (!id) {
    throw new CliError("MISSING_ARG", "Usage: forge status <task-id>", { exitCode: 1 });
  }

  const task = store.getPlan(id);
  if (!task) {
    throw new CliError("UNKNOWN_TASK", `No task with id "${id}".`, {
      hint: "Run `forge ls` to see known tasks.",
      exitCode: 1,
    });
  }

  const json = values.json === true;
  const tailN = values.tail ? Number.parseInt(values.tail as string, 10) : json ? 0 : 8;
  const meta = store.readRunMeta(id);
  const tmuxAlive = task.tmuxSession ? isTmuxSessionAlive(task.tmuxSession) : false;
  const tail = tailN > 0 ? store.tailLog(id, tailN) : [];

  const result = { task, run: meta, tmuxAlive, tail };

  emitOk(result, json, () => {
    const lines: string[] = [
      `${task.id} — ${task.title}`,
      `  status:   ${task.status}`,
      `  branch:   ${task.branch}`,
      `  agent:    ${task.agent ?? "(none)"} / ${task.model ?? "(none)"}`,
      `  worktree: ${task.worktree ?? "(none)"}`,
      `  tmux:     ${task.tmuxSession ?? "(none)"}${tmuxAlive ? " [alive]" : task.tmuxSession ? " [dead]" : ""}`,
      `  pr:       ${task.prUrl ?? "(none)"}`,
    ];
    if (tail.length > 0) {
      lines.push("", "  recent log:");
      for (const ln of tail) lines.push(`    ${ln}`);
    }
    return lines.join("\n");
  });
}
