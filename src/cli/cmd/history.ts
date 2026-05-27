/**
 * forge history <plan-id> — unified timeline of everything that happened
 * to a plan (spec versions, critiques, launches), newest first.
 *
 * Phase 4 of COO-84. Reads from SQLite; meta.json JSON files are not
 * consulted. If the plan is older than the SQLite cutover, run
 * `forge migrate from-json` first.
 */

import { parseArgs } from "node:util";
import { buildPlanHistory, type PlanHistoryEvent } from "../../core/history.ts";
import type { ForgeStore } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge history <plan-id> [...flags]

Show every recorded event for a plan — spec saves, critiques, launches.

Flags:
  --json                    Machine-readable output
`;

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    allowPositionals: true,
    strict: false,
  });

  const planId = positionals[0];
  if (!planId) {
    throw new CliError("MISSING_ARG", "Usage: forge history <plan-id>", { exitCode: 1 });
  }

  // Validating that the plan exists keeps the empty-list case unambiguous:
  // "the plan has no events" vs. "you typo'd the id" should surface different
  // error messages to the operator.
  const planRow = store.db.db.prepare("SELECT id FROM plans WHERE id = ?").get(planId);
  if (!planRow) {
    throw new CliError("UNKNOWN_PLAN", `No plan with id "${planId}".`, {
      hint: "Run `forge ls` to see known plan ids, or `forge migrate from-json` to backfill legacy ones.",
      exitCode: 1,
    });
  }

  const events = buildPlanHistory(store.db.db, planId);
  emitOk({ planId, events }, Boolean(values.json), () => formatHuman(planId, events));
}

function formatHuman(planId: string, events: PlanHistoryEvent[]): string {
  if (events.length === 0) {
    return `(no recorded events for ${planId} — try \`forge migrate from-json\` if this plan predates SQLite)`;
  }
  const lines = events.map((e) => `${formatTs(e.ts)}  ${e.kind.padEnd(22)}  ${e.summary}`);
  return lines.join("\n");
}

function formatTs(iso: string): string {
  // YYYY-MM-DD HH:MM — drops seconds + timezone to keep rows scannable.
  // Operators reaching for `forge history` are reconstructing a narrative,
  // not debugging clock skew.
  return iso.slice(0, 16).replace("T", " ");
}
