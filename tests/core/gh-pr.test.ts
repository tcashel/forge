import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import {
  __setGhRunner,
  currentLogin,
  fetchMinePrNumbers,
  fetchPrBundle,
  fetchPrCommits,
  fetchPrs,
  runGh,
} from "../../src/core/gh-pr.ts";

// ─── runGh: stderr capture + timeout flag ────────────────────────────────────
//
// Regression (pub-gh-stderr-discarded): runGh used to discard stderr
// unconditionally, so every gh failure surfaced as "unknown". These tests run
// a fake `gh` shell script via a PATH override — no real gh is spawned.

function withFakeGh(script: string, fn: () => Promise<void>): Promise<void> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-fake-gh-"));
  const ghPath = path.join(dir, "gh");
  fs.writeFileSync(ghPath, script, { mode: 0o755 });
  const oldPath = process.env.PATH;
  process.env.PATH = `${dir}:${oldPath ?? ""}`;
  return fn().finally(() => {
    process.env.PATH = oldPath;
    fs.rmSync(dir, { recursive: true, force: true });
  });
}

test("runGh returns trimmed stderr on failure instead of discarding it", async () => {
  await withFakeGh('#!/bin/sh\necho "HTTP 403: rate limit exceeded" >&2\nexit 1\n', async () => {
    const res = await runGh(["api", "whatever"]);
    assert.equal(res.ok, false);
    assert.equal(res.timedOut, false);
    assert.match(res.stderr, /HTTP 403: rate limit exceeded/);
  });
});

test("runGh caps runaway stderr at ~2KB", async () => {
  await withFakeGh("#!/bin/sh\nhead -c 5000 /dev/zero | tr '\\0' 'x' >&2\nexit 1\n", async () => {
    const res = await runGh(["api", "whatever"]);
    assert.equal(res.ok, false);
    assert.ok(res.stderr.length <= 2100, `stderr capped, got ${res.stderr.length}`);
    assert.match(res.stderr, /x{100}/);
  });
});

test("runGh reports a timeout as timedOut with 'timed out after Nms'", async () => {
  await withFakeGh("#!/bin/sh\nsleep 5\n", async () => {
    const res = await runGh(["pr", "diff", "1"], { timeoutMs: 200 });
    assert.equal(res.ok, false);
    assert.equal(res.timedOut, true);
    assert.match(res.stderr, /timed out after 200ms/);
  });
});

// ─── fetchPrBundle: --paginate --slurp ───────────────────────────────────────
//
// Regression (resolve-rereview-bundle-paginate-no-slurp): without --slurp a
// >100-item response is concatenated JSON arrays that JSON.parse rejects,
// silently dropping every inline comment on busy PRs.

const PR_VIEW = {
  number: 7,
  title: "t",
  headRefName: "feat/x",
  baseRefName: "main",
  url: "https://github.com/acme/repo/pull/7",
  isDraft: false,
  statusCheckRollup: [],
  reviewDecision: null,
  author: { login: "me" },
  updatedAt: "2026-01-01T00:00:00Z",
  additions: 1,
  deletions: 1,
  changedFiles: 1,
};

function inlineComment(id: number) {
  return {
    id,
    user: { login: "u" },
    body: `comment ${id}`,
    path: "src/foo.ts",
    line: 1,
    side: "RIGHT",
    created_at: "",
    updated_at: "",
    html_url: "",
    commit_id: "sha",
  };
}

