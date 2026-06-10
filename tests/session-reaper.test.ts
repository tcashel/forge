/**
 * Session + plan reaper tests — the "nothing stays running forever" suite.
 *
 * Covers reapStaleWorkerSessions (dead-pid / stale review + comment-fix
 * sessions), reapDeadRunnerPlans (dead tmux runners), killPlan (serve/dash
 * kill parity), and the single-flight guard self-heal in runAdHocReview.
 *
 * No real gh/claude/tmux is spawned: subprocesses route through
 * __setReviewExecHooks and the reaper's injectable isAlive seam; pid
 * liveness uses signal-0 against this process and an already-exited child.
 */

import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { __setReviewExecHooks, runAdHocReview } from "../src/cli/cmd/review-actions.ts";
import { recordJobStarted, recordPlanCreated, upsertSession } from "../src/core/db/writes.ts";
import { isPidAlive, killPlan, reapDeadRunnerPlans, reapStaleWorkerSessions } from "../src/core/session-reaper.ts";
import { ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

const HOUR_MS = 60 * 60 * 1000;

interface Fixture {
  tmpHome: string;
  store: ForgeStore;
}

function setup(): Fixture {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-reaper-"));
  const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
  return { tmpHome, store };
}

function teardown(fx: Fixture): void {
  fs.rmSync(fx.tmpHome, { recursive: true, force: true });
}

/** Pid of a process that has provably already exited. */
function deadPid(): number {
  const r = spawnSync("true", { stdio: "ignore" });
  if (typeof r.pid !== "number") throw new Error("spawnSync returned no pid");
  return r.pid;
}

function seedWorkerSession(
  fx: Fixture,
  opts: {
    id: string;
    purpose?: "review" | "comment-fix";
    pid?: number | null;
    startedAt?: string;
    runDir?: string;
    metricsExtra?: Record<string, unknown>;
  },
): void {
  upsertSession(fx.store.db.db, {
    id: opts.id,
    purpose: opts.purpose ?? "review",
    relatedId: null,
    agentAdapter: "claude",
    model: "test-model",
    startedAt: opts.startedAt ?? new Date().toISOString(),
    pid: opts.pid ?? null,
    state: "running",
    metrics: { prNum: 7, repoRoot: "/tmp/repo", runDir: opts.runDir, ...opts.metricsExtra } as never,
  });
}

function sessionRow(fx: Fixture, id: string): { state: string; error: string | null; exit_code: number | null } {
  return fx.store.db.db.prepare("SELECT state, error, exit_code FROM sessions WHERE id = ?").get(id) as {
    state: string;
    error: string | null;
    exit_code: number | null;
  };
}

function makeRunningPlan(fx: Fixture, id: string, opts: { launchedAt?: string; withJob?: boolean } = {}): Plan {
  const launchedAt = opts.launchedAt ?? new Date().toISOString();
  const plan: Plan = {
    id,
    title: `Plan ${id}`,
    repoRoot: "/tmp/repo",
    repoName: "repo",
    branch: `forge/${id}`,
    worktree: null,
    status: "running",
    agent: "claude",
    model: "test-model",
    createdAt: launchedAt,
    launchedAt,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: `forge-${id}`,
    logFile: null,
    jiraTicket: null,
    specFile: fx.store.writeSpec(id, `# ${id}\n`),
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
  fx.store.upsertPlan(plan);
  const meta: RunMeta = {
    planId: id,
    tmuxSession: plan.tmuxSession as string,
    logFile: fx.store.getLogFile(id),
    agent: "claude",
    model: "test-model",
    worktree: "/tmp/wt",
    status: "running",
    startedAt: launchedAt,
    prUrl: null,
  };
  fx.store.ensureRunDir(id);
  fx.store.writeRunMeta(id, meta);
  if (opts.withJob !== false) {
    recordPlanCreated(fx.store.db.db, plan, `# ${id}\n`);
    recordJobStarted(fx.store.db.db, plan, meta);
  }
  return plan;
}

function jobRow(fx: Fixture, planId: string): { state: string; finished_at: string | null } | undefined {
  return fx.store.db.db
    .prepare(
      `SELECT j.state, j.finished_at
         FROM jobs j JOIN tasks t ON j.task_id = t.id
        WHERE t.plan_id = ?`,
    )
    .get(planId) as { state: string; finished_at: string | null } | undefined;
}

// ─── isPidAlive ──────────────────────────────────────────────────────────────

test("isPidAlive: current process is alive, an exited child is not", () => {
  assert.equal(isPidAlive(process.pid), true);
  assert.equal(isPidAlive(deadPid()), false);
});

// ─── reapStaleWorkerSessions ─────────────────────────────────────────────────

test("reaps a running review session whose recorded pid is dead, stamping run-dir meta failed", () => {
  const fx = setup();
  try {
    const runDir = path.join(fx.store.runsDir, "pr-review", "7-s-dead");
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(
      path.join(runDir, "meta.json"),
      `${JSON.stringify({ status: "running", completedAt: null, exitCode: null })}\n`,
    );
    const pid = deadPid();
    seedWorkerSession(fx, { id: "s-dead", pid, runDir });

    const reaped = reapStaleWorkerSessions(fx.store);
    assert.equal(reaped.length, 1);
    assert.equal(reaped[0].id, "s-dead");

    const row = sessionRow(fx, "s-dead");
    assert.equal(row.state, "failed");
    assert.equal(row.error, `worker died (pid ${pid} gone)`);
    assert.equal(row.exit_code, -1);

    const meta = JSON.parse(fs.readFileSync(path.join(runDir, "meta.json"), "utf-8")) as Record<string, unknown>;
    assert.equal(meta.status, "failed");
    assert.ok(meta.completedAt, "completedAt stamped");
  } finally {
    teardown(fx);
  }
});

test("leaves a running session with a live pid alone", () => {
  const fx = setup();
  try {
    seedWorkerSession(fx, { id: "s-live", pid: process.pid });
    const reaped = reapStaleWorkerSessions(fx.store);
    assert.equal(reaped.length, 0);
    assert.equal(sessionRow(fx, "s-live").state, "running");
  } finally {
    teardown(fx);
  }
});

test("no-pid sessions are reaped only past the TTL ('worker stale (no heartbeat)')", () => {
  const fx = setup();
  try {
    const now = Date.now();
    seedWorkerSession(fx, { id: "s-old", startedAt: new Date(now - 7 * HOUR_MS).toISOString() });
    seedWorkerSession(fx, { id: "s-young", startedAt: new Date(now - 1 * HOUR_MS).toISOString() });

    const reaped = reapStaleWorkerSessions(fx.store, { now });
    assert.deepEqual(
      reaped.map((r) => r.id),
      ["s-old"],
    );
    assert.equal(sessionRow(fx, "s-old").state, "failed");
    assert.equal(sessionRow(fx, "s-old").error, "worker stale (no heartbeat)");
    assert.equal(sessionRow(fx, "s-young").state, "running");
  } finally {
    teardown(fx);
  }
});

test("covers comment-fix sessions and falls back to metrics.workerPid when the pid column is null", () => {
  const fx = setup();
  try {
    const pid = deadPid();
    seedWorkerSession(fx, { id: "s-fix", purpose: "comment-fix", pid: null, metricsExtra: { workerPid: pid } });
    const reaped = reapStaleWorkerSessions(fx.store);
    assert.equal(reaped.length, 1);
    assert.equal(reaped[0].purpose, "comment-fix");
    assert.equal(sessionRow(fx, "s-fix").error, `worker died (pid ${pid} gone)`);
  } finally {
    teardown(fx);
  }
});

test("never touches terminal sessions or other purposes", () => {
  const fx = setup();
  try {
    upsertSession(fx.store.db.db, {
      id: "s-done",
      purpose: "review",
      relatedId: null,
      agentAdapter: "claude",
      model: null,
      startedAt: new Date(Date.now() - 9 * HOUR_MS).toISOString(),
      state: "completed",
    });
    upsertSession(fx.store.db.db, {
      id: "s-exec",
      purpose: "execution",
      relatedId: null,
      agentAdapter: "claude",
      model: null,
      startedAt: new Date(Date.now() - 9 * HOUR_MS).toISOString(),
      state: "running",
    });
    assert.equal(reapStaleWorkerSessions(fx.store).length, 0);
    assert.equal(sessionRow(fx, "s-done").state, "completed");
    assert.equal(sessionRow(fx, "s-exec").state, "running");
  } finally {
    teardown(fx);
  }
});

// ─── reapDeadRunnerPlans ─────────────────────────────────────────────────────

test("fails a running plan whose tmux is dead and whose log went quiet (meta + plan + jobs row)", () => {
  const fx = setup();
  try {
    const past = new Date(Date.now() - 10 * 60_000).toISOString();
    const plan = makeRunningPlan(fx, "dead-runner", { launchedAt: past });
    // Stale log: written, then mtime pushed back past the grace period.
    fs.writeFileSync(fx.store.getLogFile(plan.id), "started\n");
    const old = new Date(Date.now() - 5 * 60_000);
    fs.utimesSync(fx.store.getLogFile(plan.id), old, old);

    const reaped = reapDeadRunnerPlans(fx.store, { isAlive: () => false });
    assert.deepEqual(
      reaped.map((r) => r.planId),
      ["dead-runner"],
    );

    const updated = fx.store.getPlan(plan.id);
    assert.equal(updated?.status, "failed");
    assert.ok(updated?.completedAt, "completedAt stamped");

    const meta = fx.store.readRunMeta(plan.id);
    assert.equal(meta?.status, "failed");
    assert.equal(meta?.errorMessage, "runner died (tmux session gone)");

    const job = jobRow(fx, plan.id);
    assert.equal(job?.state, "failed");
    assert.ok(job?.finished_at, "jobs.finished_at set");
  } finally {
    teardown(fx);
  }
});

test("respects the grace period: a just-launched plan with dead tmux is left alone", () => {
  const fx = setup();
  try {
    makeRunningPlan(fx, "fresh-launch");
    const reaped = reapDeadRunnerPlans(fx.store, { isAlive: () => false });
    assert.equal(reaped.length, 0);
    assert.equal(fx.store.getPlan("fresh-launch")?.status, "running");
  } finally {
    teardown(fx);
  }
});

test("a recently-growing log keeps the plan alive even when tmux looks dead", () => {
  const fx = setup();
  try {
    const past = new Date(Date.now() - 10 * 60_000).toISOString();
    const plan = makeRunningPlan(fx, "busy-log", { launchedAt: past });
    fs.writeFileSync(fx.store.getLogFile(plan.id), "still working\n"); // fresh mtime
    const reaped = reapDeadRunnerPlans(fx.store, { isAlive: () => false });
    assert.equal(reaped.length, 0);
    assert.equal(fx.store.getPlan(plan.id)?.status, "running");
  } finally {
    teardown(fx);
  }
});

test("a live tmux session is never reaped", () => {
  const fx = setup();
  try {
    const past = new Date(Date.now() - 10 * 60_000).toISOString();
    makeRunningPlan(fx, "alive-runner", { launchedAt: past });
    const reaped = reapDeadRunnerPlans(fx.store, { isAlive: () => true });
    assert.equal(reaped.length, 0);
    assert.equal(fx.store.getPlan("alive-runner")?.status, "running");
  } finally {
    teardown(fx);
  }
});

test("terminal meta.json is left to syncPlanStatus (reaper skips it)", () => {
  const fx = setup();
  try {
    const past = new Date(Date.now() - 10 * 60_000).toISOString();
    const plan = makeRunningPlan(fx, "meta-done", { launchedAt: past });
    fx.store.mergeRunMeta(plan.id, { status: "done" });
    const reaped = reapDeadRunnerPlans(fx.store, { isAlive: () => false });
    assert.equal(reaped.length, 0);
    // Untouched by the reaper — the regular sync loop owns this transition.
    assert.equal(fx.store.readRunMeta(plan.id)?.status, "done");
  } finally {
    teardown(fx);
  }
});

// ─── killPlan (serve/dash kill parity) ───────────────────────────────────────

test("killPlan updates meta.json, index.json, and the jobs row in one shot", () => {
  const fx = setup();
  try {
    const plan = makeRunningPlan(fx, "killed-by-user");
    killPlan(fx.store, plan);

    const meta = fx.store.readRunMeta(plan.id);
    assert.equal(meta?.status, "failed");
    assert.equal(meta?.errorMessage, "Killed by user");

    const updated = fx.store.getPlan(plan.id);
    assert.equal(updated?.status, "failed");
    assert.ok(updated?.completedAt, "completedAt stamped");

    const job = jobRow(fx, plan.id);
    assert.equal(job?.state, "failed");
    assert.ok(job?.finished_at, "jobs.finished_at set — DB no longer lies about a live run");
  } finally {
    teardown(fx);
  }
});

// ─── single-flight guard self-heal ───────────────────────────────────────────

test("runAdHocReview reaps a dead-worker session instead of throwing REVIEW_IN_FLIGHT", async () => {
  const fx = setup();
  try {
    const repoRoot = path.join(fx.tmpHome, "repo");
    fs.mkdirSync(repoRoot, { recursive: true });
    fx.store.setRepoConfig(repoRoot, { reviewerAgent: "claude", reviewerModel: "test-model" });

    // Stale row: same (prNum, repoRoot), state running, provably dead pid.
    upsertSession(fx.store.db.db, {
      id: "s-stale",
      purpose: "review",
      relatedId: null,
      agentAdapter: "claude",
      model: "test-model",
      startedAt: new Date(Date.now() - HOUR_MS).toISOString(),
      pid: deadPid(),
      state: "running",
      metrics: { prNum: 7, repoRoot } as never,
    });

    __setReviewExecHooks({
      ghExec: () => JSON.stringify({ headRefName: "feat/x" }),
      spawnWorker: () => ({ pid: process.pid, unref: () => {} }),
    });
    try {
      const result = await runAdHocReview({ prNum: 7, repoRoot, repoName: "repo" }, fx.store);
      assert.ok(result.sessionId, "new review started instead of 409");
      assert.notEqual(result.sessionId, "s-stale");
    } finally {
      __setReviewExecHooks(null);
    }

    assert.equal(sessionRow(fx, "s-stale").state, "failed");
    assert.match(sessionRow(fx, "s-stale").error ?? "", /worker died \(pid \d+ gone\)/);
  } finally {
    teardown(fx);
  }
});

test("runAdHocReview still 409s when the in-flight worker is genuinely alive", async () => {
  const fx = setup();
  try {
    const repoRoot = path.join(fx.tmpHome, "repo");
    fs.mkdirSync(repoRoot, { recursive: true });
    fx.store.setRepoConfig(repoRoot, { reviewerAgent: "claude", reviewerModel: "test-model" });

    upsertSession(fx.store.db.db, {
      id: "s-really-running",
      purpose: "review",
      relatedId: null,
      agentAdapter: "claude",
      model: "test-model",
      startedAt: new Date().toISOString(),
      pid: process.pid, // alive
      state: "running",
      metrics: { prNum: 7, repoRoot } as never,
    });

    __setReviewExecHooks({
      ghExec: () => JSON.stringify({ headRefName: "feat/x" }),
      spawnWorker: () => {
        throw new Error("must not spawn — guard should trip first");
      },
    });
    try {
      await assert.rejects(
        () => runAdHocReview({ prNum: 7, repoRoot, repoName: "repo" }, fx.store),
        (e: unknown) => (e as { code?: string }).code === "REVIEW_IN_FLIGHT",
      );
    } finally {
      __setReviewExecHooks(null);
    }
    assert.equal(sessionRow(fx, "s-really-running").state, "running");
  } finally {
    teardown(fx);
  }
});
