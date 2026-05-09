/**
 * forge plan-chat — backend for the Workbench's in-page planner chat.
 *
 * Spawns the `claude` CLI per turn and streams its stdout as Server-Sent
 * Events. Persists chat history under either:
 *   - `~/.forge/specs/<taskId>/plan-history.json`  (existing spec)
 *   - `~/.forge/plan-drafts/<draftId>/history.json` (new-spec modal)
 *
 * Each turn writes a transient prompt file (`turn-<N>.txt`) inside the
 * scope directory with the SKILL preamble + transcript-so-far + the new
 * user message. On exit-code-0 we delete it; on failure we keep it for
 * post-mortem.
 *
 * **Security:** the spawned `claude` runs with
 * `--dangerously-skip-permissions` to match the convention in
 * `src/core/launch.ts:agentCommand` for non-interactive forge agents.
 * The chat agent inherits the user's environment and can read the
 * project. Bound by the 5-minute reaper in `reapStalePlanChats`.
 */

import { type ChildProcess, spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteJSON, atomicWriteText } from "./atomic-write.ts";
import { withFileLock } from "./file-lock.ts";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  /** "m_" + 8 hex chars */
  id: string;
  role: ChatRole;
  text: string;
  /** ISO timestamp */
  ts: string;
}

export interface PlanHistory {
  version: 1;
  messages: ChatMessage[];
}

export type ScopeKind = "spec" | "draft";

export interface ScopeRef {
  kind: ScopeKind;
  id: string;
}

// ─── ID helpers ─────────────────────────────────────────────────────────────

function randomHex(len: number): string {
  let out = "";
  while (out.length < len) {
    out += Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
  }
  return out.slice(0, len);
}

export function newMessageId(): string {
  return `m_${randomHex(8)}`;
}

export function newDraftId(): string {
  return `d_${randomHex(8)}`;
}

// ─── Path helpers ───────────────────────────────────────────────────────────

function specChatDir(forgeDir: string, taskId: string): string {
  return path.join(forgeDir, "specs", taskId);
}

function draftDir(forgeDir: string, draftId: string): string {
  return path.join(forgeDir, "plan-drafts", draftId);
}

function chatDirFor(forgeDir: string, scope: ScopeRef): string {
  return scope.kind === "spec" ? specChatDir(forgeDir, scope.id) : draftDir(forgeDir, scope.id);
}

function historyPath(forgeDir: string, scope: ScopeRef): string {
  if (scope.kind === "spec") return path.join(specChatDir(forgeDir, scope.id), "plan-history.json");
  return path.join(draftDir(forgeDir, scope.id), "history.json");
}

function ensureChatDir(forgeDir: string, scope: ScopeRef): string {
  const dir = chatDirFor(forgeDir, scope);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ─── History (load / append / wipe) ─────────────────────────────────────────

const EMPTY_HISTORY: PlanHistory = { version: 1, messages: [] };

export function loadHistory(forgeDir: string, scope: ScopeRef): PlanHistory {
  const p = historyPath(forgeDir, scope);
  if (!fs.existsSync(p)) return { ...EMPTY_HISTORY, messages: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(p, "utf-8")) as Partial<PlanHistory>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.messages)) {
      return { ...EMPTY_HISTORY, messages: [] };
    }
    return { version: 1, messages: parsed.messages as ChatMessage[] };
  } catch {
    return { ...EMPTY_HISTORY, messages: [] };
  }
}

/**
 * Atomically append a message to the on-disk history. Held under a
 * per-scope file lock so an in-flight `done`-event append can't race a
 * `DELETE /plan-history` wipe.
 */
export function appendMessage(forgeDir: string, scope: ScopeRef, message: ChatMessage): void {
  ensureChatDir(forgeDir, scope);
  const p = historyPath(forgeDir, scope);
  withFileLock(`${p}.lock`, () => {
    const cur = loadHistory(forgeDir, scope);
    cur.messages.push(message);
    atomicWriteJSON(p, cur);
  });
}

export function wipeHistory(forgeDir: string, scope: ScopeRef): void {
  const p = historyPath(forgeDir, scope);
  withFileLock(`${p}.lock`, () => {
    if (fs.existsSync(p)) fs.rmSync(p, { force: true });
  });
}

// ─── Drafts ─────────────────────────────────────────────────────────────────

export interface CreateDraftResult {
  draftId: string;
}

export function createDraft(forgeDir: string): CreateDraftResult {
  const draftId = newDraftId();
  const dir = draftDir(forgeDir, draftId);
  fs.mkdirSync(dir, { recursive: true });
  atomicWriteJSON(path.join(dir, "history.json"), { version: 1, messages: [] });
  return { draftId };
}

