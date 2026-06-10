/**
 * forge ls — CLI truth fixes (cli-status-never-syncs-meta).
 *
 * `forge ls` printed the stale index.json status forever because only
 * wait/serve/dash ever called syncPlanStatus. These tests seed an index
 * that disagrees with the runner-owned meta.json and assert ls now prints
 * (and filters on) the reconciled truth. Also pins the archived icon so
 * archived plans stop rendering with the in-progress spinner.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { run as lsCmd } from "../src/cli/cmd/ls.ts";
import { ForgeStore, type Plan, type RunMeta } from "../src/core/store.ts";

const REPO_ROOT = "/repo/x";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-cli-ls-"));
}

function makePlan(id: string, overrides: Partial<Plan> = {}): Plan {
  return {
    id,
    title: `ls test ${id}`,
    repoRoot: REPO_ROOT,
    repoName: "x",
    branch: `forge/${id}`,
    worktree: null,
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
    specFile: `${id}.md`,
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
    ...overrides,
  };
}

function writeMeta(store: ForgeStore, planId: string, overrides: Partial<RunMeta>): void {
  store.ensureRunDir(planId);
  store.writeRunMeta(planId, {
    planId,
    tmuxSession: `forge-${planId}`,
    logFile: "/dev/null",
    agent: "claude",
    model: "opus",
    worktree: "/tmp/wt",
    status: "running",
    startedAt: "2026-06-01T00:01:00.000Z",
    prUrl: null,
    ...overrides,
  });
}

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

test("ls reconciles stale 'running' plans with meta.json before printing", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    store.upsertPlan(makePlan("plan-finished"));
    writeMeta(store, "plan-finished", { status: "done", prUrl: "https://github.com/x/x/pull/5" });
    store.upsertPlan(makePlan("plan-blew-up"));
    writeMeta(store, "plan-blew-up", { status: "failed", errorMessage: "quality gate exploded" });

    const { out } = await capture(() => lsCmd(["--repo", REPO_ROOT, "--json"], store));
    const parsed = JSON.parse(out) as { plans: Array<{ id: string; status: string; prUrl: string | null }> };
    const byId = new Map(parsed.plans.map((p) => [p.id, p]));

    assert.equal(byId.get("plan-finished")?.status, "done");
    assert.equal(byId.get("plan-finished")?.prUrl, "https://github.com/x/x/pull/5");
    assert.equal(byId.get("plan-blew-up")?.status, "failed");
    assert.equal(store.getPlan("plan-blew-up")?.status, "failed", "reconciled status must persist to the index");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("ls --status filters on the reconciled status, not the stale index value", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    store.upsertPlan(makePlan("plan-now-failed"));
    writeMeta(store, "plan-now-failed", { status: "failed" });
    store.upsertPlan(makePlan("plan-still-running"));
    writeMeta(store, "plan-still-running", { status: "running" });

    const { out } = await capture(() => lsCmd(["--repo", REPO_ROOT, "--status", "failed", "--json"], store));
    const parsed = JSON.parse(out) as { plans: Array<{ id: string }> };

    assert.deepEqual(
      parsed.plans.map((p) => p.id),
      ["plan-now-failed"],
      "a plan whose runner already failed must show up under --status failed",
    );
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("ls renders archived plans with a distinct icon, not the running spinner", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    store.upsertPlan(makePlan("plan-archived", { status: "archived", archivedAt: "2026-06-02T00:00:00.000Z" }));

    const { out } = await capture(() => lsCmd(["--repo", REPO_ROOT], store));

    assert.match(out, /▪ plan-archived {2}archived/);
    assert.doesNotMatch(out, /⟳ plan-archived/);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
