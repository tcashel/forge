/**
 * forge plan-chat — backend for the Workbench's in-page planner chat.
 *
 * Spawns the `claude` CLI per turn and streams its stdout as Server-Sent
 * Events. Persists chat history under either:
 *   - `~/.forge/specs/<planId>/plan-history.json`  (existing spec)
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

import type { ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultAgentSpawn, type AgentSpawnImpl, locateTranscript, mintNativeSession, planChatInvocation } from "./agents/index.ts";
import { atomicWriteJSON, atomicWriteText } from "./atomic-write.ts";
import { parseResultEvent } from "./claude-stream.ts";
import type { ForgeDb } from "./db/connection.ts";
import { draftingSessionId, finalizeSession, upsertSession } from "./db/writes.ts";
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

export interface ConversationPointer {
  version: 1;
  agent: "claude";
  sessionId: string;
  cwd: string | null;
  model: string | null;
  started: boolean;
  createdAt: string;
  updatedAt: string;
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

function specChatDir(forgeDir: string, planId: string): string {
  return path.join(forgeDir, "specs", planId);
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

function conversationPointerPath(forgeDir: string, scope: ScopeRef): string {
  return path.join(chatDirFor(forgeDir, scope), "conversation.json");
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
  sessionId: string;
}

export function createDraft(forgeDir: string): CreateDraftResult {
  const draftId = newDraftId();
  const dir = draftDir(forgeDir, draftId);
  fs.mkdirSync(dir, { recursive: true });
  atomicWriteJSON(path.join(dir, "history.json"), { version: 1, messages: [] });
  const pointer = createConversationPointer(forgeDir, { kind: "draft", id: draftId });
  return { draftId, sessionId: pointer.sessionId };
}

export function deleteDraft(forgeDir: string, draftId: string): void {
  const dir = draftDir(forgeDir, draftId);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Move a draft folder onto the spec scope — called by the new-spec save
 * flow once the spec has been persisted and a planId minted.
 *
 * Atomic on the same filesystem; falls back to a copy + rm if rename fails
 * (different mounts / cross-device link). After rename the file is
 * renamed `plan-history.json` to match the spec layout.
 */
