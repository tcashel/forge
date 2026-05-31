import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export const PLAN_SECTION_DEFS = [
  { key: "goals", title: "Goals", aliases: ["goal", "goals", "what we're building", "what we are building"] },
  { key: "constraints", title: "Constraints", aliases: ["constraint", "constraints"] },
  { key: "non_goals", title: "Non-goals", aliases: ["non-goal", "non-goals", "non goals", "out of scope"] },
  { key: "approach", title: "Approach", aliases: ["approach", "implementation notes", "implementation plan"] },
  { key: "risks", title: "Risks", aliases: ["risk", "risks"] },
  {
    key: "open_questions",
    title: "Open Questions",
    aliases: ["open question", "open questions", "unresolved questions"],
  },
  {
    key: "acceptance_criteria",
    title: "Acceptance Criteria",
    aliases: ["acceptance criterion", "acceptance criteria", "quality gates"],
  },
] as const;

export type PlanSectionKey = (typeof PLAN_SECTION_DEFS)[number]["key"];

export interface PlanSection {
  key: PlanSectionKey;
  title: string;
  content: string;
  present: boolean;
}

export interface ParsedPlanDocument {
  title: string | null;
  body: string;
  sections: Record<PlanSectionKey, PlanSection>;
  openQuestions: string[];
}

const FRONTMATTER_RE = /^---\s*\n[\s\S]*?\n---\s*\n?/;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/gm;

function normalizeHeading(s: string): string {
  return s
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const KEY_BY_NORMALIZED = new Map<string, PlanSectionKey>();
for (const def of PLAN_SECTION_DEFS) {
  KEY_BY_NORMALIZED.set(normalizeHeading(def.title), def.key);
  for (const alias of def.aliases) KEY_BY_NORMALIZED.set(normalizeHeading(alias), def.key);
}

export function stripFrontmatter(content: string): string {
  return content.replace(FRONTMATTER_RE, "");
}

export function splitFrontmatter(content: string): { frontmatter: string | null; body: string } {
  const m = content.match(FRONTMATTER_RE);
  if (!m) return { frontmatter: null, body: content };
  return { frontmatter: m[0], body: content.slice(m[0].length) };
}

function blankSections(): Record<PlanSectionKey, PlanSection> {
  const out = {} as Record<PlanSectionKey, PlanSection>;
  for (const def of PLAN_SECTION_DEFS) {
    out[def.key] = { key: def.key, title: def.title, content: "", present: false };
  }
  return out;
}

function headingSpans(
  body: string,
): Array<{ level: number; title: string; start: number; contentStart: number; end: number }> {
  const spans: Array<{ level: number; title: string; start: number; contentStart: number; end: number }> = [];
  HEADING_RE.lastIndex = 0;
  let m = HEADING_RE.exec(body);
  while (m !== null) {
    spans.push({
      level: m[1].length,
      title: m[2].trim(),
      start: m.index,
      contentStart: HEADING_RE.lastIndex,
      end: body.length,
    });
    m = HEADING_RE.exec(body);
  }
  for (let i = 0; i < spans.length; i++) {
    spans[i].end = spans[i + 1]?.start ?? body.length;
  }
  return spans;
}

export function parsePlanDocument(document: string): ParsedPlanDocument {
  const body = stripFrontmatter(document);
  const title = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null;
  const sections = blankSections();

  for (const span of headingSpans(body)) {
    if (span.level !== 2) continue;
    const key = KEY_BY_NORMALIZED.get(normalizeHeading(span.title));
    if (!key) continue;
    sections[key] = {
      key,
      title: span.title,
      content: body.slice(span.contentStart, span.end).trim(),
      present: true,
    };
  }

  const openQuestions = extractOpenQuestions(sections.open_questions.content);
  return { title, body, sections, openQuestions };
}

export function sectionsJson(document: string): Record<PlanSectionKey, string> {
  const parsed = parsePlanDocument(document);
  const out = {} as Record<PlanSectionKey, string>;
  for (const def of PLAN_SECTION_DEFS) out[def.key] = parsed.sections[def.key].content;
  return out;
}

export function openQuestionsJson(document: string): string[] {
  return parsePlanDocument(document).openQuestions;
}

export function extractOpenQuestions(content: string): string[] {
  const questions: string[] = [];
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const bullet = line.match(/^[-*]\s+(?:\[( |x|X)\]\s*)?(.*)$/);
    if (!bullet) continue;
    if (bullet[1]?.toLowerCase() === "x") continue;
    const text = bullet[2].trim();
    if (!text || /^(none|n\/a|na|no open questions|resolved)$/i.test(text)) continue;
    questions.push(text);
  }
  return questions;
}

