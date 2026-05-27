import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildPrBody, type PrBodyInput, parseAgentSummary, stripFrontmatter } from "../src/core/pr-body.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STRUCTURED_AGENT_SUMMARY = `## Summary

- **Bug fix:** unbreak Safari logins by setting cookie SameSite=None.
- **Refactor:** extract \`buildSetCookie\` helper for reuse.

## Test plan

- [x] \`bun test\` — 12 pass
- [x] Manual: tested login on Safari 17 + Chrome 120
- [ ] End-to-end: real production smoke (deferred)
`;

function baseInput(overrides?: Partial<PrBodyInput>): PrBodyInput {
  return {
    planId: "task-abc123",
    specBody: `---
id: task-abc123
repo: /tmp/repo
repoName: my-repo
createdAt: 2025-01-01T00:00:00Z
status: draft
suggestedAgent: claude
suggestedModel: claude-opus-4-7
suggestedBranch: feat/auth-login-cookie
jiraTicket: PROJ-123
---

# feat(auth): set samesite=none on login cookie

## Context

Login is broken on Safari due to a cookie SameSite issue.

## What We're Building

The login cookie now sets \`SameSite=None\` and \`Secure\`. Existing token validation is untouched.

## Acceptance Criteria

- Login works on Safari 17+
- Login still works on Chrome 120+ and Firefox 121+
- Existing JWT validation behavior is unchanged
`,
    branch: "feat/auth-login-cookie",
    baseRef: "origin/main",
    commits: [
      { sha: "abc1234", subject: "feat(auth): set SameSite=None on login cookie" },
      { sha: "def5678", subject: "test(auth): cover Safari and Chrome cases" },
    ],
    additions: 24,
    deletions: 3,
    filesChanged: 2,
    qualityResults: [
      { command: "bun test", ok: true, durationMs: 1200 },
      { command: "biome check .", ok: true, durationMs: 800 },
    ],
    agent: "claude",
    model: "claude-opus-4-7",
    jiraTicket: "PROJ-123",
    jiraUrl: "https://jira.example.com/browse/PROJ-123",
    agentSummary: STRUCTURED_AGENT_SUMMARY,
    ...overrides,
  };
}

// ─── parseAgentSummary ────────────────────────────────────────────────────────

test("parseAgentSummary extracts both sections from structured markdown", () => {
  const parsed = parseAgentSummary(STRUCTURED_AGENT_SUMMARY);
  assert.ok(parsed.summary);
  assert.ok(parsed.summary?.includes("**Bug fix:**"));
  assert.ok(parsed.testPlan);
  assert.ok(parsed.testPlan?.includes("- [x] `bun test`"));
});

test("parseAgentSummary returns null for missing sections", () => {
  const onlySummary = "## Summary\n\n- only summary, no test plan\n";
  const parsed = parseAgentSummary(onlySummary);
  assert.equal(parsed.testPlan, null);
  assert.ok(parsed.summary);
});

test("parseAgentSummary returns nulls for completely unstructured input", () => {
  const parsed = parseAgentSummary("just some prose with no sections");
  assert.equal(parsed.summary, null);
  assert.equal(parsed.testPlan, null);
});

// ─── Happy path ───────────────────────────────────────────────────────────────

test("happy path: agent-authored Summary + Test plan + collapsed details + Claude Code footer", () => {
  const body = buildPrBody(baseInput());

  // Summary uses agent bullets
  assert.ok(body.startsWith("## Summary\n\n- **Bug fix:**"), "starts with Summary section");

  // Test plan from agent
  assert.ok(body.includes("## Test plan\n\n- [x] `bun test`"), "Test plan section with checkbox");
  assert.ok(body.includes("- [ ] End-to-end:"), "Test plan unchecked item");

  // Collapsed forge run details
  assert.ok(body.includes("<details>\n<summary>🤖 forge run details</summary>"), "collapsed details block");
  assert.ok(body.includes("### Changes"), "Changes header inside details");
  assert.ok(body.includes("2 commits on `feat/auth-login-cookie` ahead of `origin/main`"), "commit count line");
  assert.ok(body.includes("+24 / −3 across 2 files"), "diff stats");
  assert.ok(body.includes("`abc1234` feat(auth): set SameSite=None"), "commit bullet");
  assert.ok(body.includes("### Quality Gates"), "Quality Gates header inside details");
  assert.ok(body.includes("✅ bun test (1.2s)"), "quality result");
  assert.ok(body.includes("### Forge spec"), "Forge spec header inside details");
  assert.ok(body.includes("# feat(auth): set samesite=none on login cookie"), "spec H1 in details");
  assert.ok(body.includes("forge: `task-abc123` · `claude` / `claude-opus-4-7`"), "forge meta line");

  // Footer
  assert.ok(body.includes("🔗 [PROJ-123](https://jira.example.com/browse/PROJ-123)"), "JIRA link");
  assert.ok(body.includes("🤖 Generated with [Claude Code](https://claude.com/claude-code)"), "Claude Code footer");
});

test("body never contains a top-level frontmatter delimiter line", () => {
  const body = buildPrBody(baseInput());
  // No standalone `---` line that would be parsed as frontmatter by markdown viewers.
  for (const line of body.split("\n")) {
    assert.notEqual(line.trim(), "---", "no bare --- line allowed");
  }
});

test("frontmatter inside specBody is stripped before rendering", () => {
  const body = buildPrBody(baseInput());
  assert.ok(!body.includes("suggestedAgent"), "no leaked frontmatter keys");
  assert.ok(!body.includes("createdAt:"), "no leaked frontmatter keys");
});

// ─── Summary fallback: Context ────────────────────────────────────────────────

