/**
 * End-to-end tests for the review pipeline's publish reliability: publish
 * outcomes persisted to publish.json + session rows, hard gh pre-flight
 * errors, the stale-head guard, the reviewer timeout, pid recording, the
 * launch findings extractor, and the publish-only path.
 *
 * No real gh/claude is ever spawned: subprocesses route through
 * __setReviewExecHooks (review-actions.ts) and __setGhRunner (gh-pr-write.ts).
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import {
  __setReviewExecHooks,
  executeReview,
  findLatestForgeFindings,
  listForgeReviews,
  loadForgeReview,
  runAdHocReview,
  runExtractReviewBlock,
  runPublishOnly,
  runReviewInProcess,
} from "../src/cli/cmd/review-actions.ts";
import { CliError } from "../src/cli/output.ts";
import { __setGhRunner } from "../src/core/gh-pr-write.ts";
import { readPublishRecord } from "../src/core/publish-record.ts";
import { ForgeStore, type Plan } from "../src/core/store.ts";

const PR_URL = "https://github.com/acme/repo/pull/7";
const OLD_OID = "aaaa111122223333aaaa111122223333aaaa1111";
const NEW_OID = "bbbb444455556666bbbb444455556666bbbb4444";

const DIFF = [
  "diff --git a/src/foo.ts b/src/foo.ts",
  "--- a/src/foo.ts",
  "+++ b/src/foo.ts",
  "@@ -1,2 +1,3 @@",
  " a",
  "+b",
  " c",
].join("\n");
// RIGHT lines: 1, 2, 3 — the fixture finding at src/foo.ts:2 anchors in-diff.

const RAW_REVIEW = [
  "agent preamble",
  "```forge-review",
  "## Verdict",
  "request-changes",
  "",
  "## Summary",
  "Found one thing.",
  "",
  "## Findings",
  "",
  "### [HIGH] something broken",
  "**Where:** `src/foo.ts:2`",
  "**Why:** because",
  "**Fix:** patch",
  "",
  "## What I Skipped",
  "- nothing",
  "```",
  "",
].join("\n");

function prViewJson(oid: string): string {
  return JSON.stringify({
    number: 7,
    title: "t",
    headRefName: "feat/x",
    baseRefName: "main",
    additions: 1,
    deletions: 0,
    changedFiles: 1,
    url: PR_URL,
    headRefOid: oid,
  });
}

interface GhExecScenario {
  /** headRefOid returned by the publish-time re-fetch (default: same as start). */
  freshOid?: string;
  /** Throw for `pr diff` calls (simulates a gh outage). */
  failDiff?: boolean;
  /** Diff returned for re-fetches after the first (stale-head guard). */
  refetchedDiff?: string;
}

function makeGhExec(scenario: GhExecScenario = {}) {
  let diffCalls = 0;
  const ghExec = (args: string[]): string => {
    const joined = args.join(" ");
    // The publish-time re-fetch asks for exactly "url,headRefOid"; the full
    // pre-flight uses the longer PR_VIEW_FIELDS list (which contains the
    // shorter string as a suffix — substring matching would misroute it).
    if (joined.startsWith("pr view") && args[args.indexOf("--json") + 1] === "url,headRefOid") {
      return prViewJson(scenario.freshOid ?? OLD_OID);
    }
    if (joined.startsWith("pr view")) return prViewJson(OLD_OID);
    if (joined.startsWith("pr checks")) return "all checks pass";
    if (joined.startsWith("pr diff")) {
      if (scenario.failDiff) {
        const err = new Error("gh failed") as Error & { stderr: string };
        err.stderr = "HTTP 502: upstream connect error";
        throw err;
      }
      diffCalls++;
      if (diffCalls > 1 && scenario.refetchedDiff) return scenario.refetchedDiff;
      return DIFF;
    }
    return "";
  };
  return { ghExec, diffCallCount: () => diffCalls };
}

function agentExecWriting(raw: string) {
  return (args: { rawFile: string }) => {
    fs.writeFileSync(args.rawFile, raw, "utf-8");
  };
}

interface PublishGhScenario {
  failPost?: boolean;
  failReconcile?: boolean;
}

