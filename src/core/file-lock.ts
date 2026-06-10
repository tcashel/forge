/**
 * Synchronous advisory file lock via `O_EXCL`.
 *
 * Wraps a critical section that does read-modify-write on a shared file
 * (e.g. ~/.forge/index.json). Blocks via Atomics.wait on a busy poll
 * until the lockfile can be created exclusively, then deletes it on
 * exit. Stays sync to match the existing ForgeStore API surface.
 *
 * The lockfile records the holder's pid + acquisition time so a lock
 * orphaned by a crash (SIGKILL, OOM, power loss — anything that skips
 * the finally) can be reclaimed: a lock is stale when its holder pid is
 * dead, or when it is older than `staleMs` (critical sections here are
 * millisecond-scale JSON rewrites, so an old lock means a hung or dead
 * holder, not a slow one).
 */

import * as fs from "node:fs";

const sleepBuffer = new Int32Array(new SharedArrayBuffer(4));

function sleepSync(ms: number): void {
  Atomics.wait(sleepBuffer, 0, 0, ms);
}

export interface FileLockOptions {
  timeoutMs?: number;
  retryMs?: number;
  /** Age beyond which an existing lock is reclaimed even if unreadable. */
  staleMs?: number;
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM means the pid exists but belongs to another user.
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

/**
 * Decide whether an existing lockfile can be reclaimed. Returns false on
 * ENOENT (holder released between our open attempt and the read — just
 * retry the open). Pre-pid-stamp lockfiles (empty body) fall back to the
 * mtime age check.
 */
function isLockStale(lockPath: string, staleMs: number): boolean {
  let raw: string;
  try {
    raw = fs.readFileSync(lockPath, "utf-8");
  } catch {
    return false;
  }
  try {
    const info = JSON.parse(raw) as { pid?: unknown; at?: unknown };
    if (typeof info.pid === "number" && !isPidAlive(info.pid)) return true;
    const at = typeof info.at === "string" ? Date.parse(info.at) : Number.NaN;
    if (!Number.isNaN(at)) return Date.now() - at > staleMs;
  } catch {
    /* unreadable body — fall through to mtime */
  }
  try {
    return Date.now() - fs.statSync(lockPath).mtimeMs > staleMs;
  } catch {
    return false;
  }
}

export function withFileLock<T>(lockPath: string, fn: () => T, opts: FileLockOptions = {}): T {
  const timeoutMs = opts.timeoutMs ?? 5000;
  const retryMs = opts.retryMs ?? 10;
  const staleMs = opts.staleMs ?? 30_000;
  const start = Date.now();

  let fd: number | undefined;
  while (true) {
    try {
      fd = fs.openSync(lockPath, "wx");
      fs.writeSync(fd, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));
      break;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw err;
      const stale = isLockStale(lockPath, staleMs);
      if (stale) {
        try {
          fs.unlinkSync(lockPath);
        } catch {
          /* another waiter reclaimed it first */
        }
      }
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Could not acquire lock ${lockPath} within ${timeoutMs}ms`);
      }
      if (!stale) sleepSync(retryMs); // reclaimed locks re-attempt the open immediately
    }
  }

  try {
    return fn();
  } finally {
    fs.closeSync(fd);
    try {
      fs.unlinkSync(lockPath);
    } catch {
      /* lock already removed */
    }
  }
}
