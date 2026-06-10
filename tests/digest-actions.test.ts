/**
 * PR digest orchestrator tests — parent spawn + single-flight, the in-process
 * digest pipeline, and the loadLatestDigest read side. No real gh/claude is
 * spawned: subprocesses route through __setDigestExecHooks.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { __setDigestExecHooks, executeDigest, loadLatestDigest, runPrDigest } from "../src/cli/cmd/digest-actions.ts";
import { CliError } from "../src/cli/output.ts";
import { buildDigestPrompt, extractForgeDigestBlock } from "../src/core/digest.ts";
import { ForgeStore } from "../src/core/store.ts";

const PR_URL = "https://github.com/acme/repo/pull/7";
const OID = "cccc777788889999cccc777788889999cccc7777";

const RAW_DIGEST = [
  "agent preamble chatter",
  "```forge-digest",
  "## Purpose",
  "Makes the thing faster.",
  "",
  "## Key changes",
  "- `src/foo.ts`: caches the result",
  "",
  "## Risk notes",
  "Low risk — pure addition.",
  "",
  "## Suggested review order",
  "1. src/foo.ts — the whole change",
  "```",
  "",
].join("\n");

function prViewJson(): string {
  return JSON.stringify({
    number: 7,
    title: "t",
    headRefName: "feat/x",
    baseRefName: "main",
    additions: 1,
    deletions: 0,
    changedFiles: 1,
    url: PR_URL,
    headRefOid: OID,
  });
}

function makeGhExec() {
  return (args: string[]): string => {
    const joined = args.join(" ");
    if (joined.startsWith("pr view")) return prViewJson();
    if (joined.startsWith("pr diff")) return "diff --git a/src/foo.ts b/src/foo.ts\n+cache";
    return "";
  };
}

interface Fixture {
  tmpHome: string;
  store: ForgeStore;
  repoRoot: string;
}

function setupFixture(): Fixture {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-digest-"));
  const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
  const repoRoot = path.join(tmpHome, "repo");
  fs.mkdirSync(repoRoot, { recursive: true });
  store.setRepoConfig(repoRoot, { reviewerAgent: "claude", reviewerModel: "test-model" });
  return { tmpHome, store, repoRoot };
}

function teardown(fx: Fixture): void {
  __setDigestExecHooks(null);
  fs.rmSync(fx.tmpHome, { recursive: true, force: true });
}

test("runPrDigest inserts a purpose='digest' session, spawns __digest-worker, and 409s while in flight", async () => {
  const fx = setupFixture();
  try {
    const spawned: string[][] = [];
    __setDigestExecHooks({
      ghExec: makeGhExec(),
      spawnWorker: (args) => {
        spawned.push(args.cmd);
        // Report this test process's pid so the reaper sees a live worker.
        return { pid: process.pid, unref: () => {} };
      },
    });

    const result = await runPrDigest({ prNum: 7, repoRoot: fx.repoRoot, repoName: "repo" }, fx.store);
    assert.match(result.sessionId, /^s-digest-pr-/);
    assert.equal(result.logStreamUrl, `/api/sessions/${encodeURIComponent(result.sessionId)}/log`);
    assert.equal(spawned.length, 1);
    assert.equal(spawned[0][2], "__digest-worker");
    assert.equal(spawned[0][3], result.sessionId);

    const row = fx.store.db.db
      .prepare("SELECT purpose, state, metrics FROM sessions WHERE id = ?")
      .get(result.sessionId) as { purpose: string; state: string; metrics: string };
    assert.equal(row.purpose, "digest");
    assert.equal(row.state, "running");
    const metrics = JSON.parse(row.metrics) as { headSha?: string; prNum?: number };
    assert.equal(metrics.headSha, OID, "head SHA captured as the cache key");
    assert.equal(metrics.prNum, 7);

    // Second digest for the same PR while the first runs → DIGEST_IN_FLIGHT.
    await assert.rejects(
      () => runPrDigest({ prNum: 7, repoRoot: fx.repoRoot, repoName: "repo" }, fx.store),
      (e: unknown) => e instanceof CliError && e.code === "DIGEST_IN_FLIGHT",
    );
  } finally {
    teardown(fx);
  }
});

test("runPrDigest fails fast when the reviewer agent is not configured", async () => {
  const fx = setupFixture();
  try {
    // A repo with no reviewer config at all — the orchestrator must reject
    // before any gh call or spawn.
    const bareRepo = path.join(fx.tmpHome, "bare-repo");
    fs.mkdirSync(bareRepo, { recursive: true });
    await assert.rejects(
      () => runPrDigest({ prNum: 7, repoRoot: bareRepo, repoName: "bare-repo" }, fx.store),
      (e: unknown) => e instanceof CliError && e.code === "REVIEWER_NOT_CONFIGURED",
    );
  } finally {
    teardown(fx);
  }
});

test("executeDigest extracts the forge-digest block to digest.md; loadLatestDigest serves the newest", async () => {
  const fx = setupFixture();
  try {
    __setDigestExecHooks({
      ghExec: makeGhExec(),
      agentExec: (args) => {
        fs.writeFileSync(args.rawFile, RAW_DIGEST, "utf-8");
      },
    });

    const runDir = path.join(fx.store.runsDir, "pr-digest", "7-s-digest-pr-test1");
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({ repoRoot: fx.repoRoot, prNum: 7, headSha: OID }),
      "utf-8",
    );

    const result = await executeDigest({
      store: fx.store,
      runDir,
      prNum: 7,
      repoRoot: fx.repoRoot,
      repoName: "repo",
      headRefName: "feat/x",
      agentAdapter: "claude",
      model: "test-model",
      log: () => {},
    });
    assert.equal(result.exitCode, 0);
    assert.equal(result.error, null);

    const digestMd = fs.readFileSync(path.join(runDir, "digest.md"), "utf-8");
    assert.match(digestMd, /## Purpose/);
    assert.match(digestMd, /## Suggested review order/);
    assert.ok(!digestMd.includes("agent preamble"), "only the fenced block is kept");

    // Wire a completed session row at the run dir; the read side joins on it.
    fx.store.db.db
      .prepare(
        `INSERT INTO sessions (id, purpose, agent_adapter, model, started_at, finished_at, state, exit_code, metrics)
         VALUES (?, 'digest', 'claude', 'test-model', ?, ?, 'completed', 0, ?)`,
      )
      .run(
        "s-digest-pr-test1",
        new Date(Date.now() - 1000).toISOString(),
        new Date().toISOString(),
        JSON.stringify({ runDir, prNum: 7, repoRoot: fx.repoRoot, headSha: OID }),
      );

    const view = loadLatestDigest(fx.store, 7, fx.repoRoot);
    assert.ok(view);
    assert.equal(view?.sessionId, "s-digest-pr-test1");
    assert.equal(view?.headSha, OID);
    assert.match(view?.markdown ?? "", /Makes the thing faster/);

    // Other PR / repo → null.
    assert.equal(loadLatestDigest(fx.store, 8, fx.repoRoot), null);
    assert.equal(loadLatestDigest(fx.store, 7, "/elsewhere"), null);
  } finally {
    teardown(fx);
  }
});

test("executeDigest fails with a structured error when the agent emits no forge-digest block", async () => {
  const fx = setupFixture();
  try {
    __setDigestExecHooks({
      ghExec: makeGhExec(),
      agentExec: (args) => {
        fs.writeFileSync(args.rawFile, "no fenced block here", "utf-8");
      },
    });
    const runDir = path.join(fx.store.runsDir, "pr-digest", "7-s-digest-pr-test2");
    fs.mkdirSync(runDir, { recursive: true });

    const result = await executeDigest({
      store: fx.store,
      runDir,
      prNum: 7,
      repoRoot: fx.repoRoot,
      repoName: "repo",
      headRefName: null,
      agentAdapter: "claude",
      model: "test-model",
      log: () => {},
    });
    assert.equal(result.exitCode, 1);
    assert.match(result.error ?? "", /no fenced forge-digest block/);
    assert.ok(!fs.existsSync(path.join(runDir, "digest.md")));
  } finally {
    teardown(fx);
  }
});

test("buildDigestPrompt truncates oversized diffs and embeds the linked spec", () => {
  const bigDiff = "x".repeat(70_000);
  const prompt = buildDigestPrompt({
    prNum: 7,
    repoName: "repo",
    prInfoJson: "{}",
    diff: bigDiff,
    linkedSpec: "# Spec\nDo the thing.",
  });
  assert.match(prompt, /diff truncated for context budget/);
  assert.ok(prompt.length < 70_000, "diff capped at the 60KB budget");
  assert.match(prompt, /## Linked Forge spec/);
  assert.match(prompt, /Do the thing\./);

  const noSpec = buildDigestPrompt({ prNum: 7, repoName: "repo", prInfoJson: "{}", diff: "d", linkedSpec: null });
  assert.match(noSpec, /no forge spec linked/);
});

test("extractForgeDigestBlock takes the LAST block and preserves nested fences", () => {
  const raw = [
    "```forge-digest",
    "## Purpose",
    "echoed template",
    "```",
    "real output below",
    "```forge-digest",
    "## Purpose",
    "the real one",
    "",
    "## Key changes",
    "```ts",
    "const x = 1;",
    "```",
    "after the nested fence",
    "```",
  ].join("\n");
  const block = extractForgeDigestBlock(raw);
  assert.ok(block);
  assert.match(block ?? "", /the real one/);
  assert.match(block ?? "", /const x = 1;/);
  assert.match(block ?? "", /after the nested fence/);
  assert.ok(!(block ?? "").includes("echoed template"));
});
