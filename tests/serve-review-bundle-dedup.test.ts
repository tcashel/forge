/**
 * Review-bundle de-dup: an inline comment carrying a `forge-finding` marker
 * IS the published view of that local finding, so the endpoint suppresses the
 * duplicate local finding and enriches the comment with its resolution status.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { startServer } from "../src/cli/cmd/serve.ts";
import { buildFindingCommentBody } from "../src/core/forge-comment-marker.ts";
import type { FetchPrBundleResult, GhPr, PrBundle, PrInlineComment } from "../src/core/gh-pr.ts";
import { __setGhRunner } from "../src/core/gh-pr-write.ts";
import { detectRepo } from "../src/core/repo.ts";
import type { ForgeFinding } from "../src/core/reviewer.ts";
import { ForgeStore } from "../src/core/store.ts";

/**
 * The review-bundle endpoint resolves its repo from the server's cwd, and
 * findLatestForgeFindings only admits ad-hoc dirs whose meta.json names that
 * repoRoot — so the fixture must stamp its run dir the same way the real
 * review worker does.
 */
function stampRunDirRepo(runDir: string): void {
  const repoRoot = detectRepo(process.cwd())?.root ?? process.cwd();
  fs.writeFileSync(path.join(runDir, "meta.json"), JSON.stringify({ repoRoot }));
}

const PUBLISHED_ID = "abcabcabcabc";
const LOCAL_ID = "ffffffffffff";
const COMMENT_DB_ID = 555;

function finding(id: string, line: number): ForgeFinding {
  return {
    id,
    severity: "HIGH",
    title: `finding ${id}`,
    file: "src/x.ts",
    lineStart: line,
    lineEnd: line,
    evidence: null,
    why: "w",
    fix: "f",
  };
}

function pr(num: number): GhPr {
  return {
    number: num,
    title: `PR ${num}`,
    headRefName: `forge/pr-${num}`,
    baseRefName: "main",
    url: `https://github.com/acme/repo/pull/${num}`,
    isDraft: false,
    statusCheckRollup: null,
    reviewDecision: null,
    author: "alice",
    updatedAt: new Date().toISOString(),
    additions: 1,
    deletions: 0,
    changedFiles: 1,
    commentsCount: 1,
    reviewsCount: 0,
    isMine: false,
  };
}

function inlineComment(): PrInlineComment {
  return {
    id: COMMENT_DB_ID,
    user: "forge",
    body: buildFindingCommentBody(finding(PUBLISHED_ID, 2)),
    path: "src/x.ts",
    position: 1,
    originalPosition: 1,
    line: 2,
    originalLine: 2,
    side: "RIGHT",
    startLine: null,
    startSide: null,
    inReplyToId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    htmlUrl: "https://github.com/acme/repo/pull/1#discussion_r555",
    commitId: "sha",
  };
}

function bundle(num: number): PrBundle {
  return {
    pr: pr(num),
    diff: "diff --git a/src/x.ts b/src/x.ts\n--- a/src/x.ts\n+++ b/src/x.ts\n@@ -1 +1,2 @@\n a\n+b\n",
    diffStats: { additions: 1, deletions: 0, changedFiles: 1 },
    inlineComments: [inlineComment()],
    issueComments: [],
    prReviews: [],
    warnings: [],
  };
}

function threadsResponse(): string {
  return JSON.stringify({
    data: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: [
              {
                id: "T_published",
                isResolved: true,
                comments: { nodes: [{ databaseId: COMMENT_DB_ID, body: inlineComment().body }] },
              },
            ],
          },
        },
      },
    },
  });
}

