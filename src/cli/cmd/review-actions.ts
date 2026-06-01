/**
 * Ad-hoc reviewer orchestrator — backs `POST /api/prs/:num/run-review`.
 *
 * Split in two:
 *   - runAdHocReview() runs in the HTTP-handler thread. It validates the
 *     request, mints a session id, creates the run dir, pre-opens the log
 *     file, inserts the `sessions` row, and spawns a detached worker.
 *   - runReviewWorker() runs as `forge __review-worker <sessionId>`. It
 *     composes the reviewer prompt, invokes the configured agent adapter
 *     via the same agentCommand() the launch pipeline uses, writes the
 *     review artifacts, and finalizes the session row.
 *
 * The two never share a process — the parent returns to the HTTP loop as
 * soon as the worker is unref'd. Coordination happens through the session
 * row + on-disk artifacts (review-prompt.txt, review-raw.md, review.md,
 * findings.json, meta.json).
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { CliError } from "../../cli/output.ts";
import { adapterStreamsTokens, agentJobCommand, captureSidecarMetrics } from "../../core/agents/index.ts";
import { finalizeSession, type SessionMetrics, upsertSession } from "../../core/db/writes.ts";
import { resolveGhEnv } from "../../core/gh.ts";
import {
  buildReviewerPrompt,
  extractLastForgeReviewBlock,
  type ForgeFinding,
  parseForgeReviewFindings,
  parseForgeReviewVerdict,
} from "../../core/reviewer.ts";
import type { ForgeStore } from "../../core/store.ts";

const PR_VIEW_FIELDS = "number,title,body,headRefName,baseRefName,additions,deletions,changedFiles,url";
const SCHEMA_VERSION = 1;

export interface RunAdHocReviewInput {
  prNum: number;
  repoRoot: string;
  repoName: string;
}

export interface RunAdHocReviewResult {
  sessionId: string;
  logStreamUrl: string;
  runDir: string;
}

interface AdHocReviewMeta {
  schemaVersion: number;
  repoRoot: string;
  repoName: string;
  prNum: number;
  headRefName: string | null;
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  status: "running" | "completed" | "failed";
  exitCode: number | null;
}

function reviewerSkillsDir(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "skills", "forge-reviewer");
}

function mintSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `s-review-pr-${ts}-${rand}`;
}

function adHocRunDir(store: ForgeStore, prNum: number, sessionId: string): string {
  return path.join(store.runsDir, "pr-review", `${prNum}-${sessionId}`);
}

function adHocReviewSentinelLine(exitCode: number, error: string | null): string {
  const payload = JSON.stringify({ exitCode, error });
  return `[forge:session-done ${payload}]`;
}

/** Parser for the sentinel line emitted by the worker on exit. Returns
 *  null if the line isn't a sentinel. */
export function parseAdHocReviewSentinel(line: string): { exitCode: number; error: string | null } | null {
  const m = line.match(/\[forge:session-done (\{.*\})\]$/);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1]) as { exitCode?: unknown; error?: unknown };
    const exitCode =
      typeof parsed.exitCode === "number" ? parsed.exitCode : Number.parseInt(String(parsed.exitCode), 10);
    if (!Number.isFinite(exitCode)) return null;
    const error = typeof parsed.error === "string" ? parsed.error : parsed.error === null ? null : null;
    return { exitCode, error };
  } catch {
    return null;
  }
}

// ─── Parent: runAdHocReview ──────────────────────────────────────────────────

