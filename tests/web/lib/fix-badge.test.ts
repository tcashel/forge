/**
 * fixBadgeFor — the per-target badge shown for comment-fix results. The
 * regression here: a persisted entry's ghError ("resolve failed: …" /
 * "dispute reply failed: …") and a dropped target's reason must surface on
 * the badge instead of being silently swallowed.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fixBadgeFor } from "../../../src/web/lib/fix-badge.ts";

test("live 'fixing' wins over any persisted state", () => {
  const badge = fixBadgeFor("fixing", { status: "fixed", ghResolved: true });
  assert.ok(badge);
  assert.equal(badge.className, "fixing");
  assert.equal(badge.ghError, undefined);
});

test("no live status and no persisted entry → no badge", () => {
  assert.equal(fixBadgeFor(undefined, undefined), null);
  assert.equal(fixBadgeFor("pending", null), null);
});

test("fixed entry carries ghResolved and a thread-resolve failure detail", () => {
  const ok = fixBadgeFor(undefined, { status: "fixed", ghResolved: true });
  assert.ok(ok);
  assert.equal(ok.label, "fixed");
  assert.equal(ok.ghResolved, true);

  const failedResolve = fixBadgeFor(undefined, { status: "fixed", ghError: "resolve failed: HTTP 502" });
  assert.ok(failedResolve);
  assert.equal(failedResolve.className, "fixed");
  assert.equal(failedResolve.ghError, "resolve failed: HTTP 502");
});

test("disputed entry surfaces the dispute-reply failure", () => {
  const badge = fixBadgeFor(undefined, {
    status: "disputed",
    reason: "intended behaviour",
    ghError: "dispute reply failed: thread not found",
  });
  assert.ok(badge);
  assert.equal(badge.className, "disputed");
  assert.equal(badge.reason, "intended behaviour");
  assert.equal(badge.ghError, "dispute reply failed: thread not found");
});

test("dropped target (stamped failed by the worker) keeps its drop reason", () => {
  const badge = fixBadgeFor(undefined, {
    status: "failed",
    reason: "comment no longer anchored to the diff",
  });
  assert.ok(badge);
  assert.equal(badge.className, "failed");
  assert.equal(badge.reason, "comment no longer anchored to the diff");
});

test("unknown persisted status is ignored rather than rendered", () => {
  const badge = fixBadgeFor(undefined, { status: "weird" as never });
  assert.equal(badge, null);
});
