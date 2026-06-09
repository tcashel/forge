/**
 * Tests for the ad-hoc reviewer plumbing: resolveSessionLogFile branch for
 * review sessions, the `done` SSE event, and the sentinel parser.
 *
 * The actual subprocess spawn is exercised by the smoke instructions in
 * the spec; these tests cover the deterministic pieces: parser,
 * resolver, and SSE serializer.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import {
  listForgeReviews,
  loadForgeReview,
  parseAdHocReviewSentinel,
  shouldPublishToGitHub,
} from "../src/cli/cmd/review-actions.ts";
import { resolveSessionLogFile, startServer } from "../src/cli/cmd/serve.ts";
import { finalizeSession, upsertSession } from "../src/core/db/writes.ts";
import { ForgeStore } from "../src/core/store.ts";

test("parseAdHocReviewSentinel reads exit code and error from the worker line", () => {
  const okLine = '[forge:session-done {"exitCode":0,"error":null}]';
  const parsed = parseAdHocReviewSentinel(okLine);
  assert.deepEqual(parsed, { exitCode: 0, error: null });

  const failLine = '[forge:session-done {"exitCode":2,"error":"reviewer agent exited non-zero (1)"}]';
  const parsedFail = parseAdHocReviewSentinel(failLine);
  assert.equal(parsedFail?.exitCode, 2);
  assert.equal(parsedFail?.error, "reviewer agent exited non-zero (1)");

  // Surrounded by other text is fine — the regex anchors on the line end.
  const noisy = '[forge:review-worker] done\n[forge:session-done {"exitCode":0,"error":null}]';
  // Caller passes one line at a time normally; here verify single-line use.
  const noisyParsed = parseAdHocReviewSentinel(noisy.split("\n")[1]);
  assert.deepEqual(noisyParsed, { exitCode: 0, error: null });

  assert.equal(parseAdHocReviewSentinel("not a sentinel"), null);
  assert.equal(parseAdHocReviewSentinel(""), null);
});

test("shouldPublishToGitHub is driven solely by the per-request opt-in", () => {
  // Off by default — no flag set → no GitHub writes.
  assert.equal(shouldPublishToGitHub({}), false);
  assert.equal(shouldPublishToGitHub({ publishToGitHub: false }), false);
  // The "Publish to PR" checkbox alone enables publishing.
  assert.equal(shouldPublishToGitHub({ publishToGitHub: true }), true);
});

test("resolveSessionLogFile reads metrics.logFile for ad-hoc review sessions", () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-resolve-"));
  try {
    const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
    const logPath = path.join(tmpHome, "agent.log");
    fs.writeFileSync(logPath, "first line\n", "utf-8");

    const sessionId = "s-review-pr-test-1";
    upsertSession(store.db.db, {
      id: sessionId,
      purpose: "review",
      relatedId: null,
      agentAdapter: "claude",
      model: "opus-4-7",
      startedAt: new Date().toISOString(),
      cwd: tmpHome,
      state: "running",
      metrics: {
        ...({ logFile: logPath, runDir: tmpHome, prNum: 42, repoRoot: tmpHome } as unknown as Partial<
          import("../src/core/db/writes.ts").SessionMetrics
        >),
      },
    });

    const resolved = resolveSessionLogFile(store, sessionId);
    assert.equal(resolved, logPath);
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("session log SSE emits exactly one `done` frame when the session finishes", async (t) => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-sse-done-"));
  const cleanups: Array<() => void> = [() => fs.rmSync(tmpHome, { recursive: true, force: true })];
  t.after(() => {
    for (const c of cleanups.reverse()) {
      try {
        c();
      } catch {
        /* noop */
      }
    }
  });

  const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
  const logPath = path.join(tmpHome, "agent.log");
  fs.writeFileSync(logPath, "first line\n", "utf-8");

  const sessionId = "s-review-pr-sse-1";
  upsertSession(store.db.db, {
    id: sessionId,
    purpose: "review",
    relatedId: null,
    agentAdapter: "claude",
    model: "opus-4-7",
    startedAt: new Date().toISOString(),
    cwd: tmpHome,
    state: "running",
    metrics: {
      ...({ logFile: logPath, runDir: tmpHome, prNum: 99, repoRoot: tmpHome } as unknown as Partial<
        import("../src/core/db/writes.ts").SessionMetrics
      >),
    },
  });

  const { port, stop } = await startServer(store, { port: 0, host: "127.0.0.1" });
  cleanups.push(() => stop());

  const url = `http://127.0.0.1:${port}/api/sessions/${encodeURIComponent(sessionId)}/log`;
  const controller = new AbortController();
  const resPromise = fetch(url, { signal: controller.signal });
  const res = await resPromise;
  assert.equal(res.status, 200);
  if (!res.body) throw new Error("expected SSE body");

  // After the response opens, finalize the session and append the sentinel
  // — the SSE poll should pick up the row transition and emit `done`.
  setTimeout(() => {
    finalizeSession(store.db.db, {
      id: sessionId,
      finishedAt: new Date().toISOString(),
      state: "completed",
      exitCode: 0,
      error: null,
    });
    fs.appendFileSync(logPath, '[forge:session-done {"exitCode":0,"error":null}]\n');
  }, 200);

  // Collect SSE frames until we either see `done` or timeout.
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let doneFrames = 0;
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx = buf.indexOf("\n\n");
      while (idx !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        if (frame.split("\n").some((l) => l.startsWith("event: done"))) doneFrames++;
        idx = buf.indexOf("\n\n");
      }
      if (doneFrames > 0) break;
    }
  } catch {
    /* aborted */
  } finally {
    clearTimeout(timeout);
    try {
      reader.releaseLock();
    } catch {
      /* noop */
    }
  }

  assert.equal(doneFrames, 1, "exactly one done frame should be emitted");
});

