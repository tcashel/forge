/**
 * readIndex parsed-index cache + tailLog bounded tail-read.
 *
 * The cache must be invisible: same data as a fresh parse, invalidated by
 * both in-process writes (upsertPlan/writeIndex) and out-of-band writes
 * from another process/store instance (atomic rename → new inode).
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { ForgeStore, type Plan } from "../src/core/store.ts";

function tmpStore(t: { after: (fn: () => void) => void }): ForgeStore {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-idx-cache-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return new ForgeStore({ forgeDir: dir });
}

function makePlan(id: string, overrides: Partial<Plan> = {}): Plan {
  return {
    id,
    title: id,
    repoRoot: "/tmp/nowhere",
    repoName: "nowhere",
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
    lastImproveError: null,
    archivedAt: null,
    ...overrides,
  } as Plan;
}

test("readIndex returns the same parsed object until the file changes", (t) => {
  const store = tmpStore(t);
  store.upsertPlan(makePlan("alpha"));
  const a = store.readIndex();
  const b = store.readIndex();
  assert.equal(a, b, "fresh stat should serve the cached parse");
});

test("in-process writes invalidate the cache", (t) => {
  const store = tmpStore(t);
  store.upsertPlan(makePlan("alpha"));
  assert.equal(store.getPlans().length, 1);
  store.upsertPlan(makePlan("beta"));
  assert.equal(store.getPlans().length, 2);
  assert.deepEqual(
    store
      .getPlans()
      .map((p) => p.id)
      .sort(),
    ["alpha", "beta"],
  );
});

test("out-of-band writes from a second store instance are picked up", (t) => {
  const store = tmpStore(t);
  store.upsertPlan(makePlan("alpha"));
  assert.equal(store.getPlans().length, 1); // warm the cache

  // Simulate a CLI command in another process writing the same index.
  const other = new ForgeStore({ forgeDir: store.forgeDir });
  other.upsertPlan(makePlan("beta"));

  assert.equal(store.getPlans().length, 2, "first store must see the external write");
});

test("deleting the index resets to empty", (t) => {
  const store = tmpStore(t);
  store.upsertPlan(makePlan("alpha"));
  assert.equal(store.getPlans().length, 1);
  fs.rmSync(path.join(store.forgeDir, "index.json"));
  assert.equal(store.getPlans().length, 0);
});

test("tailLog reads only the tail of a large log", (t) => {
  const store = tmpStore(t);
  const plan = makePlan("biglog");
  store.upsertPlan(plan);
  const dir = store.ensureRunDir(plan.id);
  const logFile = path.join(dir, "agent.log");
  // ~1MB of numbered lines, well past the 8KB window.
  const lines = Array.from({ length: 20_000 }, (_, i) => `line-${i} ${"x".repeat(30)}`);
  fs.writeFileSync(logFile, `${lines.join("\n")}\n`);

  assert.deepEqual(store.tailLog(plan.id, 3), lines.slice(-3));
  assert.deepEqual(store.tailLog(plan.id, 1), [lines[lines.length - 1]]);
});

test("tailLog handles small files and missing files", (t) => {
  const store = tmpStore(t);
  const plan = makePlan("smalllog");
  store.upsertPlan(plan);
  assert.deepEqual(store.tailLog(plan.id, 3), [], "missing log → empty");

  const dir = store.ensureRunDir(plan.id);
  fs.writeFileSync(path.join(dir, "agent.log"), "one\ntwo\nthree\n");
  assert.deepEqual(store.tailLog(plan.id, 2), ["two", "three"]);
  assert.deepEqual(store.tailLog(plan.id, 99), ["one", "two", "three"]);
});

test("tailLog keeps the partial tail of a single oversized line", (t) => {
  const store = tmpStore(t);
  const plan = makePlan("oneline");
  store.upsertPlan(plan);
  const dir = store.ensureRunDir(plan.id);
  const huge = `start${"y".repeat(20_000)}end`;
  fs.writeFileSync(path.join(dir, "agent.log"), huge);
  const tail = store.tailLog(plan.id, 1);
  assert.equal(tail.length, 1);
  assert.ok(tail[0].endsWith("end"), "partial tail of the oversized line is kept");
});
