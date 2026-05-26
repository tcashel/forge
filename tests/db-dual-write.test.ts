/**
 * Phase 3 dual-write — verifies that spec writes land in SQLite alongside
 * the existing JSON state. Smoke level: one save, one improve, assert
 * plans + plan_versions + synthetic tasks rows exist with correct
 * `current_version_id` advancing.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { recordPlanCreated, recordPlanVersionAdded } from "../src/core/db/writes.ts";
import { ForgeStore, type TaskRecord } from "../src/core/store.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-dual-"));
}

function makeTask(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: "task-dw-1",
    title: "Dual write smoke",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/dw",
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: "2026-02-01T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "task-dw-1.md",
    specVersion: 1,
    lastImproveError: null,
    ...overrides,
  };
}

test("recordPlanCreated lands plans + plan_versions v1 + synthetic task", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = makeTask();
    recordPlanCreated(store.db.db, task, "# Goal\nLand the contract.");

    const plan = store.db.db.prepare("SELECT * FROM plans WHERE id = ?").get(task.id) as Record<string, unknown>;
    assert.equal(plan.title, "Dual write smoke");
    assert.equal(plan.stage, "drafting");
    assert.equal(plan.current_version_id, "pv-task-dw-1-v1");

    const v1 = store.db.db
      .prepare("SELECT * FROM plan_versions WHERE plan_id = ? AND version_number = 1")
      .get(task.id) as Record<string, unknown>;
    assert.ok(v1, "v1 row exists");
    assert.equal(v1.created_by, "user");
    assert.ok((v1.document as string).includes("Land the contract"));

    const syntheticTask = store.db.db
      .prepare("SELECT * FROM tasks WHERE plan_id = ? AND sequence = 1")
      .get(task.id) as Record<string, unknown>;
    assert.equal(syntheticTask.id, "t-task-dw-1");
    assert.equal(syntheticTask.state, "ready");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("recordPlanVersionAdded advances plans.current_version_id and tasks.plan_version_id", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = makeTask();
    recordPlanCreated(store.db.db, task, "v1 body");

    const v2Body = "v2 body — improved";
    recordPlanVersionAdded(store.db.db, task, 2, v2Body);

    const plan = store.db.db.prepare("SELECT current_version_id FROM plans WHERE id = ?").get(task.id) as {
      current_version_id: string;
    };
    assert.equal(plan.current_version_id, "pv-task-dw-1-v2");

    const v2 = store.db.db
      .prepare("SELECT * FROM plan_versions WHERE plan_id = ? AND version_number = 2")
      .get(task.id) as Record<string, unknown>;
    assert.equal(v2.created_by, "agent:improver");
    assert.equal(v2.document, v2Body);

    const syntheticTask = store.db.db
      .prepare("SELECT plan_version_id, spec FROM tasks WHERE plan_id = ? AND sequence = 1")
      .get(task.id) as Record<string, unknown>;
    assert.equal(syntheticTask.plan_version_id, "pv-task-dw-1-v2");
    assert.equal(syntheticTask.spec, v2Body);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("recordPlanVersionAdded self-heals when plan + synthetic task don't exist yet", () => {
  // Models the case where a task pre-dates dual-write: only TaskRecord on
  // disk, no plan rows in DB. The improver should still succeed and the
  // helper should backfill the missing rows from the TaskRecord.
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = makeTask({ id: "task-prelegacy", specVersion: 3 });
    // Deliberately skip recordPlanCreated.
    recordPlanVersionAdded(store.db.db, task, 3, "v3 body");

    const plan = store.db.db.prepare("SELECT id FROM plans WHERE id = ?").get(task.id);
    assert.ok(plan, "self-healed plan row exists");

    const synthetic = store.db.db.prepare("SELECT id FROM tasks WHERE plan_id = ? AND sequence = 1").get(task.id);
    assert.ok(synthetic, "self-healed synthetic task exists");

    const v3 = store.db.db
      .prepare("SELECT version_number FROM plan_versions WHERE plan_id = ? AND version_number = 3")
      .get(task.id) as { version_number: number };
    assert.equal(v3.version_number, 3);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
