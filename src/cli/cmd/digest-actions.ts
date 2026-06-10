/**
 * PR digest orchestrator — backs `GET/POST /api/prs/:num/digest`.
 *
 * Structural clone of review-actions.ts (the parent/worker split is proven;
 * deliberately not abstracted into a shared harness yet):
 *   - runPrDigest() runs in the HTTP-handler thread: validates, mints a
 *     session id, creates the run dir, inserts the sessions row
 *     (purpose='digest'), spawns `forge __digest-worker <sessionId>`.
 *   - runDigestWorker() runs detached: fetches PR info + diff + linked spec,
 *     invokes the configured reviewer agent with the digest prompt, extracts
 *     the ```forge-digest block to digest.md, finalizes the session.
 *
 * The digest is cached by head SHA: meta.json records `headSha`, and
 * loadLatestDigest() returns the newest completed run so the UI can compare
 * against the bundle's current headRefOid and offer "Regenerate" when stale.
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { CliError } from "../../cli/output.ts";
import { adapterStreamsTokens, agentJobCommand, captureSidecarMetrics } from "../../core/agents/index.ts";
import { finalizeSession, type SessionMetrics, upsertSession } from "../../core/db/writes.ts";
import { buildDigestPrompt, extractForgeDigestBlock } from "../../core/digest.ts";
import { resolveGhEnv } from "../../core/gh.ts";
import { reapStaleWorkerSessions } from "../../core/session-reaper.ts";
import type { ForgeStore } from "../../core/store.ts";

const PR_VIEW_FIELDS = "number,title,body,headRefName,baseRefName,additions,deletions,changedFiles,url,headRefOid";
const SCHEMA_VERSION = 1;
const DEFAULT_DIGEST_TIMEOUT_MINUTES = 20;

export interface RunPrDigestInput {
  prNum: number;
  repoRoot: string;
  repoName: string;
}

export interface RunPrDigestResult {
  sessionId: string;
  logStreamUrl: string;
  runDir: string;
}

export interface PrDigestView {
  sessionId: string;
  headSha: string | null;
  generatedAt: string;
  agent: string;
  model: string | null;
  markdown: string;
}

interface DigestMeta {
  schemaVersion: number;
  repoRoot: string;
  repoName: string;
  prNum: number;
  headRefName: string | null;
  headSha: string | null;
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  status: "running" | "completed" | "failed";
  exitCode: number | null;
}

function mintSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `s-digest-pr-${ts}-${rand}`;
}

function digestRunDir(store: ForgeStore, prNum: number, sessionId: string): string {
  return path.join(store.runsDir, "pr-digest", `${prNum}-${sessionId}`);
}

// Same sentinel format the review worker emits — the SSE log serializer's
// `done` detection (parseAdHocReviewSentinel) works on digest logs unchanged.
function digestSentinelLine(exitCode: number, error: string | null): string {
  const payload = JSON.stringify({ exitCode, error });
  return `[forge:session-done ${payload}]`;
}

// ─── Test seams (mirrors __setReviewExecHooks) ───────────────────────────────

export interface DigestExecHooks {
  /** Synchronous `gh <args>` — throws on non-zero exit (execFileSync shape). */
  ghExec: (args: string[], env: Record<string, string>, cwd: string) => string;
  /** Run the digest agent command line; throws on failure or timeout. */
  agentExec: (args: {
    bashLine: string;
    rawFile: string;
    streamFile: string;
    env: Record<string, string>;
    cwd: string;
    timeoutMs: number;
  }) => void;
  /** Spawn the detached digest worker; returns its pid. */
  spawnWorker: (args: { cmd: string[]; logFd: number; cwd: string; env: Record<string, string> }) => {
    pid: number | undefined;
    unref: () => void;
  };
}

let execHooks: Partial<DigestExecHooks> | null = null;
export function __setDigestExecHooks(hooks: Partial<DigestExecHooks> | null): void {
  execHooks = hooks;
}

function ghExec(args: string[], env: Record<string, string>, cwd: string): string {
  const fn =
    execHooks?.ghExec ??
    ((a: string[], e: Record<string, string>, c: string) =>
      execFileSync("gh", a, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], cwd: c, env: e }));
  return fn(args, env, cwd);
}

