// Layout signals for the Workbench: the global sidebar collapse and the
// PR-review three-pane widths / collapse. Each is seeded from localStorage
// and written back through an `effect`, the same shape as `theme.ts`.

import { effect, signal } from "@preact/signals";
import {
  REVIEW_NAV_MAX,
  REVIEW_NAV_MIN,
  REVIEW_RAIL_MAX,
  REVIEW_RAIL_MIN,
  readReviewLayout,
  readSidebarCollapsed,
  writeReviewLayout,
  writeSidebarCollapsed,
} from "../lib/ui-layout";

// ── Global workspace sidebar ──────────────────────────────────────────────
export const sidebarCollapsed = signal<boolean>(readSidebarCollapsed());

effect(() => {
  writeSidebarCollapsed(sidebarCollapsed.value);
});

export function toggleSidebar(): void {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

// ── PR-review three-pane widths + collapse ────────────────────────────────
const initial = readReviewLayout();

export const reviewNavWidth = signal<number>(initial.navWidth);
export const reviewRailWidth = signal<number>(initial.railWidth);
export const reviewNavCollapsed = signal<boolean>(initial.navCollapsed);
export const reviewRailCollapsed = signal<boolean>(initial.railCollapsed);

// Width of the collapsed icon strip; keep in sync with `.review-pane-strip`.
export const REVIEW_STRIP_WIDTH = 40;

// Drag clamp bounds and the width a splitter double-click resets to.
export const reviewNavBounds = { min: REVIEW_NAV_MIN, max: REVIEW_NAV_MAX, def: 240 };
export const reviewRailBounds = { min: REVIEW_RAIL_MIN, max: REVIEW_RAIL_MAX, def: 380 };

effect(() => {
  writeReviewLayout({
    navWidth: reviewNavWidth.value,
    railWidth: reviewRailWidth.value,
    navCollapsed: reviewNavCollapsed.value,
    railCollapsed: reviewRailCollapsed.value,
  });
});
