/**
 * Migration runner — applies `migrations/NNNN_*.sql` files in lexical order.
 *
 * Files are plain SQL so Track B (Juicer, Rust) can apply the same set.
 * Idempotent: each file applied at most once; tracked in `_migration_history`.
 * Forward-only — no downgrades.
 */

import type { Database } from "bun:sqlite";
import * as fs from "node:fs";
import * as path from "node:path";

const HISTORY_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS _migration_history (
    filename    TEXT PRIMARY KEY,
    applied_at  TEXT NOT NULL
  )
`;

const DEFAULT_MIGRATIONS_DIR = path.join(import.meta.dir, "..", "..", "..", "migrations");

export interface MigrationsOpts {
  /** Override the migrations directory (tests). Defaults to `<repo>/migrations/`. */
  migrationsDir?: string;
}

export function runMigrations(db: Database, opts: MigrationsOpts = {}): string[] {
  const dir = opts.migrationsDir ?? DEFAULT_MIGRATIONS_DIR;
  db.exec(HISTORY_TABLE_SQL);

  const applied = new Set(
    (db.prepare("SELECT filename FROM _migration_history").all() as Array<{ filename: string }>).map((r) => r.filename),
  );

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const newlyApplied: string[] = [];
  for (const filename of files) {
    if (applied.has(filename)) continue;
    const sql = fs.readFileSync(path.join(dir, filename), "utf-8");
    db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO _migration_history (filename, applied_at) VALUES (?, ?)").run(
        filename,
        new Date().toISOString(),
      );
    })();
    newlyApplied.push(filename);
  }
  return newlyApplied;
}
