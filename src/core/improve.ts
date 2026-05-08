/**
 * Forge Spec Improver — auto-improve loop for `forge spec save`.
 *
 * Runs the two-critic + synthesizer pipeline synchronously, then asks the
 * `forge-spec-improver` skill to apply the actionable findings to the spec
 * body. The original spec is preserved under
 * ~/.forge/critiques/<taskId>/<critiqueId>/spec-original.md so users can
 * diff before/after with `forge spec diff <taskId>`.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteText } from "./atomic-write.js";
import { type CritiqueAgent, type CritiqueConfig, type CritiqueSyncResult, runCritiqueSync } from "./critique.js";
import { agentCommand } from "./launch.js";
import type { ForgeStore } from "./store.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImproveConfig {
  taskId: string;
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
}

/** Optional seams for tests — production callers pass nothing. */
export interface ImproveOverrides {
  runCritiqueSync?: (config: CritiqueConfig, store: ForgeStore) => Promise<CritiqueSyncResult>;
  /**
   * Run the improver agent. Must write its forge-spec-improved output to
   * `outputPath` and return the exit code (0 = success). Stderr should go
   * to `errLogPath`.
   */
  runImproverAgent?: (args: {
    promptFile: string;
    outputPath: string;
    errLogPath: string;
    config: ImproveConfig;
  }) => Promise<number>;
}

// ─── Skill loader ─────────────────────────────────────────────────────────────

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

/**
 * Extract the actionable findings from a synthesizer recommendations document.
 *
 * Actionable iff Severity ∈ {BLOCKER, HIGH} AND Classification ∈
 * {corroborated, single-critic-only, Synthesizer addition}.
 */
