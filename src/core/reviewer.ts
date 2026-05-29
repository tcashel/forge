/**
 * Forge Reviewer — shared prompt-building helpers for the forge-reviewer skill.
 *
 * Used by:
 *   1. The `/forge-review <pr>` chat command (full prompt, interactive)
 *   2. The post-PR automatic reviewer step in the runner script (prefix only,
 *      dynamic portions composed at runtime by bash / supervisor)
 *   3. The ad-hoc reviewer launched from the Workbench review page
 *      (parseForgeReviewFindings + extractLastForgeReviewBlock)
 */

import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

export interface ReviewerPromptArgs {
  prNum: number;
  repoName: string;
  skillsDir: string;
  prInfoJson: string;
  ciChecks: string;
  diff: string;
  linkedSpec: string | null;
}

function loadSkillBody(skillsDir: string): string {
  try {
    return fs.readFileSync(path.join(skillsDir, "SKILL.md"), "utf-8");
  } catch {
    return "";
  }
}

/**
 * Build the static portion of the reviewer prompt: header, skill body,
 * companion-file references, instruction footer. Does NOT include PR
 * metadata, CI checks, linked spec, or diff — those are appended at
 * runtime by the runner script or supervisor.
 */
export function buildReviewerPromptPrefix(args: { repoName: string; skillsDir: string }): string {
  const skillBody = loadSkillBody(args.skillsDir);
  return [
    `Please review the PR in ${args.repoName}.`,
    "",
    "## forge-reviewer skill",
    "",
    "Use these instructions. Companion files (severity, scoring) sit alongside this SKILL.md and you can `read` them at:",
    `- ${path.join(args.skillsDir, "severity.md")}`,
    `- ${path.join(args.skillsDir, "scoring.md")}`,
    "",
    skillBody.trim(),
    "",
  ].join("\n");
}

/**
 * Build the static prefix for the fixer agent prompt: header + forge-fixer skill body.
 * Dynamic sections (spec, review findings) are appended at runtime by the runner script.
 */
export function buildFixerPromptPrefix(args: { skillsDir: string }): string {
  const skillBody = loadSkillBody(args.skillsDir);
  return [
    "You are auto-fixing a PR based on reviewer findings.",
    "",
    "## forge-fixer skill",
    "",
    skillBody.trim(),
    "",
  ].join("\n");
}

/**
 * Build the full one-shot reviewer prompt — identical to what the
 * `/forge-review` chat command produces. Implemented in terms of
 * `buildReviewerPromptPrefix` plus the dynamic sections.
 */
export function buildReviewerPrompt(args: ReviewerPromptArgs): string {
  const prefix = buildReviewerPromptPrefix({
    repoName: args.repoName,
    skillsDir: args.skillsDir,
  });

  // Re-write the first line to include the PR number (prefix uses generic wording)
  const prefixWithPr = prefix.replace(
    `Please review the PR in ${args.repoName}.`,
    `Please review PR #${args.prNum} in ${args.repoName}.`,
  );

  const truncated = args.diff.length > 60_000;
  const trimmedDiff = truncated
    ? `${args.diff.slice(0, 60_000)}\n\n...(diff truncated for context budget; use \`gh pr diff <num>\` to see more)`
    : args.diff;

  const specSection = args.linkedSpec
    ? `## Linked Forge spec\n\n\`\`\`markdown\n${args.linkedSpec}\n\`\`\`\n`
    : "## Linked Forge spec\n\n(no forge spec linked to this branch — review against general engineering criteria)\n";

  return [
    prefixWithPr,
    "## PR metadata",
    "",
    "```json",
    args.prInfoJson,
    "```",
    "",
    "## CI checks",
    "",
    "```",
    args.ciChecks,
    "```",
    "",
    specSection,
    "",
    "## Diff",
    "",
    "```diff",
    trimmedDiff,
    "```",
    "",
    "Now produce the review in a single ```forge-review fenced block per the skill instructions.",
  ].join("\n");
}

// ─── Forge-review block extraction + finding parser ──────────────────────────
//
// Mirrors the bash extractor at src/core/launch.ts:733 but as pure TS so the
// ad-hoc reviewer orchestrator can reuse it without shelling to python.

export type ForgeFindingSeverity = "BLOCKER" | "HIGH" | "MEDIUM" | "LOW";

export interface ForgeFinding {
  id: string;
  severity: ForgeFindingSeverity;
  title: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  evidence: string | null;
  why: string;
  fix: string;
}

