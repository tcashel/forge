/**
 * FORGE_HOME — env-var override for the ~/.forge state dir. Exists so
 * spawned subprocesses (tests, headless runs) can redirect state without
 * relying on HOME, which Bun's os.homedir() captures at process startup
 * (cli-bun-test-pollutes-real-forge-home).
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { ForgeDb } from "../src/core/db/connection.ts";
import { ForgeStore } from "../src/core/store.ts";

function withForgeHome(t: { after: (fn: () => void) => void }): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-home-"));
  const previous = process.env.FORGE_HOME;
  process.env.FORGE_HOME = dir;
  t.after(() => {
    if (previous === undefined) delete process.env.FORGE_HOME;
    else process.env.FORGE_HOME = previous;
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}

test("ForgeStore resolves its state dir from FORGE_HOME, not os.homedir()", (t) => {
  const dir = withForgeHome(t);
  const store = new ForgeStore();

  assert.equal(store.forgeDir, dir);
  assert.ok(store.indexFile.startsWith(dir));
  assert.ok(
    !store.indexFile.startsWith(path.join(os.homedir(), ".forge")),
    "FORGE_HOME must keep state out of the real ~/.forge",
  );
  assert.ok(fs.existsSync(path.join(dir, "specs")), "store dirs created under FORGE_HOME");
});

test("explicit forgeDir option wins over FORGE_HOME", (t) => {
  withForgeHome(t);
  const explicit = fs.mkdtempSync(path.join(os.tmpdir(), "forge-home-explicit-"));
  t.after(() => fs.rmSync(explicit, { recursive: true, force: true }));

  const store = new ForgeStore({ forgeDir: explicit });
  assert.equal(store.forgeDir, explicit);
});

test("ForgeDb honors FORGE_HOME the same way", (t) => {
  const dir = withForgeHome(t);
  const db = new ForgeDb();
  t.after(() => db.close());

  assert.equal(db.forgeDir, dir);
  assert.equal(db.dbFile, path.join(dir, "forge.db"));
});
