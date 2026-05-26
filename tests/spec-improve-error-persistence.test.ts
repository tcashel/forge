import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { persistImproveOutcome } from "../src/cli/cmd/spec.ts";
import type { ImproveResult } from "../src/core/improve.ts";
import { ForgeStore, type TaskRecord } from "../src/core/store.ts";

function withTmpHome(t: { after: (fn: () => void) => void }): ForgeStore {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "forge-improve-persist-"));
  const prev = process.env.HOME;
  process.env.HOME = home;
  t.after(() => {
    fs.rmSync(home, { recursive: true, force: true });
    if (prev !== undefined) process.env.HOME = prev;
    else delete process.env.HOME;
  });
  return new ForgeStore();
}

function seedDraft(store: ForgeStore, id: string, lastImproveError: TaskRecord["lastImproveError"] = null): TaskRecord {
  const task: TaskRecord = {
    id,
    title: id,
    repoRoot: "/tmp/repo",
    repoName: "repo",
    branch: `forge/${id}`,
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: new Date().toISOString(),
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "",
    specVersion: 1,
    lastImproveError,
  };
  store.upsertTask(task);
  return task;
}

const SKIPPED_RESULT: ImproveResult = {
  critiqueId: "",
  applied: false,
  changeCount: 0,
  mode: "skipped",
  error: "IMPROVE_FAILED: critique runner failed: critics or synthesizer failed",
};

const APPLIED_RESULT: ImproveResult = {
  critiqueId: "crit-abc",
  applied: true,
  changeCount: 2,
  mode: "applied",
  error: null,
};

const NOOP_RESULT: ImproveResult = {
  critiqueId: "crit-def",
  applied: false,
  changeCount: 0,
  mode: "no-op",
  error: null,
};

test("persistImproveOutcome stores the error string + mode + timestamp on skipped", (t) => {
  const store = withTmpHome(t);
  seedDraft(store, "task-skip");

  persistImproveOutcome("task-skip", SKIPPED_RESULT, store);

  const after = store.getTask("task-skip");
  assert.ok(after?.lastImproveError, "lastImproveError should be set");
  assert.equal(after.lastImproveError?.mode, "skipped");
  assert.equal(after.lastImproveError?.error, SKIPPED_RESULT.error);
  assert.match(after.lastImproveError?.at ?? "", /^\d{4}-\d{2}-\d{2}T/);
});

test("persistImproveOutcome clears prior error on applied", (t) => {
  const store = withTmpHome(t);
  seedDraft(store, "task-clear", {
    mode: "skipped",
    error: "previous failure",
    at: "2026-01-01T00:00:00Z",
  });

  persistImproveOutcome("task-clear", APPLIED_RESULT, store);

  const after = store.getTask("task-clear");
  assert.equal(after?.lastImproveError, null, "applied result must clear prior error");
});

test("persistImproveOutcome clears prior error on no-op", (t) => {
  const store = withTmpHome(t);
  seedDraft(store, "task-noop", {
    mode: "skipped",
    error: "old error",
    at: "2026-01-01T00:00:00Z",
  });

  persistImproveOutcome("task-noop", NOOP_RESULT, store);

  const after = store.getTask("task-noop");
  assert.equal(after?.lastImproveError, null, "no-op without error must clear prior error");
});

test("persistImproveOutcome is a no-op when the task is missing", (t) => {
  const store = withTmpHome(t);
  // No task created — should not throw and should not invent a record.
  persistImproveOutcome("never-existed", SKIPPED_RESULT, store);
  assert.equal(store.getTask("never-existed"), null);
});

test("persistImproveOutcome skips an upsert when the error is unchanged", (t) => {
  const store = withTmpHome(t);
  const original = seedDraft(store, "task-stable", {
    mode: "skipped",
    error: SKIPPED_RESULT.error as string,
    at: "2026-01-01T00:00:00Z",
  });

  persistImproveOutcome("task-stable", SKIPPED_RESULT, store);

  const after = store.getTask("task-stable");
  // Same error + mode → existing record (including its `at` timestamp) is kept untouched.
  assert.equal(after?.lastImproveError?.at, original.lastImproveError?.at);
});

test("TaskRecord.lastImproveError survives a fresh ForgeStore load (load-time default + persistence)", (t) => {
  const store = withTmpHome(t);
  seedDraft(store, "task-roundtrip");
  persistImproveOutcome("task-roundtrip", SKIPPED_RESULT, store);

  // New store instance reading the same forge dir on disk.
  const reopened = new ForgeStore({ forgeDir: store.forgeDir });
  const task = reopened.getTask("task-roundtrip");
  assert.equal(task?.lastImproveError?.error, SKIPPED_RESULT.error);
  assert.equal(task?.lastImproveError?.mode, "skipped");
});
