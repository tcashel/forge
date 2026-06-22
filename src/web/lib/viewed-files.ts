// Per-file "Viewed" persistence for the PR review page.
//
// GitHub-style: marking a file viewed is remembered across reloads and
// resets when the PR head moves (the content changed, so a prior "viewed"
// no longer applies). State is client-side only — never server-persisted.
//
// Reuses only the storage-safety pattern from `publish-pref.ts` (try/catch
// around a possibly-absent/throwing localStorage). The scoping and
// serialization here are deliberately richer: publish-pref is a single
// global boolean and is not a template for this.

export interface PrefStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

function defaultStorage(): PrefStorage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

/**
 * Storage key for a (repo, PR, head-SHA) triple. Including the head SHA is
 * what makes "viewed" reset when the PR head moves; including the repo root
 * + PR number avoids the cross-repo collision called out in review.ts
 * (repo A #7 vs repo B #7).
 */
export function viewedFilesKey(repoRoot: string, prNumber: number, headSha: string): string {
  return `forge.review.viewed.${repoRoot}#${prNumber}@${headSha}`;
}

export function readViewedFiles(
  repoRoot: string,
  prNumber: number,
  headSha: string,
  storage: PrefStorage | null = defaultStorage(),
): Set<string> {
  if (!storage || !headSha) return new Set();
  try {
    const raw = storage.getItem(viewedFilesKey(repoRoot, prNumber, headSha));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((p): p is string => typeof p === "string"));
  } catch {
    return new Set();
  }
}

export function writeViewedFiles(
  repoRoot: string,
  prNumber: number,
  headSha: string,
  files: Set<string>,
  storage: PrefStorage | null = defaultStorage(),
): void {
  if (!storage || !headSha) return;
  try {
    storage.setItem(viewedFilesKey(repoRoot, prNumber, headSha), JSON.stringify([...files]));
  } catch {
    // best-effort persistence; ignore quota / disabled-storage errors.
  }
}
