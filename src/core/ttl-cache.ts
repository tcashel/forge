/**
 * Small TTL cache with in-flight promise dedupe and optional
 * stale-while-revalidate, shared by the serve hot paths (repo quick-info,
 * tmux liveness, gh PR list/login caches).
 *
 * Semantics:
 * - `get(key, loader)` returns the cached value while it is fresh
 *   (age < ttlMs). Concurrent misses share a single loader call.
 * - With `staleWhileRevalidateMs`, a value older than ttlMs but younger
 *   than ttlMs + staleWhileRevalidateMs is returned immediately while one
 *   background refresh runs; older entries block on a fresh load.
 * - A loader failure never poisons the cache: the entry (if any) is left
 *   as-is and the error propagates to blocking callers. Background
 *   refresh failures are swallowed (the stale value stays served until
 *   it ages out of the SWR window).
 */

interface Entry<V> {
  value: V;
  storedAt: number;
}

export interface TtlCacheOptions {
  ttlMs: number;
  staleWhileRevalidateMs?: number;
  maxEntries?: number;
}

export interface TtlCache<K, V> {
  get(key: K, loader: () => Promise<V>): Promise<V>;
  /** Synchronous peek — fresh-or-stale value without triggering a load. */
  peek(key: K): V | undefined;
  invalidate(key?: K): void;
  clear(): void;
}

export function createTtlCache<K, V>(opts: TtlCacheOptions): TtlCache<K, V> {
  const { ttlMs, staleWhileRevalidateMs = 0, maxEntries = 1000 } = opts;
  const entries = new Map<K, Entry<V>>();
  const inFlight = new Map<K, Promise<V>>();

  function store(key: K, value: V): void {
    // Map preserves insertion order; delete+set keeps eviction roughly LRU
    // by write. Good enough for the handful of keys these caches hold.
    entries.delete(key);
    entries.set(key, { value, storedAt: Date.now() });
    if (entries.size > maxEntries) {
      const oldest = entries.keys().next();
      if (!oldest.done) entries.delete(oldest.value);
    }
  }

  function load(key: K, loader: () => Promise<V>): Promise<V> {
    const existing = inFlight.get(key);
    if (existing) return existing;
    const p = (async () => {
      try {
        const value = await loader();
        store(key, value);
        return value;
      } finally {
        inFlight.delete(key);
      }
    })();
    inFlight.set(key, p);
    return p;
  }

  return {
    async get(key: K, loader: () => Promise<V>): Promise<V> {
      const entry = entries.get(key);
      const age = entry ? Date.now() - entry.storedAt : Number.POSITIVE_INFINITY;
      if (entry && age < ttlMs) return entry.value;
      if (entry && age < ttlMs + staleWhileRevalidateMs) {
        // Serve stale, refresh in the background. Swallow refresh errors —
        // the stale value keeps being served until it leaves the window.
        void load(key, loader).catch(() => {});
        return entry.value;
      }
      return load(key, loader);
    },
    peek(key: K): V | undefined {
      const entry = entries.get(key);
      if (!entry) return undefined;
      const age = Date.now() - entry.storedAt;
      return age < ttlMs + staleWhileRevalidateMs ? entry.value : undefined;
    },
    invalidate(key?: K): void {
      if (key === undefined) entries.clear();
      else entries.delete(key);
    },
    clear(): void {
      entries.clear();
      inFlight.clear();
    },
  };
}
