import { strict as assert } from "node:assert";
import { test } from "node:test";
import { commentAnchorsToDiff, partitionFindingsByDiff } from "../../src/core/diff-anchoring.ts";
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

test("partitionFindingsByDiff ignores the trailing-newline split artifact (no phantom line past the last hunk)", () => {
  // `gh pr diff` output ends with a trailing newline, so split() leaves a final
  // empty string while still "in hunk". It must NOT be counted as a RIGHT-side
  // row — the last real RIGHT-side line in SAMPLE_DIFF is 5, so a finding on
  // line 6 has no anchor and routes out-of-diff.
  const withTrailingNewline = `${SAMPLE_DIFF}\n`;
  const phantom = makeFinding({ id: "phantom", file: "src/foo.ts", lineStart: 6, lineEnd: 6 });
  const lastReal = makeFinding({ id: "last", file: "src/foo.ts", lineStart: 5, lineEnd: 5 });
  const { inDiff, outOfDiff } = partitionFindingsByDiff([phantom, lastReal], withTrailingNewline);
  // The genuine last line (5) still anchors; the phantom (6) does not.
  assert.deepEqual(
    inDiff.map((a) => a.finding.id),
    ["last"],
  );
  assert.deepEqual(
    outOfDiff.map((f) => f.id),
    ["phantom"],
  );
});

test("partitionFindingsByDiff counts a genuine space-prefixed blank context line as a RIGHT-side row", () => {
  // A blank context line in a unified diff is a single space (" "), not "". It
  // is a real RIGHT-side row, so lines after it stay anchorable.
  const blankCtxDiff = [
    "diff --git a/src/foo.ts b/src/foo.ts",
    "index 1111111..2222222 100644",
    "--- a/src/foo.ts",
    "+++ b/src/foo.ts",
    "@@ -1,3 +1,4 @@",
    " line1",
    " ", // genuine blank context line → RIGHT line 2
    "+added3",
    " line4",
    "", // trailing-newline split artifact → must be ignored
  ].join("\n");
  // RIGHT-side lines: 1 (ctx), 2 (blank ctx), 3 (add), 4 (ctx). Not 5.
  const onBlank = makeFinding({ id: "blank", file: "src/foo.ts", lineStart: 2, lineEnd: 2 });
  const afterBlank = makeFinding({ id: "after", file: "src/foo.ts", lineStart: 3, lineEnd: 3 });
  const phantom5 = makeFinding({ id: "phantom5", file: "src/foo.ts", lineStart: 5, lineEnd: 5 });
  const { inDiff, outOfDiff } = partitionFindingsByDiff([onBlank, afterBlank, phantom5], blankCtxDiff);
  assert.deepEqual(new Set(inDiff.map((a) => a.finding.id)), new Set(["blank", "after"]));
  assert.deepEqual(
    outOfDiff.map((f) => f.id),
    ["phantom5"],
  );
});

test("partitionFindingsByDiff anchors with the diff's new path (non-renamed file)", () => {
  // For a non-renamed file the anchor path is just the finding's file.
  const inHunk = makeFinding({ id: "in", file: "src/foo.ts", lineStart: 2, lineEnd: 2 });
  const { inDiff } = partitionFindingsByDiff([inHunk], SAMPLE_DIFF);
  assert.equal(inDiff.length, 1);
  assert.equal(inDiff[0].path, "src/foo.ts");
});

test("partitionFindingsByDiff anchors a finding on the OLD path of a renamed file using the NEW path", () => {
  // A rename-with-edit diff: src/old.ts → src/new.ts. The finding references
  // the pre-rename (old) path, but the RIGHT-side comment must anchor on the
  // new path or GitHub 422s the whole batched review.
  const renameDiff = [
    "diff --git a/src/old.ts b/src/new.ts",
    "similarity index 80%",
    "rename from src/old.ts",
    "rename to src/new.ts",
    "index 1111111..2222222 100644",
    "--- a/src/old.ts",
    "+++ b/src/new.ts",
    "@@ -1,3 +1,4 @@",
    " line1",
    "+added2",
    " line3",
    " line4",
  ].join("\n");
  // RIGHT-side lines on the new file: 1 (ctx), 2 (add), 3 (ctx), 4 (ctx).
  const onOldPath = makeFinding({ id: "renamed", file: "src/old.ts", lineStart: 2, lineEnd: 2 });
  const { inDiff, outOfDiff } = partitionFindingsByDiff([onOldPath], renameDiff);
  assert.equal(inDiff.length, 1, "finding on the old path still anchors");
  assert.equal(outOfDiff.length, 0);
  assert.equal(inDiff[0].finding.id, "renamed");
  assert.equal(inDiff[0].finding.file, "src/old.ts", "the finding still carries its original (old) file");
  assert.equal(inDiff[0].path, "src/new.ts", "but the anchor path is the diff's new path");
  assert.equal(inDiff[0].line, 2);
});

test("commentAnchorsToDiff anchors by line, by position, and reports stale comments", () => {
  // SAMPLE_DIFF: file src/foo.ts, RIGHT-side lines 1-5; positions 1.. follow
  // the first @@. A comment whose line lands on a RIGHT-side row anchors.
  assert.equal(commentAnchorsToDiff(SAMPLE_DIFF, { path: "src/foo.ts", position: null, line: 2 }), true);
  // A comment whose line is off the diff but whose position resolves anchors.
  assert.equal(commentAnchorsToDiff(SAMPLE_DIFF, { path: "src/foo.ts", position: 1, line: 999 }), true);
  // Neither line nor position resolves → stale.
  assert.equal(commentAnchorsToDiff(SAMPLE_DIFF, { path: "src/foo.ts", position: 999, line: 999 }), false);
  // GitHub nulls both fields on a stale comment → stale.
  assert.equal(commentAnchorsToDiff(SAMPLE_DIFF, { path: "src/foo.ts", position: null, line: null }), false);
  // Unknown file → stale.
  assert.equal(commentAnchorsToDiff(SAMPLE_DIFF, { path: "src/other.ts", position: 1, line: 1 }), false);
});

test("commentAnchorsToDiff resolves a renamed file by its old path", () => {
  const renameDiff = [
    "diff --git a/src/old.ts b/src/new.ts",
    "rename from src/old.ts",
    "rename to src/new.ts",
    "--- a/src/old.ts",
    "+++ b/src/new.ts",
    "@@ -1,3 +1,4 @@",
    " line1",
    "+added2",
    " line3",
    " line4",
  ].join("\n");
  // A stale comment recorded against the OLD path still matches the file.
  assert.equal(commentAnchorsToDiff(renameDiff, { path: "src/old.ts", position: null, line: 2 }), true);
  assert.equal(commentAnchorsToDiff(renameDiff, { path: "src/new.ts", position: null, line: 2 }), true);
});
