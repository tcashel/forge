/**
 * ui-layout — persistence for the global sidebar collapse and the PR-review
 * three-pane widths / collapse. Storage is injected so these tests never touch
 * a real localStorage.
 */
import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  type PrefStorage,
  REVIEW_LAYOUT_DEFAULTS,
  REVIEW_NAV_MAX,
  REVIEW_NAV_MIN,
  REVIEW_RAIL_MAX,
  REVIEW_RAIL_MIN,
  readReviewLayout,
  readSidebarCollapsed,
  writeReviewLayout,
  writeSidebarCollapsed,
} from "../../../src/web/lib/ui-layout.ts";

function memStorage(initial: Record<string, string> = {}): PrefStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

test("sidebar collapse round-trips as 1/0", () => {
  const s = memStorage();
  assert.equal(readSidebarCollapsed(s), false);
  writeSidebarCollapsed(true, s);
  assert.equal(readSidebarCollapsed(s), true);
  writeSidebarCollapsed(false, s);
  assert.equal(readSidebarCollapsed(s), false);
});

test("review layout returns defaults when storage is empty", () => {
  assert.deepEqual(readReviewLayout(memStorage()), REVIEW_LAYOUT_DEFAULTS);
});

test("review layout round-trips widths and collapse flags", () => {
  const s = memStorage();
  const layout = { navWidth: 300, railWidth: 420, navCollapsed: true, railCollapsed: false };
  writeReviewLayout(layout, s);
  assert.deepEqual(readReviewLayout(s), layout);
});

test("review widths are clamped to the draggable bounds on read", () => {
  const tooSmall = memStorage();
  writeReviewLayout({ navWidth: 10, railWidth: 10, navCollapsed: false, railCollapsed: false }, tooSmall);
  const lo = readReviewLayout(tooSmall);
  assert.equal(lo.navWidth, REVIEW_NAV_MIN);
  assert.equal(lo.railWidth, REVIEW_RAIL_MIN);

  const tooBig = memStorage();
  writeReviewLayout({ navWidth: 9999, railWidth: 9999, navCollapsed: false, railCollapsed: false }, tooBig);
  const hi = readReviewLayout(tooBig);
  assert.equal(hi.navWidth, REVIEW_NAV_MAX);
  assert.equal(hi.railWidth, REVIEW_RAIL_MAX);
});

test("malformed JSON falls back to defaults", () => {
  const s = memStorage({ "forge.layout.review": "{not json" });
  assert.deepEqual(readReviewLayout(s), REVIEW_LAYOUT_DEFAULTS);
});

test("missing numeric fields fall back to defaults, non-true flags are false", () => {
  const s = memStorage({ "forge.layout.review": JSON.stringify({ navCollapsed: "yes" }) });
  const out = readReviewLayout(s);
  assert.equal(out.navWidth, REVIEW_LAYOUT_DEFAULTS.navWidth);
  assert.equal(out.railWidth, REVIEW_LAYOUT_DEFAULTS.railWidth);
  assert.equal(out.navCollapsed, false);
  assert.equal(out.railCollapsed, false);
});

test("null storage never throws and reads as defaults", () => {
  assert.equal(readSidebarCollapsed(null), false);
  assert.deepEqual(readReviewLayout(null), REVIEW_LAYOUT_DEFAULTS);
  assert.doesNotThrow(() => writeSidebarCollapsed(true, null));
  assert.doesNotThrow(() =>
    writeReviewLayout({ navWidth: 240, railWidth: 380, navCollapsed: false, railCollapsed: false }, null),
  );
});
