/**
 * Worker for db-busy-timeout.test.ts.
 *
 * Holds an IMMEDIATE (write) transaction on the SQLite file passed via
 * argv, drops a marker file once the lock is held, releases after
 * holdMs. Lets the test create real cross-process write contention.
 */

import { Database } from "bun:sqlite";
import * as fs from "node:fs";

const [dbFile, markerFile, holdMsRaw] = process.argv.slice(2);
if (!dbFile || !markerFile) {
  console.error("usage: busy-holder.ts <dbFile> <markerFile> [holdMs]");
  process.exit(2);
}
const holdMs = Number(holdMsRaw ?? "300");

const db = new Database(dbFile);
db.exec("BEGIN IMMEDIATE");
fs.writeFileSync(markerFile, "locked");
await new Promise((r) => setTimeout(r, holdMs));
db.exec("COMMIT");
db.close();
