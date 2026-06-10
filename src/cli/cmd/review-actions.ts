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
import { parseApiHost, parseNameWithOwner } from "../../core/gh-pr.ts";
import { type PublishResult, publishReviewFindings } from "../../core/gh-pr-write.ts";
import {
  notRequestedRecord,
  type PublishRecord,
  readPublishRecord,
  writePublishRecord,
} from "../../core/publish-record.ts";
import {
  buildReviewerPrompt,
  extractLastForgeReviewBlock,
  type ForgeFinding,
  parseForgeReviewFindings,
  parseForgeReviewVerdict,
  type ReviewVerdict,
} from "../../core/reviewer.ts";
import { reapStaleWorkerSessions } from "../../core/session-reaper.ts";
import type { ForgeStore } from "../../core/store.ts";

const PR_VIEW_FIELDS = "number,title,body,headRefName,baseRefName,additions,deletions,changedFiles,url,headRefOid";
const SCHEMA_VERSION = 1;

export interface RunAdHocReviewInput {
  prNum: number;
  repoRoot: string;
  repoName: string;
  /**
   * Per-request opt-in to publish findings as GitHub review comments (the
   * "Publish to PR" checkbox). Survives the detach via the session `metrics`
   * blob.
   */
  publishToGitHub?: boolean;
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

/**
 * Publishing is driven solely by the per-request opt-in (the "Publish to PR"
 * checkbox), persisted in the session metrics blob. With it off, the worker
 * makes zero GitHub write calls.
 */
export function shouldPublishToGitHub(metrics: { publishToGitHub?: unknown }): boolean {
  return metrics.publishToGitHub === true;
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

// ─── Test seams ──────────────────────────────────────────────────────────────
//
// Mirrors __setGhRunner in gh-pr-write.ts: every subprocess this module
// spawns (gh reads, the reviewer agent, the detached worker) routes through
// this indirection so tests can drive the full pipeline without real
// gh/claude processes.

export interface ReviewExecHooks {
  /** Synchronous `gh <args>` — throws on non-zero exit (execFileSync shape). */
  ghExec: (args: string[], env: Record<string, string>, cwd: string) => string;
  /** Run the reviewer agent command line; throws on failure or timeout. */
  agentExec: (args: {
    bashLine: string;
    rawFile: string;
    streamFile: string;
    env: Record<string, string>;
    cwd: string;
    timeoutMs: number;
  }) => void;
  /** Spawn the detached review worker; returns its pid. */
  spawnWorker: (args: { cmd: string[]; logFd: number; cwd: string; env: Record<string, string> }) => {
    pid: number | undefined;
    unref: () => void;
  };
}

let execHooks: Partial<ReviewExecHooks> | null = null;
export function __setReviewExecHooks(hooks: Partial<ReviewExecHooks> | null): void {
  execHooks = hooks;
}

function ghExecDefault(args: string[], env: Record<string, string>, cwd: string): string {
  return execFileSync("gh", args, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
    cwd,
    env,
  });
}

function ghExec(args: string[], env: Record<string, string>, cwd: string): string {
  return (execHooks?.ghExec ?? ghExecDefault)(args, env, cwd);
}

function agentExecDefault(args: {
  bashLine: string;
  rawFile: string;
  streamFile: string;
  env: Record<string, string>;
  cwd: string;
  timeoutMs: number;
}): void {
  // Bash so we get the same shell semantics the agent command was built for
  // (claude/codex stream-json piped through a projection, plain text for
  // opencode/gemini). `timeout` SIGTERMs a hung reviewer — no GNU `timeout`
  // binary on macOS, so the watchdog lives here.
  execFileSync("bash", ["-c", args.bashLine], {
    stdio: ["ignore", "inherit", "inherit"],
    env: args.env,
    cwd: args.cwd,
    timeout: args.timeoutMs,
    killSignal: "SIGTERM",
  });
}

function spawnWorkerDefault(args: { cmd: string[]; logFd: number; cwd: string; env: Record<string, string> }): {
  pid: number | undefined;
  unref: () => void;
} {
  const proc = Bun.spawn({
    cmd: args.cmd,
    stdio: ["ignore", args.logFd, args.logFd],
    cwd: args.cwd,
    env: args.env,
  });
  return { pid: proc.pid, unref: () => proc.unref() };
}

function ghFailureDetail(e: unknown): string {
  const err = e as { stderr?: string; message?: string };
  return (err.stderr ?? err.message ?? "").toString().trim().split("\n")[0] || "unknown gh failure";
}

// ─── Parent: runAdHocReview ──────────────────────────────────────────────────

interface PreparedReviewSession {
  sessionId: string;
  runDir: string;
  logFile: string;
  startedAt: string;
  headRefName: string | null;
  reviewerAgent: string;
  reviewerModel: string;
  ghEnv: Record<string, string>;
}

/**
 * Shared validation + session setup for an ad-hoc review: repoConfig, gh
 * auth, PR existence, single-flight guard, run dir, meta seed, sessions row.
 * Used by both the detached-worker path (runAdHocReview) and the synchronous
 * CLI path (runReviewInProcess).
 */
function prepareReviewSession(input: RunAdHocReviewInput, store: ForgeStore): PreparedReviewSession {
  const { prNum, repoRoot, repoName } = input;
  const publishToGitHub = input.publishToGitHub === true;

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
  let headRefName: string | null = null;
  try {
    const prInfoJson = ghExec(["pr", "view", String(prNum), "--json", PR_VIEW_FIELDS], ghEnv, repoRoot).trim();
    try {
      const parsed = JSON.parse(prInfoJson) as { headRefName?: string };
      headRefName = parsed.headRefName ?? null;
    } catch {
      // PR view returned non-JSON — fall through; the worker will surface it.
    }
  } catch (e) {
    const detail = ghFailureDetail(e);
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
  //
  //    Reap first, then check: a worker that died before finalizeSession
  //    (SIGKILL, OOM, reboot) leaves its row 'running' forever and would
  //    otherwise 409-block this PR permanently. The reaper finalizes any
  //    dead-pid / stale rows so only genuinely live reviews trip the guard.
  reapStaleWorkerSessions(store);
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
      ...({ logFile, runDir, prNum, repoRoot, publishToGitHub } as unknown as Partial<
        import("../../core/db/writes.ts").SessionMetrics
      >),
    },
  });

  return {
    sessionId,
    runDir,
    logFile,
    startedAt,
    headRefName,
    reviewerAgent: repoConfig.reviewerAgent,
    reviewerModel: repoConfig.reviewerModel,
    ghEnv,
  };
}

