/**
 * Forge Spec Improver — auto-improve loop for `forge spec save`.
 *
 * Runs the two-critic + synthesizer pipeline synchronously, then asks the
 * `forge-spec-improver` skill to apply the actionable findings to the spec
 * body. The original spec is preserved under
 * ~/.forge/critiques/<planId>/<critiqueId>/spec-original.md so users can
 * diff before/after with `forge spec diff <planId>`.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { agentCommand, claudeJobCommand } from "./agents/index.ts";
import { atomicWriteText } from "./atomic-write.js";
import { readResultFromFile } from "./claude-stream.ts";
import { type CritiqueAgent, type CritiqueConfig, type CritiqueSyncResult, runCritiqueSync } from "./critique.js";
import { finalizeSession, improvementSessionId, recordPlanVersionAdded, upsertSession } from "./db/writes.ts";
import { openQuestionsJson } from "./plan-document.ts";
import type { ForgeStore } from "./store.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImproveConfig {
  planId: string;
  repoRoot: string;
  repoName: string;
  specTitle: string;
  /** Spec body as it should appear in the improver prompt (no frontmatter). */
  specBody: string;
  contextContent: string | null;
  criticA: CritiqueAgent;
  criticB: CritiqueAgent;
  synthesizer: CritiqueAgent;
  improver: CritiqueAgent;
}

export interface ImproveResult {
  critiqueId: string;
  applied: boolean;
  changeCount: number;
  mode: "applied" | "no-op" | "skipped";
  error: string | null;
  /**
   * Count of synthesizer Open Questions forwarded to the improver to record
   * in the spec's `## Open Questions` section. These are unresolved product
   * decisions the critics surfaced; recording them keeps the spec honest
   * about its launch-readiness instead of silently claiming "None".
   */
  openQuestionsRecorded: number;
  /**
   * Count of recommendations that fell below the auto-apply threshold
   * (Severity MEDIUM/LOW, or conflicting) and were written to
   * `deferred-recommendations.md` rather than applied. Surfaced so the
   * signal isn't lost in the critique dir.
   */
  deferredCount: number;
}

/** Build a skipped/failed result with the new counts defaulted. */
function skipped(critiqueId: string, error: string | null, changeCount = 0, deferredCount = 0): ImproveResult {
  return { critiqueId, applied: false, changeCount, mode: "skipped", error, openQuestionsRecorded: 0, deferredCount };
}

/** Optional seams for tests — production callers pass nothing. */
export interface ImproveOverrides {
  runCritiqueSync?: (config: CritiqueConfig, store: ForgeStore) => Promise<CritiqueSyncResult>;
  /**
   * Run the improver agent. Must write its forge-spec-improved output to
   * `outputPath` and return the exit code (0 = success). Stderr should go
   * to `errLogPath`. For claude runs, `sidecarPath` is where the raw
   * stream-json must be teed so `runImprover` can extract token / cost
   * data; non-claude runs ignore it.
   */
  runImproverAgent?: (args: {
    promptFile: string;
    outputPath: string;
    errLogPath: string;
    sidecarPath: string;
    config: ImproveConfig;
  }) => Promise<number>;
}

// ─── Skill loader ─────────────────────────────────────────────────────────────

function normalizeReasoning(effort: string | undefined): "low" | "medium" | "high" | null {
  if (effort === "low" || effort === "medium" || effort === "high") return effort;
  return null;
}

function skillBody(): string {
  // improve.ts lives at src/core/, but skills/ is at the repo root.
  const skillsRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "skills");
  try {
    return fs.readFileSync(path.join(skillsRoot, "forge-spec-improver", "SKILL.md"), "utf-8");
  } catch {
    return "";
  }
}

// ─── Recommendations parsing ──────────────────────────────────────────────────

const RECS_BLOCK_RE = /```forge-spec-recommendations\s*\n([\s\S]*?)\n```/;

export interface ActionableFinding {
  /** The 1-based number from the source `### N. <title>` heading. */
  number: number;
  /** The full verbatim block from `### N. <title>` up to (but not including) the next `### ` heading or section. */
  text: string;
}

/** A recommendation that fell below the auto-apply threshold. */
export interface DeferredFinding {
  number: number;
  /** Lowercased severity, e.g. "medium" | "low". */
  severity: string;
  /** Lowercased classification, e.g. "conflicting". */
  classification: string;
  /** The full verbatim `### N.` block. */
  text: string;
}

