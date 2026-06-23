/**
 * Anchoring — comments and findings resolve to the correct diff position
 * against a fixed fixture, so the inline widgets and the rail land on the
 * same known lines. These are the helpers exported from DiffPane that feed
 * both the rail and the per-line widget `extendData`.
 */
import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { anchorFindings, anchorThreads, groupIntoThreads } from "../../../src/web/components/review/DiffPane.tsx";
import { parseUnifiedDiff } from "../../../src/web/lib/diff.ts";
import type { ForgeFinding, InlinePrComment } from "../../../src/web/types.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE = fs.readFileSync(path.join(HERE, "..", "..", "fixtures", "diff", "review-sample.diff"), "utf-8");
const DIFF = parseUnifiedDiff(SAMPLE);

function comment(over: Partial<InlinePrComment>): InlinePrComment {
  return {
    id: 1,
    user: "octocat",
    body: "looks off",
    path: "src/app.ts",
    position: null,
    originalPosition: null,
    line: null,
    originalLine: null,
    side: "RIGHT",
    startLine: null,
    startSide: null,
    inReplyToId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    htmlUrl: "",
    commitId: "",
    ...over,
  };
}

function finding(over: Partial<ForgeFinding>): ForgeFinding {
  return {
    id: "F1",
    severity: "HIGH",
    title: "bug",
    file: "src/app.ts",
    lineStart: 2,
    lineEnd: 2,
    evidence: null,
    why: "why",
    fix: "fix",
    ...over,
  };
}

test("finding on new line 2 anchors to diffPosition 3 (the addition row)", () => {
  const { anchored, anchoredFlat, outside } = anchorFindings([finding({ lineStart: 2 })], DIFF);
  assert.equal(outside.length, 0);
  assert.ok(anchored.has("src/app.ts@3"));
  assert.equal(anchoredFlat[0].diffPosition, 3);
});

test("a finding outside the diff falls through to 'outside'", () => {
  const { anchored, outside } = anchorFindings([finding({ lineStart: 999 })], DIFF);
  assert.equal(anchored.size, 0);
  assert.equal(outside.length, 1);
});

test("inline comment on new line 3 anchors to diffPosition 4", () => {
  const threads = groupIntoThreads([comment({ line: 3 })]);
  const { anchored, anchoredFlat, stale } = anchorThreads(threads, DIFF);
  assert.equal(stale.length, 0);
  assert.ok(anchored.has("src/app.ts@4"));
  assert.equal(anchoredFlat[0].diffPosition, 4);
});

test("a comment whose line no longer exists is stale", () => {
  const threads = groupIntoThreads([comment({ line: 999 })]);
  const { anchored, stale } = anchorThreads(threads, DIFF);
  assert.equal(anchored.size, 0);
  assert.equal(stale.length, 1);
});

test("findings and comments on the same line share a diffPosition", () => {
  // finding at new line 2 → pos 3; comment at new line 2 → pos 3.
  const fRes = anchorFindings([finding({ lineStart: 2 })], DIFF);
  const cRes = anchorThreads(groupIntoThreads([comment({ line: 2 })]), DIFF);
  assert.equal(fRes.anchoredFlat[0].diffPosition, 3);
  assert.equal(cRes.anchoredFlat[0].diffPosition, 3);
});
