/**
 * Tests for the comment-fix plumbing. Mirrors review-actions.test.ts:
 * deterministic helpers (parser, on-disk state lookup, log resolver,
 * input validation that fails before gh is consulted).
 *
 * The actual subprocess spawn is exercised by manual smoke testing —
 * these tests cover the pieces unit tests can hit reliably.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import {
  findLatestCommentFixState,
  runCommentFix,
  type ValidationFileEntry,
} from "../src/cli/cmd/comment-fix-actions.ts";
import { resolveSessionLogFile } from "../src/cli/cmd/serve.ts";
import { CliError } from "../src/cli/output.ts";
import { upsertSession } from "../src/core/db/writes.ts";
import { parseCommentValidation } from "../src/core/reviewer.ts";
import { ForgeStore } from "../src/core/store.ts";

function makeStore(prefix = "forge-comment-fix-"): { store: ForgeStore; tmp: string } {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const store = new ForgeStore({ forgeDir: path.join(tmp, ".forge") });
  return { store, tmp };
}

test("parseCommentValidation extracts a JSONL block (native targetId + legacy commentId)", () => {
  const raw = [
    "Some preamble text.",
    "",
    "```forge-comment-validation",
    '{"targetId": "finding:ab12cd", "verdict": "valid", "reason": "anchor matches"}',
    '{"commentId": 2, "verdict": "disputed", "reason": "comment anchor is stale"}',
    "```",
    "",
    "Now I'll fix the code.",
  ].join("\n");
  const parsed = parseCommentValidation(raw);
  assert.equal(parsed.length, 2);
  assert.deepEqual(parsed[0], { targetId: "finding:ab12cd", verdict: "valid", reason: "anchor matches" });
  // Legacy commentId coerces to the comment:<id> token.
  assert.deepEqual(parsed[1], { targetId: "comment:2", verdict: "disputed", reason: "comment anchor is stale" });
});

test("parseCommentValidation skips malformed lines and duplicates", () => {
  const raw = [
    "```forge-comment-validation",
    "this is not json",
    '{"targetId": "comment:10", "verdict": "valid", "reason": "first wins"}',
    '{"targetId": "comment:10", "verdict": "disputed", "reason": "duplicate dropped"}',
    '{"targetId": "comment:11", "verdict": "bogus", "reason": "bad verdict"}',
    '{"targetId": "comment:12", "verdict": "valid", "reason": ""}',
    '{"targetId": "comment:13", "verdict": "disputed", "reason": "ok"}',
    "```",
  ].join("\n");
  const parsed = parseCommentValidation(raw);
  assert.deepEqual(parsed, [
    { targetId: "comment:10", verdict: "valid", reason: "first wins" },
    { targetId: "comment:13", verdict: "disputed", reason: "ok" },
  ]);
});

test("parseCommentValidation returns [] when there's no block", () => {
  assert.deepEqual(parseCommentValidation(""), []);
  assert.deepEqual(parseCommentValidation("nothing fenced here"), []);
});

test("runCommentFix rejects empty targets with NO_COMMENTS", async () => {
  const { store, tmp } = makeStore();
  try {
    await assert.rejects(
      () => runCommentFix({ prNum: 1, repoRoot: tmp, repoName: "test", targets: [] }, store),
      (err) => err instanceof CliError && err.code === "NO_COMMENTS",
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("runCommentFix rejects all-invalid targets before touching gh", async () => {
  const { store, tmp } = makeStore();
  try {
    // Empty id and unknown source both drop during dedupe → no usable targets.
    await assert.rejects(
      () =>
        runCommentFix({ prNum: 1, repoRoot: tmp, repoName: "test", targets: [{ source: "comment", id: "" }] }, store),
      (err) => err instanceof CliError && err.code === "NO_COMMENTS",
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("runCommentFix surfaces REVIEWER_NOT_CONFIGURED before any gh call", async () => {
  const { store, tmp } = makeStore();
  try {
    // No reviewerAgent/reviewerModel set on this repo — orchestrator should
    // fail fast with the same code the reviewer uses.
    await assert.rejects(
      () =>
        runCommentFix(
          { prNum: 99, repoRoot: tmp, repoName: "test", targets: [{ source: "comment", id: "42" }] },
          store,
        ),
      (err) => err instanceof CliError && err.code === "REVIEWER_NOT_CONFIGURED",
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("resolveSessionLogFile reads metrics.logFile for comment-fix sessions", () => {
  const { store, tmp } = makeStore("forge-resolve-cf-");
  try {
    const logPath = path.join(tmp, "agent.log");
    fs.writeFileSync(logPath, "first line\n", "utf-8");

    const sessionId = "s-comment-fix-pr-test-1";
    upsertSession(store.db.db, {
      id: sessionId,
      purpose: "comment-fix",
      relatedId: null,
      agentAdapter: "claude",
      model: "opus-4-7",
      startedAt: new Date().toISOString(),
      cwd: tmp,
      state: "running",
      metrics: {
        ...({
          logFile: logPath,
          runDir: tmp,
          prNum: 42,
          repoRoot: tmp,
          worktreePath: tmp,
          targets: [{ source: "comment", id: "1" }],
        } as unknown as Partial<import("../src/core/db/writes.ts").SessionMetrics>),
      },
    });

    const resolved = resolveSessionLogFile(store, sessionId);
    assert.equal(resolved, logPath);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("findLatestCommentFixState aggregates validation.json into the bundle shape", () => {
  const { store, tmp } = makeStore("forge-cfs-");
  try {
    const prNum = 1234;
    const runDir = path.join(store.runsDir, "pr-comment-fix", `${prNum}-s-comment-fix-pr-x`);
    fs.mkdirSync(runDir, { recursive: true });
    const entries: ValidationFileEntry[] = [
      { targetId: "comment:11", verdict: "valid", reason: "fixed it", status: "fixed" },
      { targetId: "finding:ab12cd", verdict: "valid", reason: "fixed finding", status: "fixed" },
      { targetId: "review:777", verdict: "disputed", reason: "out of scope", status: "disputed" },
      { targetId: "comment:13", verdict: "valid", reason: "quality failed", status: "failed" },
    ];
    fs.writeFileSync(path.join(runDir, "validation.json"), JSON.stringify(entries, null, 2));
    fs.writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({
        schemaVersion: 1,
        repoRoot: tmp,
        repoName: "test",
        prNum,
        status: "completed",
      }),
    );

    const state = findLatestCommentFixState(store, prNum, tmp);
    assert.deepEqual(state["comment:11"], { status: "fixed", reason: "fixed it" });
    assert.deepEqual(state["finding:ab12cd"], { status: "fixed", reason: "fixed finding" });
    assert.deepEqual(state["review:777"], { status: "disputed", reason: "out of scope" });
    assert.deepEqual(state["comment:13"], { status: "failed", reason: "quality failed" });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("findLatestCommentFixState reads legacy commentId entries as comment:<id> tokens", () => {
  const { store, tmp } = makeStore("forge-cfs-legacy-");
  try {
    const prNum = 4321;
    const runDir = path.join(store.runsDir, "pr-comment-fix", `${prNum}-s-legacy`);
    fs.mkdirSync(runDir, { recursive: true });
    // Pre-token on-disk shape: keyed by numeric commentId.
    fs.writeFileSync(
      path.join(runDir, "validation.json"),
      JSON.stringify([{ commentId: 11, verdict: "valid", reason: "fixed it", status: "fixed" }]),
    );
    fs.writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({ schemaVersion: 1, repoRoot: tmp, prNum, status: "completed" }),
    );

    const state = findLatestCommentFixState(store, prNum, tmp);
    assert.deepEqual(state["comment:11"], { status: "fixed", reason: "fixed it" });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("findLatestCommentFixState picks the newest run when several exist", () => {
  const { store, tmp } = makeStore("forge-cfs-newest-");
  try {
    const prNum = 99;
    const olderDir = path.join(store.runsDir, "pr-comment-fix", `${prNum}-s-older`);
    const newerDir = path.join(store.runsDir, "pr-comment-fix", `${prNum}-s-newer`);
    fs.mkdirSync(olderDir, { recursive: true });
    fs.mkdirSync(newerDir, { recursive: true });

    fs.writeFileSync(
      path.join(olderDir, "validation.json"),
      JSON.stringify([{ commentId: 1, verdict: "valid", reason: "old", status: "fixed" }]),
    );
    fs.writeFileSync(
      path.join(olderDir, "meta.json"),
      JSON.stringify({ schemaVersion: 1, repoRoot: tmp, prNum, status: "completed" }),
    );

    // Stamp the older run with an older mtime by writing and then back-dating.
    const tenMinAgo = (Date.now() - 600_000) / 1000;
    fs.utimesSync(path.join(olderDir, "validation.json"), tenMinAgo, tenMinAgo);

    fs.writeFileSync(
      path.join(newerDir, "validation.json"),
      JSON.stringify([{ commentId: 1, verdict: "disputed", reason: "newer wins", status: "disputed" }]),
    );
    fs.writeFileSync(
      path.join(newerDir, "meta.json"),
      JSON.stringify({ schemaVersion: 1, repoRoot: tmp, prNum, status: "completed" }),
    );

    const state = findLatestCommentFixState(store, prNum, tmp);
    assert.deepEqual(state["comment:1"], { status: "disputed", reason: "newer wins" });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("findLatestCommentFixState returns {} when no runs exist", () => {
  const { store, tmp } = makeStore("forge-cfs-empty-");
  try {
    const state = findLatestCommentFixState(store, 7, tmp);
    assert.deepEqual(state, {});
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("findLatestCommentFixState demotes fixed→failed for failed sessions", () => {
  const { store, tmp } = makeStore("forge-cfs-failed-");
  try {
    const prNum = 5;
    const runDir = path.join(store.runsDir, "pr-comment-fix", `${prNum}-s-failed`);
    fs.mkdirSync(runDir, { recursive: true });
    // The on-disk validation.json was written before the failure was detected
    // — entries say "fixed" but the session ended failed.
    fs.writeFileSync(
      path.join(runDir, "validation.json"),
      JSON.stringify([{ commentId: 1, verdict: "valid", reason: "claimed fix", status: "fixed" }]),
    );
    fs.writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({ schemaVersion: 1, repoRoot: tmp, prNum, status: "failed" }),
    );

    const state = findLatestCommentFixState(store, prNum, tmp);
    assert.equal(state["comment:1"]?.status, "failed");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