export async function runAdHocReview(input: RunAdHocReviewInput, store: ForgeStore): Promise<RunAdHocReviewResult> {
  const { sessionId, runDir, logFile, ghEnv } = prepareReviewSession(input, store);

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
    const proc = (execHooks?.spawnWorker ?? spawnWorkerDefault)({
      cmd: [bunPath, scriptPath, "__review-worker", sessionId],
      logFd,
      cwd: input.repoRoot,
      env: ghEnv,
    });
    // Once stdio is wired into the child, the parent can release the fd —
    // dup2 happened during spawn so the child has its own copy.
    proc.unref();
    // Record the worker pid so a liveness reaper can finalize sessions whose
    // worker died before reaching finalizeSession (stale 'running' rows
    // otherwise 409-block every future review of this PR).
    if (typeof proc.pid === "number") {
      store.db.db
        .prepare("UPDATE sessions SET pid = ?, metrics = json_set(metrics, '$.pid', ?) WHERE id = ?")
        .run(proc.pid, proc.pid, sessionId);
    }
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

  process.stdout.write(`[forge:review-worker] starting review of PR #${prNum} in ${repoName}\n`);
  process.stdout.write(`[forge:review-worker] agent=${row.agent_adapter} model=${row.model ?? "(unset)"}\n`);

  const result = await executeReview({
    store,
    runDir,
    prNum,
    repoRoot,
    repoName,
    headRefName,
    agentAdapter: row.agent_adapter,
    model: row.model,
    publishToGitHub: shouldPublishToGitHub(metrics),
    log: (msg) => process.stdout.write(`[forge:review-worker] ${msg}\n`),
  });

  // Write the meta.json with the final shape and finalize the session row.
  const completedAt = new Date().toISOString();
  const status = result.exitCode === 0 ? "completed" : "failed";
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
    exitCode: result.exitCode,
  });

  // A requested-but-failed publish must not look clean: the session stays
  // 'completed' (the review itself succeeded) but carries the publish
  // failure in its error field — forge status and the Workbench read it.
  const sessionError = result.error ?? result.publishError;
  finalizeSession(store.db.db, {
    id: sessionId,
    finishedAt: completedAt,
    state: status,
    exitCode: result.exitCode,
    error: sessionError,
    metrics: result.metricsPatch,
  });

  // Sentinel line — the SSE serializer translates it into a `done` event.
  // Always last so the client sees done AFTER it sees any error text.
  process.stdout.write(`${adHocReviewSentinelLine(result.exitCode, sessionError)}\n`);
  process.exit(result.exitCode);
}

