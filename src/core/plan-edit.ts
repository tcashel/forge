import * as fs from "node:fs";
import * as path from "node:path";
import { atomicWriteJSON } from "./atomic-write.ts";
import { recordPlanVersionAdded } from "./db/writes.ts";
import {
  openQuestionsJson,
  type ParsedPlanDocument,
  type PlanSectionKey,
  parsePlanDocument,
  replacePlanBody,
  rewritePlanFrontmatter,
  stripFrontmatter,
  unifiedDiff,
  updatePlanSection,
} from "./plan-document.ts";
import type { ForgeStore, Plan } from "./store.ts";

export type PlanEditCreatedBy = "agent:planner" | "user";

export class PlanEditError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "PlanEditError";
    this.code = code;
    this.status = status;
  }
}

export interface PendingPlanEdit {
  version: 1;
  id: string;
  planId: string;
  baseVersion: number;
  baseDocument: string;
  proposedDocument: string;
  diff: string;
  createdBy: PlanEditCreatedBy;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  sections: ParsedPlanDocument["sections"];
  openQuestions: string[];
}

export interface PlanWorkspaceDocument {
  planId: string;
  specVersion: number;
  body: string;
  document: string;
  parsed: ParsedPlanDocument;
  openQuestionCount: number;
  pendingEdit: PendingPlanEdit | null;
}

function pendingEditPath(store: ForgeStore, planId: string): string {
  return path.join(store.specsDir, planId, "pending-plan-edit.json");
}

