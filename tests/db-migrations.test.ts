/**
 * Phase 1 SQLite foundation — migration runner smoke tests.
 *
 * Verifies that opening a fresh ForgeDb creates the schema, that running
 * migrations a second time is a no-op (idempotent), and that the FTS5
 * trigger keeps plan_search_index in sync with plan_versions inserts.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { ForgeDb } from "../src/core/db/connection.ts";
import { runMigrations } from "../src/core/db/migrations.ts";

function tmpForgeDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "forge-db-"));
}

test("ForgeDb creates forge.db under forgeDir and applies all migrations", () => {
  const forgeDir = tmpForgeDir();
  try {
    const fdb = new ForgeDb({ forgeDir });
    assert.equal(fdb.dbFile, path.join(forgeDir, "forge.db"));
    assert.ok(fs.existsSync(fdb.dbFile));

    const history = fdb.db.prepare("SELECT filename FROM _migration_history ORDER BY filename").all() as Array<{
      filename: string;
    }>;
    assert.deepEqual(
      history.map((r) => r.filename),
      ["0001_phase1_schema.sql", "0002_phase2_schema.sql"],
    );

    fdb.close();
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("Phase 1 + Phase 2 tables exist with expected names", () => {
  const forgeDir = tmpForgeDir();
  try {
    const fdb = new ForgeDb({ forgeDir });
    const rows = fdb.db
      .prepare("SELECT name FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name")
      .all() as Array<{ name: string }>;
    const names = rows.map((r) => r.name);

    const expected = [
      // phase 1
      "plans",
      "plan_versions",
      "notes",
      "critic_configs",
      "critic_panels",
      "critic_runs",
      "critic_syntheses",
      "disagreement_adjudications",
      "sessions",
      "session_events",
      "plan_search_index",
      "settings",
      // phase 2
      "tasks",
      "jobs",
      "artifacts",
      "blobs",
      "review_queue_items",
      // bookkeeping
      "_migration_history",
    ];
    for (const t of expected) {
      assert.ok(names.includes(t), `missing table: ${t}`);
    }

    fdb.close();
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("runMigrations is idempotent when re-run on the same database", () => {
  const forgeDir = tmpForgeDir();
  try {
    const fdb = new ForgeDb({ forgeDir });
    const applied = runMigrations(fdb.db);
    assert.deepEqual(applied, [], "second run should apply zero new migrations");

    const count = fdb.db.prepare("SELECT COUNT(*) AS n FROM _migration_history").get() as { n: number };
    assert.equal(count.n, 2);

    fdb.close();
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("FTS5 trigger denormalizes title + intent from plans on plan_versions insert", () => {
  const forgeDir = tmpForgeDir();
  try {
    const fdb = new ForgeDb({ forgeDir });
    const now = new Date().toISOString();

    fdb.db
      .prepare(
        `INSERT INTO plans (id, title, stage, intent, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run("plan-1", "Add observability", "drafting", "fix the meta.json overwrite", now, now);

    fdb.db
      .prepare(
        `INSERT INTO plan_versions (id, plan_id, version_number, document, sections, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run("pv-1", "plan-1", 1, "## Goal\nLand SQLite.", "{}", "user", now);

    const hits = fdb.db
      .prepare("SELECT plan_id, title, intent FROM plan_search_index WHERE plan_search_index MATCH ?")
      .all("SQLite") as Array<{ plan_id: string; title: string; intent: string }>;
    assert.equal(hits.length, 1);
    assert.equal(hits[0].plan_id, "plan-1");
    assert.equal(hits[0].title, "Add observability");
    assert.equal(hits[0].intent, "fix the meta.json overwrite");

    fdb.close();
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});

test("Foreign key constraints are enforced (PRAGMA foreign_keys=ON)", () => {
  const forgeDir = tmpForgeDir();
  try {
    const fdb = new ForgeDb({ forgeDir });
    assert.throws(() => {
      fdb.db
        .prepare(
          `INSERT INTO plan_versions (id, plan_id, version_number, document, sections, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run("orphan", "no-such-plan", 1, "x", "{}", "user", new Date().toISOString());
    }, /FOREIGN KEY/i);
    fdb.close();
  } finally {
    fs.rmSync(forgeDir, { recursive: true, force: true });
  }
});
