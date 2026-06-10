import { strict as assert } from "node:assert";
import { test } from "node:test";
import { resolvePublishedFindingThreads, type ValidationFileEntry } from "../src/cli/cmd/comment-fix-actions.ts";
import { __setGhRunner } from "../src/core/gh-pr-write.ts";

interface RecordedCall {
  args: string[];
  inputJson?: unknown;
}

// Threads seeded on the PR: one per finding, each carrying its marker.
function threadsResponse() {
  const node = (threadId: string, databaseId: number, id: string) => ({
    id: threadId,
    isResolved: false,
    comments: { nodes: [{ databaseId, body: `body <!-- forge-finding id=${id} sev=HIGH v=1 -->` }] },
  });
  return JSON.stringify({
    data: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: [
              node("T_aaa", 11, "aaaaaaaaaaaa"),
              node("T_bbb", 22, "bbbbbbbbbbbb"),
              node("T_ccc", 33, "cccccccccccc"),
            ],
          },
        },
      },
    },
  });
}

function makeRunner(fail: { resolve?: string; reply?: string } = {}) {
  const calls: RecordedCall[] = [];
  const runner = (args: string[], o?: { inputJson?: unknown }) => {
    calls.push({ args, inputJson: o?.inputJson });
    const queryArg = args.find((a) => a.startsWith("query=")) ?? "";
    if (queryArg.includes("reviewThreads")) {
      return Promise.resolve({ ok: true, stdout: threadsResponse() });
    }
    if (queryArg.includes("resolveReviewThread")) {
      if (fail.resolve) return Promise.resolve({ ok: false, stdout: fail.resolve });
      return Promise.resolve({ ok: true, stdout: "{}" });
    }
    if (args.join(" ").includes("/replies")) {
      if (fail.reply) return Promise.resolve({ ok: false, stdout: fail.reply });
      return Promise.resolve({ ok: true, stdout: "{}" });
    }
    return Promise.resolve({ ok: true, stdout: "" });
  };
  return { calls, runner };
}

function resolveCalls(calls: RecordedCall[]) {
  return calls.filter((c) => (c.args.find((a) => a.startsWith("query=")) ?? "").includes("resolveReviewThread"));
}
function replyCalls(calls: RecordedCall[]) {
  return calls.filter((c) => c.args.join(" ").includes("/replies"));
}

test("resolvePublishedFindingThreads resolves fixed, replies disputed, skips failed + non-finding targets", async () => {
  const entries: ValidationFileEntry[] = [
    { targetId: "finding:aaaaaaaaaaaa", verdict: "valid", reason: "ok", status: "fixed" },
    { targetId: "finding:bbbbbbbbbbbb", verdict: "disputed", reason: "not a real bug", status: "disputed" },
    { targetId: "finding:cccccccccccc", verdict: "valid", reason: "ok", status: "failed" },
    { targetId: "comment:99", verdict: "valid", reason: "ok", status: "fixed" },
  ];
  const { calls, runner } = makeRunner();
  __setGhRunner(runner as never);
  try {
    await resolvePublishedFindingThreads({
      prNum: 7,
      prUrl: "https://github.com/acme/repo/pull/7",
      ghTarget: {},
      cwd: "/tmp",
      entries,
      committedAndPushed: true,
      log: () => {},
    });

    // fixed finding → exactly one resolve mutation, for thread T_aaa.
    const resolves = resolveCalls(calls);
    assert.equal(resolves.length, 1);
    assert.ok(resolves[0].args.some((a) => a === "id=T_aaa"));
    assert.equal(entries[0].ghResolved, true);

    // disputed finding → one reply to its comment id (22).
    const replies = replyCalls(calls);
    assert.equal(replies.length, 1);
    assert.ok(replies[0].args.join(" ").includes("/comments/22/replies"));
    assert.equal((replies[0].inputJson as { body: string }).body.includes("not a real bug"), true);

    // failed finding (ccc) and comment:99 → no writes for them.
    assert.equal(entries[2].ghResolved, undefined);
    assert.equal(entries[3].ghResolved, undefined);
  } finally {
    __setGhRunner(null);
  }
});

test("resolvePublishedFindingThreads leaves a fixed thread open when nothing was pushed", async () => {
  const entries: ValidationFileEntry[] = [
    { targetId: "finding:aaaaaaaaaaaa", verdict: "valid", reason: "ok", status: "fixed" },
  ];
  const { calls, runner } = makeRunner();
  __setGhRunner(runner as never);
  try {
    await resolvePublishedFindingThreads({
      prNum: 7,
      prUrl: "https://github.com/acme/repo/pull/7",
      ghTarget: {},
      cwd: "/tmp",
      entries,
      committedAndPushed: false,
      log: () => {},
    });
    assert.equal(resolveCalls(calls).length, 0);
    assert.equal(entries[0].ghResolved, undefined);
  } finally {
    __setGhRunner(null);
  }
});

test("resolvePublishedFindingThreads records ghError when the resolve mutation fails", async () => {
  const entries: ValidationFileEntry[] = [
    { targetId: "finding:aaaaaaaaaaaa", verdict: "valid", reason: "ok", status: "fixed" },
  ];
  const { runner } = makeRunner({ resolve: "GraphQL: thread is locked" });
  __setGhRunner(runner as never);
  try {
    await resolvePublishedFindingThreads({
      prNum: 7,
      prUrl: "https://github.com/acme/repo/pull/7",
      ghTarget: {},
      cwd: "/tmp",
      entries,
      committedAndPushed: true,
      log: () => {},
    });
    // The failure must land in the entry (and thus validation.json), not just the log.
    assert.equal(entries[0].ghResolved, undefined);
    assert.equal(entries[0].ghError, "resolve failed: GraphQL: thread is locked");
  } finally {
    __setGhRunner(null);
  }
});

test("resolvePublishedFindingThreads records ghError when the dispute reply fails", async () => {
  const entries: ValidationFileEntry[] = [
    { targetId: "finding:bbbbbbbbbbbb", verdict: "disputed", reason: "not a real bug", status: "disputed" },
  ];
  const { runner } = makeRunner({ reply: "HTTP 422: Unprocessable" });
  __setGhRunner(runner as never);
  try {
    await resolvePublishedFindingThreads({
      prNum: 7,
      prUrl: "https://github.com/acme/repo/pull/7",
      ghTarget: {},
      cwd: "/tmp",
      entries,
      committedAndPushed: true,
      log: () => {},
    });
    assert.equal(entries[0].ghError, "dispute reply failed: HTTP 422: Unprocessable");
  } finally {
    __setGhRunner(null);
  }
});