const VALID_SEVERITIES: ReadonlySet<ForgeFindingSeverity> = new Set(["BLOCKER", "HIGH", "MEDIUM", "LOW"]);

/**
 * Detect a fenced-code-block marker line (``` or ~~~, optionally indented).
 * An info string after the fence (```text, ```diff, …) marks an *opening*
 * fence; a bare fence closes the innermost open block.
 */
function classifyFence(line: string): { fence: boolean; opening: boolean } {
  const m = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
  if (!m) return { fence: false, opening: false };
  return { fence: true, opening: m[2].trim().length > 0 };
}

/**
 * Extract the LAST ```forge-review fenced block from raw reviewer output.
 *
 * Codex-as-reviewer echoes the SKILL.md template (whose verdict line is a
 * literal angle-bracketed placeholder) before producing the real review, so
 * we always take the last match. Returns null if no fenced block is found.
 *
 * The reviewer routinely nests fenced code blocks inside the review — most
 * commonly a ```text / ```diff under **Evidence:**. A naive non-greedy
 * `(.*?)\n```` regex stops at the FIRST inner fence, truncating the block
 * right after the first `**Evidence:**` and silently dropping every Why /
 * Fix / later finding. We instead scan line-by-line and track fence depth
 * so nested code blocks are preserved and only the matching outer fence
 * closes the review.
 */
