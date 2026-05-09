/**
 * Forge PR Body — assembles a Claude Code-style PR body from spec + git data.
 *
 * Body shape:
 *   ## Summary
 *   <bullets, from agent-authored agent-summary.md or derived from spec Context>
 *
 *   ## Test plan
 *   <markdown checkboxes, from agent-summary.md or derived from Acceptance Criteria>
 *
 *   <details><summary>🤖 forge run details</summary>
 *     ### Changes / ### Quality Gates / ### Forge spec / forge meta line
 *   </details>
 *
 *   🔗 [JIRA](url)   (only when set)
 *   🤖 Generated with [Claude Code](https://claude.com/claude-code)
 *
 * Runner: `node --experimental-strip-types` (Node 22).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { LaunchTarget } from "./store.js";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface PrBodyInput {
  taskId: string;
  specBody: string;
  branch: string;
  baseRef: string;
  commits: Array<{ sha: string; subject: string }>;
  additions: number | null;
  deletions: number | null;
  filesChanged: number | null;
  qualityResults: Array<{ command: string; ok: boolean; durationMs: number }>;
  agent: LaunchTarget;
  model: string;
  jiraTicket: string | null;
  jiraUrl: string | null;
  /**
   * Structured markdown the agent writes to ~/.forge/runs/<id>/agent-summary.md.
   * Expected to contain `## Summary` and `## Test plan` top-level sections.
   * When null or unparseable, the builder falls back to spec-derived content.
   */
  agentSummary: string | null;
}

// ─── Frontmatter / section helpers ────────────────────────────────────────────

const FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n*/;

export function stripFrontmatter(text: string): string {
  return text.replace(FRONTMATTER_RE, "");
}

/**
 * Extract a section's content by heading. Walks `## ` headings; copies
 * content up to the next `## ` heading or end of file. Strips leading/
 * trailing blank lines.
 */
function extractSection(body: string, heading: string): string | null {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^## ${escaped}\\s*$`, "m");
  const match = re.exec(body);
  if (!match) return null;

  const start = match.index + match[0].length;
  const nextHeading = body.indexOf("\n## ", start);
  const content = nextHeading === -1 ? body.slice(start) : body.slice(start, nextHeading);
  const trimmed = content.replace(/^\n+/, "").replace(/\n+$/, "");
  return trimmed || null;
}

/**
 * Split agent-authored summary markdown into its two named sections.
 * Either field is null if the section is missing.
 */
export function parseAgentSummary(raw: string): { summary: string | null; testPlan: string | null } {
  return {
    summary: extractSection(raw, "Summary"),
    testPlan: extractSection(raw, "Test plan"),
  };
}

// ─── Fallback builders ────────────────────────────────────────────────────────

function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const out: string[] = [];
  const re = /[^.!?]+[.!?]/g;
  for (let m = re.exec(trimmed); m !== null; m = re.exec(trimmed)) {
    const s = m[0].trim();
    if (s) out.push(s);
  }
  // No terminal punctuation? Treat the whole text as one sentence.
  if (out.length === 0) out.push(trimmed);
  return out;
}

function deriveSummaryFallback(strippedSpec: string): string {
  const source = extractSection(strippedSpec, "Context") ?? extractSection(strippedSpec, "What We're Building");
  if (!source) return "- _Spec body did not contain Context or What We're Building._";
  const sentences = splitSentences(source).slice(0, 4);
  return sentences.map((s) => `- ${s}`).join("\n");
}

function deriveTestPlanFallback(strippedSpec: string): string {
  const ac = extractSection(strippedSpec, "Acceptance Criteria");
  if (!ac) return "- [ ] Manual review of the diff (no acceptance criteria found in spec).";

  const lines = ac.split("\n");
  const items: string[] = [];
  for (const line of lines) {
    // Top-level bullets only — `- ` at column 0, not nested (` - ` or `\t- `).
    const m = line.match(/^- (.+)$/);
    if (m) {
      items.push(`- [ ] ${m[1].trim()}`);
      if (items.length >= 8) break;
    }
  }
  if (items.length === 0) {
    return "- [ ] Manual review of the diff (acceptance criteria found but no bullets parsed).";
  }
  return items.join("\n");
}

// ─── Forge run details (collapsed block) ──────────────────────────────────────