function makePublishRunner(scenario: PublishGhScenario = {}) {
  const calls: Array<{ args: string[]; inputJson?: unknown }> = [];
  const runner = (args: string[], o?: { inputJson?: unknown }) => {
    calls.push({ args, inputJson: o?.inputJson });
    const joined = args.join(" ");
    if (args.includes("--paginate") && args.includes("--slurp")) {
      if (scenario.failReconcile) {
        return Promise.resolve({ ok: false, stdout: "", stderr: "HTTP 403: forbidden", timedOut: false });
      }
      return Promise.resolve({ ok: true, stdout: "[[]]", stderr: "", timedOut: false });
    }
    if (args.includes("--method") && joined.includes("/reviews")) {
      if (scenario.failPost) {
        return Promise.resolve({ ok: false, stdout: "", stderr: "HTTP 401: Bad credentials", timedOut: false });
      }
      return Promise.resolve({ ok: true, stdout: "{}", stderr: "", timedOut: false });
    }
    return Promise.resolve({ ok: true, stdout: "", stderr: "", timedOut: false });
  };
  return { calls, runner };
}

interface PipelineFixture {
  tmpHome: string;
  store: ForgeStore;
  repoRoot: string;
}

function setupFixture(): PipelineFixture {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-review-pipeline-"));
  const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
  const repoRoot = path.join(tmpHome, "repo");
  fs.mkdirSync(repoRoot, { recursive: true });
  store.setRepoConfig(repoRoot, { reviewerAgent: "claude", reviewerModel: "test-model" });
  return { tmpHome, store, repoRoot };
}

function teardown(fx: PipelineFixture): void {
  __setReviewExecHooks(null);
  __setGhRunner(null);
  fs.rmSync(fx.tmpHome, { recursive: true, force: true });
}

function sessionRow(store: ForgeStore, sessionId: string) {
  return store.db.db
    .prepare("SELECT state, exit_code, error, pid, metrics FROM sessions WHERE id = ?")
    .get(sessionId) as {
    state: string;
    exit_code: number | null;
    error: string | null;
    pid: number | null;
    metrics: string;
  };
}

test("runReviewInProcess persists a 'published' record and a clean session on publish success", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({ ghExec, agentExec: agentExecWriting(RAW_REVIEW) });
    const { runner } = makePublishRunner();
    __setGhRunner(runner as never);

    const { sessionId, runDir, result } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: true },
      fx.store,
      () => {},
    );
    assert.equal(result.exitCode, 0);
    assert.equal(result.error, null);
    assert.equal(result.publishError, null);
    assert.equal(result.findings.length, 1);
    assert.equal(result.verdict, "request-changes");

    const record = readPublishRecord(runDir);
    assert.ok(record, "publish.json written");
    assert.equal(record?.state, "published");
    assert.equal(record?.requested, true);
    assert.equal(record?.posted, 1);
    assert.equal(record?.failed, 0);
    assert.equal(record?.findings[0]?.status, "posted");

    const row = sessionRow(fx.store, sessionId);
    assert.equal(row.state, "completed");
    assert.equal(row.error, null);
    const metrics = JSON.parse(row.metrics) as { publish?: { state: string; posted: number } };
    assert.equal(metrics.publish?.state, "published");
    assert.equal(metrics.publish?.posted, 1);

    // The read side exposes the record.
    const runs = listForgeReviews(fx.store, 7, fx.repoRoot);
    assert.equal(runs[0]?.publish?.state, "published");
    const detail = loadForgeReview(fx.store, 7, fx.repoRoot, sessionId);
    assert.equal(detail?.publish?.state, "published");
  } finally {
    teardown(fx);
  }
});

