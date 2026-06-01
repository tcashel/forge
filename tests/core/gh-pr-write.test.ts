import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildFindingCommentBody, buildFindingMarker } from "../../src/core/forge-comment-marker.ts";
import { __setGhRunner, fetchReviewThreads, publishReviewFindings } from "../../src/core/gh-pr-write.ts";
import type { ForgeFinding } from "../../src/core/reviewer.ts";

interface RecordedCall {
  args: string[];
  inputJson?: unknown;
}

// A fake `gh` runner: records every call and answers reads from canned data.
// `gh api --paginate --slurp` collects each page into an outer array, so a
// single page of items reads back as `[[...items]]`. The runner mirrors that
// shape: `existingComments`/`existingReviews` are the flat items for one page.
function makeRunner(opts: { existingComments?: unknown[]; existingReviews?: unknown[] }) {
  const calls: RecordedCall[] = [];
  const runner = (args: string[], o?: { inputJson?: unknown }) => {
    calls.push({ args, inputJson: o?.inputJson });
    const joined = args.join(" ");
    const slurped = args.includes("--paginate") && args.includes("--slurp");
    if (joined.includes("/pulls/") && joined.includes("/comments") && slurped) {
      return Promise.resolve({ ok: true, stdout: JSON.stringify([opts.existingComments ?? []]) });
    }
    if (joined.includes("/pulls/") && joined.includes("/reviews") && slurped) {
      return Promise.resolve({ ok: true, stdout: JSON.stringify([opts.existingReviews ?? []]) });
    }
    if (args.includes("--method") && joined.includes("/reviews")) {
      return Promise.resolve({ ok: true, stdout: "{}" });
    }
    return Promise.resolve({ ok: true, stdout: "" });
  };
  return { calls, runner };
}

function postReviewCalls(calls: RecordedCall[]): RecordedCall[] {
  return calls.filter((c) => c.args.includes("--method") && c.args.join(" ").includes("/reviews"));
}

function makeFinding(o: Partial<ForgeFinding>): ForgeFinding {
  return {
    id: "id",
    severity: "HIGH",
    title: "t",
    file: "src/foo.ts",
    lineStart: 0,
    lineEnd: 0,
    evidence: null,
    why: "w",
    fix: "f",
    ...o,
  };
}

const DIFF = [
  "diff --git a/src/foo.ts b/src/foo.ts",
  "--- a/src/foo.ts",
  "+++ b/src/foo.ts",
  "@@ -1,2 +1,3 @@",
  " a",
  "+b",
  " c",
].join("\n");
// RIGHT lines: 1, 2, 3.

const OPTS = { cwd: "/tmp", ownerRepo: "acme/repo", apiHost: null };

test("publishReviewFindings posts one review with an inline comment per in-diff finding (markers embedded)", async () => {
  const inDiff = makeFinding({ id: "aa11bb22cc33", file: "src/foo.ts", lineStart: 2, lineEnd: 2 });
  const outDiff = makeFinding({ id: "dd44ee55ff66", file: "src/foo.ts", lineStart: 99, lineEnd: 99 });
  const { calls, runner } = makeRunner({});
  __setGhRunner(runner as never);
  try {
    const res = await publishReviewFindings(7, { findings: [inDiff, outDiff], diff: DIFF, commitId: "sha1" }, OPTS);
    assert.equal(res.posted, 1);
    assert.equal(res.outOfDiff, 1);
    assert.equal(res.skippedPost, false);

    const posts = postReviewCalls(calls);
    assert.equal(posts.length, 1, "exactly one pulls/{n}/reviews POST");
    const payload = posts[0].inputJson as { event: string; body: string; comments: Array<{ body: string }> };
    assert.equal(payload.event, "COMMENT");
    assert.equal(payload.comments.length, 1);
    assert.ok(payload.comments[0].body.includes("forge-finding id=aa11bb22cc33"));
    // Out-of-diff finding is listed in the body with its marker.
    assert.ok(payload.body.includes("forge-finding id=dd44ee55ff66"));
  } finally {
    __setGhRunner(null);
  }
});

test("publishReviewFindings is idempotent: a re-run posts no new inline comments", async () => {
  const inDiff = makeFinding({ id: "aa11bb22cc33", file: "src/foo.ts", lineStart: 2, lineEnd: 2 });
  // Seed the existing inline comment with the same finding's marker.
  const existingComments = [{ body: buildFindingCommentBody(inDiff) }];
  const { calls, runner } = makeRunner({ existingComments });
  __setGhRunner(runner as never);
  try {
    const res = await publishReviewFindings(7, { findings: [inDiff], diff: DIFF, commitId: "sha1" }, OPTS);
    assert.equal(res.posted, 0);
    assert.equal(res.skippedPost, true);
    assert.equal(postReviewCalls(calls).length, 0, "no reviews POST on a fully-published re-run");
  } finally {
    __setGhRunner(null);
  }
});

test("publishReviewFindings skips the POST when reconciliation (existing-comments fetch) fails", async () => {
  const inDiff = makeFinding({ id: "aa11bb22cc33", file: "src/foo.ts", lineStart: 2, lineEnd: 2 });
  const calls: RecordedCall[] = [];
  // Existing-comments read fails; without a reliable view of what's already
  // posted we must not post (else we'd duplicate already-published findings).
  const runner = (args: string[], o?: { inputJson?: unknown }) => {
    calls.push({ args, inputJson: o?.inputJson });
    const joined = args.join(" ");
    if (joined.includes("/pulls/") && joined.includes("/comments") && args.includes("--paginate")) {
      return Promise.resolve({ ok: false, stdout: "403 forbidden" });
    }
    return Promise.resolve({ ok: true, stdout: "[[]]" });
  };
  __setGhRunner(runner as never);
  try {
    const res = await publishReviewFindings(7, { findings: [inDiff], diff: DIFF, commitId: "sha1" }, OPTS);
    assert.equal(res.posted, 0);
    assert.equal(res.skippedPost, true);
    assert.equal(postReviewCalls(calls).length, 0, "no reviews POST when reconciliation fails");
  } finally {
    __setGhRunner(null);
  }
});

