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
    "(2-3 sentences: what this PR does and why — from the description, linked spec, and diff)",
    "",
    "## Key changes",
    "(grouped by area/subsystem; each bullet names the files involved and the substance of the change)",
    "",
    "## Risk notes",
    "(what could break, behavioral changes, migrations, places needing careful review; say 'low risk' only if you can justify it)",
    "",
    "## Suggested review order",
    "(numbered file list in the order a reviewer should read them, one line of rationale each — entry point first, core change, then ripple effects)",
    "```",
    "",
    "Output the fenced block and nothing else after it.",
  ].join("\n");
}

/** Extract the LAST ```forge-digest fenced block from raw agent output. */
export function extractForgeDigestBlock(rawMd: string): string | null {
  return extractLastTaggedBlock(rawMd, "forge-digest");
}
