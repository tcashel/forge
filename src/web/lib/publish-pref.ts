// Persistence for the "Publish to PR" checkbox default. Same pattern as
// signals/theme.ts (localStorage, best-effort), but with the storage
// injected so tests can drive it without a DOM. The signal in
// signals/review.ts seeds from readPublishPref() and writes back on change;
// the checkbox itself remains a per-run override.

export const PUBLISH_PREF_KEY = "forge.review.publishToPr";

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

export function readPublishPref(storage: PrefStorage | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(PUBLISH_PREF_KEY) === "1";
  } catch {
    return false;
  }
}

export function writePublishPref(value: boolean, storage: PrefStorage | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(PUBLISH_PREF_KEY, value ? "1" : "0");
  } catch {
    // best-effort persistence; ignore quota / disabled-storage errors.
  }
}
