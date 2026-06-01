import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildFindingCommentBody } from "../../src/core/forge-comment-marker.ts";
import { __setGhRunner, publishReviewFindings } from "../../src/core/gh-pr-write.ts";
import type { ForgeFinding } from "../../src/core/reviewer.ts";

interface RecordedCall {
  args: string[];
  inputJson?: unknown;
}

// A fake `gh` runner: records every call and answers reads from canned data.
function makeRunner(opts: { existingComments?: unknown[]; existingReviews?: unknown[] }) {
  const calls: RecordedCall[] = [];
  const runner = (args: string[], o?: { inputJson?: unknown }) => {
    calls.push({ args, inputJson: o?.inputJson });
    const joined = args.join(" ");
    if (joined.includes("/pulls/") && joined.includes("/comments") && args.includes("--paginate")) {
      return Promise.resolve({ ok: true, stdout: JSON.stringify(opts.existingComments ?? []) });
    }
    if (joined.includes("/pulls/") && joined.includes("/reviews") && args.includes("--paginate")) {
      return Promise.resolve({ ok: true, stdout: JSON.stringify(opts.existingReviews ?? []) });
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
    return Promise.resolve({ ok: true, stdout: "[]" });
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
