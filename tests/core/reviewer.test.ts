import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { test } from "node:test";
import {
  buildReviewerPrompt,
  extractLastForgeReviewBlock,
  parseForgeReviewFindings,
  parseForgeReviewVerdict,
} from "../../src/core/reviewer.ts";

const fixturesDir = path.join(import.meta.dirname, "..", "fixtures", "reviews");

function load(name: string): string {
  return fs.readFileSync(path.join(fixturesDir, name), "utf-8");
}

test("parseForgeReviewFindings extracts all four severities with crisp Where lines", () => {
  const findings = parseForgeReviewFindings(load("all-severities.md"));
  assert.equal(findings.length, 4);
  const severities = findings.map((f) => f.severity);
  assert.deepEqual(severities, ["BLOCKER", "HIGH", "MEDIUM", "LOW"]);

  const blocker = findings[0];
  assert.equal(blocker.title, "Synchronous DB call inside the request thread");
  assert.equal(blocker.file, "src/cli/cmd/serve.ts");
  assert.equal(blocker.lineStart, 120);
  assert.equal(blocker.lineEnd, 120);
  assert.match(blocker.why, /Blocks the event loop/);
  assert.match(blocker.fix, /worker pool/);
  assert.match(blocker.evidence ?? "", /db\.prepare/);

  const high = findings[1];
  assert.equal(high.lineStart, 200);
  assert.equal(high.lineEnd, 215);

  // Stable id is content-derived: same file/line/title → same id.
  const again = parseForgeReviewFindings(load("all-severities.md"));
  assert.equal(again[0].id, blocker.id);
});

test("parseForgeReviewFindings tolerates findings without a line range", () => {
  const findings = parseForgeReviewFindings(load("no-line-range.md"));
  assert.equal(findings.length, 1);
  const [f] = findings;
  assert.equal(f.file, "CHANGELOG.md");
  assert.equal(f.lineStart, 0);
  assert.equal(f.lineEnd, 0);
  assert.equal(f.severity, "HIGH");
});

test("parseForgeReviewFindings reads a multi-line range and preserves evidence", () => {
  const findings = parseForgeReviewFindings(load("multi-line-range.md"));
  assert.equal(findings.length, 1);
  const [f] = findings;
  assert.equal(f.file, "src/cli/cmd/serve.ts");
  assert.equal(f.lineStart, 912);
  assert.equal(f.lineEnd, 927);
  assert.match(f.evidence ?? "", /for \(let i = 1;/);
});

test("parseForgeReviewFindings anchors a multi-file Where line on the first path", () => {
  // Regression: a Where line listing several backtick-quoted files used to
  // fail the anchor regex entirely, silently dropping the whole finding.
  const findings = parseForgeReviewFindings(load("multi-file-where.md"));
  assert.equal(findings.length, 1);
  const [f] = findings;
  assert.equal(f.severity, "HIGH");
  assert.equal(f.file, "src/core/pricing.ts");
  assert.equal(f.lineStart, 67);
  assert.equal(f.lineEnd, 76);
  assert.match(f.fix, /estimateCost/);
});

test("parseForgeReviewFindings returns [] on malformed input", () => {
  const findings = parseForgeReviewFindings(load("malformed.md"));
  assert.deepEqual(findings, []);
  // Also: empty string.
  assert.deepEqual(parseForgeReviewFindings(""), []);
  // Also: a block with no Findings heading at all.
  assert.deepEqual(parseForgeReviewFindings("## Verdict\napprove\n\n## Summary\nlooks good."), []);
});

test("parseForgeReviewFindings skips Spec Adherence and unknown severities", () => {
  const block = `## Verdict
request-changes

## Findings

### [BLOCKER] real finding
**Where:** \`src/a.ts:1\`
**Why:** because
**Fix:** patch

### [INFO] not a real severity
**Where:** \`src/b.ts:2\`
**Why:** anything
**Fix:** anything

## Spec Adherence

### [BLOCKER] this looks like a finding but lives under Spec Adherence
**Where:** \`src/c.ts:3\`
**Why:** parser must skip this section entirely
**Fix:** do not include
`;
  const findings = parseForgeReviewFindings(block);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].file, "src/a.ts");
});

test("parseForgeReviewFindings reads an anonymized real review without throwing", () => {
  const findings = parseForgeReviewFindings(load("anonymized-real.md"));
  assert.ok(findings.length >= 3, "should pull every per-finding subsection");
  assert.ok(
    findings.every((f) => ["BLOCKER", "HIGH", "MEDIUM", "LOW"].includes(f.severity)),
    "every finding has a valid severity",
  );
});

