// Persistence for Workbench layout preferences: the global sidebar's
// collapsed state and the PR-review three-pane widths / collapse flags.
//
// Same best-effort localStorage pattern as `publish-pref.ts` (storage is
// injectable so tests can drive it without a DOM, and we swallow the
// quota / privacy-mode throws). Layout is a pure client-side preference —
// it is never server-persisted.

export interface PrefStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStorage(): PrefStorage | null {
  // localStorage may be absent (tests, SSR) or throw (privacy mode).
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export const SIDEBAR_COLLAPSED_KEY = "forge.layout.sidebarCollapsed";
export const REVIEW_LAYOUT_KEY = "forge.layout.review";

// Draggable bounds for the review panes. Persisted widths are clamped to
// these on read so a value stored by an older build (or a since-narrowed
// window) can never wedge a pane off-screen.
export const REVIEW_NAV_MIN = 160;
export const REVIEW_NAV_MAX = 460;
export const REVIEW_RAIL_MIN = 260;
export const REVIEW_RAIL_MAX = 600;

export interface ReviewLayout {
  navWidth: number;
  railWidth: number;
  navCollapsed: boolean;
  railCollapsed: boolean;
}

export const REVIEW_LAYOUT_DEFAULTS: ReviewLayout = {
  navWidth: 240,
  railWidth: 380,
  navCollapsed: false,
  railCollapsed: false,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function readSidebarCollapsed(storage: PrefStorage | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(value: boolean, storage: PrefStorage | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(SIDEBAR_COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    // best-effort persistence; ignore quota / disabled-storage errors.
  }
}

export function readReviewLayout(storage: PrefStorage | null = defaultStorage()): ReviewLayout {
  if (!storage) return { ...REVIEW_LAYOUT_DEFAULTS };
  try {
    const raw = storage.getItem(REVIEW_LAYOUT_KEY);
    if (!raw) return { ...REVIEW_LAYOUT_DEFAULTS };
    const p = JSON.parse(raw) as Partial<ReviewLayout>;
    return {
      navWidth: clamp(
        typeof p.navWidth === "number" ? p.navWidth : REVIEW_LAYOUT_DEFAULTS.navWidth,
        REVIEW_NAV_MIN,
        REVIEW_NAV_MAX,
      ),
      railWidth: clamp(
        typeof p.railWidth === "number" ? p.railWidth : REVIEW_LAYOUT_DEFAULTS.railWidth,
        REVIEW_RAIL_MIN,
        REVIEW_RAIL_MAX,
      ),
      navCollapsed: p.navCollapsed === true,
      railCollapsed: p.railCollapsed === true,
    };
  } catch {
    return { ...REVIEW_LAYOUT_DEFAULTS };
  }
}

export function writeReviewLayout(value: ReviewLayout, storage: PrefStorage | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(REVIEW_LAYOUT_KEY, JSON.stringify(value));
  } catch {
    // best-effort persistence; ignore quota / disabled-storage errors.
  }
}
