/**
 * Token capture for critique / synthesis claude slots.
 *
 * Asserts:
 *   - generateRunnerScript emits stream-json sidecar wiring only when the
 *     slot's agent is claude.
 *   - readCritiqueSidecarMetrics → syncCritiqueState lands tokens + cost
 *     into sessions.metrics for the corresponding slot.
 *   - is_error/empty-result sidecars do not produce a metrics patch, so
 *     prior metrics are preserved via mergeMetrics rather than clobbered.
 *   - Re-running the runner script truncates the sidecar (tee writes
 *     fresh data per invocation).
 */

import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  generateRunnerScript,
  readCritiqueSidecarMetrics,
  readSidecarPatch,
  slotSidecarPath,
} from "../src/core/critique.ts";
import { recordCritiqueStarted, recordPlanCreated, syncCritiqueState } from "../src/core/db/writes.ts";
import { type CritiqueMeta, ForgeStore, type Plan } from "../src/core/store.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const SUCCESS_FIXTURE = path.join(here, "fixtures", "claude-stream-result.jsonl");
const ERROR_FIXTURE = path.join(here, "fixtures", "claude-stream-error-result.jsonl");

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-crit-tok-"));
}

function task(): Plan {
  return {
    id: "plan-tok",
    title: "Token capture",
    repoRoot: "/repo/tok",
    repoName: "tok",
    branch: "forge/tok",
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: "2026-05-29T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "plan-tok.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
}

function makeMeta(
  plan: Plan,
  status: CritiqueMeta["status"],
  agents: { criticA: "claude" | "codex"; criticB: "claude" | "codex"; synth: "claude" | "codex" },
): CritiqueMeta {
  const completedAt = status === "done" || status === "failed" ? "2026-05-29T01:05:00.000Z" : null;
  const agentStatus = status === "done" ? "done" : status === "failed" ? "failed" : "pending";
  return {
    schemaVersion: 1,
    planId: plan.id,
    critiqueId: "crit-tok",
    specTitle: plan.title,
    repoRoot: plan.repoRoot,
    repoName: plan.repoName,
    status,
    startedAt: "2026-05-29T01:00:00.000Z",
    completedAt,
    viewedAt: null,
    tmuxSession: "forge-crit-tok",
    criticA: {
      agent: agents.criticA,
      model: agents.criticA === "claude" ? "opus-4-7" : "gpt-5",
      status: agentStatus,
      durationMs: 100,
    },
    criticB: {
      agent: agents.criticB,
      model: agents.criticB === "claude" ? "opus-4-7" : "gpt-5",
      status: agentStatus,
      durationMs: 110,
    },
    synthesizer: {
      agent: agents.synth,
      model: agents.synth === "claude" ? "opus-4-7" : "gpt-5",
      status: agentStatus,
      durationMs: 60,
    },
  };
}

test("generateRunnerScript wires stream-json sidecar for claude slots only", () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const dir = store.getCritiqueDir("plan-tok", "crit-tok");
    fs.mkdirSync(dir, { recursive: true });
    const cfg = {
      planId: "plan-tok",
      critiqueId: "crit-tok",
      specBody: "body",
      specTitle: "title",
      repoRoot: "/repo/tok",
      repoName: "tok",
      contextContent: null,
      criticA: { agent: "claude" as const, model: "opus-4-7" },
      criticB: { agent: "codex" as const, model: "gpt-5" },
      synthesizer: { agent: "claude" as const, model: "opus-4-7" },
    };
    const script = generateRunnerScript(cfg, store);
    // Claude slot uses stream-json + sidecar
    assert.ok(script.includes("--output-format stream-json"), "claude slot must request stream-json");
    assert.ok(
      script.includes(slotSidecarPath(path.join(dir, "critique-a.md"))),
      "claude critic A sidecar path must appear",
    );
    assert.ok(
      script.includes(slotSidecarPath(path.join(dir, "recommendations.md"))),
      "claude synth sidecar path must appear",
    );
    // codex slot has no sidecar at critique-b.stream.jsonl
    assert.ok(
      !script.includes(slotSidecarPath(path.join(dir, "critique-b.md"))),
      "codex slot must not get a stream-json sidecar",
    );
    // Silent-failure / rescue check scopes to the terminal "type":"result" line.
    assert.ok(script.includes("crit_slot_valid()"), "crit_slot_valid helper missing");
    assert.ok(
      script.includes('result_line=$(grep \'"type":"result"\' "$stream" | tail -1)'),
      "terminal-result-line scoping missing",
    );
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("syncCritiqueState lands sidecar tokens + cost into sessions.metrics", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    const plan = task();
    recordPlanCreated(store.db.db, plan, "# spec");
    const meta = makeMeta(plan, "running_critics", {
      criticA: "claude",
      criticB: "codex",
      synth: "claude",
    });
    recordCritiqueStarted(store.db.db, plan, meta);

    // Drop the success fixture into the slot positions for the claude
    // sessions; codex slot has no sidecar.
    const dir = store.getCritiqueDir(plan.id, meta.critiqueId);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(SUCCESS_FIXTURE, path.join(dir, "critique-a.stream.jsonl"));
    fs.copyFileSync(SUCCESS_FIXTURE, path.join(dir, "recommendations.stream.jsonl"));

    const terminal = makeMeta(plan, "done", { criticA: "claude", criticB: "codex", synth: "claude" });
    const sidecarMetrics = await readCritiqueSidecarMetrics(terminal, dir);
    assert.ok(sidecarMetrics.criticA, "claude critic A sidecar parsed");
    assert.equal(sidecarMetrics.criticA?.tokensIn, 5);
    assert.equal(sidecarMetrics.criticA?.tokensOut, 6);
    assert.equal(sidecarMetrics.criticA?.costUsd, 0.0675945);
    assert.equal(sidecarMetrics.criticA?.costSource, "provider");
    assert.equal(sidecarMetrics.criticB, undefined, "codex slot must not appear in sidecar map");
    assert.ok(sidecarMetrics.synth, "claude synth sidecar parsed");

    syncCritiqueState(store.db.db, terminal, { sidecarMetrics });

    const aRow = store.db.db
      .prepare("SELECT metrics, state FROM sessions WHERE id = ?")
      .get("s-critique-crit-tok-a") as {
      metrics: string;
      state: string;
    };
    const aMetrics = JSON.parse(aRow.metrics);
    assert.equal(aRow.state, "completed");
    assert.equal(aMetrics.tokensIn, 5);
    assert.equal(aMetrics.tokensOut, 6);
    assert.equal(aMetrics.costUsd, 0.0675945);
    assert.equal(aMetrics.costSource, "provider");

    const bRow = store.db.db.prepare("SELECT metrics FROM sessions WHERE id = ?").get("s-critique-crit-tok-b") as {
      metrics: string;
    };
    const bMetrics = JSON.parse(bRow.metrics);
    assert.equal(bMetrics.tokensIn, null);
    assert.equal(bMetrics.tokensOut, null);
    assert.equal(bMetrics.costUsd, null);

    const sRow = store.db.db.prepare("SELECT metrics FROM sessions WHERE id = ?").get("s-synthesis-crit-tok") as {
      metrics: string;
    };
    const sMetrics = JSON.parse(sRow.metrics);
    assert.equal(sMetrics.tokensIn, 5);
    // Synthesis sessions stash planId — preserved across the merge.
    assert.equal(sMetrics.planId, plan.id);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("is_error sidecar produces no patch — prior metrics are preserved", async () => {
  // readSidecarPatch returns null when the result event has no token data,
  // which is the case for an is_error result. Prior metrics in the sessions
  // row remain intact because mergeMetrics is a no-op without a patch.
  const patch = await readSidecarPatch(ERROR_FIXTURE);
  assert.equal(patch, null, "is_error/empty result must produce no patch");
});

test("running the runner script twice truncates the sidecar (per-launch fresh data)", () => {
  // Simulate two runs that tee to the same sidecar. The first invocation
  // writes "old" data, the second writes "new" data, and the sidecar
  // contents after the second run must reflect only the second run.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-sidecar-trunc-"));
  try {
    const sidecar = path.join(tmp, "critique-a.stream.jsonl");
    execSync(`echo 'old line 1' | tee "${sidecar}" > /dev/null`);
    execSync(`echo 'old line 2' | tee -a "${sidecar}" > /dev/null`);
    // Second run uses bare tee — must truncate.
    execSync(`echo 'new line 1' | tee "${sidecar}" > /dev/null`);
    const contents = fs.readFileSync(sidecar, "utf-8");
    assert.equal(contents.trim(), "new line 1");
    assert.ok(!contents.includes("old"), "prior contents must not survive bare tee");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
