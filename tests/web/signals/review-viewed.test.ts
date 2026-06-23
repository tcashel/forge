/**
 * Viewed-state wiring (signal + persistence effect + hydration), driven the
 * way a reload / PR switch / head-move actually exercises it.
 *
 * The pure storage helpers are covered by lib/viewed-files.test.ts. This test
 * covers the glue those helpers can't: that `hydrateViewedFiles` rebinds the
 * scope and reads persisted state into the live `viewedFiles` signal, that the
 * persistence `effect` writes back under the active scope, and that switching
 * PR or moving the head SHA resets the on-screen set without clobbering the
 * prior key.
 *
 * `signals/review` reads & writes through the global `localStorage`. Bun on
 * Linux (CI) exposes a real, read-only `localStorage` global; macOS
 * `bun test` has none. We use the platform store when present and install a
 * minimal in-memory shim only when it's absent — either way the module's
 * default storage resolves to `store`. Cleanup removes only the namespaced
 * keys these tests touch, so a shared runner's localStorage is never wiped.
 */
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { readViewedFiles, viewedFilesKey } from "../../../src/web/lib/viewed-files.ts";

interface MutableStorage {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

const store: MutableStorage = (() => {
  let platform: MutableStorage | null = null;
  try {
    platform = typeof localStorage !== "undefined" ? (localStorage as unknown as MutableStorage) : null;
  } catch {
    platform = null;
  }
  if (platform) return platform;
  const data: Record<string, string> = {};
  const shim: MutableStorage = {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
  Object.defineProperty(globalThis, "localStorage", { value: shim, configurable: true, writable: true });
  return shim;
})();

// Dynamic import so the storage above is in place before the module's
// top-level `effect()`/storage reads run.
const review = await import("../../../src/web/signals/review.ts");
const { hydrateViewedFiles, toggleViewedFile, viewedFiles, viewedProgress } = review;

const REPO = "/repo/x";
const SHA1 = "sha-aaa";
const SHA2 = "sha-bbb";
const sorted = (s: Set<string>) => [...s].sort();
// Effects flush synchronously on a bare `.value =`, but yield once so the
// assertion never races the scheduler.
const flush = () => new Promise((r) => setTimeout(r, 0));

// Remove only the keys these tests touch — never a blanket clear().
function reset() {
  for (const [pr, sha] of [
    [7, SHA1],
    [7, SHA2],
    [8, SHA1],
  ] as const) {
    store.removeItem(viewedFilesKey(REPO, pr, sha));
  }
}

test("hydrate reads persisted viewed state (reload) and prunes to the reviewable set", async () => {
  reset();
  // A prior session marked a.ts, b.ts, and a since-removed file viewed.
  store.setItem(viewedFilesKey(REPO, 7, SHA1), JSON.stringify(["a.ts", "b.ts", "gone.ts"]));

  hydrateViewedFiles(REPO, 7, SHA1, ["a.ts", "b.ts", "c.ts"]);

  // a.ts/b.ts hydrate; gone.ts is pruned because it's no longer in the diff.
  assert.deepEqual(sorted(viewedFiles.value), ["a.ts", "b.ts"]);
  assert.deepEqual(viewedProgress.value, { viewed: 2, total: 3 });
});

test("toggling a file persists through the effect under the active scope", async () => {
  reset();
  hydrateViewedFiles(REPO, 7, SHA1, ["a.ts", "b.ts"]);
  assert.equal(viewedFiles.value.size, 0, "fresh head starts unviewed");

  toggleViewedFile("b.ts");
  await flush();
  assert.deepEqual([...readViewedFiles(REPO, 7, SHA1, store)], ["b.ts"], "toggle on persisted");

  toggleViewedFile("a.ts");
  await flush();
  assert.deepEqual(sorted(readViewedFiles(REPO, 7, SHA1, store)), ["a.ts", "b.ts"]);

  toggleViewedFile("b.ts"); // back off
  await flush();
  assert.deepEqual([...readViewedFiles(REPO, 7, SHA1, store)], ["a.ts"], "toggle off persisted");
});

test("switching PR resets the on-screen set and never clobbers the previous PR's key", async () => {
  reset();
  hydrateViewedFiles(REPO, 7, SHA1, ["a.ts", "b.ts"]);
  toggleViewedFile("a.ts");
  await flush();
  assert.deepEqual([...readViewedFiles(REPO, 7, SHA1, store)], ["a.ts"]);

  // Switch to PR #8 at the same SHA — independent, so it hydrates empty.
  hydrateViewedFiles(REPO, 8, SHA1, ["a.ts", "b.ts"]);
  assert.equal(viewedFiles.value.size, 0, "PR switch resets the viewed set");

  // Writes under #8 must not touch #7's stored key.
  toggleViewedFile("b.ts");
  await flush();
  assert.deepEqual([...readViewedFiles(REPO, 8, SHA1, store)], ["b.ts"], "#8 persisted");
  assert.deepEqual([...readViewedFiles(REPO, 7, SHA1, store)], ["a.ts"], "#7 left intact");
});

test("a moved head SHA resets viewed state and leaves the old SHA's entry intact", async () => {
  reset();
  hydrateViewedFiles(REPO, 7, SHA1, ["a.ts", "b.ts"]);
  toggleViewedFile("a.ts");
  await flush();
  assert.deepEqual([...readViewedFiles(REPO, 7, SHA1, store)], ["a.ts"]);

  // Head advances sha1 -> sha2: the content changed, so "viewed" resets.
  hydrateViewedFiles(REPO, 7, SHA2, ["a.ts", "b.ts"]);
  assert.equal(viewedFiles.value.size, 0, "head move resets the viewed set");

  toggleViewedFile("b.ts");
  await flush();
  assert.deepEqual([...readViewedFiles(REPO, 7, SHA2, store)], ["b.ts"], "new head persisted");
  assert.deepEqual([...readViewedFiles(REPO, 7, SHA1, store)], ["a.ts"], "old head intact");
});
