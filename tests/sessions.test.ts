/**
 * Smoke coverage for the Agent Activity session helpers — upsertSession,
 * finalizeSession, and reconcileExecutionSessions. The Activity view +
 * endpoint depend on this contract: deterministic ids upsert correctly,
 * partial metric patches merge, and orphan running sessions reconcile
 * against their backing jobs row.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import {
  executionSessionId,
  finalizeSession,
  reconcileExecutionSessions,
  recordJobStarted,
  recordPlanCreated,
  upsertSession,
} from "../src/core/db/writes.ts";
import { ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-sess-"));
}

function makeTask(): Plan {
  return {
    id: "plan-sess-1",
    title: "session smoke",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/sess",
    worktree: null,
    status: "draft",
    agent: "claude",
    model: "claude-opus-4-7",
    createdAt: "2026-04-01T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "plan-sess-1.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
}

function makeRunMeta(): RunMeta {
  return {
    planId: "plan-sess-1",
    tmuxSession: "forge-sess",
    logFile: "/tmp/agent.log",
    agent: "claude",
    model: "claude-opus-4-7",
    worktree: "/repo/x",
    status: "running",
    startedAt: "2026-04-01T01:00:00.000Z",
    prUrl: null,
  };
}

test("upsertSession + finalizeSession round trips", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    upsertSession(store.db.db, {
      id: "s-improvement-crit-99-r1",
      purpose: "improvement",
      relatedId: "crit-99",
      agentAdapter: "claude",
      model: "claude-opus-4-7",
      startedAt: "2026-04-01T00:00:00.000Z",
      cwd: "/repo/x",
      metrics: { planId: "plan-sess-1" },
    });
    finalizeSession(store.db.db, {
      id: "s-improvement-crit-99-r1",
      finishedAt: "2026-04-01T00:01:00.000Z",
      state: "completed",
      exitCode: 0,
      metrics: { durationMs: 60_000, tokensIn: 100, tokensOut: 50, costUsd: 0.05, costSource: "provider" },
    });

    const row = store.db.db.prepare("SELECT * FROM sessions WHERE id = ?").get("s-improvement-crit-99-r1") as {
      state: string;
      finished_at: string;
      metrics: string;
    };
    assert.equal(row.state, "completed");
    assert.equal(row.finished_at, "2026-04-01T00:01:00.000Z");
    const metrics = JSON.parse(row.metrics);
    assert.equal(metrics.durationMs, 60_000);
    assert.equal(metrics.tokensIn, 100);
    assert.equal(metrics.costUsd, 0.05);
    assert.equal(metrics.costSource, "provider");
    assert.equal(metrics.planId, "plan-sess-1");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("recordJobStarted seeds an execution session linked via jobs.session_id", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = makeTask();
    recordPlanCreated(store.db.db, task, "# spec");
    const meta = makeRunMeta();
    recordJobStarted(store.db.db, task, meta);

    const job = store.db.db
      .prepare("SELECT id, session_id, run_number FROM jobs WHERE id = ?")
      .get("j-plan-sess-1-r1") as { id: string; session_id: string; run_number: number } | undefined;
    assert.ok(job);
    assert.equal(job?.session_id, executionSessionId(job?.id ?? ""));

    const session = store.db.db
      .prepare("SELECT purpose, state, agent_adapter FROM sessions WHERE id = ?")
      .get(job?.session_id) as { purpose: string; state: string; agent_adapter: string };
    assert.equal(session.purpose, "execution");
    assert.equal(session.state, "running");
    assert.equal(session.agent_adapter, "claude");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("recordJobStarted seeds model from meta, not the (stale) plan row", () => {
  // At launch the plan row isn't updated with the resolved model until after
  // launchAgent returns, so task.model can be null here. The seed must take
  // the resolved model from meta — otherwise it would record null and (worse)
  // clobber the runner's correct value via the upsert.
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = { ...makeTask(), model: null, agent: null } as Plan;
    recordPlanCreated(store.db.db, task, "# spec");
    recordJobStarted(store.db.db, task, makeRunMeta()); // meta.model = claude-opus-4-7

    const row = store.db.db
      .prepare("SELECT agent_adapter, model FROM sessions WHERE id = ?")
      .get(executionSessionId("j-plan-sess-1-r1")) as { agent_adapter: string; model: string | null };
    assert.equal(row.model, "claude-opus-4-7");
    assert.equal(row.agent_adapter, "claude");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("upsertSession never lets a null-model re-upsert blank a recorded model", () => {
  // The launch race: the runner's `session start` records the real model, then
  // the launch-time seed re-upserts the same id ~500ms later. The COALESCE
  // guard must keep the real model regardless of which write lands last.
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const base = {
      id: "s-execution-j-race-r1",
      purpose: "execution" as const,
      relatedId: "j-race-r1",
      startedAt: "2026-04-01T00:00:00.000Z",
      cwd: "/repo/x",
    };
    // Runner records the real model first.
    upsertSession(store.db.db, { ...base, agentAdapter: "claude", model: "claude-opus-4-7" });
    // Stale seed re-upserts with a null model second.
    upsertSession(store.db.db, { ...base, agentAdapter: "claude", model: null });

    const row = store.db.db.prepare("SELECT model FROM sessions WHERE id = ?").get("s-execution-j-race-r1") as {
      model: string | null;
    };
    assert.equal(row.model, "claude-opus-4-7", "null re-upsert must not blank the recorded model");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("reconcileExecutionSessions flips orphan running rows once the job is terminal", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const task = makeTask();
    recordPlanCreated(store.db.db, task, "# spec");
    recordJobStarted(store.db.db, task, makeRunMeta());

    // Simulate the bash runner dying before forge_session_finish: jobs row
    // gets marked succeeded externally, sessions row stays running.
    store.db.db
      .prepare("UPDATE jobs SET state='succeeded', finished_at=? WHERE id=?")
      .run("2026-04-01T00:05:00.000Z", "j-plan-sess-1-r1");

    reconcileExecutionSessions(store.db.db, "2026-04-01T00:05:00.000Z");

    const row = store.db.db
      .prepare("SELECT state, finished_at FROM sessions WHERE id=?")
      .get(executionSessionId("j-plan-sess-1-r1")) as { state: string; finished_at: string };
    assert.equal(row.state, "completed");
    assert.equal(row.finished_at, "2026-04-01T00:05:00.000Z");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