test("a failed publish POST leaves the session completed but NOT clean (error set, record failed)", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({ ghExec, agentExec: agentExecWriting(RAW_REVIEW) });
    const { runner } = makePublishRunner({ failPost: true });
    __setGhRunner(runner as never);

    const { sessionId, runDir, result } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: true },
      fx.store,
      () => {},
    );
    assert.equal(result.exitCode, 0, "review itself succeeded");
    assert.match(result.publishError ?? "", /publish to GitHub failed/);
    assert.match(result.publishError ?? "", /Bad credentials/);

    const record = readPublishRecord(runDir);
    assert.equal(record?.state, "failed");
    assert.equal(record?.failed, 1);
    assert.match(record?.error ?? "", /Bad credentials/);
    assert.equal(record?.findings[0]?.status, "failed");

    const row = sessionRow(fx.store, sessionId);
    assert.equal(row.state, "completed");
    assert.equal(row.exit_code, 0);
    assert.match(row.error ?? "", /publish to GitHub failed/, "session must not look clean");
    const metrics = JSON.parse(row.metrics) as { publish?: { state: string; failed: number } };
    assert.equal(metrics.publish?.state, "failed");
    assert.equal(metrics.publish?.failed, 1);

    assert.equal(listForgeReviews(fx.store, 7, fx.repoRoot)[0]?.publish?.state, "failed");
  } finally {
    teardown(fx);
  }
});

test("reconcile failure persists state 'reconcile-failed' and flags the session", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({ ghExec, agentExec: agentExecWriting(RAW_REVIEW) });
    const { runner } = makePublishRunner({ failReconcile: true });
    __setGhRunner(runner as never);

    const { sessionId, runDir } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: true },
      fx.store,
      () => {},
    );
    const record = readPublishRecord(runDir);
    assert.equal(record?.state, "reconcile-failed");
    assert.match(record?.error ?? "", /HTTP 403/);
    const row = sessionRow(fx.store, sessionId);
    assert.equal(row.state, "completed");
    assert.match(row.error ?? "", /reconcile-failed/);
  } finally {
    teardown(fx);
  }
});

test("publish.json is written with state 'not-requested' when the checkbox is off", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({ ghExec, agentExec: agentExecWriting(RAW_REVIEW) });
    const { calls, runner } = makePublishRunner();
    __setGhRunner(runner as never);

    const { sessionId, runDir } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: false },
      fx.store,
      () => {},
    );
    const record = readPublishRecord(runDir);
    assert.equal(record?.state, "not-requested");
    assert.equal(record?.requested, false);
    assert.equal(calls.length, 0, "zero GitHub write calls when not requested");
    const row = sessionRow(fx.store, sessionId);
    assert.equal(row.state, "completed");
    assert.equal(row.error, null);
  } finally {
    teardown(fx);
  }
});

test("a failed `gh pr diff` is a hard error — the session fails with the stderr detail", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec({ failDiff: true });
    __setReviewExecHooks({
      ghExec,
      agentExec: () => {
        throw new Error("agent must not run when pre-flight gh fails");
      },
    });
    const { sessionId, result } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: false },
      fx.store,
      () => {},
    );
    assert.equal(result.exitCode, 1);
    assert.match(result.error ?? "", /gh pr diff 7 failed/);
    assert.match(result.error ?? "", /HTTP 502/, "stderr detail survives into the error");
    const row = sessionRow(fx.store, sessionId);
    assert.equal(row.state, "failed");
    assert.match(row.error ?? "", /gh pr diff 7 failed/);
  } finally {
    teardown(fx);
  }
});

test("stale-head guard: a moved head re-fetches the diff and publishes against the new oid", async () => {
  const fx = setupFixture();
  try {
    const refetchedDiff = [
      "diff --git a/src/foo.ts b/src/foo.ts",
      "--- a/src/foo.ts",
      "+++ b/src/foo.ts",
      "@@ -1,2 +1,4 @@",
      " a",
      "+b",
      "+z",
      " c",
    ].join("\n");
    const gh = makeGhExec({ freshOid: NEW_OID, refetchedDiff });
    __setReviewExecHooks({ ghExec: gh.ghExec, agentExec: agentExecWriting(RAW_REVIEW) });
    const { calls, runner } = makePublishRunner();
    __setGhRunner(runner as never);

    const { runDir } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: true },
      fx.store,
      () => {},
    );
    const record = readPublishRecord(runDir);
    assert.equal(record?.state, "published");
    assert.equal(record?.headMoved, true);
    assert.equal(gh.diffCallCount(), 2, "diff re-fetched after the head moved");

    const post = calls.find((c) => c.args.includes("--method"));
    assert.ok(post, "review POST happened");
    assert.equal((post?.inputJson as { commit_id?: string }).commit_id, NEW_OID, "POST names the fresh head oid");
  } finally {
    teardown(fx);
  }
});

