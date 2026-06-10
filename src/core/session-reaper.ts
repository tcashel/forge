/**
 * Session + plan reapers — heal "running forever" state left by dead workers.
 *
 * Three failure shapes share one root cause: a detached process (review /
 * comment-fix worker, or the tmux bash runner) is the only thing that writes
 * the terminal state, so when it dies abruptly (SIGKILL, OOM, reboot, tmux
 * server kill) the sessions row / meta.json / plan stay "running" forever.
 * Consequences before this module existed:
 *
 *   - stale review/comment-fix sessions 409-blocked every future review of
 *     that PR via the single-flight guards (REVIEW_IN_FLIGHT / FIX_IN_FLIGHT);
 *   - plans whose tmux runner died kept a pulsing "Running" pill in the
 *     Workbench indefinitely;
 *   - a TUI dash kill updated only index.json, leaving the jobs row and
 *     meta.json lying about a live run.
 *
 * Callers: serve boot, serve's periodic reaper interval, and the single-flight
 * guards themselves (reap first, then re-check) so a dead worker can never
 * permanently wedge a PR.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { finalizeSession, syncJobState } from "./db/writes.ts";
import { isTmuxSessionAlive, killTmuxSession } from "./launch.ts";
import type { ForgeStore, Plan } from "./store.ts";

/** Sessions with no recorded pid are reaped only past this generous TTL. */
export const STALE_WORKER_SESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6h

/** Dead-tmux plans get this long after launch / last log write before reaping. */
export const DEAD_RUNNER_GRACE_MS = 60_000;

export interface ReapedWorkerSession {
  id: string;
  purpose: string;
  error: string;
}

export interface ReapedRunnerPlan {
  planId: string;
  errorMessage: string;
}

/**
 * Liveness probe via signal 0. ESRCH → dead. EPERM means the pid exists but
 * belongs to another user — counts as alive (never reap someone else's
 * process slot as "gone").
 */
export function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

interface StaleSessionRow {
  id: string;
  purpose: string;
  pid: number | null;
  started_at: string;
  metrics: string | null;
}

function sessionPid(row: StaleSessionRow): number | null {
  if (typeof row.pid === "number" && Number.isFinite(row.pid)) return row.pid;
  // Fallback: pid stamped only into metrics (metrics.pid for review workers,
  // metrics.workerPid for comment-fix workers).
  try {
    const metrics = JSON.parse(row.metrics ?? "{}") as { pid?: unknown; workerPid?: unknown };
    if (typeof metrics.pid === "number" && Number.isFinite(metrics.pid)) return metrics.pid;
    if (typeof metrics.workerPid === "number" && Number.isFinite(metrics.workerPid)) return metrics.workerPid;
  } catch {
    /* malformed metrics — treat as no pid */
  }
  return null;
}

/** Best-effort: flip the run dir's meta.json to failed so on-disk artifacts
 *  agree with the session row (the Workbench review drawer reads meta.json). */
function stampRunDirMetaFailed(metricsRaw: string | null, completedAt: string): void {
  let runDir: string | null = null;
  try {
    const metrics = JSON.parse(metricsRaw ?? "{}") as { runDir?: unknown };
    if (typeof metrics.runDir === "string" && metrics.runDir) runDir = metrics.runDir;
  } catch {
    return;
  }
  if (!runDir) return;
  const metaPath = path.join(runDir, "meta.json");
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as Record<string, unknown>;
    if (meta.status === "completed" || meta.status === "failed") return;
    meta.status = "failed";
    meta.completedAt = meta.completedAt ?? completedAt;
    meta.exitCode = typeof meta.exitCode === "number" ? meta.exitCode : -1;
    fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf-8");
  } catch {
    /* meta is advisory — the session row is the authority */
  }
}

export interface ReapStaleWorkerSessionsOpts {
  /** Injection seam for tests. Defaults to Date.now(). */
  now?: number;
  /** Override the no-pid TTL. Defaults to STALE_WORKER_SESSION_TTL_MS. */
  ttlMs?: number;
}

/**
 * Finalize `running` review / comment-fix / digest sessions whose worker is
 * provably gone (recorded pid is dead) or stale (no pid recorded and
 * started_at older than the TTL). Returns the reaped rows so callers can log.
 *
 * Never throws — a reaper that crashes its caller would be worse than the
 * stale rows it sweeps.
 */
export function reapStaleWorkerSessions(
  store: ForgeStore,
  opts: ReapStaleWorkerSessionsOpts = {},
): ReapedWorkerSession[] {
  const now = opts.now ?? Date.now();
  const ttlMs = opts.ttlMs ?? STALE_WORKER_SESSION_TTL_MS;
  const reaped: ReapedWorkerSession[] = [];
  let rows: StaleSessionRow[];
  try {
    rows = store.db.db
      .prepare(
        `SELECT id, purpose, pid, started_at, metrics
           FROM sessions
          WHERE purpose IN ('review', 'comment-fix', 'digest') AND state = 'running'`,
      )
      .all() as StaleSessionRow[];
  } catch {
    return reaped;
  }

  for (const row of rows) {
    const pid = sessionPid(row);
    let error: string | null = null;
    if (pid != null) {
      if (!isPidAlive(pid)) error = `worker died (pid ${pid} gone)`;
    } else {
      const startedMs = new Date(row.started_at).getTime();
      if (!Number.isNaN(startedMs) && now - startedMs > ttlMs) error = "worker stale (no heartbeat)";
    }
    if (!error) continue;

    const finishedAt = new Date(now).toISOString();
    try {
      finalizeSession(store.db.db, {
        id: row.id,
        finishedAt,
        state: "failed",
        exitCode: -1,
        error,
      });
    } catch {
      continue; // leave the row for the next sweep
    }
    stampRunDirMetaFailed(row.metrics, finishedAt);
    reaped.push({ id: row.id, purpose: row.purpose, error });
  }
  return reaped;
}

