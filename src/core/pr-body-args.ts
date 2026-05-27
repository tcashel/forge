/**
 * Forge PR Body Args — typed CLI that gathers commit list, shortstat, and
 * quality-gate results from disk, and writes the JSON shape that
 * `src/core/pr-body.ts`'s CLI accepts.
 *
 * Replaces a fragile bash-embedded Python heredoc that previously caused
 * silent failures (PR #21: pr-body-args.json was never written, the runner
 * fell back to handing the raw spec file to `gh pr create`).
 *
 * Each step is wrapped in its own try/catch so a single git or fs failure
 * yields partial data rather than a missing args file.
 *
 * Inputs come from argv flags so quoting is the runner-script's problem
 * (each value is single-shell-quoted by the caller).
 *
 * Output: JSON written to stdout. The runner redirects stdout to
 * `$RUN_DIR/pr-body-args.json`.
 *
 * Runner: `node --experimental-strip-types` (Node 22).
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "node:util";
import type { LaunchTarget } from "./store.js";

interface BuiltArgs {
  specPath: string;
  agentSummaryPath?: string;
  outputPath: string;
  input: {
    planId: string;
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
  };
}

function gatherCommits(baseRef: string): Array<{ sha: string; subject: string }> {
  try {
    // TAB delimiter (%x09) so subjects containing `:` or `(` don't get split incorrectly.
    const out = execSync(`git log --no-merges --format=%h%x09%s ${shellArg(baseRef)}..HEAD`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!out) return [];
    return out
      .split("\n")
      .map((line) => {
        const tab = line.indexOf("\t");
        if (tab === -1) return null;
        const sha = line.slice(0, tab);
        const subject = line.slice(tab + 1);
        if (!sha) return null;
        return { sha, subject };
      })
      .filter((c): c is { sha: string; subject: string } => c !== null);
  } catch {
    return [];
  }
}

function gatherShortstat(baseRef: string): {
  additions: number | null;
  deletions: number | null;
  filesChanged: number | null;
} {
  try {
    const out = execSync(`git diff --shortstat ${shellArg(baseRef)}..HEAD`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const filesMatch = out.match(/(\d+) files? changed/);
    const addMatch = out.match(/(\d+) insertions?/);
    const delMatch = out.match(/(\d+) deletions?/);
    return {
      filesChanged: filesMatch ? Number(filesMatch[1]) : null,
      additions: addMatch ? Number(addMatch[1]) : null,
      deletions: delMatch ? Number(delMatch[1]) : null,
    };
  } catch {
    return { additions: null, deletions: null, filesChanged: null };
  }
}

function gatherQualityResults(runDir: string): Array<{ command: string; ok: boolean; durationMs: number }> {
  const file = path.join(runDir, "quality.jsonl");
  try {
    if (!fs.existsSync(file)) return [];
    const raw = fs.readFileSync(file, "utf-8");
    const out: Array<{ command: string; ok: boolean; durationMs: number }> = [];
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        if (
          typeof parsed?.command === "string" &&
          typeof parsed?.ok === "boolean" &&
          typeof parsed?.durationMs === "number"
        ) {
          out.push({ command: parsed.command, ok: parsed.ok, durationMs: parsed.durationMs });
        }
      } catch {
        // Skip malformed lines silently — partial data is preferable to none.
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Shell-safe single-quote wrap; bash escapes `'` as `'\''`. */
function shellArg(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

// ─── Pure helper exposed for tests ────────────────────────────────────────────

export interface BuildArgsInput {
  planId: string;
  branch: string;
  baseRef: string;
  runDir: string;
  specPath: string;
  agent: LaunchTarget;
  model: string;
  jiraTicket: string | null;
  jiraUrl: string | null;
  /** Optional dependency injection for tests. */
  gatherCommits?: (baseRef: string) => Array<{ sha: string; subject: string }>;
  gatherShortstat?: (baseRef: string) => {
    additions: number | null;
    deletions: number | null;
    filesChanged: number | null;
  };
  gatherQualityResults?: (runDir: string) => Array<{ command: string; ok: boolean; durationMs: number }>;
}

export function buildArgs(opts: BuildArgsInput): BuiltArgs {
  const commits = (opts.gatherCommits ?? gatherCommits)(opts.baseRef);
  const stats = (opts.gatherShortstat ?? gatherShortstat)(opts.baseRef);
  const qualityResults = (opts.gatherQualityResults ?? gatherQualityResults)(opts.runDir);

  return {
    specPath: opts.specPath,
    agentSummaryPath: path.join(opts.runDir, "agent-summary.md"),
    outputPath: path.join(opts.runDir, "pr-body.md"),
    input: {
      planId: opts.planId,
      branch: opts.branch,
      baseRef: opts.baseRef,
      commits,
      additions: stats.additions,
      deletions: stats.deletions,
      filesChanged: stats.filesChanged,
      qualityResults,
      agent: opts.agent,
      model: opts.model,
      jiraTicket: opts.jiraTicket,
      jiraUrl: opts.jiraUrl,
    },
  };
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

function main(): void {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "task-id": { type: "string" },
      branch: { type: "string" },
      "base-ref": { type: "string" },
      "run-dir": { type: "string" },
      "spec-path": { type: "string" },
      agent: { type: "string" },
      model: { type: "string" },
      "jira-ticket": { type: "string" },
      "jira-url": { type: "string" },
    },
    strict: false,
    allowPositionals: false,
  });

  const required = ["task-id", "branch", "base-ref", "run-dir", "spec-path", "agent", "model"];
  for (const k of required) {
    if (typeof values[k] !== "string" || !(values[k] as string).length) {
      console.error(`Missing required flag: --${k}`);
      process.exit(1);
    }
  }

  const args = buildArgs({
    planId: values["task-id"] as string,
    branch: values.branch as string,
    baseRef: values["base-ref"] as string,
    runDir: values["run-dir"] as string,
    specPath: values["spec-path"] as string,
    agent: values.agent as LaunchTarget,
    model: values.model as string,
    jiraTicket: typeof values["jira-ticket"] === "string" ? values["jira-ticket"] : null,
    jiraUrl: typeof values["jira-url"] === "string" ? values["jira-url"] : null,
  });

  process.stdout.write(`${JSON.stringify(args, null, 2)}\n`);
}

const isEntry = !!process.argv[1] && path.resolve(process.argv[1]).endsWith("pr-body-args.ts");
if (isEntry) {
  main();
}