test("extractLastForgeReviewBlock pulls the LAST fenced block (codex echo case)", () => {
  const fixture = path.join(import.meta.dirname, "..", "fixtures", "reviewer", "codex-echo-with-template.md");
  const raw = fs.readFileSync(fixture, "utf-8");
  const block = extractLastForgeReviewBlock(raw);
  assert.ok(block, "should find a fenced block");
  assert.match(block ?? "", /Example blocker finding/);
  assert.ok(
    !(block ?? "").includes("<approve | request-changes | block>"),
    "must skip the echoed template's placeholder verdict",
  );

  // Once extracted, the parser turns it into real findings.
  const findings = parseForgeReviewFindings(block ?? "");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, "BLOCKER");
  assert.equal(findings[0].file, "src/example.ts");
  assert.equal(findings[0].lineStart, 42);
});

test("extractLastForgeReviewBlock returns null when no block is present", () => {
  assert.equal(extractLastForgeReviewBlock("no fenced block here"), null);
  assert.equal(extractLastForgeReviewBlock(""), null);
});

test("extractLastForgeReviewBlock keeps nested ```text Evidence fences", () => {
  // Regression: the old non-greedy `(.*?)\n``` regex stopped at the FIRST
  // inner fence — the ```text under **Evidence:** — truncating the review
  // right after `**Evidence:**` and dropping every Why/Fix/later section.
  const raw = [
    "```forge-review",
    "## Verdict",
    "request-changes",
    "",
    "## Summary",
    "CI is red.",
    "",
    "## Findings",
    "",
    "### [BLOCKER] CI checks are failing",
    "**Where:** `GitHub Actions checks for PR #1`",
    "**Evidence:**",
    "```text",
    "biome    FAILURE",
    "bun-test FAILURE",
    "```",
    "**Why:** required checks must be green.",
    "**Fix:** rerun the failing jobs.",
    "",
    "## What I Verified",
    "- [x] Read every changed file",
    "```",
    "tokens used: 1234",
  ].join("\n");

  const block = extractLastForgeReviewBlock(raw);
  assert.ok(block, "should find a block");
  assert.match(block ?? "", /## What I Verified/, "must not truncate at the Evidence fence");
  assert.match(block ?? "", /biome {4}FAILURE/, "nested evidence body survives");

  const findings = parseForgeReviewFindings(block ?? "");
  assert.equal(findings.length, 1);
  const [f] = findings;
  assert.match(f.evidence ?? "", /biome {4}FAILURE/);
  assert.match(f.why, /required checks must be green/);
  assert.match(f.fix, /rerun the failing jobs/);
  assert.equal(parseForgeReviewVerdict(block ?? ""), "request-changes");
});

test("extractLastForgeReviewBlock survives bare ``` evidence openers (no truncation)", () => {
  // Regression (pub-bare-fence-truncates-findings): a bare ``` line OPENING an
  // evidence snippet used to be classified as the outer closer, truncating the
  // block mid-finding and silently dropping every later finding.
  const raw = [
    "```forge-review",
    "## Verdict",
    "request-changes",
    "",
    "## Findings",
    "",
    "### [HIGH] first finding",
    "**Where:** `src/a.ts:10`",
    "**Evidence:**",
    "```", // bare OPENER — must not close the forge-review block
    "const x = 1;",
    "```",
    "**Why:** first why.",
    "**Fix:** first fix.",
    "",
    "### [MEDIUM] second finding",
    "**Where:** `src/b.ts:20`",
    "**Why:** second why.",
    "**Fix:** second fix.",
    "",
    "## What I Skipped",
    "- nothing",
    "```",
    "tokens used: 99",
  ].join("\n");

  const block = extractLastForgeReviewBlock(raw);
  assert.ok(block, "should find a block");
  assert.match(block ?? "", /second finding/, "must not truncate at the bare evidence opener");
  assert.match(block ?? "", /## What I Skipped/);
  assert.ok(!(block ?? "").includes("tokens used"), "trailing chatter stays outside the block");

  const findings = parseForgeReviewFindings(block ?? "");
  assert.equal(findings.length, 2, "both findings survive the bare fence");
  assert.match(findings[0].evidence ?? "", /const x = 1;/);
  assert.match(findings[0].why, /first why/);
  assert.match(findings[0].fix, /first fix/);
  assert.match(findings[1].why, /second why/);
});

test("extractLastForgeReviewBlock handles mixed bare and info-string nested fences", () => {
  const raw = [
    "```forge-review",
    "## Verdict",
    "block",
    "",
    "## Findings",
    "",
    "### [BLOCKER] mixed fences",
    "**Where:** `src/c.ts:5`",
    "**Evidence:**",
    "```",
    "bare snippet",
    "```",
    "**Why:** because.",
    "**Fix:**",
    "```diff",
    "-old",
    "+new",
    "```",
    "",
    "## What I Verified",
    "- [x] everything",
    "```",
  ].join("\n");
  const block = extractLastForgeReviewBlock(raw);
  assert.ok(block);
  assert.match(block ?? "", /## What I Verified/);
  const findings = parseForgeReviewFindings(block ?? "");
  assert.equal(findings.length, 1);
  assert.match(findings[0].evidence ?? "", /bare snippet/);
  assert.match(findings[0].fix, /\+new/);
});

test("extractLastForgeReviewBlock tolerates an unterminated inner fence", () => {
  // The evidence fence opens with ```text and never closes — the block runs
  // to EOF rather than returning null or dropping the captured findings.
  const raw = [
    "```forge-review",
    "## Verdict",
    "request-changes",
    "",
    "## Findings",
    "",
    "### [HIGH] unterminated evidence",
    "**Where:** `src/d.ts:1`",
    "**Why:** matters.",
    "**Fix:** patch it.",
    "**Evidence:**",
    "```text",
    "snippet that never closes",
  ].join("\n");
  const block = extractLastForgeReviewBlock(raw);
  assert.ok(block, "unterminated block still extracts");
  const findings = parseForgeReviewFindings(block ?? "");
  assert.equal(findings.length, 1);
  assert.match(findings[0].why, /matters/);
});

test("extractLastForgeReviewBlock still picks the real block when echoed prompt chatter contains fences", () => {
  // Codex echoes the whole prompt — template forge-review block followed by
  // ```json metadata / bare CI fences / ```diff — before the real review. A
  // misjudged bare fence in the echo must not swallow the real block.
  const raw = [
    "```forge-review",
    "## Verdict",
    "<approve | request-changes | block>",
    "```",
    "",
    "## PR metadata",
    "```json",
    '{"number": 7}',
    "```",
    "## CI checks",
    "```",
    "all green",
    "```",
    "## Diff",
    "```diff",
    "+x",
    "```",
    "",
    "codex",
    "```forge-review",
    "## Verdict",
    "approve",
    "",
    "## Summary",
    "The real review.",
    "```",
  ].join("\n");
  const block = extractLastForgeReviewBlock(raw);
  assert.ok(block);
  assert.match(block ?? "", /The real review/);
  assert.ok(!(block ?? "").includes("<approve | request-changes | block>"), "template echo must not win");
  assert.equal(parseForgeReviewVerdict(block ?? ""), "approve");
});

test("parseForgeReviewVerdict reads the verdict line and rejects junk", () => {
  assert.equal(parseForgeReviewVerdict("## Verdict\napprove\n\n## Summary\nok"), "approve");
  assert.equal(parseForgeReviewVerdict("## Verdict\nrequest-changes\n"), "request-changes");
  assert.equal(parseForgeReviewVerdict("##  Verdict \n  block\n"), "block");
  assert.equal(parseForgeReviewVerdict("## Verdict\nmaybe\n"), null);
  assert.equal(parseForgeReviewVerdict("## Summary\nno verdict heading"), null);
  assert.equal(parseForgeReviewVerdict(""), null);
});

test("buildReviewerPrompt feeds prior findings back with a reuse-titles instruction", () => {
  const prompt = buildReviewerPrompt({
    prNum: 7,
    repoName: "repo",
    skillsDir: "/nonexistent",
    prInfoJson: "{}",
    ciChecks: "",
    diff: "",
    linkedSpec: null,
    priorFindings: [
      {
        id: "aa11",
        severity: "HIGH",
        title: "Average calculation drops the last duration",
        file: "scripts/live-review-target.ts",
        lineStart: 6,
        lineEnd: 12,
        evidence: null,
        why: "",
        fix: "",
      },
    ],
  });
  assert.ok(prompt.includes("## Previously reported findings"));
  assert.ok(prompt.includes("SAME title and file:line"));
  assert.ok(prompt.includes("[HIGH] Average calculation drops the last duration (scripts/live-review-target.ts:6)"));
});

test("buildReviewerPrompt omits the prior-findings section when there are none", () => {
  const prompt = buildReviewerPrompt({
    prNum: 7,
    repoName: "repo",
    skillsDir: "/nonexistent",
    prInfoJson: "{}",
    ciChecks: "",
    diff: "",
    linkedSpec: null,
    priorFindings: [],
  });
  assert.ok(!prompt.includes("Previously reported findings"));
});
