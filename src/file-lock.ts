/**
 * Synchronous advisory file lock via `O_EXCL`.
 *
 * Wraps a critical section that does read-modify-write on a shared file
 * (e.g. ~/.forge/index.json). Blocks via Atomics.wait on a busy poll
 * until the lockfile can be created exclusively, then deletes it on
 * exit. Stays sync to match the existing ForgeStore API surface.
 */

import * as fs from "node:fs";

const sleepBuffer = new Int32Array(new SharedArrayBuffer(4));

function sleepSync(ms: number): void {
  Atomics.wait(sleepBuffer, 0, 0, ms);
}

export interface FileLockOptions {
  timeoutMs?: number;
  retryMs?: number;
}

export function withFileLock<T>(lockPath: string, fn: () => T, opts: FileLockOptions = {}): T {
  const timeoutMs = opts.timeoutMs ?? 5000;
  const retryMs = opts.retryMs ?? 10;
  const start = Date.now();

  let fd: number | undefined;
  while (true) {
    try {
      fd = fs.openSync(lockPath, "wx");
      break;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw err;
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Could not acquire lock ${lockPath} within ${timeoutMs}ms`);
      }
      sleepSync(retryMs);
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