export function extractActionableFindings(recommendationsMd: string): ActionableFinding[] {
  const blockMatch = recommendationsMd.match(RECS_BLOCK_RE);
  if (!blockMatch) return [];
  const body = blockMatch[1];

  // Find the "## Recommended Edits" section, ending at the next "## " heading.
  const editsStart = body.search(/^##\s+Recommended Edits\s*$/m);
  if (editsStart < 0) return [];
  const after = body.slice(editsStart);
  const nextSection = after.slice(1).search(/^##\s+/m);
  const editsBlock = nextSection < 0 ? after : after.slice(0, 1 + nextSection);

  // Split on `### N. ...` headings.
  const entries: ActionableFinding[] = [];
  const headingRe = /^###\s+(\d+)\.\s+.*$/gm;
  const matches: Array<{ number: number; index: number }> = [];
  let m: RegExpExecArray | null = headingRe.exec(editsBlock);
  while (m) {
    matches.push({ number: Number(m[1]), index: m.index });
    m = headingRe.exec(editsBlock);
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : editsBlock.length;
    const text = editsBlock.slice(start, end).trimEnd();
    if (isActionable(text)) {
      entries.push({ number: matches[i].number, text });
    }
  }
  return entries;
}

function isActionable(entryText: string): boolean {
  const sev =
    entryText
      .match(/\*\*Severity:\*\*\s*([^\n]+)/i)?.[1]
      ?.trim()
      .toLowerCase() ?? "";
  const cls =
    entryText
      .match(/\*\*Classification:\*\*\s*([^\n]+)/i)?.[1]
      ?.trim()
      .toLowerCase() ?? "";
  const sevOk = sev === "blocker" || sev === "high";
  if (!sevOk) return false;
  // Match the synthesizer skill's vocabulary, with some tolerance for casing
  // and the explicit "Synthesizer addition" category.
  if (cls === "corroborated") return true;
  if (cls === "single-critic-only") return true;
  if (cls.includes("synthesizer addition")) return true;
  return false;
}

// ─── Improver prompt ──────────────────────────────────────────────────────────

function buildImproverPrompt(config: ImproveConfig, findings: ActionableFinding[]): string {
  const ctxSection = config.contextContent
    ? `## Repository Context\n\n${config.contextContent.slice(0, 4000)}\n\n`
    : "";

  const skill = skillBody().trim();
  const findingsBlock = findings.map((f) => f.text).join("\n\n");

  return `You are the Forge Spec Improver.

Working directory: ${config.repoRoot}

${ctxSection}## forge-spec-improver skill

${skill}

---

## Original Spec

Title: ${config.specTitle}

${config.specBody}

---

## Recommendations to Apply

Apply ONLY these entries. Skip everything else in the synthesizer document.

${findingsBlock}

---

## Instructions

Produce a single \`\`\`forge-spec-improved fenced block per the skill instructions. Mode must be \`applied\` (the orchestrator already verified findings exist).
`;
}

// ─── Improver output parsing ──────────────────────────────────────────────────

const IMPROVED_BLOCK_RE = /```forge-spec-improved\s*\n([\s\S]*?)\n```/;

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
  config: ImproveConfig;
}): Promise<number> {
  const cmd = agentCommand(args.config.improver.agent, args.config.improver.model, args.promptFile, {
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
    return {
      critiqueId: "",
      applied: false,
      changeCount: 0,
      mode: "skipped",
      error: SAME_AGENT_ERR,
    };
  }

  // ── Step 1: Allocate critique dir ────────────────────────────────────────
  const critiqueId = store.generateCritiqueId();
  const critiqueDir = store.getCritiqueDir(config.taskId, critiqueId);
  fs.mkdirSync(critiqueDir, { recursive: true });

  // ── Step 2: Snapshot the live spec (with frontmatter) ────────────────────
  const liveSpec = store.getSpec(config.taskId);
  if (liveSpec === null) {
    return { critiqueId, applied: false, changeCount: 0, mode: "skipped", error: "IMPROVE_FAILED: spec missing" };
  }
  atomicWriteText(path.join(critiqueDir, "spec-original.md"), liveSpec);

  // ── Step 3: Run sync critique ────────────────────────────────────────────
  const critiqueRunner = overrides.runCritiqueSync ?? runCritiqueSync;
  const critiqueResult = await critiqueRunner(
    {
      taskId: config.taskId,
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
    return {
      critiqueId,
      applied: false,
      changeCount: 0,
      mode: "skipped",
      error: critiqueResult.error,
    };
  }

  // ── Step 4: Read recommendations ────────────────────────────────────────
  const recsPath = critiqueResult.recommendationsPath;
  let recsMd: string;
  try {
    recsMd = fs.readFileSync(recsPath, "utf-8");
  } catch {
    return {
      critiqueId,
      applied: false,
      changeCount: 0,
      mode: "skipped",
      error: "IMPROVE_FAILED: could not read recommendations",
    };
  }
  const findings = extractActionableFindings(recsMd);
  const changeCount = findings.length;

  // ── Step 5: No-op short-circuit ─────────────────────────────────────────
  if (changeCount === 0) {
    atomicWriteText(path.join(critiqueDir, "change-summary.md"), "no-op\n");
    store.markCritiqueViewed(config.taskId, critiqueId);
    return { critiqueId, applied: false, changeCount: 0, mode: "no-op", error: null };
  }

  // ── Step 6: Build improver prompt ───────────────────────────────────────
  const promptText = buildImproverPrompt(config, findings);
  const promptFile = path.join(critiqueDir, "improver.txt");
  atomicWriteText(promptFile, promptText);

  // ── Step 7: Run improver agent ──────────────────────────────────────────
  const outputPath = path.join(critiqueDir, "improver-output.md");
  const errLogPath = path.join(critiqueDir, "improver.log");
  const runAgent = overrides.runImproverAgent ?? defaultRunImproverAgent;
  let exitCode: number;
  try {
    exitCode = await runAgent({ promptFile, outputPath, errLogPath, config });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      critiqueId,
      applied: false,
      changeCount,
      mode: "skipped",
      error: `IMPROVE_FAILED: improver agent threw: ${msg}`,
    };
  }
  if (exitCode !== 0) {
    return {
      critiqueId,
      applied: false,
      changeCount,
      mode: "skipped",
      error: `IMPROVE_FAILED: improver agent exited ${exitCode}`,
    };
  }

  // ── Step 8: Parse improver output ───────────────────────────────────────
  let raw: string;
  try {
    raw = fs.readFileSync(outputPath, "utf-8");
  } catch {
    return {
      critiqueId,
      applied: false,
      changeCount,
      mode: "skipped",
      error: "IMPROVE_FAILED: could not read improver output",
    };
  }
  const parsed = parseImprovedOutput(raw);
  if (!parsed) {
    return {
      critiqueId,
      applied: false,
      changeCount,
      mode: "skipped",
      error: "IMPROVE_FAILED: could not parse improver output",
    };
  }

  // ── Step 9: Defend against improper no-op ───────────────────────────────
  if (parsed.mode === "no-op") {
    return {
      critiqueId,
      applied: false,
      changeCount,
      mode: "skipped",
      error: "IMPROVE_NOOP_DESPITE_FINDINGS",
    };
  }

  // ── Step 10: Persist artifacts ──────────────────────────────────────────
  atomicWriteText(path.join(critiqueDir, "spec-improved.md"), `${parsed.improvedSpec}\n`);
  atomicWriteText(path.join(critiqueDir, "change-summary.md"), `${parsed.changeSummary}\n`);

  // ── Step 11: Rewrite the live spec on disk + bump TaskRecord ────────────
  const task = store.getTask(config.taskId);
  if (!task) {
    return {
      critiqueId,
      applied: false,
      changeCount,
      mode: "skipped",
      error: "IMPROVE_FAILED: task disappeared during improve",
    };
  }
  const nextSpecVersion = (task.specVersion ?? 1) + 1;
  const improvedAtIso = new Date().toISOString();
  const newFullSpec = rewriteSpec(liveSpec, parsed.improvedSpec, {
    specVersion: nextSpecVersion,
    improvedAt: improvedAtIso,
    critiqueId,
  });
  store.writeSpec(config.taskId, newFullSpec);
  store.upsertTask({ ...task, specVersion: nextSpecVersion });

  // ── Step 12: Mark the critique viewed ───────────────────────────────────
  store.markCritiqueViewed(config.taskId, critiqueId);

  return { critiqueId, applied: true, changeCount, mode: "applied", error: null };
}
