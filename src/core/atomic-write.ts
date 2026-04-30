/**
 * Atomic file writes — write to a temp sibling, fsync, rename.
 *
 * Two writers racing on the same path can never produce a torn file:
 * each writes its own temp, and `rename(2)` is atomic on POSIX. Last
 * writer wins (the resulting file is one of the two complete payloads,
 * never a mix). For read-modify-write callers that need lost-update
 * protection on top of this, wrap them in `withFileLock`.
 */

import * as fs from "node:fs";

function tempPath(target: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${target}.tmp.${process.pid}.${rand}`;
}

function fsyncFile(path: string): void {
  const fd = fs.openSync(path, "r+");
  try {
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

export function atomicWriteText(targetPath: string, content: string): void {
  const tmp = tempPath(targetPath);
  fs.writeFileSync(tmp, content, "utf-8");
  fsyncFile(tmp);
  fs.renameSync(tmp, targetPath);
}

export function atomicWriteJSON(targetPath: string, value: unknown): void {
  atomicWriteText(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}