// ─── executeReview — the shared review pipeline ──────────────────────────────

export interface ExecuteReviewOpts {
  store: ForgeStore;
  runDir: string;
  prNum: number;
  repoRoot: string;
  repoName: string;
  headRefName: string | null;
  agentAdapter: string;
  model: string | null;
  publishToGitHub: boolean;
  log: (msg: string) => void;
}

export interface ExecuteReviewResult {
  exitCode: number;
  /** Review-pipeline failure (gh pre-flight, agent, extraction). */
  error: string | null;
  /** Short message when the review succeeded but a requested publish didn't. */
  publishError: string | null;
  findings: ForgeFinding[];
  verdict: ReviewVerdict | null;
  publish: PublishRecord;
  metricsPatch: Partial<SessionMetrics>;
}

const DEFAULT_REVIEWER_TIMEOUT_MINUTES = 60;

/**
 * Run one PR review end to end: gh pre-flight, prompt compose, reviewer
 * agent, artifact extraction, optional publish. Both the detached worker
 * (`forge __review-worker`) and the synchronous CLI (`forge review --run`)
 * call this; neither path throws — failures come back as `exitCode`/`error`.
 *
 * `publish.json` is written to the run dir on EVERY run so the publish
 * outcome is never reconstructable-only-from-logs.
 */