test("no agentSummary → Summary falls back to Context bullets", () => {
  const body = buildPrBody(baseInput({ agentSummary: null }));
  assert.ok(body.includes("## Summary"));
  // Context: "Login is broken on Safari due to a cookie SameSite issue."
  assert.ok(body.includes("- Login is broken on Safari"), "Context split into bullet(s)");
  // Test plan should fall back too
  assert.ok(body.includes("## Test plan"));
  assert.ok(body.includes("- [ ] Login works on Safari 17+"), "AC turned into unchecked checkbox");
});

// ─── Summary fallback: What We're Building ────────────────────────────────────

test("no agentSummary, no Context → Summary falls back to What We're Building", () => {
  const input = baseInput({
    agentSummary: null,
    specBody: `---
id: task-x
---

# feat(auth): set samesite=none on login cookie

## What We're Building

The login cookie now sets \`SameSite=None\` and \`Secure\`.

## Acceptance Criteria

- Login works on Safari 17+
`,
  });
  const body = buildPrBody(input);
  assert.ok(body.includes("- The login cookie now sets"), "What We're Building used as bullets");
});

// ─── Both fallbacks: empty spec ──────────────────────────────────────────────

test("no agentSummary, no Context, no What We're Building, no Acceptance Criteria → safe placeholders", () => {
  const input = baseInput({
    agentSummary: null,
    specBody: `---
id: task-x
---

# feat(misc): some change
`,
  });
  const body = buildPrBody(input);
  assert.ok(body.includes("Spec body did not contain"), "Summary placeholder");
  assert.ok(body.includes("- [ ] Manual review of the diff"), "Test plan placeholder");
  // Should still not throw and should include the footer
  assert.ok(body.includes("🤖 Generated with [Claude Code]"), "footer present");
});

// ─── Agent Test plan only (no Summary) → mixed ───────────────────────────────

test("agent provides Test plan but not Summary → Summary falls back, Test plan from agent", () => {
  const input = baseInput({
    agentSummary: `## Test plan

- [x] manually tested
`,
  });
  const body = buildPrBody(input);
  // Summary from Context fallback
  assert.ok(body.includes("- Login is broken on Safari"));
  // Test plan from agent
  assert.ok(body.includes("- [x] manually tested"));
});

// ─── Acceptance criteria checkbox cap ────────────────────────────────────────

test("more than 8 acceptance criteria are capped at 8 in fallback Test plan", () => {
  const acs = Array.from({ length: 12 }, (_, i) => `- AC item ${i + 1}`).join("\n");
  const input = baseInput({
    agentSummary: null,
    specBody: `---
id: task-x
---

# feat(misc): change

## Acceptance Criteria

${acs}
`,
  });
  const body = buildPrBody(input);
  assert.ok(body.includes("- [ ] AC item 1"));
  assert.ok(body.includes("- [ ] AC item 8"));
  assert.ok(!body.includes("- [ ] AC item 9"), "9th AC should be dropped");
});

// ─── Quality gates section ────────────────────────────────────────────────────

test("empty qualityResults → Quality Gates section omitted from details", () => {
  const body = buildPrBody(baseInput({ qualityResults: [] }));
  assert.ok(!body.includes("### Quality Gates"));
});

test("failed quality result shows ❌", () => {
  const body = buildPrBody(
    baseInput({
      qualityResults: [
        { command: "biome check .", ok: false, durationMs: 800 },
        { command: "bun test", ok: true, durationMs: 5000 },
      ],
    }),
  );
  assert.ok(body.includes("❌ biome check . (0.8s)"));
  assert.ok(body.includes("✅ bun test (5.0s)"));
});

// ─── Commits ─────────────────────────────────────────────────────────────────

test("single commit uses singular wording", () => {
  const body = buildPrBody(
    baseInput({
      commits: [{ sha: "aaa1111", subject: "fix(x): single change" }],
      filesChanged: 1,
    }),
  );
  assert.ok(body.includes("1 commit on"));
  assert.ok(body.includes("across 1 file"));
  assert.ok(!body.includes("1 commits"));
  assert.ok(!body.includes("1 files"));
});

test("12 commits → first 10 inline, remaining 2 in nested <details>", () => {
  const commits = Array.from({ length: 12 }, (_, i) => ({
    sha: `sha${String(i).padStart(4, "0")}`,
    subject: `commit message ${i}`,
  }));
  const body = buildPrBody(baseInput({ commits }));
  assert.ok(body.includes("`sha0000` commit message 0"));
  assert.ok(body.includes("`sha0009` commit message 9"));
  assert.ok(body.includes("<summary>2 more commits</summary>"));
  assert.ok(body.includes("`sha0010` commit message 10"));
  assert.ok(body.includes("`sha0011` commit message 11"));
});

// ─── JIRA / footer ───────────────────────────────────────────────────────────

test("jiraTicket without url → bare key in footer", () => {
  const body = buildPrBody(baseInput({ jiraUrl: null }));
  assert.ok(body.includes("🔗 PROJ-123"), "bare JIRA key");
  assert.ok(!body.includes("[PROJ-123]"), "no markdown link");
});

test("no jira → only Claude Code line in footer", () => {
  const body = buildPrBody(baseInput({ jiraTicket: null, jiraUrl: null }));
  assert.ok(!body.includes("🔗"));
  // Should still have Claude Code line
  assert.ok(body.endsWith("🤖 Generated with [Claude Code](https://claude.com/claude-code)"));
});

// ─── Idempotency ─────────────────────────────────────────────────────────────

test("frontmatter stripping is idempotent", () => {
  const input = baseInput();
  const body1 = buildPrBody(input);
  const body2 = buildPrBody({ ...input, specBody: stripFrontmatter(input.specBody) });
  assert.equal(body1, body2);
});