function ensurePlanDir(store: ForgeStore, planId: string): string {
  const dir = path.join(store.specsDir, planId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function newPendingEditId(): string {
  return `pe_${Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0")}`;
}

function requireTask(store: ForgeStore, planId: string): Plan {
  const task = store.getPlan(planId);
  if (!task) throw new PlanEditError("UNKNOWN_TASK", `No task with id "${planId}".`, 404);
  return task;
}

function requireDocument(store: ForgeStore, planId: string): string {
  const document = store.getSpec(planId);
  if (document === null) throw new PlanEditError("SPEC_MISSING", `No spec document for plan "${planId}".`, 404);
  return document;
}

export function readPendingPlanEdit(store: ForgeStore, planId: string): PendingPlanEdit | null {
  const p = pendingEditPath(store, planId);
  if (!fs.existsSync(p)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(p, "utf-8")) as PendingPlanEdit;
    if (parsed.version !== 1 || parsed.planId !== planId || typeof parsed.proposedDocument !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePendingPlanEdit(store: ForgeStore, edit: PendingPlanEdit): void {
  ensurePlanDir(store, edit.planId);
  atomicWriteJSON(pendingEditPath(store, edit.planId), edit);
}

export function deletePendingPlanEdit(store: ForgeStore, planId: string): void {
  fs.rmSync(pendingEditPath(store, planId), { force: true });
}

function editablePlanDocument(
  store: ForgeStore,
  task: Plan,
): {
  baseDocument: string;
  documentToEdit: string;
  baseVersion: number;
  existingEdit: PendingPlanEdit | null;
} {
  const currentDocument = requireDocument(store, task.id);
  const currentVersion = task.specVersion ?? 1;
  const existingEdit = readPendingPlanEdit(store, task.id);
  if (!existingEdit) {
    return {
      baseDocument: currentDocument,
      documentToEdit: currentDocument,
      baseVersion: currentVersion,
      existingEdit: null,
    };
  }
  if (currentDocument !== existingEdit.baseDocument || currentVersion !== existingEdit.baseVersion) {
    throw new PlanEditError(
      "STALE_EDIT",
      "Pending edit is based on an older spec version; reject it and ask the planner to re-apply.",
      409,
    );
  }
  return {
    baseDocument: existingEdit.baseDocument,
    documentToEdit: existingEdit.proposedDocument,
    baseVersion: existingEdit.baseVersion,
    existingEdit,
  };
}

export function getPlanWorkspaceDocument(store: ForgeStore, planId: string): PlanWorkspaceDocument {
  const task = requireTask(store, planId);
  const document = requireDocument(store, planId);
  const parsed = parsePlanDocument(document);
  const pendingEdit = readPendingPlanEdit(store, planId);
  return {
    planId,
    specVersion: task.specVersion ?? 1,
    body: stripFrontmatter(document),
    document,
    parsed,
    openQuestionCount: parsed.openQuestions.length,
    pendingEdit,
  };
}

export function stagePlanSectionEdit(opts: {
  store: ForgeStore;
  planId: string;
  section: PlanSectionKey;
  content: string;
  createdBy?: PlanEditCreatedBy;
  note?: string | null;
}): PendingPlanEdit {
  const task = requireTask(opts.store, opts.planId);
  const { baseDocument, documentToEdit, baseVersion, existingEdit } = editablePlanDocument(opts.store, task);
  const proposedDocument = updatePlanSection(documentToEdit, opts.section, opts.content);
  if (proposedDocument === documentToEdit) {
    throw new PlanEditError("NO_CHANGE", `Section "${opts.section}" already has that content.`, 409);
  }
  const now = new Date().toISOString();
  const parsed = parsePlanDocument(proposedDocument);
  const edit: PendingPlanEdit = {
    version: 1,
    id: existingEdit?.id ?? newPendingEditId(),
    planId: opts.planId,
    baseVersion,
    baseDocument,
    proposedDocument,
    diff: unifiedDiff(stripFrontmatter(baseDocument), stripFrontmatter(proposedDocument), "current", "proposed"),
    createdBy: opts.createdBy ?? "agent:planner",
    note: opts.note ?? null,
    createdAt: existingEdit?.createdAt ?? now,
    updatedAt: now,
    sections: parsed.sections,
    openQuestions: parsed.openQuestions,
  };
  writePendingPlanEdit(opts.store, edit);
  return edit;
}

export function stageOpenQuestion(opts: {
  store: ForgeStore;
  planId: string;
  question: string;
  createdBy?: PlanEditCreatedBy;
}): PendingPlanEdit {
  const task = requireTask(opts.store, opts.planId);
  const { documentToEdit } = editablePlanDocument(opts.store, task);
  const parsed = parsePlanDocument(documentToEdit);
  const existing = parsed.sections.open_questions.content.trim();
  const next = `${existing ? `${existing}\n` : ""}- [ ] ${opts.question.trim()}`;
  return stagePlanSectionEdit({
    store: opts.store,
    planId: opts.planId,
    section: "open_questions",
    content: next,
    createdBy: opts.createdBy ?? "agent:planner",
    note: "add open question",
  });
}

export function resolveOpenQuestion(opts: {
  store: ForgeStore;
  planId: string;
  query: string;
  createdBy?: PlanEditCreatedBy;
}): PendingPlanEdit {
  const task = requireTask(opts.store, opts.planId);
  const { documentToEdit } = editablePlanDocument(opts.store, task);
  const current = parsePlanDocument(documentToEdit);
  const needle = opts.query.trim().toLowerCase();
  const lines = current.sections.open_questions.content.split("\n");
  let changed = false;
  const nextLines = lines.map((line) => {
    const normalized = line.toLowerCase();
    if (changed || !normalized.includes(needle)) return line;
    const trimmed = line.trim();
    if (/^[-*]\s+\[[xX]\]/.test(trimmed)) return line;
    changed = true;
    if (/^[-*]\s+\[\s\]/.test(trimmed)) return line.replace(/\[\s\]/, "[x]");
    if (/^[-*]\s+/.test(trimmed)) return line.replace(/^(\s*[-*]\s+)/, "$1[x] ");
    return line;
  });
  if (!changed) throw new PlanEditError("QUESTION_NOT_FOUND", `No open question matched "${opts.query}".`, 404);
  return stagePlanSectionEdit({
    store: opts.store,
    planId: opts.planId,
    section: "open_questions",
    content: nextLines.join("\n"),
    createdBy: opts.createdBy ?? "agent:planner",
    note: "resolve open question",
  });
}

function persistDocumentVersion(opts: {
  store: ForgeStore;
  task: Plan;
  document: string;
  createdBy: PlanEditCreatedBy;
  notes?: string | null;
}): { task: Plan; document: string } {
  const nextVersion = (opts.task.specVersion ?? 1) + 1;
  const now = new Date().toISOString();
  const withFrontmatter = rewritePlanFrontmatter(opts.document, {
    specVersion: String(nextVersion),
    planEditedAt: now,
  });
  const specPath = opts.store.writeSpec(opts.task.id, withFrontmatter);
  const updatedTask: Plan = { ...opts.task, specVersion: nextVersion, specFile: specPath };
  opts.store.upsertPlan(updatedTask);
  // Phase 3 dual-write: DB failure is warned, not fatal — the spec file +
  // index.json above are the live source of truth during the cutover.
  // Throwing here would 500 an edit that already persisted (and in the
  // accept path skip deletePendingPlanEdit, wedging future accepts on
  // STALE_EDIT).
  try {
    recordPlanVersionAdded(opts.store.db.db, updatedTask, nextVersion, withFrontmatter, {
      createdBy: opts.createdBy,
      notes: opts.notes ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`warn: failed to record plan version v${nextVersion} for ${opts.task.id}: ${msg}\n`);
  }
  return { task: updatedTask, document: withFrontmatter };
}

export function acceptPendingPlanEdit(store: ForgeStore, planId: string): PlanWorkspaceDocument {
  const task = requireTask(store, planId);
  const edit = readPendingPlanEdit(store, planId);
  if (!edit) throw new PlanEditError("NO_PENDING_EDIT", `Plan "${planId}" has no pending edit.`, 404);
  const current = requireDocument(store, planId);
  if (current !== edit.baseDocument || (task.specVersion ?? 1) !== edit.baseVersion) {
    throw new PlanEditError(
      "STALE_EDIT",
      "Pending edit is based on an older spec version; reject it and ask the planner to re-apply.",
      409,
    );
  }
  persistDocumentVersion({
    store,
    task,
    document: edit.proposedDocument,
    createdBy: edit.createdBy,
    notes: edit.note,
  });
  deletePendingPlanEdit(store, planId);
  return getPlanWorkspaceDocument(store, planId);
}

export function rejectPendingPlanEdit(store: ForgeStore, planId: string): PlanWorkspaceDocument {
  requireTask(store, planId);
  deletePendingPlanEdit(store, planId);
  return getPlanWorkspaceDocument(store, planId);
}

export function applyDirectPlanBodyEdit(opts: {
  store: ForgeStore;
  planId: string;
  body: string;
  createdBy?: PlanEditCreatedBy;
}): PlanWorkspaceDocument {
  const task = requireTask(opts.store, opts.planId);
  const current = requireDocument(opts.store, opts.planId);
  const next = replacePlanBody(current, opts.body);
  if (next === current) throw new PlanEditError("NO_CHANGE", "Plan document is unchanged.", 409);
  persistDocumentVersion({
    store: opts.store,
    task,
    document: next,
    createdBy: opts.createdBy ?? "user",
    notes: "direct document edit",
  });
  deletePendingPlanEdit(opts.store, opts.planId);
  return getPlanWorkspaceDocument(opts.store, opts.planId);
}

export function summarizePlanForSse(
  store: ForgeStore,
  planId: string,
): {
  planId: string;
  specVersion: number;
  openQuestionCount: number;
  pendingEditId: string | null;
} | null {
  try {
    const doc = getPlanWorkspaceDocument(store, planId);
    return {
      planId,
      specVersion: doc.specVersion,
      openQuestionCount: doc.openQuestionCount,
      pendingEditId: doc.pendingEdit?.id ?? null,
    };
  } catch {
    return null;
  }
}

export function assertPlanCanLock(store: ForgeStore, planId: string): void {
  const questions = openQuestionsJson(requireDocument(store, planId));
  if (questions.length > 0) {
    throw new PlanEditError(
      "OPEN_QUESTIONS",
      `Plan "${planId}" still has ${questions.length} open question(s); resolve them before locking.`,
      409,
    );
  }
}