export function updatePlanSection(document: string, key: PlanSectionKey, content: string): string {
  const def = PLAN_SECTION_DEFS.find((s) => s.key === key);
  if (!def) throw new Error(`Unknown plan section: ${key}`);

  const { frontmatter, body } = splitFrontmatter(document);
  const spans = headingSpans(body);
  const target = spans.find((span) => span.level === 2 && KEY_BY_NORMALIZED.get(normalizeHeading(span.title)) === key);
  const normalizedContent = content.trimEnd();

  let nextBody: string;
  if (target) {
    const before = body.slice(0, target.contentStart).replace(/\s+$/g, "");
    const afterRaw = body.slice(target.end);
    const after = afterRaw.length > 0 ? `\n\n${afterRaw.replace(/^\n+/, "")}` : "\n";
    nextBody = `${before}\n\n${normalizedContent}${after}`;
  } else {
    const sep = body.trimEnd().length > 0 ? "\n\n" : "";
    nextBody = `${body.trimEnd()}${sep}## ${def.title}\n\n${normalizedContent}\n`;
  }

  return `${frontmatter ?? ""}${nextBody.replace(/\s+$/g, "")}\n`;
}

export function replacePlanBody(document: string, body: string): string {
  const { frontmatter } = splitFrontmatter(document);
  return `${frontmatter ?? ""}${body.replace(/^\n+/, "").replace(/\s+$/g, "")}\n`;
}

export function rewritePlanFrontmatter(document: string, patch: Record<string, string>): string {
  const { frontmatter, body } = splitFrontmatter(document);
  if (!frontmatter) {
    const lines = ["---", ...Object.entries(patch).map(([k, v]) => `${k}: ${v}`), "---", ""];
    return `${lines.join("\n")}${body.replace(/^\n+/, "")}`;
  }
  const inner = frontmatter.replace(/^---\s*\n/, "").replace(/\n---\s*\n?$/, "");
  const seen = new Set<string>();
  const lines = inner.split("\n").map((line) => {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) return line;
    const key = m[1];
    if (!(key in patch)) return line;
    seen.add(key);
    return `${key}: ${patch[key]}`;
  });
  for (const [key, value] of Object.entries(patch)) {
    if (!seen.has(key)) lines.push(`${key}: ${value}`);
  }
  return `---\n${lines.join("\n")}\n---\n${body.replace(/^\n+/, "")}`;
}

export function unifiedDiff(oldText: string, newText: string, oldLabel = "current", newLabel = "proposed"): string {
  if (oldText === newText) return "";
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-plan-diff-"));
  const oldPath = path.join(tmpDir, "old.md");
  const newPath = path.join(tmpDir, "new.md");
  fs.writeFileSync(oldPath, oldText);
  fs.writeFileSync(newPath, newText);
  try {
    return execFileSync("diff", ["-u", "--label", oldLabel, "--label", newLabel, oldPath, newPath], {
      encoding: "utf-8",
    });
  } catch (e) {
    const err = e as { status?: number; stdout?: Buffer | string };
    if (err.status === 1 && err.stdout != null) {
      return typeof err.stdout === "string" ? err.stdout : err.stdout.toString();
    }
    throw e;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