export function promoteDraft(forgeDir: string, draftId: string, planId: string): void {
  const draftRoot = draftDir(forgeDir, draftId);
  const draftHistory = path.join(draftRoot, "history.json");
  if (!fs.existsSync(draftHistory)) return; // nothing to promote — no-op

  const specDir = specChatDir(forgeDir, planId);
  fs.mkdirSync(specDir, { recursive: true });
  const target = path.join(specDir, "plan-history.json");

  if (fs.existsSync(target)) {
    // Don't clobber an existing history file. Caller is wrong to call us.
    throw new Error(`promoteDraft: spec ${planId} already has a plan-history.json — refusing to overwrite.`);
  }

  try {
    fs.renameSync(draftHistory, target);
  } catch {
    // Cross-device — copy + unlink fallback.
    fs.copyFileSync(draftHistory, target);
    fs.rmSync(draftHistory, { force: true });
  }

  const draftPointer = readConversationPointer(forgeDir, { kind: "draft", id: draftId });
  if (draftPointer) {
    const promotedPointer = { ...draftPointer, updatedAt: new Date().toISOString() };
    writeConversationPointer(forgeDir, { kind: "spec", id: planId }, promotedPointer);
    copyNativeTranscriptSnapshot(forgeDir, { kind: "spec", id: planId }, promotedPointer);
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

// ─── Native conversation pointer + prompt seeding ───────────────────────────

function readConversationPointer(forgeDir: string, scope: ScopeRef): ConversationPointer | null {
  const p = conversationPointerPath(forgeDir, scope);
  if (!fs.existsSync(p)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(p, "utf-8")) as Partial<ConversationPointer>;
    if (parsed.version !== 1 || parsed.agent !== "claude" || typeof parsed.sessionId !== "string") return null;
    return {
      version: 1,
      agent: "claude",
      sessionId: parsed.sessionId,
      cwd: typeof parsed.cwd === "string" ? parsed.cwd : null,
      model: typeof parsed.model === "string" ? parsed.model : null,
      started: parsed.started === true,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date().toISOString(),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeConversationPointer(forgeDir: string, scope: ScopeRef, pointer: ConversationPointer): void {
  ensureChatDir(forgeDir, scope);
  atomicWriteJSON(conversationPointerPath(forgeDir, scope), pointer);
}

function createConversationPointer(forgeDir: string, scope: ScopeRef, patch: { cwd?: string | null; model?: string | null } = {}): ConversationPointer {
  const session = mintNativeSession("claude");
  const now = new Date().toISOString();
  const pointer: ConversationPointer = {
    version: 1,
    agent: "claude",
    sessionId: session.sessionId,
    cwd: patch.cwd ?? null,
    model: patch.model ?? null,
    started: false,
    createdAt: now,
    updatedAt: now,
  };
  writeConversationPointer(forgeDir, scope, pointer);
  return pointer;
}

function getOrCreateConversationPointer(
  forgeDir: string,
  scope: ScopeRef,
  patch: { cwd?: string; model: string },
): ConversationPointer {
  const existing = readConversationPointer(forgeDir, scope);
  const now = new Date().toISOString();
  if (existing) {
    const updated: ConversationPointer = {
      ...existing,
      cwd: patch.cwd ?? existing.cwd,
      model: patch.model,
      updatedAt: now,
    };
    writeConversationPointer(forgeDir, scope, updated);
    return updated;
  }
  return createConversationPointer(forgeDir, scope, { cwd: patch.cwd ?? null, model: patch.model });
}

function markConversationStarted(forgeDir: string, scope: ScopeRef): void {
  const pointer = readConversationPointer(forgeDir, scope);
  if (!pointer || pointer.started) return;
  writeConversationPointer(forgeDir, scope, { ...pointer, started: true, updatedAt: new Date().toISOString() });
}

function buildInitialTurnPrompt(opts: { skill: string; newUser: ChatMessage; specBody: string | null }): string {
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
  parts.push("# User turn\n");
  parts.push(opts.newUser.text.trimEnd());
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
  spawnImpl?: AgentSpawnImpl;
  /**
   * Idle keepalive interval (ms). The SSE response writes a `: hb\n\n`
   * comment line whenever there's been no outbound traffic for this
   * long, so WebKit `fetch` and intermediate proxies don't time out the
   * read during long quiet stretches (tool calls, model thinking).
   * Defaults to 15s. Tests can pass a small value to exercise the path;
   * pass 0 to disable.
   */
  heartbeatIntervalMs?: number;
  /**
   * SQLite handle used to write a `purpose='drafting'` session row at
   * spawn and finalize it on exit. Omitted in tests that don't need
   * Agent Activity coverage.
   */
  db?: ForgeDb;
  /** Test seam for transcript lookup. Production uses Claude's default config dir. */
  transcriptConfigDir?: string;
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

const DEFAULT_MODEL = "claude-opus-4-8";

function defaultSpawn(binary: string, args: string[], cwd?: string): ChildProcess {
  // argv-style spawn (no shell). The prompt file is piped to stdin from
  // Node in `runChatTurn` rather than via `< file` shell redirection so
  // the entire command is structurally injection-free — `model` and any
  // other field land as discrete argv entries that bash never sees.
  return defaultAgentSpawn(binary, args, cwd);
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

function transcriptSnapshotPath(forgeDir: string, planId: string): string {
  return path.join(specChatDir(forgeDir, planId), "native-transcript.jsonl");
}

function copyNativeTranscriptSnapshot(
  forgeDir: string,
  scope: ScopeRef,
  pointer: ConversationPointer,
  opts: { configDir?: string } = {},
): void {
  if (scope.kind !== "spec" || !pointer.started) return;
  const src = locateTranscript({ agent: "claude", sessionId: pointer.sessionId }, { configDir: opts.configDir });
  fs.copyFileSync(src, transcriptSnapshotPath(forgeDir, scope.id));
}

// ─── stream-json parsing ────────────────────────────────────────────────────

/** Cap on a single tool_result `output` string before we mark it truncated. */
const TOOL_RESULT_MAX_BYTES = 4 * 1024;

/** Max bytes of stderr forwarded to the client in an `error` SSE frame. */
const STDERR_TAIL_MAX = 500;

/** Take the first non-empty line of `text` so the banner summary stays compact. */
function firstLine(text: string): string {
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t.length > 0) return t.length > 200 ? `${t.slice(0, 200)}…` : t;
  }
  return "";
}

/**
 * Trim the trailing slice of `stderrBuf` to ≤500 chars and strip C0/C1
 * control characters except `\n` and `\t` — preserves newlines so the UI
 * can render multi-line stderr legibly while keeping ANSI escapes and
 * terminal-control noise out of the JSON payload.
 */
export function cleanStderrTail(stderrBuf: string): string | null {
  if (!stderrBuf) return null;
  const sliced = stderrBuf.slice(-STDERR_TAIL_MAX);
  let out = "";
  for (let i = 0; i < sliced.length; i++) {
    const code = sliced.charCodeAt(i);
    // Keep \t (0x09) and \n (0x0a) so multi-line stderr stays legible.
    // Drop other C0 controls (0x00-0x1f), DEL (0x7f), and C1 (0x80-0x9f) —
    // they'd otherwise smuggle ANSI escapes / terminal noise into JSON.
    if (code === 0x09 || code === 0x0a) {
      out += sliced[i];
    } else if (code < 0x20 || code === 0x7f || (code >= 0x80 && code <= 0x9f)) {
    } else {
      out += sliced[i];
    }
  }
  const trimmed = out.trim();
  return trimmed.length > 0 ? trimmed : null;
}

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
 *   - `event: done`        data: {messageId, fullText, durationMs, totalCostUsd, numTurns, stopReason}
 *   - `event: error`       data: {message, exitCode, signal, stderrTail, promptFile}
 *
 * Also writes periodic SSE comment lines (`: hb\n\n`) to keep WebKit
 * fetch and intermediate proxies from timing out the read during long
 * quiet stretches (e.g. multi-minute tool calls). CLI `ping` events and
 * `system/api_retry` notices are forwarded as SSE comments for the same
 * reason. Comments are ignored by SSE consumers.
 *
 * Side effects:
 *  - Writes the user message to history before spawn.
 *  - On clean exit (code 0) with any accumulated content, persists the
 *    assistant message (with both `text` and `blocks`) — even when the
 *    client already disconnected. That way a transient SSE break (browser
 *    fetch dropping mid-stream) doesn't lose the agent's reply.
 *  - On non-zero exit or signal-terminated exit, does NOT persist the
 *    partial turn (so a re-send doesn't inherit poisoned context) and
 *    emits a structured `error` SSE frame whose payload includes
 *    `exitCode`, `signal`, `stderrTail`, and the retained prompt file
 *    path so the UI can show the user what actually went wrong instead
 *    of a generic network error.
 *  - Removes the per-turn prompt file on success; keeps it on failure
 *    for debugging.
 */
export function runChatTurn(opts: RunChatTurnOptions): RunChatTurnResult {
  const { forgeDir, scope, message } = opts;
  const model = opts.model ?? DEFAULT_MODEL;
  const spawnFn = opts.spawnImpl ?? defaultSpawn;
  const heartbeatIntervalMs = opts.heartbeatIntervalMs ?? 15_000;

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

  const pointer = getOrCreateConversationPointer(forgeDir, scope, { cwd: opts.cwd, model });

  // 1. Append the user message to history immediately so a refresh
  //    mid-stream still sees it. Continuity now comes from Claude's native
  //    session; this JSON history remains a compatibility display cache.
  const userMsg: ChatMessage = {
    id: newMessageId(),
    role: "user",
    text: message,
    ts: new Date().toISOString(),
  };
  appendMessage(forgeDir, scope, userMsg);

  // 2. First turn seeds the planner skill/spec into the native session.
  //    Subsequent turns send only the new user turn and resume the agent's
  //    own context instead of replaying Forge's lossy history.
  const skill = loadSkillPrompt();
  const promptText = pointer.started
    ? userMsg.text
    : buildInitialTurnPrompt({ skill, newUser: userMsg, specBody: opts.specBody ?? null });

  const chatDir = ensureChatDir(forgeDir, scope);
  const turnNum = nextTurnNumber(chatDir);
  const promptFile = turnPromptFile(chatDir, scope, turnNum);
  atomicWriteText(promptFile, promptText);

  // 3. Spawn claude in stream-json mode so we can surface tool-use
  //    activity in the UI. `--verbose` is required when output-format is
  //    stream-json (claude rejects it otherwise). The prompt is piped to
  //    stdin from Node — argv-only, no shell, so `model` cannot inject.
  const invocation = planChatInvocation(model, { sessionId: pointer.sessionId, resume: pointer.started });
  const args = invocation.args;
  const child = spawnFn(invocation.binary, invocation.args, opts.cwd);

  // Record an Agent Activity row for this chat turn. Failure is non-fatal
  // — the planner still streams; the row just won't appear in the dashboard.
  const sessionId = draftingSessionId(scope.id);
  const sessionStartedAt = new Date().toISOString();
  if (opts.db) {
    try {
      upsertSession(opts.db.db, {
        id: sessionId,
        purpose: "drafting",
        relatedId: scope.id,
        agentAdapter: "claude",
        model,
        startedAt: sessionStartedAt,
        state: "running",
        pid: child.pid ?? null,
        cwd: opts.cwd ?? null,
        commandLine: `claude ${args.join(" ")}`,
        metrics: { scopeKind: scope.kind },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`plan-chat: upsertSession failed: ${msg}\n`);
    }
  }

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
      // Map (msgId, contentIdx) → turnBlocks index. With
      // `--include-partial-messages`, claude re-emits the same content
      // block at the same index across frames with growing text; we
      // collapse those into the existing turnBlocks entry. Distinct
      // blocks (different content positions, possibly within the same
      // assistant message) get their own entries — without this keying,
      // a content array like `[{text:A},{text:B}]` would clobber A.
      const blockIndexByKey = new Map<string, number>();

      // Captured from the CLI's `result` event so we can forward
      // duration / cost / turn count to the client `done` frame.
      // `result` is emitted once per turn just before exit; if we never
      // see it (non-zero exit, SIGTERM), these stay null.
      let resultDurationMs: number | null = null;
      let resultTotalCostUsd: number | null = null;
      let resultNumTurns: number | null = null;
      let resultStopReason: string | null = null;
      let resultTokensIn: number | null = null;
      let resultTokensOut: number | null = null;
      let resultCacheRead: number | null = null;
      let resultCacheCreate: number | null = null;

      let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
      let lastWriteAt = Date.now();

      const writeRaw = (payload: string): void => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(payload));
          lastWriteAt = Date.now();
        } catch {
          /* controller already closed */
        }
      };

      const send = (event: string, data: unknown) => {
        writeRaw(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      // SSE comments (lines starting with `:`) are dropped by the EventSource
      // / fetch SSE parser but still travel the wire — perfect for keeping
      // a long-running connection from being idle-timed-out by WebKit or a
      // reverse proxy. Used both for the periodic heartbeat and to surface
      // CLI keepalives (`ping`, `api_retry`).
      const sendComment = (text: string): void => {
        // Strip CR/LF so callers can't accidentally inject a frame.
        const safe = text.replace(/[\r\n]+/g, " ");
        writeRaw(`: ${safe}\n\n`);
      };

      const close = () => {
        if (closed) return;
        closed = true;
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        try {
          controller.close();
        } catch {
          /* noop */
        }
        if (inFlight.get(key)?.child === child) inFlight.delete(key);
      };
      cleanup = close;

      if (heartbeatIntervalMs > 0) {
        heartbeatTimer = setInterval(() => {
          // Only emit if we've been quiet for ~the full interval. Bursty
          // streams (token-level deltas) don't need extra padding.
          if (Date.now() - lastWriteAt >= heartbeatIntervalMs - 100) {
            sendComment("hb");
          }
        }, heartbeatIntervalMs);
        // Don't pin the event loop on the heartbeat — if everything else
        // has shut down, the process should exit.
        if (typeof heartbeatTimer.unref === "function") heartbeatTimer.unref();
      }

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
        if (t === "system" && evt.subtype === "api_retry") {
          // CLI is retrying the API call (rate_limit, overloaded, etc.).
          // We don't have a UI for it yet, but forwarding as a comment
          // resets the client's idle timer and tells operators tailing
          // the network log that the agent is alive.
          const attempt = typeof evt.attempt === "number" ? evt.attempt : "?";
          const reason = typeof evt.error === "string" ? evt.error : "unknown";
          sendComment(`api_retry attempt=${attempt} reason=${reason}`);
          return;
        }
        if (t === "stream_event") {
          // Wrapper for raw API events when `--include-partial-messages`
          // is set. `assistant` snapshots already deliver the content we
          // care about; here we only sniff for `ping` keepalives so an
          // idle proxy doesn't time out the SSE response.
          const inner = (evt.event ?? {}) as Record<string, unknown>;
          if (typeof inner.type === "string" && inner.type === "ping") {
            sendComment("cli_ping");
          }
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
          const msgId = msg.id ?? "msg";
          for (let i = 0; i < msg.content.length; i++) {
            const block = msg.content[i];
            if (!block || typeof block !== "object") continue;
            const b = block as Record<string, unknown>;
            const key = `${msgId}:${i}`;
            if (b.type === "text" && typeof b.text === "string") {
              const text = b.text;
              let blockIdx = blockIndexByKey.get(key);
              if (blockIdx === undefined) {
                turnBlocks.push({ type: "text", text });
                blockIdx = turnBlocks.length - 1;
                blockIndexByKey.set(key, blockIdx);
              } else {
                const cur = turnBlocks[blockIdx];
                if (cur.type === "text") cur.text = text;
              }
              send("text", { blockId: `${msgId}_${blockIdx}`, text, append: false });
            } else if (b.type === "tool_use" && typeof b.id === "string" && typeof b.name === "string") {
              // First sighting of this tool_use position: push + emit.
              // Partial frames re-emit the same content position; ignore
              // those (tool_use isn't streamed in deltas, the input is
              // complete on first appearance).
              if (!blockIndexByKey.has(key)) {
                turnBlocks.push({ type: "tool_use", id: b.id, name: b.name, input: b.input });
                blockIndexByKey.set(key, turnBlocks.length - 1);
                send("tool_use", { toolUseId: b.id, name: b.name, input: b.input });
              }
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
          // Persist is deferred to child-close (so we have the assistant
          // message ready regardless of whether `result` arrived first
          // or got cut off). Capture the metadata here so we can forward
          // it into the `done` frame.
          const parsed = parseResultEvent(evt);
          if (parsed) {
            resultDurationMs = parsed.durationMs;
            resultTotalCostUsd = parsed.totalCostUsd;
            resultNumTurns = parsed.numTurns;
            resultStopReason = parsed.stopReason;
            resultTokensIn = parsed.tokensIn;
            resultTokensOut = parsed.tokensOut;
            resultCacheRead = parsed.cacheRead;
            resultCacheCreate = parsed.cacheCreate;
          }
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
        send("error", {
          message: `spawn error: ${err.message}`,
          exitCode: null,
          signal: null,
          stderrTail: cleanStderrTail(stderrBuf),
          promptFile,
        });
        close();
      });

      child.on("close", (code, signal) => {
        // Drain any trailing partial line — some claude versions don't
        // newline-terminate their final event.
        if (lineBuf.length > 0) {
          flushLine(lineBuf);
          lineBuf = "";
        }
        if (opts.db) {
          try {
            const finalState = code === 0 ? "completed" : cancelled ? "killed" : "failed";
            finalizeSession(opts.db.db, {
              id: sessionId,
              finishedAt: new Date().toISOString(),
              state: finalState,
              exitCode: typeof code === "number" ? code : null,
              metrics: {
                durationMs: resultDurationMs,
                tokensIn: resultTokensIn,
                tokensOut: resultTokensOut,
                cacheRead: resultCacheRead,
                cacheCreate: resultCacheCreate,
                costUsd: resultTotalCostUsd,
                costSource: resultTotalCostUsd !== null ? "provider" : null,
              },
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            process.stderr.write(`plan-chat: finalizeSession failed: ${msg}\n`);
          }
        }
        const fullText = turnBlocks
          .filter((b): b is { type: "text"; text: string } => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        // We persist on clean exit (code 0) with content even if the
        // client already disconnected (`cancelled === true`). This is the
        // recovery path for a transient SSE break: the browser's fetch
        // can die mid-stream (WebKit "Load failed"), but the spawned
        // claude often keeps running for a few hundred ms before our
        // SIGTERM lands — and any complete blocks it emitted are valuable
        // to save. Without this, the user re-opens the modal to find
        // only their question with no reply, even though the agent
        // finished.
        //
        // Crucially, we do NOT persist partial blocks when claude exits
        // non-zero or via signal: a re-send would otherwise inherit a
        // poisoned conversation with a half-baked assistant turn the
        // user never saw a `done` for. The UI keeps the partial blocks
        // visible alongside the structured error banner so the user can
        // still read what arrived.
        //
        // The `done` and `error` SSE frames are still gated on the
        // controller being live (`!cancelled`) because nothing's
        // listening on the other side when it's not.
        const haveContent = turnBlocks.length > 0 || fullText.length > 0;
        const cleanExit = code === 0 && haveContent;
        if (cleanExit) {
          const assistantMsg: ChatMessage = {
            id: newMessageId(),
            role: "assistant",
            text: fullText,
            ts: new Date().toISOString(),
            blocks: turnBlocks,
          };
          try {
            appendMessage(forgeDir, scope, assistantMsg);
            markConversationStarted(forgeDir, scope);
            const startedPointer = readConversationPointer(forgeDir, scope);
            if (startedPointer) copyNativeTranscriptSnapshot(forgeDir, scope, startedPointer, { configDir: opts.transcriptConfigDir });
            // Clean up the prompt file on success.
            try {
              fs.rmSync(promptFile, { force: true });
            } catch {
              /* noop */
            }
            if (!cancelled) {
              send("done", {
                messageId: assistantMsg.id,
                fullText,
                durationMs: resultDurationMs,
                totalCostUsd: resultTotalCostUsd,
                numTurns: resultNumTurns,
                stopReason: resultStopReason,
              });
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            // Best effort: only the live-stream path gets the error frame.
            if (!cancelled) {
              send("error", {
                message: `failed to persist assistant message: ${msg}`,
                exitCode: code,
                signal,
                stderrTail: cleanStderrTail(stderrBuf),
                promptFile,
              });
            }
          }
        } else if (!cancelled) {
          // Non-zero exit OR no content, and the client is still
          // listening — keep the prompt file for debug, surface the
          // structured payload so the UI can show what actually went
          // wrong (exit code / signal / stderr tail / prompt file path)
          // instead of a generic "network error".
          const tail = cleanStderrTail(stderrBuf);
          const message = signal
            ? `claude exited via signal ${signal}${tail ? `: ${firstLine(tail)}` : ""}`
            : code !== 0
              ? `claude exited with code ${code}${tail ? `: ${firstLine(tail)}` : ""}`
              : "claude produced no output before exiting cleanly";
          send("error", { message, exitCode: code, signal, stderrTail: tail, promptFile });
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
