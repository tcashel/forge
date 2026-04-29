/**
 * Forge Supervisor — structured progress tracker for pi-runtime tasks.
 *
 * Runner: `node --experimental-strip-types` from Node 22.
 *   The user's standard is `nvm use 22`. No tsx, no Node 20.
 *
 * Expected pi version: @mariozechner/pi-coding-agent >= 0.70.6
 *   (whatever is installed at the user's global npm root).
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

import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Phase, ProgressEvent, Snapshot } from "./progress.ts";
import { emptySnapshot, applyEvent } from "./progress.ts";
import type { TaskStatus } from "./store.ts";

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
}

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

export function extractGithubPrUrl(stdout: string): string | null {
  const tokens = stdout.split(/\s+/);
  let last: string | null = null;
  for (const tok of tokens) {
    if (tok.startsWith("https://github")) last = tok;
  }
  return last;
}

export function mapPiEvent(
  piEvent: unknown,
  ctx: { currentToolStartedAt: number | null },
): ProgressEvent | null {
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
  opts: { cwd: string; shell?: boolean },
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      cwd: opts.cwd,
      shell: opts.shell ?? false,
      stdio: ["ignore", "pipe", "pipe"],
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
    } catch { /* best effort */ }
    console.error(`Invalid supervisor args: ${e?.message ?? e}`);
    process.exit(2);
  }

  const { taskId, runDir, promptFile, worktreePath, repoName, branch, defaultBranch,
    qualityCommands, model, specTitle, commitMessage, specFile, skipGit } = args;

  // Ensure runDir exists
  fs.mkdirSync(runDir, { recursive: true });

  // State
  let snapshot = emptySnapshot(taskId, Date.now());
  const snapshotFile = path.join(runDir, "snapshot.json");
  const progressFile = path.join(runDir, "progress.jsonl");
  const logFile = path.join(runDir, "agent.log");
  const metaFile = path.join(runDir, "meta.json");

  // Cumulative usage tracking
  let cumulativeUsage = { ...snapshot.usage };
  let turnCount = 0;

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

  // ── Spawn pi ────────────────────────────────────────────────────────────

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
            inputTokens: cumulativeUsage.inputTokens + (usage.input as number ?? 0),
            outputTokens: cumulativeUsage.outputTokens + (usage.output as number ?? 0),
            cacheReadTokens: cumulativeUsage.cacheReadTokens + (usage.cacheRead as number ?? 0),
            cacheWriteTokens: cumulativeUsage.cacheWriteTokens + (usage.cacheWrite as number ?? 0),
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
          log(`usage: ↑${formatTokens(cumulativeUsage.inputTokens)} ↓${formatTokens(cumulativeUsage.outputTokens)} turn ${turnCount}`);
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

  // ── Quality checks ──────────────────────────────────────────────────────

  emit({ t: Date.now(), type: "phase_change", from: "agent", to: "quality_check" });

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

  // ── Git / PR ────────────────────────────────────────────────────────────

  if (skipGit) {
    emit({ t: Date.now(), type: "phase_change", from: "quality_check", to: "done" });
    emit({ t: Date.now(), type: "stopped", exitCode: 0, reason: "completed" });
    flushSnapshot();
    process.exit(0);
  }

  emit({ t: Date.now(), type: "phase_change", from: "quality_check", to: "committing" });
  log("═══ VERIFY COMMITS & PUSH ═══");

  // git add + commit (suppress non-zero if nothing staged)
  try {
    execFileSync("git", ["add", "-A"], { cwd: worktreePath, stdio: "pipe" });
  } catch { /* ignore */ }
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

  // ── Draft PR ────────────────────────────────────────────────────────────

  emit({ t: Date.now(), type: "phase_change", from: "committing", to: "creating_pr" });
  log("═══ CREATING DRAFT PR ═══");

  const ghArgs = ["pr", "create", "--draft", "--title", specTitle, "--base", defaultBranch, "--head", branch];
  if (fs.existsSync(specFile)) {
    ghArgs.push("--body-file", specFile);
  } else {
    ghArgs.push("--body", `Forge task ${taskId}`);
  }

  const prResult = await runShell("gh", ghArgs, { cwd: worktreePath });
  const prUrl = extractGithubPrUrl(prResult.stdout + "\n" + prResult.stderr);

  if (prUrl) {
    snapshot = { ...snapshot, prUrl };
    log(`✓ Draft PR: ${prUrl}`);
    emit({ t: Date.now(), type: "phase_change", from: "creating_pr", to: "done" });
    emit({ t: Date.now(), type: "stopped", exitCode: 0, reason: "completed" });
  } else {
    log("✗ PR creation failed");
    emit({ t: Date.now(), type: "phase_change", from: "creating_pr", to: "failed" });
    emit({
      t: Date.now(),
      type: "stopped",
      exitCode: 1,
      reason: "error",
      errorMessage: "PR creation failed",
    });
  }

  flushSnapshot();
  log(`═══ DONE: ${new Date().toISOString()} ═══`);
  process.exit(snapshot.phase === "failed" ? 1 : 0);
}

// ─── Entry point guard ────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const isEntry = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isEntry) {
  const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
  if (nodeMajor < 22) {
    console.error(
      "forge supervisor requires Node 22+; got " + process.versions.node + ". Run `nvm use 22` and retry.",
    );
    process.exit(2);
  }
  main().catch((err) => {
    console.error("Supervisor fatal:", err);
    process.exit(1);
  });
}
