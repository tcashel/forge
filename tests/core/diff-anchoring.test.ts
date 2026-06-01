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

test("partitionFindingsByDiff routes a finding with no line anchor to outOfDiff", () => {
  const bare = makeFinding({ id: "bare", file: "src/foo.ts", lineStart: 0, lineEnd: 0 });
  const { inDiff, outOfDiff } = partitionFindingsByDiff([bare], SAMPLE_DIFF);
  assert.equal(inDiff.length, 0);
  assert.equal(outOfDiff.length, 1);
});
