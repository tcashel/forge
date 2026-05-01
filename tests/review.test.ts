import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildReviewerPrompt } from "../src/core/reviewer.ts";

// The CLI command (`forge review`) is a thin wrapper around buildReviewerPrompt.
// We unit-test the composition layer here; the gh / spec-lookup glue is
// covered manually per the plan's verification matrix (it shells out to gh).

test("buildReviewerPrompt includes PR header and section markers", () => {
  const out = buildReviewerPrompt({
    prNum: 42,
    repoName: "tcashel/forge",
    skillsDir: "/tmp/nonexistent-skills",
    prInfoJson: '{"number":42,"title":"x"}',
    ciChecks: "all green",
    diff: "diff --git a/x b/x",
    linkedSpec: null,
  });
  assert.match(out, /Please review PR #42 in tcashel\/forge\./);
  assert.match(out, /## PR metadata/);
  assert.match(out, /## CI checks/);
  assert.match(out, /## Linked Forge spec/);
  assert.match(out, /no forge spec linked to this branch/);
  assert.match(out, /## Diff/);
  assert.match(out, /diff --git a\/x b\/x/);
});

test("buildReviewerPrompt embeds the linked spec body when provided", () => {
  const out = buildReviewerPrompt({
    prNum: 7,
    repoName: "tcashel/forge",
    skillsDir: "/tmp/nonexistent-skills",
    prInfoJson: "{}",
    ciChecks: "",
    diff: "",
    linkedSpec: "# Spec body\n\nSome content.",
  });
  assert.match(out, /## Linked Forge spec/);
  assert.match(out, /# Spec body/);
  assert.match(out, /Some content\./);
  assert.ok(!out.includes("no forge spec linked"), "should not show fallback when spec is provided");
});

test("buildReviewerPrompt truncates very large diffs and notes the truncation", () => {
  const bigDiff = `${"x".repeat(70_000)}`;
  const out = buildReviewerPrompt({
    prNum: 1,
    repoName: "r",
    skillsDir: "/tmp/x",
    prInfoJson: "{}",
    ciChecks: "",
    diff: bigDiff,
    linkedSpec: null,
  });
  assert.match(out, /diff truncated for context budget/);
});
