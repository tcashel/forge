/**
 * publish-pref — the persisted default for the "Publish to PR" checkbox.
 * Storage is injected so these tests never touch a real browser
 * localStorage (and the module guards the no-storage case for bun test).
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  type PrefStorage,
  PUBLISH_PREF_KEY,
  readPublishPref,
  writePublishPref,
} from "../../../src/web/lib/publish-pref.ts";

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

test("defaults to false when nothing is stored", () => {
  assert.equal(readPublishPref(memStorage()), false);
});

test("round-trips true and false", () => {
  const storage = memStorage();
  writePublishPref(true, storage);
  assert.equal(storage.data[PUBLISH_PREF_KEY], "1");
  assert.equal(readPublishPref(storage), true);

  writePublishPref(false, storage);
  assert.equal(storage.data[PUBLISH_PREF_KEY], "0");
  assert.equal(readPublishPref(storage), false);
});

test("ignores garbage values", () => {
  assert.equal(readPublishPref(memStorage({ [PUBLISH_PREF_KEY]: "yes" })), false);
});

test("missing storage (no DOM) reads false and writes are no-ops", () => {
  assert.equal(readPublishPref(null), false);
  assert.doesNotThrow(() => writePublishPref(true, null));
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
  assert.equal(readPublishPref(throwing), false);
  assert.doesNotThrow(() => writePublishPref(true, throwing));
});
