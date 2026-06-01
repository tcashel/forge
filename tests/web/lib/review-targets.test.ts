/**
 * commentTargetToken — a marker-bearing inline comment IS the published view
 * of a Forge finding, so its selectable token must be `finding:<id>` (which
 * the fixer resolves) rather than `comment:<id>` (which the fixer skips).
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { commentTargetToken } from "../../../src/web/lib/review-targets.ts";

test("commentTargetToken routes a marker-bearing comment to its finding: target", () => {
  const token = commentTargetToken({ id: 555, forgeFindingId: "abcabcabcabc" });
  assert.equal(token, "finding:abcabcabcabc");
});

test("commentTargetToken keeps a plain comment as a comment: target", () => {
  assert.equal(commentTargetToken({ id: 777 }), "comment:777");
  assert.equal(commentTargetToken({ id: "c1", forgeFindingId: undefined }), "comment:c1");
});