export function deleteDraft(forgeDir: string, draftId: string): void {
  const dir = draftDir(forgeDir, draftId);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Move a draft folder onto the spec scope — called by the new-spec save
 * flow once the spec has been persisted and a taskId minted.
 *
 * Atomic on the same filesystem; falls back to a copy + rm if rename fails
 * (different mounts / cross-device link). After rename the file is
 * renamed `plan-history.json` to match the spec layout.
 */
export function promoteDraft(forgeDir: string, draftId: string, taskId: string): void {
  const draftRoot = draftDir(forgeDir, draftId);
  const draftHistory = path.join(draftRoot, "history.json");
  if (!fs.existsSync(draftHistory)) return; // nothing to promote — no-op

  const specDir = specChatDir(forgeDir, taskId);
  fs.mkdirSync(specDir, { recursive: true });
  const target = path.join(specDir, "plan-history.json");

  if (fs.existsSync(target)) {
    // Don't clobber an existing history file. Caller is wrong to call us.
    throw new Error(`promoteDraft: spec ${taskId} already has a plan-history.json — refusing to overwrite.`);
  }

  try {
    fs.renameSync(draftHistory, target);
  } catch {
    // Cross-device — copy + unlink fallback.
    fs.copyFileSync(draftHistory, target);
    fs.rmSync(draftHistory, { force: true });
  }
  // Clean up the now-empty draft folder (and any leftover prompt files).
  fs.rmSync(draftRoot, { recursive: true, force: true });
}

// ─── SKILL prompt cache ─────────────────────────────────────────────────────

let skillPromptCache: string | null = null;

/**
 * Load `skills/forge-planner/SKILL.md` (and `schema.md` if present) from
 * the source tree. Cached after first load — the files don't change at
 * runtime.
 */
export function loadSkillPrompt(): string {
  if (skillPromptCache !== null) return skillPromptCache;

  const here = path.dirname(fileURLToPath(import.meta.url));
  // src/core/plan-chat.ts → repo root is two levels up.
  const skillsDir = path.join(here, "..", "..", "skills", "forge-planner");
  const skillFile = path.join(skillsDir, "SKILL.md");
  const schemaFile = path.join(skillsDir, "schema.md");

  let text = "";
  if (fs.existsSync(skillFile)) {
    text += fs.readFileSync(skillFile, "utf-8").trimEnd();
    text += "\n";
  }
  if (fs.existsSync(schemaFile)) {
    text += "\n---\n\n";
    text += fs.readFileSync(schemaFile, "utf-8").trimEnd();
    text += "\n";
  }
  skillPromptCache = text;
  return text;
}

// ─── In-flight subprocess registry ──────────────────────────────────────────

interface InFlightEntry {
  child: ChildProcess;
  startedAt: number;
  promptFile: string;
  scope: ScopeRef;
}

const inFlight = new Map<string, InFlightEntry>();

function inFlightKey(scope: ScopeRef): string {
  return `${scope.kind}:${scope.id}`;
}

/**
 * Kill an in-flight subprocess for a given scope, if any. Returns true if
 * a process was found and signalled.
 */
export function abortInFlight(scope: ScopeRef): boolean {
  const key = inFlightKey(scope);
  const entry = inFlight.get(key);
  if (!entry) return false;
  try {
    entry.child.kill("SIGTERM");
  } catch {
    /* already dead */
  }
  inFlight.delete(key);
  return true;
}

// ─── Prompt building ────────────────────────────────────────────────────────

function buildTurnPrompt(opts: {
  skill: string;
  history: ChatMessage[];
  newUser: ChatMessage;
  specBody: string | null;
}): string {
  const parts: string[] = [];
  parts.push("# Planner skill\n");
  parts.push(opts.skill.trimEnd());
  parts.push("\n");
  if (opts.specBody) {
    parts.push("# Current spec body\n");
    parts.push("```markdown");
    parts.push(opts.specBody.trimEnd());
    parts.push("```\n");
  }
  parts.push("# Conversation\n");
  for (const msg of opts.history) {
    parts.push(`## ${msg.role === "user" ? "User" : "Assistant"} (${msg.ts})`);
    parts.push("");
    parts.push(msg.text.trimEnd());
    parts.push("");
  }
  parts.push(`## User (${opts.newUser.ts})`);
  parts.push("");
  parts.push(opts.newUser.text.trimEnd());
  parts.push("");
  parts.push("## Assistant");
  parts.push("");
  return parts.join("\n");
}

// ─── SSE chat turn ──────────────────────────────────────────────────────────

export interface RunChatTurnOptions {
  forgeDir: string;
  scope: ScopeRef;
  message: string;
  /** Override model. Falls back to repoConfig.defaultModel then DEFAULT_MODEL. */
  model?: string;
  /** Optional spec body to seed the planner with task context. */
  specBody?: string | null;
  /**
   * Spawner override for tests — defaults to the real `claude` binary
   * via `bash -lc`. Tests can swap in a stub that emits canned bytes.
   */
  spawnImpl?: (cmd: string) => ChildProcess;
}

export interface RunChatTurnResult {
  stream: ReadableStream<Uint8Array>;
  abort: () => void;
}

const DEFAULT_MODEL = "claude-opus-4-7";

function defaultSpawn(cmd: string): ChildProcess {
  return spawn("bash", ["-lc", cmd], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
}

function nextTurnNumber(chatDir: string): number {
  if (!fs.existsSync(chatDir)) return 1;
  let max = 0;
  for (const name of fs.readdirSync(chatDir)) {
    const m = name.match(/^plan-turn-(\d+)\.txt$/) ?? name.match(/^turn-(\d+)\.txt$/);
    if (m) {
      const n = Number.parseInt(m[1], 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return max + 1;
}

function turnPromptFile(chatDir: string, scope: ScopeRef, turn: number): string {
  // Spec layout uses `plan-turn-N.txt` to namespace alongside other run
  // artifacts; drafts use the simpler `turn-N.txt`.
  const name = scope.kind === "spec" ? `plan-turn-${turn}.txt` : `turn-${turn}.txt`;
  return path.join(chatDir, name);
}

/**
 * Spawn `claude` with the per-turn prompt, return an SSE-formatted
 * ReadableStream. The stream emits:
 *   - `event: delta data: {"text": "..."}` for each stdout chunk
 *   - `event: done  data: {"messageId": "...", "fullText": "..."}` on success
 *   - `event: error data: {"message": "..."}` on failure
 *
 * Side effects: writes the user message to history before spawn, and the
 * assistant message after a clean `done`. Removes the per-turn prompt
 * file on success; keeps it on failure for debugging.
 */
export function runChatTurn(opts: RunChatTurnOptions): RunChatTurnResult {
  const { forgeDir, scope, message } = opts;
  const model = opts.model ?? DEFAULT_MODEL;
  const spawnFn = opts.spawnImpl ?? defaultSpawn;

  // 1. Append the user message to history immediately so a refresh
  //    mid-stream still sees it.
  const userMsg: ChatMessage = {
    id: newMessageId(),
    role: "user",
    text: message,
    ts: new Date().toISOString(),
  };
  appendMessage(forgeDir, scope, userMsg);

  // 2. Build prompt: SKILL preamble + (optional) spec body + transcript + new user turn.
  const skill = loadSkillPrompt();
  const history = loadHistory(forgeDir, scope).messages.filter((m) => m.id !== userMsg.id);
  const promptText = buildTurnPrompt({ skill, history, newUser: userMsg, specBody: opts.specBody ?? null });

  const chatDir = ensureChatDir(forgeDir, scope);
  const turnNum = nextTurnNumber(chatDir);
  const promptFile = turnPromptFile(chatDir, scope, turnNum);
  atomicWriteText(promptFile, promptText);

  // 3. Spawn claude. Mirrors agentCommand("claude", model, file) from
  //    src/core/launch.ts:92.
  const escapedModel = model.replace(/"/g, '\\"');
  const escapedPath = promptFile.replace(/"/g, '\\"');
  const cmd = `claude --print --dangerously-skip-permissions --model "${escapedModel}" < "${escapedPath}"`;
  const child = spawnFn(cmd);

  const key = inFlightKey(scope);
  // If someone left a stale entry around (the abort handler ran but the
  // child outlived it), nuke it now.
  const prev = inFlight.get(key);
  if (prev) {
    try {
      prev.child.kill("SIGTERM");
    } catch {
      /* noop */
    }
  }
  inFlight.set(key, { child, startedAt: Date.now(), promptFile, scope });

  let cancelled = false;
  let cleanup: () => void = () => {};

  const enc = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let stdoutBuf = "";
      let stderrBuf = "";
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(enc.encode(payload));
        } catch {
          /* controller already closed */
        }
      };

      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* noop */
        }
        if (inFlight.get(key)?.child === child) inFlight.delete(key);
      };
      cleanup = close;

      child.stdout?.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf-8");
        stdoutBuf += text;
        send("delta", { text });
      });

      child.stderr?.on("data", (chunk: Buffer) => {
        stderrBuf += chunk.toString("utf-8");
      });

      child.on("error", (err) => {
        send("error", { message: `spawn error: ${err.message}` });
        close();
      });

      child.on("close", (code, signal) => {
        if (cancelled) {
          // Client disconnected; emit nothing, just tear down.
          close();
          return;
        }
        if (code === 0 && stdoutBuf.length > 0) {
          const assistantMsg: ChatMessage = {
            id: newMessageId(),
            role: "assistant",
            text: stdoutBuf,
            ts: new Date().toISOString(),
          };
          try {
            appendMessage(forgeDir, scope, assistantMsg);
            // Clean up the prompt file on success.
            try {
              fs.rmSync(promptFile, { force: true });
            } catch {
              /* noop */
            }
            send("done", { messageId: assistantMsg.id, fullText: stdoutBuf });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            send("error", { message: `failed to persist assistant message: ${msg}` });
          }
        } else {
          // Non-zero exit OR no stdout — keep the prompt file for debug.
          const why = signal
            ? `claude exited via signal ${signal}`
            : code !== 0
              ? `claude exited with code ${code}${stderrBuf ? `: ${stderrBuf.trim().slice(0, 500)}` : ""}`
              : "claude produced no output";
          send("error", { message: why });
        }
        close();
      });
    },
    cancel() {
      cancelled = true;
      try {
        child.kill("SIGTERM");
      } catch {
        /* noop */
      }
      cleanup();
    },
  });

  return {
    stream,
    abort: () => {
      cancelled = true;
      try {
        child.kill("SIGTERM");
      } catch {
        /* noop */
      }
      cleanup();
    },
  };
}

