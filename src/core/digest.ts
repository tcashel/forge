/**
 * Forge PR digest — prompt building + output extraction for the ad-hoc
 * "what does this PR do" digest the Workbench review page renders at the
 * top of the Description tab.
 *
 * Mirrors `reviewer.ts` conventions: one fenced output block (```forge-digest)
 * extracted with the shared nested-fence-aware extractor, 60KB diff budget.
 * The digest is cached by head SHA — the worker stamps `headSha` into its
 * run meta so the UI can flag a digest as stale when new commits land.
 */

import { extractLastTaggedBlock } from "./reviewer.ts";

export interface DigestPromptArgs {
  prNum: number;
  repoName: string;
  prInfoJson: string;
  diff: string;
  linkedSpec: string | null;
}

const DIFF_BUDGET = 60_000;

export function buildDigestPrompt(args: DigestPromptArgs): string {
  const truncated = args.diff.length > DIFF_BUDGET;
  const trimmedDiff = truncated
    ? `${args.diff.slice(0, DIFF_BUDGET)}\n\n...(diff truncated for context budget; use \`gh pr diff <num>\` to see more)`
    : args.diff;

  const specSection = args.linkedSpec
    ? `## Linked Forge spec\n\n\`\`\`markdown\n${args.linkedSpec}\n\`\`\`\n`
    : "## Linked Forge spec\n\n(no forge spec linked to this branch)\n";

  return [
    `Digest PR #${args.prNum} in ${args.repoName} for a reviewer who has not read it yet.`,
    "",
    "You are writing a fast, trustworthy orientation — NOT a review. No praise,",
    "no filler, no restating the diff line by line. Every claim must be grounded",
    "in the diff or PR metadata below; if something is unclear, say so rather",
    "than guessing.",
    "",
    "This renders in a compact card, so keep it scannable: short bullets, bold",
    "lead-ins, file paths in backticks at the END of a bullet (never a wall of",
    "paths up front). A reviewer should absorb each section in seconds.",
    "",
    "## PR metadata",
    "",
    "```json",
    args.prInfoJson,
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
    "Produce the digest as ONE fenced block tagged `forge-digest` containing",
    "exactly these markdown sections:",
    "",
    "```forge-digest",
    "## Purpose",
    "(2-3 plain sentences: what this PR does and why — from the description, linked spec, and diff)",
    "",
    "## Key changes",
    "(4-7 bullets, one per area. Format each as `- **Short area name** — what changed and why it matters, in 1-2 sentences. (`path/one.ts`, `path/two.ts`)`. Bold lead first, prose second, file paths last.)",
    "",
    "## Risk notes",
    "(3-5 bullets, highest risk first. Format: `- **The risk in a few words** — one sentence of why/where.` Say 'low risk' only if you can justify it.)",
    "",
    "## Suggested review order",
    "(numbered list: `1. `path/file.ts` — one short line of rationale`. Entry point first, core change, then ripple effects. Group trivial follow-on files into one entry rather than listing every file.)",
    "```",
    "",
    "Output the fenced block and nothing else after it.",
  ].join("\n");
}

/** Extract the LAST ```forge-digest fenced block from raw agent output. */
export function extractForgeDigestBlock(rawMd: string): string | null {
  return extractLastTaggedBlock(rawMd, "forge-digest");
}
