/**
 * forge plan <get|update|set-question|resolve-question|accept|reject|lock>
 *
 * Conversation-led plan authoring side-channel. The Workbench planner
 * uses `update`/question verbs from its Bash tool; those calls stage
 * reviewable pending edits. Human accept/reject happens in Workbench or
 * via this CLI.
 */

import * as fs from "node:fs";
import { parseArgs } from "node:util";
import { PLAN_SECTION_DEFS, type PlanSectionKey } from "../../core/plan-document.ts";
import {
  acceptPendingPlanEdit,
  assertPlanCanLock,
  getPlanWorkspaceDocument,
  rejectPendingPlanEdit,
  resolveOpenQuestion,
  stageOpenQuestion,
  stagePlanSectionEdit,
} from "../../core/plan-edit.ts";
import type { ForgeStore } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";
import { readStdin } from "../pickers.ts";

export const HELP = `forge plan <get|update|set-question|resolve-question|accept|reject|lock> [...flags]

Live plan document editing for the Workbench planner conversation.

forge plan get <plan-id> [--json]
  Print the current structured plan document, open-question count, and any
  pending edit.

forge plan update <plan-id> --section <name> [--content <text> | --from-file <path> | -] [--note <text>] [--json]
  Stage a reviewable edit to one structured section. This does not rewrite
  the spec silently; it creates a pending diff for the human to accept/reject.
  Sections: ${PLAN_SECTION_DEFS.map((s) => s.key).join(", ")}

forge plan set-question <plan-id> <question> [--json]
  Stage an addition to the Open Questions section.

forge plan resolve-question <plan-id> <text-to-match> [--json]
  Stage resolution of the first matching Open Questions bullet.

forge plan accept <plan-id> [--json]
  Accept the pending edit, persist the spec, and write a plan_versions row.

forge plan reject <plan-id> [--json]
  Reject the pending edit.

forge plan lock <plan-id> [--json]
  Validate that the plan has no open questions. Lock-state persistence is
  intentionally deferred; this is the server-side gate the planner can call.
`;

const SECTION_KEYS = new Set<string>(PLAN_SECTION_DEFS.map((s) => s.key));

function sectionFromString(raw: string | undefined): PlanSectionKey {
  if (!raw || !SECTION_KEYS.has(raw)) {
    throw new CliError("BAD_SECTION", `--section must be one of: ${PLAN_SECTION_DEFS.map((s) => s.key).join(", ")}`, {
      exitCode: 1,
    });
  }
  return raw as PlanSectionKey;
}

async function readContent(
  values: { content?: string | boolean; "from-file"?: string | boolean },
  positionals: string[],
): Promise<string> {
  if (typeof values.content === "string") return values.content;
  if (typeof values["from-file"] === "string") return fs.readFileSync(values["from-file"], "utf-8");
  if (positionals.includes("-")) return await readStdin();
  return await readStdin();
}

function renderWorkspace(doc: ReturnType<typeof getPlanWorkspaceDocument>): string {
  const lines: string[] = [];
  lines.push(`# ${doc.parsed.title ?? doc.planId}`);
  lines.push("");
  lines.push(`specVersion: ${doc.specVersion}`);
  lines.push(`openQuestions: ${doc.openQuestionCount}`);
  lines.push(`pendingEdit: ${doc.pendingEdit ? doc.pendingEdit.id : "none"}`);
  lines.push("");
  for (const def of PLAN_SECTION_DEFS) {
    const section = doc.parsed.sections[def.key];
    lines.push(`## ${def.title}`);
    lines.push(section.content || "(empty)");
    lines.push("");
  }
  if (doc.pendingEdit) {
    lines.push("## Pending Diff");
    lines.push(doc.pendingEdit.diff || "(no diff)");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

async function runGet(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    strict: false,
    allowPositionals: true,
  });
  const planId = positionals[0];
  if (!planId) throw new CliError("MISSING_ARG", "Usage: forge plan get <plan-id> [--json]", { exitCode: 1 });
  const doc = getPlanWorkspaceDocument(store, planId);
  emitOk(doc, values.json === true, () => renderWorkspace(doc));
}