test("reviewer timeout fails the session with 'reviewer timed out after N minutes'", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({
      ghExec,
      agentExec: () => {
        const err = new Error("spawnSync bash ETIMEDOUT") as Error & { code: string };
        err.code = "ETIMEDOUT";
        throw err;
      },
    });
    const { sessionId, result } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: false },
      fx.store,
      () => {},
    );
    assert.equal(result.exitCode, 1);
    assert.equal(result.error, "reviewer timed out after 60 minutes");
    assert.equal(sessionRow(fx.store, sessionId).state, "failed");
  } finally {
    teardown(fx);
  }
});

test("reviewerTimeoutMinutes from repo config overrides the 60-minute default", async () => {
  const fx = setupFixture();
  try {
    // The optional key is read leniently off RepoConfig (typed elsewhere).
    fx.store.setRepoConfig(fx.repoRoot, { reviewerTimeoutMinutes: 5 } as never);
    const { ghExec } = makeGhExec();
    let seenTimeoutMs = 0;
    __setReviewExecHooks({
      ghExec,
      agentExec: (args) => {
        seenTimeoutMs = args.timeoutMs;
        const err = new Error("timed out") as Error & { code: string };
        err.code = "ETIMEDOUT";
        throw err;
      },
    });
    const { result } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: false },
      fx.store,
      () => {},
    );
    assert.equal(seenTimeoutMs, 5 * 60_000);
    assert.equal(result.error, "reviewer timed out after 5 minutes");
  } finally {
    teardown(fx);
  }
});

test("review failure before publish still writes publish.json (requested, failed)", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({
      ghExec,
      agentExec: agentExecWriting("no fenced block in this output"),
    });
    const { runDir, result } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: true },
      fx.store,
      () => {},
    );
    assert.equal(result.exitCode, 1);
    assert.match(result.error ?? "", /no fenced forge-review block/);
    const record = readPublishRecord(runDir);
    assert.equal(record?.requested, true);
    assert.equal(record?.state, "failed");
    assert.match(record?.error ?? "", /review failed before publish/);
  } finally {
    teardown(fx);
  }
});

test("runAdHocReview records the worker pid in the session row and metrics", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({
      ghExec,
      spawnWorker: () => ({ pid: 4242, unref: () => {} }),
    });
    const { sessionId } = await runAdHocReview(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: false },
      fx.store,
    );
    const row = sessionRow(fx.store, sessionId);
    assert.equal(row.pid, 4242, "pid column recorded at spawn");
    const metrics = JSON.parse(row.metrics) as { pid?: number };
    assert.equal(metrics.pid, 4242, "pid mirrored into the metrics blob");
  } finally {
    teardown(fx);
  }
});

test("executeReview tolerates a missing publish opt-in without touching gh write paths", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({ ghExec, agentExec: agentExecWriting(RAW_REVIEW) });
    const { calls, runner } = makePublishRunner();
    __setGhRunner(runner as never);
    const runDir = path.join(fx.store.runsDir, "pr-review", "7-s-direct");
    fs.mkdirSync(runDir, { recursive: true });
    const result = await executeReview({
      store: fx.store,
      runDir,
      prNum: 7,
      repoRoot: fx.repoRoot,
      repoName: "repo",
      headRefName: "feat/x",
      agentAdapter: "claude",
      model: "test-model",
      publishToGitHub: false,
      log: () => {},
    });
    assert.equal(result.exitCode, 0);
    assert.equal(result.publish.state, "not-requested");
    assert.equal(calls.length, 0);
    assert.ok(fs.existsSync(path.join(runDir, "findings.json")));
    assert.ok(fs.existsSync(path.join(runDir, "review.md")));
  } finally {
    teardown(fx);
  }
});

// ─── runExtractReviewBlock: findings.json beside the out file ────────────────

class ExitSentinel extends Error {
  constructor(readonly code: number) {
    super(`exit ${code}`);
  }
}

function callExtractReview(argv: string[]): number {
  const realExit = process.exit;
  // biome-ignore lint/suspicious/noExplicitAny: monkey-patching process.exit for an exit-coded helper
  (process as any).exit = (code?: number) => {
    throw new ExitSentinel(code ?? 0);
  };
  try {
    runExtractReviewBlock(argv);
    throw new Error("runExtractReviewBlock must exit");
  } catch (e) {
    if (e instanceof ExitSentinel) return e.code;
    throw e;
  } finally {
    process.exit = realExit;
  }
}

