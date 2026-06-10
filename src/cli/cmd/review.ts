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
import type { PublishRecord } from "../../core/publish-record.ts";
import { detectRepo } from "../../core/repo.ts";
import { buildReviewerPrompt, type ForgeFinding } from "../../core/reviewer.ts";
import type { ForgeStore } from "../../core/store.ts";
import { CliError, emitOk } from "../output.ts";
import { runPublishOnly, runReviewInProcess } from "./review-actions.ts";

export const HELP = `forge review <pr-number> [...flags]

Default: compose a reviewer prompt for the PR (gh + spec lookup baked in)
and print it — pipe the output to claude/codex.

Flags:
  --out <path>     Write composed prompt to disk (default mode only)
  --json           Wrap output in the standard envelope
  --run            Execute the review here, synchronously: runs the reviewer
                   agent, writes findings.json + review.md, prints a findings
                   summary table
  --publish        With --run: publish findings to the PR as review comments
                   (idempotent — already-published findings are skipped)
  --publish-only   Skip the reviewer; load the latest saved findings for this
                   PR and re-run the idempotent publish, printing per-finding
                   outcomes
  --repo <root>    Repo root (defaults to cwd)

Exit codes (--run / --publish-only):
  0  success
  1  review failed (or no saved findings for --publish-only)
  4  publish failed or partial (review artifacts are still saved)
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

function severityRank(sev: string): number {
  return sev === "BLOCKER" ? 0 : sev === "HIGH" ? 1 : sev === "MEDIUM" ? 2 : 3;
}

function formatFindingsTable(findings: ForgeFinding[]): string {
  if (findings.length === 0) return "No findings.";
  const sorted = [...findings].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  const lines = sorted.map((f) => {
    const loc = f.lineStart > 0 ? `${f.file}:${f.lineStart}` : f.file;
    return `  [${f.severity}] ${f.id}  ${f.title}  (${loc})`;
  });
  return `Findings (${findings.length}):\n${lines.join("\n")}`;
}

function formatPublishOutcome(record: PublishRecord): string {
  if (record.state === "not-requested") return "publish: not requested";
  const counts = `${record.posted} posted, ${record.outOfDiff} out-of-diff, ${record.skipped} already published, ${record.failed} failed`;
  const lines = [`publish: ${record.state}${record.headMoved ? " (head moved during review)" : ""} — ${counts}`];
  for (const f of record.findings) {
    lines.push(`  ${f.id}: ${f.status}${f.error ? ` — ${f.error}` : ""}`);
  }
  if (record.error && record.findings.length === 0) lines.push(`  error: ${record.error}`);
  return lines.join("\n");
}

const PUBLISH_FAILED_STATES: ReadonlySet<string> = new Set(["failed", "partial", "reconcile-failed"]);

export async function run(argv: string[], store: ForgeStore): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      repo: { type: "string" },
      out: { type: "string" },
      json: { type: "boolean", default: false },
      run: { type: "boolean", default: false },
      publish: { type: "boolean", default: false },
      "publish-only": { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  const prRaw = positionals[0];
  if (!prRaw) {
    throw new CliError(
      "MISSING_ARG",
      "Usage: forge review <pr-number> [--repo <root>] [--out <file|->] [--json] [--run [--publish]] [--publish-only]",
      { exitCode: 1 },
    );
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

  if (values["publish-only"] === true) {
    const { record, findingsPath, source } = await runPublishOnly(
      { prNum, repoRoot: repo.root, repoName: repo.name },
      store,
      (msg) => process.stdout.write(`${msg}\n`),
    );
    if (values.json === true) {
      emitOk({ prNumber: prNum, repoName: repo.name, source, findingsPath, publish: record }, true);
    } else {
      process.stdout.write(`${formatPublishOutcome(record)}\n`);
    }
    if (PUBLISH_FAILED_STATES.has(record.state)) {
      throw new CliError("PUBLISH_FAILED", `publish ${record.state}: ${record.error ?? "see per-finding outcomes"}`, {
        detail: record,
        exitCode: 4,
      });
    }
    return;
  }

  if (values.run === true) {
    const { sessionId, runDir, result } = await runReviewInProcess(
      {
        prNum,
        repoRoot: repo.root,
        repoName: repo.name,
        publishToGitHub: values.publish === true,
      },
      store,
      (msg) => process.stdout.write(`${msg}\n`),
    );
    if (values.json === true) {
      emitOk(
        {
          prNumber: prNum,
          repoName: repo.name,
          sessionId,
          runDir,
          verdict: result.verdict,
          findings: result.findings,
          publish: result.publish,
          error: result.error,
        },
        true,
      );
    } else {
      process.stdout.write(`\nReview of PR #${prNum} in ${repo.name} — verdict: ${result.verdict ?? "(none)"}\n`);
      process.stdout.write(`${formatFindingsTable(result.findings)}\n`);
      process.stdout.write(`${formatPublishOutcome(result.publish)}\n`);
      process.stdout.write(`artifacts: ${runDir}\n`);
    }
    if (result.exitCode !== 0) {
      throw new CliError("REVIEW_FAILED", result.error ?? "review failed", { exitCode: 1 });
    }
    if (result.publishError) {
      throw new CliError("PUBLISH_FAILED", result.publishError, { detail: result.publish, exitCode: 4 });
    }
    return;
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
      const tasks = store.getPlans(repo.root);
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
