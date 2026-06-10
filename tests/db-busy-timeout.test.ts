/**
 * SQLite busy_timeout — regression for data-no-sqlite-busy-timeout:
 * bun:sqlite defaults busy_timeout to 0, so a write overlapping another
 * process's transaction (serve timers vs CLI vs runner session helpers)
 * threw SQLITE_BUSY immediately and the write was silently dropped.
 */

import { strict as assert } from "node:assert";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { ForgeDb } from "../src/core/db/connection.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const holderScript = path.join(__dirname, "fixtures", "busy-holder.ts");

function tmpForgeDir(t: { after: (fn: () => void) => void }): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-busy-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("connection opens with busy_timeout=5000", (t) => {
  const db = new ForgeDb({ forgeDir: tmpForgeDir(t) });
  t.after(() => db.close());
  const row = db.db.prepare("PRAGMA busy_timeout").get() as { timeout: number };
  assert.equal(row.timeout, 5000);
});

test("a write waits out another process's transaction instead of throwing SQLITE_BUSY", async (t) => {
  const forgeDir = tmpForgeDir(t);
  const db = new ForgeDb({ forgeDir });
  t.after(() => db.close());
  db.db.exec("CREATE TABLE IF NOT EXISTS busy_probe (id INTEGER PRIMARY KEY, note TEXT)");

  const marker = path.join(forgeDir, "holder.locked");
  const holder = spawn(process.execPath, [holderScript, db.dbFile, marker, "300"], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  let holderStderr = "";
  holder.stderr.on("data", (d) => {
    holderStderr += d.toString();
  });
  const holderExit = new Promise<number>((resolve) => holder.on("exit", (code) => resolve(code ?? -1)));

  // Wait for the holder to actually own the write lock.
  const deadline = Date.now() + 5000;
  while (!fs.existsSync(marker)) {
    assert.ok(Date.now() < deadline, `holder never acquired the lock: ${holderStderr}`);
    await new Promise((r) => setTimeout(r, 10));
  }

  // Pre-fix (busy_timeout=0) this threw SQLITE_BUSY immediately; with the
  // timeout it blocks until the holder commits, then succeeds.
  db.db.prepare("INSERT INTO busy_probe (note) VALUES (?)").run("contended write");

  assert.equal(await holderExit, 0, `holder failed: ${holderStderr}`);
  const row = db.db.prepare("SELECT COUNT(*) AS n FROM busy_probe").get() as { n: number };
  assert.equal(row.n, 1);
});
