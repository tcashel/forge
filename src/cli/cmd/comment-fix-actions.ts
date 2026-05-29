/**
 * Comment-fix orchestrator — backs `POST /api/prs/:num/fix-comments`.
 *
 * Sibling to `review-actions.ts`. Structure mirrors it intentionally:
 *
 *   - runCommentFix() runs in the HTTP-handler thread. It validates the
 *     request, checks the worktree, mints a session id, creates the run
 *     dir, pre-opens the log, inserts the `sessions` row, and spawns the
 *     detached worker.
 *   - runCommentFixWorker() runs as `forge __comment-fix-worker <sessionId>`.
 *     It composes the validate-then-fix prompt, invokes the configured
 *     reviewer agent adapter, parses the validation block, runs quality
 *     gates, and either commits + pushes the fixes or rolls them back.
 *
 * Coordination is the same as the reviewer: session row + on-disk
 * artifacts (`comment-fix-prompt.txt`, `validation.json`, `fix-raw.md`,
 * `quality.jsonl`, `meta.json`) plus a sentinel line the SSE drawer
 * tails.
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { CliError } from "../../cli/output.ts";
import { finalizeSession, upsertSession } from "../../core/db/writes.ts";
import {
  type FixTarget,
  type FixTargetSource,
  isFixTargetSource,
  parseTargetKey,
  targetKey,
} from "../../core/fix-targets.ts";
import { resolveGhEnv } from "../../core/gh.ts";
import { fetchPrBundle } from "../../core/gh-pr.ts";
import { agentCommand } from "../../core/launch.ts";
import { detectRepo } from "../../core/repo.ts";
import { type CommentValidationEntry, type ForgeFinding, parseCommentValidation } from "../../core/reviewer.ts";
import type { ForgeStore } from "../../core/store.ts";
import { ensureWorktreeForBranch } from "../../core/worktrees.ts";
import { findLatestForgeFindings } from "./review-actions.ts";

const SCHEMA_VERSION = 1;
const COMMENT_VIEW_FIELDS = "headRefName";
const DIFF_BUDGET = 60_000;

export type CommentFixStatus = "fixed" | "disputed" | "failed";

export interface CommentFixStateEntry {
  status: CommentFixStatus;
  reason?: string;
}

export type CommentFixState = Record<string, CommentFixStateEntry>;

export interface ValidationFileEntry extends CommentValidationEntry {
  /**
   * Post-quality status. `valid` rows whose quality gate passed end up
   * `fixed`; rows whose quality gate failed end up `failed`. `disputed`
   * rows stay `disputed`.
   */
  status: CommentFixStatus;
}

/** Legacy on-disk validation entry (pre-token): keyed by numeric commentId. */
interface LegacyValidationFileEntry {
  commentId?: number;
  targetId?: string;
  status?: CommentFixStatus;
  reason?: string;
}

/**
 * A fix target resolved against the current PR + worktree, ready to hand to
 * the agent. `comment`/`finding` carry a line anchor + surrounding hunk;
 * `review` summaries are PR-wide (no path/line/hunk).
 */
interface EnrichedTarget {
  token: string;
  source: FixTargetSource;
  /** Human-readable kind label for the prompt (e.g. "inline comment"). */
  kind: string;
  path: string | null;
  line: number | null;
  body: string;
  commitId: string;
  currentHunk: string | null;
}

export interface RunCommentFixInput {
  prNum: number;
  repoRoot: string;
  repoName: string;
  targets: FixTarget[];
}

export interface RunCommentFixResult {
  sessionId: string;
  logStreamUrl: string;
  runDir: string;
}

interface CommentFixMeta {
  schemaVersion: number;
  repoRoot: string;
  repoName: string;
  prNum: number;
  headRefName: string | null;
  worktreePath: string;
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  status: "running" | "completed" | "failed";
  exitCode: number | null;
  targets: FixTarget[];
  quality: { ok: boolean; failedCommand: string | null } | null;
}

function commentFixerSkillsDir(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "skills", "forge-comment-fixer");
}

function mintSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `s-comment-fix-pr-${ts}-${rand}`;
}

function commentFixRunDir(store: ForgeStore, prNum: number, sessionId: string): string {
  return path.join(store.runsDir, "pr-comment-fix", `${prNum}-${sessionId}`);
}

function commentFixSentinelLine(exitCode: number, error: string | null): string {
  return `[forge:session-done ${JSON.stringify({ exitCode, error })}]`;
}

/** Normalize + dedupe a raw target list (by `source:id` token, first wins). */
function dedupeTargets(targets: unknown[]): FixTarget[] {
  const seen = new Set<string>();
  const out: FixTarget[] = [];
  for (const raw of targets) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    if (!isFixTargetSource(o.source)) continue;
    const id = String(o.id ?? "").trim();
    if (!id) continue;
    const key = targetKey(o.source, id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ source: o.source, id });
  }
  return out;
}

/** Compose a fix-able body for a Forge finding from its structured fields. */
function composeFindingBody(f: ForgeFinding): string {
  const parts: string[] = [`[${f.severity}] ${f.title}`];
  if (f.why?.trim()) parts.push(`\nWhy: ${f.why.trim()}`);
  if (f.fix?.trim()) parts.push(`\nSuggested fix: ${f.fix.trim()}`);
  if (f.evidence?.trim()) parts.push(`\nEvidence:\n${f.evidence.trim()}`);
  return parts.join("\n");
}

