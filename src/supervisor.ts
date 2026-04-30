/**
 * Forge Supervisor — structured progress tracker for pi-runtime tasks.
 *
 * Runner: `node --experimental-strip-types` from Node 22.
 *
 * Observed pi event stream notes (from captured fixture):
 *   - `tool_execution_start` and `tool_execution_end` carry `toolCallId`,
 *     `toolName`, `args`/`result`, `isError` as documented in json.md.
 *   - `message_end` with `role === "assistant"` carries `usage` with
 *     `{ input, output, cacheRead, cacheWrite, totalTokens, cost: { total } }`.
 *   - `message_update` events are noisy per-delta — ignored in Phase 1.
 *   - `session` header (type: "session") is emitted first — ignored.
 *
 * Future work (deferred from Phase 1):
 *   - Claude / Codex stream-JSON parity (Phase 2).
 *   - Watcher policies beyond stall detection: tool-error-loop,
 *     context-bloat, runaway-turns (Phase 3).
 *   - Bidirectional steering — sending messages mid-flight (Phase 4).
 *   - Migrating forge to its own GitHub repo (separate effort).
 */

import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveGhEnv } from "./gh.ts";
import { buildPrBody, type PrBodyInput, stripFrontmatter } from "./pr-body.ts";
import type { Phase, ProgressEvent, Snapshot } from "./progress.ts";
import { applyEvent, emptySnapshot } from "./progress.ts";
import type { LaunchTarget, ReasoningEffort, ReviewVerdict, TaskStatus } from "./store.ts";

// ─── Node 22 preflight (only when running as entry point) ─────────────────────

// ─── SupervisorArgs ───────────────────────────────────────────────────────────

interface SupervisorArgs {
  taskId: string;
  runDir: string;
  promptFile: string;
  worktreePath: string;
  repoName: string;
  branch: string;
  defaultBranch: string;
  qualityCommands: string[];
  model: string;
  specTitle: string;
  commitMessage: string;
  specFile: string;
  skipGit: boolean;
  reviewerTarget?: LaunchTarget;
  reviewerModel?: string;
  reviewerReasoningEffort?: ReasoningEffort;
  /** Per-repo gh account override (see gh.ts). */
  ghUser?: string;
  /** Per-repo gh host override. */
  ghHost?: string;
  /**
   * Resume an existing failed run from a specific phase. When set, the
   * agent spawn is skipped and earlier-than-`resumeFrom` phases are
   * skipped; state (baseSha/finalSha/prNumber/qualityResults/prUrl) is
   * hydrated from the existing meta.json + snapshot.json. The bash
   * wrapper that launches the supervisor must append (not truncate)
   * the agent.log when this is set.
   */
  resumeFrom?: "quality_check" | "committing" | "creating_pr" | "reviewing";
}

// Order of phases for resume gating. "reviewing" isn't in the Phase enum
// (it's a status sub-state on meta.json, not a snapshot phase) but we
// include it here so callers can resume into the reviewer-only path.
const RESUME_PHASE_ORDER: Record<NonNullable<SupervisorArgs["resumeFrom"]>, number> = {
  quality_check: 1,
  committing: 2,
  creating_pr: 3,
  reviewing: 4,
};

// ─── Pure helpers (exported for tests) ────────────────────────────────────────

export function formatArgsPreview(toolName: string, args: unknown): string {
  const a = args as Record<string, unknown> | null | undefined;
  if (!a || typeof a !== "object") return "";

  switch (toolName) {
    case "bash": {
      const cmd = String(a.command ?? "");
      return cmd.replace(/\n/g, " ").slice(0, 80);
    }
    case "read":
    case "write":
    case "edit": {
      const rawPath = String(a.file_path ?? a.path ?? "");
      const home = os.homedir();
      return rawPath.startsWith(home) ? "~" + rawPath.slice(home.length) : rawPath;
    }
    case "ls":
    case "find":
      return String(a.path ?? ".");
    case "grep": {
      const pattern = `/${a.pattern ?? ""}/`;
      const grepPath = a.path ? String(a.path) : ".";
      return grepPath !== "." ? `${pattern} in ${grepPath}` : pattern;
    }
    default: {
      try {
        const s = JSON.stringify(a);
        return s.length > 80 ? s.slice(0, 77) + "..." : s;
      } catch {
        return String(a).slice(0, 80);
      }
    }
  }
}

/**
 * Extract a PR URL from `gh pr create` output.
 *
 * Matches by URL *shape* rather than host so it works for GitHub
 * Enterprise Server hosts (e.g. https://git.internal.corp/.../pull/42).
 * `gh pr create` always emits a `https?://<host>/<owner>/<repo>/pull/<n>`
 * URL on a line of its own; we just look for that pattern in any token.
 *
 * Name retained for backward compatibility with callers/tests — the
 * function works correctly for any GitHub-flavored host (github.com,
 * *.ghe.com, GHES).
 */
export function extractGithubPrUrl(stdout: string): string | null {
  const tokens = stdout.split(/\s+/);
  let last: string | null = null;
  for (const tok of tokens) {
    if (/^https?:\/\/[^\s/]+\/[^\s]+\/pull\/\d+/.test(tok)) last = tok;
  }
  return last;
}

