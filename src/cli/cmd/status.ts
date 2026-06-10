/**
 * forge status <task-id> — show task + run state.
 *
 * Reconciles index.json with the runner's meta.json before printing (the
 * bash runner only writes transitions to meta.json), and surfaces failure
 * detail — errorMessage, review outcome, quality summary, publish outcome —
 * in the human output so terminal states are never Workbench-only.
 *
 * Flags:
 *   --json
 *   --tail N        Lines of agent.log to include (default: 0 in --json, 8 in human)
 */

import { parseArgs } from "node:util";
import { isTmuxSessionAlive } from "../../core/launch.ts";
import { type PublishRecord, readPublishRecord } from "../../core/publish-record.ts";
import type { ForgeStore, Plan, RunMeta } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge status <task-id> [...flags]

Show task and run state.

Flags:
  --json
  --tail N    Lines of agent.log to include (default: 0 in --json, 8 human)
`;

/**
 * Publish outcome of the most recent ad-hoc review session for this plan's
 * PR. Review sessions are keyed by (prNum, repoRoot) in their metrics blob —
 * see prepareReviewSession in review-actions.ts. Best-effort: any DB or
 * parse hiccup returns null rather than breaking `forge status`.
 */
function latestReviewPublish(store: ForgeStore, task: Plan): PublishRecord | null {
  if (task.prNumber == null) return null;
  try {
    const row = store.db.db
      .prepare(
        `SELECT metrics FROM sessions
          WHERE purpose = 'review'
            AND json_extract(metrics, '$.prNum') = ?
            AND json_extract(metrics, '$.repoRoot') = ?
          ORDER BY started_at DESC
          LIMIT 1`,
      )
      .get(task.prNumber, task.repoRoot) as { metrics: string | null } | undefined;
    if (!row?.metrics) return null;
    const metrics = JSON.parse(row.metrics) as { runDir?: unknown };
    if (typeof metrics.runDir !== "string") return null;
    return readPublishRecord(metrics.runDir);
  } catch {
    return null;
  }
}

function publishLine(publish: PublishRecord, prNumber: number): string | null {
  if (publish.state !== "failed" && publish.state !== "partial" && publish.state !== "reconcile-failed") return null;
  const label =
    publish.state === "partial"
      ? `PARTIAL — ${publish.posted} posted, ${publish.failed} failed`
      : publish.state === "reconcile-failed"
        ? "FAILED (reconcile)"
        : "FAILED";
  const detail = publish.error ? ` — ${publish.error}` : "";
  return `  publish:  ${label}${detail}; retry: forge review ${prNumber} --publish-only`;
}

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

  const stored = store.getPlan(id);
  if (!stored) {
    throw new CliError("UNKNOWN_TASK", `No task with id "${id}".`, {
      hint: "Run `forge ls` to see known tasks.",
      exitCode: 1,
    });
  }

  // Reconcile with the runner's meta.json before printing. The bash runner
  // only writes status transitions to meta.json; without this a finished or
  // failed run reads "running" forever (cli-status-never-syncs-meta).
  const task = store.syncPlanStatus(stored) ?? stored;

  const json = values.json === true;
  const tailN = values.tail ? Number.parseInt(values.tail as string, 10) : json ? 0 : 8;
  const meta = store.readRunMeta(id) as (Partial<RunMeta> & Record<string, unknown>) | null;
  const tmuxAlive = task.tmuxSession ? isTmuxSessionAlive(task.tmuxSession) : false;
  const tail = tailN > 0 ? store.tailLog(id, tailN) : [];
  const publish = latestReviewPublish(store, task);

  const result = { task, run: meta, tmuxAlive, tail, publish };

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

    // Failure / review / quality detail from the run meta — these used to be
    // Workbench-only (cli-status-hides-failure-detail).
    if (meta) {
      if (typeof meta.errorMessage === "string" && meta.errorMessage) {
        lines.push(`  error:    ${meta.errorMessage}`);
      }
      if (typeof meta.reviewVerdict === "string" && meta.reviewVerdict) {
        lines.push(`  review:   ${meta.reviewVerdict}`);
      } else if (typeof meta.reviewError === "string" && meta.reviewError) {
        lines.push(`  review:   error — ${meta.reviewError}`);
      }
      const quality = Array.isArray(meta.qualityResults)
        ? (meta.qualityResults as { command: string; ok: boolean }[])
        : null;
      if (quality && quality.length > 0) {
        const passed = quality.filter((q) => q.ok).length;
        const failing = quality.filter((q) => !q.ok).map((q) => q.command);
        lines.push(
          `  quality:  ${passed}/${quality.length} checks passed${failing.length > 0 ? ` (failed: ${failing.join(", ")})` : ""}`,
        );
      }
    }

    if (publish && task.prNumber != null) {
      const line = publishLine(publish, task.prNumber);
      if (line) lines.push(line);
    }

    const failed =
      task.status === "failed" ||
      task.status === "quality_failed" ||
      Boolean(meta && (meta.errorMessage || meta.reviewError));
    if (failed) lines.push(`  see: forge logs ${task.id}`);

    if (tail.length > 0) {
      lines.push("", "  recent log:");
      for (const ln of tail) lines.push(`    ${ln}`);
    }
    return lines.join("\n");
  });
}
