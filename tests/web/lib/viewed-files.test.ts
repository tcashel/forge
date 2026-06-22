/**
 * viewed-files — per-file "Viewed" persistence for the PR review page.
 * Storage is injected so these tests never touch a real localStorage.
 */
import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  type PrefStorage,
  readViewedFiles,
  viewedFilesKey,
  writeViewedFiles,
} from "../../../src/web/lib/viewed-files.ts";

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

test("key includes repo root, PR number, and head SHA", () => {
  assert.equal(viewedFilesKey("/repo/a", 7, "abc123"), "forge.review.viewed./repo/a#7@abc123");
});

test("round-trips a set of file paths as a JSON array", () => {
  const s = memStorage();
  writeViewedFiles("/repo/a", 7, "sha1", new Set(["src/x.ts", "src/y.ts"]), s);
  assert.equal(s.data[viewedFilesKey("/repo/a", 7, "sha1")], JSON.stringify(["src/x.ts", "src/y.ts"]));
  const read = readViewedFiles("/repo/a", 7, "sha1", s);
  assert.deepEqual([...read].sort(), ["src/x.ts", "src/y.ts"]);
});

test("state is independent across PRs (repo + PR keyed)", () => {
  const s = memStorage();
  writeViewedFiles("/repo/a", 7, "sha1", new Set(["a.ts"]), s);
  writeViewedFiles("/repo/a", 8, "sha1", new Set(["b.ts"]), s);
  assert.deepEqual([...readViewedFiles("/repo/a", 7, "sha1", s)], ["a.ts"]);
  assert.deepEqual([...readViewedFiles("/repo/a", 8, "sha1", s)], ["b.ts"]);
});

test("the same PR number in different repos does not collide", () => {
  const s = memStorage();
  writeViewedFiles("/repo/a", 7, "sha1", new Set(["a.ts"]), s);
  writeViewedFiles("/repo/b", 7, "sha1", new Set(["b.ts"]), s);
  assert.deepEqual([...readViewedFiles("/repo/a", 7, "sha1", s)], ["a.ts"]);
  assert.deepEqual([...readViewedFiles("/repo/b", 7, "sha1", s)], ["b.ts"]);
});

test("viewed state resets when the head SHA changes", () => {
  const s = memStorage();
  writeViewedFiles("/repo/a", 7, "sha1", new Set(["a.ts"]), s);
  // New head SHA → a fresh, empty set (the file content changed).
  assert.equal(readViewedFiles("/repo/a", 7, "sha2", s).size, 0);
  // The old SHA's entry is untouched (could be pruned, but never returned).
  assert.deepEqual([...readViewedFiles("/repo/a", 7, "sha1", s)], ["a.ts"]);
});

test("missing/garbage values read as an empty set", () => {
  assert.equal(readViewedFiles("/repo/a", 7, "sha1", memStorage()).size, 0);
  const s = memStorage({ [viewedFilesKey("/repo/a", 7, "sha1")]: "not json" });
  assert.equal(readViewedFiles("/repo/a", 7, "sha1", s).size, 0);
  const s2 = memStorage({ [viewedFilesKey("/repo/a", 7, "sha1")]: JSON.stringify({ not: "array" }) });
  assert.equal(readViewedFiles("/repo/a", 7, "sha1", s2).size, 0);
});

test("empty head SHA never reads or writes (no key to scope by)", () => {
  const s = memStorage();
  writeViewedFiles("/repo/a", 7, "", new Set(["a.ts"]), s);
  assert.deepEqual(Object.keys(s.data), []);
  assert.equal(readViewedFiles("/repo/a", 7, "", s).size, 0);
});

test("missing storage (no DOM) reads empty and writes are no-ops", () => {
  assert.equal(readViewedFiles("/repo/a", 7, "sha1", null).size, 0);
  assert.doesNotThrow(() => writeViewedFiles("/repo/a", 7, "sha1", new Set(["a.ts"]), null));
});

test("a throwing storage never propagates (privacy mode)", () => {
  const throwing: PrefStorage = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("denied");
    },
  };
  assert.equal(readViewedFiles("/repo/a", 7, "sha1", throwing).size, 0);
  assert.doesNotThrow(() => writeViewedFiles("/repo/a", 7, "sha1", new Set(["a.ts"]), throwing));
});