export async function executeReview(opts: ExecuteReviewOpts): Promise<ExecuteReviewResult> {
  const { store, runDir, prNum, repoRoot, repoName, headRefName, log } = opts;
  const repoConfig = store.getRepoConfig(repoRoot);
  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  let exitCode = 0;
  let error: string | null = null;
  let metricsPatch: Partial<SessionMetrics> = {};
  let findings: ForgeFinding[] = [];
  let verdict: ReviewVerdict | null = null;
  let publish: PublishRecord = { ...notRequestedRecord(), requested: opts.publishToGitHub };

  try {
    // `pr view` and `pr diff` failures are hard errors: an empty diff/PR-info
    // would otherwise blind the reviewer AND silently demote every finding to
    // an out-of-diff body bullet at publish time. `pr checks` stays soft — it
    // exits non-zero for failing/pending checks, which is review input.
    const prInfoJson = runGhHard(["pr", "view", String(prNum), "--json", PR_VIEW_FIELDS], ghEnv, repoRoot);
    const ciChecks = runGhSoft(["pr", "checks", String(prNum)], ghEnv, repoRoot, log);
    const diff = runGhHard(["pr", "diff", String(prNum)], ghEnv, repoRoot);

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
        log(`linked spec lookup failed: ${(e as Error).message}`);
      }
    }

    // Prior findings feed forward so a re-review reuses exact titles/lines for
    // defects it re-confirms — keeps finding ids (and so publish dedup) stable
    // across independent LLM passes. Best-effort: a missing/empty lookup just
    // omits the section.
    let priorFindings: ForgeFinding[] = [];
    try {
      priorFindings = findLatestForgeFindings(store, prNum, repoRoot, headRefName).findings;
    } catch {
      /* no prior findings — fresh review */
    }

    const prompt = buildReviewerPrompt({
      prNum,
      repoName,
      skillsDir: reviewerSkillsDir(),
      prInfoJson,
      ciChecks,
      diff,
      linkedSpec,
      priorFindings,
    });
    const promptFile = path.join(runDir, "review-prompt.txt");
    fs.writeFileSync(promptFile, prompt, "utf-8");

    const adapter = opts.agentAdapter as Parameters<typeof agentJobCommand>[0];
    const streamFile = path.join(runDir, "review.stream.jsonl");
    const cmd = agentJobCommand(adapter, opts.model ?? "", promptFile, streamFile, {
      reasoningEffort: repoConfig.reviewerReasoningEffort,
    });

    // reviewerTimeoutMinutes is read leniently — the optional RepoConfig key
    // may not exist in the type yet; absent/invalid values fall back to 60.
    const timeoutRaw = (repoConfig as { reviewerTimeoutMinutes?: unknown }).reviewerTimeoutMinutes;
    const timeoutMinutes =
      typeof timeoutRaw === "number" && Number.isFinite(timeoutRaw) && timeoutRaw > 0
        ? timeoutRaw
        : DEFAULT_REVIEWER_TIMEOUT_MINUTES;
    const timeoutMs = timeoutMinutes * 60_000;

    log("invoking reviewer");
    // Output is captured to review-raw.md AND echoed to stdout (the SSE log
    // tails it in worker mode; the terminal sees it in CLI mode).
    const rawFile = path.join(runDir, "review-raw.md");
    const bashLine = `set -o pipefail; ${cmd} 2>&1 | tee "${rawFile.replace(/"/g, '\\"')}"`;
    const agentStartedMs = Date.now();
    try {
      (execHooks?.agentExec ?? agentExecDefault)({
        bashLine,
        rawFile,
        streamFile,
        env: ghEnv,
        cwd: repoRoot,
        timeoutMs,
      });
    } catch (e) {
      // Even on a non-zero exit the agent may have written a parseable
      // sidecar before dying; capture it so the failed row still records
      // tokens/cost, mirroring the launch bash runner's failure branch.
      if (adapterStreamsTokens(adapter) && fs.existsSync(streamFile)) {
        metricsPatch = await captureSidecarMetrics(adapter, opts.model, streamFile);
      }
      const err = e as { status?: number; message?: string; code?: string };
      if (err.code === "ETIMEDOUT" || Date.now() - agentStartedMs >= timeoutMs) {
        throw new Error(`reviewer timed out after ${timeoutMinutes} minutes`);
      }
      throw new Error(`reviewer agent exited non-zero (${err.status ?? "?"}): ${err.message ?? "no detail"}`);
    }

    // Capture tokens/cost from the sidecar before extraction (which may
    // throw) so a verdict-parse miss doesn't lose the run's token count.
    if (adapterStreamsTokens(adapter)) {
      metricsPatch = await captureSidecarMetrics(adapter, opts.model, streamFile);
    }

    // Extract the last forge-review block and parse findings.
    const raw = fs.existsSync(rawFile) ? fs.readFileSync(rawFile, "utf-8") : "";
    const block = extractLastForgeReviewBlock(raw);
    if (!block) {
      throw new Error("no fenced forge-review block in reviewer output");
    }
    fs.writeFileSync(path.join(runDir, "review.md"), block, "utf-8");
    verdict = parseForgeReviewVerdict(block);

    findings = parseForgeReviewFindings(block);
    fs.writeFileSync(path.join(runDir, "findings.json"), `${JSON.stringify(findings, null, 2)}\n`, "utf-8");
    log(`parsed ${findings.length} finding(s)`);

    if (opts.publishToGitHub) {
      publish = await publishWithRecord({
        prNum,
        prInfoJson,
        diff,
        findings,
        ghTarget: { user: repoConfig.ghUser, host: repoConfig.ghHost },
        ghEnv,
        cwd: repoRoot,
        log,
      });
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    exitCode = 1;
    log(`error: ${error}`);
    if (opts.publishToGitHub) {
      publish = { ...publish, state: "failed", error: `review failed before publish: ${error}` };
    }
  }

  try {
    writePublishRecord(runDir, publish);
  } catch (e) {
    log(`failed to write publish.json: ${(e as Error).message}`);
  }

  const publishError =
    exitCode === 0 &&
    publish.requested &&
    (publish.state === "failed" || publish.state === "partial" || publish.state === "reconcile-failed")
      ? `publish to GitHub ${publish.state}: ${publish.posted} posted, ${publish.failed} failed${publish.error ? ` — ${publish.error}` : ""}`
      : null;

  // Compact publish summary rides on the session metrics blob (the read side
  // parses leniently and tolerates unknown keys).
  metricsPatch = {
    ...metricsPatch,
    ...({
      publish: { state: publish.state, posted: publish.posted, failed: publish.failed, error: publish.error },
    } as unknown as Partial<SessionMetrics>),
  };

  return { exitCode, error, publishError, findings, verdict, publish, metricsPatch };
}

