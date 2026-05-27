/**
 * forge run ls / run show — proves prior launches survive.
 *
 * The whole point of jobs.run_number was to stop overwriting meta.json
 * on re-launch. These tests sandbox a plan with three jobs, then verify
 * that `forge run ls` returns all three (newest first) and `forge run
 * show <plan> <run#>` drills into the right one.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { run as runCmd } from "../src/cli/cmd/run.ts";
import { recordJobStarted, recordPlanCreated, syncJobState } from "../src/core/db/writes.ts";
import { ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-runcmd-"));
}

function makePlan(): Plan {
  return {
    id: "plan-r1",
    title: "Run ls test",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/r1",
    worktree: "/tmp/wt",
    status: "draft",
    agent: "claude",
    model: "sonnet-4-6",
    createdAt: "2026-05-01T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "plan-r1.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
}

function makeMeta(startedAt: string): RunMeta {
  return {
    planId: "plan-r1",
    tmuxSession: "forge-plan-r1",
    logFile: "/dev/null",
    agent: "claude",
    model: "sonnet-4-6",
    worktree: "/tmp/wt",
    status: "running",
    startedAt,
    prUrl: null,
  };
}

// Capture stdout/stderr so the CLI's `emitOk` output is testable rather
// than streaming into the test runner's log.
function capture<T>(fn: () => Promise<T>): Promise<{ result: T; out: string; err: string }> {
  const origOut = process.stdout.write.bind(process.stdout);
  const origErr = process.stderr.write.bind(process.stderr);
  let out = "";
  let err = "";
  process.stdout.write = ((chunk: string | Uint8Array): boolean => {
    out += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string | Uint8Array): boolean => {
    err += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
    return true;
  }) as typeof process.stderr.write;
  return fn()
    .then((result) => ({ result, out, err }))
    .finally(() => {
      process.stdout.write = origOut;
      process.stderr.write = origErr;
    });
}

test("forge run ls returns all jobs newest-first; second launch did not overwrite", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan();
    recordPlanCreated(store.db.db, plan, "# spec");

    recordJobStarted(store.db.db, plan, makeMeta("2026-05-01T10:00:00.000Z"));
    syncJobState(store.db.db, plan, { status: "failed", endedAt: "2026-05-01T10:15:00.000Z" });
    recordJobStarted(store.db.db, plan, makeMeta("2026-05-01T11:00:00.000Z"));
    syncJobState(store.db.db, plan, { status: "done", endedAt: "2026-05-01T11:30:00.000Z" });
    recordJobStarted(store.db.db, plan, makeMeta("2026-05-01T12:00:00.000Z"));

    const { out } = await capture(() => runCmd(["ls", plan.id, "--json"], store));
    const parsed = JSON.parse(out) as { planId: string; jobs: Array<{ run_number: number; state: string }> };
    assert.equal(parsed.planId, plan.id);
    assert.equal(parsed.jobs.length, 3);
    assert.deepEqual(
      parsed.jobs.map((j) => j.run_number),
      [3, 2, 1],
      "newest-first",
    );
    assert.equal(parsed.jobs[0].state, "running");
    assert.equal(parsed.jobs[1].state, "succeeded");
    assert.equal(parsed.jobs[2].state, "failed");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("forge run show <plan> <run#> drills into the specific job", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan();
    recordPlanCreated(store.db.db, plan, "# spec");

    recordJobStarted(store.db.db, plan, makeMeta("2026-05-01T10:00:00.000Z"));
    recordJobStarted(store.db.db, plan, makeMeta("2026-05-01T11:00:00.000Z"));

    const { out } = await capture(() => runCmd(["show", plan.id, "2", "--json"], store));
    const parsed = JSON.parse(out) as { planId: string; job: { run_number: number; started_at: string } };
    assert.equal(parsed.job.run_number, 2);
    assert.equal(parsed.job.started_at, "2026-05-01T11:00:00.000Z");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("forge run show rejects an unknown run-number with UNKNOWN_RUN", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan();
    recordPlanCreated(store.db.db, plan, "# spec");
    recordJobStarted(store.db.db, plan, makeMeta("2026-05-01T10:00:00.000Z"));

    await assert.rejects(
      () => runCmd(["show", plan.id, "99"], store),
      (e: unknown) => (e as { code?: string }).code === "UNKNOWN_RUN",
    );
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("forge run ls on an unknown plan throws UNKNOWN_PLAN", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    await assert.rejects(
      () => runCmd(["ls", "nope"], store),
      (e: unknown) => (e as { code?: string }).code === "UNKNOWN_PLAN",
    );
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
