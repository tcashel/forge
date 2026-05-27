/**
 * forge ls — list tasks (default: current repo).
 *
 * Flags:
 *   --repo <path>           Limit to a specific repo root (default: cwd's repo)
 *   --all                   Show every task across every repo
 *   --status <comma-list>   Filter by status (draft,running,done,failed,...)
 *   --json                  Machine-readable output
 */

import { parseArgs } from "node:util";
import { isTmuxSessionAlive } from "../../core/launch.ts";
import { detectRepo } from "../../core/repo.ts";
import type { ForgeStore, Plan, PlanStatus } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge ls [...flags]

List tasks (default: current repo).

Flags:
  --repo <path>             Limit to a specific repo root (default: cwd's repo)
  --all                     Show every task across every repo
  --status <comma-list>     Filter by status (draft,running,done,failed,...)
  --json                    Machine-readable output
`;

export interface PlanSummary {
  id: string;
  title: string;
  status: PlanStatus;
  agent: string | null;
  branch: string;
  repo: string;
  createdAt: string;
  prUrl: string | null;
  tmuxAlive: boolean;
}

function summarize(t: Plan): PlanSummary {
  return {
    id: t.id,
    title: t.title,
    status: t.status,
    agent: t.agent,
    branch: t.branch,
    repo: t.repoName,
    createdAt: t.createdAt,
    prUrl: t.prUrl,
    tmuxAlive: t.tmuxSession ? isTmuxSessionAlive(t.tmuxSession) : false,
  };
}

function statusIcon(s: PlanStatus): string {
  switch (s) {
    case "done":
      return "✓";
    case "failed":
    case "quality_failed":
      return "✗";
    case "draft":
      return "○";
    default:
      return "⟳";
  }
}

function humanFormat(tasks: PlanSummary[]): string {
  if (tasks.length === 0) return "(no tasks)";
  return tasks
    .map((t) => {
      const tail = t.prUrl ? `  ${t.prUrl}` : "";
      const tmux = t.tmuxAlive ? " [tmux]" : "";
      return `  ${statusIcon(t.status)} ${t.id}  ${t.status}  ${t.branch}${tmux}${tail}`;
    })
    .join("\n");
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      repo: { type: "string" },
      all: { type: "boolean", default: false },
      status: { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const json = values.json === true;
  let repoRoot: string | undefined;
  if (values.all) {
    repoRoot = undefined;
  } else if (typeof values.repo === "string") {
    repoRoot = values.repo;
  } else {
    const detected = detectRepo(process.cwd());
    if (!detected) {
      throw new CliError("NOT_A_REPO", "Not in a git repository.", {
        hint: "Pass --all to list across every repo, or --repo <path>.",
        exitCode: 2,
      });
    }
    repoRoot = detected.root;
  }

  let plans = store.getPlans(repoRoot).map(summarize);
  if (typeof values.status === "string") {
    const wanted = new Set(values.status.split(",").map((s) => s.trim()));
    plans = plans.filter((t) => wanted.has(t.status));
  }

  emitOk({ plans }, json, () => humanFormat(plans));
}
