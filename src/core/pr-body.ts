/**
 * Forge PR Body — assembles a structured PR body from spec + git data.
 *
 * Shared helper used by the bash runner.
 * The spec file on disk is never modified.
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
  /** Optional agent-authored summary; takes precedence over spec extraction. */
  agentSummary: string | null;
}

// ─── Internals ────────────────────────────────────────────────────────────────

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
 * Truncate text to at most `maxSentences` sentences or `maxChars` characters,
 * whichever comes first. Always ends at a sentence boundary (last `.`, `?`,
 * or `!`). Appends `…` only if truncation happened.
 */
function truncateSummary(text: string, maxSentences = 6, maxChars = 600): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  // Split into sentences (keep the delimiter attached)
  const sentences: string[] = [];
  const re = /[^.!?]*[.!?]/g;
  let lastMatchEnd = 0;
  for (let m = re.exec(trimmed); m !== null; m = re.exec(trimmed)) {
    sentences.push(m[0]);
    lastMatchEnd = m.index + m[0].length;
  }

  if (sentences.length === 0) {
    // No sentence boundaries — return as-is if short enough, else truncate at maxChars
    if (trimmed.length <= maxChars) return trimmed;
    return `${trimmed.slice(0, maxChars).trimEnd()}…`;
  }

  let result = "";
  let count = 0;
  for (const s of sentences) {
    if (count >= maxSentences) break;
    if (result.length + s.length > maxChars) break;
    result += s;
    count++;
  }

  // Text is truncated if we didn't include all sentences or there's
  // non-whitespace after the last sentence boundary.
  const hasTrailingContent = trimmed.slice(lastMatchEnd).trim().length > 0;
  const truncated = count < sentences.length || hasTrailingContent;
  result = result.trimEnd();
  if (truncated) result += "…";
  return result;
}

function resolveSummary(input: PrBodyInput, strippedSpec: string): string {
  if (input.agentSummary?.trim()) {
    return truncateSummary(input.agentSummary.trim());
  }
  const context = extractSection(strippedSpec, "Context");
  if (context) return truncateSummary(context);

  const building = extractSection(strippedSpec, "What We're Building");
  if (building) return truncateSummary(building);

  return "_No spec body available._";
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildPrBody(input: PrBodyInput): string {
  const strippedSpec = stripFrontmatter(input.specBody).trim();
  const sections: string[] = [];

  // Summary
  sections.push(`## Summary\n\n${resolveSummary(input, strippedSpec)}`);

  // Changes
  if (input.commits.length > 0 || input.filesChanged != null) {
    const lines: string[] = ["## Changes", ""];

    const commitCount = input.commits.length;
    const statParts: string[] = [];
    if (input.additions != null) statParts.push(`+${input.additions}`);
    if (input.deletions != null) statParts.push(`−${input.deletions}`);
    const statSuffix =
      statParts.length > 0 && input.filesChanged != null
        ? `\n- ${statParts.join(" / ")} across ${input.filesChanged} file${input.filesChanged === 1 ? "" : "s"}`
        : "";

    lines.push(
      `- ${commitCount} commit${commitCount === 1 ? "" : "s"} on \`${input.branch}\` ahead of \`${input.baseRef}\`${statSuffix}`,
    );

    if (commitCount > 0) {
      lines.push("");
      const visible = input.commits.slice(0, 10);
      for (const c of visible) {
        lines.push(`- \`${c.sha}\` ${c.subject}`);
      }
      if (commitCount > 10) {
        const remaining = input.commits.slice(10);
        lines.push("");
        lines.push(`<details>`);
        lines.push(`<summary>${remaining.length} more commit${remaining.length === 1 ? "" : "s"}</summary>`);
        lines.push("");
        for (const c of remaining) {
          lines.push(`- \`${c.sha}\` ${c.subject}`);
        }
        lines.push("");
        lines.push(`</details>`);
      }
    }

    sections.push(lines.join("\n"));
  }

  // Quality Gates
  if (input.qualityResults.length > 0) {
    const lines: string[] = ["## Quality Gates", ""];
    for (const r of input.qualityResults) {
      const icon = r.ok ? "✅" : "❌";
      const seconds = (r.durationMs / 1000).toFixed(1);
      lines.push(`- ${icon} ${r.command} (${seconds}s)`);
    }
    sections.push(lines.join("\n"));
  }

  // Forge Spec details
  if (strippedSpec) {
    const lines: string[] = ["<details>", "<summary>📋 Forge spec</summary>", "", strippedSpec, "", "</details>"];
    sections.push(lines.join("\n"));
  }

  // Footer
  const footerParts: string[] = [];
  if (input.jiraTicket) {
    if (input.jiraUrl) {
      footerParts.push(`🔗 [${input.jiraTicket}](${input.jiraUrl})`);
    } else {
      footerParts.push(`🔗 ${input.jiraTicket}`);
    }
  }
  footerParts.push(`🤖 forge \`${input.taskId}\``);
  footerParts.push(`\`${input.agent}\` / \`${input.model}\``);
  sections.push(footerParts.join(" · "));

  return sections.join("\n\n---\n\n");
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
