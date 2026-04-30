import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildPrBody, type PrBodyInput, stripFrontmatter } from "../src/pr-body.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function baseInput(overrides?: Partial<PrBodyInput>): PrBodyInput {
  return {
    taskId: "task-abc123",
    specBody: `---
id: task-abc123
repo: /tmp/repo
repoName: my-repo
createdAt: 2025-01-01T00:00:00Z
status: draft
suggestedAgent: pi
suggestedModel: claude-opus-4-6
suggestedBranch: feat/test
jiraTicket: PROJ-123
---

# Add caching layer

## Context

The app is slow because every request hits the database. We need a caching
layer to reduce latency by 80%. This is a critical performance issue.

## What We're Building

A Redis-based caching middleware that sits between the API handler and the
database layer. Cache invalidation uses TTL with tag-based purging.

## Acceptance Criteria

- Cache hit returns in <5ms
- Cache miss falls through to DB transparently
`,
    branch: "feat/test",
    baseRef: "origin/main",
    commits: [
      { sha: "abc1234", subject: "feat(cache): add Redis middleware" },
      { sha: "def5678", subject: "test(cache): add integration tests" },
    ],
    additions: 245,
    deletions: 12,
    filesChanged: 8,
    qualityResults: [
      { command: "npm run lint", ok: true, durationMs: 1200 },
      { command: "npm run test", ok: true, durationMs: 8400 },
    ],
    agent: "pi",
    model: "claude-opus-4-6",
    jiraTicket: "PROJ-123",
    jiraUrl: "https://jira.example.com/browse/PROJ-123",
    agentSummary:
      "Added a Redis caching middleware between the API handlers and the database layer. Cache entries use a 5-minute TTL with tag-based invalidation. Integration tests cover hit, miss, and invalidation paths.",
    ...overrides,
  };
}

// ─── Happy path ───────────────────────────────────────────────────────────────

test("happy path: all sections present with agent summary, commits, quality, JIRA link", () => {
  const body = buildPrBody(baseInput());

  // Summary uses agentSummary
  assert.ok(body.includes("## Summary"), "missing Summary header");
  assert.ok(body.includes("Redis caching middleware"), "summary content missing");

  // Changes section
  assert.ok(body.includes("## Changes"), "missing Changes header");
  assert.ok(body.includes("2 commits on `feat/test` ahead of `origin/main`"), "commit count line");
  assert.ok(body.includes("+245 / −12 across 8 files"), "diff stats");
  assert.ok(body.includes("`abc1234` feat(cache): add Redis middleware"), "commit bullet");
  assert.ok(body.includes("`def5678` test(cache): add integration tests"), "commit bullet 2");

  // Quality Gates
  assert.ok(body.includes("## Quality Gates"), "missing Quality Gates header");
  assert.ok(body.includes("✅ npm run lint (1.2s)"), "lint result");
  assert.ok(body.includes("✅ npm run test (8.4s)"), "test result");

  // Forge Spec details
  assert.ok(body.includes("<summary>📋 Forge spec</summary>"), "spec details summary");
  assert.ok(body.includes("# Add caching layer"), "spec title in details");
  assert.ok(!body.includes("suggestedAgent"), "frontmatter should be stripped from details");

  // Footer with JIRA link
  assert.ok(body.includes("🔗 [PROJ-123](https://jira.example.com/browse/PROJ-123)"), "JIRA markdown link in footer");
  assert.ok(body.includes("🤖 forge `task-abc123`"), "forge task id in footer");
  assert.ok(body.includes("`pi` / `claude-opus-4-6`"), "agent/model in footer");
});

// ─── Summary fallback: Context ────────────────────────────────────────────────

test("no agent summary, with Context section → Summary uses Context", () => {
  const body = buildPrBody(baseInput({ agentSummary: null }));
  assert.ok(body.includes("## Summary"), "missing Summary header");
  assert.ok(body.includes("app is slow"), "should use Context section content");
});