test("runExtractReviewBlock writes findings.json beside the out file (launch bucket lights up)", () => {
  const fx = setupFixture();
  try {
    const planId = "plan-launch-1";
    const outDir = path.join(fx.store.runsDir, planId);
    fs.mkdirSync(outDir, { recursive: true });
    const rawFile = path.join(outDir, "review-raw.md");
    const outFile = path.join(outDir, "review.md");
    fs.writeFileSync(rawFile, RAW_REVIEW, "utf-8");

    const code = callExtractReview([rawFile, outFile]);
    assert.equal(code, 0);
    assert.ok(fs.existsSync(outFile));

    const findingsPath = path.join(outDir, "findings.json");
    assert.ok(fs.existsSync(findingsPath), "findings.json written beside review.md");
    const findings = JSON.parse(fs.readFileSync(findingsPath, "utf-8")) as Array<{ severity: string }>;
    assert.equal(findings.length, 1);
    assert.equal(findings[0].severity, "HIGH");

    // The launch bucket of findLatestForgeFindings now resolves them.
    const plan: Plan = {
      id: planId,
      title: "t",
      repoRoot: fx.repoRoot,
      repoName: "repo",
      branch: "feat/x",
      worktree: null,
      status: "done",
      agent: "claude",
      model: "test-model",
      createdAt: new Date().toISOString(),
      launchedAt: null,
      completedAt: null,
      prUrl: null,
      prNumber: 7,
      tmuxSession: null,
      logFile: null,
      jiraTicket: null,
      specFile: "spec.md",
      specVersion: 1,
      lastImproveError: null,
      archivedAt: null,
    };
    fx.store.upsertPlan(plan);
    const lookup = findLatestForgeFindings(fx.store, 7, fx.repoRoot, "feat/x");
    assert.equal(lookup.source, "launch");
    assert.equal(lookup.findings.length, 1);
    assert.equal(lookup.path, findingsPath);
  } finally {
    teardown(fx);
  }
});

// ─── runPublishOnly ──────────────────────────────────────────────────────────

test("runPublishOnly republishes the latest saved findings and writes the record beside them", async () => {
  const fx = setupFixture();
  try {
    const runDir = path.join(fx.store.runsDir, "pr-review", "7-s-prior");
    fs.mkdirSync(runDir, { recursive: true });
    const findings = [
      {
        id: "aa11bb22cc33",
        severity: "HIGH",
        title: "something broken",
        file: "src/foo.ts",
        lineStart: 2,
        lineEnd: 2,
        evidence: null,
        why: "w",
        fix: "f",
      },
    ];
    fs.writeFileSync(path.join(runDir, "findings.json"), JSON.stringify(findings, null, 2));

    const { ghExec } = makeGhExec();
    __setReviewExecHooks({ ghExec });
    const { calls, runner } = makePublishRunner();
    __setGhRunner(runner as never);

    const res = await runPublishOnly({ prNum: 7, repoRoot: fx.repoRoot, repoName: "repo" }, fx.store, () => {});
    assert.equal(res.source, "adhoc");
    assert.equal(res.record.state, "published");
    assert.equal(res.record.posted, 1);
    assert.equal(res.record.findings[0]?.status, "posted");
    assert.ok(
      calls.some((c) => c.args.includes("--method")),
      "review POST happened",
    );

    const persisted = readPublishRecord(runDir);
    assert.equal(persisted?.state, "published");
  } finally {
    teardown(fx);
  }
});

test("runPublishOnly throws NO_FINDINGS when nothing is saved for the PR", async () => {
  const fx = setupFixture();
  try {
    const { ghExec } = makeGhExec();
    __setReviewExecHooks({ ghExec });
    await assert.rejects(
      () => runPublishOnly({ prNum: 7, repoRoot: fx.repoRoot, repoName: "repo" }, fx.store, () => {}),
      (e: unknown) => e instanceof CliError && e.code === "NO_FINDINGS",
    );
  } finally {
    teardown(fx);
  }
});
