/**
 * One-off, idempotent backfill for execution sessions whose `model` was lost
 * to a launch race (the launch-time seed clobbered the runner's value with
 * null — fixed in recordJobStarted/upsertSession). Recovers the real model
 * from each run's `meta.json`.
 *
 * Run: `bun scripts/backfill-session-models.ts`
 *
 * Safe to re-run: only touches rows where `model IS NULL`. Reports how many
 * rows it filled, skipped (no meta / no model on disk), and left untouched.
 */

import { ForgeStore } from "../src/core/store.ts";

/** `j-<planId>-r<N>` (related_id) or `s-execution-j-<planId>-r<N>` (id) → planId. */
function planIdFrom(relatedId: string | null, sessionId: string): string | null {
  const jobId = relatedId ?? sessionId.replace(/^s-execution-/, "");
  const m = jobId.match(/^j-(.+)-r\d+$/);
  return m ? m[1] : null;
}

const store = new ForgeStore();
const db = store.db.db;

const rows = db
  .prepare("SELECT id, related_id FROM sessions WHERE purpose = 'execution' AND model IS NULL")
  .all() as Array<{ id: string; related_id: string | null }>;

let filled = 0;
let skipped = 0;
const update = db.prepare("UPDATE sessions SET model = ? WHERE id = ? AND model IS NULL");

for (const row of rows) {
  const planId = planIdFrom(row.related_id, row.id);
  const meta = planId ? store.readRunMeta(planId) : null;
  const model = meta && typeof meta.model === "string" && meta.model ? meta.model : null;
  if (!model) {
    skipped++;
    console.log(`skip  ${row.id} (planId=${planId ?? "?"}, no model in meta.json)`);
    continue;
  }
  update.run(model, row.id);
  filled++;
  console.log(`fill  ${row.id} → ${model}`);
}

const remaining = (
  db.prepare("SELECT COUNT(*) AS n FROM sessions WHERE purpose = 'execution' AND model IS NULL").get() as {
    n: number;
  }
).n;

console.log(`\nfilled=${filled} skipped=${skipped} remaining_null=${remaining}`);