// ─── listForgeReviews / loadForgeReview ─────────────────────────────────────

function seedReviewSession(opts: {
  store: ForgeStore;
  sessionId: string;
  prNum: number;
  repoRoot: string;
  agent?: string;
  model?: string;
  startedAt: string;
  state?: "running" | "completed" | "failed";
  finishedAt?: string | null;
  findings?: unknown[];
  reviewMd?: string | null;
}): string {
  const {
    store,
    sessionId,
    prNum,
    repoRoot,
    agent = "claude",
    model = "opus-4-7",
    startedAt,
    state = "completed",
    finishedAt = state === "running" ? null : startedAt,
    findings,
    reviewMd,
  } = opts;
  const runDir = path.join(store.runsDir, "pr-review", `${prNum}-${sessionId}`);
  fs.mkdirSync(runDir, { recursive: true });
  if (findings) {
    fs.writeFileSync(path.join(runDir, "findings.json"), JSON.stringify(findings, null, 2));
  }
  if (reviewMd) {
    fs.writeFileSync(path.join(runDir, "review.md"), reviewMd);
  }
  upsertSession(store.db.db, {
    id: sessionId,
    purpose: "review",
    relatedId: null,
    agentAdapter: agent,
    model,
    startedAt,
    cwd: repoRoot,
    state,
    metrics: {
      ...({ logFile: path.join(runDir, "agent.log"), runDir, prNum, repoRoot } as unknown as Partial<
        import("../src/core/db/writes.ts").SessionMetrics
      >),
    },
  });
  if (state !== "running") {
    finalizeSession(store.db.db, {
      id: sessionId,
      finishedAt: finishedAt ?? startedAt,
      state,
      exitCode: state === "completed" ? 0 : 1,
      error: state === "completed" ? null : "test-failure",
    });
  }
  return runDir;
}