test("fetchPrBundle parses multi-page slurped comment/review responses", async () => {
  const page1 = Array.from({ length: 100 }, (_, i) => inlineComment(i + 1));
  const page2 = Array.from({ length: 50 }, (_, i) => inlineComment(i + 101));
  const recorded: string[][] = [];
  const runner = (args: string[]) => {
    recorded.push(args);
    const joined = args.join(" ");
    if (joined.startsWith("pr view")) {
      return Promise.resolve({ ok: true, stdout: JSON.stringify(PR_VIEW), stderr: "", timedOut: false });
    }
    if (joined.startsWith("pr diff")) {
      return Promise.resolve({ ok: true, stdout: "diff --git a/x b/x", stderr: "", timedOut: false });
    }
    if (joined.startsWith("repo view")) {
      return Promise.resolve({ ok: true, stdout: "acme/repo", stderr: "", timedOut: false });
    }
    if (joined.includes("/pulls/7/comments")) {
      // Array-of-pages — what `--paginate --slurp` emits for two pages.
      return Promise.resolve({ ok: true, stdout: JSON.stringify([page1, page2]), stderr: "", timedOut: false });
    }
    if (joined.includes("/issues/7/comments") || joined.includes("/pulls/7/reviews")) {
      return Promise.resolve({ ok: true, stdout: "[[]]", stderr: "", timedOut: false });
    }
    return Promise.resolve({ ok: true, stdout: "", stderr: "", timedOut: false });
  };
  __setGhRunner(runner as never);
  try {
    const res = await fetchPrBundle(7, { cwd: "/tmp" });
    assert.ok(res.ok, "bundle fetch should succeed");
    if (!res.ok) return;
    assert.equal(res.bundle.inlineComments.length, 150, "all 150 comments across both pages parsed");
    assert.equal(res.bundle.inlineComments[149].id, 150);
    assert.deepEqual(res.bundle.warnings, []);
    // Every paginated gh api call must carry --slurp.
    const apiCalls = recorded.filter((a) => a[0] === "api" && a.includes("--paginate"));
    assert.equal(apiCalls.length, 3);
    for (const call of apiCalls) {
      assert.ok(call.includes("--slurp"), `expected --slurp on: ${call.join(" ")}`);
    }
  } finally {
    __setGhRunner(null);
  }
});

test("fetchPrCommits parses gh's commits projection and fails loud on gh errors", async () => {
  const commitsJson = {
    commits: [
      {
        oid: "aaa111",
        messageHeadline: "feat: one",
        messageBody: "body",
        authoredDate: "2026-06-10T00:00:00Z",
        authors: [{ login: "alice", name: "Alice" }],
      },
      { oid: "bbb222", messageHeadline: "fix: two" },
    ],
  };
  let fail = false;
  __setGhRunner(((args: string[]) => {
    assert.deepEqual(args, ["pr", "view", "7", "--json", "commits"]);
    if (fail) return Promise.resolve({ ok: false, stdout: "", stderr: "no pull requests found", timedOut: false });
    return Promise.resolve({ ok: true, stdout: JSON.stringify(commitsJson), stderr: "", timedOut: false });
  }) as never);
  try {
    const res = await fetchPrCommits(7, { cwd: "/tmp" });
    assert.ok(res.ok);
    if (!res.ok) return;
    assert.equal(res.commits.length, 2);
    assert.equal(res.commits[0].oid, "aaa111");
    assert.equal(res.commits[0].authors[0].login, "alice");
    assert.equal(res.commits[1].messageBody, "", "missing fields normalize to empty");

    fail = true;
    const bad = await fetchPrCommits(7, { cwd: "/tmp" });
    assert.equal(bad.ok, false);
    if (bad.ok) return;
    assert.match(bad.error, /no pull requests found/);
  } finally {
    __setGhRunner(null);
  }
});

test("fetchPrBundle surfaces gh stderr in bundle warnings", async () => {
  const runner = (args: string[]) => {
    const joined = args.join(" ");
    if (joined.startsWith("pr view")) {
      return Promise.resolve({ ok: true, stdout: JSON.stringify(PR_VIEW), stderr: "", timedOut: false });
    }
    if (joined.startsWith("pr diff")) {
      return Promise.resolve({ ok: true, stdout: "", stderr: "", timedOut: false });
    }
    if (joined.startsWith("repo view")) {
      return Promise.resolve({ ok: true, stdout: "acme/repo", stderr: "", timedOut: false });
    }
    return Promise.resolve({ ok: false, stdout: "", stderr: "timed out after 20000ms", timedOut: true });
  };
  __setGhRunner(runner as never);
  try {
    const res = await fetchPrBundle(7, { cwd: "/tmp" });
    assert.ok(res.ok);
    if (!res.ok) return;
    const inlineWarning = res.bundle.warnings.find((w) => w.source === "inlineComments");
    assert.ok(inlineWarning);
    assert.match(inlineWarning?.message ?? "", /timed out after 20000ms/);
  } finally {
    __setGhRunner(null);
  }
});

// ─── Read-path caches + call concurrency ─────────────────────────────────────
//
// /api/prs previously paid three gh network round-trips per poll. The
// login is cached for the process lifetime, @me PR numbers for 5 min,
// and the remaining list call runs concurrently with cache misses. The
// bundle's three comment/review calls must start as one wave.

