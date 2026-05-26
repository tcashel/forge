/**
 * ForgeDb — SQLite-backed source of truth for plans, runs, sessions, and
 * critic activity. Constructed alongside `ForgeStore` from the same
 * `forgeDir`; migrations run eagerly on construction.
 *
 * Phase 1 lands the schema and connection only — read/write paths still
 * live in ForgeStore + the per-subsystem JSON files. Phase 3 begins
 * mirroring writes here.
 */

import { Database } from "bun:sqlite";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { runMigrations } from "./migrations.ts";

export interface ForgeDbOptions {
  /**
   * Override the forge state directory. Defaults to `~/.forge/`. Tests
   * pass an explicit path to isolate state. Matches the same pattern as
   * `ForgeStore`.
   */
  forgeDir?: string;
  /** Override the migrations directory (tests). */
  migrationsDir?: string;
}

export class ForgeDb {
  readonly forgeDir: string;
  readonly dbFile: string;
  readonly db: Database;

  constructor(opts: ForgeDbOptions = {}) {
    this.forgeDir = opts.forgeDir ?? path.join(os.homedir(), ".forge");
    fs.mkdirSync(this.forgeDir, { recursive: true });
    this.dbFile = path.join(this.forgeDir, "forge.db");
    this.db = new Database(this.dbFile);
    this.db.exec("PRAGMA journal_mode=WAL");
    this.db.exec("PRAGMA foreign_keys=ON");
    this.db.exec("PRAGMA synchronous=NORMAL");
    runMigrations(this.db, { migrationsDir: opts.migrationsDir });
  }

  close(): void {
    this.db.close();
  }
}