export function mapPiEvent(piEvent: unknown, ctx: { currentToolStartedAt: number | null }): ProgressEvent | null {
  if (!piEvent || typeof piEvent !== "object") return null;
  const ev = piEvent as Record<string, unknown>;
  const t = Date.now();

  switch (ev.type) {
    case "agent_start":
      return { t, type: "phase_change", from: "starting", to: "agent" };

    case "tool_execution_start": {
      const toolCallId = String(ev.toolCallId ?? "");
      const toolName = String(ev.toolName ?? "");
      const argsPreview = formatArgsPreview(toolName, ev.args);
      ctx.currentToolStartedAt = t;
      return { t, type: "tool_start", toolCallId, toolName, argsPreview };
    }

    case "tool_execution_end": {
      const toolCallId = String(ev.toolCallId ?? "");
      const toolName = String(ev.toolName ?? "");
      const isError = Boolean(ev.isError);
      const durationMs = ctx.currentToolStartedAt != null ? t - ctx.currentToolStartedAt : 0;
      ctx.currentToolStartedAt = null;
      return { t, type: "tool_end", toolCallId, toolName, isError, durationMs };
    }

    case "message_end": {
      const msg = ev.message as Record<string, unknown> | undefined;
      if (!msg || msg.role !== "assistant") return null;

      const events: ProgressEvent[] = [];

      // Extract assistant text
      const content = msg.content as Array<{ type: string; text?: string }> | undefined;
      if (Array.isArray(content)) {
        const text = content
          .filter((p) => p.type === "text" && p.text)
          .map((p) => p.text!)
          .join(" ")
          .replace(/\n/g, " ")
          .slice(0, 240);
        if (text) events.push({ t, type: "assistant_text", preview: text });
      }

      // Extract usage
      const usage = msg.usage as Record<string, unknown> | undefined;
      if (usage) {
        const cost = usage.cost as Record<string, number> | undefined;
        // We return only the usage event here; assistant_text is handled via a two-pass in the caller.
        // Actually, since we can only return one event, we handle this specially in processLine.
      }

      return events[0] ?? null;
    }

    case "agent_end":
      return null;

    default:
      return null;
  }
}

export function phaseToMetaStatus(phase: Phase): TaskStatus {
  switch (phase) {
    case "starting":
    case "agent":
      return "running";
    case "quality_check":
    case "committing":
      return "quality_check";
    case "creating_pr":
      return "creating_pr";
    case "done":
      return "done";
    case "failed":
      return "failed";
  }
}

export function formatTokens(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1000000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}

// ─── I/O helpers ──────────────────────────────────────────────────────────────

function atomicWriteJson(filePath: string, data: unknown): void {
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  fs.renameSync(tmp, filePath);
}

function appendJsonl(filePath: string, data: unknown): void {
  fs.appendFileSync(filePath, JSON.stringify(data) + "\n", "utf-8");
}

function logLine(msg: string): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `[${hh}:${mm}:${ss}] ${msg}`;
}