// ─── runReviewInProcess — synchronous CLI path (`forge review --run`) ────────

export interface RunReviewInProcessResult {
  sessionId: string;
  runDir: string;
  result: ExecuteReviewResult;
}

/**
 * Run an ad-hoc review synchronously in this process. Same validation,
 * session row, artifacts, and finalization as the detached worker — minus
 * the spawn. Backs `forge review <pr> --run [--publish]`.
 */
export async function runReviewInProcess(
  input: RunAdHocReviewInput,
  store: ForgeStore,
  log: (msg: string) => void,
): Promise<RunReviewInProcessResult> {
  const prep = prepareReviewSession(input, store);
  const { sessionId, runDir, logFile, startedAt, headRefName } = prep;
  // The reviewer runs in THIS process — record our pid so a SIGKILLed CLI run
  // is reapable by liveness (without it, the stale 'running' row 409-blocks
  // re-reviews of this PR until the 6h TTL). Found live in the kill test.
  store.db.db
    .prepare("UPDATE sessions SET pid = ?, metrics = json_set(metrics, '$.pid', ?) WHERE id = ?")
    .run(process.pid, process.pid, sessionId);
  // Mirror log lines into agent.log so the Workbench can replay CLI runs.
  const teeLog = (msg: string) => {
    log(msg);
    try {
      fs.appendFileSync(logFile, `${msg}\n`);
    } catch {
      /* advisory */
    }
  };

  const result = await executeReview({
    store,
    runDir,
    prNum: input.prNum,
    repoRoot: input.repoRoot,
    repoName: input.repoName,
    headRefName,
    agentAdapter: prep.reviewerAgent,
    model: prep.reviewerModel,
    publishToGitHub: input.publishToGitHub === true,
    log: teeLog,
  });

  const completedAt = new Date().toISOString();
  const status = result.exitCode === 0 ? "completed" : "failed";
  writeMetaSafe(path.join(runDir, "meta.json"), {
    schemaVersion: SCHEMA_VERSION,
    repoRoot: input.repoRoot,
    repoName: input.repoName,
    prNum: input.prNum,
    headRefName,
    sessionId,
    startedAt,
    completedAt,
    status,
    exitCode: result.exitCode,
  });
  finalizeSession(store.db.db, {
    id: sessionId,
    finishedAt: completedAt,
    state: status,
    exitCode: result.exitCode,
    error: result.error ?? result.publishError,
    metrics: result.metricsPatch,
  });

  return { sessionId, runDir, result };
}

// ─── runPublishOnly — re-publish saved findings (`forge review --publish-only`)

export interface PublishOnlyResult {
  source: "adhoc" | "launch";
  findingsPath: string;
  record: PublishRecord;
}

/**
 * Load the latest saved findings for a PR (ad-hoc or launch bucket) and
 * re-run the idempotent publish. The marker-based reconciliation makes this
 * safe to repeat — already-published findings are skipped.
 */
