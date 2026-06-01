import { strict as assert } from "node:assert";
import { test } from "node:test";
import { partitionFindingsByDiff } from "../../src/core/diff-anchoring.ts";
import type { ForgeFinding } from "../../src/core/reviewer.ts";

function makeFinding(overrides: Partial<ForgeFinding> = {}): ForgeFinding {
  return {
    id: "id",
    severity: "MEDIUM",
    title: "t",
    file: "src/foo.ts",
    lineStart: 0,
    lineEnd: 0,
    evidence: null,
    why: "",
    fix: "",
    ...overrides,
  };
}

const SAMPLE_DIFF = [
  "diff --git a/src/foo.ts b/src/foo.ts",
  "index 1111111..2222222 100644",
  "--- a/src/foo.ts",
  "+++ b/src/foo.ts",
  "@@ -1,3 +1,5 @@",
  " line1",
  "+added2",
  "+added3",
  " line4",
  " line5",
].join("\n");
// RIGHT-side line numbers present: 1 (ctx), 2 (add), 3 (add), 4 (ctx), 5 (ctx).

// Two-hunk diff in one file: hunk A covers RIGHT lines 1-5, hunk B covers
// RIGHT lines 40-43. A range spanning both is not anchorable within one hunk.
const TWO_HUNK_DIFF = [
  "diff --git a/src/foo.ts b/src/foo.ts",
  "index 1111111..2222222 100644",
  "--- a/src/foo.ts",
  "+++ b/src/foo.ts",
  "@@ -1,3 +1,5 @@",
  " line1",
  "+added2",
  "+added3",
  " line4",
  " line5",
  "@@ -38,3 +40,4 @@",
  " line40",
  "+added41",
  "+added42",
  " line43",
].join("\n");
// Hunk A RIGHT span: 1-5. Hunk B RIGHT span: 40-43.

test("partitionFindingsByDiff anchors an in-hunk finding and routes an off-hunk one to outOfDiff", () => {
  const inHunk = makeFinding({ id: "in", file: "src/foo.ts", lineStart: 2, lineEnd: 2 });
  const offHunk = makeFinding({ id: "off", file: "src/foo.ts", lineStart: 99, lineEnd: 99 });
  const otherFile = makeFinding({ id: "other", file: "src/bar.ts", lineStart: 2, lineEnd: 2 });

  const { inDiff, outOfDiff } = partitionFindingsByDiff([inHunk, offHunk, otherFile], SAMPLE_DIFF);

  assert.equal(inDiff.length, 1);
  assert.equal(inDiff[0].finding.id, "in");
  assert.equal(inDiff[0].line, 2);
  assert.equal(inDiff[0].side, "RIGHT");
  assert.equal(inDiff[0].startLine, undefined);

  assert.deepEqual(new Set(outOfDiff.map((f) => f.id)), new Set(["off", "other"]));
});

test("partitionFindingsByDiff carries startLine for a multi-line range within the hunk", () => {
  const range = makeFinding({ id: "range", file: "src/foo.ts", lineStart: 2, lineEnd: 4 });
  const { inDiff } = partitionFindingsByDiff([range], SAMPLE_DIFF);
  assert.equal(inDiff.length, 1);
  assert.equal(inDiff[0].line, 4);
  assert.equal(inDiff[0].startLine, 2);
});

test("partitionFindingsByDiff falls back to a single-line anchor when start is not on a RIGHT-side row", () => {
  // End (line 4) anchors; start (line 99) is off-diff. The finding still
  // publishes as a single-line comment at the end rather than dropping out.
  const partialRange = makeFinding({ id: "partial", file: "src/foo.ts", lineStart: 99, lineEnd: 4 });
  const { inDiff, outOfDiff } = partitionFindingsByDiff([partialRange], SAMPLE_DIFF);
  assert.equal(inDiff.length, 1);
  assert.equal(outOfDiff.length, 0);
  assert.equal(inDiff[0].finding.id, "partial");
  assert.equal(inDiff[0].line, 4);
  assert.equal(inDiff[0].startLine, undefined);
});

test("partitionFindingsByDiff carries startLine for a multi-line range within a single hunk", () => {
  // Both ends in hunk B (40-43) → valid multi-line anchor.
  const range = makeFinding({ id: "samehunk", file: "src/foo.ts", lineStart: 40, lineEnd: 43 });
  const { inDiff } = partitionFindingsByDiff([range], TWO_HUNK_DIFF);
  assert.equal(inDiff.length, 1);
  assert.equal(inDiff[0].line, 43);
  assert.equal(inDiff[0].startLine, 40);
});

test("partitionFindingsByDiff drops startLine for a range spanning two hunks (single-line fallback, still inDiff)", () => {
  // Start in hunk A (line 2), end in hunk B (line 43): both on RIGHT-side rows
  // but in different hunks. GitHub would 422 the start_line/line pair, so we
  // anchor a single-line comment at the end instead of dropping the finding.
  const crossHunk = makeFinding({ id: "crosshunk", file: "src/foo.ts", lineStart: 2, lineEnd: 43 });
  const { inDiff, outOfDiff } = partitionFindingsByDiff([crossHunk], TWO_HUNK_DIFF);
  assert.equal(inDiff.length, 1);
  assert.equal(outOfDiff.length, 0);
  assert.equal(inDiff[0].finding.id, "crosshunk");
  assert.equal(inDiff[0].line, 43);
  assert.equal(inDiff[0].startLine, undefined);
});

test("partitionFindingsByDiff routes a finding with no line anchor to outOfDiff", () => {
  const bare = makeFinding({ id: "bare", file: "src/foo.ts", lineStart: 0, lineEnd: 0 });
  const { inDiff, outOfDiff } = partitionFindingsByDiff([bare], SAMPLE_DIFF);
  assert.equal(inDiff.length, 0);
  assert.equal(outOfDiff.length, 1);
});
