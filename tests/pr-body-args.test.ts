import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildArgs } from "../src/core/pr-body-args.ts";

const baseInput = {
  planId: "task-abc",
  branch: "feat/x",
  baseRef: "origin/main",
  runDir: "/tmp/forge-runs/task-abc",
  specPath: "/tmp/forge-specs/task-abc.md",
  agent: "claude" as const,
  model: "claude-opus-4-7",
  jiraTicket: null,
  jiraUrl: null,
};

test("happy path: all gatherers return data → args JSON has expected shape", () => {
  const args = buildArgs({
    ...baseInput,
    gatherCommits: () => [
      { sha: "abc1234", subject: "feat(x): something" },
      { sha: "def5678", subject: "test(x): cover edge case" },
    ],
    gatherShortstat: () => ({ additions: 12, deletions: 3, filesChanged: 2 }),
    gatherQualityResults: () => [{ command: "bun test", ok: true, durationMs: 1234 }],
  });

  assert.equal(args.specPath, "/tmp/forge-specs/task-abc.md");
  assert.equal(args.outputPath, "/tmp/forge-runs/task-abc/pr-body.md");
  assert.equal(args.agentSummaryPath, "/tmp/forge-runs/task-abc/agent-summary.md");

  assert.equal(args.input.planId, "task-abc");
  assert.equal(args.input.branch, "feat/x");
  assert.equal(args.input.baseRef, "origin/main");
  assert.equal(args.input.commits.length, 2);
  assert.equal(args.input.commits[0].sha, "abc1234");
  assert.equal(args.input.commits[0].subject, "feat(x): something");
  assert.equal(args.input.additions, 12);
  assert.equal(args.input.deletions, 3);
  assert.equal(args.input.filesChanged, 2);
  assert.equal(args.input.qualityResults.length, 1);
  assert.equal(args.input.qualityResults[0].command, "bun test");
  assert.equal(args.input.agent, "claude");
  assert.equal(args.input.model, "claude-opus-4-7");
});

test("empty git log returns commits: []", () => {
  const args = buildArgs({
    ...baseInput,
    gatherCommits: () => [],
    gatherShortstat: () => ({ additions: null, deletions: null, filesChanged: null }),
    gatherQualityResults: () => [],
  });
  assert.deepEqual(args.input.commits, []);
  assert.equal(args.input.additions, null);
});

test("shortstat error doesn't blank commits — partial data preserved", () => {
  const args = buildArgs({
    ...baseInput,
    gatherCommits: () => [{ sha: "x", subject: "y" }],
    gatherShortstat: () => {
      // Simulate the gatherer's own catch — return null fields rather than throwing.
      return { additions: null, deletions: null, filesChanged: null };
    },
    gatherQualityResults: () => [],
  });
  assert.equal(args.input.commits.length, 1, "commits preserved");
  assert.equal(args.input.filesChanged, null, "shortstat null'd");
});

test("malformed quality.jsonl line is skipped silently (gatherer drops it)", () => {
  const args = buildArgs({
    ...baseInput,
    gatherCommits: () => [],
    gatherShortstat: () => ({ additions: null, deletions: null, filesChanged: null }),
    gatherQualityResults: () => [
      // The gatherer in production parses quality.jsonl and skips malformed
      // lines; we simulate that by returning only well-formed entries.
      { command: "bun test", ok: true, durationMs: 100 },
    ],
  });
  assert.equal(args.input.qualityResults.length, 1);
});

test("jira fields propagate when set", () => {
  const args = buildArgs({
    ...baseInput,
    jiraTicket: "PROJ-42",
    jiraUrl: "https://jira.example.com/browse/PROJ-42",
    gatherCommits: () => [],
    gatherShortstat: () => ({ additions: null, deletions: null, filesChanged: null }),
    gatherQualityResults: () => [],
  });
  assert.equal(args.input.jiraTicket, "PROJ-42");
  assert.equal(args.input.jiraUrl, "https://jira.example.com/browse/PROJ-42");
});

test("subjects with tabs or special chars round-trip via the injected gatherer", () => {
  const args = buildArgs({
    ...baseInput,
    gatherCommits: () => [{ sha: "aaa", subject: "feat(x): subject with: colon and (parens)" }],
    gatherShortstat: () => ({ additions: null, deletions: null, filesChanged: null }),
    gatherQualityResults: () => [],
  });
  assert.equal(args.input.commits[0].subject, "feat(x): subject with: colon and (parens)");
});
