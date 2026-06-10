/**
 * republishReviewSession — retry-publish for one recorded review run.
 *
 * Backs POST /api/prs/:num/reviews/:sessionId/publish. Mirrors the
 * review-pipeline fixtures: no real gh/claude is spawned — subprocesses
 * route through __setReviewExecHooks (review-actions.ts) and __setGhRunner
 * (gh-pr-write.ts).
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { __setReviewExecHooks, republishReviewSession, runReviewInProcess } from "../src/cli/cmd/review-actions.ts";
import { upsertSession } from "../src/core/db/writes.ts";
import { __setGhRunner } from "../src/core/gh-pr-write.ts";
import { readPublishRecord } from "../src/core/publish-record.ts";
import { ForgeStore } from "../src/core/store.ts";

const PR_URL = "https://github.com/acme/repo/pull/7";
const OID = "aaaa111122223333aaaa111122223333aaaa1111";

const DIFF = [
  "diff --git a/src/foo.ts b/src/foo.ts",
  "--- a/src/foo.ts",
  "+++ b/src/foo.ts",
  "@@ -1,2 +1,3 @@",
  " a",
  "+b",
  " c",
].join("\n");

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

function ghExec(args: string[]): string {
  const joined = args.join(" ");
  if (joined.startsWith("pr view")) {
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
  if (joined.startsWith("pr checks")) return "all checks pass";
  if (joined.startsWith("pr diff")) return DIFF;
  return "";
}

function publishRunner(args: string[]): Promise<{ ok: boolean; stdout: string; stderr: string; timedOut: boolean }> {
  const joined = args.join(" ");
  if (args.includes("--paginate") && args.includes("--slurp")) {
    return Promise.resolve({ ok: true, stdout: "[[]]", stderr: "", timedOut: false });
  }
  if (args.includes("--method") && joined.includes("/reviews")) {
    return Promise.resolve({ ok: true, stdout: "{}", stderr: "", timedOut: false });
  }
  return Promise.resolve({ ok: true, stdout: "", stderr: "", timedOut: false });
}

interface Fixture {
  tmpHome: string;
  store: ForgeStore;
  repoRoot: string;
}

function setup(): Fixture {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-republish-"));
  const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
  const repoRoot = path.join(tmpHome, "repo");
  fs.mkdirSync(repoRoot, { recursive: true });
  store.setRepoConfig(repoRoot, { reviewerAgent: "claude", reviewerModel: "test-model" });
  __setReviewExecHooks({
    ghExec,
    agentExec: (args) => {
      fs.writeFileSync(args.rawFile, RAW_REVIEW, "utf-8");
    },
  });
  __setGhRunner(publishRunner as never);
  return { tmpHome, store, repoRoot };
}

function teardown(fx: Fixture): void {
  __setReviewExecHooks(null);
  __setGhRunner(null);
  fs.rmSync(fx.tmpHome, { recursive: true, force: true });
}

test("republishReviewSession re-publishes a completed run's saved findings and rewrites publish.json", async () => {
  const fx = setup();
  try {
    // Run a review WITHOUT publish — findings.json saved, publish.json says
    // not-requested. This is the "operator forgot the checkbox" shape.
    const { sessionId, runDir } = await runReviewInProcess(
      { prNum: 7, repoRoot: fx.repoRoot, repoName: "repo", publishToGitHub: false },
      fx.store,
      () => {},
    );
    assert.equal(readPublishRecord(runDir)?.state, "not-requested");

    const { record, runDir: republishedDir } = await republishReviewSession(
      { prNum: 7, repoRoot: fx.repoRoot, sessionId },
      fx.store,
      () => {},
    );
    assert.equal(republishedDir, runDir);
    assert.equal(record.state, "published");
    assert.equal(record.posted, 1);
    assert.equal(record.requested, true);

    // publish.json on disk reflects the retry outcome.
    assert.equal(readPublishRecord(runDir)?.state, "published");

    // Session metrics carry the updated compact summary for list views.
    const row = fx.store.db.db.prepare("SELECT metrics FROM sessions WHERE id = ?").get(sessionId) as {
      metrics: string;
    };
    const metrics = JSON.parse(row.metrics) as { publish?: { state: string; posted: number } };
    assert.equal(metrics.publish?.state, "published");
    assert.equal(metrics.publish?.posted, 1);
  } finally {
    teardown(fx);
  }
});

test("republishReviewSession 409s (REVIEW_RUNNING) while the review session is still running", async () => {
  const fx = setup();
  try {
    upsertSession(fx.store.db.db, {
      id: "s-running",
      purpose: "review",
      relatedId: null,
      agentAdapter: "claude",
      model: "test-model",
      startedAt: new Date().toISOString(),
      pid: process.pid,
      state: "running",
      metrics: { prNum: 7, repoRoot: fx.repoRoot } as never,
    });
    await assert.rejects(
      () => republishReviewSession({ prNum: 7, repoRoot: fx.repoRoot, sessionId: "s-running" }, fx.store, () => {}),
      (e: unknown) => (e as { code?: string }).code === "REVIEW_RUNNING",
    );
  } finally {
    teardown(fx);
  }
});

test("republishReviewSession rejects unknown sessions and wrong-PR sessions with REVIEW_NOT_FOUND", async () => {
  const fx = setup();
  try {
    await assert.rejects(
      () => republishReviewSession({ prNum: 7, repoRoot: fx.repoRoot, sessionId: "s-nope" }, fx.store, () => {}),
      (e: unknown) => (e as { code?: string }).code === "REVIEW_NOT_FOUND",
    );

    // A session that exists but belongs to a different PR must not leak.
    upsertSession(fx.store.db.db, {
      id: "s-other-pr",
      purpose: "review",
      relatedId: null,
      agentAdapter: "claude",
      model: "test-model",
      startedAt: new Date().toISOString(),
      state: "completed",
      metrics: { prNum: 99, repoRoot: fx.repoRoot } as never,
    });
    await assert.rejects(
      () => republishReviewSession({ prNum: 7, repoRoot: fx.repoRoot, sessionId: "s-other-pr" }, fx.store, () => {}),
      (e: unknown) => (e as { code?: string }).code === "REVIEW_NOT_FOUND",
    );
  } finally {
    teardown(fx);
  }
});

test("republishReviewSession rejects a completed run with no saved findings (NO_FINDINGS)", async () => {
  const fx = setup();
  try {
    upsertSession(fx.store.db.db, {
      id: "s-no-findings",
      purpose: "review",
      relatedId: null,
      agentAdapter: "claude",
      model: "test-model",
      startedAt: new Date().toISOString(),
      state: "completed",
      metrics: { prNum: 7, repoRoot: fx.repoRoot } as never,
    });
    await assert.rejects(
      () => republishReviewSession({ prNum: 7, repoRoot: fx.repoRoot, sessionId: "s-no-findings" }, fx.store, () => {}),
      (e: unknown) => (e as { code?: string }).code === "NO_FINDINGS",
    );
  } finally {
    teardown(fx);
  }
});