test("currentLogin caches successful lookups but not failures", async () => {
  let calls = 0;
  __setGhRunner(((args: string[]) => {
    if (args[0] === "api" && args[1] === "user") {
      calls++;
      return Promise.resolve(
        calls === 1
          ? { ok: false, stdout: "", stderr: "no auth", timedOut: false }
          : { ok: true, stdout: "octocat", stderr: "", timedOut: false },
      );
    }
    return Promise.resolve({ ok: true, stdout: "", stderr: "", timedOut: false });
  }) as never);
  try {
    assert.equal(await currentLogin({ cwd: "/tmp" }), "", "failure passes through");
    assert.equal(await currentLogin({ cwd: "/tmp" }), "octocat", "failure was not cached");
    assert.equal(await currentLogin({ cwd: "/tmp" }), "octocat");
    assert.equal(calls, 2, "success is cached for the process lifetime");
  } finally {
    __setGhRunner(null);
  }
});

test("fetchMinePrNumbers caches per cwd and skips caching failures", async () => {
  let calls = 0;
  __setGhRunner(((args: string[]) => {
    if (args[0] === "pr" && args.includes("@me")) {
      calls++;
      return Promise.resolve({ ok: true, stdout: JSON.stringify([{ number: 42 }]), stderr: "", timedOut: false });
    }
    return Promise.resolve({ ok: true, stdout: "", stderr: "", timedOut: false });
  }) as never);
  try {
    assert.deepEqual([...(await fetchMinePrNumbers({ cwd: "/repo-a" }))], [42]);
    assert.deepEqual([...(await fetchMinePrNumbers({ cwd: "/repo-a" }))], [42]);
    assert.equal(calls, 1, "second lookup served from cache");
    await fetchMinePrNumbers({ cwd: "/repo-b" });
    assert.equal(calls, 2, "different cwd is a different cache key");
  } finally {
    __setGhRunner(null);
  }
});

test("fetchPrs runs login/@me/list as one concurrent wave", async () => {
  let inFlight = 0;
  let maxInFlight = 0;
  const track = async <T>(value: T): Promise<T> => {
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await new Promise((r) => setTimeout(r, 10));
    inFlight--;
    return value;
  };
  __setGhRunner(((args: string[]) => {
    if (args[0] === "api" && args[1] === "user") {
      return track({ ok: true, stdout: "octocat", stderr: "", timedOut: false });
    }
    if (args.includes("@me")) {
      return track({ ok: true, stdout: "[]", stderr: "", timedOut: false });
    }
    if (args[0] === "pr" && args[1] === "list") {
      return track({ ok: true, stdout: "[]", stderr: "", timedOut: false });
    }
    return Promise.resolve({ ok: true, stdout: "", stderr: "", timedOut: false });
  }) as never);
  try {
    const res = await fetchPrs({ cwd: "/tmp" });
    assert.equal(res.me, "octocat");
    assert.equal(maxInFlight, 3, "all three gh calls overlapped");
  } finally {
    __setGhRunner(null);
  }
});

test("fetchPrBundle starts the comment/review calls as one wave", async () => {
  let apiInFlight = 0;
  let maxApiInFlight = 0;
  __setGhRunner((async (args: string[]) => {
    const joined = args.join(" ");
    if (joined.startsWith("pr view")) {
      return { ok: true, stdout: JSON.stringify(PR_VIEW), stderr: "", timedOut: false };
    }
    if (joined.startsWith("pr diff")) {
      return { ok: true, stdout: "", stderr: "", timedOut: false };
    }
    if (joined.startsWith("repo view")) {
      return { ok: true, stdout: "acme/repo", stderr: "", timedOut: false };
    }
    if (args[0] === "api") {
      apiInFlight++;
      maxApiInFlight = Math.max(maxApiInFlight, apiInFlight);
      await new Promise((r) => setTimeout(r, 10));
      apiInFlight--;
      return { ok: true, stdout: "[[]]", stderr: "", timedOut: false };
    }
    return { ok: true, stdout: "", stderr: "", timedOut: false };
  }) as never);
  try {
    const res = await fetchPrBundle(7, { cwd: "/tmp" });
    assert.ok(res.ok);
    assert.equal(maxApiInFlight, 3, "inline/issue/review calls overlapped");
  } finally {
    __setGhRunner(null);
  }
});