async function runUpdate(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      section: { type: "string" },
      content: { type: "string" },
      "from-file": { type: "string" },
      note: { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });
  const planId = positionals[0];
  if (!planId)
    throw new CliError("MISSING_ARG", "Usage: forge plan update <plan-id> --section <name> [-]", { exitCode: 1 });
  const section = sectionFromString(values.section as string | undefined);
  const content = await readContent(values, positionals.slice(1));
  if (!content.trim()) throw new CliError("EMPTY_INPUT", "section content is empty.", { exitCode: 1 });
  const edit = stagePlanSectionEdit({
    store,
    planId,
    section,
    content,
    createdBy: "agent:planner",
    note: typeof values.note === "string" ? values.note : null,
  });
  emitOk(edit, values.json === true, () => `staged ${edit.id} for ${planId} (${section})`);
}

async function runSetQuestion(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    strict: false,
    allowPositionals: true,
  });
  const [planId, ...rest] = positionals;
  const question = rest.join(" ").trim();
  if (!planId || !question)
    throw new CliError("MISSING_ARG", "Usage: forge plan set-question <plan-id> <question>", { exitCode: 1 });
  const edit = stageOpenQuestion({ store, planId, question, createdBy: "agent:planner" });
  emitOk(edit, values.json === true, () => `staged ${edit.id} adding open question`);
}

async function runResolveQuestion(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    strict: false,
    allowPositionals: true,
  });
  const [planId, ...rest] = positionals;
  const query = rest.join(" ").trim();
  if (!planId || !query)
    throw new CliError("MISSING_ARG", "Usage: forge plan resolve-question <plan-id> <text-to-match>", { exitCode: 1 });
  const edit = resolveOpenQuestion({ store, planId, query, createdBy: "agent:planner" });
  emitOk(edit, values.json === true, () => `staged ${edit.id} resolving open question`);
}

async function runAccept(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    strict: false,
    allowPositionals: true,
  });
  const planId = positionals[0];
  if (!planId) throw new CliError("MISSING_ARG", "Usage: forge plan accept <plan-id>", { exitCode: 1 });
  const doc = acceptPendingPlanEdit(store, planId);
  emitOk(doc, values.json === true, () => `accepted pending edit; ${planId} is now v${doc.specVersion}`);
}

async function runReject(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    strict: false,
    allowPositionals: true,
  });
  const planId = positionals[0];
  if (!planId) throw new CliError("MISSING_ARG", "Usage: forge plan reject <plan-id>", { exitCode: 1 });
  const doc = rejectPendingPlanEdit(store, planId);
  emitOk(doc, values.json === true, () => `rejected pending edit for ${planId}`);
}

async function runLock(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    strict: false,
    allowPositionals: true,
  });
  const planId = positionals[0];
  if (!planId) throw new CliError("MISSING_ARG", "Usage: forge plan lock <plan-id>", { exitCode: 1 });
  assertPlanCanLock(store, planId);
  emitOk({ planId, lockable: true }, values.json === true, () => `plan ${planId} is lockable`);
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const sub = argv[0];
  if (!sub || sub === "--help" || sub === "-h") {
    process.stderr.write("Usage: forge plan <get|update|set-question|resolve-question|accept|reject|lock> [...args]\n");
    process.exit(sub ? 0 : 1);
  }
  try {
    switch (sub) {
      case "get":
        return await runGet(argv.slice(1), store);
      case "update":
        return await runUpdate(argv.slice(1), store);
      case "set-question":
        return await runSetQuestion(argv.slice(1), store);
      case "resolve-question":
        return await runResolveQuestion(argv.slice(1), store);
      case "accept":
        return await runAccept(argv.slice(1), store);
      case "reject":
        return await runReject(argv.slice(1), store);
      case "lock":
        return await runLock(argv.slice(1), store);
      default:
        throw new CliError("UNKNOWN_SUBCMD", `Unknown plan subcommand: ${sub}`, {
          hint: "Try: forge plan get | update | set-question | resolve-question | accept | reject | lock",
          exitCode: 1,
        });
    }
  } catch (e) {
    if (e instanceof CliError) throw e;
    const err = e as { code?: string; message?: string };
    throw new CliError(err.code ?? "PLAN_EDIT_FAILED", err.message ?? String(e), { exitCode: 1 });
  }
}
