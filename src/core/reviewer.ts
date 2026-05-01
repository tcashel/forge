/**
 * Forge Reviewer — shared prompt-building helpers for the forge-reviewer skill.
 *
 * Used by:
 *   1. The `/forge-review <pr>` chat command (full prompt, interactive)
 *   2. The post-PR automatic reviewer step in the runner script (prefix only,
 *      dynamic portions composed at runtime by bash / supervisor)
 */

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