export async function runAdHocReview(input: RunAdHocReviewInput, store: ForgeStore): Promise<RunAdHocReviewResult> {
  const { prNum, repoRoot, repoName } = input;

  // 1) repoConfig validates first — cheap and deterministic.
  const repoConfig = store.getRepoConfig(repoRoot);
  if (!repoConfig.reviewerAgent || !repoConfig.reviewerModel) {
    throw new CliError("REVIEWER_NOT_CONFIGURED", `Reviewer agent or model is not configured for repo ${repoName}.`, {
      hint: "Set reviewerAgent and reviewerModel via the repo settings or `forge config set`.",
      exitCode: 3,
    });
  }

  // 2) gh auth resolves before we spawn anything.
  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  if (ghEnvResult.error) {
    throw new CliError("GH_AUTH", ghEnvResult.error, { exitCode: 2 });
  }
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  // 3) PR must exist. `gh pr view` is the canonical existence check.
  let prInfoJson = "";
  let headRefName: string | null = null;
  try {
    prInfoJson = execFileSync("gh", ["pr", "view", String(prNum), "--json", PR_VIEW_FIELDS], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd: repoRoot,
      env: ghEnv,
    }).trim();
    try {
      const parsed = JSON.parse(prInfoJson) as { headRefName?: string };
      headRefName = parsed.headRefName ?? null;
    } catch {
      // PR view returned non-JSON — fall through; the worker will surface it.
    }
  } catch (e) {
    const err = e as { stderr?: string; message?: string };
    const detail = (err.stderr ?? err.message ?? "").toString().trim().split("\n")[0] || "unknown gh failure";
    if (/could not resolve|not found/i.test(detail)) {
      throw new CliError("PR_NOT_FOUND", `PR #${prNum} not found in ${repoName}: ${detail}`, { exitCode: 1 });
    }
    throw new CliError("GH_FAIL", `gh pr view ${prNum} failed: ${detail}`, {
      hint: "Verify gh is authenticated for this repo's host.",
      exitCode: 2,
    });
  }

  // 4) No in-flight ad-hoc review for this (repoRoot, prNum). Single-flight
  //    guards stop the user from kicking off five reviews while one is
  //    already streaming into the drawer.
  const inFlight = store.db.db
    .prepare(
      `SELECT id FROM sessions
        WHERE purpose = 'review'
          AND state = 'running'
          AND json_extract(metrics, '$.prNum') = ?
          AND json_extract(metrics, '$.repoRoot') = ?
        LIMIT 1`,
    )
    .get(prNum, repoRoot) as { id: string } | undefined;
  if (inFlight) {
    throw new CliError(
      "REVIEW_IN_FLIGHT",
      `An ad-hoc review is already running for PR #${prNum} in ${repoName} (session ${inFlight.id}).`,
      { exitCode: 1 },
    );
  }

  // 5) Mint ids, create run dir, pre-open log.
  const sessionId = mintSessionId();
  const runDir = adHocRunDir(store, prNum, sessionId);
  fs.mkdirSync(runDir, { recursive: true });
  const logFile = path.join(runDir, "agent.log");
  // touch the log so the SSE endpoint has something to tail before the
  // worker prints its first line.
  fs.writeFileSync(logFile, "", { flag: "a" });

  const startedAt = new Date().toISOString();
  const seedMeta: AdHocReviewMeta = {
    schemaVersion: SCHEMA_VERSION,
    repoRoot,
    repoName,
    prNum,
    headRefName,
    sessionId,
    startedAt,
    completedAt: null,
    status: "running",
    exitCode: null,
  };
  fs.writeFileSync(path.join(runDir, "meta.json"), `${JSON.stringify(seedMeta, null, 2)}\n`, "utf-8");

  // 6) Insert the session row. The HTTP log resolver and the "in-flight"
  //    check both key off this row.
  upsertSession(store.db.db, {
    id: sessionId,
    purpose: "review",
    relatedId: null,
    agentAdapter: repoConfig.reviewerAgent,
    model: repoConfig.reviewerModel,
    startedAt,
    cwd: repoRoot,
    state: "running",
    metrics: {
      // SessionMetrics is a fixed shape — these extra keys ride on the
      // metrics blob as JSON; the read side already parses leniently and
      // tolerates unknown keys.
      ...({ logFile, runDir, prNum, repoRoot } as unknown as Partial<import("../../core/db/writes.ts").SessionMetrics>),
    },
  });

  // 7) Spawn the detached worker. stdio['ignore', logFd, logFd] sends the
  //    child's stdout/stderr straight into the log file the SSE endpoint
  //    is tailing.
  const logFd = fs.openSync(logFile, "a");
  try {
    const scriptPath = process.argv[1];
    if (!scriptPath) {
      throw new CliError("INTERNAL", "process.argv[1] missing — cannot spawn forge CLI subprocess");
    }
    const bunPath = Bun.which("bun");
    if (!bunPath) {
      throw new CliError("INTERNAL", "Bun.which('bun') returned null — cannot locate bun on PATH");
    }
    const proc = Bun.spawn({
      cmd: [bunPath, scriptPath, "__review-worker", sessionId],
      stdio: ["ignore", logFd, logFd],
      cwd: repoRoot,
      env: ghEnv,
    });
    // Once stdio is wired into the child, the parent can release the fd —
    // dup2 happened during spawn so the child has its own copy.
    proc.unref();
  } catch (e) {
    // Roll back: close fd, finalize the session as failed, surface the
    // error to the HTTP caller.
    try {
      fs.closeSync(logFd);
    } catch {
      /* noop */
    }
    const msg = e instanceof Error ? e.message : String(e);
    finalizeSession(store.db.db, {
      id: sessionId,
      finishedAt: new Date().toISOString(),
      state: "failed",
      exitCode: -1,
      error: `failed to spawn reviewer worker: ${msg}`,
    });
    throw new CliError("WORKER_SPAWN_FAILED", `failed to spawn reviewer worker: ${msg}`, { exitCode: 3 });
  }
  try {
    fs.closeSync(logFd);
  } catch {
    /* noop */
  }

  return {
    sessionId,
    logStreamUrl: `/api/sessions/${encodeURIComponent(sessionId)}/log`,
    runDir,
  };
}

