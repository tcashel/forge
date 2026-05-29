/**
 * forge migrate — one-time backfill from ~/.forge/ JSON into forge.db.
 *
 * Phase 2 of the SQLite cutover (COO-84). Reads every Plan, spec
 * markdown, critique-meta.json, and run meta.json under ~/.forge/, then
 * inserts the corresponding rows into the SCHEMA.md tables.
 *
 * Idempotent — stable backfill IDs + INSERT OR IGNORE. The original JSON
 * files are not modified; Phase 5 owns deprecation cleanup.
 */

import { parseArgs } from "node:util";
import { type BackfillCounts, backfillFromJson } from "../../core/db/backfill.ts";
import type { ForgeStore } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge migrate [from-json] [...flags]

Backfill ~/.forge/ JSON state into forge.db. Idempotent — safe to re-run.

Flags:
  --json                    Machine-readable output

Subcommands:
  from-json                 Default; backfill JSON files into SQLite
`;

interface MigrateFlags {
  json: boolean;
}

function parseFlags(argv: string[]): MigrateFlags {
  const { values } = parseArgs({
    args: argv,
    options: { json: { type: "boolean" } },
    allowPositionals: true,
    strict: false,
  });
  return { json: Boolean(values.json) };
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const sub = argv[0] && !argv[0].startsWith("--") ? argv[0] : "from-json";
  const rest = sub === argv[0] ? argv.slice(1) : argv;

  if (sub !== "from-json") {
    throw new CliError("UNKNOWN_SUBCMD", `Unknown migrate subcommand: ${sub}`, {
      hint: "Try `forge migrate from-json`",
    });
  }

  const flags = parseFlags(rest);
  const counts = backfillFromJson(store, store.db.db);
  emitOk({ ok: true, counts }, flags.json, () => formatHuman(counts));
}

function formatHuman(counts: BackfillCounts): string {
  const lines = ["forge migrate from-json — done", ""];
  for (const [k, v] of Object.entries(counts)) {
    lines.push(`  ${k.padEnd(18)} ${v}`);
  }
  lines.push("", "Original ~/.forge/ files left in place. Re-run is a no-op.");
  return lines.join("\n");
}
