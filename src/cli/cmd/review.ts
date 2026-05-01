/**
 * forge review <pr-number> — compose the reviewer prompt for a PR.
 *
 * Wraps `buildReviewerPrompt` from src/core/reviewer.ts so the cc-plugin's
 * /forge-review slash command (and any other caller) can grab a complete
 * reviewer prompt without re-implementing the gh + spec-lookup pipeline
 * inline.
 *
 * Default: prints the composed prompt to stdout. --out <path> writes to
 * disk; --json wraps the prompt in the standard envelope.
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { resolveGhEnv } from "../../core/gh.ts";
import { detectRepo } from "../../core/repo.ts";
import { buildReviewerPrompt } from "../../core/reviewer.ts";
import type { ForgeStore } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";

export const HELP = `forge review <pr-number> [...flags]

Compose a reviewer prompt for a PR (gh + spec lookup baked in). Pipe the
output to claude/codex.

Flags:
  --out <path>     Write composed prompt to disk
  --json           Wrap prompt in the standard envelope
`;

const PR_VIEW_FIELDS = "number,title,body,headRefName,baseRefName,additions,deletions,changedFiles,url";

function reviewerSkillsDir(): string {
  // src/cli/cmd/review.ts → ../../../skills/forge-reviewer
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "skills", "forge-reviewer");
}

function runGh(args: string[], env: Record<string, string>, cwd: string): string {
  try {
    return execFileSync("gh", args, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd,
      env: { ...process.env, ...env },
    });
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string };
    const detail = (err.stderr ?? err.message ?? "").toString().trim().split("\n")[0] || "unknown gh failure";
    throw new CliError("GH_FAIL", `gh ${args.join(" ")} failed: ${detail}`, {
      hint: "Ensure gh is installed and authenticated for this repo's host.",
      exitCode: 3,
    });
  }
}

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      repo: { type: "string" },
      out: { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const prRaw = positionals[0];
  if (!prRaw) {
    throw new CliError("MISSING_ARG", "Usage: forge review <pr-number> [--repo <root>] [--out <file|->] [--json]", {
      exitCode: 1,
    });
  }
  const prNum = Number.parseInt(prRaw, 10);
  if (!Number.isFinite(prNum) || prNum <= 0) {
    throw new CliError("BAD_ARG", `<pr-number> must be a positive integer, got "${prRaw}".`, { exitCode: 1 });
  }

  const repoArg = (values.repo as string | undefined) ?? process.cwd();
  const repo = detectRepo(repoArg);
  if (!repo) {
    throw new CliError("NOT_A_REPO", `Not a git repo: ${repoArg}`, {
      hint: "Pass --repo <root> or run from inside a forge-launched repo.",
      exitCode: 2,
    });
  }

  // Resolve gh env (per-repo ghUser / ghHost overrides, if any).
  const repoConfig = store.getRepoConfig(repo.root);
  const ghEnv = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  if (ghEnv.error) {
    throw new CliError("GH_AUTH", ghEnv.error, { exitCode: 2 });
  }

  const prInfoJson = runGh(["pr", "view", String(prNum), "--json", PR_VIEW_FIELDS], ghEnv.env, repo.root).trim();
  const ciChecks = runGh(["pr", "checks", String(prNum)], ghEnv.env, repo.root);
  const diff = runGh(["pr", "diff", String(prNum)], ghEnv.env, repo.root);

  // Look up the linked forge spec by branch (if this PR was launched by forge).
  let linkedSpec: string | null = null;
  let linkedTaskId: string | null = null;
  try {
    const prInfo = JSON.parse(prInfoJson) as { headRefName?: string };
    const branch = prInfo.headRefName;
    if (branch) {
      const tasks = store.getTasks(repo.root);
      const match = tasks.find((t) => t.branch === branch);
      if (match) {
        linkedTaskId = match.id;
        const spec = store.getSpec(match.id);
        if (spec) linkedSpec = spec.replace(/^---[\s\S]*?---\n*/m, "").trim();
      }
    }
  } catch {
    // PR JSON parse failures shouldn't block the review — fall through with
    // linkedSpec=null and let the reviewer skill handle "no spec linked".
  }

  const prompt = buildReviewerPrompt({
    prNum,
    repoName: repo.name,
    skillsDir: reviewerSkillsDir(),
    prInfoJson,
    ciChecks,
    diff,
    linkedSpec,
  });

  const out = values.out as string | undefined;
  if (out && out !== "-") {
    fs.writeFileSync(out, prompt, "utf-8");
    emitOk(
      { prNumber: prNum, repoName: repo.name, linkedTaskId, outFile: out },
      values.json === true,
      () => `wrote reviewer prompt to ${out}`,
    );
    return;
  }

  if (values.json) {
    emitOk({ prNumber: prNum, repoName: repo.name, linkedTaskId, prompt }, true);
    return;
  }

  process.stdout.write(prompt);
  if (!prompt.endsWith("\n")) process.stdout.write("\n");
}
