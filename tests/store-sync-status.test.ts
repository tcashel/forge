/**
 * syncPlanStatus whitelist — regression for
 * data-reviewing-status-strands-plans-and-crashes-api: the bash runner
 * writes runner-only phases ("reviewing") into meta.json; persisting one
 * into Plan.status stranded the plan (serve's sync loop only re-polls
 * running-family statuses) and 500'd GET /api/plans (statusInfo has no
 * case for it). Non-union meta statuses must keep the previous status.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { ForgeStore, isPlanStatus, PLAN_STATUSES, type Plan, type RunMeta } from "../src/core/store.ts";

function makeStore(t: { after: (fn: () => void) => void }): ForgeStore {
  const forgeDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-sync-status-"));
  t.after(() => fs.rmSync(forgeDir, { recursive: true, force: true }));
  return new ForgeStore({ forgeDir });
}

function seedPlan(store: ForgeStore, status: Plan["status"]): Plan {
  const now = new Date().toISOString();
  const plan: Plan = {
    id: "task-sync-001",
    title: "feat(sync): status whitelist",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/sync",
    worktree: null,
    status,
    agent: "claude",
    model: "m",
    createdAt: now,
    launchedAt: now,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: "forge-task-sync-001",
    logFile: null,
    jiraTicket: null,
    specFile: "task-sync-001.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
  store.upsertPlan(plan);
  return plan;
}

function writeMeta(store: ForgeStore, plan: Plan, patch: Partial<RunMeta>): void {
  const meta: RunMeta = {
    planId: plan.id,
    tmuxSession: plan.tmuxSession ?? "s",
    logFile: "agent.log",
    agent: "claude",
    model: "m",
    worktree: "/repo/x-wt",
    status: "running",
    startedAt: plan.launchedAt ?? new Date().toISOString(),
    prUrl: null,
    ...patch,
  };
  store.ensureRunDir(plan.id);
  store.writeRunMeta(plan.id, meta);
}

test("isPlanStatus rejects runner-only phases and accepts every union member", () => {
  assert.equal(isPlanStatus("reviewing"), false);
  assert.equal(isPlanStatus("bogus"), false);
  for (const s of PLAN_STATUSES) assert.equal(isPlanStatus(s), true);
});

test("meta status 'reviewing' never corrupts Plan.status; final 'done' still lands", (t) => {
  const store = makeStore(t);
  const plan = seedPlan(store, "creating_pr");

  // Runner enters the review phase: status "reviewing" + freshly-minted PR.
  writeMeta(store, plan, { status: "reviewing", prUrl: "https://github.com/x/x/pull/7" });
  const updated = store.syncPlanStatus(plan);
  assert.ok(updated, "prUrl change must still sync");
  assert.equal(updated.status, "creating_pr", "previous running-family status is kept");
  assert.equal(updated.prUrl, "https://github.com/x/x/pull/7");

  const persisted = store.getPlan(plan.id);
  assert.ok(persisted);
  assert.ok(isPlanStatus(persisted.status), "index must only ever hold PlanStatus members");
  assert.equal(persisted.status, "creating_pr");
  assert.equal(persisted.completedAt, null);

  // Steady state during the (minutes-long) review: no index churn per poll.
  assert.equal(store.syncPlanStatus(persisted), null);

  // The kept status is in serve's sync-loop family, so the runner's final
  // "done" is still picked up on the next poll.
  writeMeta(store, plan, { status: "done", prUrl: "https://github.com/x/x/pull/7" });
  const done = store.syncPlanStatus(persisted);
  assert.ok(done);
  assert.equal(done.status, "done");
  assert.ok(done.completedAt, "completedAt set on terminal status");
});

test("meta status 'reviewing' with no other change is a no-op", (t) => {
  const store = makeStore(t);
  const plan = seedPlan(store, "fixing");
  writeMeta(store, plan, { status: "reviewing" });

  assert.equal(store.syncPlanStatus(plan), null);
  assert.equal(store.getPlan(plan.id)?.status, "fixing");
});

test("legal meta statuses still sync as before", (t) => {
  const store = makeStore(t);
  const plan = seedPlan(store, "running");
  writeMeta(store, plan, { status: "quality_check" });

  const updated = store.syncPlanStatus(plan);
  assert.equal(updated?.status, "quality_check");
  assert.equal(store.getPlan(plan.id)?.status, "quality_check");
});
