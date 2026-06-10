/**
 * Dual-write guards — regression for data-unwrapped-dual-writes: the
 * SQLite mirror writes in `forge spec save` and plan edits ran unguarded
 * AFTER the JSON commit, so a DB hiccup (SQLITE_BUSY, wedged WAL) failed
 * a command whose state had already persisted — retries then minted
 * duplicate plans / spurious versions. JSON is the live source of truth
 * during the cutover; the mirror write must warn, not throw.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { saveSpec } from "../src/cli/cmd/spec.ts";
import { applyDirectPlanBodyEdit } from "../src/core/plan-edit.ts";
import { ForgeStore, type Plan } from "../src/core/store.ts";

function makeStore(t: { after: (fn: () => void) => void }): ForgeStore {
  const forgeDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-dwg-"));
  t.after(() => fs.rmSync(forgeDir, { recursive: true, force: true }));
  return new ForgeStore({ forgeDir });
}

/** Capture process.stderr.write for the duration of the test. */
function captureStderr(t: { after: (fn: () => void) => void }): { text: () => string } {
  const chunks: string[] = [];
  const original = process.stderr.write.bind(process.stderr);
  process.stderr.write = ((chunk: string | Uint8Array) => {
    chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString());
    return true;
  }) as typeof process.stderr.write;
  t.after(() => {
    process.stderr.write = original;
  });
  return { text: () => chunks.join("") };
}

test("saveSpec succeeds and warns when the SQLite mirror write throws", async (t) => {
  const store = makeStore(t);
  const stderr = captureStderr(t);
  // Force every subsequent DB write to throw, mimicking SQLITE_BUSY after
  // the JSON commit. (Migrations ran on first access; close() wedges it.)
  store.db.db.close();

  const result = await saveSpec(
    {
      body: "# Goal\n\nDo the thing.\n",
      title: "feat(x): db guard",
      repoRoot: "/repo/x",
      repoName: "x",
      autoImprove: false,
    },
    store,
  );

  assert.equal(result.status, "draft");
  const plans = store.getPlans();
  assert.equal(plans.length, 1, "exactly one plan saved — no duplicate on the JSON side");
  assert.equal(plans[0].id, result.planId);
  assert.ok(fs.existsSync(result.specPath), "spec file persisted");
  assert.match(stderr.text(), /warn: failed to record plan .* in SQLite/);
});

test("plan edits succeed and warn when the SQLite mirror write throws", (t) => {
  const store = makeStore(t);
  const stderr = captureStderr(t);

  const now = new Date().toISOString();
  const id = "task-dwg-edit-001";
  const specPath = store.writeSpec(
    id,
    `---\nid: ${id}\nspecVersion: 1\n---\n# feat(x): edit guard\n\n## Goals\n\n- old goal\n`,
  );
  const task: Plan = {
    id,
    title: "feat(x): edit guard",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/dwg",
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: now,
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: specPath,
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
  store.upsertPlan(task);
  store.db.db.close();

  const doc = applyDirectPlanBodyEdit({
    store,
    planId: id,
    body: "# feat(x): edit guard\n\n## Goals\n\n- new goal\n",
  });

  assert.equal(doc.specVersion, 2, "edit persisted to the JSON side");
  assert.match(doc.body, /new goal/);
  assert.equal(store.getPlan(id)?.specVersion, 2);
  assert.match(stderr.text(), /warn: failed to record plan version v2/);
});