test("listForgeReviews returns runs newest-first and is scoped to (prNum, repoRoot)", () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-list-reviews-"));
  try {
    const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
    const repoRoot = path.join(tmpHome, "repo-a");
    const otherRepoRoot = path.join(tmpHome, "repo-b");

    seedReviewSession({
      store,
      sessionId: "s-older",
      prNum: 7,
      repoRoot,
      startedAt: "2026-01-01T00:00:00.000Z",
      state: "completed",
      findings: [
        {
          id: "a",
          severity: "BLOCKER",
          title: "t",
          file: "x",
          lineStart: 1,
          lineEnd: 1,
          evidence: null,
          why: "",
          fix: "",
        },
        {
          id: "b",
          severity: "MEDIUM",
          title: "t2",
          file: "x",
          lineStart: 2,
          lineEnd: 2,
          evidence: null,
          why: "",
          fix: "",
        },
      ],
      reviewMd: "## Verdict\nrequest-changes\n\n## Summary\nx\n",
    });
    seedReviewSession({
      store,
      sessionId: "s-newest",
      prNum: 7,
      repoRoot,
      startedAt: "2026-01-02T00:00:00.000Z",
      state: "completed",
      findings: [],
      reviewMd: "## Verdict\napprove\n",
    });
    // Different PR — must be filtered out.
    seedReviewSession({
      store,
      sessionId: "s-other-pr",
      prNum: 99,
      repoRoot,
      startedAt: "2026-01-03T00:00:00.000Z",
      state: "completed",
      findings: [],
      reviewMd: "## Verdict\napprove\n",
    });
    // Same PR number, different repo — must be filtered out.
    seedReviewSession({
      store,
      sessionId: "s-other-repo",
      prNum: 7,
      repoRoot: otherRepoRoot,
      startedAt: "2026-01-04T00:00:00.000Z",
      state: "completed",
      findings: [],
      reviewMd: "## Verdict\napprove\n",
    });

    const runs = listForgeReviews(store, 7, repoRoot);
    assert.equal(runs.length, 2);
    assert.equal(runs[0].sessionId, "s-newest");
    assert.equal(runs[1].sessionId, "s-older");
    assert.equal(runs[0].verdict, "approve");
    assert.equal(runs[1].verdict, "request-changes");
    assert.equal(runs[1].findingsTotal, 2);
    assert.deepEqual(runs[1].findingCounts, { BLOCKER: 1, HIGH: 0, MEDIUM: 1, LOW: 0 });
    assert.equal(runs[0].findingsTotal, 0);
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("loadForgeReview returns null when the session is owned by a different PR", () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-load-review-"));
  try {
    const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
    const repoRoot = path.join(tmpHome, "repo-a");
    seedReviewSession({
      store,
      sessionId: "s-pr-7",
      prNum: 7,
      repoRoot,
      startedAt: "2026-01-01T00:00:00.000Z",
      state: "completed",
      findings: [],
      reviewMd: "## Verdict\napprove\n",
    });
    // Asking for the same session but pretending it belongs to PR 8.
    assert.equal(loadForgeReview(store, 8, repoRoot, "s-pr-7"), null);
    // Wrong repo root.
    assert.equal(loadForgeReview(store, 7, path.join(tmpHome, "repo-b"), "s-pr-7"), null);
    // Unknown session id.
    assert.equal(loadForgeReview(store, 7, repoRoot, "s-does-not-exist"), null);

    // Happy path.
    const ok = loadForgeReview(store, 7, repoRoot, "s-pr-7");
    assert.ok(ok);
    assert.equal(ok?.sessionId, "s-pr-7");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("loadForgeReview derives summary string from severity counts", () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-summary-"));
  try {
    const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
    const repoRoot = path.join(tmpHome, "repo");

    seedReviewSession({
      store,
      sessionId: "s-mixed",
      prNum: 1,
      repoRoot,
      startedAt: "2026-01-01T00:00:00.000Z",
      state: "completed",
      findings: [
        {
          id: "a",
          severity: "BLOCKER",
          title: "t",
          file: "x",
          lineStart: 1,
          lineEnd: 1,
          evidence: null,
          why: "",
          fix: "",
        },
        {
          id: "b",
          severity: "BLOCKER",
          title: "t",
          file: "x",
          lineStart: 2,
          lineEnd: 2,
          evidence: null,
          why: "",
          fix: "",
        },
        {
          id: "c",
          severity: "HIGH",
          title: "t",
          file: "x",
          lineStart: 3,
          lineEnd: 3,
          evidence: null,
          why: "",
          fix: "",
        },
        {
          id: "d",
          severity: "MEDIUM",
          title: "t",
          file: "x",
          lineStart: 4,
          lineEnd: 4,
          evidence: null,
          why: "",
          fix: "",
        },
        {
          id: "e",
          severity: "MEDIUM",
          title: "t",
          file: "x",
          lineStart: 5,
          lineEnd: 5,
          evidence: null,
          why: "",
          fix: "",
        },
        {
          id: "f",
          severity: "MEDIUM",
          title: "t",
          file: "x",
          lineStart: 6,
          lineEnd: 6,
          evidence: null,
          why: "",
          fix: "",
        },
      ],
      reviewMd: "## Verdict\nblock\n",
    });
    seedReviewSession({
      store,
      sessionId: "s-empty",
      prNum: 1,
      repoRoot,
      startedAt: "2026-01-02T00:00:00.000Z",
      state: "completed",
      findings: [],
      reviewMd: "## Verdict\napprove\n",
    });

    const mixed = loadForgeReview(store, 1, repoRoot, "s-mixed");
    assert.equal(mixed?.summary, "2 BLOCKER, 1 HIGH, 3 MEDIUM");
    const empty = loadForgeReview(store, 1, repoRoot, "s-empty");
    assert.equal(empty?.summary, "No findings");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("listForgeReviews reports null verdict for a still-running review", () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-running-verdict-"));
  try {
    const store = new ForgeStore({ forgeDir: path.join(tmpHome, ".forge") });
    const repoRoot = path.join(tmpHome, "repo");
    seedReviewSession({
      store,
      sessionId: "s-running",
      prNum: 2,
      repoRoot,
      startedAt: "2026-01-01T00:00:00.000Z",
      state: "running",
      // Even if review.md happens to exist (it shouldn't for a running run),
      // verdict must be null per spec.
      reviewMd: "## Verdict\napprove\n",
    });
    const runs = listForgeReviews(store, 2, repoRoot);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].status, "running");
    assert.equal(runs[0].verdict, null);
    assert.equal(runs[0].findingsTotal, 0);

    const detail = loadForgeReview(store, 2, repoRoot, "s-running");
    assert.equal(detail?.verdict, null);
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});
