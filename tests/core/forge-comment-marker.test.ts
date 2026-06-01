import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildFindingCommentBody, extractFindingIds, parseFindingMarker } from "../../src/core/forge-comment-marker.ts";
import type { ForgeFinding } from "../../src/core/reviewer.ts";

function makeFinding(overrides: Partial<ForgeFinding> = {}): ForgeFinding {
  return {
    id: "ab12cd34ef56",
    severity: "HIGH",
    title: "Null deref in handler",
    file: "src/handler.ts",
    lineStart: 42,
    lineEnd: 42,
    evidence: null,
    why: "The pointer can be null when the cache misses.",
    fix: "Guard with an early return.",
    ...overrides,
  };
}

test("buildFindingCommentBody → parseFindingMarker round-trips id and severity", () => {
  const finding = makeFinding();
  const body = buildFindingCommentBody(finding);
  const parsed = parseFindingMarker(body);
  assert.deepEqual(parsed, { id: finding.id, severity: finding.severity });
  // Why/Fix prose render in the human-readable portion.
  assert.ok(body.includes("**Why:**"));
  assert.ok(body.includes("**Fix:**"));
});

test("parseFindingMarker returns null when there is no marker", () => {
  assert.equal(parseFindingMarker("just a regular comment body"), null);
  assert.equal(parseFindingMarker(""), null);
});

test("buildFindingCommentBody passes through a fenced suggestion block verbatim", () => {
  const finding = makeFinding({
    fix: "Do this:\n\n```suggestion\nreturn early;\n```\n",
  });
  const body = buildFindingCommentBody(finding);
  assert.ok(body.includes("```suggestion\nreturn early;\n```"));
  // Round-trip still holds.
  assert.deepEqual(parseFindingMarker(body), { id: finding.id, severity: "HIGH" });
});

test("extractFindingIds collects every marker in a body (review-body case)", () => {
  const a = makeFinding({ id: "aaaaaaaaaaaa" });
  const b = makeFinding({ id: "bbbbbbbbbbbb", severity: "LOW" });
  const reviewBody = [
    "Forge automated review.",
    `- **[HIGH]** A ${buildFindingCommentBody(a).split("\n").pop()}`,
    `- **[LOW]** B ${buildFindingCommentBody(b).split("\n").pop()}`,
  ].join("\n");
  assert.deepEqual(new Set(extractFindingIds(reviewBody)), new Set(["aaaaaaaaaaaa", "bbbbbbbbbbbb"]));
  assert.deepEqual(extractFindingIds("nothing here"), []);
});