function runShell(
  cmd: string,
  args: string[],
  opts: { cwd: string; shell?: boolean; env?: NodeJS.ProcessEnv },
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      cwd: opts.cwd,
      shell: opts.shell ?? false,
      stdio: ["ignore", "pipe", "pipe"],
      env: opts.env ?? process.env,
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
    proc.on("error", (err) => resolve({ code: 1, stdout, stderr: err.message }));
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const argsPath = process.argv[2];
  if (!argsPath) {
    console.error("Usage: supervisor.ts <args-json-path>");
    process.exit(2);
  }

  let args: SupervisorArgs;
  try {
    args = JSON.parse(fs.readFileSync(argsPath, "utf-8"));
  } catch (e: any) {
    // Write minimal failed snapshot
    try {
      const runDir = path.dirname(argsPath);
      fs.mkdirSync(runDir, { recursive: true });
      const failSnap = emptySnapshot("unknown", Date.now());
      failSnap.phase = "failed" as any;
      failSnap.errorMessage = `Invalid supervisor args: ${e?.message ?? e}`;
      atomicWriteJson(path.join(runDir, "snapshot.json"), failSnap);
    } catch {
      /* best effort */
    }
    console.error(`Invalid supervisor args: ${e?.message ?? e}`);
    process.exit(2);
  }

  const {
    taskId,
    runDir,
    promptFile,
    worktreePath,
    repoName,
    branch,
    defaultBranch,
    qualityCommands,
    model,
    specTitle,
    commitMessage,
    specFile,
    skipGit,
    reviewerTarget,
    reviewerModel,
    reviewerReasoningEffort,
    ghUser,
    ghHost,
    resumeFrom,
  } = args;

  // ── Resume gating ─────────────────────────────────────────────────────────
  // When resuming, the agent spawn is always skipped; everything strictly
  // before `resumeFrom` is also skipped. State that earlier phases would
  // have produced (baseSha, qualityResults, finalSha, prNumber, prUrl) is
  // re-hydrated from existing meta.json + snapshot.json below.
  const isResume = resumeFrom != null;
  const fromRank = isResume ? RESUME_PHASE_ORDER[resumeFrom!] : 0;
  const skipAgent = isResume;
  const skipQuality = isResume && RESUME_PHASE_ORDER.quality_check < fromRank;
  const skipCommitPush = isResume && RESUME_PHASE_ORDER.committing < fromRank;
  const skipPrCreate = isResume && RESUME_PHASE_ORDER.creating_pr < fromRank;
  const skipReviewer = isResume && RESUME_PHASE_ORDER.reviewing < fromRank;

  // Resolve gh env once. If the override is misconfigured we still let the
  // agent run — the user will at least get the agent's work in commits —
  // but we record the resolution failure so PR creation surfaces it loudly
  // instead of failing with a swallowed gh stderr (the original bug that
  // motivated the per-repo settings feature).
  const ghResolved = resolveGhEnv({ user: ghUser, host: ghHost });
  const ghEnv: NodeJS.ProcessEnv = { ...process.env, ...ghResolved.env };

  // Track SHAs and timing for meta.json
  let baseSha: string | undefined;
  let finalSha: string | undefined;
  let prNumber: number | undefined;
  let reviewVerdict: ReviewVerdict | null | undefined;
  let reviewError: string | null | undefined;

  // Ensure runDir exists
  fs.mkdirSync(runDir, { recursive: true });

  // State
  const snapshotFile = path.join(runDir, "snapshot.json");
  const progressFile = path.join(runDir, "progress.jsonl");
  const logFile = path.join(runDir, "agent.log");
  const metaFile = path.join(runDir, "meta.json");

  // On resume: hydrate snapshot from disk so qualityResults / usage / prUrl
  // carry forward. Otherwise start fresh.
  let snapshot: Snapshot;
  if (isResume && fs.existsSync(snapshotFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(snapshotFile, "utf-8")) as Snapshot;
      if (existing?.schemaVersion === 1) {
        snapshot = {
          ...existing,
          phase: resumeFrom === "reviewing" ? "creating_pr" : (resumeFrom as Phase),
          lastEventAt: Date.now(),
          exitCode: null,
          errorMessage: null,
          alerts: [],
          consecutiveToolErrors: 0,
          currentTool: null,
        };
      } else {
        snapshot = emptySnapshot(taskId, Date.now());
      }
    } catch {
      snapshot = emptySnapshot(taskId, Date.now());
    }
  } else {
    snapshot = emptySnapshot(taskId, Date.now());
  }

  // On resume: pull persisted SHAs / PR number from existing meta so the
  // post-agent pipeline (build PR body, reviewer) has what it needs.
  if (isResume && fs.existsSync(metaFile)) {
    try {
      const existingMeta = JSON.parse(fs.readFileSync(metaFile, "utf-8")) as Record<string, unknown>;
      if (typeof existingMeta.baseSha === "string") baseSha = existingMeta.baseSha;
      if (typeof existingMeta.finalSha === "string") finalSha = existingMeta.finalSha;
      if (typeof existingMeta.prNumber === "number") prNumber = existingMeta.prNumber;
      if (typeof existingMeta.prUrl === "string" && !snapshot.prUrl) {
        snapshot = { ...snapshot, prUrl: existingMeta.prUrl };
      }
    } catch {
      /* best-effort */
    }
  }

  // Cumulative usage tracking (preserved across resume)
  let cumulativeUsage = { ...snapshot.usage };
  let turnCount = snapshot.usage.turns;

  let pendingFlush: ReturnType<typeof setTimeout> | null = null;

  function flushSnapshot(): void {
    if (pendingFlush !== null) {
      clearTimeout(pendingFlush);
      pendingFlush = null;
    }
    atomicWriteJson(snapshotFile, snapshot);
  }

  function scheduleFlush(): void {
    if (pendingFlush === null) {
      pendingFlush = setTimeout(flushSnapshot, 200);
    }
  }

  function writeMetaDual(): void {
    const now = Date.now();
    const isDone = snapshot.phase === "done" || snapshot.phase === "failed";
    const meta: Record<string, unknown> = {
      taskId,
      tmuxSession: `forge-${taskId.slice(-14)}`,
      logFile,
      agent: "pi",
      model,
      worktree: worktreePath,
      status: phaseToMetaStatus(snapshot.phase),
      startedAt: new Date(snapshot.startedAt).toISOString(),
      prUrl: snapshot.prUrl,
      ...(baseSha != null && { baseSha }),
      ...(finalSha != null && { finalSha }),
      ...(prNumber != null && { prNumber }),
      ...(isDone && { endedAt: new Date(now).toISOString() }),
      ...(isDone && { durationMs: now - snapshot.startedAt }),
      ...(snapshot.qualityResults.length > 0 && { qualityResults: snapshot.qualityResults }),
      ...(reviewerTarget != null && { reviewerAgent: reviewerTarget }),
      ...(reviewerModel != null && { reviewerModel }),
      ...(reviewerReasoningEffort != null && { reviewerReasoningEffort }),
      ...(reviewVerdict !== undefined && { reviewVerdict }),
      ...(reviewError !== undefined && { reviewError }),
      // errorMessage lives on snapshot (set via emit{type:"stopped"}).
      // Mirror it into meta.json so consumers like the resume wizard,
      // dashboard, and external tools can read failure context from a
      // single place. Previously meta.json was always missing this and
      // callers had to fall back to snapshot.json.
      ...(snapshot.errorMessage != null && { errorMessage: snapshot.errorMessage }),
    };
    atomicWriteJson(metaFile, meta);
  }

  function emit(ev: ProgressEvent): void {
    appendJsonl(progressFile, ev);
    snapshot = applyEvent(snapshot, ev);
    if (ev.type === "phase_change" || ev.type === "stopped") {
      flushSnapshot();
      writeMetaDual();
    } else {
      scheduleFlush();
    }
  }

  function log(msg: string): void {
    const line = logLine(msg);
    fs.appendFileSync(logFile, line + "\n", "utf-8");
    process.stdout.write(line + "\n");
  }

  // Write initial snapshot + meta
  flushSnapshot();
  writeMetaDual();

  // Seed agent.log banner
  const bannerLines = [
    "╔══════════════════════════════════════════════════════╗",
    `  FORGE — ${taskId}`,
    `  Agent : pi / ${model}`,
    `  Repo  : ${repoName}  branch: ${branch}`,
    `  Start : ${new Date().toISOString()}`,
    "╚══════════════════════════════════════════════════════╝",
    "",
  ];
  for (const line of bannerLines) log(line);

  // gh override pre-flight. If the user configured an override but we
  // can't resolve it (token missing / keyring locked / account logged
  // out), we MUST abort before the agent runs — otherwise gh falls back
  // to whichever account is currently active and the run silently
  // commits/creates-PRs under the wrong identity. Mirrors the launch-time
  // check in runLaunchWizard so resume / token-expiry / hand-edited
  // supervisor-args.json all fail safely with the same error path.
  if (ghUser || ghHost) {
    if (ghResolved.error) {
      const msg = `gh override unresolvable: ${ghResolved.error}`;
      log(`✗ ${msg}`);
      log("  Refusing to run — the configured account is required for this repo.");
      log(`  Fix and re-launch (or /forge-resume) once \`gh auth status\` is healthy.`);
      emit({
        t: Date.now(),
        type: "phase_change",
        from: snapshot.phase,
        to: "failed",
      });
      emit({
        t: Date.now(),
        type: "stopped",
        exitCode: 1,
        reason: "error",
        errorMessage: msg,
      });
      flushSnapshot();
      log(`═══ DONE: ${new Date().toISOString()} ═══`);
      process.exit(1);
    }
    log(`✓ Using gh override: ${ghUser ?? "(default user)"} @ ${ghHost ?? "github.com"}`);
  }

  // ── Spawn pi ────────────────────────────────────────────────────────────

  if (!skipAgent) {
    const piArgs = ["--mode", "json", "-p", "--no-session", "--model", model];
    const proc: ChildProcess = spawn("pi", piArgs, {
      cwd: worktreePath,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    // Pipe prompt to stdin
    const promptContent = fs.readFileSync(promptFile, "utf-8");
    proc.stdin!.write(promptContent);
    proc.stdin!.end();

    snapshot = { ...snapshot, agentPid: proc.pid ?? null };
    flushSnapshot();

    emit({ t: Date.now(), type: "phase_change", from: "starting", to: "agent" });

    // Stall watcher
    const stallInterval = setInterval(() => {
      if (snapshot.phase === "agent" && Date.now() - snapshot.lastEventAt > 120000) {
        const existing = snapshot.alerts.find((a) => a.kind === "stalled");
        if (!existing) {
          const seconds = Math.round((Date.now() - snapshot.lastEventAt) / 1000);
          emit({
            t: Date.now(),
            type: "alert",
            alert: { kind: "stalled", at: Date.now(), message: `No agent events for ${seconds}s` },
          });
        }
      }
    }, 10000);

    process.on("exit", () => clearInterval(stallInterval));

    // Parse pi events
    const mapCtx = { currentToolStartedAt: null as number | null };
    let buffer = "";

    function processLine(line: string): void {
      const trimmed = line.trim();
      if (!trimmed) return;
      let event: Record<string, unknown>;
      try {
        event = JSON.parse(trimmed);
      } catch {
        console.error(`Malformed JSON line: ${trimmed.slice(0, 100)}`);
        return;
      }

      // Skip session header
      if (event.type === "session") return;

      // Special handling for message_end to emit both assistant_text and usage
      if (event.type === "message_end") {
        const msg = event.message as Record<string, unknown> | undefined;
        if (msg && msg.role === "assistant") {
          // assistant_text
          const content = msg.content as Array<{ type: string; text?: string }> | undefined;
          if (Array.isArray(content)) {
            const text = content
              .filter((p) => p.type === "text" && p.text)
              .map((p) => p.text!)
              .join(" ")
              .replace(/\n/g, " ")
              .slice(0, 240);
            if (text) {
              emit({ t: Date.now(), type: "assistant_text", preview: text });
              log(`assistant: ${text.slice(0, 80)}`);
            }
          }

          // usage
          const usage = msg.usage as Record<string, number | Record<string, number>> | undefined;
          if (usage) {
            turnCount++;
            cumulativeUsage = {
              inputTokens: cumulativeUsage.inputTokens + ((usage.input as number) ?? 0),
              outputTokens: cumulativeUsage.outputTokens + ((usage.output as number) ?? 0),
              cacheReadTokens: cumulativeUsage.cacheReadTokens + ((usage.cacheRead as number) ?? 0),
              cacheWriteTokens: cumulativeUsage.cacheWriteTokens + ((usage.cacheWrite as number) ?? 0),
              costUsd: cumulativeUsage.costUsd + ((usage.cost as Record<string, number>)?.total ?? 0),
              contextTokens: (usage.totalTokens as number) ?? 0,
              turns: turnCount,
            };
            emit({
              t: Date.now(),
              type: "usage",
              turn: turnCount,
              usage: { ...cumulativeUsage },
            });
            log(
              `usage: ↑${formatTokens(cumulativeUsage.inputTokens)} ↓${formatTokens(cumulativeUsage.outputTokens)} turn ${turnCount}`,
            );
          }
          return;
        }
      }

      // Map other events
      const mapped = mapPiEvent(event, mapCtx);
      if (!mapped) return;

      emit(mapped);

      // Human-readable tee
      switch (mapped.type) {
        case "phase_change":
          log(`phase: ${mapped.from} → ${mapped.to}`);
          break;
        case "tool_start":
          log(`tool_start: ${mapped.toolName} ${mapped.argsPreview}`);
          break;
        case "tool_end": {
          const dur = (mapped.durationMs / 1000).toFixed(1);
          const icon = mapped.isError ? "✗" : "✓";
          log(`tool_end: ${mapped.toolName} (${dur}s) ${icon}`);
          break;
        }
      }
    }

    proc.stdout!.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) processLine(line);
    });

    proc.stderr!.on("data", (data) => {
      const text = data.toString().trim();
      if (text) log(`stderr: ${text}`);
    });

    // Wait for pi to exit
    const exitCode = await new Promise<number>((resolve) => {
      proc.on("close", (code) => {
        if (buffer.trim()) processLine(buffer);
        resolve(code ?? 1);
      });
      proc.on("error", (err) => {
        log(`spawn error: ${err.message}`);
        resolve(1);
      });
    });

    clearInterval(stallInterval);

    if (exitCode !== 0) {
      log(`✗ Agent exited with code ${exitCode}`);
      emit({
        t: Date.now(),
        type: "stopped",
        exitCode,
        reason: "error",
        errorMessage: `Agent exited with code ${exitCode}`,
      });
      process.exit(exitCode);
    }

    log("✓ Agent completed");
  } else {
    // Resume path — the previous run already executed (or partially executed)
    // the agent. Emit a single phase_change so consumers (dashboard, snapshot)
    // see we're picking back up at the resume entry phase.
    emit({
      t: Date.now(),
      type: "phase_change",
      from: "failed",
      to: resumeFrom === "reviewing" ? "creating_pr" : (resumeFrom as Phase),
    });
  }

  // ── Quality checks ──────────────────────────────────────────────────────

  if (!skipQuality) {
    if (snapshot.phase !== "quality_check") {
      emit({ t: Date.now(), type: "phase_change", from: snapshot.phase, to: "quality_check" });
    }
    // On resume from quality_check we re-run from scratch — wipe prior
    // results so the dashboard reflects the fresh attempt.
    if (isResume) {
      snapshot = { ...snapshot, qualityResults: [] };
      flushSnapshot();
    }

    if (qualityCommands.length === 0) {
      log("No quality commands configured — skipping.");
    }

    for (let i = 0; i < qualityCommands.length; i++) {
      const cmd = qualityCommands[i];
      log(`>>> ${cmd}`);
      const start = Date.now();
      const result = await runShell(cmd, [], { cwd: worktreePath, shell: true });
      const durationMs = Date.now() - start;
      const ok = result.code === 0;

      // Write per-command log
      const cmdLog = path.join(runDir, `quality-${i}.log`);
      fs.writeFileSync(cmdLog, result.stdout + result.stderr, "utf-8");

      snapshot = {
        ...snapshot,
        qualityResults: [...snapshot.qualityResults, { command: cmd, ok, durationMs }],
      };
      flushSnapshot();

      const icon = ok ? "✓" : "✗";
      log(`${icon} ${cmd} (${(durationMs / 1000).toFixed(1)}s)`);
    }
  } else {
    log(`↻ Skipping quality checks (resume from ${resumeFrom}).`);
  }

  // ── Git / PR ────────────────────────────────────────────────────────────

  if (skipGit) {
    emit({ t: Date.now(), type: "phase_change", from: "quality_check", to: "done" });
    emit({ t: Date.now(), type: "stopped", exitCode: 0, reason: "completed" });
    flushSnapshot();
    process.exit(0);
  }

  if (!skipCommitPush) {
    if (snapshot.phase !== "committing") {
      emit({ t: Date.now(), type: "phase_change", from: snapshot.phase, to: "committing" });
    }
    log("═══ VERIFY COMMITS & PUSH ═══");

    // git add + commit (suppress non-zero if nothing staged)
    try {
      execFileSync("git", ["add", "-A"], { cwd: worktreePath, stdio: "pipe" });
    } catch {
      /* ignore */
    }
    try {
      execFileSync("git", ["commit", "-m", commitMessage], { cwd: worktreePath, stdio: "pipe" });
      log("✓ Committed");
    } catch {
      log("No changes to commit (agent may have committed already)");
    }

    // Push
    try {
      execFileSync("git", ["push", "-u", "origin", branch], { cwd: worktreePath, stdio: "pipe" });
      log("✓ Pushed");
    } catch (e: any) {
      log(`push failed: ${e?.message ?? e}`);
    }
  } else {
    log(`↻ Skipping commit & push (resume from ${resumeFrom}).`);
  }

  // ── Draft PR ────────────────────────────────────────────────────────────

  // Hoisted out of `if (!skipPrCreate)` because the post-block check at
  // `if (prCreationFailed)` reads it unconditionally; declaring it inside
  // the block crashed every successful PR-creation path with a
  // ReferenceError. Initialised to false so resume paths that skip PR
  // creation entirely (e.g. resume-from "reviewing") see a defined value.
  let prCreationFailed = false;

  if (!skipPrCreate) {
    if (snapshot.phase !== "creating_pr") {
      emit({ t: Date.now(), type: "phase_change", from: snapshot.phase, to: "creating_pr" });
    }
    log("═══ CREATING DRAFT PR ═══");

    // ── Build structured PR body ──────────────────────────────────────────
    const prBodyFile = path.join(runDir, "pr-body.md");
    let usePrBodyFile = false;
    try {
      // Determine base ref and capture baseSha
      let baseRef = defaultBranch;
      try {
        execFileSync("git", ["rev-parse", "--verify", `origin/${defaultBranch}`], { cwd: worktreePath, stdio: "pipe" });
        baseRef = `origin/${defaultBranch}`;
      } catch {
        /* use defaultBranch as-is */
      }
      try {
        baseSha = execFileSync("git", ["rev-parse", baseRef], {
          cwd: worktreePath,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();
      } catch {
        /* baseSha unavailable — not fatal */
      }

      // Gather commits
      const commitLog = execFileSync("git", ["log", "--no-merges", `--format=%h %s`, `${baseRef}..HEAD`], {
        cwd: worktreePath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
      const commits = commitLog
        ? commitLog.split("\n").map((line) => {
            const spaceIdx = line.indexOf(" ");
            return { sha: line.slice(0, spaceIdx), subject: line.slice(spaceIdx + 1) };
          })
        : [];

      // Gather diff stats
      let additions: number | null = null;
      let deletions: number | null = null;
      let filesChanged: number | null = null;
      try {
        const shortstat = execFileSync("git", ["diff", "--shortstat", `${baseRef}..HEAD`], {
          cwd: worktreePath,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();
        const sm = shortstat.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
        if (sm) {
          filesChanged = parseInt(sm[1], 10);
          if (sm[2]) additions = parseInt(sm[2], 10);
          if (sm[3]) deletions = parseInt(sm[3], 10);
        }
      } catch {
        /* stats unavailable — not fatal */
      }

      // Read spec body
      const specBody = fs.existsSync(specFile) ? fs.readFileSync(specFile, "utf-8") : "";

      // Parse jiraTicket and jiraUrl from frontmatter
      const jiraTicketMatch = specBody.match(/^jiraTicket:\s*(\S+)/m);
      const jiraUrlMatch = specBody.match(/^jiraUrl:\s*(\S+)/m);

      // Read agent summary if present
      const agentSummaryPath = path.join(runDir, "agent-summary.md");
      let agentSummary: string | null = null;
      try {
        agentSummary = fs.readFileSync(agentSummaryPath, "utf-8").trim() || null;
      } catch {
        /* file doesn't exist — fine */
      }

      const prBodyInput: PrBodyInput = {
        taskId,
        specBody,
        branch,
        baseRef,
        commits,
        additions,
        deletions,
        filesChanged,
        qualityResults: snapshot.qualityResults,
        agent: "pi",
        model,
        jiraTicket: jiraTicketMatch?.[1] ?? null,
        jiraUrl: jiraUrlMatch?.[1] ?? null,
        agentSummary,
      };

      const body = buildPrBody(prBodyInput);
      fs.writeFileSync(prBodyFile, body, "utf-8");
      usePrBodyFile = true;
      log("✓ PR body built");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      log(`⚠ PR body build failed, falling back to spec file: ${msg}`);
    }

    // Capture finalSha before creating the PR
    try {
      finalSha = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: worktreePath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
    } catch {
      /* finalSha unavailable — not fatal */
    }

    // Defensive idempotency: if a PR already exists for this branch (e.g. a
    // previous run partially succeeded, or the user is resuming after
    // creating one out-of-band), reuse it instead of creating a duplicate.
    let existingPrUrl: string | null = snapshot.prUrl ?? null;
    if (!existingPrUrl) {
      try {
        const out = execFileSync(
          "gh",
          ["pr", "list", "--head", branch, "--state", "open", "--json", "number,url", "--limit", "5"],
          { cwd: worktreePath, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], env: ghEnv },
        );
        const arr = JSON.parse(out) as Array<{ number: number; url: string }>;
        if (Array.isArray(arr) && arr.length > 0) {
          existingPrUrl = arr[0].url;
          prNumber = arr[0].number;
        }
      } catch {
        /* gh unavailable, no existing PR, or auth failure — fall through to create */
      }
    }

    let prResult: { code: number; stdout: string; stderr: string };
    let prUrl: string | null;
    const ghArgs = ["pr", "create", "--draft", "--title", specTitle, "--base", defaultBranch, "--head", branch];
    if (usePrBodyFile) {
      ghArgs.push("--body-file", prBodyFile);
    } else if (fs.existsSync(specFile)) {
      ghArgs.push("--body-file", specFile);
    } else {
      ghArgs.push("--body", `Forge task ${taskId}`);
    }

    if (existingPrUrl) {
      log(`✓ PR already exists for ${branch}: ${existingPrUrl} — skipping create.`);
      prUrl = existingPrUrl;
      prResult = { code: 0, stdout: existingPrUrl, stderr: "" };
    } else {
      prResult = await runShell("gh", ghArgs, { cwd: worktreePath, env: ghEnv });
      prUrl = extractGithubPrUrl(prResult.stdout + "\n" + prResult.stderr);
    }

    if (prUrl) {
      snapshot = { ...snapshot, prUrl };
      // Parse PR number from URL
      const prNumMatch = prUrl.match(/\/pull\/(\d+)$/);
      if (prNumMatch) prNumber = parseInt(prNumMatch[1], 10);

      log(`✓ Draft PR: ${prUrl}`);
      flushSnapshot();
      writeMetaDual();
    } else {
      prCreationFailed = true;
      // Capture the gh stdout/stderr so users can see *why* PR creation
      // failed instead of having to rerun gh by hand. (Original
      // implementation logged "✗ PR creation failed" with no detail.)
      const errorLog = path.join(runDir, "pr-create-error.log");
      const cmdLine = `gh ${ghArgs.map((a) => (/[\s'"]/.test(a) ? `'${a.replace(/'/g, "'\\''")}'` : a)).join(" ")}`;
      const errorBody = [
        `# gh pr create failed`,
        `# command:    ${cmdLine}`,
        `# cwd:        ${worktreePath}`,
        `# exit code:  ${prResult.code}`,
        ghUser || ghHost ? `# gh override: ${ghUser ?? "(default user)"} @ ${ghHost ?? "github.com"}` : "",
        ghResolved.error ? `# gh resolve error: ${ghResolved.error}` : "",
        "",
        "---- stdout ----",
        prResult.stdout || "(empty)",
        "",
        "---- stderr ----",
        prResult.stderr || "(empty)",
        "",
      ]
        .filter((line) => line !== "")
        .join("\n");
      try {
        fs.writeFileSync(errorLog, errorBody, "utf-8");
      } catch {
        /* best-effort */
      }
      const firstLine =
        (prResult.stderr || prResult.stdout || "")
          .split("\n")
          .map((s) => s.trim())
          .find(Boolean) ?? `gh pr create exited ${prResult.code}`;
      const summary = ghResolved.error ?? firstLine.slice(0, 240);
      log(`✗ PR creation failed: ${summary}`);
      log(`  Full output: ${errorLog}`);
      emit({ t: Date.now(), type: "phase_change", from: "creating_pr", to: "failed" });
      emit({
        t: Date.now(),
        type: "stopped",
        exitCode: 1,
        reason: "error",
        errorMessage: `PR creation failed: ${summary}`,
      });
      flushSnapshot();
    }
  } else {
    log(`↻ Skipping PR creation (resume from ${resumeFrom}). Existing PR: ${snapshot.prUrl ?? "(none in meta)"}`);
  } // end if (!skipPrCreate)

  // If PR creation failed, the failure-capture block below already emitted
  // the failed/stopped events. Bail before the reviewer.
  if (prCreationFailed) {
    log(`═══ DONE: ${new Date().toISOString()} ═══`);
    process.exit(1);
  }

  // ── Reviewer (run when a PR exists and reviewer is configured) ─────────────────────────
  if (!skipReviewer && reviewerTarget && reviewerModel && prNumber) {
    // ── Reviewer ──────────────────────────────────────────────────────────
    log("");
    log("═══ REVIEWER ═══");
    // Temporarily set status to reviewing (doesn't change snapshot phase)
    const prevMeta = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
    prevMeta.status = "reviewing";
    atomicWriteJson(metaFile, prevMeta);

    try {
      // Compose reviewer prompt from prefix + dynamic gh output
      const prefixFile = path.join(runDir, "review-prompt-prefix.txt");
      const prefix = fs.existsSync(prefixFile) ? fs.readFileSync(prefixFile, "utf-8") : "";

      let prInfoJson = "{}";
      try {
        prInfoJson = execFileSync(
          "gh",
          [
            "pr",
            "view",
            String(prNumber),
            "--json",
            "number,title,body,headRefName,baseRefName,additions,deletions,changedFiles,url",
          ],
          { cwd: worktreePath, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], env: ghEnv },
        ).trim();
      } catch {
        /* gh unavailable */
      }

      let ciChecks = "(no check status available)";
      try {
        ciChecks =
          execFileSync("gh", ["pr", "checks", String(prNumber)], {
            cwd: worktreePath,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
            env: ghEnv,
          }).trim() || ciChecks;
      } catch {
        /* gh unavailable or no checks */
      }

      let diff = "";
      try {
        diff = execFileSync("gh", ["pr", "diff", String(prNumber)], {
          cwd: worktreePath,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
          maxBuffer: 80 * 1024 * 1024,
          env: ghEnv,
        });
        if (diff.length > 60_000) diff = diff.slice(0, 60_000);
      } catch {
        /* gh unavailable */
      }

      const specSnapshot = (() => {
        const p = path.join(runDir, "spec-snapshot.md");
        return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "(no spec snapshot)";
      })();

      const reviewPrompt = [
        prefix,
        "",
        "## PR metadata",
        "",
        "```json",
        prInfoJson,
        "```",
        "",
        "## CI checks",
        "",
        "```",
        ciChecks,
        "```",
        "",
        "## Linked Forge spec",
        "",
        "```markdown",
        specSnapshot,
        "```",
        "",
        "## Diff",
        "",
        "```diff",
        diff,
        "```",
        "",
        "Now produce the review in a single ```forge-review fenced block per the skill instructions.",
      ].join("\n");

      const reviewPromptPath = path.join(runDir, "review-prompt.txt");
      fs.writeFileSync(reviewPromptPath, reviewPrompt, "utf-8");

      log(`Running reviewer: ${reviewerTarget} / ${reviewerModel}`);
      const { agentCommand } = await import("./launch.js");
      const cmd = agentCommand(reviewerTarget, reviewerModel, reviewPromptPath, {
        reasoningEffort: reviewerReasoningEffort,
      });

      const reviewResult = await runShell("bash", ["-c", cmd], { cwd: worktreePath, env: ghEnv });
      const rawOutput = reviewResult.stdout + reviewResult.stderr;
      fs.writeFileSync(path.join(runDir, "review-raw.md"), rawOutput, "utf-8");

      if (reviewResult.code === 0) {
        // Extract forge-review fenced block
        const blockMatch = rawOutput.match(/```forge-review\s*\n([\s\S]*?)\n```/);
        if (blockMatch) {
          const block = blockMatch[1];
          fs.writeFileSync(path.join(runDir, "review.md"), block, "utf-8");
          const verdictMatch = block.match(/^##\s*Verdict\s*\n\s*(\S+)/m);
          const v = verdictMatch?.[1]?.trim().toLowerCase();
          if (v === "approve" || v === "request-changes" || v === "block") {
            reviewVerdict = v;
            log(`✓ Review verdict: ${v}`);
          } else {
            reviewVerdict = null;
            reviewError = "verdict line missing or unrecognised";
            log("⚠ Verdict line missing or unrecognised");
          }
        } else {
          reviewVerdict = null;
          reviewError = "no fenced forge-review block in reviewer output";
          log("⚠ No fenced forge-review block in reviewer output");
        }
      } else {
        reviewVerdict = null;
        reviewError = `reviewer process exited with code ${reviewResult.code}`;
        log(`⚠ Reviewer process failed (exit ${reviewResult.code})`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      reviewVerdict = null;
      reviewError = `reviewer error: ${msg}`;
      log(`⚠ Reviewer error: ${msg}`);
    }

    // Restore status to done — reviewer failure doesn't poison the run
    writeMetaDual();
  }

  // Final transition for resumed runs (skipPrCreate path) and any other
  // path that didn't already mark done. Idempotent: applyEvent collapses
  // re-entry on "done".
  if (snapshot.phase !== "done" && snapshot.phase !== "failed") {
    emit({ t: Date.now(), type: "phase_change", from: snapshot.phase, to: "done" });
    emit({ t: Date.now(), type: "stopped", exitCode: 0, reason: "completed" });
    flushSnapshot();
  }

  log(`═══ DONE: ${new Date().toISOString()} ═══`);
  process.exit(snapshot.phase === "failed" ? 1 : 0);
}

// ─── Entry point guard ────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const isEntry = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isEntry) {
  const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
  if (nodeMajor < 22) {
    console.error("forge supervisor requires Node 22+; got " + process.versions.node + ". Run `nvm use 22` and retry.");
    process.exit(2);
  }
  main().catch((err) => {
    console.error("Supervisor fatal:", err);
    process.exit(1);
  });
}