export function extractLastForgeReviewBlock(rawMd: string): string | null {
  if (!rawMd) return null;
  const lines = rawMd.split(/\r?\n/);
  let last: string | null = null;
  let i = 0;
  while (i < lines.length) {
    if (!/^\s{0,3}```forge-review\s*$/.test(lines[i])) {
      i++;
      continue;
    }
    // Opening forge-review fence — capture until the matching close,
    // tracking nested fences so an inner ```text doesn't end the block.
    const buf: string[] = [];
    let depth = 1;
    i++;
    while (i < lines.length && depth > 0) {
      const line = lines[i];
      const f = classifyFence(line);
      if (f.fence && f.opening) {
        depth++;
        buf.push(line);
      } else if (f.fence) {
        depth--;
        // A bare fence at depth>0 closes a *nested* block — keep it. At
        // depth 0 it closes the forge-review block itself — drop it.
        if (depth > 0) buf.push(line);
      } else {
        buf.push(line);
      }
      i++;
    }
    last = buf.join("\n");
  }
  return last;
}

export type ReviewVerdict = "approve" | "request-changes" | "block";

const VALID_VERDICTS: ReadonlySet<ReviewVerdict> = new Set(["approve", "request-changes", "block"]);

/**
 * Parse the `## Verdict` line from an extracted forge-review block. Returns
 * null when the heading is missing or the value isn't one of the three
 * recognised verdicts.
 */
export function parseForgeReviewVerdict(block: string): ReviewVerdict | null {
  if (!block) return null;
  const m = block.match(/^##\s*Verdict\s*\n\s*(\S+)/m);
  if (!m) return null;
  const verdict = m[1].trim().toLowerCase();
  return VALID_VERDICTS.has(verdict as ReviewVerdict) ? (verdict as ReviewVerdict) : null;
}

interface WhereLocation {
  file: string;
  lineStart: number;
  lineEnd: number;
}

/**
 * Parse a `**Where:** \`<path>[:<lineStart>[-<lineEnd>]]\`` line. The
 * backticks are optional (some agents drop them); the line range is
 * optional too. Returns null on a structurally invalid Where line.
 */
function parseWhereLine(line: string): WhereLocation | null {
  const m = line.match(/^\*\*Where:\*\*\s*`?([^`]+?)`?\s*$/);
  if (!m) return null;
  const raw = m[1].trim();
  if (!raw) return null;

  // Range form: path:start-end
  const range = raw.match(/^(.+?):(\d+)-(\d+)$/);
  if (range) {
    return { file: range[1], lineStart: Number(range[2]), lineEnd: Number(range[3]) };
  }
  // Single-line form: path:line
  const single = raw.match(/^(.+?):(\d+)$/);
  if (single) {
    const ln = Number(single[2]);
    return { file: single[1], lineStart: ln, lineEnd: ln };
  }
  // Bare path (no line — finding without a line range, anchors outside diff).
  return { file: raw, lineStart: 0, lineEnd: 0 };
}

/**
 * Stable id derived from file + lineStart + title. Same finding rendered
 * across re-fetches resolves to the same id so the UI can dedupe.
 */
function findingId(file: string, lineStart: number, title: string): string {
  const h = crypto.createHash("sha1");
  h.update(`${file}|${lineStart}|${title}`);
  return h.digest("hex").slice(0, 12);
}

/**
 * Parse the per-finding subsections under a `## Findings` heading. The block
 * passed in must already be the content of a ```forge-review fenced block —
 * use `extractLastForgeReviewBlock` to get there from raw agent output.
 *
 * Returns `[]` on any structural failure (no Findings heading, no findings
 * under it, etc.). Individual malformed findings are skipped; the rest of
 * the well-formed findings still come through. Findings under
 * `## Spec Adherence` or any other top-level heading are NOT findings and
 * are deliberately skipped.
 */
export function parseForgeReviewFindings(block: string): ForgeFinding[] {
  if (!block || typeof block !== "string") return [];
  // Slice out the section between `## Findings` and the next `## ` heading
  // (Spec Adherence / What I Verified / What I Skipped, etc.).
  const sectionMatch = block.match(/(^|\n)##\s+Findings\s*\n([\s\S]*?)(?=\n##\s+|$)/);
  if (!sectionMatch) return [];
  const section = sectionMatch[2];

  // Split on the per-finding ### header. The first chunk is whatever
  // precedes the first ### header (almost always empty / whitespace).
  const parts = section.split(/(?=^###\s+\[)/m).filter((p) => p.trim().length > 0);
  const out: ForgeFinding[] = [];
  for (const part of parts) {
    const headerMatch = part.match(/^###\s+\[([A-Za-z-]+)\]\s+(.+?)\s*\n/);
    if (!headerMatch) continue;
    const severityRaw = headerMatch[1].toUpperCase();
    if (!VALID_SEVERITIES.has(severityRaw as ForgeFindingSeverity)) continue;
    const severity = severityRaw as ForgeFindingSeverity;
    const title = headerMatch[2].trim();
    if (!title) continue;
    const body = part.slice(headerMatch[0].length);

    const finding = parseFindingBody(body, severity, title);
    if (finding) out.push(finding);
  }
  return out;
}

function parseFindingBody(body: string, severity: ForgeFindingSeverity, title: string): ForgeFinding | null {
  // Find the labelled lines in order so we can slice between them.
  const labels = [
    { key: "where", re: /^\*\*Where:\*\*/ },
    { key: "severity", re: /^\*\*Severity:\*\*/ },
    { key: "evidence", re: /^\*\*Evidence:\*\*/ },
    { key: "why", re: /^\*\*Why:\*\*/ },
    { key: "fix", re: /^\*\*Fix:\*\*/ },
  ] as const;

  const lines = body.split(/\r?\n/);
  // Maps label key → { lineIdx, line }. First occurrence wins.
  const found: Record<string, { idx: number; line: string }> = {};
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    for (const lbl of labels) {
      if (found[lbl.key]) continue;
      if (lbl.re.test(ln)) {
        found[lbl.key] = { idx: i, line: ln };
        break;
      }
    }
  }

  if (!found.where) return null;
  const where = parseWhereLine(found.where.line);
  if (!where) return null;

  // Slice each labelled region from its label up to the next label (or EOF).
  const orderedIdxs = Object.values(found)
    .map((v) => v.idx)
    .sort((a, b) => a - b);
  const indexAfter = (idx: number): number => {
    for (const o of orderedIdxs) {
      if (o > idx) return o;
    }
    return lines.length;
  };

  const sliceBlock = (idx: number, line: string, label: RegExp): string => {
    const end = indexAfter(idx);
    // First line is the label; the rest is content (may span multiple lines,
    // including fenced code blocks). Preserve leading content on the label
    // line itself when the label is followed by text on the same line.
    const firstLineRest = line.replace(label, "").trimStart();
    const rest = lines.slice(idx + 1, end).join("\n");
    if (firstLineRest && rest) return `${firstLineRest}\n${rest}`.trim();
    return (firstLineRest || rest).trim();
  };

  const evidence = found.evidence
    ? sliceBlock(found.evidence.idx, found.evidence.line, /^\*\*Evidence:\*\*\s*/) || null
    : null;
  const why = found.why ? sliceBlock(found.why.idx, found.why.line, /^\*\*Why:\*\*\s*/) : "";
  const fix = found.fix ? sliceBlock(found.fix.idx, found.fix.line, /^\*\*Fix:\*\*\s*/) : "";

  return {
    id: findingId(where.file, where.lineStart, title),
    severity,
    title,
    file: where.file,
    lineStart: where.lineStart,
    lineEnd: where.lineEnd,
    evidence: evidence && evidence.length > 0 ? evidence : null,
    why,
    fix,
  };
}