function agentExecDefault(args: {
  bashLine: string;
  rawFile: string;
  streamFile: string;
  env: Record<string, string>;
  cwd: string;
  timeoutMs: number;
}): void {
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

// ─── Parent: runPrDigest ─────────────────────────────────────────────────────

export async function runPrDigest(input: RunPrDigestInput, store: ForgeStore): Promise<RunPrDigestResult> {
  const { prNum, repoRoot, repoName } = input;

  // The digest reuses the reviewer agent/model config — it is review-adjacent
  // and a separate config pair would just bitrot.
  const repoConfig = store.getRepoConfig(repoRoot);
  if (!repoConfig.reviewerAgent || !repoConfig.reviewerModel) {
    throw new CliError("REVIEWER_NOT_CONFIGURED", `Reviewer agent or model is not configured for repo ${repoName}.`, {
      hint: "Set reviewerAgent and reviewerModel via the repo settings or `forge config set`.",
      exitCode: 3,
    });
  }

  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  if (ghEnvResult.error) {
    throw new CliError("GH_AUTH", ghEnvResult.error, { exitCode: 2 });
  }
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  // PR existence check; also captures head SHA (the digest cache key) and
  // branch (for the linked-spec lookup in the worker).
  let headRefName: string | null = null;
  let headSha: string | null = null;
  try {
    const prInfoJson = ghExec(["pr", "view", String(prNum), "--json", PR_VIEW_FIELDS], ghEnv, repoRoot).trim();
    try {
      const parsed = JSON.parse(prInfoJson) as { headRefName?: string; headRefOid?: string };
      headRefName = parsed.headRefName ?? null;
      headSha = parsed.headRefOid ?? null;
    } catch {
      /* worker will surface non-JSON pr view */
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

  // Single-flight per (repoRoot, prNum). Reap first so a dead worker's stale
  // 'running' row can't 409-block digests forever.
  reapStaleWorkerSessions(store);
  const inFlight = store.db.db
    .prepare(
      `SELECT id FROM sessions
        WHERE purpose = 'digest'
          AND state = 'running'
          AND json_extract(metrics, '$.prNum') = ?
          AND json_extract(metrics, '$.repoRoot') = ?
        LIMIT 1`,
    )
    .get(prNum, repoRoot) as { id: string } | undefined;
  if (inFlight) {
    throw new CliError(
      "DIGEST_IN_FLIGHT",
      `A digest is already running for PR #${prNum} in ${repoName} (session ${inFlight.id}).`,
      { exitCode: 1 },
    );
  }

  const sessionId = mintSessionId();
  const runDir = digestRunDir(store, prNum, sessionId);
  fs.mkdirSync(runDir, { recursive: true });
  const logFile = path.join(runDir, "agent.log");
  fs.writeFileSync(logFile, "", { flag: "a" });

  const startedAt = new Date().toISOString();
  const seedMeta: DigestMeta = {
    schemaVersion: SCHEMA_VERSION,
    repoRoot,
    repoName,
    prNum,
    headRefName,
    headSha,
    sessionId,
    startedAt,
    completedAt: null,
    status: "running",
    exitCode: null,
  };
  fs.writeFileSync(path.join(runDir, "meta.json"), `${JSON.stringify(seedMeta, null, 2)}\n`, "utf-8");

  upsertSession(store.db.db, {
    id: sessionId,
    purpose: "digest",
    relatedId: null,
    agentAdapter: repoConfig.reviewerAgent,
    model: repoConfig.reviewerModel,
    startedAt,
    cwd: repoRoot,
    state: "running",
    metrics: {
      ...({ logFile, runDir, prNum, repoRoot, headSha } as unknown as Partial<SessionMetrics>),
    },
  });

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
      cmd: [bunPath, scriptPath, "__digest-worker", sessionId],
      logFd,
      cwd: repoRoot,
      env: ghEnv,
    });
    proc.unref();
    if (typeof proc.pid === "number") {
      store.db.db
        .prepare("UPDATE sessions SET pid = ?, metrics = json_set(metrics, '$.pid', ?) WHERE id = ?")
        .run(proc.pid, proc.pid, sessionId);
    }
  } catch (e) {
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
      error: `failed to spawn digest worker: ${msg}`,
    });
    throw new CliError("WORKER_SPAWN_FAILED", `failed to spawn digest worker: ${msg}`, { exitCode: 3 });
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

// ─── Child: forge __digest-worker <sessionId> ────────────────────────────────

