/**
 * createTtlCache — freshness window, in-flight dedupe, stale-while-
 * revalidate serving, error propagation, and eviction.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createTtlCache } from "../src/core/ttl-cache.ts";

function deferred<T>(): { promise: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void } {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

test("fresh hit does not re-invoke the loader", async () => {
  const cache = createTtlCache<string, number>({ ttlMs: 10_000 });
  let calls = 0;
  const loader = async () => ++calls;
  assert.equal(await cache.get("k", loader), 1);
  assert.equal(await cache.get("k", loader), 1);
  assert.equal(calls, 1);
});

test("expired entry reloads after ttl", async () => {
  const cache = createTtlCache<string, number>({ ttlMs: 20 });
  let calls = 0;
  const loader = async () => ++calls;
  assert.equal(await cache.get("k", loader), 1);
  await sleep(30);
  assert.equal(await cache.get("k", loader), 2);
});

test("concurrent misses share one in-flight loader", async () => {
  const cache = createTtlCache<string, number>({ ttlMs: 10_000 });
  let calls = 0;
  const gate = deferred<number>();
  const loader = () => {
    calls++;
    return gate.promise;
  };
  const a = cache.get("k", loader);
  const b = cache.get("k", loader);
  gate.resolve(7);
  assert.deepEqual(await Promise.all([a, b]), [7, 7]);
  assert.equal(calls, 1);
});

test("stale-while-revalidate serves stale and refreshes in background", async () => {
  const cache = createTtlCache<string, number>({ ttlMs: 20, staleWhileRevalidateMs: 10_000 });
  let calls = 0;
  const loader = async () => ++calls;
  assert.equal(await cache.get("k", loader), 1);
  await sleep(30);
  // Stale window: immediate stale value, refresh kicked off.
  assert.equal(await cache.get("k", loader), 1);
  await sleep(10); // let the background refresh land
  assert.equal(await cache.get("k", loader), 2);
  assert.equal(calls, 2);
});

test("loader failure propagates and does not poison subsequent loads", async () => {
  const cache = createTtlCache<string, number>({ ttlMs: 10_000 });
  let calls = 0;
  await assert.rejects(
    cache.get("k", async () => {
      calls++;
      throw new Error("boom");
    }),
    /boom/,
  );
  assert.equal(await cache.get("k", async () => ++calls), 2);
});

test("background refresh failure keeps serving the stale value", async () => {
  const cache = createTtlCache<string, number>({ ttlMs: 20, staleWhileRevalidateMs: 10_000 });
  assert.equal(
    await cache.get("k", async () => 1),
    1,
  );
  await sleep(30);
  const failing = async (): Promise<number> => {
    throw new Error("refresh failed");
  };
  assert.equal(await cache.get("k", failing), 1);
  await sleep(10);
  assert.equal(await cache.get("k", failing), 1);
});

test("invalidate forces a reload; maxEntries evicts oldest", async () => {
  const cache = createTtlCache<string, number>({ ttlMs: 10_000, maxEntries: 2 });
  let calls = 0;
  const loader = async () => ++calls;
  await cache.get("a", loader);
  cache.invalidate("a");
  assert.equal(await cache.get("a", loader), 2);

  await cache.get("b", loader);
  await cache.get("c", loader); // evicts "a"
  assert.equal(cache.peek("a"), undefined);
  assert.equal(cache.peek("b"), 3);
  assert.equal(cache.peek("c"), 4);
});