export async function runPublishOnly(
  input: { prNum: number; repoRoot: string; repoName: string },
  store: ForgeStore,
  log: (msg: string) => void,
): Promise<PublishOnlyResult> {
  const repoConfig = store.getRepoConfig(input.repoRoot);
  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  if (ghEnvResult.error) {
    throw new CliError("GH_AUTH", ghEnvResult.error, { exitCode: 2 });
  }
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  let prInfoJson = "";
  try {
    prInfoJson = ghExec(
      ["pr", "view", String(input.prNum), "--json", "url,headRefName,headRefOid"],
      ghEnv,
      input.repoRoot,
    ).trim();
  } catch (e) {
    throw new CliError("GH_FAIL", `gh pr view ${input.prNum} failed: ${ghFailureDetail(e)}`, {
      hint: "Verify gh is authenticated for this repo's host.",
      exitCode: 2,
    });
  }
  let headRefName: string | null = null;
  try {
    headRefName = (JSON.parse(prInfoJson) as { headRefName?: string }).headRefName ?? null;
  } catch {
    /* tolerated — lookup falls back to the ad-hoc bucket only */
  }

  const lookup = findLatestForgeFindings(store, input.prNum, input.repoRoot, headRefName);
  if (lookup.findings.length === 0 || !lookup.path) {
    throw new CliError("NO_FINDINGS", `No saved findings for PR #${input.prNum} in ${input.repoName}.`, {
      hint: "Run `forge review <pr> --run` (or a Workbench review) first.",
      exitCode: 1,
    });
  }
  log(`publishing ${lookup.findings.length} finding(s) from ${lookup.path} (${lookup.source})`);

  let diff: string;
  try {
    diff = runGhHard(["pr", "diff", String(input.prNum)], ghEnv, input.repoRoot);
  } catch (e) {
    throw new CliError("GH_FAIL", (e as Error).message, { exitCode: 2 });
  }

  const record = await publishWithRecord({
    prNum: input.prNum,
    prInfoJson,
    diff,
    findings: lookup.findings,
    ghTarget: { user: repoConfig.ghUser, host: repoConfig.ghHost },
    ghEnv,
    cwd: input.repoRoot,
    log,
  });
  try {
    writePublishRecord(path.dirname(lookup.path), record);
  } catch {
    /* record is advisory for publish-only — the outcome is printed */
  }
  return { source: lookup.source ?? "adhoc", findingsPath: lookup.path, record };
}

// ─── republishReviewSession — retry-publish for one recorded review ──────────

export interface RepublishSessionResult {
  runDir: string;
  record: PublishRecord;
}

/**
 * Re-run the idempotent publish for one recorded review session, from the
 * findings.json saved in that session's run dir. Backs the Workbench's
 * retry-publish endpoint (POST /api/prs/:num/reviews/:sessionId/publish).
 * Unlike runPublishOnly (which picks the newest findings across all runs),
 * this targets exactly the session the operator clicked.
 *
 * Throws CliError: REVIEW_NOT_FOUND (no matching session for this pr/repo),
 * REVIEW_RUNNING (still in flight), NO_FINDINGS, GH_AUTH, GH_FAIL.
 */
