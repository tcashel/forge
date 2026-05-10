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

/**
 * Structured block of an assistant turn. The plain `text` field on
 * `ChatMessage` is kept (concatenation of all text blocks) for backward
 * compatibility with histories persisted before stream-json mode.
 */
export type ChatBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; toolUseId: string; output: string; isError: boolean; truncated?: boolean };

export interface ChatMessage {
  /** "m_" + 8 hex chars */
  id: string;
  role: ChatRole;
  text: string;
  /** ISO timestamp */
  ts: string;
  /**
   * Optional ordered sequence of blocks for assistant turns. When absent
   * (legacy histories), renderers fall back to plain `text`.
   */
  blocks?: ChatBlock[];
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

const DRAFT_ID_RE = /^d_[0-9a-f]{8}$/;

/**
 * Strict format check matching `newDraftId()`'s output. Used by route
 * handlers to reject malformed/path-traversal `draftId` values before
 * any filesystem operation. `path.join(forgeDir, "plan-drafts", id)`
 * normalizes `..` segments, so without this check a request like
 * `DELETE /api/plan-chat/draft/%2e%2e%2f...` could escape the
 * `plan-drafts` directory.
 */
export function isValidDraftId(s: string): boolean {
  return DRAFT_ID_RE.test(s);
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
   * Working directory for the spawned `claude` subprocess. Should be the
   * selected repo's root so the planner explores the right tree. If
   * omitted the child inherits the server's `process.cwd()` — preserved
   * for backward-compat but almost certainly the wrong directory in
   * production (forge serve is launched from forge's own checkout).
   * Validated by `runChatTurn`: must be an absolute path that exists.
   */
  cwd?: string;
  /**
   * Spawner override for tests — defaults to spawning `claude` directly
   * with argv (no shell). Tests can swap in a stub that emits canned
   * bytes. Receives `(binary, args, cwd)` so tests can assert all three
   * were plumbed correctly.
   */
  spawnImpl?: (binary: string, args: string[], cwd?: string) => ChildProcess;
}

/**
 * Tagged error thrown by `runChatTurn` when an explicit `cwd` is invalid
 * (relative path or missing on disk). Route handlers convert this to a
 * clean SSE `error` event so the user gets "repo not found at <path>"
 * instead of an opaque spawn failure.
 */
export class BadCwdError extends Error {
  readonly code = "BAD_CWD" as const;
  constructor(message: string) {
    super(message);
    this.name = "BadCwdError";
  }
}

export interface RunChatTurnResult {
  stream: ReadableStream<Uint8Array>;
  abort: () => void;
}

const DEFAULT_MODEL = "claude-opus-4-7";

function defaultSpawn(binary: string, args: string[], cwd?: string): ChildProcess {
  // argv-style spawn (no shell). The prompt file is piped to stdin from
  // Node in `runChatTurn` rather than via `< file` shell redirection so
  // the entire command is structurally injection-free — `model` and any
  // other field land as discrete argv entries that bash never sees.
  return spawn(binary, args, { stdio: ["pipe", "pipe", "pipe"], env: process.env, cwd });
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

// ─── stream-json parsing ────────────────────────────────────────────────────

/** Cap on a single tool_result `output` string before we mark it truncated. */
const TOOL_RESULT_MAX_BYTES = 4 * 1024;

/**
 * Stringify and truncate a tool_result `content` payload. Claude returns
 * either a plain string or an array of `{type:"text",text:string}` blocks
 * (occasionally with `image` blocks we don't care about here).
 */
export function summarizeToolResultContent(content: unknown): { output: string; truncated: boolean } {
  let raw: string;
  if (typeof content === "string") {
    raw = content;
  } else if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const block of content) {
      if (block && typeof block === "object" && (block as { type?: string }).type === "text") {
        const t = (block as { text?: unknown }).text;
        if (typeof t === "string") parts.push(t);
      }
    }
    raw = parts.join("\n");
  } else {
    try {
      raw = JSON.stringify(content);
    } catch {
      raw = String(content);
    }
  }
  if (raw.length > TOOL_RESULT_MAX_BYTES) {
    return { output: raw.slice(0, TOOL_RESULT_MAX_BYTES), truncated: true };
  }
  return { output: raw, truncated: false };
}

/**
 * Spawn `claude` in stream-json mode and return an SSE-formatted
 * ReadableStream. The stream emits a small typed vocabulary:
 *   - `event: meta`        data: {sessionId, model, cwd, tools}
 *   - `event: text`        data: {blockId, text, append}
 *   - `event: tool_use`    data: {toolUseId, name, input}
 *   - `event: tool_result` data: {toolUseId, output, isError, truncated}
 *   - `event: rate_limit`  data: {status, resetsAt}
 *   - `event: done`        data: {messageId, fullText, durationMs, totalCostUsd, numTurns}
 *   - `event: error`       data: {message}
 *
 * Side effects: writes the user message to history before spawn, and the
 * assistant message (with both `text` and `blocks`) after a clean `done`.
 * Removes the per-turn prompt file on success; keeps it on failure for
 * debugging.
 */
export function runChatTurn(opts: RunChatTurnOptions): RunChatTurnResult {
  const { forgeDir, scope, message } = opts;
  const model = opts.model ?? DEFAULT_MODEL;
  const spawnFn = opts.spawnImpl ?? defaultSpawn;

  // 0. Validate cwd up front so the caller can convert the failure into
  //    a clean SSE error frame before any history side-effects land.
  if (opts.cwd !== undefined) {
    if (!path.isAbsolute(opts.cwd)) {
      throw new BadCwdError(`repo not found at ${opts.cwd} (not an absolute path)`);
    }
    if (!fs.existsSync(opts.cwd)) {
      throw new BadCwdError(`repo not found at ${opts.cwd}`);
    }
  }

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

  // 3. Spawn claude in stream-json mode so we can surface tool-use
  //    activity in the UI. `--verbose` is required when output-format is
  //    stream-json (claude rejects it otherwise). The prompt is piped to
  //    stdin from Node — argv-only, no shell, so `model` cannot inject.
  const args = [
    "--print",
    "--output-format",
    "stream-json",
    "--verbose",
    "--include-partial-messages",
    "--dangerously-skip-permissions",
    "--model",
    model,
  ];
  const child = spawnFn("claude", args, opts.cwd);

  // Pipe the prompt file into claude's stdin. Defensive error handlers:
  // claude may exit before consuming stdin (bad model, missing binary)
  // and the resulting EPIPE / ENOENT must not crash the server — let
  // the child's `error`/`close` handler surface the failure as an SSE
  // `error` frame instead.
  const childStdin = child.stdin;
  if (childStdin) {
    const promptStream = fs.createReadStream(promptFile);
    promptStream.on("error", () => {});
    childStdin.on("error", () => {});
    promptStream.pipe(childStdin);
  }

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
      let lineBuf = "";
      let stderrBuf = "";
      let closed = false;
      // Accumulator for the assistant turn we'll persist on `done`. Text
      // blocks come as standalone content chunks (usually one per
      // assistant message in non-partial mode); tool_use / tool_result
      // pairs come from separate frames and we interleave them here.
      const turnBlocks: ChatBlock[] = [];
      // Track the index of the last open text block so partial text
      // chunks can append rather than fragment into many tiny blocks.
      let openTextIdx: number | null = null;

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

      const handleEvent = (evt: Record<string, unknown>) => {
        const t = typeof evt.type === "string" ? evt.type : "";
        if (t === "system" && evt.subtype === "init") {
          const tools = Array.isArray(evt.tools) ? (evt.tools as unknown[]).filter((x) => typeof x === "string") : [];
          send("meta", {
            sessionId: typeof evt.session_id === "string" ? evt.session_id : null,
            model: typeof evt.model === "string" ? evt.model : null,
            cwd: typeof evt.cwd === "string" ? evt.cwd : null,
            tools,
          });
          return;
        }
        if (t === "rate_limit_event") {
          const info = (evt.rate_limit_info ?? {}) as Record<string, unknown>;
          send("rate_limit", {
            status: typeof info.status === "string" ? info.status : null,
            resetsAt: typeof info.resetsAt === "number" ? info.resetsAt : null,
          });
          return;
        }
        if (t === "assistant") {
          const msg = evt.message as { content?: unknown[]; id?: string } | undefined;
          if (!msg || !Array.isArray(msg.content)) return;
          for (const block of msg.content) {
            if (!block || typeof block !== "object") continue;
            const b = block as Record<string, unknown>;
            if (b.type === "text" && typeof b.text === "string") {
              const text = b.text;
              // Treat each fresh text block as a standalone segment.
              // Partial-message frames re-emit the same block id with
              // accumulated text — we collapse them by replacing the
              // current open block's content.
              if (openTextIdx === null) {
                turnBlocks.push({ type: "text", text });
                openTextIdx = turnBlocks.length - 1;
              } else {
                const cur = turnBlocks[openTextIdx];
                if (cur.type === "text") cur.text = text;
              }
              const blockId = `${msg.id ?? "msg"}_${openTextIdx}`;
              send("text", { blockId, text, append: false });
            } else if (b.type === "tool_use" && typeof b.id === "string" && typeof b.name === "string") {
              turnBlocks.push({ type: "tool_use", id: b.id, name: b.name, input: b.input });
              // A tool_use ends any open text block — subsequent text
              // chunks should start fresh below it.
              openTextIdx = null;
              send("tool_use", { toolUseId: b.id, name: b.name, input: b.input });
            }
          }
          return;
        }
        if (t === "user") {
          const msg = evt.message as { content?: unknown[] } | undefined;
          if (!msg || !Array.isArray(msg.content)) return;
          for (const block of msg.content) {
            if (!block || typeof block !== "object") continue;
            const b = block as Record<string, unknown>;
            if (b.type === "tool_result" && typeof b.tool_use_id === "string") {
              const { output, truncated } = summarizeToolResultContent(b.content);
              const isError = b.is_error === true;
              turnBlocks.push({
                type: "tool_result",
                toolUseId: b.tool_use_id,
                output,
                isError,
                truncated: truncated || undefined,
              });
              send("tool_result", { toolUseId: b.tool_use_id, output, isError, truncated });
            }
          }
          return;
        }
        if (t === "result") {
          // Handled at child-close — we have the assistant message
          // ready to persist regardless of whether `result` arrived
          // first or got cut off.
          return;
        }
        // Anything else (e.g. future event types) — ignore.
      };

      const flushLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let parsed: unknown;
        try {
          parsed = JSON.parse(trimmed);
        } catch (e) {
          // Skip malformed line — log to server stderr but don't kill the
          // stream (forward-compatible with future event shapes).
          const msg = e instanceof Error ? e.message : String(e);
          process.stderr.write(`plan-chat: skipping malformed stream-json line: ${msg}\n`);
          return;
        }
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          handleEvent(parsed as Record<string, unknown>);
        }
      };

      child.stdout?.on("data", (chunk: Buffer) => {
        lineBuf += chunk.toString("utf-8");
        let nl = lineBuf.indexOf("\n");
        while (nl !== -1) {
          const line = lineBuf.slice(0, nl);
          lineBuf = lineBuf.slice(nl + 1);
          flushLine(line);
          nl = lineBuf.indexOf("\n");
        }
      });

      child.stderr?.on("data", (chunk: Buffer) => {
        stderrBuf += chunk.toString("utf-8");
      });

      child.on("error", (err) => {
        send("error", { message: `spawn error: ${err.message}` });
        close();
      });

      child.on("close", (code, signal) => {
        // Drain any trailing partial line — some claude versions don't
        // newline-terminate their final event.
        if (lineBuf.length > 0) {
          flushLine(lineBuf);
          lineBuf = "";
        }
        if (cancelled) {
          // Client disconnected; emit nothing, just tear down.
          close();
          return;
        }
        const fullText = turnBlocks
          .filter((b): b is { type: "text"; text: string } => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        if (code === 0 && (turnBlocks.length > 0 || fullText.length > 0)) {
          const assistantMsg: ChatMessage = {
            id: newMessageId(),
            role: "assistant",
            text: fullText,
            ts: new Date().toISOString(),
            blocks: turnBlocks,
          };
          try {
            appendMessage(forgeDir, scope, assistantMsg);
            // Clean up the prompt file on success.
            try {
              fs.rmSync(promptFile, { force: true });
            } catch {
              /* noop */
            }
            send("done", {
              messageId: assistantMsg.id,
              fullText,
              durationMs: null,
              totalCostUsd: null,
              numTurns: null,
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            send("error", { message: `failed to persist assistant message: ${msg}` });
          }
        } else {
          // Non-zero exit OR no content — keep the prompt file for debug.
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