function renderChangesSection(input: PrBodyInput): string | null {
  if (input.commits.length === 0 && input.filesChanged == null) return null;

  const lines: string[] = ["### Changes", ""];

  const commitCount = input.commits.length;
  const statParts: string[] = [];
  if (input.additions != null) statParts.push(`+${input.additions}`);
  if (input.deletions != null) statParts.push(`−${input.deletions}`);

  const overviewLine = `- ${commitCount} commit${commitCount === 1 ? "" : "s"} on \`${input.branch}\` ahead of \`${input.baseRef}\``;
  lines.push(overviewLine);

  if (statParts.length > 0 && input.filesChanged != null) {
    lines.push(
      `- ${statParts.join(" / ")} across ${input.filesChanged} file${input.filesChanged === 1 ? "" : "s"}`,
    );
  }

  if (commitCount > 0) {
    lines.push("");
    const visible = input.commits.slice(0, 10);
    for (const c of visible) {
      lines.push(`- \`${c.sha}\` ${c.subject}`);
    }
    if (commitCount > 10) {
      const remaining = input.commits.slice(10);
      lines.push("");
      lines.push("<details>");
      lines.push(`<summary>${remaining.length} more commit${remaining.length === 1 ? "" : "s"}</summary>`);
      lines.push("");
      for (const c of remaining) {
        lines.push(`- \`${c.sha}\` ${c.subject}`);
      }
      lines.push("");
      lines.push("</details>");
    }
  }

  return lines.join("\n");
}

function renderQualitySection(input: PrBodyInput): string | null {
  if (input.qualityResults.length === 0) return null;
  const lines: string[] = ["### Quality Gates", ""];
  for (const r of input.qualityResults) {
    const icon = r.ok ? "✅" : "❌";
    const seconds = (r.durationMs / 1000).toFixed(1);
    lines.push(`- ${icon} ${r.command} (${seconds}s)`);
  }
  return lines.join("\n");
}

function renderSpecSection(strippedSpec: string): string | null {
  if (!strippedSpec) return null;
  return ["### Forge spec", "", strippedSpec].join("\n");
}

function renderForgeRunDetails(input: PrBodyInput, strippedSpec: string): string | null {
  const parts: string[] = [];
  const changes = renderChangesSection(input);
  if (changes) parts.push(changes);
  const quality = renderQualitySection(input);
  if (quality) parts.push(quality);
  const spec = renderSpecSection(strippedSpec);
  if (spec) parts.push(spec);

  // Always include the forge meta line so the run is traceable, even when
  // nothing else surfaced (e.g. zero commits captured for some reason).
  const metaLine = `forge: \`${input.taskId}\` · \`${input.agent}\` / \`${input.model}\``;
  parts.push(metaLine);

  if (parts.length === 1 && !strippedSpec && input.commits.length === 0 && input.qualityResults.length === 0) {
    // Only the meta line — not worth a collapsed block.
    return null;
  }

  return ["<details>", "<summary>🤖 forge run details</summary>", "", parts.join("\n\n"), "", "</details>"].join("\n");
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildPrBody(input: PrBodyInput): string {
  const strippedSpec = stripFrontmatter(input.specBody).trim();
  const parsed = input.agentSummary ? parseAgentSummary(input.agentSummary) : { summary: null, testPlan: null };

  const sections: string[] = [];

  // 1. Summary
  const summary = parsed.summary ?? deriveSummaryFallback(strippedSpec);
  sections.push(`## Summary\n\n${summary}`);

  // 2. Test plan
  const testPlan = parsed.testPlan ?? deriveTestPlanFallback(strippedSpec);
  sections.push(`## Test plan\n\n${testPlan}`);

  // 3. Forge run details (collapsed)
  const details = renderForgeRunDetails(input, strippedSpec);
  if (details) sections.push(details);

  // 4. Footer
  const footerLines: string[] = [];
  if (input.jiraTicket) {
    footerLines.push(input.jiraUrl ? `🔗 [${input.jiraTicket}](${input.jiraUrl})` : `🔗 ${input.jiraTicket}`);
  }
  footerLines.push("🤖 Generated with [Claude Code](https://claude.com/claude-code)");
  sections.push(footerLines.join("\n"));

  return sections.join("\n\n");
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

interface CliArgs {
  specPath: string;
  agentSummaryPath?: string;
  outputPath: string;
  input: Omit<PrBodyInput, "specBody" | "agentSummary">;
}

function main(): void {
  const argsPath = process.argv[2];
  if (!argsPath) {
    console.error("Usage: pr-body.ts <args-json-path>");
    process.exit(1);
  }

  let cliArgs: CliArgs;
  try {
    cliArgs = JSON.parse(fs.readFileSync(argsPath, "utf-8"));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`Failed to read args: ${msg}`);
    process.exit(1);
  }

  let specBody: string;
  try {
    specBody = fs.readFileSync(cliArgs.specPath, "utf-8");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`Failed to read spec: ${msg}`);
    process.exit(1);
  }

  let agentSummary: string | null = null;
  if (cliArgs.agentSummaryPath) {
    try {
      agentSummary = fs.readFileSync(cliArgs.agentSummaryPath, "utf-8").trim() || null;
    } catch {
      // File doesn't exist or unreadable — that's fine
    }
  }

  const body = buildPrBody({ ...cliArgs.input, specBody, agentSummary });

  try {
    fs.mkdirSync(path.dirname(cliArgs.outputPath), { recursive: true });
    fs.writeFileSync(cliArgs.outputPath, body, "utf-8");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`Failed to write output: ${msg}`);
    process.exit(1);
  }
}

const __filename = fileURLToPath(import.meta.url);
const isEntry = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isEntry) {
  main();
}
