/**
 * Phase 3 — the headline acceptance signal for COO-84.
 *
 * Verifies that recording multiple launches against the same plan
 * produces sequential `jobs.run_number` values (1, 2, 3, …) instead
 * of overwriting a single slot. This is the core "stop losing run
 * history" guarantee.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { recordJobStarted, recordPlanCreated } from "../src/core/db/writes.ts";
import { ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-jobs-"));
}

function makeTask(): Plan {
  return {
    id: "task-jv-1",
    title: "Job versioning",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/jv",
    worktree: "/tmp/wt",
    status: "draft",
    agent: "claude",
    model: "sonnet-4-6",
    createdAt: "2026-03-01T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "task-jv-1.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
}

function makeMeta(task: Plan, startedAt: string): RunMeta {
  return {
    planId: task.id,
    tmuxSession: `forge-${task.id}`,
    logFile: "/dev/null",
    agent: "claude",
    model: "sonnet-4-6",
    worktree: task.worktree ?? "/tmp/wt",
    status: "running",
    startedAt,
    prUrl: null,
  };
}

test("two launches against one plan produce run_number 1, then 2", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = makeTask();
    recordPlanCreated(store.db.db, task, "# spec");

    const first = recordJobStarted(store.db.db, task, makeMeta(task, "2026-03-02T10:00:00.000Z"));
    assert.equal(first, 1, "first launch is run_number 1");

    const second = recordJobStarted(store.db.db, task, makeMeta(task, "2026-03-02T12:00:00.000Z"));
    assert.equal(second, 2, "second launch is run_number 2 (not overwriting)");

    const third = recordJobStarted(store.db.db, task, makeMeta(task, "2026-03-02T15:00:00.000Z"));
    assert.equal(third, 3, "third launch is run_number 3");

    const rows = store.db.db
      .prepare("SELECT run_number, started_at FROM jobs WHERE task_id = ? ORDER BY run_number")
      .all("t-task-jv-1") as Array<{ run_number: number; started_at: string }>;
    assert.equal(rows.length, 3);
    assert.deepEqual(
      rows.map((r) => r.run_number),
      [1, 2, 3],
    );
    assert.deepEqual(
      rows.map((r) => r.started_at),
      ["2026-03-02T10:00:00.000Z", "2026-03-02T12:00:00.000Z", "2026-03-02T15:00:00.000Z"],
    );
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("recordJobStarted self-heals when no plan rows exist yet (legacy launch)", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = makeTask();
    // Deliberately skip recordPlanCreated — models a task that pre-dates
    // Phase 3 dual-write being launched after dual-write lands.
    const runNumber = recordJobStarted(store.db.db, task, makeMeta(task, "2026-03-05T09:00:00.000Z"));
    assert.equal(runNumber, 1);

    const plan = store.db.db.prepare("SELECT id, stage FROM plans WHERE id = ?").get(task.id) as {
      id: string;
      stage: string;
    };
    assert.equal(plan.stage, "running");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("jobs row records the plan's branch + worktree from RunMeta", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = makeTask();
    recordPlanCreated(store.db.db, task, "# spec");
    recordJobStarted(store.db.db, task, makeMeta(task, "2026-03-10T08:00:00.000Z"));

    const job = store.db.db
      .prepare("SELECT branch_name, worktree_path, state FROM jobs WHERE run_number = 1")
      .get() as { branch_name: string; worktree_path: string; state: string };
    assert.equal(job.branch_name, "forge/jv");
    assert.equal(job.worktree_path, "/tmp/wt");
    assert.equal(job.state, "running");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