// ─── Child: forge __review-worker <sessionId> ────────────────────────────────

/**
 * Detached worker entry. Argv: <sessionId>. stdout/stderr is already
 * pointed at the run-dir log via the parent's `Bun.spawn` stdio config.
 *
 * The worker never throws past this function — every error path finalizes
 * the session row with `state='failed'` plus a structured error message
 * and writes the sentinel line so the SSE log stream can emit `done`.
 */
export async function runReviewWorker(argv: string[], store: ForgeStore): Promise<void> {
  const sessionId = argv[0];
  if (!sessionId) {
    process.stdout.write("[forge:review-worker] missing sessionId argument\n");
    process.stdout.write(`${adHocReviewSentinelLine(-1, "missing sessionId")}\n`);
    process.exit(1);
  }

  // Load the session row to recover the on-disk paths and PR identity.
  const row = store.db.db
    .prepare("SELECT id, agent_adapter, model, metrics FROM sessions WHERE id = ?")
    .get(sessionId) as { id: string; agent_adapter: string; model: string | null; metrics: string | null } | undefined;
  if (!row) {
    process.stdout.write(`[forge:review-worker] no session row for ${sessionId}\n`);
    process.stdout.write(`${adHocReviewSentinelLine(-1, "missing session row")}\n`);
    process.exit(1);
  }

  let metrics: Record<string, unknown> = {};
  try {
    metrics = JSON.parse(row.metrics ?? "{}");
  } catch {
    metrics = {};
  }
  const runDir = typeof metrics.runDir === "string" ? metrics.runDir : null;
  const prNum = typeof metrics.prNum === "number" ? metrics.prNum : null;
  const repoRoot = typeof metrics.repoRoot === "string" ? metrics.repoRoot : null;

  if (!runDir || prNum == null || !repoRoot) {
    const err = "session row missing runDir/prNum/repoRoot in metrics";
    finalizeSession(store.db.db, {
      id: sessionId,
      finishedAt: new Date().toISOString(),
      state: "failed",
      exitCode: -1,
      error: err,
    });
    process.stdout.write(`[forge:review-worker] ${err}\n`);
    process.stdout.write(`${adHocReviewSentinelLine(-1, err)}\n`);
    process.exit(1);
  }

  const metaPath = path.join(runDir, "meta.json");
  const seedMeta = readMetaSafe(metaPath);
  const repoName = (seedMeta?.repoName as string | undefined) ?? path.basename(repoRoot);
  const headRefName = (seedMeta?.headRefName as string | null | undefined) ?? null;

  // Resolve gh env (it's stamped from the parent's spawn env, but we still
  // need the repoConfig to know whether to set GH_TOKEN/GH_ENTERPRISE_TOKEN
  // for `gh pr diff` / `gh pr checks`).
  const repoConfig = store.getRepoConfig(repoRoot);
  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  process.stdout.write(`[forge:review-worker] starting review of PR #${prNum} in ${repoName}\n`);
  process.stdout.write(`[forge:review-worker] agent=${row.agent_adapter} model=${row.model ?? "(unset)"}\n`);

  let exitCode = 0;
  let error: string | null = null;
  let metricsPatch: Partial<SessionMetrics> = {};
  try {
    const prInfoJson = runGhSafe(["pr", "view", String(prNum), "--json", PR_VIEW_FIELDS], ghEnv, repoRoot);
    const ciChecks = runGhSafe(["pr", "checks", String(prNum)], ghEnv, repoRoot);
    const diff = runGhSafe(["pr", "diff", String(prNum)], ghEnv, repoRoot);

    // Linked Forge spec lookup by branch (best-effort — many PRs have no
    // linked plan and the reviewer prompt handles that gracefully).
    let linkedSpec: string | null = null;
    if (headRefName) {
      try {
        const plans = store.getPlans(repoRoot);
        const match = plans.find((p) => p.branch === headRefName);
        if (match) {
          const spec = store.getSpec(match.id);
          if (spec) linkedSpec = spec.replace(/^---[\s\S]*?---\n*/m, "").trim();
        }
      } catch (e) {
        process.stdout.write(`[forge:review-worker] linked spec lookup failed: ${(e as Error).message}\n`);
      }
    }

    const prompt = buildReviewerPrompt({
      prNum,
      repoName,
      skillsDir: reviewerSkillsDir(),
      prInfoJson,
      ciChecks,
      diff,
      linkedSpec,
    });
    const promptFile = path.join(runDir, "review-prompt.txt");
    fs.writeFileSync(promptFile, prompt, "utf-8");

    const adapter = row.agent_adapter as Parameters<typeof agentJobCommand>[0];
    const streamFile = path.join(runDir, "review.stream.jsonl");
    const cmd = agentJobCommand(adapter, row.model ?? "", promptFile, streamFile, {
      reasoningEffort: repoConfig.reviewerReasoningEffort,
    });

    process.stdout.write(`[forge:review-worker] invoking reviewer\n`);
    // Bash so we get the same shell semantics the agent command was built
    // for (claude/codex stream-json piped through a projection, plain text
    // for opencode/gemini). Output is captured to review-raw.md AND echoed
    // to the worker's stdout (which the SSE log tails).
    const rawFile = path.join(runDir, "review-raw.md");
    const bashLine = `set -o pipefail; ${cmd} 2>&1 | tee "${rawFile.replace(/"/g, '\\"')}"`;
    try {
      execFileSync("bash", ["-c", bashLine], {
        stdio: ["ignore", "inherit", "inherit"],
        env: ghEnv,
        cwd: repoRoot,
      });
    } catch (e) {
      // Even on a non-zero exit the agent may have written a parseable
      // sidecar before dying; capture it so the failed row still records
      // tokens/cost, mirroring the launch bash runner's failure branch.
      if (adapterStreamsTokens(adapter) && fs.existsSync(streamFile)) {
        metricsPatch = await captureSidecarMetrics(adapter, row.model, streamFile);
      }
      const err = e as { status?: number; message?: string };
      throw new Error(`reviewer agent exited non-zero (${err.status ?? "?"}): ${err.message ?? "no detail"}`);
    }

    // Capture tokens/cost from the sidecar before extraction (which may
    // throw) so a verdict-parse miss doesn't lose the run's token count.
    if (adapterStreamsTokens(adapter)) {
      metricsPatch = await captureSidecarMetrics(adapter, row.model, streamFile);
    }

    // Extract the last forge-review block and parse findings.
    const raw = fs.existsSync(rawFile) ? fs.readFileSync(rawFile, "utf-8") : "";
    const block = extractLastForgeReviewBlock(raw);
    if (!block) {
      throw new Error("no fenced forge-review block in reviewer output");
    }
    fs.writeFileSync(path.join(runDir, "review.md"), block, "utf-8");

    const findings: ForgeFinding[] = parseForgeReviewFindings(block);
    fs.writeFileSync(path.join(runDir, "findings.json"), `${JSON.stringify(findings, null, 2)}\n`, "utf-8");
    process.stdout.write(`[forge:review-worker] parsed ${findings.length} finding(s)\n`);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    exitCode = 1;
    process.stdout.write(`[forge:review-worker] error: ${error}\n`);
  }

  // Write the meta.json with the final shape and finalize the session row.
  const completedAt = new Date().toISOString();
  const status = exitCode === 0 ? "completed" : "failed";
  writeMetaSafe(metaPath, {
    schemaVersion: SCHEMA_VERSION,
    repoRoot,
    repoName,
    prNum,
    headRefName,
    sessionId,
    startedAt: (seedMeta?.startedAt as string | undefined) ?? completedAt,
    completedAt,
    status,
    exitCode,
  });

  finalizeSession(store.db.db, {
    id: sessionId,
    finishedAt: completedAt,
    state: exitCode === 0 ? "completed" : "failed",
    exitCode,
    error,
    metrics: metricsPatch,
  });

  // Sentinel line — the SSE serializer translates it into a `done` event.
  // Always last so the client sees done AFTER it sees any error text.
  process.stdout.write(`${adHocReviewSentinelLine(exitCode, error)}\n`);
  process.exit(exitCode);
}

