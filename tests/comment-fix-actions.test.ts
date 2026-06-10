/**
 * Tests for the comment-fix plumbing. Mirrors review-actions.test.ts:
 * deterministic helpers (parser, on-disk state lookup, log resolver,
 * input validation that fails before gh is consulted).
 *
 * The actual subprocess spawn is exercised by manual smoke testing —
 * these tests cover the pieces unit tests can hit reliably.
 */

import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import {
  commitAndPush,
  droppedTargetValidationEntries,
  findLatestCommentFixState,
  partitionFixTargets,
  readFixerTimeoutMinutes,
  recordWorkerPid,
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

test("parseCommentValidation takes the LAST block (skips echoed prompt examples)", () => {
  // Regression for the codex-adapter case: the agent echoes the skill's
  // schema/example blocks (placeholder tokens) before emitting the real
  // answer. Parsing the first block read placeholders that never matched the
  // requested targets, so every target was wrongly backfilled as disputed.
  const raw = [
    "## Phase 1 — emit a validation block (mandatory, first)",
    "```forge-comment-validation",
    '{"targetId": "comment:12345", "verdict": "valid", "reason": "Anchor matches; one-line change."}',
    '{"targetId": "finding:ab12cd34", "verdict": "valid", "reason": "Null deref is real."}',
    '{"targetId": "review:99887766", "verdict": "disputed", "reason": "Outside diff scope."}',
    "```",
    "## Output shape recap",
    "```forge-comment-validation",
    '{"targetId": "<source:id>", "verdict": "valid", "reason": "<text>"}',
    "```",
    "...now the agent's actual answer...",
    "```forge-comment-validation",
    '{"targetId": "comment:3334464712", "verdict": "disputed", "reason": "comment anchor is stale"}',
    '{"targetId": "finding:3f064ef5b46d", "verdict": "valid", "reason": "contradicts the spec; fixable locally"}',
    "```",
  ].join("\n");
  const parsed = parseCommentValidation(raw);
  assert.deepEqual(parsed, [
    { targetId: "comment:3334464712", verdict: "disputed", reason: "comment anchor is stale" },
    { targetId: "finding:3f064ef5b46d", verdict: "valid", reason: "contradicts the spec; fixable locally" },
  ]);
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

// ─── target integrity: dropped targets must stay visible ─────────────────────

test("partitionFixTargets keeps matchable targets and labels every dropped target with a reason", () => {
  const { fixable, dropped } = partitionFixTargets(
    [
      { source: "comment", id: "11" },
      { source: "comment", id: "12" },
      { source: "review", id: "77" },
      { source: "finding", id: "ab12cd" },
      { source: "finding", id: "stale99" },
    ],
    {
      anchoredCommentIds: new Set([11]),
      reviewIds: new Set([88]),
      findingIds: new Set(["ab12cd"]),
    },
  );
  assert.deepEqual(fixable, [
    { source: "comment", id: "11" },
    { source: "finding", id: "ab12cd" },
  ]);
  assert.deepEqual(dropped, [
    { token: "comment:12", reason: "comment no longer anchored to the diff" },
    { token: "review:77", reason: "review summary not found on this PR" },
    { token: "finding:stale99", reason: "finding not present in latest review run" },
  ]);
});

test("droppedTargetValidationEntries stamps dropped targets failed with the drop reason", () => {
  const entries = droppedTargetValidationEntries([
    { token: "finding:stale99", reason: "finding not present in latest review run" },
  ]);
  assert.deepEqual(entries, [
    {
      targetId: "finding:stale99",
      verdict: "disputed",
      reason: "finding not present in latest review run",
      status: "failed",
    },
  ]);
});

test("findLatestCommentFixState surfaces parent-dropped targets as failed (not omitted)", () => {
  const { store, tmp } = makeStore("forge-cfs-dropped-");
  try {
    const prNum = 314;
    const runDir = path.join(store.runsDir, "pr-comment-fix", `${prNum}-s-dropped`);
    fs.mkdirSync(runDir, { recursive: true });
    const entries: ValidationFileEntry[] = [
      { targetId: "comment:11", verdict: "valid", reason: "fixed it", status: "fixed" },
      ...droppedTargetValidationEntries([
        { token: "finding:stale99", reason: "finding not present in latest review run" },
      ]),
    ];
    fs.writeFileSync(path.join(runDir, "validation.json"), JSON.stringify(entries, null, 2));
    fs.writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({ schemaVersion: 1, repoRoot: tmp, prNum, status: "completed" }),
    );

    const state = findLatestCommentFixState(store, prNum, tmp);
    assert.deepEqual(state["comment:11"], { status: "fixed", reason: "fixed it" });
    assert.deepEqual(state["finding:stale99"], {
      status: "failed",
      reason: "finding not present in latest review run",
    });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("findLatestCommentFixState surfaces ghError alongside ghResolved", () => {
  const { store, tmp } = makeStore("forge-cfs-gherror-");
  try {
    const prNum = 315;
    const runDir = path.join(store.runsDir, "pr-comment-fix", `${prNum}-s-gherror`);
    fs.mkdirSync(runDir, { recursive: true });
    const entries: ValidationFileEntry[] = [
      { targetId: "finding:aa11", verdict: "valid", reason: "ok", status: "fixed", ghError: "resolve failed: boom" },
    ];
    fs.writeFileSync(path.join(runDir, "validation.json"), JSON.stringify(entries, null, 2));
    fs.writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({ schemaVersion: 1, repoRoot: tmp, prNum, status: "completed" }),
    );

    const state = findLatestCommentFixState(store, prNum, tmp);
    assert.equal(state["finding:aa11"]?.ghError, "resolve failed: boom");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── worker pid recording (reaper precondition) ──────────────────────────────

test("recordWorkerPid stamps the pid column and metrics.workerPid", () => {
  const { store, tmp } = makeStore("forge-cf-pid-");
  try {
    const sessionId = "s-comment-fix-pr-pid-1";
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
        ...({ prNum: 1, repoRoot: tmp } as unknown as Partial<import("../src/core/db/writes.ts").SessionMetrics>),
      },
    });

    recordWorkerPid(store, sessionId, 43210);

    const row = store.db.db.prepare("SELECT pid, metrics FROM sessions WHERE id = ?").get(sessionId) as {
      pid: number | null;
      metrics: string;
    };
    assert.equal(row.pid, 43210);
    const metrics = JSON.parse(row.metrics) as { workerPid?: number; prNum?: number };
    assert.equal(metrics.workerPid, 43210);
    // json_set must preserve the keys the parent already wrote.
    assert.equal(metrics.prNum, 1);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── fixer budget config ─────────────────────────────────────────────────────

test("readFixerTimeoutMinutes defaults to 60 and accepts a lenient override", () => {
  assert.equal(readFixerTimeoutMinutes({}), 60);
  assert.equal(readFixerTimeoutMinutes({ fixerTimeoutMinutes: 25 }), 25);
  assert.equal(readFixerTimeoutMinutes({ fixerTimeoutMinutes: "15" }), 15);
  assert.equal(readFixerTimeoutMinutes({ fixerTimeoutMinutes: 0 }), 60);
  assert.equal(readFixerTimeoutMinutes({ fixerTimeoutMinutes: -3 }), 60);
  assert.equal(readFixerTimeoutMinutes({ fixerTimeoutMinutes: "soon" }), 60);
});

// ─── commitAndPush: headless git ─────────────────────────────────────────────

// Never read the operator's git config in these repos.
// Strip runner-injected git overrides (GIT_CONFIG_COUNT/KEY/VALUE,
// GIT_TERMINAL_PROMPT) so the negative controls below hold even when this
// suite runs inside Forge's own launch runner — its env exports otherwise
// make the "signing must fail" control commit succeed.
const inheritedEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([k]) => !/^GIT_CONFIG_(COUNT|KEY_|VALUE_)/.test(k) && k !== "GIT_TERMINAL_PROMPT",
  ),
);
const GIT_TEST_ENV = {
  ...inheritedEnv,
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_SYSTEM: "/dev/null",
} as Record<string, string>;

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf-8",
    env: GIT_TEST_ENV,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/** Local repo with one pushed commit and a bare `origin`. */
function initFixtureRepo(tmp: string): { repo: string; remote: string } {
  const remote = path.join(tmp, "remote.git");
  const repo = path.join(tmp, "repo");
  execFileSync("git", ["init", "--bare", remote], { env: GIT_TEST_ENV, stdio: ["pipe", "pipe", "pipe"] });
  execFileSync("git", ["init", "-b", "main", repo], { env: GIT_TEST_ENV, stdio: ["pipe", "pipe", "pipe"] });
  git(repo, "config", "user.name", "Forge Test");
  git(repo, "config", "user.email", "forge-test@example.com");
  fs.writeFileSync(path.join(repo, "file.txt"), "base\n");
  git(repo, "add", "file.txt");
  git(repo, "commit", "-m", "base");
  git(repo, "remote", "add", "origin", remote);
  git(repo, "push", "-u", "origin", "main");
  return { repo, remote };
}

test("commitAndPush commits with --no-gpg-sign even when commit.gpgsign=true would block headless", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-cf-gpg-"));
  try {
    const { repo, remote } = initFixtureRepo(tmp);
    // The 1Password trap: signing is on but the signer cannot run headlessly.
    git(repo, "config", "commit.gpgsign", "true");
    git(repo, "config", "gpg.program", "/usr/bin/false");

    fs.writeFileSync(path.join(repo, "file.txt"), "fixed\n");
    // Sanity pin: a bare `git commit` in this config fails (the signer dies).
    git(repo, "add", "file.txt");
    assert.throws(() =>
      execFileSync("git", ["-C", repo, "commit", "-m", "should fail"], {
        env: GIT_TEST_ENV,
        stdio: ["pipe", "pipe", "pipe"],
      }),
    );

    commitAndPush(repo, ["file.txt"], ["comment:11", "finding:ab12cd"], GIT_TEST_ENV);

    const subject = git(repo, "log", "-1", "--format=%s").trim();
    assert.equal(subject, "fix(review): address PR feedback (1 comment, 1 finding)");
    // And the push landed on the bare remote.
    const localSha = git(repo, "rev-parse", "main").trim();
    const remoteSha = git(remote, "rev-parse", "main").trim();
    assert.equal(localSha, remoteSha);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("commitAndPush runs git with GIT_TERMINAL_PROMPT=0 merged over the passed env", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-cf-prompt-"));
  try {
    const { repo } = initFixtureRepo(tmp);
    const marker = path.join(tmp, "prompt-env.txt");
    const hook = path.join(repo, ".git", "hooks", "pre-commit");
    fs.writeFileSync(hook, `#!/bin/sh\nprintf '%s' "$GIT_TERMINAL_PROMPT" > "${marker}"\nexit 0\n`);
    fs.chmodSync(hook, 0o755);

    fs.writeFileSync(path.join(repo, "file.txt"), "fixed\n");
    // Caller env says prompts are fine — commitAndPush must still force 0.
    commitAndPush(repo, ["file.txt"], ["comment:1"], { ...GIT_TEST_ENV, GIT_TERMINAL_PROMPT: "1" });

    assert.equal(fs.readFileSync(marker, "utf-8"), "0");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("commitAndPush kills a hung git commit at the timeout with an actionable error", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-cf-hang-"));
  try {
    const { repo } = initFixtureRepo(tmp);
    // Stand-in for a blocked signing/credential prompt: a hook that never returns.
    const hook = path.join(repo, ".git", "hooks", "pre-commit");
    fs.writeFileSync(hook, "#!/bin/sh\nsleep 30\n");
    fs.chmodSync(hook, 0o755);

    fs.writeFileSync(path.join(repo, "file.txt"), "fixed\n");
    const t0 = Date.now();
    assert.throws(
      () => commitAndPush(repo, ["file.txt"], ["comment:1"], GIT_TEST_ENV, { commit: 500 }),
      (err) =>
        err instanceof Error && /git commit timed out after \d+s/.test(err.message) && /uncommitted/.test(err.message),
    );
    assert.ok(Date.now() - t0 < 10_000, "timeout must fire well before the hook's 30s sleep");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("commitAndPush surfaces push failures with a push-manually hint (commit stays local)", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-cf-pushfail-"));
  try {
    const { repo } = initFixtureRepo(tmp);
    git(repo, "remote", "set-url", "origin", path.join(tmp, "missing", "nowhere.git"));

    fs.writeFileSync(path.join(repo, "file.txt"), "fixed\n");
    assert.throws(
      () => commitAndPush(repo, ["file.txt"], ["comment:1"], GIT_TEST_ENV),
      (err) => err instanceof Error && /git push failed/.test(err.message) && /push manually/.test(err.message),
    );
    // The commit itself landed locally before the push failed.
    const subject = git(repo, "log", "-1", "--format=%s").trim();
    assert.equal(subject, "fix(review): address PR feedback (1 comment)");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