interface RecommendationEntry {
  number: number;
  text: string;
  severity: string;
  classification: string;
}

/**
 * Slice the body of a named `## <section>` (up to the next `## ` heading) out
 * of the `forge-spec-recommendations` block. Returns null if absent.
 */
function sectionBody(recommendationsMd: string, headingRe: RegExp): string | null {
  const blockMatch = recommendationsMd.match(RECS_BLOCK_RE);
  if (!blockMatch) return null;
  const body = blockMatch[1];
  const start = body.search(headingRe);
  if (start < 0) return null;
  const after = body.slice(start);
  const nextSection = after.slice(1).search(/^##\s+/m);
  return nextSection < 0 ? after : after.slice(0, 1 + nextSection);
}

/**
 * Parse every `### N.` entry from the "## Recommended Edits" section, tagging
 * each with its Severity and Classification. The actionable/deferred split is
 * applied by callers so neither set is silently dropped.
 */
function parseRecommendationEntries(recommendationsMd: string): RecommendationEntry[] {
  const editsBlock = sectionBody(recommendationsMd, /^##\s+Recommended Edits\s*$/m);
  if (editsBlock === null) return [];

  const headingRe = /^###\s+(\d+)\.\s+.*$/gm;
  const matches: Array<{ number: number; index: number }> = [];
  let m: RegExpExecArray | null = headingRe.exec(editsBlock);
  while (m) {
    matches.push({ number: Number(m[1]), index: m.index });
    m = headingRe.exec(editsBlock);
  }
  const entries: RecommendationEntry[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : editsBlock.length;
    const text = editsBlock.slice(start, end).trimEnd();
    const severity =
      text
        .match(/\*\*Severity:\*\*\s*([^\n]+)/i)?.[1]
        ?.trim()
        .toLowerCase() ?? "";
    const classification =
      text
        .match(/\*\*Classification:\*\*\s*([^\n]+)/i)?.[1]
        ?.trim()
        .toLowerCase() ?? "";
    entries.push({ number: matches[i].number, text, severity, classification });
  }
  return entries;
}

/**
 * Actionable iff Severity ∈ {BLOCKER, HIGH} AND Classification ∈
 * {corroborated, single-critic-only, Synthesizer addition}.
 */
function isActionableEntry(e: RecommendationEntry): boolean {
  const sevOk = e.severity === "blocker" || e.severity === "high";
  if (!sevOk) return false;
  // Match the synthesizer skill's vocabulary, with some tolerance for casing
  // and the explicit "Synthesizer addition" category.
  if (e.classification === "corroborated") return true;
  if (e.classification === "single-critic-only") return true;
  if (e.classification.includes("synthesizer addition")) return true;
  return false;
}

/** Extract the actionable findings the improver should apply. */
export function extractActionableFindings(recommendationsMd: string): ActionableFinding[] {
  return parseRecommendationEntries(recommendationsMd)
    .filter(isActionableEntry)
    .map((e) => ({ number: e.number, text: e.text }));
}

/**
 * Extract the recommendations that are NOT auto-applied (Severity MEDIUM/LOW,
 * or conflicting). Recorded to an artifact instead of silently dropped.
 */
export function extractDeferredFindings(recommendationsMd: string): DeferredFinding[] {
  return parseRecommendationEntries(recommendationsMd)
    .filter((e) => !isActionableEntry(e))
    .map((e) => ({ number: e.number, severity: e.severity, classification: e.classification, text: e.text }));
}

/**
 * Extract the synthesizer's `## Open Questions` as a list of question strings
 * (leading list number stripped, multi-line items preserved). These are
 * product decisions the critics could not resolve; the improver records them
 * in the spec's own `## Open Questions` section.
 */
export function extractOpenQuestions(recommendationsMd: string): string[] {
  const oqBlock = sectionBody(recommendationsMd, /^##\s+Open Questions\s*$/m);
  if (oqBlock === null) return [];
  const lines = oqBlock.split("\n");
  const starts: number[] = [];
  lines.forEach((l, i) => {
    if (/^\s*\d+\.\s+/.test(l)) starts.push(i);
  });
  const items: string[] = [];
  for (let i = 0; i < starts.length; i++) {
    const from = starts[i];
    const to = i + 1 < starts.length ? starts[i + 1] : lines.length;
    const chunk = lines
      .slice(from, to)
      .join("\n")
      .trim()
      .replace(/^\s*\d+\.\s+/, "");
    if (chunk) items.push(chunk);
  }
  return items;
}

function normalizeOpenQuestionForComparison(question: string): string {
  return question
    .replace(/\s+/g, " ")
    .replace(/\s+[—-]\s+raised by\b.*$/i, "")
    .replace(/\s+Context:\s+.*$/i, "")
    .trim()
    .toLowerCase()
    .replace(/[?!.]+$/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function filterAlreadyRecordedOpenQuestions(openQuestions: string[], specDocument: string): string[] {
  const existing = new Set(
    openQuestionsJson(specDocument)
      .map(normalizeOpenQuestionForComparison)
      .filter((q) => q.length > 0),
  );
  if (existing.size === 0) return openQuestions;

  const seen = new Set<string>();
  return openQuestions.filter((question) => {
    const normalized = normalizeOpenQuestionForComparison(question);
    if (!normalized) return true;
    if (existing.has(normalized) || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

/** Format the deferred recommendations into a standalone artifact. */
function buildDeferredDoc(deferred: DeferredFinding[]): string {
  const header =
    `# Deferred recommendations\n\n` +
    `These ${deferred.length} synthesizer recommendation(s) were below the auto-apply ` +
    `threshold (Severity MEDIUM/LOW, or a conflicting finding) and were NOT applied ` +
    `automatically. Review and apply manually if warranted.\n\n`;
  return `${header}${deferred.map((d) => d.text).join("\n\n")}\n`;
}

// ─── Improver prompt ──────────────────────────────────────────────────────────

function buildImproverPrompt(config: ImproveConfig, findings: ActionableFinding[], openQuestions: string[]): string {
  const ctxSection = config.contextContent
    ? `## Repository Context\n\n${config.contextContent.slice(0, 4000)}\n\n`
    : "";

  const skill = skillBody().trim();

  const recsSection =
    findings.length > 0
      ? `## Recommendations to Apply

Apply ONLY these entries. Skip everything else in the synthesizer document.

${findings.map((f) => f.text).join("\n\n")}

---

`
      : `## Recommendations to Apply

(none — there are no spec edits to apply this pass; only record the Open Questions below.)

---

`;

  const oqSection =
    openQuestions.length > 0
      ? `## Open Questions to Record

The critique surfaced these unresolved product decisions. Merge each one into the spec's \`## Open Questions\` section as an unchecked \`- [ ] \` bullet — replace a \`- None\` placeholder if present, and do not duplicate a question already listed. These are NOT recommendations: do not list them in your Change Summary, and do not otherwise alter the spec for them.

${openQuestions.map((q) => `- [ ] ${q.replace(/\n+/g, " ").trim()}`).join("\n")}

---

`
      : "";

  return `You are the Forge Spec Improver.

Working directory: ${config.repoRoot}

${ctxSection}## forge-spec-improver skill

${skill}

---

## Original Spec

Title: ${config.specTitle}

${config.specBody}

---

${recsSection}${oqSection}## Instructions

Produce a single \`\`\`forge-spec-improved fenced block per the skill instructions. Mode must be \`applied\` (the orchestrator already verified there is work to do).
`;
}

// ─── Improver output parsing ──────────────────────────────────────────────────

// Greedy match so inner ``` fences inside the spec body (bash/yaml/etc.
// code blocks the improved spec itself contains) don't prematurely
// terminate the outer block. The real closing fence is always the LAST
// ``` in the agent's output.
const IMPROVED_BLOCK_RE = /```forge-spec-improved\s*\n([\s\S]*)\n```/;

export interface ImprovedOutput {
  mode: "applied" | "no-op";
  improvedSpec: string;
  changeSummary: string;
}

export function parseImprovedOutput(raw: string): ImprovedOutput | null {
  const blockMatch = raw.match(IMPROVED_BLOCK_RE);
  if (!blockMatch) return null;
  const lines = blockMatch[1].split("\n");

  const modeIdx = lines.findIndex((l) => /^##\s+Mode\s*$/.test(l));
  const improvedIdx = lines.findIndex((l) => /^##\s+Improved Spec\s*$/.test(l));
  // Use the last `## Change Summary` heading so a stray occurrence inside
  // the spec body can't shadow the real one.
  let summaryIdx = -1;
  for (let i = lines.length - 1; i > improvedIdx; i--) {
    if (/^##\s+Change Summary\s*$/.test(lines[i])) {
      summaryIdx = i;
      break;
    }
  }
  if (modeIdx < 0 || improvedIdx < 0 || summaryIdx < 0) return null;
  if (!(modeIdx < improvedIdx && improvedIdx < summaryIdx)) return null;

  const modeText = lines
    .slice(modeIdx + 1, improvedIdx)
    .join("\n")
    .trim();
  const modeLine = modeText.split("\n")[0]?.trim().toLowerCase() ?? "";
  const mode: ImprovedOutput["mode"] = modeLine === "no-op" ? "no-op" : "applied";

  const improvedSpec = lines
    .slice(improvedIdx + 1, summaryIdx)
    .join("\n")
    .trim();
  if (!improvedSpec) return null;

  const changeSummary = lines
    .slice(summaryIdx + 1)
    .join("\n")
    .trim();

  return { mode, improvedSpec, changeSummary };
}

// ─── Frontmatter editing ──────────────────────────────────────────────────────

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

/**
 * Replace the spec body while preserving frontmatter. Adds/overwrites
 * specVersion, improvedAt, critiqueId. Returns the new full file content.
 */
export function rewriteSpec(
  fullSpec: string,
  newBody: string,
  patch: { specVersion: number; improvedAt: string; critiqueId: string },
): string {
  const m = fullSpec.match(FRONTMATTER_RE);
  if (!m) {
    // No frontmatter — synthesize a minimal one (shouldn't happen in the
    // auto-improve path because we skip when the user supplied frontmatter).
    const fm = [
      "---",
      `specVersion: ${patch.specVersion}`,
      `improvedAt: ${patch.improvedAt}`,
      `critiqueId: ${patch.critiqueId}`,
      "---",
      "",
    ].join("\n");
    return `${fm}\n${newBody.replace(/^\n+/, "")}`;
  }
  const fmInner = m[1];
  const lines = fmInner.split("\n");
  const updates: Record<string, string> = {
    specVersion: String(patch.specVersion),
    improvedAt: patch.improvedAt,
    critiqueId: patch.critiqueId,
  };
  const seen = new Set<string>();
  const newLines = lines.map((line) => {
    const km = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!km) return line;
    const key = km[1];
    if (key in updates) {
      seen.add(key);
      return `${key}: ${updates[key]}`;
    }
    return line;
  });
  for (const key of Object.keys(updates)) {
    if (!seen.has(key)) newLines.push(`${key}: ${updates[key]}`);
  }
  const newFm = `---\n${newLines.join("\n")}\n---\n`;
  const bodyOnly = newBody.replace(/^\n+/, "");
  return `${newFm}${bodyOnly}`;
}

// ─── Default agent runner ─────────────────────────────────────────────────────

async function defaultRunImproverAgent(args: {
  promptFile: string;
  outputPath: string;
  errLogPath: string;
  sidecarPath: string;
  config: ImproveConfig;
}): Promise<number> {
  const cmd =
    args.config.improver.agent === "claude"
      ? claudeJobCommand(args.config.improver.model, args.promptFile, args.sidecarPath)
      : agentCommand(args.config.improver.agent, args.config.improver.model, args.promptFile, {
          reasoningEffort: args.config.improver.reasoningEffort,
        });
  const out = fs.openSync(args.outputPath, "w");
  const err = fs.openSync(args.errLogPath, "w");
  try {
    execSync(cmd, { stdio: ["ignore", out, err], cwd: args.config.repoRoot });
    return 0;
  } catch (e: unknown) {
    const status =
      typeof e === "object" && e !== null && "status" in e && typeof (e as { status: unknown }).status === "number"
        ? ((e as { status: number }).status ?? 1)
        : 1;
    return status || 1;
  } finally {
    fs.closeSync(out);
    fs.closeSync(err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

const SAME_AGENT_ERR =
  "IMPROVE_FAILED: critic A and B resolved to the same agent/model — set RepoConfig.critiqueAgentA/B explicitly";

export async function runImprover(
  config: ImproveConfig,
  store: ForgeStore,
  overrides: ImproveOverrides = {},
): Promise<ImproveResult> {
  // ── Step 0: Sanity check critics ─────────────────────────────────────────
  if (config.criticA.agent === config.criticB.agent && config.criticA.model === config.criticB.model) {
    return skipped("", SAME_AGENT_ERR);
  }

  // ── Step 1: Allocate critique dir ────────────────────────────────────────
  const critiqueId = store.generateCritiqueId();
  const critiqueDir = store.getCritiqueDir(config.planId, critiqueId);
  fs.mkdirSync(critiqueDir, { recursive: true });

  // ── Step 2: Snapshot the live spec (with frontmatter) ────────────────────
  const liveSpec = store.getSpec(config.planId);
  if (liveSpec === null) {
    return skipped(critiqueId, "IMPROVE_FAILED: spec missing");
  }
  atomicWriteText(path.join(critiqueDir, "spec-original.md"), liveSpec);

  // ── Step 3: Run sync critique ────────────────────────────────────────────
  const critiqueRunner = overrides.runCritiqueSync ?? runCritiqueSync;
  const critiqueResult = await critiqueRunner(
    {
      planId: config.planId,
      critiqueId,
      specBody: config.specBody,
      specTitle: config.specTitle,
      repoRoot: config.repoRoot,
      repoName: config.repoName,
      contextContent: config.contextContent,
      criticA: config.criticA,
      criticB: config.criticB,
      synthesizer: config.synthesizer,
      mode: "sync",
    },
    store,
  );
  if (critiqueResult.error) {
    return skipped(critiqueId, critiqueResult.error);
  }

  // ── Step 4: Read recommendations ────────────────────────────────────────
  const recsPath = critiqueResult.recommendationsPath;
  let recsMd: string;
  try {
    recsMd = fs.readFileSync(recsPath, "utf-8");
  } catch {
    return skipped(critiqueId, "IMPROVE_FAILED: could not read recommendations");
  }
  const findings = extractActionableFindings(recsMd);
  const openQuestions = filterAlreadyRecordedOpenQuestions(extractOpenQuestions(recsMd), liveSpec);
  const deferred = extractDeferredFindings(recsMd);
  const changeCount = findings.length;
  const deferredCount = deferred.length;

  // Record below-threshold recommendations so the signal isn't lost in the
  // critique dir. Written even on the no-op path below.
  if (deferredCount > 0) {
    atomicWriteText(path.join(critiqueDir, "deferred-recommendations.md"), buildDeferredDoc(deferred));
  }

  // ── Step 5: No-op short-circuit ─────────────────────────────────────────
  // There is work to do iff there are findings to apply OR open questions to
  // record. Deferred-only rounds still no-op (nothing is applied) but the
  // artifact above preserves them.
  if (findings.length === 0 && openQuestions.length === 0) {
    const summary = deferredCount > 0 ? `no-op (${deferredCount} deferred)\n` : "no-op\n";
    atomicWriteText(path.join(critiqueDir, "change-summary.md"), summary);
    store.markCritiqueViewed(config.planId, critiqueId);
    return {
      critiqueId,
      applied: false,
      changeCount: 0,
      mode: "no-op",
      error: null,
      openQuestionsRecorded: 0,
      deferredCount,
    };
  }

  // ── Step 6: Build improver prompt ───────────────────────────────────────
  const promptText = buildImproverPrompt(config, findings, openQuestions);
  const promptFile = path.join(critiqueDir, "improver.txt");
  atomicWriteText(promptFile, promptText);

  // ── Step 7: Run improver agent ──────────────────────────────────────────
  const outputPath = path.join(critiqueDir, "improver-output.md");
  const errLogPath = path.join(critiqueDir, "improver.log");
  const sidecarPath = path.join(critiqueDir, "improver.stream.jsonl");
  const runAgent = overrides.runImproverAgent ?? defaultRunImproverAgent;

  const improverSessionId = improvementSessionId(critiqueId, 1);
  const improverStartedAt = new Date().toISOString();
  try {
    upsertSession(store.db.db, {
      id: improverSessionId,
      purpose: "improvement",
      relatedId: critiqueId,
      agentAdapter: config.improver.agent,
      model: config.improver.model,
      startedAt: improverStartedAt,
      state: "running",
      cwd: config.repoRoot,
      metrics: {
        reasoningEffort: normalizeReasoning(config.improver.reasoningEffort),
        planId: config.planId,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`improve: upsertSession failed: ${msg}\n`);
  }

  let exitCode: number;
  try {
    exitCode = await runAgent({ promptFile, outputPath, errLogPath, sidecarPath, config });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    try {
      finalizeSession(store.db.db, {
        id: improverSessionId,
        finishedAt: new Date().toISOString(),
        state: "failed",
        exitCode: null,
        error: msg,
      });
    } catch {
      /* noop */
    }
    return skipped(critiqueId, `IMPROVE_FAILED: improver agent threw: ${msg}`, changeCount, deferredCount);
  }

  try {
    const durationMs = Date.now() - new Date(improverStartedAt).getTime();
    const metricsPatch: Parameters<typeof finalizeSession>[1]["metrics"] = { durationMs };
    if (config.improver.agent === "claude" && fs.existsSync(sidecarPath)) {
      const r = await readResultFromFile(sidecarPath);
      // Drop r.durationMs — the wall-clock above (process startup + teardown
      // included) is authoritative; the sidecar's duration only covers the
      // claude API turn.
      if (r.tokensIn !== null || r.tokensOut !== null || r.totalCostUsd !== null) {
        metricsPatch.tokensIn = r.tokensIn;
        metricsPatch.tokensOut = r.tokensOut;
        metricsPatch.cacheRead = r.cacheRead;
        metricsPatch.cacheCreate = r.cacheCreate;
        metricsPatch.costUsd = r.totalCostUsd;
        metricsPatch.costSource = r.totalCostUsd !== null ? "provider" : null;
      }
    }
    finalizeSession(store.db.db, {
      id: improverSessionId,
      finishedAt: new Date().toISOString(),
      state: exitCode === 0 ? "completed" : "failed",
      exitCode,
      metrics: metricsPatch,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`improve: finalizeSession failed: ${msg}\n`);
  }

  if (exitCode !== 0) {
    return skipped(critiqueId, `IMPROVE_FAILED: improver agent exited ${exitCode}`, changeCount, deferredCount);
  }

  // ── Step 8: Parse improver output ───────────────────────────────────────
  let raw: string;
  try {
    raw = fs.readFileSync(outputPath, "utf-8");
  } catch {
    return skipped(critiqueId, "IMPROVE_FAILED: could not read improver output", changeCount, deferredCount);
  }
  const parsed = parseImprovedOutput(raw);
  if (!parsed) {
    return skipped(critiqueId, "IMPROVE_FAILED: could not parse improver output", changeCount, deferredCount);
  }

  // ── Step 9: Defend against improper no-op ───────────────────────────────
  if (parsed.mode === "no-op") {
    return skipped(critiqueId, "IMPROVE_NOOP_DESPITE_FINDINGS", changeCount, deferredCount);
  }

  // ── Step 10: Persist artifacts ──────────────────────────────────────────
  atomicWriteText(path.join(critiqueDir, "spec-improved.md"), `${parsed.improvedSpec}\n`);
  atomicWriteText(path.join(critiqueDir, "change-summary.md"), `${parsed.changeSummary}\n`);

  // ── Step 11: Rewrite the live spec on disk + bump Plan ────────────
  const task = store.getPlan(config.planId);
  if (!task) {
    return skipped(critiqueId, "IMPROVE_FAILED: task disappeared during improve", changeCount, deferredCount);
  }
  const nextSpecVersion = (task.specVersion ?? 1) + 1;
  const improvedAtIso = new Date().toISOString();
  const newFullSpec = rewriteSpec(liveSpec, parsed.improvedSpec, {
    specVersion: nextSpecVersion,
    improvedAt: improvedAtIso,
    critiqueId,
  });
  store.writeSpec(config.planId, newFullSpec);
  const updatedTask = { ...task, specVersion: nextSpecVersion };
  store.upsertPlan(updatedTask);
  recordPlanVersionAdded(store.db.db, updatedTask, nextSpecVersion, newFullSpec);

  // ── Step 12: Mark the critique viewed ───────────────────────────────────
  store.markCritiqueViewed(config.planId, critiqueId);

  return {
    critiqueId,
    applied: true,
    changeCount,
    mode: "applied",
    error: null,
    openQuestionsRecorded: openQuestions.length,
    deferredCount,
  };
}