const RUNNING_FAMILY: ReadonlySet<Plan["status"]> = new Set(["running", "quality_check", "creating_pr", "fixing"]);

const TERMINAL_META_STATUSES = new Set(["done", "failed", "quality_failed"]);

export interface ReapDeadRunnerPlansOpts {
  now?: number;
  graceMs?: number;
  /** Injection seam for tests — defaults to the real tmux liveness probe. */
  isAlive?: (tmuxSession: string) => boolean;
}

/**
 * Fail plans whose tmux runner is gone: status is running-family, meta.json
 * is non-terminal, the tmux session is dead, AND neither the launch nor the
 * last log write is within the grace period (a runner that just started, or
 * is actively logging through a tmux blip, is left alone).
 *
 * Terminal-meta plans are skipped — store.syncPlanStatus already heals those
 * on the next /api/plans poll.
 */
export function reapDeadRunnerPlans(store: ForgeStore, opts: ReapDeadRunnerPlansOpts = {}): ReapedRunnerPlan[] {
  const now = opts.now ?? Date.now();
  const graceMs = opts.graceMs ?? DEAD_RUNNER_GRACE_MS;
  const isAlive = opts.isAlive ?? isTmuxSessionAlive;
  const reaped: ReapedRunnerPlan[] = [];

  let plans: Plan[];
  try {
    plans = store.getPlans().filter((p) => RUNNING_FAMILY.has(p.status));
  } catch {
    return reaped;
  }

  for (const plan of plans) {
    try {
      // No tmux session recorded → nothing to probe; leave it to the TTL-less
      // status sync (and the operator's kill button).
      if (!plan.tmuxSession) continue;

      const meta = store.readRunMeta(plan.id);
      const metaStatus = typeof meta?.status === "string" ? meta.status : null;
      if (metaStatus && TERMINAL_META_STATUSES.has(metaStatus)) continue; // syncPlanStatus heals this
      if (isAlive(plan.tmuxSession)) continue;

      const launchedMs = new Date(plan.launchedAt ?? plan.createdAt).getTime();
      if (!Number.isNaN(launchedMs) && now - launchedMs < graceMs) continue;
      const logFile = store.getLogFile(plan.id);
      try {
        const mtime = fs.statSync(logFile).mtimeMs;
        if (now - mtime < graceMs) continue;
      } catch {
        /* no log yet — launch grace above already applied */
      }

      const errorMessage = "runner died (tmux session gone)";
      const endedAt = new Date(now).toISOString();
      const merged = store.mergeRunMeta(plan.id, { status: "failed", errorMessage });
      if (merged) {
        // meta.json now says failed — syncPlanStatus flips the plan AND the
        // jobs row (it calls syncJobState internally) with completedAt set.
        store.syncPlanStatus(plan);
      } else {
        // No meta.json on disk (launch died before the runner wrote one) —
        // apply the kill recipe directly.
        store.upsertPlan({ ...plan, status: "failed", completedAt: endedAt });
        try {
          syncJobState(store.db.db, { ...plan, status: "failed" }, { status: "failed", endedAt, errorMessage });
        } catch {
          /* jobs row sync is best-effort — index.json is already healed */
        }
      }
      reaped.push({ planId: plan.id, errorMessage });
    } catch {
      /* one bad plan must not stop the sweep */
    }
  }
  return reaped;
}

/**
 * Shared kill recipe — the single source of truth for "operator killed this
 * run". Kills tmux, merges the failure into meta.json (locked merge — the
 * runner's bash set_status writes concurrently), flips the plan in
 * index.json, and finishes the SQLite jobs row. Used by both the serve kill
 * endpoint and the TUI dash so every surface agrees the run is dead.
 */
export function killPlan(store: ForgeStore, plan: Plan, errorMessage = "Killed by user"): void {
  if (plan.tmuxSession) killTmuxSession(plan.tmuxSession);
  store.mergeRunMeta(plan.id, { errorMessage, status: "failed" });
  const killedAt = new Date().toISOString();
  store.upsertPlan({ ...plan, status: "failed", completedAt: killedAt });
  // Sync the SQLite jobs row too. syncPlanStatus early-returns once a plan
  // is terminal, so without this the killed run stays `running` in DB
  // surfaces (`forge run ls`, Runs tab, history) indefinitely.
  try {
    syncJobState(store.db.db, { ...plan, status: "failed" }, { status: "failed", endedAt: killedAt, errorMessage });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`warn: syncJobState failed on kill for ${plan.id}: ${msg}\n`);
  }
}
