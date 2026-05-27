/**
 * forge run — inspect prior launches of a plan.
 *
 * Phase 4b of COO-84. Before SQLite landed, `~/.forge/runs/{id}/meta.json`
 * was a single overwritten slot — prior run history was lost the moment
 * you re-launched. With `jobs.run_number`, every launch sticks around.
 *
 *   forge run ls <plan-id>             — all prior jobs, newest first
 *   forge run show <plan-id> <run#>    — one job's detail
 */

import { parseArgs } from "node:util";
import type { ForgeStore } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge run <subcommand> [...args]

Subcommands:
  ls <plan-id>                 List every prior job for a plan
  show <plan-id> <run-number>  Show one job's detail
`;

interface JobRow {
  id: string;
  run_number: number;
  run_kind: string;
  state: string;
  branch_name: string | null;
  worktree_path: string | null;
  started_at: string | null;
  finished_at: string | null;
  exit_code: number | null;
  summary: string | null;
  blocker_summary: string | null;
  session_id: string | null;
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const sub = argv[0];
  if (!sub || sub === "--help" || sub === "-h") {
    process.stdout.write(HELP);
    return;
  }

  const rest = argv.slice(1);
  switch (sub) {
    case "ls":
      await runLs(rest, store);
      return;
    case "show":
      await runShow(rest, store);
      return;
    default:
      throw new CliError("UNKNOWN_SUBCMD", `Unknown run subcommand: ${sub}`, {
        hint: "Try `forge run ls <plan-id>` or `forge run show <plan-id> <run-number>`.",
      });
  }
}

async function runLs(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    allowPositionals: true,
    strict: false,
  });
  const planId = positionals[0];
  if (!planId) {
    throw new CliError("MISSING_ARG", "Usage: forge run ls <plan-id>");
  }
  assertPlanExists(store, planId);

  const jobs = listJobsForPlan(store, planId);
  emitOk({ planId, jobs }, Boolean(values.json), () => formatJobList(planId, jobs));
}

async function runShow(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    allowPositionals: true,
    strict: false,
  });
  const planId = positionals[0];
  const runNumberArg = positionals[1];
  if (!planId || !runNumberArg) {
    throw new CliError("MISSING_ARG", "Usage: forge run show <plan-id> <run-number>");
  }
  const runNumber = Number.parseInt(runNumberArg, 10);
  if (!Number.isFinite(runNumber) || runNumber <= 0) {
    throw new CliError("BAD_ARG", `run-number must be a positive integer; got "${runNumberArg}".`);
  }
  assertPlanExists(store, planId);

  const job = findJob(store, planId, runNumber);
  if (!job) {
    throw new CliError("UNKNOWN_RUN", `No run #${runNumber} for plan "${planId}".`, {
      hint: "Run `forge run ls <plan-id>` to see known run numbers.",
    });
  }

  emitOk({ planId, job }, Boolean(values.json), () => formatJobDetail(planId, job));
}

// ── data access ─────────────────────────────────────────────────────────────

function assertPlanExists(store: ForgeStore, planId: string): void {
  const row = store.db.db.prepare("SELECT id FROM plans WHERE id = ?").get(planId);
  if (!row) {
    throw new CliError("UNKNOWN_PLAN", `No plan with id "${planId}".`, {
      hint: "Run `forge ls` to see known plans, or `forge migrate from-json` to backfill legacy ones.",
    });
  }
}

function listJobsForPlan(store: ForgeStore, planId: string): JobRow[] {
  return store.db.db
    .prepare(
      `SELECT j.id, j.run_number, j.run_kind, j.state, j.branch_name, j.worktree_path,
              j.started_at, j.finished_at, j.exit_code, j.summary, j.blocker_summary, j.session_id
       FROM jobs j JOIN tasks t ON j.task_id = t.id
       WHERE t.plan_id = ?
       ORDER BY j.run_number DESC`,
    )
    .all(planId) as JobRow[];
}

function findJob(store: ForgeStore, planId: string, runNumber: number): JobRow | undefined {
  return store.db.db
    .prepare(
      `SELECT j.id, j.run_number, j.run_kind, j.state, j.branch_name, j.worktree_path,
              j.started_at, j.finished_at, j.exit_code, j.summary, j.blocker_summary, j.session_id
       FROM jobs j JOIN tasks t ON j.task_id = t.id
       WHERE t.plan_id = ? AND j.run_number = ?`,
    )
    .get(planId, runNumber) as JobRow | undefined;
}

// ── human formatters ────────────────────────────────────────────────────────

function formatJobList(planId: string, jobs: JobRow[]): string {
  if (jobs.length === 0) {
    return `(no recorded runs for ${planId} — try \`forge migrate from-json\` if this plan predates SQLite)`;
  }
  return jobs
    .map((j) => {
      const started = j.started_at ? formatTs(j.started_at) : "—";
      const tail = j.summary ?? j.blocker_summary ?? "";
      const tailFmt = tail ? `  ${truncate(tail, 60)}` : "";
      return `  r${String(j.run_number).padEnd(3)} ${j.state.padEnd(10)} ${started}${tailFmt}`;
    })
    .join("\n");
}

function formatJobDetail(planId: string, j: JobRow): string {
  const lines = [
    `plan        ${planId}`,
    `run         #${j.run_number} (${j.run_kind})`,
    `state       ${j.state}`,
    `branch      ${j.branch_name ?? "—"}`,
    `worktree    ${j.worktree_path ?? "—"}`,
    `started     ${j.started_at ?? "—"}`,
    `finished    ${j.finished_at ?? "—"}`,
    `exit_code   ${j.exit_code ?? "—"}`,
    `session     ${j.session_id ?? "—"}`,
  ];
  if (j.summary) lines.push("", "summary:", indent(j.summary, "  "));
  if (j.blocker_summary) lines.push("", "blocker:", indent(j.blocker_summary, "  "));
  return lines.join("\n");
}

function formatTs(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

function truncate(s: string, max: number): string {
  const trimmed = s.replace(/\s+/g, " ").trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

function indent(s: string, prefix: string): string {
  return s
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}
