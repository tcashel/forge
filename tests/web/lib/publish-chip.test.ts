/**
 * publishChip — maps a persisted PublishRecord (Wave 1, ADR-0031) onto the
 * review-history chip. Regression coverage for the
 * serve-review-publish-failure-invisible finding: every publish state must
 * render a visible chip, failures must carry their error text, and only
 * failed/partial/reconcile-failed offer "Retry publish".
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { publishAttemptedCount, publishChip, publishSucceededCount } from "../../../src/web/lib/publish-chip.ts";
import type { PublishRecord } from "../../../src/web/types.ts";

function record(overrides: Partial<PublishRecord>): PublishRecord {
  return {
    schemaVersion: 1,
    requested: true,
    attemptedAt: "2026-06-09T00:00:00.000Z",
    state: "published",
    posted: 0,
    outOfDiff: 0,
    skipped: 0,
    failed: 0,
    error: null,
    findings: [],
    ...overrides,
  };
}

test("null record (pre-publish-record run) renders no chip", () => {
  assert.equal(publishChip(null), null);
  assert.equal(publishChip(undefined), null);
});

test("not-requested → neutral 'Not published', no retry", () => {
  const chip = publishChip(record({ requested: false, attemptedAt: null, state: "not-requested" }));
  assert.ok(chip);
  assert.equal(chip.label, "Not published");
  assert.equal(chip.className, "none");
  assert.equal(chip.detail, null);
  assert.equal(chip.retryable, false);
});

test("nothing-new → neutral, no retry", () => {
  const chip = publishChip(record({ state: "nothing-new" }));
  assert.ok(chip);
  assert.equal(chip.label, "Nothing to publish");
  assert.equal(chip.className, "none");
  assert.equal(chip.retryable, false);
});

test("published → green 'Published N' counting posted + outOfDiff + skipped", () => {
  const chip = publishChip(record({ state: "published", posted: 3, outOfDiff: 1, skipped: 2 }));
  assert.ok(chip);
  assert.equal(chip.label, "Published 6");
  assert.equal(chip.className, "pass");
  assert.equal(chip.retryable, false);
});

test("partial → amber 'Partial N/M' with error detail and retry", () => {
  const chip = publishChip(record({ state: "partial", posted: 2, failed: 1, error: "422 on finding f3" }));
  assert.ok(chip);
  assert.equal(chip.label, "Partial 2/3");
  assert.equal(chip.className, "pend");
  assert.ok(chip.detail?.includes("422 on finding f3"));
  assert.equal(chip.retryable, true);
});

test("failed → red 'Publish failed' with error text and retry", () => {
  const chip = publishChip(record({ state: "failed", failed: 4, error: "gh pr view failed: auth" }));
  assert.ok(chip);
  assert.equal(chip.label, "Publish failed");
  assert.equal(chip.className, "fail");
  assert.ok(chip.detail?.includes("gh pr view failed: auth"));
  assert.equal(chip.retryable, true);
});

test("failed without an error string still carries a detail", () => {
  const chip = publishChip(record({ state: "failed", failed: 1 }));
  assert.ok(chip?.detail && chip.detail.length > 0);
});

test("reconcile-failed → red, retryable, default detail when error is null", () => {
  const chip = publishChip(record({ state: "reconcile-failed" }));
  assert.ok(chip);
  assert.equal(chip.label, "Publish failed");
  assert.equal(chip.className, "fail");
  assert.equal(chip.retryable, true);
  assert.ok(chip.detail?.includes("reconcile"));
});

test("headMoved annotates the detail", () => {
  const chip = publishChip(record({ state: "partial", posted: 1, failed: 1, error: "x", headMoved: true }));
  assert.ok(chip?.detail?.includes("head moved"));
});

test("count helpers", () => {
  const r = record({ posted: 2, outOfDiff: 1, skipped: 3, failed: 4 });
  assert.equal(publishSucceededCount(r), 6);
  assert.equal(publishAttemptedCount(r), 10);
});