// ─── Reaper ─────────────────────────────────────────────────────────────────

const STALE_PLAN_CHAT_MS = 5 * 60_000;

/**
 * Kill any plan-chat subprocess older than 5 minutes and drop its
 * in-flight registry entry. Also sweeps stale per-turn prompt files (no
 * matching subprocess, mtime older than 5 min) under both the spec and
 * draft trees so they don't accumulate.
 */
export function reapStalePlanChats(forgeDir: string): number {
  const now = Date.now();
  let swept = 0;

  // 1. Live in-flight processes past the deadline.
  for (const [key, entry] of inFlight.entries()) {
    if (now - entry.startedAt < STALE_PLAN_CHAT_MS) continue;
    try {
      entry.child.kill("SIGTERM");
    } catch {
      /* already dead */
    }
    inFlight.delete(key);
    swept++;
  }

  // 2. Stale prompt files (no matching live process, on-disk for >5min).
  const liveFiles = new Set<string>();
  for (const e of inFlight.values()) liveFiles.add(e.promptFile);

  const sweepDir = (dir: string, predicate: (name: string) => boolean) => {
    if (!fs.existsSync(dir)) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (!ent.isFile() || !predicate(ent.name)) continue;
      const full = path.join(dir, ent.name);
      if (liveFiles.has(full)) continue;
      try {
        const st = fs.statSync(full);
        if (now - st.mtimeMs < STALE_PLAN_CHAT_MS) continue;
        fs.rmSync(full, { force: true });
        swept++;
      } catch {
        /* noop */
      }
    }
  };

  // Spec scope: `<forgeDir>/specs/<id>/plan-turn-N.txt`
  const specsRoot = path.join(forgeDir, "specs");
  if (fs.existsSync(specsRoot)) {
    let specEntries: fs.Dirent[] = [];
    try {
      specEntries = fs.readdirSync(specsRoot, { withFileTypes: true });
    } catch {
      specEntries = [];
    }
    for (const ent of specEntries) {
      if (!ent.isDirectory()) continue;
      sweepDir(path.join(specsRoot, ent.name), (n) => /^plan-turn-\d+\.txt$/.test(n));
    }
  }

  // Draft scope: `<forgeDir>/plan-drafts/<draftId>/turn-N.txt`
  const draftsRoot = path.join(forgeDir, "plan-drafts");
  if (fs.existsSync(draftsRoot)) {
    let draftEntries: fs.Dirent[] = [];
    try {
      draftEntries = fs.readdirSync(draftsRoot, { withFileTypes: true });
    } catch {
      draftEntries = [];
    }
    for (const ent of draftEntries) {
      if (!ent.isDirectory()) continue;
      sweepDir(path.join(draftsRoot, ent.name), (n) => /^turn-\d+\.txt$/.test(n));
    }
  }

  return swept;
}

/** Test helper — fully clears in-flight state. Not exported via index. */
export function _resetInFlightForTests(): void {
  for (const entry of inFlight.values()) {
    try {
      entry.child.kill("SIGKILL");
    } catch {
      /* noop */
    }
  }
  inFlight.clear();
}
