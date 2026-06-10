/**
 * Per-repo stage-timeout config plumbing (Wave-1 handoff).
 *
 * RepoConfig gained agentTimeoutMinutes / reviewerTimeoutMinutes /
 * fixerTimeoutMinutes. These tests pin the full path:
 *   - `forge config set` validates them as positive integers,
 *   - resolveLaunchConfig threads them from repoConfig into the resolved
 *     launch config that doLaunch hands to launchAgent (whose runner
 *     defaults of 120/60/60 apply when unset).
 *
 * All state lives in a mkdtemp forgeDir; --repo bypasses git detection so
 * no real repo (or ~/.forge) is touched.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { run as configCmd } from "../src/cli/cmd/config.ts";
import { resolveLaunchConfig } from "../src/cli/cmd/launch.ts";
import type { CliError } from "../src/cli/output.ts";
import { ForgeStore, type Plan } from "../src/core/store.ts";

const REPO_ROOT = "/repo/x";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-cli-config-"));
}

function makePlan(): Plan {
  return {
    id: "plan-cfg-1",
    title: "config plumbing test",
    repoRoot: REPO_ROOT,
    repoName: "x",
    branch: "forge/cfg-1",
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: "plan-cfg-1.md",
    specVersion: 1,
    lastImproveError: null,
    archivedAt: null,
  };
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

test("config set/get round-trips the timeout keys as numbers", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    await capture(() => configCmd(["set", "agentTimeoutMinutes", "180", "--repo", REPO_ROOT, "--json"], store));
    await capture(() => configCmd(["set", "reviewerTimeoutMinutes", "45", "--repo", REPO_ROOT, "--json"], store));
    await capture(() => configCmd(["set", "fixerTimeoutMinutes", "30", "--repo", REPO_ROOT, "--json"], store));

    const cfg = store.getRepoConfig(REPO_ROOT);
    assert.strictEqual(cfg.agentTimeoutMinutes, 180);
    assert.strictEqual(cfg.reviewerTimeoutMinutes, 45);
    assert.strictEqual(cfg.fixerTimeoutMinutes, 30);

    const { out } = await capture(() =>
      configCmd(["get", "agentTimeoutMinutes", "--repo", REPO_ROOT, "--json"], store),
    );
    const parsed = JSON.parse(out) as { key: string; value: unknown };
    assert.strictEqual(parsed.value, 180);
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("config set rejects non-integer and non-positive timeout values", async () => {
  const forgeDir = tmpForgeDir();
  try {
    const store = new ForgeStore({ forgeDir });
    for (const bad of ["abc", "0", "1.5"]) {
      await assert.rejects(
        () => configCmd(["set", "reviewerTimeoutMinutes", bad, "--repo", REPO_ROOT, "--json"], store),
        (e: CliError) => e.code === "BAD_VALUE",
        `value "${bad}" must be rejected`,
      );
    }
    // "-5" is swallowed by parseArgs as a flag, so it surfaces as a missing
    // value rather than BAD_VALUE — still a hard rejection, nothing persisted.
    await assert.rejects(
      () => configCmd(["set", "reviewerTimeoutMinutes", "-5", "--repo", REPO_ROOT, "--json"], store),
      (e: CliError) => e.code === "MISSING_ARG" || e.code === "BAD_VALUE",
    );
    assert.strictEqual(store.getRepoConfig(REPO_ROOT).reviewerTimeoutMinutes, undefined, "nothing persisted");
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("resolveLaunchConfig threads repoConfig timeouts into the resolved config", () => {
  const values = {
    agent: "claude",
    model: "opus",
    "reviewer-agent": "codex",
    "reviewer-model": "gpt-5.5",
  };

  const { config: withTimeouts, problems } = resolveLaunchConfig(values, makePlan(), {
    agentTimeoutMinutes: 240,
    reviewerTimeoutMinutes: 90,
    fixerTimeoutMinutes: 20,
  });
  assert.deepEqual(problems, []);
  assert.strictEqual(withTimeouts?.agentTimeoutMinutes, 240);
  assert.strictEqual(withTimeouts?.reviewerTimeoutMinutes, 90);
  assert.strictEqual(withTimeouts?.fixerTimeoutMinutes, 20);

  const { config: withoutTimeouts } = resolveLaunchConfig(values, makePlan(), {});
  assert.strictEqual(withoutTimeouts?.agentTimeoutMinutes, undefined, "unset keys stay undefined (runner defaults)");
  assert.strictEqual(withoutTimeouts?.reviewerTimeoutMinutes, undefined);
  assert.strictEqual(withoutTimeouts?.fixerTimeoutMinutes, undefined);
});
