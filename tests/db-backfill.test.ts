/**
 * Phase 2 — backfill from ~/.forge/ JSON into the SQLite contract.
 *
 * Builds a synthetic ~/.forge/ tree with two TaskRecords, a spec body,
 * a completed critique, and a finished run meta. Runs backfill and
 * asserts each table has the expected row counts and key fields, then
 * runs it a second time and asserts zero new rows (idempotent).
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { backfillFromJson } from "../src/core/db/backfill.ts";
import { ForgeDb } from "../src/core/db/connection.ts";
import { type CritiqueMeta, ForgeStore, type RunMeta, type TaskRecord } from "../src/core/store.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-backfill-"));
}

function seedTask(store: ForgeStore, task: TaskRecord, specBody: string): void {
  store.upsertTask(task);
  store.writeSpec(task.id, specBody);
}

function seedRunMeta(store: ForgeStore, taskId: string, meta: RunMeta): void {
  store.ensureRunDir(taskId);
  store.writeRunMeta(taskId, meta);
}

function seedCritique(store: ForgeStore, taskId: string, meta: CritiqueMeta): void {
  store.writeCritiqueMeta(taskId, meta.critiqueId, meta);
}

function baseTask(overrides: Partial<TaskRecord>): TaskRecord {
  return {
    id: "task-1",
    title: "Test task",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "main",
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "task-1.md",
    specVersion: 1,
    lastImproveError: null,
    ...overrides,
  };
}

test("backfill produces plans, plan_versions, synthetic tasks, jobs, and critique rows", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const db = new ForgeDb({ forgeDir });

    const draft = baseTask({ id: "draft-1", title: "Draft only", specVersion: 1 });
    const done = baseTask({
      id: "done-1",
      title: "Completed run",
      status: "done",
      agent: "claude",
      model: "sonnet-4-6",
      launchedAt: "2026-01-02T00:00:00.000Z",
      completedAt: "2026-01-02T00:30:00.000Z",
      prUrl: "https://github.com/x/x/pull/1",
      prNumber: 1,
      specVersion: 2,
    });
    seedTask(store, draft, "# Draft\nBody");
    seedTask(store, done, "# Done\nBody v2");

    seedRunMeta(store, done.id, {
      taskId: done.id,
      tmuxSession: "forge-done-1",
      logFile: store.getLogFile(done.id),
      agent: "claude",
      model: "sonnet-4-6",
      worktree: "/tmp/wt",
      status: "done",
      startedAt: done.launchedAt as string,
      endedAt: done.completedAt as string,
      durationMs: 1800000,
      prUrl: done.prUrl,
      prNumber: done.prNumber as number,
    });

    seedCritique(store, draft.id, {
      schemaVersion: 1,
      taskId: draft.id,
      critiqueId: "crit-abc",
      specTitle: draft.title,
      repoRoot: draft.repoRoot,
      repoName: draft.repoName,
      status: "done",
      startedAt: "2026-01-01T01:00:00.000Z",
      completedAt: "2026-01-01T01:05:00.000Z",
      viewedAt: null,
      tmuxSession: "forge-critique-abc",
      criticA: { agent: "claude", model: "sonnet-4-6", status: "done", durationMs: 120000 },
      criticB: { agent: "codex", model: "gpt-5", status: "done", durationMs: 150000 },
      synthesizer: { agent: "claude", model: "opus-4-7", status: "done", durationMs: 80000 },
    });

    const counts = backfillFromJson(store, db.db);
    assert.equal(counts.plans, 2, "two plans");
    assert.equal(counts.planVersions, 2, "two plan versions");
    assert.equal(counts.tasks, 2, "two synthetic tasks");
    assert.equal(counts.jobs, 1, "one job (only the done one had run meta)");
    assert.equal(counts.sessions, 3, "three critique sessions (a + b + synth)");
    assert.equal(counts.criticRuns, 2, "two critic runs (a + b)");
    assert.equal(counts.criticSyntheses, 1, "one synthesis row for the done critique");
    // 3 unique (agent, model) pairs across criticA/B/synth: claude:sonnet-4-6, codex:gpt-5, claude:opus-4-7
    assert.equal(counts.criticConfigs, 3);

    // Spot-check fields wired through correctly.
    const plan = db.db.prepare("SELECT * FROM plans WHERE id = ?").get(done.id) as Record<string, unknown>;
    assert.equal(plan.title, "Completed run");
    assert.equal(plan.stage, "completed");
    assert.equal(plan.repo_path, "/repo/x");
    assert.ok(plan.current_version_id, "current_version_id is set after plan_versions insert");

    const job = db.db.prepare("SELECT * FROM jobs WHERE task_id = ?").get(`bf-t-${done.id}`) as Record<string, unknown>;
    assert.equal(job.run_number, 1);
    assert.equal(job.run_kind, "initial");
    assert.equal(job.state, "succeeded");

    const synth = db.db
      .prepare("SELECT * FROM critic_syntheses WHERE target_id = ?")
      .get(`bf-pv-${draft.id}-v1`) as Record<string, unknown>;
    assert.ok(synth, "synthesis row points at the draft's plan_version");
    const runIds = JSON.parse(synth.critic_run_ids as string) as string[];
    assert.deepEqual(runIds, ["bf-cr-crit-abc-a", "bf-cr-crit-abc-b"]);

    db.close();
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("backfill is idempotent — second run inserts zero rows", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const db = new ForgeDb({ forgeDir });

    const t = baseTask({ id: "only-1", title: "Only" });
    seedTask(store, t, "# body");

    const first = backfillFromJson(store, db.db);
    assert.equal(first.plans, 1);
    assert.equal(first.planVersions, 1);
    assert.equal(first.tasks, 1);

    const second = backfillFromJson(store, db.db);
    assert.equal(second.plans, 0);
    assert.equal(second.planVersions, 0);
    assert.equal(second.tasks, 0);
    assert.equal(second.jobs, 0);
    assert.equal(second.sessions, 0);
    assert.equal(second.criticRuns, 0);
    assert.equal(second.criticSyntheses, 0);
    assert.equal(second.criticConfigs, 0);

    db.close();
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