// ─── Summary fallback: What We're Building ────────────────────────────────────

test("no agent summary, no Context, with What We're Building → uses What We're Building", () => {
  const input = baseInput({
    agentSummary: null,
    specBody: `---
id: task-abc123
---

# Title

## What We're Building

A Redis-based caching middleware that sits between the API handler and the
database layer. Cache invalidation uses TTL with tag-based purging.
`,
  });
  const body = buildPrBody(input);
  assert.ok(body.includes("Redis-based caching middleware"), "should use What We're Building");
});

// ─── Empty spec body ──────────────────────────────────────────────────────────

test("empty spec body and no agent summary → _No spec body available._", () => {
  const input = baseInput({
    agentSummary: null,
    specBody: `---
id: task-abc123
---
`,
  });
  const body = buildPrBody(input);
  assert.ok(body.includes("_No spec body available._"), "should show fallback");
});

// ─── Long summary truncation ─────────────────────────────────────────────────

test("long summary source is truncated to ≤6 sentences with trailing …", () => {
  const longSummary = Array(10).fill("This is a moderately long sentence about the feature.").join(" ");
  const body = buildPrBody(baseInput({ agentSummary: longSummary }));

  // Extract Summary section content
  const summaryMatch = body.match(/## Summary\n\n([\s\S]*?)(?:\n\n---\n\n)/);
  assert.ok(summaryMatch, "summary section should be extractable");
  const summaryText = summaryMatch?.[1] ?? "";

  // Count sentences (ending with .)
  const sentenceCount = (summaryText.match(/\./g) || []).length;
  assert.ok(sentenceCount <= 6, `should have ≤6 sentences, got ${sentenceCount}`);
  assert.ok(summaryText.endsWith("…"), "should end with … when truncated");
});

test("long summary truncated by char limit (≤600 chars)", () => {
  // 10 sentences, each ~100 chars — total ~1000, should be truncated by char limit
  const longSummary = Array(10)
    .fill(
      "This is a very long sentence that goes on and on about implementation details and other things that are quite verbose indeed.",
    )
    .join(" ");
  const body = buildPrBody(baseInput({ agentSummary: longSummary }));

  const summaryMatch = body.match(/## Summary\n\n([\s\S]*?)(?:\n\n---\n\n)/);
  assert.ok(summaryMatch, "summary section should be extractable");
  const summaryText = summaryMatch?.[1] ?? "";
  // The text itself (minus the …) should be ≤600
  assert.ok(summaryText.length <= 610, `should be ≤610 chars (with …), got ${summaryText.length}`);
  assert.ok(summaryText.endsWith("…"), "should end with …");
});

// ─── 12 commits: 10 visible, 2 in details ────────────────────────────────────

test("12 commits → first 10 inline, remaining 2 inside <details>", () => {
  const commits = Array.from({ length: 12 }, (_, i) => ({
    sha: `sha${String(i).padStart(4, "0")}`,
    subject: `commit message ${i}`,
  }));
  const body = buildPrBody(baseInput({ commits }));

  assert.ok(body.includes("`sha0000` commit message 0"), "first commit visible");
  assert.ok(body.includes("`sha0009` commit message 9"), "10th commit visible");
  assert.ok(body.includes("<summary>2 more commits</summary>"), "details summary for overflow");
  assert.ok(body.includes("`sha0010` commit message 10"), "11th commit in details");
  assert.ok(body.includes("`sha0011` commit message 11"), "12th commit in details");
});

// ─── Empty quality results ────────────────────────────────────────────────────

test("qualityResults empty → Quality Gates section is omitted", () => {
  const body = buildPrBody(baseInput({ qualityResults: [] }));
  assert.ok(!body.includes("## Quality Gates"), "Quality Gates should be omitted");
});

// ─── JIRA ticket without URL ──────────────────────────────────────────────────

test("jiraTicket set, jiraUrl null → footer renders bare key with no link", () => {
  const body = buildPrBody(baseInput({ jiraUrl: null }));
  assert.ok(body.includes("🔗 PROJ-123 ·"), "bare JIRA key in footer");
  assert.ok(!body.includes("[PROJ-123]"), "no markdown link");
});

// ─── No JIRA at all ──────────────────────────────────────────────────────────

test("jiraTicket null → JIRA segment omitted from footer entirely", () => {
  const body = buildPrBody(baseInput({ jiraTicket: null, jiraUrl: null }));
  assert.ok(!body.includes("🔗"), "no JIRA segment");
  assert.ok(body.includes("🤖 forge `task-abc123`"), "forge id still present");
});

// ─── Frontmatter idempotently stripped ────────────────────────────────────────

test("frontmatter in specBody is idempotently stripped", () => {
  const input = baseInput();
  const body1 = buildPrBody(input);
  // Run strip twice on the specBody — should yield the same PR body
  const body2 = buildPrBody({ ...input, specBody: stripFrontmatter(input.specBody) });
  assert.equal(body1, body2, "stripping frontmatter twice should be idempotent");
});

// ─── Snapshot test ────────────────────────────────────────────────────────────

test("deterministic snapshot: fixed input produces exact expected output", () => {
  const input: PrBodyInput = {
    taskId: "task-snap1",
    specBody: `---
id: task-snap1
repo: /tmp/r
---

# Fix login

## Context

Login is broken on Safari due to a cookie SameSite issue.

## Acceptance Criteria

- Login works on Safari 17+
`,
    branch: "fix/login",
    baseRef: "origin/main",
    commits: [{ sha: "aaa1111", subject: "fix(auth): set SameSite=None for login cookie" }],
    additions: 3,
    deletions: 1,
    filesChanged: 1,
    qualityResults: [{ command: "npm run test", ok: true, durationMs: 2300 }],
    agent: "claude",
    model: "claude-sonnet-4-6",
    jiraTicket: "AUTH-42",
    jiraUrl: "https://jira.example.com/browse/AUTH-42",
    agentSummary: null,
  };

  const expected = `## Summary

Login is broken on Safari due to a cookie SameSite issue.

---

## Changes

- 1 commit on \`fix/login\` ahead of \`origin/main\`
- +3 / −1 across 1 file

- \`aaa1111\` fix(auth): set SameSite=None for login cookie

---

## Quality Gates

- ✅ npm run test (2.3s)

---

<details>
<summary>📋 Forge spec</summary>

# Fix login

## Context

Login is broken on Safari due to a cookie SameSite issue.

## Acceptance Criteria

- Login works on Safari 17+

</details>

---

🔗 [AUTH-42](https://jira.example.com/browse/AUTH-42) · 🤖 forge \`task-snap1\` · \`claude\` / \`claude-sonnet-4-6\``;

  const actual = buildPrBody(input);
  assert.equal(actual, expected);
});

// ─── Single commit wording ────────────────────────────────────────────────────

test("single commit uses singular 'commit' not 'commits'", () => {
  const body = buildPrBody(
    baseInput({
      commits: [{ sha: "abc1234", subject: "feat: single change" }],
    }),
  );
  assert.ok(body.includes("1 commit on"), "singular commit");
  assert.ok(!body.includes("1 commits"), "no plural for 1");
});

// ─── Failed quality result ────────────────────────────────────────────────────

test("failed quality result shows ❌", () => {
  const body = buildPrBody(
    baseInput({
      qualityResults: [
        { command: "npm run lint", ok: false, durationMs: 800 },
        { command: "npm run test", ok: true, durationMs: 5000 },
      ],
    }),
  );
  assert.ok(body.includes("❌ npm run lint (0.8s)"), "failed lint");
  assert.ok(body.includes("✅ npm run test (5.0s)"), "passed test");
});