test("review-bundle suppresses the local finding behind a marker comment and surfaces its resolution", async (t) => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-dedup-"));
  const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });

  // Seed an ad-hoc findings.json: one published (marker on the PR), one not.
  const runDir = path.join(store.runsDir, "pr-review", "1-s-dedup");
  fs.mkdirSync(runDir, { recursive: true });
  stampRunDirRepo(runDir);
  fs.writeFileSync(
    path.join(runDir, "findings.json"),
    JSON.stringify([finding(PUBLISHED_ID, 2), finding(LOCAL_ID, 5)], null, 2),
  );

  const fetcher = async (num: number): Promise<FetchPrBundleResult> => ({ ok: true, bundle: bundle(num) });
  const { port, stop } = await startServer(store, { port: 0, host: "127.0.0.1", prBundleFetcher: fetcher });
  __setGhRunner(((args: string[]) => {
    const queryArg = args.find((a) => a.startsWith("query=")) ?? "";
    if (queryArg.includes("reviewThreads")) return Promise.resolve({ ok: true, stdout: threadsResponse() });
    return Promise.resolve({ ok: true, stdout: "" });
  }) as never);
  t.after(() => {
    __setGhRunner(null);
    stop();
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  const res = await fetch(`http://127.0.0.1:${port}/api/prs/1/review-bundle`);
  const body = (await res.json()) as {
    ok: boolean;
    data: {
      forgeFindings: ForgeFinding[];
      inlineComments: Array<
        PrInlineComment & { forgeFindingId?: string; reviewThreadId?: string; isResolved?: boolean }
      >;
    };
  };
  assert.equal(body.ok, true);

  // The published finding is suppressed; only the local-only finding remains.
  assert.deepEqual(
    body.data.forgeFindings.map((f) => f.id),
    [LOCAL_ID],
  );

  // The marker comment is enriched with the finding id + resolution from GitHub.
  const enriched = body.data.inlineComments.find((c) => c.id === COMMENT_DB_ID);
  assert.ok(enriched);
  assert.equal(enriched?.forgeFindingId, PUBLISHED_ID);
  assert.equal(enriched?.reviewThreadId, "T_published");
  assert.equal(enriched?.isResolved, true);
});

test("review-bundle keeps a STALE published finding selectable as a local finding row", async (t) => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-dedup-stale-"));
  const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });

  const runDir = path.join(store.runsDir, "pr-review", "1-s-dedup-stale");
  fs.mkdirSync(runDir, { recursive: true });
  stampRunDirRepo(runDir);
  fs.writeFileSync(
    path.join(runDir, "findings.json"),
    JSON.stringify([finding(PUBLISHED_ID, 2), finding(LOCAL_ID, 5)], null, 2),
  );

  // The published comment has gone stale: the diff no longer contains its
  // anchor. GitHub nulls `position` and `line` for a stale comment (the
  // original_* fields retain the old values). With no current anchor the UI
  // would render a disabled checkbox, so the bundle must NOT suppress the
  // local finding — it stays selectable.
  const staleBundle = (num: number): PrBundle => {
    const b = bundle(num);
    b.inlineComments = [{ ...inlineComment(), position: null, line: null, originalPosition: 1, originalLine: 2 }];
    return b;
  };

  const fetcher = async (num: number): Promise<FetchPrBundleResult> => ({ ok: true, bundle: staleBundle(num) });
  const { port, stop } = await startServer(store, { port: 0, host: "127.0.0.1", prBundleFetcher: fetcher });
  __setGhRunner(((args: string[]) => {
    const queryArg = args.find((a) => a.startsWith("query=")) ?? "";
    if (queryArg.includes("reviewThreads")) return Promise.resolve({ ok: true, stdout: threadsResponse() });
    return Promise.resolve({ ok: true, stdout: "" });
  }) as never);
  t.after(() => {
    __setGhRunner(null);
    stop();
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  const res = await fetch(`http://127.0.0.1:${port}/api/prs/1/review-bundle`);
  const body = (await res.json()) as {
    ok: boolean;
    data: {
      forgeFindings: ForgeFinding[];
      inlineComments: Array<
        PrInlineComment & { forgeFindingId?: string; reviewThreadId?: string; isResolved?: boolean }
      >;
    };
  };
  assert.equal(body.ok, true);

  // Stale published finding is NOT suppressed: both findings stay selectable.
  assert.deepEqual(new Set(body.data.forgeFindings.map((f) => f.id)), new Set([PUBLISHED_ID, LOCAL_ID]));

  // The stale comment still carries its marker metadata so resolve-on-fix works
  // once the local finding is fixed.
  const enriched = body.data.inlineComments.find((c) => c.id === COMMENT_DB_ID);
  assert.ok(enriched);
  assert.equal(enriched?.forgeFindingId, PUBLISHED_ID);
  assert.equal(enriched?.reviewThreadId, "T_published");
});