export async function runDigestWorker(argv: string[], store: ForgeStore): Promise<void> {
  const sessionId = argv[0];
  if (!sessionId) {
    process.stdout.write("[forge:digest-worker] missing sessionId argument\n");
    process.stdout.write(`${digestSentinelLine(-1, "missing sessionId")}\n`);
    process.exit(1);
  }

  const row = store.db.db
    .prepare("SELECT id, agent_adapter, model, metrics FROM sessions WHERE id = ?")
    .get(sessionId) as { id: string; agent_adapter: string; model: string | null; metrics: string | null } | undefined;
  if (!row) {
    process.stdout.write(`[forge:digest-worker] no session row for ${sessionId}\n`);
    process.stdout.write(`${digestSentinelLine(-1, "missing session row")}\n`);
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

  const fail = (err: string): never => {
    finalizeSession(store.db.db, {
      id: sessionId,
      finishedAt: new Date().toISOString(),
      state: "failed",
      exitCode: -1,
      error: err,
    });
    process.stdout.write(`[forge:digest-worker] ${err}\n`);
    process.stdout.write(`${digestSentinelLine(-1, err)}\n`);
    process.exit(1);
  };

  if (!runDir || prNum == null || !repoRoot) {
    fail("session row missing runDir/prNum/repoRoot in metrics");
  }
  const okRunDir = runDir as string;
  const okPrNum = prNum as number;
  const okRepoRoot = repoRoot as string;

  const metaPath = path.join(okRunDir, "meta.json");
  let seedMeta: Record<string, unknown> | null = null;
  try {
    seedMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as Record<string, unknown>;
  } catch {
    seedMeta = null;
  }
  const repoName = (seedMeta?.repoName as string | undefined) ?? path.basename(okRepoRoot);
  const headRefName = (seedMeta?.headRefName as string | null | undefined) ?? null;
  const headSha = (seedMeta?.headSha as string | null | undefined) ?? null;

  const log = (msg: string) => process.stdout.write(`[forge:digest-worker] ${msg}\n`);
  log(`starting digest of PR #${okPrNum} in ${repoName}`);
  log(`agent=${row.agent_adapter} model=${row.model ?? "(unset)"}`);

  const { exitCode, error, metricsPatch } = await executeDigest({
    store,
    runDir: okRunDir,
    prNum: okPrNum,
    repoRoot: okRepoRoot,
    repoName,
    headRefName,
    agentAdapter: row.agent_adapter,
    model: row.model,
    log,
  });

  const completedAt = new Date().toISOString();
  const status = exitCode === 0 ? "completed" : "failed";
  try {
    fs.writeFileSync(
      metaPath,
      `${JSON.stringify(
        {
          schemaVersion: SCHEMA_VERSION,
          repoRoot: okRepoRoot,
          repoName,
          prNum: okPrNum,
          headRefName,
          headSha,
          sessionId,
          startedAt: (seedMeta?.startedAt as string | undefined) ?? completedAt,
          completedAt,
          status,
          exitCode,
        },
        null,
        2,
      )}\n`,
      "utf-8",
    );
  } catch {
    /* meta is advisory — the session row is the authority */
  }

  finalizeSession(store.db.db, {
    id: sessionId,
    finishedAt: completedAt,
    state: status,
    exitCode,
    error,
    metrics: metricsPatch,
  });

  process.stdout.write(`${digestSentinelLine(exitCode, error)}\n`);
  process.exit(exitCode);
}

// ─── executeDigest — the digest pipeline (worker body, testable in-process) ──

export interface ExecuteDigestOpts {
  store: ForgeStore;
  runDir: string;
  prNum: number;
  repoRoot: string;
  repoName: string;
  headRefName: string | null;
  agentAdapter: string;
  model: string | null;
  log: (msg: string) => void;
}

export interface ExecuteDigestResult {
  exitCode: number;
  error: string | null;
  metricsPatch: Partial<SessionMetrics>;
}

export async function executeDigest(opts: ExecuteDigestOpts): Promise<ExecuteDigestResult> {
  const { store, runDir, prNum, repoRoot, repoName, headRefName, log } = opts;
  const repoConfig = store.getRepoConfig(repoRoot);
  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  let exitCode = 0;
  let error: string | null = null;
  let metricsPatch: Partial<SessionMetrics> = {};

  try {
    const prInfoJson = ghExec(["pr", "view", String(prNum), "--json", PR_VIEW_FIELDS], ghEnv, repoRoot).trim();
    const diff = ghExec(["pr", "diff", String(prNum)], ghEnv, repoRoot);

    // Linked Forge spec lookup by branch — best-effort, same as the reviewer.
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

    const prompt = buildDigestPrompt({ prNum, repoName, prInfoJson, diff, linkedSpec });
    const promptFile = path.join(runDir, "digest-prompt.txt");
    fs.writeFileSync(promptFile, prompt, "utf-8");

    const adapter = opts.agentAdapter as Parameters<typeof agentJobCommand>[0];
    const streamFile = path.join(runDir, "digest.stream.jsonl");
    const cmd = agentJobCommand(adapter, opts.model ?? "", promptFile, streamFile, {
      reasoningEffort: repoConfig.reviewerReasoningEffort,
    });

    const timeoutMs = DEFAULT_DIGEST_TIMEOUT_MINUTES * 60_000;
    log("invoking digest agent");
    const rawFile = path.join(runDir, "digest-raw.md");
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
      if (adapterStreamsTokens(adapter) && fs.existsSync(streamFile)) {
        metricsPatch = await captureSidecarMetrics(adapter, opts.model, streamFile);
      }
      const err = e as { status?: number; message?: string; code?: string };
      if (err.code === "ETIMEDOUT" || Date.now() - agentStartedMs >= timeoutMs) {
        throw new Error(`digest agent timed out after ${DEFAULT_DIGEST_TIMEOUT_MINUTES} minutes`);
      }
      throw new Error(`digest agent exited non-zero (${err.status ?? "?"}): ${err.message ?? "no detail"}`);
    }

    if (adapterStreamsTokens(adapter)) {
      metricsPatch = await captureSidecarMetrics(adapter, opts.model, streamFile);
    }

    const raw = fs.existsSync(rawFile) ? fs.readFileSync(rawFile, "utf-8") : "";
    const block = extractForgeDigestBlock(raw);
    if (!block) {
      throw new Error("no fenced forge-digest block in agent output");
    }
    fs.writeFileSync(path.join(runDir, "digest.md"), block, "utf-8");
    log("digest written");
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    exitCode = 1;
    log(`error: ${error}`);
  }

  return { exitCode, error, metricsPatch };
}

