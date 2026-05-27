/**
 * Phase 3c + 3e — critique dual-write and read-path state sync.
 *
 * recordCritiqueStarted: critique launch creates critic_configs + 3
 * sessions + 2 critic_runs in 'running' state, pointing at the plan's
 * current_version_id.
 *
 * syncCritiqueState: when the bash runner writes a terminal status to
 * critique-meta.json, calling this reconciles the DB rows.
 *
 * syncJobState: when the bash runner writes a terminal status to
 * meta.json, the latest job row picks up the new state + finished_at.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import {
  recordCritiqueStarted,
  recordJobStarted,
  recordPlanCreated,
  syncCritiqueState,
  syncJobState,
} from "../src/core/db/writes.ts";
import { type CritiqueMeta, ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-crit-"));
}

function task(): Plan {
  return {
    id: "plan-c1",
    title: "Critique sync",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/c1",
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "plan-c1.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
}

function makeCritique(status: CritiqueMeta["status"]): CritiqueMeta {
  const completedAt = status === "done" || status === "failed" ? "2026-04-01T01:05:00.000Z" : null;
  const agentStatus = status === "done" ? "done" : status === "failed" ? "failed" : "pending";
  return {
    schemaVersion: 1,
    planId: "plan-c1",
    critiqueId: "crit-xyz",
    specTitle: "Critique sync",
    repoRoot: "/repo/x",
    repoName: "x",
    status,
    startedAt: "2026-04-01T01:00:00.000Z",
    completedAt,
    viewedAt: null,
    tmuxSession: "forge-crit-xyz",
    criticA: { agent: "claude", model: "sonnet-4-6", status: agentStatus, durationMs: 120000 },
    criticB: { agent: "codex", model: "gpt-5", status: agentStatus, durationMs: 150000 },
    synthesizer: { agent: "claude", model: "opus-4-7", status: agentStatus, durationMs: 80000 },
  };
}

test("recordCritiqueStarted creates 3 sessions, 2 critic_runs, 3 critic_configs", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const t = task();
    recordPlanCreated(store.db.db, t, "# spec");

    recordCritiqueStarted(store.db.db, t, makeCritique("running_critics"));

    const sessions = store.db.db
      .prepare("SELECT id, purpose, state FROM sessions WHERE related_id = ? ORDER BY id")
      .all("crit-xyz") as Array<{ id: string; purpose: string; state: string }>;
    assert.equal(sessions.length, 3);
    assert.deepEqual(sessions.map((s) => s.purpose).sort(), ["critique", "critique", "synthesis"]);
    for (const s of sessions) assert.equal(s.state, "running");

    const runs = store.db.db.prepare("SELECT id, state FROM critic_runs ORDER BY id").all() as Array<{
      id: string;
      state: string;
    }>;
    assert.equal(runs.length, 2);
    for (const r of runs) assert.equal(r.state, "running");

    const configs = store.db.db
      .prepare("SELECT id, agent_adapter, model FROM critic_configs ORDER BY id")
      .all() as Array<{ id: string; agent_adapter: string; model: string }>;
    assert.equal(configs.length, 3);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("syncCritiqueState reconciles to terminal state + creates synthesis row", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const t = task();
    recordPlanCreated(store.db.db, t, "# spec");
    recordCritiqueStarted(store.db.db, t, makeCritique("running_critics"));

    syncCritiqueState(store.db.db, makeCritique("done"));

    const runs = store.db.db.prepare("SELECT state, finished_at FROM critic_runs ORDER BY id").all() as Array<{
      state: string;
      finished_at: string;
    }>;
    for (const r of runs) {
      assert.equal(r.state, "completed");
      assert.equal(r.finished_at, "2026-04-01T01:05:00.000Z");
    }

    const synth = store.db.db
      .prepare("SELECT id, target_id, critic_run_ids FROM critic_syntheses WHERE id = ?")
      .get("cs-crit-xyz") as { id: string; target_id: string; critic_run_ids: string } | undefined;
    assert.ok(synth, "synthesis row appears once status is terminal");
    assert.equal(synth.target_id, "pv-plan-c1-v1");
    assert.deepEqual(JSON.parse(synth.critic_run_ids), ["cr-crit-xyz-a", "cr-crit-xyz-b"]);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("syncJobState moves the latest job to succeeded and advances plan/tasks state", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const t = task();
    recordPlanCreated(store.db.db, t, "# spec");

    const startedAt = "2026-04-05T10:00:00.000Z";
    const meta: RunMeta = {
      planId: t.id,
      tmuxSession: "forge-plan-c1",
      logFile: "/dev/null",
      agent: "claude",
      model: "sonnet-4-6",
      worktree: "/tmp/wt",
      status: "running",
      startedAt,
      prUrl: null,
    };
    recordJobStarted(store.db.db, t, meta);

    const endedAt = "2026-04-05T10:30:00.000Z";
    syncJobState(store.db.db, t, { status: "done", endedAt });

    const job = store.db.db.prepare("SELECT state, finished_at FROM jobs WHERE run_number = 1").get() as {
      state: string;
      finished_at: string;
    };
    assert.equal(job.state, "succeeded");
    assert.equal(job.finished_at, endedAt);

    const plan = store.db.db.prepare("SELECT stage FROM plans WHERE id = ?").get(t.id) as {
      stage: string;
    };
    assert.equal(plan.stage, "completed");

    const taskRow = store.db.db
      .prepare("SELECT state, completed_at FROM tasks WHERE plan_id = ? AND sequence = 1")
      .get(t.id) as { state: string; completed_at: string };
    assert.equal(taskRow.state, "completed");
    assert.equal(taskRow.completed_at, endedAt);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