export async function republishReviewSession(
  input: { prNum: number; repoRoot: string; sessionId: string },
  store: ForgeStore,
  log: (msg: string) => void,
): Promise<RepublishSessionResult> {
  const detail = loadForgeReview(store, input.prNum, input.repoRoot, input.sessionId);
  if (!detail) {
    throw new CliError("REVIEW_NOT_FOUND", `No review with id "${input.sessionId}" for PR #${input.prNum}.`, {
      exitCode: 1,
    });
  }
  if (detail.status === "running") {
    throw new CliError(
      "REVIEW_RUNNING",
      `Review ${input.sessionId} is still running — wait for it to finish before re-publishing.`,
      { exitCode: 1 },
    );
  }
  if (detail.findings.length === 0) {
    throw new CliError("NO_FINDINGS", `Review ${input.sessionId} has no saved findings to publish.`, { exitCode: 1 });
  }
  const runDir = adHocRunDir(store, input.prNum, input.sessionId);

  const repoConfig = store.getRepoConfig(input.repoRoot);
  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  if (ghEnvResult.error) {
    throw new CliError("GH_AUTH", ghEnvResult.error, { exitCode: 2 });
  }
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  let prInfoJson = "";
  try {
    prInfoJson = ghExec(
      ["pr", "view", String(input.prNum), "--json", "url,headRefName,headRefOid"],
      ghEnv,
      input.repoRoot,
    ).trim();
  } catch (e) {
    throw new CliError("GH_FAIL", `gh pr view ${input.prNum} failed: ${ghFailureDetail(e)}`, {
      hint: "Verify gh is authenticated for this repo's host.",
      exitCode: 2,
    });
  }
  let diff: string;
  try {
    diff = runGhHard(["pr", "diff", String(input.prNum)], ghEnv, input.repoRoot);
  } catch (e) {
    throw new CliError("GH_FAIL", (e as Error).message, { exitCode: 2 });
  }

  log(`re-publishing ${detail.findings.length} finding(s) from ${runDir}`);
  const record = await publishWithRecord({
    prNum: input.prNum,
    prInfoJson,
    diff,
    findings: detail.findings,
    ghTarget: { user: repoConfig.ghUser, host: repoConfig.ghHost },
    ghEnv,
    cwd: input.repoRoot,
    log,
  });
  try {
    writePublishRecord(runDir, record);
  } catch (e) {
    log(`failed to write publish.json: ${(e as Error).message}`);
  }
  // Keep the session row's compact publish summary in step with the retry so
  // forge status / the Workbench review list reflect the new outcome.
  try {
    store.db.db
      .prepare("UPDATE sessions SET metrics = json_set(COALESCE(metrics, '{}'), '$.publish', json(?)) WHERE id = ?")
      .run(
        JSON.stringify({ state: record.state, posted: record.posted, failed: record.failed, error: record.error }),
        input.sessionId,
      );
  } catch {
    /* advisory — publish.json in the run dir is the authority */
  }
  return { runDir, record };
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
  // Also persist structured findings beside the out file — this is what
  // lights up the launch bucket of findLatestForgeFindings (review-bundle
  // display, comment-fix by finding id, publish). Best-effort: a findings
  // write failure must not break the runner's verdict contract.
  try {
    const findings = parseForgeReviewFindings(block);
    fs.writeFileSync(
      path.join(path.dirname(outFile), "findings.json"),
      `${JSON.stringify(findings, null, 2)}\n`,
      "utf-8",
    );
  } catch (e) {
    process.stderr.write(`warning: could not write findings.json: ${(e as Error).message}\n`);
  }
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

/**
 * Resolve the PR's owner/repo + host + head commit from the `gh pr view` JSON
 * and publish the findings, returning a persistent-shape PublishRecord. Never
 * throws — every failure path comes back as a record the caller writes to
 * publish.json.
 *
 * Stale-head guard: the reviewer typically runs for minutes, so the head may
 * have moved since the diff was fetched. Re-fetch the head oid immediately
 * before publishing; if it moved, re-fetch the diff so anchors are computed
 * against the commit actually named in the POST (stale anchors 422 the review
 * or land as immediately-outdated comments).
 */
async function publishWithRecord(args: {
  prNum: number;
  prInfoJson: string;
  diff: string;
  findings: ForgeFinding[];
  ghTarget: { user?: string; host?: string };
  ghEnv: Record<string, string>;
  cwd: string;
  log: (msg: string) => void;
}): Promise<PublishRecord> {
  const base: PublishRecord = { ...notRequestedRecord(), requested: true, attemptedAt: new Date().toISOString() };
  if (args.findings.length === 0) {
    return { ...base, state: "nothing-new" };
  }
  try {
    let url = "";
    let headRefOid = "";
    try {
      const parsed = JSON.parse(args.prInfoJson) as { url?: string; headRefOid?: string };
      url = parsed.url ?? "";
      headRefOid = parsed.headRefOid ?? "";
    } catch {
      /* fall through — resolvePrApiTarget can re-fetch the url */
    }

    let diff = args.diff;
    let headMoved = false;
    const freshJson = runGhSoft(
      ["pr", "view", String(args.prNum), "--json", "url,headRefOid"],
      args.ghEnv,
      args.cwd,
      args.log,
    );
    try {
      const fresh = JSON.parse(freshJson) as { url?: string; headRefOid?: string };
      const freshOid = fresh.headRefOid ?? "";
      if (freshOid && headRefOid && freshOid !== headRefOid) {
        headMoved = true;
        args.log(
          `[publish] head moved ${headRefOid.slice(0, 7)} → ${freshOid.slice(0, 7)} during review — re-fetching diff`,
        );
        diff = runGhHard(["pr", "diff", String(args.prNum)], args.ghEnv, args.cwd);
        headRefOid = freshOid;
      }
      if (!url && fresh.url) url = fresh.url;
    } catch {
      /* re-fetch failed — publish against the review-time head */
    }

    const owned = url ? parseNameWithOwner(url) : null;
    const result: PublishResult = await publishReviewFindings(
      args.prNum,
      { findings: args.findings, diff, commitId: headRefOid },
      {
        cwd: args.cwd,
        ghTarget: args.ghTarget,
        ownerRepo: owned ? `${owned.owner}/${owned.repo}` : undefined,
        apiHost: url ? parseApiHost(url) : null,
      },
      args.log,
    );
    return {
      ...base,
      state: result.state,
      posted: result.posted,
      outOfDiff: result.outOfDiff,
      skipped: result.skipped,
      failed: result.failed,
      error: result.error,
      findings: result.findings,
      ...(headMoved ? { headMoved: true } : {}),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    args.log(`publish to GitHub failed: ${msg}`);
    return { ...base, state: "failed", failed: args.findings.length, error: msg };
  }
}

function runGhSoft(args: string[], env: Record<string, string>, cwd: string, log: (msg: string) => void): string {
  try {
    return ghExec(args, env, cwd);
  } catch (e) {
    log(`gh ${args.join(" ")} failed: ${ghFailureDetail(e)}`);
    return "";
  }
}

function runGhHard(args: string[], env: Record<string, string>, cwd: string): string {
  try {
    return ghExec(args, env, cwd);
  } catch (e) {
    throw new Error(`gh ${args.join(" ")} failed: ${ghFailureDetail(e)} — verify gh auth/network for this repo's host`);
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
  /** Publish outcome from publish.json; null for pre-publish-record runs. */
  publish: PublishRecord | null;
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
  /** Publish outcome from publish.json; null for pre-publish-record runs. */
  publish: PublishRecord | null;
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
      publish: readPublishRecord(runDir),
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
    publish: readPublishRecord(runDir),
  };
}

// ─── findings lookup helpers (used by the review-bundle route) ───────────────

export interface FindingsLookupResult {
  findings: ForgeFinding[];
  source: "adhoc" | "launch" | null;
  /** Absolute path of the findings.json that won; null when none found. */
  path: string | null;
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

  // 1) ad-hoc — run dirs are keyed by PR number only, and PR numbers collide
  // across repos sharing one FORGE_HOME, so each candidate must prove via its
  // meta.json that it belongs to THIS repo (fail closed: prepareReviewSession
  // seeds repoRoot before the reviewer runs, so a dir that produced a
  // findings.json always has it).
  const prReviewDir = path.join(store.runsDir, "pr-review");
  try {
    if (fs.existsSync(prReviewDir)) {
      const entries = fs.readdirSync(prReviewDir, { withFileTypes: true });
      const prefix = `${prNum}-`;
      for (const ent of entries) {
        if (!ent.isDirectory() || !ent.name.startsWith(prefix)) continue;
        const meta = readMetaSafe(path.join(prReviewDir, ent.name, "meta.json"));
        if (meta?.repoRoot !== repoRoot) continue;
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

  if (candidates.length === 0) return { findings: [], source: null, path: null };

  // Newest wins. On equal mtime, ad-hoc wins (per spec: "per-PR ad-hoc
  // review wins, more recent intent").
  candidates.sort((a, b) => {
    if (b.mtime !== a.mtime) return b.mtime - a.mtime;
    return a.source === "adhoc" ? -1 : 1;
  });
  const pick = candidates[0];
  try {
    const findings = JSON.parse(fs.readFileSync(pick.path, "utf-8")) as ForgeFinding[];
    if (!Array.isArray(findings)) return { findings: [], source: null, path: null };
    return { findings, source: pick.source, path: pick.path };
  } catch {
    return { findings: [], source: null, path: null };
  }
}