// ─── loadLatestDigest — read side for GET /api/prs/:num/digest ───────────────

interface DigestSessionRow {
  id: string;
  agent_adapter: string;
  model: string | null;
  finished_at: string | null;
  metrics: string | null;
}

/**
 * Newest completed digest for (prNum, repoRoot), or null. Pure disk/DB read —
 * no gh calls — so the review page can load it alongside the bundle for free.
 */
export function loadLatestDigest(store: ForgeStore, prNum: number, repoRoot: string): PrDigestView | null {
  const rows = store.db.db
    .prepare(
      `SELECT id, agent_adapter, model, finished_at, metrics
         FROM sessions
        WHERE purpose = 'digest'
          AND state = 'completed'
          AND json_extract(metrics, '$.prNum') = ?
          AND json_extract(metrics, '$.repoRoot') = ?
        ORDER BY finished_at DESC`,
    )
    .all(prNum, repoRoot) as DigestSessionRow[];

  for (const row of rows) {
    let metrics: Record<string, unknown> = {};
    try {
      metrics = JSON.parse(row.metrics ?? "{}");
    } catch {
      metrics = {};
    }
    const runDir = typeof metrics.runDir === "string" ? metrics.runDir : digestRunDir(store, prNum, row.id);
    const digestPath = path.join(runDir, "digest.md");
    let markdown: string;
    try {
      markdown = fs.readFileSync(digestPath, "utf-8");
    } catch {
      continue; // artifacts swept — fall through to an older run
    }
    // headSha may have been refreshed by the worker's meta; prefer meta.json.
    let headSha = typeof metrics.headSha === "string" ? metrics.headSha : null;
    try {
      const meta = JSON.parse(fs.readFileSync(path.join(runDir, "meta.json"), "utf-8")) as { headSha?: unknown };
      if (typeof meta.headSha === "string") headSha = meta.headSha;
    } catch {
      /* advisory */
    }
    return {
      sessionId: row.id,
      headSha,
      generatedAt: row.finished_at ?? "",
      agent: row.agent_adapter,
      model: row.model,
      markdown,
    };
  }
  return null;
}