// ─── forge __extract-review <raw> <out> ──────────────────────────────────────

/**
 * Internal subcommand the tmux launch runner calls in place of an inline
 * `python3` block: read the reviewer's raw output, extract the LAST
 * ```forge-review block (nested-fence aware — see
 * reviewer.ts:extractLastForgeReviewBlock), write it to <out>, and print
 * the verdict as JSON on stdout.
 *
 * Exit codes mirror the old Python contract so the runner's branches stay
 * unchanged: 2 = no forge-review block found, 0 = block written (verdict
 * may still be `null` if the block lacks a recognised `## Verdict`).
 */
export function runExtractReviewBlock(argv: string[]): void {
  const [rawFile, outFile] = argv;
  if (!rawFile || !outFile) {
    process.stderr.write("usage: forge __extract-review <raw-file> <out-file>\n");
    process.exit(2);
  }
  let raw = "";
  try {
    raw = fs.readFileSync(rawFile, "utf-8");
  } catch {
    // Missing/unreadable raw output is treated the same as "no block".
    process.exit(2);
  }
  const block = extractLastForgeReviewBlock(raw);
  if (block === null) process.exit(2);
  fs.writeFileSync(outFile, block, "utf-8");
  process.stdout.write(`${JSON.stringify(parseForgeReviewVerdict(block))}\n`);
  process.exit(0);
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function readMetaSafe(metaPath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function writeMetaSafe(metaPath: string, meta: AdHocReviewMeta): void {
  try {
    fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf-8");
  } catch {
    /* worker logs the error elsewhere; meta is advisory */
  }
}

function runGhSafe(args: string[], env: Record<string, string>, cwd: string): string {
  try {
    return execFileSync("gh", args, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd,
      env,
    });
  } catch (e) {
    const err = e as { stderr?: string; message?: string };
    const detail = (err.stderr ?? err.message ?? "").toString().trim().split("\n")[0] || "unknown gh failure";
    process.stdout.write(`[forge:review-worker] gh ${args.join(" ")} failed: ${detail}\n`);
    return "";
  }
}

// ─── Review history (used by the /api/prs/:num/reviews routes) ──────────────

export type ReviewRunStatus = "running" | "completed" | "failed" | "killed";

export type ReviewSeverityCounts = {
  BLOCKER: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
};

export interface ReviewRunSummary {
  sessionId: string;
  agent: string;
  model: string | null;
  startedAt: string;
  completedAt: string | null;
  status: ReviewRunStatus;
  verdict: "approve" | "request-changes" | "block" | null;
  findingsTotal: number;
  findingCounts: ReviewSeverityCounts;
}

export interface ReviewRunDetail {
  sessionId: string;
  status: ReviewRunStatus;
  agent: string;
  model: string | null;
  startedAt: string;
  completedAt: string | null;
  verdict: "approve" | "request-changes" | "block" | null;
  summary: string;
  findings: ForgeFinding[];
}

interface ReviewSessionRow {
  id: string;
  agent_adapter: string;
  model: string | null;
  started_at: string;
  finished_at: string | null;
  state: string;
  metrics: string | null;
}

function parseReviewMetricsBlob(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readReviewFindingsAt(runDir: string): ForgeFinding[] {
  try {
    const raw = fs.readFileSync(path.join(runDir, "findings.json"), "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ForgeFinding[];
  } catch {
    return [];
  }
}

function tallySeverities(findings: ForgeFinding[]): ReviewSeverityCounts {
  const counts: ReviewSeverityCounts = { BLOCKER: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const f of findings) {
    if (f && (f.severity === "BLOCKER" || f.severity === "HIGH" || f.severity === "MEDIUM" || f.severity === "LOW")) {
      counts[f.severity]++;
    }
  }
  return counts;
}

function formatSeveritySummary(counts: ReviewSeverityCounts): string {
  const parts: string[] = [];
  if (counts.BLOCKER > 0) parts.push(`${counts.BLOCKER} BLOCKER`);
  if (counts.HIGH > 0) parts.push(`${counts.HIGH} HIGH`);
  if (counts.MEDIUM > 0) parts.push(`${counts.MEDIUM} MEDIUM`);
  if (counts.LOW > 0) parts.push(`${counts.LOW} LOW`);
  if (parts.length === 0) return "No findings";
  return parts.join(", ");
}

function readReviewVerdictAt(runDir: string): "approve" | "request-changes" | "block" | null {
  try {
    const reviewMd = fs.readFileSync(path.join(runDir, "review.md"), "utf-8");
    return parseForgeReviewVerdict(reviewMd);
  } catch {
    return null;
  }
}

function normalizeReviewStatus(state: string): ReviewRunStatus {
  if (state === "running" || state === "completed" || state === "failed" || state === "killed") return state;
  return "failed";
}

/**
 * List every recorded ad-hoc review for a (prNum, repoRoot), newest first.
 * Scope is the `sessions` table — launch auto-review findings are NOT
 * included here (they have no review session row).
 */
export function listForgeReviews(store: ForgeStore, prNum: number, repoRoot: string): ReviewRunSummary[] {
  const rows = store.db.db
    .prepare(
      `SELECT id, agent_adapter, model, started_at, finished_at, state, metrics
         FROM sessions
        WHERE purpose = 'review'
          AND json_extract(metrics, '$.prNum') = ?
          AND json_extract(metrics, '$.repoRoot') = ?
        ORDER BY started_at DESC`,
    )
    .all(prNum, repoRoot) as ReviewSessionRow[];

  const out: ReviewRunSummary[] = [];
  for (const row of rows) {
    const metrics = parseReviewMetricsBlob(row.metrics);
    const rowPrNum = typeof metrics.prNum === "number" ? metrics.prNum : null;
    const rowRepoRoot = typeof metrics.repoRoot === "string" ? metrics.repoRoot : null;
    if (rowPrNum !== prNum || rowRepoRoot !== repoRoot) continue;

    const status = normalizeReviewStatus(row.state);
    const runDir = adHocRunDir(store, prNum, row.id);
    const findings = readReviewFindingsAt(runDir);
    const findingCounts = tallySeverities(findings);
    const verdict = status === "running" ? null : readReviewVerdictAt(runDir);
    out.push({
      sessionId: row.id,
      agent: row.agent_adapter,
      model: row.model,
      startedAt: row.started_at,
      completedAt: row.finished_at,
      status,
      verdict,
      findingsTotal: findings.length,
      findingCounts,
    });
  }
  return out;
}

/**
 * Load a single recorded review's findings + verdict + derived summary.
 * Returns null when the session row doesn't exist or its metrics don't
 * match the requested (prNum, repoRoot) — guards against reading an
 * arbitrary run dir from a maliciously crafted sessionId.
 */
export function loadForgeReview(
  store: ForgeStore,
  prNum: number,
  repoRoot: string,
  sessionId: string,
): ReviewRunDetail | null {
  const row = store.db.db
    .prepare(
      `SELECT id, agent_adapter, model, started_at, finished_at, state, metrics
         FROM sessions
        WHERE id = ? AND purpose = 'review'`,
    )
    .get(sessionId) as ReviewSessionRow | undefined;
  if (!row) return null;

  const metrics = parseReviewMetricsBlob(row.metrics);
  const rowPrNum = typeof metrics.prNum === "number" ? metrics.prNum : null;
  const rowRepoRoot = typeof metrics.repoRoot === "string" ? metrics.repoRoot : null;
  if (rowPrNum !== prNum || rowRepoRoot !== repoRoot) return null;

  const status = normalizeReviewStatus(row.state);
  const runDir = adHocRunDir(store, prNum, row.id);
  const findings = readReviewFindingsAt(runDir);
  const verdict = status === "running" ? null : readReviewVerdictAt(runDir);
  const summary = formatSeveritySummary(tallySeverities(findings));

  return {
    sessionId: row.id,
    status,
    agent: row.agent_adapter,
    model: row.model,
    startedAt: row.started_at,
    completedAt: row.finished_at,
    verdict,
    summary,
    findings,
  };
}

// ─── findings lookup helpers (used by the review-bundle route) ───────────────

export interface FindingsLookupResult {
  findings: ForgeFinding[];
  source: "adhoc" | "launch" | null;
}

// Find the most recent findings.json for a PR. Searches:
//   1) <runsDir>/pr-review/<prNum>-<sessionId>/findings.json   (ad-hoc review)
//   2) <runsDir>/<task-id>/findings.json                       (launch auto-review)
//      filtered to tasks whose branch matches the PR's headRefName.
//
// Picks the newest file across both buckets; ad-hoc wins ties because it
// reflects more recent operator intent (and ad-hoc artifacts live in a
// separate dir, so they never overwrite launch artifacts).
export function findLatestForgeFindings(
  store: ForgeStore,
  prNum: number,
  repoRoot: string,
  headRefName: string | null,
): FindingsLookupResult {
  const candidates: Array<{ path: string; mtime: number; source: "adhoc" | "launch" }> = [];

  // 1) ad-hoc
  const prReviewDir = path.join(store.runsDir, "pr-review");
  try {
    if (fs.existsSync(prReviewDir)) {
      const entries = fs.readdirSync(prReviewDir, { withFileTypes: true });
      const prefix = `${prNum}-`;
      for (const ent of entries) {
        if (!ent.isDirectory() || !ent.name.startsWith(prefix)) continue;
        const fp = path.join(prReviewDir, ent.name, "findings.json");
        try {
          const stat = fs.statSync(fp);
          candidates.push({ path: fp, mtime: stat.mtimeMs, source: "adhoc" });
        } catch {
          /* missing — skip */
        }
      }
    }
  } catch {
    /* prReviewDir transient — skip */
  }

  // 2) launch auto-review — only for plans whose branch matches the PR.
  if (headRefName) {
    try {
      const plans = store.getPlans(repoRoot).filter((p) => p.branch === headRefName);
      for (const plan of plans) {
        const fp = path.join(store.runsDir, plan.id, "findings.json");
        try {
          const stat = fs.statSync(fp);
          candidates.push({ path: fp, mtime: stat.mtimeMs, source: "launch" });
        } catch {
          /* no findings.json for this plan — skip */
        }
      }
    } catch {
      /* plans table empty / transient — skip */
    }
  }

  if (candidates.length === 0) return { findings: [], source: null };

  // Newest wins. On equal mtime, ad-hoc wins (per spec: "per-PR ad-hoc
  // review wins, more recent intent").
  candidates.sort((a, b) => {
    if (b.mtime !== a.mtime) return b.mtime - a.mtime;
    return a.source === "adhoc" ? -1 : 1;
  });
  const pick = candidates[0];
  try {
    const findings = JSON.parse(fs.readFileSync(pick.path, "utf-8")) as ForgeFinding[];
    if (!Array.isArray(findings)) return { findings: [], source: null };
    return { findings, source: pick.source };
  } catch {
    return { findings: [], source: null };
  }
}
