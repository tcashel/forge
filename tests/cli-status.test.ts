/**
 * forge status — CLI truth fixes.
 *
 * Pins two production-hardening audit findings:
 *   - cli-status-never-syncs-meta: the bash runner only writes status
 *     transitions to ~/.forge/runs/<id>/meta.json; status must reconcile via
 *     syncPlanStatus before printing or a finished run reads "running" forever.
 *   - cli-status-hides-failure-detail: errorMessage / review outcome /
 *     quality summary / publish outcome must appear in the HUMAN output,
 *     not just --json, plus a `see: forge logs <id>` hint on failure.
 *
 * No tmux/gh/claude is spawned: fixtures keep tmuxSession null and the
 * publish record is written directly via writePublishRecord.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { run as statusCmd } from "../src/cli/cmd/status.ts";
import { upsertSession } from "../src/core/db/writes.ts";
import { notRequestedRecord, type PublishRecord, writePublishRecord } from "../src/core/publish-record.ts";
import { ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-cli-status-"));
}

function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: "plan-st-1",
    title: "Status truth test",
    repoRoot: "/repo/x",
    repoName: "x",
    branch: "forge/st-1",
    worktree: "/tmp/wt",
    status: "running",
    agent: "claude",
    model: "opus",
    createdAt: "2026-06-01T00:00:00.000Z",
    launchedAt: "2026-06-01T00:01:00.000Z",
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "plan-st-1.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
    ...overrides,
  };
}

function makeMeta(overrides: Partial<RunMeta> = {}): RunMeta {
  return {
    planId: "plan-st-1",
    tmuxSession: "forge-plan-st-1",
    logFile: "/dev/null",
    agent: "claude",
    model: "opus",
    worktree: "/tmp/wt",
    status: "running",
    startedAt: "2026-06-01T00:01:00.000Z",
    prUrl: null,
    ...overrides,
  };
}

// Capture stdout/stderr so emitOk output is assertable.
function capture<T>(fn: () => Promise<T>): Promise<{ result: T; out: string; err: string }> {
  const origOut = process.stdout.write.bind(process.stdout);
  const origErr = process.stderr.write.bind(process.stderr);
  let out = "";
  let err = "";
  process.stdout.write = ((chunk: string | Uint8Array): boolean => {
    out += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string | Uint8Array): boolean => {
    err += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
    return true;
  }) as typeof process.stderr.write;
  return fn()
    .then((result) => ({ result, out, err }))
    .finally(() => {
      process.stdout.write = origOut;
      process.stderr.write = origErr;
    });
}

test("status reconciles a stale 'running' index with meta.json and persists it", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan();
    store.upsertPlan(plan);
    store.ensureRunDir(plan.id);
    store.writeRunMeta(plan.id, makeMeta({ status: "failed", errorMessage: "agent stage timed out after 120m" }));

    const { out } = await capture(() => statusCmd([plan.id], store));

    assert.match(out, /status: {3}failed/, "human status must show the runner's terminal state, not the stale index");
    assert.equal(store.getPlan(plan.id)?.status, "failed", "sync must persist the reconciled status to the index");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("status human output surfaces error, review outcome, quality summary, and logs hint", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan({ status: "failed", completedAt: "2026-06-01T02:00:00.000Z" });
    store.upsertPlan(plan);
    store.ensureRunDir(plan.id);
    store.writeRunMeta(
      plan.id,
      makeMeta({
        status: "failed",
        errorMessage: "Killed by user",
        reviewVerdict: "request-changes",
        qualityResults: [
          { command: "bun test", ok: false, durationMs: 1200 },
          { command: "bun run lint", ok: true, durationMs: 300 },
        ],
      }),
    );

    const { out } = await capture(() => statusCmd([plan.id], store));

    assert.match(out, /error: {4}Killed by user/);
    assert.match(out, /review: {3}request-changes/);
    assert.match(out, /quality: {2}1\/2 checks passed \(failed: bun test\)/);
    assert.match(out, new RegExp(`see: forge logs ${plan.id}`));
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("status falls back to reviewError when no verdict was recorded", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan({ status: "done", completedAt: "2026-06-01T02:00:00.000Z" });
    store.upsertPlan(plan);
    store.ensureRunDir(plan.id);
    store.writeRunMeta(plan.id, makeMeta({ status: "done", reviewVerdict: null, reviewError: "reviewer timed out" }));

    const { out } = await capture(() => statusCmd([plan.id], store));

    assert.match(out, /review: {3}error — reviewer timed out/);
    assert.match(out, new RegExp(`see: forge logs ${plan.id}`), "reviewError counts as a failure for the logs hint");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

function seedReviewSession(store: ForgeStore, plan: Plan, record: PublishRecord): void {
  const runDir = path.join(store.runsDir, "pr-review", `${plan.prNumber}-sess-1`);
  fs.mkdirSync(runDir, { recursive: true });
  writePublishRecord(runDir, record);
  upsertSession(store.db.db, {
    id: "sess-1",
    purpose: "review",
    relatedId: null,
    agentAdapter: "codex",
    model: "gpt-5.5",
    startedAt: "2026-06-01T03:00:00.000Z",
    cwd: plan.repoRoot,
    state: "completed",
    metrics: {
      // Extra keys ride on the metrics blob, mirroring prepareReviewSession.
      ...({ runDir, prNum: plan.prNumber, repoRoot: plan.repoRoot } as unknown as Partial<
        import("../src/core/db/writes.ts").SessionMetrics
      >),
    },
  });
}

test("status prints a publish FAILED line with the --publish-only retry hint", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan({
      status: "done",
      completedAt: "2026-06-01T02:00:00.000Z",
      prUrl: "https://github.com/x/x/pull/42",
      prNumber: 42,
    });
    store.upsertPlan(plan);
    seedReviewSession(store, plan, {
      ...notRequestedRecord(),
      requested: true,
      attemptedAt: "2026-06-01T03:05:00.000Z",
      state: "failed",
      failed: 3,
      error: "gh api 502 posting review",
    });

    const { out } = await capture(() => statusCmd([plan.id], store));

    assert.match(out, /publish: {2}FAILED — gh api 502 posting review; retry: forge review 42 --publish-only/);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("status stays quiet about publish when the latest review published cleanly", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan({
      status: "done",
      completedAt: "2026-06-01T02:00:00.000Z",
      prUrl: "https://github.com/x/x/pull/7",
      prNumber: 7,
    });
    store.upsertPlan(plan);
    seedReviewSession(store, plan, {
      ...notRequestedRecord(),
      requested: true,
      attemptedAt: "2026-06-01T03:05:00.000Z",
      state: "published",
      posted: 4,
    });

    const { out } = await capture(() => statusCmd([plan.id], store));

    assert.doesNotMatch(out, /publish:/);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("status --json carries the synced task, run meta, and publish record", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = makePlan({ prUrl: "https://github.com/x/x/pull/9", prNumber: 9 });
    store.upsertPlan(plan);
    store.ensureRunDir(plan.id);
    store.writeRunMeta(plan.id, makeMeta({ status: "failed", errorMessage: "boom" }));
    seedReviewSession(store, plan, {
      ...notRequestedRecord(),
      requested: true,
      attemptedAt: "2026-06-01T03:05:00.000Z",
      state: "partial",
      posted: 1,
      failed: 1,
      error: "one comment 422",
    });

    const { out } = await capture(() => statusCmd([plan.id, "--json"], store));
    const parsed = JSON.parse(out) as {
      task: { status: string };
      run: { status: string; errorMessage: string };
      publish: { state: string; error: string } | null;
    };

    assert.equal(parsed.task.status, "failed", "--json task.status must be the reconciled value");
    assert.equal(parsed.run.errorMessage, "boom");
    assert.equal(parsed.publish?.state, "partial");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
