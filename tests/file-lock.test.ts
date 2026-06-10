/**
 * withFileLock staleness reclaim — regression for the permanent stale
 * lockfile after a crash (data-stale-file-lock-unrecoverable): a lock
 * whose holder pid is dead, or whose age exceeds staleMs, must be
 * reclaimed instead of timing out forever; a fresh live-holder lock must
 * still block.
 */

import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { withFileLock } from "../src/core/file-lock.ts";

function tmpDir(t: { after: (fn: () => void) => void }): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-lock-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** Pid of a process that has already exited (and is reaped, so kill(pid,0) throws). */
function deadPid(): number {
  const child = spawnSync(process.execPath, ["-e", "0"], { stdio: "ignore" });
  assert.ok(child.pid, "spawned probe child");
  return child.pid;
}

test("reclaims a lock held by a dead pid", (t) => {
  const dir = tmpDir(t);
  const lockPath = path.join(dir, "index.json.lock");
  fs.writeFileSync(lockPath, JSON.stringify({ pid: deadPid(), at: new Date().toISOString() }));

  const start = Date.now();
  const result = withFileLock(lockPath, () => "ran", { timeoutMs: 2000 });
  assert.equal(result, "ran");
  assert.ok(Date.now() - start < 1000, "reclaim must not burn the timeout busy-waiting");
  assert.ok(!fs.existsSync(lockPath), "lock released after the critical section");
});

test("reclaims a lock older than staleMs even when unreadable (legacy empty lockfile)", (t) => {
  const dir = tmpDir(t);
  const lockPath = path.join(dir, "index.json.lock");
  fs.writeFileSync(lockPath, ""); // pre-pid-stamp format
  const old = new Date(Date.now() - 60_000);
  fs.utimesSync(lockPath, old, old);

  const result = withFileLock(lockPath, () => "ran", { timeoutMs: 2000, staleMs: 30_000 });
  assert.equal(result, "ran");
});

test("reclaims a live-pid lock whose age exceeds staleMs (hung holder)", (t) => {
  const dir = tmpDir(t);
  const lockPath = path.join(dir, "index.json.lock");
  fs.writeFileSync(lockPath, JSON.stringify({ pid: process.pid, at: new Date(Date.now() - 60_000).toISOString() }));

  const result = withFileLock(lockPath, () => "ran", { timeoutMs: 2000, staleMs: 30_000 });
  assert.equal(result, "ran");
});

test("a fresh lock held by a live pid still blocks until timeout", (t) => {
  const dir = tmpDir(t);
  const lockPath = path.join(dir, "index.json.lock");
  fs.writeFileSync(lockPath, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));

  assert.throws(() => withFileLock(lockPath, () => "ran", { timeoutMs: 150, retryMs: 10 }), /Could not acquire lock/);
  assert.ok(fs.existsSync(lockPath), "live holder's lock must not be deleted");
});

test("acquired locks record holder pid + timestamp for future staleness checks", (t) => {
  const dir = tmpDir(t);
  const lockPath = path.join(dir, "index.json.lock");

  withFileLock(lockPath, () => {
    const info = JSON.parse(fs.readFileSync(lockPath, "utf-8")) as { pid: number; at: string };
    assert.equal(info.pid, process.pid);
    assert.ok(!Number.isNaN(Date.parse(info.at)));
  });
});
