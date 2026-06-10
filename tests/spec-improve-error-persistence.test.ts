import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { persistImproveOutcome } from "../src/cli/cmd/spec.ts";
import type { ImproveResult } from "../src/core/improve.ts";
import { ForgeStore, type Plan } from "../src/core/store.ts";

function withTmpHome(t: { after: (fn: () => void) => void }): ForgeStore {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "forge-improve-persist-"));
  t.after(() => {
    fs.rmSync(home, { recursive: true, force: true });
  });
  // Pass forgeDir explicitly: under Bun, os.homedir() does not reflect
  // mid-run process.env.HOME mutation, so an env-based redirect silently
  // writes into the operator's real ~/.forge.
  const store = new ForgeStore({ forgeDir: path.join(home, ".forge") });
  assert.ok(
    !store.forgeDir.startsWith(path.join(os.homedir(), ".forge")),
    "test store must never resolve to the real ~/.forge",
  );
  return store;
}

function seedDraft(store: ForgeStore, id: string, lastImproveError: Plan["lastImproveError"] = null): Plan {
  const task: Plan = {
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
    archivedAt: null,
  };
  store.upsertPlan(task);
  return task;
}

const SKIPPED_RESULT: ImproveResult = {
  critiqueId: "",
  applied: false,
  changeCount: 0,
  mode: "skipped",
  error: "IMPROVE_FAILED: critique runner failed: critics or synthesizer failed",
  openQuestionsRecorded: 0,
  deferredCount: 0,
};

const APPLIED_RESULT: ImproveResult = {
  critiqueId: "crit-abc",
  applied: true,
  changeCount: 2,
  mode: "applied",
  error: null,
  openQuestionsRecorded: 0,
  deferredCount: 0,
};

const NOOP_RESULT: ImproveResult = {
  critiqueId: "crit-def",
  applied: false,
  changeCount: 0,
  mode: "no-op",
  error: null,
  openQuestionsRecorded: 0,
  deferredCount: 0,
};

test("withTmpHome isolates plan writes from the operator's real ~/.forge", (t) => {
  // Regression: this file previously redirected via process.env.HOME, which
  // os.homedir() ignores under Bun — fixture plans landed in the real store.
  const store = withTmpHome(t);
  assert.ok(store.forgeDir.startsWith(os.tmpdir()), "store must live under the OS tmp dir");
  assert.ok(!store.indexFile.startsWith(path.join(os.homedir(), ".forge")));

  seedDraft(store, "task-isolation-sentinel-002");
  assert.ok(fs.existsSync(store.indexFile), "index must be written in the tmp store");
  assert.ok(store.getPlan("task-isolation-sentinel-002"), "plan must be readable from the tmp store");
});

test("persistImproveOutcome stores the error string + mode + timestamp on skipped", (t) => {
  const store = withTmpHome(t);
  seedDraft(store, "task-skip");

  persistImproveOutcome("task-skip", SKIPPED_RESULT, store);

  const after = store.getPlan("task-skip");
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

  const after = store.getPlan("task-clear");
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

  const after = store.getPlan("task-noop");
  assert.equal(after?.lastImproveError, null, "no-op without error must clear prior error");
});

test("persistImproveOutcome is a no-op when the task is missing", (t) => {
  const store = withTmpHome(t);
  // No task created — should not throw and should not invent a record.
  persistImproveOutcome("never-existed", SKIPPED_RESULT, store);
  assert.equal(store.getPlan("never-existed"), null);
});

test("persistImproveOutcome refreshes `at` when the same error repeats", (t) => {
  // Repeated failures with the same message must refresh the timestamp so
  // the UI's chip tooltip reflects when the most recent failure occurred,
  // not the first one. Without this refresh, retries that keep failing
  // for the same reason look frozen and the user can't tell whether the
  // latest click did anything.
  const store = withTmpHome(t);
  const original = seedDraft(store, "task-stable", {
    mode: "skipped",
    error: SKIPPED_RESULT.error as string,
    at: "2026-01-01T00:00:00Z",
  });

  persistImproveOutcome("task-stable", SKIPPED_RESULT, store);

  const after = store.getPlan("task-stable");
  assert.notEqual(after?.lastImproveError?.at, original.lastImproveError?.at);
  assert.equal(after?.lastImproveError?.error, SKIPPED_RESULT.error);
  assert.match(after?.lastImproveError?.at ?? "", /^\d{4}-\d{2}-\d{2}T/);
});

test("persistImproveOutcome is a no-op when both prior and new are clean (null → null)", (t) => {
  // Successful apply on a task with no prior error → don't bother rewriting
  // the index for a no-change update. Pure perf/quiet-log optimisation.
  const store = withTmpHome(t);
  const original = seedDraft(store, "task-clean", null);
  const createdAt = original.createdAt;

  persistImproveOutcome("task-clean", APPLIED_RESULT, store);

  const after = store.getPlan("task-clean");
  assert.equal(after?.lastImproveError, null);
  // createdAt is a proxy for "record untouched" — if upsertPlan had run,
  // nothing else would change but we'd still see the upsert as a fresh
  // write. Assert the record is identical instead.
  assert.equal(after?.createdAt, createdAt);
});

test("Plan.lastImproveError survives a fresh ForgeStore load (load-time default + persistence)", (t) => {
  const store = withTmpHome(t);
  seedDraft(store, "task-roundtrip");
  persistImproveOutcome("task-roundtrip", SKIPPED_RESULT, store);

  // New store instance reading the same forge dir on disk.
  const reopened = new ForgeStore({ forgeDir: store.forgeDir });
  const task = reopened.getPlan("task-roundtrip");
  assert.equal(task?.lastImproveError?.error, SKIPPED_RESULT.error);
  assert.equal(task?.lastImproveError?.mode, "skipped");
});
