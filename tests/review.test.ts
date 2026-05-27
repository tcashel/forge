import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
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

// Paired with the embedded python in `src/core/launch.ts` (the reviewer
// verdict-extractor). If either side changes, update both — duplication is
// accepted here because the prod code is a python heredoc inside a bash
// runner script and can't be imported directly.
const VERDICT_PARSER_PY = `
import re, sys, json
raw = open(sys.argv[1]).read()
matches = list(re.finditer(r'\`\`\`forge-review\\s*\\n(.*?)\\n\`\`\`', raw, re.DOTALL))
if not matches:
    sys.exit(2)
block = matches[-1].group(1)
open(sys.argv[2], 'w').write(block)
verdict_match = re.search(r'^##\\s*Verdict\\s*\\n\\s*(\\S+)', block, re.MULTILINE)
verdict = verdict_match.group(1).strip().lower() if verdict_match else None
if verdict not in ('approve', 'request-changes', 'block'):
    verdict = None
print(json.dumps(verdict))
`;

function runVerdictParser(rawPath: string): { verdict: string | null; reviewBody: string; exitCode: number } {
  const reviewPath = path.join(
    os.tmpdir(),
    `forge-test-review-${Date.now()}-${Math.random().toString(36).slice(2)}.md`,
  );
  try {
    const stdout = execFileSync("python3", ["-c", VERDICT_PARSER_PY, rawPath, reviewPath], {
      encoding: "utf-8",
    });
    const verdict = JSON.parse(stdout.trim()) as string | null;
    const reviewBody = fs.existsSync(reviewPath) ? fs.readFileSync(reviewPath, "utf-8") : "";
    return { verdict, reviewBody, exitCode: 0 };
  } catch (e: unknown) {
    const err = e as { status?: number };
    return { verdict: null, reviewBody: "", exitCode: err.status ?? 1 };
  } finally {
    if (fs.existsSync(reviewPath)) fs.rmSync(reviewPath);
  }
}

test("verdict parser ignores template echo and extracts the real verdict (codex case)", () => {
  const fixture = path.join(import.meta.dirname, "fixtures", "reviewer", "codex-echo-with-template.md");
  const { verdict, reviewBody, exitCode } = runVerdictParser(fixture);
  assert.equal(exitCode, 0);
  assert.equal(verdict, "block", "should pick the real review block, not the template echo");
  assert.match(reviewBody, /Example blocker finding/, "extracted block is the real one");
  assert.ok(
    !reviewBody.includes("<approve | request-changes | block>"),
    "extracted block should not be the placeholder template",
  );
});

test("verdict parser exits 2 when no forge-review block is present", () => {
  const tmp = path.join(os.tmpdir(), `forge-test-noblock-${Date.now()}.md`);
  fs.writeFileSync(tmp, "Some reviewer output without any fenced block.\n");
  try {
    const { exitCode } = runVerdictParser(tmp);
    assert.equal(exitCode, 2);
  } finally {
    fs.rmSync(tmp);
  }
});
