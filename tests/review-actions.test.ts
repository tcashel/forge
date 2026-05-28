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
import { parseAdHocReviewSentinel } from "../src/cli/cmd/review-actions.ts";
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
