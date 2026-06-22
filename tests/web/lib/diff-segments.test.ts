/**
 * splitDiffSegments — per-file raw segmentation feeding @git-diff-view's
 * `data.hunks`. Each segment must be a well-formed single-file diff (starting
 * at its `diff --git` header) and align 1:1 with parseUnifiedDiff's output.
 */
import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseUnifiedDiff, splitDiffSegments } from "../../../src/web/lib/diff.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE = fs.readFileSync(path.join(HERE, "..", "..", "fixtures", "diff", "review-sample.diff"), "utf-8");

test("splits into one segment per file, aligned with parseUnifiedDiff", () => {
  const segments = splitDiffSegments(SAMPLE);
  const files = parseUnifiedDiff(SAMPLE);
  assert.equal(segments.length, files.length);
  assert.equal(segments.length, 3);
  for (const seg of segments) assert.ok(seg.startsWith("diff --git "));
});

test("each segment carries that file's header and hunks", () => {
  const [appSeg, yamlSeg, binSeg] = splitDiffSegments(SAMPLE);
  assert.ok(appSeg.includes("--- a/src/app.ts"));
  assert.ok(appSeg.includes("@@ -1,3 +1,4 @@"));
  assert.ok(appSeg.includes("+const added = 3;"));
  assert.ok(!appSeg.includes("config.yaml"));
  assert.ok(yamlSeg.includes("config.yaml"));
  assert.ok(binSeg.includes("Binary files"));
});

test("empty input yields no segments", () => {
  assert.deepEqual(splitDiffSegments(""), []);
});
