/**
 * Phase 4 — the headline acceptance signal: the operator can ask
 * "what already ran against this spec?" and get a coherent answer.
 *
 * Seeds a plan with 2 spec versions, one critique attempt that synthesized,
 * and two launches (one succeeded, one failed). Verifies that every event
 * appears in the timeline in correct temporal order.
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
  recordPlanVersionAdded,
  syncCritiqueState,
  syncJobState,
} from "../src/core/db/writes.ts";
import { buildPlanHistory } from "../src/core/history.ts";
import { type CritiqueMeta, ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-history-"));
}

function makePlan(): Plan {
  return {
    id: "plan-h1",
    title: "History sanity check",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/h1",
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: "2026-05-01T08:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "plan-h1.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
}

function critiqueMeta(status: CritiqueMeta["status"], startedAt: string, completedAt: string | null): CritiqueMeta {
  const completed = status === "done" || status === "failed";
  return {
    schemaVersion: 1,
    planId: "plan-h1",
    critiqueId: "crit-h1",
    specTitle: "History sanity check",
    repoRoot: "/repo/x",
    repoName: "x",
    status,
    startedAt,
    completedAt,
    viewedAt: null,
    tmuxSession: "forge-crit-h1",
    criticA: {
      agent: "claude",
      model: "sonnet-4-6",
      status: completed ? "done" : "pending",
      durationMs: completed ? 120_000 : null,
    },
    criticB: {
      agent: "codex",
      model: "gpt-5",
      status: completed ? "done" : "pending",
      durationMs: completed ? 150_000 : null,
    },
    synthesizer: {
      agent: "claude",
      model: "opus-4-7",
      status: completed ? "done" : "pending",
      durationMs: completed ? 80_000 : null,
    },
  };
}

function jobMeta(startedAt: string): RunMeta {
  return {
    planId: "plan-h1",
    tmuxSession: "forge-plan-h1",
    logFile: "/dev/null",
    agent: "claude",
    model: "sonnet-4-6",
    worktree: "/tmp/wt",
    status: "running",
    startedAt,
    prUrl: null,
  };
}

test("buildPlanHistory weaves spec saves, critiques, and launches into one stream", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const db = store.db.db;
    const plan = makePlan();

    // v1 spec
    recordPlanCreated(db, plan, "# Plan H1\nv1 body");

    // Critique against v1
    recordCritiqueStarted(db, plan, critiqueMeta("running_critics", "2026-05-01T09:00:00.000Z", null));
    syncCritiqueState(db, critiqueMeta("done", "2026-05-01T09:00:00.000Z", "2026-05-01T09:05:00.000Z"));

    // Improver bumps to v2
    recordPlanVersionAdded(db, plan, 2, "# Plan H1\nv2 body");

    // Launch 1: failed
    recordJobStarted(db, plan, jobMeta("2026-05-01T10:00:00.000Z"));
    syncJobState(db, plan, { status: "failed", endedAt: "2026-05-01T10:30:00.000Z" });

    // Launch 2: succeeded
    recordJobStarted(db, plan, jobMeta("2026-05-01T11:00:00.000Z"));
    syncJobState(db, plan, { status: "done", endedAt: "2026-05-01T11:45:00.000Z" });

    const events = buildPlanHistory(db, plan.id);

    // Sorted newest-first.
    const timestamps = events.map((e) => e.ts);
    const sorted = [...timestamps].sort((a, b) => b.localeCompare(a));
    assert.deepEqual(timestamps, sorted, "events are sorted newest-first");

    const kinds = events.map((e) => e.kind);
    assert.ok(kinds.includes("spec_saved"), "spec_saved present");
    assert.ok(kinds.includes("critique_started"), "critique_started present");
    assert.ok(kinds.includes("critique_synthesized"), "critique_synthesized present");
    assert.ok(kinds.includes("launch_started"), "launch_started present");
    assert.ok(kinds.includes("launch_completed"), "launch_completed present");

    // Two spec_saved (v1 + v2)
    assert.equal(kinds.filter((k) => k === "spec_saved").length, 2);
    // Two launches → two started + two completed
    assert.equal(kinds.filter((k) => k === "launch_started").length, 2);
    assert.equal(kinds.filter((k) => k === "launch_completed").length, 2);
    // One critique attempt → one started + one synthesized
    assert.equal(kinds.filter((k) => k === "critique_started").length, 1);
    assert.equal(kinds.filter((k) => k === "critique_synthesized").length, 1);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("buildPlanHistory returns [] for a plan with no recorded events", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const events = buildPlanHistory(store.db.db, "nonexistent-plan");
    assert.deepEqual(events, []);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("buildPlanHistory groups paired critic_runs into a single critique_started event", () => {
  // Critique attempts create TWO critic_runs (a + b) per attempt. The
  // timeline should not double-count them — one event per attempt.
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const db = store.db.db;
    const plan = makePlan();

    recordPlanCreated(db, plan, "# spec");
    recordCritiqueStarted(db, plan, critiqueMeta("running_critics", "2026-05-01T09:00:00.000Z", null));

    const events = buildPlanHistory(db, plan.id);
    const starts = events.filter((e) => e.kind === "critique_started");
    assert.equal(starts.length, 1, "one critique_started, not two (one per critic)");
    assert.equal(starts[0].ref, "crit-h1");
    assert.match(starts[0].summary, /claude:sonnet-4-6/);
    assert.match(starts[0].summary, /codex:gpt-5/);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