test("publishReviewFindings skips the POST entirely when an all-out-of-diff PR is already published in a review body", async () => {
  const outDiff = makeFinding({ id: "dd44ee55ff66", file: "src/foo.ts", lineStart: 99, lineEnd: 99 });

  // First run: nothing published yet → posts a body-only review (no inline comments).
  {
    const { calls, runner } = makeRunner({});
    __setGhRunner(runner as never);
    const res = await publishReviewFindings(7, { findings: [outDiff], diff: DIFF, commitId: "sha1" }, OPTS);
    assert.equal(res.posted, 0);
    assert.equal(res.outOfDiff, 1);
    const posts = postReviewCalls(calls);
    assert.equal(posts.length, 1);
    const payload = posts[0].inputJson as { comments: unknown[]; body: string };
    assert.equal(payload.comments.length, 0, "body-only review");
    assert.ok(payload.body.includes("forge-finding id=dd44ee55ff66"));
    __setGhRunner(null);
  }

  // Second run: a prior review body carries the marker → skip the POST.
  {
    const existingReviews = [{ body: `outside diff <!-- forge-finding id=dd44ee55ff66 sev=HIGH v=1 -->` }];
    const { calls, runner } = makeRunner({ existingReviews });
    __setGhRunner(runner as never);
    const res = await publishReviewFindings(7, { findings: [outDiff], diff: DIFF, commitId: "sha1" }, OPTS);
    assert.equal(res.skippedPost, true);
    assert.equal(postReviewCalls(calls).length, 0);
    __setGhRunner(null);
  }
});

test("publishReviewFindings reconciles markers across multiple --slurp pages", async () => {
  // A finding whose marker only appears on page 2 of a multi-page inline-comment
  // response. With `--slurp` gh returns an array-of-pages; the flatten step must
  // see page 2's marker so we treat the finding as already published and skip.
  const onPage2 = makeFinding({ id: "aa11bb22cc33", file: "src/foo.ts", lineStart: 2, lineEnd: 2 });
  const calls: RecordedCall[] = [];
  const page1 = [{ body: "unrelated comment, no marker" }];
  const page2 = [{ body: buildFindingCommentBody(onPage2) }];
  const runner = (args: string[], o?: { inputJson?: unknown }) => {
    calls.push({ args, inputJson: o?.inputJson });
    const joined = args.join(" ");
    const slurped = args.includes("--paginate") && args.includes("--slurp");
    if (joined.includes("/comments") && slurped) {
      // Outer array = pages; inner arrays = items per page.
      return Promise.resolve({ ok: true, stdout: JSON.stringify([page1, page2]) });
    }
    if (joined.includes("/reviews") && slurped) {
      return Promise.resolve({ ok: true, stdout: JSON.stringify([[]]) });
    }
    return Promise.resolve({ ok: true, stdout: "" });
  };
  __setGhRunner(runner as never);
  try {
    const res = await publishReviewFindings(7, { findings: [onPage2], diff: DIFF, commitId: "sha1" }, OPTS);
    assert.equal(res.posted, 0, "page-2 marker counts as published");
    assert.equal(res.skippedPost, true);
    assert.equal(postReviewCalls(calls).length, 0, "no duplicate review POST");
  } finally {
    __setGhRunner(null);
  }
});

test("fetchReviewThreads pages through the GraphQL cursor until exhausted", async () => {
  // Page 1 has one thread and hasNextPage:true; page 2 has the marker-bearing
  // thread and ends pagination. Both must come back from a single call.
  const calls: string[][] = [];
  const marker = buildFindingMarker("dd44ee55ff66", "HIGH");
  const runner = (args: string[]) => {
    calls.push(args);
    const isGraphql = args.includes("graphql");
    if (!isGraphql) return Promise.resolve({ ok: true, stdout: "" });
    const hasAfter = args.some((a) => a.startsWith("after="));
    if (!hasAfter) {
      return Promise.resolve({
        ok: true,
        stdout: JSON.stringify({
          data: {
            repository: {
              pullRequest: {
                reviewThreads: {
                  pageInfo: { hasNextPage: true, endCursor: "CURSOR1" },
                  nodes: [{ id: "T1", isResolved: false, comments: { nodes: [{ databaseId: 1, body: "first" }] } }],
                },
              },
            },
          },
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      stdout: JSON.stringify({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [{ id: "T2", isResolved: true, comments: { nodes: [{ databaseId: 2, body: marker }] } }],
              },
            },
          },
        },
      }),
    });
  };
  __setGhRunner(runner as never);
  try {
    const threads = await fetchReviewThreads(7, OPTS);
    assert.equal(threads.length, 2, "both pages of threads returned");
    assert.deepEqual(
      threads.map((t) => t.threadId),
      ["T1", "T2"],
    );
    assert.equal(threads[1].comments[0].databaseId, 2);
    // Exactly two GraphQL calls: page 1 (no cursor) + page 2 (after=CURSOR1).
    const graphqlCalls = calls.filter((a) => a.includes("graphql"));
    assert.equal(graphqlCalls.length, 2);
    assert.ok(graphqlCalls[1].includes("after=CURSOR1"), "second call carries the cursor");
  } finally {
    __setGhRunner(null);
  }
});