/** Human summary like "2 comments, 1 finding" for logs + commit messages. */
function summarizeTargets(targets: FixTarget[]): string {
  const counts: Record<FixTargetSource, number> = { finding: 0, comment: 0, review: 0 };
  for (const t of targets) counts[t.source]++;
  const label: Record<FixTargetSource, [string, string]> = {
    comment: ["comment", "comments"],
    finding: ["finding", "findings"],
    review: ["review", "reviews"],
  };
  const segs: string[] = [];
  for (const src of ["comment", "finding", "review"] as FixTargetSource[]) {
    const n = counts[src];
    if (n > 0) segs.push(`${n} ${label[src][n === 1 ? 0 : 1]}`);
  }
  return segs.length > 0 ? segs.join(", ") : "0 targets";
}

// ─── Parent: runCommentFix ───────────────────────────────────────────────────

export async function runCommentFix(input: RunCommentFixInput, store: ForgeStore): Promise<RunCommentFixResult> {
  const { prNum, repoRoot, repoName, targets } = input;

  if (!Array.isArray(targets) || targets.length === 0) {
    throw new CliError("NO_COMMENTS", "`targets` must contain at least one fix target.", { exitCode: 1 });
  }
  const uniqueTargets = dedupeTargets(targets);
  if (uniqueTargets.length === 0) {
    throw new CliError("NO_COMMENTS", "`targets` contained no valid fix targets.", { exitCode: 1 });
  }

  // 1) repoConfig — reuse the reviewer's configured agent.
  const repoConfig = store.getRepoConfig(repoRoot);
  if (!repoConfig.reviewerAgent || !repoConfig.reviewerModel) {
    throw new CliError("REVIEWER_NOT_CONFIGURED", `Reviewer agent or model is not configured for repo ${repoName}.`, {
      hint: "Set reviewerAgent and reviewerModel via the repo settings.",
      exitCode: 3,
    });
  }

  // 2) gh env.
  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  if (ghEnvResult.error) {
    throw new CliError("GH_AUTH", ghEnvResult.error, { exitCode: 2 });
  }
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  // 3) PR must exist.
  let headRefName: string | null = null;
  try {
    const out = execFileSync("gh", ["pr", "view", String(prNum), "--json", COMMENT_VIEW_FIELDS], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd: repoRoot,
      env: ghEnv,
    }).trim();
    try {
      const parsed = JSON.parse(out) as { headRefName?: string };
      headRefName = parsed.headRefName ?? null;
    } catch {
      /* worker surfaces non-JSON later */
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

  // 4) Resolve worktree. A live, on-branch, clean worktree fails fast on
  //    dirty/wrong-branch (those are recoverable, surface 409 immediately).
  //    A missing worktree defers rehydration to the worker so the HTTP
  //    response returns sessionId first and the Workbench can stream
  //    rehydration progress via the existing log channel.
  const recordedPath = resolveWorktreePathForPr(store, repoRoot, prNum);
  const liveWorktreePath =
    recordedPath && fs.existsSync(recordedPath) && isLiveWorktree(recordedPath) ? recordedPath : null;
  const needsRehydrate = liveWorktreePath === null;

  if (needsRehydrate && !headRefName) {
    throw new CliError("NO_WORKTREE", `PR #${prNum} has no head branch to rehydrate from.`, {
      hint: "The PR head branch may no longer exist on the remote.",
      exitCode: 1,
    });
  }

  if (liveWorktreePath) {
    // 5) Worktree must be on the PR head branch.
    if (headRefName) {
      let currentBranch = "";
      try {
        currentBranch = execFileSync("git", ["-C", liveWorktreePath, "branch", "--show-current"], {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new CliError("WORKTREE_BRANCH_MISMATCH", `Could not read worktree branch: ${msg}`, { exitCode: 1 });
      }
      if (currentBranch !== headRefName) {
        throw new CliError(
          "WORKTREE_BRANCH_MISMATCH",
          `Worktree branch "${currentBranch}" does not match PR head "${headRefName}".`,
          { exitCode: 1 },
        );
      }
    }

    // 6) Worktree must be clean.
    let dirty = "";
    try {
      dirty = execFileSync("git", ["-C", liveWorktreePath, "status", "--porcelain"], {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new CliError("WORKTREE_DIRTY", `git status failed in worktree: ${msg}`, { exitCode: 1 });
    }
    if (dirty.trim().length > 0) {
      throw new CliError(
        "WORKTREE_DIRTY",
        `Worktree ${liveWorktreePath} has uncommitted changes — commit or stash first.`,
        { exitCode: 1 },
      );
    }
  }

  // 7) Match each target against what's actually fixable on the PR:
  //    - comment → a still-anchored inline comment
  //    - review  → a submitted review summary
  //    - finding → a Forge finding (by id) that names a file
  //    (The worktree clean check ran above, guarded by `liveWorktreePath`;
  //    when rehydrating there's no live worktree to check yet.)
  const bundle = await fetchPrBundle(prNum, {
    cwd: repoRoot,
    ghTarget: { user: repoConfig.ghUser, host: repoConfig.ghHost },
  });
  if (!bundle.ok) {
    throw new CliError("PR_NOT_FOUND", `Could not load PR bundle: ${bundle.error}`, { exitCode: 1 });
  }
  const anchoredCommentIds = new Set(
    bundle.bundle.inlineComments.filter((c) => c.position != null || c.line != null).map((c) => c.id),
  );
  const reviewIds = new Set(bundle.bundle.prReviews.map((r) => r.id));
  const findingIds = new Set(
    findLatestForgeFindings(store, prNum, repoRoot, headRefName)
      .findings.filter((f) => f.file)
      .map((f) => f.id),
  );
  const fixableTargets = uniqueTargets.filter((t) => {
    if (t.source === "comment") return anchoredCommentIds.has(Number(t.id));
    if (t.source === "review") return reviewIds.has(Number(t.id));
    if (t.source === "finding") return findingIds.has(t.id);
    return false;
  });
  if (fixableTargets.length === 0) {
    throw new CliError(
      "NO_COMMENTS",
      "None of the supplied targets match a fixable Forge finding, anchored inline comment, or review summary on this PR.",
      { exitCode: 1 },
    );
  }

  // 8) Single-flight.
  const inFlight = store.db.db
    .prepare(
      `SELECT id FROM sessions
        WHERE purpose = 'comment-fix'
          AND state = 'running'
          AND json_extract(metrics, '$.prNum') = ?
          AND json_extract(metrics, '$.repoRoot') = ?
        LIMIT 1`,
    )
    .get(prNum, repoRoot) as { id: string } | undefined;
  if (inFlight) {
    throw new CliError(
      "FIX_IN_FLIGHT",
      `A comment-fix is already running for PR #${prNum} in ${repoName} (session ${inFlight.id}).`,
      { exitCode: 1 },
    );
  }

  // 9) Mint id, create run dir, pre-open log.
  const sessionId = mintSessionId();
  const runDir = commentFixRunDir(store, prNum, sessionId);
  fs.mkdirSync(runDir, { recursive: true });
  const logFile = path.join(runDir, "agent.log");
  fs.writeFileSync(logFile, "", { flag: "a" });

  const startedAt = new Date().toISOString();
  // When a rehydrate is needed, the worktree path won't be known until the
  // worker has fetched the branch + created the worktree. Seed with the
  // recorded path (may be a stale absolute) so the meta file is still
  // structurally valid; the worker rewrites worktreePath after rehydrate.
  const seedWorktreePath = liveWorktreePath ?? recordedPath ?? "";
  const seedMeta: CommentFixMeta = {
    schemaVersion: SCHEMA_VERSION,
    repoRoot,
    repoName,
    prNum,
    headRefName,
    worktreePath: seedWorktreePath,
    sessionId,
    startedAt,
    completedAt: null,
    status: "running",
    exitCode: null,
    targets: fixableTargets,
    quality: null,
  };
  fs.writeFileSync(path.join(runDir, "meta.json"), `${JSON.stringify(seedMeta, null, 2)}\n`, "utf-8");

  // 10) Insert the session row. cwd is set to the recorded/live path when
  // available; the worker updates it post-rehydrate when needed.
  upsertSession(store.db.db, {
    id: sessionId,
    purpose: "comment-fix",
    relatedId: null,
    agentAdapter: repoConfig.reviewerAgent,
    model: repoConfig.reviewerModel,
    startedAt,
    cwd: seedWorktreePath || repoRoot,
    state: "running",
    metrics: {
      ...({
        logFile,
        runDir,
        prNum,
        repoRoot,
        worktreePath: seedWorktreePath,
        targets: fixableTargets,
        needsRehydrate,
        headRefName,
      } as unknown as Partial<import("../../core/db/writes.ts").SessionMetrics>),
    },
  });

  // 11) Spawn the detached worker. cwd defaults to repoRoot when we need
  //     to rehydrate (the rehydrate primitive runs `git -C <repoRoot> ...`).
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
    const spawnCwd = liveWorktreePath ?? repoRoot;
    const proc = Bun.spawn({
      cmd: [bunPath, scriptPath, "__comment-fix-worker", sessionId],
      stdio: ["ignore", logFd, logFd],
      cwd: spawnCwd,
      env: ghEnv,
    });
    proc.unref();
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
      error: `failed to spawn comment-fix worker: ${msg}`,
    });
    throw new CliError("WORKER_SPAWN_FAILED", `failed to spawn comment-fix worker: ${msg}`, { exitCode: 3 });
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

// ─── Child: forge __comment-fix-worker <sessionId> ───────────────────────────

/**
 * Detached worker entry. Argv: <sessionId>. Never throws past this
 * function — every error path finalizes the session and writes the
 * sentinel line.
 */
export async function runCommentFixWorker(argv: string[], store: ForgeStore): Promise<void> {
  const sessionId = argv[0];
  if (!sessionId) {
    process.stdout.write("[forge:comment-fix-worker] missing sessionId argument\n");
    process.stdout.write(`${commentFixSentinelLine(-1, "missing sessionId")}\n`);
    process.exit(1);
  }

  const row = store.db.db
    .prepare("SELECT id, agent_adapter, model, metrics FROM sessions WHERE id = ?")
    .get(sessionId) as { id: string; agent_adapter: string; model: string | null; metrics: string | null } | undefined;
  if (!row) {
    process.stdout.write(`[forge:comment-fix-worker] no session row for ${sessionId}\n`);
    process.stdout.write(`${commentFixSentinelLine(-1, "missing session row")}\n`);
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
  // worktreePath is mutable: when rehydrating it's seeded empty and the
  // rehydrate gate below reassigns it after `ensureWorktreeForBranch`.
  let worktreePath = typeof metrics.worktreePath === "string" ? metrics.worktreePath : "";
  const needsRehydrate = metrics.needsRehydrate === true;
  const targets = dedupeTargets(Array.isArray(metrics.targets) ? (metrics.targets as unknown[]) : []);

  if (!runDir || prNum == null || !repoRoot || targets.length === 0 || (!needsRehydrate && !worktreePath)) {
    const err = "session row missing runDir/prNum/repoRoot/targets (or worktreePath) in metrics";
    finalizeSession(store.db.db, {
      id: sessionId,
      finishedAt: new Date().toISOString(),
      state: "failed",
      exitCode: -1,
      error: err,
    });
    process.stdout.write(`[forge:comment-fix-worker] ${err}\n`);
    process.stdout.write(`${commentFixSentinelLine(-1, err)}\n`);
    process.exit(1);
  }

  const metaPath = path.join(runDir, "meta.json");
  const seedMeta = readMetaSafe(metaPath);
  const repoName = (seedMeta?.repoName as string | undefined) ?? path.basename(repoRoot);
  const headRefName = (seedMeta?.headRefName as string | null | undefined) ?? null;

  const repoConfig = store.getRepoConfig(repoRoot);
  const ghEnvResult = resolveGhEnv({ user: repoConfig.ghUser, host: repoConfig.ghHost });
  const ghEnv = { ...process.env, ...ghEnvResult.env } as Record<string, string>;

  process.stdout.write(`[forge:comment-fix-worker] starting fix on PR #${prNum} (${summarizeTargets(targets)})\n`);
  if (needsRehydrate) {
    process.stdout.write(`[forge:comment-fix-worker] worktree absent — will rehydrate from ${headRefName}\n`);
  } else {
    process.stdout.write(`[forge:comment-fix-worker] worktree=${worktreePath}\n`);
  }
  process.stdout.write(`[forge:comment-fix-worker] agent=${row.agent_adapter} model=${row.model ?? "(unset)"}\n`);

  let exitCode = 0;
  let error: string | null = null;
  let qualityResult: { ok: boolean; failedCommand: string | null } | null = null;

  try {
    // 0) Rehydrate the worktree when missing. Progress streams to the session
    //    log via stdout so the Workbench can watch it in real time.
    if (needsRehydrate) {
      if (!headRefName) {
        throw new Error("rehydrate requested but no headRefName in meta");
      }
      const ensured = await ensureWorktreeForBranch(repoRoot, headRefName, {
        onProgress: (msg) => process.stdout.write(`[forge:comment-fix-worker] rehydrate: ${msg}\n`),
      });
      if (ensured.error || !ensured.worktreePath) {
        throw new Error(
          `could not rehydrate a worktree for PR #${prNum} on branch ${headRefName}: ${ensured.error ?? "(unknown)"}`,
        );
      }
      worktreePath = ensured.worktreePath;
      process.stdout.write(`[forge:comment-fix-worker] rehydrated worktree=${worktreePath}\n`);
      // Persist the resolved path so future surfaces (forge worktree list,
      // a re-run) find it. `jobs` rows are append-only history.
      updatePlanWorktreePath(store, repoRoot, prNum, worktreePath, null);
      // Update the session row's cwd + metrics so /api/sessions reflects reality.
      const updatedMetrics = { ...metrics, worktreePath, needsRehydrate: false };
      try {
        store.db.db
          .prepare("UPDATE sessions SET cwd = ?, metrics = ? WHERE id = ?")
          .run(worktreePath, JSON.stringify(updatedMetrics), sessionId);
      } catch {
        /* annotation only */
      }
    }
    if (!worktreePath) {
      throw new Error("worker has no worktreePath after rehydrate gate");
    }

    // Capture HEAD so we can roll back the worktree on quality failure.
    let headSha = "";
    try {
      headSha = execFileSync("git", ["-C", worktreePath, "rev-parse", "HEAD"], {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
    } catch (e) {
      throw new Error(`git rev-parse HEAD failed in worktree: ${(e as Error).message}`);
    }

    // Re-fetch the bundle from the worktree so the agent sees up-to-date
    // anchors. We restricted the targets at the parent stage but the worker
    // still wants current comment/review bodies and commitIds.
    const bundle = await fetchPrBundle(prNum, {
      cwd: repoRoot,
      ghTarget: { user: repoConfig.ghUser, host: repoConfig.ghHost },
    });
    if (!bundle.ok) throw new Error(`gh pr bundle fetch failed: ${bundle.error}`);

    // Resolve each requested target against the freshly-fetched bundle and
    // the latest Forge findings. comment/finding carry a line anchor + the
    // surrounding hunk; review summaries are PR-wide (no path/line/hunk).
    // Targets that no longer resolve are tracked so we stamp them `disputed`
    // below rather than dropping them silently.
    const inlineById = new Map(bundle.bundle.inlineComments.map((c) => [c.id, c]));
    const reviewById = new Map(bundle.bundle.prReviews.map((r) => [r.id, r]));
    const findingById = new Map(
      findLatestForgeFindings(store, prNum, repoRoot, headRefName).findings.map((f) => [f.id, f]),
    );

    const enriched: EnrichedTarget[] = [];
    const unresolved = new Set<string>();
    for (const t of targets) {
      const token = targetKey(t.source, t.id);
      if (t.source === "comment") {
        const c = inlineById.get(Number(t.id));
        if (!c) {
          unresolved.add(token);
          continue;
        }
        enriched.push({
          token,
          source: "comment",
          kind: "inline comment",
          path: c.path,
          line: c.line,
          body: c.body,
          commitId: c.commitId,
          currentHunk: resolveCurrentHunk(worktreePath, c.path, c.line, c.commitId),
        });
      } else if (t.source === "review") {
        const r = reviewById.get(Number(t.id));
        if (!r) {
          unresolved.add(token);
          continue;
        }
        enriched.push({
          token,
          source: "review",
          kind: `review summary (${r.state})`,
          path: null,
          line: null,
          body: r.body,
          commitId: "",
          currentHunk: null,
        });
      } else {
        const f = findingById.get(t.id);
        if (!f) {
          unresolved.add(token);
          continue;
        }
        const line = f.lineStart > 0 ? f.lineStart : null;
        enriched.push({
          token,
          source: "finding",
          kind: `forge finding (${f.severity})`,
          path: f.file || null,
          line,
          body: composeFindingBody(f),
          commitId: "HEAD",
          currentHunk: f.file && line ? resolveCurrentHunk(worktreePath, f.file, line, "HEAD") : null,
        });
      }
    }
    if (enriched.length === 0) {
      throw new Error(
        "no fix targets could be resolved against the current PR (comments/reviews/findings may have changed)",
      );
    }

    const diff = runGhSafe(["pr", "diff", String(prNum)], ghEnv, repoRoot);
    const linkedSpec = lookupLinkedSpec(store, repoRoot, headRefName);

    const prompt = buildCommentFixerPrompt({
      prNum,
      repoName,
      skillsDir: commentFixerSkillsDir(),
      diff,
      linkedSpec,
      targets: enriched,
    });
    const promptFile = path.join(runDir, "comment-fix-prompt.txt");
    fs.writeFileSync(promptFile, prompt, "utf-8");

    const cmd = agentCommand(row.agent_adapter as Parameters<typeof agentCommand>[0], row.model ?? "", promptFile, {
      reasoningEffort: repoConfig.reviewerReasoningEffort,
    });

    process.stdout.write("[forge:comment-fix-worker] invoking agent (validate then fix)\n");
    const rawFile = path.join(runDir, "fix-raw.md");
    const bashLine = `set -o pipefail; ${cmd} 2>&1 | tee "${rawFile.replace(/"/g, '\\"')}"`;
    try {
      execFileSync("bash", ["-c", bashLine], {
        stdio: ["ignore", "inherit", "inherit"],
        env: ghEnv,
        cwd: worktreePath,
      });
    } catch (e) {
      const err = e as { status?: number; message?: string };
      throw new Error(`agent exited non-zero (${err.status ?? "?"}): ${err.message ?? "no detail"}`);
    }

    // Parse validation block, keyed by fix-target token.
    const raw = fs.existsSync(rawFile) ? fs.readFileSync(rawFile, "utf-8") : "";
    const validation = parseCommentValidation(raw);
    const allTokens = targets.map((t) => targetKey(t.source, t.id));
    const requested = new Set(allTokens);
    const byToken = new Map<string, CommentValidationEntry>();
    for (const entry of validation) {
      if (!requested.has(entry.targetId)) {
        process.stdout.write(`[forge:comment-fix-worker] dropping verdict for ${entry.targetId} (not in request)\n`);
        continue;
      }
      if (byToken.has(entry.targetId)) {
        process.stdout.write(`[forge:comment-fix-worker] dropping duplicate verdict for ${entry.targetId}\n`);
        continue;
      }
      byToken.set(entry.targetId, entry);
    }
    // Backfill omitted (and unresolved) targets as disputed.
    for (const token of allTokens) {
      if (!byToken.has(token)) {
        const reason = unresolved.has(token) ? "target no longer present on the PR" : "agent did not emit a verdict";
        byToken.set(token, { targetId: token, verdict: "disputed", reason });
      }
    }

    // Optimistically stamp `valid` rows as `fixed` and `disputed` rows as `disputed`.
    // We'll re-stamp `valid` rows to `failed` if quality fails below.
    const validationEntries: ValidationFileEntry[] = [];
    for (const token of allTokens) {
      const v = byToken.get(token);
      if (!v) continue;
      validationEntries.push({ ...v, status: v.verdict === "valid" ? "fixed" : "disputed" });
    }
    writeValidation(runDir, validationEntries);
    const validCount = validationEntries.filter((v) => v.status === "fixed").length;
    process.stdout.write(
      `[forge:comment-fix-worker] validation: ${validCount} valid, ${validationEntries.length - validCount} disputed\n`,
    );

    // Check whether the agent actually changed anything.
    const changedFiles = listChangedFiles(worktreePath, headSha);
    if (validCount === 0 || changedFiles.length === 0) {
      process.stdout.write(
        `[forge:comment-fix-worker] no edits to commit (${changedFiles.length} changed files, ${validCount} valid).\n`,
      );
      // No quality run needed; we're done.
      qualityResult = { ok: true, failedCommand: null };
    } else {
      process.stdout.write(`[forge:comment-fix-worker] running quality gates over ${changedFiles.length} file(s)\n`);
      qualityResult = runQualityGates(repoRoot, worktreePath, runDir);
      if (!qualityResult.ok) {
        process.stdout.write(
          `[forge:comment-fix-worker] quality gate failed (${qualityResult.failedCommand}) — rolling back\n`,
        );
        rollbackWorktree(worktreePath, headSha, changedFiles);
        // Mark every `valid` row as `failed` in validation.json so the
        // bundle surfaces the regression.
        for (const v of validationEntries) {
          if (v.verdict === "valid") v.status = "failed";
        }
        writeValidation(runDir, validationEntries);
        throw new Error(`quality gate failed: ${qualityResult.failedCommand ?? "unknown"}`);
      }
      // Stage and commit only the files the agent changed (no `git add -A`).
      const validTokens = validationEntries.filter((v) => v.status === "fixed").map((v) => v.targetId);
      commitAndPush(worktreePath, changedFiles, validTokens);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    exitCode = 1;
    process.stdout.write(`[forge:comment-fix-worker] error: ${error}\n`);
  }

  const completedAt = new Date().toISOString();
  const status = exitCode === 0 ? "completed" : "failed";
  writeMetaSafe(metaPath, {
    schemaVersion: SCHEMA_VERSION,
    repoRoot,
    repoName,
    prNum,
    headRefName,
    worktreePath,
    sessionId,
    startedAt: (seedMeta?.startedAt as string | undefined) ?? completedAt,
    completedAt,
    status,
    exitCode,
    targets,
    quality: qualityResult,
  });

  finalizeSession(store.db.db, {
    id: sessionId,
    finishedAt: completedAt,
    state: exitCode === 0 ? "completed" : "failed",
    exitCode,
    error,
  });

  process.stdout.write(`${commentFixSentinelLine(exitCode, error)}\n`);
  process.exit(exitCode);
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function isLiveWorktree(worktreePath: string): boolean {
  try {
    const root = execFileSync("git", ["-C", worktreePath, "rev-parse", "--show-toplevel"], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return root.length > 0;
  } catch {
    return false;
  }
}

/**
 * Stamp the newest linked plan's `Plan.worktree` with the rehydrated path
 * so future fix sessions and `forge worktree list` can find it. Mirrors
 * `resolveWorktreePathForPr` in how it picks the "newest" plan.
 */
function updatePlanWorktreePath(
  store: ForgeStore,
  repoRoot: string,
  prNumber: number,
  newPath: string,
  previousPath: string | null,
): void {
  try {
    const candidates = store.getPlans(repoRoot).filter((p) => p.status !== "archived" && p.prNumber === prNumber);
    if (candidates.length === 0) return;
    const newest = [...candidates].sort((a, b) => {
      const aKey = a.completedAt ?? a.launchedAt ?? a.createdAt;
      const bKey = b.completedAt ?? b.launchedAt ?? b.createdAt;
      return bKey.localeCompare(aKey);
    })[0];
    if (newest.worktree !== newPath) {
      store.upsertPlan({ ...newest, worktree: newPath });
    }
    // If other plans still point at the now-stale path, scrub them too so
    // listWorktrees doesn't double-count.
    if (previousPath && previousPath !== newPath) {
      for (const plan of candidates) {
        if (plan.id !== newest.id && plan.worktree === previousPath) {
          store.upsertPlan({ ...plan, worktree: null });
        }
      }
    }
  } catch {
    /* annotation only */
  }
}

function resolveWorktreePathForPr(store: ForgeStore, repoRoot: string, prNumber: number): string | null {
  try {
    const candidates = store.getPlans(repoRoot).filter((p) => p.status !== "archived" && p.prNumber === prNumber);
    if (candidates.length === 0) return null;
    const newest = [...candidates].sort((a, b) => {
      const aKey = a.completedAt ?? a.launchedAt ?? a.createdAt;
      const bKey = b.completedAt ?? b.launchedAt ?? b.createdAt;
      return bKey.localeCompare(aKey);
    })[0];
    const job = store.db.db
      .prepare(
        `SELECT j.worktree_path AS worktreePath
           FROM jobs j JOIN tasks t ON j.task_id = t.id
           WHERE t.plan_id = ?
           ORDER BY COALESCE(j.started_at, '') DESC, j.run_number DESC
           LIMIT 1`,
      )
      .get(newest.id) as { worktreePath: string | null } | undefined;
    return job?.worktreePath ?? null;
  } catch {
    return null;
  }
}

function readMetaSafe(metaPath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function writeMetaSafe(metaPath: string, meta: CommentFixMeta): void {
  try {
    fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf-8");
  } catch {
    /* meta is advisory */
  }
}

function writeValidation(runDir: string, entries: ValidationFileEntry[]): void {
  try {
    fs.writeFileSync(path.join(runDir, "validation.json"), `${JSON.stringify(entries, null, 2)}\n`, "utf-8");
  } catch {
    /* advisory */
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
    process.stdout.write(`[forge:comment-fix-worker] gh ${args.join(" ")} failed: ${detail}\n`);
    return "";
  }
}

function lookupLinkedSpec(store: ForgeStore, repoRoot: string, headRefName: string | null): string | null {
  if (!headRefName) return null;
  try {
    const plans = store.getPlans(repoRoot);
    const match = plans.find((p) => p.branch === headRefName);
    if (!match) return null;
    const spec = store.getSpec(match.id);
    return spec ? spec.replace(/^---[\s\S]*?---\n*/m, "").trim() : null;
  } catch {
    return null;
  }
}

/**
 * Render the comment-fix prompt. The fenced template the agent must emit
 * is documented in `cc-plugin/skills/forge-comment-fixer/SKILL.md`.
 */
export function buildCommentFixerPrompt(args: {
  prNum: number;
  repoName: string;
  skillsDir: string;
  diff: string;
  linkedSpec: string | null;
  targets: Array<{
    token: string;
    source: FixTargetSource;
    kind: string;
    path: string | null;
    line: number | null;
    body: string;
    commitId: string;
    currentHunk: string | null;
  }>;
}): string {
  const skillBody = (() => {
    try {
      return fs.readFileSync(path.join(args.skillsDir, "SKILL.md"), "utf-8").trim();
    } catch {
      return "";
    }
  })();

  const truncated = args.diff.length > DIFF_BUDGET;
  const diffSlice = truncated
    ? `${args.diff.slice(0, DIFF_BUDGET)}\n\n...(diff truncated for context budget; use \`gh pr diff ${args.prNum}\` for more)`
    : args.diff;

  const specSection = args.linkedSpec
    ? `## Linked Forge spec\n\n\`\`\`markdown\n${args.linkedSpec}\n\`\`\`\n`
    : "## Linked Forge spec\n\n(no forge spec linked to this branch — treat the PR description as the contract)\n";

  const targetsSection = args.targets
    .map((t) => {
      const hunkLine =
        t.source === "review"
          ? "_PR-wide review summary — no single anchor. Act only on concrete, diff-scoped asks; dispute the rest._"
          : t.currentHunk
            ? `\`\`\`diff\n${t.currentHunk}\n\`\`\``
            : t.source === "comment"
              ? '_anchor not resolvable — auto-mark this comment as disputed with reason "comment anchor is stale"._'
              : "_no line anchor — open the file at the path above and locate the issue described in the body._";
      return `### Target \`${t.token}\` (${t.kind})
- **File:** \`${t.path || "(PR-wide)"}\`
- **Line:** ${t.line ?? "(unanchored)"}
- **Commit:** \`${t.commitId || "(HEAD)"}\`

**Body:**
${t.body || "(empty)"}

**Current hunk (worktree HEAD):**
${hunkLine}`;
    })
    .join("\n\n");

  return [
    `You are fixing PR #${args.prNum} in ${args.repoName} based on operator-selected review items (Forge findings, inline comments, and/or review summaries).`,
    "",
    "## forge-comment-fixer skill",
    "",
    skillBody,
    "",
    specSection,
    "",
    "## PR diff",
    "",
    "```diff",
    diffSlice,
    "```",
    "",
    "## Selected targets to validate, then fix",
    "",
    targetsSection,
    "",
    "Emit the `forge-comment-validation` block first (one line per target, keyed by `targetId`), then make the code edits for `valid` entries.",
  ].join("\n");
}

function resolveCurrentHunk(worktreePath: string, file: string, line: number | null, commitId: string): string | null {
  if (!file || !line) return null;
  // First try the comment's original commitId; if it's not reachable, fall
  // back to the worktree HEAD. Either way we anchor the hunk on the
  // current file contents, so the agent always sees what it must edit.
  const base = commitId && isCommitReachable(worktreePath, commitId) ? commitId : "HEAD";
  try {
    const out = execFileSync("git", ["-C", worktreePath, "diff", `--unified=5`, base, "--", file], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (!out) return null;
    return extractHunkContaining(out, line);
  } catch {
    return null;
  }
}

function isCommitReachable(worktreePath: string, sha: string): boolean {
  try {
    execFileSync("git", ["-C", worktreePath, "cat-file", "-e", sha], { stdio: ["pipe", "pipe", "pipe"] });
    return true;
  } catch {
    return false;
  }
}

function extractHunkContaining(diff: string, line: number): string | null {
  const lines = diff.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^@@ .* \+(\d+)(?:,(\d+))? @@/);
    if (!m) {
      i++;
      continue;
    }
    const start = Number(m[1]);
    const count = m[2] ? Number(m[2]) : 1;
    const end = start + count - 1;
    const headerIdx = i;
    let j = i + 1;
    while (j < lines.length && !lines[j].startsWith("@@") && !lines[j].startsWith("diff --git")) j++;
    if (line >= start && line <= end) {
      return lines.slice(headerIdx, j).join("\n");
    }
    i = j;
  }
  return null;
}

function listChangedFiles(worktreePath: string, headSha: string): string[] {
  try {
    const out = execFileSync("git", ["-C", worktreePath, "diff", "--name-only", headSha], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

function runQualityGates(
  repoRoot: string,
  worktreePath: string,
  runDir: string,
): { ok: boolean; failedCommand: string | null } {
  const profile = detectRepo(repoRoot);
  const commands = profile?.qualityCommands ?? [];
  if (commands.length === 0) {
    process.stdout.write("[forge:comment-fix-worker] no quality commands configured — skipping gates\n");
    return { ok: true, failedCommand: null };
  }
  const qualityLog = path.join(runDir, "quality.jsonl");
  for (const cmd of commands) {
    const start = Date.now();
    let ok = true;
    try {
      execFileSync("bash", ["-c", cmd], {
        cwd: worktreePath,
        stdio: ["ignore", "inherit", "inherit"],
        env: process.env,
      });
    } catch {
      ok = false;
    }
    const durationMs = Date.now() - start;
    try {
      fs.appendFileSync(qualityLog, `${JSON.stringify({ command: cmd, ok, durationMs })}\n`);
    } catch {
      /* logging is advisory */
    }
    if (!ok) return { ok: false, failedCommand: cmd };
  }
  return { ok: true, failedCommand: null };
}

function rollbackWorktree(worktreePath: string, headSha: string, files: string[]): void {
  if (files.length === 0) return;
  try {
    execFileSync(
      "git",
      ["-C", worktreePath, "restore", `--source=${headSha}`, "--staged", "--worktree", "--", ...files],
      { stdio: ["pipe", "inherit", "inherit"] },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stdout.write(`[forge:comment-fix-worker] rollback failed: ${msg}\n`);
  }
}

function commitAndPush(worktreePath: string, files: string[], validTokens: string[]): void {
  // Stage only the files the agent changed — never `git add -A`.
  execFileSync("git", ["-C", worktreePath, "add", "--", ...files], { stdio: ["pipe", "inherit", "inherit"] });
  const fixed = dedupeTargets(validTokens.map((tok) => parseTargetKey(tok)).filter((t): t is FixTarget => t !== null));
  const summary = summarizeTargets(fixed);
  const msg = `fix(review): address PR feedback (${summary})`;
  execFileSync("git", ["-C", worktreePath, "commit", "-m", msg], { stdio: ["pipe", "inherit", "inherit"] });
  execFileSync("git", ["-C", worktreePath, "push"], { stdio: ["pipe", "inherit", "inherit"] });
}

// ─── State lookup (used by the review-bundle route) ──────────────────────────

/**
 * Find the newest comment-fix session for `(repoRoot, prNum)` and project
 * its validation.json into the `commentFixState` shape consumed by the UI.
 * Newest-wins, mirroring `findLatestForgeFindings`.
 */
export function findLatestCommentFixState(store: ForgeStore, prNum: number, repoRoot: string): CommentFixState {
  const dir = path.join(store.runsDir, "pr-comment-fix");
  if (!fs.existsSync(dir)) return {};
  const prefix = `${prNum}-`;
  type Candidate = { runDir: string; mtime: number };
  const candidates: Candidate[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return {};
  }
  for (const ent of entries) {
    if (!ent.isDirectory() || !ent.name.startsWith(prefix)) continue;
    const runDir = path.join(dir, ent.name);
    try {
      const stat = fs.statSync(path.join(runDir, "validation.json"));
      candidates.push({ runDir, mtime: stat.mtimeMs });
    } catch {
      /* missing — skip */
    }
  }
  if (candidates.length === 0) return {};

  // Restrict to this repoRoot via the per-run meta.json (the runs dir is
  // global so a different repo's run for the same PR# could shadow ours).
  candidates.sort((a, b) => b.mtime - a.mtime);
  for (const c of candidates) {
    const meta = readMetaSafe(path.join(c.runDir, "meta.json"));
    if (!meta) continue;
    if (typeof meta.repoRoot === "string" && meta.repoRoot !== repoRoot) continue;
    try {
      const raw = fs.readFileSync(path.join(c.runDir, "validation.json"), "utf-8");
      const parsed = JSON.parse(raw) as LegacyValidationFileEntry[];
      if (!Array.isArray(parsed)) continue;
      const sessionFailed = meta.status === "failed";
      const out: CommentFixState = {};
      for (const entry of parsed) {
        if (!entry || !entry.status) continue;
        // Prefer the `source:id` token; fall back to a legacy numeric
        // commentId (coerced to `comment:<id>`) so pre-token runs still
        // surface their status in the UI.
        const token =
          typeof entry.targetId === "string" && entry.targetId.length > 0
            ? entry.targetId
            : typeof entry.commentId === "number"
              ? `comment:${entry.commentId}`
              : null;
        if (!token) continue;
        // Promote `valid`+`fixed` entries to `failed` when the whole
        // session failed (e.g. agent error post-validation, before we
        // re-stamped). The on-disk stamp is the source of truth, but if
        // the session ended in failure we shouldn't claim a comment was
        // fixed.
        let status = entry.status;
        if (sessionFailed && status === "fixed") status = "failed";
        out[token] = { status, reason: entry.reason };
      }
      return out;
    } catch {}
  }
  return {};
}
